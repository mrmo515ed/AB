package com.animeblack.core.data.auth

import android.content.Context
import androidx.credentials.ClearCredentialStateRequest
import androidx.credentials.CredentialManager
import androidx.credentials.CustomCredential
import androidx.credentials.GetCredentialRequest
import androidx.credentials.exceptions.GetCredentialCancellationException
import androidx.credentials.exceptions.GetCredentialException
import androidx.credentials.exceptions.NoCredentialException
import com.animeblack.core.common.config.AppConfig
import com.animeblack.core.common.result.AppError
import com.animeblack.core.data.firebase.AppErrorException
import com.google.android.libraries.identity.googleid.GetGoogleIdOption
import com.google.android.libraries.identity.googleid.GetSignInWithGoogleOption
import com.google.android.libraries.identity.googleid.GoogleIdTokenCredential
import com.google.android.libraries.identity.googleid.GoogleIdTokenParsingException
import java.security.MessageDigest
import java.security.SecureRandom
import javax.inject.Inject
import javax.inject.Singleton

data class GoogleIdResult(val idToken: String, val displayName: String?, val photoUrl: String?, val email: String)

/**
 * Google Identity via Android Credential Manager (replaces the deprecated GoogleSignInClient).
 * The ID token is exchanged for a Firebase credential by [FirebaseAuthRepository].
 *
 * Requirements (see android/MIGRATION.md): the Android app must be registered in the Firebase
 * project with the SHA-1/SHA-256 of the signing key so that an Android OAuth client exists; the web
 * OAuth client id is used as `serverClientId`.
 */
@Singleton
class GoogleSignInClient @Inject constructor(
    private val config: AppConfig,
) {
    suspend fun requestIdToken(activityContext: Context, onlyAuthorizedAccounts: Boolean): GoogleIdResult {
        if (config.googleWebClientId.isBlank()) {
            throw AppErrorException(AppError.Auth("google-not-configured"))
        }
        val credentialManager = CredentialManager.create(activityContext)
        val nonce = hashedNonce()
        val option = if (onlyAuthorizedAccounts) {
            GetGoogleIdOption.Builder()
                .setFilterByAuthorizedAccounts(true)
                .setServerClientId(config.googleWebClientId)
                .setAutoSelectEnabled(true)
                .setNonce(nonce)
                .build()
        } else {
            GetSignInWithGoogleOption.Builder(config.googleWebClientId)
                .setNonce(nonce)
                .build()
        }
        val request = GetCredentialRequest.Builder().addCredentialOption(option).build()
        val response = try {
            credentialManager.getCredential(activityContext, request)
        } catch (e: GetCredentialCancellationException) {
            throw AppErrorException(AppError.Cancelled(e))
        } catch (e: NoCredentialException) {
            throw AppErrorException(AppError.Auth("google-no-account", e))
        } catch (e: GetCredentialException) {
            val message = e.errorMessage?.toString().orEmpty()
            val code = if (message.contains("28444") || message.contains("Developer console", ignoreCase = true)) {
                "google-config"
            } else {
                "google-failed"
            }
            throw AppErrorException(AppError.Auth(code, e))
        }
        val credential = response.credential
        if (credential is CustomCredential && credential.type == GoogleIdTokenCredential.TYPE_GOOGLE_ID_TOKEN_CREDENTIAL) {
            try {
                val google = GoogleIdTokenCredential.createFrom(credential.data)
                return GoogleIdResult(
                    idToken = google.idToken,
                    displayName = google.displayName,
                    photoUrl = google.profilePictureUri?.toString(),
                    email = google.id,
                )
            } catch (e: GoogleIdTokenParsingException) {
                throw AppErrorException(AppError.Auth("google-invalid-token", e))
            }
        }
        throw AppErrorException(AppError.Auth("google-unexpected-credential"))
    }

    /** Clears the Credential Manager state so the account chooser appears on the next sign-in. */
    suspend fun clearCredentialState(context: Context) {
        try {
            CredentialManager.create(context).clearCredentialState(ClearCredentialStateRequest())
        } catch (_: Exception) {
            // Best effort: failure only means the chooser may auto-select next time.
        }
    }

    private fun hashedNonce(): String {
        val bytes = ByteArray(32).also { SecureRandom().nextBytes(it) }
        val digest = MessageDigest.getInstance("SHA-256").digest(bytes)
        return digest.joinToString("") { "%02x".format(it) }
    }
}
