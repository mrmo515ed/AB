# -*- coding: utf-8 -*-
"""Task-3 patch: dynamic overflow menus + specialized room chats + PWA polish.
Every replacement asserts its expected match count first. Aborts on any mismatch."""
import io, sys, json

P = "index.html"
src = io.open(P, encoding="utf-8").read()
orig_len = len(src)
steps = []

def rep(old, new, expect=1, label=""):
    global src
    n = src.count(old)
    if n != expect:
        print("FAIL [%s]: found %d (expected %d) of:\n  %s" % (label, n, expect, old[:120]))
        sys.exit(1)
    src = src.replace(old, new)
    steps.append("OK  [%s] x%d" % (label, expect))

def ins_before(anchor, block, expect=1, label=""):
    rep(anchor, block + anchor, expect, label)

# ============================================================
# 1) Core infrastructure + specialized chat features (one big block)
#    inserted right before SHEETS.roomMsgMenu
# ============================================================
INFRA = r'''/* ===================== v7.3 — قوائم فائضة موحّدة + دردشات متخصصة ===================== */
function openDynSheet(html){const el=$("#ovl");if(!el)return;el.innerHTML=html;snd("tap")}
const MORES={};
function moreRowsHTML(its){return its.map((it,i)=>`<button class="lstrow" style="padding:11px;gap:11px" onclick="moreRun(${i})"><span class="ico-tile" style="width:34px;height:34px;border-radius:10px;flex-shrink:0;background:${it.danger?'rgba(244,63,94,.12)':'var(--surface2)'};color:${it.danger?'var(--rose)':(it.color||'var(--accent)')}">${I(it.ic||"more","i s")}</span><span class="g1" style="text-align:right;min-width:0"><span class="b xs" style="display:block;${it.danger?'color:var(--rose)':''}">${esc(it.label)}</span>${it.desc?`<span class="tiny fnt" style="display:block;margin-top:2px">${esc(it.desc)}</span>`:""}</span></button>`).join("")}
function openMoreMenu(kind,arg){const b=MORES[kind];if(!b)return toast("القائمة غير متاحة","err");const its=b(arg);if(!its||!its.length)return toast("لا خيارات إضافية حالياً","info");window.__moreItems=its;openDynSheet(sheet(I("more","i s")+" "+(its.title||"خيارات إضافية"),`<div class="col">${moreRowsHTML(its)}</div>`))}
function moreRun(i){const its=window.__moreItems||[];const it=its[i];if(!it)return;closeOvl();setTimeout(()=>{try{if(typeof it.act==="function")it.act()}catch(e){toast("تعذّر تنفيذ الإجراء","err")}},50)}
function moreBtnV(kind,arg,title){return `<button class="iconbtn" title="${title||"المزيد من الخيارات"}" aria-label="${title||"خيارات أكثر"}" onclick="openMoreMenu('${kind}','${String(arg==null?"":arg).replace(/'/g,"\\'")}')"><span style="display:inline-flex;align-items:center;gap:1px">${I("more","i s")}<span style="font-size:9px;opacity:.75;display:inline-flex">${I("chevdown","i s")}</span></span></button>`}
/* ---- قائمة المحادثة الخاصة الفائضة (مكالمات + خيارات) ---- */
MORES.chatRoom=(id)=>{const c=(S.chats||[]).find(x=>x.id===id);if(!c)return[];const its=[];
  its.push({ic:"phone",label:"مكالمة صوتية",desc:"اتصال فوري بالصوت",color:"var(--emerald)",act:()=>startCall(id,"voice")});
  its.push({ic:"video",label:"مكالمة فيديو",desc:"اتصال بالكاميرا",color:"var(--cyan)",act:()=>startCall(id,"video")});
  its.push({ic:"search",label:"بحث في المحادثة",desc:"الوصول لأي رسالة سابقة",act:()=>openSheet("chatSearch",id)});
  its.push({ic:"settings",label:"خيارات المحادثة",desc:"كتم، تثبيت، حظر، وسائط",act:()=>openSheet("chatRoomMenu",id)});
  its.push({ic:"user",label:"ملف المستخدم",desc:"عرض الملف الشخصي الكامل",act:()=>{const cc=(S.chats||[]).find(x=>x.id===id);if(cc)openProfile(cc.userId)}});
  its.title="مكالمات وخيارات المحادثة";return its};
/* ---- قائمة وضع التحديد ---- */
MORES.selActions=()=>{const n=(S.selIds||[]).length;const cid=S.activeChat||(S.params&&S.params.id);const c=(S.chats||[]).find(x=>x.id===cid);const its=[];
  its.push({ic:"star",label:"تمييز الرسائل",desc:n+" رسالة محددة",color:"var(--gold)",act:()=>starSel()});
  its.push({ic:"copy",label:"نسخ النصوص",desc:"نسخ نصوص الرسائل المحددة",act:()=>{const txt=(c?(c.messages||[]):[]).filter(m=>(S.selIds||[]).includes(m.id)).map(m=>m.text||"").filter(Boolean).join("\n");try{if(navigator.clipboard)navigator.clipboard.writeText(txt)}catch(e){}toast("نُسخ "+txt.length+" حرفاً","ok")}});
  its.push({ic:"checksq",label:"تحديد الكل",desc:"تحديد آخر ١٠٠ رسالة",act:()=>{if(c){S.selIds=(c.messages||[]).map(m=>m.id).slice(-100);render()}}});
  its.push({ic:"x",label:"إلغاء التحديد",desc:"الخروج من وضع التحديد",act:()=>{S.selMode=false;S.selIds=[];render()}});
  its.title="خيارات التحديد";return its};
/* ---- تفاعلات رسائل الغرف (قروبات وعوالم) ---- */
const ROOM_REACTS=[["love","face-love","#f43f5e"],["laugh","face-laugh","#f59e0b"],["wow","face-wow","#06b6d4"],["angry","face-angry","#ef4444"],["cry","face-cry","#a78bfa"],["fire","flame","#f97316"],["party","party","#10b981"],["swords","swords","#e879f9"]];
const ROOM_REACT_NAMES={love:"محبة",laugh:"ضحك",wow:"دهشة",angry:"غضب",cry:"حزن",fire:"حماس",party:"احتفال",swords:"تحدي"};
function roomReactBar(m){const r=m&&m.reacts;if(!r)return"";const keys=Object.keys(r).filter(k=>(r[k]||[]).length);if(!keys.length)return"";
  return `<div class="row" style="gap:5px;margin-top:5px;flex-wrap:wrap">${keys.map(k=>{const arr=r[k]||[];const mine=arr.includes("me");const def=ROOM_REACTS.find(x=>x[0]===k);const ic=def?def[1]:"heart";
  return `<button class="badge ${mine?"b-accent":"b-gray"}" style="display:inline-flex;align-items:center;gap:4px;padding:3px 8px;border:1px solid ${mine?"var(--accent)":"var(--line)"}" onclick="event.stopPropagation();roomReact('${m.id}','${k}')">${I(ic,"i s")}<span class="mono tiny">${arr.length}</span></button>`}).join("")}</div>`}
function roomReact(mid,k){const m=msgById(mid);if(!m)return;m.reacts=m.reacts||{};const arr=m.reacts[k]=m.reacts[k]||[];const ix=arr.indexOf("me");
  if(ix>=0)arr.splice(ix,1);else{arr.push("me");snd("tap")}save();closeOvl();render();toast(ix>=0?"أُزيل تفاعلك":"أُضيف تفاعلك","ok")}
function roomEditMsg(mid){const m=msgById(mid);if(!m)return;if((m.uid||m.senderId||"me")!=="me"){toast("يمكنك تعديل رسائلك فقط","err");return}
  const t=prompt("تعديل الرسالة:",m.text||"");if(t==null)return;if(!t.trim()){toast("النص فارغ","err");return}
  m.text=t.trim().slice(0,4000);m.edited=true;save();closeOvl();render();toast("عُدّلت الرسالة","ok")}
SHEETS.roomReactPick=(mid)=>sheet(I("face-love","i s")+" تفاعل مع الرسالة",`<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:9px">${ROOM_REACTS.map(([k,ic,c])=>`<button class="btn btn-sec" style="flex-direction:column;gap:6px;padding:13px 6px;color:${c}" onclick="closeOvl();roomReact('${mid}','${k}')">${I(ic,"i l")}<span class="tiny b">${ROOM_REACT_NAMES[k]}</span></button>`).join("")}</div>`);
SHEETS.imgView=(src)=>modal(I("image","i s")+" عرض الصورة",`<img src="${src}" style="max-width:100%;border-radius:12px;display:block;margin:0 auto" alt="">`);
/* ---- إحصائيات ومعرض وبحث القروب ---- */
SHEETS.groupStats=(id)=>{const g=(S.groups||[]).find(x=>x.id===id);if(!g)return sheet("الإحصائيات","<div class='tiny fnt'>لا قروب</div>");
  const msgs=g.msgs||[];const media=msgs.filter(m=>m.type==="image"||m.type==="video").length;const voice=msgs.filter(m=>m.type==="voice").length;
  const polls=msgs.filter(m=>m.type==="cpoll").length;const day=msgs.filter(m=>now()-(m.at||0)<86400000).length;const by={};
  msgs.forEach(m=>{const k=(m.uid||m.senderId||"me");by[k]=(by[k]||0)+1});
  const top=Object.entries(by).sort((a,b)=>b[1]-a[1]).slice(0,5);
  return sheet(I("barchart","i s")+" إحصائيات "+esc(g.name),`<div class="col">
  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">
  ${[["msgsq",msgs.length,"رسالة"],["users",(g.members||[]).length,"عضو"],["zap",day,"نشاط ٢٤س"],["image",media,"وسائط"],["mic",voice,"صوتيات"],["help",polls,"استفتاءات"]].map(([ic,n,l])=>`<div class="card2" style="padding:10px;text-align:center"><span style="color:var(--accent);line-height:0">${I(ic,"i s")}</span><div class="b sm mono" style="margin-top:5px">${nfmt(n)}</div><div class="tiny fnt">${l}</div></div>`).join("")}
  </div>
  <div class="lbl" style="margin-top:12px">أكثر المشاركين</div>
  ${top.map(([k,n],i)=>{const uu=k==="me"?S.me:(u(k)||{});return `<div class="row" style="padding:7px 2px;border-bottom:1px solid var(--line)"><span class="tiny mono" style="width:16px">${i+1}</span><span>${av(uu,30)}</span><span class="g1 b xs">${k==="me"?"أنت":esc(uu.name||"عضو")}</span><span class="badge b-gray mono">${n}</span></div>`}).join("")||`<div class="tiny fnt mut">لا رسائل بعد</div>`}
  </div>`)};
SHEETS.groupMedia=(id)=>{const g=(S.groups||[]).find(x=>x.id===id);if(!g)return sheet("المعرض","<div class='tiny fnt'>لا قروب</div>");
  const items=(g.msgs||[]).filter(m=>m.type==="image"||m.type==="video");window.__gMedia=items;
  return sheet(I("image","i s")+" معرض وسائط "+esc(g.name),items.length?`<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px">${items.map((m,i)=>m.type==="image"?`<button style="padding:0;border:1px solid var(--line);border-radius:10px;overflow:hidden;line-height:0;background:none" onclick="openSheet('imgView',window.__gMedia[${i}].src)"><img loading="lazy" src="${m.src}" style="width:100%;aspect-ratio:1;object-fit:cover" alt=""></button>`:`<video src="${m.src}" controls preload="metadata" style="width:100%;border-radius:10px"></video>`).join("")}</div>`:`<div class="empty">${I("image","l")}<div class="xs b">لا وسائط بعد</div><div class="tiny fnt">الصور ومقاطع الفيديو المرسلة هنا تظهر في هذا المعرض</div></div>`)};
SHEETS.groupSearch=(id)=>{const g=(S.groups||[]).find(x=>x.id===id);if(!g)return sheet("بحث","<div class='tiny fnt'>لا قروب</div>");
  return sheet(I("search","i s")+" بحث في "+esc(g.name),`<div class="col"><div class="row" style="gap:7px"><input class="inp g1" id="gsq_in" placeholder="اكتب كلمة للبحث..." autocomplete="off"><button class="btn btn-primary btn-sm" onclick="groupSearchRun('${id}')">${I("search","i s")}</button></div><div id="gsq_res" style="margin-top:9px"><div class="tiny fnt mut">ابحث في كل رسائل القروب</div></div></div>`)};
function groupSearchRun(id){const g=(S.groups||[]).find(x=>x.id===id);if(!g)return;const box=$("#gsq_res");if(!box)return;
  const q=((($("#gsq_in")||{}).value)||"").trim().toLowerCase();
  if(!q){box.innerHTML=`<div class="tiny fnt mut">اكتب كلمة أولاً</div>`;return}
  const hits=(g.msgs||[]).filter(m=>(((m.text||"")+" "+(m.name||""))).toLowerCase().includes(q)).slice(-30).reverse();
  box.innerHTML=hits.length?hits.map(m=>{const me=(m.uid||m.senderId)==="me";const uu=me?S.me:(u(m.uid||m.senderId)||{});
  return `<div class="card2 row" style="gap:8px;padding:8px 10px;margin-bottom:6px"><span>${av(uu,26)}</span><span class="g1" style="min-width:0"><span class="b xs" style="display:block">${me?"أنت":esc(uu.name||"عضو")}</span><span class="tiny" style="display:block;word-break:break-word">${linkify(String(m.text||"").slice(0,140))}</span></span><span class="tiny fnt mono">${hhmm(m.at)}</span></div>`}).join(""):`<div class="tiny fnt mut">لا نتائج عن "${esc(q)}"</div>`}
/* ---- فعاليات العالم ولوحة النشاط ---- */
SHEETS.worldEvents=(id)=>{const w=(S.worlds||[]).find(x=>x.id===id);if(!w)return sheet("الفعاليات","<div class='tiny fnt'>لا عالم</div>");w.events=w.events||[];
  return sheet(I("calendar","i s")+" فعاليات "+esc(w.name),`<div class="col">
  ${w.events.length?w.events.map((e,i)=>`<div class="card2" style="padding:10px;margin-bottom:7px"><div class="row" style="gap:8px"><span style="color:var(--gold);line-height:0">${I("calendar","i s")}</span><span class="g1" style="min-width:0"><span class="b xs">${esc(e.t)}</span>${e.d?`<span class="tiny fnt" style="display:block">${esc(e.d)}</span>`:""}${e.at?`<span class="tiny fnt mono" style="display:block">${new Date(e.at).toLocaleString("ar")}</span>`:""}</span>${w.owner==="me"?`<button class="iconbtn" style="width:28px;height:28px" onclick="wEvDel('${id}',${i})">${I("trash","i s")}</button>`:""}</div></div>`).join(""):`<div class="tiny fnt mut">لا فعاليات مجدولة بعد</div>`}
  ${w.owner==="me"?`<button class="btn btn-primary btn-sm" style="margin-top:6px" onclick="wEvAdd('${id}')">${I("plus","i s")} جدولة فعالية</button>`:`<div class="tiny fnt mut" style="margin-top:6px">جدولة الفعاليات لمالك العالم فقط</div>`}
  </div>`)};
function wEvAdd(id){const w=(S.worlds||[]).find(x=>x.id===id);if(!w)return;const t=prompt("عنوان الفعالية:");if(!t||!t.trim())return;
  const d=prompt("وصف مختصر (اختياري):")||"";const atS=prompt("التاريخ والوقت (مثال: 2026-09-25 20:00) — اتركه فارغاً للبدء بعد ساعة:");let at=Date.now()+3600000;
  if(atS&&atS.trim()){const ts=new Date(atS.trim()).getTime();if(!isNaN(ts))at=ts}
  w.events=w.events||[];w.events.push({t:t.trim().slice(0,80),d:d.trim().slice(0,160),at});
  save();closeOvl();render();openSheet("worldEvents",id);toast("جُدولت الفعالية","ok");snd("success")}
function wEvDel(id,i){const w=(S.worlds||[]).find(x=>x.id===id);if(!w)return;w.events.splice(i,1);save();closeOvl();openSheet("worldEvents",id);toast("حُذفت الفعالية","info")}
SHEETS.worldPresence=(id)=>{const w=(S.worlds||[]).find(x=>x.id===id);if(!w)return sheet("النشاط","<div class='tiny fnt'>لا عالم</div>");
  const seen=[];const list=[];(w.msgs||[]).slice().reverse().forEach(m=>{const k=(m.uid||m.senderId||"me");if(!k||seen.includes(k))return;seen.push(k);const uu=k==="me"?S.me:(u(k)||null);if(uu)list.push([k,uu,m.at])});
  return sheet(I("zap","i s")+" النشاط في "+esc(w.name),`<div class="col">
  <div class="rowb" style="margin-bottom:9px"><span class="xs b">${I("globe","i s")} متصلون الآن</span><span class="badge b-emerald mono">${nfmt(w.online||0)}</span></div>
  ${list.slice(0,12).map(([k,uu,at])=>`<div class="row" style="padding:7px 2px;border-bottom:1px solid var(--line)"><span>${av(uu,32)}</span><span class="g1"><span class="b xs">${k==="me"?"أنت":esc(uu.name||"عضو")}</span><span class="tiny fnt" style="display:block">آخر ظهور ${ago(at||now())}</span></span>${k!=="me"?`<button class="btn btn-sec btn-xs" onclick="closeOvl();startChat('${k}')">${I("chat","i s")}</button>`:""}</div>`).join("")||`<div class="tiny fnt mut">لا نشاط بعد — كن أول المتحدثين</div>`}
  </div>`)};
/* ---- نظام نقاط ورتب النقابات (تلقائي بالمساهمة) ---- */
const GUILD_RANKS=[[0,"مبتدئ","#94a3b8"],[50,"محارب","#38bdf8"],[200,"نخبة","#a78bfa"],[600,"أسطورة","#f59e0b"]];
function guildRankOf(cid,who){const c=(S.communities||[]).find(x=>x.id===cid);const pts=((c&&c.contrib)||{})[who]||0;let r=GUILD_RANKS[0];
  GUILD_RANKS.forEach(x=>{if(pts>=x[0])r=x});return{pts,name:r[1],color:r[2],next:GUILD_RANKS.find(x=>x[0]>pts)}}
function guildAddContrib(cid,who,n){const c=(S.communities||[]).find(x=>x.id===cid);if(!c)return null;c.contrib=c.contrib||{};
  const before=guildRankOf(cid,who).name;c.contrib[who]=(c.contrib[who]||0)+n;const after=guildRankOf(cid,who).name;
  return before!==after?after:null}
SHEETS.guildRanks=(id)=>{const c=(S.communities||[]).find(x=>x.id===id);if(!c)return sheet("الرتب","<div class='tiny fnt'>لا مجتمع</div>");
  const me=guildRankOf(id,"me");const entries=Object.entries(c.contrib||{}).sort((a,b)=>b[1]-a[1]).slice(0,10);const max=GUILD_RANKS[GUILD_RANKS.length-1][0];
  return sheet(I("award","i s")+" الرتب والمساهمات",`<div class="col">
  <div class="card2" style="padding:12px"><div class="rowb"><span class="b xs">رتبتك الحالية</span><span class="badge" style="background:${me.color}22;color:${me.color}">${me.name}</span></div>
  <div class="rowb" style="margin-top:7px"><span class="tiny fnt">نقاط المساهمة</span><span class="tiny mono b">${me.pts}</span></div>
  <div style="height:7px;background:var(--surface3);border-radius:99px;margin-top:8px;overflow:hidden"><div style="height:100%;width:${Math.min(100,Math.round(me.pts/max*100))}%;background:linear-gradient(90deg,var(--accent),var(--gold));border-radius:99px"></div></div>
  ${me.next?`<div class="tiny fnt" style="margin-top:5px">${me.next[1]-me.pts} نقطة تفصلك عن رتبة "${me.next[1]}"</div>`:`<div class="tiny b" style="margin-top:5px;color:var(--gold)">وصلت لأعلى رتبة — أسطورة النقابة</div>`}</div>
  <div class="lbl" style="margin-top:12px">سلم الرتب</div>
  ${GUILD_RANKS.map(([p,n,col])=>`<div class="row" style="padding:7px 2px;border-bottom:1px solid var(--line)"><span class="mono tiny" style="width:42px">${p}+</span><span class="g1 b xs" style="color:${col}">${n}</span>${me.name===n?`<span class="badge b-accent">أنت هنا</span>`:""}</div>`).join("")}
  <div class="lbl" style="margin-top:12px">أعلى المساهمين</div>
  ${entries.map(([k,v],i)=>{const uu=k==="me"?S.me:(u(k)||{});return `<div class="row" style="padding:7px 2px;border-bottom:1px solid var(--line)"><span class="tiny mono" style="width:16px">${i+1}</span><span>${av(uu,28)}</span><span class="g1 b xs">${k==="me"?"أنت":esc(uu.name||"عضو")}</span><span class="badge b-gray mono">${v}</span></div>`}).join("")||`<div class="tiny fnt mut">لا مساهمات بعد — تبرّع أو شارك في قنوات النقابة</div>`}
  <div class="tiny fnt mut" style="margin-top:10px">تكسب نقاط المساهمة بالتبرعات لخزينة النقابة وبكل رسالة ترسلها في قنواتها، والرتبة تُمنح تلقائياً</div>
  </div>`)};
/* ---- أوامر سريعة (Slash) للقروبات والعوالم ---- */
function applyRoomCmd(t,room,roomKind){if(!t.startsWith("/"))return false;
  const sp=t.indexOf(" ");const cmd=(sp<0?t.slice(1):t.slice(1,sp)).toLowerCase();const rest=sp<0?"":t.slice(sp+1).trim();
  const amAdmin=roomKind==="group"?(room.owner==="me"||(room.admins||[]).includes("me")):room.owner==="me";
  const sid=(typeof getChatMyUid==="function")?getChatMyUid():"me";
  const push=(m)=>{(room.msgs=room.msgs||[]).push(Object.assign({id:uid(),uid:"me",senderId:sid,senderName:(S.me&&S.me.name)||"",at:now()},m))};
  if(cmd==="me"){if(!rest)return toast("الصيغة: /me فعلٌ هنا","err"),true;push({text:S.me.name+" "+rest});snd("send")}
  else if(cmd==="roll"){const mm=rest.match(/(\d*)d(\d+)/);const sides=mm?Math.max(2,+mm[2]):100;const cnt=mm?Math.max(1,Math.min(5,+mm[1]||1)):1;
    const rolls=Array.from({length:cnt},()=>1+Math.floor(Math.random()*sides));
    push({text:"رمى النرد: "+rolls.join(" + ")+(cnt>1?" = "+rolls.reduce((a,b)=>a+b,0):"")+" (الحد الأقصى "+sides+")"});snd("send")}
  else if(cmd==="poll"){const seg=rest.split("|").map(s=>s.trim()).filter(Boolean);
    if(seg.length<3)return toast("الصيغة: /poll السؤال | خيار | خيار","err"),true;
    const opts=seg.slice(1,6);push({type:"cpoll",q:seg[0],opts,votes:opts.map(()=>0),me:null});snd("send")}
  else if(cmd==="topic"){if(!amAdmin)return toast("تغيير الموضوع للإدارة فقط","err"),true;
    if(!rest)return toast("اكتب الموضوع الجديد بعد الأمر","err"),true;
    room.desc=rest.slice(0,120);push({text:"حُدّث موضوع "+(roomKind==="group"?"القروب":"العالم")+": "+room.desc});snd("send")}
  else if(cmd==="clear"){if(!amAdmin)return toast("تنظيف الرسائل للإدارة فقط","err"),true;
    room.msgs=[];push({text:"نظّفت إدارة "+(roomKind==="group"?"القروب":"العالم")+" الرسائل"});snd("success")}
  else return toast("الأوامر: /me /roll /poll /topic /clear","info"),true;
  save();render();return true}
/* ---- فتح صفحة مباشرة من اختصارات PWA (?go=page أو #page) ---- */
window.addEventListener("load",function(){try{const q=new URLSearchParams(location.search);const t=q.get("go")||(location.hash||"").replace(/^#/,"");
  if(t&&typeof PAGES==="object"&&PAGES[t]&&typeof go==="function")setTimeout(function(){go(t)},250)}catch(e){}});
'''
ins_before("SHEETS.roomMsgMenu=(mid)=>{", INFRA, 1, "infra-block")

