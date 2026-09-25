package com.animeblack.core.database

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import kotlinx.coroutines.flow.Flow

@Dao
interface PendingOperationDao {
    /** Returns -1 when an operation with the same dedupe key already exists (no duplicate work). */
    @Insert(onConflict = OnConflictStrategy.IGNORE)
    suspend fun insert(op: PendingOperation): Long

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsert(op: PendingOperation)

    @Query("SELECT * FROM pending_operations WHERE state != 'failed' AND ownerUid = :uid ORDER BY createdAt ASC LIMIT :limit")
    suspend fun nextBatch(uid: String, limit: Int = 25): List<PendingOperation>

    @Query("SELECT * FROM pending_operations WHERE id = :id")
    suspend fun byId(id: String): PendingOperation?

    @Query("SELECT * FROM pending_operations WHERE dedupeKey = :key")
    suspend fun byDedupeKey(key: String): PendingOperation?

    @Query("UPDATE pending_operations SET state = :state, attempts = :attempts, lastError = :error, updatedAt = :now WHERE id = :id")
    suspend fun updateState(id: String, state: String, attempts: Int, error: String?, now: Long)

    @Query("UPDATE pending_operations SET payload = :payload, updatedAt = :now WHERE id = :id")
    suspend fun updatePayload(id: String, payload: String, now: Long)

    @Query("UPDATE pending_operations SET progress = :progress, uploadSessionUri = :sessionUri, updatedAt = :now WHERE id = :id")
    suspend fun updateProgress(id: String, progress: Int, sessionUri: String?, now: Long)

    @Query("UPDATE pending_operations SET state = 'queued', attempts = 0, lastError = NULL WHERE state = 'failed' AND ownerUid = :uid")
    suspend fun requeueFailed(uid: String)

    @Query("UPDATE pending_operations SET state = 'queued' WHERE state = 'running'")
    suspend fun resetRunning()

    @Query("DELETE FROM pending_operations WHERE id = :id")
    suspend fun delete(id: String)

    @Query("DELETE FROM pending_operations WHERE dedupeKey = :key")
    suspend fun deleteByDedupeKey(key: String)

    @Query("SELECT * FROM pending_operations WHERE ownerUid = :uid ORDER BY createdAt ASC")
    fun observeAll(uid: String): Flow<List<PendingOperation>>

    @Query("SELECT COUNT(*) FROM pending_operations WHERE ownerUid = :uid AND state != 'failed'")
    fun observePendingCount(uid: String): Flow<Int>
}
