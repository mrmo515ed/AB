/* ==========================================================================
   Anime Black — Realtime Sync Manager v2 (RTSM)
   --------------------------------------------------------------------------
   المدير المركزي الوحيد لكل مستمعات Firestore في التطبيق.

   v2 — إدارة دورة حياة كاملة (PR2):
   - هوية المستمع = بصمة استعلام حتمية (مسار + مرشحات + ترتيب + حد + سياق + غرض)
     وليس المسار وحده: استعلامات مختلفة على نفس المسار لا تحل محل بعضها أبداً.
   - سقف المستمعات حاجز أمان وليس سبباً لإسكات مزامنة حية:
     عند بلوغ السقف يُصفّ الاشتراك الجديد في طابور محدود (مع حدث guardrail
     يذكر المالك والمسار والسبب) — ولا يُإخلاء أي مستمع نشط شرعي.
   - إيقاف/استئناف (pause/resume) للمستمع الواحد أو لمالك كامل،
     والمستمع المتوقف لا يحتل مقعداً من السقف.
   - كل مستمع يكشف: الحالة، وقت الإنشاء، آخر لقطة، آخر خطأ، عدد المحاولات،
     حالة فك الاشتراك، بصمة الاستعلام، المالك/الميزة، والغرض.
   - إعادة اتصال تلقائية بتراجع أُسّي + عشوائية، وإعادة بطيئة دائمة للأخطاء
     الجوهرية — لا فقدان صامت إطلاقاً.
   - إلغاء مستمعات الحساب عند الخروج/تبديل الحساب (وتنقية طابور الانتظار).
   - تعقب الكتابات بنتائجها الفعلية ورموز أخطاء Firebase.

   وحدة ESM مستقلة بلا اعتماديات — تُحمَّل كـ <script type="module" src="/rtm.js">
   قبل جسر Firebase، وتُستورد مباشرة في اختبارات vitest.
   ========================================================================== */

// رموز أخطاء Firestore التي لا تفيد معها إعادة المحاولة السريعة
const PERMANENT_CODES = [
  'permission-denied', 'unauthenticated', 'invalid-argument',
  'failed-precondition', 'unimplemented', 'not-found', 'out-of-range',
  'already-exists', 'cancelled', 'data-loss', 'unknown'
];

const DEFAULTS = {
  maxListeners: 64,             // حاجز أمان (guardrail) — لا إخلاء للمستمعات النشطة
  maxQueue: 32,                 // سقف طابور الانتظار عند بلوغ الحاجز (بعده رفض آمن مع حدث)
  baseDelayMs: 1000,            // أول تأخير لإعادة المحاولة
  maxDelayMs: 60000,            // سقف التراجع الأسي
  maxFastRetries: 8,            // بعدها تتحول الحالة إلى failed مع استمرار الإعادة البطيئة
  failedRetryMs: 5 * 60 * 1000, // إعادة محاولة بطيئة للأخطاء الجوهرية
  writeLogSize: 100,
  historySize: 50,
  eventLogSize: 100
};

function clampNum(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }

/** قرار اتجاه المزامنة: ندفع الحالة المحلية أم نسحب حالة السيرفر؟ (السيرفر مصدر الحقيقة) */
function decideSyncDirection(serverUpdatedAt, localSyncedAt, serverExists) {
  if (serverExists === false) return 'push';   // لا مستند على السيرفر → أنشئه
  if (!serverUpdatedAt) return 'push';         // مستند قديم بلا طابع زمني → دمج آمن
  if (!localSyncedAt) return 'pull';           // لم نزامن من قبل → السيرفر هو الأحدث
  return serverUpdatedAt > localSyncedAt ? 'pull' : 'push';
}

/** هل يمكن إعادة محاولة كتابة فشلت برمز معين؟ */
function isRetryableCode(code) {
  if (!code) return true; // خطأ غير معروف (غالباً شبكة) → قابل للإعادة
  return PERMANENT_CODES.indexOf(code) === -1;
}

/* --------------------------------------------------------------- */
/* بصمة الاستعلام — هوية حتمية للمستمع                             */
/* --------------------------------------------------------------- */

