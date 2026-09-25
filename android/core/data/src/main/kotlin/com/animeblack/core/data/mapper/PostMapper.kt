package com.animeblack.core.data.mapper

import com.animeblack.core.data.firebase.bool
import com.animeblack.core.data.firebase.firstLong
import com.animeblack.core.data.firebase.firstStr
import com.animeblack.core.data.firebase.int
import com.animeblack.core.data.firebase.long
import com.animeblack.core.data.firebase.mapList
import com.animeblack.core.data.firebase.obj
import com.animeblack.core.data.firebase.str
import com.animeblack.core.data.firebase.strList
import com.animeblack.core.data.firebase.strOrNull
import com.animeblack.core.data.firebase.toStringKeyed
import com.animeblack.core.model.AuthorSnapshot
import com.animeblack.core.model.Comment
import com.animeblack.core.model.LikeEntry
import com.animeblack.core.model.LinkPreview
import com.animeblack.core.model.MediaItem
import com.animeblack.core.model.Poll
import com.animeblack.core.model.PollOption
import com.animeblack.core.model.Post
import com.animeblack.core.model.PostMedia
import com.animeblack.core.model.QuotedPost

internal fun Map<String, Any?>.toAuthor(fallbackId: String = ""): AuthorSnapshot = AuthorSnapshot(
    id = str("id").ifBlank { str("uid") }.ifBlank { fallbackId },
    name = str("name"),
    username = str("username"),
    avatar = str("avatar"),
    isVerified = bool("isVerified") || bool("verified"),
    role = str("role"),
    level = int("level", 1),
)

internal fun AuthorSnapshot.toMap(): Map<String, Any?> = mapOf(
    "id" to id,
    "uid" to id,
    "name" to name,
    "username" to username,
    "avatar" to avatar,
    "isVerified" to isVerified,
    "role" to role,
    "level" to level,
)

internal fun Map<String, Any?>.toPost(id: String, pending: Boolean = false): Post {
    val authorMap = obj("author")
    val authorId = firstStr("authorId", "userId").ifBlank { authorMap?.str("id").orEmpty() }
    val author = authorMap?.toAuthor(authorId)?.let {
        it.copy(
            id = authorId.ifBlank { it.id },
            name = it.name.ifBlank { str("authorName") },
            avatar = it.avatar.ifBlank { str("authorAvatar") },
        )
    } ?: AuthorSnapshot(id = authorId, name = str("authorName"), avatar = str("authorAvatar"))

    val settings = obj("settings")
    val comments = mapList("comments").map { it.toComment() }
    return Post(
        id = id,
        authorId = authorId,
        author = author,
        category = str("category"),
        text = str("text").ifBlank { str("content") },
        media = toPostMedia(),
        poll = obj("poll")?.toPoll(),
        linkPreview = obj("linkPreview")?.let { LinkPreview(it.str("url"), it.str("title"), it.str("description").ifBlank { it.str("desc") }, it.str("image").ifBlank { it.str("img") }) },
        quotedPost = obj("quotedPost")?.let { q ->
            QuotedPost(q.str("id"), q.obj("author")?.str("name") ?: q.str("authorName"), q.str("text"))
        },
        location = str("location").ifBlank { str("loc") },
        tags = strList("tags"),
        mentions = strList("mentions"),
        privacy = str("privacy", Post.PRIVACY_PUBLIC).ifBlank { Post.PRIVACY_PUBLIC },
        spoiler = bool("spoiler"),
        warningText = str("warningText"),
        allowComments = !(bool("lockC")) && (settings?.bool("allowComments", true) ?: true),
        allowSharing = settings?.bool("allowSharing", true) ?: true,
        likes = maxOf(int("likes"), int("likesCount")),
        likedBy = likedEntries(),
        reactionCounts = (obj("reacts") ?: obj("reactions"))?.mapNotNull { (k, v) ->
            (v as? Number)?.toInt()?.let { k to it }
        }?.toMap().orEmpty(),
        comments = comments,
        commentsCount = maxOf(int("commentsCount"), comments.size),
        shares = int("shares"),
        reposts = int("reposts"),
        views = int("views"),
        createdAt = firstLong("createdAt", "at", "createdAtServer"),
        updatedAt = long("updatedAt"),
        isEdited = bool("isEdited"),
        isPending = pending,
    )
}

