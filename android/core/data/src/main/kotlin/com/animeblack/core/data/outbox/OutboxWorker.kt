package com.animeblack.core.data.outbox

import android.content.Context
import androidx.hilt.work.HiltWorker
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import dagger.assisted.Assisted
import dagger.assisted.AssistedInject

/** Drains the outbox. Returns `retry` (exponential backoff) while transient failures remain. */
@HiltWorker
class OutboxWorker @AssistedInject constructor(
    @Assisted context: Context,
    @Assisted params: WorkerParameters,
    private val processor: OutboxProcessor,
) : CoroutineWorker(context, params) {
    override suspend fun doWork(): Result = if (processor.processAll()) Result.success() else Result.retry()
}
