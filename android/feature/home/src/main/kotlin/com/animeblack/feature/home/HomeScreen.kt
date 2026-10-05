package com.animeblack.feature.home

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
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
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.pulltorefresh.PullToRefreshBox
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.derivedStateOf
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableLongStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.animeblack.core.designsystem.R as DsR
import com.animeblack.core.designsystem.component.AbIcon
import com.animeblack.core.designsystem.component.Avatar
import com.animeblack.core.designsystem.component.AvatarRing
import com.animeblack.core.designsystem.component.CoinChip
import com.animeblack.core.designsystem.component.ConfirmDialog
import com.animeblack.core.designsystem.component.EmptyState
import com.animeblack.core.designsystem.component.ErrorState
import com.animeblack.core.designsystem.component.GlassCard
import com.animeblack.core.designsystem.component.GlowChip
import com.animeblack.core.designsystem.component.GradientButton
import com.animeblack.core.designsystem.component.HeaderActionBox
import com.animeblack.core.designsystem.component.IconTile
import com.animeblack.core.designsystem.component.OfflineBanner
import com.animeblack.core.designsystem.component.Pill
import com.animeblack.core.designsystem.component.PostSkeleton
import com.animeblack.core.designsystem.component.SearchField
import com.animeblack.core.designsystem.component.StatMiniCard
import com.animeblack.core.designsystem.icon.AbIcons
import com.animeblack.core.designsystem.theme.AbColors
import com.animeblack.core.designsystem.theme.AbTheme
import com.animeblack.core.model.MediaItem
import com.animeblack.core.model.Post
import com.animeblack.core.model.Story
import com.animeblack.core.model.User
import com.animeblack.core.ui.PostActions
import com.animeblack.core.ui.PostCard
import com.animeblack.core.ui.compactCount
import com.animeblack.core.ui.copyToClipboard
import com.animeblack.core.ui.messageRes
import com.animeblack.core.ui.shareLink
import com.animeblack.core.ui.shareText
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import kotlinx.coroutines.delay
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
    val openReels: () -> Unit = {},
    val openCommunity: () -> Unit = {},
    val openCreateGroup: () -> Unit = {},
    val openAnime: () -> Unit = {},
    val openGames: () -> Unit = {},
    val openEconomy: () -> Unit = {},
    val openLevels: () -> Unit = {},
    val openAgent: () -> Unit = {},
    val openAdmin: () -> Unit = {},
)

private enum class FeedSortMode(val label: String, val icon: Int) {
    Smart("توصيات الذكاء", AbIcons.AutoAwesome),
    Latest("الأحدث", AbIcons.Schedule),
    Popular("الرائج", AbIcons.LocalFireDepartment),
    Media("فيديو وصور", AbIcons.PhotoLibrary),
    Polls("استطلاعات", AbIcons.BarChart),
}

private val feedCategories = listOf(
    "" to "الكل",
    "أنمي" to "أنمي",
    "مانجا" to "مانجا",
    "فنون" to "فنون",
    "ميمز" to "ميمز",
    "مراجعة" to "مراجعة",
    "نظريات" to "نظريات",
)

