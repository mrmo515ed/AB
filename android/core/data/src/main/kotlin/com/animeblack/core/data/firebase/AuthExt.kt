package com.animeblack.core.data.firebase

import com.animeblack.core.common.result.AppError
import com.google.firebase.auth.FirebaseAuth

internal fun FirebaseAuth.requireUid(): String =
    currentUser?.uid ?: throw AppErrorException(AppError.Unauthenticated())
