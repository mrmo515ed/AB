package com.animeblack.feature.community

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyListScope
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.PrimaryTabRow
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Tab
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.animeblack.core.designsystem.component.AbIcon
import com.animeblack.core.designsystem.component.AbTopBar
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
import com.animeblack.core.model.Community
import com.animeblack.core.model.Group
import com.animeblack.core.model.World

data class CommunityHubActions(
    val openGroup: (String) -> Unit,
    val openWorld: (String) -> Unit,
    val openCommunity: (String) -> Unit,
    val create: (SpaceKind) -> Unit,
)

@Composable
fun CommunityHubScreen(actions: CommunityHubActions, viewModel: CommunityHubViewModel = hiltViewModel()) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val tab by viewModel.tab.collectAsStateWithLifecycle()
    val query by viewModel.query.collectAsStateWithLifecycle()
    val snackbar = remember { SnackbarHostState() }
    val context = LocalContext.current
    var createMenu by remember { mutableStateOf(false) }
    LaunchedEffect(Unit) { viewModel.messages.collect { snackbar.showSnackbar(context.getString(it)) } }

    Scaffold(
        topBar = { AbTopBar(title = stringResource(R.string.community_title)) },
        snackbarHost = { SnackbarHost(snackbar) },
        floatingActionButton = {
            Box {
                FloatingActionButton(onClick = { createMenu = true }, containerColor = AbColors.Purple, contentColor = Color.White) {
                    AbIcon(AbIcons.Add, stringResource(R.string.community_create))
                }
                DropdownMenu(expanded = createMenu, onDismissRequest = { createMenu = false }, containerColor = AbColors.Charcoal3) {
                    listOf(
                        Triple(SpaceKind.Group, R.string.community_create_group, AbIcons.GroupAdd),
                        Triple(SpaceKind.World, R.string.community_create_world, AbIcons.Public),
                        Triple(SpaceKind.Community, R.string.community_create_community, AbIcons.Shield),
                    ).forEach { (kind, label, icon) ->
                        DropdownMenuItem(
                            text = { Text(stringResource(label)) },
                            leadingIcon = { AbIcon(icon, null, tint = AbColors.Violet) },
                            onClick = {
                                createMenu = false
                                actions.create(kind)
                            },
                        )
                    }
                }
            }
        },
        containerColor = MaterialTheme.colorScheme.background,
    ) { padding ->
        Column(Modifier.fillMaxSize().padding(padding)) {
            PrimaryTabRow(selectedTabIndex = tab.ordinal, containerColor = Color.Transparent) {
                SpaceTab.entries.forEach { t ->
                    Tab(
                        selected = tab == t,
                        onClick = { viewModel.tab.value = t },
                        text = {
                            Text(
                                stringResource(
                                    when (t) {
                                        SpaceTab.Groups -> R.string.community_tab_groups
                                        SpaceTab.Worlds -> R.string.community_tab_worlds
                                        SpaceTab.Communities -> R.string.community_tab_communities
                                    },
                                ),
                            )
                        },
                    )
                }
            }
            SearchField(
                query = query,
                onQueryChange = { viewModel.query.value = it },
                placeholder = stringResource(R.string.community_search),
                modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 8.dp),
            )
            if (state.loading) {
                LoadingState()
                return@Column
            }
            val uid = state.myUid
            LazyColumn(contentPadding = PaddingValues(start = 16.dp, end = 16.dp, bottom = 96.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                when (tab) {
                    SpaceTab.Groups -> spaceSections(
                        items = state.groups,
                        isMine = { it.isMember(uid) },
                        key = { it.id },
                        empty = if (query.isBlank()) R.string.community_empty_groups else R.string.community_no_results,
                    ) { g ->
                        GroupCard(g, g.isMember(uid), onOpen = { actions.openGroup(g.id) }, onJoin = { viewModel.joinGroup(g) { actions.openGroup(g.id) } })
                    }
                    SpaceTab.Worlds -> spaceSections(
                        items = state.worlds,
                        isMine = { it.isMember(uid) },
                        key = { it.id },
                        empty = if (query.isBlank()) R.string.community_empty_worlds else R.string.community_no_results,
                    ) { w ->
                        WorldCard(w, w.isMember(uid), onOpen = { actions.openWorld(w.id) }, onJoin = { viewModel.joinWorld(w) { actions.openWorld(w.id) } })
                    }
                    SpaceTab.Communities -> spaceSections(
                        items = state.communities,
                        isMine = { it.isMember(uid) },
                        key = { it.id },
                        empty = if (query.isBlank()) R.string.community_empty_communities else R.string.community_no_results,
                    ) { c ->
                        CommunityCard(c, c.isMember(uid), onOpen = { actions.openCommunity(c.id) }, onJoin = { viewModel.joinCommunity(c) { actions.openCommunity(c.id) } })
                    }
                }
            }
        }
    }
}

