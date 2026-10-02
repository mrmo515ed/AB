package com.animeblack.core.data.media

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.net.Uri
import android.util.Base64
import com.google.firebase.storage.FirebaseStorage
import com.google.firebase.storage.StorageException
import com.google.firebase.storage.StorageMetadata
import com.google.firebase.storage.UploadTask
import java.io.ByteArrayOutputStream
import java.io.File
import javax.inject.Inject
import javax.inject.Singleton
import kotlin.math.max
import kotlin.math.roundToInt
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.tasks.await
import kotlinx.coroutines.withContext
import kotlinx.coroutines.withTimeout

/**
 * Resumable Cloud Storage uploads with automatic 3.2-second fallback to compressed DataURL
 * (matching `window.uploadMediaToStorage` in the web app) so images, stories, avatars, and
 * chat attachments publish instantaneously even when Firebase Storage is not enabled.
 */
@Singleton
class StorageUploader @Inject constructor(
    private val storage: FirebaseStorage,
) {
    suspend fun upload(
        file: File,
        storagePath: String,
        mimeType: String,
        sessionUri: String?,
        onProgress: (percent: Int, sessionUri: String?) -> Unit,
    ): String {
        val ref = storage.reference.child(storagePath)
        val metadata = StorageMetadata.Builder()
            .setContentType(mimeType)
            .setCacheControl("public, max-age=31536000")
            .build()
        val source = Uri.fromFile(file)

        suspend fun run(resume: Uri?): UploadTask.TaskSnapshot {
            val task = if (resume != null) ref.putFile(source, metadata, resume) else ref.putFile(source, metadata)
            task.addOnProgressListener { snap ->
                val total = snap.totalByteCount.coerceAtLeast(1L)
                onProgress(((snap.bytesTransferred * 100) / total).toInt(), snap.uploadSessionUri?.toString())
            }
            return task.await()
        }

        return try {
            withTimeout(3_200L) {
                try {
                    run(sessionUri?.let(Uri::parse))
                } catch (e: StorageException) {
                    if (sessionUri == null) throw e
                    run(null)
                }
                ref.downloadUrl.await().toString()
            }
        } catch (_: Throwable) {
            onProgress(100, null)
            encodeFallbackDataUrl(file, mimeType)
        }
    }

    private suspend fun encodeFallbackDataUrl(file: File, mimeType: String): String = withContext(Dispatchers.IO) {
        try {
            if (mimeType.startsWith("image/") && !mimeType.endsWith("gif")) {
                val bounds = BitmapFactory.Options().apply { inJustDecodeBounds = true }
                BitmapFactory.decodeFile(file.absolutePath, bounds)
                val maxDim = max(bounds.outWidth, bounds.outHeight)
                var sample = 1
                while (maxDim / sample > 1200) sample *= 2
                val decoded = BitmapFactory.decodeFile(
                    file.absolutePath,
                    BitmapFactory.Options().apply { inSampleSize = sample },
                )
                if (decoded != null) {
                    val targetMax = 840f
                    val longest = max(decoded.width, decoded.height).toFloat()
                    val scaled = if (longest > targetMax) {
                        val ratio = targetMax / longest
                        Bitmap.createScaledBitmap(
                            decoded,
                            (decoded.width * ratio).roundToInt().coerceAtLeast(1),
                            (decoded.height * ratio).roundToInt().coerceAtLeast(1),
                            true,
                        )
                    } else {
                        decoded
                    }
                    val out = ByteArrayOutputStream()
                    var quality = 78
                    scaled.compress(Bitmap.CompressFormat.JPEG, quality, out)
                    while (out.size() > 180_000 && quality > 42) {
                        out.reset()
                        quality -= 12
                        scaled.compress(Bitmap.CompressFormat.JPEG, quality, out)
                    }
                    val b64 = Base64.encodeToString(out.toByteArray(), Base64.NO_WRAP)
                    return@withContext "data:image/jpeg;base64,$b64"
                }
            }
            if (file.length() <= 360_000L) {
                val safeMime = mimeType.ifBlank { "application/octet-stream" }
                val b64 = Base64.encodeToString(file.readBytes(), Base64.NO_WRAP)
                return@withContext "data:$safeMime;base64,$b64"
            }
        } catch (_: Throwable) {
        }
        Uri.fromFile(file).toString()
    }
}
