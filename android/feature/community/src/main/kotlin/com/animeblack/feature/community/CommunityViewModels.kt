package com.animeblack.feature.community

import androidx.annotation.StringRes
import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import androidx.navigation.toRoute
import com.animeblack.core.common.result.AppResult
import com.animeblack.core.data.push.ActiveScreenTracker
import com.animeblack.core.data.repository.CommunityDraft
import com.animeblack.core.data.repository.CommunityRepository
import com.animeblack.core.data.repository.GroupDraft
import com.animeblack.core.data.repository.UserRepository
import com.animeblack.core.data.repository.WorldDraft
import com.animeblack.core.model.ChatMessage
import com.animeblack.core.model.Community
import com.animeblack.core.model.Group
import com.animeblack.core.model.LocalMedia
import com.animeblack.core.model.MessageQuote
import com.animeblack.core.model.RoomRef
import com.animeblack.core.model.User
import com.animeblack.core.model.World
import com.animeblack.core.navigation.CommunityDetailRoute
import com.animeblack.core.navigation.GroupInfoRoute
import com.animeblack.core.ui.chat.ChatListItem
import com.animeblack.core.ui.chat.VoiceClip
import com.animeblack.core.ui.chat.buildChatItems
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
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.flatMapLatest
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.mapLatest
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

// ============================================================================ Hub

enum class SpaceTab { Groups, Worlds, Communities }

data class CommunityHubUiState(
    val loading: Boolean = true,
    val myUid: String = "",
    val groups: List<Group> = emptyList(),
    val worlds: List<World> = emptyList(),
    val communities: List<Community> = emptyList(),
)

@HiltViewModel
class CommunityHubViewModel @Inject constructor(
    private val repository: CommunityRepository,
    users: UserRepository,
) : ViewModel() {
    private val _messages = MutableSharedFlow<Int>(extraBufferCapacity = 2)
    val messages: SharedFlow<Int> = _messages.asSharedFlow()
    val query = MutableStateFlow("")
    val tab = MutableStateFlow(SpaceTab.Groups)

    val state: StateFlow<CommunityHubUiState> = combine(
        users.observeMe(),
        repository.observeGroups(),
        repository.observeWorlds(),
        repository.observeCommunities(),
        query.debounce(150),
    ) { me, groups, worlds, communities, q ->
        val needle = q.trim()
        fun matches(vararg fields: String) = needle.isEmpty() || fields.any { it.contains(needle, ignoreCase = true) }
        CommunityHubUiState(
            loading = false,
            myUid = me?.id.orEmpty(),
            groups = groups.filter { matches(it.name, it.description) },
            worlds = worlds.filter { matches(it.name, it.description, it.theme) },
            communities = communities.filter { matches(it.name, it.description, it.tag, it.focus) },
        )
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), CommunityHubUiState())

    fun joinGroup(group: Group, onJoined: () -> Unit) = viewModelScope.launch {
        when (val r = repository.joinGroup(group)) {
            is AppResult.Success -> onJoined()
            is AppResult.Failure -> _messages.tryEmit(r.error.messageRes())
        }
    }

    fun joinWorld(world: World, onJoined: () -> Unit) = viewModelScope.launch {
        when (val r = repository.joinWorld(world)) {
            is AppResult.Success -> onJoined()
            is AppResult.Failure -> _messages.tryEmit(r.error.messageRes())
        }
    }

    fun joinCommunity(community: Community, onJoined: () -> Unit) = viewModelScope.launch {
        when (val r = repository.joinCommunity(community)) {
            is AppResult.Success -> onJoined()
            is AppResult.Failure -> _messages.tryEmit(r.error.messageRes())
        }
    }
}

// ============================================================================ Room (group / world / channel)

/** Header and permissions for the room currently open. */
data class RoomHeader(
    val title: String = "",
    val subtitle: String = "",
    val icon: String = "",
    val color1: String = "#0E7490",
    val color2: String = "#00A3FF",
    val memberCount: Int = 0,
    val isMember: Boolean = false,
    val isAdmin: Boolean = false,
    val isPrivate: Boolean = false,
    val announceOnly: Boolean = false,
    val closed: Boolean = false,
    val pinned: String? = null,
    val rules: List<String> = emptyList(),
)

