package com.animeblack.core.data.firebase

import com.animeblack.core.common.result.AppError
import com.animeblack.core.common.result.ErrorMapper
import com.google.firebase.FirebaseNetworkException
import com.google.firebase.FirebaseTooManyRequestsException
import com.google.firebase.auth.FirebaseAuthException
import com.google.firebase.auth.FirebaseAuthInvalidCredentialsException
import com.google.firebase.auth.FirebaseAuthInvalidUserException
import com.google.firebase.auth.FirebaseAuthRecentLoginRequiredException
import com.google.firebase.auth.FirebaseAuthUserCollisionException
import com.google.firebase.auth.FirebaseAuthWeakPasswordException
import com.google.firebase.firestore.FirebaseFirestoreException
import com.google.firebase.functions.FirebaseFunctionsException
import com.google.firebase.storage.StorageException
import java.io.IOException
import javax.inject.Inject

/** Maps Firebase / IO exceptions to typed [AppError]s. */
class FirebaseErrorMapper @Inject constructor() : ErrorMapper {
    override fun map(t: Throwable): AppError = when (t) {
        is AppErrorException -> t.error
        is FirebaseNetworkException, is IOException -> AppError.Network(t)
        is FirebaseTooManyRequestsException -> AppError.RateLimited(t)
        is FirebaseAuthWeakPasswordException -> AppError.Auth("weak-password", t)
        is FirebaseAuthUserCollisionException -> AppError.Auth("email-already-in-use", t)
        is FirebaseAuthInvalidUserException -> AppError.Auth("user-not-found", t)
        is FirebaseAuthInvalidCredentialsException -> AppError.Auth("invalid-credential", t)
        is FirebaseAuthRecentLoginRequiredException -> AppError.Auth("requires-recent-login", t)
        is FirebaseAuthException -> AppError.Auth(t.errorCode.lowercase(), t)
        is FirebaseFirestoreException -> when (t.code) {
            FirebaseFirestoreException.Code.PERMISSION_DENIED -> AppError.PermissionDenied(t)
            FirebaseFirestoreException.Code.UNAUTHENTICATED -> AppError.Unauthenticated(t)
            FirebaseFirestoreException.Code.NOT_FOUND -> AppError.NotFound(t)
            FirebaseFirestoreException.Code.UNAVAILABLE,
            FirebaseFirestoreException.Code.DEADLINE_EXCEEDED -> AppError.Network(t)
            FirebaseFirestoreException.Code.RESOURCE_EXHAUSTED -> AppError.RateLimited(t)
            FirebaseFirestoreException.Code.CANCELLED -> AppError.Cancelled(t)
            else -> AppError.Server(t.code.name, t.message.orEmpty(), t)
        }
        is FirebaseFunctionsException -> when (t.code) {
            FirebaseFunctionsException.Code.UNAUTHENTICATED -> AppError.Unauthenticated(t)
            FirebaseFunctionsException.Code.PERMISSION_DENIED -> AppError.PermissionDenied(t)
            FirebaseFunctionsException.Code.UNAVAILABLE,
            FirebaseFunctionsException.Code.DEADLINE_EXCEEDED -> AppError.Network(t)
            FirebaseFunctionsException.Code.RESOURCE_EXHAUSTED -> AppError.RateLimited(t)
            FirebaseFunctionsException.Code.NOT_FOUND -> AppError.NotFound(t)
            else -> AppError.Server(t.code.name, t.message.orEmpty(), t)
        }
        is StorageException -> when (t.errorCode) {
            StorageException.ERROR_NOT_AUTHORIZED -> AppError.PermissionDenied(t)
            StorageException.ERROR_NOT_AUTHENTICATED -> AppError.Unauthenticated(t)
            StorageException.ERROR_RETRY_LIMIT_EXCEEDED -> AppError.Network(t)
            StorageException.ERROR_OBJECT_NOT_FOUND -> AppError.NotFound(t)
            StorageException.ERROR_CANCELED -> AppError.Cancelled(t)
            else -> AppError.Server("storage-${t.errorCode}", t.message.orEmpty(), t)
        }
        else -> AppError.Unknown(t)
    }
}

/** Lets repositories throw a typed error through `runCatchingApp`. */
class AppErrorException(val error: AppError) : RuntimeException(error.toString())
