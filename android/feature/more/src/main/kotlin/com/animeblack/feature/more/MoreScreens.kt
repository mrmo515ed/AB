package com.animeblack.feature.more

import android.text.format.DateUtils
import androidx.annotation.DrawableRes
import androidx.annotation.StringRes
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
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.GridItemSpan
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.selection.selectable
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.RadioButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableLongStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.paging.compose.collectAsLazyPagingItems
import androidx.paging.compose.itemKey
import coil3.compose.AsyncImage
import com.animeblack.core.designsystem.component.AbIcon
import com.animeblack.core.designsystem.component.AbTextField
import com.animeblack.core.designsystem.component.AbTopBar
import com.animeblack.core.designsystem.component.Avatar
import com.animeblack.core.designsystem.component.ConfirmDialog
import com.animeblack.core.designsystem.component.EmptyState
import com.animeblack.core.designsystem.component.GlassCard
import com.animeblack.core.designsystem.component.GradientButton
import com.animeblack.core.designsystem.component.LoadingState
import com.animeblack.core.designsystem.component.Pill
import com.animeblack.core.designsystem.component.SearchField
import com.animeblack.core.designsystem.component.SectionHeader
import com.animeblack.core.designsystem.component.VerifiedBadge
import com.animeblack.core.designsystem.icon.AbIcons
import com.animeblack.core.designsystem.theme.AbColors
import com.animeblack.core.model.Post
import com.animeblack.core.model.Thought
import com.animeblack.core.navigation.AdminRoute
import com.animeblack.core.navigation.AnimeDetailRoute
import com.animeblack.core.navigation.AnimeHubRoute
import com.animeblack.core.navigation.EconomyRoute
import com.animeblack.core.navigation.FavoritesRoute
import com.animeblack.core.navigation.GamesHubRoute
import com.animeblack.core.navigation.LevelsRoute
import com.animeblack.core.navigation.MediaViewerRoute
import com.animeblack.core.navigation.NotificationsRoute
import com.animeblack.core.navigation.PostDetailRoute
import com.animeblack.core.navigation.ProfileRoute
import com.animeblack.core.navigation.SavedPostsRoute
import com.animeblack.core.navigation.SearchAgentRoute
import com.animeblack.core.navigation.SearchRoute
import com.animeblack.core.navigation.SettingsRoute
import com.animeblack.core.navigation.WorkspaceRoute
import com.animeblack.core.ui.PostActions
import com.animeblack.core.ui.PostCard
import com.animeblack.core.ui.UserRow
import com.animeblack.core.ui.compactCount
import com.animeblack.core.ui.openExternalUrl
import com.animeblack.core.ui.relativeTime
import kotlinx.coroutines.delay

private data class Tile(@StringRes val label: Int, @DrawableRes val icon: Int, val color: Color, val route: Any)

// ============================================================================ Hub