data class RoomUiState(
    val loading: Boolean = true,
    val notFound: Boolean = false,
    val myUid: String = "",
    val header: RoomHeader = RoomHeader(),
    val items: List<ChatListItem> = emptyList(),
    val messageCount: Int = 0,
    val canLoadMore: Boolean = false,
) {
    val canSend: Boolean get() = header.isMember && !header.closed && (!header.announceOnly || header.isAdmin)
}

data class RoomComposerState(
    val text: String = "",
    val attachments: List<LocalMedia> = emptyList(),
    val replyTo: MessageQuote? = null,
    val sending: Boolean = false,
)

@HiltViewModel
class RoomViewModel @Inject constructor(
    savedStateHandle: SavedStateHandle,
    private val repository: CommunityRepository,
    users: UserRepository,
    private val tracker: ActiveScreenTracker,
) : ViewModel() {
    /** Type-safe routes store their properties by name, which identifies the room kind. */
    val room: RoomRef = when {
        savedStateHandle.contains("groupId") -> RoomRef.GroupRoom(checkNotNull(savedStateHandle.get<String>("groupId")))
        savedStateHandle.contains("worldId") -> RoomRef.WorldRoom(checkNotNull(savedStateHandle.get<String>("worldId")))
        else -> RoomRef.ChannelRoom(
            checkNotNull(savedStateHandle.get<String>("communityId")),
            checkNotNull(savedStateHandle.get<String>("channelId")),
        )
    }

    private val limit = MutableStateFlow(PAGE)
    private val _composer = MutableStateFlow(RoomComposerState())
    val composer: StateFlow<RoomComposerState> = _composer.asStateFlow()
    private val _messages = MutableSharedFlow<Int>(extraBufferCapacity = 2)
    val messages: SharedFlow<Int> = _messages.asSharedFlow()

    private val header: Flow<RoomHeader?> = users.observeMe().map { it?.id.orEmpty() }.distinctUntilChanged().flatMapLatest { uid ->
        when (val r = room) {
            is RoomRef.GroupRoom -> repository.observeGroup(r.id).map { g ->
                g?.let {
                    RoomHeader(
                        title = it.name, subtitle = it.description, icon = it.icon, color1 = it.color1, color2 = it.color2,
                        memberCount = it.memberCount, isMember = it.isMember(uid), isAdmin = it.isAdmin(uid),
                        isPrivate = it.isPrivate, announceOnly = it.announceOnly, pinned = it.pinnedText,
                    )
                }
            }
            is RoomRef.WorldRoom -> repository.observeWorld(r.id).map { w ->
                w?.let {
                    RoomHeader(
                        title = it.name, subtitle = it.theme.ifBlank { it.description }, icon = it.icon, color1 = it.color1, color2 = it.color2,
                        memberCount = maxOf(it.membersCount, it.memberUids.size), isMember = it.isMember(uid), isAdmin = it.ownerId == uid,
                        closed = it.closed, pinned = it.pinnedText, rules = it.rules,
                    )
                }
            }
            is RoomRef.ChannelRoom -> repository.observeCommunity(r.communityId).map { c ->
                c?.let {
                    val channel = it.channels.firstOrNull { ch -> ch.id == r.channelId }
                    RoomHeader(
                        title = channel?.name ?: it.name, subtitle = it.name, icon = it.icon, color1 = it.color1, color2 = it.color2,
                        memberCount = maxOf(it.membersCount, it.memberUids.size), isMember = it.isMember(uid), isAdmin = it.isAdmin(uid),
                    )
                }
            }
        }
    }

    private val roomMessages: Flow<List<ChatMessage>> = limit.flatMapLatest { repository.observeRoomMessages(room, it) }

    val state: StateFlow<RoomUiState> = combine(users.observeMe(), header, roomMessages, limit) { me, h, msgs, lim ->
        val uid = me?.id.orEmpty()
        RoomUiState(
            loading = false,
            notFound = h == null,
            myUid = uid,
            header = h ?: RoomHeader(),
            items = buildChatItems(msgs.filter { it.isVisibleTo(uid) }),
            messageCount = msgs.size,
            canLoadMore = msgs.size >= lim && lim < MAX_LIMIT,
        )
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), RoomUiState())

    fun loadMore() {
        val s = state.value
        if (s.canLoadMore) limit.update { (it + PAGE).coerceAtMost(MAX_LIMIT) }
    }

    fun onText(text: String) = _composer.update { it.copy(text = text) }
    fun addAttachments(media: List<LocalMedia>) = _composer.update { it.copy(attachments = (it.attachments + media).distinctBy { m -> m.uri }.take(5)) }
    fun removeAttachment(media: LocalMedia) = _composer.update { it.copy(attachments = it.attachments - media) }
    fun reply(message: ChatMessage) = _composer.update {
        it.copy(replyTo = MessageQuote(message.id, message.previewText().take(120), message.senderName, message.type))
    }
    fun cancelReply() = _composer.update { it.copy(replyTo = null) }

    fun send() {
        val c = _composer.value
        if (c.sending || (c.text.isBlank() && c.attachments.isEmpty())) return
        _composer.update { it.copy(sending = true) }
        viewModelScope.launch {
            val r = repository.sendRoomMessage(room, c.text, c.attachments, c.replyTo)
            when (r) {
                is AppResult.Success -> _composer.value = RoomComposerState()
                is AppResult.Failure -> {
                    _composer.update { it.copy(sending = false) }
                    _messages.tryEmit(r.error.messageRes())
                }
            }
        }
    }

    fun sendVoice(clip: VoiceClip) = viewModelScope.launch {
        val media = LocalMedia(uri = clip.uri, type = "voice", mimeType = clip.mimeType, name = "voice.m4a", sizeBytes = clip.sizeBytes, durationMs = clip.durationMs)
        val r = repository.sendRoomMessage(room, "", listOf(media), null)
        if (r is AppResult.Failure) _messages.tryEmit(r.error.messageRes())
    }

    fun delete(message: ChatMessage) = viewModelScope.launch {
        val r = repository.deleteRoomMessage(room, message.id)
        if (r is AppResult.Failure) _messages.tryEmit(r.error.messageRes())
    }

    fun join() = viewModelScope.launch {
        val r = when (val ref = room) {
            is RoomRef.GroupRoom -> repository.observeGroupOnce(ref.id)?.let { repository.joinGroup(it) }
            is RoomRef.WorldRoom -> repository.observeWorldOnce(ref.id)?.let { repository.joinWorld(it) }
            is RoomRef.ChannelRoom -> repository.observeCommunityOnce(ref.communityId)?.let { repository.joinCommunity(it) }
        }
        if (r is AppResult.Failure) _messages.tryEmit(r.error.messageRes())
    }

    fun leave(onLeft: () -> Unit) = viewModelScope.launch {
        val r = when (val ref = room) {
            is RoomRef.GroupRoom -> repository.observeGroupOnce(ref.id)?.let { repository.leaveGroup(it) }
            is RoomRef.WorldRoom -> repository.observeWorldOnce(ref.id)?.let { repository.leaveWorld(it) }
            is RoomRef.ChannelRoom -> repository.observeCommunityOnce(ref.communityId)?.let { repository.leaveCommunity(it) }
        }
        when (r) {
            is AppResult.Failure -> _messages.tryEmit(r.error.messageRes())
            else -> onLeft()
        }
    }

    /** Key matched against FCM tags (`group:<id>`) to avoid notifying for the room on screen. */
    private val trackerKey: String = when (val r = room) {
        is RoomRef.ChannelRoom -> r.communityId
        else -> r.id
    }

    fun setActive(active: Boolean) {
        if (active) {
            tracker.activeConversationKey = trackerKey
        } else if (tracker.activeConversationKey == trackerKey) {
            tracker.activeConversationKey = null
        }
    }

    override fun onCleared() {
        setActive(false)
        super.onCleared()
    }

    /** Destination of the header's info action. */
    fun infoRoute(): Any? = when (val r = room) {
        is RoomRef.GroupRoom -> GroupInfoRoute(r.id)
        is RoomRef.ChannelRoom -> CommunityDetailRoute(r.communityId)
        is RoomRef.WorldRoom -> null
    }

    private companion object {
        const val PAGE = 50L
        const val MAX_LIMIT = 500L
    }
}

