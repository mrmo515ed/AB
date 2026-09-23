/**
 * Anime Black — Trusted Backend (Cloud Functions v2)
 * ------------------------------------------------------------
 * PR2: نقل سلطة الاقتصاد إلى السيرفر + دفع FCM حقيقي + تنظيف الجلسات
 * + روابط وسائط موقّعة بتحقق عضوية.
 *
 * ملاحظات النشر (راجع تقرير PR2):
 *  - قاعدة البيانات المسماة ai-studio-… هي نفسها التي يستخدمها التطبيق.
 *  - النشر: `cd functions && npm install && npm run deploy`
 *  - متغير البيئة الاختياري FIRESTORE_DB_ID لتغيير القاعدة.
 */
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { getMessaging } from 'firebase-admin/messaging';
import { getStorage } from 'firebase-admin/storage';
import * as logger from 'firebase-functions/logger';
import {
  validateEconomyRequest,
  applyDelta,
  computeLevel
} from './economyValidation';

const DB_ID = process.env.FIRESTORE_DB_ID || 'ai-studio-51245802-6d4e-4feb-bd11-43162af66618';
const ADMIN_EMAILS = ['m774545471@gmail.com'];

const adminApp = initializeApp();
const db = getFirestore(adminApp, DB_ID);

/* ============================================================ */
/* أدوات مساعدة                                                  */
/* ============================================================ */

function isAdminAuth(auth: { uid?: string; token?: Record<string, unknown> } | undefined): boolean {
  if (!auth || !auth.uid) return false;
  const token = auth.token || {};
  const email = typeof token.email === 'string' ? token.email.toLowerCase() : '';
  if (ADMIN_EMAILS.includes(email)) return true;
  if (token.admin === true) return true;
  return false;
}

/** جلب توكنات أجهزة المستخدم من users/{uid}/devices/* */
async function getUserDeviceTokens(uid: string): Promise<string[]> {
  const snap = await db.collection(`users/${uid}/devices`).get();
  const tokens: string[] = [];
  snap.forEach((d) => {
    const t = String(d.id || '');
    if (t.length > 20) tokens.push(t);
  });
  return tokens;
}

/** دفع FCM حقيقي متعدد الأجهزة مع منع تكرار (tag/collapseKey) */
async function pushToUser(
  uid: string,
  payload: { title: string; body: string; tag: string; url: string; icon?: string }
): Promise<void> {
  const tokens = await getUserDeviceTokens(uid);
  if (!tokens.length) return;
  const message = {
    tokens,
    notification: { title: payload.title, body: payload.body },
    data: { url: payload.url, tag: payload.tag },
    android: { collapseKey: payload.tag, priority: 'high' as const },
    apns: { headers: { 'apns-collapse-id': payload.tag }, payload: { aps: { sound: 'default' } } },
    webpush: {
      notification: { tag: payload.tag, icon: payload.icon || '/pwa-192x192.png', renotify: false }
    }
  };
  const res = await getMessaging().sendEachForMulticast(message);
  const dead: string[] = [];
  res.responses.forEach((r, i) => {
    if (!r.success && /messaging-registration-token-not-registered|invalid-registration-token/i.test(String(r.error))) {
      dead.push(tokens[i]);
    }
  });
  // تنظيف التوكنات الميتة فوراً
  await Promise.all(
    dead.map((t) => db.doc(`users/${uid}/devices/${t}`).delete().catch(() => undefined))
  );
  if (dead.length) logger.info('cleaned dead FCM tokens', { uid, count: dead.length });
}

/* ============================================================ */
/* 1) الاقتصاد — سلطة السيرفر فقط                                */
/* ============================================================ */

