package com.animeblack.core.data.repository.impl

import android.net.Uri
import com.animeblack.core.common.dispatchers.ApplicationScope
import com.animeblack.core.common.result.AppError
import com.animeblack.core.common.result.AppResult
import com.animeblack.core.common.result.runCatchingApp
import com.animeblack.core.common.util.Validators
import com.animeblack.core.data.firebase.ActiveSessionHolder
import com.animeblack.core.data.firebase.AppErrorException
import com.animeblack.core.data.firebase.Collections
import com.animeblack.core.data.firebase.FirebaseErrorMapper
import com.animeblack.core.data.firebase.activeUid
import com.animeblack.core.data.firebase.asFlow
import com.animeblack.core.data.firebase.getFast
import com.animeblack.core.data.firebase.requireUid
import com.animeblack.core.data.mapper.toUser
import com.animeblack.core.data.mapper.toUserState
import com.animeblack.core.data.media.MediaPreparer
import com.animeblack.core.data.outbox.OutboxRepository
import com.animeblack.core.data.outbox.OutboxTypes
import com.animeblack.core.data.outbox.ProfileMediaPayload
import com.animeblack.core.data.outbox.UploadFile
import com.animeblack.core.data.repository.AuthRepository
import com.animeblack.core.data.repository.AuthState
import com.animeblack.core.data.repository.NotificationRepository
import com.animeblack.core.data.repository.ProfileUpdate
import com.animeblack.core.data.repository.UserRepository
import com.animeblack.core.model.LocalMedia
import com.animeblack.core.model.PrivacySettings
import com.animeblack.core.model.User
import com.animeblack.core.model.UserState
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.UserProfileChangeRequest
import com.google.firebase.firestore.FieldPath
import com.google.firebase.firestore.FieldValue
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.Query
import com.google.firebase.firestore.SetOptions
import java.util.concurrent.ConcurrentHashMap
import javax.inject.Inject
import javax.inject.Provider
import javax.inject.Singleton
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.flatMapLatest
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.shareIn

