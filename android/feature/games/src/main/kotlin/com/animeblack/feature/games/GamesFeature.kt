package com.animeblack.feature.games

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableLongStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.runtime.withFrameNanos
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.LocalConfiguration
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.LayoutDirection
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleEventObserver
import androidx.lifecycle.ViewModel
import androidx.lifecycle.compose.LocalLifecycleOwner
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewModelScope
import androidx.navigation.NavController
import androidx.navigation.NavGraphBuilder
import androidx.navigation.compose.composable
import com.animeblack.core.common.result.AppResult
import com.animeblack.core.data.repository.GameRepository
import com.animeblack.core.data.repository.LeaderboardEntry
import com.animeblack.core.designsystem.component.AbIcon
import com.animeblack.core.designsystem.component.AbIconButton
import com.animeblack.core.designsystem.component.AbTopBar
import com.animeblack.core.designsystem.component.Avatar
import com.animeblack.core.designsystem.component.EmptyState
import com.animeblack.core.designsystem.component.GlassButton
import com.animeblack.core.designsystem.component.GlassCard
import com.animeblack.core.designsystem.component.GradientButton
import com.animeblack.core.designsystem.component.LoadingState
import com.animeblack.core.designsystem.component.Pill
import com.animeblack.core.designsystem.icon.AbIcons
import com.animeblack.core.designsystem.theme.AbColors
import com.animeblack.core.model.GameProfile
import com.animeblack.core.model.GameRunResult
import com.animeblack.core.navigation.GameCharactersRoute
import com.animeblack.core.navigation.GameLeaderboardRoute
import com.animeblack.core.navigation.GamePlayRoute
import com.animeblack.core.navigation.GamesHubRoute
import com.animeblack.core.ui.compactCount
import com.animeblack.core.ui.messageRes
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

@HiltViewModel
class GamesViewModel @Inject constructor(private val repository: GameRepository) : ViewModel() {
    val profile: StateFlow<GameProfile?> = repository.observeProfile().stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), null)
    val leaderboard: StateFlow<List<LeaderboardEntry>?> = repository.observeLeaderboard().stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), null)
    private val _messages = MutableSharedFlow<String>(extraBufferCapacity = 3)

    /** Either a string resource id (as text "res:<id>") or a formatted message. */
    val messages: SharedFlow<String> = _messages.asSharedFlow()
    private val _started = MutableSharedFlow<Unit>(extraBufferCapacity = 1)
    val started: SharedFlow<Unit> = _started.asSharedFlow()
    private val _saved = MutableSharedFlow<GameProfile>(extraBufferCapacity = 1)
    val saved: SharedFlow<GameProfile> = _saved.asSharedFlow()
    private val _claimed = MutableSharedFlow<Long>(extraBufferCapacity = 1)
    val claimed: SharedFlow<Long> = _claimed.asSharedFlow()

    private fun fail(r: AppResult.Failure) {
        _messages.tryEmit("res:" + r.error.messageRes())
    }

    fun start() = viewModelScope.launch {
        when (val r = repository.startRun()) {
            is AppResult.Success -> _started.tryEmit(Unit)
            is AppResult.Failure -> fail(r)
        }
    }

    fun submit(result: GameRunResult) = viewModelScope.launch {
        when (val r = repository.submitRun(result)) {
            is AppResult.Success -> _saved.tryEmit(r.data)
            is AppResult.Failure -> fail(r)
        }
    }

    fun claimDaily() = viewModelScope.launch {
        when (val r = repository.claimDaily()) {
            is AppResult.Success -> _claimed.tryEmit(r.data)
            is AppResult.Failure -> fail(r)
        }
    }

    fun unlock(c: GameCharacter) = viewModelScope.launch {
        val r = if (c.unlockGems > 0) repository.unlockCharacter(c.id, c.unlockGems, "gems") else repository.unlockCharacter(c.id, c.unlockCoins, "coins")
        if (r is AppResult.Failure) fail(r)
    }

    fun upgrade(c: GameCharacter, level: Int) = viewModelScope.launch {
        val r = repository.upgradeCharacter(c.id, upgradeCost(level))
        if (r is AppResult.Failure) fail(r)
    }

    fun select(c: GameCharacter) = viewModelScope.launch {
        val r = repository.selectCharacter(c.id)
        if (r is AppResult.Failure) fail(r)
    }
}

