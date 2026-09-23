PAGES.chatRoom=()=>{
  const c=(S.chats||[]).find(x=>x.id===S.params.id);if(!c||!c.messages){setNav(false);setHdr(backHdr("المحادثة",""));return emptyState("chat","المحادثة غير موجودة","")}
  const uu=u(c.userId);setNav(false);S.activeChat=c.id;
  if(c.vanish){const cut=now()-c.vanish*36e5;const b4=(c.messages||[]).length;c.messages=c.messages.filter(m=>!m.at||m.at>=cut||(c.pinnedMsgs||[]).includes(m.id));if((c.messages||[]).length!==b4)save()}
  const blocked=(S.blocked||[]).includes(uu.id);
  const pinned=(c.pinnedMsgs||[]).length?msgById(c.pinnedMsgs[(c.pinnedMsgs||[]).length-1]):null;
  setHdr(`<div style="display:flex;align-items:center;gap:9px;width:100%">
    <button class="iconbtn" onclick="go('chat')">${I("back")}</button>
    <button class="row g1" style="gap:9px;text-align:right" onclick="openProfile('${uu.id}')">
      ${av(uu,36,true)}
      <span class="g1" style="min-width:0"><span class="row" style="gap:4px"><span class="b sm">${esc(uu.name)}</span>${vbadge(uu)}${lvlBadge(uu)}</span>
      <span id="chat_hdr_st" class="tiny ${S.typingIn&&S.typingIn[c.id]?'':'fnt'}" style="color:${S.typingIn&&S.typingIn[c.id]?'var(--accent)':uu.online?'var(--emerald)':'var(--faint)'}">${S.typingIn&&S.typingIn[c.id]?"يكتب الآن…":uu.online?"متصل الآن":"آخر ظهور "+ago(uu.lastSeen||uu.joined)}</span></span>
    </button>
    ${(c.pinnedMsgs||[]).length?`<button class="iconbtn" style="color:var(--gold)" onclick="jumpToMsg('${c.pinnedMsgs[(c.pinnedMsgs||[]).length-1]}')" aria-label="مثبتة">${I("pin","i s")}</button>`:""}
    ${c.vanish?`<button class="iconbtn" style="color:var(--emerald)" onclick="cycleVanish('${c.id}')" aria-label="رسائل مختفية">${I("clock","i s")}</button>`:""}
    ${S.selMode?`<button class="iconbtn" style="color:var(--rose)" onclick="S.selMode=false;S.selIds=[];render()" aria-label="خروج من التحديد">${I("x","i s")}</button>`:""}
    <button class="iconbtn" onclick="S.csQ='';openSheet('chatSearch','${c.id}')" aria-label="بحث في المحادثة">${I("search","i s")}</button>
    <button class="iconbtn" onclick="startCall('${c.id}','voice')" aria-label="مكالمة صوتية">${I("phone","i s")}</button>
    <button class="iconbtn" onclick="startCall('${c.id}','video')" aria-label="مكالمة فيديو">${I("video","i s")}</button>
    <button class="iconbtn" onclick="openSheet('chatRoomMenu','${c.id}')" aria-label="خيارات">${I("more","i s")}</button></div>`);
  let rows=[];let lastDay="";
  c.messages.forEach(m=>{const dl=dayLbl(m.at);if(dl!==lastDay){lastDay=dl;rows.push(`<div class="center" style="margin:10px 0 8px"><span class="tiny b" style="background:var(--surface3);border:1px solid var(--line2);border-radius:99px;padding:4px 12px;color:var(--muted)">${dl}</span></div>`)}rows.push(msgBubble(m,uu,c.id))});
  return `<div style="display:flex;flex-direction:column;height:100%;position:relative">
    ${pinned?`<div class="row" style="gap:8px;padding:7px 12px;background:linear-gradient(90deg,rgba(245,158,11,.14),transparent);border-bottom:1px solid var(--line);flex-shrink:0"><span style="color:var(--gold)">${I("pin","i s")}</span><button class="tiny g1" style="text-align:right;background:none;border:none;color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap" onclick="jumpToMsg('${pinned.id}')">مثبت: ${esc((pinned.text||"ملصق").slice(0,60))}</button><button class="iconbtn" style="width:26px;height:26px" onclick="pinMsg('${pinned.id}')" aria-label="إلغاء التثبيت">${I("x","i s")}</button></div>`:""}
    <div class="chatbody no-sb" id="msgs" onscroll="const f=$('#msgfab');if(f)f.style.display=(this.scrollHeight-this.scrollTop-this.clientHeight>240)?'flex':'none'"${c.wallpaperImg?` style="background:url('${c.wallpaperImg}') center/cover"`:c.wallpaper?` style="background:linear-gradient(180deg,${c.wallpaper[0]},${c.wallpaper[1]})"`:""}>
      <div class="center tiny fnt" style="margin-bottom:6px">— بداية المحادثة · ${new Date(c.lastAt).toLocaleDateString("ar")} —</div>
      ${c.vanish?`<div class="center tiny fnt" style="color:var(--emerald);margin-bottom:6px">${I("clock","i s")} الرسائل تختفي تلقائياً بعد ${c.vanish===24?"٢٤ ساعة":"٣ أيام"}</div>`:""}
      ${rows.join("")}
      <div id="chat_typing_indicator" style="display:${(S.typingIn&&S.typingIn[c.id])?'flex':'none'};gap:6px;margin-top:4px" class="msg them row">${av(uu,20)}<span class="dot3"><i></i><i></i><i></i></span></div>
    </div>
    <button id="msgfab" class="iconbtn" style="display:none;position:absolute;bottom:74px;left:14px;z-index:5;width:40px;height:40px;background:var(--surface2);box-shadow:0 6px 18px rgba(0,0,0,.4)" onclick="const b=$('#msgs');if(b)b.scrollTop=b.scrollHeight" aria-label="لأسفل">${I("chevdown","i s")}</button>
    ${blocked?`<div class="pad center" style="border-top:1px solid var(--line);flex-shrink:0"><div class="tiny fnt" style="color:var(--rose)">${I("ban","i s")} هذا المستخدم محظور — لا يمكنك مراسلته</div><button class="btn btn-sec btn-sm" style="margin-top:8px" onclick="unblockUser('${uu.id}')">إلغاء الحظر للمراسلة</button></div>`:`
    ${S.editMid?`<div id="edit_bar" class="row" style="gap:8px;padding:6px 12px;background:var(--surface2);border-top:1px solid var(--line);flex-shrink:0"><span style="color:var(--gold)">${I("edit","i s")}</span><span class="tiny g1" style="text-align:right">تعديل رسالتك: ${esc(((msgById(S.editMid)||{}).text||"").slice(0,50))}</span><button class="iconbtn" style="width:26px;height:26px" onclick="S.editMid=null;const i=document.getElementById('minp');if(i)i.value='';const eb=document.getElementById('edit_bar');if(eb)eb.remove();">${I("x","i s")}</button></div>`:""}
    ${S.replyTo?`<div id="reply_bar" class="row" style="gap:8px;padding:6px 12px;background:var(--surface2);border-top:1px solid var(--line);flex-shrink:0"><span style="color:var(--accent)">${I("reply","i s")}</span><span class="tiny g1" style="text-align:right">رد على: ${esc((((msgById(S.replyTo)||{}).text)||"ملصق").slice(0,50))}</span><button class="iconbtn" style="width:26px;height:26px" onclick="S.replyTo=null;const rb=document.getElementById('reply_bar');if(rb)rb.remove();">${I("x","i s")}</button></div>`:""}
    ${S.selMode?`<div class="row" style="gap:6px;padding:7px 10px;background:var(--surface2);border-top:1px solid var(--line);flex-shrink:0"><span class="tiny b g1">${(S.selIds||[]).length} رسالة محددة</span><button class="btn btn-sec btn-xs" onclick="openSheet('fwdSheetSel')">${I("fwd","i s")} توجيه</button><button class="btn btn-sec btn-xs" onclick="starSel()">${I("star","i s")} تمييز</button><button class="btn btn-danger btn-xs" onclick="delSel()">${I("trash","i s")} حذف</button><button class="btn btn-ghost btn-xs" onclick="S.selMode=false;S.selIds=[];render()">خروج</button></div>`:""}
    <div class="composer">
      <button class="iconbtn" onclick="openSheet('attachSheet')" aria-label="إرفاق" style="border-radius:50%;color:var(--emerald);background:rgba(16,185,129,0.1);border-color:rgba(16,185,129,0.2)">${I("plus")}</button>
      <textarea id="minp" rows="1" placeholder="${S.editMid?'اكتب التعديل...':'اكتب رسالة...'}" oninput="this.style.height='auto';this.style.height=Math.min(96,this.scrollHeight)+'px';S.chatDrafts=S.chatDrafts||{};S.chatDrafts['${c.id}']=this.value;notifyTyping('${c.id}');saveDebounced()" onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();sendMsg('${c.id}')}">${esc((S.chatDrafts||{})[c.id]||"")}</textarea>
      <button class="iconbtn" onclick="openSheet('emojiSheet')" aria-label="ملصقات" style="border-radius:50%;color:var(--purple);background:rgba(139,92,246,0.1);border-color:rgba(139,92,246,0.2)">${IF("heart","i s")}</button>
      <button class="iconbtn" id="micbtn" onclick="recVoice('${c.id}',this)" aria-label="تسجيل صوتي" style="border-radius:50%;color:var(--accent);background:rgba(0,163,255,0.1);border-color:rgba(0,163,255,0.2)">${I("mic")}</button>
      <button class="iconbtn" style="background:linear-gradient(135deg,#00A3FF,#8B5CF6);color:#fff;border:none;border-radius:50%;box-shadow:0 4px 12px rgba(0,163,255,0.3)" onclick="sendMsg('${c.id}')" aria-label="إرسال">${I("send","i s")}</button>
    </div>`}
  </div>`;
};
function metaHTML(m, cid){
  const C = cid || S.activeChat || (S.params && S.params.id) || "";
  const ticks = m.from === "me"
    ? (m.failed
        ? `<button type="button" title="تعذّر الإرسال — اضغط لإعادة المحاولة" style="background:none;border:none;padding:0;color:var(--rose);line-height:0;display:inline-flex;align-items:center;vertical-align:-2px;cursor:pointer;gap:2px" onclick="event.stopPropagation();retryPendingMsg('${C}','${m.id}')">${I("alert","i s")}<span style="font-size:9.5px;color:var(--rose)">إعادة المحاولة</span></button>`
        : m.pending
          ? `<span title="قيد الإرسال" style="color:var(--faint);line-height:0;display:inline-flex;vertical-align:-2px">${I("clock","i s")}</span>`
          : (m.st||1)===3
            ? `<span title="مقروءة" style="color:var(--cyan);line-height:0;display:inline-flex;vertical-align:-2px">${I("check","i s")}${I("check","i s")}</span>`
            : (m.st||1)===2
              ? `<span title="مستلمة" style="color:var(--faint);line-height:0;display:inline-flex;vertical-align:-2px">${I("check","i s")}${I("check","i s")}</span>`
              : `<span title="أُرسلت" style="color:var(--faint);line-height:0;display:inline-flex;vertical-align:-2px">${I("check","i s")}</span>`)
    : "";
  return `${m.edited?`<span style="opacity:.7">عُدّلت · </span>`:""}${hhmm(m.at)} ${ticks}`;
}
function dayLbl(ms){const d=new Date(ms);const t=new Date();const y=new Date(Date.now()-864e5);
  if(d.toDateString()===t.toDateString())return "اليوم";if(d.toDateString()===y.toDateString())return "أمس";return d.toLocaleDateString("ar",{day:"numeric",month:"long"})}
