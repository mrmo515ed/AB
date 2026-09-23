# PR2 — Production Hardening Report (Anime Black)

**Branch:** `arena/01a0cea9-ab` (continues PR #1) · **Date:** 2026-09-23
**Scope:** Realtime lifecycle hardening · Firestore/Storage security · Economy server authority · FCM · PWA update safety · CI

> **الملخص التنفيذي (عربي):** تم تحصين طبقة المزامنة اللحظية (هوية المستمع بصمة استعلام كاملة + حاجز أمان بلا إخلاء صامت + طابور آمن + إيقاف/استئناف)، وتشديد قواعد Firestore وStorage (منع تعديل اقتصاد أي مستخدم من العميل نهائياً + عضوية فعلية للمحادثات/القروبات/المكالمات)، ونقل سلطة الاقتصاد إلى دوال سحابية موثوقة (معاملات + منع إعادة تشغيل)، وإصلاح تصنيف الاتصال، وإكمال FCM، وأمان تحديث PWA، وإضافة CI. **105/105 اختباراً ناجحاً.** الاختبار الحقيقي A→B ضد Firebase لم يُنفَّذ في بيئة الفحص لأن الشبكة الخارجية محجوبة — أُضيف له عدّاد تشخيص وقائمة تحقق على جهازين، ولا يُدَّعى نجاحه هنا.

---

## 1) Files added

| File | Purpose |
|---|---|
| `functions/package.json`, `functions/tsconfig.json` | Trusted backend package (Cloud Functions v2, Node 20) |
| `functions/src/index.ts` | economyAdjust / economyTransfer / grantReward (admin) / onChatMessageCreated / onGroupMessageCreated (FCM push) / cleanupStaleCalls / cleanupStaleDevices / getChatMediaUrl (signed URL with membership check) |
| `functions/src/economyValidation.ts` | Pure validation + delta/level math (imported by vitest directly) |
| `src/economy/economyClient.ts` | Typed client over the callable bridge (exported from `AnimeBlackCore`) |
| `tests/rtm_v2.test.ts` | 15 tests: fingerprints, guardrail/queue, pause/resume, owner lifecycle, diagnostics completeness, account isolation |
| `tests/hardening_rules.test.ts` | 21 tests: static verification of hardened rules + no-client-economy-writes + pure economy logic |
| `tests/connectivity.test.ts` | 17 tests: full connectivity classification matrix |
| `.github/workflows/ci.yml` | CI: install → typecheck → lint → unit → build (+ artifact) → functions build → e2e (Playwright/Chromium) |

## 2) Files modified

- `rtm.js` — v2 manager (details §4) + `rtm.d.ts` (new types/APIs).
- `index.html` — bridge fingerprinting/owner/guardrail events; economy client rewiring; `memberUids` maintenance; protected-fields strip in `syncUserStateToServer`; syncDiag upgrade + A→B checklist card.
- `firestore.rules` — hardened (§6). `storage.rules` — hardened (§7).
- `src/admin/metricsCollector.ts` — real classification (§8).
- `src/notifications/fcmManager.ts` — device registry, refresh watch, revoke, honest config check.
- `src/index.ts` — exports `EconomyClient`.
- `sw.js` — cache `v7.4-hardening`, `SKIP_WAITING` message channel, `GET_VERSION`, push tag dedup.
- `firebase.json` — `functions` deploy config.
- `firebase-applet-config.json` — added `vapidPublicKey` (empty = explicitly missing).
- `package.json`/`package-lock.json` — root unchanged except lock refresh; `functions/package-lock.json` added.

## 3) Files removed

**None.** No working feature, page, route, ID, or event was removed (verified by full test suite).

## 4) Realtime changes (Phase 1)

- **Query fingerprint identity:** listener id = hash(path + filters(sorted) + orderBy + limit + startAt/endAt + collectionGroup + owner + purpose). **Different queries on the same path no longer replace each other** (was: path-only id → silent mutual replacement — root cause of lost listeners).
- **Guardrail, not eviction:** at `maxListeners` (64) the new subscription is **queued** (bounded `maxQueue` 32). `guardrail_reached`/`guardrail_rejected` events carry exact owner/path/reason/cap and surface as a rate-limited toast + syncDiag. **No legitimate active listener is ever killed.**
- **Lifecycle:** `pause/resume(id)`, `pauseOwner/resumeOwner(owner)` (paused listeners free cap seats), `teardownOwner(owner)` (feature-scoped teardown incl. queued), scoped teardown on logout/account-switch **also purges queued user subscriptions**.
- **Recovery preserved:** exponential backoff + full jitter, permanent-failure slow retry forever, heartbeat, network/resume/auth/backend-online recovery.
- **Diagnostics:** every listener exposes `status, createdAt, lastSnapshotAt, lastError, retryCount, unsubState, fingerprint, owner, purpose, uid, queuedAt`; stats add `queueLength, guardrailHits, listenerCap, activeCount`; `getQueue()`.
- **Bridge:** every `onSnapshot` routes through the manager with `describeQuery(ref)` (defensive extraction of Firestore v10 internals) + inferred owner from path. Failure/guardrail events: console.error + toast + syncDiag refresh (never console.warn-only).

## 5) Firebase changes

- SDK remains unified CDN 10.10.0 (single instance, named DB `ai-studio-…` + fallback rescue unchanged).
- Bridge exposes `getFunctions`/`httpsCallable`/`arrayUnion`/`arrayRemove` + `__callCloudFunction`.
- No competing listener systems: verified 0 raw `onSnapshot` outside the manager (only the documented fallback when rtm.js fails to load).

## 6) Firestore rule changes (Phase 3 + 6)

- **Users:** peer updates limited to social keys only — **`coins/wallet/stars/reputation` removed from the peer allowlist** (any signed-in user could previously write another user's economy). Owner updates cannot touch protected keys (`coins, wallet, stars, xp, xpNext, level, points, reputation, roles, premium, entitlements, balance`).
- **Chats:** message **create now requires participant membership** in addition to `senderId == auth.uid`.
- **Groups:** read by visibility (`privacy != خاص` → public; private → real membership via `memberUids` or owner); messages read/create with membership (legacy docs without `memberUids` keep working — data safety); owner/admin fields protected.
- **Communities/channels:** restricted communities enforce membership via `memberUids`; public remain public; admin fields protected.
- **Calls (Phase 6):** participant-only read/create/update/delete + `signals` subcollection with sender identity — no arbitrary callId access.
- **Economy collections:** `economy_transactions` + `economy_idempotency` are **server-write-only** (`allow write: if false` — Admin SDK bypasses rules); read limited to involved parties.
- Default deny retained; role escalation guards retained.

## 7) Storage rule changes (Phase 4)

- `/assets/**` — **trusted uploader only** (admin email or server-set `admin`/`appRole` claim). Was: any signed-in user could upload arbitrary app assets.
- Chat/group media: write = path-owner + MIME whitelist (`image/(jpeg|png|webp|gif|avif)`, `video/(mp4|webm|quicktime)`, audio list) + size caps (30MB chat, 50MB posts, 150MB reels) + path-safety (no `..`, length).
- Community media read tightened from **public** to signed-in.
- `users/{uid}/**` upload path (used by post composer) preserved: owner + constraints, public read.
- **Documented limitation:** rules-level participant verification is impossible because the app uses the **named** Firestore database and storage cross-service rules only support `(default)`. Authoritative serving path provided instead: `getChatMediaUrl` callable (membership check + 10-minute signed URL).

## 8) Economy authority (Phase 5) + connectivity (Phase 7)

- Client no longer writes balances anywhere: `addCoins`/`addStars`/`addXP` call `economyAdjust` (server transaction computes delta, returns authoritative balance/levels; client reconciles). `transferCoinsToUser`/`addCoinsTo` call `economyTransfer` (atomic debit+credit) — **on unavailability: honest failure, balance unchanged** (cloud accounts) or explicitly-labeled local demo transfer (no server session).
- `syncUserStateToServer` no longer syncs protected fields.
- Server: idempotency keys (`economy_idempotency`), amount bounds (≤100k, integer), currency allowlist, insufficient-funds rejection, full ledger in `economy_transactions`, admin-only `grantReward`.
- Until functions are deployed the client runs in clearly-marked `local-demo` economy mode (`S.economyMode`, visible in diagnostics) — **no fake success is claimed**.
- `MetricsCollector`: `classifyConnectivityError` maps Firebase codes/messages to `CONNECTED / LATENCY_WARNING / OFFLINE / AUTH_ERROR / PERMISSION_DENIED / SERVER_ERROR / TIMEOUT / RATE_LIMITED / UNKNOWN` — **no error is labeled CONNECTED anymore**; latency recorded only for real server roundtrips.

## 9) FCM (Phase 8)

- Device registry `users/{uid}/devices/{token}` with platform/UA/lastActive (multi-device); old-token deletion on change; 90-day stale cleanup (client best-effort + daily server job); token-refresh watch (v10 modular has no `onTokenRefresh` — focus/12h re-check pattern); `revokeCurrentToken`; foreground listener; background/closed via sw.js push; click routing via `data.url` (`?go=` router).
- Pushes are sent by `onChatMessageCreated`/`onGroupMessageCreated` with `tag/collapseKey` (dedup) and dead-token cleanup.
- **No placeholder credentials:** `vapidPublicKey` is empty in config and reported as missing until set (§17).

## 10) Service worker / PWA (Phase 9)

- Cache version `anime-black-v7.4-hardening` (stale HTML/JS impossible after deploy: network-first documents, SWR assets, old caches deleted on activate).
- `SKIP_WAITING` message channel + `GET_VERSION` handshake for controlled updates.
- Push uses server tag for collapse; renotify disabled.

## 11) Dependencies

Root: unchanged set (firebase 10.10.0 exact; no new runtime deps). Functions package: `firebase-admin ^12.7.0`, `firebase-functions ^6.1.0`, typescript devDep. `functions/package-lock.json` committed.

## 12–14) Tests executed & passed

**105/105 passed** (11 files): anime_provider 2, auth_and_sync 9, media 3, security 3, security_rules 3, server 1, realtime_sync 20 (incl. updated cap test), task3_features 12, rtm_v2 15, hardening_rules 21, connectivity 17.
Typecheck: clean (`tsc --noEmit`, incl. task-3 test fixes). Lint: clean (`eslint src/ server.js tests/ rtm.js`). Functions: `tsc` build clean. Build: `anime-black-core.umd.cjs 605.51 kB │ gzip 188.12 kB` + dist refresh (12 files). Server smoke: `/`, `/manifest.json`, `/rtm.js`, `/sw.js`, `/api/health`, `/dist/anime-black-core.umd.cjs` → all HTTP 200; economy bridge present in served HTML.

## 15) Blocked tests + exact reason

1. **Real Firebase A→B realtime (Phase 2) — NOT executed, NOT claimed.** `curl https://firestore.googleapis.com` → exit 000 (sandbox blocks all external traffic except npm registry). No emulator either (Java/binary downloads blocked). **Instrumentation added instead:** syncDiag live tables (listeners with owner/fingerprint/unsub state, queue, guardrail hits, write log with real error codes, backend canary state) + 12-step A→B checklist card to run on two real devices/accounts.
2. **Real-browser e2e** — Chromium/Playwright downloads are network-blocked in this sandbox; existing e2e are request-level (passing). The CI workflow runs full Playwright on GitHub Actions where network exists.
3. **Rules emulator tests** — Firestore/Storage emulators unavailable (blocked downloads); static rule verification used instead.

## 16) Known remaining problems (honest)

1. `users` docs are publicly readable (app requirement for profiles). Firestore cannot restrict reads per field — **sensitive data must not be stored in the public user doc**; recommended migration to `user_states` (owner-only) or server-only fields.
2. Legacy group docs lack `memberUids` → private-group enforcement activates as `memberUids` accrues (client now writes it on join/leave). No backfill is possible from legacy local ids (`"me"`); a server-side membership rebuild would need a real-uid source.
3. Economy full authority **activates when functions are deployed** (§17). Until then: local-demo mode, clearly marked; transfers to cloud accounts fail honestly.
4. Badges remain owner-writable (cosmetic) — `grantReward` ready for a future server-driven migration.
5. `calls` collection is rules-ready but unused by the client today (calls are local) — cleanup job included.

## 17) Required manual configuration

1. **Deploy functions** (Blaze plan required for Functions): `cd functions && npm install && npm run deploy` (targets named DB `ai-studio-…`; override with `FIRESTORE_DB_ID`).
2. **Deploy rules:** `firebase deploy --only firestore:rules,storage:rules`.
3. **VAPID key:** Firebase Console → Project settings → Cloud Messaging → Web Push certificates → paste public key into `firebase-applet-config.json` → `vapidPublicKey`.
4. *(Optional)* set `admin` custom claim via Admin SDK for trusted asset uploaders.
5. After deploy, verify economy server mode in app → Settings → Sync Diagnostics (`economyMode: server`).

## 18) Exact commands run

`npm install` · `npx tsc --noEmit` · `npx eslint src/ server.js tests/ rtm.js` · `npm test` (vitest run) · `npm run build` · `node --check` on all inline scripts + sw.js + server.js · `node server.js` + curl smoke (6 routes) · `cd functions && npm install && npx tsc --noEmit`.

## 19) Exact build result

`vite build`: 387 modules transformed → `dist/anime-black-core.js` (757 KB) + `dist/anime-black-core.umd.cjs` (**605.51 kB / gzip 188.12 kB**) + asset refresh. Functions `tsc`: clean to `functions/lib` (not committed).

---

**Non-negotiables honored:** no A→B claim without real Firebase (blocked, instrumented, disclosed); no security-completeness claim without unauthorized-access emulator tests (static verification + honest gap list instead); no fabricated evidence; no working feature removed.