private fun <T> LazyListScope.spaceSections(
    items: List<T>,
    isMine: (T) -> Boolean,
    key: (T) -> String,
    empty: Int,
    card: @Composable (T) -> Unit,
) {
    if (items.isEmpty()) {
        item { EmptyState(icon = AbIcons.Groups, title = stringResource(empty), modifier = Modifier.padding(top = 48.dp)) }
        return
    }
    val (mine, others) = items.partition(isMine)
    if (mine.isNotEmpty()) {
        item(key = "h_mine") { SectionHeader(stringResource(R.string.community_mine)) }
        items(mine, key = { "m_" + key(it) }) { card(it) }
    }
    if (others.isNotEmpty()) {
        item(key = "h_discover") { SectionHeader(stringResource(R.string.community_discover)) }
        items(others, key = { "d_" + key(it) }) { card(it) }
    }
}

@Composable
private fun SpaceRow(
    icon: String,
    color1: String,
    color2: String,
    title: String,
    subtitle: String,
    meta: String,
    member: Boolean,
    joinLabel: String,
    onOpen: () -> Unit,
    onJoin: () -> Unit,
    imageUrl: String? = null,
    badges: @Composable () -> Unit = {},
) {
    GlassCard(Modifier.fillMaxWidth(), contentPadding = 12.dp, onClick = onOpen) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            SpaceAvatar(icon, color1, color2, size = 54.dp, imageUrl = imageUrl)
            Spacer(Modifier.width(12.dp))
            Column(Modifier.weight(1f)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(title, style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.SemiBold, maxLines = 1, overflow = TextOverflow.Ellipsis, modifier = Modifier.weight(1f, fill = false))
                    badges()
                }
                if (subtitle.isNotBlank()) {
                    Text(subtitle, style = MaterialTheme.typography.bodySmall, color = AbColors.TextSecondary, maxLines = 1, overflow = TextOverflow.Ellipsis)
                }
                Text(meta, style = MaterialTheme.typography.labelSmall, color = AbColors.TextMuted)
            }
            Spacer(Modifier.width(8.dp))
            if (member) {
                Pill(stringResource(R.string.community_open), color = AbColors.Charcoal4)
            } else {
                GradientButton(joinLabel, onClick = onJoin)
            }
        }
    }
}

@Composable
private fun GroupCard(group: Group, member: Boolean, onOpen: () -> Unit, onJoin: () -> Unit) {
    SpaceRow(
        icon = group.icon, color1 = group.color1, color2 = group.color2,
        title = group.name,
        subtitle = if (member && group.lastMessage.isNotBlank()) group.lastMessage else group.description,
        meta = stringResource(R.string.community_members, group.memberCount),
        member = member,
        joinLabel = stringResource(if (group.isPrivate) R.string.community_request else R.string.community_join),
        onOpen = { if (member || !group.isPrivate) onOpen() else onJoin() },
        onJoin = onJoin,
        badges = {
            if (group.isPrivate) AbIcon(AbIcons.Lock, stringResource(R.string.community_private), tint = AbColors.TextMuted, size = 14.dp, modifier = Modifier.padding(start = 4.dp))
        },
    )
}

@Composable
private fun WorldCard(world: World, member: Boolean, onOpen: () -> Unit, onJoin: () -> Unit) {
    SpaceRow(
        icon = world.icon, color1 = world.color1, color2 = world.color2,
        title = world.name,
        subtitle = world.theme.ifBlank { world.description },
        meta = stringResource(R.string.community_members, maxOf(world.membersCount, world.memberUids.size)),
        member = member,
        joinLabel = stringResource(R.string.community_join),
        onOpen = onOpen,
        onJoin = onJoin,
    )
}

@Composable
private fun CommunityCard(community: Community, member: Boolean, onOpen: () -> Unit, onJoin: () -> Unit) {
    SpaceRow(
        icon = community.icon, color1 = community.color1, color2 = community.color2,
        title = community.name,
        subtitle = community.description,
        meta = stringResource(R.string.community_members, maxOf(community.membersCount, community.memberUids.size)) +
            (if (community.tag.isNotBlank()) "  #${community.tag}" else ""),
        member = member,
        joinLabel = stringResource(if (community.requiresApproval) R.string.community_request else R.string.community_join),
        onOpen = onOpen,
        onJoin = onJoin,
        imageUrl = community.avatar,
        badges = { if (community.isVerified) VerifiedBadge(modifier = Modifier.padding(start = 4.dp)) },
    )
}
