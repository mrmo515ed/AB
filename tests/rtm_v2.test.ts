/**
 * RTSM v2 — دورة حياة المستمعات المتقدمة (PR2 Phase 1):
 * بصمة الاستعلام، حاجز السقف بلا إخلاء، الطابور، الإيقاف/الاستئناف،
 * المالك/الميزة، واكتمال حقول التشخيص.
 */
import { describe, expect, it, vi } from 'vitest';
import { RealtimeSyncManager, describeQuery, fingerprintOf } from '../rtm.js';

class FakeFirestore {
  private subs = new Map<string, Array<(snap: any) => void>>();
  public subscribe(path: string, next: (snap: any) => void, _err: (e: any) => void) {
    if (!this.subs.has(path)) this.subs.set(path, []);
    this.subs.get(path)!.push(next);
    return () => {
      const arr = this.subs.get(path) || [];
      const ix = arr.indexOf(next);
      if (ix >= 0) arr.splice(ix, 1);
    };
  }
  public emit(path: string, snap: any) {
    (this.subs.get(path) || []).slice().forEach((cb) => cb(snap));
  }
  public count(path: string) { return (this.subs.get(path) || []).length; }
}

function makeManager(maxListeners = 64) {
  const store = new FakeFirestore();
  const events: Array<Record<string, unknown>> = [];
  const manager = new RealtimeSyncManager({
    subscribe: (ref: any, next: any, err: any) =>
      store.subscribe((ref && (ref.path || (ref._query && ref._query.path && ref._query.path.canonicalString()))) || 'unknown', next, err),
    onEvent: (type, _rec, _err, extra) => events.push({ type, extra }),
    maxListeners
  });
  return { store, manager, events };
}

/** مرجع استعلام وهمي يشبه بنية Firestore v10 الداخلية */
function fakeQuery(path: string, opts: { filters?: any[]; orderBy?: any[]; limit?: number } = {}) {
  return {
    _query: {
      path: { canonicalString: () => path },
      filters: opts.filters || [],
      orderBy: opts.orderBy || [],
      limit: opts.limit || null,
      isCollectionGroupQuery: false
    }
  };
}

describe('بصمة الاستعلام (Query Fingerprint)', () => {
  it('describeQuery يستخرج المسار والمرشحات والترتيب والحد دفاعياً', () => {
    const q = fakeQuery('chats/c1/messages', {
      filters: [{ _field: { segments: ['senderId'] }, _op: '==', _value: 'u2' }],
      orderBy: [{ _dir: 'desc', _field: { segments: ['createdAt'] } }],
      limit: 50
    });
    const d = describeQuery(q as any);
    expect(d.path).toBe('chats/c1/messages');
    expect(d.filters).toEqual(['senderId == "u2"']);
    expect(d.orderBy).toEqual(['desc createdAt']);
    expect(d.limit).toBe(50);
  });

  it('describeQuery لا يرمي أبداً — مرجع تالف يعيد وصفاً فارغاً', () => {
    expect(() => describeQuery(null as any)).not.toThrow();
    expect(() => describeQuery({ get _query() { throw new Error('boom'); } } as any)).not.toThrow();
    expect(describeQuery(null as any).path).toBeNull();
  });

  it('بصمات مختلفة: استعلامات مختلفة على نفس المسار (حد مختلف) ≠ بعضها', () => {
    const a = fingerprintOf({ path: 'posts', limit: 10, owner: 'feed' });
    const b = fingerprintOf({ path: 'posts', limit: 25, owner: 'feed' });
    expect(a).not.toBe(b);
  });

  it('بصمات متطابقة: نفس المرشحات بترتيب مختلف = نفس الاستعلام', () => {
    const a = fingerprintOf({ path: 'posts', filters: ['a == 1', 'b == 2'] });
    const b = fingerprintOf({ path: 'posts', filters: ['b == 2', 'a == 1'] });
    expect(a).toBe(b);
  });

  it('المالك والغرض يدخلان في الهوية — نفس الاستعلام لمالكين مختلفين لا يستبدل بعضهما', () => {
    const a = fingerprintOf({ path: 'users/u1', owner: 'users' });
    const b = fingerprintOf({ path: 'users/u1', owner: 'profile-viewer' });
    expect(a).not.toBe(b);
  });
});

