import {
  getFirebaseRuntime,
  getDb,
  getAuth,
  getStorage,
  getApp,
  getGoogleProvider,
  getMessagingSafe,
  firebaseConfig
} from './config/firebase';
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

// Export all modules (lazy accessors — لا تهيئة Firebase عند مجرد التحميل)
export {
  firebaseConfig,
  getFirebaseRuntime,
  getDb,
  getAuth,
  getStorage,
  getApp,
  getGoogleProvider,
  getMessagingSafe,
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
// ملاحظة: لم نعد نصدّر كائنات Firebase ساخنة (كانت تنشئ تطبيق SDK ثانياً بجانب جسر CDN).
// الموصلات lazy تعيد استخدام مثيل جسر CDN نفسه عند أول استخدام.
if (typeof window !== 'undefined') {
  (window as any).AnimeBlackCore = {
    firebaseConfig,
    getFirebaseRuntime,
    getDb,
    getAuth,
    getStorage,
    getApp,
    getGoogleProvider,
    getMessagingSafe,
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
