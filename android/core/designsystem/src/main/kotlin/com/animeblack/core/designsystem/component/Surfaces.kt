package com.animeblack.core.designsystem.component

import androidx.annotation.DrawableRes
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxScope
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Shape
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import com.animeblack.core.designsystem.theme.AbColors
import com.animeblack.core.designsystem.theme.AbTheme

/** Rounded "glass" card: translucent charcoal with a hairline light border. */
@Composable
fun GlassCard(
    modifier: Modifier = Modifier,
    shape: Shape = RoundedCornerShape(20.dp),
    contentPadding: Dp = 14.dp,
    borderColor: Color? = null,
    onClick: (() -> Unit)? = null,
    content: @Composable ColumnScope.() -> Unit,
) {
    val colors = AbTheme.colors
    Column(
        modifier = modifier
            .clip(shape)
            .background(
                Brush.verticalGradient(
                    listOf(colors.surfaceHigh.copy(alpha = 0.94f), colors.surface.copy(alpha = 0.95f)),
                ),
            )
            .border(1.dp, borderColor ?: colors.glassBorder, shape)
            .then(if (onClick != null) Modifier.clickable(onClick = onClick) else Modifier)
            .padding(contentPadding),
        content = content,
    )
}

/** Web `.ico-tile`: rounded gradient or tinted square icon container. */
@Composable
fun IconTile(
    @DrawableRes icon: Int,
    modifier: Modifier = Modifier,
    size: Dp = 38.dp,
    cornerRadius: Dp = 12.dp,
    brush: Brush = AbColors.PrimaryGradient,
    tint: Color = Color.White,
    iconSize: Dp = 20.dp,
) {
    Box(
        modifier = modifier
            .size(size)
            .clip(RoundedCornerShape(cornerRadius))
            .background(brush)
            .border(0.75.dp, Color.White.copy(alpha = 0.18f), RoundedCornerShape(cornerRadius)),
        contentAlignment = Alignment.Center,
    ) {
        AbIcon(icon, contentDescription = null, tint = tint, size = iconSize)
    }
}

/** Web `.hbox`: compact glass action button used in the main header. */
@Composable
fun HeaderActionBox(
    @DrawableRes icon: Int,
    contentDescription: String?,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    tint: Color = Color.White,
    borderColor: Color = Color(0x26FFFFFF),
    badgeCount: Int = 0,
) {
    Box(
        modifier = modifier
            .size(38.dp)
            .clip(RoundedCornerShape(12.dp))
            .background(AbColors.Charcoal2.copy(alpha = 0.92f))
            .border(1.dp, borderColor, RoundedCornerShape(12.dp))
            .clickable(onClick = onClick),
        contentAlignment = Alignment.Center,
    ) {
        AbIcon(icon, contentDescription = contentDescription, tint = tint, size = 20.dp)
        if (badgeCount > 0) {
            Box(
                modifier = Modifier
                    .align(Alignment.TopEnd)
                    .padding(top = 5.dp, end = 5.dp)
                    .size(8.dp)
                    .clip(CircleShape)
                    .background(AbColors.Rose)
                    .border(1.5.dp, AbColors.Ink, CircleShape),
            )
        }
    }
}

/** Web `.card2.stat`: compact interactive stat tile with icon, bold value and muted label. */
@Composable
fun StatMiniCard(
    @DrawableRes icon: Int,
    value: String,
    label: String,
    modifier: Modifier = Modifier,
    iconTint: Color = AbColors.Cyan,
    valueColor: Color = Color.White,
    onClick: (() -> Unit)? = null,
) {
    val shape = RoundedCornerShape(14.dp)
    Column(
        modifier = modifier
            .clip(shape)
            .background(AbColors.Charcoal2.copy(alpha = 0.9f))
            .border(1.dp, Color(0x1FFFFFFF), shape)
            .then(if (onClick != null) Modifier.clickable(onClick = onClick) else Modifier)
            .padding(vertical = 10.dp, horizontal = 6.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
    ) {
        AbIcon(icon, contentDescription = null, tint = iconTint, size = 18.dp)
        Spacer(Modifier.height(4.dp))
        Text(
            value,
            style = MaterialTheme.typography.titleSmall,
            fontWeight = FontWeight.Black,
            color = valueColor,
            maxLines = 1,
            overflow = TextOverflow.Ellipsis,
        )
        Text(
            label,
            style = MaterialTheme.typography.labelSmall,
            color = AbColors.TextMuted,
            maxLines = 1,
            overflow = TextOverflow.Ellipsis,
        )
    }
}

/** Adds a soft coloured glow behind the content (used for hero elements and primary actions). */
fun Modifier.glow(color: Color, radius: Dp = 28.dp, alpha: Float = 0.35f): Modifier = drawBehind {
    val r = radius.toPx()
    drawCircle(
        brush = Brush.radialGradient(
            colors = listOf(color.copy(alpha = alpha), Color.Transparent),
            center = Offset(size.width / 2f, size.height / 2f),
            radius = maxOf(size.width, size.height) / 2f + r,
        ),
        radius = maxOf(size.width, size.height) / 2f + r,
        center = Offset(size.width / 2f, size.height / 2f),
    )
}

/** Box with a gradient border ("neon" outline). */
@Composable
fun GradientBorderBox(
    brush: Brush,
    modifier: Modifier = Modifier,
    shape: Shape = RoundedCornerShape(18.dp),
    borderWidth: Dp = 1.5.dp,
    content: @Composable BoxScope.() -> Unit,
) {
    Box(
        modifier = modifier
            .clip(shape)
            .border(borderWidth, brush, shape)
            .background(AbTheme.colors.surface),
        content = content,
    )
}
