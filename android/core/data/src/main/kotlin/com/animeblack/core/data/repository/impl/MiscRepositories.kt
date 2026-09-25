package com.animeblack.core.data.repository.impl

import com.animeblack.core.common.network.NetworkMonitor
import com.animeblack.core.common.result.AppError
import com.animeblack.core.common.result.AppResult
import com.animeblack.core.common.result.runCatchingApp
import com.animeblack.core.common.util.Ids
import com.animeblack.core.data.firebase.AppErrorException
import com.animeblack.core.data.firebase.Collections
import com.animeblack.core.data.firebase.FirebaseErrorMapper
import com.animeblack.core.data.firebase.asFlow
import com.animeblack.core.data.firebase.requireUid
import com.animeblack.core.data.mapper.toAuditLog
import com.animeblack.core.data.mapper.toGameProfile
import com.animeblack.core.data.mapper.toReport
import com.animeblack.core.data.mapper.toThought
import com.animeblack.core.data.mapper.toUser
import com.animeblack.core.data.outbox.OutboxRepository
import com.animeblack.core.data.repository.AdminMetrics
import com.animeblack.core.data.repository.AdminRepository
import com.animeblack.core.data.repository.GameRepository
import com.animeblack.core.data.repository.LeaderboardEntry
import com.animeblack.core.data.repository.ReportRepository
import com.animeblack.core.data.repository.SyncRepository
import com.animeblack.core.data.repository.SyncStatus
import com.animeblack.core.data.repository.UserRepository
import com.animeblack.core.data.repository.WorkspaceRepository
import com.animeblack.core.database.PendingOperation
import com.animeblack.core.model.AuditLog
import com.animeblack.core.model.GameCharacterState
import com.animeblack.core.model.GameProfile
import com.animeblack.core.model.GameRunResult
import com.animeblack.core.model.Report
import com.animeblack.core.model.Thought
import com.animeblack.core.model.User
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.AggregateSource
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.MetadataChanges
import com.google.firebase.firestore.Query
import com.google.firebase.firestore.SetOptions
import javax.inject.Inject
import javax.inject.Singleton
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.tasks.await

