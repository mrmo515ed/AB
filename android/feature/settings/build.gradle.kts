plugins {
    alias(libs.plugins.animeblack.android.feature)
}

android {
    namespace = "com.animeblack.feature.settings"
}

dependencies {
    implementation(libs.androidx.core.ktx)
}
