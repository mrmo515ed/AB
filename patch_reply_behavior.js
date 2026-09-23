const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// 1. Create setGroupReply and setWorldReply functions
const helperFns = `
window.setGroupReply = function(gid, mid) {
  S.gReply = {g: gid, m: mid};
  const m = msgById(mid) || ((S.groups||[]).find(x=>x.id===gid)?.msgs||[]).find(x=>x.id===mid);
  const textPreview = m ? (m.text || "وسائط").slice(0, 50) : "رسالة";
  let rb = document.getElementById("reply_bar_g");
  if (!rb) {
    const inp = document.getElementById("gin");
    const composer = inp ? inp.closest(".composer") : null;
    if (composer && composer.parentNode) {
      rb = document.createElement("div");
      rb.id = "reply_bar_g";
      rb.className = "row";
      rb.style.cssText = "gap:8px;padding:6px 12px;background:var(--surface2);border-top:1px solid var(--line);flex-shrink:0";
      composer.parentNode.insertBefore(rb, composer);
    }
  }
  if (rb) {
    rb.innerHTML = \`<span style="color:var(--accent)">\${I("reply","i s")}</span><span class="tiny g1" style="text-align:right">رد على: \${esc(textPreview)}</span><button class="iconbtn" style="width:26px;height:26px" onclick="S.gReply=null;const b=document.getElementById('reply_bar_g');if(b)b.remove();">\${I("x","i s")}</button>\`;
  }
  const inp = document.getElementById("gin");
  if (inp) {
    setTimeout(() => { try { inp.focus({ preventScroll: true }); } catch(e) { inp.focus(); } const len = inp.value.length; inp.setSelectionRange(len, len); }, 40);
  }
};
window.setWorldReply = function(wid, mid) {
  S.wReply = {w: wid, m: mid};
  const m = msgById(mid) || ((S.worlds||[]).find(x=>x.id===wid)?.msgs||[]).find(x=>x.id===mid);
  const textPreview = m ? (m.text || "وسائط").slice(0, 50) : "رسالة";
  let rb = document.getElementById("reply_bar_w");
  if (!rb) {
    const inp = document.getElementById("win");
    const composer = inp ? inp.closest(".composer") : null;
    if (composer && composer.parentNode) {
      rb = document.createElement("div");
      rb.id = "reply_bar_w";
      rb.className = "row";
      rb.style.cssText = "gap:8px;padding:6px 12px;background:var(--surface2);border-top:1px solid var(--line);flex-shrink:0";
      composer.parentNode.insertBefore(rb, composer);
    }
  }
  if (rb) {
    rb.innerHTML = \`<span style="color:var(--accent)">\${I("reply","i s")}</span><span class="tiny g1" style="text-align:right">رد على: \${esc(textPreview)}</span><button class="iconbtn" style="width:26px;height:26px" onclick="S.wReply=null;const b=document.getElementById('reply_bar_w');if(b)b.remove();">\${I("x","i s")}</button>\`;
  }
  const inp = document.getElementById("win");
  if (inp) {
    setTimeout(() => { try { inp.focus({ preventScroll: true }); } catch(e) { inp.focus(); } const len = inp.value.length; inp.setSelectionRange(len, len); }, 40);
  }
};
`;

html = html.replace('window.setReplyTo = function(mid) {', helperFns + '\nwindow.setReplyTo = function(mid) {');

// 2. Fix the swipe handlers
html = html.replace(/if\(ctx==="group"\)\{const gid=S\.params\.id;S\.gReply=\{g:gid,m:mid\};render\(\);snd\("tap"\);toast\("رد باقتباس \(المجموعة\) ","info"\);return\}/,
  `if(ctx==="group"){window.setGroupReply(S.params.id, mid);snd("tap");toast("رد باقتباس (المجموعة) ","info");return}`);

html = html.replace(/if\(ctx==="world"\)\{S\.wReply=\{w:S\.params\.id,m:mid\};render\(\);snd\("tap"\);toast\("رد باقتباس \(العالم\) ","info"\);return\}/,
  `if(ctx==="world"){window.setWorldReply(S.params.id, mid);snd("tap");toast("رد باقتباس (العالم) ","info");return}`);

// 3. Fix roomMsgMenu
html = html.replace(/<button class="lstrow" style="padding:11px" onclick="closeOvl\(\);\$\{isGroup\?`S\.gReply=\{g:'\$\{\(room\|\|\{\}\)\.id\}',m:'\$\{mid\}'\}`:`S\.wReply=\{w:'\$\{\(room\|\|\{\}\)\.id\}',m:'\$\{mid\}'\}`\};render\(\)"/g,
  `<button class="lstrow" style="padding:11px" onmousedown="event.preventDefault()" ontouchstart="event.preventDefault()" onclick="closeOvl();if(isGroup){window.setGroupReply((room||{}).id, mid);}else{window.setWorldReply((room||{}).id, mid);}"`);

// 4. Fix msgMenu
html = html.replace(/<button class="lstrow" onclick="closeOvl\(\);window\.setReplyTo\('\$\{mid\}'\)">/g,
  `<button class="lstrow" onmousedown="event.preventDefault()" ontouchstart="event.preventDefault()" onclick="closeOvl();window.setReplyTo('\${mid}')">`);

// 5. Fix chat HTML to use the new IDs
html = html.replace(/\$\{S\.gReply&&S\.gReply\.g===g\.id\?`<div class="row"([^>]*)><span([^>]*)>\$\{I\("reply","i s"\)\}<\/span><span([^>]*)>رد على: \$\{esc\(\(\(g\.msgs\|\|\[\]\)\.find\(x=>x\.id===S\.gReply\.m\)\|\|\{\}\)\.text\|\|"وسائط"\)\.slice\(0,50\)\}<\/span><button([^>]*) onclick="S\.gReply=null;render\(\)">\$\{I\("x","i s"\)\}<\/button><\/div>`:""\}/,
  `\${S.gReply&&S.gReply.g===g.id?\`<div id="reply_bar_g" class="row" $1><span $2>\${I("reply","i s")}</span><span $3>رد على: \${esc(((g.msgs||[]).find(x=>x.id===S.gReply.m)||{}).text||"وسائط").slice(0,50)}</span><button $4 onclick="S.gReply=null;const b=document.getElementById('reply_bar_g');if(b)b.remove();">\${I("x","i s")}</button></div>\` : ""}`);

html = html.replace(/\$\{S\.wReply&&S\.wReply\.w===w\.id\?`<div class="row"([^>]*)><span([^>]*)>\$\{I\("reply","i s"\)\}<\/span><span([^>]*)>رد على: \$\{esc\(\(\(w\.msgs\|\|\[\]\)\.find\(x=>x\.id===S\.wReply\.m\)\|\|\{\}\)\.text\|\|"وسائط"\)\.slice\(0,50\)\}<\/span><button([^>]*) onclick="S\.wReply=null;render\(\)">\$\{I\("x","i s"\)\}<\/button><\/div>`:""\}/,
  `\${S.wReply&&S.wReply.w===w.id?\`<div id="reply_bar_w" class="row" $1><span $2>\${I("reply","i s")}</span><span $3>رد على: \${esc(((w.msgs||[]).find(x=>x.id===S.wReply.m)||{}).text||"وسائط").slice(0,50)}</span><button $4 onclick="S.wReply=null;const b=document.getElementById('reply_bar_w');if(b)b.remove();">\${I("x","i s")}</button></div>\` : ""}`);

fs.writeFileSync('index.html', html);
