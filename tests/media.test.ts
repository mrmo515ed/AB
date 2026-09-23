import { describe, it, expect, vi, beforeEach } from 'vitest';

// عزل كامل: لا اتصال بأي Firebase حقيقي أثناء اختبارات الوسائط
vi.mock('../src/config/firebase', () => {
  const fakeAuth = { currentUser: null };
  return {
    getFirebaseRuntime: () => ({ app: {}, db: {}, auth: fakeAuth, storage: {}, googleProvider: {} }),
    getDb: () => ({}),
    getAuth: () => fakeAuth,
    getStorage: () => ({}),
    getApp: () => ({}),
    getGoogleProvider: () => ({}),
    getMessagingSafe: async () => null,
    firebaseConfig: {}
  };
});

import { MediaUploadManager } from '../src/media/uploadManager';
import { getAuth } from '../src/config/firebase';

describe('Media Upload Pipeline & Memory Safety', () => {
  let auth: { currentUser: unknown };

  beforeEach(() => {
    // Mock authenticated user session (عبر الموصل lazy)
    auth = getAuth() as unknown as { currentUser: unknown };
    Object.defineProperty(auth, 'currentUser', {
      value: { uid: 'test_user_otaku_1', email: 'otaku@example.com' },
      configurable: true,
      writable: true
    });
  });

  it('should reject files exceeding maximum allowed size', async () => {
    const largeBlob = {
      size: 60 * 1024 * 1024,
      type: 'image/png'
    } as unknown as Blob;

    await expect(
      MediaUploadManager.uploadMedia(largeBlob, {
        path: 'posts',
        maxSizeBytes: 50 * 1024 * 1024
      })
    ).rejects.toThrow('حجم الملف يتجاوز الحد المسموح به');
  });

  it('should reject unallowed MIME types', async () => {
    const invalidFile = {
      size: 1024 * 1024,
      type: 'application/x-msdownload'
    } as unknown as Blob;

    await expect(
      MediaUploadManager.uploadMedia(invalidFile, {
        path: 'posts',
        allowedMimeTypes: ['image/*', 'video/*']
      })
    ).rejects.toThrow('غير مدعوم');
  });

  it('should safely create and provide revoke hook for preview Blob URLs', () => {
    const fakeBlob = new Blob(['sample-anime-art'], { type: 'image/png' });
    global.URL.createObjectURL = vi.fn().mockReturnValue('blob:http://localhost:3000/1234');
    global.URL.revokeObjectURL = vi.fn();

    const preview = MediaUploadManager.createPreviewURL(fakeBlob);
    expect(preview.url).toBe('blob:http://localhost:3000/1234');

    preview.revoke();
    expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('blob:http://localhost:3000/1234');
  });
});
