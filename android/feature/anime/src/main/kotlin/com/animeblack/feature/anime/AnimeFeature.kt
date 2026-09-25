package com.animeblack.feature.anime

import android.text.format.DateUtils
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.FilterChip
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.material3.TextField
import androidx.compose.material3.TextFieldDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewModelScope
import androidx.navigation.NavController
import androidx.navigation.NavGraphBuilder
import androidx.navigation.compose.composable
import androidx.navigation.toRoute
import coil3.compose.AsyncImage
import com.animeblack.core.common.result.AppResult
import com.animeblack.core.data.repository.AnimeRepository
import com.animeblack.core.designsystem.component.AbIcon
import com.animeblack.core.designsystem.component.AbIconButton
import com.animeblack.core.designsystem.component.AbTopBar
import com.animeblack.core.designsystem.component.EmptyState
import com.animeblack.core.designsystem.component.ErrorState
import com.animeblack.core.designsystem.component.GlassButton
import com.animeblack.core.designsystem.component.GlassCard
import com.animeblack.core.designsystem.component.LoadingState
import com.animeblack.core.designsystem.component.Pill
import com.animeblack.core.designsystem.component.SearchField
import com.animeblack.core.designsystem.component.SectionHeader
import com.animeblack.core.designsystem.icon.AbIcons
import com.animeblack.core.designsystem.theme.AbColors
import com.animeblack.core.model.AgentSource
import com.animeblack.core.model.AnimeItem
import com.animeblack.core.navigation.AnimeDetailRoute
import com.animeblack.core.navigation.AnimeHubRoute
import com.animeblack.core.navigation.SearchAgentRoute
import com.animeblack.core.ui.LinkifiedText
import com.animeblack.core.ui.messageRes
import com.animeblack.core.ui.openExternalUrl
import com.animeblack.core.ui.shareText
import dagger.hilt.android.lifecycle.HiltViewModel
import java.util.Locale
import javax.inject.Inject
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.debounce
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.flow.transformLatest
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

// ============================================================================ Hub

data class AnimeHubUiState(
    val loading: Boolean = true,
    val error: Boolean = false,
    val trending: List<AnimeItem> = emptyList(),
    val seasonal: List<AnimeItem> = emptyList(),
    val query: String = "",
    val mediaType: String = "ANIME",
    val searching: Boolean = false,
    val results: List<AnimeItem>? = null,
)

@HiltViewModel
class AnimeHubViewModel @Inject constructor(private val repository: AnimeRepository) : ViewModel() {
    private val base = MutableStateFlow(AnimeHubUiState())
    val query = MutableStateFlow("")
    val mediaType = MutableStateFlow("ANIME")

    private val search = combine(query.debounce(400), mediaType) { q, t -> q.trim() to t }
        .distinctUntilChanged()
        .transformLatest<Pair<String, String>, Triple<String, Boolean, List<AnimeItem>?>> { (q, t) ->
            if (q.length < 2) {
                emit(Triple(q, false, null))
                return@transformLatest
            }
            emit(Triple(q, true, null))
            emit(Triple(q, false, (repository.search(q, t) as? AppResult.Success)?.data.orEmpty()))
        }

    val state: StateFlow<AnimeHubUiState> = combine(base, search, mediaType) { b, (q, searching, results), t ->
        b.copy(query = q, searching = searching, results = results, mediaType = t)
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), AnimeHubUiState())

    init {
        load()
    }

    fun load() = viewModelScope.launch {
        base.update { it.copy(loading = true, error = false) }
        val trending = repository.trending()
        val seasonal = repository.seasonal()
        base.update {
            it.copy(
                loading = false,
                error = trending is AppResult.Failure && seasonal is AppResult.Failure,
                trending = (trending as? AppResult.Success)?.data.orEmpty(),
                seasonal = (seasonal as? AppResult.Success)?.data.orEmpty(),
            )
        }
    }
}

