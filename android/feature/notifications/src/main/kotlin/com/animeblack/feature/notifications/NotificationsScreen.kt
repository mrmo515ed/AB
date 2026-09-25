package com.animeblack.feature.notifications

import android.text.format.DateUtils
import androidx.annotation.DrawableRes
import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.background
import androidx.compose.foundation.combinedClickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewModelScope
import androidx.navigation.NavController
import androidx.navigation.NavGraphBuilder
import androidx.navigation.compose.composable
import com.animeblack.core.data.repository.NotificationRepository
import com.animeblack.core.designsystem.component.AbIcon
import com.animeblack.core.designsystem.component.AbIconButton
import com.animeblack.core.designsystem.component.AbTopBar
import com.animeblack.core.designsystem.component.Avatar
import com.animeblack.core.designsystem.component.EmptyState
import com.animeblack.core.designsystem.component.GlassCard
import com.animeblack.core.designsystem.component.LoadingState
import com.animeblack.core.designsystem.component.SectionHeader
import com.animeblack.core.designsystem.icon.AbIcons
import com.animeblack.core.designsystem.theme.AbColors
import com.animeblack.core.model.AppNotification
import com.animeblack.core.model.Broadcast
import com.animeblack.core.navigation.ChatRoomRoute
import com.animeblack.core.navigation.DeepLinkParser
import com.animeblack.core.navigation.GroupRoomRoute
import com.animeblack.core.navigation.NotificationsRoute
import com.animeblack.core.navigation.PostDetailRoute
import com.animeblack.core.navigation.ProfileRoute
import com.animeblack.core.navigation.StoryViewerRoute
import com.animeblack.core.ui.relativeTime
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

data class NotificationsUiState(
    val loading: Boolean = true,
    val notifications: List<AppNotification> = emptyList(),
    val broadcasts: List<Broadcast> = emptyList(),
) {
    val unread: Int get() = notifications.count { !it.read }
}

@HiltViewModel
class NotificationsViewModel @Inject constructor(private val repository: NotificationRepository) : ViewModel() {
    val state: StateFlow<NotificationsUiState> = combine(repository.observeNotifications(), repository.observeBroadcasts()) { n, b ->
        NotificationsUiState(false, n.sortedByDescending { it.at }, b.sortedByDescending { it.at }.take(3))
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), NotificationsUiState())

    fun open(n: AppNotification) = viewModelScope.launch { if (!n.read) repository.markRead(n.id) }
    fun markAllRead() = viewModelScope.launch { repository.markAllRead() }
    fun delete(n: AppNotification) = viewModelScope.launch { repository.delete(n.id) }
}

/** Where a notification leads (post, profile, chat, group, deep link). Pure — unit tested. */
fun routeFor(n: AppNotification): Any? {
    n.postId?.takeIf { it.isNotBlank() }?.let { return PostDetailRoute(it, focusComment = n.type == "comment" || n.type == "mention") }
    val link = n.link.orEmpty()
    if (link.isNotBlank()) {
        val colon = link.indexOf(':')
        if (colon > 0 && !link.startsWith("http") && !link.startsWith("animeblack")) {
            val kind = link.substring(0, colon)
            val id = link.substring(colon + 1)
            DeepLinkParser.parse("/?go=$kind&id=$id")?.let { return it }
        } else {
            DeepLinkParser.parse(link)?.let { return it }
        }
    }
    return when (n.type) {
        "message", "chat" -> n.fromUserId.takeIf { it.isNotBlank() }?.let { ChatRoomRoute(partnerId = it) }
        "story_react", "story_reply" -> n.fromUserId.takeIf { it.isNotBlank() }?.let { StoryViewerRoute(n.userId) }
        "group_join_request" -> null
        else -> n.fromUserId.takeIf { it.isNotBlank() }?.let { ProfileRoute(it) }
    }
}

@DrawableRes
private fun iconFor(type: String): Int = when (type) {
    "follow" -> AbIcons.PersonAdd
    "like", "reaction" -> AbIcons.FavoriteFilled
    "comment", "reply" -> AbIcons.ChatBubble
    "mention" -> AbIcons.AlternateEmail
    "story_react", "story_reply" -> AbIcons.AutoStories
    "message", "chat" -> AbIcons.Chat
    "group_join_request", "group" -> AbIcons.GroupAdd
    "reward", "economy", "transfer" -> AbIcons.Paid
    else -> AbIcons.Campaign
}

private fun tintFor(type: String): Color = when (type) {
    "follow" -> AbColors.Cyan
    "like", "reaction" -> AbColors.Rose
    "comment", "reply", "mention" -> AbColors.Violet
    "reward", "economy", "transfer" -> AbColors.Gold
    else -> AbColors.Blue
}

