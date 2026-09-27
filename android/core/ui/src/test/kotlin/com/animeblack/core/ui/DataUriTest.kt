package com.animeblack.core.ui

import com.google.common.truth.Truth.assertThat
import org.junit.Test

class DataUriTest {
    @Test
    fun percentDecodingKeepsPlusAndDecodesHashes() {
        assertThat(percentDecode("<svg fill='%23FFF'>a+b</svg>")).isEqualTo("<svg fill='#FFF'>a+b</svg>")
        assertThat(percentDecode("%E2%9C%93 ok %zz")).isEqualTo("\u2713 ok %zz")
        assertThat(percentDecode("plain")).isEqualTo("plain")
    }

    @Test
    fun decodesUtf8SvgDataUrls() {
        val bytes = decodeDataUri("data:image/svg+xml;utf8,<svg%20x='1'/>")
        assertThat(bytes?.toString(Charsets.UTF_8)).isEqualTo("<svg x='1'/>")
        assertThat(decodeDataUri("not-a-data-url")).isNull()
    }
}