@Composable
fun AnimeHubScreen(onBack: () -> Unit, navigate: (Any) -> Unit, viewModel: AnimeHubViewModel = hiltViewModel()) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val query by viewModel.query.collectAsStateWithLifecycle()
    Scaffold(
        topBar = {
            AbTopBar(
                title = stringResource(R.string.anime_title),
                onBack = onBack,
                actions = { AbIconButton(AbIcons.AutoAwesome, stringResource(R.string.agent_title), onClick = { navigate(SearchAgentRoute) }, tint = AbColors.Cyan) },
            )
        },
    ) { padding ->
        LazyColumn(Modifier.fillMaxSize().padding(padding), contentPadding = PaddingValues(bottom = 24.dp)) {
            item {
                SearchField(query = query, onQueryChange = { viewModel.query.value = it }, placeholder = stringResource(R.string.anime_search), modifier = Modifier.fillMaxWidth().padding(16.dp))
                Row(Modifier.padding(horizontal = 16.dp), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    FilterChip(selected = state.mediaType == "ANIME", onClick = { viewModel.mediaType.value = "ANIME" }, label = { Text(stringResource(R.string.anime_title)) })
                    FilterChip(selected = state.mediaType == "MANGA", onClick = { viewModel.mediaType.value = "MANGA" }, label = { Text(stringResource(R.string.anime_manga)) })
                }
            }
            val results = state.results
            when {
                state.searching -> item { LoadingState(Modifier.padding(32.dp)) }
                results != null -> {
                    if (results.isEmpty()) item { EmptyState(title = stringResource(R.string.anime_no_results), icon = AbIcons.Search) }
                    items(results, key = { it.source + it.id }) { a -> AnimeRow(a) { navigate(AnimeDetailRoute(a.id, a.mediaType)) } }
                }
                state.loading -> item { LoadingState(Modifier.padding(32.dp)) }
                state.error -> item { ErrorState(stringResource(R.string.anime_error), onRetry = { viewModel.load() }) }
                else -> {
                    item { SectionHeader(stringResource(R.string.anime_trending), modifier = Modifier.padding(horizontal = 16.dp)) }
                    item { Carousel(state.trending) { navigate(AnimeDetailRoute(it.id, it.mediaType)) } }
                    item { SectionHeader(stringResource(R.string.anime_seasonal), modifier = Modifier.padding(horizontal = 16.dp)) }
                    items(state.seasonal, key = { "s_" + it.source + it.id }) { a -> AnimeRow(a) { navigate(AnimeDetailRoute(a.id, a.mediaType)) } }
                }
            }
        }
    }
}

@Composable
private fun Carousel(items: List<AnimeItem>, onClick: (AnimeItem) -> Unit) {
    LazyRow(contentPadding = PaddingValues(horizontal = 16.dp), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
        items(items, key = { it.source + it.id }) { a ->
            Column(Modifier.width(128.dp).clickable { onClick(a) }) {
                Box {
                    AsyncImage(
                        model = a.coverUrl,
                        contentDescription = a.title,
                        contentScale = ContentScale.Crop,
                        modifier = Modifier.fillMaxWidth().aspectRatio(0.7f).clip(RoundedCornerShape(16.dp)).background(AbColors.Charcoal3),
                    )
                    a.score?.let { score ->
                        Pill(String.format(Locale.US, "%.1f", score), color = Color(0xCC000000), textColor = AbColors.Gold, modifier = Modifier.align(Alignment.TopEnd).padding(6.dp))
                    }
                }
                Spacer(Modifier.height(6.dp))
                Text(a.title, style = MaterialTheme.typography.labelLarge, maxLines = 2, overflow = TextOverflow.Ellipsis)
            }
        }
    }
}