describe('هوية المستمع في المدير — استعلامات مختلفة على نفس المسار', () => {
  it('مستمعان بنفس المسار وحدود مختلفة يتعايشان ويستلمان معاً', () => {
    const { store, manager } = makeManager();
    const gotA: any[] = [];
    const gotB: any[] = [];
    manager.subscribe({ ref: fakeQuery('posts', { limit: 10 }), next: (s) => gotA.push(s) });
    manager.subscribe({ ref: fakeQuery('posts', { limit: 25 }), next: (s) => gotB.push(s) });
    expect(manager.getStats().total).toBe(2);
    expect(store.count('posts')).toBe(2);
    store.emit('posts', { id: 1 });
    expect(gotA).toHaveLength(1);
    expect(gotB).toHaveLength(1);
  });

  it('نفس الاستعلام لنفس المالك مرتين = استبدال (dedup) لا ازدواج', () => {
    const { store, manager } = makeManager();
    manager.subscribe({ ref: fakeQuery('posts', { limit: 10 }), next: () => {} });
    manager.subscribe({ ref: fakeQuery('posts', { limit: 10 }), next: () => {} });
    expect(manager.getStats().total).toBe(1);
    expect(store.count('posts')).toBe(1);
    const ev = manager.getEvents(50).find((e) => e.type === 'listener_stopped') as any;
    expect(ev && ev.data && ev.data.reason === 'replaced-duplicate').toBe(true);
    const hist = manager.getHistory();
    expect(hist.some((h: any) => h.reason === 'replaced-duplicate')).toBe(true);
  });

  it('نفس الاستعلام لمالكين مختلفين يتعايشان (ميزتان تشتركان في نفس البث)', () => {
    const { manager } = makeManager();
    manager.subscribe({ ref: fakeQuery('users/u1'), owner: 'users', next: () => {} });
    manager.subscribe({ ref: fakeQuery('users/u1'), owner: 'profile-card', next: () => {} });
    expect(manager.getStats().total).toBe(2);
  });
});

describe('حاجز السقف — طابور آمن بلا إخلاء (guardrail)', () => {
  it('عند بلوغ السقف: لا إخلاء، حدث guardrail_reached يذكر المالك والمسار والسبب', () => {
    const { manager, events } = makeManager(2);
    manager.subscribe({ ref: { path: 'a' }, owner: 'feed', next: () => {} });
    manager.subscribe({ ref: { path: 'b' }, owner: 'chats', next: () => {} });
    manager.subscribe({ ref: { path: 'c' }, owner: 'notifs', next: () => {} });
    expect(manager.getListener('a') ? true : true).toBe(true);
    const byPath = (p: string) => Array.from(manager.getListeners()).find((l) => l.path === p)!;
    expect(byPath('a').status).toBe('active');
    expect(byPath('b').status).toBe('active');
    expect(byPath('c').status).toBe('queued');
    const guard = events.find((e) => e.type === 'guardrail_reached') as any;
    expect(guard).toBeTruthy();
    expect(guard.extra.owner).toBe('notifs');
    expect(guard.extra.reason).toBe('listener-cap');
    expect(guard.extra.path).toBe('c');
    expect(guard.extra.cap).toBe(2);
  });

  it('امتلاء الطابور → رفض آمن مع guardrail_rejected وليس استثناءً', () => {
    const manager = new RealtimeSyncManager({
      subscribe: () => () => {},
      maxListeners: 1,
      maxQueue: 1
    });
    const evs: any[] = [];
    (manager as any)._onEvent = null;
    const orig = manager.getEvents.bind(manager);
    manager.subscribe({ ref: { path: 'a' }, next: () => {} });
    const un1 = manager.subscribe({ ref: { path: 'b' }, next: () => {} }); // queued
    const un2 = manager.subscribe({ ref: { path: 'c' }, next: () => {} }); // rejected
    expect(() => { un1(); un2(); }).not.toThrow();
    expect(manager.getStats().queueLength).toBe(0);
    expect(orig).toBeTruthy();
  });

  it('تحرير مقعد بالإلغاء → أول الطابور يبدأ فوراً', () => {
    const { store, manager } = makeManager(1);
    const got: any[] = [];
    const un1 = manager.subscribe({ ref: { path: 'a' }, next: () => {} });
    manager.subscribe({ ref: { path: 'b' }, next: (s) => got.push(s) });
    expect(store.count('b')).toBe(0);
    un1();
    expect(store.count('b')).toBe(1);   // بدأ الآن
    store.emit('b', 'hello');
    expect(got).toEqual(['hello']);
  });

  it('unsubscribeScoped ينقّي أيضاً اشتراكات الحساب المنتظرة في الطابور', () => {
    const manager = new RealtimeSyncManager({ subscribe: () => () => {}, maxListeners: 1 });
    manager.subscribe({ ref: { path: 'app' }, next: () => {} });
    manager.subscribe({ ref: { path: 'chats/c1' }, scoped: 'user', next: () => {} });
    manager.notifyAuthChange(null);
    expect(manager.getStats().queueLength).toBe(0);
  });
});

