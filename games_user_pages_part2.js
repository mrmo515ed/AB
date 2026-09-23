/* =========================================================================
   ANIME BLACK GAMES — PART 4: USER PAGES (CHARACTERS, INVENTORY, CHESTS, MISSIONS, ETC.)
   ========================================================================= */

// 5. Characters Catalog
PAGES.gameCharacters = function() {
  ensureGameState();
  const p = S.game.profile;

  setHdr("🥷 شخصيات الأنمي · Characters", `
    <button class="iconbtn" onclick="go('gamesHome')">${I("back","i s")}</button>
  `);
  setNav("more");

  return `
    <div class="pad col" style="gap:16px;padding-bottom:90px">
      <div class="rowb">
        <span class="bb md">قائمة الصيادين والشخصيات</span>
        <span class="badge b-cyan">${S.game.characters.filter(c=>c.unlocked).length}/${S.game.characters.length} مفتوحة</span>
      </div>

      <div class="col" style="gap:12px">
        ${S.game.characters.map(c => `
          <div class="card" style="padding:16px;border-radius:20px;border:${c.id === p.equippedCharacterId ? '2px solid #00A3FF' : '1px solid rgba(255,255,255,0.1)'};background:linear-gradient(135deg,rgba(30,27,75,0.7),rgba(15,23,42,0.85))">
            <div class="rowb">
              <div class="row" style="gap:12px;align-items:center">
                <div style="width:54px;height:54px;border-radius:16px;background:${c.color};display:flex;align-items:center;justify-content:center;font-size:26px;border:2px solid rgba(255,255,255,0.3)">
                  🥷
                </div>
                <div style="text-align:right">
                  <div class="bb md" style="color:#fff">${esc(c.name)}</div>
                  <div class="row" style="gap:6px;margin-top:3px">
                    <span class="badge ${c.rarity === 'Mythic' ? 'b-emerald' : c.rarity === 'Legendary' ? 'b-pink' : c.rarity === 'Epic' ? 'b-purple' : 'b-cyan'}">${c.rarity}</span>
                    <span class="badge b-gold">⭐ ${c.stars} نجوم</span>
                    <span class="badge b-gray">Lv.${c.level}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="grid grid-3" style="margin-top:12px;gap:6px;background:rgba(0,0,0,0.3);padding:8px;border-radius:12px">
              <div class="tiny text-center"><span class="mut">هجوم:</span> <b style="color:#EF4444">${c.attack}</b></div>
              <div class="tiny text-center"><span class="mut">دفاع:</span> <b style="color:#38BDF8">${c.defense}</b></div>
              <div class="tiny text-center"><span class="mut">سرعة:</span> <b style="color:#34D399">${c.speed}</b></div>
            </div>

            <div class="rowb" style="margin-top:12px">
              <button class="btn btn-xs btn-outline" onclick="go('gameCharacterDetail', {charId: '${c.id}'})">
                تفاصيل والمهارات
              </button>
              ${c.unlocked ? `
                ${c.id === p.equippedCharacterId ? `
                  <span class="badge b-emerald">مجهزة حالياً ✓</span>
                ` : `
                  <button class="btn btn-xs btn-primary" onclick="S.game.profile.equippedCharacterId='${c.id}';saveGame();toast('تم تجهيز الشخصية بنجاح!','ok');go('gameCharacters')">
                    تجهيز للقتال
                  </button>
                `}
              ` : `
                <button class="btn btn-xs btn-primary" style="background:linear-gradient(135deg,#EC4899,#8B5CF6);border:none" onclick="unlockCharacter('${c.id}')">
                  ${c.unlockCostCoins ? `🪙 فتح مقابل ${nfmt(c.unlockCostCoins)}` : `💎 فتح مقابل ${c.unlockCostGems}`}
                </button>
              `}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
};

window.unlockCharacter = function(charId) {
  ensureGameState();
  const c = S.game.characters.find(x => x.id === charId);
  const p = S.game.profile;
  if (!c) return;

  if (c.unlockCostCoins) {
    if (p.coins < c.unlockCostCoins) {
      toast("عذراً، لا تملك رصيد كافي من العملات الذهبية", "err");
      return;
    }
    p.coins -= c.unlockCostCoins;
  } else if (c.unlockCostGems) {
    if (p.gems < c.unlockCostGems) {
      toast("عذراً، لا تملك رصيد كافي من الجواهر", "err");
      return;
    }
    p.gems -= c.unlockCostGems;
  }

  c.unlocked = true;
  p.equippedCharacterId = c.id;
  saveGame();
  toast(`🎉 تم فتح شخصية ${c.name} بنجاح وتجهيزها!`, "ok");
  go('gameCharacters');
};