@Composable
private fun AnimeRow(a: AnimeItem, onClick: () -> Unit) {
    Row(Modifier.fillMaxWidth().clickable(onClick = onClick).padding(horizontal = 16.dp, vertical = 8.dp), verticalAlignment = Alignment.CenterVertically) {
        AsyncImage(model = a.coverUrl, contentDescription = a.title, contentScale = ContentScale.Crop, modifier = Modifier.size(width = 58.dp, height = 82.dp).clip(RoundedCornerShape(12.dp)).background(AbColors.Charcoal3))
        Spacer(Modifier.width(12.dp))
        Column(Modifier.weight(1f)) {
            Text(a.title, style = MaterialTheme.typography.titleSmall, maxLines = 2, overflow = TextOverflow.Ellipsis)
            Text(
                listOfNotNull(a.format.ifBlank { null }, a.year?.toString(), a.episodes?.let { "$it EP" }, a.score?.let { String.format(Locale.US, "★ %.1f", it) }).joinToString(" · "),
                style = MaterialTheme.typography.labelSmall,
                color = AbColors.TextMuted,
            )
            Text(a.genres.take(3).joinToString(", "), style = MaterialTheme.typography.labelSmall, color = AbColors.Violet, maxLines = 1)
        }
    }
}

// ============================================================================ Detail

data class AnimeDetailUiState(val loading: Boolean = true, val error: Boolean = false, val item: AnimeItem? = null, val favorite: Boolean = false)

@HiltViewModel
class AnimeDetailViewModel @Inject constructor(savedStateHandle: SavedStateHandle, private val repository: AnimeRepository) : ViewModel() {
    private val route = savedStateHandle.toRoute<AnimeDetailRoute>()
    private val base = MutableStateFlow(AnimeDetailUiState())
    private val _messages = MutableSharedFlow<Int>(extraBufferCapacity = 2)
    val messages: SharedFlow<Int> = _messages.asSharedFlow()