private fun Map<String, Any?>.toPostMedia(): PostMedia? {
    val m = obj("media")
    if (m != null) {
        val items = m.mapList("items").map {
            MediaItem(
                type = it.str("type", "image"),
                src = it.str("src").ifBlank { it.str("url") },
                name = it.str("name"),
                size = it.long("size"),
                thumbnail = it.strOrNull("thumb"),
                durationMs = it.long("durationMs"),
                width = it.int("w"),
                height = it.int("h"),
            )
        }.filter { it.src.isNotBlank() }.ifEmpty {
            m.strList("imgs").map { MediaItem(type = "image", src = it) }
        }
        val src = m.str("src").ifBlank { items.firstOrNull()?.src.orEmpty() }
        if (src.isBlank() && items.isEmpty()) return null
        val kind = m.str("kind", "image")
        return PostMedia(kind = kind, src = src, items = items.ifEmpty { listOf(MediaItem(type = kind, src = src)) })
    }
    val legacy = firstStr("mediaUrl", "image", "img")
    if (legacy.isBlank()) return null
    val type = str("mediaType", "image").ifBlank { "image" }
    return PostMedia(kind = type, src = legacy, items = listOf(MediaItem(type = type, src = legacy)))
}

internal fun Map<String, Any?>.toPoll(): Poll = Poll(
    question = firstStr("question", "q"),
    options = mapList("options").mapIndexed { i, o ->
        PollOption(
            id = o.str("id").ifBlank { i.toString() },
            text = o.firstStr("t", "text", "label"),
            votes = maxOf(o.int("v"), o.int("votes")),
        )
    },
    voters = (obj("votes") ?: obj("voters"))?.mapValues { it.value.toString() }.orEmpty(),
    endsAt = firstLong("endsAt", "end"),
)

private fun Map<String, Any?>.likedEntries(): List<LikeEntry> =
    (this["likedUsers"] as? List<*>)?.mapNotNull { e ->
        when (e) {
            is String -> LikeEntry(userId = e)
            is Map<*, *> -> {
                val m = e.toStringKeyed()
                val uid = m.str("id").ifBlank { m.str("uid") }
                if (uid.isBlank()) null else LikeEntry(uid, m.str("name"), m.str("username"), m.str("avatar"), m.strOrNull("reaction"))
            }
            else -> null
        }
    }?.distinctBy { it.userId } ?: emptyList()

internal fun Map<String, Any?>.toComment(): Comment {
    val userMap = obj("user")
    val userId = firstStr("userId", "uid").ifBlank { userMap?.str("id").orEmpty() }
    val createdAt = firstLong("createdAt", "at")
    val text = str("text")
    return Comment(
        id = str("id").ifBlank { "c_${userId.take(8)}_${createdAt}_${text.hashCode()}" },
        userId = userId,
        user = userMap?.toAuthor(userId) ?: AuthorSnapshot(id = userId),
        text = text,
        mentions = strList("mentions"),
        likes = int("likes"),
        likedBy = strList("likedBy"),
        createdAt = createdAt,
        replyToId = strOrNull("replyTo"),
    )
}

internal fun Comment.toMap(): Map<String, Any?> = buildMap {
    put("id", id)
    put("userId", userId)
    put("uid", userId)
    put("user", mapOf("id" to user.id, "name" to user.name, "username" to user.username, "avatar" to user.avatar, "isVerified" to user.isVerified))
    put("text", text)
    put("mentions", mentions)
    put("likes", likes)
    put("createdAt", createdAt)
    put("at", createdAt)
    if (replyToId != null) put("replyTo", replyToId)
}
