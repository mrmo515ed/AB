package com.animeblack.core.data.repository.impl

import android.net.Uri
import com.animeblack.core.common.result.AppError
import com.animeblack.core.common.result.AppResult
import com.animeblack.core.common.result.runCatchingApp
import com.animeblack.core.common.util.Ids
import com.animeblack.core.common.util.Validators
import com.animeblack.core.data.firebase.AppErrorException
import com.animeblack.core.data.firebase.Collections
import com.animeblack.core.data.firebase.FirebaseErrorMapper
import com.animeblack.core.data.firebase.asFlow
import com.animeblack.core.data.firebase.requireUid
import com.animeblack.core.data.mapper.toMap
import com.animeblack.core.data.mapper.toReel
import com.animeblack.core.data.media.MediaPreparer
import com.animeblack.core.data.outbox.OutboxRepository
import com.animeblack.core.data.outbox.OutboxTypes
import com.animeblack.core.data.outbox.ReelPublishPayload
import com.animeblack.core.data.outbox.UploadFile
import com.animeblack.core.data.repository.ReelRepository
import com.animeblack.core.data.repository.UserRepository
import com.animeblack.core.model.Comment
import com.animeblack.core.model.LocalMedia
import com.animeblack.core.model.Reel
import com.animeblack.core.model.toSnapshot
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FieldValue
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.Query
import java.util.Collections as JCollections
import javax.inject.Inject
import javax.inject.Singleton
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.map

@Singleton
class FirestoreReelRepository @Inject constructor(
    private val auth: FirebaseAuth,
    private val firestore: FirebaseFirestore,
    private val users: UserRepository,
    private val outbox: OutboxRepository,
    private val preparer: MediaPreparer,
    private val errorMapper: FirebaseErrorMapper,
) : ReelRepository {

    private val reels get() = firestore.collection(Collections.REELS)
    private val viewedThisSession = JCollections.synchronizedSet(mutableSetOf<String>())

    override fun observeReels(): Flow<List<Reel>> =
        combine(
            reels.orderBy("createdAt", Query.Direction.DESCENDING).limit(60).asFlow()
                .map { snap -> snap.documents.mapNotNull { d -> d.data?.toReel(d.id) } },
            users.observeUserState(),
        ) { list, state -> list.filter { it.authorId !in state.blocked && it.videoUrl.startsWith("http") } }

    override fun observeReel(id: String): Flow<Reel?> = reels.document(id).asFlow().map { it.data?.toReel(it.id) }

    override suspend fun publish(video: LocalMedia, caption: String, music: String): AppResult<Unit> = runCatchingApp(errorMapper) {
        val uid = auth.requireUid()
        val prepared = preparer.prepare(video)
        val media = (prepared as? AppResult.Success)?.data ?: throw AppErrorException(prepared.errorOrNull() ?: AppError.Unknown())
        if (media.sizeBytes >= 150L * 1024 * 1024) throw AppErrorException(AppError.Validation("media", "too-large"))
        val me = users.getUser(uid)
        val now = System.currentTimeMillis()
        val ext = Uri.parse(media.uri).lastPathSegment?.substringAfterLast('.', "mp4") ?: "mp4"
        val payload = ReelPublishPayload(
            reelId = Ids.reel(),
            authorName = me?.displayName.orEmpty(),
            authorAvatar = me?.avatar.orEmpty(),
            caption = caption.trim().take(2_000),
            music = music.trim().take(120),
            createdAt = now,
            file = UploadFile(media.uri, media.mimeType, "video", media.name, media.sizeBytes, "reels/$uid/${now}_${Ids.short().take(5)}.$ext", media.durationMs),
        )
        outbox.enqueue(OutboxTypes.REEL_PUBLISH, "reel:${payload.reelId}", payload, ReelPublishPayload.serializer())
        Unit
    }

    override suspend fun toggleLike(reel: Reel): AppResult<Unit> = runCatchingApp(errorMapper) {
        val uid = auth.requireUid()
        val liked = reel.isLikedBy(uid)
        reels.document(reel.id).update(
            mapOf(
                "likedUsers" to if (liked) FieldValue.arrayRemove(uid) else FieldValue.arrayUnion(uid),
                "likes" to FieldValue.increment(if (liked) -1 else 1),
                "updatedAt" to System.currentTimeMillis(),
            ),
        )
        Unit
    }

    override suspend fun addComment(reelId: String, text: String): AppResult<Unit> = runCatchingApp(errorMapper) {
        val body = text.trim()
        if (body.isEmpty()) throw AppErrorException(AppError.Validation("comment", "empty"))
        val uid = auth.requireUid()
        val me = users.getUser(uid) ?: throw AppErrorException(AppError.NotFound())
        val comment = Comment(Ids.comment(), uid, me.toSnapshot(), body.take(1_000), Validators.extractMentions(body), createdAt = System.currentTimeMillis())
        reels.document(reelId).update(
            mapOf("comments" to FieldValue.arrayUnion(comment.toMap()), "commentsCount" to FieldValue.increment(1), "updatedAt" to System.currentTimeMillis()),
        )
        Unit
    }

    override suspend fun recordView(reelId: String) {
        if (!viewedThisSession.add(reelId) || auth.currentUser == null) return
        reels.document(reelId).update(mapOf("views" to FieldValue.increment(1)))
    }

    override suspend fun share(reelId: String): AppResult<Unit> = runCatchingApp(errorMapper) {
        reels.document(reelId).update(mapOf("shares" to FieldValue.increment(1), "updatedAt" to System.currentTimeMillis()))
        Unit
    }

    override suspend fun delete(reelId: String): AppResult<Unit> = runCatchingApp(errorMapper) {
        reels.document(reelId).delete()
        Unit
    }
}