private val trendingHomeTags = listOf(
    "أنمي_الموسم",
    "ون_بيس",
    "جوجوتسو_كايسن",
    "مانجا",
    "فان_آرت",
    "نقابات",
    "نظريات",
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

    // Home UI filters & widget customization (matches web PAGES.home)
    var sortMode by rememberSaveable { mutableStateOf(FeedSortMode.Smart) }
    var selectedCategory by rememberSaveable { mutableStateOf("") }
    var feedSearchQuery by rememberSaveable { mutableStateOf("") }
    var showFeedSearch by rememberSaveable { mutableStateOf(false) }
    var showCustomizeModal by remember { mutableStateOf(false) }
    var showDashboardWidget by rememberSaveable { mutableStateOf(true) }
    var showEventsStrip by rememberSaveable { mutableStateOf(true) }
    var showTrendingTags by rememberSaveable { mutableStateOf(true) }

    LaunchedEffect(Unit) { viewModel.messages.collect { snackbar.showSnackbar(context.getString(it)) } }
    LaunchedEffect(Unit) { viewModel.dailyClaimedText.collect { snackbar.showSnackbar(it) } }

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
        onHashtag = { tag ->
            val clean = tag.removePrefix("#")
            if (feedSearchQuery == "#$clean") feedSearchQuery = "" else feedSearchQuery = "#$clean"
        },
        onMention = navigator.openMention,
        onUrl = navigator.openUrl,
        onRetry = { viewModel.retryUploads() },
    )

    val filteredPosts = remember(state.feed.posts, sortMode, selectedCategory, feedSearchQuery) {
        val base = state.feed.posts.filter { post ->
            val catOk = selectedCategory.isBlank() ||
                post.category.equals(selectedCategory, ignoreCase = true) ||
                post.tags.any { it.contains(selectedCategory, ignoreCase = true) } ||
                post.text.contains(selectedCategory, ignoreCase = true)
            val q = feedSearchQuery.trim()
            val queryOk = q.isBlank() ||
                post.text.contains(q.removePrefix("#"), ignoreCase = true) ||
                post.author.name.contains(q, ignoreCase = true) ||
                post.tags.any { it.contains(q.removePrefix("#"), ignoreCase = true) }
            val modeOk = when (sortMode) {
                FeedSortMode.Media -> post.media != null && post.media!!.items.isNotEmpty()
                FeedSortMode.Polls -> post.poll != null
                else -> true
            }
            catOk && queryOk && modeOk
        }
        when (sortMode) {
            FeedSortMode.Latest -> base.sortedByDescending { it.createdAt }
            FeedSortMode.Popular -> base.sortedByDescending { it.likes * 3 + it.totalComments * 4 + it.shares * 2 }
            else -> base
        }
    }

    Scaffold(
        snackbarHost = { SnackbarHost(snackbar) },
        floatingActionButton = {
            FloatingActionButton(
                onClick = { navigator.createPost(null) },
                containerColor = AbColors.Blue,
                contentColor = Color.White,
            ) {
                AbIcon(AbIcons.Add, stringResource(R.string.home_create_post))
            }
        },
        topBar = {
            MainLuxuryHeader(
                me = state.me,
                unreadNotifications = state.unreadNotifications,
                onOpenAgent = navigator.openAgent,
                onOpenSearch = { navigator.openSearch("") },
                onOpenNotifications = navigator.openNotifications,
                onOpenProfile = { navigator.openProfile(myUid.ifBlank { null }) },
            )
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
                    // 1. Stories Row
                    item(key = "stories") {
                        StoriesRow(
                            stories = state.stories,
                            myUid = myUid,
                            myAvatar = state.me?.avatar.orEmpty(),
                            myName = state.me?.displayName.orEmpty(),
                            onOpen = navigator.openStory,
                            onCreate = navigator.createStory,
                        )
                    }

                    // 2. Quick Creation & Hub Strip (matches web quick strip below stories)
                    item(key = "quick_strip") {
                        QuickCreationStrip(navigator = navigator)
                    }

                    // 3. Moderator Quick Banner (if moderator/admin)
                    if (state.me?.isModerator == true) {
                        item(key = "mod_bar") {
                            ModeratorQuickBar(onOpenAdmin = navigator.openAdmin)
                        }
                    }

                    // 4. Active Platform Events Strip
                    if (showEventsStrip) {
                        item(key = "events") {
                            ActiveEventsStrip(navigator = navigator)
                        }
                    }

                    // 5. Interactive Home Dashboard Widgets (Clock + Daily Claim + 4-Stat Grid)
                    if (showDashboardWidget) {
                        item(key = "dashboard") {
                            HomeDashboardWidget(
                                me = state.me,
                                claimingDaily = state.claimingDaily,
                                onClaimDaily = viewModel::claimDaily,
                                onOpenEconomy = navigator.openEconomy,
                                onOpenLevels = navigator.openLevels,
                                onOpenProfile = { navigator.openProfile(myUid.ifBlank { null }) },
                            )
                        }
                    }

                    // 6. Trending Hashtags Strip
                    if (showTrendingTags) {
                        item(key = "trending_tags") {
                            TrendingTagsStrip(
                                activeQuery = feedSearchQuery,
                                onSelectTag = { tag ->
                                    val formatted = "#$tag"
                                    feedSearchQuery = if (feedSearchQuery == formatted) "" else formatted
                                },
                            )
                        }
                    }

                    // 7. Rich Composer Prompt Card
                    item(key = "composer") {
                        ComposerPrompt(
                            avatar = state.me?.avatar.orEmpty(),
                            name = state.me?.displayName.orEmpty(),
                            onClick = { navigator.createPost(null) },
                            onCreateStory = navigator.createStory,
                        )
                    }

                    // 8. Feed Controls (Sort Tabs + Category Chips + In-Feed Search + Customize)
                    item(key = "feed_controls") {
                        HomeFeedControls(
                            sortMode = sortMode,
                            onSortChange = { sortMode = it },
                            selectedCategory = selectedCategory,
                            onCategoryChange = { selectedCategory = it },
                            showSearch = showFeedSearch || feedSearchQuery.isNotBlank(),
                            onToggleSearch = {
                                showFeedSearch = !showFeedSearch
                                if (!showFeedSearch) feedSearchQuery = ""
                            },
                            searchQuery = feedSearchQuery,
                            onSearchQueryChange = { feedSearchQuery = it },
                            onOpenCustomize = { showCustomizeModal = true },
                        )
                    }

                    val feedError = state.error
                    when {
                        feedError != null && state.feed.posts.isEmpty() -> item(key = "error") {
                            ErrorState(stringResource(feedError.messageRes()), onRetry = { viewModel.clearError() })
                        }
                        !state.feed.initialLoaded -> items(3, key = { "sk$it" }) {
                            PostSkeleton(Modifier.widthIn(max = 720.dp).padding(horizontal = 12.dp))
                        }
                        filteredPosts.isEmpty() -> item(key = "empty") {
                            EmptyState(
                                title = if (feedSearchQuery.isNotBlank() || selectedCategory.isNotBlank()) "لا توجد منشورات مطابقة للفلتر" else stringResource(R.string.home_empty_title),
                                message = if (feedSearchQuery.isNotBlank() || selectedCategory.isNotBlank()) "جرّب تغيير التصنيف أو مسح البحث لعرض كل المنشورات." else stringResource(R.string.home_empty_message),
                                icon = AbIcons.Forum,
                                actionLabel = if (feedSearchQuery.isNotBlank() || selectedCategory.isNotBlank()) "عرض الكل" else stringResource(R.string.home_create_post),
                                onAction = {
                                    if (feedSearchQuery.isNotBlank() || selectedCategory.isNotBlank()) {
                                        feedSearchQuery = ""
                                        selectedCategory = ""
                                        sortMode = FeedSortMode.Smart
                                    } else {
                                        navigator.createPost(null)
                                    }
                                },
                            )
                        }
                        else -> {
                            items(filteredPosts, key = { it.id }, contentType = { "post" }) { post ->
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

    if (showCustomizeModal) {
        AlertDialog(
            onDismissRequest = { showCustomizeModal = false },
            containerColor = AbColors.Charcoal2,
            title = {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    AbIcon(AbIcons.Settings, null, tint = AbColors.Cyan, size = 20.dp)
                    Spacer(Modifier.width(8.dp))
                    Text("تخصيص الشاشة الرئيسية", fontWeight = FontWeight.Black)
                }
            },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.fillMaxWidth()) {
                        Text("لوحة الساعة والمكافأة والإحصائيات", modifier = Modifier.weight(1f), style = MaterialTheme.typography.bodyMedium)
                        Switch(checked = showDashboardWidget, onCheckedChange = { showDashboardWidget = it })
                    }
                    Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.fillMaxWidth()) {
                        Text("شريط الفعاليات والمسابقات النشطة", modifier = Modifier.weight(1f), style = MaterialTheme.typography.bodyMedium)
                        Switch(checked = showEventsStrip, onCheckedChange = { showEventsStrip = it })
                    }
                    Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.fillMaxWidth()) {
                        Text("شريط الهاشتاقات الرائجة (#)", modifier = Modifier.weight(1f), style = MaterialTheme.typography.bodyMedium)
                        Switch(checked = showTrendingTags, onCheckedChange = { showTrendingTags = it })
                    }
                }
            },
            confirmButton = {
                TextButton(onClick = { showCustomizeModal = false }) {
                    Text("حفظ وإغلاق", color = AbColors.Cyan, fontWeight = FontWeight.Bold)
                }
            },
        )
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

