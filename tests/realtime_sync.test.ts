import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RealtimeSyncManager, decideSyncDirection, isRetryableCode } from '../rtm.js';

/* ============================================================================
   محاكاة متجر Firestore وهمي مشترك بين "عميلين" (A وB) — نفس دلالات المستمعات:
   الكتابة إلى مسار تُطلق لقطات لكل المستمعات المطابقة، والأخطاء تُبَث للمستمعات.
   ============================================================================ */
class FakeFirestore {
  store = new Map<string, any>();
  listenerSeq = 0;
  listeners: Array<{ id: number; path: string; next: (snap: any) => void; error: (err: any) => void; unsubscribed: boolean }> = [];

  subscribe(path: string, next: (snap: any) => void, error: (err: any) => void) {
    const rec = { id: ++this.listenerSeq, path, next, error, unsubscribed: false };
    this.listeners.push(rec);
    // لقطة أولية فورية (كما يفعل Firestore)
    queueMicrotask(() => {
      if (!rec.unsubscribed) next(this.snapshot(path));
    });
    return () => { rec.unsubscribed = true; };
  }

  snapshot(path: string) {
    return { path, data: this.store.get(path) ?? null, metadata: { fromCache: false, hasPendingWrites: false } };
  }

  write(path: string, data: any) {
    this.store.set(path, { ...data, _updatedAt: Date.now() });
    this.listeners.forEach((l) => { if (!l.unsubscribed && l.path === path) l.next(this.snapshot(path)); });
  }

  failAll(err: any) {
    this.listeners.forEach((l) => { if (!l.unsubscribed) l.error(err); });
  }

  activeCount() {
    return this.listeners.filter((l) => !l.unsubscribed).length;
  }
}

/** عميل يستخدم مدير المزامنة فوق المتجر الوهمي */
class FakeClient {
  manager: RealtimeSyncManager;
  received: any[] = [];
  store: FakeFirestore;

  constructor(store: FakeFirestore, name: string) {
    this.store = store;
    this.manager = new RealtimeSyncManager({
      subscribe: (ref: any, next: any, err: any) => store.subscribe(ref.path, next, err),
      onEvent: (type: string, rec: any, error: any, extra: any) => {
        (this.events as any[]).push({ type, id: rec ? rec.id : null, extra });
        void name; void error;
      }
    });
  }
  events: any[] = [];
}

describe('RealtimeSyncManager — السلوك الأساسي', () => {
  it('يسجل كل مستمع بمعرف فريد وحالة وعدّادات فعلية', () => {
    const store = new FakeFirestore();
    const client = new FakeClient(store, 'A');
    const unsub = client.manager.subscribe({
      id: 'test:users',
      ref: { path: 'users/u1' },
      next: () => {}
    });
    const rec = client.manager.getListener('test:users')!;
    expect(rec).toBeTruthy();
    expect(rec.status).toBe('active');
    expect(rec.retryCount).toBe(0);
    expect(rec.lastError).toBeNull();
    expect(typeof unsub).toBe('function');
    unsub();
    expect(client.manager.getListener('test:users')).toBeNull();
  });

  it('يمنع المستمعات المكررة: نفس المعرف يستبدل القديم', () => {
    const store = new FakeFirestore();
    const client = new FakeClient(store, 'A');
    client.manager.subscribe({ id: 'dup', ref: { path: 'posts' }, next: () => {} });
    client.manager.subscribe({ id: 'dup', ref: { path: 'posts' }, next: () => {} });
    expect(client.manager.getStats().total).toBe(1);
    // مستمع المتجر الأصلي أُلغي (بقي واحد حي فقط)
    expect(store.activeCount()).toBe(1);
  });

  it('A → B: كتابة العميل A تصل فوراً للعميل B عبر مستمعه الحي', async () => {
    const store = new FakeFirestore();
    const A = new FakeClient(store, 'A');
    const B = new FakeClient(store, 'B');

    B.manager.subscribe({ id: 'B:chats/c1/messages', ref: { path: 'chats/c1' }, next: (snap) => B.received.push(snap) });

    // B تلقى اللقطة الأولية (فارغة)
    await new Promise((r) => setTimeout(r, 5));
    expect(B.received.length).toBe(1);

    // A يكتب رسالة (محاكاة كتابة سحابية) — يجب أن تصل إلى B لحظياً
    store.write('chats/c1', { text: 'مرحباً يا B من A' });
    expect(B.received.length).toBe(2);
    expect(B.received[1].data.text).toBe('مرحباً يا B من A');
  });

  it('A → B: مزامنة الملف الشخصي — كتابة A لملفه تصل لمستمع B لنفس المستند', async () => {
    const store = new FakeFirestore();
    const A = new FakeClient(store, 'A');
    const B = new FakeClient(store, 'B');
    const seen: any[] = [];
    B.manager.subscribe({ id: 'B:users/u1', ref: { path: 'users/u1' }, next: (s) => seen.push(s.data) });
    await new Promise((r) => setTimeout(r, 5));
    store.write('users/u1', { name: 'أوتاكو', coins: 150 });
    expect(seen[seen.length - 1].name).toBe('أوتاكو');
    expect(seen[seen.length - 1].coins).toBe(150);
    void A;
  });
});