private suspend fun CommunityRepository.observeGroupOnce(id: String): Group? = observeGroup(id).first()
private suspend fun CommunityRepository.observeWorldOnce(id: String): World? = observeWorld(id).first()
private suspend fun CommunityRepository.observeCommunityOnce(id: String): Community? = observeCommunity(id).first()

// ============================================================================ Group info

data class GroupInfoUiState(
    val loading: Boolean = true,
    val group: Group? = null,
    val members: List<User> = emptyList(),
    val myUid: String = "",
    val searchResults: List<User> = emptyList(),
) {
    val isAdmin: Boolean get() = group?.isAdmin(myUid) == true
    val isOwner: Boolean get() = group?.ownerId == myUid
}

@HiltViewModel
class GroupInfoViewModel @Inject constructor(
    savedStateHandle: SavedStateHandle,
    private val repository: CommunityRepository,
    private val users: UserRepository,
) : ViewModel() {
    private val groupId = savedStateHandle.toRoute<GroupInfoRoute>().groupId
    private val _messages = MutableSharedFlow<Int>(extraBufferCapacity = 2)
    val messages: SharedFlow<Int> = _messages.asSharedFlow()
    val memberQuery = MutableStateFlow("")

    private val groupFlow = repository.observeGroup(groupId)
    private val membersFlow: Flow<List<User>> = groupFlow.map { g -> (g?.memberUids.orEmpty() + g?.members.orEmpty()).distinct() }
        .distinctUntilChanged()
        .flatMapLatest { ids -> if (ids.isEmpty()) flowOf(emptyMap()) else users.observeUsers(ids.take(200)) }
        .map { map -> map.values.sortedBy { it.displayName.lowercase() } }
    private val searchFlow: Flow<List<User>> = memberQuery.debounce(300).mapLatest { q ->
        if (q.trim().length < 2) emptyList() else (users.searchUsers(q.trim(), 15) as? AppResult.Success)?.data.orEmpty()
    }

    val state: StateFlow<GroupInfoUiState> = combine(groupFlow, membersFlow, users.observeMe(), searchFlow) { g, members, me, results ->
        GroupInfoUiState(false, g, members, me?.id.orEmpty(), results.filter { u -> g == null || !g.isMember(u.id) })
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), GroupInfoUiState())

    private fun perform(@StringRes success: Int?, block: suspend (Group) -> AppResult<Unit>, after: () -> Unit = {}) {
        val group = state.value.group ?: return
        viewModelScope.launch {
            when (val r = block(group)) {
                is AppResult.Success -> {
                    success?.let { _messages.tryEmit(it) }
                    after()
                }
                is AppResult.Failure -> _messages.tryEmit(r.error.messageRes())
            }
        }
    }

    fun addMember(user: User) = perform(R.string.community_added, { repository.addGroupMember(it, user.id) }) { memberQuery.value = "" }
    fun removeMember(user: User) = perform(R.string.community_removed, { repository.removeGroupMember(it, user.id) })
    fun update(name: String, description: String, announceOnly: Boolean) =
        perform(R.string.community_saved, { repository.updateGroup(it, name.trim(), description.trim(), announceOnly) })
    fun leave(onDone: () -> Unit) = perform(null, { repository.leaveGroup(it) }, onDone)
    fun delete(onDone: () -> Unit) = perform(null, { repository.deleteGroup(it) }, onDone)
}

