package com.animeblack.feature.more

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import androidx.navigation.toRoute
import androidx.paging.PagingData
import androidx.paging.cachedIn
import com.animeblack.core.common.result.AppResult
import com.animeblack.core.data.remote.FeatureFlags
import com.animeblack.core.data.remote.Flags
import com.animeblack.core.data.repository.AnimeRepository
import com.animeblack.core.data.repository.EconomyRepository
import com.animeblack.core.data.repository.PostRepository
import com.animeblack.core.data.repository.ReportRepository
import com.animeblack.core.data.repository.UserRepository
import com.animeblack.core.data.repository.WorkspaceRepository
import com.animeblack.core.model.EconomyTransaction
import com.animeblack.core.model.Post
import com.animeblack.core.model.Thought
import com.animeblack.core.model.User
import com.animeblack.core.model.Wallet
import com.animeblack.core.model.WatchHistoryEntry
import com.animeblack.core.navigation.ReportRoute
import com.animeblack.core.navigation.UserPostsRoute
import com.animeblack.core.ui.messageRes
import dagger.hilt.android.lifecycle.HiltViewModel
import java.util.UUID
import javax.inject.Inject
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.debounce
import kotlinx.coroutines.flow.mapLatest
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

/** Base with a one-shot message channel (string resources) for snackbars. */
abstract class MessagesViewModel : ViewModel() {
    private val _messages = MutableSharedFlow<Int>(extraBufferCapacity = 3)
    val messages: SharedFlow<Int> = _messages.asSharedFlow()
    protected fun message(res: Int) {
        _messages.tryEmit(res)
    }

    protected fun failure(result: AppResult<*>): Boolean {
        if (result is AppResult.Failure) {
            _messages.tryEmit(result.error.messageRes())
            return true
        }
        return false
    }
}

// ============================================================================ Hub

data class MoreUiState(val me: User? = null, val flags: Flags = Flags(), val wallet: Wallet = Wallet())

@HiltViewModel
class MoreViewModel @Inject constructor(users: UserRepository, flags: FeatureFlags, economy: EconomyRepository) : ViewModel() {
    val state: StateFlow<MoreUiState> = combine(users.observeMe(), flags.flags, economy.observeWallet()) { me, f, w -> MoreUiState(me, f, w) }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), MoreUiState())
}

// ============================================================================ Economy

data class EconomyUiState(
    val wallet: Wallet = Wallet(),
    val transactions: List<EconomyTransaction> = emptyList(),
    val claiming: Boolean = false,
    val recipientQuery: String = "",
    val recipientResults: List<User> = emptyList(),
    val recipient: User? = null,
    val amount: String = "",
    val currency: String = "coins",
    val note: String = "",
    val sending: Boolean = false,
    val myUid: String = "",
)

@HiltViewModel
class EconomyViewModel @Inject constructor(
    private val economy: EconomyRepository,
    private val users: UserRepository,
) : MessagesViewModel() {
    private val form = MutableStateFlow(EconomyUiState())
    private val recipientQuery = MutableStateFlow("")
    private val _claimed = MutableSharedFlow<Pair<Long, Long>>(extraBufferCapacity = 1)
    val claimed: SharedFlow<Pair<Long, Long>> = _claimed.asSharedFlow()

    private val results: Flow<List<User>> = recipientQuery.debounce(300).mapLatest { q ->
        if (q.trim().length < 2) emptyList() else (users.searchUsers(q.trim(), 10) as? AppResult.Success)?.data.orEmpty()
    }

    val state: StateFlow<EconomyUiState> = combine(form, economy.observeWallet(), economy.observeTransactions(), results, users.observeMe()) { f, w, t, r, me ->
        f.copy(wallet = w, transactions = t, recipientResults = r.filter { it.id != me?.id }, myUid = me?.id.orEmpty())
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), EconomyUiState())

    fun update(transform: (EconomyUiState) -> EconomyUiState) = form.update(transform)

    fun onRecipientQuery(q: String) {
        form.update { it.copy(recipientQuery = q, recipient = null) }
        recipientQuery.value = q
    }

    fun pickRecipient(user: User) {
        form.update { it.copy(recipient = user, recipientQuery = user.displayName) }
        recipientQuery.value = ""
    }

    fun claimDaily() {
        if (form.value.claiming) return
        form.update { it.copy(claiming = true) }
        viewModelScope.launch {
            val r = economy.claimDailyReward()
            form.update { it.copy(claiming = false) }
            if (r is AppResult.Success) _claimed.tryEmit(r.data.rewardCoins to r.data.rewardGems) else failure(r)
        }
    }

    fun transfer() {
        val s = form.value
        val to = s.recipient ?: return
        val amount = s.amount.toLongOrNull()
        if (amount == null || amount <= 0) {
            message(R.string.eco_invalid_amount)
            return
        }
        if (s.sending) return
        form.update { it.copy(sending = true) }
        viewModelScope.launch {
            val r = economy.transfer(to.id, s.currency, amount, s.note)
            form.update { it.copy(sending = false) }
            if (!failure(r)) {
                message(R.string.eco_sent)
                form.update { it.copy(recipient = null, recipientQuery = "", amount = "", note = "") }
            }
        }
    }
}

// ============================================================================ Levels

@HiltViewModel
class LevelsViewModel @Inject constructor(users: UserRepository) : ViewModel() {
    val me: StateFlow<User?> = users.observeMe().stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), null)
}

// ============================================================================ Workspace

