/**
 * PR2 — اختبارات تحقق ثابتة لقواعد Firestore/Storage المحصّنة + منطق الاقتصاد الموثوق.
 * التحقق بالاسمulator يتطلب Java/Emulator (محجوب في بيئة الفحص) — لذلك نتحقق
 * من البنية الحرجة للقواعد تحققاً ثابتاً صارماً، ونختبر منطق الاقتصاد خالصاً.
 */
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  validateEconomyRequest,
  applyDelta,
  computeLevel
} from '../functions/src/economyValidation';

const firestoreRules = readFileSync(new URL('../firestore.rules', import.meta.url), 'utf-8');
const storageRules = readFileSync(new URL('../storage.rules', import.meta.url), 'utf-8');
const bridge = readFileSync(new URL('../index.html', import.meta.url), 'utf-8');

describe('قواعد Firestore — التحصين (PR2 Phase 3/6)', () => {
  it('لا يملك أي قرين تعديل اقتصاد مستخدم آخر (عملات/نجوم/سمعة)', () => {
    const peerAllow = firestoreRules.match(
      /hasOnly\(\['followers'[^)]*\]\)/
    )?.[0];
    expect(peerAllow).toBeTruthy();
    expect(peerAllow!).not.toContain('coins');
    expect(peerAllow!).not.toContain('wallet');
    expect(peerAllow!).not.toContain('stars');
    expect(peerAllow!).not.toContain('reputation');
  });

  it('المالك لا يكتب الحقول الاقتصادية/الامتيازية المحمية', () => {
    const ownerGuard = firestoreRules.match(
      /!incoming\(\)\.diff\(existing\(\)\)\.affectedKeys\(\)\.hasAny\(\[[^\]]+\]\)/
    )?.[0];
    expect(ownerGuard).toBeTruthy();
    for (const f of ['coins', 'wallet', 'stars', 'xp', 'level', 'points', 'reputation', 'roles', 'premium']) {
      expect(ownerGuard!).toContain(f);
    }
  });

  it('إنشاء رسالة خاصة يتطلب هوية المرسل + عضوية المحادثة', () => {
    const createRule = firestoreRules.match(
      /match \/messages\/\{messageId\} \{[\s\S]*?allow create:[\s\S]*?\n\s*allow update/m
    )?.[0];
    expect(createRule).toBeTruthy();
    expect(createRule!).toContain('isChatParticipant(parentChat())');
    expect(createRule!).toContain('senderId == request.auth.uid');
  });

  it('القروبات الخاصة: القراءة/الكتابة بالعضوية الحقيقية memberUids', () => {
    expect(firestoreRules).toContain("request.auth.uid in groupDoc().get('memberUids', [])");
    expect(firestoreRules).toContain("memberOfParent() || !parentHasMemberUids()");
  });

  it('المكالمات: المشاركون الفعليون فقط (قراءة/إنشاء/تحديث/إشارات)', () => {
    expect(firestoreRules).toContain('request.auth.uid in resource.data.get(\'participants\', [])');
    expect(firestoreRules).toContain('request.auth.uid in incoming().participants');
    expect(firestoreRules).toContain('participantOfParent()');
  });

  it('سجلات الاقتصام ومفاتيح منع الإعادة: كتابة السيرفر فقط', () => {
    expect(firestoreRules).toContain("match /economy_transactions/{txId}");
    expect(firestoreRules).toContain("match /economy_idempotency/{keyId}");
    const economyWrites = firestoreRules.match(/economy_transactions[\s\S]{0,400}?allow write: if false;/);
    expect(economyWrites).toBeTruthy();
  });

  it('الافتراضي رفض كل شيء (default deny)', () => {
    expect(firestoreRules).toContain('match /{document=**} {\n      allow read, write: if false;\n    }');
  });
});

