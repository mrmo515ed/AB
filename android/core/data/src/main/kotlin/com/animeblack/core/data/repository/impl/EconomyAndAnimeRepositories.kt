package com.animeblack.core.data.repository.impl

import com.animeblack.core.common.result.AppError
import com.animeblack.core.common.result.AppResult
import com.animeblack.core.common.result.runCatchingApp
import com.animeblack.core.data.firebase.AppErrorException
import com.animeblack.core.data.firebase.Collections
import com.animeblack.core.data.firebase.FirebaseErrorMapper
import com.animeblack.core.data.firebase.anyToLong
import com.animeblack.core.data.firebase.asFlow
import com.animeblack.core.data.firebase.requireUid
import com.animeblack.core.data.firebase.str
import com.animeblack.core.data.firebase.toStringKeyed
import com.animeblack.core.data.mapper.toTransaction
import com.animeblack.core.data.remote.AgentApi
import com.animeblack.core.data.remote.AnimeApi
import com.animeblack.core.data.repository.AnimeRepository
import com.animeblack.core.data.repository.EconomyRepository
import com.animeblack.core.data.repository.UserRepository
import com.animeblack.core.model.AgentAnswer
import com.animeblack.core.model.AnimeItem
import com.animeblack.core.model.DailyRewardResult
import com.animeblack.core.model.EconomyTransaction
import com.animeblack.core.model.Wallet
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FieldValue
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.SetOptions
import com.google.firebase.functions.FirebaseFunctions
import java.util.UUID
import javax.inject.Inject
import javax.inject.Singleton
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.tasks.await

/**
 * Economy is server-authoritative: balances are read from `users/{uid}` (protected by rules) and
 * every change goes through the existing Cloud Functions with idempotency keys.
 */
@Singleton
class FunctionsEconomyRepository @Inject constructor(
    private val auth: FirebaseAuth,
    private val firestore: FirebaseFirestore,
    private val functions: FirebaseFunctions,
    private val users: UserRepository,
    private val errorMapper: FirebaseErrorMapper,
) : EconomyRepository {

    override fun observeWallet(): Flow<Wallet> = users.observeMe().map { u ->
        if (u == null) Wallet() else Wallet(u.coins, u.stars, u.gems, u.xp, u.xpNext, u.level, u.dailyStreak, u.lastDailyClaim)
    }

    override fun observeTransactions(): Flow<List<EconomyTransaction>> {
        val uid = auth.currentUser?.uid ?: return flowOf(emptyList())
        val tx = firestore.collection(Collections.ECONOMY_TRANSACTIONS)
        val mine = tx.whereEqualTo("uid", uid).limit(50).asFlow().map { s -> s.documents.mapNotNull { d -> d.data?.toTransaction(d.id) } }.catch { emit(emptyList()) }
        val sent = tx.whereEqualTo("fromUid", uid).limit(50).asFlow().map { s -> s.documents.mapNotNull { d -> d.data?.toTransaction(d.id) } }.catch { emit(emptyList()) }
        val received = tx.whereEqualTo("toUid", uid).limit(50).asFlow().map { s -> s.documents.mapNotNull { d -> d.data?.toTransaction(d.id) } }.catch { emit(emptyList()) }
        return combine(mine, sent, received) { a, b, c -> (a + b + c).distinctBy { it.id }.sortedByDescending { it.at } }
    }

    override suspend fun claimDailyReward(): AppResult<DailyRewardResult> = runCatchingApp(errorMapper) {
        auth.requireUid()
        val result = functions.getHttpsCallable("claimDailyReward").call(emptyMap<String, Any>()).await()
        val data = (result.getData() as? Map<*, *>)?.toStringKeyed() ?: throw AppErrorException(AppError.Server("empty-response"))
        DailyRewardResult(
            coins = anyToLong(data["coins"]) ?: 0,
            gems = anyToLong(data["gems"]) ?: 0,
            rewardCoins = anyToLong(data["rewardCoins"]) ?: 0,
            rewardGems = anyToLong(data["rewardGems"]) ?: 0,
            streak = (anyToLong(data["streak"]) ?: 0).toInt(),
        )
    }

    override suspend fun transfer(toUid: String, currency: String, amount: Long, note: String): AppResult<Unit> = runCatchingApp(errorMapper) {
        val me = auth.requireUid()
        if (toUid == me) throw AppErrorException(AppError.Validation("transfer", "self"))
        if (amount <= 0 || amount > 100_000) throw AppErrorException(AppError.Validation("amount", "invalid"))
        if (currency !in setOf("coins", "stars")) throw AppErrorException(AppError.Validation("currency", "invalid"))
        functions.getHttpsCallable("economyTransfer").call(
            mapOf(
                "op" to "transfer",
                "currency" to currency,
                "amount" to amount,
                "toUid" to toUid,
                "note" to note.take(140),
                "idempotencyKey" to UUID.randomUUID().toString(),
            ),
        ).await()
        Unit
    }
}

