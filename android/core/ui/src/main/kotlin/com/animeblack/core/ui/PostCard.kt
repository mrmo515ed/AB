package com.animeblack.core.ui

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.animateColorAsState
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.combinedClickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.animeblack.core.designsystem.component.AbIcon
import com.animeblack.core.designsystem.component.AbIconButton
import com.animeblack.core.designsystem.component.Avatar
import com.animeblack.core.designsystem.component.AvatarRing
import com.animeblack.core.designsystem.component.GlassCard
import com.animeblack.core.designsystem.component.Pill
import com.animeblack.core.designsystem.component.VerifiedBadge
import com.animeblack.core.designsystem.icon.AbIcons
import com.animeblack.core.designsystem.theme.AbColors
import com.animeblack.core.designsystem.theme.AbTheme
import com.animeblack.core.model.MediaItem
import com.animeblack.core.model.Poll
import com.animeblack.core.model.Post
import com.animeblack.core.model.Reaction
import com.animeblack.core.model.User

/** Callbacks for a post card; all optional so the card can be reused read-only. */
data class PostActions(
    val onOpen: (Post) -> Unit = {},
    val onAuthor: (String) -> Unit = {},
    val onLike: (Post) -> Unit = {},
    val onReact: (Post, String) -> Unit = { _, _ -> },
    val onComment: (Post) -> Unit = {},
    val onShare: (Post) -> Unit = {},
    val onSave: (Post, Boolean) -> Unit = { _, _ -> },
    val onMenu: (Post) -> Unit = {},
    val onVote: (Post, String) -> Unit = { _, _ -> },
    val onMedia: (MediaItem) -> Unit = {},
    val onHashtag: (String) -> Unit = {},
    val onMention: (String) -> Unit = {},
    val onUrl: (String) -> Unit = {},
    val onRetry: (Post) -> Unit = {},
)

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun PostCard(
    post: Post,
    myUid: String,
    saved: Boolean,
    actions: PostActions,
    modifier: Modifier = Modifier,
    autoplayVideo: Boolean = false,
    showFullText: Boolean = false,
) {
    val liked = post.isLikedBy(myUid)
    val myReaction = post.reactionOf(myUid)
    var showReactions by remember { mutableStateOf(false) }
    var revealed by rememberSaveable(post.id) { mutableStateOf(!post.spoiler) }
    val failed = post.warningText == "__upload_failed__"

    GlassCard(
        modifier = modifier.fillMaxWidth(),
        borderColor = if (liked) AbColors.Rose.copy(alpha = 0.28f) else null,
        onClick = { actions.onOpen(post) },
    ) {
        // Header
        Row(verticalAlignment = Alignment.CenterVertically) {
            Avatar(
                url = post.author.avatar,
                name = post.author.name,
                size = 44.dp,
                ring = when {
                    post.author.role in User.ADMIN_ROLES -> AvatarRing.Gold
                    post.author.isVerified -> AvatarRing.StoryUnseen
                    else -> AvatarRing.Neon
                },
                onClick = { actions.onAuthor(post.authorId) },
            )
            Spacer(Modifier.width(10.dp))
            Column(Modifier.weight(1f)) {
                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                    Text(
                        post.author.name.ifBlank { post.author.username },
                        style = MaterialTheme.typography.titleSmall,
                        fontWeight = FontWeight.ExtraBold,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis,
                        modifier = Modifier.weight(1f, fill = false).clickable { actions.onAuthor(post.authorId) },
                    )
                    if (post.author.isVerified || post.author.role in User.ADMIN_ROLES) {
                        VerifiedBadge(gold = post.author.role in User.ADMIN_ROLES, size = 15.dp)
                    }
                    Pill(
                        text = "Lv.${post.author.level.coerceAtLeast(1)}",
                        color = AbColors.Gold,
                        textColor = AbColors.BrightGold,
                    )
                    if (post.author.role.isNotBlank() && post.author.role != User.ROLE_MEMBER) {
                        Pill(text = post.author.role, color = AbColors.Purple)
                    }
                }
                Row(verticalAlignment = Alignment.CenterVertically) {
                    val sub = buildString {
                        if (post.author.username.isNotBlank()) append("@").append(post.author.username).append(" · ")
                    }
                    Text(sub, style = MaterialTheme.typography.labelSmall, color = AbTheme.colors.textMuted)
                    Text(relativeTime(post.createdAt), style = MaterialTheme.typography.labelSmall, color = AbTheme.colors.textMuted)
                    if (post.isEdited) {
                        Text(" · " + stringResource(R.string.ui_edited), style = MaterialTheme.typography.labelSmall, color = AbTheme.colors.textMuted)
                    }
                }
            }
            if (post.category.isNotBlank() && post.category != "عام") {
                CategoryPill(post.category)
            }
            AbIconButton(AbIcons.MoreVert, stringResource(R.string.ui_more), onClick = { actions.onMenu(post) })
        }

        if (post.isPending || failed) {
            Spacer(Modifier.height(8.dp))
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.clip(RoundedCornerShape(10.dp))
                    .background(if (failed) AbColors.Rose.copy(alpha = 0.15f) else AbColors.Gold.copy(alpha = 0.12f))
                    .clickable(enabled = failed) { actions.onRetry(post) }
                    .padding(horizontal = 10.dp, vertical = 5.dp),
            ) {
                AbIcon(if (failed) AbIcons.Error else AbIcons.CloudUpload, null, tint = if (failed) AbColors.Rose else AbColors.Gold, size = 16.dp)
                Spacer(Modifier.width(6.dp))
                Text(
                    stringResource(if (failed) R.string.ui_upload_failed else R.string.ui_publishing),
                    style = MaterialTheme.typography.labelMedium,
                    color = if (failed) AbColors.Rose else AbColors.Gold,
                )
            }
        }

        // Body
        if (post.text.isNotBlank()) {
            Spacer(Modifier.height(10.dp))
            Box {
                LinkifiedText(
                    text = post.text,
                    style = MaterialTheme.typography.bodyLarge,
                    maxLines = if (showFullText) Int.MAX_VALUE else 8,
                    onMention = actions.onMention,
                    onHashtag = actions.onHashtag,
                    onUrl = actions.onUrl,
                    modifier = if (!revealed) Modifier.background(AbColors.Charcoal3) else Modifier,
                )
                if (!revealed) SpoilerCover { revealed = true }
            }
        }

        // Quoted Post (if any)
        post.quotedPost?.let { quoted ->
            if (quoted.text.isNotBlank() || quoted.authorName.isNotBlank()) {
                Spacer(Modifier.height(10.dp))
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(14.dp))
                        .background(AbColors.Ink.copy(alpha = 0.7f))
                        .border(1.dp, AbColors.Purple.copy(alpha = 0.35f), RoundedCornerShape(14.dp))
                        .padding(10.dp),
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        AbIcon(AbIcons.FormatQuote, null, tint = AbColors.Cyan, size = 14.dp)
                        Spacer(Modifier.width(4.dp))
                        Text(quoted.authorName, style = MaterialTheme.typography.labelMedium, fontWeight = FontWeight.Bold, color = AbColors.Cyan)
                    }
                    if (quoted.text.isNotBlank()) {
                        Spacer(Modifier.height(4.dp))
                        Text(quoted.text, style = MaterialTheme.typography.bodySmall, color = AbColors.TextSecondary, maxLines = 3, overflow = TextOverflow.Ellipsis)
                    }
                }
            }
        }

        val media = post.media
        if (media != null && media.items.isNotEmpty()) {
            Spacer(Modifier.height(10.dp))
            Box {
                MediaGrid(items = media.items, onOpen = actions.onMedia, autoplayVideo = autoplayVideo && revealed)
                if (!revealed) SpoilerCover { revealed = true }
            }
        }

        post.poll?.let { poll ->
            Spacer(Modifier.height(10.dp))
            PollView(poll = poll, myUid = myUid, onVote = { actions.onVote(post, it) })
        }

        if (post.tags.isNotEmpty()) {
            Spacer(Modifier.height(8.dp))
            FlowRow(horizontalArrangement = Arrangement.spacedBy(6.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                post.tags.take(6).forEach { tag ->
                    Text(
                        "#$tag",
                        color = AbColors.Cyan,
                        style = MaterialTheme.typography.labelMedium,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier
                            .clip(RoundedCornerShape(50))
                            .background(AbColors.Cyan.copy(alpha = 0.12f))
                            .border(0.75.dp, AbColors.Cyan.copy(alpha = 0.28f), RoundedCornerShape(50))
                            .clickable { actions.onHashtag(tag) }
                            .padding(horizontal = 9.dp, vertical = 3.dp),
                    )
                }
            }
        }

        // Quick Reaction Bar (vector icons, zero emojis)
        Spacer(Modifier.height(10.dp))
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(6.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            listOf("love", "fire", "laugh", "wow", "sad", "clap").forEach { key ->
                val style = reactionStyle(key)
                val selected = myReaction == key
                val count = post.reactionCounts[key] ?: 0
                val shape = RoundedCornerShape(50)
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier
                        .clip(shape)
                        .background(if (selected) style.color.copy(alpha = 0.22f) else AbColors.Ink.copy(alpha = 0.55f))
                        .border(1.dp, if (selected) style.color else Color(0x1AFFFFFF), shape)
                        .clickable { actions.onReact(post, key) }
                        .padding(horizontal = 8.dp, vertical = 4.dp),
                ) {
                    AbIcon(style.icon, null, tint = if (selected) style.color else style.color.copy(alpha = 0.85f), size = 15.dp)
                    if (count > 0 || selected) {
                        Spacer(Modifier.width(4.dp))
                        Text(
                            text = (if (selected && count == 0) 1 else count).toString(),
                            style = MaterialTheme.typography.labelSmall,
                            fontWeight = FontWeight.Bold,
                            color = if (selected) style.color else AbColors.TextSecondary,
                        )
                    }
                }
            }
        }

        // Counters
        val totalLikes = maxOf(post.likes, post.likedBy.size)
        if (totalLikes > 0 || post.totalComments > 0 || post.views > 0) {
            Spacer(Modifier.height(8.dp))
            Row(verticalAlignment = Alignment.CenterVertically) {
                post.reactionCounts.entries.filter { it.value > 0 }.sortedByDescending { it.value }.take(3).forEach { (key, _) ->
                    val style = reactionStyle(key)
                    AbIcon(style.icon, null, tint = style.color, size = 16.dp)
                }
                if (totalLikes > 0) {
                    Spacer(Modifier.width(4.dp))
                    Text(stringResource(R.string.ui_likes_count, compactCount(totalLikes)), style = MaterialTheme.typography.labelMedium, color = AbTheme.colors.textMuted)
                }
                Spacer(Modifier.weight(1f))
                if (post.totalComments > 0) {
                    Text(stringResource(R.string.ui_comments_count, compactCount(post.totalComments)), style = MaterialTheme.typography.labelMedium, color = AbTheme.colors.textMuted)
                }
                if (post.views > 0) {
                    Spacer(Modifier.width(8.dp))
                    AbIcon(AbIcons.Visibility, null, tint = AbTheme.colors.textMuted, size = 14.dp)
                    Spacer(Modifier.width(3.dp))
                    Text(compactCount(post.views), style = MaterialTheme.typography.labelSmall, color = AbTheme.colors.textMuted)
                }
            }
        }

        AnimatedVisibility(visible = showReactions) {
            ReactionPicker(
                selected = myReaction,
                onPick = { key ->
                    showReactions = false
                    actions.onReact(post, key)
                },
                modifier = Modifier.padding(top = 8.dp),
            )
        }

        // Actions
        Spacer(Modifier.height(6.dp))
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
            val style = reactionStyle(myReaction ?: "love")
            val likeColor by animateColorAsState(if (liked) style.color else AbTheme.colors.textMuted, label = "like")
            ActionChip(
                icon = if (liked) style.icon else AbIcons.Favorite,
                label = stringResource(if (liked) R.string.ui_liked else R.string.ui_like),
                tint = likeColor,
                onClick = { actions.onLike(post) },
                onLongClick = { showReactions = !showReactions },
            )
            ActionChip(AbIcons.ChatBubble, stringResource(R.string.ui_comment), AbTheme.colors.textMuted, onClick = { actions.onComment(post) })
            if (post.allowSharing) {
                ActionChip(AbIcons.Share, stringResource(R.string.ui_share), AbTheme.colors.textMuted, onClick = { actions.onShare(post) })
            }
            ActionChip(
                icon = if (saved) AbIcons.BookmarkFilled else AbIcons.Bookmark,
                label = stringResource(if (saved) R.string.ui_saved else R.string.ui_save),
                tint = if (saved) AbColors.Gold else AbTheme.colors.textMuted,
                onClick = { actions.onSave(post, !saved) },
            )
        }
    }
}

