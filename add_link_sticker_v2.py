import re

with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Update stkCommit to include link
old_commit_pattern = r'(if\(v\[0\]!=="@"\)v="@"\+v;\s*o=\{t:"tag",v\};\s*\})'
new_commit_code = r'''\1 else if(k==="link"){ let u=val("stk_q"), l=val("stk_o1")||"رابط خارجي"; if(!u){toast("أدخل رابط الويب أولاً","err");return} if(!/^https?:\/\//i.test(u))u="https://"+u; o={t:"link",url:u,label:l}; }'''

text = re.sub(old_commit_pattern, new_commit_code, text, count=1)

# 2. Update META in stkEditSheet
old_meta_pattern = r'tag:\["at","إشارة لصديق"\]\}\[k\]'
new_meta_code = r'tag:["at","إشارة لصديق"],link:["link","رابط ويب"]}[k]'
text = re.sub(old_meta_pattern, new_meta_code, text, count=1)

# 3. Update body in stkEditSheet
old_tag_body_pattern = r'(else if\(k==="tag"\) body=`[^`]+`;)'
new_tag_body_code = r'''\1  else if(k==="link") body=`\n    <div class="lbl">رابط الويب (URL)</div>\n    <input class="inp" id="stk_q" placeholder="https://example.com" maxlength="150" autofocus>\n    <div class="lbl" style="margin-top:11px">عنوان الزر</div>\n    <input class="inp" id="stk_o1" placeholder="مثال: مشاهدة الحلقة أو زيارة الموقع" maxlength="40">`;'''
text = re.sub(old_tag_body_pattern, new_tag_body_code, text, count=1)

# 4. Update stkView link handler
old_stkview_end = r'(const icn=sk\.t==="loc"\?"map":sk\.t==="music"\?"music":"at";)'
new_stkview_end = r'''if(sk.t==="link"){
    return `<div style="${base};display:flex;align-items:center;justify-content:space-between" class="row">
      <div class="row" style="gap:8px"><span style="color:#fff">${I("link","i s")}</span><span class="b tiny">${esc(sk.label||sk.url||"رابط")}</span></div>
      <a href="${esc(sk.url)}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-xs" style="padding:4px 8px;font-size:10px" onclick="event.stopPropagation()">زيارة</a>
    </div>`;
  }
  \1'''
text = re.sub(old_stkview_end, new_stkview_end, text, count=1)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(text)

print("Finished adding link sticker v2!")