@Composable
fun MoreHubScreen(navigate: (Any) -> Unit, viewModel: MoreViewModel = hiltViewModel()) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val me = state.me
    val tiles = buildList {
        add(Tile(R.string.more_saved, AbIcons.BookmarkFilled, AbColors.Cyan, SavedPostsRoute))
        add(Tile(R.string.more_economy, AbIcons.Paid, AbColors.Gold, EconomyRoute))
        add(Tile(R.string.more_levels, AbIcons.MilitaryTech, AbColors.Violet, LevelsRoute))
        add(Tile(R.string.more_anime, AbIcons.LiveTv, AbColors.Pink, AnimeHubRoute))
        if (state.flags.agentEnabled) add(Tile(R.string.more_agent, AbIcons.AutoAwesome, AbColors.Blue, SearchAgentRoute))
        if (state.flags.gamesEnabled) add(Tile(R.string.more_games, AbIcons.SportsEsports, AbColors.Emerald, GamesHubRoute))
        add(Tile(R.string.more_workspace, AbIcons.StickyNote2, AbColors.Orange, WorkspaceRoute))
        add(Tile(R.string.more_favorites, AbIcons.FavoriteFilled, AbColors.Rose, FavoritesRoute))
        add(Tile(R.string.more_notifications, AbIcons.Notifications, AbColors.Cyan, NotificationsRoute))
        add(Tile(R.string.more_search, AbIcons.Search, AbColors.TextSecondary, SearchRoute()))
        add(Tile(R.string.more_settings, AbIcons.Settings, AbColors.TextSecondary, SettingsRoute))
        if (me?.isModerator == true) add(Tile(R.string.more_admin, AbIcons.AdminPanelSettings, AbColors.Rose, AdminRoute))
    }
    Scaffold(topBar = { AbTopBar(title = stringResource(R.string.more_title)) }) { padding ->
        LazyVerticalGrid(
            columns = GridCells.Adaptive(minSize = 104.dp),
            modifier = Modifier.fillMaxSize().padding(padding),
            contentPadding = PaddingValues(16.dp),
            horizontalArrangement = Arrangement.spacedBy(12.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            item(span = { GridItemSpan(maxLineSpan) }) {
                GlassCard(Modifier.fillMaxWidth(), onClick = { navigate(ProfileRoute()) }) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Avatar(me?.avatar, me?.displayName.orEmpty(), size = 60.dp)
                        Spacer(Modifier.width(12.dp))
                        Column(Modifier.weight(1f)) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text(me?.displayName.orEmpty(), style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                                if (me?.showsVerifiedBadge == true) VerifiedBadge(gold = me.isGoldVerified, size = 16.dp, modifier = Modifier.padding(start = 4.dp))
                            }
                            Text(me?.handle.orEmpty(), color = AbColors.TextMuted, style = MaterialTheme.typography.bodySmall)
                            Row(horizontalArrangement = Arrangement.spacedBy(6.dp), modifier = Modifier.padding(top = 6.dp)) {
                                Pill(stringResource(R.string.more_level, state.wallet.level), color = AbColors.DeepPurple)
                                Pill(compactCount(state.wallet.coins) + " " + stringResource(R.string.eco_coins), color = AbColors.Charcoal4, textColor = AbColors.Gold)
                                Pill(compactCount(state.wallet.gems) + " " + stringResource(R.string.eco_gems), color = AbColors.Charcoal4, textColor = AbColors.Cyan)
                            }
                        }
                        AbIcon(AbIcons.ChevronRight, stringResource(R.string.more_view_profile), tint = AbColors.TextMuted)
                    }
                }
            }
            items(tiles, key = { it.label }) { tile ->
                Column(
                    Modifier.aspectRatio(1f).clip(RoundedCornerShape(20.dp)).background(AbColors.Charcoal2).clickable { navigate(tile.route) }.padding(10.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center,
                ) {
                    Box(Modifier.size(46.dp).clip(RoundedCornerShape(16.dp)).background(tile.color.copy(alpha = 0.16f)), contentAlignment = Alignment.Center) {
                        AbIcon(tile.icon, null, tint = tile.color, size = 26.dp)
                    }
                    Spacer(Modifier.height(8.dp))
                    Text(stringResource(tile.label), style = MaterialTheme.typography.labelLarge, maxLines = 1, overflow = TextOverflow.Ellipsis)
                }
            }
        }
    }
}

// ============================================================================ Economy

