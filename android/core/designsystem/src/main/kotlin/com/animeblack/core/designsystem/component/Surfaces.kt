package com.animeblack.core.designsystem.component

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxScope
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Shape
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import com.animeblack.core.designsystem.theme.AbTheme

/** Rounded "glass" card: translucent charcoal with a hairline light border. */
@Composable
fun GlassCard(
    modifier: Modifier = Modifier,
    shape: Shape = RoundedCornerShape(20.dp),
    contentPadding: Dp = 14.dp,
    onClick: (() -> Unit)? = null,
    content: @Composable ColumnScope.() -> Unit,
) {
    val colors = AbTheme.colors
    Column(
        modifier = modifier
            .clip(shape)
            .background(
                Brush.verticalGradient(
                    listOf(colors.surfaceHigh.copy(alpha = 0.92f), colors.surface.copy(alpha = 0.92f)),
                ),
            )
            .border(1.dp, colors.glassBorder, shape)
            .then(if (onClick != null) Modifier.clickable(onClick = onClick) else Modifier)
            .padding(contentPadding),
        content = content,
    )
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
