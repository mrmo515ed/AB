package com.animeblack.core.data.repository.impl

import android.net.Uri
import androidx.paging.Pager
import androidx.paging.PagingConfig
import androidx.paging.PagingData
import androidx.paging.PagingSource
import androidx.paging.PagingState
import com.animeblack.core.common.result.AppError
import com.animeblack.core.common.result.AppResult
import com.animeblack.core.common.result.runCatchingApp
import com.animeblack.core.common.util.Ids
import com.animeblack.core.common.util.Validators
import com.animeblack.core.data.firebase.AppErrorException
import com.animeblack.core.data.firebase.Collections
import com.animeblack.core.data.firebase.FirebaseErrorMapper
import com.animeblack.core.data.firebase.asFlow
import com.animeblack.core.data.firebase.dataEstimated
import com.animeblack.core.data.firebase.requireUid
import com.animeblack.core.data.firebase.str
import com.animeblack.core.data.firebase.toStringKeyed
import com.animeblack.core.data.mapper.toMap
import com.animeblack.core.data.mapper.toPost
import com.animeblack.core.data.outbox.AuthorPayload
import com.animeblack.core.data.outbox.OutboxRepository
import com.animeblack.core.data.outbox.OutboxTypes
import com.animeblack.core.data.outbox.PollVotePayload
import com.animeblack.core.data.outbox.PostPublishPayload
import com.animeblack.core.data.outbox.UploadFile
import com.animeblack.core.data.media.MediaPreparer
import com.animeblack.core.data.repository.FeedState
import com.animeblack.core.data.repository.NotificationRepository
import com.animeblack.core.data.repository.PostRepository
import com.animeblack.core.data.repository.UserRepository
import com.animeblack.core.database.PendingOperation
import com.animeblack.core.datastore.SettingsDataSource
import com.animeblack.core.model.AuthorSnapshot
import com.animeblack.core.model.Comment
import com.animeblack.core.model.MediaItem
import com.animeblack.core.model.Post
import com.animeblack.core.model.PostDraft
import com.animeblack.core.model.PostMedia
import com.animeblack.core.model.User
import com.animeblack.core.model.toSnapshot
import com.google.firebase.firestore.DocumentSnapshot
import com.google.firebase.firestore.FieldPath
import com.google.firebase.firestore.FieldValue
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.Query
import com.google.firebase.firestore.SetOptions
import com.google.firebase.firestore.Source
import com.google.firebase.auth.FirebaseAuth
import javax.inject.Inject
import javax.inject.Singleton
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.flatMapLatest
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.tasks.await
import kotlinx.coroutines.withTimeout