# ============================================================
# 2) roomMsgMenu: add react + edit buttons
# ============================================================
OLD_REPLY = r'''onclick="closeOvl();if(${isGroup}){window.setGroupReply('${(room||{}).id}', '${mid}');}else{window.setWorldReply('${(room||{}).id}', '${mid}');}"><span style="color:var(--accent)">${I("reply","i s")}</span><span class="g1 b xs" style="text-align:right">رد</span></button>'''
NEW_REPLY = OLD_REPLY + r'''
    <button class="lstrow" style="padding:11px" onclick="closeOvl();openSheet('roomReactPick','${mid}')"><span style="color:var(--rose)">${I("face-love","i s")}</span><span class="g1 b xs" style="text-align:right">تفاعل سريع</span></button>'''
rep(OLD_REPLY, NEW_REPLY, 1, "menu-react")

OLD_COPY = r'''toast('نُسخ النص','ok')"><span style="color:var(--cyan)">${I("copy","i s")}</span><span class="g1 b xs" style="text-align:right">نسخ النص</span></button>'''
NEW_COPY = OLD_COPY + r'''${m.uid==="me"||m.senderId==="me"?`<button class="lstrow" style="padding:11px" onclick="roomEditMsg('${mid}')"><span style="color:var(--cyan)">${I("edit","i s")}</span><span class="g1 b xs" style="text-align:right">تعديل الرسالة</span></button>`:""}'''
rep(OLD_COPY, NEW_COPY, 1, "menu-edit")

