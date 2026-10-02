import express from "express";
import crypto from "crypto";
import { GoogleGenAI } from "@google/genai";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// ---------------------------------------------------------------------------------
// Optional API protection. Everything keeps working when these are unset (the app
// and the web UI are unaffected); set them to harden a public deployment:
//   ANIMEBLACK_AGENT_TOKEN   -> Android/API clients must send it (x-ab-token header
//                               or ?token=) to call /api/gemini/search-agent.
//   ANIMEBLACK_ADMIN_TOKEN   -> /api/admin/metrics requires it (?token= or header).
//   ANIMEBLACK_TRUST_PROXY   -> set to 1 behind a proxy so the real client IP is rate limited.
// ---------------------------------------------------------------------------------
const AGENT_TOKEN = (process.env.ANIMEBLACK_AGENT_TOKEN || "").trim();
const ADMIN_TOKEN = (process.env.ANIMEBLACK_ADMIN_TOKEN || "").trim();
if (process.env.ANIMEBLACK_TRUST_PROXY === "1") app.set("trust proxy", true);

function requestToken(req) {
  return String(req.get("x-ab-token") || req.query.token || "").trim();
}

function timingSafeEqual(a, b) {
  const x = Buffer.from(String(a));
  const y = Buffer.from(String(b));
  if (x.length !== y.length) return false;
  return crypto.timingSafeEqual(x, y);
}

/** Simple in-memory limiter (per client IP). Enough for a single Node instance. */
function rateLimit({ windowMs, max, name }) {
  const hits = new Map();
  return (req, res, next) => {
    const now = Date.now();
    const key = req.ip || req.socket?.remoteAddress || "unknown";
    const entry = hits.get(key);
    if (!entry || now - entry.start >= windowMs) {
      hits.set(key, { start: now, count: 1 });
    } else if (++entry.count > max) {
      res.setHeader("Retry-After", Math.ceil((entry.start + windowMs - now) / 1000));
      return res.status(429).json({ success: false, code: "RATE_LIMITED", error: `Too many requests (${name}). Try again shortly.` });
    }
    if (hits.size > 5000) for (const [k, v] of hits) if (now - v.start >= windowMs) hits.delete(k);
    next();
  };
}

const agentRateLimit = rateLimit({ windowMs: 60_000, max: Number(process.env.ANIMEBLACK_AGENT_RPM) || 20, name: "search-agent" });
const adminRateLimit = rateLimit({ windowMs: 60_000, max: 30, name: "admin-metrics" });

// Body parsing with generous limit
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

// Performance headers & caching
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  
  // Cache static assets aggressively
  const url = req.url.split("?")[0];
  if (url.match(/\.(png|jpg|jpeg|gif|webp|svg|ico|woff2?|ttf|eot)$/i)) {
    res.setHeader("Cache-Control", "public, max-age=86400, stale-while-revalidate=604800");
  } else if (url.match(/\.(js|css)$/i)) {
    res.setHeader("Cache-Control", "public, max-age=3600, stale-while-revalidate=86400");
  } else if (url === "/" || url.endsWith(".html")) {
    res.setHeader("Cache-Control", "no-cache");
  }
  next();
});

