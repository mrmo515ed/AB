package com.animeblack.core.ui.chat

import android.text.format.Formatter
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.combinedClickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.IntrinsicSize
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.produceState
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import coil3.compose.AsyncImage
import com.animeblack.core.designsystem.component.AbIcon
import com.animeblack.core.designsystem.component.Avatar
import com.animeblack.core.designsystem.icon.AbIcons
import com.animeblack.core.designsystem.theme.AbColors
import com.animeblack.core.model.Attachment
import com.animeblack.core.model.ChatMessage
import com.animeblack.core.model.MessageQuote
import com.animeblack.core.model.MessageStatus
import com.animeblack.core.ui.LinkifiedText
import com.animeblack.core.ui.R
import com.animeblack.core.ui.clockTime
import com.animeblack.core.ui.reactionStyle
import com.animeblack.core.ui.rememberImageModel

private val VISUAL_TYPES = setOf("image", "gif", "video", "sticker")
private val SENDER_COLORS = listOf(AbColors.Cyan, AbColors.Pink, AbColors.Gold, AbColors.Emerald, AbColors.Orange, AbColors.Violet)

/** Deterministic colour for a sender's name in group rooms. */
fun senderColor(uid: String): Color = SENDER_COLORS[(uid.hashCode() and 0x7fffffff) % SENDER_COLORS.size]

/**
 * A chat message bubble shared by private chats, groups, worlds and community channels.
 * Ownership is decided by the caller from `senderId` only.
 */