// 6. Character Detail Page
PAGES.gameCharacterDetail = function(params = {}) {
  ensureGameState();
  const charId = params.charId || S.game.profile.equippedCharacterId;
  const c = S.game.characters.find(x => x.id === charId) || S.game.characters[0];

  setHdr(`🥷 ${c.name.split('—')[0]}`, `
    <button class="iconbtn" onclick="go('gameCharacters')">${I("back","i s")}</button>
  `);
  setNav("more");

  return `
    <div class="pad col" style="gap:16px;padding-bottom:90px">
      <!-- 3D Style Card -->
      <div class="card" style="padding:24px 16px;border-radius:24px;text-align:center;background:linear-gradient(135deg,#1E1B4B,#0F172A);border:1px solid rgba(255,255,255,0.15)">
        <div style="width:84px;height:84px;margin:0 auto 12px;border-radius:24px;background:${c.color};display:flex;align-items:center;justify-content:center;font-size:42px;box-shadow:0 12px 30px rgba(0,0,0,0.5);border:3px solid rgba(255,255,255,0.4)">
          🥷
        </div>
        <div class="bb lg" style="color:#fff">${esc(c.name)}</div>
        <div class="row" style="justify-content:center;gap:8px;margin-top:6px">
          <span class="badge b-purple">${c.rarity}</span>
          <span class="badge b-gold">⭐ ${c.stars} نجوم</span>
          <span class="badge b-cyan">المستوى ${c.level}</span>
        </div>
        <p class="sm mut" style="margin-top:10px;line-height:1.5">${esc(c.desc || '')}</p>
      </div>

      <!-- Combat Skills -->
      <div class="secttl"><h3>⚡ المهارات القتالية والقدرات الخاصة</h3></div>
      <div class="card2 col" style="padding:14px;border-radius:18px;gap:10px">
        <div class="row" style="gap:10px;align-items:flex-start">
          <span style="font-size:24px">⚔️</span>
          <div style="text-align:right">
            <div class="b sm" style="color:#38BDF8">${esc(c.skillName)}</div>
            <div class="tiny mut">تسبب ضرراً كاسحاً بقوة ${c.skillPower} نقطة لجميع الأعداء في الشاشة.</div>
          </div>
        </div>
        <div class="row" style="gap:10px;align-items:flex-start;padding-top:8px;border-top:1px solid rgba(255,255,255,0.1)">
          <span style="font-size:24px">💥</span>
          <div style="text-align:right">
            <div class="b sm" style="color:#EC4899">${esc(c.specialName)}</div>
            <div class="tiny mut">الضربة القاضية المطلقة عند تفعيل وضع التحول بقوة ${c.specialPower} نقطة.</div>
          </div>
        </div>
      </div>

      <div class="row" style="gap:10px">
        <button class="btn btn-primary g1" style="padding:14px;border-radius:16px" onclick="go('gameUpgrades', {charId: '${c.id}'})">
          ⚡ ترقية وتطوير الشخصية
        </button>
        <button class="btn btn-outline g1" style="padding:14px;border-radius:16px" onclick="go('gameTransformations', {charId: '${c.id}'})">
          🔥 شجرة التحولات
        </button>
      </div>
    </div>
  `;
};

// 7. Upgrades Page
PAGES.gameUpgrades = function(params = {}) {
  ensureGameState();
  const p = S.game.profile;
  const charId = params.charId || p.equippedCharacterId;
  const c = S.game.characters.find(x => x.id === charId) || S.game.characters[0];
  const upgradeCost = (c.level || 1) * 350;

  setHdr("⚡ تطوير الشخصية · Upgrade", `
    <button class="iconbtn" onclick="go('gameCharacters')">${I("back","i s")}</button>
  `);
  setNav("more");

  return `
    <div class="pad col" style="gap:16px;padding-bottom:90px">
      <div class="card" style="padding:16px;border-radius:20px;background:linear-gradient(135deg,#1E1B4B,#0F172A)">
        <div class="row" style="gap:12px;align-items:center">
          <div style="width:50px;height:50px;border-radius:16px;background:${c.color};display:flex;align-items:center;justify-content:center;font-size:24px">🥷</div>
          <div style="text-align:right">
            <div class="bb md" style="color:#fff">${esc(c.name)}</div>
            <div class="tiny mut">المستوى الحالي: Lv.${c.level} ➔ القادم: Lv.${c.level + 1}</div>
          </div>
        </div>
      </div>

      <div class="secttl"><h3>📊 الزيادة في الإحصائيات</h3></div>
      <div class="card2 col" style="padding:14px;border-radius:18px;gap:12px">
        <div class="rowb">
          <span class="sm mut">نقاط الهجوم (ATK):</span>
          <span class="b sm" style="color:#EF4444">${c.attack} ➔ <span style="color:#34D399">+25 (${c.attack + 25})</span></span>
        </div>
        <div class="rowb">
          <span class="sm mut">نقاط الدفاع (DEF):</span>
          <span class="b sm" style="color:#38BDF8">${c.defense} ➔ <span style="color:#34D399">+15 (${c.defense + 15})</span></span>
        </div>
        <div class="rowb">
          <span class="sm mut">النقاط الحيوية (HP):</span>
          <span class="b sm" style="color:#EC4899">${c.hp} ➔ <span style="color:#34D399">+150 (${c.hp + 150})</span></span>
        </div>
      </div>

      <div class="card2 rowb" style="padding:14px;border-radius:16px">
        <div class="row" style="gap:8px">
          <span style="font-size:20px">🪙</span>
          <span class="b sm">تكلفة الترقية:</span>
          <span class="badge b-gold mono">${nfmt(upgradeCost)} عملة</span>
        </div>
        <span class="tiny mut">رصيدك: ${nfmt(p.coins)}</span>
      </div>

      <button class="btn btn-primary" style="width:100%;padding:16px;border-radius:18px;font-size:16px;font-weight:900" onclick="upgradeCharacterLevel('${c.id}')">
        ⚡ تأكيد الترقية الآن
      </button>
    </div>
  `;
};

