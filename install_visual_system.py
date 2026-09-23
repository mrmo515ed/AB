# -*- coding: utf-8 -*-
import re

with open("index.html", "r", encoding="utf-8") as f:
    html = f.read()

# Make sure we do not duplicate
if "VISUAL_CONTROL_CENTER_COMPLETE_SYSTEM" in html:
    print("Already installed!")
    exit(0)

# Build the complete Visual Control Center engine and views
visual_system_code = r'''
/* ==========================================================================
   VISUAL_CONTROL_CENTER_COMPLETE_SYSTEM
   ANIME BLACK — OWNER-ONLY VISUAL CUSTOMIZATION & DESIGN MANAGEMENT PLATFORM
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
    buttonGlow: true
  },
  backgrounds: {
    global: { type: "solid", color: "#08090D", image: "", blur: 0, opacity: 1 },
    home: { type: "solid", color: "#08090D", image: "", blur: 0, opacity: 1 },
    community: { type: "solid", color: "#08090D", image: "", blur: 0, opacity: 1 },
    chat: { type: "solid", color: "#08090D", image: "", blur: 0, opacity: 1 },
    reels: { type: "solid", color: "#000000", image: "", blur: 0, opacity: 1 },
    profile: { type: "solid", color: "#08090D", image: "", blur: 0, opacity: 1 },
    store: { type: "solid", color: "#08090D", image: "", blur: 0, opacity: 1 }
  },
  components: {
    primaryBtn: { bg: "linear-gradient(135deg, #00A3FF 0%, #8B5CF6 100%)", textColor: "#FFFFFF", radius: 99, padding: "9px 20px" },
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
  { id: "amoled_black", name: "AMOLED Pure Black", category: "Dark", description: "أسود مطلق يوفر طاقة الشاشات مع أزرار نيون زرقاء وقرمزية", colors: { primary: "#00A3FF", secondary: "#8B5CF6", bg: "#000000", bg2: "#080808", surface: "#111111", card: "#121214", border: "rgba(255,255,255,0.09)", textPrimary: "#FFFFFF" }, shapes: { cardRadius: 14, buttonRadius: 99 }, thumbnail: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=300&q=80" },
  { id: "cyber_neon", name: "Cyber Neon 2077", category: "Futuristic", description: "طابع سيبراني مستقبلي — سيان لامع ووردي فاقع مع إطارات متوهجة", colors: { primary: "#00F0FF", secondary: "#FF0055", bg: "#060814", bg2: "#0B0E1F", surface: "#10162F", card: "#121A38", border: "rgba(0,240,255,0.25)", textPrimary: "#FFFFFF" }, shapes: { cardRadius: 8, buttonRadius: 6 }, thumbnail: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=300&q=80" },
  { id: "deep_purple", name: "Deep Purple Galaxy", category: "Cosmic", description: "أرجواني ملكي عميق مستوحى من المجرات البعيدة والأساطير", colors: { primary: "#A855F7", secondary: "#EC4899", bg: "#090514", bg2: "#120B24", surface: "#1A1033", card: "#221644", border: "rgba(168,85,247,0.2)", textPrimary: "#FFFFFF" }, shapes: { cardRadius: 16, buttonRadius: 99 }, thumbnail: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=300&q=80" },
  { id: "anime_energy", name: "Anime Energy Red", category: "Action", description: "طاقة قتالية وشعلة ملتهبة مستوحاة من عوالم الشونين والأنمي الحماسي", colors: { primary: "#E60000", secondary: "#FF7A00", bg: "#0A0505", bg2: "#140A0A", surface: "#1F0F0F", card: "#291414", border: "rgba(230,0,0,0.22)", textPrimary: "#FFFFFF" }, shapes: { cardRadius: 14, buttonRadius: 99 }, thumbnail: "https://images.unsplash.com/photo-1563089145-599997674d42?w=300&q=80" },
  { id: "luxury_glass", name: "Luxury Dark Glass", category: "Premium", description: "زجاج فخم معتم مع انعكاسات ضوئية فائقة الدقة وظلال ناعمة", colors: { primary: "#60A5FA", secondary: "#C084FC", bg: "#0B0F19", bg2: "#111827", surface: "rgba(30,41,59,0.7)", card: "rgba(30,41,59,0.65)", border: "rgba(255,255,255,0.14)", textPrimary: "#FFFFFF" }, shapes: { cardRadius: 18, buttonRadius: 14 }, thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&q=80" },
  { id: "gold_premium", name: "Imperial Gold VIP", category: "Luxury", description: "هيبة الذهب الإمبراطوري — بريق ملكي مع خلفيات أبنوسية داكنة", colors: { primary: "#F59E0B", secondary: "#D97706", bg: "#0A0905", bg2: "#14120A", surface: "#1F1C0F", card: "#2B2615", border: "rgba(245,158,11,0.25)", textPrimary: "#FFFFFF" }, shapes: { cardRadius: 14, buttonRadius: 99 }, thumbnail: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=300&q=80" },
  { id: "ocean_night", name: "Abyssal Ocean", category: "Atmospheric", description: "أزرق المحيطات العميقة — تدرجات هادئة وراقية للعين", colors: { primary: "#0EA5E9", secondary: "#3B82F6", bg: "#030A14", bg2: "#071324", surface: "#0B1D36", card: "#0F2647", border: "rgba(14,165,233,0.2)", textPrimary: "#FFFFFF" }, shapes: { cardRadius: 14, buttonRadius: 99 }, thumbnail: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&q=80" },
  { id: "green_cyber", name: "Matrix Cyberpunk", category: "Futuristic", description: "أخضر الزمرد الرقمي وشبكات المستقبل المتقدمة", colors: { primary: "#10B981", secondary: "#059669", bg: "#040D09", bg2: "#071811", surface: "#0B261B", card: "#0F3324", border: "rgba(16,185,129,0.22)", textPrimary: "#FFFFFF" }, shapes: { cardRadius: 12, buttonRadius: 8 }, thumbnail: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=300&q=80" },
  { id: "crimson_night", name: "Crimson Vampire", category: "Gothic", description: "ياقوتي دموي غامض مستوحى من ليل طوكيو والقصص الخارقة", colors: { primary: "#F43F5E", secondary: "#BE123C", bg: "#0F0508", bg2: "#1A0A0F", surface: "#2B0F18", card: "#381420", border: "rgba(244,63,94,0.25)", textPrimary: "#FFFFFF" }, shapes: { cardRadius: 16, buttonRadius: 99 }, thumbnail: "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=300&q=80" },
  { id: "minimal_charcoal", name: "Minimal Charcoal Studio", category: "Minimal", description: "رمادي فحمي متوازن وعصري بأعلى معايير البساطة الاحترافية", colors: { primary: "#E5E7EB", secondary: "#9CA3AF", bg: "#121316", bg2: "#1A1C21", surface: "#22252C", card: "#282C35", border: "rgba(255,255,255,0.08)", textPrimary: "#F9FAFB" }, shapes: { cardRadius: 10, buttonRadius: 8 }, thumbnail: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=300&q=80" },
  { id: "sunset_samurai", name: "Sunset Samurai", category: "Artistic", description: "غروب الساموراي الذهبي الممزوج بنار الكرز اليابانية", colors: { primary: "#FB923C", secondary: "#F43F5E", bg: "#0D080A", bg2: "#170E12", surface: "#26161D", card: "#331E27", border: "rgba(251,146,60,0.2)", textPrimary: "#FFFFFF" }, shapes: { cardRadius: 14, buttonRadius: 99 }, thumbnail: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=300&q=80" },
  { id: "galaxy_voyager", name: "Voyager Nebula", category: "Cosmic", description: "سديم كوني ناصع وتدرجات ملهمة بين الأزرق السماوي والبنفسجي", colors: { primary: "#38BDF8", secondary: "#C084FC", bg: "#060A14", bg2: "#0C1224", surface: "#131C38", card: "#19254A", border: "rgba(56,189,248,0.22)", textPrimary: "#FFFFFF" }, shapes: { cardRadius: 16, buttonRadius: 99 }, thumbnail: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=300&q=80" }
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

    this.applyConfig(S.visualConfig);
    this.listenToRemoteConfig();
  },

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
      version: "1." + ((S.visualVersions||[]).length + 1) + ".0",
      name: S.visualDraft.theme.name || "إصدار تصميم جديد",
      author: authorEmail,
      publishedAt: Date.now(),
      note: note || "تم النشر من مركز التحكم البصري",
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
  setHdr(backHdr("مركز التحكم البصري · Visual Control Center", "إدارة وتخصيص هوية أنمي بلاك", `<button class="btn btn-primary btn-xs" onclick="VISUAL_ENGINE.publishDraft()" style="gap:5px">${I("sparkles","i s")} نشر التغييرات</button>`));

  const draft = S.visualDraft || S.visualConfig || window.DEFAULT_VISUAL_CONFIG;
  const currentTheme = (draft.theme && draft.theme.name) || "AMOLED Pure Black";
  const versionsCount = (S.visualVersions || []).length;
  const assetsCount = (S.visualAssets || []).length;
  const badgesCount = (S.visualBadges || []).length;
  const storeCount = (S.visualStoreItems || []).length;
  const auditCount = (S.visualAuditLogs || []).length;

  const subTabs = [
    ["overview", "نظرة عامة", "home"],
    ["studio", "استوديو التصميم", "brush"],
    ["themes", "الثيمات الجاهزة", "sparkles"],
    ["components", "المكونات والأزرار", "layers"],
    ["icons", "إدارة الأيقونات", "star"],
    ["assets", "الأصول والصور", "image"],
    ["badges", "الشارات والأوسمة", "award"],
    ["store", "متجر المظاهر", "coins"],
    ["pages", "أقسام الصفحات", "grid"],
    ["preview", "المعاينة الحية", "eye"],
    ["versions", "سجل الإصدارات", "clock"],
    ["audit", "سجل العمليات", "file"],
    ["recovery", "الأمان والاستعادة", "shield"]
  ];

  return `
  <div class="pad" style="max-width:980px;margin:0 auto;padding-bottom:60px">
    <!-- Header Hero Banner -->
    <div style="display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-radius:18px;background:linear-gradient(135deg,#001026 0%,#002B66 40%,#00A3FF 100%);color:#fff;margin-bottom:14px;box-shadow:0 12px 30px rgba(0,163,255,.25);border:1px solid rgba(255,255,255,.15)">
      <div style="display:flex;align-items:center;gap:14px">
        <div style="width:48px;height:48px;border-radius:14px;background:rgba(0,0,0,.35);display:flex;align-items:center;justify-content:center;color:#00F0FF;border:1px solid rgba(0,240,255,.3)">${I("sparkles","l")}</div>
        <div>
          <div class="bb sm" style="font-size:16px;letter-spacing:.3px">مركز التحكم البصري الأعلى · VISUAL CONTROL</div>
          <div class="tiny" style="color:rgba(255,255,255,.8);margin-top:2px">التحكم الشامل بالثيمات، الألوان، الأزرار، الشارات والمتجر دون المساس بالبرمجة</div>
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
        <div class="tiny fnt mut" style="margin-top:2px">الوضع الداكن المتقدم</div>
      </div>
      <div class="card" style="padding:14px;border-left:4px solid var(--purple)">
        <div class="tiny mut">إجمالي الإصدارات المنشورة</div>
        <div class="bb sm" style="color:var(--purple);margin-top:4px">${versionsCount} إصدارات</div>
        <div class="tiny fnt mut" style="margin-top:2px">إمكانية استرجاع فورية</div>
      </div>
      <div class="card" style="padding:14px;border-left:4px solid var(--emerald)">
        <div class="tiny mut">الأصول والصور المرفوعة</div>
        <div class="bb sm" style="color:var(--emerald);margin-top:4px">${assetsCount} أصل</div>
        <div class="tiny fnt mut" style="margin-top:2px">Storage آمن ومحسن</div>
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
        ${I("sparkles","i s")} منصة الانطلاق والإجراءات السريعة
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:10px">
        <button class="btn btn-sec" onclick="go('visualControlCenter',{sub:'studio'})" style="justify-content:flex-start;gap:10px;padding:12px 14px">
          <span style="color:var(--accent)">${I("brush","i s")}</span>
          <div style="text-align:right">
            <div class="b xs">استوديو التصميم</div>
            <div class="tiny mut">تعديل الألوان والخطوط والأشكال</div>
          </div>
        </button>
        <button class="btn btn-sec" onclick="go('visualControlCenter',{sub:'themes'})" style="justify-content:flex-start;gap:10px;padding:12px 14px">
          <span style="color:var(--purple)">${I("sparkles","i s")}</span>
          <div style="text-align:right">
            <div class="b xs">معرض الثيمات</div>
            <div class="tiny mut">12+ قالب جاهز فخم بضغطة زر</div>
          </div>
        </button>
        <button class="btn btn-sec" onclick="go('visualControlCenter',{sub:'badges'})" style="justify-content:flex-start;gap:10px;padding:12px 14px">
          <span style="color:var(--gold)">${I("award","i s")}</span>
          <div style="text-align:right">
            <div class="b xs">منشئ الشارات</div>
            <div class="tiny mut">إنشاء أوسمة الرتب والإنجازات</div>
          </div>
        </button>
        <button class="btn btn-sec" onclick="go('visualControlCenter',{sub:'preview'})" style="justify-content:flex-start;gap:10px;padding:12px 14px">
          <span style="color:var(--emerald)">${I("eye","i s")}</span>
          <div style="text-align:right">
            <div class="b xs">المعاينة الحية</div>
            <div class="tiny mut">محاكاة الهاتف والتابلت والمقارنة</div>
          </div>
        </button>
      </div>
    </div>

    <!-- Live Draft Status Card -->
    <div class="card2" style="padding:16px;border:1px solid rgba(0,163,255,.2);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px">
      <div style="display:flex;align-items:center;gap:12px">
        <div style="width:38px;height:38px;border-radius:10px;background:rgba(0,163,255,.15);display:flex;align-items:center;justify-content:center;color:var(--accent)">${I("clock","i s")}</div>
        <div>
          <div class="b xs" style="color:var(--txt)">حالة مسودة التصميم الحالية (Draft)</div>
          <div class="tiny mut">آخر تعديل: ${new Date(draft.updatedAt || Date.now()).toLocaleTimeString("ar-EG")} · جاهزة للنشر الفوري</div>
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

  return `
    <div class="col" style="gap:14px">
      <!-- Colors Palette Editor -->
      <div class="card" style="padding:16px">
        <div class="rowb" style="margin-bottom:12px">
          <div class="bb xs" style="color:var(--accent);display:flex;align-items:center;gap:8px">${I("brush","i s")} منظومة الألوان العامة (Color Tokens)</div>
          <button class="btn btn-sec btn-xs" onclick="resetDefaultColors()">${I("rotate","i s")} استعادة الافتراضي</button>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px">
          ${[
            ["primary", "اللون الأساسي (Primary)", colors.primary || "#00A3FF"],
            ["secondary", "اللون الثانوي (Secondary)", colors.secondary || "#8B5CF6"],
            ["tertiary", "اللون الثالث (Tertiary)", colors.tertiary || "#EC4899"],
            ["bg", "خلفية التطبيق (Background)", colors.bg || "#08090D"],
            ["bg2", "خلفية الحاويات (Background 2)", colors.bg2 || "#0D0F16"],
            ["card", "لون البطاقات (Card Surface)", colors.card || "#151822"],
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
        <div class="bb xs" style="color:var(--purple);margin-bottom:12px;display:flex;align-items:center;gap:8px">${I("layers","i s")} زوايا واستدارة العناصر (Corner Radius)</div>
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
        <div class="bb xs" style="color:var(--gold);margin-bottom:12px;display:flex;align-items:center;gap:8px">${I("edit","i s")} منظومة الخطوط والطباعة (Typography)</div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px">
          <div>
            <div class="tiny fnt mut" style="margin-bottom:6px">عائلة الخط الأساسي (Font Family):</div>
            <select class="in" onchange="updateDraftTypo('fontFamily', this.value)" style="padding:8px">
              <option value="'Tajawal', 'Plus Jakarta Sans', sans-serif" ${typo.fontFamily && typo.fontFamily.includes('Tajawal') ? 'selected' : ''}>Tajawal (تجوال — الخط الرسمي)</option>
              <option value="'Cairo', sans-serif" ${typo.fontFamily && typo.fontFamily.includes('Cairo') ? 'selected' : ''}>Cairo (كايرو الحديث)</option>
              <option value="'IBM Plex Sans Arabic', sans-serif" ${typo.fontFamily && typo.fontFamily.includes('IBM') ? 'selected' : ''}>IBM Plex Sans Arabic (تقني أنيق)</option>
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
      <div class="rowb" style="padding:12px;border-radius:14px;background:var(--card2);border:1px solid var(--line)">
        <button class="btn btn-sec btn-sm" onclick="applyDraftTemporarily()">${I("eye","i s")} معاينة فورية في التطبيق</button>
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
          <div class="bb xs" style="color:var(--txt)">معرض الثيمات الاحترافية الجاهزة (12+ Themes)</div>
          <div class="tiny mut">تطبيق وتخصيص هوية بصرية كاملة بضغطة واحدة</div>
        </div>
        <button class="btn btn-primary btn-xs" onclick="createNewCustomTheme()">${I("plus","i s")} إنشاء ثيم جديد</button>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:12px">
        ${(window.READY_MADE_THEMES || []).map(th => {
          const isCurrent = draft.theme && draft.theme.id === th.id;
          return `
            <div class="card" style="overflow:hidden;border:1px solid ${isCurrent ? 'var(--accent)' : 'var(--line)'};position:relative">
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
      <div class="bb xs" style="color:var(--txt)">استوديو المكونات والأزرار (Component Library)</div>
      
      <!-- Primary Buttons -->
      <div class="card" style="padding:16px">
        <div class="bb xs" style="color:var(--accent);margin-bottom:10px">الأزرار الأساسية (Primary Buttons)</div>
        <div class="rowb" style="flex-wrap:wrap;gap:12px">
          <div style="display:flex;gap:8px">
            <button class="btn btn-primary">${I("sparkles","i s")} زر قياسي أساسي</button>
            <button class="btn btn-primary btn-sm">${I("check","i s")} زر صغير</button>
          </div>
          <div style="display:flex;gap:8px">
            <button class="btn btn-sec">${I("settings","i s")} زر ثانوي</button>
            <button class="btn btn-outline" style="border:1px solid var(--accent);color:var(--accent)">زر شفاف مفرغ</button>
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
              <select class="in" style="width:100px;padding:4px" onchange="updateIconSlot('${slot}', this.value)">
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
          <div class="bb xs" style="color:var(--txt)">مدير الأصول والصور المرفوعة (Asset Storage Manager)</div>
          <div class="tiny mut">رفع وتخزين الصور والأيقونات والخلفيات عبر Firebase Storage</div>
        </div>
        <button class="btn btn-primary btn-xs" onclick="triggerAssetUpload()">${I("upload","i s")} رفع صورة / أصل جديد</button>
      </div>

      <input type="file" id="visual_asset_file_input" accept="image/*" style="display:none" onchange="handleAssetFileSelected(event)">

      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px">
        ${assets.map(ast => `
          <div class="card" style="padding:10px">
            <div style="height:120px;border-radius:10px;overflow:hidden;background:#000;margin-bottom:8px;display:flex;align-items:center;justify-content:center">
              <img src="${ast.url}" style="max-height:100%;max-width:100%;object-fit:cover" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'100\' height=\'100\'><rect width=\'100\' height=\'100\' fill=\'%23151822\'/></svg>'">
            </div>
            <div class="rowb" style="margin-bottom:2px">
              <div class="b xs" style="color:#fff;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${ast.name}</div>
              <span class="badge b-blue" style="font-size:9px">${ast.category}</span>
            </div>
            <div class="rowb tiny mut" style="margin-top:4px">
              <span>الحجم: ${ast.size || '32KB'}</span>
              <span>استخدام: ${ast.usageCount || 0} مرات</span>
            </div>
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
          <div class="bb xs" style="color:var(--txt)">منشئ ومدير الشارات والأوسمة (Universal Badge System)</div>
          <div class="tiny mut">إنشاء أوسمة الرتب والمؤسسين والإنجازات مع شروط استحقاق حقيقية</div>
        </div>
        <button class="btn btn-primary btn-xs" onclick="openCreateBadgeModal()">${I("plus","i s")} إنشاء شارة جديدة</button>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px">
        ${badges.map(b => `
          <div class="card" style="padding:14px;border-right:4px solid ${b.color || 'var(--accent)'}">
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px">
              <div style="width:42px;height:42px;border-radius:12px;background:rgba(255,255,255,0.06);display:flex;align-items:center;justify-content:center;color:${b.color};border:1px solid ${b.color}44">
                ${I(b.icon || "star", "m")}
              </div>
              <div>
                <div class="b xs" style="color:#fff">${b.name}</div>
                <div style="display:flex;gap:4px;margin-top:2px">
                  <span class="badge" style="background:${b.color}22;color:${b.color};font-size:9px">${b.rarity}</span>
                  <span class="badge" style="background:rgba(255,255,255,0.08);color:#ccc;font-size:9px">${b.category}</span>
                </div>
              </div>
            </div>
            <div class="tiny mut" style="line-height:1.5;margin-bottom:10px">${b.desc}</div>
            <div class="rowb tiny" style="color:var(--faint)">
              <span>الشرط: ${b.condition}</span>
              ${b.protected ? `<span style="color:var(--rose)">${I("lock","i s")} محمية</span>` : ''}
            </div>
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

// Store Element Manager
function renderVisualStoreManager() {
  const items = S.visualStoreItems || [];
  return `
    <div class="col" style="gap:14px">
      <div class="rowb">
        <div>
          <div class="bb xs" style="color:var(--txt)">مدير مظاهر المتجر والعناصر التجميلية (Store Cosmetics)</div>
          <div class="tiny mut">إضافة إطارات وثيمات ومظاهر محادثة للبيع بعملات بلاك والنجوم الحقيقية</div>
        </div>
        <button class="btn btn-primary btn-xs" onclick="openCreateStoreItemModal()">${I("plus","i s")} إضافة عنصر جديد للمتجر</button>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px">
        ${items.map(it => `
          <div class="card" style="padding:12px">
            <div style="height:100px;border-radius:10px;overflow:hidden;background:#000;margin-bottom:8px">
              <img src="${it.thumbnail}" style="width:100%;height:100%;object-fit:cover">
            </div>
            <div class="rowb" style="margin-bottom:4px">
              <div class="b xs" style="color:#fff">${it.name}</div>
              <span class="badge b-gold mono" style="font-size:10px">${it.price} 🪙</span>
            </div>
            <div class="tiny mut" style="line-height:1.4;margin-bottom:8px">${it.desc}</div>
            <div class="rowb tiny">
              <span class="badge b-purple" style="font-size:9px">${it.category}</span>
              <span style="color:var(--emerald)">${it.active ? 'نشط بالمتجر' : 'معطل'}</span>
            </div>
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
      <div class="bb xs" style="color:var(--txt)">محدد أقسام الصفحة الرئيسية (Home Page Section Builder)</div>
      <div class="tiny mut">إظهار وإخفاء وترتيب أقسام الصفحة الرئيسية بسهولة وأمان</div>

      <div class="card" style="padding:14px">
        <div class="col" style="gap:8px">
          ${sections.map((sec, idx) => `
            <div class="card2" style="padding:12px;display:flex;align-items:center;justify-content:space-between">
              <div style="display:flex;align-items:center;gap:10px">
                <span class="badge b-blue mono" style="font-size:10px">#${idx + 1}</span>
                <div class="b xs" style="color:#fff">${sec.title}</div>
                <div class="tiny mono mut">(${sec.id})</div>
              </div>
              <div style="display:flex;align-items:center;gap:8px">
                <button class="btn btn-sec btn-xs" onclick="toggleSectionState('${sec.id}')">${sec.enabled ? 'مفعل ✅' : 'مخفي ❌'}</button>
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    </div>
  `;
}

// Live Multi-Device Preview
function renderVisualLivePreview(draft) {
  const colors = draft.colors || {};
  return `
    <div class="col" style="gap:14px">
      <div class="rowb">
        <div>
          <div class="bb xs" style="color:var(--txt)">المعاينة الحية التفاعلية ومحاكي الأجهزة (Live Device Simulator)</div>
          <div class="tiny mut">معاينة كاملة على مقاسات الشاشات المختلفة مع مقارنة قبل وبعد</div>
        </div>
      </div>

      <!-- Simulator Frame -->
      <div class="center" style="padding:20px 0;background:rgba(0,0,0,0.5);border-radius:18px">
        <div style="width:360px;height:580px;border-radius:32px;border:8px solid #222;background:${colors.bg || '#08090D'};box-shadow:0 25px 60px rgba(0,0,0,0.8);overflow:hidden;display:flex;flex-direction:column;position:relative">
          <!-- Top Phone Notch -->
          <div style="height:24px;background:#000;display:flex;align-items:center;justify-content:center">
            <div style="width:60px;height:12px;background:#111;border-radius:99px"></div>
          </div>
          <!-- App Header in Preview -->
          <div style="padding:10px 14px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid ${colors.border || 'rgba(255,255,255,0.1)'}">
            <div class="bb xs" style="color:${colors.primary || '#00A3FF'}">ANIME BLACK</div>
            <div style="display:flex;gap:6px">
              <span style="color:${colors.textPrimary || '#fff'}">${I("search","i s")}</span>
              <span style="color:${colors.textPrimary || '#fff'}">${I("bell","i s")}</span>
            </div>
          </div>
          <!-- Feed Simulator Content -->
          <div class="g1 pad no-sb" style="overflow-y:auto;display:flex;flex-direction:column;gap:10px;padding:10px">
            <div style="padding:10px;border-radius:12px;background:${colors.card || '#151822'};border:1px solid ${colors.border || 'rgba(255,255,255,0.08)'}">
              <div class="row" style="gap:8px;margin-bottom:8px">
                <div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,${colors.primary},${colors.secondary})"></div>
                <div>
                  <div class="tiny b" style="color:${colors.textPrimary}">Anime Master</div>
                  <div class="tiny mut" style="font-size:9px">منذ ٥ دقائق</div>
                </div>
              </div>
              <div class="tiny" style="color:${colors.textPrimary};line-height:1.5">معاينة حية للمنشور بالهوية البصرية الجديدة المصممة في المركز!</div>
              <div class="rowb" style="margin-top:10px;border-top:1px solid rgba(255,255,255,0.06);padding-top:6px">
                <span style="color:${colors.primary};font-size:10px">${I("heart","i s")} 142</span>
                <span style="color:${colors.textSecondary};font-size:10px">${I("comment","i s")} 38</span>
                <span style="color:${colors.textSecondary};font-size:10px">${I("fwd","i s")} 12</span>
              </div>
            </div>
            <button class="btn btn-primary btn-sm" style="width:100%;margin-top:4px">${I("sparkles","i s")} تجربة الأزرار</button>
          </div>
          <!-- Bottom Nav in Preview -->
          <div style="height:48px;background:${colors.bg2 || '#0D0F16'};border-top:1px solid ${colors.border || 'rgba(255,255,255,0.1)'};display:flex;align-items:center;justify-content:space-around">
            <span style="color:${colors.primary}">${I("home","i s")}</span>
            <span style="color:${colors.textSecondary}">${I("compass","i s")}</span>
            <span style="color:${colors.textSecondary}">${I("chat","i s")}</span>
            <span style="color:${colors.textSecondary}">${I("clapper","i s")}</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Versions & Rollback
function renderVisualVersionHistory() {
  const versions = S.visualVersions || [];
  return `
    <div class="col" style="gap:14px">
      <div class="bb xs" style="color:var(--txt)">سجل الإصدارات المنشورة والاسترجاع الفوري (Version Control & Rollback)</div>
      <div class="tiny mut">كل عملية نشر تنشئ إصداراً ثابتاً غير قابل للتعديل مع إمكانية استرجاعه بضغطة زر واحدة دون حذف التاريخ</div>

      <div class="col" style="gap:10px">
        ${versions.map(v => `
          <div class="card" style="padding:14px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px">
            <div>
              <div class="row" style="gap:8px">
                <span class="badge b-purple mono">${v.version}</span>
                <b class="xs" style="color:#fff">${v.name}</b>
              </div>
              <div class="tiny mut" style="margin-top:4px">بواسطة: ${v.author} · ${new Date(v.publishedAt).toLocaleString("ar-EG")}</div>
              <div class="tiny fnt" style="color:var(--faint);margin-top:2px">${v.note || ''}</div>
            </div>
            <div style="display:flex;gap:6px">
              <button class="btn btn-sec btn-xs" onclick="VISUAL_ENGINE.rollbackToVersion('${v.id}')">${I("rotate","i s")} استرجاع هذا الإصدار</button>
            </div>
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

// Audit Logs
function renderVisualAuditLogs() {
  const logs = S.visualAuditLogs || [];
  return `
    <div class="col" style="gap:14px">
      <div class="bb xs" style="color:var(--txt)">سجل تدقيق عمليات المالك (Immutable Audit Logs)</div>
      <div class="tiny mut">سجل آمن وغير قابل للحذف يسجل كافة عمليات تعديل وتخصيص ونشر التصاميم</div>

      <div class="card" style="padding:10px;overflow-x:auto">
        <table style="width:100%;border-collapse:collapse;text-align:right">
          <thead>
            <tr style="border-bottom:1px solid var(--line);color:var(--muted);font-size:11px">
              <th style="padding:8px">العملية</th>
              <th style="padding:8px">التفاصيل</th>
              <th style="padding:8px">المسؤول</th>
              <th style="padding:8px">التوقيت</th>
            </tr>
          </thead>
          <tbody>
            ${logs.map(lg => `
              <tr style="border-bottom:1px solid rgba(255,255,255,0.04);font-size:12px">
                <td style="padding:8px"><span class="badge b-blue mono">${lg.action}</span></td>
                <td style="padding:8px;color:#fff">${lg.details}</td>
                <td style="padding:8px;color:var(--muted);font-family:monospace;font-size:11px">${lg.author}</td>
                <td style="padding:8px;color:var(--faint);font-size:11px">${new Date(lg.timestamp).toLocaleTimeString("ar-EG")}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// Recovery & Safe Mode
function renderVisualRecovery() {
  return `
    <div class="col" style="gap:14px">
      <div class="card" style="padding:16px;border:1px solid rgba(239,68,68,0.4);background:rgba(239,68,68,0.06)">
        <div class="row" style="gap:10px;margin-bottom:10px">
          <span style="color:var(--rose)">${I("alert","l")}</span>
          <div>
            <div class="bb sm" style="color:var(--rose)">منطقة الطوارئ واستعادة النظام (Safe Mode & Recovery)</div>
            <div class="tiny mut">في حال حدوث أي خلل في الهوية البصرية، يمكنك العودة الفورية للإعدادات المصنعية الآمنة</div>
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
  
  // Create local preview and upload
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

window.openCreateBadgeModal = function() {
  const name = prompt("أدخل اسم الشارة الجديدة (مثال: أسطورة الأنمي Lv.50):");
  if (!name || !name.trim()) return;
  const desc = prompt("أدخل وصف الشارة:") || "شارة تذكارية في أنمي بلاك";
  const newBadge = {
    id: "bdg_" + Date.now().toString(36),
    name: name.trim(),
    category: "Custom",
    rarity: "Epic",
    color: "#00A3FF",
    icon: "award",
    desc: desc,
    locations: ["profile","post_header"],
    condition: "manual",
    protected: false
  };
  S.visualBadges = [newBadge, ...(S.visualBadges || [])];
  save();
  toast("تم إنشاء الشارة الجديدة بنجاح 🏅", "ok");
  render();
};

window.openCreateStoreItemModal = function() {
  const name = prompt("أدخل اسم عنصر المتجر (مثال: إطار التنين المشتعل):");
  if (!name || !name.trim()) return;
  const priceStr = prompt("أدخل السعر بعملات بلاك (Coins):", "500");
  const price = parseInt(priceStr, 10) || 500;
  const newItem = {
    id: "store_" + Date.now().toString(36),
    name: name.trim(),
    category: "Frame",
    price: price,
    currency: "coin",
    rarity: "Epic",
    active: true,
    thumbnail: "https://images.unsplash.com/photo-1563089145-599997674d42?w=300&q=80",
    desc: "عنصر تجميلي حصري لمتجر أنمي بلاك"
  };
  S.visualStoreItems = [newItem, ...(S.visualStoreItems || [])];
  save();
  toast("تمت إضافة العنصر التجميلي للمتجر بنجاح 🛍️", "ok");
  render();
};

window.toggleSectionState = function(secId) {
  if (!S.visualDraft.pageSections || !S.visualDraft.pageSections.home) return;
  const sec = S.visualDraft.pageSections.home.find(s => s.id === secId);
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

# Find insertion point before </script> at the end of index.html
pos = html.rfind("</script>")
if pos != -1:
    new_html = html[:pos] + "\n" + visual_system_code + "\n" + html[pos:]
    with open("index.html", "w", encoding="utf-8") as f:
        f.write(new_html)
    print("Successfully inserted Visual Control Center into index.html!")
else:
    print("Could not find </script> tag!")
