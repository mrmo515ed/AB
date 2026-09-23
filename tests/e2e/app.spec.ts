import { test, expect } from '@playwright/test';

test.describe('Anime Black V7 E2E Application Verification', () => {
  test('Health endpoint should return healthy status and capabilities', async ({ request }) => {
    const response = await request.get('/api/health');
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.status).toBe('healthy');
    expect(data.capabilities).toContain('gemini-3.8-flash');
  });

  test('Admin metrics endpoint should return dynamic live stats', async ({ request }) => {
    const response = await request.get('/api/admin/metrics');
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.server.heapUsageMB).toBeGreaterThan(0);
    expect(data.performance.firestoreConnection).toBe('ACTIVE_REALTIME');
  });
});
