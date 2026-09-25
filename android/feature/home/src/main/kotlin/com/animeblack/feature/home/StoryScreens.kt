package com.animeblack.feature.home

import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.PickVisualMediaRequest
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.material3.TextField
import androidx.compose.material3.TextFieldDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.runtime.withFrameMillis
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.LayoutDirection
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import coil3.compose.AsyncImage
import com.animeblack.core.designsystem.component.AbIcon
import com.animeblack.core.designsystem.component.AbIconButton
import com.animeblack.core.designsystem.component.Avatar
import com.animeblack.core.designsystem.component.CircleAction
import com.animeblack.core.designsystem.component.GradientButton
import com.animeblack.core.designsystem.component.LoadingState
import com.animeblack.core.designsystem.icon.AbIcons
import com.animeblack.core.designsystem.theme.AbColors
import com.animeblack.core.model.Story
import com.animeblack.core.model.StoryItem
import com.animeblack.core.ui.VideoPlayer
import com.animeblack.core.ui.reactionStyle
import com.animeblack.core.ui.relativeTime
import kotlinx.coroutines.launch

private const val ITEM_DURATION_MS = 5_000L
private const val VIDEO_DURATION_MS = 15_000L

/**
 * Full-screen story viewer: segmented progress bars, tap the start/end half to go back/forward
 * (mirrored in RTL), hold to pause, swipe between users, reactions, replies (sent as a private
 * chat message, like the web) and view counts on your own stories.
 */
@Composable
fun StoryViewerScreen(onClose: () -> Unit, viewModel: StoryViewerViewModel = hiltViewModel()) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val snackbar = remember { SnackbarHostState() }
    val context = LocalContext.current
    LaunchedEffect(Unit) { viewModel.messages.collect { snackbar.showSnackbar(context.getString(it)) } }

    if (!state.loaded) {
        LoadingState(Modifier.background(Color.Black))
        return
    }
    val now = remember { System.currentTimeMillis() }
    val stories = state.stories.filter { it.isActive(now) }
    if (stories.isEmpty()) {
        LaunchedEffect(Unit) { onClose() }
        return
    }
    val pager = rememberPagerState(initialPage = state.startIndex.coerceIn(0, stories.lastIndex)) { stories.size }
    val scope = rememberCoroutineScope()

    Box(Modifier.fillMaxSize().background(Color.Black)) {
        HorizontalPager(state = pager, modifier = Modifier.fillMaxSize(), key = { stories[it].id }) { page ->
            val story = stories[page]
            StoryPage(
                story = story,
                myUid = state.myUid,
                active = pager.currentPage == page,
                now = now,
                onViewed = { viewModel.viewed(story) },
                onFinished = {
                    if (page < stories.lastIndex) scope.launch { pager.animateScrollToPage(page + 1) } else onClose()
                },
                onBackPastStart = { if (page > 0) scope.launch { pager.animateScrollToPage(page - 1) } },
                onClose = onClose,
                onReact = { icon -> viewModel.react(story, icon) },
                onReply = { item, text -> viewModel.reply(story, item, text) },
                onDelete = { item -> viewModel.delete(story, item.id) },
            )
        }
        SnackbarHost(snackbar, Modifier.align(Alignment.BottomCenter).padding(bottom = 96.dp))
    }
}

