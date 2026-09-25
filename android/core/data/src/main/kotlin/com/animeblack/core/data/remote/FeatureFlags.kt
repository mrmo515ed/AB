package com.animeblack.core.data.remote

import com.animeblack.core.common.config.AppConfig
import com.google.firebase.remoteconfig.FirebaseRemoteConfig
import com.google.firebase.remoteconfig.FirebaseRemoteConfigSettings
import javax.inject.Inject
import javax.inject.Singleton
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.tasks.await

data class Flags(
    val maintenanceMode: Boolean = false,
    val maintenanceMessage: String = "",
    val minSupportedVersionCode: Long = 0,
    val gamesEnabled: Boolean = true,
    val agentEnabled: Boolean = true,
    val announcement: String = "",
)

/** Remote Config backed feature flags with safe in-app defaults (the app never depends on a fetch). */
@Singleton
class FeatureFlags @Inject constructor(
    private val remoteConfig: FirebaseRemoteConfig,
    private val config: AppConfig,
) {
    private val _flags = MutableStateFlow(Flags())
    val flags: StateFlow<Flags> = _flags.asStateFlow()

    suspend fun refresh() {
        try {
            remoteConfig.setConfigSettingsAsync(
                FirebaseRemoteConfigSettings.Builder()
                    .setMinimumFetchIntervalInSeconds(if (config.isDebug) 60 else 3_600)
                    .build(),
            ).await()
            remoteConfig.setDefaultsAsync(
                mapOf(
                    KEY_MAINTENANCE to false,
                    KEY_MAINTENANCE_MESSAGE to "",
                    KEY_MIN_VERSION to 0L,
                    KEY_GAMES to true,
                    KEY_AGENT to true,
                    KEY_ANNOUNCEMENT to "",
                ),
            ).await()
            remoteConfig.fetchAndActivate().await()
        } catch (_: Exception) {
            // Offline or not configured: keep defaults / last activated values.
        }
        _flags.value = Flags(
            maintenanceMode = remoteConfig.getBoolean(KEY_MAINTENANCE),
            maintenanceMessage = remoteConfig.getString(KEY_MAINTENANCE_MESSAGE),
            minSupportedVersionCode = remoteConfig.getLong(KEY_MIN_VERSION),
            gamesEnabled = remoteConfig.getBoolean(KEY_GAMES),
            agentEnabled = remoteConfig.getBoolean(KEY_AGENT),
            announcement = remoteConfig.getString(KEY_ANNOUNCEMENT),
        )
    }

    companion object {
        const val KEY_MAINTENANCE = "android_maintenance_mode"
        const val KEY_MAINTENANCE_MESSAGE = "android_maintenance_message"
        const val KEY_MIN_VERSION = "android_min_supported_version_code"
        const val KEY_GAMES = "feature_games_enabled"
        const val KEY_AGENT = "feature_ai_agent_enabled"
        const val KEY_ANNOUNCEMENT = "announcement_banner"
    }
}
