package com.animeblack.feature.settings

import android.app.Activity
import android.content.Context
import android.content.ContextWrapper
import android.content.Intent
import android.provider.Settings
import androidx.annotation.DrawableRes
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.selection.selectable
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.RadioButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Switch
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
import androidx.compose.ui.unit.dp
import androidx.core.app.NotificationManagerCompat
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewModelScope
import androidx.navigation.NavController
import androidx.navigation.NavGraphBuilder
import androidx.navigation.compose.composable
import androidx.navigation.toRoute
import com.animeblack.core.common.config.AppConfig
import com.animeblack.core.common.result.AppResult
import com.animeblack.core.data.repository.AuthRepository
import com.animeblack.core.data.repository.SessionRepository
import com.animeblack.core.data.repository.SyncRepository
import com.animeblack.core.data.repository.SyncStatus
import com.animeblack.core.data.repository.UserRepository
import com.animeblack.core.datastore.AppSettings
import com.animeblack.core.datastore.SettingsDataSource
import com.animeblack.core.designsystem.component.AbIcon
import com.animeblack.core.designsystem.component.AbTopBar
import com.animeblack.core.designsystem.component.ConfirmDialog
import com.animeblack.core.designsystem.component.EmptyState
import com.animeblack.core.designsystem.component.GlassButton
import com.animeblack.core.designsystem.component.GlassCard
import com.animeblack.core.designsystem.component.GradientButton
import com.animeblack.core.designsystem.component.LoadingState
import com.animeblack.core.designsystem.component.SectionHeader
import com.animeblack.core.designsystem.icon.AbIcons
import com.animeblack.core.designsystem.theme.AbColors
import com.animeblack.core.model.PrivacySettings
import com.animeblack.core.model.User
import com.animeblack.core.model.UserSession
import com.animeblack.core.navigation.AccountSwitcherRoute
import com.animeblack.core.navigation.BlockedUsersRoute
import com.animeblack.core.navigation.EditProfileRoute
import com.animeblack.core.navigation.LegalDocuments
import com.animeblack.core.navigation.LegalRoute
import com.animeblack.core.navigation.PrivacySettingsRoute
import com.animeblack.core.navigation.SecurityRoute
import com.animeblack.core.navigation.SettingsRoute
import com.animeblack.core.navigation.SyncDiagnosticsRoute
import com.animeblack.core.ui.AppLocale
import com.animeblack.core.ui.UserRow
import com.animeblack.core.ui.messageRes
import com.animeblack.core.ui.relativeTime
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.flow.flatMapLatest
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

@HiltViewModel
class SettingsViewModel @Inject constructor(
    private val settings: SettingsDataSource,
    private val users: UserRepository,
    private val auth: AuthRepository,
    private val sessions: SessionRepository,
    private val sync: SyncRepository,
    val config: AppConfig,
) : ViewModel() {
    val appSettings: StateFlow<AppSettings> = settings.settings.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), AppSettings())
    val me: StateFlow<User?> = users.observeMe().stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), null)
    val sessionList: StateFlow<List<UserSession>?> = sessions.observeSessions().stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), null)
    val currentSession: StateFlow<String?> = sessions.currentSessionId
    val syncStatus: StateFlow<SyncStatus?> = sync.status.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), null)
    val blocked: StateFlow<List<User>?> = users.observeUserState().map { it.blocked }.distinctUntilChanged()
        .flatMapLatest { ids -> if (ids.isEmpty()) flowOf(emptyMap()) else users.observeUsers(ids) }
        .map { it.values.sortedBy { u -> u.displayName.lowercase() } }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), null)
    private val _messages = MutableSharedFlow<Int>(extraBufferCapacity = 3)
    val messages: SharedFlow<Int> = _messages.asSharedFlow()

    private fun handle(r: AppResult<*>, ok: Int? = null) {
        when (r) {
            is AppResult.Success -> ok?.let { _messages.tryEmit(it) }
            is AppResult.Failure -> _messages.tryEmit(r.error.messageRes())
        }
    }

    fun update(transform: (AppSettings) -> AppSettings) = viewModelScope.launch { settings.update(transform) }

    fun updatePrivacy(transform: (PrivacySettings) -> PrivacySettings, requiresChatRequest: Boolean? = null) {
        val user = me.value ?: return
        viewModelScope.launch {
            handle(users.updatePrivacy(transform(user.privacy), requiresChatRequest ?: user.requiresChatRequest), R.string.set_saved)
        }
    }

    fun setShowOnline(show: Boolean) {
        update { it.copy(showOnlineStatus = show) }
        updatePrivacy({ it.copy(showOnline = show) })
    }

    fun unblock(user: User) = viewModelScope.launch { handle(users.unblock(user.id)) }
    fun revoke(session: UserSession) = viewModelScope.launch { handle(sessions.revoke(session.sessionId)) }
    fun retryFailed() = viewModelScope.launch { sync.retryFailed() }
    fun forceResync() = viewModelScope.launch { handle(sync.forceResync(), R.string.set_resynced) }
    fun signOut() = viewModelScope.launch { auth.signOut() }
    fun deleteAccount() = viewModelScope.launch { handle(auth.deleteAccount()) }
}

