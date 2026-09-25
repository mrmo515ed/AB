package com.animeblack.core.common.util

import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent

/** Injectable time source so time-dependent logic (typing, stories, cooldowns) is testable. */
fun interface Clock {
    fun now(): Long
}

@Module
@InstallIn(SingletonComponent::class)
object ClockModule {
    @Provides
    fun providesClock(): Clock = Clock { System.currentTimeMillis() }
}
