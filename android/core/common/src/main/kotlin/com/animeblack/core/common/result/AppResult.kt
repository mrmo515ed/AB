package com.animeblack.core.common.result

import kotlinx.coroutines.CancellationException

/** Typed error surfaced to the UI. Every repository failure is mapped to one of these. */
sealed class AppError(open val cause: Throwable? = null) {
    data class Network(override val cause: Throwable? = null) : AppError(cause)
    data class Unauthenticated(override val cause: Throwable? = null) : AppError(cause)
    data class PermissionDenied(override val cause: Throwable? = null) : AppError(cause)
    data class NotFound(override val cause: Throwable? = null) : AppError(cause)
    data class Validation(val field: String, val reason: String) : AppError(null)
    data class Auth(val code: String, override val cause: Throwable? = null) : AppError(cause)
    data class Cancelled(override val cause: Throwable? = null) : AppError(cause)
    data class RateLimited(override val cause: Throwable? = null) : AppError(cause)
    data class Server(val code: String = "", val detail: String = "", override val cause: Throwable? = null) : AppError(cause)
    data class Unknown(override val cause: Throwable? = null) : AppError(cause)

    val isRetryable: Boolean
        get() = this is Network || this is Server || this is RateLimited || this is Unknown
}

sealed interface AppResult<out T> {
    data class Success<T>(val data: T) : AppResult<T>
    data class Failure(val error: AppError) : AppResult<Nothing>

    val isSuccess: Boolean get() = this is Success

    fun getOrNull(): T? = (this as? Success)?.data
    fun errorOrNull(): AppError? = (this as? Failure)?.error
}

inline fun <T, R> AppResult<T>.map(transform: (T) -> R): AppResult<R> = when (this) {
    is AppResult.Success -> AppResult.Success(transform(data))
    is AppResult.Failure -> this
}

inline fun <T> AppResult<T>.onSuccess(block: (T) -> Unit): AppResult<T> {
    if (this is AppResult.Success) block(data)
    return this
}

inline fun <T> AppResult<T>.onFailure(block: (AppError) -> Unit): AppResult<T> {
    if (this is AppResult.Failure) block(error)
    return this
}

/** Maps arbitrary throwables to [AppError]; a mapper for platform exceptions can be supplied. */
fun interface ErrorMapper {
    fun map(t: Throwable): AppError
}

/** Runs [block], rethrowing coroutine cancellation and mapping everything else. */
suspend inline fun <T> runCatchingApp(mapper: ErrorMapper, crossinline block: suspend () -> T): AppResult<T> =
    try {
        AppResult.Success(block())
    } catch (c: CancellationException) {
        throw c
    } catch (t: Throwable) {
        AppResult.Failure(mapper.map(t))
    }
