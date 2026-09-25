package com.animeblack.feature.profile

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.PrimaryTabRow
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Tab
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
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
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.paging.LoadState
import androidx.paging.compose.collectAsLazyPagingItems
import androidx.paging.compose.itemKey
import coil3.compose.AsyncImage
import com.animeblack.core.designsystem.component.AbIcon
import com.animeblack.core.designsystem.component.AbIconButton
import com.animeblack.core.designsystem.component.AbTopBar
import com.animeblack.core.designsystem.component.Avatar
import com.animeblack.core.designsystem.component.AvatarRing
import com.animeblack.core.designsystem.component.ConfirmDialog
import com.animeblack.core.designsystem.component.EmptyState
import com.animeblack.core.designsystem.component.GlassButton
import com.animeblack.core.designsystem.component.GlassCard
import com.animeblack.core.designsystem.component.GradientButton
import com.animeblack.core.designsystem.component.LoadingState
import com.animeblack.core.designsystem.component.Pill
import com.animeblack.core.designsystem.component.VerifiedBadge
import com.animeblack.core.designsystem.icon.AbIcons
import com.animeblack.core.designsystem.theme.AbColors
import com.animeblack.core.model.MediaItem
import com.animeblack.core.model.Post
import com.animeblack.core.model.User
import com.animeblack.core.ui.LinkifiedText
import com.animeblack.core.ui.PostActions
import com.animeblack.core.ui.PostCard
import com.animeblack.core.ui.compactCount
import com.animeblack.core.ui.openExternalUrl
import com.animeblack.core.ui.shareLink
import com.animeblack.core.ui.shareText
import java.text.DateFormat
import java.util.Date

