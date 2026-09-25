import com.android.build.api.dsl.CommonExtension
import com.animeblack.buildlogic.configureAndroidCompose
import org.gradle.api.Plugin
import org.gradle.api.Project
import org.gradle.kotlin.dsl.apply

/** Apply after animeblack.android.application or animeblack.android.library. */
class AndroidComposeConventionPlugin : Plugin<Project> {
    override fun apply(target: Project) {
        with(target) {
            apply(plugin = "org.jetbrains.kotlin.plugin.compose")
            val android = extensions.getByName("android") as CommonExtension
            configureAndroidCompose(android)
        }
    }
}