@Singleton
class DefaultAnimeRepository @Inject constructor(
    private val api: AnimeApi,
    private val agent: AgentApi,
    private val auth: FirebaseAuth,
    private val firestore: FirebaseFirestore,
    private val users: UserRepository,
    private val errorMapper: FirebaseErrorMapper,
) : AnimeRepository {

    override val isAgentConfigured: Boolean get() = agent.isConfigured

    override suspend fun trending(page: Int): AppResult<List<AnimeItem>> = runCatchingApp(errorMapper) {
        try {
            api.aniListTrending(page).ifEmpty { api.jikanTop() }
        } catch (_: Exception) {
            api.jikanTop()
        }
    }

    override suspend fun seasonal(): AppResult<List<AnimeItem>> = runCatchingApp(errorMapper) {
        try {
            api.aniListSeasonal()
        } catch (_: Exception) {
            api.jikanTop()
        }
    }

    override suspend fun search(query: String, mediaType: String): AppResult<List<AnimeItem>> = runCatchingApp(errorMapper) {
        val q = query.trim()
        if (q.length < 2) return@runCatchingApp emptyList()
        try {
            api.aniListSearch(q, mediaType).ifEmpty { api.jikanSearch(q, mediaType) }
        } catch (_: Exception) {
            api.jikanSearch(q, mediaType)
        }
    }

    override suspend fun detail(id: String, mediaType: String): AppResult<AnimeItem> = runCatchingApp(errorMapper) {
        val item = try {
            api.aniListDetail(id, mediaType)
        } catch (_: Exception) {
            null
        } ?: api.jikanDetail(id, mediaType)
        item ?: throw AppErrorException(AppError.NotFound())
    }

    override suspend fun askAgent(prompt: String, mode: String, history: List<Pair<String, String>>): AppResult<AgentAnswer> =
        runCatchingApp(errorMapper) {
            if (prompt.isBlank()) throw AppErrorException(AppError.Validation("prompt", "empty"))
            agent.ask(prompt.trim().take(2_000), mode, history)
        }

    override fun observeFavorites(): Flow<List<String>> = users.observeUserState().map { it.favAnime }

    override suspend fun toggleFavorite(anime: AnimeItem): AppResult<Unit> = runCatchingApp(errorMapper) {
        val uid = auth.requireUid()
        val key = "${anime.source}:${anime.id}"
        val favorites = users.observeUserState().first().favAnime
        firestore.collection(Collections.USER_STATES).document(uid).set(
            mapOf("uid" to uid, "favAnime" to if (key in favorites) FieldValue.arrayRemove(key) else FieldValue.arrayUnion(key), "updatedAt" to System.currentTimeMillis()),
            SetOptions.merge(),
        )
        Unit
    }

    override suspend fun addToHistory(anime: AnimeItem): AppResult<Unit> = runCatchingApp(errorMapper) {
        val uid = auth.requireUid()
        val ref = firestore.collection(Collections.USER_STATES).document(uid)
        val entry = mapOf("id" to "${anime.source}:${anime.id}", "title" to anime.title, "cover" to anime.coverUrl, "at" to System.currentTimeMillis())
        firestore.runTransaction { tx ->
            val snap = tx.get(ref)
            val history = (snap.get("history") as? List<*>)?.mapNotNull { (it as? Map<*, *>)?.toStringKeyed() }.orEmpty()
            val updated = (listOf(entry) + history.filter { it.str("id") != entry["id"] }).take(100)
            tx.set(ref, mapOf("uid" to uid, "history" to updated, "updatedAt" to System.currentTimeMillis()), SetOptions.merge())
            null
        }.await()
        Unit
    }
}
