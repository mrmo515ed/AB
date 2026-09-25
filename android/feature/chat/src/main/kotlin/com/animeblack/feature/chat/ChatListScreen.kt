package com.animeblack.feature.chat

import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.annotation.DrawableRes
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.combinedClickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.defaultMinSize
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.animeblack.core.designsystem.component.AbIcon
import com.animeblack.core.designsystem.component.AbIconButton
import com.animeblack.core.designsystem.component.AbTopBar
import com.animeblack.core.designsystem.component.Avatar
import com.animeblack.core.designsystem.component.ConfirmDialog
import com.animeblack.core.designsystem.component.EmptyState
import com.animeblack.core.designsystem.component.LoadingState
import com.animeblack.core.designsystem.component.SearchField
import com.animeblack.core.designsystem.component.VerifiedBadge
import com.animeblack.core.designsystem.icon.AbIcons
import com.animeblack.core.designsystem.theme.AbColors
import com.animeblack.core.ui.relativeTime

data class ChatListActions(
    val openChat: (chatId: String, partnerId: String) -> Unit,
    val newChat: () -> Unit,
    val openRequests: () -> Unit,
)

@Composable
fun ChatListScreen(actions: ChatListActions, viewModel: ChatListViewModel = hiltViewModel()) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val query by viewModel.query.collectAsStateWithLifecycle()
    val showArchived by viewModel.showArchived.collectAsStateWithLifecycle()
    val context = LocalContext.current
    val snackbar = remember { SnackbarHostState() }
    var menuFor by remember { mutableStateOf<ConversationItem?>(null) }
    var confirmDelete by remember { mutableStateOf<ConversationItem?>(null) }
    LaunchedEffect(Unit) { viewModel.messages.collect { snackbar.showSnackbar(context.getString(it)) } }

    Scaffold(
        topBar = {
            AbTopBar(
                title = if (showArchived) stringResource(R.string.chat_archived, state.archived.size) else stringResource(R.string.chat_title),
                onBack = if (showArchived) ({ viewModel.showArchived.value = false }) else null,
                actions = {
                    AbIconButton(
                        AbIcons.MarkChatUnread,
                        stringResource(R.string.chat_requests),
                        onClick = actions.openRequests,
                        badgeCount = state.requestsCount,
                    )
                },
            )
        },
        floatingActionButton = {
            FloatingActionButton(onClick = actions.newChat, containerColor = AbColors.Purple, contentColor = Color.White) {
                AbIcon(AbIcons.Edit, stringResource(R.string.chat_new))
            }
        },
        snackbarHost = { SnackbarHost(snackbar) },
    ) { padding ->
        Column(Modifier.fillMaxSize().padding(padding)) {
            SearchField(
                query = query,
                onQueryChange = { viewModel.query.value = it },
                placeholder = stringResource(R.string.chat_search),
                modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 8.dp),
            )
            val list = if (showArchived) state.archived else state.items
            when {
                state.loading -> LoadingState()
                list.isEmpty() && state.archived.isEmpty() -> EmptyState(
                    title = stringResource(R.string.chat_empty),
                    message = stringResource(R.string.chat_empty_hint),
                    icon = AbIcons.ChatBubble,
                    actionLabel = stringResource(R.string.chat_new),
                    onAction = actions.newChat,
                )
                else -> LazyColumn(contentPadding = PaddingValues(bottom = 96.dp)) {
                    if (!showArchived && state.archived.isNotEmpty()) {
                        item(key = "archived") {
                            Row(
                                Modifier.fillMaxWidth().combinedClickable(onClick = { viewModel.showArchived.value = true }).padding(horizontal = 20.dp, vertical = 12.dp),
                                verticalAlignment = Alignment.CenterVertically,
                            ) {
                                AbIcon(AbIcons.Archive, null, tint = AbColors.TextSecondary)
                                Spacer(Modifier.width(16.dp))
                                Text(stringResource(R.string.chat_archived, state.archived.size), color = AbColors.TextSecondary)
                            }
                        }
                    }
                    items(list, key = { it.conversation.id }) { item ->
                        ConversationRow(
                            item = item,
                            myUid = state.myUid,
                            onClick = { actions.openChat(item.conversation.id, item.conversation.partnerId) },
                            onLongClick = { menuFor = item },
                            modifier = Modifier.animateItem(),
                        )
                    }
                }
            }
        }
    }

    menuFor?.let { item ->
        val id = item.conversation.id
        ModalBottomSheet(onDismissRequest = { menuFor = null }, containerColor = AbColors.Charcoal2) {
            Column(Modifier.fillMaxWidth().navigationBarsPadding().padding(bottom = 12.dp)) {
                Text(
                    item.partner?.displayName.orEmpty(),
                    style = MaterialTheme.typography.titleMedium,
                    modifier = Modifier.padding(horizontal = 20.dp, vertical = 8.dp),
                )
                SheetRow(if (item.pinned) AbIcons.PushPin else AbIcons.PushPinFilled, stringResource(if (item.pinned) R.string.chat_unpin else R.string.chat_pin)) {
                    viewModel.togglePin(id)
                    menuFor = null
                }
                SheetRow(if (item.muted) AbIcons.NotificationsActive else AbIcons.NotificationsOff, stringResource(if (item.muted) R.string.chat_unmute else R.string.chat_mute)) {
                    viewModel.toggleMute(id)
                    menuFor = null
                }
                SheetRow(AbIcons.Archive, stringResource(if (showArchived) R.string.chat_unarchive else R.string.chat_archive)) {
                    viewModel.toggleArchive(id)
                    menuFor = null
                }
                SheetRow(AbIcons.Delete, stringResource(R.string.chat_delete), AbColors.Rose) {
                    confirmDelete = item
                    menuFor = null
                }
            }
        }
    }
    confirmDelete?.let { item ->
        ConfirmDialog(
            title = stringResource(R.string.chat_delete),
            message = stringResource(R.string.chat_delete_confirm),
            onConfirm = {
                viewModel.delete(item.conversation.id)
                confirmDelete = null
            },
            onDismiss = { confirmDelete = null },
            destructive = true,
        )
    }
}