// ============================================================================ Community detail

data class CommunityDetailUiState(
    val loading: Boolean = true,
    val community: Community? = null,
    val myUid: String = "",
) {
    val isMember: Boolean get() = community?.isMember(myUid) == true
}

@HiltViewModel
class CommunityDetailViewModel @Inject constructor(
    savedStateHandle: SavedStateHandle,
    private val repository: CommunityRepository,
    users: UserRepository,
) : ViewModel() {
    private val id = savedStateHandle.toRoute<CommunityDetailRoute>().communityId
    private val _messages = MutableSharedFlow<Int>(extraBufferCapacity = 2)
    val messages: SharedFlow<Int> = _messages.asSharedFlow()

    val state: StateFlow<CommunityDetailUiState> = combine(repository.observeCommunity(id), users.observeMe()) { c, me ->
        CommunityDetailUiState(false, c, me?.id.orEmpty())
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), CommunityDetailUiState())

    fun join() {
        val c = state.value.community ?: return
        viewModelScope.launch {
            val r = repository.joinCommunity(c)
            if (r is AppResult.Failure) _messages.tryEmit(r.error.messageRes())
        }
    }

    fun leave() {
        val c = state.value.community ?: return
        viewModelScope.launch {
            val r = repository.leaveCommunity(c)
            if (r is AppResult.Failure) _messages.tryEmit(r.error.messageRes())
        }
    }
}

