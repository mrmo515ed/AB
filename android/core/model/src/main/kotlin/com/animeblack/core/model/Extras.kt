package com.animeblack.core.model

/** Anime / manga entry from AniList (primary) or Jikan (fallback) — same providers as server.js. */
data class AnimeItem(
    val id: String,
    val title: String,
    val titleNative: String = "",
    val coverUrl: String = "",
    val bannerUrl: String = "",
    val score: Double? = null,
    val episodes: Int? = null,
    val chapters: Int? = null,
    val status: String = "",
    val format: String = "",
    val season: String = "",
    val year: Int? = null,
    val genres: List<String> = emptyList(),
    val studios: List<String> = emptyList(),
    val description: String = "",
    val siteUrl: String = "",
    val characters: List<AnimeCharacter> = emptyList(),
    val nextEpisode: Int? = null,
    val nextAiringAt: Long? = null,
    /** anilist | jikan */
    val source: String = "anilist",
    /** ANIME | MANGA */
    val mediaType: String = "ANIME",
)

data class AnimeCharacter(val id: String, val name: String, val imageUrl: String = "", val role: String = "")

/** Result of the Gemini search agent (server-side `/api/gemini/search-agent`). */
data class AgentAnswer(
    val answer: String,
    val sources: List<AgentSource> = emptyList(),
    val mode: String = "general",
)

data class AgentSource(val title: String, val url: String)

/** Wallet summary shown in the economy screen (authoritative values from `users/{uid}`). */
data class Wallet(
    val coins: Long = 0,
    val stars: Long = 0,
    val gems: Long = 0,
    val xp: Long = 0,
    val xpNext: Long = 100,
    val level: Int = 1,
    val dailyStreak: Int = 0,
    val lastDailyClaim: Long = 0,
) {
    fun canClaimDaily(now: Long): Boolean = now - lastDailyClaim >= DAILY_COOLDOWN_MS
    fun nextClaimAt(): Long = lastDailyClaim + DAILY_COOLDOWN_MS

    companion object {
        /** Must match the 20h cooldown enforced by the `claimDailyReward` Cloud Function. */
        const val DAILY_COOLDOWN_MS = 20 * 60 * 60 * 1000L
    }
}

data class DailyRewardResult(val coins: Long, val gems: Long, val rewardCoins: Long, val rewardGems: Long, val streak: Int)

/** `economy_transactions/{id}` (read-only for the client, written by Cloud Functions). */
data class EconomyTransaction(
    val id: String,
    val type: String,
    val currency: String,
    val amount: Long,
    val fromUid: String = "",
    val toUid: String = "",
    val reason: String = "",
    val at: Long = 0,
)

/** `game_profiles/{uid}` — progression for the Anime Black runner game. */
data class GameProfile(
    val uid: String,
    val energy: Int = 50,
    val maxEnergy: Int = 50,
    val lastEnergyUpdate: Long = 0,
    val level: Int = 1,
    val xp: Long = 0,
    val xpNext: Long = 1000,
    val gold: Long = 0,
    val gems: Long = 0,
    val shards: Long = 0,
    val highScore: Long = 0,
    val bestDistance: Long = 0,
    val totalKills: Long = 0,
    val gamesPlayed: Int = 0,
    val totalWins: Int = 0,
    val selectedCharacter: String = "jinwoo",
    val characters: List<GameCharacterState> = emptyList(),
    val dailyDay: Int = 0,
    val lastDailyAt: Long = 0,
    val displayName: String = "",
    val avatar: String = "",
    val updatedAt: Long = 0,
) {
    /** Energy after passive regeneration (1 point every 8 minutes, as on the web). */
    fun currentEnergy(now: Long): Int {
        if (energy >= maxEnergy) return energy
        val gained = ((now - lastEnergyUpdate) / ENERGY_REGEN_MS).toInt().coerceAtLeast(0)
        return (energy + gained).coerceAtMost(maxEnergy)
    }

    companion object {
        const val ENERGY_REGEN_MS = 8 * 60 * 1000L
        const val RUN_ENERGY_COST = 5
    }
}

data class GameCharacterState(val id: String, val level: Int = 1, val stars: Int = 1, val transformationTier: Int = 0, val unlocked: Boolean = false)

data class GameRunResult(val score: Long, val distance: Long, val kills: Long, val coinsCollected: Long, val durationMs: Long)

/** Saved local account for quick account switching (no credentials are stored). */
data class SavedAccount(
    val uid: String,
    val name: String,
    val email: String,
    val avatar: String,
    /** password | google.com */
    val provider: String,
    val lastUsedAt: Long,
)
