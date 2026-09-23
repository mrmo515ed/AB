import { getToken, onMessage, deleteToken } from 'firebase/messaging';
import { doc, setDoc, deleteDoc, getDocs, collection, query, where } from 'firebase/firestore';
import { getMessagingSafe, getDb, getAuth, firebaseConfig } from '../config/firebase';
import { observability } from '../services/observability';

/**
 * FCM — إدارة إشعارات الدفع الحقيقية (PR2 Phase 8)
 * ------------------------------------------------------------
 * - مفتاح VAPID من الإعدادات (firebase-applet-config.json) — إن كان فارغاً
 *   يُبلَّغ عنه بوضوح ولا تُترك قيم وهمية.
 * - تسجيل الجهاز في users/{uid}/devices/{token} (دعم تعدد الأجهزة) مع
 *   منصة/متصفح/آخر نشاط — وتنظيف الأجهزة الأقدم من 90 يوماً.
 * - onTokenRefresh: إعادة تسجيل تلقائية وحذف التوكن القديم.
 * - الإرسال الخلفي/المغلق عبر sw.js (push + notificationclick) — والدفع
 *   نفسه من الدوال السحابية (onChatMessageCreated/onGroupMessageCreated)
 *   مع tag/collapseKey لمنع التكرار.
 */

const STALE_DEVICE_MS = 90 * 24 * 3600 * 1000;
const LAST_TOKEN_KEY = 'animeblack_fcm_last_token';

export interface FCMRegistrationResult {
  ok: boolean;
  token: string | null;
  reason?: string;
}

export class FCMNotificationManager {
  /** مفتاح VAPID العام — من الإعدادات فقط، لا قيم مضروبة */
  private static get vapidKey(): string {
    const k = (firebaseConfig as Record<string, unknown>).vapidPublicKey;
    return typeof k === 'string' ? k.trim() : '';
  }

  /** هل إعداد الدفع مكتمل؟ يُستخدم للإبلاغ الصادق عما ينقص */
  public static isConfigured(): { configured: boolean; missing: string[] } {
    const missing: string[] = [];
    if (!this.vapidKey) missing.push('vapidPublicKey في firebase-applet-config.json (Web Push certificate من إعدادات Cloud Messaging)');
    if (typeof window !== 'undefined' && !('serviceWorker' in navigator)) missing.push('serviceWorker');
    if (typeof window !== 'undefined' && !('Notification' in window)) missing.push('Notification API');
    return { configured: missing.length === 0, missing };
  }

