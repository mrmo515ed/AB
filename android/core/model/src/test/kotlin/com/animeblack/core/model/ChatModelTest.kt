package com.animeblack.core.model

import com.google.common.truth.Truth.assertThat
import org.junit.Test

class ChatModelTest {
    @Test
    fun canonicalIdIsOrderIndependent() {
        assertThat(Conversation.canonicalId("b", "a")).isEqualTo("ch_a_b")
        assertThat(Conversation.canonicalId("a", "b")).isEqualTo("ch_a_b")
    }

    @Test
    fun partnerFromIdHandlesBothPositions() {
        assertThat(Conversation.partnerFromId("ch_alice_bob", "alice")).isEqualTo("bob")
        assertThat(Conversation.partnerFromId("ch_alice_bob", "bob")).isEqualTo("alice")
        assertThat(Conversation.partnerFromId("ch_alice_bob", "carol")).isNull()
        assertThat(Conversation.partnerFromId("group_1", "alice")).isNull()
    }

    @Test
    fun unreadPrefersCounterAndFallsBackToReadMarkers() {
        val c = Conversation("ch_a_b", listOf("a", "b"), "b", lastAt = 100, lastSenderId = "b", unreadCounts = mapOf("a" to 3))
        assertThat(c.unreadFor("a")).isEqualTo(3)
        val web = c.copy(unreadCounts = emptyMap(), readBy = mapOf("a" to 50L))
        assertThat(web.unreadFor("a")).isEqualTo(1)
        assertThat(web.copy(readBy = mapOf("a" to 150L)).unreadFor("a")).isEqualTo(0)
        assertThat(web.copy(lastSenderId = "a").unreadFor("a")).isEqualTo(0)
    }

    @Test
    fun typingIndicatorExpiresAndIgnoresOwnTyping() {
        val c = Conversation("ch_a_b", listOf("a", "b"), "b", typing = mapOf("b" to 1_000L))
        assertThat(c.isPartnerTyping(now = 2_000L, myUid = "a")).isTrue()
        assertThat(c.isPartnerTyping(now = 1_000L + Conversation.TYPING_TIMEOUT_MS + 1, myUid = "a")).isFalse()
        assertThat(c.isPartnerTyping(now = 2_000L, myUid = "b")).isFalse()
    }

    @Test
    fun reactionSummaryMergesNativeAndLegacyReactions() {
        val m = ChatMessage("1", "c", "a", reactions = mapOf("x" to "love", "y" to "love", "z" to "fire"), legacyReacts = listOf("love"))
        assertThat(m.reactionSummary()).containsExactly("love", 3, "fire", 1)
    }

    @Test
    fun deleteForMeOnlyHidesForThatUserAndOwnershipUsesSenderId() {
        val m = ChatMessage("1", "c", senderId = "a", deletedFor = listOf("b"))
        assertThat(m.isVisibleTo("b")).isFalse()
        assertThat(m.isVisibleTo("a")).isTrue()
        assertThat(m.isMine("a")).isTrue()
        assertThat(m.isMine("b")).isFalse()
    }

    @Test
    fun messageStatusCodesMatchTheWeb() {
        assertThat(MessageStatus.fromCode(1)).isEqualTo(MessageStatus.Sending)
        assertThat(MessageStatus.fromCode(4)).isEqualTo(MessageStatus.Read)
        assertThat(MessageStatus.fromCode(5)).isEqualTo(MessageStatus.Failed)
        assertThat(MessageStatus.fromCode(null)).isEqualTo(MessageStatus.Sent)
        assertThat(MessageStatus.fromCode(99)).isEqualTo(MessageStatus.Sent)
    }

    @Test
    fun gameEnergyRegeneratesOnePointEveryEightMinutesUpToMax() {
        val p = GameProfile(uid = "u", energy = 10, maxEnergy = 50, lastEnergyUpdate = 0)
        assertThat(p.currentEnergy(GameProfile.ENERGY_REGEN_MS * 3)).isEqualTo(13)
        assertThat(p.currentEnergy(GameProfile.ENERGY_REGEN_MS * 100)).isEqualTo(50)
        assertThat(p.currentEnergy(-5)).isEqualTo(10)
    }

    @Test
    fun dailyRewardCooldownMatchesCloudFunction() {
        val w = Wallet(lastDailyClaim = 1_000L)
        assertThat(w.canClaimDaily(1_000L + Wallet.DAILY_COOLDOWN_MS - 1)).isFalse()
        assertThat(w.canClaimDaily(1_000L + Wallet.DAILY_COOLDOWN_MS)).isTrue()
    }
}
