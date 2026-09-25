package com.animeblack.feature.search

import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.PrimaryScrollableTabRow
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Tab
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
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
import com.animeblack.core.data.repository.CommunityRepository
import com.animeblack.core.data.repository.PostRepository
import com.animeblack.core.data.repository.UserRepository
import com.animeblack.core.designsystem.component.AbIcon
import com.animeblack.core.designsystem.component.AbTopBar
import com.animeblack.core.designsystem.component.EmptyState
import com.animeblack.core.designsystem.component.GlassCard
import com.animeblack.core.designsystem.component.LoadingState
import com.animeblack.core.designsystem.component.Pill
import com.animeblack.core.designsystem.component.SearchField
import com.animeblack.core.designsystem.component.SectionHeader
import com.animeblack.core.designsystem.icon.AbIcons
import com.animeblack.core.designsystem.theme.AbColors
import com.animeblack.core.model.AnimeItem
import com.animeblack.core.model.Group
import com.animeblack.core.model.Post
import com.animeblack.core.model.User
import com.animeblack.core.navigation.AnimeDetailRoute
import com.animeblack.core.navigation.GroupRoomRoute
import com.animeblack.core.navigation.MediaViewerRoute
import com.animeblack.core.navigation.PostDetailRoute
import com.animeblack.core.navigation.ProfileRoute
import com.animeblack.core.navigation.SearchAgentRoute
import com.animeblack.core.navigation.SearchRoute
import com.animeblack.core.ui.PostActions
import com.animeblack.core.ui.PostCard
import com.animeblack.core.ui.UserRow
import com.animeblack.core.ui.openExternalUrl
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.debounce
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.flow.transformLatest
import kotlinx.coroutines.flow.onStart
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

enum class SearchTab { People, Posts, Groups, Anime }

data class SearchResults(
    val query: String = "",
    val searching: Boolean = false,
    val people: List<User> = emptyList(),
    val posts: List<Post> = emptyList(),
    val groups: List<Group> = emptyList(),
    val anime: List<AnimeItem> = emptyList(),
)

data class SearchUiState(
    val results: SearchResults = SearchResults(),
    val trending: List<Pair<String, Int>> = emptyList(),
    val suggested: List<User> = emptyList(),
    val myUid: String = "",
    val savedIds: Set<String> = emptySet(),
)

@HiltViewModel
class SearchViewModel @Inject constructor(
    savedStateHandle: SavedStateHandle,
    private val users: UserRepository,
    private val posts: PostRepository,
    private val community: CommunityRepository,
    private val anime: AnimeRepository,
) : ViewModel() {
    val query = MutableStateFlow(savedStateHandle.toRoute<SearchRoute>().query)
    val tab = MutableStateFlow(if (query.value.startsWith("#")) SearchTab.Posts else SearchTab.People)

    private val results: Flow<SearchResults> = combine(query.debounce(350), tab) { q, t -> q.trim() to t }
        .distinctUntilChanged()
        .transformLatest { (q, t) ->
            if (q.length < 2) {
                emit(SearchResults(q))
                return@transformLatest
            }
            emit(SearchResults(q, searching = true))
            emit(
                when (t) {
                    SearchTab.People -> SearchResults(q, people = (users.searchUsers(q.removePrefix("@"), 30) as? AppResult.Success)?.data.orEmpty())
                    SearchTab.Posts -> SearchResults(q, posts = (posts.searchPosts(q) as? AppResult.Success)?.data.orEmpty())
                    SearchTab.Groups -> SearchResults(q)
                    SearchTab.Anime -> SearchResults(q, anime = (anime.search(q) as? AppResult.Success)?.data.orEmpty())
                },
            )
        }

    private val groupsFlow = community.observeGroups().onStart { emit(emptyList()) }

    val state: StateFlow<SearchUiState> = combine(
        results,
        groupsFlow,
        posts.observeTrendingTags().onStart { emit(emptyList()) },
        users.observeSuggestedUsers(15).onStart { emit(emptyList()) },
        combine(users.observeMe(), posts.observeSavedIds()) { me, saved -> me?.id.orEmpty() to saved },
    ) { r, groups, trending, suggested, (uid, saved) ->
        val withGroups = if (tab.value == SearchTab.Groups && r.query.length >= 2) {
            r.copy(groups = groups.filter { it.name.contains(r.query, true) || it.description.contains(r.query, true) })
        } else {
            r
        }
        SearchUiState(withGroups, trending.take(20), suggested.filter { it.id != uid }, uid, saved)
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), SearchUiState())

    fun like(post: Post) = viewModelScope.launch { posts.toggleLike(post) }
    fun react(post: Post, key: String) = viewModelScope.launch { posts.react(post, key) }
    fun save(post: Post, saved: Boolean) = viewModelScope.launch { posts.setSaved(post.id, saved) }
    fun vote(post: Post, option: String) = viewModelScope.launch { posts.votePoll(post.id, option) }
}