  /** طلب الإذن وتسجيل توكن الجهاز الحالي في مستند جهاز مخصص */
  public static async requestPermissionAndRegisterToken(): Promise<FCMRegistrationResult> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return { ok: false, token: null, reason: 'notifications-not-supported' };
    }
    const cfgCheck = this.isConfigured();
    if (!cfgCheck.configured && !this.vapidKey) {
      console.warn('[FCM] إعداد غير مكتمل — المفقود:', cfgCheck.missing.join('، '));
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        return { ok: false, token: null, reason: 'permission-' + permission };
      }

      const messaging = (await getMessagingSafe()) as any;
      if (!messaging) return { ok: false, token: null, reason: 'messaging-unavailable' };

      const swRegistration = await navigator.serviceWorker.ready;
      const getTokenOpts: Record<string, unknown> = { serviceWorkerRegistration: swRegistration };
      if (this.vapidKey) getTokenOpts.vapidKey = this.vapidKey;
      const currentToken = await getToken(messaging, getTokenOpts as never);

      if (!currentToken) {
        return { ok: false, token: null, reason: 'no-token' };
      }

      const user = (getAuth() as any).currentUser;
      if (!user?.uid) {
        return { ok: false, token: currentToken, reason: 'not-signed-in' };
      }

      await this.registerDeviceToken(user.uid, currentToken);
      return { ok: true, token: currentToken };
    } catch (error) {
      observability.captureError(error, { context: 'fcm_token_registration_failed' });
      return { ok: false, token: null, reason: (error as Error)?.message || 'registration-failed' };
    }
  }

  /** تسجيل/تحديث جهاز واحد + تنظيف أجهزة هذا المستخدم المتقادمة */
  public static async registerDeviceToken(uid: string, token: string): Promise<void> {
    const db = getDb() as any;
    const now = Date.now();
    await setDoc(doc(db, 'users', uid, 'devices', token), {
      platform: this.detectPlatform(),
      userAgent: (typeof navigator !== 'undefined' && navigator.userAgent || '').slice(0, 200),
      createdAt: now,
      lastActive: now
    }, { merge: true });

    // حذف التوكن السابق إن تغيّر (منع تراكم أجهزة وهمية لنفس المتصفح)
    try {
      const last = localStorage.getItem(LAST_TOKEN_KEY);
      if (last && last !== token) {
        await deleteDoc(doc(db, 'users', uid, 'devices', last)).catch(() => undefined);
      }
      localStorage.setItem(LAST_TOKEN_KEY, token);
    } catch (_) { /* localStorage قد يكون محظوراً */ }

    // تنظيف أفضل جهد للأجهزة الأقدم من 90 يوماً (التنظيف الشامل دوري على السيرفر)
    this.cleanupStaleDevices(uid).catch(() => undefined);
  }

  /** حذف توكنات الأجهزة المتقادمة لمستخدم */
  public static async cleanupStaleDevices(uid: string): Promise<number> {
    const db = getDb() as any;
    const cutoff = Date.now() - STALE_DEVICE_MS;
    const snap = await getDocs(query(
      collection(db, 'users', uid, 'devices'),
      where('lastActive', '<', cutoff)
    ));
    let n = 0;
    for (const d of snap.docs) {
      await deleteDoc(d.ref).catch(() => undefined);
      n++;
    }
    return n;
  }

  /** تحديث آخر نشاط للجهاز الحالي (يبقيه حياً في التنظيف الدوري) */
  public static async touchDeviceActivity(uid: string, token: string): Promise<void> {
    const db = getDb() as any;
    await setDoc(doc(db, 'users', uid, 'devices', token), { lastActive: Date.now() }, { merge: true }).catch(() => undefined);
  }

  /**
   * مراقبة تجدد التوكن — الواجهة المعيارية v10 بلا onTokenRefresh،
   * لذا نتحقق عند كل استئناف للتطبيق وكل 12 ساعة: إن تغيّر التوكن نُعيد التسجيل.
   */
  public static watchTokenRefresh(): (() => void) | null {
    if (typeof window === 'undefined') return null;
    let stopped = false;
    const check = async () => {
      if (stopped) return;
      try {
        const messaging = (await getMessagingSafe()) as any;
        if (!messaging) return;
        const last = localStorage.getItem(LAST_TOKEN_KEY);
        const swRegistration = await navigator.serviceWorker.ready;
        const opts: Record<string, unknown> = { serviceWorkerRegistration: swRegistration };
        if (this.vapidKey) opts.vapidKey = this.vapidKey;
        const current = await getToken(messaging, opts as never);
        if (current && current !== last) {
          const user = (getAuth() as any).currentUser;
          if (user?.uid) await this.registerDeviceToken(user.uid, current);
          console.log('[FCM] أُعيد تسجيل توكن الجهاز بعد تجدده');
        }
      } catch (e) {
        observability.captureError(e, { context: 'fcm_token_refresh_check' });
      }
    };
    const onResume = () => { void check(); };
    window.addEventListener('focus', onResume, { passive: true });
    const interval = setInterval(check, 12 * 3600 * 1000) as unknown as number;
    void check();
    return () => {
      stopped = true;
      window.removeEventListener('focus', onResume);
      clearInterval(interval);
    };
  }

  /** إبطال توكن محلي (خروج من الإشعارات) */
  public static async revokeCurrentToken(): Promise<boolean> {
    try {
      const messaging = (await getMessagingSafe()) as any;
      if (!messaging) return false;
      const ok = await deleteToken(messaging);
      if (ok) {
        try { localStorage.removeItem(LAST_TOKEN_KEY); } catch (_) { /* ignore */ }
      }
      return ok;
    } catch (e) {
      observability.captureError(e, { context: 'fcm_token_revoke' });
      return false;
    }
  }

  /** الإشعارات في المقدمة (والخلف/المغلق يعالجهما service worker) */
  public static async initForegroundListener(onNotification: (payload: any) => void): Promise<(() => void) | null> {
    try {
      const messaging = (await getMessagingSafe()) as any;
      if (!messaging) return null;
      const unsub = onMessage(messaging, (payload) => onNotification(payload));
      return unsub as () => void;
    } catch (e) {
      console.warn('[FCM] Foreground listener init skipped:', e);
      return null;
    }
  }

  private static detectPlatform(): string {
    if (typeof navigator === 'undefined') return 'unknown';
    const ua = navigator.userAgent;
    if (/android/i.test(ua)) return 'android';
    if (/iphone|ipad|ipod/i.test(ua)) return 'ios';
    if (/windows/i.test(ua)) return 'windows';
    if (/macintosh/i.test(ua)) return 'mac';
    if (/linux/i.test(ua)) return 'linux';
    return 'web';
  }
}
