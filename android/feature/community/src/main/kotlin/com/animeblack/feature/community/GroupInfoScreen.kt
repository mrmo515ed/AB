package com.animeblack.feature.community

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.animeblack.core.designsystem.component.AbIconButton
import com.animeblack.core.designsystem.component.AbTextField
import com.animeblack.core.designsystem.component.AbTopBar
import com.animeblack.core.designsystem.component.ConfirmDialog
import com.animeblack.core.designsystem.component.EmptyState
import com.animeblack.core.designsystem.component.GlassButton
import com.animeblack.core.designsystem.component.LoadingState
import com.animeblack.core.designsystem.component.Pill
import com.animeblack.core.designsystem.component.SearchField
import com.animeblack.core.designsystem.component.SectionHeader
import com.animeblack.core.designsystem.icon.AbIcons
import com.animeblack.core.designsystem.theme.AbColors
import com.animeblack.core.model.User
import com.animeblack.core.ui.UserRow

@Composable
fun GroupInfoScreen(
    onBack: () -> Unit,
    onLeft: () -> Unit,
    openProfile: (String) -> Unit,
    viewModel: GroupInfoViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val query by viewModel.memberQuery.collectAsStateWithLifecycle()
    val context = LocalContext.current
    val snackbar = remember { SnackbarHostState() }
    var editing by remember { mutableStateOf(false) }
    var confirmLeave by remember { mutableStateOf(false) }
    var confirmDelete by remember { mutableStateOf(false) }
    var removeTarget by remember { mutableStateOf<User?>(null) }
    LaunchedEffect(Unit) { viewModel.messages.collect { snackbar.showSnackbar(context.getString(it)) } }

    Scaffold(
        topBar = {
            AbTopBar(
                title = stringResource(R.string.community_group_info),
                onBack = onBack,
                actions = { if (state.isAdmin) AbIconButton(AbIcons.Edit, stringResource(R.string.community_edit), onClick = { editing = true }) },
            )
        },
        snackbarHost = { SnackbarHost(snackbar) },
    ) { padding ->
        val group = state.group
        when {
            state.loading -> LoadingState(Modifier.padding(padding))
            group == null -> EmptyState(title = stringResource(R.string.community_room_not_found), icon = AbIcons.GroupOff, modifier = Modifier.padding(padding))
            else -> LazyColumn(
                Modifier.fillMaxSize().padding(padding),
                contentPadding = PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                item {
                    Column(Modifier.fillMaxWidth(), horizontalAlignment = Alignment.CenterHorizontally) {
                        SpaceAvatar(group.icon, group.color1, group.color2, size = 96.dp)
                        Spacer(Modifier.height(12.dp))
                        Text(group.name, style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold, textAlign = TextAlign.Center)
                        Row(horizontalArrangement = Arrangement.spacedBy(6.dp), modifier = Modifier.padding(top = 6.dp)) {
                            Pill(stringResource(if (group.isPrivate) R.string.community_private else R.string.community_public), color = AbColors.Charcoal4)
                            Pill(stringResource(R.string.community_members, group.memberCount), color = AbColors.DeepPurple)
                            if (group.announceOnly) Pill(stringResource(R.string.community_announce_only), color = AbColors.Charcoal4)
                        }
                        if (group.description.isNotBlank()) {
                            Text(group.description, color = AbColors.TextSecondary, textAlign = TextAlign.Center, modifier = Modifier.padding(top = 10.dp))
                        }
                    }
                }
                if (state.isAdmin) {
                    item { SectionHeader(stringResource(R.string.community_add_members)) }
                    item {
                        SearchField(query = query, onQueryChange = { viewModel.memberQuery.value = it }, placeholder = stringResource(R.string.community_search_users))
                    }
                    items(state.searchResults, key = { "s_" + it.id }) { user ->
                        UserRow(user = user, onClick = { viewModel.addMember(user) }, trailing = {
                            AbIconButton(AbIcons.PersonAdd, stringResource(R.string.community_add_members), onClick = { viewModel.addMember(user) }, tint = AbColors.Cyan)
                        })
                    }
                }
                item { SectionHeader(stringResource(R.string.community_members_title)) }
                items(state.members, key = { "m_" + it.id }) { user ->
                    UserRow(user = user, onClick = { openProfile(user.id) }, trailing = {
                        when {
                            group.ownerId == user.id -> Pill(stringResource(R.string.community_owner), color = AbColors.Gold)
                            user.id in group.admins -> Pill(stringResource(R.string.community_admin), color = AbColors.DeepPurple)
                            state.isAdmin && user.id != state.myUid -> AbIconButton(AbIcons.PersonRemove, stringResource(R.string.community_remove_member), onClick = { removeTarget = user }, tint = AbColors.Rose)
                        }
                    })
                }
                item {
                    Column(Modifier.fillMaxWidth().padding(top = 16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                        if (group.isMember(state.myUid) && !state.isOwner) {
                            GlassButton(stringResource(R.string.community_leave), onClick = { confirmLeave = true }, icon = AbIcons.Logout, contentColor = AbColors.Rose, modifier = Modifier.fillMaxWidth())
                        }
                        if (state.isOwner) {
                            GlassButton(stringResource(R.string.community_delete_group), onClick = { confirmDelete = true }, icon = AbIcons.DeleteForever, contentColor = AbColors.Rose, modifier = Modifier.fillMaxWidth())
                        }
                    }
                }
            }
        }
    }

    val group = state.group
    if (editing && group != null) {
        var name by remember(group.id) { mutableStateOf(group.name) }
        var description by remember(group.id) { mutableStateOf(group.description) }
        var announceOnly by remember(group.id) { mutableStateOf(group.announceOnly) }
        AlertDialog(
            onDismissRequest = { editing = false },
            containerColor = AbColors.Charcoal2,
            title = { Text(stringResource(R.string.community_edit)) },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    AbTextField(name, { name = it.take(40) }, label = stringResource(R.string.community_name))
                    AbTextField(description, { description = it.take(200) }, label = stringResource(R.string.community_description), singleLine = false, minLines = 2)
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(stringResource(R.string.community_announce_only), modifier = Modifier.weight(1f))
                        Switch(checked = announceOnly, onCheckedChange = { announceOnly = it })
                    }
                }
            },
            confirmButton = {
                TextButton(onClick = {
                    if (name.trim().length in 3..40) {
                        viewModel.update(name, description, announceOnly)
                        editing = false
                    }
                }) { Text(stringResource(R.string.community_save)) }
            },
            dismissButton = { TextButton(onClick = { editing = false }) { Text(stringResource(com.animeblack.core.ui.R.string.ui_cancel)) } },
        )
    }
    if (confirmLeave) {
        ConfirmDialog(
            title = stringResource(R.string.community_leave),
            message = stringResource(R.string.community_leave_confirm),
            onConfirm = {
                confirmLeave = false
                viewModel.leave(onLeft)
            },
            onDismiss = { confirmLeave = false },
            destructive = true,
        )
    }
    if (confirmDelete) {
        ConfirmDialog(
            title = stringResource(R.string.community_delete_group),
            message = stringResource(R.string.community_delete_group_confirm),
            onConfirm = {
                confirmDelete = false
                viewModel.delete(onLeft)
            },
            onDismiss = { confirmDelete = false },
            destructive = true,
        )
    }
    removeTarget?.let { user ->
        ConfirmDialog(
            title = stringResource(R.string.community_remove_member),
            message = user.displayName,
            onConfirm = {
                viewModel.removeMember(user)
                removeTarget = null
            },
            onDismiss = { removeTarget = null },
            destructive = true,
        )
    }
}
