package com.animeblack.feature.home

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import androidx.navigation.toRoute
import com.animeblack.core.common.network.NetworkMonitor
import com.animeblack.core.common.result.AppError
import com.animeblack.core.common.result.AppResult
import com.animeblack.core.data.firebase.AppErrorException
import com.animeblack.core.data.outbox.OutboxRepository
import com.animeblack.core.data.repository.FeedState
import com.animeblack.core.data.repository.NotificationRepository
import com.animeblack.core.data.repository.PostRepository
import com.animeblack.core.data.repository.StoryDraft
import com.animeblack.core.data.repository.StoryRepository
import com.animeblack.core.data.repository.UserRepository
import com.animeblack.core.datastore.SettingsDataSource
import com.animeblack.core.model.LocalMedia
import com.animeblack.core.model.Post
import com.animeblack.core.model.PostDraft
import com.animeblack.core.model.Story
import com.animeblack.core.model.StoryItem
import com.animeblack.core.model.User
import com.animeblack.core.navigation.CreatePostRoute
import com.animeblack.core.navigation.PostDetailRoute
import com.animeblack.core.navigation.StoryViewerRoute
import com.animeblack.core.ui.messageRes
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject
import kotlinx.coroutines.FlowPreview
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.debounce
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

/** Shared post interactions used by feed, detail and profile screens. */
abstract class PostInteractionsViewModel(
    protected val posts: PostRepository,
) : ViewModel() {
    private val _messages = MutableSharedFlow<Int>(extraBufferCapacity = 4)
    val messages: SharedFlow<Int> = _messages.asSharedFlow()

    protected fun emitError(result: AppResult<*>) {
        if (result is AppResult.Failure) _messages.tryEmit(result.error.messageRes())
    }

    protected fun emitMessage(res: Int) {
        _messages.tryEmit(res)
    }

    fun like(post: Post) = viewModelScope.launch { emitError(posts.toggleLike(post)) }
    fun react(post: Post, key: String) = viewModelScope.launch { emitError(posts.react(post, key)) }
    fun save(post: Post, saved: Boolean) = viewModelScope.launch { emitError(posts.setSaved(post.id, saved)) }
    fun share(post: Post) = viewModelScope.launch { posts.share(post.id) }
    fun vote(post: Post, optionId: String) = viewModelScope.launch { emitError(posts.votePoll(post.id, optionId)) }
    fun delete(post: Post) = viewModelScope.launch { emitError(posts.deletePost(post.id)) }
}

data class HomeUiState(
    val feed: FeedState = FeedState(),
    val stories: List<Story> = emptyList(),
    val me: User? = null,
    val savedIds: Set<String> = emptySet(),
    val unreadNotifications: Int = 0,
    val online: Boolean = true,
    val autoplay: Boolean = true,
    val error: AppError? = null,
)

@HiltViewModel
class HomeViewModel @Inject constructor(
    posts: PostRepository,
    private val stories: StoryRepository,
    private val users: UserRepository,
    private val notifications: NotificationRepository,
    private val settings: SettingsDataSource,
    private val outbox: OutboxRepository,
    network: NetworkMonitor,
) : PostInteractionsViewModel(posts) {

    private val error = MutableStateFlow<AppError?>(null)
    private val feedFlow = posts.observeFeed().catch { e ->
        error.value = (e as? AppErrorException)?.error ?: AppError.Unknown(e)
        emit(FeedState(initialLoaded = true))
    }

    val state: StateFlow<HomeUiState> = combine(
        combine(feedFlow, stories.observeActiveStories(), users.observeMe()) { f, s, m -> Triple(f, s, m) },
        combine(posts.observeSavedIds(), notifications.observeUnreadCount(), network.isOnline) { a, b, c -> Triple(a, b, c) },
        combine(settings.settings, error) { s, e -> s to e },
    ) { (feed, storyList, me), (saved, unread, online), (s, err) ->
        HomeUiState(feed, storyList, me, saved, unread, online, s.autoplayVideos && !s.dataSaver, err)
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), HomeUiState())

    fun loadMore() = viewModelScope.launch { emitError(posts.loadMoreFeed()) }
    fun retryUploads() = viewModelScope.launch { outbox.retryFailed() }
    fun hide(post: Post) = viewModelScope.launch { settings.update { it.copy(hiddenPosts = it.hiddenPosts + post.id) } }
    fun clearError() { error.value = null }
}

data class PostDetailUiState(
    val post: Post? = null,
    val loading: Boolean = true,
    val me: User? = null,
    val saved: Boolean = false,
    val commentText: String = "",
    val sending: Boolean = false,
)

