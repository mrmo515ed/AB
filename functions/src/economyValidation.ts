/**
 * تحقق خالص (بلا اعتماديات) من طلبات الاقتصاد — يُستورد في vitest مباشرة.
 * السلطة للسيرفر: العميل لا يرسل أبداً "اجعل رصيدي X" — فقط عملية مع مبلغ
 * موقّع ومعرّف منع إعادة تشغيل، والسيرفر يحسب الدلتا داخل معاملة.
 */

export type EconomyCurrency = 'coins' | 'stars' | 'xp';
export type EconomyOp = 'adjust' | 'transfer';

export interface NormalizedEconomyRequest {
  op: EconomyOp;
  currency: EconomyCurrency;
  amount: number;
  reason: string;
  toUid: string | null;
  note: string;
  idempotencyKey: string | null;
}

export interface EconomyValidationResult {
  ok: boolean;
  error?: string;
  value?: NormalizedEconomyRequest;
}

export const MAX_ABS_AMOUNT = 100000;
export const CURRENCIES: EconomyCurrency[] = ['coins', 'stars', 'xp'];
export const OPS: EconomyOp[] = ['adjust', 'transfer'];

const IDEMPOTENCY_RE = /^[A-Za-z0-9_\-]{1,120}$/;

export function validateEconomyRequest(
  input: unknown,
  authUid: string | null | undefined,
  isAdmin: boolean = false
): EconomyValidationResult {
  if (!authUid) return { ok: false, error: 'unauthenticated' };
  if (!input || typeof input !== 'object') return { ok: false, error: 'invalid-argument' };
  const r = input as Record<string, unknown>;

  const op = String(r.op || '');
  if (!(OPS as string[]).includes(op)) return { ok: false, error: 'invalid-op' };

  const currency = String(r.currency || '');
  if (!(CURRENCIES as string[]).includes(currency)) return { ok: false, error: 'invalid-currency' };

  const amount = Number(r.amount);
  if (!Number.isInteger(amount) || amount === 0) return { ok: false, error: 'invalid-amount' };
  if (Math.abs(amount) > MAX_ABS_AMOUNT) return { ok: false, error: 'amount-too-large' };

  // حماية الاقتصاد: العميل العادي مسموح له بالإنفاق فقط (دلتا سالبة)
  // أي إضافة رصيد موجبة للمستخدم تتطلب سلطة إدارية أو سيرفر حصري
  if (op === 'adjust') {
    if (amount > 0 && !isAdmin) {
      return { ok: false, error: 'client-spend-only-positive-adjustment-forbidden' };
    }
  }

  if (op === 'transfer') {
    if (amount <= 0) return { ok: false, error: 'transfer-must-be-positive' };
    const toUid = String(r.toUid || '');
    if (!toUid || toUid.length > 128) return { ok: false, error: 'missing-toUid' };
    if (toUid === authUid) return { ok: false, error: 'self-transfer' };
  }

  const reason = typeof r.reason === 'string' ? r.reason.slice(0, 200) : '';
  const note = typeof r.note === 'string' ? r.note.slice(0, 200) : '';

  let idempotencyKey: string | null = null;
  if (r.idempotencyKey != null) {
    const k = String(r.idempotencyKey);
    if (!IDEMPOTENCY_RE.test(k)) return { ok: false, error: 'invalid-idempotency-key' };
    idempotencyKey = k;
  }

  return {
    ok: true,
    value: {
      op: op as EconomyOp,
      currency: currency as EconomyCurrency,
      amount,
      reason,
      toUid: op === 'transfer' ? String(r.toUid) : null,
      note,
      idempotencyKey
    }
  };
}

/** تطبيق دلتا على رصيد — يرفض السالب (لا إنفاق بلا رصيد) */
export function applyDelta(balance: number, amount: number): number | 'insufficient-funds' {
  const current = Number.isFinite(balance) ? balance : 0;
  const next = current + amount;
  if (next < 0) return 'insufficient-funds';
  return next;
}

/** حساب المستوى بنفس معادلة التطبيق — السيرفر هو مصدر الحقيقة للمستوى */
export function computeLevel(xp: number, level: number, xpNext: number): { xp: number; level: number; xpNext: number } {
  let l = Number.isFinite(level) && level > 0 ? Math.floor(level) : 1;
  let x = Number.isFinite(xp) ? Math.floor(xp) : 0;
  let next = Number.isFinite(xpNext) && xpNext > 0 ? Math.floor(xpNext) : 100;
  let guard = 0;
  while (x >= next && guard < 1000) {
    x -= next;
    l += 1;
    next = Math.round(next * 1.25);
    guard++;
  }
  if (x < 0) x = 0;
  return { xp: x, level: l, xpNext: next };
}
