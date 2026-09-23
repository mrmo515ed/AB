/* =========================================================================
   ANIME BLACK GAMES — PART 5: ADMIN MANAGEMENT DASHBOARD & PAGES (17 SCREENS)
   ========================================================================= */

// 23. Main Admin Games Dashboard
PAGES.gameAdmin = function() {
  ensureGameState();
  if (!isPlatformAdmin()) {
    toast("عذراً، هذه الصفحة مخصصة لمدراء النظام فقط", "err");
    go('gamesHome');
    return "";
  }

  setHdr("🛡️ لوحة تحكم ألعاب واربح", `
    <button class="iconbtn" onclick="go('gamesHome')">${I("back","i s")}</button>
  `);
  setNav("more");

  return `
    <div class="pad col" style="gap:16px;padding-bottom:90px">
      <!-- Admin Telemetry Header -->
      <div class="card" style="padding:18px;border-radius:24px;background:linear-gradient(135deg,#7F1D1D 0%,#3B0764 50%,#0F172A 100%);border:1px solid rgba(239,68,68,0.4)">
        <div class="rowb">
          <div class="bb lg" style="color:#fff">مركز إدارة الألعاب واقتصاد الصيادين</div>
          <span class="badge b-gold b">SUPER ADMIN</span>
        </div>
        <p class="tiny mut" style="color:rgba(255,255,255,0.8);margin-top:4px">التحكم الشامل في المراحل، الشخصيات، الأعداء، نسب السقوط، وسجلات مكافحة الغش.</p>
        
        <div class="grid grid-3" style="margin-top:14px;gap:8px">
          <div class="card2 col" style="padding:10px;text-align:center;background:rgba(0,0,0,0.4);border-radius:14px">
            <div class="tiny mut">المراحل</div>
            <div class="bb md" style="color:#38BDF8">${S.game.stages.length}</div>
          </div>
          <div class="card2 col" style="padding:10px;text-align:center;background:rgba(0,0,0,0.4);border-radius:14px">
            <div class="tiny mut">الشخصيات</div>
            <div class="bb md" style="color:#A78BFA">${S.game.characters.length}</div>
          </div>
          <div class="card2 col" style="padding:10px;text-align:center;background:rgba(0,0,0,0.4);border-radius:14px">
            <div class="tiny mut">بلاغات الغش</div>
            <div class="bb md" style="color:#EF4444">${(S.game.antiCheatLogs || []).length}</div>
          </div>
        </div>
      </div>

      <!-- Admin Hub Navigation -->
      <div class="secttl"><h3>🎮 أقسام الإدارة الشاملة</h3></div>
      <div class="grid grid-2" style="gap:10px">
        <button class="card2 col" style="padding:14px;border-radius:18px;text-align:right;gap:6px;cursor:pointer" onclick="go('gameAdminStages')">
          <div style="font-size:24px">🗺️</div>
          <div class="b sm" style="color:#fff">إدارة المراحل والخرائط</div>
          <div class="tiny mut">تعديل الصعوبة والمضاعفات</div>
        </button>
        <button class="card2 col" style="padding:14px;border-radius:18px;text-align:right;gap:6px;cursor:pointer" onclick="go('gameAdminCharacters')">
          <div style="font-size:24px">🥷</div>
          <div class="b sm" style="color:#fff">إدارة الشخصيات والمهارات</div>
          <div class="tiny mut">موازنة القوة والإحصائيات</div>
        </button>
        <button class="card2 col" style="padding:14px;border-radius:18px;text-align:right;gap:6px;cursor:pointer" onclick="go('gameAdminItems')">
          <div style="font-size:24px">🎒</div>
          <div class="b sm" style="color:#fff">إدارة العناصر والمواد</div>
          <div class="tiny mut">إضافة وتعديل أدوات التطوير</div>
        </button>
        <button class="card2 col" style="padding:14px;border-radius:18px;text-align:right;gap:6px;cursor:pointer" onclick="go('gameAdminDropRates')">
          <div style="font-size:24px">🎲</div>
          <div class="b sm" style="color:#fff">نسب الإسقاط والغنائم</div>
          <div class="tiny mut">ضبط احتمالات الجواهر والصناديق</div>
        </button>
        <button class="card2 col" style="padding:14px;border-radius:18px;text-align:right;gap:6px;cursor:pointer" onclick="go('gameAdminEvents')">
          <div style="font-size:24px">🔥</div>
          <div class="b sm" style="color:#fff">إدارة الفعاليات الموسمية</div>
          <div class="tiny mut">جدولة وتفعيل التحديات</div>
        </button>
        <button class="card2 col" style="padding:14px;border-radius:18px;text-align:right;gap:6px;cursor:pointer" onclick="go('gameAdminPlayers')">
          <div style="font-size:24px">👥</div>
          <div class="b sm" style="color:#fff">إدارة حسابات اللاعبين</div>
          <div class="tiny mut">تعديل الأرصدة والمنح والحظر</div>
        </button>
        <button class="card2 col" style="padding:14px;border-radius:18px;text-align:right;gap:6px;cursor:pointer" onclick="go('gameAdminAntiCheat')">
          <div style="font-size:24px">🚨</div>
          <div class="b sm" style="color:#fff">سجل مكافحة الغش (Anti-Cheat)</div>
          <div class="tiny mut">مراقبة الجولات المشبوهة</div>
        </button>
        <button class="card2 col" style="padding:14px;border-radius:18px;text-align:right;gap:6px;cursor:pointer" onclick="go('gameAdminAuditLogs')">
          <div style="font-size:24px">📜</div>
          <div class="b sm" style="color:#fff">سجل تدقيق العمليات (Audit)</div>
          <div class="tiny mut">تاريخ تعديلات الإدارة</div>
        </button>
      </div>
    </div>
  `;
};

