package com.animeblack.feature.chat

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import androidx.navigation.toRoute
import com.animeblack.core.common.result.AppResult
import com.animeblack.core.data.presence.PresenceManager
import com.animeblack.core.data.push.ActiveScreenTracker
import com.animeblack.core.data.repository.AuthRepository
import com.animeblack.core.data.repository.ChatRepository
import com.animeblack.core.data.repository.CommunityRepository
import com.animeblack.core.data.repository.UserRepository
import com.animeblack.core.datastore.SettingsDataSource
import com.animeblack.core.model.ChatMessage
import com.animeblack.core.model.ChatRequest
import com.animeblack.core.model.Conversation
import com.animeblack.core.model.DmPermission
import com.animeblack.core.model.Group
import com.animeblack.core.model.LocalMedia
import com.animeblack.core.model.MessageQuote
import com.animeblack.core.model.MessageStatus
import com.animeblack.core.model.OutgoingMessage
import com.animeblack.core.model.User
import com.animeblack.core.navigation.ChatInfoRoute
import com.animeblack.core.navigation.ChatRoomRoute
import com.animeblack.core.ui.chat.ChatListItem
import com.animeblack.core.ui.chat.VoiceClip
import com.animeblack.core.ui.chat.buildChatItems
import com.animeblack.core.ui.messageRes
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
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
import kotlinx.coroutines.flow.drop
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.flatMapLatest
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.mapLatest
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

/** Emits the wall clock periodically so time-based UI (typing, presence) expires on its own. */
private fun ticker(periodMs: Long): Flow<Long> = flow {
    while (true) {
        emit(System.currentTimeMillis())
        delay(periodMs)
    }
}

// ============================================================================ Chat list

data class ConversationItem(
    val conversation: Conversation,
    val partner: User?,
    val unread: Int,
    val typing: Boolean,
    val online: Boolean,
    val pinned: Boolean,
    val muted: Boolean,
    val draft: String?,
)

data class ChatListUiState(
    val loading: Boolean = true,
    val myUid: String = "",
    val items: List<ConversationItem> = emptyList(),
    val archived: List<ConversationItem> = emptyList(),
    val requestsCount: Int = 0,
)

