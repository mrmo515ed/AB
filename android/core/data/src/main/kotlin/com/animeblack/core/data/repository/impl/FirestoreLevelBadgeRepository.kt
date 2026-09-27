package com.animeblack.core.data.repository.impl

import com.animeblack.core.data.firebase.Collections
import com.animeblack.core.data.firebase.asFlow
import com.animeblack.core.data.firebase.int
import com.animeblack.core.data.firebase.obj
import com.animeblack.core.data.firebase.str
import com.animeblack.core.data.repository.LevelBadgeRepository
import com.animeblack.core.model.DEFAULT_LEVEL_BADGES
import com.animeblack.core.model.DEFAULT_LEVEL_MAPPINGS
import com.animeblack.core.model.LevelBadge
import com.animeblack.core.model.LevelBadgeCatalog
import com.google.firebase.firestore.FirebaseFirestore
import javax.inject.Inject
import javax.inject.Singleton
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.onStart

@Singleton
class FirestoreLevelBadgeRepository @Inject constructor(
    private val firestore: FirebaseFirestore,
) : LevelBadgeRepository {

    override fun observeCatalog(): Flow<LevelBadgeCatalog> {
        val badges = firestore.collection(Collections.LEVEL_BADGES).asFlow()
            .map { snap -> snap.documents.mapNotNull { d -> d.data?.toLevelBadge(d.id) } }
            .onStart { emit(emptyList()) }
            .catch { emit(emptyList()) }
        val mappings = firestore.collection(Collections.LEVEL_MAPPINGS).document("active").asFlow()
            .map { doc -> doc.data?.let(::parseLevelMappings).orEmpty() }
            .onStart { emit(emptyMap()) }
            .catch { emit(emptyMap()) }
        // Same per-part fallback as the web's ensureLevelBadgesSystem().
        return combine(badges, mappings) { b, m ->
            LevelBadgeCatalog(badges = b.ifEmpty { DEFAULT_LEVEL_BADGES }, mappings = m.ifEmpty { DEFAULT_LEVEL_MAPPINGS })
        }.distinctUntilChanged()
    }
}

internal fun Map<String, Any?>.toLevelBadge(id: String): LevelBadge? {
    val image = str("image")
    if (image.isBlank()) return null
    return LevelBadge(
        id = str("id").ifBlank { id },
        name = str("name"),
        icon = str("icon"),
        color = str("color", "#F59E0B"),
        minLevel = int("minLevel"),
        image = image,
        description = str("desc").ifBlank { str("description") },
    )
}

/** `{ mappings: { "5": "lbadge_flame", … } }` → level → badge id. */
internal fun parseLevelMappings(doc: Map<String, Any?>): Map<Int, String> =
    doc.obj("mappings")?.mapNotNull { (level, badgeId) ->
        val lvl = level.toIntOrNull() ?: return@mapNotNull null
        (badgeId as? String)?.takeIf { it.isNotBlank() }?.let { lvl to it }
    }?.toMap().orEmpty()
