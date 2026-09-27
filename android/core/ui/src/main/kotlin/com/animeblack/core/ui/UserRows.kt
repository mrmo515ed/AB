package com.animeblack.core.ui

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import com.animeblack.core.designsystem.component.Avatar
import com.animeblack.core.designsystem.component.VerifiedBadge
import com.animeblack.core.designsystem.component.AbIcon
import com.animeblack.core.designsystem.icon.AbIcons
import com.animeblack.core.designsystem.theme.AbColors
import com.animeblack.core.designsystem.theme.AbTheme
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.draw.clip
import androidx.compose.foundation.shape.RoundedCornerShape
import com.animeblack.core.model.Comment
import com.animeblack.core.model.User

/** Name + verified seal, used everywhere a user is shown. */
@Composable
fun UserName(user: User, modifier: Modifier = Modifier, style: androidx.compose.ui.text.TextStyle = MaterialTheme.typography.titleSmall) {
    Row(modifier, verticalAlignment = Alignment.CenterVertically) {
        Text(user.displayName, style = style, maxLines = 1, overflow = TextOverflow.Ellipsis, modifier = Modifier.weight(1f, fill = false))
        if (user.showsVerifiedBadge) {
            Spacer(Modifier.width(4.dp))
            VerifiedBadge(gold = user.isGoldVerified, size = 15.dp)
        }
    }
}

@Composable
fun UserRow(
    user: User,
    modifier: Modifier = Modifier,
    subtitle: String? = null,
    avatarSize: Dp = 44.dp,
    online: Boolean = false,
    onClick: (() -> Unit)? = null,
    trailing: @Composable () -> Unit = {},
) {
    Row(
        modifier = modifier
            .fillMaxWidth()
            .then(if (onClick != null) Modifier.clickable(onClick = onClick) else Modifier)
            .padding(horizontal = 16.dp, vertical = 10.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Avatar(url = user.avatar, name = user.displayName, size = avatarSize, online = online)
        Spacer(Modifier.width(12.dp))
        Column(Modifier.weight(1f)) {
            UserName(user)
            Text(subtitle ?: user.handle, style = MaterialTheme.typography.bodySmall, color = AbTheme.colors.textMuted, maxLines = 1, overflow = TextOverflow.Ellipsis)
        }
        trailing()
    }
}

@Composable
fun CommentItem(
    comment: Comment,
    modifier: Modifier = Modifier,
    onAuthor: (String) -> Unit = {},
    onLongPress: (() -> Unit)? = null,
    onMention: (String) -> Unit = {},
    onHashtag: (String) -> Unit = {},
    liked: Boolean = false,
    onLike: (() -> Unit)? = null,
    onReply: (() -> Unit)? = null,
) {
    Row(
        modifier = modifier
            .fillMaxWidth()
            .then(if (onLongPress != null) Modifier.clickable(onClick = onLongPress) else Modifier)
            .padding(horizontal = 16.dp, vertical = 8.dp),
    ) {
        Avatar(url = comment.user.avatar, name = comment.user.name, size = 34.dp, onClick = { onAuthor(comment.userId) })
        Spacer(Modifier.width(10.dp))
        Column(Modifier.weight(1f)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(comment.user.name.ifBlank { comment.user.username }, style = MaterialTheme.typography.labelLarge)
                if (comment.user.isVerified) {
                    Spacer(Modifier.width(3.dp))
                    VerifiedBadge(size = 13.dp)
                }
                Spacer(Modifier.width(6.dp))
                Text(relativeTime(comment.createdAt), style = MaterialTheme.typography.labelSmall, color = AbTheme.colors.textMuted)
            }
            LinkifiedText(comment.text, style = MaterialTheme.typography.bodyMedium, onMention = onMention, onHashtag = onHashtag)
            if (onLike != null || onReply != null) {
                Row(Modifier.padding(top = 4.dp), verticalAlignment = Alignment.CenterVertically) {
                    if (onLike != null) {
                        Row(
                            Modifier.clip(RoundedCornerShape(50)).clickable(onClick = onLike).padding(horizontal = 6.dp, vertical = 2.dp),
                            verticalAlignment = Alignment.CenterVertically,
                        ) {
                            AbIcon(
                                if (liked) AbIcons.FavoriteFilled else AbIcons.Favorite,
                                stringResource(R.string.ui_like),
                                tint = if (liked) AbColors.Rose else AbTheme.colors.textMuted,
                                size = 16.dp,
                            )
                            if (comment.likes > 0) {
                                Spacer(Modifier.width(4.dp))
                                Text(compactCount(comment.likes), style = MaterialTheme.typography.labelSmall, color = AbTheme.colors.textMuted)
                            }
                        }
                    }
                    if (onReply != null) {
                        Spacer(Modifier.width(8.dp))
                        Text(
                            stringResource(R.string.ui_chat_reply),
                            style = MaterialTheme.typography.labelMedium,
                            color = AbTheme.colors.textMuted,
                            modifier = Modifier.clip(RoundedCornerShape(50)).clickable(onClick = onReply).padding(horizontal = 6.dp, vertical = 2.dp),
                        )
                    }
                }
            }
        }
    }
}