@HiltViewModel
class ChatListViewModel @Inject constructor(
    private val chats: ChatRepository,
    users: UserRepository,
    community: CommunityRepository,
    private val settings: SettingsDataSource,
    private val auth: AuthRepository,
) : ViewModel() {
    val query = MutableStateFlow("")
    val showArchived = MutableStateFlow(false)
    private val _messages = MutableSharedFlow<Int>(extraBufferCapacity = 2)
    val messages: SharedFlow<Int> = _messages.asSharedFlow()

    /** Groups I belong to — shown in the قروباتي strip above the DM list (web chat page). */
    val myGroups: StateFlow<List<Group>> = combine(community.observeGroups(), users.observeMe()) { groups, me ->
        val uid = me?.id.orEmpty()
        groups.filter { uid.isNotBlank() && (uid in it.memberUids || uid in it.members || uid == it.ownerId) }
            .sortedByDescending { it.lastAt }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), emptyList())

    private val conversations = chats.observeConversations()
    private val partners: Flow<Map<String, User>> = conversations.map { list -> list.map { it.partnerId }.distinct() }
        .distinctUntilChanged()
        .flatMapLatest { ids -> if (ids.isEmpty()) flowOf(emptyMap()) else users.observeUsers(ids) }

    private val rows: Flow<Pair<List<ConversationItem>, List<ConversationItem>>> = combine(
        conversations, partners, settings.settings, settings.chatDrafts, ticker(3_000),
    ) { list, people, s, drafts, now ->
        val me = auth.currentUid.orEmpty()
        val all = list.map { c ->
            val partner = people[c.partnerId]
            ConversationItem(
                conversation = c,
                partner = partner,
                unread = c.unreadFor(me),
                typing = c.isPartnerTyping(now, me),
                online = partner != null && PresenceManager.isOnlineNow(partner.online, partner.lastSeen, now),
                pinned = c.id in s.pinnedChats,
                muted = c.id in s.mutedChats,
                draft = drafts[c.id]?.takeIf { it.isNotBlank() },
            )
        }.sortedWith(compareByDescending<ConversationItem> { it.pinned }.thenByDescending { it.conversation.lastAt })
        all.filter { it.conversation.id !in s.archivedChats } to all.filter { it.conversation.id in s.archivedChats }
    }

    val state: StateFlow<ChatListUiState> = combine(
        users.observeMe(),
        rows,
        chats.observeIncomingRequests(),
        query.debounce(150),
    ) { me, (active, archived), requests, q ->
        val needle = q.trim()
        fun ConversationItem.matches() = needle.isEmpty() ||
            partner?.displayName?.contains(needle, true) == true ||
            partner?.username?.contains(needle, true) == true ||
            conversation.lastMessage.contains(needle, true)
        ChatListUiState(
            loading = false,
            myUid = me?.id.orEmpty(),
            items = active.filter { it.matches() },
            archived = archived.filter { it.matches() },
            requestsCount = requests.size,
        )
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), ChatListUiState())

    fun togglePin(chatId: String) = viewModelScope.launch {
        settings.update { s -> s.copy(pinnedChats = if (chatId in s.pinnedChats) s.pinnedChats - chatId else s.pinnedChats + chatId) }
    }

    fun toggleMute(chatId: String) = viewModelScope.launch {
        settings.update { s -> s.copy(mutedChats = if (chatId in s.mutedChats) s.mutedChats - chatId else s.mutedChats + chatId) }
    }

    fun toggleArchive(chatId: String) = viewModelScope.launch {
        settings.update { s -> s.copy(archivedChats = if (chatId in s.archivedChats) s.archivedChats - chatId else s.archivedChats + chatId) }
    }

    fun delete(chatId: String) = viewModelScope.launch {
        val r = chats.deleteConversation(chatId)
        if (r is AppResult.Failure) _messages.tryEmit(r.error.messageRes())
    }
}

// ============================================================================ Chat room

data class ChatRoomUiState(
    val loading: Boolean = true,
    val myUid: String = "",
    val chatId: String = "",
    val partnerId: String = "",
    val partner: User? = null,
    val partnerOnline: Boolean = false,
    val partnerTyping: Boolean = false,
    val items: List<ChatListItem> = emptyList(),
    val permission: DmPermission? = null,
    val blockedByMe: Boolean = false,
    val wallpaper: String? = null,
    val canLoadMore: Boolean = false,
    val muted: Boolean = false,
    val hasMessages: Boolean = false,
    val pinnedMsgIds: List<String> = emptyList(),
    val pinnedMessage: ChatMessage? = null,
    val vanishHours: Int = 0,
    val starredIds: Set<String> = emptySet(),
    val selectMode: Boolean = false,
    val selectedIds: Set<String> = emptySet(),
    val totalMessages: Int = 0,
    val myMessagesCount: Int = 0,
    val mediaCount: Int = 0,
) {
    val canSend: Boolean
        get() = !blockedByMe && permission != DmPermission.Closed && permission != DmPermission.Blocked && permission != DmPermission.Self

    /** First message goes out as a chat request (web `canDirectMessage` → request). */
    val sendsRequest: Boolean get() = permission == DmPermission.RequiresRequest && !hasMessages
}

data class ChatComposerState(
    val text: String = "",
    val attachments: List<LocalMedia> = emptyList(),
    val replyTo: MessageQuote? = null,
    val editingId: String? = null,
    val sending: Boolean = false,
)

