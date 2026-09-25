package com.animeblack.core.ui

import com.animeblack.core.model.ChatMessage
import com.animeblack.core.ui.chat.ChatListItem
import com.animeblack.core.ui.chat.buildChatItems
import com.google.common.truth.Truth.assertThat
import java.util.Calendar
import org.junit.Test

class ChatItemsAndFormattingTest {
    private fun at(day: Int, hour: Int, minute: Int = 0): Long = Calendar.getInstance().apply {
        set(2026, Calendar.MARCH, day, hour, minute, 0)
        set(Calendar.MILLISECOND, 0)
    }.timeInMillis

    private fun msg(id: String, sender: String, at: Long) = ChatMessage(id = id, conversationId = "c", senderId = sender, text = id, at = at)

    private fun shape(items: List<ChatListItem>) = items.map { if (it is ChatListItem.Day) "D" else (it as ChatListItem.Message).message.id }

    @Test
    fun buildsNewestFirstWithDaySeparatorsAndGrouping() {
        val items = buildChatItems(listOf(msg("1", "a", at(1, 10)), msg("2", "a", at(1, 10, 2)), msg("3", "b", at(2, 9))))
        assertThat(shape(items)).containsExactly("3", "D", "2", "1", "D").inOrder()
        assertThat((items[2] as ChatListItem.Message).grouped).isTrue()
        assertThat((items[3] as ChatListItem.Message).grouped).isFalse()
        assertThat((items[0] as ChatListItem.Message).grouped).isFalse()
    }

    @Test
    fun senderChangeOrLongGapBreaksGrouping() {
        val items = buildChatItems(listOf(msg("1", "a", at(3, 10)), msg("2", "b", at(3, 10, 1)), msg("3", "b", at(3, 10, 30))))
        val byId = items.filterIsInstance<ChatListItem.Message>().associateBy { it.message.id }
        assertThat(byId.getValue("2").grouped).isFalse()
        assertThat(byId.getValue("3").grouped).isFalse()
    }

    @Test
    fun keysAreUniqueForLazyLists() {
        val items = buildChatItems((1..50).map { msg("m$it", if (it % 3 == 0) "a" else "b", at(1 + it / 20, 8, it % 60)) })
        assertThat(items.map { it.key }.toSet().size).isEqualTo(items.size)
    }

    @Test
    fun formatsDurationsAndCounts() {
        assertThat(formatDuration(0)).isEqualTo("0:00")
        assertThat(formatDuration(65_000)).isEqualTo("1:05")
        assertThat(formatDuration(3_725_000)).isEqualTo("1:02:05")
        assertThat(compactCount(999)).isEqualTo("999")
        assertThat(compactCount(1_500)).isEqualTo("1.5K")
        assertThat(compactCount(2_000_000L)).isEqualTo("2M")
    }
}
