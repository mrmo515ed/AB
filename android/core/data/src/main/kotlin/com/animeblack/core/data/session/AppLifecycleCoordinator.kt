package com.animeblack.core.data.session

import androidx.lifecycle.DefaultLifecycleObserver
import androidx.lifecycle.LifecycleOwner
import androidx.lifecycle.ProcessLifecycleOwner
import com.animeblack.core.common.dispatchers.ApplicationScope
import com.animeblack.core.data.analytics.AnalyticsHelper
import com.animeblack.core.data.outbox.OutboxRepository
import com.animeblack.core.data.presence.PresenceManager
import com.animeblack.core.data.push.ActiveScreenTracker
import com.animeblack.core.data.push.AppNotifier
import com.animeblack.core.data.push.PushTokenManager
import com.animeblack.core.data.remote.FeatureFlags
import com.animeblack.core.data.repository.AuthRepository
import com.animeblack.core.data.repository.AuthState
import com.animeblack.core.datastore.SettingsDataSource
import javax.inject.Inject
import javax.inject.Singleton
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch

/**
 * Process-level orchestration: presence on foreground/background, a light presence heartbeat,
 * session keep-alive, outbox draining after sign-in, feature flags and privacy toggles.
 */
@Singleton
class AppLifecycleCoordinator @Inject constructor(
    private val auth: AuthRepository,
    private val presence: PresenceManager,
    private val sessionManager: SessionManager,
    private val outbox: OutboxRepository,
    private val flags: FeatureFlags,
    private val settings: SettingsDataSource,
    private val analytics: AnalyticsHelper,
    private val notifier: AppNotifier,
    private val pushTokenManager: PushTokenManager,
    private val tracker: ActiveScreenTracker,
    @ApplicationScope private val scope: CoroutineScope,
) : DefaultLifecycleObserver {

    private var heartbeat: Job? = null

    fun start() {
        notifier.createChannels()
        ProcessLifecycleOwner.get().lifecycle.addObserver(this)
        scope.launch { flags.refresh() }
        scope.launch {
            settings.settings.map { it.analyticsEnabled to it.crashReportsEnabled }.distinctUntilChanged().collect { (a, c) ->
                analytics.setCollectionEnabled(a, c)
            }
        }
        scope.launch {
            settings.settings.map { it.notificationsEnabled }.distinctUntilChanged().collect {
                if (auth.currentUid != null) pushTokenManager.register()
            }
        }
        scope.launch {
            auth.authState.map { (it as? AuthState.SignedIn)?.uid }.distinctUntilChanged().collect { uid ->
                if (uid != null) outbox.schedule()
            }
        }
    }

    override fun onStart(owner: LifecycleOwner) {
        tracker.appInForeground = true
        if (auth.currentUid == null) return
        scope.launch { presence.setOnline(true) }
        sessionManager.touch()
        heartbeat?.cancel()
        heartbeat = scope.launch {
            while (isActive) {
                delay(60_000)
                presence.heartbeat()
            }
        }
    }

    override fun onStop(owner: LifecycleOwner) {
        tracker.appInForeground = false
        heartbeat?.cancel()
        heartbeat = null
        if (auth.currentUid == null) return
        scope.launch { presence.setOnline(false) }
    }
}
