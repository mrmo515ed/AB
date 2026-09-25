package com.animeblack.feature.reels

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.animeblack.core.common.result.AppResult
import com.animeblack.core.data.repository.ReelRepository
import com.animeblack.core.data.repository.UserRepository
import com.animeblack.core.model.LocalMedia
import com.animeblack.core.model.Reel
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
import kotlinx.coroutines.flow.flatMapLatest
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class ReelsUiState(
    val loading: Boolean = true,
    val myUid: String = "",
    val isModerator: Boolean = false,
    val reels: List<Reel> = emptyList(),
    /** Page to open first (deep link / profile grid). */
    val initialPage: Int = 0,
    val notFound: Boolean = false,
)

@HiltViewModel
class ReelsViewModel @Inject constructor(
    savedStateHandle: SavedStateHandle,
    private val repository: ReelRepository,
    users: UserRepository,
) : ViewModel() {
    /** Present only for `ReelViewerRoute(reelId)`. */
    private val targetId: String? = savedStateHandle.get<String>("reelId")
    private val _messages = MutableSharedFlow<Int>(extraBufferCapacity = 2)
    val messages: SharedFlow<Int> = _messages.asSharedFlow()

    /** Reel whose comments sheet is open. */
    val commentsFor = MutableStateFlow<String?>(null)

    private val single: Flow<Reel?> = if (targetId == null) flowOf(null) else repository.observeReel(targetId)

    val state: StateFlow<ReelsUiState> = combine(repository.observeReels(), single, users.observeMe()) { list, target, me ->
        val merged = if (target != null && list.none { it.id == target.id }) listOf(target) + list else list
        ReelsUiState(
            loading = false,
            myUid = me?.id.orEmpty(),
            isModerator = me?.isModerator == true,
            reels = merged,
            initialPage = targetId?.let { id -> merged.indexOfFirst { it.id == id }.coerceAtLeast(0) } ?: 0,
            notFound = targetId != null && target == null && merged.none { it.id == targetId },
        )
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), ReelsUiState())

    val comments: StateFlow<Reel?> = commentsFor.flatMapLatest { id -> if (id == null) flowOf(null) else repository.observeReel(id) }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), null)

    fun onVisible(reel: Reel) = viewModelScope.launch { repository.recordView(reel.id) }

    fun toggleLike(reel: Reel) = viewModelScope.launch {
        val r = repository.toggleLike(reel)
        if (r is AppResult.Failure) _messages.tryEmit(r.error.messageRes())
    }

    fun share(reel: Reel) = viewModelScope.launch { repository.share(reel.id) }

    fun delete(reel: Reel) = viewModelScope.launch {
        when (val r = repository.delete(reel.id)) {
            is AppResult.Success -> _messages.tryEmit(R.string.reels_deleted)
            is AppResult.Failure -> _messages.tryEmit(r.error.messageRes())
        }
    }

    fun comment(reelId: String, text: String, onSent: () -> Unit) = viewModelScope.launch {
        when (val r = repository.addComment(reelId, text)) {
            is AppResult.Success -> onSent()
            is AppResult.Failure -> _messages.tryEmit(r.error.messageRes())
        }
    }
}

data class CreateReelUiState(
    val video: LocalMedia? = null,
    val caption: String = "",
    val music: String = "",
    val publishing: Boolean = false,
)

@HiltViewModel
class CreateReelViewModel @Inject constructor(
    private val repository: ReelRepository,
) : ViewModel() {
    private val _state = MutableStateFlow(CreateReelUiState())
    val state: StateFlow<CreateReelUiState> = _state.asStateFlow()
    private val _messages = MutableSharedFlow<Int>(extraBufferCapacity = 2)
    val messages: SharedFlow<Int> = _messages.asSharedFlow()
    private val _done = MutableSharedFlow<Unit>(extraBufferCapacity = 1)
    val done: SharedFlow<Unit> = _done.asSharedFlow()

    fun onVideo(media: LocalMedia?) = _state.update { it.copy(video = media) }
    fun onCaption(v: String) = _state.update { it.copy(caption = v.take(2_000)) }
    fun onMusic(v: String) = _state.update { it.copy(music = v.take(120)) }

    fun publish() {
        val s = _state.value
        val video = s.video
        if (s.publishing) return
        if (video == null) {
            _messages.tryEmit(R.string.reels_video_required)
            return
        }
        _state.update { it.copy(publishing = true) }
        viewModelScope.launch {
            val r = repository.publish(video, s.caption, s.music)
            _state.update { it.copy(publishing = false) }
            when (r) {
                is AppResult.Success -> {
                    _messages.tryEmit(R.string.reels_publishing)
                    _done.tryEmit(Unit)
                }
                is AppResult.Failure -> _messages.tryEmit(r.error.messageRes())
            }
        }
    }
}
