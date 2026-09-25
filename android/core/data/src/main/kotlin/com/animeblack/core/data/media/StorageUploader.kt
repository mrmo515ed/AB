package com.animeblack.core.data.media

import android.net.Uri
import com.google.firebase.storage.FirebaseStorage
import com.google.firebase.storage.StorageException
import com.google.firebase.storage.StorageMetadata
import com.google.firebase.storage.UploadTask
import java.io.File
import javax.inject.Inject
import javax.inject.Singleton
import kotlinx.coroutines.tasks.await

/**
 * Resumable Cloud Storage uploads. The upload session URI is reported so an interrupted upload
 * (process death, lost network) resumes instead of restarting.
 */
@Singleton
class StorageUploader @Inject constructor(
    private val storage: FirebaseStorage,
) {
    suspend fun upload(
        file: File,
        storagePath: String,
        mimeType: String,
        sessionUri: String?,
        onProgress: (percent: Int, sessionUri: String?) -> Unit,
    ): String {
        val ref = storage.reference.child(storagePath)
        val metadata = StorageMetadata.Builder()
            .setContentType(mimeType)
            .setCacheControl("public, max-age=31536000")
            .build()
        val source = Uri.fromFile(file)

        suspend fun run(resume: Uri?): UploadTask.TaskSnapshot {
            val task = if (resume != null) ref.putFile(source, metadata, resume) else ref.putFile(source, metadata)
            task.addOnProgressListener { snap ->
                val total = snap.totalByteCount.coerceAtLeast(1L)
                onProgress(((snap.bytesTransferred * 100) / total).toInt(), snap.uploadSessionUri?.toString())
            }
            return task.await()
        }

        try {
            run(sessionUri?.let(Uri::parse))
        } catch (e: StorageException) {
            if (sessionUri == null) throw e
            // Expired/invalid resumable session: start a fresh upload.
            run(null)
        }
        return ref.downloadUrl.await().toString()
    }
}