window.upgradeCharacterLevel = function(charId) {
  ensureGameState();
  const c = S.game.characters.find(x => x.id === charId);
  const p = S.game.profile;
  if (!c) return;

  const cost = (c.level || 1) * 350;
  if (p.coins < cost) {
    toast("عذراً، رصيدك من العملات الذهبية غير كافٍ للترقية", "err");
    return;
  }

  p.coins -= cost;
  c.level += 1;
  c.attack += 25;
  c.defense += 15;
  c.hp += 150;
  c.skillPower += 40;

  saveGame();
  toast(`✨ تهانينا! تمت ترقية ${c.name} إلى المستوى ${c.level}!`, "ok");
  go('gameUpgrades', { charId: c.id });
};

// 8. Transformations Tree
PAGES.gameTransformations = function(params = {}) {
  ensureGameState();
  const charId = params.charId || S.game.profile.equippedCharacterId;
  const c = S.game.characters.find(x => x.id === charId) || S.game.characters[0];

  setHdr("🔥 شجرة التحولات · Transformations", `
    <button class="iconbtn" onclick="go('gameCharacters')">${I("back","i s")}</button>
  `);
  setNav("more");

  const forms = [
    { tier: 0, name: "النمط الأساسي (Base Form)", desc: "الشكل الأولي للصياد مع المهارات القياسية.", unlocked: true, mult: "1.0X" },
    { tier: 1, name: "إيقاظ الروح (Spirit Awakening)", desc: "توهج أزرق وهالة مضاعفة لسرعة الهجوم.", unlocked: c.transformationTier >= 1, cost: "150 شظية روح", mult: "1.5X" },
    { tier: 2, name: "وضع الهياج الفراغي (Void Berserk)", desc: "تحول مظلم يمنح مناعة ضد العوائق وضربات حارقة.", unlocked: c.transformationTier >= 2, cost: "300 شظية + 5 نوى شيطانية", mult: "2.2X" },
    { tier: 3, name: "التحول الشمسي الأسطوري (Solar Deity)", desc: "هالة نارية عملاقة مع إبادة شاملة للوحوش في الشاشة.", unlocked: c.transformationTier >= 3, cost: "600 شظية + 10 نوى + 2 بلورات فراغ", mult: "3.5X" }
  ];

  return `
    <div class="pad col" style="gap:16px;padding-bottom:90px">
      <div class="card" style="padding:16px;border-radius:20px;background:linear-gradient(135deg,#7F1D1D,#1E1B4B)">
        <div class="bb md" style="color:#fff">${esc(c.name)} — مسار التحول</div>
        <div class="tiny mut" style="color:rgba(255,255,255,0.8)">يتم شحن مقياس التحول أثناء المعركة بالقضاء على الأعداء وجمع الشظايا.</div>
      </div>

      <div class="col" style="gap:12px">
        ${forms.map(f => `
          <div class="card2" style="padding:16px;border-radius:18px;border:${f.unlocked ? '1px solid rgba(234,179,8,0.4)' : '1px solid rgba(255,255,255,0.1)'};background:${f.unlocked ? 'rgba(234,179,8,0.08)' : 'rgba(0,0,0,0.3)'}">
            <div class="rowb">
              <div class="row" style="gap:8px">
                <span style="font-size:22px">${f.unlocked ? '🔥' : '🔒'}</span>
                <span class="bb sm" style="color:#fff">${esc(f.name)}</span>
              </div>
              <span class="badge b-gold">مضاعف القوة ${f.mult}</span>
            </div>
            <div class="tiny mut" style="margin-top:4px">${esc(f.desc)}</div>
            <div class="rowb" style="margin-top:10px;padding-top:8px;border-top:1px solid rgba(255,255,255,0.08)">
              <span class="tiny mut">${f.unlocked ? '✅ تم التحرير' : `المتطلبات: ${f.cost}`}</span>
              ${!f.unlocked ? `
                <button class="btn btn-xs btn-primary" onclick="unlockTransformationTier('${c.id}', ${f.tier})">تحرير التحول</button>
              ` : ''}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
};

window.unlockTransformationTier = function(charId, tier) {
  ensureGameState();
  const c = S.game.characters.find(x => x.id === charId);
  const shardsItem = S.game.inventory.find(i => i.id === 'item_spirit_shard');
  if (!shardsItem || shardsItem.count < 150) {
    toast("عذراً، تحتاج إلى 150 شظية أرواح على الأقل لفتح هذا التحول", "err");
    return;
  }
  shardsItem.count -= 150;
  c.transformationTier = tier;
  saveGame();
  toast(`🔥 تهانينا! تم تحرير نمط التحول الجديد لـ ${c.name}!`, "ok");
  go('gameTransformations', { charId: charId });
};

