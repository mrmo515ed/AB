const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Inject the surgical update function
const surgicalFunc = `
window.updateRoomChatDom = function(container, msgs, ctx, ownerOrAdmins) {
  if (!container) return;
  // If too many messages or container empty, full render is fine initially
  if (container.children.length === 0 || msgs.length < container.children.length) {
    container.innerHTML = msgs.map(m => {
      const me = m.uid === "me" || isMsgMine(m);
      const mu = me ? S.me : u(m.uid || m.senderId);
      const badge = (ctx==="group" && (ownerOrAdmins||[]).includes(m.uid)) ? '<span class="badge b-gold">مشرف</span>' : (ctx==="world" && ownerOrAdmins===m.uid ? '<span class="badge b-gold">مالك العالم</span>' : "");
      return \`<div class="msg \${me ? "me" : "them"}" id="room_m_\${m.id}" data-mid="\${m.id}" data-ctx="\${ctx}" oncontextmenu="event.preventDefault();openSheet('roomMsgMenu','\${m.id}')" style="max-width:88%">
        <div class="row" style="gap:5px;margin-bottom:3px">\${av(mu,18)}<span class="tiny b" style="color:\${me ? "#fff" : "var(--accent)"}">\${me ? "أنت" : esc(mu.name)}</span>\${badge}</div>
        \${roomMsgBody(m, me)}
        <span class="tm">\${hhmm(m.at)}</span>
      </div>\`;
    }).join("");
    return;
  }
  
  // Surgical update
  const existingIds = new Set(Array.from(container.children).map(c => c.getAttribute("data-mid")).filter(Boolean));
  msgs.forEach(m => {
    const mId = "room_m_" + m.id;
    let el = document.getElementById(mId);
    if (!el) {
      const me = m.uid === "me" || isMsgMine(m);
      const mu = me ? S.me : u(m.uid || m.senderId);
      const badge = (ctx==="group" && (ownerOrAdmins||[]).includes(m.uid)) ? '<span class="badge b-gold">مشرف</span>' : (ctx==="world" && ownerOrAdmins===m.uid ? '<span class="badge b-gold">مالك العالم</span>' : "");
      const html = \`<div class="msg \${me ? "me" : "them"}" id="\${mId}" data-mid="\${m.id}" data-ctx="\${ctx}" oncontextmenu="event.preventDefault();openSheet('roomMsgMenu','\${m.id}')" style="max-width:88%">
        <div class="row" style="gap:5px;margin-bottom:3px">\${av(mu,18)}<span class="tiny b" style="color:\${me ? "#fff" : "var(--accent)"}">\${me ? "أنت" : esc(mu.name)}</span>\${badge}</div>
        \${roomMsgBody(m, me)}
        <span class="tm">\${hhmm(m.at)}</span>
      </div>\`;
      container.insertAdjacentHTML("beforeend", html);
    }
  });
  
  // Cleanup removed messages
  const msgIds = new Set(msgs.map(m => m.id));
  Array.from(container.children).forEach(el => {
    const mid = el.getAttribute("data-mid");
    if (mid && !msgIds.has(mid)) el.remove();
  });
};
`;

if (!html.includes('window.updateRoomChatDom = function')) {
  html = html.replace('function roomMsgBody', surgicalFunc + '\nfunction roomMsgBody');
}

// Replace in groups
html = html.replace(/b\.innerHTML\s*=\s*g\.msgs\.map\([\s\S]*?\}\)\.join\(""\);/, "window.updateRoomChatDom(b, g.msgs, 'group', g.admins);");

// Replace in worlds
html = html.replace(/b\.innerHTML\s*=\s*w\.msgs\.map\([\s\S]*?\}\)\.join\(""\);/, "window.updateRoomChatDom(b, w.msgs, 'world', w.owner);");

fs.writeFileSync('index.html', html);
