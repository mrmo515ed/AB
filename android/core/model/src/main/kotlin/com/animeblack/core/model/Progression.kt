package com.animeblack.core.model

/**
 * Progression content shared with the web app (`seed().badgesList`, `seed().levels`,
 * `getDefaultLevelBadges()` / `getDefaultLevelMappings()` in index.html). These are app content
 * definitions, not user data; Firestore (`level_badges`, `level_mappings/active`) overrides the
 * level-badge defaults exactly like the web does.
 */
data class AchievementBadge(
    val id: String,
    val nameAr: String,
    val nameEn: String,
    /** common | rare | epic | legendary */
    val rarity: String,
    val icon: String,
    val descriptionAr: String,
    val descriptionEn: String,
)

val ACHIEVEMENT_BADGES: List<AchievementBadge> = listOf(
    AchievementBadge("badge_rookie", "المبتدئ", "Rookie", "common", "star", "انضممت للمنصة", "Joined the platform"),
    AchievementBadge("badge_explorer", "المستكشف", "Explorer", "rare", "compass", "استكشفت ٥٠ أنمي", "Explored 50 anime"),
    AchievementBadge("badge_elite", "النخبة", "Elite", "epic", "sparkles", "وصلت مستوى ٥٠", "Reached level 50"),
    AchievementBadge("badge_legend", "الأسطورة", "Legend", "legendary", "crown", "أعلى رتبة مجتمعية", "Highest community rank"),
    AchievementBadge("badge_anime_black", "أنمي بلاك", "Anime Black", "legendary", "heart", "شارة المؤسسين", "Founders\u2019 badge"),
)

fun achievementBadge(id: String): AchievementBadge? = ACHIEVEMENT_BADGES.firstOrNull { it.id == id }

/** Rank titles by level (web `levels`). */
data class RankTier(val level: Int, val nameAr: String, val nameEn: String, val xp: Long, val icon: String)

val RANK_TIERS: List<RankTier> = listOf(
    RankTier(1, "مبتدئ", "Beginner", 0, "star"),
    RankTier(10, "أوتاكو", "Otaku", 1_000, "book"),
    RankTier(25, "محارب", "Warrior", 3_000, "swords"),
    RankTier(50, "قائد", "Leader", 8_000, "shield"),
    RankTier(75, "نخبة", "Elite", 15_000, "crown"),
    RankTier(100, "أسطورة", "Legend", 30_000, "flame"),
)

fun rankFor(level: Int): RankTier = RANK_TIERS.lastOrNull { level >= it.level } ?: RANK_TIERS.first()

fun nextRank(level: Int): RankTier? = RANK_TIERS.firstOrNull { it.level > level }

