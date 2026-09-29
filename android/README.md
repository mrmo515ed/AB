# Anime Black — Android app (native)

Kotlin + Jetpack Compose app for Anime Black. This folder is **self-contained** (its own Gradle
build, Firebase config in `app/google-services.json` — project `animeblackapp-b6223`, CI driver and docs) and does not
depend on the web files, so it can live in its own repository.

- Build: `./gradlew :app:assembleDebug` (JDK 21, Android SDK 37) — details in [MIGRATION.md](MIGRATION.md).
- Latest APK (when publishing is enabled): https://github.com/mrmo515ed/AB/releases/download/android-latest/AnimeBlack.apk

## Move it to a separate repository (keeps the full history of this folder)

```bash
# in a clone of mrmo515ed/AB, on the Android branch
git subtree split --prefix=android -b android-standalone
# create an empty repository on GitHub (e.g. mrmo515ed/AnimeBlack-Android), then:
git push https://github.com/mrmo515ed/AnimeBlack-Android.git android-standalone:main
```

In the new repository, copy `ci/android-apk.yml` to `.github/workflows/android-apk.yml` to build the
APK on every push. Firebase keeps working because the app talks to the same project.
