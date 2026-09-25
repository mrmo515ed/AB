package com.animeblack.core.data.outbox

import android.net.Uri
import com.animeblack.core.common.result.AppError
import com.animeblack.core.data.firebase.AppErrorException
import com.animeblack.core.data.firebase.Collections
import com.animeblack.core.data.firebase.FirebaseErrorMapper
import com.animeblack.core.data.firebase.mapList
import com.animeblack.core.data.firebase.obj
import com.animeblack.core.data.firebase.str
import com.animeblack.core.data.firebase.toStringKeyed
import com.animeblack.core.data.media.MediaPreparer
import com.animeblack.core.data.media.StorageUploader
import com.animeblack.core.database.PendingOperation
import com.animeblack.core.database.PendingOperationDao
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.UserProfileChangeRequest
import com.google.firebase.firestore.FieldValue
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.SetOptions
import java.io.File
import javax.inject.Inject
import javax.inject.Singleton
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.launch
import kotlinx.coroutines.tasks.await

/**
 * Executes outbox operations. Each handler is idempotent: document ids are client-generated and
 * uploaded file URLs are persisted in the payload, so a retry never duplicates a post or message.
 */
@Singleton
class OutboxProcessor @Inject constructor(
    private val dao: PendingOperationDao,
    private val outbox: OutboxRepository,
    private val auth: FirebaseAuth,
    private val firestore: FirebaseFirestore,
    private val uploader: StorageUploader,
    private val preparer: MediaPreparer,
    private val errorMapper: FirebaseErrorMapper,
) {
    private val json get() = outbox.json

    /** @return true when nothing retryable is left. */
    suspend fun processAll(): Boolean = coroutineScope {
        val uid = auth.currentUser?.uid ?: return@coroutineScope true
        dao.resetRunning()
        var needsRetry = false
        val attempted = mutableSetOf<String>()
        while (true) {
            val batch = dao.nextBatch(uid).filter { it.state == PendingOperation.STATE_QUEUED && it.id !in attempted }
            if (batch.isEmpty()) break
            for (op in batch) {
                attempted += op.id
                val now = System.currentTimeMillis()
                dao.updateState(op.id, PendingOperation.STATE_RUNNING, op.attempts, null, now)
                try {
                    execute(op, this)
                    dao.delete(op.id)
                } catch (c: CancellationException) {
                    dao.updateState(op.id, PendingOperation.STATE_QUEUED, op.attempts, null, System.currentTimeMillis())
                    throw c
                } catch (t: Throwable) {
                    val error = errorMapper.map(t)
                    val attempts = op.attempts + 1
                    val retry = error.isRetryable && attempts < PendingOperation.MAX_ATTEMPTS
                    dao.updateState(
                        op.id,
                        if (retry) PendingOperation.STATE_QUEUED else PendingOperation.STATE_FAILED,
                        attempts,
                        error.javaClass.simpleName + ": " + (t.message ?: "").take(200),
                        System.currentTimeMillis(),
                    )
                    if (retry) needsRetry = true
                }
            }
        }
        !needsRetry
    }

    private suspend fun execute(op: PendingOperation, scope: CoroutineScope) {
        when (op.type) {
            OutboxTypes.POST_PUBLISH -> publishPost(op, scope)
            OutboxTypes.CHAT_MEDIA -> sendChatMedia(op, scope)
            OutboxTypes.ROOM_MEDIA -> sendRoomMedia(op, scope)
            OutboxTypes.STORY_PUBLISH -> publishStory(op, scope)
            OutboxTypes.REEL_PUBLISH -> publishReel(op, scope)
            OutboxTypes.PROFILE_MEDIA -> uploadProfileMedia(op, scope)
            OutboxTypes.POLL_VOTE -> votePoll(op)
            else -> throw AppErrorException(AppError.Validation("outbox", "unknown type ${op.type}"))
        }
    }

    // ------------------------------------------------------------------ uploads
    private suspend fun uploadAll(
        op: PendingOperation,
        files: List<UploadFile>,
        scope: CoroutineScope,
        persist: suspend (List<UploadFile>) -> Unit,
    ): List<UploadFile> {
        val result = files.toMutableList()
        var lastReported = -1
        for ((index, file) in files.withIndex()) {
            if (file.downloadUrl != null) continue
            val local = File(Uri.parse(file.localUri).path.orEmpty())
            if (!local.exists()) throw AppErrorException(AppError.Validation("media", "missing local file"))
            val url = uploader.upload(local, file.storagePath, file.mimeType, if (index == 0) op.uploadSessionUri else null) { pct, session ->
                val overall = ((index * 100) + pct) / files.size.coerceAtLeast(1)
                if (overall - lastReported >= 5 || overall == 100) {
                    lastReported = overall
                    scope.launch { dao.updateProgress(op.id, overall, session, System.currentTimeMillis()) }
                }
            }
            result[index] = file.copy(downloadUrl = url)
            persist(result)
        }
        return result
    }

    private fun cleanup(files: List<UploadFile>) = files.forEach { preparer.deleteLocal(it.localUri) }

    private fun UploadFile.toAttachment(): Map<String, Any?> = mapOf(
        "type" to type,
        "src" to downloadUrl.orEmpty(),
        "name" to name,
        "size" to size,
        "path" to storagePath,
        "dur" to (durationMs / 1000).toInt(),
    )

    // ------------------------------------------------------------------ posts
    private suspend fun publishPost(op: PendingOperation, scope: CoroutineScope) {
        var payload = json.decodeFromString(PostPublishPayload.serializer(), op.payload)
        val uploaded = uploadAll(op, payload.files, scope) { files ->
            payload = payload.copy(files = files)
            dao.updatePayload(op.id, json.encodeToString(PostPublishPayload.serializer(), payload), System.currentTimeMillis())
        }
        val media = if (uploaded.isEmpty()) {
            null
        } else {
            val first = uploaded.first()
            mapOf(
                "kind" to first.type,
                "src" to first.downloadUrl.orEmpty(),
                "imgs" to uploaded.filter { it.type == "image" || it.type == "gif" }.map { it.downloadUrl.orEmpty() },
                "items" to uploaded.map { mapOf("type" to it.type, "src" to it.downloadUrl.orEmpty(), "name" to it.name, "size" to it.size) },
            )
        }
        val ref = firestore.collection(Collections.POSTS).document(payload.postId)
        if (payload.editing) {
            val update = mutableMapOf<String, Any?>(
                "text" to payload.text,
                "category" to payload.category,
                "tags" to payload.tags,
                "mentions" to payload.mentions,
                "location" to payload.location,
                "privacy" to payload.privacy,
                "spoiler" to payload.spoiler,
                "warningText" to payload.warningText,
                "isEdited" to true,
                "updatedAt" to System.currentTimeMillis(),
            )
            if (media != null) update["media"] = media
            ref.set(update, SetOptions.merge()).await()
        } else {
            ref.set(postDocument(payload, media)).await()
        }
        cleanup(uploaded)
    }

    // ------------------------------------------------------------------ chat
    private suspend fun sendChatMedia(op: PendingOperation, scope: CoroutineScope) {
        val uid = auth.currentUser?.uid ?: throw AppErrorException(AppError.Unauthenticated())
        var payload = json.decodeFromString(ChatMediaPayload.serializer(), op.payload)
        val uploaded = uploadAll(op, payload.files, scope) { files ->
            payload = payload.copy(files = files)
            dao.updatePayload(op.id, json.encodeToString(ChatMediaPayload.serializer(), payload), System.currentTimeMillis())
        }
        val attachments = uploaded.map { it.toAttachment() }
        val first = uploaded.firstOrNull()
        val message = buildMap<String, Any?> {
            put("id", payload.messageId)
            put("clientMessageId", payload.messageId)
            put("conversationId", payload.chatId)
            put("senderId", uid)
            put("senderName", payload.senderName)
            put("type", payload.type)
            put("text", payload.text)
            put("attachments", attachments)
            put("src", first?.downloadUrl)
            put("name", first?.name)
            put("size", first?.size)
            put("at", payload.at)
            put("createdAt", FieldValue.serverTimestamp())
            put("updatedAt", System.currentTimeMillis())
            put("st", 2)
            put("reacts", emptyList<String>())
            put("isEdited", false)
            put("isDeleted", false)
            put("isScheduled", false)
            put("platform", "android")
            if (payload.voiceDurationSec > 0) put("dur", payload.voiceDurationSec)
            if (payload.replyToId != null) {
                put("replyToMessageId", payload.replyToId)
                put("quote", mapOf("id" to payload.replyToId, "t" to payload.replyToText.orEmpty(), "n" to payload.replyToName.orEmpty(), "type" to (payload.replyToType ?: "text")))
            }
        }
        val chatRef = firestore.collection(Collections.CHATS).document(payload.chatId)
        val preview = previewFor(payload.type, payload.text, uploaded.size)
        chatRef.set(
            mapOf(
                "id" to payload.chatId,
                "participants" to listOf(uid, payload.partnerId).distinct().sorted(),
                "last" to preview,
                "lastAt" to payload.at,
                "lastSenderId" to uid,
                "updatedAt" to System.currentTimeMillis(),
                "typing" to mapOf(uid to 0),
                "unreadCounts" to mapOf(payload.partnerId to FieldValue.increment(1)),
            ),
            SetOptions.merge(),
        ).await()
        chatRef.collection(Collections.MESSAGES).document(payload.messageId).set(message).await()
        cleanup(uploaded)
    }

    private fun previewFor(type: String, text: String, count: Int): String = when {
        text.isNotBlank() -> text.take(200)
        type == "voice" -> "رسالة صوتية"
        type == "sticker" -> "ملصق"
        count > 1 -> "$count وسائط"
        type == "image" -> "صورة"
        type == "video" -> "فيديو"
        else -> "ملف"
    }

    private suspend fun sendRoomMedia(op: PendingOperation, scope: CoroutineScope) {
        val uid = auth.currentUser?.uid ?: throw AppErrorException(AppError.Unauthenticated())
        var payload = json.decodeFromString(RoomMediaPayload.serializer(), op.payload)
        val uploaded = uploadAll(op, payload.files, scope) { files ->
            payload = payload.copy(files = files)
            dao.updatePayload(op.id, json.encodeToString(RoomMediaPayload.serializer(), payload), System.currentTimeMillis())
        }
        val attachments = uploaded.map { it.toAttachment() }
        val type = when {
            uploaded.size > 1 -> "media"
            uploaded.size == 1 -> uploaded.first().type
            else -> "text"
        }
        val message = mapOf(
            "id" to payload.messageId,
            "uid" to uid,
            "senderId" to uid,
            "senderName" to payload.senderName,
            "senderAvatar" to payload.senderAvatar,
            "text" to payload.text,
            "type" to type,
            "attachments" to attachments,
            "src" to uploaded.firstOrNull()?.downloadUrl,
            "at" to payload.at,
            "createdAt" to payload.at,
            "st" to 2,
            "platform" to "android",
        )
        when (payload.kind) {
            "group" -> {
                val groupRef = firestore.collection(Collections.GROUPS).document(payload.roomId)
                groupRef.collection(Collections.MESSAGES).document(payload.messageId).set(message).await()
                groupRef.set(
                    mapOf("lastMsg" to previewFor(type, payload.text, uploaded.size), "lastAt" to payload.at, "updatedAt" to System.currentTimeMillis()),
                    SetOptions.merge(),
                ).await()
            }
            "world" -> firestore.collection(Collections.WORLDS).document(payload.roomId)
                .collection(Collections.MESSAGES).document(payload.messageId).set(message).await()
            else -> firestore.collection(Collections.COMMUNITIES).document(payload.roomId)
                .collection(Collections.CHANNELS).document(payload.channelId ?: "general")
                .collection(Collections.MESSAGES).document(payload.messageId).set(message).await()
        }
        cleanup(uploaded)
    }

    // ------------------------------------------------------------------ stories & reels
    private suspend fun publishStory(op: PendingOperation, scope: CoroutineScope) {
        val uid = auth.currentUser?.uid ?: throw AppErrorException(AppError.Unauthenticated())
        var payload = json.decodeFromString(StoryPublishPayload.serializer(), op.payload)
        val uploaded = uploadAll(op, listOfNotNull(payload.file), scope) { files ->
            payload = payload.copy(file = files.firstOrNull())
            dao.updatePayload(op.id, json.encodeToString(StoryPublishPayload.serializer(), payload), System.currentTimeMillis())
        }
        val file = uploaded.firstOrNull()
        val item = mapOf(
            "id" to payload.itemId,
            "type" to (file?.type ?: "text"),
            "c1" to payload.color1,
            "c2" to payload.color2,
            "solidCol" to "",
            "emo" to "flame",
            "text" to payload.text,
            "font" to "Tajawal",
            "align" to "center",
            "createdAt" to payload.createdAt,
            "stickers" to emptyList<Any>(),
            "img" to if (file?.type == "image") file.downloadUrl.orEmpty() else "",
            "video" to if (file?.type == "video") file.downloadUrl.orEmpty() else "",
            "tc" to payload.textColor,
            "sz" to payload.textSize,
            "closeFriends" to payload.closeFriends,
        )
        val doc = mutableMapOf<String, Any?>(
            "id" to payload.storyId,
            "userId" to uid,
            "userName" to payload.userName,
            "userAvatar" to payload.userAvatar,
            "privacy" to if (payload.closeFriends) "closeFriends" else "public",
            "closeFriends" to payload.closeFriends,
            "items" to FieldValue.arrayUnion(item),
            "expiresAt" to payload.createdAt + 86_400_000L,
        )
        if (payload.newDoc) {
            doc["createdAt"] = payload.createdAt
            doc["seen"] = false
            doc["views"] = emptyList<Any>()
            doc["reactions"] = emptyList<Any>()
        }
        firestore.collection(Collections.STORIES).document(payload.storyId).set(doc, SetOptions.merge()).await()
        cleanup(uploaded)
    }

    private suspend fun publishReel(op: PendingOperation, scope: CoroutineScope) {
        val uid = auth.currentUser?.uid ?: throw AppErrorException(AppError.Unauthenticated())
        var payload = json.decodeFromString(ReelPublishPayload.serializer(), op.payload)
        val uploaded = uploadAll(op, listOf(payload.file), scope) { files ->
            payload = payload.copy(file = files.first())
            dao.updatePayload(op.id, json.encodeToString(ReelPublishPayload.serializer(), payload), System.currentTimeMillis())
        }
        val reel = mapOf(
            "id" to payload.reelId,
            "authorId" to uid,
            "authorName" to payload.authorName,
            "authorAvatar" to payload.authorAvatar,
            "video" to uploaded.first().downloadUrl.orEmpty(),
            "cover" to "",
            "text" to payload.caption,
            "music" to payload.music,
            "speed" to 1,
            "fx" to "none",
            "fxStyle" to "",
            "likes" to 0,
            "likedUsers" to emptyList<String>(),
            "comments" to emptyList<Any>(),
            "commentsCount" to 0,
            "shares" to 0,
            "views" to 1,
            "createdAt" to payload.createdAt,
            "platform" to "android",
        )
        firestore.collection(Collections.REELS).document(payload.reelId).set(reel).await()
        cleanup(uploaded)
    }

    private suspend fun uploadProfileMedia(op: PendingOperation, scope: CoroutineScope) {
        val user = auth.currentUser ?: throw AppErrorException(AppError.Unauthenticated())
        var payload = json.decodeFromString(ProfileMediaPayload.serializer(), op.payload)
        val uploaded = uploadAll(op, listOf(payload.file), scope) { files ->
            payload = payload.copy(file = files.first())
            dao.updatePayload(op.id, json.encodeToString(ProfileMediaPayload.serializer(), payload), System.currentTimeMillis())
        }
        val url = uploaded.first().downloadUrl.orEmpty()
        firestore.collection(Collections.USERS).document(user.uid)
            .set(mapOf(payload.field to url, "updatedAt" to System.currentTimeMillis()), SetOptions.merge()).await()
        if (payload.field == "avatar") {
            try {
                user.updateProfile(UserProfileChangeRequest.Builder().setPhotoUri(Uri.parse(url)).build()).await()
            } catch (_: Exception) {
            }
        }
        cleanup(uploaded)
    }

    // ------------------------------------------------------------------ poll votes (transaction)
    private suspend fun votePoll(op: PendingOperation) {
        val uid = auth.currentUser?.uid ?: throw AppErrorException(AppError.Unauthenticated())
        val payload = json.decodeFromString(PollVotePayload.serializer(), op.payload)
        val ref = firestore.collection(Collections.POSTS).document(payload.postId)
        firestore.runTransaction { tx ->
            val snap = tx.get(ref)
            val data = snap.data ?: return@runTransaction null
            val poll = (data["poll"] as? Map<*, *>)?.toStringKeyed() ?: return@runTransaction null
            val votes = poll.obj("votes").orEmpty()
            if (votes.containsKey(uid)) return@runTransaction null
            val options = poll.mapList("options").mapIndexed { i, o ->
                val id = o.str("id").ifBlank { i.toString() }
                if (id == payload.optionId) o + ("v" to ((o["v"] as? Number)?.toLong() ?: 0L) + 1) else o
            }
            val newPoll = poll + mapOf("options" to options, "votes" to votes + (uid to payload.optionId))
            tx.update(ref, mapOf("poll" to newPoll, "updatedAt" to System.currentTimeMillis()))
            null
        }.await()
    }

    companion object {
        fun postDocument(payload: PostPublishPayload, media: Map<String, Any?>?): Map<String, Any?> = mapOf(
            "id" to payload.postId,
            "authorId" to payload.author.id,
            "author" to mapOf(
                "id" to payload.author.id,
                "uid" to payload.author.id,
                "name" to payload.author.name,
                "username" to payload.author.username,
                "avatar" to payload.author.avatar,
                "isVerified" to payload.author.isVerified,
                "role" to payload.author.role,
                "level" to payload.author.level,
            ),
            "category" to payload.category.ifBlank { "عام" },
            "text" to payload.text,
            "media" to media,
            "poll" to payload.pollQuestion?.takeIf { it.isNotBlank() }?.let { q ->
                mapOf(
                    "question" to q,
                    "options" to payload.pollOptions.mapIndexed { i, t -> mapOf("id" to i, "t" to t, "v" to 0) },
                    "votes" to emptyMap<String, Any>(),
                    "voted" to null,
                    "isMultiple" to false,
                    "anon" to false,
                )
            },
            "linkPreview" to null,
            "quotedPost" to null,
            "location" to payload.location,
            "tags" to payload.tags,
            "mentions" to payload.mentions,
            "privacy" to payload.privacy,
            "spoiler" to payload.spoiler,
            "warningText" to payload.warningText,
            "settings" to mapOf("allowComments" to payload.allowComments, "allowSharing" to true),
            "likes" to 0,
            "likedUsers" to emptyList<Any>(),
            "comments" to emptyList<Any>(),
            "commentsCount" to 0,
            "shares" to 0,
            "reposts" to 0,
            "views" to 1,
            "createdAt" to payload.createdAt,
            "at" to payload.createdAt,
            "platform" to "android",
        )
    }
}
