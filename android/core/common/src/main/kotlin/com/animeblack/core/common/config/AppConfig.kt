package com.animeblack.core.common.config

/**
 * Build-time configuration provided by the :app module (BuildConfig) through Hilt, so that library
 * modules never hard-code environment values.
 */
data class AppConfig(
    /** Named Firestore database used by the web app (empty = "(default)"). */
    val firestoreDatabaseId: String,
    /** Web OAuth client id used as `serverClientId` for Google sign-in via Credential Manager. */
    val googleWebClientId: String,
    /** Origin of the deployed Anime Black web server (Gemini search agent, admin metrics). */
    val apiBaseUrl: String,
    val functionsRegion: String = "us-central1",
    val isDebug: Boolean,
    val versionName: String,
    val versionCode: Int,
    /** True when a real google-services.json (registered Android app) was used for the build. */
    val hasAndroidFirebaseApp: Boolean,
    /** Status-bar icon for locally displayed notifications. */
    val notificationIconRes: Int = 0,
) {
    val hasApiServer: Boolean get() = apiBaseUrl.startsWith("https://")
}