@Composable
private fun rememberSnackbar(viewModel: GamesViewModel): SnackbarHostState {
    val context = LocalContext.current
    val snackbar = remember { SnackbarHostState() }
    LaunchedEffect(Unit) {
        viewModel.messages.collect { m ->
            val text = if (m.startsWith("res:")) context.getString(m.removePrefix("res:").toInt()) else m
            snackbar.showSnackbar(text)
        }
    }
    return snackbar
}

private fun GameCharacter.displayName(rtl: Boolean) = if (rtl) nameAr else nameEn

// ============================================================================ Hub

@Composable
fun GamesHubScreen(onBack: () -> Unit, navigate: (Any) -> Unit, viewModel: GamesViewModel = hiltViewModel()) {
    val profile by viewModel.profile.collectAsStateWithLifecycle()
    val context = LocalContext.current
    val snackbar = rememberSnackbar(viewModel)
    val rtl = LocalLayoutDirection.current == LayoutDirection.Rtl
    var now by remember { mutableLongStateOf(System.currentTimeMillis()) }
    LaunchedEffect(Unit) {
        while (true) {
            now = System.currentTimeMillis()
            delay(15_000)
        }
    }
    LaunchedEffect(Unit) { viewModel.started.collect { navigate(GamePlayRoute) } }
    LaunchedEffect(Unit) { viewModel.claimed.collect { snackbar.showSnackbar(context.getString(R.string.games_claimed, it.toInt())) } }
    Scaffold(topBar = { AbTopBar(title = stringResource(R.string.games_title), onBack = onBack) }, snackbarHost = { SnackbarHost(snackbar) }) { padding ->
        val p = profile
        if (p == null) {
            LoadingState(Modifier.padding(padding))
            return@Scaffold
        }
        val energy = p.currentEnergy(now)
        val character = characterById(p.selectedCharacter)
        LazyColumn(Modifier.fillMaxSize().padding(padding), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            item {
                Column(
                    Modifier.fillMaxWidth().clip(RoundedCornerShape(24.dp))
                        .background(Brush.linearGradient(listOf(Color(0xFF1E1B4B), Color(character.color)))).padding(20.dp),
                ) {
                    Text(stringResource(R.string.games_level, p.level), color = Color.White, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                    Text(character.displayName(rtl), color = Color.White.copy(alpha = 0.85f))
                    Spacer(Modifier.height(10.dp))
                    LinearProgressIndicator(
                        progress = { if (p.xpNext > 0) (p.xp.toFloat() / p.xpNext).coerceIn(0f, 1f) else 0f },
                        modifier = Modifier.fillMaxWidth().height(6.dp).clip(RoundedCornerShape(3.dp)),
                        color = Color.White,
                        trackColor = Color.White.copy(alpha = 0.25f),
                    )
                    Spacer(Modifier.height(12.dp))
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        Pill(stringResource(R.string.games_energy, energy, p.maxEnergy), color = Color(0x55000000), textColor = AbColors.Emerald)
                        Pill(compactCount(p.gold) + " " + stringResource(R.string.games_gold), color = Color(0x55000000), textColor = AbColors.Gold)
                        Pill(compactCount(p.gems) + " " + stringResource(R.string.games_gems), color = Color(0x55000000), textColor = AbColors.Cyan)
                    }
                }
            }
            item {
                GradientButton(
                    stringResource(R.string.games_play, GameProfile.RUN_ENERGY_COST),
                    onClick = { viewModel.start() },
                    enabled = energy >= GameProfile.RUN_ENERGY_COST,
                    icon = AbIcons.PlayArrowFilled,
                    modifier = Modifier.fillMaxWidth(),
                )
                if (energy < GameProfile.RUN_ENERGY_COST) {
                    Text(stringResource(R.string.games_no_energy), color = AbColors.Orange, style = MaterialTheme.typography.labelSmall, modifier = Modifier.padding(top = 6.dp))
                }
            }
            item {
                GlassCard(Modifier.fillMaxWidth()) {
                    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceEvenly) {
                        HubStat(compactCount(p.highScore), stringResource(R.string.games_high_score))
                        HubStat(compactCount(p.bestDistance), stringResource(R.string.games_best_distance))
                        HubStat(compactCount(p.totalKills), stringResource(R.string.games_kills))
                        HubStat(p.gamesPlayed.toString(), stringResource(R.string.games_matches))
                    }
                }
            }
            item {
                GlassCard(Modifier.fillMaxWidth()) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        AbIcon(AbIcons.Redeem, null, tint = AbColors.Gold, size = 28.dp)
                        Spacer(Modifier.width(10.dp))
                        Text(stringResource(R.string.games_daily), modifier = Modifier.weight(1f))
                        GradientButton(stringResource(R.string.games_claim), onClick = { viewModel.claimDaily() }, enabled = now - p.lastDailyAt >= 20 * 60 * 60 * 1000L)
                    }
                }
            }
            item {
                Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    GlassButton(stringResource(R.string.games_characters), onClick = { navigate(GameCharactersRoute) }, icon = AbIcons.Swords, modifier = Modifier.weight(1f))
                    GlassButton(stringResource(R.string.games_leaderboard), onClick = { navigate(GameLeaderboardRoute) }, icon = AbIcons.Leaderboard, modifier = Modifier.weight(1f))
                }
            }
        }
    }
}

