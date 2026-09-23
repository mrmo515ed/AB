with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Update STKDEFS
old_stkdefs = 'STKDEFS={poll:()=>({t:"poll",q:"",opts:[],votes:[]}),ask:()=>({t:"ask",q:"",answers:[]}),count:()=>({t:"count",label:"",target:0}),loc:()=>({t:"loc",v:""}),music:()=>({t:"music",v:""}),tag:()=>({t:"tag",v:""})};'
new_stkdefs = 'STKDEFS={poll:()=>({t:"poll",q:"",opts:[],votes:[]}),ask:()=>({t:"ask",q:"",answers:[]}),count:()=>({t:"count",label:"",target:0}),loc:()=>({t:"loc",v:""}),music:()=>({t:"music",v:""}),tag:()=>({t:"tag",v:""}),link:()=>({t:"link",url:"",label:""})};'
if old_stkdefs in text:
    text = text.replace(old_stkdefs, new_stkdefs, 1)
    print("Updated STKDEFS with link")

# 2. Update stkCommit to parse link
old_tag_commit = 'if(v[0]!=="@")v="@"+v; o={t:"tag",v};  }'
new_tag_commit = 'if(v[0]!=="@")v="@"+v; o={t:"tag",v};  } else if(k==="link"){ let u=val("stk_q"), l=val("stk_o1")||"رابط خارجي"; if(!u){toast("أدخل رابط الويب أولاً","err");return} if(!/^https?:\\/\\//i.test(u))u="https://"+u; o={t:"link",url:u,label:l}; }'
if old_tag_commit in text:
    text = text.replace(old_tag_commit, new_tag_commit, 1)
    print("Updated stkCommit with link")

# 3. Update SHEETS.stkEditSheet
old_meta = 'const META={poll:["barchart","استطلاع"],ask:["help","صندوق سؤال"],count:["clock","عدّاد تنازلي"],              loc:["map","موقع"],music:["music","موسيقى"],tag:["at","إشارة لصديق"]}[k]||["barchart","ملصق"];'
new_meta = 'const META={poll:["barchart","استطلاع"],ask:["help","صندوق سؤال"],count:["clock","عدّاد تنازلي"],              loc:["map","موقع"],music:["music","موسيقى"],tag:["at","إشارة لصديق"],link:["link","رابط ويب"]}[k]||["barchart","ملصق"];'
if old_meta in text:
    text = text.replace(old_meta, new_meta, 1)
    print("Updated META in stkEditSheet")

old_tag_body = 'else if(k==="tag") body=`    <div class="lbl">اسم المستخدم</div>    <input class="inp" id="stk_q" placeholder="@username" maxlength="40" autofocus>`;'
new_tag_body = 'else if(k==="tag") body=`    <div class="lbl">اسم المستخدم</div>    <input class="inp" id="stk_q" placeholder="@username" maxlength="40" autofocus>`;  else if(k==="link") body=`    <div class="lbl">رابط الويب (URL)</div>    <input class="inp" id="stk_q" placeholder="https://example.com" maxlength="150" autofocus>    <div class="lbl" style="margin-top:11px">عنوان الزر</div>    <input class="inp" id="stk_o1" placeholder="مثال: مشاهدة الحلقة أو زيارة الموقع" maxlength="40">`;'
if old_tag_body in text:
    text = text.replace(old_tag_body, new_tag_body, 1)
    print("Updated body in stkEditSheet")

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(text)

print("Add link sticker complete.")
