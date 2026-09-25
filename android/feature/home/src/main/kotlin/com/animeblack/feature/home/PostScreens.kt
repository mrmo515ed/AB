package com.animeblack.feature.home

import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.PickVisualMediaRequest
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.FilterChip
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import coil3.compose.AsyncImage
import com.animeblack.core.designsystem.component.AbIcon
import com.animeblack.core.designsystem.component.AbIconButton
import com.animeblack.core.designsystem.component.AbTextField
import com.animeblack.core.designsystem.component.AbTopBar
import com.animeblack.core.designsystem.component.Avatar
import com.animeblack.core.designsystem.component.ConfirmDialog
import com.animeblack.core.designsystem.component.EmptyState
import com.animeblack.core.designsystem.component.GradientButton
import com.animeblack.core.designsystem.component.LoadingState
import com.animeblack.core.designsystem.icon.AbIcons
import com.animeblack.core.designsystem.theme.AbColors
import com.animeblack.core.designsystem.theme.AbTheme
import com.animeblack.core.model.LocalMedia
import com.animeblack.core.model.Post
import com.animeblack.core.ui.CommentItem
import com.animeblack.core.ui.PostActions
import com.animeblack.core.ui.PostCard
import com.animeblack.core.ui.shareLink
import com.animeblack.core.ui.shareText

@Composable
fun PostDetailScreen(navigator: HomeNavigator, onBack: () -> Unit, viewModel: PostDetailViewModel = hiltViewModel()) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val snackbar = remember { SnackbarHostState() }
    val context = LocalContext.current
    val focus = remember { FocusRequester() }
    var menu by remember { mutableStateOf(false) }
    var confirmDelete by remember { mutableStateOf(false) }
    var deleteComment by remember { mutableStateOf<String?>(null) }

    LaunchedEffect(Unit) { viewModel.messages.collect { snackbar.showSnackbar(context.getString(it)) } }
    LaunchedEffect(state.post != null) { if (viewModel.focusComment && state.post != null) runCatching { focus.requestFocus() } }

    Scaffold(
        topBar = { AbTopBar(stringResource(R.string.post_title), onBack = onBack) },
        snackbarHost = { SnackbarHost(snackbar) },
        bottomBar = {
            val post = state.post
            if (post != null) {
                if (post.allowComments) {
                    Row(
                        Modifier.fillMaxWidth().background(AbTheme.colors.surface).navigationBarsPadding().imePadding().padding(8.dp),
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        Avatar(state.me?.avatar, state.me?.displayName.orEmpty(), size = 34.dp)
                        Spacer(Modifier.width(8.dp))
                        AbTextField(
                            value = state.commentText,
                            onValueChange = viewModel::onComment,
                            placeholder = stringResource(R.string.post_add_comment),
                            singleLine = false,
                            maxLines = 4,
                            modifier = Modifier.weight(1f).focusRequester(focus),
                        )
                        AbIconButton(AbIcons.Send, stringResource(com.animeblack.core.ui.R.string.ui_send), onClick = viewModel::sendComment, enabled = state.commentText.isNotBlank() && !state.sending, tint = AbColors.Cyan)
                    }
                } else {
                    Text(stringResource(R.string.post_comments_locked), modifier = Modifier.fillMaxWidth().navigationBarsPadding().padding(16.dp), color = AbTheme.colors.textMuted)
                }
            }
        },
    ) { padding ->
        val post = state.post
        when {
            post == null && state.loading -> LoadingState(Modifier.padding(padding))
            post == null -> EmptyState(stringResource(R.string.post_not_found), Modifier.padding(padding), icon = AbIcons.Error)
            else -> LazyColumn(Modifier.padding(padding).fillMaxSize(), contentPadding = PaddingValues(vertical = 12.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                item(key = "post") {
                    PostCard(
                        post = post,
                        myUid = state.me?.id.orEmpty(),
                        saved = state.saved,
                        showFullText = true,
                        autoplayVideo = true,
                        modifier = Modifier.widthIn(max = 720.dp).padding(horizontal = 12.dp),
                        actions = PostActions(
                            onAuthor = { navigator.openProfile(it) },
                            onLike = viewModel::like,
                            onReact = viewModel::react,
                            onComment = { runCatching { focus.requestFocus() } },
                            onShare = {
                                viewModel.share(it)
                                context.shareText(it.text.take(200) + "\n" + shareLink("post", it.id), context.getString(com.animeblack.core.ui.R.string.ui_share_via))
                            },
                            onSave = viewModel::save,
                            onMenu = { menu = true },
                            onVote = viewModel::vote,
                            onMedia = navigator.openMedia,
                            onHashtag = { navigator.openSearch("#$it") },
                            onMention = navigator.openMention,
                            onUrl = navigator.openUrl,
                        ),
                    )
                }
                item(key = "header") {
                    Text(
                        stringResource(R.string.post_comments) + " (${post.totalComments})",
                        style = MaterialTheme.typography.titleMedium,
                        modifier = Modifier.widthIn(max = 720.dp).fillMaxWidth().padding(16.dp),
                    )
                }
                if (post.comments.isEmpty()) {
                    item(key = "none") { Text(stringResource(R.string.post_no_comments), color = AbTheme.colors.textMuted, modifier = Modifier.padding(24.dp)) }
                }
                items(post.comments.sortedBy { it.createdAt }, key = { it.id }) { comment ->
                    val canDelete = comment.userId == state.me?.id || post.authorId == state.me?.id || state.me?.isModerator == true
                    CommentItem(
                        comment = comment,
                        modifier = Modifier.widthIn(max = 720.dp),
                        onAuthor = { navigator.openProfile(it) },
                        onLongPress = if (canDelete) ({ deleteComment = comment.id }) else null,
                        onMention = navigator.openMention,
                        onHashtag = { navigator.openSearch("#$it") },
                    )
                    HorizontalDivider(Modifier.widthIn(max = 720.dp).padding(horizontal = 16.dp), color = AbTheme.colors.glassBorder.copy(alpha = 0.4f))
                }
            }
        }
    }

    val post = state.post
    if (menu && post != null) {
        PostMenu(
            post = post,
            isMine = post.authorId == state.me?.id,
            isModerator = state.me?.isModerator == true,
            onDismiss = { menu = false },
            onEdit = { navigator.createPost(post.id) },
            onDelete = { confirmDelete = true },
            onHide = {},
            onReport = { navigator.report("post", post.id) },
            onCopy = { copyToClipboard(context, post.text) },
        )
    }
    if (confirmDelete && post != null) {
        ConfirmDialog(
            title = stringResource(com.animeblack.core.ui.R.string.ui_delete),
            message = stringResource(R.string.post_delete_confirm),
            destructive = true,
            onConfirm = {
                viewModel.delete(post)
                confirmDelete = false
                onBack()
            },
            onDismiss = { confirmDelete = false },
        )
    }
    deleteComment?.let { id ->
        ConfirmDialog(
            title = stringResource(com.animeblack.core.ui.R.string.ui_delete),
            message = stringResource(R.string.post_delete_comment_confirm),
            destructive = true,
            onConfirm = {
                viewModel.deleteComment(id)
                deleteComment = null
            },
            onDismiss = { deleteComment = null },
        )
    }
}

