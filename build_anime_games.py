#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Anime Black Games System Generator
Integrates Anime Hunter (Action Runner + Combat + Transformations + Bosses + Economy + Admin)
into Anime Black v25.
"""

import re
import sys

def main():
    with open("index.html", "r", encoding="utf-8") as f:
        html = f.read()

    print("Current index.html size:", len(html))

    # 1. Check if GAMES card is already in PAGES.more or if we need to insert it
    # We will insert the prominent Play & Win card into PAGES.more right below the profile card or above quick shortcuts
    card_marker = '<!-- ANIME BLACK GAMES CARD -->'
    
    games_card_html = """
    <!-- ANIME BLACK GAMES CARD -->
    <div style="margin: 14px 0 6px;">
      <div class="card" onclick="go('gamesHome')" style="position:relative;overflow:hidden;padding:16px;cursor:pointer;border-radius:20px;background:linear-gradient(135deg,#1E1B4B 0%,#312E81 40%,#4338CA 70%,#00A3FF 100%);border:1px solid rgba(0,163,255,0.45);box-shadow:0 12px 36px rgba(0,163,255,0.28),inset 0 1px 0 rgba(255,255,255,0.25);transition:all .25s ease" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='none'">
        <div style="position:absolute;top:-20px;left:-20px;width:120px;height:120px;background:radial-gradient(circle,rgba(236,72,153,0.35) 0%,transparent 70%);pointer-events:none"></div>
        <div style="position:absolute;bottom:-30px;right:20%;width:140px;height:140px;background:radial-gradient(circle,rgba(0,163,255,0.3) 0%,transparent 70%);pointer-events:none"></div>
        
        <div class="rowb" style="margin-bottom:10px;position:relative;z-index:2">
          <div class="row" style="gap:8px">
            <span class="badge" style="background:linear-gradient(135deg,#EC4899,#EF4444);color:#fff;font-weight:900;padding:4px 10px;border-radius:10px;font-size:11px;box-shadow:0 4px 12px rgba(236,72,153,0.4)">🔥 ألعاب واربح · REWARDS</span>
            <span class="badge b-gold" style="font-weight:800;font-size:10.5px">الموسم الأول ⚔️</span>
          </div>
          <span class="badge b-cyan mono" style="font-weight:900;font-size:11px">${(S.game && S.game.profile && S.game.profile.currentRank) || 'E-Rank Hunter'}</span>
        </div>

        <div class="row" style="gap:14px;position:relative;z-index:2">
          <div style="width:58px;height:58px;border-radius:18px;background:linear-gradient(135deg,#06B6D4,#3B82F6 50%,#8B5CF6);display:flex;align-items:center;justify-content:center;box-shadow:0 8px 24px rgba(6,182,212,0.45);flex-shrink:0;border:2px solid rgba(255,255,255,0.3)">
            <span style="font-size:32px;line-height:1">🎮</span>
          </div>
          <div class="g1" style="min-width:0;text-align:right">
            <div class="row" style="gap:6px;align-items:center">
              <span class="bb md" style="color:#fff;font-size:18px;letter-spacing:.3px">Anime Hunter — صياد الأنمي</span>
              <span class="badge b-emerald" style="font-size:9.5px">جديد 🔥</span>
            </div>
            <div class="tiny" style="color:rgba(255,255,255,0.85);margin-top:3px;line-height:1.4">لعبة قتال وجري لا نهائي · اجمع العملات والجواهر، طوّر شخصياتك، واهزم الزعماء واربح جوائز حقيقية!</div>
          </div>
        </div>

        <div class="rowb" style="margin-top:14px;padding-top:10px;border-top:1px solid rgba(255,255,255,0.14);position:relative;z-index:2">
          <div class="row" style="gap:10px">
            <span class="badge" style="background:rgba(0,0,0,0.4);color:#FBBF24;font-size:11px;padding:4px 8px;border-radius:8px">🪙 ${nfmt((S.game && S.game.profile && S.game.profile.coins) || 500)}</span>
            <span class="badge" style="background:rgba(0,0,0,0.4);color:#67E8F9;font-size:11px;padding:4px 8px;border-radius:8px">💎 ${(S.game && S.game.profile && S.game.profile.gems) || 25}</span>
            <span class="badge" style="background:rgba(0,0,0,0.4);color:#34D399;font-size:11px;padding:4px 8px;border-radius:8px">⚡ ${(S.game && S.game.profile && S.game.profile.energy) || 50}/50</span>
          </div>
          <button class="btn btn-primary btn-xs" style="background:linear-gradient(135deg,#EC4899,#8B5CF6);border:none;box-shadow:0 4px 16px rgba(236,72,153,0.5);font-weight:900;padding:6px 14px;border-radius:12px;gap:6px" onclick="event.stopPropagation();go('gamesHome')">
            <span>العب واربح</span> ${I("fwd","i s")}
          </button>
        </div>
      </div>
    </div>
"""

    if card_marker not in html:
        # Insert before <div class="secttl"><h3>${I("zap","i s")} الاختصارات السريعة</h3>
        target = '<div class="secttl"><h3>${I("zap","i s")} الاختصارات السريعة</h3>'
        if target in html:
            html = html.replace(target, games_card_html + '\n    ' + target, 1)
            print("Successfully injected Play & Win card into PAGES.more")
        else:
            print("Warning: quick shortcuts marker not found, checking alternatives")

    # 2. Add 'games' to HUB_CATS and HUB_GROUPS if not present
    if '["games","ألعاب واربح","gamepad"]' not in html:
        html = html.replace('["economy","متجر الاقتصاد","coins"],', '["games","ألعاب واربح","gamepad"],\n   ["economy","متجر الاقتصاد","coins"],')
        print("Injected games into HUB_CATS")

    if 'games:"gamesHome"' not in html:
        html = html.replace('economy:"economy",activity:"activity",', 'games:"gamesHome",economy:"economy",activity:"activity",')
        print("Injected games into hubCat map")

    # Add games shortcut to hubGo map
    if '"games-hub":"gamesHome"' not in html:
        html = html.replace('economy_store:"economy",', 'economy_store:"economy","games-hub":"gamesHome",')

    # Add to HUB_GROUPS under activities
    if '["games-hub","ألعاب واربح · Anime Hunter"' not in html:
        target_grp = '["economy_store","متجر الاقتصاد والإطارات","شراء إطارات وتفعيل ألقاب","coins"],'
        replacement_grp = '["games-hub","ألعاب واربح · Anime Hunter","لعبة القتال والجري وجمع الجواهر والزعماء","gamepad"],\n   ' + target_grp
        html = html.replace(target_grp, replacement_grp, 1)
        print("Injected games into HUB_GROUPS")

    with open("index.html", "w", encoding="utf-8") as f:
        f.write(html)
    print("Base updates saved.")

if __name__ == "__main__":
    main()
