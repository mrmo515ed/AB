package com.animeblack.feature.profile

import androidx.navigation.NavController
import androidx.navigation.NavGraphBuilder
import androidx.navigation.compose.composable
import com.animeblack.core.navigation.ChatRoomRoute
import com.animeblack.core.navigation.CreatePostRoute
import com.animeblack.core.navigation.EditProfileRoute
import com.animeblack.core.navigation.FollowListRoute
import com.animeblack.core.navigation.MediaViewerRoute
import com.animeblack.core.navigation.PostDetailRoute
import com.animeblack.core.navigation.ProfileRoute
import com.animeblack.core.navigation.QrCardRoute
import com.animeblack.core.navigation.ReelViewerRoute
import com.animeblack.core.navigation.ReportRoute
import com.animeblack.core.navigation.SearchRoute

fun NavGraphBuilder.profileGraph(navController: NavController, openMention: (String) -> Unit) {
    composable<ProfileRoute> {
        ProfileScreen(
            ProfileActions(
                onBack = { navController.popBackStack() },
                editProfile = { navController.navigate(EditProfileRoute) },
                openFollowList = { uid, followers -> navController.navigate(FollowListRoute(uid, followers)) },
                message = { uid -> navController.navigate(ChatRoomRoute(partnerId = uid)) },
                openQr = { navController.navigate(QrCardRoute) },
                openPost = { id, focus -> navController.navigate(PostDetailRoute(id, focus)) },
                openProfile = { navController.navigate(ProfileRoute(it)) },
                openReel = { navController.navigate(ReelViewerRoute(it)) },
                openMedia = { item -> navController.navigate(MediaViewerRoute(item.src, item.type)) },
                openSearch = { navController.navigate(SearchRoute(it)) },
                openMention = openMention,
                report = { type, id -> navController.navigate(ReportRoute(type, id)) },
                editPost = { id -> navController.navigate(CreatePostRoute(editPostId = id)) },
            ),
        )
    }
    composable<EditProfileRoute> { EditProfileScreen(onBack = { navController.popBackStack() }) }
    composable<FollowListRoute> {
        FollowListScreen(onBack = { navController.popBackStack() }, openProfile = { navController.navigate(ProfileRoute(it)) })
    }
    composable<QrCardRoute> { QrCardScreen(onBack = { navController.popBackStack() }) }
}
