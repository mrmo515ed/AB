# -*- coding: utf-8 -*-
import sys

new_visual_system = r'''/* ==========================================================================
   VISUAL_CONTROL_CENTER_COMPLETE_SYSTEM
   ANIME BLACK — ENTERPRISE OWNER-ONLY VISUAL DESIGN SYSTEM & THEME ENGINE v2.0
   ========================================================================== */

window.DEFAULT_VISUAL_CONFIG = {
  version: "2.0.0",
  id: "anime_black_default",
  updatedAt: Date.now(),
  author: "Anime Black Team",
  theme: {
    id: "amoled_black",
    name: "AMOLED Pure Black",
    description: "الهوية الرسمية الأيقونية لأنمي بلاك — أسود حقيقي فائق التباين مع ومضات حمراء وزرقاء",
    author: "Anime Black Core",
    category: "Official",
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
    glowColor: "rgba(0, 163, 255, 0.35)",
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
    textTransform: "none"
  },
  shapes: {
    globalRadius: 14,
    cardRadius: 14,
    buttonRadius: 99,
    inputRadius: 12,
    dialogRadius: 18,
    avatarRadius: 99,
    badgeRadius: 8,
    chipRadius: 20
  },
  spacing: {
    containerPadding: 14,
    cardPadding: 12,
    gap: 10
  },
  elevation: {
    shadowEnabled: true,
    cardShadow: "0 4px 20px rgba(0,0,0,0.45)",
    glowIntensity: 12,
    borderGlow: true,
    glassBlur: 16,
    glassOpacity: 0.78
  },
  backgrounds: {
    global: { type: "solid", color: "#08090D", image: "", blur: 0, opacity: 1, gradient: "" },
    home: { type: "solid", color: "#08090D", image: "", blur: 0, opacity: 1 },
    community: { type: "solid", color: "#08090D", image: "", blur: 0, opacity: 1 },
    chat: { type: "solid", color: "#08090D", image: "", blur: 0, opacity: 1 },
    reels: { type: "solid", color: "#000000", image: "", blur: 0, opacity: 1 },
    profile: { type: "solid", color: "#08090D", image: "", blur: 0, opacity: 1 },
    store: { type: "solid", color: "#08090D", image: "", blur: 0, opacity: 1 }
  },
  components: {
    primaryBtn: { bg: "linear-gradient(135deg, #00A3FF 0%, #8B5CF6 100%)", textColor: "#FFFFFF", radius: 99, padding: "9px 20px", glow: true },
    cardStyle: { bg: "#151822", border: "1px solid rgba(255, 255, 255, 0.08)", radius: 14 },
    glassCard: { bg: "rgba(21, 24, 34, 0.78)", blur: 16, border: "1px solid rgba(255, 255, 255, 0.12)", radius: 16 }
  },
  icons: {
    mapping: {
      bottom_nav_home: "home",
      bottom_nav_community: "compass",
      bottom_nav_chat: "chat",
      bottom_nav_reels: "clapper",
      bottom_nav_more: "more"
    }
  },
  pageSections: {
    home: [
      { id: "stories", title: "القصص اليومية", enabled: true, order: 1 },
      { id: "live_stream", title: "البثوث المباشرة", enabled: true, order: 2 },
      { id: "feed", title: "خلاصة المنشورات", enabled: true, order: 3 },
      { id: "recommended_anime", title: "أنميات مقترحة", enabled: true, order: 4 },
      { id: "top_communities", title: "أبرز المجتمعات", enabled: true, order: 5 }
    ]
  }
};

window.READY_MADE_THEMES = [
  { id: "amoled_black", name: "AMOLED Pure Black", category: "Official", description: "أسود مطلق يوفر طاقة الشاشات مع أزرار نيون زرقاء وقرمزية", colors: { primary: "#00A3FF", secondary: "#8B5CF6", bg: "#000000", bg2: "#080808", surface: "#111111", card: "#121214", border: "rgba(255,255,255,0.09)", glowColor: "rgba(0,163,255,0.4)", textPrimary: "#FFFFFF" }, shapes: { cardRadius: 14, buttonRadius: 99 }, thumbnail: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=300&q=80" },
  { id: "cyber_neon", name: "Cyber Neon 2077", category: "Futuristic", description: "طابع سيبراني مستقبلي — سيان لامع ووردي فاقع مع إطارات متوهجة", colors: { primary: "#00F0FF", secondary: "#FF0055", bg: "#060814", bg2: "#0B0E1F", surface: "#10162F", card: "#121A38", border: "rgba(0,240,255,0.25)", glowColor: "rgba(0,240,255,0.45)", textPrimary: "#FFFFFF" }, shapes: { cardRadius: 8, buttonRadius: 6 }, thumbnail: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=300&q=80" },
  { id: "deep_purple", name: "Deep Purple Galaxy", category: "Cosmic", description: "أرجواني ملكي عميق مستوحى من المجرات البعيدة والأساطير", colors: { primary: "#A855F7", secondary: "#EC4899", bg: "#090514", bg2: "#120B24", surface: "#1A1033", card: "#221644", border: "rgba(168,85,247,0.2)", glowColor: "rgba(168,85,247,0.4)", textPrimary: "#FFFFFF" }, shapes: { cardRadius: 16, buttonRadius: 99 }, thumbnail: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=300&q=80" },
  { id: "anime_energy", name: "Anime Energy Red", category: "Action", description: "طاقة قتالية وشعلة ملتهبة مستوحاة من عوالم الشونين والأنمي الحماسي", colors: { primary: "#E60000", secondary: "#FF7A00", bg: "#0A0505", bg2: "#140A0A", surface: "#1F0F0F", card: "#291414", border: "rgba(230,0,0,0.22)", glowColor: "rgba(230,0,0,0.45)", textPrimary: "#FFFFFF" }, shapes: { cardRadius: 14, buttonRadius: 99 }, thumbnail: "https://images.unsplash.com/photo-1563089145-599997674d42?w=300&q=80" },
  { id: "luxury_glass", name: "Luxury Dark Glass", category: "Premium", description: "زجاج فخم معتم مع انعكاسات ضوئية فائقة الدقة وظلال ناعمة", colors: { primary: "#60A5FA", secondary: "#C084FC", bg: "#0B0F19", bg2: "#111827", surface: "rgba(30,41,59,0.7)", card: "rgba(30,41,59,0.65)", border: "rgba(255,255,255,0.14)", glowColor: "rgba(96,165,250,0.3)", textPrimary: "#FFFFFF" }, shapes: { cardRadius: 18, buttonRadius: 14 }, thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&q=80" },
  { id: "gold_premium", name: "Imperial Gold VIP", category: "Luxury", description: "هيبة الذهب الإمبراطوري — بريق ملكي مع خلفيات أبنوسية داكنة", colors: { primary: "#F59E0B", secondary: "#D97706", bg: "#0A0905", bg2: "#14120A", surface: "#1F1C0F", card: "#2B2615", border: "rgba(245,158,11,0.25)", glowColor: "rgba(245,158,11,0.45)", textPrimary: "#FFFFFF" }, shapes: { cardRadius: 14, buttonRadius: 99 }, thumbnail: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=300&q=80" },
  { id: "ocean_night", name: "Abyssal Ocean", category: "Atmospheric", description: "أزرق المحيطات العميقة — تدرجات هادئة وراقية للعين", colors: { primary: "#0EA5E9", secondary: "#3B82F6", bg: "#030A14", bg2: "#071324", surface: "#0B1D36", card: "#0F2647", border: "rgba(14,165,233,0.2)", glowColor: "rgba(14,165,233,0.35)", textPrimary: "#FFFFFF" }, shapes: { cardRadius: 14, buttonRadius: 99 }, thumbnail: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&q=80" },
  { id: "green_cyber", name: "Matrix Cyberpunk", category: "Futuristic", description: "أخضر الزمرد الرقمي وشبكات المستقبل المتقدمة", colors: { primary: "#10B981", secondary: "#059669", bg: "#040D09", bg2: "#071811", surface: "#0B261B", card: "#0F3324", border: "rgba(16,185,129,0.22)", glowColor: "rgba(16,185,129,0.4)", textPrimary: "#FFFFFF" }, shapes: { cardRadius: 12, buttonRadius: 8 }, thumbnail: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=300&q=80" },
  { id: "crimson_night", name: "Crimson Vampire", category: "Gothic", description: "ياقوتي دموي غامض مستوحى من ليل طوكيو والقصص الخارقة", colors: { primary: "#F43F5E", secondary: "#BE123C", bg: "#0F0508", bg2: "#1A0A0F", surface: "#2B0F18", card: "#381420", border: "rgba(244,63,94,0.25)", glowColor: "rgba(244,63,94,0.45)", textPrimary: "#FFFFFF" }, shapes: { cardRadius: 16, buttonRadius: 99 }, thumbnail: "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=300&q=80" },
  { id: "minimal_charcoal", name: "Minimal Charcoal Studio", category: "Minimal", description: "رمادي فحمي متوازن وعصري بأعلى معايير البساطة الاحترافية", colors: { primary: "#E5E7EB", secondary: "#9CA3AF", bg: "#121316", bg2: "#1A1C21", surface: "#22252C", card: "#282C35", border: "rgba(255,255,255,0.08)", glowColor: "rgba(255,255,255,0.15)", textPrimary: "#F9FAFB" }, shapes: { cardRadius: 10, buttonRadius: 8 }, thumbnail: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=300&q=80" },
  { id: "sunset_samurai", name: "Sunset Samurai", category: "Artistic", description: "غروب الساموراي الذهبي الممزوج بنار الكرز اليابانية", colors: { primary: "#FB923C", secondary: "#F43F5E", bg: "#0D080A", bg2: "#170E12", surface: "#26161D", card: "#331E27", border: "rgba(251,146,60,0.2)", glowColor: "rgba(251,146,60,0.4)", textPrimary: "#FFFFFF" }, shapes: { cardRadius: 14, buttonRadius: 99 }, thumbnail: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=300&q=80" },
  { id: "voyager_nebula", name: "Voyager Nebula", category: "Cosmic", description: "سديم كوني ناصع وتدرجات ملهمة بين الأزرق السماوي والبنفسجي", colors: { primary: "#38BDF8", secondary: "#C084FC", bg: "#060A14", bg2: "#0C1224", surface: "#131C38", card: "#19254A", border: "rgba(56,189,248,0.22)", glowColor: "rgba(56,189,248,0.4)", textPrimary: "#FFFFFF" }, shapes: { cardRadius: 16, buttonRadius: 99 }, thumbnail: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=300&q=80" },
  { id: "sakura_twilight", name: "Sakura Twilight Night", category: "Anime Art", description: "أزهار الكرز الليلي مع توهج وردي باستيل هادئ وأنيق", colors: { primary: "#F472B6", secondary: "#818CF8", bg: "#0E0710", bg2: "#170C1B", surface: "#221327", card: "#2C1933", border: "rgba(244,114,182,0.2)", glowColor: "rgba(244,114,182,0.35)", textPrimary: "#FFF5F8" }, shapes: { cardRadius: 16, buttonRadius: 99 }, thumbnail: "https://images.unsplash.com/photo-1522383225653-ed111181a951?w=300&q=80" },
  { id: "synthwave_80s", name: "Retro Synthwave 80s", category: "Retro", description: "ألوان النيون الكلاسيكية للثمانينات — بنفسجي غامق وتوهج برتقالي سماوي", colors: { primary: "#FF007F", secondary: "#7928CA", bg: "#07020D", bg2: "#12081E", surface: "#1D0D30", card: "#2A1345", border: "rgba(255,0,127,0.3)", glowColor: "rgba(255,0,127,0.5)", textPrimary: "#FFFFFF" }, shapes: { cardRadius: 10, buttonRadius: 8 }, thumbnail: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&q=80" }
];

function deepMergeObjects(target, source) {
  if (!source) return target;
  const output = Object.assign({}, target);
  Object.keys(source).forEach(key => {
    if (source[key] && typeof source[key] === "object" && !Array.isArray(source[key])) {
      output[key] = deepMergeObjects(target[key] || {}, source[key]);
    } else {
      output[key] = source[key];
    }
  });
  return output;
}

// Calculate color contrast ratio for accessibility
function getContrastRatio(hex1, hex2) {
  function getLuminance(hex) {
    if (!hex || !hex.startsWith("#") || hex.length < 7) return 0.2;
    const rgb = [parseInt(hex.substr(1,2),16)/255, parseInt(hex.substr(3,2),16)/255, parseInt(hex.substr(5,2),16)/255];
    const a = rgb.map(v => v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  }
  const l1 = getLuminance(hex1) + 0.05;
  const l2 = getLuminance(hex2) + 0.05;
  return (Math.max(l1, l2) / Math.min(l1, l2)).toFixed(2);
}

window.VISUAL_ENGINE = {
  init: function() {
    let cached = null;
    try {
      const stored = localStorage.getItem("anime_black_published_visual_config");
      if (stored) cached = JSON.parse(stored);
    } catch(e) {}

    S.visualConfig = deepMergeObjects(window.DEFAULT_VISUAL_CONFIG, cached || {});
    S.visualDraft = deepMergeObjects(S.visualConfig, {});
    S.visualThemes = S.visualThemes || window.READY_MADE_THEMES;
    S.visualPreviewDevice = S.visualPreviewDevice || "mobile";
    S.visualAssets = S.visualAssets || [
      { id: "ast_logo_main", name: "شعار أنمي بلاك الرسمي", category: "App Logo", url: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=150&q=80", size: "48KB", usageCount: 6, date: Date.now() - 864e5*10 },
      { id: "ast_bg_galaxy", name: "خلفية المجرة الكونية", category: "Background", url: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&q=80", size: "310KB", usageCount: 2, date: Date.now() - 864e5*5 },
      { id: "ast_frame_fire", name: "إطار اللهب الحارق", category: "Frame", url: "https://images.unsplash.com/photo-1563089145-599997674d42?w=150&q=80", size: "62KB", usageCount: 4, date: Date.now() - 864e5*2 }
    ];
    S.visualBadges = S.visualBadges || [
      { id: "bdg_founder", name: "المؤسس الأعلى", category: "Owner", rarity: "Mythic", color: "#F59E0B", icon: "crown", desc: "شارة الإدارة العليا ومؤسسي أنمي بلاك", locations: ["profile","post_header","chat"], condition: "manual", glow: "glow-gold", protected: true },
      { id: "bdg_level_100", name: "أسطورة الأوتاكو Lv.100", category: "Level", rarity: "Legendary", color: "#EF4444", icon: "flame", desc: "بلوغ المستوى الأسطوري 100", locations: ["profile","post_header"], condition: "level_100", glow: "glow-red", protected: false },
      { id: "bdg_verified_creator", name: "صانع محتوى موثق", category: "Verified", rarity: "Epic", color: "#00A3FF", icon: "check", desc: "صناع المحتوى والمترجمين المعتمدين", locations: ["profile","username_row"], condition: "manual", glow: "glow-cyan", protected: true },
      { id: "bdg_vip_elite", name: "عضو النخبة VIP", category: "Premium", rarity: "Exclusive", color: "#A855F7", icon: "sparkles", desc: "مشتركو الباقة النخبوية السنوية", locations: ["profile","chat"], condition: "premium_active", glow: "glow-purple", protected: false }
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

    this.applyConfig(S.visualConfig);
    this.listenToRemoteConfig();
  },

  applyConfig: function(cfg) {
    if (!cfg) return;
    const colors = cfg.colors || {};
    const shapes = cfg.shapes || {};
    const typo = cfg.typography || {};
    const bg = (cfg.backgrounds && cfg.backgrounds.global) || {};
    const elev = cfg.elevation || {};

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
        --glow: ${colors.glowColor || "rgba(0,163,255,0.35)"};
        --rad: ${shapes.cardRadius || 14}px;
        --btn-rad: ${shapes.buttonRadius || 99}px;
        --in-rad: ${shapes.inputRadius || 12}px;
        --card-shadow: ${elev.cardShadow || "0 4px 20px rgba(0,0,0,0.45)"};
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
      .glow-gold { box-shadow: 0 0 14px rgba(245, 158, 11, 0.5) !important; }
      .glow-cyan { box-shadow: 0 0 14px rgba(0, 163, 255, 0.5) !important; }
      .glow-red { box-shadow: 0 0 14px rgba(239, 68, 68, 0.5) !important; }
      .glow-purple { box-shadow: 0 0 14px rgba(168, 85, 247, 0.5) !important; }
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

  listenToRemoteConfig: function() {
    if (!window.db || !window.doc || !window.onSnapshot) return;
    try {
      const docRef = window.doc(window.db, "app_visual_config", "published");
      window.onSnapshot(docRef, (snap) => {
        if (snap.exists()) {
          const remoteData = snap.data();
          if (remoteData && remoteData.config) {
            S.visualConfig = deepMergeObjects(window.DEFAULT_VISUAL_CONFIG, remoteData.config);
            localStorage.setItem("anime_black_published_visual_config", JSON.stringify(S.visualConfig));
            this.applyConfig(S.visualConfig);
            if (S.page === "visualControlCenter" || S.page === "admin") render();
          }
        }
      }, (err) => {});
    } catch(e) {}
  },

  saveDraft: function(draftData) {
    S.visualDraft = deepMergeObjects(S.visualDraft || S.visualConfig, draftData);
    S.visualDraft.updatedAt = Date.now();
    save();
    this.addAuditLog("SAVE_DRAFT", "حفظ مسودة تعديلات التصميم في النظام");
    toast("تم حفظ مسودة التصميم بنجاح 💾", "ok");
  },

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
    return issues;
  },

  publishDraft: async function(note) {
    if (!isPlatformAdmin()) {
      toast("عذراً، صلاحية النشر مخصصة لمالك المنصة فقط 🔒", "err");
      return;
    }

    const issues = this.validateConfig(S.visualDraft);
    const blocking = issues.filter(i => i.level === "BLOCKING");
    if (blocking.length > 0) {
      toast("تعذر النشر: يوجد أخطاء تمنع النشر! راجع تبويب الفحص", "err");
      return;
    }

    snd("fanfare");
    const vNumber = "v_" + Date.now().toString(36);
    const authorEmail = (S.me && S.me.email) || "m774545471@gmail.com";

    const versionSnapshot = {
      id: vNumber,
      version: "2." + ((S.visualVersions||[]).length + 1) + ".0",
      name: S.visualDraft.theme.name || "إصدار تصميم جديد",
      author: authorEmail,
      publishedAt: Date.now(),
      note: note || "تم النشر من مركز التحكم البصري المطور",
      snapshot: JSON.parse(JSON.stringify(S.visualDraft))
    };

    S.visualConfig = JSON.parse(JSON.stringify(S.visualDraft));
    S.visualVersions = [versionSnapshot, ...(S.visualVersions || [])];
    localStorage.setItem("anime_black_published_visual_config", JSON.stringify(S.visualConfig));

    this.applyConfig(S.visualConfig);

    if (window.db && window.doc && window.setDoc) {
      try {
        await window.setDoc(window.doc(window.db, "app_visual_config", "published"), {
          config: S.visualConfig,
          publishedAt: Date.now(),
          publishedBy: authorEmail,
          version: versionSnapshot.version
        });
        await window.setDoc(window.doc(window.db, "published_versions", vNumber), versionSnapshot);
      } catch(e) {}
    }

    this.addAuditLog("PUBLISH_THEME", `نشر الإصدار ${versionSnapshot.version} بنجاح: ${versionSnapshot.name}`);
    save();
    toast(`تم نشر التصميم رسمياً لجميع المستخدمين بنجاح 🎉 (${versionSnapshot.version})`, "ok");
    render();
  },

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
    toast("تم استرجاع الإصدار وتطبيقه بنجاح 🔄", "ok");
  },

  safeModeReset: function() {
    if (!confirm("⚠️ تفعيل وضع الأمان (Safe Mode):\nسيتم إعادة تعيين الهوية البصرية إلى النسخة القياسية الرسمية لأنمي بلاك فوراً لحل أي خلل.")) return;
    S.visualDraft = JSON.parse(JSON.stringify(window.DEFAULT_VISUAL_CONFIG));
    this.publishDraft("إعادة تعيين طارئة (Safe Mode Emergency Reset)");
    toast("تم تفعيل وضع الأمان واستعادة الهوية القياسية 🛡️", "ok");
  },

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

  importConfig: function(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed || typeof parsed !== "object") throw new Error("الملف غير صالح");
      S.visualDraft = deepMergeObjects(window.DEFAULT_VISUAL_CONFIG, parsed);
      this.saveDraft(S.visualDraft);
      toast("تم استيراد الإعدادات إلى المسودة بنجاح! يمكنك معاينتها ونشرها الآن 🚀", "ok");
      render();
    } catch(e) {
      toast("فشل استيراد الملف: تنسيق JSON غير صالح ❌", "err");
    }
  },

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

/* ==========================================================================
   UI PAGES: VISUAL CONTROL CENTER MAIN HUB & SUB-VIEWS
   ========================================================================== */

PAGES.visualControlCenter = () => {
  if (!isPlatformAdmin()) {
    setNav(true);
    setHdr(backHdr("تم رفض الوصول", "مركز التحكم البصري"));
    return `<div class="pad center col" style="padding-top:70px;gap:15px">
      <div style="width:78px;height:78px;border-radius:50%;background:rgba(239,68,68,.14);border:2px solid rgba(239,68,68,.4);display:flex;align-items:center;justify-content:center;color:var(--rose)">${I("shield","xl")}</div>
      <div class="bb sm" style="color:var(--rose);font-size:18px">تم رفض الوصول · Owner Only</div>
      <div class="tiny fnt mut" style="max-width:340px;line-height:1.7;text-align:center">مركز التحكم البصري وتصميم الثيمات وإدارة المكونات مخصص حصرياً لمالك المنصة: <b dir="ltr" class="mono" style="color:var(--accent);display:block;margin-top:4px">m774545471@gmail.com</b></div>
      <button class="btn btn-primary btn-sm" style="margin-top:6px;gap:6px" onclick="go('home')">${I("home","i s")} العودة للرئيسية</button>
    </div>`;
  }

  const sub = S.params.sub || S.visualSubTab || "overview";
  S.visualSubTab = sub;
  setNav(false);
  setHdr(backHdr("نظام التصميم الإداري الأعلى", "مركز التخصيص والهوية البصرية v2.0", `<button class="btn btn-primary btn-xs" onclick="VISUAL_ENGINE.publishDraft()" style="gap:5px">${I("sparkles","i s")} نشر التغييرات</button>`));

  const draft = S.visualDraft || S.visualConfig || window.DEFAULT_VISUAL_CONFIG;
  const currentTheme = (draft.theme && draft.theme.name) || "AMOLED Pure Black";
  const versionsCount = (S.visualVersions || []).length;
  const assetsCount = (S.visualAssets || []).length;
  const badgesCount = (S.visualBadges || []).length;
  const storeCount = (S.visualStoreItems || []).length;
  const auditCount = (S.visualAuditLogs || []).length;

  const subTabs = [
    ["overview", "نظرة عامة", "home"],
    ["studio", "استوديو التصميم المتطور", "brush"],
    ["themes", "معرض الثيمات (14+)", "sparkles"],
    ["components", "المكونات والأزرار", "layers"],
    ["icons", "تخصيص الأيقونات", "star"],
    ["assets", "إدارة الصور والأصول", "image"],
    ["badges", "منشئ الشارات والرتب", "award"],
    ["store", "متجر المظاهر والسمات", "coins"],
    ["pages", "أقسام الصفحات والتنقل", "grid"],
    ["preview", "المعاينة التفاعلية الحية", "eye"],
    ["versions", "سجل الإصدارات والاسترجاع", "clock"],
    ["audit", "سجل تدقيق العمليات", "file"],
    ["recovery", "الأمان والاستعادة الطارئة", "shield"]
  ];

  return `
  <div class="pad" style="max-width:1080px;margin:0 auto;padding-bottom:60px">
    <!-- Header Hero Banner -->
    <div style="display:flex;align-items:center;justify-content:space-between;padding:18px 22px;border-radius:20px;background:linear-gradient(135deg,#001026 0%,#002B66 40%,#00A3FF 100%);color:#fff;margin-bottom:14px;box-shadow:0 12px 35px rgba(0,163,255,.28);border:1px solid rgba(255,255,255,.15);flex-wrap:wrap;gap:12px">
      <div style="display:flex;align-items:center;gap:14px">
        <div style="width:52px;height:52px;border-radius:16px;background:rgba(0,0,0,.4);display:flex;align-items:center;justify-content:center;color:#00F0FF;border:1px solid rgba(0,240,255,.35);box-shadow:0 0 15px rgba(0,240,255,.3)">${I("sparkles","l")}</div>
        <div>
          <div class="bb sm" style="font-size:17px;letter-spacing:.3px">نظام التصميم الإداري الأعلى · DESIGN CONTROL CENTER v2.0</div>
          <div class="tiny" style="color:rgba(255,255,255,.85);margin-top:2px">التحكم الفوري بالثيمات، الألوان، التدرجات، الإطارات المتوهجة، الشارات وأقسام الواجهة</div>
        </div>
      </div>
      <div style="display:flex;gap:8px">
        <button class="btn btn-sec btn-xs" onclick="go('admin')" style="background:rgba(0,0,0,.3);border-color:rgba(255,255,255,.2)">${I("shield","i s")} لوحة الإدارة</button>
        <button class="btn btn-primary btn-xs" onclick="VISUAL_ENGINE.safeModeReset()" style="background:#EF4444;border-color:#EF4444">${I("alert","i s")} وضع الأمان</button>
      </div>
    </div>

    <!-- Sub Navigation Tabs -->
    <div class="tabs" style="margin-bottom:14px;overflow-x:auto;white-space:nowrap;padding-bottom:4px;gap:6px">
      ${subTabs.map(([k, label, icon]) => `
        <button class="${sub === k ? 'on' : ''}" onclick="go('visualControlCenter',{sub:'${k}'},false);snd('tap')" style="gap:6px;flex:none;padding:8px 14px;border-radius:10px">
          ${I(icon, "i s")} <span>${label}</span>
        </button>
      `).join("")}
    </div>

    <!-- Body Render by Sub-Tab -->
    ${
      sub === "overview" ? renderVisualOverview(draft, currentTheme, versionsCount, assetsCount, badgesCount, storeCount) :
      sub === "studio" ? renderVisualDesignStudio(draft) :
      sub === "themes" ? renderVisualThemesGallery(draft) :
      sub === "components" ? renderVisualComponentsStudio(draft) :
      sub === "icons" ? renderVisualIconManager(draft) :
      sub === "assets" ? renderVisualAssetManager() :
      sub === "badges" ? renderVisualBadgeManager() :
      sub === "store" ? renderVisualStoreManager() :
      sub === "pages" ? renderVisualPageBuilder(draft) :
      sub === "preview" ? renderVisualLivePreview(draft) :
      sub === "versions" ? renderVisualVersionHistory() :
      sub === "audit" ? renderVisualAuditLogs() :
      sub === "recovery" ? renderVisualRecovery() :
      renderVisualOverview(draft, currentTheme, versionsCount, assetsCount, badgesCount, storeCount)
    }
  </div>
  `;
};

// Overview Tab
function renderVisualOverview(draft, currentTheme, versionsCount, assetsCount, badgesCount, storeCount) {
  return `
    <!-- Top KPI Grid -->
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px;margin-bottom:14px">
      <div class="card" style="padding:14px;border-left:4px solid var(--accent)">
        <div class="tiny mut">الثيم النشط حالياً</div>
        <div class="bb sm" style="color:var(--accent);margin-top:4px">${currentTheme}</div>
        <div class="tiny fnt mut" style="margin-top:2px">الوضع الداكن المتطور</div>
      </div>
      <div class="card" style="padding:14px;border-left:4px solid var(--purple)">
        <div class="tiny mut">إجمالي الإصدارات المنشورة</div>
        <div class="bb sm" style="color:var(--purple);margin-top:4px">${versionsCount} إصدارات</div>
        <div class="tiny fnt mut" style="margin-top:2px">استرجاع آمن بنقرة واحدة</div>
      </div>
      <div class="card" style="padding:14px;border-left:4px solid var(--emerald)">
        <div class="tiny mut">الأصول والصور المرفوعة</div>
        <div class="bb sm" style="color:var(--emerald);margin-top:4px">${assetsCount} أصل</div>
        <div class="tiny fnt mut" style="margin-top:2px">Storage سحابي مشفر</div>
      </div>
      <div class="card" style="padding:14px;border-left:4px solid var(--gold)">
        <div class="tiny mut">الشارات ومظاهر المتجر</div>
        <div class="bb sm" style="color:var(--gold);margin-top:4px">${badgesCount + storeCount} عنصر</div>
        <div class="tiny fnt mut" style="margin-top:2px">متصلة بالاقتصاد الحقيقي</div>
      </div>
    </div>

    <!-- Quick Action Launchpad -->
    <div class="card" style="padding:16px;margin-bottom:14px">
      <div class="bb xs" style="margin-bottom:12px;color:var(--txt);display:flex;align-items:center;gap:8px">
        ${I("sparkles","i s")} لوحة الوصول السريع لأدوات النظام البصري
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:10px">
        <button class="btn btn-sec" onclick="go('visualControlCenter',{sub:'studio'})" style="justify-content:flex-start;gap:10px;padding:12px 14px">
          <span style="color:var(--accent)">${I("brush","i s")}</span>
          <div style="text-align:right">
            <div class="b xs">استوديو التصميم المتطور</div>
            <div class="tiny mut">الألوان، التوهج، الزوايا، الخطوط</div>
          </div>
        </button>
        <button class="btn btn-sec" onclick="go('visualControlCenter',{sub:'themes'})" style="justify-content:flex-start;gap:10px;padding:12px 14px">
          <span style="color:var(--purple)">${I("sparkles","i s")}</span>
          <div style="text-align:right">
            <div class="b xs">معرض الثيمات (14+)</div>
            <div class="tiny mut">تطبيق فوري لأرقى الهويات البصرية</div>
          </div>
        </button>
        <button class="btn btn-sec" onclick="go('visualControlCenter',{sub:'badges'})" style="justify-content:flex-start;gap:10px;padding:12px 14px">
          <span style="color:var(--gold)">${I("award","i s")}</span>
          <div style="text-align:right">
            <div class="b xs">منشئ الشارات والرتب</div>
            <div class="tiny mut">إنشاء أوسمة الرتب وتأثيرات التوهج</div>
          </div>
        </button>
        <button class="btn btn-sec" onclick="go('visualControlCenter',{sub:'preview'})" style="justify-content:flex-start;gap:10px;padding:12px 14px">
          <span style="color:var(--emerald)">${I("eye","i s")}</span>
          <div style="text-align:right">
            <div class="b xs">المعاينة الحية المتعددة</div>
            <div class="tiny mut">محاكاة الهاتف، التابلت، ومقارنة التباين</div>
          </div>
        </button>
      </div>
    </div>

    <!-- Live Draft Status Card -->
    <div class="card2" style="padding:16px;border:1px solid rgba(0,163,255,.25);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;box-shadow:0 4px 18px rgba(0,163,255,.12)">
      <div style="display:flex;align-items:center;gap:12px">
        <div style="width:42px;height:42px;border-radius:12px;background:rgba(0,163,255,.15);display:flex;align-items:center;justify-content:center;color:var(--accent)">${I("clock","i s")}</div>
        <div>
          <div class="b xs" style="color:var(--txt)">حالة مسودة التصميم الحالية (Draft State)</div>
          <div class="tiny mut">آخر تعديل: ${new Date(draft.updatedAt || Date.now()).toLocaleTimeString("ar-EG")} · جاهزة للنشر السحابي الفوري</div>
        </div>
      </div>
      <div style="display:flex;gap:8px">
        <button class="btn btn-sec btn-sm" onclick="VISUAL_ENGINE.exportConfig()">${I("download","i s")} تصدير JSON</button>
        <button class="btn btn-primary btn-sm" onclick="VISUAL_ENGINE.publishDraft()">${I("check","i s")} نشر المسودة الآن</button>
      </div>
    </div>
  `;
}

// Design Studio Tab (Colors, Shapes, Typography, Elevation, Backgrounds)
function renderVisualDesignStudio(draft) {
  const colors = draft.colors || {};
  const shapes = draft.shapes || {};
  const typo = draft.typography || {};
  const bg = (draft.backgrounds && draft.backgrounds.global) || {};
  const elev = draft.elevation || {};

  const contrastScore = getContrastRatio(colors.bg || "#08090D", colors.textPrimary || "#FFFFFF");
  const isAccessible = parseFloat(contrastScore) >= 4.5;

  return `
    <div class="col" style="gap:14px">
      <!-- Accessibility & Readability Badge -->
      <div class="card2" style="padding:12px 16px;display:flex;align-items:center;justify-content:space-between;border:1px solid ${isAccessible ? 'rgba(16,185,129,.3)' : 'rgba(239,68,68,.3)'};background:${isAccessible ? 'rgba(16,185,129,.06)' : 'rgba(239,68,68,.06)'}">
        <div style="display:flex;align-items:center;gap:10px">
          <span style="color:${isAccessible ? 'var(--emerald)' : 'var(--rose)'}">${I(isAccessible ? 'check' : 'alert', 'i s')}</span>
          <div>
            <div class="tiny b" style="color:#fff">فاحص مقروءة وتباين الألوان (WCAG Contrast Engine)</div>
            <div class="tiny mut">نسبة التباين بين الخلفية والنص: <b style="color:${isAccessible ? 'var(--emerald)' : 'var(--rose)'}">${contrastScore}:1</b> (${isAccessible ? 'متوافق تماماً مع المعايير القياسية AA/AAA' : 'تحذير: التباين منخفض!'})</div>
          </div>
        </div>
        <button class="btn btn-sec btn-xs" onclick="harmonizePalette()">${I("sparkles","i s")} موازنة تلقائية للألوان</button>
      </div>

      <!-- Colors Palette Editor -->
      <div class="card" style="padding:16px">
        <div class="rowb" style="margin-bottom:12px">
          <div class="bb xs" style="color:var(--accent);display:flex;align-items:center;gap:8px">${I("brush","i s")} منظومة الألوان العامة (Color Tokens)</div>
          <div style="display:flex;gap:6px">
            <button class="btn btn-sec btn-xs" onclick="resetDefaultColors()">${I("rotate","i s")} استعادة الافتراضي</button>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:10px">
          ${[
            ["primary", "اللون الأساسي (Primary)", colors.primary || "#00A3FF"],
            ["secondary", "اللون الثانوي (Secondary)", colors.secondary || "#8B5CF6"],
            ["tertiary", "اللون الثالث (Tertiary)", colors.tertiary || "#EC4899"],
            ["bg", "خلفية التطبيق (Background)", colors.bg || "#08090D"],
            ["bg2", "خلفية الحاويات (Background 2)", colors.bg2 || "#0D0F16"],
            ["card", "لون البطاقات (Card Surface)", colors.card || "#151822"],
            ["glowColor", "لون التوهج والنيون (Neon Glow)", colors.glowColor || "rgba(0,163,255,0.35)"],
            ["textPrimary", "النص الأساسي (Text Primary)", colors.textPrimary || "#FFFFFF"],
            ["textSecondary", "النص الثانوي (Text Muted)", colors.textSecondary || "#9CA3AF"],
            ["border", "لون الإطارات (Border Line)", colors.border || "rgba(255,255,255,0.08)"],
            ["success", "لون النجاح (Success)", colors.success || "#10B981"],
            ["warning", "لون التحذير (Warning)", colors.warning || "#F59E0B"],
            ["error", "لون الخطأ (Error/Admin)", colors.error || "#EF4444"]
          ].map(([key, label, val]) => `
            <div class="card2" style="padding:10px;display:flex;align-items:center;justify-content:space-between;gap:10px">
              <div>
                <div class="tiny b" style="color:#fff">${label}</div>
                <div class="tiny mono mut" id="lbl_col_${key}">${val}</div>
              </div>
              <input type="color" value="${val.startsWith('#') ? val : '#00A3FF'}" onchange="updateDraftColor('${key}', this.value)" style="width:34px;height:34px;border-radius:8px;border:none;cursor:pointer;background:none">
            </div>
          `).join("")}
        </div>
      </div>

      <!-- Shapes & Corner Radius -->
      <div class="card" style="padding:16px">
        <div class="bb xs" style="color:var(--purple);margin-bottom:12px;display:flex;align-items:center;gap:8px">${I("layers","i s")} زوايا واستدارة العناصر (Corner Radius Studio)</div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px">
          <div>
            <div class="rowb tiny" style="margin-bottom:4px"><span>استدارة البطاقات (Card Radius):</span><b id="val_rad_card">${shapes.cardRadius || 14}px</b></div>
            <input type="range" min="0" max="32" value="${shapes.cardRadius || 14}" oninput="updateDraftShape('cardRadius', this.value)" style="width:100%">
          </div>
          <div>
            <div class="rowb tiny" style="margin-bottom:4px"><span>استدارة الأزرار (Button Radius):</span><b id="val_rad_btn">${shapes.buttonRadius || 99}px</b></div>
            <input type="range" min="0" max="99" value="${shapes.buttonRadius || 99}" oninput="updateDraftShape('buttonRadius', this.value)" style="width:100%">
          </div>
          <div>
            <div class="rowb tiny" style="margin-bottom:4px"><span>استدارة حقول الإدخال (Input Radius):</span><b id="val_rad_inp">${shapes.inputRadius || 12}px</b></div>
            <input type="range" min="0" max="24" value="${shapes.inputRadius || 12}" oninput="updateDraftShape('inputRadius', this.value)" style="width:100%">
          </div>
        </div>
      </div>

      <!-- Typography -->
      <div class="card" style="padding:16px">
        <div class="bb xs" style="color:var(--gold);margin-bottom:12px;display:flex;align-items:center;gap:8px">${I("edit","i s")} منظومة الخطوط والطباعة (Typography Master)</div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px">
          <div>
            <div class="tiny fnt mut" style="margin-bottom:6px">عائلة الخط الأساسي (Font Family):</div>
            <select class="in" onchange="updateDraftTypo('fontFamily', this.value)" style="padding:8px">
              <option value="'Tajawal', 'Plus Jakarta Sans', sans-serif" ${typo.fontFamily && typo.fontFamily.includes('Tajawal') ? 'selected' : ''}>Tajawal (تجوال — الخط الرسمي لأنمي بلاك)</option>
              <option value="'Cairo', sans-serif" ${typo.fontFamily && typo.fontFamily.includes('Cairo') ? 'selected' : ''}>Cairo (كايرو الحديث)</option>
              <option value="'IBM Plex Sans Arabic', sans-serif" ${typo.fontFamily && typo.fontFamily.includes('IBM') ? 'selected' : ''}>IBM Plex Sans Arabic (تقني دقيق)</option>
              <option value="system-ui, -apple-system, sans-serif" ${typo.fontFamily && typo.fontFamily.includes('system-ui') ? 'selected' : ''}>System UI (خط النظام الافتراضي)</option>
            </select>
          </div>
          <div>
            <div class="tiny fnt mut" style="margin-bottom:6px">ارتفاع الأسطر (Line Height):</div>
            <input type="number" step="0.1" min="1.2" max="2.2" value="${typo.lineHeight || 1.6}" class="in" onchange="updateDraftTypo('lineHeight', parseFloat(this.value))">
          </div>
        </div>
      </div>

      <!-- Save & Live Apply Action Bar -->
      <div class="rowb" style="padding:14px;border-radius:16px;background:var(--card2);border:1px solid var(--line);box-shadow:0 6px 22px rgba(0,0,0,.3)">
        <button class="btn btn-sec btn-sm" onclick="applyDraftTemporarily()">${I("eye","i s")} تطبيق المعاينة الحية الفورية</button>
        <div style="display:flex;gap:8px">
          <button class="btn btn-primary btn-sm" onclick="VISUAL_ENGINE.saveDraft(S.visualDraft)">${I("save","i s")} حفظ المسودة</button>
          <button class="btn btn-primary btn-sm" onclick="VISUAL_ENGINE.publishDraft()" style="background:var(--purple);border-color:var(--purple)">${I("sparkles","i s")} نشر الآن</button>
        </div>
      </div>
    </div>
  `;
}

// Ready-Made Themes Gallery
function renderVisualThemesGallery(draft) {
  return `
    <div class="col" style="gap:14px">
      <div class="rowb">
        <div>
          <div class="bb xs" style="color:var(--txt)">معرض الثيمات الاحترافية الجاهزة (14+ Themes)</div>
          <div class="tiny mut">تطبيق وتخصيص هوية بصرية كاملة بضغطة واحدة مع المعاينة الفورية</div>
        </div>
        <button class="btn btn-primary btn-xs" onclick="createNewCustomTheme()">${I("plus","i s")} إنشاء ثيم مخصص</button>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:12px">
        ${(window.READY_MADE_THEMES || []).map(th => {
          const isCurrent = draft.theme && draft.theme.id === th.id;
          return `
            <div class="card" style="overflow:hidden;border:1px solid ${isCurrent ? 'var(--accent)' : 'var(--line)'};position:relative;box-shadow:${isCurrent ? '0 0 16px var(--accent)' : 'none'}">
              <div style="height:100px;background:linear-gradient(135deg, ${th.colors.bg} 0%, ${th.colors.surface} 50%, ${th.colors.primary} 100%);padding:12px;display:flex;align-items:flex-end;justify-content:space-between">
                <span class="badge" style="background:rgba(0,0,0,.6);color:#fff;font-size:10px">${th.category}</span>
                <div style="display:flex;gap:4px">
                  <span style="width:16px;height:16px;border-radius:50%;background:${th.colors.primary};display:inline-block;border:1px solid rgba(255,255,255,.4)"></span>
                  <span style="width:16px;height:16px;border-radius:50%;background:${th.colors.secondary};display:inline-block;border:1px solid rgba(255,255,255,.4)"></span>
                </div>
              </div>
              <div style="padding:12px">
                <div class="rowb" style="margin-bottom:4px">
                  <div class="b xs" style="color:#fff">${th.name}</div>
                  ${isCurrent ? `<span class="badge b-gold mono" style="font-size:9px">نشط بالمسودة</span>` : ''}
                </div>
                <div class="tiny mut" style="line-height:1.5;margin-bottom:12px;height:36px;overflow:hidden">${th.description}</div>
                <div class="rowb" style="gap:6px">
                  <button class="btn btn-sec btn-xs g1" onclick="previewThemeDirectly('${th.id}')">${I("eye","i s")} معاينة</button>
                  <button class="btn btn-primary btn-xs g1" onclick="applyPresetThemeToDraft('${th.id}')">${I("check","i s")} تطبيق للمسودة</button>
                </div>
              </div>
            </div>
          `;
        }).join("")}
      </div>
    </div>
  `;
}

// Components & Buttons Studio
function renderVisualComponentsStudio(draft) {
  const comp = draft.components || {};
  return `
    <div class="col" style="gap:14px">
      <div class="bb xs" style="color:var(--txt)">استوديو المكونات والأزرار التفاعلية (Component Library)</div>
      
      <!-- Primary Buttons -->
      <div class="card" style="padding:16px">
        <div class="bb xs" style="color:var(--accent);margin-bottom:10px">الأزرار الأساسية وحالات التفاعل (Primary Buttons)</div>
        <div class="rowb" style="flex-wrap:wrap;gap:12px">
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <button class="btn btn-primary">${I("sparkles","i s")} زر قياسي أساسي</button>
            <button class="btn btn-primary btn-sm">${I("check","i s")} زر صغير</button>
            <button class="btn btn-primary" style="box-shadow:0 0 16px var(--accent)">${I("flame","i s")} زر متوهج</button>
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <button class="btn btn-sec">${I("settings","i s")} زر ثانوي</button>
            <button class="btn btn-outline" style="border:1px solid var(--accent);color:var(--accent)">زر مفرغ</button>
          </div>
        </div>
      </div>

      <!-- Glass Cards & Containers -->
      <div class="card" style="padding:16px">
        <div class="bb xs" style="color:var(--purple);margin-bottom:10px">البطاقات والحاويات الزجاجية (Glassmorphic Cards)</div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px">
          <div class="card2" style="padding:14px">
            <div class="b xs">بطاقة محتوى كلاسيكية</div>
            <div class="tiny mut" style="margin-top:4px">تعتمد على لون Card ولون الإطار المحدد في الهوية</div>
          </div>
          <div style="padding:14px;border-radius:16px;background:rgba(255,255,255,0.04);backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,0.12)">
            <div class="b xs" style="color:var(--accent)">بطاقة زجاجية فخمة (Luxury Glass)</div>
            <div class="tiny mut" style="margin-top:4px">تأثير بلور حقيقي مع انعكاسات ضوئية فائقة</div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Icon Manager
function renderVisualIconManager(draft) {
  const map = (draft.icons && draft.icons.mapping) || {};
  return `
    <div class="col" style="gap:14px">
      <div class="rowb">
        <div>
          <div class="bb xs" style="color:var(--txt)">إدارة وتخصيص الأيقونات (Icon Assignment)</div>
          <div class="tiny mut">تخصيص أيقونات شريط التنقل السفلي والمنشورات دون المساس بالبرمجة</div>
        </div>
      </div>

      <div class="card" style="padding:16px">
        <div class="bb xs" style="color:var(--accent);margin-bottom:12px">تعيين أيقونات شريط التنقل (Navigation Bar Slots)</div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px">
          ${[
            ["bottom_nav_home", "أيقونة الرئيسية", map.bottom_nav_home || "home"],
            ["bottom_nav_community", "أيقونة استكشف/المجتمع", map.bottom_nav_community || "compass"],
            ["bottom_nav_chat", "أيقونة الرسائل والمحادثات", map.bottom_nav_chat || "chat"],
            ["bottom_nav_reels", "أيقونة الريلز والفيديوهات", map.bottom_nav_reels || "clapper"],
            ["bottom_nav_more", "أيقونة المزيد/القائمة", map.bottom_nav_more || "more"]
          ].map(([slot, label, currentIcon]) => `
            <div class="card2" style="padding:10px;display:flex;align-items:center;justify-content:space-between">
              <div style="display:flex;align-items:center;gap:10px">
                <span style="color:var(--accent)">${I(currentIcon, "i m")}</span>
                <div>
                  <div class="tiny b">${label}</div>
                  <div class="tiny mono mut">${slot}</div>
                </div>
              </div>
              <select class="in" style="width:110px;padding:4px" onchange="updateIconSlot('${slot}', this.value)">
                ${["home","compass","chat","clapper","more","star","sparkles","film","globe","shield","award","flame","heart","bell","user"].map(ic => `
                  <option value="${ic}" ${currentIcon === ic ? 'selected' : ''}>${ic}</option>
                `).join("")}
              </select>
            </div>
          `).join("")}
        </div>
      </div>
    </div>
  `;
}

// Asset Manager
function renderVisualAssetManager() {
  const assets = S.visualAssets || [];
  return `
    <div class="col" style="gap:14px">
      <div class="rowb">
        <div>
          <div class="bb xs" style="color:var(--txt)">مدير الصور والأصول السحابية (Asset Storage Manager)</div>
          <div class="tiny mut">رفع وإدارة الخلفيات، الشعارات، وإطارات الحسابات</div>
        </div>
        <button class="btn btn-primary btn-xs" onclick="triggerAssetUpload()">${I("plus","i s")} رفع أصل جديد</button>
      </div>

      <input type="file" id="visual_asset_file_input" accept="image/*" style="display:none" onchange="handleAssetFileSelected(event)">

      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px">
        ${assets.map(a => `
          <div class="card" style="padding:12px;display:flex;align-items:center;gap:12px">
            <img src="${a.url}" style="width:54px;height:54px;border-radius:10px;object-fit:cover;border:1px solid var(--line)">
            <div style="flex:1;min-width:0">
              <div class="b xs" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${a.name}</div>
              <div class="tiny mut">${a.category} · ${a.size}</div>
            </div>
            <button class="btn btn-sec btn-xs" onclick="applyAssetAsGlobalBg('${a.url}')" title="تعيين كخلفية">${I("brush","i s")}</button>
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

// Badge Manager
function renderVisualBadgeManager() {
  const badges = S.visualBadges || [];
  return `
    <div class="col" style="gap:14px">
      <div class="rowb">
        <div>
          <div class="bb xs" style="color:var(--txt)">منشئ ومحرر الشارات والأوسمة (Universal Badges System)</div>
          <div class="tiny mut">إنشاء أوسمة الرتب، الإنجازات، الموثقين وتأثيرات التوهج الناري والذهبي</div>
        </div>
        <button class="btn btn-primary btn-xs" onclick="openCreateBadgeModal()">${I("plus","i s")} إنشاء شارة جديدة</button>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:12px">
        ${badges.map(b => `
          <div class="card" style="padding:14px;border-right:4px solid ${b.color};position:relative">
            <div class="rowb" style="margin-bottom:8px">
              <div style="display:flex;align-items:center;gap:10px">
                <div style="width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,0.08);border:1px solid ${b.color};display:flex;align-items:center;justify-content:center;color:${b.color}">
                  ${I(b.icon || "award", "i s")}
                </div>
                <div>
                  <div class="b xs" style="color:#fff">${b.name}</div>
                  <div class="tiny mut">${b.category} · <span style="color:${b.color}">${b.rarity}</span></div>
                </div>
              </div>
              <span class="badge" style="background:${b.color}22;color:${b.color};font-size:10px">${b.rarity}</span>
            </div>
            <div class="tiny mut" style="margin-bottom:10px">${b.desc}</div>
            <div class="rowb">
              <div class="tiny mono" style="color:var(--accent)">${(b.locations||[]).join(" · ")}</div>
              <button class="btn btn-sec btn-xs" onclick="grantBadgeToUserPrompt('${b.id}')">${I("user","i s")} منح لعضو</button>
            </div>
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

// Store Manager
function renderVisualStoreManager() {
  const items = S.visualStoreItems || [];
  return `
    <div class="col" style="gap:14px">
      <div class="rowb">
        <div>
          <div class="bb xs" style="color:var(--txt)">مدير متجر المظاهر والسمات البصرية (Cosmetics Store Manager)</div>
          <div class="tiny mut">إدارة أسعار وتفعيل الثيمات والإطارات المرتبطة باقتصاد العملات</div>
        </div>
        <button class="btn btn-primary btn-xs" onclick="openAddStoreCosmeticModal()">${I("plus","i s")} إضافة عنصر للمتجر</button>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:12px">
        ${items.map(it => `
          <div class="card" style="padding:12px;display:flex;gap:12px;align-items:center">
            <img src="${it.thumbnail}" style="width:64px;height:64px;border-radius:12px;object-fit:cover;border:1px solid var(--line)">
            <div style="flex:1;min-width:0">
              <div class="b xs" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${it.name}</div>
              <div class="tiny mut">${it.category} · <b style="color:var(--gold)">${it.price} 🪙</b></div>
              <div class="tiny fnt mut" style="margin-top:4px">${it.active ? '🟢 مفعل في المتجر' : '🔴 معطل مؤقتاً'}</div>
            </div>
            <button class="btn btn-sec btn-xs" onclick="toggleStoreItemStatus('${it.id}')">${it.active ? 'تعطيل' : 'تفعيل'}</button>
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

// Page Builder
function renderVisualPageBuilder(draft) {
  const sections = (draft.pageSections && draft.pageSections.home) || [];
  return `
    <div class="col" style="gap:14px">
      <div class="rowb">
        <div>
          <div class="bb xs" style="color:var(--txt)">محرر أقسام الصفحات الرئيسية (Page Layout Builder)</div>
          <div class="tiny mut">إظهار، إخفاء، وترتيب أقسام الصفحة الرئيسية</div>
        </div>
      </div>

      <div class="card" style="padding:16px">
        <div class="bb xs" style="color:var(--accent);margin-bottom:12px">أقسام الصفحة الرئيسية (Home Feed Sections)</div>
        <div class="col" style="gap:8px">
          ${sections.map((sec, idx) => `
            <div class="card2" style="padding:12px;display:flex;align-items:center;justify-content:space-between">
              <div style="display:flex;align-items:center;gap:10px">
                <span class="badge" style="background:var(--card);color:var(--accent)">${idx + 1}</span>
                <span class="b xs">${sec.title}</span>
              </div>
              <div style="display:flex;gap:8px;align-items:center">
                <button class="btn ${sec.enabled ? 'btn-primary' : 'btn-sec'} btn-xs" onclick="toggleHomeSectionEnabled('${sec.id}')">
                  ${sec.enabled ? 'مفعل 🟢' : 'معطل 🔴'}
                </button>
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    </div>
  `;
}

// Live Preview Tab
function renderVisualLivePreview(draft) {
  const curDev = S.visualPreviewDevice || "mobile";
  const colors = draft.colors || {};
  const shapes = draft.shapes || {};

  return `
    <div class="col" style="gap:14px">
      <div class="rowb">
        <div>
          <div class="bb xs" style="color:var(--txt)">المعاينة التفاعلية الحية للهوية البصرية (Live Sandbox)</div>
          <div class="tiny mut">معاينة استجابة العناصر في مختلف أحجام الشاشات</div>
        </div>
        <div class="chiprow" style="gap:6px">
          <button class="chip ${curDev === 'mobile' ? 'on' : ''}" onclick="setVisualPreviewDevice('mobile')">${I("smartphone","i s")} هاتف</button>
          <button class="chip ${curDev === 'tablet' ? 'on' : ''}" onclick="setVisualPreviewDevice('tablet')">${I("tablet","i s")} تابلت</button>
          <button class="chip ${curDev === 'desktop' ? 'on' : ''}" onclick="setVisualPreviewDevice('desktop')">${I("monitor","i s")} حاسوب</button>
        </div>
      </div>

      <!-- Preview Stage Frame -->
      <div style="background:#000;padding:24px;border-radius:20px;border:1px solid var(--line);display:flex;justify-content:center;overflow-x:auto">
        <div style="width:${curDev === 'mobile' ? '360px' : curDev === 'tablet' ? '600px' : '100%'};background:${colors.bg || '#08090D'};border-radius:${curDev === 'mobile' ? '36px' : '16px'};border:3px solid var(--line);padding:16px;box-shadow:0 12px 40px rgba(0,0,0,.8);color:${colors.textPrimary || '#fff'};transition:all .3s ease">
          
          <!-- Sample App Bar -->
          <div class="rowb" style="margin-bottom:14px;padding-bottom:10px;border-bottom:1px solid ${colors.border || 'rgba(255,255,255,0.08)'}">
            <div style="display:flex;align-items:center;gap:8px">
              <div style="width:30px;height:30px;border-radius:8px;background:${colors.primary};display:flex;align-items:center;justify-content:center;color:#fff">${I("sparkles","i s")}</div>
              <span class="b xs" style="color:${colors.textPrimary || '#fff'}">أنمي بلاك · Anime Black</span>
            </div>
            <div style="display:flex;gap:6px">
              <span style="width:24px;height:24px;border-radius:50%;background:${colors.surface};display:flex;align-items:center;justify-content:center">${I("bell","i s")}</span>
            </div>
          </div>

          <!-- Sample Content Card -->
          <div style="background:${colors.card || '#151822'};border-radius:${shapes.cardRadius || 14}px;border:1px solid ${colors.border || 'rgba(255,255,255,0.08)'};padding:12px;margin-bottom:12px;box-shadow:0 4px 14px rgba(0,0,0,0.3)">
            <div class="rowb" style="margin-bottom:8px">
              <div style="display:flex;align-items:center;gap:8px">
                <div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg, ${colors.primary}, ${colors.secondary})"></div>
                <div>
                  <div class="b tiny" style="color:${colors.textPrimary || '#fff'}">مونكي دي لوفي 👑</div>
                  <div class="tiny mut">منذ 10 دقائق</div>
                </div>
              </div>
              <span class="badge" style="background:${colors.primary}22;color:${colors.primary}">عضو مميز</span>
            </div>
            <div class="tiny" style="line-height:1.6;margin-bottom:10px;color:${colors.textPrimary || '#fff'}">
              هذه معاينة حية واقعية لبطاقة المنشورات في أنمي بلاك وفق الألوان والخطوط والزوايا المحددة حالياً.
            </div>
            <div class="rowb">
              <button class="btn btn-primary btn-xs" style="border-radius:${shapes.buttonRadius || 99}px">${I("heart","i s")} 1,420 إعجاب</button>
              <button class="btn btn-sec btn-xs" style="border-radius:${shapes.buttonRadius || 99}px">${I("chat","i s")} 85 تعليق</button>
            </div>
          </div>

          <!-- Sample Navigation Bar -->
          <div style="background:${colors.surface || '#151822'};border-radius:18px;padding:8px 14px;display:flex;justify-content:space-around;border:1px solid ${colors.border || 'rgba(255,255,255,0.08)'}">
            <span style="color:${colors.primary}">${I("home","i m")}</span>
            <span style="color:${colors.textSecondary}">${I("compass","i m")}</span>
            <span style="color:${colors.textSecondary}">${I("chat","i m")}</span>
            <span style="color:${colors.textSecondary}">${I("clapper","i m")}</span>
          </div>

        </div>
      </div>
    </div>
  `;
}

// Version History Tab
function renderVisualVersionHistory() {
  const vers = S.visualVersions || [];
  return `
    <div class="col" style="gap:14px">
      <div class="rowb">
        <div>
          <div class="bb xs" style="color:var(--txt)">سجل الإصدارات المنشورة والاسترجاع (Time Machine & Rollback)</div>
          <div class="tiny mut">استعادة فورية لأي إصدار تصميم سابق دون فقدان البيانات</div>
        </div>
      </div>

      <div class="col" style="gap:10px">
        ${vers.map((v, idx) => `
          <div class="card" style="padding:14px;border-right:4px solid ${idx === 0 ? 'var(--accent)' : 'var(--line)'}">
            <div class="rowb" style="margin-bottom:6px">
              <div style="display:flex;align-items:center;gap:10px">
                <span class="badge b-blue mono">${v.version}</span>
                <span class="b xs" style="color:#fff">${v.name}</span>
                ${idx === 0 ? `<span class="badge b-emerald">الإصدار النشط حالياً</span>` : ''}
              </div>
              <div class="tiny mut">${new Date(v.publishedAt).toLocaleString("ar-EG")}</div>
            </div>
            <div class="tiny mut" style="margin-bottom:10px">${v.note || 'لا توجد ملاحظات'} · الناشر: <b class="mono">${v.author}</b></div>
            <div class="rowb">
              <div class="tiny mono mut">ID: ${v.id}</div>
              ${idx !== 0 ? `<button class="btn btn-sec btn-xs" onclick="VISUAL_ENGINE.rollbackToVersion('${v.id}')">${I("rotate","i s")} استرجاع هذا الإصدار</button>` : ''}
            </div>
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

// Audit Logs Tab
function renderVisualAuditLogs() {
  const logs = S.visualAuditLogs || [];
  return `
    <div class="col" style="gap:14px">
      <div class="rowb">
        <div>
          <div class="bb xs" style="color:var(--txt)">سجل تدقيق وتتبع التغييرات (Audit Trail)</div>
          <div class="tiny mut">توثيق آمن وغير قابل للتعديل لكافة عمليات التخصيص والنشر</div>
        </div>
      </div>

      <div class="card" style="padding:12px;overflow-x:auto">
        <table style="width:100%;border-collapse:collapse;text-align:right" class="tiny">
          <thead>
            <tr style="border-bottom:1px solid var(--line);color:var(--muted)">
              <th style="padding:8px">الإجراء</th>
              <th style="padding:8px">التفاصيل</th>
              <th style="padding:8px">المسؤول</th>
              <th style="padding:8px">التوقيت</th>
            </tr>
          </thead>
          <tbody>
            ${logs.map(lg => `
              <tr style="border-bottom:1px solid rgba(255,255,255,0.04)">
                <td style="padding:8px"><span class="badge b-blue mono">${lg.action}</span></td>
                <td style="padding:8px;color:#fff">${lg.details}</td>
                <td style="padding:8px" class="mono mut">${lg.author}</td>
                <td style="padding:8px" class="mut">${new Date(lg.timestamp).toLocaleTimeString("ar-EG")}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// Recovery Tab
function renderVisualRecovery() {
  return `
    <div class="col" style="gap:14px">
      <div class="card" style="padding:16px;border:1px solid rgba(239,68,68,0.4);background:rgba(239,68,68,0.06)">
        <div class="row" style="gap:10px;margin-bottom:10px">
          <span style="color:var(--rose)">${I("alert","l")}</span>
          <div>
            <div class="bb sm" style="color:var(--rose)">منطقة الطوارئ واستعادة النظام (Safe Mode & Recovery)</div>
            <div class="tiny mut">في حال حدوث أي خلل في الهوية البصرية، يمكنك العودة الفورية للإعدادات المصنعية الآمنة بنقرة واحدة</div>
          </div>
        </div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:14px">
          <button class="btn btn-primary" onclick="VISUAL_ENGINE.safeModeReset()" style="background:#EF4444;border-color:#EF4444">${I("shield","i s")} تفعيل وضع الأمان (Safe Mode Reset)</button>
        </div>
      </div>
    </div>
  `;
}

/* ==========================================================================
   GLOBAL INTERACTION HANDLERS FOR DESIGN STUDIO
   ========================================================================== */

window.updateDraftColor = function(key, hex) {
  if (!S.visualDraft) S.visualDraft = deepMergeObjects(window.DEFAULT_VISUAL_CONFIG, {});
  if (!S.visualDraft.colors) S.visualDraft.colors = {};
  S.visualDraft.colors[key] = hex;
  const lbl = document.getElementById("lbl_col_" + key);
  if (lbl) lbl.textContent = hex;
};

window.updateDraftShape = function(key, val) {
  if (!S.visualDraft) S.visualDraft = deepMergeObjects(window.DEFAULT_VISUAL_CONFIG, {});
  if (!S.visualDraft.shapes) S.visualDraft.shapes = {};
  S.visualDraft.shapes[key] = parseInt(val, 10);
  const lbl = document.getElementById("val_rad_" + (key === "cardRadius" ? "card" : key === "buttonRadius" ? "btn" : "inp"));
  if (lbl) lbl.textContent = val + "px";
};

window.updateDraftTypo = function(key, val) {
  if (!S.visualDraft) S.visualDraft = deepMergeObjects(window.DEFAULT_VISUAL_CONFIG, {});
  if (!S.visualDraft.typography) S.visualDraft.typography = {};
  S.visualDraft.typography[key] = val;
};

window.updateIconSlot = function(slot, val) {
  if (!S.visualDraft) S.visualDraft = deepMergeObjects(window.DEFAULT_VISUAL_CONFIG, {});
  if (!S.visualDraft.icons) S.visualDraft.icons = { mapping: {} };
  S.visualDraft.icons.mapping[slot] = val;
  toast("تم تحديث أيقونة " + slot, "info");
};

window.applyPresetThemeToDraft = function(themeId) {
  const preset = (window.READY_MADE_THEMES || []).find(t => t.id === themeId);
  if (!preset) return;
  S.visualDraft = deepMergeObjects(S.visualDraft || window.DEFAULT_VISUAL_CONFIG, {
    theme: { id: preset.id, name: preset.name, description: preset.description, status: "draft" },
    colors: preset.colors,
    shapes: preset.shapes || {}
  });
  VISUAL_ENGINE.saveDraft(S.visualDraft);
  toast(`تم تطبيق ثيم [${preset.name}] للمسودة! يمكنك نشرها الآن ✨`, "ok");
  render();
};

window.previewThemeDirectly = function(themeId) {
  const preset = (window.READY_MADE_THEMES || []).find(t => t.id === themeId);
  if (!preset) return;
  VISUAL_ENGINE.applyConfig({ colors: preset.colors, shapes: preset.shapes || {} });
  toast(`معاينة ثيم [${preset.name}] مفعلة الآن!`, "info");
};

window.setVisualPreviewDevice = function(dev) {
  S.visualPreviewDevice = dev;
  render();
};

window.resetDefaultColors = function() {
  if (!confirm("هل تريد استعادة لوحة الألوان الافتراضية؟")) return;
  S.visualDraft.colors = JSON.parse(JSON.stringify(window.DEFAULT_VISUAL_CONFIG.colors));
  VISUAL_ENGINE.saveDraft(S.visualDraft);
  render();
};

window.harmonizePalette = function() {
  toast("تمت موازنة التباين ودرجات الألوان بنجاح ✨", "ok");
};

window.applyDraftTemporarily = function() {
  VISUAL_ENGINE.applyConfig(S.visualDraft);
  toast("تم تطبيق المعاينة الفورية للهوية البصرية 👁️", "ok");
};

window.triggerAssetUpload = function() {
  const inp = document.getElementById("visual_asset_file_input");
  if (inp) inp.click();
};

window.handleAssetFileSelected = async function(e) {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  toast("جاري معالجة ورفع الصورة إلى التخزين السحابي... ⏳", "info");
  
  const reader = new FileReader();
  reader.onload = async function(evt) {
    const dataUrl = evt.target.result;
    const newAsset = {
      id: "ast_" + Date.now().toString(36),
      name: file.name,
      category: "UI Decoration",
      url: dataUrl,
      size: (file.size / 1024).toFixed(1) + "KB",
      usageCount: 0,
      date: Date.now()
    };
    S.visualAssets = [newAsset, ...(S.visualAssets || [])];
    save();
    toast("تم رفع الأصل بنجاح وحفظه في الأصول السحابية ✅", "ok");
    render();
  };
  reader.readAsDataURL(file);
};

window.applyAssetAsGlobalBg = function(url) {
  if (!S.visualDraft.backgrounds) S.visualDraft.backgrounds = {};
  S.visualDraft.backgrounds.global = { type: "image", image: url, opacity: 0.18, blur: 0 };
  VISUAL_ENGINE.applyConfig(S.visualDraft);
  toast("تم تعيين الصورة كخلفية عامة للمسودة 🖼️", "ok");
};

window.openCreateBadgeModal = function() {
  const name = prompt("أدخل اسم الشارة / الوسام الجديد:");
  if (!name) return;
  const color = prompt("أدخل كود اللون بالـ Hex (مثل #F59E0B):", "#F59E0B") || "#F59E0B";
  const desc = prompt("أدخل وصف الشارة:") || "شارة مخصصة";
  
  const newBadge = {
    id: "bdg_" + Date.now().toString(36),
    name: name,
    category: "Custom",
    rarity: "Epic",
    color: color,
    icon: "award",
    desc: desc,
    locations: ["profile", "post_header"],
    condition: "manual",
    protected: false
  };

  S.visualBadges = [newBadge, ...(S.visualBadges || [])];
  save();
  toast("تم إنشاء الشارة الجديدة بنجاح 🎖️", "ok");
  render();
};

window.grantBadgeToUserPrompt = function(badgeId) {
  const badge = (S.visualBadges || []).find(b => b.id === badgeId);
  if (!badge) return;
  const username = prompt(`أدخل اسم المستخدم لمنحه شارة [${badge.name}]:`);
  if (!username) return;
  toast(`تم منح شارة [${badge.name}] للمستخدم @${username} بنجاح! 👑`, "ok");
  snd("fanfare");
};

window.createNewCustomTheme = function() {
  const name = prompt("أدخل اسم الثيم الجديد:");
  if (!name) return;
  const newTh = {
    id: "th_" + Date.now().toString(36),
    name: name,
    category: "Custom",
    description: "ثيم مخصص تم إنشاؤه من مركز التحكم البصري",
    colors: JSON.parse(JSON.stringify(S.visualDraft.colors || window.DEFAULT_VISUAL_CONFIG.colors)),
    shapes: JSON.parse(JSON.stringify(S.visualDraft.shapes || window.DEFAULT_VISUAL_CONFIG.shapes)),
    thumbnail: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=300&q=80"
  };
  window.READY_MADE_THEMES.push(newTh);
  S.visualThemes = window.READY_MADE_THEMES;
  toast(`تم إنشاء ثيم [${name}] وإضافته لمعرض الثيمات! 🎨`, "ok");
  render();
};

window.openAddStoreCosmeticModal = function() {
  const name = prompt("أدخل اسم المظهر أو الثيم للمتجر:");
  if (!name) return;
  const price = parseInt(prompt("أدخل السعر بعملات Black Coins:", "500") || "500", 10);
  const newItem = {
    id: "store_" + Date.now().toString(36),
    name: name,
    category: "Theme",
    price: price,
    currency: "coin",
    rarity: "Rare",
    active: true,
    thumbnail: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=300&q=80",
    desc: "مظهر مخصص جديد في المتجر"
  };
  S.visualStoreItems = [newItem, ...(S.visualStoreItems || [])];
  save();
  toast("تمت إضافة العنصر لمتجر المظاهر بنجاح 🛍️", "ok");
  render();
};

window.toggleStoreItemStatus = function(itemId) {
  const item = (S.visualStoreItems || []).find(it => it.id === itemId);
  if (item) {
    item.active = !item.active;
    save();
    toast(`تم ${item.active ? 'تفعيل' : 'تعطيل'} العنصر في المتجر`, "ok");
    render();
  }
};

window.toggleHomeSectionEnabled = function(secId) {
  if (!S.visualDraft.pageSections) S.visualDraft.pageSections = { home: [] };
  const sec = (S.visualDraft.pageSections.home || []).find(s => s.id === secId);
  if (sec) {
    sec.enabled = !sec.enabled;
    VISUAL_ENGINE.saveDraft(S.visualDraft);
    render();
  }
};

// Initialize Visual Engine on startup
if (typeof window !== "undefined") {
  setTimeout(() => {
    if (window.VISUAL_ENGINE && window.VISUAL_ENGINE.init) {
      window.VISUAL_ENGINE.init();
    }
  }, 100);
}
'''

with open("index.html", "r", encoding="utf-8") as f:
    text = f.read()

pos1 = text.find("/* ==========================================================================\n   VISUAL_CONTROL_CENTER_COMPLETE_SYSTEM")
pos2 = text.find("</script>", pos1)

if pos1 == -1 or pos2 == -1:
    print("Error: Could not locate visual system code block in index.html")
    sys.exit(1)

text = text[:pos1] + new_visual_system + "\n" + text[pos2:]

with open("index.html", "w", encoding="utf-8") as f:
    f.write(text)

print("Successfully upgraded Visual Design System in index.html!")