// 9. Inventory Page
PAGES.gameInventory = function() {
  ensureGameState();

  setHdr("🎒 حقيبة المخزون · Inventory", `
    <button class="iconbtn" onclick="go('gamesHome')">${I("back","i s")}</button>
  `);
  setNav("more");

  return `
    <div class="pad col" style="gap:16px;padding-bottom:90px">
      <div class="rowb">
        <span class="bb md">العناصر والمواد المجمعة</span>
        <span class="badge b-cyan">${S.game.inventory.reduce((a,b)=>a+b.count,0)} عنصر</span>
      </div>

      <div class="grid grid-2" style="gap:10px">
        ${S.game.inventory.map(item => `
          <div class="card2 col" style="padding:14px;border-radius:18px;gap:8px;cursor:pointer" onclick="go('gameItemDetail', {itemId: '${item.id}'})">
            <div class="rowb">
              <span style="font-size:26px">${item.icon === 'crown' ? '👑' : item.icon === 'sparkles' ? '✨' : item.icon === 'gift' ? '🎁' : '💎'}</span>
              <span class="badge b-gold mono">x${item.count}</span>
            </div>
            <div class="b sm" style="color:#fff">${esc(item.name.split('(')[0])}</div>
            <div class="tiny mut">${esc(item.rarity)} · ${esc(item.desc.substring(0, 32))}...</div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
};

// 10. Item Detail Page
PAGES.gameItemDetail = function(params = {}) {
  ensureGameState();
  const itemId = params.itemId;
  const item = S.game.inventory.find(i => i.id === itemId) || S.game.inventory[0];

  setHdr("🔍 تفاصيل العنصر", `
    <button class="iconbtn" onclick="go('gameInventory')">${I("back","i s")}</button>
  `);
  setNav("more");

  return `
    <div class="pad col" style="gap:16px;padding-bottom:90px;text-align:center">
      <div class="card" style="padding:24px 16px;border-radius:24px;background:linear-gradient(135deg,#1E1B4B,#0F172A)">
        <div style="font-size:48px;margin-bottom:10px">✨</div>
        <div class="bb lg" style="color:#fff">${esc(item.name)}</div>
        <div class="row" style="justify-content:center;gap:8px;margin-top:6px">
          <span class="badge b-purple">${item.rarity}</span>
          <span class="badge b-gold">الكمية: ${item.count}</span>
        </div>
        <p class="sm mut" style="margin-top:14px;line-height:1.6">${esc(item.desc)}</p>
      </div>

      <div class="card2 col" style="padding:14px;border-radius:18px;text-align:right;gap:8px">
        <div class="b sm">💡 كيفية الحصول عليه:</div>
        <div class="tiny mut">• إسقاط عشوائي من هزيمة وحوش الغابة ونيو طوكيو.</div>
        <div class="tiny mut">• فتح صناديق الكنز النادرة والملحمية.</div>
        <div class="tiny mut">• جوائز تسجيل الدخول اليومي والفعاليات.</div>
      </div>

      <button class="btn btn-outline" style="width:100%;padding:14px;border-radius:16px" onclick="go('gameInventory')">
        العودة للمخزون
      </button>
    </div>
  `;
};

// 11. Chests Vault Page
PAGES.gameChests = function() {
  ensureGameState();
  const p = S.game.profile;

  setHdr("🎁 خزينة الصناديق · Chest Vault", `
    <button class="iconbtn" onclick="go('gamesHome')">${I("back","i s")}</button>
  `);
  setNav("more");

  const chests = [
    { type: 'rare', name: "صندوق الأسلحة النادر", costGems: 20, icon: "🎁", color: "#3B82F6", drops: "عملات 500-1500 + شظايا روح 50-100" },
    { type: 'epic', name: "صندوق الكنز الملحمي", costGems: 50, icon: "👑", color: "#8B5CF6", drops: "عملات 2000-5000 + نوى شيطانية + شظايا 200" },
    { type: 'legendary', name: "صندوق التنين الأسطوري", costGems: 120, icon: "🔥", color: "#EC4899", drops: "كرات التنين + بلورات فراغ + جواهر إضافية" }
  ];

  return `
    <div class="pad col" style="gap:16px;padding-bottom:90px">
      <div class="card2 rowb" style="padding:12px 16px;border-radius:16px">
        <span class="b sm">💎 رصيدك من الجواهر:</span>
        <span class="badge b-cyan mono">${nfmt(p.gems)} جوهرة</span>
      </div>

      <div class="col" style="gap:14px">
        ${chests.map(ch => `
          <div class="card" style="padding:16px;border-radius:20px;background:linear-gradient(135deg,rgba(30,27,75,0.8),rgba(15,23,42,0.9));border:1px solid rgba(255,255,255,0.15)">
            <div class="rowb">
              <div class="row" style="gap:12px;align-items:center">
                <div style="font-size:36px">${ch.icon}</div>
                <div style="text-align:right">
                  <div class="bb md" style="color:#fff">${esc(ch.name)}</div>
                  <div class="tiny mut" style="margin-top:2px">${esc(ch.drops)}</div>
                </div>
              </div>
            </div>
            <div class="rowb" style="margin-top:14px;padding-top:10px;border-top:1px solid rgba(255,255,255,0.1)">
              <span class="badge b-cyan">💎 ${ch.costGems} جوهرة</span>
              <button class="btn btn-primary btn-xs" style="background:linear-gradient(135deg,#00A3FF,#8B5CF6);border:none;border-radius:10px" onclick="openGameChest('${ch.type}', ${ch.costGems})">
                فتح الصندوق الآن
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
};

window.openGameChest = function(type, cost) {
  ensureGameState();
  const p = S.game.profile;
  if (p.gems < cost) {
    toast("عذراً، رصيدك من الجواهر غير كافٍ لفتح هذا الصندوق", "err");
    return;
  }
  p.gems -= cost;

  let rewardCoins = 800 + Math.floor(Math.random() * 1200);
  let rewardShards = 60 + Math.floor(Math.random() * 80);
  p.coins += rewardCoins;

  const shardsItem = S.game.inventory.find(i => i.id === 'item_spirit_shard');
  if (shardsItem) shardsItem.count += rewardShards;

  saveGame();
  toast(`🎉 فتحت الصندوق وحصلت على: 🪙 ${rewardCoins} عملة و ✨ ${rewardShards} شظية روح!`, "ok");
  go('gameChests');
};

