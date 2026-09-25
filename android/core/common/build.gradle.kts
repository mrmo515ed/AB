plugins {
    alias(libs.plugins.animeblack.android.library)
    alias(libs.plugins.animeblack.hilt)
}

android {
    namespace = "com.animeblack.core.common"
}

dependencies {
    api(project(":core:model"))
    implementation(libs.androidx.core.ktx)
    api(libs.kotlinx.coroutines.android)
    testImplementation(libs.turbine)
}