@Composable
fun EconomyScreen(onBack: () -> Unit, viewModel: EconomyViewModel = hiltViewModel()) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val context = LocalContext.current
    val snackbar = remember { SnackbarHostState() }
    var now by remember { mutableLongStateOf(System.currentTimeMillis()) }
    LaunchedEffect(Unit) {
        while (true) {
            now = System.currentTimeMillis()
            delay(1_000)
        }
    }
    LaunchedEffect(Unit) { viewModel.messages.collect { snackbar.showSnackbar(context.getString(it)) } }
    LaunchedEffect(Unit) { viewModel.claimed.collect { (c, g) -> snackbar.showSnackbar(context.getString(R.string.eco_claimed, c.toInt(), g.toInt())) } }
    val w = state.wallet
    Scaffold(topBar = { AbTopBar(title = stringResource(R.string.eco_title), onBack = onBack) }, snackbarHost = { SnackbarHost(snackbar) }) { padding ->
        LazyColumn(Modifier.fillMaxSize().padding(padding).imePadding(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            item {
                Column(
                    Modifier.fillMaxWidth().clip(RoundedCornerShape(24.dp)).background(Brush.linearGradient(listOf(AbColors.DeepPurple, AbColors.Blue))).padding(20.dp),
                ) {
                    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceEvenly) {
                        Balance(stringResource(R.string.eco_coins), w.coins, AbColors.Gold)
                        Balance(stringResource(R.string.eco_stars), w.stars, Color.White)
                        Balance(stringResource(R.string.eco_gems), w.gems, AbColors.Cyan)
                    }
                }
            }
            item {
                GlassCard(Modifier.fillMaxWidth()) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        AbIcon(AbIcons.Redeem, null, tint = AbColors.Gold, size = 30.dp)
                        Spacer(Modifier.width(12.dp))
                        Column(Modifier.weight(1f)) {
                            Text(stringResource(R.string.eco_daily), style = MaterialTheme.typography.titleSmall)
                            Text(stringResource(R.string.eco_streak, w.dailyStreak), style = MaterialTheme.typography.labelSmall, color = AbColors.TextMuted)
                            if (!w.canClaimDaily(now)) {
                                Text(
                                    stringResource(R.string.eco_next_claim, DateUtils.formatElapsedTime((w.nextClaimAt() - now).coerceAtLeast(0) / 1000)),
                                    style = MaterialTheme.typography.labelSmall,
                                    color = AbColors.Violet,
                                )
                            }
                        }
                        GradientButton(stringResource(R.string.eco_claim), onClick = viewModel::claimDaily, enabled = w.canClaimDaily(now), loading = state.claiming)
                    }
                }
            }
            item { SectionHeader(stringResource(R.string.eco_transfer)) }
            item {
                GlassCard(Modifier.fillMaxWidth()) {
                    Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                        SearchField(query = state.recipientQuery, onQueryChange = viewModel::onRecipientQuery, placeholder = stringResource(R.string.eco_search_user))
                        if (state.recipient == null) {
                            state.recipientResults.forEach { u -> UserRow(user = u, onClick = { viewModel.pickRecipient(u) }) }
                        } else {
                            state.recipient?.let { u -> UserRow(user = u, subtitle = stringResource(R.string.eco_recipient)) }
                        }
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            listOf("coins" to R.string.eco_coins, "stars" to R.string.eco_stars, "gems" to R.string.eco_gems).forEach { (key, label) ->
                                FilterChip(selected = state.currency == key, onClick = { viewModel.update { it.copy(currency = key) } }, label = { Text(stringResource(label)) })
                            }
                        }
                        AbTextField(state.amount, { v -> viewModel.update { it.copy(amount = v.filter(Char::isDigit).take(9)) } }, label = stringResource(R.string.eco_amount), leadingIcon = AbIcons.Paid)
                        AbTextField(state.note, { v -> viewModel.update { it.copy(note = v.take(140)) } }, label = stringResource(R.string.eco_note))
                        GradientButton(
                            stringResource(R.string.eco_send),
                            onClick = viewModel::transfer,
                            enabled = state.recipient != null && state.amount.isNotBlank(),
                            loading = state.sending,
                            icon = AbIcons.Send,
                            modifier = Modifier.fillMaxWidth(),
                        )
                    }
                }
            }
            item { SectionHeader(stringResource(R.string.eco_history)) }
            if (state.transactions.isEmpty()) {
                item { Text(stringResource(R.string.eco_no_history), color = AbColors.TextMuted) }
            }
            items(state.transactions, key = { it.id }) { t ->
                val incoming = t.toUid == state.myUid && t.fromUid != state.myUid
                Row(Modifier.fillMaxWidth().padding(vertical = 6.dp), verticalAlignment = Alignment.CenterVertically) {
                    AbIcon(if (incoming) AbIcons.ArrowDownward else AbIcons.ArrowUpward, null, tint = if (incoming) AbColors.Emerald else AbColors.Rose)
                    Spacer(Modifier.width(10.dp))
                    Column(Modifier.weight(1f)) {
                        Text(t.reason.ifBlank { t.type }, style = MaterialTheme.typography.bodyMedium, maxLines = 1)
                        Text(relativeTime(t.at), style = MaterialTheme.typography.labelSmall, color = AbColors.TextMuted)
                    }
                    Text((if (incoming) "+" else "−") + compactCount(t.amount) + " " + t.currency, color = if (incoming) AbColors.Emerald else AbColors.Rose, style = MaterialTheme.typography.labelLarge)
                }
            }
        }
    }
}

