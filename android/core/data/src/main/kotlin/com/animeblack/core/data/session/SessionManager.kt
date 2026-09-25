package com.animeblack.core.data.session

import com.animeblack.core.common.config.AppConfig
import com.animeblack.core.common.dispatchers.ApplicationScope
import com.animeblack.core.common.result.AppResult
import com.animeblack.core.common.result.runCatchingApp
import com.animeblack.core.common.util.Ids
import com.animeblack.core.data.firebase.Collections
import com.animeblack.core.data.firebase.FirebaseErrorMapper
import com.animeblack.core.data.firebase.asFlow
import com.animeblack.core.data.mapper.toSession
import com.animeblack.core.data.repository.SessionRepository
import com.animeblack.core.datastore.SettingsDataSource
import com.animeblack.core.model.UserSession
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.SetOptions
import javax.inject.Inject
import javax.inject.Singleton
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.flow.emptyFlow
import kotlinx.coroutines.flow.flatMapLatest
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.launch
import kotlinx.coroutines.tasks.await

/**
 * Registers this device as a session in `sessions/{id}` (same schema as the web), keeps
 * `lastActive` fresh and signs the user out when the session is revoked from another device.
 */
@Singleton
class SessionManager @Inject constructor(
    private val auth: FirebaseAuth,
    private val firestore: FirebaseFirestore,
    private val settings: SettingsDataSource,
    private val config: AppConfig,
    private val errorMapper: FirebaseErrorMapper,
    @ApplicationScope private val scope: CoroutineScope,
) : SessionRepository {

    private val _currentSessionId = MutableStateFlow<String?>(null)
    override val currentSessionId: StateFlow<String?> = _currentSessionId.asStateFlow()
    private var watchJob: Job? = null
    private var lastTouch = 0L
    var onRemoteRevoke: (() -> Unit)? = null

    suspend fun start(uid: String) {
        val deviceId = settings.deviceId()
        val existing = settings.sessionId()
        val sessionId = existing ?: Ids.session()
        val now = System.currentTimeMillis()
        val data = mapOf(
            "sessionId" to sessionId,
            "userId" to uid,
            "deviceId" to deviceId,
            "platform" to "android",
            "deviceName" to DeviceInfo.deviceName(),
            "userAgent" to DeviceInfo.userAgent(config),
            "appVersion" to config.versionName,
            "lastActive" to now,
        ) + if (existing == null) mapOf("startTime" to now) else emptyMap()
        try {
            firestore.collection(Collections.SESSIONS).document(sessionId).set(data, SetOptions.merge()).await()
        } catch (_: Exception) {
            // Offline: the write stays queued in the Firestore cache.
        }
        settings.setSessionId(sessionId)
        _currentSessionId.value = sessionId
        watchRevocation(sessionId)
    }

    private fun watchRevocation(sessionId: String) {
        watchJob?.cancel()
        watchJob = scope.launch {
            var seenExisting = false
            firestore.collection(Collections.SESSIONS).document(sessionId).asFlow()
                .catch { }
                .collect { snap ->
                    if (snap.exists()) {
                        seenExisting = true
                    } else if (seenExisting && !snap.metadata.isFromCache) {
                        onRemoteRevoke?.invoke()
                    }
                }
        }
    }

    fun touch() {
        val sessionId = _currentSessionId.value ?: return
        val now = System.currentTimeMillis()
        if (now - lastTouch < 10 * 60_000L) return
        lastTouch = now
        firestore.collection(Collections.SESSIONS).document(sessionId)
            .set(mapOf("lastActive" to now), SetOptions.merge())
    }

    suspend fun end() {
        watchJob?.cancel()
        watchJob = null
        val sessionId = _currentSessionId.value ?: settings.sessionId()
        if (sessionId != null) {
            try {
                firestore.collection(Collections.SESSIONS).document(sessionId).delete().await()
            } catch (_: Exception) {
            }
        }
        settings.setSessionId(null)
        _currentSessionId.value = null
    }

    override fun observeSessions(): Flow<List<UserSession>> =
        currentSessionId.flatMapLatest {
            val uid = auth.currentUser?.uid ?: return@flatMapLatest emptyFlow()
            firestore.collection(Collections.SESSIONS).whereEqualTo("userId", uid).asFlow()
                .map { snap -> snap.documents.mapNotNull { d -> d.data?.toSession(d.id) }.sortedByDescending { it.lastActive } }
                .catch { emit(emptyList()) }
        }

    override suspend fun revoke(sessionId: String): AppResult<Unit> = runCatchingApp(errorMapper) {
        firestore.collection(Collections.SESSIONS).document(sessionId).delete().await()
        Unit
    }
}
