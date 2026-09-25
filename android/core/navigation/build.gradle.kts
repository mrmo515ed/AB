plugins {
    alias(libs.plugins.animeblack.android.library)
    alias(libs.plugins.kotlin.serialization)
}

android {
    namespace = "com.animeblack.core.navigation"
}

dependencies {
    api(libs.androidx.navigation.compose)
    api(libs.kotlinx.serialization.json)
}