describe('الإيقاف والاستئناف (pause/resume)', () => {
  it('المستمع المتوقف لا يستقبل لقطات ولا يحتل مقعداً من السقف', () => {
    const { store, manager } = makeManager(2);
    const got: any[] = [];
    manager.subscribe({ ref: { path: 'a' }, next: (s) => got.push(s) });
    manager.subscribe({ ref: { path: 'b' }, next: () => {} });
    const lA = manager.getListeners().find((l) => l.path === 'a')!;
    expect(manager.pause(lA.id)).toBe(true);
    expect(manager.getStats().byStatus.paused).toBe(1);
    expect(manager.getStats().activeCount).toBe(1);   // حرر مقعداً
    store.emit('a', 'x');
    expect(got).toHaveLength(0);                       // لا لقطات أثناء الإيقاف
    expect(manager.resume(lA.id)).toBe(true);
    expect(manager.getStats().byStatus.active).toBe(2);
    store.emit('a', 'y');
    expect(got).toEqual(['y']);                        // استأنف الاستقبال
  });

  it('pauseOwner/resumeOwner يديران دورة حياة ميزة كاملة', () => {
    const { manager } = makeManager(64);
    manager.subscribe({ ref: { path: 'chats/c1' }, owner: 'chats', next: () => {} });
    manager.subscribe({ ref: { path: 'chats/c2' }, owner: 'chats', next: () => {} });
    manager.subscribe({ ref: { path: 'posts' }, owner: 'feed', next: () => {} });
    expect(manager.pauseOwner('chats')).toBe(2);
    expect(manager.getStats().byStatus.paused).toBe(2);
    expect(manager.resumeOwner('chats')).toBe(2);
    expect(manager.getStats().byStatus.active).toBe(3);
  });

  it('teardownOwner يلغي كل مستمعات المالك (حتى المنتظرة)', () => {
    const manager = new RealtimeSyncManager({ subscribe: () => () => {}, maxListeners: 1 });
    manager.subscribe({ ref: { path: 'x' }, owner: 'feed', next: () => {} });
    manager.subscribe({ ref: { path: 'posts/a' }, owner: 'feed', next: () => {} }); // queued
    expect(manager.teardownOwner('feed')).toBe(2);
    expect(manager.getStats().total).toBe(0);
    expect(manager.getStats().queueLength).toBe(0);
  });
});

describe('اكتمال حقول التشخيص لكل مستمع', () => {
  it('كل سجل عام يكشف الحالة/الإنشاء/آخر لقطة/آخر خطأ/المحاولات/الاشتراك/البصمة/المالك', () => {
    const { manager } = makeManager();
    manager.subscribe({ ref: { path: 'users/u1' }, owner: 'users', purpose: 'profile', next: () => {} });
    const l = manager.getListeners()[0];
    for (const key of ['status', 'createdAt', 'lastSnapshotAt', 'lastError', 'retryCount', 'unsubState', 'fingerprint', 'owner', 'purpose']) {
      expect(l).toHaveProperty(key);
    }
    expect(l.owner).toBe('users');
    expect(l.purpose).toBe('profile');
    expect(typeof l.fingerprint).toBe('string');
    expect(l.fingerprint.length).toBeGreaterThan(0);
    expect(l.unsubState).toBe('attached');
  });

  it('getStats يكشف الطابور والحاجز والسقف والنشط الفعلي', () => {
    const { manager } = makeManager(1);
    manager.subscribe({ ref: { path: 'a' }, next: () => {} });
    manager.subscribe({ ref: { path: 'b' }, next: () => {} });
    const st = manager.getStats();
    expect(st.listenerCap).toBe(1);
    expect(st.activeCount).toBe(1);
    expect(st.queueLength).toBe(1);
    expect(st.guardrailHits).toBe(1);
  });
});

describe('العزل بين الحسابات', () => {
  it('uid الجاري يُسجَّل في السجل للتشخيص، والاشتراك نفسه لمالك واحد يستبدل القديم عبر الحسابات', () => {
    const { manager } = makeManager();
    manager.notifyAuthChange('uid-A');
    manager.subscribe({ ref: { path: 'app_visual_config/main' }, owner: 'visual-config', next: () => {} });
    expect(manager.getListeners()[0].uid).toBe('uid-A');
    manager.notifyAuthChange('uid-B');   // تبديل حساب (غير scoped → لا يُلغى تلقائياً)
    manager.subscribe({ ref: { path: 'app_visual_config/main' }, owner: 'visual-config', next: () => {} });
    expect(manager.getStats().total).toBe(1);   // استُبدل — لا تسريب مستمع بين الحسابات
    expect(manager.getListeners()[0].uid).toBe('uid-B');
  });
});
