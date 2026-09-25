package com.animeblack.feature.admin

import androidx.annotation.DrawableRes
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.FilterChip
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
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
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewModelScope
import androidx.navigation.NavController
import androidx.navigation.NavGraphBuilder
import androidx.navigation.compose.composable
import com.animeblack.core.common.result.AppResult
import com.animeblack.core.data.repository.AdminMetrics
import com.animeblack.core.data.repository.AdminRepository
import com.animeblack.core.data.repository.UserRepository
import com.animeblack.core.designsystem.component.AbIcon
import com.animeblack.core.designsystem.component.AbTextField
import com.animeblack.core.designsystem.component.AbTopBar
import com.animeblack.core.designsystem.component.EmptyState
import com.animeblack.core.designsystem.component.GlassCard
import com.animeblack.core.designsystem.component.GradientButton
import com.animeblack.core.designsystem.component.LoadingState
import com.animeblack.core.designsystem.component.Pill
import com.animeblack.core.designsystem.icon.AbIcons
import com.animeblack.core.designsystem.theme.AbColors
import com.animeblack.core.model.AuditLog
import com.animeblack.core.model.Report
import com.animeblack.core.model.User
import com.animeblack.core.navigation.AdminAuditRoute
import com.animeblack.core.navigation.AdminBroadcastRoute
import com.animeblack.core.navigation.AdminReportsRoute
import com.animeblack.core.navigation.AdminRoute
import com.animeblack.core.navigation.AdminUsersRoute
import com.animeblack.core.navigation.PostDetailRoute
import com.animeblack.core.navigation.ProfileRoute
import com.animeblack.core.ui.UserRow
import com.animeblack.core.ui.compactCount
import com.animeblack.core.ui.messageRes
import com.animeblack.core.ui.relativeTime
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

/**
 * Admin / moderation tools. UI access is gated on the user's role, but authorisation is enforced
 * server-side by Firestore rules and Cloud Functions (the client check is only a convenience).
 */
@HiltViewModel
class AdminViewModel @Inject constructor(private val repository: AdminRepository, users: UserRepository) : ViewModel() {
    val me: StateFlow<User?> = users.observeMe().stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), null)
    val allowed: StateFlow<Boolean?> = users.observeMe().map { it?.isModerator == true }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), null)
    val reports: StateFlow<List<Report>?> = repository.observeReports().stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), null)
    val audit: StateFlow<List<AuditLog>?> = repository.observeAuditLogs().stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), null)
    val recentUsers: StateFlow<List<User>?> = repository.observeRecentUsers().stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), null)
    private val _metrics = MutableStateFlow<AdminMetrics?>(null)
    val metrics: StateFlow<AdminMetrics?> = _metrics.asStateFlow()
    private val _messages = MutableSharedFlow<Int>(extraBufferCapacity = 3)
    val messages: SharedFlow<Int> = _messages.asSharedFlow()

    private fun handle(r: AppResult<*>, success: Int? = R.string.admin_done) {
        when (r) {
            is AppResult.Success -> success?.let { _messages.tryEmit(it) }
            is AppResult.Failure -> _messages.tryEmit(r.error.messageRes())
        }
    }

    fun loadMetrics() = viewModelScope.launch { (repository.metrics() as? AppResult.Success)?.let { _metrics.value = it.data } }
    fun resolve(report: Report, status: String, remove: Boolean) = viewModelScope.launch { handle(repository.resolveReport(report, status, remove)) }
    fun setRole(user: User, role: String) = viewModelScope.launch { handle(repository.setRole(user.id, role)) }
    fun setVerified(user: User, verified: Boolean) = viewModelScope.launch { handle(repository.setVerified(user.id, verified)) }
    fun broadcast(title: String, message: String, type: String, onSent: () -> Unit) = viewModelScope.launch {
        val r = repository.sendBroadcast(title.trim(), message.trim(), type)
        handle(r, R.string.admin_sent)
        if (r is AppResult.Success) onSent()
    }
}

@Composable
private fun AdminGate(viewModel: AdminViewModel, title: String, onBack: () -> Unit, content: @Composable (PaddingValues) -> Unit) {
    val allowed by viewModel.allowed.collectAsStateWithLifecycle()
    val context = LocalContext.current
    val snackbar = remember { SnackbarHostState() }
    LaunchedEffect(Unit) { viewModel.messages.collect { snackbar.showSnackbar(context.getString(it)) } }
    Scaffold(topBar = { AbTopBar(title = title, onBack = onBack) }, snackbarHost = { SnackbarHost(snackbar) }) { padding ->
        when (allowed) {
            null -> LoadingState(Modifier.padding(padding))
            false -> EmptyState(title = stringResource(R.string.admin_denied), icon = AbIcons.Lock, modifier = Modifier.padding(padding))
            true -> content(padding)
        }
    }
}

