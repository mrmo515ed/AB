package com.animeblack.core.model

/**
 * A private conversation (`chats/{chatId}`). The id is canonical and shared with the web app:
 * `ch_<smallerUid>_<largerUid>` with `participants` sorted ascending.
 */
data class Conversation(
    val id: String,
    val participants: List<String>,
    val partnerId: String,
    val type: String = "private",
    val lastMessage: String = "",
    val lastAt: Long = 0,
    val lastSenderId: String? = null,
    val typing: Map<String, Long> = emptyMap(),
    val readBy: Map<String, Long> = emptyMap(),
    val unreadCounts: Map<String, Int> = emptyMap(),
    val wallpaper: String? = null,
    val deleted: Boolean = false,
) {
    fun isPartnerTyping(now: Long, myUid: String): Boolean =
        typing.any { (uid, ts) -> uid != myUid && ts > 0 && now - ts < TYPING_TIMEOUT_MS }

    /** Unread count: explicit counter when available, else a boolean fallback for web-sent messages. */
    fun unreadFor(uid: String): Int {
        val explicit = unreadCounts[uid] ?: 0
        if (explicit > 0) return explicit
        val lastRead = readBy[uid] ?: 0L
        return if (lastSenderId != null && lastSenderId != uid && lastAt > lastRead) 1 else 0
    }

    companion object {
        const val TYPING_TIMEOUT_MS = 6_000L

        fun canonicalId(uidA: String, uidB: String): String {
            val sorted = listOf(uidA, uidB).sorted()
            return "ch_${sorted[0]}_${sorted[1]}"
        }

        /** Mirrors the web `getPartnerUid` logic for ids of the form `ch_a_b`. */
        fun partnerFromId(chatId: String, myUid: String): String? {
            if (!chatId.startsWith("ch_")) return null
            val raw = chatId.removePrefix("ch_")
            return when {
                raw.startsWith(myUid + "_") -> raw.removePrefix(myUid + "_")
                raw.endsWith("_$myUid") -> raw.removeSuffix("_$myUid")
                else -> null
            }?.takeIf { it.isNotBlank() && it != myUid }
        }
    }
}

/** Message delivery state (`st` field in Firestore, shared with the web app). */
enum class MessageStatus(val code: Int) {
    Sending(1),
    Sent(2),
    Delivered(3),
    Read(4),
    Failed(5),
    Scheduled(6);

    companion object {
        fun fromCode(code: Int?): MessageStatus = entries.firstOrNull { it.code == code } ?: Sent
    }
}

/**
 * A chat message (private chats, groups, worlds and community channels share this model).
 * Ownership is derived strictly from [senderId], as required by the chat specification.
 */
data class ChatMessage(
    val id: String,
    val conversationId: String,
    val senderId: String,
    val senderName: String = "",
    val senderAvatar: String = "",
    /** text | image | video | voice | audio | file | sticker | gif | media | system_event */
    val type: String = TYPE_TEXT,
    val text: String = "",
    val attachments: List<Attachment> = emptyList(),
    val at: Long = 0,
    val updatedAt: Long = 0,
    val status: MessageStatus = MessageStatus.Sent,
    val isEdited: Boolean = false,
    val isDeleted: Boolean = false,
    val deletedFor: List<String> = emptyList(),
    /** uid -> reaction key (native, rules-allowed field `reactions`). */
    val reactions: Map<String, String> = emptyMap(),
    /** Legacy web reactions (`reacts`, a shared list of icon names). */
    val legacyReacts: List<String> = emptyList(),
    val replyTo: MessageQuote? = null,
    val mentions: List<String> = emptyList(),
    val voiceDurationSec: Int = 0,
    /** True while the write is only in the local Firestore cache / outbox. */
    val isPending: Boolean = false,
    val uploadProgress: Int = 100,
) {
    fun isMine(myUid: String): Boolean = senderId == myUid
    fun isVisibleTo(uid: String): Boolean = uid !in deletedFor
    val isSystem: Boolean get() = type == TYPE_SYSTEM
    val primaryAttachment: Attachment? get() = attachments.firstOrNull()

    /** Aggregated reaction counts for display (native per-user map + legacy list). */
    fun reactionSummary(): Map<String, Int> {
        val counts = LinkedHashMap<String, Int>()
        reactions.values.forEach { counts[it] = (counts[it] ?: 0) + 1 }
        legacyReacts.forEach { counts[it] = (counts[it] ?: 0) + 1 }
        return counts
    }

    fun previewText(): String = when {
        isDeleted -> ""
        text.isNotBlank() -> text
        type == TYPE_STICKER -> "Sticker"
        type == TYPE_VOICE -> "Voice"
        attachments.size > 1 -> "${attachments.size} media"
        attachments.size == 1 -> attachments.first().type
        else -> ""
    }

    companion object {
        const val TYPE_TEXT = "text"
        const val TYPE_IMAGE = "image"
        const val TYPE_VIDEO = "video"
        const val TYPE_VOICE = "voice"
        const val TYPE_FILE = "file"
        const val TYPE_STICKER = "sticker"
        const val TYPE_GIF = "gif"
        const val TYPE_MEDIA = "media"
        const val TYPE_SYSTEM = "system_event"
    }
}

data class Attachment(
    /** image | video | voice | audio | file | gif | sticker */
    val type: String,
    val src: String,
    val name: String = "",
    val size: Long = 0,
    /** Storage path when the media lives in a private chat folder (resolved via getChatMediaUrl). */
    val storagePath: String? = null,
    val durationSec: Int = 0,
)

data class MessageQuote(
    val id: String,
    val text: String,
    val senderName: String,
    val type: String = ChatMessage.TYPE_TEXT,
)

/** `chat_requests/{id}` — message requests to users who restrict direct messages. */
data class ChatRequest(
    val id: String,
    val fromUid: String,
    val toUid: String,
    val senderName: String = "",
    val senderUsername: String = "",
    val senderAvatar: String = "",
    val text: String = "",
    val at: Long = 0,
    /** pending | accepted | declined */
    val status: String = "pending",
)

/** Result of the direct-message permission check (mirrors web `canDirectMessage`). */
sealed interface DmPermission {
    data object Allowed : DmPermission
    data object Blocked : DmPermission
    data object Closed : DmPermission
    data object RequiresRequest : DmPermission
    data object Self : DmPermission
}

/** Outgoing message input from the composer. */
data class OutgoingMessage(
    val text: String,
    val attachments: List<LocalMedia> = emptyList(),
    val replyTo: MessageQuote? = null,
    val stickerUrl: String? = null,
    val gifUrl: String? = null,
    val voiceDurationSec: Int = 0,
    val editMessageId: String? = null,
)