@Composable
fun MessageBubble(
    message: ChatMessage,
    isMine: Boolean,
    modifier: Modifier = Modifier,
    myUid: String = "",
    showSender: Boolean = false,
    grouped: Boolean = false,
    highlighted: Boolean = false,
    resolveUrl: (suspend (Attachment) -> String)? = null,
    onLongPress: () -> Unit = {},
    onOpenMedia: (url: String, type: String, name: String) -> Unit = { _, _, _ -> },
    onOpenUser: (String) -> Unit = {},
    onRetry: () -> Unit = {},
    onQuoteClick: (String) -> Unit = {},
    onReactionClick: (String) -> Unit = {},
    onMention: (String) -> Unit = {},
    onUrl: (String) -> Unit = {},
) {
    if (message.isSystem) {
        SystemEvent(message.text, modifier)
        return
    }
    val shape = RoundedCornerShape(
        topStart = 18.dp,
        topEnd = 18.dp,
        bottomStart = if (isMine || grouped) 18.dp else 6.dp,
        bottomEnd = if (isMine && !grouped) 6.dp else 18.dp,
    )
    val stickerOnly = message.type == ChatMessage.TYPE_STICKER && !message.isDeleted && message.text.isBlank()
    val failed = isMine && message.status == MessageStatus.Failed
    val contentColor = if (isMine) Color.White else AbColors.TextPrimary

    Row(
        modifier.fillMaxWidth().padding(top = if (grouped) 2.dp else 8.dp, start = 8.dp, end = 8.dp),
        horizontalArrangement = if (isMine) Arrangement.End else Arrangement.Start,
        verticalAlignment = Alignment.Bottom,
    ) {
        if (!isMine && showSender) {
            if (grouped) {
                Spacer(Modifier.width(30.dp))
            } else {
                Avatar(message.senderAvatar, message.senderName, size = 30.dp, onClick = { onOpenUser(message.senderId) })
            }
            Spacer(Modifier.width(6.dp))
        }
        Column(horizontalAlignment = if (isMine) Alignment.End else Alignment.Start, modifier = Modifier.widthIn(max = 300.dp)) {
            val background = when {
                stickerOnly -> Modifier
                isMine -> Modifier.background(AbColors.PrimaryGradient)
                else -> Modifier.background(AbColors.Charcoal3)
            }
            Column(
                Modifier
                    .clip(shape)
                    .then(background)
                    .then(if (highlighted) Modifier.border(2.dp, AbColors.Cyan, shape) else Modifier)
                    .combinedClickable(onClick = { if (failed) onRetry() }, onLongClick = onLongPress)
                    .padding(if (stickerOnly) 0.dp else 8.dp),
            ) {
                if (showSender && !isMine && !grouped && message.senderName.isNotBlank()) {
                    Text(
                        message.senderName,
                        color = senderColor(message.senderId),
                        style = MaterialTheme.typography.labelMedium,
                        fontWeight = FontWeight.SemiBold,
                        modifier = Modifier.padding(horizontal = 4.dp).clickable { onOpenUser(message.senderId) },
                    )
                }
                message.replyTo?.let { QuoteBlock(it, isMine) { onQuoteClick(it.id) } }
                if (message.isDeleted) {
                    Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.padding(4.dp)) {
                        AbIcon(AbIcons.Block, null, tint = contentColor.copy(alpha = 0.7f), size = 14.dp)
                        Spacer(Modifier.width(6.dp))
                        Text(
                            stringResource(R.string.ui_chat_message_deleted),
                            color = contentColor.copy(alpha = 0.7f),
                            fontStyle = FontStyle.Italic,
                            style = MaterialTheme.typography.bodyMedium,
                        )
                    }
                } else {
                    Attachments(message, contentColor, resolveUrl, onOpenMedia)
                    if (message.text.isNotBlank()) {
                        LinkifiedText(
                            text = message.text,
                            color = contentColor,
                            style = MaterialTheme.typography.bodyLarge,
                            onMention = onMention,
                            onUrl = onUrl,
                            modifier = Modifier.padding(horizontal = 4.dp, vertical = 2.dp),
                        )
                    }
                }
                Footer(message, isMine, contentColor, Modifier.align(Alignment.End))
            }
            if (message.isPending && message.uploadProgress in 0..99) {
                LinearProgressIndicator(
                    progress = { message.uploadProgress / 100f },
                    modifier = Modifier.width(140.dp).padding(top = 4.dp).clip(RoundedCornerShape(2.dp)),
                    color = AbColors.Cyan,
                    trackColor = AbColors.Charcoal4,
                )
            }
            if (failed) {
                Row(
                    Modifier.padding(top = 4.dp).clip(RoundedCornerShape(8.dp)).clickable(onClick = onRetry).padding(4.dp),
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    AbIcon(AbIcons.Error, null, tint = AbColors.Rose, size = 14.dp)
                    Spacer(Modifier.width(4.dp))
                    Text(stringResource(R.string.ui_chat_failed), color = AbColors.Rose, style = MaterialTheme.typography.labelSmall)
                }
            }
            val summary = message.reactionSummary()
            if (summary.isNotEmpty() && !message.isDeleted) {
                ReactionChips(summary, message.reactions[myUid], onReactionClick, Modifier.padding(top = 2.dp))
            }
        }
    }
}

@Composable
private fun SystemEvent(text: String, modifier: Modifier) {
    Box(modifier.fillMaxWidth().padding(vertical = 6.dp), contentAlignment = Alignment.Center) {
        Text(
            text,
            color = AbColors.TextSecondary,
            style = MaterialTheme.typography.labelSmall,
            modifier = Modifier.clip(RoundedCornerShape(50)).background(AbColors.Charcoal3).padding(horizontal = 12.dp, vertical = 4.dp),
        )
    }
}

@Composable
private fun QuoteBlock(quote: MessageQuote, isMine: Boolean, onClick: () -> Unit) {
    Row(
        Modifier
            .padding(bottom = 4.dp)
            .clip(RoundedCornerShape(10.dp))
            .background(if (isMine) Color(0x33000000) else AbColors.Charcoal4)
            .clickable(onClick = onClick)
            .height(IntrinsicSize.Min),
    ) {
        Box(Modifier.width(3.dp).fillMaxHeight().background(if (isMine) Color.White else senderColor(quote.senderName)))
        Column(Modifier.padding(horizontal = 8.dp, vertical = 5.dp)) {
            Text(quote.senderName, color = if (isMine) Color.White else senderColor(quote.senderName), style = MaterialTheme.typography.labelMedium, fontWeight = FontWeight.SemiBold, maxLines = 1)
            Text(
                quote.text.ifBlank { quote.type },
                color = (if (isMine) Color.White else AbColors.TextSecondary).copy(alpha = 0.85f),
                style = MaterialTheme.typography.bodySmall,
                maxLines = 2,
                overflow = TextOverflow.Ellipsis,
            )
        }
    }
}

