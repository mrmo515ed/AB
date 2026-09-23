import { describe, it, expect, vi } from 'vitest';
import { SyncEngine } from '../src/sync/syncEngine';

describe('Real-Time Sync Engine & Multi-Account Isolation', () => {
  it('should register and clean up listeners cleanly', () => {
    const engine = new SyncEngine();
    const mockUnsub1 = vi.fn();
    const mockUnsub2 = vi.fn();

    // Directly register mock listener entries
    engine['activeListeners'].set('chat_1', mockUnsub1);
    expect(engine['activeListeners'].size).toBe(1);

    // Register second listener
    engine['activeListeners'].set('chat_2', mockUnsub2);
    expect(engine['activeListeners'].size).toBe(2);

    // Account switch / logout triggers unsubscribeAll
    engine.unsubscribeAll();

    expect(mockUnsub1).toHaveBeenCalled();
    expect(mockUnsub2).toHaveBeenCalled();
    expect(engine['activeListeners'].size).toBe(0);
  });

  it('should safely manage pagination cursor states', () => {
    const engine = new SyncEngine();
    engine['cursorMap'].set('posts_all', { id: 'doc_10' } as any);
    expect(engine['cursorMap'].has('posts_all')).toBe(true);

    engine.resetPagination('posts');
    expect(engine['cursorMap'].has('posts_all')).toBe(false);
  });

  it('should execute optimistic rollback on write error', async () => {
    const engine = new SyncEngine();
    let currentUIState: { text: string } | null = { text: 'النص الأصلي' };

    const applyOptimistic = (val: any) => {
      currentUIState = val;
    };
    const rollback = (prev: any) => {
      currentUIState = prev;
    };

    try {
      await engine.optimisticWrite(
        'posts',
        'post_test_99',
        { text: 'تعديل جديد' },
        applyOptimistic,
        rollback,
        { text: 'النص الأصلي' }
      );
    } catch (e) {
      // Catch anticipated write rejection
    }

    expect(currentUIState?.text).toBe('النص الأصلي');
  });
});