// ============================================================================ Create group / world / guild

enum class SpaceKind { Group, World, Community }

data class CreateSpaceUiState(
    val name: String = "",
    val description: String = "",
    val icon: String = SPACE_ICON_KEYS.first(),
    val preset: Int = 0,
    val isPrivate: Boolean = false,
    val theme: String = "",
    val rules: String = "",
    val tag: String = "",
    val focus: String = "",
    val requiresApproval: Boolean = false,
    val memberQuery: String = "",
    val memberResults: List<User> = emptyList(),
    val selectedMembers: List<User> = emptyList(),
    val saving: Boolean = false,
    val nameError: Boolean = false,
)

@HiltViewModel
class CreateSpaceViewModel @Inject constructor(
    private val repository: CommunityRepository,
    private val users: UserRepository,
) : ViewModel() {
    private val _state = MutableStateFlow(CreateSpaceUiState())
    val state: StateFlow<CreateSpaceUiState> = _state.asStateFlow()
    private val _messages = MutableSharedFlow<Int>(extraBufferCapacity = 2)
    val messages: SharedFlow<Int> = _messages.asSharedFlow()
    private val _created = MutableSharedFlow<String>(extraBufferCapacity = 1)

    /** Emits the id of the created space. */
    val created: SharedFlow<String> = _created.asSharedFlow()
    private val memberQuery = MutableStateFlow("")

    init {
        viewModelScope.launch {
            memberQuery.debounce(300).mapLatest { q ->
                if (q.trim().length < 2) emptyList() else (users.searchUsers(q.trim(), 12) as? AppResult.Success)?.data.orEmpty()
            }.collect { results -> _state.update { it.copy(memberResults = results) } }
        }
    }

    fun update(transform: (CreateSpaceUiState) -> CreateSpaceUiState) = _state.update { transform(it).copy(nameError = false) }
    fun onMemberQuery(q: String) {
        _state.update { it.copy(memberQuery = q) }
        memberQuery.value = q
    }
    fun toggleMember(user: User) = _state.update { s ->
        val selected = if (s.selectedMembers.any { it.id == user.id }) s.selectedMembers.filterNot { it.id == user.id } else (s.selectedMembers + user).take(50)
        s.copy(selectedMembers = selected)
    }

    fun create(kind: SpaceKind) {
        val s = _state.value
        val name = s.name.trim()
        if (name.length !in 3..40) {
            _state.update { it.copy(nameError = true) }
            return
        }
        if (s.saving) return
        _state.update { it.copy(saving = true) }
        val (c1, c2) = SPACE_PRESETS[s.preset]
        viewModelScope.launch {
            val r = when (kind) {
                SpaceKind.Group -> repository.createGroup(GroupDraft(name, s.description.trim(), s.icon, s.isPrivate, s.selectedMembers.map { it.id }))
                SpaceKind.World -> repository.createWorld(
                    WorldDraft(name, s.description.trim(), s.icon, s.theme.trim(), s.rules.lines().map { it.trim() }.filter { it.isNotEmpty() }.take(20), c1, c2),
                )
                SpaceKind.Community -> repository.createCommunity(
                    CommunityDraft(name, s.description.trim(), s.tag.trim().removePrefix("#"), s.focus.trim(), s.requiresApproval, c1, c2),
                )
            }
            _state.update { it.copy(saving = false) }
            when (r) {
                is AppResult.Success -> {
                    _messages.tryEmit(R.string.community_created)
                    _created.tryEmit(r.data)
                }
                is AppResult.Failure -> _messages.tryEmit(r.error.messageRes())
            }
        }
    }
}

/** Gradient presets offered when creating a space (same palette family as the web). */
val SPACE_PRESETS = listOf(
    "#0E7490" to "#00A3FF",
    "#3B0764" to "#A855F7",
    "#7F1D1D" to "#EA580C",
    "#064E3B" to "#10B981",
    "#831843" to "#DB2777",
    "#312E81" to "#818CF8",
    "#78350F" to "#F59E0B",
)
