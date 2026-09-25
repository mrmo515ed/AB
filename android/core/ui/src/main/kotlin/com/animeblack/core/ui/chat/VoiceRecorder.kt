package com.animeblack.core.ui.chat

import android.content.Context
import android.media.MediaRecorder
import android.net.Uri
import android.os.Build
import android.os.SystemClock
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.remember
import androidx.compose.ui.platform.LocalContext
import java.io.File

/** A finished voice note, ready to be sent as a `voice` attachment. */
data class VoiceClip(val uri: String, val durationMs: Long, val sizeBytes: Long, val mimeType: String = "audio/mp4")

/**
 * Records voice notes as AAC/M4A (small, universally playable — also by the web `<audio>` tag).
 * Replaces the web `MediaRecorder` API.
 */
class VoiceRecorder(private val context: Context) {
    private var recorder: MediaRecorder? = null
    private var file: File? = null
    private var startedAt = 0L

    val isRecording: Boolean get() = recorder != null
    val elapsedMs: Long get() = if (recorder != null) SystemClock.elapsedRealtime() - startedAt else 0L

    /** Requires RECORD_AUDIO to be granted. Returns false when the microphone is unavailable. */
    fun start(): Boolean {
        cancel()
        val out = File(context.cacheDir, "voice_${System.currentTimeMillis()}.m4a")
        val r = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) MediaRecorder(context) else legacyRecorder()
        return try {
            r.setAudioSource(MediaRecorder.AudioSource.MIC)
            r.setOutputFormat(MediaRecorder.OutputFormat.MPEG_4)
            r.setAudioEncoder(MediaRecorder.AudioEncoder.AAC)
            r.setAudioEncodingBitRate(64_000)
            r.setAudioSamplingRate(44_100)
            r.setMaxDuration(MAX_DURATION_MS)
            r.setOutputFile(out.absolutePath)
            r.prepare()
            r.start()
            recorder = r
            file = out
            startedAt = SystemClock.elapsedRealtime()
            true
        } catch (_: Exception) {
            r.release()
            out.delete()
            false
        }
    }

    /** Stops the recording. Returns null when it was too short or the recorder failed. */
    fun stop(): VoiceClip? {
        val r = recorder ?: return null
        val out = file
        val duration = SystemClock.elapsedRealtime() - startedAt
        recorder = null
        file = null
        val ok = try {
            r.stop()
            true
        } catch (_: RuntimeException) {
            false
        } finally {
            r.release()
        }
        if (!ok || out == null || duration < MIN_DURATION_MS) {
            out?.delete()
            return null
        }
        return VoiceClip(Uri.fromFile(out).toString(), duration, out.length())
    }

    fun cancel() {
        val r = recorder ?: return
        recorder = null
        try {
            r.stop()
        } catch (_: RuntimeException) {
        } finally {
            r.release()
        }
        file?.delete()
        file = null
    }

    @Suppress("DEPRECATION")
    private fun legacyRecorder(): MediaRecorder = MediaRecorder()

    companion object {
        const val MAX_DURATION_MS = 5 * 60_000
        const val MIN_DURATION_MS = 700L
    }
}

@Composable
fun rememberVoiceRecorder(): VoiceRecorder {
    val context = LocalContext.current
    val recorder = remember { VoiceRecorder(context.applicationContext) }
    DisposableEffect(recorder) { onDispose { recorder.cancel() } }
    return recorder
}
