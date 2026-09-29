# Anime Black — Native Android migration

> **ملخص بالعربية:** هذا المجلد يحتوي تطبيق Android أصلياً بالكامل (Kotlin + Jetpack Compose) يحل محل واجهة الويب على
> أندرويد، ويستخدم نفس مشروع Firebase ونفس المجموعات والحقول والقواعد والدوال السحابية دون أي بيانات وهمية أو WebView.
> طريقة البناء، إعداد Firebase وتسجيل الدخول بـ Google، والقيود المعروفة موضحة أدناه.

The web SPA (`index.html`) is untouched. The Android app is a separate Gradle build under `android/`
that uses the Firebase project **animeblackapp-b6223** (Android app
`1:233883926464:android:13747ee836356f1bd21225`, Firestore database `(default)`) with the **same
collections, fields, Storage paths and Cloud Functions contracts** as the web app.
*Note:* the web app still uses its previous Firebase project, so web and Android data are separate
until the web is migrated as well (see `firebase-migration/`).

---

## 1. Build

| Tool | Version |
| --- | --- |
| JDK | 21 (17+ works) |
| Gradle | 9.8.0 (wrapper) |
| Android Gradle Plugin | 9.4.1 (built-in Kotlin) |
| Kotlin / KSP | 2.4.20 / 2.3.12 |
| compileSdk / targetSdk / minSdk | 37 / 36 / 26 |

```bash
cd android
./gradlew :app:assembleDebug testDebugUnitTest   # debug APK + unit tests
./gradlew :app:assembleRelease                   # release APK (needs signing, see §4)
```

**APK output:** `android/app/build/outputs/apk/debug/app-debug.apk` (~30 MB, debuggable)
and `android/app/build/outputs/apk/release/app-release.apk` (~7 MB with R8; `app-release-unsigned.apk`
when no signing key is configured). CI additionally publishes `app-release-debugsigned.apk` — the same
optimised build signed with the committed debug key so testers can install it. It is **for testing
only**; anything distributed must be signed with the project's own release key.

### CI
The existing workflow (`.github/workflows/ci.yml`) runs `npm run build`, whose `build:android:ci`
step (`android/scripts/ci-android.mjs`) installs nothing new: it uses the runner's JDK 21 and Android
SDK, runs `:app:assembleDebug testDebugUnitTest`, and copies the APKs to `dist/android/`, uploaded as
the **`dist`** artifact of each run. Commit-message tags: `[android-release]` (also build release),
`[android-full]` (release + lint), `[android-lint]`, `[android-skip-tests]`, `[android-probe]`
(toolchain/versions report), `[android-report]`. A standalone workflow is provided in
`android/ci/android-apk.yml` (copy it to `.github/workflows/` to use it).

**Automated verification in CI:** unit tests (41 across model, navigation, validators, chat
list building, web-format mappers, level badges, stickers/data URLs, notification routing, game
simulation) and an optional `[android-smoke]` emulator run that installs the APK, launches it,
relaunches it in Arabic (RTL), opens a deep link while signed out, and fails on any crash of the
app process (with `[android-release]` it also launches the R8 release build signed with the debug
key). Last result: login screen rendered in English and Arabic, no crash.

Offline helpers (no SDK needed): `python3 android/scripts/kt_lint.py android` (nested comments,
unterminated strings, bracket balance) and `python3 android/scripts/res_lint.py` (string resources:
XML validity, apostrophes, placeholders, en/ar parity).

---

## 2. Firebase configuration

* **Config source:** `android/app/google-services.json` (project `animeblackapp-b6223`). The Google
  Services plugin is always applied and the build fails if the file is missing; there is no fallback.
* **Firestore:** `(default)` database, persistent cache (100 MB), realtime listeners with
  retry/backoff, server timestamps where the rules/web expect them.
* **App Check:** Play Integrity in release, debug provider in debug builds (register the debug token
  printed in Logcat under *App Check → Manage debug tokens*). Enforce only after the Android app is
  registered.
