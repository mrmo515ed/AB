import { z } from "zod";

// Zod schemas for validated Anime Metadata
export const AnimeItemSchema = z.object({
  id: z.union([z.string(), z.number()]),
  title: z.object({
    romaji: z.string().optional(),
    english: z.string().optional().nullable(),
    native: z.string().optional().nullable(),
    userPreferred: z.string().optional(),
  }),
  coverImage: z.object({
    extraLarge: z.string().optional().nullable(),
    large: z.string().optional().nullable(),
    medium: z.string().optional().nullable(),
  }),
  bannerImage: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  format: z.string().optional().nullable(),
  status: z.string().optional().nullable(),
  episodes: z.number().optional().nullable(),
  duration: z.number().optional().nullable(),
  genres: z.array(z.string()).default([]),
  averageScore: z.number().optional().nullable(),
  popularity: z.number().optional().nullable(),
  seasonYear: z.number().optional().nullable(),
  season: z.string().optional().nullable(),
  source: z.string().optional().nullable(),
  provider: z.enum(["anilist", "jikan", "cache"]),
});

export type AnimeItem = z.infer<typeof AnimeItemSchema>;

export const CharacterItemSchema = z.object({
  id: z.union([z.string(), z.number()]),
  name: z.object({
    full: z.string(),
    native: z.string().optional().nullable(),
  }),
  image: z.object({
    large: z.string().optional().nullable(),
    medium: z.string().optional().nullable(),
  }),
  role: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
});

export type CharacterItem = z.infer<typeof CharacterItemSchema>;

export interface AnimeSearchResult {
  page: number;
  hasNextPage: boolean;
  total?: number;
  items: AnimeItem[];
  provider: string;
}

export interface IAnimeDataProvider {
  searchAnime(query: string, page?: number, perPage?: number): Promise<AnimeSearchResult>;
  getAnimeDetails(id: string | number): Promise<AnimeItem | null>;
  getTrending(page?: number, perPage?: number): Promise<AnimeSearchResult>;
  getCharacters(animeId: string | number): Promise<CharacterItem[]>;
}

// In-memory short-lived cache for public non-sensitive metadata (10 min TTL)
const metadataCache = new Map<string, { data: unknown; expires: number }>();
const CACHE_TTL_MS = 10 * 60 * 1000;

function getCached<T>(key: string): T | null {
  const item = metadataCache.get(key);
  if (!item) return null;
  if (Date.now() > item.expires) {
    metadataCache.delete(key);
    return null;
  }
  return item.data as T;
}

function setCached(key: string, data: unknown): void {
  if (metadataCache.size > 200) {
    // Purge oldest 50 items
    const keys = Array.from(metadataCache.keys()).slice(0, 50);
    keys.forEach((k) => metadataCache.delete(k));
  }
  metadataCache.set(key, { data, expires: Date.now() + CACHE_TTL_MS });
}

// AniList GraphQL Provider
export class AniListProvider implements IAnimeDataProvider {
  private endpoint = "https://graphql.anilist.co";

