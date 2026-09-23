import { doc, getDocFromServer } from 'firebase/firestore';
import { getDb } from '../config/firebase';
import { observability } from '../services/observability';

export interface PerformanceMetrics {
  pingLatencyMs: number;
  firestoreConnection: 'CONNECTED' | 'LATENCY_WARNING' | 'OFFLINE';
  timestamp: number;
  memoryUsageMB?: number;
}

export class MetricsCollector {
  /**
   * Performs an actual roundtrip ping to Firestore to measure real live latency
   */
  public static async measureLiveMetrics(): Promise<PerformanceMetrics> {
    const startTime = performance.now();
    let status: 'CONNECTED' | 'LATENCY_WARNING' | 'OFFLINE' = 'OFFLINE';

    try {
      const testDocRef = doc(getDb() as any, 'test', 'connection');
      await getDocFromServer(testDocRef);
      const elapsed = Math.round(performance.now() - startTime);
      observability.recordLatency(elapsed);

      status = elapsed > 600 ? 'LATENCY_WARNING' : 'CONNECTED';

      return {
        pingLatencyMs: elapsed,
        firestoreConnection: status,
        timestamp: Date.now()
      };
    } catch (err: any) {
      const elapsed = Math.round(performance.now() - startTime);
      // Offline / permission check
      if (err?.message?.includes('the client is offline')) {
        status = 'OFFLINE';
      } else {
        // Successful reach to server even if test doc is empty
        status = 'CONNECTED';
        observability.recordLatency(elapsed);
      }

      return {
        pingLatencyMs: elapsed,
        firestoreConnection: status,
        timestamp: Date.now()
      };
    }
  }
}
