const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const replacementWorldRoom = `PAGES.worldRoom=()=>{const w=(S.worlds||[]).find(x=>x.id===S.params.id);if(!w){setNav(false);setHdr(backHdr("العالم",""));return emptyState("globe","العالم غير موجود","")}
  setNav(false);
  setTimeout(() => { if (typeof window.listenWorldMessages === 'function') window.listenWorldMessages(w.id); }, 60);`;

html = html.replace(/PAGES\.worldRoom=\(\)=>\{const w=\(S\.worlds\|\|\[\]\)\.find\(x=>x\.id===S\.params\.id\);if\(!w\)\{setNav\(false\);setHdr\(backHdr\("العالم",""\)\);return emptyState\("globe","العالم غير موجود",""\)\}\s*setNav\(false\);/, replacementWorldRoom);

const listenWorldMessages = `
window.listenWorldMessages = function(wid) {
  if (!wid || !window.db || !window.collection || !window.onSnapshot) return;
  if (window._worldSnapUnsub) {
    try { window._worldSnapUnsub(); } catch(e){}
    window._worldSnapUnsub = null;
  }
  try {
    const q = window.query(window.collection(window.db, "worlds", wid, "messages"));
    window._worldSnapUnsub = window.onSnapshot(q, (snap) => {
      const w = (S.worlds || []).find(x => x.id === wid);
      if (!w) return;
      w.msgs = w.msgs || [];
      let changed = false;
      snap.docChanges().forEach(ch => {
        const d = ch.doc.data();
        if (!d || !d.id) return;
        if (ch.type === "added") {
          if (!w.msgs.some(m => m.id === d.id)) {
            w.msgs.push(d);
            changed = true;
          }
        } else if (ch.type === "modified") {
          const idx = w.msgs.findIndex(m => m.id === d.id);
          if (idx > -1) {
            w.msgs[idx] = Object.assign(w.msgs[idx], d);
            changed = true;
          }
        } else if (ch.type === "removed") {
          w.msgs = w.msgs.filter(m => m.id !== d.id);
          changed = true;
        }
      });
      if (changed) {
        w.msgs.sort((a,b) => (a.at || 0) - (b.at || 0));
        saveDebounced();
        if (S.page === "worldRoom" && S.params && S.params.id === wid) {
          const b = document.getElementById("wbody");
          if (b) {
            b.innerHTML = w.msgs.map(m => {
              const me = m.uid === "me" || isMsgMine(m);
              const mu = me ? S.me : u(m.uid || m.senderId);
              return \`<div class="msg \${me ? "me" : "them"}" data-mid="\${m.id}" data-ctx="world" oncontextmenu="event.preventDefault();openSheet('roomMsgMenu','\${m.id}')" style="max-width:88%">
                <div class="row" style="gap:5px;margin-bottom:3px">\${av(mu,18)}<span class="tiny b" style="color:\${me ? "#fff" : "var(--accent)"}">\${me ? "أنت" : esc(mu.name)}</span>\${w.owner===m.uid ? \`<span class="badge b-gold">مالك العالم</span>\` : ""}</div>
                \${roomMsgBody(m, me)}
                <span class="tm">\${hhmm(m.at)}</span>
              </div>\`;
            }).join("");
            b.scrollTo({top: b.scrollHeight, behavior: "smooth"});
          }
        }
      }
    });
  } catch(e) {
    console.warn("listenWorldMessages err:", e);
  }
};
`;

const sendWorldMsgRepl = `
function sendWorldMsg(id){const w=(S.worlds||[]).find(x=>x.id===id);const i=$("#win");if(!w||!i)return;const t=(i.value||"").trim();if(!t)return;i.value="";i.style.height="auto";setTimeout(()=>{try{i.focus()}catch(e){}},10);
  const mId = uid();
  const myUid = getMyUid();
  const mObj = { id: mId, uid: myUid, senderId: myUid, text: t, at: now(), type: "text" };
  w.msgs.push(mObj); save(); snd("send"); questProgress("q4");
  if (window.db && window.setDoc && window.doc && window.collection) {
    window.setDoc(window.doc(window.collection(window.db, "worlds", id, "messages"), mId), mObj).catch(e => console.error(e));
  }
  const b=$("#wbody");if(b){b.insertAdjacentHTML("beforeend",\`<div class="msg me" data-ctx="world" style="max-width:88%"><div class="row" style="gap:5px;margin-bottom:3px">\${av(S.me,18)}<span class="tiny b" style="color:#fff">أنت</span></div>\${linkify(t)}<span class="tm">\${hhmm(now())}</span></div>\`);b.scrollTop=b.scrollHeight}
`;

html = html.replace(/function sendWorldMsg\(id\)\{const w=\(S\.worlds\|\|\[\]\)\.find\(x=>x\.id===id\);const i=\$\("#win"\);if\(!w\|\|!i\)return;const t=\(i\.value\|\|""\)\.trim\(\);if\(!t\)return;i\.value="";i\.style\.height="auto";setTimeout\(\(\)=>\{try\{i\.focus\(\)\}catch\(e\)\{\}\},10\);\s*w\.msgs\.push\(\{id:uid\(\),uid:"me",text:t,at:now\(\)\}\);save\(\);snd\("send"\);questProgress\("q4"\);\s*const b=\$\("#wbody"\);if\(b\)\{b\.insertAdjacentHTML\("beforeend",`<div class="msg me" data-ctx="world" style="max-width:88%"><div class="row" style="gap:5px;margin-bottom:3px">\$\{av\(S\.me,18\)\}<span class="tiny b" style="color:#fff">أنت<\/span><\/div>\$\{linkify\(t\)\}<span class="tm">\$\{hhmm\(now\(\)\)\}<\/span><\/div>`\);b\.scrollTop=b\.scrollHeight\}/, sendWorldMsgRepl);

html = html.replace('function joinWorld(id)', listenWorldMessages + '\nfunction joinWorld(id)');

fs.writeFileSync('index.html', html);