@Composable
private fun Attachments(
    message: ChatMessage,
    contentColor: Color,
    resolveUrl: (suspend (Attachment) -> String)?,
    onOpenMedia: (String, String, String) -> Unit,
) {
    if (message.attachments.isEmpty()) return
    val visual = message.attachments.filter { it.type in VISUAL_TYPES }
    val others = message.attachments.filter { it.type !in VISUAL_TYPES }
    if (visual.size == 1) {
        val a = visual.first()
        val size = when (a.type) {
            "sticker" -> Modifier.size(128.dp)
            "video" -> Modifier.width(240.dp).height(180.dp)
            else -> Modifier.size(240.dp)
        }
        VisualAttachment(a, resolveUrl, onOpenMedia, size)
    } else if (visual.size > 1) {
        Column(verticalArrangement = Arrangement.spacedBy(3.dp)) {
            visual.take(6).chunked(2).forEach { row ->
                Row(horizontalArrangement = Arrangement.spacedBy(3.dp)) {
                    row.forEach { VisualAttachment(it, resolveUrl, onOpenMedia, Modifier.size(128.dp)) }
                }
            }
        }
    }
    others.forEach { a ->
        val url = rememberResolvedUrl(a, resolveUrl)
        when (a.type) {
            "voice", "audio" -> if (url != null) VoiceMessagePlayer(url, a.durationSec.takeIf { it > 0 } ?: message.voiceDurationSec, tint = contentColor)
            else -> FileAttachment(a, contentColor) { url?.let { onOpenMedia(it, "file", a.name) } }
        }
    }
}

@Composable
private fun rememberResolvedUrl(a: Attachment, resolveUrl: (suspend (Attachment) -> String)?): String? {
    val direct = a.src.takeIf { it.isNotBlank() }
    if (resolveUrl == null || a.storagePath.isNullOrBlank() || (direct != null && !direct.startsWith("data:") && !direct.startsWith("gs:"))) return direct
    val resolved by produceState(initialValue = direct?.takeIf { !it.startsWith("gs:") }, a.src, a.storagePath) {
        value = try {
            resolveUrl(a)
        } catch (_: Exception) {
            direct
        }
    }
    return resolved
}

@Composable
private fun VisualAttachment(
    a: Attachment,
    resolveUrl: (suspend (Attachment) -> String)?,
    onOpenMedia: (String, String, String) -> Unit,
    modifier: Modifier,
) {
    val url = rememberResolvedUrl(a, resolveUrl)
    val model = rememberImageModel(url)
    Box(
        modifier
            .clip(RoundedCornerShape(12.dp))
            .background(if (a.type == "sticker") Color.Transparent else AbColors.Charcoal4)
            .clickable(enabled = url != null) { url?.let { onOpenMedia(it, if (a.type == "video") "video" else "image", a.name) } },
        contentAlignment = Alignment.Center,
    ) {
        if (model != null) {
            AsyncImage(
                model = model,
                contentDescription = a.name.ifBlank { null },
                contentScale = if (a.type == "sticker") ContentScale.Fit else ContentScale.Crop,
                modifier = Modifier.matchParentSize(),
            )
        }
        if (a.type == "video") {
            Box(Modifier.size(46.dp).clip(CircleShape).background(Color(0x99000000)), contentAlignment = Alignment.Center) {
                AbIcon(AbIcons.PlayArrowFilled, null, tint = Color.White, size = 28.dp)
            }
        }
    }
}