private tailrec fun Context.findActivity(): Activity? = when (this) {
    is Activity -> this
    is ContextWrapper -> baseContext.findActivity()
    else -> null
}

@Composable
private fun rememberMessages(viewModel: SettingsViewModel): SnackbarHostState {
    val context = LocalContext.current
    val snackbar = remember { SnackbarHostState() }
    LaunchedEffect(Unit) { viewModel.messages.collect { snackbar.showSnackbar(context.getString(it)) } }
    return snackbar
}

// ============================================================================ Main settings

@Composable
fun SettingsScreen(onBack: () -> Unit, navigate: (Any) -> Unit, viewModel: SettingsViewModel = hiltViewModel()) {
    val s by viewModel.appSettings.collectAsStateWithLifecycle()
    val context = LocalContext.current
    val snackbar = rememberMessages(viewModel)
    var confirmSignOut by remember { mutableStateOf(false) }
    var confirmDelete by remember { mutableStateOf(false) }
    val language = remember { mutableStateOf(AppLocale.current(context)) }
    val notificationsBlocked = !NotificationManagerCompat.from(context).areNotificationsEnabled()

    Scaffold(topBar = { AbTopBar(title = stringResource(R.string.set_title), onBack = onBack) }, snackbarHost = { SnackbarHost(snackbar) }) { padding ->
        Column(Modifier.fillMaxSize().padding(padding).verticalScroll(rememberScrollState()).padding(horizontal = 16.dp, vertical = 8.dp)) {
            SectionHeader(stringResource(R.string.set_account))
            SettingsCard {
                LinkRow(AbIcons.Edit, stringResource(R.string.set_edit_profile)) { navigate(EditProfileRoute) }
                LinkRow(AbIcons.SupervisorAccount, stringResource(R.string.set_switch_account)) { navigate(AccountSwitcherRoute) }
                LinkRow(AbIcons.Lock, stringResource(R.string.set_privacy)) { navigate(PrivacySettingsRoute) }
                LinkRow(AbIcons.Shield, stringResource(R.string.set_security)) { navigate(SecurityRoute) }
                LinkRow(AbIcons.Block, stringResource(R.string.set_blocked)) { navigate(BlockedUsersRoute) }
            }

            SectionHeader(stringResource(R.string.set_appearance))
            SettingsCard {
                SwitchRow(AbIcons.DarkMode, stringResource(R.string.set_amoled), stringResource(R.string.set_amoled_hint), s.amoled) { v -> viewModel.update { it.copy(amoled = v) } }
                SwitchRow(AbIcons.Speed, stringResource(R.string.set_reduce_motion), null, s.reduceMotion) { v -> viewModel.update { it.copy(reduceMotion = v) } }
            }

            SectionHeader(stringResource(R.string.set_language))
            SettingsCard {
                listOf("" to R.string.set_lang_system, "ar" to R.string.set_lang_ar, "en" to R.string.set_lang_en).forEach { (tag, label) ->
                    Row(
                        Modifier.fillMaxWidth().selectable(selected = language.value == tag, onClick = {
                            language.value = tag
                            context.findActivity()?.let { AppLocale.set(it, tag) }
                        }).padding(vertical = 8.dp),
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        RadioButton(selected = language.value == tag, onClick = null)
                        Spacer(Modifier.width(10.dp))
                        Text(stringResource(label))
                    }
                }
            }

            SectionHeader(stringResource(R.string.set_notifications))
            SettingsCard {
                if (notificationsBlocked) {
                    Text(stringResource(R.string.set_notif_permission), color = AbColors.Orange, style = MaterialTheme.typography.bodySmall)
                    GlassButton(stringResource(R.string.set_open_system), onClick = {
                        context.startActivity(
                            Intent(Settings.ACTION_APP_NOTIFICATION_SETTINGS).putExtra(Settings.EXTRA_APP_PACKAGE, context.packageName).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK),
                        )
                    }, modifier = Modifier.padding(vertical = 6.dp))
                }
                SwitchRow(AbIcons.Notifications, stringResource(R.string.set_notif_all), null, s.notificationsEnabled) { v -> viewModel.update { it.copy(notificationsEnabled = v) } }
                SwitchRow(AbIcons.Chat, stringResource(R.string.set_notif_chats), null, s.chatNotifications, enabled = s.notificationsEnabled) { v -> viewModel.update { it.copy(chatNotifications = v) } }
                SwitchRow(AbIcons.Groups, stringResource(R.string.set_notif_groups), null, s.groupNotifications, enabled = s.notificationsEnabled) { v -> viewModel.update { it.copy(groupNotifications = v) } }
                SwitchRow(AbIcons.FavoriteFilled, stringResource(R.string.set_notif_social), null, s.socialNotifications, enabled = s.notificationsEnabled) { v -> viewModel.update { it.copy(socialNotifications = v) } }
                SwitchRow(AbIcons.VolumeUp, stringResource(R.string.set_sound), null, s.soundEnabled) { v -> viewModel.update { it.copy(soundEnabled = v) } }
                SwitchRow(AbIcons.Bolt, stringResource(R.string.set_haptics), null, s.hapticsEnabled) { v -> viewModel.update { it.copy(hapticsEnabled = v) } }
            }

            SectionHeader(stringResource(R.string.set_media))
            SettingsCard {
                SwitchRow(AbIcons.PlayArrow, stringResource(R.string.set_autoplay), null, s.autoplayVideos) { v -> viewModel.update { it.copy(autoplayVideos = v) } }
                SwitchRow(AbIcons.CloudOff, stringResource(R.string.set_data_saver), stringResource(R.string.set_data_saver_hint), s.dataSaver) { v -> viewModel.update { it.copy(dataSaver = v) } }
            }

            SectionHeader(stringResource(R.string.set_diagnostics))
            SettingsCard {
                SwitchRow(AbIcons.Analytics, stringResource(R.string.set_analytics), null, s.analyticsEnabled) { v -> viewModel.update { it.copy(analyticsEnabled = v) } }
                SwitchRow(AbIcons.BugReport, stringResource(R.string.set_crash), null, s.crashReportsEnabled) { v -> viewModel.update { it.copy(crashReportsEnabled = v) } }
                LinkRow(AbIcons.Sync, stringResource(R.string.set_sync)) { navigate(SyncDiagnosticsRoute) }
            }

            SectionHeader(stringResource(R.string.set_legal))
            SettingsCard {
                LinkRow(AbIcons.Gavel, stringResource(R.string.set_terms)) { navigate(LegalRoute(LegalDocuments.TERMS)) }
                LinkRow(AbIcons.Policy, stringResource(R.string.set_privacy_policy)) { navigate(LegalRoute(LegalDocuments.PRIVACY)) }
            }

            SectionHeader(stringResource(R.string.set_about))
            SettingsCard {
                Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.padding(vertical = 8.dp)) {
                    AbIcon(AbIcons.Info, null, tint = AbColors.TextMuted)
                    Spacer(Modifier.width(12.dp))
                    Text(stringResource(R.string.set_version, viewModel.config.versionName))
                }
            }

            Spacer(Modifier.padding(8.dp))
            GlassButton(stringResource(R.string.set_sign_out), onClick = { confirmSignOut = true }, icon = AbIcons.Logout, contentColor = AbColors.Orange, modifier = Modifier.fillMaxWidth())
            Spacer(Modifier.padding(4.dp))
            GlassButton(stringResource(R.string.set_delete_account), onClick = { confirmDelete = true }, icon = AbIcons.DeleteForever, contentColor = AbColors.Rose, modifier = Modifier.fillMaxWidth())
            Spacer(Modifier.padding(16.dp))
        }
    }
    if (confirmSignOut) {
        ConfirmDialog(
            title = stringResource(R.string.set_sign_out),
            message = stringResource(R.string.set_sign_out_confirm),
            onConfirm = {
                confirmSignOut = false
                viewModel.signOut()
            },
            onDismiss = { confirmSignOut = false },
        )
    }
    if (confirmDelete) {
        ConfirmDialog(
            title = stringResource(R.string.set_delete_account),
            message = stringResource(R.string.set_delete_confirm),
            onConfirm = {
                confirmDelete = false
                viewModel.deleteAccount()
            },
            onDismiss = { confirmDelete = false },
            destructive = true,
        )
    }
}