/** Web `mainHdr` header: brand logo ring, title + subtitle, AI agent, search, notifications & profile avatar. */
@Composable
private fun MainLuxuryHeader(
    me: User?,
    unreadNotifications: Int,
    onOpenAgent: () -> Unit,
    onOpenSearch: () -> Unit,
    onOpenNotifications: () -> Unit,
    onOpenProfile: () -> Unit,
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .background(
                Brush.verticalGradient(
                    listOf(
                        AbColors.Obsidian.copy(alpha = 0.96f),
                        AbColors.Ink.copy(alpha = 0.92f),
                    ),
                ),
            )
            .statusBarsPadding(),
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 12.dp, vertical = 8.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween,
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.weight(1f),
            ) {
                Box(
                    modifier = Modifier
                        .size(40.dp)
                        .clip(RoundedCornerShape(12.dp))
                        .border(1.5.dp, AbColors.CyanVioletGradient, RoundedCornerShape(12.dp))
                        .background(AbColors.Ink)
                        .padding(2.dp),
                    contentAlignment = Alignment.Center,
                ) {
                    Image(
                        painter = painterResource(id = DsR.drawable.brand_logo),
                        contentDescription = null,
                        contentScale = ContentScale.Crop,
                        modifier = Modifier.fillMaxSize().clip(RoundedCornerShape(10.dp)),
                    )
                }
                Spacer(Modifier.width(10.dp))
                Column {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(
                            text = "Anime Black",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Black,
                            color = Color.White,
                            maxLines = 1,
                        )
                        Spacer(Modifier.width(6.dp))
                        Pill(text = "v25", color = AbColors.Cyan, textColor = Color.White)
                    }
                    Text(
                        text = "عالم الأنمي والمانجا التفاعلي",
                        style = MaterialTheme.typography.labelSmall.copy(fontSize = 10.sp),
                        color = AbColors.TextMuted,
                        maxLines = 1,
                    )
                }
            }

            Row(
                horizontalArrangement = Arrangement.spacedBy(6.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                HeaderActionBox(
                    icon = AbIcons.AutoAwesome,
                    contentDescription = "الوكيل الذكي",
                    tint = AbColors.Cyan,
                    borderColor = AbColors.Cyan.copy(alpha = 0.35f),
                    onClick = onOpenAgent,
                )
                HeaderActionBox(
                    icon = AbIcons.Search,
                    contentDescription = stringResource(R.string.home_search),
                    onClick = onOpenSearch,
                )
                HeaderActionBox(
                    icon = AbIcons.Notifications,
                    contentDescription = stringResource(R.string.home_notifications),
                    badgeCount = unreadNotifications,
                    onClick = onOpenNotifications,
                )
                Avatar(
                    url = me?.avatar,
                    name = me?.displayName.orEmpty(),
                    size = 38.dp,
                    ring = AvatarRing.StoryUnseen,
                    onClick = onOpenProfile,
                )
            }
        }
        Box(
            Modifier
                .fillMaxWidth()
                .height(1.dp)
                .background(
                    Brush.horizontalGradient(
                        listOf(
                            Color.Transparent,
                            AbColors.Cyan.copy(alpha = 0.25f),
                            AbColors.Purple.copy(alpha = 0.25f),
                            Color.Transparent,
                        ),
                    ),
                ),
        )
    }
}

