plugins {
    alias(libs.plugins.animeblack.android.feature)
}

android {
    namespace = "com.animeblack.feature.reels"
}

dependencies {
    implementation(libs.androidx.media3.exoplayer)
    implementation(libs.androidx.media3.ui)
}
