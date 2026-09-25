package com.animeblack.feature.profile

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import androidx.navigation.toRoute
import androidx.paging.PagingData
import androidx.paging.cachedIn
import com.animeblack.core.common.result.AppResult
import com.animeblack.core.common.util.Validators
import com.animeblack.core.data.repository.AuthRepository
import com.animeblack.core.data.repository.PostRepository
import com.animeblack.core.data.repository.ProfileUpdate
import com.animeblack.core.data.repository.ReelRepository
import com.animeblack.core.data.repository.UserRepository
import com.animeblack.core.model.Post
import com.animeblack.core.model.Reel
import com.animeblack.core.model.User
import com.animeblack.core.navigation.FollowListRoute
import com.animeblack.core.navigation.ProfileRoute
import com.animeblack.core.ui.messageRes
import dagger.hilt.android.lifecycle.HiltViewModel
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
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.flow.filterNotNull
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.flatMapLatest
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.mapLatest
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

// ============================================================================ Profile

data class ProfileUiState(
    val loading: Boolean = true,
    val notFound: Boolean = false,
    val user: User? = null,
    val myUid: String = "",
    val isFollowing: Boolean = false,
    val followsMe: Boolean = false,
    val blocked: Boolean = false,
    val savedIds: Set<String> = emptySet(),
    val reels: List<Reel> = emptyList(),
) {
    val isMe: Boolean get() = user != null && user.id == myUid

    /** Private accounts only show content to followers (web `privateAccount`). */
    val canSeeContent: Boolean get() = isMe || user?.privacy?.privateAccount != true || isFollowing
}

@HiltViewModel
class ProfileViewModel @Inject constructor(
    savedStateHandle: SavedStateHandle,
    private val users: UserRepository,
    private val postRepository: PostRepository,
    reels: ReelRepository,
    auth: AuthRepository,
) : ViewModel() {
    private val route = savedStateHandle.toRoute<ProfileRoute>()
    private val myUid = auth.currentUid.orEmpty()
    private val _messages = MutableSharedFlow<Int>(extraBufferCapacity = 3)
    val messages: SharedFlow<Int> = _messages.asSharedFlow()

    /** Resolved profile uid (by id, by @username, or me). Null = not found. */
    private val uid: StateFlow<String?> = flow {
        val resolved = when {
            !route.userId.isNullOrBlank() -> route.userId
            !route.username.isNullOrBlank() -> {
                val wanted = Validators.normalizeUsername(route.username.orEmpty())
                (users.searchUsers(wanted, 10) as? AppResult.Success)?.data?.firstOrNull { it.username.equals(wanted, ignoreCase = true) }?.id
            }
            else -> myUid
        }
        emit(resolved ?: NOT_FOUND)
    }.stateIn(viewModelScope, SharingStarted.Eagerly, null)

    val posts: Flow<PagingData<Post>> = uid.filterNotNull().distinctUntilChanged()
        .flatMapLatest { id -> if (id == NOT_FOUND) flowOf(PagingData.empty()) else postRepository.userPosts(id) }
        .cachedIn(viewModelScope)

    private val profileUser: Flow<Pair<Boolean, User?>> = uid.flatMapLatest { id ->
        when (id) {
            null -> flowOf(false to null)
            NOT_FOUND -> flowOf(true to null)
            else -> users.observeUser(id).map { true to it }
        }
    }

    val state: StateFlow<ProfileUiState> = combine(
        profileUser,
        users.observeMe(),
        users.observeUserState(),
        postRepository.observeSavedIds(),
        reels.observeReels(),
    ) { (resolved, user), me, userState, saved, allReels ->
        ProfileUiState(
            loading = !resolved,
            notFound = resolved && user == null,
            user = user,
            myUid = me?.id ?: myUid,
            isFollowing = user != null && (user.id in userState.following || me?.followingList?.contains(user.id) == true),
            followsMe = user != null && me != null && me.id in user.followingList,
            blocked = user != null && user.id in userState.blocked,
            savedIds = saved,
            reels = if (user == null) emptyList() else allReels.filter { it.authorId == user.id },
        )
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), ProfileUiState())

    private fun emit(result: AppResult<*>) {
        if (result is AppResult.Failure) _messages.tryEmit(result.error.messageRes())
    }

    fun toggleFollow() {
        val s = state.value
        val user = s.user ?: return
        viewModelScope.launch { emit(if (s.isFollowing) users.unfollow(user.id) else users.follow(user.id)) }
    }

    fun toggleBlock() {
        val s = state.value
        val user = s.user ?: return
        viewModelScope.launch { emit(if (s.blocked) users.unblock(user.id) else users.block(user.id)) }
    }

    fun like(post: Post) = viewModelScope.launch { emit(postRepository.toggleLike(post)) }
    fun react(post: Post, key: String) = viewModelScope.launch { emit(postRepository.react(post, key)) }
    fun save(post: Post, saved: Boolean) = viewModelScope.launch { emit(postRepository.setSaved(post.id, saved)) }
    fun share(post: Post) = viewModelScope.launch { postRepository.share(post.id) }
    fun vote(post: Post, optionId: String) = viewModelScope.launch { emit(postRepository.votePoll(post.id, optionId)) }
    fun delete(post: Post) = viewModelScope.launch { emit(postRepository.deletePost(post.id)) }

    private companion object {
        const val NOT_FOUND = "\u0000"
    }
}

// ============================================================================ Edit profile

enum class UsernameCheck { Idle, Checking, Available, Taken, Invalid }