@Composable
private fun Balance(label: String, value: Long, color: Color) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(compactCount(value), style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold, color = color)
        Text(label, style = MaterialTheme.typography.labelMedium, color = Color.White.copy(alpha = 0.8f))
    }
}

// ============================================================================ Levels

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun LevelsScreen(onBack: () -> Unit, viewModel: LevelsViewModel = hiltViewModel()) {
    val me by viewModel.me.collectAsStateWithLifecycle()
    Scaffold(topBar = { AbTopBar(title = stringResource(R.string.levels_title), onBack = onBack) }) { padding ->
        val user = me
        if (user == null) {
            LoadingState(Modifier.padding(padding))
            return@Scaffold
        }
        Column(Modifier.fillMaxSize().padding(padding).verticalScroll(rememberScrollState()).padding(16.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
            Column(
                Modifier.fillMaxWidth().clip(RoundedCornerShape(24.dp)).background(AbColors.AuroraGradient).padding(24.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
            ) {
                Text(stringResource(R.string.levels_current), color = Color.White.copy(alpha = 0.8f))
                Text(user.level.toString(), style = MaterialTheme.typography.displayMedium, fontWeight = FontWeight.Black, color = Color.White)
                LinearProgressIndicator(
                    progress = { if (user.xpNext > 0) (user.xp.toFloat() / user.xpNext).coerceIn(0f, 1f) else 0f },
                    modifier = Modifier.fillMaxWidth().height(8.dp).clip(RoundedCornerShape(4.dp)),
                    color = Color.White,
                    trackColor = Color.White.copy(alpha = 0.25f),
                )
                Spacer(Modifier.height(6.dp))
                Text(stringResource(R.string.levels_progress, user.xp.toInt(), user.xpNext.toInt(), user.level + 1), color = Color.White, style = MaterialTheme.typography.labelMedium)
            }
            Text(stringResource(R.string.levels_how), color = AbColors.TextSecondary)
            SectionHeader(stringResource(R.string.levels_badges))
            if (user.badges.isEmpty()) {
                Text(stringResource(R.string.levels_no_badges), color = AbColors.TextMuted)
            } else {
                FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    user.badges.forEach { b ->
                        Row(
                            Modifier.clip(RoundedCornerShape(14.dp)).background(AbColors.Charcoal3).padding(horizontal = 12.dp, vertical = 8.dp),
                            verticalAlignment = Alignment.CenterVertically,
                        ) {
                            AbIcon(AbIcons.MilitaryTech, null, tint = AbColors.Gold, size = 18.dp)
                            Spacer(Modifier.width(6.dp))
                            Text(b.removePrefix("badge_").replace('_', ' ').replaceFirstChar { it.uppercase() }, style = MaterialTheme.typography.labelLarge)
                        }
                    }
                }
            }
            if (user.titles.isNotEmpty()) {
                SectionHeader(stringResource(R.string.levels_titles))
                FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    user.titles.forEach { t -> Pill(t, color = if (t == user.equippedTitle) AbColors.DeepPurple else AbColors.Charcoal3) }
                }
            }
        }
    }
}

// ============================================================================ Workspace

