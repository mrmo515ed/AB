package com.animeblack.core.data.mapper

import com.animeblack.core.data.firebase.bool
import com.animeblack.core.data.firebase.countOf
import com.animeblack.core.data.firebase.firstLong
import com.animeblack.core.data.firebase.int
import com.animeblack.core.data.firebase.long
import com.animeblack.core.data.firebase.mapList
import com.animeblack.core.data.firebase.obj
import com.animeblack.core.data.firebase.str
import com.animeblack.core.data.firebase.strList
import com.animeblack.core.data.firebase.strOrNull
import com.animeblack.core.model.PrivacySettings
import com.animeblack.core.model.User
import com.animeblack.core.model.UserSession
import com.animeblack.core.model.UserState
import com.animeblack.core.model.WatchHistoryEntry

internal fun Map<String, Any?>.toUser(id: String): User {
    val followersList = strList("followers_list").ifEmpty { strList("followersList") }
    val followingList = strList("following_list").ifEmpty { strList("followingList") }
    val privacyMap = obj("privacy")
    return User(
        id = id,
        name = str("name"),
        username = str("username"),
        email = str("email"),
        avatar = str("avatar").ifBlank { str("photoURL") },
        cover = strOrNull("cover"),
        bio = str("bio"),
        role = str("role", User.ROLE_MEMBER).ifBlank { User.ROLE_MEMBER },
        level = int("level", 1).coerceAtLeast(1),
        xp = long("xp"),
        xpNext = long("xpNext", 100).coerceAtLeast(1),
        coins = long("coins"),
        stars = long("stars"),
        gems = long("gems"),
        reputation = long("reputation"),
        followersCount = maxOf(countOf("followers"), countOf("followersCount"), followersList.size),
        followingCount = maxOf(countOf("following"), countOf("followingCount"), followingList.size),
        followersList = followersList,
        followingList = followingList,
        joined = firstLong("joined", "createdAt"),
        isVerified = bool("isVerified") || bool("verified"),
        verifiedType = strOrNull("verifiedType"),
        badges = strList("badges"),
        titles = strList("titles"),
        equippedTitle = strOrNull("equippedTitle"),
        avatarFrame = strOrNull("avatarFrame"),
        online = bool("online"),
        lastSeen = firstLong("lastSeen", "lastActiveServer", "lastActive"),
        profileCompleted = if (containsKey("profileCompleted")) bool("profileCompleted", true) else true,
        location = str("loc").ifBlank { str("location") },
        website = str("site").ifBlank { str("website") },
        favAnimeName = str("favAnimeName"),
        favStudio = str("favStudio"),
        privacy = PrivacySettings(
            whoSeesCoins = privacyMap?.str("whoSeesCoins", "everyone") ?: "everyone",
            whoSeesLevel = privacyMap?.str("whoSeesLevel", "everyone") ?: "everyone",
            whoSeesActivity = privacyMap?.str("whoSeesActivity", "everyone") ?: "everyone",
            privateAccount = privacyMap?.bool("privateAccount") ?: false,
            showOnline = privacyMap?.bool("showOnline", true) ?: true,
            allowDM = privacyMap?.str("allowDM", "everyone")?.ifBlank { "everyone" } ?: "everyone",
        ),
        requiresChatRequest = bool("reqGate"),
        closeFriends = strList("closeFriends"),
        dailyStreak = int("dailyStreak"),
        lastDailyClaim = long("lastDailyClaim"),
    )
}

internal fun Map<String, Any?>.toUserState(): UserState = UserState(
    savedPostIds = strList("saved"),
    blocked = (strList("blocked") + strList("blocked_list")).distinct(),
    following = (strList("following") + strList("following_list")).distinct(),
    favAnime = strList("favAnime"),
    favChars = strList("favChars"),
    history = mapList("history").mapNotNull { h ->
        val id = h.str("id").ifBlank { h.str("animeId") }
        if (id.isBlank()) null else WatchHistoryEntry(id, h.str("title").ifBlank { h.str("name") }, h.str("cover").ifBlank { h.str("img") }, h.firstLong("at", "watchedAt"), h.int("episode", h.int("ep")))
    },
    watching = strList("watching"),
    ownedFrames = strList("ownedFrames"),
)

internal fun Map<String, Any?>.toSession(id: String): UserSession = UserSession(
    sessionId = str("sessionId").ifBlank { id },
    userId = str("userId"),
    deviceId = str("deviceId"),
    platform = str("platform").ifBlank { if (str("userAgent").contains("Android", true)) "android" else "web" },
    deviceName = str("deviceName").ifBlank { str("userAgent").take(80) },
    startTime = long("startTime"),
    lastActive = long("lastActive"),
)
