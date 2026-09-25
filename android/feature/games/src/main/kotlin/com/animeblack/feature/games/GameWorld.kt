package com.animeblack.feature.games

import kotlin.random.Random

/** Character catalogue shared with the web game (`S.game.characters`). */
data class GameCharacter(
    val id: String,
    val nameAr: String,
    val nameEn: String,
    val rarity: String,
    val color: Long,
    val unlockCoins: Long = 0,
    val unlockGems: Long = 0,
    val speed: Int,
    val attack: Int,
)

val GAME_CHARACTERS = listOf(
    GameCharacter("c_ren", "رين — ظل النينجا", "Shadow Ninja Ren", "Common", 0xFF00A3FF, speed = 110, attack = 120),
    GameCharacter("c_kaito", "كايتو — سيف اللهب", "Flame Swordsman Kaito", "Rare", 0xFFEF4444, unlockCoins = 2_500, speed = 105, attack = 165),
    GameCharacter("c_luna", "لونا — فالكيري الفراغ", "Void Valkyrie Luna", "Epic", 0xFF8B5CF6, unlockGems = 150, speed = 125, attack = 220),
    GameCharacter("c_ryu", "ريو — راهب الرعد", "Thunder Monk Ryu", "Epic", 0xFFEAB308, unlockGems = 250, speed = 130, attack = 250),
    GameCharacter("c_akira", "أكيرا — إمبراطورة التنين", "Dragon Empress Akira", "Legendary", 0xFFEC4899, unlockGems = 500, speed = 145, attack = 340),
    GameCharacter("c_gojo", "ساكورا — المشعوذة الملعونة", "Cursed Sorceress Sakura", "Mythic", 0xFF10B981, unlockGems = 1_200, speed = 165, attack = 480),
)

fun characterById(id: String): GameCharacter = GAME_CHARACTERS.firstOrNull { it.id == id } ?: GAME_CHARACTERS.first()

/** Web formula: upgrade cost = level × 350 gold. */
fun upgradeCost(level: Int): Long = level.coerceAtLeast(1) * 350L

enum class EntityKind { Obstacle, Enemy, Coin }

data class Entity(val kind: EntityKind, var x: Float, val y: Float, val w: Float, val h: Float, var alive: Boolean = true)

/**
 * Deterministic endless-runner simulation in world units (1 unit = 1 dp-ish, ground at y = 0,
 * up is positive). Rendering and input live in the screen; this class is pure and unit tested.
 */
class GameWorld(private val random: Random = Random.Default, private val speedBonus: Float = 1f) {
    var playerY = 0f
        private set
    private var velocityY = 0f
    private var jumpsUsed = 0
    var attackTimer = 0f
        private set
    var distance = 0f
        private set
    var kills = 0
        private set
    var coins = 0
        private set
    var elapsed = 0f
        private set
    var over = false
        private set
    val entities = ArrayList<Entity>()
    private var spawnTimer = 0.8f

    val speed: Float get() = (BASE_SPEED + elapsed * ACCELERATION) * speedBonus
    val score: Long get() = distance.toLong() / 2 + kills * 50L + coins * 10L
    val onGround: Boolean get() = playerY <= 0f

    fun jump() {
        if (over) return
        if (onGround || jumpsUsed < MAX_JUMPS) {
            velocityY = JUMP_VELOCITY
            jumpsUsed = if (onGround) 1 else jumpsUsed + 1
        }
    }

    fun attack() {
        if (!over && attackTimer <= 0f) attackTimer = ATTACK_DURATION
    }

    fun step(dtRaw: Float) {
        if (over) return
        val dt = dtRaw.coerceIn(0f, 0.05f)
        elapsed += dt
        distance += speed * dt / 10f
        if (attackTimer > 0f) attackTimer -= dt

        velocityY -= GRAVITY * dt
        playerY += velocityY * dt
        if (playerY <= 0f) {
            playerY = 0f
            velocityY = 0f
            jumpsUsed = 0
        }

        val dx = speed * dt
        entities.forEach { it.x -= dx }
        entities.removeAll { it.x + it.w < -40f || !it.alive }

        spawnTimer -= dt
        if (spawnTimer <= 0f) {
            spawn()
            spawnTimer = (1.25f - elapsed * 0.01f).coerceAtLeast(0.55f) + random.nextFloat() * 0.6f
        }
        collide()
    }

    private fun spawn() {
        val x = SPAWN_X
        when (random.nextInt(10)) {
            in 0..4 -> entities += Entity(EntityKind.Obstacle, x, 0f, 26f, 30f + random.nextInt(3) * 12f)
            in 5..7 -> entities += Entity(EntityKind.Enemy, x, 40f + random.nextInt(3) * 30f, 30f, 30f)
            else -> repeat(3) { i -> entities += Entity(EntityKind.Coin, x + i * 34f, 60f + random.nextInt(2) * 40f, 18f, 18f) }
        }
    }

    private fun collide() {
        val px = PLAYER_X
        val pw = PLAYER_SIZE
        val ph = PLAYER_SIZE
        for (e in entities) {
            if (!e.alive) continue
            val overlapX = px < e.x + e.w && px + pw > e.x
            val overlapY = playerY < e.y + e.h && playerY + ph > e.y
            val inReach = e.x in px..(px + pw + ATTACK_REACH) && overlapY
            when (e.kind) {
                EntityKind.Coin -> if (overlapX && overlapY) {
                    e.alive = false
                    coins++
                }
                EntityKind.Enemy -> when {
                    attackTimer > 0f && (inReach || (overlapX && overlapY)) -> {
                        e.alive = false
                        kills++
                    }
                    overlapX && overlapY -> over = true
                }
                EntityKind.Obstacle -> if (overlapX && overlapY) over = true
            }
        }
    }

    companion object {
        const val BASE_SPEED = 260f
        const val ACCELERATION = 4f
        const val GRAVITY = 1_500f
        const val JUMP_VELOCITY = 560f
        const val MAX_JUMPS = 2
        const val ATTACK_DURATION = 0.35f
        const val ATTACK_REACH = 60f
        const val PLAYER_X = 60f
        const val PLAYER_SIZE = 34f
        const val SPAWN_X = 900f
    }
}