@HiltViewModel
class PostDetailViewModel @Inject constructor(
    savedStateHandle: SavedStateHandle,
    posts: PostRepository,
    users: UserRepository,
) : PostInteractionsViewModel(posts) {
    private val route = savedStateHandle.toRoute<PostDetailRoute>()
    val focusComment = route.focusComment
    private val comment = MutableStateFlow("")
    private val sending = MutableStateFlow(false)

    val state: StateFlow<PostDetailUiState> = combine(
        posts.observePost(route.postId).map<Post?, Pair<Post?, Boolean>> { it to false }.catch { emit(null to false) },
        users.observeMe(),
        posts.observeSavedIds(),
        comment,
        sending,
    ) { (post, loading), me, saved, text, isSending ->
        PostDetailUiState(post, loading, me, post != null && post.id in saved, text, isSending)
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), PostDetailUiState())

    fun onComment(text: String) {
        comment.value = text.take(1_000)
    }

    fun sendComment() {
        val text = comment.value.trim()
        if (text.isEmpty() || sending.value) return
        viewModelScope.launch {
            sending.value = true
            val r = posts.addComment(route.postId, text)
            sending.value = false
            if (r is AppResult.Success) comment.value = "" else emitError(r)
        }
    }

    fun deleteComment(commentId: String) = viewModelScope.launch { emitError(posts.deleteComment(route.postId, commentId)) }
}

data class ComposerUiState(
    val text: String = "",
    val attachments: List<LocalMedia> = emptyList(),
    val pollEnabled: Boolean = false,
    val pollQuestion: String = "",
    val pollOptions: List<String> = listOf("", ""),
    val spoiler: Boolean = false,
    val allowComments: Boolean = true,
    val privacy: String = Post.PRIVACY_PUBLIC,
    val location: String = "",
    val category: String = "",
    val publishing: Boolean = false,
    val editing: Boolean = false,
    val me: User? = null,
) {
    val canPublish: Boolean
        get() = !publishing && (text.isNotBlank() || attachments.isNotEmpty() ||
            (pollEnabled && pollQuestion.isNotBlank() && pollOptions.count { it.isNotBlank() } >= 2))
}

@HiltViewModel
class CreatePostViewModel @Inject constructor(
    savedStateHandle: SavedStateHandle,
    posts: PostRepository,
    private val users: UserRepository,
    private val settings: SettingsDataSource,
) : PostInteractionsViewModel(posts) {
    private val route = savedStateHandle.toRoute<CreatePostRoute>()
    private val _state = MutableStateFlow(ComposerUiState(editing = route.editPostId != null))
    val state: StateFlow<ComposerUiState> = _state.asStateFlow()
    private val _published = MutableSharedFlow<Unit>(extraBufferCapacity = 1)
    val published: SharedFlow<Unit> = _published.asSharedFlow()

    init {
        viewModelScope.launch {
            val me = users.observeMe().first()
            _state.update { it.copy(me = me) }
            val editId = route.editPostId
            if (editId != null) {
                val post = posts.observePost(editId).first()
                if (post != null) {
                    _state.update {
                        it.copy(text = post.text, spoiler = post.spoiler, allowComments = post.allowComments, privacy = post.privacy, location = post.location, category = post.category)
                    }
                }
            } else {
                val draft = settings.postDraft.first()
                if (draft.isNotBlank()) _state.update { it.copy(text = draft) }
            }
        }
        autosaveDraft()
    }

    @OptIn(FlowPreview::class)
    private fun autosaveDraft() {
        if (route.editPostId != null) return
        viewModelScope.launch {
            _state.map { it.text }.debounce(800).collect { settings.setPostDraft(it) }
        }
    }

    fun onText(v: String) = _state.update { it.copy(text = v.take(5_000)) }
    fun addMedia(items: List<LocalMedia>) = _state.update { it.copy(attachments = (it.attachments + items).distinctBy { m -> m.uri }.take(10)) }
    fun removeMedia(uri: String) = _state.update { it.copy(attachments = it.attachments.filterNot { m -> m.uri == uri }) }
    fun togglePoll() = _state.update { it.copy(pollEnabled = !it.pollEnabled) }
    fun onPollQuestion(v: String) = _state.update { it.copy(pollQuestion = v.take(200)) }
    fun onPollOption(i: Int, v: String) = _state.update { s -> s.copy(pollOptions = s.pollOptions.mapIndexed { idx, o -> if (idx == i) v.take(80) else o }) }
    fun addPollOption() = _state.update { s -> if (s.pollOptions.size < 6) s.copy(pollOptions = s.pollOptions + "") else s }
    fun onSpoiler(v: Boolean) = _state.update { it.copy(spoiler = v) }
    fun onAllowComments(v: Boolean) = _state.update { it.copy(allowComments = v) }
    fun onPrivacy(v: String) = _state.update { it.copy(privacy = v) }
    fun onLocation(v: String) = _state.update { it.copy(location = v.take(80)) }

    fun publish() {
        val s = _state.value
        if (!s.canPublish) return
        viewModelScope.launch {
            _state.update { it.copy(publishing = true) }
            val draft = PostDraft(
                text = s.text,
                category = s.category,
                attachments = s.attachments,
                pollQuestion = if (s.pollEnabled) s.pollQuestion else "",
                pollOptions = if (s.pollEnabled) s.pollOptions else emptyList(),
                location = s.location,
                privacy = s.privacy,
                spoiler = s.spoiler,
                allowComments = s.allowComments,
            )
            val result = route.editPostId?.let { posts.updatePost(it, draft) } ?: posts.createPost(draft)
            _state.update { it.copy(publishing = false) }
            if (result is AppResult.Success) {
                if (route.editPostId == null) settings.setPostDraft("")
                emitMessage(R.string.compose_published)
                _published.tryEmit(Unit)
            } else {
                emitError(result)
            }
        }
    }
}