// 24. Admin Stages Management
PAGES.gameAdminStages = function() {
  ensureGameState();
  setHdr("🗺️ إدارة المراحل", `<button class="iconbtn" onclick="go('gameAdmin')">${I("back","i s")}</button>`);
  setNav("more");

  return `
    <div class="pad col" style="gap:16px;padding-bottom:90px">
      <div class="col" style="gap:12px">
        ${S.game.stages.map(st => `
          <div class="card2 col" style="padding:14px;border-radius:18px;gap:8px">
            <div class="rowb">
              <span class="bb sm" style="color:#fff">${esc(st.name)}</span>
              <span class="badge b-cyan">${st.difficulty}</span>
            </div>
            <div class="tiny mut">مضاعف العملات: ×${st.coinsMultiplier} · سرعة الجري: ${st.speed}</div>
            <div class="tiny" style="color:#EF4444">الزعيم: ${esc(st.bossName)} (HP: ${st.bossHp})</div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
};

// 25. Admin Characters Management
PAGES.gameAdminCharacters = function() {
  ensureGameState();
  setHdr("🥷 إدارة الشخصيات", `<button class="iconbtn" onclick="go('gameAdmin')">${I("back","i s")}</button>`);
  setNav("more");

  return `
    <div class="pad col" style="gap:16px;padding-bottom:90px">
      <div class="col" style="gap:12px">
        ${S.game.characters.map(c => `
          <div class="card2 rowb" style="padding:14px;border-radius:18px;align-items:center">
            <div class="row" style="gap:10px;align-items:center">
              <div style="width:40px;height:40px;border-radius:12px;background:${c.color};display:flex;align-items:center;justify-content:center;font-size:20px">🥷</div>
              <div style="text-align:right">
                <div class="bb sm" style="color:#fff">${esc(c.name)}</div>
                <div class="tiny mut">ATK: ${c.attack} · DEF: ${c.defense} · HP: ${c.hp}</div>
              </div>
            </div>
            <span class="badge b-purple">${c.rarity}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;
};

