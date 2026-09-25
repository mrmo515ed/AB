package com.animeblack.feature.community

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.animeblack.core.designsystem.component.AbIcon
import com.animeblack.core.designsystem.component.AbTextField
import com.animeblack.core.designsystem.component.AbTopBar
import com.animeblack.core.designsystem.component.GlassCard
import com.animeblack.core.designsystem.component.GradientButton
import com.animeblack.core.designsystem.component.Pill
import com.animeblack.core.designsystem.component.SearchField
import com.animeblack.core.designsystem.icon.AbIcons
import com.animeblack.core.designsystem.theme.AbColors
import com.animeblack.core.ui.UserRow

/** Create a group, a world or a guild (fields adapt to [kind]). */
@OptIn(ExperimentalLayoutApi::class)
@Composable
fun CreateSpaceScreen(
    kind: SpaceKind,
    onBack: () -> Unit,
    onCreated: (String) -> Unit,
    viewModel: CreateSpaceViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val context = LocalContext.current
    val snackbar = remember { SnackbarHostState() }
    LaunchedEffect(Unit) { viewModel.created.collect(onCreated) }
    LaunchedEffect(Unit) { viewModel.messages.collect { snackbar.showSnackbar(context.getString(it)) } }
    val title = stringResource(
        when (kind) {
            SpaceKind.Group -> R.string.community_create_group
            SpaceKind.World -> R.string.community_create_world
            SpaceKind.Community -> R.string.community_create_community
        },
    )
    val (c1, c2) = SPACE_PRESETS[state.preset]

    Scaffold(
        topBar = { AbTopBar(title = title, onBack = onBack) },
        snackbarHost = { SnackbarHost(snackbar) },
    ) { padding ->
        Column(
            Modifier.fillMaxSize().padding(padding).imePadding().verticalScroll(rememberScrollState()).padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp),
        ) {
            Box(Modifier.fillMaxWidth(), contentAlignment = Alignment.Center) {
                SpaceAvatar(state.icon, c1, c2, size = 96.dp)
            }
            AbTextField(
                value = state.name,
                onValueChange = { v -> viewModel.update { it.copy(name = v.take(40)) } },
                label = stringResource(R.string.community_name),
                error = if (state.nameError) stringResource(R.string.community_name_invalid) else null,
            )
            AbTextField(
                value = state.description,
                onValueChange = { v -> viewModel.update { it.copy(description = v.take(300)) } },
                label = stringResource(R.string.community_description),
                singleLine = false,
                minLines = 3,
            )
            if (kind != SpaceKind.Community) {
                Text(stringResource(R.string.community_icon), style = MaterialTheme.typography.titleSmall)
                FlowRow(horizontalArrangement = Arrangement.spacedBy(10.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    SPACE_ICON_KEYS.forEach { key ->
                        val selected = state.icon == key
                        Box(
                            Modifier.size(48.dp).clip(RoundedCornerShape(14.dp))
                                .background(if (selected) AbColors.DeepPurple else AbColors.Charcoal3)
                                .border(if (selected) 2.dp else 0.dp, if (selected) AbColors.Cyan else Color.Transparent, RoundedCornerShape(14.dp))
                                .clickable { viewModel.update { it.copy(icon = key) } },
                            contentAlignment = Alignment.Center,
                        ) { AbIcon(spaceIcon(key), key, tint = Color.White) }
                    }
                }
            }
            if (kind != SpaceKind.Group) {
                Text(stringResource(R.string.community_colors), style = MaterialTheme.typography.titleSmall)
                Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    SPACE_PRESETS.forEachIndexed { i, (a, b) ->
                        Box(
                            Modifier.size(38.dp).clip(CircleShape)
                                .background(Brush.linearGradient(listOf(AbColors.parse(a), AbColors.parse(b))))
                                .border(if (state.preset == i) 3.dp else 0.dp, Color.White, CircleShape)
                                .clickable { viewModel.update { it.copy(preset = i) } },
                        )
                    }
                }
            }
            when (kind) {
                SpaceKind.Group -> {
                    GlassCard(Modifier.fillMaxWidth()) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            AbIcon(AbIcons.Lock, null, tint = AbColors.Violet)
                            Column(Modifier.weight(1f).padding(horizontal = 12.dp)) {
                                Text(stringResource(R.string.community_private_group), style = MaterialTheme.typography.titleSmall)
                                Text(stringResource(R.string.community_private_group_hint), style = MaterialTheme.typography.bodySmall, color = AbColors.TextSecondary)
                            }
                            Switch(checked = state.isPrivate, onCheckedChange = { v -> viewModel.update { it.copy(isPrivate = v) } })
                        }
                    }
                    Text(stringResource(R.string.community_add_members), style = MaterialTheme.typography.titleSmall)
                    if (state.selectedMembers.isNotEmpty()) {
                        FlowRow(horizontalArrangement = Arrangement.spacedBy(6.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                            state.selectedMembers.forEach { u ->
                                Pill(u.displayName, color = AbColors.DeepPurple, modifier = Modifier.clickable { viewModel.toggleMember(u) })
                            }
                        }
                    }
                    SearchField(query = state.memberQuery, onQueryChange = viewModel::onMemberQuery, placeholder = stringResource(R.string.community_search_users))
                    state.memberResults.forEach { user ->
                        val selected = state.selectedMembers.any { it.id == user.id }
                        UserRow(user = user, onClick = { viewModel.toggleMember(user) }, trailing = {
                            AbIcon(if (selected) AbIcons.CheckCircle else AbIcons.AddCircle, null, tint = if (selected) AbColors.Emerald else AbColors.TextMuted)
                        })
                    }
                }
                SpaceKind.World -> {
                    AbTextField(state.theme, { v -> viewModel.update { it.copy(theme = v.take(60)) } }, label = stringResource(R.string.community_theme))
                    AbTextField(state.rules, { v -> viewModel.update { it.copy(rules = v.take(1_500)) } }, label = stringResource(R.string.community_rules), singleLine = false, minLines = 4)
                }
                SpaceKind.Community -> {
                    AbTextField(state.tag, { v -> viewModel.update { it.copy(tag = v.take(24)) } }, label = stringResource(R.string.community_tag), leadingIcon = AbIcons.Tag)
                    AbTextField(state.focus, { v -> viewModel.update { it.copy(focus = v.take(60)) } }, label = stringResource(R.string.community_focus))
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(stringResource(R.string.community_requires_approval), modifier = Modifier.weight(1f))
                        Switch(checked = state.requiresApproval, onCheckedChange = { v -> viewModel.update { it.copy(requiresApproval = v) } })
                    }
                }
            }
            GradientButton(
                text = stringResource(R.string.community_create_action),
                onClick = { viewModel.create(kind) },
                loading = state.saving,
                icon = AbIcons.Check,
                modifier = Modifier.fillMaxWidth().padding(top = 8.dp),
            )
        }
    }
}