@Composable
private fun SettingsCard(content: @Composable () -> Unit) {
    GlassCard(Modifier.fillMaxWidth().padding(bottom = 8.dp), contentPadding = 12.dp) { content() }
}

@Composable
private fun LinkRow(@DrawableRes icon: Int, label: String, onClick: () -> Unit) {
    Row(Modifier.fillMaxWidth().clickable(onClick = onClick).padding(vertical = 10.dp), verticalAlignment = Alignment.CenterVertically) {
        AbIcon(icon, null, tint = AbColors.Violet, size = 22.dp)
        Spacer(Modifier.width(12.dp))
        Text(label, modifier = Modifier.weight(1f))
        AbIcon(AbIcons.ChevronRight, null, tint = AbColors.TextMuted)
    }
}

@Composable
private fun SwitchRow(@DrawableRes icon: Int, label: String, hint: String?, checked: Boolean, enabled: Boolean = true, onChange: (Boolean) -> Unit) {
    Row(
        Modifier.fillMaxWidth().clickable(enabled = enabled) { onChange(!checked) }.padding(vertical = 6.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        AbIcon(icon, null, tint = if (enabled) AbColors.Violet else AbColors.TextMuted, size = 22.dp)
        Spacer(Modifier.width(12.dp))
        Column(Modifier.weight(1f)) {
            Text(label, color = if (enabled) AbColors.TextPrimary else AbColors.TextMuted)
            if (hint != null) Text(hint, style = MaterialTheme.typography.labelSmall, color = AbColors.TextMuted)
        }
        Switch(checked = checked, onCheckedChange = onChange, enabled = enabled)
    }
}

// ============================================================================ Privacy

private val AUDIENCE = listOf("everyone" to R.string.set_everyone, "followers" to R.string.set_followers, "friends" to R.string.set_friends, "nobody" to R.string.set_nobody)
private val VISIBILITY = listOf("everyone" to R.string.set_everyone, "followers" to R.string.set_followers, "me" to R.string.set_only_me)

@Composable
fun PrivacySettingsScreen(onBack: () -> Unit, viewModel: SettingsViewModel = hiltViewModel()) {
    val me by viewModel.me.collectAsStateWithLifecycle()
    val s by viewModel.appSettings.collectAsStateWithLifecycle()
    val snackbar = rememberMessages(viewModel)
    Scaffold(topBar = { AbTopBar(title = stringResource(R.string.set_privacy), onBack = onBack) }, snackbarHost = { SnackbarHost(snackbar) }) { padding ->
        val user = me
        if (user == null) {
            LoadingState(Modifier.padding(padding))
            return@Scaffold
        }
        val p = user.privacy
        Column(Modifier.fillMaxSize().padding(padding).verticalScroll(rememberScrollState()).padding(16.dp)) {
            SettingsCard {
                SwitchRow(AbIcons.Lock, stringResource(R.string.set_private_account), stringResource(R.string.set_private_hint), p.privateAccount) { v -> viewModel.updatePrivacy({ it.copy(privateAccount = v) }) }
                SwitchRow(AbIcons.Visibility, stringResource(R.string.set_show_online), null, p.showOnline && s.showOnlineStatus) { v -> viewModel.setShowOnline(v) }
                SwitchRow(AbIcons.DoneAll, stringResource(R.string.set_read_receipts), null, s.readReceipts) { v -> viewModel.update { it.copy(readReceipts = v) } }
                SwitchRow(AbIcons.MarkChatUnread, stringResource(R.string.set_chat_requests), null, user.requiresChatRequest) { v -> viewModel.updatePrivacy({ it }, requiresChatRequest = v) }
            }
            SectionHeader(stringResource(R.string.set_who_dm))
            SettingsCard { ChoiceGroup(AUDIENCE, p.allowDM) { v -> viewModel.updatePrivacy({ it.copy(allowDM = v) }) } }
            SectionHeader(stringResource(R.string.set_who_coins))
            SettingsCard { ChoiceGroup(VISIBILITY, p.whoSeesCoins) { v -> viewModel.updatePrivacy({ it.copy(whoSeesCoins = v) }) } }
            SectionHeader(stringResource(R.string.set_who_level))
            SettingsCard { ChoiceGroup(VISIBILITY, p.whoSeesLevel) { v -> viewModel.updatePrivacy({ it.copy(whoSeesLevel = v) }) } }
        }
    }
}

@Composable
private fun ChoiceGroup(options: List<Pair<String, Int>>, selected: String, onSelect: (String) -> Unit) {
    options.forEach { (key, label) ->
        Row(
            Modifier.fillMaxWidth().selectable(selected = selected == key, onClick = { onSelect(key) }).padding(vertical = 6.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            RadioButton(selected = selected == key, onClick = null)
            Spacer(Modifier.width(10.dp))
            Text(stringResource(label))
        }
    }
}

// ============================================================================ Security (sessions)

@Composable
fun SecurityScreen(onBack: () -> Unit, viewModel: SettingsViewModel = hiltViewModel()) {
    val sessions by viewModel.sessionList.collectAsStateWithLifecycle()
    val current by viewModel.currentSession.collectAsStateWithLifecycle()
    val snackbar = rememberMessages(viewModel)
    Scaffold(topBar = { AbTopBar(title = stringResource(R.string.set_sessions), onBack = onBack) }, snackbarHost = { SnackbarHost(snackbar) }) { padding ->
        val list = sessions
        when {
            list == null -> LoadingState(Modifier.padding(padding))
            list.isEmpty() -> EmptyState(title = stringResource(R.string.set_no_sessions), icon = AbIcons.Devices, modifier = Modifier.padding(padding))
            else -> LazyColumn(Modifier.fillMaxSize().padding(padding), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                items(list.sortedByDescending { it.lastActive }, key = { it.sessionId }) { session ->
                    val isThis = session.sessionId == current
                    GlassCard(Modifier.fillMaxWidth()) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            AbIcon(AbIcons.Devices, null, tint = if (isThis) AbColors.Emerald else AbColors.Violet)
                            Spacer(Modifier.width(12.dp))
                            Column(Modifier.weight(1f)) {
                                Text(session.deviceName.ifBlank { session.platform }, style = MaterialTheme.typography.titleSmall)
                                Text(
                                    if (isThis) stringResource(R.string.set_this_device) else stringResource(R.string.set_last_active, relativeTime(session.lastActive)),
                                    style = MaterialTheme.typography.labelSmall,
                                    color = if (isThis) AbColors.Emerald else AbColors.TextMuted,
                                )
                            }
                            if (!isThis) GlassButton(stringResource(R.string.set_revoke), onClick = { viewModel.revoke(session) }, contentColor = AbColors.Rose)
                        }
                    }
                }
            }
        }
    }
}