/** Built-in level badges used when the server has none (same artwork as the web). */
val DEFAULT_LEVEL_BADGES: List<LevelBadge> = listOf(
    LevelBadge(
        id = "lbadge_rookie",
        name = "شارة المحارب الصاعد",
        nameEn = "Rising Warrior",
        description = "شارة التقدير الترحيبية لكل أوتاكو يبدأ مسيرته في أنمي بلاك.",
        descriptionEn = "A welcome badge for every otaku starting their journey on Anime Black.",
        color = "#F59E0B",
        image = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><defs><linearGradient id='g1' x1='0%25' y1='0%25' x2='100%25' y2='100%25'><stop offset='0%25' stop-color='%23F59E0B'/><stop offset='100%25' stop-color='%23D97706'/></linearGradient><linearGradient id='g2' x1='0%25' y1='0%25' x2='0%25' y2='100%25'><stop offset='0%25' stop-color='%23FFF'/><stop offset='100%25' stop-color='%23FDE68A'/></linearGradient></defs><circle cx='50' cy='50' r='46' fill='%231E1B2E' stroke='url(%23g1)' stroke-width='5'/><circle cx='50' cy='50' r='38' fill='%23111827'/><path d='M50 20 L68 34 L68 62 L50 80 L32 62 L32 34 Z' fill='url(%23g1)' opacity='0.25'/><path d='M50 24 L64 36 L64 60 L50 74 L36 60 L36 36 Z' fill='url(%23g1)'/><path d='M50 30 L53 43 L66 45 L56 54 L59 67 L50 60 L41 67 L44 54 L34 45 L47 43 Z' fill='url(%23g2)'/></svg>",
    ),
    LevelBadge(
        id = "lbadge_flame",
        name = "نصل اللهب المتقد",
        nameEn = "Blazing Flame Blade",
        description = "شارة النار المشتعلة للمقاتلين المتقدمين والمشاركين النشطين.",
        descriptionEn = "The burning-fire badge for advanced fighters and active members.",
        color = "#EF4444",
        image = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><defs><linearGradient id='f1' x1='0%25' y1='0%25' x2='100%25' y2='100%25'><stop offset='0%25' stop-color='%23EF4444'/><stop offset='50%25' stop-color='%23F97316'/><stop offset='100%25' stop-color='%23FBBF24'/></linearGradient></defs><circle cx='50' cy='50' r='46' fill='%231A0505' stroke='url(%23f1)' stroke-width='5'/><circle cx='50' cy='50' r='38' fill='%230F0303'/><path d='M50 18 C58 30 74 44 74 62 C74 76 63 84 50 84 C37 84 26 76 26 62 C26 44 42 30 50 18 Z' fill='url(%23f1)'/><path d='M50 36 C54 44 62 52 62 64 C62 72 56 76 50 76 C44 76 38 72 38 64 C38 52 46 44 50 36 Z' fill='%23FEF08A'/><circle cx='50' cy='62' r='6' fill='%23FFF'/></svg>",
    ),
    LevelBadge(
        id = "lbadge_shadow",
        name = "شبح الظلال الغامض",
        nameEn = "Mysterious Shadow Phantom",
        description = "شارة السينين والظل للخبراء والمحللين المحنكين.",
        descriptionEn = "The sage-and-shadow badge for seasoned experts and analysts.",
        color = "#A855F7",
        image = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><defs><linearGradient id='s1' x1='0%25' y1='0%25' x2='100%25' y2='100%25'><stop offset='0%25' stop-color='%23C084FC'/><stop offset='100%25' stop-color='%237E22CE'/></linearGradient></defs><circle cx='50' cy='50' r='46' fill='%2313091F' stroke='url(%23s1)' stroke-width='5'/><circle cx='50' cy='50' r='38' fill='%2309030F'/><path d='M50 16 L60 38 L84 50 L60 62 L50 84 L40 62 L16 50 L40 38 Z' fill='url(%23s1)'/><circle cx='50' cy='50' r='14' fill='%23E9D5FF'/><circle cx='50' cy='50' r='8' fill='%23581C87'/></svg>",
    ),
    LevelBadge(
        id = "lbadge_master",
        name = "تاج الملوك الأبدي",
        nameEn = "Eternal Crown of Kings",
        description = "شارة التاج الذهبي الملكي المخصصة لأسياد المحتوى وكبار الرواد.",
        descriptionEn = "The royal golden crown for content masters and top pioneers.",
        color = "#EAB308",
        image = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><defs><linearGradient id='m1' x1='0%25' y1='0%25' x2='100%25' y2='100%25'><stop offset='0%25' stop-color='%23FDE047'/><stop offset='50%25' stop-color='%23EAB308'/><stop offset='100%25' stop-color='%23CA8A04'/></linearGradient></defs><circle cx='50' cy='50' r='46' fill='%231E1805' stroke='url(%23m1)' stroke-width='5'/><circle cx='50' cy='50' r='38' fill='%23110E02'/><path d='M26 68 L74 68 L70 76 L30 76 Z' fill='url(%23m1)'/><path d='M24 64 L30 36 L42 48 L50 26 L58 48 L70 36 L76 64 Z' fill='url(%23m1)'/><circle cx='30' cy='34' r='3.5' fill='%23EF4444'/><circle cx='50' cy='24' r='4.5' fill='%2338BDF8'/><circle cx='70' cy='34' r='3.5' fill='%23EF4444'/><polygon points='50,42 54,50 62,50 56,56 58,64 50,59 42,64 44,56 38,50 46,50' fill='%23FFF'/></svg>",
    ),
    LevelBadge(
        id = "lbadge_celestial",
        name = "نجم السماء الخالد",
        nameEn = "Immortal Celestial Star",
        description = "شارة الطاقة الكونية للواصلين إلى أعلى مراتب الإبداع والتفاعل.",
        descriptionEn = "Cosmic-energy badge for those who reach the highest ranks of creativity and engagement.",
        color = "#00A3FF",
        image = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><defs><linearGradient id='c1' x1='0%25' y1='0%25' x2='100%25' y2='100%25'><stop offset='0%25' stop-color='%2338BDF8'/><stop offset='50%25' stop-color='%2300A3FF'/><stop offset='100%25' stop-color='%231D4ED8'/></linearGradient></defs><circle cx='50' cy='50' r='46' fill='%23031326' stroke='url(%23c1)' stroke-width='5'/><circle cx='50' cy='50' r='38' fill='%23020B17'/><polygon points='50,15 58,36 80,36 63,50 70,72 50,58 30,72 37,50 20,36 42,36' fill='url(%23c1)'/><polygon points='50,26 55,40 70,40 58,50 63,64 50,54 37,64 42,50 30,40 45,40' fill='%23E0F2FE'/><circle cx='50' cy='50' r='6' fill='%23FFF'/></svg>",
    ),
    LevelBadge(
        id = "lbadge_dragon_king",
        name = "التنين الأسطوري الأعظم",
        nameEn = "Supreme Legendary Dragon",
        description = "أعلى وأندر شارة للمستويات العظمى 50+، ترمز للهيمنة المطلقة.",
        descriptionEn = "The highest and rarest badge for level 50+, a symbol of absolute dominance.",
        color = "#FF0055",
        image = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><defs><linearGradient id='dk1' x1='0%25' y1='0%25' x2='100%25' y2='100%25'><stop offset='0%25' stop-color='%23FF0055'/><stop offset='50%25' stop-color='%23E60000'/><stop offset='100%25' stop-color='%23FFB800'/></linearGradient></defs><circle cx='50' cy='50' r='46' fill='%2326000A' stroke='url(%23dk1)' stroke-width='6'/><circle cx='50' cy='50' r='38' fill='%23140005'/><path d='M50 16 L65 30 L80 25 L75 45 L86 60 L68 68 L50 86 L32 68 L14 60 L25 45 L20 25 L35 30 Z' fill='url(%23dk1)' opacity='0.3'/><path d='M50 22 C64 34 72 48 70 66 C58 76 42 76 30 66 C28 48 36 34 50 22 Z' fill='url(%23dk1)'/><circle cx='43' cy='46' r='4' fill='%23FFF'/><circle cx='57' cy='46' r='4' fill='%23FFF'/><polygon points='50,32 54,42 64,44 56,52 58,62 50,56 42,62 44,52 36,44 46,42' fill='%23FFEB3B'/></svg>",
    ),
)