@Composable
fun AdminDashboardScreen(onBack: () -> Unit, navigate: (Any) -> Unit, viewModel: AdminViewModel = hiltViewModel()) {
    val metrics by viewModel.metrics.collectAsStateWithLifecycle()
    LaunchedEffect(Unit) { viewModel.loadMetrics() }
    AdminGate(viewModel, stringResource(R.string.admin_title), onBack) { padding ->
        Column(Modifier.fillMaxSize().padding(padding).verticalScroll(rememberScrollState()).padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            val m = metrics
            Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                Metric(stringResource(R.string.admin_users), m?.users, AbColors.Cyan, Modifier.weight(1f))
                Metric(stringResource(R.string.admin_posts), m?.posts, AbColors.Violet, Modifier.weight(1f))
            }
            Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                Metric(stringResource(R.string.admin_pending), m?.pendingReports, AbColors.Rose, Modifier.weight(1f))
                Metric(stringResource(R.string.admin_groups), m?.groups, AbColors.Emerald, Modifier.weight(1f))
            }
            AdminLink(AbIcons.Flag, stringResource(R.string.admin_manage_reports)) { navigate(AdminReportsRoute) }
            AdminLink(AbIcons.ManageAccounts, stringResource(R.string.admin_manage_users)) { navigate(AdminUsersRoute) }
            AdminLink(AbIcons.Campaign, stringResource(R.string.admin_broadcast)) { navigate(AdminBroadcastRoute) }
            AdminLink(AbIcons.History, stringResource(R.string.admin_audit)) { navigate(AdminAuditRoute) }
        }
    }
}

@Composable
private fun Metric(label: String, value: Long?, color: androidx.compose.ui.graphics.Color, modifier: Modifier) {
    GlassCard(modifier) {
        Text(value?.let { compactCount(it) } ?: "—", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold, color = color)
        Text(label, style = MaterialTheme.typography.labelMedium, color = AbColors.TextMuted)
    }
}

@Composable
private fun AdminLink(@DrawableRes icon: Int, label: String, onClick: () -> Unit) {
    GlassCard(Modifier.fillMaxWidth(), onClick = onClick) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            AbIcon(icon, null, tint = AbColors.Violet)
            Spacer(Modifier.width(12.dp))
            Text(label, modifier = Modifier.weight(1f))
            AbIcon(AbIcons.ChevronRight, null, tint = AbColors.TextMuted)
        }
    }
}

@Composable
fun AdminReportsScreen(onBack: () -> Unit, navigate: (Any) -> Unit, viewModel: AdminViewModel = hiltViewModel()) {
    val reports by viewModel.reports.collectAsStateWithLifecycle()
    AdminGate(viewModel, stringResource(R.string.admin_manage_reports), onBack) { padding ->
        val list = reports?.filter { it.status == "pending" }
        when {
            list == null -> LoadingState(Modifier.padding(padding))
            list.isEmpty() -> EmptyState(title = stringResource(R.string.admin_no_reports), icon = AbIcons.CheckCircle, modifier = Modifier.padding(padding))
            else -> LazyColumn(Modifier.fillMaxSize().padding(padding), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                items(list, key = { it.id }) { r ->
                    GlassCard(Modifier.fillMaxWidth(), onClick = {
                        when (r.targetType) {
                            "post" -> navigate(PostDetailRoute(r.targetId))
                            "user" -> navigate(ProfileRoute(r.targetId))
                        }
                    }) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Pill(r.targetType, color = AbColors.DeepPurple)
                            Spacer(Modifier.width(8.dp))
                            Text(r.reason, style = MaterialTheme.typography.titleSmall, modifier = Modifier.weight(1f))
                            Text(relativeTime(r.at), style = MaterialTheme.typography.labelSmall, color = AbColors.TextMuted)
                        }
                        if (r.details.isNotBlank()) Text(r.details, color = AbColors.TextSecondary, modifier = Modifier.padding(top = 6.dp))
                        Text(stringResource(R.string.admin_reported_by, r.reporterName.ifBlank { r.reporterId }), style = MaterialTheme.typography.labelSmall, color = AbColors.TextMuted, modifier = Modifier.padding(top = 4.dp))
                        Row(horizontalArrangement = Arrangement.spacedBy(4.dp), modifier = Modifier.padding(top = 6.dp)) {
                            TextButton(onClick = { viewModel.resolve(r, "resolved", false) }) { Text(stringResource(R.string.admin_resolve), color = AbColors.Emerald) }
                            TextButton(onClick = { viewModel.resolve(r, "dismissed", false) }) { Text(stringResource(R.string.admin_dismiss)) }
                            if (r.targetType == "post") {
                                TextButton(onClick = { viewModel.resolve(r, "resolved", true) }) { Text(stringResource(R.string.admin_remove_content), color = AbColors.Rose) }
                            }
                        }
                    }
                }
            }
        }
    }
}

private val ASSIGNABLE_ROLES = listOf(User.ROLE_MEMBER, "Moderator", "SeniorModerator", "admin")

