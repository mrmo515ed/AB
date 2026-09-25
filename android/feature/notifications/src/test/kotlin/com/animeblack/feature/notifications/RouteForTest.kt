package com.animeblack.feature.notifications

import com.animeblack.core.model.AppNotification
import com.animeblack.core.navigation.ChatRoomRoute
import com.animeblack.core.navigation.GroupRoomRoute
import com.animeblack.core.navigation.PostDetailRoute
import com.animeblack.core.navigation.ProfileRoute
import com.google.common.truth.Truth.assertThat
import org.junit.Test

class RouteForTest {
    private fun n(type: String, postId: String? = null, link: String? = null, from: String = "u2") =
        AppNotification(id = "n", userId = "me", fromUserId = from, type = type, postId = postId, link = link)

    @Test
    fun postNotificationsOpenThePost() {
        assertThat(routeFor(n("comment", postId = "p1"))).isEqualTo(PostDetailRoute("p1", focusComment = true))
        assertThat(routeFor(n("like", postId = "p1"))).isEqualTo(PostDetailRoute("p1", focusComment = false))
    }

    @Test
    fun linksAndTypesMapToScreens() {
        assertThat(routeFor(n("group_join_request", link = "groupRoom:g1"))).isEqualTo(GroupRoomRoute("g1"))
        assertThat(routeFor(n("system", link = "/?go=chatRoom&id=ch_a_b"))).isEqualTo(ChatRoomRoute(chatId = "ch_a_b"))
        assertThat(routeFor(n("follow"))).isEqualTo(ProfileRoute("u2"))
        assertThat(routeFor(n("message"))).isEqualTo(ChatRoomRoute(partnerId = "u2"))
        assertThat(routeFor(n("group_join_request"))).isNull()
    }
}
