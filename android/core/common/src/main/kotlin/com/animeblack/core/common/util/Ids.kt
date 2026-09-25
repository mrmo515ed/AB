package com.animeblack.core.common.util

import java.security.SecureRandom

/** Id helpers compatible with the web app's formats (`uid()` = 8 random base36 + 4 time chars). */
object Ids {
    private val random = SecureRandom()
    private const val ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789"

    fun short(): String {
        val sb = StringBuilder()
        repeat(8) { sb.append(ALPHABET[random.nextInt(ALPHABET.length)]) }
        sb.append(System.currentTimeMillis().toString(36).takeLast(4))
        return sb.toString()
    }

    fun post(now: Long = System.currentTimeMillis()): String = "p_${now}_${short().take(5)}"
    fun message(): String = "m_${short()}"
    fun notification(): String = "notif_${short()}"
    fun story(): String = "s_${short()}"
    fun storyItem(): String = "item_${short()}"
    fun reel(): String = "reel_${short()}"
    fun group(): String = "gr${short()}"
    fun world(): String = "w${short()}"
    fun community(): String = "c${short()}"
    fun chatRequest(): String = "cr_${short()}"
    fun report(): String = "rep_${short()}"
    fun comment(): String = short()
    fun session(): String = "sess_${short()}${System.currentTimeMillis()}"
    fun device(): String = "dev_${short()}${System.currentTimeMillis()}"
}
