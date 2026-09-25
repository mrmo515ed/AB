# Anime Black — Native Android migration

> **ملخص بالعربية:** هذا المجلد يحتوي تطبيق Android أصلياً بالكامل (Kotlin + Jetpack Compose) يحل محل واجهة الويب على
> أندرويد، ويستخدم نفس مشروع Firebase ونفس المجموعات والحقول والقواعد والدوال السحابية دون أي بيانات وهمية أو WebView.
> طريقة البناء، إعداد Firebase وتسجيل الدخول بـ Google، والقيود المعروفة موضحة أدناه.

The web SPA (`index.html`) is untouched. The Android app is a separate Gradle build under `android/`
that talks to the **same Firebase project** (`booming-rigging-gn50x`, named Firestore database
`ai-studio-51245802-…`) with the **same collections, fields, Storage paths and Cloud Functions**, so
web and Android users see each other's posts, chats, stories, groups and profiles in real time.

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

**APK output:** `android/app/build/outputs/apk/debug/app-debug.apk`
(release: `android/app/build/outputs/apk/release/app-release.apk`).

### CI
The existing workflow (`.github/workflows/ci.yml`) runs `npm run build`, whose `build:android:ci`
step (`android/scripts/ci-android.mjs`) installs nothing new: it uses the runner's JDK 21 and Android
SDK, runs `:app:assembleDebug testDebugUnitTest`, and copies the APKs to `dist/android/`, uploaded as
the **`dist`** artifact of each run. Commit-message tags: `[android-release]` (also build release),
`[android-full]` (release + lint), `[android-lint]`, `[android-skip-tests]`, `[android-probe]`
(toolchain/versions report), `[android-report]`. A standalone workflow is provided in
`android/ci/android-apk.yml` (copy it to `.github/workflows/` to use it).

Offline helpers (no SDK needed): `python3 android/scripts/kt_lint.py android` (nested comments,
unterminated strings, bracket balance) and `python3 android/scripts/res_lint.py` (string resources:
XML validity, apostrophes, placeholders, en/ar parity).

---

## 2. Firebase configuration

* **Config source.** Preferred: register the Android app **`com.animeblack.app`** in the Firebase
  console and put `google-services.json` in `android/app/`. Without it the build falls back to the
  web config in `firebase-applet-config.json` (same project) via generated resources, so the APK works
  out of the box. Values can be overridden with Gradle properties/env vars
  (`animeblack.firebaseAppId`, `animeblack.googleWebClientId`, …).
* **Firestore:** named database from the config, persistent cache (100 MB), realtime listeners with
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
   (`oAuthClientId` in the web config) is used as `serverClientId`.
4. Download the new `google-services.json` into `android/app/` (optional but recommended).

Handled cases: user cancellation, no credential on device, invalid/expired token, network errors,
account switching (saved accounts, no passwords stored), sign-out (clears Credential Manager state).

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
  web config is embedded, as on the web).
* **Firestore rules fixes (additive, web-compatible):**
  * new user documents are capped to the starter economy the clients actually write
    (coins ≤ 300, stars ≤ 15, reputation ≤ 30, level 1, no xp/gems) — previously a client could
    create its own profile with arbitrary balances;
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
| Auth: e-mail, Google, reset, verification, complete profile, account switcher, delete account | ✅ |
| Home feed (realtime + pagination), post detail, comments, reactions, polls, saves, shares, edit/delete, drafts, share-target | ✅ |
| Stories: viewer, create (text/photo/video, close friends), reactions, replies, views | ✅ (archive ❌) |
| Reels: vertical player, likes, comments, share, create (pick/record), delete | ✅ (advanced studio ❌) |
| Chat: list, room, requests, new chat, info, wallpaper, mute/pin/archive, block, attachments, voice | ✅ |
| Groups / worlds / guilds: hub, rooms, create, join/leave/request, group admin, channels | ✅ |
| Profile, edit, followers/following, QR profile card, private accounts, block/report | ✅ |
| Notifications (+ broadcasts), search (people/posts/groups/anime, trending tags) | ✅ |
| Wallet (daily reward, transfers, history), levels, workspace notes, saved, favourites/history, reports | ✅ |
| Anime/manga hub & detail (AniList + Jikan), AI search agent (needs `animeblack.apiBaseUrl`) | ✅ |
| Games: hub, runner, characters (web catalogue, unlock/upgrade/equip), daily supply, leaderboard | ✅ core loop |
| Admin: metrics, moderation queue, roles/verification, broadcasts, audit log | ✅ |
| Settings: AMOLED, language, notifications, privacy, sessions, blocked users, sync diagnostics, legal | ✅ |

**Not yet ported (web pages without a native screen yet):** events (`eventsHub/eventDetail/createEvent`),
news (`createNews/newsDetail/newsView`, `savedArticles`, `readerMode`), internal mail (`gmail/mailView`),
voice/video calls (WebRTC `calls` collection), sticker packs & GIF picker in chat, story archive,
advanced reel studio, anime wiki/character/lore pages, extended game systems (shop, chests, inventory,
missions, achievements, events, transformations, history) and the 15 game-admin pages, server telemetry
pages (`serverHealth/devCenter/visualControlCenter`), home customizer, archived/hidden posts lists,
"my replies", activity & otaku stats, 2FA / phone verification / e-mail change. PWA-only pages
(`installApp/downloadApp/pwaGate`) are not applicable to a native app. The data model for all of these
is preserved, so they can be added as new feature modules without backend changes.

## 8. Libraries (all pinned in `gradle/libs.versions.toml`)
Compose BOM 2026.09.00 (Material 3), AndroidX core 1.19.1, activity 1.13.0, lifecycle 2.11.0,
navigation 2.10.2, hilt 2.60.1 / androidx.hilt 1.4.0, work 2.12.0, room 2.8.5, datastore 1.2.1,
paging 3.5.1, media3 1.11.1, camera 1.6.2, credentials 1.6.0 + googleid 1.2.1, splashscreen 1.2.0,
Firebase BoM 34.19.0, coroutines 1.11.0, serialization 1.11.0, OkHttp 5.5.0, Coil 3.6.3,
ZXing core 3.5.4; tests: JUnit 4.13.2, Truth 1.4.5, MockK 1.14.11, Turbine 1.2.1, Robolectric 4.17.
