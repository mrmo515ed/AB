package com.animeblack.app

import android.content.Intent
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.animeblack.core.common.config.AppConfig
import com.animeblack.core.common.network.NetworkMonitor
import com.animeblack.core.data.push.AppNotifier
import com.animeblack.core.data.remote.FeatureFlags
import com.animeblack.core.data.repository.AuthRepository
import com.animeblack.core.data.repository.AuthState
import com.animeblack.core.data.repository.ChatRepository
import com.animeblack.core.data.repository.NotificationRepository
import com.animeblack.core.data.repository.ProfileStatus
import com.animeblack.core.datastore.SettingsDataSource
import com.animeblack.core.model.SavedAccount
import com.animeblack.core.navigation.CreatePostRoute
import com.animeblack.core.navigation.DeepLinkParser
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.flatMapLatest
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

data class MainUiState(
    val auth: AuthState = AuthState.Initializing,
    val profile: ProfileStatus = ProfileStatus.Loading,
    val amoled: Boolean = true,
    val reduceMotion: Boolean = false,
    val maintenance: Boolean = false,
    val maintenanceMessage: String = "",
    val updateRequired: Boolean = false,
    val announcement: String = "",
)

@HiltViewModel
class MainViewModel @Inject constructor(
    private val auth: AuthRepository,
    settings: SettingsDataSource,
    flags: FeatureFlags,
    chats: ChatRepository,
    notifications: NotificationRepository,
    network: NetworkMonitor,
    private val config: AppConfig,
) : ViewModel() {

    val state: StateFlow<MainUiState> = combine(auth.authState, auth.profileStatus, settings.settings, flags.flags) { a, p, s, f ->
        MainUiState(
            auth = a,
            profile = p,
            amoled = s.amoled,
            reduceMotion = s.reduceMotion,
            maintenance = f.maintenanceMode,
            maintenanceMessage = f.maintenanceMessage,
            updateRequired = f.minSupportedVersionCode > 0 && config.versionCode < f.minSupportedVersionCode,
            announcement = f.announcement,
        )
    }.stateIn(viewModelScope, SharingStarted.Eagerly, MainUiState())

    val chatUnread: StateFlow<Int> = auth.authState.map { it is AuthState.SignedIn }
        .flatMapLatest { signedIn -> if (signedIn) chats.observeTotalUnread() else flowOf(0) }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), 0)

    val notificationUnread: StateFlow<Int> = auth.authState.map { it is AuthState.SignedIn }
        .flatMapLatest { signedIn -> if (signedIn) notifications.observeUnreadCount() else flowOf(0) }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), 0)

    val online: StateFlow<Boolean> = network.isOnline.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), true)

    private val _pendingRoute = MutableStateFlow<Any?>(null)

    /** Route requested by a deep link / notification tap / share intent; consumed once signed in. */
    val pendingRoute: StateFlow<Any?> = _pendingRoute.asStateFlow()

    private val _prefillEmail = MutableStateFlow<String?>(null)
    val prefillEmail: StateFlow<String?> = _prefillEmail.asStateFlow()

    private val _announcementDismissed = MutableStateFlow(false)
    val announcementDismissed: StateFlow<Boolean> = _announcementDismissed.asStateFlow()

    val currentUid: String? get() = auth.currentUid

    fun handleIntent(intent: Intent?) {
        intent ?: return
        val route = when {
            intent.action == Intent.ACTION_SEND && intent.type == "text/plain" ->
                intent.getStringExtra(Intent.EXTRA_TEXT)?.takeIf { it.isNotBlank() }?.let { CreatePostRoute(sharedText = it.take(5_000)) }
            intent.data != null -> DeepLinkParser.parse(intent.dataString)
            else -> DeepLinkParser.parse(intent.getStringExtra(AppNotifier.EXTRA_DEEP_LINK))
        }
        if (route != null) _pendingRoute.value = route
    }

    fun consumeRoute() {
        _pendingRoute.value = null
    }

    fun dismissAnnouncement() {
        _announcementDismissed.value = true
    }

    /** Account switching: sign out and pre-fill the chosen account on the sign-in screen. */
    fun switchAccount(account: SavedAccount?) {
        _prefillEmail.value = account?.email
        viewModelScope.launch { auth.signOut() }
    }

    fun signOut() = viewModelScope.launch { auth.signOut() }
}
