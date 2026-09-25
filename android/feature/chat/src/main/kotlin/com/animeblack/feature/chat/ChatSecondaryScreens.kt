package com.animeblack.feature.chat

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.PrimaryTabRow
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Switch
import androidx.compose.material3.Tab
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.produceState
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import coil3.compose.AsyncImage
import com.animeblack.core.designsystem.component.AbIcon
import com.animeblack.core.designsystem.component.AbTopBar
import com.animeblack.core.designsystem.component.Avatar
import com.animeblack.core.designsystem.component.ConfirmDialog
import com.animeblack.core.designsystem.component.EmptyState
import com.animeblack.core.designsystem.component.GlassCard
import com.animeblack.core.designsystem.component.GradientButton
import com.animeblack.core.designsystem.component.GlassButton
import com.animeblack.core.designsystem.component.LoadingState
import com.animeblack.core.designsystem.component.Pill
import com.animeblack.core.designsystem.component.SearchField
import com.animeblack.core.designsystem.component.SectionHeader
import com.animeblack.core.designsystem.icon.AbIcons
import com.animeblack.core.designsystem.theme.AbColors
import com.animeblack.core.model.ChatMessage
import com.animeblack.core.model.ChatRequest
import com.animeblack.core.ui.UserRow
import com.animeblack.core.ui.ZoomableImageDialog
import com.animeblack.core.ui.rememberImageModel
import com.animeblack.core.ui.relativeTime

// ============================================================================ Requests

