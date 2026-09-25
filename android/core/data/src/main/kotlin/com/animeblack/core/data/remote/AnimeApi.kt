package com.animeblack.core.data.remote

import com.animeblack.core.common.dispatchers.AbDispatchers
import com.animeblack.core.common.dispatchers.Dispatcher
import com.animeblack.core.model.AnimeCharacter
import com.animeblack.core.model.AnimeItem
import java.io.IOException
import java.util.Calendar
import javax.inject.Inject
import javax.inject.Singleton
import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.withContext
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonNull
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.contentOrNull
import kotlinx.serialization.json.doubleOrNull
import kotlinx.serialization.json.intOrNull
import kotlinx.serialization.json.jsonArray
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import kotlinx.serialization.json.longOrNull
import kotlinx.serialization.json.put
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody

/**
 * AniList GraphQL (primary) with Jikan (MyAnimeList) fallback — the same public providers the web
 * server uses (the `/api/anime` routes), called directly so the app works without the Node server.
 */
@Singleton
class AnimeApi @Inject constructor(
    private val client: OkHttpClient,
    @Dispatcher(AbDispatchers.IO) private val io: CoroutineDispatcher,
) {
    private val json = Json { ignoreUnknownKeys = true }
    private val jsonMedia = "application/json; charset=utf-8".toMediaType()

    private val mediaFields = """
        id title { romaji english native } coverImage { extraLarge large } bannerImage averageScore
        episodes chapters status format season seasonYear genres type
        studios(isMain: true) { nodes { name } } description(asHtml: false) siteUrl
        nextAiringEpisode { episode airingAt }
    """.trimIndent()

    suspend fun aniListTrending(page: Int): List<AnimeItem> = aniListPage(
        "query (\$page: Int) { Page(page: \$page, perPage: 24) { media(type: ANIME, sort: TRENDING_DESC, isAdult: false) { $mediaFields } } }",
        buildJsonObject { put("page", page) },
    )

    suspend fun aniListSeasonal(): List<AnimeItem> {
        val cal = Calendar.getInstance()
        val season = when (cal.get(Calendar.MONTH)) {
            in 0..2 -> "WINTER"
            in 3..5 -> "SPRING"
            in 6..8 -> "SUMMER"
            else -> "FALL"
        }
        return aniListPage(
            "query (\$season: MediaSeason, \$year: Int) { Page(page: 1, perPage: 30) { media(season: \$season, seasonYear: \$year, type: ANIME, sort: POPULARITY_DESC, isAdult: false) { $mediaFields } } }",
            buildJsonObject {
                put("season", season)
                put("year", cal.get(Calendar.YEAR))
            },
        )
    }

    suspend fun aniListSearch(query: String, type: String): List<AnimeItem> = aniListPage(
        "query (\$search: String, \$type: MediaType) { Page(page: 1, perPage: 30) { media(search: \$search, type: \$type, sort: SEARCH_MATCH, isAdult: false) { $mediaFields } } }",
        buildJsonObject {
            put("search", query)
            put("type", type)
        },
    )

    suspend fun aniListDetail(id: String, type: String): AnimeItem? {
        val query = "query (\$id: Int, \$type: MediaType) { Media(id: \$id, type: \$type) { $mediaFields characters(sort: ROLE, perPage: 16) { edges { role node { id name { full } image { medium } } } } } }"
        val data = aniList(query, buildJsonObject {
            put("id", id.toIntOrNull() ?: 0)
            put("type", type)
        })
        return data?.obj("Media")?.let { parseAniList(it, includeCharacters = true) }
    }

    private suspend fun aniListPage(query: String, variables: JsonObject): List<AnimeItem> {
        val data = aniList(query, variables) ?: return emptyList()
        return data.obj("Page")?.arr("media")?.mapNotNull { (it as? JsonObject)?.let { m -> parseAniList(m, false) } }.orEmpty()
    }

    private suspend fun aniList(query: String, variables: JsonObject): JsonObject? = withContext(io) {
        val body = buildJsonObject {
            put("query", query)
            put("variables", variables)
        }.toString().toRequestBody(jsonMedia)
        val request = Request.Builder().url("https://graphql.anilist.co").post(body)
            .header("Accept", "application/json").build()
        client.newCall(request).execute().use { response ->
            if (!response.isSuccessful) throw IOException("AniList HTTP ${response.code}")
            val root = json.parseToJsonElement(response.body.string()).jsonObject
            root.obj("data")
        }
    }

    private fun parseAniList(m: JsonObject, includeCharacters: Boolean): AnimeItem {
        val title = m.obj("title")
        val cover = m.obj("coverImage")
        val next = m.obj("nextAiringEpisode")
        return AnimeItem(
            id = m.str("id"),
            title = title?.str("english")?.ifBlank { null } ?: title?.str("romaji").orEmpty(),
            titleNative = title?.str("native").orEmpty(),
            coverUrl = cover?.str("extraLarge")?.ifBlank { null } ?: cover?.str("large").orEmpty(),
            bannerUrl = m.str("bannerImage"),
            score = m.double("averageScore")?.div(10.0),
            episodes = m.int("episodes"),
            chapters = m.int("chapters"),
            status = m.str("status"),
            format = m.str("format"),
            season = m.str("season"),
            year = m.int("seasonYear"),
            genres = m.arr("genres")?.mapNotNull { (it as? JsonPrimitive)?.contentOrNull }.orEmpty(),
            studios = m.obj("studios")?.arr("nodes")?.mapNotNull { (it as? JsonObject)?.str("name") }.orEmpty(),
            description = m.str("description").replace(Regex("<[^>]+>"), "").trim(),
            siteUrl = m.str("siteUrl"),
            characters = if (includeCharacters) {
                m.obj("characters")?.arr("edges")?.mapNotNull { e ->
                    val edge = e as? JsonObject ?: return@mapNotNull null
                    val node = edge.obj("node") ?: return@mapNotNull null
                    AnimeCharacter(node.str("id"), node.obj("name")?.str("full").orEmpty(), node.obj("image")?.str("medium").orEmpty(), edge.str("role"))
                }.orEmpty()
            } else {
                emptyList()
            },
            nextEpisode = next?.int("episode"),
            nextAiringAt = next?.long("airingAt")?.times(1000),
            source = "anilist",
            mediaType = m.str("type").ifBlank { "ANIME" },
        )
    }

    // ------------------------------------------------------------------ Jikan fallback
    suspend fun jikanTop(): List<AnimeItem> = jikanList("https://api.jikan.moe/v4/top/anime?filter=airing&limit=24&sfw=true", "ANIME")

    suspend fun jikanSearch(query: String, type: String): List<AnimeItem> {
        val kind = if (type == "MANGA") "manga" else "anime"
        val q = java.net.URLEncoder.encode(query, "UTF-8")
        return jikanList("https://api.jikan.moe/v4/$kind?q=$q&limit=24&sfw=true", type)
    }

    suspend fun jikanDetail(id: String, type: String): AnimeItem? = withContext(io) {
        val kind = if (type == "MANGA") "manga" else "anime"
        val request = Request.Builder().url("https://api.jikan.moe/v4/$kind/$id/full").build()
        client.newCall(request).execute().use { response ->
            if (!response.isSuccessful) return@withContext null
            json.parseToJsonElement(response.body.string()).jsonObject.obj("data")?.let { parseJikan(it, type) }
        }
    }

    private suspend fun jikanList(url: String, type: String): List<AnimeItem> = withContext(io) {
        val request = Request.Builder().url(url).build()
        client.newCall(request).execute().use { response ->
            if (!response.isSuccessful) throw IOException("Jikan HTTP ${response.code}")
            json.parseToJsonElement(response.body.string()).jsonObject.arr("data")
                ?.mapNotNull { (it as? JsonObject)?.let { m -> parseJikan(m, type) } }.orEmpty()
        }
    }

    private fun parseJikan(m: JsonObject, type: String): AnimeItem {
        val images = m.obj("images")?.obj("webp") ?: m.obj("images")?.obj("jpg")
        return AnimeItem(
            id = m.str("mal_id"),
            title = m.str("title_english").ifBlank { m.str("title") },
            titleNative = m.str("title_japanese"),
            coverUrl = images?.str("large_image_url")?.ifBlank { null } ?: images?.str("image_url").orEmpty(),
            score = m.double("score"),
            episodes = m.int("episodes"),
            chapters = m.int("chapters"),
            status = m.str("status"),
            format = m.str("type"),
            season = m.str("season").uppercase(),
            year = m.int("year"),
            genres = m.arr("genres")?.mapNotNull { (it as? JsonObject)?.str("name") }.orEmpty(),
            studios = m.arr("studios")?.mapNotNull { (it as? JsonObject)?.str("name") }.orEmpty(),
            description = m.str("synopsis"),
            siteUrl = m.str("url"),
            source = "jikan",
            mediaType = type,
        )
    }
}

internal fun JsonObject.obj(key: String): JsonObject? = (this[key] as? JsonObject)
internal fun JsonObject.arr(key: String): JsonArray? = (this[key] as? JsonArray)
internal fun JsonObject.str(key: String): String = when (val v = this[key]) {
    null, is JsonNull -> ""
    is JsonPrimitive -> v.contentOrNull.orEmpty()
    else -> v.toString()
}
internal fun JsonObject.int(key: String): Int? = (this[key] as? JsonPrimitive)?.intOrNull
internal fun JsonObject.long(key: String): Long? = (this[key] as? JsonPrimitive)?.longOrNull
internal fun JsonObject.double(key: String): Double? = (this[key] as? JsonPrimitive)?.doubleOrNull
internal fun JsonElement.asObj(): JsonObject? = this as? JsonObject