# ============================================================
# 3) Render reactions + edited badge in group & world message rows
# ============================================================
OLD_BUBBLE = '${roomMsgBody(m,me)}<span class="tm">${hhmm(m.at)}</span>'
NEW_BUBBLE = '${roomMsgBody(m,me)}${roomReactBar(m)}<span class="tm">${hhmm(m.at)}${m.edited?" · عُدّلت":""}</span>'
rep(OLD_BUBBLE, NEW_BUBBLE, 2, "bubble-react")

# ============================================================
# 4) chatRoom header: collapse phone/video/menu into overflow button
# ============================================================
OLD_HDR = '''      <button class="iconbtn" onclick="openSheet('chatSearch','${c.id}')" aria-label="بحث">${I("search","i s")}</button>
      <button class="iconbtn" onclick="startCall('${c.id}','voice')" aria-label="مكالمة صوتية" style="color:var(--emerald)">${I("phone","i s")}</button>
      <button class="iconbtn" onclick="startCall('${c.id}','video')" aria-label="مكالمة فيديو" style="color:var(--cyan)">${I("video","i s")}</button>
      <button class="iconbtn" onclick="openSheet('chatRoomMenu','${c.id}')" aria-label="خيارات">${I("more","i s")}</button>'''
NEW_HDR = '''      <button class="iconbtn" onclick="openSheet('chatSearch','${c.id}')" aria-label="بحث">${I("search","i s")}</button>
      ${moreBtnV("chatRoom",c.id,"مكالمات وخيارات المحادثة")}'''
