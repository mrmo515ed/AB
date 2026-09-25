package com.animeblack.feature.games

import com.google.common.truth.Truth.assertThat
import kotlin.random.Random
import org.junit.Test

class GameWorldTest {
    @Test
    fun jumpLeavesTheGroundAndLandsAgain() {
        val world = GameWorld(Random(1))
        world.jump()
        world.step(0.05f)
        assertThat(world.playerY).isGreaterThan(0f)
        repeat(200) { world.step(0.016f) }
        assertThat(world.onGround).isTrue()
    }

    @Test
    fun hittingAnObstacleEndsTheRun() {
        val world = GameWorld(Random(1))
        world.entities += Entity(EntityKind.Obstacle, GameWorld.PLAYER_X, 0f, 26f, 40f)
        world.step(0.001f)
        assertThat(world.over).isTrue()
        val distance = world.distance
        world.step(0.5f)
        assertThat(world.distance).isEqualTo(distance)
    }

    @Test
    fun strikingKillsEnemiesInReachAndCoinsAreCollected() {
        val world = GameWorld(Random(1))
        world.entities += Entity(EntityKind.Enemy, GameWorld.PLAYER_X + 40f, 0f, 30f, 30f)
        world.entities += Entity(EntityKind.Coin, GameWorld.PLAYER_X, 10f, 18f, 18f)
        world.attack()
        world.step(0.001f)
        assertThat(world.over).isFalse()
        assertThat(world.kills).isEqualTo(1)
        assertThat(world.coins).isEqualTo(1)
        assertThat(world.score).isEqualTo(world.distance.toLong() / 2 + 50L + 10L)
    }

    @Test
    fun catalogueMatchesTheWeb() {
        assertThat(GAME_CHARACTERS.first().id).isEqualTo("c_ren")
        assertThat(characterById("c_kaito").unlockCoins).isEqualTo(2_500L)
        assertThat(characterById("c_gojo").unlockGems).isEqualTo(1_200L)
        assertThat(characterById("unknown").id).isEqualTo("c_ren")
        assertThat(upgradeCost(3)).isEqualTo(1_050L)
    }
}
