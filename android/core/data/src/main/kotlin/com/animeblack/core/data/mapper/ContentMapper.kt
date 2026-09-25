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
import com.animeblack.core.model.AppNotification
import com.animeblack.core.model.AuditLog
import com.animeblack.core.model.Broadcast
import com.animeblack.core.model.EconomyTransaction
import com.animeblack.core.model.GameCharacterState
import com.animeblack.core.model.GameProfile
import com.animeblack.core.model.Reel
import com.animeblack.core.model.Report
import com.animeblack.core.model.Story
import com.animeblack.core.model.StoryItem
import com.animeblack.core.model.StoryReaction
import com.animeblack.core.model.StoryView
import com.animeblack.core.model.Thought

internal fun Map<String, Any?>.toStory(id: String): Story = Story(
    id = str("id").ifBlank { id },
    userId = firstStr("userId", "authorId"),
    userName = str("userName"),
    userAvatar = str("userAvatar"),
    privacy = str("privacy", "public"),
    closeFriends = bool("closeFriends"),
    items = mapList("items").mapIndexed { i, it ->
        val img = it.str("img").ifBlank { it.str("image") }
        val video = it.str("video")
        StoryItem(
            id = it.str("id").ifBlank { "item_$i" },
            type = it.str("type").ifBlank { if (video.isNotBlank()) "video" else if (img.isNotBlank()) "image" else "text" },
            text = it.str("text"),
            image = img,
            video = video,
            color1 = it.str("c1", "#7F1D1D"),
            color2 = it.str("c2", "#EA580C"),
            textColor = it.str("tc", "#FFFFFF"),
            textSize = it.int("sz", 18),
            align = it.str("align", "center"),
            createdAt = it.firstLong("createdAt", "at"),
            closeFriends = it.bool("closeFriends"),
        )
    },
    views = mapList("views").map { StoryView(it.firstStr("u", "uid", "userId"), it.str("name"), it.str("avatar"), it.long("at")) },
    reactions = mapList("reactions").map { StoryReaction(it.str("id"), it.firstStr("u", "uid"), it.str("name"), it.str("ic"), it.long("at")) },
    hiddenFrom = strList("hiddenFrom"),
    createdAt = firstLong("createdAt", "at"),
    expiresAt = long("expiresAt"),
)

internal fun Map<String, Any?>.toReel(id: String): Reel {
    val comments = mapList("comments").map { it.toComment() }
    return Reel(
        id = str("id").ifBlank { id },
        authorId = firstStr("authorId", "userId"),
        authorName = str("authorName"),
        authorAvatar = str("authorAvatar"),
        videoUrl = firstStr("video", "videoUrl", "src"),
        coverUrl = firstStr("cover", "thumbnail"),
        caption = firstStr("text", "cap", "caption"),
        music = str("music"),
        likes = int("likes"),
        likedBy = strList("likedUsers"),
        comments = comments,
        commentsCount = maxOf(int("commentsCount"), int("cmts"), comments.size),
        shares = int("shares"),
        views = int("views"),
        createdAt = firstLong("createdAt", "at"),
        color1 = str("c1", "#1E1B4B"),
        color2 = str("c2", "#4F46E5"),
    )
}

internal fun Map<String, Any?>.toNotification(id: String): AppNotification = AppNotification(
    id = str("id").ifBlank { id },
    userId = firstStr("userId", "targetUid"),
    fromUserId = firstStr("fromUserId", "senderId", "fromUid", "actorId"),
    fromUserName = firstStr("fromUserName", "senderName"),
    fromUserAvatar = firstStr("fromUserAvatar", "senderAvatar"),
    type = str("type", "system"),
    title = str("title"),
    body = firstStr("body", "text", "message"),
    postId = strOrNull("postId"),
    storyId = strOrNull("storyId"),
    link = strOrNull("link"),
    at = firstLong("at", "createdAt"),
    read = bool("read"),
)

internal fun Map<String, Any?>.toBroadcast(id: String): Broadcast = Broadcast(
    id = str("id").ifBlank { id },
    title = str("title"),
    message = firstStr("message", "text", "body"),
    type = str("type", "announcement"),
    at = firstLong("at", "createdAt"),
    by = str("by"),
)

internal fun Map<String, Any?>.toReport(id: String): Report {
    val target = obj("target")
    val by = obj("by")
    return Report(
        id = str("id").ifBlank { id },
        reporterId = firstStr("reporterId").ifBlank { by?.str("id").orEmpty() },
        targetType = firstStr("targetType", "type").ifBlank { target?.str("type").orEmpty() },
        targetId = firstStr("targetId").ifBlank { target?.str("id").orEmpty() },
        reason = str("reason"),
        details = firstStr("details", "detail"),
        at = firstLong("at", "createdAt"),
        status = str("status", "pending"),
        reporterName = firstStr("reporterName").ifBlank { by?.str("name").orEmpty() },
    )
}

internal fun Map<String, Any?>.toAuditLog(id: String): AuditLog = AuditLog(
    id = id,
    action = str("action"),
    actor = firstStr("actorEmail", "actor", "by", "actorUid"),
    target = firstStr("target", "targetId"),
    at = firstLong("at", "createdAt"),
    details = str("details"),
)

internal fun Map<String, Any?>.toThought(id: String): Thought = Thought(
    id = id,
    title = str("title"),
    text = firstStr("text", "content", "body"),
    tags = strList("tags"),
    pinned = bool("pinned"),
    color = str("color"),
    createdAt = firstLong("createdAt", "at"),
    updatedAt = long("updatedAt"),
)

internal fun Map<String, Any?>.toTransaction(id: String): EconomyTransaction = EconomyTransaction(
    id = id,
    type = firstStr("type", "op"),
    currency = str("currency", "coins"),
    amount = long("amount"),
    fromUid = str("fromUid"),
    toUid = str("toUid"),
    reason = firstStr("reason", "note"),
    at = firstLong("at", "createdAt"),
)

internal fun Map<String, Any?>.toGameProfile(uid: String): GameProfile {
    val p = obj("profile") ?: emptyMap()
    return GameProfile(
        uid = uid,
        energy = p.int("energy", 50),
        maxEnergy = p.int("maxEnergy", 50).coerceAtLeast(1),
        lastEnergyUpdate = p.long("lastEnergyUpdate"),
        level = maxOf(p.int("hunterLevel", 1), p.int("level", 1)).coerceAtLeast(1),
        xp = maxOf(p.long("hunterXp"), p.long("xp")),
        xpNext = p.firstLong("hunterXpNext", "xpNext").takeIf { it > 0 } ?: 1000,
        gold = p.firstLong("coins", "gold"),
        gems = p.long("gems"),
        shards = p.long("shards"),
        highScore = maxOf(p.long("highScore"), p.long("bestScore")),
        bestDistance = p.long("bestDistance"),
        totalKills = p.long("totalKills"),
        gamesPlayed = maxOf(p.int("totalMatches"), p.int("gamesPlayed")),
        totalWins = p.int("totalWins"),
        selectedCharacter = p.firstStr("equippedCharacterId", "selectedCharacter").ifBlank { "jinwoo" },
        characters = mapList("characters").map {
            GameCharacterState(it.str("id"), it.int("level", 1), it.int("stars", 1), it.int("transformationTier"), it.bool("unlocked"))
        },
        dailyDay = p.int("dailyDay"),
        lastDailyAt = p.long("lastDailyAt"),
        displayName = p.str("displayName"),
        avatar = p.str("avatar"),
        updatedAt = long("updatedAt"),
    )
}
