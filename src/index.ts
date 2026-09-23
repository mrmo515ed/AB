import { app, db, auth, storage, googleProvider } from './config/firebase';
import { sanitizeHTML, sanitizePlainText, UserProfileSchema, PostCreateSchema, ChatMessageSchema } from './core/security';
import { observability } from './services/observability';
import { MediaUploadManager } from './media/uploadManager';
import { syncEngine } from './sync/syncEngine';
import { cacheManager } from './cache/cacheManager';
import { FCMNotificationManager } from './notifications/fcmManager';
import { MetricsCollector } from './admin/metricsCollector';
import { animeService, AniListProvider, JikanProvider } from './services/animeProvider';

// Initialize global observability
observability.init();

// Export all modules
export {
  app,
  db,
  auth,
  storage,
  googleProvider,
  sanitizeHTML,
  sanitizePlainText,
  UserProfileSchema,
  PostCreateSchema,
  ChatMessageSchema,
  observability,
  MediaUploadManager,
  syncEngine,
  cacheManager,
  FCMNotificationManager,
  MetricsCollector,
  animeService,
  AniListProvider,
  JikanProvider
};

// Global Browser Bridge (Window Object Compatibility)
if (typeof window !== 'undefined') {
  (window as any).AnimeBlackCore = {
    app,
    db,
    auth,
    storage,
    googleProvider,
    sanitizeHTML,
    sanitizePlainText,
    UserProfileSchema,
    PostCreateSchema,
    ChatMessageSchema,
    observability,
    MediaUploadManager,
    syncEngine,
    cacheManager,
    FCMNotificationManager,
    MetricsCollector,
    animeService,
    AniListProvider,
    JikanProvider
  };
}
