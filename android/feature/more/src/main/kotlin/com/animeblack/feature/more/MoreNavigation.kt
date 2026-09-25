package com.animeblack.feature.more

import androidx.navigation.NavController
import androidx.navigation.NavGraphBuilder
import androidx.navigation.compose.composable
import com.animeblack.core.navigation.EconomyRoute
import com.animeblack.core.navigation.FavoritesRoute
import com.animeblack.core.navigation.LevelsRoute
import com.animeblack.core.navigation.MoreRoute
import com.animeblack.core.navigation.ReportRoute
import com.animeblack.core.navigation.SavedPostsRoute
import com.animeblack.core.navigation.UserPostsRoute
import com.animeblack.core.navigation.WorkspaceRoute

fun NavGraphBuilder.moreGraph(navController: NavController, openMention: (String) -> Unit) {
    val back: () -> Unit = { navController.popBackStack() }
    val navigate: (Any) -> Unit = { navController.navigate(it) }
    composable<MoreRoute> { MoreHubScreen(navigate) }
    composable<EconomyRoute> { EconomyScreen(back) }
    composable<LevelsRoute> { LevelsScreen(back) }
    composable<WorkspaceRoute> { WorkspaceScreen(back) }
    composable<SavedPostsRoute> { SavedPostsScreen(back, navigate, openMention) }
    composable<UserPostsRoute> { UserPostsScreen(back, navigate, openMention) }
    composable<FavoritesRoute> { FavoritesScreen(back, navigate) }
    composable<ReportRoute> { ReportScreen(back) }
}
