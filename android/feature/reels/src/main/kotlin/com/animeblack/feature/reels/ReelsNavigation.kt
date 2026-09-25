package com.animeblack.feature.reels

import androidx.compose.runtime.getValue
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.navigation.NavController
import androidx.navigation.NavGraphBuilder
import androidx.navigation.compose.composable
import com.animeblack.core.model.LocalMedia
import com.animeblack.core.navigation.CameraRoute
import com.animeblack.core.navigation.CreateReelRoute
import com.animeblack.core.navigation.NavResultKeys
import com.animeblack.core.navigation.ProfileRoute
import com.animeblack.core.navigation.ReelViewerRoute
import com.animeblack.core.navigation.ReelsRoute
import com.animeblack.core.navigation.ReportRoute
import com.animeblack.core.navigation.SearchRoute

fun NavGraphBuilder.reelsGraph(navController: NavController, openMention: (String) -> Unit) {
    fun actions(onBack: (() -> Unit)?) = ReelsActions(
        create = { navController.navigate(CreateReelRoute) },
        openProfile = { navController.navigate(ProfileRoute(it)) },
        openMention = openMention,
        openHashtag = { navController.navigate(SearchRoute("#$it")) },
        report = { type, id -> navController.navigate(ReportRoute(type, id)) },
        onBack = onBack,
    )
    composable<ReelsRoute> { ReelsScreen(actions(null)) }
    composable<ReelViewerRoute> { ReelsScreen(actions { navController.popBackStack() }) }
    composable<CreateReelRoute> { entry ->
        val captured by entry.savedStateHandle.getStateFlow<String?>(NavResultKeys.CAPTURED_MEDIA_URI, null).collectAsStateWithLifecycle()
        val type = entry.savedStateHandle.get<String>(NavResultKeys.CAPTURED_MEDIA_TYPE)
        CreateReelScreen(
            onBack = { navController.popBackStack() },
            onRecord = { navController.navigate(CameraRoute(allowVideo = true)) },
            capturedVideo = captured?.takeIf { type == "video" }?.let { LocalMedia(uri = it, type = "video", mimeType = "video/mp4") },
            onCapturedConsumed = { entry.savedStateHandle[NavResultKeys.CAPTURED_MEDIA_URI] = null },
        )
    }
}
