/* =========================================================================
   ANIME BLACK GAMES — PART 3: USER PAGES (22 COMPLETE SCREENS)
   ========================================================================= */

window.PAGES = window.PAGES || {};

// 1. Games Dashboard & Home
PAGES.gamesHome = function() {
  ensureGameState();
  const p = S.game.profile;
  const activeChar = S.game.characters.find(c => c.id === p.equippedCharacterId) || S.game.characters[0];
  const activeStage = S.game.stages.find(s => s.id === p.equippedStageId) || S.game.stages[0];

  setHdr("🎮 ألعاب واربح · Anime Hunter", `
    <button class="iconbtn" onclick="go('gameSettings')">${I("gear","i s")}</button>
    <button class="iconbtn" onclick="go('gameHelp')">${I("help","i s")}</button>
    <button class="iconbtn" onclick="go('more')">${I("back","i s")}</button>
  `);
  setNav("more");

  return `
    <div class="pad col" style="gap:16px;padding-bottom:90px">
      <!-- Hunter Hero Profile Banner -->
      <div class="card" style="background:linear-gradient(135deg,#1E1B4B 0%,#2E1065 50%,#0F172A 100%);border:1px solid rgba(139,92,246,0.35);padding:18px;border-radius:24px;position:relative;overflow:hidden">
        <div style="position:absolute;top:-40px;left:-40px;width:150px;height:150px;background:radial-gradient(circle,rgba(236,72,153,0.3) 0%,transparent 70%)"></div>
        
        <div class="rowb" style="margin-bottom:12px;position:relative;z-index:2">
          <div class="row" style="gap:10px">
            <span class="badge" style="background:linear-gradient(135deg,#EC4899,#8B5CF6);color:#fff;font-weight:900;padding:4px 10px;border-radius:12px">المستوى ${p.hunterLevel}</span>
            <span class="badge b-cyan mono">${p.currentRank}</span>
          </div>
          <button class="btn btn-xs btn-outline" style="border-radius:10px" onclick="go('gameProfile')">${I("user","i s")} ملف الصياد</button>
        </div>

        <div class="row" style="gap:14px;align-items:center;position:relative;z-index:2">
          <div style="width:64px;height:64px;border-radius:20px;background:${activeChar.color || '#00A3FF'};display:flex;align-items:center;justify-content:center;box-shadow:0 8px 20px rgba(0,0,0,0.4);border:2px solid rgba(255,255,255,0.4)">
            <span style="font-size:32px">${activeChar.icon === 'flame' ? '🔥' : activeChar.icon === 'zap' ? '⚡' : activeChar.icon === 'crown' ? '👑' : '⚔️'}</span>
          </div>
          <div class="g1" style="min-width:0;text-align:right">
            <div class="bb md" style="color:#fff;font-size:18px">${esc(activeChar.name)}</div>
            <div class="row" style="gap:8px;margin-top:4px">
              <span class="badge b-gold" style="font-size:10px">⭐ ${activeChar.stars} نجوم</span>
              <span class="badge b-emerald" style="font-size:10px">المرحلة: ${esc(activeStage.name.split('(')[0])}</span>
            </div>
          </div>
        </div>

        <!-- Hunter Currencies & Energy -->
        <div class="grid grid-3" style="margin-top:16px;gap:8px;position:relative;z-index:2">
          <div class="card2" style="padding:10px;text-align:center;background:rgba(0,0,0,0.35);border-radius:14px">
            <div class="tiny mut">🪙 عملات</div>
            <div class="b md" style="color:#FBBF24">${nfmt(p.coins)}</div>
          </div>
          <div class="card2" style="padding:10px;text-align:center;background:rgba(0,0,0,0.35);border-radius:14px">
            <div class="tiny mut">💎 جواهر</div>
            <div class="b md" style="color:#67E8F9">${nfmt(p.gems)}</div>
          </div>
          <div class="card2" style="padding:10px;text-align:center;background:rgba(0,0,0,0.35);border-radius:14px">
            <div class="tiny mut">⚡ طاقة القتال</div>
            <div class="b md" style="color:#34D399">${p.energy}/${p.maxEnergy}</div>
          </div>
        </div>

        <!-- Big Play Action Button -->
        <button class="btn btn-primary" style="width:100%;margin-top:16px;padding:14px;border-radius:16px;background:linear-gradient(135deg,#00A3FF 0%,#8B5CF6 50%,#EC4899 100%);font-size:18px;font-weight:900;box-shadow:0 8px 30px rgba(0,163,255,0.4);border:none;gap:10px" onclick="go('gameLobby')">
          <span>⚔️ انطلق للقتال والجري الآن!</span>
        </button>
      </div>

      <!-- Quick Action Navigation Hub (Grid) -->
      <div class="grid grid-4" style="gap:10px">
        <div class="card2 col" style="padding:12px;align-items:center;text-align:center;cursor:pointer;border-radius:16px;gap:6px" onclick="go('gameCharacters')">
          <div style="font-size:24px">🥷</div>
          <div class="b sm">الشخصيات</div>
          <div class="tiny mut">${S.game.characters.filter(c=>c.unlocked).length}/${S.game.characters.length}</div>
        </div>
        <div class="card2 col" style="padding:12px;align-items:center;text-align:center;cursor:pointer;border-radius:16px;gap:6px" onclick="go('gameUpgrades')">
          <div style="font-size:24px">⚡</div>
          <div class="b sm">التطوير</div>
          <div class="tiny mut">تعزيز القوة</div>
        </div>
        <div class="card2 col" style="padding:12px;align-items:center;text-align:center;cursor:pointer;border-radius:16px;gap:6px" onclick="go('gameTransformations')">
          <div style="font-size:24px">🔥</div>
          <div class="b sm">التحولات</div>
          <div class="tiny mut">قوى خارقة</div>
        </div>
        <div class="card2 col" style="padding:12px;align-items:center;text-align:center;cursor:pointer;border-radius:16px;gap:6px" onclick="go('gameInventory')">
          <div style="font-size:24px">🎒</div>
          <div class="b sm">المخزون</div>
          <div class="tiny mut">${S.game.inventory.reduce((a,b)=>a+b.count,0)} عنصر</div>
        </div>
        <div class="card2 col" style="padding:12px;align-items:center;text-align:center;cursor:pointer;border-radius:16px;gap:6px" onclick="go('gameChests')">
          <div style="font-size:24px">🎁</div>
          <div class="b sm">الصناديق</div>
          <div class="tiny mut">فتح الغنائم</div>
        </div>
        <div class="card2 col" style="padding:12px;align-items:center;text-align:center;cursor:pointer;border-radius:16px;gap:6px" onclick="go('gameMissions')">
          <div style="font-size:24px">📜</div>
          <div class="b sm">المهام</div>
          <div class="tiny mut">مكافآت يومية</div>
        </div>
        <div class="card2 col" style="padding:12px;align-items:center;text-align:center;cursor:pointer;border-radius:16px;gap:6px" onclick="go('gameLeaderboard')">
          <div style="font-size:24px">🏆</div>
          <div class="b sm">المتصدرين</div>
          <div class="tiny mut">الترتيب العالمي</div>
        </div>
        <div class="card2 col" style="padding:12px;align-items:center;text-align:center;cursor:pointer;border-radius:16px;gap:6px" onclick="go('gameShop')">
          <div style="font-size:24px">🛒</div>
          <div class="b sm">متجر اللعبة</div>
          <div class="tiny mut">عروض خاصة</div>
        </div>
      </div>

      <!-- Active Events Banner -->
      <div class="secttl">
        <h3>🔥 الفعاليات والتحديات النشطة</h3>
        <button class="btn btn-xs btn-outline" onclick="go('gameEvents')">عرض الكل</button>
      </div>
      <div class="col" style="gap:10px">
        ${S.game.events.map(ev => `
          <div class="card" style="padding:14px;border-radius:18px;cursor:pointer;background:linear-gradient(135deg,rgba(30,27,75,0.8),rgba(15,23,42,0.9));border:1px solid rgba(255,255,255,0.1)" onclick="go('gameEventDetail', {eventId: '${ev.id}'})">
            <div class="rowb">
              <span class="badge" style="background:${ev.color};color:#fff;font-weight:800">${ev.badge}</span>
              <span class="tiny mut">ينتهي خلال: ${ev.endsIn}</span>
            </div>
            <div class="bb md" style="color:#fff;margin-top:6px">${esc(ev.title)}</div>
            <div class="tiny mut" style="margin-top:3px">${esc(ev.desc)}</div>
            <div class="rowb" style="margin-top:10px;padding-top:8px;border-top:1px solid rgba(255,255,255,0.08)">
              <span class="tiny" style="color:#FBBF24">🎁 المكافأة: ${esc(ev.rewardSummary)}</span>
              <span class="btn btn-xs btn-primary" style="border-radius:8px">دخول التحدي</span>
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Quick Shortcuts to Rewards & History -->
      <div class="grid grid-2" style="gap:10px;margin-top:6px">
        <button class="card2 row" style="padding:14px;align-items:center;gap:10px;border-radius:16px;cursor:pointer" onclick="go('gameDailyRewards')">
          <span style="font-size:24px">📅</span>
          <div style="text-align:right">
            <div class="b sm">تسجيل الدخول اليومي</div>
            <div class="tiny mut">استلم هدايا الأسبوع</div>
          </div>
        </button>
        <button class="card2 row" style="padding:14px;align-items:center;gap:10px;border-radius:16px;cursor:pointer" onclick="go('gameHistory')">
          <span style="font-size:24px">📜</span>
          <div style="text-align:right">
            <div class="b sm">سجل الجولات السابقة</div>
            <div class="tiny mut">إحصائيات المعارك</div>
          </div>
        </button>
      </div>

      ${isPlatformAdmin() ? `
        <!-- Admin Management Entry Point -->
        <div class="card" style="padding:14px;border-radius:18px;background:linear-gradient(135deg,#7F1D1D,#3B0764);border:1px solid rgba(239,68,68,0.4);margin-top:10px;cursor:pointer" onclick="go('gameAdmin')">
          <div class="rowb">
            <div class="row" style="gap:10px;align-items:center">
              <span style="font-size:24px">🛡️</span>
              <div style="text-align:right">
                <div class="bb md" style="color:#fff">لوحة تحكم وإدارة ألعاب واربح</div>
                <div class="tiny mut" style="color:rgba(255,255,255,0.8)">إدارة المراحل، الشخصيات، الأعداء، نسب الإسقاط، ومكافحة الغش</div>
              </div>
            </div>
            <span class="badge b-gold b">ADMIN</span>
          </div>
        </div>
      ` : ''}
    </div>
  `;
};

// 2. Game Lobby & Match Preparation
PAGES.gameLobby = function() {
  ensureGameState();
  const p = S.game.profile;
  const activeChar = S.game.characters.find(c => c.id === p.equippedCharacterId) || S.game.characters[0];
  const activeStage = S.game.stages.find(s => s.id === p.equippedStageId) || S.game.stages[0];

  setHdr("⚔️ تجهيز المعركة · Battle Lobby", `
    <button class="iconbtn" onclick="go('gamesHome')">${I("back","i s")}</button>
  `);
  setNav("more");

  return `
    <div class="pad col" style="gap:16px;padding-bottom:90px">
      <!-- Energy Check Header -->
      <div class="card2 rowb" style="padding:12px 16px;border-radius:16px;background:rgba(16,185,129,0.12);border:1px solid rgba(16,185,129,0.3)">
        <div class="row" style="gap:8px;align-items:center">
          <span style="font-size:20px">⚡</span>
          <span class="b sm">طاقة القتال المتاحة:</span>
          <span class="badge b-emerald mono">${p.energy}/50</span>
        </div>
        <span class="tiny mut">تكلفة الدخول: 5 طاقة</span>
      </div>

      <!-- Character Card -->
      <div class="secttl"><h3>1. الشخصية المختارة</h3> <button class="btn btn-xs btn-outline" onclick="go('gameCharacters')">تغيير</button></div>
      <div class="card" style="padding:16px;border-radius:20px;background:linear-gradient(135deg,#1E1B4B,#0F172A);border:1px solid rgba(255,255,255,0.15)">
        <div class="row" style="gap:14px;align-items:center">
          <div style="width:56px;height:56px;border-radius:16px;background:${activeChar.color};display:flex;align-items:center;justify-content:center;font-size:28px;border:2px solid rgba(255,255,255,0.3)">
            🥷
          </div>
          <div class="g1" style="text-align:right">
            <div class="bb md" style="color:#fff">${esc(activeChar.name)}</div>
            <div class="row" style="gap:6px;margin-top:4px">
              <span class="badge b-gold">المستوى ${activeChar.level}</span>
              <span class="badge b-purple">هجوم: ${activeChar.attack}</span>
              <span class="badge b-cyan">دفاع: ${activeChar.defense}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Stage Selection -->
      <div class="secttl"><h3>2. اختر المرحلة والزعيم</h3></div>
      <div class="col" style="gap:10px">
        ${S.game.stages.map(st => `
          <div class="card" style="padding:14px;border-radius:18px;cursor:pointer;border:${st.id === activeStage.id ? '2px solid #00A3FF' : '1px solid rgba(255,255,255,0.1)'};background:linear-gradient(135deg,rgba(15,23,42,0.9),rgba(30,27,75,0.6))" onclick="S.game.profile.equippedStageId='${st.id}';saveGame();go('gameLobby')">
            <div class="rowb">
              <div class="row" style="gap:8px">
                <span class="badge ${st.id === activeStage.id ? 'b-cyan' : 'b-gray'}">${st.difficulty}</span>
                <span class="bb sm" style="color:#fff">${esc(st.name)}</span>
              </div>
              <span class="badge b-gold">مضاعف العملات ×${st.coinsMultiplier}</span>
            </div>
            <div class="tiny mut" style="margin-top:4px">${esc(st.desc)}</div>
            <div class="rowb" style="margin-top:8px">
              <span class="tiny" style="color:#EF4444">👹 الزعيم: ${esc(st.bossName)} (HP: ${st.bossHp})</span>
              ${st.id === activeStage.id ? '<span class="badge b-emerald">مختارة للقتال ✓</span>' : '<span class="btn btn-xs btn-outline">اختيار</span>'}
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Boosts / Consumables -->
      <div class="secttl"><h3>3. عناصر التعزيز (اختياري)</h3></div>
      <div class="grid grid-3" style="gap:8px">
        <div class="card2 col" style="padding:10px;text-align:center;border-radius:14px;border:1px solid rgba(255,255,255,0.1)">
          <div style="font-size:20px">🧲</div>
          <div class="b xs">مغناطيس الغنائم</div>
          <div class="tiny mut">جذب تلقائي</div>
        </div>
        <div class="card2 col" style="padding:10px;text-align:center;border-radius:14px;border:1px solid rgba(255,255,255,0.1)">
          <div style="font-size:20px">🛡️</div>
          <div class="b xs">درع الحماية</div>
          <div class="tiny mut">صد ضربة واحدة</div>
        </div>
        <div class="card2 col" style="padding:10px;text-align:center;border-radius:14px;border:1px solid rgba(255,255,255,0.1)">
          <div style="font-size:20px">✨</div>
          <div class="b xs">نقاط مضاعفة 2X</div>
          <div class="tiny mut">سكور أعلى</div>
        </div>
      </div>

      <!-- Start Button -->
      <button class="btn btn-primary" style="width:100%;margin-top:10px;padding:16px;border-radius:18px;font-size:18px;font-weight:900;background:linear-gradient(135deg,#00A3FF,#EC4899);border:none;box-shadow:0 8px 25px rgba(0,163,255,0.4)" onclick="startActualGame()">
        ⚔️ بدء المعركة الآن (-5 طاقة)
      </button>
    </div>
  `;
};

window.startActualGame = function() {
  ensureGameState();
  const p = S.game.profile;
  if (p.energy < 5) {
    toast("عذراً، لا تملك طاقة كافية للقتال (تحتاج 5 طاقة)", "err");
    return;
  }
  p.energy -= 5;
  saveGame();
  go('gamePlay');
};

// 3. Active Canvas Game Play
PAGES.gamePlay = function() {
  ensureGameState();
  const p = S.game.profile;
  const activeChar = S.game.characters.find(c => c.id === p.equippedCharacterId) || S.game.characters[0];
  const activeStage = S.game.stages.find(s => s.id === p.equippedStageId) || S.game.stages[0];

  setHdr("⚔️ Anime Hunter", `
    <button class="iconbtn" onclick="pauseActiveGame()">${I("pause","i s")}</button>
  `);
  setNav("more");

  setTimeout(() => {
    const canvas = document.getElementById("hunterCanvas");
    if (!canvas) return;

    if (window._currentHunterGame) {
      window._currentHunterGame.destroy();
    }

    window._currentHunterGame = new AnimeHunterEngine(canvas, {
      character: activeChar,
      stage: activeStage,
      onGameOver: (res) => {
        handleGameFinished(res, false);
      },
      onVictory: (res) => {
        handleGameFinished(res, true);
      }
    });

    window._currentHunterGame.start();
  }, 100);

  return `
    <div style="position:relative;width:100%;height:calc(100vh - 120px);max-width:480px;margin:0 auto;overflow:hidden;background:#030712;display:flex;flex-direction:column">
      <!-- HUD Top Bar -->
      <div style="position:absolute;top:10px;left:10px;right:10px;z-index:10;display:flex;justify-content:space-between;align-items:center;background:rgba(0,0,0,0.65);backdrop-filter:blur(8px);padding:8px 14px;border-radius:16px;border:1px solid rgba(255,255,255,0.15)">
        <div class="row" style="gap:10px">
          <span class="badge b-gold mono" style="font-weight:900" id="hudCoins">🪙 0</span>
          <span class="badge b-cyan mono" style="font-weight:900" id="hudGems">💎 0</span>
        </div>
        <div class="row" style="gap:10px">
          <span class="badge b-purple mono" style="font-weight:900" id="hudDistance">0 m</span>
          <span class="badge b-emerald mono" style="font-weight:900" id="hudScore">0 PTS</span>
        </div>
      </div>

      <!-- Main Canvas Container -->
      <div style="flex:1;position:relative;width:100%;height:100%">
        <canvas id="hunterCanvas" style="width:100%;height:100%;display:block"></canvas>
      </div>

      <!-- Mobile Touch Controls Bar -->
      <div style="position:absolute;bottom:12px;left:10px;right:10px;z-index:10;display:flex;justify-content:space-between;align-items:center;pointer-events:auto">
        <!-- Left Movement Controls -->
        <div class="row" style="gap:8px">
          <button class="btn" style="width:52px;height:52px;border-radius:18px;background:rgba(30,41,59,0.85);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,0.2);color:#fff;font-size:22px;display:flex;align-items:center;justify-content:center" onclick="if(window._currentHunterGame) window._currentHunterGame.moveLane(-1)">⬅️</button>
          <button class="btn" style="width:52px;height:52px;border-radius:18px;background:rgba(30,41,59,0.85);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,0.2);color:#fff;font-size:22px;display:flex;align-items:center;justify-content:center" onclick="if(window._currentHunterGame) window._currentHunterGame.moveLane(1)">➡️</button>
        </div>

        <!-- Center Actions (Jump / Slide) -->
        <div class="row" style="gap:8px">
          <button class="btn" style="width:52px;height:52px;border-radius:18px;background:rgba(234,179,8,0.85);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,0.3);color:#fff;font-size:20px;font-weight:900" onclick="if(window._currentHunterGame) window._currentHunterGame.jump()">⬆️</button>
          <button class="btn" style="width:52px;height:52px;border-radius:18px;background:rgba(168,85,247,0.85);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,0.3);color:#fff;font-size:20px;font-weight:900" onclick="if(window._currentHunterGame) window._currentHunterGame.slide()">⬇️</button>
        </div>

        <!-- Right Combat Controls (Attack / Skill / Transform) -->
        <div class="row" style="gap:8px">
          <button class="btn" style="width:52px;height:52px;border-radius:18px;background:rgba(59,130,246,0.85);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,0.3);color:#fff;font-size:22px;font-weight:900" onclick="if(window._currentHunterGame) window._currentHunterGame.useSkill()">⚡</button>
          <button class="btn" style="width:58px;height:58px;border-radius:20px;background:linear-gradient(135deg,#EF4444,#EC4899);border:2px solid #fff;color:#fff;font-size:26px;font-weight:900;box-shadow:0 4px 18px rgba(239,68,68,0.6)" onclick="if(window._currentHunterGame) window._currentHunterGame.attack()">⚔️</button>
        </div>
      </div>
    </div>
  `;
};

window.pauseActiveGame = function() {
  if (window._currentHunterGame) {
    window._currentHunterGame.paused = !window._currentHunterGame.paused;
    toast(window._currentHunterGame.paused ? "تم إيقاف اللعبة مؤقتاً" : "استئناف المعركة", "info");
  }
};

window.handleGameFinished = function(result, isVictory) {
  ensureGameState();
  const validCheck = validateGameMatch(result);
  
  if (!validCheck.valid) {
    toast(`تنبيه: ${validCheck.reason}`, "err");
  }

  // Update profile
  const p = S.game.profile;
  p.coins += result.coins || 0;
  p.gems += result.gems || 0;
  p.totalKills += result.kills || 0;
  p.totalMatches += 1;
  if (isVictory) p.totalWins += 1;
  if (result.bossDefeated) p.bossesDefeated += 1;
  p.highScore = Math.max(p.highScore, result.score || 0);
  p.bestDistance = Math.max(p.bestDistance, result.distance || 0);

  // Hunter XP Gain
  const gainedXp = Math.floor((result.distance * 0.1) + (result.kills * 10) + (isVictory ? 300 : 50));
  p.hunterXp += gainedXp;
  if (p.hunterXp >= p.hunterXpNext) {
    p.hunterLevel += 1;
    p.hunterXp -= p.hunterXpNext;
    p.hunterXpNext = Math.floor(p.hunterXpNext * 1.5);
    toast(`🎉 تهانينا! ارتفع مستوى الصياد الخاص بك إلى المستوى ${p.hunterLevel}!`, "ok");
  }

  // Add to match history
  S.game.history.unshift({
    id: "m_" + Date.now(),
    stage: result.stage.name,
    char: result.char.name,
    score: result.score,
    distance: result.distance,
    kills: result.kills,
    combo: result.maxCombo,
    bossDefeated: isVictory,
    coinsEarned: result.coins,
    gemsEarned: result.gems,
    at: Date.now(),
    valid: validCheck.valid
  });
  if (S.game.history.length > 30) S.game.history.pop();

  saveGame();
  go('gameResult', { result: result, isVictory: isVictory });
};

// 4. Game Result Screen with Social Community Sharing
PAGES.gameResult = function(params = {}) {
  const res = params.result || {};
  const isVictory = params.isVictory || false;

  setHdr(isVictory ? "🏆 نصر أسطوري! · Victory" : "💀 انتهت الجولة · Game Over", `
    <button class="iconbtn" onclick="go('gamesHome')">${I("home","i s")}</button>
  `);
  setNav("more");

  return `
    <div class="pad col" style="gap:16px;padding-bottom:90px;text-align:center">
      <!-- Big Result Icon & Header -->
      <div class="card" style="padding:24px 16px;border-radius:24px;background:linear-gradient(135deg,${isVictory ? '#065F46,#047857' : '#7F1D1D,#450A0A'});border:1px solid rgba(255,255,255,0.2)">
        <div style="font-size:54px;line-height:1;margin-bottom:8px">${isVictory ? '👑' : '⚔️'}</div>
        <div class="bb lg" style="color:#fff;font-size:24px">${isVictory ? 'تم سحق الزعيم بنجاح!' : 'قاتلت بشجاعة في الميدان!'}</div>
        <div class="tiny" style="color:rgba(255,255,255,0.85);margin-top:4px">${res.stage ? esc(res.stage.name) : 'المرحلة'}</div>
      </div>

      <!-- Stats Summary Card -->
      <div class="grid grid-2" style="gap:10px">
        <div class="card2 col" style="padding:14px;border-radius:18px;text-align:center">
          <div class="tiny mut">🏆 مجموع النقاط</div>
          <div class="bb md" style="color:#38BDF8">${nfmt(res.score || 0)}</div>
        </div>
        <div class="card2 col" style="padding:14px;border-radius:18px;text-align:center">
          <div class="tiny mut">🏃 المسافة المقطوعة</div>
          <div class="bb md" style="color:#34D399">${nfmt(res.distance || 0)} متر</div>
        </div>
        <div class="card2 col" style="padding:14px;border-radius:18px;text-align:center">
          <div class="tiny mut">⚔️ الأعداء المهزومين</div>
          <div class="bb md" style="color:#EF4444">${res.kills || 0} وحش</div>
        </div>
        <div class="card2 col" style="padding:14px;border-radius:18px;text-align:center">
          <div class="tiny mut">⚡ أقصى كومبو</div>
          <div class="bb md" style="color:#FBBF24">×${res.maxCombo || 0}</div>
        </div>
      </div>

      <!-- Loot Collected Breakdown -->
      <div class="secttl"><h3>🎁 الغنائم والجوائز المكتسبة</h3></div>
      <div class="grid grid-3" style="gap:8px">
        <div class="card2 col" style="padding:10px;text-align:center;border-radius:14px">
          <div style="font-size:20px">🪙</div>
          <div class="b sm" style="color:#FBBF24">+${res.coins || 0}</div>
          <div class="tiny mut">عملات</div>
        </div>
        <div class="card2 col" style="padding:10px;text-align:center;border-radius:14px">
          <div style="font-size:20px">💎</div>
          <div class="b sm" style="color:#67E8F9">+${res.gems || 0}</div>
          <div class="tiny mut">جواهر</div>
        </div>
        <div class="card2 col" style="padding:10px;text-align:center;border-radius:14px">
          <div style="font-size:20px">✨</div>
          <div class="b sm" style="color:#A78BFA">+${res.shards || 0}</div>
          <div class="tiny mut">شظايا أرواح</div>
        </div>
      </div>

      <!-- Social Community Share Button -->
      <button class="btn btn-outline" style="width:100%;padding:14px;border-radius:16px;border:1px solid #00A3FF;color:#00A3FF;font-weight:900;gap:8px;margin-top:6px" onclick="shareGameResultToFeed(${res.score || 0}, ${res.distance || 0}, ${res.kills || 0})">
        ${I("share","i s")} مشاركة الإنجاز في مجتمع أنمي بلاك 🌟
      </button>

      <!-- Action Buttons -->
      <div class="row" style="gap:10px">
        <button class="btn btn-primary g1" style="padding:14px;border-radius:16px;font-weight:900" onclick="go('gameLobby')">
          ⚔️ العب مرة أخرى
        </button>
        <button class="btn btn-outline g1" style="padding:14px;border-radius:16px" onclick="go('gamesHome')">
          🏠 القائمة الرئيسية
        </button>
      </div>
    </div>
  `;
};

window.shareGameResultToFeed = function(score, distance, kills) {
  if (!window.S || !S.posts) return;
  const newPost = {
    id: "post_game_" + Date.now(),
    authorId: (S.me && (S.me.uid || S.me.id)) || "anon",
    authorName: (S.me && S.me.name) || "صياد أنمي بلاك",
    authorHandle: (S.me && S.me.handle) || "hunter",
    authorAvatar: (S.me && S.me.avatar) || "a1",
    authorRole: (S.me && S.me.role) || "عضو",
    text: `🎮 حققت لتوي رقماً قياسياً جديداً في لعبة Anime Hunter!\n\n🏆 النقاط: ${nfmt(score)}\n🏃 المسافة: ${nfmt(distance)} م\n⚔️ قتلت: ${kills} وحش\n\nهل يستطيع أحد كسر رقمي القياسي؟ تحدوني في ألعاب واربح! ⚔️🔥`,
    timestamp: Date.now(),
    likes: 1,
    liked: true,
    comments: []
  };
  S.posts.unshift(newPost);
  save();
  toast("✨ تم نشر إنجازك بنجاح في مجتمع أنمي بلاك!", "ok");
  go('home');
};