data class ProfileActions(
    val onBack: () -> Unit,
    val editProfile: () -> Unit,
    val openFollowList: (uid: String, followers: Boolean) -> Unit,
    val message: (uid: String) -> Unit,
    val openQr: () -> Unit,
    val openPost: (postId: String, focusComment: Boolean) -> Unit,
    val openProfile: (String) -> Unit,
    val openReel: (String) -> Unit,
    val openMedia: (MediaItem) -> Unit,
    val openSearch: (String) -> Unit,
    val openMention: (String) -> Unit,
    val report: (targetType: String, targetId: String) -> Unit,
    val editPost: (String) -> Unit,
)

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun ProfileScreen(actions: ProfileActions, viewModel: ProfileViewModel = hiltViewModel()) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val posts = viewModel.posts.collectAsLazyPagingItems()
    val context = LocalContext.current
    val snackbar = remember { SnackbarHostState() }
    var tab by rememberSaveable { mutableIntStateOf(0) }
    var menu by remember { mutableStateOf(false) }
    var postMenu by remember { mutableStateOf<Post?>(null) }
    var confirmBlock by remember { mutableStateOf(false) }
    var confirmDeletePost by remember { mutableStateOf<Post?>(null) }
    LaunchedEffect(Unit) { viewModel.messages.collect { snackbar.showSnackbar(context.getString(it)) } }
    val user = state.user

    val shareProfile = {
        user?.let { u -> context.shareText(u.displayName + "\n" + shareLink("user", u.id), context.getString(com.animeblack.core.ui.R.string.ui_share_via)) }
        Unit
    }
    val postActions = PostActions(
        onOpen = { actions.openPost(it.id, false) },
        onAuthor = { if (it != user?.id) actions.openProfile(it) },
        onLike = { viewModel.like(it) },
        onReact = { p, k -> viewModel.react(p, k) },
        onComment = { actions.openPost(it.id, true) },
        onShare = { p ->
            viewModel.share(p)
            context.shareText(p.text.take(200) + "\n" + shareLink("post", p.id), context.getString(com.animeblack.core.ui.R.string.ui_share_via))
        },
        onSave = { p, s -> viewModel.save(p, s) },
        onMenu = { postMenu = it },
        onVote = { p, o -> viewModel.vote(p, o) },
        onMedia = actions.openMedia,
        onHashtag = { actions.openSearch("#$it") },
        onMention = actions.openMention,
        onUrl = { context.openExternalUrl(it) },
    )

    Scaffold(
        topBar = {
            AbTopBar(
                title = user?.displayName ?: stringResource(R.string.profile_title),
                onBack = actions.onBack,
                actions = {
                    if (user != null) {
                        AbIconButton(AbIcons.Share, stringResource(R.string.profile_share), onClick = shareProfile)
                        if (state.isMe) {
                            AbIconButton(AbIcons.QrCode2, stringResource(R.string.profile_qr), onClick = actions.openQr)
                        } else {
                            AbIconButton(AbIcons.MoreVert, null, onClick = { menu = true })
                        }
                    }
                },
            )
        },
        snackbarHost = { SnackbarHost(snackbar) },
    ) { padding ->
        when {
            state.loading -> LoadingState(Modifier.padding(padding))
            state.notFound || user == null -> EmptyState(title = stringResource(R.string.profile_not_found), icon = AbIcons.PersonSearch, modifier = Modifier.padding(padding))
            else -> LazyColumn(Modifier.fillMaxSize().padding(padding), contentPadding = PaddingValues(bottom = 32.dp)) {
                item(key = "header") { ProfileHeader(user, state, actions, onFollow = viewModel::toggleFollow, onUnblock = viewModel::toggleBlock) }
                when {
                    state.blocked -> item(key = "blocked") {
                        EmptyState(title = stringResource(R.string.profile_blocked), icon = AbIcons.Block, actionLabel = stringResource(R.string.profile_unblock), onAction = viewModel::toggleBlock)
                    }
                    !state.canSeeContent -> item(key = "private") {
                        EmptyState(title = stringResource(R.string.profile_private), message = stringResource(R.string.profile_private_hint), icon = AbIcons.Lock)
                    }
                    else -> {
                        item(key = "tabs") {
                            PrimaryTabRow(selectedTabIndex = tab, containerColor = Color.Transparent) {
                                Tab(selected = tab == 0, onClick = { tab = 0 }, text = { Text(stringResource(R.string.profile_posts)) })
                                Tab(selected = tab == 1, onClick = { tab = 1 }, text = { Text(stringResource(R.string.profile_reels) + " (${state.reels.size})") })
                            }
                        }
                        if (tab == 0) {
                            if (posts.loadState.refresh is LoadState.NotLoading && posts.itemCount == 0) {
                                item(key = "no_posts") { EmptyState(title = stringResource(R.string.profile_no_posts), icon = AbIcons.AutoStories) }
                            }
                            items(count = posts.itemCount, key = posts.itemKey { it.id }) { index ->
                                posts[index]?.let { post ->
                                    PostCard(
                                        post = post,
                                        myUid = state.myUid,
                                        saved = post.id in state.savedIds,
                                        actions = postActions,
                                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
                                    )
                                }
                            }
                            if (posts.loadState.append is LoadState.Loading || posts.loadState.refresh is LoadState.Loading) {
                                item(key = "loading") {
                                    Box(Modifier.fillMaxWidth().padding(16.dp), contentAlignment = Alignment.Center) {
                                        CircularProgressIndicator(Modifier.size(24.dp), strokeWidth = 2.dp, color = AbColors.Violet)
                                    }
                                }
                            }
                        } else {
                            if (state.reels.isEmpty()) {
                                item(key = "no_reels") { EmptyState(title = stringResource(R.string.profile_no_reels), icon = AbIcons.MovieFilter) }
                            }
                            items(state.reels.chunked(3).size, key = { "reels_$it" }) { rowIndex ->
                                val row = state.reels.chunked(3)[rowIndex]
                                Row(Modifier.fillMaxWidth().padding(horizontal = 2.dp), horizontalArrangement = Arrangement.spacedBy(2.dp)) {
                                    row.forEach { reel ->
                                        Box(
                                            Modifier.weight(1f).aspectRatio(9f / 16f).background(AbColors.Charcoal3).clickable { actions.openReel(reel.id) },
                                        ) {
                                            AsyncImage(
                                                model = reel.coverUrl.takeIf { it.startsWith("http") } ?: reel.videoUrl,
                                                contentDescription = reel.caption,
                                                contentScale = ContentScale.Crop,
                                                modifier = Modifier.matchParentSize(),
                                            )
                                            Row(Modifier.align(Alignment.BottomStart).padding(6.dp), verticalAlignment = Alignment.CenterVertically) {
                                                AbIcon(AbIcons.PlayArrowFilled, null, tint = Color.White, size = 16.dp)
                                                Text(compactCount(reel.views), color = Color.White, style = MaterialTheme.typography.labelSmall)
                                            }
                                        }
                                    }
                                    repeat(3 - row.size) { Spacer(Modifier.weight(1f)) }
                                }
                                Spacer(Modifier.height(2.dp))
                            }
                        }
                    }
                }
            }
        }
    }

    if (menu && user != null) {
        ModalBottomSheet(onDismissRequest = { menu = false }, containerColor = AbColors.Charcoal2) {
            Column(Modifier.fillMaxWidth().navigationBarsPadding().padding(bottom = 12.dp)) {
                MenuRow(AbIcons.Block, stringResource(if (state.blocked) R.string.profile_unblock else R.string.profile_block), AbColors.Orange) {
                    menu = false
                    if (state.blocked) viewModel.toggleBlock() else confirmBlock = true
                }
                MenuRow(AbIcons.Flag, stringResource(R.string.profile_report), AbColors.Rose) {
                    menu = false
                    actions.report("user", user.id)
                }
            }
        }
    }
    postMenu?.let { post ->
        ModalBottomSheet(onDismissRequest = { postMenu = null }, containerColor = AbColors.Charcoal2) {
            Column(Modifier.fillMaxWidth().navigationBarsPadding().padding(bottom = 12.dp)) {
                if (post.authorId == state.myUid) {
                    MenuRow(AbIcons.Edit, stringResource(com.animeblack.core.ui.R.string.ui_edit), AbColors.TextPrimary) {
                        postMenu = null
                        actions.editPost(post.id)
                    }
                    MenuRow(AbIcons.Delete, stringResource(com.animeblack.core.ui.R.string.ui_delete), AbColors.Rose) {
                        postMenu = null
                        confirmDeletePost = post
                    }
                } else {
                    MenuRow(AbIcons.Flag, stringResource(com.animeblack.core.ui.R.string.ui_report), AbColors.Rose) {
                        postMenu = null
                        actions.report("post", post.id)
                    }
                }
            }
        }
    }
    if (confirmBlock && user != null) {
        ConfirmDialog(
            title = stringResource(R.string.profile_block),
            message = stringResource(R.string.profile_block_confirm, user.displayName),
            onConfirm = {
                confirmBlock = false
                viewModel.toggleBlock()
            },
            onDismiss = { confirmBlock = false },
            destructive = true,
        )
    }
    confirmDeletePost?.let { post ->
        ConfirmDialog(
            title = stringResource(com.animeblack.core.ui.R.string.ui_delete),
            message = post.text.take(120),
            onConfirm = {
                viewModel.delete(post)
                confirmDeletePost = null
                posts.refresh()
            },
            onDismiss = { confirmDeletePost = null },
            destructive = true,
        )
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
private fun ProfileHeader(user: User, state: ProfileUiState, actions: ProfileActions, onFollow: () -> Unit, onUnblock: () -> Unit) {
    val context = LocalContext.current
    Column {
        Box {
            Box(Modifier.fillMaxWidth().aspectRatio(2.8f).background(AbColors.AuroraGradient)) {
                user.cover?.takeIf { it.startsWith("http") }?.let { cover ->
                    AsyncImage(model = cover, contentDescription = null, contentScale = ContentScale.Crop, modifier = Modifier.matchParentSize())
                }
                Box(Modifier.matchParentSize().background(Brush.verticalGradient(listOf(Color.Transparent, Color(0x99000000)))))
            }
            Avatar(
                user.avatar, user.displayName, size = 96.dp, ring = AvatarRing.StoryUnseen, online = false,
                modifier = Modifier.align(Alignment.BottomStart).offset(x = 16.dp, y = 48.dp),
            )
        }
        Row(Modifier.fillMaxWidth().padding(start = 124.dp, end = 12.dp, top = 8.dp), horizontalArrangement = Arrangement.End) {
            when {
                state.isMe -> GlassButton(stringResource(R.string.profile_edit), onClick = actions.editProfile, icon = AbIcons.Edit)
                state.blocked -> GlassButton(stringResource(R.string.profile_unblock), onClick = onUnblock, icon = AbIcons.Block)
                else -> Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    if (state.isFollowing) {
                        GlassButton(stringResource(R.string.profile_following), onClick = onFollow, icon = AbIcons.PersonCheck)
                    } else {
                        GradientButton(
                            stringResource(if (state.followsMe) R.string.profile_follow_back else R.string.profile_follow),
                            onClick = onFollow,
                            icon = AbIcons.PersonAdd,
                        )
                    }
                    GlassButton(stringResource(R.string.profile_message), onClick = { actions.message(user.id) }, icon = AbIcons.Chat)
                }
            }
        }
        Column(Modifier.padding(horizontal = 16.dp, vertical = 12.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(user.displayName, style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold)
                if (user.showsVerifiedBadge) VerifiedBadge(gold = user.isGoldVerified, size = 20.dp, modifier = Modifier.padding(start = 6.dp))
            }
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                if (user.handle.isNotBlank()) Text(user.handle, color = AbColors.TextMuted)
                if (state.followsMe && !state.isMe) Pill(stringResource(R.string.profile_follows_you), color = AbColors.Charcoal4)
            }
            if (user.bio.isNotBlank()) {
                LinkifiedText(user.bio, color = AbColors.TextPrimary, style = MaterialTheme.typography.bodyMedium, onMention = actions.openMention, onHashtag = { actions.openSearch("#$it") }, onUrl = { context.openExternalUrl(it) })
            }
            FlowRow(horizontalArrangement = Arrangement.spacedBy(12.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                if (user.location.isNotBlank()) MetaItem(AbIcons.LocationOn, user.location)
                if (user.website.isNotBlank()) {
                    Row(Modifier.clickable { context.openExternalUrl(user.website) }, verticalAlignment = Alignment.CenterVertically) {
                        AbIcon(AbIcons.Link, null, tint = AbColors.Cyan, size = 16.dp)
                        Spacer(Modifier.width(4.dp))
                        Text(user.website.removePrefix("https://").removePrefix("http://"), color = AbColors.Cyan, style = MaterialTheme.typography.bodySmall, maxLines = 1)
                    }
                }
                if (user.joined > 0) MetaItem(AbIcons.CalendarMonth, stringResource(R.string.profile_joined, DateFormat.getDateInstance(DateFormat.MEDIUM).format(Date(user.joined))))
            }
            if (user.favAnimeName.isNotBlank()) MetaItem(AbIcons.LiveTv, stringResource(R.string.profile_fav_anime, user.favAnimeName))
            if (user.favStudio.isNotBlank()) MetaItem(AbIcons.Movie, stringResource(R.string.profile_fav_studio, user.favStudio))
        }
        GlassCard(Modifier.fillMaxWidth().padding(horizontal = 16.dp)) {
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceEvenly) {
                Stat(compactCount(maxOf(user.followersCount, user.followersList.size)), stringResource(R.string.profile_followers)) { actions.openFollowList(user.id, true) }
                Stat(compactCount(maxOf(user.followingCount, user.followingList.size)), stringResource(R.string.profile_following_count)) { actions.openFollowList(user.id, false) }
                Stat(compactCount(user.reputation), stringResource(R.string.profile_reputation)) {}
                if (state.isMe || user.privacy.whoSeesCoins == "everyone") Stat(compactCount(user.coins), stringResource(R.string.profile_coins)) {}
            }
            if (state.isMe || user.privacy.whoSeesLevel == "everyone") {
                Spacer(Modifier.height(12.dp))
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Pill(stringResource(R.string.profile_level, user.level), color = AbColors.DeepPurple)
                    Spacer(Modifier.width(10.dp))
                    LinearProgressIndicator(
                        progress = { if (user.xpNext > 0) (user.xp.toFloat() / user.xpNext).coerceIn(0f, 1f) else 0f },
                        modifier = Modifier.weight(1f).height(6.dp).clip(RoundedCornerShape(3.dp)),
                        color = AbColors.Cyan,
                        trackColor = AbColors.Charcoal4,
                    )
                    Spacer(Modifier.width(10.dp))
                    Text(stringResource(R.string.profile_xp, user.xp.toInt(), user.xpNext.toInt()), style = MaterialTheme.typography.labelSmall, color = AbColors.TextSecondary)
                }
            }
        }
        if (user.badges.isNotEmpty()) {
            FlowRow(
                Modifier.padding(horizontal = 16.dp, vertical = 12.dp),
                horizontalArrangement = Arrangement.spacedBy(6.dp),
                verticalArrangement = Arrangement.spacedBy(6.dp),
            ) {
                user.badges.take(12).forEach { badge ->
                    Pill(badge.removePrefix("badge_").replace('_', ' ').replaceFirstChar { it.uppercase() }, color = AbColors.Charcoal3, textColor = AbColors.Gold)
                }
            }
        }
    }
}

@Composable
private fun MetaItem(icon: Int, text: String) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        AbIcon(icon, null, tint = AbColors.TextMuted, size = 16.dp)
        Spacer(Modifier.width(4.dp))
        Text(text, color = AbColors.TextSecondary, style = MaterialTheme.typography.bodySmall)
    }
}

@Composable
private fun Stat(value: String, label: String, onClick: () -> Unit) {
    Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.clip(RoundedCornerShape(12.dp)).clickable(onClick = onClick).padding(8.dp)) {
        Text(value, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
        Text(label, style = MaterialTheme.typography.labelSmall, color = AbColors.TextMuted)
    }
}

@Composable
internal fun MenuRow(icon: Int, label: String, tint: Color, onClick: () -> Unit) {
    Row(
        Modifier.fillMaxWidth().clickable(onClick = onClick).padding(horizontal = 20.dp, vertical = 14.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        AbIcon(icon, null, tint = tint, size = 22.dp)
        Spacer(Modifier.width(16.dp))
        Text(label, color = tint, style = MaterialTheme.typography.bodyLarge)
    }
}