@Composable
private fun CategoryPill(category: String) {
    val (label, color) = when (category.lowercase()) {
        "anime", "أنمي" -> "أنمي" to AbColors.Cyan
        "manga", "مانجا" -> "مانجا" to AbColors.Purple
        "art", "فنون", "fanart" -> "فنون" to AbColors.Rose
        "memes", "meme", "ميمز" -> "ميمز" to AbColors.Gold
        "review", "مراجعة", "مراجعات" -> "مراجعة" to AbColors.Emerald
        "theory", "نظريات" -> "نظريات" to AbColors.Blue
        else -> category to AbColors.Purple
    }
    Pill(label, color = color)
}

@Composable
private fun SpoilerCover(onReveal: () -> Unit) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .height(120.dp)
            .clip(RoundedCornerShape(14.dp))
            .background(Color(0xF0101018))
            .border(1.dp, AbColors.Rose.copy(alpha = 0.4f), RoundedCornerShape(14.dp))
            .clickable(onClick = onReveal),
        contentAlignment = Alignment.Center,
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            AbIcon(AbIcons.VisibilityOff, null, tint = AbColors.Rose, size = 20.dp)
            Spacer(Modifier.width(8.dp))
            Text(stringResource(R.string.ui_spoiler), color = Color.White, style = MaterialTheme.typography.labelLarge)
        }
    }
}

