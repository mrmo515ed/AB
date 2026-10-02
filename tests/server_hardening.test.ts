import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { spawn, type ChildProcess } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

/**
 * Starts the real server (`node server.js`) on a private port with API tokens configured and
 * verifies the protection it must provide: token checks, prompt limits and rate limiting.
 * The server is expected to stay fully permissive when no tokens are set (see the other tests).
 */
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PORT = 43171;
const BASE = `http://127.0.0.1:${PORT}`;
const AGENT_TOKEN = "test-agent-secret";
const ADMIN_TOKEN = "test-admin-secret";
const RPM = 8;

let child: ChildProcess | null = null;

async function waitForHealth(timeoutMs = 30_000): Promise<boolean> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const r = await fetch(`${BASE}/api/health`);
      if (r.ok) return true;
    } catch {
      // not up yet
    }
    await new Promise((r) => setTimeout(r, 400));
  }
  return false;
}

beforeAll(async () => {
  child = spawn(process.execPath, ["server.js"], {
    cwd: ROOT,
    env: {
      ...process.env,
      PORT: String(PORT),
      ANIMEBLACK_AGENT_TOKEN: AGENT_TOKEN,
      ANIMEBLACK_ADMIN_TOKEN: ADMIN_TOKEN,
      ANIMEBLACK_AGENT_RPM: String(RPM),
      GEMINI_API_KEY: "test-key-not-real",
    },
    stdio: "ignore",
  });
  const up = await waitForHealth();
  expect(up, `server did not start on ${BASE}`).toBe(true);
}, 45_000);

afterAll(() => {
  child?.kill("SIGTERM");
  child = null;
});

const searchAgent = (headers: Record<string, string> = {}, body: unknown = { prompt: "hello" }) =>
  fetch(`${BASE}/api/gemini/search-agent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });

describe("Server hardening (tokens, limits, rate limiting)", () => {
  it("keeps /api/health public for the app's connection test", async () => {
    const r = await fetch(`${BASE}/api/health`);
    expect(r.status).toBe(200);
    const json = (await r.json()) as { status?: string };
    expect(json.status).toBe("healthy");
  });

  it("reports whether the AI agent is configured (used by the app's server screen)", async () => {
    const json = (await (await fetch(`${BASE}/api/health`)).json()) as {
      agent?: { configured?: boolean; tokenRequired?: boolean; rateLimitPerMinute?: number };
    };
    expect(json.agent?.configured).toBe(true);
    expect(json.agent?.tokenRequired).toBe(true);
    expect(json.agent?.rateLimitPerMinute).toBe(RPM);
  });

  it("rejects the search agent without a token", async () => {
    const r = await searchAgent();
    expect(r.status).toBe(401);
    const json = (await r.json()) as { code?: string };
    expect(json.code).toBe("UNAUTHORIZED");
  });

  it("rejects the search agent with a wrong token", async () => {
    const r = await searchAgent({ "x-ab-token": "wrong-token" });
    expect(r.status).toBe(401);
  });

  it("lets a correctly authenticated request through (no 401)", async () => {
    const r = await searchAgent({ "x-ab-token": AGENT_TOKEN });
    expect(r.status).not.toBe(401);
  });

  it("rejects an over-long prompt before calling the model", async () => {
    const r = await searchAgent({ "x-ab-token": AGENT_TOKEN }, { prompt: "x".repeat(5000) });
    expect(r.status).toBe(413);
  });

  it("requires the admin token for metrics", async () => {
    expect((await fetch(`${BASE}/api/admin/metrics`)).status).toBe(401);
    const ok = await fetch(`${BASE}/api/admin/metrics?token=${ADMIN_TOKEN}`);
    expect(ok.status).toBe(200);
  });

  it("rate limits a single client and returns Retry-After", async () => {
    const codes: number[] = [];
    let retryAfter: string | null = null;
    for (let i = 0; i < RPM + 6; i++) {
      const r = await searchAgent({ "x-ab-token": AGENT_TOKEN });
      codes.push(r.status);
      if (r.status === 429 && retryAfter === null) retryAfter = r.headers.get("retry-after");
    }
    expect(codes).toContain(429);
    expect(Number(retryAfter)).toBeGreaterThan(0);
  }, 30_000);
});