// 26. Admin Items Management
PAGES.gameAdminItems = function() {
  ensureGameState();
  setHdr("🎒 إدارة العناصر", `<button class="iconbtn" onclick="go('gameAdmin')">${I("back","i s")}</button>`);
  setNav("more");

  return `
    <div class="pad col" style="gap:16px;padding-bottom:90px">
      <div class="col" style="gap:12px">
        ${S.game.inventory.map(i => `
          <div class="card2 rowb" style="padding:14px;border-radius:18px">
            <div style="text-align:right">
              <div class="bb sm" style="color:#fff">${esc(i.name)}</div>
              <div class="tiny mut">${esc(i.desc)}</div>
            </div>
            <span class="badge b-gold">${i.rarity}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;
};

// 27. Admin Drop Rates
PAGES.gameAdminDropRates = function() {
  ensureGameState();
  setHdr("🎲 نسب الإسقاط والغنائم", `<button class="iconbtn" onclick="go('gameAdmin')">${I("back","i s")}</button>`);
  setNav("more");

  return `
    <div class="pad col" style="gap:16px;padding-bottom:90px">
      <div class="card2 col" style="padding:16px;border-radius:20px;gap:12px">
        <div class="rowb">
          <span class="b sm">🪙 نسبة إسقاط العملات:</span>
          <span class="badge b-gold">60%</span>
        </div>
        <div class="rowb">
          <span class="b sm">✨ نسبة إسقاط شظايا الروح:</span>
          <span class="badge b-purple">25%</span>
        </div>
        <div class="rowb">
          <span class="b sm">💎 نسبة إسقاط الجواهر النادرة:</span>
          <span class="badge b-cyan">10%</span>
        </div>
        <div class="rowb">
          <span class="b sm">🎁 نسبة إسقاط صناديق الكنز:</span>
          <span class="badge b-emerald">5%</span>
        </div>
      </div>
    </div>
  `;
};

// 28. Admin Events
PAGES.gameAdminEvents = function() {
  ensureGameState();
  setHdr("🔥 إدارة الفعاليات", `<button class="iconbtn" onclick="go('gameAdmin')">${I("back","i s")}</button>`);
  setNav("more");

  return `
    <div class="pad col" style="gap:16px;padding-bottom:90px">
      <div class="col" style="gap:12px">
        ${S.game.events.map(ev => `
          <div class="card2 col" style="padding:14px;border-radius:18px;gap:6px">
            <div class="rowb">
              <span class="bb sm" style="color:#fff">${esc(ev.title)}</span>
              <span class="badge b-emerald">${ev.status}</span>
            </div>
            <div class="tiny mut">${esc(ev.desc)}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
};

// 29. Admin Players Management
PAGES.gameAdminPlayers = function() {
  ensureGameState();
  setHdr("👥 إدارة اللاعبين والصيادين", `<button class="iconbtn" onclick="go('gameAdmin')">${I("back","i s")}</button>`);
  setNav("more");

  const p = S.game.profile;

  return `
    <div class="pad col" style="gap:16px;padding-bottom:90px">
      <div class="card2 col" style="padding:16px;border-radius:20px;gap:10px">
        <div class="rowb">
          <div class="b sm">${(S.me && S.me.name) || 'لاعب أنمي بلاك'}</div>
          <span class="badge b-cyan">المستوى ${p.hunterLevel}</span>
        </div>
        <div class="tiny mut">الرصيد: 🪙 ${nfmt(p.coins)} | 💎 ${nfmt(p.gems)} | ⚡ ${p.energy}/50</div>
        
        <div class="row" style="gap:8px;margin-top:6px">
          <button class="btn btn-xs btn-primary g1" onclick="grantAdminBonus('coins', 1000)">+1,000 عملة</button>
          <button class="btn btn-xs btn-primary g1" onclick="grantAdminBonus('gems', 50)">+50 جوهرة</button>
          <button class="btn btn-xs btn-outline g1" onclick="grantAdminBonus('energy', 50)">تعبئة الطاقة</button>
        </div>
      </div>
    </div>
  `;
};

