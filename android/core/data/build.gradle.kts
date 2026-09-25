plugins {
    alias(libs.plugins.animeblack.android.library)
    alias(libs.plugins.animeblack.hilt)
    alias(libs.plugins.kotlin.serialization)
}

android {
    namespace = "com.animeblack.core.data"
    buildFeatures {
        buildConfig = true
    }
}

dependencies {
    api(project(":core:model"))
    api(project(":core:common"))
    api(project(":core:datastore"))
    api(project(":core:database"))

    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.lifecycle.process)
    implementation(libs.androidx.exifinterface)
    implementation(libs.androidx.work.runtime.ktx)
    implementation(libs.androidx.hilt.work)
    ksp(libs.androidx.hilt.compiler)
    api(libs.androidx.paging.runtime)

    api(platform(libs.firebase.bom))
    api(libs.firebase.auth)
    api(libs.firebase.firestore)
    implementation(libs.firebase.storage)
    implementation(libs.firebase.functions)
    implementation(libs.firebase.messaging)
    implementation(libs.firebase.crashlytics)
    implementation(libs.firebase.perf)
    implementation(libs.firebase.analytics)
    implementation(libs.firebase.config)
    implementation(libs.firebase.installations)

    implementation(libs.androidx.credentials)
    implementation(libs.androidx.credentials.play.services.auth)
    implementation(libs.googleid)

    implementation(libs.kotlinx.coroutines.play.services)
    implementation(libs.kotlinx.serialization.json)
    implementation(libs.okhttp)
    implementation(libs.androidx.media3.transformer)
    implementation(libs.androidx.media3.effect)
    implementation(libs.androidx.media3.common)

    testImplementation(libs.mockk)
    testImplementation(libs.turbine)
    testImplementation(libs.okhttp.mockwebserver)
    testImplementation(libs.robolectric)
}