@Composable
private fun HubStat(value: String, label: String) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(value, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
        Text(label, style = MaterialTheme.typography.labelSmall, color = AbColors.TextMuted)
    }
}

// ============================================================================ Play

@Composable
fun GamePlayScreen(onExit: () -> Unit, viewModel: GamesViewModel = hiltViewModel()) {
    val profile by viewModel.profile.collectAsStateWithLifecycle()
    val context = LocalContext.current
    val snackbar = rememberSnackbar(viewModel)
    val character = characterById(profile?.selectedCharacter ?: "c_ren")
    var world by remember { mutableStateOf(GameWorld(speedBonus = character.speed / 110f)) }
    var frame by remember { mutableLongStateOf(0L) }
    var paused by remember { mutableStateOf(false) }
    var submitted by remember { mutableStateOf(false) }
    val lifecycleOwner = LocalLifecycleOwner.current
    DisposableEffect(lifecycleOwner) {
        val observer = LifecycleEventObserver { _, e -> if (e == Lifecycle.Event.ON_PAUSE) paused = true }
        lifecycleOwner.lifecycle.addObserver(observer)
        onDispose { lifecycleOwner.lifecycle.removeObserver(observer) }
    }
    LaunchedEffect(world, paused) {
        var last = withFrameNanos { it }
        while (!world.over && !paused) {
            withFrameNanos { t ->
                world.step((t - last) / 1_000_000_000f)
                last = t
                frame = t
            }
        }
    }
    LaunchedEffect(Unit) { viewModel.saved.collect { p -> snackbar.showSnackbar(context.getString(R.string.games_saved, p.level, p.gold.toInt())) } }
    LaunchedEffect(Unit) { viewModel.started.collect { world = GameWorld(speedBonus = character.speed / 110f); submitted = false } }

    // Reading the frame tick here re-runs this scope every frame so HUD text and the
    // game-over card reflect the (non-snapshot) simulation state.
    val tick = frame
    Box(Modifier.fillMaxSize().background(Brush.verticalGradient(listOf(Color(0xFF05050F), Color(0xFF1E1B4B))))) {
        val heightDp = LocalConfiguration.current.screenHeightDp
        Canvas(
            Modifier.fillMaxSize().pointerInput(world) { detectTapGestures(onTap = { if (!paused) world.jump() }) },
        ) {
            if (tick < 0L) return@Canvas
            val scale = size.width / 800f
            val groundY = size.height * 0.72f
            drawRect(Color(0xFF12121B), topLeft = Offset(0f, groundY), size = Size(size.width, size.height - groundY))
            drawLine(AbColors.Violet, Offset(0f, groundY), Offset(size.width, groundY), strokeWidth = 3f)
            // Player
            val px = GameWorld.PLAYER_X * scale
            val pSize = GameWorld.PLAYER_SIZE * scale
            val py = groundY - (world.playerY * scale) - pSize
            drawRoundRect(Color(character.color), topLeft = Offset(px, py), size = Size(pSize, pSize), cornerRadius = CornerRadius(pSize / 3))
            if (world.attackTimer > 0f) {
                drawArc(Color.White.copy(alpha = 0.8f), -60f, 120f, false, topLeft = Offset(px + pSize * 0.3f, py - pSize * 0.4f), size = Size(pSize * 1.8f, pSize * 1.8f), style = androidx.compose.ui.graphics.drawscope.Stroke(width = 6f))
            }
            world.entities.forEach { e ->
                val ex = e.x * scale
                val ew = e.w * scale
                val eh = e.h * scale
                val ey = groundY - e.y * scale - eh
                when (e.kind) {
                    EntityKind.Obstacle -> {
                        val path = Path().apply {
                            moveTo(ex, groundY)
                            lineTo(ex + ew / 2, ey)
                            lineTo(ex + ew, groundY)
                            close()
                        }
                        drawPath(path, AbColors.Rose)
                    }
                    EntityKind.Enemy -> drawCircle(AbColors.Orange, radius = ew / 2, center = Offset(ex + ew / 2, ey + eh / 2))
                    EntityKind.Coin -> drawCircle(AbColors.Gold, radius = ew / 2, center = Offset(ex + ew / 2, ey + eh / 2))
                }
            }
        }
        Row(
            Modifier.align(Alignment.TopCenter).fillMaxWidth().statusBarsPadding().padding(12.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            AbIconButton(AbIcons.Close, stringResource(R.string.games_exit), onClick = onExit, tint = Color.White)
            Text(stringResource(R.string.games_score, world.score.toInt()), color = Color.White, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold, modifier = Modifier.weight(1f))
            Text(stringResource(R.string.games_distance, world.distance.toInt()), color = AbColors.Cyan)
            Spacer(Modifier.width(8.dp))
            AbIconButton(if (paused) AbIcons.PlayArrowFilled else AbIcons.Pause, stringResource(if (paused) R.string.games_resume else R.string.games_paused), onClick = { paused = !paused }, tint = Color.White)
        }
        if (!world.over) {
            Text(
                stringResource(R.string.games_tap_jump),
                color = Color.White.copy(alpha = 0.6f),
                style = MaterialTheme.typography.labelSmall,
                modifier = Modifier.align(Alignment.Center).padding(top = (heightDp * 0.2f).dp),
            )
            GradientButton(
                stringResource(R.string.games_attack),
                onClick = { world.attack() },
                icon = AbIcons.Swords,
                modifier = Modifier.align(Alignment.BottomEnd).navigationBarsPadding().padding(24.dp).size(width = 140.dp, height = 56.dp),
            )
        } else {
            GlassCard(Modifier.align(Alignment.Center).padding(24.dp)) {
                Column(horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Text(stringResource(R.string.games_game_over), style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold)
                    Text(stringResource(R.string.games_result, world.score.toInt(), world.distance.toInt(), world.kills, world.coins), color = AbColors.TextSecondary)
                    if (!submitted) {
                        GradientButton(stringResource(R.string.games_submit), onClick = {
                            submitted = true
                            viewModel.submit(GameRunResult(world.score, world.distance.toLong(), world.kills.toLong(), world.coins.toLong(), (world.elapsed * 1000).toLong()))
                        }, icon = AbIcons.CloudUpload)
                    } else {
                        GradientButton(stringResource(R.string.games_again), onClick = { viewModel.start() }, icon = AbIcons.Refresh)
                    }
                    GlassButton(stringResource(R.string.games_exit), onClick = onExit)
                }
            }
        }
        SnackbarHost(snackbar, Modifier.align(Alignment.BottomCenter).navigationBarsPadding())
    }
}

// ============================================================================ Characters

@Composable
fun GameCharactersScreen(onBack: () -> Unit, viewModel: GamesViewModel = hiltViewModel()) {
    val profile by viewModel.profile.collectAsStateWithLifecycle()
    val snackbar = rememberSnackbar(viewModel)
    val rtl = LocalLayoutDirection.current == LayoutDirection.Rtl
    Scaffold(topBar = { AbTopBar(title = stringResource(R.string.games_characters), onBack = onBack) }, snackbarHost = { SnackbarHost(snackbar) }) { padding ->
        val p = profile
        if (p == null) {
            LoadingState(Modifier.padding(padding))
            return@Scaffold
        }
        LazyColumn(Modifier.fillMaxSize().padding(padding), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
            itemsIndexed(GAME_CHARACTERS, key = { _, c -> c.id }) { _, c ->
                val state = p.characters.firstOrNull { it.id == c.id }
                val unlocked = c.id == "c_ren" || state?.unlocked == true
                val level = state?.level ?: 1
                val equipped = p.selectedCharacter == c.id
                GlassCard(Modifier.fillMaxWidth()) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(Modifier.size(54.dp).clip(RoundedCornerShape(16.dp)).background(Color(c.color)), contentAlignment = Alignment.Center) {
                            AbIcon(if (unlocked) AbIcons.Swords else AbIcons.Lock, null, tint = Color.White)
                        }
                        Spacer(Modifier.width(12.dp))
                        Column(Modifier.weight(1f)) {
                            Text(c.displayName(rtl), style = MaterialTheme.typography.titleSmall)
                            Text(c.rarity + " · " + stringResource(R.string.games_level_short, level), style = MaterialTheme.typography.labelSmall, color = AbColors.TextMuted)
                        }
                        if (equipped) Pill(stringResource(R.string.games_equipped), color = AbColors.Emerald)
                    }
                    Spacer(Modifier.height(10.dp))
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        when {
                            !unlocked && c.unlockGems > 0 -> GradientButton(stringResource(R.string.games_unlock_gems, c.unlockGems.toInt()), onClick = { viewModel.unlock(c) }, enabled = p.gems >= c.unlockGems, modifier = Modifier.weight(1f))
                            !unlocked -> GradientButton(stringResource(R.string.games_unlock_coins, c.unlockCoins.toInt()), onClick = { viewModel.unlock(c) }, enabled = p.gold >= c.unlockCoins, modifier = Modifier.weight(1f))
                            else -> {
                                if (!equipped) GlassButton(stringResource(R.string.games_equip), onClick = { viewModel.select(c) }, modifier = Modifier.weight(1f))
                                GradientButton(stringResource(R.string.games_upgrade, upgradeCost(level).toInt()), onClick = { viewModel.upgrade(c, level) }, enabled = p.gold >= upgradeCost(level), modifier = Modifier.weight(1f))
                            }
                        }
                    }
                }
            }
        }
    }
}

