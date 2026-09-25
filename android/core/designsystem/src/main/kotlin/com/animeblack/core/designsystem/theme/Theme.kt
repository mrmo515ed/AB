package com.animeblack.core.designsystem.theme

import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Shapes
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.Immutable
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp

/** Extra tokens that Material 3 does not model (glass surfaces, glow, gradients). */
@Immutable
data class AbExtendedColors(
    val background: Color,
    val surface: Color,
    val surfaceHigh: Color,
    val surfaceHighest: Color,
    val glass: Color,
    val glassBorder: Color,
    val glow: Color,
    val accent: Color,
    val onAccent: Color,
    val success: Color,
    val warning: Color,
    val danger: Color,
    val textMuted: Color,
    val bubbleMine: Color,
    val bubbleTheirs: Color,
    val isAmoled: Boolean,
)

val LocalAbColors = staticCompositionLocalOf {
    extendedColors(amoled = true)
}

private fun extendedColors(amoled: Boolean) = AbExtendedColors(
    background = if (amoled) AbColors.Black else AbColors.Charcoal,
    surface = if (amoled) AbColors.Ink else AbColors.Charcoal2,
    surfaceHigh = if (amoled) AbColors.Charcoal2 else AbColors.Charcoal3,
    surfaceHighest = if (amoled) AbColors.Charcoal3 else AbColors.Charcoal4,
    glass = Color(0x1AFFFFFF),
    glassBorder = Color(0x26FFFFFF),
    glow = AbColors.Purple.copy(alpha = 0.35f),
    accent = AbColors.Cyan,
    onAccent = AbColors.CyanInk,
    success = AbColors.Emerald,
    warning = AbColors.Gold,
    danger = AbColors.Rose,
    textMuted = AbColors.TextMuted,
    bubbleMine = Color(0xFF1F3B8F),
    bubbleTheirs = if (amoled) AbColors.Charcoal3 else AbColors.Charcoal4,
    isAmoled = amoled,
)

private fun colorScheme(amoled: Boolean) = darkColorScheme(
    primary = AbColors.Blue,
    onPrimary = Color.White,
    primaryContainer = Color(0xFF0B2E4F),
    onPrimaryContainer = Color(0xFFCDE8FF),
    secondary = AbColors.Purple,
    onSecondary = Color.White,
    secondaryContainer = Color(0xFF2E1A5C),
    onSecondaryContainer = Color(0xFFE9DDFF),
    tertiary = AbColors.Cyan,
    onTertiary = AbColors.CyanInk,
    tertiaryContainer = Color(0xFF073B45),
    onTertiaryContainer = Color(0xFFBDF4FF),
    background = if (amoled) AbColors.Black else AbColors.Charcoal,
    onBackground = AbColors.TextPrimary,
    surface = if (amoled) AbColors.Black else AbColors.Charcoal,
    onSurface = AbColors.TextPrimary,
    surfaceVariant = if (amoled) AbColors.Charcoal2 else AbColors.Charcoal3,
    onSurfaceVariant = AbColors.TextSecondary,
    surfaceContainerLowest = AbColors.Black,
    surfaceContainerLow = if (amoled) AbColors.Ink else AbColors.Charcoal2,
    surfaceContainer = if (amoled) AbColors.Charcoal else AbColors.Charcoal2,
    surfaceContainerHigh = if (amoled) AbColors.Charcoal2 else AbColors.Charcoal3,
    surfaceContainerHighest = if (amoled) AbColors.Charcoal3 else AbColors.Charcoal4,
    outline = Color(0x33FFFFFF),
    outlineVariant = AbColors.Line,
    error = AbColors.Rose,
    onError = Color.White,
    scrim = Color(0xCC000000),
)

val AbShapes = Shapes(
    extraSmall = RoundedCornerShape(8.dp),
    small = RoundedCornerShape(12.dp),
    medium = RoundedCornerShape(16.dp),
    large = RoundedCornerShape(22.dp),
    extraLarge = RoundedCornerShape(28.dp),
)

/**
 * Anime Black theme. Dark-only by design; [amoled] switches between pure-black (AMOLED) and
 * charcoal surfaces.
 */
@Composable
fun AnimeBlackTheme(amoled: Boolean = true, content: @Composable () -> Unit) {
    CompositionLocalProvider(LocalAbColors provides extendedColors(amoled)) {
        MaterialTheme(
            colorScheme = colorScheme(amoled),
            typography = AbTypography,
            shapes = AbShapes,
            content = content,
        )
    }
}

object AbTheme {
    val colors: AbExtendedColors
        @Composable get() = LocalAbColors.current
}
