import { describe, it, expect } from 'vitest';
import { StoryCreateSchema, ChatMessageSchema, ReportCreateSchema } from '../src/core/security';

describe('Zero-Trust Security & Schema Integrity Tests', () => {
  it('should validate complete story payload and reject duration out of bounds', () => {
    const validStory = {
      userId: 'user_otaku_1',
      userName: 'غوكو',
      userAvatar: 'https://example.com/goku.png',
      mediaUrl: 'https://example.com/story.jpg',
      mediaType: 'image' as const,
      caption: 'حلقة أسطورية اليوم!',
      duration: 5,
      expiresAt: Date.now() + 86400000,
      createdAt: Date.now()
    };

    expect(StoryCreateSchema.safeParse(validStory).success).toBe(true);

    // Invalid story: duration 60s exceeds max 30s limit
    const invalidDurationStory = { ...validStory, duration: 60 };
    expect(StoryCreateSchema.safeParse(invalidDurationStory).success).toBe(false);
  });

  it('should validate chat message schema and enforce character limits', () => {
    const validMsg = {
      senderId: 'user_1',
      senderName: 'كونان',
      senderAvatar: '/conan.png',
      text: 'الحقيقة دائمًا واحدة!',
      mediaType: 'none' as const,
      createdAt: Date.now(),
      status: 'sent' as const
    };

    expect(ChatMessageSchema.safeParse(validMsg).success).toBe(true);

    // Oversized text message (exceeds 3000 chars)
    const oversizedMsg = { ...validMsg, text: 'م'.repeat(3500) };
    expect(ChatMessageSchema.safeParse(oversizedMsg).success).toBe(false);
  });

  it('should validate report creation schema', () => {
    const validReport = {
      targetId: 'post_999',
      targetType: 'post' as const,
      reason: 'محتوى مخالف لشروط المجتمع',
      reporterId: 'user_456',
      createdAt: Date.now(),
      status: 'pending' as const
    };

    expect(ReportCreateSchema.safeParse(validReport).success).toBe(true);
  });
});