@OptIn(ExperimentalFoundationApi::class)
@Composable
fun NotificationsScreen(onBack: () -> Unit, navigate: (Any) -> Unit, viewModel: NotificationsViewModel = hiltViewModel()) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    var deleting by remember { mutableStateOf<String?>(null) }
    Scaffold(
        topBar = {
            AbTopBar(
                title = stringResource(R.string.notif_title),
                subtitle = if (state.unread > 0) stringResource(R.string.notif_unread, state.unread) else null,
                onBack = onBack,
                actions = { if (state.unread > 0) AbIconButton(AbIcons.DoneAll, stringResource(R.string.notif_mark_all), onClick = viewModel::markAllRead) },
            )
        },
    ) { padding ->
        when {
            state.loading -> LoadingState(Modifier.padding(padding))
            state.notifications.isEmpty() && state.broadcasts.isEmpty() -> EmptyState(
                title = stringResource(R.string.notif_empty),
                message = stringResource(R.string.notif_empty_hint),
                icon = AbIcons.NotificationsActive,
                modifier = Modifier.padding(padding),
            )
            else -> LazyColumn(Modifier.fillMaxSize().padding(padding), contentPadding = PaddingValues(bottom = 24.dp)) {
                items(state.broadcasts, key = { "b_" + it.id }) { b ->
                    GlassCard(Modifier.fillMaxWidth().padding(horizontal = 12.dp, vertical = 6.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            AbIcon(AbIcons.Campaign, null, tint = AbColors.Gold)
                            Spacer(Modifier.width(8.dp))
                            Text(b.title.ifBlank { stringResource(R.string.notif_announcement) }, style = MaterialTheme.typography.titleSmall, modifier = Modifier.weight(1f))
                            Text(relativeTime(b.at), style = MaterialTheme.typography.labelSmall, color = AbColors.TextMuted)
                        }
                        Text(b.message, color = AbColors.TextSecondary, modifier = Modifier.padding(top = 6.dp))
                    }
                }
                val (today, earlier) = state.notifications.partition { DateUtils.isToday(it.at) }
                if (today.isNotEmpty()) {
                    item(key = "h_today") { SectionHeader(stringResource(R.string.notif_today), modifier = Modifier.padding(horizontal = 16.dp)) }
                    items(today, key = { it.id }) { n -> NotificationRow(n, deleting == n.id, onOpen = { viewModel.open(n); routeFor(n)?.let(navigate) }, onLongPress = { deleting = if (deleting == n.id) null else n.id }, onDelete = { viewModel.delete(n); deleting = null }) }
                }
                if (earlier.isNotEmpty()) {
                    item(key = "h_earlier") { SectionHeader(stringResource(R.string.notif_earlier), modifier = Modifier.padding(horizontal = 16.dp)) }
                    items(earlier, key = { it.id }) { n -> NotificationRow(n, deleting == n.id, onOpen = { viewModel.open(n); routeFor(n)?.let(navigate) }, onLongPress = { deleting = if (deleting == n.id) null else n.id }, onDelete = { viewModel.delete(n); deleting = null }) }
                }
            }
        }
    }
}

@OptIn(ExperimentalFoundationApi::class)
@Composable
private fun NotificationRow(n: AppNotification, showDelete: Boolean, onOpen: () -> Unit, onLongPress: () -> Unit, onDelete: () -> Unit) {
    Row(
        Modifier.fillMaxWidth()
            .background(if (n.read) Color.Transparent else AbColors.DeepPurple.copy(alpha = 0.12f))
            .combinedClickable(onClick = onOpen, onLongClick = onLongPress)
            .padding(horizontal = 16.dp, vertical = 12.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Box {
            Avatar(n.fromUserAvatar, n.fromUserName.ifBlank { "A" }, size = 48.dp)
            Box(
                Modifier.align(Alignment.BottomEnd).offset(x = 4.dp, y = 4.dp).size(22.dp).clip(CircleShape).background(AbColors.Charcoal),
                contentAlignment = Alignment.Center,
            ) { AbIcon(iconFor(n.type), null, tint = tintFor(n.type), size = 14.dp) }
        }
        Spacer(Modifier.width(12.dp))
        Column(Modifier.weight(1f)) {
            Text(n.title.ifBlank { n.fromUserName }, style = MaterialTheme.typography.bodyMedium, fontWeight = if (n.read) FontWeight.Normal else FontWeight.SemiBold, maxLines = 2)
            if (n.body.isNotBlank()) Text(n.body, style = MaterialTheme.typography.bodySmall, color = AbColors.TextSecondary, maxLines = 2)
            Text(relativeTime(n.at), style = MaterialTheme.typography.labelSmall, color = AbColors.TextMuted)
        }
        if (showDelete) {
            AbIconButton(AbIcons.Delete, stringResource(R.string.notif_delete), onClick = onDelete, tint = AbColors.Rose)
        } else if (!n.read) {
            Box(Modifier.size(9.dp).clip(CircleShape).background(AbColors.Cyan))
        }
    }
}

fun NavGraphBuilder.notificationsGraph(navController: NavController) {
    composable<NotificationsRoute> {
        NotificationsScreen(onBack = { navController.popBackStack() }, navigate = { navController.navigate(it) })
    }
}