/** تعديل رصيد المُتصل نفسه (إنفاق العميل دلتا سالبة فقط / الإضافة للأدمن فقط) داخل معاملة ذرّية */
export const economyAdjust = onCall(async (request) => {
  const auth = request.auth;
  const isAdmin = isAdminAuth(auth);
  const v = validateEconomyRequest(request.data, auth?.uid, isAdmin);
  if (!v.ok) throw new HttpsError('invalid-argument', v.error || 'invalid-request');
  const req = v.value!;

  const result = await db.runTransaction(async (tx) => {
    // 1. فحص ذرّي لمنع التكرار (Idempotency) داخل نفس المعاملة لمنع أي سباق تزامني
    if (req.idempotencyKey) {
      const idemRef = db.doc(`economy_idempotency/${auth!.uid}:${req.idempotencyKey}`);
      const existing = await tx.get(idemRef);
      if (existing.exists) {
        const cached = existing.data();
        return (cached?.result as Record<string, unknown>) || { ok: true, replayed: true };
      }
    }

    const userRef = db.doc(`users/${auth!.uid}`);
    const snap = await tx.get(userRef);
    const data = snap.data() || {};
    const current = Number(data[req.currency] || 0);
    const next = applyDelta(current, req.amount);
    if (next === 'insufficient-funds') {
      throw new HttpsError('failed-precondition', 'insufficient-funds');
    }
    const update: Record<string, unknown> = {
      [req.currency]: next,
      updatedAt: Timestamp.now()
    };
    let levels: { xp: number; level: number; xpNext: number } | undefined;
    if (req.currency === 'xp') {
      levels = computeLevel(next, Number(data.level || 1), Number(data.xpNext || 100));
      update.xp = levels.xp;
      update.level = levels.level;
      update.xpNext = levels.xpNext;
    }
    tx.set(userRef, update, { merge: true });

    const txId = db.collection('economy_transactions').doc().id;
    tx.set(db.doc(`economy_transactions/${txId}`), {
      uid: auth!.uid,
      type: 'adjust',
      currency: req.currency,
      amount: req.amount,
      balanceAfter: next,
      reason: req.reason,
      at: Timestamp.now(),
      idempotencyKey: req.idempotencyKey
    });

    const txResult = { ok: true, currency: req.currency, balance: next, levels: levels || null };

    // 2. تسجيل مفتاح الـ Idempotency ذرّياً في نفس المعاملة
    if (req.idempotencyKey) {
      const idemRef = db.doc(`economy_idempotency/${auth!.uid}:${req.idempotencyKey}`);
      tx.set(idemRef, {
        result: txResult,
        uid: auth!.uid,
        at: Timestamp.now()
      });
    }

    return txResult;
  });

  return result;
});

/** تحويل بين مستخدمَين — معاملة ذرّية واحدة تخصم وتضيف مع فحص تكرار ذرّي */
export const economyTransfer = onCall(async (request) => {
  const auth = request.auth;
  const isAdmin = isAdminAuth(auth);
  const v = validateEconomyRequest(request.data, auth?.uid, isAdmin);
  if (!v.ok) throw new HttpsError('invalid-argument', v.error || 'invalid-request');
  const req = v.value!;

  const result = await db.runTransaction(async (tx) => {
    // فحص الـ Idempotency ذرّياً داخل المعاملة
    if (req.idempotencyKey) {
      const idemRef = db.doc(`economy_idempotency/${auth!.uid}:${req.idempotencyKey}`);
      const existing = await tx.get(idemRef);
      if (existing.exists) {
        const cached = existing.data();
        return (cached?.result as Record<string, unknown>) || { ok: true, replayed: true };
      }
    }

    const fromRef = db.doc(`users/${auth!.uid}`);
    const toRef = db.doc(`users/${req.toUid!}`);
    const [fromSnap, toSnap] = await Promise.all([tx.get(fromRef), tx.get(toRef)]);
    if (!toSnap.exists) throw new HttpsError('not-found', 'recipient-not-found');
    const fromData = fromSnap.data() || {};
    const toData = toSnap.data() || {};
    const fromBal = applyDelta(Number(fromData[req.currency] || 0), -req.amount);
    if (fromBal === 'insufficient-funds') throw new HttpsError('failed-precondition', 'insufficient-funds');
    const toBal = Number(toData[req.currency] || 0) + req.amount;

    const fromUpdate: Record<string, unknown> = { [req.currency]: fromBal, updatedAt: Timestamp.now() };
    const toUpdate: Record<string, unknown> = { [req.currency]: toBal, updatedAt: Timestamp.now() };
    if (req.currency === 'coins' && typeof fromData.wallet === 'number') fromUpdate.wallet = fromBal;
    if (req.currency === 'coins' && typeof toData.wallet === 'number') toUpdate.wallet = toBal;

    tx.set(fromRef, fromUpdate, { merge: true });
    tx.set(toRef, toUpdate, { merge: true });

    const txId = db.collection('economy_transactions').doc().id;
    tx.set(db.doc(`economy_transactions/${txId}`), {
      fromUid: auth!.uid,
      toUid: req.toUid,
      type: 'transfer',
      currency: req.currency,
      amount: req.amount,
      senderBalanceAfter: fromBal,
      recipientBalanceAfter: toBal,
      note: req.note,
      at: Timestamp.now(),
      idempotencyKey: req.idempotencyKey
    });

    const txResult = { ok: true, senderBalance: fromBal, recipientBalance: toBal };

    if (req.idempotencyKey) {
      const idemRef = db.doc(`economy_idempotency/${auth!.uid}:${req.idempotencyKey}`);
      tx.set(idemRef, {
        result: txResult,
        uid: auth!.uid,
        at: Timestamp.now()
      });
    }

    return txResult;
  });

  return result;
});