@Singleton
class FirestorePostRepository @Inject constructor(
    private val auth: FirebaseAuth,
    private val firestore: FirebaseFirestore,
    private val users: UserRepository,
    private val notifications: NotificationRepository,
    private val outbox: OutboxRepository,
    private val preparer: MediaPreparer,
    private val settings: SettingsDataSource,
    private val errorMapper: FirebaseErrorMapper,
) : PostRepository {

    private val posts get() = firestore.collection(Collections.POSTS)
    private val feedQuery get() = posts.orderBy("createdAt", Query.Direction.DESCENDING)

    private val older = MutableStateFlow<List<Post>>(emptyList())
    private val loadingMore = MutableStateFlow(false)
    private val hasMore = MutableStateFlow(true)
    @Volatile private var lastHeadDoc: DocumentSnapshot? = null
    @Volatile private var lastOlderDoc: DocumentSnapshot? = null

    private fun DocumentSnapshot.toPostOrNull(): Post? =
        dataEstimated()?.takeIf { it.isNotEmpty() }?.toPost(id, metadata.hasPendingWrites())

    // ------------------------------------------------------------------ feed
    override fun observeFeed(): Flow<FeedState> {
        val head = feedQuery.limit(HEAD_SIZE).asFlow(includeMetadata = true).map { snap ->
            lastHeadDoc = snap.documents.lastOrNull()
            if (snap.size() < HEAD_SIZE) hasMore.value = false
            snap.documents.mapNotNull { it.toPostOrNull() } to snap.metadata.isFromCache
        }
        val paging = combine(older, loadingMore, hasMore) { o, l, h -> Triple(o, l, h) }
        val filters = combine(users.observeUserState(), settings.settings, users.observeMe()) { state, s, me ->
            Triple(state, s.hiddenPosts, me)
        }
        return combine(head, paging, pendingPosts(), filters) { (headPosts, fromCache), (olderPosts, isLoading, more), pending, (state, hidden, me) ->
            val myUid = me?.id
            val merged = LinkedHashMap<String, Post>()
            pending.forEach { merged[it.id] = it }
            headPosts.forEach { merged[it.id] = it }
            olderPosts.forEach { if (!merged.containsKey(it.id)) merged[it.id] = it }
            val visible = merged.values.filter { p ->
                p.id !in hidden && p.authorId !in state.blocked && canSee(p, myUid, state.following)
            }
            FeedState(visible.toList(), more, isLoading, fromCache, initialLoaded = true)
        }.catch { e ->
            throw AppErrorException(errorMapper.map(e))
        }
    }

    private fun canSee(post: Post, myUid: String?, following: List<String>): Boolean = when (post.privacy) {
        Post.PRIVACY_PRIVATE, "onlyMe" -> post.authorId == myUid
        Post.PRIVACY_FOLLOWERS, "friends" -> post.authorId == myUid || post.authorId in following
        else -> true
    }

    override suspend fun loadMoreFeed(): AppResult<Unit> = runCatchingApp(errorMapper) {
        if (loadingMore.value || !hasMore.value) return@runCatchingApp
        val cursor = lastOlderDoc ?: lastHeadDoc ?: return@runCatchingApp
        loadingMore.value = true
        try {
            val snap = feedQuery.startAfter(cursor).limit(PAGE_SIZE).get().await()
            lastOlderDoc = snap.documents.lastOrNull() ?: lastOlderDoc
            older.value = older.value + snap.documents.mapNotNull { it.toPostOrNull() }
            if (snap.size() < PAGE_SIZE) hasMore.value = false
        } finally {
            loadingMore.value = false
        }
    }

    /** Media posts still uploading, shown optimistically at the top of the feed. */
    private fun pendingPosts(): Flow<List<Post>> = outbox.observe().map { ops ->
        ops.filter { it.type == OutboxTypes.POST_PUBLISH }.mapNotNull { op ->
            val payload = try {
                outbox.json.decodeFromString(PostPublishPayload.serializer(), op.payload)
            } catch (_: Exception) {
                null
            } ?: return@mapNotNull null
            if (payload.editing) return@mapNotNull null
            Post(
                id = payload.postId,
                authorId = payload.author.id,
                author = AuthorSnapshot(payload.author.id, payload.author.name, payload.author.username, payload.author.avatar, payload.author.isVerified, payload.author.role, payload.author.level),
                text = payload.text,
                media = payload.files.firstOrNull()?.let { first ->
                    PostMedia(first.type, first.downloadUrl ?: first.localUri, payload.files.map { MediaItem(it.type, it.downloadUrl ?: it.localUri, it.name, it.size) })
                },
                tags = payload.tags,
                createdAt = payload.createdAt,
                isPending = op.state != PendingOperation.STATE_FAILED,
                warningText = if (op.state == PendingOperation.STATE_FAILED) FAILED_MARKER else "",
            )
        }
    }

    override fun observePost(postId: String): Flow<Post?> =
        posts.document(postId).asFlow(includeMetadata = true).map { it.toPostOrNull() }

    override fun userPosts(uid: String): Flow<PagingData<Post>> = Pager(
        config = PagingConfig(pageSize = PAGE_SIZE.toInt(), enablePlaceholders = false),
        pagingSourceFactory = {
            FirestorePostPagingSource(
                posts.whereEqualTo("authorId", uid).orderBy("createdAt", Query.Direction.DESCENDING),
            )
        },
    ).flow

    override fun observeSavedIds(): Flow<Set<String>> = users.observeUserState().map { it.savedPostIds.toSet() }

    override fun observeSavedPosts(): Flow<List<Post>> = observeSavedIds().flatMapLatest { ids ->
        if (ids.isEmpty()) {
            flowOf(emptyList())
        } else {
            val chunks = ids.toList().takeLast(300).chunked(30).map { chunk ->
                posts.whereIn(FieldPath.documentId(), chunk).asFlow()
                    .map { snap -> snap.documents.mapNotNull { it.toPostOrNull() } }
                    .catch { emit(emptyList()) }
            }
            combine(chunks) { lists -> lists.flatMap { it }.sortedByDescending { it.createdAt } }
        }
    }

    // ------------------------------------------------------------------ create / edit / delete
    private suspend fun me(): User {
        val uid = auth.requireUid()
        return users.getUser(uid) ?: User(id = uid, name = auth.currentUser?.displayName.orEmpty())
    }

    override suspend fun createPost(draft: PostDraft): AppResult<String> = runCatchingApp(errorMapper) {
        val text = draft.text.trim()
        val pollOptions = draft.pollOptions.map { it.trim() }.filter { it.isNotBlank() }
        val hasPoll = draft.pollQuestion.isNotBlank() && pollOptions.size >= 2
        if (text.isBlank() && draft.attachments.isEmpty() && !hasPoll) {
            throw AppErrorException(AppError.Validation("post", "empty"))
        }
        if (text.length > MAX_POST_LENGTH) throw AppErrorException(AppError.Validation("post", "too-long"))
        val user = me()
        val now = System.currentTimeMillis()
        val postId = draft.editingPostId ?: Ids.post(now)
        val files = prepareFiles(user.id, draft)
        val payload = PostPublishPayload(
            postId = postId,
            author = user.toSnapshot().let { AuthorPayload(it.id, it.name, it.username, it.avatar, it.isVerified, it.role, it.level) },
            text = text,
            category = draft.category,
            tags = (draft.tags + Validators.extractHashtags(text)).distinct().take(15),
            mentions = Validators.extractMentions(text),
            location = draft.location.trim(),
            privacy = draft.privacy,
            spoiler = draft.spoiler,
            warningText = draft.warningText,
            allowComments = draft.allowComments,
            pollQuestion = if (hasPoll) draft.pollQuestion.trim() else null,
            pollOptions = if (hasPoll) pollOptions.take(6) else emptyList(),
            createdAt = now,
            files = files,
            editing = draft.editingPostId != null,
        )
        if (files.isEmpty()) {
            // No uploads: write directly; Firestore queues the write durably while offline.
            val ref = posts.document(postId)
            if (payload.editing) {
                ref.set(
                    mapOf(
                        "text" to payload.text, "category" to payload.category, "tags" to payload.tags,
                        "mentions" to payload.mentions, "location" to payload.location, "privacy" to payload.privacy,
                        "spoiler" to payload.spoiler, "warningText" to payload.warningText, "isEdited" to true,
                        "updatedAt" to now,
                    ),
                    SetOptions.merge(),
                )
            } else {
                ref.set(com.animeblack.core.data.outbox.OutboxProcessor.postDocument(payload, null))
            }
        } else {
            outbox.enqueue(OutboxTypes.POST_PUBLISH, "post:$postId:$now", payload, PostPublishPayload.serializer())
        }
        if (!payload.editing) notifyMentions(user, payload.mentions, postId, "إشارة في منشور", text)
        postId
    }

    private suspend fun prepareFiles(uid: String, draft: PostDraft): List<UploadFile> =
        draft.attachments.take(MAX_ATTACHMENTS).map { item ->
            val prepared = preparer.prepare(item)
            val media = (prepared as? AppResult.Success)?.data ?: throw AppErrorException(prepared.errorOrNull() ?: AppError.Unknown())
            if (media.sizeBytes >= MAX_POST_MEDIA_BYTES) throw AppErrorException(AppError.Validation("media", "too-large"))
            val ext = Uri.parse(media.uri).lastPathSegment?.substringAfterLast('.', "bin") ?: "bin"
            UploadFile(
                localUri = media.uri,
                mimeType = media.mimeType,
                type = media.type,
                name = media.name,
                size = media.sizeBytes,
                durationMs = media.durationMs,
                storagePath = "posts/$uid/${System.currentTimeMillis()}_${Ids.short().take(5)}.$ext",
            )
        }

    override suspend fun updatePost(postId: String, draft: PostDraft): AppResult<Unit> =
        when (val r = createPost(draft.copy(editingPostId = postId))) {
            is AppResult.Success -> AppResult.Success(Unit)
            is AppResult.Failure -> r
        }

    override suspend fun deletePost(postId: String): AppResult<Unit> = runCatchingApp(errorMapper) {
        posts.document(postId).delete()
        older.value = older.value.filterNot { it.id == postId }
    }

    // ------------------------------------------------------------------ interactions
    private fun likeElement(user: User, reaction: String?): Map<String, Any?> = buildMap {
        put("id", user.id)
        put("uid", user.id)
        put("name", user.displayName)
        put("username", user.username)
        put("avatar", user.avatar)
        put("isVerified", user.isVerified)
        put("role", user.role)
        if (reaction != null) put("reaction", reaction)
    }

    /** Raw array element of the current user in `likedUsers` (needed for an exact arrayRemove). */
    private suspend fun myLikeElement(postId: String, uid: String): Any? {
        val snap = try {
            posts.document(postId).get(Source.CACHE).await()
        } catch (_: Exception) {
            posts.document(postId).get().await()
        }
        val list = snap.get("likedUsers") as? List<*> ?: return null
        return list.firstOrNull { e ->
            when (e) {
                is String -> e == uid
                is Map<*, *> -> e["id"] == uid || e["uid"] == uid
                else -> false
            }
        }
    }

    override suspend fun toggleLike(post: Post): AppResult<Unit> = runCatchingApp(errorMapper) {
        val user = me()
        val ref = posts.document(post.id)
        val now = System.currentTimeMillis()
        val existing = myLikeElement(post.id, user.id)
        if (existing != null) {
            val update = mutableMapOf<String, Any?>(
                "likedUsers" to FieldValue.arrayRemove(existing),
                "likes" to FieldValue.increment(-1),
                "updatedAt" to now,
            )
            ((existing as? Map<*, *>)?.get("reaction") as? String)?.let { update["reacts.$it"] = FieldValue.increment(-1) }
            ref.update(update)
        } else {
            ref.update(mapOf("likedUsers" to FieldValue.arrayUnion(likeElement(user, "like")), "likes" to FieldValue.increment(1), "reacts.like" to FieldValue.increment(1), "updatedAt" to now))
        }
        Unit
    }

    override suspend fun react(post: Post, reactionKey: String): AppResult<Unit> = runCatchingApp(errorMapper) {
        val user = me()
        val ref = posts.document(post.id)
        val now = System.currentTimeMillis()
        val existing = myLikeElement(post.id, user.id)
        val previous = (existing as? Map<*, *>)?.get("reaction") as? String
        if (existing != null && previous == reactionKey) return@runCatchingApp
        val batch = firestore.batch()
        if (existing != null) {
            val removal = mutableMapOf<String, Any?>("likedUsers" to FieldValue.arrayRemove(existing), "updatedAt" to now)
            if (previous != null) removal["reacts.$previous"] = FieldValue.increment(-1)
            batch.update(ref, removal)
            batch.update(ref, mapOf("likedUsers" to FieldValue.arrayUnion(likeElement(user, reactionKey)), "reacts.$reactionKey" to FieldValue.increment(1), "lastReaction" to reactionKey))
        } else {
            batch.update(
                ref,
                mapOf(
                    "likedUsers" to FieldValue.arrayUnion(likeElement(user, reactionKey)),
                    "likes" to FieldValue.increment(1),
                    "reacts.$reactionKey" to FieldValue.increment(1),
                    "lastReaction" to reactionKey,
                    "updatedAt" to now,
                ),
            )
        }
        batch.commit()
        Unit
    }

    override suspend fun addComment(postId: String, text: String, replyToId: String?): AppResult<Unit> = runCatchingApp(errorMapper) {
        val body = text.trim()
        if (body.isEmpty()) throw AppErrorException(AppError.Validation("comment", "empty"))
        if (body.length > MAX_COMMENT_LENGTH) throw AppErrorException(AppError.Validation("comment", "too-long"))
        val user = me()
        val now = System.currentTimeMillis()
        val comment = Comment(
            id = Ids.comment(),
            userId = user.id,
            user = user.toSnapshot(),
            text = body,
            mentions = Validators.extractMentions(body),
            createdAt = now,
            replyToId = replyToId,
        )
        posts.document(postId).update(
            mapOf("comments" to FieldValue.arrayUnion(comment.toMap()), "commentsCount" to FieldValue.increment(1), "updatedAt" to now),
        )
        val authorId = try {
            posts.document(postId).get(Source.CACHE).await().getString("authorId")
        } catch (_: Exception) {
            null
        }
        if (authorId != null && authorId != user.id) {
            notifications.notifyUser(authorId, "comment", "تعليق جديد على منشورك", "${user.displayName}: \"${body.take(50)}\"", postId = postId, link = "postDetail:$postId")
        }
        notifyMentions(user, comment.mentions, postId, "إشارة في تعليق", body)
    }

    private suspend fun notifyMentions(user: User, usernames: List<String>, postId: String, title: String, text: String) {
        for (username in usernames.take(10)) {
            val target = try {
                firestore.collection(Collections.USERS).whereEqualTo("username", username).limit(1).get().await().documents.firstOrNull()?.id
            } catch (_: Exception) {
                null
            }
            if (target != null && target != user.id) {
                notifications.notifyUser(target, "mention", title, "${user.displayName} أشار إليك: \"${text.take(50)}\"", postId = postId, link = "postDetail:$postId")
            }
        }
    }

    override suspend fun deleteComment(postId: String, commentId: String): AppResult<Unit> = runCatchingApp(errorMapper) {
        val snap = posts.document(postId).get().await()
        val raw = (snap.get("comments") as? List<*>)?.firstOrNull { e ->
            (e as? Map<*, *>)?.let { m -> m.toStringKeyed().str("id") == commentId } == true
        } ?: return@runCatchingApp
        posts.document(postId).update(
            mapOf("comments" to FieldValue.arrayRemove(raw), "commentsCount" to FieldValue.increment(-1), "updatedAt" to System.currentTimeMillis()),
        )
        Unit
    }

    /** Votes need the current option counts, so they run in a transaction; offline they are queued. */
    override suspend fun votePoll(postId: String, optionId: String): AppResult<Unit> = runCatchingApp(errorMapper) {
        val payload = PollVotePayload(postId, optionId)
        val uid = auth.requireUid()
        outbox.enqueue(OutboxTypes.POLL_VOTE, "poll:$postId:$uid", payload, PollVotePayload.serializer())
        Unit
    }

    override suspend fun share(postId: String): AppResult<Unit> = runCatchingApp(errorMapper) {
        posts.document(postId).update(mapOf("shares" to FieldValue.increment(1), "updatedAt" to System.currentTimeMillis()))
        Unit
    }

    override suspend fun setSaved(postId: String, saved: Boolean): AppResult<Unit> = runCatchingApp(errorMapper) {
        val uid = auth.requireUid()
        firestore.collection(Collections.USER_STATES).document(uid).set(
            mapOf(
                "uid" to uid,
                "saved" to if (saved) FieldValue.arrayUnion(postId) else FieldValue.arrayRemove(postId),
                "updatedAt" to System.currentTimeMillis(),
            ),
            SetOptions.merge(),
        )
        Unit
    }

    override suspend fun searchPosts(query: String): AppResult<List<Post>> = runCatchingApp(errorMapper) {
        val q = query.trim()
        if (q.isEmpty()) return@runCatchingApp emptyList()
        if (q.startsWith("#") && q.length > 1) {
            posts.whereArrayContains("tags", q.removePrefix("#")).limit(60).get().await()
                .documents.mapNotNull { it.toPostOrNull() }.sortedByDescending { it.createdAt }
        } else {
            val needle = q.lowercase()
            withTimeout(15_000) { feedQuery.limit(SEARCH_WINDOW).get().await() }
                .documents.mapNotNull { it.toPostOrNull() }
                .filter { p ->
                    p.text.lowercase().contains(needle) ||
                        p.author.name.lowercase().contains(needle) ||
                        p.author.username.lowercase().contains(needle) ||
                        p.tags.any { it.lowercase().contains(needle) }
                }
        }
    }

    override fun observeTrendingTags(): Flow<List<Pair<String, Int>>> = flow {
        val snap = try {
            feedQuery.limit(150).get().await()
        } catch (_: Exception) {
            null
        }
        val counts = HashMap<String, Int>()
        snap?.documents?.mapNotNull { it.toPostOrNull() }?.forEach { p -> p.tags.forEach { t -> counts[t] = (counts[t] ?: 0) + 1 } }
        emit(counts.entries.sortedByDescending { it.value }.take(12).map { it.key to it.value })
    }

    companion object {
        const val HEAD_SIZE = 25L
        const val PAGE_SIZE = 20L
        const val SEARCH_WINDOW = 300L
        const val MAX_POST_LENGTH = 5_000
        const val MAX_COMMENT_LENGTH = 1_000
        const val MAX_ATTACHMENTS = 10
        const val MAX_POST_MEDIA_BYTES = 50L * 1024 * 1024
        /** Marker put in [Post.warningText] for outbox posts whose upload permanently failed. */
        const val FAILED_MARKER = "__upload_failed__"
    }
}

/** Paging 3 source over a Firestore query (cursor = last document of the previous page). */
class FirestorePostPagingSource(private val query: Query) : PagingSource<DocumentSnapshot, Post>() {
    override fun getRefreshKey(state: PagingState<DocumentSnapshot, Post>): DocumentSnapshot? = null

    override suspend fun load(params: LoadParams<DocumentSnapshot>): LoadResult<DocumentSnapshot, Post> = try {
        val base = query.limit(params.loadSize.toLong())
        val snap = (params.key?.let { base.startAfter(it) } ?: base).get().await()
        val items = snap.documents.mapNotNull { d -> d.dataEstimated()?.toPost(d.id, d.metadata.hasPendingWrites()) }
        LoadResult.Page(
            data = items,
            prevKey = null,
            nextKey = if (snap.size() < params.loadSize) null else snap.documents.lastOrNull(),
        )
    } catch (e: Exception) {
        LoadResult.Error(e)
    }
}