@Singleton
class FirestoreUserRepository @Inject constructor(
    private val auth: FirebaseAuth,
    private val firestore: FirebaseFirestore,
    private val authRepository: Provider<AuthRepository>,
    private val notifications: Provider<NotificationRepository>,
    private val outbox: OutboxRepository,
    private val preparer: MediaPreparer,
    private val errorMapper: FirebaseErrorMapper,
    @ApplicationScope private val scope: CoroutineScope,
) : UserRepository {

    private val users get() = firestore.collection(Collections.USERS)
    private val userFlows = ConcurrentHashMap<String, Flow<User?>>()
    private val userCache = ConcurrentHashMap<String, User>()

    private val uidFlow: Flow<String?> by lazy {
        authRepository.get().authState.map { (it as? AuthState.SignedIn)?.uid }.distinctUntilChanged()
    }

    override fun observeMe(): Flow<User?> = uidFlow.flatMapLatest { uid ->
        if (uid == null) {
            flowOf(null)
        } else {
            observeUser(uid).map { u -> u ?: fallbackUserFor(uid) }
        }
    }

    private fun fallbackUserFor(uid: String): User {
        userCache[uid]?.let { return it }
        val fb = auth.currentUser
        val name = fb?.displayName?.takeIf { it.isNotBlank() }
            ?: ActiveSessionHolder.fallbackName
            ?: "أوتاكو أنمي بلاك"
        val username = ActiveSessionHolder.fallbackUsername
            ?: Validators.defaultUsername(fb?.email, uid)
        return User(
            id = uid,
            name = name,
            username = username,
            email = fb?.email.orEmpty(),
            avatar = fb?.photoUrl?.toString() ?: FirebaseAuthRepository.DEFAULT_AVATAR,
            bio = "عضو في مجتمع أنمي بلاك",
            level = 1,
            xp = 0,
            xpNext = 100,
            coins = 150,
            stars = 10,
            reputation = 15,
            badges = listOf("badge_rookie"),
        ).also { userCache[uid] = it }
    }

    /** One shared listener per user id, kept alive 5 s after the last subscriber (no duplicates). */
    override fun observeUser(uid: String): Flow<User?> {
        if (uid.isBlank()) return flowOf(null)
        return userFlows.getOrPut(uid) {
            users.document(uid).asFlow()
                .map { snap ->
                    snap.data?.toUser(snap.id)?.also { userCache[uid] = it }
                        ?: if (uid == auth.activeUid()) fallbackUserFor(uid) else userCache[uid]
                }
                .catch { emit(if (uid == auth.activeUid()) fallbackUserFor(uid) else userCache[uid]) }
                .shareIn(scope, SharingStarted.WhileSubscribed(5_000), replay = 1)
        }
    }

    override fun observeUsers(uids: Collection<String>): Flow<Map<String, User>> {
        val ids = uids.filter { it.isNotBlank() }.distinct()
        if (ids.isEmpty()) return flowOf(emptyMap())
        val chunks = ids.chunked(30).map { chunk ->
            users.whereIn(FieldPath.documentId(), chunk).asFlow()
                .map { snap ->
                    snap.documents.mapNotNull { d ->
                        d.data?.toUser(d.id)?.also { userCache[d.id] = it }
                    }
                }
                .catch { emit(emptyList()) }
        }
        return combine(chunks) { lists -> lists.flatMap { it.toList() }.associateBy { it.id } }
    }

    override suspend fun getUser(uid: String): User? {
        if (uid.isBlank()) return null
        userCache[uid]?.let { return it }
        val snap = users.document(uid).getFast(timeoutMs = 1_800L, preferCache = true)
        val fromSnap = snap?.data?.toUser(snap.id)?.also { userCache[uid] = it }
        if (fromSnap != null) return fromSnap
        return if (uid == auth.activeUid()) fallbackUserFor(uid) else null
    }

    override suspend fun searchUsers(query: String, limit: Int): AppResult<List<User>> = runCatchingApp(errorMapper) {
        val q = query.trim().removePrefix("@")
        if (q.length < 2) return@runCatchingApp emptyList()
        val lower = q.lowercase()
        val byUsername = users.orderBy("username").startAt(lower).endAt(lower + "\uf8ff").limit(limit.toLong()).getFast()
        val byName = users.orderBy("name").startAt(q).endAt(q + "\uf8ff").limit(limit.toLong()).getFast()
        (byUsername?.documents.orEmpty() + byName?.documents.orEmpty())
            .distinctBy { it.id }
            .mapNotNull { d -> d.data?.toUser(d.id)?.also { userCache[d.id] = it } }
            .take(limit)
    }

    override fun observeSuggestedUsers(limit: Int): Flow<List<User>> =
        combine(
            users.orderBy("joined", Query.Direction.DESCENDING).limit((limit + 20).toLong()).asFlow()
                .map { snap -> snap.documents.mapNotNull { d -> d.data?.toUser(d.id)?.also { userCache[d.id] = it } } }
                .catch { emit(emptyList()) },
            observeUserState(),
            uidFlow,
        ) { list, state, me ->
            list.filter { it.id != me && it.id !in state.following && it.id !in state.blocked }.take(limit)
        }

    override fun observeFollowList(uid: String, followers: Boolean): Flow<List<User>> =
        observeUser(uid).flatMapLatest { user ->
            val ids = if (followers) user?.followersList.orEmpty() else user?.followingList.orEmpty()
            val unique = ids.distinct().take(300)
            observeUsers(unique).map { map -> unique.mapNotNull { map[it] ?: userCache[it] } }
        }

    override suspend fun isUsernameAvailable(username: String): AppResult<Boolean> = runCatchingApp(errorMapper) {
        val normalized = Validators.normalizeUsername(username)
        if (!Validators.isValidUsername(normalized)) throw AppErrorException(AppError.Validation("username", "invalid"))
        val me = auth.activeUid()
        val snap = users.whereEqualTo("username", normalized).limit(2).getFast(timeoutMs = 1_800L)
        snap?.documents?.none { it.id != me } ?: true
    }

    override suspend fun updateProfile(update: ProfileUpdate): AppResult<Unit> = runCatchingApp(errorMapper) {
        val uid = auth.requireUid()
        val fields = mutableMapOf<String, Any?>()
        update.name?.let { fields["name"] = it.trim().take(50) }
        update.username?.let {
            val normalized = Validators.normalizeUsername(it)
            if (!Validators.isValidUsername(normalized)) throw AppErrorException(AppError.Validation("username", "invalid"))
            val available = isUsernameAvailable(normalized)
            if (available is AppResult.Success && !available.data) throw AppErrorException(AppError.Validation("username", "taken"))
            fields["username"] = normalized
        }
        update.bio?.let { fields["bio"] = it.trim().take(300) }
        update.location?.let { fields["loc"] = it.trim().take(80) }
        update.website?.let { fields["site"] = it.trim().take(200) }
        update.favAnimeName?.let { fields["favAnimeName"] = it.trim().take(80) }
        update.favStudio?.let { fields["favStudio"] = it.trim().take(80) }
        update.profileCompleted?.let { fields["profileCompleted"] = it }
        if (fields.isNotEmpty()) {
            fields["updatedAt"] = System.currentTimeMillis()
            users.document(uid).set(fields, SetOptions.merge())
            userCache.compute(uid) { _, prev ->
                val base = prev ?: fallbackUserFor(uid)
                base.copy(
                    name = update.name?.trim()?.take(50) ?: base.name,
                    username = update.username?.let(Validators::normalizeUsername) ?: base.username,
                    bio = update.bio?.trim()?.take(300) ?: base.bio,
                    location = update.location?.trim()?.take(80) ?: base.location,
                    website = update.website?.trim()?.take(200) ?: base.website,
                    favAnimeName = update.favAnimeName?.trim()?.take(80) ?: base.favAnimeName,
                    favStudio = update.favStudio?.trim()?.take(80) ?: base.favStudio,
                )
            }
            update.name?.let { name ->
                auth.currentUser?.updateProfile(UserProfileChangeRequest.Builder().setDisplayName(name.trim()).build())
            }
        }
        update.avatarUri?.let { enqueueProfileMedia(uid, "avatar", it) }
        update.coverUri?.let { enqueueProfileMedia(uid, "cover", it) }
    }

    private suspend fun enqueueProfileMedia(uid: String, field: String, uri: String) {
        val prepared = preparer.prepare(LocalMedia(uri = uri, type = "image", mimeType = "image/jpeg"))
        val media = (prepared as? AppResult.Success)?.data ?: throw AppErrorException(prepared.errorOrNull() ?: AppError.Unknown())
        val file = UploadFile(
            localUri = media.uri,
            mimeType = media.mimeType,
            type = "image",
            name = media.name,
            size = media.sizeBytes,
            storagePath = "users/$uid/${field}_${System.currentTimeMillis()}.jpg",
        )
        outbox.enqueue(OutboxTypes.PROFILE_MEDIA, "profile:$field:${Uri.parse(media.uri).lastPathSegment}", ProfileMediaPayload(field, file), ProfileMediaPayload.serializer())
    }

    override suspend fun updatePrivacy(privacy: PrivacySettings, requiresChatRequest: Boolean): AppResult<Unit> = runCatchingApp(errorMapper) {
        val uid = auth.requireUid()
        users.document(uid).set(
            mapOf(
                "privacy" to mapOf(
                    "whoSeesCoins" to privacy.whoSeesCoins,
                    "whoSeesLevel" to privacy.whoSeesLevel,
                    "whoSeesActivity" to privacy.whoSeesActivity,
                    "privateAccount" to privacy.privateAccount,
                    "showOnline" to privacy.showOnline,
                    "allowDM" to privacy.allowDM,
                ),
                "reqGate" to requiresChatRequest,
                "updatedAt" to System.currentTimeMillis(),
            ),
            SetOptions.merge(),
        )
        Unit
    }

    override suspend fun follow(uid: String): AppResult<Unit> = runCatchingApp(errorMapper) {
        val me = auth.requireUid()
        if (uid == me) throw AppErrorException(AppError.Validation("follow", "self"))
        val state = observeUserState().first()
        if (uid in state.following) return@runCatchingApp
        val now = System.currentTimeMillis()
        val batch = firestore.batch()
        batch.set(users.document(me), mapOf("following_list" to FieldValue.arrayUnion(uid), "following" to FieldValue.increment(1), "updatedAt" to now), SetOptions.merge())
        batch.set(users.document(uid), mapOf("followers_list" to FieldValue.arrayUnion(me), "followers" to FieldValue.increment(1), "updatedAt" to now), SetOptions.merge())
        batch.set(firestore.collection(Collections.USER_STATES).document(me), mapOf("uid" to me, "following" to FieldValue.arrayUnion(uid), "following_list" to FieldValue.arrayUnion(uid), "updatedAt" to now), SetOptions.merge())
        batch.commit()
        val myName = getUser(me)?.displayName.orEmpty()
        notifications.get().notifyUser(uid, "follow", "متابع جديد", "$myName بدأ بمتابعتك الآن")
    }

    override suspend fun unfollow(uid: String): AppResult<Unit> = runCatchingApp(errorMapper) {
        val me = auth.requireUid()
        val now = System.currentTimeMillis()
        val batch = firestore.batch()
        batch.set(users.document(me), mapOf("following_list" to FieldValue.arrayRemove(uid), "following" to FieldValue.increment(-1), "updatedAt" to now), SetOptions.merge())
        batch.set(users.document(uid), mapOf("followers_list" to FieldValue.arrayRemove(me), "followers" to FieldValue.increment(-1), "updatedAt" to now), SetOptions.merge())
        batch.set(firestore.collection(Collections.USER_STATES).document(me), mapOf("following" to FieldValue.arrayRemove(uid), "following_list" to FieldValue.arrayRemove(uid), "updatedAt" to now), SetOptions.merge())
        batch.commit()
        Unit
    }

    private val stateFlow: Flow<UserState> by lazy {
        uidFlow.flatMapLatest { uid ->
            if (uid == null) {
                flowOf(UserState())
            } else {
                combine(
                    firestore.collection(Collections.USER_STATES).document(uid).asFlow()
                        .map { it.data?.toUserState() ?: UserState() }
                        .catch { emit(UserState()) },
                    observeUser(uid),
                ) { state, user ->
                    state.copy(following = (state.following + user?.followingList.orEmpty()).distinct())
                }
            }
        }.shareIn(scope, SharingStarted.WhileSubscribed(5_000), replay = 1)
    }

    override fun observeUserState(): Flow<UserState> = stateFlow

    override suspend fun block(uid: String): AppResult<Unit> = runCatchingApp(errorMapper) {
        val me = auth.requireUid()
        firestore.collection(Collections.USER_STATES).document(me).set(
            mapOf("uid" to me, "blocked" to FieldValue.arrayUnion(uid), "blocked_list" to FieldValue.arrayUnion(uid), "updatedAt" to System.currentTimeMillis()),
            SetOptions.merge(),
        )
        unfollow(uid)
        Unit
    }

    override suspend fun unblock(uid: String): AppResult<Unit> = runCatchingApp(errorMapper) {
        val me = auth.requireUid()
        firestore.collection(Collections.USER_STATES).document(me).set(
            mapOf("blocked" to FieldValue.arrayRemove(uid), "blocked_list" to FieldValue.arrayRemove(uid), "updatedAt" to System.currentTimeMillis()),
            SetOptions.merge(),
        )
        Unit
    }
}
