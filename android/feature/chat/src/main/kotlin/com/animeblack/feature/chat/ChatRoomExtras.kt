package com.animeblack.feature.chat

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.animeblack.core.designsystem.component.AbIcon
import com.animeblack.core.designsystem.component.Avatar
import com.animeblack.core.designsystem.component.EmptyState
import com.animeblack.core.designsystem.icon.AbIcons
import com.animeblack.core.designsystem.theme.AbColors
import com.animeblack.core.model.ChatMessage
import com.animeblack.core.ui.clockTime
import com.animeblack.core.ui.relativeTime
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

/** Forward picker (web `fwdSheet`): pick a conversation to receive a copy of the message. */
@Composable
fun ForwardSheet(
    targets: List<ConversationItem>,
    onDismiss: () -> Unit,
    onPick: (ConversationItem) -> Unit,
) {
    ModalBottomSheet(onDismissRequest = onDismiss, containerColor = AbColors.Charcoal2) {
        Column(Modifier.fillMaxWidth().navigationBarsPadding().padding(bottom = 12.dp)) {
            Text(
                stringResource(R.string.chat_forward_title),
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.padding(horizontal = 20.dp, vertical = 8.dp),
            )
            if (targets.isEmpty()) {
                EmptyState(title = stringResource(R.string.chat_forward_no_chats), icon = AbIcons.ChatBubble)
            } else {
                LazyColumn(Modifier.height(380.dp)) {
                    items(targets, key = { it.conversation.id }) { item ->
                        Row(
                            Modifier.fillMaxWidth().clickable { onPick(item) }.padding(horizontal = 20.dp, vertical = 10.dp),
                            verticalAlignment = Alignment.CenterVertically,
                        ) {
                            Avatar(item.partner?.avatar, item.partner?.displayName.orEmpty(), size = 40.dp)
                            Spacer(Modifier.width(12.dp))
                            Text(
                                item.partner?.displayName.orEmpty(),
                                style = MaterialTheme.typography.bodyLarge,
                                maxLines = 1,
                                overflow = TextOverflow.Ellipsis,
                                modifier = Modifier.weight(1f),
                            )
                            AbIcon(AbIcons.Forward, null, tint = AbColors.Cyan, size = 20.dp)
                        }
                    }
                }
            }
        }
    }
}

/** Message details dialog (web `msgInfo` sheet). */
@Composable
fun MessageInfoDialog(
    message: ChatMessage,
    myUid: String,
    partnerName: String,
    onDismiss: () -> Unit,
) {
    val typeLabel = when (message.type) {
        ChatMessage.TYPE_TEXT -> "نص"
        ChatMessage.TYPE_STICKER -> "ملصق"
        ChatMessage.TYPE_IMAGE -> "صورة"
        ChatMessage.TYPE_VIDEO -> "فيديو"
        ChatMessage.TYPE_VOICE -> "صوت"
        ChatMessage.TYPE_FILE -> "ملف"
        ChatMessage.TYPE_GIF -> "GIF"
        else -> message.type
    }
    val statusLabel = when {
        message.isMine(myUid) -> when {
            message.isPending -> "قيد الإرسال (لا اتصال)"
            message.status.code >= 4 -> "مقروءة"
            message.status.code == 3 -> "وصلت"
            else -> "أُرسلت"
        }
        else -> "مستلمة"
    }
    val sizeKb = (message.text.length + message.attachments.sumOf { it.name.length }) / 1024.0
    val format = remember { SimpleDateFormat("yyyy/MM/dd HH:mm", Locale.getDefault()) }
    AlertDialog(
        onDismissRequest = onDismiss,
        containerColor = AbColors.Charcoal2,
        title = { Text(stringResource(R.string.chat_msg_info_title), fontWeight = FontWeight.Bold) },
        text = {
            Column {
                InfoRow("النوع", typeLabel)
                InfoRow("من", if (message.isMine(myUid)) "أنت" else partnerName.ifBlank { message.senderName })
                InfoRow("التوقيت", if (message.at > 0) format.format(Date(message.at)) else "—")
                InfoRow("الحالة", statusLabel)
                InfoRow("الحجم", "%.1f KB".format(sizeKb.coerceAtLeast(0.1)))
                if (message.isEdited) InfoRow("مُعدّلة", "نعم")
                if (message.forwarded) InfoRow("مُعاد توجيهها", "نعم")
                InfoRow("المعرّف", message.id)
            }
        },
        confirmButton = { TextButton(onClick = onDismiss) { Text(stringResource(com.animeblack.core.designsystem.R.string.ab_cancel), color = AbColors.Cyan) } },
    )
}

