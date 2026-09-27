package com.animeblack.core.ui.chat

/**
 * Sticker packs shared with the web (`STICKER_PACKS` / `makeAnimeStickerSVG` in index.html). The
 * artwork is generated as the exact same SVG data URL, so stickers sent from Android render
 * identically on the web and vice versa (they are stored as `type: "sticker"` attachments).
 */
data class StickerDef(
    val id: String,
    val name: String,
    val color1: String,
    val color2: String,
    val meme: String,
    val character: String,
    /** gold | neon | white | none */
    val outline: String,
    val icon: String = "",
) {
    val dataUrl: String by lazy { makeAnimeStickerSvg(id, name, color1, color2, icon, meme, character, outline) }
}

data class StickerPack(val id: String, val nameAr: String, val nameEn: String, val icon: String, val items: List<StickerDef>)

/** Port of the web `makeAnimeStickerSVG` (same markup, `encodeURIComponent` encoding). */
@Suppress("UNUSED_PARAMETER")
fun makeAnimeStickerSvg(id: String, text: String, color1: String, color2: String, icon: String, meme: String, charName: String, outlineStyle: String): String {
    val strokeColor = when (outlineStyle) {
        "neon" -> "#00f0ff"
        "gold" -> "#fbbf24"
        else -> "#ffffff"
    }
    val strokeWidth = if (outlineStyle == "none") 0 else 5
    val shadowFilter = if (outlineStyle == "neon") "drop-shadow(0 0 8px rgba(0,240,255,0.8))" else "drop-shadow(0 4px 10px rgba(0,0,0,0.45))"
    val cleanId = id.ifBlank { "stk" }.replace(Regex("[^a-zA-Z0-9]"), "")
    val svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160">
    <defs>
      <linearGradient id="grad_${cleanId}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${color1}"/>
        <stop offset="100%" stop-color="${color2}"/>
      </linearGradient>
    </defs>
    <g style="filter: ${shadowFilter};">
      <rect x="8" y="8" width="144" height="144" rx="28" fill="#ffffff" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>
      <rect x="13" y="13" width="134" height="134" rx="24" fill="url(#grad_${cleanId})"/>
      <circle cx="80" cy="64" r="35" fill="#ffffff" fill-opacity="0.22"/>
      <text x="80" y="77" font-size="42" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif">${icon}</text>
      <rect x="18" y="112" width="124" height="26" rx="8" fill="#0f172a" fill-opacity="0.94"/>
      <text x="80" y="129" font-size="11.5" font-weight="900" fill="#ffffff" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif">${meme}</text>
      <text x="80" y="30" font-size="10" font-weight="bold" fill="#ffffff" fill-opacity="0.95" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif">${charName}</text>
    </g>
  </svg>"""
    return "data:image/svg+xml;charset=utf-8," + encodeUriComponent(svg)
}

private const val UNRESERVED = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_.!~*'()"

/** JavaScript `encodeURIComponent`. */
fun encodeUriComponent(value: String): String {
    val sb = StringBuilder(value.length * 3)
    for (b in value.toByteArray(Charsets.UTF_8)) {
        val c = (b.toInt() and 0xFF)
        if (c < 0x80 && UNRESERVED.indexOf(c.toChar()) >= 0) {
            sb.append(c.toChar())
        } else {
            sb.append('%').append("0123456789ABCDEF"[c shr 4]).append("0123456789ABCDEF"[c and 0x0F])
        }
    }
    return sb.toString()
}

val STICKER_PACKS: List<StickerPack> = listOf(
    StickerPack(
        id = "legends",
        nameAr = "أساطير الأنمي",
        nameEn = "Anime legends",
        icon = "crown",
        items = listOf(
            StickerDef("stk_luffy_g5", "لوفي جير 5", "#F59E0B", "#EF4444", "نيكا! ههههه", "لوفي إله الشمس", "gold", ""),
            StickerDef("stk_gojo_inf", "غوجو اللانهائي", "#312E81", "#818CF8", "المجال اللانهائي!", "غوجو ساتورو", "neon", ""),
            StickerDef("stk_levi_clean", "ليفاي تنظيف", "#1F2937", "#6B7280", "نظّف المكان فوراً!", "ليفاي أكرمان", "white", ""),
            StickerDef("stk_naruto_rasen", "ناروتو داتيبايو", "#EA580C", "#FACC15", "داتيبايو!", "ناروتو أوزوماكي", "gold", ""),
            StickerDef("stk_eren_tatakae", "إرين تاتاكاي", "#7F1D1D", "#B91C1C", "تاتاكاي! قاتل", "إرين ييغر", "neon", ""),
            StickerDef("stk_jinwoo_arise", "جين وو أرايز", "#1E1B4B", "#4F46E5", "أرايز! (نهوض)", "سيد الظلال", "neon", ""),
            StickerDef("stk_zoro_ashura", "زورو عاشوراء", "#14532D", "#22C55E", "عاشوراء ضائع!", "رورونوا زورو", "white", ""),
            StickerDef("stk_itachi_tsuk", "إيتاتشي تسوكيومي", "#450A0A", "#DC2626", "تسوكيومي الخالد!", "إيتاتشي أوتشيها", "neon", ""),
            StickerDef("stk_tanjiro_sun", "تانجيرو شمس", "#134E4A", "#14B8A6", "تنفس الشمس!", "تانجيرو كامادو", "gold", ""),
            StickerDef("stk_rengoku_umai", "رينغوكو أوماي", "#7C2D12", "#F59E0B", "أوماي! حارق!", "كوجورو رينغوكو", "gold", ""),
            StickerDef("stk_ichigo_bankai", "إيتشيغو بانكاي", "#C2410C", "#EA580C", "بانكاي!", "إيتشيغو كوروساكي", "white", ""),
            StickerDef("stk_saitama_ok", "سايتاما أوكي", "#78350F", "#F59E0B", "أوكي~ (OK)", "سايتاما", "white", ""),
        ),
    ),
    StickerPack(
        id = "reactions",
        nameAr = "ردود أفعال وميمز",
        nameEn = "Reactions & memes",
        icon = "sparkles",
        items = listOf(
            StickerDef("stk_anya_heh", "آنيا ههه", "#065F46", "#F472B6", "ههه... سخرية", "آنيا فورجر", "white", ""),
            StickerDef("stk_anya_waku", "آنيا واكو واكو", "#BE185D", "#FBCFE8", "واكو واكو!!", "آنيا فورجر", "gold", ""),
            StickerDef("stk_tanjiro_gross", "تانجيرو مشمئز", "#064E3B", "#34D399", "اشمئزاز تام!", "تانجيرو كامادو", "white", ""),
            StickerDef("stk_zenitsu_cry", "زينيتسو صراخ", "#A16207", "#FACC15", "مستحيييل!", "زينيتسو", "white", ""),
            StickerDef("stk_sukuna_laugh", "سوكونا غامباري", "#450A0A", "#DC2626", "غامباري غامباري", "ريو مين سوكونا", "neon", ""),
            StickerDef("stk_luffy_shock", "لوفي مصدوم", "#DC2626", "#FBBF24", "عيون طالعة!", "مونكي دي لوفي", "white", ""),
            StickerDef("stk_zoro_lost", "زورو ضائع", "#14532D", "#86EFAC", "أين أنا؟! بوصلة", "رورونوا زورو", "white", ""),
            StickerDef("stk_dio_kono", "ديو كونو ديو دا", "#854D0E", "#FBBF24", "كونو ديو دا!", "ديو براندو", "gold", ""),
            StickerDef("stk_denji_toast", "دنجي توست", "#7F1D1D", "#EF4444", "أريد توست ومربى", "دنجي", "white", ""),
            StickerDef("stk_killua_cat", "كيلوا قطة", "#0284C7", "#93C5FD", "وجه القطة الساخر", "كيلوا زولديك", "white", ""),
            StickerDef("stk_guts_pain", "غاتس ألم الثيم", "#1C1917", "#78716C", "ألم وصمت...", "غاتس", "white", ""),
            StickerDef("stk_toji_money", "توجي المال أولاً", "#1E293B", "#64748B", "ادفع لي أولاً", "توجي فوشيغورو", "white", ""),
        ),
    ),
    StickerPack(
        id = "chibi",
        nameAr = "تشيبي وكوايي",
        nameEn = "Chibi & kawaii",
        icon = "heart",
        items = listOf(
            StickerDef("stk_nezuko_box", "نيزوكو تلوح", "#9D174D", "#F472B6", "لطف الشياطين", "نيزوكو كامادو", "white", ""),
            StickerDef("stk_luffy_meat", "لوفي لحم", "#B45309", "#FBBF24", "لحم لذيذ!", "لوفي تشيبي", "gold", ""),
            StickerDef("stk_gojo_sweet", "غوجو حلوى", "#312E81", "#C7D2FE", "حلوى وغمزة", "غوجو تشيبي", "neon", ""),
            StickerDef("stk_chopper_hide", "شوبر خجول", "#0369A1", "#BAE6FD", "خجل معكوس!", "توني شوبر", "white", ""),
            StickerDef("stk_frieren_book", "فريـرن كتاب", "#064E3B", "#A7F3D0", "سحر الزهور", "فريـرن تشيبي", "white", ""),
            StickerDef("stk_bond_dog", "بوند الكلب", "#334155", "#E2E8F0", "بوف! فكاهي", "بوند فورجر", "white", ""),
            StickerDef("stk_killua_choco", "كيلوا شوكولاتة", "#0284C7", "#BAE6FD", "روبوت شوكو!", "كيلوا تشيبي", "white", ""),
            StickerDef("stk_itadori_dance", "إيتادوري رقص", "#C2410C", "#FED7AA", "رقصة البهجة", "إيتادوري تشيبي", "gold", ""),
        ),
    ),
    StickerPack(
        id = "badges",
        nameAr = "أختام وعبارات أوتاكو",
        nameEn = "Otaku stamps",
        icon = "award",
        items = listOf(
            StickerDef("stk_badge_tatakae", "تاتاكاي!", "#7F1D1D", "#B91C1C", "TATAKAE!", "شعار الأوتاكو", "neon", ""),
            StickerDef("stk_badge_shinzou", "شينزو ساساغيو!", "#1E293B", "#475569", "SHINZOU!", "فيلق الاستطلاع", "white", ""),
            StickerDef("stk_badge_dattebayo", "داتيبايو!", "#EA580C", "#FACC15", "DATTEBAYO!", "طريق النينجا", "gold", ""),
            StickerDef("stk_badge_bankai", "بانكاي!", "#450A0A", "#DC2626", "BANKAI!", "تحرير السيف", "neon", ""),
            StickerDef("stk_badge_arise", "أرايز!", "#1E1B4B", "#4F46E5", "ARISE!", "سيد الظلال", "neon", ""),
            StickerDef("stk_badge_araara", "أرا أرا~", "#581C87", "#C084FC", "ARA ARA~", "أنمي كلاسيك", "white", ""),
            StickerDef("stk_badge_yamero", "ياميرو!", "#991B1B", "#EF4444", "YAMERO!", "توقف فوراً", "white", ""),
            StickerDef("stk_badge_souka", "سوكا...", "#334155", "#94A3B8", "SOUKA...", "فهمت الأمر", "white", ""),
            StickerDef("stk_badge_nani", "ناندا كوري؟! (NANI)", "#C2410C", "#F59E0B", "NANI?!", "صدمة أوتاكو", "gold", ""),
            StickerDef("stk_badge_umai", "أوماي!", "#7C2D12", "#F59E0B", "UMAI!!", "شعلة القلب", "gold", ""),
        ),
    ),
)