@Composable
fun AdminUsersScreen(onBack: () -> Unit, navigate: (Any) -> Unit, viewModel: AdminViewModel = hiltViewModel()) {
    val users by viewModel.recentUsers.collectAsStateWithLifecycle()
    val me by viewModel.me.collectAsStateWithLifecycle()
    AdminGate(viewModel, stringResource(R.string.admin_manage_users), onBack) { padding ->
        val list = users
        if (list == null) {
            LoadingState(Modifier.padding(padding))
            return@AdminGate
        }
        LazyColumn(Modifier.fillMaxSize().padding(padding), contentPadding = PaddingValues(vertical = 8.dp)) {
            items(list, key = { it.id }) { u ->
                var menu by remember { mutableStateOf(false) }
                UserRow(user = u, subtitle = u.role + " · " + u.email.ifBlank { u.handle }, onClick = { navigate(ProfileRoute(u.id)) }, trailing = {
                    if (me?.isAdmin == true && u.id != me?.id) {
                        Column(horizontalAlignment = Alignment.End) {
                            TextButton(onClick = { menu = true }) { Text(stringResource(R.string.admin_set_role)) }
                            DropdownMenu(expanded = menu, onDismissRequest = { menu = false }, containerColor = AbColors.Charcoal3) {
                                ASSIGNABLE_ROLES.forEach { role ->
                                    DropdownMenuItem(text = { Text(role) }, onClick = {
                                        menu = false
                                        viewModel.setRole(u, role)
                                    })
                                }
                                DropdownMenuItem(
                                    text = { Text(stringResource(if (u.isVerified) R.string.admin_unverify else R.string.admin_verify)) },
                                    leadingIcon = { AbIcon(AbIcons.Verified, null, tint = AbColors.VerifiedBlue) },
                                    onClick = {
                                        menu = false
                                        viewModel.setVerified(u, !u.isVerified)
                                    },
                                )
                            }
                        }
                    }
                })
            }
        }
    }
}

@Composable
fun AdminBroadcastScreen(onBack: () -> Unit, viewModel: AdminViewModel = hiltViewModel()) {
    var title by remember { mutableStateOf("") }
    var message by remember { mutableStateOf("") }
    var type by remember { mutableStateOf("announcement") }
    AdminGate(viewModel, stringResource(R.string.admin_broadcast), onBack) { padding ->
        Column(Modifier.fillMaxSize().padding(padding).imePadding().padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            AbTextField(title, { title = it.take(100) }, label = stringResource(R.string.admin_title_hint))
            AbTextField(message, { message = it.take(1_000) }, label = stringResource(R.string.admin_message_hint), singleLine = false, minLines = 4)
            Text(stringResource(R.string.admin_type), style = MaterialTheme.typography.titleSmall)
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                listOf("announcement" to R.string.admin_type_announcement, "update" to R.string.admin_type_update, "alert" to R.string.admin_type_alert).forEach { (key, label) ->
                    FilterChip(selected = type == key, onClick = { type = key }, label = { Text(stringResource(label)) })
                }
            }
            GradientButton(
                stringResource(R.string.admin_send),
                onClick = {
                    viewModel.broadcast(title, message, type) {
                        title = ""
                        message = ""
                    }
                },
                enabled = title.isNotBlank() && message.isNotBlank(),
                icon = AbIcons.Campaign,
                modifier = Modifier.fillMaxWidth(),
            )
        }
    }
}

@Composable
fun AdminAuditScreen(onBack: () -> Unit, viewModel: AdminViewModel = hiltViewModel()) {
    val logs by viewModel.audit.collectAsStateWithLifecycle()
    AdminGate(viewModel, stringResource(R.string.admin_audit), onBack) { padding ->
        val list = logs
        when {
            list == null -> LoadingState(Modifier.padding(padding))
            list.isEmpty() -> EmptyState(title = stringResource(R.string.admin_no_audit), icon = AbIcons.History, modifier = Modifier.padding(padding))
            else -> LazyColumn(Modifier.fillMaxSize().padding(padding), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                items(list, key = { it.id }) { l ->
                    GlassCard(Modifier.fillMaxWidth()) {
                        Row {
                            Text(l.action, style = MaterialTheme.typography.titleSmall, modifier = Modifier.weight(1f))
                            Text(relativeTime(l.at), style = MaterialTheme.typography.labelSmall, color = AbColors.TextMuted)
                        }
                        Text(l.actor + (if (l.target.isNotBlank()) " → " + l.target else ""), color = AbColors.TextSecondary, style = MaterialTheme.typography.bodySmall)
                        if (l.details.isNotBlank()) Text(l.details, color = AbColors.TextMuted, style = MaterialTheme.typography.labelSmall)
                    }
                }
            }
        }
    }
}

fun NavGraphBuilder.adminGraph(navController: NavController) {
    val back: () -> Unit = { navController.popBackStack() }
    val navigate: (Any) -> Unit = { navController.navigate(it) }
    composable<AdminRoute> { AdminDashboardScreen(back, navigate) }
    composable<AdminReportsRoute> { AdminReportsScreen(back, navigate) }
    composable<AdminUsersRoute> { AdminUsersScreen(back, navigate) }
    composable<AdminBroadcastRoute> { AdminBroadcastScreen(back) }
    composable<AdminAuditRoute> { AdminAuditScreen(back) }
}