@Composable
private fun QuickCreationStrip(navigator: HomeNavigator) {
    Row(
        modifier = Modifier
            .widthIn(max = 720.dp)
            .fillMaxWidth()
            .horizontalScroll(rememberScrollState())
            .padding(horizontal = 12.dp),
        horizontalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        GlowChip(text = "+ منشور", icon = AbIcons.Edit, accentColor = AbColors.Cyan, onClick = { navigator.createPost(null) })
        GlowChip(text = "قصة", icon = AbIcons.PhotoCamera, accentColor = AbColors.Pink, onClick = navigator.createStory)
        GlowChip(text = "ريلز", icon = AbIcons.SmartDisplay, accentColor = AbColors.Purple, onClick = navigator.openReels)
        GlowChip(text = "قروب", icon = AbIcons.GroupAdd, accentColor = AbColors.Cyan, onClick = navigator.openCreateGroup)
        GlowChip(text = "استطلاع", icon = AbIcons.BarChart, accentColor = AbColors.Gold, onClick = { navigator.createPost(null) })
        GlowChip(text = "النقابات", icon = AbIcons.Shield, accentColor = AbColors.Emerald, onClick = navigator.openCommunity)
        GlowChip(text = "الأنمي", icon = AbIcons.LiveTv, accentColor = AbColors.Blue, onClick = navigator.openAnime)
        GlowChip(text = "الألعاب", icon = AbIcons.SportsEsports, accentColor = AbColors.Gold, onClick = navigator.openGames)
    }
}

