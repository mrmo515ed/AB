package com.animeblack.core.data.mapper

import com.animeblack.core.model.MessageStatus
import com.google.common.truth.Truth.assertThat
import org.junit.Test

/** Documents written by the web app must map losslessly into the native models. */
class WebCompatMapperTest {
    @Test
    fun mapsWebChatMessage() {
        val doc = mapOf(
            "id" to "m1", "senderId" to "a", "senderName" to "Ann", "text" to "hi", "at" to 123L, "st" to 4L,
            "reacts" to listOf("heart"), "reactions" to mapOf("b" to "love"),
            "quote" to mapOf("id" to "m0", "t" to "previous", "n" to "Bob", "type" to "text"),
            "attachments" to listOf(mapOf("type" to "image", "src" to "https://x/y.jpg", "path" to "chats/c/a/1.jpg", "size" to 10L)),
            "deletedFor" to listOf("z"),
        )
        val m = doc.toChatMessage("m1", "c")
        assertThat(m.status).isEqualTo(MessageStatus.Read)
        assertThat(m.legacyReacts).containsExactly("heart")
        assertThat(m.reactions).containsExactly("b", "love")
        assertThat(m.replyTo?.senderName).isEqualTo("Bob")
        assertThat(m.attachments.single().storagePath).isEqualTo("chats/c/a/1.jpg")
        assertThat(m.isVisibleTo("z")).isFalse()
    }

    @Test
    fun mapsLegacyStatusStringsAndSingleSrc() {
        val m = mapOf("sender" to "a", "status" to "seen", "src" to "https://x/v.mp4", "type" to "video", "createdAt" to 5L).toChatMessage("m2", "c")
        assertThat(m.senderId).isEqualTo("a")
        assertThat(m.status).isEqualTo(MessageStatus.Read)
        assertThat(m.attachments.single().type).isEqualTo("video")
        assertThat(m.at).isEqualTo(5L)
    }

    @Test
    fun conversationPartnerFallsBackToCanonicalId() {
        val c = mapOf("participants" to emptyList<String>(), "last" to "yo", "unreadCounts" to mapOf("a" to 2L)).toConversation("ch_a_b", "a")
        assertThat(c.partnerId).isEqualTo("b")
        assertThat(c.unreadFor("a")).isEqualTo(2)
    }

    @Test
    fun gameProfileReadsWebHunterFields() {
        val p = mapOf("profile" to mapOf("hunterLevel" to 3L, "hunterXp" to 40L, "coins" to 900L, "gems" to 12L, "equippedCharacterId" to "c_luna"))
            .toGameProfile("u")
        assertThat(p.level).isEqualTo(3)
        assertThat(p.gold).isEqualTo(900L)
        assertThat(p.gems).isEqualTo(12L)
        assertThat(p.selectedCharacter).isEqualTo("c_luna")
        assertThat(emptyMap<String, Any?>().toGameProfile("u").selectedCharacter).isEqualTo("c_ren")
    }
}