// ============================================================================ Games
@Singleton
class FirestoreGameRepository @Inject constructor(
    private val auth: FirebaseAuth,
    private val firestore: FirebaseFirestore,
    private val users: UserRepository,
    private val errorMapper: FirebaseErrorMapper,
) : GameRepository {

    private val profiles get() = firestore.collection(Collections.GAME_PROFILES)

    override fun observeProfile(): Flow<GameProfile?> {
        val uid = auth.currentUser?.uid ?: return flowOf(null)
        return profiles.document(uid).asFlow().map { snap -> snap.data?.toGameProfile(uid) ?: GameProfile(uid = uid, lastEnergyUpdate = System.currentTimeMillis()) }
            .catch { emit(null) }
    }

    private suspend fun current(uid: String): GameProfile =
        profiles.document(uid).get().await().data?.toGameProfile(uid) ?: GameProfile(uid = uid, lastEnergyUpdate = System.currentTimeMillis())

    private suspend fun write(profile: GameProfile, characters: List<GameCharacterState> = profile.characters) {
        val me = users.getUser(profile.uid)
        profiles.document(profile.uid).set(
            mapOf(
                "profile" to mapOf(
                    "energy" to profile.energy,
                    "maxEnergy" to profile.maxEnergy,
                    "lastEnergyUpdate" to profile.lastEnergyUpdate,
                    "hunterLevel" to profile.level,
                    "hunterXp" to profile.xp,
                    "hunterXpNext" to profile.xpNext,
                    "coins" to profile.gold,
                    "gems" to profile.gems,
                    "shards" to profile.shards,
                    "highScore" to profile.highScore,
                    "bestDistance" to profile.bestDistance,
                    "totalKills" to profile.totalKills,
                    "totalMatches" to profile.gamesPlayed,
                    "totalWins" to profile.totalWins,
                    "equippedCharacterId" to profile.selectedCharacter,
                    "dailyDay" to profile.dailyDay,
                    "lastDailyAt" to profile.lastDailyAt,
                    "displayName" to (me?.displayName ?: profile.displayName),
                    "avatar" to (me?.avatar ?: profile.avatar),
                ),
                "characters" to characters.map { mapOf("id" to it.id, "level" to it.level, "stars" to it.stars, "transformationTier" to it.transformationTier, "unlocked" to it.unlocked) },
                "updatedAt" to System.currentTimeMillis(),
            ),
            SetOptions.merge(),
        ).await()
    }

    override suspend fun startRun(): AppResult<GameProfile> = runCatchingApp(errorMapper) {
        val uid = auth.requireUid()
        val now = System.currentTimeMillis()
        val p = current(uid)
        val energy = p.currentEnergy(now)
        if (energy < GameProfile.RUN_ENERGY_COST) throw AppErrorException(AppError.Validation("energy", "insufficient"))
        val updated = p.copy(energy = energy - GameProfile.RUN_ENERGY_COST, lastEnergyUpdate = now)
        write(updated)
        updated
    }

    override suspend fun submitRun(result: GameRunResult): AppResult<GameProfile> = runCatchingApp(errorMapper) {
        val uid = auth.requireUid()
        val p = current(uid)
        // Basic anti-cheat bounds (mirrors web validateGameMatch intent).
        val plausible = result.durationMs > 0 && result.score <= result.durationMs * 5 && result.kills <= result.durationMs / 250
        val score = if (plausible) result.score else 0
        var level = p.level
        var xp = p.xp + (result.distance * 0.1).toLong() + result.kills * 10 + 50
        var xpNext = p.xpNext
        while (xp >= xpNext) {
            xp -= xpNext
            level += 1
            xpNext = (xpNext * 1.5).toLong()
        }
        val updated = p.copy(
            level = level,
            xp = xp,
            xpNext = xpNext,
            gold = p.gold + if (plausible) result.coinsCollected else 0,
            highScore = maxOf(p.highScore, score),
            bestDistance = maxOf(p.bestDistance, if (plausible) result.distance else 0),
            totalKills = p.totalKills + if (plausible) result.kills else 0,
            gamesPlayed = p.gamesPlayed + 1,
        )
        write(updated)
        updated
    }

    override suspend fun unlockCharacter(characterId: String, cost: Long): AppResult<Unit> = runCatchingApp(errorMapper) {
        val uid = auth.requireUid()
        val p = current(uid)
        if (p.characters.any { it.id == characterId && it.unlocked }) return@runCatchingApp
        if (p.gold < cost) throw AppErrorException(AppError.Validation("gold", "insufficient"))
        val chars = p.characters.filterNot { it.id == characterId } + GameCharacterState(characterId, 1, 1, 0, true)
        write(p.copy(gold = p.gold - cost), chars)
    }

    override suspend fun upgradeCharacter(characterId: String, cost: Long): AppResult<Unit> = runCatchingApp(errorMapper) {
        val uid = auth.requireUid()
        val p = current(uid)
        val c = p.characters.firstOrNull { it.id == characterId && it.unlocked } ?: throw AppErrorException(AppError.Validation("character", "locked"))
        if (p.gold < cost) throw AppErrorException(AppError.Validation("gold", "insufficient"))
        val chars = p.characters.map { if (it.id == characterId) it.copy(level = c.level + 1) else it }
        write(p.copy(gold = p.gold - cost), chars)
    }

    override suspend fun selectCharacter(characterId: String): AppResult<Unit> = runCatchingApp(errorMapper) {
        val uid = auth.requireUid()
        val p = current(uid)
        write(p.copy(selectedCharacter = characterId))
    }

    override suspend fun claimDaily(): AppResult<Long> = runCatchingApp(errorMapper) {
        val uid = auth.requireUid()
        val now = System.currentTimeMillis()
        val p = current(uid)
        if (now - p.lastDailyAt < 20 * 60 * 60 * 1000L) throw AppErrorException(AppError.Validation("daily", "cooldown"))
        val day = (p.dailyDay % 7) + 1
        val reward = 100L * day
        write(p.copy(gold = p.gold + reward, dailyDay = day, lastDailyAt = now, energy = p.maxEnergy, lastEnergyUpdate = now))
        reward
    }

    override fun observeLeaderboard(): Flow<List<LeaderboardEntry>> =
        profiles.orderBy("profile.highScore", Query.Direction.DESCENDING).limit(50).asFlow()
            .map { snap ->
                snap.documents.mapNotNull { d ->
                    val p = d.data?.toGameProfile(d.id) ?: return@mapNotNull null
                    LeaderboardEntry(d.id, p.displayName, p.avatar, p.highScore, p.level)
                }.filter { it.score > 0 }
            }
            .catch { emit(emptyList()) }
}

