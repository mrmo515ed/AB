plugins {
    alias(libs.plugins.animeblack.android.feature)
}

android {
    namespace = "com.animeblack.feature.profile"
}

dependencies {
    implementation(libs.androidx.paging.compose)
    // QR code for the shareable profile card (the web generated it with a JS QR library).
    implementation(libs.zxing.core)
}
