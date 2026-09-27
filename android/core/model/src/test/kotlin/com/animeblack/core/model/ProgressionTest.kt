package com.animeblack.core.model

import com.google.common.truth.Truth.assertThat
import org.junit.Test

class ProgressionTest {
    @Test
    fun levelBadgeUsesExactMappingThenNearestLowerTier() {
        val c = LevelBadgeCatalog()
        assertThat(c.badgeFor(1)?.second?.id).isEqualTo("lbadge_rookie")
        assertThat(c.badgeFor(7)?.second?.id).isEqualTo("lbadge_flame")
        assertThat(c.badgeFor(10)?.second?.id).isEqualTo("lbadge_shadow")
        assertThat(c.badgeFor(99)?.first).isEqualTo(50)
        assertThat(LevelBadgeCatalog(mappings = mapOf(5 to "lbadge_flame")).badgeFor(3)).isNull()
    }

    @Test
    fun mappingsToUnknownBadgesAreSkipped() {
        val c = LevelBadgeCatalog(mappings = mapOf(1 to "missing", 5 to "lbadge_flame"))
        assertThat(c.badgeFor(3)).isNull()
        assertThat(c.badgeFor(7)?.second?.id).isEqualTo("lbadge_flame")
        assertThat(c.road().map { it.first }).containsExactly(5)
    }

    @Test
    fun roadIsSortedAndDefaultsMatchTheWeb() {
        assertThat(LevelBadgeCatalog().road().map { it.first }).containsExactly(1, 5, 10, 20, 35, 50).inOrder()
        assertThat(DEFAULT_LEVEL_BADGES.all { it.image.startsWith("data:image/svg+xml") && it.nameEn != null }).isTrue()
    }

    @Test
    fun rankTiersFollowTheWebTable() {
        assertThat(rankFor(1).nameEn).isEqualTo("Beginner")
        assertThat(rankFor(30).nameEn).isEqualTo("Warrior")
        assertThat(rankFor(0)).isEqualTo(RANK_TIERS.first())
        assertThat(nextRank(10)?.level).isEqualTo(25)
        assertThat(nextRank(100)).isNull()
        assertThat(achievementBadge("badge_rookie")?.nameEn).isEqualTo("Rookie")
        assertThat(achievementBadge("nope")).isNull()
    }
}