* **FCM:** channels `chats`, `groups`, `social`, `system`; data payload `url` is parsed by
  `DeepLinkParser` (same `/?go=…&id=…` links the Cloud Functions already send). Tokens are stored
  with the web's structure; notifications for the chat/group on screen are suppressed.
* **Remote Config keys:** `android_maintenance_mode`, `android_maintenance_message`,
  `android_min_supported_version_code`, `feature_games_enabled`, `feature_ai_agent_enabled`,
  `announcement_banner` (safe defaults in-app; the app never blocks on a fetch).
* **Crashlytics / Performance / Analytics** are wired; users can opt out in Settings → Diagnostics.

### Firebase console checklist (probe of `animeblackapp-b6223`, run by CI with Android headers)

| Check | Result | Action |
| --- | --- | --- |
| App registration in `google-services.json` | project `animeblackapp-b6223`, app `1:233883926464:android:13747ee836356f1bd21225` | — |
| Firestore `(default)` database | **NOT FOUND**: "The database (default) does not exist for project animeblackapp-b6223" | Create it in *this* project (Firestore → Create database, Native mode), or confirm the project used |
| Anonymous provider (quick start / guests) | `ADMIN_ONLY_OPERATION` → **disabled** | Authentication → Sign-in method → **Anonymous → Enable** |
| E-mail/password provider | `PASSWORD_LOGIN_DISABLED` → **disabled** | Authentication → Sign-in method → **Email/Password → Enable** |
| Android OAuth client (SHA fingerprints) | only the web client (type 3) present | Add the SHA-1/SHA-256 from §3, then download `google-services.json` again |

All manual steps, including rules/index deployment, are in `firebase-migration/DEPLOY.md`.

## 3. Google Sign-In (Credential Manager)

Google sign-in uses **Credential Manager + Google Identity (`googleid`)** and exchanges the ID token
for a Firebase credential, so existing web accounts sign in to the *same* uid. Setup checklist:

1. Firebase console → Project settings → *Add app* → Android, package `com.animeblack.app`.
2. Add the SHA fingerprints of the signing key(s):
   * committed **debug** keystore `android/app/debug.keystore` (alias `androiddebugkey`, password `android`):
     * SHA-1 `4E:3D:7B:4F:5E:12:72:8A:C2:AE:21:30:CD:83:E4:9D:6D:58:CE:9F`
     * SHA-256 `5A:52:7E:23:6B:D0:73:1D:85:FD:9A:F4:E4:C0:B3:0F:00:20:3B:93:62:5F:CE:20:62:BA:9E:14:A3:2E:A1:94`
   * your release key (and the Play App Signing key if you publish on Play).
3. Keep **Google** enabled under Authentication → Sign-in method. The *Web client ID*
   (the web OAuth client, `client_type` 3, in `google-services.json`) is used as `serverClientId`.
4. Download the new `google-services.json` into `android/app/` (optional but recommended).

Handled cases: user cancellation, no credential on device, invalid/expired token, network errors,
account switching (saved accounts, no passwords stored), sign-out (clears Credential Manager state).

### Quick start & guest accounts
The sign-in screen starts with **Quick start**: a name and a username, then straight into the app.
It signs in with a real Firebase **anonymous** account, so the existing rules (`request.auth != null`)
give guests the same abilities as registered users: posting, chats, groups, reels, economy.
If the Anonymous provider is disabled in the Firebase console, the app falls back to a device-bound
account on an undeliverable `@guest.animeblack.invalid` address (RFC 2606), so password-reset
e-mails can never be used to take it over. Enabling **Authentication → Sign-in method → Anonymous**
is recommended.
Guests are not stored in the account switcher. Settings offers **Save with e-mail** or **Link a
Google account**, which keeps the same uid and all data. Signing out warns that a guest account
cannot be recovered.

*Security note:* because guests have full access, one person can create many guest accounts
(e.g. to farm the daily reward and transfer coins). Mitigations: enforce App Check, and/or reject
`sign_in_provider == "anonymous"` in the `economyTransfer` / `claimDailyReward` functions.

## 4. Release signing