@HiltViewModel
class ChatRoomViewModel @Inject constructor(
    savedStateHandle: SavedStateHandle,
    private val chats: ChatRepository,
    private val users: UserRepository,
    private val settings: SettingsDataSource,
    private val tracker: ActiveScreenTracker,
    auth: AuthRepository,
) : ViewModel() {
    private val route = savedStateHandle.toRoute<ChatRoomRoute>()
    val myUid: String = auth.currentUid.orEmpty()
    private val partnerIdState = MutableStateFlow(
        route.partnerId ?: route.chatId?.let { Conversation.partnerFromId(it, myUid) }.orEmpty(),
    )
    val chatId: String = route.chatId ?: Conversation.canonicalId(myUid, partnerIdState.value)

    private val limit = MutableStateFlow(PAGE)
    private val _composer = MutableStateFlow(ChatComposerState())
    val composer: StateFlow<ChatComposerState> = _composer.asStateFlow()
    private val _messages = MutableSharedFlow<Int>(extraBufferCapacity = 3)
    val messages: SharedFlow<Int> = _messages.asSharedFlow()
    private val permission = MutableStateFlow<DmPermission?>(null)
    private var typingJob: Job? = null
    private var lastTypingSentAt = 0L
    private var active = false
    private var lastMarkedAt = 0L

    private val conversation = chats.observeConversation(chatId)
    private val partner: Flow<User?> = partnerIdState.flatMapLatest { id -> if (id.isBlank()) flowOf(null) else users.observeUser(id) }
    private val liveMessages: Flow<List<ChatMessage>> = limit.flatMapLatest { chats.observeMessages(chatId, it) }
    private val allMessages: Flow<List<ChatMessage>> = combine(liveMessages, chats.observePendingMedia(chatId)) { live, pending ->
        val ids = live.mapTo(HashSet()) { it.id }
        (live + pending.filter { it.id !in ids }).sortedBy { it.at }
    }
    private val starred = settings.starredIn(chatId)
    private val _selectMode = MutableStateFlow(false)
    private val _selected = MutableStateFlow<Set<String>>(emptySet())

    /** Candidate targets for forwarding a message (web `fwdSheet`). */
    private val forwardConversations = chats.observeConversations()
    val forwardTargets: StateFlow<List<ConversationItem>> = combine(
        forwardConversations,
        forwardConversations.map { list -> list.map { it.partnerId }.distinct() }
            .distinctUntilChanged()
            .flatMapLatest { ids -> if (ids.isEmpty()) flowOf(emptyMap()) else users.observeUsers(ids) },
    ) { convs, people ->
        convs.filter { it.partnerId.isNotBlank() && it.partnerId != myUid }.map { c ->
            ConversationItem(c, people[c.partnerId], 0, false, false, false, false, null)
        }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), emptyList())

    val state: StateFlow<ChatRoomUiState> = combine(
        combine(conversation, partner, partnerIdState) { c, p, pid -> Triple(c, p, pid) },
        allMessages,
        combine(users.observeUserState(), settings.settings, permission) { us, s, perm -> Triple(us, s, perm) },
        combine(limit, starred) { lim, stars -> lim to stars },
        combine(ticker(4_000), _selected, _selectMode) { now, sel, selMode -> Triple(now, sel, selMode) },
    ) { (conv, p, pid), msgs, (userState, s, perm), (lim, starredIds), (now, selectedIds, selMode) ->
        val partnerRead = conv?.readBy?.get(pid) ?: 0L
        val pinnedIds = conv?.pinnedMsgs.orEmpty().toSet()
        // Disappearing messages (web `vanish`): hide anything older than the window, except pins.
        val vanishHours = conv?.vanishHours ?: 0
        val vanishCut = if (vanishHours > 0) now - vanishHours * 3_600_000L else 0L
        val adjusted = msgs
            .filter { m -> vanishCut == 0L || m.isPending || m.id in pinnedIds || m.at >= vanishCut || m.at <= 0L }
            .map { m ->
                if (m.isMine(myUid) && !m.isPending && m.status.code < MessageStatus.Read.code && partnerRead >= m.at && m.at > 0) {
                    m.copy(status = MessageStatus.Read)
                } else {
                    m
                }
            }
        val pinnedMessage = conv?.lastPinnedMsgId?.let { id -> adjusted.lastOrNull { it.id == id } }
        ChatRoomUiState(
            loading = false,
            myUid = myUid,
            chatId = chatId,
            partnerId = pid,
            partner = p,
            partnerOnline = p != null && PresenceManager.isOnlineNow(p.online, p.lastSeen, now),
            partnerTyping = conv?.isPartnerTyping(now, myUid) == true,
            items = buildChatItems(adjusted),
            permission = perm,
            blockedByMe = pid in userState.blocked,
            wallpaper = conv?.wallpaper,
            canLoadMore = msgs.size >= lim && lim < MAX_LIMIT,
            muted = chatId in s.mutedChats,
            hasMessages = msgs.isNotEmpty() || !conv?.lastMessage.isNullOrBlank(),
            pinnedMsgIds = conv?.pinnedMsgs.orEmpty(),
            pinnedMessage = pinnedMessage,
            vanishHours = vanishHours,
            starredIds = starredIds,
            selectMode = selMode,
            selectedIds = selectedIds,
            totalMessages = adjusted.size,
            myMessagesCount = adjusted.count { it.isMine(myUid) && !it.isPending },
            mediaCount = adjusted.count { !it.isDeleted && it.attachments.isNotEmpty() },
        )
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), ChatRoomUiState())

    init {
        viewModelScope.launch {
            // Legacy conversation ids: resolve the partner from the participants list.
            if (partnerIdState.value.isBlank()) {
                conversation.first { it != null }?.partnerId?.let { partnerIdState.value = it }
            }
            val pid = partnerIdState.value
            permission.value = if (pid.isBlank()) DmPermission.Allowed else chats.dmPermission(pid)
        }
        viewModelScope.launch {
            val draft = settings.chatDrafts.first()[chatId].orEmpty()
            if (draft.isNotBlank() && _composer.value.text.isBlank()) _composer.update { it.copy(text = draft) }
            _composer.map { it.text to it.editingId }.distinctUntilChanged().drop(1).debounce(600).collect { (text, editing) ->
                if (editing == null) settings.setChatDraft(chatId, text)
            }
        }
    }

    fun setActive(isActive: Boolean) {
        active = isActive
        if (isActive) {
            tracker.activeConversationKey = chatId
            markRead()
        } else {
            if (tracker.activeConversationKey == chatId) tracker.activeConversationKey = null
            stopTyping()
        }
    }

    /** Called by the screen while it is resumed and whenever new messages arrive. */
    fun markRead() {
        if (!active) return
        val msgs = state.value.items.mapNotNull { (it as? ChatListItem.Message)?.message }
        val newestIncoming = msgs.filter { !it.isMine(myUid) && !it.isPending }.maxOfOrNull { it.at } ?: 0L
        // Avoid redundant writes: only when something newer than the last receipt arrived.
        if (newestIncoming <= lastMarkedAt && lastMarkedAt != 0L) return
        lastMarkedAt = maxOf(newestIncoming, 1L)
        viewModelScope.launch { chats.markRead(chatId, msgs) }
    }

    fun loadMore() {
        if (state.value.canLoadMore) limit.update { (it + PAGE).coerceAtMost(MAX_LIMIT) }
    }

    fun onText(text: String) {
        _composer.update { it.copy(text = text) }
        if (text.isBlank()) {
            stopTyping()
            return
        }
        val now = System.currentTimeMillis()
        if (now - lastTypingSentAt > TYPING_REFRESH_MS && !state.value.sendsRequest) {
            lastTypingSentAt = now
            viewModelScope.launch { chats.setTyping(chatId, true) }
        }
        typingJob?.cancel()
        typingJob = viewModelScope.launch {
            delay(TYPING_IDLE_MS)
            stopTyping()
        }
    }

    private fun stopTyping() {
        typingJob?.cancel()
        if (lastTypingSentAt != 0L) {
            lastTypingSentAt = 0L
            viewModelScope.launch { chats.setTyping(chatId, false) }
        }
    }

    fun addAttachments(media: List<LocalMedia>) =
        _composer.update { it.copy(attachments = (it.attachments + media).distinctBy { m -> m.uri }.take(5)) }

    fun removeAttachment(media: LocalMedia) = _composer.update { it.copy(attachments = it.attachments - media) }

    fun reply(message: ChatMessage) = _composer.update {
        it.copy(replyTo = MessageQuote(message.id, message.previewText().take(120), senderNameOf(message), message.type), editingId = null)
    }

    fun cancelReply() = _composer.update { it.copy(replyTo = null) }

    fun startEdit(message: ChatMessage) = _composer.update { it.copy(editingId = message.id, text = message.text, replyTo = null, attachments = emptyList()) }

    fun cancelEdit() = _composer.update { it.copy(editingId = null, text = "") }

    private fun senderNameOf(message: ChatMessage): String =
        if (message.isMine(myUid)) "" else message.senderName.ifBlank { state.value.partner?.displayName.orEmpty() }

    fun send() {
        val c = _composer.value
        val s = state.value
        if (c.sending || (c.text.isBlank() && c.attachments.isEmpty())) return
        val pid = s.partnerId
        if (pid.isBlank()) return
        when {
            s.blockedByMe || s.permission == DmPermission.Blocked -> {
                _messages.tryEmit(R.string.chat_blocked)
                return
            }
            s.permission == DmPermission.Closed -> {
                _messages.tryEmit(R.string.chat_closed)
                return
            }
            s.permission == DmPermission.Self -> {
                _messages.tryEmit(R.string.chat_self)
                return
            }
        }
        _composer.update { it.copy(sending = true) }
        stopTyping()
        viewModelScope.launch {
            val result = if (s.sendsRequest && c.editingId == null) {
                chats.sendRequest(pid, c.text).also { if (it is AppResult.Success) _messages.tryEmit(R.string.chat_request_sent) }
            } else {
                // Clear the composer right away; the write is durable (Firestore cache / outbox).
                _composer.value = ChatComposerState()
                chats.send(chatId, pid, OutgoingMessage(text = c.text, attachments = c.attachments, replyTo = c.replyTo, editMessageId = c.editingId))
            }
            when (result) {
                is AppResult.Success -> {
                    _composer.value = ChatComposerState()
                    settings.setChatDraft(chatId, "")
                }
                is AppResult.Failure -> {
                    // Restore what the user typed so nothing is lost.
                    _composer.value = c.copy(sending = false)
                    _messages.tryEmit(result.error.messageRes())
                }
            }
        }
    }

    fun sendVoice(clip: VoiceClip) {
        val pid = state.value.partnerId
        if (pid.isBlank() || !state.value.canSend || state.value.sendsRequest) return
        viewModelScope.launch {
            val media = LocalMedia(uri = clip.uri, type = "voice", mimeType = clip.mimeType, name = "voice.m4a", sizeBytes = clip.sizeBytes, durationMs = clip.durationMs)
            val r = chats.send(chatId, pid, OutgoingMessage(text = "", attachments = listOf(media), voiceDurationSec = (clip.durationMs / 1000).toInt().coerceAtLeast(1)))
            if (r is AppResult.Failure) _messages.tryEmit(r.error.messageRes())
        }
    }

    fun sendSticker(dataUrl: String) {
        val s = state.value
        if (s.partnerId.isBlank() || !s.canSend || s.sendsRequest) return
        viewModelScope.launch {
            val r = chats.send(chatId, s.partnerId, OutgoingMessage(text = "", stickerUrl = dataUrl))
            if (r is AppResult.Failure) _messages.tryEmit(r.error.messageRes())
        }
    }

    fun sendGif(url: String) {
        val s = state.value
        if (s.partnerId.isBlank() || !s.canSend || s.sendsRequest) return
        viewModelScope.launch {
            val r = chats.send(chatId, s.partnerId, OutgoingMessage(text = "", gifUrl = url))
            if (r is AppResult.Failure) _messages.tryEmit(r.error.messageRes())
        }
    }

    fun react(message: ChatMessage, key: String?) = viewModelScope.launch {
        val r = chats.react(chatId, message.id, key)
        if (r is AppResult.Failure) _messages.tryEmit(r.error.messageRes())
    }

    fun toggleReaction(message: ChatMessage, key: String) = react(message, if (message.reactions[myUid] == key) null else key)

    /** Double-tap a bubble: quick love reaction (web shortcut). */
    fun doubleTapReact(message: ChatMessage) = toggleReaction(message, "love")

    // ---------------------------------------------------------------- pin / vanish / star
    fun pinMessage(message: ChatMessage) = viewModelScope.launch {
        val pinned = message.id in state.value.pinnedMsgIds
        val r = chats.pinMessage(chatId, message.id, !pinned)
        if (r is AppResult.Failure) _messages.tryEmit(r.error.messageRes())
        else _messages.tryEmit(if (pinned) R.string.chat_msg_unpinned else R.string.chat_msg_pinned)
    }

    fun unpinMessage(id: String) = viewModelScope.launch { chats.pinMessage(chatId, id, false) }

    /** Disappearing messages: cycles 0 → 24h → 72h → off (web `cycleVanish`). */
    fun cycleVanish() = viewModelScope.launch {
        val next = when (state.value.vanishHours) {
            0 -> 24
            24 -> 72
            else -> 0
        }
        val r = chats.setVanish(chatId, next)
        if (r is AppResult.Failure) _messages.tryEmit(r.error.messageRes())
        else _messages.tryEmit(
            when (next) {
                0 -> R.string.chat_vanish_off
                24 -> R.string.chat_vanish_24
                else -> R.string.chat_vanish_72
            },
        )
    }

    fun toggleStar(message: ChatMessage) = viewModelScope.launch {
        val starred = settings.toggleStar(chatId, message.id)
        _messages.tryEmit(if (starred) R.string.chat_msg_starred else R.string.chat_msg_unstarred)
    }

    // ---------------------------------------------------------------- selection mode
    fun startSelection(initial: ChatMessage? = null) {
        _selectMode.value = true
        _selected.value = if (initial == null) emptySet() else setOf(initial.id)
    }

    fun toggleSelected(id: String) = _selected.update { if (id in it) it - id else it + id }

    fun selectAll() {
        _selected.value = state.value.items.mapNotNull { (it as? ChatListItem.Message)?.message?.takeIf { m -> !m.isPending }?.id }.toSet()
    }

    fun exitSelection() {
        _selectMode.value = false
        _selected.value = emptySet()
    }

    /** Deletes every selected message for me (web multi-select delete). */
    fun deleteSelected() = viewModelScope.launch {
        val ids = _selected.value.toList()
        exitSelection()
        ids.forEach { id -> chats.deleteForMe(chatId, id) }
        _messages.tryEmit(R.string.chat_selected_deleted)
    }

    /** Forwards all selected messages to another conversation. */
    fun forwardSelected(target: ConversationItem) = viewModelScope.launch {
        val selected = _selected.value
        val msgs = state.value.items.mapNotNull { (it as? ChatListItem.Message)?.message }
            .filter { it.id in selected && !it.isDeleted && !it.isPending }
        exitSelection()
        msgs.forEach { m -> chats.forwardMessage(m, target.conversation.id, target.conversation.partnerId) }
        _messages.tryEmit(R.string.chat_forwarded)
    }

    fun forwardMessage(message: ChatMessage, target: ConversationItem) = viewModelScope.launch {
        val r = chats.forwardMessage(message, target.conversation.id, target.conversation.partnerId)
        if (r is AppResult.Failure) _messages.tryEmit(r.error.messageRes()) else _messages.tryEmit(R.string.chat_forwarded)
    }

    fun deleteForMe(message: ChatMessage) = viewModelScope.launch {
        val r = chats.deleteForMe(chatId, message.id)
        if (r is AppResult.Failure) _messages.tryEmit(r.error.messageRes())
    }

    fun deleteForEveryone(message: ChatMessage) = viewModelScope.launch {
        val r = chats.deleteForEveryone(chatId, message.id)
        if (r is AppResult.Failure) _messages.tryEmit(r.error.messageRes())
    }

    fun retry() = viewModelScope.launch { chats.retryFailed(chatId) }

    suspend fun resolveUrl(src: String, path: String?): String = chats.resolveMediaUrl(src, path)

    fun unblock() = viewModelScope.launch {
        val r = users.unblock(state.value.partnerId)
        if (r is AppResult.Failure) _messages.tryEmit(r.error.messageRes()) else _messages.tryEmit(R.string.chat_unblocked)
    }

    fun toggleMute() = viewModelScope.launch {
        settings.update { s -> s.copy(mutedChats = if (chatId in s.mutedChats) s.mutedChats - chatId else s.mutedChats + chatId) }
    }

    /** Deletes the whole conversation for both sides, then runs [onDone]. */
    fun deleteChat(onDone: () -> Unit) = viewModelScope.launch {
        when (val r = chats.deleteConversation(chatId)) {
            is AppResult.Success -> onDone()
            is AppResult.Failure -> _messages.tryEmit(r.error.messageRes())
        }
    }

    override fun onCleared() {
        if (tracker.activeConversationKey == chatId) tracker.activeConversationKey = null
        super.onCleared()
    }

    private companion object {
        const val PAGE = 40L
        const val MAX_LIMIT = 1_000L
        const val TYPING_REFRESH_MS = 3_000L
        const val TYPING_IDLE_MS = 4_000L
    }
}

