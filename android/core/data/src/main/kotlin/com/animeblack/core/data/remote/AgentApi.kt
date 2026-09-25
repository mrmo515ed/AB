package com.animeblack.core.data.remote

import com.animeblack.core.common.config.AppConfig
import com.animeblack.core.common.dispatchers.AbDispatchers
import com.animeblack.core.common.dispatchers.Dispatcher
import com.animeblack.core.common.result.AppError
import com.animeblack.core.data.firebase.AppErrorException
import com.animeblack.core.model.AgentAnswer
import com.animeblack.core.model.AgentSource
import javax.inject.Inject
import javax.inject.Singleton
import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.withContext
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.add
import kotlinx.serialization.json.addJsonObject
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.put
import kotlinx.serialization.json.putJsonArray
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody

/**
 * Client for the web server's Gemini search agent (`POST /api/gemini/search-agent`). The Gemini
 * key stays on the server — it is never shipped in the APK.
 */
@Singleton
class AgentApi @Inject constructor(
    private val client: OkHttpClient,
    private val config: AppConfig,
    @Dispatcher(AbDispatchers.IO) private val io: CoroutineDispatcher,
) {
    private val json = Json { ignoreUnknownKeys = true }

    val isConfigured: Boolean get() = config.hasApiServer

    suspend fun ask(prompt: String, mode: String, history: List<Pair<String, String>>): AgentAnswer = withContext(io) {
        if (!config.hasApiServer) throw AppErrorException(AppError.Validation("agent", "not-configured"))
        val body = buildJsonObject {
            put("prompt", prompt)
            put("mode", mode)
            putJsonArray("history") {
                history.takeLast(6).forEach { (role, text) ->
                    addJsonObject {
                        put("role", role)
                        put("text", text)
                    }
                }
            }
        }.toString().toRequestBody("application/json; charset=utf-8".toMediaType())
        val request = Request.Builder()
            .url(config.apiBaseUrl.trimEnd('/') + "/api/gemini/search-agent")
            .post(body)
            .build()
        client.newCall(request).execute().use { response ->
            val root = runCatching { json.parseToJsonElement(response.body.string()).jsonObject }.getOrNull() ?: JsonObject(emptyMap())
            if (!response.isSuccessful || root.str("success") == "false") {
                val code = root.str("code")
                throw AppErrorException(
                    if (code == "QUOTA_EXHAUSTED" || response.code == 429) AppError.RateLimited() else AppError.Server(code.ifBlank { "HTTP ${response.code}" }, root.str("error")),
                )
            }
            AgentAnswer(
                answer = root.str("text"),
                sources = root.arr("citations")?.mapNotNull { (it as? JsonObject)?.let { c -> AgentSource(c.str("title"), c.str("url")) } }.orEmpty(),
                mode = root.str("mode").ifBlank { mode },
            )
        }
    }
}
