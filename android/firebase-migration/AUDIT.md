# Firebase migration audit (Step 1 — before any change)

> Historical record written before the migration. After the migration the old configuration file was
> deleted, and the old identifiers are abbreviated here on purpose, so the code base contains no
> reference to the old project.

Target: Firebase project **animeblackapp-b6223** (display name "animeblackapp", project number 233883926464), Android app
`1:233883926464:android:13747ee836356f1bd21225`, package **com.animeblack.app**, Firestore `(default)`.
Old: project `the old project (booming-…)` with the named Firestore database
`ai-studio-51245802-… (old named database)` (used through the web configuration).

## 1. Where the old Firebase project is referenced (Android project only)

| File | Reference |
| --- | --- |
| `android/app/firebase-web-config.json` | Full old **web** config: projectId `the old project (booming-…)`, appId the old web app id, apiKey, authDomain, storageBucket, messagingSenderId, **firestoreDatabaseId `ai-studio-51245802-… (old named database)`**, oAuthClientId (old OAuth client) |
| `android/app/build.gradle.kts` | Reads `firebase-web-config.json`, or else the web's `../firebase-applet-config.json` at the repo root, and turns it into `google_app_id`, `google_api_key`, `gcm_defaultSenderId`, `project_id`, `google_storage_bucket`, `default_web_client_id` resources plus the `FIRESTORE_DATABASE_ID` and `GOOGLE_WEB_CLIENT_ID` BuildConfig fields. |
| `android/scripts/ci-android.mjs` | `[firebase-probe]` reads the same web config (API key, project, database). |
| `android/MIGRATION.md` | Documentation mentions project `the old project (booming-…)` and the named database. |

No Kotlin source hardcodes an old project value. There is no `google-services.json` in the project
today, so the Google Services plugin is **not applied**.

## 2. Where Firebase configuration is loaded

1. `app/build.gradle.kts`: applies `com.google.gms.google-services` **only if** `app/google-services.json`
   exists; otherwise uses the web-config fallback described above.
2. `FirebaseInitProvider` (automatic): `FirebaseApp` is created from those string resources.
   `core/data/.../firebase/FirebaseModule.kt` obtains it (`FirebaseApp.getApps(...)`/`initializeApp`).
3. `app/.../di/AppModule.kt` builds `AppConfig` from `BuildConfig.FIRESTORE_DATABASE_ID`,
   `BuildConfig.GOOGLE_WEB_CLIENT_ID` and `BuildConfig.HAS_GOOGLE_SERVICES_JSON`.
4. `FirebaseModule.providesFirestore` selects `FirebaseFirestore.getInstance(app)` for `(default)` or
   `getInstance(app, id)` for a named database. It already supports `(default)`.
5. `AnimeBlackApplication` installs App Check (`AppCheckInstaller`: debug provider in debug builds,
   Play Integrity in release) and sets Crashlytics/Performance collection.

## 3. Firebase services actually used

| Service | Used by |
| --- | --- |
| Auth | `FirebaseAuthRepository` (e-mail, Google, anonymous/quick start, linking), auth state in 18 files |
| Google Sign-In | `GoogleSignInClient` (Credential Manager + googleid; `serverClientId` = `AppConfig.googleWebClientId`) |
| Firestore | All repositories (users, posts, stories, reels, chats/messages, groups, worlds, communities, notifications, …), outbox, presence, push tokens |
| Storage | `StorageUploader` (outbox uploads for posts/stories/reels/chat/rooms/avatars); failures are caught and retried |
| Cloud Functions | `claimDailyReward`, `economyTransfer`, `getChatMediaUrl` (region `us-central1`) |
| FCM | `AnimeBlackMessagingService`, `PushTokenManager` (token at `users/{uid}/devices/{token}`), manifest defaults (icon, colour, channel `chats`) |
| Crashlytics, Performance | `AnimeBlackApplication`, `AnalyticsHelper`, Gradle plugins |
| Analytics | `AnalyticsHelper`, `FirebaseModule` |
| Remote Config | `FeatureFlags` |
| Installations | dependency (used by FCM, Remote Config and Analytics) |
| App Check | `AppCheckInstaller` (debug and release variants) |
| App Distribution | **not used** |

SDK versions: Firebase BoM **34.19.0**, google-services plugin **4.5.0**, Crashlytics plugin **3.0.8**,
Performance plugin **2.0.2**, Credential Manager **1.6.0**, googleid **1.2.1**. No change needed.

Signing fingerprints verified from `android/app/debug.keystore` (used by debug builds and the CI
test-signed release APK):
- SHA-1 `4E:3D:7B:4F:5E:12:72:8A:C2:AE:21:30:CD:83:E4:9D:6D:58:CE:9F`
- SHA-256 `5A:52:7E:23:6B:D0:73:1D:85:FD:9A:F4:E4:C0:B3:0F:00:20:3B:93:62:5F:CE:20:62:BA:9E:14:A3:2E:A1:94`

There is no release keystore in the project, so release fingerprints **cannot be verified**.

Composite indexes the Android queries need, already listed in the repository's
`firestore.indexes.json`: `notifications (userId ASC, at DESC)` and `posts (authorId ASC, createdAt DESC)`.

## 4. Files that need modification

- `android/app/google-services.json`: **add** (new project).
- `android/app/build.gradle.kts`: use `google-services.json` exclusively. Firestore database
  `(default)`; web client ID read from `google-services.json` (`oauth_client`, `client_type` 3);
  remove the web-config fallback.
- `android/app/firebase-web-config.json`: **delete** (old project copy).
- `android/scripts/ci-android.mjs`: the probe reads `google-services.json`.
- `android/MIGRATION.md`, `android/README.md`: documentation.
- Kotlin sources: **no change required** (`FirebaseModule` already handles `(default)`).