window.grantAdminBonus = function(type, amt) {
  ensureGameState();
  const p = S.game.profile;
  if (type === 'coins') p.coins += amt;
  else if (type === 'gems') p.gems += amt;
  else if (type === 'energy') p.energy = Math.min(50, p.energy + amt);
  
  recordAdminGameAudit(`منح مكافأة ${type}`, (S.me && S.me.name) || 'اللاعب', 0, amt);
  saveGame();
  toast(`✅ تم منح المكافأة الإدارية (+${amt} ${type}) بنجاح!`, "ok");
  go('gameAdminPlayers');
};

// 30. Admin Anti-Cheat Logs
PAGES.gameAdminAntiCheat = function() {
  ensureGameState();
  setHdr("🚨 سجلات مكافحة الغش", `<button class="iconbtn" onclick="go('gameAdmin')">${I("back","i s")}</button>`);
  setNav("more");

  const logs = S.game.antiCheatLogs || [];

  return `
    <div class="pad col" style="gap:16px;padding-bottom:90px">
      ${logs.length === 0 ? `
        <div class="card2 col" style="padding:24px;border-radius:20px;text-align:center">
          <div style="font-size:36px;margin-bottom:8px">🛡️</div>
          <div class="b sm" style="color:#34D399">النظام آمن ونظيف تماماً</div>
          <div class="tiny mut" style="margin-top:4px">لم يتم رصد أي محاولات غش أو تلاعب بالسرعة أو الأرصدة.</div>
        </div>
      ` : `
        <div class="col" style="gap:10px">
          ${logs.map(l => `
            <div class="card2 col" style="padding:14px;border-radius:18px;gap:4px;border:1px solid rgba(239,68,68,0.4)">
              <div class="rowb">
                <span class="bb sm" style="color:#EF4444">${esc(l.reason)}</span>
                <span class="tiny mut">${new Date(l.at).toLocaleTimeString('ar')}</span>
              </div>
              <div class="tiny mut">${esc(l.details)}</div>
            </div>
          `).join('')}
        </div>
      `}
    </div>
  `;
};

// 31. Admin Audit Logs
PAGES.gameAdminAuditLogs = function() {
  ensureGameState();
  setHdr("📜 سجل تدقيق العمليات", `<button class="iconbtn" onclick="go('gameAdmin')">${I("back","i s")}</button>`);
  setNav("more");

  const logs = S.game.adminLogs || [];

  return `
    <div class="pad col" style="gap:16px;padding-bottom:90px">
      ${logs.length === 0 ? `
        <div class="card2 col" style="padding:24px;border-radius:20px;text-align:center">
          <div class="tiny mut">لا توجد عمليات تدقيق مسجلة حتى الآن.</div>
        </div>
      ` : `
        <div class="col" style="gap:10px">
          ${logs.map(l => `
            <div class="card2 col" style="padding:14px;border-radius:18px;gap:4px">
              <div class="rowb">
                <span class="bb sm" style="color:#38BDF8">${esc(l.action)}</span>
                <span class="tiny mut">${new Date(l.at).toLocaleTimeString('ar')}</span>
              </div>
              <div class="tiny mut">بواسطة: ${esc(l.admin)} ➔ الهدف: ${esc(l.target)}</div>
            </div>
          `).join('')}
        </div>
      `}
    </div>
  `;
};

// Fallback Aliases for other Admin Sub-pages
PAGES.gameAdminEnemies = PAGES.gameAdminStages;
PAGES.gameAdminBosses = PAGES.gameAdminStages;
PAGES.gameAdminRewards = PAGES.gameAdminDropRates;
PAGES.gameAdminLeaderboard = PAGES.gameLeaderboard;
PAGES.gameAdminSettings = PAGES.gameSettings;
PAGES.gameAdminEconomy = PAGES.gameAdminDropRates;
PAGES.gameAdminPlayerDetail = PAGES.gameAdminPlayers;
PAGES.gameAdminStageEdit = PAGES.gameAdminStages;
