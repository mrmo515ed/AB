package com.animeblack.core.designsystem.theme

import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color

/** Anime Black palette (matches the web app v25: AMOLED obsidian black, charcoal glass, deep purple, neon cyan/violet/gold accents). */
object AbColors {
    val Black = Color(0xFF000000)
    val Ink = Color(0xFF06070B)
    val Obsidian = Color(0xFF0A0C14)
    val Charcoal = Color(0xFF0B0B12)
    val Charcoal2 = Color(0xFF121420)
    val Charcoal3 = Color(0xFF1A1D2E)
    val Charcoal4 = Color(0xFF24283E)
    val Line = Color(0x1FFFFFFF)
    val Line2 = Color(0x14FFFFFF)

    val DeepPurple = Color(0xFF6D28D9)
    val Purple = Color(0xFF8B5CF6)
    val ElectricViolet = Color(0xFF8B5CF6)
    val Violet = Color(0xFFA78BFA)
    val Blue = Color(0xFF00A3FF)
    val Cyan = Color(0xFF22D3EE)
    val NeonCyan = Color(0xFF00F0FF)
    val CyanInk = Color(0xFF04141A)
    val Rose = Color(0xFFF43F5E)
    val Pink = Color(0xFFF472B6)
    val Emerald = Color(0xFF10B981)
    val Gold = Color(0xFFF59E0B)
    val BrightGold = Color(0xFFFBBF24)
    val Orange = Color(0xFFFB923C)

    val TextPrimary = Color(0xFFF8FAFC)
    val TextSecondary = Color(0xFFB4B4C6)
    val TextMuted = Color(0xFF8E95B2)

    val Online = Emerald
    val VerifiedBlue = Color(0xFF00A3FF)
    val VerifiedGold = Gold

    val PrimaryGradient = Brush.linearGradient(listOf(Blue, Purple))
    val CyanVioletGradient = Brush.linearGradient(listOf(NeonCyan, Blue, Purple))
    val GoldGradient = Brush.linearGradient(listOf(BrightGold, Gold, Orange))
    val HeroGradient = Brush.verticalGradient(listOf(Color(0xFF110D2A), Obsidian, Ink))
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