// ============================================================================ Requests

data class ChatRequestsUiState(
    val loading: Boolean = true,
    val incoming: List<ChatRequest> = emptyList(),
    val outgoing: List<ChatRequest> = emptyList(),
    val people: Map<String, User> = emptyMap(),
)

@HiltViewModel
class ChatRequestsViewModel @Inject constructor(
    private val chats: ChatRepository,
    users: UserRepository,
) : ViewModel() {
    private val _messages = MutableSharedFlow<Int>(extraBufferCapacity = 2)
    val messages: SharedFlow<Int> = _messages.asSharedFlow()
    private val _opened = MutableSharedFlow<Pair<String, String>>(extraBufferCapacity = 1)

    /** (chatId, partnerId) after accepting a request. */
    val opened: SharedFlow<Pair<String, String>> = _opened.asSharedFlow()

    private val incoming = chats.observeIncomingRequests()
    private val outgoing = chats.observeOutgoingRequests()
    private val people: Flow<Map<String, User>> = outgoing.map { list -> list.map { it.toUid }.distinct() }.distinctUntilChanged()
        .flatMapLatest { ids -> if (ids.isEmpty()) flowOf(emptyMap()) else users.observeUsers(ids) }

    val state: StateFlow<ChatRequestsUiState> = combine(incoming, outgoing, people) { i, o, p ->
        ChatRequestsUiState(false, i, o, p)
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), ChatRequestsUiState())

    fun accept(request: ChatRequest) = viewModelScope.launch {
        when (val r = chats.acceptRequest(request)) {
            is AppResult.Success -> _opened.tryEmit(r.data to request.fromUid)
            is AppResult.Failure -> _messages.tryEmit(r.error.messageRes())
        }
    }

    fun decline(request: ChatRequest) = viewModelScope.launch {
        val r = chats.declineRequest(request)
        if (r is AppResult.Failure) _messages.tryEmit(r.error.messageRes())
    }
}

