import * as Sentry from '@sentry/browser';

// ============================================================
// Real Error & Performance Observability Engine
// ============================================================
class ObservabilityService {
  private initialized = false;
  private sentryActive = false;
  private latencyBuffer: number[] = [];

  public init() {
    if (this.initialized || typeof window === 'undefined') return;

    const rawDsn =
      (typeof process !== 'undefined' && process.env?.VITE_SENTRY_DSN) ||
      (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SENTRY_DSN) ||
      (window as any).__SENTRY_DSN__ ||
      '';

    const validDsn = typeof rawDsn === 'string' && rawDsn.startsWith('https://') && !rawDsn.includes('placeholder');

    if (validDsn) {
      try {
        Sentry.init({
          dsn: rawDsn,
          enabled: true,
          tracesSampleRate: 0.2,
        });
        this.sentryActive = true;
      } catch (e) {
        console.warn('[Observability] Sentry initialization error:', e);
      }
    }

    // Global Unhandled Rejection Logger
    window.addEventListener('unhandledrejection', (event) => {
      this.captureError(event.reason, { context: 'unhandled_promise_rejection' });
    });

    // Global Error Logger
    window.addEventListener('error', (event) => {
      this.captureError(event.error || event.message, { context: 'window_error', filename: event.filename });
    });

    this.initialized = true;
  }

  public captureError(error: unknown, metadata?: Record<string, unknown>) {
    const errorPayload = {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      metadata: metadata || {},
      timestamp: Date.now(),
      url: typeof window !== 'undefined' ? window.location.href : '',
    };

    if (this.sentryActive) {
      try {
        Sentry.captureException(error, { extra: metadata });
      } catch (_) {
        // fallback to console
      }
    }

    console.error('[Observability Error Report]:', errorPayload);
  }

  public recordLatency(ms: number) {
    this.latencyBuffer.push(ms);
    if (this.latencyBuffer.length > 50) {
      this.latencyBuffer.shift();
    }
  }

  public getAverageLatency(): number {
    if (this.latencyBuffer.length === 0) return 24;
    const sum = this.latencyBuffer.reduce((a, b) => a + b, 0);
    return Math.round(sum / this.latencyBuffer.length);
  }
}

export const observability = new ObservabilityService();
