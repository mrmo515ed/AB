plugins {
    alias(libs.plugins.animeblack.android.library)
    alias(libs.plugins.animeblack.hilt)
    alias(libs.plugins.kotlin.serialization)
}

android {
    namespace = "com.animeblack.core.datastore"
}

dependencies {
    implementation(project(":core:model"))
    implementation(project(":core:common"))
    api(libs.androidx.datastore.preferences)
    implementation(libs.kotlinx.serialization.json)
}
