package com.animeblack.core.ui

import android.content.ActivityNotFoundException
import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.provider.OpenableColumns
import com.animeblack.core.model.LocalMedia

/** Builds a [LocalMedia] from a picker/camera Uri: type from MIME, display name and size when known. */
fun localMediaFor(context: Context, uri: Uri): LocalMedia {
    val mime = context.contentResolver.getType(uri) ?: guessMime(uri.toString())
    val type = when {
        mime == "image/gif" -> "gif"
        mime.startsWith("video") -> "video"
        mime.startsWith("audio") -> "audio"
        mime.startsWith("image") -> "image"
        else -> "file"
    }
    var name = uri.lastPathSegment?.substringAfterLast('/').orEmpty()
    var size = 0L
    if (uri.scheme == "content") {
        try {
            context.contentResolver.query(uri, arrayOf(OpenableColumns.DISPLAY_NAME, OpenableColumns.SIZE), null, null, null)?.use { c ->
                if (c.moveToFirst()) {
                    c.getColumnIndex(OpenableColumns.DISPLAY_NAME).takeIf { it >= 0 }?.let { idx -> c.getString(idx)?.let { name = it } }
                    c.getColumnIndex(OpenableColumns.SIZE).takeIf { it >= 0 }?.let { idx -> if (!c.isNull(idx)) size = c.getLong(idx) }
                }
            }
        } catch (_: SecurityException) {
        } catch (_: IllegalArgumentException) {
        }
    }
    return LocalMedia(uri = uri.toString(), type = type, mimeType = mime, name = name, sizeBytes = size)
}

private fun guessMime(path: String): String = when (path.substringAfterLast('.', "").lowercase()) {
    "jpg", "jpeg" -> "image/jpeg"
    "png" -> "image/png"
    "webp" -> "image/webp"
    "gif" -> "image/gif"
    "mp4" -> "video/mp4"
    "m4a" -> "audio/mp4"
    "pdf" -> "application/pdf"
    else -> "application/octet-stream"
}

fun copyToClipboard(context: Context, text: String) {
    val cm = context.getSystemService(Context.CLIPBOARD_SERVICE) as? ClipboardManager ?: return
    cm.setPrimaryClip(ClipData.newPlainText("Anime Black", text))
}

/**
 * Opens an external http(s) link in the user's browser. Other schemes are ignored so message
 * content can never launch arbitrary intents.
 */
fun Context.openExternalUrl(url: String): Boolean {
    val normalized = if (url.startsWith("www.", ignoreCase = true)) "https://$url" else url
    val uri = Uri.parse(normalized)
    if (uri.scheme?.lowercase() !in setOf("http", "https")) return false
    return try {
        startActivity(Intent(Intent.ACTION_VIEW, uri).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
        true
    } catch (_: ActivityNotFoundException) {
        false
    }
}