@Composable
fun WorkspaceScreen(onBack: () -> Unit, viewModel: WorkspaceViewModel = hiltViewModel()) {
    val thoughts by viewModel.thoughts.collectAsStateWithLifecycle()
    val query by viewModel.query.collectAsStateWithLifecycle()
    var editing by remember { mutableStateOf<Thought?>(null) }
    var creating by remember { mutableStateOf(false) }
    var deleting by remember { mutableStateOf<Thought?>(null) }
    Scaffold(
        topBar = { AbTopBar(title = stringResource(R.string.ws_title), onBack = onBack) },
        floatingActionButton = {
            FloatingActionButton(onClick = { creating = true }, containerColor = AbColors.Purple, contentColor = Color.White) {
                AbIcon(AbIcons.NoteAdd, stringResource(R.string.ws_new))
            }
        },
    ) { padding ->
        Column(Modifier.fillMaxSize().padding(padding)) {
            SearchField(query = query, onQueryChange = { viewModel.query.value = it }, placeholder = stringResource(R.string.ws_search), modifier = Modifier.fillMaxWidth().padding(16.dp))
            val list = thoughts
            when {
                list == null -> LoadingState()
                list.isEmpty() -> EmptyState(title = stringResource(R.string.ws_empty), icon = AbIcons.StickyNote2)
                else -> LazyColumn(contentPadding = PaddingValues(start = 16.dp, end = 16.dp, bottom = 96.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    items(list, key = { it.id }) { t ->
                        GlassCard(Modifier.fillMaxWidth(), onClick = { editing = t }) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text(t.title.ifBlank { t.text.take(40) }, style = MaterialTheme.typography.titleSmall, modifier = Modifier.weight(1f), maxLines = 1, overflow = TextOverflow.Ellipsis)
                                AbIcon(
                                    if (t.pinned) AbIcons.PushPinFilled else AbIcons.PushPin,
                                    stringResource(R.string.ws_pin),
                                    tint = if (t.pinned) AbColors.Gold else AbColors.TextMuted,
                                    size = 20.dp,
                                    modifier = Modifier.clickable { viewModel.togglePin(t) },
                                )
                                Spacer(Modifier.width(12.dp))
                                AbIcon(AbIcons.Delete, stringResource(R.string.ws_delete), tint = AbColors.TextMuted, size = 20.dp, modifier = Modifier.clickable { deleting = t })
                            }
                            if (t.text.isNotBlank()) Text(t.text, color = AbColors.TextSecondary, maxLines = 4, overflow = TextOverflow.Ellipsis, modifier = Modifier.padding(top = 6.dp))
                            if (t.tags.isNotEmpty()) Text(t.tags.joinToString("  ") { "#$it" }, color = AbColors.Cyan, style = MaterialTheme.typography.labelSmall, modifier = Modifier.padding(top = 6.dp))
                            Text(relativeTime(t.updatedAt), color = AbColors.TextMuted, style = MaterialTheme.typography.labelSmall)
                        }
                    }
                }
            }
        }
    }
    if (creating || editing != null) {
        val existing = editing
        var title by remember(existing?.id) { mutableStateOf(existing?.title.orEmpty()) }
        var text by remember(existing?.id) { mutableStateOf(existing?.text.orEmpty()) }
        var tags by remember(existing?.id) { mutableStateOf(existing?.tags?.joinToString(", ").orEmpty()) }
        var pinned by remember(existing?.id) { mutableStateOf(existing?.pinned == true) }
        AlertDialog(
            onDismissRequest = {
                creating = false
                editing = null
            },
            containerColor = AbColors.Charcoal2,
            title = { Text(if (existing == null) stringResource(R.string.ws_new) else existing.title.ifBlank { stringResource(R.string.ws_title) }) },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    AbTextField(title, { title = it }, label = stringResource(R.string.ws_title_hint))
                    AbTextField(text, { text = it }, label = stringResource(R.string.ws_text_hint), singleLine = false, minLines = 5)
                    AbTextField(tags, { tags = it }, label = stringResource(R.string.ws_tags_hint), leadingIcon = AbIcons.Tag)
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(stringResource(R.string.ws_pin), modifier = Modifier.weight(1f))
                        Switch(checked = pinned, onCheckedChange = { pinned = it })
                    }
                }
            },
            confirmButton = {
                TextButton(onClick = {
                    if (title.isNotBlank() || text.isNotBlank()) viewModel.save(existing, title, text, tags, pinned)
                    creating = false
                    editing = null
                }) { Text(stringResource(R.string.ws_save)) }
            },
            dismissButton = {
                TextButton(onClick = {
                    creating = false
                    editing = null
                }) { Text(stringResource(com.animeblack.core.ui.R.string.ui_cancel)) }
            },
        )
    }
    deleting?.let { t ->
        ConfirmDialog(
            title = stringResource(R.string.ws_delete),
            message = stringResource(R.string.ws_delete_confirm),
            onConfirm = {
                viewModel.delete(t)
                deleting = null
            },
            onDismiss = { deleting = null },
            destructive = true,
        )
    }
}