@Composable
private fun InfoRow(label: String, value: String) {
    Row(Modifier.fillMaxWidth().padding(vertical = 6.dp), verticalAlignment = Alignment.CenterVertically) {
        Text(label, color = AbColors.TextMuted, style = MaterialTheme.typography.bodySmall, modifier = Modifier.width(96.dp))
        Text(value, color = AbColors.TextPrimary, style = MaterialTheme.typography.bodyMedium, maxLines = 2, overflow = TextOverflow.Ellipsis)
    }
}

/** Conversation statistics dialog (web `chatStats`). */
@Composable
fun ChatStatsDialog(
    partnerName: String,
    totalMessages: Int,
    myMessages: Int,
    mediaCount: Int,
    starredCount: Int,
    pinnedCount: Int,
    firstAt: Long,
    onDismiss: () -> Unit,
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        containerColor = AbColors.Charcoal2,
        title = { Text(stringResource(R.string.chat_stats_title), fontWeight = FontWeight.Bold) },
        text = {
            Column {
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    StatCard(stringResource(R.string.chat_stats_title), totalMessages.toString(), AbColors.Cyan, Modifier.weight(1f))
                    StatCard("رسائلي", myMessages.toString(), AbColors.Violet, Modifier.weight(1f))
                }
                Spacer(Modifier.height(8.dp))
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    StatCard("الوسائط", mediaCount.toString(), AbColors.Pink, Modifier.weight(1f))
                    StatCard("المميزة", starredCount.toString(), AbColors.Gold, Modifier.weight(1f))
                }
                Spacer(Modifier.height(8.dp))
                InfoRow("الرسائل المثبتة", pinnedCount.toString())
                InfoRow("بداية المحادثة", if (firstAt > 0) SimpleDateFormat("yyyy/MM/dd", Locale.getDefault()).format(Date(firstAt)) else "—")
            }
        },
        confirmButton = { TextButton(onClick = onDismiss) { Text(stringResource(com.animeblack.core.designsystem.R.string.ab_cancel), color = AbColors.Cyan) } },
    )
}

