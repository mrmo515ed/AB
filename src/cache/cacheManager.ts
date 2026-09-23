// ============================================================
// Layered Bounded Cache Manager
// ============================================================
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttlMs: number;
  userId?: string;
}

export class CacheManager {
  private static readonly L1_MAX_ITEMS = 150;
  private l1MemoryCache: Map<string, CacheEntry<any>> = new Map();
  private currentUserId: string | null = null;

  public setCurrentUser(userId: string | null) {
    if (this.currentUserId !== userId) {
      // Clear user-specific cached entries upon account switch
      this.clearUserCache();
      this.currentUserId = userId;
    }
  }

  /**
   * Set cache entry in L1 memory with bounded size and TTL
   */
  public set<T>(key: string, data: T, ttlMs: number = 5 * 60 * 1000, isPrivate: boolean = false) {
    if (this.l1MemoryCache.size >= CacheManager.L1_MAX_ITEMS) {
      // Evict oldest entry (LRU simple eviction)
      const oldestKey = this.l1MemoryCache.keys().next().value;
      if (oldestKey) this.l1MemoryCache.delete(oldestKey);
    }

    this.l1MemoryCache.set(key, {
      data,
      timestamp: Date.now(),
      ttlMs,
      userId: isPrivate ? this.currentUserId || undefined : undefined
    });
  }

  /**
   * Get cache entry if valid and belongs to current user session
   */
  public get<T>(key: string): T | null {
    const entry = this.l1MemoryCache.get(key);
    if (!entry) return null;

    // Check TTL expiration
    if (Date.now() - entry.timestamp > entry.ttlMs) {
      this.l1MemoryCache.delete(key);
      return null;
    }

    // Check account isolation
    if (entry.userId && entry.userId !== this.currentUserId) {
      return null;
    }

    return entry.data as T;
  }

  /**
   * Clear all private user-scoped data
   */
  public clearUserCache() {
    Array.from(this.l1MemoryCache.entries()).forEach(([key, entry]) => {
      if (entry.userId) {
        this.l1MemoryCache.delete(key);
      }
    });
  }

  /**
   * Complete flush of all memory caches
   */
  public clearAll() {
    this.l1MemoryCache.clear();
  }
}

export const cacheManager = new CacheManager();
