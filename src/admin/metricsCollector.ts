import { doc, getDocFromServer } from 'firebase/firestore';
import { getDb } from '../config/firebase';
import { observability } from '../services/observability';

/**
 * تصنيف حالة الاتصال بالواجهة الخلفية — قيم حقيقية فقط، لا تلفيق.
 * PR2 Phase 7: كان أي خطأ غير offline يُصنَّف CONNECTED (مضلل) —
 * الآن كل فئة خطأ لها تصنيفها الدقيق من رمز Firebase أو رسالة الشبكة.
 */
export type ConnectivityStatus =
  | 'CONNECTED'
  | 'LATENCY_WARNING'
  | 'OFFLINE'
  | 'AUTH_ERROR'
  | 'PERMISSION_DENIED'
  | 'SERVER_ERROR'
  | 'TIMEOUT'
  | 'RATE_LIMITED'
  | 'UNKNOWN';

/** ترجمة رمز/رسالة خطأ إلى تصنيف اتصال دقيق (دالة نقية — قابلة للاختبار) */
export function classifyConnectivityError(err: unknown): ConnectivityStatus {
  const e = (err || {}) as { code?: string; message?: string };
  const code = String(e.code || '').replace(/^firestore\//, '').replace(/^auth\//, '');
  const msg = String(e.message || '');

  // 1) رموز Firebase الصريحة أولاً — أدق مصدر
  if (code === 'unauthenticated' || code === 'requires-recent-login') return 'AUTH_ERROR';
  if (code === 'permission-denied') return 'PERMISSION_DENIED';
  if (code === 'resource-exhausted') return 'RATE_LIMITED';
  if (code === 'deadline-exceeded' || code === 'timeout') return 'TIMEOUT';
  if (code === 'unavailable' || code === 'internal' || code === 'aborted') return 'SERVER_ERROR';

  // 2) المؤشرات النصية (أخطاء شبكة المتصفح بلا رمز)
  const offlineMsg = /client is offline|network.*(?:failed|error)|failed to fetch|network-error|err_(?:internet|network|name_not_resolved)|ENOTFOUND|ECONNREFUSED|ECONNRESET/i;
  const authMsg = /unauthenticated|user.*not.*signed|invalid.*token|credential/i;
  const permMsg = /permission|not authorized|insufficient permissions/i;
  const timeoutMsg = /timeout|timed out|deadline exceeded/i;
  const rateMsg = /resource exhausted|quota|rate limit|too many requests/i;
  const serverMsg = /unavailable|internal error|server error|502|503|504/i;

  if (offlineMsg.test(msg) || code === 'unavailable' && /offline/i.test(msg)) {
    // المتصفح نفسه يقول إن الشبكة مقطوعة → OFFLINE مؤكد
    if (typeof navigator !== 'undefined' && navigator.onLine === false) return 'OFFLINE';
    return 'OFFLINE';
  }
  if (authMsg.test(msg)) return 'AUTH_ERROR';
  if (permMsg.test(msg)) return 'PERMISSION_DENIED';
  if (timeoutMsg.test(msg)) return 'TIMEOUT';
  if (rateMsg.test(msg)) return 'RATE_LIMITED';
  if (serverMsg.test(msg)) return 'SERVER_ERROR';

  // 3) غير معروف — يُصرَّح به كذلك، ولا يُفبرك "متصل"
  return 'UNKNOWN';
}

export interface PerformanceMetrics {
  pingLatencyMs: number;
  firestoreConnection: ConnectivityStatus;
  timestamp: number;
  memoryUsageMB?: number;
  /** رمز الخطأ الأصلي إن وُجد — للتشخيص، ليس للتخمين */
  errorCode?: string | null;
}

export class MetricsCollector {
  /**
   * قياس حقيقي: جولة كاملة إلى Firestore عبر getDocFromServer.
   * التصنيف يُشتق من النتيجة الفعلية — أي خطأ يظهر بتصنيفه الحقيقي.
   */
  public static async measureLiveMetrics(): Promise<PerformanceMetrics> {
    const startTime = performance.now();
    let status: ConnectivityStatus = 'UNKNOWN';
    let errorCode: string | null = null;

    try {
      const testDocRef = doc(getDb() as any, 'test', 'connection');
      await getDocFromServer(testDocRef);
      const elapsed = Math.round(performance.now() - startTime);
      observability.recordLatency(elapsed);

      status = elapsed > 600 ? 'LATENCY_WARNING' : 'CONNECTED';

      return {
        pingLatencyMs: elapsed,
        firestoreConnection: status,
        timestamp: Date.now(),
        errorCode: null
      };
    } catch (err: any) {
      const elapsed = Math.round(performance.now() - startTime);
      status = classifyConnectivityError(err);
      errorCode = (err && err.code) || null;

      // تسجيل الكمون فقط إذا كان الخطأ يثبت وصولاً فعلياً للسيرفر
      // (رفض صلاحيات مثلاً = السيرفر استقبل الطلب وردّ — جولة حقيقية)
      if (status === 'PERMISSION_DENIED' || status === 'AUTH_ERROR' || status === 'RATE_LIMITED') {
        observability.recordLatency(elapsed);
      }

      return {
        pingLatencyMs: elapsed,
        firestoreConnection: status,
        timestamp: Date.now(),
        errorCode
      };
    }
  }
}
