package com.animeblack.core.ui

import android.content.Context
import android.content.Intent
import androidx.annotation.StringRes
import com.animeblack.core.common.result.AppError

/** Maps typed errors to user-facing messages (never shows raw exception text). */
@StringRes
fun AppError.messageRes(): Int = when (this) {
    is AppError.Network -> R.string.ui_err_network
    is AppError.PermissionDenied -> R.string.ui_err_permission
    is AppError.NotFound -> R.string.ui_err_not_found
    is AppError.Unauthenticated -> R.string.ui_err_auth
    is AppError.RateLimited -> R.string.ui_err_rate
    is AppError.Validation -> when (reason) {
        "too-large" -> R.string.ui_err_too_large
        "empty" -> R.string.ui_err_empty
        "request-sent" -> R.string.ui_err_request_sent
        "insufficient" -> if (field == "energy") R.string.ui_err_energy else R.string.ui_err_funds
        "cooldown" -> R.string.ui_err_cooldown
        else -> R.string.ui_err_generic
    }
    is AppError.Server -> if (code.contains("failed-precondition", true) || detail.contains("insufficient", true)) R.string.ui_err_funds else R.string.ui_err_generic
    else -> R.string.ui_err_generic
}

/** Opens the Android share sheet (native replacement for the web share sheet). */
fun Context.shareText(text: String, chooserTitle: String) {
    val send = Intent(Intent.ACTION_SEND).apply {
        type = "text/plain"
        putExtra(Intent.EXTRA_TEXT, text)
    }
    startActivity(Intent.createChooser(send, chooserTitle).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
}

/** Public web link for shareable content (the web app accepts the same `?go=` routes). */
fun shareLink(kind: String, id: String): String = "animeblack://$kind/$id"
