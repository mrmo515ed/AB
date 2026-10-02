package com.animeblack.core.datastore

/** User preferences persisted with DataStore (device-local). */
data class AppSettings(
    val amoled: Boolean = true,
    val notificationsEnabled: Boolean = true,
    val chatNotifications: Boolean = true,
    val groupNotifications: Boolean = true,
    val socialNotifications: Boolean = true,
    val soundEnabled: Boolean = true,
    val hapticsEnabled: Boolean = true,
    val autoplayVideos: Boolean = true,
    val dataSaver: Boolean = false,
    val analyticsEnabled: Boolean = true,
    val crashReportsEnabled: Boolean = true,
    val reduceMotion: Boolean = false,
    val showOnlineStatus: Boolean = true,
    val readReceipts: Boolean = true,
    val onboardingDone: Boolean = false,
    val mutedChats: Set<String> = emptySet(),
    val pinnedChats: Set<String> = emptySet(),
    val archivedChats: Set<String> = emptySet(),
    val hiddenPosts: Set<String> = emptySet(),
    /**
     * Optional in-app override of the Anime Black server base URL (AI agent / admin metrics).
     * Empty means "use the build-time value" (`-Panimeblack.apiBaseUrl` / `ANIMEBLACK_API_BASEURL`).
     */
    val apiBaseUrlOverride: String = "",
    /**
     * Optional API token for the server (`ANIMEBLACK_AGENT_TOKEN`), stored on this device only.
     * Empty means "use the value baked into the build", if any.
     */
    val apiTokenOverride: String = "",
)
