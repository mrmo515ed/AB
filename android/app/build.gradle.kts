import com.google.firebase.crashlytics.buildtools.gradle.CrashlyticsExtension
import groovy.json.JsonSlurper
import java.util.Properties

plugins {
    alias(libs.plugins.animeblack.android.application)
    alias(libs.plugins.animeblack.android.compose)
    alias(libs.plugins.animeblack.hilt)
    alias(libs.plugins.google.services)
    alias(libs.plugins.firebase.crashlytics)
    alias(libs.plugins.firebase.perf)
}

// ---------------------------------------------------------------------------------------------
// Firebase configuration: app/google-services.json of the Firebase Android app com.animeblack.app.
// The Google Services plugin generates google_app_id, gcm_defaultSenderId, project_id,
// google_storage_bucket, google_api_key and default_web_client_id from it (no other source).
// ---------------------------------------------------------------------------------------------
val googleServicesFile = file("google-services.json")
check(googleServicesFile.exists()) {
    "Missing android/app/google-services.json — download it from the Firebase console (Android app com.animeblack.app)."
}

@Suppress("UNCHECKED_CAST")
val googleServices = JsonSlurper().parse(googleServicesFile) as Map<String, Any?>

/** Web OAuth client (`client_type` 3) of the Firebase project: `serverClientId` for Google Sign-In. */
@Suppress("UNCHECKED_CAST")
fun googleWebClientId(packageName: String): String {
    val clients = googleServices["client"] as? List<Map<String, Any?>> ?: return ""
    val client = clients.firstOrNull { c ->
        val info = c["client_info"] as? Map<String, Any?>
        (info?.get("android_client_info") as? Map<String, Any?>)?.get("package_name") == packageName
    } ?: return ""
    val oauth = client["oauth_client"] as? List<Map<String, Any?>> ?: emptyList()
    val appInvite = (client["services"] as? Map<String, Any?>)?.get("appinvite_service") as? Map<String, Any?>
    val others = appInvite?.get("other_platform_oauth_client") as? List<Map<String, Any?>> ?: emptyList()
    return (oauth + others).firstOrNull { (it["client_type"] as? Number)?.toInt() == 3 }?.get("client_id")?.toString().orEmpty()
}

/** R8 mapping upload needs Crashlytics enabled in the console; opt in with -Panimeblack.crashlyticsMappingUpload=true. */
val crashlyticsMappingUpload = providers.gradleProperty("animeblack.crashlyticsMappingUpload").orNull == "true"

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

        // The new project uses the (default) Firestore database (Native mode).
        buildConfigField("String", "FIRESTORE_DATABASE_ID", "\"${providers.gradleProperty("animeblack.firestoreDatabaseId").orNull ?: "(default)"}\"")
        buildConfigField("String", "GOOGLE_WEB_CLIENT_ID", "\"${providers.gradleProperty("animeblack.googleWebClientId").orNull ?: googleWebClientId("com.animeblack.app")}\"")
        buildConfigField("String", "API_BASE_URL", "\"${secret("animeblack.apiBaseUrl").orEmpty()}\"")
        buildConfigField("String", "API_TOKEN", "\"${secret("animeblack.apiToken").orEmpty()}\"")
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
            // Uploading R8 mapping files requires Crashlytics to be enabled in the Firebase console.
            configure<CrashlyticsExtension> {
                mappingFileUploadEnabled = crashlyticsMappingUpload
            }
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

tasks.matching { it.name.startsWith("uploadCrashlyticsMappingFile") }.configureEach {
    enabled = crashlyticsMappingUpload
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
    // SVG artwork from the web (level badges, chat stickers are SVG data URLs).
    implementation(libs.coil.svg)
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
