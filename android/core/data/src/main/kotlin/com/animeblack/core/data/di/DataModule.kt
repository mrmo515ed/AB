package com.animeblack.core.data.di

import com.animeblack.core.data.media.MediaPreparer
import com.animeblack.core.data.repository.AdminRepository
import com.animeblack.core.data.repository.AnimeRepository
import com.animeblack.core.data.repository.AuthRepository
import com.animeblack.core.data.repository.ChatRepository
import com.animeblack.core.data.repository.CommunityRepository
import com.animeblack.core.data.repository.EconomyRepository
import com.animeblack.core.data.repository.GameRepository
import com.animeblack.core.data.repository.MediaRepository
import com.animeblack.core.data.repository.NotificationRepository
import com.animeblack.core.data.repository.PostRepository
import com.animeblack.core.data.repository.ReelRepository
import com.animeblack.core.data.repository.ReportRepository
import com.animeblack.core.data.repository.SessionRepository
import com.animeblack.core.data.repository.StoryRepository
import com.animeblack.core.data.repository.SyncRepository
import com.animeblack.core.data.repository.UserRepository
import com.animeblack.core.data.repository.WorkspaceRepository
import com.animeblack.core.data.repository.impl.DefaultAnimeRepository
import com.animeblack.core.data.repository.impl.DefaultSyncRepository
import com.animeblack.core.data.repository.impl.FirebaseAuthRepository
import com.animeblack.core.data.repository.impl.FirestoreAdminRepository
import com.animeblack.core.data.repository.impl.FirestoreChatRepository
import com.animeblack.core.data.repository.impl.FirestoreCommunityRepository
import com.animeblack.core.data.repository.impl.FirestoreGameRepository
import com.animeblack.core.data.repository.impl.FirestoreNotificationRepository
import com.animeblack.core.data.repository.impl.FirestorePostRepository
import com.animeblack.core.data.repository.impl.FirestoreReelRepository
import com.animeblack.core.data.repository.impl.FirestoreReportRepository
import com.animeblack.core.data.repository.impl.FirestoreStoryRepository
import com.animeblack.core.data.repository.impl.FirestoreUserRepository
import com.animeblack.core.data.repository.impl.FirestoreWorkspaceRepository
import com.animeblack.core.data.repository.impl.FunctionsEconomyRepository
import com.animeblack.core.data.session.SessionManager
import dagger.Binds
import dagger.Module
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent

/** Binds every repository interface to its Firebase implementation (swap here to replace the backend). */
@Module
@InstallIn(SingletonComponent::class)
abstract class DataModule {
    @Binds abstract fun auth(impl: FirebaseAuthRepository): AuthRepository
    @Binds abstract fun users(impl: FirestoreUserRepository): UserRepository
    @Binds abstract fun posts(impl: FirestorePostRepository): PostRepository
    @Binds abstract fun stories(impl: FirestoreStoryRepository): StoryRepository
    @Binds abstract fun reels(impl: FirestoreReelRepository): ReelRepository
    @Binds abstract fun chats(impl: FirestoreChatRepository): ChatRepository
    @Binds abstract fun communities(impl: FirestoreCommunityRepository): CommunityRepository
    @Binds abstract fun notifications(impl: FirestoreNotificationRepository): NotificationRepository
    @Binds abstract fun economy(impl: FunctionsEconomyRepository): EconomyRepository
    @Binds abstract fun anime(impl: DefaultAnimeRepository): AnimeRepository
    @Binds abstract fun games(impl: FirestoreGameRepository): GameRepository
    @Binds abstract fun admin(impl: FirestoreAdminRepository): AdminRepository
    @Binds abstract fun reports(impl: FirestoreReportRepository): ReportRepository
    @Binds abstract fun workspace(impl: FirestoreWorkspaceRepository): WorkspaceRepository
    @Binds abstract fun sessions(impl: SessionManager): SessionRepository
    @Binds abstract fun sync(impl: DefaultSyncRepository): SyncRepository
    @Binds abstract fun media(impl: MediaPreparer): MediaRepository
}