@Composable
private fun ActionChip(icon: Int, label: String, tint: Color, onClick: () -> Unit, onLongClick: (() -> Unit)? = null) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        modifier = Modifier
            .clip(RoundedCornerShape(12.dp))
            .combinedClickable(onClick = onClick, onLongClick = onLongClick)
            .padding(horizontal = 10.dp, vertical = 8.dp),
    ) {
        AbIcon(icon, contentDescription = label, tint = tint, size = 20.dp)
        Spacer(Modifier.width(6.dp))
        Text(label, color = tint, style = MaterialTheme.typography.labelMedium)
    }
}

@Composable
fun ReactionPicker(selected: String?, onPick: (String) -> Unit, modifier: Modifier = Modifier) {
    Row(
        modifier = modifier
            .clip(RoundedCornerShape(50))
            .background(AbTheme.colors.surfaceHighest)
            .padding(horizontal = 8.dp, vertical = 6.dp),
        horizontalArrangement = Arrangement.spacedBy(4.dp),
    ) {
        Reaction.picker.forEach { r ->
            val style = reactionStyle(r.key)
            Box(
                modifier = Modifier
                    .size(38.dp)
                    .clip(CircleShape)
                    .background(if (selected == r.key) style.color.copy(alpha = 0.25f) else Color.Transparent)
                    .clickable { onPick(r.key) },
                contentAlignment = Alignment.Center,
            ) {
                AbIcon(style.icon, contentDescription = stringResource(style.label), tint = style.color, size = 24.dp)
            }
        }
    }
}

