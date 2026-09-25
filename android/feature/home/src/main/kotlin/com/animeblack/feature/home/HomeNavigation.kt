package com.animeblack.feature.home

import android.net.Uri
import androidx.compose.runtime.getValue
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.navigation.NavController
import androidx.navigation.NavGraphBuilder
import androidx.navigation.compose.composable
import androidx.navigation.toRoute
import com.animeblack.core.model.LocalMedia
import com.animeblack.core.navigation.CameraRoute
import com.animeblack.core.navigation.CreatePostRoute
import com.animeblack.core.navigation.CreateStoryRoute
import com.animeblack.core.navigation.HomeRoute
import com.animeblack.core.navigation.MediaViewerRoute
import com.animeblack.core.navigation.NavResultKeys
import com.animeblack.core.navigation.PostDetailRoute
import com.animeblack.core.navigation.StoryViewerRoute

/** Registers the home feature destinations. */
fun NavGraphBuilder.homeGraph(navController: NavController, navigator: HomeNavigator) {
    composable<HomeRoute> { HomeScreen(navigator) }
    composable<PostDetailRoute> { PostDetailScreen(navigator, onBack = { navController.popBackStack() }) }
    composable<CreatePostRoute> { entry ->
        val captured by entry.savedStateHandle.getStateFlow<String?>(NavResultKeys.CAPTURED_MEDIA_URI, null).collectAsStateWithLifecycle()
        val capturedType = entry.savedStateHandle.get<String>(NavResultKeys.CAPTURED_MEDIA_TYPE) ?: "image"
        CreatePostScreen(
            onBack = { navController.popBackStack() },
            onOpenCamera = { navController.navigate(CameraRoute(allowVideo = true)) },
            capturedMedia = captured?.let { capturedMedia(it, capturedType) },
            onCapturedConsumed = { entry.savedStateHandle[NavResultKeys.CAPTURED_MEDIA_URI] = null },
        )
    }
    composable<StoryViewerRoute> { StoryViewerScreen(onClose = { navController.popBackStack() }) }
    composable<CreateStoryRoute> { CreateStoryScreen(onClose = { navController.popBackStack() }) }
    composable<CameraRoute> { entry ->
        val route = entry.toRoute<CameraRoute>()
        CameraScreen(
            allowVideo = route.allowVideo,
            onCaptured = { uri: Uri, type: String ->
                navController.previousBackStackEntry?.savedStateHandle?.let { handle ->
                    handle[NavResultKeys.CAPTURED_MEDIA_TYPE] = type
                    handle[NavResultKeys.CAPTURED_MEDIA_URI] = uri.toString()
                }
                navController.popBackStack()
            },
            onClose = { navController.popBackStack() },
        )
    }
    composable<MediaViewerRoute> { entry ->
        val route = entry.toRoute<MediaViewerRoute>()
        MediaViewerScreen(url = route.url, type = route.type, onClose = { navController.popBackStack() })
    }
}

/** Builds a [LocalMedia] for a file produced by [CameraScreen]. */
fun capturedMedia(uri: String, type: String): LocalMedia =
    if (type == "video") LocalMedia(uri = uri, type = "video", mimeType = "video/mp4") else LocalMedia(uri = uri, type = "image", mimeType = "image/jpeg")
