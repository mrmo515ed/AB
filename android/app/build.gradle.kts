import groovy.json.JsonSlurper
import java.util.Properties

plugins {
    alias(libs.plugins.animeblack.android.application)
    alias(libs.plugins.animeblack.android.compose)
    alias(libs.plugins.animeblack.hilt)
    alias(libs.plugins.firebase.crashlytics)
    alias(libs.plugins.firebase.perf)
}

// ---------------------------------------------------------------------------------------------
// Firebase configuration
//  * Preferred: register the Android app (com.animeblack.app) in the Firebase console and drop the
//    generated google-services.json into android/app/. The Google Services plugin is then applied.
//  * Fallback: the existing web configuration of the same Firebase project
//    (repository root firebase-applet-config.json) is exposed as the standard Firebase string
//    resources, so FirebaseApp auto-initialises against the same project, database and bucket.
// ---------------------------------------------------------------------------------------------
val hasGoogleServicesJson = file("google-services.json").exists()
if (hasGoogleServicesJson) {
    apply(plugin = libs.plugins.google.services.get().pluginId)
}

@Suppress("UNCHECKED_CAST")
val webFirebaseConfig: Map<String, Any?> = rootProject.file("../firebase-applet-config.json")
    .takeIf { it.exists() }
    ?.let { JsonSlurper().parse(it) as Map<String, Any?> }
    ?: emptyMap()

fun firebaseValue(key: String, gradleProperty: String): String =
    (providers.gradleProperty(gradleProperty).orNull ?: webFirebaseConfig[key]?.toString()).orEmpty()

val localProps = Properties().apply {
    val f = rootProject.file("local.properties")
    if (f.exists()) f.inputStream().use { load(it) }
}

fun secret(name: String): String? =
    providers.gradleProperty(name).orNull ?: System.getenv(name.uppercase().replace('.', '_')) ?: localProps.getProperty(name)

val releaseStoreFile = secret("animeblack.release.storeFile")

android {
    namespace = "com.animeblack.app"

    defaultConfig {
        applicationId = "com.animeblack.app"
        versionCode = 1
        versionName = "1.0.0"

        buildConfigField("String", "FIRESTORE_DATABASE_ID", "\"${firebaseValue("firestoreDatabaseId", "animeblack.firestoreDatabaseId")}\"")
        buildConfigField("String", "GOOGLE_WEB_CLIENT_ID", "\"${firebaseValue("oAuthClientId", "animeblack.googleWebClientId")}\"")
        buildConfigField("String", "API_BASE_URL", "\"${providers.gradleProperty("animeblack.apiBaseUrl").orNull.orEmpty()}\"")
        buildConfigField("boolean", "HAS_GOOGLE_SERVICES_JSON", hasGoogleServicesJson.toString())

        if (!hasGoogleServicesJson) {
            resValue("string", "google_app_id", firebaseValue("appId", "animeblack.firebaseAppId"))
            resValue("string", "google_api_key", firebaseValue("apiKey", "animeblack.firebaseApiKey"))
            resValue("string", "gcm_defaultSenderId", firebaseValue("messagingSenderId", "animeblack.firebaseSenderId"))
            resValue("string", "project_id", firebaseValue("projectId", "animeblack.firebaseProjectId"))
            resValue("string", "google_storage_bucket", firebaseValue("storageBucket", "animeblack.firebaseStorageBucket"))
            resValue("string", "default_web_client_id", firebaseValue("oAuthClientId", "animeblack.googleWebClientId"))
        }
    }

    signingConfigs {
        // Shared, committed debug key: gives every CI/debug build the same SHA-1 so it can be
        // registered once in Firebase (required for Google Sign-In). Not used for release.
        getByName("debug") {
            storeFile = file("debug.keystore")
            storePassword = "android"
            keyAlias = "androiddebugkey"
            keyPassword = "android"
        }
        if (releaseStoreFile != null) {
            create("release") {
                storeFile = file(releaseStoreFile)
                storePassword = secret("animeblack.release.storePassword")
                keyAlias = secret("animeblack.release.keyAlias")
                keyPassword = secret("animeblack.release.keyPassword")
            }
        }
    }

    buildTypes {
        debug {
            signingConfig = signingConfigs.getByName("debug")
        }
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
            // Without release credentials the release APK is produced unsigned (app-release-unsigned.apk).
            signingConfig = signingConfigs.findByName("release")
        }
    }

    buildFeatures {
        buildConfig = true
        resValues = true
    }

    lint {
        abortOnError = false
        checkReleaseBuilds = false
        warningsAsErrors = false
    }
}

// Mapping-file upload requires a registered Android app (google-services.json).
tasks.matching { it.name.startsWith("uploadCrashlyticsMappingFile") }.configureEach {
    enabled = hasGoogleServicesJson
}

dependencies {
    implementation(project(":core:model"))
    implementation(project(":core:common"))
    implementation(project(":core:designsystem"))
    implementation(project(":core:ui"))
    implementation(project(":core:navigation"))
    implementation(project(":core:datastore"))
    implementation(project(":core:data"))

    implementation(project(":feature:auth"))
    implementation(project(":feature:home"))
    implementation(project(":feature:community"))
    implementation(project(":feature:chat"))
    implementation(project(":feature:reels"))
    implementation(project(":feature:profile"))
    implementation(project(":feature:notifications"))
    implementation(project(":feature:search"))
    implementation(project(":feature:settings"))
    implementation(project(":feature:more"))
    implementation(project(":feature:anime"))
    implementation(project(":feature:games"))
    implementation(project(":feature:admin"))

    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.core.splashscreen)
    implementation(libs.androidx.activity.compose)
    implementation(libs.androidx.lifecycle.runtime.compose)
    implementation(libs.androidx.lifecycle.viewmodel.compose)
    implementation(libs.androidx.lifecycle.process)
    implementation(libs.androidx.navigation.compose)
    implementation(libs.androidx.hilt.navigation.compose)
    implementation(libs.androidx.hilt.lifecycle.viewmodel.compose)
    implementation(libs.androidx.hilt.work)
    implementation(libs.androidx.work.runtime.ktx)
    implementation(libs.androidx.profileinstaller)
    implementation(libs.coil.compose)
    implementation(libs.coil.network.okhttp)
    implementation(libs.coil.gif)
    implementation(libs.coil.video)
    implementation(libs.okhttp)

    implementation(platform(libs.firebase.bom))
    implementation(libs.firebase.crashlytics)
    implementation(libs.firebase.perf)
    implementation(libs.firebase.messaging)
    implementation(libs.firebase.appcheck.playintegrity)
    debugImplementation(libs.firebase.appcheck.debug)

    testImplementation(libs.junit)
    testImplementation(libs.truth)
    testImplementation(libs.kotlinx.coroutines.test)
    testImplementation(libs.robolectric)
    androidTestImplementation(libs.androidx.test.ext.junit)
    androidTestImplementation(libs.androidx.test.runner)
    androidTestImplementation(libs.androidx.test.espresso.core)
    androidTestImplementation(libs.androidx.compose.ui.test.junit4)
    debugImplementation(libs.androidx.compose.ui.test.manifest)
}
