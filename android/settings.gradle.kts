pluginManagement {
    includeBuild("build-logic")
    repositories {
        google {
            content {
                includeGroupByRegex("com\\.android.*")
                includeGroupByRegex("com\\.google.*")
                includeGroupByRegex("androidx.*")
            }
        }
        mavenCentral()
        gradlePluginPortal()
    }
}

dependencyResolutionManagement {
    repositoriesMode = RepositoriesMode.FAIL_ON_PROJECT_REPOS
    repositories {
        google {
            content {
                includeGroupByRegex("com\\.android.*")
                includeGroupByRegex("com\\.google.*")
                includeGroupByRegex("androidx.*")
            }
        }
        mavenCentral()
    }
}

rootProject.name = "AnimeBlack"

include(":app")

include(":core:model")
include(":core:common")
include(":core:designsystem")
include(":core:ui")
include(":core:navigation")
include(":core:datastore")
include(":core:database")
include(":core:data")

include(":feature:auth")
include(":feature:home")
include(":feature:community")
include(":feature:chat")
include(":feature:reels")
include(":feature:profile")
include(":feature:notifications")
include(":feature:search")
include(":feature:settings")
include(":feature:more")
include(":feature:anime")
include(":feature:games")
include(":feature:admin")

check(JavaVersion.current().isCompatibleWith(JavaVersion.VERSION_17)) {
    "Anime Black requires JDK 17+ to build (current: ${JavaVersion.current()})."
}
