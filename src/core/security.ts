import DOMPurify from 'dompurify';
import { z } from 'zod';

// Helper to safely obtain sanitizer in both Browser and Node/Testing environments
function getSanitizer() {
  if (typeof window !== 'undefined') {
    if (typeof (DOMPurify as any).sanitize === 'function') {
      return DOMPurify;
    }
    if (typeof (DOMPurify as any) === 'function') {
      return (DOMPurify as any)(window);
    }
  }
  // Node / Non-DOM environment fallback
  return {
    sanitize: (dirty: string, options?: any) => {
      if (!dirty) return '';
      if (options?.ALLOWED_TAGS && options.ALLOWED_TAGS.length === 0) {
        return dirty.replace(/<[^>]*>/g, '').trim();
      }
      return dirty.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    }
  };
}

const sanitizer = getSanitizer();

// ============================================================
// HTML & Text Sanitization (Anti-XSS Protection)
// ============================================================
export function sanitizeHTML(dirty: string): string {
  if (!dirty || typeof dirty !== 'string') return '';
  return sanitizer.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'span', 'p', 'br', 'ul', 'ol', 'li', 'code', 'pre', 'blockquote'],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'style'],
    ALLOW_DATA_ATTR: false
  });
}

export function sanitizePlainText(dirty: string): string {
  if (!dirty || typeof dirty !== 'string') return '';
  return sanitizer.sanitize(dirty, { ALLOWED_TAGS: [] }).trim();
}

// ============================================================
// Zod Domain Validation Schemas
// ============================================================
export const UserProfileSchema = z.object({
  id: z.string().min(1).max(128),
  name: z.string().min(1).max(60),
  username: z.string().min(2).max(40).regex(/^[a-zA-Z0-9_]+$/, {
    message: 'اسم المستخدم يجب أن يحتوي على حروف إنجليزية وأرقام و _ فقط'
  }),
  email: z.string().email(),
  avatar: z.string().url().or(z.string().startsWith('/')),
  bio: z.string().max(500).default(''),
  role: z.enum(['Member', 'Otaku', 'Hero', 'Moderator', 'SeniorModerator', 'SuperAdministrator', 'Developer', 'Owner']).default('Member'),
  level: z.number().int().min(1).default(1),
  coins: z.number().int().min(0).default(100),
  stars: z.number().int().min(0).default(0),
  reputation: z.number().int().min(0).default(10),
  followers: z.number().int().min(0).default(0),
  following: z.number().int().min(0).default(0),
  joined: z.number().int().positive().default(() => Date.now()),
  verified: z.boolean().default(false)
});

export const PostCreateSchema = z.object({
  text: z.string().min(1, 'نص المنشور مطلوب').max(5000, 'الحد الأقصى للمنشور هو 5000 حرف'),
  authorId: z.string().min(1).max(128),
  authorName: z.string().min(1).max(60),
  authorAvatar: z.string().default(''),
  type: z.enum(['text', 'image', 'video', 'poll', 'quote']).default('text'),
  mediaUrl: z.string().url().optional().or(z.literal('')),
  mediaType: z.string().optional(),
  tags: z.array(z.string().max(30)).max(10).default([]),
  likesCount: z.number().int().min(0).default(0),
  commentsCount: z.number().int().min(0).default(0),
  views: z.number().int().min(0).default(0),
  createdAt: z.number().int().positive().default(() => Date.now())
});

export const ChatMessageSchema = z.object({
  senderId: z.string().min(1).max(128),
  senderName: z.string().min(1).max(60),
  senderAvatar: z.string().default(''),
  text: z.string().max(3000, 'الحد الأقصى للرسالة هو 3000 حرف').default(''),
  mediaUrl: z.string().url().optional().or(z.literal('')),
  mediaType: z.enum(['image', 'video', 'audio', 'file', 'none']).default('none'),
  replyTo: z.object({
    id: z.string(),
    senderName: z.string(),
    text: z.string().max(100)
  }).optional(),
  createdAt: z.number().int().positive().default(() => Date.now()),
  status: z.enum(['sent', 'delivered', 'read']).default('sent')
});

export const StoryCreateSchema = z.object({
  userId: z.string().min(1).max(128),
  userName: z.string().min(1).max(60),
  userAvatar: z.string().default(''),
  mediaUrl: z.string().url(),
  mediaType: z.enum(['image', 'video']),
  caption: z.string().max(280).default(''),
  duration: z.number().int().min(3).max(30).default(5),
  expiresAt: z.number().int().positive(),
  createdAt: z.number().int().positive().default(() => Date.now())
});

export const ReportCreateSchema = z.object({
  targetId: z.string().min(1).max(128),
  targetType: z.enum(['post', 'user', 'comment', 'message', 'story', 'community']),
  reason: z.string().min(3).max(500),
  reporterId: z.string().min(1).max(128),
  createdAt: z.number().int().positive().default(() => Date.now()),
  status: z.enum(['pending', 'reviewed', 'dismissed', 'action_taken']).default('pending')
});

export type UserProfile = z.infer<typeof UserProfileSchema>;
export type PostCreate = z.infer<typeof PostCreateSchema>;
export type ChatMessage = z.infer<typeof ChatMessageSchema>;
export type StoryCreate = z.infer<typeof StoryCreateSchema>;
export type ReportCreate = z.infer<typeof ReportCreateSchema>;
