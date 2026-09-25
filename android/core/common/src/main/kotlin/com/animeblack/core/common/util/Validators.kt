package com.animeblack.core.common.util

/** Input validation shared by auth, profile and composer screens. */
object Validators {
    private val EMAIL = Regex("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$")
    private val USERNAME = Regex("^[a-z0-9_.]{3,24}$")
    private val MENTION = Regex("@([a-zA-Z0-9_\\u0600-\\u06FF]+)")
    private val HASHTAG = Regex("#([a-zA-Z0-9_\\u0600-\\u06FF]+)")
    private val URL = Regex("https?://[^\\s<]+")

    fun isValidEmail(value: String): Boolean = EMAIL.matches(value.trim())
    fun isValidPassword(value: String): Boolean = value.length >= 6
    fun isStrongPassword(value: String): Boolean =
        value.length >= 8 && value.any(Char::isDigit) && value.any(Char::isLetter)

    fun normalizeUsername(raw: String): String =
        raw.trim().removePrefix("@").lowercase().replace(Regex("[^a-z0-9_.]"), "")

    fun isValidUsername(value: String): Boolean = USERNAME.matches(value)

    /** Default username derived from an e-mail/uid exactly like the web app does. */
    fun defaultUsername(email: String?, uid: String): String {
        val base = (email?.substringBefore('@') ?: "user_${uid.take(6)}")
            .replace(Regex("[^a-zA-Z0-9_.]"), "")
            .lowercase()
        return base.ifBlank { "otaku_${uid.take(5)}" }
    }

    fun extractMentions(text: String): List<String> =
        MENTION.findAll(text).map { it.groupValues[1].lowercase() }.distinct().toList()

    fun extractHashtags(text: String): List<String> =
        HASHTAG.findAll(text).map { it.groupValues[1] }.distinct().toList()

    fun extractUrls(text: String): List<String> = URL.findAll(text).map { it.value }.toList()

    fun mentionRegex(): Regex = MENTION
    fun hashtagRegex(): Regex = HASHTAG
    fun urlRegex(): Regex = URL
}
