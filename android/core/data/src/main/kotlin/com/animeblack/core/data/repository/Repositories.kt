package com.animeblack.core.data.repository

import android.content.Context
import androidx.paging.PagingData
import com.animeblack.core.common.result.AppResult
import com.animeblack.core.model.AgentAnswer
import com.animeblack.core.model.AnimeItem
import com.animeblack.core.model.AppNotification
import com.animeblack.core.model.AuditLog
import com.animeblack.core.model.Broadcast
import com.animeblack.core.model.ChatMessage
import com.animeblack.core.model.ChatRequest
import com.animeblack.core.model.Community
import com.animeblack.core.model.Conversation
import com.animeblack.core.model.DailyRewardResult
import com.animeblack.core.model.DmPermission
import com.animeblack.core.model.EconomyTransaction
import com.animeblack.core.model.GameProfile
import com.animeblack.core.model.GameRunResult
import com.animeblack.core.model.Group
import com.animeblack.core.model.LocalMedia
import com.animeblack.core.model.OutgoingMessage
import com.animeblack.core.model.Post
import com.animeblack.core.model.PostDraft
import com.animeblack.core.model.PrivacySettings
import com.animeblack.core.model.Reel
import com.animeblack.core.model.Report
import com.animeblack.core.model.RoomRef
import com.animeblack.core.model.SavedAccount
import com.animeblack.core.model.Story
import com.animeblack.core.model.StoryItem
import com.animeblack.core.model.Thought
import com.animeblack.core.model.User
import com.animeblack.core.model.UserSession
import com.animeblack.core.model.UserState
import com.animeblack.core.model.Wallet
import com.animeblack.core.model.World
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.StateFlow

// ============================================================================ Auth
sealed interface AuthState {
    data object Initializing : AuthState
    data object SignedOut : AuthState
    data class SignedIn(
        val uid: String,
        val email: String?,
        val emailVerified: Boolean,
        val provider: String,
        val displayName: String?,
        val photoUrl: String?,
    ) : AuthState
}

/** Profile bootstrap result after sign-in. */
sealed interface ProfileStatus {
    data object Loading : ProfileStatus
    data object NeedsCompletion : ProfileStatus
    data object Ready : ProfileStatus
    data class Error(val message: String) : ProfileStatus
}

interface AuthRepository {
    val authState: StateFlow<AuthState>
    val profileStatus: StateFlow<ProfileStatus>
    val currentUid: String?
    val savedAccounts: Flow<List<SavedAccount>>

    suspend fun signInWithEmail(email: String, password: String): AppResult<Unit>
    suspend fun signUpWithEmail(name: String, email: String, password: String): AppResult<Unit>

    /** Google sign-in with Credential Manager; [activityContext] must be an Activity. */
    suspend fun signInWithGoogle(activityContext: Context, onlyAuthorizedAccounts: Boolean = false): AppResult<Unit>
    suspend fun sendPasswordReset(email: String): AppResult<Unit>
    suspend fun sendEmailVerification(): AppResult<Unit>
    suspend fun reloadUser(): AppResult<Boolean>
    suspend fun signOut()
    suspend fun deleteAccount(): AppResult<Unit>
    suspend fun forgetSavedAccount(uid: String)
    suspend fun markProfileCompleted()
}

// ============================================================================ Users
data class ProfileUpdate(
    val name: String? = null,
    val username: String? = null,
    val bio: String? = null,
    val location: String? = null,
    val website: String? = null,
    val favAnimeName: String? = null,
    val favStudio: String? = null,
    val avatarUri: String? = null,
    val coverUri: String? = null,
    val profileCompleted: Boolean? = null,
)

