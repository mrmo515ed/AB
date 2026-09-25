package com.animeblack.feature.home

import android.Manifest
import android.annotation.SuppressLint
import android.content.Context
import android.content.pm.PackageManager
import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.camera.core.CameraSelector
import androidx.camera.core.ImageCapture
import androidx.camera.core.ImageCaptureException
import androidx.camera.core.Preview
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.camera.video.FileOutputOptions
import androidx.camera.video.Quality
import androidx.camera.video.QualitySelector
import androidx.camera.video.Recorder
import androidx.camera.video.Recording
import androidx.camera.video.VideoCapture
import androidx.camera.video.VideoRecordEvent
import androidx.camera.view.PreviewView
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableLongStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.content.ContextCompat
import androidx.lifecycle.compose.LocalLifecycleOwner
import com.animeblack.core.designsystem.component.AbIconButton
import com.animeblack.core.designsystem.component.GradientButton
import com.animeblack.core.designsystem.component.Pill
import com.animeblack.core.designsystem.icon.AbIcons
import com.animeblack.core.designsystem.theme.AbColors
import com.animeblack.core.ui.formatDuration
import kotlinx.coroutines.delay
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlin.coroutines.resume
import kotlin.coroutines.resumeWithException
import java.io.File

/** Maximum video length, matching the reel upload limit. */
private const val MAX_VIDEO_MS = 60_000L

/**
 * CameraX capture screen. Photos always; video recording when [allowVideo] (reels, chat).
 * Result: the captured file [Uri] and its type (`image` | `video`).
 */