// Initialize Gemini Client lazily (so the server boots cleanly without GEMINI_API_KEY)
let aiClient = null;
function getAI() {
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// System Health and Performance Metrics Endpoint
app.get("/api/health", (req, res) => {
  const mem = process.memoryUsage();
  res.json({
    status: "healthy",
    uptime: Math.floor(process.uptime()),
    timestamp: Date.now(),
    nodeVersion: process.version,
    memory: {
      rss: Math.round(mem.rss / 1024 / 1024) + " MB",
      heapUsed: Math.round(mem.heapUsed / 1024 / 1024) + " MB",
      heapTotal: Math.round(mem.heapTotal / 1024 / 1024) + " MB",
    },
    capabilities: ["googleSearch", "gemini-3.8-flash", "realtime-grounding"],
  });
});

// Google Search Grounding Agent Endpoint
app.post("/api/gemini/search-agent", agentRateLimit, async (req, res) => {
  try {
    if (AGENT_TOKEN && !timingSafeEqual(requestToken(req), AGENT_TOKEN)) {
      return res.status(401).json({ success: false, code: "UNAUTHORIZED", error: "Invalid or missing API token." });
    }
    const { prompt, mode = "general", history = [] } = req.body;

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return res.status(400).json({
        success: false,
        error: "Prompt is required",
      });
    }
    if (prompt.length > 4000) {
      return res.status(413).json({ success: false, error: "Prompt is too long." });
    }

    const cleanPrompt = prompt.trim();
    
    // System instructions tailored for Anime Black research and fact checking
    let systemInstruction = `أنت "المستشار الذكي لأنمي بلاك" (Anime Black Intelligence Agent)، خبير أنمي ومانجا وثقافة البوب اليابانية مزود بقدرة بحث جوجل المباشرة في الوقت الفعلي.
مهامك الرئيسية:
1. مناقشة أحدث أخبار الأنمي، مواسم الصدور، إعلانات الاستوديوهات، والمانجا بناءً على أحدث بيانات بحث جوجل المباشرة.
2. التحقق الصارم من صحة الشائعات والأخبار المتداولة (Fact-Checking) مع تقديم الدليل والمصادر الصريحة.
3. الاستشهاد بالمصادر والأخبار الرسمية (مثل Anime News Network, Crunchyroll, Oricon, Comic Natalie, المانجاكا الرسميين).
4. الرد بلغة عربية فصحى راقية، أنيقة، وحماسية تناسب مجتمع الأوتاكو مع استخدام عناوين وتنسيق منسق وواضح.
5. توفير فقرة "خلاصة سريعة"، تليها "التفاصيل والمصادر المؤكدة"، ثم "نصيحة الأوتاكو".`;

    if (mode === "factcheck") {
      systemInstruction += `\nركز بشكل فائق على التحقق من صحة الخبر/الشائعة، وحدد بوضوح إذا كانت: [مؤكدة رسميًا] أو [شائعة غير صحيحة] أو [قيد التطوير دون إعلان نهائي]، مع ذكر المصدر الأصلي والتواريخ الدقيقة.`;
    } else if (mode === "release_schedule") {
      systemInstruction += `\nركز على مواعيد البث الدقيقة، أيام الأسبوع، أوقات نزول الحلقات، واستوديو الإنتاج، والمنصات الرسمية الناقلة.`;
    }

    let contents = cleanPrompt;
    if (Array.isArray(history) && history.length > 0) {
      // Build conversation context if provided
      const recentHistory = history.slice(-6).map(h => `${h.role === 'user' ? 'المستخدم' : 'الوكيل'}: ${h.text}`).join("\n");
      contents = `سياق الحوار السابق:\n${recentHistory}\n\nسؤال المستخدم الجديد: ${cleanPrompt}`;
    }

    try {
      const response = await getAI().models.generateContent({
        model: "gemini-3.8-flash",
        contents: contents,
        config: {
          systemInstruction: systemInstruction,
          tools: [{ googleSearch: {} }],
        },
      });

      const text = response.text || "";
      const metadata = response.candidates?.[0]?.groundingMetadata || {};
      const rawChunks = metadata.groundingChunks || [];
      const webSearchQueries = metadata.webSearchQueries || [];

      // Format clean citations list
      const citations = [];
      const seenUrls = new Set();

      for (const ch of rawChunks) {
        if (ch.web && ch.web.uri) {
          if (!seenUrls.has(ch.web.uri)) {
            seenUrls.add(ch.web.uri);
            let domain = "";
            try {
              domain = new URL(ch.web.uri).hostname.replace(/^www\./, "");
            } catch (e) {
              domain = "web";
            }
            citations.push({
              title: ch.web.title || domain,
              url: ch.web.uri,
              domain: domain,
            });
          }
        }
      }

      return res.json({
        success: true,
        text: text,
        citations: citations,
        webSearchQueries: webSearchQueries,
        mode: mode,
        model: "gemini-3.8-flash",
        timestamp: Date.now(),
      });

    } catch (genError) {
      console.warn("Gemini Search Grounding call error:", genError?.message);

      const isQuota = String(genError?.message).includes("429") || String(genError?.message).includes("RESOURCE_EXHAUSTED");
      
      // Honest failure response - NEVER fabricate fake article content or fake citations
      return res.status(503).json({
        success: false,
        error: isQuota 
          ? "خدمة البحث الذكي بلغت الحد الأقصى للاستعلامات حالياً (429 Quota Limit). يرجى المحاولة بعد قليل."
          : "خدمة الذكاء الاصطناعي غير متاحة حالياً بسبب خطأ في مزود الخدمة الخارجي.",
        code: isQuota ? "QUOTA_EXHAUSTED" : "AI_SERVICE_UNAVAILABLE",
        details: genError?.message || "External AI service unavailable",
        timestamp: Date.now(),
      });
    }
  } catch (err) {
    console.error("Search agent endpoint fatal error:", err);
    res.status(500).json({
      success: false,
      error: "حدث خطأ أثناء معالجة استعلام البحث المباشر.",
      details: err?.message,
    });
  }
});

