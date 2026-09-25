package com.animeblack.feature.reels

import androidx.annotation.DrawableRes
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.scaleIn
import androidx.compose.animation.scaleOut
import androidx.compose.foundation.background
import androidx.compose.foundation.basicMarquee
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.pager.VerticalPager
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.material3.TextField
import androidx.compose.material3.TextFieldDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.compose.LocalLifecycleOwner
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import coil3.compose.AsyncImage
import com.animeblack.core.designsystem.component.AbIcon
import com.animeblack.core.designsystem.component.AbIconButton
import com.animeblack.core.designsystem.component.Avatar
import com.animeblack.core.designsystem.component.ConfirmDialog
import com.animeblack.core.designsystem.component.EmptyState
import com.animeblack.core.designsystem.component.LoadingState
import com.animeblack.core.designsystem.icon.AbIcons
import com.animeblack.core.designsystem.theme.AbColors
import com.animeblack.core.model.Reel
import com.animeblack.core.ui.CommentItem
import com.animeblack.core.ui.LinkifiedText
import com.animeblack.core.ui.VideoPlayer
import com.animeblack.core.ui.compactCount
import com.animeblack.core.ui.shareLink
import com.animeblack.core.ui.shareText
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

data class ReelsActions(
    val create: () -> Unit,
    val openProfile: (String) -> Unit,
    val openMention: (String) -> Unit,
    val openHashtag: (String) -> Unit,
    val report: (targetType: String, targetId: String) -> Unit,
    /** Non-null when opened as a standalone viewer (deep link / profile). */
    val onBack: (() -> Unit)? = null,
)

@Composable
fun ReelsScreen(actions: ReelsActions, viewModel: ReelsViewModel = hiltViewModel()) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val commentsReel by viewModel.comments.collectAsStateWithLifecycle()
    val context = LocalContext.current
    val snackbar = remember { SnackbarHostState() }
    var confirmDelete by remember { mutableStateOf<Reel?>(null) }
    val lifecycle = LocalLifecycleOwner.current.lifecycle
    val lifecycleState by lifecycle.currentStateFlow.collectAsState()
    val resumed = lifecycleState.isAtLeast(Lifecycle.State.RESUMED)
    LaunchedEffect(Unit) { viewModel.messages.collect { snackbar.showSnackbar(context.getString(it)) } }

    Box(Modifier.fillMaxSize().background(Color.Black)) {
        when {
            state.loading -> LoadingState()
            state.reels.isEmpty() -> EmptyState(
                title = stringResource(if (state.notFound) R.string.reels_not_found else R.string.reels_empty),
                message = stringResource(R.string.reels_empty_hint),
                icon = AbIcons.MovieFilter,
                actionLabel = stringResource(R.string.reels_create),
                onAction = actions.create,
            )
            else -> {
                val pagerState = rememberPagerState { state.reels.size }
                var positioned by remember { mutableStateOf(false) }
                LaunchedEffect(state.initialPage) {
                    if (!positioned && state.initialPage > 0) pagerState.scrollToPage(state.initialPage)
                    positioned = true
                }
                LaunchedEffect(pagerState.currentPage, state.reels.size) {
                    state.reels.getOrNull(pagerState.currentPage)?.let { viewModel.onVisible(it) }
                }
                VerticalPager(
                    state = pagerState,
                    beyondViewportPageCount = 1,
                    key = { page -> state.reels.getOrNull(page)?.id ?: page },
                    modifier = Modifier.fillMaxSize(),
                ) { page ->
                    val reel = state.reels[page]
                    ReelPage(
                        reel = reel,
                        active = page == pagerState.currentPage && resumed && commentsReel == null,
                        liked = reel.isLikedBy(state.myUid),
                        canDelete = reel.authorId == state.myUid || state.isModerator,
                        onLike = { viewModel.toggleLike(reel) },
                        onComments = { viewModel.commentsFor.value = reel.id },
                        onShare = {
                            viewModel.share(reel)
                            context.shareText(reel.caption.take(150) + "\n" + shareLink("reel", reel.id), context.getString(com.animeblack.core.ui.R.string.ui_share_via))
                        },
                        onDelete = { confirmDelete = reel },
                        onReport = { actions.report("reel", reel.id) },
                        actions = actions,
                    )
                }
            }
        }
        Row(
            Modifier.align(Alignment.TopCenter).fillMaxWidth().statusBarsPadding().padding(horizontal = 8.dp, vertical = 4.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            actions.onBack?.let { back -> AbIconButton(AbIcons.ArrowBack, stringResource(com.animeblack.core.designsystem.R.string.ab_back), onClick = back, tint = Color.White) }
            Text(
                stringResource(R.string.reels_title),
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold,
                color = Color.White,
                modifier = Modifier.weight(1f).padding(horizontal = 8.dp),
            )
            AbIconButton(AbIcons.Videocam, stringResource(R.string.reels_create), onClick = actions.create, tint = Color.White)
        }
        SnackbarHost(snackbar, Modifier.align(Alignment.BottomCenter).navigationBarsPadding())
    }

    commentsReel?.let { reel ->
        CommentsSheet(
            reel = reel,
            onDismiss = { viewModel.commentsFor.value = null },
            onSend = { text, done -> viewModel.comment(reel.id, text, done) },
            actions = actions,
        )
    }
    confirmDelete?.let { reel ->
        ConfirmDialog(
            title = stringResource(R.string.reels_delete),
            message = stringResource(R.string.reels_delete_confirm),
            onConfirm = {
                viewModel.delete(reel)
                confirmDelete = null
            },
            onDismiss = { confirmDelete = null },
            destructive = true,
        )
    }
}

