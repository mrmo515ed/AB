package com.animeblack.feature.community

import androidx.compose.runtime.getValue
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.navigation.NavController
import androidx.navigation.NavGraphBuilder
import androidx.navigation.NavOptionsBuilder
import androidx.navigation.compose.composable
import com.animeblack.core.navigation.CameraRoute
import com.animeblack.core.navigation.ChannelRoomRoute
import com.animeblack.core.navigation.CommunityDetailRoute
import com.animeblack.core.navigation.CommunityRoute
import com.animeblack.core.navigation.CreateCommunityRoute
import com.animeblack.core.navigation.CreateGroupRoute
import com.animeblack.core.navigation.CreateWorldRoute
import com.animeblack.core.navigation.GroupInfoRoute
import com.animeblack.core.navigation.GroupRoomRoute
import com.animeblack.core.navigation.MediaViewerRoute
import com.animeblack.core.navigation.NavResultKeys
import com.animeblack.core.navigation.ProfileRoute
import com.animeblack.core.navigation.ReportRoute
import com.animeblack.core.navigation.WorldRoomRoute
import com.animeblack.core.model.LocalMedia

/** Registers groups, worlds and guilds destinations. */
fun NavGraphBuilder.communityGraph(navController: NavController, openMention: (String) -> Unit) {
    composable<CommunityRoute> {
        CommunityHubScreen(
            CommunityHubActions(
                openGroup = { navController.navigate(GroupRoomRoute(it)) },
                openWorld = { navController.navigate(WorldRoomRoute(it)) },
                openCommunity = { navController.navigate(CommunityDetailRoute(it)) },
                create = { kind ->
                    navController.navigate(
                        when (kind) {
                            SpaceKind.Group -> CreateGroupRoute
                            SpaceKind.World -> CreateWorldRoute
                            SpaceKind.Community -> CreateCommunityRoute
                        },
                    )
                },
            ),
        )
    }
    val roomActions = RoomActions(
        onBack = { navController.popBackStack() },
        openRoute = { navController.navigate(it) },
        openProfile = { navController.navigate(ProfileRoute(it)) },
        openVideo = { navController.navigate(MediaViewerRoute(it, "video")) },
        openCamera = { navController.navigate(CameraRoute(allowVideo = true)) },
        report = { type, id -> navController.navigate(ReportRoute(type, id)) },
        openMention = openMention,
    )
    composable<GroupRoomRoute> { entry -> RoomDestination(entry, roomActions) }
    composable<WorldRoomRoute> { entry -> RoomDestination(entry, roomActions) }
    composable<ChannelRoomRoute> { entry -> RoomDestination(entry, roomActions) }
    composable<GroupInfoRoute> {
        GroupInfoScreen(
            onBack = { navController.popBackStack() },
            onLeft = { navController.popBackStack(CommunityRoute, inclusive = false) },
            openProfile = { navController.navigate(ProfileRoute(it)) },
        )
    }
    composable<CommunityDetailRoute> {
        CommunityDetailScreen(
            onBack = { navController.popBackStack() },
            openChannel = { communityId, channelId -> navController.navigate(ChannelRoomRoute(communityId, channelId)) },
        )
    }
    composable<CreateGroupRoute> {
        CreateSpaceScreen(SpaceKind.Group, onBack = { navController.popBackStack() }, onCreated = { id ->
            navController.navigate(GroupRoomRoute(id)) { popUpToCurrent(navController) }
        })
    }
    composable<CreateWorldRoute> {
        CreateSpaceScreen(SpaceKind.World, onBack = { navController.popBackStack() }, onCreated = { id ->
            navController.navigate(WorldRoomRoute(id)) { popUpToCurrent(navController) }
        })
    }
    composable<CreateCommunityRoute> {
        CreateSpaceScreen(SpaceKind.Community, onBack = { navController.popBackStack() }, onCreated = { id ->
            navController.navigate(CommunityDetailRoute(id)) { popUpToCurrent(navController) }
        })
    }
}

@androidx.compose.runtime.Composable
private fun RoomDestination(entry: androidx.navigation.NavBackStackEntry, actions: RoomActions) {
    val captured by entry.savedStateHandle.getStateFlow<String?>(NavResultKeys.CAPTURED_MEDIA_URI, null).collectAsStateWithLifecycle()
    val type = entry.savedStateHandle.get<String>(NavResultKeys.CAPTURED_MEDIA_TYPE) ?: "image"
    RoomScreen(
        actions = actions,
        capturedMedia = captured?.let { uri ->
            if (type == "video") LocalMedia(uri = uri, type = "video", mimeType = "video/mp4") else LocalMedia(uri = uri, type = "image", mimeType = "image/jpeg")
        },
        onCapturedConsumed = { entry.savedStateHandle[NavResultKeys.CAPTURED_MEDIA_URI] = null },
    )
}

/** Replace the current (create) screen with the destination. */
private fun NavOptionsBuilder.popUpToCurrent(navController: NavController) {
    navController.currentBackStackEntry?.destination?.id?.let { popUpTo(it) { inclusive = true } }
}