@Composable
private fun FileAttachment(a: Attachment, contentColor: Color, onOpen: () -> Unit) {
    val context = LocalContext.current
    Row(
        Modifier.widthIn(min = 180.dp, max = 260.dp).clip(RoundedCornerShape(12.dp)).background(Color(0x22000000)).clickable(onClick = onOpen).padding(10.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        AbIcon(AbIcons.Description, null, tint = contentColor, size = 28.dp)
        Spacer(Modifier.width(8.dp))
        Column(Modifier.weight(1f)) {
            Text(a.name.ifBlank { stringResource(R.string.ui_chat_file) }, color = contentColor, style = MaterialTheme.typography.bodyMedium, maxLines = 1, overflow = TextOverflow.Ellipsis)
            if (a.size > 0) Text(Formatter.formatShortFileSize(context, a.size), color = contentColor.copy(alpha = 0.7f), style = MaterialTheme.typography.labelSmall)
        }
        AbIcon(AbIcons.Download, stringResource(R.string.ui_chat_open_file), tint = contentColor, size = 20.dp)
    }
}

@Composable
private fun Footer(message: ChatMessage, isMine: Boolean, contentColor: Color, modifier: Modifier) {
    Row(modifier.padding(horizontal = 4.dp), verticalAlignment = Alignment.CenterVertically) {
        if (message.isEdited && !message.isDeleted) {
            Text(stringResource(R.string.ui_edited), color = contentColor.copy(alpha = 0.6f), style = MaterialTheme.typography.labelSmall)
            Spacer(Modifier.width(4.dp))
        }
        if (message.at > 0) Text(clockTime(message.at), color = contentColor.copy(alpha = 0.7f), style = MaterialTheme.typography.labelSmall)
        if (isMine) {
            Spacer(Modifier.width(3.dp))
            MessageStatusIcon(message.status, message.isPending)
        }
    }
}

@Composable
fun MessageStatusIcon(status: MessageStatus, pending: Boolean, modifier: Modifier = Modifier) {
    val effective = if (pending && status != MessageStatus.Failed) MessageStatus.Sending else status
    val (icon, tint, label) = when (effective) {
        MessageStatus.Sending -> Triple(AbIcons.Schedule, Color.White.copy(alpha = 0.7f), R.string.ui_chat_sending)
        MessageStatus.Scheduled -> Triple(AbIcons.Schedule, AbColors.Gold, R.string.ui_chat_sending)
        MessageStatus.Sent -> Triple(AbIcons.Check, Color.White.copy(alpha = 0.75f), R.string.ui_chat_sent)
        MessageStatus.Delivered -> Triple(AbIcons.DoneAll, Color.White.copy(alpha = 0.75f), R.string.ui_chat_delivered)
        MessageStatus.Read -> Triple(AbIcons.DoneAll, AbColors.Cyan, R.string.ui_chat_seen)
        MessageStatus.Failed -> Triple(AbIcons.Error, AbColors.Rose, R.string.ui_chat_failed)
    }
    AbIcon(icon, stringResource(label), tint = tint, size = 15.dp, modifier = modifier)
}

@Composable
private fun ReactionChips(summary: Map<String, Int>, mine: String?, onClick: (String) -> Unit, modifier: Modifier) {
    Row(modifier, horizontalArrangement = Arrangement.spacedBy(4.dp)) {
        summary.entries.sortedByDescending { it.value }.take(5).forEach { (key, count) ->
            val style = reactionStyle(key)
            Row(
                Modifier
                    .clip(RoundedCornerShape(50))
                    .background(if (mine == key) style.color.copy(alpha = 0.3f) else AbColors.Charcoal4)
                    .clickable { onClick(key) }
                    .padding(horizontal = 7.dp, vertical = 3.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                AbIcon(style.icon, stringResource(style.label), tint = style.color, size = 14.dp)
                if (count > 1) {
                    Spacer(Modifier.width(3.dp))
                    Text(count.toString(), color = AbColors.TextPrimary, style = MaterialTheme.typography.labelSmall)
                }
            }
        }
    }
}
