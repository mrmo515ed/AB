package com.animeblack.core.common.result

/** Screen-level state used by ViewModels: loading / content / empty / error (+ offline flag). */
sealed interface LoadState<out T> {
    data object Loading : LoadState<Nothing>
    data class Content<T>(val data: T, val isRefreshing: Boolean = false, val fromCache: Boolean = false) : LoadState<T>
    data object Empty : LoadState<Nothing>
    data class Error(val error: AppError) : LoadState<Nothing>

    fun dataOrNull(): T? = (this as? Content)?.data
}

fun <T> List<T>.toLoadState(fromCache: Boolean = false): LoadState<List<T>> =
    if (isEmpty()) LoadState.Empty else LoadState.Content(this, fromCache = fromCache)
