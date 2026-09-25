package com.animeblack.core.designsystem.theme

import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color

/** Anime Black palette (matches the web app: AMOLED black, charcoal, deep purple, blue/cyan accents). */
object AbColors {
    val Black = Color(0xFF000000)
    val Ink = Color(0xFF05050A)
    val Charcoal = Color(0xFF0B0B12)
    val Charcoal2 = Color(0xFF12121B)
    val Charcoal3 = Color(0xFF1A1A26)
    val Charcoal4 = Color(0xFF242434)
    val Line = Color(0x1FFFFFFF)
    val Line2 = Color(0x14FFFFFF)

    val DeepPurple = Color(0xFF6D28D9)
    val Purple = Color(0xFF8B5CF6)
    val Violet = Color(0xFFA78BFA)
    val Blue = Color(0xFF00A3FF)
    val Cyan = Color(0xFF22D3EE)
    val CyanInk = Color(0xFF04141A)
    val Rose = Color(0xFFF43F5E)
    val Pink = Color(0xFFF472B6)
    val Emerald = Color(0xFF10B981)
    val Gold = Color(0xFFF59E0B)
    val Orange = Color(0xFFFB923C)

    val TextPrimary = Color(0xFFF4F4F8)
    val TextSecondary = Color(0xFFB4B4C6)
    val TextMuted = Color(0xFF7C7C92)

    val Online = Emerald
    val VerifiedBlue = Color(0xFF00A3FF)
    val VerifiedGold = Gold

    val PrimaryGradient = Brush.linearGradient(listOf(Blue, Purple))
    val FireGradient = Brush.linearGradient(listOf(Color(0xFFFF7A00), Color(0xFFE60000)))
    val AuroraGradient = Brush.linearGradient(listOf(DeepPurple, Blue, Cyan))
    val StoryRing = Brush.sweepGradient(listOf(Cyan, Purple, Pink, Gold, Cyan))
    val StorySeenRing = Brush.linearGradient(listOf(Color(0xFF3A3A4A), Color(0xFF2A2A36)))

    fun parse(hex: String?, fallback: Color = Purple): Color = try {
        if (hex.isNullOrBlank()) fallback else Color(android.graphics.Color.parseColor(hex.trim()))
    } catch (_: IllegalArgumentException) {
        fallback
    }
}