@HiltViewModel
class WorkspaceViewModel @Inject constructor(private val repository: WorkspaceRepository) : MessagesViewModel() {
    val query = MutableStateFlow("")
    val thoughts: StateFlow<List<Thought>?> = combine(repository.observeThoughts(), query) { list, q ->
        val needle = q.trim()
        list.filter { needle.isEmpty() || it.title.contains(needle, true) || it.text.contains(needle, true) || it.tags.any { t -> t.contains(needle, true) } }
            .sortedWith(compareByDescending<Thought> { it.pinned }.thenByDescending { it.updatedAt })
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), null)

    fun save(existing: Thought?, title: String, text: String, tags: String, pinned: Boolean) = viewModelScope.launch {
        val now = System.currentTimeMillis()
        val thought = Thought(
            id = existing?.id ?: "th_${now}_${UUID.randomUUID().toString().take(6)}",
            title = title.trim().take(120),
            text = text.trim().take(10_000),
            tags = tags.split(',').map { it.trim().removePrefix("#") }.filter { it.isNotEmpty() }.distinct().take(10),
            pinned = pinned,
            color = existing?.color.orEmpty(),
            createdAt = existing?.createdAt ?: now,
            updatedAt = now,
        )
        failure(repository.save(thought))
    }

    fun togglePin(t: Thought) = viewModelScope.launch { failure(repository.save(t.copy(pinned = !t.pinned, updatedAt = System.currentTimeMillis()))) }
    fun delete(t: Thought) = viewModelScope.launch { failure(repository.delete(t.id)) }
}

// ============================================================================ Saved / user posts

data class PostListUiState(val loading: Boolean = true, val posts: List<Post> = emptyList(), val myUid: String = "", val savedIds: Set<String> = emptySet())

@HiltViewModel
class SavedPostsViewModel @Inject constructor(private val posts: PostRepository, users: UserRepository) : MessagesViewModel() {
    val state: StateFlow<PostListUiState> = combine(posts.observeSavedPosts(), posts.observeSavedIds(), users.observeMe()) { list, saved, me ->
        PostListUiState(false, list, me?.id.orEmpty(), saved)
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), PostListUiState())

    fun like(p: Post) = viewModelScope.launch { failure(posts.toggleLike(p)) }
    fun react(p: Post, k: String) = viewModelScope.launch { failure(posts.react(p, k)) }
    fun save(p: Post, s: Boolean) = viewModelScope.launch { failure(posts.setSaved(p.id, s)) }
    fun vote(p: Post, o: String) = viewModelScope.launch { failure(posts.votePoll(p.id, o)) }
}

@HiltViewModel
class UserPostsViewModel @Inject constructor(
    savedStateHandle: SavedStateHandle,
    private val posts: PostRepository,
    users: UserRepository,
) : MessagesViewModel() {
    private val uid = savedStateHandle.toRoute<UserPostsRoute>().userId
    val paged: Flow<PagingData<Post>> = posts.userPosts(uid).cachedIn(viewModelScope)
    val meta: StateFlow<Pair<String, Set<String>>> = combine(users.observeMe(), posts.observeSavedIds()) { me, saved -> me?.id.orEmpty() to saved }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), "" to emptySet())

    fun like(p: Post) = viewModelScope.launch { failure(posts.toggleLike(p)) }
    fun react(p: Post, k: String) = viewModelScope.launch { failure(posts.react(p, k)) }
    fun save(p: Post, s: Boolean) = viewModelScope.launch { failure(posts.setSaved(p.id, s)) }
    fun vote(p: Post, o: String) = viewModelScope.launch { failure(posts.votePoll(p.id, o)) }
}

// ============================================================================ Favourites

data class FavoritesUiState(val loading: Boolean = true, val favorites: List<String> = emptyList(), val history: List<WatchHistoryEntry> = emptyList())

@HiltViewModel
class FavoritesViewModel @Inject constructor(anime: AnimeRepository, users: UserRepository) : ViewModel() {
    val state: StateFlow<FavoritesUiState> = combine(anime.observeFavorites(), users.observeUserState()) { fav, us ->
        FavoritesUiState(false, fav, us.history)
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), FavoritesUiState())
}

// ============================================================================ Report

val REPORT_REASONS = listOf(
    "spam" to R.string.report_r_spam,
    "abuse" to R.string.report_r_abuse,
    "hate" to R.string.report_r_hate,
    "nsfw" to R.string.report_r_nsfw,
    "spoiler" to R.string.report_r_spoiler,
    "impersonation" to R.string.report_r_impersonation,
    "other" to R.string.report_r_other,
)

data class ReportUiState(val reason: String = "spam", val details: String = "", val sending: Boolean = false)

@HiltViewModel
class ReportViewModel @Inject constructor(savedStateHandle: SavedStateHandle, private val repository: ReportRepository) : MessagesViewModel() {
    private val route = savedStateHandle.toRoute<ReportRoute>()
    private val _state = MutableStateFlow(ReportUiState())
    val state: StateFlow<ReportUiState> = _state.asStateFlow()
    private val _done = MutableSharedFlow<Unit>(extraBufferCapacity = 1)
    val done: SharedFlow<Unit> = _done.asSharedFlow()

    fun update(transform: (ReportUiState) -> ReportUiState) = _state.update(transform)

    fun send() {
        val s = _state.value
        if (s.sending) return
        _state.update { it.copy(sending = true) }
        viewModelScope.launch {
            val r = repository.report(route.targetType, route.targetId, s.reason, s.details.trim().take(1_000))
            _state.update { it.copy(sending = false) }
            if (!failure(r)) {
                message(R.string.report_sent)
                _done.tryEmit(Unit)
            }
        }
    }
}
