package com.animeblack.core.ui

import androidx.compose.material3.LocalTextStyle
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.LinkAnnotation
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.TextLinkStyles
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.text.withLink
import com.animeblack.core.common.util.Validators
import com.animeblack.core.designsystem.theme.AbColors

/**
 * Text with clickable @mentions, #hashtags and URLs (bidi-safe: rendered with the platform's
 * Unicode bidi algorithm so mixed Arabic/English content lays out correctly).
 */
@Composable
fun LinkifiedText(
    text: String,
    modifier: Modifier = Modifier,
    style: TextStyle = LocalTextStyle.current,
    color: Color = Color.Unspecified,
    maxLines: Int = Int.MAX_VALUE,
    onMention: (String) -> Unit = {},
    onHashtag: (String) -> Unit = {},
    onUrl: (String) -> Unit = {},
) {
    val annotated = remember(text) {
        data class Token(val start: Int, val end: Int, val kind: Int, val value: String)
        val tokens = mutableListOf<Token>()
        Validators.urlRegex().findAll(text).forEach { tokens += Token(it.range.first, it.range.last + 1, 0, it.value) }
        Validators.mentionRegex().findAll(text).forEach { m -> if (tokens.none { m.range.first in it.start until it.end }) tokens += Token(m.range.first, m.range.last + 1, 1, m.groupValues[1]) }
        Validators.hashtagRegex().findAll(text).forEach { m -> if (tokens.none { m.range.first in it.start until it.end }) tokens += Token(m.range.first, m.range.last + 1, 2, m.groupValues[1]) }
        tokens.sortBy { it.start }
        buildAnnotatedString {
            var cursor = 0
            for (t in tokens) {
                if (t.start < cursor) continue
                append(text.substring(cursor, t.start))
                val linkStyle = TextLinkStyles(SpanStyle(color = if (t.kind == 0) AbColors.Cyan else AbColors.Violet, fontWeight = FontWeight.SemiBold))
                val link = LinkAnnotation.Clickable(tag = "${t.kind}:${t.value}", styles = linkStyle) {
                    when (t.kind) {
                        0 -> onUrl(t.value)
                        1 -> onMention(t.value)
                        else -> onHashtag(t.value)
                    }
                }
                withLink(link) { append(text.substring(t.start, t.end)) }
                cursor = t.end
            }
            if (cursor < text.length) append(text.substring(cursor))
        }
    }
    Text(annotated, modifier = modifier, style = style, color = color, maxLines = maxLines, overflow = TextOverflow.Ellipsis)
}
