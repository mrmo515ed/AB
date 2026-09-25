import com.animeblack.buildlogic.libs
import org.gradle.api.Plugin
import org.gradle.api.Project
import org.gradle.kotlin.dsl.apply
import org.gradle.kotlin.dsl.dependencies
import org.gradle.kotlin.dsl.project

/** A feature module: Android library + Compose + Hilt + the shared core modules. */
class AndroidFeatureConventionPlugin : Plugin<Project> {
    override fun apply(target: Project) {
        with(target) {
            apply(plugin = "animeblack.android.library")
            apply(plugin = "animeblack.android.compose")
            apply(plugin = "animeblack.hilt")

            dependencies {
                "implementation"(project(":core:model"))
                "implementation"(project(":core:common"))
                "implementation"(project(":core:designsystem"))
                "implementation"(project(":core:ui"))
                "implementation"(project(":core:navigation"))
                "implementation"(project(":core:data"))
                "implementation"(libs.findLibrary("androidx-lifecycle-runtime-compose").get())
                "implementation"(libs.findLibrary("androidx-lifecycle-viewmodel-compose").get())
                "implementation"(libs.findLibrary("androidx-navigation-compose").get())
                "implementation"(libs.findLibrary("androidx-activity-compose").get())
                "implementation"(libs.findLibrary("androidx-core-ktx").get())
                "implementation"(libs.findLibrary("androidx-hilt-navigation-compose").get())
                "implementation"(libs.findLibrary("androidx-hilt-lifecycle-viewmodel-compose").get())
                "implementation"(libs.findLibrary("coil-compose").get())
                "implementation"(libs.findLibrary("kotlinx-coroutines-android").get())
                "testImplementation"(libs.findLibrary("mockk").get())
                "testImplementation"(libs.findLibrary("turbine").get())
            }
        }
    }
}