@Composable
private fun ModeratorQuickBar(onOpenAdmin: () -> Unit) {
    GlassCard(
        modifier = Modifier.widthIn(max = 720.dp).fillMaxWidth().padding(horizontal = 12.dp),
        contentPadding = 10.dp,
        borderColor = AbColors.Rose.copy(alpha = 0.4f),
        onClick = onOpenAdmin,
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            IconTile(icon = AbIcons.AdminPanelSettings, size = 34.dp, brush = AbColors.FireGradient)
            Spacer(Modifier.width(10.dp))
            Column(Modifier.weight(1f)) {
                Text("لوحة المشرفين والإدارة العليا", style = MaterialTheme.typography.labelLarge, fontWeight = FontWeight.ExtraBold, color = Color.White)
                Text("مراجعة البلاغات، إدارة الأعضاء، وإعلانات النظام", style = MaterialTheme.typography.labelSmall, color = AbColors.TextMuted)
            }
            Pill(text = "إدارة", color = AbColors.Rose)
        }
    }
}

@Composable
private fun ActiveEventsStrip(navigator: HomeNavigator) {
    val events = remember {
        listOf(
            Triple("بطولة صيد الأنمي الأسبوعية", "جوائز 5,000 عملة ذهبية وألقاب حصرية", AbColors.Gold to navigator.openGames),
            Triple("مسابقة أفضل فان آرت وميمز", "شارك إبداعك في الموجز واحصل على نجوم", AbColors.Pink to { navigator.createPost(null) }),
            Triple("حرب النقابات الكبرى", "انضم لنقابتك وارفع ترتيبها في المجتمع", AbColors.Cyan to navigator.openCommunity),
        )
    }
    LazyRow(
        modifier = Modifier.widthIn(max = 720.dp).fillMaxWidth(),
        contentPadding = PaddingValues(horizontal = 12.dp),
        horizontalArrangement = Arrangement.spacedBy(10.dp),
    ) {
        items(events, key = { it.first }) { (title, subtitle, pair) ->
            val (accent, action) = pair
            GlassCard(
                modifier = Modifier.width(268.dp),
                contentPadding = 12.dp,
                borderColor = accent.copy(alpha = 0.35f),
                onClick = action,
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .size(8.dp)
                            .clip(CircleShape)
                            .background(AbColors.Emerald),
                    )
                    Spacer(Modifier.width(6.dp))
                    Text("فعالية نشطة", style = MaterialTheme.typography.labelSmall, color = accent, fontWeight = FontWeight.ExtraBold)
                }
                Spacer(Modifier.height(4.dp))
                Text(title, style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.ExtraBold, maxLines = 1, overflow = TextOverflow.Ellipsis)
                Text(subtitle, style = MaterialTheme.typography.labelSmall, color = AbColors.TextMuted, maxLines = 1, overflow = TextOverflow.Ellipsis)
            }
        }
    }
}