interface UserRepository {
    fun observeMe(): Flow<User?>
    fun observeUser(uid: String): Flow<User?>
    fun observeUsers(uids: Collection<String>): Flow<Map<String, User>>
    suspend fun getUser(uid: String): User?
    suspend fun searchUsers(query: String, limit: Int = 25): AppResult<List<User>>
    fun observeSuggestedUsers(limit: Int = 20): Flow<List<User>>
    fun observeFollowList(uid: String, followers: Boolean): Flow<List<User>>
    suspend fun isUsernameAvailable(username: String): AppResult<Boolean>
    suspend fun updateProfile(update: ProfileUpdate): AppResult<Unit>
    suspend fun updatePrivacy(privacy: PrivacySettings, requiresChatRequest: Boolean): AppResult<Unit>
    suspend fun follow(uid: String): AppResult<Unit>
    suspend fun unfollow(uid: String): AppResult<Unit>
    fun observeUserState(): Flow<UserState>
    suspend fun block(uid: String): AppResult<Unit>
    suspend fun unblock(uid: String): AppResult<Unit>
}

// ============================================================================ Posts
data class FeedState(
    val posts: List<Post> = emptyList(),
    val hasMore: Boolean = true,
    val loadingMore: Boolean = false,
    val fromCache: Boolean = false,
    val initialLoaded: Boolean = false,
)

interface PostRepository {
    fun observeFeed(): Flow<FeedState>
    suspend fun loadMoreFeed(): AppResult<Unit>
    fun observePost(postId: String): Flow<Post?>
    fun userPosts(uid: String): Flow<PagingData<Post>>
    fun observeSavedPosts(): Flow<List<Post>>
    fun observeSavedIds(): Flow<Set<String>>
    suspend fun createPost(draft: PostDraft): AppResult<String>
    suspend fun updatePost(postId: String, draft: PostDraft): AppResult<Unit>
    suspend fun deletePost(postId: String): AppResult<Unit>
    suspend fun toggleLike(post: Post): AppResult<Unit>
    suspend fun react(post: Post, reactionKey: String): AppResult<Unit>
    suspend fun addComment(postId: String, text: String, replyToId: String? = null): AppResult<Unit>
    suspend fun deleteComment(postId: String, commentId: String): AppResult<Unit>
    suspend fun votePoll(postId: String, optionId: String): AppResult<Unit>
    suspend fun share(postId: String): AppResult<Unit>
    suspend fun setSaved(postId: String, saved: Boolean): AppResult<Unit>
    suspend fun searchPosts(query: String): AppResult<List<Post>>
    fun observeTrendingTags(): Flow<List<Pair<String, Int>>>
}

// ============================================================================ Stories & reels
data class StoryDraft(
    val text: String = "",
    val media: LocalMedia? = null,
    val color1: String = "#7F1D1D",
    val color2: String = "#EA580C",
    val textColor: String = "#FFFFFF",
    val textSize: Int = 22,
    val closeFriends: Boolean = false,
)

interface StoryRepository {
    fun observeActiveStories(): Flow<List<Story>>
    suspend fun publish(draft: StoryDraft): AppResult<Unit>
    suspend fun markViewed(story: Story): AppResult<Unit>
    suspend fun react(story: Story, icon: String): AppResult<Unit>
    suspend fun reply(story: Story, item: StoryItem, text: String): AppResult<Unit>
    suspend fun deleteItem(story: Story, itemId: String): AppResult<Unit>
}

interface ReelRepository {
    fun observeReels(): Flow<List<Reel>>
    fun observeReel(id: String): Flow<Reel?>
    suspend fun publish(video: LocalMedia, caption: String, music: String): AppResult<Unit>
    suspend fun toggleLike(reel: Reel): AppResult<Unit>
    suspend fun addComment(reelId: String, text: String): AppResult<Unit>
    suspend fun recordView(reelId: String)
    suspend fun share(reelId: String): AppResult<Unit>
    suspend fun delete(reelId: String): AppResult<Unit>
}

