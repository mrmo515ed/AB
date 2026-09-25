package com.animeblack.core.data.mapper

import com.animeblack.core.data.firebase.bool
import com.animeblack.core.data.firebase.firstLong
import com.animeblack.core.data.firebase.firstStr
import com.animeblack.core.data.firebase.int
import com.animeblack.core.data.firebase.long
import com.animeblack.core.data.firebase.mapList
import com.animeblack.core.data.firebase.obj
import com.animeblack.core.data.firebase.anyToLong
import com.animeblack.core.data.firebase.str
import com.animeblack.core.data.firebase.strList
import com.animeblack.core.data.firebase.strOrNull
import com.animeblack.core.model.Attachment
import com.animeblack.core.model.ChatMessage
import com.animeblack.core.model.ChatRequest
import com.animeblack.core.model.Conversation
import com.animeblack.core.model.MessageQuote
import com.animeblack.core.model.MessageStatus

internal fun Map<String, Any?>.toConversation(id: String, myUid: String): Conversation {
    val participants = strList("participants")
    val partner = participants.firstOrNull { it != myUid && it.isNotBlank() }
        ?: Conversation.partnerFromId(id, myUid)
        ?: str("userId").takeIf { it != myUid }
        ?: ""
    return Conversation(
        id = id,
        participants = participants,
        partnerId = partner,
        type = str("type", "private"),
        lastMessage = str("last"),
        lastAt = firstLong("lastAt", "updatedAt"),
        lastSenderId = strOrNull("lastSenderId"),
        typing = obj("typing")?.mapNotNull { (k, v) -> anyToLong(v)?.let { k to it } }?.toMap().orEmpty(),
        readBy = obj("readBy")?.mapNotNull { (k, v) -> anyToLong(v)?.let { k to it } }?.toMap().orEmpty(),
        unreadCounts = obj("unreadCounts")?.mapNotNull { (k, v) -> anyToLong(v)?.let { k to it.toInt() } }?.toMap().orEmpty(),
        wallpaper = strOrNull("wallpaperImg") ?: (this["wallpaper"] as? String),
        deleted = bool("deleted") || bool("deletedForBoth"),
    )
}

private fun statusFrom(map: Map<String, Any?>): MessageStatus {
    val st = map.int("st")
    if (st > 0) return MessageStatus.fromCode(st)
    return when (map.str("status").lowercase()) {
        "sending", "pending" -> MessageStatus.Sending
        "delivered" -> MessageStatus.Delivered
        "read", "seen" -> MessageStatus.Read
        "failed" -> MessageStatus.Failed
        "scheduled" -> MessageStatus.Scheduled
        else -> if (map.bool("read")) MessageStatus.Read else MessageStatus.Sent
    }
}

internal fun Map<String, Any?>.toChatMessage(id: String, conversationId: String, pending: Boolean = false): ChatMessage {
    val attachments = mapList("attachments").map {
        Attachment(
            type = it.str("type", "file"),
            src = it.str("src").ifBlank { it.str("url") },
            name = it.str("name"),
            size = it.long("size"),
            storagePath = it.strOrNull("path"),
            durationSec = it.int("dur"),
        )
    }.filter { it.src.isNotBlank() || it.storagePath != null }.ifEmpty {
        val src = str("src")
        if (src.isNotBlank()) listOf(Attachment(type = str("type", "file"), src = src, name = str("name"), size = long("size"), durationSec = int("dur"))) else emptyList()
    }
    val quote = obj("quote")?.let { MessageQuote(it.str("id"), it.str("t"), it.str("n"), it.str("type", "text")) }
        ?: obj("replyTo")?.let { MessageQuote(it.str("id"), it.firstStr("text", "t"), it.firstStr("senderName", "n"), it.str("type", "text")) }
    return ChatMessage(
        id = str("id").ifBlank { id },
        conversationId = conversationId,
        senderId = firstStr("senderId", "sender", "uid", "fromId"),
        senderName = str("senderName"),
        senderAvatar = str("senderAvatar"),
        type = str("type", ChatMessage.TYPE_TEXT).ifBlank { ChatMessage.TYPE_TEXT },
        text = str("text"),
        attachments = attachments,
        at = firstLong("at", "createdAt"),
        updatedAt = long("updatedAt"),
        status = statusFrom(this),
        isEdited = bool("isEdited") || bool("edited"),
        isDeleted = bool("isDeleted") || bool("gone"),
        deletedFor = strList("deletedFor"),
        reactions = obj("reactions")?.mapValues { it.value.toString() }.orEmpty(),
        legacyReacts = strList("reacts"),
        replyTo = quote,
        mentions = strList("mentions"),
        voiceDurationSec = int("dur"),
        isPending = pending,
    )
}

internal fun Map<String, Any?>.toChatRequest(id: String): ChatRequest = ChatRequest(
    id = str("id").ifBlank { id },
    fromUid = str("fromUid"),
    toUid = str("toUid").ifBlank { str("uid") },
    senderName = str("senderName"),
    senderUsername = str("senderUsername"),
    senderAvatar = str("senderAvatar"),
    text = str("text"),
    at = long("at"),
    status = str("status", "pending"),
)
