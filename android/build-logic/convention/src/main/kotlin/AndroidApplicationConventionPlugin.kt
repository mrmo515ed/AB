import com.android.build.api.dsl.ApplicationExtension
import com.animeblack.buildlogic.configureKotlinAndroid
import com.animeblack.buildlogic.intVersion
import com.animeblack.buildlogic.libs
import org.gradle.api.Plugin
import org.gradle.api.Project
import org.gradle.kotlin.dsl.apply
import org.gradle.kotlin.dsl.configure

class AndroidApplicationConventionPlugin : Plugin<Project> {
    override fun apply(target: Project) {
        with(target) {
            apply(plugin = "com.android.application")

            extensions.configure<ApplicationExtension> {
                configureKotlinAndroid(this)
                defaultConfig.targetSdk = libs.intVersion("targetSdk")
                defaultConfig.testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
                testOptions.animationsDisabled = true
                testOptions.unitTests.isIncludeAndroidResources = true
                packaging.resources.excludes.addAll(
                    listOf(
                        "/META-INF/{AL2.0,LGPL2.1}",
                        "/META-INF/LICENSE*",
                        "/META-INF/NOTICE*",
                        "/META-INF/*.kotlin_module",
                        "/META-INF/versions/9/previous-compilation-data.bin",
                    ),
                )
            }
        }
    }
}