// 12. Missions Page
PAGES.gameMissions = function() {
  ensureGameState();

  setHdr("📜 المهام والمكافآت · Missions", `
    <button class="iconbtn" onclick="go('gamesHome')">${I("back","i s")}</button>
  `);
  setNav("more");

  return `
    <div class="pad col" style="gap:16px;padding-bottom:90px">
      <div class="secttl"><h3>المهام اليومية والأسبوعية</h3></div>

      <div class="col" style="gap:12px">
        ${S.game.missions.map(m => `
          <div class="card2 col" style="padding:14px;border-radius:18px;gap:8px">
            <div class="rowb">
              <span class="bb sm" style="color:#fff">${esc(m.title)}</span>
              <span class="badge ${m.type === 'daily' ? 'b-cyan' : 'b-purple'}">${m.type === 'daily' ? 'يومية' : 'أسبوعية'}</span>
            </div>
            <div class="tiny mut">${esc(m.desc)}</div>
            
            <div class="rowb" style="margin-top:6px;align-items:center">
              <span class="tiny" style="color:#FBBF24">🎁 المكافأة: ${m.rewardCoins ? `🪙 ${m.rewardCoins}` : ''} ${m.rewardGems ? `💎 ${m.rewardGems}` : ''}</span>
              ${m.claimed ? `
                <span class="badge b-emerald">تم الاستلام ✓</span>
              ` : `
                <button class="btn btn-xs btn-primary" onclick="claimGameMission('${m.id}')">استلام الجائزة</button>
              `}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
};

window.claimGameMission = function(mId) {
  ensureGameState();
  const m = S.game.missions.find(x => x.id === mId);
  const p = S.game.profile;
  if (!m || m.claimed) return;

  m.claimed = true;
  if (m.rewardCoins) p.coins += m.rewardCoins;
  if (m.rewardGems) p.gems += m.rewardGems;
  if (m.rewardXp) p.hunterXp += m.rewardXp;

  saveGame();
  toast("✨ تم استلام مكافأة المهمة بنجاح!", "ok");
  go('gameMissions');
};

// 13. Daily Rewards Page
PAGES.gameDailyRewards = function() {
  ensureGameState();
  const p = S.game.profile;

  setHdr("📅 التقويم اليومي · Daily Streak", `
    <button class="iconbtn" onclick="go('gamesHome')">${I("back","i s")}</button>
  `);
  setNav("more");

  return `
    <div class="pad col" style="gap:16px;padding-bottom:90px">
      <div class="card" style="padding:18px;border-radius:22px;background:linear-gradient(135deg,#065F46,#1E1B4B);text-align:center">
        <div class="bb lg" style="color:#fff">سلسلة الحضور اليومي: يوم ${p.dailyStreak || 1} 🔥</div>
        <div class="tiny" style="color:rgba(255,255,255,0.85);margin-top:4px">سجل دخولك يومياً دون انقطاع لفتح الصندوق الأسطوري والجواهر الكبرى!</div>
      </div>

      <div class="grid grid-2" style="gap:10px">
        ${S.game.dailyRewardsCalendar.map(d => `
          <div class="card2 col" style="padding:14px;border-radius:18px;text-align:center;gap:6px;border:${d.claimed ? '1px solid rgba(16,185,129,0.4)' : '1px solid rgba(255,255,255,0.1)'}">
            <div class="tiny mut">اليوم ${d.day}</div>
            <div style="font-size:26px">${d.icon === 'coins' ? '🪙' : d.icon === 'zap' ? '⚡' : d.icon === 'sparkles' ? '💎' : '🎁'}</div>
            <div class="b sm" style="color:#fff">${esc(d.label)}</div>
            ${d.claimed ? `
              <span class="badge b-emerald" style="margin-top:4px">مستلمة ✓</span>
            ` : `
              <button class="btn btn-xs btn-outline" style="margin-top:4px" onclick="claimDailyDayReward(${d.day})">استلام اليوم</button>
            `}
          </div>
        `).join('')}
      </div>
    </div>
  `;
};

window.claimDailyDayReward = function(day) {
  ensureGameState();
  const d = S.game.dailyRewardsCalendar.find(x => x.day === day);
  const p = S.game.profile;
  if (!d || d.claimed) return;

  d.claimed = true;
  if (d.type === 'coins') p.coins += d.amount;
  else if (d.type === 'gems') p.gems += d.amount;
  else if (d.type === 'energy') p.energy = Math.min(50, p.energy + d.amount);

  saveGame();
  toast(`🎁 تم استلام مكافأة اليوم (${d.label}) بنجاح!`, "ok");
  go('gameDailyRewards');
};