/** قيمة مستقرة قابلة للمقارنة من أي قيمة داخلية (دفاعية بالكامل) */
function stableValue(v, depth) {
  try {
    if (v == null) return 'null';
    if (depth > 6) return '…';
    const t = typeof v;
    if (t === 'string' || t === 'number' || t === 'boolean') return t === 'string' ? JSON.stringify(v) : String(v);
    if (Array.isArray(v)) return '[' + v.map(function (x) { return stableValue(x, (depth || 0) + 1); }).join(',') + ']';
    if (t === 'object') {
      // FieldPath / Bytes / Timestamp … — جرّب التمثيل النصي الآمن أولاً
      const keys = Object.keys(v).sort();
      return '{' + keys.map(function (k) { return JSON.stringify(k) + ':' + stableValue(v[k], (depth || 0) + 1); }).join(',') + '}';
    }
    return String(v);
  } catch (_) { return '?'; }
}

/**
 * استخراج وصف دفاعي للاستعلام من مرجع Firestore (v10) أو من مسار نصي.
 * لا يرمي أبداً — أي فشل في قراءة البنية الداخلية يعيد ما توصلنا إليه فقط.
 */
function describeQuery(ref) {
  const d = { path: null, filters: null, orderBy: null, limit: null, startAt: null, endAt: null, collectionGroup: false };
  try {
    if (!ref) return d;
    if (typeof ref.path === 'string') { d.path = ref.path; return d; }        // DocumentReference
    const q = ref._query;
    if (!q) return d;
    if (q.path && typeof q.path.canonicalString === 'function') d.path = q.path.canonicalString();
    try { if (q.isCollectionGroupQuery === true) d.collectionGroup = true; } catch (_) {}
    try {
      if (Array.isArray(q.filters) && q.filters.length) {
        d.filters = q.filters.map(function (f) {
          let field = '?', op = '?';
          try { field = (f._field && f._field.segments) ? f._field.segments.join('.') : String(f._field); } catch (_) {}
          try { op = String(f._op || (f.type ? f.type : '?')); } catch (_) {}
          return field + ' ' + op + ' ' + stableValue(f._value, 0);
        }).sort(); // نفس المرشحات بأي ترتيب = نفس الاستعلام دلالياً
      }
    } catch (_) {}
    try {
      if (Array.isArray(q.orderBy) && q.orderBy.length) {
        d.orderBy = q.orderBy.map(function (o) {
          let field = '?', dir = 'asc';
          try { field = (o._field && o._field.segments) ? o._field.segments.join('.') : String(o._field); } catch (_) {}
          try { dir = String(o._dir || 'asc'); } catch (_) {}
          return dir + ' ' + field;
        });
      }
    } catch (_) {}
    try { if (typeof q.limit === 'number' && q.limit > 0) d.limit = q.limit; } catch (_) {}
    try { if (q.startAt) d.startAt = stableValue(q.startAt, 0); } catch (_) {}
    try { if (q.endAt) d.endAt = stableValue(q.endAt, 0); } catch (_) {}
  } catch (_) { /* لا تُخفِ الأخطاء عن التشخيص */ }
  return d;
}

/** تجزئة نصية حتمية قصيرة (djb2) */
function hashStr(s) {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}

/**
 * بصمة الاستعلام: مسار + مرشحات + ترتيب + حد + حدود النطاق + مجموعة-مجموعات
 * + المالك/الميزة + الغرض.
 * ملاحظة معمارية: سياق المستخدم لا يدخل في هوية الاستبدال (الاستعلام نفسه
 * لمالك واحد يستبدل القديم عبر الحسابات — يمنع تسريب مستمعات بين الحسابات)،
 * ويُخزَّن uid الجاري في السجل للتشخيص والعزل.
 */
function fingerprintOf(parts) {
  const p = parts || {};
  const key = [
    'path=' + (p.path || 'unknown'),
    'filters=' + (p.filters ? p.filters.slice().sort().join(' & ') : ''),
    'orderBy=' + (p.orderBy ? p.orderBy.join(' > ') : ''),
    'limit=' + (p.limit == null ? '' : String(p.limit)),
    'startAt=' + (p.startAt || ''),
    'endAt=' + (p.endAt || ''),
    'cg=' + (p.collectionGroup ? '1' : '0'),
    'owner=' + (p.owner || ''),
    'purpose=' + (p.purpose || '')
  ].join('|');
  return hashStr(key);
}