  async searchAnime(query: string, page = 1, perPage = 20): Promise<AnimeSearchResult> {
    const cacheKey = `anilist:search:${query}:${page}:${perPage}`;
    const cached = getCached<AnimeSearchResult>(cacheKey);
    if (cached) return cached;

    const gqlQuery = `
      query ($search: String, $page: Int, $perPage: Int) {
        Page (page: $page, perPage: $perPage) {
          pageInfo {
            hasNextPage
            total
          }
          media (search: $search, type: ANIME, sort: POPULARITY_DESC) {
            id
            title {
              romaji
              english
              native
              userPreferred
            }
            coverImage {
              extraLarge
              large
              medium
            }
            bannerImage
            description(asHtml: false)
            format
            status
            episodes
            duration
            genres
            averageScore
            popularity
            seasonYear
            season
            source
          }
        }
      }
    `;

    const res = await fetch(this.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        query: gqlQuery,
        variables: { search: query, page, perPage },
      }),
    });

    if (!res.ok) {
      throw new Error(`AniList API responded with status ${res.status}`);
    }

    const json = await res.json();
    const pageData = json.data?.Page;
    const media = pageData?.media || [];

    const items: AnimeItem[] = media.map((m: any) => ({
      ...m,
      provider: "anilist" as const,
    }));

    const result: AnimeSearchResult = {
      page,
      hasNextPage: !!pageData?.pageInfo?.hasNextPage,
      total: pageData?.pageInfo?.total,
      items,
      provider: "anilist",
    };

    setCached(cacheKey, result);
    return result;
  }

  async getAnimeDetails(id: string | number): Promise<AnimeItem | null> {
    const cacheKey = `anilist:details:${id}`;
    const cached = getCached<AnimeItem>(cacheKey);
    if (cached) return cached;

    const gqlQuery = `
      query ($id: Int) {
        Media (id: $id, type: ANIME) {
          id
          title {
            romaji
            english
            native
            userPreferred
          }
          coverImage {
            extraLarge
            large
            medium
          }
          bannerImage
          description(asHtml: false)
          format
          status
          episodes
          duration
          genres
          averageScore
          popularity
          seasonYear
          season
          source
        }
      }
    `;

    const res = await fetch(this.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        query: gqlQuery,
        variables: { id: Number(id) },
      }),
    });

    if (!res.ok) return null;
    const json = await res.json();
    const media = json.data?.Media;
    if (!media) return null;

    const item: AnimeItem = {
      ...media,
      provider: "anilist",
    };

    setCached(cacheKey, item);
    return item;
  }

  async getTrending(page = 1, perPage = 20): Promise<AnimeSearchResult> {
    const cacheKey = `anilist:trending:${page}:${perPage}`;
    const cached = getCached<AnimeSearchResult>(cacheKey);
    if (cached) return cached;

    const gqlQuery = `
      query ($page: Int, $perPage: Int) {
        Page (page: $page, perPage: $perPage) {
          pageInfo {
            hasNextPage
            total
          }
          media (type: ANIME, sort: TRENDING_DESC) {
            id
            title {
              romaji
              english
              native
              userPreferred
            }
            coverImage {
              extraLarge
              large
              medium
            }
            bannerImage
            description(asHtml: false)
            format
            status
            episodes
            duration
            genres
            averageScore
            popularity
            seasonYear
            season
            source
          }
        }
      }
    `;

    const res = await fetch(this.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ query: gqlQuery, variables: { page, perPage } }),
    });

    if (!res.ok) {
      throw new Error(`AniList API trending failed with status ${res.status}`);
    }

    const json = await res.json();
    const pageData = json.data?.Page;
    const media = pageData?.media || [];

    const items: AnimeItem[] = media.map((m: any) => ({
      ...m,
      provider: "anilist" as const,
    }));

    const result: AnimeSearchResult = {
      page,
      hasNextPage: !!pageData?.pageInfo?.hasNextPage,
      total: pageData?.pageInfo?.total,
      items,
      provider: "anilist",
    };

    setCached(cacheKey, result);
    return result;
  }

  async getCharacters(animeId: string | number): Promise<CharacterItem[]> {
    const cacheKey = `anilist:characters:${animeId}`;
    const cached = getCached<CharacterItem[]>(cacheKey);
    if (cached) return cached;

    const gqlQuery = `
      query ($id: Int) {
        Media (id: $id, type: ANIME) {
          characters (sort: ROLE, perPage: 25) {
            edges {
              role
              node {
                id
                name {
                  full
                  native
                }
                image {
                  large
                  medium
                }
                description
              }
            }
          }
        }
      }
    `;

    const res = await fetch(this.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ query: gqlQuery, variables: { id: Number(animeId) } }),
    });

    if (!res.ok) return [];
    const json = await res.json();
    const edges = json.data?.Media?.characters?.edges || [];

    const characters: CharacterItem[] = edges.map((e: any) => ({
      id: e.node.id,
      name: e.node.name,
      image: e.node.image,
      role: e.role,
      description: e.node.description,
    }));

    setCached(cacheKey, characters);
    return characters;
  }
}

// Jikan REST Provider (Fallback)
export class JikanProvider implements IAnimeDataProvider {
  private baseUrl = "https://api.jikan.moe/v4";

