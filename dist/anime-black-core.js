//#region node_modules/@firebase/util/dist/index.esm2017.js
var e = function(e) {
	let t = [], n = 0;
	for (let r = 0; r < e.length; r++) {
		let i = e.charCodeAt(r);
		i < 128 ? t[n++] = i : i < 2048 ? (t[n++] = i >> 6 | 192, t[n++] = i & 63 | 128) : (i & 64512) == 55296 && r + 1 < e.length && (e.charCodeAt(r + 1) & 64512) == 56320 ? (i = 65536 + ((i & 1023) << 10) + (e.charCodeAt(++r) & 1023), t[n++] = i >> 18 | 240, t[n++] = i >> 12 & 63 | 128, t[n++] = i >> 6 & 63 | 128, t[n++] = i & 63 | 128) : (t[n++] = i >> 12 | 224, t[n++] = i >> 6 & 63 | 128, t[n++] = i & 63 | 128);
	}
	return t;
}, t = function(e) {
	let t = [], n = 0, r = 0;
	for (; n < e.length;) {
		let i = e[n++];
		if (i < 128) t[r++] = String.fromCharCode(i);
		else if (i > 191 && i < 224) {
			let a = e[n++];
			t[r++] = String.fromCharCode((i & 31) << 6 | a & 63);
		} else if (i > 239 && i < 365) {
			let a = e[n++], o = e[n++], s = e[n++], c = ((i & 7) << 18 | (a & 63) << 12 | (o & 63) << 6 | s & 63) - 65536;
			t[r++] = String.fromCharCode(55296 + (c >> 10)), t[r++] = String.fromCharCode(56320 + (c & 1023));
		} else {
			let a = e[n++], o = e[n++];
			t[r++] = String.fromCharCode((i & 15) << 12 | (a & 63) << 6 | o & 63);
		}
	}
	return t.join("");
}, n = {
	byteToCharMap_: null,
	charToByteMap_: null,
	byteToCharMapWebSafe_: null,
	charToByteMapWebSafe_: null,
	ENCODED_VALS_BASE: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
	get ENCODED_VALS() {
		return this.ENCODED_VALS_BASE + "+/=";
	},
	get ENCODED_VALS_WEBSAFE() {
		return this.ENCODED_VALS_BASE + "-_.";
	},
	HAS_NATIVE_SUPPORT: typeof atob == "function",
	encodeByteArray(e, t) {
		if (!Array.isArray(e)) throw Error("encodeByteArray takes an array as a parameter");
		this.init_();
		let n = t ? this.byteToCharMapWebSafe_ : this.byteToCharMap_, r = [];
		for (let t = 0; t < e.length; t += 3) {
			let i = e[t], a = t + 1 < e.length, o = a ? e[t + 1] : 0, s = t + 2 < e.length, c = s ? e[t + 2] : 0, l = i >> 2, u = (i & 3) << 4 | o >> 4, d = (o & 15) << 2 | c >> 6, f = c & 63;
			s || (f = 64, a || (d = 64)), r.push(n[l], n[u], n[d], n[f]);
		}
		return r.join("");
	},
	encodeString(t, n) {
		return this.HAS_NATIVE_SUPPORT && !n ? btoa(t) : this.encodeByteArray(e(t), n);
	},
	decodeString(e, n) {
		return this.HAS_NATIVE_SUPPORT && !n ? atob(e) : t(this.decodeStringToByteArray(e, n));
	},
	decodeStringToByteArray(e, t) {
		this.init_();
		let n = t ? this.charToByteMapWebSafe_ : this.charToByteMap_, i = [];
		for (let t = 0; t < e.length;) {
			let a = n[e.charAt(t++)], o = t < e.length ? n[e.charAt(t)] : 0;
			++t;
			let s = t < e.length ? n[e.charAt(t)] : 64;
			++t;
			let c = t < e.length ? n[e.charAt(t)] : 64;
			if (++t, a == null || o == null || s == null || c == null) throw new r();
			let l = a << 2 | o >> 4;
			if (i.push(l), s !== 64) {
				let e = o << 4 & 240 | s >> 2;
				if (i.push(e), c !== 64) {
					let e = s << 6 & 192 | c;
					i.push(e);
				}
			}
		}
		return i;
	},
	init_() {
		if (!this.byteToCharMap_) {
			this.byteToCharMap_ = {}, this.charToByteMap_ = {}, this.byteToCharMapWebSafe_ = {}, this.charToByteMapWebSafe_ = {};
			for (let e = 0; e < this.ENCODED_VALS.length; e++) this.byteToCharMap_[e] = this.ENCODED_VALS.charAt(e), this.charToByteMap_[this.byteToCharMap_[e]] = e, this.byteToCharMapWebSafe_[e] = this.ENCODED_VALS_WEBSAFE.charAt(e), this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[e]] = e, e >= this.ENCODED_VALS_BASE.length && (this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(e)] = e, this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(e)] = e);
		}
	}
}, r = class extends Error {
	constructor() {
		super(...arguments), this.name = "DecodeBase64StringError";
	}
}, i = function(t) {
	let r = e(t);
	return n.encodeByteArray(r, !0);
}, a = function(e) {
	return i(e).replace(/\./g, "");
}, o = function(e) {
	try {
		return n.decodeString(e, !0);
	} catch (e) {
		console.error("base64Decode failed: ", e);
	}
	return null;
};
function s() {
	if (typeof self < "u") return self;
	if (typeof window < "u") return window;
	if (typeof global < "u") return global;
	throw Error("Unable to locate global object.");
}
var c = () => s().__FIREBASE_DEFAULTS__, l = () => {
	if (typeof process > "u" || process.env === void 0) return;
	let e = process.env.__FIREBASE_DEFAULTS__;
	if (e) return JSON.parse(e);
}, u = () => {
	if (typeof document > "u") return;
	let e;
	try {
		e = document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/);
	} catch {
		return;
	}
	let t = e && o(e[1]);
	return t && JSON.parse(t);
}, d = () => {
	try {
		return c() || l() || u();
	} catch (e) {
		console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${e}`);
		return;
	}
}, f = (e) => d()?.emulatorHosts?.[e], p = (e) => {
	let t = f(e);
	if (!t) return;
	let n = t.lastIndexOf(":");
	if (n <= 0 || n + 1 === t.length) throw Error(`Invalid host ${t} with no separate hostname and port!`);
	let r = parseInt(t.substring(n + 1), 10);
	return t[0] === "[" ? [t.substring(1, n - 1), r] : [t.substring(0, n), r];
}, m = () => d()?.config, ee = (e) => d()?.[`_${e}`], te = class {
	constructor() {
		this.reject = () => {}, this.resolve = () => {}, this.promise = new Promise((e, t) => {
			this.resolve = e, this.reject = t;
		});
	}
	wrapCallback(e) {
		return (t, n) => {
			t ? this.reject(t) : this.resolve(n), typeof e == "function" && (this.promise.catch(() => {}), e.length === 1 ? e(t) : e(t, n));
		};
	}
};
function ne(e, t) {
	if (e.uid) throw Error("The \"uid\" field is no longer supported by mockUserToken. Please use \"sub\" instead for Firebase Auth User ID.");
	let n = {
		alg: "none",
		type: "JWT"
	}, r = t || "demo-project", i = e.iat || 0, o = e.sub || e.user_id;
	if (!o) throw Error("mockUserToken must contain 'sub' or 'user_id' field!");
	let s = Object.assign({
		iss: `https://securetoken.google.com/${r}`,
		aud: r,
		iat: i,
		exp: i + 3600,
		auth_time: i,
		sub: o,
		user_id: o,
		firebase: {
			sign_in_provider: "custom",
			identities: {}
		}
	}, e);
	return [
		a(JSON.stringify(n)),
		a(JSON.stringify(s)),
		""
	].join(".");
}
function h() {
	return typeof navigator < "u" && typeof navigator.userAgent == "string" ? navigator.userAgent : "";
}
function re() {
	return typeof window < "u" && !!(window.cordova || window.phonegap || window.PhoneGap) && /ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(h());
}
function ie() {
	let e = d()?.forceEnvironment;
	if (e === "node") return !0;
	if (e === "browser") return !1;
	try {
		return Object.prototype.toString.call(global.process) === "[object process]";
	} catch {
		return !1;
	}
}
function ae() {
	let e = typeof chrome == "object" ? chrome.runtime : typeof browser == "object" ? browser.runtime : void 0;
	return typeof e == "object" && e.id !== void 0;
}
function oe() {
	return typeof navigator == "object" && navigator.product === "ReactNative";
}
function se() {
	let e = h();
	return e.indexOf("MSIE ") >= 0 || e.indexOf("Trident/") >= 0;
}
function ce() {
	return !ie() && !!navigator.userAgent && navigator.userAgent.includes("Safari") && !navigator.userAgent.includes("Chrome");
}
function le() {
	try {
		return typeof indexedDB == "object";
	} catch {
		return !1;
	}
}
function ue() {
	return new Promise((e, t) => {
		try {
			let n = !0, r = "validate-browser-context-for-indexeddb-analytics-module", i = self.indexedDB.open(r);
			i.onsuccess = () => {
				i.result.close(), n || self.indexedDB.deleteDatabase(r), e(!0);
			}, i.onupgradeneeded = () => {
				n = !1;
			}, i.onerror = () => {
				t(i.error?.message || "");
			};
		} catch (e) {
			t(e);
		}
	});
}
function de() {
	return !(typeof navigator > "u" || !navigator.cookieEnabled);
}
var fe = "FirebaseError", pe = class e extends Error {
	constructor(t, n, r) {
		super(n), this.code = t, this.customData = r, this.name = fe, Object.setPrototypeOf(this, e.prototype), Error.captureStackTrace && Error.captureStackTrace(this, me.prototype.create);
	}
}, me = class {
	constructor(e, t, n) {
		this.service = e, this.serviceName = t, this.errors = n;
	}
	create(e, ...t) {
		let n = t[0] || {}, r = `${this.service}/${e}`, i = this.errors[e], a = i ? he(i, n) : "Error";
		return new pe(r, `${this.serviceName}: ${a} (${r}).`, n);
	}
};
function he(e, t) {
	return e.replace(ge, (e, n) => {
		let r = t[n];
		return r == null ? `<${n}?>` : String(r);
	});
}
var ge = /\{\$([^}]+)}/g;
function _e(e) {
	for (let t in e) if (Object.prototype.hasOwnProperty.call(e, t)) return !1;
	return !0;
}
function ve(e, t) {
	if (e === t) return !0;
	let n = Object.keys(e), r = Object.keys(t);
	for (let i of n) {
		if (!r.includes(i)) return !1;
		let n = e[i], a = t[i];
		if (ye(n) && ye(a)) {
			if (!ve(n, a)) return !1;
		} else if (n !== a) return !1;
	}
	for (let e of r) if (!n.includes(e)) return !1;
	return !0;
}
function ye(e) {
	return typeof e == "object" && !!e;
}
function be(e) {
	let t = [];
	for (let [n, r] of Object.entries(e)) Array.isArray(r) ? r.forEach((e) => {
		t.push(encodeURIComponent(n) + "=" + encodeURIComponent(e));
	}) : t.push(encodeURIComponent(n) + "=" + encodeURIComponent(r));
	return t.length ? "&" + t.join("&") : "";
}
function xe(e, t) {
	let n = new Se(e, t);
	return n.subscribe.bind(n);
}
var Se = class {
	constructor(e, t) {
		this.observers = [], this.unsubscribes = [], this.observerCount = 0, this.task = Promise.resolve(), this.finalized = !1, this.onNoObservers = t, this.task.then(() => {
			e(this);
		}).catch((e) => {
			this.error(e);
		});
	}
	next(e) {
		this.forEachObserver((t) => {
			t.next(e);
		});
	}
	error(e) {
		this.forEachObserver((t) => {
			t.error(e);
		}), this.close(e);
	}
	complete() {
		this.forEachObserver((e) => {
			e.complete();
		}), this.close();
	}
	subscribe(e, t, n) {
		let r;
		if (e === void 0 && t === void 0 && n === void 0) throw Error("Missing Observer.");
		r = Ce(e, [
			"next",
			"error",
			"complete"
		]) ? e : {
			next: e,
			error: t,
			complete: n
		}, r.next === void 0 && (r.next = g), r.error === void 0 && (r.error = g), r.complete === void 0 && (r.complete = g);
		let i = this.unsubscribeOne.bind(this, this.observers.length);
		return this.finalized && this.task.then(() => {
			try {
				this.finalError ? r.error(this.finalError) : r.complete();
			} catch {}
		}), this.observers.push(r), i;
	}
	unsubscribeOne(e) {
		this.observers !== void 0 && this.observers[e] !== void 0 && (delete this.observers[e], --this.observerCount, this.observerCount === 0 && this.onNoObservers !== void 0 && this.onNoObservers(this));
	}
	forEachObserver(e) {
		if (!this.finalized) for (let t = 0; t < this.observers.length; t++) this.sendOne(t, e);
	}
	sendOne(e, t) {
		this.task.then(() => {
			if (this.observers !== void 0 && this.observers[e] !== void 0) try {
				t(this.observers[e]);
			} catch (e) {
				typeof console < "u" && console.error && console.error(e);
			}
		});
	}
	close(e) {
		this.finalized || (this.finalized = !0, e !== void 0 && (this.finalError = e), this.task.then(() => {
			this.observers = void 0, this.onNoObservers = void 0;
		}));
	}
};
function Ce(e, t) {
	if (typeof e != "object" || !e) return !1;
	for (let n of t) if (n in e && typeof e[n] == "function") return !0;
	return !1;
}
function g() {}
function _(e) {
	return e && e._delegate ? e._delegate : e;
}
//#endregion
//#region node_modules/@firebase/component/dist/esm/index.esm2017.js
var we = class {
	constructor(e, t, n) {
		this.name = e, this.instanceFactory = t, this.type = n, this.multipleInstances = !1, this.serviceProps = {}, this.instantiationMode = "LAZY", this.onInstanceCreated = null;
	}
	setInstantiationMode(e) {
		return this.instantiationMode = e, this;
	}
	setMultipleInstances(e) {
		return this.multipleInstances = e, this;
	}
	setServiceProps(e) {
		return this.serviceProps = e, this;
	}
	setInstanceCreatedCallback(e) {
		return this.onInstanceCreated = e, this;
	}
}, Te = "[DEFAULT]", Ee = class {
	constructor(e, t) {
		this.name = e, this.container = t, this.component = null, this.instances = /* @__PURE__ */ new Map(), this.instancesDeferred = /* @__PURE__ */ new Map(), this.instancesOptions = /* @__PURE__ */ new Map(), this.onInitCallbacks = /* @__PURE__ */ new Map();
	}
	get(e) {
		let t = this.normalizeInstanceIdentifier(e);
		if (!this.instancesDeferred.has(t)) {
			let e = new te();
			if (this.instancesDeferred.set(t, e), this.isInitialized(t) || this.shouldAutoInitialize()) try {
				let n = this.getOrInitializeService({ instanceIdentifier: t });
				n && e.resolve(n);
			} catch {}
		}
		return this.instancesDeferred.get(t).promise;
	}
	getImmediate(e) {
		let t = this.normalizeInstanceIdentifier(e?.identifier), n = e?.optional ?? !1;
		if (this.isInitialized(t) || this.shouldAutoInitialize()) try {
			return this.getOrInitializeService({ instanceIdentifier: t });
		} catch (e) {
			if (n) return null;
			throw e;
		}
		if (n) return null;
		throw Error(`Service ${this.name} is not available`);
	}
	getComponent() {
		return this.component;
	}
	setComponent(e) {
		if (e.name !== this.name) throw Error(`Mismatching Component ${e.name} for Provider ${this.name}.`);
		if (this.component) throw Error(`Component for ${this.name} has already been provided`);
		if (this.component = e, this.shouldAutoInitialize()) {
			if (Oe(e)) try {
				this.getOrInitializeService({ instanceIdentifier: Te });
			} catch {}
			for (let [e, t] of this.instancesDeferred.entries()) {
				let n = this.normalizeInstanceIdentifier(e);
				try {
					let e = this.getOrInitializeService({ instanceIdentifier: n });
					t.resolve(e);
				} catch {}
			}
		}
	}
	clearInstance(e = Te) {
		this.instancesDeferred.delete(e), this.instancesOptions.delete(e), this.instances.delete(e);
	}
	async delete() {
		let e = Array.from(this.instances.values());
		await Promise.all([...e.filter((e) => "INTERNAL" in e).map((e) => e.INTERNAL.delete()), ...e.filter((e) => "_delete" in e).map((e) => e._delete())]);
	}
	isComponentSet() {
		return this.component != null;
	}
	isInitialized(e = Te) {
		return this.instances.has(e);
	}
	getOptions(e = Te) {
		return this.instancesOptions.get(e) || {};
	}
	initialize(e = {}) {
		let { options: t = {} } = e, n = this.normalizeInstanceIdentifier(e.instanceIdentifier);
		if (this.isInitialized(n)) throw Error(`${this.name}(${n}) has already been initialized`);
		if (!this.isComponentSet()) throw Error(`Component ${this.name} has not been registered yet`);
		let r = this.getOrInitializeService({
			instanceIdentifier: n,
			options: t
		});
		for (let [e, t] of this.instancesDeferred.entries()) n === this.normalizeInstanceIdentifier(e) && t.resolve(r);
		return r;
	}
	onInit(e, t) {
		let n = this.normalizeInstanceIdentifier(t), r = this.onInitCallbacks.get(n) ?? /* @__PURE__ */ new Set();
		r.add(e), this.onInitCallbacks.set(n, r);
		let i = this.instances.get(n);
		return i && e(i, n), () => {
			r.delete(e);
		};
	}
	invokeOnInitCallbacks(e, t) {
		let n = this.onInitCallbacks.get(t);
		if (n) for (let r of n) try {
			r(e, t);
		} catch {}
	}
	getOrInitializeService({ instanceIdentifier: e, options: t = {} }) {
		let n = this.instances.get(e);
		if (!n && this.component && (n = this.component.instanceFactory(this.container, {
			instanceIdentifier: De(e),
			options: t
		}), this.instances.set(e, n), this.instancesOptions.set(e, t), this.invokeOnInitCallbacks(n, e), this.component.onInstanceCreated)) try {
			this.component.onInstanceCreated(this.container, e, n);
		} catch {}
		return n || null;
	}
	normalizeInstanceIdentifier(e = Te) {
		return this.component ? this.component.multipleInstances ? e : Te : e;
	}
	shouldAutoInitialize() {
		return !!this.component && this.component.instantiationMode !== "EXPLICIT";
	}
};
function De(e) {
	return e === Te ? void 0 : e;
}
function Oe(e) {
	return e.instantiationMode === "EAGER";
}
var ke = class {
	constructor(e) {
		this.name = e, this.providers = /* @__PURE__ */ new Map();
	}
	addComponent(e) {
		let t = this.getProvider(e.name);
		if (t.isComponentSet()) throw Error(`Component ${e.name} has already been registered with ${this.name}`);
		t.setComponent(e);
	}
	addOrOverwriteComponent(e) {
		this.getProvider(e.name).isComponentSet() && this.providers.delete(e.name), this.addComponent(e);
	}
	getProvider(e) {
		if (this.providers.has(e)) return this.providers.get(e);
		let t = new Ee(e, this);
		return this.providers.set(e, t), t;
	}
	getProviders() {
		return Array.from(this.providers.values());
	}
}, Ae = [], v;
(function(e) {
	e[e.DEBUG = 0] = "DEBUG", e[e.VERBOSE = 1] = "VERBOSE", e[e.INFO = 2] = "INFO", e[e.WARN = 3] = "WARN", e[e.ERROR = 4] = "ERROR", e[e.SILENT = 5] = "SILENT";
})(v ||= {});
var y = {
	debug: v.DEBUG,
	verbose: v.VERBOSE,
	info: v.INFO,
	warn: v.WARN,
	error: v.ERROR,
	silent: v.SILENT
}, je = v.INFO, b = {
	[v.DEBUG]: "log",
	[v.VERBOSE]: "log",
	[v.INFO]: "info",
	[v.WARN]: "warn",
	[v.ERROR]: "error"
}, Me = (e, t, ...n) => {
	if (t < e.logLevel) return;
	let r = (/* @__PURE__ */ new Date()).toISOString(), i = b[t];
	if (i) console[i](`[${r}]  ${e.name}:`, ...n);
	else throw Error(`Attempted to log a message with an invalid logType (value: ${t})`);
}, Ne = class {
	constructor(e) {
		this.name = e, this._logLevel = je, this._logHandler = Me, this._userLogHandler = null, Ae.push(this);
	}
	get logLevel() {
		return this._logLevel;
	}
	set logLevel(e) {
		if (!(e in v)) throw TypeError(`Invalid value "${e}" assigned to \`logLevel\``);
		this._logLevel = e;
	}
	setLogLevel(e) {
		this._logLevel = typeof e == "string" ? y[e] : e;
	}
	get logHandler() {
		return this._logHandler;
	}
	set logHandler(e) {
		if (typeof e != "function") throw TypeError("Value assigned to `logHandler` must be a function");
		this._logHandler = e;
	}
	get userLogHandler() {
		return this._userLogHandler;
	}
	set userLogHandler(e) {
		this._userLogHandler = e;
	}
	debug(...e) {
		this._userLogHandler && this._userLogHandler(this, v.DEBUG, ...e), this._logHandler(this, v.DEBUG, ...e);
	}
	log(...e) {
		this._userLogHandler && this._userLogHandler(this, v.VERBOSE, ...e), this._logHandler(this, v.VERBOSE, ...e);
	}
	info(...e) {
		this._userLogHandler && this._userLogHandler(this, v.INFO, ...e), this._logHandler(this, v.INFO, ...e);
	}
	warn(...e) {
		this._userLogHandler && this._userLogHandler(this, v.WARN, ...e), this._logHandler(this, v.WARN, ...e);
	}
	error(...e) {
		this._userLogHandler && this._userLogHandler(this, v.ERROR, ...e), this._logHandler(this, v.ERROR, ...e);
	}
}, Pe = (e, t) => t.some((t) => e instanceof t), Fe, Ie;
function Le() {
	return Fe ||= [
		IDBDatabase,
		IDBObjectStore,
		IDBIndex,
		IDBCursor,
		IDBTransaction
	];
}
function Re() {
	return Ie ||= [
		IDBCursor.prototype.advance,
		IDBCursor.prototype.continue,
		IDBCursor.prototype.continuePrimaryKey
	];
}
var ze = /* @__PURE__ */ new WeakMap(), Be = /* @__PURE__ */ new WeakMap(), Ve = /* @__PURE__ */ new WeakMap(), He = /* @__PURE__ */ new WeakMap(), Ue = /* @__PURE__ */ new WeakMap();
function We(e) {
	let t = new Promise((t, n) => {
		let r = () => {
			e.removeEventListener("success", i), e.removeEventListener("error", a);
		}, i = () => {
			t(Xe(e.result)), r();
		}, a = () => {
			n(e.error), r();
		};
		e.addEventListener("success", i), e.addEventListener("error", a);
	});
	return t.then((t) => {
		t instanceof IDBCursor && ze.set(t, e);
	}).catch(() => {}), Ue.set(t, e), t;
}
function Ge(e) {
	if (Be.has(e)) return;
	let t = new Promise((t, n) => {
		let r = () => {
			e.removeEventListener("complete", i), e.removeEventListener("error", a), e.removeEventListener("abort", a);
		}, i = () => {
			t(), r();
		}, a = () => {
			n(e.error || new DOMException("AbortError", "AbortError")), r();
		};
		e.addEventListener("complete", i), e.addEventListener("error", a), e.addEventListener("abort", a);
	});
	Be.set(e, t);
}
var Ke = {
	get(e, t, n) {
		if (e instanceof IDBTransaction) {
			if (t === "done") return Be.get(e);
			if (t === "objectStoreNames") return e.objectStoreNames || Ve.get(e);
			if (t === "store") return n.objectStoreNames[1] ? void 0 : n.objectStore(n.objectStoreNames[0]);
		}
		return Xe(e[t]);
	},
	set(e, t, n) {
		return e[t] = n, !0;
	},
	has(e, t) {
		return e instanceof IDBTransaction && (t === "done" || t === "store") || t in e;
	}
};
function qe(e) {
	Ke = e(Ke);
}
function Je(e) {
	return e === IDBDatabase.prototype.transaction && !("objectStoreNames" in IDBTransaction.prototype) ? function(t, ...n) {
		let r = e.call(Ze(this), t, ...n);
		return Ve.set(r, t.sort ? t.sort() : [t]), Xe(r);
	} : Re().includes(e) ? function(...t) {
		return e.apply(Ze(this), t), Xe(ze.get(this));
	} : function(...t) {
		return Xe(e.apply(Ze(this), t));
	};
}
function Ye(e) {
	return typeof e == "function" ? Je(e) : (e instanceof IDBTransaction && Ge(e), Pe(e, Le()) ? new Proxy(e, Ke) : e);
}
function Xe(e) {
	if (e instanceof IDBRequest) return We(e);
	if (He.has(e)) return He.get(e);
	let t = Ye(e);
	return t !== e && (He.set(e, t), Ue.set(t, e)), t;
}
var Ze = (e) => Ue.get(e);
//#endregion
//#region node_modules/idb/build/index.js
function Qe(e, t, { blocked: n, upgrade: r, blocking: i, terminated: a } = {}) {
	let o = indexedDB.open(e, t), s = Xe(o);
	return r && o.addEventListener("upgradeneeded", (e) => {
		r(Xe(o.result), e.oldVersion, e.newVersion, Xe(o.transaction), e);
	}), n && o.addEventListener("blocked", (e) => n(e.oldVersion, e.newVersion, e)), s.then((e) => {
		a && e.addEventListener("close", () => a()), i && e.addEventListener("versionchange", (e) => i(e.oldVersion, e.newVersion, e));
	}).catch(() => {}), s;
}
function $e(e, { blocked: t } = {}) {
	let n = indexedDB.deleteDatabase(e);
	return t && n.addEventListener("blocked", (e) => t(e.oldVersion, e)), Xe(n).then(() => void 0);
}
var et = [
	"get",
	"getKey",
	"getAll",
	"getAllKeys",
	"count"
], tt = [
	"put",
	"add",
	"delete",
	"clear"
], nt = /* @__PURE__ */ new Map();
function rt(e, t) {
	if (!(e instanceof IDBDatabase && !(t in e) && typeof t == "string")) return;
	if (nt.get(t)) return nt.get(t);
	let n = t.replace(/FromIndex$/, ""), r = t !== n, i = tt.includes(n);
	if (!(n in (r ? IDBIndex : IDBObjectStore).prototype) || !(i || et.includes(n))) return;
	let a = async function(e, ...t) {
		let a = this.transaction(e, i ? "readwrite" : "readonly"), o = a.store;
		return r && (o = o.index(t.shift())), (await Promise.all([o[n](...t), i && a.done]))[0];
	};
	return nt.set(t, a), a;
}
qe((e) => ({
	...e,
	get: (t, n, r) => rt(t, n) || e.get(t, n, r),
	has: (t, n) => !!rt(t, n) || e.has(t, n)
}));
//#endregion
//#region node_modules/@firebase/app/dist/esm/index.esm2017.js
var it = class {
	constructor(e) {
		this.container = e;
	}
	getPlatformInfoString() {
		return this.container.getProviders().map((e) => {
			if (at(e)) {
				let t = e.getImmediate();
				return `${t.library}/${t.version}`;
			}
			return null;
		}).filter((e) => e).join(" ");
	}
};
function at(e) {
	return e.getComponent()?.type === "VERSION";
}
var ot = "@firebase/app", st = "0.10.0", ct = new Ne("@firebase/app"), lt = "@firebase/app-compat", ut = "@firebase/analytics-compat", dt = "@firebase/analytics", ft = "@firebase/app-check-compat", pt = "@firebase/app-check", mt = "@firebase/auth", ht = "@firebase/auth-compat", gt = "@firebase/database", _t = "@firebase/database-compat", vt = "@firebase/functions", yt = "@firebase/functions-compat", bt = "@firebase/installations", xt = "@firebase/installations-compat", St = "@firebase/messaging", Ct = "@firebase/messaging-compat", wt = "@firebase/performance", Tt = "@firebase/performance-compat", Et = "@firebase/remote-config", Dt = "@firebase/remote-config-compat", Ot = "@firebase/storage", kt = "@firebase/storage-compat", At = "@firebase/firestore", jt = "@firebase/firestore-compat", Mt = "firebase", Nt = "10.10.0", Pt = "[DEFAULT]", Ft = {
	[ot]: "fire-core",
	[lt]: "fire-core-compat",
	[dt]: "fire-analytics",
	[ut]: "fire-analytics-compat",
	[pt]: "fire-app-check",
	[ft]: "fire-app-check-compat",
	[mt]: "fire-auth",
	[ht]: "fire-auth-compat",
	[gt]: "fire-rtdb",
	[_t]: "fire-rtdb-compat",
	[vt]: "fire-fn",
	[yt]: "fire-fn-compat",
	[bt]: "fire-iid",
	[xt]: "fire-iid-compat",
	[St]: "fire-fcm",
	[Ct]: "fire-fcm-compat",
	[wt]: "fire-perf",
	[Tt]: "fire-perf-compat",
	[Et]: "fire-rc",
	[Dt]: "fire-rc-compat",
	[Ot]: "fire-gcs",
	[kt]: "fire-gcs-compat",
	[At]: "fire-fst",
	[jt]: "fire-fst-compat",
	"fire-js": "fire-js",
	[Mt]: "fire-js-all"
}, It = /* @__PURE__ */ new Map(), Lt = /* @__PURE__ */ new Map(), Rt = /* @__PURE__ */ new Map();
function zt(e, t) {
	try {
		e.container.addComponent(t);
	} catch (n) {
		ct.debug(`Component ${t.name} failed to register with FirebaseApp ${e.name}`, n);
	}
}
function Bt(e) {
	let t = e.name;
	if (Rt.has(t)) return ct.debug(`There were multiple attempts to register component ${t}.`), !1;
	Rt.set(t, e);
	for (let t of It.values()) zt(t, e);
	for (let t of Lt.values()) zt(t, e);
	return !0;
}
function Vt(e, t) {
	let n = e.container.getProvider("heartbeat").getImmediate({ optional: !0 });
	return n && n.triggerHeartbeat(), e.container.getProvider(t);
}
function Ht(e) {
	return e.settings !== void 0;
}
var Ut = new me("app", "Firebase", {
	"no-app": "No Firebase App '{$appName}' has been created - call initializeApp() first",
	"bad-app-name": "Illegal App name: '{$appName}'",
	"duplicate-app": "Firebase App named '{$appName}' already exists with different options or config",
	"app-deleted": "Firebase App named '{$appName}' already deleted",
	"server-app-deleted": "Firebase Server App has been deleted",
	"no-options": "Need to provide options, when not being deployed to hosting via source.",
	"invalid-app-argument": "firebase.{$appName}() takes either no argument or a Firebase App instance.",
	"invalid-log-argument": "First argument to `onLog` must be null or a function.",
	"idb-open": "Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.",
	"idb-get": "Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.",
	"idb-set": "Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.",
	"idb-delete": "Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.",
	"finalization-registry-not-supported": "FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.",
	"invalid-server-app-environment": "FirebaseServerApp is not for use in browser environments."
}), Wt = class {
	constructor(e, t, n) {
		this._isDeleted = !1, this._options = Object.assign({}, e), this._config = Object.assign({}, t), this._name = t.name, this._automaticDataCollectionEnabled = t.automaticDataCollectionEnabled, this._container = n, this.container.addComponent(new we("app", () => this, "PUBLIC"));
	}
	get automaticDataCollectionEnabled() {
		return this.checkDestroyed(), this._automaticDataCollectionEnabled;
	}
	set automaticDataCollectionEnabled(e) {
		this.checkDestroyed(), this._automaticDataCollectionEnabled = e;
	}
	get name() {
		return this.checkDestroyed(), this._name;
	}
	get options() {
		return this.checkDestroyed(), this._options;
	}
	get config() {
		return this.checkDestroyed(), this._config;
	}
	get container() {
		return this._container;
	}
	get isDeleted() {
		return this._isDeleted;
	}
	set isDeleted(e) {
		this._isDeleted = e;
	}
	checkDestroyed() {
		if (this.isDeleted) throw Ut.create("app-deleted", { appName: this._name });
	}
}, Gt = Nt;
function Kt(e, t = {}) {
	let n = e;
	typeof t != "object" && (t = { name: t });
	let r = Object.assign({
		name: Pt,
		automaticDataCollectionEnabled: !1
	}, t), i = r.name;
	if (typeof i != "string" || !i) throw Ut.create("bad-app-name", { appName: String(i) });
	if (n ||= m(), !n) throw Ut.create("no-options");
	let a = It.get(i);
	if (a) {
		if (ve(n, a.options) && ve(r, a.config)) return a;
		throw Ut.create("duplicate-app", { appName: i });
	}
	let o = new ke(i);
	for (let e of Rt.values()) o.addComponent(e);
	let s = new Wt(n, r, o);
	return It.set(i, s), s;
}
function qt(e = Pt) {
	let t = It.get(e);
	if (!t && e === "[DEFAULT]" && m()) return Kt();
	if (!t) throw Ut.create("no-app", { appName: e });
	return t;
}
function Jt() {
	return Array.from(It.values());
}
function x(e, t, n) {
	let r = Ft[e] ?? e;
	n && (r += `-${n}`);
	let i = r.match(/\s|\//), a = t.match(/\s|\//);
	if (i || a) {
		let e = [`Unable to register library "${r}" with version "${t}":`];
		i && e.push(`library name "${r}" contains illegal characters (whitespace or "/")`), i && a && e.push("and"), a && e.push(`version name "${t}" contains illegal characters (whitespace or "/")`), ct.warn(e.join(" "));
		return;
	}
	Bt(new we(`${r}-version`, () => ({
		library: r,
		version: t
	}), "VERSION"));
}
var Yt = "firebase-heartbeat-database", Xt = 1, Zt = "firebase-heartbeat-store", Qt = null;
function $t() {
	return Qt ||= Qe(Yt, Xt, { upgrade: (e, t) => {
		if (t === 0) try {
			e.createObjectStore(Zt);
		} catch (e) {
			console.warn(e);
		}
	} }).catch((e) => {
		throw Ut.create("idb-open", { originalErrorMessage: e.message });
	}), Qt;
}
async function en(e) {
	try {
		let t = (await $t()).transaction(Zt), n = await t.objectStore(Zt).get(nn(e));
		return await t.done, n;
	} catch (e) {
		if (e instanceof pe) ct.warn(e.message);
		else {
			let t = Ut.create("idb-get", { originalErrorMessage: e?.message });
			ct.warn(t.message);
		}
	}
}
async function tn(e, t) {
	try {
		let n = (await $t()).transaction(Zt, "readwrite");
		await n.objectStore(Zt).put(t, nn(e)), await n.done;
	} catch (e) {
		if (e instanceof pe) ct.warn(e.message);
		else {
			let t = Ut.create("idb-set", { originalErrorMessage: e?.message });
			ct.warn(t.message);
		}
	}
}
function nn(e) {
	return `${e.name}!${e.options.appId}`;
}
var rn = 1024, an = 2592e6, on = class {
	constructor(e) {
		this.container = e, this._heartbeatsCache = null;
		let t = this.container.getProvider("app").getImmediate();
		this._storage = new ln(t), this._heartbeatsCachePromise = this._storage.read().then((e) => (this._heartbeatsCache = e, e));
	}
	async triggerHeartbeat() {
		let e = this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(), t = sn();
		if (!(this._heartbeatsCache?.heartbeats == null && (this._heartbeatsCache = await this._heartbeatsCachePromise, this._heartbeatsCache?.heartbeats == null)) && !(this._heartbeatsCache.lastSentHeartbeatDate === t || this._heartbeatsCache.heartbeats.some((e) => e.date === t))) return this._heartbeatsCache.heartbeats.push({
			date: t,
			agent: e
		}), this._heartbeatsCache.heartbeats = this._heartbeatsCache.heartbeats.filter((e) => {
			let t = new Date(e.date).valueOf();
			return Date.now() - t <= an;
		}), this._storage.overwrite(this._heartbeatsCache);
	}
	async getHeartbeatsHeader() {
		if (this._heartbeatsCache === null && await this._heartbeatsCachePromise, this._heartbeatsCache?.heartbeats == null || this._heartbeatsCache.heartbeats.length === 0) return "";
		let e = sn(), { heartbeatsToSend: t, unsentEntries: n } = cn(this._heartbeatsCache.heartbeats), r = a(JSON.stringify({
			version: 2,
			heartbeats: t
		}));
		return this._heartbeatsCache.lastSentHeartbeatDate = e, n.length > 0 ? (this._heartbeatsCache.heartbeats = n, await this._storage.overwrite(this._heartbeatsCache)) : (this._heartbeatsCache.heartbeats = [], this._storage.overwrite(this._heartbeatsCache)), r;
	}
};
function sn() {
	return (/* @__PURE__ */ new Date()).toISOString().substring(0, 10);
}
function cn(e, t = rn) {
	let n = [], r = e.slice();
	for (let i of e) {
		let e = n.find((e) => e.agent === i.agent);
		if (!e) {
			if (n.push({
				agent: i.agent,
				dates: [i.date]
			}), un(n) > t) {
				n.pop();
				break;
			}
		} else if (e.dates.push(i.date), un(n) > t) {
			e.dates.pop();
			break;
		}
		r = r.slice(1);
	}
	return {
		heartbeatsToSend: n,
		unsentEntries: r
	};
}
var ln = class {
	constructor(e) {
		this.app = e, this._canUseIndexedDBPromise = this.runIndexedDBEnvironmentCheck();
	}
	async runIndexedDBEnvironmentCheck() {
		return le() ? ue().then(() => !0).catch(() => !1) : !1;
	}
	async read() {
		if (await this._canUseIndexedDBPromise) {
			let e = await en(this.app);
			return e?.heartbeats ? e : { heartbeats: [] };
		}
		return { heartbeats: [] };
	}
	async overwrite(e) {
		if (await this._canUseIndexedDBPromise) {
			let t = await this.read();
			return tn(this.app, {
				lastSentHeartbeatDate: e.lastSentHeartbeatDate ?? t.lastSentHeartbeatDate,
				heartbeats: e.heartbeats
			});
		}
	}
	async add(e) {
		if (await this._canUseIndexedDBPromise) {
			let t = await this.read();
			return tn(this.app, {
				lastSentHeartbeatDate: e.lastSentHeartbeatDate ?? t.lastSentHeartbeatDate,
				heartbeats: [...t.heartbeats, ...e.heartbeats]
			});
		}
	}
};
function un(e) {
	return a(JSON.stringify({
		version: 2,
		heartbeats: e
	})).length;
}
function dn(e) {
	Bt(new we("platform-logger", (e) => new it(e), "PRIVATE")), Bt(new we("heartbeat", (e) => new on(e), "PRIVATE")), x(ot, st, e), x(ot, st, "esm2017"), x("fire-js", "");
}
//#endregion
//#region node_modules/firebase/app/dist/esm/index.esm.js
dn(""), x("firebase", "10.10.0", "app");
//#endregion
//#region node_modules/tslib/tslib.es6.mjs
function fn(e, t) {
	var n = {};
	for (var r in e) Object.prototype.hasOwnProperty.call(e, r) && t.indexOf(r) < 0 && (n[r] = e[r]);
	if (e != null && typeof Object.getOwnPropertySymbols == "function") for (var i = 0, r = Object.getOwnPropertySymbols(e); i < r.length; i++) t.indexOf(r[i]) < 0 && Object.prototype.propertyIsEnumerable.call(e, r[i]) && (n[r[i]] = e[r[i]]);
	return n;
}
//#endregion
//#region node_modules/@firebase/auth/dist/esm2017/index-a8cf6c8f.js
function pn() {
	return { "dependent-sdk-initialized-before-auth": "Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK." };
}
var mn = pn, hn = new me("auth", "Firebase", pn()), gn = new Ne("@firebase/auth");
function _n(e, ...t) {
	gn.logLevel <= v.WARN && gn.warn(`Auth (${Gt}): ${e}`, ...t);
}
function vn(e, ...t) {
	gn.logLevel <= v.ERROR && gn.error(`Auth (${Gt}): ${e}`, ...t);
}
function yn(e, ...t) {
	throw Cn(e, ...t);
}
function bn(e, ...t) {
	return Cn(e, ...t);
}
function xn(e, t, n) {
	return new me("auth", "Firebase", Object.assign(Object.assign({}, mn()), { [t]: n })).create(t, { appName: e.name });
}
function Sn(e) {
	return xn(e, "operation-not-supported-in-this-environment", "Operations that alter the current user are not supported in conjunction with FirebaseServerApp");
}
function Cn(e, ...t) {
	if (typeof e != "string") {
		let n = t[0], r = [...t.slice(1)];
		return r[0] && (r[0].appName = e.name), e._errorFactory.create(n, ...r);
	}
	return hn.create(e, ...t);
}
function S(e, t, ...n) {
	if (!e) throw Cn(t, ...n);
}
function wn(e) {
	let t = "INTERNAL ASSERTION FAILED: " + e;
	throw vn(t), Error(t);
}
function Tn(e, t) {
	e || wn(t);
}
function En() {
	return typeof self < "u" && self.location?.href || "";
}
function Dn() {
	return On() === "http:" || On() === "https:";
}
function On() {
	return typeof self < "u" && self.location?.protocol || null;
}
function kn() {
	return typeof navigator < "u" && navigator && "onLine" in navigator && typeof navigator.onLine == "boolean" && (Dn() || ae() || "connection" in navigator) ? navigator.onLine : !0;
}
function An() {
	if (typeof navigator > "u") return null;
	let e = navigator;
	return e.languages && e.languages[0] || e.language || null;
}
var jn = class {
	constructor(e, t) {
		this.shortDelay = e, this.longDelay = t, Tn(t > e, "Short delay should be less than long delay!"), this.isMobile = re() || oe();
	}
	get() {
		return kn() ? this.isMobile ? this.longDelay : this.shortDelay : Math.min(5e3, this.shortDelay);
	}
};
function Mn(e, t) {
	Tn(e.emulator, "Emulator should always be set here");
	let { url: n } = e.emulator;
	return t ? `${n}${t.startsWith("/") ? t.slice(1) : t}` : n;
}
var Nn = class {
	static initialize(e, t, n) {
		this.fetchImpl = e, t && (this.headersImpl = t), n && (this.responseImpl = n);
	}
	static fetch() {
		if (this.fetchImpl) return this.fetchImpl;
		if (typeof self < "u" && "fetch" in self) return self.fetch;
		if (typeof globalThis < "u" && globalThis.fetch) return globalThis.fetch;
		if (typeof fetch < "u") return fetch;
		wn("Could not find fetch implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill");
	}
	static headers() {
		if (this.headersImpl) return this.headersImpl;
		if (typeof self < "u" && "Headers" in self) return self.Headers;
		if (typeof globalThis < "u" && globalThis.Headers) return globalThis.Headers;
		if (typeof Headers < "u") return Headers;
		wn("Could not find Headers implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill");
	}
	static response() {
		if (this.responseImpl) return this.responseImpl;
		if (typeof self < "u" && "Response" in self) return self.Response;
		if (typeof globalThis < "u" && globalThis.Response) return globalThis.Response;
		if (typeof Response < "u") return Response;
		wn("Could not find Response implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill");
	}
}, Pn = {
	CREDENTIAL_MISMATCH: "custom-token-mismatch",
	MISSING_CUSTOM_TOKEN: "internal-error",
	INVALID_IDENTIFIER: "invalid-email",
	MISSING_CONTINUE_URI: "internal-error",
	INVALID_PASSWORD: "wrong-password",
	MISSING_PASSWORD: "missing-password",
	INVALID_LOGIN_CREDENTIALS: "invalid-credential",
	EMAIL_EXISTS: "email-already-in-use",
	PASSWORD_LOGIN_DISABLED: "operation-not-allowed",
	INVALID_IDP_RESPONSE: "invalid-credential",
	INVALID_PENDING_TOKEN: "invalid-credential",
	FEDERATED_USER_ID_ALREADY_LINKED: "credential-already-in-use",
	MISSING_REQ_TYPE: "internal-error",
	EMAIL_NOT_FOUND: "user-not-found",
	RESET_PASSWORD_EXCEED_LIMIT: "too-many-requests",
	EXPIRED_OOB_CODE: "expired-action-code",
	INVALID_OOB_CODE: "invalid-action-code",
	MISSING_OOB_CODE: "internal-error",
	CREDENTIAL_TOO_OLD_LOGIN_AGAIN: "requires-recent-login",
	INVALID_ID_TOKEN: "invalid-user-token",
	TOKEN_EXPIRED: "user-token-expired",
	USER_NOT_FOUND: "user-token-expired",
	TOO_MANY_ATTEMPTS_TRY_LATER: "too-many-requests",
	PASSWORD_DOES_NOT_MEET_REQUIREMENTS: "password-does-not-meet-requirements",
	INVALID_CODE: "invalid-verification-code",
	INVALID_SESSION_INFO: "invalid-verification-id",
	INVALID_TEMPORARY_PROOF: "invalid-credential",
	MISSING_SESSION_INFO: "missing-verification-id",
	SESSION_EXPIRED: "code-expired",
	MISSING_ANDROID_PACKAGE_NAME: "missing-android-pkg-name",
	UNAUTHORIZED_DOMAIN: "unauthorized-continue-uri",
	INVALID_OAUTH_CLIENT_ID: "invalid-oauth-client-id",
	ADMIN_ONLY_OPERATION: "admin-restricted-operation",
	INVALID_MFA_PENDING_CREDENTIAL: "invalid-multi-factor-session",
	MFA_ENROLLMENT_NOT_FOUND: "multi-factor-info-not-found",
	MISSING_MFA_ENROLLMENT_ID: "missing-multi-factor-info",
	MISSING_MFA_PENDING_CREDENTIAL: "missing-multi-factor-session",
	SECOND_FACTOR_EXISTS: "second-factor-already-in-use",
	SECOND_FACTOR_LIMIT_EXCEEDED: "maximum-second-factor-count-exceeded",
	BLOCKING_FUNCTION_ERROR_RESPONSE: "internal-error",
	RECAPTCHA_NOT_ENABLED: "recaptcha-not-enabled",
	MISSING_RECAPTCHA_TOKEN: "missing-recaptcha-token",
	INVALID_RECAPTCHA_TOKEN: "invalid-recaptcha-token",
	INVALID_RECAPTCHA_ACTION: "invalid-recaptcha-action",
	MISSING_CLIENT_TYPE: "missing-client-type",
	MISSING_RECAPTCHA_VERSION: "missing-recaptcha-version",
	INVALID_RECAPTCHA_VERSION: "invalid-recaptcha-version",
	INVALID_REQ_TYPE: "invalid-req-type"
}, Fn = new jn(3e4, 6e4);
function In(e, t) {
	return e.tenantId && !t.tenantId ? Object.assign(Object.assign({}, t), { tenantId: e.tenantId }) : t;
}
async function Ln(e, t, n, r, i = {}) {
	return Rn(e, i, async () => {
		let i = {}, a = {};
		r && (t === "GET" ? a = r : i = { body: JSON.stringify(r) });
		let o = be(Object.assign({ key: e.config.apiKey }, a)).slice(1), s = await e._getAdditionalHeaders();
		return s["Content-Type"] = "application/json", e.languageCode && (s["X-Firebase-Locale"] = e.languageCode), Nn.fetch()(Bn(e, e.config.apiHost, n, o), Object.assign({
			method: t,
			headers: s,
			referrerPolicy: "no-referrer"
		}, i));
	});
}
async function Rn(e, t, n) {
	e._canInitEmulator = !1;
	let r = Object.assign(Object.assign({}, Pn), t);
	try {
		let t = new Vn(e), i = await Promise.race([n(), t.promise]);
		t.clearNetworkTimeout();
		let a = await i.json();
		if ("needConfirmation" in a) throw Hn(e, "account-exists-with-different-credential", a);
		if (i.ok && !("errorMessage" in a)) return a;
		{
			let [t, n] = (i.ok ? a.errorMessage : a.error.message).split(" : ");
			if (t === "FEDERATED_USER_ID_ALREADY_LINKED") throw Hn(e, "credential-already-in-use", a);
			if (t === "EMAIL_EXISTS") throw Hn(e, "email-already-in-use", a);
			if (t === "USER_DISABLED") throw Hn(e, "user-disabled", a);
			let o = r[t] || t.toLowerCase().replace(/[_\s]+/g, "-");
			if (n) throw xn(e, o, n);
			yn(e, o);
		}
	} catch (t) {
		if (t instanceof pe) throw t;
		yn(e, "network-request-failed", { message: String(t) });
	}
}
async function zn(e, t, n, r, i = {}) {
	let a = await Ln(e, t, n, r, i);
	return "mfaPendingCredential" in a && yn(e, "multi-factor-auth-required", { _serverResponse: a }), a;
}
function Bn(e, t, n, r) {
	let i = `${t}${n}?${r}`;
	return e.config.emulator ? Mn(e.config, i) : `${e.config.apiScheme}://${i}`;
}
var Vn = class {
	constructor(e) {
		this.auth = e, this.timer = null, this.promise = new Promise((e, t) => {
			this.timer = setTimeout(() => t(bn(this.auth, "network-request-failed")), Fn.get());
		});
	}
	clearNetworkTimeout() {
		clearTimeout(this.timer);
	}
};
function Hn(e, t, n) {
	let r = { appName: e.name };
	n.email && (r.email = n.email), n.phoneNumber && (r.phoneNumber = n.phoneNumber);
	let i = bn(e, t, r);
	return i.customData._tokenResponse = n, i;
}
async function Un(e, t) {
	return Ln(e, "POST", "/v1/accounts:delete", t);
}
async function Wn(e, t) {
	return Ln(e, "POST", "/v1/accounts:lookup", t);
}
function Gn(e) {
	if (e) try {
		let t = new Date(Number(e));
		if (!isNaN(t.getTime())) return t.toUTCString();
	} catch {}
}
async function Kn(e, t = !1) {
	let n = _(e), r = await n.getIdToken(t), i = Jn(r);
	S(i && i.exp && i.auth_time && i.iat, n.auth, "internal-error");
	let a = typeof i.firebase == "object" ? i.firebase : void 0, o = a?.sign_in_provider;
	return {
		claims: i,
		token: r,
		authTime: Gn(qn(i.auth_time)),
		issuedAtTime: Gn(qn(i.iat)),
		expirationTime: Gn(qn(i.exp)),
		signInProvider: o || null,
		signInSecondFactor: a?.sign_in_second_factor || null
	};
}
function qn(e) {
	return Number(e) * 1e3;
}
function Jn(e) {
	let [t, n, r] = e.split(".");
	if (t === void 0 || n === void 0 || r === void 0) return vn("JWT malformed, contained fewer than 3 sections"), null;
	try {
		let e = o(n);
		return e ? JSON.parse(e) : (vn("Failed to decode base64 JWT payload"), null);
	} catch (e) {
		return vn("Caught error parsing JWT payload as JSON", e?.toString()), null;
	}
}
function Yn(e) {
	let t = Jn(e);
	return S(t, "internal-error"), S(t.exp !== void 0, "internal-error"), S(t.iat !== void 0, "internal-error"), Number(t.exp) - Number(t.iat);
}
async function Xn(e, t, n = !1) {
	if (n) return t;
	try {
		return await t;
	} catch (t) {
		throw t instanceof pe && Zn(t) && e.auth.currentUser === e && await e.auth.signOut(), t;
	}
}
function Zn({ code: e }) {
	return e === "auth/user-disabled" || e === "auth/user-token-expired";
}
var Qn = class {
	constructor(e) {
		this.user = e, this.isRunning = !1, this.timerId = null, this.errorBackoff = 3e4;
	}
	_start() {
		this.isRunning || (this.isRunning = !0, this.schedule());
	}
	_stop() {
		this.isRunning && (this.isRunning = !1, this.timerId !== null && clearTimeout(this.timerId));
	}
	getInterval(e) {
		if (e) {
			let e = this.errorBackoff;
			return this.errorBackoff = Math.min(this.errorBackoff * 2, 96e4), e;
		}
		{
			this.errorBackoff = 3e4;
			let e = (this.user.stsTokenManager.expirationTime ?? 0) - Date.now() - 3e5;
			return Math.max(0, e);
		}
	}
	schedule(e = !1) {
		if (!this.isRunning) return;
		let t = this.getInterval(e);
		this.timerId = setTimeout(async () => {
			await this.iteration();
		}, t);
	}
	async iteration() {
		try {
			await this.user.getIdToken(!0);
		} catch (e) {
			e?.code === "auth/network-request-failed" && this.schedule(!0);
			return;
		}
		this.schedule();
	}
}, $n = class {
	constructor(e, t) {
		this.createdAt = e, this.lastLoginAt = t, this._initializeTime();
	}
	_initializeTime() {
		this.lastSignInTime = Gn(this.lastLoginAt), this.creationTime = Gn(this.createdAt);
	}
	_copy(e) {
		this.createdAt = e.createdAt, this.lastLoginAt = e.lastLoginAt, this._initializeTime();
	}
	toJSON() {
		return {
			createdAt: this.createdAt,
			lastLoginAt: this.lastLoginAt
		};
	}
};
async function er(e) {
	let t = e.auth, n = await Xn(e, Wn(t, { idToken: await e.getIdToken() }));
	S(n?.users.length, t, "internal-error");
	let r = n.users[0];
	e._notifyReloadListener(r);
	let i = r.providerUserInfo?.length ? rr(r.providerUserInfo) : [], a = nr(e.providerData, i), o = e.isAnonymous, s = !(e.email && r.passwordHash) && !a?.length, c = o ? s : !1, l = {
		uid: r.localId,
		displayName: r.displayName || null,
		photoURL: r.photoUrl || null,
		email: r.email || null,
		emailVerified: r.emailVerified || !1,
		phoneNumber: r.phoneNumber || null,
		tenantId: r.tenantId || null,
		providerData: a,
		metadata: new $n(r.createdAt, r.lastLoginAt),
		isAnonymous: c
	};
	Object.assign(e, l);
}
async function tr(e) {
	let t = _(e);
	await er(t), await t.auth._persistUserIfCurrent(t), t.auth._notifyListenersIfCurrent(t);
}
function nr(e, t) {
	return [...e.filter((e) => !t.some((t) => t.providerId === e.providerId)), ...t];
}
function rr(e) {
	return e.map((e) => {
		var { providerId: t } = e, n = fn(e, ["providerId"]);
		return {
			providerId: t,
			uid: n.rawId || "",
			displayName: n.displayName || null,
			email: n.email || null,
			phoneNumber: n.phoneNumber || null,
			photoURL: n.photoUrl || null
		};
	});
}
async function ir(e, t) {
	let n = await Rn(e, {}, async () => {
		let n = be({
			grant_type: "refresh_token",
			refresh_token: t
		}).slice(1), { tokenApiHost: r, apiKey: i } = e.config, a = Bn(e, r, "/v1/token", `key=${i}`), o = await e._getAdditionalHeaders();
		return o["Content-Type"] = "application/x-www-form-urlencoded", Nn.fetch()(a, {
			method: "POST",
			headers: o,
			body: n
		});
	});
	return {
		accessToken: n.access_token,
		expiresIn: n.expires_in,
		refreshToken: n.refresh_token
	};
}
async function ar(e, t) {
	return Ln(e, "POST", "/v2/accounts:revokeToken", In(e, t));
}
var or = class e {
	constructor() {
		this.refreshToken = null, this.accessToken = null, this.expirationTime = null;
	}
	get isExpired() {
		return !this.expirationTime || Date.now() > this.expirationTime - 3e4;
	}
	updateFromServerResponse(e) {
		S(e.idToken, "internal-error"), S(e.idToken !== void 0, "internal-error"), S(e.refreshToken !== void 0, "internal-error");
		let t = "expiresIn" in e && e.expiresIn !== void 0 ? Number(e.expiresIn) : Yn(e.idToken);
		this.updateTokensAndExpiration(e.idToken, e.refreshToken, t);
	}
	updateFromIdToken(e) {
		S(e.length !== 0, "internal-error");
		let t = Yn(e);
		this.updateTokensAndExpiration(e, null, t);
	}
	async getToken(e, t = !1) {
		return !t && this.accessToken && !this.isExpired ? this.accessToken : (S(this.refreshToken, e, "user-token-expired"), this.refreshToken ? (await this.refresh(e, this.refreshToken), this.accessToken) : null);
	}
	clearRefreshToken() {
		this.refreshToken = null;
	}
	async refresh(e, t) {
		let { accessToken: n, refreshToken: r, expiresIn: i } = await ir(e, t);
		this.updateTokensAndExpiration(n, r, Number(i));
	}
	updateTokensAndExpiration(e, t, n) {
		this.refreshToken = t || null, this.accessToken = e || null, this.expirationTime = Date.now() + n * 1e3;
	}
	static fromJSON(t, n) {
		let { refreshToken: r, accessToken: i, expirationTime: a } = n, o = new e();
		return r && (S(typeof r == "string", "internal-error", { appName: t }), o.refreshToken = r), i && (S(typeof i == "string", "internal-error", { appName: t }), o.accessToken = i), a && (S(typeof a == "number", "internal-error", { appName: t }), o.expirationTime = a), o;
	}
	toJSON() {
		return {
			refreshToken: this.refreshToken,
			accessToken: this.accessToken,
			expirationTime: this.expirationTime
		};
	}
	_assign(e) {
		this.accessToken = e.accessToken, this.refreshToken = e.refreshToken, this.expirationTime = e.expirationTime;
	}
	_clone() {
		return Object.assign(new e(), this.toJSON());
	}
	_performRefresh() {
		return wn("not implemented");
	}
};
function sr(e, t) {
	S(typeof e == "string" || e === void 0, "internal-error", { appName: t });
}
var cr = class e {
	constructor(e) {
		var { uid: t, auth: n, stsTokenManager: r } = e, i = fn(e, [
			"uid",
			"auth",
			"stsTokenManager"
		]);
		this.providerId = "firebase", this.proactiveRefresh = new Qn(this), this.reloadUserInfo = null, this.reloadListener = null, this.uid = t, this.auth = n, this.stsTokenManager = r, this.accessToken = r.accessToken, this.displayName = i.displayName || null, this.email = i.email || null, this.emailVerified = i.emailVerified || !1, this.phoneNumber = i.phoneNumber || null, this.photoURL = i.photoURL || null, this.isAnonymous = i.isAnonymous || !1, this.tenantId = i.tenantId || null, this.providerData = i.providerData ? [...i.providerData] : [], this.metadata = new $n(i.createdAt || void 0, i.lastLoginAt || void 0);
	}
	async getIdToken(e) {
		let t = await Xn(this, this.stsTokenManager.getToken(this.auth, e));
		return S(t, this.auth, "internal-error"), this.accessToken !== t && (this.accessToken = t, await this.auth._persistUserIfCurrent(this), this.auth._notifyListenersIfCurrent(this)), t;
	}
	getIdTokenResult(e) {
		return Kn(this, e);
	}
	reload() {
		return tr(this);
	}
	_assign(e) {
		this !== e && (S(this.uid === e.uid, this.auth, "internal-error"), this.displayName = e.displayName, this.photoURL = e.photoURL, this.email = e.email, this.emailVerified = e.emailVerified, this.phoneNumber = e.phoneNumber, this.isAnonymous = e.isAnonymous, this.tenantId = e.tenantId, this.providerData = e.providerData.map((e) => Object.assign({}, e)), this.metadata._copy(e.metadata), this.stsTokenManager._assign(e.stsTokenManager));
	}
	_clone(t) {
		let n = new e(Object.assign(Object.assign({}, this), {
			auth: t,
			stsTokenManager: this.stsTokenManager._clone()
		}));
		return n.metadata._copy(this.metadata), n;
	}
	_onReload(e) {
		S(!this.reloadListener, this.auth, "internal-error"), this.reloadListener = e, this.reloadUserInfo &&= (this._notifyReloadListener(this.reloadUserInfo), null);
	}
	_notifyReloadListener(e) {
		this.reloadListener ? this.reloadListener(e) : this.reloadUserInfo = e;
	}
	_startProactiveRefresh() {
		this.proactiveRefresh._start();
	}
	_stopProactiveRefresh() {
		this.proactiveRefresh._stop();
	}
	async _updateTokensIfNecessary(e, t = !1) {
		let n = !1;
		e.idToken && e.idToken !== this.stsTokenManager.accessToken && (this.stsTokenManager.updateFromServerResponse(e), n = !0), t && await er(this), await this.auth._persistUserIfCurrent(this), n && this.auth._notifyListenersIfCurrent(this);
	}
	async delete() {
		if (Ht(this.auth.app)) return Promise.reject(Sn(this.auth));
		let e = await this.getIdToken();
		return await Xn(this, Un(this.auth, { idToken: e })), this.stsTokenManager.clearRefreshToken(), this.auth.signOut();
	}
	toJSON() {
		return Object.assign(Object.assign({
			uid: this.uid,
			email: this.email || void 0,
			emailVerified: this.emailVerified,
			displayName: this.displayName || void 0,
			isAnonymous: this.isAnonymous,
			photoURL: this.photoURL || void 0,
			phoneNumber: this.phoneNumber || void 0,
			tenantId: this.tenantId || void 0,
			providerData: this.providerData.map((e) => Object.assign({}, e)),
			stsTokenManager: this.stsTokenManager.toJSON(),
			_redirectEventId: this._redirectEventId
		}, this.metadata.toJSON()), {
			apiKey: this.auth.config.apiKey,
			appName: this.auth.name
		});
	}
	get refreshToken() {
		return this.stsTokenManager.refreshToken || "";
	}
	static _fromJSON(t, n) {
		let r = n.displayName ?? void 0, i = n.email ?? void 0, a = n.phoneNumber ?? void 0, o = n.photoURL ?? void 0, s = n.tenantId ?? void 0, c = n._redirectEventId ?? void 0, l = n.createdAt ?? void 0, u = n.lastLoginAt ?? void 0, { uid: d, emailVerified: f, isAnonymous: p, providerData: m, stsTokenManager: ee } = n;
		S(d && ee, t, "internal-error");
		let te = or.fromJSON(this.name, ee);
		S(typeof d == "string", t, "internal-error"), sr(r, t.name), sr(i, t.name), S(typeof f == "boolean", t, "internal-error"), S(typeof p == "boolean", t, "internal-error"), sr(a, t.name), sr(o, t.name), sr(s, t.name), sr(c, t.name), sr(l, t.name), sr(u, t.name);
		let ne = new e({
			uid: d,
			auth: t,
			email: i,
			emailVerified: f,
			displayName: r,
			isAnonymous: p,
			photoURL: o,
			phoneNumber: a,
			tenantId: s,
			stsTokenManager: te,
			createdAt: l,
			lastLoginAt: u
		});
		return m && Array.isArray(m) && (ne.providerData = m.map((e) => Object.assign({}, e))), c && (ne._redirectEventId = c), ne;
	}
	static async _fromIdTokenResponse(t, n, r = !1) {
		let i = new or();
		i.updateFromServerResponse(n);
		let a = new e({
			uid: n.localId,
			auth: t,
			stsTokenManager: i,
			isAnonymous: r
		});
		return await er(a), a;
	}
	static async _fromGetAccountInfoResponse(t, n, r) {
		let i = n.users[0];
		S(i.localId !== void 0, "internal-error");
		let a = i.providerUserInfo === void 0 ? [] : rr(i.providerUserInfo), o = !(i.email && i.passwordHash) && !a?.length, s = new or();
		s.updateFromIdToken(r);
		let c = new e({
			uid: i.localId,
			auth: t,
			stsTokenManager: s,
			isAnonymous: o
		}), l = {
			uid: i.localId,
			displayName: i.displayName || null,
			photoURL: i.photoUrl || null,
			email: i.email || null,
			emailVerified: i.emailVerified || !1,
			phoneNumber: i.phoneNumber || null,
			tenantId: i.tenantId || null,
			providerData: a,
			metadata: new $n(i.createdAt, i.lastLoginAt),
			isAnonymous: !(i.email && i.passwordHash) && !a?.length
		};
		return Object.assign(c, l), c;
	}
}, lr = /* @__PURE__ */ new Map();
function ur(e) {
	Tn(e instanceof Function, "Expected a class definition");
	let t = lr.get(e);
	return t ? (Tn(t instanceof e, "Instance stored in cache mismatched with class"), t) : (t = new e(), lr.set(e, t), t);
}
var dr = class {
	constructor() {
		this.type = "NONE", this.storage = {};
	}
	async _isAvailable() {
		return !0;
	}
	async _set(e, t) {
		this.storage[e] = t;
	}
	async _get(e) {
		let t = this.storage[e];
		return t === void 0 ? null : t;
	}
	async _remove(e) {
		delete this.storage[e];
	}
	_addListener(e, t) {}
	_removeListener(e, t) {}
};
dr.type = "NONE";
var fr = dr;
function pr(e, t, n) {
	return `firebase:${e}:${t}:${n}`;
}
var mr = class e {
	constructor(e, t, n) {
		this.persistence = e, this.auth = t, this.userKey = n;
		let { config: r, name: i } = this.auth;
		this.fullUserKey = pr(this.userKey, r.apiKey, i), this.fullPersistenceKey = pr("persistence", r.apiKey, i), this.boundEventHandler = t._onStorageEvent.bind(t), this.persistence._addListener(this.fullUserKey, this.boundEventHandler);
	}
	setCurrentUser(e) {
		return this.persistence._set(this.fullUserKey, e.toJSON());
	}
	async getCurrentUser() {
		let e = await this.persistence._get(this.fullUserKey);
		return e ? cr._fromJSON(this.auth, e) : null;
	}
	removeCurrentUser() {
		return this.persistence._remove(this.fullUserKey);
	}
	savePersistenceForRedirect() {
		return this.persistence._set(this.fullPersistenceKey, this.persistence.type);
	}
	async setPersistence(e) {
		if (this.persistence === e) return;
		let t = await this.getCurrentUser();
		if (await this.removeCurrentUser(), this.persistence = e, t) return this.setCurrentUser(t);
	}
	delete() {
		this.persistence._removeListener(this.fullUserKey, this.boundEventHandler);
	}
	static async create(t, n, r = "authUser") {
		if (!n.length) return new e(ur(fr), t, r);
		let i = (await Promise.all(n.map(async (e) => {
			if (await e._isAvailable()) return e;
		}))).filter((e) => e), a = i[0] || ur(fr), o = pr(r, t.config.apiKey, t.name), s = null;
		for (let e of n) try {
			let n = await e._get(o);
			if (n) {
				let r = cr._fromJSON(t, n);
				e !== a && (s = r), a = e;
				break;
			}
		} catch {}
		let c = i.filter((e) => e._shouldAllowMigration);
		return !a._shouldAllowMigration || !c.length ? new e(a, t, r) : (a = c[0], s && await a._set(o, s.toJSON()), await Promise.all(n.map(async (e) => {
			if (e !== a) try {
				await e._remove(o);
			} catch {}
		})), new e(a, t, r));
	}
};
function hr(e) {
	let t = e.toLowerCase();
	if (t.includes("opera/") || t.includes("opr/") || t.includes("opios/")) return "Opera";
	if (yr(t)) return "IEMobile";
	if (t.includes("msie") || t.includes("trident/")) return "IE";
	if (t.includes("edge/")) return "Edge";
	if (gr(t)) return "Firefox";
	if (t.includes("silk/")) return "Silk";
	if (xr(t)) return "Blackberry";
	if (Sr(t)) return "Webos";
	if (_r(t)) return "Safari";
	if ((t.includes("chrome/") || vr(t)) && !t.includes("edge/")) return "Chrome";
	if (br(t)) return "Android";
	{
		let t = e.match(/([a-zA-Z\d\.]+)\/[a-zA-Z\d\.]*$/);
		if (t?.length === 2) return t[1];
	}
	return "Other";
}
function gr(e = h()) {
	return /firefox\//i.test(e);
}
function _r(e = h()) {
	let t = e.toLowerCase();
	return t.includes("safari/") && !t.includes("chrome/") && !t.includes("crios/") && !t.includes("android");
}
function vr(e = h()) {
	return /crios\//i.test(e);
}
function yr(e = h()) {
	return /iemobile/i.test(e);
}
function br(e = h()) {
	return /android/i.test(e);
}
function xr(e = h()) {
	return /blackberry/i.test(e);
}
function Sr(e = h()) {
	return /webos/i.test(e);
}
function Cr(e = h()) {
	return /iphone|ipad|ipod/i.test(e) || /macintosh/i.test(e) && /mobile/i.test(e);
}
function wr(e = h()) {
	return Cr(e) && !!window.navigator?.standalone;
}
function Tr() {
	return se() && document.documentMode === 10;
}
function Er(e = h()) {
	return Cr(e) || br(e) || Sr(e) || xr(e) || /windows phone/i.test(e) || yr(e);
}
function Dr() {
	try {
		return !!(window && window !== window.top);
	} catch {
		return !1;
	}
}
function Or(e, t = []) {
	let n;
	switch (e) {
		case "Browser":
			n = hr(h());
			break;
		case "Worker":
			n = `${hr(h())}-${e}`;
			break;
		default: n = e;
	}
	let r = t.length ? t.join(",") : "FirebaseCore-web";
	return `${n}/JsCore/${Gt}/${r}`;
}
var kr = class {
	constructor(e) {
		this.auth = e, this.queue = [];
	}
	pushCallback(e, t) {
		let n = (t) => new Promise((n, r) => {
			try {
				n(e(t));
			} catch (e) {
				r(e);
			}
		});
		n.onAbort = t, this.queue.push(n);
		let r = this.queue.length - 1;
		return () => {
			this.queue[r] = () => Promise.resolve();
		};
	}
	async runMiddleware(e) {
		if (this.auth.currentUser === e) return;
		let t = [];
		try {
			for (let n of this.queue) await n(e), n.onAbort && t.push(n.onAbort);
		} catch (e) {
			t.reverse();
			for (let e of t) try {
				e();
			} catch {}
			throw this.auth._errorFactory.create("login-blocked", { originalMessage: e?.message });
		}
	}
};
async function Ar(e, t = {}) {
	return Ln(e, "GET", "/v2/passwordPolicy", In(e, t));
}
var jr = 6, Mr = class {
	constructor(e) {
		let t = e.customStrengthOptions;
		this.customStrengthOptions = {}, this.customStrengthOptions.minPasswordLength = t.minPasswordLength ?? jr, t.maxPasswordLength && (this.customStrengthOptions.maxPasswordLength = t.maxPasswordLength), t.containsLowercaseCharacter !== void 0 && (this.customStrengthOptions.containsLowercaseLetter = t.containsLowercaseCharacter), t.containsUppercaseCharacter !== void 0 && (this.customStrengthOptions.containsUppercaseLetter = t.containsUppercaseCharacter), t.containsNumericCharacter !== void 0 && (this.customStrengthOptions.containsNumericCharacter = t.containsNumericCharacter), t.containsNonAlphanumericCharacter !== void 0 && (this.customStrengthOptions.containsNonAlphanumericCharacter = t.containsNonAlphanumericCharacter), this.enforcementState = e.enforcementState, this.enforcementState === "ENFORCEMENT_STATE_UNSPECIFIED" && (this.enforcementState = "OFF"), this.allowedNonAlphanumericCharacters = e.allowedNonAlphanumericCharacters?.join("") ?? "", this.forceUpgradeOnSignin = e.forceUpgradeOnSignin ?? !1, this.schemaVersion = e.schemaVersion;
	}
	validatePassword(e) {
		let t = {
			isValid: !0,
			passwordPolicy: this
		};
		return this.validatePasswordLengthOptions(e, t), this.validatePasswordCharacterOptions(e, t), t.isValid &&= t.meetsMinPasswordLength ?? !0, t.isValid &&= t.meetsMaxPasswordLength ?? !0, t.isValid &&= t.containsLowercaseLetter ?? !0, t.isValid &&= t.containsUppercaseLetter ?? !0, t.isValid &&= t.containsNumericCharacter ?? !0, t.isValid &&= t.containsNonAlphanumericCharacter ?? !0, t;
	}
	validatePasswordLengthOptions(e, t) {
		let n = this.customStrengthOptions.minPasswordLength, r = this.customStrengthOptions.maxPasswordLength;
		n && (t.meetsMinPasswordLength = e.length >= n), r && (t.meetsMaxPasswordLength = e.length <= r);
	}
	validatePasswordCharacterOptions(e, t) {
		this.updatePasswordCharacterOptionsStatuses(t, !1, !1, !1, !1);
		let n;
		for (let r = 0; r < e.length; r++) n = e.charAt(r), this.updatePasswordCharacterOptionsStatuses(t, n >= "a" && n <= "z", n >= "A" && n <= "Z", n >= "0" && n <= "9", this.allowedNonAlphanumericCharacters.includes(n));
	}
	updatePasswordCharacterOptionsStatuses(e, t, n, r, i) {
		this.customStrengthOptions.containsLowercaseLetter && (e.containsLowercaseLetter ||= t), this.customStrengthOptions.containsUppercaseLetter && (e.containsUppercaseLetter ||= n), this.customStrengthOptions.containsNumericCharacter && (e.containsNumericCharacter ||= r), this.customStrengthOptions.containsNonAlphanumericCharacter && (e.containsNonAlphanumericCharacter ||= i);
	}
}, Nr = class {
	constructor(e, t, n, r) {
		this.app = e, this.heartbeatServiceProvider = t, this.appCheckServiceProvider = n, this.config = r, this.currentUser = null, this.emulatorConfig = null, this.operations = Promise.resolve(), this.authStateSubscription = new Fr(this), this.idTokenSubscription = new Fr(this), this.beforeStateQueue = new kr(this), this.redirectUser = null, this.isProactiveRefreshEnabled = !1, this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION = 1, this._canInitEmulator = !0, this._isInitialized = !1, this._deleted = !1, this._initializationPromise = null, this._popupRedirectResolver = null, this._errorFactory = hn, this._agentRecaptchaConfig = null, this._tenantRecaptchaConfigs = {}, this._projectPasswordPolicy = null, this._tenantPasswordPolicies = {}, this.lastNotifiedUid = void 0, this.languageCode = null, this.tenantId = null, this.settings = { appVerificationDisabledForTesting: !1 }, this.frameworks = [], this.name = e.name, this.clientVersion = r.sdkClientVersion;
	}
	_initializeWithPersistence(e, t) {
		return t && (this._popupRedirectResolver = ur(t)), this._initializationPromise = this.queue(async () => {
			if (!this._deleted && (this.persistenceManager = await mr.create(this, e), !this._deleted)) {
				if (this._popupRedirectResolver?._shouldInitProactively) try {
					await this._popupRedirectResolver._initialize(this);
				} catch {}
				await this.initializeCurrentUser(t), this.lastNotifiedUid = this.currentUser?.uid || null, !this._deleted && (this._isInitialized = !0);
			}
		}), this._initializationPromise;
	}
	async _onStorageEvent() {
		if (this._deleted) return;
		let e = await this.assertedPersistence.getCurrentUser();
		if (this.currentUser || e) {
			if (this.currentUser && e && this.currentUser.uid === e.uid) {
				this._currentUser._assign(e), await this.currentUser.getIdToken();
				return;
			}
			await this._updateCurrentUser(e, !0);
		}
	}
	async initializeCurrentUserFromIdToken(e) {
		try {
			let t = await Wn(this, { idToken: e }), n = await cr._fromGetAccountInfoResponse(this, t, e);
			await this.directlySetCurrentUser(n);
		} catch (e) {
			console.warn("FirebaseServerApp could not login user with provided authIdToken: ", e), await this.directlySetCurrentUser(null);
		}
	}
	async initializeCurrentUser(e) {
		if (Ht(this.app)) {
			let e = this.app.settings.authIdToken;
			return e ? new Promise((t) => {
				setTimeout(() => this.initializeCurrentUserFromIdToken(e).then(t, t));
			}) : this.directlySetCurrentUser(null);
		}
		let t = await this.assertedPersistence.getCurrentUser(), n = t, r = !1;
		if (e && this.config.authDomain) {
			await this.getOrInitRedirectPersistenceManager();
			let t = this.redirectUser?._redirectEventId, i = n?._redirectEventId, a = await this.tryRedirectSignIn(e);
			(!t || t === i) && a?.user && (n = a.user, r = !0);
		}
		if (!n) return this.directlySetCurrentUser(null);
		if (!n._redirectEventId) {
			if (r) try {
				await this.beforeStateQueue.runMiddleware(n);
			} catch (e) {
				n = t, this._popupRedirectResolver._overrideRedirectResult(this, () => Promise.reject(e));
			}
			return n ? this.reloadAndSetCurrentUserOrClear(n) : this.directlySetCurrentUser(null);
		}
		return S(this._popupRedirectResolver, this, "argument-error"), await this.getOrInitRedirectPersistenceManager(), this.redirectUser && this.redirectUser._redirectEventId === n._redirectEventId ? this.directlySetCurrentUser(n) : this.reloadAndSetCurrentUserOrClear(n);
	}
	async tryRedirectSignIn(e) {
		let t = null;
		try {
			t = await this._popupRedirectResolver._completeRedirectFn(this, e, !0);
		} catch {
			await this._setRedirectUser(null);
		}
		return t;
	}
	async reloadAndSetCurrentUserOrClear(e) {
		try {
			await er(e);
		} catch (e) {
			if (e?.code !== "auth/network-request-failed") return this.directlySetCurrentUser(null);
		}
		return this.directlySetCurrentUser(e);
	}
	useDeviceLanguage() {
		this.languageCode = An();
	}
	async _delete() {
		this._deleted = !0;
	}
	async updateCurrentUser(e) {
		if (Ht(this.app)) return Promise.reject(Sn(this));
		let t = e ? _(e) : null;
		return t && S(t.auth.config.apiKey === this.config.apiKey, this, "invalid-user-token"), this._updateCurrentUser(t && t._clone(this));
	}
	async _updateCurrentUser(e, t = !1) {
		if (!this._deleted) return e && S(this.tenantId === e.tenantId, this, "tenant-id-mismatch"), t || await this.beforeStateQueue.runMiddleware(e), this.queue(async () => {
			await this.directlySetCurrentUser(e), this.notifyAuthListeners();
		});
	}
	async signOut() {
		return Ht(this.app) ? Promise.reject(Sn(this)) : (await this.beforeStateQueue.runMiddleware(null), (this.redirectPersistenceManager || this._popupRedirectResolver) && await this._setRedirectUser(null), this._updateCurrentUser(null, !0));
	}
	setPersistence(e) {
		return Ht(this.app) ? Promise.reject(Sn(this)) : this.queue(async () => {
			await this.assertedPersistence.setPersistence(ur(e));
		});
	}
	_getRecaptchaConfig() {
		return this.tenantId == null ? this._agentRecaptchaConfig : this._tenantRecaptchaConfigs[this.tenantId];
	}
	async validatePassword(e) {
		this._getPasswordPolicyInternal() || await this._updatePasswordPolicy();
		let t = this._getPasswordPolicyInternal();
		return t.schemaVersion === this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION ? t.validatePassword(e) : Promise.reject(this._errorFactory.create("unsupported-password-policy-schema-version", {}));
	}
	_getPasswordPolicyInternal() {
		return this.tenantId === null ? this._projectPasswordPolicy : this._tenantPasswordPolicies[this.tenantId];
	}
	async _updatePasswordPolicy() {
		let e = new Mr(await Ar(this));
		this.tenantId === null ? this._projectPasswordPolicy = e : this._tenantPasswordPolicies[this.tenantId] = e;
	}
	_getPersistence() {
		return this.assertedPersistence.persistence.type;
	}
	_updateErrorMap(e) {
		this._errorFactory = new me("auth", "Firebase", e());
	}
	onAuthStateChanged(e, t, n) {
		return this.registerStateListener(this.authStateSubscription, e, t, n);
	}
	beforeAuthStateChanged(e, t) {
		return this.beforeStateQueue.pushCallback(e, t);
	}
	onIdTokenChanged(e, t, n) {
		return this.registerStateListener(this.idTokenSubscription, e, t, n);
	}
	authStateReady() {
		return new Promise((e, t) => {
			if (this.currentUser) e();
			else {
				let n = this.onAuthStateChanged(() => {
					n(), e();
				}, t);
			}
		});
	}
	async revokeAccessToken(e) {
		if (this.currentUser) {
			let t = {
				providerId: "apple.com",
				tokenType: "ACCESS_TOKEN",
				token: e,
				idToken: await this.currentUser.getIdToken()
			};
			this.tenantId != null && (t.tenantId = this.tenantId), await ar(this, t);
		}
	}
	toJSON() {
		return {
			apiKey: this.config.apiKey,
			authDomain: this.config.authDomain,
			appName: this.name,
			currentUser: this._currentUser?.toJSON()
		};
	}
	async _setRedirectUser(e, t) {
		let n = await this.getOrInitRedirectPersistenceManager(t);
		return e === null ? n.removeCurrentUser() : n.setCurrentUser(e);
	}
	async getOrInitRedirectPersistenceManager(e) {
		if (!this.redirectPersistenceManager) {
			let t = e && ur(e) || this._popupRedirectResolver;
			S(t, this, "argument-error"), this.redirectPersistenceManager = await mr.create(this, [ur(t._redirectPersistence)], "redirectUser"), this.redirectUser = await this.redirectPersistenceManager.getCurrentUser();
		}
		return this.redirectPersistenceManager;
	}
	async _redirectUserForId(e) {
		return this._isInitialized && await this.queue(async () => {}), this._currentUser?._redirectEventId === e ? this._currentUser : this.redirectUser?._redirectEventId === e ? this.redirectUser : null;
	}
	async _persistUserIfCurrent(e) {
		if (e === this.currentUser) return this.queue(async () => this.directlySetCurrentUser(e));
	}
	_notifyListenersIfCurrent(e) {
		e === this.currentUser && this.notifyAuthListeners();
	}
	_key() {
		return `${this.config.authDomain}:${this.config.apiKey}:${this.name}`;
	}
	_startProactiveRefresh() {
		this.isProactiveRefreshEnabled = !0, this.currentUser && this._currentUser._startProactiveRefresh();
	}
	_stopProactiveRefresh() {
		this.isProactiveRefreshEnabled = !1, this.currentUser && this._currentUser._stopProactiveRefresh();
	}
	get _currentUser() {
		return this.currentUser;
	}
	notifyAuthListeners() {
		if (!this._isInitialized) return;
		this.idTokenSubscription.next(this.currentUser);
		let e = this.currentUser?.uid ?? null;
		this.lastNotifiedUid !== e && (this.lastNotifiedUid = e, this.authStateSubscription.next(this.currentUser));
	}
	registerStateListener(e, t, n, r) {
		if (this._deleted) return () => {};
		let i = typeof t == "function" ? t : t.next.bind(t), a = !1, o = this._isInitialized ? Promise.resolve() : this._initializationPromise;
		if (S(o, this, "internal-error"), o.then(() => {
			a || i(this.currentUser);
		}), typeof t == "function") {
			let i = e.addObserver(t, n, r);
			return () => {
				a = !0, i();
			};
		}
		{
			let n = e.addObserver(t);
			return () => {
				a = !0, n();
			};
		}
	}
	async directlySetCurrentUser(e) {
		this.currentUser && this.currentUser !== e && this._currentUser._stopProactiveRefresh(), e && this.isProactiveRefreshEnabled && e._startProactiveRefresh(), this.currentUser = e, e ? await this.assertedPersistence.setCurrentUser(e) : await this.assertedPersistence.removeCurrentUser();
	}
	queue(e) {
		return this.operations = this.operations.then(e, e), this.operations;
	}
	get assertedPersistence() {
		return S(this.persistenceManager, this, "internal-error"), this.persistenceManager;
	}
	_logFramework(e) {
		e && !this.frameworks.includes(e) && (this.frameworks.push(e), this.frameworks.sort(), this.clientVersion = Or(this.config.clientPlatform, this._getFrameworks()));
	}
	_getFrameworks() {
		return this.frameworks;
	}
	async _getAdditionalHeaders() {
		let e = { "X-Client-Version": this.clientVersion };
		this.app.options.appId && (e["X-Firebase-gmpid"] = this.app.options.appId);
		let t = await this.heartbeatServiceProvider.getImmediate({ optional: !0 })?.getHeartbeatsHeader();
		t && (e["X-Firebase-Client"] = t);
		let n = await this._getAppCheckToken();
		return n && (e["X-Firebase-AppCheck"] = n), e;
	}
	async _getAppCheckToken() {
		let e = await this.appCheckServiceProvider.getImmediate({ optional: !0 })?.getToken();
		return e?.error && _n(`Error while retrieving App Check token: ${e.error}`), e?.token;
	}
};
function Pr(e) {
	return _(e);
}
var Fr = class {
	constructor(e) {
		this.auth = e, this.observer = null, this.addObserver = xe((e) => this.observer = e);
	}
	get next() {
		return S(this.observer, this.auth, "internal-error"), this.observer.next.bind(this.observer);
	}
}, Ir = {
	async loadJS() {
		throw Error("Unable to load external scripts");
	},
	recaptchaV2Script: "",
	recaptchaEnterpriseScript: "",
	gapiScript: ""
};
function Lr(e) {
	Ir = e;
}
function Rr(e) {
	return Ir.loadJS(e);
}
function zr() {
	return Ir.gapiScript;
}
function Br(e) {
	return `__${e}${Math.floor(Math.random() * 1e6)}`;
}
function Vr(e, t) {
	let n = Vt(e, "auth");
	if (n.isInitialized()) {
		let e = n.getImmediate();
		if (ve(n.getOptions(), t ?? {})) return e;
		yn(e, "already-initialized");
	}
	return n.initialize({ options: t });
}
function Hr(e, t) {
	let n = t?.persistence || [], r = (Array.isArray(n) ? n : [n]).map(ur);
	t?.errorMap && e._updateErrorMap(t.errorMap), e._initializeWithPersistence(r, t?.popupRedirectResolver);
}
function Ur(e, t, n) {
	let r = Pr(e);
	S(r._canInitEmulator, r, "emulator-config-failed"), S(/^https?:\/\//.test(t), r, "invalid-emulator-scheme");
	let i = !!n?.disableWarnings, a = Wr(t), { host: o, port: s } = Gr(t), c = s === null ? "" : `:${s}`;
	r.config.emulator = { url: `${a}//${o}${c}/` }, r.settings.appVerificationDisabledForTesting = !0, r.emulatorConfig = Object.freeze({
		host: o,
		port: s,
		protocol: a.replace(":", ""),
		options: Object.freeze({ disableWarnings: i })
	}), i || qr();
}
function Wr(e) {
	let t = e.indexOf(":");
	return t < 0 ? "" : e.substr(0, t + 1);
}
function Gr(e) {
	let t = Wr(e), n = /(\/\/)?([^?#/]+)/.exec(e.substr(t.length));
	if (!n) return {
		host: "",
		port: null
	};
	let r = n[2].split("@").pop() || "", i = /^(\[[^\]]+\])(:|$)/.exec(r);
	if (i) {
		let e = i[1];
		return {
			host: e,
			port: Kr(r.substr(e.length + 1))
		};
	}
	{
		let [e, t] = r.split(":");
		return {
			host: e,
			port: Kr(t)
		};
	}
}
function Kr(e) {
	if (!e) return null;
	let t = Number(e);
	return isNaN(t) ? null : t;
}
function qr() {
	function e() {
		let e = document.createElement("p"), t = e.style;
		e.innerText = "Running in emulator mode. Do not use with production credentials.", t.position = "fixed", t.width = "100%", t.backgroundColor = "#ffffff", t.border = ".1em solid #000000", t.color = "#b50000", t.bottom = "0px", t.left = "0px", t.margin = "0px", t.zIndex = "10000", t.textAlign = "center", e.classList.add("firebase-emulator-warning"), document.body.appendChild(e);
	}
	typeof console < "u" && typeof console.info == "function" && console.info("WARNING: You are using the Auth Emulator, which is intended for local testing only.  Do not use with production credentials."), typeof window < "u" && typeof document < "u" && (document.readyState === "loading" ? window.addEventListener("DOMContentLoaded", e) : e());
}
var Jr = class {
	constructor(e, t) {
		this.providerId = e, this.signInMethod = t;
	}
	toJSON() {
		return wn("not implemented");
	}
	_getIdTokenResponse(e) {
		return wn("not implemented");
	}
	_linkToIdToken(e, t) {
		return wn("not implemented");
	}
	_getReauthenticationResolver(e) {
		return wn("not implemented");
	}
};
async function Yr(e, t) {
	return zn(e, "POST", "/v1/accounts:signInWithIdp", In(e, t));
}
var Xr = "http://localhost", Zr = class e extends Jr {
	constructor() {
		super(...arguments), this.pendingToken = null;
	}
	static _fromParams(t) {
		let n = new e(t.providerId, t.signInMethod);
		return t.idToken || t.accessToken ? (t.idToken && (n.idToken = t.idToken), t.accessToken && (n.accessToken = t.accessToken), t.nonce && !t.pendingToken && (n.nonce = t.nonce), t.pendingToken && (n.pendingToken = t.pendingToken)) : t.oauthToken && t.oauthTokenSecret ? (n.accessToken = t.oauthToken, n.secret = t.oauthTokenSecret) : yn("argument-error"), n;
	}
	toJSON() {
		return {
			idToken: this.idToken,
			accessToken: this.accessToken,
			secret: this.secret,
			nonce: this.nonce,
			pendingToken: this.pendingToken,
			providerId: this.providerId,
			signInMethod: this.signInMethod
		};
	}
	static fromJSON(t) {
		let n = typeof t == "string" ? JSON.parse(t) : t, { providerId: r, signInMethod: i } = n, a = fn(n, ["providerId", "signInMethod"]);
		if (!r || !i) return null;
		let o = new e(r, i);
		return o.idToken = a.idToken || void 0, o.accessToken = a.accessToken || void 0, o.secret = a.secret, o.nonce = a.nonce, o.pendingToken = a.pendingToken || null, o;
	}
	_getIdTokenResponse(e) {
		return Yr(e, this.buildRequest());
	}
	_linkToIdToken(e, t) {
		let n = this.buildRequest();
		return n.idToken = t, Yr(e, n);
	}
	_getReauthenticationResolver(e) {
		let t = this.buildRequest();
		return t.autoCreate = !1, Yr(e, t);
	}
	buildRequest() {
		let e = {
			requestUri: Xr,
			returnSecureToken: !0
		};
		if (this.pendingToken) e.pendingToken = this.pendingToken;
		else {
			let t = {};
			this.idToken && (t.id_token = this.idToken), this.accessToken && (t.access_token = this.accessToken), this.secret && (t.oauth_token_secret = this.secret), t.providerId = this.providerId, this.nonce && !this.pendingToken && (t.nonce = this.nonce), e.postBody = be(t);
		}
		return e;
	}
}, Qr = class {
	constructor(e) {
		this.providerId = e, this.defaultLanguageCode = null, this.customParameters = {};
	}
	setDefaultLanguage(e) {
		this.defaultLanguageCode = e;
	}
	setCustomParameters(e) {
		return this.customParameters = e, this;
	}
	getCustomParameters() {
		return this.customParameters;
	}
}, $r = class extends Qr {
	constructor() {
		super(...arguments), this.scopes = [];
	}
	addScope(e) {
		return this.scopes.includes(e) || this.scopes.push(e), this;
	}
	getScopes() {
		return [...this.scopes];
	}
}, ei = class e extends $r {
	constructor() {
		super("facebook.com");
	}
	static credential(t) {
		return Zr._fromParams({
			providerId: e.PROVIDER_ID,
			signInMethod: e.FACEBOOK_SIGN_IN_METHOD,
			accessToken: t
		});
	}
	static credentialFromResult(t) {
		return e.credentialFromTaggedObject(t);
	}
	static credentialFromError(t) {
		return e.credentialFromTaggedObject(t.customData || {});
	}
	static credentialFromTaggedObject({ _tokenResponse: t }) {
		if (!t || !("oauthAccessToken" in t) || !t.oauthAccessToken) return null;
		try {
			return e.credential(t.oauthAccessToken);
		} catch {
			return null;
		}
	}
};
ei.FACEBOOK_SIGN_IN_METHOD = "facebook.com", ei.PROVIDER_ID = "facebook.com";
var ti = class e extends $r {
	constructor() {
		super("google.com"), this.addScope("profile");
	}
	static credential(t, n) {
		return Zr._fromParams({
			providerId: e.PROVIDER_ID,
			signInMethod: e.GOOGLE_SIGN_IN_METHOD,
			idToken: t,
			accessToken: n
		});
	}
	static credentialFromResult(t) {
		return e.credentialFromTaggedObject(t);
	}
	static credentialFromError(t) {
		return e.credentialFromTaggedObject(t.customData || {});
	}
	static credentialFromTaggedObject({ _tokenResponse: t }) {
		if (!t) return null;
		let { oauthIdToken: n, oauthAccessToken: r } = t;
		if (!n && !r) return null;
		try {
			return e.credential(n, r);
		} catch {
			return null;
		}
	}
};
ti.GOOGLE_SIGN_IN_METHOD = "google.com", ti.PROVIDER_ID = "google.com";
var ni = class e extends $r {
	constructor() {
		super("github.com");
	}
	static credential(t) {
		return Zr._fromParams({
			providerId: e.PROVIDER_ID,
			signInMethod: e.GITHUB_SIGN_IN_METHOD,
			accessToken: t
		});
	}
	static credentialFromResult(t) {
		return e.credentialFromTaggedObject(t);
	}
	static credentialFromError(t) {
		return e.credentialFromTaggedObject(t.customData || {});
	}
	static credentialFromTaggedObject({ _tokenResponse: t }) {
		if (!t || !("oauthAccessToken" in t) || !t.oauthAccessToken) return null;
		try {
			return e.credential(t.oauthAccessToken);
		} catch {
			return null;
		}
	}
};
ni.GITHUB_SIGN_IN_METHOD = "github.com", ni.PROVIDER_ID = "github.com";
var ri = class e extends $r {
	constructor() {
		super("twitter.com");
	}
	static credential(t, n) {
		return Zr._fromParams({
			providerId: e.PROVIDER_ID,
			signInMethod: e.TWITTER_SIGN_IN_METHOD,
			oauthToken: t,
			oauthTokenSecret: n
		});
	}
	static credentialFromResult(t) {
		return e.credentialFromTaggedObject(t);
	}
	static credentialFromError(t) {
		return e.credentialFromTaggedObject(t.customData || {});
	}
	static credentialFromTaggedObject({ _tokenResponse: t }) {
		if (!t) return null;
		let { oauthAccessToken: n, oauthTokenSecret: r } = t;
		if (!n || !r) return null;
		try {
			return e.credential(n, r);
		} catch {
			return null;
		}
	}
};
ri.TWITTER_SIGN_IN_METHOD = "twitter.com", ri.PROVIDER_ID = "twitter.com";
var ii = class e {
	constructor(e) {
		this.user = e.user, this.providerId = e.providerId, this._tokenResponse = e._tokenResponse, this.operationType = e.operationType;
	}
	static async _fromIdTokenResponse(t, n, r, i = !1) {
		let a = await cr._fromIdTokenResponse(t, r, i), o = ai(r);
		return new e({
			user: a,
			providerId: o,
			_tokenResponse: r,
			operationType: n
		});
	}
	static async _forOperation(t, n, r) {
		await t._updateTokensIfNecessary(r, !0);
		let i = ai(r);
		return new e({
			user: t,
			providerId: i,
			_tokenResponse: r,
			operationType: n
		});
	}
};
function ai(e) {
	return e.providerId ? e.providerId : "phoneNumber" in e ? "phone" : null;
}
var oi = class e extends pe {
	constructor(t, n, r, i) {
		super(n.code, n.message), this.operationType = r, this.user = i, Object.setPrototypeOf(this, e.prototype), this.customData = {
			appName: t.name,
			tenantId: t.tenantId ?? void 0,
			_serverResponse: n.customData._serverResponse,
			operationType: r
		};
	}
	static _fromErrorAndOperation(t, n, r, i) {
		return new e(t, n, r, i);
	}
};
function si(e, t, n, r) {
	return (t === "reauthenticate" ? n._getReauthenticationResolver(e) : n._getIdTokenResponse(e)).catch((n) => {
		throw n.code === "auth/multi-factor-auth-required" ? oi._fromErrorAndOperation(e, n, t, r) : n;
	});
}
async function ci(e, t, n = !1) {
	let r = await Xn(e, t._linkToIdToken(e.auth, await e.getIdToken()), n);
	return ii._forOperation(e, "link", r);
}
async function li(e, t, n = !1) {
	let { auth: r } = e;
	if (Ht(r.app)) return Promise.reject(Sn(r));
	let i = "reauthenticate";
	try {
		let a = await Xn(e, si(r, i, t, e), n);
		S(a.idToken, r, "internal-error");
		let o = Jn(a.idToken);
		S(o, r, "internal-error");
		let { sub: s } = o;
		return S(e.uid === s, r, "user-mismatch"), ii._forOperation(e, i, a);
	} catch (e) {
		throw e?.code === "auth/user-not-found" && yn(r, "user-mismatch"), e;
	}
}
async function ui(e, t, n = !1) {
	if (Ht(e.app)) return Promise.reject(Sn(e));
	let r = "signIn", i = await si(e, r, t), a = await ii._fromIdTokenResponse(e, r, i);
	return n || await e._updateCurrentUser(a.user), a;
}
function di(e, t, n, r) {
	return _(e).onIdTokenChanged(t, n, r);
}
function fi(e, t, n) {
	return _(e).beforeAuthStateChanged(t, n);
}
var pi = "__sak", mi = class {
	constructor(e, t) {
		this.storageRetriever = e, this.type = t;
	}
	_isAvailable() {
		try {
			return this.storage ? (this.storage.setItem(pi, "1"), this.storage.removeItem(pi), Promise.resolve(!0)) : Promise.resolve(!1);
		} catch {
			return Promise.resolve(!1);
		}
	}
	_set(e, t) {
		return this.storage.setItem(e, JSON.stringify(t)), Promise.resolve();
	}
	_get(e) {
		let t = this.storage.getItem(e);
		return Promise.resolve(t ? JSON.parse(t) : null);
	}
	_remove(e) {
		return this.storage.removeItem(e), Promise.resolve();
	}
	get storage() {
		return this.storageRetriever();
	}
};
function hi() {
	let e = h();
	return _r(e) || Cr(e);
}
var gi = 1e3, _i = 10, vi = class extends mi {
	constructor() {
		super(() => window.localStorage, "LOCAL"), this.boundEventHandler = (e, t) => this.onStorageEvent(e, t), this.listeners = {}, this.localCache = {}, this.pollTimer = null, this.safariLocalStorageNotSynced = hi() && Dr(), this.fallbackToPolling = Er(), this._shouldAllowMigration = !0;
	}
	forAllChangedKeys(e) {
		for (let t of Object.keys(this.listeners)) {
			let n = this.storage.getItem(t), r = this.localCache[t];
			n !== r && e(t, r, n);
		}
	}
	onStorageEvent(e, t = !1) {
		if (!e.key) {
			this.forAllChangedKeys((e, t, n) => {
				this.notifyListeners(e, n);
			});
			return;
		}
		let n = e.key;
		if (t ? this.detachListener() : this.stopPolling(), this.safariLocalStorageNotSynced) {
			let r = this.storage.getItem(n);
			if (e.newValue !== r) e.newValue === null ? this.storage.removeItem(n) : this.storage.setItem(n, e.newValue);
			else if (this.localCache[n] === e.newValue && !t) return;
		}
		let r = () => {
			let e = this.storage.getItem(n);
			(t || this.localCache[n] !== e) && this.notifyListeners(n, e);
		}, i = this.storage.getItem(n);
		Tr() && i !== e.newValue && e.newValue !== e.oldValue ? setTimeout(r, _i) : r();
	}
	notifyListeners(e, t) {
		this.localCache[e] = t;
		let n = this.listeners[e];
		if (n) for (let e of Array.from(n)) e(t && JSON.parse(t));
	}
	startPolling() {
		this.stopPolling(), this.pollTimer = setInterval(() => {
			this.forAllChangedKeys((e, t, n) => {
				this.onStorageEvent(new StorageEvent("storage", {
					key: e,
					oldValue: t,
					newValue: n
				}), !0);
			});
		}, gi);
	}
	stopPolling() {
		this.pollTimer &&= (clearInterval(this.pollTimer), null);
	}
	attachListener() {
		window.addEventListener("storage", this.boundEventHandler);
	}
	detachListener() {
		window.removeEventListener("storage", this.boundEventHandler);
	}
	_addListener(e, t) {
		Object.keys(this.listeners).length === 0 && (this.fallbackToPolling ? this.startPolling() : this.attachListener()), this.listeners[e] || (this.listeners[e] = /* @__PURE__ */ new Set(), this.localCache[e] = this.storage.getItem(e)), this.listeners[e].add(t);
	}
	_removeListener(e, t) {
		this.listeners[e] && (this.listeners[e].delete(t), this.listeners[e].size === 0 && delete this.listeners[e]), Object.keys(this.listeners).length === 0 && (this.detachListener(), this.stopPolling());
	}
	async _set(e, t) {
		await super._set(e, t), this.localCache[e] = JSON.stringify(t);
	}
	async _get(e) {
		let t = await super._get(e);
		return this.localCache[e] = JSON.stringify(t), t;
	}
	async _remove(e) {
		await super._remove(e), delete this.localCache[e];
	}
};
vi.type = "LOCAL";
var yi = vi, bi = class extends mi {
	constructor() {
		super(() => window.sessionStorage, "SESSION");
	}
	_addListener(e, t) {}
	_removeListener(e, t) {}
};
bi.type = "SESSION";
var xi = bi;
function Si(e) {
	return Promise.all(e.map(async (e) => {
		try {
			return {
				fulfilled: !0,
				value: await e
			};
		} catch (e) {
			return {
				fulfilled: !1,
				reason: e
			};
		}
	}));
}
var Ci = class e {
	constructor(e) {
		this.eventTarget = e, this.handlersMap = {}, this.boundEventHandler = this.handleEvent.bind(this);
	}
	static _getInstance(t) {
		let n = this.receivers.find((e) => e.isListeningto(t));
		if (n) return n;
		let r = new e(t);
		return this.receivers.push(r), r;
	}
	isListeningto(e) {
		return this.eventTarget === e;
	}
	async handleEvent(e) {
		let t = e, { eventId: n, eventType: r, data: i } = t.data, a = this.handlersMap[r];
		if (!a?.size) return;
		t.ports[0].postMessage({
			status: "ack",
			eventId: n,
			eventType: r
		});
		let o = await Si(Array.from(a).map(async (e) => e(t.origin, i)));
		t.ports[0].postMessage({
			status: "done",
			eventId: n,
			eventType: r,
			response: o
		});
	}
	_subscribe(e, t) {
		Object.keys(this.handlersMap).length === 0 && this.eventTarget.addEventListener("message", this.boundEventHandler), this.handlersMap[e] || (this.handlersMap[e] = /* @__PURE__ */ new Set()), this.handlersMap[e].add(t);
	}
	_unsubscribe(e, t) {
		this.handlersMap[e] && t && this.handlersMap[e].delete(t), (!t || this.handlersMap[e].size === 0) && delete this.handlersMap[e], Object.keys(this.handlersMap).length === 0 && this.eventTarget.removeEventListener("message", this.boundEventHandler);
	}
};
Ci.receivers = [];
function wi(e = "", t = 10) {
	let n = "";
	for (let e = 0; e < t; e++) n += Math.floor(Math.random() * 10);
	return e + n;
}
var Ti = class {
	constructor(e) {
		this.target = e, this.handlers = /* @__PURE__ */ new Set();
	}
	removeMessageHandler(e) {
		e.messageChannel && (e.messageChannel.port1.removeEventListener("message", e.onMessage), e.messageChannel.port1.close()), this.handlers.delete(e);
	}
	async _send(e, t, n = 50) {
		let r = typeof MessageChannel < "u" ? new MessageChannel() : null;
		if (!r) throw Error("connection_unavailable");
		let i, a;
		return new Promise((o, s) => {
			let c = wi("", 20);
			r.port1.start();
			let l = setTimeout(() => {
				s(/* @__PURE__ */ Error("unsupported_event"));
			}, n);
			a = {
				messageChannel: r,
				onMessage(e) {
					let t = e;
					if (t.data.eventId === c) switch (t.data.status) {
						case "ack":
							clearTimeout(l), i = setTimeout(() => {
								s(/* @__PURE__ */ Error("timeout"));
							}, 3e3);
							break;
						case "done":
							clearTimeout(i), o(t.data.response);
							break;
						default: clearTimeout(l), clearTimeout(i), s(/* @__PURE__ */ Error("invalid_response"));
					}
				}
			}, this.handlers.add(a), r.port1.addEventListener("message", a.onMessage), this.target.postMessage({
				eventType: e,
				eventId: c,
				data: t
			}, [r.port2]);
		}).finally(() => {
			a && this.removeMessageHandler(a);
		});
	}
};
function Ei() {
	return window;
}
function Di(e) {
	Ei().location.href = e;
}
function Oi() {
	return Ei().WorkerGlobalScope !== void 0 && typeof Ei().importScripts == "function";
}
async function ki() {
	if (!(navigator != null && navigator.serviceWorker)) return null;
	try {
		return (await navigator.serviceWorker.ready).active;
	} catch {
		return null;
	}
}
function Ai() {
	return (navigator == null ? void 0 : navigator.serviceWorker)?.controller || null;
}
function ji() {
	return Oi() ? self : null;
}
var Mi = "firebaseLocalStorageDb", Ni = 1, Pi = "firebaseLocalStorage", Fi = "fbase_key", Ii = class {
	constructor(e) {
		this.request = e;
	}
	toPromise() {
		return new Promise((e, t) => {
			this.request.addEventListener("success", () => {
				e(this.request.result);
			}), this.request.addEventListener("error", () => {
				t(this.request.error);
			});
		});
	}
};
function Li(e, t) {
	return e.transaction([Pi], t ? "readwrite" : "readonly").objectStore(Pi);
}
function Ri() {
	return new Ii(indexedDB.deleteDatabase(Mi)).toPromise();
}
function zi() {
	let e = indexedDB.open(Mi, Ni);
	return new Promise((t, n) => {
		e.addEventListener("error", () => {
			n(e.error);
		}), e.addEventListener("upgradeneeded", () => {
			let t = e.result;
			try {
				t.createObjectStore(Pi, { keyPath: Fi });
			} catch (e) {
				n(e);
			}
		}), e.addEventListener("success", async () => {
			let n = e.result;
			n.objectStoreNames.contains(Pi) ? t(n) : (n.close(), await Ri(), t(await zi()));
		});
	});
}
async function Bi(e, t, n) {
	return new Ii(Li(e, !0).put({
		[Fi]: t,
		value: n
	})).toPromise();
}
async function Vi(e, t) {
	let n = await new Ii(Li(e, !1).get(t)).toPromise();
	return n === void 0 ? null : n.value;
}
function Hi(e, t) {
	return new Ii(Li(e, !0).delete(t)).toPromise();
}
var Ui = 800, Wi = 3, Gi = class {
	constructor() {
		this.type = "LOCAL", this._shouldAllowMigration = !0, this.listeners = {}, this.localCache = {}, this.pollTimer = null, this.pendingWrites = 0, this.receiver = null, this.sender = null, this.serviceWorkerReceiverAvailable = !1, this.activeServiceWorker = null, this._workerInitializationPromise = this.initializeServiceWorkerMessaging().then(() => {}, () => {});
	}
	async _openDb() {
		return this.db ||= await zi(), this.db;
	}
	async _withRetries(e) {
		let t = 0;
		for (;;) try {
			return await e(await this._openDb());
		} catch (e) {
			if (t++ > Wi) throw e;
			this.db &&= (this.db.close(), void 0);
		}
	}
	async initializeServiceWorkerMessaging() {
		return Oi() ? this.initializeReceiver() : this.initializeSender();
	}
	async initializeReceiver() {
		this.receiver = Ci._getInstance(ji()), this.receiver._subscribe("keyChanged", async (e, t) => ({ keyProcessed: (await this._poll()).includes(t.key) })), this.receiver._subscribe("ping", async (e, t) => ["keyChanged"]);
	}
	async initializeSender() {
		if (this.activeServiceWorker = await ki(), !this.activeServiceWorker) return;
		this.sender = new Ti(this.activeServiceWorker);
		let e = await this.sender._send("ping", {}, 800);
		e && e[0]?.fulfilled && e[0]?.value.includes("keyChanged") && (this.serviceWorkerReceiverAvailable = !0);
	}
	async notifyServiceWorker(e) {
		if (this.sender && this.activeServiceWorker && Ai() === this.activeServiceWorker) try {
			await this.sender._send("keyChanged", { key: e }, this.serviceWorkerReceiverAvailable ? 800 : 50);
		} catch {}
	}
	async _isAvailable() {
		try {
			if (!indexedDB) return !1;
			let e = await zi();
			return await Bi(e, pi, "1"), await Hi(e, pi), !0;
		} catch {}
		return !1;
	}
	async _withPendingWrite(e) {
		this.pendingWrites++;
		try {
			await e();
		} finally {
			this.pendingWrites--;
		}
	}
	async _set(e, t) {
		return this._withPendingWrite(async () => (await this._withRetries((n) => Bi(n, e, t)), this.localCache[e] = t, this.notifyServiceWorker(e)));
	}
	async _get(e) {
		let t = await this._withRetries((t) => Vi(t, e));
		return this.localCache[e] = t, t;
	}
	async _remove(e) {
		return this._withPendingWrite(async () => (await this._withRetries((t) => Hi(t, e)), delete this.localCache[e], this.notifyServiceWorker(e)));
	}
	async _poll() {
		let e = await this._withRetries((e) => new Ii(Li(e, !1).getAll()).toPromise());
		if (!e || this.pendingWrites !== 0) return [];
		let t = [], n = /* @__PURE__ */ new Set();
		if (e.length !== 0) for (let { fbase_key: r, value: i } of e) n.add(r), JSON.stringify(this.localCache[r]) !== JSON.stringify(i) && (this.notifyListeners(r, i), t.push(r));
		for (let e of Object.keys(this.localCache)) this.localCache[e] && !n.has(e) && (this.notifyListeners(e, null), t.push(e));
		return t;
	}
	notifyListeners(e, t) {
		this.localCache[e] = t;
		let n = this.listeners[e];
		if (n) for (let e of Array.from(n)) e(t);
	}
	startPolling() {
		this.stopPolling(), this.pollTimer = setInterval(async () => this._poll(), Ui);
	}
	stopPolling() {
		this.pollTimer &&= (clearInterval(this.pollTimer), null);
	}
	_addListener(e, t) {
		Object.keys(this.listeners).length === 0 && this.startPolling(), this.listeners[e] || (this.listeners[e] = /* @__PURE__ */ new Set(), this._get(e)), this.listeners[e].add(t);
	}
	_removeListener(e, t) {
		this.listeners[e] && (this.listeners[e].delete(t), this.listeners[e].size === 0 && delete this.listeners[e]), Object.keys(this.listeners).length === 0 && this.stopPolling();
	}
};
Gi.type = "LOCAL";
var Ki = Gi;
Br("rcb"), new jn(3e4, 6e4);
function qi(e, t) {
	return t ? ur(t) : (S(e._popupRedirectResolver, e, "argument-error"), e._popupRedirectResolver);
}
var Ji = class extends Jr {
	constructor(e) {
		super("custom", "custom"), this.params = e;
	}
	_getIdTokenResponse(e) {
		return Yr(e, this._buildIdpRequest());
	}
	_linkToIdToken(e, t) {
		return Yr(e, this._buildIdpRequest(t));
	}
	_getReauthenticationResolver(e) {
		return Yr(e, this._buildIdpRequest());
	}
	_buildIdpRequest(e) {
		let t = {
			requestUri: this.params.requestUri,
			sessionId: this.params.sessionId,
			postBody: this.params.postBody,
			tenantId: this.params.tenantId,
			pendingToken: this.params.pendingToken,
			returnSecureToken: !0,
			returnIdpCredential: !0
		};
		return e && (t.idToken = e), t;
	}
};
function Yi(e) {
	return ui(e.auth, new Ji(e), e.bypassAuthState);
}
function Xi(e) {
	let { auth: t, user: n } = e;
	return S(n, t, "internal-error"), li(n, new Ji(e), e.bypassAuthState);
}
async function Zi(e) {
	let { auth: t, user: n } = e;
	return S(n, t, "internal-error"), ci(n, new Ji(e), e.bypassAuthState);
}
var Qi = class {
	constructor(e, t, n, r, i = !1) {
		this.auth = e, this.resolver = n, this.user = r, this.bypassAuthState = i, this.pendingPromise = null, this.eventManager = null, this.filter = Array.isArray(t) ? t : [t];
	}
	execute() {
		return new Promise(async (e, t) => {
			this.pendingPromise = {
				resolve: e,
				reject: t
			};
			try {
				this.eventManager = await this.resolver._initialize(this.auth), await this.onExecution(), this.eventManager.registerConsumer(this);
			} catch (e) {
				this.reject(e);
			}
		});
	}
	async onAuthEvent(e) {
		let { urlResponse: t, sessionId: n, postBody: r, tenantId: i, error: a, type: o } = e;
		if (a) {
			this.reject(a);
			return;
		}
		let s = {
			auth: this.auth,
			requestUri: t,
			sessionId: n,
			tenantId: i || void 0,
			postBody: r || void 0,
			user: this.user,
			bypassAuthState: this.bypassAuthState
		};
		try {
			this.resolve(await this.getIdpTask(o)(s));
		} catch (e) {
			this.reject(e);
		}
	}
	onError(e) {
		this.reject(e);
	}
	getIdpTask(e) {
		switch (e) {
			case "signInViaPopup":
			case "signInViaRedirect": return Yi;
			case "linkViaPopup":
			case "linkViaRedirect": return Zi;
			case "reauthViaPopup":
			case "reauthViaRedirect": return Xi;
			default: yn(this.auth, "internal-error");
		}
	}
	resolve(e) {
		Tn(this.pendingPromise, "Pending promise was never set"), this.pendingPromise.resolve(e), this.unregisterAndCleanUp();
	}
	reject(e) {
		Tn(this.pendingPromise, "Pending promise was never set"), this.pendingPromise.reject(e), this.unregisterAndCleanUp();
	}
	unregisterAndCleanUp() {
		this.eventManager && this.eventManager.unregisterConsumer(this), this.pendingPromise = null, this.cleanUp();
	}
}, $i = new jn(2e3, 1e4), ea = class e extends Qi {
	constructor(t, n, r, i, a) {
		super(t, n, i, a), this.provider = r, this.authWindow = null, this.pollId = null, e.currentPopupAction && e.currentPopupAction.cancel(), e.currentPopupAction = this;
	}
	async executeNotNull() {
		let e = await this.execute();
		return S(e, this.auth, "internal-error"), e;
	}
	async onExecution() {
		Tn(this.filter.length === 1, "Popup operations only handle one event");
		let e = wi();
		this.authWindow = await this.resolver._openPopup(this.auth, this.provider, this.filter[0], e), this.authWindow.associatedEvent = e, this.resolver._originValidation(this.auth).catch((e) => {
			this.reject(e);
		}), this.resolver._isIframeWebStorageSupported(this.auth, (e) => {
			e || this.reject(bn(this.auth, "web-storage-unsupported"));
		}), this.pollUserCancellation();
	}
	get eventId() {
		return this.authWindow?.associatedEvent || null;
	}
	cancel() {
		this.reject(bn(this.auth, "cancelled-popup-request"));
	}
	cleanUp() {
		this.authWindow && this.authWindow.close(), this.pollId && window.clearTimeout(this.pollId), this.authWindow = null, this.pollId = null, e.currentPopupAction = null;
	}
	pollUserCancellation() {
		let e = () => {
			if (this.authWindow?.window?.closed) {
				this.pollId = window.setTimeout(() => {
					this.pollId = null, this.reject(bn(this.auth, "popup-closed-by-user"));
				}, 8e3);
				return;
			}
			this.pollId = window.setTimeout(e, $i.get());
		};
		e();
	}
};
ea.currentPopupAction = null;
var ta = "pendingRedirect", na = /* @__PURE__ */ new Map(), ra = class extends Qi {
	constructor(e, t, n = !1) {
		super(e, [
			"signInViaRedirect",
			"linkViaRedirect",
			"reauthViaRedirect",
			"unknown"
		], t, void 0, n), this.eventId = null;
	}
	async execute() {
		let e = na.get(this.auth._key());
		if (!e) {
			try {
				let t = await ia(this.resolver, this.auth) ? await super.execute() : null;
				e = () => Promise.resolve(t);
			} catch (t) {
				e = () => Promise.reject(t);
			}
			na.set(this.auth._key(), e);
		}
		return this.bypassAuthState || na.set(this.auth._key(), () => Promise.resolve(null)), e();
	}
	async onAuthEvent(e) {
		if (e.type === "signInViaRedirect") return super.onAuthEvent(e);
		if (e.type === "unknown") {
			this.resolve(null);
			return;
		}
		if (e.eventId) {
			let t = await this.auth._redirectUserForId(e.eventId);
			if (t) return this.user = t, super.onAuthEvent(e);
			this.resolve(null);
		}
	}
	async onExecution() {}
	cleanUp() {}
};
async function ia(e, t) {
	let n = sa(t), r = oa(e);
	if (!await r._isAvailable()) return !1;
	let i = await r._get(n) === "true";
	return await r._remove(n), i;
}
function aa(e, t) {
	na.set(e._key(), t);
}
function oa(e) {
	return ur(e._redirectPersistence);
}
function sa(e) {
	return pr(ta, e.config.apiKey, e.name);
}
async function ca(e, t, n = !1) {
	if (Ht(e.app)) return Promise.reject(Sn(e));
	let r = Pr(e), i = await new ra(r, qi(r, t), n).execute();
	return i && !n && (delete i.user._redirectEventId, await r._persistUserIfCurrent(i.user), await r._setRedirectUser(null, t)), i;
}
var la = 6e5, ua = class {
	constructor(e) {
		this.auth = e, this.cachedEventUids = /* @__PURE__ */ new Set(), this.consumers = /* @__PURE__ */ new Set(), this.queuedRedirectEvent = null, this.hasHandledPotentialRedirect = !1, this.lastProcessedEventTime = Date.now();
	}
	registerConsumer(e) {
		this.consumers.add(e), this.queuedRedirectEvent && this.isEventForConsumer(this.queuedRedirectEvent, e) && (this.sendToConsumer(this.queuedRedirectEvent, e), this.saveEventToCache(this.queuedRedirectEvent), this.queuedRedirectEvent = null);
	}
	unregisterConsumer(e) {
		this.consumers.delete(e);
	}
	onEvent(e) {
		if (this.hasEventBeenHandled(e)) return !1;
		let t = !1;
		return this.consumers.forEach((n) => {
			this.isEventForConsumer(e, n) && (t = !0, this.sendToConsumer(e, n), this.saveEventToCache(e));
		}), this.hasHandledPotentialRedirect || !pa(e) ? t : (this.hasHandledPotentialRedirect = !0, t ||= (this.queuedRedirectEvent = e, !0), t);
	}
	sendToConsumer(e, t) {
		if (e.error && !fa(e)) {
			let n = e.error.code?.split("auth/")[1] || "internal-error";
			t.onError(bn(this.auth, n));
		} else t.onAuthEvent(e);
	}
	isEventForConsumer(e, t) {
		let n = t.eventId === null || !!e.eventId && e.eventId === t.eventId;
		return t.filter.includes(e.type) && n;
	}
	hasEventBeenHandled(e) {
		return Date.now() - this.lastProcessedEventTime >= la && this.cachedEventUids.clear(), this.cachedEventUids.has(da(e));
	}
	saveEventToCache(e) {
		this.cachedEventUids.add(da(e)), this.lastProcessedEventTime = Date.now();
	}
};
function da(e) {
	return [
		e.type,
		e.eventId,
		e.sessionId,
		e.tenantId
	].filter((e) => e).join("-");
}
function fa({ type: e, error: t }) {
	return e === "unknown" && t?.code === "auth/no-auth-event";
}
function pa(e) {
	switch (e.type) {
		case "signInViaRedirect":
		case "linkViaRedirect":
		case "reauthViaRedirect": return !0;
		case "unknown": return fa(e);
		default: return !1;
	}
}
async function ma(e, t = {}) {
	return Ln(e, "GET", "/v1/projects", t);
}
var ha = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/, ga = /^https?/;
async function _a(e) {
	if (e.config.emulator) return;
	let { authorizedDomains: t } = await ma(e);
	for (let e of t) try {
		if (va(e)) return;
	} catch {}
	yn(e, "unauthorized-domain");
}
function va(e) {
	let t = En(), { protocol: n, hostname: r } = new URL(t);
	if (e.startsWith("chrome-extension://")) {
		let i = new URL(e);
		return i.hostname === "" && r === "" ? n === "chrome-extension:" && e.replace("chrome-extension://", "") === t.replace("chrome-extension://", "") : n === "chrome-extension:" && i.hostname === r;
	}
	if (!ga.test(n)) return !1;
	if (ha.test(e)) return r === e;
	let i = e.replace(/\./g, "\\.");
	return RegExp("^(.+\\." + i + "|" + i + ")$", "i").test(r);
}
var ya = new jn(3e4, 6e4);
function ba() {
	let e = Ei().___jsl;
	if (e?.H) {
		for (let t of Object.keys(e.H)) if (e.H[t].r = e.H[t].r || [], e.H[t].L = e.H[t].L || [], e.H[t].r = [...e.H[t].L], e.CP) for (let t = 0; t < e.CP.length; t++) e.CP[t] = null;
	}
}
function xa(e) {
	return new Promise((t, n) => {
		function r() {
			ba(), gapi.load("gapi.iframes", {
				callback: () => {
					t(gapi.iframes.getContext());
				},
				ontimeout: () => {
					ba(), n(bn(e, "network-request-failed"));
				},
				timeout: ya.get()
			});
		}
		if (Ei().gapi?.iframes?.Iframe) t(gapi.iframes.getContext());
		else if (Ei().gapi?.load) r();
		else {
			let t = Br("iframefcb");
			return Ei()[t] = () => {
				gapi.load ? r() : n(bn(e, "network-request-failed"));
			}, Rr(`${zr()}?onload=${t}`).catch((e) => n(e));
		}
	}).catch((e) => {
		throw Sa = null, e;
	});
}
var Sa = null;
function Ca(e) {
	return Sa ||= xa(e), Sa;
}
var wa = new jn(5e3, 15e3), Ta = "__/auth/iframe", Ea = "emulator/auth/iframe", Da = {
	style: {
		position: "absolute",
		top: "-100px",
		width: "1px",
		height: "1px"
	},
	"aria-hidden": "true",
	tabindex: "-1"
}, Oa = /* @__PURE__ */ new Map([
	["identitytoolkit.googleapis.com", "p"],
	["staging-identitytoolkit.sandbox.googleapis.com", "s"],
	["test-identitytoolkit.sandbox.googleapis.com", "t"]
]);
function ka(e) {
	let t = e.config;
	S(t.authDomain, e, "auth-domain-config-required");
	let n = t.emulator ? Mn(t, Ea) : `https://${e.config.authDomain}/${Ta}`, r = {
		apiKey: t.apiKey,
		appName: e.name,
		v: Gt
	}, i = Oa.get(e.config.apiHost);
	i && (r.eid = i);
	let a = e._getFrameworks();
	return a.length && (r.fw = a.join(",")), `${n}?${be(r).slice(1)}`;
}
async function Aa(e) {
	let t = await Ca(e), n = Ei().gapi;
	return S(n, e, "internal-error"), t.open({
		where: document.body,
		url: ka(e),
		messageHandlersFilter: n.iframes.CROSS_ORIGIN_IFRAMES_FILTER,
		attributes: Da,
		dontclear: !0
	}, (t) => new Promise(async (n, r) => {
		await t.restyle({ setHideOnLeave: !1 });
		let i = bn(e, "network-request-failed"), a = Ei().setTimeout(() => {
			r(i);
		}, wa.get());
		function o() {
			Ei().clearTimeout(a), n(t);
		}
		t.ping(o).then(o, () => {
			r(i);
		});
	}));
}
var ja = {
	location: "yes",
	resizable: "yes",
	statusbar: "yes",
	toolbar: "no"
}, Ma = 500, Na = 600, Pa = "_blank", Fa = "http://localhost", Ia = class {
	constructor(e) {
		this.window = e, this.associatedEvent = null;
	}
	close() {
		if (this.window) try {
			this.window.close();
		} catch {}
	}
};
function La(e, t, n, r = Ma, i = Na) {
	let a = Math.max((window.screen.availHeight - i) / 2, 0).toString(), o = Math.max((window.screen.availWidth - r) / 2, 0).toString(), s = "", c = Object.assign(Object.assign({}, ja), {
		width: r.toString(),
		height: i.toString(),
		top: a,
		left: o
	}), l = h().toLowerCase();
	n && (s = vr(l) ? Pa : n), gr(l) && (t ||= Fa, c.scrollbars = "yes");
	let u = Object.entries(c).reduce((e, [t, n]) => `${e}${t}=${n},`, "");
	if (wr(l) && s !== "_self") return Ra(t || "", s), new Ia(null);
	let d = window.open(t || "", s, u);
	S(d, e, "popup-blocked");
	try {
		d.focus();
	} catch {}
	return new Ia(d);
}
function Ra(e, t) {
	let n = document.createElement("a");
	n.href = e, n.target = t;
	let r = document.createEvent("MouseEvent");
	r.initMouseEvent("click", !0, !0, window, 1, 0, 0, 0, 0, !1, !1, !1, !1, 1, null), n.dispatchEvent(r);
}
var za = "__/auth/handler", Ba = "emulator/auth/handler", Va = "fac";
async function Ha(e, t, n, r, i, a) {
	S(e.config.authDomain, e, "auth-domain-config-required"), S(e.config.apiKey, e, "invalid-api-key");
	let o = {
		apiKey: e.config.apiKey,
		appName: e.name,
		authType: n,
		redirectUrl: r,
		v: Gt,
		eventId: i
	};
	if (t instanceof Qr) {
		t.setDefaultLanguage(e.languageCode), o.providerId = t.providerId || "", _e(t.getCustomParameters()) || (o.customParameters = JSON.stringify(t.getCustomParameters()));
		for (let [e, t] of Object.entries(a || {})) o[e] = t;
	}
	if (t instanceof $r) {
		let e = t.getScopes().filter((e) => e !== "");
		e.length > 0 && (o.scopes = e.join(","));
	}
	e.tenantId && (o.tid = e.tenantId);
	let s = o;
	for (let e of Object.keys(s)) s[e] === void 0 && delete s[e];
	let c = await e._getAppCheckToken(), l = c ? `#${Va}=${encodeURIComponent(c)}` : "";
	return `${Ua(e)}?${be(s).slice(1)}${l}`;
}
function Ua({ config: e }) {
	return e.emulator ? Mn(e, Ba) : `https://${e.authDomain}/${za}`;
}
var Wa = "webStorageSupport", Ga = class {
	constructor() {
		this.eventManagers = {}, this.iframes = {}, this.originValidationPromises = {}, this._redirectPersistence = xi, this._completeRedirectFn = ca, this._overrideRedirectResult = aa;
	}
	async _openPopup(e, t, n, r) {
		return Tn(this.eventManagers[e._key()]?.manager, "_initialize() not called before _openPopup()"), La(e, await Ha(e, t, n, En(), r), wi());
	}
	async _openRedirect(e, t, n, r) {
		return await this._originValidation(e), Di(await Ha(e, t, n, En(), r)), new Promise(() => {});
	}
	_initialize(e) {
		let t = e._key();
		if (this.eventManagers[t]) {
			let { manager: e, promise: n } = this.eventManagers[t];
			return e ? Promise.resolve(e) : (Tn(n, "If manager is not set, promise should be"), n);
		}
		let n = this.initAndGetManager(e);
		return this.eventManagers[t] = { promise: n }, n.catch(() => {
			delete this.eventManagers[t];
		}), n;
	}
	async initAndGetManager(e) {
		let t = await Aa(e), n = new ua(e);
		return t.register("authEvent", (t) => (S(t?.authEvent, e, "invalid-auth-event"), { status: n.onEvent(t.authEvent) ? "ACK" : "ERROR" }), gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER), this.eventManagers[e._key()] = { manager: n }, this.iframes[e._key()] = t, n;
	}
	_isIframeWebStorageSupported(e, t) {
		this.iframes[e._key()].send(Wa, { type: Wa }, (n) => {
			let r = n?.[0]?.[Wa];
			r !== void 0 && t(!!r), yn(e, "internal-error");
		}, gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER);
	}
	_originValidation(e) {
		let t = e._key();
		return this.originValidationPromises[t] || (this.originValidationPromises[t] = _a(e)), this.originValidationPromises[t];
	}
	get _shouldInitProactively() {
		return Er() || _r() || Cr();
	}
}, Ka = "@firebase/auth", qa = "1.7.0", Ja = class {
	constructor(e) {
		this.auth = e, this.internalListeners = /* @__PURE__ */ new Map();
	}
	getUid() {
		return this.assertAuthConfigured(), this.auth.currentUser?.uid || null;
	}
	async getToken(e) {
		return this.assertAuthConfigured(), await this.auth._initializationPromise, this.auth.currentUser ? { accessToken: await this.auth.currentUser.getIdToken(e) } : null;
	}
	addAuthTokenListener(e) {
		if (this.assertAuthConfigured(), this.internalListeners.has(e)) return;
		let t = this.auth.onIdTokenChanged((t) => {
			e(t?.stsTokenManager.accessToken || null);
		});
		this.internalListeners.set(e, t), this.updateProactiveRefresh();
	}
	removeAuthTokenListener(e) {
		this.assertAuthConfigured();
		let t = this.internalListeners.get(e);
		t && (this.internalListeners.delete(e), t(), this.updateProactiveRefresh());
	}
	assertAuthConfigured() {
		S(this.auth._initializationPromise, "dependent-sdk-initialized-before-auth");
	}
	updateProactiveRefresh() {
		this.internalListeners.size > 0 ? this.auth._startProactiveRefresh() : this.auth._stopProactiveRefresh();
	}
};
function Ya(e) {
	switch (e) {
		case "Node": return "node";
		case "ReactNative": return "rn";
		case "Worker": return "webworker";
		case "Cordova": return "cordova";
		case "WebExtension": return "web-extension";
		default: return;
	}
}
function Xa(e) {
	Bt(new we("auth", (t, { options: n }) => {
		let r = t.getProvider("app").getImmediate(), i = t.getProvider("heartbeat"), a = t.getProvider("app-check-internal"), { apiKey: o, authDomain: s } = r.options;
		S(o && !o.includes(":"), "invalid-api-key", { appName: r.name });
		let c = new Nr(r, i, a, {
			apiKey: o,
			authDomain: s,
			clientPlatform: e,
			apiHost: "identitytoolkit.googleapis.com",
			tokenApiHost: "securetoken.googleapis.com",
			apiScheme: "https",
			sdkClientVersion: Or(e)
		});
		return Hr(c, n), c;
	}, "PUBLIC").setInstantiationMode("EXPLICIT").setInstanceCreatedCallback((e, t, n) => {
		e.getProvider("auth-internal").initialize();
	})), Bt(new we("auth-internal", (e) => ((e) => new Ja(e))(Pr(e.getProvider("auth").getImmediate())), "PRIVATE").setInstantiationMode("EXPLICIT")), x(Ka, qa, Ya(e)), x(Ka, qa, "esm2017");
}
var Za = ee("authIdTokenMaxAge") || 300, Qa = null, $a = (e) => async (t) => {
	let n = t && await t.getIdTokenResult(), r = n && ((/* @__PURE__ */ new Date()).getTime() - Date.parse(n.issuedAtTime)) / 1e3;
	if (r && r > Za) return;
	let i = n?.token;
	Qa !== i && (Qa = i, await fetch(e, {
		method: i ? "POST" : "DELETE",
		headers: i ? { Authorization: `Bearer ${i}` } : {}
	}));
};
function eo(e = qt()) {
	let t = Vt(e, "auth");
	if (t.isInitialized()) return t.getImmediate();
	let n = Vr(e, {
		popupRedirectResolver: Ga,
		persistence: [
			Ki,
			yi,
			xi
		]
	}), r = ee("authTokenSyncURL");
	if (r && typeof isSecureContext == "boolean" && isSecureContext) {
		let e = new URL(r, location.origin);
		if (location.origin === e.origin) {
			let t = $a(e.toString());
			fi(n, t, () => t(n.currentUser)), di(n, (e) => t(e));
		}
	}
	let i = f("auth");
	return i && Ur(n, `http://${i}`), n;
}
function to() {
	return document.getElementsByTagName("head")?.[0] ?? document;
}
Lr({
	loadJS(e) {
		return new Promise((t, n) => {
			let r = document.createElement("script");
			r.setAttribute("src", e), r.onload = t, r.onerror = (e) => {
				let t = bn("internal-error");
				t.customData = e, n(t);
			}, r.type = "text/javascript", r.charset = "UTF-8", to().appendChild(r);
		});
	},
	gapiScript: "https://apis.google.com/js/api.js",
	recaptchaV2Script: "https://www.google.com/recaptcha/api.js",
	recaptchaEnterpriseScript: "https://www.google.com/recaptcha/enterprise.js?render="
}), Xa("Browser");
//#endregion
//#region node_modules/@firebase/webchannel-wrapper/dist/esm/index.esm2017.js
var no = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {}, ro = {}, C, io = io || {}, w = no || self;
function ao(e) {
	var t = typeof e;
	return t = t == "object" ? e ? Array.isArray(e) ? "array" : t : "null" : t, t == "array" || t == "object" && typeof e.length == "number";
}
function oo(e) {
	var t = typeof e;
	return t == "object" && e != null || t == "function";
}
function so(e) {
	return Object.prototype.hasOwnProperty.call(e, co) && e[co] || (e[co] = ++lo);
}
var co = "closure_uid_" + (1e9 * Math.random() >>> 0), lo = 0;
function uo(e, t, n) {
	return e.call.apply(e.bind, arguments);
}
function fo(e, t, n) {
	if (!e) throw Error();
	if (2 < arguments.length) {
		var r = Array.prototype.slice.call(arguments, 2);
		return function() {
			var n = Array.prototype.slice.call(arguments);
			return Array.prototype.unshift.apply(n, r), e.apply(t, n);
		};
	}
	return function() {
		return e.apply(t, arguments);
	};
}
function po(e, t, n) {
	return po = Function.prototype.bind && Function.prototype.bind.toString().indexOf("native code") != -1 ? uo : fo, po.apply(null, arguments);
}
function mo(e, t) {
	var n = Array.prototype.slice.call(arguments, 1);
	return function() {
		var t = n.slice();
		return t.push.apply(t, arguments), e.apply(this, t);
	};
}
function ho(e, t) {
	function n() {}
	n.prototype = t.prototype, e.$ = t.prototype, e.prototype = new n(), e.prototype.constructor = e, e.ac = function(e, n, r) {
		for (var i = Array(arguments.length - 2), a = 2; a < arguments.length; a++) i[a - 2] = arguments[a];
		return t.prototype[n].apply(e, i);
	};
}
function go() {
	this.s = this.s, this.o = this.o;
}
var _o = 0;
go.prototype.s = !1, go.prototype.sa = function() {
	!this.s && (this.s = !0, this.N(), _o != 0) && so(this);
}, go.prototype.N = function() {
	if (this.o) for (; this.o.length;) this.o.shift()();
};
var vo = Array.prototype.indexOf ? function(e, t) {
	return Array.prototype.indexOf.call(e, t, void 0);
} : function(e, t) {
	if (typeof e == "string") return typeof t != "string" || t.length != 1 ? -1 : e.indexOf(t, 0);
	for (let n = 0; n < e.length; n++) if (n in e && e[n] === t) return n;
	return -1;
};
function yo(e) {
	let t = e.length;
	if (0 < t) {
		let n = Array(t);
		for (let r = 0; r < t; r++) n[r] = e[r];
		return n;
	}
	return [];
}
function bo(e, t) {
	for (let t = 1; t < arguments.length; t++) {
		let n = arguments[t];
		if (ao(n)) {
			let t = e.length || 0, r = n.length || 0;
			e.length = t + r;
			for (let i = 0; i < r; i++) e[t + i] = n[i];
		} else e.push(n);
	}
}
function xo(e, t) {
	this.type = e, this.g = this.target = t, this.defaultPrevented = !1;
}
xo.prototype.h = function() {
	this.defaultPrevented = !0;
};
var So = function() {
	if (!w.addEventListener || !Object.defineProperty) return !1;
	var e = !1, t = Object.defineProperty({}, "passive", { get: function() {
		e = !0;
	} });
	try {
		let e = () => {};
		w.addEventListener("test", e, t), w.removeEventListener("test", e, t);
	} catch {}
	return e;
}();
function Co(e) {
	return /^[\s\xa0]*$/.test(e);
}
function wo() {
	var e = w.navigator;
	return (e &&= e.userAgent) ? e : "";
}
function To(e) {
	return wo().indexOf(e) != -1;
}
function Eo(e) {
	return Eo[" "](e), e;
}
Eo[" "] = function() {};
function Do(e, t) {
	var n = cu;
	return Object.prototype.hasOwnProperty.call(n, e) ? n[e] : n[e] = t(e);
}
var Oo = To("Opera"), ko = To("Trident") || To("MSIE"), Ao = To("Edge"), jo = Ao || ko, Mo = To("Gecko") && !(wo().toLowerCase().indexOf("webkit") != -1 && !To("Edge")) && !(To("Trident") || To("MSIE")) && !To("Edge"), No = wo().toLowerCase().indexOf("webkit") != -1 && !To("Edge");
function Po() {
	var e = w.document;
	return e ? e.documentMode : void 0;
}
var Fo;
a: {
	var Io = "", Lo = function() {
		var e = wo();
		if (Mo) return /rv:([^\);]+)(\)|;)/.exec(e);
		if (Ao) return /Edge\/([\d\.]+)/.exec(e);
		if (ko) return /\b(?:MSIE|rv)[: ]([^\);]+)(\)|;)/.exec(e);
		if (No) return /WebKit\/(\S+)/.exec(e);
		if (Oo) return /(?:Version)[ \/]?(\S+)/.exec(e);
	}();
	if (Lo && (Io = Lo ? Lo[1] : ""), ko) {
		var Ro = Po();
		if (Ro != null && Ro > parseFloat(Io)) {
			Fo = String(Ro);
			break a;
		}
	}
	Fo = Io;
}
var zo = w.document && ko && (Po() || parseInt(Fo, 10)) || void 0;
function Bo(e, t) {
	if (xo.call(this, e ? e.type : ""), this.relatedTarget = this.g = this.target = null, this.button = this.screenY = this.screenX = this.clientY = this.clientX = 0, this.key = "", this.metaKey = this.shiftKey = this.altKey = this.ctrlKey = !1, this.state = null, this.pointerId = 0, this.pointerType = "", this.i = null, e) {
		var n = this.type = e.type, r = e.changedTouches && e.changedTouches.length ? e.changedTouches[0] : null;
		if (this.target = e.target || e.srcElement, this.g = t, t = e.relatedTarget) {
			if (Mo) {
				a: {
					try {
						Eo(t.nodeName);
						var i = !0;
						break a;
					} catch {}
					i = !1;
				}
				i || (t = null);
			}
		} else n == "mouseover" ? t = e.fromElement : n == "mouseout" && (t = e.toElement);
		this.relatedTarget = t, r ? (this.clientX = r.clientX === void 0 ? r.pageX : r.clientX, this.clientY = r.clientY === void 0 ? r.pageY : r.clientY, this.screenX = r.screenX || 0, this.screenY = r.screenY || 0) : (this.clientX = e.clientX === void 0 ? e.pageX : e.clientX, this.clientY = e.clientY === void 0 ? e.pageY : e.clientY, this.screenX = e.screenX || 0, this.screenY = e.screenY || 0), this.button = e.button, this.key = e.key || "", this.ctrlKey = e.ctrlKey, this.altKey = e.altKey, this.shiftKey = e.shiftKey, this.metaKey = e.metaKey, this.pointerId = e.pointerId || 0, this.pointerType = typeof e.pointerType == "string" ? e.pointerType : Vo[e.pointerType] || "", this.state = e.state, this.i = e, e.defaultPrevented && Bo.$.h.call(this);
	}
}
ho(Bo, xo);
var Vo = {
	2: "touch",
	3: "pen",
	4: "mouse"
};
Bo.prototype.h = function() {
	Bo.$.h.call(this);
	var e = this.i;
	e.preventDefault ? e.preventDefault() : e.returnValue = !1;
};
var Ho = "closure_listenable_" + (1e6 * Math.random() | 0), Uo = 0;
function Wo(e, t, n, r, i) {
	this.listener = e, this.proxy = null, this.src = t, this.type = n, this.capture = !!r, this.la = i, this.key = ++Uo, this.fa = this.ia = !1;
}
function Go(e) {
	e.fa = !0, e.listener = null, e.proxy = null, e.src = null, e.la = null;
}
function Ko(e, t, n) {
	for (let r in e) t.call(n, e[r], r, e);
}
function qo(e, t) {
	for (let n in e) t.call(void 0, e[n], n, e);
}
function Jo(e) {
	let t = {};
	for (let n in e) t[n] = e[n];
	return t;
}
var Yo = "constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");
function Xo(e, t) {
	let n, r;
	for (let t = 1; t < arguments.length; t++) {
		for (n in r = arguments[t], r) e[n] = r[n];
		for (let t = 0; t < Yo.length; t++) n = Yo[t], Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
	}
}
function Zo(e) {
	this.src = e, this.g = {}, this.h = 0;
}
Zo.prototype.add = function(e, t, n, r, i) {
	var a = e.toString();
	e = this.g[a], e || (e = this.g[a] = [], this.h++);
	var o = $o(e, t, r, i);
	return -1 < o ? (t = e[o], n || (t.ia = !1)) : (t = new Wo(t, this.src, a, !!r, i), t.ia = n, e.push(t)), t;
};
function Qo(e, t) {
	var n = t.type;
	if (n in e.g) {
		var r = e.g[n], i = vo(r, t), a;
		(a = 0 <= i) && Array.prototype.splice.call(r, i, 1), a && (Go(t), e.g[n].length == 0 && (delete e.g[n], e.h--));
	}
}
function $o(e, t, n, r) {
	for (var i = 0; i < e.length; ++i) {
		var a = e[i];
		if (!a.fa && a.listener == t && a.capture == !!n && a.la == r) return i;
	}
	return -1;
}
var es = "closure_lm_" + (1e6 * Math.random() | 0), ts = {};
function ns(e, t, n, r, i) {
	if (r && r.once) return as(e, t, n, r, i);
	if (Array.isArray(t)) {
		for (var a = 0; a < t.length; a++) ns(e, t[a], n, r, i);
		return null;
	}
	return n = fs(n), e && e[Ho] ? e.O(t, n, oo(r) ? !!r.capture : !!r, i) : rs(e, t, n, !1, r, i);
}
function rs(e, t, n, r, i, a) {
	if (!t) throw Error("Invalid event type");
	var o = oo(i) ? !!i.capture : !!i, s = us(e);
	if (s || (e[es] = s = new Zo(e)), n = s.add(t, n, r, o, a), n.proxy) return n;
	if (r = is(), n.proxy = r, r.src = e, r.listener = n, e.addEventListener) So || (i = o), i === void 0 && (i = !1), e.addEventListener(t.toString(), r, i);
	else if (e.attachEvent) e.attachEvent(cs(t.toString()), r);
	else if (e.addListener && e.removeListener) e.addListener(r);
	else throw Error("addEventListener and attachEvent are unavailable.");
	return n;
}
function is() {
	function e(n) {
		return t.call(e.src, e.listener, n);
	}
	let t = ls;
	return e;
}
function as(e, t, n, r, i) {
	if (Array.isArray(t)) {
		for (var a = 0; a < t.length; a++) as(e, t[a], n, r, i);
		return null;
	}
	return n = fs(n), e && e[Ho] ? e.P(t, n, oo(r) ? !!r.capture : !!r, i) : rs(e, t, n, !0, r, i);
}
function os(e, t, n, r, i) {
	if (Array.isArray(t)) for (var a = 0; a < t.length; a++) os(e, t[a], n, r, i);
	else r = oo(r) ? !!r.capture : !!r, n = fs(n), e && e[Ho] ? (e = e.i, t = String(t).toString(), t in e.g && (a = e.g[t], n = $o(a, n, r, i), -1 < n && (Go(a[n]), Array.prototype.splice.call(a, n, 1), a.length == 0 && (delete e.g[t], e.h--)))) : (e &&= us(e)) && (t = e.g[t.toString()], e = -1, t && (e = $o(t, n, r, i)), (n = -1 < e ? t[e] : null) && ss(n));
}
function ss(e) {
	if (typeof e != "number" && e && !e.fa) {
		var t = e.src;
		if (t && t[Ho]) Qo(t.i, e);
		else {
			var n = e.type, r = e.proxy;
			t.removeEventListener ? t.removeEventListener(n, r, e.capture) : t.detachEvent ? t.detachEvent(cs(n), r) : t.addListener && t.removeListener && t.removeListener(r), (n = us(t)) ? (Qo(n, e), n.h == 0 && (n.src = null, t[es] = null)) : Go(e);
		}
	}
}
function cs(e) {
	return e in ts ? ts[e] : ts[e] = "on" + e;
}
function ls(e, t) {
	if (e.fa) e = !0;
	else {
		t = new Bo(t, this);
		var n = e.listener, r = e.la || e.src;
		e.ia && ss(e), e = n.call(r, t);
	}
	return e;
}
function us(e) {
	return e = e[es], e instanceof Zo ? e : null;
}
var ds = "__closure_events_fn_" + (1e9 * Math.random() >>> 0);
function fs(e) {
	return typeof e == "function" ? e : (e[ds] || (e[ds] = function(t) {
		return e.handleEvent(t);
	}), e[ds]);
}
function ps() {
	go.call(this), this.i = new Zo(this), this.S = this, this.J = null;
}
ho(ps, go), ps.prototype[Ho] = !0, ps.prototype.removeEventListener = function(e, t, n, r) {
	os(this, e, t, n, r);
};
function ms(e, t) {
	var n, r = e.J;
	if (r) for (n = []; r; r = r.J) n.push(r);
	if (e = e.S, r = t.type || t, typeof t == "string") t = new xo(t, e);
	else if (t instanceof xo) t.target = t.target || e;
	else {
		var i = t;
		t = new xo(r, e), Xo(t, i);
	}
	if (i = !0, n) for (var a = n.length - 1; 0 <= a; a--) {
		var o = t.g = n[a];
		i = hs(o, r, !0, t) && i;
	}
	if (o = t.g = e, i = hs(o, r, !0, t) && i, i = hs(o, r, !1, t) && i, n) for (a = 0; a < n.length; a++) o = t.g = n[a], i = hs(o, r, !1, t) && i;
}
ps.prototype.N = function() {
	if (ps.$.N.call(this), this.i) {
		var e = this.i, t;
		for (t in e.g) {
			for (var n = e.g[t], r = 0; r < n.length; r++) Go(n[r]);
			delete e.g[t], e.h--;
		}
	}
	this.J = null;
}, ps.prototype.O = function(e, t, n, r) {
	return this.i.add(String(e), t, !1, n, r);
}, ps.prototype.P = function(e, t, n, r) {
	return this.i.add(String(e), t, !0, n, r);
};
function hs(e, t, n, r) {
	if (t = e.i.g[String(t)], !t) return !0;
	t = t.concat();
	for (var i = !0, a = 0; a < t.length; ++a) {
		var o = t[a];
		if (o && !o.fa && o.capture == n) {
			var s = o.listener, c = o.la || o.src;
			o.ia && Qo(e.i, o), i = !1 !== s.call(c, r) && i;
		}
	}
	return i && !r.defaultPrevented;
}
var gs = w.JSON.stringify, _s = class {
	constructor(e, t) {
		this.i = e, this.j = t, this.h = 0, this.g = null;
	}
	get() {
		let e;
		return 0 < this.h ? (this.h--, e = this.g, this.g = e.next, e.next = null) : e = this.i(), e;
	}
};
function vs() {
	var e = Es;
	let t = null;
	return e.g && (t = e.g, e.g = e.g.next, e.g || (e.h = null), t.next = null), t;
}
var ys = class {
	constructor() {
		this.h = this.g = null;
	}
	add(e, t) {
		let n = bs.get();
		n.set(e, t), this.h ? this.h.next = n : this.g = n, this.h = n;
	}
}, bs = new _s(() => new xs(), (e) => e.reset()), xs = class {
	constructor() {
		this.next = this.g = this.h = null;
	}
	set(e, t) {
		this.h = e, this.g = t, this.next = null;
	}
	reset() {
		this.next = this.g = this.h = null;
	}
};
function Ss(e) {
	var t = 1;
	e = e.split(":");
	let n = [];
	for (; 0 < t && e.length;) n.push(e.shift()), t--;
	return e.length && n.push(e.join(":")), n;
}
function Cs(e) {
	w.setTimeout(() => {
		throw e;
	}, 0);
}
var ws, Ts = !1, Es = new ys(), Ds = () => {
	let e = w.Promise.resolve(void 0);
	ws = () => {
		e.then(Os);
	};
}, Os = () => {
	for (var e; e = vs();) {
		try {
			e.h.call(e.g);
		} catch (e) {
			Cs(e);
		}
		var t = bs;
		t.j(e), 100 > t.h && (t.h++, e.next = t.g, t.g = e);
	}
	Ts = !1;
};
function ks(e, t) {
	ps.call(this), this.h = e || 1, this.g = t || w, this.j = po(this.qb, this), this.l = Date.now();
}
ho(ks, ps), C = ks.prototype, C.ga = !1, C.T = null, C.qb = function() {
	if (this.ga) {
		var e = Date.now() - this.l;
		0 < e && e < .8 * this.h ? this.T = this.g.setTimeout(this.j, this.h - e) : (this.T &&= (this.g.clearTimeout(this.T), null), ms(this, "tick"), this.ga && (As(this), this.start()));
	}
}, C.start = function() {
	this.ga = !0, this.T || (this.T = this.g.setTimeout(this.j, this.h), this.l = Date.now());
};
function As(e) {
	e.ga = !1, e.T &&= (e.g.clearTimeout(e.T), null);
}
C.N = function() {
	ks.$.N.call(this), As(this), delete this.g;
};
function js(e, t, n) {
	if (typeof e == "function") n && (e = po(e, n));
	else if (e && typeof e.handleEvent == "function") e = po(e.handleEvent, e);
	else throw Error("Invalid listener argument");
	return 2147483647 < Number(t) ? -1 : w.setTimeout(e, t || 0);
}
function Ms(e) {
	e.g = js(() => {
		e.g = null, e.i && (e.i = !1, Ms(e));
	}, e.j);
	let t = e.h;
	e.h = null, e.m.apply(null, t);
}
var Ns = class extends go {
	constructor(e, t) {
		super(), this.m = e, this.j = t, this.h = null, this.i = !1, this.g = null;
	}
	l(e) {
		this.h = arguments, this.g ? this.i = !0 : Ms(this);
	}
	N() {
		super.N(), this.g && (w.clearTimeout(this.g), this.g = null, this.i = !1, this.h = null);
	}
};
function Ps(e) {
	go.call(this), this.h = e, this.g = {};
}
ho(Ps, go);
var Fs = [];
function Is(e, t, n, r) {
	Array.isArray(n) || (n && (Fs[0] = n.toString()), n = Fs);
	for (var i = 0; i < n.length; i++) {
		var a = ns(t, n[i], r || e.handleEvent, !1, e.h || e);
		if (!a) break;
		e.g[a.key] = a;
	}
}
function Ls(e) {
	Ko(e.g, function(e, t) {
		this.g.hasOwnProperty(t) && ss(e);
	}, e), e.g = {};
}
Ps.prototype.N = function() {
	Ps.$.N.call(this), Ls(this);
}, Ps.prototype.handleEvent = function() {
	throw Error("EventHandler.handleEvent not implemented");
};
function Rs() {
	this.g = !0;
}
Rs.prototype.Ea = function() {
	this.g = !1;
};
function zs(e, t, n, r, i, a) {
	e.info(function() {
		if (e.g) {
			if (a) for (var o = "", s = a.split("&"), c = 0; c < s.length; c++) {
				var l = s[c].split("=");
				if (1 < l.length) {
					var u = l[0];
					l = l[1];
					var d = u.split("_");
					o = 2 <= d.length && d[1] == "type" ? o + (u + "=" + l + "&") : o + (u + "=redacted&");
				}
			}
			else o = null;
		} else o = a;
		return "XMLHTTP REQ (" + r + ") [attempt " + i + "]: " + t + "\n" + n + "\n" + o;
	});
}
function Bs(e, t, n, r, i, a, o) {
	e.info(function() {
		return "XMLHTTP RESP (" + r + ") [ attempt " + i + "]: " + t + "\n" + n + "\n" + a + " " + o;
	});
}
function Vs(e, t, n, r) {
	e.info(function() {
		return "XMLHTTP TEXT (" + t + "): " + Us(e, n) + (r ? " " + r : "");
	});
}
function Hs(e, t) {
	e.info(function() {
		return "TIMEOUT: " + t;
	});
}
Rs.prototype.info = function() {};
function Us(e, t) {
	if (!e.g) return t;
	if (!t) return null;
	try {
		var n = JSON.parse(t);
		if (n) {
			for (e = 0; e < n.length; e++) if (Array.isArray(n[e])) {
				var r = n[e];
				if (!(2 > r.length)) {
					var i = r[1];
					if (Array.isArray(i) && !(1 > i.length)) {
						var a = i[0];
						if (a != "noop" && a != "stop" && a != "close") for (var o = 1; o < i.length; o++) i[o] = "";
					}
				}
			}
		}
		return gs(n);
	} catch {
		return t;
	}
}
var Ws = {}, Gs = null;
function Ks() {
	return Gs ||= new ps();
}
Ws.Ta = "serverreachability";
function qs(e) {
	xo.call(this, Ws.Ta, e);
}
ho(qs, xo);
function Js(e) {
	let t = Ks();
	ms(t, new qs(t));
}
Ws.STAT_EVENT = "statevent";
function Ys(e, t) {
	xo.call(this, Ws.STAT_EVENT, e), this.stat = t;
}
ho(Ys, xo);
function Xs(e) {
	let t = Ks();
	ms(t, new Ys(t, e));
}
Ws.Ua = "timingevent";
function Zs(e, t) {
	xo.call(this, Ws.Ua, e), this.size = t;
}
ho(Zs, xo);
function Qs(e, t) {
	if (typeof e != "function") throw Error("Fn must not be null and must be a function");
	return w.setTimeout(function() {
		e();
	}, t);
}
var $s = {
	NO_ERROR: 0,
	rb: 1,
	Eb: 2,
	Db: 3,
	yb: 4,
	Cb: 5,
	Fb: 6,
	Qa: 7,
	TIMEOUT: 8,
	Ib: 9
}, ec = {
	wb: "complete",
	Sb: "success",
	Ra: "error",
	Qa: "abort",
	Kb: "ready",
	Lb: "readystatechange",
	TIMEOUT: "timeout",
	Gb: "incrementaldata",
	Jb: "progress",
	zb: "downloadprogress",
	$b: "uploadprogress"
};
function tc() {}
tc.prototype.h = null;
function nc(e) {
	return e.h ||= e.i();
}
function rc() {}
var ic = {
	OPEN: "a",
	vb: "b",
	Ra: "c",
	Hb: "d"
};
function ac() {
	xo.call(this, "d");
}
ho(ac, xo);
function oc() {
	xo.call(this, "c");
}
ho(oc, xo);
var sc;
function cc() {}
ho(cc, tc), cc.prototype.g = function() {
	return new XMLHttpRequest();
}, cc.prototype.i = function() {
	return {};
}, sc = new cc();
function lc(e, t, n, r) {
	this.l = e, this.j = t, this.m = n, this.W = r || 1, this.U = new Ps(this), this.P = dc, e = jo ? 125 : void 0, this.V = new ks(e), this.I = null, this.i = !1, this.u = this.B = this.A = this.L = this.G = this.Y = this.C = null, this.F = [], this.g = null, this.o = 0, this.s = this.v = null, this.ca = -1, this.J = !1, this.O = 0, this.M = null, this.ba = this.K = this.aa = this.S = !1, this.h = new uc();
}
function uc() {
	this.i = null, this.g = "", this.h = !1;
}
var dc = 45e3, fc = {}, pc = {};
C = lc.prototype, C.setTimeout = function(e) {
	this.P = e;
};
function mc(e, t, n) {
	e.L = 1, e.A = Fc(jc(t)), e.u = n, e.S = !0, hc(e, null);
}
function hc(e, t) {
	e.G = Date.now(), yc(e), e.B = jc(e.A);
	var n = e.B, r = e.W;
	Array.isArray(r) || (r = [String(r)]), Jc(n.i, "t", r), e.o = 0, n = e.l.J, e.h = new uc(), e.g = Ql(e.l, n ? t : null, !e.u), 0 < e.O && (e.M = new Ns(po(e.Pa, e, e.g), e.O)), Is(e.U, e.g, "readystatechange", e.nb), t = e.I ? Jo(e.I) : {}, e.u ? (e.v ||= "POST", t["Content-Type"] = "application/x-www-form-urlencoded", e.g.ha(e.B, e.v, e.u, t)) : (e.v = "GET", e.g.ha(e.B, e.v, null, t)), Js(), zs(e.j, e.v, e.B, e.m, e.W, e.u);
}
C.nb = function(e) {
	e = e.target;
	let t = this.M;
	t && Dl(e) == 3 ? t.l() : this.Pa(e);
}, C.Pa = function(e) {
	try {
		if (e == this.g) a: {
			let u = Dl(this.g);
			var t = this.g.Ia();
			let d = this.g.da();
			if (!(3 > u) && (u != 3 || jo || this.g && (this.h.h || this.g.ja() || Ol(this.g)))) {
				this.J || u != 4 || t == 7 || Js(t == 8 || 0 >= d ? 3 : 2), xc(this);
				var n = this.g.da();
				this.ca = n;
				b: if (gc(this)) {
					var r = Ol(this.g);
					e = "";
					var i = r.length, a = Dl(this.g) == 4;
					if (!this.h.i) {
						if (typeof TextDecoder > "u") {
							Cc(this), Sc(this);
							var o = "";
							break b;
						}
						this.h.i = new w.TextDecoder();
					}
					for (t = 0; t < i; t++) this.h.h = !0, e += this.h.i.decode(r[t], { stream: a && t == i - 1 });
					r.length = 0, this.h.g += e, this.o = 0, o = this.h.g;
				} else o = this.g.ja();
				if (this.i = n == 200, Bs(this.j, this.v, this.B, this.m, this.W, u, n), this.i) {
					if (this.aa && !this.K) {
						b: {
							if (this.g) {
								var s, c = this.g;
								if ((s = c.g ? c.g.getResponseHeader("X-HTTP-Initial-Response") : null) && !Co(s)) {
									var l = s;
									break b;
								}
							}
							l = null;
						}
						if (n = l) Vs(this.j, this.m, n, "Initial handshake response via X-HTTP-Initial-Response"), this.K = !0, wc(this, n);
						else {
							this.i = !1, this.s = 3, Xs(12), Cc(this), Sc(this);
							break a;
						}
					}
					this.S ? (_c(this, u, o), jo && this.i && u == 3 && (Is(this.U, this.V, "tick", this.mb), this.V.start())) : (Vs(this.j, this.m, o, null), wc(this, o)), u == 4 && Cc(this), this.i && !this.J && (u == 4 ? ql(this.l, this) : (this.i = !1, yc(this)));
				} else kl(this.g), n == 400 && 0 < o.indexOf("Unknown SID") ? (this.s = 3, Xs(12)) : (this.s = 0, Xs(13)), Cc(this), Sc(this);
			}
		}
	} catch {}
};
function gc(e) {
	return e.g ? e.v == "GET" && e.L != 2 && e.l.Ha : !1;
}
function _c(e, t, n) {
	let r = !0, i;
	for (; !e.J && e.o < n.length;) if (i = vc(e, n), i == pc) {
		t == 4 && (e.s = 4, Xs(14), r = !1), Vs(e.j, e.m, null, "[Incomplete Response]");
		break;
	} else if (i == fc) {
		e.s = 4, Xs(15), Vs(e.j, e.m, n, "[Invalid Chunk]"), r = !1;
		break;
	} else Vs(e.j, e.m, i, null), wc(e, i);
	gc(e) && e.o != 0 && (e.h.g = e.h.g.slice(e.o), e.o = 0), t != 4 || n.length != 0 || e.h.h || (e.s = 1, Xs(16), r = !1), e.i = e.i && r, r ? 0 < n.length && !e.ba && (e.ba = !0, t = e.l, t.g == e && t.ca && !t.M && (t.l.info("Great, no buffering proxy detected. Bytes received: " + n.length), Wl(t), t.M = !0, Xs(11))) : (Vs(e.j, e.m, n, "[Invalid Chunked Response]"), Cc(e), Sc(e));
}
C.mb = function() {
	if (this.g) {
		var e = Dl(this.g), t = this.g.ja();
		this.o < t.length && (xc(this), _c(this, e, t), this.i && e != 4 && yc(this));
	}
};
function vc(e, t) {
	var n = e.o, r = t.indexOf("\n", n);
	return r == -1 ? pc : (n = Number(t.substring(n, r)), isNaN(n) ? fc : (r += 1, r + n > t.length ? pc : (t = t.slice(r, r + n), e.o = r + n, t)));
}
C.cancel = function() {
	this.J = !0, Cc(this);
};
function yc(e) {
	e.Y = Date.now() + e.P, bc(e, e.P);
}
function bc(e, t) {
	if (e.C != null) throw Error("WatchDog timer not null");
	e.C = Qs(po(e.lb, e), t);
}
function xc(e) {
	e.C &&= (w.clearTimeout(e.C), null);
}
C.lb = function() {
	this.C = null;
	let e = Date.now();
	0 <= e - this.Y ? (Hs(this.j, this.B), this.L != 2 && (Js(), Xs(17)), Cc(this), this.s = 2, Sc(this)) : bc(this, this.Y - e);
};
function Sc(e) {
	e.l.H == 0 || e.J || ql(e.l, e);
}
function Cc(e) {
	xc(e);
	var t = e.M;
	t && typeof t.sa == "function" && t.sa(), e.M = null, As(e.V), Ls(e.U), e.g && (t = e.g, e.g = null, t.abort(), t.sa());
}
function wc(e, t) {
	try {
		var n = e.l;
		if (n.H != 0 && (n.g == e || nl(n.i, e))) {
			if (!e.K && nl(n.i, e) && n.H == 3) {
				try {
					var r = n.Ja.g.parse(t);
				} catch {
					r = null;
				}
				if (Array.isArray(r) && r.length == 3) {
					var i = r;
					if (i[0] == 0) {
						a: if (!n.u) {
							if (n.g) {
								if (n.g.G + 3e3 < e.G) Kl(n), Fl(n);
								else break a;
							}
							Ul(n), Xs(18);
						}
					} else n.Fa = i[1], 0 < n.Fa - n.V && 37500 > i[2] && n.G && n.A == 0 && !n.v && (n.v = Qs(po(n.ib, n), 6e3));
					if (1 >= tl(n.i) && n.oa) {
						try {
							n.oa();
						} catch {}
						n.oa = void 0;
					}
				} else Yl(n, 11);
			} else if ((e.K || n.g == e) && Kl(n), !Co(t)) for (i = n.Ja.g.parse(t), t = 0; t < i.length; t++) {
				let l = i[t];
				if (n.V = l[0], l = l[1], n.H == 2) {
					if (l[0] == "c") {
						n.K = l[1], n.pa = l[2];
						let t = l[3];
						t != null && (n.ra = t, n.l.info("VER=" + n.ra));
						let i = l[4];
						i != null && (n.Ga = i, n.l.info("SVER=" + n.Ga));
						let u = l[5];
						u != null && typeof u == "number" && 0 < u && (r = 1.5 * u, n.L = r, n.l.info("backChannelRequestTimeoutMs_=" + r)), r = n;
						let d = e.g;
						if (d) {
							let e = d.g ? d.g.getResponseHeader("X-Client-Wire-Protocol") : null;
							if (e) {
								var a = r.i;
								a.g || e.indexOf("spdy") == -1 && e.indexOf("quic") == -1 && e.indexOf("h2") == -1 || (a.j = a.l, a.g = /* @__PURE__ */ new Set(), a.h &&= (rl(a, a.h), null));
							}
							if (r.F) {
								let e = d.g ? d.g.getResponseHeader("X-HTTP-Session-Id") : null;
								e && (r.Da = e, T(r.I, r.F, e));
							}
						}
						n.H = 3, n.h && n.h.Ba(), n.ca && (n.S = Date.now() - e.G, n.l.info("Handshake RTT: " + n.S + "ms")), r = n;
						var o = e;
						if (r.wa = Zl(r, r.J ? r.pa : null, r.Y), o.K) {
							il(r.i, o);
							var s = o, c = r.L;
							c && s.setTimeout(c), s.C && (xc(s), yc(s)), r.g = o;
						} else Hl(r);
						0 < n.j.length && Ll(n);
					} else l[0] != "stop" && l[0] != "close" || Yl(n, 7);
				} else n.H == 3 && (l[0] == "stop" || l[0] == "close" ? l[0] == "stop" ? Yl(n, 7) : Pl(n) : l[0] != "noop" && n.h && n.h.Aa(l), n.A = 0);
			}
		}
		Js(4);
	} catch {}
}
function Tc(e) {
	if (e.Z && typeof e.Z == "function") return e.Z();
	if (typeof Map < "u" && e instanceof Map || typeof Set < "u" && e instanceof Set) return Array.from(e.values());
	if (typeof e == "string") return e.split("");
	if (ao(e)) {
		for (var t = [], n = e.length, r = 0; r < n; r++) t.push(e[r]);
		return t;
	}
	for (r in t = [], n = 0, e) t[n++] = e[r];
	return t;
}
function Ec(e) {
	if (e.ta && typeof e.ta == "function") return e.ta();
	if (!e.Z || typeof e.Z != "function") {
		if (typeof Map < "u" && e instanceof Map) return Array.from(e.keys());
		if (!(typeof Set < "u" && e instanceof Set)) {
			if (ao(e) || typeof e == "string") {
				var t = [];
				e = e.length;
				for (var n = 0; n < e; n++) t.push(n);
				return t;
			}
			t = [], n = 0;
			for (let r in e) t[n++] = r;
			return t;
		}
	}
}
function Dc(e, t) {
	if (e.forEach && typeof e.forEach == "function") e.forEach(t, void 0);
	else if (ao(e) || typeof e == "string") Array.prototype.forEach.call(e, t, void 0);
	else for (var n = Ec(e), r = Tc(e), i = r.length, a = 0; a < i; a++) t.call(void 0, r[a], n && n[a], e);
}
var Oc = RegExp("^(?:([^:/?#.]+):)?(?://(?:([^\\\\/?#]*)@)?([^\\\\/?#]*?)(?::([0-9]+))?(?=[\\\\/?#]|$))?([^?#]+)?(?:\\?([^#]*))?(?:#([\\s\\S]*))?$");
function kc(e, t) {
	if (e) {
		e = e.split("&");
		for (var n = 0; n < e.length; n++) {
			var r = e[n].indexOf("="), i = null;
			if (0 <= r) {
				var a = e[n].substring(0, r);
				i = e[n].substring(r + 1);
			} else a = e[n];
			t(a, i ? decodeURIComponent(i.replace(/\+/g, " ")) : "");
		}
	}
}
function Ac(e) {
	if (this.g = this.s = this.j = "", this.m = null, this.o = this.l = "", this.h = !1, e instanceof Ac) {
		this.h = e.h, Mc(this, e.j), this.s = e.s, this.g = e.g, Nc(this, e.m), this.l = e.l;
		var t = e.i, n = new Wc();
		n.i = t.i, t.g && (n.g = new Map(t.g), n.h = t.h), Pc(this, n), this.o = e.o;
	} else e && (t = String(e).match(Oc)) ? (this.h = !1, Mc(this, t[1] || "", !0), this.s = Ic(t[2] || ""), this.g = Ic(t[3] || "", !0), Nc(this, t[4]), this.l = Ic(t[5] || "", !0), Pc(this, t[6] || "", !0), this.o = Ic(t[7] || "")) : (this.h = !1, this.i = new Wc(null, this.h));
}
Ac.prototype.toString = function() {
	var e = [], t = this.j;
	t && e.push(Lc(t, zc, !0), ":");
	var n = this.g;
	return (n || t == "file") && (e.push("//"), (t = this.s) && e.push(Lc(t, zc, !0), "@"), e.push(encodeURIComponent(String(n)).replace(/%25([0-9a-fA-F]{2})/g, "%$1")), n = this.m, n != null && e.push(":", String(n))), (n = this.l) && (this.g && n.charAt(0) != "/" && e.push("/"), e.push(Lc(n, n.charAt(0) == "/" ? Vc : Bc, !0))), (n = this.i.toString()) && e.push("?", n), (n = this.o) && e.push("#", Lc(n, Uc)), e.join("");
};
function jc(e) {
	return new Ac(e);
}
function Mc(e, t, n) {
	e.j = n ? Ic(t, !0) : t, e.j &&= e.j.replace(/:$/, "");
}
function Nc(e, t) {
	if (t) {
		if (t = Number(t), isNaN(t) || 0 > t) throw Error("Bad port number " + t);
		e.m = t;
	} else e.m = null;
}
function Pc(e, t, n) {
	t instanceof Wc ? (e.i = t, Xc(e.i, e.h)) : (n || (t = Lc(t, Hc)), e.i = new Wc(t, e.h));
}
function T(e, t, n) {
	e.i.set(t, n);
}
function Fc(e) {
	return T(e, "zx", Math.floor(2147483648 * Math.random()).toString(36) + Math.abs(Math.floor(2147483648 * Math.random()) ^ Date.now()).toString(36)), e;
}
function Ic(e, t) {
	return e ? t ? decodeURI(e.replace(/%25/g, "%2525")) : decodeURIComponent(e) : "";
}
function Lc(e, t, n) {
	return typeof e == "string" ? (e = encodeURI(e).replace(t, Rc), n && (e = e.replace(/%25([0-9a-fA-F]{2})/g, "%$1")), e) : null;
}
function Rc(e) {
	return e = e.charCodeAt(0), "%" + (e >> 4 & 15).toString(16) + (e & 15).toString(16);
}
var zc = /[#\/\?@]/g, Bc = /[#\?:]/g, Vc = /[#\?]/g, Hc = /[#\?@]/g, Uc = /#/g;
function Wc(e, t) {
	this.h = this.g = null, this.i = e || null, this.j = !!t;
}
function Gc(e) {
	e.g || (e.g = /* @__PURE__ */ new Map(), e.h = 0, e.i && kc(e.i, function(t, n) {
		e.add(decodeURIComponent(t.replace(/\+/g, " ")), n);
	}));
}
C = Wc.prototype, C.add = function(e, t) {
	Gc(this), this.i = null, e = Yc(this, e);
	var n = this.g.get(e);
	return n || this.g.set(e, n = []), n.push(t), this.h += 1, this;
};
function Kc(e, t) {
	Gc(e), t = Yc(e, t), e.g.has(t) && (e.i = null, e.h -= e.g.get(t).length, e.g.delete(t));
}
function qc(e, t) {
	return Gc(e), t = Yc(e, t), e.g.has(t);
}
C.forEach = function(e, t) {
	Gc(this), this.g.forEach(function(n, r) {
		n.forEach(function(n) {
			e.call(t, n, r, this);
		}, this);
	}, this);
}, C.ta = function() {
	Gc(this);
	let e = Array.from(this.g.values()), t = Array.from(this.g.keys()), n = [];
	for (let r = 0; r < t.length; r++) {
		let i = e[r];
		for (let e = 0; e < i.length; e++) n.push(t[r]);
	}
	return n;
}, C.Z = function(e) {
	Gc(this);
	let t = [];
	if (typeof e == "string") qc(this, e) && (t = t.concat(this.g.get(Yc(this, e))));
	else {
		e = Array.from(this.g.values());
		for (let n = 0; n < e.length; n++) t = t.concat(e[n]);
	}
	return t;
}, C.set = function(e, t) {
	return Gc(this), this.i = null, e = Yc(this, e), qc(this, e) && (this.h -= this.g.get(e).length), this.g.set(e, [t]), this.h += 1, this;
}, C.get = function(e, t) {
	return e ? (e = this.Z(e), 0 < e.length ? String(e[0]) : t) : t;
};
function Jc(e, t, n) {
	Kc(e, t), 0 < n.length && (e.i = null, e.g.set(Yc(e, t), yo(n)), e.h += n.length);
}
C.toString = function() {
	if (this.i) return this.i;
	if (!this.g) return "";
	let e = [], t = Array.from(this.g.keys());
	for (var n = 0; n < t.length; n++) {
		var r = t[n];
		let a = encodeURIComponent(String(r)), o = this.Z(r);
		for (r = 0; r < o.length; r++) {
			var i = a;
			o[r] !== "" && (i += "=" + encodeURIComponent(String(o[r]))), e.push(i);
		}
	}
	return this.i = e.join("&");
};
function Yc(e, t) {
	return t = String(t), e.j && (t = t.toLowerCase()), t;
}
function Xc(e, t) {
	t && !e.j && (Gc(e), e.i = null, e.g.forEach(function(e, t) {
		var n = t.toLowerCase();
		t != n && (Kc(this, t), Jc(this, n, e));
	}, e)), e.j = t;
}
var Zc = class {
	constructor(e, t) {
		this.g = e, this.map = t;
	}
};
function Qc(e) {
	this.l = e || $c, w.PerformanceNavigationTiming ? (e = w.performance.getEntriesByType("navigation"), e = 0 < e.length && (e[0].nextHopProtocol == "hq" || e[0].nextHopProtocol == "h2")) : e = !!(w.g && w.g.Ka && w.g.Ka() && w.g.Ka().dc), this.j = e ? this.l : 1, this.g = null, 1 < this.j && (this.g = /* @__PURE__ */ new Set()), this.h = null, this.i = [];
}
var $c = 10;
function el(e) {
	return e.h ? !0 : e.g ? e.g.size >= e.j : !1;
}
function tl(e) {
	return e.h ? 1 : e.g ? e.g.size : 0;
}
function nl(e, t) {
	return e.h ? e.h == t : e.g ? e.g.has(t) : !1;
}
function rl(e, t) {
	e.g ? e.g.add(t) : e.h = t;
}
function il(e, t) {
	e.h && e.h == t ? e.h = null : e.g && e.g.has(t) && e.g.delete(t);
}
Qc.prototype.cancel = function() {
	if (this.i = al(this), this.h) this.h.cancel(), this.h = null;
	else if (this.g && this.g.size !== 0) {
		for (let e of this.g.values()) e.cancel();
		this.g.clear();
	}
};
function al(e) {
	if (e.h != null) return e.i.concat(e.h.F);
	if (e.g != null && e.g.size !== 0) {
		let t = e.i;
		for (let n of e.g.values()) t = t.concat(n.F);
		return t;
	}
	return yo(e.i);
}
var ol = class {
	stringify(e) {
		return w.JSON.stringify(e, void 0);
	}
	parse(e) {
		return w.JSON.parse(e, void 0);
	}
};
function sl() {
	this.g = new ol();
}
function cl(e, t, n) {
	let r = n || "";
	try {
		Dc(e, function(e, n) {
			let i = e;
			oo(e) && (i = gs(e)), t.push(r + n + "=" + encodeURIComponent(i));
		});
	} catch (e) {
		throw t.push(r + "type=_badmap"), e;
	}
}
function ll(e, t) {
	let n = new Rs();
	if (w.Image) {
		let r = new Image();
		r.onload = mo(ul, n, r, "TestLoadImage: loaded", !0, t), r.onerror = mo(ul, n, r, "TestLoadImage: error", !1, t), r.onabort = mo(ul, n, r, "TestLoadImage: abort", !1, t), r.ontimeout = mo(ul, n, r, "TestLoadImage: timeout", !1, t), w.setTimeout(function() {
			r.ontimeout && r.ontimeout();
		}, 1e4), r.src = e;
	} else t(!1);
}
function ul(e, t, n, r, i) {
	try {
		t.onload = null, t.onerror = null, t.onabort = null, t.ontimeout = null, i(r);
	} catch {}
}
function dl(e) {
	this.l = e.ec || null, this.j = e.ob || !1;
}
ho(dl, tc), dl.prototype.g = function() {
	return new fl(this.l, this.j);
}, dl.prototype.i = function(e) {
	return function() {
		return e;
	};
}({});
function fl(e, t) {
	ps.call(this), this.F = e, this.u = t, this.m = void 0, this.readyState = pl, this.status = 0, this.responseType = this.responseText = this.response = this.statusText = "", this.onreadystatechange = null, this.v = new Headers(), this.h = null, this.C = "GET", this.B = "", this.g = !1, this.A = this.j = this.l = null;
}
ho(fl, ps);
var pl = 0;
C = fl.prototype, C.open = function(e, t) {
	if (this.readyState != pl) throw this.abort(), Error("Error reopening a connection");
	this.C = e, this.B = t, this.readyState = 1, gl(this);
}, C.send = function(e) {
	if (this.readyState != 1) throw this.abort(), Error("need to call open() first. ");
	this.g = !0;
	let t = {
		headers: this.v,
		method: this.C,
		credentials: this.m,
		cache: void 0
	};
	e && (t.body = e), (this.F || w).fetch(new Request(this.B, t)).then(this.$a.bind(this), this.ka.bind(this));
}, C.abort = function() {
	this.response = this.responseText = "", this.v = new Headers(), this.status = 0, this.j && this.j.cancel("Request was aborted.").catch(() => {}), 1 <= this.readyState && this.g && this.readyState != 4 && (this.g = !1, hl(this)), this.readyState = pl;
}, C.$a = function(e) {
	if (this.g && (this.l = e, this.h || (this.status = this.l.status, this.statusText = this.l.statusText, this.h = e.headers, this.readyState = 2, gl(this)), this.g && (this.readyState = 3, gl(this), this.g))) {
		if (this.responseType === "arraybuffer") e.arrayBuffer().then(this.Ya.bind(this), this.ka.bind(this));
		else if (w.ReadableStream !== void 0 && "body" in e) {
			if (this.j = e.body.getReader(), this.u) {
				if (this.responseType) throw Error("responseType must be empty for \"streamBinaryChunks\" mode responses.");
				this.response = [];
			} else this.response = this.responseText = "", this.A = new TextDecoder();
			ml(this);
		} else e.text().then(this.Za.bind(this), this.ka.bind(this));
	}
};
function ml(e) {
	e.j.read().then(e.Xa.bind(e)).catch(e.ka.bind(e));
}
C.Xa = function(e) {
	if (this.g) {
		if (this.u && e.value) this.response.push(e.value);
		else if (!this.u) {
			var t = e.value ? e.value : /* @__PURE__ */ new Uint8Array();
			(t = this.A.decode(t, { stream: !e.done })) && (this.response = this.responseText += t);
		}
		e.done ? hl(this) : gl(this), this.readyState == 3 && ml(this);
	}
}, C.Za = function(e) {
	this.g && (this.response = this.responseText = e, hl(this));
}, C.Ya = function(e) {
	this.g && (this.response = e, hl(this));
}, C.ka = function() {
	this.g && hl(this);
};
function hl(e) {
	e.readyState = 4, e.l = null, e.j = null, e.A = null, gl(e);
}
C.setRequestHeader = function(e, t) {
	this.v.append(e, t);
}, C.getResponseHeader = function(e) {
	return this.h && this.h.get(e.toLowerCase()) || "";
}, C.getAllResponseHeaders = function() {
	if (!this.h) return "";
	let e = [], t = this.h.entries();
	for (var n = t.next(); !n.done;) n = n.value, e.push(n[0] + ": " + n[1]), n = t.next();
	return e.join("\r\n");
};
function gl(e) {
	e.onreadystatechange && e.onreadystatechange.call(e);
}
Object.defineProperty(fl.prototype, "withCredentials", {
	get: function() {
		return this.m === "include";
	},
	set: function(e) {
		this.m = e ? "include" : "same-origin";
	}
});
var _l = w.JSON.parse;
function E(e) {
	ps.call(this), this.headers = /* @__PURE__ */ new Map(), this.u = e || null, this.h = !1, this.C = this.g = null, this.I = "", this.m = 0, this.j = "", this.l = this.G = this.v = this.F = !1, this.B = 0, this.A = null, this.K = vl, this.L = this.M = !1;
}
ho(E, ps);
var vl = "", yl = /^https?$/i, bl = ["POST", "PUT"];
C = E.prototype, C.Oa = function(e) {
	this.M = e;
}, C.ha = function(e, t, n, r) {
	if (this.g) throw Error("[goog.net.XhrIo] Object is active with another request=" + this.I + "; newUri=" + e);
	t = t ? t.toUpperCase() : "GET", this.I = e, this.j = "", this.m = 0, this.F = !1, this.h = !0, this.g = this.u ? this.u.g() : sc.g(), this.C = this.u ? nc(this.u) : nc(sc), this.g.onreadystatechange = po(this.La, this);
	try {
		this.G = !0, this.g.open(t, String(e), !0), this.G = !1;
	} catch (e) {
		Sl(this, e);
		return;
	}
	if (e = n || "", n = new Map(this.headers), r) {
		if (Object.getPrototypeOf(r) === Object.prototype) for (var i in r) n.set(i, r[i]);
		else if (typeof r.keys == "function" && typeof r.get == "function") for (let e of r.keys()) n.set(e, r.get(e));
		else throw Error("Unknown input type for opt_headers: " + String(r));
	}
	r = Array.from(n.keys()).find((e) => e.toLowerCase() == "content-type"), i = w.FormData && e instanceof w.FormData, !(0 <= vo(bl, t)) || r || i || n.set("Content-Type", "application/x-www-form-urlencoded;charset=utf-8");
	for (let [e, t] of n) this.g.setRequestHeader(e, t);
	this.K && (this.g.responseType = this.K), "withCredentials" in this.g && this.g.withCredentials !== this.M && (this.g.withCredentials = this.M);
	try {
		El(this), 0 < this.B && ((this.L = xl(this.g)) ? (this.g.timeout = this.B, this.g.ontimeout = po(this.ua, this)) : this.A = js(this.ua, this.B, this)), this.v = !0, this.g.send(e), this.v = !1;
	} catch (e) {
		Sl(this, e);
	}
};
function xl(e) {
	return ko && typeof e.timeout == "number" && e.ontimeout !== void 0;
}
C.ua = function() {
	io !== void 0 && this.g && (this.j = "Timed out after " + this.B + "ms, aborting", this.m = 8, ms(this, "timeout"), this.abort(8));
};
function Sl(e, t) {
	e.h = !1, e.g && (e.l = !0, e.g.abort(), e.l = !1), e.j = t, e.m = 5, Cl(e), Tl(e);
}
function Cl(e) {
	e.F || (e.F = !0, ms(e, "complete"), ms(e, "error"));
}
C.abort = function(e) {
	this.g && this.h && (this.h = !1, this.l = !0, this.g.abort(), this.l = !1, this.m = e || 7, ms(this, "complete"), ms(this, "abort"), Tl(this));
}, C.N = function() {
	this.g && (this.h && (this.h = !1, this.l = !0, this.g.abort(), this.l = !1), Tl(this, !0)), E.$.N.call(this);
}, C.La = function() {
	this.s || (this.G || this.v || this.l ? wl(this) : this.kb());
}, C.kb = function() {
	wl(this);
};
function wl(e) {
	if (e.h && io !== void 0 && (!e.C[1] || Dl(e) != 4 || e.da() != 2)) {
		if (e.v && Dl(e) == 4) js(e.La, 0, e);
		else if (ms(e, "readystatechange"), Dl(e) == 4) {
			e.h = !1;
			try {
				let o = e.da();
				a: switch (o) {
					case 200:
					case 201:
					case 202:
					case 204:
					case 206:
					case 304:
					case 1223:
						var t = !0;
						break a;
					default: t = !1;
				}
				var n;
				if (!(n = t)) {
					var r;
					if (r = o === 0) {
						var i = String(e.I).match(Oc)[1] || null;
						!i && w.self && w.self.location && (i = w.self.location.protocol.slice(0, -1)), r = !yl.test(i ? i.toLowerCase() : "");
					}
					n = r;
				}
				if (n) ms(e, "complete"), ms(e, "success");
				else {
					e.m = 6;
					try {
						var a = 2 < Dl(e) ? e.g.statusText : "";
					} catch {
						a = "";
					}
					e.j = a + " [" + e.da() + "]", Cl(e);
				}
			} finally {
				Tl(e);
			}
		}
	}
}
function Tl(e, t) {
	if (e.g) {
		El(e);
		let n = e.g, r = e.C[0] ? () => {} : null;
		e.g = null, e.C = null, t || ms(e, "ready");
		try {
			n.onreadystatechange = r;
		} catch {}
	}
}
function El(e) {
	e.g && e.L && (e.g.ontimeout = null), e.A &&= (w.clearTimeout(e.A), null);
}
C.isActive = function() {
	return !!this.g;
};
function Dl(e) {
	return e.g ? e.g.readyState : 0;
}
C.da = function() {
	try {
		return 2 < Dl(this) ? this.g.status : -1;
	} catch {
		return -1;
	}
}, C.ja = function() {
	try {
		return this.g ? this.g.responseText : "";
	} catch {
		return "";
	}
}, C.Wa = function(e) {
	if (this.g) {
		var t = this.g.responseText;
		return e && t.indexOf(e) == 0 && (t = t.substring(e.length)), _l(t);
	}
};
function Ol(e) {
	try {
		if (!e.g) return null;
		if ("response" in e.g) return e.g.response;
		switch (e.K) {
			case vl:
			case "text": return e.g.responseText;
			case "arraybuffer": if ("mozResponseArrayBuffer" in e.g) return e.g.mozResponseArrayBuffer;
		}
		return null;
	} catch {
		return null;
	}
}
function kl(e) {
	let t = {};
	e = (e.g && 2 <= Dl(e) && e.g.getAllResponseHeaders() || "").split("\r\n");
	for (let r = 0; r < e.length; r++) {
		if (Co(e[r])) continue;
		var n = Ss(e[r]);
		let i = n[0];
		if (n = n[1], typeof n != "string") continue;
		n = n.trim();
		let a = t[i] || [];
		t[i] = a, a.push(n);
	}
	qo(t, function(e) {
		return e.join(", ");
	});
}
C.Ia = function() {
	return this.m;
}, C.Sa = function() {
	return typeof this.j == "string" ? this.j : String(this.j);
};
function Al(e) {
	let t = "";
	return Ko(e, function(e, n) {
		t += n, t += ":", t += e, t += "\r\n";
	}), t;
}
function jl(e, t, n) {
	a: {
		for (r in n) {
			var r = !1;
			break a;
		}
		r = !0;
	}
	r || (n = Al(n), typeof e == "string" || T(e, t, n));
}
function Ml(e, t, n) {
	return n && n.internalChannelParams && n.internalChannelParams[e] || t;
}
function Nl(e) {
	this.Ga = 0, this.j = [], this.l = new Rs(), this.pa = this.wa = this.I = this.Y = this.g = this.Da = this.F = this.na = this.o = this.U = this.s = null, this.fb = this.W = 0, this.cb = Ml("failFast", !1, e), this.G = this.v = this.u = this.m = this.h = null, this.aa = !0, this.Fa = this.V = -1, this.ba = this.A = this.C = 0, this.ab = Ml("baseRetryDelayMs", 5e3, e), this.hb = Ml("retryDelaySeedMs", 1e4, e), this.eb = Ml("forwardChannelMaxRetries", 2, e), this.xa = Ml("forwardChannelRequestTimeoutMs", 2e4, e), this.va = e && e.xmlHttpFactory || void 0, this.Ha = e && e.useFetchStreams || !1, this.L = void 0, this.J = e && e.supportsCrossDomainXhr || !1, this.K = "", this.i = new Qc(e && e.concurrentRequestLimit), this.Ja = new sl(), this.P = e && e.fastHandshake || !1, this.O = e && e.encodeInitMessageHeaders || !1, this.P && this.O && (this.O = !1), this.bb = e && e.bc || !1, e && e.Ea && this.l.Ea(), e && e.forceLongPolling && (this.aa = !1), this.ca = !this.P && this.aa && e && e.detectBufferingProxy || !1, this.qa = void 0, e && e.longPollingTimeout && 0 < e.longPollingTimeout && (this.qa = e.longPollingTimeout), this.oa = void 0, this.S = 0, this.M = !1, this.ma = this.B = null;
}
C = Nl.prototype, C.ra = 8, C.H = 1;
function Pl(e) {
	if (Il(e), e.H == 3) {
		var t = e.W++, n = jc(e.I);
		if (T(n, "SID", e.K), T(n, "RID", t), T(n, "TYPE", "terminate"), Bl(e, n), t = new lc(e, e.l, t), t.L = 2, t.A = Fc(jc(n)), n = !1, w.navigator && w.navigator.sendBeacon) try {
			n = w.navigator.sendBeacon(t.A.toString(), "");
		} catch {}
		!n && w.Image && (new Image().src = t.A, n = !0), n || (t.g = Ql(t.l, null), t.g.ha(t.A)), t.G = Date.now(), yc(t);
	}
	Xl(e);
}
function Fl(e) {
	e.g &&= (Wl(e), e.g.cancel(), null);
}
function Il(e) {
	Fl(e), e.u &&= (w.clearTimeout(e.u), null), Kl(e), e.i.cancel(), e.m &&= (typeof e.m == "number" && w.clearTimeout(e.m), null);
}
function Ll(e) {
	if (!el(e.i) && !e.m) {
		e.m = !0;
		var t = e.Na;
		ws || Ds(), Ts ||= (ws(), !0), Es.add(t, e), e.C = 0;
	}
}
function Rl(e, t) {
	return tl(e.i) >= e.i.j - +!!e.m ? !1 : e.m ? (e.j = t.F.concat(e.j), !0) : e.H == 1 || e.H == 2 || e.C >= (e.cb ? 0 : e.eb) ? !1 : (e.m = Qs(po(e.Na, e, t), Jl(e, e.C)), e.C++, !0);
}
C.Na = function(e) {
	if (this.m) {
		if (this.m = null, this.H == 1) {
			if (!e) {
				this.W = Math.floor(1e5 * Math.random()), e = this.W++;
				let i = new lc(this, this.l, e), a = this.s;
				if (this.U && (a ? (a = Jo(a), Xo(a, this.U)) : a = this.U), this.o !== null || this.O || (i.I = a, a = null), this.P) a: {
					for (var t = 0, n = 0; n < this.j.length; n++) {
						b: {
							var r = this.j[n];
							if ("__data__" in r.map && (r = r.map.__data__, typeof r == "string")) {
								r = r.length;
								break b;
							}
							r = void 0;
						}
						if (r === void 0) break;
						if (t += r, 4096 < t) {
							t = n;
							break a;
						}
						if (t === 4096 || n === this.j.length - 1) {
							t = n + 1;
							break a;
						}
					}
					t = 1e3;
				}
				else t = 1e3;
				t = Vl(this, i, t), n = jc(this.I), T(n, "RID", e), T(n, "CVER", 22), this.F && T(n, "X-HTTP-Session-Id", this.F), Bl(this, n), a && (this.O ? t = "headers=" + encodeURIComponent(String(Al(a))) + "&" + t : this.o && jl(n, this.o, a)), rl(this.i, i), this.bb && T(n, "TYPE", "init"), this.P ? (T(n, "$req", t), T(n, "SID", "null"), i.aa = !0, mc(i, n, null)) : mc(i, n, t), this.H = 2;
			}
		} else this.H == 3 && (e ? zl(this, e) : this.j.length == 0 || el(this.i) || zl(this));
	}
};
function zl(e, t) {
	var n = t ? t.m : e.W++;
	let r = jc(e.I);
	T(r, "SID", e.K), T(r, "RID", n), T(r, "AID", e.V), Bl(e, r), e.o && e.s && jl(r, e.o, e.s), n = new lc(e, e.l, n, e.C + 1), e.o === null && (n.I = e.s), t && (e.j = t.F.concat(e.j)), t = Vl(e, n, 1e3), n.setTimeout(Math.round(.5 * e.xa) + Math.round(.5 * e.xa * Math.random())), rl(e.i, n), mc(n, r, t);
}
function Bl(e, t) {
	e.na && Ko(e.na, function(e, n) {
		T(t, n, e);
	}), e.h && Dc({}, function(e, n) {
		T(t, n, e);
	});
}
function Vl(e, t, n) {
	n = Math.min(e.j.length, n);
	var r = e.h ? po(e.h.Va, e.h, e) : null;
	a: {
		var i = e.j;
		let t = -1;
		for (;;) {
			let e = ["count=" + n];
			t == -1 ? 0 < n ? (t = i[0].g, e.push("ofs=" + t)) : t = 0 : e.push("ofs=" + t);
			let a = !0;
			for (let o = 0; o < n; o++) {
				let n = i[o].g, s = i[o].map;
				if (n -= t, 0 > n) t = Math.max(0, i[o].g - 100), a = !1;
				else try {
					cl(s, e, "req" + n + "_");
				} catch {
					r && r(s);
				}
			}
			if (a) {
				r = e.join("&");
				break a;
			}
		}
	}
	return e = e.j.splice(0, n), t.F = e, r;
}
function Hl(e) {
	if (!e.g && !e.u) {
		e.ba = 1;
		var t = e.Ma;
		ws || Ds(), Ts ||= (ws(), !0), Es.add(t, e), e.A = 0;
	}
}
function Ul(e) {
	return e.g || e.u || 3 <= e.A ? !1 : (e.ba++, e.u = Qs(po(e.Ma, e), Jl(e, e.A)), e.A++, !0);
}
C.Ma = function() {
	if (this.u = null, Gl(this), this.ca && !(this.M || this.g == null || 0 >= this.S)) {
		var e = 2 * this.S;
		this.l.info("BP detection timer enabled: " + e), this.B = Qs(po(this.jb, this), e);
	}
}, C.jb = function() {
	this.B && (this.B = null, this.l.info("BP detection timeout reached."), this.l.info("Buffering proxy detected and switch to long-polling!"), this.G = !1, this.M = !0, Xs(10), Fl(this), Gl(this));
};
function Wl(e) {
	e.B != null && (w.clearTimeout(e.B), e.B = null);
}
function Gl(e) {
	e.g = new lc(e, e.l, "rpc", e.ba), e.o === null && (e.g.I = e.s), e.g.O = 0;
	var t = jc(e.wa);
	T(t, "RID", "rpc"), T(t, "SID", e.K), T(t, "AID", e.V), T(t, "CI", e.G ? "0" : "1"), !e.G && e.qa && T(t, "TO", e.qa), T(t, "TYPE", "xmlhttp"), Bl(e, t), e.o && e.s && jl(t, e.o, e.s), e.L && e.g.setTimeout(e.L);
	var n = e.g;
	e = e.pa, n.L = 1, n.A = Fc(jc(t)), n.u = null, n.S = !0, hc(n, e);
}
C.ib = function() {
	this.v != null && (this.v = null, Fl(this), Ul(this), Xs(19));
};
function Kl(e) {
	e.v != null && (w.clearTimeout(e.v), e.v = null);
}
function ql(e, t) {
	var n = null;
	if (e.g == t) {
		Kl(e), Wl(e), e.g = null;
		var r = 2;
	} else if (nl(e.i, t)) n = t.F, il(e.i, t), r = 1;
	else return;
	if (e.H != 0) {
		if (t.i) {
			if (r == 1) {
				n = t.u ? t.u.length : 0, t = Date.now() - t.G;
				var i = e.C;
				r = Ks(), ms(r, new Zs(r, n)), Ll(e);
			} else Hl(e);
		} else if (i = t.s, i == 3 || i == 0 && 0 < t.ca || !(r == 1 && Rl(e, t) || r == 2 && Ul(e))) switch (n && 0 < n.length && (t = e.i, t.i = t.i.concat(n)), i) {
			case 1:
				Yl(e, 5);
				break;
			case 4:
				Yl(e, 10);
				break;
			case 3:
				Yl(e, 6);
				break;
			default: Yl(e, 2);
		}
	}
}
function Jl(e, t) {
	let n = e.ab + Math.floor(Math.random() * e.hb);
	return e.isActive() || (n *= 2), n * t;
}
function Yl(e, t) {
	if (e.l.info("Error code " + t), t == 2) {
		var n = null;
		e.h && (n = null);
		var r = po(e.pb, e);
		n || (n = new Ac("//www.google.com/images/cleardot.gif"), w.location && w.location.protocol == "http" || Mc(n, "https"), Fc(n)), ll(n.toString(), r);
	} else Xs(2);
	e.H = 0, e.h && e.h.za(t), Xl(e), Il(e);
}
C.pb = function(e) {
	e ? (this.l.info("Successfully pinged google.com"), Xs(2)) : (this.l.info("Failed to ping google.com"), Xs(1));
};
function Xl(e) {
	if (e.H = 0, e.ma = [], e.h) {
		let t = al(e.i);
		(t.length != 0 || e.j.length != 0) && (bo(e.ma, t), bo(e.ma, e.j), e.i.i.length = 0, yo(e.j), e.j.length = 0), e.h.ya();
	}
}
function Zl(e, t, n) {
	var r = n instanceof Ac ? jc(n) : new Ac(n);
	if (r.g != "") t && (r.g = t + "." + r.g), Nc(r, r.m);
	else {
		var i = w.location;
		r = i.protocol, t = t ? t + "." + i.hostname : i.hostname, i = +i.port;
		var a = new Ac(null);
		r && Mc(a, r), t && (a.g = t), i && Nc(a, i), n && (a.l = n), r = a;
	}
	return n = e.F, t = e.Da, n && t && T(r, n, t), T(r, "VER", e.ra), Bl(e, r), r;
}
function Ql(e, t, n) {
	if (t && !e.J) throw Error("Can't create secondary domain capable XhrIo object.");
	return t = e.Ha && !e.va ? new E(new dl({ ob: n })) : new E(e.va), t.Oa(e.J), t;
}
C.isActive = function() {
	return !!this.h && this.h.isActive(this);
};
function $l() {}
C = $l.prototype, C.Ba = function() {}, C.Aa = function() {}, C.za = function() {}, C.ya = function() {}, C.isActive = function() {
	return !0;
}, C.Va = function() {};
function eu() {
	if (ko && !(10 <= Number(zo))) throw Error("Environmental error: no available transport.");
}
eu.prototype.g = function(e, t) {
	return new tu(e, t);
};
function tu(e, t) {
	ps.call(this), this.g = new Nl(t), this.l = e, this.h = t && t.messageUrlParams || null, e = t && t.messageHeaders || null, t && t.clientProtocolHeaderRequired && (e ? e["X-Client-Protocol"] = "webchannel" : e = { "X-Client-Protocol": "webchannel" }), this.g.s = e, e = t && t.initMessageHeaders || null, t && t.messageContentType && (e ? e["X-WebChannel-Content-Type"] = t.messageContentType : e = { "X-WebChannel-Content-Type": t.messageContentType }), t && t.Ca && (e ? e["X-WebChannel-Client-Profile"] = t.Ca : e = { "X-WebChannel-Client-Profile": t.Ca }), this.g.U = e, (e = t && t.cc) && !Co(e) && (this.g.o = e), this.A = t && t.supportsCrossDomainXhr || !1, this.v = t && t.sendRawJson || !1, (t &&= t.httpSessionIdParam) && !Co(t) && (this.g.F = t, e = this.h, e !== null && t in e && (e = this.h, t in e && delete e[t])), this.j = new iu(this);
}
ho(tu, ps), tu.prototype.m = function() {
	this.g.h = this.j, this.A && (this.g.J = !0);
	var e = this.g, t = this.l, n = this.h || void 0;
	Xs(0), e.Y = t, e.na = n || {}, e.G = e.aa, e.I = Zl(e, null, e.Y), Ll(e);
}, tu.prototype.close = function() {
	Pl(this.g);
}, tu.prototype.u = function(e) {
	var t = this.g;
	if (typeof e == "string") {
		var n = {};
		n.__data__ = e, e = n;
	} else this.v && (n = {}, n.__data__ = gs(e), e = n);
	t.j.push(new Zc(t.fb++, e)), t.H == 3 && Ll(t);
}, tu.prototype.N = function() {
	this.g.h = null, delete this.j, Pl(this.g), delete this.g, tu.$.N.call(this);
};
function nu(e) {
	ac.call(this), e.__headers__ && (this.headers = e.__headers__, this.statusCode = e.__status__, delete e.__headers__, delete e.__status__);
	var t = e.__sm__;
	if (t) {
		a: {
			for (let n in t) {
				e = n;
				break a;
			}
			e = void 0;
		}
		(this.i = e) && (e = this.i, t = t !== null && e in t ? t[e] : void 0), this.data = t;
	} else this.data = e;
}
ho(nu, ac);
function ru() {
	oc.call(this), this.status = 1;
}
ho(ru, oc);
function iu(e) {
	this.g = e;
}
ho(iu, $l), iu.prototype.Ba = function() {
	ms(this.g, "a");
}, iu.prototype.Aa = function(e) {
	ms(this.g, new nu(e));
}, iu.prototype.za = function(e) {
	ms(this.g, new ru());
}, iu.prototype.ya = function() {
	ms(this.g, "b");
};
function au() {
	this.blockSize = -1;
}
function ou() {
	this.blockSize = -1, this.blockSize = 64, this.g = [
		,
		,
		,
		,
	], this.m = Array(this.blockSize), this.i = this.h = 0, this.reset();
}
ho(ou, au), ou.prototype.reset = function() {
	this.g[0] = 1732584193, this.g[1] = 4023233417, this.g[2] = 2562383102, this.g[3] = 271733878, this.i = this.h = 0;
};
function su(e, t, n) {
	n ||= 0;
	var r = Array(16);
	if (typeof t == "string") for (var i = 0; 16 > i; ++i) r[i] = t.charCodeAt(n++) | t.charCodeAt(n++) << 8 | t.charCodeAt(n++) << 16 | t.charCodeAt(n++) << 24;
	else for (i = 0; 16 > i; ++i) r[i] = t[n++] | t[n++] << 8 | t[n++] << 16 | t[n++] << 24;
	t = e.g[0], n = e.g[1], i = e.g[2];
	var a = e.g[3], o = t + (a ^ n & (i ^ a)) + r[0] + 3614090360 & 4294967295;
	t = n + (o << 7 & 4294967295 | o >>> 25), o = a + (i ^ t & (n ^ i)) + r[1] + 3905402710 & 4294967295, a = t + (o << 12 & 4294967295 | o >>> 20), o = i + (n ^ a & (t ^ n)) + r[2] + 606105819 & 4294967295, i = a + (o << 17 & 4294967295 | o >>> 15), o = n + (t ^ i & (a ^ t)) + r[3] + 3250441966 & 4294967295, n = i + (o << 22 & 4294967295 | o >>> 10), o = t + (a ^ n & (i ^ a)) + r[4] + 4118548399 & 4294967295, t = n + (o << 7 & 4294967295 | o >>> 25), o = a + (i ^ t & (n ^ i)) + r[5] + 1200080426 & 4294967295, a = t + (o << 12 & 4294967295 | o >>> 20), o = i + (n ^ a & (t ^ n)) + r[6] + 2821735955 & 4294967295, i = a + (o << 17 & 4294967295 | o >>> 15), o = n + (t ^ i & (a ^ t)) + r[7] + 4249261313 & 4294967295, n = i + (o << 22 & 4294967295 | o >>> 10), o = t + (a ^ n & (i ^ a)) + r[8] + 1770035416 & 4294967295, t = n + (o << 7 & 4294967295 | o >>> 25), o = a + (i ^ t & (n ^ i)) + r[9] + 2336552879 & 4294967295, a = t + (o << 12 & 4294967295 | o >>> 20), o = i + (n ^ a & (t ^ n)) + r[10] + 4294925233 & 4294967295, i = a + (o << 17 & 4294967295 | o >>> 15), o = n + (t ^ i & (a ^ t)) + r[11] + 2304563134 & 4294967295, n = i + (o << 22 & 4294967295 | o >>> 10), o = t + (a ^ n & (i ^ a)) + r[12] + 1804603682 & 4294967295, t = n + (o << 7 & 4294967295 | o >>> 25), o = a + (i ^ t & (n ^ i)) + r[13] + 4254626195 & 4294967295, a = t + (o << 12 & 4294967295 | o >>> 20), o = i + (n ^ a & (t ^ n)) + r[14] + 2792965006 & 4294967295, i = a + (o << 17 & 4294967295 | o >>> 15), o = n + (t ^ i & (a ^ t)) + r[15] + 1236535329 & 4294967295, n = i + (o << 22 & 4294967295 | o >>> 10), o = t + (i ^ a & (n ^ i)) + r[1] + 4129170786 & 4294967295, t = n + (o << 5 & 4294967295 | o >>> 27), o = a + (n ^ i & (t ^ n)) + r[6] + 3225465664 & 4294967295, a = t + (o << 9 & 4294967295 | o >>> 23), o = i + (t ^ n & (a ^ t)) + r[11] + 643717713 & 4294967295, i = a + (o << 14 & 4294967295 | o >>> 18), o = n + (a ^ t & (i ^ a)) + r[0] + 3921069994 & 4294967295, n = i + (o << 20 & 4294967295 | o >>> 12), o = t + (i ^ a & (n ^ i)) + r[5] + 3593408605 & 4294967295, t = n + (o << 5 & 4294967295 | o >>> 27), o = a + (n ^ i & (t ^ n)) + r[10] + 38016083 & 4294967295, a = t + (o << 9 & 4294967295 | o >>> 23), o = i + (t ^ n & (a ^ t)) + r[15] + 3634488961 & 4294967295, i = a + (o << 14 & 4294967295 | o >>> 18), o = n + (a ^ t & (i ^ a)) + r[4] + 3889429448 & 4294967295, n = i + (o << 20 & 4294967295 | o >>> 12), o = t + (i ^ a & (n ^ i)) + r[9] + 568446438 & 4294967295, t = n + (o << 5 & 4294967295 | o >>> 27), o = a + (n ^ i & (t ^ n)) + r[14] + 3275163606 & 4294967295, a = t + (o << 9 & 4294967295 | o >>> 23), o = i + (t ^ n & (a ^ t)) + r[3] + 4107603335 & 4294967295, i = a + (o << 14 & 4294967295 | o >>> 18), o = n + (a ^ t & (i ^ a)) + r[8] + 1163531501 & 4294967295, n = i + (o << 20 & 4294967295 | o >>> 12), o = t + (i ^ a & (n ^ i)) + r[13] + 2850285829 & 4294967295, t = n + (o << 5 & 4294967295 | o >>> 27), o = a + (n ^ i & (t ^ n)) + r[2] + 4243563512 & 4294967295, a = t + (o << 9 & 4294967295 | o >>> 23), o = i + (t ^ n & (a ^ t)) + r[7] + 1735328473 & 4294967295, i = a + (o << 14 & 4294967295 | o >>> 18), o = n + (a ^ t & (i ^ a)) + r[12] + 2368359562 & 4294967295, n = i + (o << 20 & 4294967295 | o >>> 12), o = t + (n ^ i ^ a) + r[5] + 4294588738 & 4294967295, t = n + (o << 4 & 4294967295 | o >>> 28), o = a + (t ^ n ^ i) + r[8] + 2272392833 & 4294967295, a = t + (o << 11 & 4294967295 | o >>> 21), o = i + (a ^ t ^ n) + r[11] + 1839030562 & 4294967295, i = a + (o << 16 & 4294967295 | o >>> 16), o = n + (i ^ a ^ t) + r[14] + 4259657740 & 4294967295, n = i + (o << 23 & 4294967295 | o >>> 9), o = t + (n ^ i ^ a) + r[1] + 2763975236 & 4294967295, t = n + (o << 4 & 4294967295 | o >>> 28), o = a + (t ^ n ^ i) + r[4] + 1272893353 & 4294967295, a = t + (o << 11 & 4294967295 | o >>> 21), o = i + (a ^ t ^ n) + r[7] + 4139469664 & 4294967295, i = a + (o << 16 & 4294967295 | o >>> 16), o = n + (i ^ a ^ t) + r[10] + 3200236656 & 4294967295, n = i + (o << 23 & 4294967295 | o >>> 9), o = t + (n ^ i ^ a) + r[13] + 681279174 & 4294967295, t = n + (o << 4 & 4294967295 | o >>> 28), o = a + (t ^ n ^ i) + r[0] + 3936430074 & 4294967295, a = t + (o << 11 & 4294967295 | o >>> 21), o = i + (a ^ t ^ n) + r[3] + 3572445317 & 4294967295, i = a + (o << 16 & 4294967295 | o >>> 16), o = n + (i ^ a ^ t) + r[6] + 76029189 & 4294967295, n = i + (o << 23 & 4294967295 | o >>> 9), o = t + (n ^ i ^ a) + r[9] + 3654602809 & 4294967295, t = n + (o << 4 & 4294967295 | o >>> 28), o = a + (t ^ n ^ i) + r[12] + 3873151461 & 4294967295, a = t + (o << 11 & 4294967295 | o >>> 21), o = i + (a ^ t ^ n) + r[15] + 530742520 & 4294967295, i = a + (o << 16 & 4294967295 | o >>> 16), o = n + (i ^ a ^ t) + r[2] + 3299628645 & 4294967295, n = i + (o << 23 & 4294967295 | o >>> 9), o = t + (i ^ (n | ~a)) + r[0] + 4096336452 & 4294967295, t = n + (o << 6 & 4294967295 | o >>> 26), o = a + (n ^ (t | ~i)) + r[7] + 1126891415 & 4294967295, a = t + (o << 10 & 4294967295 | o >>> 22), o = i + (t ^ (a | ~n)) + r[14] + 2878612391 & 4294967295, i = a + (o << 15 & 4294967295 | o >>> 17), o = n + (a ^ (i | ~t)) + r[5] + 4237533241 & 4294967295, n = i + (o << 21 & 4294967295 | o >>> 11), o = t + (i ^ (n | ~a)) + r[12] + 1700485571 & 4294967295, t = n + (o << 6 & 4294967295 | o >>> 26), o = a + (n ^ (t | ~i)) + r[3] + 2399980690 & 4294967295, a = t + (o << 10 & 4294967295 | o >>> 22), o = i + (t ^ (a | ~n)) + r[10] + 4293915773 & 4294967295, i = a + (o << 15 & 4294967295 | o >>> 17), o = n + (a ^ (i | ~t)) + r[1] + 2240044497 & 4294967295, n = i + (o << 21 & 4294967295 | o >>> 11), o = t + (i ^ (n | ~a)) + r[8] + 1873313359 & 4294967295, t = n + (o << 6 & 4294967295 | o >>> 26), o = a + (n ^ (t | ~i)) + r[15] + 4264355552 & 4294967295, a = t + (o << 10 & 4294967295 | o >>> 22), o = i + (t ^ (a | ~n)) + r[6] + 2734768916 & 4294967295, i = a + (o << 15 & 4294967295 | o >>> 17), o = n + (a ^ (i | ~t)) + r[13] + 1309151649 & 4294967295, n = i + (o << 21 & 4294967295 | o >>> 11), o = t + (i ^ (n | ~a)) + r[4] + 4149444226 & 4294967295, t = n + (o << 6 & 4294967295 | o >>> 26), o = a + (n ^ (t | ~i)) + r[11] + 3174756917 & 4294967295, a = t + (o << 10 & 4294967295 | o >>> 22), o = i + (t ^ (a | ~n)) + r[2] + 718787259 & 4294967295, i = a + (o << 15 & 4294967295 | o >>> 17), o = n + (a ^ (i | ~t)) + r[9] + 3951481745 & 4294967295, e.g[0] = e.g[0] + t & 4294967295, e.g[1] = e.g[1] + (i + (o << 21 & 4294967295 | o >>> 11)) & 4294967295, e.g[2] = e.g[2] + i & 4294967295, e.g[3] = e.g[3] + a & 4294967295;
}
ou.prototype.j = function(e, t) {
	t === void 0 && (t = e.length);
	for (var n = t - this.blockSize, r = this.m, i = this.h, a = 0; a < t;) {
		if (i == 0) for (; a <= n;) su(this, e, a), a += this.blockSize;
		if (typeof e == "string") {
			for (; a < t;) if (r[i++] = e.charCodeAt(a++), i == this.blockSize) {
				su(this, r), i = 0;
				break;
			}
		} else for (; a < t;) if (r[i++] = e[a++], i == this.blockSize) {
			su(this, r), i = 0;
			break;
		}
	}
	this.h = i, this.i += t;
}, ou.prototype.l = function() {
	var e = Array((56 > this.h ? this.blockSize : 2 * this.blockSize) - this.h);
	e[0] = 128;
	for (var t = 1; t < e.length - 8; ++t) e[t] = 0;
	var n = 8 * this.i;
	for (t = e.length - 8; t < e.length; ++t) e[t] = n & 255, n /= 256;
	for (this.j(e), e = Array(16), t = n = 0; 4 > t; ++t) for (var r = 0; 32 > r; r += 8) e[n++] = this.g[t] >>> r & 255;
	return e;
};
function D(e, t) {
	this.h = t;
	for (var n = [], r = !0, i = e.length - 1; 0 <= i; i--) {
		var a = e[i] | 0;
		r && a == t || (n[i] = a, r = !1);
	}
	this.g = n;
}
var cu = {};
function lu(e) {
	return -128 <= e && 128 > e ? Do(e, function(e) {
		return new D([e | 0], 0 > e ? -1 : 0);
	}) : new D([e | 0], 0 > e ? -1 : 0);
}
function uu(e) {
	if (isNaN(e) || !isFinite(e)) return pu;
	if (0 > e) return vu(uu(-e));
	for (var t = [], n = 1, r = 0; e >= n; r++) t[r] = e / n | 0, n *= fu;
	return new D(t, 0);
}
function du(e, t) {
	if (e.length == 0) throw Error("number format error: empty string");
	if (t ||= 10, 2 > t || 36 < t) throw Error("radix out of range: " + t);
	if (e.charAt(0) == "-") return vu(du(e.substring(1), t));
	if (0 <= e.indexOf("-")) throw Error("number format error: interior \"-\" character");
	for (var n = uu(t ** 8), r = pu, i = 0; i < e.length; i += 8) {
		var a = Math.min(8, e.length - i), o = parseInt(e.substring(i, i + a), t);
		8 > a ? (a = uu(t ** +a), r = r.R(a).add(uu(o))) : (r = r.R(n), r = r.add(uu(o)));
	}
	return r;
}
var fu = 4294967296, pu = lu(0), mu = lu(1), hu = lu(16777216);
C = D.prototype, C.ea = function() {
	if (_u(this)) return -vu(this).ea();
	for (var e = 0, t = 1, n = 0; n < this.g.length; n++) {
		var r = this.D(n);
		e += (0 <= r ? r : fu + r) * t, t *= fu;
	}
	return e;
}, C.toString = function(e) {
	if (e ||= 10, 2 > e || 36 < e) throw Error("radix out of range: " + e);
	if (gu(this)) return "0";
	if (_u(this)) return "-" + vu(this).toString(e);
	for (var t = uu(e ** 6), n = this, r = "";;) {
		var i = Su(n, t).g;
		n = yu(n, i.R(t));
		var a = ((0 < n.g.length ? n.g[0] : n.h) >>> 0).toString(e);
		if (n = i, gu(n)) return a + r;
		for (; 6 > a.length;) a = "0" + a;
		r = a + r;
	}
}, C.D = function(e) {
	return 0 > e ? 0 : e < this.g.length ? this.g[e] : this.h;
};
function gu(e) {
	if (e.h != 0) return !1;
	for (var t = 0; t < e.g.length; t++) if (e.g[t] != 0) return !1;
	return !0;
}
function _u(e) {
	return e.h == -1;
}
C.X = function(e) {
	return e = yu(this, e), _u(e) ? -1 : +!gu(e);
};
function vu(e) {
	for (var t = e.g.length, n = [], r = 0; r < t; r++) n[r] = ~e.g[r];
	return new D(n, ~e.h).add(mu);
}
C.abs = function() {
	return _u(this) ? vu(this) : this;
}, C.add = function(e) {
	for (var t = Math.max(this.g.length, e.g.length), n = [], r = 0, i = 0; i <= t; i++) {
		var a = r + (this.D(i) & 65535) + (e.D(i) & 65535), o = (a >>> 16) + (this.D(i) >>> 16) + (e.D(i) >>> 16);
		r = o >>> 16, a &= 65535, o &= 65535, n[i] = o << 16 | a;
	}
	return new D(n, n[n.length - 1] & -2147483648 ? -1 : 0);
};
function yu(e, t) {
	return e.add(vu(t));
}
C.R = function(e) {
	if (gu(this) || gu(e)) return pu;
	if (_u(this)) return _u(e) ? vu(this).R(vu(e)) : vu(vu(this).R(e));
	if (_u(e)) return vu(this.R(vu(e)));
	if (0 > this.X(hu) && 0 > e.X(hu)) return uu(this.ea() * e.ea());
	for (var t = this.g.length + e.g.length, n = [], r = 0; r < 2 * t; r++) n[r] = 0;
	for (r = 0; r < this.g.length; r++) for (var i = 0; i < e.g.length; i++) {
		var a = this.D(r) >>> 16, o = this.D(r) & 65535, s = e.D(i) >>> 16, c = e.D(i) & 65535;
		n[2 * r + 2 * i] += o * c, bu(n, 2 * r + 2 * i), n[2 * r + 2 * i + 1] += a * c, bu(n, 2 * r + 2 * i + 1), n[2 * r + 2 * i + 1] += o * s, bu(n, 2 * r + 2 * i + 1), n[2 * r + 2 * i + 2] += a * s, bu(n, 2 * r + 2 * i + 2);
	}
	for (r = 0; r < t; r++) n[r] = n[2 * r + 1] << 16 | n[2 * r];
	for (r = t; r < 2 * t; r++) n[r] = 0;
	return new D(n, 0);
};
function bu(e, t) {
	for (; (e[t] & 65535) != e[t];) e[t + 1] += e[t] >>> 16, e[t] &= 65535, t++;
}
function xu(e, t) {
	this.g = e, this.h = t;
}
function Su(e, t) {
	if (gu(t)) throw Error("division by zero");
	if (gu(e)) return new xu(pu, pu);
	if (_u(e)) return t = Su(vu(e), t), new xu(vu(t.g), vu(t.h));
	if (_u(t)) return t = Su(e, vu(t)), new xu(vu(t.g), t.h);
	if (30 < e.g.length) {
		if (_u(e) || _u(t)) throw Error("slowDivide_ only works with positive integers.");
		for (var n = mu, r = t; 0 >= r.X(e);) n = Cu(n), r = Cu(r);
		var i = wu(n, 1), a = wu(r, 1);
		for (r = wu(r, 2), n = wu(n, 2); !gu(r);) {
			var o = a.add(r);
			0 >= o.X(e) && (i = i.add(n), a = o), r = wu(r, 1), n = wu(n, 1);
		}
		return t = yu(e, i.R(t)), new xu(i, t);
	}
	for (i = pu; 0 <= e.X(t);) {
		for (n = Math.max(1, Math.floor(e.ea() / t.ea())), r = Math.ceil(Math.log(n) / Math.LN2), r = 48 >= r ? 1 : 2 ** (r - 48), a = uu(n), o = a.R(t); _u(o) || 0 < o.X(e);) n -= r, a = uu(n), o = a.R(t);
		gu(a) && (a = mu), i = i.add(a), e = yu(e, o);
	}
	return new xu(i, e);
}
C.gb = function(e) {
	return Su(this, e).h;
}, C.and = function(e) {
	for (var t = Math.max(this.g.length, e.g.length), n = [], r = 0; r < t; r++) n[r] = this.D(r) & e.D(r);
	return new D(n, this.h & e.h);
}, C.or = function(e) {
	for (var t = Math.max(this.g.length, e.g.length), n = [], r = 0; r < t; r++) n[r] = this.D(r) | e.D(r);
	return new D(n, this.h | e.h);
}, C.xor = function(e) {
	for (var t = Math.max(this.g.length, e.g.length), n = [], r = 0; r < t; r++) n[r] = this.D(r) ^ e.D(r);
	return new D(n, this.h ^ e.h);
};
function Cu(e) {
	for (var t = e.g.length + 1, n = [], r = 0; r < t; r++) n[r] = e.D(r) << 1 | e.D(r - 1) >>> 31;
	return new D(n, e.h);
}
function wu(e, t) {
	var n = t >> 5;
	t %= 32;
	for (var r = e.g.length - n, i = [], a = 0; a < r; a++) i[a] = 0 < t ? e.D(a + n) >>> t | e.D(a + n + 1) << 32 - t : e.D(a + n);
	return new D(i, e.h);
}
eu.prototype.createWebChannel = eu.prototype.g, tu.prototype.send = tu.prototype.u, tu.prototype.open = tu.prototype.m, tu.prototype.close = tu.prototype.close, $s.NO_ERROR = 0, $s.TIMEOUT = 8, $s.HTTP_ERROR = 6, ec.COMPLETE = "complete", rc.EventType = ic, ic.OPEN = "a", ic.CLOSE = "b", ic.ERROR = "c", ic.MESSAGE = "d", ps.prototype.listen = ps.prototype.O, E.prototype.listenOnce = E.prototype.P, E.prototype.getLastError = E.prototype.Sa, E.prototype.getLastErrorCode = E.prototype.Ia, E.prototype.getStatus = E.prototype.da, E.prototype.getResponseJson = E.prototype.Wa, E.prototype.getResponseText = E.prototype.ja, E.prototype.send = E.prototype.ha, E.prototype.setWithCredentials = E.prototype.Oa, ou.prototype.digest = ou.prototype.l, ou.prototype.reset = ou.prototype.reset, ou.prototype.update = ou.prototype.j, D.prototype.add = D.prototype.add, D.prototype.multiply = D.prototype.R, D.prototype.modulo = D.prototype.gb, D.prototype.compare = D.prototype.X, D.prototype.toNumber = D.prototype.ea, D.prototype.toString = D.prototype.toString, D.prototype.getBits = D.prototype.D, D.fromNumber = uu, D.fromString = du;
var Tu = ro.createWebChannelTransport = function() {
	return new eu();
}, Eu = ro.getStatEventTarget = function() {
	return Ks();
}, Du = ro.ErrorCode = $s, Ou = ro.EventType = ec, ku = ro.Event = Ws, Au = ro.Stat = {
	xb: 0,
	Ab: 1,
	Bb: 2,
	Ub: 3,
	Zb: 4,
	Wb: 5,
	Xb: 6,
	Vb: 7,
	Tb: 8,
	Yb: 9,
	PROXY: 10,
	NOPROXY: 11,
	Rb: 12,
	Nb: 13,
	Ob: 14,
	Mb: 15,
	Pb: 16,
	Qb: 17,
	tb: 18,
	sb: 19,
	ub: 20
}, ju = ro.WebChannel = rc, Mu = ro.XhrIo = E, Nu = ro.Md5 = ou, Pu = ro.Integer = D, Fu = "@firebase/firestore", Iu = class {
	constructor(e) {
		this.uid = e;
	}
	isAuthenticated() {
		return this.uid != null;
	}
	toKey() {
		return this.isAuthenticated() ? "uid:" + this.uid : "anonymous-user";
	}
	isEqual(e) {
		return e.uid === this.uid;
	}
};
Iu.UNAUTHENTICATED = new Iu(null), Iu.GOOGLE_CREDENTIALS = new Iu("google-credentials-uid"), Iu.FIRST_PARTY = new Iu("first-party-uid"), Iu.MOCK_USER = new Iu("mock-user");
var Lu = "10.10.0", Ru = new Ne("@firebase/firestore");
function zu() {
	return Ru.logLevel;
}
function O(e, ...t) {
	if (Ru.logLevel <= v.DEBUG) {
		let n = t.map(Hu);
		Ru.debug(`Firestore (${Lu}): ${e}`, ...n);
	}
}
function Bu(e, ...t) {
	if (Ru.logLevel <= v.ERROR) {
		let n = t.map(Hu);
		Ru.error(`Firestore (${Lu}): ${e}`, ...n);
	}
}
function Vu(e, ...t) {
	if (Ru.logLevel <= v.WARN) {
		let n = t.map(Hu);
		Ru.warn(`Firestore (${Lu}): ${e}`, ...n);
	}
}
function Hu(e) {
	if (typeof e == "string") return e;
	try {
		return function(e) {
			return JSON.stringify(e);
		}(e);
	} catch {
		return e;
	}
}
function k(e = "Unexpected state") {
	let t = `FIRESTORE (${Lu}) INTERNAL ASSERTION FAILED: ` + e;
	throw Bu(t), Error(t);
}
function A(e, t) {
	e || k();
}
function j(e, t) {
	return e;
}
var M = {
	OK: "ok",
	CANCELLED: "cancelled",
	UNKNOWN: "unknown",
	INVALID_ARGUMENT: "invalid-argument",
	DEADLINE_EXCEEDED: "deadline-exceeded",
	NOT_FOUND: "not-found",
	ALREADY_EXISTS: "already-exists",
	PERMISSION_DENIED: "permission-denied",
	UNAUTHENTICATED: "unauthenticated",
	RESOURCE_EXHAUSTED: "resource-exhausted",
	FAILED_PRECONDITION: "failed-precondition",
	ABORTED: "aborted",
	OUT_OF_RANGE: "out-of-range",
	UNIMPLEMENTED: "unimplemented",
	INTERNAL: "internal",
	UNAVAILABLE: "unavailable",
	DATA_LOSS: "data-loss"
}, N = class extends pe {
	constructor(e, t) {
		super(e, t), this.code = e, this.message = t, this.toString = () => `${this.name}: [code=${this.code}]: ${this.message}`;
	}
}, Uu = class {
	constructor() {
		this.promise = new Promise(((e, t) => {
			this.resolve = e, this.reject = t;
		}));
	}
}, Wu = class {
	constructor(e, t) {
		this.user = t, this.type = "OAuth", this.headers = /* @__PURE__ */ new Map(), this.headers.set("Authorization", `Bearer ${e}`);
	}
}, Gu = class {
	getToken() {
		return Promise.resolve(null);
	}
	invalidateToken() {}
	start(e, t) {
		e.enqueueRetryable((() => t(Iu.UNAUTHENTICATED)));
	}
	shutdown() {}
}, Ku = class {
	constructor(e) {
		this.token = e, this.changeListener = null;
	}
	getToken() {
		return Promise.resolve(this.token);
	}
	invalidateToken() {}
	start(e, t) {
		this.changeListener = t, e.enqueueRetryable((() => t(this.token.user)));
	}
	shutdown() {
		this.changeListener = null;
	}
}, qu = class {
	constructor(e) {
		this.t = e, this.currentUser = Iu.UNAUTHENTICATED, this.i = 0, this.forceRefresh = !1, this.auth = null;
	}
	start(e, t) {
		let n = this.i, r = (e) => this.i === n ? Promise.resolve() : (n = this.i, t(e)), i = new Uu();
		this.o = () => {
			this.i++, this.currentUser = this.u(), i.resolve(), i = new Uu(), e.enqueueRetryable((() => r(this.currentUser)));
		};
		let a = () => {
			let t = i;
			e.enqueueRetryable((async () => {
				await t.promise, await r(this.currentUser);
			}));
		}, o = (e) => {
			O("FirebaseAuthCredentialsProvider", "Auth detected"), this.auth = e, this.auth.addAuthTokenListener(this.o), a();
		};
		this.t.onInit(((e) => o(e))), setTimeout((() => {
			if (!this.auth) {
				let e = this.t.getImmediate({ optional: !0 });
				e ? o(e) : (O("FirebaseAuthCredentialsProvider", "Auth not yet detected"), i.resolve(), i = new Uu());
			}
		}), 0), a();
	}
	getToken() {
		let e = this.i, t = this.forceRefresh;
		return this.forceRefresh = !1, this.auth ? this.auth.getToken(t).then(((t) => this.i === e ? t ? (A(typeof t.accessToken == "string"), new Wu(t.accessToken, this.currentUser)) : null : (O("FirebaseAuthCredentialsProvider", "getToken aborted due to token change."), this.getToken()))) : Promise.resolve(null);
	}
	invalidateToken() {
		this.forceRefresh = !0;
	}
	shutdown() {
		this.auth && this.auth.removeAuthTokenListener(this.o);
	}
	u() {
		let e = this.auth && this.auth.getUid();
		return A(e === null || typeof e == "string"), new Iu(e);
	}
}, Ju = class {
	constructor(e, t, n) {
		this.l = e, this.h = t, this.P = n, this.type = "FirstParty", this.user = Iu.FIRST_PARTY, this.I = /* @__PURE__ */ new Map();
	}
	T() {
		return this.P ? this.P() : null;
	}
	get headers() {
		this.I.set("X-Goog-AuthUser", this.l);
		let e = this.T();
		return e && this.I.set("Authorization", e), this.h && this.I.set("X-Goog-Iam-Authorization-Token", this.h), this.I;
	}
}, Yu = class {
	constructor(e, t, n) {
		this.l = e, this.h = t, this.P = n;
	}
	getToken() {
		return Promise.resolve(new Ju(this.l, this.h, this.P));
	}
	start(e, t) {
		e.enqueueRetryable((() => t(Iu.FIRST_PARTY)));
	}
	shutdown() {}
	invalidateToken() {}
}, Xu = class {
	constructor(e) {
		this.value = e, this.type = "AppCheck", this.headers = /* @__PURE__ */ new Map(), e && e.length > 0 && this.headers.set("x-firebase-appcheck", this.value);
	}
}, Zu = class {
	constructor(e) {
		this.A = e, this.forceRefresh = !1, this.appCheck = null, this.R = null;
	}
	start(e, t) {
		let n = (e) => {
			e.error != null && O("FirebaseAppCheckTokenProvider", `Error getting App Check token; using placeholder token instead. Error: ${e.error.message}`);
			let n = e.token !== this.R;
			return this.R = e.token, O("FirebaseAppCheckTokenProvider", `Received ${n ? "new" : "existing"} token.`), n ? t(e.token) : Promise.resolve();
		};
		this.o = (t) => {
			e.enqueueRetryable((() => n(t)));
		};
		let r = (e) => {
			O("FirebaseAppCheckTokenProvider", "AppCheck detected"), this.appCheck = e, this.appCheck.addTokenListener(this.o);
		};
		this.A.onInit(((e) => r(e))), setTimeout((() => {
			if (!this.appCheck) {
				let e = this.A.getImmediate({ optional: !0 });
				e ? r(e) : O("FirebaseAppCheckTokenProvider", "AppCheck not yet detected");
			}
		}), 0);
	}
	getToken() {
		let e = this.forceRefresh;
		return this.forceRefresh = !1, this.appCheck ? this.appCheck.getToken(e).then(((e) => e ? (A(typeof e.token == "string"), this.R = e.token, new Xu(e.token)) : null)) : Promise.resolve(null);
	}
	invalidateToken() {
		this.forceRefresh = !0;
	}
	shutdown() {
		this.appCheck && this.appCheck.removeTokenListener(this.o);
	}
};
function Qu(e) {
	let t = typeof self < "u" && (self.crypto || self.msCrypto), n = new Uint8Array(e);
	if (t && typeof t.getRandomValues == "function") t.getRandomValues(n);
	else for (let t = 0; t < e; t++) n[t] = Math.floor(256 * Math.random());
	return n;
}
var $u = class {
	static newId() {
		let e = "";
		for (; e.length < 20;) {
			let t = Qu(40);
			for (let n = 0; n < t.length; ++n) e.length < 20 && t[n] < 248 && (e += "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".charAt(t[n] % 62));
		}
		return e;
	}
};
function P(e, t) {
	return e < t ? -1 : +(e > t);
}
function ed(e, t, n) {
	return e.length === t.length && e.every(((e, r) => n(e, t[r])));
}
var td = class e {
	constructor(e, t) {
		if (this.seconds = e, this.nanoseconds = t, t < 0 || t >= 1e9) throw new N(M.INVALID_ARGUMENT, "Timestamp nanoseconds out of range: " + t);
		if (e < -62135596800 || e >= 253402300800) throw new N(M.INVALID_ARGUMENT, "Timestamp seconds out of range: " + e);
	}
	static now() {
		return e.fromMillis(Date.now());
	}
	static fromDate(t) {
		return e.fromMillis(t.getTime());
	}
	static fromMillis(t) {
		let n = Math.floor(t / 1e3), r = Math.floor(1e6 * (t - 1e3 * n));
		return new e(n, r);
	}
	toDate() {
		return new Date(this.toMillis());
	}
	toMillis() {
		return 1e3 * this.seconds + this.nanoseconds / 1e6;
	}
	_compareTo(e) {
		return this.seconds === e.seconds ? P(this.nanoseconds, e.nanoseconds) : P(this.seconds, e.seconds);
	}
	isEqual(e) {
		return e.seconds === this.seconds && e.nanoseconds === this.nanoseconds;
	}
	toString() {
		return "Timestamp(seconds=" + this.seconds + ", nanoseconds=" + this.nanoseconds + ")";
	}
	toJSON() {
		return {
			seconds: this.seconds,
			nanoseconds: this.nanoseconds
		};
	}
	valueOf() {
		let e = this.seconds - -62135596800;
		return String(e).padStart(12, "0") + "." + String(this.nanoseconds).padStart(9, "0");
	}
}, F = class e {
	constructor(e) {
		this.timestamp = e;
	}
	static fromTimestamp(t) {
		return new e(t);
	}
	static min() {
		return new e(new td(0, 0));
	}
	static max() {
		return new e(new td(253402300799, 999999999));
	}
	compareTo(e) {
		return this.timestamp._compareTo(e.timestamp);
	}
	isEqual(e) {
		return this.timestamp.isEqual(e.timestamp);
	}
	toMicroseconds() {
		return 1e6 * this.timestamp.seconds + this.timestamp.nanoseconds / 1e3;
	}
	toString() {
		return "SnapshotVersion(" + this.timestamp.toString() + ")";
	}
	toTimestamp() {
		return this.timestamp;
	}
}, nd = class e {
	constructor(e, t, n) {
		t === void 0 ? t = 0 : t > e.length && k(), n === void 0 ? n = e.length - t : n > e.length - t && k(), this.segments = e, this.offset = t, this.len = n;
	}
	get length() {
		return this.len;
	}
	isEqual(t) {
		return e.comparator(this, t) === 0;
	}
	child(t) {
		let n = this.segments.slice(this.offset, this.limit());
		return t instanceof e ? t.forEach(((e) => {
			n.push(e);
		})) : n.push(t), this.construct(n);
	}
	limit() {
		return this.offset + this.length;
	}
	popFirst(e) {
		return e = e === void 0 ? 1 : e, this.construct(this.segments, this.offset + e, this.length - e);
	}
	popLast() {
		return this.construct(this.segments, this.offset, this.length - 1);
	}
	firstSegment() {
		return this.segments[this.offset];
	}
	lastSegment() {
		return this.get(this.length - 1);
	}
	get(e) {
		return this.segments[this.offset + e];
	}
	isEmpty() {
		return this.length === 0;
	}
	isPrefixOf(e) {
		if (e.length < this.length) return !1;
		for (let t = 0; t < this.length; t++) if (this.get(t) !== e.get(t)) return !1;
		return !0;
	}
	isImmediateParentOf(e) {
		if (this.length + 1 !== e.length) return !1;
		for (let t = 0; t < this.length; t++) if (this.get(t) !== e.get(t)) return !1;
		return !0;
	}
	forEach(e) {
		for (let t = this.offset, n = this.limit(); t < n; t++) e(this.segments[t]);
	}
	toArray() {
		return this.segments.slice(this.offset, this.limit());
	}
	static comparator(e, t) {
		let n = Math.min(e.length, t.length);
		for (let r = 0; r < n; r++) {
			let n = e.get(r), i = t.get(r);
			if (n < i) return -1;
			if (n > i) return 1;
		}
		return e.length < t.length ? -1 : +(e.length > t.length);
	}
}, rd = class e extends nd {
	construct(t, n, r) {
		return new e(t, n, r);
	}
	canonicalString() {
		return this.toArray().join("/");
	}
	toString() {
		return this.canonicalString();
	}
	toUriEncodedString() {
		return this.toArray().map(encodeURIComponent).join("/");
	}
	static fromString(...t) {
		let n = [];
		for (let e of t) {
			if (e.indexOf("//") >= 0) throw new N(M.INVALID_ARGUMENT, `Invalid segment (${e}). Paths must not contain // in them.`);
			n.push(...e.split("/").filter(((e) => e.length > 0)));
		}
		return new e(n);
	}
	static emptyPath() {
		return new e([]);
	}
}, id = /^[_a-zA-Z][_a-zA-Z0-9]*$/, ad = class e extends nd {
	construct(t, n, r) {
		return new e(t, n, r);
	}
	static isValidIdentifier(e) {
		return id.test(e);
	}
	canonicalString() {
		return this.toArray().map(((t) => (t = t.replace(/\\/g, "\\\\").replace(/`/g, "\\`"), e.isValidIdentifier(t) || (t = "`" + t + "`"), t))).join(".");
	}
	toString() {
		return this.canonicalString();
	}
	isKeyField() {
		return this.length === 1 && this.get(0) === "__name__";
	}
	static keyField() {
		return new e(["__name__"]);
	}
	static fromServerFormat(t) {
		let n = [], r = "", i = 0, a = () => {
			if (r.length === 0) throw new N(M.INVALID_ARGUMENT, `Invalid field path (${t}). Paths must not be empty, begin with '.', end with '.', or contain '..'`);
			n.push(r), r = "";
		}, o = !1;
		for (; i < t.length;) {
			let e = t[i];
			if (e === "\\") {
				if (i + 1 === t.length) throw new N(M.INVALID_ARGUMENT, "Path has trailing escape character: " + t);
				let e = t[i + 1];
				if (e !== "\\" && e !== "." && e !== "`") throw new N(M.INVALID_ARGUMENT, "Path has invalid escape sequence: " + t);
				r += e, i += 2;
			} else e === "`" ? (o = !o, i++) : e !== "." || o ? (r += e, i++) : (a(), i++);
		}
		if (a(), o) throw new N(M.INVALID_ARGUMENT, "Unterminated ` in path: " + t);
		return new e(n);
	}
	static emptyPath() {
		return new e([]);
	}
}, I = class e {
	constructor(e) {
		this.path = e;
	}
	static fromPath(t) {
		return new e(rd.fromString(t));
	}
	static fromName(t) {
		return new e(rd.fromString(t).popFirst(5));
	}
	static empty() {
		return new e(rd.emptyPath());
	}
	get collectionGroup() {
		return this.path.popLast().lastSegment();
	}
	hasCollectionId(e) {
		return this.path.length >= 2 && this.path.get(this.path.length - 2) === e;
	}
	getCollectionGroup() {
		return this.path.get(this.path.length - 2);
	}
	getCollectionPath() {
		return this.path.popLast();
	}
	isEqual(e) {
		return e !== null && rd.comparator(this.path, e.path) === 0;
	}
	toString() {
		return this.path.toString();
	}
	static comparator(e, t) {
		return rd.comparator(e.path, t.path);
	}
	static isDocumentKey(e) {
		return e.length % 2 == 0;
	}
	static fromSegments(t) {
		return new e(new rd(t.slice()));
	}
};
function od(e, t) {
	let n = e.toTimestamp().seconds, r = e.toTimestamp().nanoseconds + 1;
	return new cd(F.fromTimestamp(r === 1e9 ? new td(n + 1, 0) : new td(n, r)), I.empty(), t);
}
function sd(e) {
	return new cd(e.readTime, e.key, -1);
}
var cd = class e {
	constructor(e, t, n) {
		this.readTime = e, this.documentKey = t, this.largestBatchId = n;
	}
	static min() {
		return new e(F.min(), I.empty(), -1);
	}
	static max() {
		return new e(F.max(), I.empty(), -1);
	}
};
function ld(e, t) {
	let n = e.readTime.compareTo(t.readTime);
	return n === 0 ? (n = I.comparator(e.documentKey, t.documentKey), n === 0 ? P(e.largestBatchId, t.largestBatchId) : n) : n;
}
var ud = "The current tab is not in the required state to perform this operation. It might be necessary to refresh the browser tab.", dd = class {
	constructor() {
		this.onCommittedListeners = [];
	}
	addOnCommittedListener(e) {
		this.onCommittedListeners.push(e);
	}
	raiseOnCommittedEvent() {
		this.onCommittedListeners.forEach(((e) => e()));
	}
};
async function fd(e) {
	if (e.code !== M.FAILED_PRECONDITION || e.message !== ud) throw e;
	O("LocalStore", "Unexpectedly lost primary lease");
}
var L = class e {
	constructor(e) {
		this.nextCallback = null, this.catchCallback = null, this.result = void 0, this.error = void 0, this.isDone = !1, this.callbackAttached = !1, e(((e) => {
			this.isDone = !0, this.result = e, this.nextCallback && this.nextCallback(e);
		}), ((e) => {
			this.isDone = !0, this.error = e, this.catchCallback && this.catchCallback(e);
		}));
	}
	catch(e) {
		return this.next(void 0, e);
	}
	next(t, n) {
		return this.callbackAttached && k(), this.callbackAttached = !0, this.isDone ? this.error ? this.wrapFailure(n, this.error) : this.wrapSuccess(t, this.result) : new e(((e, r) => {
			this.nextCallback = (n) => {
				this.wrapSuccess(t, n).next(e, r);
			}, this.catchCallback = (t) => {
				this.wrapFailure(n, t).next(e, r);
			};
		}));
	}
	toPromise() {
		return new Promise(((e, t) => {
			this.next(e, t);
		}));
	}
	wrapUserFunction(t) {
		try {
			let n = t();
			return n instanceof e ? n : e.resolve(n);
		} catch (t) {
			return e.reject(t);
		}
	}
	wrapSuccess(t, n) {
		return t ? this.wrapUserFunction((() => t(n))) : e.resolve(n);
	}
	wrapFailure(t, n) {
		return t ? this.wrapUserFunction((() => t(n))) : e.reject(n);
	}
	static resolve(t) {
		return new e(((e, n) => {
			e(t);
		}));
	}
	static reject(t) {
		return new e(((e, n) => {
			n(t);
		}));
	}
	static waitFor(t) {
		return new e(((e, n) => {
			let r = 0, i = 0, a = !1;
			t.forEach(((t) => {
				++r, t.next((() => {
					++i, a && i === r && e();
				}), ((e) => n(e)));
			})), a = !0, i === r && e();
		}));
	}
	static or(t) {
		let n = e.resolve(!1);
		for (let r of t) n = n.next(((t) => t ? e.resolve(t) : r()));
		return n;
	}
	static forEach(e, t) {
		let n = [];
		return e.forEach(((e, r) => {
			n.push(t.call(this, e, r));
		})), this.waitFor(n);
	}
	static mapArray(t, n) {
		return new e(((e, r) => {
			let i = t.length, a = Array(i), o = 0;
			for (let s = 0; s < i; s++) {
				let c = s;
				n(t[c]).next(((t) => {
					a[c] = t, ++o, o === i && e(a);
				}), ((e) => r(e)));
			}
		}));
	}
	static doWhile(t, n) {
		return new e(((e, r) => {
			let i = () => {
				!0 === t() ? n().next((() => {
					i();
				}), r) : e();
			};
			i();
		}));
	}
}, pd = class e {
	constructor(e, t) {
		this.action = e, this.transaction = t, this.aborted = !1, this.V = new Uu(), this.transaction.oncomplete = () => {
			this.V.resolve();
		}, this.transaction.onabort = () => {
			t.error ? this.V.reject(new gd(e, t.error)) : this.V.resolve();
		}, this.transaction.onerror = (t) => {
			let n = xd(t.target.error);
			this.V.reject(new gd(e, n));
		};
	}
	static open(t, n, r, i) {
		try {
			return new e(n, t.transaction(i, r));
		} catch (e) {
			throw new gd(n, e);
		}
	}
	get m() {
		return this.V.promise;
	}
	abort(e) {
		e && this.V.reject(e), this.aborted || (O("SimpleDb", "Aborting transaction:", e ? e.message : "Client-initiated abort"), this.aborted = !0, this.transaction.abort());
	}
	g() {
		let e = this.transaction;
		this.aborted || typeof e.commit != "function" || e.commit();
	}
	store(e) {
		return new vd(this.transaction.objectStore(e));
	}
}, md = class e {
	constructor(t, n, r) {
		this.name = t, this.version = n, this.p = r, e.S(h()) === 12.2 && Bu("Firestore persistence suffers from a bug in iOS 12.2 Safari that may cause your app to stop working. See https://stackoverflow.com/q/56496296/110915 for details and a potential workaround.");
	}
	static delete(e) {
		return O("SimpleDb", "Removing database:", e), yd(window.indexedDB.deleteDatabase(e)).toPromise();
	}
	static D() {
		if (!le()) return !1;
		if (e.C()) return !0;
		let t = h(), n = e.S(t), r = 0 < n && n < 10, i = e.v(t), a = 0 < i && i < 4.5;
		return !(t.indexOf("MSIE ") > 0 || t.indexOf("Trident/") > 0 || t.indexOf("Edge/") > 0 || r || a);
	}
	static C() {
		return typeof process < "u" && process.__PRIVATE_env?.F === "YES";
	}
	static M(e, t) {
		return e.store(t);
	}
	static S(e) {
		let t = e.match(/i(?:phone|pad|pod) os ([\d_]+)/i), n = t ? t[1].split("_").slice(0, 2).join(".") : "-1";
		return Number(n);
	}
	static v(e) {
		let t = e.match(/Android ([\d.]+)/i), n = t ? t[1].split(".").slice(0, 2).join(".") : "-1";
		return Number(n);
	}
	async O(e) {
		return this.db ||= (O("SimpleDb", "Opening database:", this.name), await new Promise(((t, n) => {
			let r = indexedDB.open(this.name, this.version);
			r.onsuccess = (e) => {
				let n = e.target.result;
				t(n);
			}, r.onblocked = () => {
				n(new gd(e, "Cannot upgrade IndexedDB schema while another tab is open. Close all tabs that access Firestore and reload this page to proceed."));
			}, r.onerror = (t) => {
				let r = t.target.error;
				r.name === "VersionError" ? n(new N(M.FAILED_PRECONDITION, "A newer version of the Firestore SDK was previously used and so the persisted data is not compatible with the version of the SDK you are now using. The SDK will operate with persistence disabled. If you need persistence, please re-upgrade to a newer version of the SDK or else clear the persisted IndexedDB data for your app to start fresh.")) : r.name === "InvalidStateError" ? n(new N(M.FAILED_PRECONDITION, "Unable to open an IndexedDB connection. This could be due to running in a private browsing session on a browser whose private browsing sessions do not support IndexedDB: " + r)) : n(new gd(e, r));
			}, r.onupgradeneeded = (e) => {
				O("SimpleDb", "Database \"" + this.name + "\" requires upgrade from version:", e.oldVersion);
				let t = e.target.result;
				this.p.N(t, r.transaction, e.oldVersion, this.version).next((() => {
					O("SimpleDb", "Database upgrade to version " + this.version + " complete");
				}));
			};
		}))), this.L && (this.db.onversionchange = (e) => this.L(e)), this.db;
	}
	B(e) {
		this.L = e, this.db && (this.db.onversionchange = (t) => e(t));
	}
	async runTransaction(e, t, n, r) {
		let i = t === "readonly", a = 0;
		for (;;) {
			++a;
			try {
				this.db = await this.O(e);
				let t = pd.open(this.db, e, i ? "readonly" : "readwrite", n), a = r(t).next(((e) => (t.g(), e))).catch(((e) => (t.abort(e), L.reject(e)))).toPromise();
				return a.catch((() => {})), await t.m, a;
			} catch (e) {
				let t = e, n = t.name !== "FirebaseError" && a < 3;
				if (O("SimpleDb", "Transaction failed with error:", t.message, "Retrying:", n), this.close(), !n) return Promise.reject(t);
			}
		}
	}
	close() {
		this.db && this.db.close(), this.db = void 0;
	}
}, hd = class {
	constructor(e) {
		this.k = e, this.q = !1, this.K = null;
	}
	get isDone() {
		return this.q;
	}
	get $() {
		return this.K;
	}
	set cursor(e) {
		this.k = e;
	}
	done() {
		this.q = !0;
	}
	U(e) {
		this.K = e;
	}
	delete() {
		return yd(this.k.delete());
	}
}, gd = class extends N {
	constructor(e, t) {
		super(M.UNAVAILABLE, `IndexedDB transaction '${e}' failed: ${t}`), this.name = "IndexedDbTransactionError";
	}
};
function _d(e) {
	return e.name === "IndexedDbTransactionError";
}
var vd = class {
	constructor(e) {
		this.store = e;
	}
	put(e, t) {
		let n;
		return t === void 0 ? (O("SimpleDb", "PUT", this.store.name, "<auto-key>", e), n = this.store.put(e)) : (O("SimpleDb", "PUT", this.store.name, e, t), n = this.store.put(t, e)), yd(n);
	}
	add(e) {
		return O("SimpleDb", "ADD", this.store.name, e, e), yd(this.store.add(e));
	}
	get(e) {
		return yd(this.store.get(e)).next(((t) => (t === void 0 && (t = null), O("SimpleDb", "GET", this.store.name, e, t), t)));
	}
	delete(e) {
		return O("SimpleDb", "DELETE", this.store.name, e), yd(this.store.delete(e));
	}
	count() {
		return O("SimpleDb", "COUNT", this.store.name), yd(this.store.count());
	}
	W(e, t) {
		let n = this.options(e, t), r = n.index ? this.store.index(n.index) : this.store;
		if (typeof r.getAll == "function") {
			let e = r.getAll(n.range);
			return new L(((t, n) => {
				e.onerror = (e) => {
					n(e.target.error);
				}, e.onsuccess = (e) => {
					t(e.target.result);
				};
			}));
		}
		{
			let e = this.cursor(n), t = [];
			return this.G(e, ((e, n) => {
				t.push(n);
			})).next((() => t));
		}
	}
	j(e, t) {
		let n = this.store.getAll(e, t === null ? void 0 : t);
		return new L(((e, t) => {
			n.onerror = (e) => {
				t(e.target.error);
			}, n.onsuccess = (t) => {
				e(t.target.result);
			};
		}));
	}
	H(e, t) {
		O("SimpleDb", "DELETE ALL", this.store.name);
		let n = this.options(e, t);
		n.J = !1;
		let r = this.cursor(n);
		return this.G(r, ((e, t, n) => n.delete()));
	}
	Y(e, t) {
		let n;
		t ? n = e : (n = {}, t = e);
		let r = this.cursor(n);
		return this.G(r, t);
	}
	Z(e) {
		let t = this.cursor({});
		return new L(((n, r) => {
			t.onerror = (e) => {
				r(xd(e.target.error));
			}, t.onsuccess = (t) => {
				let r = t.target.result;
				r ? e(r.primaryKey, r.value).next(((e) => {
					e ? r.continue() : n();
				})) : n();
			};
		}));
	}
	G(e, t) {
		let n = [];
		return new L(((r, i) => {
			e.onerror = (e) => {
				i(e.target.error);
			}, e.onsuccess = (e) => {
				let i = e.target.result;
				if (!i) return void r();
				let a = new hd(i), o = t(i.primaryKey, i.value, a);
				if (o instanceof L) {
					let e = o.catch(((e) => (a.done(), L.reject(e))));
					n.push(e);
				}
				a.isDone ? r() : a.$ === null ? i.continue() : i.continue(a.$);
			};
		})).next((() => L.waitFor(n)));
	}
	options(e, t) {
		let n;
		return e !== void 0 && (typeof e == "string" ? n = e : t = e), {
			index: n,
			range: t
		};
	}
	cursor(e) {
		let t = "next";
		if (e.reverse && (t = "prev"), e.index) {
			let n = this.store.index(e.index);
			return e.J ? n.openKeyCursor(e.range, t) : n.openCursor(e.range, t);
		}
		return this.store.openCursor(e.range, t);
	}
};
function yd(e) {
	return new L(((t, n) => {
		e.onsuccess = (e) => {
			let n = e.target.result;
			t(n);
		}, e.onerror = (e) => {
			n(xd(e.target.error));
		};
	}));
}
var bd = !1;
function xd(e) {
	let t = md.S(h());
	if (t >= 12.2 && t < 13) {
		let t = "An internal error was encountered in the Indexed Database server";
		if (e.message.indexOf(t) >= 0) {
			let e = new N("internal", `IOS_INDEXEDDB_BUG1: IndexedDb has thrown '${t}'. This is likely due to an unavoidable bug in iOS. See https://stackoverflow.com/q/56496296/110915 for details and a potential workaround.`);
			return bd || (bd = !0, setTimeout((() => {
				throw e;
			}), 0)), e;
		}
	}
	return e;
}
var Sd = class {
	constructor(e, t) {
		this.previousValue = e, t && (t.sequenceNumberHandler = (e) => this.se(e), this.oe = (e) => t.writeSequenceNumber(e));
	}
	se(e) {
		return this.previousValue = Math.max(e, this.previousValue), this.previousValue;
	}
	next() {
		let e = ++this.previousValue;
		return this.oe && this.oe(e), e;
	}
};
Sd._e = -1;
function Cd(e) {
	return e == null;
}
function wd(e) {
	return e === 0 && 1 / e == -1 / 0;
}
function Td(e) {
	return typeof e == "number" && Number.isInteger(e) && !wd(e) && e <= 2 ** 53 - 1 && e >= -(2 ** 53 - 1);
}
function Ed(e) {
	let t = 0;
	for (let n in e) Object.prototype.hasOwnProperty.call(e, n) && t++;
	return t;
}
function Dd(e, t) {
	for (let n in e) Object.prototype.hasOwnProperty.call(e, n) && t(n, e[n]);
}
function Od(e) {
	for (let t in e) if (Object.prototype.hasOwnProperty.call(e, t)) return !1;
	return !0;
}
var kd = class e {
	constructor(e, t) {
		this.comparator = e, this.root = t || jd.EMPTY;
	}
	insert(t, n) {
		return new e(this.comparator, this.root.insert(t, n, this.comparator).copy(null, null, jd.BLACK, null, null));
	}
	remove(t) {
		return new e(this.comparator, this.root.remove(t, this.comparator).copy(null, null, jd.BLACK, null, null));
	}
	get(e) {
		let t = this.root;
		for (; !t.isEmpty();) {
			let n = this.comparator(e, t.key);
			if (n === 0) return t.value;
			n < 0 ? t = t.left : n > 0 && (t = t.right);
		}
		return null;
	}
	indexOf(e) {
		let t = 0, n = this.root;
		for (; !n.isEmpty();) {
			let r = this.comparator(e, n.key);
			if (r === 0) return t + n.left.size;
			r < 0 ? n = n.left : (t += n.left.size + 1, n = n.right);
		}
		return -1;
	}
	isEmpty() {
		return this.root.isEmpty();
	}
	get size() {
		return this.root.size;
	}
	minKey() {
		return this.root.minKey();
	}
	maxKey() {
		return this.root.maxKey();
	}
	inorderTraversal(e) {
		return this.root.inorderTraversal(e);
	}
	forEach(e) {
		this.inorderTraversal(((t, n) => (e(t, n), !1)));
	}
	toString() {
		let e = [];
		return this.inorderTraversal(((t, n) => (e.push(`${t}:${n}`), !1))), `{${e.join(", ")}}`;
	}
	reverseTraversal(e) {
		return this.root.reverseTraversal(e);
	}
	getIterator() {
		return new Ad(this.root, null, this.comparator, !1);
	}
	getIteratorFrom(e) {
		return new Ad(this.root, e, this.comparator, !1);
	}
	getReverseIterator() {
		return new Ad(this.root, null, this.comparator, !0);
	}
	getReverseIteratorFrom(e) {
		return new Ad(this.root, e, this.comparator, !0);
	}
}, Ad = class {
	constructor(e, t, n, r) {
		this.isReverse = r, this.nodeStack = [];
		let i = 1;
		for (; !e.isEmpty();) if (i = t ? n(e.key, t) : 1, t && r && (i *= -1), i < 0) e = this.isReverse ? e.left : e.right;
		else {
			if (i === 0) {
				this.nodeStack.push(e);
				break;
			}
			this.nodeStack.push(e), e = this.isReverse ? e.right : e.left;
		}
	}
	getNext() {
		let e = this.nodeStack.pop(), t = {
			key: e.key,
			value: e.value
		};
		if (this.isReverse) for (e = e.left; !e.isEmpty();) this.nodeStack.push(e), e = e.right;
		else for (e = e.right; !e.isEmpty();) this.nodeStack.push(e), e = e.left;
		return t;
	}
	hasNext() {
		return this.nodeStack.length > 0;
	}
	peek() {
		if (this.nodeStack.length === 0) return null;
		let e = this.nodeStack[this.nodeStack.length - 1];
		return {
			key: e.key,
			value: e.value
		};
	}
}, jd = class e {
	constructor(t, n, r, i, a) {
		this.key = t, this.value = n, this.color = r ?? e.RED, this.left = i ?? e.EMPTY, this.right = a ?? e.EMPTY, this.size = this.left.size + 1 + this.right.size;
	}
	copy(t, n, r, i, a) {
		return new e(t ?? this.key, n ?? this.value, r ?? this.color, i ?? this.left, a ?? this.right);
	}
	isEmpty() {
		return !1;
	}
	inorderTraversal(e) {
		return this.left.inorderTraversal(e) || e(this.key, this.value) || this.right.inorderTraversal(e);
	}
	reverseTraversal(e) {
		return this.right.reverseTraversal(e) || e(this.key, this.value) || this.left.reverseTraversal(e);
	}
	min() {
		return this.left.isEmpty() ? this : this.left.min();
	}
	minKey() {
		return this.min().key;
	}
	maxKey() {
		return this.right.isEmpty() ? this.key : this.right.maxKey();
	}
	insert(e, t, n) {
		let r = this, i = n(e, r.key);
		return r = i < 0 ? r.copy(null, null, null, r.left.insert(e, t, n), null) : i === 0 ? r.copy(null, t, null, null, null) : r.copy(null, null, null, null, r.right.insert(e, t, n)), r.fixUp();
	}
	removeMin() {
		if (this.left.isEmpty()) return e.EMPTY;
		let t = this;
		return t.left.isRed() || t.left.left.isRed() || (t = t.moveRedLeft()), t = t.copy(null, null, null, t.left.removeMin(), null), t.fixUp();
	}
	remove(t, n) {
		let r, i = this;
		if (n(t, i.key) < 0) i.left.isEmpty() || i.left.isRed() || i.left.left.isRed() || (i = i.moveRedLeft()), i = i.copy(null, null, null, i.left.remove(t, n), null);
		else {
			if (i.left.isRed() && (i = i.rotateRight()), i.right.isEmpty() || i.right.isRed() || i.right.left.isRed() || (i = i.moveRedRight()), n(t, i.key) === 0) {
				if (i.right.isEmpty()) return e.EMPTY;
				r = i.right.min(), i = i.copy(r.key, r.value, null, null, i.right.removeMin());
			}
			i = i.copy(null, null, null, null, i.right.remove(t, n));
		}
		return i.fixUp();
	}
	isRed() {
		return this.color;
	}
	fixUp() {
		let e = this;
		return e.right.isRed() && !e.left.isRed() && (e = e.rotateLeft()), e.left.isRed() && e.left.left.isRed() && (e = e.rotateRight()), e.left.isRed() && e.right.isRed() && (e = e.colorFlip()), e;
	}
	moveRedLeft() {
		let e = this.colorFlip();
		return e.right.left.isRed() && (e = e.copy(null, null, null, null, e.right.rotateRight()), e = e.rotateLeft(), e = e.colorFlip()), e;
	}
	moveRedRight() {
		let e = this.colorFlip();
		return e.left.left.isRed() && (e = e.rotateRight(), e = e.colorFlip()), e;
	}
	rotateLeft() {
		let t = this.copy(null, null, e.RED, null, this.right.left);
		return this.right.copy(null, null, this.color, t, null);
	}
	rotateRight() {
		let t = this.copy(null, null, e.RED, this.left.right, null);
		return this.left.copy(null, null, this.color, null, t);
	}
	colorFlip() {
		let e = this.left.copy(null, null, !this.left.color, null, null), t = this.right.copy(null, null, !this.right.color, null, null);
		return this.copy(null, null, !this.color, e, t);
	}
	checkMaxDepth() {
		return 2 ** this.check() <= this.size + 1;
	}
	check() {
		if (this.isRed() && this.left.isRed() || this.right.isRed()) throw k();
		let e = this.left.check();
		if (e !== this.right.check()) throw k();
		return e + +!this.isRed();
	}
};
jd.EMPTY = null, jd.RED = !0, jd.BLACK = !1, jd.EMPTY = new class {
	constructor() {
		this.size = 0;
	}
	get key() {
		throw k();
	}
	get value() {
		throw k();
	}
	get color() {
		throw k();
	}
	get left() {
		throw k();
	}
	get right() {
		throw k();
	}
	copy(e, t, n, r, i) {
		return this;
	}
	insert(e, t, n) {
		return new jd(e, t);
	}
	remove(e, t) {
		return this;
	}
	isEmpty() {
		return !0;
	}
	inorderTraversal(e) {
		return !1;
	}
	reverseTraversal(e) {
		return !1;
	}
	minKey() {
		return null;
	}
	maxKey() {
		return null;
	}
	isRed() {
		return !1;
	}
	checkMaxDepth() {
		return !0;
	}
	check() {
		return 0;
	}
}();
var Md = class e {
	constructor(e) {
		this.comparator = e, this.data = new kd(this.comparator);
	}
	has(e) {
		return this.data.get(e) !== null;
	}
	first() {
		return this.data.minKey();
	}
	last() {
		return this.data.maxKey();
	}
	get size() {
		return this.data.size;
	}
	indexOf(e) {
		return this.data.indexOf(e);
	}
	forEach(e) {
		this.data.inorderTraversal(((t, n) => (e(t), !1)));
	}
	forEachInRange(e, t) {
		let n = this.data.getIteratorFrom(e[0]);
		for (; n.hasNext();) {
			let r = n.getNext();
			if (this.comparator(r.key, e[1]) >= 0) return;
			t(r.key);
		}
	}
	forEachWhile(e, t) {
		let n;
		for (n = t === void 0 ? this.data.getIterator() : this.data.getIteratorFrom(t); n.hasNext();) if (!e(n.getNext().key)) return;
	}
	firstAfterOrEqual(e) {
		let t = this.data.getIteratorFrom(e);
		return t.hasNext() ? t.getNext().key : null;
	}
	getIterator() {
		return new Nd(this.data.getIterator());
	}
	getIteratorFrom(e) {
		return new Nd(this.data.getIteratorFrom(e));
	}
	add(e) {
		return this.copy(this.data.remove(e).insert(e, !0));
	}
	delete(e) {
		return this.has(e) ? this.copy(this.data.remove(e)) : this;
	}
	isEmpty() {
		return this.data.isEmpty();
	}
	unionWith(e) {
		let t = this;
		return t.size < e.size && (t = e, e = this), e.forEach(((e) => {
			t = t.add(e);
		})), t;
	}
	isEqual(t) {
		if (!(t instanceof e) || this.size !== t.size) return !1;
		let n = this.data.getIterator(), r = t.data.getIterator();
		for (; n.hasNext();) {
			let e = n.getNext().key, t = r.getNext().key;
			if (this.comparator(e, t) !== 0) return !1;
		}
		return !0;
	}
	toArray() {
		let e = [];
		return this.forEach(((t) => {
			e.push(t);
		})), e;
	}
	toString() {
		let e = [];
		return this.forEach(((t) => e.push(t))), "SortedSet(" + e.toString() + ")";
	}
	copy(t) {
		let n = new e(this.comparator);
		return n.data = t, n;
	}
}, Nd = class {
	constructor(e) {
		this.iter = e;
	}
	getNext() {
		return this.iter.getNext().key;
	}
	hasNext() {
		return this.iter.hasNext();
	}
}, Pd = class e {
	constructor(e) {
		this.fields = e, e.sort(ad.comparator);
	}
	static empty() {
		return new e([]);
	}
	unionWith(t) {
		let n = new Md(ad.comparator);
		for (let e of this.fields) n = n.add(e);
		for (let e of t) n = n.add(e);
		return new e(n.toArray());
	}
	covers(e) {
		for (let t of this.fields) if (t.isPrefixOf(e)) return !0;
		return !1;
	}
	isEqual(e) {
		return ed(this.fields, e.fields, ((e, t) => e.isEqual(t)));
	}
}, Fd = class extends Error {
	constructor() {
		super(...arguments), this.name = "Base64DecodeError";
	}
}, Id = class e {
	constructor(e) {
		this.binaryString = e;
	}
	static fromBase64String(t) {
		let n = function(e) {
			try {
				return atob(e);
			} catch (e) {
				throw typeof DOMException < "u" && e instanceof DOMException ? new Fd("Invalid base64 string: " + e) : e;
			}
		}(t);
		return new e(n);
	}
	static fromUint8Array(t) {
		let n = function(e) {
			let t = "";
			for (let n = 0; n < e.length; ++n) t += String.fromCharCode(e[n]);
			return t;
		}(t);
		return new e(n);
	}
	[Symbol.iterator]() {
		let e = 0;
		return { next: () => e < this.binaryString.length ? {
			value: this.binaryString.charCodeAt(e++),
			done: !1
		} : {
			value: void 0,
			done: !0
		} };
	}
	toBase64() {
		return function(e) {
			return btoa(e);
		}(this.binaryString);
	}
	toUint8Array() {
		return function(e) {
			let t = new Uint8Array(e.length);
			for (let n = 0; n < e.length; n++) t[n] = e.charCodeAt(n);
			return t;
		}(this.binaryString);
	}
	approximateByteSize() {
		return 2 * this.binaryString.length;
	}
	compareTo(e) {
		return P(this.binaryString, e.binaryString);
	}
	isEqual(e) {
		return this.binaryString === e.binaryString;
	}
};
Id.EMPTY_BYTE_STRING = new Id("");
var Ld = /* @__PURE__ */ new RegExp(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.(\d+))?Z$/);
function Rd(e) {
	if (A(!!e), typeof e == "string") {
		let t = 0, n = Ld.exec(e);
		if (A(!!n), n[1]) {
			let e = n[1];
			e = (e + "000000000").substr(0, 9), t = Number(e);
		}
		let r = new Date(e);
		return {
			seconds: Math.floor(r.getTime() / 1e3),
			nanos: t
		};
	}
	return {
		seconds: zd(e.seconds),
		nanos: zd(e.nanos)
	};
}
function zd(e) {
	return typeof e == "number" ? e : typeof e == "string" ? Number(e) : 0;
}
function Bd(e) {
	return typeof e == "string" ? Id.fromBase64String(e) : Id.fromUint8Array(e);
}
function Vd(e) {
	return (e?.mapValue?.fields || {}).__type__?.stringValue === "server_timestamp";
}
function Hd(e) {
	let t = e.mapValue.fields.__previous_value__;
	return Vd(t) ? Hd(t) : t;
}
function Ud(e) {
	let t = Rd(e.mapValue.fields.__local_write_time__.timestampValue);
	return new td(t.seconds, t.nanos);
}
var Wd = class {
	constructor(e, t, n, r, i, a, o, s, c) {
		this.databaseId = e, this.appId = t, this.persistenceKey = n, this.host = r, this.ssl = i, this.forceLongPolling = a, this.autoDetectLongPolling = o, this.longPollingOptions = s, this.useFetchStreams = c;
	}
}, Gd = class e {
	constructor(e, t) {
		this.projectId = e, this.database = t || "(default)";
	}
	static empty() {
		return new e("", "");
	}
	get isDefaultDatabase() {
		return this.database === "(default)";
	}
	isEqual(t) {
		return t instanceof e && t.projectId === this.projectId && t.database === this.database;
	}
}, Kd = { mapValue: { fields: { __type__: { stringValue: "__max__" } } } };
function qd(e) {
	return "nullValue" in e ? 0 : "booleanValue" in e ? 1 : "integerValue" in e || "doubleValue" in e ? 2 : "timestampValue" in e ? 3 : "stringValue" in e ? 5 : "bytesValue" in e ? 6 : "referenceValue" in e ? 7 : "geoPointValue" in e ? 8 : "arrayValue" in e ? 9 : "mapValue" in e ? Vd(e) ? 4 : cf(e) ? 9007199254740991 : 10 : k();
}
function Jd(e, t) {
	if (e === t) return !0;
	let n = qd(e);
	if (n !== qd(t)) return !1;
	switch (n) {
		case 0:
		case 9007199254740991: return !0;
		case 1: return e.booleanValue === t.booleanValue;
		case 4: return Ud(e).isEqual(Ud(t));
		case 3: return function(e, t) {
			if (typeof e.timestampValue == "string" && typeof t.timestampValue == "string" && e.timestampValue.length === t.timestampValue.length) return e.timestampValue === t.timestampValue;
			let n = Rd(e.timestampValue), r = Rd(t.timestampValue);
			return n.seconds === r.seconds && n.nanos === r.nanos;
		}(e, t);
		case 5: return e.stringValue === t.stringValue;
		case 6: return function(e, t) {
			return Bd(e.bytesValue).isEqual(Bd(t.bytesValue));
		}(e, t);
		case 7: return e.referenceValue === t.referenceValue;
		case 8: return function(e, t) {
			return zd(e.geoPointValue.latitude) === zd(t.geoPointValue.latitude) && zd(e.geoPointValue.longitude) === zd(t.geoPointValue.longitude);
		}(e, t);
		case 2: return function(e, t) {
			if ("integerValue" in e && "integerValue" in t) return zd(e.integerValue) === zd(t.integerValue);
			if ("doubleValue" in e && "doubleValue" in t) {
				let n = zd(e.doubleValue), r = zd(t.doubleValue);
				return n === r ? wd(n) === wd(r) : isNaN(n) && isNaN(r);
			}
			return !1;
		}(e, t);
		case 9: return ed(e.arrayValue.values || [], t.arrayValue.values || [], Jd);
		case 10: return function(e, t) {
			let n = e.mapValue.fields || {}, r = t.mapValue.fields || {};
			if (Ed(n) !== Ed(r)) return !1;
			for (let e in n) if (n.hasOwnProperty(e) && (r[e] === void 0 || !Jd(n[e], r[e]))) return !1;
			return !0;
		}(e, t);
		default: return k();
	}
}
function Yd(e, t) {
	return (e.values || []).find(((e) => Jd(e, t))) !== void 0;
}
function Xd(e, t) {
	if (e === t) return 0;
	let n = qd(e), r = qd(t);
	if (n !== r) return P(n, r);
	switch (n) {
		case 0:
		case 9007199254740991: return 0;
		case 1: return P(e.booleanValue, t.booleanValue);
		case 2: return function(e, t) {
			let n = zd(e.integerValue || e.doubleValue), r = zd(t.integerValue || t.doubleValue);
			return n < r ? -1 : n > r ? 1 : n === r ? 0 : isNaN(n) ? isNaN(r) ? 0 : -1 : 1;
		}(e, t);
		case 3: return Zd(e.timestampValue, t.timestampValue);
		case 4: return Zd(Ud(e), Ud(t));
		case 5: return P(e.stringValue, t.stringValue);
		case 6: return function(e, t) {
			let n = Bd(e), r = Bd(t);
			return n.compareTo(r);
		}(e.bytesValue, t.bytesValue);
		case 7: return function(e, t) {
			let n = e.split("/"), r = t.split("/");
			for (let e = 0; e < n.length && e < r.length; e++) {
				let t = P(n[e], r[e]);
				if (t !== 0) return t;
			}
			return P(n.length, r.length);
		}(e.referenceValue, t.referenceValue);
		case 8: return function(e, t) {
			let n = P(zd(e.latitude), zd(t.latitude));
			return n === 0 ? P(zd(e.longitude), zd(t.longitude)) : n;
		}(e.geoPointValue, t.geoPointValue);
		case 9: return function(e, t) {
			let n = e.values || [], r = t.values || [];
			for (let e = 0; e < n.length && e < r.length; ++e) {
				let t = Xd(n[e], r[e]);
				if (t) return t;
			}
			return P(n.length, r.length);
		}(e.arrayValue, t.arrayValue);
		case 10: return function(e, t) {
			if (e === Kd.mapValue && t === Kd.mapValue) return 0;
			if (e === Kd.mapValue) return 1;
			if (t === Kd.mapValue) return -1;
			let n = e.fields || {}, r = Object.keys(n), i = t.fields || {}, a = Object.keys(i);
			r.sort(), a.sort();
			for (let e = 0; e < r.length && e < a.length; ++e) {
				let t = P(r[e], a[e]);
				if (t !== 0) return t;
				let o = Xd(n[r[e]], i[a[e]]);
				if (o !== 0) return o;
			}
			return P(r.length, a.length);
		}(e.mapValue, t.mapValue);
		default: throw k();
	}
}
function Zd(e, t) {
	if (typeof e == "string" && typeof t == "string" && e.length === t.length) return P(e, t);
	let n = Rd(e), r = Rd(t), i = P(n.seconds, r.seconds);
	return i === 0 ? P(n.nanos, r.nanos) : i;
}
function Qd(e) {
	return $d(e);
}
function $d(e) {
	return "nullValue" in e ? "null" : "booleanValue" in e ? "" + e.booleanValue : "integerValue" in e ? "" + e.integerValue : "doubleValue" in e ? "" + e.doubleValue : "timestampValue" in e ? function(e) {
		let t = Rd(e);
		return `time(${t.seconds},${t.nanos})`;
	}(e.timestampValue) : "stringValue" in e ? e.stringValue : "bytesValue" in e ? function(e) {
		return Bd(e).toBase64();
	}(e.bytesValue) : "referenceValue" in e ? function(e) {
		return I.fromName(e).toString();
	}(e.referenceValue) : "geoPointValue" in e ? function(e) {
		return `geo(${e.latitude},${e.longitude})`;
	}(e.geoPointValue) : "arrayValue" in e ? function(e) {
		let t = "[", n = !0;
		for (let r of e.values || []) n ? n = !1 : t += ",", t += $d(r);
		return t + "]";
	}(e.arrayValue) : "mapValue" in e ? function(e) {
		let t = Object.keys(e.fields || {}).sort(), n = "{", r = !0;
		for (let i of t) r ? r = !1 : n += ",", n += `${i}:${$d(e.fields[i])}`;
		return n + "}";
	}(e.mapValue) : k();
}
function ef(e, t) {
	return { referenceValue: `projects/${e.projectId}/databases/${e.database}/documents/${t.path.canonicalString()}` };
}
function tf(e) {
	return !!e && "integerValue" in e;
}
function nf(e) {
	return !!e && "arrayValue" in e;
}
function rf(e) {
	return !!e && "nullValue" in e;
}
function af(e) {
	return !!e && "doubleValue" in e && isNaN(Number(e.doubleValue));
}
function of(e) {
	return !!e && "mapValue" in e;
}
function sf(e) {
	if (e.geoPointValue) return { geoPointValue: Object.assign({}, e.geoPointValue) };
	if (e.timestampValue && typeof e.timestampValue == "object") return { timestampValue: Object.assign({}, e.timestampValue) };
	if (e.mapValue) {
		let t = { mapValue: { fields: {} } };
		return Dd(e.mapValue.fields, ((e, n) => t.mapValue.fields[e] = sf(n))), t;
	}
	if (e.arrayValue) {
		let t = { arrayValue: { values: [] } };
		for (let n = 0; n < (e.arrayValue.values || []).length; ++n) t.arrayValue.values[n] = sf(e.arrayValue.values[n]);
		return t;
	}
	return Object.assign({}, e);
}
function cf(e) {
	return (((e.mapValue || {}).fields || {}).__type__ || {}).stringValue === "__max__";
}
var lf = class e {
	constructor(e) {
		this.value = e;
	}
	static empty() {
		return new e({ mapValue: {} });
	}
	field(e) {
		if (e.isEmpty()) return this.value;
		{
			let t = this.value;
			for (let n = 0; n < e.length - 1; ++n) if (t = (t.mapValue.fields || {})[e.get(n)], !of(t)) return null;
			return t = (t.mapValue.fields || {})[e.lastSegment()], t || null;
		}
	}
	set(e, t) {
		this.getFieldsMap(e.popLast())[e.lastSegment()] = sf(t);
	}
	setAll(e) {
		let t = ad.emptyPath(), n = {}, r = [];
		e.forEach(((e, i) => {
			if (!t.isImmediateParentOf(i)) {
				let e = this.getFieldsMap(t);
				this.applyChanges(e, n, r), n = {}, r = [], t = i.popLast();
			}
			e ? n[i.lastSegment()] = sf(e) : r.push(i.lastSegment());
		}));
		let i = this.getFieldsMap(t);
		this.applyChanges(i, n, r);
	}
	delete(e) {
		let t = this.field(e.popLast());
		of(t) && t.mapValue.fields && delete t.mapValue.fields[e.lastSegment()];
	}
	isEqual(e) {
		return Jd(this.value, e.value);
	}
	getFieldsMap(e) {
		let t = this.value;
		t.mapValue.fields || (t.mapValue = { fields: {} });
		for (let n = 0; n < e.length; ++n) {
			let r = t.mapValue.fields[e.get(n)];
			of(r) && r.mapValue.fields || (r = { mapValue: { fields: {} } }, t.mapValue.fields[e.get(n)] = r), t = r;
		}
		return t.mapValue.fields;
	}
	applyChanges(e, t, n) {
		Dd(t, ((t, n) => e[t] = n));
		for (let t of n) delete e[t];
	}
	clone() {
		return new e(sf(this.value));
	}
};
function uf(e) {
	let t = [];
	return Dd(e.fields, ((e, n) => {
		let r = new ad([e]);
		if (of(n)) {
			let e = uf(n.mapValue).fields;
			if (e.length === 0) t.push(r);
			else for (let n of e) t.push(r.child(n));
		} else t.push(r);
	})), new Pd(t);
}
var df = class e {
	constructor(e, t, n, r, i, a, o) {
		this.key = e, this.documentType = t, this.version = n, this.readTime = r, this.createTime = i, this.data = a, this.documentState = o;
	}
	static newInvalidDocument(t) {
		return new e(t, 0, F.min(), F.min(), F.min(), lf.empty(), 0);
	}
	static newFoundDocument(t, n, r, i) {
		return new e(t, 1, n, F.min(), r, i, 0);
	}
	static newNoDocument(t, n) {
		return new e(t, 2, n, F.min(), F.min(), lf.empty(), 0);
	}
	static newUnknownDocument(t, n) {
		return new e(t, 3, n, F.min(), F.min(), lf.empty(), 2);
	}
	convertToFoundDocument(e, t) {
		return !this.createTime.isEqual(F.min()) || this.documentType !== 2 && this.documentType !== 0 || (this.createTime = e), this.version = e, this.documentType = 1, this.data = t, this.documentState = 0, this;
	}
	convertToNoDocument(e) {
		return this.version = e, this.documentType = 2, this.data = lf.empty(), this.documentState = 0, this;
	}
	convertToUnknownDocument(e) {
		return this.version = e, this.documentType = 3, this.data = lf.empty(), this.documentState = 2, this;
	}
	setHasCommittedMutations() {
		return this.documentState = 2, this;
	}
	setHasLocalMutations() {
		return this.documentState = 1, this.version = F.min(), this;
	}
	setReadTime(e) {
		return this.readTime = e, this;
	}
	get hasLocalMutations() {
		return this.documentState === 1;
	}
	get hasCommittedMutations() {
		return this.documentState === 2;
	}
	get hasPendingWrites() {
		return this.hasLocalMutations || this.hasCommittedMutations;
	}
	isValidDocument() {
		return this.documentType !== 0;
	}
	isFoundDocument() {
		return this.documentType === 1;
	}
	isNoDocument() {
		return this.documentType === 2;
	}
	isUnknownDocument() {
		return this.documentType === 3;
	}
	isEqual(t) {
		return t instanceof e && this.key.isEqual(t.key) && this.version.isEqual(t.version) && this.documentType === t.documentType && this.documentState === t.documentState && this.data.isEqual(t.data);
	}
	mutableCopy() {
		return new e(this.key, this.documentType, this.version, this.readTime, this.createTime, this.data.clone(), this.documentState);
	}
	toString() {
		return `Document(${this.key}, ${this.version}, ${JSON.stringify(this.data.value)}, {createTime: ${this.createTime}}), {documentType: ${this.documentType}}), {documentState: ${this.documentState}})`;
	}
}, ff = class {
	constructor(e, t) {
		this.position = e, this.inclusive = t;
	}
};
function pf(e, t, n) {
	let r = 0;
	for (let i = 0; i < e.position.length; i++) {
		let a = t[i], o = e.position[i];
		if (r = a.field.isKeyField() ? I.comparator(I.fromName(o.referenceValue), n.key) : Xd(o, n.data.field(a.field)), a.dir === "desc" && (r *= -1), r !== 0) break;
	}
	return r;
}
function mf(e, t) {
	if (e === null) return t === null;
	if (t === null || e.inclusive !== t.inclusive || e.position.length !== t.position.length) return !1;
	for (let n = 0; n < e.position.length; n++) if (!Jd(e.position[n], t.position[n])) return !1;
	return !0;
}
var hf = class {
	constructor(e, t = "asc") {
		this.field = e, this.dir = t;
	}
};
function gf(e, t) {
	return e.dir === t.dir && e.field.isEqual(t.field);
}
var _f = class {}, vf = class e extends _f {
	constructor(e, t, n) {
		super(), this.field = e, this.op = t, this.value = n;
	}
	static create(t, n, r) {
		return t.isKeyField() ? n === "in" || n === "not-in" ? this.createKeyFieldInFilter(t, n, r) : new Ef(t, n, r) : n === "array-contains" ? new Af(t, r) : n === "in" ? new jf(t, r) : n === "not-in" ? new Mf(t, r) : n === "array-contains-any" ? new Nf(t, r) : new e(t, n, r);
	}
	static createKeyFieldInFilter(e, t, n) {
		return t === "in" ? new Df(e, n) : new Of(e, n);
	}
	matches(e) {
		let t = e.data.field(this.field);
		return this.op === "!=" ? t !== null && this.matchesComparison(Xd(t, this.value)) : t !== null && qd(this.value) === qd(t) && this.matchesComparison(Xd(t, this.value));
	}
	matchesComparison(e) {
		switch (this.op) {
			case "<": return e < 0;
			case "<=": return e <= 0;
			case "==": return e === 0;
			case "!=": return e !== 0;
			case ">": return e > 0;
			case ">=": return e >= 0;
			default: return k();
		}
	}
	isInequality() {
		return [
			"<",
			"<=",
			">",
			">=",
			"!=",
			"not-in"
		].indexOf(this.op) >= 0;
	}
	getFlattenedFilters() {
		return [this];
	}
	getFilters() {
		return [this];
	}
}, yf = class e extends _f {
	constructor(e, t) {
		super(), this.filters = e, this.op = t, this.ue = null;
	}
	static create(t, n) {
		return new e(t, n);
	}
	matches(e) {
		return bf(this) ? this.filters.find(((t) => !t.matches(e))) === void 0 : this.filters.find(((t) => t.matches(e))) !== void 0;
	}
	getFlattenedFilters() {
		return this.ue !== null || (this.ue = this.filters.reduce(((e, t) => e.concat(t.getFlattenedFilters())), [])), this.ue;
	}
	getFilters() {
		return Object.assign([], this.filters);
	}
};
function bf(e) {
	return e.op === "and";
}
function xf(e) {
	return Sf(e) && bf(e);
}
function Sf(e) {
	for (let t of e.filters) if (t instanceof yf) return !1;
	return !0;
}
function Cf(e) {
	if (e instanceof vf) return e.field.canonicalString() + e.op.toString() + Qd(e.value);
	if (xf(e)) return e.filters.map(((e) => Cf(e))).join(",");
	{
		let t = e.filters.map(((e) => Cf(e))).join(",");
		return `${e.op}(${t})`;
	}
}
function wf(e, t) {
	return e instanceof vf ? function(e, t) {
		return t instanceof vf && e.op === t.op && e.field.isEqual(t.field) && Jd(e.value, t.value);
	}(e, t) : e instanceof yf ? function(e, t) {
		return t instanceof yf && e.op === t.op && e.filters.length === t.filters.length && e.filters.reduce(((e, n, r) => e && wf(n, t.filters[r])), !0);
	}(e, t) : void k();
}
function Tf(e) {
	return e instanceof vf ? function(e) {
		return `${e.field.canonicalString()} ${e.op} ${Qd(e.value)}`;
	}(e) : e instanceof yf ? function(e) {
		return e.op.toString() + " {" + e.getFilters().map(Tf).join(" ,") + "}";
	}(e) : "Filter";
}
var Ef = class extends vf {
	constructor(e, t, n) {
		super(e, t, n), this.key = I.fromName(n.referenceValue);
	}
	matches(e) {
		let t = I.comparator(e.key, this.key);
		return this.matchesComparison(t);
	}
}, Df = class extends vf {
	constructor(e, t) {
		super(e, "in", t), this.keys = kf("in", t);
	}
	matches(e) {
		return this.keys.some(((t) => t.isEqual(e.key)));
	}
}, Of = class extends vf {
	constructor(e, t) {
		super(e, "not-in", t), this.keys = kf("not-in", t);
	}
	matches(e) {
		return !this.keys.some(((t) => t.isEqual(e.key)));
	}
};
function kf(e, t) {
	return (t.arrayValue?.values || []).map(((e) => I.fromName(e.referenceValue)));
}
var Af = class extends vf {
	constructor(e, t) {
		super(e, "array-contains", t);
	}
	matches(e) {
		let t = e.data.field(this.field);
		return nf(t) && Yd(t.arrayValue, this.value);
	}
}, jf = class extends vf {
	constructor(e, t) {
		super(e, "in", t);
	}
	matches(e) {
		let t = e.data.field(this.field);
		return t !== null && Yd(this.value.arrayValue, t);
	}
}, Mf = class extends vf {
	constructor(e, t) {
		super(e, "not-in", t);
	}
	matches(e) {
		if (Yd(this.value.arrayValue, { nullValue: "NULL_VALUE" })) return !1;
		let t = e.data.field(this.field);
		return t !== null && !Yd(this.value.arrayValue, t);
	}
}, Nf = class extends vf {
	constructor(e, t) {
		super(e, "array-contains-any", t);
	}
	matches(e) {
		let t = e.data.field(this.field);
		return !(!nf(t) || !t.arrayValue.values) && t.arrayValue.values.some(((e) => Yd(this.value.arrayValue, e)));
	}
}, Pf = class {
	constructor(e, t = null, n = [], r = [], i = null, a = null, o = null) {
		this.path = e, this.collectionGroup = t, this.orderBy = n, this.filters = r, this.limit = i, this.startAt = a, this.endAt = o, this.ce = null;
	}
};
function Ff(e, t = null, n = [], r = [], i = null, a = null, o = null) {
	return new Pf(e, t, n, r, i, a, o);
}
function If(e) {
	let t = j(e);
	if (t.ce === null) {
		let e = t.path.canonicalString();
		t.collectionGroup !== null && (e += "|cg:" + t.collectionGroup), e += "|f:", e += t.filters.map(((e) => Cf(e))).join(","), e += "|ob:", e += t.orderBy.map(((e) => function(e) {
			return e.field.canonicalString() + e.dir;
		}(e))).join(","), Cd(t.limit) || (e += "|l:", e += t.limit), t.startAt && (e += "|lb:", e += t.startAt.inclusive ? "b:" : "a:", e += t.startAt.position.map(((e) => Qd(e))).join(",")), t.endAt && (e += "|ub:", e += t.endAt.inclusive ? "a:" : "b:", e += t.endAt.position.map(((e) => Qd(e))).join(",")), t.ce = e;
	}
	return t.ce;
}
function Lf(e, t) {
	if (e.limit !== t.limit || e.orderBy.length !== t.orderBy.length) return !1;
	for (let n = 0; n < e.orderBy.length; n++) if (!gf(e.orderBy[n], t.orderBy[n])) return !1;
	if (e.filters.length !== t.filters.length) return !1;
	for (let n = 0; n < e.filters.length; n++) if (!wf(e.filters[n], t.filters[n])) return !1;
	return e.collectionGroup === t.collectionGroup && !!e.path.isEqual(t.path) && !!mf(e.startAt, t.startAt) && mf(e.endAt, t.endAt);
}
function Rf(e) {
	return I.isDocumentKey(e.path) && e.collectionGroup === null && e.filters.length === 0;
}
var zf = class {
	constructor(e, t = null, n = [], r = [], i = null, a = "F", o = null, s = null) {
		this.path = e, this.collectionGroup = t, this.explicitOrderBy = n, this.filters = r, this.limit = i, this.limitType = a, this.startAt = o, this.endAt = s, this.le = null, this.he = null, this.Pe = null, this.startAt, this.endAt;
	}
};
function Bf(e, t, n, r, i, a, o, s) {
	return new zf(e, t, n, r, i, a, o, s);
}
function Vf(e) {
	return new zf(e);
}
function Hf(e) {
	return e.filters.length === 0 && e.limit === null && e.startAt == null && e.endAt == null && (e.explicitOrderBy.length === 0 || e.explicitOrderBy.length === 1 && e.explicitOrderBy[0].field.isKeyField());
}
function Uf(e) {
	return e.collectionGroup !== null;
}
function Wf(e) {
	let t = j(e);
	if (t.le === null) {
		t.le = [];
		let e = /* @__PURE__ */ new Set();
		for (let n of t.explicitOrderBy) t.le.push(n), e.add(n.field.canonicalString());
		let n = t.explicitOrderBy.length > 0 ? t.explicitOrderBy[t.explicitOrderBy.length - 1].dir : "asc";
		(function(e) {
			let t = new Md(ad.comparator);
			return e.filters.forEach(((e) => {
				e.getFlattenedFilters().forEach(((e) => {
					e.isInequality() && (t = t.add(e.field));
				}));
			})), t;
		})(t).forEach(((r) => {
			e.has(r.canonicalString()) || r.isKeyField() || t.le.push(new hf(r, n));
		})), e.has(ad.keyField().canonicalString()) || t.le.push(new hf(ad.keyField(), n));
	}
	return t.le;
}
function Gf(e) {
	let t = j(e);
	return t.he ||= Kf(t, Wf(e)), t.he;
}
function Kf(e, t) {
	if (e.limitType === "F") return Ff(e.path, e.collectionGroup, t, e.filters, e.limit, e.startAt, e.endAt);
	{
		t = t.map(((e) => {
			let t = e.dir === "desc" ? "asc" : "desc";
			return new hf(e.field, t);
		}));
		let n = e.endAt ? new ff(e.endAt.position, e.endAt.inclusive) : null, r = e.startAt ? new ff(e.startAt.position, e.startAt.inclusive) : null;
		return Ff(e.path, e.collectionGroup, t, e.filters, e.limit, n, r);
	}
}
function qf(e, t) {
	let n = e.filters.concat([t]);
	return new zf(e.path, e.collectionGroup, e.explicitOrderBy.slice(), n, e.limit, e.limitType, e.startAt, e.endAt);
}
function Jf(e, t, n) {
	return new zf(e.path, e.collectionGroup, e.explicitOrderBy.slice(), e.filters.slice(), t, n, e.startAt, e.endAt);
}
function Yf(e, t) {
	return Lf(Gf(e), Gf(t)) && e.limitType === t.limitType;
}
function Xf(e) {
	return `${If(Gf(e))}|lt:${e.limitType}`;
}
function Zf(e) {
	return `Query(target=${function(e) {
		let t = e.path.canonicalString();
		return e.collectionGroup !== null && (t += " collectionGroup=" + e.collectionGroup), e.filters.length > 0 && (t += `, filters: [${e.filters.map(((e) => Tf(e))).join(", ")}]`), Cd(e.limit) || (t += ", limit: " + e.limit), e.orderBy.length > 0 && (t += `, orderBy: [${e.orderBy.map(((e) => function(e) {
			return `${e.field.canonicalString()} (${e.dir})`;
		}(e))).join(", ")}]`), e.startAt && (t += ", startAt: ", t += e.startAt.inclusive ? "b:" : "a:", t += e.startAt.position.map(((e) => Qd(e))).join(",")), e.endAt && (t += ", endAt: ", t += e.endAt.inclusive ? "a:" : "b:", t += e.endAt.position.map(((e) => Qd(e))).join(",")), `Target(${t})`;
	}(Gf(e))}; limitType=${e.limitType})`;
}
function Qf(e, t) {
	return t.isFoundDocument() && function(e, t) {
		let n = t.key.path;
		return e.collectionGroup === null ? I.isDocumentKey(e.path) ? e.path.isEqual(n) : e.path.isImmediateParentOf(n) : t.key.hasCollectionId(e.collectionGroup) && e.path.isPrefixOf(n);
	}(e, t) && function(e, t) {
		for (let n of Wf(e)) if (!n.field.isKeyField() && t.data.field(n.field) === null) return !1;
		return !0;
	}(e, t) && function(e, t) {
		for (let n of e.filters) if (!n.matches(t)) return !1;
		return !0;
	}(e, t) && function(e, t) {
		return !(e.startAt && !function(e, t, n) {
			let r = pf(e, t, n);
			return e.inclusive ? r <= 0 : r < 0;
		}(e.startAt, Wf(e), t) || e.endAt && !function(e, t, n) {
			let r = pf(e, t, n);
			return e.inclusive ? r >= 0 : r > 0;
		}(e.endAt, Wf(e), t));
	}(e, t);
}
function $f(e) {
	return e.collectionGroup || (e.path.length % 2 == 1 ? e.path.lastSegment() : e.path.get(e.path.length - 2));
}
function ep(e) {
	return (t, n) => {
		let r = !1;
		for (let i of Wf(e)) {
			let e = tp(i, t, n);
			if (e !== 0) return e;
			r ||= i.field.isKeyField();
		}
		return 0;
	};
}
function tp(e, t, n) {
	let r = e.field.isKeyField() ? I.comparator(t.key, n.key) : function(e, t, n) {
		let r = t.data.field(e), i = n.data.field(e);
		return r !== null && i !== null ? Xd(r, i) : k();
	}(e.field, t, n);
	switch (e.dir) {
		case "asc": return r;
		case "desc": return -1 * r;
		default: return k();
	}
}
var np = class {
	constructor(e, t) {
		this.mapKeyFn = e, this.equalsFn = t, this.inner = {}, this.innerSize = 0;
	}
	get(e) {
		let t = this.mapKeyFn(e), n = this.inner[t];
		if (n !== void 0) {
			for (let [t, r] of n) if (this.equalsFn(t, e)) return r;
		}
	}
	has(e) {
		return this.get(e) !== void 0;
	}
	set(e, t) {
		let n = this.mapKeyFn(e), r = this.inner[n];
		if (r === void 0) return this.inner[n] = [[e, t]], void this.innerSize++;
		for (let n = 0; n < r.length; n++) if (this.equalsFn(r[n][0], e)) return void (r[n] = [e, t]);
		r.push([e, t]), this.innerSize++;
	}
	delete(e) {
		let t = this.mapKeyFn(e), n = this.inner[t];
		if (n === void 0) return !1;
		for (let r = 0; r < n.length; r++) if (this.equalsFn(n[r][0], e)) return n.length === 1 ? delete this.inner[t] : n.splice(r, 1), this.innerSize--, !0;
		return !1;
	}
	forEach(e) {
		Dd(this.inner, ((t, n) => {
			for (let [t, r] of n) e(t, r);
		}));
	}
	isEmpty() {
		return Od(this.inner);
	}
	size() {
		return this.innerSize;
	}
}, rp = new kd(I.comparator);
function ip() {
	return rp;
}
var ap = new kd(I.comparator);
function op(...e) {
	let t = ap;
	for (let n of e) t = t.insert(n.key, n);
	return t;
}
function sp(e) {
	let t = ap;
	return e.forEach(((e, n) => t = t.insert(e, n.overlayedDocument))), t;
}
function cp() {
	return up();
}
function lp() {
	return up();
}
function up() {
	return new np(((e) => e.toString()), ((e, t) => e.isEqual(t)));
}
var dp = new kd(I.comparator), fp = new Md(I.comparator);
function R(...e) {
	let t = fp;
	for (let n of e) t = t.add(n);
	return t;
}
var pp = new Md(P);
function mp() {
	return pp;
}
function hp(e, t) {
	if (e.useProto3Json) {
		if (isNaN(t)) return { doubleValue: "NaN" };
		if (t === 1 / 0) return { doubleValue: "Infinity" };
		if (t === -1 / 0) return { doubleValue: "-Infinity" };
	}
	return { doubleValue: wd(t) ? "-0" : t };
}
function gp(e) {
	return { integerValue: "" + e };
}
function _p(e, t) {
	return Td(t) ? gp(t) : hp(e, t);
}
var vp = class {
	constructor() {
		this._ = void 0;
	}
};
function yp(e, t, n) {
	return e instanceof Sp ? function(e, t) {
		let n = { fields: {
			__type__: { stringValue: "server_timestamp" },
			__local_write_time__: { timestampValue: {
				seconds: e.seconds,
				nanos: e.nanoseconds
			} }
		} };
		return t && Vd(t) && (t = Hd(t)), t && (n.fields.__previous_value__ = t), { mapValue: n };
	}(n, t) : e instanceof Cp ? wp(e, t) : e instanceof Tp ? Ep(e, t) : function(e, t) {
		let n = xp(e, t), r = Op(n) + Op(e.Ie);
		return tf(n) && tf(e.Ie) ? gp(r) : hp(e.serializer, r);
	}(e, t);
}
function bp(e, t, n) {
	return e instanceof Cp ? wp(e, t) : e instanceof Tp ? Ep(e, t) : n;
}
function xp(e, t) {
	return e instanceof Dp ? function(e) {
		return tf(e) || function(e) {
			return !!e && "doubleValue" in e;
		}(e);
	}(t) ? t : { integerValue: 0 } : null;
}
var Sp = class extends vp {}, Cp = class extends vp {
	constructor(e) {
		super(), this.elements = e;
	}
};
function wp(e, t) {
	let n = kp(t);
	for (let t of e.elements) n.some(((e) => Jd(e, t))) || n.push(t);
	return { arrayValue: { values: n } };
}
var Tp = class extends vp {
	constructor(e) {
		super(), this.elements = e;
	}
};
function Ep(e, t) {
	let n = kp(t);
	for (let t of e.elements) n = n.filter(((e) => !Jd(e, t)));
	return { arrayValue: { values: n } };
}
var Dp = class extends vp {
	constructor(e, t) {
		super(), this.serializer = e, this.Ie = t;
	}
};
function Op(e) {
	return zd(e.integerValue || e.doubleValue);
}
function kp(e) {
	return nf(e) && e.arrayValue.values ? e.arrayValue.values.slice() : [];
}
var Ap = class {
	constructor(e, t) {
		this.field = e, this.transform = t;
	}
};
function jp(e, t) {
	return e.field.isEqual(t.field) && function(e, t) {
		return e instanceof Cp && t instanceof Cp || e instanceof Tp && t instanceof Tp ? ed(e.elements, t.elements, Jd) : e instanceof Dp && t instanceof Dp ? Jd(e.Ie, t.Ie) : e instanceof Sp && t instanceof Sp;
	}(e.transform, t.transform);
}
var Mp = class {
	constructor(e, t) {
		this.version = e, this.transformResults = t;
	}
}, Np = class e {
	constructor(e, t) {
		this.updateTime = e, this.exists = t;
	}
	static none() {
		return new e();
	}
	static exists(t) {
		return new e(void 0, t);
	}
	static updateTime(t) {
		return new e(t);
	}
	get isNone() {
		return this.updateTime === void 0 && this.exists === void 0;
	}
	isEqual(e) {
		return this.exists === e.exists && (this.updateTime ? !!e.updateTime && this.updateTime.isEqual(e.updateTime) : !e.updateTime);
	}
};
function Pp(e, t) {
	return e.updateTime === void 0 ? e.exists === void 0 || e.exists === t.isFoundDocument() : t.isFoundDocument() && t.version.isEqual(e.updateTime);
}
var Fp = class {};
function Ip(e, t) {
	if (!e.hasLocalMutations || t && t.fields.length === 0) return null;
	if (t === null) return e.isNoDocument() ? new Kp(e.key, Np.none()) : new Vp(e.key, e.data, Np.none());
	{
		let n = e.data, r = lf.empty(), i = new Md(ad.comparator);
		for (let e of t.fields) if (!i.has(e)) {
			let t = n.field(e);
			t === null && e.length > 1 && (e = e.popLast(), t = n.field(e)), t === null ? r.delete(e) : r.set(e, t), i = i.add(e);
		}
		return new Hp(e.key, r, new Pd(i.toArray()), Np.none());
	}
}
function Lp(e, t, n) {
	e instanceof Vp ? function(e, t, n) {
		let r = e.value.clone(), i = Wp(e.fieldTransforms, t, n.transformResults);
		r.setAll(i), t.convertToFoundDocument(n.version, r).setHasCommittedMutations();
	}(e, t, n) : e instanceof Hp ? function(e, t, n) {
		if (!Pp(e.precondition, t)) return void t.convertToUnknownDocument(n.version);
		let r = Wp(e.fieldTransforms, t, n.transformResults), i = t.data;
		i.setAll(Up(e)), i.setAll(r), t.convertToFoundDocument(n.version, i).setHasCommittedMutations();
	}(e, t, n) : function(e, t, n) {
		t.convertToNoDocument(n.version).setHasCommittedMutations();
	}(0, t, n);
}
function Rp(e, t, n, r) {
	return e instanceof Vp ? function(e, t, n, r) {
		if (!Pp(e.precondition, t)) return n;
		let i = e.value.clone(), a = Gp(e.fieldTransforms, r, t);
		return i.setAll(a), t.convertToFoundDocument(t.version, i).setHasLocalMutations(), null;
	}(e, t, n, r) : e instanceof Hp ? function(e, t, n, r) {
		if (!Pp(e.precondition, t)) return n;
		let i = Gp(e.fieldTransforms, r, t), a = t.data;
		return a.setAll(Up(e)), a.setAll(i), t.convertToFoundDocument(t.version, a).setHasLocalMutations(), n === null ? null : n.unionWith(e.fieldMask.fields).unionWith(e.fieldTransforms.map(((e) => e.field)));
	}(e, t, n, r) : function(e, t, n) {
		return Pp(e.precondition, t) ? (t.convertToNoDocument(t.version).setHasLocalMutations(), null) : n;
	}(e, t, n);
}
function zp(e, t) {
	let n = null;
	for (let r of e.fieldTransforms) {
		let e = t.data.field(r.field), i = xp(r.transform, e || null);
		i != null && (n === null && (n = lf.empty()), n.set(r.field, i));
	}
	return n || null;
}
function Bp(e, t) {
	return e.type === t.type && !!e.key.isEqual(t.key) && !!e.precondition.isEqual(t.precondition) && !!function(e, t) {
		return e === void 0 && t === void 0 || !(!e || !t) && ed(e, t, ((e, t) => jp(e, t)));
	}(e.fieldTransforms, t.fieldTransforms) && (e.type === 0 ? e.value.isEqual(t.value) : e.type !== 1 || e.data.isEqual(t.data) && e.fieldMask.isEqual(t.fieldMask));
}
var Vp = class extends Fp {
	constructor(e, t, n, r = []) {
		super(), this.key = e, this.value = t, this.precondition = n, this.fieldTransforms = r, this.type = 0;
	}
	getFieldMask() {
		return null;
	}
}, Hp = class extends Fp {
	constructor(e, t, n, r, i = []) {
		super(), this.key = e, this.data = t, this.fieldMask = n, this.precondition = r, this.fieldTransforms = i, this.type = 1;
	}
	getFieldMask() {
		return this.fieldMask;
	}
};
function Up(e) {
	let t = /* @__PURE__ */ new Map();
	return e.fieldMask.fields.forEach(((n) => {
		if (!n.isEmpty()) {
			let r = e.data.field(n);
			t.set(n, r);
		}
	})), t;
}
function Wp(e, t, n) {
	let r = /* @__PURE__ */ new Map();
	A(e.length === n.length);
	for (let i = 0; i < n.length; i++) {
		let a = e[i], o = a.transform, s = t.data.field(a.field);
		r.set(a.field, bp(o, s, n[i]));
	}
	return r;
}
function Gp(e, t, n) {
	let r = /* @__PURE__ */ new Map();
	for (let i of e) {
		let e = i.transform, a = n.data.field(i.field);
		r.set(i.field, yp(e, a, t));
	}
	return r;
}
var Kp = class extends Fp {
	constructor(e, t) {
		super(), this.key = e, this.precondition = t, this.type = 2, this.fieldTransforms = [];
	}
	getFieldMask() {
		return null;
	}
}, qp = class extends Fp {
	constructor(e, t) {
		super(), this.key = e, this.precondition = t, this.type = 3, this.fieldTransforms = [];
	}
	getFieldMask() {
		return null;
	}
}, Jp = class {
	constructor(e, t, n, r) {
		this.batchId = e, this.localWriteTime = t, this.baseMutations = n, this.mutations = r;
	}
	applyToRemoteDocument(e, t) {
		let n = t.mutationResults;
		for (let t = 0; t < this.mutations.length; t++) {
			let r = this.mutations[t];
			r.key.isEqual(e.key) && Lp(r, e, n[t]);
		}
	}
	applyToLocalView(e, t) {
		for (let n of this.baseMutations) n.key.isEqual(e.key) && (t = Rp(n, e, t, this.localWriteTime));
		for (let n of this.mutations) n.key.isEqual(e.key) && (t = Rp(n, e, t, this.localWriteTime));
		return t;
	}
	applyToLocalDocumentSet(e, t) {
		let n = lp();
		return this.mutations.forEach(((r) => {
			let i = e.get(r.key), a = i.overlayedDocument, o = this.applyToLocalView(a, i.mutatedFields);
			o = t.has(r.key) ? null : o;
			let s = Ip(a, o);
			s !== null && n.set(r.key, s), a.isValidDocument() || a.convertToNoDocument(F.min());
		})), n;
	}
	keys() {
		return this.mutations.reduce(((e, t) => e.add(t.key)), R());
	}
	isEqual(e) {
		return this.batchId === e.batchId && ed(this.mutations, e.mutations, ((e, t) => Bp(e, t))) && ed(this.baseMutations, e.baseMutations, ((e, t) => Bp(e, t)));
	}
}, Yp = class e {
	constructor(e, t, n, r) {
		this.batch = e, this.commitVersion = t, this.mutationResults = n, this.docVersions = r;
	}
	static from(t, n, r) {
		A(t.mutations.length === r.length);
		let i = function() {
			return dp;
		}(), a = t.mutations;
		for (let e = 0; e < a.length; e++) i = i.insert(a[e].key, r[e].version);
		return new e(t, n, r, i);
	}
}, Xp = class {
	constructor(e, t) {
		this.largestBatchId = e, this.mutation = t;
	}
	getKey() {
		return this.mutation.key;
	}
	isEqual(e) {
		return e !== null && this.mutation === e.mutation;
	}
	toString() {
		return `Overlay{\n      largestBatchId: ${this.largestBatchId},\n      mutation: ${this.mutation.toString()}\n    }`;
	}
}, Zp = class {
	constructor(e, t) {
		this.count = e, this.unchangedNames = t;
	}
}, Qp, z;
function $p(e) {
	switch (e) {
		default: return k();
		case M.CANCELLED:
		case M.UNKNOWN:
		case M.DEADLINE_EXCEEDED:
		case M.RESOURCE_EXHAUSTED:
		case M.INTERNAL:
		case M.UNAVAILABLE:
		case M.UNAUTHENTICATED: return !1;
		case M.INVALID_ARGUMENT:
		case M.NOT_FOUND:
		case M.ALREADY_EXISTS:
		case M.PERMISSION_DENIED:
		case M.FAILED_PRECONDITION:
		case M.ABORTED:
		case M.OUT_OF_RANGE:
		case M.UNIMPLEMENTED:
		case M.DATA_LOSS: return !0;
	}
}
function em(e) {
	if (e === void 0) return Bu("GRPC error has no .code"), M.UNKNOWN;
	switch (e) {
		case Qp.OK: return M.OK;
		case Qp.CANCELLED: return M.CANCELLED;
		case Qp.UNKNOWN: return M.UNKNOWN;
		case Qp.DEADLINE_EXCEEDED: return M.DEADLINE_EXCEEDED;
		case Qp.RESOURCE_EXHAUSTED: return M.RESOURCE_EXHAUSTED;
		case Qp.INTERNAL: return M.INTERNAL;
		case Qp.UNAVAILABLE: return M.UNAVAILABLE;
		case Qp.UNAUTHENTICATED: return M.UNAUTHENTICATED;
		case Qp.INVALID_ARGUMENT: return M.INVALID_ARGUMENT;
		case Qp.NOT_FOUND: return M.NOT_FOUND;
		case Qp.ALREADY_EXISTS: return M.ALREADY_EXISTS;
		case Qp.PERMISSION_DENIED: return M.PERMISSION_DENIED;
		case Qp.FAILED_PRECONDITION: return M.FAILED_PRECONDITION;
		case Qp.ABORTED: return M.ABORTED;
		case Qp.OUT_OF_RANGE: return M.OUT_OF_RANGE;
		case Qp.UNIMPLEMENTED: return M.UNIMPLEMENTED;
		case Qp.DATA_LOSS: return M.DATA_LOSS;
		default: return k();
	}
}
(z = Qp ||= {})[z.OK = 0] = "OK", z[z.CANCELLED = 1] = "CANCELLED", z[z.UNKNOWN = 2] = "UNKNOWN", z[z.INVALID_ARGUMENT = 3] = "INVALID_ARGUMENT", z[z.DEADLINE_EXCEEDED = 4] = "DEADLINE_EXCEEDED", z[z.NOT_FOUND = 5] = "NOT_FOUND", z[z.ALREADY_EXISTS = 6] = "ALREADY_EXISTS", z[z.PERMISSION_DENIED = 7] = "PERMISSION_DENIED", z[z.UNAUTHENTICATED = 16] = "UNAUTHENTICATED", z[z.RESOURCE_EXHAUSTED = 8] = "RESOURCE_EXHAUSTED", z[z.FAILED_PRECONDITION = 9] = "FAILED_PRECONDITION", z[z.ABORTED = 10] = "ABORTED", z[z.OUT_OF_RANGE = 11] = "OUT_OF_RANGE", z[z.UNIMPLEMENTED = 12] = "UNIMPLEMENTED", z[z.INTERNAL = 13] = "INTERNAL", z[z.UNAVAILABLE = 14] = "UNAVAILABLE", z[z.DATA_LOSS = 15] = "DATA_LOSS";
var tm = null;
function nm() {
	return new TextEncoder();
}
var rm = new Pu([4294967295, 4294967295], 0);
function im(e) {
	let t = nm().encode(e), n = new Nu();
	return n.update(t), new Uint8Array(n.digest());
}
function am(e) {
	let t = new DataView(e.buffer), n = t.getUint32(0, !0), r = t.getUint32(4, !0), i = t.getUint32(8, !0), a = t.getUint32(12, !0);
	return [new Pu([n, r], 0), new Pu([i, a], 0)];
}
var om = class e {
	constructor(e, t, n) {
		if (this.bitmap = e, this.padding = t, this.hashCount = n, t < 0 || t >= 8) throw new sm(`Invalid padding: ${t}`);
		if (n < 0 || e.length > 0 && this.hashCount === 0) throw new sm(`Invalid hash count: ${n}`);
		if (e.length === 0 && t !== 0) throw new sm(`Invalid padding when bitmap length is 0: ${t}`);
		this.Te = 8 * e.length - t, this.Ee = Pu.fromNumber(this.Te);
	}
	de(e, t, n) {
		let r = e.add(t.multiply(Pu.fromNumber(n)));
		return r.compare(rm) === 1 && (r = new Pu([r.getBits(0), r.getBits(1)], 0)), r.modulo(this.Ee).toNumber();
	}
	Ae(e) {
		return !!(this.bitmap[Math.floor(e / 8)] & 1 << e % 8);
	}
	mightContain(e) {
		if (this.Te === 0) return !1;
		let [t, n] = am(im(e));
		for (let e = 0; e < this.hashCount; e++) {
			let r = this.de(t, n, e);
			if (!this.Ae(r)) return !1;
		}
		return !0;
	}
	static create(t, n, r) {
		let i = t % 8 == 0 ? 0 : 8 - t % 8, a = new Uint8Array(Math.ceil(t / 8)), o = new e(a, i, n);
		return r.forEach(((e) => o.insert(e))), o;
	}
	insert(e) {
		if (this.Te === 0) return;
		let [t, n] = am(im(e));
		for (let e = 0; e < this.hashCount; e++) {
			let r = this.de(t, n, e);
			this.Re(r);
		}
	}
	Re(e) {
		let t = Math.floor(e / 8), n = e % 8;
		this.bitmap[t] |= 1 << n;
	}
}, sm = class extends Error {
	constructor() {
		super(...arguments), this.name = "BloomFilterError";
	}
}, cm = class e {
	constructor(e, t, n, r, i) {
		this.snapshotVersion = e, this.targetChanges = t, this.targetMismatches = n, this.documentUpdates = r, this.resolvedLimboDocuments = i;
	}
	static createSynthesizedRemoteEventForCurrentChange(t, n, r) {
		let i = /* @__PURE__ */ new Map();
		return i.set(t, lm.createSynthesizedTargetChangeForCurrentChange(t, n, r)), new e(F.min(), i, new kd(P), ip(), R());
	}
}, lm = class e {
	constructor(e, t, n, r, i) {
		this.resumeToken = e, this.current = t, this.addedDocuments = n, this.modifiedDocuments = r, this.removedDocuments = i;
	}
	static createSynthesizedTargetChangeForCurrentChange(t, n, r) {
		return new e(r, n, R(), R(), R());
	}
}, um = class {
	constructor(e, t, n, r) {
		this.Ve = e, this.removedTargetIds = t, this.key = n, this.me = r;
	}
}, dm = class {
	constructor(e, t) {
		this.targetId = e, this.fe = t;
	}
}, fm = class {
	constructor(e, t, n = Id.EMPTY_BYTE_STRING, r = null) {
		this.state = e, this.targetIds = t, this.resumeToken = n, this.cause = r;
	}
}, pm = class {
	constructor() {
		this.ge = 0, this.pe = gm(), this.ye = Id.EMPTY_BYTE_STRING, this.we = !1, this.Se = !0;
	}
	get current() {
		return this.we;
	}
	get resumeToken() {
		return this.ye;
	}
	get be() {
		return this.ge !== 0;
	}
	get De() {
		return this.Se;
	}
	Ce(e) {
		e.approximateByteSize() > 0 && (this.Se = !0, this.ye = e);
	}
	ve() {
		let e = R(), t = R(), n = R();
		return this.pe.forEach(((r, i) => {
			switch (i) {
				case 0:
					e = e.add(r);
					break;
				case 2:
					t = t.add(r);
					break;
				case 1:
					n = n.add(r);
					break;
				default: k();
			}
		})), new lm(this.ye, this.we, e, t, n);
	}
	Fe() {
		this.Se = !1, this.pe = gm();
	}
	Me(e, t) {
		this.Se = !0, this.pe = this.pe.insert(e, t);
	}
	xe(e) {
		this.Se = !0, this.pe = this.pe.remove(e);
	}
	Oe() {
		this.ge += 1;
	}
	Ne() {
		--this.ge, A(this.ge >= 0);
	}
	Le() {
		this.Se = !0, this.we = !0;
	}
}, mm = class {
	constructor(e) {
		this.Be = e, this.ke = /* @__PURE__ */ new Map(), this.qe = ip(), this.Qe = hm(), this.Ke = new kd(P);
	}
	$e(e) {
		for (let t of e.Ve) e.me && e.me.isFoundDocument() ? this.Ue(t, e.me) : this.We(t, e.key, e.me);
		for (let t of e.removedTargetIds) this.We(t, e.key, e.me);
	}
	Ge(e) {
		this.forEachTarget(e, ((t) => {
			let n = this.ze(t);
			switch (e.state) {
				case 0:
					this.je(t) && n.Ce(e.resumeToken);
					break;
				case 1:
					n.Ne(), n.be || n.Fe(), n.Ce(e.resumeToken);
					break;
				case 2:
					n.Ne(), n.be || this.removeTarget(t);
					break;
				case 3:
					this.je(t) && (n.Le(), n.Ce(e.resumeToken));
					break;
				case 4:
					this.je(t) && (this.He(t), n.Ce(e.resumeToken));
					break;
				default: k();
			}
		}));
	}
	forEachTarget(e, t) {
		e.targetIds.length > 0 ? e.targetIds.forEach(t) : this.ke.forEach(((e, n) => {
			this.je(n) && t(n);
		}));
	}
	Je(e) {
		let t = e.targetId, n = e.fe.count, r = this.Ye(t);
		if (r) {
			let i = r.target;
			if (Rf(i)) {
				if (n === 0) {
					let e = new I(i.path);
					this.We(t, e, df.newNoDocument(e, F.min()));
				} else A(n === 1);
			} else {
				let r = this.Ze(t);
				if (r !== n) {
					let n = this.Xe(e), i = n ? this.et(n, e, r) : 1;
					if (i !== 0) {
						this.He(t);
						let e = i === 2 ? "TargetPurposeExistenceFilterMismatchBloom" : "TargetPurposeExistenceFilterMismatch";
						this.Ke = this.Ke.insert(t, e);
					}
					tm?.tt(function(e, t, n, r, i) {
						let a = {
							localCacheCount: e,
							existenceFilterCount: t.count,
							databaseId: n.database,
							projectId: n.projectId
						}, o = t.unchangedNames;
						return o && (a.bloomFilter = {
							applied: i === 0,
							hashCount: o?.hashCount ?? 0,
							bitmapLength: o?.bits?.bitmap?.length ?? 0,
							padding: o?.bits?.padding ?? 0,
							mightContain: (e) => {
								var t;
								return (t = r?.mightContain(e)) != null && t;
							}
						}), a;
					}(r, e.fe, this.Be.nt(), n, i));
				}
			}
		}
	}
	Xe(e) {
		let t = e.fe.unchangedNames;
		if (!t || !t.bits) return null;
		let { bits: { bitmap: n = "", padding: r = 0 }, hashCount: i = 0 } = t, a, o;
		try {
			a = Bd(n).toUint8Array();
		} catch (e) {
			if (e instanceof Fd) return Vu("Decoding the base64 bloom filter in existence filter failed (" + e.message + "); ignoring the bloom filter and falling back to full re-query."), null;
			throw e;
		}
		try {
			o = new om(a, r, i);
		} catch (e) {
			return Vu(e instanceof sm ? "BloomFilter error: " : "Applying bloom filter failed: ", e), null;
		}
		return o.Te === 0 ? null : o;
	}
	et(e, t, n) {
		return t.fe.count === n - this.rt(e, t.targetId) ? 0 : 2;
	}
	rt(e, t) {
		let n = this.Be.getRemoteKeysForTarget(t), r = 0;
		return n.forEach(((n) => {
			let i = this.Be.nt(), a = `projects/${i.projectId}/databases/${i.database}/documents/${n.path.canonicalString()}`;
			e.mightContain(a) || (this.We(t, n, null), r++);
		})), r;
	}
	it(e) {
		let t = /* @__PURE__ */ new Map();
		this.ke.forEach(((n, r) => {
			let i = this.Ye(r);
			if (i) {
				if (n.current && Rf(i.target)) {
					let t = new I(i.target.path);
					this.qe.get(t) !== null || this.st(r, t) || this.We(r, t, df.newNoDocument(t, e));
				}
				n.De && (t.set(r, n.ve()), n.Fe());
			}
		}));
		let n = R();
		this.Qe.forEach(((e, t) => {
			let r = !0;
			t.forEachWhile(((e) => {
				let t = this.Ye(e);
				return !t || t.purpose === "TargetPurposeLimboResolution" || (r = !1, !1);
			})), r && (n = n.add(e));
		})), this.qe.forEach(((t, n) => n.setReadTime(e)));
		let r = new cm(e, t, this.Ke, this.qe, n);
		return this.qe = ip(), this.Qe = hm(), this.Ke = new kd(P), r;
	}
	Ue(e, t) {
		if (!this.je(e)) return;
		let n = this.st(e, t.key) ? 2 : 0;
		this.ze(e).Me(t.key, n), this.qe = this.qe.insert(t.key, t), this.Qe = this.Qe.insert(t.key, this.ot(t.key).add(e));
	}
	We(e, t, n) {
		if (!this.je(e)) return;
		let r = this.ze(e);
		this.st(e, t) ? r.Me(t, 1) : r.xe(t), this.Qe = this.Qe.insert(t, this.ot(t).delete(e)), n && (this.qe = this.qe.insert(t, n));
	}
	removeTarget(e) {
		this.ke.delete(e);
	}
	Ze(e) {
		let t = this.ze(e).ve();
		return this.Be.getRemoteKeysForTarget(e).size + t.addedDocuments.size - t.removedDocuments.size;
	}
	Oe(e) {
		this.ze(e).Oe();
	}
	ze(e) {
		let t = this.ke.get(e);
		return t || (t = new pm(), this.ke.set(e, t)), t;
	}
	ot(e) {
		let t = this.Qe.get(e);
		return t || (t = new Md(P), this.Qe = this.Qe.insert(e, t)), t;
	}
	je(e) {
		let t = this.Ye(e) !== null;
		return t || O("WatchChangeAggregator", "Detected inactive target", e), t;
	}
	Ye(e) {
		let t = this.ke.get(e);
		return t && t.be ? null : this.Be._t(e);
	}
	He(e) {
		this.ke.set(e, new pm()), this.Be.getRemoteKeysForTarget(e).forEach(((t) => {
			this.We(e, t, null);
		}));
	}
	st(e, t) {
		return this.Be.getRemoteKeysForTarget(e).has(t);
	}
};
function hm() {
	return new kd(I.comparator);
}
function gm() {
	return new kd(I.comparator);
}
var _m = {
	asc: "ASCENDING",
	desc: "DESCENDING"
}, vm = {
	"<": "LESS_THAN",
	"<=": "LESS_THAN_OR_EQUAL",
	">": "GREATER_THAN",
	">=": "GREATER_THAN_OR_EQUAL",
	"==": "EQUAL",
	"!=": "NOT_EQUAL",
	"array-contains": "ARRAY_CONTAINS",
	in: "IN",
	"not-in": "NOT_IN",
	"array-contains-any": "ARRAY_CONTAINS_ANY"
}, ym = {
	and: "AND",
	or: "OR"
}, bm = class {
	constructor(e, t) {
		this.databaseId = e, this.useProto3Json = t;
	}
};
function xm(e, t) {
	return e.useProto3Json || Cd(t) ? t : { value: t };
}
function Sm(e, t) {
	return e.useProto3Json ? `${(/* @__PURE__ */ new Date(1e3 * t.seconds)).toISOString().replace(/\.\d*/, "").replace("Z", "")}.${("000000000" + t.nanoseconds).slice(-9)}Z` : {
		seconds: "" + t.seconds,
		nanos: t.nanoseconds
	};
}
function Cm(e, t) {
	return e.useProto3Json ? t.toBase64() : t.toUint8Array();
}
function wm(e, t) {
	return Sm(e, t.toTimestamp());
}
function Tm(e) {
	return A(!!e), F.fromTimestamp(function(e) {
		let t = Rd(e);
		return new td(t.seconds, t.nanos);
	}(e));
}
function Em(e, t) {
	return Dm(e, t).canonicalString();
}
function Dm(e, t) {
	let n = function(e) {
		return new rd([
			"projects",
			e.projectId,
			"databases",
			e.database
		]);
	}(e).child("documents");
	return t === void 0 ? n : n.child(t);
}
function Om(e) {
	let t = rd.fromString(e);
	return A(Zm(t)), t;
}
function km(e, t) {
	return Em(e.databaseId, t.path);
}
function Am(e, t) {
	let n = Om(t);
	if (n.get(1) !== e.databaseId.projectId) throw new N(M.INVALID_ARGUMENT, "Tried to deserialize key from different project: " + n.get(1) + " vs " + e.databaseId.projectId);
	if (n.get(3) !== e.databaseId.database) throw new N(M.INVALID_ARGUMENT, "Tried to deserialize key from different database: " + n.get(3) + " vs " + e.databaseId.database);
	return new I(Pm(n));
}
function jm(e, t) {
	return Em(e.databaseId, t);
}
function Mm(e) {
	let t = Om(e);
	return t.length === 4 ? rd.emptyPath() : Pm(t);
}
function Nm(e) {
	return new rd([
		"projects",
		e.databaseId.projectId,
		"databases",
		e.databaseId.database
	]).canonicalString();
}
function Pm(e) {
	return A(e.length > 4 && e.get(4) === "documents"), e.popFirst(5);
}
function Fm(e, t, n) {
	return {
		name: km(e, t),
		fields: n.value.mapValue.fields
	};
}
function Im(e, t) {
	let n;
	if ("targetChange" in t) {
		t.targetChange;
		let r = function(e) {
			return e === "NO_CHANGE" ? 0 : e === "ADD" ? 1 : e === "REMOVE" ? 2 : e === "CURRENT" ? 3 : e === "RESET" ? 4 : k();
		}(t.targetChange.targetChangeType || "NO_CHANGE"), i = t.targetChange.targetIds || [], a = function(e, t) {
			return e.useProto3Json ? (A(t === void 0 || typeof t == "string"), Id.fromBase64String(t || "")) : (A(t === void 0 || t instanceof Uint8Array), Id.fromUint8Array(t || /* @__PURE__ */ new Uint8Array()));
		}(e, t.targetChange.resumeToken), o = t.targetChange.cause;
		n = new fm(r, i, a, o && function(e) {
			return new N(e.code === void 0 ? M.UNKNOWN : em(e.code), e.message || "");
		}(o) || null);
	} else if ("documentChange" in t) {
		t.documentChange;
		let r = t.documentChange;
		r.document, r.document.name, r.document.updateTime;
		let i = Am(e, r.document.name), a = Tm(r.document.updateTime), o = r.document.createTime ? Tm(r.document.createTime) : F.min(), s = new lf({ mapValue: { fields: r.document.fields } }), c = df.newFoundDocument(i, a, o, s);
		n = new um(r.targetIds || [], r.removedTargetIds || [], c.key, c);
	} else if ("documentDelete" in t) {
		t.documentDelete;
		let r = t.documentDelete;
		r.document;
		let i = Am(e, r.document), a = r.readTime ? Tm(r.readTime) : F.min(), o = df.newNoDocument(i, a);
		n = new um([], r.removedTargetIds || [], o.key, o);
	} else if ("documentRemove" in t) {
		t.documentRemove;
		let r = t.documentRemove;
		r.document;
		let i = Am(e, r.document);
		n = new um([], r.removedTargetIds || [], i, null);
	} else {
		if (!("filter" in t)) return k();
		{
			t.filter;
			let e = t.filter;
			e.targetId;
			let { count: r = 0, unchangedNames: i } = e, a = new Zp(r, i), o = e.targetId;
			n = new dm(o, a);
		}
	}
	return n;
}
function Lm(e, t) {
	let n;
	if (t instanceof Vp) n = { update: Fm(e, t.key, t.value) };
	else if (t instanceof Kp) n = { delete: km(e, t.key) };
	else if (t instanceof Hp) n = {
		update: Fm(e, t.key, t.data),
		updateMask: Xm(t.fieldMask)
	};
	else {
		if (!(t instanceof qp)) return k();
		n = { verify: km(e, t.key) };
	}
	return t.fieldTransforms.length > 0 && (n.updateTransforms = t.fieldTransforms.map(((e) => function(e, t) {
		let n = t.transform;
		if (n instanceof Sp) return {
			fieldPath: t.field.canonicalString(),
			setToServerValue: "REQUEST_TIME"
		};
		if (n instanceof Cp) return {
			fieldPath: t.field.canonicalString(),
			appendMissingElements: { values: n.elements }
		};
		if (n instanceof Tp) return {
			fieldPath: t.field.canonicalString(),
			removeAllFromArray: { values: n.elements }
		};
		if (n instanceof Dp) return {
			fieldPath: t.field.canonicalString(),
			increment: n.Ie
		};
		throw k();
	}(0, e)))), t.precondition.isNone || (n.currentDocument = function(e, t) {
		return t.updateTime === void 0 ? t.exists === void 0 ? k() : { exists: t.exists } : { updateTime: wm(e, t.updateTime) };
	}(e, t.precondition)), n;
}
function Rm(e, t) {
	return e && e.length > 0 ? (A(t !== void 0), e.map(((e) => function(e, t) {
		let n = e.updateTime ? Tm(e.updateTime) : Tm(t);
		return n.isEqual(F.min()) && (n = Tm(t)), new Mp(n, e.transformResults || []);
	}(e, t)))) : [];
}
function zm(e, t) {
	return { documents: [jm(e, t.path)] };
}
function Bm(e, t) {
	let n = { structuredQuery: {} }, r = t.path, i;
	t.collectionGroup === null ? (i = r.popLast(), n.structuredQuery.from = [{ collectionId: r.lastSegment() }]) : (i = r, n.structuredQuery.from = [{
		collectionId: t.collectionGroup,
		allDescendants: !0
	}]), n.parent = jm(e, i);
	let a = function(e) {
		if (e.length !== 0) return Ym(yf.create(e, "and"));
	}(t.filters);
	a && (n.structuredQuery.where = a);
	let o = function(e) {
		if (e.length !== 0) return e.map(((e) => function(e) {
			return {
				field: qm(e.field),
				direction: Wm(e.dir)
			};
		}(e)));
	}(t.orderBy);
	o && (n.structuredQuery.orderBy = o);
	let s = xm(e, t.limit);
	return s !== null && (n.structuredQuery.limit = s), t.startAt && (n.structuredQuery.startAt = function(e) {
		return {
			before: e.inclusive,
			values: e.position
		};
	}(t.startAt)), t.endAt && (n.structuredQuery.endAt = function(e) {
		return {
			before: !e.inclusive,
			values: e.position
		};
	}(t.endAt)), {
		ut: n,
		parent: i
	};
}
function Vm(e) {
	let t = Mm(e.parent), n = e.structuredQuery, r = n.from ? n.from.length : 0, i = null;
	if (r > 0) {
		A(r === 1);
		let e = n.from[0];
		e.allDescendants ? i = e.collectionId : t = t.child(e.collectionId);
	}
	let a = [];
	n.where && (a = function(e) {
		let t = Um(e);
		return t instanceof yf && xf(t) ? t.getFilters() : [t];
	}(n.where));
	let o = [];
	n.orderBy && (o = function(e) {
		return e.map(((e) => function(e) {
			return new hf(Jm(e.field), function(e) {
				switch (e) {
					case "ASCENDING": return "asc";
					case "DESCENDING": return "desc";
					default: return;
				}
			}(e.direction));
		}(e)));
	}(n.orderBy));
	let s = null;
	n.limit && (s = function(e) {
		let t;
		return t = typeof e == "object" ? e.value : e, Cd(t) ? null : t;
	}(n.limit));
	let c = null;
	n.startAt && (c = function(e) {
		let t = !!e.before;
		return new ff(e.values || [], t);
	}(n.startAt));
	let l = null;
	return n.endAt && (l = function(e) {
		let t = !e.before;
		return new ff(e.values || [], t);
	}(n.endAt)), Bf(t, i, o, a, s, "F", c, l);
}
function Hm(e, t) {
	let n = function(e) {
		switch (e) {
			case "TargetPurposeListen": return null;
			case "TargetPurposeExistenceFilterMismatch": return "existence-filter-mismatch";
			case "TargetPurposeExistenceFilterMismatchBloom": return "existence-filter-mismatch-bloom";
			case "TargetPurposeLimboResolution": return "limbo-document";
			default: return k();
		}
	}(t.purpose);
	return n == null ? null : { "goog-listen-tags": n };
}
function Um(e) {
	return e.unaryFilter === void 0 ? e.fieldFilter === void 0 ? e.compositeFilter === void 0 ? k() : function(e) {
		return yf.create(e.compositeFilter.filters.map(((e) => Um(e))), function(e) {
			switch (e) {
				case "AND": return "and";
				case "OR": return "or";
				default: return k();
			}
		}(e.compositeFilter.op));
	}(e) : function(e) {
		return vf.create(Jm(e.fieldFilter.field), function(e) {
			switch (e) {
				case "EQUAL": return "==";
				case "NOT_EQUAL": return "!=";
				case "GREATER_THAN": return ">";
				case "GREATER_THAN_OR_EQUAL": return ">=";
				case "LESS_THAN": return "<";
				case "LESS_THAN_OR_EQUAL": return "<=";
				case "ARRAY_CONTAINS": return "array-contains";
				case "IN": return "in";
				case "NOT_IN": return "not-in";
				case "ARRAY_CONTAINS_ANY": return "array-contains-any";
				default: return k();
			}
		}(e.fieldFilter.op), e.fieldFilter.value);
	}(e) : function(e) {
		switch (e.unaryFilter.op) {
			case "IS_NAN":
				let t = Jm(e.unaryFilter.field);
				return vf.create(t, "==", { doubleValue: NaN });
			case "IS_NULL":
				let n = Jm(e.unaryFilter.field);
				return vf.create(n, "==", { nullValue: "NULL_VALUE" });
			case "IS_NOT_NAN":
				let r = Jm(e.unaryFilter.field);
				return vf.create(r, "!=", { doubleValue: NaN });
			case "IS_NOT_NULL":
				let i = Jm(e.unaryFilter.field);
				return vf.create(i, "!=", { nullValue: "NULL_VALUE" });
			default: return k();
		}
	}(e);
}
function Wm(e) {
	return _m[e];
}
function Gm(e) {
	return vm[e];
}
function Km(e) {
	return ym[e];
}
function qm(e) {
	return { fieldPath: e.canonicalString() };
}
function Jm(e) {
	return ad.fromServerFormat(e.fieldPath);
}
function Ym(e) {
	return e instanceof vf ? function(e) {
		if (e.op === "==") {
			if (af(e.value)) return { unaryFilter: {
				field: qm(e.field),
				op: "IS_NAN"
			} };
			if (rf(e.value)) return { unaryFilter: {
				field: qm(e.field),
				op: "IS_NULL"
			} };
		} else if (e.op === "!=") {
			if (af(e.value)) return { unaryFilter: {
				field: qm(e.field),
				op: "IS_NOT_NAN"
			} };
			if (rf(e.value)) return { unaryFilter: {
				field: qm(e.field),
				op: "IS_NOT_NULL"
			} };
		}
		return { fieldFilter: {
			field: qm(e.field),
			op: Gm(e.op),
			value: e.value
		} };
	}(e) : e instanceof yf ? function(e) {
		let t = e.getFilters().map(((e) => Ym(e)));
		return t.length === 1 ? t[0] : { compositeFilter: {
			op: Km(e.op),
			filters: t
		} };
	}(e) : k();
}
function Xm(e) {
	let t = [];
	return e.fields.forEach(((e) => t.push(e.canonicalString()))), { fieldPaths: t };
}
function Zm(e) {
	return e.length >= 4 && e.get(0) === "projects" && e.get(2) === "databases";
}
var Qm = class e {
	constructor(e, t, n, r, i = F.min(), a = F.min(), o = Id.EMPTY_BYTE_STRING, s = null) {
		this.target = e, this.targetId = t, this.purpose = n, this.sequenceNumber = r, this.snapshotVersion = i, this.lastLimboFreeSnapshotVersion = a, this.resumeToken = o, this.expectedCount = s;
	}
	withSequenceNumber(t) {
		return new e(this.target, this.targetId, this.purpose, t, this.snapshotVersion, this.lastLimboFreeSnapshotVersion, this.resumeToken, this.expectedCount);
	}
	withResumeToken(t, n) {
		return new e(this.target, this.targetId, this.purpose, this.sequenceNumber, n, this.lastLimboFreeSnapshotVersion, t, null);
	}
	withExpectedCount(t) {
		return new e(this.target, this.targetId, this.purpose, this.sequenceNumber, this.snapshotVersion, this.lastLimboFreeSnapshotVersion, this.resumeToken, t);
	}
	withLastLimboFreeSnapshotVersion(t) {
		return new e(this.target, this.targetId, this.purpose, this.sequenceNumber, this.snapshotVersion, t, this.resumeToken, this.expectedCount);
	}
}, $m = class {
	constructor(e) {
		this.ct = e;
	}
};
function eh(e) {
	let t = Vm({
		parent: e.parent,
		structuredQuery: e.structuredQuery
	});
	return e.limitType === "LAST" ? Jf(t, t.limit, "L") : t;
}
var th = class {
	constructor() {}
	Pt(e, t) {
		this.It(e, t), t.Tt();
	}
	It(e, t) {
		if ("nullValue" in e) this.Et(t, 5);
		else if ("booleanValue" in e) this.Et(t, 10), t.dt(+!!e.booleanValue);
		else if ("integerValue" in e) this.Et(t, 15), t.dt(zd(e.integerValue));
		else if ("doubleValue" in e) {
			let n = zd(e.doubleValue);
			isNaN(n) ? this.Et(t, 13) : (this.Et(t, 15), wd(n) ? t.dt(0) : t.dt(n));
		} else if ("timestampValue" in e) {
			let n = e.timestampValue;
			this.Et(t, 20), typeof n == "string" ? t.At(n) : (t.At(`${n.seconds || ""}`), t.dt(n.nanos || 0));
		} else if ("stringValue" in e) this.Rt(e.stringValue, t), this.Vt(t);
		else if ("bytesValue" in e) this.Et(t, 30), t.ft(Bd(e.bytesValue)), this.Vt(t);
		else if ("referenceValue" in e) this.gt(e.referenceValue, t);
		else if ("geoPointValue" in e) {
			let n = e.geoPointValue;
			this.Et(t, 45), t.dt(n.latitude || 0), t.dt(n.longitude || 0);
		} else "mapValue" in e ? cf(e) ? this.Et(t, 2 ** 53 - 1) : (this.yt(e.mapValue, t), this.Vt(t)) : "arrayValue" in e ? (this.wt(e.arrayValue, t), this.Vt(t)) : k();
	}
	Rt(e, t) {
		this.Et(t, 25), this.St(e, t);
	}
	St(e, t) {
		t.At(e);
	}
	yt(e, t) {
		let n = e.fields || {};
		this.Et(t, 55);
		for (let e of Object.keys(n)) this.Rt(e, t), this.It(n[e], t);
	}
	wt(e, t) {
		let n = e.values || [];
		this.Et(t, 50);
		for (let e of n) this.It(e, t);
	}
	gt(e, t) {
		this.Et(t, 37), I.fromName(e).path.forEach(((e) => {
			this.Et(t, 60), this.St(e, t);
		}));
	}
	Et(e, t) {
		e.dt(t);
	}
	Vt(e) {
		e.dt(2);
	}
};
th.bt = new th();
var nh = class {
	constructor() {
		this._n = new rh();
	}
	addToCollectionParentIndex(e, t) {
		return this._n.add(t), L.resolve();
	}
	getCollectionParents(e, t) {
		return L.resolve(this._n.getEntries(t));
	}
	addFieldIndex(e, t) {
		return L.resolve();
	}
	deleteFieldIndex(e, t) {
		return L.resolve();
	}
	deleteAllFieldIndexes(e) {
		return L.resolve();
	}
	createTargetIndexes(e, t) {
		return L.resolve();
	}
	getDocumentsMatchingTarget(e, t) {
		return L.resolve(null);
	}
	getIndexType(e, t) {
		return L.resolve(0);
	}
	getFieldIndexes(e, t) {
		return L.resolve([]);
	}
	getNextCollectionGroupToUpdate(e) {
		return L.resolve(null);
	}
	getMinOffset(e, t) {
		return L.resolve(cd.min());
	}
	getMinOffsetFromCollectionGroup(e, t) {
		return L.resolve(cd.min());
	}
	updateCollectionGroup(e, t, n) {
		return L.resolve();
	}
	updateIndexEntries(e, t) {
		return L.resolve();
	}
}, rh = class {
	constructor() {
		this.index = {};
	}
	add(e) {
		let t = e.lastSegment(), n = e.popLast(), r = this.index[t] || new Md(rd.comparator), i = !r.has(n);
		return this.index[t] = r.add(n), i;
	}
	has(e) {
		let t = e.lastSegment(), n = e.popLast(), r = this.index[t];
		return r && r.has(n);
	}
	getEntries(e) {
		return (this.index[e] || new Md(rd.comparator)).toArray();
	}
}, ih = class e {
	constructor(e, t, n) {
		this.cacheSizeCollectionThreshold = e, this.percentileToCollect = t, this.maximumSequenceNumbersToCollect = n;
	}
	static withCacheSize(t) {
		return new e(t, e.DEFAULT_COLLECTION_PERCENTILE, e.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT);
	}
};
ih.DEFAULT_COLLECTION_PERCENTILE = 10, ih.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT = 1e3, ih.DEFAULT = new ih(41943040, ih.DEFAULT_COLLECTION_PERCENTILE, ih.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT), ih.DISABLED = new ih(-1, 0, 0);
var ah = class e {
	constructor(e) {
		this.On = e;
	}
	next() {
		return this.On += 2, this.On;
	}
	static Nn() {
		return new e(0);
	}
	static Ln() {
		return new e(-1);
	}
}, oh = class {
	constructor() {
		this.changes = new np(((e) => e.toString()), ((e, t) => e.isEqual(t))), this.changesApplied = !1;
	}
	addEntry(e) {
		this.assertNotApplied(), this.changes.set(e.key, e);
	}
	removeEntry(e, t) {
		this.assertNotApplied(), this.changes.set(e, df.newInvalidDocument(e).setReadTime(t));
	}
	getEntry(e, t) {
		this.assertNotApplied();
		let n = this.changes.get(t);
		return n === void 0 ? this.getFromCache(e, t) : L.resolve(n);
	}
	getEntries(e, t) {
		return this.getAllFromCache(e, t);
	}
	apply(e) {
		return this.assertNotApplied(), this.changesApplied = !0, this.applyChanges(e);
	}
	assertNotApplied() {}
}, sh = class {
	constructor(e, t) {
		this.overlayedDocument = e, this.mutatedFields = t;
	}
}, ch = class {
	constructor(e, t, n, r) {
		this.remoteDocumentCache = e, this.mutationQueue = t, this.documentOverlayCache = n, this.indexManager = r;
	}
	getDocument(e, t) {
		let n = null;
		return this.documentOverlayCache.getOverlay(e, t).next(((r) => (n = r, this.remoteDocumentCache.getEntry(e, t)))).next(((e) => (n !== null && Rp(n.mutation, e, Pd.empty(), td.now()), e)));
	}
	getDocuments(e, t) {
		return this.remoteDocumentCache.getEntries(e, t).next(((t) => this.getLocalViewOfDocuments(e, t, R()).next((() => t))));
	}
	getLocalViewOfDocuments(e, t, n = R()) {
		let r = cp();
		return this.populateOverlays(e, r, t).next((() => this.computeViews(e, t, r, n).next(((e) => {
			let t = op();
			return e.forEach(((e, n) => {
				t = t.insert(e, n.overlayedDocument);
			})), t;
		}))));
	}
	getOverlayedDocuments(e, t) {
		let n = cp();
		return this.populateOverlays(e, n, t).next((() => this.computeViews(e, t, n, R())));
	}
	populateOverlays(e, t, n) {
		let r = [];
		return n.forEach(((e) => {
			t.has(e) || r.push(e);
		})), this.documentOverlayCache.getOverlays(e, r).next(((e) => {
			e.forEach(((e, n) => {
				t.set(e, n);
			}));
		}));
	}
	computeViews(e, t, n, r) {
		let i = ip(), a = up(), o = function() {
			return up();
		}();
		return t.forEach(((e, t) => {
			let o = n.get(t.key);
			r.has(t.key) && (o === void 0 || o.mutation instanceof Hp) ? i = i.insert(t.key, t) : o === void 0 ? a.set(t.key, Pd.empty()) : (a.set(t.key, o.mutation.getFieldMask()), Rp(o.mutation, t, o.mutation.getFieldMask(), td.now()));
		})), this.recalculateAndSaveOverlays(e, i).next(((e) => (e.forEach(((e, t) => a.set(e, t))), t.forEach(((e, t) => o.set(e, new sh(t, a.get(e) ?? null)))), o)));
	}
	recalculateAndSaveOverlays(e, t) {
		let n = up(), r = new kd(((e, t) => e - t)), i = R();
		return this.mutationQueue.getAllMutationBatchesAffectingDocumentKeys(e, t).next(((e) => {
			for (let i of e) i.keys().forEach(((e) => {
				let a = t.get(e);
				if (a === null) return;
				let o = n.get(e) || Pd.empty();
				o = i.applyToLocalView(a, o), n.set(e, o);
				let s = (r.get(i.batchId) || R()).add(e);
				r = r.insert(i.batchId, s);
			}));
		})).next((() => {
			let a = [], o = r.getReverseIterator();
			for (; o.hasNext();) {
				let r = o.getNext(), s = r.key, c = r.value, l = lp();
				c.forEach(((e) => {
					if (!i.has(e)) {
						let r = Ip(t.get(e), n.get(e));
						r !== null && l.set(e, r), i = i.add(e);
					}
				})), a.push(this.documentOverlayCache.saveOverlays(e, s, l));
			}
			return L.waitFor(a);
		})).next((() => n));
	}
	recalculateAndSaveOverlaysForDocumentKeys(e, t) {
		return this.remoteDocumentCache.getEntries(e, t).next(((t) => this.recalculateAndSaveOverlays(e, t)));
	}
	getDocumentsMatchingQuery(e, t, n, r) {
		return function(e) {
			return I.isDocumentKey(e.path) && e.collectionGroup === null && e.filters.length === 0;
		}(t) ? this.getDocumentsMatchingDocumentQuery(e, t.path) : Uf(t) ? this.getDocumentsMatchingCollectionGroupQuery(e, t, n, r) : this.getDocumentsMatchingCollectionQuery(e, t, n, r);
	}
	getNextDocuments(e, t, n, r) {
		return this.remoteDocumentCache.getAllFromCollectionGroup(e, t, n, r).next(((i) => {
			let a = r - i.size > 0 ? this.documentOverlayCache.getOverlaysForCollectionGroup(e, t, n.largestBatchId, r - i.size) : L.resolve(cp()), o = -1, s = i;
			return a.next(((t) => L.forEach(t, ((t, n) => (o < n.largestBatchId && (o = n.largestBatchId), i.get(t) ? L.resolve() : this.remoteDocumentCache.getEntry(e, t).next(((e) => {
				s = s.insert(t, e);
			}))))).next((() => this.populateOverlays(e, t, i))).next((() => this.computeViews(e, s, t, R()))).next(((e) => ({
				batchId: o,
				changes: sp(e)
			})))));
		}));
	}
	getDocumentsMatchingDocumentQuery(e, t) {
		return this.getDocument(e, new I(t)).next(((e) => {
			let t = op();
			return e.isFoundDocument() && (t = t.insert(e.key, e)), t;
		}));
	}
	getDocumentsMatchingCollectionGroupQuery(e, t, n, r) {
		let i = t.collectionGroup, a = op();
		return this.indexManager.getCollectionParents(e, i).next(((o) => L.forEach(o, ((o) => {
			let s = function(e, t) {
				return new zf(t, null, e.explicitOrderBy.slice(), e.filters.slice(), e.limit, e.limitType, e.startAt, e.endAt);
			}(t, o.child(i));
			return this.getDocumentsMatchingCollectionQuery(e, s, n, r).next(((e) => {
				e.forEach(((e, t) => {
					a = a.insert(e, t);
				}));
			}));
		})).next((() => a))));
	}
	getDocumentsMatchingCollectionQuery(e, t, n, r) {
		let i;
		return this.documentOverlayCache.getOverlaysForCollection(e, t.path, n.largestBatchId).next(((a) => (i = a, this.remoteDocumentCache.getDocumentsMatchingQuery(e, t, n, i, r)))).next(((e) => {
			i.forEach(((t, n) => {
				let r = n.getKey();
				e.get(r) === null && (e = e.insert(r, df.newInvalidDocument(r)));
			}));
			let n = op();
			return e.forEach(((e, r) => {
				let a = i.get(e);
				a !== void 0 && Rp(a.mutation, r, Pd.empty(), td.now()), Qf(t, r) && (n = n.insert(e, r));
			})), n;
		}));
	}
}, lh = class {
	constructor(e) {
		this.serializer = e, this.cr = /* @__PURE__ */ new Map(), this.lr = /* @__PURE__ */ new Map();
	}
	getBundleMetadata(e, t) {
		return L.resolve(this.cr.get(t));
	}
	saveBundleMetadata(e, t) {
		return this.cr.set(t.id, function(e) {
			return {
				id: e.id,
				version: e.version,
				createTime: Tm(e.createTime)
			};
		}(t)), L.resolve();
	}
	getNamedQuery(e, t) {
		return L.resolve(this.lr.get(t));
	}
	saveNamedQuery(e, t) {
		return this.lr.set(t.name, function(e) {
			return {
				name: e.name,
				query: eh(e.bundledQuery),
				readTime: Tm(e.readTime)
			};
		}(t)), L.resolve();
	}
}, uh = class {
	constructor() {
		this.overlays = new kd(I.comparator), this.hr = /* @__PURE__ */ new Map();
	}
	getOverlay(e, t) {
		return L.resolve(this.overlays.get(t));
	}
	getOverlays(e, t) {
		let n = cp();
		return L.forEach(t, ((t) => this.getOverlay(e, t).next(((e) => {
			e !== null && n.set(t, e);
		})))).next((() => n));
	}
	saveOverlays(e, t, n) {
		return n.forEach(((n, r) => {
			this.ht(e, t, r);
		})), L.resolve();
	}
	removeOverlaysForBatchId(e, t, n) {
		let r = this.hr.get(n);
		return r !== void 0 && (r.forEach(((e) => this.overlays = this.overlays.remove(e))), this.hr.delete(n)), L.resolve();
	}
	getOverlaysForCollection(e, t, n) {
		let r = cp(), i = t.length + 1, a = new I(t.child("")), o = this.overlays.getIteratorFrom(a);
		for (; o.hasNext();) {
			let e = o.getNext().value, a = e.getKey();
			if (!t.isPrefixOf(a.path)) break;
			a.path.length === i && e.largestBatchId > n && r.set(e.getKey(), e);
		}
		return L.resolve(r);
	}
	getOverlaysForCollectionGroup(e, t, n, r) {
		let i = new kd(((e, t) => e - t)), a = this.overlays.getIterator();
		for (; a.hasNext();) {
			let e = a.getNext().value;
			if (e.getKey().getCollectionGroup() === t && e.largestBatchId > n) {
				let t = i.get(e.largestBatchId);
				t === null && (t = cp(), i = i.insert(e.largestBatchId, t)), t.set(e.getKey(), e);
			}
		}
		let o = cp(), s = i.getIterator();
		for (; s.hasNext() && (s.getNext().value.forEach(((e, t) => o.set(e, t))), !(o.size() >= r)););
		return L.resolve(o);
	}
	ht(e, t, n) {
		let r = this.overlays.get(n.key);
		if (r !== null) {
			let e = this.hr.get(r.largestBatchId).delete(n.key);
			this.hr.set(r.largestBatchId, e);
		}
		this.overlays = this.overlays.insert(n.key, new Xp(t, n));
		let i = this.hr.get(t);
		i === void 0 && (i = R(), this.hr.set(t, i)), this.hr.set(t, i.add(n.key));
	}
}, dh = class {
	constructor() {
		this.Pr = new Md(fh.Ir), this.Tr = new Md(fh.Er);
	}
	isEmpty() {
		return this.Pr.isEmpty();
	}
	addReference(e, t) {
		let n = new fh(e, t);
		this.Pr = this.Pr.add(n), this.Tr = this.Tr.add(n);
	}
	dr(e, t) {
		e.forEach(((e) => this.addReference(e, t)));
	}
	removeReference(e, t) {
		this.Ar(new fh(e, t));
	}
	Rr(e, t) {
		e.forEach(((e) => this.removeReference(e, t)));
	}
	Vr(e) {
		let t = new I(new rd([])), n = new fh(t, e), r = new fh(t, e + 1), i = [];
		return this.Tr.forEachInRange([n, r], ((e) => {
			this.Ar(e), i.push(e.key);
		})), i;
	}
	mr() {
		this.Pr.forEach(((e) => this.Ar(e)));
	}
	Ar(e) {
		this.Pr = this.Pr.delete(e), this.Tr = this.Tr.delete(e);
	}
	gr(e) {
		let t = new I(new rd([])), n = new fh(t, e), r = new fh(t, e + 1), i = R();
		return this.Tr.forEachInRange([n, r], ((e) => {
			i = i.add(e.key);
		})), i;
	}
	containsKey(e) {
		let t = new fh(e, 0), n = this.Pr.firstAfterOrEqual(t);
		return n !== null && e.isEqual(n.key);
	}
}, fh = class {
	constructor(e, t) {
		this.key = e, this.pr = t;
	}
	static Ir(e, t) {
		return I.comparator(e.key, t.key) || P(e.pr, t.pr);
	}
	static Er(e, t) {
		return P(e.pr, t.pr) || I.comparator(e.key, t.key);
	}
}, ph = class {
	constructor(e, t) {
		this.indexManager = e, this.referenceDelegate = t, this.mutationQueue = [], this.yr = 1, this.wr = new Md(fh.Ir);
	}
	checkEmpty(e) {
		return L.resolve(this.mutationQueue.length === 0);
	}
	addMutationBatch(e, t, n, r) {
		let i = this.yr;
		this.yr++, this.mutationQueue.length > 0 && this.mutationQueue[this.mutationQueue.length - 1];
		let a = new Jp(i, t, n, r);
		this.mutationQueue.push(a);
		for (let t of r) this.wr = this.wr.add(new fh(t.key, i)), this.indexManager.addToCollectionParentIndex(e, t.key.path.popLast());
		return L.resolve(a);
	}
	lookupMutationBatch(e, t) {
		return L.resolve(this.Sr(t));
	}
	getNextMutationBatchAfterBatchId(e, t) {
		let n = t + 1, r = this.br(n), i = r < 0 ? 0 : r;
		return L.resolve(this.mutationQueue.length > i ? this.mutationQueue[i] : null);
	}
	getHighestUnacknowledgedBatchId() {
		return L.resolve(this.mutationQueue.length === 0 ? -1 : this.yr - 1);
	}
	getAllMutationBatches(e) {
		return L.resolve(this.mutationQueue.slice());
	}
	getAllMutationBatchesAffectingDocumentKey(e, t) {
		let n = new fh(t, 0), r = new fh(t, Infinity), i = [];
		return this.wr.forEachInRange([n, r], ((e) => {
			let t = this.Sr(e.pr);
			i.push(t);
		})), L.resolve(i);
	}
	getAllMutationBatchesAffectingDocumentKeys(e, t) {
		let n = new Md(P);
		return t.forEach(((e) => {
			let t = new fh(e, 0), r = new fh(e, Infinity);
			this.wr.forEachInRange([t, r], ((e) => {
				n = n.add(e.pr);
			}));
		})), L.resolve(this.Dr(n));
	}
	getAllMutationBatchesAffectingQuery(e, t) {
		let n = t.path, r = n.length + 1, i = n;
		I.isDocumentKey(i) || (i = i.child(""));
		let a = new fh(new I(i), 0), o = new Md(P);
		return this.wr.forEachWhile(((e) => {
			let t = e.key.path;
			return !!n.isPrefixOf(t) && (t.length === r && (o = o.add(e.pr)), !0);
		}), a), L.resolve(this.Dr(o));
	}
	Dr(e) {
		let t = [];
		return e.forEach(((e) => {
			let n = this.Sr(e);
			n !== null && t.push(n);
		})), t;
	}
	removeMutationBatch(e, t) {
		A(this.Cr(t.batchId, "removed") === 0), this.mutationQueue.shift();
		let n = this.wr;
		return L.forEach(t.mutations, ((r) => {
			let i = new fh(r.key, t.batchId);
			return n = n.delete(i), this.referenceDelegate.markPotentiallyOrphaned(e, r.key);
		})).next((() => {
			this.wr = n;
		}));
	}
	Mn(e) {}
	containsKey(e, t) {
		let n = new fh(t, 0), r = this.wr.firstAfterOrEqual(n);
		return L.resolve(t.isEqual(r && r.key));
	}
	performConsistencyCheck(e) {
		return this.mutationQueue.length, L.resolve();
	}
	Cr(e, t) {
		return this.br(e);
	}
	br(e) {
		return this.mutationQueue.length === 0 ? 0 : e - this.mutationQueue[0].batchId;
	}
	Sr(e) {
		let t = this.br(e);
		return t < 0 || t >= this.mutationQueue.length ? null : this.mutationQueue[t];
	}
}, mh = class {
	constructor(e) {
		this.vr = e, this.docs = function() {
			return new kd(I.comparator);
		}(), this.size = 0;
	}
	setIndexManager(e) {
		this.indexManager = e;
	}
	addEntry(e, t) {
		let n = t.key, r = this.docs.get(n), i = r ? r.size : 0, a = this.vr(t);
		return this.docs = this.docs.insert(n, {
			document: t.mutableCopy(),
			size: a
		}), this.size += a - i, this.indexManager.addToCollectionParentIndex(e, n.path.popLast());
	}
	removeEntry(e) {
		let t = this.docs.get(e);
		t && (this.docs = this.docs.remove(e), this.size -= t.size);
	}
	getEntry(e, t) {
		let n = this.docs.get(t);
		return L.resolve(n ? n.document.mutableCopy() : df.newInvalidDocument(t));
	}
	getEntries(e, t) {
		let n = ip();
		return t.forEach(((e) => {
			let t = this.docs.get(e);
			n = n.insert(e, t ? t.document.mutableCopy() : df.newInvalidDocument(e));
		})), L.resolve(n);
	}
	getDocumentsMatchingQuery(e, t, n, r) {
		let i = ip(), a = t.path, o = new I(a.child("")), s = this.docs.getIteratorFrom(o);
		for (; s.hasNext();) {
			let { key: e, value: { document: o } } = s.getNext();
			if (!a.isPrefixOf(e.path)) break;
			e.path.length > a.length + 1 || ld(sd(o), n) <= 0 || (r.has(o.key) || Qf(t, o)) && (i = i.insert(o.key, o.mutableCopy()));
		}
		return L.resolve(i);
	}
	getAllFromCollectionGroup(e, t, n, r) {
		k();
	}
	Fr(e, t) {
		return L.forEach(this.docs, ((e) => t(e)));
	}
	newChangeBuffer(e) {
		return new hh(this);
	}
	getSize(e) {
		return L.resolve(this.size);
	}
}, hh = class extends oh {
	constructor(e) {
		super(), this.ar = e;
	}
	applyChanges(e) {
		let t = [];
		return this.changes.forEach(((n, r) => {
			r.isValidDocument() ? t.push(this.ar.addEntry(e, r)) : this.ar.removeEntry(n);
		})), L.waitFor(t);
	}
	getFromCache(e, t) {
		return this.ar.getEntry(e, t);
	}
	getAllFromCache(e, t) {
		return this.ar.getEntries(e, t);
	}
}, gh = class {
	constructor(e) {
		this.persistence = e, this.Mr = new np(((e) => If(e)), Lf), this.lastRemoteSnapshotVersion = F.min(), this.highestTargetId = 0, this.Or = 0, this.Nr = new dh(), this.targetCount = 0, this.Lr = ah.Nn();
	}
	forEachTarget(e, t) {
		return this.Mr.forEach(((e, n) => t(n))), L.resolve();
	}
	getLastRemoteSnapshotVersion(e) {
		return L.resolve(this.lastRemoteSnapshotVersion);
	}
	getHighestSequenceNumber(e) {
		return L.resolve(this.Or);
	}
	allocateTargetId(e) {
		return this.highestTargetId = this.Lr.next(), L.resolve(this.highestTargetId);
	}
	setTargetsMetadata(e, t, n) {
		return n && (this.lastRemoteSnapshotVersion = n), t > this.Or && (this.Or = t), L.resolve();
	}
	qn(e) {
		this.Mr.set(e.target, e);
		let t = e.targetId;
		t > this.highestTargetId && (this.Lr = new ah(t), this.highestTargetId = t), e.sequenceNumber > this.Or && (this.Or = e.sequenceNumber);
	}
	addTargetData(e, t) {
		return this.qn(t), this.targetCount += 1, L.resolve();
	}
	updateTargetData(e, t) {
		return this.qn(t), L.resolve();
	}
	removeTargetData(e, t) {
		return this.Mr.delete(t.target), this.Nr.Vr(t.targetId), --this.targetCount, L.resolve();
	}
	removeTargets(e, t, n) {
		let r = 0, i = [];
		return this.Mr.forEach(((a, o) => {
			o.sequenceNumber <= t && n.get(o.targetId) === null && (this.Mr.delete(a), i.push(this.removeMatchingKeysForTargetId(e, o.targetId)), r++);
		})), L.waitFor(i).next((() => r));
	}
	getTargetCount(e) {
		return L.resolve(this.targetCount);
	}
	getTargetData(e, t) {
		let n = this.Mr.get(t) || null;
		return L.resolve(n);
	}
	addMatchingKeys(e, t, n) {
		return this.Nr.dr(t, n), L.resolve();
	}
	removeMatchingKeys(e, t, n) {
		this.Nr.Rr(t, n);
		let r = this.persistence.referenceDelegate, i = [];
		return r && t.forEach(((t) => {
			i.push(r.markPotentiallyOrphaned(e, t));
		})), L.waitFor(i);
	}
	removeMatchingKeysForTargetId(e, t) {
		return this.Nr.Vr(t), L.resolve();
	}
	getMatchingKeysForTargetId(e, t) {
		let n = this.Nr.gr(t);
		return L.resolve(n);
	}
	containsKey(e, t) {
		return L.resolve(this.Nr.containsKey(t));
	}
}, _h = class {
	constructor(e, t) {
		this.Br = {}, this.overlays = {}, this.kr = new Sd(0), this.qr = !1, this.qr = !0, this.referenceDelegate = e(this), this.Qr = new gh(this), this.indexManager = new nh(), this.remoteDocumentCache = function(e) {
			return new mh(e);
		}(((e) => this.referenceDelegate.Kr(e))), this.serializer = new $m(t), this.$r = new lh(this.serializer);
	}
	start() {
		return Promise.resolve();
	}
	shutdown() {
		return this.qr = !1, Promise.resolve();
	}
	get started() {
		return this.qr;
	}
	setDatabaseDeletedListener() {}
	setNetworkEnabled() {}
	getIndexManager(e) {
		return this.indexManager;
	}
	getDocumentOverlayCache(e) {
		let t = this.overlays[e.toKey()];
		return t || (t = new uh(), this.overlays[e.toKey()] = t), t;
	}
	getMutationQueue(e, t) {
		let n = this.Br[e.toKey()];
		return n || (n = new ph(t, this.referenceDelegate), this.Br[e.toKey()] = n), n;
	}
	getTargetCache() {
		return this.Qr;
	}
	getRemoteDocumentCache() {
		return this.remoteDocumentCache;
	}
	getBundleCache() {
		return this.$r;
	}
	runTransaction(e, t, n) {
		O("MemoryPersistence", "Starting transaction:", e);
		let r = new vh(this.kr.next());
		return this.referenceDelegate.Ur(), n(r).next(((e) => this.referenceDelegate.Wr(r).next((() => e)))).toPromise().then(((e) => (r.raiseOnCommittedEvent(), e)));
	}
	Gr(e, t) {
		return L.or(Object.values(this.Br).map(((n) => () => n.containsKey(e, t))));
	}
}, vh = class extends dd {
	constructor(e) {
		super(), this.currentSequenceNumber = e;
	}
}, yh = class e {
	constructor(e) {
		this.persistence = e, this.zr = new dh(), this.jr = null;
	}
	static Hr(t) {
		return new e(t);
	}
	get Jr() {
		if (this.jr) return this.jr;
		throw k();
	}
	addReference(e, t, n) {
		return this.zr.addReference(n, t), this.Jr.delete(n.toString()), L.resolve();
	}
	removeReference(e, t, n) {
		return this.zr.removeReference(n, t), this.Jr.add(n.toString()), L.resolve();
	}
	markPotentiallyOrphaned(e, t) {
		return this.Jr.add(t.toString()), L.resolve();
	}
	removeTarget(e, t) {
		this.zr.Vr(t.targetId).forEach(((e) => this.Jr.add(e.toString())));
		let n = this.persistence.getTargetCache();
		return n.getMatchingKeysForTargetId(e, t.targetId).next(((e) => {
			e.forEach(((e) => this.Jr.add(e.toString())));
		})).next((() => n.removeTargetData(e, t)));
	}
	Ur() {
		this.jr = /* @__PURE__ */ new Set();
	}
	Wr(e) {
		let t = this.persistence.getRemoteDocumentCache().newChangeBuffer();
		return L.forEach(this.Jr, ((n) => {
			let r = I.fromPath(n);
			return this.Yr(e, r).next(((e) => {
				e || t.removeEntry(r, F.min());
			}));
		})).next((() => (this.jr = null, t.apply(e))));
	}
	updateLimboDocument(e, t) {
		return this.Yr(e, t).next(((e) => {
			e ? this.Jr.delete(t.toString()) : this.Jr.add(t.toString());
		}));
	}
	Kr(e) {
		return 0;
	}
	Yr(e, t) {
		return L.or([
			() => L.resolve(this.zr.containsKey(t)),
			() => this.persistence.getTargetCache().containsKey(e, t),
			() => this.persistence.Gr(e, t)
		]);
	}
}, bh = class e {
	constructor(e, t, n, r) {
		this.targetId = e, this.fromCache = t, this.qi = n, this.Qi = r;
	}
	static Ki(t, n) {
		let r = R(), i = R();
		for (let e of n.docChanges) switch (e.type) {
			case 0:
				r = r.add(e.doc.key);
				break;
			case 1: i = i.add(e.doc.key);
		}
		return new e(t, n.fromCache, r, i);
	}
}, xh = class {
	constructor() {
		this._documentReadCount = 0;
	}
	get documentReadCount() {
		return this._documentReadCount;
	}
	incrementDocumentReadCount(e) {
		this._documentReadCount += e;
	}
}, Sh = class {
	constructor() {
		this.$i = !1, this.Ui = !1, this.Wi = 100, this.Gi = function() {
			return ce() ? 8 : md.v(h()) > 0 ? 6 : 4;
		}();
	}
	initialize(e, t) {
		this.zi = e, this.indexManager = t, this.$i = !0;
	}
	getDocumentsMatchingQuery(e, t, n, r) {
		let i = { result: null };
		return this.ji(e, t).next(((e) => {
			i.result = e;
		})).next((() => {
			if (!i.result) return this.Hi(e, t, r, n).next(((e) => {
				i.result = e;
			}));
		})).next((() => {
			if (i.result) return;
			let n = new xh();
			return this.Ji(e, t, n).next(((r) => {
				if (i.result = r, this.Ui) return this.Yi(e, t, n, r.size);
			}));
		})).next((() => i.result));
	}
	Yi(e, t, n, r) {
		return n.documentReadCount < this.Wi ? (zu() <= v.DEBUG && O("QueryEngine", "SDK will not create cache indexes for query:", Zf(t), "since it only creates cache indexes for collection contains", "more than or equal to", this.Wi, "documents"), L.resolve()) : (zu() <= v.DEBUG && O("QueryEngine", "Query:", Zf(t), "scans", n.documentReadCount, "local documents and returns", r, "documents as results."), n.documentReadCount > this.Gi * r ? (zu() <= v.DEBUG && O("QueryEngine", "The SDK decides to create cache indexes for query:", Zf(t), "as using cache indexes may help improve performance."), this.indexManager.createTargetIndexes(e, Gf(t))) : L.resolve());
	}
	ji(e, t) {
		if (Hf(t)) return L.resolve(null);
		let n = Gf(t);
		return this.indexManager.getIndexType(e, n).next(((r) => r === 0 ? null : (t.limit !== null && r === 1 && (t = Jf(t, null, "F"), n = Gf(t)), this.indexManager.getDocumentsMatchingTarget(e, n).next(((r) => {
			let i = R(...r);
			return this.zi.getDocuments(e, i).next(((r) => this.indexManager.getMinOffset(e, n).next(((n) => {
				let a = this.Zi(t, r);
				return this.Xi(t, a, i, n.readTime) ? this.ji(e, Jf(t, null, "F")) : this.es(e, a, t, n);
			}))));
		})))));
	}
	Hi(e, t, n, r) {
		return Hf(t) || r.isEqual(F.min()) ? L.resolve(null) : this.zi.getDocuments(e, n).next(((i) => {
			let a = this.Zi(t, i);
			return this.Xi(t, a, n, r) ? L.resolve(null) : (zu() <= v.DEBUG && O("QueryEngine", "Re-using previous result from %s to execute query: %s", r.toString(), Zf(t)), this.es(e, a, t, od(r, -1)).next(((e) => e)));
		}));
	}
	Zi(e, t) {
		let n = new Md(ep(e));
		return t.forEach(((t, r) => {
			Qf(e, r) && (n = n.add(r));
		})), n;
	}
	Xi(e, t, n, r) {
		if (e.limit === null) return !1;
		if (n.size !== t.size) return !0;
		let i = e.limitType === "F" ? t.last() : t.first();
		return !!i && (i.hasPendingWrites || i.version.compareTo(r) > 0);
	}
	Ji(e, t, n) {
		return zu() <= v.DEBUG && O("QueryEngine", "Using full collection scan to execute query:", Zf(t)), this.zi.getDocumentsMatchingQuery(e, t, cd.min(), n);
	}
	es(e, t, n, r) {
		return this.zi.getDocumentsMatchingQuery(e, n, r).next(((e) => (t.forEach(((t) => {
			e = e.insert(t.key, t);
		})), e)));
	}
}, Ch = class {
	constructor(e, t, n, r) {
		this.persistence = e, this.ts = t, this.serializer = r, this.ns = new kd(P), this.rs = new np(((e) => If(e)), Lf), this.ss = /* @__PURE__ */ new Map(), this.os = e.getRemoteDocumentCache(), this.Qr = e.getTargetCache(), this.$r = e.getBundleCache(), this._s(n);
	}
	_s(e) {
		this.documentOverlayCache = this.persistence.getDocumentOverlayCache(e), this.indexManager = this.persistence.getIndexManager(e), this.mutationQueue = this.persistence.getMutationQueue(e, this.indexManager), this.localDocuments = new ch(this.os, this.mutationQueue, this.documentOverlayCache, this.indexManager), this.os.setIndexManager(this.indexManager), this.ts.initialize(this.localDocuments, this.indexManager);
	}
	collectGarbage(e) {
		return this.persistence.runTransaction("Collect garbage", "readwrite-primary", ((t) => e.collect(t, this.ns)));
	}
};
function wh(e, t, n, r) {
	return new Ch(e, t, n, r);
}
async function Th(e, t) {
	let n = j(e);
	return await n.persistence.runTransaction("Handle user change", "readonly", ((e) => {
		let r;
		return n.mutationQueue.getAllMutationBatches(e).next(((i) => (r = i, n._s(t), n.mutationQueue.getAllMutationBatches(e)))).next(((t) => {
			let i = [], a = [], o = R();
			for (let e of r) {
				i.push(e.batchId);
				for (let t of e.mutations) o = o.add(t.key);
			}
			for (let e of t) {
				a.push(e.batchId);
				for (let t of e.mutations) o = o.add(t.key);
			}
			return n.localDocuments.getDocuments(e, o).next(((e) => ({
				us: e,
				removedBatchIds: i,
				addedBatchIds: a
			})));
		}));
	}));
}
function Eh(e, t) {
	let n = j(e);
	return n.persistence.runTransaction("Acknowledge batch", "readwrite-primary", ((e) => {
		let r = t.batch.keys(), i = n.os.newChangeBuffer({ trackRemovals: !0 });
		return function(e, t, n, r) {
			let i = n.batch, a = i.keys(), o = L.resolve();
			return a.forEach(((e) => {
				o = o.next((() => r.getEntry(t, e))).next(((t) => {
					let a = n.docVersions.get(e);
					A(a !== null), t.version.compareTo(a) < 0 && (i.applyToRemoteDocument(t, n), t.isValidDocument() && (t.setReadTime(n.commitVersion), r.addEntry(t)));
				}));
			})), o.next((() => e.mutationQueue.removeMutationBatch(t, i)));
		}(n, e, t, i).next((() => i.apply(e))).next((() => n.mutationQueue.performConsistencyCheck(e))).next((() => n.documentOverlayCache.removeOverlaysForBatchId(e, r, t.batch.batchId))).next((() => n.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(e, function(e) {
			let t = R();
			for (let n = 0; n < e.mutationResults.length; ++n) e.mutationResults[n].transformResults.length > 0 && (t = t.add(e.batch.mutations[n].key));
			return t;
		}(t)))).next((() => n.localDocuments.getDocuments(e, r)));
	}));
}
function Dh(e) {
	let t = j(e);
	return t.persistence.runTransaction("Get last remote snapshot version", "readonly", ((e) => t.Qr.getLastRemoteSnapshotVersion(e)));
}
function Oh(e, t) {
	let n = j(e), r = t.snapshotVersion, i = n.ns;
	return n.persistence.runTransaction("Apply remote event", "readwrite-primary", ((e) => {
		let a = n.os.newChangeBuffer({ trackRemovals: !0 });
		i = n.ns;
		let o = [];
		t.targetChanges.forEach(((a, s) => {
			let c = i.get(s);
			if (!c) return;
			o.push(n.Qr.removeMatchingKeys(e, a.removedDocuments, s).next((() => n.Qr.addMatchingKeys(e, a.addedDocuments, s))));
			let l = c.withSequenceNumber(e.currentSequenceNumber);
			t.targetMismatches.get(s) === null ? a.resumeToken.approximateByteSize() > 0 && (l = l.withResumeToken(a.resumeToken, r)) : l = l.withResumeToken(Id.EMPTY_BYTE_STRING, F.min()).withLastLimboFreeSnapshotVersion(F.min()), i = i.insert(s, l), function(e, t, n) {
				return e.resumeToken.approximateByteSize() === 0 || t.snapshotVersion.toMicroseconds() - e.snapshotVersion.toMicroseconds() >= 3e8 || n.addedDocuments.size + n.modifiedDocuments.size + n.removedDocuments.size > 0;
			}(c, l, a) && o.push(n.Qr.updateTargetData(e, l));
		}));
		let s = ip(), c = R();
		if (t.documentUpdates.forEach(((r) => {
			t.resolvedLimboDocuments.has(r) && o.push(n.persistence.referenceDelegate.updateLimboDocument(e, r));
		})), o.push(kh(e, a, t.documentUpdates).next(((e) => {
			s = e.cs, c = e.ls;
		}))), !r.isEqual(F.min())) {
			let t = n.Qr.getLastRemoteSnapshotVersion(e).next(((t) => n.Qr.setTargetsMetadata(e, e.currentSequenceNumber, r)));
			o.push(t);
		}
		return L.waitFor(o).next((() => a.apply(e))).next((() => n.localDocuments.getLocalViewOfDocuments(e, s, c))).next((() => s));
	})).then(((e) => (n.ns = i, e)));
}
function kh(e, t, n) {
	let r = R(), i = R();
	return n.forEach(((e) => r = r.add(e))), t.getEntries(e, r).next(((e) => {
		let r = ip();
		return n.forEach(((n, a) => {
			let o = e.get(n);
			a.isFoundDocument() !== o.isFoundDocument() && (i = i.add(n)), a.isNoDocument() && a.version.isEqual(F.min()) ? (t.removeEntry(n, a.readTime), r = r.insert(n, a)) : !o.isValidDocument() || a.version.compareTo(o.version) > 0 || a.version.compareTo(o.version) === 0 && o.hasPendingWrites ? (t.addEntry(a), r = r.insert(n, a)) : O("LocalStore", "Ignoring outdated watch update for ", n, ". Current version:", o.version, " Watch version:", a.version);
		})), {
			cs: r,
			ls: i
		};
	}));
}
function Ah(e, t) {
	let n = j(e);
	return n.persistence.runTransaction("Get next mutation batch", "readonly", ((e) => (t === void 0 && (t = -1), n.mutationQueue.getNextMutationBatchAfterBatchId(e, t))));
}
function jh(e, t) {
	let n = j(e);
	return n.persistence.runTransaction("Allocate target", "readwrite", ((e) => {
		let r;
		return n.Qr.getTargetData(e, t).next(((i) => i ? (r = i, L.resolve(r)) : n.Qr.allocateTargetId(e).next(((i) => (r = new Qm(t, i, "TargetPurposeListen", e.currentSequenceNumber), n.Qr.addTargetData(e, r).next((() => r)))))));
	})).then(((e) => {
		let r = n.ns.get(e.targetId);
		return (r === null || e.snapshotVersion.compareTo(r.snapshotVersion) > 0) && (n.ns = n.ns.insert(e.targetId, e), n.rs.set(t, e.targetId)), e;
	}));
}
async function Mh(e, t, n) {
	let r = j(e), i = r.ns.get(t), a = n ? "readwrite" : "readwrite-primary";
	try {
		n || await r.persistence.runTransaction("Release target", a, ((e) => r.persistence.referenceDelegate.removeTarget(e, i)));
	} catch (e) {
		if (!_d(e)) throw e;
		O("LocalStore", `Failed to update sequence numbers for target ${t}: ${e}`);
	}
	r.ns = r.ns.remove(t), r.rs.delete(i.target);
}
function Nh(e, t, n) {
	let r = j(e), i = F.min(), a = R();
	return r.persistence.runTransaction("Execute query", "readwrite", ((e) => function(e, t, n) {
		let r = j(e), i = r.rs.get(n);
		return i === void 0 ? r.Qr.getTargetData(t, n) : L.resolve(r.ns.get(i));
	}(r, e, Gf(t)).next(((t) => {
		if (t) return i = t.lastLimboFreeSnapshotVersion, r.Qr.getMatchingKeysForTargetId(e, t.targetId).next(((e) => {
			a = e;
		}));
	})).next((() => r.ts.getDocumentsMatchingQuery(e, t, n ? i : F.min(), n ? a : R()))).next(((e) => (Ph(r, $f(t), e), {
		documents: e,
		hs: a
	})))));
}
function Ph(e, t, n) {
	let r = e.ss.get(t) || F.min();
	n.forEach(((e, t) => {
		t.readTime.compareTo(r) > 0 && (r = t.readTime);
	})), e.ss.set(t, r);
}
var Fh = class {
	constructor() {
		this.activeTargetIds = mp();
	}
	As(e) {
		this.activeTargetIds = this.activeTargetIds.add(e);
	}
	Rs(e) {
		this.activeTargetIds = this.activeTargetIds.delete(e);
	}
	ds() {
		let e = {
			activeTargetIds: this.activeTargetIds.toArray(),
			updateTimeMs: Date.now()
		};
		return JSON.stringify(e);
	}
}, Ih = class {
	constructor() {
		this.no = new Fh(), this.ro = {}, this.onlineStateHandler = null, this.sequenceNumberHandler = null;
	}
	addPendingMutation(e) {}
	updateMutationState(e, t, n) {}
	addLocalQueryTarget(e) {
		return this.no.As(e), this.ro[e] || "not-current";
	}
	updateQueryState(e, t, n) {
		this.ro[e] = t;
	}
	removeLocalQueryTarget(e) {
		this.no.Rs(e);
	}
	isLocalQueryTarget(e) {
		return this.no.activeTargetIds.has(e);
	}
	clearQueryState(e) {
		delete this.ro[e];
	}
	getAllActiveQueryTargets() {
		return this.no.activeTargetIds;
	}
	isActiveQueryTarget(e) {
		return this.no.activeTargetIds.has(e);
	}
	start() {
		return this.no = new Fh(), Promise.resolve();
	}
	handleUserChange(e, t, n) {}
	setOnlineState(e) {}
	shutdown() {}
	writeSequenceNumber(e) {}
	notifyBundleLoaded(e) {}
}, Lh = class {
	io(e) {}
	shutdown() {}
}, Rh = class {
	constructor() {
		this.so = () => this.oo(), this._o = () => this.ao(), this.uo = [], this.co();
	}
	io(e) {
		this.uo.push(e);
	}
	shutdown() {
		window.removeEventListener("online", this.so), window.removeEventListener("offline", this._o);
	}
	co() {
		window.addEventListener("online", this.so), window.addEventListener("offline", this._o);
	}
	oo() {
		O("ConnectivityMonitor", "Network connectivity changed: AVAILABLE");
		for (let e of this.uo) e(0);
	}
	ao() {
		O("ConnectivityMonitor", "Network connectivity changed: UNAVAILABLE");
		for (let e of this.uo) e(1);
	}
	static D() {
		return typeof window < "u" && window.addEventListener !== void 0 && window.removeEventListener !== void 0;
	}
}, zh = null;
function Bh() {
	return zh === null ? zh = function() {
		return 268435456 + Math.round(2147483648 * Math.random());
	}() : zh++, "0x" + zh.toString(16);
}
var Vh = {
	BatchGetDocuments: "batchGet",
	Commit: "commit",
	RunQuery: "runQuery",
	RunAggregationQuery: "runAggregationQuery"
}, Hh = class {
	constructor(e) {
		this.lo = e.lo, this.ho = e.ho;
	}
	Po(e) {
		this.Io = e;
	}
	To(e) {
		this.Eo = e;
	}
	onMessage(e) {
		this.Ao = e;
	}
	close() {
		this.ho();
	}
	send(e) {
		this.lo(e);
	}
	Ro() {
		this.Io();
	}
	Vo(e) {
		this.Eo(e);
	}
	mo(e) {
		this.Ao(e);
	}
}, Uh = "WebChannelConnection", Wh = class extends class {
	constructor(e) {
		this.databaseInfo = e, this.databaseId = e.databaseId;
		let t = e.ssl ? "https" : "http", n = encodeURIComponent(this.databaseId.projectId), r = encodeURIComponent(this.databaseId.database);
		this.fo = t + "://" + e.host, this.po = `projects/${n}/databases/${r}`, this.yo = this.databaseId.database === "(default)" ? `project_id=${n}` : `project_id=${n}&database_id=${r}`;
	}
	get wo() {
		return !1;
	}
	So(e, t, n, r, i) {
		let a = Bh(), o = this.bo(e, t.toUriEncodedString());
		O("RestConnection", `Sending RPC '${e}' ${a}:`, o, n);
		let s = {
			"google-cloud-resource-prefix": this.po,
			"x-goog-request-params": this.yo
		};
		return this.Do(s, r, i), this.Co(e, o, s, n).then(((t) => (O("RestConnection", `Received RPC '${e}' ${a}: `, t), t)), ((t) => {
			throw Vu("RestConnection", `RPC '${e}' ${a} failed with error: `, t, "url: ", o, "request:", n), t;
		}));
	}
	vo(e, t, n, r, i, a) {
		return this.So(e, t, n, r, i);
	}
	Do(e, t, n) {
		e["X-Goog-Api-Client"] = function() {
			return "gl-js/ fire/" + Lu;
		}(), e["Content-Type"] = "text/plain", this.databaseInfo.appId && (e["X-Firebase-GMPID"] = this.databaseInfo.appId), t && t.headers.forEach(((t, n) => e[n] = t)), n && n.headers.forEach(((t, n) => e[n] = t));
	}
	bo(e, t) {
		let n = Vh[e];
		return `${this.fo}/v1/${t}:${n}`;
	}
	terminate() {}
} {
	constructor(e) {
		super(e), this.forceLongPolling = e.forceLongPolling, this.autoDetectLongPolling = e.autoDetectLongPolling, this.useFetchStreams = e.useFetchStreams, this.longPollingOptions = e.longPollingOptions;
	}
	Co(e, t, n, r) {
		let i = Bh();
		return new Promise(((a, o) => {
			let s = new Mu();
			s.setWithCredentials(!0), s.listenOnce(Ou.COMPLETE, (() => {
				try {
					switch (s.getLastErrorCode()) {
						case Du.NO_ERROR:
							let t = s.getResponseJson();
							O(Uh, `XHR for RPC '${e}' ${i} received:`, JSON.stringify(t)), a(t);
							break;
						case Du.TIMEOUT:
							O(Uh, `RPC '${e}' ${i} timed out`), o(new N(M.DEADLINE_EXCEEDED, "Request time out"));
							break;
						case Du.HTTP_ERROR:
							let n = s.getStatus();
							if (O(Uh, `RPC '${e}' ${i} failed with status:`, n, "response text:", s.getResponseText()), n > 0) {
								let e = s.getResponseJson();
								Array.isArray(e) && (e = e[0]);
								let t = e?.error;
								t && t.status && t.message ? o(new N(function(e) {
									let t = e.toLowerCase().replace(/_/g, "-");
									return Object.values(M).indexOf(t) >= 0 ? t : M.UNKNOWN;
								}(t.status), t.message)) : o(new N(M.UNKNOWN, "Server responded with status " + s.getStatus()));
							} else o(new N(M.UNAVAILABLE, "Connection failed."));
							break;
						default: k();
					}
				} finally {
					O(Uh, `RPC '${e}' ${i} completed.`);
				}
			}));
			let c = JSON.stringify(r);
			O(Uh, `RPC '${e}' ${i} sending request:`, r), s.send(t, "POST", c, n, 15);
		}));
	}
	Fo(e, t, n) {
		let r = Bh(), i = [
			this.fo,
			"/",
			"google.firestore.v1.Firestore",
			"/",
			e,
			"/channel"
		], a = Tu(), o = Eu(), s = {
			httpSessionIdParam: "gsessionid",
			initMessageHeaders: {},
			messageUrlParams: { database: `projects/${this.databaseId.projectId}/databases/${this.databaseId.database}` },
			sendRawJson: !0,
			supportsCrossDomainXhr: !0,
			internalChannelParams: { forwardChannelRequestTimeoutMs: 6e5 },
			forceLongPolling: this.forceLongPolling,
			detectBufferingProxy: this.autoDetectLongPolling
		}, c = this.longPollingOptions.timeoutSeconds;
		c !== void 0 && (s.longPollingTimeout = Math.round(1e3 * c)), this.useFetchStreams && (s.useFetchStreams = !0), this.Do(s.initMessageHeaders, t, n), s.encodeInitMessageHeaders = !0;
		let l = i.join("");
		O(Uh, `Creating RPC '${e}' stream ${r}: ${l}`, s);
		let u = a.createWebChannel(l, s), d = !1, f = !1, p = new Hh({
			lo: (t) => {
				f ? O(Uh, `Not sending because RPC '${e}' stream ${r} is closed:`, t) : (d ||= (O(Uh, `Opening RPC '${e}' stream ${r} transport.`), u.open(), !0), O(Uh, `RPC '${e}' stream ${r} sending:`, t), u.send(t));
			},
			ho: () => u.close()
		}), m = (e, t, n) => {
			e.listen(t, ((e) => {
				try {
					n(e);
				} catch (e) {
					setTimeout((() => {
						throw e;
					}), 0);
				}
			}));
		};
		return m(u, ju.EventType.OPEN, (() => {
			f || O(Uh, `RPC '${e}' stream ${r} transport opened.`);
		})), m(u, ju.EventType.CLOSE, (() => {
			f || (f = !0, O(Uh, `RPC '${e}' stream ${r} transport closed`), p.Vo());
		})), m(u, ju.EventType.ERROR, ((t) => {
			f || (f = !0, Vu(Uh, `RPC '${e}' stream ${r} transport errored:`, t), p.Vo(new N(M.UNAVAILABLE, "The operation could not be completed")));
		})), m(u, ju.EventType.MESSAGE, ((t) => {
			if (!f) {
				let n = t.data[0];
				A(!!n);
				let i = n, a = i.error || i[0]?.error;
				if (a) {
					O(Uh, `RPC '${e}' stream ${r} received error:`, a);
					let t = a.status, n = function(e) {
						let t = Qp[e];
						if (t !== void 0) return em(t);
					}(t), i = a.message;
					n === void 0 && (n = M.INTERNAL, i = "Unknown error status: " + t + " with message " + a.message), f = !0, p.Vo(new N(n, i)), u.close();
				} else O(Uh, `RPC '${e}' stream ${r} received:`, n), p.mo(n);
			}
		})), m(o, ku.STAT_EVENT, ((t) => {
			t.stat === Au.PROXY ? O(Uh, `RPC '${e}' stream ${r} detected buffering proxy`) : t.stat === Au.NOPROXY && O(Uh, `RPC '${e}' stream ${r} detected no buffering proxy`);
		})), setTimeout((() => {
			p.Ro();
		}), 0), p;
	}
};
function Gh() {
	return typeof document < "u" ? document : null;
}
function Kh(e) {
	return new bm(e, !0);
}
var qh = class {
	constructor(e, t, n = 1e3, r = 1.5, i = 6e4) {
		this.oi = e, this.timerId = t, this.Mo = n, this.xo = r, this.Oo = i, this.No = 0, this.Lo = null, this.Bo = Date.now(), this.reset();
	}
	reset() {
		this.No = 0;
	}
	ko() {
		this.No = this.Oo;
	}
	qo(e) {
		this.cancel();
		let t = Math.floor(this.No + this.Qo()), n = Math.max(0, Date.now() - this.Bo), r = Math.max(0, t - n);
		r > 0 && O("ExponentialBackoff", `Backing off for ${r} ms (base delay: ${this.No} ms, delay with jitter: ${t} ms, last attempt: ${n} ms ago)`), this.Lo = this.oi.enqueueAfterDelay(this.timerId, r, (() => (this.Bo = Date.now(), e()))), this.No *= this.xo, this.No < this.Mo && (this.No = this.Mo), this.No > this.Oo && (this.No = this.Oo);
	}
	Ko() {
		this.Lo !== null && (this.Lo.skipDelay(), this.Lo = null);
	}
	cancel() {
		this.Lo !== null && (this.Lo.cancel(), this.Lo = null);
	}
	Qo() {
		return (Math.random() - .5) * this.No;
	}
}, Jh = class {
	constructor(e, t, n, r, i, a, o, s) {
		this.oi = e, this.$o = n, this.Uo = r, this.connection = i, this.authCredentialsProvider = a, this.appCheckCredentialsProvider = o, this.listener = s, this.state = 0, this.Wo = 0, this.Go = null, this.zo = null, this.stream = null, this.jo = new qh(e, t);
	}
	Ho() {
		return this.state === 1 || this.state === 5 || this.Jo();
	}
	Jo() {
		return this.state === 2 || this.state === 3;
	}
	start() {
		this.state === 4 ? this.Yo() : this.auth();
	}
	async stop() {
		this.Ho() && await this.close(0);
	}
	Zo() {
		this.state = 0, this.jo.reset();
	}
	Xo() {
		this.Jo() && this.Go === null && (this.Go = this.oi.enqueueAfterDelay(this.$o, 6e4, (() => this.e_())));
	}
	t_(e) {
		this.n_(), this.stream.send(e);
	}
	async e_() {
		if (this.Jo()) return this.close(0);
	}
	n_() {
		this.Go &&= (this.Go.cancel(), null);
	}
	r_() {
		this.zo &&= (this.zo.cancel(), null);
	}
	async close(e, t) {
		this.n_(), this.r_(), this.jo.cancel(), this.Wo++, e === 4 ? t && t.code === M.RESOURCE_EXHAUSTED ? (Bu(t.toString()), Bu("Using maximum backoff delay to prevent overloading the backend."), this.jo.ko()) : t && t.code === M.UNAUTHENTICATED && this.state !== 3 && (this.authCredentialsProvider.invalidateToken(), this.appCheckCredentialsProvider.invalidateToken()) : this.jo.reset(), this.stream !== null && (this.i_(), this.stream.close(), this.stream = null), this.state = e, await this.listener.To(t);
	}
	i_() {}
	auth() {
		this.state = 1;
		let e = this.s_(this.Wo), t = this.Wo;
		Promise.all([this.authCredentialsProvider.getToken(), this.appCheckCredentialsProvider.getToken()]).then((([e, n]) => {
			this.Wo === t && this.o_(e, n);
		}), ((t) => {
			e((() => {
				let e = new N(M.UNKNOWN, "Fetching auth token failed: " + t.message);
				return this.__(e);
			}));
		}));
	}
	o_(e, t) {
		let n = this.s_(this.Wo);
		this.stream = this.a_(e, t), this.stream.Po((() => {
			n((() => (this.state = 2, this.zo = this.oi.enqueueAfterDelay(this.Uo, 1e4, (() => (this.Jo() && (this.state = 3), Promise.resolve()))), this.listener.Po())));
		})), this.stream.To(((e) => {
			n((() => this.__(e)));
		})), this.stream.onMessage(((e) => {
			n((() => this.onMessage(e)));
		}));
	}
	Yo() {
		this.state = 5, this.jo.qo((async () => {
			this.state = 0, this.start();
		}));
	}
	__(e) {
		return O("PersistentStream", `close with error: ${e}`), this.stream = null, this.close(4, e);
	}
	s_(e) {
		return (t) => {
			this.oi.enqueueAndForget((() => this.Wo === e ? t() : (O("PersistentStream", "stream callback skipped by getCloseGuardedDispatcher."), Promise.resolve())));
		};
	}
}, Yh = class extends Jh {
	constructor(e, t, n, r, i, a) {
		super(e, "listen_stream_connection_backoff", "listen_stream_idle", "health_check_timeout", t, n, r, a), this.serializer = i;
	}
	a_(e, t) {
		return this.connection.Fo("Listen", e, t);
	}
	onMessage(e) {
		this.jo.reset();
		let t = Im(this.serializer, e), n = function(e) {
			if (!("targetChange" in e)) return F.min();
			let t = e.targetChange;
			return t.targetIds && t.targetIds.length ? F.min() : t.readTime ? Tm(t.readTime) : F.min();
		}(e);
		return this.listener.u_(t, n);
	}
	c_(e) {
		let t = {};
		t.database = Nm(this.serializer), t.addTarget = function(e, t) {
			let n, r = t.target;
			if (n = Rf(r) ? { documents: zm(e, r) } : { query: Bm(e, r).ut }, n.targetId = t.targetId, t.resumeToken.approximateByteSize() > 0) {
				n.resumeToken = Cm(e, t.resumeToken);
				let r = xm(e, t.expectedCount);
				r !== null && (n.expectedCount = r);
			} else if (t.snapshotVersion.compareTo(F.min()) > 0) {
				n.readTime = Sm(e, t.snapshotVersion.toTimestamp());
				let r = xm(e, t.expectedCount);
				r !== null && (n.expectedCount = r);
			}
			return n;
		}(this.serializer, e);
		let n = Hm(this.serializer, e);
		n && (t.labels = n), this.t_(t);
	}
	l_(e) {
		let t = {};
		t.database = Nm(this.serializer), t.removeTarget = e, this.t_(t);
	}
}, Xh = class extends Jh {
	constructor(e, t, n, r, i, a) {
		super(e, "write_stream_connection_backoff", "write_stream_idle", "health_check_timeout", t, n, r, a), this.serializer = i, this.h_ = !1;
	}
	get P_() {
		return this.h_;
	}
	start() {
		this.h_ = !1, this.lastStreamToken = void 0, super.start();
	}
	i_() {
		this.h_ && this.I_([]);
	}
	a_(e, t) {
		return this.connection.Fo("Write", e, t);
	}
	onMessage(e) {
		if (A(!!e.streamToken), this.lastStreamToken = e.streamToken, this.h_) {
			this.jo.reset();
			let t = Rm(e.writeResults, e.commitTime), n = Tm(e.commitTime);
			return this.listener.T_(n, t);
		}
		return A(!e.writeResults || e.writeResults.length === 0), this.h_ = !0, this.listener.E_();
	}
	d_() {
		let e = {};
		e.database = Nm(this.serializer), this.t_(e);
	}
	I_(e) {
		let t = {
			streamToken: this.lastStreamToken,
			writes: e.map(((e) => Lm(this.serializer, e)))
		};
		this.t_(t);
	}
}, Zh = class extends class {} {
	constructor(e, t, n, r) {
		super(), this.authCredentials = e, this.appCheckCredentials = t, this.connection = n, this.serializer = r, this.A_ = !1;
	}
	R_() {
		if (this.A_) throw new N(M.FAILED_PRECONDITION, "The client has already been terminated.");
	}
	So(e, t, n, r) {
		return this.R_(), Promise.all([this.authCredentials.getToken(), this.appCheckCredentials.getToken()]).then((([i, a]) => this.connection.So(e, Dm(t, n), r, i, a))).catch(((e) => {
			throw e.name === "FirebaseError" ? (e.code === M.UNAUTHENTICATED && (this.authCredentials.invalidateToken(), this.appCheckCredentials.invalidateToken()), e) : new N(M.UNKNOWN, e.toString());
		}));
	}
	vo(e, t, n, r, i) {
		return this.R_(), Promise.all([this.authCredentials.getToken(), this.appCheckCredentials.getToken()]).then((([a, o]) => this.connection.vo(e, Dm(t, n), r, a, o, i))).catch(((e) => {
			throw e.name === "FirebaseError" ? (e.code === M.UNAUTHENTICATED && (this.authCredentials.invalidateToken(), this.appCheckCredentials.invalidateToken()), e) : new N(M.UNKNOWN, e.toString());
		}));
	}
	terminate() {
		this.A_ = !0, this.connection.terminate();
	}
}, Qh = class {
	constructor(e, t) {
		this.asyncQueue = e, this.onlineStateHandler = t, this.state = "Unknown", this.m_ = 0, this.f_ = null, this.g_ = !0;
	}
	p_() {
		this.m_ === 0 && (this.y_("Unknown"), this.f_ = this.asyncQueue.enqueueAfterDelay("online_state_timeout", 1e4, (() => (this.f_ = null, this.w_("Backend didn't respond within 10 seconds."), this.y_("Offline"), Promise.resolve()))));
	}
	S_(e) {
		this.state === "Online" ? this.y_("Unknown") : (this.m_++, this.m_ >= 1 && (this.b_(), this.w_(`Connection failed 1 times. Most recent error: ${e.toString()}`), this.y_("Offline")));
	}
	set(e) {
		this.b_(), this.m_ = 0, e === "Online" && (this.g_ = !1), this.y_(e);
	}
	y_(e) {
		e !== this.state && (this.state = e, this.onlineStateHandler(e));
	}
	w_(e) {
		let t = `Could not reach Cloud Firestore backend. ${e}\nThis typically indicates that your device does not have a healthy Internet connection at the moment. The client will operate in offline mode until it is able to successfully connect to the backend.`;
		this.g_ ? (Bu(t), this.g_ = !1) : O("OnlineStateTracker", t);
	}
	b_() {
		this.f_ !== null && (this.f_.cancel(), this.f_ = null);
	}
}, $h = class {
	constructor(e, t, n, r, i) {
		this.localStore = e, this.datastore = t, this.asyncQueue = n, this.remoteSyncer = {}, this.D_ = [], this.C_ = /* @__PURE__ */ new Map(), this.v_ = /* @__PURE__ */ new Set(), this.F_ = [], this.M_ = i, this.M_.io(((e) => {
			n.enqueueAndForget((async () => {
				cg(this) && (O("RemoteStore", "Restarting streams for network reachability change."), await async function(e) {
					let t = j(e);
					t.v_.add(4), await tg(t), t.x_.set("Unknown"), t.v_.delete(4), await eg(t);
				}(this));
			}));
		})), this.x_ = new Qh(n, r);
	}
};
async function eg(e) {
	if (cg(e)) for (let t of e.F_) await t(!0);
}
async function tg(e) {
	for (let t of e.F_) await t(!1);
}
function ng(e, t) {
	let n = j(e);
	n.C_.has(t.targetId) || (n.C_.set(t.targetId, t), sg(n) ? og(n) : Eg(n).Jo() && ig(n, t));
}
function rg(e, t) {
	let n = j(e), r = Eg(n);
	n.C_.delete(t), r.Jo() && ag(n, t), n.C_.size === 0 && (r.Jo() ? r.Xo() : cg(n) && n.x_.set("Unknown"));
}
function ig(e, t) {
	if (e.O_.Oe(t.targetId), t.resumeToken.approximateByteSize() > 0 || t.snapshotVersion.compareTo(F.min()) > 0) {
		let n = e.remoteSyncer.getRemoteKeysForTarget(t.targetId).size;
		t = t.withExpectedCount(n);
	}
	Eg(e).c_(t);
}
function ag(e, t) {
	e.O_.Oe(t), Eg(e).l_(t);
}
function og(e) {
	e.O_ = new mm({
		getRemoteKeysForTarget: (t) => e.remoteSyncer.getRemoteKeysForTarget(t),
		_t: (t) => e.C_.get(t) || null,
		nt: () => e.datastore.serializer.databaseId
	}), Eg(e).start(), e.x_.p_();
}
function sg(e) {
	return cg(e) && !Eg(e).Ho() && e.C_.size > 0;
}
function cg(e) {
	return j(e).v_.size === 0;
}
function lg(e) {
	e.O_ = void 0;
}
async function ug(e) {
	e.C_.forEach(((t, n) => {
		ig(e, t);
	}));
}
async function dg(e, t) {
	lg(e), sg(e) ? (e.x_.S_(t), og(e)) : e.x_.set("Unknown");
}
async function fg(e, t, n) {
	if (e.x_.set("Online"), t instanceof fm && t.state === 2 && t.cause) try {
		await async function(e, t) {
			let n = t.cause;
			for (let r of t.targetIds) e.C_.has(r) && (await e.remoteSyncer.rejectListen(r, n), e.C_.delete(r), e.O_.removeTarget(r));
		}(e, t);
	} catch (n) {
		O("RemoteStore", "Failed to remove targets %s: %s ", t.targetIds.join(","), n), await pg(e, n);
	}
	else if (t instanceof um ? e.O_.$e(t) : t instanceof dm ? e.O_.Je(t) : e.O_.Ge(t), !n.isEqual(F.min())) try {
		let t = await Dh(e.localStore);
		n.compareTo(t) >= 0 && await function(e, t) {
			let n = e.O_.it(t);
			return n.targetChanges.forEach(((n, r) => {
				if (n.resumeToken.approximateByteSize() > 0) {
					let i = e.C_.get(r);
					i && e.C_.set(r, i.withResumeToken(n.resumeToken, t));
				}
			})), n.targetMismatches.forEach(((t, n) => {
				let r = e.C_.get(t);
				r && (e.C_.set(t, r.withResumeToken(Id.EMPTY_BYTE_STRING, r.snapshotVersion)), ag(e, t), ig(e, new Qm(r.target, t, n, r.sequenceNumber)));
			})), e.remoteSyncer.applyRemoteEvent(n);
		}(e, n);
	} catch (t) {
		O("RemoteStore", "Failed to raise snapshot:", t), await pg(e, t);
	}
}
async function pg(e, t, n) {
	if (!_d(t)) throw t;
	e.v_.add(1), await tg(e), e.x_.set("Offline"), n ||= () => Dh(e.localStore), e.asyncQueue.enqueueRetryable((async () => {
		O("RemoteStore", "Retrying IndexedDB access"), await n(), e.v_.delete(1), await eg(e);
	}));
}
function mg(e, t) {
	return t().catch(((n) => pg(e, n, t)));
}
async function hg(e) {
	let t = j(e), n = Dg(t), r = t.D_.length > 0 ? t.D_[t.D_.length - 1].batchId : -1;
	for (; gg(t);) try {
		let e = await Ah(t.localStore, r);
		if (e === null) {
			t.D_.length === 0 && n.Xo();
			break;
		}
		r = e.batchId, _g(t, e);
	} catch (e) {
		await pg(t, e);
	}
	vg(t) && yg(t);
}
function gg(e) {
	return cg(e) && e.D_.length < 10;
}
function _g(e, t) {
	e.D_.push(t);
	let n = Dg(e);
	n.Jo() && n.P_ && n.I_(t.mutations);
}
function vg(e) {
	return cg(e) && !Dg(e).Ho() && e.D_.length > 0;
}
function yg(e) {
	Dg(e).start();
}
async function bg(e) {
	Dg(e).d_();
}
async function xg(e) {
	let t = Dg(e);
	for (let n of e.D_) t.I_(n.mutations);
}
async function Sg(e, t, n) {
	let r = e.D_.shift(), i = Yp.from(r, t, n);
	await mg(e, (() => e.remoteSyncer.applySuccessfulWrite(i))), await hg(e);
}
async function Cg(e, t) {
	t && Dg(e).P_ && await async function(e, t) {
		if (function(e) {
			return $p(e) && e !== M.ABORTED;
		}(t.code)) {
			let n = e.D_.shift();
			Dg(e).Zo(), await mg(e, (() => e.remoteSyncer.rejectFailedWrite(n.batchId, t))), await hg(e);
		}
	}(e, t), vg(e) && yg(e);
}
async function wg(e, t) {
	let n = j(e);
	n.asyncQueue.verifyOperationInProgress(), O("RemoteStore", "RemoteStore received new credentials");
	let r = cg(n);
	n.v_.add(3), await tg(n), r && n.x_.set("Unknown"), await n.remoteSyncer.handleCredentialChange(t), n.v_.delete(3), await eg(n);
}
async function Tg(e, t) {
	let n = j(e);
	t ? (n.v_.delete(2), await eg(n)) : t || (n.v_.add(2), await tg(n), n.x_.set("Unknown"));
}
function Eg(e) {
	return e.N_ || (e.N_ = function(e, t, n) {
		let r = j(e);
		return r.R_(), new Yh(t, r.connection, r.authCredentials, r.appCheckCredentials, r.serializer, n);
	}(e.datastore, e.asyncQueue, {
		Po: ug.bind(null, e),
		To: dg.bind(null, e),
		u_: fg.bind(null, e)
	}), e.F_.push((async (t) => {
		t ? (e.N_.Zo(), sg(e) ? og(e) : e.x_.set("Unknown")) : (await e.N_.stop(), lg(e));
	}))), e.N_;
}
function Dg(e) {
	return e.L_ || (e.L_ = function(e, t, n) {
		let r = j(e);
		return r.R_(), new Xh(t, r.connection, r.authCredentials, r.appCheckCredentials, r.serializer, n);
	}(e.datastore, e.asyncQueue, {
		Po: bg.bind(null, e),
		To: Cg.bind(null, e),
		E_: xg.bind(null, e),
		T_: Sg.bind(null, e)
	}), e.F_.push((async (t) => {
		t ? (e.L_.Zo(), await hg(e)) : (await e.L_.stop(), e.D_.length > 0 && (O("RemoteStore", `Stopping write stream with ${e.D_.length} pending writes`), e.D_ = []));
	}))), e.L_;
}
var Og = class e {
	constructor(e, t, n, r, i) {
		this.asyncQueue = e, this.timerId = t, this.targetTimeMs = n, this.op = r, this.removalCallback = i, this.deferred = new Uu(), this.then = this.deferred.promise.then.bind(this.deferred.promise), this.deferred.promise.catch(((e) => {}));
	}
	get promise() {
		return this.deferred.promise;
	}
	static createAndSchedule(t, n, r, i, a) {
		let o = Date.now() + r, s = new e(t, n, o, i, a);
		return s.start(r), s;
	}
	start(e) {
		this.timerHandle = setTimeout((() => this.handleDelayElapsed()), e);
	}
	skipDelay() {
		return this.handleDelayElapsed();
	}
	cancel(e) {
		this.timerHandle !== null && (this.clearTimeout(), this.deferred.reject(new N(M.CANCELLED, "Operation cancelled" + (e ? ": " + e : ""))));
	}
	handleDelayElapsed() {
		this.asyncQueue.enqueueAndForget((() => this.timerHandle === null ? Promise.resolve() : (this.clearTimeout(), this.op().then(((e) => this.deferred.resolve(e))))));
	}
	clearTimeout() {
		this.timerHandle !== null && (this.removalCallback(this), clearTimeout(this.timerHandle), this.timerHandle = null);
	}
};
function kg(e, t) {
	if (Bu("AsyncQueue", `${t}: ${e}`), _d(e)) return new N(M.UNAVAILABLE, `${t}: ${e}`);
	throw e;
}
var Ag = class e {
	constructor(e) {
		this.comparator = e ? (t, n) => e(t, n) || I.comparator(t.key, n.key) : (e, t) => I.comparator(e.key, t.key), this.keyedMap = op(), this.sortedSet = new kd(this.comparator);
	}
	static emptySet(t) {
		return new e(t.comparator);
	}
	has(e) {
		return this.keyedMap.get(e) != null;
	}
	get(e) {
		return this.keyedMap.get(e);
	}
	first() {
		return this.sortedSet.minKey();
	}
	last() {
		return this.sortedSet.maxKey();
	}
	isEmpty() {
		return this.sortedSet.isEmpty();
	}
	indexOf(e) {
		let t = this.keyedMap.get(e);
		return t ? this.sortedSet.indexOf(t) : -1;
	}
	get size() {
		return this.sortedSet.size;
	}
	forEach(e) {
		this.sortedSet.inorderTraversal(((t, n) => (e(t), !1)));
	}
	add(e) {
		let t = this.delete(e.key);
		return t.copy(t.keyedMap.insert(e.key, e), t.sortedSet.insert(e, null));
	}
	delete(e) {
		let t = this.get(e);
		return t ? this.copy(this.keyedMap.remove(e), this.sortedSet.remove(t)) : this;
	}
	isEqual(t) {
		if (!(t instanceof e) || this.size !== t.size) return !1;
		let n = this.sortedSet.getIterator(), r = t.sortedSet.getIterator();
		for (; n.hasNext();) {
			let e = n.getNext().key, t = r.getNext().key;
			if (!e.isEqual(t)) return !1;
		}
		return !0;
	}
	toString() {
		let e = [];
		return this.forEach(((t) => {
			e.push(t.toString());
		})), e.length === 0 ? "DocumentSet ()" : "DocumentSet (\n  " + e.join("  \n") + "\n)";
	}
	copy(t, n) {
		let r = new e();
		return r.comparator = this.comparator, r.keyedMap = t, r.sortedSet = n, r;
	}
}, jg = class {
	constructor() {
		this.B_ = new kd(I.comparator);
	}
	track(e) {
		let t = e.doc.key, n = this.B_.get(t);
		n ? e.type !== 0 && n.type === 3 ? this.B_ = this.B_.insert(t, e) : e.type === 3 && n.type !== 1 ? this.B_ = this.B_.insert(t, {
			type: n.type,
			doc: e.doc
		}) : e.type === 2 && n.type === 2 ? this.B_ = this.B_.insert(t, {
			type: 2,
			doc: e.doc
		}) : e.type === 2 && n.type === 0 ? this.B_ = this.B_.insert(t, {
			type: 0,
			doc: e.doc
		}) : e.type === 1 && n.type === 0 ? this.B_ = this.B_.remove(t) : e.type === 1 && n.type === 2 ? this.B_ = this.B_.insert(t, {
			type: 1,
			doc: n.doc
		}) : e.type === 0 && n.type === 1 ? this.B_ = this.B_.insert(t, {
			type: 2,
			doc: e.doc
		}) : k() : this.B_ = this.B_.insert(t, e);
	}
	k_() {
		let e = [];
		return this.B_.inorderTraversal(((t, n) => {
			e.push(n);
		})), e;
	}
}, Mg = class e {
	constructor(e, t, n, r, i, a, o, s, c) {
		this.query = e, this.docs = t, this.oldDocs = n, this.docChanges = r, this.mutatedKeys = i, this.fromCache = a, this.syncStateChanged = o, this.excludesMetadataChanges = s, this.hasCachedResults = c;
	}
	static fromInitialDocuments(t, n, r, i, a) {
		let o = [];
		return n.forEach(((e) => {
			o.push({
				type: 0,
				doc: e
			});
		})), new e(t, n, Ag.emptySet(n), o, r, i, !0, !1, a);
	}
	get hasPendingWrites() {
		return !this.mutatedKeys.isEmpty();
	}
	isEqual(e) {
		if (!(this.fromCache === e.fromCache && this.hasCachedResults === e.hasCachedResults && this.syncStateChanged === e.syncStateChanged && this.mutatedKeys.isEqual(e.mutatedKeys) && Yf(this.query, e.query) && this.docs.isEqual(e.docs) && this.oldDocs.isEqual(e.oldDocs))) return !1;
		let t = this.docChanges, n = e.docChanges;
		if (t.length !== n.length) return !1;
		for (let e = 0; e < t.length; e++) if (t[e].type !== n[e].type || !t[e].doc.isEqual(n[e].doc)) return !1;
		return !0;
	}
}, Ng = class {
	constructor() {
		this.q_ = void 0, this.Q_ = [];
	}
	K_() {
		return this.Q_.some(((e) => e.U_()));
	}
}, Pg = class {
	constructor() {
		this.queries = new np(((e) => Xf(e)), Yf), this.onlineState = "Unknown", this.W_ = /* @__PURE__ */ new Set();
	}
};
async function Fg(e, t) {
	let n = j(e), r = 3, i = t.query, a = n.queries.get(i);
	a ? !a.K_() && t.U_() && (r = 2) : (a = new Ng(), r = +!t.U_());
	try {
		switch (r) {
			case 0:
				a.q_ = await n.onListen(i, !0);
				break;
			case 1:
				a.q_ = await n.onListen(i, !1);
				break;
			case 2: await n.onFirstRemoteStoreListen(i);
		}
	} catch (e) {
		let n = kg(e, `Initialization of query '${Zf(t.query)}' failed`);
		t.onError(n);
		return;
	}
	n.queries.set(i, a), a.Q_.push(t), t.G_(n.onlineState), a.q_ && t.z_(a.q_) && zg(n);
}
async function Ig(e, t) {
	let n = j(e), r = t.query, i = 3, a = n.queries.get(r);
	if (a) {
		let e = a.Q_.indexOf(t);
		e >= 0 && (a.Q_.splice(e, 1), a.Q_.length === 0 ? i = +!t.U_() : !a.K_() && t.U_() && (i = 2));
	}
	switch (i) {
		case 0: return n.queries.delete(r), n.onUnlisten(r, !0);
		case 1: return n.queries.delete(r), n.onUnlisten(r, !1);
		case 2: return n.onLastRemoteStoreUnlisten(r);
		default: return;
	}
}
function Lg(e, t) {
	let n = j(e), r = !1;
	for (let e of t) {
		let t = e.query, i = n.queries.get(t);
		if (i) {
			for (let t of i.Q_) t.z_(e) && (r = !0);
			i.q_ = e;
		}
	}
	r && zg(n);
}
function Rg(e, t, n) {
	let r = j(e), i = r.queries.get(t);
	if (i) for (let e of i.Q_) e.onError(n);
	r.queries.delete(t);
}
function zg(e) {
	e.W_.forEach(((e) => {
		e.next();
	}));
}
var Bg, Vg;
(Vg = Bg ||= {}).j_ = "default", Vg.Cache = "cache";
var Hg = class {
	constructor(e, t, n) {
		this.query = e, this.H_ = t, this.J_ = !1, this.Y_ = null, this.onlineState = "Unknown", this.options = n || {};
	}
	z_(e) {
		if (!this.options.includeMetadataChanges) {
			let t = [];
			for (let n of e.docChanges) n.type !== 3 && t.push(n);
			e = new Mg(e.query, e.docs, e.oldDocs, t, e.mutatedKeys, e.fromCache, e.syncStateChanged, !0, e.hasCachedResults);
		}
		let t = !1;
		return this.J_ ? this.Z_(e) && (this.H_.next(e), t = !0) : this.X_(e, this.onlineState) && (this.ea(e), t = !0), this.Y_ = e, t;
	}
	onError(e) {
		this.H_.error(e);
	}
	G_(e) {
		this.onlineState = e;
		let t = !1;
		return this.Y_ && !this.J_ && this.X_(this.Y_, e) && (this.ea(this.Y_), t = !0), t;
	}
	X_(e, t) {
		if (!e.fromCache || !this.U_()) return !0;
		let n = t !== "Offline";
		return (!this.options.ta || !n) && (!e.docs.isEmpty() || e.hasCachedResults || t === "Offline");
	}
	Z_(e) {
		if (e.docChanges.length > 0) return !0;
		let t = this.Y_ && this.Y_.hasPendingWrites !== e.hasPendingWrites;
		return !(!e.syncStateChanged && !t) && !0 === this.options.includeMetadataChanges;
	}
	ea(e) {
		e = Mg.fromInitialDocuments(e.query, e.docs, e.mutatedKeys, e.fromCache, e.hasCachedResults), this.J_ = !0, this.H_.next(e);
	}
	U_() {
		return this.options.source !== Bg.Cache;
	}
}, Ug = class {
	constructor(e) {
		this.key = e;
	}
}, Wg = class {
	constructor(e) {
		this.key = e;
	}
}, Gg = class {
	constructor(e, t) {
		this.query = e, this.ua = t, this.ca = null, this.hasCachedResults = !1, this.current = !1, this.la = R(), this.mutatedKeys = R(), this.ha = ep(e), this.Pa = new Ag(this.ha);
	}
	get Ia() {
		return this.ua;
	}
	Ta(e, t) {
		let n = t ? t.Ea : new jg(), r = t ? t.Pa : this.Pa, i = t ? t.mutatedKeys : this.mutatedKeys, a = r, o = !1, s = this.query.limitType === "F" && r.size === this.query.limit ? r.last() : null, c = this.query.limitType === "L" && r.size === this.query.limit ? r.first() : null;
		if (e.inorderTraversal(((e, t) => {
			let l = r.get(e), u = Qf(this.query, t) ? t : null, d = !!l && this.mutatedKeys.has(l.key), f = !!u && (u.hasLocalMutations || this.mutatedKeys.has(u.key) && u.hasCommittedMutations), p = !1;
			l && u ? l.data.isEqual(u.data) ? d !== f && (n.track({
				type: 3,
				doc: u
			}), p = !0) : this.da(l, u) || (n.track({
				type: 2,
				doc: u
			}), p = !0, (s && this.ha(u, s) > 0 || c && this.ha(u, c) < 0) && (o = !0)) : !l && u ? (n.track({
				type: 0,
				doc: u
			}), p = !0) : l && !u && (n.track({
				type: 1,
				doc: l
			}), p = !0, (s || c) && (o = !0)), p && (u ? (a = a.add(u), i = f ? i.add(e) : i.delete(e)) : (a = a.delete(e), i = i.delete(e)));
		})), this.query.limit !== null) for (; a.size > this.query.limit;) {
			let e = this.query.limitType === "F" ? a.last() : a.first();
			a = a.delete(e.key), i = i.delete(e.key), n.track({
				type: 1,
				doc: e
			});
		}
		return {
			Pa: a,
			Ea: n,
			Xi: o,
			mutatedKeys: i
		};
	}
	da(e, t) {
		return e.hasLocalMutations && t.hasCommittedMutations && !t.hasLocalMutations;
	}
	applyChanges(e, t, n, r) {
		let i = this.Pa;
		this.Pa = e.Pa, this.mutatedKeys = e.mutatedKeys;
		let a = e.Ea.k_();
		a.sort(((e, t) => function(e, t) {
			let n = (e) => {
				switch (e) {
					case 0: return 1;
					case 2:
					case 3: return 2;
					case 1: return 0;
					default: return k();
				}
			};
			return n(e) - n(t);
		}(e.type, t.type) || this.ha(e.doc, t.doc))), this.Aa(n), r = r != null && r;
		let o = t && !r ? this.Ra() : [], s = this.la.size === 0 && this.current && !r ? 1 : 0, c = s !== this.ca;
		return this.ca = s, a.length !== 0 || c ? {
			snapshot: new Mg(this.query, e.Pa, i, a, e.mutatedKeys, s === 0, c, !1, !!n && n.resumeToken.approximateByteSize() > 0),
			Va: o
		} : { Va: o };
	}
	G_(e) {
		return this.current && e === "Offline" ? (this.current = !1, this.applyChanges({
			Pa: this.Pa,
			Ea: new jg(),
			mutatedKeys: this.mutatedKeys,
			Xi: !1
		}, !1)) : { Va: [] };
	}
	ma(e) {
		return !this.ua.has(e) && !!this.Pa.has(e) && !this.Pa.get(e).hasLocalMutations;
	}
	Aa(e) {
		e && (e.addedDocuments.forEach(((e) => this.ua = this.ua.add(e))), e.modifiedDocuments.forEach(((e) => {})), e.removedDocuments.forEach(((e) => this.ua = this.ua.delete(e))), this.current = e.current);
	}
	Ra() {
		if (!this.current) return [];
		let e = this.la;
		this.la = R(), this.Pa.forEach(((e) => {
			this.ma(e.key) && (this.la = this.la.add(e.key));
		}));
		let t = [];
		return e.forEach(((e) => {
			this.la.has(e) || t.push(new Wg(e));
		})), this.la.forEach(((n) => {
			e.has(n) || t.push(new Ug(n));
		})), t;
	}
	fa(e) {
		this.ua = e.hs, this.la = R();
		let t = this.Ta(e.documents);
		return this.applyChanges(t, !0);
	}
	ga() {
		return Mg.fromInitialDocuments(this.query, this.Pa, this.mutatedKeys, this.ca === 0, this.hasCachedResults);
	}
}, Kg = class {
	constructor(e, t, n) {
		this.query = e, this.targetId = t, this.view = n;
	}
}, qg = class {
	constructor(e) {
		this.key = e, this.pa = !1;
	}
}, Jg = class {
	constructor(e, t, n, r, i, a) {
		this.localStore = e, this.remoteStore = t, this.eventManager = n, this.sharedClientState = r, this.currentUser = i, this.maxConcurrentLimboResolutions = a, this.ya = {}, this.wa = new np(((e) => Xf(e)), Yf), this.Sa = /* @__PURE__ */ new Map(), this.ba = /* @__PURE__ */ new Set(), this.Da = new kd(I.comparator), this.Ca = /* @__PURE__ */ new Map(), this.va = new dh(), this.Fa = {}, this.Ma = /* @__PURE__ */ new Map(), this.xa = ah.Ln(), this.onlineState = "Unknown", this.Oa = void 0;
	}
	get isPrimaryClient() {
		return !0 === this.Oa;
	}
};
async function Yg(e, t, n = !0) {
	let r = __(e), i, a = r.wa.get(t);
	return a ? (r.sharedClientState.addLocalQueryTarget(a.targetId), i = a.view.ga()) : i = await Zg(r, t, n, !0), i;
}
async function Xg(e, t) {
	await Zg(__(e), t, !0, !1);
}
async function Zg(e, t, n, r) {
	let i = await jh(e.localStore, Gf(t)), a = i.targetId, o = n ? e.sharedClientState.addLocalQueryTarget(a) : "not-current", s;
	return r && (s = await Qg(e, t, a, o === "current", i.resumeToken)), e.isPrimaryClient && n && ng(e.remoteStore, i), s;
}
async function Qg(e, t, n, r, i) {
	e.Na = (t, n, r) => async function(e, t, n, r) {
		let i = t.view.Ta(n);
		i.Xi && (i = await Nh(e.localStore, t.query, !1).then((({ documents: e }) => t.view.Ta(e, i))));
		let a = r && r.targetChanges.get(t.targetId), o = r && r.targetMismatches.get(t.targetId) != null, s = t.view.applyChanges(i, e.isPrimaryClient, a, o);
		return d_(e, t.targetId, s.Va), s.snapshot;
	}(e, t, n, r);
	let a = await Nh(e.localStore, t, !0), o = new Gg(t, a.hs), s = o.Ta(a.documents), c = lm.createSynthesizedTargetChangeForCurrentChange(n, r && e.onlineState !== "Offline", i), l = o.applyChanges(s, e.isPrimaryClient, c);
	d_(e, n, l.Va);
	let u = new Kg(t, n, o);
	return e.wa.set(t, u), e.Sa.has(n) ? e.Sa.get(n).push(t) : e.Sa.set(n, [t]), l.snapshot;
}
async function $g(e, t, n) {
	let r = j(e), i = r.wa.get(t), a = r.Sa.get(i.targetId);
	if (a.length > 1) return r.Sa.set(i.targetId, a.filter(((e) => !Yf(e, t)))), void r.wa.delete(t);
	r.isPrimaryClient ? (r.sharedClientState.removeLocalQueryTarget(i.targetId), r.sharedClientState.isActiveQueryTarget(i.targetId) || await Mh(r.localStore, i.targetId, !1).then((() => {
		r.sharedClientState.clearQueryState(i.targetId), n && rg(r.remoteStore, i.targetId), l_(r, i.targetId);
	})).catch(fd)) : (l_(r, i.targetId), await Mh(r.localStore, i.targetId, !0));
}
async function e_(e, t) {
	let n = j(e), r = n.wa.get(t), i = n.Sa.get(r.targetId);
	n.isPrimaryClient && i.length === 1 && (n.sharedClientState.removeLocalQueryTarget(r.targetId), rg(n.remoteStore, r.targetId));
}
async function t_(e, t, n) {
	let r = v_(e);
	try {
		let e = await function(e, t) {
			let n = j(e), r = td.now(), i = t.reduce(((e, t) => e.add(t.key)), R()), a, o;
			return n.persistence.runTransaction("Locally write mutations", "readwrite", ((e) => {
				let s = ip(), c = R();
				return n.os.getEntries(e, i).next(((e) => {
					s = e, s.forEach(((e, t) => {
						t.isValidDocument() || (c = c.add(e));
					}));
				})).next((() => n.localDocuments.getOverlayedDocuments(e, s))).next(((i) => {
					a = i;
					let o = [];
					for (let e of t) {
						let t = zp(e, a.get(e.key).overlayedDocument);
						t != null && o.push(new Hp(e.key, t, uf(t.value.mapValue), Np.exists(!0)));
					}
					return n.mutationQueue.addMutationBatch(e, r, o, t);
				})).next(((t) => {
					o = t;
					let r = t.applyToLocalDocumentSet(a, c);
					return n.documentOverlayCache.saveOverlays(e, t.batchId, r);
				}));
			})).then((() => ({
				batchId: o.batchId,
				changes: sp(a)
			})));
		}(r.localStore, t);
		r.sharedClientState.addPendingMutation(e.batchId), function(e, t, n) {
			let r = e.Fa[e.currentUser.toKey()];
			r ||= new kd(P), r = r.insert(t, n), e.Fa[e.currentUser.toKey()] = r;
		}(r, e.batchId, n), await m_(r, e.changes), await hg(r.remoteStore);
	} catch (e) {
		let t = kg(e, "Failed to persist write");
		n.reject(t);
	}
}
async function n_(e, t) {
	let n = j(e);
	try {
		let e = await Oh(n.localStore, t);
		t.targetChanges.forEach(((e, t) => {
			let r = n.Ca.get(t);
			r && (A(e.addedDocuments.size + e.modifiedDocuments.size + e.removedDocuments.size <= 1), e.addedDocuments.size > 0 ? r.pa = !0 : e.modifiedDocuments.size > 0 ? A(r.pa) : e.removedDocuments.size > 0 && (A(r.pa), r.pa = !1));
		})), await m_(n, e, t);
	} catch (e) {
		await fd(e);
	}
}
function r_(e, t, n) {
	let r = j(e);
	if (r.isPrimaryClient && n === 0 || !r.isPrimaryClient && n === 1) {
		let e = [];
		r.wa.forEach(((n, r) => {
			let i = r.view.G_(t);
			i.snapshot && e.push(i.snapshot);
		})), function(e, t) {
			let n = j(e);
			n.onlineState = t;
			let r = !1;
			n.queries.forEach(((e, n) => {
				for (let e of n.Q_) e.G_(t) && (r = !0);
			})), r && zg(n);
		}(r.eventManager, t), e.length && r.ya.u_(e), r.onlineState = t, r.isPrimaryClient && r.sharedClientState.setOnlineState(t);
	}
}
async function i_(e, t, n) {
	let r = j(e);
	r.sharedClientState.updateQueryState(t, "rejected", n);
	let i = r.Ca.get(t), a = i && i.key;
	if (a) {
		let e = new kd(I.comparator);
		e = e.insert(a, df.newNoDocument(a, F.min()));
		let n = R().add(a);
		await n_(r, new cm(F.min(), /* @__PURE__ */ new Map(), new kd(P), e, n)), r.Da = r.Da.remove(a), r.Ca.delete(t), p_(r);
	} else await Mh(r.localStore, t, !1).then((() => l_(r, t, n))).catch(fd);
}
async function a_(e, t) {
	let n = j(e), r = t.batch.batchId;
	try {
		let e = await Eh(n.localStore, t);
		c_(n, r, null), s_(n, r), n.sharedClientState.updateMutationState(r, "acknowledged"), await m_(n, e);
	} catch (e) {
		await fd(e);
	}
}
async function o_(e, t, n) {
	let r = j(e);
	try {
		let e = await function(e, t) {
			let n = j(e);
			return n.persistence.runTransaction("Reject batch", "readwrite-primary", ((e) => {
				let r;
				return n.mutationQueue.lookupMutationBatch(e, t).next(((t) => (A(t !== null), r = t.keys(), n.mutationQueue.removeMutationBatch(e, t)))).next((() => n.mutationQueue.performConsistencyCheck(e))).next((() => n.documentOverlayCache.removeOverlaysForBatchId(e, r, t))).next((() => n.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(e, r))).next((() => n.localDocuments.getDocuments(e, r)));
			}));
		}(r.localStore, t);
		c_(r, t, n), s_(r, t), r.sharedClientState.updateMutationState(t, "rejected", n), await m_(r, e);
	} catch (e) {
		await fd(e);
	}
}
function s_(e, t) {
	(e.Ma.get(t) || []).forEach(((e) => {
		e.resolve();
	})), e.Ma.delete(t);
}
function c_(e, t, n) {
	let r = j(e), i = r.Fa[r.currentUser.toKey()];
	if (i) {
		let e = i.get(t);
		e && (n ? e.reject(n) : e.resolve(), i = i.remove(t)), r.Fa[r.currentUser.toKey()] = i;
	}
}
function l_(e, t, n = null) {
	e.sharedClientState.removeLocalQueryTarget(t);
	for (let r of e.Sa.get(t)) e.wa.delete(r), n && e.ya.La(r, n);
	e.Sa.delete(t), e.isPrimaryClient && e.va.Vr(t).forEach(((t) => {
		e.va.containsKey(t) || u_(e, t);
	}));
}
function u_(e, t) {
	e.ba.delete(t.path.canonicalString());
	let n = e.Da.get(t);
	n !== null && (rg(e.remoteStore, n), e.Da = e.Da.remove(t), e.Ca.delete(n), p_(e));
}
function d_(e, t, n) {
	for (let r of n) r instanceof Ug ? (e.va.addReference(r.key, t), f_(e, r)) : r instanceof Wg ? (O("SyncEngine", "Document no longer in limbo: " + r.key), e.va.removeReference(r.key, t), e.va.containsKey(r.key) || u_(e, r.key)) : k();
}
function f_(e, t) {
	let n = t.key, r = n.path.canonicalString();
	e.Da.get(n) || e.ba.has(r) || (O("SyncEngine", "New document in limbo: " + n), e.ba.add(r), p_(e));
}
function p_(e) {
	for (; e.ba.size > 0 && e.Da.size < e.maxConcurrentLimboResolutions;) {
		let t = e.ba.values().next().value;
		e.ba.delete(t);
		let n = new I(rd.fromString(t)), r = e.xa.next();
		e.Ca.set(r, new qg(n)), e.Da = e.Da.insert(n, r), ng(e.remoteStore, new Qm(Gf(Vf(n.path)), r, "TargetPurposeLimboResolution", Sd._e));
	}
}
async function m_(e, t, n) {
	let r = j(e), i = [], a = [], o = [];
	r.wa.isEmpty() || (r.wa.forEach(((e, s) => {
		o.push(r.Na(s, t, n).then(((e) => {
			if ((e || n) && r.isPrimaryClient && r.sharedClientState.updateQueryState(s.targetId, e?.fromCache ? "not-current" : "current"), e) {
				i.push(e);
				let t = bh.Ki(s.targetId, e);
				a.push(t);
			}
		})));
	})), await Promise.all(o), r.ya.u_(i), await async function(e, t) {
		let n = j(e);
		try {
			await n.persistence.runTransaction("notifyLocalViewChanges", "readwrite", ((e) => L.forEach(t, ((t) => L.forEach(t.qi, ((r) => n.persistence.referenceDelegate.addReference(e, t.targetId, r))).next((() => L.forEach(t.Qi, ((r) => n.persistence.referenceDelegate.removeReference(e, t.targetId, r)))))))));
		} catch (e) {
			if (!_d(e)) throw e;
			O("LocalStore", "Failed to update sequence numbers: " + e);
		}
		for (let e of t) {
			let t = e.targetId;
			if (!e.fromCache) {
				let e = n.ns.get(t), r = e.snapshotVersion, i = e.withLastLimboFreeSnapshotVersion(r);
				n.ns = n.ns.insert(t, i);
			}
		}
	}(r.localStore, a));
}
async function h_(e, t) {
	let n = j(e);
	if (!n.currentUser.isEqual(t)) {
		O("SyncEngine", "User change. New user:", t.toKey());
		let e = await Th(n.localStore, t);
		n.currentUser = t, function(e, t) {
			e.Ma.forEach(((e) => {
				e.forEach(((e) => {
					e.reject(new N(M.CANCELLED, t));
				}));
			})), e.Ma.clear();
		}(n, "'waitForPendingWrites' promise is rejected due to a user change."), n.sharedClientState.handleUserChange(t, e.removedBatchIds, e.addedBatchIds), await m_(n, e.us);
	}
}
function g_(e, t) {
	let n = j(e), r = n.Ca.get(t);
	if (r && r.pa) return R().add(r.key);
	{
		let e = R(), r = n.Sa.get(t);
		if (!r) return e;
		for (let t of r) {
			let r = n.wa.get(t);
			e = e.unionWith(r.view.Ia);
		}
		return e;
	}
}
function __(e) {
	let t = j(e);
	return t.remoteStore.remoteSyncer.applyRemoteEvent = n_.bind(null, t), t.remoteStore.remoteSyncer.getRemoteKeysForTarget = g_.bind(null, t), t.remoteStore.remoteSyncer.rejectListen = i_.bind(null, t), t.ya.u_ = Lg.bind(null, t.eventManager), t.ya.La = Rg.bind(null, t.eventManager), t;
}
function v_(e) {
	let t = j(e);
	return t.remoteStore.remoteSyncer.applySuccessfulWrite = a_.bind(null, t), t.remoteStore.remoteSyncer.rejectFailedWrite = o_.bind(null, t), t;
}
var y_ = class {
	constructor() {
		this.synchronizeTabs = !1;
	}
	async initialize(e) {
		this.serializer = Kh(e.databaseInfo.databaseId), this.sharedClientState = this.createSharedClientState(e), this.persistence = this.createPersistence(e), await this.persistence.start(), this.localStore = this.createLocalStore(e), this.gcScheduler = this.createGarbageCollectionScheduler(e, this.localStore), this.indexBackfillerScheduler = this.createIndexBackfillerScheduler(e, this.localStore);
	}
	createGarbageCollectionScheduler(e, t) {
		return null;
	}
	createIndexBackfillerScheduler(e, t) {
		return null;
	}
	createLocalStore(e) {
		return wh(this.persistence, new Sh(), e.initialUser, this.serializer);
	}
	createPersistence(e) {
		return new _h(yh.Hr, this.serializer);
	}
	createSharedClientState(e) {
		return new Ih();
	}
	async terminate() {
		var e, t;
		(e = this.gcScheduler) == null || e.stop(), (t = this.indexBackfillerScheduler) == null || t.stop(), this.sharedClientState.shutdown(), await this.persistence.shutdown();
	}
}, b_ = class {
	async initialize(e, t) {
		this.localStore || (this.localStore = e.localStore, this.sharedClientState = e.sharedClientState, this.datastore = this.createDatastore(t), this.remoteStore = this.createRemoteStore(t), this.eventManager = this.createEventManager(t), this.syncEngine = this.createSyncEngine(t, !e.synchronizeTabs), this.sharedClientState.onlineStateHandler = (e) => r_(this.syncEngine, e, 1), this.remoteStore.remoteSyncer.handleCredentialChange = h_.bind(null, this.syncEngine), await Tg(this.remoteStore, this.syncEngine.isPrimaryClient));
	}
	createEventManager(e) {
		return function() {
			return new Pg();
		}();
	}
	createDatastore(e) {
		let t = Kh(e.databaseInfo.databaseId), n = function(e) {
			return new Wh(e);
		}(e.databaseInfo);
		return function(e, t, n, r) {
			return new Zh(e, t, n, r);
		}(e.authCredentials, e.appCheckCredentials, n, t);
	}
	createRemoteStore(e) {
		return function(e, t, n, r, i) {
			return new $h(e, t, n, r, i);
		}(this.localStore, this.datastore, e.asyncQueue, ((e) => r_(this.syncEngine, e, 0)), function() {
			return Rh.D() ? new Rh() : new Lh();
		}());
	}
	createSyncEngine(e, t) {
		return function(e, t, n, r, i, a, o) {
			let s = new Jg(e, t, n, r, i, a);
			return o && (s.Oa = !0), s;
		}(this.localStore, this.remoteStore, this.eventManager, this.sharedClientState, e.initialUser, e.maxConcurrentLimboResolutions, t);
	}
	async terminate() {
		var e;
		await async function(e) {
			let t = j(e);
			O("RemoteStore", "RemoteStore shutting down."), t.v_.add(5), await tg(t), t.M_.shutdown(), t.x_.set("Unknown");
		}(this.remoteStore), (e = this.datastore) == null || e.terminate();
	}
}, x_ = class {
	constructor(e) {
		this.observer = e, this.muted = !1;
	}
	next(e) {
		this.observer.next && this.qa(this.observer.next, e);
	}
	error(e) {
		this.observer.error ? this.qa(this.observer.error, e) : Bu("Uncaught Error in snapshot listener:", e.toString());
	}
	Qa() {
		this.muted = !0;
	}
	qa(e, t) {
		this.muted || setTimeout((() => {
			this.muted || e(t);
		}), 0);
	}
}, S_ = class {
	constructor(e, t, n, r) {
		this.authCredentials = e, this.appCheckCredentials = t, this.asyncQueue = n, this.databaseInfo = r, this.user = Iu.UNAUTHENTICATED, this.clientId = $u.newId(), this.authCredentialListener = () => Promise.resolve(), this.appCheckCredentialListener = () => Promise.resolve(), this.authCredentials.start(n, (async (e) => {
			O("FirestoreClient", "Received user=", e.uid), await this.authCredentialListener(e), this.user = e;
		})), this.appCheckCredentials.start(n, ((e) => (O("FirestoreClient", "Received new app check token=", e), this.appCheckCredentialListener(e, this.user))));
	}
	get configuration() {
		return {
			asyncQueue: this.asyncQueue,
			databaseInfo: this.databaseInfo,
			clientId: this.clientId,
			authCredentials: this.authCredentials,
			appCheckCredentials: this.appCheckCredentials,
			initialUser: this.user,
			maxConcurrentLimboResolutions: 100
		};
	}
	setCredentialChangeListener(e) {
		this.authCredentialListener = e;
	}
	setAppCheckTokenChangeListener(e) {
		this.appCheckCredentialListener = e;
	}
	verifyNotTerminated() {
		if (this.asyncQueue.isShuttingDown) throw new N(M.FAILED_PRECONDITION, "The client has already been terminated.");
	}
	terminate() {
		this.asyncQueue.enterRestrictedMode();
		let e = new Uu();
		return this.asyncQueue.enqueueAndForgetEvenWhileRestricted((async () => {
			try {
				this._onlineComponents && await this._onlineComponents.terminate(), this._offlineComponents && await this._offlineComponents.terminate(), this.authCredentials.shutdown(), this.appCheckCredentials.shutdown(), e.resolve();
			} catch (t) {
				let n = kg(t, "Failed to shutdown persistence");
				e.reject(n);
			}
		})), e.promise;
	}
};
async function C_(e, t) {
	e.asyncQueue.verifyOperationInProgress(), O("FirestoreClient", "Initializing OfflineComponentProvider");
	let n = e.configuration;
	await t.initialize(n);
	let r = n.initialUser;
	e.setCredentialChangeListener((async (e) => {
		r.isEqual(e) || (await Th(t.localStore, e), r = e);
	})), t.persistence.setDatabaseDeletedListener((() => e.terminate())), e._offlineComponents = t;
}
async function w_(e, t) {
	e.asyncQueue.verifyOperationInProgress();
	let n = await E_(e);
	O("FirestoreClient", "Initializing OnlineComponentProvider"), await t.initialize(n, e.configuration), e.setCredentialChangeListener(((e) => wg(t.remoteStore, e))), e.setAppCheckTokenChangeListener(((e, n) => wg(t.remoteStore, n))), e._onlineComponents = t;
}
function T_(e) {
	return e.name === "FirebaseError" ? e.code === M.FAILED_PRECONDITION || e.code === M.UNIMPLEMENTED : !(typeof DOMException < "u" && e instanceof DOMException) || e.code === 22 || e.code === 20 || e.code === 11;
}
async function E_(e) {
	if (!e._offlineComponents) {
		if (e._uninitializedComponentsProvider) {
			O("FirestoreClient", "Using user provided OfflineComponentProvider");
			try {
				await C_(e, e._uninitializedComponentsProvider._offline);
			} catch (t) {
				let n = t;
				if (!T_(n)) throw n;
				Vu("Error using user provided cache. Falling back to memory cache: " + n), await C_(e, new y_());
			}
		} else O("FirestoreClient", "Using default OfflineComponentProvider"), await C_(e, new y_());
	}
	return e._offlineComponents;
}
async function D_(e) {
	return e._onlineComponents || (e._uninitializedComponentsProvider ? (O("FirestoreClient", "Using user provided OnlineComponentProvider"), await w_(e, e._uninitializedComponentsProvider._online)) : (O("FirestoreClient", "Using default OnlineComponentProvider"), await w_(e, new b_()))), e._onlineComponents;
}
function O_(e) {
	return D_(e).then(((e) => e.syncEngine));
}
async function k_(e) {
	let t = await D_(e), n = t.eventManager;
	return n.onListen = Yg.bind(null, t.syncEngine), n.onUnlisten = $g.bind(null, t.syncEngine), n.onFirstRemoteStoreListen = Xg.bind(null, t.syncEngine), n.onLastRemoteStoreUnlisten = e_.bind(null, t.syncEngine), n;
}
function A_(e, t, n = {}) {
	let r = new Uu();
	return e.asyncQueue.enqueueAndForget((async () => function(e, t, n, r, i) {
		let a = new x_({
			next: (a) => {
				t.enqueueAndForget((() => Ig(e, o)));
				let s = a.docs.has(n);
				!s && a.fromCache ? i.reject(new N(M.UNAVAILABLE, "Failed to get document because the client is offline.")) : s && a.fromCache && r && r.source === "server" ? i.reject(new N(M.UNAVAILABLE, "Failed to get document from server. (However, this document does exist in the local cache. Run again without setting source to \"server\" to retrieve the cached document.)")) : i.resolve(a);
			},
			error: (e) => i.reject(e)
		}), o = new Hg(Vf(n.path), a, {
			includeMetadataChanges: !0,
			ta: !0
		});
		return Fg(e, o);
	}(await k_(e), e.asyncQueue, t, n, r))), r.promise;
}
function j_(e, t, n = {}) {
	let r = new Uu();
	return e.asyncQueue.enqueueAndForget((async () => function(e, t, n, r, i) {
		let a = new Hg(n, new x_({
			next: (n) => {
				t.enqueueAndForget((() => Ig(e, a))), n.fromCache && r.source === "server" ? i.reject(new N(M.UNAVAILABLE, "Failed to get documents from server. (However, these documents may exist in the local cache. Run again without setting source to \"server\" to retrieve the cached documents.)")) : i.resolve(n);
			},
			error: (e) => i.reject(e)
		}), {
			includeMetadataChanges: !0,
			ta: !0
		});
		return Fg(e, a);
	}(await k_(e), e.asyncQueue, t, n, r))), r.promise;
}
function M_(e) {
	let t = {};
	return e.timeoutSeconds !== void 0 && (t.timeoutSeconds = e.timeoutSeconds), t;
}
var N_ = /* @__PURE__ */ new Map();
function P_(e, t, n) {
	if (!n) throw new N(M.INVALID_ARGUMENT, `Function ${e}() cannot be called with an empty ${t}.`);
}
function F_(e, t, n, r) {
	if (!0 === t && !0 === r) throw new N(M.INVALID_ARGUMENT, `${e} and ${n} cannot be used together.`);
}
function I_(e) {
	if (!I.isDocumentKey(e)) throw new N(M.INVALID_ARGUMENT, `Invalid document reference. Document references must have an even number of segments, but ${e} has ${e.length}.`);
}
function L_(e) {
	if (I.isDocumentKey(e)) throw new N(M.INVALID_ARGUMENT, `Invalid collection reference. Collection references must have an odd number of segments, but ${e} has ${e.length}.`);
}
function R_(e) {
	if (e === void 0) return "undefined";
	if (e === null) return "null";
	if (typeof e == "string") return e.length > 20 && (e = `${e.substring(0, 20)}...`), JSON.stringify(e);
	if (typeof e == "number" || typeof e == "boolean") return "" + e;
	if (typeof e == "object") {
		if (e instanceof Array) return "an array";
		{
			let t = function(e) {
				return e.constructor ? e.constructor.name : null;
			}(e);
			return t ? `a custom ${t} object` : "an object";
		}
	}
	return typeof e == "function" ? "a function" : k();
}
function z_(e, t) {
	if ("_delegate" in e && (e = e._delegate), !(e instanceof t)) {
		if (t.name === e.constructor.name) throw new N(M.INVALID_ARGUMENT, "Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?");
		{
			let n = R_(e);
			throw new N(M.INVALID_ARGUMENT, `Expected type '${t.name}', but it was: ${n}`);
		}
	}
	return e;
}
function B_(e, t) {
	if (t <= 0) throw new N(M.INVALID_ARGUMENT, `Function ${e}() requires a positive number, but it was: ${t}.`);
}
var V_ = class {
	constructor(e) {
		var t;
		if (e.host === void 0) {
			if (e.ssl !== void 0) throw new N(M.INVALID_ARGUMENT, "Can't provide ssl option if host option is not set");
			this.host = "firestore.googleapis.com", this.ssl = !0;
		} else this.host = e.host, this.ssl = (t = e.ssl) == null || t;
		if (this.credentials = e.credentials, this.ignoreUndefinedProperties = !!e.ignoreUndefinedProperties, this.localCache = e.localCache, e.cacheSizeBytes === void 0) this.cacheSizeBytes = 41943040;
		else {
			if (e.cacheSizeBytes !== -1 && e.cacheSizeBytes < 1048576) throw new N(M.INVALID_ARGUMENT, "cacheSizeBytes must be at least 1048576");
			this.cacheSizeBytes = e.cacheSizeBytes;
		}
		F_("experimentalForceLongPolling", e.experimentalForceLongPolling, "experimentalAutoDetectLongPolling", e.experimentalAutoDetectLongPolling), this.experimentalForceLongPolling = !!e.experimentalForceLongPolling, this.experimentalAutoDetectLongPolling = this.experimentalForceLongPolling ? !1 : e.experimentalAutoDetectLongPolling === void 0 || !!e.experimentalAutoDetectLongPolling, this.experimentalLongPollingOptions = M_(e.experimentalLongPollingOptions ?? {}), function(e) {
			if (e.timeoutSeconds !== void 0) {
				if (isNaN(e.timeoutSeconds)) throw new N(M.INVALID_ARGUMENT, `invalid long polling timeout: ${e.timeoutSeconds} (must not be NaN)`);
				if (e.timeoutSeconds < 5) throw new N(M.INVALID_ARGUMENT, `invalid long polling timeout: ${e.timeoutSeconds} (minimum allowed value is 5)`);
				if (e.timeoutSeconds > 30) throw new N(M.INVALID_ARGUMENT, `invalid long polling timeout: ${e.timeoutSeconds} (maximum allowed value is 30)`);
			}
		}(this.experimentalLongPollingOptions), this.useFetchStreams = !!e.useFetchStreams;
	}
	isEqual(e) {
		return this.host === e.host && this.ssl === e.ssl && this.credentials === e.credentials && this.cacheSizeBytes === e.cacheSizeBytes && this.experimentalForceLongPolling === e.experimentalForceLongPolling && this.experimentalAutoDetectLongPolling === e.experimentalAutoDetectLongPolling && function(e, t) {
			return e.timeoutSeconds === t.timeoutSeconds;
		}(this.experimentalLongPollingOptions, e.experimentalLongPollingOptions) && this.ignoreUndefinedProperties === e.ignoreUndefinedProperties && this.useFetchStreams === e.useFetchStreams;
	}
}, H_ = class {
	constructor(e, t, n, r) {
		this._authCredentials = e, this._appCheckCredentials = t, this._databaseId = n, this._app = r, this.type = "firestore-lite", this._persistenceKey = "(lite)", this._settings = new V_({}), this._settingsFrozen = !1;
	}
	get app() {
		if (!this._app) throw new N(M.FAILED_PRECONDITION, "Firestore was not initialized using the Firebase SDK. 'app' is not available");
		return this._app;
	}
	get _initialized() {
		return this._settingsFrozen;
	}
	get _terminated() {
		return this._terminateTask !== void 0;
	}
	_setSettings(e) {
		if (this._settingsFrozen) throw new N(M.FAILED_PRECONDITION, "Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.");
		this._settings = new V_(e), e.credentials !== void 0 && (this._authCredentials = function(e) {
			if (!e) return new Gu();
			switch (e.type) {
				case "firstParty": return new Yu(e.sessionIndex || "0", e.iamToken || null, e.authTokenFactory || null);
				case "provider": return e.client;
				default: throw new N(M.INVALID_ARGUMENT, "makeAuthCredentialsProvider failed due to invalid credential type");
			}
		}(e.credentials));
	}
	_getSettings() {
		return this._settings;
	}
	_freezeSettings() {
		return this._settingsFrozen = !0, this._settings;
	}
	_delete() {
		return this._terminateTask ||= this._terminate(), this._terminateTask;
	}
	toJSON() {
		return {
			app: this._app,
			databaseId: this._databaseId,
			settings: this._settings
		};
	}
	_terminate() {
		return function(e) {
			let t = N_.get(e);
			t && (O("ComponentProvider", "Removing Datastore"), N_.delete(e), t.terminate());
		}(this), Promise.resolve();
	}
};
function U_(e, t, n, r = {}) {
	let i = (e = z_(e, H_))._getSettings(), a = `${t}:${n}`;
	if (i.host !== "firestore.googleapis.com" && i.host !== a && Vu("Host has been set in both settings() and connectFirestoreEmulator(), emulator host will be used."), e._setSettings(Object.assign(Object.assign({}, i), {
		host: a,
		ssl: !1
	})), r.mockUserToken) {
		let t, n;
		if (typeof r.mockUserToken == "string") t = r.mockUserToken, n = Iu.MOCK_USER;
		else {
			t = ne(r.mockUserToken, e._app?.options.projectId);
			let i = r.mockUserToken.sub || r.mockUserToken.user_id;
			if (!i) throw new N(M.INVALID_ARGUMENT, "mockUserToken must contain 'sub' or 'user_id' field!");
			n = new Iu(i);
		}
		e._authCredentials = new Ku(new Wu(t, n));
	}
}
var W_ = class e {
	constructor(e, t, n) {
		this.converter = t, this._query = n, this.type = "query", this.firestore = e;
	}
	withConverter(t) {
		return new e(this.firestore, t, this._query);
	}
}, G_ = class e {
	constructor(e, t, n) {
		this.converter = t, this._key = n, this.type = "document", this.firestore = e;
	}
	get _path() {
		return this._key.path;
	}
	get id() {
		return this._key.path.lastSegment();
	}
	get path() {
		return this._key.path.canonicalString();
	}
	get parent() {
		return new K_(this.firestore, this.converter, this._key.path.popLast());
	}
	withConverter(t) {
		return new e(this.firestore, t, this._key);
	}
}, K_ = class e extends W_ {
	constructor(e, t, n) {
		super(e, t, Vf(n)), this._path = n, this.type = "collection";
	}
	get id() {
		return this._query.path.lastSegment();
	}
	get path() {
		return this._query.path.canonicalString();
	}
	get parent() {
		let e = this._path.popLast();
		return e.isEmpty() ? null : new G_(this.firestore, null, new I(e));
	}
	withConverter(t) {
		return new e(this.firestore, t, this._path);
	}
};
function q_(e, t, ...n) {
	if (e = _(e), P_("collection", "path", t), e instanceof H_) {
		let r = rd.fromString(t, ...n);
		return L_(r), new K_(e, null, r);
	}
	{
		if (!(e instanceof G_ || e instanceof K_)) throw new N(M.INVALID_ARGUMENT, "Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");
		let r = e._path.child(rd.fromString(t, ...n));
		return L_(r), new K_(e.firestore, null, r);
	}
}
function J_(e, t, ...n) {
	if (e = _(e), arguments.length === 1 && (t = $u.newId()), P_("doc", "path", t), e instanceof H_) {
		let r = rd.fromString(t, ...n);
		return I_(r), new G_(e, null, new I(r));
	}
	{
		if (!(e instanceof G_ || e instanceof K_)) throw new N(M.INVALID_ARGUMENT, "Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");
		let r = e._path.child(rd.fromString(t, ...n));
		return I_(r), new G_(e.firestore, e instanceof K_ ? e.converter : null, new I(r));
	}
}
var Y_ = class {
	constructor() {
		this.nu = Promise.resolve(), this.ru = [], this.iu = !1, this.su = [], this.ou = null, this._u = !1, this.au = !1, this.uu = [], this.jo = new qh(this, "async_queue_retry"), this.cu = () => {
			let e = Gh();
			e && O("AsyncQueue", "Visibility state changed to " + e.visibilityState), this.jo.Ko();
		};
		let e = Gh();
		e && typeof e.addEventListener == "function" && e.addEventListener("visibilitychange", this.cu);
	}
	get isShuttingDown() {
		return this.iu;
	}
	enqueueAndForget(e) {
		this.enqueue(e);
	}
	enqueueAndForgetEvenWhileRestricted(e) {
		this.lu(), this.hu(e);
	}
	enterRestrictedMode(e) {
		if (!this.iu) {
			this.iu = !0, this.au = e || !1;
			let t = Gh();
			t && typeof t.removeEventListener == "function" && t.removeEventListener("visibilitychange", this.cu);
		}
	}
	enqueue(e) {
		if (this.lu(), this.iu) return new Promise((() => {}));
		let t = new Uu();
		return this.hu((() => this.iu && this.au ? Promise.resolve() : (e().then(t.resolve, t.reject), t.promise))).then((() => t.promise));
	}
	enqueueRetryable(e) {
		this.enqueueAndForget((() => (this.ru.push(e), this.Pu())));
	}
	async Pu() {
		if (this.ru.length !== 0) {
			try {
				await this.ru[0](), this.ru.shift(), this.jo.reset();
			} catch (e) {
				if (!_d(e)) throw e;
				O("AsyncQueue", "Operation failed with retryable error: " + e);
			}
			this.ru.length > 0 && this.jo.qo((() => this.Pu()));
		}
	}
	hu(e) {
		let t = this.nu.then((() => (this._u = !0, e().catch(((e) => {
			throw this.ou = e, this._u = !1, Bu("INTERNAL UNHANDLED ERROR: ", function(e) {
				let t = e.message || "";
				return e.stack && (t = e.stack.includes(e.message) ? e.stack : e.message + "\n" + e.stack), t;
			}(e)), e;
		})).then(((e) => (this._u = !1, e))))));
		return this.nu = t, t;
	}
	enqueueAfterDelay(e, t, n) {
		this.lu(), this.uu.indexOf(e) > -1 && (t = 0);
		let r = Og.createAndSchedule(this, e, t, n, ((e) => this.Iu(e)));
		return this.su.push(r), r;
	}
	lu() {
		this.ou && k();
	}
	verifyOperationInProgress() {}
	async Tu() {
		let e;
		do
			e = this.nu, await e;
		while (e !== this.nu);
	}
	Eu(e) {
		for (let t of this.su) if (t.timerId === e) return !0;
		return !1;
	}
	du(e) {
		return this.Tu().then((() => {
			this.su.sort(((e, t) => e.targetTimeMs - t.targetTimeMs));
			for (let t of this.su) if (t.skipDelay(), e !== "all" && t.timerId === e) break;
			return this.Tu();
		}));
	}
	Au(e) {
		this.uu.push(e);
	}
	Iu(e) {
		let t = this.su.indexOf(e);
		this.su.splice(t, 1);
	}
};
function X_(e) {
	return function(e, t) {
		if (typeof e != "object" || !e) return !1;
		let n = e;
		for (let e of t) if (e in n && typeof n[e] == "function") return !0;
		return !1;
	}(e, [
		"next",
		"error",
		"complete"
	]);
}
var Z_ = class extends H_ {
	constructor(e, t, n, r) {
		super(e, t, n, r), this.type = "firestore", this._queue = function() {
			return new Y_();
		}(), this._persistenceKey = r?.name || "[DEFAULT]";
	}
	_terminate() {
		return this._firestoreClient || ev(this), this._firestoreClient.terminate();
	}
};
function Q_(e, t) {
	let n = typeof e == "object" ? e : qt(), r = typeof e == "string" ? e : t || "(default)", i = Vt(n, "firestore").getImmediate({ identifier: r });
	if (!i._initialized) {
		let e = p("firestore");
		e && U_(i, ...e);
	}
	return i;
}
function $_(e) {
	return e._firestoreClient || ev(e), e._firestoreClient.verifyNotTerminated(), e._firestoreClient;
}
function ev(e) {
	var t, n;
	let r = e._freezeSettings(), i = function(e, t, n, r) {
		return new Wd(e, t, n, r.host, r.ssl, r.experimentalForceLongPolling, r.experimentalAutoDetectLongPolling, M_(r.experimentalLongPollingOptions), r.useFetchStreams);
	}(e._databaseId, e._app?.options.appId || "", e._persistenceKey, r);
	e._firestoreClient = new S_(e._authCredentials, e._appCheckCredentials, e._queue, i), (t = r.localCache) != null && t._offlineComponentProvider && (n = r.localCache) != null && n._onlineComponentProvider && (e._firestoreClient._uninitializedComponentsProvider = {
		_offlineKind: r.localCache.kind,
		_offline: r.localCache._offlineComponentProvider,
		_online: r.localCache._onlineComponentProvider
	});
}
var tv = class e {
	constructor(e) {
		this._byteString = e;
	}
	static fromBase64String(t) {
		try {
			return new e(Id.fromBase64String(t));
		} catch (e) {
			throw new N(M.INVALID_ARGUMENT, "Failed to construct data from Base64 string: " + e);
		}
	}
	static fromUint8Array(t) {
		return new e(Id.fromUint8Array(t));
	}
	toBase64() {
		return this._byteString.toBase64();
	}
	toUint8Array() {
		return this._byteString.toUint8Array();
	}
	toString() {
		return "Bytes(base64: " + this.toBase64() + ")";
	}
	isEqual(e) {
		return this._byteString.isEqual(e._byteString);
	}
}, nv = class {
	constructor(...e) {
		for (let t = 0; t < e.length; ++t) if (e[t].length === 0) throw new N(M.INVALID_ARGUMENT, "Invalid field name at argument $(i + 1). Field names must not be empty.");
		this._internalPath = new ad(e);
	}
	isEqual(e) {
		return this._internalPath.isEqual(e._internalPath);
	}
}, rv = class {
	constructor(e) {
		this._methodName = e;
	}
}, iv = class {
	constructor(e, t) {
		if (!isFinite(e) || e < -90 || e > 90) throw new N(M.INVALID_ARGUMENT, "Latitude must be a number between -90 and 90, but was: " + e);
		if (!isFinite(t) || t < -180 || t > 180) throw new N(M.INVALID_ARGUMENT, "Longitude must be a number between -180 and 180, but was: " + t);
		this._lat = e, this._long = t;
	}
	get latitude() {
		return this._lat;
	}
	get longitude() {
		return this._long;
	}
	isEqual(e) {
		return this._lat === e._lat && this._long === e._long;
	}
	toJSON() {
		return {
			latitude: this._lat,
			longitude: this._long
		};
	}
	_compareTo(e) {
		return P(this._lat, e._lat) || P(this._long, e._long);
	}
}, av = /^__.*__$/, ov = class {
	constructor(e, t, n) {
		this.data = e, this.fieldMask = t, this.fieldTransforms = n;
	}
	toMutation(e, t) {
		return this.fieldMask === null ? new Vp(e, this.data, t, this.fieldTransforms) : new Hp(e, this.data, this.fieldMask, t, this.fieldTransforms);
	}
};
function sv(e) {
	switch (e) {
		case 0:
		case 2:
		case 1: return !0;
		case 3:
		case 4: return !1;
		default: throw k();
	}
}
var cv = class e {
	constructor(e, t, n, r, i, a) {
		this.settings = e, this.databaseId = t, this.serializer = n, this.ignoreUndefinedProperties = r, i === void 0 && this.Ru(), this.fieldTransforms = i || [], this.fieldMask = a || [];
	}
	get path() {
		return this.settings.path;
	}
	get Vu() {
		return this.settings.Vu;
	}
	mu(t) {
		return new e(Object.assign(Object.assign({}, this.settings), t), this.databaseId, this.serializer, this.ignoreUndefinedProperties, this.fieldTransforms, this.fieldMask);
	}
	fu(e) {
		let t = this.path?.child(e), n = this.mu({
			path: t,
			gu: !1
		});
		return n.pu(e), n;
	}
	yu(e) {
		let t = this.path?.child(e), n = this.mu({
			path: t,
			gu: !1
		});
		return n.Ru(), n;
	}
	wu(e) {
		return this.mu({
			path: void 0,
			gu: !0
		});
	}
	Su(e) {
		return xv(e, this.settings.methodName, this.settings.bu || !1, this.path, this.settings.Du);
	}
	contains(e) {
		return this.fieldMask.find(((t) => e.isPrefixOf(t))) !== void 0 || this.fieldTransforms.find(((t) => e.isPrefixOf(t.field))) !== void 0;
	}
	Ru() {
		if (this.path) for (let e = 0; e < this.path.length; e++) this.pu(this.path.get(e));
	}
	pu(e) {
		if (e.length === 0) throw this.Su("Document fields must not be empty");
		if (sv(this.Vu) && av.test(e)) throw this.Su("Document fields cannot begin and end with \"__\"");
	}
}, lv = class {
	constructor(e, t, n) {
		this.databaseId = e, this.ignoreUndefinedProperties = t, this.serializer = n || Kh(e);
	}
	Cu(e, t, n, r = !1) {
		return new cv({
			Vu: e,
			methodName: t,
			Du: n,
			path: ad.emptyPath(),
			gu: !1,
			bu: r
		}, this.databaseId, this.serializer, this.ignoreUndefinedProperties);
	}
};
function uv(e) {
	let t = e._freezeSettings(), n = Kh(e._databaseId);
	return new lv(e._databaseId, !!t.ignoreUndefinedProperties, n);
}
function dv(e, t, n, r, i, a = {}) {
	let o = e.Cu(a.merge || a.mergeFields ? 2 : 0, t, n, i);
	_v("Data must be an object, but it was:", o, r);
	let s = hv(r, o), c, l;
	if (a.merge) c = new Pd(o.fieldMask), l = o.fieldTransforms;
	else if (a.mergeFields) {
		let e = [];
		for (let r of a.mergeFields) {
			let i = vv(t, r, n);
			if (!o.contains(i)) throw new N(M.INVALID_ARGUMENT, `Field '${i}' is specified in your field mask but missing from your input data.`);
			Sv(e, i) || e.push(i);
		}
		c = new Pd(e), l = o.fieldTransforms.filter(((e) => c.covers(e.field)));
	} else c = null, l = o.fieldTransforms;
	return new ov(new lf(s), c, l);
}
var fv = class e extends rv {
	_toFieldTransform(e) {
		return new Ap(e.path, new Sp());
	}
	isEqual(t) {
		return t instanceof e;
	}
};
function pv(e, t, n, r = !1) {
	return mv(n, e.Cu(r ? 4 : 3, t));
}
function mv(e, t) {
	if (gv(e = _(e))) return _v("Unsupported field value:", t, e), hv(e, t);
	if (e instanceof rv) return function(e, t) {
		if (!sv(t.Vu)) throw t.Su(`${e._methodName}() can only be used with update() and set()`);
		if (!t.path) throw t.Su(`${e._methodName}() is not currently supported inside arrays`);
		let n = e._toFieldTransform(t);
		n && t.fieldTransforms.push(n);
	}(e, t), null;
	if (e === void 0 && t.ignoreUndefinedProperties) return null;
	if (t.path && t.fieldMask.push(t.path), e instanceof Array) {
		if (t.settings.gu && t.Vu !== 4) throw t.Su("Nested arrays are not supported");
		return function(e, t) {
			let n = [], r = 0;
			for (let i of e) {
				let e = mv(i, t.wu(r));
				e ??= { nullValue: "NULL_VALUE" }, n.push(e), r++;
			}
			return { arrayValue: { values: n } };
		}(e, t);
	}
	return function(e, t) {
		if ((e = _(e)) === null) return { nullValue: "NULL_VALUE" };
		if (typeof e == "number") return _p(t.serializer, e);
		if (typeof e == "boolean") return { booleanValue: e };
		if (typeof e == "string") return { stringValue: e };
		if (e instanceof Date) {
			let n = td.fromDate(e);
			return { timestampValue: Sm(t.serializer, n) };
		}
		if (e instanceof td) {
			let n = new td(e.seconds, 1e3 * Math.floor(e.nanoseconds / 1e3));
			return { timestampValue: Sm(t.serializer, n) };
		}
		if (e instanceof iv) return { geoPointValue: {
			latitude: e.latitude,
			longitude: e.longitude
		} };
		if (e instanceof tv) return { bytesValue: Cm(t.serializer, e._byteString) };
		if (e instanceof G_) {
			let n = t.databaseId, r = e.firestore._databaseId;
			if (!r.isEqual(n)) throw t.Su(`Document reference is for database ${r.projectId}/${r.database} but should be for database ${n.projectId}/${n.database}`);
			return { referenceValue: Em(e.firestore._databaseId || t.databaseId, e._key.path) };
		}
		throw t.Su(`Unsupported field value: ${R_(e)}`);
	}(e, t);
}
function hv(e, t) {
	let n = {};
	return Od(e) ? t.path && t.path.length > 0 && t.fieldMask.push(t.path) : Dd(e, ((e, r) => {
		let i = mv(r, t.fu(e));
		i != null && (n[e] = i);
	})), { mapValue: { fields: n } };
}
function gv(e) {
	return !(typeof e != "object" || !e || e instanceof Array || e instanceof Date || e instanceof td || e instanceof iv || e instanceof tv || e instanceof G_ || e instanceof rv);
}
function _v(e, t, n) {
	if (!gv(n) || !function(e) {
		return typeof e == "object" && !!e && (Object.getPrototypeOf(e) === Object.prototype || Object.getPrototypeOf(e) === null);
	}(n)) {
		let r = R_(n);
		throw r === "an object" ? t.Su(e + " a custom object") : t.Su(e + " " + r);
	}
}
function vv(e, t, n) {
	if ((t = _(t)) instanceof nv) return t._internalPath;
	if (typeof t == "string") return bv(e, t);
	throw xv("Field path arguments must be of type string or ", e, !1, void 0, n);
}
var yv = /* @__PURE__ */ RegExp("[~\\*/\\[\\]]");
function bv(e, t, n) {
	if (t.search(yv) >= 0) throw xv(`Invalid field path (${t}). Paths must not contain '~', '*', '/', '[', or ']'`, e, !1, void 0, n);
	try {
		return new nv(...t.split("."))._internalPath;
	} catch {
		throw xv(`Invalid field path (${t}). Paths must not be empty, begin with '.', end with '.', or contain '..'`, e, !1, void 0, n);
	}
}
function xv(e, t, n, r, i) {
	let a = r && !r.isEmpty(), o = i !== void 0, s = `Function ${t}() called with invalid data`;
	n && (s += " (via `toFirestore()`)"), s += ". ";
	let c = "";
	return (a || o) && (c += " (found", a && (c += ` in field ${r}`), o && (c += ` in document ${i}`), c += ")"), new N(M.INVALID_ARGUMENT, s + e + c);
}
function Sv(e, t) {
	return e.some(((e) => e.isEqual(t)));
}
var Cv = class {
	constructor(e, t, n, r, i) {
		this._firestore = e, this._userDataWriter = t, this._key = n, this._document = r, this._converter = i;
	}
	get id() {
		return this._key.path.lastSegment();
	}
	get ref() {
		return new G_(this._firestore, this._converter, this._key);
	}
	exists() {
		return this._document !== null;
	}
	data() {
		if (this._document) {
			if (this._converter) {
				let e = new wv(this._firestore, this._userDataWriter, this._key, this._document, null);
				return this._converter.fromFirestore(e);
			}
			return this._userDataWriter.convertValue(this._document.data.value);
		}
	}
	get(e) {
		if (this._document) {
			let t = this._document.data.field(Tv("DocumentSnapshot.get", e));
			if (t !== null) return this._userDataWriter.convertValue(t);
		}
	}
}, wv = class extends Cv {
	data() {
		return super.data();
	}
};
function Tv(e, t) {
	return typeof t == "string" ? bv(e, t) : t instanceof nv ? t._internalPath : t._delegate._internalPath;
}
function Ev(e) {
	if (e.limitType === "L" && e.explicitOrderBy.length === 0) throw new N(M.UNIMPLEMENTED, "limitToLast() queries require specifying at least one orderBy() clause");
}
var Dv = class {}, Ov = class extends Dv {};
function kv(e, t, ...n) {
	let r = [];
	t instanceof Dv && r.push(t), r = r.concat(n), function(e) {
		let t = e.filter(((e) => e instanceof Mv)).length, n = e.filter(((e) => e instanceof Av)).length;
		if (t > 1 || t > 0 && n > 0) throw new N(M.INVALID_ARGUMENT, "InvalidQuery. When using composite filters, you cannot use more than one filter at the top level. Consider nesting the multiple filters within an `and(...)` statement. For example: change `query(query, where(...), or(...))` to `query(query, and(where(...), or(...)))`.");
	}(r);
	for (let t of r) e = t._apply(e);
	return e;
}
var Av = class e extends Ov {
	constructor(e, t, n) {
		super(), this._field = e, this._op = t, this._value = n, this.type = "where";
	}
	static _create(t, n, r) {
		return new e(t, n, r);
	}
	_apply(e) {
		let t = this._parse(e);
		return Hv(e._query, t), new W_(e.firestore, e.converter, qf(e._query, t));
	}
	_parse(e) {
		let t = uv(e.firestore);
		return function(e, t, n, r, i, a, o) {
			let s;
			if (i.isKeyField()) {
				if (a === "array-contains" || a === "array-contains-any") throw new N(M.INVALID_ARGUMENT, `Invalid Query. You can't perform '${a}' queries on documentId().`);
				if (a === "in" || a === "not-in") {
					Vv(o, a);
					let t = [];
					for (let n of o) t.push(Bv(r, e, n));
					s = { arrayValue: { values: t } };
				} else s = Bv(r, e, o);
			} else a !== "in" && a !== "not-in" && a !== "array-contains-any" || Vv(o, a), s = pv(n, t, o, a === "in" || a === "not-in");
			return vf.create(i, a, s);
		}(e._query, "where", t, e.firestore._databaseId, this._field, this._op, this._value);
	}
};
function jv(e, t, n) {
	let r = t, i = Tv("where", e);
	return Av._create(i, r, n);
}
var Mv = class e extends Dv {
	constructor(e, t) {
		super(), this.type = e, this._queryConstraints = t;
	}
	static _create(t, n) {
		return new e(t, n);
	}
	_parse(e) {
		let t = this._queryConstraints.map(((t) => t._parse(e))).filter(((e) => e.getFilters().length > 0));
		return t.length === 1 ? t[0] : yf.create(t, this._getOperator());
	}
	_apply(e) {
		let t = this._parse(e);
		return t.getFilters().length === 0 ? e : (function(e, t) {
			let n = e, r = t.getFlattenedFilters();
			for (let e of r) Hv(n, e), n = qf(n, e);
		}(e._query, t), new W_(e.firestore, e.converter, qf(e._query, t)));
	}
	_getQueryConstraints() {
		return this._queryConstraints;
	}
	_getOperator() {
		return this.type === "and" ? "and" : "or";
	}
}, Nv = class e extends Ov {
	constructor(e, t) {
		super(), this._field = e, this._direction = t, this.type = "orderBy";
	}
	static _create(t, n) {
		return new e(t, n);
	}
	_apply(e) {
		let t = function(e, t, n) {
			if (e.startAt !== null) throw new N(M.INVALID_ARGUMENT, "Invalid query. You must not call startAt() or startAfter() before calling orderBy().");
			if (e.endAt !== null) throw new N(M.INVALID_ARGUMENT, "Invalid query. You must not call endAt() or endBefore() before calling orderBy().");
			return new hf(t, n);
		}(e._query, this._field, this._direction);
		return new W_(e.firestore, e.converter, function(e, t) {
			let n = e.explicitOrderBy.concat([t]);
			return new zf(e.path, e.collectionGroup, n, e.filters.slice(), e.limit, e.limitType, e.startAt, e.endAt);
		}(e._query, t));
	}
};
function Pv(e, t = "asc") {
	let n = t, r = Tv("orderBy", e);
	return Nv._create(r, n);
}
var Fv = class e extends Ov {
	constructor(e, t, n) {
		super(), this.type = e, this._limit = t, this._limitType = n;
	}
	static _create(t, n, r) {
		return new e(t, n, r);
	}
	_apply(e) {
		return new W_(e.firestore, e.converter, Jf(e._query, this._limit, this._limitType));
	}
};
function Iv(e) {
	return B_("limit", e), Fv._create("limit", e, "F");
}
var Lv = class e extends Ov {
	constructor(e, t, n) {
		super(), this.type = e, this._docOrFields = t, this._inclusive = n;
	}
	static _create(t, n, r) {
		return new e(t, n, r);
	}
	_apply(e) {
		let t = zv(e, this.type, this._docOrFields, this._inclusive);
		return new W_(e.firestore, e.converter, function(e, t) {
			return new zf(e.path, e.collectionGroup, e.explicitOrderBy.slice(), e.filters.slice(), e.limit, e.limitType, t, e.endAt);
		}(e._query, t));
	}
};
function Rv(...e) {
	return Lv._create("startAfter", e, !1);
}
function zv(e, t, n, r) {
	if (n[0] = _(n[0]), n[0] instanceof Cv) return function(e, t, n, r, i) {
		if (!r) throw new N(M.NOT_FOUND, `Can't use a DocumentSnapshot that doesn't exist for ${n}().`);
		let a = [];
		for (let n of Wf(e)) if (n.field.isKeyField()) a.push(ef(t, r.key));
		else {
			let e = r.data.field(n.field);
			if (Vd(e)) throw new N(M.INVALID_ARGUMENT, "Invalid query. You are trying to start or end a query using a document for which the field \"" + n.field + "\" is an uncommitted server timestamp. (Since the value of this field is unknown, you cannot start/end a query with it.)");
			if (e === null) {
				let e = n.field.canonicalString();
				throw new N(M.INVALID_ARGUMENT, `Invalid query. You are trying to start or end a query using a document for which the field '${e}' (used as the orderBy) does not exist.`);
			}
			a.push(e);
		}
		return new ff(a, i);
	}(e._query, e.firestore._databaseId, t, n[0]._document, r);
	{
		let i = uv(e.firestore);
		return function(e, t, n, r, i, a) {
			let o = e.explicitOrderBy;
			if (i.length > o.length) throw new N(M.INVALID_ARGUMENT, `Too many arguments provided to ${r}(). The number of arguments must be less than or equal to the number of orderBy() clauses`);
			let s = [];
			for (let a = 0; a < i.length; a++) {
				let c = i[a];
				if (o[a].field.isKeyField()) {
					if (typeof c != "string") throw new N(M.INVALID_ARGUMENT, `Invalid query. Expected a string for document ID in ${r}(), but got a ${typeof c}`);
					if (!Uf(e) && c.indexOf("/") !== -1) throw new N(M.INVALID_ARGUMENT, `Invalid query. When querying a collection and ordering by documentId(), the value passed to ${r}() must be a plain document ID, but '${c}' contains a slash.`);
					let n = e.path.child(rd.fromString(c));
					if (!I.isDocumentKey(n)) throw new N(M.INVALID_ARGUMENT, `Invalid query. When querying a collection group and ordering by documentId(), the value passed to ${r}() must result in a valid document path, but '${n}' is not because it contains an odd number of segments.`);
					let i = new I(n);
					s.push(ef(t, i));
				} else {
					let e = pv(n, r, c);
					s.push(e);
				}
			}
			return new ff(s, a);
		}(e._query, e.firestore._databaseId, i, t, n, r);
	}
}
function Bv(e, t, n) {
	if (typeof (n = _(n)) == "string") {
		if (n === "") throw new N(M.INVALID_ARGUMENT, "Invalid query. When querying with documentId(), you must provide a valid document ID, but it was an empty string.");
		if (!Uf(t) && n.indexOf("/") !== -1) throw new N(M.INVALID_ARGUMENT, `Invalid query. When querying a collection by documentId(), you must provide a plain document ID, but '${n}' contains a '/' character.`);
		let r = t.path.child(rd.fromString(n));
		if (!I.isDocumentKey(r)) throw new N(M.INVALID_ARGUMENT, `Invalid query. When querying a collection group by documentId(), the value provided must result in a valid document path, but '${r}' is not because it has an odd number of segments (${r.length}).`);
		return ef(e, new I(r));
	}
	if (n instanceof G_) return ef(e, n._key);
	throw new N(M.INVALID_ARGUMENT, `Invalid query. When querying with documentId(), you must provide a valid string or a DocumentReference, but it was: ${R_(n)}.`);
}
function Vv(e, t) {
	if (!Array.isArray(e) || e.length === 0) throw new N(M.INVALID_ARGUMENT, `Invalid Query. A non-empty array is required for '${t.toString()}' filters.`);
}
function Hv(e, t) {
	let n = function(e, t) {
		for (let n of e) for (let e of n.getFlattenedFilters()) if (t.indexOf(e.op) >= 0) return e.op;
		return null;
	}(e.filters, function(e) {
		switch (e) {
			case "!=": return ["!=", "not-in"];
			case "array-contains-any":
			case "in": return ["not-in"];
			case "not-in": return [
				"array-contains-any",
				"in",
				"not-in",
				"!="
			];
			default: return [];
		}
	}(t.op));
	if (n !== null) throw n === t.op ? new N(M.INVALID_ARGUMENT, `Invalid query. You cannot use more than one '${t.op.toString()}' filter.`) : new N(M.INVALID_ARGUMENT, `Invalid query. You cannot use '${t.op.toString()}' filters with '${n.toString()}' filters.`);
}
var Uv = class {
	convertValue(e, t = "none") {
		switch (qd(e)) {
			case 0: return null;
			case 1: return e.booleanValue;
			case 2: return zd(e.integerValue || e.doubleValue);
			case 3: return this.convertTimestamp(e.timestampValue);
			case 4: return this.convertServerTimestamp(e, t);
			case 5: return e.stringValue;
			case 6: return this.convertBytes(Bd(e.bytesValue));
			case 7: return this.convertReference(e.referenceValue);
			case 8: return this.convertGeoPoint(e.geoPointValue);
			case 9: return this.convertArray(e.arrayValue, t);
			case 10: return this.convertObject(e.mapValue, t);
			default: throw k();
		}
	}
	convertObject(e, t) {
		return this.convertObjectMap(e.fields, t);
	}
	convertObjectMap(e, t = "none") {
		let n = {};
		return Dd(e, ((e, r) => {
			n[e] = this.convertValue(r, t);
		})), n;
	}
	convertGeoPoint(e) {
		return new iv(zd(e.latitude), zd(e.longitude));
	}
	convertArray(e, t) {
		return (e.values || []).map(((e) => this.convertValue(e, t)));
	}
	convertServerTimestamp(e, t) {
		switch (t) {
			case "previous":
				let n = Hd(e);
				return n == null ? null : this.convertValue(n, t);
			case "estimate": return this.convertTimestamp(Ud(e));
			default: return null;
		}
	}
	convertTimestamp(e) {
		let t = Rd(e);
		return new td(t.seconds, t.nanos);
	}
	convertDocumentKey(e, t) {
		let n = rd.fromString(e);
		A(Zm(n));
		let r = new Gd(n.get(1), n.get(3)), i = new I(n.popFirst(5));
		return r.isEqual(t) || Bu(`Document ${i} contains a document reference within a different database (${r.projectId}/${r.database}) which is not supported. It will be treated as a reference in the current database (${t.projectId}/${t.database}) instead.`), i;
	}
};
function Wv(e, t, n) {
	let r;
	return r = e ? n && (n.merge || n.mergeFields) ? e.toFirestore(t, n) : e.toFirestore(t) : t, r;
}
var Gv = class {
	constructor(e, t) {
		this.hasPendingWrites = e, this.fromCache = t;
	}
	isEqual(e) {
		return this.hasPendingWrites === e.hasPendingWrites && this.fromCache === e.fromCache;
	}
}, Kv = class extends Cv {
	constructor(e, t, n, r, i, a) {
		super(e, t, n, r, a), this._firestore = e, this._firestoreImpl = e, this.metadata = i;
	}
	exists() {
		return super.exists();
	}
	data(e = {}) {
		if (this._document) {
			if (this._converter) {
				let t = new qv(this._firestore, this._userDataWriter, this._key, this._document, this.metadata, null);
				return this._converter.fromFirestore(t, e);
			}
			return this._userDataWriter.convertValue(this._document.data.value, e.serverTimestamps);
		}
	}
	get(e, t = {}) {
		if (this._document) {
			let n = this._document.data.field(Tv("DocumentSnapshot.get", e));
			if (n !== null) return this._userDataWriter.convertValue(n, t.serverTimestamps);
		}
	}
}, qv = class extends Kv {
	data(e = {}) {
		return super.data(e);
	}
}, Jv = class {
	constructor(e, t, n, r) {
		this._firestore = e, this._userDataWriter = t, this._snapshot = r, this.metadata = new Gv(r.hasPendingWrites, r.fromCache), this.query = n;
	}
	get docs() {
		let e = [];
		return this.forEach(((t) => e.push(t))), e;
	}
	get size() {
		return this._snapshot.docs.size;
	}
	get empty() {
		return this.size === 0;
	}
	forEach(e, t) {
		this._snapshot.docs.forEach(((n) => {
			e.call(t, new qv(this._firestore, this._userDataWriter, n.key, n, new Gv(this._snapshot.mutatedKeys.has(n.key), this._snapshot.fromCache), this.query.converter));
		}));
	}
	docChanges(e = {}) {
		let t = !!e.includeMetadataChanges;
		if (t && this._snapshot.excludesMetadataChanges) throw new N(M.INVALID_ARGUMENT, "To include metadata changes with your document changes, you must also pass { includeMetadataChanges:true } to onSnapshot().");
		return this._cachedChanges && this._cachedChangesIncludeMetadataChanges === t || (this._cachedChanges = function(e, t) {
			if (e._snapshot.oldDocs.isEmpty()) {
				let t = 0;
				return e._snapshot.docChanges.map(((n) => {
					let r = new qv(e._firestore, e._userDataWriter, n.doc.key, n.doc, new Gv(e._snapshot.mutatedKeys.has(n.doc.key), e._snapshot.fromCache), e.query.converter);
					return n.doc, {
						type: "added",
						doc: r,
						oldIndex: -1,
						newIndex: t++
					};
				}));
			}
			{
				let n = e._snapshot.oldDocs;
				return e._snapshot.docChanges.filter(((e) => t || e.type !== 3)).map(((t) => {
					let r = new qv(e._firestore, e._userDataWriter, t.doc.key, t.doc, new Gv(e._snapshot.mutatedKeys.has(t.doc.key), e._snapshot.fromCache), e.query.converter), i = -1, a = -1;
					return t.type !== 0 && (i = n.indexOf(t.doc.key), n = n.delete(t.doc.key)), t.type !== 1 && (n = n.add(t.doc), a = n.indexOf(t.doc.key)), {
						type: Yv(t.type),
						doc: r,
						oldIndex: i,
						newIndex: a
					};
				}));
			}
		}(this, t), this._cachedChangesIncludeMetadataChanges = t), this._cachedChanges;
	}
};
function Yv(e) {
	switch (e) {
		case 0: return "added";
		case 2:
		case 3: return "modified";
		case 1: return "removed";
		default: return k();
	}
}
var Xv = class extends Uv {
	constructor(e) {
		super(), this.firestore = e;
	}
	convertBytes(e) {
		return new tv(e);
	}
	convertReference(e) {
		let t = this.convertDocumentKey(e, this.firestore._databaseId);
		return new G_(this.firestore, null, t);
	}
};
function Zv(e) {
	e = z_(e, G_);
	let t = z_(e.firestore, Z_);
	return A_($_(t), e._key, { source: "server" }).then(((n) => ry(t, e, n)));
}
function Qv(e) {
	e = z_(e, W_);
	let t = z_(e.firestore, Z_), n = $_(t), r = new Xv(t);
	return Ev(e._query), j_(n, e._query).then(((n) => new Jv(t, r, e, n)));
}
function $v(e, t, n) {
	e = z_(e, G_);
	let r = z_(e.firestore, Z_), i = Wv(e.converter, t, n);
	return ny(r, [dv(uv(r), "setDoc", e._key, i, e.converter !== null, n).toMutation(e._key, Np.none())]);
}
function ey(e) {
	return ny(z_(e.firestore, Z_), [new Kp(e._key, Np.none())]);
}
function ty(e, ...t) {
	e = _(e);
	let n = {
		includeMetadataChanges: !1,
		source: "default"
	}, r = 0;
	typeof t[r] != "object" || X_(t[r]) || (n = t[r], r++);
	let i = {
		includeMetadataChanges: n.includeMetadataChanges,
		source: n.source
	};
	if (X_(t[r])) {
		let e = t[r];
		t[r] = e.next?.bind(e), t[r + 1] = e.error?.bind(e), t[r + 2] = e.complete?.bind(e);
	}
	let a, o, s;
	if (e instanceof G_) o = z_(e.firestore, Z_), s = Vf(e._key.path), a = {
		next: (n) => {
			t[r] && t[r](ry(o, e, n));
		},
		error: t[r + 1],
		complete: t[r + 2]
	};
	else {
		let n = z_(e, W_);
		o = z_(n.firestore, Z_), s = n._query;
		let i = new Xv(o);
		a = {
			next: (e) => {
				t[r] && t[r](new Jv(o, i, n, e));
			},
			error: t[r + 1],
			complete: t[r + 2]
		}, Ev(e._query);
	}
	return function(e, t, n, r) {
		let i = new x_(r), a = new Hg(t, i, n);
		return e.asyncQueue.enqueueAndForget((async () => Fg(await k_(e), a))), () => {
			i.Qa(), e.asyncQueue.enqueueAndForget((async () => Ig(await k_(e), a)));
		};
	}($_(o), s, i, a);
}
function ny(e, t) {
	return function(e, t) {
		let n = new Uu();
		return e.asyncQueue.enqueueAndForget((async () => t_(await O_(e), t, n))), n.promise;
	}($_(e), t);
}
function ry(e, t, n) {
	let r = n.docs.get(t._key);
	return new Kv(e, new Xv(e), t._key, r, new Gv(n.hasPendingWrites, n.fromCache), t.converter);
}
function iy() {
	return new fv("serverTimestamp");
}
(function(e, t = !0) {
	(function(e) {
		Lu = e;
	})(Gt), Bt(new we("firestore", ((e, { instanceIdentifier: n, options: r }) => {
		let i = e.getProvider("app").getImmediate(), a = new Z_(new qu(e.getProvider("auth-internal")), new Zu(e.getProvider("app-check-internal")), function(e, t) {
			if (!Object.prototype.hasOwnProperty.apply(e.options, ["projectId"])) throw new N(M.INVALID_ARGUMENT, "\"projectId\" not provided in firebase.initializeApp.");
			return new Gd(e.options.projectId, t);
		}(i, n), i);
		return r = Object.assign({ useFetchStreams: t }, r), a._setSettings(r), a;
	}), "PUBLIC").setMultipleInstances(!0)), x(Fu, "4.5.1", e), x(Fu, "4.5.1", "esm2017");
})();
//#endregion
//#region node_modules/@firebase/storage/dist/index.esm2017.js
var ay = "firebasestorage.googleapis.com", oy = "storageBucket", sy = 12e4, cy = 6e5, ly = 1e3, uy = class e extends pe {
	constructor(t, n, r = 0) {
		super(dy(t), `Firebase Storage: ${n} (${dy(t)})`), this.status_ = r, this.customData = { serverResponse: null }, this._baseMessage = this.message, Object.setPrototypeOf(this, e.prototype);
	}
	get status() {
		return this.status_;
	}
	set status(e) {
		this.status_ = e;
	}
	_codeEquals(e) {
		return dy(e) === this.code;
	}
	get serverResponse() {
		return this.customData.serverResponse;
	}
	set serverResponse(e) {
		this.customData.serverResponse = e, this.message = this.customData.serverResponse ? `${this._baseMessage}\n${this.customData.serverResponse}` : this._baseMessage;
	}
}, B;
(function(e) {
	e.UNKNOWN = "unknown", e.OBJECT_NOT_FOUND = "object-not-found", e.BUCKET_NOT_FOUND = "bucket-not-found", e.PROJECT_NOT_FOUND = "project-not-found", e.QUOTA_EXCEEDED = "quota-exceeded", e.UNAUTHENTICATED = "unauthenticated", e.UNAUTHORIZED = "unauthorized", e.UNAUTHORIZED_APP = "unauthorized-app", e.RETRY_LIMIT_EXCEEDED = "retry-limit-exceeded", e.INVALID_CHECKSUM = "invalid-checksum", e.CANCELED = "canceled", e.INVALID_EVENT_NAME = "invalid-event-name", e.INVALID_URL = "invalid-url", e.INVALID_DEFAULT_BUCKET = "invalid-default-bucket", e.NO_DEFAULT_BUCKET = "no-default-bucket", e.CANNOT_SLICE_BLOB = "cannot-slice-blob", e.SERVER_FILE_WRONG_SIZE = "server-file-wrong-size", e.NO_DOWNLOAD_URL = "no-download-url", e.INVALID_ARGUMENT = "invalid-argument", e.INVALID_ARGUMENT_COUNT = "invalid-argument-count", e.APP_DELETED = "app-deleted", e.INVALID_ROOT_OPERATION = "invalid-root-operation", e.INVALID_FORMAT = "invalid-format", e.INTERNAL_ERROR = "internal-error", e.UNSUPPORTED_ENVIRONMENT = "unsupported-environment";
})(B ||= {});
function dy(e) {
	return "storage/" + e;
}
function fy() {
	return new uy(B.UNKNOWN, "An unknown error occurred, please check the error payload for server response.");
}
function py(e) {
	return new uy(B.OBJECT_NOT_FOUND, "Object '" + e + "' does not exist.");
}
function my(e) {
	return new uy(B.QUOTA_EXCEEDED, "Quota for bucket '" + e + "' exceeded, please view quota on https://firebase.google.com/pricing/.");
}
function hy() {
	return new uy(B.UNAUTHENTICATED, "User is not authenticated, please authenticate using Firebase Authentication and try again.");
}
function gy() {
	return new uy(B.UNAUTHORIZED_APP, "This app does not have permission to access Firebase Storage on this project.");
}
function _y(e) {
	return new uy(B.UNAUTHORIZED, "User does not have permission to access '" + e + "'.");
}
function vy() {
	return new uy(B.RETRY_LIMIT_EXCEEDED, "Max retry time for operation exceeded, please try again.");
}
function yy() {
	return new uy(B.CANCELED, "User canceled the upload/download.");
}
function by(e) {
	return new uy(B.INVALID_URL, "Invalid URL '" + e + "'.");
}
function xy(e) {
	return new uy(B.INVALID_DEFAULT_BUCKET, "Invalid default bucket '" + e + "'.");
}
function Sy() {
	return new uy(B.NO_DEFAULT_BUCKET, "No default bucket found. Did you set the 'storageBucket' property when initializing the app?");
}
function Cy() {
	return new uy(B.CANNOT_SLICE_BLOB, "Cannot slice blob for upload. Please retry the upload.");
}
function wy() {
	return new uy(B.SERVER_FILE_WRONG_SIZE, "Server recorded incorrect upload file size, please retry the upload.");
}
function Ty() {
	return new uy(B.NO_DOWNLOAD_URL, "The given file does not have any download URLs.");
}
function Ey(e) {
	return new uy(B.UNSUPPORTED_ENVIRONMENT, `${e} is missing. Make sure to install the required polyfills. See https://firebase.google.com/docs/web/environments-js-sdk#polyfills for more information.`);
}
function Dy(e) {
	return new uy(B.INVALID_ARGUMENT, e);
}
function Oy() {
	return new uy(B.APP_DELETED, "The Firebase app was deleted.");
}
function ky(e) {
	return new uy(B.INVALID_ROOT_OPERATION, "The operation '" + e + "' cannot be performed on a root reference, create a non-root reference using child, such as .child('file.png').");
}
function Ay(e, t) {
	return new uy(B.INVALID_FORMAT, "String does not match format '" + e + "': " + t);
}
function jy(e) {
	throw new uy(B.INTERNAL_ERROR, "Internal error: " + e);
}
var My = class e {
	constructor(e, t) {
		this.bucket = e, this.path_ = t;
	}
	get path() {
		return this.path_;
	}
	get isRoot() {
		return this.path.length === 0;
	}
	fullServerUrl() {
		let e = encodeURIComponent;
		return "/b/" + e(this.bucket) + "/o/" + e(this.path);
	}
	bucketOnlyServerUrl() {
		return "/b/" + encodeURIComponent(this.bucket) + "/o";
	}
	static makeFromBucketSpec(t, n) {
		let r;
		try {
			r = e.makeFromUrl(t, n);
		} catch {
			return new e(t, "");
		}
		if (r.path === "") return r;
		throw xy(t);
	}
	static makeFromUrl(t, n) {
		let r = null, i = "([A-Za-z0-9.\\-_]+)";
		function a(e) {
			e.path.charAt(e.path.length - 1) === "/" && (e.path_ = e.path_.slice(0, -1));
		}
		let o = RegExp("^gs://" + i + "(/(.*))?$", "i"), s = {
			bucket: 1,
			path: 3
		};
		function c(e) {
			e.path_ = decodeURIComponent(e.path);
		}
		let l = n.replace(/[.]/g, "\\."), u = RegExp(`^https?://${l}/v[A-Za-z0-9_]+/b/${i}/o(/([^?#]*).*)?\$`, "i"), d = {
			bucket: 1,
			path: 3
		}, f = RegExp(`^https?://${n === ay ? "(?:storage.googleapis.com|storage.cloud.google.com)" : n}/${i}/([^?#]*)`, "i"), p = [
			{
				regex: o,
				indices: s,
				postModify: a
			},
			{
				regex: u,
				indices: d,
				postModify: c
			},
			{
				regex: f,
				indices: {
					bucket: 1,
					path: 2
				},
				postModify: c
			}
		];
		for (let n = 0; n < p.length; n++) {
			let i = p[n], a = i.regex.exec(t);
			if (a) {
				let t = a[i.indices.bucket], n = a[i.indices.path];
				n ||= "", r = new e(t, n), i.postModify(r);
				break;
			}
		}
		if (r == null) throw by(t);
		return r;
	}
}, Ny = class {
	constructor(e) {
		this.promise_ = Promise.reject(e);
	}
	getPromise() {
		return this.promise_;
	}
	cancel(e = !1) {}
};
function Py(e, t, n) {
	let r = 1, i = null, a = null, o = !1, s = 0;
	function c() {
		return s === 2;
	}
	let l = !1;
	function u(...e) {
		l || (l = !0, t.apply(null, e));
	}
	function d(t) {
		i = setTimeout(() => {
			i = null, e(p, c());
		}, t);
	}
	function f() {
		a && clearTimeout(a);
	}
	function p(e, ...t) {
		if (l) {
			f();
			return;
		}
		if (e) {
			f(), u.call(null, e, ...t);
			return;
		}
		if (c() || o) {
			f(), u.call(null, e, ...t);
			return;
		}
		r < 64 && (r *= 2);
		let n;
		s === 1 ? (s = 2, n = 0) : n = (r + Math.random()) * 1e3, d(n);
	}
	let m = !1;
	function ee(e) {
		m || (m = !0, f(), !l && (i === null ? e || (s = 1) : (e || (s = 2), clearTimeout(i), d(0))));
	}
	return d(0), a = setTimeout(() => {
		o = !0, ee(!0);
	}, n), ee;
}
function Fy(e) {
	e(!1);
}
function Iy(e) {
	return e !== void 0;
}
function Ly(e) {
	return typeof e == "function";
}
function Ry(e) {
	return typeof e == "object" && !Array.isArray(e);
}
function zy(e) {
	return typeof e == "string" || e instanceof String;
}
function By(e) {
	return Vy() && e instanceof Blob;
}
function Vy() {
	return typeof Blob < "u";
}
function Hy(e, t, n, r) {
	if (r < t) throw Dy(`Invalid value for '${e}'. Expected ${t} or greater.`);
	if (r > n) throw Dy(`Invalid value for '${e}'. Expected ${n} or less.`);
}
function Uy(e, t, n) {
	let r = t;
	return n ?? (r = `https://${t}`), `${n}://${r}/v0${e}`;
}
function Wy(e) {
	let t = encodeURIComponent, n = "?";
	for (let r in e) if (e.hasOwnProperty(r)) {
		let i = t(r) + "=" + t(e[r]);
		n = n + i + "&";
	}
	return n = n.slice(0, -1), n;
}
var Gy;
(function(e) {
	e[e.NO_ERROR = 0] = "NO_ERROR", e[e.NETWORK_ERROR = 1] = "NETWORK_ERROR", e[e.ABORT = 2] = "ABORT";
})(Gy ||= {});
function Ky(e, t) {
	let n = e >= 500 && e < 600, r = [408, 429].indexOf(e) !== -1, i = t.indexOf(e) !== -1;
	return n || r || i;
}
var qy = class {
	constructor(e, t, n, r, i, a, o, s, c, l, u, d = !0) {
		this.url_ = e, this.method_ = t, this.headers_ = n, this.body_ = r, this.successCodes_ = i, this.additionalRetryCodes_ = a, this.callback_ = o, this.errorCallback_ = s, this.timeout_ = c, this.progressCallback_ = l, this.connectionFactory_ = u, this.retry = d, this.pendingConnection_ = null, this.backoffId_ = null, this.canceled_ = !1, this.appDelete_ = !1, this.promise_ = new Promise((e, t) => {
			this.resolve_ = e, this.reject_ = t, this.start_();
		});
	}
	start_() {
		let e = (e, t) => {
			if (t) {
				e(!1, new Jy(!1, null, !0));
				return;
			}
			let n = this.connectionFactory_();
			this.pendingConnection_ = n;
			let r = (e) => {
				let t = e.loaded, n = e.lengthComputable ? e.total : -1;
				this.progressCallback_ !== null && this.progressCallback_(t, n);
			};
			this.progressCallback_ !== null && n.addUploadProgressListener(r), n.send(this.url_, this.method_, this.body_, this.headers_).then(() => {
				this.progressCallback_ !== null && n.removeUploadProgressListener(r), this.pendingConnection_ = null;
				let t = n.getErrorCode() === Gy.NO_ERROR, i = n.getStatus();
				if (!t || Ky(i, this.additionalRetryCodes_) && this.retry) {
					e(!1, new Jy(!1, null, n.getErrorCode() === Gy.ABORT));
					return;
				}
				e(!0, new Jy(this.successCodes_.indexOf(i) !== -1, n));
			});
		}, t = (e, t) => {
			let n = this.resolve_, r = this.reject_, i = t.connection;
			if (t.wasSuccessCode) try {
				let e = this.callback_(i, i.getResponse());
				Iy(e) ? n(e) : n();
			} catch (e) {
				r(e);
			}
			else if (i !== null) {
				let e = fy();
				e.serverResponse = i.getErrorText(), this.errorCallback_ ? r(this.errorCallback_(i, e)) : r(e);
			} else t.canceled ? r(this.appDelete_ ? Oy() : yy()) : r(vy());
		};
		this.canceled_ ? t(!1, new Jy(!1, null, !0)) : this.backoffId_ = Py(e, t, this.timeout_);
	}
	getPromise() {
		return this.promise_;
	}
	cancel(e) {
		this.canceled_ = !0, this.appDelete_ = e || !1, this.backoffId_ !== null && Fy(this.backoffId_), this.pendingConnection_ !== null && this.pendingConnection_.abort();
	}
}, Jy = class {
	constructor(e, t, n) {
		this.wasSuccessCode = e, this.connection = t, this.canceled = !!n;
	}
};
function Yy(e, t) {
	t !== null && t.length > 0 && (e.Authorization = "Firebase " + t);
}
function Xy(e, t) {
	e["X-Firebase-Storage-Version"] = "webjs/" + (t ?? "AppManager");
}
function Zy(e, t) {
	t && (e["X-Firebase-GMPID"] = t);
}
function Qy(e, t) {
	t !== null && (e["X-Firebase-AppCheck"] = t);
}
function $y(e, t, n, r, i, a, o = !0) {
	let s = Wy(e.urlParams), c = e.url + s, l = Object.assign({}, e.headers);
	return Zy(l, t), Yy(l, n), Xy(l, a), Qy(l, r), new qy(c, e.method, l, e.body, e.successCodes, e.additionalRetryCodes, e.handler, e.errorHandler, e.timeout, e.progressCallback, i, o);
}
function eb() {
	if (typeof BlobBuilder < "u") return BlobBuilder;
	if (typeof WebKitBlobBuilder < "u") return WebKitBlobBuilder;
}
function tb(...e) {
	let t = eb();
	if (t !== void 0) {
		let n = new t();
		for (let t = 0; t < e.length; t++) n.append(e[t]);
		return n.getBlob();
	}
	if (Vy()) return new Blob(e);
	throw new uy(B.UNSUPPORTED_ENVIRONMENT, "This browser doesn't seem to support creating Blobs");
}
function nb(e, t, n) {
	return e.webkitSlice ? e.webkitSlice(t, n) : e.mozSlice ? e.mozSlice(t, n) : e.slice ? e.slice(t, n) : null;
}
function rb(e) {
	if (typeof atob > "u") throw Ey("base-64");
	return atob(e);
}
var ib = {
	RAW: "raw",
	BASE64: "base64",
	BASE64URL: "base64url",
	DATA_URL: "data_url"
}, ab = class {
	constructor(e, t) {
		this.data = e, this.contentType = t || null;
	}
};
function ob(e, t) {
	switch (e) {
		case ib.RAW: return new ab(sb(t));
		case ib.BASE64:
		case ib.BASE64URL: return new ab(lb(e, t));
		case ib.DATA_URL: return new ab(db(t), fb(t));
	}
	throw fy();
}
function sb(e) {
	let t = [];
	for (let n = 0; n < e.length; n++) {
		let r = e.charCodeAt(n);
		if (r <= 127) t.push(r);
		else if (r <= 2047) t.push(192 | r >> 6, 128 | r & 63);
		else if ((r & 64512) == 55296) {
			if (!(n < e.length - 1 && (e.charCodeAt(n + 1) & 64512) == 56320)) t.push(239, 191, 189);
			else {
				let i = r, a = e.charCodeAt(++n);
				r = 65536 | (i & 1023) << 10 | a & 1023, t.push(240 | r >> 18, 128 | r >> 12 & 63, 128 | r >> 6 & 63, 128 | r & 63);
			}
		} else (r & 64512) == 56320 ? t.push(239, 191, 189) : t.push(224 | r >> 12, 128 | r >> 6 & 63, 128 | r & 63);
	}
	return new Uint8Array(t);
}
function cb(e) {
	let t;
	try {
		t = decodeURIComponent(e);
	} catch {
		throw Ay(ib.DATA_URL, "Malformed data URL.");
	}
	return sb(t);
}
function lb(e, t) {
	switch (e) {
		case ib.BASE64: {
			let n = t.indexOf("-") !== -1, r = t.indexOf("_") !== -1;
			if (n || r) throw Ay(e, "Invalid character '" + (n ? "-" : "_") + "' found: is it base64url encoded?");
			break;
		}
		case ib.BASE64URL: {
			let n = t.indexOf("+") !== -1, r = t.indexOf("/") !== -1;
			if (n || r) throw Ay(e, "Invalid character '" + (n ? "+" : "/") + "' found: is it base64 encoded?");
			t = t.replace(/-/g, "+").replace(/_/g, "/");
			break;
		}
	}
	let n;
	try {
		n = rb(t);
	} catch (t) {
		throw t.message.includes("polyfill") ? t : Ay(e, "Invalid character found");
	}
	let r = new Uint8Array(n.length);
	for (let e = 0; e < n.length; e++) r[e] = n.charCodeAt(e);
	return r;
}
var ub = class {
	constructor(e) {
		this.base64 = !1, this.contentType = null;
		let t = e.match(/^data:([^,]+)?,/);
		if (t === null) throw Ay(ib.DATA_URL, "Must be formatted 'data:[<mediatype>][;base64],<data>");
		let n = t[1] || null;
		n != null && (this.base64 = pb(n, ";base64"), this.contentType = this.base64 ? n.substring(0, n.length - 7) : n), this.rest = e.substring(e.indexOf(",") + 1);
	}
};
function db(e) {
	let t = new ub(e);
	return t.base64 ? lb(ib.BASE64, t.rest) : cb(t.rest);
}
function fb(e) {
	return new ub(e).contentType;
}
function pb(e, t) {
	return e.length >= t.length && e.substring(e.length - t.length) === t;
}
var mb = class e {
	constructor(e, t) {
		let n = 0, r = "";
		By(e) ? (this.data_ = e, n = e.size, r = e.type) : e instanceof ArrayBuffer ? (t ? this.data_ = new Uint8Array(e) : (this.data_ = new Uint8Array(e.byteLength), this.data_.set(new Uint8Array(e))), n = this.data_.length) : e instanceof Uint8Array && (t ? this.data_ = e : (this.data_ = new Uint8Array(e.length), this.data_.set(e)), n = e.length), this.size_ = n, this.type_ = r;
	}
	size() {
		return this.size_;
	}
	type() {
		return this.type_;
	}
	slice(t, n) {
		if (By(this.data_)) {
			let r = this.data_, i = nb(r, t, n);
			return i === null ? null : new e(i);
		}
		{
			let r = new Uint8Array(this.data_.buffer, t, n - t);
			return new e(r, !0);
		}
	}
	static getBlob(...t) {
		if (Vy()) {
			let n = t.map((t) => t instanceof e ? t.data_ : t);
			return new e(tb.apply(null, n));
		}
		{
			let n = t.map((e) => zy(e) ? ob(ib.RAW, e).data : e.data_), r = 0;
			n.forEach((e) => {
				r += e.byteLength;
			});
			let i = new Uint8Array(r), a = 0;
			return n.forEach((e) => {
				for (let t = 0; t < e.length; t++) i[a++] = e[t];
			}), new e(i, !0);
		}
	}
	uploadData() {
		return this.data_;
	}
};
function hb(e) {
	let t;
	try {
		t = JSON.parse(e);
	} catch {
		return null;
	}
	return Ry(t) ? t : null;
}
function gb(e) {
	if (e.length === 0) return null;
	let t = e.lastIndexOf("/");
	return t === -1 ? "" : e.slice(0, t);
}
function _b(e, t) {
	let n = t.split("/").filter((e) => e.length > 0).join("/");
	return e.length === 0 ? n : e + "/" + n;
}
function vb(e) {
	let t = e.lastIndexOf("/", e.length - 2);
	return t === -1 ? e : e.slice(t + 1);
}
function yb(e, t) {
	return t;
}
var bb = class {
	constructor(e, t, n, r) {
		this.server = e, this.local = t || e, this.writable = !!n, this.xform = r || yb;
	}
}, xb = null;
function Sb(e) {
	return !zy(e) || e.length < 2 ? e : vb(e);
}
function Cb() {
	if (xb) return xb;
	let e = [];
	e.push(new bb("bucket")), e.push(new bb("generation")), e.push(new bb("metageneration")), e.push(new bb("name", "fullPath", !0));
	function t(e, t) {
		return Sb(t);
	}
	let n = new bb("name");
	n.xform = t, e.push(n);
	function r(e, t) {
		return t === void 0 ? t : Number(t);
	}
	let i = new bb("size");
	return i.xform = r, e.push(i), e.push(new bb("timeCreated")), e.push(new bb("updated")), e.push(new bb("md5Hash", null, !0)), e.push(new bb("cacheControl", null, !0)), e.push(new bb("contentDisposition", null, !0)), e.push(new bb("contentEncoding", null, !0)), e.push(new bb("contentLanguage", null, !0)), e.push(new bb("contentType", null, !0)), e.push(new bb("metadata", "customMetadata", !0)), xb = e, xb;
}
function wb(e, t) {
	function n() {
		let n = e.bucket, r = e.fullPath, i = new My(n, r);
		return t._makeStorageReference(i);
	}
	Object.defineProperty(e, "ref", { get: n });
}
function Tb(e, t, n) {
	let r = {};
	r.type = "file";
	let i = n.length;
	for (let e = 0; e < i; e++) {
		let i = n[e];
		r[i.local] = i.xform(r, t[i.server]);
	}
	return wb(r, e), r;
}
function Eb(e, t, n) {
	let r = hb(t);
	return r === null ? null : Tb(e, r, n);
}
function Db(e, t, n, r) {
	let i = hb(t);
	if (i === null || !zy(i.downloadTokens)) return null;
	let a = i.downloadTokens;
	if (a.length === 0) return null;
	let o = encodeURIComponent;
	return a.split(",").map((t) => {
		let i = e.bucket, a = e.fullPath;
		return Uy("/b/" + o(i) + "/o/" + o(a), n, r) + Wy({
			alt: "media",
			token: t
		});
	})[0];
}
function Ob(e, t) {
	let n = {}, r = t.length;
	for (let i = 0; i < r; i++) {
		let r = t[i];
		r.writable && (n[r.server] = e[r.local]);
	}
	return JSON.stringify(n);
}
var kb = class {
	constructor(e, t, n, r) {
		this.url = e, this.method = t, this.handler = n, this.timeout = r, this.urlParams = {}, this.headers = {}, this.body = null, this.errorHandler = null, this.progressCallback = null, this.successCodes = [200], this.additionalRetryCodes = [];
	}
};
function Ab(e) {
	if (!e) throw fy();
}
function jb(e, t) {
	function n(n, r) {
		let i = Eb(e, r, t);
		return Ab(i !== null), i;
	}
	return n;
}
function Mb(e, t) {
	function n(n, r) {
		let i = Eb(e, r, t);
		return Ab(i !== null), Db(i, r, e.host, e._protocol);
	}
	return n;
}
function Nb(e) {
	function t(t, n) {
		let r;
		return r = t.getStatus() === 401 ? t.getErrorText().includes("Firebase App Check token is invalid") ? gy() : hy() : t.getStatus() === 402 ? my(e.bucket) : t.getStatus() === 403 ? _y(e.path) : n, r.status = t.getStatus(), r.serverResponse = n.serverResponse, r;
	}
	return t;
}
function Pb(e) {
	let t = Nb(e);
	function n(n, r) {
		let i = t(n, r);
		return n.getStatus() === 404 && (i = py(e.path)), i.serverResponse = r.serverResponse, i;
	}
	return n;
}
function Fb(e, t, n) {
	let r = Uy(t.fullServerUrl(), e.host, e._protocol), i = e.maxOperationRetryTime, a = new kb(r, "GET", jb(e, n), i);
	return a.errorHandler = Pb(t), a;
}
function Ib(e, t, n) {
	let r = Uy(t.fullServerUrl(), e.host, e._protocol), i = e.maxOperationRetryTime, a = new kb(r, "GET", Mb(e, n), i);
	return a.errorHandler = Pb(t), a;
}
function Lb(e, t) {
	return e && e.contentType || t && t.type() || "application/octet-stream";
}
function Rb(e, t, n) {
	let r = Object.assign({}, n);
	return r.fullPath = e.path, r.size = t.size(), r.contentType ||= Lb(null, t), r;
}
function zb(e, t, n, r, i) {
	let a = t.bucketOnlyServerUrl(), o = { "X-Goog-Upload-Protocol": "multipart" };
	function s() {
		let e = "";
		for (let t = 0; t < 2; t++) e += Math.random().toString().slice(2);
		return e;
	}
	let c = s();
	o["Content-Type"] = "multipart/related; boundary=" + c;
	let l = Rb(t, r, i), u = Ob(l, n), d = "--" + c + "\r\nContent-Type: application/json; charset=utf-8\r\n\r\n" + u + "\r\n--" + c + "\r\nContent-Type: " + l.contentType + "\r\n\r\n", f = "\r\n--" + c + "--", p = mb.getBlob(d, r, f);
	if (p === null) throw Cy();
	let m = { name: l.fullPath }, ee = Uy(a, e.host, e._protocol), te = e.maxUploadRetryTime, ne = new kb(ee, "POST", jb(e, n), te);
	return ne.urlParams = m, ne.headers = o, ne.body = p.uploadData(), ne.errorHandler = Nb(t), ne;
}
var Bb = class {
	constructor(e, t, n, r) {
		this.current = e, this.total = t, this.finalized = !!n, this.metadata = r || null;
	}
};
function Vb(e, t) {
	let n = null;
	try {
		n = e.getResponseHeader("X-Goog-Upload-Status");
	} catch {
		Ab(!1);
	}
	return Ab(!!n && (t || ["active"]).indexOf(n) !== -1), n;
}
function Hb(e, t, n, r, i) {
	let a = t.bucketOnlyServerUrl(), o = Rb(t, r, i), s = { name: o.fullPath }, c = Uy(a, e.host, e._protocol), l = {
		"X-Goog-Upload-Protocol": "resumable",
		"X-Goog-Upload-Command": "start",
		"X-Goog-Upload-Header-Content-Length": `${r.size()}`,
		"X-Goog-Upload-Header-Content-Type": o.contentType,
		"Content-Type": "application/json; charset=utf-8"
	}, u = Ob(o, n), d = e.maxUploadRetryTime;
	function f(e) {
		Vb(e);
		let t;
		try {
			t = e.getResponseHeader("X-Goog-Upload-URL");
		} catch {
			Ab(!1);
		}
		return Ab(zy(t)), t;
	}
	let p = new kb(c, "POST", f, d);
	return p.urlParams = s, p.headers = l, p.body = u, p.errorHandler = Nb(t), p;
}
function Ub(e, t, n, r) {
	let i = { "X-Goog-Upload-Command": "query" };
	function a(e) {
		let t = Vb(e, ["active", "final"]), n = null;
		try {
			n = e.getResponseHeader("X-Goog-Upload-Size-Received");
		} catch {
			Ab(!1);
		}
		n || Ab(!1);
		let i = Number(n);
		return Ab(!isNaN(i)), new Bb(i, r.size(), t === "final");
	}
	let o = e.maxUploadRetryTime, s = new kb(n, "POST", a, o);
	return s.headers = i, s.errorHandler = Nb(t), s;
}
var Wb = 262144;
function Gb(e, t, n, r, i, a, o, s) {
	let c = new Bb(0, 0);
	if (o ? (c.current = o.current, c.total = o.total) : (c.current = 0, c.total = r.size()), r.size() !== c.total) throw wy();
	let l = c.total - c.current, u = l;
	i > 0 && (u = Math.min(u, i));
	let d = c.current, f = d + u, p = "";
	p = u === 0 ? "finalize" : l === u ? "upload, finalize" : "upload";
	let m = {
		"X-Goog-Upload-Command": p,
		"X-Goog-Upload-Offset": `${c.current}`
	}, ee = r.slice(d, f);
	if (ee === null) throw Cy();
	function te(e, n) {
		let i = Vb(e, ["active", "final"]), o = c.current + u, s = r.size(), l;
		return l = i === "final" ? jb(t, a)(e, n) : null, new Bb(o, s, i === "final", l);
	}
	let ne = t.maxUploadRetryTime, h = new kb(n, "POST", te, ne);
	return h.headers = m, h.body = ee.uploadData(), h.progressCallback = s || null, h.errorHandler = Nb(e), h;
}
var Kb = {
	RUNNING: "running",
	PAUSED: "paused",
	SUCCESS: "success",
	CANCELED: "canceled",
	ERROR: "error"
};
function qb(e) {
	switch (e) {
		case "running":
		case "pausing":
		case "canceling": return Kb.RUNNING;
		case "paused": return Kb.PAUSED;
		case "success": return Kb.SUCCESS;
		case "canceled": return Kb.CANCELED;
		case "error": return Kb.ERROR;
		default: return Kb.ERROR;
	}
}
var Jb = class {
	constructor(e, t, n) {
		if (Ly(e) || t != null || n != null) this.next = e, this.error = t ?? void 0, this.complete = n ?? void 0;
		else {
			let t = e;
			this.next = t.next, this.error = t.error, this.complete = t.complete;
		}
	}
};
function Yb(e) {
	return (...t) => {
		Promise.resolve().then(() => e(...t));
	};
}
var Xb = class {
	constructor() {
		this.sent_ = !1, this.xhr_ = new XMLHttpRequest(), this.initXhr(), this.errorCode_ = Gy.NO_ERROR, this.sendPromise_ = new Promise((e) => {
			this.xhr_.addEventListener("abort", () => {
				this.errorCode_ = Gy.ABORT, e();
			}), this.xhr_.addEventListener("error", () => {
				this.errorCode_ = Gy.NETWORK_ERROR, e();
			}), this.xhr_.addEventListener("load", () => {
				e();
			});
		});
	}
	send(e, t, n, r) {
		if (this.sent_) throw jy("cannot .send() more than once");
		if (this.sent_ = !0, this.xhr_.open(t, e, !0), r !== void 0) for (let e in r) r.hasOwnProperty(e) && this.xhr_.setRequestHeader(e, r[e].toString());
		return n === void 0 ? this.xhr_.send() : this.xhr_.send(n), this.sendPromise_;
	}
	getErrorCode() {
		if (!this.sent_) throw jy("cannot .getErrorCode() before sending");
		return this.errorCode_;
	}
	getStatus() {
		if (!this.sent_) throw jy("cannot .getStatus() before sending");
		try {
			return this.xhr_.status;
		} catch {
			return -1;
		}
	}
	getResponse() {
		if (!this.sent_) throw jy("cannot .getResponse() before sending");
		return this.xhr_.response;
	}
	getErrorText() {
		if (!this.sent_) throw jy("cannot .getErrorText() before sending");
		return this.xhr_.statusText;
	}
	abort() {
		this.xhr_.abort();
	}
	getResponseHeader(e) {
		return this.xhr_.getResponseHeader(e);
	}
	addUploadProgressListener(e) {
		this.xhr_.upload != null && this.xhr_.upload.addEventListener("progress", e);
	}
	removeUploadProgressListener(e) {
		this.xhr_.upload != null && this.xhr_.upload.removeEventListener("progress", e);
	}
}, Zb = class extends Xb {
	initXhr() {
		this.xhr_.responseType = "text";
	}
};
function Qb() {
	return new Zb();
}
var $b = class {
	constructor(e, t, n = null) {
		this._transferred = 0, this._needToFetchStatus = !1, this._needToFetchMetadata = !1, this._observers = [], this._error = void 0, this._uploadUrl = void 0, this._request = void 0, this._chunkMultiplier = 1, this._resolve = void 0, this._reject = void 0, this._ref = e, this._blob = t, this._metadata = n, this._mappings = Cb(), this._resumable = this._shouldDoResumable(this._blob), this._state = "running", this._errorHandler = (e) => {
			if (this._request = void 0, this._chunkMultiplier = 1, e._codeEquals(B.CANCELED)) this._needToFetchStatus = !0, this.completeTransitions_();
			else {
				let t = this.isExponentialBackoffExpired();
				if (Ky(e.status, [])) {
					if (t) e = vy();
					else {
						this.sleepTime = Math.max(this.sleepTime * 2, ly), this._needToFetchStatus = !0, this.completeTransitions_();
						return;
					}
				}
				this._error = e, this._transition("error");
			}
		}, this._metadataErrorHandler = (e) => {
			this._request = void 0, e._codeEquals(B.CANCELED) ? this.completeTransitions_() : (this._error = e, this._transition("error"));
		}, this.sleepTime = 0, this.maxSleepTime = this._ref.storage.maxUploadRetryTime, this._promise = new Promise((e, t) => {
			this._resolve = e, this._reject = t, this._start();
		}), this._promise.then(null, () => {});
	}
	isExponentialBackoffExpired() {
		return this.sleepTime > this.maxSleepTime;
	}
	_makeProgressCallback() {
		let e = this._transferred;
		return (t) => this._updateProgress(e + t);
	}
	_shouldDoResumable(e) {
		return e.size() > 262144;
	}
	_start() {
		this._state === "running" && this._request === void 0 && (this._resumable ? this._uploadUrl === void 0 ? this._createResumable() : this._needToFetchStatus ? this._fetchStatus() : this._needToFetchMetadata ? this._fetchMetadata() : this.pendingTimeout = setTimeout(() => {
			this.pendingTimeout = void 0, this._continueUpload();
		}, this.sleepTime) : this._oneShotUpload());
	}
	_resolveToken(e) {
		Promise.all([this._ref.storage._getAuthToken(), this._ref.storage._getAppCheckToken()]).then(([t, n]) => {
			switch (this._state) {
				case "running":
					e(t, n);
					break;
				case "canceling":
					this._transition("canceled");
					break;
				case "pausing": this._transition("paused");
			}
		});
	}
	_createResumable() {
		this._resolveToken((e, t) => {
			let n = Hb(this._ref.storage, this._ref._location, this._mappings, this._blob, this._metadata), r = this._ref.storage._makeRequest(n, Qb, e, t);
			this._request = r, r.getPromise().then((e) => {
				this._request = void 0, this._uploadUrl = e, this._needToFetchStatus = !1, this.completeTransitions_();
			}, this._errorHandler);
		});
	}
	_fetchStatus() {
		let e = this._uploadUrl;
		this._resolveToken((t, n) => {
			let r = Ub(this._ref.storage, this._ref._location, e, this._blob), i = this._ref.storage._makeRequest(r, Qb, t, n);
			this._request = i, i.getPromise().then((e) => {
				e = e, this._request = void 0, this._updateProgress(e.current), this._needToFetchStatus = !1, e.finalized && (this._needToFetchMetadata = !0), this.completeTransitions_();
			}, this._errorHandler);
		});
	}
	_continueUpload() {
		let e = Wb * this._chunkMultiplier, t = new Bb(this._transferred, this._blob.size()), n = this._uploadUrl;
		this._resolveToken((r, i) => {
			let a;
			try {
				a = Gb(this._ref._location, this._ref.storage, n, this._blob, e, this._mappings, t, this._makeProgressCallback());
			} catch (e) {
				this._error = e, this._transition("error");
				return;
			}
			let o = this._ref.storage._makeRequest(a, Qb, r, i, !1);
			this._request = o, o.getPromise().then((e) => {
				this._increaseMultiplier(), this._request = void 0, this._updateProgress(e.current), e.finalized ? (this._metadata = e.metadata, this._transition("success")) : this.completeTransitions_();
			}, this._errorHandler);
		});
	}
	_increaseMultiplier() {
		Wb * this._chunkMultiplier * 2 < 33554432 && (this._chunkMultiplier *= 2);
	}
	_fetchMetadata() {
		this._resolveToken((e, t) => {
			let n = Fb(this._ref.storage, this._ref._location, this._mappings), r = this._ref.storage._makeRequest(n, Qb, e, t);
			this._request = r, r.getPromise().then((e) => {
				this._request = void 0, this._metadata = e, this._transition("success");
			}, this._metadataErrorHandler);
		});
	}
	_oneShotUpload() {
		this._resolveToken((e, t) => {
			let n = zb(this._ref.storage, this._ref._location, this._mappings, this._blob, this._metadata), r = this._ref.storage._makeRequest(n, Qb, e, t);
			this._request = r, r.getPromise().then((e) => {
				this._request = void 0, this._metadata = e, this._updateProgress(this._blob.size()), this._transition("success");
			}, this._errorHandler);
		});
	}
	_updateProgress(e) {
		let t = this._transferred;
		this._transferred = e, this._transferred !== t && this._notifyObservers();
	}
	_transition(e) {
		if (this._state !== e) switch (e) {
			case "canceling":
			case "pausing":
				this._state = e, this._request === void 0 ? this.pendingTimeout && (clearTimeout(this.pendingTimeout), this.pendingTimeout = void 0, this.completeTransitions_()) : this._request.cancel();
				break;
			case "running":
				let t = this._state === "paused";
				this._state = e, t && (this._notifyObservers(), this._start());
				break;
			case "paused":
				this._state = e, this._notifyObservers();
				break;
			case "canceled":
				this._error = yy(), this._state = e, this._notifyObservers();
				break;
			case "error":
				this._state = e, this._notifyObservers();
				break;
			case "success": this._state = e, this._notifyObservers();
		}
	}
	completeTransitions_() {
		switch (this._state) {
			case "pausing":
				this._transition("paused");
				break;
			case "canceling":
				this._transition("canceled");
				break;
			case "running": this._start();
		}
	}
	get snapshot() {
		let e = qb(this._state);
		return {
			bytesTransferred: this._transferred,
			totalBytes: this._blob.size(),
			state: e,
			metadata: this._metadata,
			task: this,
			ref: this._ref
		};
	}
	on(e, t, n, r) {
		let i = new Jb(t || void 0, n || void 0, r || void 0);
		return this._addObserver(i), () => {
			this._removeObserver(i);
		};
	}
	then(e, t) {
		return this._promise.then(e, t);
	}
	catch(e) {
		return this.then(null, e);
	}
	_addObserver(e) {
		this._observers.push(e), this._notifyObserver(e);
	}
	_removeObserver(e) {
		let t = this._observers.indexOf(e);
		t !== -1 && this._observers.splice(t, 1);
	}
	_notifyObservers() {
		this._finishPromise(), this._observers.slice().forEach((e) => {
			this._notifyObserver(e);
		});
	}
	_finishPromise() {
		if (this._resolve !== void 0) {
			let e = !0;
			switch (qb(this._state)) {
				case Kb.SUCCESS:
					Yb(this._resolve.bind(null, this.snapshot))();
					break;
				case Kb.CANCELED:
				case Kb.ERROR:
					let t = this._reject;
					Yb(t.bind(null, this._error))();
					break;
				default: e = !1;
			}
			e && (this._resolve = void 0, this._reject = void 0);
		}
	}
	_notifyObserver(e) {
		switch (qb(this._state)) {
			case Kb.RUNNING:
			case Kb.PAUSED:
				e.next && Yb(e.next.bind(e, this.snapshot))();
				break;
			case Kb.SUCCESS:
				e.complete && Yb(e.complete.bind(e))();
				break;
			case Kb.CANCELED:
			case Kb.ERROR:
				e.error && Yb(e.error.bind(e, this._error))();
				break;
			default: e.error && Yb(e.error.bind(e, this._error))();
		}
	}
	resume() {
		let e = this._state === "paused" || this._state === "pausing";
		return e && this._transition("running"), e;
	}
	pause() {
		let e = this._state === "running";
		return e && this._transition("pausing"), e;
	}
	cancel() {
		let e = this._state === "running" || this._state === "pausing";
		return e && this._transition("canceling"), e;
	}
}, ex = class e {
	constructor(e, t) {
		this._service = e, this._location = t instanceof My ? t : My.makeFromUrl(t, e.host);
	}
	toString() {
		return "gs://" + this._location.bucket + "/" + this._location.path;
	}
	_newRef(t, n) {
		return new e(t, n);
	}
	get root() {
		let e = new My(this._location.bucket, "");
		return this._newRef(this._service, e);
	}
	get bucket() {
		return this._location.bucket;
	}
	get fullPath() {
		return this._location.path;
	}
	get name() {
		return vb(this._location.path);
	}
	get storage() {
		return this._service;
	}
	get parent() {
		let t = gb(this._location.path);
		if (t === null) return null;
		let n = new My(this._location.bucket, t);
		return new e(this._service, n);
	}
	_throwIfRoot(e) {
		if (this._location.path === "") throw ky(e);
	}
};
function tx(e, t, n) {
	return e._throwIfRoot("uploadBytesResumable"), new $b(e, new mb(t), n);
}
function nx(e) {
	e._throwIfRoot("getDownloadURL");
	let t = Ib(e.storage, e._location, Cb());
	return e.storage.makeRequestWithTokens(t, Qb).then((e) => {
		if (e === null) throw Ty();
		return e;
	});
}
function rx(e, t) {
	let n = _b(e._location.path, t), r = new My(e._location.bucket, n);
	return new ex(e.storage, r);
}
function ix(e) {
	return /^[A-Za-z]+:\/\//.test(e);
}
function ax(e, t) {
	return new ex(e, t);
}
function ox(e, t) {
	if (e instanceof ux) {
		let n = e;
		if (n._bucket == null) throw Sy();
		let r = new ex(n, n._bucket);
		return t == null ? r : ox(r, t);
	}
	return t === void 0 ? e : rx(e, t);
}
function sx(e, t) {
	if (t && ix(t)) {
		if (e instanceof ux) return ax(e, t);
		throw Dy("To use ref(service, url), the first argument must be a Storage instance.");
	}
	return ox(e, t);
}
function cx(e, t) {
	let n = t?.[oy];
	return n == null ? null : My.makeFromBucketSpec(n, e);
}
function lx(e, t, n, r = {}) {
	e.host = `${t}:${n}`, e._protocol = "http";
	let { mockUserToken: i } = r;
	i && (e._overrideAuthToken = typeof i == "string" ? i : ne(i, e.app.options.projectId));
}
var ux = class {
	constructor(e, t, n, r, i) {
		this.app = e, this._authProvider = t, this._appCheckProvider = n, this._url = r, this._firebaseVersion = i, this._bucket = null, this._host = ay, this._protocol = "https", this._appId = null, this._deleted = !1, this._maxOperationRetryTime = sy, this._maxUploadRetryTime = cy, this._requests = /* @__PURE__ */ new Set(), this._bucket = r == null ? cx(this._host, this.app.options) : My.makeFromBucketSpec(r, this._host);
	}
	get host() {
		return this._host;
	}
	set host(e) {
		this._host = e, this._bucket = this._url == null ? cx(e, this.app.options) : My.makeFromBucketSpec(this._url, e);
	}
	get maxUploadRetryTime() {
		return this._maxUploadRetryTime;
	}
	set maxUploadRetryTime(e) {
		Hy("time", 0, Infinity, e), this._maxUploadRetryTime = e;
	}
	get maxOperationRetryTime() {
		return this._maxOperationRetryTime;
	}
	set maxOperationRetryTime(e) {
		Hy("time", 0, Infinity, e), this._maxOperationRetryTime = e;
	}
	async _getAuthToken() {
		if (this._overrideAuthToken) return this._overrideAuthToken;
		let e = this._authProvider.getImmediate({ optional: !0 });
		if (e) {
			let t = await e.getToken();
			if (t !== null) return t.accessToken;
		}
		return null;
	}
	async _getAppCheckToken() {
		let e = this._appCheckProvider.getImmediate({ optional: !0 });
		return e ? (await e.getToken()).token : null;
	}
	_delete() {
		return this._deleted || (this._deleted = !0, this._requests.forEach((e) => e.cancel()), this._requests.clear()), Promise.resolve();
	}
	_makeStorageReference(e) {
		return new ex(this, e);
	}
	_makeRequest(e, t, n, r, i = !0) {
		if (this._deleted) return new Ny(Oy());
		{
			let a = $y(e, this._appId, n, r, t, this._firebaseVersion, i);
			return this._requests.add(a), a.getPromise().then(() => this._requests.delete(a), () => this._requests.delete(a)), a;
		}
	}
	async makeRequestWithTokens(e, t) {
		let [n, r] = await Promise.all([this._getAuthToken(), this._getAppCheckToken()]);
		return this._makeRequest(e, t, n, r).getPromise();
	}
}, dx = "@firebase/storage", fx = "0.12.3", px = "storage";
function mx(e, t, n) {
	return e = _(e), tx(e, t, n);
}
function hx(e) {
	return e = _(e), nx(e);
}
function gx(e, t) {
	return e = _(e), sx(e, t);
}
function _x(e = qt(), t) {
	e = _(e);
	let n = Vt(e, px).getImmediate({ identifier: t }), r = p("storage");
	return r && vx(n, ...r), n;
}
function vx(e, t, n, r = {}) {
	lx(e, t, n, r);
}
function yx(e, { instanceIdentifier: t }) {
	return new ux(e.getProvider("app").getImmediate(), e.getProvider("auth-internal"), e.getProvider("app-check-internal"), t, Gt);
}
function bx() {
	Bt(new we(px, yx, "PUBLIC").setMultipleInstances(!0)), x(dx, fx, ""), x(dx, fx, "esm2017");
}
bx();
//#endregion
//#region node_modules/@firebase/installations/dist/esm/index.esm2017.js
var xx = "@firebase/installations", Sx = "0.6.6", Cx = 1e4, wx = `w:${Sx}`, Tx = "FIS_v2", Ex = "https://firebaseinstallations.googleapis.com/v1", Dx = 36e5, Ox = new me("installations", "Installations", {
	"missing-app-config-values": "Missing App configuration value: \"{$valueName}\"",
	"not-registered": "Firebase Installation is not registered.",
	"installation-not-found": "Firebase Installation not found.",
	"request-failed": "{$requestName} request failed with error \"{$serverCode} {$serverStatus}: {$serverMessage}\"",
	"app-offline": "Could not process request. Application offline.",
	"delete-pending-registration": "Can't delete installation while there is a pending registration request."
});
function kx(e) {
	return e instanceof pe && e.code.includes("request-failed");
}
function Ax({ projectId: e }) {
	return `${Ex}/projects/${e}/installations`;
}
function jx(e) {
	return {
		token: e.token,
		requestStatus: 2,
		expiresIn: Ix(e.expiresIn),
		creationTime: Date.now()
	};
}
async function Mx(e, t) {
	let n = (await t.json()).error;
	return Ox.create("request-failed", {
		requestName: e,
		serverCode: n.code,
		serverMessage: n.message,
		serverStatus: n.status
	});
}
function Nx({ apiKey: e }) {
	return new Headers({
		"Content-Type": "application/json",
		Accept: "application/json",
		"x-goog-api-key": e
	});
}
function Px(e, { refreshToken: t }) {
	let n = Nx(e);
	return n.append("Authorization", Lx(t)), n;
}
async function Fx(e) {
	let t = await e();
	return t.status >= 500 && t.status < 600 ? e() : t;
}
function Ix(e) {
	return Number(e.replace("s", "000"));
}
function Lx(e) {
	return `${Tx} ${e}`;
}
async function Rx({ appConfig: e, heartbeatServiceProvider: t }, { fid: n }) {
	let r = Ax(e), i = Nx(e), a = t.getImmediate({ optional: !0 });
	if (a) {
		let e = await a.getHeartbeatsHeader();
		e && i.append("x-firebase-client", e);
	}
	let o = {
		fid: n,
		authVersion: Tx,
		appId: e.appId,
		sdkVersion: wx
	}, s = {
		method: "POST",
		headers: i,
		body: JSON.stringify(o)
	}, c = await Fx(() => fetch(r, s));
	if (c.ok) {
		let e = await c.json();
		return {
			fid: e.fid || n,
			registrationStatus: 2,
			refreshToken: e.refreshToken,
			authToken: jx(e.authToken)
		};
	}
	throw await Mx("Create Installation", c);
}
function zx(e) {
	return new Promise((t) => {
		setTimeout(t, e);
	});
}
function Bx(e) {
	return btoa(String.fromCharCode(...e)).replace(/\+/g, "-").replace(/\//g, "_");
}
var Vx = /^[cdef][\w-]{21}$/, Hx = "";
function Ux() {
	try {
		let e = /* @__PURE__ */ new Uint8Array(17);
		(self.crypto || self.msCrypto).getRandomValues(e), e[0] = 112 + e[0] % 16;
		let t = Wx(e);
		return Vx.test(t) ? t : Hx;
	} catch {
		return Hx;
	}
}
function Wx(e) {
	return Bx(e).substr(0, 22);
}
function Gx(e) {
	return `${e.appName}!${e.appId}`;
}
var Kx = /* @__PURE__ */ new Map();
function qx(e, t) {
	let n = Gx(e);
	Jx(n, t), Yx(n, t);
}
function Jx(e, t) {
	let n = Kx.get(e);
	if (n) for (let e of n) e(t);
}
function Yx(e, t) {
	let n = Zx();
	n && n.postMessage({
		key: e,
		fid: t
	}), Qx();
}
var Xx = null;
function Zx() {
	return !Xx && "BroadcastChannel" in self && (Xx = new BroadcastChannel("[Firebase] FID Change"), Xx.onmessage = (e) => {
		Jx(e.data.key, e.data.fid);
	}), Xx;
}
function Qx() {
	Kx.size === 0 && Xx && (Xx.close(), Xx = null);
}
var $x = "firebase-installations-database", eS = 1, tS = "firebase-installations-store", nS = null;
function rS() {
	return nS ||= Qe($x, eS, { upgrade: (e, t) => {
		t === 0 && e.createObjectStore(tS);
	} }), nS;
}
async function iS(e, t) {
	let n = Gx(e), r = (await rS()).transaction(tS, "readwrite"), i = r.objectStore(tS), a = await i.get(n);
	return await i.put(t, n), await r.done, (!a || a.fid !== t.fid) && qx(e, t.fid), t;
}
async function aS(e) {
	let t = Gx(e), n = (await rS()).transaction(tS, "readwrite");
	await n.objectStore(tS).delete(t), await n.done;
}
async function oS(e, t) {
	let n = Gx(e), r = (await rS()).transaction(tS, "readwrite"), i = r.objectStore(tS), a = await i.get(n), o = t(a);
	return o === void 0 ? await i.delete(n) : await i.put(o, n), await r.done, o && (!a || a.fid !== o.fid) && qx(e, o.fid), o;
}
async function sS(e) {
	let t, n = await oS(e.appConfig, (n) => {
		let r = lS(e, cS(n));
		return t = r.registrationPromise, r.installationEntry;
	});
	return n.fid === Hx ? { installationEntry: await t } : {
		installationEntry: n,
		registrationPromise: t
	};
}
function cS(e) {
	return pS(e || {
		fid: Ux(),
		registrationStatus: 0
	});
}
function lS(e, t) {
	if (t.registrationStatus === 0) {
		if (!navigator.onLine) return {
			installationEntry: t,
			registrationPromise: Promise.reject(Ox.create("app-offline"))
		};
		let n = {
			fid: t.fid,
			registrationStatus: 1,
			registrationTime: Date.now()
		};
		return {
			installationEntry: n,
			registrationPromise: uS(e, n)
		};
	}
	return t.registrationStatus === 1 ? {
		installationEntry: t,
		registrationPromise: dS(e)
	} : { installationEntry: t };
}
async function uS(e, t) {
	try {
		let n = await Rx(e, t);
		return iS(e.appConfig, n);
	} catch (n) {
		throw kx(n) && n.customData.serverCode === 409 ? await aS(e.appConfig) : await iS(e.appConfig, {
			fid: t.fid,
			registrationStatus: 0
		}), n;
	}
}
async function dS(e) {
	let t = await fS(e.appConfig);
	for (; t.registrationStatus === 1;) await zx(100), t = await fS(e.appConfig);
	if (t.registrationStatus === 0) {
		let { installationEntry: t, registrationPromise: n } = await sS(e);
		return n || t;
	}
	return t;
}
function fS(e) {
	return oS(e, (e) => {
		if (!e) throw Ox.create("installation-not-found");
		return pS(e);
	});
}
function pS(e) {
	return mS(e) ? {
		fid: e.fid,
		registrationStatus: 0
	} : e;
}
function mS(e) {
	return e.registrationStatus === 1 && e.registrationTime + Cx < Date.now();
}
async function hS({ appConfig: e, heartbeatServiceProvider: t }, n) {
	let r = gS(e, n), i = Px(e, n), a = t.getImmediate({ optional: !0 });
	if (a) {
		let e = await a.getHeartbeatsHeader();
		e && i.append("x-firebase-client", e);
	}
	let o = { installation: {
		sdkVersion: wx,
		appId: e.appId
	} }, s = {
		method: "POST",
		headers: i,
		body: JSON.stringify(o)
	}, c = await Fx(() => fetch(r, s));
	if (c.ok) return jx(await c.json());
	throw await Mx("Generate Auth Token", c);
}
function gS(e, { fid: t }) {
	return `${Ax(e)}/${t}/authTokens:generate`;
}
async function _S(e, t = !1) {
	let n, r = await oS(e.appConfig, (r) => {
		if (!xS(r)) throw Ox.create("not-registered");
		let i = r.authToken;
		if (!t && SS(i)) return r;
		if (i.requestStatus === 1) return n = vS(e, t), r;
		{
			if (!navigator.onLine) throw Ox.create("app-offline");
			let t = wS(r);
			return n = bS(e, t), t;
		}
	});
	return n ? await n : r.authToken;
}
async function vS(e, t) {
	let n = await yS(e.appConfig);
	for (; n.authToken.requestStatus === 1;) await zx(100), n = await yS(e.appConfig);
	let r = n.authToken;
	return r.requestStatus === 0 ? _S(e, t) : r;
}
function yS(e) {
	return oS(e, (e) => {
		if (!xS(e)) throw Ox.create("not-registered");
		let t = e.authToken;
		return TS(t) ? Object.assign(Object.assign({}, e), { authToken: { requestStatus: 0 } }) : e;
	});
}
async function bS(e, t) {
	try {
		let n = await hS(e, t), r = Object.assign(Object.assign({}, t), { authToken: n });
		return await iS(e.appConfig, r), n;
	} catch (n) {
		if (kx(n) && (n.customData.serverCode === 401 || n.customData.serverCode === 404)) await aS(e.appConfig);
		else {
			let n = Object.assign(Object.assign({}, t), { authToken: { requestStatus: 0 } });
			await iS(e.appConfig, n);
		}
		throw n;
	}
}
function xS(e) {
	return e !== void 0 && e.registrationStatus === 2;
}
function SS(e) {
	return e.requestStatus === 2 && !CS(e);
}
function CS(e) {
	let t = Date.now();
	return t < e.creationTime || e.creationTime + e.expiresIn < t + Dx;
}
function wS(e) {
	let t = {
		requestStatus: 1,
		requestTime: Date.now()
	};
	return Object.assign(Object.assign({}, e), { authToken: t });
}
function TS(e) {
	return e.requestStatus === 1 && e.requestTime + Cx < Date.now();
}
async function ES(e) {
	let t = e, { installationEntry: n, registrationPromise: r } = await sS(t);
	return r ? r.catch(console.error) : _S(t).catch(console.error), n.fid;
}
async function DS(e, t = !1) {
	let n = e;
	return await OS(n), (await _S(n, t)).token;
}
async function OS(e) {
	let { registrationPromise: t } = await sS(e);
	t && await t;
}
function kS(e) {
	if (!e || !e.options) throw AS("App Configuration");
	if (!e.name) throw AS("App Name");
	for (let t of [
		"projectId",
		"apiKey",
		"appId"
	]) if (!e.options[t]) throw AS(t);
	return {
		appName: e.name,
		projectId: e.options.projectId,
		apiKey: e.options.apiKey,
		appId: e.options.appId
	};
}
function AS(e) {
	return Ox.create("missing-app-config-values", { valueName: e });
}
var jS = "installations", MS = "installations-internal", NS = (e) => {
	let t = e.getProvider("app").getImmediate();
	return {
		app: t,
		appConfig: kS(t),
		heartbeatServiceProvider: Vt(t, "heartbeat"),
		_delete: () => Promise.resolve()
	};
}, PS = (e) => {
	let t = Vt(e.getProvider("app").getImmediate(), jS).getImmediate();
	return {
		getId: () => ES(t),
		getToken: (e) => DS(t, e)
	};
};
function FS() {
	Bt(new we(jS, NS, "PUBLIC")), Bt(new we(MS, PS, "PRIVATE"));
}
FS(), x(xx, Sx), x(xx, Sx, "esm2017");
//#endregion
//#region node_modules/@firebase/messaging/dist/esm/index.esm2017.js
var IS = "/firebase-messaging-sw.js", LS = "/firebase-cloud-messaging-push-scope", RS = "BDOU99-h67HcA6JeFXHbSNMu7e2yNNu3RzoMj8TM4W88jITfq7ZmPvIM1Iv-4_l2LxQcYwhqby2xGpWwzjfAnG4", zS = "https://fcmregistrations.googleapis.com/v1", BS = "google.c.a.c_id", VS = "google.c.a.c_l", HS = "google.c.a.ts", US = "google.c.a.e", WS;
(function(e) {
	e[e.DATA_MESSAGE = 1] = "DATA_MESSAGE", e[e.DISPLAY_NOTIFICATION = 3] = "DISPLAY_NOTIFICATION";
})(WS ||= {});
var GS;
(function(e) {
	e.PUSH_RECEIVED = "push-received", e.NOTIFICATION_CLICKED = "notification-clicked";
})(GS ||= {});
function KS(e) {
	let t = new Uint8Array(e);
	return btoa(String.fromCharCode(...t)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}
function qS(e) {
	let t = (e + "=".repeat((4 - e.length % 4) % 4)).replace(/\-/g, "+").replace(/_/g, "/"), n = atob(t), r = new Uint8Array(n.length);
	for (let e = 0; e < n.length; ++e) r[e] = n.charCodeAt(e);
	return r;
}
var JS = "fcm_token_details_db", YS = 5, XS = "fcm_token_object_Store";
async function ZS(e) {
	if ("databases" in indexedDB && !(await indexedDB.databases()).map((e) => e.name).includes(JS)) return null;
	let t = null;
	return (await Qe(JS, YS, { upgrade: async (n, r, i, a) => {
		if (r < 2 || !n.objectStoreNames.contains(XS)) return;
		let o = a.objectStore(XS), s = await o.index("fcmSenderId").get(e);
		if (await o.clear(), s) {
			if (r === 2) {
				let e = s;
				if (!e.auth || !e.p256dh || !e.endpoint) return;
				t = {
					token: e.fcmToken,
					createTime: e.createTime ?? Date.now(),
					subscriptionOptions: {
						auth: e.auth,
						p256dh: e.p256dh,
						endpoint: e.endpoint,
						swScope: e.swScope,
						vapidKey: typeof e.vapidKey == "string" ? e.vapidKey : KS(e.vapidKey)
					}
				};
			} else if (r === 3) {
				let e = s;
				t = {
					token: e.fcmToken,
					createTime: e.createTime,
					subscriptionOptions: {
						auth: KS(e.auth),
						p256dh: KS(e.p256dh),
						endpoint: e.endpoint,
						swScope: e.swScope,
						vapidKey: KS(e.vapidKey)
					}
				};
			} else if (r === 4) {
				let e = s;
				t = {
					token: e.fcmToken,
					createTime: e.createTime,
					subscriptionOptions: {
						auth: KS(e.auth),
						p256dh: KS(e.p256dh),
						endpoint: e.endpoint,
						swScope: e.swScope,
						vapidKey: KS(e.vapidKey)
					}
				};
			}
		}
	} })).close(), await $e(JS), await $e("fcm_vapid_details_db"), await $e("undefined"), QS(t) ? t : null;
}
function QS(e) {
	if (!e || !e.subscriptionOptions) return !1;
	let { subscriptionOptions: t } = e;
	return typeof e.createTime == "number" && e.createTime > 0 && typeof e.token == "string" && e.token.length > 0 && typeof t.auth == "string" && t.auth.length > 0 && typeof t.p256dh == "string" && t.p256dh.length > 0 && typeof t.endpoint == "string" && t.endpoint.length > 0 && typeof t.swScope == "string" && t.swScope.length > 0 && typeof t.vapidKey == "string" && t.vapidKey.length > 0;
}
var $S = "firebase-messaging-database", eC = 1, tC = "firebase-messaging-store", nC = null;
function rC() {
	return nC ||= Qe($S, eC, { upgrade: (e, t) => {
		t === 0 && e.createObjectStore(tC);
	} }), nC;
}
async function iC(e) {
	let t = sC(e), n = await (await rC()).transaction(tC).objectStore(tC).get(t);
	if (n) return n;
	{
		let t = await ZS(e.appConfig.senderId);
		if (t) return await aC(e, t), t;
	}
}
async function aC(e, t) {
	let n = sC(e), r = (await rC()).transaction(tC, "readwrite");
	return await r.objectStore(tC).put(t, n), await r.done, t;
}
async function oC(e) {
	let t = sC(e), n = (await rC()).transaction(tC, "readwrite");
	await n.objectStore(tC).delete(t), await n.done;
}
function sC({ appConfig: e }) {
	return e.appId;
}
var cC = new me("messaging", "Messaging", {
	"missing-app-config-values": "Missing App configuration value: \"{$valueName}\"",
	"only-available-in-window": "This method is available in a Window context.",
	"only-available-in-sw": "This method is available in a service worker context.",
	"permission-default": "The notification permission was not granted and dismissed instead.",
	"permission-blocked": "The notification permission was not granted and blocked instead.",
	"unsupported-browser": "This browser doesn't support the API's required to use the Firebase SDK.",
	"indexed-db-unsupported": "This browser doesn't support indexedDb.open() (ex. Safari iFrame, Firefox Private Browsing, etc)",
	"failed-service-worker-registration": "We are unable to register the default service worker. {$browserErrorMessage}",
	"token-subscribe-failed": "A problem occurred while subscribing the user to FCM: {$errorInfo}",
	"token-subscribe-no-token": "FCM returned no token when subscribing the user to push.",
	"token-unsubscribe-failed": "A problem occurred while unsubscribing the user from FCM: {$errorInfo}",
	"token-update-failed": "A problem occurred while updating the user from FCM: {$errorInfo}",
	"token-update-no-token": "FCM returned no token when updating the user to push.",
	"use-sw-after-get-token": "The useServiceWorker() method may only be called once and must be called before calling getToken() to ensure your service worker is used.",
	"invalid-sw-registration": "The input to useServiceWorker() must be a ServiceWorkerRegistration.",
	"invalid-bg-handler": "The input to setBackgroundMessageHandler() must be a function.",
	"invalid-vapid-key": "The public VAPID key must be a string.",
	"use-vapid-key-after-get-token": "The usePublicVapidKey() method may only be called once and must be called before calling getToken() to ensure your VAPID key is used."
});
async function lC(e, t) {
	let n = await pC(e), r = mC(t), i = {
		method: "POST",
		headers: n,
		body: JSON.stringify(r)
	}, a;
	try {
		a = await (await fetch(fC(e.appConfig), i)).json();
	} catch (e) {
		throw cC.create("token-subscribe-failed", { errorInfo: e?.toString() });
	}
	if (a.error) {
		let e = a.error.message;
		throw cC.create("token-subscribe-failed", { errorInfo: e });
	}
	if (!a.token) throw cC.create("token-subscribe-no-token");
	return a.token;
}
async function uC(e, t) {
	let n = await pC(e), r = mC(t.subscriptionOptions), i = {
		method: "PATCH",
		headers: n,
		body: JSON.stringify(r)
	}, a;
	try {
		a = await (await fetch(`${fC(e.appConfig)}/${t.token}`, i)).json();
	} catch (e) {
		throw cC.create("token-update-failed", { errorInfo: e?.toString() });
	}
	if (a.error) {
		let e = a.error.message;
		throw cC.create("token-update-failed", { errorInfo: e });
	}
	if (!a.token) throw cC.create("token-update-no-token");
	return a.token;
}
async function dC(e, t) {
	let n = {
		method: "DELETE",
		headers: await pC(e)
	};
	try {
		let r = await (await fetch(`${fC(e.appConfig)}/${t}`, n)).json();
		if (r.error) {
			let e = r.error.message;
			throw cC.create("token-unsubscribe-failed", { errorInfo: e });
		}
	} catch (e) {
		throw cC.create("token-unsubscribe-failed", { errorInfo: e?.toString() });
	}
}
function fC({ projectId: e }) {
	return `${zS}/projects/${e}/registrations`;
}
async function pC({ appConfig: e, installations: t }) {
	let n = await t.getToken();
	return new Headers({
		"Content-Type": "application/json",
		Accept: "application/json",
		"x-goog-api-key": e.apiKey,
		"x-goog-firebase-installations-auth": `FIS ${n}`
	});
}
function mC({ p256dh: e, auth: t, endpoint: n, vapidKey: r }) {
	let i = { web: {
		endpoint: n,
		auth: t,
		p256dh: e
	} };
	return r !== RS && (i.web.applicationPubKey = r), i;
}
var hC = 6048e5;
async function gC(e) {
	let t = await bC(e.swRegistration, e.vapidKey), n = {
		vapidKey: e.vapidKey,
		swScope: e.swRegistration.scope,
		endpoint: t.endpoint,
		auth: KS(t.getKey("auth")),
		p256dh: KS(t.getKey("p256dh"))
	}, r = await iC(e.firebaseDependencies);
	if (!r) return yC(e.firebaseDependencies, n);
	if (!xC(r.subscriptionOptions, n)) {
		try {
			await dC(e.firebaseDependencies, r.token);
		} catch (e) {
			console.warn(e);
		}
		return yC(e.firebaseDependencies, n);
	}
	return Date.now() >= r.createTime + hC ? vC(e, {
		token: r.token,
		createTime: Date.now(),
		subscriptionOptions: n
	}) : r.token;
}
async function _C(e) {
	let t = await iC(e.firebaseDependencies);
	t && (await dC(e.firebaseDependencies, t.token), await oC(e.firebaseDependencies));
	let n = await e.swRegistration.pushManager.getSubscription();
	return !n || n.unsubscribe();
}
async function vC(e, t) {
	try {
		let n = await uC(e.firebaseDependencies, t), r = Object.assign(Object.assign({}, t), {
			token: n,
			createTime: Date.now()
		});
		return await aC(e.firebaseDependencies, r), n;
	} catch (t) {
		throw await _C(e), t;
	}
}
async function yC(e, t) {
	let n = {
		token: await lC(e, t),
		createTime: Date.now(),
		subscriptionOptions: t
	};
	return await aC(e, n), n.token;
}
async function bC(e, t) {
	return await e.pushManager.getSubscription() || e.pushManager.subscribe({
		userVisibleOnly: !0,
		applicationServerKey: qS(t)
	});
}
function xC(e, t) {
	let n = t.vapidKey === e.vapidKey, r = t.endpoint === e.endpoint, i = t.auth === e.auth, a = t.p256dh === e.p256dh;
	return n && r && i && a;
}
function SC(e) {
	let t = {
		from: e.from,
		collapseKey: e.collapse_key,
		messageId: e.fcmMessageId
	};
	return CC(t, e), wC(t, e), TC(t, e), t;
}
function CC(e, t) {
	if (!t.notification) return;
	e.notification = {};
	let n = t.notification.title;
	n && (e.notification.title = n);
	let r = t.notification.body;
	r && (e.notification.body = r);
	let i = t.notification.image;
	i && (e.notification.image = i);
	let a = t.notification.icon;
	a && (e.notification.icon = a);
}
function wC(e, t) {
	t.data && (e.data = t.data);
}
function TC(e, t) {
	if (!t.fcmOptions && !t.notification?.click_action) return;
	e.fcmOptions = {};
	let n = t.fcmOptions?.link ?? t.notification?.click_action;
	n && (e.fcmOptions.link = n);
	let r = t.fcmOptions?.analytics_label;
	r && (e.fcmOptions.analyticsLabel = r);
}
function EC(e) {
	return typeof e == "object" && !!e && BS in e;
}
DC("hts/frbslgigp.ogepscmv/ieo/eaylg", "tp:/ieaeogn-agolai.o/1frlglgc/o"), DC("AzSCbw63g1R0nCw85jG8", "Iaya3yLKwmgvh7cF0q4");
function DC(e, t) {
	let n = [];
	for (let r = 0; r < e.length; r++) n.push(e.charAt(r)), r < t.length && n.push(t.charAt(r));
	return n.join("");
}
function OC(e) {
	if (!e || !e.options) throw kC("App Configuration Object");
	if (!e.name) throw kC("App Name");
	let t = [
		"projectId",
		"apiKey",
		"appId",
		"messagingSenderId"
	], { options: n } = e;
	for (let e of t) if (!n[e]) throw kC(e);
	return {
		appName: e.name,
		projectId: n.projectId,
		apiKey: n.apiKey,
		appId: n.appId,
		senderId: n.messagingSenderId
	};
}
function kC(e) {
	return cC.create("missing-app-config-values", { valueName: e });
}
var AC = class {
	constructor(e, t, n) {
		this.deliveryMetricsExportedToBigQueryEnabled = !1, this.onBackgroundMessageHandler = null, this.onMessageHandler = null, this.logEvents = [], this.isLogServiceStarted = !1;
		let r = OC(e);
		this.firebaseDependencies = {
			app: e,
			appConfig: r,
			installations: t,
			analyticsProvider: n
		};
	}
	_delete() {
		return Promise.resolve();
	}
};
async function jC(e) {
	try {
		e.swRegistration = await navigator.serviceWorker.register(IS, { scope: LS }), e.swRegistration.update().catch(() => {});
	} catch (e) {
		throw cC.create("failed-service-worker-registration", { browserErrorMessage: e?.message });
	}
}
async function MC(e, t) {
	if (!t && !e.swRegistration && await jC(e), t || !e.swRegistration) {
		if (!(t instanceof ServiceWorkerRegistration)) throw cC.create("invalid-sw-registration");
		e.swRegistration = t;
	}
}
async function NC(e, t) {
	t ? e.vapidKey = t : e.vapidKey ||= RS;
}
async function PC(e, t) {
	if (!navigator) throw cC.create("only-available-in-window");
	if (Notification.permission === "default" && await Notification.requestPermission(), Notification.permission !== "granted") throw cC.create("permission-blocked");
	return await NC(e, t?.vapidKey), await MC(e, t?.serviceWorkerRegistration), gC(e);
}
async function FC(e, t, n) {
	let r = IC(t);
	(await e.firebaseDependencies.analyticsProvider.get()).logEvent(r, {
		message_id: n[BS],
		message_name: n[VS],
		message_time: n[HS],
		message_device_time: Math.floor(Date.now() / 1e3)
	});
}
function IC(e) {
	switch (e) {
		case GS.NOTIFICATION_CLICKED: return "notification_open";
		case GS.PUSH_RECEIVED: return "notification_foreground";
		default: throw Error();
	}
}
async function LC(e, t) {
	let n = t.data;
	if (!n.isFirebaseMessaging) return;
	e.onMessageHandler && n.messageType === GS.PUSH_RECEIVED && (typeof e.onMessageHandler == "function" ? e.onMessageHandler(SC(n)) : e.onMessageHandler.next(SC(n)));
	let r = n.data;
	EC(r) && r[US] === "1" && await FC(e, n.messageType, r);
}
var RC = "@firebase/messaging", zC = "0.12.7", BC = (e) => {
	let t = new AC(e.getProvider("app").getImmediate(), e.getProvider("installations-internal").getImmediate(), e.getProvider("analytics-internal"));
	return navigator.serviceWorker.addEventListener("message", (e) => LC(t, e)), t;
}, VC = (e) => {
	let t = e.getProvider("messaging").getImmediate();
	return { getToken: (e) => PC(t, e) };
};
function HC() {
	Bt(new we("messaging", BC, "PUBLIC")), Bt(new we("messaging-internal", VC, "PRIVATE")), x(RC, zC), x(RC, zC, "esm2017");
}
async function UC() {
	try {
		await ue();
	} catch {
		return !1;
	}
	return typeof window < "u" && le() && de() && "serviceWorker" in navigator && "PushManager" in window && "Notification" in window && "fetch" in window && ServiceWorkerRegistration.prototype.hasOwnProperty("showNotification") && PushSubscription.prototype.hasOwnProperty("getKey");
}
async function WC(e) {
	if (!navigator) throw cC.create("only-available-in-window");
	return e.swRegistration || await jC(e), _C(e);
}
function GC(e, t) {
	if (!navigator) throw cC.create("only-available-in-window");
	return e.onMessageHandler = t, () => {
		e.onMessageHandler = null;
	};
}
function KC(e = qt()) {
	return UC().then((e) => {
		if (!e) throw cC.create("unsupported-browser");
	}, (e) => {
		throw cC.create("indexed-db-unsupported");
	}), Vt(_(e), "messaging").getImmediate();
}
async function qC(e, t) {
	return e = _(e), PC(e, t);
}
function JC(e) {
	return e = _(e), WC(e);
}
function YC(e, t) {
	return e = _(e), GC(e, t);
}
HC();
var XC = {
	projectId: "booming-rigging-gn50x",
	appId: "1:914243738562:web:a37e6e84561648b9e4945b",
	apiKey: "AIzaSyA-ogGsp39UsQ72M_PwDx4n89ETlROqqGc",
	authDomain: "booming-rigging-gn50x.firebaseapp.com",
	firestoreDatabaseId: "ai-studio-51245802-6d4e-4feb-bd11-43162af66618",
	storageBucket: "booming-rigging-gn50x.firebasestorage.app",
	messagingSenderId: "914243738562",
	measurementId: "",
	oAuthClientId: "914243738562-8v329c07vp2b8e15junfftbndf2u7dfa.apps.googleusercontent.com",
	recaptchaSiteKey: "",
	vapidPublicKey: ""
}, ZC = null;
function QC() {
	if (typeof window > "u") return null;
	let e = window;
	return e.db && e.auth ? {
		app: e.__firebaseApp ?? null,
		db: e.db,
		auth: e.auth,
		storage: e.storage ?? null,
		googleProvider: null
	} : null;
}
function $C() {
	let e = Jt().length === 0 ? Kt(XC) : Jt()[0], t;
	try {
		t = Q_(e, XC.firestoreDatabaseId);
	} catch (e) {
		console.warn("[firebase] named database init failed, using default database on a fresh app:", e), t = Q_(Kt(XC, "animeblack-fallback-" + Date.now()));
	}
	let n = eo(e), r = _x(e), i = new ti();
	return i.setCustomParameters({ prompt: "select_account" }), {
		app: e,
		db: t,
		auth: n,
		storage: r,
		googleProvider: i
	};
}
function ew() {
	return ZC || (ZC = QC() ?? $C(), ZC);
}
function tw() {
	return ew().db;
}
function nw() {
	return ew().auth;
}
function rw() {
	return ew().storage;
}
function iw() {
	return ew().app;
}
function aw() {
	let e = ew();
	if (e.googleProvider) return e.googleProvider;
	if (typeof window < "u") {
		let t = window.GoogleAuthProvider;
		if (t) {
			let n = new t();
			return n.setCustomParameters({ prompt: "select_account" }), e.googleProvider = n, n;
		}
	}
	return null;
}
async function ow() {
	try {
		if (await UC() && typeof window < "u" && "serviceWorker" in navigator) return KC(ew().app);
	} catch (e) {
		console.warn("[FCM] Messaging not supported in this runtime environment:", e);
	}
	return null;
}
//#endregion
//#region node_modules/dompurify/dist/purify.es.mjs
function sw(e, t) {
	(t == null || t > e.length) && (t = e.length);
	for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
	return r;
}
function cw(e) {
	if (Array.isArray(e)) return e;
}
function lw(e, t) {
	var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
	if (n != null) {
		var r, i, a, o, s = [], c = !0, l = !1;
		try {
			if (a = (n = n.call(e)).next, t !== 0) for (; !(c = (r = a.call(n)).done) && (s.push(r.value), s.length !== t); c = !0);
		} catch (e) {
			l = !0, i = e;
		} finally {
			try {
				if (!c && n.return != null && (o = n.return(), Object(o) !== o)) return;
			} finally {
				if (l) throw i;
			}
		}
		return s;
	}
}
function uw() {
	throw TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function dw(e, t) {
	return cw(e) || lw(e, t) || fw(e, t) || uw();
}
function fw(e, t) {
	if (e) {
		if (typeof e == "string") return sw(e, t);
		var n = {}.toString.call(e).slice(8, -1);
		return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? sw(e, t) : void 0;
	}
}
var pw = Object.entries, mw = Object.setPrototypeOf, hw = Object.isFrozen, gw = Object.getPrototypeOf, _w = Object.getOwnPropertyDescriptor, vw = Object.freeze, yw = Object.seal, bw = Object.create, xw = typeof Reflect < "u" && Reflect, Sw = xw.apply, Cw = xw.construct;
vw ||= function(e) {
	return e;
}, yw ||= function(e) {
	return e;
}, Sw ||= function(e, t) {
	var n = [...arguments].slice(2);
	return e.apply(t, n);
}, Cw ||= function(e) {
	return new e(...[...arguments].slice(1));
};
var ww = Ww(Array.prototype.forEach), Tw = Ww(Array.prototype.lastIndexOf), Ew = Ww(Array.prototype.pop), Dw = Ww(Array.prototype.push), Ow = Ww(Array.prototype.splice), kw = Array.isArray, Aw = Ww(String.prototype.toLowerCase), jw = Ww(String.prototype.toString), Mw = Ww(String.prototype.match), Nw = Ww(String.prototype.replace), Pw = Ww(String.prototype.indexOf), Fw = Ww(String.prototype.trim), Iw = Ww(Number.prototype.toString), Lw = Ww(Boolean.prototype.toString), Rw = typeof BigInt > "u" ? null : Ww(BigInt.prototype.toString), zw = typeof Symbol > "u" ? null : Ww(Symbol.prototype.toString), Bw = Ww(Object.prototype.hasOwnProperty), Vw = Ww(Object.prototype.toString), Hw = Ww(RegExp.prototype.test), Uw = Gw(TypeError);
function Ww(e) {
	return function(t) {
		t instanceof RegExp && (t.lastIndex = 0);
		var n = [...arguments].slice(1);
		return Sw(e, t, n);
	};
}
function Gw(e) {
	return function() {
		return Cw(e, [...arguments]);
	};
}
function V(e, t) {
	let n = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : Aw;
	if (mw && mw(e, null), !kw(t)) return e;
	let r = t.length;
	for (; r--;) {
		let i = t[r];
		if (typeof i == "string") {
			let e = n(i);
			e !== i && (hw(t) || (t[r] = e), i = e);
		}
		e[i] = !0;
	}
	return e;
}
function Kw(e) {
	for (let t = 0; t < e.length; t++) Bw(e, t) || (e[t] = null);
	return e;
}
function qw(e) {
	let t = bw(null);
	for (let r of pw(e)) {
		var n = dw(r, 2);
		let i = n[0], a = n[1];
		Bw(e, i) && (t[i] = kw(a) ? Kw(a) : a && typeof a == "object" && a.constructor === Object ? qw(a) : a);
	}
	return t;
}
function Jw(e) {
	switch (typeof e) {
		case "string": return e;
		case "number": return Iw(e);
		case "boolean": return Lw(e);
		case "bigint": return Rw ? Rw(e) : "0";
		case "symbol": return zw ? zw(e) : "Symbol()";
		case "undefined": return Vw(e);
		case "function":
		case "object": {
			if (e === null) return Vw(e);
			let t = e, n = Yw(t, "toString");
			if (typeof n == "function") {
				let e = n(t);
				return typeof e == "string" ? e : Vw(e);
			}
			return Vw(e);
		}
		default: return Vw(e);
	}
}
function Yw(e, t) {
	for (; e !== null;) {
		let n = _w(e, t);
		if (n) {
			if (n.get) return Ww(n.get);
			if (typeof n.value == "function") return Ww(n.value);
		}
		e = gw(e);
	}
	function n() {
		return null;
	}
	return n;
}
function Xw(e) {
	try {
		return Hw(e, ""), !0;
	} catch {
		return !1;
	}
}
var Zw = vw(/* @__PURE__ */ "a.abbr.acronym.address.area.article.aside.audio.b.bdi.bdo.big.blink.blockquote.body.br.button.canvas.caption.center.cite.code.col.colgroup.content.data.datalist.dd.decorator.del.details.dfn.dialog.dir.div.dl.dt.element.em.fieldset.figcaption.figure.font.footer.form.h1.h2.h3.h4.h5.h6.head.header.hgroup.hr.html.i.img.input.ins.kbd.label.legend.li.main.map.mark.marquee.menu.menuitem.meter.nav.nobr.ol.optgroup.option.output.p.picture.pre.progress.q.rp.rt.ruby.s.samp.search.section.select.shadow.slot.small.source.spacer.span.strike.strong.style.sub.summary.sup.table.tbody.td.template.textarea.tfoot.th.thead.time.tr.track.tt.u.ul.var.video.wbr".split(".")), Qw = vw(/* @__PURE__ */ "svg.a.altglyph.altglyphdef.altglyphitem.animatecolor.animatemotion.animatetransform.circle.clippath.defs.desc.ellipse.enterkeyhint.exportparts.filter.font.g.glyph.glyphref.hkern.image.inputmode.line.lineargradient.marker.mask.metadata.mpath.part.path.pattern.polygon.polyline.radialgradient.rect.stop.style.switch.symbol.text.textpath.title.tref.tspan.view.vkern".split(".")), $w = vw([
	"feBlend",
	"feColorMatrix",
	"feComponentTransfer",
	"feComposite",
	"feConvolveMatrix",
	"feDiffuseLighting",
	"feDisplacementMap",
	"feDistantLight",
	"feDropShadow",
	"feFlood",
	"feFuncA",
	"feFuncB",
	"feFuncG",
	"feFuncR",
	"feGaussianBlur",
	"feImage",
	"feMerge",
	"feMergeNode",
	"feMorphology",
	"feOffset",
	"fePointLight",
	"feSpecularLighting",
	"feSpotLight",
	"feTile",
	"feTurbulence"
]), eT = vw([
	"animate",
	"color-profile",
	"cursor",
	"discard",
	"font-face",
	"font-face-format",
	"font-face-name",
	"font-face-src",
	"font-face-uri",
	"foreignobject",
	"hatch",
	"hatchpath",
	"mesh",
	"meshgradient",
	"meshpatch",
	"meshrow",
	"missing-glyph",
	"script",
	"set",
	"solidcolor",
	"unknown",
	"use"
]), tT = vw(/* @__PURE__ */ "math.menclose.merror.mfenced.mfrac.mglyph.mi.mlabeledtr.mmultiscripts.mn.mo.mover.mpadded.mphantom.mroot.mrow.ms.mspace.msqrt.mstyle.msub.msup.msubsup.mtable.mtd.mtext.mtr.munder.munderover.mprescripts".split(".")), nT = vw([
	"maction",
	"maligngroup",
	"malignmark",
	"mlongdiv",
	"mscarries",
	"mscarry",
	"msgroup",
	"mstack",
	"msline",
	"msrow",
	"semantics",
	"annotation",
	"annotation-xml",
	"mprescripts",
	"none"
]), rT = vw(["#text"]), iT = vw(/* @__PURE__ */ "accept.action.align.alt.autocapitalize.autocomplete.autopictureinpicture.autoplay.background.bgcolor.border.capture.cellpadding.cellspacing.checked.cite.class.clear.color.cols.colspan.command.commandfor.controls.controlslist.coords.crossorigin.datetime.decoding.default.dir.disabled.disablepictureinpicture.disableremoteplayback.download.draggable.enctype.enterkeyhint.exportparts.face.for.headers.height.hidden.high.href.hreflang.id.inert.inputmode.integrity.ismap.kind.label.lang.list.loading.loop.low.max.maxlength.media.method.min.minlength.multiple.muted.name.nonce.noshade.novalidate.nowrap.open.optimum.part.pattern.placeholder.playsinline.popover.popovertarget.popovertargetaction.poster.preload.pubdate.radiogroup.readonly.rel.required.rev.reversed.role.rows.rowspan.spellcheck.scope.selected.shape.size.sizes.slot.span.srclang.start.src.srcset.step.style.summary.tabindex.title.translate.type.usemap.valign.value.width.wrap.xmlns".split(".")), aT = vw(/* @__PURE__ */ "accent-height.accumulate.additive.alignment-baseline.amplitude.ascent.attributename.attributetype.azimuth.basefrequency.baseline-shift.begin.bias.by.class.clip.clippathunits.clip-path.clip-rule.color.color-interpolation.color-interpolation-filters.color-profile.color-rendering.cx.cy.d.dx.dy.diffuseconstant.direction.display.divisor.dominant-baseline.dur.edgemode.elevation.end.exponent.fill.fill-opacity.fill-rule.filter.filterunits.flood-color.flood-opacity.font-family.font-size.font-size-adjust.font-stretch.font-style.font-variant.font-weight.fx.fy.g1.g2.glyph-name.glyphref.gradientunits.gradienttransform.height.href.id.image-rendering.in.in2.intercept.k.k1.k2.k3.k4.kerning.keypoints.keysplines.keytimes.lang.lengthadjust.letter-spacing.kernelmatrix.kernelunitlength.lighting-color.local.marker-end.marker-mid.marker-start.markerheight.markerunits.markerwidth.maskcontentunits.maskunits.max.mask.mask-type.media.method.mode.min.name.numoctaves.offset.operator.opacity.order.orient.orientation.origin.overflow.paint-order.path.pathlength.patterncontentunits.patterntransform.patternunits.pointer-events.points.preservealpha.preserveaspectratio.primitiveunits.r.rx.ry.radius.refx.refy.repeatcount.repeatdur.restart.result.rotate.scale.seed.shape-rendering.slope.specularconstant.specularexponent.spreadmethod.startoffset.stddeviation.stitchtiles.stop-color.stop-opacity.stroke-dasharray.stroke-dashoffset.stroke-linecap.stroke-linejoin.stroke-miterlimit.stroke-opacity.stroke.stroke-width.style.surfacescale.systemlanguage.tabindex.tablevalues.targetx.targety.transform.transform-origin.text-anchor.text-decoration.text-orientation.text-rendering.textlength.type.u1.u2.unicode.values.vector-effect.viewbox.visibility.version.vert-adv-y.vert-origin-x.vert-origin-y.width.word-spacing.wrap.writing-mode.xchannelselector.ychannelselector.x.x1.x2.xmlns.y.y1.y2.z.zoomandpan".split(".")), oT = vw(/* @__PURE__ */ "accent.accentunder.align.bevelled.close.columnalign.columnlines.columnspacing.columnspan.denomalign.depth.dir.display.displaystyle.encoding.fence.frame.height.href.id.largeop.length.linethickness.lquote.lspace.mathbackground.mathcolor.mathsize.mathvariant.maxsize.minsize.movablelimits.notation.numalign.open.rowalign.rowlines.rowspacing.rowspan.rspace.rquote.scriptlevel.scriptminsize.scriptsizemultiplier.selection.separator.separators.stretchy.subscriptshift.supscriptshift.symmetric.voffset.width.xmlns".split(".")), sT = vw([
	"xlink:href",
	"xml:id",
	"xlink:title",
	"xml:space",
	"xmlns:xlink"
]), cT = yw(/{{[\w\W]*|^[\w\W]*}}/g), lT = yw(/<%[\w\W]*|^[\w\W]*%>/g), uT = yw(/\${[\w\W]*/g), dT = yw(/^data-[\-\w.\u00B7-\uFFFF]+$/), fT = yw(/^aria-[\-\w]+$/), pT = yw(/^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|matrix):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i), mT = yw(/^(?:\w+script|data):/i), hT = yw(/[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205F\u3000]/g), gT = yw(/^html$/i), _T = yw(/^[a-z][.\w]*(-[.\w]+)+$/i), vT = yw(/<[/\w!]/g), yT = yw(/<[/\w]/g), bT = yw(/<\/no(script|embed|frames)/i), xT = yw(/\/>/i), ST = {
	element: 1,
	attribute: 2,
	text: 3,
	cdataSection: 4,
	entityReference: 5,
	entityNode: 6,
	processingInstruction: 7,
	comment: 8,
	document: 9,
	documentType: 10,
	documentFragment: 11,
	notation: 12
}, CT = [
	"style",
	"script",
	"xmp",
	"iframe",
	"noembed",
	"noframes",
	"plaintext",
	"noscript"
], wT = vw(V({}, CT)), TT = function() {
	let e = {};
	return ww(CT, (t) => {
		e[t] = yw(RegExp("</" + t + "(?=[\\t\\n\\f\\r />])", "i"));
	}), vw(e);
}(), ET = function() {
	return typeof window > "u" ? null : window;
}, DT = function(e, t) {
	if (typeof e != "object" || typeof e.createPolicy != "function") return null;
	let n = null, r = "data-tt-policy-suffix";
	t && t.hasAttribute(r) && (n = t.getAttribute(r));
	let i = "dompurify" + (n ? "#" + n : "");
	try {
		return e.createPolicy(i, {
			createHTML(e) {
				return e;
			},
			createScriptURL(e) {
				return e;
			}
		});
	} catch {
		return console.warn("TrustedTypes policy " + i + " could not be created."), null;
	}
}, OT = function() {
	return {
		afterSanitizeAttributes: [],
		afterSanitizeElements: [],
		afterSanitizeShadowDOM: [],
		beforeSanitizeAttributes: [],
		beforeSanitizeElements: [],
		beforeSanitizeShadowDOM: [],
		uponSanitizeAttribute: [],
		uponSanitizeElement: [],
		uponSanitizeShadowNode: []
	};
}, kT = function(e, t, n, r) {
	return Bw(e, t) && kw(e[t]) ? V(r.base ? qw(r.base) : {}, e[t], r.transform) : n;
}, AT = function(e, t, n) {
	let r = Bw(e, t) ? e[t] : void 0;
	return r && typeof r == "object" ? qw(r) : n();
};
function jT() {
	let e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : ET(), t = (e) => jT(e);
	if (t.version = "3.4.15", t.removed = [], !e || !e.document || e.document.nodeType !== ST.document || !e.Element) return t.isSupported = !1, t;
	let n = e.document, r = n, i = r.currentScript;
	e.DocumentFragment;
	let a = e.HTMLTemplateElement, o = e.Node, s = e.Element, c = e.NodeFilter;
	e.NamedNodeMap === void 0 && (e.NamedNodeMap || e.MozNamedAttrMap), e.HTMLFormElement;
	let l = e.DOMParser, u = e.trustedTypes, d = s.prototype, f = Yw(d, "cloneNode"), p = Yw(d, "remove"), m = Yw(d, "removeAttributeNode"), ee = Yw(d, "nextSibling"), te = Yw(d, "childNodes"), ne = Yw(d, "parentNode"), h = Yw(d, "shadowRoot"), re = Yw(d, "attributes"), ie = o && o.prototype ? Yw(o.prototype, "nodeType") : null, ae = o && o.prototype ? Yw(o.prototype, "nodeName") : null, oe = o && o.prototype ? Yw(o.prototype, "ownerDocument") : null, se = function(e) {
		return ie ? ie(e) : e.nodeType;
	}, ce = function(e) {
		return ae ? ae(e) : e.nodeName;
	};
	if (typeof a == "function") {
		let e = n.createElement("template");
		e.content && e.content.ownerDocument && (n = e.content.ownerDocument);
	}
	let le, ue = "", de, fe = !1, pe = 0, me = function() {
		if (pe > 0) throw Uw("A configured TRUSTED_TYPES_POLICY callback (createHTML or createScriptURL) must not call DOMPurify.sanitize, as that causes infinite recursion. Do not pass a policy whose callbacks wrap DOMPurify as TRUSTED_TYPES_POLICY; see the \"DOMPurify and Trusted Types\" section of the README.");
	}, he = function(e) {
		me(), pe++;
		try {
			return le.createHTML(e);
		} finally {
			pe--;
		}
	}, ge = function(e) {
		me(), pe++;
		try {
			return le.createScriptURL(e);
		} finally {
			pe--;
		}
	}, _e = function() {
		return fe ||= (de = DT(u, i), !0), de;
	}, ve = n, ye = ve.implementation, be = ve.createNodeIterator, xe = ve.createDocumentFragment, Se = ve.getElementsByTagName, Ce = r.importNode, g = OT();
	t.isSupported = typeof pw == "function" && typeof ne == "function" && ye && ye.createHTMLDocument !== void 0;
	let _ = cT, we = lT, Te = uT, Ee = dT, De = fT, Oe = mT, ke = hT, Ae = _T, v = pT, y = null, je = V({}, [
		...Zw,
		...Qw,
		...$w,
		...tT,
		...rT
	]), b = null, Me = V({}, [
		...iT,
		...aT,
		...oT,
		...sT
	]), Ne = Object.seal(bw(null, {
		tagNameCheck: {
			writable: !0,
			configurable: !1,
			enumerable: !0,
			value: null
		},
		attributeNameCheck: {
			writable: !0,
			configurable: !1,
			enumerable: !0,
			value: null
		},
		allowCustomizedBuiltInElements: {
			writable: !0,
			configurable: !1,
			enumerable: !0,
			value: !1
		}
	})), Pe = null, Fe = null, Ie = Object.seal(bw(null, {
		tagCheck: {
			writable: !0,
			configurable: !1,
			enumerable: !0,
			value: null
		},
		attributeCheck: {
			writable: !0,
			configurable: !1,
			enumerable: !0,
			value: null
		}
	})), Le = !0, Re = !0, ze = !1, Be = !0, Ve = !1, He = !0, Ue = !1, We = !1, Ge = null, Ke = null, qe = !1, Je = !1, Ye = !1, Xe = !1, Ze = !0, Qe = !1, $e = "user-content-", et = !0, tt = !1, nt = {}, rt = null, it = V({}, /* @__PURE__ */ "annotation-xml.audio.colgroup.desc.foreignobject.head.iframe.math.mi.mn.mo.ms.mtext.noembed.noframes.noscript.plaintext.script.selectedcontent.style.svg.template.thead.title.video.xmp".split(".")), at = null, ot = V({}, [
		"audio",
		"video",
		"img",
		"source",
		"image",
		"track"
	]), st = null, ct = V({}, [
		"alt",
		"class",
		"for",
		"id",
		"label",
		"name",
		"pattern",
		"placeholder",
		"role",
		"summary",
		"title",
		"value",
		"style",
		"xmlns"
	]), lt = "http://www.w3.org/1998/Math/MathML", ut = "http://www.w3.org/2000/svg", dt = "http://www.w3.org/1999/xhtml", ft = dt, pt = !1, mt = null, ht = V({}, [
		lt,
		ut,
		dt
	], jw), gt = vw([
		"mi",
		"mo",
		"mn",
		"ms",
		"mtext"
	]), _t = V({}, gt), vt = vw(["annotation-xml"]), yt = V({}, vt), bt = V({}, [
		"title",
		"style",
		"font",
		"a",
		"script"
	]), xt = null, St = ["application/xhtml+xml", "text/html"], Ct = null, wt = null, Tt = n.createElement("form"), Et = function(e) {
		return e instanceof RegExp || e instanceof Function;
	}, Dt = function() {
		let e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
		if (wt && wt === e) return;
		(!e || typeof e != "object") && (e = {}), e = qw(e), xt = St.indexOf(e.PARSER_MEDIA_TYPE) === -1 ? "text/html" : e.PARSER_MEDIA_TYPE, Ct = xt === "application/xhtml+xml" ? jw : Aw, y = kT(e, "ALLOWED_TAGS", je, { transform: Ct }), b = kT(e, "ALLOWED_ATTR", Me, { transform: Ct }), mt = kT(e, "ALLOWED_NAMESPACES", ht, { transform: jw }), st = kT(e, "ADD_URI_SAFE_ATTR", ct, {
			transform: Ct,
			base: ct
		}), at = kT(e, "ADD_DATA_URI_TAGS", ot, {
			transform: Ct,
			base: ot
		}), rt = kT(e, "FORBID_CONTENTS", it, { transform: Ct }), Pe = kT(e, "FORBID_TAGS", qw({}), { transform: Ct }), Fe = kT(e, "FORBID_ATTR", qw({}), { transform: Ct }), nt = Bw(e, "USE_PROFILES") ? e.USE_PROFILES && typeof e.USE_PROFILES == "object" ? qw(e.USE_PROFILES) : e.USE_PROFILES : !1, Le = e.ALLOW_ARIA_ATTR !== !1, Re = e.ALLOW_DATA_ATTR !== !1, ze = e.ALLOW_UNKNOWN_PROTOCOLS || !1, Be = e.ALLOW_SELF_CLOSE_IN_ATTR !== !1, Ve = e.SAFE_FOR_TEMPLATES || !1, He = e.SAFE_FOR_XML !== !1, Ue = e.WHOLE_DOCUMENT || !1, Je = e.RETURN_DOM || !1, Ye = e.RETURN_DOM_FRAGMENT || !1, Xe = e.RETURN_TRUSTED_TYPE || !1, qe = e.FORCE_BODY || !1, Ze = e.SANITIZE_DOM !== !1, Qe = e.SANITIZE_NAMED_PROPS || !1, et = e.KEEP_CONTENT !== !1, tt = e.IN_PLACE || !1, v = Xw(e.ALLOWED_URI_REGEXP) ? e.ALLOWED_URI_REGEXP : pT, ft = typeof e.NAMESPACE == "string" ? e.NAMESPACE : dt, _t = AT(e, "MATHML_TEXT_INTEGRATION_POINTS", () => V({}, gt)), yt = AT(e, "HTML_INTEGRATION_POINTS", () => V({}, vt));
		let t = AT(e, "CUSTOM_ELEMENT_HANDLING", () => bw(null));
		if (Ne = bw(null), Bw(t, "tagNameCheck") && Et(t.tagNameCheck) && (Ne.tagNameCheck = t.tagNameCheck), Bw(t, "attributeNameCheck") && Et(t.attributeNameCheck) && (Ne.attributeNameCheck = t.attributeNameCheck), Bw(t, "allowCustomizedBuiltInElements") && typeof t.allowCustomizedBuiltInElements == "boolean" && (Ne.allowCustomizedBuiltInElements = t.allowCustomizedBuiltInElements), yw(Ne), Ve && (Re = !1), Ye && (Je = !0), nt && (y = V({}, rT), b = bw(null), nt.html === !0 && (V(y, Zw), V(b, iT)), nt.svg === !0 && (V(y, Qw), V(b, aT), V(b, sT)), nt.svgFilters === !0 && (V(y, $w), V(b, aT), V(b, sT)), nt.mathMl === !0 && (V(y, tT), V(b, oT), V(b, sT))), Ie.tagCheck = null, Ie.attributeCheck = null, Bw(e, "ADD_TAGS") && (typeof e.ADD_TAGS == "function" ? Ie.tagCheck = e.ADD_TAGS : kw(e.ADD_TAGS) && (y === je && (y = qw(y)), V(y, e.ADD_TAGS, Ct))), Bw(e, "ADD_ATTR") && (typeof e.ADD_ATTR == "function" ? Ie.attributeCheck = e.ADD_ATTR : kw(e.ADD_ATTR) && (b === Me && (b = qw(b)), V(b, e.ADD_ATTR, Ct))), Bw(e, "ADD_FORBID_CONTENTS") && kw(e.ADD_FORBID_CONTENTS) && (rt === it && (rt = qw(rt)), V(rt, e.ADD_FORBID_CONTENTS, Ct)), et && (y["#text"] = !0), Ue && V(y, [
			"html",
			"head",
			"body"
		]), y.table && (V(y, ["tbody"]), delete Pe.tbody), e.TRUSTED_TYPES_POLICY) {
			if (typeof e.TRUSTED_TYPES_POLICY.createHTML != "function") throw Uw("TRUSTED_TYPES_POLICY configuration option must provide a \"createHTML\" hook.");
			if (typeof e.TRUSTED_TYPES_POLICY.createScriptURL != "function") throw Uw("TRUSTED_TYPES_POLICY configuration option must provide a \"createScriptURL\" hook.");
			let t = le;
			le = e.TRUSTED_TYPES_POLICY;
			try {
				ue = he("");
			} catch (e) {
				throw le = t, e;
			}
		} else e.TRUSTED_TYPES_POLICY === null ? (le = void 0, ue = "") : (le === void 0 && (le = _e()), le && typeof ue == "string" && (ue = he("")));
		vw && vw(e), wt = e;
	}, Ot = V({}, [
		...Qw,
		...$w,
		...eT
	]), kt = V({}, [...tT, ...nT]), At = function(e, t, n) {
		return t.namespaceURI === dt ? e === "svg" : t.namespaceURI === lt ? e === "svg" && (n === "annotation-xml" || _t[n]) : !!Ot[e];
	}, jt = function(e, t, n) {
		return t.namespaceURI === dt ? e === "math" : t.namespaceURI === ut ? e === "math" && yt[n] : !!kt[e];
	}, Mt = function(e, t, n) {
		return t.namespaceURI === ut && !yt[n] || t.namespaceURI === lt && !_t[n] ? !1 : !kt[e] && (bt[e] || !Ot[e]);
	}, Nt = function(e) {
		let t = ne(e);
		(!t || !t.tagName) && (t = {
			namespaceURI: ft,
			tagName: "template"
		});
		let n = Aw(e.tagName), r = Aw(t.tagName);
		return mt[e.namespaceURI] ? e.namespaceURI === ut ? At(n, t, r) : e.namespaceURI === lt ? jt(n, t, r) : e.namespaceURI === dt ? Mt(n, t, r) : !!(xt === "application/xhtml+xml" && mt[e.namespaceURI]) : !1;
	}, Pt = function(e) {
		Dw(t.removed, { element: e });
		try {
			ne(e).removeChild(e);
		} catch {
			if (p(e), !ne(e)) throw Uw("a node selected for removal could not be detached from its tree and cannot be safely returned; refusing to sanitize in place");
		}
	}, Ft = function(e, t, n) {
		try {
			m(e, t);
		} catch {
			try {
				e.removeAttribute(n);
			} catch {}
		}
	}, It = function(e) {
		zt(e);
		let t = te(e);
		if (t) {
			let e = [];
			ww(t, (t) => {
				Dw(e, t);
			}), ww(e, (e) => {
				try {
					p(e);
				} catch {}
			});
		}
		let n = re(e);
		if (n) for (let t = n.length - 1; t >= 0; --t) {
			let r = n[t], i = r && r.name;
			typeof i == "string" && Ft(e, r, i);
		}
	}, Lt = function(e, n, r) {
		if (!r) try {
			r = n.getAttributeNode(e);
		} catch {
			r = null;
		}
		Dw(t.removed, {
			attribute: r || null,
			from: n
		});
		try {
			r ? m(n, r) : n.removeAttribute(e);
		} catch {
			try {
				n.removeAttribute(e);
			} catch {}
		}
		if (e === "is") {
			if (Je || Ye) try {
				Pt(n);
			} catch {}
			else try {
				n.setAttribute(e, "");
			} catch {}
		}
	}, Rt = function(e) {
		let t = re(e);
		if (t) for (let n = t.length - 1; n >= 0; --n) {
			let r = t[n], i = r && r.name;
			typeof i != "string" || b[Ct(i)] || Ft(e, r, i);
		}
	}, zt = function(e) {
		let t = [e];
		for (; t.length > 0;) {
			let e = t.pop();
			se(e) === ST.element && Rt(e);
			let n = te(e);
			if (n) for (let e = n.length - 1; e >= 0; --e) t.push(n[e]);
		}
	}, Bt = function(e, t) {
		return He ? e === "patchsrc" || e === "for" && t !== "label" && t !== "output" : !1;
	}, Vt = function(e) {
		if (!He) return;
		let t = [e];
		for (; t.length > 0;) {
			let e = t.pop(), n = se(e);
			if (n === ST.processingInstruction || n === ST.comment && Hw(yT, e.data)) {
				try {
					p(e);
				} catch {}
				continue;
			}
			if (n === ST.element) {
				let t = e, n = Ct(ce(e));
				try {
					t.hasAttribute && t.hasAttribute("patchsrc") && t.removeAttribute("patchsrc"), t.hasAttribute && t.hasAttribute("for") && Bt("for", n) && t.removeAttribute("for");
				} catch {}
			}
			let r = te(e);
			if (r) for (let e = r.length - 1; e >= 0; --e) t.push(r[e]);
		}
	}, Ht = function(e) {
		let t = null, r = null;
		if (qe) e = "<remove></remove>" + e;
		else {
			let t = Mw(e, /^[\r\n\t ]+/);
			r = t && t[0];
		}
		xt === "application/xhtml+xml" && ft === dt && (e = "<html xmlns=\"http://www.w3.org/1999/xhtml\"><head></head><body>" + e + "</body></html>");
		let i = le ? he(e) : e;
		if (ft === dt) try {
			t = new l().parseFromString(i, xt);
		} catch {}
		if (!t || !t.documentElement) {
			t = ye.createDocument(ft, "template", null);
			try {
				t.documentElement.innerHTML = pt ? ue : i;
			} catch {}
		}
		let a = t.body || t.documentElement;
		return e && r && a.insertBefore(n.createTextNode(r), a.childNodes[0] || null), ft === dt ? Se.call(t, Ue ? "html" : "body")[0] : Ue ? t.documentElement : a;
	}, Ut = function(e) {
		let t = oe ? oe(e) : e.ownerDocument;
		return be.call(t || e, e, c.SHOW_ELEMENT | c.SHOW_COMMENT | c.SHOW_TEXT | c.SHOW_PROCESSING_INSTRUCTION | c.SHOW_CDATA_SECTION, null);
	}, Wt = function(e) {
		return e = Nw(e, _, " "), e = Nw(e, we, " "), e = Nw(e, Te, " "), e;
	}, Gt = function(e) {
		e.normalize();
		let t = oe ? oe(e) : e.ownerDocument, n = be.call(t || e, e, c.SHOW_TEXT | c.SHOW_COMMENT | c.SHOW_CDATA_SECTION | c.SHOW_PROCESSING_INSTRUCTION, null), r = n.nextNode();
		for (; r;) r.data = Wt(r.data), r = n.nextNode();
		let i = e.querySelectorAll?.call(e, "template");
		i && ww(i, (e) => {
			qt(e.content) && Gt(e.content);
		});
	}, Kt = function(e) {
		let t = ae ? ae(e) : null;
		return typeof t != "string" || Ct(t) !== "form" ? !1 : typeof e.nodeName != "string" || typeof e.textContent != "string" || typeof e.removeChild != "function" || e.attributes !== re(e) || typeof e.removeAttribute != "function" || typeof e.removeAttributeNode != "function" || typeof e.getAttributeNode != "function" || typeof e.setAttribute != "function" || typeof e.namespaceURI != "string" || typeof e.insertBefore != "function" || typeof e.hasChildNodes != "function" || e.nodeType !== ie(e) || e.childNodes !== te(e);
	}, qt = function(e) {
		if (!ie || typeof e != "object" || !e) return !1;
		try {
			return ie(e) === ST.documentFragment;
		} catch {
			return !1;
		}
	}, Jt = function(e) {
		if (!ie || typeof e != "object" || !e) return !1;
		try {
			return typeof ie(e) == "number";
		} catch {
			return !1;
		}
	};
	function x(e, n, r) {
		e.length !== 0 && ww(e, (e) => {
			e.call(t, n, r, wt);
		});
	}
	let Yt = function(e, t) {
		return !!(He && e.hasChildNodes() && !Jt(e.firstElementChild) && Hw(vT, e.textContent) && Hw(vT, e.innerHTML) || He && e.namespaceURI === dt && wT[t] && (Jt(e.firstElementChild) || typeof e.textContent == "string" && Hw(TT[t], e.textContent)) || e.nodeType === ST.processingInstruction || He && e.nodeType === ST.comment && Hw(yT, e.data));
	}, Xt = function(e, t) {
		return e instanceof RegExp ? Hw(e, t) : e instanceof Function && !!e(t, ...[...arguments].slice(2));
	}, Zt = function(e, t, n) {
		if (!Pe[t] && rn(t) && Xt(Ne.tagNameCheck, t)) return !1;
		if (et && !rt[t]) {
			let t = ne(e), r = te(e);
			if (r && t) {
				let i = r.length;
				for (let a = i - 1; a >= 0; --a) {
					let i = e === n ? f(r[a], !0) : r[a];
					t.insertBefore(i, ee(e));
				}
			}
		}
		return Pt(e), !0;
	}, Qt = function(e, t, n, r) {
		return e.length === 0 ? t : t === n || t === r ? qw(t) : t;
	}, $t = function(e, t) {
		return e === t || ne(e) !== null ? !1 : (tt && zt(e), !0);
	}, en = function(e, n) {
		if (x(g.beforeSanitizeElements, e, null), $t(e, n)) return !0;
		if (Kt(e)) return Pt(e), !0;
		let r = Ct(ce(e));
		if (y = Qt(g.uponSanitizeElement, y, je, Ge), x(g.uponSanitizeElement, e, {
			tagName: r,
			allowedTags: y
		}), $t(e, n)) return !0;
		if (Yt(e, r)) return Pt(e), !0;
		if (Pe[r] || !(Ie.tagCheck instanceof Function && Ie.tagCheck(r)) && !y[r]) {
			let t = Zt(e, r, n);
			return t === !1 && x(g.afterSanitizeElements, e, null), t;
		}
		if (se(e) === ST.element && !Nt(e) || (r === "noscript" || r === "noembed" || r === "noframes") && Hw(bT, e.innerHTML)) return Pt(e), !0;
		if (Ve && e.nodeType === ST.text) {
			let n = Wt(e.textContent);
			e.textContent !== n && (Dw(t.removed, { element: e.cloneNode() }), e.textContent = n);
		}
		return x(g.afterSanitizeElements, e, null), !1;
	}, tn = function(e, t, r) {
		if (Fe[t] || Bt(t, e) || Ze && (t === "id" || t === "name") && (r in n || r in Tt)) return !1;
		let i = b[t] || Ie.attributeCheck instanceof Function && Ie.attributeCheck(t, e);
		return Re && Hw(Ee, t) || Le && Hw(De, t) ? !0 : i ? st[t] || Hw(v, Nw(r, ke, "")) || (t === "src" || t === "xlink:href" || t === "href") && e !== "script" && Pw(r, "data:") === 0 && at[e] || ze && !Hw(Oe, Nw(r, ke, "")) ? !0 : !r : rn(e) && Xt(Ne.tagNameCheck, e) && Xt(Ne.attributeNameCheck, t, e) || t === "is" && Ne.allowCustomizedBuiltInElements && Xt(Ne.tagNameCheck, r);
	}, nn = V({}, [
		"annotation-xml",
		"color-profile",
		"font-face",
		"font-face-format",
		"font-face-name",
		"font-face-src",
		"font-face-uri",
		"missing-glyph"
	]), rn = function(e) {
		return !nn[Aw(e)] && Hw(Ae, e);
	}, an = function(e, t, n, r) {
		if (le && typeof u == "object" && typeof u.getAttributeType == "function" && !n) switch (u.getAttributeType(e, t)) {
			case "TrustedHTML": return he(r);
			case "TrustedScriptURL": return ge(r);
		}
		return r;
	}, on = function(e, t, n, r) {
		try {
			return n ? e.setAttributeNS(n, t, r) : e.setAttribute(t, r), !Kt(e) || (Pt(e), !1);
		} catch {
			return Lt(t, e), !1;
		}
	}, sn = function(e) {
		x(g.beforeSanitizeAttributes, e, null);
		let n = e.attributes;
		if (!n || Kt(e)) return;
		b = Qt(g.uponSanitizeAttribute, b, Me, Ke);
		let r = {
			attrName: "",
			attrValue: "",
			keepAttr: !0,
			allowedAttributes: b,
			forceKeepAttr: void 0
		}, i = n.length, a = Ct(e.nodeName);
		for (; i--;) {
			let o = n[i], s = o.name, c = o.namespaceURI, l = o.value, u = Ct(s), d = l, f = s === "value" ? d : Fw(d), p = !1;
			if (r.attrName = u, r.attrValue = f, r.keepAttr = !0, r.forceKeepAttr = void 0, x(g.uponSanitizeAttribute, e, r), f = r.attrValue, Qe && (u === "id" || u === "name") && Pw(f, $e) !== 0 && (Lt(s, e, o), f = $e + f, p = !0), He && Hw(/((--!?|])>)|<\/(style|script|title|xmp|textarea|noscript|iframe|noembed|noframes)/i, f)) {
				Lt(s, e, o);
				continue;
			}
			if (u === "attributename" && Mw(f, "href")) {
				Lt(s, e, o);
				continue;
			}
			if (!r.forceKeepAttr) {
				if (!r.keepAttr) {
					Lt(s, e, o);
					continue;
				}
				if (!Be && Hw(xT, f)) {
					Lt(s, e, o);
					continue;
				}
				if (Ve && (f = Wt(f)), !tn(a, u, f)) {
					Lt(s, e, o);
					continue;
				}
				f = an(a, u, c, f), f !== d && on(e, s, c, f) && p && Ew(t.removed);
			}
		}
		x(g.afterSanitizeAttributes, e, null);
	}, cn = function(e) {
		let t = null, n = Ut(e);
		for (x(g.beforeSanitizeShadowDOM, e, null); t = n.nextNode();) if (x(g.uponSanitizeShadowNode, t, null), en(t, e), sn(t), qt(t.content) && cn(t.content), se(t) === ST.element) {
			let e = h(t);
			qt(e) && (ln(e), cn(e));
		}
		x(g.afterSanitizeShadowDOM, e, null);
	}, ln = function(e) {
		let t = [{
			node: e,
			shadow: null
		}];
		for (; t.length > 0;) {
			let e = t.pop();
			if (e.shadow) {
				cn(e.shadow);
				continue;
			}
			let n = e.node, r = se(n) === ST.element, i = te(n);
			if (i) for (let e = i.length - 1; e >= 0; --e) t.push({
				node: i[e],
				shadow: null
			});
			if (r) {
				let e = ae ? ae(n) : null;
				if (typeof e == "string" && Ct(e) === "template") {
					let e = n.content;
					qt(e) && t.push({
						node: e,
						shadow: null
					});
				}
			}
			if (r) {
				let e = h(n);
				qt(e) && t.push({
					node: null,
					shadow: e
				}, {
					node: e,
					shadow: null
				});
			}
		}
	};
	return t.sanitize = function(e) {
		let n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, i = null, a = null, o = null, s = null;
		if (pt = !e, pt && (e = "<!-->"), typeof e != "string" && !Jt(e) && (e = Jw(e), typeof e != "string")) throw Uw("dirty is not a string, aborting");
		if (!t.isSupported) return e;
		We ? (y = Ge, b = Ke) : Dt(n), (g.uponSanitizeElement.length > 0 || g.uponSanitizeAttribute.length > 0) && (y = qw(y)), g.uponSanitizeAttribute.length > 0 && (b = qw(b)), t.removed = [];
		let c = tt && typeof e != "string" && Jt(e);
		if (c) {
			Vt(e);
			let t = ce(e);
			if (typeof t == "string") {
				let n = Ct(t);
				if (!y[n] || Pe[n]) throw It(e), Uw("root node is forbidden and cannot be sanitized in-place");
			}
			if (Kt(e)) throw It(e), Uw("root node is clobbered and cannot be sanitized in-place");
			try {
				ln(e);
			} catch (t) {
				throw It(e), t;
			}
		} else if (Jt(e)) i = Ht("<!---->"), a = i.ownerDocument.importNode(e, !0), a.nodeType === ST.element && a.nodeName === "BODY" || a.nodeName === "HTML" ? i = a : i.appendChild(a), ln(i);
		else {
			if (!Je && !Ve && !Ue && e.indexOf("<") === -1) return le && Xe ? he(e) : e;
			if (i = Ht(e), !i) return Je ? null : Xe ? ue : "";
		}
		i && qe && Pt(i.firstChild);
		let l = c ? e : i;
		try {
			let e = Ut(l);
			for (; o = e.nextNode();) en(o, l), sn(o), qt(o.content) && cn(o.content);
		} catch (n) {
			throw c && (It(e), ww(t.removed, (e) => {
				e.element && zt(e.element);
			})), n;
		}
		if (c) return ww(t.removed, (e) => {
			e.element && zt(e.element);
		}), Ve && Gt(e), e;
		if (Je) {
			if (Ve && Gt(i), Ye) for (s = xe.call(i.ownerDocument); i.firstChild;) s.appendChild(i.firstChild);
			else s = i;
			return (b.shadowroot || b.shadowrootmode) && (s = Ce.call(r, s, !0)), s;
		}
		let u = Ue ? i.outerHTML : i.innerHTML;
		return Ue && y["!doctype"] && i.ownerDocument && i.ownerDocument.doctype && i.ownerDocument.doctype.name && Hw(gT, i.ownerDocument.doctype.name) && (u = "<!DOCTYPE " + i.ownerDocument.doctype.name + ">\n" + u), Ve && (u = Wt(u)), le && Xe ? he(u) : u;
	}, t.setConfig = function() {
		let e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
		Dt(e), We = !0, Ge = y, Ke = b;
	}, t.clearConfig = function() {
		wt = null, We = !1, Ge = null, Ke = null, le = de, ue = "";
	}, t.isValidAttribute = function(e, t, n) {
		wt || Dt({});
		let r = Ct(e), i = Ct(t);
		return tn(r, i, n);
	}, t.addHook = function(e, t) {
		typeof t == "function" && Bw(g, e) && Dw(g[e], t);
	}, t.removeHook = function(e, t) {
		if (Bw(g, e)) {
			if (t !== void 0) {
				let n = Tw(g[e], t);
				return n === -1 ? void 0 : Ow(g[e], n, 1)[0];
			}
			return Ew(g[e]);
		}
	}, t.removeHooks = function(e) {
		Bw(g, e) && (g[e] = []);
	}, t.removeAllHooks = function() {
		g = OT();
	}, t;
}
var MT = jT();
//#endregion
//#region node_modules/zod/v4/core/util.js
function NT(e) {
	let t = Object.values(e).filter((e) => typeof e == "number");
	return Object.entries(e).filter(([e, n]) => t.indexOf(+e) === -1).map(([e, t]) => t);
}
function PT(e, t = "|") {
	return e.map((e) => aE(e)).join(t);
}
function FT(e, t) {
	return typeof t == "bigint" ? t.toString() : t;
}
var IT = class {
	constructor(e) {
		this._getter = e, this._value = void 0;
	}
	get value() {
		let e = this._getter;
		return e !== void 0 && (this._value = e(), this._getter = void 0), this._value;
	}
};
function LT(e) {
	return new IT(e);
}
function RT(e) {
	return e == null;
}
function zT(e) {
	let t = +!!e.startsWith("^"), n = e.endsWith("$") ? e.length - 1 : e.length;
	return e.slice(t, n);
}
function BT(e, t) {
	let n = e / t, r = Math.round(n), i = 4 * 2 ** -52 * Math.max(Math.abs(n), 1);
	return Math.abs(n - r) < i ? 0 : n - r;
}
function VT(e, t, n) {
	Object.defineProperty(e, t, {
		value: n,
		writable: !0,
		enumerable: !0,
		configurable: !0
	});
}
function HT(e) {
	let t = Object.getOwnPropertyDescriptor(e, "shape");
	return t?.get ? t.get.raw : t?.value;
}
function UT(e) {
	return HT(e._zod.def) ?? e._zod.def.shape;
}
function WT(e, t, n) {
	Object.defineProperty(e, t, {
		get() {
			let e = n();
			return VT(this, t, e), e;
		},
		enumerable: !0,
		configurable: !0
	});
}
function GT(e, t, n) {
	t in e ? VT(e, t, n) : e[t] = n;
}
function KT(e, t, n, r) {
	let i = UT(t);
	for (let a of n) {
		let n = Object.getOwnPropertyDescriptor(i, a);
		n.enumerable && (n.get ? WT(e, a, () => {
			let e = t._zod.def.shape[a];
			return r ? r(e, a) : e;
		}) : GT(e, a, r ? r(n.value, a) : n.value));
	}
}
function qT(e, t) {
	for (let n of Reflect.ownKeys(t)) {
		let r = Object.getOwnPropertyDescriptor(t, n);
		r.enumerable && (r.get ? WT(e, n, () => t[n]) : GT(e, n, r.value));
	}
}
function JT(...e) {
	let t = {};
	for (let n of e) {
		let e = Object.getOwnPropertyDescriptors(n);
		Object.assign(t, e);
	}
	return Object.defineProperties({}, t);
}
function YT(e) {
	return JSON.stringify(e);
}
function XT(e) {
	return e.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
}
var ZT = "captureStackTrace" in Error ? Error.captureStackTrace : (...e) => {};
function QT(e) {
	return typeof e == "object" && !!e && !Array.isArray(e);
}
var $T = /* @__PURE__*/ LT(() => {
	if (qE.jitless || typeof navigator < "u" && navigator?.userAgent?.includes("Cloudflare")) return !1;
	try {
		return Function(""), !0;
	} catch {
		return !1;
	}
});
function eE(e) {
	if (QT(e) === !1) return !1;
	let t = e.constructor;
	if (t === void 0 || typeof t != "function") return !0;
	let n = t.prototype;
	return QT(n) !== !1 && Object.prototype.hasOwnProperty.call(n, "isPrototypeOf") !== !1;
}
function tE(e) {
	return eE(e) ? { ...e } : Array.isArray(e) ? [...e] : e instanceof Map ? new Map(e) : e instanceof Set ? new Set(e) : e;
}
var nE = /* @__PURE__*/ new Set([
	"string",
	"number",
	"symbol"
]);
function rE(e) {
	return e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function iE(e, t, n) {
	let r = new e._zod.constr(t ?? e._zod.def);
	return (!t || n?.parent) && (r._zod.parent = e), r;
}
function H(e) {
	let t = e;
	if (!t) return {};
	if (typeof t == "string") return { error: () => t };
	if (t?.message !== void 0) {
		if (t?.error !== void 0) throw Error("Cannot specify both `message` and `error` params");
		t.error = t.message;
	}
	return delete t.message, typeof t.error == "string" ? {
		...t,
		error: () => t.error
	} : t;
}
function aE(e) {
	return typeof e == "bigint" ? e.toString() + "n" : typeof e == "string" ? `"${e}"` : `${e}`;
}
function oE(e) {
	return Object.keys(e).filter((t) => e[t]._zod.optin !== void 0 && e[t]._zod.optout === "optional");
}
var sE = {
	safeint: [-(2 ** 53 - 1), 2 ** 53 - 1],
	int32: [-2147483648, 2147483647],
	uint32: [0, 4294967295],
	float32: [-34028234663852886e22, 34028234663852886e22],
	float64: [-Number.MAX_VALUE, Number.MAX_VALUE]
}, cE = {
	int64: [/* @__PURE__*/ BigInt("-9223372036854775808"), /* @__PURE__*/ BigInt("9223372036854775807")],
	uint64: [/* @__PURE__*/ BigInt(0), /* @__PURE__*/ BigInt("18446744073709551615")]
};
function lE(e, t) {
	let n = e._zod.def, r = n.checks;
	if (r && r.length > 0) throw Error(".pick() cannot be used on object schemas containing refinements");
	let i = {};
	return KT(i, e, uE(e, t)), iE(e, JT(n, {
		shape: i,
		checks: []
	}));
}
function uE(e, t) {
	let n = UT(e), r = [];
	for (let e of Reflect.ownKeys(t)) {
		if (!Object.getOwnPropertyDescriptor(n, e)?.enumerable) throw Error(`Unrecognized key: "${String(e)}"`);
		t[e] && r.push(e);
	}
	return r;
}
function dE(e, t) {
	let n = e._zod.def, r = n.checks;
	if (r && r.length > 0) throw Error(".omit() cannot be used on object schemas containing refinements");
	let i = new Set(uE(e, t)), a = {};
	return KT(a, e, Reflect.ownKeys(UT(e)).filter((e) => !i.has(e))), iE(e, JT(n, {
		shape: a,
		checks: []
	}));
}
function fE(e, t) {
	if (!eE(t)) throw Error("Invalid input to extend: expected a plain object");
	let n = e._zod.def.checks;
	if (n && n.length > 0) {
		let n = UT(e);
		for (let e of Reflect.ownKeys(t)) if (Object.getOwnPropertyDescriptor(n, e) !== void 0) throw Error("Cannot overwrite keys on object schemas containing refinements. Use `.safeExtend()` instead.");
	}
	return iE(e, JT(e._zod.def, { shape: pE(e, t) }));
}
function pE(e, t) {
	let n = {};
	return KT(n, e, Reflect.ownKeys(UT(e))), qT(n, t), n;
}
function mE(e, t) {
	if (!eE(t)) throw Error("Invalid input to safeExtend: expected a plain object");
	return iE(e, JT(e._zod.def, { shape: pE(e, t) }));
}
function hE(e, t) {
	if (!t?._zod?.def) throw Error("Invalid input to merge: expected an object schema. To merge a plain shape, use `.extend()`.");
	if (e._zod.def.checks?.length) throw Error(".merge() cannot be used on object schemas containing refinements. Use .safeExtend() instead.");
	let n = {};
	return KT(n, e, Reflect.ownKeys(UT(e))), KT(n, t, Reflect.ownKeys(UT(t))), iE(e, JT(e._zod.def, {
		shape: n,
		get catchall() {
			return t._zod.def.catchall;
		},
		checks: t._zod.def.checks ?? []
	}));
}
function gE(e, t, n, r = "partial") {
	let i = t._zod.def.checks;
	if (i && i.length > 0) throw Error(`.${r}() cannot be used on object schemas containing refinements`);
	let a = n ? new Set(uE(t, n)) : void 0, o = {};
	return KT(o, t, Reflect.ownKeys(UT(t)), e && ((t, n) => a && !a.has(n) ? t : new e({
		type: "optional",
		innerType: t
	}))), iE(t, JT(t._zod.def, {
		shape: o,
		checks: []
	}));
}
function _E(e, t, n) {
	let r = n ? new Set(uE(t, n)) : void 0, i = {};
	return KT(i, t, Reflect.ownKeys(UT(t)), (t, n) => r && !r.has(n) ? t : new e({
		type: "nonoptional",
		innerType: t
	})), iE(t, JT(t._zod.def, { shape: i }));
}
function vE(e, t = 0) {
	if (e.aborted === !0) return !0;
	for (let n = t; n < e.issues.length; n++) if (e.issues[n]?.continue !== !0) return !0;
	return !1;
}
function yE(e, t = 0) {
	if (e.aborted === !0) return !0;
	for (let n = t; n < e.issues.length; n++) if (e.issues[n]?.continue === !1) return !0;
	return !1;
}
function bE(e, t) {
	return t.map((t) => {
		var n;
		return (n = t).path ?? (n.path = []), t.path.unshift(e), t;
	});
}
function xE(e) {
	return typeof e == "string" ? e : e?.message;
}
function SE(e, t, n) {
	var r;
	for (let i = t; i < e.length; i++) (r = e[i]).schema ?? (r.schema = n);
}
function CE(e, t, n) {
	var r;
	let i = e.inst?._zod?.traits;
	i?.has("$ZodType") && (i.has("$ZodCheck") ? (r = e).schema ?? (r.schema = e.inst) : e.schema = e.inst);
	let a = e.schema === e.inst ? void 0 : e.schema?._zod.def?.error, o = e.message ? e.message : xE(e.inst?._zod.def?.error?.(e)) ?? xE(a?.(e)) ?? xE(t?.error?.(e)) ?? xE(n.customError?.(e)) ?? xE(n.localeError?.(e)) ?? "Invalid input", s = {};
	for (let t of Object.keys(e)) t !== "inst" && t !== "schema" && t !== "continue" && t !== "input" && t !== "__proto__" && (s[t] = e[t]);
	return s.path ??= [], s.message = o, t?.reportInput && (s.input = e.input), s;
}
var wE = /[\uD800-\uDBFF]/;
function TE(e) {
	let t = e.length;
	if (!wE.test(e)) return t;
	let n = t;
	for (let r = 0; r < t - 1; r++) (e.charCodeAt(r) & 64512) == 55296 && (e.charCodeAt(r + 1) & 64512) == 56320 && (n--, r++);
	return n;
}
function EE(e) {
	return Array.isArray(e) ? "array" : typeof e == "string" ? "string" : "unknown";
}
function DE(e) {
	let t = typeof e;
	switch (t) {
		case "number": return Number.isNaN(e) ? "nan" : "number";
		case "object": {
			if (e === null) return "null";
			if (Array.isArray(e)) return "array";
			let t = e;
			if (t && Object.getPrototypeOf(t) !== Object.prototype && "constructor" in t && t.constructor) return t.constructor.name;
		}
	}
	return t;
}
function OE(...e) {
	let [t, n, r] = e;
	return typeof t == "string" ? {
		message: t,
		code: "custom",
		input: n,
		inst: r
	} : { ...t };
}
function kE(e, t) {
	for (let n in t) {
		let r = Object.getOwnPropertyDescriptor(t, n);
		r.get ? Object.defineProperty(e, n, {
			...r,
			enumerable: !1
		}) : NE(e, n, r.value);
	}
}
function AE(e, t, n, r = !0) {
	return Object.defineProperty(e, t, {
		configurable: !0,
		writable: !0,
		enumerable: r,
		value: n
	}), n;
}
function jE(e, t, n) {
	return AE(e, t, n, !1);
}
function ME(e, t) {
	for (let n in e) {
		let r = e[n];
		Object.defineProperty(t, n, {
			configurable: !0,
			enumerable: !0,
			get() {
				return AE(this, n, r(this));
			},
			set(e) {
				AE(this, n, e);
			}
		});
	}
	return t;
}
function NE(e, t, n) {
	Object.defineProperty(e, t, {
		configurable: !0,
		get() {
			return this == null ? n : AE(this, t, n.bind(this));
		},
		set(e) {
			AE(this, t, e);
		}
	});
}
function PE(e, t) {
	let n = Object.getPrototypeOf(e);
	return t in n ? void 0 : n;
}
var FE, IE = !1, LE = {
	configurable: !0,
	get() {
		IE = !0;
	}
};
function U(e, t, n) {
	let r = Object.getPrototypeOf(e._zod);
	if (t in r && FE !== e._zod) {
		FE = void 0;
		return;
	}
	FE = e._zod, Object.defineProperty(r, t, {
		configurable: !0,
		get() {
			Object.defineProperty(this, t, LE);
			let e = IE;
			IE = !1;
			try {
				let r = n(this);
				return IE ? delete this[t] : Object.defineProperty(this, t, {
					configurable: !0,
					writable: !0,
					value: r
				}), IE ||= e, r;
			} catch (n) {
				throw delete this[t], IE ||= e, n;
			}
		},
		set(e) {
			Object.defineProperty(this, t, {
				configurable: !0,
				writable: !0,
				value: e
			});
		}
	});
}
function RE(e, t, n, r) {
	let i = PE(e, t);
	i && Object.defineProperty(i, t, {
		configurable: !0,
		get() {
			let e = {
				configurable: !0,
				writable: !0,
				enumerable: r,
				value: void 0
			};
			return Object.defineProperty(this, t, e), e.value = n(this), Object.defineProperty(this, t, e), e.value;
		},
		set(e) {
			Object.defineProperty(this, t, {
				configurable: !0,
				writable: !0,
				enumerable: r,
				value: e
			});
		}
	});
}
var zE = "~constantCatch";
function BE(e) {
	let t = () => e;
	return t[zE] = !0, t;
}
//#endregion
//#region node_modules/zod/v4/core/core.js
var VE, HE = {
	value: void 0,
	enumerable: !1
}, UE = "captureStackTrace" in Error ? Error : null;
function WE(e) {
	let t = UE;
	if (t) {
		let n = t.stackTraceLimit;
		if (typeof n == "number") {
			try {
				t.stackTraceLimit = 0;
			} catch {
				return UE = null, new e();
			}
			try {
				return new e();
			} finally {
				t.stackTraceLimit = n;
			}
		}
	}
	return new e();
}
function W(e, t, n, r) {
	let i = {};
	function a(e) {
		this.def = e, this.constr = d, this.traits = /* @__PURE__ */ new Set();
	}
	a.prototype = i;
	let o = n, s = o && /* @__PURE__ */ new WeakSet();
	function c(n, r) {
		if (!n._zod) {
			HE.value = new a(r);
			try {
				Object.defineProperty(n, "_zod", HE);
			} finally {
				HE.value = void 0;
			}
		} else if (n._zod.traits.has(e)) return;
		if (n._zod.traits.add(e), t(n, r), s) {
			let e = Object.getPrototypeOf(n), t = n._zod.constr.prototype, r = e;
			for (; r && r !== t;) r = Object.getPrototypeOf(r);
			let i = r ?? e;
			s.has(i) || (s.add(i), kE(i, o));
		}
		let i = d.prototype;
		for (let e in i) Object.prototype.hasOwnProperty.call(i, e) && (e in n || (n[e] = i[e].bind(n)));
	}
	let l = r?.Parent ?? Object;
	class u extends l {}
	Object.defineProperty(u, "name", { value: e });
	function d(e) {
		let t = r?.Parent ? WE(u) : this;
		c(t, e);
		let n = t._zod.deferred;
		if (n) {
			for (let e of n) e();
			t._zod.deferred = void 0;
		}
		let i = globalThis.__zod_globalConfig?.postProcessor;
		return i && i(t), t;
	}
	return Object.defineProperty(d, "init", { value: c }), Object.defineProperty(d, Symbol.hasInstance, { value: (t) => r?.Parent && t instanceof r.Parent ? !0 : t?._zod?.traits?.has(e) }), Object.defineProperty(d, "name", { value: e }), d;
}
var GE = class extends Error {
	constructor() {
		super("Encountered Promise during synchronous parse. Use .parseAsync() instead.");
	}
}, KE = class extends Error {
	constructor(e) {
		super(`Encountered unidirectional transform during encode: ${e}`), this.name = "ZodEncodeError";
	}
};
(VE = globalThis).__zod_globalConfig ?? (VE.__zod_globalConfig = {});
var qE = globalThis.__zod_globalConfig;
function JE(e) {
	return e && Object.assign(qE, e), qE;
}
//#endregion
//#region node_modules/zod/v4/core/errors.js
function YE() {
	let e = this._zod;
	return e.message ??= JSON.stringify(e.def, FT, 2), e.message;
}
function XE(e) {
	this._zod.message = e;
}
var ZE = {
	get: YE,
	set: XE,
	enumerable: !0,
	configurable: !0
}, QE = {
	value: void 0,
	enumerable: !1
}, $E = /* @__PURE__ */ new WeakSet([Object.prototype, Error.prototype]), eD = (e, t) => {
	e.name = "$ZodError", QE.value = t, Object.defineProperty(e, "issues", QE), QE.value = void 0, Object.defineProperty(e, "message", ZE);
	let n = Object.getPrototypeOf(e);
	$E.has(n) || ($E.add(n), Object.defineProperty(n, "toString", {
		configurable: !0,
		enumerable: !1,
		get() {
			let e = () => this.message;
			return Object.defineProperty(this, "toString", {
				value: e,
				configurable: !0,
				writable: !0
			}), e;
		},
		set(e) {
			Object.defineProperty(this, "toString", {
				value: e,
				configurable: !0,
				writable: !0
			});
		}
	}));
}, tD = W("$ZodError", eD);
W("$ZodError", eD, void 0, { Parent: Error });
function nD(e, t, n) {
	return Object.prototype.hasOwnProperty.call(e, t) || (t === "__proto__" ? Object.defineProperty(e, t, {
		value: n(),
		writable: !0,
		enumerable: !0,
		configurable: !0
	}) : e[t] = n()), e[t];
}
function rD(e, t = (e) => e.message) {
	let n = {}, r = [];
	for (let i of e.issues) i.path.length > 0 ? nD(n, i.path[0], () => []).push(t(i)) : r.push(t(i));
	return {
		formErrors: r,
		fieldErrors: n
	};
}
function iD(e, t = (e) => e.message) {
	let n = { _errors: [] }, r = (e, i = []) => {
		for (let a of e.issues) if (a.code === "invalid_union" && a.errors.length) a.errors.map((e) => r({ issues: e }, [...i, ...a.path]));
		else if (a.code === "invalid_key") r({ issues: a.issues }, [...i, ...a.path]);
		else if (a.code === "invalid_element") r({ issues: a.issues }, [...i, ...a.path]);
		else {
			let e = [...i, ...a.path];
			if (e.length === 0) n._errors.push(t(a));
			else {
				let r = n, i = 0;
				for (; i < e.length;) {
					let n = e[i], o = i === e.length - 1;
					if (n === "_errors") {
						o && r._errors.push(t(a)), i++;
						continue;
					}
					Object.prototype.hasOwnProperty.call(r, n) || Object.defineProperty(r, n, {
						value: { _errors: [] },
						enumerable: !0,
						writable: !0,
						configurable: !0
					});
					let s = r[n];
					o && s._errors.push(t(a)), r = s, i++;
				}
			}
		}
	};
	return r(e), n;
}
//#endregion
//#region node_modules/zod/v4/core/parse.js
function aD(e, t) {
	return {
		callee: t?.callee ?? e,
		Err: t?.Err
	};
}
var oD = (e) => {
	let t = (n, r, i, a) => {
		let o = i ? {
			...i,
			async: !1
		} : { async: !1 }, s = n._zod.run({
			value: r,
			issues: []
		}, o);
		if (s instanceof Promise) throw new GE();
		if (s.issues.length) {
			let n = new ((a?.Err) ?? e)(s.issues.map((e) => CE(e, o, JE())));
			throw ZT(n, a?.callee ?? t), n;
		}
		return s.value;
	};
	return t;
}, sD = (e) => {
	let t = async (n, r, i, a) => {
		let o = i ? {
			...i,
			async: !0
		} : { async: !0 }, s = n._zod.run({
			value: r,
			issues: []
		}, o);
		if (s instanceof Promise && (s = await s), s.issues.length) {
			let n = new ((a?.Err) ?? e)(s.issues.map((e) => CE(e, o, JE())));
			throw ZT(n, a?.callee ?? t), n;
		}
		return s.value;
	};
	return t;
}, cD = (e) => (t, n, r) => {
	let i = r ? {
		...r,
		async: !1
	} : { async: !1 }, a = t._zod.run({
		value: n,
		issues: []
	}, i);
	if (a instanceof Promise) throw new GE();
	return a.issues.length ? lD(e, a.issues, i) : {
		success: !0,
		data: a.value
	};
};
function lD(e, t, n) {
	let r;
	return {
		success: !1,
		get error() {
			return r || (r = new e(t.map((e) => CE(e, n, JE()))), t = void 0, n = void 0), r;
		},
		set error(e) {
			r = e, t = void 0, n = void 0;
		}
	};
}
var uD = (e) => async (t, n, r) => {
	let i = r ? {
		...r,
		async: !0
	} : { async: !0 }, a = t._zod.run({
		value: n,
		issues: []
	}, i);
	return a instanceof Promise && (a = await a), a.issues.length ? lD(e, a.issues, i) : {
		success: !0,
		data: a.value
	};
}, dD = /* @__PURE__ */ Symbol.for("zod.compile.invalid"), fD = /* @__PURE__ */ Symbol.for("zod.compile.fallback"), pD = ((e, t, n) => {
	let r = e._zod.bag.validator;
	if (r !== void 0) {
		if (r(t) !== dD) return !0;
		if (r.definite === !0 && n === void 0) return !1;
	}
	return mD(e, t, n);
});
function mD(e, t, n) {
	let r = n ? {
		...n,
		async: !1,
		abortEarly: !0
	} : {
		async: !1,
		abortEarly: !0
	}, i = e._zod.bag.fallbackRun, a;
	if (i ? (r[fD] = !0, a = i({
		value: t,
		issues: []
	}, r)) : a = e._zod.run({
		value: t,
		issues: []
	}, r), a instanceof Promise) throw new GE();
	return a.issues.length === 0;
}
var hD = async (e, t, n) => {
	let r = n ? {
		...n,
		async: !0,
		abortEarly: !0
	} : {
		async: !0,
		abortEarly: !0
	}, i = e._zod.run({
		value: t,
		issues: []
	}, r);
	return i instanceof Promise && (i = await i), i.issues.length === 0;
}, gD = (e) => {
	let t = oD(e), n = (e, r, i, a) => {
		let o = i ? {
			...i,
			direction: "backward"
		} : { direction: "backward" };
		return t(e, r, o, aD(n, a));
	};
	return n;
}, _D = (e) => {
	let t = oD(e), n = (e, r, i, a) => t(e, r, i, aD(n, a));
	return n;
}, vD = (e) => {
	let t = sD(e), n = async (e, r, i, a) => {
		let o = i ? {
			...i,
			direction: "backward"
		} : { direction: "backward" };
		return await t(e, r, o, aD(n, a));
	};
	return n;
}, yD = (e) => {
	let t = sD(e), n = async (e, r, i, a) => await t(e, r, i, aD(n, a));
	return n;
}, bD = (e) => (t, n, r) => {
	let i = r ? {
		...r,
		direction: "backward"
	} : { direction: "backward" };
	return cD(e)(t, n, i);
}, xD = (e) => (t, n, r) => cD(e)(t, n, r), SD = (e) => async (t, n, r) => {
	let i = r ? {
		...r,
		direction: "backward"
	} : { direction: "backward" };
	return uD(e)(t, n, i);
}, CD = (e) => async (t, n, r) => uD(e)(t, n, r), wD = /^[cC][0-9a-z]{6,}$/, TD = /^[0-9a-z]+$/, ED = /^[0-7][0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{25}$/, DD = /^[0-9a-vA-V]{20}$/, OD = /^[A-Za-z0-9]{27}$/, kD = /^[a-zA-Z0-9_-]{21}$/;
function AD(e) {
	return RegExp(`^[a-zA-Z0-9_-]{${e}}$`);
}
var jD = /^P(?:(\d+W)|(?!.*W)(?=\d|T\d)(\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+([.,]\d+)?S)?)?)$/, MD = /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/, ND = (e) => e ? RegExp(`^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-${e}[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})$`) : /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/, PD = /^(?:[A-Za-z0-9_'+\-]+\.)*[A-Za-z0-9_'+\-]*[A-Za-z0-9_+-]@(?:[A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/, FD = "^(?=[\\s\\S]*[\\p{Extended_Pictographic}\\p{Regional_Indicator}\\u20E3])[\\p{Extended_Pictographic}\\p{Emoji_Component}]+$";
function ID() {
	return new RegExp(FD, "u");
}
var LD = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/, RD = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$/, zD = /^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/([0-9]|[1-2][0-9]|3[0-2])$/, BD = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/, VD = /^$|^(?:[0-9a-zA-Z+/]{4})*(?:(?:[0-9a-zA-Z+/]{2}==)|(?:[0-9a-zA-Z+/]{3}=))?$/, HD = /^(?:[A-Za-z0-9_-]{4})*(?:[A-Za-z0-9_-]{2,3})?$/, UD = /^https?$/, WD = /^\+[1-9]\d{6,14}$/, GD = "(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))";
function KD(e) {
	return RegExp(`^${e}$`);
}
var qD = /*@__PURE__*/ KD(GD);
function JD(e) {
	let t = "(?:[01]\\d|2[0-3]):[0-5]\\d";
	return typeof e.precision == "number" ? e.precision === -1 ? `${t}` : e.precision === 0 ? `${t}:[0-5]\\d` : `${t}:[0-5]\\d\\.\\d{${e.precision}}` : e.seconds ? `${t}:[0-5]\\d(?:\\.\\d+)?` : `${t}(?::[0-5]\\d(?:\\.\\d+)?)?`;
}
function YD(e) {
	return RegExp(`^${JD(e)}$`);
}
function XD(e) {
	let t = ["Z"];
	e.offset && t.push("([+-](?:[01]\\d|2[0-3]):[0-5]\\d)");
	let n = `${JD({
		precision: e.precision,
		seconds: !0
	})}(?:${t.join("|")})`, r = e.local ? `${n}|${JD({ precision: e.precision })}` : n;
	return RegExp(`^${GD}T(?:${r})$`);
}
var ZD = /^[\s\S]{0,}$/, QD = /^-?\d+(?:\.\d+)?$/, $D = /^(?:true|false)$/i, eO = /^[^A-Z]*$/, tO = /^[^a-z]*$/, nO = /*@__PURE__*/ W("$ZodCheck", (e, t) => {
	var n;
	e._zod ??= {}, e._zod.def = t, (n = e._zod).onattach ?? (n.onattach = []);
}), rO = (e) => {
	let t = e.value;
	return !RT(t) && t.length !== void 0;
}, iO = {
	number: "number",
	bigint: "bigint",
	object: "date"
}, aO = /*@__PURE__*/ W("$ZodCheckLessThan", (e, t) => {
	nO.init(e, t);
	let n = iO[typeof t.value];
	e._zod.check = (r) => {
		(t.inclusive ? r.value <= t.value : r.value < t.value) || r.issues.push({
			origin: iO[typeof r.value] ?? n,
			code: "too_big",
			maximum: typeof t.value == "object" ? t.value.getTime() : t.value,
			input: r.value,
			inclusive: t.inclusive,
			inst: e,
			continue: !t.abort
		});
	};
}), oO = /*@__PURE__*/ W("$ZodCheckGreaterThan", (e, t) => {
	nO.init(e, t);
	let n = iO[typeof t.value];
	e._zod.check = (r) => {
		(t.inclusive ? r.value >= t.value : r.value > t.value) || r.issues.push({
			origin: iO[typeof r.value] ?? n,
			code: "too_small",
			minimum: typeof t.value == "object" ? t.value.getTime() : t.value,
			input: r.value,
			inclusive: t.inclusive,
			inst: e,
			continue: !t.abort
		});
	};
}), sO = /*@__PURE__*/ W("$ZodCheckMultipleOf", (e, t) => {
	nO.init(e, t), e._zod.check = (n) => {
		if (typeof n.value != typeof t.value) throw Error("Cannot mix number and bigint in multiple_of check.");
		(typeof n.value == "bigint" ? t.value !== BigInt(0) && n.value % t.value === BigInt(0) : BT(n.value, t.value) === 0) || n.issues.push({
			origin: typeof n.value,
			code: "not_multiple_of",
			divisor: t.value,
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
}), cO = /*@__PURE__*/ W("$ZodCheckNumberFormat", (e, t) => {
	nO.init(e, t), t.format = t.format || "float64";
	let n = t.format?.includes("int"), r = n ? "int" : "number", [i, a] = sE[t.format];
	e._zod.check = (o) => {
		let s = o.value;
		if (n) {
			if (!Number.isInteger(s)) {
				o.issues.push({
					expected: r,
					format: t.format,
					code: "invalid_type",
					continue: !1,
					input: s,
					inst: e
				});
				return;
			}
			if (!Number.isSafeInteger(s)) {
				s > 0 ? o.issues.push({
					input: s,
					code: "too_big",
					maximum: 2 ** 53 - 1,
					note: "Integers must be within the safe integer range.",
					inst: e,
					origin: r,
					inclusive: !0,
					continue: !t.abort
				}) : o.issues.push({
					input: s,
					code: "too_small",
					minimum: -(2 ** 53 - 1),
					note: "Integers must be within the safe integer range.",
					inst: e,
					origin: r,
					inclusive: !0,
					continue: !t.abort
				});
				return;
			}
		}
		s < i && o.issues.push({
			origin: "number",
			input: s,
			code: "too_small",
			minimum: i,
			inclusive: !0,
			inst: e,
			continue: !t.abort
		}), s > a && o.issues.push({
			origin: "number",
			input: s,
			code: "too_big",
			maximum: a,
			inclusive: !0,
			inst: e,
			continue: !t.abort
		});
	};
}), lO = /*@__PURE__*/ W("$ZodCheckMaxLength", (e, t) => {
	var n;
	nO.init(e, t), (n = e._zod.def).when ?? (n.when = rO), e._zod.check = (n) => {
		let r = n.value, i = r.length;
		if ((typeof r == "string" && i > t.maximum ? TE(r) : i) <= t.maximum) return;
		let a = EE(r);
		n.issues.push({
			origin: a,
			code: "too_big",
			maximum: t.maximum,
			inclusive: !0,
			input: r,
			inst: e,
			continue: !t.abort
		});
	};
}), uO = /*@__PURE__*/ W("$ZodCheckMinLength", (e, t) => {
	var n;
	nO.init(e, t), (n = e._zod.def).when ?? (n.when = rO), e._zod.check = (n) => {
		let r = n.value, i = r.length;
		if ((typeof r == "string" && i >= t.minimum && i < t.minimum * 2 ? TE(r) : i) >= t.minimum) return;
		let a = EE(r);
		n.issues.push({
			origin: a,
			code: "too_small",
			minimum: t.minimum,
			inclusive: !0,
			input: r,
			inst: e,
			continue: !t.abort
		});
	};
}), dO = /*@__PURE__*/ W("$ZodCheckLengthEquals", (e, t) => {
	var n;
	nO.init(e, t), (n = e._zod.def).when ?? (n.when = rO), e._zod.check = (n) => {
		let r = n.value, i = r.length, a = typeof r == "string" && i >= t.length && i <= t.length * 2 ? TE(r) : i;
		if (a === t.length) return;
		let o = EE(r), s = a > t.length;
		n.issues.push({
			origin: o,
			...s ? {
				code: "too_big",
				maximum: t.length
			} : {
				code: "too_small",
				minimum: t.length
			},
			inclusive: !0,
			exact: !0,
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
}), fO = /*@__PURE__*/ W("$ZodCheckStringFormat", (e, t) => {
	var n, r;
	nO.init(e, t), t.pattern ? (n = e._zod).check ?? (n.check = (n) => {
		t.pattern.lastIndex = 0, !t.pattern.test(n.value) && n.issues.push({
			origin: "string",
			code: "invalid_format",
			format: t.format,
			input: n.value,
			...t.pattern ? { pattern: t.pattern.toString() } : {},
			inst: e,
			continue: !t.abort
		});
	}) : (r = e._zod).check ?? (r.check = () => {});
}), pO = /*@__PURE__*/ W("$ZodCheckRegex", (e, t) => {
	fO.init(e, t), e._zod.check = (n) => {
		t.pattern.lastIndex = 0, !t.pattern.test(n.value) && n.issues.push({
			origin: "string",
			code: "invalid_format",
			format: "regex",
			input: n.value,
			pattern: t.pattern.toString(),
			inst: e,
			continue: !t.abort
		});
	};
}), mO = /*@__PURE__*/ W("$ZodCheckLowerCase", (e, t) => {
	t.pattern ??= eO, fO.init(e, t);
}), hO = /*@__PURE__*/ W("$ZodCheckUpperCase", (e, t) => {
	t.pattern ??= tO, fO.init(e, t);
}), gO = /*@__PURE__*/ W("$ZodCheckIncludes", (e, t) => {
	nO.init(e, t);
	let n = rE(t.includes);
	t.pattern = new RegExp(typeof t.position == "number" ? `^.{${t.position},}${n}` : n), e._zod.check = (n) => {
		n.value.includes(t.includes, t.position) || n.issues.push({
			origin: "string",
			code: "invalid_format",
			format: "includes",
			includes: t.includes,
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
}), _O = /*@__PURE__*/ W("$ZodCheckStartsWith", (e, t) => {
	nO.init(e, t);
	let n = RegExp(`^${rE(t.prefix)}.*`);
	t.pattern ??= n, e._zod.check = (n) => {
		n.value.startsWith(t.prefix) || n.issues.push({
			origin: "string",
			code: "invalid_format",
			format: "starts_with",
			prefix: t.prefix,
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
}), vO = /*@__PURE__*/ W("$ZodCheckEndsWith", (e, t) => {
	nO.init(e, t);
	let n = RegExp(`.*${rE(t.suffix)}$`);
	t.pattern ??= n, e._zod.check = (n) => {
		n.value.endsWith(t.suffix) || n.issues.push({
			origin: "string",
			code: "invalid_format",
			format: "ends_with",
			suffix: t.suffix,
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
}), yO = /*@__PURE__*/ W("$ZodCheckOverwrite", (e, t) => {
	nO.init(e, t), e._zod.check = (e) => {
		e.value = t.tx(e.value);
	};
}), bO = class {
	constructor(e = [], t = {}) {
		this.content = [], this.indent = 0, this.args = e, this.closed = t;
	}
	indented(e) {
		this.indent += 1;
		try {
			e(this);
		} finally {
			--this.indent;
		}
	}
	write(e) {
		if (typeof e == "function") {
			e(this, { execution: "sync" }), e(this, { execution: "async" });
			return;
		}
		let t = e.split("\n").filter((e) => e), n = Math.min(...t.map((e) => e.length - e.trimStart().length)), r = t.map((e) => e.slice(n)).map((e) => " ".repeat(this.indent * 2) + e);
		for (let e of r) this.content.push(e);
	}
	compile() {
		let e = Function, t = this?.content ?? [""];
		return new e(...Object.keys(this.closed), `return function (${this.args.join(", ")}) {\n${t.join("\n")}\n};`)(...Object.values(this.closed));
	}
}, xO = {
	major: 4,
	minor: 6,
	patch: 5
}, SO = /*@__PURE__*/ W("$ZodType", (e, t) => {
	var n;
	e ??= {}, e._zod.def = t, e._zod.bag = e._zod.bag || {}, e._zod.version = xO;
	let r = e._zod.def.checks, i = e._zod.traits.has("$ZodCheck") ? [e, ...r ?? []] : r?.length ? [...r] : [];
	for (let t of i) for (let n of t._zod.onattach) n(e);
	if (i.length === 0) (n = e._zod).deferred ?? (n.deferred = []), e._zod.deferred?.push(() => {
		e._zod.run = e._zod.parse;
	});
	else {
		let t = (t, n, r) => {
			if (t.memo) return t;
			let i = vE(t), a;
			for (let o of n) {
				if (o._zod.def.when) {
					if (yE(t) || !o._zod.def.when(t)) continue;
				} else if (i) continue;
				let n = t.issues.length, s = o._zod.check(t);
				if (s instanceof Promise && r?.async === !1) throw new GE();
				if (a || s instanceof Promise) a = (a ?? Promise.resolve()).then(async () => {
					await s, t.issues.length !== n && (SE(t.issues, n, e), i ||= vE(t, n));
				});
				else {
					if (t.issues.length === n) continue;
					SE(t.issues, n, e), i ||= vE(t, n);
				}
			}
			return a ? a.then(() => t) : t;
		}, n = (n, r, a) => {
			if (vE(n)) return n.aborted = !0, n;
			let o = t(r, i, a);
			if (o instanceof Promise) {
				if (a.async === !1) throw new GE();
				return o.then((t) => e._zod.parse(t, a));
			}
			return e._zod.parse(o, a);
		};
		e._zod.run = (r, a) => {
			if (a.skipChecks) return e._zod.parse(r, a);
			if (a.direction === "backward") {
				let t = e._zod.parse({
					value: r.value,
					issues: []
				}, {
					...a,
					skipChecks: !0
				});
				return t instanceof Promise ? t.then((e) => n(e, r, a)) : n(t, r, a);
			}
			let o = e._zod.parse(r, a);
			if (o instanceof Promise) {
				if (a.async === !1) throw new GE();
				return o.then((e) => t(e, i, a));
			}
			return t(o, i, a);
		};
	}
}, {
	get "~standard"() {
		return jE(this, "~standard", TO(this));
	},
	set "~standard"(e) {
		AE(this, "~standard", e);
	}
}), CO = (e, t) => e.issues.length ? { issues: e.issues.map((e) => CE(e, t, JE())) } : { value: e.value };
async function wO(e, t) {
	let n = { async: !0 };
	return CO(await e._zod.run({
		value: t,
		issues: []
	}, n), n);
}
function TO(e) {
	return {
		validate: (t) => {
			let n = { async: !1 };
			try {
				let r = e._zod.run({
					value: t,
					issues: []
				}, n);
				if (!(r instanceof Promise)) return CO(r, n);
			} catch {}
			return wO(e, t);
		},
		vendor: "zod",
		version: 1
	};
}
var EO = /*@__PURE__*/ W("$ZodString", (e, t) => {
	SO.init(e, t), e._zod.pattern = t.pattern ?? ZD, e._zod.parse = (n, r) => {
		if (t.coerce) try {
			n.value = String(n.value);
		} catch {}
		return typeof n.value == "string" || n.issues.push({
			expected: "string",
			code: "invalid_type",
			input: n.value,
			inst: e
		}), n;
	};
}), G = /*@__PURE__*/ W("$ZodStringFormat", (e, t) => {
	fO.init(e, t), EO.init(e, t);
}), DO = /*@__PURE__*/ W("$ZodGUID", (e, t) => {
	t.pattern ??= MD, G.init(e, t);
}), OO = /*@__PURE__*/ W("$ZodUUID", (e, t) => {
	if (t.version) {
		let e = {
			v1: 1,
			v2: 2,
			v3: 3,
			v4: 4,
			v5: 5,
			v6: 6,
			v7: 7,
			v8: 8
		}[t.version];
		if (e === void 0) throw Error(`Invalid UUID version: "${t.version}"`);
		t.pattern ??= ND(e);
	} else t.pattern ??= ND();
	G.init(e, t);
}), kO = /*@__PURE__*/ W("$ZodEmail", (e, t) => {
	t.pattern ??= PD, G.init(e, t);
});
function AO(e) {
	try {
		return typeof URL < "u" && typeof URL.canParse == "function" ? URL.canParse(e) : (new URL(e), !0);
	} catch {
		return !1;
	}
}
function jO(e, t) {
	return !("normalize" in t) && !("hostname" in t) && !("protocol" in t) ? AO(e) || 2 : MO(e, t);
}
function MO(e, t) {
	if (!t.normalize && t.protocol?.source === UD.source && !/^https?:\/\//i.test(e)) return 1;
	try {
		if (typeof URL < "u") {
			let t = URL;
			if (typeof t.parse == "function") return t.parse(e) ?? 2;
		}
		return new URL(e);
	} catch {
		return 2;
	}
}
var NO = /[\t\n\r]/g;
function PO(e) {
	return e.replace(NO, "");
}
function FO(e, t) {
	return t.lastIndex = 0, t.test(e.hostname);
}
function IO(e, t) {
	return t.lastIndex = 0, t.test(e.protocol.endsWith(":") ? e.protocol.slice(0, -1) : e.protocol);
}
var LO = /*@__PURE__*/ W("$ZodURL", (e, t) => {
	G.init(e, t), e._zod.check = (n) => {
		try {
			let r = n.value.trim(), i = jO(r, t);
			if (i === 1) {
				n.issues.push({
					code: "invalid_format",
					format: "url",
					note: "Invalid URL format",
					input: n.value,
					inst: e,
					continue: !t.abort
				});
				return;
			}
			if (i === 2) {
				n.issues.push({
					code: "invalid_format",
					format: "url",
					input: n.value,
					inst: e,
					continue: !t.abort
				});
				return;
			}
			if (i === !0) {
				n.value = PO(r);
				return;
			}
			t.hostname && !FO(i, t.hostname) && n.issues.push({
				code: "invalid_format",
				format: "url",
				note: "Invalid hostname",
				pattern: t.hostname.source,
				input: n.value,
				inst: e,
				continue: !t.abort
			}), t.protocol && !IO(i, t.protocol) && n.issues.push({
				code: "invalid_format",
				format: "url",
				note: "Invalid protocol",
				pattern: t.protocol.source,
				input: n.value,
				inst: e,
				continue: !t.abort
			}), n.value = t.normalize ? i.href : PO(r);
			return;
		} catch {
			n.issues.push({
				code: "invalid_format",
				format: "url",
				input: n.value,
				inst: e,
				continue: !t.abort
			});
		}
	};
}), RO = /*@__PURE__*/ W("$ZodEmoji", (e, t) => {
	t.pattern ??= ID(), G.init(e, t);
}), zO = /*@__PURE__*/ W("$ZodNanoID", (e, t) => {
	if (t.length !== void 0 && (!Number.isInteger(t.length) || t.length < 1)) throw Error(`Invalid nanoid length: ${t.length}`);
	t.pattern ??= t.length === void 0 ? kD : AD(t.length), G.init(e, t);
}), BO = /*@__PURE__*/ W("$ZodCUID", (e, t) => {
	t.pattern ??= wD, G.init(e, t);
}), VO = /*@__PURE__*/ W("$ZodCUID2", (e, t) => {
	t.pattern ??= TD, G.init(e, t);
}), HO = /*@__PURE__*/ W("$ZodULID", (e, t) => {
	t.pattern ??= ED, G.init(e, t);
}), UO = /*@__PURE__*/ W("$ZodXID", (e, t) => {
	t.pattern ??= DD, G.init(e, t);
}), WO = /*@__PURE__*/ W("$ZodKSUID", (e, t) => {
	t.pattern ??= OD, G.init(e, t);
}), GO = /*@__PURE__*/ W("$ZodISODateTime", (e, t) => {
	t.pattern ??= XD(t), G.init(e, t);
}), KO = /*@__PURE__*/ W("$ZodISODate", (e, t) => {
	t.pattern ??= qD, G.init(e, t);
}), qO = /*@__PURE__*/ W("$ZodISOTime", (e, t) => {
	t.pattern ??= YD(t), G.init(e, t);
}), JO = /*@__PURE__*/ W("$ZodISODuration", (e, t) => {
	t.pattern ??= jD, G.init(e, t);
}), YO = /*@__PURE__*/ W("$ZodIPv4", (e, t) => {
	t.pattern ??= LD, G.init(e, t);
}), XO = /^[0-9a-fA-F:.]+$/;
function ZO(e) {
	return XO.test(e) ? AO(`http://[${e}]`) : !1;
}
var QO = /*@__PURE__*/ W("$ZodIPv6", (e, t) => {
	t.pattern ??= RD, G.init(e, t), e._zod.check = (n) => {
		ZO(n.value) || n.issues.push({
			code: "invalid_format",
			format: "ipv6",
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
}), $O = /*@__PURE__*/ W("$ZodCIDRv4", (e, t) => {
	t.pattern ??= zD, G.init(e, t);
});
function ek(e) {
	let t = e.split("/");
	if (t.length !== 2) return !1;
	let [n, r] = t;
	if (!r) return !1;
	let i = Number(r);
	return `${i}` !== r || i < 0 || i > 128 ? !1 : ZO(n);
}
var tk = /*@__PURE__*/ W("$ZodCIDRv6", (e, t) => {
	t.pattern ??= BD, G.init(e, t), e._zod.check = (n) => {
		ek(n.value) || n.issues.push({
			code: "invalid_format",
			format: "cidrv6",
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
});
function nk(e) {
	if (e === "") return !0;
	if (/\s/.test(e) || e.length % 4 != 0) return !1;
	try {
		return atob(e), !0;
	} catch {
		return !1;
	}
}
var rk = /^[0-9a-zA-Z+/]*={0,2}$/, ik = /*@__PURE__*/ W("$ZodBase64", (e, t) => {
	t.pattern ??= rk, G.init(e, t), e._zod.check = (n) => {
		nk(n.value) || n.issues.push({
			code: "invalid_format",
			format: "base64",
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
}), ak = /^[A-Za-z0-9_-]*$/;
function ok(e) {
	if (!ak.test(e)) return !1;
	let t = e.replace(/[-_]/g, (e) => e === "-" ? "+" : "/");
	return nk(t.padEnd(Math.ceil(t.length / 4) * 4, "="));
}
var sk = /*@__PURE__*/ W("$ZodBase64URL", (e, t) => {
	t.pattern ??= ak, G.init(e, t), e._zod.check = (n) => {
		ok(n.value) || n.issues.push({
			code: "invalid_format",
			format: "base64url",
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
}), ck = /*@__PURE__*/ W("$ZodE164", (e, t) => {
	t.pattern ??= WD, G.init(e, t);
});
function lk(e, t = null) {
	try {
		let n = e.split(".");
		if (n.length !== 3) return !1;
		let [r] = n;
		if (!r) return !1;
		let i = JSON.parse(atob(r));
		return !("typ" in i && i?.typ !== "JWT" || !i.alg || t && (!("alg" in i) || i.alg !== t));
	} catch {
		return !1;
	}
}
var uk = /*@__PURE__*/ W("$ZodJWT", (e, t) => {
	G.init(e, t), e._zod.check = (n) => {
		lk(n.value, t.alg) || n.issues.push({
			code: "invalid_format",
			format: "jwt",
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
}), dk = /*@__PURE__*/ W("$ZodNumber", (e, t) => {
	SO.init(e, t), e._zod.pattern = QD, e._zod.parse = (n, r) => {
		if (t.coerce) try {
			n.value = Number(n.value);
		} catch {}
		let i = n.value;
		if (typeof i == "number" && !Number.isNaN(i) && Number.isFinite(i)) return n;
		let a = typeof i == "number" ? Number.isNaN(i) ? "NaN" : Number.isFinite(i) ? void 0 : String(i) : void 0;
		return n.issues.push({
			expected: "number",
			code: "invalid_type",
			input: i,
			inst: e,
			...a ? { received: a } : {}
		}), n;
	};
}), fk = /*@__PURE__*/ W("$ZodNumberFormat", (e, t) => {
	cO.init(e, t), dk.init(e, t);
}), pk = /*@__PURE__*/ W("$ZodBoolean", (e, t) => {
	SO.init(e, t), e._zod.pattern = $D, e._zod.parse = (n, r) => {
		if (t.coerce) try {
			n.value = !!n.value;
		} catch {}
		let i = n.value;
		return typeof i == "boolean" || n.issues.push({
			expected: "boolean",
			code: "invalid_type",
			input: i,
			inst: e
		}), n;
	};
}), mk = /*@__PURE__*/ W("$ZodUnknown", (e, t) => {
	SO.init(e, t), e._zod.parse = (e) => e;
}), hk = /*@__PURE__*/ W("$ZodNever", (e, t) => {
	SO.init(e, t), e._zod.parse = (t, n) => (t.issues.push({
		expected: "never",
		code: "invalid_type",
		input: t.value,
		inst: e
	}), t);
});
function gk(e, t, n) {
	e.issues.length && t.issues.push(...bE(n, e.issues)), t.value[n] = e.value;
}
var _k = /*@__PURE__*/ W("$ZodArray", (e, t) => {
	SO.init(e, t);
	let n = qE.memoizer;
	n?.attach(e), e._zod.parse = (r, i) => {
		let a = r.value;
		if (!Array.isArray(a)) return r.issues.push({
			expected: "array",
			code: "invalid_type",
			input: a,
			inst: e
		}), r;
		r.value = n ? n.alloc(e, r, Array(a.length), i) : Array(a.length);
		let o = [], s = i?.abortEarly;
		for (let e = 0; e < a.length; e++) {
			let n = a[e], c = t.element._zod.run({
				value: n,
				issues: []
			}, i);
			if (c instanceof Promise) o.push(c.then((t) => gk(t, r, e)));
			else if (gk(c, r, e), s && c.issues.length !== 0 && vE(c)) break;
		}
		return o.length ? Promise.all(o).then(() => r) : r;
	};
});
function vk(e, t, n, r, i, a) {
	let o = n in r, s = a === "optional";
	if (o || !s || i !== "optional") {
		if (e.issues.length) {
			if (i !== void 0 && s && !o) return;
			t.issues.push(...bE(n, e.issues));
		}
		if (!o && i === void 0) {
			e.issues.length || t.issues.push({
				code: "invalid_type",
				expected: "nonoptional",
				input: void 0,
				path: [n]
			});
			return;
		}
		e.value === void 0 ? (o || i === "defaulted" && !s) && (t.value[n] = void 0) : t.value[n] = e.value;
	}
}
var yk = [];
function bk(e) {
	let t = Object.keys(e.shape), n = Object.getOwnPropertySymbols(e.shape), r = n.length ? n : yk, i = r.length ? [...t, ...r] : t;
	for (let t of i) if (!e.shape?.[t]?._zod?.traits?.has("$ZodType")) throw Error(`Invalid element at key "${String(t)}": expected a Zod schema`);
	let a = oE(e.shape);
	return {
		...e,
		allKeys: i,
		symbolKeys: r,
		keySet: new Set(t),
		numKeys: t.length,
		optionalKeys: new Set(a)
	};
}
function xk(e, t, n, r, i, a, o) {
	let s = [], c = i.keySet, l = i.catchall._zod, u = l.def.type, d = l.optin, f = l.optout, p = 0;
	for (let i in t) {
		if (o && n.issues.length !== p) {
			if (vE(n, p)) break;
			p = n.issues.length;
		}
		if (c.has(i)) continue;
		if (i === "__proto__") {
			u === "never" && s.push(i);
			continue;
		}
		if (u === "never") {
			s.push(i);
			continue;
		}
		let a = l.run({
			value: t[i],
			issues: []
		}, r);
		a instanceof Promise ? e.push(a.then((e) => vk(e, n, i, t, d, f))) : vk(a, n, i, t, d, f);
	}
	return s.length && n.issues.push({
		code: "unrecognized_keys",
		keys: s,
		input: t,
		inst: a,
		continue: !0
	}), e.length ? Promise.all(e).then(() => n) : n;
}
var Sk = /*@__PURE__*/ W("$ZodObject", (e, t) => {
	SO.init(e, t);
	let n = Object.getOwnPropertyDescriptor(t, "shape"), r = n?.get ? n.get.raw : t.shape ?? {};
	if (r) {
		let e = () => {
			let n = { ...r };
			return Object.defineProperty(t, "shape", { value: n }), e.raw = n, n;
		};
		e.raw = r, Object.defineProperty(t, "shape", { get: e });
	}
	let i = LT(() => bk(t));
	U(e, "propValues", (e) => {
		let t = e.def.shape, n = {};
		for (let e in t) {
			let r = t[e]._zod;
			if (r.values) {
				Object.prototype.hasOwnProperty.call(n, e) || VT(n, e, /* @__PURE__ */ new Set());
				for (let t of r.values) n[e].add(t);
				r.optin !== void 0 && n[e].add(void 0);
			}
		}
		return n;
	});
	let a = QT, o = t.catchall, s, c = qE.memoizer;
	c?.attach(e), e._zod.parse = (t, n) => {
		s ??= i.value;
		let r = t.value;
		if (!a(r)) return t.issues.push({
			expected: "object",
			code: "invalid_type",
			input: r,
			inst: e
		}), t;
		t.value = c ? c.alloc(e, t, {}, n) : {};
		let l = [], u = s.shape, d = n?.abortEarly, f = t.issues.length;
		for (let e of s.allKeys) {
			if (d && t.issues.length !== f) {
				if (vE(t, f)) break;
				f = t.issues.length;
			}
			if (e === "__proto__") continue;
			let i = u[e], a = i._zod.optin, o = i._zod.optout, s = i._zod.run({
				value: r[e],
				issues: []
			}, n);
			s instanceof Promise ? l.push(s.then((n) => vk(n, t, e, r, a, o))) : vk(s, t, e, r, a, o);
		}
		return o ? xk(l, r, t, n, i.value, e, d === !0) : l.length ? Promise.all(l).then(() => t) : t;
	};
}), Ck = /*@__PURE__*/ W("$ZodObjectJIT", (e, t) => {
	Sk.init(e, t);
	let n = e._zod.parse, r = LT(() => bk(t)), i = qE.memoizer, a = (t) => {
		let n = r.value, a = n.symbolKeys, o = new bO(["payload", "ctx"], {
			shape: t,
			inst: e,
			memo: i,
			syms: a
		}), s = (e) => `shape[${e}]._zod.run({ value: input[${e}], issues: [] }, ctx)`, c = (e, t) => `
          let ${e}_ab = false;
          for (let i = 0; i < ${e}.issues.length; i++) {
            const iss = ${e}.issues[i];
            iss.path = iss.path ? [${t}, ...iss.path] : [${t}];
            payload.issues.push(iss);
            if (iss.continue !== true) ${e}_ab = true;
          }
          if (${e}_ab && ctx && ctx.abortEarly) {
            payload.value = newResult;
            return payload;
          }`;
		o.write("const input = payload.value;");
		let l = Object.create(null), u = 0;
		for (let e of n.allKeys) l[e] = `key_${u++}`;
		o.write(i ? "const newResult = memo.alloc(inst, payload, {}, ctx);" : "const newResult = {};");
		for (let e of n.allKeys) {
			if (e === "__proto__") continue;
			let n = l[e], r = typeof e == "symbol" ? `syms[${a.indexOf(e)}]` : YT(e), i = `${r} in input`, u = t[e], d = u?._zod?.optin, f = d !== void 0, p = u?._zod?.optout === "optional";
			if (o.write(`const ${n} = ${s(r)};`), f && p) {
				let e = d === "optional" ? `${n}_present` : `${n}.value !== undefined || ${n}_present`;
				o.write(`
        const ${n}_present = ${i};
        if (!${n}.issues.length || ${n}_present) {
          if (${n}.issues.length) {${c(n, r)}
          }

          if (${e}) {
            newResult[${r}] = ${n}.value;
          }
        }

      `);
			} else f ? (o.write(`
        if (${n}.issues.length) {${c(n, r)}
        }
      `), d === "defaulted" ? o.write(`newResult[${r}] = ${n}.value;`) : o.write(`
        if (${n}.value !== undefined || ${i}) {
          newResult[${r}] = ${n}.value;
        }
      `)) : o.write(`
        const ${n}_present = ${i};
        if (${n}.issues.length) {${c(n, r)}
        }
        if (!${n}_present && !${n}.issues.length) {
          payload.issues.push({
            code: "invalid_type",
            expected: "nonoptional",
            input: undefined,
            path: [${r}]
          });
          if (ctx && ctx.abortEarly) {
            payload.value = newResult;
            return payload;
          }
        }

        if (${n}_present) {
          newResult[${r}] = ${n}.value;
        }

      `);
		}
		return o.write("payload.value = newResult;"), o.write("return payload;"), o.compile();
	}, o, s = QT, c = !qE.jitless, l = c && $T.value, u = t.catchall, d;
	e._zod.parse = (i, f) => {
		d ??= r.value;
		let p = i.value;
		return s(p) ? c && l && f?.async === !1 && f.jitless !== !0 ? (o ||= a(t.shape), i = o(i, f), u ? xk([], p, i, f, d, e, f?.abortEarly === !0) : i) : n(i, f) : (i.issues.push({
			expected: "object",
			code: "invalid_type",
			input: p,
			inst: e
		}), i);
	};
});
function wk(e, t, n, r) {
	for (let n of e) if (n.issues.length === 0) return t.value = n.value, t;
	let i = e.filter((e) => !vE(e));
	return i.length === 1 ? (t.value = i[0].value, i[0]) : (t.issues.push({
		code: "invalid_union",
		input: t.value,
		inst: n,
		errors: e.map((e) => e.issues.map((e) => CE(e, r, JE())))
	}), t);
}
var Tk = /*@__PURE__*/ W("$ZodUnion", (e, t) => {
	SO.init(e, t), U(e, "optin", (e) => e.def.options.some((e) => e._zod.optin === "defaulted") ? "defaulted" : e.def.options.some((e) => e._zod.optin !== void 0) ? "optional" : void 0), U(e, "optout", (e) => e.def.options.some((e) => e._zod.optout === "optional") ? "optional" : void 0), U(e, "values", (e) => {
		if (e.def.options.every((e) => e._zod.values)) return new Set(e.def.options.flatMap((e) => Array.from(e._zod.values)));
	}), U(e, "pattern", (e) => {
		if (e.def.options.every((e) => e._zod.pattern)) {
			let t = e.def.options.map((e) => e._zod.pattern);
			return RegExp(`^(${t.map((e) => zT(e.source)).join("|")})$`);
		}
	});
	let n = t.options.length === 1 ? t.options[0]._zod.run : null;
	e._zod.parse = (r, i) => {
		if (n) return n(r, i);
		let a = !1, o = [];
		for (let e of t.options) {
			let t = e._zod.run({
				value: r.value,
				issues: []
			}, i);
			if (t instanceof Promise) o.push(t), a = !0;
			else {
				if (t.issues.length === 0) return t;
				o.push(t);
			}
		}
		return a ? Promise.all(o).then((t) => wk(t, r, e, i)) : wk(o, r, e, i);
	};
}), Ek = /*@__PURE__*/ W("$ZodIntersection", (e, t) => {
	SO.init(e, t), e._zod.parse = (e, n) => {
		let r = e.value, i = t.left._zod.run({
			value: r,
			issues: []
		}, n), a = t.right._zod.run({
			value: r,
			issues: []
		}, n);
		return i instanceof Promise || a instanceof Promise ? Promise.all([i, a]).then(([t, n]) => Ok(e, t, n)) : Ok(e, i, a);
	};
});
function Dk(e, t) {
	if (e === t || e instanceof Date && t instanceof Date && +e == +t) return {
		valid: !0,
		data: e
	};
	if (eE(e) && eE(t)) {
		let n = Object.keys(t), r = Object.keys(e).filter((e) => n.indexOf(e) !== -1), i = {
			...e,
			...t
		};
		Object.prototype.hasOwnProperty.call(i, "__proto__") && delete i.__proto__;
		for (let n of r) {
			if (n === "__proto__") continue;
			let r = Dk(e[n], t[n]);
			if (!r.valid) return {
				valid: !1,
				mergeErrorPath: [n, ...r.mergeErrorPath]
			};
			i[n] = r.data;
		}
		return {
			valid: !0,
			data: i
		};
	}
	if (Array.isArray(e) && Array.isArray(t)) {
		if (e.length !== t.length) return {
			valid: !1,
			mergeErrorPath: []
		};
		let n = [];
		for (let r = 0; r < e.length; r++) {
			let i = e[r], a = t[r], o = Dk(i, a);
			if (!o.valid) return {
				valid: !1,
				mergeErrorPath: [r, ...o.mergeErrorPath]
			};
			n.push(o.data);
		}
		return {
			valid: !0,
			data: n
		};
	}
	return {
		valid: !1,
		mergeErrorPath: []
	};
}
function Ok(e, t, n) {
	let r = /* @__PURE__ */ new Map(), i, a = /* @__PURE__ */ new Map(), o = (e, t) => {
		let n;
		if (e.code === "unrecognized_keys" && !e.path?.length) i ??= e, n = e.keys;
		else if (e.code === "invalid_key" && e.origin === "record" && e.path?.length === 1) {
			let t = String(e.path[0]);
			a.has(t) || a.set(t, e), n = [t];
		} else return !1;
		for (let e of n) r.has(e) || r.set(e, {}), r.get(e)[t] = !0;
		return !0;
	};
	for (let n of t.issues) o(n, "l") || e.issues.push(n);
	for (let t of n.issues) o(t, "r") || e.issues.push(t);
	let s = [...r].filter(([, e]) => e.l && e.r).map(([e]) => e);
	if (s.length) {
		let t = i ? s.filter((e) => i.keys.includes(e)) : [];
		t.length && e.issues.push({
			...i,
			keys: t
		});
		for (let n of s) !t.includes(n) && a.has(n) && e.issues.push(a.get(n));
	}
	let c = Dk(t.value, n.value);
	if (!c.valid) {
		if (vE(e)) return e;
		throw Error(`Unmergable intersection. Error path: ${JSON.stringify(c.mergeErrorPath)}`);
	}
	return e.value = c.data, e;
}
var kk = /*@__PURE__*/ W("$ZodEnum", (e, t) => {
	SO.init(e, t);
	let n = NT(t.entries), r = new Set(n);
	e._zod.values = r, U(e, "pattern", (e) => {
		let t = NT(e.def.entries).filter((e) => nE.has(typeof e));
		return RegExp(t.length ? `^(${t.map((e) => rE(e.toString())).join("|")})$` : "^[^\\s\\S]$");
	}), e._zod.parse = (t, i) => {
		let a = t.value;
		return r.has(a) || t.issues.push({
			code: "invalid_value",
			values: n,
			input: a,
			inst: e
		}), t;
	};
}), Ak = /*@__PURE__*/ W("$ZodLiteral", (e, t) => {
	SO.init(e, t);
	let n = new Set(t.values);
	e._zod.values = n, U(e, "pattern", (e) => {
		let t = e.def.values;
		return RegExp(t.length ? `^(${t.map((e) => typeof e == "string" ? rE(e) : e ? rE(e.toString()) : String(e)).join("|")})$` : "^[^\\s\\S]$");
	}), e._zod.parse = (r, i) => {
		let a = r.value;
		return n.has(a) || r.issues.push({
			code: "invalid_value",
			values: t.values,
			input: a,
			inst: e
		}), r;
	};
}), jk = /*@__PURE__*/ W("$ZodTransform", (e, t) => {
	SO.init(e, t), e._zod.optin = "optional", qE.memoizer?.guard(e), e._zod.parse = (n, r) => {
		if (r.direction === "backward") throw new KE(e.constructor.name);
		let i = t.transform(n.value, n);
		if (r.async) return (i instanceof Promise ? i : Promise.resolve(i)).then((e) => (n.value = e, n));
		if (i instanceof Promise) throw new GE();
		return n.value = i, n;
	};
});
function Mk(e, t) {
	return e.value = t.issues.length ? void 0 : t.value, e;
}
var Nk = /*@__PURE__*/ W("$ZodOptional", (e, t) => {
	SO.init(e, t), U(e, "optin", (e) => e.def.innerType._zod.optin === "defaulted" ? "defaulted" : "optional"), e._zod.optout = "optional", U(e, "values", (e) => {
		let t = e.def.innerType._zod.values;
		return t ? /* @__PURE__ */ new Set([...t, void 0]) : void 0;
	}), U(e, "pattern", (e) => {
		let t = e.def.innerType._zod.pattern;
		return t ? RegExp(`^(${zT(t.source)})?$`) : void 0;
	}), e._zod.parse = (e, n) => {
		if (e.value === void 0) {
			if (t.innerType._zod.optin !== "defaulted") return e;
			let r = t.innerType._zod.run({
				value: e.value,
				issues: []
			}, n);
			return r instanceof Promise ? r.then((t) => Mk(e, t)) : Mk(e, r);
		}
		return t.innerType._zod.run(e, n);
	};
}), Pk = /*@__PURE__*/ W("$ZodExactOptional", (e, t) => {
	Nk.init(e, t), U(e, "values", (e) => e.def.innerType._zod.values), U(e, "pattern", (e) => e.def.innerType._zod.pattern), e._zod.parse = (e, n) => t.innerType._zod.run(e, n);
}), Fk = /*@__PURE__*/ W("$ZodNullable", (e, t) => {
	SO.init(e, t), U(e, "optin", (e) => e.def.innerType._zod.optin), U(e, "optout", (e) => e.def.innerType._zod.optout), U(e, "pattern", (e) => {
		let t = e.def.innerType._zod.pattern;
		return t ? RegExp(`^(${zT(t.source)}|null)$`) : void 0;
	}), U(e, "values", (e) => e.def.innerType._zod.values ? /* @__PURE__ */ new Set([...e.def.innerType._zod.values, null]) : void 0), e._zod.parse = (e, n) => e.value === null ? e : t.innerType._zod.run(e, n);
}), Ik = /*@__PURE__*/ W("$ZodDefault", (e, t) => {
	SO.init(e, t), e._zod.optin = "defaulted", U(e, "values", (e) => e.def.innerType._zod.values), e._zod.parse = (e, n) => {
		if (n.direction === "backward") return t.innerType._zod.run(e, n);
		if (e.value === void 0) return e.value = t.defaultValue, e;
		let r = t.innerType._zod.run(e, n);
		return r instanceof Promise ? r.then((e) => Lk(e, t)) : Lk(r, t);
	};
});
function Lk(e, t) {
	return e.value === void 0 && (e.value = t.defaultValue), e;
}
var Rk = /*@__PURE__*/ W("$ZodPrefault", (e, t) => {
	SO.init(e, t), e._zod.optin = "defaulted", U(e, "values", (e) => e.def.innerType._zod.values), e._zod.parse = (e, n) => (n.direction === "backward" || e.value === void 0 && (e.value = t.defaultValue), t.innerType._zod.run(e, n));
}), zk = /*@__PURE__*/ W("$ZodNonOptional", (e, t) => {
	SO.init(e, t), U(e, "values", (e) => {
		let t = e.def.innerType._zod.values;
		return t ? new Set([...t].filter((e) => e !== void 0)) : void 0;
	}), e._zod.parse = (n, r) => {
		let i = t.innerType._zod.run(n, r);
		return i instanceof Promise ? i.then((t) => Bk(t, e)) : Bk(i, e);
	};
});
function Bk(e, t) {
	return !e.issues.length && e.value === void 0 && e.issues.push({
		code: "invalid_type",
		expected: "nonoptional",
		input: e.value,
		inst: t
	}), e;
}
function Vk(e, t, n, r) {
	return t.issues.length ? (e.value = n.catchValue({
		...t,
		value: e.value,
		error: { issues: t.issues.map((e) => CE(e, r, JE())) },
		input: e.value
	}), e) : (e.value = t.value, t.memo && (e.memo = !0), e);
}
var Hk = /*@__PURE__*/ W("$ZodCatch", (e, t) => {
	SO.init(e, t), U(e, "optin", (e) => e.def.innerType._zod.optin === "defaulted" ? "defaulted" : "optional"), U(e, "optout", (e) => e.def.innerType._zod.optout), U(e, "values", (e) => e.def.innerType._zod.values), e._zod.parse = (e, n) => {
		if (n.direction === "backward") return t.innerType._zod.run(e, n);
		let r = t.innerType._zod.run({
			value: e.value,
			issues: []
		}, n);
		return r instanceof Promise ? r.then((r) => Vk(e, r, t, n)) : Vk(e, r, t, n);
	};
}), Uk = /*@__PURE__*/ W("$ZodPipe", (e, t) => {
	SO.init(e, t), U(e, "values", (e) => e.def.in._zod.values), U(e, "optin", (e) => e.def.in._zod.optin), U(e, "optout", (e) => e.def.out._zod.optout), U(e, "propValues", (e) => e.def.in._zod.propValues), e._zod.parse = (e, n) => {
		if (n.direction === "backward") {
			let r = t.out._zod.run(e, n);
			return r instanceof Promise ? r.then((e) => Wk(e, t.in, n)) : Wk(r, t.in, n);
		}
		let r = t.in._zod.run(e, n);
		return r instanceof Promise ? r.then((e) => Wk(e, t.out, n)) : Wk(r, t.out, n);
	};
});
function Wk(e, t, n) {
	return e.issues.some((e) => e.code !== "unrecognized_keys") ? (e.aborted = !0, e) : t._zod.run({
		value: e.value,
		issues: e.issues
	}, n);
}
var Gk = /*@__PURE__*/ W("$ZodReadonly", (e, t) => {
	SO.init(e, t), U(e, "propValues", (e) => e.def.innerType._zod.propValues), U(e, "values", (e) => e.def.innerType._zod.values), U(e, "optin", (e) => e.def.innerType?._zod?.optin), U(e, "optout", (e) => e.def.innerType?._zod?.optout), e._zod.parse = (e, n) => {
		if (n.direction === "backward") return t.innerType._zod.run(e, n);
		let r = t.innerType._zod.run(e, n);
		return r instanceof Promise ? r.then(Kk) : Kk(r);
	};
});
function Kk(e) {
	return e.memo || (e.value = Object.freeze(e.value)), e;
}
var qk = /*@__PURE__*/ W("$ZodCustom", (e, t) => {
	nO.init(e, t), SO.init(e, t), e._zod.parse = (e, t) => e, e._zod.check = (n) => {
		let r = n.value, i = t.fn(r);
		if (i instanceof Promise) return i.then((t) => Jk(t, n, r, e));
		Jk(i, n, r, e);
	};
});
function Jk(e, t, n, r) {
	if (!e) {
		let e = {
			code: "custom",
			input: n,
			inst: r,
			path: [...r._zod.def.path ?? []],
			continue: !r._zod.def.abort
		};
		r._zod.def.params && (e.params = r._zod.def.params), t.issues.push(OE(e));
	}
}
//#endregion
//#region node_modules/zod/v4/core/memoizer.js
var Yk = class extends Error {
	constructor() {
		super("Cannot parse a reference cycle that closes through a transform"), this.name = "ZodCyclicError";
	}
}, Xk = "~memo", Zk = [];
function Qk(e) {
	return typeof e == "object" && !!e;
}
function $k(e) {
	return e.map((e) => e.path ? {
		...e,
		path: e.path.slice()
	} : { ...e });
}
var eA = /*@__PURE__*/ new WeakMap(), tA = 0, nA = 1, rA = 2;
function iA(e, t, n) {
	let r = eA.get(e);
	if (r !== void 0) return r ? rA : tA;
	if (t.has(e)) return rA;
	t.add(e);
	let i = tA, a = (e) => {
		if (i !== rA && e?._zod) {
			let r = iA(e, t, n);
			r > i && (i = r);
		}
	}, o = (e, r) => {
		let i = tA;
		for (let a of Reflect.ownKeys(e)) {
			let o = Object.getOwnPropertyDescriptor(e, a);
			if (r && !o.enumerable) continue;
			let s = o.get ? nA : o.value?._zod ? iA(o.value, t, n) : tA;
			s > i && (i = s);
		}
		return i;
	}, s = (e) => {
		e > i && (i = e);
	}, c = e._zod.def;
	switch (c.type) {
		case "object": {
			let e = HT(c);
			s(e ? o(e, !0) : nA), a(c.catchall);
			break;
		}
		case "array":
			a(c.element);
			break;
		case "tuple":
			for (let e of c.items) a(e);
			a(c.rest);
			break;
		case "record":
		case "map":
			a(c.keyType), a(c.valueType);
			break;
		case "set":
			a(c.valueType);
			break;
		case "union":
			for (let e of c.options) a(e);
			break;
		case "intersection":
			a(c.left), a(c.right);
			break;
		case "optional":
		case "nullable":
		case "default":
		case "prefault":
		case "catch":
		case "readonly":
		case "nonoptional":
		case "promise":
		case "success":
			a(c.innerType);
			break;
		case "pipe":
			a(c.in), a(c.out);
			break;
		case "function":
			a(c.input), a(c.output);
			break;
		case "lazy": {
			let r = c._cachedInner ?? (n ? e._zod.innerType : void 0);
			s(r ? iA(r, t, !1) : nA);
			break;
		}
		case "template_literal":
		case "string":
		case "number":
		case "int":
		case "boolean":
		case "bigint":
		case "symbol":
		case "undefined":
		case "null":
		case "void":
		case "never":
		case "any":
		case "unknown":
		case "date":
		case "nan":
		case "enum":
		case "literal":
		case "file":
		case "transform":
		case "custom": break;
		default: for (let e in c) {
			let t = Object.getOwnPropertyDescriptor(c, e);
			if (!t || t.get) continue;
			let n = t.value;
			if (n && typeof n == "object") {
				if (n._zod) a(n);
				else if (Array.isArray(n)) for (let e of n) a(e);
			}
		}
	}
	return t.delete(e), aA(e, i);
}
function aA(e, t) {
	return t !== nA && eA.set(e, t === rA), t;
}
function oA(e, t) {
	let n = e.buckets.get(t);
	return n || (n = /* @__PURE__ */ new WeakMap(), e.buckets.set(t, n)), n;
}
var sA, cA = [], lA = {
	alloc(e, t, n) {
		let r = sA;
		if (!r) return n;
		sA = void 0;
		let i = {
			value: n,
			issues: null
		};
		return r.set(t.value, i), cA.push(i), n;
	},
	guard(e) {
		var t;
		(t = e._zod).deferred ?? (t.deferred = []), e._zod.deferred.push(() => {
			let t = e._zod.parse, n = (e, n) => {
				if (n.direction !== "backward" && dA(n, e.value)) throw new Yk();
				return t(e, n);
			};
			e._zod.parse = n, e._zod.run === t && (e._zod.run = n);
		});
	},
	attach(e) {
		var t;
		let n, r = !1, i, a;
		(t = e._zod).deferred ?? (t.deferred = []), e._zod.deferred.push(() => {
			let t = e._zod.parse, o = (s, c) => {
				if (n === void 0) {
					let i = iA(e, /* @__PURE__ */ new Set(), !1);
					if (i === tA) return e._zod.parse = t, e._zod.run === o && (e._zod.run = t), t(s, c);
					i === rA || r ? n = !0 : r = !0;
				}
				let l = s.value;
				if (!Qk(l)) return t(s, c);
				let u = c[Xk];
				u || (u = {
					buckets: /* @__PURE__ */ new WeakMap(),
					backEdges: void 0
				}, c[Xk] = u);
				let d;
				i === c ? d = a : (d = oA(u, e), i = c, a = d);
				let f = d.get(l);
				if (f) return s.value = f.value, f.issues ? f.issues.length && s.issues.push(...$k(f.issues)) : (s.memo = !0, u.backEdges ?? (u.backEdges = /* @__PURE__ */ new WeakSet()), u.backEdges.add(f.value)), s;
				sA = d;
				let p = cA.length, m = t(s, c);
				sA = void 0;
				let ee = cA.length > p ? cA.pop() : void 0;
				return m instanceof Promise ? m.then((e) => (ee && (ee.issues = e.issues.length ? $k(e.issues) : Zk), e)) : (ee && (ee.issues = m.issues.length ? $k(m.issues) : Zk), m);
			};
			e._zod.parse = o, e._zod.run === t && (e._zod.run = o);
		});
	}
};
function uA() {
	return lA;
}
function dA(e, t) {
	let n = e[Xk]?.backEdges;
	return n !== void 0 && Qk(t) && n.has(t);
}
//#endregion
//#region node_modules/zod/v4/locales/en.js
var fA = () => {
	let e = {
		string: {
			unit: "characters",
			verb: "to have"
		},
		file: {
			unit: "bytes",
			verb: "to have"
		},
		array: {
			unit: "items",
			verb: "to have"
		},
		set: {
			unit: "items",
			verb: "to have"
		},
		map: {
			unit: "entries",
			verb: "to have"
		}
	};
	function t(t) {
		return e[t] ?? null;
	}
	let n = {
		regex: "input",
		email: "email address",
		url: "URL",
		emoji: "emoji",
		uuid: "UUID",
		uuidv4: "UUIDv4",
		uuidv6: "UUIDv6",
		nanoid: "nanoid",
		guid: "GUID",
		cuid: "cuid",
		cuid2: "cuid2",
		ulid: "ULID",
		xid: "XID",
		ksuid: "KSUID",
		datetime: "ISO datetime",
		date: "ISO date",
		time: "ISO time",
		duration: "ISO duration",
		ipv4: "IPv4 address",
		ipv6: "IPv6 address",
		mac: "MAC address",
		cidrv4: "IPv4 range",
		cidrv6: "IPv6 range",
		base64: "base64-encoded string",
		base64url: "base64url-encoded string",
		json_string: "JSON string",
		e164: "E.164 number",
		currency_code: "currency code",
		credit_card: "credit card number",
		iban: "IBAN",
		jwt: "JWT",
		template_literal: "input"
	}, r = { nan: "NaN" };
	function i(e, t) {
		return e === "number" && typeof t == "number" && !Number.isFinite(t) ? String(t) : r[e] ?? e;
	}
	return (e) => {
		switch (e.code) {
			case "invalid_type": return `Invalid input: expected ${i(e.expected)}, received ${i(DE(e.input), e.input)}`;
			case "invalid_value": return e.values.length === 1 ? `Invalid input: expected ${aE(e.values[0])}` : `Invalid option: expected one of ${PT(e.values, "|")}`;
			case "too_big": {
				let n = e.exact ? "exactly " : e.inclusive ? "<=" : "<", r = t(e.origin);
				return r ? `Too big: expected ${e.origin ?? "value"} to have ${n}${e.maximum.toString()} ${r.unit ?? "elements"}` : `Too big: expected ${e.origin ?? "value"} to be ${n}${e.maximum.toString()}`;
			}
			case "too_small": {
				let n = e.exact ? "exactly " : e.inclusive ? ">=" : ">", r = t(e.origin);
				return r ? `Too small: expected ${e.origin} to have ${n}${e.minimum.toString()} ${r.unit}` : `Too small: expected ${e.origin} to be ${n}${e.minimum.toString()}`;
			}
			case "invalid_format": {
				let t = e;
				return t.format === "starts_with" ? `Invalid string: must start with "${t.prefix}"` : t.format === "ends_with" ? `Invalid string: must end with "${t.suffix}"` : t.format === "includes" ? `Invalid string: must include "${t.includes}"` : t.format === "regex" ? `Invalid string: must match pattern ${t.pattern}` : `Invalid ${n[t.format] ?? e.format}`;
			}
			case "not_multiple_of": return `Invalid number: must be a multiple of ${e.divisor}`;
			case "unrecognized_keys": return `Unrecognized key${e.keys.length > 1 ? "s" : ""}: ${PT(e.keys, ", ")}`;
			case "invalid_key": return `Invalid key in ${e.origin}`;
			case "invalid_union": return e.options && Array.isArray(e.options) && e.options.length > 0 ? `Invalid discriminator value. Expected ${e.options.map((e) => `'${e}'`).join(" | ")}` : e.inclusive === !1 ? "Invalid input: more than one option matched" : "Invalid input";
			case "invalid_element": return `Invalid value in ${e.origin}`;
			default: return "Invalid input";
		}
	};
};
function pA() {
	return { localeError: fA() };
}
//#endregion
//#region node_modules/zod/v4/core/registries.js
var mA, hA = class {
	constructor() {
		this._map = /* @__PURE__ */ new WeakMap(), this._idmap = /* @__PURE__ */ new Map();
	}
	add(e, ...t) {
		let n = t[0];
		return this._map.set(e, n), n && typeof n == "object" && "id" in n && this._idmap.set(n.id, e), this;
	}
	clear() {
		return this._map = /* @__PURE__ */ new WeakMap(), this._idmap = /* @__PURE__ */ new Map(), this;
	}
	remove(e) {
		let t = this._map.get(e);
		return t && typeof t == "object" && "id" in t && this._idmap.delete(t.id), this._map.delete(e), this;
	}
	get(e) {
		let t = e._zod.parent;
		if (t) {
			let n = { ...this.get(t) ?? {} };
			delete n.id;
			let r = {
				...n,
				...this._map.get(e)
			};
			return Object.keys(r).length ? r : void 0;
		}
		return this._map.get(e);
	}
	has(e) {
		return this._map.has(e);
	}
};
function gA() {
	return new hA();
}
(mA = globalThis).__zod_globalRegistry ?? (mA.__zod_globalRegistry = gA());
var _A = globalThis.__zod_globalRegistry;
//#endregion
//#region node_modules/zod/v4/core/api.js
function vA(e) {
	return e.checks &&= [...e.checks], e;
}
// @__NO_SIDE_EFFECTS__
function yA(e, t) {
	return new e(vA({
		type: "string",
		...H(t)
	}));
}
// @__NO_SIDE_EFFECTS__
function bA(e, t) {
	return new e({
		type: "string",
		format: "email",
		check: "string_format",
		abort: !1,
		...H(t)
	});
}
// @__NO_SIDE_EFFECTS__
function xA(e, t) {
	return new e({
		type: "string",
		format: "guid",
		check: "string_format",
		abort: !1,
		...H(t)
	});
}
// @__NO_SIDE_EFFECTS__
function SA(e, t) {
	return new e({
		type: "string",
		format: "uuid",
		check: "string_format",
		abort: !1,
		...H(t)
	});
}
// @__NO_SIDE_EFFECTS__
function CA(e, t) {
	return new e({
		type: "string",
		format: "uuid",
		check: "string_format",
		abort: !1,
		version: "v4",
		...H(t)
	});
}
// @__NO_SIDE_EFFECTS__
function wA(e, t) {
	return new e({
		type: "string",
		format: "uuid",
		check: "string_format",
		abort: !1,
		version: "v6",
		...H(t)
	});
}
// @__NO_SIDE_EFFECTS__
function TA(e, t) {
	return new e({
		type: "string",
		format: "uuid",
		check: "string_format",
		abort: !1,
		version: "v7",
		...H(t)
	});
}
// @__NO_SIDE_EFFECTS__
function EA(e, t) {
	return new e({
		type: "string",
		format: "url",
		check: "string_format",
		abort: !1,
		...H(t)
	});
}
// @__NO_SIDE_EFFECTS__
function DA(e, t) {
	return new e({
		type: "string",
		format: "emoji",
		check: "string_format",
		abort: !1,
		...H(t)
	});
}
// @__NO_SIDE_EFFECTS__
function OA(e, t) {
	return new e({
		type: "string",
		format: "nanoid",
		check: "string_format",
		abort: !1,
		...H(t)
	});
}
// @__NO_SIDE_EFFECTS__
function kA(e, t) {
	return new e({
		type: "string",
		format: "cuid",
		check: "string_format",
		abort: !1,
		...H(t)
	});
}
// @__NO_SIDE_EFFECTS__
function AA(e, t) {
	return new e({
		type: "string",
		format: "cuid2",
		check: "string_format",
		abort: !1,
		...H(t)
	});
}
// @__NO_SIDE_EFFECTS__
function jA(e, t) {
	return new e({
		type: "string",
		format: "ulid",
		check: "string_format",
		abort: !1,
		...H(t)
	});
}
// @__NO_SIDE_EFFECTS__
function MA(e, t) {
	return new e({
		type: "string",
		format: "xid",
		check: "string_format",
		abort: !1,
		...H(t)
	});
}
// @__NO_SIDE_EFFECTS__
function NA(e, t) {
	return new e({
		type: "string",
		format: "ksuid",
		check: "string_format",
		abort: !1,
		...H(t)
	});
}
// @__NO_SIDE_EFFECTS__
function PA(e, t) {
	return new e({
		type: "string",
		format: "ipv4",
		check: "string_format",
		abort: !1,
		...H(t)
	});
}
// @__NO_SIDE_EFFECTS__
function FA(e, t) {
	return new e({
		type: "string",
		format: "ipv6",
		check: "string_format",
		abort: !1,
		...H(t)
	});
}
// @__NO_SIDE_EFFECTS__
function IA(e, t) {
	return new e({
		type: "string",
		format: "cidrv4",
		check: "string_format",
		abort: !1,
		...H(t)
	});
}
// @__NO_SIDE_EFFECTS__
function LA(e, t) {
	return new e({
		type: "string",
		format: "cidrv6",
		check: "string_format",
		abort: !1,
		...H(t)
	});
}
// @__NO_SIDE_EFFECTS__
function RA(e, t) {
	return new e({
		type: "string",
		format: "base64",
		check: "string_format",
		abort: !1,
		...H(t)
	});
}
// @__NO_SIDE_EFFECTS__
function zA(e, t) {
	return new e({
		type: "string",
		format: "base64url",
		check: "string_format",
		abort: !1,
		...H(t)
	});
}
// @__NO_SIDE_EFFECTS__
function BA(e, t) {
	return new e({
		type: "string",
		format: "e164",
		check: "string_format",
		abort: !1,
		...H(t)
	});
}
// @__NO_SIDE_EFFECTS__
function VA(e, t) {
	return new e({
		type: "string",
		format: "jwt",
		check: "string_format",
		abort: !1,
		...H(t)
	});
}
// @__NO_SIDE_EFFECTS__
function HA(e, t) {
	return new e({
		type: "string",
		format: "datetime",
		check: "string_format",
		offset: !1,
		local: !1,
		precision: null,
		...H(t)
	});
}
// @__NO_SIDE_EFFECTS__
function UA(e, t) {
	return new e({
		type: "string",
		format: "date",
		check: "string_format",
		...H(t)
	});
}
// @__NO_SIDE_EFFECTS__
function WA(e, t) {
	return new e({
		type: "string",
		format: "time",
		check: "string_format",
		precision: null,
		...H(t)
	});
}
// @__NO_SIDE_EFFECTS__
function GA(e, t) {
	return new e({
		type: "string",
		format: "duration",
		check: "string_format",
		...H(t)
	});
}
// @__NO_SIDE_EFFECTS__
function KA(e, t) {
	return new e(vA({
		type: "number",
		checks: [],
		...H(t)
	}));
}
// @__NO_SIDE_EFFECTS__
function qA(e, t) {
	return new e({
		type: "number",
		check: "number_format",
		abort: !1,
		format: "safeint",
		...H(t)
	});
}
// @__NO_SIDE_EFFECTS__
function JA(e, t) {
	return new e({
		type: "boolean",
		...H(t)
	});
}
// @__NO_SIDE_EFFECTS__
function YA(e) {
	return new e({ type: "unknown" });
}
// @__NO_SIDE_EFFECTS__
function XA(e, t) {
	return new e({
		type: "never",
		...H(t)
	});
}
// @__NO_SIDE_EFFECTS__
function ZA(e, t) {
	return new aO({
		check: "less_than",
		...H(t),
		value: e,
		inclusive: !1
	});
}
// @__NO_SIDE_EFFECTS__
function QA(e, t) {
	return new aO({
		check: "less_than",
		...H(t),
		value: e,
		inclusive: !0
	});
}
// @__NO_SIDE_EFFECTS__
function $A(e, t) {
	return new oO({
		check: "greater_than",
		...H(t),
		value: e,
		inclusive: !1
	});
}
// @__NO_SIDE_EFFECTS__
function ej(e, t) {
	return new oO({
		check: "greater_than",
		...H(t),
		value: e,
		inclusive: !0
	});
}
// @__NO_SIDE_EFFECTS__
function tj(e, t) {
	return new sO({
		check: "multiple_of",
		...H(t),
		value: e
	});
}
// @__NO_SIDE_EFFECTS__
function nj(e, t) {
	return new lO({
		check: "max_length",
		...H(t),
		maximum: e
	});
}
// @__NO_SIDE_EFFECTS__
function rj(e, t) {
	return new uO({
		check: "min_length",
		...H(t),
		minimum: e
	});
}
// @__NO_SIDE_EFFECTS__
function ij(e, t) {
	return new dO({
		check: "length_equals",
		...H(t),
		length: e
	});
}
// @__NO_SIDE_EFFECTS__
function aj(e, t) {
	return new pO({
		check: "string_format",
		format: "regex",
		...H(t),
		pattern: e
	});
}
// @__NO_SIDE_EFFECTS__
function oj(e) {
	return new mO({
		check: "string_format",
		format: "lowercase",
		...H(e)
	});
}
// @__NO_SIDE_EFFECTS__
function sj(e) {
	return new hO({
		check: "string_format",
		format: "uppercase",
		...H(e)
	});
}
// @__NO_SIDE_EFFECTS__
function cj(e, t) {
	return new gO({
		check: "string_format",
		format: "includes",
		...H(t),
		includes: e
	});
}
// @__NO_SIDE_EFFECTS__
function lj(e, t) {
	return new _O({
		check: "string_format",
		format: "starts_with",
		...H(t),
		prefix: e
	});
}
// @__NO_SIDE_EFFECTS__
function uj(e, t) {
	return new vO({
		check: "string_format",
		format: "ends_with",
		...H(t),
		suffix: e
	});
}
// @__NO_SIDE_EFFECTS__
function dj(e) {
	return new yO({
		check: "overwrite",
		tx: e
	});
}
// @__NO_SIDE_EFFECTS__
function fj(e) {
	return /* @__PURE__ */ dj((t) => t.normalize(e));
}
// @__NO_SIDE_EFFECTS__
function pj() {
	return /* @__PURE__ */ dj((e) => e.trim());
}
// @__NO_SIDE_EFFECTS__
function mj() {
	return /* @__PURE__ */ dj((e) => e.toLowerCase());
}
// @__NO_SIDE_EFFECTS__
function hj() {
	return /* @__PURE__ */ dj((e) => e.toUpperCase());
}
// @__NO_SIDE_EFFECTS__
function gj() {
	return /* @__PURE__ */ dj((e) => XT(e));
}
// @__NO_SIDE_EFFECTS__
function _j(e, t, n) {
	return new e({
		type: "array",
		element: t,
		...H(n)
	});
}
// @__NO_SIDE_EFFECTS__
function vj(e, t, n) {
	return new e({
		type: "custom",
		check: "custom",
		fn: t,
		...H(n)
	});
}
// @__NO_SIDE_EFFECTS__
function yj(e, t) {
	let n = /* @__PURE__ */ bj((t) => (t.addIssue = (e) => {
		if (typeof e == "string") t.issues.push(OE(e, t.value, n._zod.def));
		else {
			let r = e;
			r.fatal && (r.continue = !1), r.code ??= "custom", "input" in r || (r.input = t.value), r.inst ??= n, r.continue ??= !n._zod.def.abort, t.issues.push(OE(r));
		}
	}, e(t.value, t)), t);
	return n;
}
// @__NO_SIDE_EFFECTS__
function bj(e, t) {
	let n = new nO({
		check: "custom",
		...H(t)
	});
	return n._zod.check = e, n;
}
//#endregion
//#region node_modules/zod/v4/core/to-json-schema.js
function xj(e, ...t) {
	for (let n of t) for (let t of Reflect.ownKeys(n)) Object.prototype.propertyIsEnumerable.call(n, t) && VT(e, t, n[t]);
	return e;
}
function Sj(e) {
	let t = e?.target ?? "draft-2020-12";
	return t === "draft-4" && (t = "draft-04"), t === "draft-7" && (t = "draft-07"), {
		processors: e.processors ?? {},
		metadataRegistry: e?.metadata ?? _A,
		target: t,
		unrepresentable: e?.unrepresentable ?? "throw",
		override: e?.override ?? (() => {}),
		io: e?.io ?? "output",
		counter: 0,
		seen: /* @__PURE__ */ new Map(),
		sharedDefsExtractedFor: void 0,
		sharedEmitDoneFor: void 0,
		cycles: e?.cycles ?? "ref",
		reused: e?.reused ?? "inline",
		intersections: [],
		deferred: [],
		external: e?.external ?? void 0
	};
}
function Cj(e, t, n, r, i) {
	let a = typeof t.unrepresentable == "function" ? t.unrepresentable({
		zodSchema: e,
		path: r.path,
		message: i
	}) : t.unrepresentable;
	if (a === "any") return !1;
	if (a === void 0 || a === "throw") throw Error(i);
	return Object.assign(n, a), !0;
}
function wj(e, t, n = {
	path: [],
	schemaPath: []
}) {
	var r;
	let i = e._zod.def, a = t.seen.get(e);
	if (a) return a.count++, n.schemaPath.includes(e) && (a.cycle = n.path), a.schema;
	let o = {
		schema: {},
		count: 1,
		cycle: void 0,
		path: n.path
	};
	t.seen.set(e, o), t.sharedDefsExtractedFor = void 0, t.sharedEmitDoneFor = void 0;
	let s = e._zod.toJSONSchema?.();
	if (s) o.schema = s;
	else {
		let r = {
			...n,
			schemaPath: [...n.schemaPath, e],
			path: n.path
		};
		if (e._zod.processJSONSchema) e._zod.processJSONSchema(t, o.schema, r);
		else {
			let n = o.schema, a = t.processors[i.type];
			if (!a) throw Error(`[toJSONSchema]: Non-representable type encountered: ${i.type}`);
			a(e, t, n, r);
		}
		let a = e._zod.parent;
		a && (o.ref ||= a, wj(a, t, r), t.seen.get(a).isParent = !0);
	}
	let c = t.metadataRegistry.get(e);
	return c && xj(o.schema, c), t.io === "input" && Pj(e) && (delete o.schema.examples, delete o.schema.default), t.io === "input" && "_prefault" in o.schema && ((r = o.schema).default ?? (r.default = o.schema._prefault)), delete o.schema._prefault, t.seen.get(e).schema;
}
function Tj(e) {
	return e.replace(/~/g, "~0").replace(/\//g, "~1");
}
function Ej(e, t) {
	let n = e.seen.get(t);
	if (!n) throw Error("Unprocessed schema. This is a bug in Zod.");
	if (e.external && e.sharedDefsExtractedFor === e.external) return;
	let r = /* @__PURE__ */ new Map();
	for (let t of e.seen.entries()) {
		let n = e.metadataRegistry.get(t[0])?.id;
		if (n) {
			let e = r.get(n);
			if (e && e !== t[0]) throw Error(`Duplicate schema id "${n}" detected during JSON Schema conversion. Two different schemas cannot share the same id when converted together.`);
			r.set(n, t[0]);
		}
	}
	let i = (t) => {
		let r = e.target === "draft-2020-12" ? "$defs" : "definitions";
		if (e.external) {
			let n = e.external.registry.get(t[0])?.id, i = e.external.uri ?? ((e) => e);
			if (n) return { ref: i(n) };
			let a = t[1].defId ?? t[1].schema.id ?? `schema${e.counter++}`;
			return t[1].defId = a, {
				defId: a,
				ref: `${i("__shared")}#/${r}/${Tj(a)}`
			};
		}
		let i = `#/${r}/`;
		if (t[1] === n && !t[1].schema.id) return { ref: "#" };
		let a = t[1].schema.id ?? `__schema${e.counter++}`;
		return {
			defId: a,
			ref: i + Tj(a)
		};
	}, a = (e) => {
		if (e[1].schema.$ref) return;
		let t = e[1], { ref: n, defId: r } = i(e);
		t.def = { ...t.schema }, r && (t.defId = r);
		let a = t.schema;
		for (let e in a) delete a[e];
		a.$ref = n;
	};
	if (e.cycles === "throw") for (let t of e.seen.entries()) {
		let e = t[1];
		if (e.cycle) throw Error(`Cycle detected: #/${e.cycle?.join("/")}/<root>

Set the \`cycles\` parameter to \`"ref"\` to resolve cyclical schemas with defs.`);
	}
	for (let n of e.seen.entries()) {
		let r = n[1];
		if (t === n[0]) {
			a(n);
			continue;
		}
		if (e.external) {
			let r = e.external.registry.get(n[0])?.id;
			if (t !== n[0] && r) {
				a(n);
				continue;
			}
		}
		if (e.metadataRegistry.get(n[0])?.id) {
			a(n);
			continue;
		}
		if (r.cycle) {
			a(n);
			continue;
		}
		r.count > 1 && e.reused === "ref" && a(n);
	}
	e.external && (e.sharedDefsExtractedFor = e.external);
}
function Dj(e) {
	let t = e.anyOf;
	if (!Array.isArray(t) || t.length === 0 || e.type !== void 0) return;
	let n = [];
	for (let e of t) {
		if (!e || typeof e != "object") return;
		Dj(e);
		let t = Object.keys(e);
		if (t.length !== 1 || t[0] !== "type") return;
		let r = e.type;
		for (let e of Array.isArray(r) ? r : [r]) {
			if (typeof e != "string") return;
			n.includes(e) || n.push(e);
		}
	}
	delete e.anyOf, e.type = n.length === 1 ? n[0] : n;
}
var Oj = /* @__PURE__ */ new Set([
	"type",
	"properties",
	"required",
	"additionalProperties"
]), kj = ["oneOf", "anyOf"];
function Aj(e) {
	let t = e.additionalProperties;
	return t === void 0 || t === !1 || typeof t != "object" || !t ? null : Object.keys(t).length ? t : null;
}
function jj(e) {
	let t = [];
	for (let n of e) {
		if (typeof n != "object" || n.type !== "object") return null;
		for (let e in n) if (!Oj.has(e)) return null;
		t.push(n);
	}
	let n = {}, r = /* @__PURE__ */ new Set();
	for (let e of t) {
		for (let r in e.properties) {
			if (Object.prototype.hasOwnProperty.call(n, r)) continue;
			let e = [];
			for (let n of t) {
				let t = n.properties?.[r] ?? Aj(n);
				t != null && (e.some((e) => JSON.stringify(e) === JSON.stringify(t)) || e.push(t));
			}
			VT(n, r, e.length === 1 ? e[0] : jj(e) ?? { allOf: e });
		}
		for (let t of e.required ?? []) r.add(t);
	}
	let i = {
		type: "object",
		properties: n
	};
	if (r.size && (i.required = [...r]), t.every((e) => e.additionalProperties === !1)) i.additionalProperties = !1;
	else {
		let e = [];
		for (let n of t) {
			let t = Aj(n);
			t && !e.some((e) => JSON.stringify(e) === JSON.stringify(t)) && e.push(t);
		}
		e.length === 1 ? i.additionalProperties = e[0] : e.length > 1 && (i.additionalProperties = { allOf: e });
	}
	return i;
}
function Mj(e) {
	let t = e.allOf;
	if (!Array.isArray(t) || t.length < 2) return;
	for (let t of Oj) if (t in e) return;
	let n = t.filter((e) => kj.some((t) => Array.isArray(e[t]))), r = null;
	if (!n.length) r = jj(t);
	else {
		let e = n[0], i = kj.find((t) => Array.isArray(e[t]));
		if (Object.keys(e).length !== 1) return;
		let a = t.filter((t) => t !== e), o = e[i].map((e) => jj([...a, e]));
		if (o.some((e) => !e)) return;
		r = { [i]: o };
	}
	r && (delete e.allOf, xj(e, r));
}
function Nj(e, t) {
	let n = e.seen.get(t);
	if (!n) throw Error("Unprocessed schema. This is a bug in Zod.");
	let r = (t) => {
		let n = e.seen.get(t);
		if (n.ref === null) return;
		let i = n.def ?? n.schema, a = { ...i }, o = n.ref;
		if (n.ref = null, o) {
			r(o);
			let n = e.seen.get(o), s = n.schema;
			if (s.$ref && (e.target === "draft-07" || e.target === "draft-04" || e.target === "openapi-3.0") ? (i.allOf = i.allOf ?? [], i.allOf.push(s)) : xj(i, s), xj(i, a), t._zod.parent === o) for (let e in i) e !== "$ref" && e !== "allOf" && (e in a || delete i[e]);
			if (s.$ref && n.def) for (let e in i) e !== "$ref" && e !== "allOf" && e in n.def && JSON.stringify(i[e]) === JSON.stringify(n.def[e]) && delete i[e];
		}
		let s = t._zod.parent;
		if (s && s !== o) {
			r(s);
			let t = e.seen.get(s);
			if (t?.schema.$ref && (i.$ref = t.schema.$ref, t.def)) for (let e in i) e !== "$ref" && e !== "allOf" && e in t.def && JSON.stringify(i[e]) === JSON.stringify(t.def[e]) && delete i[e];
		}
		e.override({
			zodSchema: t,
			jsonSchema: i,
			path: n.path ?? []
		});
	};
	if (!e.external || e.sharedEmitDoneFor !== e.external) {
		for (let t of [...e.seen.entries()].reverse()) r(t[0]);
		if (e.target !== "openapi-3.0") for (let t of e.seen.entries()) Dj(t[1].def ?? t[1].schema);
		for (let t of e.deferred) t();
		if (e.intersections.length) {
			let t = /* @__PURE__ */ new Map();
			for (let n of e.seen.values()) for (let e of [n.schema, n.def]) {
				let n = e?.allOf;
				if (!Array.isArray(n)) continue;
				let r = t.get(n);
				r ? r.push(e) : t.set(n, [e]);
			}
			for (let n of e.intersections) for (let e of t.get(n) ?? []) Mj(e);
		}
	}
	let i = {};
	if (e.target === "draft-2020-12" ? i.$schema = "https://json-schema.org/draft/2020-12/schema" : e.target === "draft-07" ? i.$schema = "http://json-schema.org/draft-07/schema#" : e.target === "draft-04" ? i.$schema = "http://json-schema.org/draft-04/schema#" : e.target, e.external?.uri) {
		let n = e.external.registry.get(t)?.id;
		if (!n) throw Error("Schema is missing an `id` property");
		i.$id = e.external.uri(n);
	}
	xj(i, n.defId ? n.schema : n.def ?? n.schema);
	let a = e.metadataRegistry.get(t)?.id;
	a !== void 0 && i.id === a && delete i.id;
	let o = e.external?.defs ?? {};
	if (!e.external || e.sharedEmitDoneFor !== e.external) for (let t of e.seen.entries()) {
		let e = t[1];
		e.def && e.defId && (e.def.id === e.defId && delete e.def.id, VT(o, e.defId, e.def));
	}
	e.external && (e.sharedEmitDoneFor = e.external), e.external || Object.keys(o).length > 0 && (e.target === "draft-2020-12" ? i.$defs = o : i.definitions = o);
	try {
		let n = JSON.parse(JSON.stringify(i));
		return Object.defineProperty(n, "~standard", {
			value: {
				...t["~standard"],
				jsonSchema: {
					input: Ij(t, "input", e.processors),
					output: Ij(t, "output", e.processors)
				}
			},
			enumerable: !1,
			writable: !1
		}), n;
	} catch {
		throw Error("Error converting schema to JSON.");
	}
}
function Pj(e, t) {
	let n = t ?? { seen: /* @__PURE__ */ new Set() };
	if (n.seen.has(e)) return !1;
	n.seen.add(e);
	let r = e._zod.def;
	if (r.type === "transform") return !0;
	if (r.type === "array") return Pj(r.element, n);
	if (r.type === "set") return Pj(r.valueType, n);
	if (r.type === "lazy") return Pj(r.getter(), n);
	if (r.type === "promise" || r.type === "optional" || r.type === "nonoptional" || r.type === "nullable" || r.type === "readonly" || r.type === "default" || r.type === "prefault" || r.type === "catch") return Pj(r.innerType, n);
	if (r.type === "intersection") return Pj(r.left, n) || Pj(r.right, n);
	if (r.type === "record" || r.type === "map") return Pj(r.keyType, n) || Pj(r.valueType, n);
	if (r.type === "pipe") return e._zod.traits.has("$ZodCodec") ? !0 : Pj(r.in, n) || Pj(r.out, n);
	if (r.type === "object") {
		for (let e in r.shape) if (Pj(r.shape[e], n)) return !0;
		return !1;
	}
	if (r.type === "union") {
		for (let e of r.options) if (Pj(e, n)) return !0;
		return !1;
	}
	if (r.type === "tuple") {
		for (let e of r.items) if (Pj(e, n)) return !0;
		return !!(r.rest && Pj(r.rest, n));
	}
	return !1;
}
var Fj = (e, t = {}) => (n) => {
	let r = Sj({
		...n,
		processors: t
	});
	return wj(e, r), Ej(r, e), Nj(r, e);
}, Ij = (e, t, n = {}) => (r) => {
	let { libraryOptions: i, target: a } = r ?? {}, o = Sj({
		...i ?? {},
		target: a,
		io: t,
		processors: n
	});
	return wj(e, o), Ej(o, e), Nj(o, e);
}, Lj = (e, t, n) => {
	(e[t] === void 0 || n > e[t]) && (e[t] = n);
}, Rj = (e, t, n) => {
	(e[t] === void 0 || n < e[t]) && (e[t] = n);
}, zj = (e, t) => {
	Lj(e, "minimum", t), Rj(e, "maximum", t);
}, Bj = (e, t) => {
	e.multipleOf ??= [], e.multipleOf.includes(t) || e.multipleOf.push(t);
}, Vj = (e, t) => {
	e.patterns ??= /* @__PURE__ */ new Set(), e.patterns.add(t);
}, Hj = (e, t) => {
	e.mime = e.mime ? e.mime.filter((e) => t.includes(e)) : [...t];
}, Uj = (e, t) => {
	e.format = t, t.includes("int") && (e.isInt = !0);
}, Wj = (e, t) => Lj(e, "minimum", t.minimum), Gj = (e, t) => Rj(e, "maximum", t.maximum), Kj = (e) => (t, n) => {
	Uj(t, n.format);
	let [r, i] = e[n.format];
	Lj(t, "minimum", r), Rj(t, "maximum", i);
}, qj = {
	greater_than: (e, t) => Lj(e, t.inclusive ? "minimum" : "exclusiveMinimum", t.value),
	less_than: (e, t) => Rj(e, t.inclusive ? "maximum" : "exclusiveMaximum", t.value),
	multiple_of: (e, t) => Bj(e, t.value),
	number_format: Kj(sE),
	bigint_format: Kj(cE),
	min_length: Wj,
	max_length: Gj,
	length_equals: (e, t) => zj(e, t.length),
	min_size: Wj,
	max_size: Gj,
	size_equals: (e, t) => zj(e, t.size),
	string_format: (e, t) => {
		Uj(e, t.format), t.pattern && Vj(e, t.pattern), (t.format === "base64" || t.format === "base64url") && (e.contentEncoding = t.format), (t.local || t.precision === -1) && (e.laxFormat = !0);
	},
	mime_type: (e, t) => Hj(e, t.mime)
};
function Jj(e) {
	let t = {}, n = e._zod.def, r = e._zod.traits.has("$ZodCheck") ? [e, ...n.checks ?? []] : n.checks ?? [];
	for (let e of r) qj[e._zod.def.check]?.(t, e._zod.def);
	let i = e._zod.bag;
	i.minimum !== void 0 && Lj(t, "minimum", i.minimum), i.exclusiveMinimum !== void 0 && Lj(t, "exclusiveMinimum", i.exclusiveMinimum), i.maximum !== void 0 && Rj(t, "maximum", i.maximum), i.exclusiveMaximum !== void 0 && Rj(t, "exclusiveMaximum", i.exclusiveMaximum), i.multipleOf !== void 0 && Bj(t, i.multipleOf), i.format !== void 0 && (t.format ??= i.format, i.format.includes("int") && (t.isInt = !0)), i.mime && Hj(t, i.mime);
	for (let e of i.patterns ?? []) Vj(t, e);
	return t;
}
var Yj = {
	guid: "uuid",
	url: "uri",
	datetime: "date-time",
	json_string: "json-string",
	regex: ""
}, Xj = /* @__PURE__ */ new Map([[rk, VD], [ak, HD]]), Zj = (e) => Xj.get(e) ?? e, Qj = (e, t, n, r) => {
	let i = n;
	i.type = "string";
	let { minimum: a, maximum: o, format: s, patterns: c, contentEncoding: l, laxFormat: u } = Jj(e);
	if (typeof a == "number" && (i.minLength = a), typeof o == "number" && (i.maxLength = o), s && (i.format = Yj[s] ?? s, i.format === "" && delete i.format, (s === "time" || u) && delete i.format), l && (i.contentEncoding = l), c && c.size > 0) {
		let e = [...c].map(Zj);
		e.length === 1 ? i.pattern = e[0].source : e.length > 1 && (i.allOf = [...e.map((e) => ({
			...t.target === "draft-07" || t.target === "draft-04" || t.target === "openapi-3.0" ? { type: "string" } : {},
			pattern: e.source
		}))]);
	}
}, $j = (e, t, n, r) => {
	let i = n, { minimum: a, maximum: o, multipleOf: s, exclusiveMaximum: c, exclusiveMinimum: l, isInt: u } = Jj(e);
	i.type = u ? "integer" : "number";
	let d = typeof l == "number" && l >= (a ?? -Infinity), f = typeof c == "number" && c <= (o ?? Infinity), p = t.target === "draft-04" || t.target === "openapi-3.0";
	if (d ? p ? (i.minimum = l, i.exclusiveMinimum = !0) : i.exclusiveMinimum = l : typeof a == "number" && (i.minimum = a), f ? p ? (i.maximum = c, i.exclusiveMaximum = !0) : i.exclusiveMaximum = c : typeof o == "number" && (i.maximum = o), s) {
		let n = /* @__PURE__ */ new Set();
		for (let a of s) Number.isFinite(a) && a !== 0 ? n.add(Math.abs(a)) : Cj(e, t, i, r, `A multipleOf divisor of ${a} cannot be represented in JSON Schema`);
		let [a, ...o] = n;
		a !== void 0 && (i.multipleOf = a), o.length && (i.allOf = [...i.allOf ?? [], ...o.map((e) => ({ multipleOf: e }))]);
	}
}, eM = (e, t, n, r) => {
	n.type = "boolean";
}, tM = (e, t, n, r) => {
	n.not = {};
}, nM = (e, t, n, r) => {
	let i = e._zod.def, a = NT(i.entries);
	if (a.length === 0) {
		n.not = {};
		return;
	}
	a.every((e) => typeof e == "number") && (n.type = "number"), a.every((e) => typeof e == "string") && (n.type = "string"), n.enum = a;
}, rM = (e, t, n, r) => {
	let i = e._zod.def;
	if (i.values.length === 0) {
		n.not = {};
		return;
	}
	let a = [];
	for (let o of i.values) if (o === void 0) {
		if (Cj(e, t, n, r, "Literal `undefined` cannot be represented in JSON Schema")) return;
	} else if (typeof o == "bigint") {
		if (Cj(e, t, n, r, "BigInt literals cannot be represented in JSON Schema")) return;
		a.push(Number(o));
	} else a.push(o);
	if (a.length !== 0) {
		if (a.length === 1) {
			let e = a[0];
			n.type = e === null ? "null" : typeof e, t.target === "draft-04" || t.target === "openapi-3.0" ? n.enum = [e] : n.const = e;
		} else a.every((e) => typeof e == "number") && (n.type = "number"), a.every((e) => typeof e == "string") && (n.type = "string"), a.every((e) => typeof e == "boolean") && (n.type = "boolean"), a.every((e) => e === null) && (n.type = "null"), n.enum = a;
	}
}, iM = (e, t, n, r) => {
	Cj(e, t, n, r, "Custom types cannot be represented in JSON Schema");
}, aM = (e, t, n, r) => {
	Cj(e, t, n, r, "Transforms cannot be represented in JSON Schema");
}, oM = (e, t, n, r) => {
	let i = n, a = e._zod.def, { minimum: o, maximum: s } = Jj(e);
	typeof o == "number" && (i.minItems = o), typeof s == "number" && (i.maxItems = s), i.type = "array", i.items = wj(a.element, t, {
		...r,
		path: [...r.path, "items"]
	});
};
function sM(e) {
	let t = e._zod.def;
	return t.type === "pipe" && t.in._zod.traits.has("$ZodTransform") ? sM(t.out) : t.type === "catch" ? sM(t.innerType) : e._zod.optin;
}
var cM = (e, t, n, r) => {
	let i = n, a = e._zod.def, o = a.shape;
	if (Object.getOwnPropertySymbols(o).length && Cj(e, t, i, r, "Symbol keys cannot be represented in JSON Schema")) return;
	i.type = "object", i.properties = {};
	for (let e in o) VT(i.properties, e, wj(o[e], t, {
		...r,
		path: [
			...r.path,
			"properties",
			e
		]
	}));
	let s = [];
	for (let e of Object.keys(o)) {
		let n = a.shape[e];
		(t.io === "input" ? sM(n) === void 0 : n._zod.optout === void 0) && s.push(e);
	}
	s.length > 0 && (i.required = s), a.catchall?._zod.def.type === "never" ? i.additionalProperties = !1 : a.catchall ? a.catchall && (i.additionalProperties = wj(a.catchall, t, {
		...r,
		path: [...r.path, "additionalProperties"]
	})) : t.io === "output" && (i.additionalProperties = !1);
}, lM = (e, t, n, r) => {
	let i = e._zod.def, a = i.inclusive === !1, o = i.options.map((e, n) => wj(e, t, {
		...r,
		path: [
			...r.path,
			a ? "oneOf" : "anyOf",
			n
		]
	}));
	a ? n.oneOf = o : n.anyOf = o;
}, uM = (e, t, n, r) => {
	let i = e._zod.def, a = wj(i.left, t, {
		...r,
		path: [
			...r.path,
			"allOf",
			0
		]
	}), o = wj(i.right, t, {
		...r,
		path: [
			...r.path,
			"allOf",
			1
		]
	}), s = (e) => "allOf" in e && Object.keys(e).length === 1, c = [...s(a) ? a.allOf : [a], ...s(o) ? o.allOf : [o]];
	n.allOf = c, t.intersections.push(c);
}, dM = (e, t, n, r) => {
	let i = e._zod.def, a = wj(i.innerType, t, r), o = t.seen.get(e);
	t.target === "openapi-3.0" ? (o.ref = i.innerType, n.nullable = !0) : n.anyOf = [a, { type: "null" }];
}, fM = (e, t, n, r) => {
	let i = e._zod.def;
	wj(i.innerType, t, r);
	let a = t.seen.get(e);
	a.ref = i.innerType;
}, pM = Symbol();
function mM(e, t, n, r, i) {
	let a = !1, o = JSON.stringify(e, (e, t) => typeof t == "bigint" ? (a = !0, null) : t);
	return a ? (Cj(t, n, r, i, "BigInt defaults cannot be represented in JSON Schema"), pM) : JSON.parse(o);
}
var hM = (e, t, n, r) => {
	let i = e._zod.def;
	wj(i.innerType, t, r);
	let a = t.seen.get(e);
	a.ref = i.innerType;
	let o = mM(i.defaultValue, e, t, n, r);
	o !== pM && (n.default = o);
}, gM = (e, t, n, r) => {
	let i = e._zod.def;
	wj(i.innerType, t, r);
	let a = t.seen.get(e);
	if (a.ref = i.innerType, t.io !== "input") return;
	let o = mM(i.defaultValue, e, t, n, r);
	o !== pM && (n._prefault = o);
}, _M = (e, t, n, r) => {
	let i = e._zod.def;
	wj(i.innerType, t, r);
	let a = t.seen.get(e);
	a.ref = i.innerType;
	let o;
	try {
		o = i.catchValue(void 0);
	} catch {
		Cj(e, t, n, r, "Dynamic catch values are not supported in JSON Schema");
		return;
	}
	n.default = o;
}, vM = (e, t, n, r) => {
	let i = e._zod.def, a = i.in._zod.traits.has("$ZodTransform"), o = t.io === "input" ? a ? i.out : i.in : i.out;
	wj(o, t, r);
	let s = t.seen.get(e);
	s.ref = o;
}, yM = (e, t, n, r) => {
	let i = e._zod.def;
	wj(i.innerType, t, r);
	let a = t.seen.get(e);
	a.ref = i.innerType, n.readOnly = !0;
}, bM = (e, t, n, r) => {
	let i = e._zod.def;
	wj(i.innerType, t, r);
	let a = t.seen.get(e);
	a.ref = i.innerType;
}, xM = /* @__PURE__ */ new WeakSet([Object.prototype, Error.prototype]);
function SM(e, t, n) {
	Object.defineProperty(e, t, {
		configurable: !0,
		enumerable: !1,
		get() {
			let e = n(this);
			return Object.defineProperty(this, t, {
				value: e,
				configurable: !0,
				writable: !0
			}), e;
		},
		set(e) {
			Object.defineProperty(this, t, {
				value: e,
				configurable: !0,
				writable: !0
			});
		}
	});
}
var CM = /*@__PURE__*/ W("ZodError", (e, t) => {
	tD.init(e, t), e.name = "ZodError";
	let n = Object.getPrototypeOf(e);
	xM.has(n) || (xM.add(n), SM(n, "format", (e) => (t) => iD(e, t)), SM(n, "flatten", (e) => (t) => rD(e, t)), SM(n, "addIssue", (e) => (t) => {
		e.issues.push(t), e.message = JSON.stringify(e.issues, FT, 2);
	}), SM(n, "addIssues", (e) => (t) => {
		e.issues.push(...t), e.message = JSON.stringify(e.issues, FT, 2);
	}), Object.defineProperty(n, "isEmpty", {
		configurable: !0,
		enumerable: !1,
		get() {
			return this.issues.length === 0;
		}
	}));
}, void 0, { Parent: Error }), wM = /* @__PURE__ */ oD(CM), TM = /* @__PURE__ */ sD(CM), EM = /* @__PURE__ */ cD(CM), DM = /* @__PURE__ */ uD(CM), OM = /* @__PURE__ */ gD(CM), kM = /* @__PURE__ */ _D(CM), AM = /* @__PURE__ */ vD(CM), jM = /* @__PURE__ */ yD(CM), MM = /* @__PURE__ */ bD(CM), NM = /* @__PURE__ */ xD(CM), PM = /* @__PURE__ */ SD(CM), FM = /* @__PURE__ */ CD(CM);
//#endregion
//#region node_modules/zod/v4/classic/schemas.js
function IM() {
	qE.localeError || JE(pA());
}
function LM() {
	qE.memoizer || JE({ memoizer: uA() });
}
var RM = /*@__PURE__*/ W("ZodType", (e, t) => (IM(), SO.init(e, t), e.def = t, e.type = t.type, e), {
	check(...e) {
		let t = this.def;
		return this.clone(JT(t, { checks: [...t.checks ?? [], ...e.map((e) => typeof e == "function" ? { _zod: {
			check: e,
			def: { check: "custom" },
			onattach: []
		} } : e)] }), { parent: !0 });
	},
	with(...e) {
		return this.check(...e);
	},
	clone(e, t) {
		return iE(this, e, t);
	},
	brand() {
		return this;
	},
	register(e, t) {
		return e.add(this, t), this;
	},
	refine(e, t) {
		return this.check(QN(e, t));
	},
	superRefine(e, t) {
		return this.check($N(e, t));
	},
	overwrite(e) {
		return this.check(/* @__PURE__ */ dj(e));
	},
	optional() {
		return PN(this);
	},
	exactOptional() {
		return IN(this);
	},
	nullable() {
		return RN(this);
	},
	nullish() {
		return PN(RN(this));
	},
	nonoptional(e) {
		return WN(this, e);
	},
	array() {
		return bN(this);
	},
	or(e) {
		return wN([this, e]);
	},
	and(e) {
		return EN(this, e);
	},
	transform(e) {
		return JN(this, MN(e));
	},
	default(e) {
		return BN(this, e);
	},
	prefault(e) {
		return HN(this, e);
	},
	catch(e) {
		return KN(this, e);
	},
	pipe(e) {
		return JN(this, e);
	},
	readonly() {
		return XN(this);
	},
	describe(e) {
		let t = this.clone();
		return _A.add(t, { description: e }), t;
	},
	meta(...e) {
		if (e.length === 0) return _A.get(this);
		let t = this.clone();
		return _A.add(t, e[0]), t;
	},
	isOptional() {
		return this.safeParse(void 0).success;
	},
	isNullable() {
		return this.safeParse(null).success;
	},
	apply(e, ...t) {
		return t.length === 0 ? e(this) : e(this, ...t);
	},
	get "~standard"() {
		return jE(this, "~standard", {
			...TO(this),
			jsonSchema: {
				input: Ij(this, "input"),
				output: Ij(this, "output")
			}
		});
	},
	set "~standard"(e) {
		AE(this, "~standard", e);
	},
	parse: function e(t, n) {
		return wM(this, t, n, { callee: e });
	},
	parseAsync: async function e(t, n) {
		return await TM(this, t, n, { callee: e });
	},
	safeParse(e, t) {
		return EM(this, e, t);
	},
	async safeParseAsync(e, t) {
		return DM(this, e, t);
	},
	get spa() {
		return this?.safeParseAsync;
	},
	set spa(e) {
		AE(this, "spa", e);
	},
	validate(e, t) {
		return pD(this, e, t);
	},
	validateAsync(e, t) {
		return hD(this, e, t);
	},
	encode: function e(t, n) {
		return OM(this, t, n, { callee: e });
	},
	decode: function e(t, n) {
		return kM(this, t, n, { callee: e });
	},
	encodeAsync: async function e(t, n) {
		return await AM(this, t, n, { callee: e });
	},
	decodeAsync: async function e(t, n) {
		return await jM(this, t, n, { callee: e });
	},
	safeEncode(e, t) {
		return MM(this, e, t);
	},
	safeDecode(e, t) {
		return NM(this, e, t);
	},
	async safeEncodeAsync(e, t) {
		return PM(this, e, t);
	},
	async safeDecodeAsync(e, t) {
		return FM(this, e, t);
	},
	toJSONSchema(e) {
		return Fj(this, {})(e);
	},
	get description() {
		return _A.get(this)?.description;
	},
	get _def() {
		return this._zod.def;
	}
}), zM = /*@__PURE__*/ W("_ZodString", (e, t) => {
	EO.init(e, t), RM.init(e, t), e._zod.processJSONSchema = (t, n, r) => Qj(e, t, n, r);
}, /*@__PURE__*/ ME({
	format: (e) => Jj(e).format ?? null,
	minLength: (e) => Jj(e).minimum ?? null,
	maxLength: (e) => Jj(e).maximum ?? null
}, {
	regex(...e) {
		return this.check(/* @__PURE__ */ aj(...e));
	},
	includes(...e) {
		return this.check(/* @__PURE__ */ cj(...e));
	},
	startsWith(...e) {
		return this.check(/* @__PURE__ */ lj(...e));
	},
	endsWith(...e) {
		return this.check(/* @__PURE__ */ uj(...e));
	},
	min(...e) {
		return this.check(/* @__PURE__ */ rj(...e));
	},
	max(...e) {
		return this.check(/* @__PURE__ */ nj(...e));
	},
	length(...e) {
		return this.check(/* @__PURE__ */ ij(...e));
	},
	nonempty(...e) {
		return this.check(/* @__PURE__ */ rj(1, ...e));
	},
	lowercase(e) {
		return this.check(/* @__PURE__ */ oj(e));
	},
	uppercase(e) {
		return this.check(/* @__PURE__ */ sj(e));
	},
	trim() {
		return this.check(/* @__PURE__ */ pj());
	},
	normalize(...e) {
		return this.check(/* @__PURE__ */ fj(...e));
	},
	toLowerCase() {
		return this.check(/* @__PURE__ */ mj());
	},
	toUpperCase() {
		return this.check(/* @__PURE__ */ hj());
	},
	slugify() {
		return this.check(/* @__PURE__ */ gj());
	}
})), BM = /*@__PURE__*/ W("ZodString", (e, t) => {
	EO.init(e, t), zM.init(e, t);
}, {
	email(e) {
		return this.check(/* @__PURE__ */ bA(GM, e));
	},
	url(e) {
		return this.check(/* @__PURE__ */ EA(JM, e));
	},
	jwt(e) {
		return this.check(/* @__PURE__ */ VA(lN, e));
	},
	emoji(e) {
		return this.check(/* @__PURE__ */ DA(YM, e));
	},
	guid(e) {
		return this.check(/* @__PURE__ */ xA(KM, e));
	},
	uuid(e) {
		return this.check(/* @__PURE__ */ SA(qM, e));
	},
	uuidv4(e) {
		return this.check(/* @__PURE__ */ CA(qM, e));
	},
	uuidv6(e) {
		return this.check(/* @__PURE__ */ wA(qM, e));
	},
	uuidv7(e) {
		return this.check(/* @__PURE__ */ TA(qM, e));
	},
	nanoid(e) {
		return this.check(/* @__PURE__ */ OA(XM, e));
	},
	cuid(e) {
		return this.check(/* @__PURE__ */ kA(ZM, e));
	},
	cuid2(e) {
		return this.check(/* @__PURE__ */ AA(QM, e));
	},
	ulid(e) {
		return this.check(/* @__PURE__ */ jA($M, e));
	},
	base64(e) {
		return this.check(/* @__PURE__ */ RA(oN, e));
	},
	base64url(e) {
		return this.check(/* @__PURE__ */ zA(sN, e));
	},
	xid(e) {
		return this.check(/* @__PURE__ */ MA(eN, e));
	},
	ksuid(e) {
		return this.check(/* @__PURE__ */ NA(tN, e));
	},
	ipv4(e) {
		return this.check(/* @__PURE__ */ PA(nN, e));
	},
	ipv6(e) {
		return this.check(/* @__PURE__ */ FA(rN, e));
	},
	cidrv4(e) {
		return this.check(/* @__PURE__ */ IA(iN, e));
	},
	cidrv6(e) {
		return this.check(/* @__PURE__ */ LA(aN, e));
	},
	e164(e) {
		return this.check(/* @__PURE__ */ BA(cN, e));
	},
	datetime(e) {
		return this.check(/* @__PURE__ */ HA(VM, e));
	},
	date(e) {
		return this.check(/* @__PURE__ */ UA(HM, e));
	},
	time(e) {
		return this.check(/* @__PURE__ */ WA(UM, e));
	},
	duration(e) {
		return this.check(/* @__PURE__ */ GA(WM, e));
	}
});
function K(e) {
	return /* @__PURE__ */ yA(BM, e);
}
var q = /*@__PURE__*/ W("ZodStringFormat", (e, t) => {
	G.init(e, t), zM.init(e, t);
}), VM = /*@__PURE__*/ W("ZodISODateTime", (e, t) => {
	GO.init(e, t), q.init(e, t);
}), HM = /*@__PURE__*/ W("ZodISODate", (e, t) => {
	KO.init(e, t), q.init(e, t);
}), UM = /*@__PURE__*/ W("ZodISOTime", (e, t) => {
	qO.init(e, t), q.init(e, t);
}), WM = /*@__PURE__*/ W("ZodISODuration", (e, t) => {
	JO.init(e, t), q.init(e, t);
}), GM = /*@__PURE__*/ W("ZodEmail", (e, t) => {
	kO.init(e, t), q.init(e, t);
}), KM = /*@__PURE__*/ W("ZodGUID", (e, t) => {
	DO.init(e, t), q.init(e, t);
}), qM = /*@__PURE__*/ W("ZodUUID", (e, t) => {
	OO.init(e, t), q.init(e, t);
}), JM = /*@__PURE__*/ W("ZodURL", (e, t) => {
	LO.init(e, t), q.init(e, t);
}), YM = /*@__PURE__*/ W("ZodEmoji", (e, t) => {
	RO.init(e, t), q.init(e, t);
}), XM = /*@__PURE__*/ W("ZodNanoID", (e, t) => {
	zO.init(e, t), q.init(e, t);
}), ZM = /*@__PURE__*/ W("ZodCUID", (e, t) => {
	BO.init(e, t), q.init(e, t);
}), QM = /*@__PURE__*/ W("ZodCUID2", (e, t) => {
	VO.init(e, t), q.init(e, t);
}), $M = /*@__PURE__*/ W("ZodULID", (e, t) => {
	HO.init(e, t), q.init(e, t);
}), eN = /*@__PURE__*/ W("ZodXID", (e, t) => {
	UO.init(e, t), q.init(e, t);
}), tN = /*@__PURE__*/ W("ZodKSUID", (e, t) => {
	WO.init(e, t), q.init(e, t);
}), nN = /*@__PURE__*/ W("ZodIPv4", (e, t) => {
	YO.init(e, t), q.init(e, t);
}), rN = /*@__PURE__*/ W("ZodIPv6", (e, t) => {
	QO.init(e, t), q.init(e, t);
}), iN = /*@__PURE__*/ W("ZodCIDRv4", (e, t) => {
	$O.init(e, t), q.init(e, t);
}), aN = /*@__PURE__*/ W("ZodCIDRv6", (e, t) => {
	tk.init(e, t), q.init(e, t);
}), oN = /*@__PURE__*/ W("ZodBase64", (e, t) => {
	ik.init(e, t), q.init(e, t);
}), sN = /*@__PURE__*/ W("ZodBase64URL", (e, t) => {
	sk.init(e, t), q.init(e, t);
}), cN = /*@__PURE__*/ W("ZodE164", (e, t) => {
	ck.init(e, t), q.init(e, t);
}), lN = /*@__PURE__*/ W("ZodJWT", (e, t) => {
	uk.init(e, t), q.init(e, t);
}), uN = /*@__PURE__*/ W("ZodNumber", (e, t) => {
	dk.init(e, t), RM.init(e, t), e._zod.processJSONSchema = (t, n, r) => $j(e, t, n, r), e.isFinite = !0;
}, /*@__PURE__*/ ME({
	minValue: (e) => {
		let { minimum: t, exclusiveMinimum: n } = Jj(e);
		return Math.max(t ?? -Infinity, n ?? -Infinity);
	},
	maxValue: (e) => {
		let { maximum: t, exclusiveMaximum: n } = Jj(e);
		return Math.min(t ?? Infinity, n ?? Infinity);
	},
	isInt: (e) => {
		let { isInt: t, multipleOf: n } = Jj(e);
		return !!t || !!n?.some(Number.isSafeInteger);
	},
	format: (e) => Jj(e).format ?? null
}, {
	gt(e, t) {
		return this.check(/* @__PURE__ */ $A(e, t));
	},
	gte(e, t) {
		return this.check(/* @__PURE__ */ ej(e, t));
	},
	min(e, t) {
		return this.check(/* @__PURE__ */ ej(e, t));
	},
	lt(e, t) {
		return this.check(/* @__PURE__ */ ZA(e, t));
	},
	lte(e, t) {
		return this.check(/* @__PURE__ */ QA(e, t));
	},
	max(e, t) {
		return this.check(/* @__PURE__ */ QA(e, t));
	},
	int(e) {
		return this.check(fN(e));
	},
	safe(e) {
		return this.check(fN(e));
	},
	positive(e) {
		return this.check(/* @__PURE__ */ $A(0, e));
	},
	nonnegative(e) {
		return this.check(/* @__PURE__ */ ej(0, e));
	},
	negative(e) {
		return this.check(/* @__PURE__ */ ZA(0, e));
	},
	nonpositive(e) {
		return this.check(/* @__PURE__ */ QA(0, e));
	},
	multipleOf(e, t) {
		return this.check(/* @__PURE__ */ tj(e, t));
	},
	step(e, t) {
		return this.check(/* @__PURE__ */ tj(e, t));
	},
	finite() {
		return this;
	}
}));
function J(e) {
	return /* @__PURE__ */ KA(uN, e);
}
var dN = /*@__PURE__*/ W("ZodNumberFormat", (e, t) => {
	fk.init(e, t), uN.init(e, t);
});
function fN(e) {
	return /* @__PURE__ */ qA(dN, e);
}
var pN = /*@__PURE__*/ W("ZodBoolean", (e, t) => {
	pk.init(e, t), RM.init(e, t), e._zod.processJSONSchema = (t, n, r) => eM(e, t, n, r);
});
function mN(e) {
	return /* @__PURE__ */ JA(pN, e);
}
var hN = /*@__PURE__*/ W("ZodUnknown", (e, t) => {
	mk.init(e, t), RM.init(e, t), e._zod.processJSONSchema = (e, t, n) => void 0;
});
function gN() {
	return /* @__PURE__ */ YA(hN);
}
var _N = /*@__PURE__*/ W("ZodNever", (e, t) => {
	hk.init(e, t), RM.init(e, t), e._zod.processJSONSchema = (t, n, r) => tM(e, t, n, r);
});
function vN(e) {
	return /* @__PURE__ */ XA(_N, e);
}
var yN = /*@__PURE__*/ W("ZodArray", (e, t) => {
	LM(), _k.init(e, t), RM.init(e, t), e._zod.processJSONSchema = (t, n, r) => oM(e, t, n, r), e.element = t.element;
}, {
	min(e, t) {
		return this.check(/* @__PURE__ */ rj(e, t));
	},
	nonempty(e) {
		return this.check(/* @__PURE__ */ rj(1, e));
	},
	max(e, t) {
		return this.check(/* @__PURE__ */ nj(e, t));
	},
	length(e, t) {
		return this.check(/* @__PURE__ */ ij(e, t));
	},
	unwrap() {
		return this.element;
	}
});
function bN(e, t) {
	return /* @__PURE__ */ _j(yN, e, t);
}
var xN = /*@__PURE__*/ W("ZodObject", (e, t) => {
	LM(), Ck.init(e, t), RM.init(e, t), e._zod.processJSONSchema = (t, n, r) => cM(e, t, n, r), RE(e, "shape", (e) => e._zod.def.shape, !1);
}, {
	keyof() {
		return ON(Object.keys(this._zod.def.shape));
	},
	catchall(e) {
		return this.clone(JT(this._zod.def, { catchall: e }));
	},
	passthrough() {
		return this.clone(JT(this._zod.def, { catchall: gN() }));
	},
	loose() {
		return this.clone(JT(this._zod.def, { catchall: gN() }));
	},
	strict() {
		return this.clone(JT(this._zod.def, { catchall: vN() }));
	},
	strip() {
		return this.clone(JT(this._zod.def, { catchall: void 0 }));
	},
	extend(e) {
		return fE(this, e);
	},
	safeExtend(e) {
		return mE(this, e);
	},
	merge(e) {
		return hE(this, e);
	},
	pick(e) {
		return lE(this, e);
	},
	omit(e) {
		return dE(this, e);
	},
	partial(...e) {
		return gE(NN, this, e[0]);
	},
	exactPartial(...e) {
		return gE(FN, this, e[0], "exactPartial");
	},
	required(...e) {
		return _E(UN, this, e[0]);
	}
});
function SN(e, t) {
	return new xN({
		type: "object",
		shape: e ?? {},
		...H(t)
	});
}
var CN = /*@__PURE__*/ W("ZodUnion", (e, t) => {
	Tk.init(e, t), RM.init(e, t), e._zod.processJSONSchema = (t, n, r) => lM(e, t, n, r), e.options = t.options;
});
function wN(e, t) {
	return new CN({
		type: "union",
		options: e,
		...H(t)
	});
}
var TN = /*@__PURE__*/ W("ZodIntersection", (e, t) => {
	Ek.init(e, t), RM.init(e, t), e._zod.processJSONSchema = (t, n, r) => uM(e, t, n, r);
});
function EN(e, t) {
	return new TN({
		type: "intersection",
		left: e,
		right: t
	});
}
var DN = /*@__PURE__*/ W("ZodEnum", (e, t) => {
	kk.init(e, t), RM.init(e, t), e._zod.processJSONSchema = (t, n, r) => nM(e, t, n, r), e.enum = t.entries, e.options = [...e._zod.values];
	let n = new Set(Object.keys(t.entries));
	e.extract = (e, r) => {
		let i = {};
		for (let r of e) if (n.has(r)) i[r] = t.entries[r];
		else throw Error(`Key ${r} not found in enum`);
		return new DN({
			...t,
			checks: [],
			...H(r),
			entries: i
		});
	}, e.exclude = (e, r) => {
		let i = { ...t.entries };
		for (let t of e) if (n.has(t)) delete i[t];
		else throw Error(`Key ${t} not found in enum`);
		return new DN({
			...t,
			checks: [],
			...H(r),
			entries: i
		});
	};
});
function ON(e, t) {
	return new DN({
		type: "enum",
		entries: Array.isArray(e) ? Object.fromEntries(e.map((e) => [e, e])) : e,
		...H(t)
	});
}
var kN = /*@__PURE__*/ W("ZodLiteral", (e, t) => {
	Ak.init(e, t), RM.init(e, t), e._zod.processJSONSchema = (t, n, r) => rM(e, t, n, r), e.values = new Set(t.values), Object.defineProperty(e, "value", { get() {
		if (t.values.length > 1) throw Error("This schema contains multiple valid literal values. Use `.values` instead.");
		return t.values[0];
	} });
});
function AN(e, t) {
	return new kN({
		type: "literal",
		values: Array.isArray(e) ? e : [e],
		...H(t)
	});
}
var jN = /*@__PURE__*/ W("ZodTransform", (e, t) => {
	LM(), jk.init(e, t), RM.init(e, t), e._zod.processJSONSchema = (t, n, r) => aM(e, t, n, r), e._zod.parse = (n, r) => {
		if (r.direction === "backward") throw new KE(e.constructor.name);
		n.addIssue = (r) => {
			if (typeof r == "string") n.issues.push(OE(r, n.value, t));
			else {
				let t = r;
				t.fatal && (t.continue = !1), t.code ??= "custom", "input" in t || (t.input = n.value), t.inst ??= e, n.issues.push(OE(t));
			}
		};
		let i = t.transform(n.value, n);
		return i instanceof Promise ? i.then((e) => (n.value = e, n)) : (n.value = i, n);
	};
});
function MN(e) {
	return new jN({
		type: "transform",
		transform: e
	});
}
var NN = /*@__PURE__*/ W("ZodOptional", (e, t) => {
	Nk.init(e, t), RM.init(e, t), e._zod.processJSONSchema = (t, n, r) => bM(e, t, n, r), e.unwrap = () => e._zod.def.innerType;
});
function PN(e) {
	return new NN({
		type: "optional",
		innerType: e
	});
}
var FN = /*@__PURE__*/ W("ZodExactOptional", (e, t) => {
	Pk.init(e, t), RM.init(e, t), e._zod.processJSONSchema = (t, n, r) => bM(e, t, n, r), e.unwrap = () => e._zod.def.innerType;
});
function IN(e) {
	return new FN({
		type: "optional",
		innerType: e
	});
}
var LN = /*@__PURE__*/ W("ZodNullable", (e, t) => {
	Fk.init(e, t), RM.init(e, t), e._zod.processJSONSchema = (t, n, r) => dM(e, t, n, r), e.unwrap = () => e._zod.def.innerType;
});
function RN(e) {
	return new LN({
		type: "nullable",
		innerType: e
	});
}
var zN = /*@__PURE__*/ W("ZodDefault", (e, t) => {
	Ik.init(e, t), RM.init(e, t), e._zod.processJSONSchema = (t, n, r) => hM(e, t, n, r), e.unwrap = () => e._zod.def.innerType, e.removeDefault = e.unwrap;
});
function BN(e, t) {
	return new zN({
		type: "default",
		innerType: e,
		get defaultValue() {
			return typeof t == "function" ? t() : tE(t);
		}
	});
}
var VN = /*@__PURE__*/ W("ZodPrefault", (e, t) => {
	Rk.init(e, t), RM.init(e, t), e._zod.processJSONSchema = (t, n, r) => gM(e, t, n, r), e.unwrap = () => e._zod.def.innerType;
});
function HN(e, t) {
	return new VN({
		type: "prefault",
		innerType: e,
		get defaultValue() {
			return typeof t == "function" ? t() : tE(t);
		}
	});
}
var UN = /*@__PURE__*/ W("ZodNonOptional", (e, t) => {
	zk.init(e, t), RM.init(e, t), e._zod.processJSONSchema = (t, n, r) => fM(e, t, n, r), e.unwrap = () => e._zod.def.innerType;
});
function WN(e, t) {
	return new UN({
		type: "nonoptional",
		innerType: e,
		...H(t)
	});
}
var GN = /*@__PURE__*/ W("ZodCatch", (e, t) => {
	Hk.init(e, t), RM.init(e, t), e._zod.processJSONSchema = (t, n, r) => _M(e, t, n, r), e.unwrap = () => e._zod.def.innerType, e.removeCatch = e.unwrap;
});
function KN(e, t) {
	return new GN({
		type: "catch",
		innerType: e,
		catchValue: typeof t == "function" ? t : BE(t)
	});
}
var qN = /*@__PURE__*/ W("ZodPipe", (e, t) => {
	Uk.init(e, t), RM.init(e, t), e._zod.processJSONSchema = (t, n, r) => vM(e, t, n, r), e.in = t.in, e.out = t.out;
});
function JN(e, t) {
	return new qN({
		type: "pipe",
		in: e,
		out: t
	});
}
var YN = /*@__PURE__*/ W("ZodReadonly", (e, t) => {
	Gk.init(e, t), RM.init(e, t), e._zod.processJSONSchema = (t, n, r) => yM(e, t, n, r), e.unwrap = () => e._zod.def.innerType;
});
function XN(e) {
	return new YN({
		type: "readonly",
		innerType: e
	});
}
var ZN = /*@__PURE__*/ W("ZodCustom", (e, t) => {
	qk.init(e, t), RM.init(e, t), e._zod.processJSONSchema = (t, n, r) => iM(e, t, n, r);
});
function QN(e, t = {}) {
	return /* @__PURE__ */ vj(ZN, e, t);
}
function $N(e, t) {
	return /* @__PURE__ */ yj(e, t);
}
//#endregion
//#region src/core/security.ts
function eP() {
	if (typeof window < "u") {
		if (typeof MT.sanitize == "function") return MT;
		if (typeof MT == "function") return MT(window);
	}
	return { sanitize: (e, t) => e ? t?.ALLOWED_TAGS && t.ALLOWED_TAGS.length === 0 ? e.replace(/<[^>]*>/g, "").trim() : e.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "") : "" };
}
var tP = eP();
function nP(e) {
	return !e || typeof e != "string" ? "" : tP.sanitize(e, {
		ALLOWED_TAGS: [
			"b",
			"i",
			"em",
			"strong",
			"a",
			"span",
			"p",
			"br",
			"ul",
			"ol",
			"li",
			"code",
			"pre",
			"blockquote"
		],
		ALLOWED_ATTR: [
			"href",
			"target",
			"rel",
			"class",
			"style"
		],
		ALLOW_DATA_ATTR: !1
	});
}
function rP(e) {
	return !e || typeof e != "string" ? "" : tP.sanitize(e, { ALLOWED_TAGS: [] }).trim();
}
var iP = SN({
	id: K().min(1).max(128),
	name: K().min(1).max(60),
	username: K().min(2).max(40).regex(/^[a-zA-Z0-9_]+$/, { message: "اسم المستخدم يجب أن يحتوي على حروف إنجليزية وأرقام و _ فقط" }),
	email: K().email(),
	avatar: K().url().or(K().startsWith("/")),
	bio: K().max(500).default(""),
	role: ON([
		"Member",
		"Otaku",
		"Hero",
		"Moderator",
		"SeniorModerator",
		"SuperAdministrator",
		"Developer",
		"Owner"
	]).default("Member"),
	level: J().int().min(1).default(1),
	coins: J().int().min(0).default(100),
	stars: J().int().min(0).default(0),
	reputation: J().int().min(0).default(10),
	followers: J().int().min(0).default(0),
	following: J().int().min(0).default(0),
	joined: J().int().positive().default(() => Date.now()),
	verified: mN().default(!1)
}), aP = SN({
	text: K().min(1, "نص المنشور مطلوب").max(5e3, "الحد الأقصى للمنشور هو 5000 حرف"),
	authorId: K().min(1).max(128),
	authorName: K().min(1).max(60),
	authorAvatar: K().default(""),
	type: ON([
		"text",
		"image",
		"video",
		"poll",
		"quote"
	]).default("text"),
	mediaUrl: K().url().optional().or(AN("")),
	mediaType: K().optional(),
	tags: bN(K().max(30)).max(10).default([]),
	likesCount: J().int().min(0).default(0),
	commentsCount: J().int().min(0).default(0),
	views: J().int().min(0).default(0),
	createdAt: J().int().positive().default(() => Date.now())
}), oP = SN({
	senderId: K().min(1).max(128),
	senderName: K().min(1).max(60),
	senderAvatar: K().default(""),
	text: K().max(3e3, "الحد الأقصى للرسالة هو 3000 حرف").default(""),
	mediaUrl: K().url().optional().or(AN("")),
	mediaType: ON([
		"image",
		"video",
		"audio",
		"file",
		"none"
	]).default("none"),
	replyTo: SN({
		id: K(),
		senderName: K(),
		text: K().max(100)
	}).optional(),
	createdAt: J().int().positive().default(() => Date.now()),
	status: ON([
		"sent",
		"delivered",
		"read"
	]).default("sent")
});
SN({
	userId: K().min(1).max(128),
	userName: K().min(1).max(60),
	userAvatar: K().default(""),
	mediaUrl: K().url(),
	mediaType: ON(["image", "video"]),
	caption: K().max(280).default(""),
	duration: J().int().min(3).max(30).default(5),
	expiresAt: J().int().positive(),
	createdAt: J().int().positive().default(() => Date.now())
}), SN({
	targetId: K().min(1).max(128),
	targetType: ON([
		"post",
		"user",
		"comment",
		"message",
		"story",
		"community"
	]),
	reason: K().min(3).max(500),
	reporterId: K().min(1).max(128),
	createdAt: J().int().positive().default(() => Date.now()),
	status: ON([
		"pending",
		"reviewed",
		"dismissed",
		"action_taken"
	]).default("pending")
});
//#endregion
//#region node_modules/@sentry/core/build/esm/debug-build.js
var Y = typeof __SENTRY_DEBUG__ > "u" || __SENTRY_DEBUG__, X = globalThis, sP = "11.0.0";
//#endregion
//#region node_modules/@sentry/core/build/esm/carrier.js
function cP() {
	return lP(X), X;
}
function lP(e) {
	let t = e.__SENTRY__ = e.__SENTRY__ || {};
	return t.version = t.version || "11.0.0", t[sP] = t["11.0.0"] || {};
}
function uP(e, t, n = X) {
	let r = n.__SENTRY__ = n.__SENTRY__ || {}, i = r[sP] = r["11.0.0"] || {};
	return i[e] || (i[e] = t());
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/debug-logger.js
var dP = [
	"debug",
	"info",
	"warn",
	"error",
	"log",
	"assert",
	"trace"
], fP = "Sentry Logger ", pP = {};
function mP(e) {
	if (!("console" in X)) return e();
	let t = X.console, n = {}, r = Object.keys(pP);
	r.forEach((e) => {
		let r = pP[e];
		n[e] = t[e], t[e] = r;
	});
	try {
		return e();
	} finally {
		r.forEach((e) => {
			t[e] = n[e];
		});
	}
}
function hP() {
	SP().enabled = !0;
}
function gP() {
	SP().enabled = !1;
}
function _P() {
	return SP().enabled;
}
function vP(...e) {
	xP("log", ...e);
}
function yP(...e) {
	xP("warn", ...e);
}
function bP(...e) {
	xP("error", ...e);
}
function xP(e, ...t) {
	Y && _P() && mP(() => {
		X.console[e](`${fP}[${e}]:`, ...t);
	});
}
function SP() {
	return Y ? uP("loggerSettings", () => ({ enabled: !1 })) : { enabled: !1 };
}
var Z = {
	enable: hP,
	disable: gP,
	isEnabled: _P,
	log: vP,
	warn: yP,
	error: bP
}, CP = 50, wP = /\(error: (.*)\)/, TP = /captureMessage|captureException/;
function EP(...e) {
	let t = e.sort((e, t) => e[0] - t[0]).map((e) => e[1]);
	return (e, n = 0, r = 0) => {
		let i = [], a = e.split("\n");
		for (let e = n; e < a.length; e++) {
			let n = a[e];
			n.length > 1024 && (n = n.slice(0, 1024));
			let o = wP.test(n) ? n.replace(wP, "$1") : n;
			if (!o.includes("Error: ")) {
				for (let e of t) {
					let t = e(o);
					if (t) {
						i.push(t);
						break;
					}
				}
				if (i.length >= CP + r) break;
			}
		}
		return OP(i.slice(r));
	};
}
function DP(e) {
	return Array.isArray(e) ? EP(...e) : e;
}
function OP(e) {
	if (!e.length) return [];
	let t = Array.from(e);
	return /sentryWrapped/.test(kP(t).function || "") && t.pop(), t.reverse(), TP.test(kP(t).function || "") && (t.pop(), TP.test(kP(t).function || "") && t.pop()), t.slice(0, CP).map((e) => ({
		...e,
		filename: e.filename || kP(t).filename,
		function: e.function || "?"
	}));
}
function kP(e) {
	return e[e.length - 1] || {};
}
var AP = "<anonymous>";
function jP(e) {
	try {
		return !e || typeof e != "function" ? AP : e.name || AP;
	} catch {
		return AP;
	}
}
function MP(e) {
	let t = e.exception;
	if (t) {
		let e = [];
		try {
			return t.values.forEach((t) => {
				t.stacktrace.frames && e.push(...t.stacktrace.frames);
			}), e;
		} catch {
			return;
		}
	}
}
//#endregion
//#region node_modules/@sentry/core/build/esm/instrument/handlers.js
var NP = {}, PP = {};
function FP(e, t) {
	return NP[e] = NP[e] || [], NP[e].push(t), () => {
		let n = NP[e];
		if (n) {
			let e = n.indexOf(t);
			e !== -1 && n.splice(e, 1);
		}
	};
}
function IP(e, t) {
	if (!PP[e]) {
		PP[e] = !0;
		try {
			t();
		} catch (t) {
			Y && Z.error(`Error while instrumenting ${e}`, t);
		}
	}
}
function LP(e, t) {
	let n = e && NP[e];
	if (n) for (let r of n) try {
		r(t);
	} catch (t) {
		Y && Z.error(`Error while triggering instrumentation handler.
Type: ${e}
Name: ${jP(r)}
Error:`, t);
	}
}
//#endregion
//#region node_modules/@sentry/core/build/esm/instrument/globalError.js
var RP = null;
function zP(e) {
	let t = "error";
	FP(t, e), IP(t, BP);
}
function BP() {
	RP = X.onerror, X.onerror = function(e, t, n, r, i) {
		return LP("error", {
			column: r,
			error: i,
			line: n,
			msg: e,
			url: t
		}), RP ? RP.apply(this, arguments) : !1;
	}, X.onerror.__SENTRY_INSTRUMENTED__ = !0;
}
//#endregion
//#region node_modules/@sentry/core/build/esm/instrument/globalUnhandledRejection.js
var VP = null;
function HP(e) {
	let t = "unhandledrejection";
	FP(t, e), IP(t, UP);
}
function UP() {
	VP = X.onunhandledrejection, X.onunhandledrejection = function(e) {
		return LP("unhandledrejection", e), !VP || VP.apply(this, arguments);
	}, X.onunhandledrejection.__SENTRY_INSTRUMENTED__ = !0;
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/is.js
var WP = Object.prototype.toString;
function GP(e) {
	switch (WP.call(e)) {
		case "[object Error]":
		case "[object Exception]":
		case "[object DOMException]":
		case "[object WebAssembly.Exception]": return !0;
		default: return iF(e, Error);
	}
}
function KP(e, t) {
	return WP.call(e) === `[object ${t}]`;
}
function qP(e) {
	return KP(e, "ErrorEvent");
}
function JP(e) {
	return KP(e, "DOMError");
}
function YP(e) {
	return KP(e, "DOMException");
}
function XP(e) {
	return KP(e, "String");
}
function ZP(e) {
	return typeof e == "object" && !!e && "__sentry_template_string__" in e && "__sentry_template_values__" in e;
}
function QP(e) {
	return e === null || ZP(e) || typeof e != "object" && typeof e != "function";
}
function $P(e) {
	return KP(e, "Object");
}
function eF(e) {
	return typeof e == "object" && !!e;
}
function tF(e) {
	return typeof Event < "u" && iF(e, Event);
}
function nF(e) {
	return KP(e, "RegExp");
}
function rF(e) {
	return !!(e?.then && typeof e.then == "function");
}
function iF(e, t) {
	try {
		return e instanceof t;
	} catch {
		return !1;
	}
}
function aF(e) {
	return typeof Request < "u" && iF(e, Request);
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/object.js
function oF(e, t, n) {
	if (!(t in e)) return;
	let r = e[t];
	if (typeof r != "function") return;
	let i = n(r);
	typeof i == "function" && cF(i, r);
	try {
		e[t] = i;
	} catch {
		Y && Z.log(`Failed to replace method "${t}" in object`, e);
	}
}
function sF(e, t, n) {
	try {
		Object.defineProperty(e, t, {
			value: n,
			writable: !0,
			configurable: !0
		});
	} catch {
		Y && Z.log(`Failed to add non-enumerable property "${String(t)}" to object`, e);
	}
}
function cF(e, t) {
	try {
		e.prototype = t.prototype = t.prototype || {}, sF(e, "__sentry_original__", t);
	} catch {}
}
function lF(e) {
	return e.__sentry_original__;
}
function uF(e) {
	if (GP(e)) return {
		message: e.message,
		name: e.name,
		stack: e.stack,
		...dF(e)
	};
	if (tF(e)) {
		let { type: t, target: n, currentTarget: r, detail: i } = e;
		return {
			type: t,
			target: n,
			currentTarget: r,
			...i ? { detail: i } : {},
			...dF(e)
		};
	}
	return e;
}
function dF(e) {
	return eF(e) ? Object.fromEntries(Object.entries(e)) : {};
}
function fF(e) {
	let t = Object.keys(uF(e));
	return t.sort(), t[0] ? t.join(", ") : "[object has no keys]";
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/randomSafeContext.js
var pF;
function mF(e) {
	if (pF !== void 0) return pF ? pF(e) : e();
	let t = /* @__PURE__ */ Symbol.for("__SENTRY_SAFE_RANDOM_ID_WRAPPER__"), n = X;
	return t in n && typeof n[t] == "function" ? (pF = n[t], pF(e)) : (pF = null, e());
}
function hF() {
	return mF(() => Math.random());
}
function gF() {
	return mF(() => Date.now());
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/normalizationHints.js
var _F = /* @__PURE__ */ Symbol.for("sentry.skipNormalization"), vF = /* @__PURE__ */ Symbol.for("sentry.overrideNormalizationDepth");
function yF(e) {
	return !!e[_F];
}
function bF(e) {
	let t = e[vF];
	return typeof t == "number" ? t : void 0;
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/normalize.js
var xF;
function SF(e) {
	xF = e;
}
function CF(e, t = 100, n = Infinity) {
	try {
		return TF("", e, t, n);
	} catch (e) {
		return { ERROR: `**non-serializable** (${e})` };
	}
}
function wF(e, t = 3, n = 102400) {
	let r = CF(e, t);
	return kF(r) > n ? wF(e, t - 1, n) : r;
}
function TF(e, t, n = Infinity, r = Infinity, i = AF()) {
	let [a, o] = i;
	if (t == null || ["boolean", "string"].includes(typeof t) || typeof t == "number" && Number.isFinite(t)) return t;
	let s = EF(e, t);
	if (!s.startsWith("[object ")) return s;
	if (yF(t)) return t;
	let c = bF(t), l = c === void 0 ? n : c;
	if (l === 0) return s.replace("object ", "");
	if (a(t)) return "[Circular ~]";
	let u = t;
	if (u && typeof u.toJSON == "function") try {
		return TF("", u.toJSON(), l - 1, r, i);
	} catch {}
	let d = Array.isArray(t) ? [] : {}, f = 0, p = uF(t);
	for (let e in p) {
		if (!Object.prototype.hasOwnProperty.call(p, e)) continue;
		if (f >= r) {
			d[e] = "[MaxProperties ~]";
			break;
		}
		let t = p[e];
		d[e] = TF(e, t, l - 1, r, i), f++;
	}
	return o(t), d;
}
function EF(e, t) {
	try {
		if (xF) {
			let e = xF(t);
			if (e) return e;
		}
		return typeof global < "u" && t === global ? "[Global]" : typeof t == "number" && !Number.isFinite(t) ? `[${t}]` : typeof t == "function" ? `[Function: ${jP(t)}]` : typeof t == "symbol" ? `[${String(t)}]` : typeof t == "bigint" ? `[BigInt: ${String(t)}]` : `[object ${DF(t)}]`;
	} catch (e) {
		return `**non-serializable** (${e})`;
	}
}
function DF(e) {
	let t = Object.getPrototypeOf(e);
	return t?.constructor ? t.constructor.name : "null prototype";
}
function OF(e) {
	return ~-encodeURI(e).split(/%..|./).length;
}
function kF(e) {
	return OF(JSON.stringify(e));
}
function AF() {
	let e = /* @__PURE__ */ new WeakSet();
	function t(t) {
		return e.has(t) ? !0 : (e.add(t), !1);
	}
	function n(t) {
		e.delete(t);
	}
	return [t, n];
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/string.js
function jF(e, t = 0) {
	return typeof e != "string" || t === 0 || e.length <= t ? e : `${e.slice(0, t)}...`;
}
function MF(e, t) {
	if (!Array.isArray(e)) return "";
	let n = [];
	for (let t = 0; t < e.length; t++) {
		let r = e[t];
		QP(r) ? n.push(String(r)) : r instanceof Error ? n.push(r.message ? `${r.name}: ${r.message}` : r.name) : n.push(EF(void 0, r));
	}
	return n.join(t);
}
function NF(e, t, n = !1) {
	return XP(e) ? nF(t) ? t.test(e) : XP(t) ? n ? e === t : e.includes(t) : typeof t == "function" && t(e) : !1;
}
function PF(e, t = [], n = !1) {
	for (let r of t) if (NF(e, r, n)) return !0;
	return !1;
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/misc.js
function FF() {
	let e = X;
	return e.crypto || e.msCrypto;
}
var IF;
function LF() {
	return hF() * 16;
}
function RF(e = FF()) {
	try {
		if (e?.randomUUID) return mF(() => e.randomUUID()).replace(/-/g, "");
	} catch {}
	return IF ||= "10000000100040008000100000000000", IF.replace(/[018]/g, (e) => (e ^ (LF() & 15) >> e / 4).toString(16));
}
function zF(e) {
	return e.exception?.values?.[0];
}
function BF(e) {
	let { message: t, event_id: n } = e;
	if (t) return t;
	let r = zF(e);
	return r ? r.type && r.value ? `${r.type}: ${r.value}` : r.type || r.value || n || "<unknown>" : n || "<unknown>";
}
function VF(e, t, n) {
	let r = e.exception = e.exception || {}, i = r.values = r.values || [], a = i[0] = i[0] || {};
	a.value ||= t || "", a.type ||= n || "Error";
}
function HF(e, t) {
	let n = zF(e);
	n && WF(n, t);
}
function UF(e, t) {
	let n = e.exception?.values, r = n?.find((e) => e.mechanism?.exception_id === 0) ?? n?.[0];
	r && WF(r, t);
}
function WF(e, t) {
	let n = {
		type: "generic",
		handled: !0
	}, r = e.mechanism;
	e.mechanism = {
		...n,
		...r,
		...t
	}, t && "data" in t && (e.mechanism.data = {
		...r?.data,
		...t.data
	});
}
function GF(e) {
	if (KF(e)) return !0;
	try {
		sF(e, "__sentry_captured__", !0);
	} catch {}
	return !1;
}
function KF(e) {
	try {
		return e.__sentry_captured__;
	} catch {}
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/time.js
var qF = 1e3;
function JF() {
	return gF() / qF;
}
function YF() {
	let { performance: e } = X;
	if (!e?.now || !e.timeOrigin) return JF;
	let t = e.timeOrigin;
	return () => (t + mF(() => e.now())) / qF;
}
var XF;
function ZF() {
	return (XF ??= YF())();
}
//#endregion
//#region node_modules/@sentry/core/build/esm/session.js
function QF(e) {
	let t = ZF(), n = {
		sid: RF(),
		init: !0,
		timestamp: t,
		started: t,
		duration: 0,
		status: "ok",
		errors: 0,
		ignoreDuration: !1,
		toJSON: () => tI(n)
	};
	return e && $F(n, e), n;
}
function $F(e, t = {}) {
	if (t.user && (!e.ipAddress && t.user.ip_address && (e.ipAddress = t.user.ip_address), !e.did && !t.did && (e.did = t.user.id || t.user.email || t.user.username)), e.timestamp = t.timestamp || ZF(), t.abnormal_mechanism && (e.abnormal_mechanism = t.abnormal_mechanism), t.ignoreDuration && (e.ignoreDuration = t.ignoreDuration), t.sid && (e.sid = t.sid.length === 32 ? t.sid : RF()), t.init !== void 0 && (e.init = t.init), !e.did && t.did && (e.did = `${t.did}`), typeof t.started == "number" && (e.started = t.started), e.ignoreDuration) e.duration = void 0;
	else if (typeof t.duration == "number") e.duration = t.duration;
	else {
		let t = e.timestamp - e.started;
		e.duration = t >= 0 ? t : 0;
	}
	t.release && (e.release = t.release), t.environment && (e.environment = t.environment), !e.ipAddress && t.ipAddress && (e.ipAddress = t.ipAddress), !e.userAgent && t.userAgent && (e.userAgent = t.userAgent), typeof t.errors == "number" && (e.errors = t.errors), t.status && (e.status = t.status);
}
function eI(e, t) {
	let n = {};
	t ? n = { status: t } : e.status === "ok" && (n = { status: "exited" }), $F(e, n);
}
function tI(e) {
	return {
		sid: `${e.sid}`,
		init: e.init,
		started: (/* @__PURE__ */ new Date(e.started * 1e3)).toISOString(),
		timestamp: (/* @__PURE__ */ new Date(e.timestamp * 1e3)).toISOString(),
		status: e.status,
		errors: e.errors,
		did: typeof e.did == "number" || typeof e.did == "string" ? `${e.did}` : void 0,
		duration: e.duration,
		abnormal_mechanism: e.abnormal_mechanism,
		attrs: {
			release: e.release,
			environment: e.environment,
			ip_address: e.ipAddress,
			user_agent: e.userAgent
		}
	};
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/merge.js
function nI(e, t, n = 2) {
	if (!t || typeof t != "object" || n <= 0) return t;
	if (e && Object.keys(t).length === 0) return e;
	let r = { ...e };
	for (let e in t) Object.prototype.hasOwnProperty.call(t, e) && (r[e] = nI(r[e], t[e], n - 1));
	return r;
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/propagationContext.js
function rI() {
	return RF();
}
function iI() {
	return RF().substring(16);
}
//#endregion
//#region node_modules/@sentry/core/build/esm/scope.js
var aI = 100, oI = class e {
	constructor() {
		this._notifyingListeners = !1, this._scopeListeners = [], this._eventProcessors = [], this._breadcrumbs = [], this._attachments = [], this._user = {}, this._tags = {}, this._attributes = {}, this._extra = {}, this._contexts = {}, this._sdkProcessingMetadata = {}, sF(this, "refs", {}), this._propagationContext = {
			traceId: rI(),
			sampleRand: hF()
		};
	}
	clone() {
		let t = new e();
		return t._breadcrumbs = [...this._breadcrumbs], t._tags = { ...this._tags }, t._attributes = { ...this._attributes }, t._extra = { ...this._extra }, t._contexts = { ...this._contexts }, this._contexts.flags && (t._contexts.flags = { values: [...this._contexts.flags.values] }), t._user = this._user, t._level = this._level, t._session = this._session, t._transactionName = this._transactionName, t._fingerprint = this._fingerprint, t._eventProcessors = [...this._eventProcessors], t._attachments = [...this._attachments], t._sdkProcessingMetadata = { ...this._sdkProcessingMetadata }, t._propagationContext = { ...this._propagationContext }, t._client = this._client, t._lastEventId = this._lastEventId, t._conversationId = this._conversationId, t.refs = { ...this.refs }, t;
	}
	setClient(e) {
		this._client = e;
	}
	setLastEventId(e) {
		this._lastEventId = e;
	}
	getClient() {
		return this._client;
	}
	lastEventId() {
		return this._lastEventId;
	}
	addScopeListener(e) {
		this._scopeListeners.push(e);
	}
	addEventProcessor(e) {
		return this._eventProcessors.push(e), this;
	}
	setUser(e) {
		return this._user = e || {
			email: void 0,
			id: void 0,
			ip_address: void 0,
			username: void 0
		}, this._session && $F(this._session, { user: e }), this._notifyScopeListeners(), this;
	}
	getUser() {
		return this._user;
	}
	setConversationId(e) {
		return this._conversationId = e || void 0, this._notifyScopeListeners(), this;
	}
	setTags(e) {
		return this._tags = {
			...this._tags,
			...e
		}, this._notifyScopeListeners(), this;
	}
	setTag(e, t) {
		return this.setTags({ [e]: t });
	}
	setAttributes(e) {
		return this._attributes = {
			...this._attributes,
			...e
		}, this._notifyScopeListeners(), this;
	}
	setAttribute(e, t) {
		return this.setAttributes({ [e]: t });
	}
	removeAttribute(e) {
		return e in this._attributes && (delete this._attributes[e], this._notifyScopeListeners()), this;
	}
	setExtras(e) {
		return this._extra = {
			...this._extra,
			...e
		}, this._notifyScopeListeners(), this;
	}
	setExtra(e, t) {
		return this._extra = {
			...this._extra,
			[e]: t
		}, this._notifyScopeListeners(), this;
	}
	setFingerprint(e) {
		return this._fingerprint = e, this._notifyScopeListeners(), this;
	}
	setLevel(e) {
		return this._level = e, this._notifyScopeListeners(), this;
	}
	setTransactionName(e) {
		return this._transactionName = e, this._notifyScopeListeners(), this;
	}
	setContext(e, t) {
		return t === null ? delete this._contexts[e] : this._contexts[e] = t, this._notifyScopeListeners(), this;
	}
	setSession(e) {
		return e ? this._session = e : delete this._session, this._notifyScopeListeners(), this;
	}
	getSession() {
		return this._session;
	}
	update(t) {
		if (!t) return this;
		let n = typeof t == "function" ? t(this) : t, { tags: r, attributes: i, extra: a, user: o, contexts: s, level: c, fingerprint: l = [], propagationContext: u, conversationId: d } = (n instanceof e ? n.getScopeData() : $P(n) ? t : void 0) || {};
		return this._tags = {
			...this._tags,
			...r
		}, this._attributes = {
			...this._attributes,
			...i
		}, this._extra = {
			...this._extra,
			...a
		}, this._contexts = {
			...this._contexts,
			...s
		}, o && Object.keys(o).length && (this._user = o), c && (this._level = c), l.length && (this._fingerprint = l), u && (this._propagationContext = u), d && (this._conversationId = d), this;
	}
	addBreadcrumb(e, t) {
		let n = typeof t == "number" ? t : aI;
		if (n <= 0) return this;
		let r = {
			timestamp: JF(),
			...e,
			message: e.message ? jF(e.message, 2048) : e.message
		};
		return this._breadcrumbs.push(r), this._breadcrumbs.length > n && (this._breadcrumbs = this._breadcrumbs.slice(-n)), this._notifyScopeListeners(), this;
	}
	getLastBreadcrumb() {
		return this._breadcrumbs[this._breadcrumbs.length - 1];
	}
	clearBreadcrumbs() {
		return this._breadcrumbs = [], this._notifyScopeListeners(), this;
	}
	addAttachment(e) {
		return this._attachments.push(e), this;
	}
	clearAttachments() {
		return this._attachments = [], this;
	}
	getScopeData() {
		return {
			breadcrumbs: this._breadcrumbs,
			attachments: this._attachments,
			contexts: this._contexts,
			tags: this._tags,
			attributes: this._attributes,
			extra: this._extra,
			user: this._user,
			level: this._level,
			fingerprint: this._fingerprint || [],
			eventProcessors: this._eventProcessors,
			propagationContext: this._propagationContext,
			sdkProcessingMetadata: this._sdkProcessingMetadata,
			transactionName: this._transactionName,
			conversationId: this._conversationId
		};
	}
	setSDKProcessingMetadata(e) {
		return this._sdkProcessingMetadata = nI(this._sdkProcessingMetadata, e, 2), this;
	}
	setPropagationContext(e) {
		return this._propagationContext = e, this;
	}
	getPropagationContext() {
		return this._propagationContext;
	}
	captureException(e, t) {
		let n = t?.event_id || RF();
		if (!this._client) return Y && Z.warn("No client configured on scope - will not capture exception!"), n;
		let r = /* @__PURE__ */ Error("Sentry syntheticException");
		return this._client.captureException(e, {
			originalException: e,
			syntheticException: r,
			...t,
			event_id: n
		}, this), n;
	}
	captureMessage(e, t, n) {
		let r = n?.event_id || RF();
		if (!this._client) return Y && Z.warn("No client configured on scope - will not capture message!"), r;
		let i = n?.syntheticException ?? Error(e);
		return this._client.captureMessage(e, t, {
			originalException: e,
			syntheticException: i,
			...n,
			event_id: r
		}, this), r;
	}
	captureEvent(e, t) {
		let n = e.event_id || t?.event_id || RF();
		return this._client ? (this._client.captureEvent(e, {
			...t,
			event_id: n
		}, this), n) : (Y && Z.warn("No client configured on scope - will not capture event!"), n);
	}
	_notifyScopeListeners() {
		this._notifyingListeners ||= (this._notifyingListeners = !0, this._scopeListeners.forEach((e) => {
			e(this);
		}), !1);
	}
};
//#endregion
//#region node_modules/@sentry/core/build/esm/defaultScopes.js
function sI() {
	return uP("defaultCurrentScope", () => new oI());
}
function cI() {
	return uP("defaultIsolationScope", () => new oI());
}
//#endregion
//#region node_modules/@sentry/core/build/esm/tracing/constants.js
var lI = "__SENTRY_SUPPRESS_TRACING__", uI = (e) => e instanceof Promise && !e[dI], dI = /* @__PURE__ */ Symbol("chained PromiseLike"), fI = (e, t, n) => {
	let r = e.then((e) => (t(e), e), (e) => {
		throw n(e), e;
	});
	return uI(r) && uI(e) ? r : pI(e, r);
}, pI = (e, t) => {
	if (!t) return e;
	let n = !1;
	for (let r in e) {
		if (r in t) continue;
		n = !0;
		let i = e[r];
		typeof i == "function" ? Object.defineProperty(t, r, {
			value: (...t) => i.apply(e, t),
			enumerable: !0,
			configurable: !0,
			writable: !0
		}) : t[r] = i;
	}
	return n && Object.assign(t, { [dI]: !0 }), t;
}, mI = class {
	constructor(e, t) {
		let n;
		n = e || new oI();
		let r;
		r = t || new oI(), this._stack = [{ scope: n }], this._isolationScope = r;
	}
	withScope(e) {
		let t = this._pushScope(), n;
		try {
			n = e(t);
		} catch (e) {
			throw this._popScope(), e;
		}
		return rF(n) ? fI(n, () => this._popScope(), () => this._popScope()) : (this._popScope(), n);
	}
	getClient() {
		return this.getStackTop().client;
	}
	getScope() {
		return this.getStackTop().scope;
	}
	getIsolationScope() {
		return this._isolationScope;
	}
	getStackTop() {
		return this._stack[this._stack.length - 1];
	}
	_pushScope() {
		let e = this.getScope().clone();
		return this._stack.push({
			client: this.getClient(),
			scope: e
		}), e;
	}
	_popScope() {
		return this._stack.length <= 1 ? !1 : !!this._stack.pop();
	}
};
function hI() {
	let e = lP(cP());
	return e.stack = e.stack || new mI(sI(), cI());
}
function gI(e) {
	return hI().withScope(e);
}
function _I(e, t) {
	let n = hI();
	return n.withScope(() => (n.getStackTop().scope = e, t(e)));
}
function vI(e) {
	return hI().withScope(() => e(hI().getIsolationScope()));
}
function yI() {
	return {
		suppressTracing: bI,
		withIsolationScope: vI,
		withScope: gI,
		withSetScope: _I,
		withSetIsolationScope: (e, t) => vI(t),
		getCurrentScope: () => hI().getScope(),
		getIsolationScope: () => hI().getIsolationScope()
	};
}
function bI(e) {
	return gI((t) => {
		t.setSDKProcessingMetadata({ [lI]: !0 });
		let n = e();
		return t.setSDKProcessingMetadata({ [lI]: void 0 }), n;
	});
}
//#endregion
//#region node_modules/@sentry/core/build/esm/asyncContext/index.js
function xI(e) {
	let t = lP(e);
	return t.acs ? t.acs : yI();
}
//#endregion
//#region node_modules/@sentry/core/build/esm/attributes.js
function SI(e) {
	return typeof e == "object" && !!e && !Array.isArray(e) && Object.keys(e).includes("value");
}
function CI(e, t) {
	let { value: n, unit: r } = SI(e) ? e : {
		value: e,
		unit: void 0
	}, i = TI(n), a = r && typeof r == "string" ? { unit: r } : {};
	if (i) return {
		...i,
		...a
	};
	if (!t || t === "skip-undefined" && n === void 0) return;
	let o = "";
	try {
		o = JSON.stringify(n) ?? "";
	} catch {}
	return {
		value: o,
		type: "string",
		...a
	};
}
function wI(e, t = !1) {
	let n = {};
	for (let [r, i] of Object.entries(e ?? {})) {
		let e = CI(i, t);
		e && (n[r] = e);
	}
	return n;
}
function TI(e) {
	if (Array.isArray(e)) return {
		value: e,
		type: "array"
	};
	let t = typeof e == "string" ? "string" : typeof e == "boolean" ? "boolean" : typeof e == "number" && !Number.isNaN(e) ? Number.isInteger(e) ? "integer" : "double" : null;
	if (t) return {
		value: e,
		type: t
	};
}
//#endregion
//#region node_modules/@sentry/core/build/esm/currentScopes.js
function EI() {
	return lP(cP()).externalPropagationContextProvider?.();
}
function DI() {
	return xI(cP()).getCurrentScope();
}
function OI() {
	return xI(cP()).getIsolationScope();
}
function kI() {
	return uP("globalScope", () => new oI());
}
function AI(...e) {
	let t = xI(cP());
	if (e.length === 2) {
		let [n, r] = e;
		return n ? t.withSetScope(n, r) : t.withScope(r);
	}
	return t.withScope(e[0]);
}
function jI() {
	return DI().getClient();
}
function MI(e) {
	let t = EI();
	if (t) return {
		trace_id: t.traceId,
		span_id: t.spanId
	};
	let { traceId: n, parentSpanId: r, propagationSpanId: i } = e.getPropagationContext(), a = {
		trace_id: n,
		span_id: i || iI()
	};
	return r && (a.parent_span_id = r), a;
}
var NI = "sentry.segment.name.source", PI = "user_agent.original", FI = "sentry.op", II = "sentry.origin", LI = "sentry.profile_id", RI = "sentry.exclusive_time", zI = "gen_ai.conversation.id", BI = [
	"ok",
	"deadline_exceeded",
	"unauthenticated",
	"permission_denied",
	"not_found",
	"resource_exhausted",
	"invalid_argument",
	"unimplemented",
	"unavailable",
	"internal_error",
	"unknown_error",
	"cancelled",
	"already_exists",
	"failed_precondition",
	"aborted",
	"out_of_range",
	"data_loss"
];
//#endregion
//#region node_modules/@sentry/core/build/esm/tracing/spanstatus.js
function VI(e) {
	return e !== "ok" && BI.includes(e);
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/weakRef.js
function HI(e) {
	if (e) {
		if (typeof e == "object" && "deref" in e && typeof e.deref == "function") try {
			return e.deref();
		} catch {
			return;
		}
		return e;
	}
}
//#endregion
//#region node_modules/@sentry/core/build/esm/tracing/utils.js
var UI = "_sentryScope", WI = "_sentryIsolationScope";
function GI(e) {
	let t = e;
	return {
		scope: t[UI],
		isolationScope: HI(t[WI])
	};
}
function KI(e) {
	let t = qI(e);
	if (!t) return;
	let n = Object.entries(t).reduce((e, [t, n]) => {
		if (t.startsWith("sentry-")) {
			let r = t.slice(7);
			e[r] = n;
		}
		return e;
	}, {});
	if (Object.keys(n).length > 0) return n;
}
function qI(e) {
	if (e && (XP(e) || Array.isArray(e))) return Array.isArray(e) ? e.reduce((e, t) => {
		let n = JI(t);
		return Object.entries(n).forEach(([t, n]) => {
			e[t] = n;
		}), e;
	}, {}) : JI(e);
}
function JI(e) {
	return e.split(",").map((e) => {
		let t = e.indexOf("=");
		return t === -1 ? [] : [e.slice(0, t), e.slice(t + 1)].map((e) => {
			try {
				return decodeURIComponent(e.trim());
			} catch {
				return;
			}
		});
	}).reduce((e, [t, n]) => (t && n && (e[t] = n), e), {});
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/dsn.js
var YI = /^o(\d+)\./, XI = /^(?:(\w+):)\/\/(?:(\w+)(?::(\w+)?)?@)((?:\[[:.%\w]+\]|[\w.-]+))(?::(\d+))?\/(.+)/;
function ZI(e) {
	return e === "http" || e === "https";
}
function QI(e, t = !1) {
	let { host: n, path: r, pass: i, port: a, projectId: o, protocol: s, publicKey: c } = e;
	return `${s}://${c}${t && i ? `:${i}` : ""}@${n}${a ? `:${a}` : ""}/${r && `${r}/`}${o}`;
}
function $I(e) {
	let t = XI.exec(e);
	if (!t) {
		mP(() => {
			console.error(`Invalid Sentry Dsn: ${e}`);
		});
		return;
	}
	let [n, r, i = "", a = "", o = "", s = ""] = t.slice(1), c = "", l = s, u = l.split("/");
	if (u.length > 1 && (c = u.slice(0, -1).join("/"), l = u.pop()), l) {
		let e = l.match(/^\d+/);
		e && (l = e[0]);
	}
	return eL({
		host: a,
		pass: i,
		path: c,
		projectId: l,
		port: o,
		protocol: n,
		publicKey: r
	});
}
function eL(e) {
	return {
		protocol: e.protocol,
		publicKey: e.publicKey || "",
		pass: e.pass || "",
		host: e.host,
		port: e.port || "",
		path: e.path || "",
		projectId: e.projectId
	};
}
function tL(e) {
	if (!Y) return !0;
	let { port: t, projectId: n, protocol: r } = e;
	return [
		"protocol",
		"publicKey",
		"host",
		"projectId"
	].find((t) => !e[t] && (Z.error(`Invalid Sentry Dsn: ${t} missing`), !0)) ? !1 : n.match(/^\d+$/) ? ZI(r) ? t && isNaN(parseInt(t, 10)) ? (Z.error(`Invalid Sentry Dsn: Invalid port ${t}`), !1) : !0 : (Z.error(`Invalid Sentry Dsn: Invalid protocol ${r}`), !1) : (Z.error(`Invalid Sentry Dsn: Invalid projectId ${n}`), !1);
}
function nL(e) {
	return e.match(YI)?.[1];
}
function rL(e) {
	let t = e.getOptions(), { host: n } = e.getDsn() || {}, r;
	return t.orgId ? r = String(t.orgId) : n && (r = nL(n)), r;
}
function iL(e) {
	let t = typeof e == "string" ? $I(e) : eL(e);
	if (t && tL(t)) return t;
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/parseSampleRate.js
function aL(e) {
	if (typeof e == "boolean") return Number(e);
	let t = typeof e == "string" ? parseFloat(e) : e;
	if (!(typeof t != "number" || isNaN(t) || t < 0 || t > 1)) return t;
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/spanOnScope.js
var oL = "span";
function sL(e) {
	return HI(e.refs[oL]);
}
function cL(e) {
	let { spanId: t, traceId: n, isRemote: r } = e.spanContext(), i = r ? t : fL(e).parent_span_id, a = GI(e).scope;
	return {
		parent_span_id: i,
		span_id: r ? a?.getPropagationContext().propagationSpanId || iI() : t,
		trace_id: n
	};
}
function lL(e) {
	if (e && e.length > 0) return e.map(({ context: { spanId: e, traceId: t, traceFlags: n, ...r }, attributes: i }) => ({
		span_id: e,
		trace_id: t,
		sampled: n === 1,
		attributes: i,
		...r
	}));
}
function uL(e) {
	return typeof e == "number" ? dL(e) : Array.isArray(e) ? e[0] + e[1] / 1e9 : e instanceof Date ? dL(e.getTime()) : ZF();
}
function dL(e) {
	return e > 9999999999 ? e / 1e3 : e;
}
function fL(e) {
	if (gL(e)) return e.getStaticSpanJSON();
	let { spanId: t, traceId: n } = e.spanContext();
	if (hL(e)) {
		let { attributes: r, startTime: i, name: a, endTime: o, status: s, links: c } = e;
		return {
			span_id: t,
			trace_id: n,
			data: r,
			description: a,
			parent_span_id: pL(e),
			start_timestamp: uL(i),
			timestamp: uL(o) || void 0,
			status: vL(s),
			op: r[FI],
			origin: r[II],
			links: lL(c)
		};
	}
	return {
		span_id: t,
		trace_id: n,
		start_timestamp: 0,
		status: "ok",
		data: {}
	};
}
function pL(e) {
	return "parentSpanId" in e ? e.parentSpanId : "parentSpanContext" in e ? e.parentSpanContext?.spanId : void 0;
}
function mL(e) {
	return {
		...e,
		end_timestamp: e.end_timestamp ?? e.start_timestamp,
		attributes: wI(e.attributes),
		links: e.links?.map((e) => ({
			...e,
			attributes: wI(e.attributes)
		}))
	};
}
function hL(e) {
	let t = e;
	return !!t.attributes && !!t.startTime && !!t.name && !!t.endTime && !!t.status;
}
function gL(e) {
	return typeof e.getSpanJSON == "function";
}
function _L(e) {
	let { traceFlags: t } = e.spanContext();
	return t === 1;
}
function vL(e) {
	return !e || e.code === 0 || e.code === 1 ? "ok" : e.message && VI(e.message) ? e.message : "internal_error";
}
var yL = "_sentryRootSpan", bL = xL;
function xL(e) {
	return e[yL] || e;
}
function SL(e) {
	let t = xI(cP());
	return t.getActiveSpan ? t.getActiveSpan(e) : sL(e || DI());
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/hasSpansEnabled.js
function CL(e) {
	if (typeof __SENTRY_TRACING__ == "boolean" && !__SENTRY_TRACING__) return !1;
	let t = e || jI()?.getOptions();
	return !!t && (t.tracesSampleRate != null || !!t.tracesSampler);
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/should-ignore-span.js
function wL(e) {
	Z.log(`Ignoring span ${e.op} - ${e.description} because it matches \`ignoreSpans\`.`);
}
function TL(e, t) {
	if (!t?.length) return !1;
	for (let n of t) {
		if (OL(n)) {
			if (e.description && NF(e.description, n)) return Y && wL(e), !0;
			continue;
		}
		let t = !!n.attributes && Object.keys(n.attributes).length > 0;
		if (!n.name && !n.op && !t) continue;
		let r = !n.name || e.description && NF(e.description, n.name), i = !n.op || e.op && NF(e.op, n.op), a = !n.attributes || Object.entries(n.attributes).every(([t, n]) => EL(e.attributes?.[t], n));
		if (r && i && a) return Y && wL(e), !0;
	}
	return !1;
}
function EL(e, t) {
	return typeof e == "string" && (typeof t == "string" || t instanceof RegExp) ? NF(e, t) : Array.isArray(e) && Array.isArray(t) ? e.length === t.length && e.every((e, n) => e === t[n]) : e === t;
}
function DL(e, t) {
	let n = t.parent_span_id, r = t.span_id;
	if (n) for (let t of e) t.parent_span_id === r && (t.parent_span_id = n);
}
function OL(e) {
	return typeof e == "string" || e instanceof RegExp;
}
//#endregion
//#region node_modules/@sentry/core/build/esm/integration.js
var kL = [];
function AL(e) {
	let t = {};
	return e.forEach((e) => {
		let { name: n } = e, r = t[n];
		r && !r.isDefaultInstance && e.isDefaultInstance || (t[n] = e);
	}), Object.values(t);
}
function jL(e) {
	let t = e.defaultIntegrations || [], n = e.integrations;
	t.forEach((e) => {
		e.isDefaultInstance = !0;
	});
	let r;
	if (Array.isArray(n)) r = [...t, ...n];
	else if (typeof n == "function") {
		let e = n(t);
		r = Array.isArray(e) ? e : [e];
	} else r = t;
	return AL(r);
}
function ML(e, t) {
	let n = {};
	return t.forEach((t) => {
		t?.beforeSetup && t.beforeSetup(e);
	}), t.forEach((t) => {
		t && PL(e, t, n);
	}), n;
}
function NL(e, t) {
	for (let n of t) n?.afterAllSetup && n.afterAllSetup(e);
}
function PL(e, t, n) {
	if (n[t.name]) {
		Y && Z.log(`Integration skipped because it was already installed: ${t.name}`);
		return;
	}
	if (n[t.name] = t, !kL.includes(t.name) && typeof t.setupOnce == "function" && (t.setupOnce(), kL.push(t.name)), t.setup && typeof t.setup == "function" && t.setup(e), typeof t.preprocessEvent == "function") {
		let n = t.preprocessEvent.bind(t);
		e.on("preprocessEvent", (t, r) => n(t, r, e));
	}
	if (typeof t.processEvent == "function") {
		let n = t.processEvent.bind(t), r = Object.assign((t, r) => n(t, r, e), { id: t.name });
		e.addEventProcessor(r);
	}
	["processSpan", "processSegmentSpan"].forEach((n) => {
		let r = t[n];
		typeof r == "function" && e.on(n, (n) => r.call(t, n, e));
	}), Y && Z.log(`Integration installed: ${t.name}`);
}
function FL(e) {
	return e;
}
//#endregion
//#region node_modules/@sentry/core/build/esm/constants.js
var IL = "production", LL = /* @__PURE__ */ Symbol.for("sentry.nonRecordingSpan");
function RL(e) {
	return !!e && e[LL] === !0;
}
//#endregion
//#region node_modules/@sentry/core/build/esm/tracing/dynamicSamplingContext.js
var zL = "_frozenDsc";
function BL(e, t) {
	let n = t.getOptions(), { publicKey: r } = t.getDsn() || {}, i = {
		environment: n.environment || "production",
		release: n.release,
		public_key: r,
		trace_id: e,
		org_id: rL(t)
	};
	return t.emit("createDsc", i), i;
}
function VL(e, t) {
	if (EI()) return;
	let n = t.getPropagationContext();
	return n.dsc || BL(n.traceId, e);
}
function HL(e) {
	let t = jI();
	if (!t) return {};
	let n = bL(e), r = fL(n), i = r.data, a = n.spanContext().traceState, o = a?.get("sentry.sample_rate") ?? i["sentry.sample_rate"] ?? i["sentry.previous_trace_sample_rate"];
	function s(e) {
		return (typeof o == "number" || typeof o == "string") && (e.sample_rate = `${o}`), e;
	}
	let c = n[zL];
	if (c) return s(c);
	let l = RL(n), u = l && n.dropReason === "ignored";
	if (l && (!CL(t.getOptions()) || u)) {
		let e = GI(n).scope, r = e && VL(t, e);
		if (r) {
			let e = { ...r };
			return u && (e.sampled = "false"), s(e);
		}
	}
	let d = a?.get("sentry.dsc"), f = d && KI(d);
	if (f) return s(f);
	let p = BL(e.spanContext().traceId, t), m = i[NI], ee = r.description;
	return m !== "url" && ee && (p.transaction = ee), CL() && (p.sampled = String(_L(n)), p.sample_rand = a?.get("sentry.sample_rand") ?? GI(n).scope?.getPropagationContext().sampleRand.toString()), s(p), t.emit("createDsc", p, n), p;
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/scopeData.js
function UL(e, t) {
	let { fingerprint: n, breadcrumbs: r, sdkProcessingMetadata: i } = t;
	qL(e, t), ZL(e, n), JL(e, r), YL(e, i);
}
function WL(e, t) {
	let { extra: n, tags: r, attributes: i, user: a, contexts: o, level: s, sdkProcessingMetadata: c, breadcrumbs: l, fingerprint: u, eventProcessors: d, attachments: f, propagationContext: p, transactionName: m } = t;
	GL(e, "extra", n), GL(e, "tags", r), GL(e, "attributes", i), GL(e, "user", a), GL(e, "contexts", o), e.sdkProcessingMetadata = nI(e.sdkProcessingMetadata, c, 2), s && (e.level = s), m && (e.transactionName = m), l.length && (e.breadcrumbs = [...e.breadcrumbs, ...l]), u.length && (e.fingerprint = [...e.fingerprint, ...u]), d.length && (e.eventProcessors = [...e.eventProcessors, ...d]), f.length && (e.attachments = [...e.attachments, ...f]), e.propagationContext = {
		...e.propagationContext,
		...p
	};
}
function GL(e, t, n) {
	e[t] = nI(e[t], n, 1);
}
function KL(e, t) {
	let n = kI().getScopeData();
	return e && WL(n, e.getScopeData()), t && WL(n, t.getScopeData()), n;
}
function qL(e, t) {
	let { extra: n, tags: r, user: i, contexts: a, level: o, transactionName: s } = t;
	Object.keys(n).length && (e.extra = {
		...n,
		...e.extra
	}), Object.keys(r).length && (e.tags = {
		...r,
		...e.tags
	}), Object.keys(i).length && (e.user = {
		...i,
		...e.user
	}), Object.keys(a).length && (e.contexts = {
		...a,
		...e.contexts
	}), o && (e.level = o), s && e.type !== "transaction" && (e.transaction = s);
}
function JL(e, t) {
	let n = [...e.breadcrumbs || [], ...t];
	e.breadcrumbs = n.length ? n : void 0;
}
function YL(e, t) {
	e.sdkProcessingMetadata = {
		...e.sdkProcessingMetadata,
		...t
	};
}
function XL(e, t) {
	e.contexts = {
		trace: cL(t),
		...e.contexts
	}, e.sdkProcessingMetadata = {
		dynamicSamplingContext: HL(t),
		...e.sdkProcessingMetadata
	};
	let n = fL(bL(t)).description;
	n && !e.transaction && e.type === "transaction" && (e.transaction = n);
}
function ZL(e, t) {
	e.fingerprint = e.fingerprint ? Array.isArray(e.fingerprint) ? e.fingerprint : [e.fingerprint] : [], t && (e.fingerprint = e.fingerprint.concat(t)), e.fingerprint.length || delete e.fingerprint;
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/safeCallback.js
function QL(e, t, n) {
	let r;
	try {
		r = t();
	} catch (t) {
		return $L(e, t, n);
	}
	return rF(r) ? r.then(void 0, (t) => $L(e, t, n)) : r;
}
function $L(e, t, n) {
	return Y && Z.error(e, t), n(t);
}
//#endregion
//#region node_modules/@sentry/core/build/esm/tracing/spans/beforeSendSpan.js
function eR(e) {
	return !!e && typeof e == "function" && "_static" in e && !!e._static;
}
var tR = !1;
function nR(e, t) {
	return QL(Y ? "The `beforeSendSpan` callback threw an error, sending the span unmodified:" : "", () => t(e), () => e) || (tR ||= (mP(() => {
		console.warn("[Sentry] Returning null from `beforeSendSpan` is disallowed. To drop certain spans, configure the respective integrations directly or use `ignoreSpans`.");
	}), !0), e);
}
//#endregion
//#region node_modules/@sentry/core/build/esm/tracing/spans/spanJsonToStreamedSpan.js
function rR(e) {
	return mL({
		trace_id: e.trace_id,
		span_id: e.span_id,
		parent_span_id: e.parent_span_id,
		name: e.description || "",
		start_timestamp: e.start_timestamp,
		end_timestamp: e.timestamp,
		status: !e.status || e.status === "ok" || e.status === "cancelled" ? "ok" : "error",
		is_segment: !1,
		attributes: { ...e.data },
		links: e.links
	});
}
//#endregion
//#region node_modules/@sentry/core/build/esm/tracing/spans/captureSpan.js
function iR(e, t) {
	let n = e.attributes ??= {};
	Object.entries(t).forEach(([e, t]) => {
		t != null && !(e in n) && (n[e] = t);
	});
}
//#endregion
//#region node_modules/@sentry/core/build/esm/tracing/spans/hasSpanStreamingEnabled.js
function aR(e) {
	return e.getOptions().traceLifecycle === "stream";
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/timer.js
function oR(e) {
	return typeof e == "object" && typeof e.unref == "function" && e.unref(), e;
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/envelope.js
function sR(e, t = []) {
	return [e, t];
}
function cR(e, t) {
	let [n, r] = e;
	return [n, [...r, t]];
}
function lR(e, t) {
	let n = e[1];
	for (let e of n) {
		let n = e[0].type;
		if (t(e, n)) return !0;
	}
	return !1;
}
function uR(e, t) {
	return lR(e, (e, n) => t.includes(n));
}
function dR(e) {
	let t = lP(X);
	return t.encodePolyfill ? t.encodePolyfill(e) : new TextEncoder().encode(e);
}
function fR(e) {
	let [t, n] = e, r = JSON.stringify(t);
	function i(e) {
		typeof r == "string" ? r = typeof e == "string" ? r + e : [dR(r), e] : r.push(typeof e == "string" ? dR(e) : e);
	}
	for (let e of n) {
		let [t, n] = e;
		if (i(`
${JSON.stringify(t)}
`), typeof n == "string" || n instanceof Uint8Array) i(n);
		else {
			let e;
			try {
				e = JSON.stringify(n);
			} catch {
				e = JSON.stringify(CF(n));
			}
			i(e);
		}
	}
	return typeof r == "string" ? r : pR(r);
}
function pR(e) {
	let t = e.reduce((e, t) => e + t.length, 0), n = new Uint8Array(t), r = 0;
	for (let t of e) n.set(t, r), r += t.length;
	return n;
}
function mR(e) {
	let t = typeof e.data == "string" ? dR(e.data) : e.data;
	return [{
		type: "attachment",
		length: t.length,
		filename: e.filename,
		content_type: e.contentType,
		attachment_type: e.attachmentType
	}, t];
}
var hR = {
	sessions: "session",
	event: "error",
	client_report: "internal",
	user_report: "default",
	profile_chunk: "profile",
	replay_event: "replay",
	replay_recording: "replay",
	check_in: "monitor",
	raw_security: "security",
	log: "log_item",
	trace_metric: "metric"
};
function gR(e) {
	return e in hR;
}
function _R(e) {
	return gR(e) ? hR[e] : e;
}
function vR(e) {
	if (!e?.sdk) return;
	let { name: t, version: n } = e.sdk;
	return {
		name: t,
		version: n
	};
}
function yR(e, t, n, r) {
	let i = e.sdkProcessingMetadata?.dynamicSamplingContext;
	return {
		event_id: e.event_id,
		sent_at: new Date(gF()).toISOString(),
		...t && { sdk: t },
		...!!n && r && { dsn: QI(r) },
		...i && { trace: i }
	};
}
function bR(e) {
	return e === "replay_event" ? "replay" : e || "error";
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/env.js
function xR() {
	return typeof __SENTRY_BROWSER_BUNDLE__ < "u" && !!__SENTRY_BROWSER_BUNDLE__;
}
function SR() {
	return "npm";
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/node.js
function CR() {
	return !xR() && Object.prototype.toString.call(typeof process < "u" ? process : 0) === "[object process]";
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/isBrowser.js
function wR() {
	return typeof window < "u" && (!CR() || TR());
}
function TR() {
	return X.process?.type === "renderer";
}
//#endregion
//#region node_modules/@sentry/core/build/esm/tracing/spans/envelope.js
function ER(e, t) {
	let n = t.getDataCollectionOptions().userInfo ? "auto" : "never";
	return [{
		type: "span",
		item_count: e.length,
		content_type: "application/vnd.sentry.items.span.v2+json"
	}, {
		version: 2,
		ingest_settings: wR() ? {
			infer_ip: n,
			infer_user_agent: n
		} : void 0,
		items: e
	}];
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/errorSpanAttribution.js
var DR = /* @__PURE__ */ new WeakMap();
function OR(e) {
	return QP(e) ? void 0 : e;
}
function kR(e, t, n) {
	let r = OR(t.originalException), i = r && DR.get(r);
	if (!i) return;
	let a = e.contexts?.trace;
	(a?.trace_id ?? (n && MI(n).trace_id)) === i.trace_id && (e.contexts = {
		...e.contexts,
		trace: {
			...a,
			...i
		}
	});
}
//#endregion
//#region node_modules/@sentry/core/build/esm/envelope.js
function AR(e, t) {
	if (!t) return e;
	let n = e.sdk || {};
	return e.sdk = {
		...n,
		name: n.name || t.name,
		version: n.version || t.version,
		integrations: [...e.sdk?.integrations || [], ...t.integrations || []],
		packages: [...e.sdk?.packages || [], ...t.packages || []],
		settings: e.sdk?.settings || t.settings ? {
			...e.sdk?.settings,
			...t.settings
		} : void 0
	}, e;
}
function jR(e, t, n, r) {
	let i = vR(n);
	return sR({
		sent_at: new Date(gF()).toISOString(),
		...i && { sdk: i },
		...!!r && t && { dsn: QI(t) }
	}, ["aggregates" in e ? [{ type: "sessions" }, e] : [{ type: "session" }, e.toJSON()]]);
}
function MR(e, t, n, r) {
	let i = vR(n), a = e.type && e.type !== "replay_event" ? e.type : "event";
	AR(e, n?.sdk);
	let o = yR(e, i, r, t);
	return delete e.sdkProcessingMetadata, sR(o, [[{ type: a }, e]]);
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/syncpromise.js
var NR = 0, PR = 1, FR = 2;
function IR(e) {
	return new RR((t) => {
		t(e);
	});
}
function LR(e) {
	return new RR((t, n) => {
		n(e);
	});
}
var RR = class e {
	constructor(e) {
		this._state = NR, this._handlers = [], this._runExecutor(e);
	}
	then(t, n) {
		return new e((e, r) => {
			this._handlers.push([
				!1,
				(n) => {
					if (!t) e(n);
					else try {
						e(t(n));
					} catch (e) {
						r(e);
					}
				},
				(t) => {
					if (!n) r(t);
					else try {
						e(n(t));
					} catch (e) {
						r(e);
					}
				}
			]), this._executeHandlers();
		});
	}
	catch(e) {
		return this.then((e) => e, e);
	}
	finally(t) {
		return new e((e, n) => {
			let r, i;
			return this.then((e) => {
				i = !1, r = e, t && t();
			}, (e) => {
				i = !0, r = e, t && t();
			}).then(() => {
				if (i) {
					n(r);
					return;
				}
				e(r);
			});
		});
	}
	_executeHandlers() {
		if (this._state === NR) return;
		let e = this._handlers.slice();
		this._handlers = [], e.forEach((e) => {
			e[0] ||= (this._state === PR && e[1](this._value), this._state === FR && e[2](this._value), !0);
		});
	}
	_runExecutor(e) {
		let t = (e, t) => {
			if (this._state === NR) {
				if (rF(t)) {
					t.then(n, r);
					return;
				}
				this._state = e, this._value = t, this._executeHandlers();
			}
		}, n = (e) => {
			t(PR, e);
		}, r = (e) => {
			t(FR, e);
		};
		try {
			e(n, r);
		} catch (e) {
			r(e);
		}
	}
};
//#endregion
//#region node_modules/@sentry/core/build/esm/eventProcessors.js
function zR(e, t, n, r = 0, i) {
	try {
		let a = BR(t, n, e, r, i);
		return rF(a) ? a : IR(a);
	} catch (e) {
		return LR(e);
	}
}
function BR(e, t, n, r, i) {
	let a = n[r];
	if (!e || !a) return e;
	let o = `Event processor "${a.id || "?"}"`, s = !1, c = QL(Y ? `${o} threw an error, dropping event:` : "", () => a({ ...e }, t), () => (s = !0, null));
	return Y && c === null && Z.log(`${o} dropped event`), rF(c) ? c.then((e) => e ? BR(e, t, n, r + 1, i) : (i?.(s ? "callback_error" : "event_processor"), null)) : c ? BR(c, t, n, r + 1, i) : (i?.(s ? "callback_error" : "event_processor"), null);
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/debug-ids.js
var VR, HR, UR, WR;
function GR(e) {
	let t = X._sentryDebugIds, n = X._debugIds;
	if (!t && !n) return {};
	let r = t ? Object.keys(t) : [], i = n ? Object.keys(n) : [];
	if (WR && r.length === HR && i.length === UR) return WR;
	HR = r.length, UR = i.length, WR = {}, VR ||= {};
	let a = (t, n) => {
		for (let r of t) {
			let t = n[r], i = VR?.[r];
			if (i && WR && t) WR[i[0]] = t, VR && (VR[r] = [i[0], t]);
			else if (t) {
				let n = e(r);
				for (let e = n.length - 1; e >= 0; e--) {
					let i = n[e]?.filename;
					if (i && WR && VR) {
						WR[i] = t, VR[r] = [i, t];
						break;
					}
				}
			}
		}
	};
	return t && a(r, t), n && a(i, n), WR;
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/prepareEvent.js
function KR(e, t, n, r, i, a) {
	let { normalizeDepth: o = 3, normalizeMaxBreadth: s = 1e3 } = e, c = {
		...t,
		event_id: t.event_id || n.event_id || RF(),
		timestamp: t.timestamp || JF()
	}, l = n.integrations || e.integrations.map((e) => e.name);
	qR(c, e), XR(c, l), i && i.emit("applyFrameMetadata", t), t.type === void 0 && JR(c, e.stackParser);
	let u = QR(r, n.captureContext);
	n.mechanism && UF(c, n.mechanism);
	let d = i ? i.getEventProcessors() : [], f = KL(a, u), p = [...n.attachments || [], ...f.attachments];
	p.length && (n.attachments = p), UL(c, f);
	let m = SL(u);
	m && XL(c, m), kR(c, n, u);
	let ee = [...d, ...f.eventProcessors];
	return (n.data && n.data.__sentry__ === !0 ? IR(c) : zR(ee, c, n, 0, (e) => {
		i && (i.recordDroppedEvent(e, bR(t.type)), t.type === "transaction" && i.recordDroppedEvent(e, "span", 1 + (t.spans || []).length));
	})).then((e) => e ? (YR(e), typeof o == "number" && o > 0 ? ZR(e, o, s) : e) : null);
}
function qR(e, t) {
	let { environment: n, release: r, dist: i, maxValueLength: a } = t;
	e.environment = e.environment || n || "production", !e.release && r && (e.release = r), !e.dist && i && (e.dist = i);
	let o = e.request;
	o?.url && a && (o.url = jF(o.url, a)), a && e.exception?.values?.forEach((e) => {
		e.value &&= jF(e.value, a);
	});
}
function JR(e, t) {
	let n = GR(t);
	e.exception?.values?.forEach((e) => {
		e.stacktrace?.frames?.forEach((e) => {
			e.filename && (e.debug_id = n[e.filename]);
		});
	});
}
function YR(e) {
	let t = {};
	if (e.exception?.values?.forEach((e) => {
		e.stacktrace?.frames?.forEach((e) => {
			e.debug_id && (e.abs_path ? t[e.abs_path] = e.debug_id : e.filename && (t[e.filename] = e.debug_id), delete e.debug_id);
		});
	}), Object.keys(t).length === 0) return;
	e.debug_meta = e.debug_meta || {}, e.debug_meta.images = e.debug_meta.images || [];
	let n = e.debug_meta.images;
	Object.entries(t).forEach(([e, t]) => {
		n.push({
			type: "sourcemap",
			code_file: e,
			debug_id: t
		});
	});
}
function XR(e, t) {
	t.length > 0 && (e.sdk = e.sdk || {}, e.sdk.integrations = [...e.sdk.integrations || [], ...t]);
}
function ZR(e, t, n) {
	if (!e) return null;
	let r = {
		...e,
		...e.breadcrumbs && { breadcrumbs: e.breadcrumbs.map((e) => ({
			...e,
			...e.data && { data: CF(e.data, t, n) }
		})) },
		...e.user && { user: CF(e.user, t, n) },
		...e.contexts && { contexts: CF(e.contexts, t, n) },
		...e.extra && { extra: CF(e.extra, t, n) }
	};
	return e.contexts?.trace && r.contexts && (r.contexts.trace = e.contexts.trace, e.contexts.trace.data && (r.contexts.trace.data = CF(e.contexts.trace.data, t, n))), e.spans && (r.spans = e.spans.map((e) => ({
		...e,
		...e.data && { data: CF(e.data, t, n) }
	}))), e.contexts?.flags && r.contexts && (r.contexts.flags = CF(e.contexts.flags, 3, n)), r;
}
function QR(e, t) {
	if (!t) return e;
	let n = e ? e.clone() : new oI();
	return n.update(t), n;
}
function $R(e) {
	if (e) return ez(e) || nz(e) ? { captureContext: e } : e;
}
function ez(e) {
	return e instanceof oI || typeof e == "function";
}
var tz = [
	"user",
	"level",
	"extra",
	"contexts",
	"tags",
	"fingerprint",
	"propagationContext"
];
function nz(e) {
	return Object.keys(e).some((e) => tz.includes(e));
}
//#endregion
//#region node_modules/@sentry/core/build/esm/exports.js
function rz(e, t) {
	return DI().captureException(e, $R(t));
}
function iz(e, t) {
	return DI().captureEvent(e, t);
}
function az(e) {
	let t = OI(), { user: n } = KL(t, DI()), { userAgent: r } = X.navigator || {}, i = QF({
		user: n,
		...r && { userAgent: r },
		...e
	}), a = t.getSession();
	return a?.status === "ok" && $F(a, { status: "exited" }), oz(), t.setSession(i), i;
}
function oz() {
	let e = OI(), t = DI().getSession() || e.getSession();
	t && eI(t), sz(), e.setSession();
}
function sz() {
	let e = OI(), t = jI(), n = e.getSession();
	n && t && t.captureSession(n);
}
function cz(e = !1) {
	if (e) {
		oz();
		return;
	}
	sz();
}
function lz(e) {
	let t = e.protocol ? `${e.protocol}:` : "", n = e.port ? `:${e.port}` : "";
	return `${t}//${e.host}${n}${e.path ? `/${e.path}` : ""}/api/`;
}
function uz(e) {
	return `${lz(e)}${e.projectId}/envelope/`;
}
function dz(e, t) {
	let n = { sentry_version: "7" };
	return e.publicKey && (n.sentry_key = e.publicKey), t && (n.sentry_client = `${t.name}/${t.version}`), new URLSearchParams(n).toString();
}
function fz(e, t, n) {
	return t || `${uz(e)}?${dz(e, n)}`;
}
//#endregion
//#region node_modules/@sentry/core/build/esm/logs/envelope.js
function pz(e, t) {
	let n = t ? "auto" : "never";
	return [{
		type: "log",
		item_count: e.length,
		content_type: "application/vnd.sentry.items.log+json"
	}, {
		version: 2,
		...wR() && { ingest_settings: {
			infer_ip: n,
			infer_user_agent: n
		} },
		items: e
	}];
}
function mz(e, t, n, r, i) {
	let a = {};
	return t?.sdk && (a.sdk = {
		name: t.sdk.name,
		version: t.sdk.version
	}), n && r && (a.dsn = QI(r)), sR(a, [pz(e, i)]);
}
//#endregion
//#region node_modules/@sentry/core/build/esm/logs/internal.js
function hz(e, t) {
	let n = t ?? gz(e) ?? [];
	if (n.length === 0) return;
	let r = e.getOptions(), i = mz(n, r._metadata, r.tunnel, e.getDsn(), e.getDataCollectionOptions().userInfo);
	_z().set(e, []), e.emit("flushLogs"), e.sendEnvelope(i);
}
function gz(e) {
	return _z().get(e);
}
function _z() {
	return uP("clientToLogBufferMap", () => /* @__PURE__ */ new WeakMap());
}
//#endregion
//#region node_modules/@sentry/core/build/esm/metrics/envelope.js
function vz(e, t) {
	let n = t ? "auto" : "never";
	return [{
		type: "trace_metric",
		item_count: e.length,
		content_type: "application/vnd.sentry.items.trace-metric+json"
	}, {
		version: 2,
		...wR() && { ingest_settings: {
			infer_ip: n,
			infer_user_agent: n
		} },
		items: e
	}];
}
function yz(e, t, n, r, i) {
	let a = {};
	return t?.sdk && (a.sdk = {
		name: t.sdk.name,
		version: t.sdk.version
	}), n && r && (a.dsn = QI(r)), sR(a, [vz(e, i)]);
}
//#endregion
//#region node_modules/@sentry/core/build/esm/metrics/internal.js
function bz(e, t) {
	let n = t ?? xz(e) ?? [];
	if (n.length === 0) return;
	let r = e.getOptions(), i = yz(n, r._metadata, r.tunnel, e.getDsn(), e.getDataCollectionOptions().userInfo);
	Sz().set(e, []), e.emit("flushMetrics"), e.sendEnvelope(i);
}
function xz(e) {
	return Sz().get(e);
}
function Sz() {
	return uP("clientToMetricBufferMap", () => /* @__PURE__ */ new WeakMap());
}
//#endregion
//#region node_modules/@sentry/core/build/esm/tracing/spans/extractGenAiSpans.js
function Cz(e, t) {
	if (e.type !== "transaction" || !e.spans?.length || !e.sdkProcessingMetadata?.hasGenAiSpans || aR(t)) return;
	let n = [], r = [];
	for (let t of e.spans) t.op?.startsWith("gen_ai.") ? n.push(rR(t)) : r.push(t);
	if (n.length !== 0) return e.spans = r, ER(n, t);
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/promisebuffer.js
var wz = /* @__PURE__ */ Symbol.for("SentryBufferFullError");
function Tz(e = 100) {
	let t = /* @__PURE__ */ new Set();
	function n() {
		return t.size < e;
	}
	function r(e) {
		t.delete(e);
	}
	function i(e) {
		if (!n()) return LR(wz);
		let i = e();
		return t.add(i), i.then(() => r(i), () => r(i)), i;
	}
	function a(e) {
		if (!t.size) return IR(!0);
		let n = Promise.allSettled(Array.from(t)).then(() => !0);
		if (!e) return n;
		let r = [n, new Promise((t) => oR(setTimeout(() => t(!1), e)))];
		return Promise.race(r);
	}
	return {
		get $() {
			return Array.from(t);
		},
		add: i,
		drain: a
	};
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/ratelimit.js
var Ez = 6e4;
function Dz(e, t = gF()) {
	let n = parseInt(`${e}`, 10);
	if (!isNaN(n)) return n * 1e3;
	let r = Date.parse(`${e}`);
	return isNaN(r) ? Ez : r - t;
}
function Oz(e, t) {
	return e[t] || e.all || 0;
}
function kz(e, t, n = gF()) {
	return Oz(e, t) > n;
}
function Az(e, { statusCode: t, headers: n }, r = gF()) {
	let i = { ...e }, a = n?.["x-sentry-rate-limits"], o = n?.["retry-after"];
	if (a) for (let e of a.trim().split(",")) {
		let [t, n, , , a] = e.split(":", 5), o = parseInt(t, 10), s = (isNaN(o) ? 60 : o) * 1e3;
		if (!n) i.all = r + s;
		else for (let e of n.split(";")) e === "metric_bucket" ? (!a || a.split(";").includes("custom")) && (i[e] = r + s) : i[e] = r + s;
	}
	else o ? i.all = r + Dz(o, r) : t === 429 && (i.all = r + 6e4);
	return i;
}
function jz(e, t, n = Tz(e.bufferSize || 64)) {
	let r = {}, i = (e) => n.drain(e);
	function a(i) {
		let a = [];
		if (lR(i, (t, n) => {
			let i = _R(n);
			kz(r, i) ? e.recordDroppedEvent("ratelimit_backoff", i) : a.push(t);
		}), a.length === 0) return Promise.resolve({});
		let o = sR(i[0], a), s = (t) => {
			if (uR(o, ["client_report"])) {
				Y && Z.warn(`Dropping client report. Will not send outcomes (reason: ${t}).`);
				return;
			}
			lR(o, (n, r) => {
				e.recordDroppedEvent(t, _R(r));
			});
		};
		return n.add(() => t({ body: fR(o) }).then((e) => e.statusCode === 413 ? (Y && Z.error("Sentry responded with status code 413. Envelope was discarded due to exceeding size limits."), s("send_error"), e) : (Y && e.statusCode !== void 0 && (e.statusCode < 200 || e.statusCode >= 300) && Z.warn(`Sentry responded with status code ${e.statusCode} to sent event.`), r = Az(r, e), e), (e) => {
			throw s("network_error"), Y && Z.error("Encountered error running transport request:", e), e;
		})).then((e) => e, (e) => {
			if (e === wz) return Y && Z.error("Skipped sending event because buffer is full."), s("queue_overflow"), Promise.resolve({});
			throw e;
		});
	}
	return {
		send: a,
		flush: i
	};
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/clientreport.js
function Mz(e, t, n) {
	let r = [{ type: "client_report" }, {
		timestamp: n || JF(),
		discarded_events: e
	}];
	return sR(t ? { dsn: t } : {}, [r]);
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/eventUtils.js
function Nz(e) {
	let t = [];
	e.message && t.push(e.message);
	try {
		let n = e.exception.values[e.exception.values.length - 1];
		n?.value && (t.push(n.value), n.type && t.push(`${n.type}: ${n.value}`));
	} catch {}
	return t;
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/transactionEvent.js
function Pz(e) {
	let { trace_id: t, parent_span_id: n, span_id: r, status: i, origin: a, data: o, op: s } = e.contexts?.trace ?? {};
	return {
		data: o ?? {},
		description: e.transaction,
		op: s,
		parent_span_id: n,
		span_id: r ?? "",
		start_timestamp: e.start_timestamp ?? 0,
		status: i ?? "ok",
		timestamp: e.timestamp,
		trace_id: t ?? "",
		origin: a,
		profile_id: o?.[LI],
		exclusive_time: o?.[RI],
		measurements: e.measurements,
		is_segment: !0
	};
}
function Fz(e) {
	return {
		type: "transaction",
		timestamp: e.timestamp,
		start_timestamp: e.start_timestamp,
		transaction: e.description,
		contexts: { trace: {
			trace_id: e.trace_id,
			span_id: e.span_id,
			parent_span_id: e.parent_span_id,
			op: e.op,
			status: e.status,
			origin: e.origin,
			data: {
				...e.data,
				...e.profile_id && { "sentry.profile_id": e.profile_id },
				...e.exclusive_time && { "sentry.exclusive_time": e.exclusive_time }
			}
		} },
		measurements: e.measurements
	};
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/warnAboutIgnoredTransactionOptions.js
function Iz(e) {
	e.traceLifecycle === "stream" && (e.beforeSendTransaction || e.ignoreTransactions?.length) && mP(() => {
		console.warn("[Sentry] `beforeSendTransaction` and `ignoreTransactions` are ignored with `traceLifecycle: 'stream'` (enabled by default). Use `beforeSendSpan` and `ignoreSpans` instead, or set `traceLifecycle: 'static'`.");
	});
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/data-collection/resolveDataCollectionOptions.js
var Lz = {
	userInfo: !0,
	cookies: !0,
	httpHeaders: {
		request: !0,
		response: !0
	},
	httpBodies: [
		"incomingRequest",
		"outgoingRequest",
		"incomingResponse",
		"outgoingResponse"
	],
	urlQueryParams: !0,
	graphQL: {
		document: !0,
		variables: !0
	},
	genAI: {
		inputs: !0,
		outputs: !0
	},
	databaseQueryData: !0,
	queues: !0,
	stackFrameVariables: !0,
	frameContextLines: 5
};
function Rz(e) {
	return typeof e == "boolean" || "allow" in e || "deny" in e;
}
function zz(e) {
	return e === void 0 ? { ...Lz.httpHeaders } : Rz(e) ? {
		request: e,
		response: e
	} : {
		request: e.request ?? Lz.httpHeaders.request,
		response: e.response ?? Lz.httpHeaders.response
	};
}
function Bz(e) {
	let t = e.dataCollection ?? {};
	return {
		userInfo: t.userInfo ?? Lz.userInfo,
		cookies: t.cookies ?? Lz.cookies,
		httpHeaders: zz(t.httpHeaders),
		httpBodies: t.httpBodies ?? Lz.httpBodies,
		urlQueryParams: t.urlQueryParams ?? Lz.urlQueryParams,
		graphQL: {
			document: t.graphQL?.document ?? Lz.graphQL.document,
			variables: t.graphQL?.variables ?? Lz.graphQL.variables
		},
		genAI: {
			inputs: t.genAI?.inputs ?? Lz.genAI.inputs,
			outputs: t.genAI?.outputs ?? Lz.genAI.outputs
		},
		databaseQueryData: t.databaseQueryData ?? Lz.databaseQueryData,
		queues: t.queues ?? Lz.queues,
		stackFrameVariables: t.stackFrameVariables ?? Lz.stackFrameVariables,
		frameContextLines: t.frameContextLines ?? Lz.frameContextLines
	};
}
//#endregion
//#region node_modules/@sentry/core/build/esm/client.js
var Vz = "Not capturing exception because it's already been captured.", Hz = "Discarded session because of missing or non-string release", Uz = /* @__PURE__ */ Symbol.for("SentryInternalError"), Wz = /* @__PURE__ */ Symbol.for("SentryDoNotSendEventError"), Gz = 5e3;
function Kz(e) {
	return {
		message: e,
		[Uz]: !0
	};
}
function qz(e) {
	return {
		message: e,
		[Wz]: !0
	};
}
function Jz(e) {
	return eF(e) && Uz in e;
}
function Yz(e) {
	return eF(e) && Wz in e;
}
function Xz(e, t, n, r, i) {
	let a = 0, o, s = !1;
	e.on(n, () => {
		a = 0, clearTimeout(o), s = !1;
	}), e.on(t, (t) => {
		if (a += r(t), a >= 8e5) i(e);
		else if (!s) {
			let t = e.getOptions()._flushInterval ?? Gz;
			t > 0 && (s = !0, o = oR(setTimeout(() => {
				i(e);
			}, t)));
		}
	}), e.on("flush", () => {
		i(e);
	});
}
var Zz = class {
	constructor(e) {
		this._options = {
			attachStacktrace: !0,
			...e,
			traceLifecycle: e.traceLifecycle === "static" ? "static" : "stream"
		}, this._integrations = {}, this._numProcessing = 0, this._outcomes = {}, this._hooks = {}, this._eventProcessors = [], this._promiseBuffer = Tz(e.transportOptions?.bufferSize ?? 64), this._dataCollection = Bz(e), this._unhandledSessionStatus = "crashed", e.dsn ? this._dsn = iL(e.dsn) : Y && Z.warn("No DSN provided, client will not send events.");
		let { beforeSendSpan: t, traceLifecycle: n } = this._options;
		if (Y && t && eR(t) !== (n === "static") && mP(() => {
			console.warn(`Ignoring \`beforeSendSpan\`: ${n === "static" ? "wrap it with" : "remove"} \`Sentry.withStaticSpan\` to use it with \`traceLifecycle: "${n}"\`.`);
		}), this._dsn) {
			let t = fz(this._dsn, e.tunnel, e._metadata ? e._metadata.sdk : void 0);
			this._transport = e.transport({
				tunnel: this._options.tunnel,
				recordDroppedEvent: this.recordDroppedEvent.bind(this),
				...e.transportOptions,
				url: t
			});
		}
		Xz(this, "afterCaptureLog", "flushLogs", rB, hz), Xz(this, "afterCaptureMetric", "flushMetrics", nB, bz);
	}
	captureException(e, t, n) {
		let r = RF();
		if (GF(e)) return Y && Z.log(Vz), r;
		let i = {
			event_id: r,
			...t
		};
		return this._process(() => this.eventFromException(e, i).then((e) => this._captureEvent(e, i, n)).then((e) => e), "error"), i.event_id;
	}
	captureMessage(e, t, n, r) {
		let i = {
			event_id: RF(),
			...n
		}, a = ZP(e) ? e : String(e), o = QP(e), s = o ? this.eventFromMessage(a, t, i) : this.eventFromException(e, i);
		return this._process(() => s.then((e) => this._captureEvent(e, i, r)), o ? "unknown" : "error"), i.event_id;
	}
	captureEvent(e, t, n) {
		let r = RF();
		if (t?.originalException && GF(t.originalException)) return Y && Z.log(Vz), r;
		let i = {
			event_id: r,
			...t
		}, a = e.sdkProcessingMetadata || {}, o = a.capturedSpanScope, s = a.capturedSpanIsolationScope, c = bR(e.type);
		return this._process(() => this._captureEvent(e, i, o || n, s), c), i.event_id;
	}
	captureSession(e) {
		this.sendSession(e), $F(e, { init: !1 });
	}
	getDsn() {
		return this._dsn;
	}
	getOptions() {
		return this._options;
	}
	getDataCollectionOptions() {
		return this._dataCollection;
	}
	getSdkMetadata() {
		return this._options._metadata;
	}
	getTransport() {
		return this._transport;
	}
	async flush(e) {
		let t = this._transport;
		if (this.emit("flush"), !t) return !0;
		let n = await this._isClientDoneProcessing(e), r = await t.flush(e);
		return n && r;
	}
	async close(e) {
		let t = await this.flush(e);
		return this.getOptions().enabled = !1, this.emit("close"), t;
	}
	getEventProcessors() {
		return this._eventProcessors;
	}
	addEventProcessor(e) {
		this._eventProcessors.push(e);
	}
	init() {
		(this._isEnabled() || this._options.integrations.some(({ name: e }) => e.startsWith("Spotlight"))) && (this._setupIntegrations(), Iz(this._options));
	}
	getIntegrationByName(e) {
		return this._integrations[e];
	}
	getIntegrationNames() {
		return Object.keys(this._integrations);
	}
	addIntegration(e) {
		let t = this._integrations[e.name];
		!t && e.beforeSetup && e.beforeSetup(this), PL(this, e, this._integrations), t || NL(this, [e]);
	}
	sendEvent(e, t = {}) {
		this.emit("beforeSendEvent", e, t);
		let n = Cz(e, this), r = MR(e, this._dsn, this._options._metadata, this._options.tunnel);
		for (let e of t.attachments || []) r = cR(r, mR(e));
		n && (r = cR(r, n)), this.sendEnvelope(r).then((t) => this.emit("afterSendEvent", e, t));
	}
	sendSession(e) {
		let { release: t, environment: n = IL } = this._options;
		if ("aggregates" in e) {
			let r = e.attrs || {};
			if (!r.release && !t) {
				Y && Z.warn(Hz);
				return;
			}
			r.release = r.release || t, r.environment = r.environment || n, e.attrs = r;
		} else {
			if (!e.release && !t) {
				Y && Z.warn(Hz);
				return;
			}
			e.release = e.release || t, e.environment = e.environment || n;
		}
		this.emit("beforeSendSession", e);
		let r = jR(e, this._dsn, this._options._metadata, this._options.tunnel);
		this.sendEnvelope(r);
	}
	recordDroppedEvent(e, t, n = 1) {
		if (this._options.sendClientReports) {
			let r = `${e}:${t}`;
			Y && Z.log(`Recording outcome: "${r}"${n > 1 ? ` (${n} times)` : ""}`), this._outcomes[r] = (this._outcomes[r] || 0) + n;
		}
	}
	on(e, t) {
		let n = this._hooks[e] = this._hooks[e] || /* @__PURE__ */ new Set(), r = (...e) => t(...e);
		return n.add(r), () => {
			n.delete(r);
		};
	}
	emit(e, ...t) {
		let n = this._hooks[e];
		n && n.forEach((e) => e(...t));
	}
	async sendEnvelope(e) {
		if (this.emit("beforeEnvelope", e), this._isEnabled() && this._transport) try {
			let t = await this._transport.send(e);
			return this.emit("afterEnvelope", e), t;
		} catch (e) {
			return Y && Z.error("Error while sending envelope:", e), {};
		}
		return Y && Z.error("Transport disabled"), {};
	}
	registerCleanup(e) {}
	dispose() {}
	_setupIntegrations() {
		let { integrations: e } = this._options;
		this._integrations = ML(this, e), NL(this, e);
	}
	_updateSessionFromEvent(e, t) {
		let n = t.level === "fatal", r = !1, i = t.exception?.values;
		if (i) {
			r = !0, n = !1;
			for (let e of i) if (e.mechanism?.handled === !1) {
				n = !0;
				break;
			}
		}
		let a = e.status === "ok";
		(a && e.errors === 0 || a && n) && ($F(e, {
			...n && { status: this._unhandledSessionStatus },
			errors: e.errors || Number(r || n)
		}), this.captureSession(e));
	}
	async _isClientDoneProcessing(e) {
		let t = 0;
		for (; !e || t < e;) {
			if (await new Promise((e) => setTimeout(e, 1)), !this._numProcessing) return !0;
			t++;
		}
		return !1;
	}
	_isEnabled() {
		return this.getOptions().enabled !== !1 && this._transport !== void 0;
	}
	_prepareEvent(e, t, n, r) {
		let i = this.getOptions(), a = this.getIntegrationNames();
		return !t.integrations && a.length && (t.integrations = a), this.emit("preprocessEvent", e, t), e.type || r.setLastEventId(e.event_id || t.event_id), KR(i, e, t, n, this, r).then((e) => e === null ? e : (this.emit("postprocessEvent", e, t), e.contexts = {
			trace: {
				...e.contexts?.trace,
				...MI(n)
			},
			...e.contexts
		}, e.sdkProcessingMetadata = {
			dynamicSamplingContext: VL(this, n),
			...e.sdkProcessingMetadata
		}, e));
	}
	_captureEvent(e, t = {}, n = DI(), r = OI()) {
		return Y && eB(e) && Z.log(`Captured error event \`${Nz(e)[0] || "<unknown>"}\``), this._processEvent(e, t, n, r).then((e) => e.event_id, (e) => {
			Y && (Yz(e) ? Z.log(e.message) : Jz(e) ? Z.warn(e.message) : Z.warn(e));
		});
	}
	_processEvent(e, t, n, r) {
		let i = this.getOptions(), { sampleRate: a } = i, o = tB(e), s = eB(e), c = `before send for type \`${e.type || "error"}\``, l = "before_send", u = a === void 0 ? void 0 : aL(a), d = bR(e.type);
		return this._prepareEvent(e, t, n, r).then((e) => {
			if (e === null) throw qz("An event processor returned `null`, will not send event.");
			return t.data?.__sentry__ === !0 ? e : Qz($z(this, i, e, t, () => {
				l = "callback_error";
			}), c);
		}).then((i) => {
			if (i === null) {
				if (this.recordDroppedEvent(l, d), o) {
					let t = e.spans || [];
					this.recordDroppedEvent(l, "span", 1 + t.length);
				}
				throw qz(`${c} ${l === "callback_error" ? "threw an error" : "returned `null`"}, will not send event.`);
			}
			let f = n.getSession() || r.getSession();
			if (s && f && this._updateSessionFromEvent(f, i), s && typeof u == "number" && hF() > u) throw this.recordDroppedEvent("sample_rate", "error"), qz(`Discarding event because it's not included in the random sample (sampling rate = ${a})`);
			if (o) {
				let e = (i.sdkProcessingMetadata?.spanCountBeforeProcessing || 0) - (i.spans ? i.spans.length : 0);
				e > 0 && this.recordDroppedEvent("before_send", "span", e);
			}
			let p = i.transaction_info;
			return o && p && i.transaction !== e.transaction && (i.transaction_info = {
				...p,
				source: "custom"
			}), this.sendEvent(i, t), i;
		}).then(null, (e) => {
			throw Yz(e) || Jz(e) ? e : (this.captureException(e, {
				mechanism: {
					handled: !1,
					type: "internal"
				},
				data: { __sentry__: !0 },
				originalException: e
			}), Kz(`Event processing pipeline threw an error, original event will not be sent. Details have been sent as a new event.
Reason: ${e}`));
		});
	}
	_process(e, t) {
		this._numProcessing++, this._promiseBuffer.add(e).then((e) => (this._numProcessing--, e), (e) => (this._numProcessing--, e === wz && this.recordDroppedEvent("queue_overflow", t), e));
	}
	_clearOutcomes() {
		let e = this._outcomes;
		return this._outcomes = {}, Object.entries(e).map(([e, t]) => {
			let [n, r] = e.split(":");
			return {
				reason: n,
				category: r,
				quantity: t
			};
		});
	}
	_flushOutcomes() {
		Y && Z.log("Flushing outcomes...");
		let e = this._clearOutcomes();
		if (e.length === 0) {
			Y && Z.log("No outcomes to send");
			return;
		}
		if (!this._dsn) {
			Y && Z.log("No dsn provided, will not send outcomes");
			return;
		}
		Y && Z.log("Sending outcomes:", e);
		let t = Mz(e, this._options.tunnel && QI(this._dsn));
		this.sendEnvelope(t);
	}
};
function Qz(e, t) {
	let n = `${t} must return \`null\` or a valid event.`;
	if (rF(e)) return e.then((e) => {
		if (!$P(e) && e !== null) throw Kz(n);
		return e;
	}, (e) => {
		throw Kz(`${t} rejected with ${e}`);
	});
	if (!$P(e) && e !== null) throw Kz(n);
	return e;
}
function $z(e, t, n, r, i) {
	let { beforeSend: a, ignoreSpans: o, beforeSendTransaction: s } = t, c = eR(t.beforeSendSpan) && t.beforeSendSpan, l = n;
	if (eB(l) && a) {
		let e = l;
		return QL(Y ? "The `beforeSend` callback threw an error, dropping the event:" : "", () => a(e, r), () => (i(), null));
	}
	if (tB(l)) {
		if (c || o) {
			let t = Pz(l);
			if (o?.length && TL({
				description: t.description,
				op: t.op,
				attributes: t.data
			}, o)) return null;
			if (c && (l = nI(n, Fz(nR(t, c)))), l.spans) {
				let t = [], n = l.spans;
				for (let e of n) {
					if (o?.length && TL({
						description: e.description,
						op: e.op,
						attributes: e.data
					}, o)) {
						DL(n, e);
						continue;
					}
					c ? t.push(nR(e, c)) : t.push(e);
				}
				let r = l.spans.length - t.length;
				r && e.recordDroppedEvent("before_send", "span", r), l.spans = t;
			}
		}
		if (s) {
			if (l.spans) {
				let e = l.spans.length;
				l.sdkProcessingMetadata = {
					...n.sdkProcessingMetadata,
					spanCountBeforeProcessing: e
				};
			}
			return QL(Y ? "The `beforeSendTransaction` callback threw an error, dropping the event:" : "", () => s(l, r), () => (i(), null));
		}
	}
	return l;
}
function eB(e) {
	return e.type === void 0;
}
function tB(e) {
	return e.type === "transaction";
}
function nB(e) {
	let t = 0;
	return e.name && (t += e.name.length * 2), t += 8, t + iB(e.attributes);
}
function rB(e) {
	let t = 0;
	return e.message && (t += e.message.length * 2), t + iB(e.attributes);
}
function iB(e) {
	if (!e) return 0;
	let t = 0;
	return Object.values(e).forEach((e) => {
		Array.isArray(e) ? t += e.length * aB(e[0]) : QP(e) ? t += aB(e) : t += 100;
	}), t;
}
function aB(e) {
	return typeof e == "string" ? e.length * 2 : typeof e == "number" ? 8 : typeof e == "boolean" ? 4 : 0;
}
//#endregion
//#region node_modules/@sentry/core/build/esm/sdk.js
function oB(e, t) {
	t.debug === !0 && (Y ? Z.enable() : mP(() => {
		console.warn("[Sentry] Cannot initialize SDK with `debug` option using a non-debug bundle.");
	})), DI().update(t.initialScope);
	let n = new e(t);
	return sB(n), n.init(), n;
}
function sB(e) {
	DI().setClient(e);
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/data-collection/filtering-snippets.js
var cB = "[Filtered]", lB = [
	"auth",
	"token",
	"secret",
	"session",
	"password",
	"passwd",
	"pwd",
	"key",
	"jwt",
	"bearer",
	"sso",
	"saml",
	"csrf",
	"xsrf",
	"credentials",
	"sid",
	"identity",
	"set-cookie",
	"cookie"
];
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/data-collection/filterKeyValueData.js
function uB(e, t) {
	return t.some((t) => e.includes(t));
}
function dB(e, t, n) {
	if (t === !1) return !0;
	let r = e.toLowerCase();
	if (uB(r, n == null ? lB : [...lB, ...n])) return !0;
	if (t === !0) return !1;
	let i = ("deny" in t ? t.deny : t.allow).some((e) => r.includes(e.toLowerCase()));
	return "deny" in t ? i : !i;
}
function fB(e, t, n) {
	if (t === !1) return {};
	let r = {};
	for (let i of Object.keys(e)) r[i] = dB(i, t, n) ? cB : e[i];
	return r;
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/data-collection/filterQueryParams.js
function pB(e, t) {
	if (e && t !== !1) return e.split("&").map((e) => {
		let n = e.indexOf("="), r = n === -1 ? e : e.slice(0, n), i = new URLSearchParams(`${r}=`).keys().next().value;
		return i !== void 0 && dB(i, t) ? `${r}=${cB}` : e;
	}).join("&");
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/data-collection/filterUrlQuery.js
function mB(e, t) {
	let n = e.indexOf("#"), r = n === -1 ? e.length : n, i = e.indexOf("?");
	if (i === -1 || i > r) return e;
	let a = e.slice(0, i), o = e.slice(i + 1, r), s = e.slice(r), c = pB(o, t);
	return c ? `${a}?${c}${s}` : `${a}${s}`;
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/data-collection/filterCollectedUrl.js
function hB(e) {
	return (e ?? jI())?.getDataCollectionOptions().urlQueryParams ?? !0;
}
function gB(e, t) {
	return e === void 0 ? void 0 : mB(e, hB(t));
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/url.js
function _B(e) {
	if (!e) return {};
	let t = e.match(/^(([^:/?#]+):)?(\/\/([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?$/);
	if (!t) return {};
	let n = t[6] || "", r = t[8] || "";
	return {
		host: t[4],
		path: t[5],
		protocol: t[2],
		search: n,
		hash: r,
		relative: t[5] + n + r
	};
}
function vB(e, t = !0) {
	if (e.startsWith("data:")) {
		let n = e.match(/^data:([^;,]+)/), r = n ? n[1] : "text/plain", i = e.includes(";base64,"), a = e.indexOf(","), o = "";
		if (t && a !== -1) {
			let t = e.slice(a + 1);
			o = t.length > 10 ? `${t.slice(0, 10)}... [truncated]` : t;
		}
		return `data:${r}${i ? ",base64" : ""}${o ? `,${o}` : ""}`;
	}
	return e;
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/ipAddress.js
function yB(e) {
	"aggregates" in e ? e.attrs?.ip_address === void 0 && (e.attrs = {
		...e.attrs,
		ip_address: "{{auto}}"
	}) : e.ipAddress === void 0 && (e.ipAddress = "{{auto}}");
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/sdkMetadata.js
function bB(e, t, n = [t], r = "npm") {
	let i = (e._metadata = e._metadata || {}).sdk = e._metadata.sdk || {};
	i.name || (i.name = `sentry.javascript.${t}`, i.packages = n.map((e) => ({
		name: `${r}:@sentry/${e}`,
		version: sP
	})), i.version = sP);
}
//#endregion
//#region node_modules/@sentry/core/build/esm/breadcrumbs.js
var xB = 100;
function SB(e, t) {
	let n = jI(), r = OI();
	if (!n) return;
	let { beforeBreadcrumb: i = null, maxBreadcrumbs: a = xB } = n.getOptions();
	if (a <= 0) return;
	let o = {
		timestamp: JF(),
		...e
	}, s = i ? QL(Y ? "The `beforeBreadcrumb` callback threw an error, dropping the breadcrumb:" : "", () => mP(() => i(o, t)), () => null) : o;
	s !== null && (n.emit && n.emit("beforeAddBreadcrumb", s, t), r.addBreadcrumb(s, a));
}
//#endregion
//#region node_modules/@sentry/core/build/esm/integrations/functiontostring.js
var CB = "FunctionToString", wB = /* @__PURE__ */ new WeakMap(), TB = FL((() => ({
	name: CB,
	setupOnce() {
		let e = Function.prototype.toString;
		try {
			Function.prototype.toString = function(...t) {
				let n = lF(this), r;
				try {
					wB.has(jI()) && n !== void 0 && (r = n);
				} catch {}
				return e.apply(r ?? this, t);
			};
		} catch {}
	},
	setup(e) {
		wB.set(e, !0);
	}
}))), EB = [
	/^Script error\.?$/,
	/^Javascript error: Script error\.? on line 0$/,
	/^ResizeObserver loop completed with undelivered notifications.$/,
	/^Cannot redefine property: googletag$/,
	/^Can't find variable: gmo$/,
	/^undefined is not an object \(evaluating 'a\.[A-Z]'\)$/,
	/can't redefine non-configurable property "solana"/,
	/vv\(\)\.getRestrictions is not a function/,
	/Can't find variable: _AutofillCallbackHandler/,
	/Object Not Found Matching Id:\d+, MethodName:simulateEvent/,
	/Java exception was raised during method invocation$/,
	/Java object is gone$/
], DB = "EventFilters", OB = FL((e = {}) => {
	let t;
	return {
		name: DB,
		setup(n) {
			t = kB(e, n.getOptions());
		},
		processEvent(n, r, i) {
			return t ||= kB(e, i.getOptions()), AB(n, t) ? null : n;
		}
	};
});
function kB(e = {}, t = {}) {
	return {
		allowUrls: [...e.allowUrls || [], ...t.allowUrls || []],
		denyUrls: [...e.denyUrls || [], ...t.denyUrls || []],
		ignoreErrors: [
			...e.ignoreErrors || [],
			...t.ignoreErrors || [],
			...e.disableErrorDefaults ? [] : EB
		],
		ignoreTransactions: [...e.ignoreTransactions || [], ...t.ignoreTransactions || []]
	};
}
function AB(e, t) {
	if (!e.type) {
		if (jB(e, t.ignoreErrors)) return Y && Z.warn(`Event dropped due to being matched by \`ignoreErrors\` option.
Event: ${BF(e)}`), !0;
		if (LB(e)) return Y && Z.warn(`Event dropped due to not having an error message, error type or stacktrace.
Event: ${BF(e)}`), !0;
		if (NB(e, t.denyUrls)) return Y && Z.warn(`Event dropped due to being matched by \`denyUrls\` option.
Event: ${BF(e)}.
Url: ${IB(e)}`), !0;
		if (!PB(e, t.allowUrls)) return Y && Z.warn(`Event dropped due to not being matched by \`allowUrls\` option.
Event: ${BF(e)}.
Url: ${IB(e)}`), !0;
	} else if (e.type === "transaction" && MB(e, t.ignoreTransactions)) return Y && Z.warn(`Event dropped due to being matched by \`ignoreTransactions\` option.
Event: ${BF(e)}`), !0;
	return !1;
}
function jB(e, t) {
	return t?.length ? Nz(e).some((e) => PF(e, t)) : !1;
}
function MB(e, t) {
	if (!t?.length) return !1;
	let n = e.transaction;
	return n ? PF(n, t) : !1;
}
function NB(e, t) {
	if (!t?.length) return !1;
	let n = IB(e);
	return n ? PF(n, t) : !1;
}
function PB(e, t) {
	if (!t?.length) return !0;
	let n = IB(e);
	return !n || PF(n, t);
}
function FB(e = []) {
	for (let t = e.length - 1; t >= 0; t--) {
		let n = e[t];
		if (n && n.filename !== "<anonymous>" && n.filename !== "[native code]") return n.filename || null;
	}
	return null;
}
function IB(e) {
	try {
		let t = [...e.exception?.values ?? []].reverse().find((e) => e.mechanism?.parent_id === void 0 && e.stacktrace?.frames?.length)?.stacktrace?.frames;
		return t ? FB(t) : null;
	} catch {
		return Y && Z.error(`Cannot extract url for event ${BF(e)}`), null;
	}
}
function LB(e) {
	return e.exception?.values?.length ? !e.message && !e.exception.values.some((e) => e.stacktrace || e.type && e.type !== "Error" || e.value) : !1;
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/aggregate-errors.js
function RB(e, t, n, r, i, a) {
	if (!i.exception?.values || !a || !GP(a.originalException)) return;
	let o = i.exception.values.length > 0 ? i.exception.values[i.exception.values.length - 1] : void 0;
	o && (i.exception.values = zB(e, t, r, a.originalException, n, i.exception.values, o, 0));
}
function zB(e, t, n, r, i, a, o, s) {
	if (a.length >= n + 1) return a;
	let c = [...a];
	if (GP(r[i])) {
		VB(o, s, r);
		let a = e(t, r[i]), l = c.length;
		HB(a, i, l, s), c = zB(e, t, n, r[i], i, [a, ...c], a, l);
	}
	return BB(r) && r.errors.forEach((a, l) => {
		if (GP(a)) {
			VB(o, s, r);
			let u = e(t, a), d = c.length;
			HB(u, `errors[${l}]`, d, s), c = zB(e, t, n, a, i, [u, ...c], u, d);
		}
	}), c;
}
function BB(e) {
	return Array.isArray(e.errors);
}
function VB(e, t, n) {
	e.mechanism = {
		handled: !0,
		type: "auto.core.linked_errors",
		...BB(n) && { is_exception_group: !0 },
		...e.mechanism,
		exception_id: t
	};
}
function HB(e, t, n, r) {
	e.mechanism = {
		handled: !0,
		...e.mechanism,
		type: "chained",
		source: t,
		exception_id: n,
		parent_id: r
	};
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/eventbuilder.js
function UB(e) {
	return GP(e) && "__sentry_fetch_url_host__" in e && typeof e.__sentry_fetch_url_host__ == "string";
}
function WB(e) {
	return UB(e) ? `${e.message} (${e.__sentry_fetch_url_host__})` : e.message;
}
//#endregion
//#region node_modules/@sentry/core/build/esm/instrument/console.js
var GB = /* @__PURE__ */ new Set([]);
function KB(e) {
	let t = "console", n = FP(t, e);
	return IP(t, YB), n;
}
function qB(e) {
	for (let t of e) GB.add(t);
	return () => {
		for (let t of e) GB.delete(t);
	};
}
var JB = /* @__PURE__ */ new Set();
function YB() {
	"console" in X && dP.forEach(function(e) {
		!JB.has(e) && e in X.console && (JB.add(e), oF(X.console, e, function(t) {
			return pP[e] = t, function(...t) {
				let n = t[0], r = pP[e], i = GB.size && typeof n == "string" && PF(n, GB);
				i || LP("console", {
					args: t,
					level: e
				}), (!i || Y && Z.isEnabled()) && r?.apply(X.console, t);
			};
		}));
	});
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/severity.js
function XB(e) {
	return e === "warn" ? "warning" : [
		"fatal",
		"error",
		"warning",
		"log",
		"info",
		"debug"
	].includes(e) ? e : "log";
}
//#endregion
//#region node_modules/@sentry/core/build/esm/integrations/dedupe.js
var ZB = "Dedupe", QB = FL((() => {
	let e;
	return {
		name: ZB,
		processEvent(t) {
			if (t.type) return t;
			try {
				if ($B(t, e)) return Y && Z.warn("Event dropped due to being a duplicate of previously captured event."), null;
			} catch {}
			return e = t;
		}
	};
}));
function $B(e, t) {
	return t ? !!(eV(e, t) || tV(e, t)) : !1;
}
function eV(e, t) {
	let n = e.message, r = t.message;
	return !(!n && !r || n && !r || !n && r || n !== r || !rV(e, t) || !nV(e, t));
}
function tV(e, t) {
	let n = iV(t), r = iV(e);
	return !(!n || !r || n.type !== r.type || n.value !== r.value || !rV(e, t) || !nV(e, t));
}
function nV(e, t) {
	let n = MP(e), r = MP(t);
	if (!n || !r) return !n && !r;
	if (r.length !== n.length) return !1;
	for (let e = 0; e < r.length; e++) {
		let t = r[e], i = n[e];
		if (t.filename !== i.filename || t.lineno !== i.lineno || t.colno !== i.colno || t.function !== i.function) return !1;
	}
	return !0;
}
function rV(e, t) {
	let n = e.fingerprint, r = t.fingerprint;
	if (!n || !r) return !n && !r;
	try {
		return n.join("") === r.join("");
	} catch {
		return !1;
	}
}
function iV(e) {
	return e.exception?.values?.[0];
}
//#endregion
//#region node_modules/@sentry/core/build/esm/integrations/console.js
var aV = "Console", oV = FL((e = {}) => {
	let t = new Set(e.levels || dP);
	return {
		name: aV,
		setup(n) {
			let r = KB(({ args: e, level: r }) => {
				jI() === n && t.has(r) && sV(r, e);
			});
			if (n.registerCleanup(r), e.filter) {
				let t = qB(e.filter);
				n.registerCleanup(t);
			}
		}
	};
});
function sV(e, t) {
	let n = {
		category: "console",
		data: {
			arguments: t,
			logger: "console"
		},
		level: XB(e),
		message: cV(t)
	};
	if (e === "assert") {
		if (t[0] === !1) {
			let e = t.slice(1);
			n.message = e.length > 0 ? `Assertion failed: ${cV(e)}` : "Assertion failed", n.data.arguments = e;
		} else return;
	}
	SB(n, {
		input: t,
		level: e
	});
}
function cV(e) {
	return "util" in X && typeof X.util.format == "function" ? X.util.format(...e) : MF(e, " ");
}
//#endregion
//#region node_modules/@sentry/core/build/esm/integrations/conversationId.js
var lV = "ConversationId", uV = FL((() => ({
	name: lV,
	setup(e) {
		e.on("spanStart", (e) => {
			let t = DI().getScopeData(), n = OI().getScopeData(), r = t.conversationId || n.conversationId;
			if (r) {
				let { op: t, data: n, description: i } = fL(e);
				if (!t?.startsWith("gen_ai.") && !n["ai.operationId"] && !i?.startsWith("ai.")) return;
				e.setAttribute(zI, r);
			}
		});
	}
}))), dV = X;
function fV() {
	if (!("fetch" in dV)) return !1;
	try {
		return new Headers(), new Request("data:,"), new Response(), !0;
	} catch {
		return !1;
	}
}
function pV(e) {
	return e && /^function\s+\w+\(\)\s+\{\s+\[native code\]\s+\}$/.test(e.toString());
}
function mV() {
	if (typeof EdgeRuntime == "string") return !0;
	if (!fV()) return !1;
	if (pV(dV.fetch)) return !0;
	let e = !1, t = dV.document;
	if (t && typeof t.createElement == "function") try {
		let n = t.createElement("iframe");
		n.hidden = !0, t.head.appendChild(n), n.contentWindow?.fetch && (e = pV(n.contentWindow.fetch)), t.head.removeChild(n);
	} catch (e) {
		Y && Z.warn("Could not create sandbox iframe for pure fetch check, bailing to window.fetch: ", e);
	}
	return e;
}
//#endregion
//#region node_modules/@sentry/core/build/esm/instrument/fetch.js
function hV(e) {
	let t = "fetch", n = FP(t, e);
	return IP(t, () => gV()), n;
}
function gV(e) {
	(!wR() || mV()) && oF(X, "fetch", function(t) {
		return new Proxy(t, { apply(t, n, r) {
			let i = /* @__PURE__ */ Error(), { method: a, url: o } = yV(r), s = {
				args: r,
				fetchData: {
					method: a,
					url: o
				},
				startTimestamp: ZF() * 1e3,
				virtualError: i,
				headers: bV(r)
			};
			return e || LP("fetch", { ...s }), Reflect.apply(t, X, r).then(async (t) => (e ? e(t) : LP("fetch", {
				...s,
				endTimestamp: ZF() * 1e3,
				response: t
			}), t), (e) => {
				LP("fetch", {
					...s,
					endTimestamp: ZF() * 1e3,
					error: e
				}), GP(e) && e.stack === void 0 && (e.stack = i.stack, sF(e, "framesToPop", 1));
				let t = jI()?.getOptions().enhanceFetchErrorMessages ?? "always";
				if (t !== !1 && GP(e) && e.name === "TypeError" && (e.message === "Failed to fetch" || e.message === "Load failed" || e.message === "NetworkError when attempting to fetch resource.")) try {
					let n = new URL(s.fetchData.url).host;
					t === "always" ? e.message = `${e.message} (${n})` : sF(e, "__sentry_fetch_url_host__", n);
				} catch {}
				throw e;
			});
		} });
	});
}
function _V(e, t) {
	return eF(e) && !!e[t];
}
function vV(e) {
	return typeof e == "string" ? e : e ? _V(e, "url") ? e.url : e.toString ? e.toString() : "" : "";
}
function yV(e) {
	if (e.length === 0) return {
		method: "GET",
		url: ""
	};
	if (e.length === 2) {
		let [t, n] = e;
		return {
			url: vV(t),
			method: _V(n, "method") ? String(n.method).toUpperCase() : aF(t) && _V(t, "method") ? String(t.method).toUpperCase() : "GET"
		};
	}
	let t = e[0];
	return {
		url: vV(t),
		method: _V(t, "method") ? String(t.method).toUpperCase() : "GET"
	};
}
function bV(e) {
	let [t, n] = e;
	try {
		if (typeof n == "object" && n && "headers" in n && n.headers) return new Headers(n.headers);
		if (aF(t)) return new Headers(t.headers);
	} catch {}
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/breadcrumb-log-level.js
function xV(e) {
	if (e !== void 0) {
		if (e >= 400 && e < 500) return "warning";
		if (e >= 500) return "error";
	}
}
//#endregion
//#region node_modules/@sentry/browser-utils/build/esm/debug-build.js
var SV = typeof __SENTRY_DEBUG__ > "u" || __SENTRY_DEBUG__, Q = X, CV = 80, wV = {};
try {
	typeof Node < "u" && (wV.parentNode = Object.getOwnPropertyDescriptor(Node.prototype, "parentNode").get), typeof Element < "u" && (wV.tagName = Object.getOwnPropertyDescriptor(Element.prototype, "tagName").get, wV.id = Object.getOwnPropertyDescriptor(Element.prototype, "id").get, wV.className = Object.getOwnPropertyDescriptor(Element.prototype, "className").get, wV.getAttribute = Element.prototype.getAttribute), typeof HTMLElement < "u" && (wV.dataset = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "dataset").get);
} catch {}
function TV(e, t, n) {
	let r = wV[t];
	if (r) try {
		return r.call(e, n);
	} catch {}
	let i = e[t];
	return typeof i == "function" ? i.call(e, n) : i;
}
function EV(e, t = {}) {
	if (!e) return "<unknown>";
	try {
		let n = e, r = [], i = 0, a = 0, o, s = Array.isArray(t) ? t : t.keyAttrs, c = !Array.isArray(t) && t.maxStringLength || CV;
		for (; n && i++ < 5 && (o = DV(n, s), !(o === "html" || i > 1 && a + r.length * 3 + o.length >= c));) r.push(o), a += o.length, n = TV(n, "parentNode");
		return r.reverse().join(" > ");
	} catch {
		return "<unknown>";
	}
}
function DV(e, t) {
	let n = [], r = TV(e, "tagName");
	if (!r) return "";
	if (typeof HTMLElement < "u" && e instanceof HTMLElement) {
		let t = TV(e, "dataset");
		if (t) {
			if (t.sentryComponent) return t.sentryComponent;
			if (t.sentryElement) return t.sentryElement;
		}
	}
	n.push(r.toLowerCase());
	let i = t?.length ? t.filter((t) => TV(e, "getAttribute", t)).map((t) => [t, TV(e, "getAttribute", t)]) : null;
	if (i?.length) i.forEach((e) => {
		n.push(`[${e[0]}="${e[1]}"]`);
	});
	else {
		let t = TV(e, "id");
		t && n.push(`#${t}`);
		let r = TV(e, "className");
		if (r && XP(r)) {
			let e = r.split(/\s+/);
			for (let t of e) n.push(`.${t}`);
		}
	}
	for (let t of [
		"aria-label",
		"type",
		"name",
		"title",
		"alt"
	]) {
		let r = TV(e, "getAttribute", t);
		r && n.push(`[${t}="${r}"]`);
	}
	return n.join("");
}
//#endregion
//#region node_modules/@sentry/browser-utils/build/esm/web-vitals/utils.js
function OV(e, t, n) {
	Q.document && Q.addEventListener(e, t, n);
}
function kV(e, t, n) {
	Q.document && Q.removeEventListener(e, t, n);
}
var AV = (e) => {
	let t = Q.requestIdleCallback || Q.setTimeout;
	if (Q.document?.visibilityState === "hidden") e();
	else {
		let n = !1, r = () => {
			n ||= (e(), !0);
		};
		OV("visibilitychange", r, {
			once: !0,
			capture: !0
		}), t(() => {
			r(), kV("visibilitychange", r, { capture: !0 });
		});
	}
};
//#endregion
//#region node_modules/@sentry/browser-utils/build/esm/component-name.js
function jV(e, t = 5) {
	if (!X.HTMLElement) return null;
	let n = e;
	for (let e = 0; e < t; e++) {
		if (!n) return null;
		if (n instanceof HTMLElement) {
			if (n.dataset.sentryComponent) return n.dataset.sentryComponent;
			if (n.dataset.sentryElement) return n.dataset.sentryElement;
		}
		n = n.parentNode;
	}
	return null;
}
//#endregion
//#region node_modules/@sentry/browser-utils/build/esm/getLocationHref.js
function MV() {
	try {
		return Q.document?.location.href ?? "";
	} catch {
		return "";
	}
}
//#endregion
//#region node_modules/@sentry/browser-utils/build/esm/instrumentation/dom.js
var NV = 1e3, PV, FV, IV;
function LV(e) {
	FP("dom", e), IP("dom", RV);
}
function RV() {
	if (!Q.document) return;
	let e = LP.bind(null, "dom"), t = VV(e, !0);
	Q.document.addEventListener("click", t, !1), Q.document.addEventListener("keypress", t, !1), ["EventTarget", "Node"].forEach((t) => {
		let n = Q[t]?.prototype;
		n?.hasOwnProperty?.("addEventListener") && (oF(n, "addEventListener", function(t) {
			return function(n, r, i) {
				if (n === "click" || n == "keypress") try {
					let r = this.__sentry_instrumentation_handlers__ = this.__sentry_instrumentation_handlers__ || {}, a = r[n] = r[n] || { refCount: 0 };
					if (!a.handler) {
						let r = VV(e);
						a.handler = r, t.call(this, n, r, i);
					}
					a.refCount++;
				} catch {}
				return t.call(this, n, r, i);
			};
		}), oF(n, "removeEventListener", function(e) {
			return function(t, n, r) {
				if (t === "click" || t == "keypress") try {
					let n = this.__sentry_instrumentation_handlers__ || {}, i = n[t];
					i && (i.refCount--, i.refCount <= 0 && (e.call(this, t, i.handler, r), i.handler = void 0, delete n[t]), Object.keys(n).length === 0 && delete this.__sentry_instrumentation_handlers__);
				} catch {}
				return e.call(this, t, n, r);
			};
		}));
	});
}
function zV(e) {
	if (e.type !== FV) return !1;
	try {
		if (!e.target || e.target._sentryId !== IV) return !1;
	} catch {}
	return !0;
}
function BV(e, t) {
	return e === "keypress" ? !t?.tagName || !(t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable) : !1;
}
function VV(e, t = !1) {
	return (n) => {
		if (!n || n._sentryCaptured) return;
		let r = HV(n);
		if (BV(n.type, r)) return;
		sF(n, "_sentryCaptured", !0), r && !r._sentryId && sF(r, "_sentryId", RF());
		let i = n.type === "keypress" ? "input" : n.type;
		zV(n) || (e({
			event: n,
			name: i,
			global: t
		}), FV = n.type, IV = r ? r._sentryId : void 0), clearTimeout(PV), PV = Q.setTimeout(() => {
			IV = void 0, FV = void 0;
		}, NV);
	};
}
function HV(e) {
	try {
		return e.target;
	} catch {
		return null;
	}
}
//#endregion
//#region node_modules/@sentry/browser-utils/build/esm/instrumentation/history.js
var UV;
function WV() {
	return "history" in Q && !!Q.history;
}
function GV(e) {
	let t = "history";
	FP(t, e), IP(t, KV);
}
function KV() {
	if (Q.addEventListener("popstate", () => {
		let e = Q.location.href, t = UV;
		UV = e, t !== e && LP("history", {
			from: t,
			to: e
		});
	}), !WV()) return;
	function e(e) {
		return function(...t) {
			let n = t.length > 2 ? t[2] : void 0;
			if (n) {
				let r = UV, i = qV(String(n));
				if (UV = i, r === i) return e.apply(this, t);
				LP("history", {
					from: r,
					to: i
				});
			}
			return e.apply(this, t);
		};
	}
	oF(Q.history, "pushState", e), oF(Q.history, "replaceState", e);
}
function qV(e) {
	try {
		return new URL(e, Q.location.origin).toString();
	} catch {
		return e;
	}
}
//#endregion
//#region node_modules/@sentry/browser-utils/build/esm/getNativeImplementation.js
var JV = {};
function YV(e) {
	let t = JV[e];
	if (t) return t;
	let n = Q[e];
	if (pV(n)) return JV[e] = n.bind(Q);
	let r = Q.document;
	if (r && typeof r.createElement == "function") try {
		let t = r.createElement("iframe");
		t.hidden = !0, r.head.appendChild(t);
		let i = t.contentWindow;
		i?.[e] && (n = i[e]), r.head.removeChild(t);
	} catch (t) {
		SV && Z.warn(`Could not create sandbox iframe for ${e} check, bailing to window.${e}: `, t);
	}
	return n && (JV[e] = n.bind(Q));
}
function XV(e) {
	JV[e] = void 0;
}
//#endregion
//#region node_modules/@sentry/browser-utils/build/esm/instrumentation/xhr.js
var ZV = "__sentry_xhr_v3__";
function QV(e) {
	FP("xhr", e), IP("xhr", $V);
}
function $V() {
	if (!Q.XMLHttpRequest) return;
	let e = XMLHttpRequest.prototype;
	e.open = new Proxy(e.open, { apply(e, t, n) {
		let r = /* @__PURE__ */ Error(), i = ZF() * 1e3, a = XP(n[0]) ? n[0].toUpperCase() : void 0, o = eH(n[1]);
		if (!a || !o) return e.apply(t, n);
		t[ZV] = {
			method: a,
			url: o,
			request_headers: {}
		}, a === "POST" && o.match(/sentry_key/) && (t.__sentry_own_request__ = !0);
		let s = () => {
			let e = t[ZV];
			if (e && t.readyState === 4) {
				try {
					e.status_code = t.status;
				} catch {}
				LP("xhr", {
					endTimestamp: ZF() * 1e3,
					startTimestamp: i,
					xhr: t,
					virtualError: r
				}), r = void 0, t.removeEventListener("readystatechange", s);
			}
		};
		return "onreadystatechange" in t && typeof t.onreadystatechange == "function" ? t.onreadystatechange = new Proxy(t.onreadystatechange, { apply(e, t, n) {
			return s(), e.apply(t, n);
		} }) : t.addEventListener("readystatechange", s), t.setRequestHeader = new Proxy(t.setRequestHeader, { apply(e, t, n) {
			let [r, i] = n, a = t[ZV];
			return a && XP(r) && XP(i) && (a.request_headers[r.toLowerCase()] = i), e.apply(t, n);
		} }), e.apply(t, n);
	} }), e.send = new Proxy(e.send, { apply(e, t, n) {
		let r = t[ZV];
		return r ? (n[0] !== void 0 && (r.body = n[0]), LP("xhr", {
			startTimestamp: ZF() * 1e3,
			xhr: t
		}), e.apply(t, n)) : e.apply(t, n);
	} });
}
function eH(e) {
	if (XP(e)) return e;
	try {
		return e.toString();
	} catch {}
}
//#endregion
//#region node_modules/@sentry/browser-utils/build/esm/is.js
function tH(e) {
	if (typeof Element > "u") return !1;
	try {
		return e instanceof Element;
	} catch {
		return !1;
	}
}
//#endregion
//#region node_modules/@sentry/browser/build/npm/esm/prod/helpers.js
var $ = X, nH = 0, rH = [];
function iH(e) {
	if (nH > 0) return !0;
	let t = e ? rH.findIndex((t) => aH(t, e)) : -1;
	return t !== -1 && (rH.splice(t, 1), !0);
}
function aH(e, t) {
	return e.msg === t.msg && e.url === t.url && e.line === t.line && e.column === t.column;
}
function oH() {
	nH++, setTimeout(() => {
		nH--;
	});
}
function sH(e, t = {}) {
	function n(e) {
		return typeof e == "function";
	}
	if (!n(e)) return e;
	try {
		if (Object.prototype.hasOwnProperty.call(e, "__sentry_wrapped__")) {
			let t = e.__sentry_wrapped__;
			return typeof t == "function" ? t : e;
		}
		if (lF(e)) return e;
	} catch {
		return e;
	}
	let r = function(...n) {
		X._sentryWrappedDepth = (X._sentryWrappedDepth || 0) + 1;
		try {
			let r = n.map((e) => sH(e, t));
			return e.apply(this, r);
		} catch (e) {
			throw oH(), AI((r) => {
				r.addEventProcessor((e) => (t.mechanism && (VF(e, void 0, void 0), HF(e, t.mechanism)), e.extra = {
					...e.extra,
					arguments: n
				}, e)), rz(e);
			}), e;
		} finally {
			X._sentryWrappedDepth = (X._sentryWrappedDepth || 0) - 1;
		}
	};
	try {
		for (let t in e) Object.prototype.hasOwnProperty.call(e, t) && (r[t] = e[t]);
	} catch {}
	cF(r, e), sF(e, "__sentry_wrapped__", r);
	try {
		Object.getOwnPropertyDescriptor(r, "name").configurable && Object.defineProperty(r, "name", { get() {
			return e.name;
		} });
	} catch {}
	return r;
}
function cH() {
	let e = MV(), { referrer: t } = $.document || {}, { userAgent: n } = $.navigator || {};
	return {
		url: e,
		headers: {
			...t && { Referer: t },
			...n && { "User-Agent": n }
		}
	};
}
//#endregion
//#region node_modules/@sentry/browser/build/npm/esm/prod/eventbuilder.js
function lH(e, t) {
	let n = fH(e, t), r = {
		type: _H(t),
		value: vH(t)
	};
	return n.length && (r.stacktrace = { frames: n }), r.type === void 0 && r.value === "" && (r.value = "Unrecoverable error caught"), r;
}
function uH(e, t, n, r) {
	let i = jI()?.getOptions().normalizeDepth, a = TH(t), o = { __serialized__: wF(t, i) };
	if (a) return {
		exception: { values: [lH(e, a)] },
		extra: o
	};
	let s = {
		exception: { values: [{
			type: tF(t) ? t.constructor.name : r ? "UnhandledRejection" : "Error",
			value: CH(t, { isUnhandledRejection: r })
		}] },
		extra: o
	};
	if (n) {
		let t = fH(e, n);
		t.length && (s.exception.values[0].stacktrace = { frames: t });
	}
	return s;
}
function dH(e, t) {
	return { exception: { values: [lH(e, t)] } };
}
function fH(e, t) {
	let n = t.stacktrace || t.stack || "", r = mH(t), i = hH(t);
	try {
		return e(n, r, i);
	} catch {}
	return [];
}
var pH = /Minified React error #\d+;/i;
function mH(e) {
	return e && pH.test(e.message) ? 1 : 0;
}
function hH(e) {
	return typeof e.framesToPop == "number" ? e.framesToPop : 0;
}
function gH(e) {
	return typeof WebAssembly < "u" && WebAssembly.Exception !== void 0 && e instanceof WebAssembly.Exception;
}
function _H(e) {
	let t = e?.name;
	return !t && gH(e) ? e.message && Array.isArray(e.message) && e.message.length == 2 ? e.message[0] : "WebAssembly.Exception" : t;
}
function vH(e) {
	let t = e?.message;
	return gH(e) ? Array.isArray(e.message) && e.message.length == 2 ? e.message[1] : "wasm exception" : t ? t.error && typeof t.error.message == "string" ? WB(t.error) : WB(e) : "No error message";
}
function yH(e, t, n, r) {
	let i = xH(e, t, n?.syntheticException || void 0, r);
	return HF(i), i.level = "error", n?.event_id && (i.event_id = n.event_id), IR(i);
}
function bH(e, t, n = "info", r, i) {
	let a = SH(e, t, r?.syntheticException || void 0, i);
	return a.level = n, r?.event_id && (a.event_id = r.event_id), IR(a);
}
function xH(e, t, n, r, i) {
	let a;
	if (qP(t) && t.error) return dH(e, t.error);
	if (JP(t) || YP(t)) {
		let i = t;
		if ("stack" in t) {
			a = dH(e, t);
			let i = a.exception?.values?.[0];
			if (r && n && i && !i.stacktrace) {
				let t = fH(e, n);
				t.length && (i.stacktrace = { frames: t }, HF(a, { synthetic: !0 }));
			}
		} else {
			let t = i.name || (JP(i) ? "DOMError" : "DOMException"), o = i.message ? `${t}: ${i.message}` : t;
			a = SH(e, o, n, r), VF(a, o);
		}
		return a;
	}
	if (GP(t)) return dH(e, t);
	if ($P(t) || tF(t)) return a = uH(e, t, n, i), HF(a, { synthetic: !0 }), a;
	let o = String(t);
	return a = SH(e, o, n, r), VF(a, o, void 0), HF(a, { synthetic: !0 }), a;
}
function SH(e, t, n, r) {
	let i = {};
	if (r && n) {
		let r = fH(e, n);
		r.length && (i.exception = { values: [{
			value: t,
			stacktrace: { frames: r }
		}] }), HF(i, { synthetic: !0 });
	}
	if (ZP(t)) {
		let { __sentry_template_string__: e, __sentry_template_values__: n } = t;
		return i.logentry = {
			message: e,
			params: n
		}, i;
	}
	return i.message = t, i;
}
function CH(e, { isUnhandledRejection: t }) {
	let n = fF(e), r = t ? "promise rejection" : "exception";
	return qP(e) ? `Event \`ErrorEvent\` captured as ${r} with message \`${e.message}\`` : tF(e) ? `Event \`${wH(e)}\` (type=${e.type}) captured as ${r}` : `Object captured as ${r} with keys: ${n}`;
}
function wH(e) {
	try {
		let t = Object.getPrototypeOf(e);
		return t ? t.constructor.name : void 0;
	} catch {}
}
function TH(e) {
	return Object.values(e).find(GP);
}
//#endregion
//#region node_modules/@sentry/browser/build/npm/esm/prod/client.js
var EH = class extends Zz {
	constructor(e) {
		let t = DH(e);
		bB(t, "browser", ["browser"], $.SENTRY_SDK_SOURCE || SR()), super(t), this._unhandledSessionStatus = "unhandled";
		let { userInfo: n } = this.getDataCollectionOptions();
		t._metadata?.sdk && (t._metadata.sdk.settings = {
			infer_ip: n ? "auto" : "never",
			...t._metadata.sdk.settings
		});
		let { sendClientReports: r } = this._options;
		$.document && $.document.addEventListener("visibilitychange", () => {
			$.document.visibilityState === "hidden" && (r && this._flushOutcomes(), queueMicrotask(() => {
				this.flush();
			}));
		}), n && this.on("beforeSendSession", yB);
	}
	eventFromException(e, t) {
		return yH(this._options.stackParser, e, t, this._options.attachStacktrace);
	}
	eventFromMessage(e, t = "info", n) {
		return bH(this._options.stackParser, e, t, n, this._options.attachStacktrace);
	}
	_prepareEvent(e, t, n, r) {
		return e.platform = e.platform || "javascript", super._prepareEvent(e, t, n, r);
	}
};
function DH(e) {
	return {
		release: typeof __SENTRY_RELEASE__ == "string" ? __SENTRY_RELEASE__ : $.SENTRY_RELEASE?.id,
		sendClientReports: !0,
		parentSpanIsAlwaysRootSpan: !0,
		...e
	};
}
//#endregion
//#region node_modules/@sentry/browser/build/npm/esm/prod/transports/fetch.js
var OH = 40;
function kH(e, t = YV("fetch")) {
	let n = 0, r = 0;
	async function i(i) {
		let a = i.body.length;
		n += a, r++;
		let o = {
			body: i.body,
			method: "POST",
			referrerPolicy: "strict-origin",
			headers: e.headers,
			keepalive: n <= 6e4 && r < 15,
			...e.fetchOptions
		};
		try {
			let n = await t(e.url, o);
			return {
				statusCode: n.status,
				headers: {
					"x-sentry-rate-limits": n.headers.get("X-Sentry-Rate-Limits"),
					"retry-after": n.headers.get("Retry-After")
				}
			};
		} catch (e) {
			throw XV("fetch"), e;
		} finally {
			n -= a, r--;
		}
	}
	return jz(e, i, Tz(e.bufferSize || OH));
}
//#endregion
//#region node_modules/@sentry/browser/build/npm/esm/prod/debug-build.js
var AH = typeof __SENTRY_DEBUG__ > "u" || __SENTRY_DEBUG__, jH = 30, MH = 50;
function NH(e, t, n, r) {
	let i = {
		filename: e,
		function: t === "<anonymous>" ? "?" : t,
		in_app: !0
	};
	return n !== void 0 && (i.lineno = n), r !== void 0 && (i.colno = r), i;
}
var PH = /^\s*at (\S+?)(?::(\d+))(?::(\d+))\s*$/i, FH = /^\s*at (?:(.+?\)(?: \[.+\])?|.*?) ?\((?:address at )?)?(?:async )?((?:<anonymous>|[-a-z]+:|.*bundle|\/)?.*?)(?::(\d+))?(?::(\d+))?\)?\s*$/i, IH = /\((\S*)(?::(\d+))(?::(\d+))\)/, LH = /at (.+?) ?\(data:(.+?),/, RH = [jH, (e) => {
	let t = e.match(LH);
	if (t) return {
		filename: `<data:${t[2]}>`,
		function: t[1]
	};
	let n = PH.exec(e);
	if (n) {
		let [, e, t, r] = n;
		return NH(e, "?", +t, +r);
	}
	let r = FH.exec(e);
	if (r) {
		if (r[2]?.indexOf("eval") === 0) {
			let e = IH.exec(r[2]);
			e && (r[2] = e[1], r[3] = e[2], r[4] = e[3]);
		}
		let [e, t] = HH(r[1] || "?", r[2]);
		return NH(t, e, r[3] ? +r[3] : void 0, r[4] ? +r[4] : void 0);
	}
}], zH = /^\s*(.*?)(?:\((.*?)\))?(?:^|@)?((?:[-a-z]+)?:\/.*?|\[native code\]|[^@]*(?:bundle|\d+\.js)|\/[\w\-. /=]+)(?::(\d+))?(?::(\d+))?\s*$/i, BH = /(\S+) line (\d+)(?: > eval line \d+)* > eval/i, VH = EP(RH, [MH, (e) => {
	let t = zH.exec(e);
	if (t) {
		if (t[3] && t[3].indexOf(" > eval") > -1) {
			let e = BH.exec(t[3]);
			e && (t[1] = t[1] || "eval", t[3] = e[1], t[4] = e[2], t[5] = "");
		}
		let e = t[3], n = t[1] || "?";
		return [n, e] = HH(n, e), NH(e, n, t[4] ? +t[4] : void 0, t[5] ? +t[5] : void 0);
	}
}]), HH = (e, t) => {
	let n = e.indexOf("safari-extension") !== -1, r = e.indexOf("safari-web-extension") !== -1;
	return n || r ? [e.indexOf("@") === -1 ? "?" : e.split("@")[0], n ? `safari-extension:${t}` : `safari-web-extension:${t}`] : [e, t];
}, UH = 1024, WH = "Breadcrumbs", GH = FL(((e = {}) => {
	let t = {
		dom: !0,
		fetch: !0,
		history: !0,
		sentry: !0,
		xhr: !0,
		...e
	};
	return {
		name: WH,
		setup(e) {
			t.dom && LV(qH(e, t.dom)), t.xhr && QV(JH(e)), t.fetch && hV(YH(e)), t.history && GV(XH(e)), t.sentry && e.on("beforeSendEvent", KH(e));
		}
	};
}));
function KH(e) {
	return function(t) {
		jI() === e && SB({
			category: `sentry.${t.type === "transaction" ? "transaction" : "event"}`,
			event_id: t.event_id,
			level: t.level,
			message: BF(t)
		}, { event: t });
	};
}
function qH(e, t) {
	return function(n) {
		if (jI() !== e) return;
		let r, i, a = typeof t == "object" ? t.serializeAttribute : void 0, o = typeof t == "object" && typeof t.maxStringLength == "number" ? t.maxStringLength : void 0;
		o && o > UH && (AH && Z.warn(`\`dom.maxStringLength\` cannot exceed ${UH}, but a value of ${o} was configured. Sentry will use ${UH} instead.`), o = UH), typeof a == "string" && (a = [a]);
		try {
			let e = n.event, t = ZH(e) ? e.target : e;
			r = EV(t, {
				keyAttrs: a,
				maxStringLength: o
			}), i = jV(t);
		} catch {
			r = "<unknown>";
		}
		if (r.length === 0) return;
		let s = {
			category: `ui.${n.name}`,
			message: r
		};
		i && (s.data = { "ui.component_name": i }), SB(s, {
			event: n.event,
			name: n.name,
			global: n.global
		});
	};
}
function JH(e) {
	return function(t) {
		if (jI() !== e) return;
		let { startTimestamp: n, endTimestamp: r } = t, i = t.xhr[ZV];
		if (!n || !r || !i) return;
		let { method: a, url: o, status_code: s, body: c } = i, l = {
			method: a,
			url: o,
			status_code: s
		}, u = {
			xhr: t.xhr,
			input: c,
			startTimestamp: n,
			endTimestamp: r
		}, d = {
			category: "xhr",
			data: l,
			type: "http",
			level: xV(s)
		};
		e.emit("beforeOutgoingRequestBreadcrumb", d, u), SB(d, u);
	};
}
function YH(e) {
	return function(t) {
		if (jI() !== e) return;
		let { startTimestamp: n, endTimestamp: r } = t;
		if (r && !(t.fetchData.url.match(/sentry_key/) && t.fetchData.method === "POST")) {
			if (t.error) {
				let i = {
					data: t.error,
					input: t.args,
					startTimestamp: n,
					endTimestamp: r
				}, a = {
					category: "fetch",
					data: t.fetchData,
					level: "error",
					type: "http"
				};
				e.emit("beforeOutgoingRequestBreadcrumb", a, i), SB(a, i);
			} else {
				let i = t.response, a = {
					...t.fetchData,
					status_code: i?.status
				}, o = {
					input: t.args,
					response: i,
					startTimestamp: n,
					endTimestamp: r
				}, s = {
					category: "fetch",
					data: a,
					type: "http",
					level: xV(a.status_code)
				};
				e.emit("beforeOutgoingRequestBreadcrumb", s, o), SB(s, o);
			}
		}
	};
}
function XH(e) {
	return function(t) {
		if (jI() !== e) return;
		let n = t.from, r = t.to, i = _B($.location.href), a = n ? _B(n) : void 0, o = _B(r);
		a?.path || (a = i), i.protocol === o.protocol && i.host === o.host && (r = o.relative), i.protocol === a.protocol && i.host === a.host && (n = a.relative), SB({
			category: "navigation",
			data: {
				from: n,
				to: r
			}
		});
	};
}
function ZH(e) {
	return !!e && !!e.target;
}
//#endregion
//#region node_modules/@sentry/browser/build/npm/esm/prod/integrations/browserapierrors.js
var QH = "EventTarget,Window,Node,ApplicationCache,AudioTrackList,BroadcastChannel,ChannelMergerNode,CryptoOperation,EventSource,FileReader,HTMLUnknownElement,IDBDatabase,IDBRequest,IDBTransaction,KeyOperation,MediaController,MessagePort,ModalWindow,Notification,SVGElementInstance,Screen,SharedWorker,TextTrack,TextTrackCue,TextTrackList,WebSocket,WebSocketWorker,Worker,XMLHttpRequest,XMLHttpRequestEventTarget,XMLHttpRequestUpload".split(","), $H = "BrowserApiErrors", eU = FL(((e = {}) => {
	let t = {
		XMLHttpRequest: !0,
		eventTarget: !0,
		requestAnimationFrame: !0,
		setInterval: !0,
		setTimeout: !0,
		unregisterOriginalCallbacks: !1,
		...e
	};
	return {
		name: $H,
		setupOnce() {
			t.setTimeout && oF($, "setTimeout", tU), t.setInterval && oF($, "setInterval", tU), t.requestAnimationFrame && oF($, "requestAnimationFrame", nU), t.XMLHttpRequest && "XMLHttpRequest" in $ && oF(XMLHttpRequest.prototype, "send", rU);
			let e = t.eventTarget;
			e && (Array.isArray(e) ? e : QH).forEach((e) => iU(e, t));
		}
	};
}));
function tU(e) {
	return function(...t) {
		let n = t[0];
		return t[0] = sH(n, { mechanism: {
			handled: !1,
			type: `auto.browser.browserapierrors.${jP(e)}`
		} }), e.apply(this, t);
	};
}
function nU(e) {
	return function(t) {
		return e.apply(this, [sH(t, { mechanism: {
			data: { handler: jP(e) },
			handled: !1,
			type: "auto.browser.browserapierrors.requestAnimationFrame"
		} })]);
	};
}
function rU(e) {
	return function(...t) {
		let n = this;
		return [
			"onload",
			"onerror",
			"onprogress",
			"onreadystatechange"
		].forEach((e) => {
			e in n && typeof n[e] == "function" && oF(n, e, function(t) {
				let n = { mechanism: {
					data: { handler: jP(t) },
					handled: !1,
					type: `auto.browser.browserapierrors.xhr.${e}`
				} }, r = lF(t);
				return r && (n.mechanism.data.handler = jP(r)), sH(t, n);
			});
		}), e.apply(this, t);
	};
}
function iU(e, t) {
	let n = $[e]?.prototype;
	n?.hasOwnProperty?.("addEventListener") && (oF(n, "addEventListener", function(n) {
		return function(r, i, a) {
			try {
				aU(i) && (i.handleEvent = sH(i.handleEvent, { mechanism: {
					data: {
						handler: jP(i),
						target: e
					},
					handled: !1,
					type: "auto.browser.browserapierrors.handleEvent"
				} }));
			} catch {}
			return t.unregisterOriginalCallbacks && oU(this, r, i), n.apply(this, [
				r,
				sH(i, { mechanism: {
					data: {
						handler: jP(i),
						target: e
					},
					handled: !1,
					type: "auto.browser.browserapierrors.addEventListener"
				} }),
				a
			]);
		};
	}), oF(n, "removeEventListener", function(e) {
		return function(t, n, r) {
			try {
				if (Object.prototype.hasOwnProperty.call(n, "__sentry_wrapped__")) {
					let i = n.__sentry_wrapped__;
					i && e.call(this, t, i, r);
				}
			} catch {}
			return e.call(this, t, n, r);
		};
	}));
}
function aU(e) {
	return typeof e.handleEvent == "function";
}
function oU(e, t, n) {
	e && typeof e == "object" && "removeEventListener" in e && typeof e.removeEventListener == "function" && e.removeEventListener(t, n);
}
//#endregion
//#region node_modules/@sentry/browser/build/npm/esm/prod/integrations/browsersession.js
var sU = FL((e = {}) => {
	let t = e.lifecycle ?? "page";
	return {
		name: "BrowserSession",
		setupOnce() {
			if ($.document === void 0) {
				AH && Z.warn("Using the `browserSessionIntegration` in non-browser environments is not supported.");
				return;
			}
			az({ ignoreDuration: !0 });
			let e = !1;
			AV(() => {
				e ||= (cz(), !0);
			});
			let n = OI(), r = n.getUser();
			n.addScopeListener((t) => {
				let n = t.getUser();
				(r?.id !== n?.id || r?.ip_address !== n?.ip_address) && (r = n, e && cz());
			}), t === "route" && GV(({ from: t, to: n }) => {
				t !== n && (az({ ignoreDuration: !0 }), cz(), e = !0);
			});
		}
	};
}), cU = "CultureContext", lU = FL((() => ({
	name: cU,
	preprocessEvent(e) {
		let t = uU();
		t && (e.contexts = {
			...e.contexts,
			culture: {
				...t,
				...e.contexts?.culture
			}
		});
	},
	processSegmentSpan(e) {
		let t = uU();
		t && iR(e, {
			"culture.locale": t.locale,
			"culture.timezone": t.timezone,
			"culture.calendar": t.calendar
		});
	}
})));
function uU() {
	try {
		let e = $.Intl;
		if (!e) return;
		let t = e.DateTimeFormat().resolvedOptions();
		return {
			locale: t.locale,
			timezone: t.timeZone,
			calendar: t.calendar
		};
	} catch {
		return;
	}
}
//#endregion
//#region node_modules/@sentry/browser/build/npm/esm/prod/integrations/globalhandlers.js
var dU = "GlobalHandlers", fU = FL(((e = {}) => {
	let t = {
		onerror: !0,
		onunhandledrejection: !0,
		...e
	};
	return {
		name: dU,
		setupOnce() {
			Error.stackTraceLimit = 50;
		},
		setup(e) {
			t.onerror && (pU(e), vU("onerror")), t.onunhandledrejection && (mU(e), vU("onunhandledrejection"));
		}
	};
}));
function pU(e) {
	zP((t) => {
		let { stackParser: n, attachStacktrace: r } = yU();
		if (jI() !== e || iH(t)) return;
		let { msg: i, url: a, line: o, column: s, error: c } = t, l = _U(xH(n, c || i, void 0, r, !1), a, o, s);
		l.level = "error", iz(l, {
			originalException: c,
			mechanism: {
				handled: !1,
				type: "auto.browser.global_handlers.onerror"
			}
		});
	});
}
function mU(e) {
	HP((t) => {
		let { stackParser: n, attachStacktrace: r } = yU();
		if (jI() !== e || iH()) return;
		let i = hU(t), a = QP(i) ? gU(i) : xH(n, i, void 0, r, !0);
		a.level = "error", iz(a, {
			originalException: i,
			mechanism: {
				handled: !1,
				type: "auto.browser.global_handlers.onunhandledrejection"
			}
		});
	});
}
function hU(e) {
	if (QP(e)) return e;
	try {
		if ("reason" in e) return e.reason;
		if ("detail" in e && "reason" in e.detail) return e.detail.reason;
	} catch {}
	return e;
}
function gU(e) {
	return { exception: { values: [{
		type: "UnhandledRejection",
		value: `Non-Error promise rejection captured with value: ${String(e)}`
	}] } };
}
function _U(e, t, n, r) {
	let i = e.exception = e.exception || {}, a = i.values = i.values || [], o = a[0] = a[0] || {}, s = o.stacktrace = o.stacktrace || {}, c = s.frames = s.frames || [];
	return c.length === 0 && c.push({
		colno: r,
		lineno: n,
		filename: bU(t) ?? MV(),
		function: "?",
		in_app: !0
	}), e;
}
function vU(e) {
	AH && Z.log(`Global Handler attached: ${e}`);
}
function yU() {
	return jI()?.getOptions() || {
		stackParser: () => [],
		attachStacktrace: !1
	};
}
function bU(e) {
	if (XP(e) && e.length !== 0) return e.startsWith("data:") ? `<${vB(e, !1)}>` : e;
}
//#endregion
//#region node_modules/@sentry/browser/build/npm/esm/prod/integrations/httpcontext.js
var xU = FL(() => ({
	name: "HttpContext",
	preprocessEvent(e, t, n) {
		if (!$.navigator && !$.location && !$.document) return;
		let { url: r, headers: i } = cH(), a = n.getDataCollectionOptions().httpHeaders.request, o = Object.entries(e.request?.headers ?? {}).filter(([e]) => !(e in i)), s = {
			...fB(i, a),
			...Object.fromEntries(o)
		};
		e.request = {
			url: r,
			...e.request,
			...Object.keys(s).length > 0 ? { headers: s } : { headers: void 0 }
		};
	},
	processSpan(e, t) {
		if (!$.navigator && !$.location && !$.document) return;
		let n = cH(), r = fB(n.headers, t.getDataCollectionOptions().httpHeaders.request), i = r.Referer, { hostname: a, protocol: o } = $.location || {};
		iR(e, {
			[PI]: r["User-Agent"],
			"sentry.is_localhost": o === "file:" || a === "localhost" || a === "127.0.0.1" || a === "[::1]" || !!a?.endsWith(".localhost"),
			...e.is_segment && {
				"url.full": e.attributes?.["sentry.op"] === "http.client" ? void 0 : gB(n.url),
				"http.request.header.referer": i ? [i] : void 0
			}
		});
	}
})), SU = "cause", CU = 5, wU = "LinkedErrors", TU = FL(((e = {}) => {
	let t = e.limit || CU, n = e.key || SU;
	return {
		name: wU,
		preprocessEvent(e, r, i) {
			RB(lH, i.getOptions().stackParser, n, t, e, r);
		}
	};
})), EU = /^HTML(\w*)Element$/;
function DU(e) {
	if (typeof window < "u" && e === window) return "[Window]";
	if (typeof document < "u" && e === document) return "[Document]";
	if (tH(e)) {
		let t = OU(e);
		if (EU.test(t)) return `[HTMLElement: ${EV(e)}]`;
	}
}
function OU(e) {
	let t = Object.getPrototypeOf(e);
	return t?.constructor ? t.constructor.name : "null prototype";
}
//#endregion
//#region node_modules/@sentry/browser/build/npm/esm/prod/utils/detectBrowserExtension.js
function kU() {
	return AU() ? (AH && mP(() => {
		console.error("[Sentry] You cannot use Sentry.init() in a browser extension, see: https://docs.sentry.io/platforms/javascript/best-practices/browser-extensions/");
	}), !0) : !1;
}
function AU() {
	if ($.window === void 0) return !1;
	let e = $;
	if (e.nw || !(e.chrome || e.browser)?.runtime?.id) return !1;
	let t = MV();
	return !($ === $.top && /^(?:chrome-extension|moz-extension|ms-browser-extension|safari-web-extension):\/\//.test(t));
}
//#endregion
//#region node_modules/@sentry/browser/build/npm/esm/prod/sdk.js
function jU(e) {
	return [
		OB(),
		TB(),
		uV(),
		eU(),
		GH(),
		oV(),
		fU(),
		TU(),
		QB(),
		xU(),
		lU(),
		sU()
	];
}
function MU(e = {}) {
	let t = !e.skipBrowserExtensionCheck && kU(), n = e.defaultIntegrations == null ? jU() : e.defaultIntegrations, r = jL({
		integrations: e.integrations,
		defaultIntegrations: n
	}), i = {
		...e,
		enabled: !t && e.enabled,
		stackParser: DP(e.stackParser || VH),
		integrations: r,
		transport: e.transport || kH
	};
	return SF(DU), oB(EH, i);
}
var NU = new class {
	initialized = !1;
	latencyBuffer = [];
	init() {
		if (!(this.initialized || typeof window > "u")) {
			try {
				MU({
					dsn: "https://placeholder@sentry.io/4500000000",
					enabled: !1,
					integrations: [],
					tracesSampleRate: .1
				});
			} catch (e) {
				console.warn("[Observability] Sentry init gracefully bypassed:", e);
			}
			window.addEventListener("unhandledrejection", (e) => {
				this.captureError(e.reason, { context: "unhandled_promise_rejection" });
			}), window.addEventListener("error", (e) => {
				this.captureError(e.error || e.message, {
					context: "window_error",
					filename: e.filename
				});
			}), this.initialized = !0;
		}
	}
	captureError(e, t) {
		let n = {
			message: e instanceof Error ? e.message : String(e),
			stack: e instanceof Error ? e.stack : void 0,
			metadata: t || {},
			timestamp: Date.now(),
			url: typeof window < "u" ? window.location.href : ""
		};
		console.error("[Observability Error Report]:", n);
	}
	recordLatency(e) {
		this.latencyBuffer.push(e), this.latencyBuffer.length > 50 && this.latencyBuffer.shift();
	}
	getAverageLatency() {
		if (this.latencyBuffer.length === 0) return 24;
		let e = this.latencyBuffer.reduce((e, t) => e + t, 0);
		return Math.round(e / this.latencyBuffer.length);
	}
}(), PU = class {
	value;
	next;
	constructor(e) {
		this.value = e;
	}
}, FU = class {
	#e;
	#t;
	#n;
	constructor() {
		this.clear();
	}
	enqueue(e) {
		let t = new PU(e);
		this.#e ? (this.#t.next = t, this.#t = t) : (this.#e = t, this.#t = t), this.#n++;
	}
	dequeue() {
		let e = this.#e;
		if (e) return this.#e = this.#e.next, this.#n--, this.#e || (this.#t = void 0), e.value;
	}
	peek() {
		if (this.#e) return this.#e.value;
	}
	clear() {
		this.#e = void 0, this.#t = void 0, this.#n = 0;
	}
	get size() {
		return this.#n;
	}
	*[Symbol.iterator]() {
		let e = this.#e;
		for (; e;) yield e.value, e = e.next;
	}
	*drain() {
		for (; this.#e;) yield this.dequeue();
	}
};
//#endregion
//#region node_modules/p-limit/index.js
function IU(e) {
	let t = !1;
	if (typeof e == "object" && ({concurrency: e, rejectOnClear: t = !1} = e), LU(e), typeof t != "boolean") throw TypeError("Expected `rejectOnClear` to be a boolean");
	let n = new FU(), r = 0, i = () => {
		r < e && n.size > 0 && (r++, n.dequeue().run());
	}, a = () => {
		r--, i();
	}, o = async (e, t, n) => {
		let r = (async () => e(...n))();
		t(r);
		try {
			await r;
		} catch {}
		a();
	}, s = (t, a, s, c) => {
		let l = { reject: s };
		new Promise((e) => {
			l.run = e, n.enqueue(l);
		}).then(o.bind(void 0, t, a, c)), r < e && i();
	}, c = (e, ...t) => new Promise((n, r) => {
		s(e, n, r, t);
	});
	return Object.defineProperties(c, {
		activeCount: { get: () => r },
		pendingCount: { get: () => n.size },
		clearQueue: { value() {
			if (!t) {
				n.clear();
				return;
			}
			let e = AbortSignal.abort().reason;
			for (; n.size > 0;) n.dequeue().reject(e);
		} },
		concurrency: {
			get: () => e,
			set(t) {
				LU(t), e = t, queueMicrotask(() => {
					for (; r < e && n.size > 0;) i();
				});
			}
		},
		map: { async value(e, t) {
			let n = [];
			try {
				Array.from(e, (e, r) => {
					let i = c(t, e, r);
					return n.push(i), i;
				});
			} catch (e) {
				for (let e of n) e.catch(() => {});
				throw e;
			}
			return Promise.all(n);
		} }
	}), c;
}
function LU(e) {
	if (!((Number.isInteger(e) || e === Infinity) && e > 0)) throw TypeError("Expected `concurrency` to be a number from 1 and up");
}
//#endregion
//#region src/media/uploadManager.ts
var RU = IU(3), zU = class {
	static defaultMaxSizes = {
		users: 15728640,
		posts: 52428800,
		stories: 52428800,
		reels: 104857600,
		chats: 31457280,
		groups: 31457280,
		communities: 31457280,
		assets: 15728640
	};
	static async uploadMedia(e, t) {
		return RU(async () => {
			let n = nw().currentUser;
			if (!n) throw Error("يجب تسجيل الدخول أولاً لرفع الوسائط.");
			let r = e.type || "application/octet-stream";
			if (t.allowedMimeTypes && t.allowedMimeTypes.length > 0 && !t.allowedMimeTypes.some((e) => e.endsWith("/*") ? r.startsWith(e.replace("/*", "")) : r === e)) throw Error(`نوع الملف (${r}) غير مدعوم.`);
			let i = t.maxSizeBytes || this.defaultMaxSizes[t.path] || 26214400;
			if (e.size > i) {
				let e = Math.round(i / 1048576);
				throw Error(`حجم الملف يتجاوز الحد المسموح به (${e} ميجابايت).`);
			}
			let a = Date.now(), o = Math.random().toString(36).substring(2, 9), s = e instanceof File && e.name.includes(".") ? e.name.split(".").pop()?.toLowerCase() || "bin" : r.split("/")[1] || "bin", c = t.customFileName || `${a}_${o}.${s}`, l = `${t.path}/${n.uid}/${c}`;
			if (t.path === "chats" || t.path === "groups" || t.path === "communities") {
				let e = t.subFolder || "general";
				l = `${t.path}/${e}/${n.uid}/${c}`;
			}
			let u = gx(rw(), l), d = 3, f = null;
			for (; d > 0;) try {
				return await new Promise((n, i) => {
					let a = mx(u, e, {
						contentType: r,
						cacheControl: "public, max-age=31536000"
					});
					a.on("state_changed", (e) => {
						let n = Math.round(e.bytesTransferred / e.totalBytes * 100);
						t.onProgress && t.onProgress({
							bytesTransferred: e.bytesTransferred,
							totalBytes: e.totalBytes,
							percentage: n,
							state: e.state
						});
					}, (e) => {
						i(e);
					}, async () => {
						try {
							n(await hx(a.snapshot.ref));
						} catch (e) {
							i(e);
						}
					});
				});
			} catch (e) {
				f = e, d--, d > 0 && await new Promise((e) => setTimeout(e, (4 - d) * 1e3));
			}
			throw NU.captureError(f, {
				context: "media_upload_failed",
				path: l
			}), Error("فشل رفع الملف إلى السحابة. يرجى التحقق من اتصال الإنترنت والمحاولة ثانية.");
		});
	}
	static createPreviewURL(e) {
		let t = URL.createObjectURL(e);
		return {
			url: t,
			revoke: () => URL.revokeObjectURL(t)
		};
	}
}, BU = new class {
	activeListeners = /* @__PURE__ */ new Map();
	cursorMap = /* @__PURE__ */ new Map();
	subscribe(e, t, n, r) {
		this.activeListeners.has(e) && (this.activeListeners.get(e)(), this.activeListeners.delete(e));
		let i = (e) => {
			let t = [];
			e.forEach((e) => {
				t.push({
					id: e.id,
					...e.data()
				});
			}), n(t);
		}, a = (t) => {
			NU.captureError(t, {
				context: "sync_listener_error",
				key: e
			}), r && r(t);
		}, o = typeof window < "u" ? window.RTSM : null;
		if (o && typeof o.subscribe == "function") try {
			let n = t(), r = o.subscribe({
				id: "core:" + e,
				ref: n,
				next: i,
				error: a
			}), s = () => {
				try {
					r();
				} catch {}
			};
			return this.activeListeners.set(e, s), s;
		} catch (t) {
			NU.captureError(t, {
				context: "sync_setup_exception_host",
				key: e
			});
		}
		try {
			let n = ty(t(), i, a);
			return this.activeListeners.set(e, n), () => {
				n(), this.activeListeners.delete(e);
			};
		} catch (t) {
			return NU.captureError(t, {
				context: "sync_setup_exception",
				key: e
			}), () => {};
		}
	}
	unsubscribeAll() {
		this.activeListeners.forEach((e) => {
			try {
				e();
			} catch {}
		}), this.activeListeners.clear(), this.cursorMap.clear();
	}
	async loadPage(e, t = "createdAt", n = "desc", r = 20, i, a) {
		let o = performance.now();
		try {
			let s = q_(tw(), e), c = i && a !== void 0 ? kv(s, jv(i, "==", a), Pv(t, n), Iv(r)) : kv(s, Pv(t, n), Iv(r)), l = `${e}_${i || "all"}`, u = this.cursorMap.get(l);
			u && (c = i && a !== void 0 ? kv(s, jv(i, "==", a), Pv(t, n), Rv(u), Iv(r)) : kv(s, Pv(t, n), Rv(u), Iv(r)));
			let d = await Qv(c), f = [];
			return d.forEach((e) => {
				f.push({
					id: e.id,
					...e.data()
				});
			}), d.empty || this.cursorMap.set(l, d.docs[d.docs.length - 1]), NU.recordLatency(Math.round(performance.now() - o)), {
				items: f,
				hasMore: d.docs.length >= r
			};
		} catch (t) {
			throw NU.captureError(t, {
				context: "load_page_failed",
				collectionName: e
			}), t;
		}
	}
	resetPagination(e) {
		e ? Array.from(this.cursorMap.keys()).filter((t) => t.startsWith(e)).forEach((e) => this.cursorMap.delete(e)) : this.cursorMap.clear();
	}
	async optimisticWrite(e, t, n, r, i, a = null) {
		r({
			id: t,
			...n,
			updatedAt: Date.now()
		});
		try {
			await $v(J_(tw(), e, t), {
				...n,
				updatedAt: iy()
			}, { merge: !0 });
		} catch (n) {
			throw i(a), NU.captureError(n, {
				context: "optimistic_write_failed",
				collectionName: e,
				docId: t
			}), n;
		}
	}
}(), VU = new class e {
	static L1_MAX_ITEMS = 150;
	l1MemoryCache = /* @__PURE__ */ new Map();
	currentUserId = null;
	setCurrentUser(e) {
		this.currentUserId !== e && (this.clearUserCache(), this.currentUserId = e);
	}
	set(t, n, r = 3e5, i = !1) {
		if (this.l1MemoryCache.size >= e.L1_MAX_ITEMS) {
			let e = this.l1MemoryCache.keys().next().value;
			e && this.l1MemoryCache.delete(e);
		}
		this.l1MemoryCache.set(t, {
			data: n,
			timestamp: Date.now(),
			ttlMs: r,
			userId: i && this.currentUserId || void 0
		});
	}
	get(e) {
		let t = this.l1MemoryCache.get(e);
		return t ? Date.now() - t.timestamp > t.ttlMs ? (this.l1MemoryCache.delete(e), null) : t.userId && t.userId !== this.currentUserId ? null : t.data : null;
	}
	clearUserCache() {
		Array.from(this.l1MemoryCache.entries()).forEach(([e, t]) => {
			t.userId && this.l1MemoryCache.delete(e);
		});
	}
	clearAll() {
		this.l1MemoryCache.clear();
	}
}(), HU = 7776e6, UU = "animeblack_fcm_last_token", WU = class {
	static get vapidKey() {
		let e = XC.vapidPublicKey;
		return typeof e == "string" ? e.trim() : "";
	}
	static isConfigured() {
		let e = [];
		return this.vapidKey || e.push("vapidPublicKey في firebase-applet-config.json (Web Push certificate من إعدادات Cloud Messaging)"), typeof window < "u" && !("serviceWorker" in navigator) && e.push("serviceWorker"), typeof window < "u" && !("Notification" in window) && e.push("Notification API"), {
			configured: e.length === 0,
			missing: e
		};
	}
	static async requestPermissionAndRegisterToken() {
		if (typeof window > "u" || !("Notification" in window)) return {
			ok: !1,
			token: null,
			reason: "notifications-not-supported"
		};
		let e = this.isConfigured();
		!e.configured && !this.vapidKey && console.warn("[FCM] إعداد غير مكتمل — المفقود:", e.missing.join("، "));
		try {
			let e = await Notification.requestPermission();
			if (e !== "granted") return {
				ok: !1,
				token: null,
				reason: "permission-" + e
			};
			let t = await ow();
			if (!t) return {
				ok: !1,
				token: null,
				reason: "messaging-unavailable"
			};
			let n = { serviceWorkerRegistration: await navigator.serviceWorker.ready };
			this.vapidKey && (n.vapidKey = this.vapidKey);
			let r = await qC(t, n);
			if (!r) return {
				ok: !1,
				token: null,
				reason: "no-token"
			};
			let i = nw().currentUser;
			return i?.uid ? (await this.registerDeviceToken(i.uid, r), {
				ok: !0,
				token: r
			}) : {
				ok: !1,
				token: r,
				reason: "not-signed-in"
			};
		} catch (e) {
			return NU.captureError(e, { context: "fcm_token_registration_failed" }), {
				ok: !1,
				token: null,
				reason: e?.message || "registration-failed"
			};
		}
	}
	static async registerDeviceToken(e, t) {
		let n = tw(), r = Date.now();
		await $v(J_(n, "users", e, "devices", t), {
			platform: this.detectPlatform(),
			userAgent: (typeof navigator < "u" && navigator.userAgent || "").slice(0, 200),
			createdAt: r,
			lastActive: r
		}, { merge: !0 });
		try {
			let r = localStorage.getItem(UU);
			r && r !== t && await ey(J_(n, "users", e, "devices", r)).catch(() => void 0), localStorage.setItem(UU, t);
		} catch {}
		this.cleanupStaleDevices(e).catch(() => void 0);
	}
	static async cleanupStaleDevices(e) {
		let t = tw(), n = Date.now() - HU, r = await Qv(kv(q_(t, "users", e, "devices"), jv("lastActive", "<", n))), i = 0;
		for (let e of r.docs) await ey(e.ref).catch(() => void 0), i++;
		return i;
	}
	static async touchDeviceActivity(e, t) {
		await $v(J_(tw(), "users", e, "devices", t), { lastActive: Date.now() }, { merge: !0 }).catch(() => void 0);
	}
	static watchTokenRefresh() {
		if (typeof window > "u") return null;
		let e = !1, t = async () => {
			if (!e) try {
				let e = await ow();
				if (!e) return;
				let t = localStorage.getItem(UU), n = { serviceWorkerRegistration: await navigator.serviceWorker.ready };
				this.vapidKey && (n.vapidKey = this.vapidKey);
				let r = await qC(e, n);
				if (r && r !== t) {
					let e = nw().currentUser;
					e?.uid && await this.registerDeviceToken(e.uid, r), console.log("[FCM] أُعيد تسجيل توكن الجهاز بعد تجدده");
				}
			} catch (e) {
				NU.captureError(e, { context: "fcm_token_refresh_check" });
			}
		}, n = () => {
			t();
		};
		window.addEventListener("focus", n, { passive: !0 });
		let r = setInterval(t, 432e5);
		return t(), () => {
			e = !0, window.removeEventListener("focus", n), clearInterval(r);
		};
	}
	static async revokeCurrentToken() {
		try {
			let e = await ow();
			if (!e) return !1;
			let t = await JC(e);
			if (t) try {
				localStorage.removeItem(UU);
			} catch {}
			return t;
		} catch (e) {
			return NU.captureError(e, { context: "fcm_token_revoke" }), !1;
		}
	}
	static async initForegroundListener(e) {
		try {
			let t = await ow();
			return t ? YC(t, (t) => e(t)) : null;
		} catch (e) {
			return console.warn("[FCM] Foreground listener init skipped:", e), null;
		}
	}
	static detectPlatform() {
		if (typeof navigator > "u") return "unknown";
		let e = navigator.userAgent;
		return /android/i.test(e) ? "android" : /iphone|ipad|ipod/i.test(e) ? "ios" : /windows/i.test(e) ? "windows" : /macintosh/i.test(e) ? "mac" : /linux/i.test(e) ? "linux" : "web";
	}
};
//#endregion
//#region src/admin/metricsCollector.ts
function GU(e) {
	let t = e || {}, n = String(t.code || "").replace(/^firestore\//, "").replace(/^auth\//, ""), r = String(t.message || "");
	return n === "unauthenticated" || n === "requires-recent-login" ? "AUTH_ERROR" : n === "permission-denied" ? "PERMISSION_DENIED" : n === "resource-exhausted" ? "RATE_LIMITED" : n === "deadline-exceeded" || n === "timeout" ? "TIMEOUT" : n === "unavailable" || n === "internal" || n === "aborted" ? "SERVER_ERROR" : /client is offline|network.*(?:failed|error)|failed to fetch|network-error|err_(?:internet|network|name_not_resolved)|ENOTFOUND|ECONNREFUSED|ECONNRESET/i.test(r) || n === "unavailable" && /offline/i.test(r) ? (typeof navigator < "u" && navigator.onLine, "OFFLINE") : /unauthenticated|user.*not.*signed|invalid.*token|credential/i.test(r) ? "AUTH_ERROR" : /permission|not authorized|insufficient permissions/i.test(r) ? "PERMISSION_DENIED" : /timeout|timed out|deadline exceeded/i.test(r) ? "TIMEOUT" : /resource exhausted|quota|rate limit|too many requests/i.test(r) ? "RATE_LIMITED" : /unavailable|internal error|server error|502|503|504/i.test(r) ? "SERVER_ERROR" : "UNKNOWN";
}
var KU = class {
	static async measureLiveMetrics() {
		let e = performance.now(), t = "UNKNOWN", n = null;
		try {
			await Zv(J_(tw(), "test", "connection"));
			let n = Math.round(performance.now() - e);
			return NU.recordLatency(n), t = n > 600 ? "LATENCY_WARNING" : "CONNECTED", {
				pingLatencyMs: n,
				firestoreConnection: t,
				timestamp: Date.now(),
				errorCode: null
			};
		} catch (r) {
			let i = Math.round(performance.now() - e);
			return t = GU(r), n = r && r.code || null, (t === "PERMISSION_DENIED" || t === "AUTH_ERROR" || t === "RATE_LIMITED") && NU.recordLatency(i), {
				pingLatencyMs: i,
				firestoreConnection: t,
				timestamp: Date.now(),
				errorCode: n
			};
		}
	}
};
SN({
	id: wN([K(), J()]),
	title: SN({
		romaji: K().optional(),
		english: K().optional().nullable(),
		native: K().optional().nullable(),
		userPreferred: K().optional()
	}),
	coverImage: SN({
		extraLarge: K().optional().nullable(),
		large: K().optional().nullable(),
		medium: K().optional().nullable()
	}),
	bannerImage: K().optional().nullable(),
	description: K().optional().nullable(),
	format: K().optional().nullable(),
	status: K().optional().nullable(),
	episodes: J().optional().nullable(),
	duration: J().optional().nullable(),
	genres: bN(K()).default([]),
	averageScore: J().optional().nullable(),
	popularity: J().optional().nullable(),
	seasonYear: J().optional().nullable(),
	season: K().optional().nullable(),
	source: K().optional().nullable(),
	provider: ON([
		"anilist",
		"jikan",
		"cache"
	])
}), SN({
	id: wN([K(), J()]),
	name: SN({
		full: K(),
		native: K().optional().nullable()
	}),
	image: SN({
		large: K().optional().nullable(),
		medium: K().optional().nullable()
	}),
	role: K().optional().nullable(),
	description: K().optional().nullable()
});
var qU = /* @__PURE__ */ new Map(), JU = 6e5;
function YU(e) {
	let t = qU.get(e);
	return t ? Date.now() > t.expires ? (qU.delete(e), null) : t.data : null;
}
function XU(e, t) {
	qU.size > 200 && Array.from(qU.keys()).slice(0, 50).forEach((e) => qU.delete(e)), qU.set(e, {
		data: t,
		expires: Date.now() + JU
	});
}
var ZU = class {
	endpoint = "https://graphql.anilist.co";
	async searchAnime(e, t = 1, n = 20) {
		let r = `anilist:search:${e}:${t}:${n}`, i = YU(r);
		if (i) return i;
		let a = await fetch(this.endpoint, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json"
			},
			body: JSON.stringify({
				query: "\n      query ($search: String, $page: Int, $perPage: Int) {\n        Page (page: $page, perPage: $perPage) {\n          pageInfo {\n            hasNextPage\n            total\n          }\n          media (search: $search, type: ANIME, sort: POPULARITY_DESC) {\n            id\n            title {\n              romaji\n              english\n              native\n              userPreferred\n            }\n            coverImage {\n              extraLarge\n              large\n              medium\n            }\n            bannerImage\n            description(asHtml: false)\n            format\n            status\n            episodes\n            duration\n            genres\n            averageScore\n            popularity\n            seasonYear\n            season\n            source\n          }\n        }\n      }\n    ",
				variables: {
					search: e,
					page: t,
					perPage: n
				}
			})
		});
		if (!a.ok) throw Error(`AniList API responded with status ${a.status}`);
		let o = (await a.json()).data?.Page, s = (o?.media || []).map((e) => ({
			...e,
			provider: "anilist"
		})), c = {
			page: t,
			hasNextPage: !!o?.pageInfo?.hasNextPage,
			total: o?.pageInfo?.total,
			items: s,
			provider: "anilist"
		};
		return XU(r, c), c;
	}
	async getAnimeDetails(e) {
		let t = `anilist:details:${e}`, n = YU(t);
		if (n) return n;
		let r = await fetch(this.endpoint, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json"
			},
			body: JSON.stringify({
				query: "\n      query ($id: Int) {\n        Media (id: $id, type: ANIME) {\n          id\n          title {\n            romaji\n            english\n            native\n            userPreferred\n          }\n          coverImage {\n            extraLarge\n            large\n            medium\n          }\n          bannerImage\n          description(asHtml: false)\n          format\n          status\n          episodes\n          duration\n          genres\n          averageScore\n          popularity\n          seasonYear\n          season\n          source\n        }\n      }\n    ",
				variables: { id: Number(e) }
			})
		});
		if (!r.ok) return null;
		let i = (await r.json()).data?.Media;
		if (!i) return null;
		let a = {
			...i,
			provider: "anilist"
		};
		return XU(t, a), a;
	}
	async getTrending(e = 1, t = 20) {
		let n = `anilist:trending:${e}:${t}`, r = YU(n);
		if (r) return r;
		let i = await fetch(this.endpoint, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json"
			},
			body: JSON.stringify({
				query: "\n      query ($page: Int, $perPage: Int) {\n        Page (page: $page, perPage: $perPage) {\n          pageInfo {\n            hasNextPage\n            total\n          }\n          media (type: ANIME, sort: TRENDING_DESC) {\n            id\n            title {\n              romaji\n              english\n              native\n              userPreferred\n            }\n            coverImage {\n              extraLarge\n              large\n              medium\n            }\n            bannerImage\n            description(asHtml: false)\n            format\n            status\n            episodes\n            duration\n            genres\n            averageScore\n            popularity\n            seasonYear\n            season\n            source\n          }\n        }\n      }\n    ",
				variables: {
					page: e,
					perPage: t
				}
			})
		});
		if (!i.ok) throw Error(`AniList API trending failed with status ${i.status}`);
		let a = (await i.json()).data?.Page, o = (a?.media || []).map((e) => ({
			...e,
			provider: "anilist"
		})), s = {
			page: e,
			hasNextPage: !!a?.pageInfo?.hasNextPage,
			total: a?.pageInfo?.total,
			items: o,
			provider: "anilist"
		};
		return XU(n, s), s;
	}
	async getCharacters(e) {
		let t = `anilist:characters:${e}`, n = YU(t);
		if (n) return n;
		let r = await fetch(this.endpoint, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json"
			},
			body: JSON.stringify({
				query: "\n      query ($id: Int) {\n        Media (id: $id, type: ANIME) {\n          characters (sort: ROLE, perPage: 25) {\n            edges {\n              role\n              node {\n                id\n                name {\n                  full\n                  native\n                }\n                image {\n                  large\n                  medium\n                }\n                description\n              }\n            }\n          }\n        }\n      }\n    ",
				variables: { id: Number(e) }
			})
		});
		if (!r.ok) return [];
		let i = ((await r.json()).data?.Media?.characters?.edges || []).map((e) => ({
			id: e.node.id,
			name: e.node.name,
			image: e.node.image,
			role: e.role,
			description: e.node.description
		}));
		return XU(t, i), i;
	}
}, QU = class {
	baseUrl = "https://api.jikan.moe/v4";
	async searchAnime(e, t = 1, n = 20) {
		let r = `jikan:search:${e}:${t}:${n}`, i = YU(r);
		if (i) return i;
		let a = `${this.baseUrl}/anime?q=${encodeURIComponent(e)}&page=${t}&limit=${n}`, o = await fetch(a);
		if (!o.ok) throw Error(`Jikan API search failed with status ${o.status}`);
		let s = await o.json(), c = (s.data || []).map((e) => ({
			id: e.mal_id,
			title: {
				romaji: e.title,
				english: e.title_english,
				native: e.title_japanese,
				userPreferred: e.title
			},
			coverImage: {
				extraLarge: e.images?.webp?.large_image_url || e.images?.jpg?.large_image_url,
				large: e.images?.webp?.image_url || e.images?.jpg?.image_url,
				medium: e.images?.webp?.small_image_url || e.images?.jpg?.small_image_url
			},
			bannerImage: null,
			description: e.synopsis,
			format: e.type,
			status: e.status,
			episodes: e.episodes,
			duration: e.duration && parseInt(e.duration, 10) || null,
			genres: (e.genres || []).map((e) => e.name),
			averageScore: e.score ? Math.round(e.score * 10) : null,
			popularity: e.popularity,
			seasonYear: e.year,
			season: e.season,
			source: e.source,
			provider: "jikan"
		})), l = {
			page: t,
			hasNextPage: !!s.pagination?.has_next_page,
			total: s.pagination?.items?.total,
			items: c,
			provider: "jikan"
		};
		return XU(r, l), l;
	}
	async getAnimeDetails(e) {
		let t = `jikan:details:${e}`, n = YU(t);
		if (n) return n;
		let r = await fetch(`${this.baseUrl}/anime/${e}/full`);
		if (!r.ok) return null;
		let i = (await r.json()).data;
		if (!i) return null;
		let a = {
			id: i.mal_id,
			title: {
				romaji: i.title,
				english: i.title_english,
				native: i.title_japanese,
				userPreferred: i.title
			},
			coverImage: {
				extraLarge: i.images?.webp?.large_image_url || i.images?.jpg?.large_image_url,
				large: i.images?.webp?.image_url || i.images?.jpg?.image_url,
				medium: i.images?.webp?.small_image_url || i.images?.jpg?.small_image_url
			},
			bannerImage: null,
			description: i.synopsis,
			format: i.type,
			status: i.status,
			episodes: i.episodes,
			duration: i.duration && parseInt(i.duration, 10) || null,
			genres: (i.genres || []).map((e) => e.name),
			averageScore: i.score ? Math.round(i.score * 10) : null,
			popularity: i.popularity,
			seasonYear: i.year,
			season: i.season,
			source: i.source,
			provider: "jikan"
		};
		return XU(t, a), a;
	}
	async getTrending(e = 1, t = 20) {
		let n = `jikan:trending:${e}:${t}`, r = YU(n);
		if (r) return r;
		let i = await fetch(`${this.baseUrl}/top/anime?filter=airing&page=${e}&limit=${t}`);
		if (!i.ok) throw Error(`Jikan API trending failed with status ${i.status}`);
		let a = await i.json(), o = (a.data || []).map((e) => ({
			id: e.mal_id,
			title: {
				romaji: e.title,
				english: e.title_english,
				native: e.title_japanese,
				userPreferred: e.title
			},
			coverImage: {
				extraLarge: e.images?.webp?.large_image_url || e.images?.jpg?.large_image_url,
				large: e.images?.webp?.image_url || e.images?.jpg?.image_url,
				medium: e.images?.webp?.small_image_url || e.images?.jpg?.small_image_url
			},
			bannerImage: null,
			description: e.synopsis,
			format: e.type,
			status: e.status,
			episodes: e.episodes,
			duration: e.duration && parseInt(e.duration, 10) || null,
			genres: (e.genres || []).map((e) => e.name),
			averageScore: e.score ? Math.round(e.score * 10) : null,
			popularity: e.popularity,
			seasonYear: e.year,
			season: e.season,
			source: e.source,
			provider: "jikan"
		})), s = {
			page: e,
			hasNextPage: !!a.pagination?.has_next_page,
			total: a.pagination?.items?.total,
			items: o,
			provider: "jikan"
		};
		return XU(n, s), s;
	}
	async getCharacters(e) {
		let t = `jikan:characters:${e}`, n = YU(t);
		if (n) return n;
		let r = await fetch(`${this.baseUrl}/anime/${e}/characters`);
		if (!r.ok) return [];
		let i = ((await r.json()).data || []).slice(0, 25).map((e) => ({
			id: e.character.mal_id,
			name: {
				full: e.character.name,
				native: null
			},
			image: {
				large: e.character.images?.webp?.image_url || e.character.images?.jpg?.image_url,
				medium: e.character.images?.jpg?.small_image_url
			},
			role: e.role,
			description: null
		}));
		return XU(t, i), i;
	}
}, $U = new class {
	anilist = new ZU();
	jikan = new QU();
	async searchAnime(e, t = 1, n = 20) {
		if (!e || !e.trim()) return {
			page: 1,
			hasNextPage: !1,
			items: [],
			provider: "none"
		};
		try {
			return await this.anilist.searchAnime(e.trim(), t, n);
		} catch (r) {
			console.warn("AniList search failed, switching to Jikan fallback:", r.message);
			try {
				return await this.jikan.searchAnime(e.trim(), t, n);
			} catch (e) {
				return console.error("Both anime metadata providers failed:", e.message), {
					page: t,
					hasNextPage: !1,
					items: [],
					provider: "failed"
				};
			}
		}
	}
	async getAnimeDetails(e) {
		try {
			let t = await this.anilist.getAnimeDetails(e);
			if (t) return t;
		} catch (e) {
			console.warn("AniList details failed:", e.message);
		}
		try {
			return await this.jikan.getAnimeDetails(e);
		} catch (e) {
			return console.error("Jikan details failed:", e.message), null;
		}
	}
	async getTrending(e = 1, t = 20) {
		try {
			return await this.anilist.getTrending(e, t);
		} catch (n) {
			console.warn("AniList trending failed, switching to Jikan:", n.message);
			try {
				return await this.jikan.getTrending(e, t);
			} catch (t) {
				return console.error("Both trending providers failed:", t.message), {
					page: e,
					hasNextPage: !1,
					items: [],
					provider: "failed"
				};
			}
		}
	}
	async getCharacters(e) {
		try {
			let t = await this.anilist.getCharacters(e);
			if (t.length > 0) return t;
		} catch (e) {
			console.warn("AniList characters failed:", e.message);
		}
		try {
			return await this.jikan.getCharacters(e);
		} catch (e) {
			return console.error("Jikan characters failed:", e.message), [];
		}
	}
}(), eW = class {
	static call(e, t) {
		let n = globalThis.__callCloudFunction;
		return typeof n == "function" ? n(e, t).then((e) => e.data) : Promise.reject(Object.assign(/* @__PURE__ */ Error("economy bridge unavailable"), { economyFailure: "bridge-unavailable" }));
	}
	static adjust(e) {
		return this.call("economyAdjust", {
			op: "adjust",
			currency: e.currency,
			amount: e.amount,
			reason: e.reason || "",
			idempotencyKey: e.idempotencyKey || void 0
		});
	}
	static transfer(e) {
		return this.call("economyTransfer", {
			op: "transfer",
			currency: e.currency,
			amount: e.amount,
			toUid: e.toUid,
			note: e.note || "",
			idempotencyKey: e.idempotencyKey || void 0
		});
	}
	static classifyFailure(e) {
		let t = e || {};
		if (t.economyFailure) return t.economyFailure;
		let n = String(t.code || "");
		return n.includes("unauthenticated") ? "unauthenticated" : n.includes("not-found") || n.includes("unavailable") || n.includes("functions") ? "not-deployed" : n.includes("failed-precondition") || String(t.message || "").includes("insufficient") ? "insufficient-funds" : n.includes("invalid-argument") ? "invalid-request" : n.includes("network") || n.includes("fetch") ? "network" : "unknown";
	}
};
NU.init(), typeof window < "u" && (window.AnimeBlackCore = {
	firebaseConfig: XC,
	getFirebaseRuntime: ew,
	getDb: tw,
	getAuth: nw,
	getStorage: rw,
	getApp: iw,
	getGoogleProvider: aw,
	getMessagingSafe: ow,
	sanitizeHTML: nP,
	sanitizePlainText: rP,
	UserProfileSchema: iP,
	PostCreateSchema: aP,
	ChatMessageSchema: oP,
	observability: NU,
	MediaUploadManager: zU,
	syncEngine: BU,
	cacheManager: VU,
	FCMNotificationManager: WU,
	MetricsCollector: KU,
	animeService: $U,
	AniListProvider: ZU,
	JikanProvider: QU
});
//#endregion
export { ZU as AniListProvider, oP as ChatMessageSchema, eW as EconomyClient, WU as FCMNotificationManager, QU as JikanProvider, zU as MediaUploadManager, KU as MetricsCollector, aP as PostCreateSchema, iP as UserProfileSchema, $U as animeService, VU as cacheManager, XC as firebaseConfig, iw as getApp, nw as getAuth, tw as getDb, ew as getFirebaseRuntime, aw as getGoogleProvider, ow as getMessagingSafe, rw as getStorage, NU as observability, nP as sanitizeHTML, rP as sanitizePlainText, BU as syncEngine };