@Composable
private fun HomeDashboardWidget(
    me: User?,
    claimingDaily: Boolean,
    onClaimDaily: () -> Unit,
    onOpenEconomy: () -> Unit,
    onOpenLevels: () -> Unit,
    onOpenProfile: () -> Unit,
) {
    var now by remember { mutableLongStateOf(System.currentTimeMillis()) }
    LaunchedEffect(Unit) {
        while (true) {
            now = System.currentTimeMillis()
            delay(1_000)
        }
    }
    val clockText = remember(now) {
        SimpleDateFormat("HH:mm:ss", Locale.US).format(Date(now))
    }

    Column(
        modifier = Modifier.widthIn(max = 720.dp).fillMaxWidth().padding(horizontal = 12.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp),
    ) {
        // Live Clock + Welcome + Daily Reward Card
        GlassCard(
            modifier = Modifier.fillMaxWidth(),
            contentPadding = 14.dp,
            borderColor = AbColors.Cyan.copy(alpha = 0.25f),
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween,
                modifier = Modifier.fillMaxWidth(),
            ) {
                Column(Modifier.weight(1f)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        AbIcon(AbIcons.Schedule, null, tint = AbColors.Cyan, size = 15.dp)
                        Spacer(Modifier.width(5.dp))
                        Text(
                            text = clockText,
                            style = MaterialTheme.typography.labelMedium,
                            fontWeight = FontWeight.Black,
                            color = AbColors.Cyan,
                        )
                        Spacer(Modifier.width(8.dp))
                        CoinChip(amountText = compactCount(me?.coins ?: 0L), onClick = onOpenEconomy)
                    }
                    Spacer(Modifier.height(4.dp))
                    Text(
                        text = "أهلاً بك، ${me?.displayName?.ifBlank { "أوتاكو" } ?: "أوتاكو"}",
                        style = MaterialTheme.typography.titleSmall,
                        fontWeight = FontWeight.ExtraBold,
                        color = Color.White,
                    )
                    Text(
                        text = "استلم مكافأتك اليومية وتفاعل لرفع مستواك!",
                        style = MaterialTheme.typography.labelSmall,
                        color = AbColors.TextMuted,
                    )
                }
                Spacer(Modifier.width(8.dp))
                GradientButton(
                    text = "مكافأة اليوم",
                    icon = AbIcons.Redeem,
                    onClick = onClaimDaily,
                    loading = claimingDaily,
                    brush = AbColors.GoldGradient,
                )
            }
        }

        // 4-Stat Quick Grid (matches web .grid4)
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            StatMiniCard(
                icon = AbIcons.MilitaryTech,
                value = "Lv.${me?.level ?: 1}",
                label = "المستوى",
                iconTint = AbColors.Violet,
                modifier = Modifier.weight(1f),
                onClick = onOpenLevels,
            )
            StatMiniCard(
                icon = AbIcons.Paid,
                value = compactCount(me?.coins ?: 0L),
                label = "العملات",
                iconTint = AbColors.BrightGold,
                valueColor = AbColors.BrightGold,
                modifier = Modifier.weight(1f),
                onClick = onOpenEconomy,
            )
            StatMiniCard(
                icon = AbIcons.StarFilled,
                value = compactCount(me?.stars ?: 0L),
                label = "النجوم",
                iconTint = AbColors.Cyan,
                modifier = Modifier.weight(1f),
                onClick = onOpenEconomy,
            )
            StatMiniCard(
                icon = AbIcons.Groups,
                value = compactCount(maxOf(me?.followersCount ?: 0, me?.followersList?.size ?: 0)),
                label = "المتابعون",
                iconTint = AbColors.Emerald,
                modifier = Modifier.weight(1f),
                onClick = onOpenProfile,
            )
        }
    }
}

