package com.animeblack.core.data.presence

import com.animeblack.core.data.firebase.Collections
import com.animeblack.core.datastore.SettingsDataSource
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.SetOptions
import javax.inject.Inject
import javax.inject.Singleton
import kotlinx.coroutines.tasks.await

/**
 * Centralised presence: `users/{uid}.online` + `lastSeen` (fields the web chat header reads).
 * Readers treat `online` as stale after [STALE_AFTER_MS] so a crashed client never looks online
 * forever; a light heartbeat refreshes `lastSeen` while the app is in the foreground.
 */
@Singleton
class PresenceManager @Inject constructor(
    private val auth: FirebaseAuth,
    private val firestore: FirebaseFirestore,
    private val settings: SettingsDataSource,
) {
    private var lastBeat = 0L

    suspend fun setOnline(online: Boolean) {
        val uid = auth.currentUser?.uid ?: return
        val visible = settings.current().showOnlineStatus
        val now = System.currentTimeMillis()
        lastBeat = now
        try {
            firestore.collection(Collections.USERS).document(uid)
                .set(mapOf("online" to (online && visible), "lastSeen" to now), SetOptions.merge())
                .await()
        } catch (_: Exception) {
        }
    }

    fun heartbeat() {
        val now = System.currentTimeMillis()
        if (now - lastBeat < HEARTBEAT_MS) return
        val uid = auth.currentUser?.uid ?: return
        lastBeat = now
        firestore.collection(Collections.USERS).document(uid)
            .set(mapOf("lastSeen" to now), SetOptions.merge())
    }

    companion object {
        const val HEARTBEAT_MS = 2 * 60_000L
        const val STALE_AFTER_MS = 5 * 60_000L

        fun isOnlineNow(online: Boolean, lastSeen: Long, now: Long = System.currentTimeMillis()): Boolean =
            online && now - lastSeen < STALE_AFTER_MS
    }
}