data class StoryViewerUiState(
    val stories: List<Story> = emptyList(),
    val startIndex: Int = 0,
    val myUid: String = "",
    val loaded: Boolean = false,
)

@HiltViewModel
class StoryViewerViewModel @Inject constructor(
    savedStateHandle: SavedStateHandle,
    private val repository: StoryRepository,
    users: UserRepository,
) : ViewModel() {
    private val route = savedStateHandle.toRoute<StoryViewerRoute>()
    private val _messages = MutableSharedFlow<Int>(extraBufferCapacity = 2)
    val messages: SharedFlow<Int> = _messages.asSharedFlow()

    val state: StateFlow<StoryViewerUiState> = combine(repository.observeActiveStories(), users.observeMe()) { list, me ->
        StoryViewerUiState(list, list.indexOfFirst { it.userId == route.userId }.coerceAtLeast(0), me?.id.orEmpty(), true)
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), StoryViewerUiState())

    fun viewed(story: Story) = viewModelScope.launch { repository.markViewed(story) }
    fun react(story: Story, icon: String) = viewModelScope.launch {
        val r = repository.react(story, icon)
        if (r is AppResult.Failure) _messages.tryEmit(r.error.messageRes())
    }

    fun reply(story: Story, item: StoryItem, text: String) = viewModelScope.launch {
        val r = repository.reply(story, item, text)
        if (r is AppResult.Failure) _messages.tryEmit(r.error.messageRes())
    }

    fun delete(story: Story, itemId: String) = viewModelScope.launch { repository.deleteItem(story, itemId) }
}

data class CreateStoryUiState(
    val text: String = "",
    val media: LocalMedia? = null,
    val preset: Int = 0,
    val closeFriends: Boolean = false,
    val publishing: Boolean = false,
)

@HiltViewModel
class CreateStoryViewModel @Inject constructor(
    private val repository: StoryRepository,
) : ViewModel() {
    private val _state = MutableStateFlow(CreateStoryUiState())
    val state: StateFlow<CreateStoryUiState> = _state.asStateFlow()
    private val _done = MutableSharedFlow<Int>(extraBufferCapacity = 1)
    val done: SharedFlow<Int> = _done.asSharedFlow()

    fun onText(v: String) = _state.update { it.copy(text = v.take(500)) }
    fun onMedia(m: LocalMedia?) = _state.update { it.copy(media = m) }
    fun onPreset(i: Int) = _state.update { it.copy(preset = i) }
    fun onCloseFriends(v: Boolean) = _state.update { it.copy(closeFriends = v) }

    fun publish() {
        val s = _state.value
        if (s.publishing || (s.text.isBlank() && s.media == null)) return
        viewModelScope.launch {
            _state.update { it.copy(publishing = true) }
            val (c1, c2) = STORY_PRESETS[s.preset]
            val r = repository.publish(StoryDraft(text = s.text, media = s.media, color1 = c1, color2 = c2, closeFriends = s.closeFriends))
            _state.update { it.copy(publishing = false) }
            _done.tryEmit(if (r is AppResult.Success) R.string.story_published else (r as AppResult.Failure).error.messageRes())
        }
    }

    companion object {
        /** Gradient presets shared with the web (`STORY_PRESETS`). */
        val STORY_PRESETS = listOf(
            "#7F1D1D" to "#EA580C",
            "#3B0764" to "#A855F7",
            "#064E3B" to "#10B981",
            "#0C4A6E" to "#0EA5E9",
            "#831843" to "#DB2777",
            "#111827" to "#374151",
            "#78350F" to "#F59E0B",
        )
    }
}
