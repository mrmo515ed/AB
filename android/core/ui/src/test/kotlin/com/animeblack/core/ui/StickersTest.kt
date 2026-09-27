package com.animeblack.core.ui

import com.animeblack.core.ui.chat.STICKER_PACKS
import com.animeblack.core.ui.chat.encodeUriComponent
import com.animeblack.core.ui.chat.makeAnimeStickerSvg
import com.google.common.truth.Truth.assertThat
import org.junit.Test

class StickersTest {
    @Test
    fun encodeUriComponentMatchesJavaScript() {
        assertThat(encodeUriComponent("a b!'()*~-_.")).isEqualTo("a%20b!'()*~-_.")
        assertThat(encodeUriComponent("ن#&=")).isEqualTo("%D9%86%23%26%3D")
    }

    @Test
    fun stickerSvgRoundTripsThroughTheDataUrlDecoder() {
        val url = makeAnimeStickerSvg("stk_luffy_g5", "لوفي", "#F59E0B", "#EF4444", "", "نيكا!", "لوفي إله الشمس", "gold")
        assertThat(url).startsWith("data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22")
        val svg = decodeDataUri(url)!!.toString(Charsets.UTF_8)
        assertThat(svg).contains("grad_stkluffyg5")
        assertThat(svg).contains("stroke=\"#fbbf24\"")
        assertThat(svg).contains("نيكا!")
    }

    @Test
    fun packsMatchTheWebCatalogue() {
        assertThat(STICKER_PACKS.map { it.id }).containsExactly("legends", "reactions", "chibi", "badges").inOrder()
        assertThat(STICKER_PACKS.sumOf { it.items.size }).isEqualTo(42)
        assertThat(STICKER_PACKS.flatMap { it.items }.map { it.id }.toSet().size).isEqualTo(42)
    }
}
