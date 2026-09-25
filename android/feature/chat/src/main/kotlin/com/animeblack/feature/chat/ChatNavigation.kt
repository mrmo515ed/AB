package com.animeblack.feature.chat

import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.navigation.NavBackStackEntry
import androidx.navigation.NavController
import androidx.navigation.NavGraphBuilder
import androidx.navigation.compose.composable
import com.animeblack.core.model.LocalMedia
import com.animeblack.core.navigation.CameraRoute
import com.animeblack.core.navigation.ChatInfoRoute
import com.animeblack.core.navigation.ChatListRoute
import com.animeblack.core.navigation.ChatRequestsRoute
import com.animeblack.core.navigation.ChatRoomRoute
import com.animeblack.core.navigation.MediaViewerRoute
import com.animeblack.core.navigation.NavResultKeys
import com.animeblack.core.navigation.NewChatRoute
import com.animeblack.core.navigation.ProfileRoute
import com.animeblack.core.navigation.ReportRoute

fun NavGraphBuilder.chatGraph(navController: NavController, openMention: (String) -> Unit) {
    composable<ChatListRoute> {
        ChatListScreen(
            ChatListActions(
                openChat = { chatId, partnerId -> navController.navigate(ChatRoomRoute(chatId = chatId, partnerId = partnerId)) },
                newChat = { navController.navigate(NewChatRoute) },
                openRequests = { navController.navigate(ChatRequestsRoute) },
            ),
        )
    }
    composable<ChatRoomRoute> { entry ->
        ChatRoomDestination(
            entry,
            ChatRoomActions(
                onBack = { navController.popBackStack() },
                openInfo = { chatId, partnerId -> navController.navigate(ChatInfoRoute(chatId, partnerId)) },
                openProfile = { navController.navigate(ProfileRoute(it)) },
                openVideo = { navController.navigate(MediaViewerRoute(it, "video")) },
                openCamera = { navController.navigate(CameraRoute(allowVideo = true)) },
                report = { type, id -> navController.navigate(ReportRoute(type, id)) },
                openMention = openMention,
            ),
        )
    }
    composable<ChatRequestsRoute> {
        ChatRequestsScreen(
            onBack = { navController.popBackStack() },
            openChat = { chatId, partnerId ->
                navController.navigate(ChatRoomRoute(chatId = chatId, partnerId = partnerId)) {
                    popUpTo<ChatRequestsRoute> { inclusive = true }
                }
            },
            openProfile = { navController.navigate(ProfileRoute(it)) },
        )
    }
    composable<NewChatRoute> {
        NewChatScreen(
            onBack = { navController.popBackStack() },
            startChat = { partnerId ->
                navController.navigate(ChatRoomRoute(partnerId = partnerId)) {
                    popUpTo<NewChatRoute> { inclusive = true }
                }
            },
        )
    }
    composable<ChatInfoRoute> {
        ChatInfoScreen(
            onBack = { navController.popBackStack() },
            onDeleted = { navController.popBackStack(ChatListRoute, inclusive = false) },
            openProfile = { navController.navigate(ProfileRoute(it)) },
            openVideo = { navController.navigate(MediaViewerRoute(it, "video")) },
            report = { type, id -> navController.navigate(ReportRoute(type, id)) },
        )
    }
}

@Composable
private fun ChatRoomDestination(entry: NavBackStackEntry, actions: ChatRoomActions) {
    val captured by entry.savedStateHandle.getStateFlow<String?>(NavResultKeys.CAPTURED_MEDIA_URI, null).collectAsStateWithLifecycle()
    val type = entry.savedStateHandle.get<String>(NavResultKeys.CAPTURED_MEDIA_TYPE) ?: "image"
    ChatRoomScreen(
        actions = actions,
        capturedMedia = captured?.let { uri ->
            if (type == "video") LocalMedia(uri = uri, type = "video", mimeType = "video/mp4") else LocalMedia(uri = uri, type = "image", mimeType = "image/jpeg")
        },
        onCapturedConsumed = { entry.savedStateHandle[NavResultKeys.CAPTURED_MEDIA_URI] = null },
    )
}
