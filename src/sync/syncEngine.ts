import {
  collection,
  doc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
  getDoc,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  QueryDocumentSnapshot,
  DocumentData,
  Unsubscribe
} from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { observability } from '../services/observability';

export interface SyncOptions<T> {
  onData: (data: T[]) => void;
  onError?: (error: Error) => void;
  pageSize?: number;
}

export class SyncEngine {
  private activeListeners: Map<string, Unsubscribe> = new Map();
  private cursorMap: Map<string, QueryDocumentSnapshot<DocumentData>> = new Map();

  /**
   * Register a real-time listener with automatic deduplication
   */
  public subscribe<T>(
    key: string,
    setupQuery: () => any,
    callback: (items: T[]) => void,
    onError?: (err: Error) => void
  ): () => void {
    // If a listener already exists for this key, unsubscribe it first to prevent duplicates
    if (this.activeListeners.has(key)) {
      this.activeListeners.get(key)!();
      this.activeListeners.delete(key);
    }

    try {
      const q = setupQuery();
      const unsub = onSnapshot(
        q,
        (snapshot: any) => {
          const items: T[] = [];
          snapshot.forEach((docSnap: any) => {
            items.push({ id: docSnap.id, ...docSnap.data() } as T);
          });
          callback(items);
        },
        (error: any) => {
          observability.captureError(error, { context: 'sync_listener_error', key });
          if (onError) onError(error);
        }
      );

      this.activeListeners.set(key, unsub);

      return () => {
        unsub();
        this.activeListeners.delete(key);
      };
    } catch (e) {
      observability.captureError(e, { context: 'sync_setup_exception', key });
      return () => {};
    }
  }

  /**
   * Unsubscribe from all active listeners (Crucial for Account Switching and Page Navigation)
   */
  public unsubscribeAll() {
    this.activeListeners.forEach((unsub) => {
      try {
        unsub();
      } catch (e) {
        // Safe disposal
      }
    });
    this.activeListeners.clear();
    this.cursorMap.clear();
  }

  /**
   * Paginated query loader with cursor
   */
  public async loadPage<T>(
    collectionName: string,
    orderField: string = 'createdAt',
    direction: 'asc' | 'desc' = 'desc',
    pageSize: number = 20,
    filterField?: string,
    filterValue?: any
  ): Promise<{ items: T[]; hasMore: boolean }> {
    const start = performance.now();
    try {
      const colRef = collection(db, collectionName);
      let q = filterField && filterValue !== undefined
        ? query(colRef, where(filterField, '==', filterValue), orderBy(orderField, direction), limit(pageSize))
        : query(colRef, orderBy(orderField, direction), limit(pageSize));

      const cursorKey = `${collectionName}_${filterField || 'all'}`;
      const lastCursor = this.cursorMap.get(cursorKey);
      if (lastCursor) {
        q = filterField && filterValue !== undefined
          ? query(colRef, where(filterField, '==', filterValue), orderBy(orderField, direction), startAfter(lastCursor), limit(pageSize))
          : query(colRef, orderBy(orderField, direction), startAfter(lastCursor), limit(pageSize));
      }

      const snapshot = await getDocs(q);
      const items: T[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...docSnap.data() } as T);
      });

      if (!snapshot.empty) {
        this.cursorMap.set(cursorKey, snapshot.docs[snapshot.docs.length - 1]);
      }

      observability.recordLatency(Math.round(performance.now() - start));
      return {
        items,
        hasMore: snapshot.docs.length >= pageSize
      };
    } catch (error) {
      observability.captureError(error, { context: 'load_page_failed', collectionName });
      throw error;
    }
  }

  /**
   * Reset pagination cursors
   */
  public resetPagination(collectionName?: string) {
    if (collectionName) {
      Array.from(this.cursorMap.keys())
        .filter(k => k.startsWith(collectionName))
        .forEach(k => this.cursorMap.delete(k));
    } else {
      this.cursorMap.clear();
    }
  }

  /**
   * Optimistic write helper: executes local optimistic update immediately,
   * commits write to Firestore, and rolls back if write fails.
   */
  public async optimisticWrite<T>(
    collectionName: string,
    docId: string,
    data: Partial<T>,
    onOptimisticApply: (optimisticItem: T) => void,
    onRollback: (previousItem: T | null) => void,
    previousItem: T | null = null
  ): Promise<void> {
    // 1. Apply optimistic UI update immediately
    const optimisticPayload = { id: docId, ...data, updatedAt: Date.now() } as unknown as T;
    onOptimisticApply(optimisticPayload);

    try {
      // 2. Commit to Firestore
      const docRef = doc(db, collectionName, docId);
      await setDoc(docRef, { ...data, updatedAt: serverTimestamp() }, { merge: true });
    } catch (error) {
      // 3. Rollback on failure
      onRollback(previousItem);
      observability.captureError(error, { context: 'optimistic_write_failed', collectionName, docId });
      throw error;
    }
  }
}

export const syncEngine = new SyncEngine();
