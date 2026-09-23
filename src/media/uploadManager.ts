import { ref, uploadBytesResumable, getDownloadURL, UploadTaskSnapshot } from 'firebase/storage';
import pLimit from 'p-limit';
import { storage, auth } from '../config/firebase';
import { observability } from '../services/observability';

export interface UploadProgressInfo {
  bytesTransferred: number;
  totalBytes: number;
  percentage: number;
  state: 'running' | 'paused' | 'success' | 'error';
}

export interface UploadOptions {
  path: 'users' | 'posts' | 'stories' | 'reels' | 'chats' | 'groups' | 'communities' | 'assets';
  subFolder?: string;
  customFileName?: string;
  maxSizeBytes?: number;
  allowedMimeTypes?: string[];
  onProgress?: (progress: UploadProgressInfo) => void;
}

// Concurrency limiter: max 3 simultaneous cloud uploads to protect client bandwidth
const uploadLimiter = pLimit(3);

export class MediaUploadManager {
  private static defaultMaxSizes: Record<string, number> = {
    users: 15 * 1024 * 1024,      // 15MB
    posts: 50 * 1024 * 1024,      // 50MB
    stories: 50 * 1024 * 1024,    // 50MB
    reels: 100 * 1024 * 1024,     // 100MB
    chats: 30 * 1024 * 1024,      // 30MB
    groups: 30 * 1024 * 1024,     // 30MB
    communities: 30 * 1024 * 1024,// 30MB
    assets: 15 * 1024 * 1024      // 15MB
  };

  /**
   * Uploads a media file directly to Firebase Storage with concurrency limits, progress tracking,
   * and retry logic. Never stores raw DataURL in cloud documents.
   */
  public static async uploadMedia(file: File | Blob, options: UploadOptions): Promise<string> {
    return uploadLimiter(async () => {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('يجب تسجيل الدخول أولاً لرفع الوسائط.');
      }

      // Validate MIME type
      const mimeType = file.type || 'application/octet-stream';
      if (options.allowedMimeTypes && options.allowedMimeTypes.length > 0) {
        const isAllowed = options.allowedMimeTypes.some(allowed => 
          allowed.endsWith('/*') ? mimeType.startsWith(allowed.replace('/*', '')) : mimeType === allowed
        );
        if (!isAllowed) {
          throw new Error(`نوع الملف (${mimeType}) غير مدعوم.`);
        }
      }

      // Validate File Size
      const maxSize = options.maxSizeBytes || this.defaultMaxSizes[options.path] || (25 * 1024 * 1024);
      if (file.size > maxSize) {
        const sizeMB = Math.round(maxSize / (1024 * 1024));
        throw new Error(`حجم الملف يتجاوز الحد المسموح به (${sizeMB} ميجابايت).`);
      }

      // Build Safe Storage Path
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 9);
      const extension = (file instanceof File && file.name.includes('.')) 
        ? file.name.split('.').pop()?.toLowerCase() || 'bin'
        : mimeType.split('/')[1] || 'bin';
      
      const fileName = options.customFileName || `${timestamp}_${randomStr}.${extension}`;
      
      let storagePath = `${options.path}/${user.uid}/${fileName}`;
      if (options.path === 'chats' || options.path === 'groups' || options.path === 'communities') {
        const sub = options.subFolder || 'general';
        storagePath = `${options.path}/${sub}/${user.uid}/${fileName}`;
      }

      const storageRef = ref(storage, storagePath);

      // Perform Resumable Upload with Retry
      let retries = 3;
      let lastError: unknown = null;

      while (retries > 0) {
        try {
          const downloadUrl = await new Promise<string>((resolve, reject) => {
            const uploadTask = uploadBytesResumable(storageRef, file, {
              contentType: mimeType,
              cacheControl: 'public, max-age=31536000'
            });

            uploadTask.on(
              'state_changed',
              (snapshot: UploadTaskSnapshot) => {
                const percentage = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                if (options.onProgress) {
                  options.onProgress({
                    bytesTransferred: snapshot.bytesTransferred,
                    totalBytes: snapshot.totalBytes,
                    percentage: percentage,
                    state: snapshot.state as 'running' | 'paused' | 'success' | 'error'
                  });
                }
              },
              (error) => {
                reject(error);
              },
              async () => {
                try {
                  const url = await getDownloadURL(uploadTask.snapshot.ref);
                  resolve(url);
                } catch (urlErr) {
                  reject(urlErr);
                }
              }
            );
          });

          return downloadUrl;
        } catch (err) {
          lastError = err;
          retries--;
          if (retries > 0) {
            // Exponential backoff
            await new Promise(r => setTimeout(r, (4 - retries) * 1000));
          }
        }
      }

      observability.captureError(lastError, { context: 'media_upload_failed', path: storagePath });
      throw new Error('فشل رفع الملف إلى السحابة. يرجى التحقق من اتصال الإنترنت والمحاولة ثانية.');
    });
  }

  /**
   * Helper to create temporary preview object URLs and revoke them cleanly
   */
  public static createPreviewURL(blob: Blob): { url: string; revoke: () => void } {
    const url = URL.createObjectURL(blob);
    return {
      url,
      revoke: () => URL.revokeObjectURL(url)
    };
  }
}