// 14. Achievements Page
PAGES.gameAchievements = function() {
  ensureGameState();

  setHdr("🏆 الإنجازات والألقاب · Achievements", `
    <button class="iconbtn" onclick="go('gamesHome')">${I("back","i s")}</button>
  `);
  setNav("more");

  return `
    <div class="pad col" style="gap:16px;padding-bottom:90px">
      <div class="col" style="gap:12px">
        ${S.game.achievements.map(ach => `
          <div class="card2 col" style="padding:14px;border-radius:18px;gap:8px">
            <div class="rowb">
              <div class="row" style="gap:10px;align-items:center">
                <span style="font-size:24px">${ach.unlocked ? '🏆' : '🔒'}</span>
                <div style="text-align:right">
                  <div class="bb sm" style="color:#fff">${esc(ach.title)}</div>
                  <div class="tiny mut">${esc(ach.desc)}</div>
                </div>
              </div>
              <span class="badge b-cyan">💎 +${ach.rewardGems}</span>
            </div>
            <div class="rowb" style="margin-top:4px">
              <span class="tiny mut">التقدم: ${ach.progress}/${ach.target}</span>
              ${ach.unlocked ? '<span class="badge b-emerald">مكتمل ✓</span>' : '<span class="badge b-gray">قيد الإنجاز</span>'}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
};

// 15. Events Page
PAGES.gameEvents = function() {
  ensureGameState();

  setHdr("🔥 فعاليات الأنمي · Events", `
    <button class="iconbtn" onclick="go('gamesHome')">${I("back","i s")}</button>
  `);
  setNav("more");

  return `
    <div class="pad col" style="gap:16px;padding-bottom:90px">
      <div class="col" style="gap:14px">
        ${S.game.events.map(ev => `
          <div class="card" style="padding:16px;border-radius:20px;background:linear-gradient(135deg,rgba(30,27,75,0.8),rgba(15,23,42,0.9));border:1px solid rgba(255,255,255,0.15);cursor:pointer" onclick="go('gameEventDetail', {eventId: '${ev.id}'})">
            <div class="rowb">
              <span class="badge" style="background:${ev.color};color:#fff;font-weight:900">${ev.badge}</span>
              <span class="tiny mut">المدة: ${ev.endsIn}</span>
            </div>
            <div class="bb md" style="color:#fff;margin-top:8px">${esc(ev.title)}</div>
            <p class="tiny mut" style="margin-top:4px">${esc(ev.desc)}</p>
            <div class="rowb" style="margin-top:12px;padding-top:8px;border-top:1px solid rgba(255,255,255,0.08)">
              <span class="tiny" style="color:#FBBF24">🎁 المكافأة: ${esc(ev.rewardSummary)}</span>
              <button class="btn btn-xs btn-primary">تفاصيل التحدي</button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
};

// 16. Event Detail Page
PAGES.gameEventDetail = function(params = {}) {
  ensureGameState();
  const eventId = params.eventId;
  const ev = S.game.events.find(e => e.id === eventId) || S.game.events[0];

  setHdr("🔥 تفاصيل الفعالية", `
    <button class="iconbtn" onclick="go('gameEvents')">${I("back","i s")}</button>
  `);
  setNav("more");

  return `
    <div class="pad col" style="gap:16px;padding-bottom:90px">
      <div class="card" style="padding:20px;border-radius:22px;background:linear-gradient(135deg,#7F1D1D,#1E1B4B);text-align:center">
        <span class="badge" style="background:${ev.color};color:#fff;font-weight:900">${ev.badge}</span>
        <div class="bb lg" style="color:#fff;margin-top:8px">${esc(ev.title)}</div>
        <p class="sm" style="color:rgba(255,255,255,0.85);margin-top:8px">${esc(ev.desc)}</p>
      </div>

      <div class="card2 col" style="padding:14px;border-radius:18px;gap:8px">
        <div class="b sm">📜 شروط وقواعد الفعالية:</div>
        <div class="tiny mut">• مضاعفة جميع العملات والشظايا بنسبة 200%.</div>
        <div class="tiny mut">• فتح الصناديق الخاصة عند هزيمة زعيم المرحلة.</div>
        <div class="tiny mut">• تسجيل أعلى سكور للدخول في قائمة المتصدرين الأسبوعية.</div>
      </div>

      <button class="btn btn-primary" style="width:100%;padding:16px;border-radius:18px;font-size:18px;font-weight:900" onclick="go('gameLobby')">
        ⚔️ دخول الفعالية وبدء المعركة
      </button>
    </div>
  `;
};

// 17. Leaderboard Page
PAGES.gameLeaderboard = function() {
  ensureGameState();

  setHdr("🏆 قائمة المتصدرين · Leaderboard", `
    <button class="iconbtn" onclick="go('gamesHome')">${I("back","i s")}</button>
  `);
  setNav("more");

  return `
    <div class="pad col" style="gap:16px;padding-bottom:90px">
      <div class="col" style="gap:10px">
        ${S.game.leaderboard.map(lb => `
          <div class="card2 rowb" style="padding:14px;border-radius:18px;align-items:center">
            <div class="row" style="gap:12px;align-items:center">
              <span class="badge ${lb.rank === 1 ? 'b-gold' : lb.rank === 2 ? 'b-gray' : lb.rank === 3 ? 'b-purple' : 'b-dark'}" style="width:28px;height:28px;display:flex;align-items:center;justify-content:center;border-radius:50%;font-weight:900">
                ${lb.rank}
              </span>
              <div style="text-align:right">
                <div class="bb sm" style="color:#fff">${esc(lb.name)}</div>
                <div class="tiny mut">${esc(lb.title)} · Lv.${lb.level}</div>
              </div>
            </div>
            <div style="text-align:left">
              <div class="b sm" style="color:#38BDF8">${nfmt(lb.score)} PTS</div>
              <div class="tiny mut">${nfmt(lb.distance)} م · ${lb.kills} قتلة</div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
};

