package com.animeblack.app.di

import com.animeblack.app.BuildConfig
import com.animeblack.app.R
import com.animeblack.core.common.config.AppConfig
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object AppModule {
    @Provides
    @Singleton
    fun providesAppConfig(): AppConfig = AppConfig(
        firestoreDatabaseId = BuildConfig.FIRESTORE_DATABASE_ID,
        googleWebClientId = BuildConfig.GOOGLE_WEB_CLIENT_ID,
        apiBaseUrl = BuildConfig.API_BASE_URL,
        isDebug = BuildConfig.DEBUG,
        versionName = BuildConfig.VERSION_NAME,
        versionCode = BuildConfig.VERSION_CODE,
        hasAndroidFirebaseApp = BuildConfig.HAS_GOOGLE_SERVICES_JSON,
        notificationIconRes = R.drawable.ic_stat_notification,
    )
}
