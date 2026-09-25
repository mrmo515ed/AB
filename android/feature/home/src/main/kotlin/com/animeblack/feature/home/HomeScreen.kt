package com.animeblack.feature.home

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.material3.pulltorefresh.PullToRefreshBox
import androidx.compose.runtime.Composable
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
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.animeblack.core.designsystem.component.AbIcon
import com.animeblack.core.designsystem.component.AbIconButton
import com.animeblack.core.designsystem.component.Avatar
import com.animeblack.core.designsystem.component.AvatarRing
import com.animeblack.core.designsystem.component.ConfirmDialog
import com.animeblack.core.designsystem.component.EmptyState
import com.animeblack.core.designsystem.component.ErrorState
import com.animeblack.core.designsystem.component.GlassCard
import com.animeblack.core.designsystem.component.OfflineBanner
import com.animeblack.core.designsystem.component.PostSkeleton
import com.animeblack.core.designsystem.icon.AbIcons
import com.animeblack.core.designsystem.theme.AbColors
import com.animeblack.core.designsystem.theme.AbTheme
import com.animeblack.core.model.MediaItem
import com.animeblack.core.model.Post
import com.animeblack.core.model.Story
import com.animeblack.core.ui.PostActions
import com.animeblack.core.ui.PostCard
import com.animeblack.core.ui.messageRes
import com.animeblack.core.ui.shareLink
import com.animeblack.core.ui.shareText
import kotlinx.coroutines.launch

/** Navigation callbacks the home feature needs from the app host. */
data class HomeNavigator(
    val openPost: (String, Boolean) -> Unit,
    val openProfile: (String?) -> Unit,
    val openStory: (String) -> Unit,
    val createStory: () -> Unit,
    val createPost: (String?) -> Unit,
    val openSearch: (String) -> Unit,
    val openNotifications: () -> Unit,
    val openMedia: (MediaItem) -> Unit,
    val report: (String, String) -> Unit,
    val openUrl: (String) -> Unit,
    val openMention: (String) -> Unit,
)

