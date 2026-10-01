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
    /** Optional API token sent to the server (`ANIMEBLACK_AGENT_TOKEN`) when one is configured. */
    val apiToken: String = "",
    val functionsRegion: String = "us-central1",
    val isDebug: Boolean,
    val versionName: String,
    val versionCode: Int,
    /** True when a real google-services.json (registered Android app) was used for the build. */
    val hasAndroidFirebaseApp: Boolean,
    /** Status-bar icon for locally displayed notifications. */
    val notificationIconRes: Int = 0,
) {
    /**
     * Base URL in effect for server calls: the in-app override from Settings when set, otherwise
     * the build-time value (`-Panimeblack.apiBaseUrl` / `ANIMEBLACK_API_BASEURL` / `local.properties`).
     */
    fun effectiveApiBaseUrl(override: String): String =
        override.trim().trimEnd('/').ifBlank { apiBaseUrl.trim().trimEnd('/') }

    /**
     * A usable server base URL: always https, or plain http only for local development hosts
     * (10.0.2.2 emulator loopback / localhost / 127.0.0.1) in debug builds.
     */
    fun isUsableServerUrl(url: String): Boolean {
        val trimmed = url.trim()
        if (trimmed.startsWith("https://")) return true
        if (!isDebug) return false
        return trimmed.startsWith("http://10.0.2.2") ||
            trimmed.startsWith("http://localhost") ||
            trimmed.startsWith("http://127.0.0.1")
    }

    val hasApiServer: Boolean get() = isUsableServerUrl(effectiveApiBaseUrl(""))
}