@OptIn(ExperimentalLayoutApi::class, ExperimentalFoundationApi::class)
@Composable
fun SearchScreen(onBack: () -> Unit, navigate: (Any) -> Unit, openMention: (String) -> Unit, viewModel: SearchViewModel = hiltViewModel()) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val query by viewModel.query.collectAsStateWithLifecycle()
    val tab by viewModel.tab.collectAsStateWithLifecycle()
    val context = LocalContext.current
    val r = state.results
    val postActions = PostActions(
        onOpen = { navigate(PostDetailRoute(it.id)) },
        onAuthor = { navigate(ProfileRoute(it)) },
        onLike = { viewModel.like(it) },
        onReact = { p, k -> viewModel.react(p, k) },
        onComment = { navigate(PostDetailRoute(it.id, true)) },
        onSave = { p, s -> viewModel.save(p, s) },
        onVote = { p, o -> viewModel.vote(p, o) },
        onMedia = { navigate(MediaViewerRoute(it.src, it.type)) },
        onHashtag = { viewModel.query.value = "#$it" },
        onMention = openMention,
        onUrl = { context.openExternalUrl(it) },
    )
    Scaffold(topBar = { AbTopBar(title = stringResource(R.string.search_title), onBack = onBack) }) { padding ->
        Column(Modifier.fillMaxSize().padding(padding)) {
            SearchField(
                query = query,
                onQueryChange = { viewModel.query.value = it },
                placeholder = stringResource(R.string.search_hint),
                modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 8.dp),
            )
            PrimaryScrollableTabRow(selectedTabIndex = tab.ordinal, containerColor = Color.Transparent, edgePadding = 12.dp) {
                SearchTab.entries.forEach { t ->
                    Tab(selected = tab == t, onClick = { viewModel.tab.value = t }, text = {
                        Text(
                            stringResource(
                                when (t) {
                                    SearchTab.People -> R.string.search_people
                                    SearchTab.Posts -> R.string.search_posts
                                    SearchTab.Groups -> R.string.search_groups
                                    SearchTab.Anime -> R.string.search_anime
                                },
                            ),
                        )
                    })
                }
            }
            if (r.query.length < 2) {
                LazyColumn(contentPadding = PaddingValues(bottom = 24.dp)) {
                    item {
                        GlassCard(Modifier.fillMaxWidth().padding(16.dp), onClick = { navigate(SearchAgentRoute) }) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                AbIcon(AbIcons.AutoAwesome, null, tint = AbColors.Cyan)
                                Spacer(Modifier.width(10.dp))
                                Text(stringResource(R.string.search_ask_agent), modifier = Modifier.weight(1f))
                                AbIcon(AbIcons.ChevronRight, null, tint = AbColors.TextMuted)
                            }
                        }
                    }
                    if (state.trending.isNotEmpty()) {
                        item { SectionHeader(stringResource(R.string.search_trending), modifier = Modifier.padding(horizontal = 16.dp)) }
                        item {
                            FlowRow(Modifier.padding(horizontal = 16.dp), horizontalArrangement = Arrangement.spacedBy(8.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                                state.trending.forEach { (tag, count) ->
                                    Pill("#$tag · $count", color = AbColors.Charcoal3, textColor = AbColors.Cyan, modifier = Modifier.clickable {
                                        viewModel.tab.value = SearchTab.Posts
                                        viewModel.query.value = "#$tag"
                                    })
                                }
                            }
                        }
                    }
                    if (state.suggested.isNotEmpty()) {
                        item { SectionHeader(stringResource(R.string.search_suggested), modifier = Modifier.padding(horizontal = 16.dp)) }
                        items(state.suggested, key = { "s_" + it.id }) { u -> UserRow(user = u, onClick = { navigate(ProfileRoute(u.id)) }) }
                    }
                }
                return@Column
            }
            if (r.searching) {
                LoadingState()
                return@Column
            }
            val empty = when (tab) {
                SearchTab.People -> r.people.isEmpty()
                SearchTab.Posts -> r.posts.isEmpty()
                SearchTab.Groups -> r.groups.isEmpty()
                SearchTab.Anime -> r.anime.isEmpty()
            }
            if (empty) {
                EmptyState(title = stringResource(R.string.search_no_results, r.query), icon = AbIcons.Search)
                return@Column
            }
            LazyColumn(contentPadding = PaddingValues(bottom = 24.dp)) {
                when (tab) {
                    SearchTab.People -> items(r.people, key = { it.id }) { u -> UserRow(user = u, onClick = { navigate(ProfileRoute(u.id)) }) }
                    SearchTab.Posts -> items(r.posts, key = { it.id }) { p ->
                        PostCard(post = p, myUid = state.myUid, saved = p.id in state.savedIds, actions = postActions, modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp))
                    }
                    SearchTab.Groups -> items(r.groups, key = { it.id }) { g ->
                        GlassCard(Modifier.fillMaxWidth().padding(horizontal = 12.dp, vertical = 5.dp), onClick = { navigate(GroupRoomRoute(g.id)) }) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                androidx.compose.foundation.layout.Box(
                                    Modifier.size(44.dp).clip(RoundedCornerShape(14.dp)).background(Brush.linearGradient(listOf(AbColors.parse(g.color1), AbColors.parse(g.color2)))),
                                    contentAlignment = Alignment.Center,
                                ) { AbIcon(AbIcons.Groups, null, tint = Color.White) }
                                Spacer(Modifier.width(12.dp))
                                Column(Modifier.weight(1f)) {
                                    Text(g.name, style = MaterialTheme.typography.titleSmall)
                                    Text(stringResource(R.string.search_members, g.memberCount), style = MaterialTheme.typography.labelSmall, color = AbColors.TextMuted)
                                }
                            }
                        }
                    }
                    SearchTab.Anime -> items(r.anime, key = { it.source + it.id }) { a ->
                        Row(
                            Modifier.fillMaxWidth().clickable { navigate(AnimeDetailRoute(a.id, a.mediaType)) }.padding(horizontal = 16.dp, vertical = 8.dp),
                            verticalAlignment = Alignment.CenterVertically,
                        ) {
                            AsyncImage(model = a.coverUrl, contentDescription = a.title, contentScale = ContentScale.Crop, modifier = Modifier.size(width = 54.dp, height = 76.dp).clip(RoundedCornerShape(10.dp)))
                            Spacer(Modifier.width(12.dp))
                            Column(Modifier.weight(1f)) {
                                Text(a.title, style = MaterialTheme.typography.titleSmall, maxLines = 2, overflow = TextOverflow.Ellipsis)
                                Text(listOfNotNull(a.format.ifBlank { null }, a.year?.toString(), a.score?.let { String.format(java.util.Locale.US, "%.1f", it) }).joinToString(" · "), style = MaterialTheme.typography.labelSmall, color = AbColors.TextMuted)
                                Spacer(Modifier.height(2.dp))
                                Text(a.genres.take(3).joinToString(", "), style = MaterialTheme.typography.labelSmall, color = AbColors.Violet)
                            }
                        }
                    }
                }
            }
        }
    }
}

fun NavGraphBuilder.searchGraph(navController: NavController, openMention: (String) -> Unit) {
    composable<SearchRoute> {
        SearchScreen(onBack = { navController.popBackStack() }, navigate = { navController.navigate(it) }, openMention = openMention)
    }
}