@Composable
private fun TrendingTagsStrip(
    activeQuery: String,
    onSelectTag: (String) -> Unit,
) {
    Row(
        modifier = Modifier
            .widthIn(max = 720.dp)
            .fillMaxWidth()
            .horizontalScroll(rememberScrollState())
            .padding(horizontal = 12.dp),
        horizontalArrangement = Arrangement.spacedBy(6.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        AbIcon(AbIcons.TrendingUp, null, tint = AbColors.Cyan, size = 18.dp)
        trendingHomeTags.forEach { tag ->
            val selected = activeQuery.equals("#$tag", ignoreCase = true)
            GlowChip(
                text = "#$tag",
                selected = selected,
                accentColor = AbColors.Cyan,
                onClick = { onSelectTag(tag) },
            )
        }
    }
}

@Composable
private fun HomeFeedControls(
    sortMode: FeedSortMode,
    onSortChange: (FeedSortMode) -> Unit,
    selectedCategory: String,
    onCategoryChange: (String) -> Unit,
    showSearch: Boolean,
    onToggleSearch: () -> Unit,
    searchQuery: String,
    onSearchQueryChange: (String) -> Unit,
    onOpenCustomize: () -> Unit,
) {
    Column(
        modifier = Modifier
            .widthIn(max = 720.dp)
            .fillMaxWidth()
            .padding(horizontal = 12.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        // Sort Mode Row + Search + Customize
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .horizontalScroll(rememberScrollState()),
            horizontalArrangement = Arrangement.spacedBy(6.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            FeedSortMode.entries.forEach { mode ->
                GlowChip(
                    text = mode.label,
                    icon = mode.icon,
                    selected = sortMode == mode,
                    onClick = { onSortChange(mode) },
                )
            }
            GlowChip(
                text = "بحث بالموجز",
                icon = AbIcons.Search,
                selected = showSearch,
                accentColor = AbColors.Violet,
                onClick = onToggleSearch,
            )
            GlowChip(
                text = "تخصيص",
                icon = AbIcons.Settings,
                accentColor = AbColors.Gold,
                onClick = onOpenCustomize,
            )
        }

        if (showSearch) {
            SearchField(
                query = searchQuery,
                onQueryChange = onSearchQueryChange,
                placeholder = "ابحث في المنشورات أو الهاشتاقات أو الكتّاب...",
                modifier = Modifier.fillMaxWidth(),
            )
        }

        // Category Filter Row
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .horizontalScroll(rememberScrollState()),
            horizontalArrangement = Arrangement.spacedBy(6.dp),
        ) {
            feedCategories.forEach { (key, label) ->
                GlowChip(
                    text = label,
                    selected = selectedCategory == key,
                    accentColor = AbColors.Purple,
                    onClick = { onCategoryChange(key) },
                )
            }
        }
    }
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
private fun ComposerPrompt(
    avatar: String,
    name: String,
    onClick: () -> Unit,
    onCreateStory: () -> Unit,
) {
    GlassCard(
        modifier = Modifier.widthIn(max = 720.dp).fillMaxWidth().padding(horizontal = 12.dp),
        onClick = onClick,
        contentPadding = 12.dp,
        borderColor = AbColors.Purple.copy(alpha = 0.30f),
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Avatar(avatar, name, size = 40.dp, ring = AvatarRing.Neon)
            Spacer(Modifier.width(10.dp))
            Column(Modifier.weight(1f)) {
                Text(
                    stringResource(R.string.home_whats_on_mind),
                    color = AbTheme.colors.textMuted,
                    style = MaterialTheme.typography.bodyMedium,
                )
                Text(
                    "شارك رأيك، صورة، استطلاع رأي أو مراجعة أنمي...",
                    color = AbColors.TextMuted.copy(alpha = 0.7f),
                    style = MaterialTheme.typography.labelSmall,
                )
            }
            Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                IconTile(icon = AbIcons.Image, size = 34.dp, brush = Brush.linearGradient(listOf(AbColors.Emerald, AbColors.Cyan)))
                IconTile(
                    icon = AbIcons.BarChart,
                    size = 34.dp,
                    brush = AbColors.PrimaryGradient,
                    modifier = Modifier.clickable(onClick = onClick),
                )
                IconTile(
                    icon = AbIcons.PhotoCamera,
                    size = 34.dp,
                    brush = Brush.linearGradient(listOf(AbColors.Pink, AbColors.Purple)),
                    modifier = Modifier.clickable(onClick = onCreateStory),
                )
            }
        }
    }
}

@Composable
private fun StoriesRow(
    stories: List<Story>,
    myUid: String,
    myAvatar: String,
    myName: String,
    onOpen: (String) -> Unit,
    onCreate: () -> Unit,
) {
    val mine = stories.firstOrNull { it.userId == myUid }
    LazyRow(
        modifier = Modifier.widthIn(max = 720.dp).fillMaxWidth(),
        contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp),
        horizontalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        item(key = "me") {
            Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.width(72.dp)) {
                Box {
                    Avatar(
                        url = myAvatar,
                        name = myName,
                        size = 66.dp,
                        ring = if (mine != null) AvatarRing.StoryUnseen else AvatarRing.Neon,
                        onClick = { if (mine != null) onOpen(myUid) else onCreate() },
                    )
                    Box(
                        Modifier
                            .align(Alignment.BottomEnd)
                            .size(22.dp)
                            .clip(CircleShape)
                            .background(AbColors.CyanVioletGradient)
                            .border(2.dp, Color.Black, CircleShape)
                            .clickable(onClick = onCreate),
                        contentAlignment = Alignment.Center,
                    ) {
                        AbIcon(AbIcons.Add, stringResource(R.string.story_create), tint = Color.White, size = 15.dp)
                    }
                }
                Spacer(Modifier.height(4.dp))
                Text(stringResource(R.string.home_your_story), style = MaterialTheme.typography.labelSmall, fontWeight = FontWeight.Bold, maxLines = 1)
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
