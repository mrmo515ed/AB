/* ==========================================================================
   Anime Black — Realtime Sync Manager (RTSM)
   --------------------------------------------------------------------------
   المدير المركزي الوحيد لكل مستمعات Firestore في التطبيق.
   - وحدة ESM مستقلة بلا اعتماديات، تُحمَّل كـ <script type="module" src="/rtm.js">
     قبل جسر Firebase في index.html (ترتيب تنفيذ وحدات الملف مضمون بالمواصفة)
   - تُستورد مباشرة في اختبارات vitest (مصدر حقيقة واحد قابل للاختبار)
   - كل مستمع يحصل على: معرف فريد، حالة، آخر لقطة ناجحة، آخر خطأ،
     عدد المحاولات، دالة إلغاء الاشتراك
   - خطأ المستمع → إعادة اتصال تلقائية بتراجع أُسّي + عشوائية (jitter)
   - الأخطاء الدائمة → حالة "failed" + إعادة محاولة بطيئة للأبد (لا فقدان صامت أبداً)
   - منع التكرار: نفس المسار/المعرف يستبدل المستمع القديم تلقائياً
   - إيقاف المستمعات المرتبطة بالمستخدم عند: الخروج / تبديل الحساب
   - تعقب الكتابات: كل عملية تُسجَّل بنتيجتها الفعلية ورمز خطأ Firebase وقابلية الإعادة
   ========================================================================== */

// رموز أخطاء Firestore التي لا تفيد معها إعادة المحاولة السريعة
const PERMANENT_CODES = [
  'permission-denied', 'unauthenticated', 'invalid-argument',
  'failed-precondition', 'unimplemented', 'not-found', 'out-of-range',
  'already-exists', 'cancelled', 'data-loss', 'unknown'
];

