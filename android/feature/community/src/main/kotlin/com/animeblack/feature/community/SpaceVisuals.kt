package com.animeblack.feature.community

import androidx.annotation.DrawableRes
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import coil3.compose.AsyncImage
import com.animeblack.core.designsystem.component.AbIcon
import com.animeblack.core.designsystem.icon.AbIcons
import com.animeblack.core.designsystem.theme.AbColors

/** Icon keys stored in `icon` fields (web used lucide names); mapped to Material Symbols. */
val SPACE_ICON_KEYS = listOf("users", "globe", "gamepad", "sword", "star", "flame", "book", "music", "film", "crown", "zap", "heart")

@DrawableRes
fun spaceIcon(key: String): Int = when (key.lowercase()) {
    "users", "group", "groups" -> AbIcons.Groups
    "globe", "world", "earth" -> AbIcons.Public
    "gamepad", "gamepad2", "game", "games" -> AbIcons.SportsEsports
    "sword", "swords" -> AbIcons.Swords
    "star", "sparkles" -> AbIcons.StarFilled
    "flame", "fire" -> AbIcons.LocalFireDepartment
    "book", "books", "book-open" -> AbIcons.MenuBook
    "music" -> AbIcons.MusicNote
    "film", "tv", "clapperboard" -> AbIcons.Movie
    "crown" -> AbIcons.WorkspacePremium
    "zap", "bolt" -> AbIcons.Bolt
    "heart" -> AbIcons.FavoriteFilled
    "shield" -> AbIcons.Shield
    "palette", "brush" -> AbIcons.Palette
    else -> AbIcons.Groups
}

/** Rounded gradient tile with the space icon, or its avatar image when one is set. */
@Composable
fun SpaceAvatar(icon: String, color1: String, color2: String, modifier: Modifier = Modifier, size: Dp = 48.dp, imageUrl: String? = null) {
    Box(
        modifier
            .size(size)
            .clip(RoundedCornerShape(size / 3.2f))
            .background(Brush.linearGradient(listOf(AbColors.parse(color1, AbColors.DeepPurple), AbColors.parse(color2, AbColors.Blue)))),
        contentAlignment = Alignment.Center,
    ) {
        if (!imageUrl.isNullOrBlank() && imageUrl.startsWith("http")) {
            AsyncImage(model = imageUrl, contentDescription = null, contentScale = ContentScale.Crop, modifier = Modifier.matchParentSize())
        } else {
            AbIcon(spaceIcon(icon), null, tint = Color.White, size = size * 0.5f)
        }
    }
}