Provide via `android/local.properties`, Gradle properties or environment variables
(`ANIMEBLACK_RELEASE_STOREFILE`, …):

```
animeblack.release.storeFile=/path/to/release.jks
animeblack.release.storePassword=…
animeblack.release.keyAlias=…
animeblack.release.keyPassword=…
animeblack.apiBaseUrl=https://your-node-server   # optional: enables the AI search agent
```

Without these, `assembleRelease` produces an **unsigned** release APK (the debug APK is always
signed with the committed debug key). Never commit the release keystore.

---

## 5. Architecture

```
app/                     MainActivity, auth gate, adaptive nav (bottom bar / rail), NavHost, DI
core/model               Pure models (web-compatible fields: Post, ChatMessage, Story, Group…)
core/common              AppResult/AppError, dispatchers, NetworkMonitor, validators, AppConfig
core/designsystem        AMOLED theme, colours, typography, Material Symbols vectors, components
core/ui                  Post card, chat kit (bubbles, composer, voice notes), media, formatting
core/navigation          Type-safe @Serializable routes + validated deep links
core/datastore           DataStore settings, drafts, saved accounts, device/session ids
core/database            Room outbox (pending media uploads / idempotent operations)
core/data                Firebase repositories (interfaces + impl), mappers, outbox worker,
                         push, presence, session, remote config, AniList/Jikan + agent APIs
feature/*                auth, home (feed/posts/stories/camera), community (groups/worlds/guilds),
                         chat, reels, profile, notifications, search, settings, more, anime,
                         games, admin — MVVM (ViewModel + StateFlow), Hilt, Compose
```

* **MVVM + repositories:** screens observe `StateFlow` UI state; repositories expose `Flow`s and
  `suspend` operations returning `AppResult`, so the backend stays replaceable.
* **Offline & sync:** Firestore's persistent cache serves reads offline and queues writes; media
  (post/story/reel/chat/room attachments, avatars) goes through a **Room outbox + WorkManager**
  (compression, upload progress, retry with backoff, survives process death). Client-generated ids
  make retries idempotent (no duplicate messages/posts). Drafts (posts, chats) persist in DataStore.
  Settings → *Sync diagnostics* shows pending/failed items with retry.
* **Chat:** canonical `ch_<a>_<b>` ids shared with the web, message fields `st/at/attachments/quote/
  reacts/reactions/deletedFor`, chat doc written before the message (rules), unread counters,
  typing (throttled), read receipts (respects the setting), presence, pagination, voice notes (AAC).
* **Media:** Photo Picker, CameraX (photo + video), Media3 playback, Coil 3 (GIF/video frames),
  legacy `data:` URLs from older web messages are decoded natively.
* **Localisation:** Arabic (RTL) and English (LTR) strings for every screen; per-app language
  (Android 13+ `LocaleManager`, older versions via context wrapping).

## 6. Security review (summary)

* No private server keys in the APK (Gemini key stays on the Node server; only the public Firebase
  client configuration from `google-services.json` is embedded).
* **Firestore rules fixes (additive, web-compatible):**
  * new user documents are capped to the starter economy the clients actually write
    (coins ≤ 300, stars ≤ 15, reputation ≤ 30, level 1, no xp/gems) — previously a client could
    create its own profile with arbitrary balances. Matching web fix in `index.html`: a new profile
    no longer inherits `role`, `level` or balances from local browser state (that path also produced
    role values the rules reject, silently failing profile creation);
  * readers may update post reaction counters `reacts`/`reposts` (web + Android already write them);
  * story viewers may append `views`/`reactions` (views can only grow) — previously denied.
* Deep links: ids validated against the rules' charset; deep links never bypass sign-in.
* Exported components: only the launcher activity (custom-scheme + share intents) and the FCM
  service; `allowBackup=false`; cleartext traffic disabled; external links restricted to http(s).
* Admin tools are gated in the UI **and** enforced by rules/Cloud Functions.
* No tokens, message contents or personal data are logged; Crashlytics collection honours opt-out.

## 7. Feature coverage