@Composable
private fun StatCard(label: String, value: String, tint: Color, modifier: Modifier) {
    Column(
        modifier.clip(RoundedCornerShape(14.dp)).background(tint.copy(alpha = 0.12f)).padding(12.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Text(value, color = tint, style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold)
        Text(label, color = AbColors.TextSecondary, style = MaterialTheme.typography.labelSmall)
    }
}

/** Starred messages browser (web `starredMsgs` sheet). */
@Composable
fun StarredMessagesSheet(
    messages: List<ChatMessage>,
    myUid: String,
    onDismiss: () -> Unit,
    onJump: (String) -> Unit,
) {
    ModalBottomSheet(onDismissRequest = onDismiss, containerColor = AbColors.Charcoal2) {
        Column(Modifier.fillMaxWidth().navigationBarsPadding().padding(bottom = 12.dp)) {
            Text(
                stringResource(R.string.chat_starred_title),
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.padding(horizontal = 20.dp, vertical = 8.dp),
            )
            if (messages.isEmpty()) {
                EmptyState(title = stringResource(R.string.chat_starred_empty), icon = AbIcons.Star)
            } else {
                LazyColumn(Modifier.height(420.dp)) {
                    items(messages, key = { it.id }) { m ->
                        Row(
                            Modifier
                                .fillMaxWidth()
                                .clickable {
                                    onJump(m.id)
                                    onDismiss()
                                }
                                .padding(horizontal = 20.dp, vertical = 10.dp),
                            verticalAlignment = Alignment.CenterVertically,
                        ) {
                            AbIcon(AbIcons.StarFilled, null, tint = AbColors.Gold, size = 18.dp)
                            Spacer(Modifier.width(12.dp))
                            Column(Modifier.weight(1f)) {
                                Text(
                                    m.text.ifBlank { m.previewText().ifBlank { "وسائط" } },
                                    color = AbColors.TextPrimary,
                                    style = MaterialTheme.typography.bodyMedium,
                                    maxLines = 2,
                                    overflow = TextOverflow.Ellipsis,
                                )
                                Text(
                                    (if (m.isMine(myUid)) "أنت" else m.senderName) + " · " + if (m.at > 0) relativeTime(m.at) else clockTime(m.at),
                                    color = AbColors.TextMuted,
                                    style = MaterialTheme.typography.labelSmall,
                                )
                            }
                        }
                        HorizontalDivider(color = AbColors.Line2, modifier = Modifier.padding(horizontal = 20.dp))
                    }
                }
            }
        }
    }
}

/** The full conversation options menu (web `chatRoomMenu`). */
@Composable
fun ChatMenuSheet(
    partnerName: String,
    partnerAvatar: String?,
    vanishHours: Int,
    starredCount: Int,
    onDismiss: () -> Unit,
    onProfile: () -> Unit,
    onVoiceCall: () -> Unit,
    onVideoCall: () -> Unit,
    onOpenSettings: () -> Unit,
    onSharedMedia: () -> Unit,
    onStarred: () -> Unit,
    onStats: () -> Unit,
    onCycleVanish: () -> Unit,
    onSelectMode: () -> Unit,
    onDeleteBoth: () -> Unit,
) {
    ModalBottomSheet(onDismissRequest = onDismiss, containerColor = AbColors.Charcoal2) {
        Column(Modifier.fillMaxWidth().navigationBarsPadding().padding(bottom = 12.dp)) {
            Row(Modifier.padding(horizontal = 20.dp, vertical = 8.dp), verticalAlignment = Alignment.CenterVertically) {
                AbIcon(AbIcons.MoreVert, null, tint = AbColors.Cyan, size = 20.dp)
                Spacer(Modifier.width(10.dp))
                Text("خيارات المحادثة", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
            }
            MenuRow(leading = { Avatar(partnerAvatar, partnerName, size = 24.dp) }, stringResource(R.string.chat_menu_profile), AbColors.TextPrimary, onProfile, onDismiss)
            MenuRow(AbIcons.Mic, stringResource(R.string.chat_menu_voice_call), AbColors.Emerald, onVoiceCall, onDismiss)
            MenuRow(AbIcons.Videocam, stringResource(R.string.chat_menu_video_call), AbColors.Cyan, onVideoCall, onDismiss)
            MenuRow(AbIcons.Settings, stringResource(R.string.chat_menu_settings), AbColors.TextPrimary, onOpenSettings, onDismiss)
            MenuRow(AbIcons.Image, stringResource(R.string.chat_menu_media), AbColors.TextPrimary, onSharedMedia, onDismiss)
            MenuRow(AbIcons.Star, stringResource(R.string.chat_menu_starred) + " ($starredCount)", AbColors.Gold, onStarred, onDismiss)
            MenuRow(AbIcons.BarChart, stringResource(R.string.chat_menu_stats), AbColors.Cyan, onStats, onDismiss)
            val vanishLabel = when (vanishHours) {
                0 -> "معطلة"
                24 -> "٢٤ ساعة"
                else -> "٣ أيام"
            }
            MenuRow(AbIcons.Timer, stringResource(R.string.chat_menu_vanish) + ": $vanishLabel", AbColors.Emerald, onCycleVanish, onDismiss)
            MenuRow(AbIcons.CheckCircle, stringResource(R.string.chat_menu_select), AbColors.TextPrimary, onSelectMode, onDismiss)
            MenuRow(AbIcons.Delete, stringResource(R.string.chat_menu_delete_both), AbColors.Rose, onDeleteBoth, onDismiss)
        }
    }
}

@Composable
private fun MenuRow(leading: @Composable () -> Unit, label: String, tint: Color, onClick: () -> Unit, onDismiss: () -> Unit) {
    Row(
        Modifier.fillMaxWidth().clickable {
            onDismiss()
            onClick()
        }.padding(horizontal = 20.dp, vertical = 13.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Box(Modifier.size(24.dp), contentAlignment = Alignment.Center) { leading() }
        Spacer(Modifier.width(16.dp))
        Text(label, color = tint, style = MaterialTheme.typography.bodyLarge)
    }
}

@Composable
private fun MenuRow(iconRes: Int, label: String, tint: Color, onClick: () -> Unit, onDismiss: () -> Unit) {
    MenuRow(leading = { AbIcon(iconRes, null, tint = tint, size = 22.dp) }, label = label, tint = tint, onClick = onClick, onDismiss = onDismiss)
}
