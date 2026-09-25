package com.animeblack.core.data.push

import com.animeblack.core.common.dispatchers.ApplicationScope
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
import dagger.hilt.android.AndroidEntryPoint
import javax.inject.Inject
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.launch

/** Receives FCM pushes sent by the Cloud Functions and token rotations. */
@AndroidEntryPoint
class AnimeBlackMessagingService : FirebaseMessagingService() {
    @Inject lateinit var pushTokenManager: PushTokenManager
    @Inject lateinit var notifier: AppNotifier
    @Inject @ApplicationScope lateinit var scope: CoroutineScope

    override fun onNewToken(token: String) {
        scope.launch { pushTokenManager.onNewToken(token) }
    }

    override fun onMessageReceived(message: RemoteMessage) {
        val data = message.data
        val title = message.notification?.title ?: data["title"] ?: return
        val body = message.notification?.body ?: data["body"].orEmpty()
        scope.launch { notifier.showPush(title, body, data["url"], data["tag"]) }
    }
}
