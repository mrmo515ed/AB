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
        apiToken = BuildConfig.API_TOKEN,
        isDebug = BuildConfig.DEBUG,
        versionName = BuildConfig.VERSION_NAME,
        versionCode = BuildConfig.VERSION_CODE,
        hasAndroidFirebaseApp = true, // google-services.json is mandatory: the build fails without it
        hasAndroidOauthClient = BuildConfig.HAS_ANDROID_OAUTH_CLIENT,
        notificationIconRes = R.drawable.ic_stat_notification,
    )
}
