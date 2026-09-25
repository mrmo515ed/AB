package com.animeblack.app.ui

import android.Manifest
import android.content.ActivityNotFoundException
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.annotation.DrawableRes
import androidx.annotation.StringRes
import androidx.compose.animation.EnterTransition
import androidx.compose.animation.ExitTransition
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.consumeWindowInsets
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.navigationBars
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.safeDrawingPadding
import androidx.compose.foundation.layout.size
import androidx.compose.material3.Badge
import androidx.compose.material3.BadgedBox
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.NavigationRail
import androidx.compose.material3.NavigationRailItem
import androidx.compose.material3.NavigationRailItemDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.key
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalConfiguration
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.core.content.ContextCompat
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.navigation.NavDestination
import androidx.navigation.NavDestination.Companion.hasRoute
import androidx.navigation.NavDestination.Companion.hierarchy
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.animeblack.app.MainViewModel
import com.animeblack.app.R
import com.animeblack.core.data.repository.AuthState
import com.animeblack.core.data.repository.ProfileStatus
import com.animeblack.core.designsystem.component.AbIcon
import com.animeblack.core.designsystem.component.ErrorState
import com.animeblack.core.designsystem.component.GlassButton
import com.animeblack.core.designsystem.component.GradientButton
import com.animeblack.core.designsystem.component.LoadingState
import com.animeblack.core.designsystem.component.OfflineBanner
import com.animeblack.core.designsystem.icon.AbIcons
import com.animeblack.core.designsystem.theme.AbColors
import com.animeblack.core.designsystem.theme.AnimeBlackTheme
import com.animeblack.core.navigation.AccountSwitcherRoute
import com.animeblack.core.navigation.ChatListRoute
import com.animeblack.core.navigation.CommunityRoute
import com.animeblack.core.navigation.CreatePostRoute
import com.animeblack.core.navigation.CreateStoryRoute
import com.animeblack.core.navigation.HomeRoute
import com.animeblack.core.navigation.MediaViewerRoute
import com.animeblack.core.navigation.MoreRoute
import com.animeblack.core.navigation.NotificationsRoute
import com.animeblack.core.navigation.PostDetailRoute
import com.animeblack.core.navigation.ProfileRoute
import com.animeblack.core.navigation.ReelsRoute
import com.animeblack.core.navigation.ReportRoute
import com.animeblack.core.navigation.SearchRoute
import com.animeblack.core.navigation.StoryViewerRoute
import com.animeblack.core.ui.openExternalUrl
import com.animeblack.feature.admin.adminGraph
import com.animeblack.feature.anime.animeGraph
import com.animeblack.feature.auth.AccountSwitcherScreen
import com.animeblack.feature.auth.AuthFlow
import com.animeblack.feature.auth.CompleteProfileScreen
import com.animeblack.feature.chat.chatGraph
import com.animeblack.feature.community.communityGraph
import com.animeblack.feature.games.gamesGraph
import com.animeblack.feature.home.HomeNavigator
import com.animeblack.feature.home.homeGraph
import com.animeblack.feature.more.moreGraph
import com.animeblack.feature.notifications.notificationsGraph
import com.animeblack.feature.profile.profileGraph
import com.animeblack.feature.reels.reelsGraph
import com.animeblack.feature.search.searchGraph
import com.animeblack.feature.settings.settingsGraph

/** Bottom-bar / rail destinations (Home, Community, Chat, Reels, More). */
enum class TopLevelDestination(val route: Any, @DrawableRes val icon: Int, @DrawableRes val selectedIcon: Int, @StringRes val label: Int) {
    Home(HomeRoute, AbIcons.Home, AbIcons.HomeFilled, R.string.nav_home),
    Community(CommunityRoute, AbIcons.Groups, AbIcons.GroupsFilled, R.string.nav_community),
    Chat(ChatListRoute, AbIcons.Chat, AbIcons.ChatFilled, R.string.nav_chat),
    Reels(ReelsRoute, AbIcons.SmartDisplay, AbIcons.SmartDisplayFilled, R.string.nav_reels),
    More(MoreRoute, AbIcons.Apps, AbIcons.AppsFilled, R.string.nav_more),
}

private fun NavDestination?.topLevel(): TopLevelDestination? =
    TopLevelDestination.entries.firstOrNull { d -> this?.hierarchy?.any { it.hasRoute(d.route::class) } == true }

