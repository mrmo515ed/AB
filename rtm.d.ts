/** تعريفات أنواع لـ rtm.js (يستخدمها tsc عند استيراد الاختبارات للملف) */

export interface ListenerRecord {
  id: string;
  path: string;
  status: 'pending' | 'active' | 'retrying' | 'failed' | 'stopped' | 'paused' | 'queued';
  scoped: string | null;
  fingerprint: string;
  owner: string | null;
  purpose: string | null;
  uid: string | null;
  createdAt: number;
  lastSnapshotAt: number | null;
  snapshotCount: number;
  retryCount: number;
  nextRetryAt: number | null;
  lastError: { code: string; message: string; at: number } | null;
  permanent: boolean;
  unsubState: 'attached' | 'detached' | 'none';
  queuedAt: number | null;
}

/** وصف دفاعي لاستعلام Firestore — مكونات بصمة الهوية */
export interface QueryDescriptor {
  path: string | null;
  filters: string[] | null;
  orderBy: string[] | null;
  limit: number | null;
  startAt: string | null;
  endAt: string | null;
  collectionGroup: boolean;
}

export interface WriteLogEntry {
  op: string;
  path: string;
  ok: boolean;
  code: string | null;
  error: string | null;
  retryable: boolean | null;
  ms: number;
  at: number;
}

export interface RTSMStats {
  total: number;
  byStatus: Record<string, number>;
  queueLength: number;
  guardrailHits: number;
  listenerCap: number;
  activeCount: number;
  totalRetryCount: number;
  backendOnline: boolean | null;
  lastSnapshotAt: number | null;
  lastWrite: WriteLogEntry | null;
  failedWrites: number;
  inFlightWrites: number;
  startedAt: number;
  now: number;
}

export interface SubscribeConfig {
  id?: string;
  ref: unknown;
  path?: string;
  next: (snapshot: any) => void;
  error?: (err: any) => void;
  listenOptions?: { includeMetadataChanges?: boolean } | null;
  scoped?: 'user' | string | null;
  owner?: string | null;
  purpose?: string | null;
  descriptor?: QueryDescriptor | null;
  tags?: Record<string, unknown> | null;
}

export declare function decideSyncDirection(
  serverUpdatedAt: number | null,
  localSyncedAt: number,
  serverExists: boolean | null
): 'push' | 'pull';

export declare function isRetryableCode(code: string | null | undefined): boolean;

export declare function describeQuery(ref: unknown): QueryDescriptor;

export declare function fingerprintOf(parts: {
  path?: string | null;
  filters?: string[] | null;
  orderBy?: string[] | null;
  limit?: number | null;
  startAt?: string | null;
  endAt?: string | null;
  collectionGroup?: boolean;
  owner?: string | null;
  purpose?: string | null;
}): string;

export declare class RealtimeSyncManager {
  constructor(opts: {
    subscribe: (ref: any, next: (snap: any) => void, error: (err: any) => void, listenOptions?: any) => unknown;
    now?: () => number;
    timers?: { set: (fn: () => void, ms: number) => any; clear: (t: any) => void };
    onEvent?: (type: string, rec: any, err: any, extra: any, entry: any) => void;
    maxListeners?: number;
    maxQueue?: number;
    baseDelayMs?: number;
    maxDelayMs?: number;
    maxFastRetries?: number;
    failedRetryMs?: number;
    writeLogSize?: number;
    historySize?: number;
    eventLogSize?: number;
  });
  subscribe(config: SubscribeConfig): () => void;
  _backoff(attempt: number): number;
  unsubscribe(id: string): void;
  unsubscribeAll(): void;
  unsubscribeScoped(): void;
  unsubscribeByPrefix(prefix: string): void;
  teardownOwner(owner: string): number;
  pause(id: string): boolean;
  resume(id: string): boolean;
  pauseOwner(owner: string): number;
  resumeOwner(owner: string): number;
  resubscribeUnhealthy(reason?: string): number;
  heartbeat(): number;
  notifyNetworkChange(online: boolean): void;
  notifyAppResume(): void;
  notifyAuthChange(uid: string | null | undefined): void;
  setBackendOnline(online: boolean): void;
  trackWrite<T>(op: string, path: string, promise: PromiseLike<T>): PromiseLike<T>;
  refPath(ref: unknown): string;
  getListeners(): ListenerRecord[];
  getListener(id: string): ListenerRecord | null;
  getQueue(): ListenerRecord[];
  getStats(): RTSMStats;
  getWriteLog(): WriteLogEntry[];
  getHistory(): Array<Record<string, unknown>>;
  getEvents(n?: number): Array<Record<string, unknown>>;
  static decideSyncDirection(
    serverUpdatedAt: number | null,
    localSyncedAt: number,
    serverExists: boolean | null
  ): 'push' | 'pull';
  static isRetryableCode(code: string | null | undefined): boolean;
  static describeQuery(ref: unknown): QueryDescriptor;
  static fingerprintOf(parts: Record<string, unknown>): string;
  static PERMANENT_CODES: string[];
  static DEFAULTS: Record<string, number>;
}