@Composable
fun PollView(poll: Poll, myUid: String, onVote: (String) -> Unit, modifier: Modifier = Modifier) {
    val voted = poll.votedOption(myUid)
    val total = poll.totalVotes.coerceAtLeast(1)
    Column(modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(8.dp)) {
        if (poll.question.isNotBlank()) Text(poll.question, style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.Bold)
        poll.options.forEach { option ->
            val fraction = option.votes.toFloat() / total
            Column(
                Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(12.dp))
                    .border(1.dp, if (voted == option.id) AbColors.Cyan else AbTheme.colors.glassBorder, RoundedCornerShape(12.dp))
                    .clickable(enabled = voted == null) { onVote(option.id) }
                    .padding(10.dp),
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(option.text, modifier = Modifier.weight(1f), style = MaterialTheme.typography.bodyMedium)
                    if (voted != null) Text("${(fraction * 100).toInt()}%", style = MaterialTheme.typography.labelMedium, color = AbColors.Cyan)
                }
                if (voted != null) {
                    Spacer(Modifier.height(6.dp))
                    LinearProgressIndicator(
                        progress = { fraction },
                        modifier = Modifier.fillMaxWidth().height(5.dp).clip(RoundedCornerShape(3.dp)),
                        color = if (voted == option.id) AbColors.Cyan else AbColors.Purple,
                        trackColor = AbTheme.colors.surfaceHighest,
                    )
                }
            }
        }
        Text(stringResource(R.string.ui_votes, poll.totalVotes), style = MaterialTheme.typography.labelSmall, color = AbTheme.colors.textMuted)
    }
}
