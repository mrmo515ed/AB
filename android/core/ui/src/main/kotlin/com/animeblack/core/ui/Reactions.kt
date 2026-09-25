package com.animeblack.core.ui

import androidx.annotation.DrawableRes
import androidx.annotation.StringRes
import androidx.compose.ui.graphics.Color
import com.animeblack.core.designsystem.icon.AbIcons
import com.animeblack.core.model.Reaction

data class ReactionStyle(@DrawableRes val icon: Int, val color: Color, @StringRes val label: Int)

/** Visual mapping for the shared reaction keys (colours match the web `REACTS` table). */
fun reactionStyle(key: String?): ReactionStyle = when (Reaction.fromKey(key)) {
    Reaction.Like -> ReactionStyle(AbIcons.ThumbUpFilled, Color(0xFF5B8CFF), R.string.ui_reaction_like)
    Reaction.Love -> ReactionStyle(AbIcons.FavoriteFilled, Color(0xFFFF5C8A), R.string.ui_reaction_love)
    Reaction.Laugh, Reaction.Rofl -> ReactionStyle(AbIcons.SentimentVerySatisfied, Color(0xFFFFC24A), R.string.ui_reaction_laugh)
    Reaction.Wow, Reaction.Surprise, Reaction.Shock, Reaction.Mind -> ReactionStyle(AbIcons.Celebration, Color(0xFFA78BFA), R.string.ui_reaction_wow)
    Reaction.Sad, Reaction.Cry, Reaction.Broken, Reaction.Plead -> ReactionStyle(AbIcons.SentimentDissatisfied, Color(0xFF60A5FA), R.string.ui_reaction_sad)
    Reaction.Angry -> ReactionStyle(AbIcons.MoodBad, Color(0xFFF87171), R.string.ui_reaction_angry)
    Reaction.Fire, Reaction.Hundred, Reaction.Cold -> ReactionStyle(AbIcons.LocalFireDepartment, Color(0xFFFB923C), R.string.ui_reaction_fire)
    Reaction.Clap -> ReactionStyle(AbIcons.EmojiEvents, Color(0xFF2DD4BF), R.string.ui_reaction_clap)
    Reaction.Think -> ReactionStyle(AbIcons.Psychology, Color(0xFF94A3B8), R.string.ui_react)
    null -> ReactionStyle(AbIcons.FavoriteFilled, Color(0xFFFF5C8A), R.string.ui_like)
}
