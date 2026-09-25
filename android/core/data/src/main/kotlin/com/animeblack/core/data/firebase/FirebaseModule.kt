package com.animeblack.core.data.firebase

import android.content.Context
import com.animeblack.core.common.config.AppConfig
import com.google.firebase.FirebaseApp
import com.google.firebase.analytics.FirebaseAnalytics
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.FirebaseFirestoreSettings
import com.google.firebase.firestore.PersistentCacheSettings
import com.google.firebase.functions.FirebaseFunctions
import com.google.firebase.messaging.FirebaseMessaging
import com.google.firebase.remoteconfig.FirebaseRemoteConfig
import com.google.firebase.storage.FirebaseStorage
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object FirebaseModule {

    @Provides
    @Singleton
    fun providesFirebaseApp(@ApplicationContext context: Context): FirebaseApp =
        FirebaseApp.getApps(context).firstOrNull() ?: requireNotNull(FirebaseApp.initializeApp(context)) {
            "Firebase is not configured: add google-services.json or the Firebase string resources."
        }

    @Provides
    @Singleton
    fun providesAuth(app: FirebaseApp): FirebaseAuth = FirebaseAuth.getInstance(app)

    /**
     * The web app uses a *named* Firestore database; using the same one is essential so that the
     * native app sees the same users, posts and chats. Offline persistence (100 MB) keeps content
     * available without network and durably queues writes until the connection returns.
     */
    @Provides
    @Singleton
    fun providesFirestore(app: FirebaseApp, config: AppConfig): FirebaseFirestore {
        val db = if (config.firestoreDatabaseId.isBlank() || config.firestoreDatabaseId == "(default)") {
            FirebaseFirestore.getInstance(app)
        } else {
            FirebaseFirestore.getInstance(app, config.firestoreDatabaseId)
        }
        db.firestoreSettings = FirebaseFirestoreSettings.Builder()
            .setLocalCacheSettings(
                PersistentCacheSettings.newBuilder()
                    .setSizeBytes(100L * 1024L * 1024L)
                    .build(),
            )
            .build()
        return db
    }

    @Provides
    @Singleton
    fun providesStorage(app: FirebaseApp): FirebaseStorage = FirebaseStorage.getInstance(app).apply {
        maxUploadRetryTimeMillis = 120_000
        maxOperationRetryTimeMillis = 60_000
    }

    @Provides
    @Singleton
    fun providesFunctions(app: FirebaseApp, config: AppConfig): FirebaseFunctions =
        FirebaseFunctions.getInstance(app, config.functionsRegion)

    @Provides
    @Singleton
    fun providesMessaging(): FirebaseMessaging = FirebaseMessaging.getInstance()

    @Provides
    @Singleton
    fun providesRemoteConfig(app: FirebaseApp): FirebaseRemoteConfig = FirebaseRemoteConfig.getInstance(app)

    @Provides
    @Singleton
    fun providesAnalytics(@ApplicationContext context: Context): FirebaseAnalytics = FirebaseAnalytics.getInstance(context)
}
