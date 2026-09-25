package com.animeblack.feature.community

import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.PickVisualMediaRequest
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
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
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SmallFloatingActionButton
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
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
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleEventObserver
import androidx.lifecycle.compose.LocalLifecycleOwner
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.animeblack.core.designsystem.component.AbIcon
import com.animeblack.core.designsystem.component.AbIconButton
import com.animeblack.core.designsystem.component.ConfirmDialog
import com.animeblack.core.designsystem.component.EmptyState
import com.animeblack.core.designsystem.component.GradientButton
import com.animeblack.core.designsystem.component.LoadingState
import com.animeblack.core.designsystem.icon.AbIcons
import com.animeblack.core.designsystem.theme.AbColors
import com.animeblack.core.model.ChatMessage
import com.animeblack.core.model.LocalMedia
import com.animeblack.core.model.RoomRef
import com.animeblack.core.ui.ZoomableImageDialog
import com.animeblack.core.ui.chat.ChatComposer
import com.animeblack.core.ui.chat.ChatListItem
import com.animeblack.core.ui.chat.DaySeparator
import com.animeblack.core.ui.chat.MessageActionsSheet
import com.animeblack.core.ui.chat.MessageBubble
import com.animeblack.core.ui.copyToClipboard
import com.animeblack.core.ui.localMediaFor
import com.animeblack.core.ui.openExternalUrl
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

data class RoomActions(
    val onBack: () -> Unit,
    val openRoute: (Any) -> Unit,
    val openProfile: (String) -> Unit,
    val openVideo: (String) -> Unit,
    val openCamera: () -> Unit,
    val report: (targetType: String, targetId: String) -> Unit,
    val openMention: (String) -> Unit,
)

