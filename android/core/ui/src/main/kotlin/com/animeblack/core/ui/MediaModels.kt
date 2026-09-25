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
    if (comma < 0 || !src.substring(0, comma).contains(";base64")) null else Base64.decode(src.substring(comma + 1), Base64.DEFAULT)
} catch (_: IllegalArgumentException) {
    null
}
