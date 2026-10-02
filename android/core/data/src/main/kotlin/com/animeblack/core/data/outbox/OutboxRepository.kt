package com.animeblack.core.data.outbox

import android.content.Context
import androidx.work.BackoffPolicy
import androidx.work.Constraints
import androidx.work.ExistingWorkPolicy
import androidx.work.NetworkType
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.WorkManager
import com.animeblack.core.common.dispatchers.ApplicationScope
import com.animeblack.core.common.util.Ids
import com.animeblack.core.data.firebase.activeUid
import com.animeblack.core.database.PendingOperation
import com.animeblack.core.database.PendingOperationDao
import com.google.firebase.auth.FirebaseAuth
import dagger.Lazy
import dagger.hilt.android.qualifiers.ApplicationContext
import java.util.concurrent.TimeUnit
import javax.inject.Inject
import javax.inject.Singleton
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.launch
import kotlinx.serialization.KSerializer
import kotlinx.serialization.json.Json

/**
 * Enqueues durable operations, runs [OutboxProcessor] immediately in-process for instant UX,
 * and schedules [OutboxWorker] as a durable background safety net.
 */
@Singleton
class OutboxRepository @Inject constructor(
    @ApplicationContext private val context: Context,
    private val dao: PendingOperationDao,
    private val auth: FirebaseAuth,
    private val processor: Lazy<OutboxProcessor>,
    @ApplicationScope private val appScope: CoroutineScope,
) {
    val json = Json { ignoreUnknownKeys = true; encodeDefaults = true }

    suspend fun <T> enqueue(type: String, dedupeKey: String, payload: T, serializer: KSerializer<T>): Boolean {
        val uid = auth.activeUid() ?: return false
        val now = System.currentTimeMillis()
        val inserted = dao.insert(
            PendingOperation(
                id = "op_${Ids.short()}",
                type = type,
                payload = json.encodeToString(serializer, payload),
                dedupeKey = dedupeKey,
                ownerUid = uid,
                createdAt = now,
                updatedAt = now,
            ),
        )
        schedule()
        return inserted != -1L
    }

    fun schedule() {
        appScope.launch {
            runCatching { processor.get().processAll() }
        }
        runCatching {
            val request = OneTimeWorkRequestBuilder<OutboxWorker>()
                .setConstraints(Constraints.Builder().setRequiredNetworkType(NetworkType.CONNECTED).build())
                .setBackoffCriteria(BackoffPolicy.EXPONENTIAL, 15, TimeUnit.SECONDS)
                .build()
            WorkManager.getInstance(context).enqueueUniqueWork(WORK_NAME, ExistingWorkPolicy.APPEND_OR_REPLACE, request)
        }
    }

    fun observe(): Flow<List<PendingOperation>> {
        val uid = auth.activeUid() ?: return flowOf(emptyList())
        return dao.observeAll(uid)
    }

    suspend fun retryFailed() {
        val uid = auth.activeUid() ?: return
        dao.requeueFailed(uid)
        schedule()
    }

    suspend fun cancel(id: String) = dao.delete(id)

    companion object {
        const val WORK_NAME = "anime_black_outbox"
    }
}