describe('RealtimeSyncManager — إعادة المحاولة والتعافي', () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it('خطأ مؤقت (unavailable) → إعادة اشتراك بتراجع أُسّي مع jitter', async () => {
    const store = new FakeFirestore();
    const client = new FakeClient(store, 'A');
    const nextSpy = vi.fn();
    client.manager.subscribe({ id: 'r1', ref: { path: 'posts' }, next: nextSpy });
    expect(client.manager.getListener('r1')!.status).toBe('active');

    // فشل مؤقت
    store.failAll({ code: 'unavailable', message: 'network down' });
    const rec = client.manager.getListener('r1')!;
    expect(rec.status).toBe('retrying');
    expect(rec.lastError!.code).toBe('unavailable');
    expect(rec.retryCount).toBe(1);
    expect(rec.nextRetryAt).toBeGreaterThan(0);

    // بعد انقضاء مهلة التراجع يعود نشطاً (مع تصريف اللقطة الأولية microtask)
    await vi.advanceTimersByTimeAsync(61_000);
    await Promise.resolve();
    expect(client.manager.getListener('r1')!.status).toBe('active');
    expect(client.manager.getListener('r1')!.retryCount).toBe(0);
  });

  it('التراجع الأسي يتصاعد ويتصفّر بعد لقطة ناجحة', () => {
    const store = new FakeFirestore();
    const mgr = new RealtimeSyncManager({
      subscribe: (ref: any, next: any, err: any) => store.subscribe(ref.path, next, err)
    });
    const d1 = mgr._backoff(1);
    const d3 = mgr._backoff(3);
    const d10 = mgr._backoff(10);
    // jitter بين 50% و100% من القيمة الأُسّية
    expect(d1).toBeGreaterThanOrEqual(500); expect(d1).toBeLessThanOrEqual(1000);
    expect(d3).toBeGreaterThanOrEqual(2000); expect(d3).toBeLessThanOrEqual(4000);
    expect(d10).toBeLessThanOrEqual(60000); // سقف التراجع
    void d10;
  });

  it('خطأ دائم (permission-denied) → حالة failed مع إعادة محاولة بطيئة للأبد (لا فقدان صامت)', async () => {
    const store = new FakeFirestore();
    const client = new FakeClient(store, 'A');
    client.manager.subscribe({ id: 'perm', ref: { path: 'secret' }, next: () => {} });

    for (let i = 0; i < 9; i++) {
      store.failAll({ code: 'permission-denied', message: 'denied' });
      vi.advanceTimersByTime(61_000);
    }
    const rec = client.manager.getListener('perm')!;
    expect(rec.status).toBe('failed');
    expect(rec.permanent).toBe(true);
    // حدث listener_failed صريح — لا إخفاء
    expect(client.events.some((e) => e.type === 'listener_failed')).toBe(true);
    // وما زالت إعادة المحاولة مجدولة (بطيئة)
    expect(rec.nextRetryAt).toBeGreaterThan(Date.now());
  });

  it('notifyNetworkChange(true) بعد انقطاع يعيد بناء المستمعات غير السليمة فوراً', () => {
    const store = new FakeFirestore();
    const client = new FakeClient(store, 'A');
    client.manager.subscribe({ id: 'net1', ref: { path: 'posts' }, next: () => {} });
    store.failAll({ code: 'unavailable', message: 'offline' });
    expect(client.manager.getListener('net1')!.status).toBe('retrying');

    // عودة الشبكة → إعادة اتصال فورية بلا انتظار المؤقت
    client.manager.notifyNetworkChange(true);
    expect(client.manager.getListener('net1')!.status).toBe('active');
    expect(client.events.some((e) => e.type === 'batch_resubscribe')).toBe(true);
  });

  it('notifyAppResume يعيد بناء المستمعات الفاشلة (محاكاة عودة التطبيق من الخلفية)', () => {
    const store = new FakeFirestore();
    const client = new FakeClient(store, 'A');
    client.manager.subscribe({ id: 'app1', ref: { path: 'stories' }, next: () => {} });
    store.failAll({ code: 'unavailable', message: 'bg freeze' });
    client.manager.notifyAppResume();
    expect(client.manager.getListener('app1')!.status).toBe('active');
  });

  it('heartbeat يعيد أي مستمع فاتته مؤقتاته (متصفح خلفية خنق المؤقتات)', () => {
    const store = new FakeFirestore();
    const clock = { now: 1000 };
    const mgr = new RealtimeSyncManager({
      subscribe: (ref: any, next: any, err: any) => store.subscribe(ref.path, next, err),
      now: () => clock.now,
      timers: {
        set: () => 0, // مؤقتات "مخنوقة" لا تعمل أبداً
        clear: () => {}
      }
    });
    mgr.subscribe({ id: 'hb', ref: { path: 'reels' }, next: () => {} });
    store.failAll({ code: 'unavailable', message: 'x' });
    const rec = mgr.getListener('hb')!;
    expect(rec.status).toBe('retrying');
    // تقدّم الزمن حتى يحين وقت إعادة المحاولة — والمؤقت لم يطلق أبداً → النبضة الدورية تنقذه
    clock.now += 120_000;
    mgr.heartbeat();
    expect(mgr.getListener('hb')!.status).toBe('active');
  });

  it('سقف المستمعات: عند بلوغ الحد يُستبدل الأقدم ولا يتجاوز العدد', () => {
    const store = new FakeFirestore();
    const mgr = new RealtimeSyncManager({
      subscribe: (ref: any, next: any, err: any) => store.subscribe(ref.path, next, err),
      maxListeners: 3
    });
    mgr.subscribe({ id: 'l1', ref: { path: 'a' }, next: () => {} });
    mgr.subscribe({ id: 'l2', ref: { path: 'b' }, next: () => {} });
    mgr.subscribe({ id: 'l3', ref: { path: 'c' }, next: () => {} });
    mgr.subscribe({ id: 'l4', ref: { path: 'd' }, next: () => {} });
    expect(mgr.getStats().total).toBe(3);
    expect(mgr.getListener('l1')).toBeNull(); // الأزل استُبدل
    expect(mgr.getListener('l4')).toBeTruthy();
  });
});

