import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update feed stories ss.userId checks:
old_feed_mine = 'const mine=(S.stories||[]).find(ss=>ss.userId==="me");'
new_feed_mine = 'const mine=(S.stories||[]).find(ss=>isMe(ss.userId));'
if old_feed_mine in content:
    content = content.replace(old_feed_mine, new_feed_mine, 1)
    print("Fixed feed mine check")

old_feed_others = '${S.stories.filter(ss=>ss.userId!=="me").map('
new_feed_others = '${S.stories.filter(ss=>!isMe(ss.userId)&&canViewStory(ss)).map('
if old_feed_others in content:
    content = content.replace(old_feed_others, new_feed_others, 1)
    print("Fixed feed others check")

# 2. Fix _(st.items||[]).length typo on line 9137
old_typo = '_(st.items||[]).length'
new_typo = '(st.items||[]).length'
if old_typo in content:
    content = content.replace(old_typo, new_typo)
    print("Fixed _(st.items||[]).length typo")

# 3. Add link in PAGES.devCenter
devcenter_needle = '<div class="pad col">\n    <div class="card" style="padding:12px;margin-bottom:12px"><div class="rowb"><div><div class="b sm">محاكاة الشبكة</div>'
if devcenter_needle not in content:
    devcenter_needle = '<div class="pad col">    <div class="card" style="padding:12px;margin-bottom:12px"><div class="rowb"><div><div class="b sm">محاكاة الشبكة</div>'

devcenter_replacement = '''<div class="pad col">    <div class="card" style="padding:13px;margin-bottom:12px;background:linear-gradient(135deg,rgba(16,185,129,.12),rgba(6,182,212,.08));border:1px solid rgba(16,185,129,.3)"><div class="rowb"><div><div class="b sm" style="color:var(--emerald);display:flex;align-items:center;gap:6px">${I("activity","i s")} مراقبة صحة الخادم وقاعدة البيانات (Server Health Dashboard)</div><div class="tiny fnt" style="margin-top:4px">قياس زمن الاستجابة اللحظي (Latency)، أداء استعلامات Firestore، رصد عنق الزجاجة، وعدد المستخدمين النشطين</div></div><button class="btn btn-primary btn-sm" style="flex-shrink:0;background:var(--emerald);border:none" onclick="go('serverHealth')">${I("trend","i s")} فتح اللوحة</button></div></div>    <div class="card" style="padding:12px;margin-bottom:12px"><div class="rowb"><div><div class="b sm">محاكاة الشبكة</div>'''

if devcenter_needle in content:
    content = content.replace(devcenter_needle, devcenter_replacement, 1)
    print("Added serverHealth card to PAGES.devCenter")

# 4. Add link in PAGES.admin
admin_telemetry_needle = '''<button class="btn btn-sec btn-xs" onclick="toast('تم تحديث البيانات اللحظية بنجاح ','ok');snd('success');render()" title="تحديث">${I("refresh","i s")} تحديث</button>'''
admin_telemetry_replacement = '''<button class="btn btn-sec btn-xs" onclick="go('serverHealth')" title="صحة السيرفر" style="border-color:var(--emerald);color:var(--emerald);font-weight:700">${I("activity","i s")} صحة السيرفر</button>          <button class="btn btn-sec btn-xs" onclick="toast('تم تحديث البيانات اللحظية بنجاح ','ok');snd('success');render()" title="تحديث">${I("refresh","i s")} تحديث</button>'''
if admin_telemetry_needle in content:
    content = content.replace(admin_telemetry_needle, admin_telemetry_replacement, 1)
    print("Added serverHealth button to PAGES.admin")

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Pass 1 finished.")
