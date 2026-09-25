package com.animeblack.core.data.repository.impl

import android.net.Uri
import com.animeblack.core.common.result.AppError
import com.animeblack.core.common.result.AppResult
import com.animeblack.core.common.result.runCatchingApp
import com.animeblack.core.common.util.Ids
import com.animeblack.core.common.util.Validators
import com.animeblack.core.data.firebase.AppErrorException
import com.animeblack.core.data.firebase.Collections
import com.animeblack.core.data.firebase.FirebaseErrorMapper
import com.animeblack.core.data.firebase.asFlow
import com.animeblack.core.data.firebase.dataEstimated
import com.animeblack.core.data.firebase.requireUid
import com.animeblack.core.data.mapper.toChatMessage
import com.animeblack.core.data.mapper.toChatRequest
import com.animeblack.core.data.mapper.toConversation
import com.animeblack.core.data.media.MediaPreparer
import com.animeblack.core.data.outbox.ChatMediaPayload
import com.animeblack.core.data.outbox.OutboxRepository
import com.animeblack.core.data.outbox.OutboxTypes
import com.animeblack.core.data.outbox.UploadFile
import com.animeblack.core.data.repository.ChatRepository
import com.animeblack.core.data.repository.UserRepository
import com.animeblack.core.database.PendingOperation
import com.animeblack.core.datastore.SettingsDataSource
import com.animeblack.core.model.Attachment
import com.animeblack.core.model.ChatMessage
import com.animeblack.core.model.ChatRequest
import com.animeblack.core.model.Conversation
import com.animeblack.core.model.DmPermission
import com.animeblack.core.model.MessageQuote
import com.animeblack.core.model.MessageStatus
import com.animeblack.core.model.OutgoingMessage
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FieldValue
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.Query
import com.google.firebase.firestore.SetOptions
import com.google.firebase.functions.FirebaseFunctions
import java.util.concurrent.ConcurrentHashMap
import javax.inject.Inject
import javax.inject.Singleton
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.tasks.await