  async searchAnime(query: string, page = 1, perPage = 20): Promise<AnimeSearchResult> {
    const cacheKey = `jikan:search:${query}:${page}:${perPage}`;
    const cached = getCached<AnimeSearchResult>(cacheKey);
    if (cached) return cached;

    const url = `${this.baseUrl}/anime?q=${encodeURIComponent(query)}&page=${page}&limit=${perPage}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Jikan API search failed with status ${res.status}`);
    }

    const json = await res.json();
    const data = json.data || [];

    const items: AnimeItem[] = data.map((d: any) => ({
      id: d.mal_id,
      title: {
        romaji: d.title,
        english: d.title_english,
        native: d.title_japanese,
        userPreferred: d.title,
      },
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
      genres: (d.genres || []).map((g: any) => g.name),
      averageScore: d.score ? Math.round(d.score * 10) : null,
      popularity: d.popularity,
      seasonYear: d.year,
      season: d.season,
      source: d.source,
      provider: "jikan" as const,
    }));

    const result: AnimeSearchResult = {
      page,
      hasNextPage: !!json.pagination?.has_next_page,
      total: json.pagination?.items?.total,
      items,
      provider: "jikan",
    };

    setCached(cacheKey, result);
    return result;
  }

  async getAnimeDetails(id: string | number): Promise<AnimeItem | null> {
    const cacheKey = `jikan:details:${id}`;
    const cached = getCached<AnimeItem>(cacheKey);
    if (cached) return cached;

    const res = await fetch(`${this.baseUrl}/anime/${id}/full`);
    if (!res.ok) return null;
    const json = await res.json();
    const d = json.data;
    if (!d) return null;

    const item: AnimeItem = {
      id: d.mal_id,
      title: {
        romaji: d.title,
        english: d.title_english,
        native: d.title_japanese,
        userPreferred: d.title,
      },
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
      genres: (d.genres || []).map((g: any) => g.name),
      averageScore: d.score ? Math.round(d.score * 10) : null,
      popularity: d.popularity,
      seasonYear: d.year,
      season: d.season,
      source: d.source,
      provider: "jikan",
    };

    setCached(cacheKey, item);
    return item;
  }

  async getTrending(page = 1, perPage = 20): Promise<AnimeSearchResult> {
    const cacheKey = `jikan:trending:${page}:${perPage}`;
    const cached = getCached<AnimeSearchResult>(cacheKey);
    if (cached) return cached;

    const res = await fetch(`${this.baseUrl}/top/anime?filter=airing&page=${page}&limit=${perPage}`);
    if (!res.ok) {
      throw new Error(`Jikan API trending failed with status ${res.status}`);
    }

    const json = await res.json();
    const data = json.data || [];

    const items: AnimeItem[] = data.map((d: any) => ({
      id: d.mal_id,
      title: {
        romaji: d.title,
        english: d.title_english,
        native: d.title_japanese,
        userPreferred: d.title,
      },
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
      genres: (d.genres || []).map((g: any) => g.name),
      averageScore: d.score ? Math.round(d.score * 10) : null,
      popularity: d.popularity,
      seasonYear: d.year,
      season: d.season,
      source: d.source,
      provider: "jikan" as const,
    }));

    const result: AnimeSearchResult = {
      page,
      hasNextPage: !!json.pagination?.has_next_page,
      total: json.pagination?.items?.total,
      items,
      provider: "jikan",
    };

    setCached(cacheKey, result);
    return result;
  }

  async getCharacters(animeId: string | number): Promise<CharacterItem[]> {
    const cacheKey = `jikan:characters:${animeId}`;
    const cached = getCached<CharacterItem[]>(cacheKey);
    if (cached) return cached;

    const res = await fetch(`${this.baseUrl}/anime/${animeId}/characters`);
    if (!res.ok) return [];

    const json = await res.json();
    const data = json.data || [];

    const characters: CharacterItem[] = data.slice(0, 25).map((c: any) => ({
      id: c.character.mal_id,
      name: {
        full: c.character.name,
        native: null,
      },
      image: {
        large: c.character.images?.webp?.image_url || c.character.images?.jpg?.image_url,
        medium: c.character.images?.jpg?.small_image_url,
      },
      role: c.role,
      description: null,
    }));

    setCached(cacheKey, characters);
    return characters;
  }
}

// Unified Anime Metadata Service with automatic fallback and resilient error handling
export class AnimeMetadataService implements IAnimeDataProvider {
  private anilist = new AniListProvider();
  private jikan = new JikanProvider();

  async searchAnime(query: string, page = 1, perPage = 20): Promise<AnimeSearchResult> {
    if (!query || !query.trim()) {
      return { page: 1, hasNextPage: false, items: [], provider: "none" };
    }

    try {
      return await this.anilist.searchAnime(query.trim(), page, perPage);
    } catch (anilistErr) {
      console.warn("AniList search failed, switching to Jikan fallback:", (anilistErr as Error).message);
      try {
        return await this.jikan.searchAnime(query.trim(), page, perPage);
      } catch (jikanErr) {
        console.error("Both anime metadata providers failed:", (jikanErr as Error).message);
        return { page, hasNextPage: false, items: [], provider: "failed" };
      }
    }
  }

  async getAnimeDetails(id: string | number): Promise<AnimeItem | null> {
    try {
      const item = await this.anilist.getAnimeDetails(id);
      if (item) return item;
    } catch (e) {
      console.warn("AniList details failed:", (e as Error).message);
    }

    try {
      return await this.jikan.getAnimeDetails(id);
    } catch (e) {
      console.error("Jikan details failed:", (e as Error).message);
      return null;
    }
  }

  async getTrending(page = 1, perPage = 20): Promise<AnimeSearchResult> {
    try {
      return await this.anilist.getTrending(page, perPage);
    } catch (anilistErr) {
      console.warn("AniList trending failed, switching to Jikan:", (anilistErr as Error).message);
      try {
        return await this.jikan.getTrending(page, perPage);
      } catch (jikanErr) {
        console.error("Both trending providers failed:", (jikanErr as Error).message);
        return { page, hasNextPage: false, items: [], provider: "failed" };
      }
    }
  }

  async getCharacters(animeId: string | number): Promise<CharacterItem[]> {
    try {
      const chars = await this.anilist.getCharacters(animeId);
      if (chars.length > 0) return chars;
    } catch (e) {
      console.warn("AniList characters failed:", (e as Error).message);
    }

    try {
      return await this.jikan.getCharacters(animeId);
    } catch (e) {
      console.error("Jikan characters failed:", (e as Error).message);
      return [];
    }
  }
}

export const animeService = new AnimeMetadataService();
