plugins {
    alias(libs.plugins.animeblack.android.feature)
}

android {
    namespace = "com.animeblack.feature.profile"
}

dependencies {
    implementation(libs.androidx.paging.compose)
}
