package com.animeblack.core.model

/** Chat group (`groups/{groupId}`), messages in `groups/{groupId}/messages`. */
data class Group(
    val id: String,
    val name: String,
    val description: String = "",
    val icon: String = "users",
    val color1: String = "#0E7490",
    val color2: String = "#00A3FF",
    /** "عام" (public) or "خاص" (private) — values shared with the web app and security rules. */
    val privacy: String = PRIVACY_PUBLIC,
    val members: List<String> = emptyList(),
    val memberUids: List<String> = emptyList(),
    val admins: List<String> = emptyList(),
    val ownerId: String = "",
    val announceOnly: Boolean = false,
    val slowModeSec: Int = 0,
    val pinnedText: String? = null,
    val lastMessage: String = "",
    val lastAt: Long = 0,
    val createdAt: Long = 0,
) {
    val isPrivate: Boolean get() = privacy == PRIVACY_PRIVATE
    val memberCount: Int get() = maxOf(members.size, memberUids.size)
    fun isMember(uid: String): Boolean = uid in memberUids || uid in members || ownerId == uid
    fun isAdmin(uid: String): Boolean = ownerId == uid || uid in admins

    companion object {
        const val PRIVACY_PUBLIC = "عام"
        const val PRIVACY_PRIVATE = "خاص"
    }
}

/** Anime world (`worlds/{worldId}`), messages in `worlds/{worldId}/messages`. */
data class World(
    val id: String,
    val name: String,
    val description: String = "",
    val icon: String = "globe",
    val color1: String = "#0C4A6E",
    val color2: String = "#0EA5E9",
    val theme: String = "",
    val membersCount: Int = 0,
    val memberUids: List<String> = emptyList(),
    val onlineCount: Int = 0,
    val ownerId: String = "",
    val rules: List<String> = emptyList(),
    val pinnedText: String? = null,
    val closed: Boolean = false,
    val createdAt: Long = 0,
) {
    fun isMember(uid: String): Boolean = uid in memberUids || ownerId == uid
}

/** Community / guild (`communities/{id}`), channel messages in `communities/{id}/channels/{ch}/messages`. */
data class Community(
    val id: String,
    val name: String,
    val description: String = "",
    val tag: String = "",
    val focus: String = "",
    val icon: String = "",
    val avatar: String = "",
    val cover: String = "",
    val color1: String = "#312E81",
    val color2: String = "#818CF8",
    val membersCount: Int = 0,
    val memberUids: List<String> = emptyList(),
    val ownerId: String = "",
    val adminUids: List<String> = emptyList(),
    val isVerified: Boolean = false,
    /** "مفتوح" / "بالطلب" (open / by request) as on the web. */
    val joinMode: String = "",
    val visibility: String = "public",
    val channels: List<CommunityChannel> = emptyList(),
    val treasury: Long = 0,
    val level: Int = 1,
    val createdAt: Long = 0,
) {
    fun isMember(uid: String): Boolean = uid in memberUids || ownerId == uid || uid in adminUids
    fun isAdmin(uid: String): Boolean = ownerId == uid || uid in adminUids
    val requiresApproval: Boolean get() = joinMode == "بالطلب"
}

data class CommunityChannel(
    val id: String,
    val name: String,
    val description: String = "",
    /** Messages embedded by older web clients; new messages live in the channel sub-collection. */
    val legacyMessages: List<ChatMessage> = emptyList(),
)

/** A generic room reference used by the shared room screen (group / world / channel). */
sealed interface RoomRef {
    val id: String

    data class GroupRoom(override val id: String) : RoomRef
    data class WorldRoom(override val id: String) : RoomRef
    data class ChannelRoom(val communityId: String, val channelId: String) : RoomRef {
        override val id: String get() = "$communityId/$channelId"
    }
}
