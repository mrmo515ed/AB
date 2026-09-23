/**
 * PR2 Phase 7 — دقة تصنيف الاتصال:
 * لا يجوز أبداً تصنيف خطأ غير offline كـ CONNECTED.
 * كل فئة (AUTH/PERMISSION/SERVER/TIMEOUT/RATE/OFFLINE/UNKNOWN) تُصنَّف بدقة.
 */
import { describe, expect, it } from 'vitest';
import { classifyConnectivityError } from '../src/admin/metricsCollector';

const cases: Array<[string, unknown, string]> = [
  // [الاسم، الخطأ، التصنيف المتوقع]
  ['رمز Firestore: غير موثّق', { code: 'firestore/unauthenticated' }, 'AUTH_ERROR'],
  ['رمز Firestore: صلاحيات مرفوضة', { code: 'firestore/permission-denied' }, 'PERMISSION_DENIED'],
  ['رمز Firestore: نفاد الحصة', { code: 'firestore/resource-exhausted' }, 'RATE_LIMITED'],
  ['رمز Firestore: تجاوز المهلة', { code: 'firestore/deadline-exceeded' }, 'TIMEOUT'],
  ['رمز Firestore: الخدمة غير متاحة', { code: 'firestore/unavailable' }, 'SERVER_ERROR'],
  ['رمز Firestore: خطأ داخلي', { code: 'firestore/internal' }, 'SERVER_ERROR'],
  ['رسالة: العميل غير متصل', { code: 'firestore/failed-precondition', message: 'The client is offline since it is not connected to the network.' }, 'OFFLINE'],
  ['رسالة: فشل الجلب (متصفح)', { message: 'Failed to fetch' }, 'OFFLINE'],
  ['رسالة: انقطاع DNS', { message: 'getaddrinfo ENOTFOUND firestore.googleapis.com' }, 'OFFLINE'],
  ['رسالة: مهلة انقضت', { message: 'Request timed out after 30000ms' }, 'TIMEOUT'],
  ['رسالة: حد الطلبات', { message: 'Quota exceeded for the project' }, 'RATE_LIMITED'],
  ['رسالة: خطأ خادم 503', { message: 'Server error 503 Service Unavailable' }, 'SERVER_ERROR'],
  ['رسالة: مستخدم غير مسجل', { message: 'User is not signed in' }, 'AUTH_ERROR'],
  ['خطأ فارغ تماماً', null, 'UNKNOWN'],
  ['خطأ نصي غامض', { message: 'something odd happened' }, 'UNKNOWN']
];

describe('classifyConnectivityError — مصفوفة التصنيف الكاملة', () => {
  it.each(cases)('%s → %s', (_name, err, expected) => {
    expect(classifyConnectivityError(err)).toBe(expected);
  });

  it('لا يُصنَّف أي خطأ على أنه CONNECTED أبداً', () => {
    for (const [, err] of cases) {
      expect(classifyConnectivityError(err)).not.toBe('CONNECTED');
    }
  });

  it('التصنيف يبقى صارماً مع أخطاء غريبة البنية', () => {
    expect(classifyConnectivityError(undefined)).toBe('UNKNOWN');
    expect(classifyConnectivityError({ code: 42 })).toBe('UNKNOWN');
    expect(classifyConnectivityError(new Error('weird 🐛'))).toBe('UNKNOWN');
  });
});