describe('RealtimeSyncManager — الإيقاف عند الخروج/تبديل الحساب', () => {
  it('notifyAuthChange(null) يلغي مستمعات المستخدم فقط ويُبقي العامة', () => {
    const store = new FakeFirestore();
    const client = new FakeClient(store, 'A');
    client.manager.subscribe({ id: 'g:posts', ref: { path: 'posts' }, next: () => {}, scoped: null });
    client.manager.subscribe({ id: 'u:chats', ref: { path: 'chats' }, next: () => {}, scoped: 'user' });
    client.manager.subscribe({ id: 'u:myuser', ref: { path: 'users/u1' }, next: () => {}, scoped: 'user' });

    client.manager.notifyAuthChange(null); // خروج
    expect(client.manager.getListener('u:chats')).toBeNull();
    expect(client.manager.getListener('u:myuser')).toBeNull();
    expect(client.manager.getListener('g:posts')).toBeTruthy(); // عام — يبقى
  });

  it('unsubscribeAll يمسح كل شيء', () => {
    const store = new FakeFirestore();
    const client = new FakeClient(store, 'A');
    client.manager.subscribe({ id: 'x1', ref: { path: 'a' }, next: () => {} });
    client.manager.subscribe({ id: 'x2', ref: { path: 'b' }, next: () => {} });
    client.manager.unsubscribeAll();
    expect(client.manager.getStats().total).toBe(0);
    expect(store.activeCount()).toBe(0);
  });
});