// Real Anime Metadata Endpoints (AniList GraphQL + Jikan REST Fallback)
app.get("/api/anime/search", async (req, res) => {
  const query = (req.query.q || "").toString().trim();
  const page = parseInt(req.query.page, 10) || 1;
  const perPage = Math.min(parseInt(req.query.perPage, 10) || 20, 50);

  if (!query) {
    return res.json({ success: true, items: [], page: 1, hasNextPage: false, total: 0 });
  }

  try {
    // 1. Try AniList GraphQL
    const gqlQuery = `
      query ($search: String, $page: Int, $perPage: Int) {
        Page (page: $page, perPage: $perPage) {
          pageInfo { hasNextPage total }
          media (search: $search, type: ANIME, sort: POPULARITY_DESC) {
            id
            title { romaji english native userPreferred }
            coverImage { extraLarge large medium }
            bannerImage
            description(asHtml: false)
            format status episodes duration genres averageScore popularity seasonYear season source
          }
        }
      }
    `;

    const aniRes = await fetch("https://graphql.anilist.co", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ query: gqlQuery, variables: { search: query, page, perPage } }),
    });

    if (aniRes.ok) {
      const json = await aniRes.json();
      const pageData = json.data?.Page;
      return res.json({
        success: true,
        provider: "anilist",
        page,
        hasNextPage: !!pageData?.pageInfo?.hasNextPage,
        total: pageData?.pageInfo?.total,
        items: (pageData?.media || []).map(m => ({ ...m, provider: "anilist" })),
      });
    }

    // 2. Fallback to Jikan REST API
    const jikanRes = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&page=${page}&limit=${perPage}`);
    if (jikanRes.ok) {
      const jikanJson = await jikanRes.json();
      const items = (jikanJson.data || []).map(d => ({
        id: d.mal_id,
        title: { romaji: d.title, english: d.title_english, native: d.title_japanese, userPreferred: d.title },
        coverImage: {
          extraLarge: d.images?.webp?.large_image_url || d.images?.jpg?.large_image_url,
          large: d.images?.webp?.image_url || d.images?.jpg?.image_url,
          medium: d.images?.webp?.small_image_url || d.images?.jpg?.small_image_url,
        },
        bannerImage: null,
        description: d.synopsis,
        format: d.type,
        status: d.status,
        episodes: d.episodes,
        duration: d.duration ? parseInt(d.duration, 10) || null : null,
        genres: (d.genres || []).map(g => g.name),
        averageScore: d.score ? Math.round(d.score * 10) : null,
        popularity: d.popularity,
        seasonYear: d.year,
        season: d.season,
        source: d.source,
        provider: "jikan",
      }));

      return res.json({
        success: true,
        provider: "jikan",
        page,
        hasNextPage: !!jikanJson.pagination?.has_next_page,
        total: jikanJson.pagination?.items?.total,
        items,
      });
    }

    return res.status(502).json({
      success: false,
      error: "تعذر جلب بيانات الأنمي من المزودات الخارجية حالياً.",
      provider: "failed",
    });
  } catch (err) {
    console.error("Anime search route error:", err);
    // فشل الوصول للمزود الخارجي (شبكة/DNS) = 502 Bad Gateway، وليس خطأً داخلياً 500
    const msg = String(err?.message || err || "");
    const isNetworkFailure = /fetch failed|ENOTFOUND|EAI_AGAIN|ECONNREFUSED|ETIMEDOUT|network/i.test(msg);
    if (isNetworkFailure) {
      return res.status(502).json({
        success: false,
        error: "تعذر الوصول إلى مزودات بيانات الأنمي الخارجية حالياً.",
        provider: "unreachable",
      });
    }
    res.status(500).json({ success: false, error: err?.message });
  }
});

app.get("/api/anime/trending", async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const perPage = Math.min(parseInt(req.query.perPage, 10) || 20, 50);

  try {
    const gqlQuery = `
      query ($page: Int, $perPage: Int) {
        Page (page: $page, perPage: $perPage) {
          pageInfo { hasNextPage total }
          media (type: ANIME, sort: TRENDING_DESC) {
            id
            title { romaji english native userPreferred }
            coverImage { extraLarge large medium }
            bannerImage
            description(asHtml: false)
            format status episodes duration genres averageScore popularity seasonYear season source
          }
        }
      }
    `;

    const aniRes = await fetch("https://graphql.anilist.co", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ query: gqlQuery, variables: { page, perPage } }),
    });

    if (aniRes.ok) {
      const json = await aniRes.json();
      const pageData = json.data?.Page;
      return res.json({
        success: true,
        provider: "anilist",
        page,
        hasNextPage: !!pageData?.pageInfo?.hasNextPage,
        total: pageData?.pageInfo?.total,
        items: (pageData?.media || []).map(m => ({ ...m, provider: "anilist" })),
      });
    }

    // Jikan fallback for top airing
    const jikanRes = await fetch(`https://api.jikan.moe/v4/top/anime?filter=airing&page=${page}&limit=${perPage}`);
    if (jikanRes.ok) {
      const jikanJson = await jikanRes.json();
      const items = (jikanJson.data || []).map(d => ({
        id: d.mal_id,
        title: { romaji: d.title, english: d.title_english, native: d.title_japanese, userPreferred: d.title },
        coverImage: {
          extraLarge: d.images?.webp?.large_image_url || d.images?.jpg?.large_image_url,
          large: d.images?.webp?.image_url || d.images?.jpg?.image_url,
          medium: d.images?.webp?.small_image_url || d.images?.jpg?.small_image_url,
        },
        bannerImage: null,
        description: d.synopsis,
        format: d.type,
        status: d.status,
        episodes: d.episodes,
        duration: d.duration ? parseInt(d.duration, 10) || null : null,
        genres: (d.genres || []).map(g => g.name),
        averageScore: d.score ? Math.round(d.score * 10) : null,
        popularity: d.popularity,
        seasonYear: d.year,
        season: d.season,
        source: d.source,
        provider: "jikan",
      }));

      return res.json({
        success: true,
        provider: "jikan",
        page,
        hasNextPage: !!jikanJson.pagination?.has_next_page,
        total: jikanJson.pagination?.items?.total,
        items,
      });
    }

    res.status(502).json({ success: false, error: "تعذر جلب الأنميات الشائعة حالياً." });
  } catch (err) {
    console.error("Anime trending route error:", err);
    // Unreachable provider (network/DNS) is a gateway problem, not an internal 500.
    const msg = String(err?.message || err || "");
    const isNetworkFailure = /fetch failed|ENOTFOUND|EAI_AGAIN|ECONNREFUSED|ETIMEDOUT|network|SSL/i.test(msg);
    res.status(isNetworkFailure ? 502 : 500).json({
      success: false,
      error: isNetworkFailure
        ? "تعذر الوصول إلى مزودات بيانات الأنمي الخارجية حالياً."
        : err?.message,
    });
  }
});