// ============================================================================ Saved & user posts

@Composable
private fun postActions(navigate: (Any) -> Unit, openMention: (String) -> Unit, like: (Post) -> Unit, react: (Post, String) -> Unit, save: (Post, Boolean) -> Unit, vote: (Post, String) -> Unit): PostActions {
    val context = LocalContext.current
    return PostActions(
        onOpen = { navigate(PostDetailRoute(it.id)) },
        onAuthor = { navigate(ProfileRoute(it)) },
        onLike = like,
        onReact = react,
        onComment = { navigate(PostDetailRoute(it.id, true)) },
        onSave = save,
        onVote = vote,
        onMedia = { navigate(MediaViewerRoute(it.src, it.type)) },
        onHashtag = { navigate(SearchRoute("#$it")) },
        onMention = openMention,
        onUrl = { context.openExternalUrl(it) },
    )
}

@Composable
fun SavedPostsScreen(onBack: () -> Unit, navigate: (Any) -> Unit, openMention: (String) -> Unit, viewModel: SavedPostsViewModel = hiltViewModel()) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val actions = postActions(navigate, openMention, { viewModel.like(it) }, { p, k -> viewModel.react(p, k) }, { p, s -> viewModel.save(p, s) }, { p, o -> viewModel.vote(p, o) })
    Scaffold(topBar = { AbTopBar(title = stringResource(R.string.saved_title), onBack = onBack) }) { padding ->
        when {
            state.loading -> LoadingState(Modifier.padding(padding))
            state.posts.isEmpty() -> EmptyState(title = stringResource(R.string.saved_empty), message = stringResource(R.string.saved_empty_hint), icon = AbIcons.Bookmark, modifier = Modifier.padding(padding))
            else -> LazyColumn(Modifier.fillMaxSize().padding(padding), contentPadding = PaddingValues(vertical = 8.dp)) {
                items(state.posts, key = { it.id }) { p ->
                    PostCard(post = p, myUid = state.myUid, saved = p.id in state.savedIds, actions = actions, modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp))
                }
            }
        }
    }
}

@Composable
fun UserPostsScreen(onBack: () -> Unit, navigate: (Any) -> Unit, openMention: (String) -> Unit, viewModel: UserPostsViewModel = hiltViewModel()) {
    val posts = viewModel.paged.collectAsLazyPagingItems()
    val meta by viewModel.meta.collectAsStateWithLifecycle()
    val actions = postActions(navigate, openMention, { viewModel.like(it) }, { p, k -> viewModel.react(p, k) }, { p, s -> viewModel.save(p, s) }, { p, o -> viewModel.vote(p, o) })
    Scaffold(topBar = { AbTopBar(title = stringResource(R.string.userposts_title), onBack = onBack) }) { padding ->
        LazyColumn(Modifier.fillMaxSize().padding(padding), contentPadding = PaddingValues(vertical = 8.dp)) {
            items(count = posts.itemCount, key = posts.itemKey { it.id }) { i ->
                posts[i]?.let { p ->
                    PostCard(post = p, myUid = meta.first, saved = p.id in meta.second, actions = actions, modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp))
                }
            }
        }
    }
}

// ============================================================================ Favourites