/** Shared chat room for groups, worlds and guild channels (same message model and composer). */
@Composable
fun RoomScreen(
    actions: RoomActions,
    capturedMedia: LocalMedia?,
    onCapturedConsumed: () -> Unit,
    viewModel: RoomViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val composer by viewModel.composer.collectAsStateWithLifecycle()
    val context = LocalContext.current
    val snackbar = remember { SnackbarHostState() }
    val listState = rememberLazyListState()
    val scope = rememberCoroutineScope()
    var actionFor by remember { mutableStateOf<ChatMessage?>(null) }
    var confirmDelete by remember { mutableStateOf<ChatMessage?>(null) }
    var imageViewer by remember { mutableStateOf<String?>(null) }
    var highlightId by remember { mutableStateOf<String?>(null) }
    var showRules by remember { mutableStateOf(false) }
    var confirmLeave by remember { mutableStateOf(false) }
    var menu by remember { mutableStateOf(false) }

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

    // Reversed list: the "end" of the list is the oldest message -> page in older ones.
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

    val header = state.header
    Scaffold(
        topBar = {
            TopAppBar(
                navigationIcon = { AbIconButton(AbIcons.ArrowBack, stringResource(com.animeblack.core.designsystem.R.string.ab_back), onClick = actions.onBack) },
                title = {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        SpaceAvatar(header.icon, header.color1, header.color2, size = 38.dp)
                        Spacer(Modifier.width(10.dp))
                        Column {
                            Text(
                                if (viewModel.room is RoomRef.ChannelRoom) stringResource(R.string.community_channel_hint, header.title) else header.title,
                                style = MaterialTheme.typography.titleMedium,
                                maxLines = 1,
                                overflow = TextOverflow.Ellipsis,
                            )
                            Text(
                                if (viewModel.room is RoomRef.ChannelRoom) header.subtitle else stringResource(R.string.community_members, header.memberCount),
                                style = MaterialTheme.typography.labelSmall,
                                color = AbColors.TextSecondary,
                                maxLines = 1,
                            )
                        }
                    }
                },
                actions = {
                    AbIconButton(AbIcons.Info, stringResource(R.string.community_info), onClick = {
                        val route = viewModel.infoRoute()
                        if (route != null) actions.openRoute(route) else showRules = true
                    })
                    if (header.isMember && viewModel.room !is RoomRef.GroupRoom) {
                        Box {
                            AbIconButton(AbIcons.MoreVert, null, onClick = { menu = true })
                            DropdownMenu(expanded = menu, onDismissRequest = { menu = false }, containerColor = AbColors.Charcoal3) {
                                DropdownMenuItem(
                                    text = { Text(stringResource(R.string.community_leave), color = AbColors.Rose) },
                                    leadingIcon = { AbIcon(AbIcons.Logout, null, tint = AbColors.Rose) },
                                    onClick = {
                                        menu = false
                                        confirmLeave = true
                                    },
                                )
                            }
                        }
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = AbColors.Charcoal),
            )
        },
        bottomBar = {
            if (!state.loading && !state.notFound) {
                if (!header.isMember) {
                    JoinBar(
                        text = stringResource(R.string.community_room_join_to_chat),
                        button = stringResource(if (header.isPrivate) R.string.community_request else R.string.community_join),
                        onJoin = viewModel::join,
                    )
                } else {
                    ChatComposer(
                        text = composer.text,
                        onTextChange = viewModel::onText,
                        onSend = viewModel::send,
                        attachments = composer.attachments,
                        onRemoveAttachment = viewModel::removeAttachment,
                        replyTo = composer.replyTo,
                        onCancelReply = viewModel::cancelReply,
                        onPickMedia = { mediaPicker.launch(PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageAndVideo)) },
                        onPickFile = { filePicker.launch(arrayOf("*/*")) },
                        onCamera = actions.openCamera,
                        onVoiceRecorded = viewModel::sendVoice,
                        enabled = state.canSend,
                        disabledHint = stringResource(if (header.closed) R.string.community_room_closed else R.string.community_room_announce_only),
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
            when {
                state.loading -> LoadingState()
                state.notFound -> EmptyState(icon = AbIcons.GroupOff, title = stringResource(R.string.community_room_not_found))
                state.items.isEmpty() -> EmptyState(icon = AbIcons.Forum, title = stringResource(R.string.community_room_empty))
                else -> LazyColumn(
                    state = listState,
                    reverseLayout = true,
                    modifier = Modifier.fillMaxSize(),
                    contentPadding = PaddingValues(top = if (header.pinned.isNullOrBlank()) 8.dp else 56.dp, bottom = 8.dp),
                ) {
                    items(state.items, key = { it.key }, contentType = { if (it is ChatListItem.Day) 0 else 1 }) { item ->
                        when (item) {
                            is ChatListItem.Day -> DaySeparator(item.epochMs)
                            is ChatListItem.Message -> {
                                val m = item.message
                                MessageBubble(
                                    message = m,
                                    isMine = m.isMine(state.myUid),
                                    myUid = state.myUid,
                                    showSender = true,
                                    grouped = item.grouped,
                                    highlighted = highlightId == m.id,
                                    onLongPress = { actionFor = m },
                                    onOpenMedia = { url, type, _ ->
                                        when (type) {
                                            "video" -> actions.openVideo(url)
                                            "image" -> imageViewer = url
                                            else -> context.openExternalUrl(url)
                                        }
                                    },
                                    onOpenUser = actions.openProfile,
                                    onQuoteClick = { id ->
                                        val index = state.items.indexOfFirst { it is ChatListItem.Message && it.message.id == id }
                                        if (index >= 0) {
                                            scope.launch {
                                                listState.animateScrollToItem(index)
                                                highlightId = id
                                                delay(1_500)
                                                highlightId = null
                                            }
                                        }
                                    },
                                    onMention = actions.openMention,
                                    onUrl = { context.openExternalUrl(it) },
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
            header.pinned?.takeIf { it.isNotBlank() }?.let { pinned ->
                Row(
                    Modifier.align(Alignment.TopCenter).fillMaxWidth().background(AbColors.Charcoal2).padding(horizontal = 16.dp, vertical = 10.dp),
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    AbIcon(AbIcons.PushPinFilled, stringResource(R.string.community_pinned), tint = AbColors.Gold, size = 18.dp)
                    Spacer(Modifier.width(8.dp))
                    Text(pinned, style = MaterialTheme.typography.bodySmall, maxLines = 2, overflow = TextOverflow.Ellipsis)
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
        MessageActionsSheet(
            message = m,
            myReaction = null,
            onDismiss = { actionFor = null },
            onReact = null,
            onReply = if (state.canSend && !m.isDeleted) ({ viewModel.reply(m) }) else null,
            onCopy = if (m.text.isNotBlank()) ({
                copyToClipboard(context, m.text)
                scope.launch { snackbar.showSnackbar(context.getString(R.string.community_copied)) }
            }) else null,
            onEdit = null,
            onDeleteForMe = null,
            onDeleteForEveryone = if (mine || header.isAdmin) ({ confirmDelete = m }) else null,
            onReport = if (!mine) ({ actions.report("message", m.id) }) else null,
            onRetry = null,
        )
    }
    confirmDelete?.let { m ->
        ConfirmDialog(
            title = stringResource(com.animeblack.core.ui.R.string.ui_delete),
            message = stringResource(R.string.community_delete_message_confirm),
            onConfirm = {
                viewModel.delete(m)
                confirmDelete = null
            },
            onDismiss = { confirmDelete = null },
            destructive = true,
        )
    }
    imageViewer?.let { url -> ZoomableImageDialog(url) { imageViewer = null } }
    if (confirmLeave) {
        ConfirmDialog(
            title = stringResource(R.string.community_leave),
            message = stringResource(R.string.community_leave_confirm),
            onConfirm = {
                confirmLeave = false
                viewModel.leave(actions.onBack)
            },
            onDismiss = { confirmLeave = false },
            destructive = true,
        )
    }
    if (showRules) {
        ModalBottomSheet(onDismissRequest = { showRules = false }, containerColor = AbColors.Charcoal2) {
            Column(Modifier.fillMaxWidth().navigationBarsPadding().padding(20.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    SpaceAvatar(header.icon, header.color1, header.color2, size = 52.dp)
                    Spacer(Modifier.width(12.dp))
                    Column {
                        Text(header.title, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                        Text(stringResource(R.string.community_members, header.memberCount), color = AbColors.TextSecondary, style = MaterialTheme.typography.labelMedium)
                    }
                }
                if (header.subtitle.isNotBlank()) Text(header.subtitle, color = AbColors.TextSecondary)
                if (header.rules.isNotEmpty()) {
                    Text(stringResource(R.string.community_world_rules), style = MaterialTheme.typography.titleSmall, color = AbColors.Violet)
                    header.rules.forEachIndexed { i, rule ->
                        Row {
                            Text("${i + 1}.", color = AbColors.Cyan, modifier = Modifier.width(24.dp))
                            Text(rule, style = MaterialTheme.typography.bodyMedium)
                        }
                    }
                }
                if (header.isMember) {
                    GradientButton(
                        text = stringResource(R.string.community_leave),
                        onClick = {
                            showRules = false
                            confirmLeave = true
                        },
                        brush = androidx.compose.ui.graphics.SolidColor(AbColors.Charcoal4),
                        icon = AbIcons.Logout,
                        modifier = Modifier.fillMaxWidth(),
                    )
                }
            }
        }
    }
}

@Composable
private fun JoinBar(text: String, button: String, onJoin: () -> Unit) {
    Column(
        Modifier.fillMaxWidth().background(AbColors.Charcoal).navigationBarsPadding().padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(10.dp),
    ) {
        Text(text, color = AbColors.TextSecondary, textAlign = TextAlign.Center, style = MaterialTheme.typography.bodyMedium)
        GradientButton(text = button, onClick = onJoin, icon = AbIcons.GroupAdd, modifier = Modifier.fillMaxWidth().clip(RoundedCornerShape(16.dp)))
    }
}
