package com.animeblack.core.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil3.compose.AsyncImage
import com.animeblack.core.designsystem.component.AbIcon
import com.animeblack.core.designsystem.icon.AbIcons
import com.animeblack.core.model.MediaItem

/** Up to 4 tiles (+N overlay); videos show a play badge and open the viewer on tap. */
@Composable
fun MediaGrid(
    items: List<MediaItem>,
    onOpen: (MediaItem) -> Unit,
    modifier: Modifier = Modifier,
    autoplayVideo: Boolean = false,
) {
    if (items.isEmpty()) return
    val shape = RoundedCornerShape(16.dp)
    val visible = items.take(4)
    Box(modifier = modifier.fillMaxWidth().clip(shape)) {
        when (visible.size) {
            1 -> MediaTile(visible[0], onOpen, Modifier.fillMaxWidth().aspectRatio(if (visible[0].type == "video") 16f / 10f else 4f / 3.6f), autoplayVideo)
            2 -> Row(horizontalArrangement = Arrangement.spacedBy(3.dp)) {
                visible.forEach { MediaTile(it, onOpen, Modifier.weight(1f).aspectRatio(0.8f), false) }
            }
            else -> Column(verticalArrangement = Arrangement.spacedBy(3.dp)) {
                Row(horizontalArrangement = Arrangement.spacedBy(3.dp)) {
                    visible.take(2).forEach { MediaTile(it, onOpen, Modifier.weight(1f).aspectRatio(1.2f), false) }
                }
                Row(horizontalArrangement = Arrangement.spacedBy(3.dp)) {
                    visible.drop(2).forEachIndexed { i, item ->
                        Box(Modifier.weight(1f).aspectRatio(1.2f)) {
                            MediaTile(item, onOpen, Modifier.fillMaxSize(), false)
                            if (i == visible.size - 3 && items.size > 4) {
                                Box(Modifier.fillMaxSize().background(Color(0x99000000)), contentAlignment = Alignment.Center) {
                                    Text("+${items.size - 4}", color = Color.White, fontSize = 22.sp, fontWeight = FontWeight.Bold)
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun MediaTile(item: MediaItem, onOpen: (MediaItem) -> Unit, modifier: Modifier, autoplay: Boolean) {
    Box(modifier = modifier.background(Color(0xFF111118)).clickable { onOpen(item) }, contentAlignment = Alignment.Center) {
        if (item.type == "video") {
            if (autoplay && item.src.startsWith("http")) {
                VideoPlayer(url = item.src, modifier = Modifier.fillMaxSize(), muted = true, fill = true)
            } else {
                AsyncImage(model = item.thumbnail ?: item.src, contentDescription = null, contentScale = ContentScale.Crop, modifier = Modifier.fillMaxSize())
            }
            Box(Modifier.align(Alignment.Center).clip(RoundedCornerShape(50)).background(Color(0x88000000)).padding(10.dp)) {
                AbIcon(AbIcons.PlayArrowFilled, contentDescription = null, tint = Color.White, size = 26.dp)
            }
        } else {
            AsyncImage(model = item.src, contentDescription = null, contentScale = ContentScale.Crop, modifier = Modifier.fillMaxSize())
        }
    }
}
