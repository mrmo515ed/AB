package com.animeblack.core.ui.chat

/**
 * Curated anime GIFs shared with the web chat (`CURATED_ANIME_GIFS` / `ANIME_GIF_CATEGORIES`).
 * The web's live search used the retired Tenor v1 API with a demo key, so the native picker
 * searches this catalogue offline instead. GIFs are sent as `type: "gif"` messages.
 */
data class CuratedGif(val title: String, val url: String)

data class GifCategory(val key: String, val labelAr: String, val labelEn: String, val items: List<CuratedGif>)

val GIF_CATEGORIES: List<GifCategory> = listOf(
    GifCategory("real_anime", "شخصيات حقيقية", "Anime characters", listOf(
        CuratedGif("غوجو ساتورو - العين المضيئة", "https://media.tenor.com/3e459b7201c107bf457d7dd59c049d5a/tenor.gif"),
        CuratedGif("غوجو ساتورو - توسيع المجال", "https://media.giphy.com/media/UgV8Y7bDoxzdg40PMU/giphy.gif"),
        CuratedGif("لوفي - جير 5 الأسطوري", "https://media.giphy.com/media/WmkqburJqXziM/giphy.gif"),
        CuratedGif("زورو - قاطع السيوف والهاكي", "https://media.giphy.com/media/4OV1bHavuPPtm/giphy.gif"),
        CuratedGif("ناروتو أوزوماكي - نمط الناسك", "https://media.giphy.com/media/JRlqKEzTDKci5JPcaL/giphy.gif"),
        CuratedGif("ساسكي أوتشيها - الشارينغان والتشيدوري", "https://media.giphy.com/media/11TzKk84rRjXlm/giphy.gif"),
        CuratedGif("إيتاشي أوتشيها - الغراب والمانغيكيو", "https://media.giphy.com/media/CchzkJJ6UrQmQ/giphy.gif"),
        CuratedGif("ليفاي أكرمان - قتال العمالقة", "https://media.giphy.com/media/3o7btQ8jDTPGDpgc6I/giphy.gif"),
        CuratedGif("إيرين ييغر - تاتاكاي المهاجم", "https://media.giphy.com/media/kgo9KtvX2dCVudr645/giphy.gif"),
        CuratedGif("سوكونا - ملك اللعنات والضريح", "https://media.giphy.com/media/4lu5FuhtrbaOQgKN57/giphy.gif"),
        CuratedGif("كيلوا زولديك - سرعة البرق", "https://media.giphy.com/media/8DTnuPhxv0m4w/giphy.gif"),
        CuratedGif("غوكو - الغريزة الفائقة", "https://media.giphy.com/media/97HzebmSgpaHC/giphy.gif"),
        CuratedGif("سايتاما - الرجل ذو اللكمة الواحدة", "https://media.giphy.com/media/yo3TC0yeHd53G/giphy.gif"),
        CuratedGif("تانجيرو كامادو - رقصة إله النار", "https://media.giphy.com/media/jh7F73wOtnKliQXbRT/giphy.gif"),
        CuratedGif("سونغ جين ووا - أرايز ملك الظلال", "https://media.tenor.com/154df6bb51e04a57f12e8b6ee3aa2d86/tenor.gif"),
        CuratedGif("مادارا أوتشيها - أسطورة الشينوبي", "https://media.giphy.com/media/b7Uq708fc78M8/giphy.gif"),
    )),
    GifCategory("reactions", "ردود حية", "Reactions", listOf(
        CuratedGif("حماس أوتاكو", "https://media.giphy.com/media/4N5vB4aErlVtVsywBw/giphy.gif"),
        CuratedGif("ضحك هستيري", "https://media.giphy.com/media/mguPrVJyR853C0cG5W/giphy.gif"),
        CuratedGif("صدمة وذهول", "https://media.giphy.com/media/xT9IgG50Fb7Mi0prBC/giphy.gif"),
        CuratedGif("كاواي كيوت", "https://media.giphy.com/media/13CoXDiaCcCoyk/giphy.gif"),
        CuratedGif("حزن ودموع", "https://media.giphy.com/media/3o7TKMt1VVNkHV2PaE/giphy.gif"),
        CuratedGif("غضب ونيران", "https://media.giphy.com/media/l41lFw057lAJQMwg0/giphy.gif"),
        CuratedGif("إعجاب وحب", "https://media.giphy.com/media/3o6Zt481isNVuQI1l6/giphy.gif"),
        CuratedGif("رقص واحتفال", "https://media.giphy.com/media/26AHONQ79FdWZhAI0/giphy.gif"),
        CuratedGif("ثقة وفخر", "https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif"),
        CuratedGif("أكل وشراهة", "https://media.giphy.com/media/11zTEl7fbxPTK8/giphy.gif"),
    )),
    GifCategory("jujutsu", "جوجوتسو كايسن", "Jujutsu Kaisen", listOf(
        CuratedGif("غوجو توسيع المجال", "https://media.giphy.com/media/UgV8Y7bDoxzdg40PMU/giphy.gif"),
        CuratedGif("غوجو البنفسجي الأجوف", "https://media.giphy.com/media/DGsDLr9nyz2LkVgKFs/giphy.gif"),
        CuratedGif("سوكونا الضريح الخبيث", "https://media.giphy.com/media/4lu5FuhtrbaOQgKN57/giphy.gif"),
        CuratedGif("يوجي الضربة السوداء", "https://media.giphy.com/media/fGGV7FeScq2s/giphy.gif"),
        CuratedGif("ميغومي الظلال العشرة", "https://media.giphy.com/media/vnoZnuh4Vsosa9Bsnp/giphy.gif"),
    )),
    GifCategory("onepiece", "ون بيس", "One Piece", listOf(
        CuratedGif("لوفي جير 5", "https://media.giphy.com/media/WmkqburJqXziM/giphy.gif"),
        CuratedGif("لوفي يضحك", "https://media.giphy.com/media/9wPdkThJtbAwo/giphy.gif"),
        CuratedGif("زورو قاطع السيوف", "https://media.giphy.com/media/4OV1bHavuPPtm/giphy.gif"),
        CuratedGif("زورو تائه", "https://media.giphy.com/media/9az09tlYyYNfq/giphy.gif"),
        CuratedGif("سانجي ديابل جامب", "https://media.giphy.com/media/DMvXFFMFH252w/giphy.gif"),
        CuratedGif("شانكس الهاكي", "https://media.giphy.com/media/blas9RgQBAl1K/giphy.gif"),
        CuratedGif("تشوبر خجول", "https://media.giphy.com/media/13Uqp5IGFpmDle/giphy.gif"),
    )),
    GifCategory("naruto", "ناروتو", "Naruto", listOf(
        CuratedGif("ناروتو راسينجان", "https://media.giphy.com/media/Do5GRTYRIhSFy/giphy.gif"),
        CuratedGif("ناروتو بطور الناسك", "https://media.giphy.com/media/JRlqKEzTDKci5JPcaL/giphy.gif"),
        CuratedGif("ساسكي تشيدوري", "https://media.giphy.com/media/11TzKk84rRjXlm/giphy.gif"),
        CuratedGif("إيتاشي الشارينغان", "https://media.giphy.com/media/CchzkJJ6UrQmQ/giphy.gif"),
        CuratedGif("مادارا أوتشيها", "https://media.giphy.com/media/b7Uq708fc78M8/giphy.gif"),
        CuratedGif("كاكاشي شيدوري", "https://media.giphy.com/media/kHYWTCigdEKK4/giphy.gif"),
        CuratedGif("بين شينرا تينسي", "https://media.giphy.com/media/Tz9DN5ftHBeQ8/giphy.gif"),
    )),
    GifCategory("aot", "هجوم العمالقة", "Attack on Titan", listOf(
        CuratedGif("ليفاي أكرمان هجوم", "https://media.giphy.com/media/3o7btQ8jDTPGDpgc6I/giphy.gif"),
        CuratedGif("إيرين تاتاكاي", "https://media.giphy.com/media/kgo9KtvX2dCVudr645/giphy.gif"),
        CuratedGif("إيرين العملاق المهاجم", "https://media.giphy.com/media/tliTHRY616x7u/giphy.gif"),
        CuratedGif("ميكاسا الحماية", "https://media.giphy.com/media/12m3hw90ermjy6/giphy.gif"),
    )),
    GifCategory("demonslayer", "قاتل الشياطين", "Demon Slayer", listOf(
        CuratedGif("تانجيرو تنفس الماء", "https://media.giphy.com/media/dyjrpqaUVqCELGuQVr/giphy.gif"),
        CuratedGif("تانجيرو رقصة إله النار", "https://media.giphy.com/media/jh7F73wOtnKliQXbRT/giphy.gif"),
        CuratedGif("نيزوكو تركض", "https://media.giphy.com/media/W3a0zO282s57jEg5I5/giphy.gif"),
        CuratedGif("رينغوكو أشعل قلبك", "https://media.giphy.com/media/2ya7xLyEytO4uK0pnW/giphy.gif"),
        CuratedGif("زينيتسو تنفس الرعد", "https://media.giphy.com/media/fTN0SCqoTH5AOYZ29W/giphy.gif"),
    )),
    GifCategory("anya_cute", "كاوائي وآنيا", "Kawaii & Anya", listOf(
        CuratedGif("آنيا ابتسامة هيه", "https://media.giphy.com/media/FWAcpJsFT9mVRv0e7a/giphy.gif"),
        CuratedGif("آنيا واكو واكو", "https://media.giphy.com/media/zZC2AqB84z7xe/giphy.gif"),
        CuratedGif("آنيا تبكي صدمة", "https://media.giphy.com/media/NuiEoMDmstN0J2VMSo/giphy.gif"),
        CuratedGif("قطة أنمي كاوائي", "https://media.giphy.com/media/uw0KqTWZSm8gg/giphy.gif"),
    )),
    GifCategory("dbz_hunter", "سايان وهنتر", "Saiyan & Hunter", listOf(
        CuratedGif("غوكو الغريزة الفائقة", "https://media.giphy.com/media/97HzebmSgpaHC/giphy.gif"),
        CuratedGif("فيجيتا كبرياء السايان", "https://media.giphy.com/media/thZQWK50oFOCY/giphy.gif"),
        CuratedGif("كيلوا سرعة البرق", "https://media.giphy.com/media/8DTnuPhxv0m4w/giphy.gif"),
        CuratedGif("غون الحجر ورقة مقص", "https://media.giphy.com/media/Y4gtaaRlLXjLg6MUEg/giphy.gif"),
        CuratedGif("سايتاما لكمة جادة", "https://media.giphy.com/media/yo3TC0yeHd53G/giphy.gif"),
    )),
)

/** Offline search across all categories (titles are Arabic, as on the web). */
fun searchGifs(query: String): List<CuratedGif> {
    val q = query.trim()
    if (q.isEmpty()) return emptyList()
    return GIF_CATEGORIES.flatMap { it.items }.distinctBy { it.url }.filter { it.title.contains(q, ignoreCase = true) }
}