// ============================================================================ Chat
interface ChatRepository {
    fun observeConversations(): Flow<List<Conversation>>
    fun observeConversation(chatId: String): Flow<Conversation?>
    fun observeMessages(chatId: String, limit: Long): Flow<List<ChatMessage>>
    fun observePendingMedia(chatId: String): Flow<List<ChatMessage>>
    suspend fun loadOlder(chatId: String, beforeAt: Long, pageSize: Long = 40): AppResult<List<ChatMessage>>
    suspend fun dmPermission(partnerId: String): DmPermission
    /** Creates (or reuses) the canonical conversation with [partnerId] and returns its id. */
    suspend fun openConversation(partnerId: String): AppResult<String>
    suspend fun send(chatId: String, partnerId: String, message: OutgoingMessage): AppResult<Unit>
    suspend fun edit(chatId: String, messageId: String, text: String): AppResult<Unit>
    suspend fun deleteForEveryone(chatId: String, messageId: String): AppResult<Unit>
    suspend fun deleteForMe(chatId: String, messageId: String): AppResult<Unit>
    suspend fun react(chatId: String, messageId: String, reactionKey: String?): AppResult<Unit>
    suspend fun markRead(chatId: String, messages: List<ChatMessage>)
    suspend fun setTyping(chatId: String, typing: Boolean)
    suspend fun setWallpaper(chatId: String, wallpaper: String?): AppResult<Unit>
    suspend fun deleteConversation(chatId: String): AppResult<Unit>
    suspend fun retryFailed(chatId: String)
    suspend fun resolveMediaUrl(attachmentSrc: String, storagePath: String?): String

    fun observeIncomingRequests(): Flow<List<ChatRequest>>
    fun observeOutgoingRequests(): Flow<List<ChatRequest>>
    suspend fun sendRequest(toUid: String, text: String): AppResult<Unit>
    suspend fun acceptRequest(request: ChatRequest): AppResult<String>
    suspend fun declineRequest(request: ChatRequest): AppResult<Unit>
    fun observeTotalUnread(): Flow<Int>
}

// ============================================================================ Community
data class GroupDraft(val name: String, val description: String, val icon: String, val isPrivate: Boolean, val initialMembers: List<String>)
data class WorldDraft(val name: String, val description: String, val icon: String, val theme: String, val rules: List<String>, val color1: String, val color2: String)
data class CommunityDraft(val name: String, val description: String, val tag: String, val focus: String, val requiresApproval: Boolean, val color1: String, val color2: String)

interface CommunityRepository {
    fun observeGroups(): Flow<List<Group>>
    fun observeGroup(id: String): Flow<Group?>
    suspend fun createGroup(draft: GroupDraft): AppResult<String>
    suspend fun joinGroup(group: Group): AppResult<Unit>
    suspend fun leaveGroup(group: Group): AppResult<Unit>
    suspend fun addGroupMember(group: Group, uid: String): AppResult<Unit>
    suspend fun removeGroupMember(group: Group, uid: String): AppResult<Unit>
    suspend fun updateGroup(group: Group, name: String, description: String, announceOnly: Boolean): AppResult<Unit>
    suspend fun deleteGroup(group: Group): AppResult<Unit>

    fun observeWorlds(): Flow<List<World>>
    fun observeWorld(id: String): Flow<World?>
    suspend fun createWorld(draft: WorldDraft): AppResult<String>
    suspend fun joinWorld(world: World): AppResult<Unit>
    suspend fun leaveWorld(world: World): AppResult<Unit>

    fun observeCommunities(): Flow<List<Community>>
    fun observeCommunity(id: String): Flow<Community?>
    suspend fun createCommunity(draft: CommunityDraft): AppResult<String>
    suspend fun joinCommunity(community: Community): AppResult<Unit>
    suspend fun leaveCommunity(community: Community): AppResult<Unit>

    fun observeRoomMessages(room: RoomRef, limit: Long): Flow<List<ChatMessage>>
    suspend fun sendRoomMessage(room: RoomRef, text: String, attachments: List<LocalMedia> = emptyList(), replyTo: com.animeblack.core.model.MessageQuote? = null): AppResult<Unit>
    suspend fun deleteRoomMessage(room: RoomRef, messageId: String): AppResult<Unit>
}

// ============================================================================ Notifications
interface NotificationRepository {
    fun observeNotifications(): Flow<List<AppNotification>>
    fun observeUnreadCount(): Flow<Int>
    fun observeBroadcasts(): Flow<List<Broadcast>>
    suspend fun markRead(id: String)
    suspend fun markAllRead()
    suspend fun delete(id: String)
    suspend fun notifyUser(
        toUid: String,
        type: String,
        title: String,
        body: String,
        postId: String? = null,
        storyId: String? = null,
        link: String? = null,
    )
}