rep(OLD_HDR, NEW_HDR, 1, "chatRoom-header-overflow")

# ============================================================
# 5) selMode bar: fold star-select into overflow menu
# ============================================================
OLD_SEL = '''            <button class="btn btn-sec btn-xs" onclick="openSheet('fwdSheetSel')">${I("fwd","i s")} توجيه</button>
            <button class="btn btn-sec btn-xs" onclick="starSel()">${I("star","i s")} تمييز</button>
            <button class="btn btn-danger btn-xs" onclick="delSel()">${I("trash","i s")} حذف</button>
            <button class="btn btn-ghost btn-xs" onclick="S.selMode=false;S.selIds=[];render()">خروج</button>'''
NEW_SEL = '''            <button class="btn btn-sec btn-xs" onclick="openSheet('fwdSheetSel')">${I("fwd","i s")} توجيه</button>
            <button class="btn btn-danger btn-xs" onclick="delSel()">${I("trash","i s")} حذف</button>
            <button class="iconbtn" style="width:30px;height:30px;border:1px solid var(--line)" title="خيارات التحديد" aria-label="خيارات التحديد" onclick="openMoreMenu('selActions','')">${I("more","i s")}</button>
            <button class="btn btn-ghost btn-xs" onclick="S.selMode=false;S.selIds=[];render()">خروج</button>'''
