package com.animeblack.core.database

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey

/**
 * Durable outbox entry. Plain Firestore writes are already persisted and retried by the Firestore
 * SDK's offline queue; this table only holds work the SDK cannot queue on its own:
 *  - transactional updates (likes/reactions/poll votes/comment edits) that need the server state,
 *  - media uploads to Cloud Storage followed by the Firestore write that references them.
 */
@Entity(
    tableName = "pending_operations",
    indices = [Index(value = ["state"]), Index(value = ["dedupeKey"], unique = true)],
)
data class PendingOperation(
    @PrimaryKey val id: String,
    /** Operation type, e.g. `post.like`, `chat.sendMedia`, `story.publish`. */
    val type: String,
    /** JSON payload interpreted by the operation handler. */
    val payload: String,
    /** Unique key that prevents duplicate operations (e.g. `like:<postId>:<uid>`). */
    val dedupeKey: String,
    val ownerUid: String,
    @ColumnInfo(defaultValue = "0") val attempts: Int = 0,
    /** queued | running | failed */
    @ColumnInfo(defaultValue = "queued") val state: String = STATE_QUEUED,
    val lastError: String? = null,
    @ColumnInfo(defaultValue = "0") val progress: Int = 0,
    /** Cloud Storage resumable-upload session, so an interrupted upload continues where it stopped. */
    val uploadSessionUri: String? = null,
    val createdAt: Long,
    val updatedAt: Long,
) {
    companion object {
        const val STATE_QUEUED = "queued"
        const val STATE_RUNNING = "running"
        const val STATE_FAILED = "failed"
        const val MAX_ATTEMPTS = 8
    }
}
