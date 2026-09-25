package com.animeblack.core.ui.chat

import android.text.format.DateUtils
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.animeblack.core.designsystem.theme.AbColors
import com.animeblack.core.model.ChatMessage
import com.animeblack.core.ui.R
import com.animeblack.core.ui.dayLabel
import java.util.Calendar

/** Rows of a chat list rendered with `reverseLayout = true` (index 0 = newest). */
sealed interface ChatListItem {
    val key: String

    data class Message(val message: ChatMessage, val grouped: Boolean) : ChatListItem {
        override val key: String get() = message.id
    }

    data class Day(val epochMs: Long, val dayKey: Int) : ChatListItem {
        override val key: String get() = "day_$dayKey"
    }
}

private const val GROUP_WINDOW_MS = 5 * 60_000L

/**
 * Builds newest-first rows with day separators and sender grouping from messages sorted
 * oldest-first. Pure function — unit tested.
 */
fun buildChatItems(messagesAscending: List<ChatMessage>): List<ChatListItem> {
    val out = ArrayList<ChatListItem>(messagesAscending.size + 8)
    val calendar = Calendar.getInstance()
    var lastDay = Int.MIN_VALUE
    var previous: ChatMessage? = null
    for (m in messagesAscending) {
        calendar.timeInMillis = m.at
        val day = calendar.get(Calendar.YEAR) * 1000 + calendar.get(Calendar.DAY_OF_YEAR)
        if (day != lastDay) {
            out += ChatListItem.Day(m.at, day)
            lastDay = day
            previous = null
        }
        val p = previous
        val grouped = p != null && p.senderId == m.senderId && !p.isSystem && !m.isSystem && m.at - p.at < GROUP_WINDOW_MS
        out += ChatListItem.Message(m, grouped)
        previous = m
    }
    out.reverse()
    return out
}

@Composable
fun DaySeparator(epochMs: Long, modifier: Modifier = Modifier) {
    val label = when {
        DateUtils.isToday(epochMs) -> stringResource(R.string.ui_chat_today)
        DateUtils.isToday(epochMs + DateUtils.DAY_IN_MILLIS) -> stringResource(R.string.ui_chat_yesterday)
        else -> dayLabel(epochMs)
    }
    Box(modifier.fillMaxWidth().padding(vertical = 10.dp), contentAlignment = Alignment.Center) {
        Text(
            label,
            color = AbColors.TextSecondary,
            style = MaterialTheme.typography.labelSmall,
            modifier = Modifier.clip(RoundedCornerShape(50)).background(AbColors.Charcoal3).padding(horizontal = 12.dp, vertical = 4.dp),
        )
    }
}

/** Animated three-dot typing bubble. */
@Composable
fun TypingIndicator(modifier: Modifier = Modifier, label: String? = null) {
    val transition = rememberInfiniteTransition(label = "typing")
    Row(
        modifier
            .padding(horizontal = 12.dp, vertical = 6.dp)
            .clip(RoundedCornerShape(16.dp))
            .background(AbColors.Charcoal3)
            .padding(horizontal = 12.dp, vertical = 10.dp),
        horizontalArrangement = Arrangement.spacedBy(4.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        repeat(3) { i ->
            val alpha by transition.animateFloat(
                initialValue = 0.25f,
                targetValue = 1f,
                animationSpec = infiniteRepeatable(tween(durationMillis = 520, delayMillis = i * 140), RepeatMode.Reverse),
                label = "dot$i",
            )
            Box(Modifier.size(7.dp).graphicsLayer { this.alpha = alpha }.clip(CircleShape).background(Color.White))
        }
        if (label != null) {
            Text(label, color = AbColors.TextSecondary, style = MaterialTheme.typography.labelSmall, modifier = Modifier.padding(start = 6.dp))
        }
    }
}
