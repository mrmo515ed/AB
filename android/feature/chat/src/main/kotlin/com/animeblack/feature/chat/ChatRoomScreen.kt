package com.animeblack.feature.chat

import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.PickVisualMediaRequest
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SmallFloatingActionButton
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.derivedStateOf
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleEventObserver
import androidx.lifecycle.compose.LocalLifecycleOwner
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import coil3.compose.AsyncImage
import com.animeblack.core.designsystem.component.AbIcon
import com.animeblack.core.designsystem.component.AbIconButton
import com.animeblack.core.designsystem.component.Avatar
import com.animeblack.core.designsystem.component.ConfirmDialog
import com.animeblack.core.designsystem.component.EmptyState
import com.animeblack.core.designsystem.component.LoadingState
import com.animeblack.core.designsystem.component.VerifiedBadge
import com.animeblack.core.designsystem.icon.AbIcons
import com.animeblack.core.designsystem.theme.AbColors
import com.animeblack.core.model.ChatMessage
import com.animeblack.core.model.DmPermission
import com.animeblack.core.model.LocalMedia
import com.animeblack.core.model.MessageStatus
import com.animeblack.core.ui.ZoomableImageDialog
import com.animeblack.core.ui.chat.ChatComposer
import com.animeblack.core.ui.chat.ChatListItem
import com.animeblack.core.ui.chat.DaySeparator
import com.animeblack.core.ui.chat.MessageActionsSheet
import com.animeblack.core.ui.chat.MessageBubble
import com.animeblack.core.ui.chat.TypingIndicator
import com.animeblack.core.ui.copyToClipboard
import com.animeblack.core.ui.localMediaFor
import com.animeblack.core.ui.openExternalUrl
import com.animeblack.core.ui.relativeTime
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

data class ChatRoomActions(
    val onBack: () -> Unit,
    val openInfo: (chatId: String, partnerId: String) -> Unit,
    val openProfile: (String) -> Unit,
    val openVideo: (String) -> Unit,
    val openCamera: () -> Unit,
    val report: (targetType: String, targetId: String) -> Unit,
    val openMention: (String) -> Unit,
)