// ============================================================================ Admin / moderation
@Singleton
class FirestoreAdminRepository @Inject constructor(
    private val auth: FirebaseAuth,
    private val firestore: FirebaseFirestore,
    private val errorMapper: FirebaseErrorMapper,
) : AdminRepository {

    private suspend fun audit(action: String, target: String, details: String) {
        val user = auth.currentUser ?: return
        val id = "log_${Ids.short()}"
        firestore.collection(Collections.AUDIT_LOGS).document(id).set(
            mapOf("id" to id, "action" to action, "actorUid" to user.uid, "actorEmail" to user.email.orEmpty(), "target" to target, "details" to details.take(500), "at" to System.currentTimeMillis(), "platform" to "android"),
        )
    }

    override fun observeReports(): Flow<List<Report>> =
        firestore.collection(Collections.REPORTS).limit(200).asFlow()
            .map { snap -> snap.documents.mapNotNull { d -> d.data?.toReport(d.id) }.sortedWith(compareBy<Report> { it.status != "pending" }.thenByDescending { it.at }) }

    override suspend fun resolveReport(report: Report, status: String, removeContent: Boolean): AppResult<Unit> = runCatchingApp(errorMapper) {
        val uid = auth.requireUid()
        if (removeContent && report.targetType == "post" && report.targetId.isNotBlank()) {
            firestore.collection(Collections.POSTS).document(report.targetId).delete().await()
        }
        firestore.collection(Collections.REPORTS).document(report.id).update(
            mapOf("status" to status, "resolvedBy" to uid, "resolvedAt" to System.currentTimeMillis(), "contentRemoved" to removeContent),
        ).await()
        audit("report.$status", report.id, "target=${report.targetType}:${report.targetId} removed=$removeContent")
    }

    override suspend fun sendBroadcast(title: String, message: String, type: String): AppResult<Unit> = runCatchingApp(errorMapper) {
        auth.requireUid()
        if (title.isBlank() || message.isBlank()) throw AppErrorException(AppError.Validation("broadcast", "empty"))
        val id = "bc_${Ids.short()}"
        firestore.collection(Collections.BROADCASTS).document(id).set(
            mapOf("id" to id, "title" to title.trim().take(120), "message" to message.trim().take(1_000), "type" to type, "at" to System.currentTimeMillis(), "by" to auth.currentUser?.email.orEmpty()),
        ).await()
        audit("broadcast.send", id, title)
    }

    override suspend fun setRole(uid: String, role: String): AppResult<Unit> = runCatchingApp(errorMapper) {
        firestore.collection(Collections.USERS).document(uid).update(mapOf("role" to role, "updatedAt" to System.currentTimeMillis())).await()
        audit("user.role", uid, role)
    }

    override suspend fun setVerified(uid: String, verified: Boolean): AppResult<Unit> = runCatchingApp(errorMapper) {
        firestore.collection(Collections.USERS).document(uid).update(
            mapOf("isVerified" to verified, "verified" to verified, "verifiedType" to if (verified) "official" else null, "updatedAt" to System.currentTimeMillis()),
        ).await()
        audit("user.verify", uid, verified.toString())
    }

    override suspend fun deletePost(postId: String): AppResult<Unit> = runCatchingApp(errorMapper) {
        firestore.collection(Collections.POSTS).document(postId).delete().await()
        audit("post.delete", postId, "")
    }

    override fun observeAuditLogs(): Flow<List<AuditLog>> =
        firestore.collection(Collections.AUDIT_LOGS).limit(200).asFlow()
            .map { snap -> snap.documents.mapNotNull { d -> d.data?.toAuditLog(d.id) }.sortedByDescending { it.at } }

    override suspend fun metrics(): AppResult<AdminMetrics> = runCatchingApp(errorMapper) {
        suspend fun count(q: Query): Long = q.count().get(AggregateSource.SERVER).await().count
        AdminMetrics(
            users = count(firestore.collection(Collections.USERS)),
            posts = count(firestore.collection(Collections.POSTS)),
            pendingReports = count(firestore.collection(Collections.REPORTS).whereEqualTo("status", "pending")),
            groups = count(firestore.collection(Collections.GROUPS)),
        )
    }

    override fun observeRecentUsers(): Flow<List<User>> =
        firestore.collection(Collections.USERS).orderBy("joined", Query.Direction.DESCENDING).limit(100).asFlow()
            .map { snap -> snap.documents.mapNotNull { d -> d.data?.toUser(d.id) } }
}