const DEFAULTS = {
  maxListeners: 64,             // سقف صارم لعدد المستمعات المفتوحة (يمنع التسريب غير المحدود)
  baseDelayMs: 1000,            // أول تأخير لإعادة المحاولة
  maxDelayMs: 60000,            // سقف التراجع الأسي
  maxFastRetries: 8,            // بعدها تتحول الحالة إلى failed مع استمرار الإعادة البطيئة
  failedRetryMs: 5 * 60 * 1000, // إعادة محاولة بطيئة للأخطار الدائمة (لا نترك مستمعاً يموت صامتاً)
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
    this._history = [];            // سجل إيقاف/استبدال المستمعات (حلقة محدودة)
    this._events = [];             // سجل أحداث عام (حلقة محدودة)
    this._onEvent = typeof opts.onEvent === 'function' ? opts.onEvent : null;

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
   * config: { id?, ref, path?, next(snapshot), error?(err), listenOptions?, scoped?, tags? }
   * scoped: 'user' للمستمعات المرتبطة بحساب (تُلغى تلقائياً عند الخروج/تبديل الحساب)
   * يعيد دالة إلغاء اشتراك idempotent.
   */
  subscribe(config) {
    if (!config || typeof config.next !== 'function') {
      throw new Error('RTSM.subscribe requires { ref, next }');
    }
    const id = config.id || ('lsn:' + (config.path || this.refPath(config.ref)));
    if (this._listeners.has(id)) {
      this._teardown(id, 'replaced-duplicate');    // منع المستمعات المكررة
    } else if (this._listeners.size >= this.maxListeners) {
      this._evictOldest(id);
    }
    const rec = {
      id: id,
      path: config.path || this.refPath(config.ref),
      status: 'pending',
      createdAt: this._now(),
      lastSnapshotAt: null,
      snapshotCount: 0,
      lastError: null,
      retryCount: 0,
      nextRetryAt: null,
      unsub: null,
      timer: null,
      next: config.next,
      errorCb: typeof config.error === 'function' ? config.error : null,
      ref: config.ref,
      listenOptions: config.listenOptions || null,
      scoped: config.scoped || null,
      tags: config.tags || null,
      permanent: false
    };
    this._listeners.set(id, rec);
    this._start(rec, 'initial');
    return () => this._teardown(id, 'manual');
  }

  _start(rec, reason) {
    rec.status = 'active';
    rec.permanent = false;
    const settle = (snap) => {
      if (rec.status === 'stopped') return;
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
    } catch (syncErr) {
      // فشل الإعداد نفسه (مرجع غير صالح…) → نعامله كخطأ مستمع مع إعادة محاولة
      this._onListenerError(rec, syncErr);
    }
  }

  _onListenerError(rec, err) {
    if (rec.status === 'stopped') return;
    const code = (err && err.code) || 'unknown';
    const message = (err && err.message) || String(err);
    rec.lastError = { code: code, message: message, at: this._now() };
    if (rec.unsub) { try { rec.unsub(); } catch (_) { /* سبق إلغاؤه */ } rec.unsub = null; }
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
    if (rec.status === 'stopped') return;
    if (rec.timer) { this._timers.clear(rec.timer); rec.timer = null; }
    rec.nextRetryAt = this._now() + delay;
    rec.timer = this._timers.set(() => {
      rec.timer = null;
      if (rec.status === 'stopped' || !this._listeners.has(rec.id)) return;
      this._start(rec, 'retry');
      this._emit('listener_resubscribed', rec, null, { attempt: rec.retryCount });
    }, delay);
  }

  _teardown(id, reason) {
    const rec = this._listeners.get(id);
    if (!rec) return;
    if (rec.timer) { this._timers.clear(rec.timer); rec.timer = null; }
    if (rec.unsub) { try { rec.unsub(); } catch (_) { /* سبق إلغاؤه */ } rec.unsub = null; }
    rec.status = 'stopped';
    this._listeners.delete(id);
    this._history.unshift({
      id: rec.id, path: rec.path, reason: reason || 'manual',
      at: this._now(), lastError: rec.lastError, snapshotCount: rec.snapshotCount
    });
    if (this._history.length > this.historySize) this._history.length = this.historySize;
    this._emit('listener_stopped', rec, null, { reason: reason || 'manual' });
  }

  /** عند بلوغ السقف: أوقف أقدم مستمع مرتبط بالمستخدم، وإلا أقدم مستمع (LRU) */
  _evictOldest(incomingId) {
    const arr = Array.from(this._listeners.values());
    let pool = arr.filter((r) => r.scoped === 'user');
    if (!pool.length) pool = arr;
    if (!pool.length) return;
    pool.sort((a, b) => a.createdAt - b.createdAt);
    this._emit('listener_evicted', pool[0], null, { incoming: incomingId });
    this._teardown(pool[0].id, 'evicted-cap');
  }

  /* --------------------------------------------------------------- */
  /* أوامر عامة                                                      */
  /* --------------------------------------------------------------- */

  unsubscribe(id) { this._teardown(id, 'manual'); }

  unsubscribeAll() {
    const ids = Array.from(this._listeners.keys());
    for (let i = 0; i < ids.length; i++) this._teardown(ids[i], 'unsubscribeAll');
  }

  /** إلغاء كل المستمعات المرتبطة بالمستخدم (خروج / تبديل حساب) */
  unsubscribeScoped() {
    const arr = Array.from(this._listeners.values());
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].scoped === 'user') this._teardown(arr[i].id, 'auth-signout');
    }
  }

  /** إلغاء المستمعات التي تبدأ معرفاتها ببادئة معينة */
  unsubscribeByPrefix(prefix) {
    const arr = Array.from(this._listeners.keys());
    for (let i = 0; i < arr.length; i++) {
      if (String(arr[i]).indexOf(prefix) === 0) this._teardown(arr[i], 'prefix-' + prefix);
    }
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

  _publicRec(r) {
    return {
      id: r.id, path: r.path, status: r.status, scoped: r.scoped,
      createdAt: r.createdAt, lastSnapshotAt: r.lastSnapshotAt,
      snapshotCount: r.snapshotCount, retryCount: r.retryCount,
      nextRetryAt: r.nextRetryAt, lastError: r.lastError, permanent: r.permanent
    };
  }

  getStats() {
    const byStatus = { pending: 0, active: 0, retrying: 0, failed: 0, stopped: 0 };
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
    const entry = { type: type, at: this._now(), listenerId: rec ? rec.id : null, path: rec ? rec.path : null };
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
RealtimeSyncManager.PERMANENT_CODES = PERMANENT_CODES.slice();
RealtimeSyncManager.DEFAULTS = DEFAULTS;

/* تصدير ESM (vitest / node) + ضبط global لجسر index.html */
if (typeof self !== 'undefined') {
  self.RealtimeSyncManager = RealtimeSyncManager;
  self.RealtimeSyncManagerLib = { RealtimeSyncManager, decideSyncDirection, isRetryableCode };
}

export { RealtimeSyncManager, decideSyncDirection, isRetryableCode };
export default { RealtimeSyncManager, decideSyncDirection, isRetryableCode };