val DEFAULT_LEVEL_MAPPINGS: Map<Int, String> = mapOf(
    1 to "lbadge_rookie",
    5 to "lbadge_flame",
    10 to "lbadge_shadow",
    20 to "lbadge_master",
    35 to "lbadge_celestial",
    50 to "lbadge_dragon_king",
)

/** Level badges + level→badge mapping (`level_mappings/active.mappings`). */
data class LevelBadgeCatalog(
    val badges: List<LevelBadge> = DEFAULT_LEVEL_BADGES,
    val mappings: Map<Int, String> = DEFAULT_LEVEL_MAPPINGS,
) {
    private val byId: Map<String, LevelBadge> by lazy { badges.associateBy { it.id } }

    /** Web `getLevelBadgeForUser`: exact mapping, else the nearest lower mapped tier. */
    fun badgeFor(level: Int): Pair<Int, LevelBadge>? {
        mappings[level]?.let { id -> byId[id]?.let { return level to it } }
        return mappings.keys.filter { it <= level }.sortedDescending()
            .firstNotNullOfOrNull { lvl -> byId[mappings.getValue(lvl)]?.let { lvl to it } }
    }

    /** Mapped tiers in ascending level order (the "level road"). */
    fun road(): List<Pair<Int, LevelBadge>> =
        mappings.keys.sorted().mapNotNull { lvl -> byId[mappings.getValue(lvl)]?.let { lvl to it } }
}
