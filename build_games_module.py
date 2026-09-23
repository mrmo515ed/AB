#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generate anime_black_games_code.js and inject into index.html
"""

import sys
import re

games_js = r'''
/* =========================================================================
   ANIME BLACK GAMES — ANIME HUNTER (ACTION RUNNER + COMBAT + PROGRESSION)
   ========================================================================= */

window.ANIME_BLACK_GAMES_VERSION = "1.0.0";

// --- Game Sound Synthesizer ---
window.gameSnd = function(type) {
  if (!window.S || !window.S.game || !window.S.game.settings || !window.S.game.settings.sound) return;
  try {
    const ctx = window._audioCtx || (window._audioCtx = new (window.AudioContext || window.webkitAudioContext)());
    if (ctx.state === 'suspended') ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    const t = ctx.currentTime;

    if (type === 'slash') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(440, t);
      osc.frequency.exponentialRampToValueAtTime(120, t + 0.12);
      gain.gain.setValueAtTime(0.3, t);
      gain.gain.linearRampToValueAtTime(0.01, t + 0.12);
      osc.start(t);
      osc.stop(t + 0.13);
    } else if (type === 'hit') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(180, t);
      osc.frequency.exponentialRampToValueAtTime(60, t + 0.15);
      gain.gain.setValueAtTime(0.4, t);
      gain.gain.linearRampToValueAtTime(0.01, t + 0.15);
      osc.start(t);
      osc.stop(t + 0.16);
    } else if (type === 'coin') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(987.77, t);
      osc.frequency.setValueAtTime(1318.51, t + 0.08);
      gain.gain.setValueAtTime(0.2, t);
      gain.gain.linearRampToValueAtTime(0.01, t + 0.2);
      osc.start(t);
      osc.stop(t + 0.22);
    } else if (type === 'jump') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, t);
      osc.frequency.exponentialRampToValueAtTime(660, t + 0.18);
      gain.gain.setValueAtTime(0.25, t);
      gain.gain.linearRampToValueAtTime(0.01, t + 0.18);
      osc.start(t);
      osc.stop(t + 0.19);
    } else if (type === 'transform') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, t);
      osc.frequency.linearRampToValueAtTime(880, t + 0.4);
      gain.gain.setValueAtTime(0.4, t);
      gain.gain.linearRampToValueAtTime(0.01, t + 0.45);
      osc.start(t);
      osc.stop(t + 0.46);
    } else if (type === 'boss_warning') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, t);
      osc.frequency.setValueAtTime(280, t + 0.15);
      gain.gain.setValueAtTime(0.5, t);
      gain.gain.linearRampToValueAtTime(0.01, t + 0.35);
      osc.start(t);
      osc.stop(t + 0.36);
    } else if (type === 'victory') {
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g);
        g.connect(ctx.destination);
        o.frequency.setValueAtTime(freq, t + i * 0.1);
        g.gain.setValueAtTime(0.3, t + i * 0.1);
        g.gain.linearRampToValueAtTime(0.01, t + i * 0.1 + 0.25);
        o.start(t + i * 0.1);
        o.stop(t + i * 0.1 + 0.26);
      });
    }
  } catch(e){}
};

// --- Game State Initialization & Energy System ---
window.ensureGameState = function() {
  if (!window.S) return;
  const now = Date.now();
  
  if (!S.game) {
    S.game = {
      profile: {
        hunterLevel: 1,
        hunterXp: 0,
        hunterXpNext: 100,
        coins: (S.coins != null ? S.coins : 500),
        gems: 25,
        energy: 50,
        maxEnergy: 50,
        lastEnergyUpdate: now,
        highScore: 0,
        bestDistance: 0,
        totalKills: 0,
        bossesDefeated: 0,
        totalMatches: 0,
        totalWins: 0,
        currentRank: "E-Rank Hunter",
        equippedCharacterId: "c_ren",
        equippedStageId: "s_forest",
        dailyStreak: 1,
        lastDailyClaim: 0,
        lastReward: "مكافأة الانضمام لأكاديمية الصيادين (500 عملة + 25 جوهرة)",
        isBanned: false
      },
      characters: [
        {
          id: "c_ren",
          name: "رين — ظل النينجا",
          en: "Shadow Ninja Ren",
          rarity: "Common",
          stars: 1,
          level: 1,
          attack: 120,
          defense: 80,
          speed: 110,
          critical: 5,
          hp: 1000,
          energy: 100,
          skillName: "عاصفة الشوريكين الظلية",
          skillPower: 250,
          specialName: "تقنية الاستنساخ الشامل",
          specialPower: 600,
          transformationTier: 0,
          unlocked: true,
          color: "#00A3FF",
          icon: "zap",
          desc: "نينجا سريع وخفيف الحركة يتفادى العوائق ويضرب بدقة خاطفة."
        },
        {
          id: "c_kaito",
          name: "كايتو — سيف اللهب",
          en: "Flame Swordsman Kaito",
          rarity: "Rare",
          stars: 2,
          level: 1,
          attack: 165,
          defense: 95,
          speed: 105,
          critical: 8,
          hp: 1250,
          energy: 110,
          skillName: "اندفاع التنين الناري",
          skillPower: 360,
          specialName: "انفجار الجحيم المستعر",
          specialPower: 850,
          transformationTier: 0,
          unlocked: false,
          unlockCostCoins: 2500,
          color: "#EF4444",
          icon: "flame",
          desc: "ساموراي متمرس يستخدم ضربات اللهب الحارقة لإبادة أفواج الأعداء."
        },
        {
          id: "c_luna",
          name: "لونا — فالكيري الفراغ",
          en: "Void Valkyrie Luna",
          rarity: "Epic",
          stars: 3,
          level: 1,
          attack: 220,
          defense: 125,
          speed: 125,
          critical: 12,
          hp: 1550,
          energy: 130,
          skillName: "وميض الأبعاد الفضية",
          skillPower: 500,
          specialName: "حقل الفراغ المطلق",
          specialPower: 1150,
          transformationTier: 0,
          unlocked: false,
          unlockCostGems: 150,
          color: "#8B5CF6",
          icon: "sparkles",
          desc: "محاربة قادمة من أبعاد الفراغ تتحكم في نسيج الزمان وتجذب الغنائم تلقائياً."
        },
        {
          id: "c_ryu",
          name: "ريو — راهب الرعد",
          en: "Thunder Monk Ryu",
          rarity: "Epic",
          stars: 3,
          level: 1,
          attack: 250,
          defense: 135,
          speed: 130,
          critical: 15,
          hp: 1650,
          energy: 140,
          skillName: "قبضة البرق السماوي",
          skillPower: 580,
          specialName: "إعصار الصواعق التسع",
          specialPower: 1400,
          transformationTier: 0,
          unlocked: false,
          unlockCostGems: 250,
          color: "#EAB308",
          icon: "activity",
          desc: "راهب تدرب في قمم الجبال المكهربة، يطلق صواعق تدمر كل ما في طريقه."
        },
        {
          id: "c_akira",
          name: "أكيرا — إمبراطورة التنين",
          en: "Dragon Empress Akira",
          rarity: "Legendary",
          stars: 4,
          level: 1,
          attack: 340,
          defense: 190,
          speed: 145,
          critical: 20,
          hp: 2300,
          energy: 180,
          skillName: "لهيب التنين الأزلي",
          skillPower: 800,
          specialName: "الزئير السماوي الأسطوري",
          specialPower: 2000,
          transformationTier: 0,
          unlocked: false,
          unlockCostGems: 500,
          color: "#EC4899",
          icon: "crown",
          desc: "سليلة التنانين الأسطورية تمتلك هالة مدمرة وضربات كاسحة لا تُصد."
        },
        {
          id: "c_gojo",
          name: "ساكورا — المشعوذة الملعونة",
          en: "Cursed Sorceress Sakura",
          rarity: "Mythic",
          stars: 5,
          level: 1,
          attack: 480,
          defense: 260,
          speed: 165,
          critical: 25,
          hp: 3200,
          energy: 220,
          skillName: "الحاجز اللانهائي المنيع",
          skillPower: 1200,
          specialName: "توسيع المجال: الفراغ اللامحدود",
          specialPower: 3200,
          transformationTier: 0,
          unlocked: false,
          unlockCostGems: 1200,
          color: "#10B981",
          icon: "shield",
          desc: "أقوى مشعوذة في التاريخ، تملك دفاعاً مطلقاً وقدرات تحطيم الأبعاد."
        }
      ],
      stages: [
        {
          id: "s_forest",
          name: "غابة الظلال الملعونة",
          en: "Forest of Shadows",
          difficulty: "عادي · Normal",
          desc: "غابة كئيبة مليئة بأشباح النينجا والشياطين الصغيرة.",
          bgTheme: "forest",
          speed: 1.0,
          bossName: "أكوما — شيطان الظلال",
          bossHp: 1600,
          bossAtk: 45,
          coinsMultiplier: 1.0,
          xpReward: 150,
          unlocked: true,
          color: "#0284C7"
        },
        {
          id: "s_neotokyo",
          name: "سايبر نيو طوكيو",
          en: "Cyber Neo Tokyo",
          difficulty: "صعب · Hard",
          desc: "مدينة سايبربانك مستقبلية بأضواء نيون وروبوتات قاتلة سريعة.",
          bgTheme: "cyber",
          speed: 1.25,
          bossName: "ميكا أوميغا كور (Mecha Omega)",
          bossHp: 3400,
          bossAtk: 85,
          coinsMultiplier: 1.5,
          xpReward: 320,
          unlocked: true,
          color: "#8B5CF6"
        },
        {
          id: "s_abyss",
          name: "هاوية الجحيم المستعر",
          en: "Cursed Abyss",
          difficulty: "خبير · Expert",
          desc: "حمم متدفقة ووحوش نارية عملاقة تتطلب تركيزاً وردود أفعال خاطفة.",
          bgTheme: "lava",
          speed: 1.45,
          bossName: "اللورد فولكانوس (Lord Vulcanus)",
          bossHp: 6800,
          bossAtk: 140,
          coinsMultiplier: 2.2,
          xpReward: 600,
          unlocked: true,
          color: "#EF4444"
        },
        {
          id: "s_peak",
          name: "قمة التنين السماوي",
          en: "Celestial Dragon Peak",
          difficulty: "كابوس · Nightmare",
          desc: "معبد عائم بين السحب والبروق حيث يحكم التنين الأسطوري الأزلي.",
          bgTheme: "sky",
          speed: 1.65,
          bossName: "التنين الإمبراطوري الأزلي (Azure Dragon)",
          bossHp: 12500,
          bossAtk: 220,
          coinsMultiplier: 3.5,
          xpReward: 1200,
          unlocked: true,
          color: "#F59E0B"
        }
      ],
      inventory: [
        { id: "item_spirit_shard", name: "شظايا الأرواح (Spirit Shards)", type: "shards", rarity: "Rare", count: 240, icon: "sparkles", desc: "بلورات طاقة روحية تستخدم لفتح تحولات الشخصيات.", value: 5 },
        { id: "item_dragon_orb", name: "كرات التنين الأسطورية (Dragon Orbs)", type: "collectibles", rarity: "Legendary", count: 3, icon: "crown", desc: "كرات أسطورية مشعة تمنح قوى خارقة عند تجميع 7 منها.", value: 100 },
        { id: "item_cursed_finger", name: "أصابع ملعونة عتيقة (Cursed Relics)", type: "collectibles", rarity: "Epic", count: 4, icon: "flame", desc: "بقايا طاقة ملعونة عتيقة تضاعف هجوم السحر القتالي.", value: 45 },
        { id: "item_demon_core", name: "نوى الشياطين النادرة (Demon Cores)", type: "materials", rarity: "Epic", count: 8, icon: "zap", desc: "نوى مركزية مستخرجة من زعماء المراحل لتطوير النجوم.", value: 30 },
        { id: "item_void_crystal", name: "بلورات الفراغ الأزرق (Void Crystals)", type: "materials", rarity: "Mythic", count: 2, icon: "shield", desc: "أندر بلورات الطاقة الكونية لتحرير التحول النهائي المطلق.", value: 200 },
        { id: "item_chest_rare", name: "صندوق أسلحة ومواد نادر (Rare Chest)", type: "chests", rarity: "Rare", count: 2, icon: "gift", desc: "يحتوي على عملات وجواهر ومواد تطوير مضمونة.", value: 50 },
        { id: "item_chest_epic", name: "صندوق الكنز الملحمي (Epic Chest)", type: "chests", rarity: "Epic", count: 1, icon: "gift", desc: "يحتوي على شظايا شخصيات نادرة وجواهر ومواد تحول.", value: 120 }
      ],
      missions: [
        { id: "m_kills_20", title: "صياد الأشباح", desc: "اقضِ على 20 عدواً في جولة واحدة", progress: 0, target: 20, rewardCoins: 250, rewardXp: 50, claimed: false, type: "daily" },
        { id: "m_dist_2000", title: "المسافر السريع", desc: "اقطع مسافة 2000 متر في أي مرحلة", progress: 0, target: 2000, rewardCoins: 350, rewardXp: 80, claimed: false, type: "daily" },
        { id: "m_combo_15", title: "سيد الكومبو", desc: "حقق كومبو ×15 ضربة متتالية", progress: 0, target: 15, rewardGems: 10, rewardXp: 100, claimed: false, type: "daily" },
        { id: "m_boss_1", title: "قاهر الزعماء", desc: "اهزم زعيماً واحداً على الأقل في أي مرحلة", progress: 0, target: 1, rewardGems: 25, rewardCoins: 500, claimed: false, type: "weekly" },
        { id: "m_trans_3", title: "قوة التحول", desc: "قم بتفعيل التحول 3 مرات أثناء القتال", progress: 0, target: 3, rewardCoins: 400, rewardXp: 120, claimed: false, type: "weekly" }
      ],
      achievements: [
        { id: "ach_first_blood", title: "أول قطرة دم", desc: "اقضِ على أول عدو لك في اللعبة", progress: 1, target: 1, unlocked: true, rewardGems: 5, icon: "swords" },
        { id: "ach_kills_100", title: "مبيد الظلال (100 عدو)", desc: "اقضِ على 100 عدو إجمالاً", progress: 42, target: 100, unlocked: false, rewardGems: 20, icon: "zap" },
        { id: "ach_kills_1000", title: "صياد أسطوري (1,000 عدو)", desc: "اقضِ على 1000 عدو في مسيرتك", progress: 42, target: 1000, unlocked: false, rewardGems: 100, icon: "flame" },
        { id: "ach_first_boss", title: "صائد الزعماء", desc: "اهزم زعيم مرحلة لأول مرة", progress: 1, target: 1, unlocked: true, rewardGems: 30, icon: "crown" },
        { id: "ach_combo_50", title: "إعصار الكومبو الخارق (×50)", desc: "حقق كومبو يصل إلى 50 ضربة", progress: 18, target: 50, unlocked: false, rewardGems: 50, icon: "activity" },
        { id: "ach_dist_50000", title: "عداء الأفق (50,000 متر)", desc: "اقطع مسافة إجمالية 50,000 متر", progress: 8400, target: 50000, unlocked: false, rewardGems: 80, icon: "rocket" },
        { id: "ach_first_trans", title: "تحرير الروح الخارقة", desc: "قم بفتح وتفعيل أول تحول لشخصيتك", progress: 0, target: 1, unlocked: false, rewardGems: 40, icon: "sparkles" }
      ],
      events: [
        {
          id: "ev_weekend_loot",
          title: "عطلة نهاية الأسبوع · غنائم مضاعفة 2X",
          desc: "احصل على ضعف العملات وشظايا الشخصيات وصناديق الكنز في جميع المراحل!",
          status: "active",
          badge: "مضاعف 2X",
          endsIn: "يومين و 14 ساعة",
          color: "linear-gradient(135deg,#EF4444,#F97316)",
          icon: "flame",
          rewardSummary: "عملات ×2 + صناديق نادرة مضاعفة"
        },
        {
          id: "ev_boss_rush",
          title: "تحدي الزعماء المتتالي (Boss Rush Inferno)",
          desc: "واجه 4 زعماء متتاليين بدون توقف مع زيادة الصعوبة بعد كل زعيم!",
          status: "active",
          badge: "تحدي خاص",
          endsIn: "4 أيام",
          color: "linear-gradient(135deg,#8B5CF6,#EC4899)",
          icon: "crown",
          rewardSummary: "صندوق أسطوري + 100 جوهرة"
        },
        {
          id: "ev_dragon_hunt",
          title: "صيد كرات التنين السبعة (Dragon Hunt)",
          desc: "اجمع كرات التنين السبعة من بوابات المراحل لفتح شخصية التنين الأسطوري أكيرا!",
          status: "upcoming",
          badge: "قريباً",
          endsIn: "يبدأ بعد 3 أيام",
          color: "linear-gradient(135deg,#06B6D4,#3B82F6)",
          icon: "sparkles",
          rewardSummary: "شخصية أكيرا الأسطورية مجاناً"
        }
      ],
      dailyRewardsCalendar: [
        { day: 1, type: "coins", amount: 500, label: "500 عملة", icon: "coins", claimed: true },
        { day: 2, type: "energy", amount: 25, label: "+25 طاقة", icon: "zap", claimed: false },
        { day: 3, type: "gems", amount: 30, label: "30 جوهرة", icon: "sparkles", claimed: false },
        { day: 4, type: "shards", amount: 150, label: "150 شظية روح", icon: "flame", claimed: false },
        { day: 5, type: "chest", amount: 1, label: "صندوق نادر", icon: "gift", claimed: false },
        { day: 6, type: "materials", amount: 5, label: "5 نوى شيطانية", icon: "crown", claimed: false },
        { day: 7, type: "grand", amount: 1, label: "صندوق أسطوري + 100 جوهرة", icon: "trophy", claimed: false }
      ],
      history: [
        { id: "m_1", stage: "غابة الظلال الملعونة", char: "رين — ظل النينجا", score: 14520, distance: 1840, kills: 24, combo: 18, bossDefeated: true, coinsEarned: 320, gemsEarned: 5, at: now - 7200000, valid: true }
      ],
      leaderboard: [
        { rank: 1, name: "كايتو_الساموراي", avatar: "a1", score: 148500, distance: 8920, kills: 142, level: 24, title: "Grandmaster Hunter" },
        { rank: 2, name: "ساكورا_الملعونة", avatar: "a3", score: 124200, distance: 7450, kills: 118, level: 21, title: "Elite Hunter" },
        { rank: 3, name: "شادو_رين_99", avatar: "a2", score: 98400, distance: 6100, kills: 95, level: 18, title: "A-Rank Hunter" },
        { rank: 4, name: "دراجون_ماستر", avatar: "a4", score: 81300, distance: 5200, kills: 80, level: 16, title: "B-Rank Hunter" },
        { rank: 5, name: "أوتاكو_البرق", avatar: "a5", score: 67900, distance: 4400, kills: 64, level: 14, title: "B-Rank Hunter" }
      ],
      settings: {
        sound: true,
        music: true,
        sfx: true,
        vibration: true,
        quality: "high",
        sensitivity: 1.0,
        autoPause: true
      },
      antiCheatLogs: [],
      adminLogs: []
    };
  }

  // Energy regeneration calculation (1 energy per 8 minutes = 480,000 ms)
  const p = S.game.profile;
  p.maxEnergy = p.maxEnergy || 50;
  if (p.energy < p.maxEnergy) {
    const elapsed = now - (p.lastEnergyUpdate || now);
    const regenInterval = 8 * 60 * 1000;
    const gained = Math.floor(elapsed / regenInterval);
    if (gained > 0) {
      p.energy = Math.min(p.maxEnergy, p.energy + gained);
      p.lastEnergyUpdate = now - (elapsed % regenInterval);
    }
  } else {
    p.lastEnergyUpdate = now;
  }
};

window.saveGame = function() {
  if (!window.S || !window.S.game) return;
  save();
  // Cloud sync to Firestore game_profiles
  try {
    if (window.db && window.doc && window.setDoc && window.auth && window.auth.currentUser) {
      const uid = window.auth.currentUser.uid;
      const ref = window.doc(window.db, "game_profiles", uid);
      window.setDoc(ref, {
        profile: S.game.profile,
        inventory: S.game.inventory,
        characters: S.game.characters.map(c => ({ id: c.id, level: c.level, stars: c.stars, transformationTier: c.transformationTier, unlocked: c.unlocked })),
        updatedAt: Date.now()
      }, { merge: true }).catch(err => console.warn("Game Firestore sync note:", err));
    }
  } catch(e){}
};

// Anti-Cheat Match Verification
window.validateGameMatch = function(matchData) {
  if (!matchData) return { valid: false, reason: "بيانات الجولة فارغة" };
  const durationSec = Math.max(1, (matchData.endTime - matchData.startTime) / 1000);
  
  // Rule 1: Speed validation (max legitimate speed is 40 m/s)
  const avgSpeed = matchData.distance / durationSec;
  if (avgSpeed > 45) {
    recordAntiCheatLog("سرعة جري غير منطقية", `السرعة: ${avgSpeed.toFixed(1)} م/ث`);
    return { valid: false, reason: "تم رصد سرعة غير متوافقة مع قوانين اللعبة" };
  }

  // Rule 2: Kills per second limit
  if (matchData.kills / durationSec > 3.5) {
    recordAntiCheatLog("معدل قتل مريب", `${matchData.kills} قتلة خلال ${durationSec} ثانية`);
    return { valid: false, reason: "معدل القضاء على الأعداء يتجاوز الحد المسموح" };
  }

  // Rule 3: Score vs Distance + Kills ratio
  const maxExpectedScore = (matchData.distance * 15) + (matchData.kills * 2000) + (matchData.bossDefeated ? 50000 : 0);
  if (matchData.score > maxExpectedScore * 1.6) {
    recordAntiCheatLog("سكور متضخم بشكل مريب", `السكور: ${matchData.score}, المتوقع الأقصى: ${maxExpectedScore}`);
    return { valid: false, reason: "مجموع النقاط غير متطابق مع الإحصائيات المسجلة" };
  }

  return { valid: true };
};

function recordAntiCheatLog(reason, details) {
  if (!S.game) return;
  const entry = {
    id: "ac_" + Date.now(),
    uid: (S.me && (S.me.uid || S.me.id)) || "anon",
    name: (S.me && S.me.name) || "لاعب",
    reason: reason,
    details: details,
    at: Date.now()
  };
  S.game.antiCheatLogs = S.game.antiCheatLogs || [];
  S.game.antiCheatLogs.unshift(entry);
  if (S.game.antiCheatLogs.length > 50) S.game.antiCheatLogs.pop();
  try {
    if (window.db && window.doc && window.setDoc) {
      window.setDoc(window.doc(window.db, "game_anti_cheat_logs", entry.id), entry).catch(e=>{});
    }
  } catch(e){}
}

function recordAdminGameAudit(action, target, oldVal, newVal) {
  if (!S.game) return;
  const adminEmail = (S.me && S.me.email) || "m774545471@gmail.com";
  const log = {
    id: "glog_" + Date.now(),
    admin: adminEmail,
    action: action,
    target: target,
    oldVal: oldVal,
    newVal: newVal,
    at: Date.now()
  };
  S.game.adminLogs = S.game.adminLogs || [];
  S.game.adminLogs.unshift(log);
  if (S.game.adminLogs.length > 100) S.game.adminLogs.pop();
  try {
    if (window.db && window.doc && window.setDoc) {
      window.setDoc(window.doc(window.db, "game_admin_logs", log.id), log).catch(e=>{});
    }
  } catch(e){}
}
'''

def main():
    print("Writing games core module...")
    with open("anime_black_games_module.js", "w", encoding="utf-8") as f:
        f.write(games_js)
    print("Wrote anime_black_games_module.js successfully.")

if __name__ == "__main__":
    main()
