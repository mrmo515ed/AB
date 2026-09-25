package com.animeblack.core.model

/**
 * A user profile as stored in `users/{uid}` (shared with the web app).
 *
 * Economy/privilege fields (coins, stars, xp, level, role, isVerified …) are read-only on the client:
 * Firestore rules reject owner writes to them and the Cloud Functions are the only authority.
 */
data class User(
    val id: String,
    val name: String = "",
    val username: String = "",
    val email: String = "",
    val avatar: String = "",
    val cover: String? = null,
    val bio: String = "",
    val role: String = ROLE_MEMBER,
    val level: Int = 1,
    val xp: Long = 0,
    val xpNext: Long = 100,
    val coins: Long = 0,
    val stars: Long = 0,
    val gems: Long = 0,
    val reputation: Long = 0,
    val followersCount: Int = 0,
    val followingCount: Int = 0,
    val followersList: List<String> = emptyList(),
    val followingList: List<String> = emptyList(),
    val joined: Long = 0,
    val isVerified: Boolean = false,
    val verifiedType: String? = null,
    val badges: List<String> = emptyList(),
    val titles: List<String> = emptyList(),
    val equippedTitle: String? = null,
    val avatarFrame: String? = null,
    val online: Boolean = false,
    val lastSeen: Long = 0,
    val profileCompleted: Boolean = true,
    val location: String = "",
    val website: String = "",
    val favAnimeName: String = "",
    val favStudio: String = "",
    val privacy: PrivacySettings = PrivacySettings(),
    val requiresChatRequest: Boolean = false,
    val closeFriends: List<String> = emptyList(),
    val dailyStreak: Int = 0,
    val lastDailyClaim: Long = 0,
) {
    val displayName: String get() = name.ifBlank { username.ifBlank { "Otaku" } }
    val handle: String get() = if (username.isBlank()) "" else "@$username"

    /** Client-side hint only (for showing admin UI). Server-side rules remain the authority. */
    val isAdmin: Boolean get() = email.equals(ADMIN_EMAIL, ignoreCase = true) || role in ADMIN_ROLES
    val isModerator: Boolean get() = isAdmin || role in MODERATOR_ROLES
    val showsVerifiedBadge: Boolean get() = isVerified || verifiedType != null || isAdmin
    val isGoldVerified: Boolean get() = isAdmin || verifiedType in setOf("gold", "business", "vip", "admin")

    companion object {
        const val ROLE_MEMBER = "Member"
        const val ADMIN_EMAIL = "m774545471@gmail.com"
        val ADMIN_ROLES = setOf("admin", "Admin", "Owner", "Developer", "SuperAdministrator")
        val MODERATOR_ROLES = setOf("Moderator", "SeniorModerator", "SuperAdministrator")
        val PRIVILEGED_ROLES = ADMIN_ROLES + MODERATOR_ROLES
    }
}

/** `users/{uid}.privacy` */
data class PrivacySettings(
    val whoSeesCoins: String = "everyone",
    val whoSeesLevel: String = "everyone",
    val whoSeesActivity: String = "everyone",
    val privateAccount: Boolean = false,
    val showOnline: Boolean = true,
    /** everyone | followers | friends | nobody */
    val allowDM: String = "everyone",
)

/** Small denormalised author snapshot embedded in posts, comments and likes (web-compatible). */
data class AuthorSnapshot(
    val id: String,
    val name: String = "",
    val username: String = "",
    val avatar: String = "",
    val isVerified: Boolean = false,
    val role: String = "",
    val level: Int = 1,
)

fun User.toSnapshot(): AuthorSnapshot = AuthorSnapshot(
    id = id,
    name = displayName,
    username = username,
    avatar = avatar,
    isVerified = isVerified,
    role = role,
    level = level,
)

/** Private per-user state stored in `user_states/{uid}` (owner-only by rules). */
data class UserState(
    val savedPostIds: List<String> = emptyList(),
    val blocked: List<String> = emptyList(),
    val following: List<String> = emptyList(),
    val favAnime: List<String> = emptyList(),
    val favChars: List<String> = emptyList(),
    val history: List<WatchHistoryEntry> = emptyList(),
    val watching: List<String> = emptyList(),
    val ownedFrames: List<String> = emptyList(),
)

data class WatchHistoryEntry(
    val id: String,
    val title: String,
    val cover: String = "",
    val at: Long = 0,
    val episode: Int = 0,
)

/** A device session (`sessions/{sessionId}`) shown in Settings → Security. */
data class UserSession(
    val sessionId: String,
    val userId: String,
    val deviceId: String,
    val platform: String = "",
    val deviceName: String = "",
    val startTime: Long = 0,
    val lastActive: Long = 0,
)