@Composable
private fun ReelPage(
    reel: Reel,
    active: Boolean,
    liked: Boolean,
    canDelete: Boolean,
    onLike: () -> Unit,
    onComments: () -> Unit,
    onShare: () -> Unit,
    onDelete: () -> Unit,
    onReport: () -> Unit,
    actions: ReelsActions,
) {
    var paused by remember(reel.id) { mutableStateOf(false) }
    var heart by remember { mutableStateOf(false) }
    var expanded by remember(reel.id) { mutableStateOf(false) }
    val scope = rememberCoroutineScope()
    Box(
        Modifier
            .fillMaxSize()
            .background(Brush.verticalGradient(listOf(AbColors.parse(reel.color1), AbColors.parse(reel.color2))))
            .pointerInput(reel.id) {
                detectTapGestures(
                    onTap = { paused = !paused },
                    onDoubleTap = {
                        if (!liked) onLike()
                        scope.launch {
                            heart = true
                            delay(700)
                            heart = false
                        }
                    },
                )
            },
    ) {
        if (reel.coverUrl.startsWith("http")) {
            AsyncImage(model = reel.coverUrl, contentDescription = null, contentScale = ContentScale.Crop, modifier = Modifier.fillMaxSize())
        }
        if (active || paused) {
            VideoPlayer(url = reel.videoUrl, modifier = Modifier.fillMaxSize(), playing = active && !paused, loop = true, fill = true)
        }
        Box(Modifier.align(Alignment.BottomCenter).fillMaxWidth().height(320.dp).background(Brush.verticalGradient(listOf(Color.Transparent, Color(0xCC000000)))))
        if (paused) {
            Box(Modifier.align(Alignment.Center).size(72.dp).clip(RoundedCornerShape(36.dp)).background(Color(0x66000000)), contentAlignment = Alignment.Center) {
                AbIcon(AbIcons.PlayArrowFilled, stringResource(R.string.reels_paused), tint = Color.White, size = 44.dp)
            }
        }
        AnimatedVisibility(heart, enter = scaleIn() + fadeIn(), exit = scaleOut() + fadeOut(), modifier = Modifier.align(Alignment.Center)) {
            AbIcon(AbIcons.FavoriteFilled, null, tint = AbColors.Rose, size = 110.dp)
        }
        Column(
            Modifier.align(Alignment.BottomEnd).navigationBarsPadding().padding(end = 8.dp, bottom = 96.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(18.dp),
        ) {
            ReelAction(if (liked) AbIcons.FavoriteFilled else AbIcons.Favorite, compactCount(reel.likes), stringResource(R.string.reels_like), if (liked) AbColors.Rose else Color.White, onLike)
            ReelAction(AbIcons.ChatBubble, compactCount(reel.totalComments), stringResource(R.string.reels_comments), Color.White, onComments)
            ReelAction(AbIcons.Share, compactCount(reel.shares), stringResource(R.string.reels_share), Color.White, onShare)
            if (canDelete) {
                ReelAction(AbIcons.Delete, "", stringResource(R.string.reels_delete), Color.White, onDelete)
            } else {
                ReelAction(AbIcons.Flag, "", stringResource(R.string.reels_report), Color.White, onReport)
            }
        }
        Column(
            Modifier.align(Alignment.BottomStart).fillMaxWidth(0.8f).navigationBarsPadding().padding(start = 14.dp, bottom = 96.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            Row(Modifier.clickable { actions.openProfile(reel.authorId) }, verticalAlignment = Alignment.CenterVertically) {
                Avatar(reel.authorAvatar, reel.authorName, size = 38.dp)
                Spacer(Modifier.width(8.dp))
                Text(reel.authorName, color = Color.White, style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.Bold)
            }
            if (reel.caption.isNotBlank()) {
                LinkifiedText(
                    text = reel.caption,
                    color = Color.White,
                    style = MaterialTheme.typography.bodyMedium,
                    maxLines = if (expanded) 12 else 2,
                    onMention = actions.openMention,
                    onHashtag = actions.openHashtag,
                    modifier = Modifier.clickable { expanded = !expanded },
                )
            }
            Row(verticalAlignment = Alignment.CenterVertically) {
                AbIcon(AbIcons.MusicNote, null, tint = Color.White, size = 16.dp)
                Spacer(Modifier.width(6.dp))
                Text(
                    reel.music.ifBlank { stringResource(R.string.reels_original_audio) } + "  •  " + stringResource(R.string.reels_views, compactCount(reel.views)),
                    color = Color.White.copy(alpha = 0.85f),
                    style = MaterialTheme.typography.labelMedium,
                    maxLines = 1,
                    modifier = Modifier.basicMarquee(),
                )
            }
        }
    }
}

@Composable
private fun ReelAction(@DrawableRes icon: Int, count: String, label: String, tint: Color, onClick: () -> Unit) {
    Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.clickable(onClick = onClick)) {
        Box(Modifier.size(46.dp).clip(RoundedCornerShape(23.dp)).background(Color(0x33000000)), contentAlignment = Alignment.Center) {
            AbIcon(icon, label, tint = tint, size = 28.dp)
        }
        if (count.isNotEmpty()) Text(count, color = Color.White, style = MaterialTheme.typography.labelMedium)
    }
}

@Composable
private fun CommentsSheet(reel: Reel, onDismiss: () -> Unit, onSend: (String, () -> Unit) -> Unit, actions: ReelsActions) {
    var text by remember { mutableStateOf("") }
    ModalBottomSheet(onDismissRequest = onDismiss, containerColor = AbColors.Charcoal2) {
        Column(Modifier.fillMaxWidth().fillMaxHeight(0.75f).imePadding()) {
            Text(
                stringResource(R.string.reels_comments) + " (${reel.totalComments})",
                style = MaterialTheme.typography.titleMedium,
                modifier = Modifier.padding(horizontal = 20.dp, vertical = 8.dp),
            )
            val comments = remember(reel.comments) { reel.comments.sortedByDescending { it.createdAt } }
            if (comments.isEmpty()) {
                Box(Modifier.weight(1f).fillMaxWidth(), contentAlignment = Alignment.Center) {
                    Text(stringResource(R.string.reels_no_comments), color = AbColors.TextMuted)
                }
            } else {
                LazyColumn(Modifier.weight(1f)) {
                    items(comments, key = { it.id }) { c ->
                        CommentItem(comment = c, onAuthor = actions.openProfile, onMention = actions.openMention, onHashtag = actions.openHashtag)
                    }
                }
            }
            Row(Modifier.fillMaxWidth().navigationBarsPadding().padding(8.dp), verticalAlignment = Alignment.CenterVertically) {
                TextField(
                    value = text,
                    onValueChange = { text = it.take(1_000) },
                    placeholder = { Text(stringResource(R.string.reels_comment_hint)) },
                    maxLines = 4,
                    shape = RoundedCornerShape(24.dp),
                    colors = TextFieldDefaults.colors(
                        focusedContainerColor = AbColors.Charcoal3,
                        unfocusedContainerColor = AbColors.Charcoal3,
                        focusedIndicatorColor = Color.Transparent,
                        unfocusedIndicatorColor = Color.Transparent,
                    ),
                    modifier = Modifier.weight(1f),
                )
                AbIconButton(
                    AbIcons.Send,
                    stringResource(com.animeblack.core.ui.R.string.ui_send),
                    onClick = { if (text.isNotBlank()) onSend(text) { text = "" } },
                    tint = if (text.isNotBlank()) AbColors.Cyan else AbColors.TextMuted,
                    enabled = text.isNotBlank(),
                )
            }
        }
    }
}
