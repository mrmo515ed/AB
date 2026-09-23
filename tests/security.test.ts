import { describe, it, expect } from 'vitest';
import { sanitizeHTML, sanitizePlainText, UserProfileSchema, PostCreateSchema } from '../src/core/security';
import { CacheManager } from '../src/cache/cacheManager';

describe('Core Security & Input Sanitization', () => {
  it('should strip malicious script tags from HTML', () => {
    const malicious = '<p>مرحبا بكم <script>alert("hacked")</script> في أنمي بلاك</p>';
    const cleaned = sanitizeHTML(malicious);
    expect(cleaned).not.toContain('<script>');
    expect(cleaned).toContain('مرحبا بكم');
  });

  it('should sanitize plain text completely', () => {
    const malicious = '<b>نص عادي</b><img src=x onerror=alert(1)>';
    const cleaned = sanitizePlainText(malicious);
    expect(cleaned).toBe('نص عادي');
  });

  it('should validate valid user profile schema', () => {
    const validProfile = {
      id: 'usr_123',
      name: 'كايتو كيد',
      username: 'kaito_kid',
      email: 'kaito@example.com',
      avatar: 'https://example.com/avatar.png',
      bio: 'عاشق الأنمي',
      role: 'Otaku' as const,
      level: 10,
      coins: 500,
      stars: 5,
      reputation: 99,
      followers: 20,
      following: 15,
      joined: Date.now(),
      verified: true
    };

    const result = UserProfileSchema.safeParse(validProfile);
    expect(result.success).toBe(true);
  });

  it('should reject invalid username with special characters', () => {
    const invalidProfile = {
      id: 'usr_123',
      name: 'كايتو',
      username: 'kaito@hacker!', // Invalid characters
      email: 'kaito@example.com',
      avatar: '/avatar.png'
    };

    const result = UserProfileSchema.safeParse(invalidProfile);
    expect(result.success).toBe(false);
  });

  it('should enforce post max text length', () => {
    const longText = 'أ'.repeat(6000);
    const postData = {
      text: longText,
      authorId: 'user_1',
      authorName: 'User',
      type: 'text' as const
    };

    const result = PostCreateSchema.safeParse(postData);
    expect(result.success).toBe(false);
  });
});

describe('Layered Cache & Account Isolation', () => {
  it('should isolate private user cache across accounts', () => {
    const cache = new CacheManager();
    cache.setCurrentUser('user_A');
    cache.set('private_draft', { text: 'مسودة الحساب الأول' }, 60000, true);

    // Read by user A
    expect(cache.get('private_draft')).toEqual({ text: 'مسودة الحساب الأول' });

    // Switch to user B
    cache.setCurrentUser('user_B');

    // User B should NOT have access to user A's private cache
    expect(cache.get('private_draft')).toBeNull();
  });

  it('should respect TTL expiration', async () => {
    const cache = new CacheManager();
    cache.set('temp_key', 'some_value', 10); // 10ms TTL
    await new Promise(r => setTimeout(r, 20));
    expect(cache.get('temp_key')).toBeNull();
  });
});
