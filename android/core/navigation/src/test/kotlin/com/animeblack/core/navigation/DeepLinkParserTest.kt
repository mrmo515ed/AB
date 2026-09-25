package com.animeblack.core.navigation

import com.google.common.truth.Truth.assertThat
import org.junit.Test

class DeepLinkParserTest {
    @Test
    fun parsesFcmGoLinks() {
        assertThat(DeepLinkParser.parse("/?go=chatRoom&id=ch_a_b")).isEqualTo(ChatRoomRoute(chatId = "ch_a_b"))
        assertThat(DeepLinkParser.parse("/?go=groupRoom&id=gr123")).isEqualTo(GroupRoomRoute("gr123"))
        assertThat(DeepLinkParser.parse("/?go=feed")).isEqualTo(HomeRoute)
        assertThat(DeepLinkParser.parse("/?go=chat")).isEqualTo(ChatListRoute)
    }

    @Test
    fun parsesCustomSchemeLinks() {
        assertThat(DeepLinkParser.parse("animeblack://post/p_1_abc")).isEqualTo(PostDetailRoute("p_1_abc"))
        assertThat(DeepLinkParser.parse("animeblack://user/u1")).isEqualTo(ProfileRoute("u1"))
        assertThat(DeepLinkParser.parse("animeblack://reel/r9")).isEqualTo(ReelViewerRoute("r9"))
    }

    @Test
    fun rejectsCraftedIdsAndForeignLinks() {
        assertThat(DeepLinkParser.parse("/?go=groupRoom&id=..%2F..%2Fusers")).isNull()
        assertThat(DeepLinkParser.parse("animeblack://post/" + "x".repeat(200))).isNull()
        assertThat(DeepLinkParser.parse("https://evil.example/?x=1")).isNull()
        assertThat(DeepLinkParser.parse("")).isNull()
        assertThat(DeepLinkParser.parse(null)).isNull()
        assertThat(DeepLinkParser.parse("/?go=unknownPage&id=1")).isNull()
    }
}