/** المطالبة بالمكافأة اليومية بسلطة السيرفر الحصرية — السيرفر يتحقق من مرور 24 ساعة ويمنح المكافأة */
export const claimDailyReward = onCall(async (request) => {
  const auth = request.auth;
  if (!auth?.uid) throw new HttpsError('unauthenticated', 'sign-in-required');

  const result = await db.runTransaction(async (tx) => {
    const userRef = db.doc(`users/${auth.uid}`);
    const snap = await tx.get(userRef);
    if (!snap.exists) throw new HttpsError('not-found', 'user-not-found');
    const data = snap.data() || {};

    const lastClaimMillis = data.lastDailyClaim instanceof Timestamp
      ? data.lastDailyClaim.toMillis()
      : (typeof data.lastDailyClaim === 'number' ? data.lastDailyClaim : 0);

    const nowMillis = Date.now();
    const cooldownMillis = 20 * 60 * 60 * 1000; // 20 ساعة كحد أدنى لليوم الجديد
    const resetStreakMillis = 48 * 60 * 60 * 1000; // يومان يعيدان التتابع إلى 1

    if (lastClaimMillis && (nowMillis - lastClaimMillis) < cooldownMillis) {
      throw new HttpsError('failed-precondition', 'daily-reward-already-claimed');
    }

    let currentStreak = Number(data.dailyStreak || 1);
    if (lastClaimMillis && (nowMillis - lastClaimMillis) > resetStreakMillis) {
      currentStreak = 1;
    } else if (lastClaimMillis > 0) {
      currentStreak = Math.min(30, currentStreak + 1);
    }

    // حساب المكافأة على السيرفر
    const rewardCoins = 100 + (currentStreak * 25);
    const rewardGems = currentStreak % 7 === 0 ? 10 : 2;
    const currentCoins = Number(data.coins || 0);
    const currentGems = Number(data.gems || 0);
    const newCoins = currentCoins + rewardCoins;
    const newGems = currentGems + rewardGems;

    tx.set(userRef, {
      coins: newCoins,
      gems: newGems,
      dailyStreak: currentStreak,
      lastDailyClaim: Timestamp.now(),
      updatedAt: Timestamp.now()
    }, { merge: true });

    const txId = db.collection('economy_transactions').doc().id;
    tx.set(db.doc(`economy_transactions/${txId}`), {
      uid: auth.uid,
      type: 'daily_reward',
      coinsGained: rewardCoins,
      gemsGained: rewardGems,
      streak: currentStreak,
      balanceAfterCoins: newCoins,
      balanceAfterGems: newGems,
      at: Timestamp.now()
    });

    return {
      ok: true,
      coins: newCoins,
      gems: newGems,
      rewardCoins,
      rewardGems,
      streak: currentStreak
    };
  });

  return result;
});

/** منح مكافأة (أدمن فقط) — للمهام والمسابقات المستقبلية بسلطة السيرفر */
export const grantReward = onCall(async (request) => {
  if (!isAdminAuth(request.auth)) throw new HttpsError('permission-denied', 'admin-only');
  const r = request.data || {};
  const toUid = String(r.toUid || '');
  const currency = String(r.currency || 'coins');
  const amount = Number(r.amount);
  if (!toUid || !['coins', 'stars', 'xp'].includes(currency) || !Number.isInteger(amount) || amount <= 0) {
    throw new HttpsError('invalid-argument', 'invalid-reward');
  }
  const result = await db.runTransaction(async (tx) => {
    const userRef = db.doc(`users/${toUid}`);
    const snap = await tx.get(userRef);
    if (!snap.exists) throw new HttpsError('not-found', 'user-not-found');
    const data = snap.data() || {};
    const next = Number(data[currency] || 0) + amount;
    tx.set(userRef, { [currency]: next, updatedAt: Timestamp.now() }, { merge: true });
    const txId = db.collection('economy_transactions').doc().id;
    tx.set(db.doc(`economy_transactions/${txId}`), {
      toUid,
      grantedBy: request.auth!.uid,
      type: 'reward',
      currency,
      amount,
      balanceAfter: next,
      reason: String(r.reason || '').slice(0, 200),
      at: Timestamp.now()
    });
    return { ok: true, balance: next };
  });
  return result;
});

/* ============================================================ */
/* 2) دفع FCM عند الرسائل الجديدة                                */
/* ============================================================ */

