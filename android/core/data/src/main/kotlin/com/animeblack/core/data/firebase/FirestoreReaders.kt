package com.animeblack.core.data.firebase

import com.google.firebase.Timestamp
import java.util.Date

/*
 * Tolerant readers for documents written by different client generations (web + native):
 * numbers may be Long/Double/String, times may be epoch millis or Timestamp, lists may contain
 * ids or objects. Documents are mapped manually (no reflection), which keeps R8 rules trivial and
 * never crashes on legacy data.
 */

internal fun Map<*, *>.toStringKeyed(): Map<String, Any?> = entries.associate { it.key.toString() to it.value }

internal fun anyToLong(v: Any?): Long? = when (v) {
    null -> null
    is Long -> v
    is Int -> v.toLong()
    is Double -> if (v.isNaN()) null else v.toLong()
    is Float -> v.toLong()
    is Number -> v.toLong()
    is Timestamp -> v.toDate().time
    is Date -> v.time
    is String -> v.toLongOrNull() ?: v.toDoubleOrNull()?.toLong()
    is Boolean -> if (v) 1L else 0L
    else -> null
}

internal fun Map<String, Any?>.str(key: String, default: String = ""): String = when (val v = this[key]) {
    null -> default
    is String -> v
    is Long, is Int -> v.toString()
    is Double -> if (v % 1.0 == 0.0) v.toLong().toString() else v.toString()
    else -> v.toString()
}

internal fun Map<String, Any?>.strOrNull(key: String): String? = when (val v = this[key]) {
    null -> null
    is String -> v.ifBlank { null }
    else -> str(key).ifBlank { null }
}

internal fun Map<String, Any?>.long(key: String, default: Long = 0L): Long = anyToLong(this[key]) ?: default

internal fun Map<String, Any?>.int(key: String, default: Int = 0): Int = anyToLong(this[key])?.toInt() ?: default

internal fun Map<String, Any?>.double(key: String): Double? = when (val v = this[key]) {
    is Number -> v.toDouble()
    is String -> v.toDoubleOrNull()
    else -> null
}

internal fun Map<String, Any?>.bool(key: String, default: Boolean = false): Boolean = when (val v = this[key]) {
    is Boolean -> v
    is String -> v.equals("true", ignoreCase = true) || v == "1"
    is Number -> v.toInt() != 0
    else -> default
}

/** A list of ids; object elements contribute their `id`/`uid`/`u` field. */
internal fun Map<String, Any?>.strList(key: String): List<String> = (this[key] as? List<*>)?.mapNotNull { e ->
    when (e) {
        null -> null
        is String -> e.ifBlank { null }
        is Map<*, *> -> (e["id"] ?: e["uid"] ?: e["u"])?.toString()
        else -> e.toString()
    }
} ?: emptyList()

internal fun Map<String, Any?>.mapList(key: String): List<Map<String, Any?>> =
    (this[key] as? List<*>)?.mapNotNull { (it as? Map<*, *>)?.toStringKeyed() } ?: emptyList()

internal fun Map<String, Any?>.obj(key: String): Map<String, Any?>? = (this[key] as? Map<*, *>)?.toStringKeyed()

/** A count stored either as a number or as a list (legacy). */
internal fun Map<String, Any?>.countOf(key: String): Int = when (val v = this[key]) {
    is Number -> v.toInt()
    is List<*> -> v.size
    is String -> v.toIntOrNull() ?: 0
    else -> 0
}

internal fun Map<String, Any?>.firstLong(vararg keys: String): Long {
    for (k in keys) {
        val v = anyToLong(this[k])
        if (v != null && v > 0) return v
    }
    return 0L
}

internal fun Map<String, Any?>.firstStr(vararg keys: String): String {
    for (k in keys) {
        val v = strOrNull(k)
        if (v != null) return v
    }
    return ""
}
