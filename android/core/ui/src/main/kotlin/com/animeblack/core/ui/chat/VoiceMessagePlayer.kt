package com.animeblack.core.ui.chat

import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.widthIn
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Slider
import androidx.compose.material3.SliderDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableLongStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.media3.common.AudioAttributes
import androidx.media3.common.C
import androidx.media3.common.Player
import androidx.media3.exoplayer.ExoPlayer
import com.animeblack.core.designsystem.component.AbIconButton
import com.animeblack.core.designsystem.icon.AbIcons
import com.animeblack.core.ui.R
import com.animeblack.core.ui.formatDuration
import kotlinx.coroutines.delay
import androidx.media3.common.MediaItem as ExoMediaItem

/**
 * Voice-note player. The ExoPlayer instance is created lazily on first play and released when the
 * bubble leaves composition, so long chats don't hold decoders. Handles audio focus.
 */
@Composable
fun VoiceMessagePlayer(url: String, durationSec: Int, modifier: Modifier = Modifier, tint: Color = Color.White) {
    val context = LocalContext.current
    var player by remember(url) { mutableStateOf<ExoPlayer?>(null) }
    var playing by remember(url) { mutableStateOf(false) }
    var position by remember(url) { mutableLongStateOf(0L) }
    var duration by remember(url) { mutableLongStateOf(durationSec * 1000L) }

    DisposableEffect(url) {
        onDispose {
            player?.release()
            player = null
        }
    }
    LaunchedEffect(playing) {
        while (playing) {
            player?.let { p ->
                position = p.currentPosition
                if (p.duration > 0) duration = p.duration
            }
            delay(200)
        }
    }

    fun ensurePlayer(): ExoPlayer = player ?: ExoPlayer.Builder(context).build().also { p ->
        p.setAudioAttributes(
            AudioAttributes.Builder().setUsage(C.USAGE_MEDIA).setContentType(C.AUDIO_CONTENT_TYPE_SPEECH).build(),
            true,
        )
        p.addListener(object : Player.Listener {
            override fun onIsPlayingChanged(isPlaying: Boolean) {
                playing = isPlaying
            }

            override fun onPlaybackStateChanged(playbackState: Int) {
                if (playbackState == Player.STATE_ENDED) {
                    p.pause()
                    p.seekTo(0)
                    position = 0
                }
                if (playbackState == Player.STATE_READY && p.duration > 0) duration = p.duration
            }
        })
        p.setMediaItem(ExoMediaItem.fromUri(url))
        p.prepare()
        player = p
    }

    Row(modifier.widthIn(min = 200.dp, max = 260.dp), verticalAlignment = Alignment.CenterVertically) {
        AbIconButton(
            if (playing) AbIcons.Pause else AbIcons.PlayArrowFilled,
            stringResource(R.string.ui_play),
            onClick = {
                val p = ensurePlayer()
                if (p.isPlaying) p.pause() else p.play()
            },
            tint = tint,
        )
        Slider(
            value = if (duration > 0) (position.toFloat() / duration).coerceIn(0f, 1f) else 0f,
            onValueChange = { f ->
                val p = ensurePlayer()
                val target = (f * duration).toLong()
                p.seekTo(target)
                position = target
            },
            colors = SliderDefaults.colors(thumbColor = tint, activeTrackColor = tint, inactiveTrackColor = tint.copy(alpha = 0.3f)),
            modifier = Modifier.weight(1f),
        )
        Spacer(Modifier.width(6.dp))
        Text(formatDuration(if (playing || position > 0) position else duration), color = tint.copy(alpha = 0.85f), style = MaterialTheme.typography.labelSmall)
    }
}