export const onChatMessageCreated = onDocumentCreated(
  { document: 'chats/{chatId}/messages/{messageId}', database: DB_ID },
  async (event) => {
    const msg = event.data?.data();
    if (!msg) return;
    const chatId = event.params.chatId;
    const chatSnap = await db.doc(`chats/${chatId}`).get();
    const participants: string[] = (chatSnap.data()?.participants as string[]) || [];
    const senderId = String(msg.senderId || msg.sender || '');
    const text = String(msg.text || '').slice(0, 120);
    if (!text) return;
    const senderName = String(msg.senderName || 'رسالة جديدة');
    const targets = participants.filter((p) => p && p !== senderId).slice(0, 10);
    await Promise.all(
      targets.map((uid) =>
        pushToUser(uid, {
          title: senderName,
          body: text,
          tag: 'chat:' + chatId,
          url: '/?go=chatRoom&id=' + chatId
        }).catch((e) => logger.warn('push failed', { uid, e: String(e) }))
      )
    );
  }
);

export const onGroupMessageCreated = onDocumentCreated(
  { document: 'groups/{groupId}/messages/{messageId}', database: DB_ID },
  async (event) => {
    const msg = event.data?.data();
    if (!msg) return;
    const groupId = event.params.groupId;
    const groupSnap = await db.doc(`groups/${groupId}`).get();
    const memberUids: string[] = (groupSnap.data()?.memberUids as string[]) || [];
    const senderId = String(msg.senderId || msg.sender || '');
    const text = String(msg.text || '').slice(0, 120);
    if (!text || !memberUids.length) return;
    const senderName = String(msg.senderName || 'رسالة قروب');
    const targets = memberUids.filter((p) => p && p !== senderId).slice(0, 200);
    await Promise.all(
      targets.map((uid) =>
        pushToUser(uid, {
          title: senderName + ' · ' + String(groupSnap.data()?.name || 'قروب'),
          body: text,
          tag: 'group:' + groupId,
          url: '/?go=groupRoom&id=' + groupId
        }).catch((e) => logger.warn('push failed', { uid, e: String(e) }))
      )
    );
  }
);

/* ============================================================ */
/* 3) تنظيف دوري — جلسات مكالمات ميّتة وأجهزة قديمة               */
/* ============================================================ */

export const cleanupStaleCalls = onSchedule('every 60 minutes', async () => {
  const cutoff = Timestamp.fromMillis(Date.now() - 24 * 3600 * 1000);
  const snap = await db
    .collection('calls')
    .where('createdAt', '<', cutoff)
    .limit(200)
    .get();
  await Promise.all(snap.docs.map((d) => d.ref.delete().catch(() => undefined)));
  if (snap.size) logger.info('cleaned stale calls', { count: snap.size });
});

export const cleanupStaleDevices = onSchedule('every 24 hours', async () => {
  const cutoff = Timestamp.fromMillis(Date.now() - 90 * 24 * 3600 * 1000);
  const usersSnap = await db.collection('users').limit(500).get();
  let cleaned = 0;
  for (const u of usersSnap.docs) {
    const devSnap = await u.ref.collection('devices').where('lastActive', '<', cutoff).limit(100).get();
    await Promise.all(devSnap.docs.map((d) => d.ref.delete().catch(() => undefined)));
    cleaned += devSnap.size;
  }
  if (cleaned) logger.info('cleaned stale device tokens', { count: cleaned });
});

/* ============================================================ */
/* 4) روابط وسائط موقّعة بتحقق عضوية فعلي                        */
/* ============================================================ */

export const getChatMediaUrl = onCall(async (request) => {
  const auth = request.auth;
  if (!auth?.uid) throw new HttpsError('unauthenticated', 'sign-in-required');
  const path = String(request.data?.path || '');
  if (!path || path.length > 300 || path.includes('..')) {
    throw new HttpsError('invalid-argument', 'invalid-path');
  }
  // المسارات المسموحة: وسائط محادثات/قروبات فقط
  const m = path.match(/^(chats|groups|communities)\/([A-Za-z0-9_\-]+)\/.+$/);
  if (!m) throw new HttpsError('permission-denied', 'unsupported-path');

  const [, kind, id] = m;
  const containerSnap = await db.doc(`${kind}/${id}`).get();
  const data = containerSnap.data() || {};
  const participants: string[] = (data.participants as string[]) || [];
  const memberUids: string[] = (data.memberUids as string[]) || [];
  const allowed = participants.includes(auth.uid) || memberUids.includes(auth.uid);
  if (!allowed) throw new HttpsError('permission-denied', 'not-a-participant');

  const [url] = await getStorage(adminApp)
    .bucket()
    .file(path)
    .getSignedUrl({ action: 'read', expires: Date.now() + 10 * 60 * 1000 });
  return { ok: true, url, expiresInSeconds: 600 };
});