// 18. Hunter Profile Page
PAGES.gameProfile = function() {
  ensureGameState();
  const p = S.game.profile;

  setHdr("👤 ملف الصياد الشخصي", `
    <button class="iconbtn" onclick="go('gamesHome')">${I("back","i s")}</button>
  `);
  setNav("more");

  return `
    <div class="pad col" style="gap:16px;padding-bottom:90px;text-align:center">
      <div class="card" style="padding:24px 16px;border-radius:24px;background:linear-gradient(135deg,#1E1B4B,#0F172A)">
        <div style="font-size:48px;margin-bottom:8px">🥷</div>
        <div class="bb lg" style="color:#fff">${(S.me && S.me.name) || 'صياد أنمي بلاك'}</div>
        <div class="row" style="justify-content:center;gap:8px;margin-top:6px">
          <span class="badge b-cyan">${p.currentRank}</span>
          <span class="badge b-gold">المستوى ${p.hunterLevel}</span>
        </div>
      </div>

      <div class="grid grid-2" style="gap:10px">
        <div class="card2 col" style="padding:12px;border-radius:16px">
          <div class="tiny mut">🏆 أعلى سكور</div>
          <div class="bb md" style="color:#38BDF8">${nfmt(p.highScore)}</div>
        </div>
        <div class="card2 col" style="padding:12px;border-radius:16px">
          <div class="tiny mut">🏃 أطول مسافة</div>
          <div class="bb md" style="color:#34D399">${nfmt(p.bestDistance)} م</div>
        </div>
        <div class="card2 col" style="padding:12px;border-radius:16px">
          <div class="tiny mut">⚔️ إجمالي القتلات</div>
          <div class="bb md" style="color:#EF4444">${nfmt(p.totalKills)}</div>
        </div>
        <div class="card2 col" style="padding:12px;border-radius:16px">
          <div class="tiny mut">👹 الزعماء المهزومين</div>
          <div class="bb md" style="color:#FBBF24">${p.bossesDefeated} زعماء</div>
        </div>
      </div>

      <button class="btn btn-outline" style="width:100%;padding:14px;border-radius:16px" onclick="go('gamesHome')">
        العودة لمركز الألعاب
      </button>
    </div>
  `;
};

// 19. Shop Page
PAGES.gameShop = function() {
  ensureGameState();
  const p = S.game.profile;

  setHdr("🛒 متجر الصيادين · Game Shop", `
    <button class="iconbtn" onclick="go('gamesHome')">${I("back","i s")}</button>
  `);
  setNav("more");

  return `
    <div class="pad col" style="gap:16px;padding-bottom:90px">
      <div class="card2 rowb" style="padding:12px 16px;border-radius:16px">
        <span class="b sm">رصيدك:</span>
        <div class="row" style="gap:10px">
          <span class="badge b-gold mono">🪙 ${nfmt(p.coins)}</span>
          <span class="badge b-cyan mono">💎 ${nfmt(p.gems)}</span>
        </div>
      </div>

      <div class="secttl"><h3>⚡ شحن طاقة القتال</h3></div>
      <div class="card2 rowb" style="padding:14px;border-radius:18px">
        <div class="row" style="gap:10px;align-items:center">
          <span style="font-size:24px">⚡</span>
          <div style="text-align:right">
            <div class="b sm" style="color:#fff">إعادة تعبئة الطاقة بالكامل (50/50)</div>
            <div class="tiny mut">العودة للقتال فوراً دون انتظار</div>
          </div>
        </div>
        <button class="btn btn-xs btn-primary" onclick="refillEnergyWithGems()">💎 15 جوهرة</button>
      </div>

      <div class="secttl"><h3>🎁 باقات الصناديق والمواد</h3></div>
      <div class="grid grid-2" style="gap:10px">
        <div class="card2 col" style="padding:14px;border-radius:18px;gap:6px;text-align:center">
          <div style="font-size:28px">✨</div>
          <div class="b sm">حزمة 500 شظية روح</div>
          <div class="tiny mut">لتحرير التحولات</div>
          <button class="btn btn-xs btn-outline" style="margin-top:6px" onclick="buyShardsBundle()">💎 40 جوهرة</button>
        </div>
        <div class="card2 col" style="padding:14px;border-radius:18px;gap:6px;text-align:center">
          <div style="font-size:28px">👑</div>
          <div class="b sm">حزمة 10 نوى شيطانية</div>
          <div class="tiny mut">لتطوير النجوم</div>
          <button class="btn btn-xs btn-outline" style="margin-top:6px" onclick="buyCoresBundle()">💎 70 جوهرة</button>
        </div>
      </div>
    </div>
  `;
};

window.refillEnergyWithGems = function() {
  ensureGameState();
  const p = S.game.profile;
  if (p.gems < 15) {
    toast("عذراً، تحتاج إلى 15 جوهرة على الأقل لإعادة شحن الطاقة", "err");
    return;
  }
  p.gems -= 15;
  p.energy = 50;
  saveGame();
  toast("⚡ تم شحن طاقة القتال بالكامل (50/50) بنجاح!", "ok");
  go('gameShop');
};

