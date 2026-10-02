package com.animeblack.core.data.remote

import com.animeblack.core.common.config.AppConfig
import com.animeblack.core.common.dispatchers.AbDispatchers
import com.animeblack.core.common.dispatchers.Dispatcher
import com.animeblack.core.common.result.AppError
import com.animeblack.core.data.firebase.AppErrorException
import com.animeblack.core.datastore.SettingsDataSource
import com.animeblack.core.model.AgentAnswer
import com.animeblack.core.model.AgentSource
import javax.inject.Inject
import javax.inject.Singleton
import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.flow.map
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

/** Result of probing a server: is it reachable, and can it actually answer AI questions? */
data class ServerHealth(val reachable: Boolean, val agentReady: Boolean?)

/**
 * Client for the web server's Gemini search agent (`POST /api/gemini/search-agent`). The Gemini
 * key stays on the server — it is never shipped in the APK.
 *
 * The server address is taken from the in-app override (Settings → server) when the user set one,
 * otherwise from the build-time value. So a tester can point the installed APK at any server
 * without rebuilding it.
 */
@Singleton
class AgentApi @Inject constructor(
    private val client: OkHttpClient,
    private val config: AppConfig,
    private val settings: SettingsDataSource,
    @Dispatcher(AbDispatchers.IO) private val io: CoroutineDispatcher,
) {
    private val json = Json { ignoreUnknownKeys = true }

    /** Base URL currently in effect; emits again whenever the in-app override changes. */
    val baseUrl: Flow<String> = settings.settings
        .map { config.effectiveApiBaseUrl(it.apiBaseUrlOverride) }
        .distinctUntilChanged()

    /** True when [url] can be used for server calls (https, or localhost http in debug builds). */
    fun isConfigured(url: String): Boolean = config.isUsableServerUrl(url)

    suspend fun currentBaseUrl(): String = config.effectiveApiBaseUrl(settings.current().apiBaseUrlOverride)

    /** Token in effect: the one typed in Settings, otherwise the build-time value. */
    suspend fun currentToken(): String =
        settings.current().apiTokenOverride.trim().ifBlank { config.apiToken.trim() }

    /**
     * Cheap reachability probe used by the settings screen (`GET /api/health`).
     * [ServerHealth.agentReady] is null for older servers that do not report it.
     */
    suspend fun health(url: String? = null): ServerHealth = withContext(io) {
        val target = url?.trim()?.trimEnd('/').takeUnless { it.isNullOrEmpty() } ?: currentBaseUrl()
        if (!isConfigured(target)) return@withContext ServerHealth(reachable = false, agentReady = null)
        runCatching {
            client.newCall(Request.Builder().url("$target/api/health").get().build()).execute().use { response ->
                if (!response.isSuccessful) return@withContext ServerHealth(reachable = false, agentReady = null)
                val body = runCatching { json.parseToJsonElement(response.body.string()).jsonObject }.getOrNull()
                val agent = body?.get("agent") as? JsonObject
                val ready = agent?.get("configured")?.toString()?.trim('"')?.toBooleanStrictOrNull()
                ServerHealth(reachable = true, agentReady = ready)
            }
        }.getOrDefault(ServerHealth(reachable = false, agentReady = null))
    }

    suspend fun ask(prompt: String, mode: String, history: List<Pair<String, String>>): AgentAnswer = withContext(io) {
        val base = currentBaseUrl()
        if (!isConfigured(base)) throw AppErrorException(AppError.Validation("agent", "not-configured"))
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
        val request = try {
            Request.Builder()
                .url("$base/api/gemini/search-agent")
                .apply { val token = currentToken(); if (token.isNotBlank()) header("x-ab-token", token) }
                .post(body)
                .build()
        } catch (e: IllegalArgumentException) {
            throw AppErrorException(AppError.Validation("agent", "invalid-server-url"))
        }
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