function shareCardHTML(m,me){const __f=(()=>{const p=(S.posts||[]).find(x=>x.id===m.ref);if(!p)return `<span class="tiny fnt">منشور محذوف</span>`;const au=u(p.authorId, p);return `<div class="card2" style="padding:9px;min-width:190px;background:${me?"rgba(0,0,0,.18)":"var(--surface2)"}"><div class="row" style="gap:7px"><span>${av(au,26)}</span><div class="g1"><div class="tiny b">${esc(au.name)}</div><div class="tiny fnt" style="opacity:.75">${ago(p.createdAt)}</div></div><span class="art-bg" style="--c1:${p.c1||"#3B0764"};--c2:${p.c2||"#831843"};width:38px;height:38px;border-radius:10px;display:flex;align-items:center;justify-content:center">${I(p.type==="image"?"image":"msgsq","i s")}</span></div><div class="tiny" style="margin-top:7px;line-height:1.5;opacity:.9">${esc((p.text||"").slice(0,90))}</div><button class="btn btn-sec btn-xs" style="margin-top:8px;width:100%" onclick="go('postView',{pid:'${p.id}'})">${I("fwd","i s")} فتح المنشور</button></div>`});return __f()}
function linkify(t){return esc(t).replace(/(https?:\/\/[^\s<]+)/g,'<a href="$1" target="_blank" rel="noopener" style="color:#7DD3FC;text-decoration:underline">$1</a>')}
function msgBubble(m,uu,cid){
  const me=m.from==="me";const C=cid||S.activeChat||S.params.id;
  if(m.gone)return `<div class="msg ${me?"me":"them"}" data-mid="${m.id||""}" id="m_${m.id||""}" style="opacity:.62;position:relative">${S.selMode?selBox(m.id):""}<span class="tiny fnt">${I("ban","i s")} حُذفت الرسالة</span><span class="tm">${hhmm(m.at)}</span></div>`;
  const quote=m.quote?`<div style="border-inline-start:3px solid var(--accent);background:rgba(0,0,0,.16);border-radius:8px;padding:5px 9px;margin-bottom:6px;text-align:right"><div class="tiny b" style="color:var(--accent)">${esc(m.quote.n)}</div><div class="tiny fnt" style="opacity:.85">${esc(m.quote.t)}</div></div>`:"";
  const fwd=m.fwd?`<div class="tiny fnt" style="opacity:.72;margin-bottom:4px">${I("fwd","i s")} مُعاد توجيهها</div>`:"";
  const reacts=(m.reacts&&m.reacts.length)?`<div class="row" style="gap:3px;margin-top:6px;flex-wrap:wrap">${Object.entries(m.reacts.reduce((a,r)=>{a[r]=(a[r]||0)+1;return a},{})).map(([ic,n])=>`<button style="display:inline-flex;align-items:center;gap:3px;background:${me?"rgba(0,0,0,.22)":"var(--surface3)"};border:1px solid var(--line2);border-radius:99px;padding:2px 7px;line-height:0;cursor:pointer" onclick="toggleReact('${m.id}','${ic}')"><span style="color:var(--accent);line-height:0">${I(ic,"i s")}</span><span class="tiny mono">${n}</span></button>`).join("")}</div>`:"";
  const inner=m.type==="call"?`<div class="row" style="gap:8px"><span class="ico-tile" style="width:34px;height:34px;border-radius:11px;background:${me?'rgba(0,0,0,.25)':'var(--surface3)'};color:${m.missed?'var(--rose)':me?'#fff':'var(--emerald)'}">${I(m.ctype==="video"?"video":"phone","i l")}</span><span class="g1"><span class="b xs" style="display:block">${m.missed?"مكالمة فائتة":m.ctype==="video"?"مكالمة فيديو":"مكالمة صوتية"}</span><span class="tiny fnt" style="opacity:.8">${m.dur?Math.floor(m.dur/60)+":"+String(m.dur%60).padStart(2,"0")+" د":""} · ${m.out?"صادرة":"واردة"}</span></span></div>`
   :m.type==="sticker"?`<div style="line-height:0;color:${me?"#fff":"var(--accent)"}">${IC(m.icon||"star","xl")}</div>`
   :m.type==="image"&&m.src?`<img src="${m.src}" alt="" onclick="openImg('${m.src}','صورة')" style="max-width:100%;max-height:260px;border-radius:12px;display:block;cursor:pointer;object-fit:cover;box-shadow:0 2px 8px rgba(0,0,0,.2)">`
   :m.type==="video"&&m.src?`<video src="${m.src}" controls style="max-width:100%;max-height:260px;border-radius:12px;display:block;background:#000"></video>`
   :m.type==="share"?shareCardHTML(m,me)
   :m.type==="voice"?`<div class="row audio-bar" style="gap:8px;min-width:180px">
      <button class="iconbtn" id="vbtn_${m.id}" style="width:32px;height:32px;background:${me?'rgba(255,255,255,.22)':'var(--surface3)'};border-color:transparent;color:${me?'#fff':'var(--accent)'};flex-shrink:0" onclick="playVoice(this,'${m.id}')" aria-label="تشغيل">${I("play","i s")}</button>
      <div class="g1 vbars" id="vbars_${m.id}" style="display:flex;gap:2.5px;align-items:center;height:22px;cursor:pointer" onclick="seekVoice(event,'${m.id}')">${Array.from({length:22},(_,i)=>`<i style="width:2.5px;height:${5+strHash((m.id||"v")+"w"+i)%14}px;background:${me?'rgba(255,255,255,.75)':'var(--muted)'};border-radius:99px;transition:all .15s"></i>`).join("")}</div>
      <span class="tiny mono vtime" id="vtime_${m.id}" style="opacity:.8;flex-shrink:0">0:${String(m.dur||14).padStart(2,"0")}</span>
    </div>`
   :m.type==="file"?`<div class="row" style="gap:9px;min-width:180px"><span class="ico-tile" style="width:38px;height:38px;border-radius:12px;background:${me?'rgba(0,0,0,.25)':'var(--surface3)'};color:${me?'#fff':'var(--gold)'}">${I("file","i l")}</span><span class="g1" style="min-width:0"><span class="b xs" style="display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc((m.name||"ملف").slice(0,28))}</span><span class="tiny fnt" style="opacity:.75">مرفق محفوظ داخل المحادثة</span></span>${m.src?`<a class="btn btn-sec btn-xs" href="${m.src}" download="${esc(m.name||"file")}" onclick="event.stopPropagation()">${I("download","i s")}</a>`:""}</div>`
   :m.type==="contact"?(()=>{const cu=u(m.uid||"");return `<div class="row" style="gap:9px;min-width:190px">${av(cu,40)}<span class="g1"><span class="b xs" style="display:block">${esc(cu.name)}</span><span class="tiny fnt" style="opacity:.8">@${esc(cu.username)} · جهة اتصال</span></span><span class="col" style="gap:4px"><button class="btn btn-sec btn-xs" onclick="openProfile('${cu.id}')">ملفه</button><button class="btn btn-sec btn-xs" onclick="startChat('${cu.id}')">راسله</button></span></div>`})()
   :m.type==="cpoll"?(()=>{const tot=(m.votes||[]).reduce((a,b)=>a+b,0)||0;return `<div style="min-width:200px"><div class="b xs">${I("barchart","i s")} ${esc(m.q||"استطلاع")}</div>${(m.opts||[]).map((o,oi)=>{const pc=tot?Math.round(100*(m.votes[oi]||0)/tot):0;return `<button style="display:block;width:100%;margin-top:7px;background:${me?'rgba(0,0,0,.2)':'var(--surface3)'};border:1px solid ${m.me===oi?'var(--accent)':'var(--line2)'};border-radius:10px;padding:0;overflow:hidden;cursor:pointer;text-align:right" onclick="voteChatPoll('${m.id}',${oi})"><span style="display:block;position:relative;padding:7px 10px"><span style="position:absolute;inset:0;width:${pc}%;background:${me?'rgba(255,255,255,.18)':'rgba(0,163,255,.16)'}"></span><span style="position:relative" class="rowb"><span class="tiny b">${esc(o)}${m.me===oi?I("check","i s"):""}</span><span class="tiny mono">${pc}%</span></span></span></button>`}).join("")}<div class="tiny fnt" style="margin-top:6px;opacity:.8">${tot} صوت · ${m.me!=null?"صوتك مسجل":"اضغط للتصويت"}</div></div>`})()
   :m.type==="image"?`<div class="art-bg" style="--c1:#0C4A6E;--c2:#0EA5E9;width:190px;height:130px;border-radius:12px;display:flex;align-items:center;justify-content:center;color:#fff">${IF("image","xl")}</div><div class="xs" style="margin-top:5px">${esc(m.text||"صورة")}</div>`
   :m.type==="video"?`<div class="art-bg" style="--c1:#3B0764;--c2:#7C3AED;width:190px;height:120px;border-radius:12px;display:flex;align-items:center;justify-content:center;position:relative"><span style="color:#fff;line-height:0;display:flex">${IF("clapper","xl")}</span><button class="iconbtn" style="position:absolute;background:rgba(0,0,0,.55);color:#fff;border-color:rgba(255,255,255,.25)" onclick="togglePlay(this)">${I("play","i s")}</button></div>`
   :(m.text&&m.text.includes("http"))?linkPrev(m):esc(m.text||"");
  return `<div class="msg ${me?"me":"them"}" data-mid="${m.id||""}" id="m_${m.id||""}" data-ctx="msg:${m.id||''}" ${S.selMode?` onclick="if(event.target.closest('button,a,video'))return;toggleSel('${m.id}')"`:""} ${me?(bubbleGrad()?` style="background:${bubbleGrad()};position:relative"`:` style="position:relative"`):`style="--a:0;position:relative"`}>${S.selMode?selBox(m.id):""}${!me?`<div class="row" style="gap:5px;margin-bottom:3px"><button onclick="openProfile('${uu.id}')" style="line-height:0">${av(uu,18)}</button><button class="tiny b" style="color:var(--accent);background:none;border:none;padding:0" onclick="openProfile('${uu.id}')">${esc(uu.name)}</button></div>`:""}${fwd}${quote}${inner}<span class="tm">${metaHTML(m, C)}</span>${m.star?`<span style="color:var(--gold);line-height:0;display:inline-flex;vertical-align:-2px;margin-inline-start:3px">${I("star","i s")}</span>`:""}${reacts}</div>`;
}
function playVoice(btn,mid){const m=msgById(mid);if(!m||!m.src){toast("لا مصدر صوتي محفوظ — سُجّلت هذه الرسالة قبل تفعيل التسجيل الحقيقي ","info");return}
  let a=window.__va;
  const bEl = btn || document.getElementById("vbtn_" + mid);
  const tEl = document.getElementById("vtime_" + mid);
  const barsEl = document.getElementById("vbars_" + mid);
  if(a && a.__mid===mid && !a.paused){
    a.pause();
    if(bEl) bEl.innerHTML=I("play","i s");
    return;
  }
  if(a){try{a.pause()}catch(e){}}
  a=new Audio(m.src);a.__mid=mid;window.__va=a;
  if(bEl) bEl.innerHTML=I("pause","i s");
  a.ontimeupdate=()=>{
    const cur = Math.floor(a.currentTime);
    const dur = Math.floor(a.duration || m.dur || 14);
    if(tEl) tEl.textContent = `0:${String(cur).padStart(2,"0")} / 0:${String(dur).padStart(2,"0")}`;
    if(barsEl && dur > 0){
      const pct = a.currentTime / dur;
      const bars = barsEl.querySelectorAll("i");
      const activeIdx = Math.floor(pct * bars.length);
      bars.forEach((bar, idx) => {
        bar.style.opacity = idx <= activeIdx ? "1" : "0.45";
        bar.style.transform = idx === activeIdx ? "scaleY(1.3)" : "scaleY(1)";
      });
    }
  };
  a.onended=()=>{
    if(bEl) bEl.innerHTML=I("play","i s");
    if(tEl) tEl.textContent = `0:${String(m.dur||14).padStart(2,"0")}`;
    if(barsEl){ barsEl.querySelectorAll("i").forEach(bar => { bar.style.opacity = "1"; bar.style.transform = "scaleY(1)"; }); }
  };
  a.onerror=()=>{
    if(bEl) bEl.innerHTML=I("play","i s");
    toast("تعذّر تشغيل الصوت ","err");
  };
  a.play().catch(()=>{if(bEl) bEl.innerHTML=I("play","i s");toast("اضغط لتشغيل الصوت ","info")});
}
function seekVoice(event, mid){
  const m = msgById(mid); if(!m || !m.src) return;
  const barsEl = document.getElementById("vbars_" + mid);
  if(!barsEl) return;
  const rect = barsEl.getBoundingClientRect();
  const clickX = event.clientX - rect.left;
  const pct = Math.max(0, Math.min(1, clickX / rect.width));
  let a = window.__va;
  if(!a || a.__mid !== mid){
    playVoice(null, mid);
    a = window.__va;
  }
  if(a && a.__mid === mid && a.duration){
    a.currentTime = pct * a.duration;
  }
}