describe('قواعد Storage — التحصين (PR2 Phase 4)', () => {
  it('الأصول العامة: رفع موثوق فقط (لا أي موقع)', () => {
    const assets = storageRules.match(/match \/assets\/\{allPaths=\*\*\} \{[\s\S]*?\n    \}/)?.[0];
    expect(assets).toBeTruthy();
    expect(assets!).toContain('isTrustedUploader()');
    expect(assets!).not.toMatch(/allow write: if isSignedIn\(\)/);
  });

  it('وسائط المحادثات/القروبات: الرفع من مسار المالك + قيود حجم/نوع', () => {
    expect(storageRules).toContain('match /chats/{chatId}/{userId}/{fileName}');
    expect(storageRules).toContain('isOwner(userId) && isSafeName() && isMedia() && fitsChatMedia()');
    expect(storageRules).toContain('match /groups/{groupId}/{userId}/{fileName}');
  });

  it('وسائط المجتمعات والمحادثات: القراءة مقيدة للمالك أو الأدمن (Signed URLs للبقية)', () => {
    const comm = storageRules.match(/match \/communities\/\{communityId\}\/\{userId\}\/\{fileName\} \{[\s\S]*?\n    \}/)?.[0];
    expect(comm).toBeTruthy();
    expect(comm!).toContain('allow read: if isOwner(userId) || isTrustedUploader()');
    expect(comm!).not.toContain('allow read: if true');
  });

  it('قيود MIME حقيقية وأنواع مسموعة فقط + منع اجتياز المسار', () => {
    expect(storageRules).toContain("matches('image/(jpeg|png|webp|gif|avif)')");
    expect(storageRules).toContain("request.resource.name.contains('..')");
    expect(storageRules).toContain('request.resource.size > 0');
  });

  it('الافتراضي رفض كل شيء', () => {
    expect(storageRules).toContain('match /{allPaths=**} {\n      allow read: if false;\n      allow write: if false;\n    }');
  });
});