@Composable
fun FavoritesScreen(onBack: () -> Unit, navigate: (Any) -> Unit, viewModel: FavoritesViewModel = hiltViewModel()) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    Scaffold(topBar = { AbTopBar(title = stringResource(R.string.fav_title), onBack = onBack) }) { padding ->
        when {
            state.loading -> LoadingState(Modifier.padding(padding))
            state.favorites.isEmpty() && state.history.isEmpty() -> EmptyState(title = stringResource(R.string.fav_empty), icon = AbIcons.FavoriteFilled, modifier = Modifier.padding(padding))
            else -> LazyColumn(Modifier.fillMaxSize().padding(padding), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                if (state.history.isNotEmpty()) {
                    item { SectionHeader(stringResource(R.string.fav_history)) }
                    items(state.history, key = { "h_" + it.id }) { h ->
                        Row(
                            Modifier.fillMaxWidth().clip(RoundedCornerShape(14.dp)).clickable { openAnime(h.id, navigate) }.padding(6.dp),
                            verticalAlignment = Alignment.CenterVertically,
                        ) {
                            AsyncImage(model = h.cover, contentDescription = h.title, modifier = Modifier.size(width = 46.dp, height = 64.dp).clip(RoundedCornerShape(8.dp)))
                            Spacer(Modifier.width(12.dp))
                            Text(h.title, style = MaterialTheme.typography.titleSmall, modifier = Modifier.weight(1f), maxLines = 2)
                        }
                    }
                }
                if (state.favorites.isNotEmpty()) {
                    item { SectionHeader(stringResource(R.string.fav_anime)) }
                    items(state.favorites, key = { "f_$it" }) { key ->
                        Row(
                            Modifier.fillMaxWidth().clip(RoundedCornerShape(14.dp)).clickable { openAnime(key, navigate) }.padding(12.dp),
                            verticalAlignment = Alignment.CenterVertically,
                        ) {
                            AbIcon(AbIcons.FavoriteFilled, null, tint = AbColors.Rose)
                            Spacer(Modifier.width(12.dp))
                            Text(key.substringAfter(':'), style = MaterialTheme.typography.bodyMedium, modifier = Modifier.weight(1f))
                            AbIcon(AbIcons.ChevronRight, null, tint = AbColors.TextMuted)
                        }
                    }
                }
            }
        }
    }
}

/** Keys look like `anilist:123` / `jikan:456`; detail lookups accept the bare id. */
private fun openAnime(key: String, navigate: (Any) -> Unit) {
    val id = key.substringAfter(':')
    if (id.isNotBlank()) navigate(AnimeDetailRoute(id))
}

// ============================================================================ Report

@Composable
fun ReportScreen(onBack: () -> Unit, viewModel: ReportViewModel = hiltViewModel()) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val context = LocalContext.current
    val snackbar = remember { SnackbarHostState() }
    LaunchedEffect(Unit) { viewModel.messages.collect { snackbar.showSnackbar(context.getString(it)) } }
    LaunchedEffect(Unit) { viewModel.done.collect { onBack() } }
    Scaffold(topBar = { AbTopBar(title = stringResource(R.string.report_title), onBack = onBack) }, snackbarHost = { SnackbarHost(snackbar) }) { padding ->
        Column(Modifier.fillMaxSize().padding(padding).imePadding().verticalScroll(rememberScrollState()).padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Text(stringResource(R.string.report_reason), style = MaterialTheme.typography.titleMedium)
            REPORT_REASONS.forEach { (key, label) ->
                Row(
                    Modifier.fillMaxWidth().clip(RoundedCornerShape(12.dp)).selectable(selected = state.reason == key, onClick = { viewModel.update { it.copy(reason = key) } }).padding(vertical = 4.dp),
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    RadioButton(selected = state.reason == key, onClick = null)
                    Spacer(Modifier.width(8.dp))
                    Text(stringResource(label))
                }
            }
            AbTextField(state.details, { v -> viewModel.update { it.copy(details = v.take(1_000)) } }, label = stringResource(R.string.report_details), singleLine = false, minLines = 3)
            GradientButton(stringResource(R.string.report_send), onClick = viewModel::send, loading = state.sending, icon = AbIcons.Flag, modifier = Modifier.fillMaxWidth().padding(top = 8.dp))
        }
    }
}
