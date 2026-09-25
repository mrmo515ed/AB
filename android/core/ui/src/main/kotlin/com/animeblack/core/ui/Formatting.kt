package com.animeblack.core.ui

import androidx.compose.runtime.Composable
import androidx.compose.ui.res.stringResource
import java.text.DateFormat
import java.util.Date
import java.util.Locale

/** Compact relative time ("now", "5m", "3h", "2d", then a date), localised. */
@Composable
fun relativeTime(epochMs: Long, now: Long = System.currentTimeMillis()): String {
    if (epochMs <= 0) return ""
    val diff = (now - epochMs).coerceAtLeast(0)
    val minutes = diff / 60_000
    return when {
        minutes < 1 -> stringResource(R.string.ui_now)
        minutes < 60 -> stringResource(R.string.ui_minutes_ago, minutes.toInt())
        minutes < 60 * 24 -> stringResource(R.string.ui_hours_ago, (minutes / 60).toInt())
        minutes < 60 * 24 * 7 -> stringResource(R.string.ui_days_ago, (minutes / (60 * 24)).toInt())
        else -> DateFormat.getDateInstance(DateFormat.MEDIUM, Locale.getDefault()).format(Date(epochMs))
    }
}

fun clockTime(epochMs: Long): String =
    DateFormat.getTimeInstance(DateFormat.SHORT, Locale.getDefault()).format(Date(epochMs))

fun dayLabel(epochMs: Long): String =
    DateFormat.getDateInstance(DateFormat.FULL, Locale.getDefault()).format(Date(epochMs))

/** 1234 → 1.2K, 3_400_000 → 3.4M. */
fun compactCount(value: Long): String = when {
    value < 1_000 -> value.toString()
    value < 1_000_000 -> String.format(Locale.US, "%.1fK", value / 1_000.0).replace(".0K", "K")
    else -> String.format(Locale.US, "%.1fM", value / 1_000_000.0).replace(".0M", "M")
}

fun compactCount(value: Int): String = compactCount(value.toLong())
