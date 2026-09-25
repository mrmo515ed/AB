package com.animeblack.core.designsystem.component

import androidx.annotation.DrawableRes
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.expandVertically
import androidx.compose.animation.shrinkVertically
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.withFrameMillis
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.ContentDrawScope
import androidx.compose.ui.node.DrawModifierNode
import androidx.compose.ui.node.ModifierNodeElement
import androidx.compose.ui.node.invalidateDraw
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.animeblack.core.designsystem.R
import com.animeblack.core.designsystem.icon.AbIcons
import com.animeblack.core.designsystem.theme.AbColors
import com.animeblack.core.designsystem.theme.AbTheme
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch

@Composable
fun LoadingState(modifier: Modifier = Modifier, message: String? = null) {
    Column(
        modifier = modifier.fillMaxSize().padding(32.dp),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        CircularProgressIndicator(color = AbColors.Cyan, strokeWidth = 3.dp)
        Spacer(Modifier.height(14.dp))
        Text(message ?: stringResource(R.string.ab_loading), color = AbTheme.colors.textMuted, style = MaterialTheme.typography.bodyMedium)
    }
}

@Composable
fun EmptyState(
    title: String,
    modifier: Modifier = Modifier,
    message: String? = null,
    @DrawableRes icon: Int = AbIcons.AutoAwesome,
    actionLabel: String? = null,
    onAction: (() -> Unit)? = null,
) {
    Column(
        modifier = modifier.fillMaxWidth().padding(horizontal = 32.dp, vertical = 48.dp),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Box(
            modifier = Modifier
                .size(76.dp)
                .glow(AbColors.Purple, radius = 18.dp)
                .clip(CircleShape)
                .background(AbTheme.colors.surfaceHigh),
            contentAlignment = Alignment.Center,
        ) {
            AbIcon(icon, contentDescription = null, tint = AbColors.Violet, size = 34.dp)
        }
        Spacer(Modifier.height(16.dp))
        Text(title, style = MaterialTheme.typography.titleMedium, textAlign = TextAlign.Center)
        if (message != null) {
            Spacer(Modifier.height(6.dp))
            Text(message, style = MaterialTheme.typography.bodyMedium, color = AbTheme.colors.textMuted, textAlign = TextAlign.Center)
        }
        if (actionLabel != null && onAction != null) {
            Spacer(Modifier.height(18.dp))
            GradientButton(text = actionLabel, onClick = onAction)
        }
    }
}

@Composable
fun ErrorState(
    message: String,
    modifier: Modifier = Modifier,
    onRetry: (() -> Unit)? = null,
) {
    Column(
        modifier = modifier.fillMaxWidth().padding(horizontal = 32.dp, vertical = 40.dp),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        AbIcon(AbIcons.Error, contentDescription = null, tint = AbColors.Rose, size = 44.dp)
        Spacer(Modifier.height(12.dp))
        Text(stringResource(R.string.ab_something_went_wrong), style = MaterialTheme.typography.titleMedium)
        Spacer(Modifier.height(6.dp))
        Text(message, style = MaterialTheme.typography.bodyMedium, color = AbTheme.colors.textMuted, textAlign = TextAlign.Center)
        if (onRetry != null) {
            Spacer(Modifier.height(16.dp))
            GlassButton(text = stringResource(R.string.ab_retry), onClick = onRetry, icon = AbIcons.Refresh)
        }
    }
}

/** Persistent banner shown while the device is offline (writes are queued by Firestore). */
@Composable
fun OfflineBanner(visible: Boolean, modifier: Modifier = Modifier) {
    AnimatedVisibility(visible = visible, enter = expandVertically(), exit = shrinkVertically(), modifier = modifier) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(Color(0xFF3B2A06))
                .padding(horizontal = 14.dp, vertical = 8.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            AbIcon(AbIcons.CloudOff, contentDescription = null, tint = AbColors.Gold, size = 18.dp)
            Spacer(Modifier.width(8.dp))
            Text(stringResource(R.string.ab_offline_banner), style = MaterialTheme.typography.labelMedium, color = Color(0xFFFFE3A3))
        }
    }
}

/** Animated shimmer placeholder used by skeleton loaders (Modifier.Node implementation). */
fun Modifier.shimmer(): Modifier = this then ShimmerElement

private data object ShimmerElement : ModifierNodeElement<ShimmerNode>() {
    override fun create(): ShimmerNode = ShimmerNode()
    override fun update(node: ShimmerNode) = Unit
}

private class ShimmerNode : Modifier.Node(), DrawModifierNode {
    private var progress = 0f
    private val colors = listOf(Color(0xFF15151F), Color(0xFF262635), Color(0xFF15151F))

    override fun onAttach() {
        coroutineScope.launch {
            val start = withFrameMillis { it }
            while (isActive) {
                withFrameMillis { t -> progress = ((t - start) % 1300L) / 1300f }
                invalidateDraw()
            }
        }
    }

    override fun ContentDrawScope.draw() {
        val w = size.width.coerceAtLeast(1f)
        val x = -w + progress * (w * 3f)
        drawRect(Brush.linearGradient(colors, start = Offset(x, 0f), end = Offset(x + w * 0.6f, size.height)))
        drawContent()
    }
}

@Composable
fun SkeletonLine(modifier: Modifier = Modifier, widthFraction: Float = 1f, height: Int = 12) {
    Box(
        modifier = modifier
            .fillMaxWidth(widthFraction)
            .height(height.dp)
            .clip(RoundedCornerShape(6.dp))
            .shimmer(),
    )
}

@Composable
fun PostSkeleton(modifier: Modifier = Modifier) {
    GlassCard(modifier = modifier.fillMaxWidth()) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Box(Modifier.size(42.dp).clip(CircleShape).shimmer())
            Spacer(Modifier.width(10.dp))
            Column(Modifier.weight(1f)) {
                SkeletonLine(widthFraction = 0.45f)
                Spacer(Modifier.height(6.dp))
                SkeletonLine(widthFraction = 0.25f, height = 10)
            }
        }
        Spacer(Modifier.height(14.dp))
        SkeletonLine()
        Spacer(Modifier.height(8.dp))
        SkeletonLine(widthFraction = 0.8f)
        Spacer(Modifier.height(12.dp))
        Box(Modifier.fillMaxWidth().height(180.dp).clip(RoundedCornerShape(16.dp)).shimmer())
    }
}
