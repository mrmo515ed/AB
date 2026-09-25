package com.animeblack.core.navigation

import java.net.URI
import java.net.URLDecoder

/**
 * Parses the app's deep links into typed routes:
 *  - FCM payload urls produced by Cloud Functions: `/?go=chatRoom&id=ch_…`, `/?go=groupRoom&id=…`
 *  - PWA shortcuts: `?go=feed|chat|worlds|hub`
 *  - `animeblack://post/<id>`, `animeblack://user/<uid>`, `animeblack://chat/<chatId>` …
 *
 * Ids are validated (same charset as Firestore rules `isValidId`) so crafted links cannot inject
 * paths. Deep links never bypass authentication: the host only navigates after sign-in.
 */
object DeepLinkParser {
    private val SAFE_ID = Regex("^[a-zA-Z0-9_\\-.:@]{1,128}$")

    fun parse(raw: String?): Any? {
        if (raw.isNullOrBlank()) return null
        val uri = try {
            URI(raw.trim())
        } catch (_: Exception) {
            return null
        }
        val params = parseQuery(uri.rawQuery)
        val go = params["go"]
        if (go != null) return fromGo(go, params["id"])

        if (uri.scheme == "animeblack") {
            val segments = listOfNotNull(uri.host) + (uri.path ?: "").split('/').filter { it.isNotBlank() }
            return fromSegments(segments)
        }
        return null
    }

    private fun fromGo(go: String, id: String?): Any? {
        val safeId = id?.takeIf { SAFE_ID.matches(it) }
        return when (go) {
            "feed", "home" -> HomeRoute
            "chat" -> ChatListRoute
            "worlds", "groups", "communities" -> CommunityRoute
            "hub", "more" -> MoreRoute
            "reels" -> ReelsRoute
            "notifications" -> NotificationsRoute
            "chatRoom" -> safeId?.let { ChatRoomRoute(chatId = it) }
            "groupRoom" -> safeId?.let { GroupRoomRoute(it) }
            "worldRoom" -> safeId?.let { WorldRoomRoute(it) }
            "postDetail", "postView" -> safeId?.let { PostDetailRoute(it) }
            "profile", "publicProfile", "userProfile" -> ProfileRoute(safeId)
            "reelView" -> safeId?.let { ReelViewerRoute(it) }
            "communityDetail" -> safeId?.let { CommunityDetailRoute(it) }
            "search" -> SearchRoute()
            "economy" -> EconomyRoute
            "gamesHome" -> GamesHubRoute
            else -> null
        }
    }

    private fun fromSegments(segments: List<String>): Any? {
        if (segments.isEmpty()) return HomeRoute
        val id = segments.getOrNull(1)?.takeIf { SAFE_ID.matches(it) }
        return when (segments[0]) {
            "post" -> id?.let { PostDetailRoute(it) }
            "user", "profile" -> id?.let { ProfileRoute(it) }
            "chat" -> id?.let { ChatRoomRoute(chatId = it) }
            "group" -> id?.let { GroupRoomRoute(it) }
            "world" -> id?.let { WorldRoomRoute(it) }
            "reel" -> id?.let { ReelViewerRoute(it) }
            "community" -> id?.let { CommunityDetailRoute(it) }
            "notifications" -> NotificationsRoute
            else -> null
        }
    }

    private fun parseQuery(query: String?): Map<String, String> {
        if (query.isNullOrBlank()) return emptyMap()
        return query.split('&').mapNotNull { pair ->
            val idx = pair.indexOf('=')
            if (idx <= 0) return@mapNotNull null
            val k = URLDecoder.decode(pair.substring(0, idx), "UTF-8")
            val v = URLDecoder.decode(pair.substring(idx + 1), "UTF-8")
            k to v
        }.toMap()
    }
}
