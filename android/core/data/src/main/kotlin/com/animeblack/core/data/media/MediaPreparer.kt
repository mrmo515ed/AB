package com.animeblack.core.data.media

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Matrix
import android.net.Uri
import android.webkit.MimeTypeMap
import androidx.annotation.OptIn
import androidx.exifinterface.media.ExifInterface
import androidx.media3.common.MediaItem
import androidx.media3.common.MimeTypes
import androidx.media3.common.util.UnstableApi
import androidx.media3.effect.Presentation
import androidx.media3.transformer.Composition
import androidx.media3.transformer.EditedMediaItem
import androidx.media3.transformer.Effects
import androidx.media3.transformer.ExportException
import androidx.media3.transformer.ExportResult
import androidx.media3.transformer.Transformer
import com.animeblack.core.common.dispatchers.AbDispatchers
import com.animeblack.core.common.dispatchers.Dispatcher
import com.animeblack.core.common.result.AppError
import com.animeblack.core.common.result.AppResult
import com.animeblack.core.common.result.runCatchingApp
import com.animeblack.core.data.firebase.AppErrorException
import com.animeblack.core.data.firebase.FirebaseErrorMapper
import com.animeblack.core.data.repository.MediaRepository
import com.animeblack.core.model.LocalMedia
import dagger.hilt.android.qualifiers.ApplicationContext
import java.io.File
import java.io.FileOutputStream
import java.util.UUID
import javax.inject.Inject
import javax.inject.Singleton
import kotlin.coroutines.resume
import kotlin.math.max
import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlinx.coroutines.withContext

/**
 * Prepares picked/captured media for upload:
 *  - images: decoded with subsampling, EXIF-rotated, scaled to ≤ 2048 px and re-encoded as JPEG 85
 *    (GIFs are copied untouched to keep animation);
 *  - videos: transcoded to H.264/AAC 720p with Media3 Transformer when larger than 8 MB (falls back
 *    to the original file if the device cannot transcode);
 *  - audio / files: copied.
 * Output lives in `filesDir/outbox` so queued uploads survive process death.
 */
