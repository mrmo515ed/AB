package com.animeblack.core.database

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Database(entities = [PendingOperation::class], version = 1, exportSchema = true)
abstract class AnimeBlackDatabase : RoomDatabase() {
    abstract fun pendingOperationDao(): PendingOperationDao
}

@Module
@InstallIn(SingletonComponent::class)
object DatabaseModule {
    @Provides
    @Singleton
    fun providesDatabase(@ApplicationContext context: Context): AnimeBlackDatabase =
        Room.databaseBuilder(context, AnimeBlackDatabase::class.java, "anime_black.db").build()

    @Provides
    fun providesPendingOperationDao(db: AnimeBlackDatabase): PendingOperationDao = db.pendingOperationDao()
}
