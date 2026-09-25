package com.animeblack.core.data.repository.impl

import android.net.Uri
import com.animeblack.core.common.result.AppError
import com.animeblack.core.common.result.AppResult
import com.animeblack.core.common.result.runCatchingApp
import com.animeblack.core.common.util.Ids
import com.animeblack.core.data.firebase.AppErrorException
import com.animeblack.core.data.firebase.Collections
import com.animeblack.core.data.firebase.FirebaseErrorMapper
import com.animeblack.core.data.firebase.asFlow
import com.animeblack.core.data.firebase.requireUid
import com.animeblack.core.data.firebase.str
import com.animeblack.core.data.firebase.toStringKeyed
import com.animeblack.core.data.mapper.toStory
import com.animeblack.core.data.media.MediaPreparer
import com.animeblack.core.data.outbox.OutboxRepository
import com.animeblack.core.data.outbox.OutboxTypes
import com.animeblack.core.data.outbox.StoryPublishPayload
import com.animeblack.core.data.outbox.UploadFile
import com.animeblack.core.data.repository.ChatRepository
import com.animeblack.core.data.repository.NotificationRepository
import com.animeblack.core.data.repository.StoryDraft
import com.animeblack.core.data.repository.StoryRepository
import com.animeblack.core.data.repository.UserRepository
import com.animeblack.core.model.OutgoingMessage
import com.animeblack.core.model.Story
import com.animeblack.core.model.StoryItem
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FieldValue
import com.google.firebase.firestore.FirebaseFirestore
import javax.inject.Inject
import javax.inject.Singleton
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.tasks.await

@Singleton
class FirestoreStoryRepository @Inject constructor(
    private val auth: FirebaseAuth,
    private val firestore: FirebaseFirestore,
    private val users: UserRepository,
    private val chats: ChatRepository,
    private val notifications: NotificationRepository,
    private val outbox: OutboxRepository,
    private val preparer: MediaPreparer,
    private val errorMapper: FirebaseErrorMapper,
) : StoryRepository {

    private val stories get() = firestore.collection(Collections.STORIES)

    override fun observeActiveStories(): Flow<List<Story>> {
        val raw = stories.limit(200).asFlow().map { snap -> snap.documents.mapNotNull { d -> d.data?.toStory(d.id) } }
        return combine(raw, users.observeUserState(), users.observeMe()) { list, state, me ->
            val uid = me?.id.orEmpty()
            val now = System.currentTimeMillis()
            list.filter { st ->
                st.isActive(now) &&
                    st.userId !in state.blocked &&
                    uid !in st.hiddenFrom &&
                    (st.userId == uid || !st.closeFriends || uid in (users.getUser(st.userId)?.closeFriends.orEmpty()))
            }
                .groupBy { it.userId }
                .map { (_, sets) -> sets.maxBy { it.latestItemAt } }
                .sortedWith(
                    compareByDescending<Story> { it.userId == uid }
                        .thenBy { it.seenBy(uid) }
                        .thenByDescending { it.latestItemAt },
                )
        }.catch { emit(emptyList()) }
    }

    override suspend fun publish(draft: StoryDraft): AppResult<Unit> = runCatchingApp(errorMapper) {
        val uid = auth.requireUid()
        if (draft.text.isBlank() && draft.media == null) throw AppErrorException(AppError.Validation("story", "empty"))
        val me = users.getUser(uid)
        val now = System.currentTimeMillis()
        val existing = try {
            stories.whereEqualTo("userId", uid).get().await().documents
                .mapNotNull { d -> d.data?.toStory(d.id) }
                .filter { it.isActive(now) }
                .maxByOrNull { it.latestItemAt }
        } catch (_: Exception) {
            null
        }
        val file = draft.media?.let { media ->
            val prepared = preparer.prepare(media)
            val ready = (prepared as? AppResult.Success)?.data ?: throw AppErrorException(prepared.errorOrNull() ?: AppError.Unknown())
            if (ready.sizeBytes >= 30L * 1024 * 1024) throw AppErrorException(AppError.Validation("media", "too-large"))
            val ext = Uri.parse(ready.uri).lastPathSegment?.substringAfterLast('.', "jpg") ?: "jpg"
            UploadFile(ready.uri, ready.mimeType, ready.type, ready.name, ready.sizeBytes, "stories/$uid/${now}_${Ids.short().take(5)}.$ext", ready.durationMs)
        }
        val payload = StoryPublishPayload(
            storyId = existing?.id ?: Ids.story(),
            itemId = Ids.storyItem(),
            userName = me?.displayName.orEmpty(),
            userAvatar = me?.avatar.orEmpty(),
            text = draft.text.trim().take(500),
            color1 = draft.color1,
            color2 = draft.color2,
            textColor = draft.textColor,
            textSize = draft.textSize,
            closeFriends = draft.closeFriends,
            createdAt = now,
            newDoc = existing == null,
            file = file,
        )
        outbox.enqueue(OutboxTypes.STORY_PUBLISH, "story:${payload.itemId}", payload, StoryPublishPayload.serializer())
        Unit
    }

    override suspend fun markViewed(story: Story): AppResult<Unit> = runCatchingApp(errorMapper) {
        val uid = auth.requireUid()
        if (story.userId == uid || story.seenBy(uid)) return@runCatchingApp
        val me = users.getUser(uid)
        stories.document(story.id).update(
            mapOf("views" to FieldValue.arrayUnion(mapOf("u" to uid, "name" to me?.displayName.orEmpty(), "avatar" to me?.avatar.orEmpty(), "at" to System.currentTimeMillis()))),
        )
        Unit
    }

    override suspend fun react(story: Story, icon: String): AppResult<Unit> = runCatchingApp(errorMapper) {
        val uid = auth.requireUid()
        val me = users.getUser(uid)
        stories.document(story.id).update(
            mapOf(
                "reactions" to FieldValue.arrayUnion(
                    mapOf("id" to "rx_${Ids.short()}", "u" to uid, "name" to me?.displayName.orEmpty(), "avatar" to me?.avatar.orEmpty(), "ic" to icon, "at" to System.currentTimeMillis()),
                ),
            ),
        )
        if (story.userId != uid) {
            notifications.notifyUser(story.userId, "story_react", "تفاعل على قصتك", "${me?.displayName.orEmpty()} تفاعل على قصتك", storyId = story.id)
        }
    }

    override suspend fun reply(story: Story, item: StoryItem, text: String): AppResult<Unit> = runCatchingApp(errorMapper) {
        val body = text.trim()
        if (body.isEmpty()) throw AppErrorException(AppError.Validation("reply", "empty"))
        val chatId = (chats.openConversation(story.userId) as? AppResult.Success)?.data ?: throw AppErrorException(AppError.Unknown())
        val prefix = if (item.text.isNotBlank()) "رد على قصتك «${item.text.take(40)}»: " else "رد على قصتك: "
        val result = chats.send(chatId, story.userId, OutgoingMessage(text = prefix + body))
        if (result is AppResult.Failure) throw AppErrorException(result.error)
    }

    override suspend fun deleteItem(story: Story, itemId: String): AppResult<Unit> = runCatchingApp(errorMapper) {
        val snap = stories.document(story.id).get().await()
        val items = snap.get("items") as? List<*> ?: return@runCatchingApp
        val raw = items.firstOrNull { (it as? Map<*, *>)?.toStringKeyed()?.str("id") == itemId } ?: return@runCatchingApp
        if (items.size <= 1) {
            stories.document(story.id).delete()
        } else {
            stories.document(story.id).update(mapOf("items" to FieldValue.arrayRemove(raw)))
        }
        Unit
    }
}
