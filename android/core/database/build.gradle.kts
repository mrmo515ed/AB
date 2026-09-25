plugins {
    alias(libs.plugins.animeblack.android.library)
    alias(libs.plugins.animeblack.android.room)
    alias(libs.plugins.animeblack.hilt)
}

android {
    namespace = "com.animeblack.core.database"
}

dependencies {
    implementation(project(":core:model"))
    implementation(project(":core:common"))
}