window.buyShardsBundle = function() {
  ensureGameState();
  const p = S.game.profile;
  if (p.gems < 40) {
    toast("عذراً، لا تملك رصيد كافٍ من الجواهر", "err");
    return;
  }
  p.gems -= 40;
  const item = S.game.inventory.find(i => i.id === 'item_spirit_shard');
  if (item) item.count += 500;
  saveGame();
  toast("✨ تم شراء حزمة 500 شظية روح بنجاح!", "ok");
  go('gameShop');
};

window.buyCoresBundle = function() {
  ensureGameState();
  const p = S.game.profile;
  if (p.gems < 70) {
    toast("عذراً، لا تملك رصيد كافٍ من الجواهر", "err");
    return;
  }
  p.gems -= 70;
  const item = S.game.inventory.find(i => i.id === 'item_demon_core');
  if (item) item.count += 10;
  saveGame();
  toast("👑 تم شراء حزمة 10 نوى شيطانية بنجاح!", "ok");
  go('gameShop');
};

// 20. History Page
PAGES.gameHistory = function() {
  ensureGameState();

  setHdr("📜 سجل الجولات السابقة", `
    <button class="iconbtn" onclick="go('gamesHome')">${I("back","i s")}</button>
  `);
  setNav("more");

  return `
    <div class="pad col" style="gap:16px;padding-bottom:90px">
      <div class="col" style="gap:10px">
        ${S.game.history.map(h => `
          <div class="card2 col" style="padding:14px;border-radius:18px;gap:6px">
            <div class="rowb">
              <span class="bb sm" style="color:#fff">${esc(h.stage)}</span>
              <span class="badge ${h.bossDefeated ? 'b-emerald' : 'b-pink'}">${h.bossDefeated ? 'انتصار 🏆' : 'هزيمة ⚔️'}</span>
            </div>
            <div class="rowb">
              <span class="tiny mut">الشخصية: ${esc(h.char)}</span>
              <span class="tiny mono" style="color:#38BDF8">${nfmt(h.score)} PTS</span>
            </div>
            <div class="rowb" style="margin-top:4px;padding-top:6px;border-top:1px solid rgba(255,255,255,0.08)">
              <span class="tiny mut">${nfmt(h.distance)} م · ${h.kills} وحش</span>
              <span class="badge b-emerald" style="font-size:9.5px">✅ موثقة ومحفوظة</span>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
};

// 21. Help Page
PAGES.gameHelp = function() {
  setHdr("❓ دليل وتعليمات اللعبة", `
    <button class="iconbtn" onclick="go('gamesHome')">${I("back","i s")}</button>
  `);
  setNav("more");

  return `
    <div class="pad col" style="gap:16px;padding-bottom:90px">
      <div class="card2 col" style="padding:16px;border-radius:20px;gap:10px">
        <div class="bb md" style="color:#00A3FF">🎮 كيفية اللعب والتحكم:</div>
        <div class="sm mut" style="line-height:1.6">• <b>التنقل بين المسارات:</b> اسحب لليمين/اليسار أو استخدم الأسهم / A و D.</div>
        <div class="sm mut" style="line-height:1.6">• <b>القفز:</b> اسحب للأعلى أو زر (⬆️) لتفادي الأشواك والحمم.</div>
        <div class="sm mut" style="line-height:1.6">• <b>الانزلاق (Slide):</b> اسحب للأسفل أو زر (⬇️) للمرور تحت الحواجز العالية.</div>
        <div class="sm mut" style="line-height:1.6">• <b>الهجوم (Attack):</b> اضغط على زر (⚔️) أو مفتاح J لضرب الأعداء وجمع الكومبو.</div>
        <div class="sm mut" style="line-height:1.6">• <b>المهارة القاتلة (Skill):</b> اضغط على زر (⚡) أو مفتاح K للقضاء على جميع الأعداء في الشاشة.</div>
        <div class="sm mut" style="line-height:1.6">• <b>التحول المطلق (Transform):</b> عند اكتمال مقياس الروح 100%، اضغط على زر التحول للحصول على قوة مضاعفة ومناعة كاملة!</div>
      </div>
    </div>
  `;
};

// 22. Game Settings Page
PAGES.gameSettings = function() {
  ensureGameState();
  const st = S.game.settings;

  setHdr("⚙️ إعدادات اللعبة", `
    <button class="iconbtn" onclick="go('gamesHome')">${I("back","i s")}</button>
  `);
  setNav("more");

  return `
    <div class="pad col" style="gap:16px;padding-bottom:90px">
      <div class="card2 col" style="padding:16px;border-radius:20px;gap:14px">
        <div class="rowb">
          <span class="b sm">🔊 المؤثرات الصوتية</span>
          <input type="checkbox" ${st.sound ? 'checked' : ''} onchange="S.game.settings.sound=this.checked;saveGame()">
        </div>
        <div class="rowb">
          <span class="b sm">📳 الاهتزاز التفاعلي</span>
          <input type="checkbox" ${st.vibration ? 'checked' : ''} onchange="S.game.settings.vibration=this.checked;saveGame()">
        </div>
        <div class="rowb">
          <span class="b sm">⚡ جودة الرسوم (60 FPS)</span>
          <span class="badge b-cyan">عالية · High</span>
        </div>
      </div>

      <button class="btn btn-primary" style="width:100%;padding:14px;border-radius:16px" onclick="go('gamesHome')">
        حفظ الإعدادات
      </button>
    </div>
  `;
};