| Area | Native status |
| --- | --- |
| Auth: quick start (name + username, instant entry), guests with upgrade to e-mail/Google, e-mail, Google, reset, verification, complete profile, account switcher, delete account | ✅ |
| Home feed (realtime + pagination), post detail, comments, reactions, polls, saves, shares, edit/delete, drafts, share-target, stickers & GIFs as post media | ✅ |
| Stories: viewer, create (text/photo/video, close friends), reactions, replies, views | ✅ (archive ❌) |
| Reels: vertical player, likes, comments, share, create (pick/record), delete | ✅ (advanced studio ❌) |
| Chat: list, room, requests, new chat, info, wallpaper, mute/pin/archive, block, attachments, voice, web sticker packs (identical SVG artwork), curated anime GIFs | ✅ |
| Groups / worlds / guilds: hub, rooms, create, join/leave/request, group admin, channels | ✅ |
| Profile, edit, followers/following, QR profile card, private accounts, block/report | ✅ |
| Notifications (+ broadcasts), search (people/posts/groups/anime, trending tags) | ✅ |
| Wallet (daily reward, transfers, history), levels (rank tiers, admin-defined level badges with web defaults, achievements), workspace notes, saved, favourites/history, reports | ✅ |
| Anime/manga hub & detail (AniList + Jikan), AI search agent (needs `animeblack.apiBaseUrl`) | ✅ |
| Games: hub, runner, characters (web catalogue, unlock/upgrade/equip), daily supply, leaderboard | ✅ core loop |
| Admin: metrics, moderation queue, roles/verification, broadcasts, audit log | ✅ |
| Settings: AMOLED, language, notifications, privacy, sessions, blocked users, sync diagnostics, legal | ✅ |

**Not yet ported (web pages without a native screen yet):** events (`eventsHub/eventDetail/createEvent`),
news (`createNews/newsDetail/newsView`, `savedArticles`, `readerMode`), internal mail (`gmail/mailView`),
live GIF search (the web used the retired Tenor v1 API; the curated catalogue is ported), story archive
(web-local only),
advanced reel studio, anime wiki/character/lore pages, extended game systems (shop, chests, inventory,
missions, achievements, events, transformations, history) and the 15 game-admin pages, server telemetry
pages (`serverHealth/devCenter/visualControlCenter` — the web's CSS theming tool, `app_visual_config`,
has no meaning for the native design system), home customizer, archived/hidden posts lists,
"my replies", activity & otaku stats. PWA-only pages
(`installApp/downloadApp/pwaGate`) are not applicable to a native app. The data model for all of these
is preserved, so they can be added as new feature modules without backend changes.

*Not a gap:* the `calls` collection appears only in the security rules and the `cleanupStaleCalls`
function; no client (the web included) implements voice/video calls, so there is nothing to port.
Events, news and internal mail on the web live only in browser storage (no Firestore collection), so a
native port could not share data with web users; they are left out on purpose rather than faked. The web
pages for 2FA (hard-coded demo secret), phone verification (sets a local flag, sends no SMS) and e-mail
change (no Firebase call) are UI mock-ups, so they were not reproduced as fake native screens; real
versions need Firebase Identity Platform MFA / phone auth / `verifyBeforeUpdateEmail`.

## 8. Libraries (all pinned in `gradle/libs.versions.toml`)
Compose BOM 2026.09.00 (Material 3), AndroidX core 1.19.1, activity 1.13.0, lifecycle 2.11.0,
navigation 2.10.2, hilt 2.60.1 / androidx.hilt 1.4.0, work 2.12.0, room 2.8.5, datastore 1.2.1,
paging 3.5.1, media3 1.11.1, camera 1.6.2, credentials 1.6.0 + googleid 1.2.1, splashscreen 1.2.0,
Firebase BoM 34.19.0, coroutines 1.11.0, serialization 1.11.0, OkHttp 5.5.0, Coil 3.6.3,
ZXing core 3.5.4; tests: JUnit 4.13.2, Truth 1.4.5, MockK 1.14.11, Turbine 1.2.1, Robolectric 4.17.