describe('RealtimeSyncManager — تعقب الكتابات', () => {
  it('كل كتابة تُسجَّل بنتيجتها الفعلية ورمز الخطأ وقابلية الإعادة', async () => {
    const mgr = new RealtimeSyncManager({ subscribe: () => () => {} });
    mgr.trackWrite('setDoc', 'users/u1', Promise.resolve({}));
    mgr.trackWrite('setDoc', 'user_states/u1', Promise.reject(Object.assign(new Error('denied'), { code: 'permission-denied' })));
    mgr.trackWrite('setDoc', 'posts/p1', Promise.reject(Object.assign(new Error('off'), { code: 'unavailable' })));
    await new Promise((r) => setTimeout(r, 5));

    const log = mgr.getWriteLog();
    expect(log).toHaveLength(3);
    expect(log[2].ok).toBe(true);          // الأحدث أولاً
    expect(log[1].ok).toBe(false);
    expect(log[1].code).toBe('permission-denied');
    expect(log[1].retryable).toBe(false);
    expect(log[0].code).toBe('unavailable');
    expect(log[0].retryable).toBe(true);
    expect(mgr.getStats().failedWrites).toBe(2);
    expect(mgr.getStats().inFlightWrites).toBe(0);
  });
});

describe('بوابة تسوية اتجاه المزامنة (السيرفر مصدر الحقيقة)', () => {
  it('لا نكتب حالة محلية فوق حالة سيرفر أحدث — نسحب بدلاً من الدفع', () => {
    // السيرفر أحدث → سحب
    expect(decideSyncDirection(5000, 1000, true)).toBe('pull');
    // المحلي أحدث أو مساوٍ → دفع
    expect(decideSyncDirection(1000, 5000, true)).toBe('push');
    expect(decideSyncDirection(1000, 1000, true)).toBe('push');
    // لا مستند سحابي → إنشاء (دفع)
    expect(decideSyncDirection(null, 0, false)).toBe('push');
    // مستند قديم بلا طابع زمني → دفع (دمج آمن)
    expect(decideSyncDirection(null, 0, true)).toBe('push');
    // أول مزامنة على جهاز جديد → السيرفر هو الأحدث
    expect(decideSyncDirection(1000, 0, true)).toBe('pull');
  });

  it('تصنيف قابلية إعادة المحاولة لرموز Firestore', () => {
    expect(isRetryableCode('unavailable')).toBe(true);
    expect(isRetryableCode('deadline-exceeded')).toBe(true);
    expect(isRetryableCode('aborted')).toBe(true);
    expect(isRetryableCode('permission-denied')).toBe(false);
    expect(isRetryableCode('unauthenticated')).toBe(false);
    expect(isRetryableCode(null)).toBe(true);
  });
});

describe('سيناريو متكامل: انقطاع ثم استعادة ثم تبديل حساب (دورة حياة كاملة)', () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it('الرحلة الكاملة: تشغيل → انقطاع → إعادة اتصال تلقائية → خروج → نظافة', () => {
    const store = new FakeFirestore();
    const client = new FakeClient(store, 'A');

    // تشغيل: مستمعات عامة + خاصة بالمستخدم
    client.manager.subscribe({ id: 'g:posts', ref: { path: 'posts' }, next: () => {}, scoped: null });
    client.manager.subscribe({ id: 'u:chats', ref: { path: 'chats' }, next: () => {}, scoped: 'user' });
    client.manager.subscribe({ id: 'u:notifs', ref: { path: 'notifications' }, next: () => {}, scoped: 'user' });
    expect(client.manager.getStats().byStatus.active).toBe(3);

    // انقطاع الشبكة (الشاشة تنطفئ/التطبيق للخلفية)
    client.manager.notifyNetworkChange(false);
    expect(client.manager.getStats().backendOnline).toBe(false);

    // فشل مؤقت يضرب المستمعات
    store.failAll({ code: 'unavailable', message: 'offline' });
    expect(client.manager.getStats().byStatus.retrying).toBe(3);

    // عودة الشبكة: كل المستمعات تعود نشطة تلقائياً
    client.manager.notifyNetworkChange(true);
    expect(client.manager.getStats().byStatus.active).toBe(3);

    // خروج الحساب: الخاصة تُلغى والعامة تبقى
    client.manager.notifyAuthChange(null);
    expect(client.manager.getStats().total).toBe(1);
    expect(client.manager.getListener('g:posts')).toBeTruthy();

    // تسجيل دخول بحساب آخر: لا بقايا من الحساب الأول
    client.manager.notifyAuthChange('uid_new_user');
    const remaining = client.manager.getListeners();
    expect(remaining.every((r) => r.scoped !== 'user')).toBe(true);
  });
});
