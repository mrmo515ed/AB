package com.animeblack.core.data.push

import android.Manifest
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.core.content.ContextCompat
import com.animeblack.core.common.config.AppConfig
import com.animeblack.core.datastore.SettingsDataSource
import dagger.hilt.android.qualifiers.ApplicationContext
import javax.inject.Inject
import javax.inject.Singleton

/** Tracks what the user is looking at so we don't notify for the chat that is already open. */
@Singleton
class ActiveScreenTracker @Inject constructor() {
    @Volatile var activeConversationKey: String? = null
    @Volatile var appInForeground: Boolean = false
}

@Singleton
class AppNotifier @Inject constructor(
    @ApplicationContext private val context: Context,
    private val settings: SettingsDataSource,
    private val tracker: ActiveScreenTracker,
    private val config: AppConfig,
) {
    fun createChannels() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
        val manager = context.getSystemService(NotificationManager::class.java) ?: return
        listOf(
            NotificationChannel(CHANNEL_CHATS, channelName("المحادثات", "Chats"), NotificationManager.IMPORTANCE_HIGH),
            NotificationChannel(CHANNEL_GROUPS, channelName("المجموعات", "Groups"), NotificationManager.IMPORTANCE_DEFAULT),
            NotificationChannel(CHANNEL_SOCIAL, channelName("التفاعلات", "Activity"), NotificationManager.IMPORTANCE_DEFAULT),
            NotificationChannel(CHANNEL_SYSTEM, channelName("إعلانات", "Announcements"), NotificationManager.IMPORTANCE_LOW),
        ).forEach(manager::createNotificationChannel)
    }

    private fun channelName(ar: String, en: String): String =
        if (context.resources.configuration.locales[0].language == "ar") ar else en

    /** Shows a push received while the app is running (background pushes are shown by FCM itself). */
    suspend fun showPush(title: String, body: String, url: String?, tag: String?) {
        val s = settings.current()
        if (!s.notificationsEnabled) return
        val conversationKey = tag?.substringAfter(':')
        val isChat = tag?.startsWith("chat:") == true
        val isGroup = tag?.startsWith("group:") == true
        if (isChat && !s.chatNotifications) return
        if (isGroup && !s.groupNotifications) return
        if (!isChat && !isGroup && !s.socialNotifications) return
        if (conversationKey != null && conversationKey in s.mutedChats) return
        if (tracker.appInForeground && conversationKey != null && tracker.activeConversationKey == conversationKey) return
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU &&
            ContextCompat.checkSelfPermission(context, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED
        ) {
            return
        }
        val launch = context.packageManager.getLaunchIntentForPackage(context.packageName)?.apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP
            putExtra(EXTRA_DEEP_LINK, url)
        } ?: return
        val pending = PendingIntent.getActivity(
            context,
            (tag ?: title).hashCode(),
            launch,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )
        val channel = when {
            isChat -> CHANNEL_CHATS
            isGroup -> CHANNEL_GROUPS
            else -> CHANNEL_SOCIAL
        }
        val iconRes = config.notificationIconRes
        val notification = NotificationCompat.Builder(context, channel)
            .setSmallIcon(if (iconRes != 0) iconRes else android.R.drawable.stat_notify_chat)
            .setContentTitle(title)
            .setContentText(body)
            .setStyle(NotificationCompat.BigTextStyle().bigText(body))
            .setAutoCancel(true)
            .setCategory(if (isChat || isGroup) NotificationCompat.CATEGORY_MESSAGE else NotificationCompat.CATEGORY_SOCIAL)
            .setPriority(if (isChat) NotificationCompat.PRIORITY_HIGH else NotificationCompat.PRIORITY_DEFAULT)
            .setGroup(tag)
            .setContentIntent(pending)
            .build()
        NotificationManagerCompat.from(context).notify(tag ?: title, 1, notification)
    }

    companion object {
        const val CHANNEL_CHATS = "chats"
        const val CHANNEL_GROUPS = "groups"
        const val CHANNEL_SOCIAL = "social"
        const val CHANNEL_SYSTEM = "system"
        /** Intent extra carrying the FCM `url` (e.g. `/?go=chatRoom&id=…`). */
        const val EXTRA_DEEP_LINK = "url"
    }
}
