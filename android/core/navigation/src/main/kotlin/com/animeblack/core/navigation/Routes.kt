package com.animeblack.core.navigation

import kotlinx.serialization.Serializable

// ------------------------------------------------------------------ Auth
@Serializable data object SplashRoute
@Serializable data object LoginRoute
@Serializable data object SignUpRoute
@Serializable data object ForgotPasswordRoute
@Serializable data object CompleteProfileRoute
@Serializable data object AccountSwitcherRoute

// ------------------------------------------------------------------ Top-level destinations (bottom bar)
@Serializable data object HomeRoute
@Serializable data object CommunityRoute
@Serializable data object ChatListRoute
@Serializable data object ReelsRoute
@Serializable data object MoreRoute

// ------------------------------------------------------------------ Home / posts / stories
@Serializable data class PostDetailRoute(val postId: String, val focusComment: Boolean = false)
@Serializable data class CreatePostRoute(val editPostId: String? = null, val quotePostId: String? = null)
@Serializable data class StoryViewerRoute(val userId: String)
@Serializable data object CreateStoryRoute
@Serializable data object MyStoriesRoute
@Serializable data class CameraRoute(val allowVideo: Boolean = false)
@Serializable data class MediaViewerRoute(val url: String, val type: String = "image")

// ------------------------------------------------------------------ Chat
@Serializable data class ChatRoomRoute(val chatId: String? = null, val partnerId: String? = null)
@Serializable data object ChatRequestsRoute
@Serializable data object NewChatRoute
@Serializable data class ChatInfoRoute(val chatId: String, val partnerId: String)

// ------------------------------------------------------------------ Community (groups / worlds / communities)
@Serializable data class GroupRoomRoute(val groupId: String)
@Serializable data class GroupInfoRoute(val groupId: String)
@Serializable data object CreateGroupRoute
@Serializable data class WorldRoomRoute(val worldId: String)
@Serializable data object CreateWorldRoute
@Serializable data class CommunityDetailRoute(val communityId: String)
@Serializable data class ChannelRoomRoute(val communityId: String, val channelId: String)
@Serializable data object CreateCommunityRoute

// ------------------------------------------------------------------ Reels
@Serializable data class ReelViewerRoute(val reelId: String)
@Serializable data object CreateReelRoute

// ------------------------------------------------------------------ Profile
@Serializable data class ProfileRoute(val userId: String? = null)
@Serializable data object EditProfileRoute
@Serializable data class FollowListRoute(val userId: String, val followers: Boolean)
@Serializable data object QrCardRoute

// ------------------------------------------------------------------ Notifications / search
@Serializable data object NotificationsRoute
@Serializable data class SearchRoute(val query: String = "")

// ------------------------------------------------------------------ Settings
@Serializable data object SettingsRoute
@Serializable data object PrivacySettingsRoute
@Serializable data object SecurityRoute
@Serializable data object BlockedUsersRoute
@Serializable data object SyncDiagnosticsRoute
@Serializable data class LegalRoute(val document: String)

// ------------------------------------------------------------------ More hub
@Serializable data object EconomyRoute
@Serializable data object LevelsRoute
@Serializable data object WorkspaceRoute
@Serializable data object SavedPostsRoute
@Serializable data class UserPostsRoute(val userId: String)
@Serializable data object FavoritesRoute
@Serializable data class ReportRoute(val targetType: String, val targetId: String)

// ------------------------------------------------------------------ Anime
@Serializable data object AnimeHubRoute
@Serializable data class AnimeDetailRoute(val id: String, val mediaType: String = "ANIME")
@Serializable data object SearchAgentRoute

// ------------------------------------------------------------------ Games
@Serializable data object GamesHubRoute
@Serializable data object GamePlayRoute
@Serializable data object GameLeaderboardRoute
@Serializable data object GameCharactersRoute

// ------------------------------------------------------------------ Admin
@Serializable data object AdminRoute
@Serializable data object AdminReportsRoute
@Serializable data object AdminUsersRoute
@Serializable data object AdminBroadcastRoute
@Serializable data object AdminAuditRoute

/** Legal documents shown by [LegalRoute]. */
object LegalDocuments {
    const val TERMS = "terms"
    const val PRIVACY = "privacy"
}

/** Keys used to pass results back through `SavedStateHandle` (e.g. camera capture). */
object NavResultKeys {
    const val CAPTURED_MEDIA_URI = "captured_media_uri"
    const val CAPTURED_MEDIA_TYPE = "captured_media_type"
}
