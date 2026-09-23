import { test, expect } from '@playwright/test';

test.describe('Anime Black V7 Full System Verification', () => {
  test('Health endpoint should return healthy status and memory usage', async ({ request }) => {
    const response = await request.get('/api/health');
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.status).toBe('healthy');
    expect(data.capabilities).toContain('gemini-3.8-flash');
    expect(data.memory.heapUsed).toBeDefined();
  });

  test('Admin metrics endpoint should return genuine live stats without fake values', async ({ request }) => {
    const response = await request.get('/api/admin/metrics');
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.server.heapUsageMB).toBeGreaterThan(0);
    expect(data.performance.totalRequestsMeasured).toBeGreaterThan(0);
    expect(data.performance.firestoreConnection).toBeUndefined(); // Fake status was removed
  });

  test('Anime search endpoint returns verified metadata from external providers or safe fallback', async ({ request }) => {
    const response = await request.get('/api/anime/search?q=Naruto');
    expect([200, 502]).toContain(response.status());
    const data = await response.json();
    if (response.status() === 200) {
      expect(data.success).toBe(true);
      expect(Array.isArray(data.items)).toBeTruthy();
      if (data.items.length > 0) {
        expect(data.items[0].title).toBeDefined();
      }
    }
  });

  test('Gemini search endpoint handles missing prompt with 400 validation error', async ({ request }) => {
    const response = await request.post('/api/gemini/search-agent', {
      data: { prompt: '' },
    });
    expect(response.status()).toBe(400);
    const data = await response.json();
    expect(data.success).toBe(false);
  });
});
