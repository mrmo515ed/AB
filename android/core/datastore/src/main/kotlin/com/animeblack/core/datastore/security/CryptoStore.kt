package com.animeblack.core.datastore.security

import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import android.util.Base64
import java.security.KeyStore
import javax.crypto.Cipher
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey
import javax.crypto.spec.GCMParameterSpec

/**
 * Keystore-backed AES-256/GCM encryption for device-local secrets (session ids, device ids,
 * API tokens, saved accounts). The key never leaves the Android Keystore hardware module.
 *
 * Encrypted payloads are prefixed with [PREFIX]; legacy plaintext values are returned as-is by
 * [decryptOrPlain] so existing installs migrate transparently on next write. If the Keystore is
 * unavailable (rare emulator / custom ROM cases) the store degrades to plaintext instead of
 * crashing — functionality first, matching the web app's behaviour.
 */
object CryptoStore {
    private const val ANDROID_KEYSTORE = "AndroidKeyStore"
    private const val ALIAS = "anime_black_store_key"
    private const val TRANSFORMATION = "AES/GCM/NoPadding"
    private const val PREFIX = "enc1:"
    private const val GCM_TAG_BITS = 128
    private const val GCM_IV_BYTES = 12

    private val lock = Any()
    private var keyFailure = false

    private fun key(): SecretKey? {
        if (keyFailure) return null
        return synchronized(lock) {
            try {
                val store = KeyStore.getInstance(ANDROID_KEYSTORE).apply { load(null) }
                (store.getEntry(ALIAS, null) as? KeyStore.SecretKeyEntry)?.secretKey ?: run {
                    val generator = KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, ANDROID_KEYSTORE)
                    generator.init(
                        KeyGenParameterSpec.Builder(
                            ALIAS,
                            KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT,
                        )
                            .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
                            .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
                            .setKeySize(256)
                            .setRandomizedEncryptionRequired(true)
                            .build(),
                    )
                    generator.generateKey()
                }
            } catch (_: Exception) {
                keyFailure = true
                null
            }
        }
    }

    /** Encrypts [plain] into a portable `enc1:` string, or returns [plain] when Keystore is unavailable. */
    fun encrypt(plain: String): String {
        if (plain.isEmpty()) return plain
        val secret = key() ?: return plain
        return try {
            val cipher = Cipher.getInstance(TRANSFORMATION)
            cipher.init(Cipher.ENCRYPT_MODE, secret)
            val payload = cipher.iv + cipher.doFinal(plain.toByteArray(Charsets.UTF_8))
            PREFIX + Base64.encodeToString(payload, Base64.NO_WRAP)
        } catch (_: Exception) {
            plain
        }
    }

    /** Decrypts an [decrypt] payload; returns null when the payload is not ours or is corrupt. */
    fun decrypt(encoded: String): String? {
        if (!encoded.startsWith(PREFIX)) return null
        val secret = key() ?: return null
        return try {
            val payload = Base64.decode(encoded.removePrefix(PREFIX), Base64.NO_WRAP)
            if (payload.size <= GCM_IV_BYTES) return null
            val cipher = Cipher.getInstance(TRANSFORMATION)
            cipher.init(Cipher.DECRYPT_MODE, secret, GCMParameterSpec(GCM_TAG_BITS, payload, 0, GCM_IV_BYTES))
            String(cipher.doFinal(payload, GCM_IV_BYTES, payload.size - GCM_IV_BYTES), Charsets.UTF_8)
        } catch (_: Exception) {
            null
        }
    }

    /** Migration-friendly read: encrypted values are decrypted, legacy plaintext passes through. */
    fun decryptOrPlain(stored: String): String = decrypt(stored) ?: stored.removePrefix(PREFIX)

    /** True when the value is stored encrypted (used for status screens). */
    fun isEncrypted(stored: String): Boolean = stored.startsWith(PREFIX)
}