@Singleton
class MediaPreparer @Inject constructor(
    @ApplicationContext private val context: Context,
    @Dispatcher(AbDispatchers.IO) private val io: CoroutineDispatcher,
    private val errorMapper: FirebaseErrorMapper,
) : MediaRepository {

    private val outboxDir: File get() = File(context.filesDir, "outbox").apply { mkdirs() }

    override suspend fun prepare(media: LocalMedia): AppResult<LocalMedia> = runCatchingApp(errorMapper) {
        val uri = Uri.parse(media.uri)
        when {
            media.type == "gif" || media.mimeType == "image/gif" -> copy(uri, media, "gif", "image/gif")
            media.type == "image" -> compressImage(uri, media)
            media.type == "video" -> prepareVideo(uri, media)
            media.type == "voice" || media.type == "audio" -> copy(uri, media, extensionFor(media.mimeType, "m4a"), media.mimeType.ifBlank { "audio/mp4" })
            else -> copy(uri, media, extensionFor(media.mimeType, "bin"), media.mimeType.ifBlank { "application/octet-stream" })
        }
    }

    private fun newFile(ext: String): File = File(outboxDir, "${System.currentTimeMillis()}_${UUID.randomUUID().toString().take(8)}.$ext")

    private fun extensionFor(mime: String, fallback: String): String =
        MimeTypeMap.getSingleton().getExtensionFromMimeType(mime) ?: fallback

    private suspend fun copy(uri: Uri, media: LocalMedia, ext: String, mime: String): LocalMedia = withContext(io) {
        val out = newFile(ext)
        val input = context.contentResolver.openInputStream(uri)
            ?: throw AppErrorException(AppError.Validation("media", "unreadable"))
        input.use { src -> FileOutputStream(out).use { dst -> src.copyTo(dst) } }
        media.copy(uri = Uri.fromFile(out).toString(), mimeType = mime, sizeBytes = out.length(), name = media.name.ifBlank { out.name })
    }

    private suspend fun compressImage(uri: Uri, media: LocalMedia): LocalMedia = withContext(io) {
        val resolver = context.contentResolver
        val bounds = BitmapFactory.Options().apply { inJustDecodeBounds = true }
        resolver.openInputStream(uri)?.use { BitmapFactory.decodeStream(it, null, bounds) }
        if (bounds.outWidth <= 0 || bounds.outHeight <= 0) throw AppErrorException(AppError.Validation("image", "undecodable"))

        var sample = 1
        while (max(bounds.outWidth, bounds.outHeight) / (sample * 2) >= MAX_IMAGE_DIMENSION) sample *= 2
        val decoded = resolver.openInputStream(uri)?.use {
            BitmapFactory.decodeStream(it, null, BitmapFactory.Options().apply { inSampleSize = sample })
        } ?: throw AppErrorException(AppError.Validation("image", "undecodable"))

        val longest = max(decoded.width, decoded.height)
        val scaled = if (longest > MAX_IMAGE_DIMENSION) {
            val ratio = MAX_IMAGE_DIMENSION.toFloat() / longest
            Bitmap.createScaledBitmap(decoded, (decoded.width * ratio).toInt(), (decoded.height * ratio).toInt(), true)
        } else {
            decoded
        }
        val orientation = try {
            resolver.openInputStream(uri)?.use { ExifInterface(it).getAttributeInt(ExifInterface.TAG_ORIENTATION, ExifInterface.ORIENTATION_NORMAL) }
                ?: ExifInterface.ORIENTATION_NORMAL
        } catch (_: Exception) {
            ExifInterface.ORIENTATION_NORMAL
        }
        val rotated = rotate(scaled, orientation)
        val out = newFile("jpg")
        FileOutputStream(out).use { rotated.compress(Bitmap.CompressFormat.JPEG, JPEG_QUALITY, it) }
        if (rotated !== scaled) rotated.recycle()
        if (scaled !== decoded) scaled.recycle()
        decoded.recycle()
        media.copy(uri = Uri.fromFile(out).toString(), mimeType = "image/jpeg", sizeBytes = out.length(), name = out.name)
    }

    private fun rotate(bitmap: Bitmap, orientation: Int): Bitmap {
        val matrix = Matrix()
        when (orientation) {
            ExifInterface.ORIENTATION_ROTATE_90 -> matrix.postRotate(90f)
            ExifInterface.ORIENTATION_ROTATE_180 -> matrix.postRotate(180f)
            ExifInterface.ORIENTATION_ROTATE_270 -> matrix.postRotate(270f)
            ExifInterface.ORIENTATION_FLIP_HORIZONTAL -> matrix.preScale(-1f, 1f)
            ExifInterface.ORIENTATION_FLIP_VERTICAL -> matrix.preScale(1f, -1f)
            else -> return bitmap
        }
        return Bitmap.createBitmap(bitmap, 0, 0, bitmap.width, bitmap.height, matrix, true)
    }

    private suspend fun prepareVideo(uri: Uri, media: LocalMedia): LocalMedia {
        val original = copy(uri, media, extensionFor(media.mimeType, "mp4"), media.mimeType.ifBlank { "video/mp4" })
        if (original.sizeBytes <= VIDEO_COMPRESS_THRESHOLD) return original
        val out = newFile("mp4")
        val ok = transcode(Uri.parse(original.uri), out)
        return if (ok && out.length() in 1 until original.sizeBytes) {
            File(Uri.parse(original.uri).path.orEmpty()).delete()
            original.copy(uri = Uri.fromFile(out).toString(), mimeType = "video/mp4", sizeBytes = out.length(), name = out.name)
        } else {
            out.delete()
            original
        }
    }

    @OptIn(UnstableApi::class)
    private suspend fun transcode(input: Uri, output: File): Boolean = withContext(Dispatchers.Main) {
        suspendCancellableCoroutine { cont ->
            val transformer = Transformer.Builder(context)
                .setVideoMimeType(MimeTypes.VIDEO_H264)
                .setAudioMimeType(MimeTypes.AUDIO_AAC)
                .addListener(object : Transformer.Listener {
                    override fun onCompleted(composition: Composition, exportResult: ExportResult) {
                        if (cont.isActive) cont.resume(true)
                    }

                    override fun onError(composition: Composition, exportResult: ExportResult, exportException: ExportException) {
                        if (cont.isActive) cont.resume(false)
                    }
                })
                .build()
            val edited = EditedMediaItem.Builder(MediaItem.fromUri(input))
                .setEffects(Effects(emptyList(), listOf(Presentation.createForHeight(720))))
                .build()
            try {
                transformer.start(edited, output.absolutePath)
            } catch (_: Exception) {
                if (cont.isActive) cont.resume(false)
            }
            cont.invokeOnCancellation { transformer.cancel() }
        }
    }

    fun deleteLocal(uri: String) {
        val path = Uri.parse(uri).path ?: return
        if (path.startsWith(outboxDir.absolutePath)) File(path).delete()
    }

    companion object {
        private const val MAX_IMAGE_DIMENSION = 2048
        private const val JPEG_QUALITY = 85
        private const val VIDEO_COMPRESS_THRESHOLD = 8L * 1024 * 1024
    }
}
