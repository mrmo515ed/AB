package com.animeblack.core.data.firebase

import android.util.Log
import com.animeblack.core.common.network.NetworkMonitor
import com.animeblack.core.common.result.AppError
import com.animeblack.core.common.result.ErrorMapper
import com.google.firebase.FirebaseNetworkException
import com.google.firebase.FirebaseTooManyRequestsException
import com.google.firebase.auth.FirebaseAuthException
import com.google.firebase.auth.FirebaseAuthInvalidCredentialsException
import com.google.firebase.auth.FirebaseAuthInvalidUserException
import com.google.firebase.auth.FirebaseAuthUserCollisionException
import com.google.firebase.auth.FirebaseAuthWeakPasswordException
import com.google.firebase.firestore.FirebaseFirestoreException
import com.google.firebase.functions.FirebaseFunctionsException
import com.google.firebase.storage.StorageException
import java.io.IOException
import java.net.SocketTimeoutException
import java.net.UnknownHostException
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Translates Firebase / network / I/O exceptions into clean [AppError] domain values so UI layers
 * never touch Firebase types and never leak raw exception text.
 *
 * Importantly, if the device's [NetworkMonitor] reports that the internet connection is active,
 * backend/service timeouts (e.g. unprovisioned Storage bucket or Cloud Functions endpoint) are NOT
 * misreported as "No internet connection" ([AppError.Network]).
 */
@Singleton
class FirebaseErrorMapper @Inject constructor(
    private val networkMonitor: NetworkMonitor,
) : ErrorMapper {
    override fun map(throwable: Throwable): AppError {
        Log.w(TAG, "Mapped error: ${throwable::class.simpleName}: ${throwable.message}")
        val online = networkMonitor.isCurrentlyOnline
        return when (throwable) {
            is AppErrorException -> throwable.appError
            is FirebaseNetworkException -> if (!online) AppError.Network(throwable) else AppError.Unknown("service-unreachable", throwable)
            is UnknownHostException -> if (!online) AppError.Network(throwable) else AppError.Unknown("dns-unreachable", throwable)
            is SocketTimeoutException -> if (!online) AppError.Network(throwable) else AppError.Unknown("timeout", throwable)
            is FirebaseTooManyRequestsException -> AppError.RateLimited(throwable)
            is FirebaseAuthWeakPasswordException -> AppError.Auth("weak-password", throwable)
            is FirebaseAuthInvalidCredentialsException -> AppError.Auth(throwable.errorCode.normalizeAuthCode(), throwable)
            is FirebaseAuthInvalidUserException -> AppError.Auth(throwable.errorCode.normalizeAuthCode(), throwable)
            is FirebaseAuthUserCollisionException -> AppError.Auth(throwable.errorCode.normalizeAuthCode(), throwable)
            is FirebaseAuthException -> AppError.Auth(throwable.errorCode.normalizeAuthCode(), throwable)
            is FirebaseFirestoreException -> mapFirestore(throwable, online)
            is StorageException -> mapStorage(throwable, online)
            is FirebaseFunctionsException -> mapFunctions(throwable, online)
            is IOException -> if (!online) AppError.Network(throwable) else AppError.Unknown("io-error", throwable)
            else -> AppError.Unknown(throwable.message, throwable)
        }
    }

    private fun mapFirestore(e: FirebaseFirestoreException, online: Boolean): AppError = when (e.code) {
        FirebaseFirestoreException.Code.PERMISSION_DENIED -> AppError.PermissionDenied("firestore", e)
        FirebaseFirestoreException.Code.UNAUTHENTICATED -> AppError.Unauthenticated(e)
        FirebaseFirestoreException.Code.NOT_FOUND -> AppError.NotFound("document", e)
        FirebaseFirestoreException.Code.ALREADY_EXISTS -> AppError.Conflict("document", e)
        FirebaseFirestoreException.Code.RESOURCE_EXHAUSTED -> AppError.RateLimited(e)
        FirebaseFirestoreException.Code.UNAVAILABLE,
        FirebaseFirestoreException.Code.DEADLINE_EXCEEDED,
        -> if (!online) AppError.Network(e) else AppError.Unknown(e.code.name, e)
        FirebaseFirestoreException.Code.INVALID_ARGUMENT,
        FirebaseFirestoreException.Code.FAILED_PRECONDITION,
        FirebaseFirestoreException.Code.OUT_OF_RANGE,
        -> AppError.Validation("firestore", e.code.name, e)
        else -> AppError.Unknown(e.code.name, e)
    }

    private fun mapStorage(e: StorageException, online: Boolean): AppError = when (e.errorCode) {
        StorageException.ERROR_NOT_AUTHENTICATED -> AppError.Unauthenticated(e)
        StorageException.ERROR_NOT_AUTHORIZED -> AppError.PermissionDenied("storage", e)
        StorageException.ERROR_OBJECT_NOT_FOUND,
        StorageException.ERROR_BUCKET_NOT_FOUND,
        StorageException.ERROR_PROJECT_NOT_FOUND,
        -> AppError.NotFound("storage", e)
        StorageException.ERROR_QUOTA_EXCEEDED -> AppError.RateLimited(e)
        StorageException.ERROR_RETRY_LIMIT_EXCEEDED -> if (!online) AppError.Network(e) else AppError.Unknown("storage-retry-limit", e)
        else -> AppError.Storage(e.errorCode.toString(), e)
    }

    private fun mapFunctions(e: FirebaseFunctionsException, online: Boolean): AppError = when (e.code) {
        FirebaseFunctionsException.Code.UNAUTHENTICATED -> AppError.Unauthenticated(e)
        FirebaseFunctionsException.Code.PERMISSION_DENIED -> AppError.PermissionDenied("functions", e)
        FirebaseFunctionsException.Code.NOT_FOUND -> AppError.NotFound("function", e)
        FirebaseFunctionsException.Code.ALREADY_EXISTS -> AppError.Conflict("function", e)
        FirebaseFunctionsException.Code.RESOURCE_EXHAUSTED -> AppError.RateLimited(e)
        FirebaseFunctionsException.Code.INVALID_ARGUMENT,
        FirebaseFunctionsException.Code.FAILED_PRECONDITION,
        -> AppError.Validation("function", e.message ?: e.code.name, e)
        FirebaseFunctionsException.Code.UNAVAILABLE,
        FirebaseFunctionsException.Code.DEADLINE_EXCEEDED,
        -> if (!online) AppError.Network(e) else AppError.Unknown(e.code.name, e)
        else -> AppError.Unknown(e.code.name, e)
    }

    private fun String.normalizeAuthCode(): String = lowercase().removePrefix("error_").replace('_', '-')

    companion object {
        private const val TAG = "FirebaseErrorMapper"
    }
}

/** Internal exception used inside `runCatchingApp` blocks to abort with a typed [AppError]. */
class AppErrorException(val appError: AppError) : Exception(appError.toString())