// ============================================================================ New chat

data class NewChatUiState(
    val query: String = "",
    val searching: Boolean = false,
    val results: List<User> = emptyList(),
    val following: List<User> = emptyList(),
)

@HiltViewModel
class NewChatViewModel @Inject constructor(
    private val users: UserRepository,
    auth: AuthRepository,
) : ViewModel() {
    private val query = MutableStateFlow("")
    private val myUid = auth.currentUid.orEmpty()

    private val results: Flow<Pair<Boolean, List<User>>> = query.debounce(300).mapLatest { q ->
        val t = q.trim()
        if (t.length < 2) false to emptyList() else false to ((users.searchUsers(t, 25) as? AppResult.Success)?.data.orEmpty().filter { it.id != myUid })
    }

    val state: StateFlow<NewChatUiState> = combine(
        query,
        results,
        if (myUid.isBlank()) flowOf(emptyList()) else users.observeFollowList(myUid, followers = false),
    ) { q, (searching, found), following ->
        NewChatUiState(q, searching, found, following.filter { it.id != myUid })
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), NewChatUiState())

    fun onQuery(q: String) {
        query.value = q
    }
}

// ============================================================================ Chat info

data class ChatInfoUiState(
    val loading: Boolean = true,
    val partner: User? = null,
    val online: Boolean = false,
    val wallpaper: String? = null,
    val muted: Boolean = false,
    val blocked: Boolean = false,
    val media: List<ChatMessage> = emptyList(),
)

