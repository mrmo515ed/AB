# -*- coding: utf-8 -*-
import sys

print("Building Visual Control Center engine...")

visual_code = r'''
/* ==========================================================================
   ANIME BLACK — OWNER-ONLY VISUAL CUSTOMIZATION & DESIGN MANAGEMENT SYSTEM
   FULL ENTERPRISE IMPLEMENTATION (SPECIFICATION COMPLIANT)
   ========================================================================== */

window.DEFAULT_VISUAL_CONFIG = {
  version: "1.0.0",
  id: "anime_black_default",
  updatedAt: Date.now(),
  author: "Anime Black Team",
  theme: {
    id: "amoled_black",
    name: "AMOLED Pure Black",
    description: "الهوية الرسمية الأيقونية لأنمي بلاك — أسود حقيقي فائق التباين مع ومضات حمراء وزرقاء",
    author: "Anime Black Core",
    isDark: true,
    status: "published",
    thumbnail: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=300&q=80"
  },
  colors: {
    primary: "#00A3FF",
    secondary: "#8B5CF6",
    tertiary: "#EC4899",
    accent: "#00A3FF",
    accent2: "#FF7A00",
    accent3: "#E60000",
    bg: "#08090D",
    bg2: "#0D0F16",
    surface: "#151822",
    surfaceVariant: "#1C202E",
    card: "#151822",
    card2: "#181B26",
    elevatedSurface: "#1F2433",
    textPrimary: "#FFFFFF",
    textSecondary: "#9CA3AF",
    textDisabled: "#4B5563",
    border: "rgba(255, 255, 255, 0.08)",
    divider: "rgba(255, 255, 255, 0.06)",
    success: "#10B981",
    warning: "#F59E0B",
    error: "#EF4444",
    info: "#06B6D4",
    link: "#00A3FF",
    online: "#10B981",
    offline: "#6B7280",
    premium: "#F59E0B",
    coin: "#F59E0B",
    star: "#06B6D4",
    levelXp: "#8B5CF6",
    notification: "#EF4444",
    repost: "#10B981",
    reaction: "#EC4899",
    verified: "#00A3FF",
    admin: "#EF4444",
    owner: "#F59E0B"
  },
  typography: {
    fontFamily: "'Tajawal', 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
    headingFont: "'Tajawal', 'Plus Jakarta Sans', sans-serif",
    baseFontSize: 14,
    lineHeight: 1.6,
    letterSpacing: 0,
    textTransform: "none",
    scaleDisplayLarge: 32,
    scaleHeadline: 22,
    scaleTitle: 17,
    scaleBody: 14,
    scaleLabel: 12,
    scaleCaption: 11
  },
  shapes: {
    globalRadius: 14,
    cardRadius: 14,
    buttonRadius: 99,
    inputRadius: 12,
    dialogRadius: 18,
    avatarRadius: 99,
    badgeRadius: 8,
    chipRadius: 20,
    bottomSheetRadius: 24
  },
  spacing: {
    xs: 4,
    s: 8,
    m: 12,
    l: 16,
    xl: 20,
    xxl: 28,
    containerPadding: 14,
    cardPadding: 12,
    gap: 10
  },
  elevation: {
    shadowEnabled: true,
    cardShadow: "0 4px 20px rgba(0,0,0,0.45)",
    dialogShadow: "0 20px 50px rgba(0,0,0,0.85)",
    buttonGlow: true,
    glowIntensity: "0.35"
  },
  backgrounds: {
    global: { type: "solid", color: "#08090D", image: "", blur: 0, opacity: 1 },
    home: { type: "solid", color: "#08090D", image: "", blur: 0, opacity: 1 },
    community: { type: "solid", color: "#08090D", image: "", blur: 0, opacity: 1 },
    chat: { type: "solid", color: "#08090D", image: "", blur: 0, opacity: 1 },
    reels: { type: "solid", color: "#000000", image: "", blur: 0, opacity: 1 },
    profile: { type: "solid", color: "#08090D", image: "", blur: 0, opacity: 1 },
    store: { type: "solid", color: "#08090D", image: "", blur: 0, opacity: 1 },
    settings: { type: "solid", color: "#08090D", image: "", blur: 0, opacity: 1 }
  },
  components: {
    primaryBtn: {
      bg: "linear-gradient(135deg, #00A3FF 0%, #8B5CF6 100%)",
      textColor: "#FFFFFF",
      radius: 99,
      padding: "9px 20px",
      fontSize: 13,
      fontWeight: "bold",
      shadow: "0 4px 16px rgba(0,163,255,0.3)"
    },
    secondaryBtn: {
      bg: "rgba(255, 255, 255, 0.08)",
      textColor: "#FFFFFF",
      radius: 99,
      padding: "9px 18px",
      fontSize: 13,
      fontWeight: "600",
      border: "1px solid rgba(255, 255, 255, 0.12)"
    },
    cardStyle: {
      bg: "#151822",
      border: "1px solid rgba(255, 255, 255, 0.08)",
      radius: 14,
      padding: 14,
      shadow: "0 4px 18px rgba(0,0,0,0.35)"
    },
    glassCard: {
      bg: "rgba(21, 24, 34, 0.78)",
      blur: 16,
      border: "1px solid rgba(255, 255, 255, 0.12)",
      radius: 16,
      shadow: "0 8px 32px rgba(0,0,0,0.5)"
    },
    inputStyle: {
      bg: "rgba(255, 255, 255, 0.05)",
      border: "1px solid rgba(255, 255, 255, 0.12)",
      radius: 12,
      textColor: "#FFFFFF",
      placeholderColor: "#6B7280"
    },
    bottomNav: {
      bg: "rgba(13, 15, 22, 0.96)",
      blur: 20,
      border: "1px solid rgba(255, 255, 255, 0.08)",
      height: 60,
      iconSize: 22,
      activeColor: "#00A3FF",
      inactiveColor: "#6B7280"
    }
  },
  icons: {
    mapping: {
      bottom_nav_home: "home",
      bottom_nav_community: "compass",
      bottom_nav_chat: "chat",
      bottom_nav_reels: "clapper",
      bottom_nav_more: "more",
      post_action_like: "heart",
      post_action_comment: "comment",
      post_action_share: "fwd",
      post_action_save: "bookmark"
    }
  },
  pageSections: {
    home: [
      { id: "stories", title: "القصص اليومية", enabled: true, order: 1, maxItems: 12 },
      { id: "live_stream", title: "البثوث المباشرة", enabled: true, order: 2, maxItems: 6 },
      { id: "feed", title: "خلاصة المنشورات", enabled: true, order: 3, maxItems: 30 },
      { id: "recommended_anime", title: "أنميات مقترحة", enabled: true, order: 4, maxItems: 8 },
      { id: "top_communities", title: "أبرز المجتمعات", enabled: true, order: 5, maxItems: 5 }
    ],
    community: [
      { id: "featured_guilds", title: "النقابات المميزة", enabled: true, order: 1 },
      { id: "popular_tags", title: "الأوسمة الرائجة", enabled: true, order: 2 },
      { id: "community_feed", title: "منشورات المجتمع", enabled: true, order: 3 }
    ]
  },
  animations: {
    transitionsEnabled: true,
    buttonPressScale: 0.96,
    badgeEntrance: "pulse",
    duration: "250ms"
  }
};

window.READY_MADE_THEMES = [
  {
    id: "amoled_black",
    name: "AMOLED Pure Black",
    category: "Dark",
    description: "أسود مطلق يوفر طاقة الشاشات مع أزرار نيون زرقاء وقرمزية",
    colors: { primary: "#00A3FF", secondary: "#8B5CF6", bg: "#000000", bg2: "#080808", surface: "#111111", card: "#121214", border: "rgba(255,255,255,0.09)", textPrimary: "#FFFFFF" },
    shapes: { cardRadius: 14, buttonRadius: 99 },
    thumbnail: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=300&q=80"
  },
  {
    id: "cyber_neon",
    name: "Cyber Neon 2077",
    category: "Futuristic",
    description: "طابع سيبراني مستقبلي — سيان لامع ووردي فاقع مع إطارات متوهجة",
    colors: { primary: "#00F0FF", secondary: "#FF0055", bg: "#060814", bg2: "#0B0E1F", surface: "#10162F", card: "#121A38", border: "rgba(0,240,255,0.25)", textPrimary: "#FFFFFF" },
    shapes: { cardRadius: 8, buttonRadius: 6 },
    thumbnail: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=300&q=80"
  },
  {
    id: "deep_purple",
    name: "Deep Purple Galaxy",
    category: "Cosmic",
    description: "أرجواني ملكي عميق مستوحى من المجرات البعيدة والأساطير",
    colors: { primary: "#A855F7", secondary: "#EC4899", bg: "#090514", bg2: "#120B24", surface: "#1A1033", card: "#221644", border: "rgba(168,85,247,0.2)", textPrimary: "#FFFFFF" },
    shapes: { cardRadius: 16, buttonRadius: 99 },
    thumbnail: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=300&q=80"
  },
  {
    id: "anime_energy",
    name: "Anime Energy Red",
    category: "Action",
    description: "طاقة قتالية وشعلة ملتهبة مستوحاة من عوالم الشونين والأنمي الحماسي",
    colors: { primary: "#E60000", secondary: "#FF7A00", bg: "#0A0505", bg2: "#140A0A", surface: "#1F0F0F", card: "#291414", border: "rgba(230,0,0,0.22)", textPrimary: "#FFFFFF" },
    shapes: { cardRadius: 14, buttonRadius: 99 },
    thumbnail: "https://images.unsplash.com/photo-1563089145-599997674d42?w=300&q=80"
  },
  {
    id: "luxury_glass",
    name: "Luxury Dark Glass",
    category: "Premium",
    description: "زجاج فخم معتم مع انعكاسات ضوئية فائقة الدقة وظلال ناعمة",
    colors: { primary: "#60A5FA", secondary: "#C084FC", bg: "#0B0F19", bg2: "#111827", surface: "rgba(30,41,59,0.7)", card: "rgba(30,41,59,0.65)", border: "rgba(255,255,255,0.14)", textPrimary: "#FFFFFF" },
    shapes: { cardRadius: 18, buttonRadius: 14 },
    thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&q=80"
  },
  {
    id: "gold_premium",
    name: "Imperial Gold VIP",
    category: "Luxury",
    description: "هيبة الذهب الإمبراطوري — بريق ملكي مع خلفيات أبنوسية داكنة",
    colors: { primary: "#F59E0B", secondary: "#D97706", bg: "#0A0905", bg2: "#14120A", surface: "#1F1C0F", card: "#2B2615", border: "rgba(245,158,11,0.25)", textPrimary: "#FFFFFF" },
    shapes: { cardRadius: 14, buttonRadius: 99 },
    thumbnail: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=300&q=80"
  },
  {
    id: "ocean_night",
    name: "Abyssal Ocean",
    category: "Atmospheric",
    description: "أزرق المحيطات العميقة — تدرجات هادئة وراقية للعين",
    colors: { primary: "#0EA5E9", secondary: "#3B82F6", bg: "#030A14", bg2: "#071324", surface: "#0B1D36", card: "#0F2647", border: "rgba(14,165,233,0.2)", textPrimary: "#FFFFFF" },
    shapes: { cardRadius: 14, buttonRadius: 99 },
    thumbnail: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&q=80"
  },
  {
    id: "green_cyber",
    name: "Matrix Cyberpunk",
    category: "Futuristic",
    description: "أخضر الزمرد الرقمي وشبكات المستقبل المتقدمة",
    colors: { primary: "#10B981", secondary: "#059669", bg: "#040D09", bg2: "#071811", surface: "#0B261B", card: "#0F3324", border: "rgba(16,185,129,0.22)", textPrimary: "#FFFFFF" },
    shapes: { cardRadius: 12, buttonRadius: 8 },
    thumbnail: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=300&q=80"
  },
  {
    id: "crimson_night",
    name: "Crimson Vampire",
    category: "Gothic",
    description: "ياقوتي دموي غامض مستوحى من ليل طوكيو والقصص الخارقة",
    colors: { primary: "#F43F5E", secondary: "#BE123C", bg: "#0F0508", bg2: "#1A0A0F", surface: "#2B0F18", card: "#381420", border: "rgba(244,63,94,0.25)", textPrimary: "#FFFFFF" },
    shapes: { cardRadius: 16, buttonRadius: 99 },
    thumbnail: "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=300&q=80"
  },
  {
    id: "minimal_charcoal",
    name: "Minimal Charcoal Studio",
    category: "Minimal",
    description: "رمادي فحمي متوازن وعصري بأعلى معايير البساطة الاحترافية",
    colors: { primary: "#E5E7EB", secondary: "#9CA3AF", bg: "#121316", bg2: "#1A1C21", surface: "#22252C", card: "#282C35", border: "rgba(255,255,255,0.08)", textPrimary: "#F9FAFB" },
    shapes: { cardRadius: 10, buttonRadius: 8 },
    thumbnail: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=300&q=80"
  },
  {
    id: "sunset_samurai",
    name: "Sunset Samurai",
    category: "Artistic",
    description: "غروب الساموراي الذهبي الممزوج بنار الكرز اليابانية",
    colors: { primary: "#FB923C", secondary: "#F43F5E", bg: "#0D080A", bg2: "#170E12", surface: "#26161D", card: "#331E27", border: "rgba(251,146,60,0.2)", textPrimary: "#FFFFFF" },
    shapes: { cardRadius: 14, buttonRadius: 99 },
    thumbnail: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=300&q=80"
  },
  {
    id: "galaxy_voyager",
    name: "Voyager Nebula",
    category: "Cosmic",
    description: "سديم كوني ناصع وتدرجات ملهمة بين الأزرق السماوي والبنفسجي",
    colors: { primary: "#38BDF8", secondary: "#C084FC", bg: "#060A14", bg2: "#0C1224", surface: "#131C38", card: "#19254A", border: "rgba(56,189,248,0.22)", textPrimary: "#FFFFFF" },
    shapes: { cardRadius: 16, buttonRadius: 99 },
    thumbnail: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=300&q=80"
  }
];

// Helper to deeply merge objects
function deepMerge(target, source) {
  if (!source) return target;
  const output = Object.assign({}, target);
  Object.keys(source).forEach(key => {
    if (source[key] && typeof source[key] === "object" && !Array.isArray(source[key])) {
      output[key] = deepMerge(target[key] || {}, source[key]);
    } else {
      output[key] = source[key];
    }
  });
  return output;
}

window.VISUAL_ENGINE = {
  // Initialize Visual Engine
  init: function() {
    // 1. Load active config from cache
    let cached = null;
    try {
      const stored = localStorage.getItem("anime_black_published_visual_config");
      if (stored) cached = JSON.parse(stored);
    } catch(e) {
      console.warn("Could not parse cached visual config", e);
    }

    S.visualConfig = deepMerge(window.DEFAULT_VISUAL_CONFIG, cached || {});
    S.visualDraft = deepMerge(S.visualConfig, {});
    S.visualThemes = S.visualThemes || window.READY_MADE_THEMES;
    S.visualAssets = S.visualAssets || [
      { id: "ast_logo_main", name: "شعار أنمي بلاك الرسمي", category: "App Logo", url: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=150&q=80", size: "48KB", usageCount: 6, date: Date.now() - 864e5*10 },
      { id: "ast_bg_galaxy", name: "خلفية المجرة الكونية", category: "Background", url: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&q=80", size: "310KB", usageCount: 2, date: Date.now() - 864e5*5 },
      { id: "ast_frame_fire", name: "إطار اللهب الحارق", category: "Frame", url: "https://images.unsplash.com/photo-1563089145-599997674d42?w=150&q=80", size: "62KB", usageCount: 4, date: Date.now() - 864e5*2 }
    ];
    S.visualBadges = S.visualBadges || [
      { id: "bdg_founder", name: "المؤسس الأسطوري", category: "Owner", rarity: "Mythic", color: "#F59E0B", icon: "crown", desc: "شارة الإدارة العليا ومؤسسي أنمي بلاك", locations: ["profile","post_header","chat"], condition: "manual", protected: true },
      { id: "bdg_level_100", name: "أسطورة الأوتاكو Lv.100", category: "Level", rarity: "Legendary", color: "#EF4444", icon: "flame", desc: "بلوغ المستوى الأسطوري 100", locations: ["profile","post_header"], condition: "level_100", protected: false },
      { id: "bdg_verified_creator", name: "صانع محتوى موثق", category: "Verified", rarity: "Epic", color: "#00A3FF", icon: "check", desc: "صناع المحتوى والمترجمين المعتمدين", locations: ["profile","username_row"], condition: "manual", protected: true },
      { id: "bdg_vip_elite", name: "عضو النخبة VIP", category: "Premium", rarity: "Exclusive", color: "#A855F7", icon: "sparkles", desc: "مشتركو الباقة النخبوية السنوية", locations: ["profile","chat"], condition: "premium_active", protected: false }
    ];
    S.visualStoreItems = S.visualStoreItems || [
      { id: "store_theme_cyber", name: "ثيم سايبر نيون 2077", category: "Theme", price: 1200, currency: "coin", rarity: "Epic", active: true, thumbnail: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=300&q=80", desc: "تصميم سايبر نيون ناصع متكامل" },
      { id: "store_frame_flame", name: "إطار اللهب الأزرق النادر", category: "Frame", price: 600, currency: "coin", rarity: "Rare", active: true, thumbnail: "https://images.unsplash.com/photo-1563089145-599997674d42?w=300&q=80", desc: "إطار صور رمزية متوهج" },
      { id: "store_chat_galaxy", name: "مظهر المحادثات: سديم المجرة", category: "Chat Theme", price: 400, currency: "coin", rarity: "Rare", active: true, thumbnail: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=300&q=80", desc: "فقاعات محادثة وخلفيات كونية خاصة" }
    ];
    S.visualVersions = S.visualVersions || [
      { id: "v_1_0_0", version: "1.0.0", name: "الإصدار الافتراضي الأساسي", author: "Super Admin", publishedAt: Date.now() - 864e5*3, note: "الإصدار القياسي الثابت", snapshot: JSON.parse(JSON.stringify(window.DEFAULT_VISUAL_CONFIG)) }
    ];
    S.visualAuditLogs = S.visualAuditLogs || [
      { id: "log_1", action: "INITIALIZE_SYSTEM", author: "m774545471@gmail.com", timestamp: Date.now() - 864e5*3, details: "تهيئة نظام التحكم البصري الشامل" }
    ];

    // 2. Apply styling immediately
    this.applyConfig(S.visualConfig);

    // 3. Connect real-time Firestore sync
    this.listenToRemoteConfig();
  },

  // Inject Dynamic CSS Styles
  applyConfig: function(cfg) {
    if (!cfg) return;
    const colors = cfg.colors || {};
    const shapes = cfg.shapes || {};
    const typo = cfg.typography || {};
    const bg = (cfg.backgrounds && cfg.backgrounds.global) || {};

    let styleEl = document.getElementById("anime_black_dynamic_visual_styles");
    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = "anime_black_dynamic_visual_styles";
      document.head.appendChild(styleEl);
    }

    const cssRules = `
      :root {
        --accent: ${colors.accent || colors.primary || "#00A3FF"};
        --accent2: ${colors.accent2 || colors.secondary || "#FF7A00"};
        --accent3: ${colors.accent3 || colors.tertiary || "#E60000"};
        --bg: ${colors.bg || "#08090D"};
        --bg2: ${colors.bg2 || "#0D0F16"};
        --card: ${colors.card || "#151822"};
        --card2: ${colors.card2 || "#181B26"};
        --surface: ${colors.surface || "#151822"};
        --txt: ${colors.textPrimary || "#FFFFFF"};
        --faint: ${colors.textSecondary || "#9CA3AF"};
        --line: ${colors.border || "rgba(255, 255, 255, 0.08)"};
        --rad: ${shapes.cardRadius || 14}px;
        --btn-rad: ${shapes.buttonRadius || 99}px;
        --in-rad: ${shapes.inputRadius || 12}px;
      }
      body {
        font-family: ${typo.fontFamily || "'Tajawal', 'Plus Jakarta Sans', system-ui, sans-serif"};
        background-color: ${colors.bg || "#08090D"};
        color: ${colors.textPrimary || "#FFFFFF"};
      }
      .card, .card2, .post, .sheet-body {
        border-radius: ${shapes.cardRadius || 14}px !important;
      }
      .btn, .btn-primary, .btn-sec {
        border-radius: ${shapes.buttonRadius || 99}px !important;
      }
      ${bg.image ? `
      body::before {
        content: "";
        position: fixed;
        inset: 0;
        z-index: -1;
        background-image: url('${bg.image}');
        background-size: cover;
        background-position: center;
        opacity: ${bg.opacity || 0.15};
        filter: blur(${bg.blur || 0}px);
        pointer-events: none;
      }` : ""}
    `;

    styleEl.textContent = cssRules;
  },

  // Real-time listener from Firestore
  listenToRemoteConfig: function() {
    if (!window.db || !window.doc || !window.onSnapshot) return;
    try {
      const docRef = window.doc(window.db, "app_visual_config", "published");
      window.onSnapshot(docRef, (snap) => {
        if (snap.exists()) {
          const remoteData = snap.data();
          if (remoteData && remoteData.config) {
            S.visualConfig = deepMerge(window.DEFAULT_VISUAL_CONFIG, remoteData.config);
            localStorage.setItem("anime_black_published_visual_config", JSON.stringify(S.visualConfig));
            this.applyConfig(S.visualConfig);
            if (S.page === "visualControlCenter") render();
          }
        }
      }, (err) => {
        console.warn("Remote visual config sync offline, using local cache", err);
      });
    } catch(e) {
      console.warn("Could not set onSnapshot for visual config", e);
    }
  },

  // Save changes to Draft
  saveDraft: function(draftData) {
    S.visualDraft = deepMerge(S.visualDraft || S.visualConfig, draftData);
    S.visualDraft.updatedAt = Date.now();
    save();
    this.addAuditLog("SAVE_DRAFT", "حفظ مسودة تعديلات التصميم في النظام");
    toast("تم حفظ مسودة التصميم بنجاح 💾", "ok");
  },

  // Validate Draft before Publishing
  validateConfig: function(cfg) {
    const issues = [];
    if (!cfg.theme || !cfg.theme.name || !cfg.theme.name.trim()) {
      issues.push({ level: "ERROR", msg: "اسم الثيم الأساسي مطلوب" });
    }
    if (!cfg.colors || !cfg.colors.primary) {
      issues.push({ level: "ERROR", msg: "اللون الأساسي (Primary Color) غير محدد" });
    }
    if (cfg.colors && cfg.colors.bg && cfg.colors.textPrimary && cfg.colors.bg === cfg.colors.textPrimary) {
      issues.push({ level: "BLOCKING", msg: "لون الخلفية ولون النص متطابقان — سيجعل التطبيق غير مقروء!" });
    }
    if (cfg.backgrounds && cfg.backgrounds.global && cfg.backgrounds.global.image && !cfg.backgrounds.global.image.startsWith("http")) {
      issues.push({ level: "WARNING", msg: "رابط صورة الخلفية العامة قد لا يكون صالحاً" });
    }
    return issues;
  },

  // Publish Draft as a new Version
  publishDraft: async function(note) {
    if (!isPlatformAdmin()) {
      toast("عذراً، صلاحية النشر مخصصة لمالك المنصة فقط 🔒", "err");
      return;
    }

    const issues = this.validateConfig(S.visualDraft);
    const blocking = issues.filter(i => i.level === "BLOCKING");
    if (blocking.length > 0) {
      toast("تعذر النشر: يوجد أخطاء تمنع النشر! راجع فحص الأمان", "err");
      return;
    }

    snd("fanfare");
    const vNumber = "v_" + Date.now().toString(36);
    const authorEmail = (S.me && S.me.email) || "m774545471@gmail.com";

    const versionSnapshot = {
      id: vNumber,
      version: "1." + ((S.visualVersions||[]).length + 1) + ".0",
      name: S.visualDraft.theme.name || "إصدار تصميم جديد",
      author: authorEmail,
      publishedAt: Date.now(),
      note: note || "تم النشر من مركز التحكم البصري",
      snapshot: JSON.parse(JSON.stringify(S.visualDraft))
    };

    // 1. Update memory
    S.visualConfig = JSON.parse(JSON.stringify(S.visualDraft));
    S.visualVersions = [versionSnapshot, ...(S.visualVersions || [])];
    localStorage.setItem("anime_black_published_visual_config", JSON.stringify(S.visualConfig));

    // 2. Apply instantly
    this.applyConfig(S.visualConfig);

    // 3. Persist to Firestore
    if (window.db && window.doc && window.setDoc) {
      try {
        await window.setDoc(window.doc(window.db, "app_visual_config", "published"), {
          config: S.visualConfig,
          publishedAt: Date.now(),
          publishedBy: authorEmail,
          version: versionSnapshot.version
        });
        await window.setDoc(window.doc(window.db, "published_versions", vNumber), versionSnapshot);
      } catch(e) {
        console.warn("Firestore publishing sync note: ", e);
      }
    }

    this.addAuditLog("PUBLISH_THEME", `نشر الإصدار ${versionSnapshot.version} بنجاح: ${versionSnapshot.name}`);
    save();
    toast(`تم نشر التصميم رسمياً للمستخدمين بنجاح 🎉 (${versionSnapshot.version})`, "ok");
    render();
  },

  // Rollback to previous version (Creates a new version safely)
  rollbackToVersion: async function(verId) {
    if (!isPlatformAdmin()) return;
    const target = (S.visualVersions || []).find(v => v.id === verId);
    if (!target || !target.snapshot) {
      toast("الإصدار المطلوب غير موجود", "err");
      return;
    }

    if (!confirm(`هل أنت متأكد من استعادة الإصدار [${target.name} — ${target.version}]؟\nسيتم إنشاء إصدار جديد يحتوي على إعدادات هذا الإصدار.`)) {
      return;
    }

    S.visualDraft = JSON.parse(JSON.stringify(target.snapshot));
    await this.publishDraft(`استعادة واسترجاع آمن من الإصدار ${target.version}`);
    toast("تم استرجاع الإصدار بنجاح 🔄", "ok");
  },

  // Safe Mode: Emergency Reset to default
  safeModeReset: function() {
    if (!confirm("⚠️ تفعيل وضع الأمان (Safe Mode):\nسيتم إعادة تعيين الهوية البصرية إلى النسخة القياسية الرسمية لأنمي بلاك فوراً لحل أي خلل.")) return;
    S.visualDraft = JSON.parse(JSON.stringify(window.DEFAULT_VISUAL_CONFIG));
    this.publishDraft("إعادة تعيين طارئة (Safe Mode Emergency Reset)");
    toast("تم تفعيل وضع الأمان واستعادة الهوية القياسية 🛡️", "ok");
  },

  // Export config as JSON file
  exportConfig: function() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(S.visualConfig, null, 2));
    const dlAnchor = document.createElement("a");
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", `anime_black_visual_config_${Date.now()}.json`);
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();
    toast("تم تصدير ملف إعدادات الهوية البصرية 📥", "ok");
  },

  // Import config with validation
  importConfig: function(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed || typeof parsed !== "object") throw new Error("الملف غير صالح");
      S.visualDraft = deepMerge(window.DEFAULT_VISUAL_CONFIG, parsed);
      this.saveDraft(S.visualDraft);
      toast("تم استيراد الإعدادات إلى المسودة بنجاح! يمكنك معاينتها ونشرها الآن 🚀", "ok");
      render();
    } catch(e) {
      toast("فشل استيراد الملف: تنسيق JSON غير صالح ❌", "err");
    }
  },

  // Add immutable audit log
  addAuditLog: function(action, details) {
    const logItem = {
      id: "log_" + Date.now().toString(36),
      action: action,
      author: (S.me && S.me.email) || "m774545471@gmail.com",
      timestamp: Date.now(),
      details: details
    };
    S.visualAuditLogs = [logItem, ...(S.visualAuditLogs || [])].slice(0, 100);
    save();

    if (window.db && window.doc && window.setDoc) {
      try {
        window.setDoc(window.doc(window.db, "audit_logs", logItem.id), logItem);
      } catch(e) {}
    }
  }
};

// Hook visual engine initialization
setTimeout(() => {
  window.VISUAL_ENGINE.init();
}, 50);
'''

print("Visual Control Center engine built.")