rep(OLD_SEL, NEW_SEL, 1, "selMode-overflow")

# ============================================================
# 6) sendGroupMsg: slash commands + slow mode
# ============================================================
OLD_GSEND = 'if(g.announce&&!g.admins.includes("me")){toast("قروب إعلانات: الكتابة للمشرفين فقط","err");snd("error");return}'
NEW_GSEND = OLD_GSEND + r'''
  if(t.startsWith("/")){i.value="";i.style.height="auto";if(applyRoomCmd(t,g,"group"))return}
  if(g.slow&&g.owner!=="me"&&!(g.admins||[]).includes("me")){const myLast=(g.msgs||[]).slice().reverse().find(m=>(m.uid||m.senderId)==="me");
    if(myLast&&now()-(myLast.at||0)<g.slow*1000){toast("وضع التهدئة: انتظر "+g.slow+" ثانية بين الرسائل","err");return}}'''
rep(OLD_GSEND, NEW_GSEND, 1, "group-cmd-slow")

# ============================================================
# 7) sendWorldMsg: slash commands
# ============================================================
OLD_WSEND = 'const t=(i.value||"").trim();if(!t)return;i.value="";i.style.height="auto";setTimeout(()=>{try{i.focus()}catch(e){}},10);\n  const mId = uid();'
NEW_WSEND = 'const t=(i.value||"").trim();if(!t)return;\n  if(t.startsWith("/")){i.value="";i.style.height="auto";if(applyRoomCmd(t,w,"world"))return}\n  i.value="";i.style.height="auto";setTimeout(()=>{try{i.focus()}catch(e){}},10);\n  const mId = uid();'
rep(OLD_WSEND, NEW_WSEND, 1, "world-cmd")

