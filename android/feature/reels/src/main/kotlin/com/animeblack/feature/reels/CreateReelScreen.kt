package com.animeblack.feature.reels

import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.PickVisualMediaRequest
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.animeblack.core.designsystem.component.AbTextField
import com.animeblack.core.designsystem.component.AbTopBar
import com.animeblack.core.designsystem.component.GlassButton
import com.animeblack.core.designsystem.component.GradientButton
import com.animeblack.core.designsystem.icon.AbIcons
import com.animeblack.core.designsystem.theme.AbColors
import com.animeblack.core.model.LocalMedia
import com.animeblack.core.ui.VideoPlayer
import com.animeblack.core.ui.localMediaFor

@Composable
fun CreateReelScreen(
    onBack: () -> Unit,
    onRecord: () -> Unit,
    capturedVideo: LocalMedia?,
    onCapturedConsumed: () -> Unit,
    viewModel: CreateReelViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val context = LocalContext.current
    val snackbar = remember { SnackbarHostState() }
    LaunchedEffect(Unit) { viewModel.messages.collect { snackbar.showSnackbar(context.getString(it)) } }
    LaunchedEffect(Unit) { viewModel.done.collect { onBack() } }
    LaunchedEffect(capturedVideo) {
        if (capturedVideo != null) {
            viewModel.onVideo(capturedVideo)
            onCapturedConsumed()
        }
    }
    val picker = rememberLauncherForActivityResult(ActivityResultContracts.PickVisualMedia()) { uri ->
        if (uri != null) viewModel.onVideo(localMediaFor(context, uri))
    }
    val pick = { picker.launch(PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.VideoOnly)) }

    Scaffold(topBar = { AbTopBar(title = stringResource(R.string.reels_create), onBack = onBack) }, snackbarHost = { SnackbarHost(snackbar) }) { padding ->
        Column(
            Modifier.fillMaxSize().padding(padding).imePadding().verticalScroll(rememberScrollState()).padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp),
        ) {
            val video = state.video
            if (video == null) {
                Box(
                    Modifier.fillMaxWidth().aspectRatio(9f / 12f).clip(RoundedCornerShape(24.dp)).background(AbColors.Charcoal3),
                    contentAlignment = Alignment.Center,
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(12.dp)) {
                        GradientButton(stringResource(R.string.reels_pick_video), onClick = pick, icon = AbIcons.VideoLibrary)
                        GlassButton(stringResource(R.string.reels_record), onClick = onRecord, icon = AbIcons.Videocam)
                    }
                }
            } else {
                Box(Modifier.fillMaxWidth().heightIn(max = 520.dp).aspectRatio(9f / 16f).clip(RoundedCornerShape(24.dp)).background(AbColors.Black)) {
                    VideoPlayer(url = video.uri, modifier = Modifier.fillMaxSize(), playing = true, muted = false, loop = true)
                }
                Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    GlassButton(stringResource(R.string.reels_change_video), onClick = pick, icon = AbIcons.VideoLibrary, modifier = Modifier.weight(1f))
                    GlassButton(stringResource(R.string.reels_record), onClick = onRecord, icon = AbIcons.Videocam, modifier = Modifier.weight(1f))
                }
            }
            AbTextField(state.caption, viewModel::onCaption, label = stringResource(R.string.reels_caption), singleLine = false, minLines = 3)
            AbTextField(state.music, viewModel::onMusic, label = stringResource(R.string.reels_music), leadingIcon = AbIcons.MusicNote)
            GradientButton(
                text = stringResource(R.string.reels_publish),
                onClick = viewModel::publish,
                loading = state.publishing,
                enabled = video != null,
                icon = AbIcons.CloudUpload,
                modifier = Modifier.fillMaxWidth(),
            )
        }
    }
}
