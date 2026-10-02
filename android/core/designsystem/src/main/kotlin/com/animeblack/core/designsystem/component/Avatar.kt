package com.animeblack.core.designsystem.component

import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.drawscope.rotate
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil3.compose.AsyncImage
import com.animeblack.core.designsystem.theme.AbColors

enum class AvatarRing { None, StoryUnseen, StorySeen, Gold, Neon }

/**
 * Circular avatar with a gradient initial fallback (shown while loading or when the URL fails),
 * optional animated story ring and online indicator.
 */
@Composable
fun Avatar(
    url: String?,
    name: String,
    modifier: Modifier = Modifier,
    size: Dp = 44.dp,
    ring: AvatarRing = AvatarRing.None,
    online: Boolean = false,
    onClick: (() -> Unit)? = null,
) {
    val ringWidth = if (ring == AvatarRing.None) 0.dp else 2.5.dp
    val spinAngle = if (ring == AvatarRing.StoryUnseen) {
        val transition = rememberInfiniteTransition(label = "storySpin")
        val angle by transition.animateFloat(
            initialValue = 0f,
            targetValue = 360f,
            animationSpec = infiniteRepeatable(
                animation = tween(durationMillis = 3600, easing = LinearEasing),
                repeatMode = RepeatMode.Restart,
            ),
            label = "angle",
        )
        angle
    } else {
        0f
    }
    Box(modifier = modifier.size(size), contentAlignment = Alignment.Center) {
        val inner = size - ringWidth * 2 - if (ring == AvatarRing.None) 0.dp else 3.dp
        Box(
            modifier = Modifier
                .size(size)
                .then(
                    when (ring) {
                        AvatarRing.None -> Modifier
                        AvatarRing.StoryUnseen -> Modifier.drawBehind {
                            rotate(spinAngle) {
                                drawCircle(
                                    brush = AbColors.StoryRing,
                                    style = Stroke(width = ringWidth.toPx()),
                                )
                            }
                        }
                        AvatarRing.StorySeen -> Modifier.border(ringWidth, AbColors.StorySeenRing, CircleShape)
                        AvatarRing.Gold -> Modifier.border(ringWidth, AbColors.GoldGradient, CircleShape)
                        AvatarRing.Neon -> Modifier.border(ringWidth, AbColors.CyanVioletGradient, CircleShape)
                    },
                )
                .then(if (onClick != null) Modifier.clip(CircleShape).clickable(onClick = onClick) else Modifier),
            contentAlignment = Alignment.Center,
        ) {
            Box(
                modifier = Modifier
                    .size(inner)
                    .clip(CircleShape)
                    .background(Brush.linearGradient(listOf(AbColors.DeepPurple, AbColors.Blue))),
                contentAlignment = Alignment.Center,
            ) {
                Text(
                    text = name.trim().take(1).uppercase().ifBlank { "?" },
                    color = Color.White,
                    fontWeight = FontWeight.Black,
                    fontSize = (inner.value * 0.42f).sp,
                )
                if (!url.isNullOrBlank()) {
                    AsyncImage(
                        model = url,
                        contentDescription = name,
                        contentScale = ContentScale.Crop,
                        modifier = Modifier.fillMaxSize(),
                    )
                }
            }
        }
        if (online) {
            val dot = (size.value * 0.26f).dp.coerceAtLeast(9.dp)
            Box(
                modifier = Modifier
                    .align(Alignment.BottomEnd)
                    .padding(1.dp)
                    .size(dot)
                    .clip(CircleShape)
                    .background(Color.Black)
                    .padding(2.dp)
                    .clip(CircleShape)
                    .background(AbColors.Online),
            )
        }
    }
}