describe('الجسر — لا كتابة عميل مباشرة للاقتصاد (PR2 Phase 5)', () => {
  it('addCoins/addStars/addXP لا تستخدم setDoc مباشرة على users', () => {
    const addCoinsBlock = bridge.match(/function addCoins\(n,reason\)\{[\s\S]*?\nfunction addStars/)?.[0] || '';
    const addStarsBlock = bridge.match(/function addStars\(n,reason\)\{[\s\S]*?\nfunction addXP/)?.[0] || '';
    const addXPBlock = bridge.match(/function addXP\(n,reason\)\{[\s\S]*?\nwindow\.awardXP/)?.[0] || '';
    for (const block of [addCoinsBlock, addStarsBlock, addXPBlock]) {
      expect(block).toBeTruthy();
      expect(block).not.toContain('window.setDoc(window.doc(window.db,"users"');
      expect(block).not.toContain('window.setDoc(window.doc(window.db, "users"');
    }
    expect(addCoinsBlock).toContain('economyServerCall');
    expect(addStarsBlock).toContain('economyServerCall');
    expect(addXPBlock).toContain('economyServerCall');
  });

  it('تحويل العملات: مسار سحابي موثوق أو فشل صادق — لا كتابة أقران', () => {
    const transferBlock = bridge.match(/window\.transferCoinsToUser = function[\s\S]*?\n\};/)?.[0] || '';
    expect(transferBlock).toBeTruthy();
    expect(transferBlock).toContain('economyTransfer');
    expect(transferBlock).not.toMatch(/setDoc\(window\.doc\(window\.db, "users", targetUser\.id\)/);
  });

  it('syncUserStateToServer لا يرسل الحقول المحمية', () => {
    const payload = bridge.match(/const userProfilePayload = \{[\s\S]*?\};/)?.[0] || '';
    expect(payload).toBeTruthy();
    for (const f of ['coins:', 'stars:', 'reputation:', 'level:', 'xp:', 'points:', 'role:']) {
      expect(payload).not.toContain(f);
    }
  });
});

describe('منطق الاقتصاد الموثوق — تحقق خالص (functions/src/economyValidation)', () => {
  it('رفض: بلا مصادقة / عملية غير معروفة / عملة غير معروفة', () => {
    expect(validateEconomyRequest({ op: 'adjust', currency: 'coins', amount: -5 }, null).ok).toBe(false);
    expect(validateEconomyRequest({ op: 'hack', currency: 'coins', amount: -5 }, 'u1').ok).toBe(false);
    expect(validateEconomyRequest({ op: 'adjust', currency: 'gems', amount: -5 }, 'u1').ok).toBe(false);
  });

  it('حماية الاقتصاد: العميل العادي مسموح له بالإنفاق فقط (دلتا سالبة) وترفض أي إضافة ذاتية', () => {
    // محاولة عميل عادي إضافة 100000 عملة لنفسه
    const hackAttempt = validateEconomyRequest({ op: 'adjust', currency: 'coins', amount: 100000 }, 'u1', false);
    expect(hackAttempt.ok).toBe(false);
    expect(hackAttempt.error).toBe('client-spend-only-positive-adjustment-forbidden');

    // إنفاق سليم من العميل
    const validSpend = validateEconomyRequest({ op: 'adjust', currency: 'coins', amount: -50, reason: 'شراء ملصق' }, 'u1', false);
    expect(validSpend.ok).toBe(true);
    expect(validSpend.value!.amount).toBe(-50);

    // الأدمن مسموح له بالضبط الموجب
    const adminGrant = validateEconomyRequest({ op: 'adjust', currency: 'coins', amount: 500, reason: 'مكافأة إدارية' }, 'admin_uid', true);
    expect(adminGrant.ok).toBe(true);
    expect(adminGrant.value!.amount).toBe(500);
  });

  it('رفض: مبالغ غير صحيحة أو صفرية أو هائلة', () => {
    expect(validateEconomyRequest({ op: 'adjust', currency: 'coins', amount: 0 }, 'u1').ok).toBe(false);
    expect(validateEconomyRequest({ op: 'adjust', currency: 'coins', amount: -5.5 }, 'u1').ok).toBe(false);
    expect(validateEconomyRequest({ op: 'adjust', currency: 'coins', amount: -100001 }, 'u1').ok).toBe(false);
  });

  it('تحويل: موجب فقط + مستلم إلزامي + لا تحويل ذاتي', () => {
    expect(validateEconomyRequest({ op: 'transfer', currency: 'coins', amount: -5, toUid: 'u2' }, 'u1').ok).toBe(false);
    expect(validateEconomyRequest({ op: 'transfer', currency: 'coins', amount: 5 }, 'u1').ok).toBe(false);
    expect(validateEconomyRequest({ op: 'transfer', currency: 'coins', amount: 5, toUid: 'u1' }, 'u1').ok).toBe(false);
    expect(validateEconomyRequest({ op: 'transfer', currency: 'coins', amount: 5, toUid: 'u2' }, 'u1').ok).toBe(true);
  });

  it('طلب سليم يمرّ مع مفاتيح منع التكرار (Idempotency Key)', () => {
    const v = validateEconomyRequest(
      { op: 'adjust', currency: 'coins', amount: -15, reason: 'شراء', idempotencyKey: 'spend-abc_123' },
      'u1',
      false
    );
    expect(v.ok).toBe(true);
    expect(v.value!.amount).toBe(-15);
    expect(v.value!.idempotencyKey).toBe('spend-abc_123');
    expect(validateEconomyRequest({ op: 'adjust', currency: 'coins', amount: -5, idempotencyKey: 'a b' }, 'u1').ok).toBe(false);
  });

  it('applyDelta: يرفض السالب ويحتسب الصحيح', () => {
    expect(applyDelta(100, -30)).toBe(70);
    expect(applyDelta(10, -20)).toBe('insufficient-funds');
    expect(applyDelta(undefined as never, 5)).toBe(5);
  });

  it('computeLevel: نفس معادلة التطبيق على السيرفر', () => {
    expect(computeLevel(0, 1, 100)).toEqual({ xp: 0, level: 1, xpNext: 100 });
    // 150 خبرة من المستوى 1 → مستوى 2 وبقي 50 (نفس 1.25×)
    const r = computeLevel(150, 1, 100);
    expect(r.level).toBe(2);
    expect(r.xp).toBe(50);
    expect(r.xpNext).toBe(125);
  });
});
