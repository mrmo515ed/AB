import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

old_code = """<div class="tiny fnt">@${esc(au.username)} · ${postDateTimeStr(p.createdAt || p.at)}${p.isEdited || p.edited ? " · عُدّل" : ""} · ${I(p.privacy==="private"?"lock":p.privacy==="followers"?"at":"globe","i s")}${p.category && p.category !== 'عام' ? ` · <span class="badge b-purple" style="font-size:9.5px;padding:1px 5px">${esc(p.category)}</span>` : ""}</div>"""
new_code = """<div class="tiny fnt">@${esc(au.username)} · ${postDateTimeStr(p.createdAt || p.at)}${p.isEdited || p.edited ? " · عُدّل" : ""} · ${I(p.privacy==="private"?"lock":p.privacy==="followers"?"at":"globe","i s")}${p.category && p.category !== 'عام' ? ` · <span class="badge b-purple" style="font-size:9.5px;padding:1px 5px">${esc(p.category)}</span>` : ""}${p.pending ? ` · <span class="badge b-gold" style="font-size:9.5px;padding:1px 5px" id="pend_${p.id}">${p.failed ? 'فشل النشر' : 'قيد الإرسال...'}</span>` : ""}</div>"""

if "id=\"pend_" not in old_code and "id=\"pend_" in new_code:
    content = content.replace(old_code, new_code)
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(content)
        print("Patched postCard to show pending status")
