with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

import re

# Fix nav
old_nav_css = ".nav{background:rgba(255,255,255,0.85)!important;\n  border-top:1px solid rgba(0,0,0,0.06)!important;box-shadow:0 -8px 24px rgba(0,0,0,0.06)!important}"
new_nav_css = ".nav{background:rgba(18,18,26,0.85)!important;backdrop-filter:blur(20px)!important;\n  border-top:1px solid rgba(255,255,255,0.06)!important;box-shadow:0 -8px 32px rgba(0,0,0,0.3)!important}\nbody.light .nav{background:rgba(255,255,255,0.85)!important;border-top:1px solid rgba(0,0,0,0.06)!important;box-shadow:0 -8px 24px rgba(0,0,0,0.06)!important}"
if old_nav_css in text:
    text = text.replace(old_nav_css, new_nav_css)

# Fix sheet
old_sheet = ".sheet{position:fixed;left:0;right:0;bottom:0;z-index:10010;background:linear-gradient(180deg,#161624 0%,#0E0E16 100%);border-top:1px solid rgba(0,163,255,0.22);border-radius:24px 24px 0 0;padding:10px 16px calc(22px + env(safe-area-inset-bottom));max-height:88vh;display:flex;flex-direction:column;animation:up .28s cubic-bezier(.16,1,.3,1);box-shadow:0 -16px 48px rgba(0,0,0,.75),0 0 30px rgba(0,163,255,0.06)}"
new_sheet = ".sheet{position:fixed;left:0;right:0;bottom:0;z-index:10010;background:rgba(22,22,32,0.9);backdrop-filter:blur(16px);border-top:1px solid rgba(255,255,255,0.1);border-radius:28px 28px 0 0;padding:12px 18px calc(24px + env(safe-area-inset-bottom));max-height:90vh;display:flex;flex-direction:column;animation:up .28s cubic-bezier(.16,1,.3,1);box-shadow:0 -16px 48px rgba(0,0,0,.5),0 0 40px rgba(0,163,255,0.1)}\nbody.light .sheet{background:rgba(255,255,255,0.95);border-top:1px solid rgba(0,0,0,0.1);box-shadow:0 -16px 48px rgba(0,0,0,.1)}"
if old_sheet in text:
    text = text.replace(old_sheet, new_sheet)

# Fix tabs
old_tabs_css = ".tabs button{padding:9px 16px;border-radius:14px;font-size:12px;font-weight:800;color:var(--muted);background:linear-gradient(145deg,rgba(26,26,36,0.7),rgba(18,18,26,0.85));border:1px solid rgba(255,255,255,0.06);white-space:nowrap;transition:.18s;box-shadow:0 2px 8px rgba(0,0,0,0.15)}"
new_tabs_css = ".tabs button{padding:10px 18px;border-radius:99px;font-size:13px;font-weight:800;color:var(--muted);background:rgba(28,28,42,0.6);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,0.08);white-space:nowrap;transition:all .2s ease;box-shadow:0 2px 8px rgba(0,0,0,0.1)}"
if old_tabs_css in text:
    text = text.replace(old_tabs_css, new_tabs_css)

# Fix light mode tabs (which are forcefully applying light styles everywhere)
old_tabs_light = ".tabs button{background:#fff;border:1px solid rgba(0,0,0,0.07)}"
new_tabs_light = "body.light .tabs button{background:#fff;border:1px solid rgba(0,0,0,0.07)}"
if old_tabs_light in text:
    text = text.replace(old_tabs_light, new_tabs_light)

# Fix chip light mode
old_chip_light = ".chip{background:#fff;border:1px solid rgba(0,0,0,0.08)}"
new_chip_light = "body.light .chip{background:#fff;border:1px solid rgba(0,0,0,0.08)}"
if old_chip_light in text:
    text = text.replace(old_chip_light, new_chip_light)

# Fix red alert variable
text = text.replace('--alert:#E11D48;', '--alert:#EC4899;')
text = text.replace('--alert-2:#BE123C;', '--alert-2:#BE185D;')
text = text.replace('rgba(225,29,72', 'rgba(236,72,153')
text = text.replace('#E11D48', '#EC4899')
text = text.replace('#F43F5E', '#F472B6')
text = text.replace('#BE123C', '#BE185D')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(text)
print("Structural CSS updated!")