// Admin live performance analytics endpoint
let totalRequests = 0;
let staticCacheHits = 0;
const latencySamples = [];

app.use((req, res, next) => {
  totalRequests++;
  const start = Date.now();
  
  if (req.headers["if-none-match"] || req.headers["if-modified-since"]) {
    staticCacheHits++;
  }

  res.on("finish", () => {
    const duration = Date.now() - start;
    latencySamples.push(duration);
    if (latencySamples.length > 100) latencySamples.shift();
  });
  next();
});

app.get("/api/admin/metrics", adminRateLimit, (req, res) => {
  if (ADMIN_TOKEN && !timingSafeEqual(requestToken(req), ADMIN_TOKEN)) {
    return res.status(401).json({ success: false, error: "Invalid or missing admin token." });
  }
  const mem = process.memoryUsage();
  const avgLatency = latencySamples.length > 0
    ? Math.round(latencySamples.reduce((a, b) => a + b, 0) / latencySamples.length)
    : null;
  
  const cacheRatio = totalRequests > 0
    ? ((staticCacheHits / totalRequests) * 100).toFixed(1) + "%"
    : "0.0%";

  res.json({
    success: true,
    server: {
      uptimeSeconds: Math.floor(process.uptime()),
      heapUsageMB: Math.round(mem.heapUsed / 1024 / 1024),
      rssMB: Math.round(mem.rss / 1024 / 1024),
      platform: process.platform,
      arch: process.arch,
      nodeVersion: process.version
    },
    performance: {
      cacheHitRatio: cacheRatio,
      apiAvgLatencyMs: avgLatency,
      totalRequestsMeasured: totalRequests,
      activeLatencySamplesCount: latencySamples.length,
      timestamp: Date.now()
    },
  });
});

// Serve static frontend files
app.use(express.static(__dirname, {
  maxAge: "1d",
  index: "index.html",
}));

// Fallback to index.html for SPA-style routes
app.use((req, res) => {
  res.sendFile(join(__dirname, "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Anime Black V7 Fullstack Server running on http://0.0.0.0:${PORT}`);
});