@Composable
fun HomeScreen(navigator: HomeNavigator, viewModel: HomeViewModel = hiltViewModel()) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val snackbar = remember { SnackbarHostState() }
    val context = LocalContext.current
    val listState = rememberLazyListState()
    val scope = rememberCoroutineScope()
    var menuFor by remember { mutableStateOf<Post?>(null) }
    var confirmDelete by remember { mutableStateOf<Post?>(null) }

    LaunchedEffect(Unit) { viewModel.messages.collect { snackbar.showSnackbar(context.getString(it)) } }

    val nearEnd by remember {
        derivedStateOf {
            val last = listState.layoutInfo.visibleItemsInfo.lastOrNull()?.index ?: 0
            last >= listState.layoutInfo.totalItemsCount - 4
        }
    }
    LaunchedEffect(nearEnd, state.feed.posts.size) {
        if (nearEnd && state.feed.initialLoaded && state.feed.hasMore && !state.feed.loadingMore) viewModel.loadMore()
    }

    val myUid = state.me?.id.orEmpty()
    val actions = PostActions(
        onOpen = { navigator.openPost(it.id, false) },
        onAuthor = { navigator.openProfile(it) },
        onLike = viewModel::like,
        onReact = viewModel::react,
        onComment = { navigator.openPost(it.id, true) },
        onShare = { post ->
            viewModel.share(post)
            context.shareText(post.text.take(200) + "\n" + shareLink("post", post.id), context.getString(com.animeblack.core.ui.R.string.ui_share_via))
        },
        onSave = viewModel::save,
        onMenu = { menuFor = it },
        onVote = viewModel::vote,
        onMedia = navigator.openMedia,
        onHashtag = { navigator.openSearch("#$it") },
        onMention = navigator.openMention,
        onUrl = navigator.openUrl,
        onRetry = { viewModel.retryUploads() },
    )

    Scaffold(
        snackbarHost = { SnackbarHost(snackbar) },
        floatingActionButton = {
            FloatingActionButton(onClick = { navigator.createPost(null) }, containerColor = AbColors.Blue, contentColor = Color.White) {
                AbIcon(AbIcons.Add, stringResource(R.string.home_create_post))
            }
        },
        topBar = {
            Row(
                Modifier.fillMaxWidth().background(AbTheme.colors.background).padding(horizontal = 12.dp, vertical = 8.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Text(
                    stringResource(R.string.home_title),
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Black,
                    modifier = Modifier.weight(1f),
                )
                AbIconButton(AbIcons.Search, stringResource(R.string.home_search), onClick = { navigator.openSearch("") })
                AbIconButton(AbIcons.Notifications, stringResource(R.string.home_notifications), onClick = navigator.openNotifications, badgeCount = state.unreadNotifications)
            }
        },
    ) { padding ->
        Column(Modifier.padding(padding).fillMaxSize()) {
            OfflineBanner(visible = !state.online)
            PullToRefreshBox(
                isRefreshing = false,
                onRefresh = { scope.launch { listState.animateScrollToItem(0) } },
                modifier = Modifier.fillMaxSize(),
            ) {
                LazyColumn(
                    state = listState,
                    contentPadding = PaddingValues(bottom = 96.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp),
                    modifier = Modifier.fillMaxSize(),
                    horizontalAlignment = Alignment.CenterHorizontally,
                ) {
                    item(key = "stories") {
                        StoriesRow(stories = state.stories, myUid = myUid, myAvatar = state.me?.avatar.orEmpty(), myName = state.me?.displayName.orEmpty(), onOpen = navigator.openStory, onCreate = navigator.createStory)
                    }
                    item(key = "composer") {
                        ComposerPrompt(avatar = state.me?.avatar.orEmpty(), name = state.me?.displayName.orEmpty(), onClick = { navigator.createPost(null) })
                    }
                    when {
                        state.error != null && state.feed.posts.isEmpty() -> item(key = "error") {
                            ErrorState(stringResource(state.error!!.messageRes()), onRetry = { viewModel.clearError() })
                        }
                        !state.feed.initialLoaded -> items(3, key = { "sk$it" }) {
                            PostSkeleton(Modifier.widthIn(max = 720.dp).padding(horizontal = 12.dp))
                        }
                        state.feed.posts.isEmpty() -> item(key = "empty") {
                            EmptyState(
                                title = stringResource(R.string.home_empty_title),
                                message = stringResource(R.string.home_empty_message),
                                icon = AbIcons.Forum,
                                actionLabel = stringResource(R.string.home_create_post),
                                onAction = { navigator.createPost(null) },
                            )
                        }
                        else -> {
                            items(state.feed.posts, key = { it.id }, contentType = { "post" }) { post ->
                                PostCard(
                                    post = post,
                                    myUid = myUid,
                                    saved = post.id in state.savedIds,
                                    actions = actions,
                                    autoplayVideo = state.autoplay,
                                    modifier = Modifier.widthIn(max = 720.dp).padding(horizontal = 12.dp).animateItem(),
                                )
                            }
                            item(key = "footer") {
                                Box(Modifier.fillMaxWidth().padding(20.dp), contentAlignment = Alignment.Center) {
                                    if (state.feed.loadingMore) {
                                        CircularProgressIndicator(Modifier.size(28.dp), color = AbColors.Cyan)
                                    } else if (!state.feed.hasMore) {
                                        Text(stringResource(R.string.home_end), color = AbTheme.colors.textMuted, style = MaterialTheme.typography.labelMedium)
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    menuFor?.let { post ->
        PostMenu(
            post = post,
            isMine = post.authorId == myUid,
            isModerator = state.me?.isModerator == true,
            onDismiss = { menuFor = null },
            onEdit = { navigator.createPost(post.id) },
            onDelete = { confirmDelete = post },
            onHide = { viewModel.hide(post) },
            onReport = { navigator.report("post", post.id) },
            onCopy = { copyToClipboard(context, post.text) },
        )
    }
    confirmDelete?.let { post ->
        ConfirmDialog(
            title = stringResource(com.animeblack.core.ui.R.string.ui_delete),
            message = stringResource(R.string.post_delete_confirm),
            destructive = true,
            onConfirm = {
                viewModel.delete(post)
                confirmDelete = null
            },
            onDismiss = { confirmDelete = null },
        )
    }
}

internal fun copyToClipboard(context: Context, text: String) {
    val cm = context.getSystemService(Context.CLIPBOARD_SERVICE) as? ClipboardManager ?: return
    cm.setPrimaryClip(ClipData.newPlainText("Anime Black", text))
}

@Composable
internal fun PostMenu(
    post: Post,
    isMine: Boolean,
    isModerator: Boolean,
    onDismiss: () -> Unit,
    onEdit: () -> Unit,
    onDelete: () -> Unit,
    onHide: () -> Unit,
    onReport: () -> Unit,
    onCopy: () -> Unit,
) {
    Box(Modifier.fillMaxWidth().padding(end = 16.dp), contentAlignment = Alignment.TopEnd) {
        DropdownMenu(expanded = true, onDismissRequest = onDismiss) {
            if (post.text.isNotBlank()) {
                DropdownMenuItem(text = { Text(stringResource(R.string.post_copy_text)) }, leadingIcon = { AbIcon(AbIcons.ContentCopy, null, size = 20.dp) }, onClick = { onCopy(); onDismiss() })
            }
            if (isMine) {
                DropdownMenuItem(text = { Text(stringResource(com.animeblack.core.ui.R.string.ui_edit)) }, leadingIcon = { AbIcon(AbIcons.Edit, null, size = 20.dp) }, onClick = { onEdit(); onDismiss() })
            }
            if (isMine || isModerator) {
                DropdownMenuItem(text = { Text(stringResource(com.animeblack.core.ui.R.string.ui_delete), color = AbColors.Rose) }, leadingIcon = { AbIcon(AbIcons.Delete, null, tint = AbColors.Rose, size = 20.dp) }, onClick = { onDelete(); onDismiss() })
            }
            if (!isMine) {
                DropdownMenuItem(text = { Text(stringResource(R.string.post_hide)) }, leadingIcon = { AbIcon(AbIcons.VisibilityOff, null, size = 20.dp) }, onClick = { onHide(); onDismiss() })
                DropdownMenuItem(text = { Text(stringResource(R.string.post_menu_report)) }, leadingIcon = { AbIcon(AbIcons.Flag, null, size = 20.dp) }, onClick = { onReport(); onDismiss() })
            }
        }
    }
}

@Composable
private fun ComposerPrompt(avatar: String, name: String, onClick: () -> Unit) {
    GlassCard(modifier = Modifier.widthIn(max = 720.dp).padding(horizontal = 12.dp), onClick = onClick, contentPadding = 12.dp) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Avatar(avatar, name, size = 38.dp)
            Spacer(Modifier.width(10.dp))
            Text(stringResource(R.string.home_whats_on_mind), color = AbTheme.colors.textMuted, modifier = Modifier.weight(1f))
            AbIcon(AbIcons.Image, null, tint = AbColors.Emerald, size = 22.dp)
        }
    }
}

@Composable
private fun StoriesRow(stories: List<Story>, myUid: String, myAvatar: String, myName: String, onOpen: (String) -> Unit, onCreate: () -> Unit) {
    val mine = stories.firstOrNull { it.userId == myUid }
    LazyRow(contentPadding = PaddingValues(horizontal = 12.dp, vertical = 8.dp), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
        item(key = "me") {
            Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.width(72.dp)) {
                Box {
                    Avatar(
                        url = myAvatar,
                        name = myName,
                        size = 66.dp,
                        ring = if (mine != null) AvatarRing.StoryUnseen else AvatarRing.None,
                        onClick = { if (mine != null) onOpen(myUid) else onCreate() },
                    )
                    Box(
                        Modifier.align(Alignment.BottomEnd).size(22.dp).clip(CircleShape).background(AbColors.Blue).border(2.dp, Color.Black, CircleShape).clickable(onClick = onCreate),
                        contentAlignment = Alignment.Center,
                    ) { AbIcon(AbIcons.Add, stringResource(R.string.story_create), tint = Color.White, size = 16.dp) }
                }
                Spacer(Modifier.height(4.dp))
                Text(stringResource(R.string.home_your_story), style = MaterialTheme.typography.labelSmall, maxLines = 1)
            }
        }
        items(stories.filter { it.userId != myUid }, key = { it.id }) { story ->
            Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.width(72.dp)) {
                Avatar(
                    url = story.userAvatar,
                    name = story.userName,
                    size = 66.dp,
                    ring = if (story.seenBy(myUid)) AvatarRing.StorySeen else AvatarRing.StoryUnseen,
                    onClick = { onOpen(story.userId) },
                )
                Spacer(Modifier.height(4.dp))
                Text(story.userName, style = MaterialTheme.typography.labelSmall, maxLines = 1, overflow = TextOverflow.Ellipsis)
            }
        }
    }
}
