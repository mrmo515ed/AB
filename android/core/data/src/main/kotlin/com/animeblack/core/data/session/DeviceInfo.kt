package com.animeblack.core.data.session

import android.os.Build
import com.animeblack.core.common.config.AppConfig

internal object DeviceInfo {
    fun deviceName(): String = "${Build.MANUFACTURER.replaceFirstChar { it.uppercase() }} ${Build.MODEL}".trim()

    fun userAgent(config: AppConfig): String =
        "AnimeBlack/${config.versionName} (Android ${Build.VERSION.RELEASE}; SDK ${Build.VERSION.SDK_INT}; ${deviceName()})"
}