@Singleton
class FirestoreChatRepository @Inject constructor(
    private val auth: FirebaseAuth,
    private val firestore: FirebaseFirestore,
    private val functions: FirebaseFunctions,
    private val users: UserRepository,
    private val outbox: OutboxRepository,
    private val preparer: MediaPreparer,
    private val settings: SettingsDataSource,
    private val errorMapper: FirebaseErrorMapper,
) : ChatRepository {

    private val chats get() = firestore.collection(Collections.CHATS)
    private fun messages(chatId: String) = chats.document(chatId).collection(Collections.MESSAGES)
    private val signedUrlCache = ConcurrentHashMap<String, Pair<String, Long>>()

    // ------------------------------------------------------------------ conversations
    override fun observeConversations(): Flow<List<Conversation>> {
        val uid = auth.currentUser?.uid ?: return flowOf(emptyList())
        return chats.whereArrayContains("participants", uid).asFlow().map { snap ->
            snap.documents.mapNotNull { d -> d.data?.toConversation(d.id, uid) }
                .filter { !it.deleted && it.partnerId.isNotBlank() && it.partnerId != uid }
                .distinctBy { it.partnerId }
                .sortedByDescending { it.lastAt }
        }
    }

    override fun observeConversation(chatId: String): Flow<Conversation?> {
        val uid = auth.currentUser?.uid ?: return flowOf(null)
        return chats.document(chatId).asFlow().map { it.data?.toConversation(it.id, uid) }.catch { emit(null) }
    }

    // ------------------------------------------------------------------ messages
    override fun observeMessages(chatId: String, limit: Long): Flow<List<ChatMessage>> {
        val uid = auth.currentUser?.uid ?: return flowOf(emptyList())
        return messages(chatId).orderBy("at", Query.Direction.DESCENDING).limit(limit)
            .asFlow(includeMetadata = true)
            .map { snap ->
                snap.documents.mapNotNull { d ->
                    d.dataEstimated()?.toChatMessage(d.id, chatId, d.metadata.hasPendingWrites())
                }.filter { it.isVisibleTo(uid) }.sortedBy { it.at }
            }
    }

    /** Attachment messages still in the outbox (uploading or failed) rendered in the chat. */
    override fun observePendingMedia(chatId: String): Flow<List<ChatMessage>> = outbox.observe().map { ops ->
        val uid = auth.currentUser?.uid.orEmpty()
        ops.filter { it.type == OutboxTypes.CHAT_MEDIA }.mapNotNull { op ->
            val p = try {
                outbox.json.decodeFromString(ChatMediaPayload.serializer(), op.payload)
            } catch (_: Exception) {
                null
            } ?: return@mapNotNull null
            if (p.chatId != chatId) return@mapNotNull null
            ChatMessage(
                id = p.messageId,
                conversationId = chatId,
                senderId = uid,
                senderName = p.senderName,
                type = p.type,
                text = p.text,
                attachments = p.files.map { Attachment(it.type, it.downloadUrl ?: it.localUri, it.name, it.size, durationSec = (it.durationMs / 1000).toInt()) },
                at = p.at,
                status = if (op.state == PendingOperation.STATE_FAILED) MessageStatus.Failed else MessageStatus.Sending,
                isPending = true,
                uploadProgress = op.progress,
                voiceDurationSec = p.voiceDurationSec,
                replyTo = p.replyToId?.let { MessageQuote(it, p.replyToText.orEmpty(), p.replyToName.orEmpty(), p.replyToType ?: "text") },
            )
        }
    }

    override suspend fun loadOlder(chatId: String, beforeAt: Long, pageSize: Long): AppResult<List<ChatMessage>> = runCatchingApp(errorMapper) {
        val uid = auth.requireUid()
        messages(chatId).orderBy("at", Query.Direction.DESCENDING).whereLessThan("at", beforeAt).limit(pageSize).get().await()
            .documents.mapNotNull { d -> d.dataEstimated()?.toChatMessage(d.id, chatId) }
            .filter { it.isVisibleTo(uid) }
            .sortedBy { it.at }
    }

    // ------------------------------------------------------------------ permissions (web canDirectMessage)
    override suspend fun dmPermission(partnerId: String): DmPermission {
        val me = auth.currentUser?.uid ?: return DmPermission.Blocked
        if (partnerId == me) return DmPermission.Self
        val state = users.observeUserState().first()
        if (partnerId in state.blocked) return DmPermission.Blocked
        val partner = users.getUser(partnerId) ?: return DmPermission.Allowed
        val existing = try {
            chats.document(Conversation.canonicalId(me, partnerId)).get().await()
        } catch (_: Exception) {
            null
        }
        if (existing != null && existing.exists() && (existing.getString("last")?.isNotBlank() == true)) return DmPermission.Allowed
        val iFollow = partnerId in state.following
        val partnerFollowsMe = me in partner.followingList
        return when (partner.privacy.allowDM) {
            "nobody" -> DmPermission.Closed
            "friends" -> if (iFollow && partnerFollowsMe) DmPermission.Allowed else DmPermission.RequiresRequest
            "followers" -> if (partnerFollowsMe || iFollow) DmPermission.Allowed else DmPermission.RequiresRequest
            else -> if (partner.requiresChatRequest) DmPermission.RequiresRequest else DmPermission.Allowed
        }
    }

    override suspend fun openConversation(partnerId: String): AppResult<String> = runCatchingApp(errorMapper) {
        val me = auth.requireUid()
        if (partnerId == me) throw AppErrorException(AppError.Validation("chat", "self"))
        val chatId = Conversation.canonicalId(me, partnerId)
        chats.document(chatId).set(
            mapOf(
                "id" to chatId,
                "participants" to listOf(me, partnerId).sorted(),
                "userId" to partnerId,
                "type" to "private",
                "updatedAt" to System.currentTimeMillis(),
            ),
            SetOptions.merge(),
        )
        chatId
    }

    // ------------------------------------------------------------------ send
    override suspend fun send(chatId: String, partnerId: String, message: OutgoingMessage): AppResult<Unit> = runCatchingApp(errorMapper) {
        val me = auth.requireUid()
        message.editMessageId?.let { id ->
            edit(chatId, id, message.text)
            return@runCatchingApp
        }
        val text = message.text.trim()
        if (text.length > MAX_MESSAGE_LENGTH) throw AppErrorException(AppError.Validation("message", "too-long"))
        val state = users.observeUserState().first()
        if (partnerId in state.blocked) throw AppErrorException(AppError.PermissionDenied())

        val senderName = users.getUser(me)?.displayName ?: auth.currentUser?.displayName.orEmpty()
        val messageId = Ids.message()
        val now = System.currentTimeMillis()

        if (message.attachments.isNotEmpty()) {
            val files = message.attachments.take(MAX_ATTACHMENTS).map { item ->
                val prepared = preparer.prepare(item)
                val media = (prepared as? AppResult.Success)?.data ?: throw AppErrorException(prepared.errorOrNull() ?: AppError.Unknown())
                if (media.sizeBytes >= MAX_CHAT_MEDIA_BYTES) throw AppErrorException(AppError.Validation("media", "too-large"))
                val ext = Uri.parse(media.uri).lastPathSegment?.substringAfterLast('.', "bin") ?: "bin"
                UploadFile(
                    localUri = media.uri,
                    mimeType = media.mimeType,
                    type = if (item.type == "voice") "voice" else media.type,
                    name = media.name,
                    size = media.sizeBytes,
                    durationMs = media.durationMs,
                    storagePath = "chats/$chatId/$me/${now}_${Ids.short().take(5)}.$ext",
                )
            }
            val type = when {
                message.voiceDurationSec > 0 -> ChatMessage.TYPE_VOICE
                files.size > 1 -> ChatMessage.TYPE_MEDIA
                else -> files.first().type
            }
            outbox.enqueue(
                OutboxTypes.CHAT_MEDIA,
                "chat:$messageId",
                ChatMediaPayload(
                    chatId = chatId,
                    partnerId = partnerId,
                    messageId = messageId,
                    senderName = senderName,
                    text = text,
                    type = type,
                    at = now,
                    replyToId = message.replyTo?.id,
                    replyToText = message.replyTo?.text,
                    replyToName = message.replyTo?.senderName,
                    replyToType = message.replyTo?.type,
                    voiceDurationSec = message.voiceDurationSec,
                    files = files,
                ),
                ChatMediaPayload.serializer(),
            )
            return@runCatchingApp
        }

        val (type, attachments) = when {
            message.stickerUrl != null -> ChatMessage.TYPE_STICKER to listOf(mapOf("type" to "sticker", "src" to message.stickerUrl, "name" to "sticker", "size" to 0))
            message.gifUrl != null -> ChatMessage.TYPE_GIF to listOf(mapOf("type" to "gif", "src" to message.gifUrl, "name" to "gif", "size" to 0))
            else -> ChatMessage.TYPE_TEXT to emptyList()
        }
        if (text.isEmpty() && attachments.isEmpty()) throw AppErrorException(AppError.Validation("message", "empty"))

        val doc = buildMap<String, Any?> {
            put("id", messageId)
            put("clientMessageId", messageId)
            put("conversationId", chatId)
            put("senderId", me)
            put("senderName", senderName)
            put("type", type)
            put("text", text)
            put("attachments", attachments)
            put("src", attachments.firstOrNull()?.get("src"))
            put("at", now)
            put("createdAt", FieldValue.serverTimestamp())
            put("updatedAt", now)
            put("st", 2)
            put("reacts", emptyList<String>())
            put("isEdited", false)
            put("isDeleted", false)
            put("isScheduled", false)
            put("platform", "android")
            val mentions = Validators.extractMentions(text)
            if (mentions.isNotEmpty()) put("mentions", mentions)
            message.replyTo?.let { q ->
                put("replyToMessageId", q.id)
                put("quote", mapOf("id" to q.id, "t" to q.text.take(60), "n" to q.senderName, "type" to q.type))
            }
        }
        val preview = when (type) {
            ChatMessage.TYPE_STICKER -> "ملصق"
            ChatMessage.TYPE_GIF -> "GIF"
            else -> text.take(200)
        }
        // Order matters: the parent chat (participants) must exist before the message write is
        // evaluated by the rules. Both writes are queued durably and replayed in order offline.
        chats.document(chatId).set(
            mapOf(
                "id" to chatId,
                "participants" to listOf(me, partnerId).sorted(),
                "last" to preview,
                "lastAt" to now,
                "lastSenderId" to me,
                "updatedAt" to now,
                "typing" to mapOf(me to 0),
                "unreadCounts" to mapOf(partnerId to FieldValue.increment(1)),
            ),
            SetOptions.merge(),
        )
        messages(chatId).document(messageId).set(doc)
        settings.setChatDraft(chatId, "")
    }

    override suspend fun edit(chatId: String, messageId: String, text: String): AppResult<Unit> = runCatchingApp(errorMapper) {
        val body = text.trim()
        if (body.isEmpty()) throw AppErrorException(AppError.Validation("message", "empty"))
        messages(chatId).document(messageId).update(
            mapOf("text" to body, "isEdited" to true, "edited" to true, "updatedAt" to System.currentTimeMillis()),
        )
        Unit
    }

    override suspend fun deleteForEveryone(chatId: String, messageId: String): AppResult<Unit> = runCatchingApp(errorMapper) {
        messages(chatId).document(messageId).update(
            mapOf(
                "isDeleted" to true,
                "text" to "",
                "attachments" to emptyList<Any>(),
                "src" to null,
                "updatedAt" to System.currentTimeMillis(),
            ),
        )
        Unit
    }

    override suspend fun deleteForMe(chatId: String, messageId: String): AppResult<Unit> = runCatchingApp(errorMapper) {
        val me = auth.requireUid()
        messages(chatId).document(messageId).update(mapOf("deletedFor" to FieldValue.arrayUnion(me), "updatedAt" to System.currentTimeMillis()))
        Unit
    }

    override suspend fun react(chatId: String, messageId: String, reactionKey: String?): AppResult<Unit> = runCatchingApp(errorMapper) {
        val me = auth.requireUid()
        messages(chatId).document(messageId).update(
            mapOf("reactions.$me" to (reactionKey ?: FieldValue.delete()), "updatedAt" to System.currentTimeMillis()),
        )
        Unit
    }

    /** Marks incoming messages read (`st: 4`) and resets my unread counter; batched ≤ 400 writes. */
    override suspend fun markRead(chatId: String, messages: List<ChatMessage>) {
        val me = auth.currentUser?.uid ?: return
        val now = System.currentTimeMillis()
        val receipts = settings.current().readReceipts
        try {
            if (receipts) {
                messages.filter { !it.isMine(me) && !it.isPending && it.status.code < MessageStatus.Read.code }
                    .chunked(400)
                    .forEach { chunk ->
                        val batch = firestore.batch()
                        chunk.forEach { m -> batch.update(messages(chatId).document(m.id), mapOf("st" to MessageStatus.Read.code)) }
                        batch.commit()
                    }
            }
            chats.document(chatId).set(
                mapOf("readBy" to mapOf(me to now), "unreadCounts" to mapOf(me to 0)),
                SetOptions.merge(),
            )
        } catch (_: Exception) {
        }
    }

    override suspend fun setTyping(chatId: String, typing: Boolean) {
        val me = auth.currentUser?.uid ?: return
        chats.document(chatId).set(mapOf("typing" to mapOf(me to if (typing) System.currentTimeMillis() else 0L)), SetOptions.merge())
    }

    override suspend fun setWallpaper(chatId: String, wallpaper: String?): AppResult<Unit> = runCatchingApp(errorMapper) {
        chats.document(chatId).set(mapOf("wallpaper" to wallpaper, "wallpaperImg" to wallpaper), SetOptions.merge())
        Unit
    }

    /** Deletes the conversation for both participants (web `executeDeleteChatBoth`). */
    override suspend fun deleteConversation(chatId: String): AppResult<Unit> = runCatchingApp(errorMapper) {
        while (true) {
            val page = messages(chatId).limit(400).get().await()
            if (page.isEmpty) break
            val batch = firestore.batch()
            page.documents.forEach { batch.delete(it.reference) }
            batch.commit().await()
        }
        chats.document(chatId).delete().await()
        Unit
    }

    override suspend fun retryFailed(chatId: String) = outbox.retryFailed()

    override suspend fun resolveMediaUrl(attachmentSrc: String, storagePath: String?): String {
        if (attachmentSrc.isNotBlank() && !attachmentSrc.startsWith("data:")) return attachmentSrc
        val path = storagePath ?: return attachmentSrc
        signedUrlCache[path]?.let { (url, expires) -> if (System.currentTimeMillis() < expires) return url }
        return try {
            val result = functions.getHttpsCallable("getChatMediaUrl").call(mapOf("path" to path)).await()
            val url = ((result.getData() as? Map<*, *>)?.get("url") as? String).orEmpty()
            if (url.isNotBlank()) signedUrlCache[path] = url to (System.currentTimeMillis() + 9 * 60_000L)
            url.ifBlank { attachmentSrc }
        } catch (_: Exception) {
            attachmentSrc
        }
    }

    // ------------------------------------------------------------------ requests
    override fun observeIncomingRequests(): Flow<List<ChatRequest>> {
        val uid = auth.currentUser?.uid ?: return flowOf(emptyList())
        return firestore.collection(Collections.CHAT_REQUESTS).whereEqualTo("toUid", uid).asFlow()
            .map { snap -> snap.documents.mapNotNull { d -> d.data?.toChatRequest(d.id) }.filter { it.status == "pending" }.sortedByDescending { it.at } }
            .catch { emit(emptyList()) }
    }

    override fun observeOutgoingRequests(): Flow<List<ChatRequest>> {
        val uid = auth.currentUser?.uid ?: return flowOf(emptyList())
        return firestore.collection(Collections.CHAT_REQUESTS).whereEqualTo("fromUid", uid).asFlow()
            .map { snap -> snap.documents.mapNotNull { d -> d.data?.toChatRequest(d.id) }.sortedByDescending { it.at } }
            .catch { emit(emptyList()) }
    }

    override suspend fun sendRequest(toUid: String, text: String): AppResult<Unit> = runCatchingApp(errorMapper) {
        val me = auth.requireUid()
        val outgoing = observeOutgoingRequests().first()
        if (outgoing.any { it.toUid == toUid && it.status == "pending" }) return@runCatchingApp
        val profile = users.getUser(me)
        val id = Ids.chatRequest()
        firestore.collection(Collections.CHAT_REQUESTS).document(id).set(
            mapOf(
                "id" to id,
                "fromUid" to me,
                "toUid" to toUid,
                "uid" to toUid,
                "senderName" to profile?.displayName.orEmpty(),
                "senderUsername" to profile?.username.orEmpty(),
                "senderAvatar" to profile?.avatar.orEmpty(),
                "text" to text.trim().ifBlank { "أرغب في بدء محادثة معك" }.take(300),
                "at" to System.currentTimeMillis(),
                "status" to "pending",
            ),
        )
        Unit
    }

    override suspend fun acceptRequest(request: ChatRequest): AppResult<String> = runCatchingApp(errorMapper) {
        val chatId = (openConversation(request.fromUid) as? AppResult.Success)?.data
            ?: throw AppErrorException(AppError.Unknown())
        firestore.collection(Collections.CHAT_REQUESTS).document(request.id)
            .update(mapOf("status" to "accepted", "respondedAt" to System.currentTimeMillis()))
        chatId
    }

    override suspend fun declineRequest(request: ChatRequest): AppResult<Unit> = runCatchingApp(errorMapper) {
        firestore.collection(Collections.CHAT_REQUESTS).document(request.id)
            .update(mapOf("status" to "declined", "respondedAt" to System.currentTimeMillis()))
        Unit
    }

    override fun observeTotalUnread(): Flow<Int> {
        val uid = auth.currentUser?.uid ?: return flowOf(0)
        return combine(observeConversations().catch { emit(emptyList()) }, settings.settings) { list, s ->
            list.filter { it.id !in s.mutedChats && it.id !in s.archivedChats }.sumOf { it.unreadFor(uid) }
        }
    }

    companion object {
        const val MAX_MESSAGE_LENGTH = 4_000
        const val MAX_ATTACHMENTS = 5
        const val MAX_CHAT_MEDIA_BYTES = 30L * 1024 * 1024
    }
}
