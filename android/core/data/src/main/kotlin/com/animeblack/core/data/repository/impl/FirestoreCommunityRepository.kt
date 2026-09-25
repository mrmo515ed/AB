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
import com.animeblack.core.data.firebase.dataEstimated
import com.animeblack.core.data.firebase.requireUid
import com.animeblack.core.data.mapper.toChatMessage
import com.animeblack.core.data.mapper.toCommunity
import com.animeblack.core.data.mapper.toGroup
import com.animeblack.core.data.mapper.toWorld
import com.animeblack.core.data.media.MediaPreparer
import com.animeblack.core.data.outbox.OutboxRepository
import com.animeblack.core.data.outbox.OutboxTypes
import com.animeblack.core.data.outbox.RoomMediaPayload
import com.animeblack.core.data.outbox.UploadFile
import com.animeblack.core.data.repository.CommunityDraft
import com.animeblack.core.data.repository.CommunityRepository
import com.animeblack.core.data.repository.GroupDraft
import com.animeblack.core.data.repository.NotificationRepository
import com.animeblack.core.data.repository.UserRepository
import com.animeblack.core.data.repository.WorldDraft
import com.animeblack.core.model.ChatMessage
import com.animeblack.core.model.Community
import com.animeblack.core.model.Group
import com.animeblack.core.model.LocalMedia
import com.animeblack.core.model.MessageQuote
import com.animeblack.core.model.RoomRef
import com.animeblack.core.model.World
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.CollectionReference
import com.google.firebase.firestore.FieldValue
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.Query
import com.google.firebase.firestore.SetOptions
import javax.inject.Inject
import javax.inject.Singleton
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.flow.map

