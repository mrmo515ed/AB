package com.animeblack.core.data.push

import com.animeblack.core.common.config.AppConfig
import com.animeblack.core.data.firebase.Collections
import com.animeblack.core.data.firebase.activeUid
import com.animeblack.core.data.firebase.awaitWrite
import com.animeblack.core.data.session.DeviceInfo
import com.animeblack.core.datastore.SettingsDataSource
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.SetOptions
import com.google.firebase.messaging.FirebaseMessaging
import javax.inject.Inject
import javax.inject.Singleton
import kotlinx.coroutines.tasks.await
import kotlinx.coroutines.withTimeoutOrNull

/**
 * Stores the FCM token as `users/{uid}/devices/{token}` — exactly where the Cloud Functions
 * (`onChatMessageCreated` / `onGroupMessageCreated`) look for push targets.
 */
@Singleton
class PushTokenManager @Inject constructor(
    private val auth: FirebaseAuth,
    private val firestore: FirebaseFirestore,
    private val messaging: FirebaseMessaging,
    private val settings: SettingsDataSource,
    private val config: AppConfig,
) {
    suspend fun register() {
        val uid = auth.activeUid() ?: return
        if (!settings.current().notificationsEnabled) {
            unregister()
            return
        }
        val token = try {
            withTimeoutOrNull(1_500L) { messaging.token.await() }
        } catch (_: Exception) {
            null
        } ?: return
        saveToken(uid, token)
    }

    suspend fun onNewToken(token: String) {
        val uid = auth.activeUid() ?: return
        if (!settings.current().notificationsEnabled) return
        saveToken(uid, token)
    }

    private suspend fun saveToken(uid: String, token: String) {
        val now = System.currentTimeMillis()
        val data = mapOf(
            "platform" to "android",
            "userAgent" to DeviceInfo.userAgent(config),
            "deviceId" to settings.deviceId(),
            "appVersion" to config.versionName,
            "createdAt" to now,
            "lastActive" to now,
        )
        try {
            firestore.collection(Collections.USERS).document(uid)
                .collection(Collections.DEVICES).document(token)
                .set(data, SetOptions.merge()).awaitWrite(600L)
        } catch (_: Exception) {
        }
    }

    suspend fun unregister() {
        val uid = auth.activeUid() ?: return
        try {
            val token = withTimeoutOrNull(1_000L) { messaging.token.await() } ?: return
            firestore.collection(Collections.USERS).document(uid)
                .collection(Collections.DEVICES).document(token).delete().awaitWrite(600L)
            withTimeoutOrNull(1_000L) { messaging.deleteToken().await() }
        } catch (_: Exception) {
        }
    }
}
