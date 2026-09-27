package com.animeblack.core.data.mapper

import com.animeblack.core.data.repository.impl.parseLevelMappings
import com.animeblack.core.data.repository.impl.toLevelBadge
import com.google.common.truth.Truth.assertThat
import org.junit.Test

class LevelBadgeMapperTest {
    @Test
    fun parsesActiveLevelMappings() {
        val m = parseLevelMappings(mapOf("mappings" to mapOf("5" to "b1", "x" to "b2", "7" to "", "10" to "b3")))
        assertThat(m).containsExactly(5, "b1", 10, "b3")
        assertThat(parseLevelMappings(emptyMap())).isEmpty()
    }

    @Test
    fun mapsWebEditorBadgesAndSkipsImagelessOnes() {
        val b = mapOf("id" to "lbadge_x", "name" to "شارة", "desc" to "وصف", "image" to "data:image/png;base64,AAAA", "color" to "#FF0055").toLevelBadge("doc")
        assertThat(b?.id).isEqualTo("lbadge_x")
        assertThat(b?.description).isEqualTo("وصف")
        assertThat(mapOf("name" to "no image").toLevelBadge("doc")).isNull()
    }
}
