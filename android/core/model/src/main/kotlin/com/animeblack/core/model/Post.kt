package com.animeblack.core.model

/** A feed post stored in `posts/{postId}` (comments are embedded in the document, as on the web). */
data class Post(
    val id: String,
    val authorId: String,
    val author: AuthorSnapshot,
    val category: String = "",
    val text: String = "",
    val media: PostMedia? = null,
    val poll: Poll? = null,
    val linkPreview: LinkPreview? = null,
    val quotedPost: QuotedPost? = null,
    val location: String = "",
    val tags: List<String> = emptyList(),
    val mentions: List<String> = emptyList(),
    val privacy: String = PRIVACY_PUBLIC,
    val spoiler: Boolean = false,
    val warningText: String = "",
    val allowComments: Boolean = true,
    val allowSharing: Boolean = true,
    val likes: Int = 0,
    val likedBy: List<LikeEntry> = emptyList(),
    /** Reaction key -> count (web field `reacts`). */
    val reactionCounts: Map<String, Int> = emptyMap(),
    val comments: List<Comment> = emptyList(),
    val commentsCount: Int = 0,
    val shares: Int = 0,
    val reposts: Int = 0,
    val views: Int = 0,
    val createdAt: Long = 0,
    val updatedAt: Long = 0,
    val isEdited: Boolean = false,
    /** True while the write is still queued locally (Firestore `hasPendingWrites`). */
    val isPending: Boolean = false,
) {
    val totalComments: Int get() = maxOf(commentsCount, comments.size)
    fun isLikedBy(uid: String): Boolean = likedBy.any { it.userId == uid }
    fun reactionOf(uid: String): String? = likedBy.firstOrNull { it.userId == uid }?.reaction

    companion object {
        const val PRIVACY_PUBLIC = "public"
        const val PRIVACY_FOLLOWERS = "followers"
        const val PRIVACY_PRIVATE = "private"
    }
}

data class PostMedia(
    /** image | video | audio | file | sticker | gif */
    val kind: String,
    val src: String,
    val items: List<MediaItem> = emptyList(),
) {
    val images: List<MediaItem> get() = items.filter { it.type == "image" || it.type == "gif" || it.type == "sticker" }
}

data class MediaItem(
    val type: String,
    val src: String,
    val name: String = "",
    val size: Long = 0,
    val thumbnail: String? = null,
    val durationMs: Long = 0,
    val width: Int = 0,
    val height: Int = 0,
)

data class LikeEntry(
    val userId: String,
    val name: String = "",
    val username: String = "",
    val avatar: String = "",
    val reaction: String? = null,
)

data class Comment(
    val id: String,
    val userId: String,
    val user: AuthorSnapshot,
    val text: String,
    val mentions: List<String> = emptyList(),
    val likes: Int = 0,
    val likedBy: List<String> = emptyList(),
    val createdAt: Long = 0,
    val replyToId: String? = null,
)

data class Poll(
    val question: String,
    val options: List<PollOption>,
    /** uid -> option id (native clients record votes here so each user votes once). */
    val voters: Map<String, String> = emptyMap(),
    val endsAt: Long = 0,
) {
    val totalVotes: Int get() = options.sumOf { it.votes }
    fun votedOption(uid: String): String? = voters[uid]
}

data class PollOption(val id: String, val text: String, val votes: Int = 0)

data class LinkPreview(val url: String, val title: String = "", val description: String = "", val image: String = "")

data class QuotedPost(val id: String, val authorName: String = "", val text: String = "")

/**
 * Reaction catalogue shared with the web app (`REACTS` in index.html). Keys are stored in Firestore
 * (`reacts` counters and `likedUsers[].reaction`), so they must stay identical.
 */
enum class Reaction(val key: String, val inPicker: Boolean) {
    Like("like", true),
    Love("love", true),
    Laugh("laugh", true),
    Wow("wow", true),
    Sad("sad", true),
    Angry("angry", true),
    Fire("fire", true),
    Clap("clap", true),
    Rofl("rofl", false),
    Surprise("surprise", false),
    Shock("shock", false),
    Broken("broken", false),
    Hundred("hundred", false),
    Mind("mind", false),
    Cold("cold", false),
    Plead("plead", false),
    Cry("cry", false),
    Think("think", false);

    companion object {
        fun fromKey(key: String?): Reaction? = entries.firstOrNull { it.key == key }
        val picker: List<Reaction> get() = entries.filter { it.inPicker }
    }
}

/** Post creation input assembled by the composer. */
data class PostDraft(
    val text: String = "",
    val category: String = "",
    val attachments: List<LocalMedia> = emptyList(),
    val pollQuestion: String = "",
    val pollOptions: List<String> = emptyList(),
    val tags: List<String> = emptyList(),
    val location: String = "",
    val privacy: String = Post.PRIVACY_PUBLIC,
    val spoiler: Boolean = false,
    val warningText: String = "",
    val allowComments: Boolean = true,
    val editingPostId: String? = null,
)

/** A media file picked on the device, before upload. */
data class LocalMedia(
    val uri: String,
    /** image | video | audio | file | gif */
    val type: String,
    val mimeType: String,
    val name: String = "",
    val sizeBytes: Long = 0,
    val durationMs: Long = 0,
)