@Singleton
class FirestoreReportRepository @Inject constructor(
    private val auth: FirebaseAuth,
    private val firestore: FirebaseFirestore,
    private val users: UserRepository,
    private val errorMapper: FirebaseErrorMapper,
) : ReportRepository {
    override suspend fun report(targetType: String, targetId: String, reason: String, details: String): AppResult<Unit> = runCatchingApp(errorMapper) {
        val uid = auth.requireUid()
        val me = users.getUser(uid)
        val id = Ids.report()
        firestore.collection(Collections.REPORTS).document(id).set(
            mapOf(
                "id" to id,
                "reporterId" to uid,
                "reporterName" to me?.displayName.orEmpty(),
                "targetType" to targetType,
                "targetId" to targetId,
                "target" to mapOf("type" to targetType, "id" to targetId),
                "by" to mapOf("id" to uid, "name" to me?.displayName.orEmpty()),
                "reason" to reason,
                "details" to details.trim().take(1_000),
                "at" to System.currentTimeMillis(),
                "status" to "pending",
                "platform" to "android",
            ),
        )
        Unit
    }
}

// ============================================================================ Workspace
@Singleton
class FirestoreWorkspaceRepository @Inject constructor(
    private val auth: FirebaseAuth,
    private val firestore: FirebaseFirestore,
    private val errorMapper: FirebaseErrorMapper,
) : WorkspaceRepository {
    private fun thoughts(uid: String) = firestore.collection(Collections.WORKSPACES).document(uid).collection(Collections.THOUGHTS)

    override fun observeThoughts(): Flow<List<Thought>> {
        val uid = auth.currentUser?.uid ?: return flowOf(emptyList())
        return thoughts(uid).asFlow()
            .map { snap -> snap.documents.mapNotNull { d -> d.data?.toThought(d.id) }.sortedWith(compareByDescending<Thought> { it.pinned }.thenByDescending { maxOf(it.updatedAt, it.createdAt) }) }
    }

    override suspend fun save(thought: Thought): AppResult<Unit> = runCatchingApp(errorMapper) {
        val uid = auth.requireUid()
        val id = thought.id.ifBlank { "t_${Ids.short()}" }
        val now = System.currentTimeMillis()
        thoughts(uid).document(id).set(
            mapOf(
                "id" to id, "title" to thought.title.take(120), "text" to thought.text.take(20_000), "tags" to thought.tags,
                "pinned" to thought.pinned, "color" to thought.color,
                "createdAt" to thought.createdAt.takeIf { it > 0 }.let { it ?: now }, "updatedAt" to now,
            ),
            SetOptions.merge(),
        )
        Unit
    }

    override suspend fun delete(id: String): AppResult<Unit> = runCatchingApp(errorMapper) {
        val uid = auth.requireUid()
        thoughts(uid).document(id).delete()
        Unit
    }
}

// ============================================================================ Sync diagnostics
@Singleton
class DefaultSyncRepository @Inject constructor(
    private val firestore: FirebaseFirestore,
    private val networkMonitor: NetworkMonitor,
    private val outbox: OutboxRepository,
    private val errorMapper: FirebaseErrorMapper,
) : SyncRepository {

    @Volatile private var lastServerContact = 0L

    /** Canary listener on `test/connection` (same technique as the web RTSM): fromCache=false ⇒ backend reachable. */
    private val backend: Flow<Boolean> = callbackFlow {
        val reg = firestore.collection(Collections.TEST).document("connection")
            .addSnapshotListener(MetadataChanges.INCLUDE) { snap, err ->
                if (err != null) {
                    trySend(false)
                    return@addSnapshotListener
                }
                val reachable = snap != null && !snap.metadata.isFromCache
                if (reachable) lastServerContact = System.currentTimeMillis()
                trySend(reachable)
            }
        awaitClose { reg.remove() }
    }

    override val status: Flow<SyncStatus> = combine(networkMonitor.isOnline, backend, outbox.observe()) { online, reachable, ops ->
        SyncStatus(
            online = online,
            backendReachable = reachable,
            pendingOutbox = ops.count { it.state != PendingOperation.STATE_FAILED },
            failedOutbox = ops.count { it.state == PendingOperation.STATE_FAILED },
            lastServerContactAt = lastServerContact,
        )
    }

    override suspend fun retryFailed() = outbox.retryFailed()

    override suspend fun forceResync(): AppResult<Unit> = runCatchingApp(errorMapper) {
        firestore.disableNetwork().await()
        firestore.enableNetwork().await()
        outbox.schedule()
        Unit
    }
}