@Singleton
class FirestoreCommunityRepository @Inject constructor(
    private val auth: FirebaseAuth,
    private val firestore: FirebaseFirestore,
    private val users: UserRepository,
    private val notifications: NotificationRepository,
    private val outbox: OutboxRepository,
    private val preparer: MediaPreparer,
    private val errorMapper: FirebaseErrorMapper,
) : CommunityRepository {

    private val groups get() = firestore.collection(Collections.GROUPS)
    private val worlds get() = firestore.collection(Collections.WORLDS)
    private val communities get() = firestore.collection(Collections.COMMUNITIES)

    // ------------------------------------------------------------------ groups
    override fun observeGroups(): Flow<List<Group>> =
        groups.limit(300).asFlow().map { snap ->
            val uid = auth.currentUser?.uid
            snap.documents.mapNotNull { d -> d.data?.toGroup(d.id) }
                .filter { !it.isPrivate || (uid != null && it.isMember(uid)) }
                .sortedByDescending { maxOf(it.lastAt, it.createdAt) }
        }

    override fun observeGroup(id: String): Flow<Group?> = groups.document(id).asFlow().map { it.data?.toGroup(it.id) }.catch { emit(null) }

    override suspend fun createGroup(draft: GroupDraft): AppResult<String> = runCatchingApp(errorMapper) {
        val uid = auth.requireUid()
        val name = draft.name.trim()
        if (name.length < 2) throw AppErrorException(AppError.Validation("name", "too-short"))
        val me = users.getUser(uid)
        val id = Ids.group()
        val now = System.currentTimeMillis()
        val members = (listOf(uid) + draft.initialMembers).distinct()
        val welcome = "أنشأت القروب — أهلاً بالجميع"
        groups.document(id).set(
            mapOf(
                "id" to id,
                "name" to name.take(60),
                "desc" to draft.description.trim().ifBlank { "قروب جديد في أنمي بلاك" }.take(300),
                "icon" to draft.icon,
                "c1" to "#0E7490",
                "c2" to "#00A3FF",
                "privacy" to if (draft.isPrivate) Group.PRIVACY_PRIVATE else Group.PRIVACY_PUBLIC,
                "members" to members,
                "memberUids" to members,
                "admins" to listOf(uid),
                "muted" to false,
                "announce" to false,
                "pinned" to null,
                "owner" to uid,
                "creatorUid" to uid,
                "creatorId" to uid,
                "createdAt" to now,
                "lastMsg" to welcome,
                "lastAt" to now,
                "platform" to "android",
            ),
        )
        val msgId = Ids.message()
        groups.document(id).collection(Collections.MESSAGES).document(msgId).set(
            mapOf("id" to msgId, "uid" to uid, "senderId" to uid, "senderName" to me?.displayName.orEmpty(), "text" to welcome, "type" to "text", "at" to now, "createdAt" to now, "st" to 2),
        )
        draft.initialMembers.filter { it != uid }.forEach { member ->
            notifications.notifyUser(member, "group_invite", "أُضفت إلى قروب", "${me?.displayName.orEmpty()} أضافك إلى قروب $name", link = "groupRoom:$id")
        }
        id
    }

    override suspend fun joinGroup(group: Group): AppResult<Unit> = runCatchingApp(errorMapper) {
        val uid = auth.requireUid()
        if (group.isPrivate && !group.isMember(uid)) {
            // Private group: ask the owner (join requests are delivered as notifications).
            val me = users.getUser(uid)
            notifications.notifyUser(group.ownerId, "group_join_request", "طلب انضمام", "${me?.displayName.orEmpty()} يطلب الانضمام إلى ${group.name}", link = "groupRoom:${group.id}")
            throw AppErrorException(AppError.Validation("group", "request-sent"))
        }
        groups.document(group.id).update(
            mapOf("members" to FieldValue.arrayUnion(uid), "memberUids" to FieldValue.arrayUnion(uid), "updatedAt" to System.currentTimeMillis()),
        )
        Unit
    }

    override suspend fun leaveGroup(group: Group): AppResult<Unit> = runCatchingApp(errorMapper) {
        val uid = auth.requireUid()
        groups.document(group.id).update(
            mapOf("members" to FieldValue.arrayRemove(uid), "memberUids" to FieldValue.arrayRemove(uid), "updatedAt" to System.currentTimeMillis()),
        )
        Unit
    }

    override suspend fun addGroupMember(group: Group, uid: String): AppResult<Unit> = runCatchingApp(errorMapper) {
        groups.document(group.id).update(
            mapOf("members" to FieldValue.arrayUnion(uid), "memberUids" to FieldValue.arrayUnion(uid), "updatedAt" to System.currentTimeMillis()),
        )
        notifications.notifyUser(uid, "group_invite", "أُضفت إلى قروب", "أُضفت إلى قروب ${group.name}", link = "groupRoom:${group.id}")
    }

    override suspend fun removeGroupMember(group: Group, uid: String): AppResult<Unit> = runCatchingApp(errorMapper) {
        groups.document(group.id).update(
            mapOf("members" to FieldValue.arrayRemove(uid), "memberUids" to FieldValue.arrayRemove(uid), "updatedAt" to System.currentTimeMillis()),
        )
        Unit
    }

    override suspend fun updateGroup(group: Group, name: String, description: String, announceOnly: Boolean): AppResult<Unit> = runCatchingApp(errorMapper) {
        groups.document(group.id).set(
            mapOf("name" to name.trim().take(60), "desc" to description.trim().take(300), "announce" to announceOnly, "updatedAt" to System.currentTimeMillis()),
            SetOptions.merge(),
        )
        Unit
    }

    override suspend fun deleteGroup(group: Group): AppResult<Unit> = runCatchingApp(errorMapper) {
        groups.document(group.id).delete()
        Unit
    }

    // ------------------------------------------------------------------ worlds
    override fun observeWorlds(): Flow<List<World>> =
        worlds.limit(300).asFlow().map { snap -> snap.documents.mapNotNull { d -> d.data?.toWorld(d.id) }.sortedByDescending { it.createdAt } }

    override fun observeWorld(id: String): Flow<World?> = worlds.document(id).asFlow().map { it.data?.toWorld(it.id) }.catch { emit(null) }

    override suspend fun createWorld(draft: WorldDraft): AppResult<String> = runCatchingApp(errorMapper) {
        val uid = auth.requireUid()
        val name = draft.name.trim()
        if (name.length < 2) throw AppErrorException(AppError.Validation("name", "too-short"))
        val me = users.getUser(uid)
        val id = Ids.world()
        val now = System.currentTimeMillis()
        worlds.document(id).set(
            mapOf(
                "id" to id,
                "name" to name.take(60),
                "desc" to draft.description.trim().ifBlank { "عالم جديد في أنمي بلاك" }.take(300),
                "icon" to draft.icon,
                "c1" to draft.color1,
                "c2" to draft.color2,
                "theme" to draft.theme,
                "members" to 1,
                "memberUids" to listOf(uid),
                "online" to 1,
                "owner" to uid,
                "ownerId" to uid,
                "createdAt" to now,
                "rules" to draft.rules.ifEmpty { listOf("احترام جميع الأعضاء") },
                "platform" to "android",
            ),
        )
        val msgId = Ids.message()
        worlds.document(id).collection(Collections.MESSAGES).document(msgId).set(
            mapOf("id" to msgId, "uid" to uid, "senderId" to uid, "senderName" to me?.displayName.orEmpty(), "text" to "افتتح العالم — أهلاً بالمستكشفين", "type" to "text", "at" to now),
        )
        id
    }

    override suspend fun joinWorld(world: World): AppResult<Unit> = runCatchingApp(errorMapper) {
        val uid = auth.requireUid()
        if (world.isMember(uid)) return@runCatchingApp
        worlds.document(world.id).update(mapOf("members" to FieldValue.increment(1), "memberUids" to FieldValue.arrayUnion(uid), "updatedAt" to System.currentTimeMillis()))
        Unit
    }

    override suspend fun leaveWorld(world: World): AppResult<Unit> = runCatchingApp(errorMapper) {
        val uid = auth.requireUid()
        if (!world.isMember(uid)) return@runCatchingApp
        worlds.document(world.id).update(mapOf("members" to FieldValue.increment(-1), "memberUids" to FieldValue.arrayRemove(uid), "updatedAt" to System.currentTimeMillis()))
        Unit
    }

    // ------------------------------------------------------------------ communities / guilds
    override fun observeCommunities(): Flow<List<Community>> =
        communities.limit(300).asFlow().map { snap -> snap.documents.mapNotNull { d -> d.data?.toCommunity(d.id) }.sortedByDescending { it.membersCount } }

    override fun observeCommunity(id: String): Flow<Community?> = communities.document(id).asFlow().map { it.data?.toCommunity(it.id) }.catch { emit(null) }

    override suspend fun createCommunity(draft: CommunityDraft): AppResult<String> = runCatchingApp(errorMapper) {
        val uid = auth.requireUid()
        val name = draft.name.trim()
        if (name.length < 2) throw AppErrorException(AppError.Validation("name", "too-short"))
        val id = Ids.community()
        val now = System.currentTimeMillis()
        communities.document(id).set(
            mapOf(
                "id" to id,
                "name" to name.take(60),
                "desc" to draft.description.trim().take(500),
                "tag" to draft.tag.trim().uppercase().take(3),
                "focus" to draft.focus,
                "c1" to draft.color1,
                "c2" to draft.color2,
                "members" to 1,
                "memberUids" to listOf(uid),
                "owner" to uid,
                "ownerId" to uid,
                "ownerUid" to uid,
                "admins" to listOf(uid),
                "adminUids" to listOf(uid),
                "joinMode" to if (draft.requiresApproval) "بالطلب" else "مفتوح",
                "visibility" to "public",
                "channels" to listOf(
                    mapOf("id" to "general", "name" to "العام"),
                    mapOf("id" to "news", "name" to "الأخبار"),
                    mapOf("id" to "media", "name" to "الوسائط"),
                ),
                "treasury" to 0,
                "level" to 1,
                "createdAt" to now,
                "platform" to "android",
            ),
        )
        id
    }

    override suspend fun joinCommunity(community: Community): AppResult<Unit> = runCatchingApp(errorMapper) {
        val uid = auth.requireUid()
        if (community.isMember(uid)) return@runCatchingApp
        if (community.requiresApproval) {
            val me = users.getUser(uid)
            notifications.notifyUser(community.ownerId, "guild_join_request", "طلب انضمام", "${me?.displayName.orEmpty()} يطلب الانضمام إلى ${community.name}", link = "communityDetail:${community.id}")
            throw AppErrorException(AppError.Validation("community", "request-sent"))
        }
        communities.document(community.id).update(mapOf("members" to FieldValue.increment(1), "memberUids" to FieldValue.arrayUnion(uid), "updatedAt" to System.currentTimeMillis()))
        Unit
    }

    override suspend fun leaveCommunity(community: Community): AppResult<Unit> = runCatchingApp(errorMapper) {
        val uid = auth.requireUid()
        communities.document(community.id).update(mapOf("members" to FieldValue.increment(-1), "memberUids" to FieldValue.arrayRemove(uid), "updatedAt" to System.currentTimeMillis()))
        Unit
    }

    // ------------------------------------------------------------------ rooms
    private fun roomMessages(room: RoomRef): CollectionReference = when (room) {
        is RoomRef.GroupRoom -> groups.document(room.id).collection(Collections.MESSAGES)
        is RoomRef.WorldRoom -> worlds.document(room.id).collection(Collections.MESSAGES)
        is RoomRef.ChannelRoom -> communities.document(room.communityId).collection(Collections.CHANNELS).document(room.channelId).collection(Collections.MESSAGES)
    }

    override fun observeRoomMessages(room: RoomRef, limit: Long): Flow<List<ChatMessage>> {
        val live = roomMessages(room).orderBy("at", Query.Direction.DESCENDING).limit(limit).asFlow(includeMetadata = true).map { snap ->
            snap.documents.mapNotNull { d -> d.dataEstimated()?.toChatMessage(d.id, room.id, d.metadata.hasPendingWrites()) }
        }
        val legacy: Flow<List<ChatMessage>> = if (room is RoomRef.ChannelRoom) {
            observeCommunity(room.communityId).map { c -> c?.channels?.firstOrNull { it.id == room.channelId }?.legacyMessages.orEmpty() }
        } else {
            flowOf(emptyList())
        }
        val pending = outbox.observe().map { ops ->
            val uid = auth.currentUser?.uid.orEmpty()
            ops.filter { it.type == OutboxTypes.ROOM_MEDIA }.mapNotNull { op ->
                val p = try {
                    outbox.json.decodeFromString(RoomMediaPayload.serializer(), op.payload)
                } catch (_: Exception) {
                    null
                } ?: return@mapNotNull null
                val matches = when (room) {
                    is RoomRef.GroupRoom -> p.kind == "group" && p.roomId == room.id
                    is RoomRef.WorldRoom -> p.kind == "world" && p.roomId == room.id
                    is RoomRef.ChannelRoom -> p.kind == "channel" && p.roomId == room.communityId && p.channelId == room.channelId
                }
                if (!matches) return@mapNotNull null
                ChatMessage(
                    id = p.messageId, conversationId = room.id, senderId = uid, senderName = p.senderName, text = p.text,
                    type = if (p.files.size > 1) "media" else p.files.firstOrNull()?.type ?: "text",
                    attachments = p.files.map { com.animeblack.core.model.Attachment(it.type, it.downloadUrl ?: it.localUri, it.name, it.size) },
                    at = p.at, isPending = true, uploadProgress = op.progress,
                )
            }
        }
        return combine(live, legacy, pending) { l, old, p ->
            (old + l + p).distinctBy { it.id }.sortedBy { it.at }
        }
    }

    override suspend fun sendRoomMessage(room: RoomRef, text: String, attachments: List<LocalMedia>, replyTo: MessageQuote?): AppResult<Unit> = runCatchingApp(errorMapper) {
        val uid = auth.requireUid()
        val body = text.trim()
        if (body.isEmpty() && attachments.isEmpty()) throw AppErrorException(AppError.Validation("message", "empty"))
        if (body.length > 4_000) throw AppErrorException(AppError.Validation("message", "too-long"))
        val me = users.getUser(uid)
        val id = Ids.message()
        val now = System.currentTimeMillis()
        if (attachments.isNotEmpty()) {
            val folder = when (room) {
                is RoomRef.GroupRoom -> "groups/${room.id}/$uid"
                is RoomRef.ChannelRoom -> "communities/${room.communityId}/$uid"
                is RoomRef.WorldRoom -> "users/$uid/worlds/${room.id}"
            }
            val files = attachments.take(5).map { item ->
                val prepared = preparer.prepare(item)
                val media = (prepared as? AppResult.Success)?.data ?: throw AppErrorException(prepared.errorOrNull() ?: AppError.Unknown())
                val ext = Uri.parse(media.uri).lastPathSegment?.substringAfterLast('.', "bin") ?: "bin"
                UploadFile(media.uri, media.mimeType, media.type, media.name, media.sizeBytes, "$folder/${now}_${Ids.short().take(5)}.$ext", media.durationMs)
            }
            val payload = RoomMediaPayload(
                kind = when (room) {
                    is RoomRef.GroupRoom -> "group"
                    is RoomRef.WorldRoom -> "world"
                    is RoomRef.ChannelRoom -> "channel"
                },
                roomId = if (room is RoomRef.ChannelRoom) room.communityId else room.id,
                channelId = (room as? RoomRef.ChannelRoom)?.channelId,
                messageId = id,
                senderName = me?.displayName.orEmpty(),
                senderAvatar = me?.avatar.orEmpty(),
                text = body,
                at = now,
                files = files,
            )
            outbox.enqueue(OutboxTypes.ROOM_MEDIA, "room:$id", payload, RoomMediaPayload.serializer())
            return@runCatchingApp
        }
        val doc = buildMap<String, Any?> {
            put("id", id)
            put("uid", uid)
            put("senderId", uid)
            put("senderName", me?.displayName.orEmpty())
            put("senderAvatar", me?.avatar.orEmpty())
            put("text", body)
            put("type", "text")
            put("at", now)
            put("createdAt", now)
            put("st", 2)
            put("platform", "android")
            replyTo?.let { put("quote", mapOf("id" to it.id, "t" to it.text.take(60), "n" to it.senderName, "type" to it.type)) }
        }
        roomMessages(room).document(id).set(doc)
        if (room is RoomRef.GroupRoom) {
            groups.document(room.id).update(mapOf("lastMsg" to body.take(200), "lastAt" to now, "updatedAt" to now))
        }
        Unit
    }

    override suspend fun deleteRoomMessage(room: RoomRef, messageId: String): AppResult<Unit> = runCatchingApp(errorMapper) {
        roomMessages(room).document(messageId).delete()
        Unit
    }
}
