package com.animeblack.core.data.analytics

import android.os.Bundle
import com.google.firebase.analytics.FirebaseAnalytics
import com.google.firebase.crashlytics.FirebaseCrashlytics
import javax.inject.Inject
import javax.inject.Singleton

/** Thin wrapper so features log events without depending on Firebase directly. */
@Singleton
class AnalyticsHelper @Inject constructor(
    private val analytics: FirebaseAnalytics,
) {
    fun logEvent(name: String, params: Map<String, String> = emptyMap()) {
        val bundle = Bundle().apply { params.forEach { (k, v) -> putString(k, v.take(100)) } }
        analytics.logEvent(name, bundle)
    }

    fun logScreen(screen: String) {
        val bundle = Bundle().apply {
            putString(FirebaseAnalytics.Param.SCREEN_NAME, screen)
            putString(FirebaseAnalytics.Param.SCREEN_CLASS, screen)
        }
        analytics.logEvent(FirebaseAnalytics.Event.SCREEN_VIEW, bundle)
    }

    fun setUser(uid: String?) {
        analytics.setUserId(uid)
        FirebaseCrashlytics.getInstance().setUserId(uid.orEmpty())
    }

    fun setCollectionEnabled(analyticsEnabled: Boolean, crashReportsEnabled: Boolean) {
        analytics.setAnalyticsCollectionEnabled(analyticsEnabled)
        FirebaseCrashlytics.getInstance().isCrashlyticsCollectionEnabled = crashReportsEnabled
    }

    /** Non-fatal errors: recorded without any user content (no message text, no tokens). */
    fun recordNonFatal(throwable: Throwable, context: String) {
        FirebaseCrashlytics.getInstance().log("non-fatal in $context")
        FirebaseCrashlytics.getInstance().recordException(throwable)
    }
}