// ============================================================================ Leaderboard

@Composable
fun GameLeaderboardScreen(onBack: () -> Unit, viewModel: GamesViewModel = hiltViewModel()) {
    val board by viewModel.leaderboard.collectAsStateWithLifecycle()
    Scaffold(topBar = { AbTopBar(title = stringResource(R.string.games_leaderboard), onBack = onBack) }) { padding ->
        val list = board
        when {
            list == null -> LoadingState(Modifier.padding(padding))
            list.isEmpty() -> EmptyState(title = stringResource(R.string.games_empty_board), icon = AbIcons.Leaderboard, modifier = Modifier.padding(padding))
            else -> LazyColumn(Modifier.fillMaxSize().padding(padding), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                itemsIndexed(list, key = { _, e -> e.uid }) { i, e ->
                    Row(
                        Modifier.fillMaxWidth().clip(RoundedCornerShape(16.dp)).background(if (i < 3) AbColors.DeepPurple.copy(alpha = 0.25f) else AbColors.Charcoal2).padding(12.dp),
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        Text(stringResource(R.string.games_rank, i + 1), style = MaterialTheme.typography.titleMedium, color = if (i < 3) AbColors.Gold else AbColors.TextMuted, modifier = Modifier.width(44.dp))
                        Avatar(e.avatar, e.name, size = 40.dp)
                        Spacer(Modifier.width(10.dp))
                        Column(Modifier.weight(1f)) {
                            Text(e.name, style = MaterialTheme.typography.titleSmall)
                            Text(stringResource(R.string.games_level_short, e.level), style = MaterialTheme.typography.labelSmall, color = AbColors.TextMuted)
                        }
                        Text(compactCount(e.score), style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold, color = AbColors.Cyan)
                    }
                }
            }
        }
    }
}

fun NavGraphBuilder.gamesGraph(navController: NavController) {
    val back: () -> Unit = { navController.popBackStack() }
    composable<GamesHubRoute> { GamesHubScreen(back, navigate = { navController.navigate(it) }) }
    composable<GamePlayRoute> { GamePlayScreen(onExit = back) }
    composable<GameCharactersRoute> { GameCharactersScreen(back) }
    composable<GameLeaderboardRoute> { GameLeaderboardScreen(back) }
}