@Composable
private fun StoryPage(
    story: Story,
    myUid: String,
    active: Boolean,
    now: Long,
    onViewed: () -> Unit,
    onFinished: () -> Unit,
    onBackPastStart: () -> Unit,
    onClose: () -> Unit,
    onReact: (String) -> Unit,
    onReply: (StoryItem, String) -> Unit,
    onDelete: (StoryItem) -> Unit,
) {
    val items = story.activeItems(now)
    if (items.isEmpty()) return
    var index by remember(story.id) { mutableIntStateOf(0) }
    var progress by remember(story.id) { mutableFloatStateOf(0f) }
    var paused by remember { mutableStateOf(false) }
    var reply by remember { mutableStateOf("") }
    val item = items[index.coerceIn(0, items.lastIndex)]
    val isMine = story.userId == myUid
    val rtl = LocalLayoutDirection.current == LayoutDirection.Rtl

    LaunchedEffect(active, story.id) { if (active) onViewed() }
    LaunchedEffect(active, index, paused, story.id) {
        if (!active || paused) return@LaunchedEffect
        val duration = if (item.type == "video") VIDEO_DURATION_MS else ITEM_DURATION_MS
        var last = withFrameMillis { it }
        while (progress < 1f) {
            val t = withFrameMillis { it }
            progress = (progress + (t - last).toFloat() / duration).coerceAtMost(1f)
            last = t
        }
        if (index < items.lastIndex) {
            index += 1
            progress = 0f
        } else {
            onFinished()
        }
    }

    fun next() {
        if (index < items.lastIndex) {
            index += 1
            progress = 0f
        } else {
            onFinished()
        }
    }

    fun previous() {
        if (index > 0) {
            index -= 1
            progress = 0f
        } else {
            onBackPastStart()
        }
    }

    Box(
        Modifier
            .fillMaxSize()
            .pointerInput(story.id, rtl) {
                detectTapGestures(
                    onPress = {
                        paused = true
                        tryAwaitRelease()
                        paused = false
                    },
                    onTap = { offset ->
                        val startHalf = if (rtl) offset.x > size.width / 2f else offset.x < size.width / 2f
                        if (startHalf) previous() else next()
                    },
                )
            },
    ) {
        StoryContent(item, active && !paused)

        Column(Modifier.fillMaxWidth().statusBarsPadding().padding(horizontal = 10.dp, vertical = 8.dp)) {
            Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                items.forEachIndexed { i, _ ->
                    LinearProgressIndicator(
                        progress = { if (i < index) 1f else if (i == index) progress else 0f },
                        modifier = Modifier.weight(1f).height(3.dp).clip(RoundedCornerShape(2.dp)),
                        color = Color.White,
                        trackColor = Color.White.copy(alpha = 0.3f),
                    )
                }
            }
            Spacer(Modifier.height(10.dp))
            Row(verticalAlignment = Alignment.CenterVertically) {
                Avatar(story.userAvatar, story.userName, size = 36.dp)
                Spacer(Modifier.width(8.dp))
                Column(Modifier.weight(1f)) {
                    Text(story.userName, color = Color.White, style = MaterialTheme.typography.titleSmall)
                    Text(relativeTime(item.createdAt), color = Color.White.copy(alpha = 0.7f), style = MaterialTheme.typography.labelSmall)
                }
                if (story.closeFriends) AbIcon(AbIcons.Star, null, tint = AbColors.Emerald, size = 18.dp)
                if (isMine) AbIconButton(AbIcons.Delete, stringResource(R.string.story_delete), onClick = { onDelete(item) }, tint = Color.White)
                AbIconButton(AbIcons.Close, stringResource(R.string.media_close), onClick = onClose, tint = Color.White)
            }
        }

        Column(Modifier.align(Alignment.BottomCenter).fillMaxWidth().navigationBarsPadding().imePadding().padding(12.dp)) {
            if (isMine) {
                Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.clip(RoundedCornerShape(50)).background(Color(0x66000000)).padding(horizontal = 12.dp, vertical = 8.dp)) {
                    AbIcon(AbIcons.Visibility, null, tint = Color.White, size = 18.dp)
                    Spacer(Modifier.width(6.dp))
                    Text(stringResource(R.string.story_views, story.views.size), color = Color.White)
                }
                if (story.views.isNotEmpty()) {
                    LazyRow(horizontalArrangement = Arrangement.spacedBy(6.dp), modifier = Modifier.padding(top = 8.dp)) {
                        itemsIndexed(story.views.takeLast(30).reversed()) { _, v -> Avatar(v.avatar, v.name, size = 30.dp) }
                    }
                }
            } else {
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.padding(bottom = 8.dp)) {
                    listOf("love", "laugh", "wow", "fire", "sad", "clap").forEach { key ->
                        val style = reactionStyle(key)
                        CircleAction(style.icon, stringResource(style.label), onClick = { onReact(key) }, tint = style.color)
                    }
                }
                Row(verticalAlignment = Alignment.CenterVertically) {
                    TextField(
                        value = reply,
                        onValueChange = {
                            reply = it.take(500)
                            paused = it.isNotEmpty()
                        },
                        placeholder = { Text(stringResource(R.string.story_reply_hint), color = Color.White.copy(alpha = 0.7f)) },
                        singleLine = true,
                        shape = RoundedCornerShape(24.dp),
                        colors = TextFieldDefaults.colors(
                            focusedContainerColor = Color(0x55000000),
                            unfocusedContainerColor = Color(0x55000000),
                            focusedTextColor = Color.White,
                            unfocusedTextColor = Color.White,
                            focusedIndicatorColor = Color.Transparent,
                            unfocusedIndicatorColor = Color.Transparent,
                        ),
                        modifier = Modifier.weight(1f).border(1.dp, Color.White.copy(alpha = 0.4f), RoundedCornerShape(24.dp)),
                    )
                    Spacer(Modifier.width(8.dp))
                    CircleAction(AbIcons.Send, stringResource(com.animeblack.core.ui.R.string.ui_send), onClick = {
                        if (reply.isNotBlank()) {
                            onReply(item, reply)
                            reply = ""
                            paused = false
                        }
                    })
                }
            }
        }
    }
}

