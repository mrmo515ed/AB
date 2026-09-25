plugins {
    alias(libs.plugins.animeblack.android.feature)
}

android {
    namespace = "com.animeblack.feature.chat"
}

dependencies {
    implementation(libs.androidx.media3.exoplayer)
    implementation(libs.androidx.media3.ui)
    implementation(libs.coil.gif)
}
