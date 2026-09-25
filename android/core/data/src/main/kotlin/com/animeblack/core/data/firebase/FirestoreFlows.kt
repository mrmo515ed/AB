package com.animeblack.core.data.firebase

import com.google.firebase.firestore.DocumentReference
import com.google.firebase.firestore.DocumentSnapshot
import com.google.firebase.firestore.FirebaseFirestoreException
import com.google.firebase.firestore.MetadataChanges
import com.google.firebase.firestore.Query
import com.google.firebase.firestore.QuerySnapshot
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.flow.retryWhen

/**
 * Snapshot listeners as cold flows. The listener is registered on collection and removed when the
 * collector is cancelled (no leaked listeners). Transient backend errors are retried with
 * exponential backoff; permanent ones (permission, invalid query) propagate to the caller.
 */
fun DocumentReference.asFlow(includeMetadata: Boolean = false): Flow<DocumentSnapshot> = callbackFlow {
    val registration = addSnapshotListener(
        if (includeMetadata) MetadataChanges.INCLUDE else MetadataChanges.EXCLUDE,
    ) { snapshot, error ->
        if (error != null) {
            close(error)
            return@addSnapshotListener
        }
        if (snapshot != null) trySend(snapshot)
    }
    awaitClose { registration.remove() }
}.retryTransient()

fun Query.asFlow(includeMetadata: Boolean = false): Flow<QuerySnapshot> = callbackFlow {
    val registration = addSnapshotListener(
        if (includeMetadata) MetadataChanges.INCLUDE else MetadataChanges.EXCLUDE,
    ) { snapshot, error ->
        if (error != null) {
            close(error)
            return@addSnapshotListener
        }
        if (snapshot != null) trySend(snapshot)
    }
    awaitClose { registration.remove() }
}.retryTransient()

private val TRANSIENT_CODES = setOf(
    FirebaseFirestoreException.Code.UNAVAILABLE,
    FirebaseFirestoreException.Code.INTERNAL,
    FirebaseFirestoreException.Code.UNKNOWN,
    FirebaseFirestoreException.Code.DEADLINE_EXCEEDED,
    FirebaseFirestoreException.Code.RESOURCE_EXHAUSTED,
    FirebaseFirestoreException.Code.ABORTED,
)

private fun <T> Flow<T>.retryTransient(maxAttempts: Long = 6): Flow<T> = retryWhen { cause, attempt ->
    val transient = cause is FirebaseFirestoreException && cause.code in TRANSIENT_CODES
    if (transient && attempt < maxAttempts) {
        delay((1_000L shl attempt.toInt()).coerceAtMost(30_000L))
        true
    } else {
        false
    }
}

/** Data with server timestamps estimated locally, so pending writes still have a time. */
fun DocumentSnapshot.dataEstimated(): Map<String, Any?>? =
    getData(DocumentSnapshot.ServerTimestampBehavior.ESTIMATE)