@Composable
fun AnimeBlackApp(viewModel: MainViewModel) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val prefill by viewModel.prefillEmail.collectAsStateWithLifecycle()
    AnimeBlackTheme(amoled = state.amoled) {
        Surface(color = MaterialTheme.colorScheme.background, modifier = Modifier.fillMaxSize()) {
            val context = LocalContext.current
            val auth = state.auth
            when {
                state.updateRequired -> BlockingMessage(
                    title = stringResource(R.string.app_update_title),
                    body = stringResource(R.string.app_update_body),
                    action = stringResource(R.string.app_update_action),
                    onAction = {
                        val market = Intent(Intent.ACTION_VIEW, Uri.parse("market://details?id=${context.packageName}")).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                        try {
                            context.startActivity(market)
                        } catch (_: ActivityNotFoundException) {
                            context.openExternalUrl("https://play.google.com/store/apps/details?id=${context.packageName}")
                        }
                    },
                )
                state.maintenance -> BlockingMessage(
                    title = stringResource(R.string.app_maintenance_title),
                    body = state.maintenanceMessage.ifBlank { stringResource(R.string.app_maintenance_default) },
                )
                auth is AuthState.Initializing -> Box(Modifier.fillMaxSize().background(AbColors.Black))
                auth is AuthState.SignedOut -> key(prefill) { AuthFlow(logoRes = R.drawable.brand_logo, prefillEmail = prefill) }
                auth is AuthState.SignedIn -> when (state.profile) {
                    ProfileStatus.Loading -> LoadingState()
                    ProfileStatus.NeedsCompletion -> CompleteProfileScreen(onDone = {})
                    is ProfileStatus.Error -> Column(
                        Modifier.fillMaxSize().safeDrawingPadding().padding(24.dp),
                        verticalArrangement = Arrangement.Center,
                        horizontalAlignment = Alignment.CenterHorizontally,
                    ) {
                        ErrorState(stringResource(R.string.app_profile_error))
                        GlassButton(stringResource(R.string.app_sign_out), onClick = { viewModel.signOut() }, icon = AbIcons.Logout)
                    }
                    // New account session → fresh navigation state (no screens leak across accounts).
                    ProfileStatus.Ready -> key(auth.uid) { MainScaffold(viewModel, state.reduceMotion) }
                }
            }
        }
    }
}

@Composable
private fun BlockingMessage(title: String, body: String, action: String? = null, onAction: () -> Unit = {}) {
    Column(
        Modifier.fillMaxSize().safeDrawingPadding().padding(32.dp),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        AbIcon(AbIcons.Warning, null, tint = AbColors.Gold, size = 56.dp)
        Text(title, style = MaterialTheme.typography.headlineSmall, textAlign = TextAlign.Center, modifier = Modifier.padding(top = 16.dp))
        Text(body, color = AbColors.TextSecondary, textAlign = TextAlign.Center, modifier = Modifier.padding(top = 8.dp, bottom = 24.dp))
        if (action != null) GradientButton(action, onClick = onAction)
    }
}

@Composable
private fun NotificationPermissionRequest() {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU) return
    val context = LocalContext.current
    val launcher = rememberLauncherForActivityResult(ActivityResultContracts.RequestPermission()) { }
    LaunchedEffect(Unit) {
        if (ContextCompat.checkSelfPermission(context, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
            launcher.launch(Manifest.permission.POST_NOTIFICATIONS)
        }
    }
}