@Composable
fun ChatRequestsScreen(
    onBack: () -> Unit,
    openChat: (chatId: String, partnerId: String) -> Unit,
    openProfile: (String) -> Unit,
    viewModel: ChatRequestsViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val context = LocalContext.current
    val snackbar = remember { SnackbarHostState() }
    var tab by remember { mutableIntStateOf(0) }
    LaunchedEffect(Unit) { viewModel.messages.collect { snackbar.showSnackbar(context.getString(it)) } }
    LaunchedEffect(Unit) { viewModel.opened.collect { (chatId, partnerId) -> openChat(chatId, partnerId) } }

    Scaffold(topBar = { AbTopBar(title = stringResource(R.string.chat_requests), onBack = onBack) }, snackbarHost = { SnackbarHost(snackbar) }) { padding ->
        Column(Modifier.fillMaxSize().padding(padding)) {
            PrimaryTabRow(selectedTabIndex = tab, containerColor = Color.Transparent) {
                Tab(selected = tab == 0, onClick = { tab = 0 }, text = { Text(stringResource(R.string.chat_incoming) + " (${state.incoming.size})") })
                Tab(selected = tab == 1, onClick = { tab = 1 }, text = { Text(stringResource(R.string.chat_outgoing) + " (${state.outgoing.size})") })
            }
            val list = if (tab == 0) state.incoming else state.outgoing
            when {
                state.loading -> LoadingState()
                list.isEmpty() -> EmptyState(title = stringResource(R.string.chat_no_requests), icon = AbIcons.MarkChatUnread)
                else -> LazyColumn(contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    items(list, key = { it.id }) { request ->
                        if (tab == 0) {
                            IncomingRequestCard(request, onAccept = { viewModel.accept(request) }, onDecline = { viewModel.decline(request) }, onProfile = { openProfile(request.fromUid) })
                        } else {
                            val user = state.people[request.toUid]
                            GlassCard(Modifier.fillMaxWidth(), onClick = { openProfile(request.toUid) }) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Avatar(user?.avatar, user?.displayName.orEmpty(), size = 44.dp)
                                    Spacer(Modifier.width(12.dp))
                                    Column(Modifier.weight(1f)) {
                                        Text(user?.displayName.orEmpty(), style = MaterialTheme.typography.titleSmall)
                                        Text(request.text, style = MaterialTheme.typography.bodySmall, color = AbColors.TextSecondary, maxLines = 2)
                                    }
                                    Pill(stringResource(R.string.chat_pending), color = AbColors.Charcoal4)
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun IncomingRequestCard(request: ChatRequest, onAccept: () -> Unit, onDecline: () -> Unit, onProfile: () -> Unit) {
    GlassCard(Modifier.fillMaxWidth()) {
        Row(Modifier.clickable(onClick = onProfile), verticalAlignment = Alignment.CenterVertically) {
            Avatar(request.senderAvatar, request.senderName, size = 48.dp)
            Spacer(Modifier.width(12.dp))
            Column(Modifier.weight(1f)) {
                Text(request.senderName, style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.SemiBold)
                if (request.senderUsername.isNotBlank()) Text("@${request.senderUsername}", style = MaterialTheme.typography.labelSmall, color = AbColors.TextMuted)
            }
            Text(relativeTime(request.at), style = MaterialTheme.typography.labelSmall, color = AbColors.TextMuted)
        }
        if (request.text.isNotBlank()) {
            Text(request.text, modifier = Modifier.padding(vertical = 10.dp), style = MaterialTheme.typography.bodyMedium)
        }
        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            GradientButton(stringResource(R.string.chat_accept), onClick = onAccept, icon = AbIcons.Check, modifier = Modifier.weight(1f))
            GlassButton(stringResource(R.string.chat_decline), onClick = onDecline, icon = AbIcons.Close, modifier = Modifier.weight(1f))
        }
    }
}

// ============================================================================ New chat

@Composable
fun NewChatScreen(onBack: () -> Unit, startChat: (partnerId: String) -> Unit, viewModel: NewChatViewModel = hiltViewModel()) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    Scaffold(topBar = { AbTopBar(title = stringResource(R.string.chat_new), onBack = onBack) }) { padding ->
        LazyColumn(Modifier.fillMaxSize().padding(padding), contentPadding = PaddingValues(bottom = 24.dp)) {
            item {
                SearchField(
                    query = state.query,
                    onQueryChange = viewModel::onQuery,
                    placeholder = stringResource(R.string.chat_search_people),
                    modifier = Modifier.fillMaxWidth().padding(16.dp),
                )
            }
            if (state.query.trim().length >= 2) {
                if (state.results.isEmpty()) {
                    item { EmptyState(title = stringResource(R.string.chat_no_results), icon = AbIcons.PersonSearch) }
                }
                items(state.results, key = { "r_" + it.id }) { user -> UserRow(user = user, onClick = { startChat(user.id) }) }
            } else {
                if (state.following.isNotEmpty()) item { SectionHeader(stringResource(R.string.chat_following), modifier = Modifier.padding(horizontal = 16.dp)) }
                items(state.following, key = { "f_" + it.id }) { user -> UserRow(user = user, onClick = { startChat(user.id) }) }
            }
        }
    }
}

// ============================================================================ Chat info

@Composable
fun ChatInfoScreen(
    onBack: () -> Unit,
    onDeleted: () -> Unit,
    openProfile: (String) -> Unit,
    openVideo: (String) -> Unit,
    report: (targetType: String, targetId: String) -> Unit,
    viewModel: ChatInfoViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val context = LocalContext.current
    val snackbar = remember { SnackbarHostState() }
    var confirmBlock by remember { mutableStateOf(false) }
    var confirmDelete by remember { mutableStateOf(false) }
    var imageViewer by remember { mutableStateOf<String?>(null) }
    LaunchedEffect(Unit) { viewModel.messages.collect { snackbar.showSnackbar(context.getString(it)) } }
    val partner = state.partner

    Scaffold(topBar = { AbTopBar(title = stringResource(R.string.chat_info), onBack = onBack) }, snackbarHost = { SnackbarHost(snackbar) }) { padding ->
        if (state.loading) {
            LoadingState(Modifier.padding(padding))
            return@Scaffold
        }
        LazyColumn(Modifier.fillMaxSize().padding(padding), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            item {
                Column(Modifier.fillMaxWidth(), horizontalAlignment = Alignment.CenterHorizontally) {
                    Avatar(partner?.avatar, partner?.displayName.orEmpty(), size = 104.dp, online = state.online)
                    Spacer(Modifier.height(10.dp))
                    Text(partner?.displayName.orEmpty(), style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold)
                    Text(partner?.handle.orEmpty(), color = AbColors.TextMuted)
                    if (!partner?.bio.isNullOrBlank()) {
                        Text(partner?.bio.orEmpty(), color = AbColors.TextSecondary, textAlign = TextAlign.Center, modifier = Modifier.padding(top = 8.dp))
                    }
                    GlassButton(
                        stringResource(R.string.chat_view_profile),
                        onClick = { openProfile(viewModel.partnerId) },
                        icon = AbIcons.Person,
                        modifier = Modifier.padding(top = 12.dp),
                    )
                }
            }
            item {
                GlassCard(Modifier.fillMaxWidth()) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        AbIcon(AbIcons.NotificationsOff, null, tint = AbColors.Violet)
                        Text(stringResource(R.string.chat_mute), modifier = Modifier.weight(1f).padding(horizontal = 12.dp))
                        Switch(checked = state.muted, onCheckedChange = { viewModel.toggleMute() })
                    }
                }
            }
            item { SectionHeader(stringResource(R.string.chat_wallpaper)) }
            item {
                LazyRow(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    item {
                        WallpaperSwatch(Brush.verticalGradient(listOf(AbColors.Black, AbColors.Charcoal)), selected = state.wallpaper.isNullOrBlank(), label = stringResource(R.string.chat_wallpaper_default)) {
                            viewModel.setWallpaper(null)
                        }
                    }
                    items(CHAT_WALLPAPERS, key = { it.first }) { (key, colors) ->
                        WallpaperSwatch(Brush.verticalGradient(colors), selected = state.wallpaper == key, label = null) { viewModel.setWallpaper(key) }
                    }
                }
            }
            item { SectionHeader(stringResource(R.string.chat_shared_media)) }
            if (state.media.isEmpty()) {
                item { Text(stringResource(R.string.chat_no_media), color = AbColors.TextMuted) }
            } else {
                items(state.media.chunked(3), key = { row -> row.first().id }) { row ->
                    Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                        row.forEach { m -> SharedMediaTile(m, viewModel, Modifier.weight(1f), onImage = { imageViewer = it }, onVideo = openVideo) }
                        repeat(3 - row.size) { Spacer(Modifier.weight(1f)) }
                    }
                }
            }
            item {
                Column(verticalArrangement = Arrangement.spacedBy(10.dp), modifier = Modifier.padding(top = 12.dp)) {
                    GlassButton(
                        stringResource(if (state.blocked) R.string.chat_unblock else R.string.chat_block),
                        onClick = { if (state.blocked) viewModel.toggleBlock() else confirmBlock = true },
                        icon = AbIcons.Block,
                        contentColor = AbColors.Orange,
                        modifier = Modifier.fillMaxWidth(),
                    )
                    GlassButton(
                        stringResource(R.string.chat_report_user),
                        onClick = { report("user", viewModel.partnerId) },
                        icon = AbIcons.Flag,
                        contentColor = AbColors.Orange,
                        modifier = Modifier.fillMaxWidth(),
                    )
                    GlassButton(
                        stringResource(R.string.chat_delete),
                        onClick = { confirmDelete = true },
                        icon = AbIcons.Delete,
                        contentColor = AbColors.Rose,
                        modifier = Modifier.fillMaxWidth(),
                    )
                }
            }
        }
    }
    if (confirmBlock) {
        ConfirmDialog(
            title = stringResource(R.string.chat_block),
            message = stringResource(R.string.chat_block_confirm, partner?.displayName.orEmpty()),
            onConfirm = {
                confirmBlock = false
                viewModel.toggleBlock()
            },
            onDismiss = { confirmBlock = false },
            destructive = true,
        )
    }
    if (confirmDelete) {
        ConfirmDialog(
            title = stringResource(R.string.chat_delete),
            message = stringResource(R.string.chat_delete_confirm),
            onConfirm = {
                confirmDelete = false
                viewModel.deleteChat(onDeleted)
            },
            onDismiss = { confirmDelete = false },
            destructive = true,
        )
    }
    imageViewer?.let { url -> ZoomableImageDialog(url) { imageViewer = null } }
}

@Composable
private fun WallpaperSwatch(brush: Brush, selected: Boolean, label: String?, onClick: () -> Unit) {
    Box(
        Modifier.size(width = 64.dp, height = 96.dp).clip(RoundedCornerShape(14.dp)).background(brush)
            .border(if (selected) 2.dp else 1.dp, if (selected) AbColors.Cyan else AbColors.Line, RoundedCornerShape(14.dp))
            .clickable(onClick = onClick),
        contentAlignment = Alignment.BottomCenter,
    ) {
        if (label != null) Text(label, style = MaterialTheme.typography.labelSmall, color = AbColors.TextSecondary, modifier = Modifier.padding(6.dp))
        if (selected) {
            Box(Modifier.align(Alignment.TopEnd).padding(6.dp).size(18.dp).clip(CircleShape).background(AbColors.Cyan), contentAlignment = Alignment.Center) {
                AbIcon(AbIcons.Check, null, tint = Color.Black, size = 14.dp)
            }
        }
    }
}

@Composable
private fun SharedMediaTile(message: ChatMessage, viewModel: ChatInfoViewModel, modifier: Modifier, onImage: (String) -> Unit, onVideo: (String) -> Unit) {
    val attachment = message.attachments.first { it.type == "image" || it.type == "video" || it.type == "gif" }
    val url by produceState(initialValue = attachment.src.takeIf { it.startsWith("http") || it.startsWith("data:") }, attachment.src, attachment.storagePath) {
        value = try {
            viewModel.resolveUrl(attachment.src, attachment.storagePath)
        } catch (_: Exception) {
            value
        }
    }
    val model = rememberImageModel(url)
    Box(
        modifier.aspectRatio(1f).clip(RoundedCornerShape(10.dp)).background(AbColors.Charcoal3)
            .clickable(enabled = url != null) { url?.let { if (attachment.type == "video") onVideo(it) else onImage(it) } },
        contentAlignment = Alignment.Center,
    ) {
        if (model != null) AsyncImage(model = model, contentDescription = null, contentScale = ContentScale.Crop, modifier = Modifier.matchParentSize())
        if (attachment.type == "video") AbIcon(AbIcons.PlayArrowFilled, null, tint = Color.White)
    }
}
