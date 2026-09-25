package com.animeblack.core.model

/** One user's story set (`stories/{storyId}`) containing up to many 24h items. */
data class Story(
    val id: String,
    val userId: String,
    val userName: String = "",
    val userAvatar: String = "",
    /** public | closeFriends */
    val privacy: String = "public",
    val closeFriends: Boolean = false,
    val items: List<StoryItem> = emptyList(),
    val views: List<StoryView> = emptyList(),
    val reactions: List<StoryReaction> = emptyList(),
    val hiddenFrom: List<String> = emptyList(),
    val createdAt: Long = 0,
    val expiresAt: Long = 0,
) {
    /** Items newer than 24h, newest last (viewer order). */
    fun activeItems(now: Long): List<StoryItem> =
        items.filter { now - it.createdAt < STORY_TTL_MS }.sortedBy { it.createdAt }

    fun isActive(now: Long): Boolean = activeItems(now).isNotEmpty()
    fun seenBy(uid: String): Boolean = views.any { it.userId == uid }
    val latestItemAt: Long get() = items.maxOfOrNull { it.createdAt } ?: createdAt

    companion object {
        const val STORY_TTL_MS = 24 * 60 * 60 * 1000L
    }
}

data class StoryItem(
    val id: String,
    /** image | video | text */
    val type: String,
    val text: String = "",
    val image: String = "",
    val video: String = "",
    val color1: String = "#7F1D1D",
    val color2: String = "#EA580C",
    val textColor: String = "#FFFFFF",
    val textSize: Int = 18,
    val align: String = "center",
    val createdAt: Long = 0,
    val closeFriends: Boolean = false,
)

data class StoryView(val userId: String, val name: String = "", val avatar: String = "", val at: Long = 0)

data class StoryReaction(val id: String, val userId: String, val name: String = "", val icon: String = "", val at: Long = 0)

/** A short vertical video (`reels/{reelId}`). */
data class Reel(
    val id: String,
    val authorId: String,
    val authorName: String = "",
    val authorAvatar: String = "",
    val videoUrl: String = "",
    val coverUrl: String = "",
    val caption: String = "",
    val music: String = "",
    val likes: Int = 0,
    val likedBy: List<String> = emptyList(),
    val comments: List<Comment> = emptyList(),
    val commentsCount: Int = 0,
    val shares: Int = 0,
    val views: Int = 0,
    val createdAt: Long = 0,
    val color1: String = "#1E1B4B",
    val color2: String = "#4F46E5",
) {
    val totalComments: Int get() = maxOf(commentsCount, comments.size)
    fun isLikedBy(uid: String): Boolean = uid in likedBy
}

/** In-app notification (`notifications/{id}`). */
data class AppNotification(
    val id: String,
    val userId: String,
    val fromUserId: String = "",
    val fromUserName: String = "",
    val fromUserAvatar: String = "",
    /** follow | like | comment | mention | story_react | message | system | … */
    val type: String = "system",
    val title: String = "",
    val body: String = "",
    val postId: String? = null,
    val storyId: String? = null,
    val link: String? = null,
    val at: Long = 0,
    val read: Boolean = false,
)

/** Official broadcast (`broadcasts/{id}`), readable by everyone, written by admins only. */
data class Broadcast(
    val id: String,
    val title: String,
    val message: String,
    val type: String = "announcement",
    val at: Long = 0,
    val by: String = "",
)

/** `reports/{id}` */
data class Report(
    val id: String,
    val reporterId: String,
    val targetType: String,
    val targetId: String,
    val reason: String,
    val details: String = "",
    val at: Long = 0,
    /** pending | resolved | dismissed */
    val status: String = "pending",
    val reporterName: String = "",
)

/** `audit_logs/{id}` (admin only). */
data class AuditLog(val id: String, val action: String, val actor: String, val target: String = "", val at: Long = 0, val details: String = "")

/** `workspaces/{uid}/thoughts/{id}` — private notes workspace. */
data class Thought(
    val id: String,
    val title: String = "",
    val text: String = "",
    val tags: List<String> = emptyList(),
    val pinned: Boolean = false,
    val color: String = "",
    val createdAt: Long = 0,
    val updatedAt: Long = 0,
)

/** Level badge definitions (`level_badges`) and the active level mapping (`level_mappings/active`). */
data class LevelBadge(val id: String, val name: String, val icon: String = "", val color: String = "", val minLevel: Int = 0, val image: String = "")