# ============================================================
# 8) groupMenu: stats / media / search / slow-mode rows
# ============================================================
OLD_GSHARE = '''<button class="lstrow" style="padding:11px" onclick="closeOvl();openSheet('shareProfile')"><span style="color:var(--accent)">${I("share","i s")}</span><span class="g1 b xs" style="text-align:right">مشاركة القروب</span></button>'''
NEW_GSHARE = r'''<button class="lstrow" style="padding:11px" onclick="closeOvl();openSheet('groupStats','${g.id}')"><span style="color:var(--cyan)">${I("barchart","i s")}</span><span class="g1 b xs" style="text-align:right">إحصائيات القروب</span></button>
    <button class="lstrow" style="padding:11px" onclick="closeOvl();openSheet('groupMedia','${g.id}')"><span style="color:var(--emerald)">${I("image","i s")}</span><span class="g1 b xs" style="text-align:right">معرض الوسائط</span></button>
    <button class="lstrow" style="padding:11px" onclick="closeOvl();openSheet('groupSearch','${g.id}')"><span style="color:var(--accent)">${I("search","i s")}</span><span class="g1 b xs" style="text-align:right">بحث في الرسائل</span></button>
    ${amI?`<button class="lstrow" style="padding:11px" onclick="g.slow=g.slow?0:30;save();closeOvl();openSheet('groupMenu','${g.id}');toast(g.slow?'فُعّل وضع التهدئة (٣٠ ثانية)':'أُلغي وضع التهدئة','info')"><span style="color:${g.slow?'var(--rose)':'var(--muted)'}">${I("clock","i s")}</span><span class="g1 b xs" style="text-align:right">${g.slow?"إلغاء وضع التهدئة":"وضع التهدئة (٣٠ث)"}</span></button>`:""}
    ''' + OLD_GSHARE
