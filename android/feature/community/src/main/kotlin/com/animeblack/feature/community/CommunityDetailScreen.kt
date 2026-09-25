package com.animeblack.feature.community

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
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
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import coil3.compose.AsyncImage
import com.animeblack.core.designsystem.component.AbIcon
import com.animeblack.core.designsystem.component.AbTopBar
import com.animeblack.core.designsystem.component.ConfirmDialog
import com.animeblack.core.designsystem.component.EmptyState
import com.animeblack.core.designsystem.component.GlassButton
import com.animeblack.core.designsystem.component.GlassCard
import com.animeblack.core.designsystem.component.GradientButton
import com.animeblack.core.designsystem.component.LoadingState
import com.animeblack.core.designsystem.component.Pill
import com.animeblack.core.designsystem.component.SectionHeader
import com.animeblack.core.designsystem.component.VerifiedBadge
import com.animeblack.core.designsystem.icon.AbIcons
import com.animeblack.core.designsystem.theme.AbColors

@Composable
fun CommunityDetailScreen(
    onBack: () -> Unit,
    openChannel: (communityId: String, channelId: String) -> Unit,
    viewModel: CommunityDetailViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val context = LocalContext.current
    val snackbar = remember { SnackbarHostState() }
    var confirmLeave by remember { mutableStateOf(false) }
    LaunchedEffect(Unit) { viewModel.messages.collect { snackbar.showSnackbar(context.getString(it)) } }

    Scaffold(
        topBar = { AbTopBar(title = state.community?.name.orEmpty(), onBack = onBack) },
        snackbarHost = { SnackbarHost(snackbar) },
    ) { padding ->
        val community = state.community
        when {
            state.loading -> LoadingState(Modifier.padding(padding))
            community == null -> EmptyState(title = stringResource(R.string.community_room_not_found), icon = AbIcons.GroupOff, modifier = Modifier.padding(padding))
            else -> LazyColumn(Modifier.fillMaxSize().padding(padding), contentPadding = PaddingValues(bottom = 32.dp)) {
                item {
                    Box {
                        Box(
                            Modifier.fillMaxWidth().aspectRatio(2.6f).background(
                                Brush.linearGradient(listOf(AbColors.parse(community.color1), AbColors.parse(community.color2))),
                            ),
                        ) {
                            if (community.cover.startsWith("http")) {
                                AsyncImage(model = community.cover, contentDescription = null, contentScale = ContentScale.Crop, modifier = Modifier.matchParentSize())
                            }
                        }
                        SpaceAvatar(
                            community.icon, community.color1, community.color2, size = 84.dp, imageUrl = community.avatar,
                            modifier = Modifier.align(Alignment.BottomStart).offset(x = 16.dp, y = 42.dp),
                        )
                    }
                }
                item {
                    Column(Modifier.padding(start = 16.dp, end = 16.dp, top = 50.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(community.name, style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold)
                            if (community.isVerified) VerifiedBadge(size = 20.dp, modifier = Modifier.padding(start = 6.dp))
                        }
                        Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                            Pill(stringResource(R.string.community_members, maxOf(community.membersCount, community.memberUids.size)), color = AbColors.DeepPurple)
                            Pill(stringResource(R.string.community_level, community.level), color = AbColors.Charcoal4)
                            if (community.tag.isNotBlank()) Pill("#${community.tag}", color = AbColors.Charcoal4)
                        }
                        if (community.description.isNotBlank()) Text(community.description, color = AbColors.TextSecondary)
                        if (community.focus.isNotBlank()) Text(community.focus, color = AbColors.Violet, style = MaterialTheme.typography.labelLarge)
                        if (state.isMember) {
                            if (community.ownerId != state.myUid) {
                                GlassButton(stringResource(R.string.community_leave), onClick = { confirmLeave = true }, icon = AbIcons.Logout, contentColor = AbColors.Rose, modifier = Modifier.fillMaxWidth())
                            }
                        } else {
                            GradientButton(
                                text = stringResource(if (community.requiresApproval) R.string.community_request else R.string.community_join),
                                onClick = viewModel::join,
                                icon = AbIcons.GroupAdd,
                                modifier = Modifier.fillMaxWidth(),
                            )
                        }
                    }
                }
                item { SectionHeader(stringResource(R.string.community_channels), modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp)) }
                items(community.channels, key = { it.id }) { channel ->
                    GlassCard(
                        Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 4.dp),
                        contentPadding = 14.dp,
                        onClick = { openChannel(community.id, channel.id) },
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            AbIcon(AbIcons.Tag, null, tint = AbColors.Cyan)
                            Spacer(Modifier.width(10.dp))
                            Column(Modifier.weight(1f)) {
                                Text(channel.name, style = MaterialTheme.typography.titleSmall)
                                if (channel.description.isNotBlank()) Text(channel.description, style = MaterialTheme.typography.bodySmall, color = AbColors.TextSecondary)
                            }
                            AbIcon(AbIcons.ChevronRight, null, tint = AbColors.TextMuted)
                        }
                    }
                }
            }
        }
    }
    if (confirmLeave) {
        ConfirmDialog(
            title = stringResource(R.string.community_leave),
            message = stringResource(R.string.community_leave_confirm),
            onConfirm = {
                confirmLeave = false
                viewModel.leave()
            },
            onDismiss = { confirmLeave = false },
            destructive = true,
        )
    }
}
