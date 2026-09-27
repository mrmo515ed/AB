package com.animeblack.core.ui

import android.util.Base64
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.produceState
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

/**
 * Image model for Coil. Older web clients stored some media inline as `data:` URLs (when Storage
 * uploads were rejected); those are decoded off the main thread into bytes, everything else
 * (https, content, file) is passed through unchanged.
 */
@Composable
fun rememberImageModel(src: String?): Any? {
    if (src.isNullOrBlank()) return null
    if (!src.startsWith("data:")) return src
    val decoded by produceState<Any?>(initialValue = null, src) {
        value = withContext(Dispatchers.Default) { decodeDataUri(src) }
    }
    return decoded
}

fun decodeDataUri(src: String): ByteArray? = try {
    val comma = src.indexOf(',')
    when {
        comma < 0 -> null
        src.substring(0, comma).contains(";base64") -> Base64.decode(src.substring(comma + 1), Base64.DEFAULT)
        // `data:image/svg+xml;utf8,<svg …>` (web stickers / badge artwork): percent-encoded text.
        else -> percentDecode(src.substring(comma + 1)).toByteArray(Charsets.UTF_8)
    }
} catch (_: IllegalArgumentException) {
    null
}

/** Decodes `%XX` escapes only (unlike form decoding, `+` is kept literally). */
internal fun percentDecode(value: String): String {
    if (!value.contains('%')) return value
    val bytes = java.io.ByteArrayOutputStream(value.length)
    var i = 0
    while (i < value.length) {
        val c = value[i]
        if (c == '%' && i + 2 < value.length) {
            val hex = value.substring(i + 1, i + 3).toIntOrNull(16)
            if (hex != null) {
                bytes.write(hex)
                i += 3
                continue
            }
        }
        val encoded = c.toString().toByteArray(Charsets.UTF_8)
        bytes.write(encoded, 0, encoded.size)
        i++
    }
    return bytes.toString(Charsets.UTF_8.name())
}