@Composable
fun CameraScreen(allowVideo: Boolean, onCaptured: (Uri, String) -> Unit, onClose: () -> Unit) {
    val context = LocalContext.current
    val lifecycleOwner = LocalLifecycleOwner.current
    var granted by remember { mutableStateOf(context.hasPermission(Manifest.permission.CAMERA)) }
    val permission = rememberLauncherForActivityResult(ActivityResultContracts.RequestMultiplePermissions()) { result ->
        granted = result[Manifest.permission.CAMERA] == true || context.hasPermission(Manifest.permission.CAMERA)
    }
    val wanted = remember(allowVideo) {
        if (allowVideo) arrayOf(Manifest.permission.CAMERA, Manifest.permission.RECORD_AUDIO) else arrayOf(Manifest.permission.CAMERA)
    }
    LaunchedEffect(Unit) { if (!granted) permission.launch(wanted) }

    if (!granted) {
        Column(
            Modifier.fillMaxSize().background(Color.Black).padding(32.dp),
            verticalArrangement = Arrangement.Center,
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            Text(stringResource(R.string.camera_permission), color = Color.White, textAlign = TextAlign.Center)
            GradientButton(stringResource(R.string.camera_grant), onClick = { permission.launch(wanted) }, modifier = Modifier.padding(top = 16.dp))
            AbIconButton(AbIcons.Close, stringResource(R.string.media_close), onClick = onClose, tint = Color.White, modifier = Modifier.padding(top = 12.dp))
        }
        return
    }

    var lensFacing by remember { mutableIntStateOf(CameraSelector.LENS_FACING_BACK) }
    var flash by remember { mutableIntStateOf(ImageCapture.FLASH_MODE_OFF) }
    var videoMode by remember { mutableStateOf(false) }
    var busy by remember { mutableStateOf(false) }
    var recording by remember { mutableStateOf<Recording?>(null) }
    var recordedMs by remember { mutableLongStateOf(0L) }
    val previewView = remember { PreviewView(context) }
    val imageCapture = remember { ImageCapture.Builder().setCaptureMode(ImageCapture.CAPTURE_MODE_MINIMIZE_LATENCY).build() }
    val videoCapture = remember {
        VideoCapture.withOutput(Recorder.Builder().setQualitySelector(QualitySelector.from(Quality.HD)).build())
    }

    LaunchedEffect(lensFacing, videoMode) {
        val provider = cameraProvider(context)
        val preview = Preview.Builder().build().also { it.surfaceProvider = previewView.surfaceProvider }
        val selector = CameraSelector.Builder().requireLensFacing(lensFacing).build()
        provider.unbindAll()
        if (videoMode) {
            provider.bindToLifecycle(lifecycleOwner, selector, preview, videoCapture)
        } else {
            provider.bindToLifecycle(lifecycleOwner, selector, preview, imageCapture)
        }
    }
    LaunchedEffect(flash) { imageCapture.flashMode = flash }
    LaunchedEffect(recording) {
        recordedMs = 0
        while (recording != null) {
            delay(250)
            recordedMs += 250
        }
    }
    DisposableEffect(Unit) { onDispose { recording?.stop() } }

    fun capturePhoto() {
        busy = true
        val file = File(context.cacheDir, "capture_${System.currentTimeMillis()}.jpg")
        imageCapture.takePicture(
            ImageCapture.OutputFileOptions.Builder(file).build(),
            ContextCompat.getMainExecutor(context),
            object : ImageCapture.OnImageSavedCallback {
                override fun onImageSaved(outputFileResults: ImageCapture.OutputFileResults) {
                    busy = false
                    onCaptured(Uri.fromFile(file), "image")
                }

                override fun onError(exception: ImageCaptureException) {
                    busy = false
                }
            },
        )
    }

    @SuppressLint("MissingPermission")
    fun toggleRecording() {
        val active = recording
        if (active != null) {
            active.stop()
            recording = null
            return
        }
        val file = File(context.cacheDir, "capture_${System.currentTimeMillis()}.mp4")
        val options = FileOutputOptions.Builder(file).setDurationLimitMillis(MAX_VIDEO_MS).build()
        var pending = videoCapture.output.prepareRecording(context, options)
        if (context.hasPermission(Manifest.permission.RECORD_AUDIO)) pending = pending.withAudioEnabled()
        recording = pending.start(ContextCompat.getMainExecutor(context)) { event ->
            if (event is VideoRecordEvent.Finalize) {
                recording = null
                if (!event.hasError() || event.error == VideoRecordEvent.Finalize.ERROR_DURATION_LIMIT_REACHED) {
                    onCaptured(Uri.fromFile(file), "video")
                } else {
                    file.delete()
                }
            }
        }
    }

    Box(Modifier.fillMaxSize().background(Color.Black)) {
        AndroidView(factory = { previewView }, modifier = Modifier.fillMaxSize())
        Row(Modifier.fillMaxWidth().statusBarsPadding().padding(8.dp), verticalAlignment = Alignment.CenterVertically) {
            AbIconButton(AbIcons.Close, stringResource(R.string.media_close), onClick = onClose, tint = Color.White)
            Box(Modifier.weight(1f), contentAlignment = Alignment.Center) {
                if (recording != null) Pill(formatDuration(recordedMs), color = AbColors.Rose)
            }
            if (!videoMode) {
                AbIconButton(
                    if (flash == ImageCapture.FLASH_MODE_ON) AbIcons.FlashOn else AbIcons.FlashOff,
                    stringResource(R.string.camera_flash),
                    onClick = { flash = if (flash == ImageCapture.FLASH_MODE_ON) ImageCapture.FLASH_MODE_OFF else ImageCapture.FLASH_MODE_ON },
                    tint = Color.White,
                )
            }
        }
        Column(
            Modifier.align(Alignment.BottomCenter).fillMaxWidth().navigationBarsPadding().padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            if (allowVideo && recording == null) {
                Row(
                    Modifier.clip(RoundedCornerShape(50)).background(Color(0x66000000)).padding(4.dp),
                    horizontalArrangement = Arrangement.spacedBy(4.dp),
                ) {
                    ModeChip(stringResource(R.string.camera_photo), selected = !videoMode) { videoMode = false }
                    ModeChip(stringResource(R.string.camera_video), selected = videoMode) { videoMode = true }
                }
            }
            Row(
                Modifier.fillMaxWidth().padding(top = 16.dp),
                horizontalArrangement = Arrangement.SpaceEvenly,
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Box(Modifier.size(48.dp))
                val inner = when {
                    videoMode && recording != null -> AbColors.Rose
                    videoMode -> AbColors.Rose.copy(alpha = 0.85f)
                    busy -> Color.Gray
                    else -> Color.White
                }
                Box(
                    Modifier.size(76.dp).clip(CircleShape).border(4.dp, Color.White, CircleShape).padding(if (recording != null) 20.dp else 6.dp)
                        .clip(if (recording != null) RoundedCornerShape(6.dp) else CircleShape)
                        .background(inner)
                        .clickable(enabled = !busy) { if (videoMode) toggleRecording() else capturePhoto() },
                )
                AbIconButton(
                    AbIcons.Cameraswitch,
                    stringResource(R.string.camera_switch),
                    onClick = {
                        lensFacing = if (lensFacing == CameraSelector.LENS_FACING_BACK) CameraSelector.LENS_FACING_FRONT else CameraSelector.LENS_FACING_BACK
                    },
                    tint = Color.White,
                    enabled = recording == null,
                )
            }
        }
    }
}

@Composable
private fun ModeChip(label: String, selected: Boolean, onClick: () -> Unit) {
    Text(
        label,
        color = if (selected) Color.Black else Color.White,
        style = MaterialTheme.typography.labelLarge,
        modifier = Modifier.clip(RoundedCornerShape(50)).background(if (selected) Color.White else Color.Transparent)
            .clickable(onClick = onClick).padding(horizontal = 16.dp, vertical = 8.dp),
    )
}

/** Suspends until CameraX is initialised (wraps the `ListenableFuture` from `getInstance`). */
private suspend fun cameraProvider(context: Context): ProcessCameraProvider = suspendCancellableCoroutine { cont ->
    val future = ProcessCameraProvider.getInstance(context)
    future.addListener(
        {
            try {
                cont.resume(future.get())
            } catch (e: Exception) {
                cont.resumeWithException(e)
            }
        },
        ContextCompat.getMainExecutor(context),
    )
}

private fun Context.hasPermission(permission: String) =
    ContextCompat.checkSelfPermission(this, permission) == PackageManager.PERMISSION_GRANTED
