import { initializeApp, getApps } from 'firebase/app';
import { getAuth as getFirebaseAuthSdk, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, initializeFirestore } from 'firebase/firestore';
import { getStorage as getFirebaseStorageSdk } from 'firebase/storage';
import { getMessaging, isSupported as isMessagingSupported } from 'firebase/messaging';
import firebaseConfig from '../../firebase-applet-config.json';

export interface FirebaseRuntime {
  app: unknown;
  db: unknown;
  auth: unknown;
  storage: unknown;
  googleProvider: unknown;
}

/**
 * استراتيجية SDK واحدة وموحدة لكل التطبيق:
 *
 * 1) داخل متصفح التطبيق (index.html): طبقة src تعيد استخدام نفس مثيل Firebase
 *    الذي يهيئه جسر CDN (v10.10.0) عبر window.db / window.auth / window.storage —
 *    لا ننشئ تطبيق Firebase ثانياً أبداً (كان يحدث سابقاً عبر حزمة v12 المدمجة،
 *    ما يسبب مثيلَي مصادقة وقاعدتَي كاش مستقلتين وسباقات رموز).
 *
 * 2) خارج متصفح التطبيق (اختبارات/أدوات): إنشاء مثيل خاص عند أول استخدام فعلي فقط
 *    (lazy) — لا آثار جانبية عند مجرد تحميل الوحدة.
 */
let cachedRuntime: FirebaseRuntime | null = null;

function detectHostRuntime(): Partial<FirebaseRuntime> | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as Record<string, unknown>;
  if (w['db'] && w['auth']) {
    return {
      app: (w['__firebaseApp'] as unknown) ?? null,
      db: w['db'],
      auth: w['auth'],
      storage: w['storage'] ?? null,
      googleProvider: null
    };
  }
  return null;
}

function createStandaloneRuntime(): FirebaseRuntime {
  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  let db: unknown;
  const settings = {
    ignoreUndefinedProperties: true,
    experimentalAutoDetectLongPolling: true
  };
  try {
    db = firebaseConfig.firestoreDatabaseId
      ? initializeFirestore(app as never, settings, firebaseConfig.firestoreDatabaseId as never)
      : initializeFirestore(app as never, settings);
  } catch (err) {
    // fallback غير عودي: مثيل app بديل بدل إعادة المحاولة على مثيل فسدت حالته
    console.warn('[firebase] named database init failed, using default database on a fresh app:', err);
    try {
      const fallbackApp = initializeApp(firebaseConfig, 'animeblack-fallback-' + Date.now());
      db = initializeFirestore(fallbackApp as never, settings);
    } catch (_) {
      db = getFirestore(app as never);
    }
  }
  const auth = getFirebaseAuthSdk(app as never);
  const storage = getFirebaseStorageSdk(app as never);
  const googleProvider = new GoogleAuthProvider();
  googleProvider.setCustomParameters({ prompt: 'select_account' });
  return { app, db, auth, storage, googleProvider };
}

export function getFirebaseRuntime(): FirebaseRuntime {
  if (cachedRuntime) return cachedRuntime;
  const host = detectHostRuntime();
  cachedRuntime = (host as FirebaseRuntime) ?? createStandaloneRuntime();
  return cachedRuntime;
}

export function getDb(): unknown {
  return getFirebaseRuntime().db;
}

export function getAuth(): unknown {
  return getFirebaseRuntime().auth;
}

export function getStorage(): unknown {
  return getFirebaseRuntime().storage;
}

export function getApp(): unknown {
  return getFirebaseRuntime().app;
}

export function getGoogleProvider(): unknown {
  const rt = getFirebaseRuntime();
  if (rt.googleProvider) return rt.googleProvider;
  if (typeof window !== 'undefined') {
    const w = window as unknown as Record<string, unknown>;
    const ProviderCtor = w['GoogleAuthProvider'] as (new () => GoogleAuthProvider) | undefined;
    if (ProviderCtor) {
      const provider = new ProviderCtor();
      provider.setCustomParameters({ prompt: 'select_account' });
      rt.googleProvider = provider;
      return provider;
    }
  }
  return null;
}

/** Firebase Cloud Messaging (مشروط بدعم البيئة) */
export async function getMessagingSafe(): Promise<unknown> {
  try {
    const supported = await isMessagingSupported();
    if (supported && typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      return getMessaging(getFirebaseRuntime().app as never);
    }
  } catch (err) {
    console.warn('[FCM] Messaging not supported in this runtime environment:', err);
  }
  return null;
}

export { firebaseConfig };
