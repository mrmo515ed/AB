package com.animeblack.core.data.mapper

import com.animeblack.core.data.firebase.bool
import com.animeblack.core.data.firebase.countOf
import com.animeblack.core.data.firebase.firstLong
import com.animeblack.core.data.firebase.firstStr
import com.animeblack.core.data.firebase.int
import com.animeblack.core.data.firebase.long
import com.animeblack.core.data.firebase.mapList
import com.animeblack.core.data.firebase.str
import com.animeblack.core.data.firebase.strList
import com.animeblack.core.data.firebase.strOrNull
import com.animeblack.core.model.Community
import com.animeblack.core.model.CommunityChannel
import com.animeblack.core.model.Group
import com.animeblack.core.model.World

internal fun Map<String, Any?>.toGroup(id: String): Group {
    val members = strList("members")
    return Group(
        id = str("id").ifBlank { id },
        name = str("name"),
        description = str("desc").ifBlank { str("description") },
        icon = str("icon", "users"),
        color1 = str("c1", "#0E7490"),
        color2 = str("c2", "#00A3FF"),
        privacy = str("privacy", Group.PRIVACY_PUBLIC).ifBlank { Group.PRIVACY_PUBLIC },
        members = members,
        memberUids = strList("memberUids"),
        admins = strList("admins"),
        ownerId = firstStr("creatorUid", "creatorId", "owner", "ownerId"),
        announceOnly = bool("announce"),
        slowModeSec = int("slow"),
        pinnedText = strOrNull("pinned"),
        lastMessage = str("lastMsg"),
        lastAt = firstLong("lastAt", "updatedAt", "createdAt"),
        createdAt = firstLong("createdAt", "at"),
    )
}

internal fun Map<String, Any?>.toWorld(id: String): World = World(
    id = str("id").ifBlank { id },
    name = str("name"),
    description = str("desc").ifBlank { str("description") },
    icon = str("icon", "globe"),
    color1 = str("c1", "#0C4A6E"),
    color2 = str("c2", "#0EA5E9"),
    theme = str("theme"),
    membersCount = maxOf(countOf("members"), strList("memberUids").size),
    memberUids = strList("memberUids"),
    onlineCount = countOf("online"),
    ownerId = firstStr("owner", "ownerId", "creatorUid"),
    rules = strList("rules"),
    pinnedText = strOrNull("pinned"),
    closed = bool("closed"),
    createdAt = firstLong("createdAt", "at"),
)

internal fun Map<String, Any?>.toCommunity(id: String): Community {
    val cid = str("id").ifBlank { id }
    return Community(
        id = cid,
        name = str("name"),
        description = str("desc").ifBlank { str("description") },
        tag = str("tag"),
        focus = str("focus"),
        icon = str("icon"),
        avatar = str("avatar").ifBlank { str("img") },
        cover = str("cover"),
        color1 = str("c1", "#312E81"),
        color2 = str("c2", "#818CF8"),
        membersCount = maxOf(countOf("members"), strList("memberUids").size),
        memberUids = strList("memberUids"),
        ownerId = firstStr("ownerUid", "ownerId", "owner"),
        adminUids = strList("adminUids"),
        isVerified = bool("isVerified") || bool("verified"),
        joinMode = str("joinMode"),
        visibility = str("visibility", "public"),
        channels = mapList("channels").mapIndexed { i, ch ->
            val chId = ch.str("id").ifBlank { "ch$i" }
            CommunityChannel(
                id = chId,
                name = ch.str("name").ifBlank { ch.str("n") },
                description = ch.str("desc"),
                legacyMessages = ch.mapList("messages").mapIndexed { j, m ->
                    m.toChatMessage(m.str("id").ifBlank { "legacy_${chId}_$j" }, "$cid/$chId")
                },
            )
        },
        treasury = long("treasury"),
        level = int("level", 1),
        createdAt = firstLong("createdAt", "at"),
    )
}
