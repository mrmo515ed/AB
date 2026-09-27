package com.animeblack.core.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.runtime.Composable
import androidx.compose.runtime.ReadOnlyComposable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalConfiguration
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import coil3.compose.AsyncImage
import com.animeblack.core.designsystem.theme.AbColors
import com.animeblack.core.model.AchievementBadge
import com.animeblack.core.model.LevelBadge
import com.animeblack.core.model.RankTier

/** True when the app UI language is Arabic (content catalogues ship both languages). */
@Composable
@ReadOnlyComposable
fun isArabicUi(): Boolean = LocalConfiguration.current.locales[0].language == "ar"

@Composable
@ReadOnlyComposable
fun LevelBadge.displayName(): String = if (isArabicUi()) name else nameEn ?: name

@Composable
@ReadOnlyComposable
fun LevelBadge.displayDescription(): String = if (isArabicUi()) description else descriptionEn ?: description

@Composable
@ReadOnlyComposable
fun AchievementBadge.displayName(): String = if (isArabicUi()) nameAr else nameEn

@Composable
@ReadOnlyComposable
fun AchievementBadge.displayDescription(): String = if (isArabicUi()) descriptionAr else descriptionEn

@Composable
@ReadOnlyComposable
fun RankTier.displayName(): String = if (isArabicUi()) nameAr else nameEn

fun rarityColor(rarity: String): Color = when (rarity.lowercase()) {
    "rare" -> AbColors.Blue
    "epic" -> AbColors.Purple
    "legendary" -> AbColors.Gold
    else -> AbColors.TextSecondary
}

/** Circular level-badge artwork (PNG/SVG data URL or https) with its colour glow. */
@Composable
fun LevelBadgeImage(badge: LevelBadge, modifier: Modifier = Modifier, size: Dp = 40.dp, locked: Boolean = false) {
    val color = AbColors.parse(badge.color, AbColors.Gold)
    val model = rememberImageModel(badge.image)
    Box(
        modifier
            .size(size)
            .clip(CircleShape)
            .background(Brush.radialGradient(listOf(color.copy(alpha = 0.45f), Color.Transparent)))
            .border(1.5.dp, color.copy(alpha = if (locked) 0.3f else 0.9f), CircleShape)
            .alpha(if (locked) 0.4f else 1f),
        contentAlignment = Alignment.Center,
    ) {
        if (model != null) {
            AsyncImage(model = model, contentDescription = badge.name, contentScale = ContentScale.Fit, modifier = Modifier.size(size * 0.86f))
        }
    }
}