// ============================================================================ Economy
interface EconomyRepository {
    fun observeWallet(): Flow<Wallet>
    fun observeTransactions(): Flow<List<EconomyTransaction>>
    suspend fun claimDailyReward(): AppResult<DailyRewardResult>
    suspend fun transfer(toUid: String, currency: String, amount: Long, note: String): AppResult<Unit>
}

// ============================================================================ Anime (AniList / Jikan) + AI agent
interface AnimeRepository {
    suspend fun trending(page: Int = 1): AppResult<List<AnimeItem>>
    suspend fun seasonal(): AppResult<List<AnimeItem>>
    suspend fun search(query: String, mediaType: String = "ANIME"): AppResult<List<AnimeItem>>
    suspend fun detail(id: String, mediaType: String = "ANIME"): AppResult<AnimeItem>
    suspend fun askAgent(prompt: String, mode: String, history: List<Pair<String, String>>): AppResult<AgentAnswer>
    val isAgentConfigured: Boolean
    fun observeFavorites(): Flow<List<String>>
    suspend fun toggleFavorite(anime: AnimeItem): AppResult<Unit>
    suspend fun addToHistory(anime: AnimeItem): AppResult<Unit>
}

// ============================================================================ Games
data class LeaderboardEntry(val uid: String, val name: String, val avatar: String, val score: Long, val level: Int)

interface GameRepository {
    fun observeProfile(): Flow<GameProfile?>
    suspend fun startRun(): AppResult<GameProfile>
    suspend fun submitRun(result: GameRunResult): AppResult<GameProfile>
    suspend fun unlockCharacter(characterId: String, cost: Long): AppResult<Unit>
    suspend fun upgradeCharacter(characterId: String, cost: Long): AppResult<Unit>
    suspend fun selectCharacter(characterId: String): AppResult<Unit>
    suspend fun claimDaily(): AppResult<Long>
    fun observeLeaderboard(): Flow<List<LeaderboardEntry>>
}

// ============================================================================ Admin / moderation
data class AdminMetrics(val users: Long, val posts: Long, val pendingReports: Long, val groups: Long)

interface AdminRepository {
    fun observeReports(): Flow<List<Report>>
    suspend fun resolveReport(report: Report, status: String, removeContent: Boolean): AppResult<Unit>
    suspend fun sendBroadcast(title: String, message: String, type: String): AppResult<Unit>
    suspend fun setRole(uid: String, role: String): AppResult<Unit>
    suspend fun setVerified(uid: String, verified: Boolean): AppResult<Unit>
    suspend fun deletePost(postId: String): AppResult<Unit>
    fun observeAuditLogs(): Flow<List<AuditLog>>
    suspend fun metrics(): AppResult<AdminMetrics>
    fun observeRecentUsers(): Flow<List<User>>
}

interface ReportRepository {
    suspend fun report(targetType: String, targetId: String, reason: String, details: String): AppResult<Unit>
}

// ============================================================================ Workspace
interface WorkspaceRepository {
    fun observeThoughts(): Flow<List<Thought>>
    suspend fun save(thought: Thought): AppResult<Unit>
    suspend fun delete(id: String): AppResult<Unit>
}

// ============================================================================ Sessions, devices, presence
interface SessionRepository {
    fun observeSessions(): Flow<List<UserSession>>
    suspend fun revoke(sessionId: String): AppResult<Unit>
    val currentSessionId: StateFlow<String?>
}

// ============================================================================ Sync diagnostics
data class SyncStatus(
    val online: Boolean,
    val backendReachable: Boolean,
    val pendingOutbox: Int,
    val failedOutbox: Int,
    val lastServerContactAt: Long,
)

interface SyncRepository {
    val status: Flow<SyncStatus>
    suspend fun retryFailed()
    suspend fun forceResync(): AppResult<Unit>
}

// ============================================================================ Media
interface MediaRepository {
    /** Copies/compresses a picked item into app storage so it survives process death. */
    suspend fun prepare(media: LocalMedia): AppResult<LocalMedia>
}