data class EditProfileUiState(
    val loaded: Boolean = false,
    val original: User? = null,
    val name: String = "",
    val username: String = "",
    val bio: String = "",
    val location: String = "",
    val website: String = "",
    val favAnime: String = "",
    val favStudio: String = "",
    val avatarUri: String? = null,
    val coverUri: String? = null,
    val usernameCheck: UsernameCheck = UsernameCheck.Idle,
    val saving: Boolean = false,
)

@HiltViewModel
class EditProfileViewModel @Inject constructor(
    private val users: UserRepository,
) : ViewModel() {
    private val _state = MutableStateFlow(EditProfileUiState())
    val state: StateFlow<EditProfileUiState> = _state.asStateFlow()
    private val _messages = MutableSharedFlow<Int>(extraBufferCapacity = 2)
    val messages: SharedFlow<Int> = _messages.asSharedFlow()
    private val _saved = MutableSharedFlow<Unit>(extraBufferCapacity = 1)
    val saved: SharedFlow<Unit> = _saved.asSharedFlow()
    private val usernameInput = MutableStateFlow("")

    init {
        viewModelScope.launch {
            val me = users.observeMe().filterNotNull().first()
            _state.update {
                it.copy(
                    loaded = true, original = me, name = me.name, username = me.username, bio = me.bio,
                    location = me.location, website = me.website, favAnime = me.favAnimeName, favStudio = me.favStudio,
                )
            }
        }
        viewModelScope.launch {
            usernameInput.debounce(450).mapLatest { raw ->
                val original = _state.value.original?.username.orEmpty()
                val normalized = Validators.normalizeUsername(raw)
                when {
                    raw.isBlank() || normalized.equals(original, ignoreCase = true) -> UsernameCheck.Idle
                    !Validators.isValidUsername(normalized) -> UsernameCheck.Invalid
                    else -> when (val r = users.isUsernameAvailable(normalized)) {
                        is AppResult.Success -> if (r.data) UsernameCheck.Available else UsernameCheck.Taken
                        is AppResult.Failure -> UsernameCheck.Idle
                    }
                }
            }.collect { check -> _state.update { it.copy(usernameCheck = check) } }
        }
    }

    fun update(transform: (EditProfileUiState) -> EditProfileUiState) = _state.update(transform)

    fun onUsername(value: String) {
        val cleaned = value.take(24)
        _state.update { it.copy(username = cleaned, usernameCheck = if (cleaned.isBlank()) UsernameCheck.Idle else UsernameCheck.Checking) }
        usernameInput.value = cleaned
    }

    fun save() {
        val s = _state.value
        val o = s.original ?: return
        if (s.saving || s.usernameCheck == UsernameCheck.Taken || s.usernameCheck == UsernameCheck.Invalid) return
        _state.update { it.copy(saving = true) }
        viewModelScope.launch {
            val update = ProfileUpdate(
                name = s.name.trim().takeIf { it != o.name && it.isNotBlank() },
                username = Validators.normalizeUsername(s.username).takeIf { it.isNotBlank() && !it.equals(o.username, ignoreCase = true) },
                bio = s.bio.takeIf { it != o.bio },
                location = s.location.takeIf { it != o.location },
                website = s.website.takeIf { it != o.website },
                favAnimeName = s.favAnime.takeIf { it != o.favAnimeName },
                favStudio = s.favStudio.takeIf { it != o.favStudio },
                avatarUri = s.avatarUri,
                coverUri = s.coverUri,
            )
            val r = users.updateProfile(update)
            _state.update { it.copy(saving = false) }
            when (r) {
                is AppResult.Success -> {
                    _messages.tryEmit(if (s.avatarUri != null || s.coverUri != null) R.string.profile_media_uploading else R.string.profile_saved)
                    _saved.tryEmit(Unit)
                }
                is AppResult.Failure -> _messages.tryEmit(r.error.messageRes())
            }
        }
    }
}

// ============================================================================ Followers / following

data class FollowListUiState(
    val loading: Boolean = true,
    val followers: Boolean = true,
    val users: List<User> = emptyList(),
    val myUid: String = "",
    val myFollowing: Set<String> = emptySet(),
)

@HiltViewModel
class FollowListViewModel @Inject constructor(
    savedStateHandle: SavedStateHandle,
    private val users: UserRepository,
    auth: AuthRepository,
) : ViewModel() {
    private val route = savedStateHandle.toRoute<FollowListRoute>()
    private val myUid = auth.currentUid.orEmpty()
    private val _messages = MutableSharedFlow<Int>(extraBufferCapacity = 2)
    val messages: SharedFlow<Int> = _messages.asSharedFlow()

    val state: StateFlow<FollowListUiState> = combine(
        users.observeFollowList(route.userId, route.followers),
        users.observeUserState(),
    ) { list, userState ->
        FollowListUiState(false, route.followers, list, myUid, userState.following.toSet())
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), FollowListUiState(followers = route.followers))

    fun toggleFollow(user: User) = viewModelScope.launch {
        val following = user.id in state.value.myFollowing
        val r = if (following) users.unfollow(user.id) else users.follow(user.id)
        if (r is AppResult.Failure) _messages.tryEmit(r.error.messageRes())
    }
}

// ============================================================================ Profile card (QR)

@HiltViewModel
class QrCardViewModel @Inject constructor(users: UserRepository) : ViewModel() {
    val me: StateFlow<User?> = users.observeMe().stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), null)
}
