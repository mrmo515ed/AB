package com.animeblack.core.data.firebase

import com.animeblack.core.common.result.AppError
import com.google.android.gms.tasks.Task
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.DocumentReference
import com.google.firebase.firestore.DocumentSnapshot
import com.google.firebase.firestore.Query
import com.google.firebase.firestore.QuerySnapshot
import com.google.firebase.firestore.Source
import kotlinx.coroutines.tasks.await
import kotlinx.coroutines.withTimeoutOrNull

/**
 * Holds an optional fallback guest UID when Firebase Console providers (Anonymous / Email) are disabled,
 * so the user can still enter via Quick Start and use every feature with Firestore local cache.
 */
internal object ActiveSessionHolder {
    @Volatile var fallbackUid: String? = null
    @Volatile var fallbackName: String? = null
    @Volatile var fallbackUsername: String? = null
}

internal fun FirebaseAuth.activeUid(): String? =
    currentUser?.uid ?: ActiveSessionHolder.fallbackUid

internal fun FirebaseAuth.requireUid(): String =
    activeUid() ?: throw AppErrorException(AppError.Unauthenticated())

/**
 * Waits up to [timeoutMs] for a Firestore write ACK. Because Firestore PersistentCache queues writes
 * locally in <5ms, timing out the remote ACK never loses data and prevents UI / Outbox hangs.
 */
internal suspend fun <T> Task<T>.awaitWrite(timeoutMs: Long = 1_500L): T? =
    withTimeoutOrNull(timeoutMs) {
        try {
            await()
        } catch (_: Exception) {
            null
        }
    }

/**
 * Fast DocumentReference read: tries local cache first if [preferCache] is true, then network with a
 * short timeout, falling back to cache so UI actions never block for 10–15s.
 */
internal suspend fun DocumentReference.getFast(
    timeoutMs: Long = 2_200L,
    preferCache: Boolean = false,
): DocumentSnapshot? {
    if (preferCache) {
        val cached = try {
            get(Source.CACHE).await()
        } catch (_: Exception) {
            null
        }
        if (cached != null && cached.exists()) return cached
    }
    val server = withTimeoutOrNull(timeoutMs) {
        try {
            get().await()
        } catch (_: Exception) {
            null
        }
    }
    if (server != null) return server
    return try {
        get(Source.CACHE).await()
    } catch (_: Exception) {
        null
    }
}

/** Fast Query read with a bounded timeout and cache fallback. */
internal suspend fun Query.getFast(timeoutMs: Long = 2_500L): QuerySnapshot? {
    val server = withTimeoutOrNull(timeoutMs) {
        try {
            get().await()
        } catch (_: Exception) {
            null
        }
    }
    if (server != null) return server
    return try {
        get(Source.CACHE).await()
    } catch (_: Exception) {
        null
    }
}