@Composable
private fun StoryContent(item: StoryItem, playing: Boolean) {
    val gradient = Brush.linearGradient(listOf(AbColors.parse(item.color1, AbColors.DeepPurple), AbColors.parse(item.color2, AbColors.Blue)))
    Box(Modifier.fillMaxSize().background(gradient), contentAlignment = Alignment.Center) {
        when {
            item.type == "video" && item.video.startsWith("http") ->
                VideoPlayer(url = item.video, modifier = Modifier.fillMaxSize(), playing = playing, loop = false)
            item.image.isNotBlank() && !item.image.startsWith("data:") ->
                AsyncImage(model = item.image, contentDescription = null, contentScale = ContentScale.Fit, modifier = Modifier.fillMaxSize())
        }
        if (item.text.isNotBlank()) {
            Text(
                item.text,
                color = AbColors.parse(item.textColor, Color.White),
                fontSize = item.textSize.coerceIn(12, 48).sp,
                fontWeight = FontWeight.Bold,
                textAlign = TextAlign.Center,
                modifier = Modifier.padding(28.dp).then(
                    if (item.type != "text") Modifier.clip(RoundedCornerShape(12.dp)).background(Color(0x77000000)).padding(10.dp) else Modifier,
                ),
            )
        }
    }
}

@Composable
fun CreateStoryScreen(onClose: () -> Unit, viewModel: CreateStoryViewModel = hiltViewModel()) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val context = LocalContext.current
    val snackbar = remember { SnackbarHostState() }
    val picker = rememberLauncherForActivityResult(ActivityResultContracts.PickVisualMedia()) { uri ->
        if (uri != null) viewModel.onMedia(localMediaFor(context, uri))
    }
    LaunchedEffect(Unit) {
        viewModel.done.collect { msg ->
            snackbar.showSnackbar(context.getString(msg))
            if (msg == R.string.story_published) onClose()
        }
    }
    val (c1, c2) = CreateStoryViewModel.STORY_PRESETS[state.preset]
    Box(
        Modifier.fillMaxSize().background(Brush.linearGradient(listOf(AbColors.parse(c1), AbColors.parse(c2)))),
    ) {
        state.media?.let { media ->
            AsyncImage(model = media.uri, contentDescription = null, contentScale = ContentScale.Fit, modifier = Modifier.fillMaxSize())
        }
        TextField(
            value = state.text,
            onValueChange = viewModel::onText,
            placeholder = { Text(stringResource(R.string.story_text_hint), color = Color.White.copy(alpha = 0.7f), fontSize = 22.sp) },
            textStyle = MaterialTheme.typography.headlineSmall.copy(color = Color.White, textAlign = TextAlign.Center, fontWeight = FontWeight.Bold),
            colors = TextFieldDefaults.colors(
                focusedContainerColor = Color.Transparent,
                unfocusedContainerColor = Color.Transparent,
                focusedIndicatorColor = Color.Transparent,
                unfocusedIndicatorColor = Color.Transparent,
            ),
            modifier = Modifier.align(Alignment.Center).fillMaxWidth().padding(24.dp),
        )
        Row(Modifier.fillMaxWidth().statusBarsPadding().padding(8.dp), verticalAlignment = Alignment.CenterVertically) {
            AbIconButton(AbIcons.Close, stringResource(R.string.media_close), onClick = onClose, tint = Color.White)
            Text(stringResource(R.string.story_create), color = Color.White, style = MaterialTheme.typography.titleMedium, modifier = Modifier.weight(1f))
            AbIconButton(AbIcons.PhotoLibrary, stringResource(R.string.story_pick_media), onClick = {
                picker.launch(PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageAndVideo))
            }, tint = Color.White)
        }
        Column(Modifier.align(Alignment.BottomCenter).fillMaxWidth().navigationBarsPadding().imePadding().padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            LazyRow(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                itemsIndexed(CreateStoryViewModel.STORY_PRESETS) { i, (a, b) ->
                    Box(
                        Modifier.size(36.dp).clip(CircleShape)
                            .background(Brush.linearGradient(listOf(AbColors.parse(a), AbColors.parse(b))))
                            .border(if (state.preset == i) 3.dp else 1.dp, Color.White, CircleShape)
                            .clickable { viewModel.onPreset(i) },
                    )
                }
            }
            Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.clip(RoundedCornerShape(16.dp)).background(Color(0x55000000)).padding(horizontal = 12.dp)) {
                AbIcon(AbIcons.Star, null, tint = AbColors.Emerald, size = 18.dp)
                Spacer(Modifier.width(8.dp))
                Text(stringResource(R.string.story_close_friends), color = Color.White, modifier = Modifier.weight(1f))
                Switch(checked = state.closeFriends, onCheckedChange = viewModel::onCloseFriends)
            }
            GradientButton(
                text = stringResource(R.string.story_share),
                onClick = viewModel::publish,
                loading = state.publishing,
                enabled = state.text.isNotBlank() || state.media != null,
                icon = AbIcons.Send,
                modifier = Modifier.fillMaxWidth(),
            )
        }
        SnackbarHost(snackbar, Modifier.align(Alignment.TopCenter).padding(top = 72.dp))
    }
}
