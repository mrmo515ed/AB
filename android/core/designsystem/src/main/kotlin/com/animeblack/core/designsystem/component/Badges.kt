package com.animeblack.core.designsystem.component

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.defaultMinSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import com.animeblack.core.designsystem.R
import com.animeblack.core.designsystem.icon.AbIcons
import com.animeblack.core.designsystem.theme.AbColors

/** Blue (official) or gold (admin / notable) verification seal. */
@Composable
fun VerifiedBadge(gold: Boolean = false, size: Dp = 16.dp, modifier: Modifier = Modifier) {
    AbIcon(
        icon = AbIcons.VerifiedFilled,
        contentDescription = stringResource(R.string.ab_verified),
        tint = if (gold) AbColors.VerifiedGold else AbColors.VerifiedBlue,
        size = size,
        modifier = modifier,
    )
}

/** Compact pill label (roles, categories, statuses). */
@Composable
fun Pill(
    text: String,
    modifier: Modifier = Modifier,
    color: Color = AbColors.Purple,
    textColor: Color = Color.White,
) {
    Box(
        modifier = modifier
            .background(color.copy(alpha = 0.22f), RoundedCornerShape(50))
            .padding(horizontal = 10.dp, vertical = 3.dp),
        contentAlignment = Alignment.Center,
    ) {
        Text(text, style = MaterialTheme.typography.labelSmall, color = textColor, fontWeight = FontWeight.Bold)
    }
}

@Composable
fun CountBadge(count: Int, modifier: Modifier = Modifier, color: Color = AbColors.Rose) {
    if (count <= 0) return
    Box(
        modifier = modifier
            .defaultMinSize(minWidth = 20.dp, minHeight = 20.dp)
            .background(color, RoundedCornerShape(50))
            .padding(horizontal = 6.dp, vertical = 1.dp),
        contentAlignment = Alignment.Center,
    ) {
        Text(
            if (count > 99) "99+" else count.toString(),
            color = Color.White,
            style = MaterialTheme.typography.labelSmall,
            fontWeight = FontWeight.Bold,
        )
    }
}
