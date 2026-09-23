import { describe, it, expect } from 'vitest';
import { AnimeItemSchema, CharacterItemSchema, AnimeMetadataService } from '../src/services/animeProvider';

describe('Anime Metadata Provider Layer & Zod Validation', () => {
  it('should validate a complete AnimeItem correctly', () => {
    const sample = {
      id: 16498,
      title: {
        romaji: 'Shingeki no Kyojin',
        english: 'Attack on Titan',
        native: '進撃の巨人',
        userPreferred: 'Attack on Titan',
      },
      coverImage: {
        extraLarge: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx16498-m5BeYDLDYJTe.jpg',
        large: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx16498-m5BeYDLDYJTe.jpg',
        medium: null,
      },
      bannerImage: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/16498-8jpFCOcDmnei.jpg',
      description: 'Centuries ago, mankind was almost slaughtered to extinction by grotesque creatures called titans.',
      format: 'TV',
      status: 'FINISHED',
      episodes: 25,
      duration: 24,
      genres: ['Action', 'Drama', 'Fantasy', 'Mystery'],
      averageScore: 84,
      popularity: 580000,
      seasonYear: 2013,
      season: 'SPRING',
      source: 'MANGA',
      provider: 'anilist' as const,
    };

    const parsed = AnimeItemSchema.safeParse(sample);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.title.english).toBe('Attack on Titan');
      expect(parsed.data.genres).toContain('Action');
    }
  });

  it('should validate CharacterItem schema correctly', () => {
    const character = {
      id: 456,
      name: {
        full: 'Levi Ackerman',
        native: 'リヴァイ・アッカーマン',
      },
      image: {
        large: 'https://s4.anilist.co/file/anilistcdn/character/large/b456.jpg',
        medium: null,
      },
      role: 'MAIN',
      description: 'Squad Captain of the Special Operations Squad within the Survey Corps.',
    };

    const parsed = CharacterItemSchema.safeParse(character);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.name.full).toBe('Levi Ackerman');
    }
  });

  it('should return empty result for empty query without crashing', async () => {
    const service = new AnimeMetadataService();
    const result = await service.searchAnime('');
    expect(result.items).toHaveLength(0);
    expect(result.provider).toBe('none');
  });
});