rep(OLD_GSHARE, NEW_GSHARE, 1, "groupMenu-rows")

# ============================================================
# 9) worldMenu: events + presence rows
# ============================================================
OLD_WRULES = '''<button class="lstrow" style="padding:11px" onclick="closeOvl();openSheet('worldRules','${w.id}')"><span style="color:var(--accent)">${I("info","i s")}</span><span class="g1 b xs" style="text-align:right">قوانين العالم</span></button>'''
NEW_WRULES = r'''<button class="lstrow" style="padding:11px" onclick="closeOvl();openSheet('worldEvents','${w.id}')"><span style="color:var(--gold)">${I("calendar","i s")}</span><span class="g1 b xs" style="text-align:right">فعاليات العالم</span></button>
    <button class="lstrow" style="padding:11px" onclick="closeOvl();openSheet('worldPresence','${w.id}')"><span style="color:var(--emerald)">${I("zap","i s")}</span><span class="g1 b xs" style="text-align:right">النشاط الآن</span></button>
    ''' + OLD_WRULES
rep(OLD_WRULES, NEW_WRULES, 1, "worldMenu-rows")

# ============================================================
# 10) communityMenu: ranks & contributions row
# ============================================================
OLD_CROWN = '''["crown","إدارة الرتب",`closeOvl();openSheet('guildRoles','${id}')`],'''
NEW_CROWN = OLD_CROWN + '''["award","الرتب والمساهمات",`closeOvl();openSheet('guildRanks','${id}')`],'''
rep(OLD_CROWN, NEW_CROWN, 1, "communityMenu-ranks")

