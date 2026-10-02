package com.animeblack.app

import com.google.firebase.appcheck.FirebaseAppCheck
import com.google.firebase.appcheck.playintegrity.PlayIntegrityAppCheckProviderFactory

/**
 * Optional App Check installer for release builds. Disabled by default on debug-signed sideloaded
 * APKs so failed Play Integrity attestation never blocks or slows down Firestore/Storage requests.
 */
object AppCheckInstaller {
    fun install(enabled: Boolean = false) {
        if (!enabled) return
        FirebaseAppCheck.getInstance().installAppCheckProviderFactory(PlayIntegrityAppCheckProviderFactory.getInstance())
    }
}
