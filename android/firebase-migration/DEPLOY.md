# New Firebase project: manual steps (nothing here has been deployed automatically)

Project ID (from `google-services.json`): **animeblackapp-b6223**. The display name may be
"animeblackapp", but the ID the SDK uses is `animeblackapp-b6223`.
Android app: `1:233883926464:android:13747ee836356f1bd21225` (package `com.animeblack.app`).

## 0. Probe results (CI, REST calls with Android headers)
- Firestore `(default)`: **"The database (default) does not exist for project animeblackapp-b6223"**.
  Check that the database was created in this project (the one whose Project settings show the ID
  `animeblackapp-b6223` and number `233883926464`), not in another project.
- Anonymous: disabled (`ADMIN_ONLY_OPERATION`). Email/Password: disabled (`PASSWORD_LOGIN_DISABLED`).
- `google-services.json` has no Android OAuth client, so no SHA fingerprint is registered.

## 1. Authentication (Firebase console → Authentication → Sign-in method)
- Enable **Google** (Google Sign-In).
- Enable **Anonymous** (Quick start / guests) and **Email/Password** (e-mail accounts). Without these,
  those buttons show an explanatory error; the rest of the app keeps working.

## 2. SHA fingerprints (Project settings → Your apps → Anime Black Android → Add fingerprint)
The provided `google-services.json` contains **no Android OAuth client** (only the web client,
type 3), so no fingerprint is registered yet. Google Sign-In on Android needs it.

Verified from `android/app/debug.keystore` (debug builds and the CI `app-release-debugsigned.apk`):
- SHA-1   `4E:3D:7B:4F:5E:12:72:8A:C2:AE:21:30:CD:83:E4:9D:6D:58:CE:9F`
- SHA-256 `5A:52:7E:23:6B:D0:73:1D:85:FD:9A:F4:E4:C0:B3:0F:00:20:3B:93:62:5F:CE:20:62:BA:9E:14:A3:2E:A1:94`

Release keystore / Google Play App Signing: **not in the project, not verifiable**. Add those
fingerprints yourself when they exist. Afterwards, download `google-services.json` again and replace
`android/app/google-services.json` (it will then contain a `client_type: 1` entry).

## 3. Firestore `(default)` (production mode denies everything until rules are deployed)
From this folder, with the Firebase CLI logged in to the account that owns the project:

```bash
firebase deploy --only firestore:rules,firestore:indexes --project animeblackapp-b6223
```

- `firestore.rules` is the app's existing rule set (same as the repository root). No rule allows
  unrestricted writes. Public **reads** exist by design for `users`, `posts`, `stories`, `reels`,
  `communities`, `worlds`, `broadcasts`, badges/level badges, game leaderboards/config, appearance
  config and status docs. *Risk:* `users` documents are publicly readable, including the `email`
  field; consider moving e-mails to a private sub-document later.
- `firestore.indexes.json` includes the composite indexes the Android queries need
  (`notifications userId+at`, `posts authorId+createdAt`).
- No data is migrated: the new database starts empty. Profiles are created on first sign-in, and
  level badges fall back to the built-in defaults.

## 4. Cloud Storage (billing not authorised → do nothing now)
The app references Storage for media uploads. While Storage is not enabled, uploads fail and are
kept in the retry queue (visible in Settings → Sync diagnostics); text features keep working.
Later: enable Storage (requires the Blaze plan), then run
`firebase deploy --only storage --project animeblackapp-b6223`.

## 5. Cloud Functions (server code, not part of the Android project)
The app calls `claimDailyReward`, `economyTransfer` and `getChatMediaUrl` (region `us-central1`).
Chat/group push notifications are sent by `onChatMessageCreated` / `onGroupMessageCreated`. These
exist only in the old project. Until they are deployed to `animeblackapp-b6223` (Blaze plan
required), the daily reward, coin transfers and chat pushes return errors or do not arrive.
The functions default to the `(default)` database; when deploying this same source to the legacy web
project instead, set `FIRESTORE_DB_ID` to that project's named database.

## 6. Cloud Messaging
No console action is needed for the app to receive a token (FCM is enabled with the project). Tokens
are stored at `users/{uid}/devices/{token}` in the new database. Delivering pushes depends on §5.

## 7. App Check (optional; do not enforce before it is set up)
- Debug builds: register the debug token printed in Logcat (App Check → Manage debug tokens).
- Release: register Play Integrity with the release SHA-256.

## 8. Old project
Do **not** delete the old project. Keep it until the new configuration is confirmed on a real device.
