package com.animeblack.core.data.repository.impl

import com.animeblack.core.common.util.Ids
import com.animeblack.core.data.firebase.Collections
import com.animeblack.core.data.firebase.asFlow
import com.animeblack.core.data.mapper.toBroadcast
import com.animeblack.core.data.mapper.toNotification
import com.animeblack.core.data.repository.NotificationRepository
import com.animeblack.core.data.repository.UserRepository
import com.animeblack.core.model.AppNotification
import com.animeblack.core.model.Broadcast
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.Query
import javax.inject.Inject
import javax.inject.Provider
import javax.inject.Singleton
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.tasks.await

@Singleton
class FirestoreNotificationRepository @Inject constructor(
    private val auth: FirebaseAuth,
    private val firestore: FirebaseFirestore,
    private val users: Provider<UserRepository>,
) : NotificationRepository {

    private val notifications get() = firestore.collection(Collections.NOTIFICATIONS)

    override fun observeNotifications(): Flow<List<AppNotification>> {
        val uid = auth.currentUser?.uid ?: return flowOf(emptyList())
        // Uses the composite index notifications(userId ↑, at ↓) from firestore.indexes.json.
        return notifications.whereEqualTo("userId", uid).orderBy("at", Query.Direction.DESCENDING).limit(100).asFlow()
            .map { snap -> snap.documents.mapNotNull { d -> d.data?.toNotification(d.id) } }
    }

    override fun observeUnreadCount(): Flow<Int> = observeNotifications().map { list -> list.count { !it.read } }.catch { emit(0) }

    override fun observeBroadcasts(): Flow<List<Broadcast>> =
        firestore.collection(Collections.BROADCASTS).limit(50).asFlow()
            .map { snap -> snap.documents.mapNotNull { d -> d.data?.toBroadcast(d.id) }.sortedByDescending { it.at } }
            .catch { emit(emptyList()) }

    override suspend fun markRead(id: String) {
        notifications.document(id).update(mapOf("read" to true))
    }

    override suspend fun markAllRead() {
        val uid = auth.currentUser?.uid ?: return
        try {
            val unread = notifications.whereEqualTo("userId", uid).whereEqualTo("read", false).limit(400).get().await()
            if (unread.isEmpty) return
            val batch = firestore.batch()
            unread.documents.forEach { batch.update(it.reference, mapOf("read" to true)) }
            batch.commit()
        } catch (_: Exception) {
        }
    }

    override suspend fun delete(id: String) {
        notifications.document(id).delete()
    }

    override suspend fun notifyUser(toUid: String, type: String, title: String, body: String, postId: String?, storyId: String?, link: String?) {
        val me = auth.currentUser?.uid ?: return
        if (toUid.isBlank() || toUid == me) return
        val profile = users.get().getUser(me)
        val id = Ids.notification()
        val doc = buildMap<String, Any?> {
            put("id", id)
            put("userId", toUid)
            put("fromUserId", me)
            put("fromUserName", profile?.displayName.orEmpty())
            put("fromUserAvatar", profile?.avatar.orEmpty())
            put("type", type)
            put("title", title.take(120))
            put("body", body.take(300))
            put("at", System.currentTimeMillis())
            put("read", false)
            if (postId != null) put("postId", postId)
            if (storyId != null) put("storyId", storyId)
            if (link != null) put("link", link)
        }
        notifications.document(id).set(doc)
    }
}