@HiltViewModel
class ChatInfoViewModel @Inject constructor(
    savedStateHandle: SavedStateHandle,
    private val chats: ChatRepository,
    private val users: UserRepository,
    private val settings: SettingsDataSource,
) : ViewModel() {
    private val route = savedStateHandle.toRoute<ChatInfoRoute>()
    val chatId: String = route.chatId
    val partnerId: String = route.partnerId
    private val _messages = MutableSharedFlow<Int>(extraBufferCapacity = 2)
    val messages: SharedFlow<Int> = _messages.asSharedFlow()

    val state: StateFlow<ChatInfoUiState> = combine(
        users.observeUser(partnerId),
        chats.observeConversation(chatId),
        settings.settings,
        users.observeUserState(),
        chats.observeMessages(chatId, 300),
    ) { p, conv, s, us, msgs ->
        ChatInfoUiState(
            loading = false,
            partner = p,
            online = p != null && PresenceManager.isOnlineNow(p.online, p.lastSeen),
            wallpaper = conv?.wallpaper,
            muted = chatId in s.mutedChats,
            blocked = partnerId in us.blocked,
            media = msgs.filter { m -> !m.isDeleted && m.attachments.any { it.type == "image" || it.type == "video" || it.type == "gif" } }.reversed(),
        )
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), ChatInfoUiState())

    fun toggleMute() = viewModelScope.launch {
        settings.update { s -> s.copy(mutedChats = if (chatId in s.mutedChats) s.mutedChats - chatId else s.mutedChats + chatId) }
    }

    fun setWallpaper(key: String?) = viewModelScope.launch {
        val r = chats.setWallpaper(chatId, key)
        if (r is AppResult.Failure) _messages.tryEmit(r.error.messageRes())
    }

    fun toggleBlock() = viewModelScope.launch {
        val wasBlocked = state.value.blocked
        val r = if (wasBlocked) users.unblock(partnerId) else users.block(partnerId)
        when (r) {
            is AppResult.Success -> _messages.tryEmit(if (wasBlocked) R.string.chat_unblocked else R.string.chat_blocked_done)
            is AppResult.Failure -> _messages.tryEmit(r.error.messageRes())
        }
    }

    fun deleteChat(onDone: () -> Unit) = viewModelScope.launch {
        when (val r = chats.deleteConversation(chatId)) {
            is AppResult.Success -> onDone()
            is AppResult.Failure -> _messages.tryEmit(r.error.messageRes())
        }
    }

    suspend fun resolveUrl(src: String, path: String?): String = chats.resolveMediaUrl(src, path)
}
