package com.animeblack.core.datastore

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.emptyPreferences
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.core.stringSetPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import com.animeblack.core.model.SavedAccount
import dagger.hilt.android.qualifiers.ApplicationContext
import java.io.IOException
import java.util.UUID
import javax.inject.Inject
import javax.inject.Singleton
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map
import kotlinx.serialization.Serializable
import kotlinx.serialization.builtins.ListSerializer
import kotlinx.serialization.builtins.MapSerializer
import kotlinx.serialization.builtins.serializer
import kotlinx.serialization.json.Json

private val Context.animeBlackDataStore: DataStore<Preferences> by preferencesDataStore(name = "anime_black_settings")

/**
 * Single DataStore for device-local preferences, saved accounts (no credentials) and drafts.
 * Corruption / IO errors degrade to defaults instead of crashing.
 */
@Singleton
class SettingsDataSource @Inject constructor(
    @ApplicationContext private val context: Context,
) {
    private val store get() = context.animeBlackDataStore
    private val json = Json { ignoreUnknownKeys = true }

    private object Keys {
        val amoled = booleanPreferencesKey("amoled")
        val notifications = booleanPreferencesKey("notifications")
        val chatNotifications = booleanPreferencesKey("chat_notifications")
        val groupNotifications = booleanPreferencesKey("group_notifications")
        val socialNotifications = booleanPreferencesKey("social_notifications")
        val sound = booleanPreferencesKey("sound")
        val haptics = booleanPreferencesKey("haptics")
        val autoplay = booleanPreferencesKey("autoplay")
        val dataSaver = booleanPreferencesKey("data_saver")
        val analytics = booleanPreferencesKey("analytics")
        val crashReports = booleanPreferencesKey("crash_reports")
        val reduceMotion = booleanPreferencesKey("reduce_motion")
        val showOnline = booleanPreferencesKey("show_online")
        val readReceipts = booleanPreferencesKey("read_receipts")
        val onboarding = booleanPreferencesKey("onboarding_done")
        val mutedChats = stringSetPreferencesKey("muted_chats")
        val pinnedChats = stringSetPreferencesKey("pinned_chats")
        val archivedChats = stringSetPreferencesKey("archived_chats")
        val hiddenPosts = stringSetPreferencesKey("hidden_posts")
        val savedAccounts = stringPreferencesKey("saved_accounts")
        val chatDrafts = stringPreferencesKey("chat_drafts")
        val postDraft = stringPreferencesKey("post_draft")
        val deviceId = stringPreferencesKey("device_id")
        val sessionId = stringPreferencesKey("session_id")
    }

    private val safeData: Flow<Preferences> = store.data.catch { e ->
        if (e is IOException) emit(emptyPreferences()) else throw e
    }

    val settings: Flow<AppSettings> = safeData.map { it.toSettings() }

    private fun Preferences.toSettings(): AppSettings = AppSettings(
        amoled = this[Keys.amoled] ?: true,
        notificationsEnabled = this[Keys.notifications] ?: true,
        chatNotifications = this[Keys.chatNotifications] ?: true,
        groupNotifications = this[Keys.groupNotifications] ?: true,
        socialNotifications = this[Keys.socialNotifications] ?: true,
        soundEnabled = this[Keys.sound] ?: true,
        hapticsEnabled = this[Keys.haptics] ?: true,
        autoplayVideos = this[Keys.autoplay] ?: true,
        dataSaver = this[Keys.dataSaver] ?: false,
        analyticsEnabled = this[Keys.analytics] ?: true,
        crashReportsEnabled = this[Keys.crashReports] ?: true,
        reduceMotion = this[Keys.reduceMotion] ?: false,
        showOnlineStatus = this[Keys.showOnline] ?: true,
        readReceipts = this[Keys.readReceipts] ?: true,
        onboardingDone = this[Keys.onboarding] ?: false,
        mutedChats = this[Keys.mutedChats] ?: emptySet(),
        pinnedChats = this[Keys.pinnedChats] ?: emptySet(),
        archivedChats = this[Keys.archivedChats] ?: emptySet(),
        hiddenPosts = this[Keys.hiddenPosts] ?: emptySet(),
    )

    suspend fun current(): AppSettings = settings.first()

    suspend fun update(transform: (AppSettings) -> AppSettings) {
        store.edit { p ->
            val cur = p.toSettings()
            val next = transform(cur)
            p[Keys.amoled] = next.amoled
            p[Keys.notifications] = next.notificationsEnabled
            p[Keys.chatNotifications] = next.chatNotifications
            p[Keys.groupNotifications] = next.groupNotifications
            p[Keys.socialNotifications] = next.socialNotifications
            p[Keys.sound] = next.soundEnabled
            p[Keys.haptics] = next.hapticsEnabled
            p[Keys.autoplay] = next.autoplayVideos
            p[Keys.dataSaver] = next.dataSaver
            p[Keys.analytics] = next.analyticsEnabled
            p[Keys.crashReports] = next.crashReportsEnabled
            p[Keys.reduceMotion] = next.reduceMotion
            p[Keys.showOnline] = next.showOnlineStatus
            p[Keys.readReceipts] = next.readReceipts
            p[Keys.onboarding] = next.onboardingDone
            p[Keys.mutedChats] = next.mutedChats
            p[Keys.pinnedChats] = next.pinnedChats
            p[Keys.archivedChats] = next.archivedChats
            p[Keys.hiddenPosts] = next.hiddenPosts
        }
    }

    // ------------------------------------------------------------------ saved accounts
    @Serializable
    private data class SavedAccountDto(
        val uid: String,
        val name: String,
        val email: String,
        val avatar: String,
        val provider: String,
        val lastUsedAt: Long,
    )

    private val accountsSerializer = ListSerializer(SavedAccountDto.serializer())

    val savedAccounts: Flow<List<SavedAccount>> = safeData.map { p ->
        decodeAccounts(p[Keys.savedAccounts]).sortedByDescending { it.lastUsedAt }
    }

    private fun decodeAccounts(raw: String?): List<SavedAccount> = try {
        if (raw.isNullOrBlank()) {
            emptyList()
        } else {
            json.decodeFromString(accountsSerializer, raw).map {
                SavedAccount(it.uid, it.name, it.email, it.avatar, it.provider, it.lastUsedAt)
            }
        }
    } catch (_: Exception) {
        emptyList()
    }

    suspend fun upsertSavedAccount(account: SavedAccount) {
        store.edit { p ->
            val list = decodeAccounts(p[Keys.savedAccounts]).filterNot { it.uid == account.uid } + account
            p[Keys.savedAccounts] = json.encodeToString(
                accountsSerializer,
                list.takeLast(MAX_SAVED_ACCOUNTS).map { SavedAccountDto(it.uid, it.name, it.email, it.avatar, it.provider, it.lastUsedAt) },
            )
        }
    }

    suspend fun removeSavedAccount(uid: String) {
        store.edit { p ->
            val list = decodeAccounts(p[Keys.savedAccounts]).filterNot { it.uid == uid }
            p[Keys.savedAccounts] = json.encodeToString(
                accountsSerializer,
                list.map { SavedAccountDto(it.uid, it.name, it.email, it.avatar, it.provider, it.lastUsedAt) },
            )
        }
    }

    // ------------------------------------------------------------------ drafts
    private val draftsSerializer = MapSerializer(String.serializer(), String.serializer())

    val chatDrafts: Flow<Map<String, String>> = safeData.map { p ->
        try {
            p[Keys.chatDrafts]?.let { json.decodeFromString(draftsSerializer, it) } ?: emptyMap()
        } catch (_: Exception) {
            emptyMap()
        }
    }

    suspend fun setChatDraft(chatId: String, text: String) {
        store.edit { p ->
            val cur = try {
                p[Keys.chatDrafts]?.let { json.decodeFromString(draftsSerializer, it) } ?: emptyMap()
            } catch (_: Exception) {
                emptyMap()
            }
            val next = if (text.isBlank()) cur - chatId else cur + (chatId to text.take(4000))
            p[Keys.chatDrafts] = json.encodeToString(draftsSerializer, next)
        }
    }

    val postDraft: Flow<String> = safeData.map { it[Keys.postDraft].orEmpty() }

    suspend fun setPostDraft(text: String) {
        store.edit { it[Keys.postDraft] = text.take(10_000) }
    }

    // ------------------------------------------------------------------ device identity
    suspend fun deviceId(): String {
        val existing = safeData.first()[Keys.deviceId]
        if (!existing.isNullOrBlank()) return existing
        val created = "dev_" + UUID.randomUUID().toString().replace("-", "").take(20)
        store.edit { it[Keys.deviceId] = created }
        return created
    }

    suspend fun sessionId(): String? = safeData.first()[Keys.sessionId]

    suspend fun setSessionId(id: String?) {
        store.edit { p -> if (id == null) p.remove(Keys.sessionId) else p[Keys.sessionId] = id }
    }

    private companion object {
        const val MAX_SAVED_ACCOUNTS = 5
    }
}
