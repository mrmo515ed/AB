package com.animeblack.core.ui.chat

import androidx.annotation.DrawableRes
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.animeblack.core.designsystem.component.AbIcon
import com.animeblack.core.designsystem.icon.AbIcons
import com.animeblack.core.designsystem.theme.AbColors
import com.animeblack.core.model.ChatMessage
import com.animeblack.core.model.Reaction
import com.animeblack.core.ui.R
import com.animeblack.core.ui.reactionStyle

/**
 * Long-press menu for a message: quick reactions plus contextual actions. Actions passed as null
 * are hidden (e.g. edit only for your own text messages, delete-for-everyone only for the sender
 * or a room admin).
 */
@Composable
fun MessageActionsSheet(
    message: ChatMessage,
    myReaction: String?,
    onDismiss: () -> Unit,
    onReact: ((String?) -> Unit)?,
    onReply: (() -> Unit)?,
    onCopy: (() -> Unit)?,
    onEdit: (() -> Unit)?,
    onDeleteForMe: (() -> Unit)?,
    onDeleteForEveryone: (() -> Unit)?,
    onReport: (() -> Unit)?,
    onRetry: (() -> Unit)?,
) {
    ModalBottomSheet(onDismissRequest = onDismiss, containerColor = AbColors.Charcoal2) {
        Column(Modifier.fillMaxWidth().navigationBarsPadding().padding(bottom = 12.dp)) {
            if (onReact != null && !message.isDeleted) {
                Row(
                    Modifier.fillMaxWidth().padding(horizontal = 12.dp, vertical = 4.dp),
                    horizontalArrangement = Arrangement.SpaceEvenly,
                ) {
                    Reaction.entries.filter { it.inPicker }.forEach { reaction ->
                        val style = reactionStyle(reaction.key)
                        val selected = myReaction == reaction.key
                        Box(
                            Modifier
                                .size(42.dp)
                                .clip(CircleShape)
                                .background(if (selected) style.color.copy(alpha = 0.25f) else Color.Transparent)
                                .clickable {
                                    onReact(if (selected) null else reaction.key)
                                    onDismiss()
                                },
                            contentAlignment = Alignment.Center,
                        ) {
                            AbIcon(style.icon, stringResource(style.label), tint = style.color, size = 26.dp)
                        }
                    }
                }
                HorizontalDivider(color = AbColors.Line2, modifier = Modifier.padding(vertical = 6.dp))
            }
            onRetry?.let { ActionRow(AbIcons.Refresh, stringResource(R.string.ui_retry), AbColors.Cyan, it, onDismiss) }
            onReply?.let { ActionRow(AbIcons.Reply, stringResource(R.string.ui_chat_reply), AbColors.TextPrimary, it, onDismiss) }
            onCopy?.let { ActionRow(AbIcons.ContentCopy, stringResource(R.string.ui_chat_copy), AbColors.TextPrimary, it, onDismiss) }
            onEdit?.let { ActionRow(AbIcons.Edit, stringResource(R.string.ui_edit), AbColors.TextPrimary, it, onDismiss) }
            onDeleteForMe?.let { ActionRow(AbIcons.Delete, stringResource(R.string.ui_chat_delete_for_me), AbColors.TextPrimary, it, onDismiss) }
            onDeleteForEveryone?.let { ActionRow(AbIcons.DeleteForever, stringResource(R.string.ui_chat_delete_for_all), AbColors.Rose, it, onDismiss) }
            onReport?.let { ActionRow(AbIcons.Flag, stringResource(R.string.ui_report), AbColors.Orange, it, onDismiss) }
        }
    }
}

@Composable
private fun ActionRow(@DrawableRes icon: Int, label: String, tint: Color, onClick: () -> Unit, onDismiss: () -> Unit) {
    Row(
        Modifier
            .fillMaxWidth()
            .clickable {
                onDismiss()
                onClick()
            }
            .padding(horizontal = 20.dp, vertical = 14.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        AbIcon(icon, null, tint = tint, size = 22.dp)
        Spacer(Modifier.width(16.dp))
        Text(label, color = tint, style = MaterialTheme.typography.bodyLarge)
    }
}