@Composable
fun ChatRoomScreen(
    actions: ChatRoomActions,
    capturedMedia: LocalMedia?,
    onCapturedConsumed: () -> Unit,
    viewModel: ChatRoomViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val composer by viewModel.composer.collectAsStateWithLifecycle()
    val forwardTargets by viewModel.forwardTargets.collectAsStateWithLifecycle()
    val context = LocalContext.current
    val snackbar = remember { SnackbarHostState() }
    val listState = rememberLazyListState()
    val scope = rememberCoroutineScope()
    var actionFor by remember { mutableStateOf<ChatMessage?>(null) }
    var confirmDelete by remember { mutableStateOf<ChatMessage?>(null) }
    var imageViewer by remember { mutableStateOf<String?>(null) }
    var highlightId by remember { mutableStateOf<String?>(null) }
    var showMenu by remember { mutableStateOf(false) }
    var forwardFor by remember { mutableStateOf<ChatMessage?>(null) }
    var forwardSelection by remember { mutableStateOf(false) }
    var infoFor by remember { mutableStateOf<ChatMessage?>(null) }
    var showStats by remember { mutableStateOf(false) }
    var showStarred by remember { mutableStateOf(false) }
    var confirmDeleteBoth by remember { mutableStateOf(false) }

    // Foreground tracking: suppress notifications for this chat and keep receipts current.
    val lifecycleOwner = LocalLifecycleOwner.current
    DisposableEffect(lifecycleOwner) {
        val observer = LifecycleEventObserver { _, event ->
            when (event) {
                Lifecycle.Event.ON_RESUME -> viewModel.setActive(true)
                Lifecycle.Event.ON_PAUSE -> viewModel.setActive(false)
                else -> Unit
            }
        }
        lifecycleOwner.lifecycle.addObserver(observer)
        if (lifecycleOwner.lifecycle.currentState.isAtLeast(Lifecycle.State.RESUMED)) viewModel.setActive(true)
        onDispose {
            lifecycleOwner.lifecycle.removeObserver(observer)
            viewModel.setActive(false)
        }
    }
    LaunchedEffect(state.items.size) { viewModel.markRead() }
    LaunchedEffect(Unit) { viewModel.messages.collect { snackbar.showSnackbar(context.getString(it)) } }
    LaunchedEffect(capturedMedia) {
        if (capturedMedia != null) {
            viewModel.addAttachments(listOf(capturedMedia))
            onCapturedConsumed()
        }
    }
    val mediaPicker = rememberLauncherForActivityResult(ActivityResultContracts.PickMultipleVisualMedia(5)) { uris ->
        if (uris.isNotEmpty()) viewModel.addAttachments(uris.map { localMediaFor(context, it) })
    }
    val filePicker = rememberLauncherForActivityResult(ActivityResultContracts.OpenDocument()) { uri ->
        if (uri != null) viewModel.addAttachments(listOf(localMediaFor(context, uri)))
    }

    fun jumpToMessage(id: String) {
        val index = state.items.indexOfFirst { it is ChatListItem.Message && it.message.id == id }
        if (index >= 0) {
            scope.launch {
                listState.animateScrollToItem(index)
                highlightId = id
                delay(1_600)
                highlightId = null
            }
        }
    }

    val nearOldest by remember {
        derivedStateOf {
            val info = listState.layoutInfo
            val last = info.visibleItemsInfo.lastOrNull()?.index ?: 0
            info.totalItemsCount > 0 && last >= info.totalItemsCount - 5
        }
    }
    LaunchedEffect(nearOldest) { if (nearOldest) viewModel.loadMore() }
    val newestKey = state.items.firstOrNull()?.key
    LaunchedEffect(newestKey) { if (listState.firstVisibleItemIndex <= 2) listState.animateScrollToItem(0) }
    val showJump by remember { derivedStateOf { listState.firstVisibleItemIndex > 6 } }
    val partner = state.partner
    val partnerName = partner?.displayName.orEmpty()

    Scaffold(
        topBar = {
            Column {
                if (state.selectMode) {
                    Row(
                        Modifier.fillMaxWidth().background(AbColors.Charcoal).padding(horizontal = 8.dp, vertical = 10.dp),
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        AbIconButton(AbIcons.Close, stringResource(com.animeblack.core.designsystem.R.string.ab_cancel), onClick = viewModel::exitSelection)
                        Text(
                            stringResource(R.string.chat_select_count, state.selectedIds.size),
                            style = MaterialTheme.typography.titleMedium,
                            modifier = Modifier.weight(1f).padding(start = 8.dp),
                        )
                        AbIconButton(AbIcons.CheckCircle, stringResource(R.string.chat_select_all), onClick = viewModel::selectAll)
                        AbIconButton(
                            AbIcons.Forward,
                            stringResource(R.string.chat_forward_title),
                            onClick = { forwardSelection = true },
                            enabled = state.selectedIds.isNotEmpty(),
                        )
                        AbIconButton(
                            AbIcons.Delete,
                            stringResource(com.animeblack.core.ui.R.string.ui_chat_delete_for_me),
                            tint = AbColors.Rose,
                            onClick = { viewModel.deleteSelected() },
                            enabled = state.selectedIds.isNotEmpty(),
                        )
                    }
                } else {
                    TopAppBar(
                navigationIcon = { AbIconButton(AbIcons.ArrowBack, stringResource(com.animeblack.core.designsystem.R.string.ab_back), onClick = actions.onBack) },
                title = {
                    Row(
                        Modifier.clickable(enabled = state.partnerId.isNotBlank()) { actions.openInfo(state.chatId, state.partnerId) },
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        Avatar(partner?.avatar, partnerName, size = 40.dp, online = state.partnerOnline)
                        Spacer(Modifier.width(10.dp))
                        Column {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text(partnerName, style = MaterialTheme.typography.titleMedium, maxLines = 1, overflow = TextOverflow.Ellipsis, modifier = Modifier.weight(1f, fill = false))
                                if (partner?.showsVerifiedBadge == true) VerifiedBadge(gold = partner.isGoldVerified, size = 15.dp, modifier = Modifier.padding(start = 4.dp))
                            }
                            val status = when {
                                state.partnerTyping -> stringResource(R.string.chat_typing)
                                state.partnerOnline -> stringResource(R.string.chat_online)
                                partner != null && partner.lastSeen > 0 -> stringResource(R.string.chat_last_seen, relativeTime(partner.lastSeen))
                                else -> partner?.handle.orEmpty()
                            }
                            Text(
                                status,
                                style = MaterialTheme.typography.labelSmall,
                                color = if (state.partnerTyping || state.partnerOnline) AbColors.Emerald else AbColors.TextSecondary,
                                maxLines = 1,
                            )
                        }
                    }
                },
                actions = {
                    if (state.partnerId.isNotBlank()) {
                        AbIconButton(AbIcons.Info, stringResource(R.string.chat_info), onClick = { actions.openInfo(state.chatId, state.partnerId) })
                    }
                    AbIconButton(AbIcons.MoreVert, "خيارات المحادثة", onClick = { showMenu = true })
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = AbColors.Charcoal),
                    )
                }
                // Pinned message banner (web `pinnedMsgs`).
                state.pinnedMessage?.let { pinned ->
                    Row(
                        Modifier.fillMaxWidth()
                            .background(AbColors.Gold.copy(alpha = 0.12f))
                            .padding(horizontal = 12.dp, vertical = 7.dp),
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        AbIcon(AbIcons.PushPinFilled, null, tint = AbColors.Gold, size = 16.dp)
                        Spacer(Modifier.width(8.dp))
                        Text(
                            stringResource(R.string.chat_pinned_label) + ": " + (pinned.text.ifBlank { "وسائط" }).take(60),
                            color = AbColors.TextPrimary,
                            style = MaterialTheme.typography.bodySmall,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis,
                            modifier = Modifier.weight(1f).clickable { jumpToMessage(pinned.id) },
                        )
                        AbIconButton(AbIcons.Close, stringResource(R.string.chat_msg_unpinned), tint = AbColors.TextSecondary, onClick = { viewModel.unpinMessage(pinned.id) })
                    }
                }
                // Disappearing messages banner (web `vanish`).
                if (state.vanishHours > 0) {
                    Row(
                        Modifier.fillMaxWidth().background(AbColors.Emerald.copy(alpha = 0.1f)).padding(horizontal = 12.dp, vertical = 6.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.Center,
                    ) {
                        AbIcon(AbIcons.Timer, null, tint = AbColors.Emerald, size = 14.dp)
                        Spacer(Modifier.width(6.dp))
                        Text(
                            stringResource(if (state.vanishHours == 24) R.string.chat_vanish_banner_24 else R.string.chat_vanish_banner_72),
                            color = AbColors.Emerald,
                            style = MaterialTheme.typography.labelSmall,
                        )
                    }
                }
            }
        },
        bottomBar = {
          if (!state.selectMode) {
            Column {
                val notice = when {
                    state.blockedByMe -> R.string.chat_blocked
                    state.permission == DmPermission.Closed -> R.string.chat_closed
                    state.permission == DmPermission.Self -> R.string.chat_self
                    state.sendsRequest -> R.string.chat_requires_request
                    else -> null
                }
                if (notice != null) {
                    Column(Modifier.fillMaxWidth().background(AbColors.Charcoal2).padding(12.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(stringResource(notice), color = AbColors.TextSecondary, textAlign = TextAlign.Center, style = MaterialTheme.typography.bodySmall)
                        if (state.blockedByMe) TextButton(onClick = viewModel::unblock) { Text(stringResource(R.string.chat_unblock), color = AbColors.Cyan) }
                    }
                }
                ChatComposer(
                    text = composer.text,
                    onTextChange = viewModel::onText,
                    onSend = viewModel::send,
                    attachments = composer.attachments,
                    onRemoveAttachment = viewModel::removeAttachment,
                    replyTo = composer.replyTo,
                    onCancelReply = viewModel::cancelReply,
                    editing = composer.editingId != null,
                    onCancelEdit = viewModel::cancelEdit,
                    onPickMedia = if (state.sendsRequest) null else ({ mediaPicker.launch(PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageAndVideo)) }),
                    onPickFile = if (state.sendsRequest) null else ({ filePicker.launch(arrayOf("*/*")) }),
                    onCamera = if (state.sendsRequest) null else actions.openCamera,
                    onVoiceRecorded = if (state.sendsRequest) null else viewModel::sendVoice,
                    onSticker = if (state.sendsRequest) null else viewModel::sendSticker,
                    onGif = if (state.sendsRequest) null else viewModel::sendGif,
                    enabled = state.canSend,
                    disabledHint = notice?.let { stringResource(it) },
                    sending = composer.sending,
                    modifier = Modifier.navigationBarsPadding().imePadding(),
                )
            }
          }
        },
        snackbarHost = { SnackbarHost(snackbar) },
        containerColor = AbColors.Black,
    ) { padding ->
        Box(Modifier.fillMaxSize().padding(padding)) {
            ChatWallpaper(state.wallpaper)
            when {
                state.loading -> LoadingState()
                state.items.isEmpty() -> EmptyState(
                    title = stringResource(R.string.chat_say_hi, partnerName),
                    icon = AbIcons.Mood,
                )
                else -> LazyColumn(
                    state = listState,
                    reverseLayout = true,
                    modifier = Modifier.fillMaxSize(),
                    contentPadding = PaddingValues(vertical = 8.dp),
                ) {
                    if (state.partnerTyping) {
                        item(key = "typing") { TypingIndicator() }
                    }
                    items(state.items, key = { it.key }, contentType = { if (it is ChatListItem.Day) 0 else 1 }) { item ->
                        when (item) {
                            is ChatListItem.Day -> DaySeparator(item.epochMs)
                            is ChatListItem.Message -> {
                                val m = item.message
                                MessageBubble(
                                    message = m,
                                    isMine = m.isMine(state.myUid),
                                    myUid = state.myUid,
                                    grouped = item.grouped,
                                    highlighted = highlightId == m.id,
                                    resolveUrl = { a -> viewModel.resolveUrl(a.src, a.storagePath) },
                                    onLongPress = { actionFor = m },
                                    onOpenMedia = { url, type, _ ->
                                        when (type) {
                                            "video" -> actions.openVideo(url)
                                            "image" -> imageViewer = url
                                            else -> context.openExternalUrl(url)
                                        }
                                    },
                                    onOpenUser = actions.openProfile,
                                    onRetry = viewModel::retry,
                                    onQuoteClick = { id -> jumpToMessage(id) },
                                    onReactionClick = { key -> viewModel.toggleReaction(m, key) },
                                    onMention = actions.openMention,
                                    onUrl = { context.openExternalUrl(it) },
                                    starred = m.id in state.starredIds,
                                    selectMode = state.selectMode,
                                    selected = m.id in state.selectedIds,
                                    onSelect = { viewModel.toggleSelected(m.id) },
                                    onDoubleTap = if (!state.selectMode && state.canSend && !m.isDeleted && !m.isPending) {
                                        { viewModel.doubleTapReact(m) }
                                    } else {
                                        null
                                    },
                                    onSwipeReply = if (!state.selectMode && state.canSend && !state.sendsRequest) {
                                        { viewModel.reply(m) }
                                    } else {
                                        null
                                    },
                                )
                            }
                        }
                    }
                    if (state.canLoadMore) {
                        item(key = "older") {
                            Box(Modifier.fillMaxWidth().padding(12.dp), contentAlignment = Alignment.Center) {
                                CircularProgressIndicator(Modifier.size(22.dp), strokeWidth = 2.dp, color = AbColors.Violet)
                            }
                        }
                    }
                }
            }
            if (showJump) {
                SmallFloatingActionButton(
                    onClick = { scope.launch { listState.animateScrollToItem(0) } },
                    containerColor = AbColors.Charcoal3,
                    modifier = Modifier.align(Alignment.BottomEnd).padding(16.dp),
                ) { AbIcon(AbIcons.KeyboardArrowDown, stringResource(com.animeblack.core.ui.R.string.ui_chat_scroll_latest), tint = Color.White) }
            }
        }
    }

    actionFor?.let { m ->
        val mine = m.isMine(state.myUid)
        val canAct = !m.isPending && !m.isDeleted
        MessageActionsSheet(
            message = m,
            myReaction = m.reactions[state.myUid],
            onDismiss = { actionFor = null },
            onReact = if (canAct && state.canSend) ({ key -> viewModel.react(m, key) }) else null,
            onReply = if (canAct && state.canSend) ({ viewModel.reply(m) }) else null,
            onCopy = if (m.text.isNotBlank() && !m.isDeleted) ({
                copyToClipboard(context, m.text)
                scope.launch { snackbar.showSnackbar(context.getString(R.string.chat_copied)) }
            }) else null,
            onEdit = if (mine && canAct && m.type == ChatMessage.TYPE_TEXT && m.text.isNotBlank()) ({ viewModel.startEdit(m) }) else null,
            onDeleteForMe = if (!m.isPending) ({ viewModel.deleteForMe(m) }) else null,
            onDeleteForEveryone = if (mine && canAct) ({ confirmDelete = m }) else null,
            onReport = if (!mine && !m.isDeleted) ({ actions.report("message", "${state.chatId}/${m.id}") }) else null,
            onRetry = if (mine && m.status == MessageStatus.Failed) ({ viewModel.retry() }) else null,
            onPin = if (canAct && state.canSend) ({ viewModel.pinMessage(m) }) else null,
            pinned = m.id in state.pinnedMsgIds,
            onStar = if (canAct) ({ viewModel.toggleStar(m) }) else null,
            starred = m.id in state.starredIds,
            onForward = if (canAct) ({ forwardFor = m }) else null,
            onInfo = { infoFor = m },
            onSelect = { viewModel.startSelection(m) },
        )
    }
    confirmDelete?.let { m ->
        ConfirmDialog(
            title = stringResource(com.animeblack.core.ui.R.string.ui_chat_delete_for_all),
            message = stringResource(R.string.chat_delete_msg_confirm),
            onConfirm = {
                viewModel.deleteForEveryone(m)
                confirmDelete = null
            },
            onDismiss = { confirmDelete = null },
            destructive = true,
        )
    }
    imageViewer?.let { url -> ZoomableImageDialog(url) { imageViewer = null } }

    if (showMenu) {
        ChatMenuSheet(
            partnerName = partnerName,
            partnerAvatar = partner?.avatar,
            vanishHours = state.vanishHours,
            starredCount = state.starredIds.size,
            onDismiss = { showMenu = false },
            onProfile = { if (state.partnerId.isNotBlank()) actions.openProfile(state.partnerId) },
            onVoiceCall = { scope.launch { snackbar.showSnackbar(context.getString(R.string.chat_calls_soon)) } },
            onVideoCall = { scope.launch { snackbar.showSnackbar(context.getString(R.string.chat_calls_soon)) } },
            onOpenSettings = { actions.openInfo(state.chatId, state.partnerId) },
            onSharedMedia = { actions.openInfo(state.chatId, state.partnerId) },
            onStarred = { showStarred = true },
            onStats = { showStats = true },
            onCycleVanish = viewModel::cycleVanish,
            onSelectMode = { viewModel.startSelection() },
            onDeleteBoth = { confirmDeleteBoth = true },
        )
    }
    forwardFor?.let { m ->
        ForwardSheet(
            targets = forwardTargets,
            onDismiss = { forwardFor = null },
            onPick = { target ->
                viewModel.forwardMessage(m, target)
                forwardFor = null
            },
        )
    }
    if (forwardSelection) {
        ForwardSheet(
            targets = forwardTargets,
            onDismiss = { forwardSelection = false },
            onPick = { target ->
                viewModel.forwardSelected(target)
                forwardSelection = false
            },
        )
    }
    infoFor?.let { m ->
        MessageInfoDialog(
            message = m,
            myUid = state.myUid,
            partnerName = partnerName,
            onDismiss = { infoFor = null },
        )
    }
    if (showStats) {
        val firstAt = state.items.mapNotNull { (it as? ChatListItem.Message)?.message?.at?.takeIf { ts -> ts > 0 } }.minOrNull() ?: 0L
        ChatStatsDialog(
            partnerName = partnerName,
            totalMessages = state.totalMessages,
            myMessages = state.myMessagesCount,
            mediaCount = state.mediaCount,
            starredCount = state.starredIds.size,
            pinnedCount = state.pinnedMsgIds.size,
            firstAt = firstAt,
            onDismiss = { showStats = false },
        )
    }
    if (showStarred) {
        val starredMessages = state.items.mapNotNull { (it as? ChatListItem.Message)?.message }
            .filter { it.id in state.starredIds && !it.isDeleted }
        StarredMessagesSheet(
            messages = starredMessages,
            myUid = state.myUid,
            onDismiss = { showStarred = false },
            onJump = { id -> jumpToMessage(id) },
        )
    }
    if (confirmDeleteBoth) {
        ConfirmDialog(
            title = stringResource(R.string.chat_menu_delete_both),
            message = stringResource(R.string.chat_delete_confirm),
            onConfirm = {
                confirmDeleteBoth = false
                viewModel.deleteChat { actions.onBack() }
            },
            onDismiss = { confirmDeleteBoth = false },
            destructive = true,
        )
    }
}