// ============================================================================ Blocked users

@Composable
fun BlockedUsersScreen(onBack: () -> Unit, openProfile: (String) -> Unit, viewModel: SettingsViewModel = hiltViewModel()) {
    val blocked by viewModel.blocked.collectAsStateWithLifecycle()
    val snackbar = rememberMessages(viewModel)
    Scaffold(topBar = { AbTopBar(title = stringResource(R.string.set_blocked), onBack = onBack) }, snackbarHost = { SnackbarHost(snackbar) }) { padding ->
        val list = blocked
        when {
            list == null -> LoadingState(Modifier.padding(padding))
            list.isEmpty() -> EmptyState(title = stringResource(R.string.set_no_blocked), icon = AbIcons.Block, modifier = Modifier.padding(padding))
            else -> LazyColumn(Modifier.fillMaxSize().padding(padding), contentPadding = PaddingValues(vertical = 8.dp)) {
                items(list, key = { it.id }) { u ->
                    UserRow(user = u, onClick = { openProfile(u.id) }, trailing = {
                        GlassButton(stringResource(R.string.set_unblock), onClick = { viewModel.unblock(u) })
                    })
                }
            }
        }
    }
}

// ============================================================================ Sync diagnostics

@Composable
fun SyncDiagnosticsScreen(onBack: () -> Unit, viewModel: SettingsViewModel = hiltViewModel()) {
    val status by viewModel.syncStatus.collectAsStateWithLifecycle()
    val snackbar = rememberMessages(viewModel)
    Scaffold(topBar = { AbTopBar(title = stringResource(R.string.set_sync), onBack = onBack) }, snackbarHost = { SnackbarHost(snackbar) }) { padding ->
        val st = status
        if (st == null) {
            LoadingState(Modifier.padding(padding))
            return@Scaffold
        }
        Column(Modifier.fillMaxSize().padding(padding).padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            SettingsCard {
                StatusRow(stringResource(R.string.set_online), stringResource(if (st.online) R.string.set_connected else R.string.set_offline), if (st.online) AbColors.Emerald else AbColors.Rose)
                HorizontalDivider(color = AbColors.Line2)
                StatusRow(stringResource(R.string.set_backend), stringResource(if (st.backendReachable) R.string.set_reachable else R.string.set_unreachable), if (st.backendReachable) AbColors.Emerald else AbColors.Orange)
                HorizontalDivider(color = AbColors.Line2)
                StatusRow(stringResource(R.string.set_pending), st.pendingOutbox.toString(), if (st.pendingOutbox > 0) AbColors.Gold else AbColors.TextSecondary)
                HorizontalDivider(color = AbColors.Line2)
                StatusRow(stringResource(R.string.set_failed), st.failedOutbox.toString(), if (st.failedOutbox > 0) AbColors.Rose else AbColors.TextSecondary)
                HorizontalDivider(color = AbColors.Line2)
                StatusRow(stringResource(R.string.set_last_sync), if (st.lastServerContactAt > 0) relativeTime(st.lastServerContactAt) else stringResource(R.string.set_never), AbColors.TextSecondary)
            }
            GradientButton(stringResource(R.string.set_retry_failed), onClick = { viewModel.retryFailed() }, enabled = st.failedOutbox > 0, icon = AbIcons.Refresh, modifier = Modifier.fillMaxWidth())
            GlassButton(stringResource(R.string.set_force_resync), onClick = { viewModel.forceResync() }, icon = AbIcons.Sync, modifier = Modifier.fillMaxWidth())
        }
    }
}