class RealtimeSyncManager {
  constructor(opts) {
    opts = opts || {};
    if (typeof opts.subscribe !== 'function') {
      throw new Error('RealtimeSyncManager requires opts.subscribe(ref, next, error, listenOptions)');
    }
    this._subscribeRaw = opts.subscribe;
    this._now = typeof opts.now === 'function' ? opts.now : function () { return Date.now(); };
    this._timers = opts.timers || {
      set: function (fn, ms) { return setTimeout(fn, ms); },
      clear: function (t) { clearTimeout(t); }
    };
    const keys = Object.keys(DEFAULTS);
    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      this[k] = (opts[k] != null) ? opts[k] : DEFAULTS[k];
    }

    this._listeners = new Map();   // id -> سجل المستمع الحي
    this._queue = [];              // طابور الانتظار عند بلوغ حاجز السقف
    this._history = [];            // سجل إيقاف/استبدال المستمعات (حلقة محدودة)
    this._events = [];             // سجل أحداث عام (حلقة محدودة)
    this._onEvent = typeof opts.onEvent === 'function' ? opts.onEvent : null;
    this._uid = null;              // سياق المستخدم الجاري (تشخيص/عزل — ليس جزءاً من هوية الاستبدال)
    this._guardrailHits = 0;       // عدد مرات بلوغ الحاجز (قيمة حقيقية للتشخيص)

    // حالة الواجهة الخلفية (يضبطها مستمع الكناري في الجسر — قيم حقيقية فقط أو null=غير معروف)
    this._backendOnline = null;

