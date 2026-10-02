package com.animeblack.app

import com.google.firebase.appcheck.FirebaseAppCheck
import com.google.firebase.appcheck.debug.DebugAppCheckProviderFactory

/**
 * Optional App Check installer for debug builds. Disabled by default so sideloaded builds whose
 * random debug secret has not been registered in Firebase Console never stall Firestore/Storage requests.
 */
object AppCheckInstaller {
    fun install(enabled: Boolean = false) {
        if (!enabled) return
        FirebaseAppCheck.getInstance().installAppCheckProviderFactory(DebugAppCheckProviderFactory.getInstance())
    }
}
