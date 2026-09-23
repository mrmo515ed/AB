import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

sheet_old = """SHEETS.attachSheet=()=>sheet(I("plus","i s")+" إرفاق",`
  <div class="grid4">${[["image","صورة","var(--grad-cyan)"],["video","فيديو","var(--grad-purple)"],["camera","كاميرا","var(--grad-fire)"],["mic","صوت","var(--grad-emerald)"],
   ["file","ملف","var(--grad-gold)"],["map","موقع","#0F766E"],["user","جهة اتصال","#BE185D"],["barchart","استطلاع","#4338CA","poll"]].map(([ic,l,g,k2])=>`
    <button class="col center" style="gap:6px" onclick="attachToChat('${k2||ic}')">
      <span class="ico-tile" style="width:48px;height:48px;border-radius:16px;background:${g};color:#fff">${I(ic,"l")}</span>
      <span class="tiny b" style="font-size:9.5px">${l}</span></button>`).join("")}</div>`);"""

sheet_new = """SHEETS.attachSheet=()=>sheet(I("plus","i s")+" إضافة مرفق",`
  <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;padding:10px 4px">${[["image","صورة","linear-gradient(135deg, #06B6D4, #3B82F6)"],["video","فيديو","linear-gradient(135deg, #A855F7, #EC4899)"],["camera","كاميرا","linear-gradient(135deg, #F59E0B, #EA580C)"],["mic","صوت","linear-gradient(135deg, #10B981, #059669)"],
   ["file","ملف","linear-gradient(135deg, #64748B, #475569)"],["map","موقع","linear-gradient(135deg, #14B8A6, #0F766E)"],["user","جهة اتصال","linear-gradient(135deg, #F43F5E, #BE185D)"],["barchart","استطلاع","linear-gradient(135deg, #6366F1, #4338CA)","poll"]].map(([ic,l,g,k2])=>`
    <button class="col center" style="gap:8px;background:none;border:none;padding:0" onclick="attachToChat('${k2||ic}')">
      <span style="width:56px;height:56px;border-radius:18px;background:${g};color:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 6px 12px rgba(0,0,0,0.15);transition:transform 0.2s">${I(ic,"xl")}</span>
      <span class="tiny b" style="font-size:11px;color:var(--text);opacity:0.9">${l}</span></button>`).join("")}</div>`);"""

content = content.replace(sheet_old, sheet_new)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)
    print("Patched attachSheet")
