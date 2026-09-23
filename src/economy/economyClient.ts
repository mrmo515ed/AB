/**
 * عميل الاقتصاد الموثوق (PR2 Phase 5) — طبقة معيارية فوق جسر Cloud Functions.
 * السلطة للسيرفر: كل عملية (adjust/transfer) تمر عبر دالة سحابية تتحقق
 * وتنفّذ داخل معاملة، مع مفتاح منع إعادة تشغيل. لا "اجعل رصيدي X" أبداً.
 *
 * الجسر (index.html) يعرّض window.__callCloudFunction — هذه الوحدة تغلفه
 * بأنواع وأخطاء واضحة للاستهلاك من حزمة dist (AnimeBlackCore.economy).
 */

export type EconomyCurrency = 'coins' | 'stars' | 'xp';

export interface EconomyAdjustInput {
  currency: EconomyCurrency;
  amount: number;
  reason?: string;
  idempotencyKey?: string;
}

export interface EconomyTransferInput {
  currency: EconomyCurrency;
  amount: number;
  toUid: string;
  note?: string;
  idempotencyKey?: string;
}

export interface EconomyResult {
  ok: boolean;
  balance?: number;
  senderBalance?: number;
  recipientBalance?: number;
  levels?: { xp: number; level: number; xpNext: number } | null;
  replayed?: boolean;
}

export type EconomyFailure =
  | 'bridge-unavailable'
  | 'unauthenticated'
  | 'not-deployed'
  | 'insufficient-funds'
  | 'invalid-request'
  | 'network'
  | 'unknown';

export class EconomyClient {
  private static call<T>(name: string, data: Record<string, unknown>): Promise<T> {
    const bridge = (globalThis as unknown as Record<string, unknown>).__callCloudFunction as
      | ((n: string, d: Record<string, unknown>) => Promise<{ data: T }>)
      | undefined;
    if (typeof bridge !== 'function') {
      return Promise.reject(Object.assign(new Error('economy bridge unavailable'), { economyFailure: 'bridge-unavailable' as EconomyFailure }));
    }
    return bridge(name, data).then((res) => res.data);
  }

  /** تعديل رصيد المُتصل (دلتا موقّعة) — يرفض الإنفاق فوق الرصيد */
  static adjust(input: EconomyAdjustInput): Promise<EconomyResult> {
    return this.call<EconomyResult>('economyAdjust', {
      op: 'adjust',
      currency: input.currency,
      amount: input.amount,
      reason: input.reason || '',
      idempotencyKey: input.idempotencyKey || undefined
    });
  }

  /** تحويل إلى مستخدم آخر — معاملة ذرّية على السيرفر */
  static transfer(input: EconomyTransferInput): Promise<EconomyResult> {
    return this.call<EconomyResult>('economyTransfer', {
      op: 'transfer',
      currency: input.currency,
      amount: input.amount,
      toUid: input.toUid,
      note: input.note || '',
      idempotencyKey: input.idempotencyKey || undefined
    });
  }

  /** تصنيف فشل الاقتصاد لرسالة صادقة للمستخدم */
  static classifyFailure(err: unknown): EconomyFailure {
    const e = (err || {}) as { economyFailure?: EconomyFailure; code?: string; message?: string };
    if (e.economyFailure) return e.economyFailure;
    const code = String(e.code || '');
    if (code.includes('unauthenticated')) return 'unauthenticated';
    if (code.includes('not-found') || code.includes('unavailable') || code.includes('functions')) return 'not-deployed';
    if (code.includes('failed-precondition') || String(e.message || '').includes('insufficient')) return 'insufficient-funds';
    if (code.includes('invalid-argument')) return 'invalid-request';
    if (code.includes('network') || code.includes('fetch')) return 'network';
    return 'unknown';
  }
}