/** Wallpaper presets (keys stored in `chats/{id}.wallpaper`); URLs are drawn as images. */
val CHAT_WALLPAPERS: List<Pair<String, List<Color>>> = listOf(
    "aurora" to listOf(Color(0xFF0B0B2B), Color(0xFF2A1459), Color(0xFF002B3D)),
    "midnight" to listOf(Color(0xFF000000), Color(0xFF0B1026)),
    "sakura" to listOf(Color(0xFF1A0714), Color(0xFF3D0F2E)),
    "ocean" to listOf(Color(0xFF02111B), Color(0xFF053247)),
    "ember" to listOf(Color(0xFF140500), Color(0xFF3D1300)),
    "forest" to listOf(Color(0xFF02140B), Color(0xFF06331E)),
)

@Composable
fun ChatWallpaper(key: String?, modifier: Modifier = Modifier) {
    val preset = CHAT_WALLPAPERS.firstOrNull { it.first == key }
    when {
        key != null && key.startsWith("https://") -> AsyncImage(
            model = key,
            contentDescription = null,
            contentScale = ContentScale.Crop,
            alpha = 0.35f,
            modifier = modifier.fillMaxSize(),
        )
        preset != null -> Box(modifier.fillMaxSize().background(Brush.verticalGradient(preset.second)))
        else -> Unit
    }
}
