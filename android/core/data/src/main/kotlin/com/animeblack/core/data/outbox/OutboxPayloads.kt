package com.animeblack.core.data.outbox

import kotlinx.serialization.Serializable

/** A file waiting to be uploaded; [downloadUrl] is filled in once uploaded (so retries skip it). */
@Serializable
data class UploadFile(
    val localUri: String,
    val mimeType: String,
    val type: String,
    val name: String,
    val size: Long,
    val storagePath: String,
    val durationMs: Long = 0,
    val downloadUrl: String? = null,
)

@Serializable
data class AuthorPayload(
    val id: String,
    val name: String,
    val username: String,
    val avatar: String,
    val isVerified: Boolean,
    val role: String,
    val level: Int,
)

@Serializable
data class PostPublishPayload(
    val postId: String,
    val author: AuthorPayload,
    val text: String,
    val category: String,
    val tags: List<String>,
    val mentions: List<String>,
    val location: String,
    val privacy: String,
    val spoiler: Boolean,
    val warningText: String,
    val allowComments: Boolean,
    val pollQuestion: String? = null,
    val pollOptions: List<String> = emptyList(),
    val createdAt: Long,
    val files: List<UploadFile>,
    val editing: Boolean = false,
)

@Serializable
data class ChatMediaPayload(
    val chatId: String,
    val partnerId: String,
    val messageId: String,
    val senderName: String,
    val text: String,
    val type: String,
    val at: Long,
    val replyToId: String? = null,
    val replyToText: String? = null,
    val replyToName: String? = null,
    val replyToType: String? = null,
    val voiceDurationSec: Int = 0,
    val files: List<UploadFile>,
)

@Serializable
data class RoomMediaPayload(
    /** group | world | channel */
    val kind: String,
    val roomId: String,
    val channelId: String? = null,
    val messageId: String,
    val senderName: String,
    val senderAvatar: String,
    val text: String,
    val at: Long,
    val files: List<UploadFile>,
)

@Serializable
data class StoryPublishPayload(
    val storyId: String,
    val itemId: String,
    val userName: String,
    val userAvatar: String,
    val text: String,
    val color1: String,
    val color2: String,
    val textColor: String,
    val textSize: Int,
    val closeFriends: Boolean,
    val createdAt: Long,
    val newDoc: Boolean,
    val file: UploadFile? = null,
)

@Serializable
data class ReelPublishPayload(
    val reelId: String,
    val authorName: String,
    val authorAvatar: String,
    val caption: String,
    val music: String,
    val createdAt: Long,
    val file: UploadFile,
)

@Serializable
data class ProfileMediaPayload(
    /** avatar | cover */
    val field: String,
    val file: UploadFile,
)

@Serializable
data class PollVotePayload(val postId: String, val optionId: String)

object OutboxTypes {
    const val POST_PUBLISH = "post.publish"
    const val CHAT_MEDIA = "chat.media"
    const val ROOM_MEDIA = "room.media"
    const val STORY_PUBLISH = "story.publish"
    const val REEL_PUBLISH = "reel.publish"
    const val PROFILE_MEDIA = "profile.media"
    const val POLL_VOTE = "poll.vote"
}