    // تعقب الكتابات — كل قيم حقيقية من نتائج فعلية
    this._inFlightWrites = 0;
    this._writeLog = [];
    this._startedAt = this._now();
  }

  /* --------------------------------------------------------------- */
  /* الاشتراكات                                                      */
  /* --------------------------------------------------------------- */

  /**
   * تسجيل مستمع عبر المدير (الطريق الوحيد لفتح أي مستمع Firestore).
   * config: { id?, ref, path?, next(snapshot), error?(err), listenOptions?,
   *           scoped?, owner?, purpose?, descriptor?, tags? }
   *  - owner/purpose: المالك/الميزة (مثل 'chats' / 'feed') — يحدد الهوية ودورة الحياة
   *  - scoped: 'user' للمستمعات المرتبطة بحساب (تُلغى تلقائياً عند الخروج/تبديل الحساب)
   *  - descriptor: وصف الاستعلام (من describeQuery) — يُستخرج تلقائياً إن لم يُمرَّر
   * يعيد دالة إلغاء اشتراك idempotent (تعمل حتى لو كان الاشتراك لا يزال في الطابور).
   */
  subscribe(config) {
    if (!config || typeof config.next !== 'function') {
      throw new Error('RTSM.subscribe requires { ref, next }');
    }
    const path = config.path || this.refPath(config.ref);
    const descriptor = config.descriptor || describeQuery(config.ref);
    if (!descriptor.path && path) descriptor.path = path;
    const owner = config.owner || null;
    const purpose = config.purpose || null;
    const fingerprint = fingerprintOf({
      path: descriptor.path || path, filters: descriptor.filters, orderBy: descriptor.orderBy,
      limit: descriptor.limit, startAt: descriptor.startAt, endAt: descriptor.endAt,
      collectionGroup: descriptor.collectionGroup, owner: owner, purpose: purpose
    });
    // هوية صريحة (توافق خلفي للاختبارات والكناري) أو بصمة حتمية
    const id = config.id || ('lsn:' + (owner ? owner + ':' : '') + fingerprint);

    if (this._listeners.has(id)) {
      this._teardown(id, 'replaced-duplicate');       // منع المستمعات المكررة (نفس الهوية)
    } else {
      // استنتاج بصمة من أي سجل قائم بنفس البصمة لنفس المالك (اشتراك مكرر لنفس الاستعلام)
      const dupId = this._findByFingerprint(fingerprint, owner);
      if (dupId) this._teardown(dupId, 'replaced-duplicate');
    }

    const rec = {
      id: id,
      path: path,
      fingerprint: fingerprint,
      owner: owner,
      purpose: purpose,
      status: 'pending',
      createdAt: this._now(),
      lastSnapshotAt: null,
      snapshotCount: 0,
      lastError: null,
      retryCount: 0,
      nextRetryAt: null,
      unsub: null,
      unsubState: 'none',
      timer: null,
      next: config.next,
      errorCb: typeof config.error === 'function' ? config.error : null,
      ref: config.ref,
      listenOptions: config.listenOptions || null,
      scoped: config.scoped || null,
      tags: config.tags || null,
      uid: this._uid || null,
      permanent: false
    };

    // حاجز الأمان: لا إخلاء للمستمعات النشطة — الاشتراك الجديد يصطف آمناً
    if (this._activeCount() >= this.maxListeners) {
      if (this._queue.length >= this.maxQueue) {
        this._guardrailHits++;
        this._emit('guardrail_rejected', null, null, {
          incoming: id, path: rec.path, owner: owner || 'unknown',
          reason: 'queue-full', queueLength: this._queue.length,
          active: this._activeCount(), cap: this.maxListeners
        });
        return function () { /* رفض آمن: لا مستمع فُتح، ولا شيء يُلغى */ };
      }
      rec.status = 'queued';
      rec.queuedAt = this._now();
      this._listeners.set(id, rec);   // مسجل في الخريطة أيضاً (تشخيص + إلغاء موحد)
      this._queue.push(rec);
      this._guardrailHits++;
      this._emit('guardrail_reached', rec, null, {
        incoming: id, path: rec.path, owner: owner || 'unknown',
        reason: 'listener-cap', queueLength: this._queue.length,
        active: this._activeCount(), cap: this.maxListeners
      });
      this._emit('listener_queued', rec, null, { queueLength: this._queue.length });
      return () => this._removeQueued(rec.id);
    }

    this._listeners.set(id, rec);
    this._start(rec, 'initial');
    return () => this._teardown(id, 'manual');
  }

  _findByFingerprint(fingerprint, owner) {
    let found = null;
    this._listeners.forEach(function (r) {
      if (!found && r.fingerprint === fingerprint && (r.owner || null) === (owner || null)) found = r.id;
    });
    return found;
  }

  /** عدد المقاعد المحتلة فعلياً (المستمع المتوقف paused لا يحتل مقعداً) */
  _activeCount() {
    let n = 0;
    this._listeners.forEach(function (r) { if (r.status !== 'paused' && r.status !== 'queued') n++; });
    return n;
  }

  _start(rec, reason) {
    rec.status = 'active';
    rec.unsubState = 'attached';
    rec.permanent = false;
    const settle = (snap) => {
      if (rec.status === 'stopped' || rec.status === 'paused') return;
      rec.status = 'active';
      rec.lastSnapshotAt = this._now();
      rec.snapshotCount++;
      if (rec.retryCount !== 0 || rec.nextRetryAt !== null) {
        rec.retryCount = 0;        // لقطة ناجحة تصفّر التراجع
        rec.nextRetryAt = null;
      }
      try { rec.next(snap); }
      catch (cbErr) { this._emit('callback_error', rec, cbErr, { reason: reason }); }
    };
    const fail = (err) => this._onListenerError(rec, err);
    try {
      rec.unsub = this._subscribeRaw(rec.ref, settle, fail, rec.listenOptions);
      rec.unsubState = 'attached';
    } catch (syncErr) {
      rec.unsubState = 'detached';
      // فشل الإعداد نفسه (مرجع غير صالح…) → نعامله كخطأ مستمع مع إعادة محاولة
      this._onListenerError(rec, syncErr);
    }
  }

  _onListenerError(rec, err) {
    if (rec.status === 'stopped' || rec.status === 'paused') return;
    const code = (err && err.code) || 'unknown';
    const message = (err && err.message) || String(err);
    rec.lastError = { code: code, message: message, at: this._now() };
    if (rec.unsub) { try { rec.unsub(); } catch (_) { /* سبق إلغاؤه */ } rec.unsub = null; }
    rec.unsubState = 'detached';
    if (rec.errorCb) { try { rec.errorCb(err); } catch (_) { /* لا نوقف المدير بخطأ مستمع */ } }
    rec.retryCount++;
    if (PERMANENT_CODES.indexOf(code) !== -1) {
      rec.permanent = true;
      if (rec.retryCount > this.maxFastRetries) {
        rec.status = 'failed';
        this._scheduleRetry(rec, this.failedRetryMs);   // إعادة بطيئة للأبد — لا فقدان صامت
        this._emit('listener_failed', rec, err, null);
        return;
      }
      rec.status = 'retrying';
      this._scheduleRetry(rec, this._backoff(rec.retryCount));
      this._emit('listener_retry', rec, err, null);
      return;
    }
    rec.status = 'retrying';
    this._scheduleRetry(rec, this._backoff(rec.retryCount));
    this._emit('listener_retry', rec, err, null);
  }

  /** تراجع أُسّي مع عشوائية كاملة (full jitter) بين 50% و100% من القيمة */
  _backoff(attempt) {
    const exp = this.baseDelayMs * Math.pow(2, clampNum(attempt - 1, 0, 30));
    const capped = Math.min(this.maxDelayMs, exp);
    return Math.max(250, Math.round(capped * (0.5 + Math.random() * 0.5)));
  }

  _scheduleRetry(rec, delay) {
    if (rec.status === 'stopped' || rec.status === 'paused') return;
    if (rec.timer) { this._timers.clear(rec.timer); rec.timer = null; }
    rec.nextRetryAt = this._now() + delay;
    rec.timer = this._timers.set(() => {
      rec.timer = null;
      if (rec.status === 'stopped' || rec.status === 'paused' || !this._listeners.has(rec.id)) return;
      this._start(rec, 'retry');
      this._emit('listener_resubscribed', rec, null, { attempt: rec.retryCount });
    }, delay);
  }

  _teardown(id, reason) {
    const rec = this._listeners.get(id);
    if (!rec) return;
    if (rec.timer) { this._timers.clear(rec.timer); rec.timer = null; }
    if (rec.unsub) { try { rec.unsub(); } catch (_) { /* سبق إلغاؤه */ } rec.unsub = null; }
    rec.unsubState = 'detached';
    rec.status = 'stopped';
    this._listeners.delete(id);
    for (let i = 0; i < this._queue.length; i++) {
      if (this._queue[i].id === id) { this._queue.splice(i, 1); break; }
    }
    this._history.unshift({
      id: rec.id, path: rec.path, fingerprint: rec.fingerprint, owner: rec.owner,
      reason: reason || 'manual',
      at: this._now(), lastError: rec.lastError, snapshotCount: rec.snapshotCount
    });
    if (this._history.length > this.historySize) this._history.length = this.historySize;
    this._emit('listener_stopped', rec, null, { reason: reason || 'manual' });
    this._pumpQueue();   // تحرر مقعد → اشترك أول الواقفين في الطابور
  }

  /** إزالة اشتراك من طابور الانتظار (لم يبدأ بعد) أو إيقافه إن بدأ */
  _removeQueued(id) {
    const rec = this._listeners.get(id);
    if (rec && rec.status === 'queued') {
      this._emit('listener_dequeued', null, null, { id: id, reason: 'cancelled-before-start' });
    }
    this._teardown(id, 'manual');
  }

  /** تحرر مقعد → ابدأ أقدم اشتراك في الطابور إن وُجد */
  _pumpQueue() {
    while (this._queue.length && this._activeCount() < this.maxListeners) {
      const rec = this._queue.shift();
      if (!rec || rec.status !== 'queued' || !this._listeners.has(rec.id)) continue;
      delete rec.queuedAt;
      this._emit('listener_dequeued', rec, null, { queueLength: this._queue.length });
      this._start(rec, 'queue-pump');
    }
  }

  /* --------------------------------------------------------------- */
  /* أوامر عامة                                                      */
  /* --------------------------------------------------------------- */

  unsubscribe(id) { this._teardown(id, 'manual'); }

  unsubscribeAll() {
    this._queue.length = 0;   // صفّ الطابور أولاً حتى لا يضخّ الإيقاف منتظرين جدداً
    const ids = Array.from(this._listeners.keys());
    for (let i = 0; i < ids.length; i++) this._teardown(ids[i], 'unsubscribeAll');
  }

  /** إلغاء كل المستمعات المرتبطة بالمستخدم (خروج / تبديل حساب) + تنقية طابورها */
  unsubscribeScoped() {
    // اشتراكات الحساب القديم التي لم تبدأ بعد لا يجوز أن تبدأ لاحقاً — تُنقّى أولاً
    for (let i = this._queue.length - 1; i >= 0; i--) {
      if (this._queue[i].scoped === 'user') this._queue.splice(i, 1);
    }
    const arr = Array.from(this._listeners.values());
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].scoped === 'user') this._teardown(arr[i].id, 'auth-signout');
    }
  }

  /** إلغاء المستمعات التي تبدأ معرفاتها ببادئة معينة */
  unsubscribeByPrefix(prefix) {
    for (let i = this._queue.length - 1; i >= 0; i--) {
      if (String(this._queue[i].id).indexOf(prefix) === 0) this._queue.splice(i, 1);
    }
    const arr = Array.from(this._listeners.keys());
    for (let i = 0; i < arr.length; i++) {
      if (String(arr[i]).indexOf(prefix) === 0) this._teardown(arr[i], 'prefix-' + prefix);
    }
  }

  /** إلغاء كل مستمعات مالك/ميزة معينة (دورة حياة على مستوى الصفحة أو الميزة) */
  teardownOwner(owner) {
    if (!owner) return 0;
    let n = 0;
    // انقِ طابور المالك أولاً حتى لا يبدأ الإيقاف اشتراكاتِ المالك نفسه المنتظرة
    for (let i = this._queue.length - 1; i >= 0; i--) {
      if (this._queue[i].owner === owner) {
        const rec = this._queue.splice(i, 1)[0];
        this._teardown(rec.id, 'owner-teardown:' + owner);
        n++;
      }
    }
    const arr = Array.from(this._listeners.values());
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].owner === owner) { this._teardown(arr[i].id, 'owner-teardown:' + owner); n++; }
    }
    return n;
  }

  /** إيقاف مؤقت لمستمع (يحرر مقعده من السقف ويحفظ موضعه وإعداداته) */
  pause(id) {
    const rec = this._listeners.get(id);
    if (!rec || rec.status === 'paused' || rec.status === 'stopped') return false;
    if (rec.timer) { this._timers.clear(rec.timer); rec.timer = null; }
    if (rec.unsub) { try { rec.unsub(); } catch (_) { /* سبق إلغاؤه */ } rec.unsub = null; }
    rec.unsubState = 'detached';
    rec.status = 'paused';
    this._emit('listener_paused', rec, null, null);
    this._pumpQueue();
    return true;
  }

  /** استئناف مستمع متوقف (يعود للطابور إن كانت المقاعد ممتلئة) */
  resume(id) {
    const rec = this._listeners.get(id);
    if (!rec || rec.status !== 'paused') return false;
    if (this._activeCount() >= this.maxListeners) {
      rec.status = 'queued';
      rec.queuedAt = this._now();
      this._queue.push(rec);
      this._emit('listener_queued', rec, null, { queueLength: this._queue.length });
      return true;
    }
    this._start(rec, 'resume');
    this._emit('listener_resumed', rec, null, null);
    return true;
  }

  /** إيقاف/استئناف كل مستمعات مالك معين (مثلاً عند مغادرة صفحة الدردشة) */
  pauseOwner(owner) {
    let n = 0;
    this._listeners.forEach((r) => { if (r.owner === owner && this.pause(r.id)) n++; });
    return n;
  }

  resumeOwner(owner) {
    let n = 0;
    this._listeners.forEach((r) => { if (r.owner === owner && this.resume(r.id)) n++; });
    return n;
  }

  /** إعادة بناء كل مستمع غير سليم — يُستدعى عند استعادة الشبكة أو استئناف التطبيق */
  resubscribeUnhealthy(reason) {
    let n = 0;
    const arr = Array.from(this._listeners.values());
    for (let i = 0; i < arr.length; i++) {
      const rec = arr[i];
      if (rec.status === 'retrying' || rec.status === 'failed' || rec.status === 'pending') {
        if (rec.timer) { this._timers.clear(rec.timer); rec.timer = null; }
        if (rec.unsub) { try { rec.unsub(); } catch (_) { /* سبق إلغاؤه */ } rec.unsub = null; }
        this._start(rec, 'resubscribe:' + (reason || 'unknown'));
        n++;
      }
    }
    if (n) this._emit('batch_resubscribe', null, null, { count: n, reason: reason || 'unknown' });
    return n;
  }

  /** نبضة المشرف الدورية: أعد أي مستمع حان وقت إعادة محاولته (فشل مؤقتات الخلفية المخنوقة) */
  heartbeat() {
    const now = this._now();
    let acted = 0;
    const arr = Array.from(this._listeners.values());
    for (let i = 0; i < arr.length; i++) {
      const rec = arr[i];
      if ((rec.status === 'retrying' || rec.status === 'failed') &&
          rec.nextRetryAt !== null && rec.nextRetryAt <= now && !rec.timer) {
        if (rec.unsub) { try { rec.unsub(); } catch (_) { /* سبق إلغاؤه */ } rec.unsub = null; }
        this._start(rec, 'heartbeat');
        acted++;
      }
    }
    if (acted) this._emit('heartbeat_resubscribe', null, null, { count: acted });
    return acted;
  }

  /** استعادة الشبكة */
  notifyNetworkChange(online) {
    if (!online) this._backendOnline = false;
    this._emit('network', null, null, { online: !!online });
    if (online) this.resubscribeUnhealthy('network-recovery');
  }

  /** عودة التطبيق للمقدمة / استئناف PWA */
  notifyAppResume() {
    this._emit('app_resume');
    this.resubscribeUnhealthy('app-resume');
  }

  /** تغيّر حالة المصادقة: null = خروج → أفلت مستمعات المستخدم فقط */
  notifyAuthChange(uid) {
    this._uid = uid || null;
    if (!uid) this.unsubscribeScoped();
    this._emit('auth', null, null, { uid: uid || null });
  }

  /** تحديث حالة الواجهة الخلفية (يستدعيها مستمع الكناري بقيمة حقيقية من البيانات الوصفية) */
  setBackendOnline(online) {
    const prev = this._backendOnline;
    this._backendOnline = !!online;
    this._emit('backend', null, null, { online: !!online, previous: prev });
    if (prev === false && online) this.resubscribeUnhealthy('backend-online');
  }

  /* --------------------------------------------------------------- */
  /* تعقب الكتابات                                                    */
  /* --------------------------------------------------------------- */

  /**
   * تتبّع عملية كتابة: تُسجَّل النتيجة الفعلية (نجاح/فشل، رمز الخطأ، العملية، قابلية الإعادة).
   * يعيد الوعد الأصلي كما هو دون تغيير سلوكه.
   */
  trackWrite(op, path, promise) {
    const startedAt = this._now();
    this._inFlightWrites++;
    let settled = false;
    const finish = (ok, err) => {
      if (settled) return;
      settled = true;
      this._inFlightWrites = Math.max(0, this._inFlightWrites - 1);
      const entry = {
        op: op, path: path, ok: !!ok,
        code: (err && err.code) || null,
        error: ok ? null : ((err && err.message) || String(err)),
        retryable: ok ? null : isRetryableCode(err && err.code),
        ms: this._now() - startedAt,
        at: this._now()
      };
      this._writeLog.unshift(entry);
      if (this._writeLog.length > this.writeLogSize) this._writeLog.length = this.writeLogSize;
      this._emit(ok ? 'write_ok' : 'write_failed', null, err, entry);
    };
    try {
      Promise.resolve(promise).then(
        function () { finish(true, null); },
        function (err) { finish(false, err); }
      );
    } catch (syncErr) {
      finish(false, syncErr);
      throw syncErr;
    }
    return promise;
  }

  /* --------------------------------------------------------------- */
  /* التشخيص — قيم حقيقية فقط، لا تلفيق                              */
  /* --------------------------------------------------------------- */

  refPath(ref) {
    try {
      if (!ref) return 'unknown';
      if (typeof ref.path === 'string') return ref.path;                       // DocumentReference
      if (ref._query && ref._query.path && typeof ref._query.path.canonicalString === 'function') {
        return ref._query.path.canonicalString();                              // Query
      }
    } catch (_) { /* لا تُخفِ الأخطاء عن التشخيص */ }
    return 'unknown';
  }

  getListeners() {
    return Array.from(this._listeners.values()).map((r) => this._publicRec(r));
  }

  getListener(id) {
    const r = this._listeners.get(id);
    return r ? this._publicRec(r) : null;
  }

  getQueue() {
    return this._queue.map((r) => this._publicRec(r));
  }

  _publicRec(r) {
    return {
      id: r.id, path: r.path, status: r.status, scoped: r.scoped,
      fingerprint: r.fingerprint, owner: r.owner, purpose: r.purpose, uid: r.uid,
      createdAt: r.createdAt, lastSnapshotAt: r.lastSnapshotAt,
      snapshotCount: r.snapshotCount, retryCount: r.retryCount,
      nextRetryAt: r.nextRetryAt, lastError: r.lastError, permanent: r.permanent,
      unsubState: r.unsubState,
      queuedAt: r.queuedAt || null
    };
  }

  getStats() {
    const byStatus = { pending: 0, active: 0, retrying: 0, failed: 0, stopped: 0, paused: 0, queued: 0 };
    let lastSnapshotAt = null;
    let totalRetries = 0;
    this._listeners.forEach((r) => {
      byStatus[r.status] = (byStatus[r.status] || 0) + 1;
      totalRetries += r.retryCount;
      if (r.lastSnapshotAt && (lastSnapshotAt === null || r.lastSnapshotAt > lastSnapshotAt)) {
        lastSnapshotAt = r.lastSnapshotAt;
      }
    });
    let failedWrites = 0;
    for (let i = 0; i < this._writeLog.length; i++) { if (!this._writeLog[i].ok) failedWrites++; }
    return {
      total: this._listeners.size,
      byStatus: byStatus,
      queueLength: this._queue.length,
      guardrailHits: this._guardrailHits,
      listenerCap: this.maxListeners,
      activeCount: this._activeCount(),
      totalRetryCount: totalRetries,
      backendOnline: this._backendOnline,
      lastSnapshotAt: lastSnapshotAt,
      lastWrite: this._writeLog[0] || null,
      failedWrites: failedWrites,
      inFlightWrites: this._inFlightWrites,
      startedAt: this._startedAt,
      now: this._now()
    };
  }

  getWriteLog() { return this._writeLog.slice(); }
  getHistory() { return this._history.slice(); }
  getEvents(n) { return this._events.slice(0, n || 20); }

  _emit(type, rec, err, extra) {
    const entry = {
      type: type, at: this._now(), listenerId: rec ? rec.id : null, path: rec ? rec.path : null
    };
    if (rec && rec.owner) entry.owner = rec.owner;
    if (err) entry.error = { code: (err && err.code) || 'unknown', message: (err && err.message) || String(err) };
    if (extra) entry.data = extra;
    this._events.unshift(entry);
    if (this._events.length > this.eventLogSize) this._events.length = this.eventLogSize;
    if (this._onEvent) {
      try { this._onEvent(type, rec, err, extra, entry); }
      catch (_) { /* مستمع أحداث معطل لا يوقف المدير */ }
    }
  }
}

RealtimeSyncManager.decideSyncDirection = decideSyncDirection;
RealtimeSyncManager.isRetryableCode = isRetryableCode;
RealtimeSyncManager.describeQuery = describeQuery;
RealtimeSyncManager.fingerprintOf = fingerprintOf;
RealtimeSyncManager.PERMANENT_CODES = PERMANENT_CODES.slice();
RealtimeSyncManager.DEFAULTS = DEFAULTS;

/* تصدير ESM (vitest / node) + ضبط global لجسر index.html */
if (typeof self !== 'undefined') {
  self.RealtimeSyncManager = RealtimeSyncManager;
  self.RealtimeSyncManagerLib = {
    RealtimeSyncManager, decideSyncDirection, isRetryableCode,
    describeQuery, fingerprintOf
  };
}

export { RealtimeSyncManager, decideSyncDirection, isRetryableCode, describeQuery, fingerprintOf };
export default { RealtimeSyncManager, decideSyncDirection, isRetryableCode, describeQuery, fingerprintOf };