let _typT = 0;
function notifyTyping(cid) {
  if (now() - _typT > 3000 && window.db && window.setDoc && window.doc) {
    _typT = now();
    const myUid = getMyUid();
    window.setDoc(window.doc(window.db, "chats", cid), { typing: { [myUid]: now() } }, { merge: true }).catch(() => {});
  }
}

function sendMsg(cid){
  const i=$("#minp");if(!i)return;
  if(S.editMid){const em=msgById(S.editMid);const t2=(i.value||"").trim();if(em&&t2){em.text=t2;em.edited=true;if(window.db&&window.setDoc&&window.doc){window.setDoc(window.doc(window.collection(window.db,"chats",cid,"messages"),em.id),{text:t2,edited:true},{merge:true}).catch(e=>console.error(e));}}S.editMid=null;i.value="";i.style.height="auto";save();snd("success");render();toast("تم تعديل الرسالة ","ok");return}
  const t=(i.value||"").trim();if(!t)return;
  const c=(S.chats||[]).find(x=>x.id===cid);if(!c)return;
  let quote=null;
  if(S.replyTo){const qm=msgById(S.replyTo);if(qm)quote={n:qm.from==="me"?"أنت":u(c.userId).name,t:(qm.text||(qm.type==="sticker"?"ملصق":qm.type||"وسائط")).slice(0,60)};S.replyTo=null}
  const mid=uid();
  const myUid = getMyUid();
  const myName = S.me.name || "أنا";
  const msgObj = {
    id: mid,
    from: "me",
    senderId: myUid,
    senderName: myName,
    text: t,
    type: "text",
    st: 1,
    pending: true,
    quote: quote || null,
    at: now()
  };
  c.messages.push(msgObj);
  c.last=t;c.lastAt=now();i.value="";i.style.height="auto";(S.chatDrafts=S.chatDrafts||{})[cid]="";
  snd("send");haptic("إرسال");questProgress("q4");save();
  const b=$("#msgs");if(b){b.insertAdjacentHTML("beforeend",msgBubble(msgObj,u(c.userId),cid));setTimeout(()=>{b.style.scrollBehavior="smooth";b.scrollTop=b.scrollHeight;setTimeout(()=>b.style.scrollBehavior="auto",300)},10)}
  if(!netOk()){
    (S.offQ=S.offQ||[]).push({t:"msg",cid,mid});save();
    netbar(false);toast("سيُرسَل تلقائياً عند عودة الاتصال","info");
    return;
  }
  syncChatMessage(cid, msgObj);
}
function playMediaMid(mid){const m=msgById(mid);if(!m)return;if(m.type==="voice")playVoice(null,mid);else jumpToMsg(mid)}
let recT=null,recS=0;
let mediaRec=null,recChunks=[],recStream=null;
function recVoice(cid,btn){
  if(recT){
    clearInterval(recT);recT=null;btn.innerHTML=I("mic");btn.style.background="";btn.style.color="";
    const c=(S.chats||[]).find(x=>x.id===cid);if(!c)return;const dur=recS;recS=0;
    const finish=(src)=>{
      const mid=uid();
      const myUid=getMyUid();
      const mObj={id:mid,from:"me",senderId:myUid,senderName:S.me.name||"أنا",text:" رسالة صوتية (0:"+String(dur).padStart(2,"0")+")",type:"voice",at:now(),src:src||"",dur:dur||0,st:1,pending:true};
      c.messages.push(mObj);
      c.last=" رسالة صوتية";c.lastAt=now();save();snd("send");toast(src?"أُرسلت رسالة صوتية حقيقية ":"أُرسلت الرسالة الصوتية ","ok");render();
      syncChatMessage(cid, mObj);
    };
    if(mediaRec&&mediaRec.state==="recording"){
      mediaRec.onstop=()=>{try{const bl=new Blob(recChunks,{type:(recChunks[0]&&recChunks[0].type)||"audio/webm"});const rd=new FileReader();rd.onload=()=>finish(rd.result);rd.readAsDataURL(bl)}catch(e){finish("")}
        try{recStream.getTracks().forEach(t=>t.stop())}catch(e){}mediaRec=null;recChunks=[];recStream=null};
      mediaRec.stop()}
    else finish("");
    return}
  recS=0;btn.innerHTML=I("stop","i s");btn.style.background="var(--grad-fire)";btn.style.color="#fff";snd("tap");
  const startTimer=(real)=>{toast(real?"جارٍ تسجيل صوت حقيقي بالميكروفون... اضغط للإرسال ":"جارٍ التسجيل... اضغط مرة أخرى للإرسال ",real?"ok":"info");
    recT=setInterval(()=>{recS++;if(recS>60){clearInterval(recT);recT=null;btn.innerHTML=I("mic");btn.style.background="";btn.style.color="";toast("انتهى وقت التسجيل (٦٠ ث)","err")}},1000)};
  if(navigator.mediaDevices&&navigator.mediaDevices.getUserMedia&&typeof MediaRecorder!=="undefined"){
    navigator.mediaDevices.getUserMedia({audio:true}).then(st=>{
      recStream=st;mediaRec=new MediaRecorder(st);recChunks=[];
      mediaRec.ondataavailable=e=>{if(e.data&&e.data.size)recChunks.push(e.data)};
      mediaRec.start();S.perms=S.perms||{};S.perms.mic="ممنوح (تسجيل حقيقي)";save();startTimer(true)}).catch(()=>{mediaRec=null;startTimer(false)})}
  else startTimer(false);
}
function startCall(cid,type){
  const c=(S.chats||[]).find(x=>x.id===cid);const uu=u(c.userId);
  const html=`<div class="ov" id="callOv" style="background:${type==="video"?"linear-gradient(135deg,"+uu.name.length%2?"#1a0f2e":"#0f1a2e"+",#000)":"radial-gradient(circle at 50% 25%,#2A0A00,#000 65%)"};align-items:center;justify-content:center;gap:16px;text-align:center">
    ${type==="video"?`<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:110px;opacity:.25">${uu.online?"":""}</div>`:""}
    <div style="position:absolute;top:90px;left:16px;width:96px;height:140px;border-radius:14px;background:linear-gradient(135deg,#FF7A00,#E60000);border:2px solid rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;font-size:34px;z-index:3"><video id="callCam" autoplay playsinline muted style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:none"></video></div>
    <div class="col center" style="gap:11px;z-index:2">
      <div style="padding:4px;border-radius:50%;background:var(--grad-fire);animation:breathe 2s infinite"><img class="avatar" src="${uu.avatar}" width="104" height="104" onerror="this.style.background='#333'"></div>
      <div><div class="bb" style="font-size:19px;color:#fff">${esc(uu.name)}</div>
      <div class="tiny mono" id="callstat" style="color:rgba(255,255,255,.7)">جارٍ الاتصال...</div></div>
      <div class="row" style="gap:7px;justify-content:center">
        <span class="badge b-emerald">${type==="video"?"مكالمة فيديو":"مكالمة صوتية"}</span>
        <span class="badge b-gray mono" id="calltime">00:00</span>
        <span class="badge b-cyan">مشفّرة </span>
      </div>
    </div>
    <div class="row wrap" style="gap:13px;justify-content:center;margin-top:26px;z-index:2">
      ${[["mute","كتم",0],["video","كاميرا",0],["volume","مكبر",0],["screen","مشاركة شاشة",0]].map(([ic,l])=>`
        <button class="col center" style="gap:4px" onclick="this.querySelector('.cb').classList.toggle('on');snd('tap');toast('${l}: '+(this.querySelector('.cb').classList.contains('on')?'مفعّل':'معطّل'),'info')">
          <span class="cb iconbtn" style="width:50px;height:50px;border-radius:50%;background:rgba(255,255,255,.12);color:#fff;border-color:rgba(255,255,255,.22)">${I(ic,"l")}</span>
          <span class="tiny" style="color:rgba(255,255,255,.75);font-weight:700">${l}</span></button>`).join("")}
      <button class="col center" style="gap:4px" onclick="endCall()">
        <span class="iconbtn" style="width:56px;height:56px;border-radius:50%;background:#E60000;color:#fff;border:none;box-shadow:0 6px 22px rgba(230,0,0,.5)">${I("phoneoff","l")}</span>
        <span class="tiny b" style="color:#FCA5A5">إنهاء</span></button>
    </div>
  </div>`;
  $("#ovl").innerHTML=html;snd("notif");window.__callStart=Date.now();window.__callCid=cid;window.__callType=type;
  if(type==="video"&&navigator.mediaDevices&&navigator.mediaDevices.getUserMedia){
    navigator.mediaDevices.getUserMedia({video:true,audio:true}).then(st=>{window.__callStream=st;const v=$("#callCam");if(v){v.srcObject=st;v.style.display="block";v.play&&v.play().catch(()=>{})}S.perms=S.perms||{};S.perms.cam="ممنوح (مكالمة حقيقية)";save()}).catch(()=>{})}
  let s=0,connected=false;
  clearInterval(window.__ct);
  setTimeout(()=>{connected=true;const e=$("#callstat");if(e)e.textContent="متصل "},rnd(2000,3800));
  window.__ct=setInterval(()=>{
    const t=$("#calltime");if(!t){clearInterval(window.__ct);return}
    if(connected){s++;t.textContent=String(Math.floor(s/60)).padStart(2,"0")+":"+String(s%60).padStart(2,"0")}
    else{const e=$("#callstat");if(e)e.textContent="جارٍ الاتصال"+"".padStart((s++%3)+1,".")}
  },1000);
}
function endCall(){const dur=window.__callStart?Math.max(0,Math.round((Date.now()-window.__callStart)/1000)):0;const cid=window.__callCid;const ctype=window.__callType||"voice";window.__callStart=0;clearInterval(window.__ct);try{if(window.__callStream){window.__callStream.getTracks().forEach(t=>t.stop());window.__callStream=null}}catch(e){}$("#ovl").innerHTML="";if(cid){const c=(S.chats||[]).find(x=>x.id===cid);if(c){c.messages.push({id:uid(),from:"me",type:"call",ctype:ctype,dur:dur,out:true,at:now()});c.last="مكالمة "+(ctype==="video"?"فيديو":"صوتية");c.lastAt=now();save();if(S.page==="chatRoom"&&S.params.id===cid)render()}}toast("انتهت المكالمة ("+Math.floor(dur/60)+":"+String(dur%60).padStart(2,"0")+") ","info");snd("tap")}

/* ---------- المجتمعات والنقابات ---------- */
function renderCommunitySearchHeader(activeFilter){
  const jGroups = (S.groups||[]).filter(g=>g.joined).length;
  const jGuilds = (S.communities||[]).filter(c=>c.joined).length;
  const jWorlds = (S.worlds||[]).filter(w=>w.joined).length;
  const tabs = [
    ["all", "الكل", "grid", jGroups + jGuilds + jWorlds],
    ["groups", "القروبات", "users", jGroups],
    ["guilds", "النقابات", "shield", jGuilds],
    ["worlds", "العوالم", "globe", jWorlds],
    ["suggestions", "مقترحات لك", "sparkles", null],
    ["explore", "استكشاف القروبات", "compass", null]
  ];
  return `<div class="row" style="gap:8px;margin-bottom:11px">
    <div class="row g1" style="gap:8px;background:var(--surface2);border:1px solid var(--line2);border-radius:13px;padding:9px 12px">
      <span style="color:var(--muted)">${I("search","i s")}</span>
      <input class="g1" style="background:none;border:none;font-size:12.5px" placeholder="ابحث عن نقابة أو مجموعة أو عالم..." value="${esc(S.comQ||"")}" oninput="S.comQ=this.value;saveDebounced();render()">
    </div>
    <button class="btn btn-primary btn-sm" onclick="openSheet('createBottom')">${I("plus","i s")} إنشاء</button>
  </div>
  <div class="chiprow" style="margin-bottom:12px">
    ${tabs.map(([k,l,ic,cnt])=>`
      <button class="chip ${(S.comFilter||'all')===k?'on':''}" style="${k==='suggestions'?'border-color:rgba(245,158,11,.45);color:var(--gold);':k==='explore'?'border-color:rgba(0,163,255,.45);color:var(--accent);':''}" onclick="S.comFilter='${k}';save();render();snd('tap')">
        ${I(ic,"i s")} ${l} ${cnt!=null?`<span class="badge b-gray mono" style="margin-right:3px;font-size:10px">${cnt}</span>`:""}
      </button>`).join("")}
  </div>`;
}

function renderCommunitySuggestions(q){
  const unjoinedGroups = (S.groups||[]).filter(g=>!g.joined && (!q || (g.name+(g.desc||'')).toLowerCase().includes(q)));
  const unjoinedGuilds = (S.communities||[]).filter(c=>!c.joined && (!q || (c.name+(c.desc||'')).toLowerCase().includes(q)));
  const unjoinedWorlds = (S.worlds||[]).filter(w=>!w.joined && (!q || (w.name+(w.theme||'')).toLowerCase().includes(q)));
  return `<div class="pad" style="padding-top:10px">
    ${renderCommunitySearchHeader('suggestions')}
    
    <div class="card opt-card" style="padding:16px;background:linear-gradient(135deg,rgba(245,158,11,.15),rgba(0,163,255,.08));border:1px solid rgba(245,158,11,.3);margin-bottom:14px">
      <div class="row" style="gap:11px">
        <span class="ico-tile" style="background:var(--grad-gold);color:#fff;width:42px;height:42px;border-radius:13px">${I("sparkles","i l")}</span>
        <div class="g1">
          <div class="b sm" style="color:var(--gold)">مقترحات مخصصة لك ✦</div>
          <div class="tiny fnt" style="margin-top:2px">مختارة بعناية بحسب اهتماماتك في الأنمي وشعبية الغرف والنشاط المباشر</div>
        </div>
      </div>
    </div>

    <div class="secttl">
      <h3>${I("users","i s")} قروبات أنمي مقترحة</h3>
      <button class="more" onclick="S.comFilter='explore';render()">${I("compass","i s")} استكشف الكل</button>
    </div>
    <div class="col" style="gap:9px;margin-bottom:16px">
      ${(unjoinedGroups.length ? unjoinedGroups.slice(0, 4) : (S.groups||[]).slice(0,3)).map(g=>`
        <div class="card opt-card" style="padding:12px">
          <div class="row" style="gap:11px">
            <span class="ico-tile" style="width:44px;height:44px;border-radius:14px;background:linear-gradient(135deg,${g.c1},${g.c2});color:#fff;flex-shrink:0">${I(g.icon,"i l")}</span>
            <div class="g1" style="min-width:0;text-align:right">
              <div class="row" style="gap:6px">
                <span class="b xs" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(g.name)}</span>
                <span class="badge b-cyan tiny">قروب نشط</span>
              </div>
              <div class="tiny fnt" style="margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(g.desc||"محادثات تفاعلية مستمرة")}</div>
              <div class="row tiny fnt" style="gap:8px;margin-top:4px">
                <span>${I("users","i s")} ${(g.members||[]).length} أعضاء</span>
                <span style="color:var(--emerald)"><span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:currentColor;margin-left:3px;vertical-align:middle"></span> مناقشات حية</span>
              </div>
            </div>
            <button class="btn btn-primary btn-xs" style="flex-shrink:0" onclick="joinGroup('${g.id}')">
              ${I("plus","i s")} انضمام
            </button>
          </div>
        </div>
      `).join("")}
    </div>

    <div class="secttl">
      <h3>${I("shield","i s")} نقابات كبرى مقترحة</h3>
    </div>
    <div class="col" style="gap:9px;margin-bottom:16px">
      ${(unjoinedGuilds.length ? unjoinedGuilds.slice(0, 4) : (S.communities||[]).slice(0,3)).map(c=>`
        <div class="card opt-card" style="padding:12px">
          <div class="row" style="gap:11px">
            <span class="ico-tile" style="width:44px;height:44px;border-radius:14px;background:linear-gradient(135deg,${c.c1},${c.c2});color:#fff;flex-shrink:0">${I(c.icon,"i l")}</span>
            <div class="g1" style="min-width:0;text-align:right">
              <div class="row" style="gap:6px">
                <span class="b xs" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(c.name)}</span>
                <span class="badge b-gold tiny">${c.type==='guild'?'نقابة نخبة':'مجتمع'}</span>
              </div>
              <div class="tiny fnt" style="margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(c.desc)}</div>
              <div class="row tiny fnt" style="gap:8px;margin-top:4px">
                <span>${I("users","i s")} ${nfmt(c.members)} عضو</span>
                <span style="color:var(--emerald)">${c.online} متصل</span>
                <span style="color:var(--gold)">${I("trophy","i s")} مهام نشطة</span>
              </div>
            </div>
            <button class="btn btn-gold btn-xs" style="flex-shrink:0" onclick="joinCommunity('${c.id}')">
              ${I("shield","i s")} انضمام
            </button>
          </div>
        </div>
      `).join("")}
    </div>

    <div class="secttl">
      <h3>${I("globe","i s")} عوالم أنمي مقترحة</h3>
    </div>
    <div style="display:flex;gap:10px;overflow-x:auto;padding-bottom:8px" class="no-sb">
      ${(unjoinedWorlds.length ? unjoinedWorlds : (S.worlds||[])).map(w=>`
        <div class="card2 opt-card" style="min-width:160px;padding:0;overflow:hidden;text-align:right">
          <div class="art-bg" style="--c1:${w.c1};--c2:${w.c2};height:80px;display:flex;align-items:center;justify-content:center;position:relative;color:#fff">
            ${I(w.icon,"xl")}
            <span class="badge b-emerald" style="position:absolute;top:6px;right:6px">${w.online} متصل</span>
          </div>
          <div style="padding:9px">
            <div class="tiny b" style="line-height:1.35">${esc(w.name)}</div>
            <div class="tiny fnt">${esc(w.theme)} · ${nfmt(w.members)} عضو</div>
            <button class="btn btn-cyan btn-xs" style="width:100%;margin-top:7px" onclick="${w.joined?`go('worldRoom',{id:'${w.id}'})`:`joinWorld('${w.id}')`}">
              ${w.joined ? I("fwd","i s") + " دخول" : I("plus","i s") + " انضمام"}
            </button>
          </div>
        </div>
      `).join("")}
    </div>
  </div>`;
}

function renderExploreGroups(q){
  const cat = S.exploreCat || "all";
  const cats = [
    ["all", "الكل"],
    ["shonen", "شونين وحماس"],
    ["theories", "نظريات ونقاشات"],
    ["manga", "مانجا وفصول"],
    ["games", "بطولات وألعاب"],
    ["art", "رسم وتصميم"],
    ["cosplay", "كوزبلاي وميديا"]
  ];
  const allItems = [
    ...(S.groups||[]).map(g=>({kind:'group', id:g.id, name:g.name, desc:g.desc||'', icon:g.icon, c1:g.c1, c2:g.c2, members:(g.members||[]).length, online:Math.max(1,Math.round((g.members||[]).length*0.4)), joined:g.joined, obj:g})),
    ...(S.communities||[]).map(c=>({kind:'community', id:c.id, name:c.name, desc:c.desc||'', icon:c.icon, c1:c.c1, c2:c.c2, members:c.members, online:c.online, joined:c.joined, obj:c})),
    ...(S.worlds||[]).map(w=>({kind:'world', id:w.id, name:w.name, desc:w.theme||'', icon:w.icon, c1:w.c1, c2:w.c2, members:w.members, online:w.online, joined:w.joined, obj:w}))
  ];
  const filtered = allItems.filter(item => {
    const matchQ = !q || (item.name + " " + item.desc).toLowerCase().includes(q);
    if (!matchQ) return false;
    if (cat === "shonen") return item.name.includes("ون بيس") || item.name.includes("ناروتو") || item.name.includes("جوجوتسو") || item.name.includes("شونين") || item.desc.includes("شونين");
    if (cat === "theories") return item.name.includes("نظريات") || item.name.includes("نقاش") || item.desc.includes("نظريات") || item.desc.includes("تحليل");
    if (cat === "manga") return item.name.includes("مانجا") || item.desc.includes("فصل") || item.desc.includes("مانجا");
    if (cat === "games") return item.name.includes("ألعاب") || item.name.includes("تحديات") || item.desc.includes("بطولة");
    if (cat === "art") return item.name.includes("رسم") || item.name.includes("تصميم") || item.desc.includes("فن");
    if (cat === "cosplay") return item.name.includes("كوزبلاي") || item.desc.includes("أزياء") || item.desc.includes("ميديا");
    return true;
  });

  return `<div class="pad" style="padding-top:10px">
    ${renderCommunitySearchHeader('explore')}
    
    <div class="row" style="gap:6px;overflow-x:auto;padding-bottom:8px;margin-bottom:10px" class="no-sb">
      ${cats.map(([k, l])=>`
        <button class="chip btn-xs ${cat===k?'on':''}" style="white-space:nowrap" onclick="S.exploreCat='${k}';render();snd('tap')">
          ${l}
        </button>
      `).join("")}
    </div>

    <div class="secttl">
      <h3>${I("compass","i s")} استكشاف المجتمعات والقروبات (${filtered.length})</h3>
    </div>

    <div class="col" style="gap:9px">
      ${filtered.length ? filtered.map(item => `
        <div class="card opt-card" style="padding:12px;cursor:pointer" onclick="${item.kind==='group'?`go('groupRoom',{id:'${item.id}'})`:item.kind==='community'?`go('communityDetail',{id:'${item.id}'})`:`go('worldRoom',{id:'${item.id}'})`}">
          <div class="row" style="gap:11px">
            <span class="ico-tile" style="width:46px;height:46px;border-radius:14px;background:linear-gradient(135deg,${item.c1},${item.c2});color:#fff;flex-shrink:0">${I(item.icon,"i l")}</span>
            <div class="g1" style="min-width:0;text-align:right">
              <div class="row" style="gap:6px">
                <span class="b xs" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(item.name)}</span>
                <span class="badge ${item.kind==='group'?'b-cyan':item.kind==='community'?'b-gold':'b-purple'} tiny">${item.kind==='group'?'قروب':item.kind==='community'?'نقابة':'عالم'}</span>
                ${item.joined ? `<span class="badge b-emerald tiny">منضم</span>` : ""}
              </div>
              <div class="tiny fnt" style="margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(item.desc)}</div>
              <div class="row tiny fnt" style="gap:8px;margin-top:4px">
                <span>${I("users","i s")} ${nfmt(item.members)}</span>
                <span style="color:var(--emerald)"><span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:currentColor;margin-left:3px;vertical-align:middle"></span>${item.online} متصل</span>
              </div>
            </div>
            <div style="flex-shrink:0" onclick="event.stopPropagation()">
              ${item.joined ? `
                <button class="btn btn-sec btn-xs" onclick="${item.kind==='group'?`go('groupRoom',{id:'${item.id}'})`:item.kind==='community'?`go('communityDetail',{id:'${item.id}'})`:`go('worldRoom',{id:'${item.id}'})`}">
                  ${I("fwd","i s")} فتح
                </button>
              ` : `
                <button class="btn btn-primary btn-xs" onclick="${item.kind==='group'?`joinGroup('${item.id}')`:item.kind==='community'?`joinCommunity('${item.id}')`:`joinWorld('${item.id}')`}">
                  ${I("plus","i s")} انضمام
                </button>
              `}
            </div>
          </div>
        </div>
      `).join("") : emptyState("compass", "لا توجد نتائج مطابقة", "جرب البحث بكلمات أخرى أو اختر تصنيفاً مختلفاً")}
    </div>
  </div>`;
}

function communityList(){
  const q=(S.comQ||"").toLowerCase();
  const filter = S.comFilter || "all";

  if (filter === "suggestions") {
    return renderCommunitySuggestions(q);
  }
  if (filter === "explore") {
    return renderExploreGroups(q);
  }
  if (filter === "groups") {
    const joinedGroups = (S.groups||[]).filter(g => g.joined && (!q || (g.name+(g.desc||'')).toLowerCase().includes(q)));
    return `<div class="pad" style="padding-top:10px">
      ${renderCommunitySearchHeader(filter)}
      <div class="secttl">
        <h3>${I("users","i s")} قروباتي المنضم إليها (${joinedGroups.length})</h3>
        <button class="more" onclick="S.comFilter='explore';render()">${I("compass","i s")} استكشف المزيد</button>
      </div>
      <div class="col" style="gap:8px">
        ${joinedGroups.length ? joinedGroups.map(g => groupRow(g)).join("") : `
          <div class="card opt-card center" style="padding:28px 16px;text-align:center">
            <span class="ico-tile" style="width:56px;height:56px;border-radius:18px;background:var(--surface3);margin:0 auto 12px;color:var(--muted)">${I("users","l")}</span>
            <div class="b sm">لست منضماً لأي قروب بعد</div>
            <div class="tiny fnt mut" style="margin:6px auto 14px;max-width:280px">انضم إلى قروبات الأنمي الممتعة وتحدث مع الأعضاء في غرف نقاش نشطة</div>
            <div class="row" style="gap:8px;justify-content:center">
              <button class="btn btn-primary btn-sm" onclick="S.comFilter='explore';render()">${I("compass","i s")} استكشاف القروبات</button>
              <button class="btn btn-sec btn-sm" onclick="go('createGroup')">${I("plus","i s")} إنشاء قروب</button>
            </div>
          </div>
        `}
      </div>
    </div>`;
  }
  if (filter === "guilds") {
    const joinedGuilds = (S.communities||[]).filter(c => c.joined && (!q || (c.name+(c.desc||'')).toLowerCase().includes(q)));
    return `<div class="pad" style="padding-top:10px">
      ${renderCommunitySearchHeader(filter)}
      <div class="secttl">
        <h3>${I("shield","i s")} نقاباتي ومجتمعاتي (${joinedGuilds.length})</h3>
        <button class="more" onclick="S.comFilter='suggestions';render()">${I("sparkles","i s")} نقابات مقترحة</button>
      </div>
      <div class="col" style="gap:8px">
        ${joinedGuilds.length ? joinedGuilds.map(c => communityRow(c)).join("") : `
          <div class="card opt-card center" style="padding:28px 16px;text-align:center">
            <span class="ico-tile" style="width:56px;height:56px;border-radius:18px;background:var(--surface3);margin:0 auto 12px;color:var(--muted)">${I("shield","l")}</span>
            <div class="b sm">لست منضماً لأي نقابة بعد</div>
            <div class="tiny fnt mut" style="margin:6px auto 14px;max-width:280px">انضم لنقابات النخبة، شارك في مهام الرتب الأسبوعية واكسب مكافآت الخزينة</div>
            <div class="row" style="gap:8px;justify-content:center">
              <button class="btn btn-gold btn-sm" onclick="S.comFilter='suggestions';render()">${I("sparkles","i s")} تصفح النقابات المقترحة</button>
              <button class="btn btn-sec btn-sm" onclick="go('createGuild')">${I("plus","i s")} إنشاء نقابة</button>
            </div>
          </div>
        `}
      </div>
    </div>`;
  }
  if (filter === "worlds") {
    const joinedWorlds = (S.worlds||[]).filter(w => w.joined && (!q || (w.name+(w.theme||'')).toLowerCase().includes(q)));
    return `<div class="pad" style="padding-top:10px">
      ${renderCommunitySearchHeader(filter)}
      <div class="secttl">
        <h3>${I("globe","i s")} عوالمي المنضم إليها (${joinedWorlds.length})</h3>
        <button class="more" onclick="go('worlds')">جميع العوالم</button>
      </div>
      <div class="col" style="gap:8px">
        ${joinedWorlds.length ? joinedWorlds.map(w => worldRow(w)).join("") : `
          <div class="card opt-card center" style="padding:28px 16px;text-align:center">
            <span class="ico-tile" style="width:56px;height:56px;border-radius:18px;background:var(--surface3);margin:0 auto 12px;color:var(--muted)">${I("globe","l")}</span>
            <div class="b sm">لست منضماً لأي عالم أنمي بعد</div>
            <div class="tiny fnt mut" style="margin:6px auto 14px;max-width:280px">عش أجواء عوالم الأنمي الكبرى وشارك في قصص وتقمص أدوار مستمر</div>
            <div class="row" style="gap:8px;justify-content:center">
              <button class="btn btn-cyan btn-sm" onclick="go('worlds')">${I("globe","i s")} استكشاف العوالم</button>
              <button class="btn btn-sec btn-sm" onclick="go('createWorld')">${I("plus","i s")} إنشاء عالم</button>
            </div>
          </div>
        `}
      </div>
    </div>`;
  }

  // Filter is "all"
  const jGroups = (S.groups||[]).filter(g => g.joined && (!q || (g.name+(g.desc||'')).toLowerCase().includes(q)));
  const jGuilds = (S.communities||[]).filter(c => c.joined && (!q || (c.name+(c.desc||'')).toLowerCase().includes(q)));
  const jWorlds = (S.worlds||[]).filter(w => w.joined && (!q || (w.name+(w.theme||'')).toLowerCase().includes(q)));
  const totalJoined = jGroups.length + jGuilds.length + jWorlds.length;

  return `<div class="pad" style="padding-top:10px">
    ${renderCommunitySearchHeader(filter)}

    ${!totalJoined ? `
      <div class="card opt-card center" style="padding:28px 16px;text-align:center;margin-bottom:14px">
        <span class="ico-tile" style="width:56px;height:56px;border-radius:18px;background:linear-gradient(135deg,rgba(0,163,255,.2),rgba(245,158,11,.2));margin:0 auto 12px">${I("users","l")}</span>
        <div class="b sm">مرحباً بك في مجتمعات ونقابات أنمي بلاك!</div>
        <div class="tiny fnt mut" style="margin:6px auto 14px;max-width:280px">لست منضماً لأي قروب أو نقابة بعد. ابدأ باكتشاف القروبات النشطة أو تصفح المقترحات لك</div>
        <div class="row" style="gap:8px;justify-content:center">
          <button class="btn btn-primary btn-sm" onclick="S.comFilter='explore';render()">${I("compass","i s")} استكشاف القروبات</button>
          <button class="btn btn-gold btn-sm" onclick="S.comFilter='suggestions';render()">${I("sparkles","i s")} مقترحات لك</button>
        </div>
      </div>
    ` : ""}

    ${jGroups.length ? `
      <div class="secttl">
        <h3>${I("users","i s")} قروباتي (${jGroups.length})</h3>
        <button class="more" onclick="S.comFilter='groups';render()">عرض الكل</button>
      </div>
      <div class="col" style="gap:8px;margin-bottom:14px">${jGroups.map(g=>groupRow(g)).join("")}</div>
    ` : ""}

    ${jGuilds.length ? `
      <div class="secttl">
        <h3>${I("shield","i s")} نقاباتي (${jGuilds.length})</h3>
        <button class="more" onclick="S.comFilter='guilds';render()">عرض الكل</button>
      </div>
      <div class="col" style="gap:8px;margin-bottom:14px">${jGuilds.map(c=>communityRow(c)).join("")}</div>
    ` : ""}

    ${jWorlds.length ? `
      <div class="secttl">
        <h3>${I("globe","i s")} عوالمي (${jWorlds.length})</h3>
        <button class="more" onclick="S.comFilter='worlds';render()">عرض الكل</button>
      </div>
      <div class="col" style="gap:8px;margin-bottom:14px">${jWorlds.map(w=>worldRow(w)).join("")}</div>
    ` : ""}

    <div class="rowb" style="margin-top:10px;padding:12px 14px;background:var(--surface2);border-radius:14px;border:1px solid var(--line2)">
      <div>
        <div class="xs b">${I("sparkles","i s")} تريد اكتشاف مجتمعات أكثر؟</div>
        <div class="tiny fnt">تصفح المقترحات الذكية أو استكشف جميع القروبات المفتوحة</div>
      </div>
      <div class="row" style="gap:6px">
        <button class="btn btn-gold btn-xs" onclick="S.comFilter='suggestions';render()">${I("sparkles","i s")} المقترحات</button>
        <button class="btn btn-primary btn-xs" onclick="S.comFilter='explore';render()">${I("compass","i s")} الاستكشاف</button>
      </div>
    </div>
  </div>`;
}
function communityRow(c){
  const tt={guild:"b-gold",group:"b-cyan",channel:"b-purple",space:"b-emerald"}[c.type];
  const tn={guild:"نقابة",group:"مجموعة",channel:"قناة",space:"مساحة"}[c.type];
  return `<button class="lstrow" onclick="go('communityDetail',{id:'${c.id}'})">
    <span class="ico-tile" style="width:46px;height:46px;border-radius:14px;background:linear-gradient(135deg,${c.c1},${c.c2});">${I(c.icon,"i l")}</span>
    <span class="g1" style="text-align:right;min-width:0">
      <span class="row" style="gap:5px"><span class="b xs">${esc(c.name)}</span><span class="badge ${tt}">${tn}</span>${c.joined?`<span class="badge b-emerald">${esc(c.rank)}</span>`:`<span class="badge b-gray">غير منضم</span>`}</span>
      <span class="tiny fnt" style="display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(c.desc)}</span>
      <span class="row tiny fnt" style="gap:9px;margin-top:2px"><span>${I("users","i s")} ${nfmt(c.members)}</span><span style="color:var(--emerald)"><span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:currentColor;margin-left:4px;vertical-align:middle"></span> ${c.online} متصل</span>${c.channels.reduce((a,ch)=>a+ch.unread,0)?`<span class="badge b-red mono">${c.channels.reduce((a,ch)=>a+ch.unread,0)} جديد</span>`:""}</span>
    </span>${I("fwd","i s")}</button>`;
}
PAGES.communitySuggestions = () => {
  setNav(true);
  setHdr(backHdr("مقترحات لك", "مجموعات ونقابات مختارة بعناية لذوقك"));
  return renderCommunitySuggestions(S.comQ || "");
};

PAGES.exploreGroups = () => {
  setNav(true);
  setHdr(backHdr("استكشاف القروبات والمجتمعات", "اكتشف أحدث المجموعات والنقابات النشطة"));
  return renderExploreGroups(S.comQ || "");
};

