package com.animeblack.core.designsystem.component

import androidx.annotation.DrawableRes
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.defaultMinSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
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
    val shape = RoundedCornerShape(50)
    Box(
        modifier = modifier
            .background(color.copy(alpha = 0.22f), shape)
            .border(0.75.dp, color.copy(alpha = 0.42f), shape)
            .padding(horizontal = 10.dp, vertical = 3.dp),
        contentAlignment = Alignment.Center,
    ) {
        Text(text, style = MaterialTheme.typography.labelSmall, color = textColor, fontWeight = FontWeight.Bold)
    }
}

/** Web `.chip` / `.chip.on`: interactive filter/action pill with high-contrast active cyan fill. */
@Composable
fun GlowChip(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    selected: Boolean = false,
    @DrawableRes icon: Int? = null,
    accentColor: Color = AbColors.Cyan,
) {
    val shape = RoundedCornerShape(50)
    val bg = if (selected) accentColor else AbColors.Charcoal2.copy(alpha = 0.9f)
    val fg = if (selected) AbColors.CyanInk else Color.White
    val border = if (selected) accentColor else Color(0x24FFFFFF)
    Row(
        verticalAlignment = Alignment.CenterVertically,
        modifier = modifier
            .clip(shape)
            .background(bg)
            .border(1.dp, border, shape)
            .clickable(onClick = onClick)
            .padding(horizontal = 12.dp, vertical = 7.dp),
    ) {
        if (icon != null) {
            AbIcon(icon, contentDescription = null, tint = if (selected) AbColors.CyanInk else accentColor, size = 15.dp)
            Spacer(Modifier.width(5.dp))
        }
        Text(
            text = text,
            style = MaterialTheme.typography.labelMedium,
            color = fg,
            fontWeight = if (selected) FontWeight.ExtraBold else FontWeight.SemiBold,
        )
    }
}

/** Web `coinChip()`: gold coin balance pill. */
@Composable
fun CoinChip(amountText: String, modifier: Modifier = Modifier, onClick: (() -> Unit)? = null) {
    val shape = RoundedCornerShape(50)
    Row(
        verticalAlignment = Alignment.CenterVertically,
        modifier = modifier
            .clip(shape)
            .background(AbColors.Gold.copy(alpha = 0.16f))
            .border(1.dp, AbColors.Gold.copy(alpha = 0.45f), shape)
            .then(if (onClick != null) Modifier.clickable(onClick = onClick) else Modifier)
            .padding(horizontal = 10.dp, vertical = 4.dp),
    ) {
        AbIcon(AbIcons.Paid, contentDescription = null, tint = AbColors.BrightGold, size = 15.dp)
        Spacer(Modifier.width(4.dp))
        Text(amountText, style = MaterialTheme.typography.labelSmall, color = AbColors.BrightGold, fontWeight = FontWeight.Black)
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