@Composable
private fun MainScaffold(viewModel: MainViewModel, reduceMotion: Boolean) {
    val navController = rememberNavController()
    val entry by navController.currentBackStackEntryAsState()
    val current = entry?.destination.topLevel()
    val chatUnread by viewModel.chatUnread.collectAsStateWithLifecycle()
    val online by viewModel.online.collectAsStateWithLifecycle()
    val pending by viewModel.pendingRoute.collectAsStateWithLifecycle()
    val state by viewModel.state.collectAsStateWithLifecycle()
    val announcementDismissed by viewModel.announcementDismissed.collectAsStateWithLifecycle()
    val wide = LocalConfiguration.current.screenWidthDp >= 600
    val showBottomBar = !wide && current != null

    NotificationPermissionRequest()
    LaunchedEffect(pending) {
        pending?.let { route ->
            navController.navigate(route) { launchSingleTop = true }
            viewModel.consumeRoute()
        }
    }

    fun selectTopLevel(d: TopLevelDestination) {
        navController.navigate(d.route) {
            popUpTo(navController.graph.findStartDestination().id) { saveState = true }
            launchSingleTop = true
            restoreState = true
        }
    }

    Row(Modifier.fillMaxSize().background(MaterialTheme.colorScheme.background)) {
        if (wide && current != null) {
            NavigationRail(containerColor = AbColors.Charcoal) {
                TopLevelDestination.entries.forEach { d ->
                    NavigationRailItem(
                        selected = current == d,
                        onClick = { selectTopLevel(d) },
                        icon = { NavIcon(d, current == d, if (d == TopLevelDestination.Chat) chatUnread else 0) },
                        label = { Text(stringResource(d.label)) },
                        colors = NavigationRailItemDefaults.colors(
                            selectedIconColor = Color.White,
                            selectedTextColor = AbColors.Violet,
                            indicatorColor = AbColors.DeepPurple,
                            unselectedIconColor = AbColors.TextMuted,
                            unselectedTextColor = AbColors.TextMuted,
                        ),
                    )
                }
            }
        }
        Column(Modifier.weight(1f)) {
            Box(
                Modifier.weight(1f).fillMaxWidth()
                    .then(if (showBottomBar) Modifier.consumeWindowInsets(WindowInsets.navigationBars) else Modifier),
            ) {
                AppNavHost(navController, viewModel, reduceMotion)
            }
            OfflineBanner(visible = !online)
            if (state.announcement.isNotBlank() && !announcementDismissed && current != null) {
                Row(
                    Modifier.fillMaxWidth().background(AbColors.DeepPurple).padding(horizontal = 16.dp, vertical = 6.dp),
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    AbIcon(AbIcons.Campaign, null, tint = Color.White, size = 18.dp)
                    Text(state.announcement, color = Color.White, style = MaterialTheme.typography.labelMedium, modifier = Modifier.weight(1f).padding(horizontal = 8.dp), maxLines = 2)
                    TextButton(onClick = viewModel::dismissAnnouncement) { Text(stringResource(R.string.app_dismiss), color = Color.White) }
                }
            }
            if (showBottomBar) {
                NavigationBar(containerColor = AbColors.Charcoal, tonalElevation = 0.dp) {
                    TopLevelDestination.entries.forEach { d ->
                        NavigationBarItem(
                            selected = current == d,
                            onClick = { selectTopLevel(d) },
                            icon = { NavIcon(d, current == d, if (d == TopLevelDestination.Chat) chatUnread else 0) },
                            label = { Text(stringResource(d.label), maxLines = 1) },
                            colors = NavigationBarItemDefaults.colors(
                                selectedIconColor = Color.White,
                                selectedTextColor = AbColors.Violet,
                                indicatorColor = AbColors.DeepPurple,
                                unselectedIconColor = AbColors.TextMuted,
                                unselectedTextColor = AbColors.TextMuted,
                            ),
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun NavIcon(d: TopLevelDestination, selected: Boolean, badge: Int) {
    val icon = if (selected) d.selectedIcon else d.icon
    if (badge > 0) {
        BadgedBox(badge = { Badge(containerColor = AbColors.Rose) { Text(if (badge > 99) "99+" else badge.toString()) } }) {
            AbIcon(icon, stringResource(d.label), size = 24.dp)
        }
    } else {
        AbIcon(icon, stringResource(d.label), modifier = Modifier.size(24.dp))
    }
}

@Composable
private fun AppNavHost(navController: NavHostController, viewModel: MainViewModel, reduceMotion: Boolean) {
    val context = LocalContext.current
    val openMention: (String) -> Unit = { username -> navController.navigate(ProfileRoute(username = username)) }
    val homeNavigator = HomeNavigator(
        openPost = { id, focus -> navController.navigate(PostDetailRoute(id, focus)) },
        openProfile = { uid -> navController.navigate(ProfileRoute(uid)) },
        openStory = { uid -> navController.navigate(StoryViewerRoute(uid)) },
        createStory = { navController.navigate(CreateStoryRoute) },
        createPost = { editId -> navController.navigate(CreatePostRoute(editPostId = editId)) },
        openSearch = { q -> navController.navigate(SearchRoute(q)) },
        openNotifications = { navController.navigate(NotificationsRoute) },
        openMedia = { item -> navController.navigate(MediaViewerRoute(item.src, item.type)) },
        report = { type, id -> navController.navigate(ReportRoute(type, id)) },
        openUrl = { url -> context.openExternalUrl(url) },
        openMention = openMention,
    )
    NavHost(
        navController = navController,
        startDestination = HomeRoute,
        enterTransition = { if (reduceMotion) EnterTransition.None else fadeIn(tween(180)) },
        exitTransition = { if (reduceMotion) ExitTransition.None else fadeOut(tween(120)) },
        popEnterTransition = { if (reduceMotion) EnterTransition.None else fadeIn(tween(180)) },
        popExitTransition = { if (reduceMotion) ExitTransition.None else fadeOut(tween(120)) },
    ) {
        homeGraph(navController, homeNavigator)
        communityGraph(navController, openMention)
        chatGraph(navController, openMention)
        reelsGraph(navController, openMention)
        moreGraph(navController, openMention)
        profileGraph(navController, openMention)
        notificationsGraph(navController)
        searchGraph(navController, openMention)
        settingsGraph(navController)
        animeGraph(navController)
        gamesGraph(navController)
        adminGraph(navController)
        composable<AccountSwitcherRoute> {
            AccountSwitcherScreen(
                onBack = { navController.popBackStack() },
                onSwitch = { account -> viewModel.switchAccount(account) },
                currentUid = viewModel.currentUid,
            )
        }
    }
}