    val state: StateFlow<AnimeDetailUiState> = combine(base, repository.observeFavorites()) { b, fav ->
        b.copy(favorite = b.item != null && "${b.item.source}:${b.item.id}" in fav)
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), AnimeDetailUiState())

    init {
        load()
    }

    fun load() = viewModelScope.launch {
        base.update { it.copy(loading = true, error = false) }
        when (val r = repository.detail(route.id, route.mediaType)) {
            is AppResult.Success -> {
                base.update { it.copy(loading = false, item = r.data) }
                repository.addToHistory(r.data)
            }
            is AppResult.Failure -> base.update { it.copy(loading = false, error = true) }
        }
    }

    fun toggleFavorite() {
        val item = base.value.item ?: return
        viewModelScope.launch {
            val r = repository.toggleFavorite(item)
            if (r is AppResult.Failure) _messages.tryEmit(r.error.messageRes())
        }
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun AnimeDetailScreen(onBack: () -> Unit, viewModel: AnimeDetailViewModel = hiltViewModel()) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val context = LocalContext.current
    val snackbar = remember { SnackbarHostState() }
    LaunchedEffect(Unit) { viewModel.messages.collect { snackbar.showSnackbar(context.getString(it)) } }
    val a = state.item
    Scaffold(
        topBar = {
            AbTopBar(
                title = a?.title.orEmpty(),
                onBack = onBack,
                actions = {
                    if (a != null) {
                        AbIconButton(
                            if (state.favorite) AbIcons.FavoriteFilled else AbIcons.Favorite,
                            stringResource(if (state.favorite) R.string.anime_unfavorite else R.string.anime_favorite),
                            onClick = viewModel::toggleFavorite,
                            tint = if (state.favorite) AbColors.Rose else AbColors.TextPrimary,
                        )
                        AbIconButton(AbIcons.Share, stringResource(R.string.anime_share), onClick = {
                            context.shareText(a.title + "\n" + a.siteUrl, context.getString(com.animeblack.core.ui.R.string.ui_share_via))
                        })
                    }
                },
            )
        },
        snackbarHost = { SnackbarHost(snackbar) },
    ) { padding ->
        when {
            state.loading -> LoadingState(Modifier.padding(padding))
            state.error || a == null -> ErrorState(stringResource(R.string.anime_error), modifier = Modifier.padding(padding), onRetry = { viewModel.load() })
            else -> LazyColumn(Modifier.fillMaxSize().padding(padding), contentPadding = PaddingValues(bottom = 32.dp)) {
                item {
                    Box {
                        AsyncImage(
                            model = a.bannerUrl.ifBlank { a.coverUrl },
                            contentDescription = null,
                            contentScale = ContentScale.Crop,
                            modifier = Modifier.fillMaxWidth().aspectRatio(2.2f).background(AbColors.Charcoal3),
                        )
                        Box(Modifier.matchParentSize().background(Brush.verticalGradient(listOf(Color.Transparent, AbColors.Black))))
                        Row(Modifier.align(Alignment.BottomStart).padding(16.dp).offset(y = 40.dp), verticalAlignment = Alignment.Bottom) {
                            AsyncImage(model = a.coverUrl, contentDescription = a.title, contentScale = ContentScale.Crop, modifier = Modifier.size(width = 104.dp, height = 148.dp).clip(RoundedCornerShape(16.dp)))
                            Spacer(Modifier.width(12.dp))
                            Column(Modifier.padding(bottom = 44.dp)) {
                                Text(a.title, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold, maxLines = 3)
                                if (a.titleNative.isNotBlank()) Text(a.titleNative, color = AbColors.TextSecondary, style = MaterialTheme.typography.bodySmall)
                            }
                        }
                    }
                }
                item {
                    Column(Modifier.padding(start = 16.dp, end = 16.dp, top = 52.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                        FlowRow(horizontalArrangement = Arrangement.spacedBy(6.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                            a.score?.let { Pill(stringResource(R.string.anime_score, String.format(Locale.US, "%.1f", it)), color = AbColors.Charcoal3, textColor = AbColors.Gold) }
                            if (a.format.isNotBlank()) Pill(a.format, color = AbColors.Charcoal3)
                            if (a.status.isNotBlank()) Pill(a.status, color = AbColors.Charcoal3)
                            a.episodes?.let { Pill(stringResource(R.string.anime_episodes, it), color = AbColors.Charcoal3) }
                            a.chapters?.let { Pill(stringResource(R.string.anime_chapters, it), color = AbColors.Charcoal3) }
                            if (a.season.isNotBlank() || a.year != null) Pill(listOfNotNull(a.season.ifBlank { null }, a.year?.toString()).joinToString(" "), color = AbColors.Charcoal3)
                        }
                        if (a.nextEpisode != null && a.nextAiringAt != null) {
                            GlassCard(Modifier.fillMaxWidth()) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    AbIcon(AbIcons.Schedule, null, tint = AbColors.Cyan)
                                    Spacer(Modifier.width(8.dp))
                                    Text(stringResource(R.string.anime_next_episode, a.nextEpisode ?: 0, DateUtils.getRelativeTimeSpanString(a.nextAiringAt ?: 0L).toString()))
                                }
                            }
                        }
                        if (a.genres.isNotEmpty()) {
                            FlowRow(horizontalArrangement = Arrangement.spacedBy(6.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                                a.genres.forEach { Pill(it, color = AbColors.DeepPurple) }
                            }
                        }
                        if (a.studios.isNotEmpty()) Text(stringResource(R.string.anime_studios) + ": " + a.studios.joinToString(", "), color = AbColors.TextSecondary, style = MaterialTheme.typography.bodySmall)
                        SectionHeader(stringResource(R.string.anime_synopsis))
                        Text(a.description, style = MaterialTheme.typography.bodyMedium, color = AbColors.TextPrimary)
                        if (a.siteUrl.isNotBlank()) {
                            GlassButton(stringResource(R.string.anime_open_site), onClick = { context.openExternalUrl(a.siteUrl) }, icon = AbIcons.Link)
                        }
                        if (a.characters.isNotEmpty()) SectionHeader(stringResource(R.string.anime_characters))
                    }
                }
                if (a.characters.isNotEmpty()) {
                    item {
                        LazyRow(contentPadding = PaddingValues(horizontal = 16.dp), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                            items(a.characters, key = { it.id }) { c ->
                                Column(Modifier.width(84.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                                    AsyncImage(model = c.imageUrl, contentDescription = c.name, contentScale = ContentScale.Crop, modifier = Modifier.size(72.dp).clip(CircleShape).background(AbColors.Charcoal3))
                                    Text(c.name, style = MaterialTheme.typography.labelSmall, maxLines = 2, overflow = TextOverflow.Ellipsis)
                                    Text(c.role, style = MaterialTheme.typography.labelSmall, color = AbColors.TextMuted, maxLines = 1)
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

// ============================================================================ Search agent

data class AgentTurn(val fromUser: Boolean, val text: String, val sources: List<AgentSource> = emptyList())

data class AgentUiState(
    val configured: Boolean = true,
    val mode: String = "general",
    val turns: List<AgentTurn> = emptyList(),
    val thinking: Boolean = false,
    val input: String = "",
)

@HiltViewModel
class SearchAgentViewModel @Inject constructor(private val repository: AnimeRepository) : ViewModel() {
    private val _state = MutableStateFlow(AgentUiState(configured = repository.isAgentConfigured))
    val state: StateFlow<AgentUiState> = _state.asStateFlow()
    private val _messages = MutableSharedFlow<Int>(extraBufferCapacity = 2)
    val messages: SharedFlow<Int> = _messages.asSharedFlow()

    fun onInput(v: String) = _state.update { it.copy(input = v.take(2_000)) }
    fun onMode(m: String) = _state.update { it.copy(mode = m) }
    fun clear() = _state.update { it.copy(turns = emptyList()) }

    fun ask() {
        val s = _state.value
        val prompt = s.input.trim()
        if (prompt.isEmpty() || s.thinking || !s.configured) return
        val history = s.turns.takeLast(6).map { (if (it.fromUser) "user" else "agent") to it.text }
        _state.update { it.copy(input = "", thinking = true, turns = it.turns + AgentTurn(true, prompt)) }
        viewModelScope.launch {
            when (val r = repository.askAgent(prompt, s.mode, history)) {
                is AppResult.Success -> _state.update { it.copy(thinking = false, turns = it.turns + AgentTurn(false, r.data.answer, r.data.sources)) }
                is AppResult.Failure -> {
                    _state.update { it.copy(thinking = false) }
                    _messages.tryEmit(r.error.messageRes())
                }
            }
        }
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun SearchAgentScreen(onBack: () -> Unit, viewModel: SearchAgentViewModel = hiltViewModel()) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val context = LocalContext.current
    val snackbar = remember { SnackbarHostState() }
    val listState = rememberLazyListState()
    LaunchedEffect(Unit) { viewModel.messages.collect { snackbar.showSnackbar(context.getString(it)) } }
    LaunchedEffect(state.turns.size, state.thinking) { if (state.turns.isNotEmpty()) listState.animateScrollToItem(state.turns.size) }
    Scaffold(
        topBar = {
            AbTopBar(
                title = stringResource(R.string.agent_title),
                onBack = onBack,
                actions = { if (state.turns.isNotEmpty()) AbIconButton(AbIcons.Refresh, stringResource(R.string.agent_clear), onClick = viewModel::clear) },
            )
        },
        snackbarHost = { SnackbarHost(snackbar) },
        bottomBar = {
            Column(Modifier.fillMaxWidth().background(AbColors.Charcoal).navigationBarsPadding().imePadding().padding(8.dp)) {
                Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    listOf("general" to R.string.agent_mode_general, "factcheck" to R.string.agent_mode_factcheck, "release_schedule" to R.string.agent_mode_schedule).forEach { (key, label) ->
                        FilterChip(selected = state.mode == key, onClick = { viewModel.onMode(key) }, label = { Text(stringResource(label)) })
                    }
                }
                Row(verticalAlignment = Alignment.CenterVertically) {
                    TextField(
                        value = state.input,
                        onValueChange = viewModel::onInput,
                        placeholder = { Text(stringResource(R.string.agent_hint)) },
                        enabled = state.configured,
                        maxLines = 4,
                        shape = RoundedCornerShape(24.dp),
                        colors = TextFieldDefaults.colors(
                            focusedContainerColor = AbColors.Charcoal3,
                            unfocusedContainerColor = AbColors.Charcoal3,
                            disabledContainerColor = AbColors.Charcoal3,
                            focusedIndicatorColor = Color.Transparent,
                            unfocusedIndicatorColor = Color.Transparent,
                            disabledIndicatorColor = Color.Transparent,
                        ),
                        modifier = Modifier.weight(1f),
                    )
                    AbIconButton(AbIcons.Send, stringResource(com.animeblack.core.ui.R.string.ui_send), onClick = viewModel::ask, enabled = state.configured && state.input.isNotBlank() && !state.thinking, tint = AbColors.Cyan)
                }
            }
        },
    ) { padding ->
        LazyColumn(state = listState, modifier = Modifier.fillMaxSize().padding(padding), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
            item {
                GlassCard(Modifier.fillMaxWidth()) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        AbIcon(AbIcons.AutoAwesome, null, tint = AbColors.Cyan)
                        Spacer(Modifier.width(10.dp))
                        Text(stringResource(if (state.configured) R.string.agent_intro else R.string.agent_not_configured), color = AbColors.TextSecondary)
                    }
                }
            }
            items(state.turns.size) { i ->
                val turn = state.turns[i]
                Row(Modifier.fillMaxWidth(), horizontalArrangement = if (turn.fromUser) Arrangement.End else Arrangement.Start) {
                    Column(
                        Modifier.widthIn(max = 320.dp).clip(RoundedCornerShape(18.dp))
                            .background(if (turn.fromUser) AbColors.PrimaryGradient else Brush.linearGradient(listOf(AbColors.Charcoal3, AbColors.Charcoal3)))
                            .padding(12.dp),
                    ) {
                        LinkifiedText(turn.text, color = if (turn.fromUser) Color.White else AbColors.TextPrimary, style = MaterialTheme.typography.bodyMedium, onUrl = { context.openExternalUrl(it) })
                        if (turn.sources.isNotEmpty()) {
                            Text(stringResource(R.string.agent_sources), style = MaterialTheme.typography.labelMedium, color = AbColors.Violet, modifier = Modifier.padding(top = 8.dp))
                            FlowRow(horizontalArrangement = Arrangement.spacedBy(6.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                                turn.sources.take(8).forEach { src ->
                                    Pill(src.title.ifBlank { src.url }.take(40), color = AbColors.Charcoal4, textColor = AbColors.Cyan, modifier = Modifier.clickable { context.openExternalUrl(src.url) })
                                }
                            }
                        }
                    }
                }
            }
            if (state.thinking) {
                item { Text(stringResource(R.string.agent_thinking), color = AbColors.TextMuted, style = MaterialTheme.typography.labelMedium) }
            }
        }
    }
}

fun NavGraphBuilder.animeGraph(navController: NavController) {
    val back: () -> Unit = { navController.popBackStack() }
    composable<AnimeHubRoute> { AnimeHubScreen(back, navigate = { navController.navigate(it) }) }
    composable<AnimeDetailRoute> { AnimeDetailScreen(back) }
    composable<SearchAgentRoute> { SearchAgentScreen(back) }
}
