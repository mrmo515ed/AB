package com.animeblack.core.data.push

import com.animeblack.core.common.config.AppConfig
import com.animeblack.core.data.firebase.Collections
import com.animeblack.core.data.session.DeviceInfo
import com.animeblack.core.datastore.SettingsDataSource
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.SetOptions
import com.google.firebase.messaging.FirebaseMessaging
import javax.inject.Inject
import javax.inject.Singleton
import kotlinx.coroutines.tasks.await

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
        val uid = auth.currentUser?.uid ?: return
        if (!settings.current().notificationsEnabled) {
            unregister()
            return
        }
        val token = try {
            messaging.token.await()
        } catch (_: Exception) {
            return
        }
        saveToken(uid, token)
    }

    suspend fun onNewToken(token: String) {
        val uid = auth.currentUser?.uid ?: return
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
                .set(data, SetOptions.merge()).await()
        } catch (_: Exception) {
            // Queued offline by Firestore.
        }
    }

    /** Must run *before* signing out so the security rules still allow deleting the device doc. */
    suspend fun unregister() {
        val uid = auth.currentUser?.uid ?: return
        try {
            val token = messaging.token.await()
            firestore.collection(Collections.USERS).document(uid)
                .collection(Collections.DEVICES).document(token).delete().await()
            messaging.deleteToken().await()
        } catch (_: Exception) {
        }
    }
}