@Composable
fun CreatePostScreen(
    onBack: () -> Unit,
    onOpenCamera: () -> Unit,
    capturedMedia: LocalMedia?,
    onCapturedConsumed: () -> Unit,
    viewModel: CreatePostViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val snackbar = remember { SnackbarHostState() }
    val context = LocalContext.current
    val picker = rememberLauncherForActivityResult(ActivityResultContracts.PickMultipleVisualMedia(10)) { uris ->
        viewModel.addMedia(uris.map { uri -> localMediaFor(context, uri) })
    }
    LaunchedEffect(capturedMedia) {
        if (capturedMedia != null) {
            viewModel.addMedia(listOf(capturedMedia))
            onCapturedConsumed()
        }
    }
    LaunchedEffect(Unit) { viewModel.messages.collect { snackbar.showSnackbar(context.getString(it)) } }
    LaunchedEffect(Unit) { viewModel.published.collect { onBack() } }

    Scaffold(
        topBar = {
            AbTopBar(
                title = stringResource(if (state.editing) R.string.compose_edit_title else R.string.compose_title),
                onBack = onBack,
                actions = {
                    GradientButton(
                        text = stringResource(if (state.editing) R.string.compose_save else R.string.compose_publish),
                        onClick = viewModel::publish,
                        enabled = state.canPublish,
                        loading = state.publishing,
                        modifier = Modifier.padding(end = 8.dp),
                    )
                },
            )
        },
        snackbarHost = { SnackbarHost(snackbar) },
    ) { padding ->
        Column(
            Modifier.padding(padding).fillMaxSize().imePadding().verticalScroll(rememberScrollState()).padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp),
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Avatar(state.me?.avatar, state.me?.displayName.orEmpty(), size = 42.dp)
                Spacer(Modifier.width(10.dp))
                Text(state.me?.displayName.orEmpty(), style = MaterialTheme.typography.titleSmall)
            }
            AbTextField(
                value = state.text,
                onValueChange = viewModel::onText,
                placeholder = stringResource(R.string.compose_hint),
                singleLine = false,
                minLines = 5,
                maxLines = 14,
            )
            Text("${state.text.length}/5000", style = MaterialTheme.typography.labelSmall, color = AbTheme.colors.textMuted, modifier = Modifier.align(Alignment.End))

            if (state.attachments.isNotEmpty()) {
                LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    items(state.attachments, key = { it.uri }) { media ->
                        Box(Modifier.size(110.dp).clip(RoundedCornerShape(14.dp)).background(AbTheme.colors.surfaceHigh)) {
                            AsyncImage(model = media.uri, contentDescription = null, contentScale = ContentScale.Crop, modifier = Modifier.fillMaxSize())
                            if (media.type == "video") AbIcon(AbIcons.PlayArrowFilled, null, tint = Color.White, modifier = Modifier.align(Alignment.Center))
                            Box(
                                Modifier.align(Alignment.TopEnd).padding(4.dp).size(26.dp).clip(CircleShape).background(Color(0xAA000000)).clickable { viewModel.removeMedia(media.uri) },
                                contentAlignment = Alignment.Center,
                            ) { AbIcon(AbIcons.Close, stringResource(R.string.compose_remove), tint = Color.White, size = 16.dp) }
                        }
                    }
                }
            }

            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                FilterChip(
                    selected = false,
                    onClick = { picker.launch(PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageAndVideo)) },
                    label = { Text(stringResource(R.string.compose_add_media)) },
                    leadingIcon = { AbIcon(AbIcons.PhotoLibrary, null, tint = AbColors.Emerald, size = 18.dp) },
                )
                FilterChip(selected = false, onClick = onOpenCamera, label = { Text(stringResource(R.string.compose_camera)) }, leadingIcon = { AbIcon(AbIcons.PhotoCamera, null, tint = AbColors.Cyan, size = 18.dp) })
                FilterChip(selected = state.pollEnabled, onClick = viewModel::togglePoll, label = { Text(stringResource(R.string.compose_poll)) }, leadingIcon = { AbIcon(AbIcons.BarChart, null, tint = AbColors.Gold, size = 18.dp) })
            }

            if (state.pollEnabled) {
                AbTextField(state.pollQuestion, viewModel::onPollQuestion, label = stringResource(R.string.compose_poll_question))
                state.pollOptions.forEachIndexed { i, option ->
                    AbTextField(option, { viewModel.onPollOption(i, it) }, label = stringResource(R.string.compose_poll_option, i + 1))
                }
                if (state.pollOptions.size < 6) {
                    TextButton(onClick = viewModel::addPollOption) { Text(stringResource(R.string.compose_poll_add), color = AbColors.Cyan) }
                }
            }

            Text(stringResource(R.string.compose_privacy), style = MaterialTheme.typography.titleSmall)
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                listOf(
                    Post.PRIVACY_PUBLIC to R.string.compose_privacy_public,
                    Post.PRIVACY_FOLLOWERS to R.string.compose_privacy_followers,
                    Post.PRIVACY_PRIVATE to R.string.compose_privacy_private,
                ).forEach { (key, label) ->
                    FilterChip(selected = state.privacy == key, onClick = { viewModel.onPrivacy(key) }, label = { Text(stringResource(label)) })
                }
            }
            AbTextField(state.location, viewModel::onLocation, label = stringResource(R.string.compose_location), leadingIcon = AbIcons.LocationOn)
            SwitchRow(stringResource(R.string.compose_spoiler), state.spoiler, viewModel::onSpoiler)
            SwitchRow(stringResource(R.string.compose_allow_comments), state.allowComments, viewModel::onAllowComments)
            Spacer(Modifier.height(40.dp))
        }
    }
}

@Composable
internal fun SwitchRow(label: String, checked: Boolean, onChange: (Boolean) -> Unit) {
    Row(Modifier.fillMaxWidth().clip(RoundedCornerShape(12.dp)).clickable { onChange(!checked) }.padding(vertical = 6.dp), verticalAlignment = Alignment.CenterVertically) {
        Text(label, modifier = Modifier.weight(1f))
        Switch(checked = checked, onCheckedChange = onChange)
    }
}

/** Builds a [LocalMedia] from a picker Uri (type from MIME; size read lazily by the preparer). */
fun localMediaFor(context: android.content.Context, uri: Uri): LocalMedia {
    val mime = context.contentResolver.getType(uri).orEmpty()
    val type = when {
        mime == "image/gif" -> "gif"
        mime.startsWith("video") -> "video"
        mime.startsWith("audio") -> "audio"
        mime.startsWith("image") -> "image"
        else -> "file"
    }
    return LocalMedia(uri = uri.toString(), type = type, mimeType = mime)
}