@OptIn(ExperimentalFoundationApi::class)
@Composable
private fun ConversationRow(item: ConversationItem, myUid: String, onClick: () -> Unit, onLongClick: () -> Unit, modifier: Modifier = Modifier) {
    val c = item.conversation
    val partner = item.partner
    val name = partner?.displayName ?: "…"
    Row(
        modifier.fillMaxWidth().combinedClickable(onClick = onClick, onLongClick = onLongClick).padding(horizontal = 16.dp, vertical = 10.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Avatar(partner?.avatar, name, size = 54.dp, online = item.online)
        Spacer(Modifier.width(12.dp))
        Column(Modifier.weight(1f)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(name, style = MaterialTheme.typography.titleSmall, fontWeight = if (item.unread > 0) FontWeight.Bold else FontWeight.Medium, maxLines = 1, overflow = TextOverflow.Ellipsis, modifier = Modifier.weight(1f, fill = false))
                if (partner?.showsVerifiedBadge == true) VerifiedBadge(gold = partner.isGoldVerified, size = 14.dp, modifier = Modifier.padding(start = 4.dp))
                if (item.pinned) AbIcon(AbIcons.PushPinFilled, null, tint = AbColors.TextMuted, size = 14.dp, modifier = Modifier.padding(start = 4.dp))
                if (item.muted) AbIcon(AbIcons.NotificationsOff, stringResource(R.string.chat_muted), tint = AbColors.TextMuted, size = 14.dp, modifier = Modifier.padding(start = 4.dp))
                Spacer(Modifier.weight(1f))
                Text(relativeTime(c.lastAt), style = MaterialTheme.typography.labelSmall, color = if (item.unread > 0) AbColors.Cyan else AbColors.TextMuted)
            }
            Row(verticalAlignment = Alignment.CenterVertically) {
                val preview = when {
                    item.typing -> stringResource(R.string.chat_typing)
                    item.draft != null -> stringResource(R.string.chat_draft, item.draft)
                    c.lastSenderId == myUid && c.lastMessage.isNotBlank() -> stringResource(R.string.chat_you, c.lastMessage)
                    else -> c.lastMessage
                }
                Text(
                    preview,
                    style = MaterialTheme.typography.bodySmall,
                    color = when {
                        item.typing -> AbColors.Emerald
                        item.draft != null -> AbColors.Orange
                        item.unread > 0 -> AbColors.TextPrimary
                        else -> AbColors.TextSecondary
                    },
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                    modifier = Modifier.weight(1f),
                )
                if (item.unread > 0) {
                    Box(
                        Modifier.padding(start = 8.dp).defaultMinSize(minWidth = 22.dp).clip(CircleShape)
                            .background(if (item.muted) AbColors.Charcoal4 else AbColors.Purple).padding(horizontal = 6.dp, vertical = 2.dp),
                        contentAlignment = Alignment.Center,
                    ) {
                        Text(if (item.unread > 99) "99+" else item.unread.toString(), color = Color.White, style = MaterialTheme.typography.labelSmall)
                    }
                }
            }
        }
    }
}

@Composable
internal fun SheetRow(@DrawableRes icon: Int, label: String, tint: Color = AbColors.TextPrimary, onClick: () -> Unit) {
    Row(
        Modifier.fillMaxWidth().clickable(onClick = onClick).padding(horizontal = 20.dp, vertical = 14.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        AbIcon(icon, null, tint = tint, size = 22.dp)
        Spacer(Modifier.width(16.dp))
        Text(label, color = tint, style = MaterialTheme.typography.bodyLarge)
    }
}