# ============================================================
# 11) guildDonate: contribution points
# ============================================================
OLD_DON = "c.tlog.unshift({amt:amt,at:now(),by:S.me.name});save();render();toast(\"شكراً! أُضيف \"+amt+\" للخزينة\",\"ok\")"
NEW_DON = '''c.tlog.unshift({amt:amt,at:now(),by:S.me.name});const up=guildAddContrib(cid,"me",Math.max(1,Math.round(amt/10)));save();render();toast("شكراً! أُضيف "+amt+" للخزينة","ok");if(up){snd("success");toast("ترقية! أصبحت رتبتك \\""+up+"\\" في النقابة","ok")}'''
rep(OLD_DON, NEW_DON, 1, "guildDonate-points")

# ============================================================
# 12) sendComMsg: +1 contribution point per message
# ============================================================
OLD_COM = "c.messages.push({id:uid(),from:\"me\",text:t,at:now()});i.value=\"\";snd(\"send\");"
NEW_COM = '''c.messages.push({id:uid(),from:"me",text:t,at:now()});const up=guildAddContrib(id,"me",1);if(up)toast("ترقية! أصبحت رتبتك \\""+up+"\\" في النقابة","ok");i.value="";snd("send");'''
rep(OLD_COM, NEW_COM, 1, "sendComMsg-points")

# ============================================================
# 13) Performance CSS (before first </style>)
# ============================================================
PERF_CSS = '''/* ===== v7.3 تحسينات السرعة والأداء ===== */
.post{content-visibility:auto;contain-intrinsic-size:auto 430px}
.act,.iconbtn,.btn,.chip{touch-action:manipulation}
html{overscroll-behavior-y:contain}
@media (prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important;scroll-behavior:auto!important}}
'''
idx = src.find("</style>")
if idx < 0:
    print("FAIL: no </style> found"); sys.exit(1)
src = src[:idx] + PERF_CSS + src[idx:]
steps.append("OK  [perf-css] 1")

io.open(P, "w", encoding="utf-8").write(src)
print("\n".join(steps))
print("DONE: index.html %d -> %d chars (+%d)" % (orig_len, len(src), len(src) - orig_len))

# ============================================================
# 14) manifest.json: shortcuts + share target + display override
# ============================================================
m = json.load(io.open("manifest.json", encoding="utf-8"))
m["id"] = "/?source=pwa"
m["display_override"] = ["standalone", "minimal-ui"]
m["shortcuts"] = [
    {"name": "التغذية الرئيسية", "short_name": "التغذية", "url": "/?go=feed",
     "icons": [{"src": "/pwa-192x192.png", "sizes": "192x192", "type": "image/png"}]},
    {"name": "المحادثات", "short_name": "المحادثات", "url": "/?go=chat",
     "icons": [{"src": "/pwa-192x192.png", "sizes": "192x192", "type": "image/png"}]},
    {"name": "العوالم", "short_name": "العوالم", "url": "/?go=worlds",
     "icons": [{"src": "/pwa-192x192.png", "sizes": "192x192", "type": "image/png"}]},
    {"name": "المجتمعات والنقابات", "short_name": "المجتمعات", "url": "/?go=hub",
     "icons": [{"src": "/pwa-192x192.png", "sizes": "192x192", "type": "image/png"}]},
]
m["share_target"] = {"action": "/", "method": "GET", "params": {"text": "text", "url": "url", "title": "title"}}
io.open("manifest.json", "w", encoding="utf-8").write(json.dumps(m, ensure_ascii=False, indent=2) + "\n")
print("DONE: manifest.json (shortcuts=%d, share_target, display_override)" % len(m["shortcuts"]))

# ============================================================
# 15) sw.js: bump cache version
# ============================================================
sw = io.open("sw.js", encoding="utf-8").read()
if "CACHE_VERSION = 'anime-black-v7.2-syncfix'" not in sw:
    print("FAIL: sw.js version marker not found"); sys.exit(1)
sw = sw.replace("CACHE_VERSION = 'anime-black-v7.2-syncfix'", "CACHE_VERSION = 'anime-black-v7.3-legendary'")
io.open("sw.js", "w", encoding="utf-8").write(sw)
print("DONE: sw.js cache version bumped")
