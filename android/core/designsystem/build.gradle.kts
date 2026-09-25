plugins {
    alias(libs.plugins.animeblack.android.library)
    alias(libs.plugins.animeblack.android.compose)
}

android {
    namespace = "com.animeblack.core.designsystem"
}

dependencies {
    implementation(libs.androidx.core.ktx)
    api(libs.androidx.compose.material3)
    api(libs.androidx.compose.foundation)
    implementation(libs.coil.compose)
}