@Composable
private fun StatusRow(label: String, value: String, color: Color) {
    Row(Modifier.fillMaxWidth().padding(vertical = 10.dp), verticalAlignment = Alignment.CenterVertically) {
        Text(label, modifier = Modifier.weight(1f))
        Text(value, color = color, style = MaterialTheme.typography.labelLarge)
    }
}

// ============================================================================ Legal

@Composable
fun LegalScreen(document: String, onBack: () -> Unit) {
    val terms = document == LegalDocuments.TERMS
    Scaffold(topBar = { AbTopBar(title = stringResource(if (terms) R.string.set_terms else R.string.set_privacy_policy), onBack = onBack) }) { padding ->
        Text(
            stringResource(if (terms) R.string.legal_terms_body else R.string.legal_privacy_body),
            style = MaterialTheme.typography.bodyLarge,
            modifier = Modifier.fillMaxSize().padding(padding).verticalScroll(rememberScrollState()).padding(20.dp),
        )
    }
}

fun NavGraphBuilder.settingsGraph(navController: NavController) {
    val back: () -> Unit = { navController.popBackStack() }
    composable<SettingsRoute> { SettingsScreen(back, navigate = { navController.navigate(it) }) }
    composable<PrivacySettingsRoute> { PrivacySettingsScreen(back) }
    composable<SecurityRoute> { SecurityScreen(back) }
    composable<BlockedUsersRoute> { BlockedUsersScreen(back, openProfile = { navController.navigate(com.animeblack.core.navigation.ProfileRoute(it)) }) }
    composable<SyncDiagnosticsRoute> { SyncDiagnosticsScreen(back) }
    composable<LegalRoute> { entry -> LegalScreen(entry.toRoute<LegalRoute>().document, back) }
}
