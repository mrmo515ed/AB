plugins {
    alias(libs.plugins.animeblack.android.feature)
}

android {
    namespace = "com.animeblack.feature.more"
}

dependencies {
    implementation(libs.androidx.paging.compose)
}
