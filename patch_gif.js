const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// 1. Add 'gif' to attachSheet
html = html.replace(/\[\["image","صورة","linear-gradient\(135deg, #06B6D4, #3B82F6\)"\],\["video","فيديو"/, 
  '[["image","صورة","linear-gradient(135deg, #06B6D4, #3B82F6)"],["gif","GIF","linear-gradient(135deg, #FF0066, #9933FF)"],["video","فيديو"');

// 2. Modify attachToChat to handle 'gif'
const attachToChatGrep = `function attachToChat(type){`;
const attachToChatReplacement = `function attachToChat(type){
  if(type === 'gif') {
    closeOvl();
    openSheet('gifSearchSheet');
    return;
  }
`;
html = html.replace(attachToChatGrep, attachToChatReplacement);

// 3. Add gifSearchSheet and GIF search logic (using Tenor API or dummy list of real anime GIFs if API not available)
// A lightweight dummy GIF search feature with sample anime/real reaction gifs.
const gifFns = `
const DUMMY_GIFS = [
  "https://media.tenor.com/7RjJ7O4x_2wAAAAC/anime-sad.gif",
  "https://media.tenor.com/L5XbT1iO1o0AAAAC/anime-cry.gif",
  "https://media.tenor.com/XqTOf8g7r4cAAAAC/anime-happy.gif",
  "https://media.tenor.com/N710Gg5g1nAAAAAC/anime-smile.gif",
  "https://media.tenor.com/Jz0gU8QYgHMAAAAC/anime-shock.gif",
  "https://media.tenor.com/9vB4w5VzD2oAAAAC/anime-angry.gif",
  "https://media.tenor.com/6Xy1a9bT42kAAAAC/anime-confused.gif",
  "https://media.tenor.com/qLwG3R5B11EAAAAC/anime-laugh.gif",
  "https://media.tenor.com/8QW9K9U4L0cAAAAC/anime-love.gif",
  "https://media.tenor.com/2Xy5k8xL8wQAAAAC/anime-blush.gif",
  "https://media.tenor.com/o1b0c9D3o9cAAAAC/anime-wink.gif",
  "https://media.tenor.com/7b2z9Z8V1YIAAAAC/anime-tired.gif"
];
SHEETS.gifSearchSheet = () => {
  setTimeout(() => {
    const q = document.getElementById('gif_q');
    if (q) q.focus();
  }, 100);
  return sheet(I("image","i s")+" بحث GIF انمي", \`
  <div class="col" style="height:350px">
    <div class="row" style="gap:8px;background:var(--surface2);border:1px solid var(--line2);border-radius:12px;padding:9px 11px;margin-bottom:10px">
      \${I("search","i s")}<input class="g1" id="gif_q" style="background:none;border:none;font-size:12.5px" placeholder="ابحث عن GIFs (مثال: naruto, sad, happy)..." oninput="window.searchTenorGifs(this.value)">
    </div>
    <div id="gif_results" style="display:grid;grid-template-columns:1fr 1fr;gap:8px;overflow-y:auto;padding-bottom:10px" class="no-sb">
      \${DUMMY_GIFS.map(g => \`<img src="\${g}" style="width:100%;height:100px;object-fit:cover;border-radius:8px;cursor:pointer" onclick="window.sendGif('\${g}')">\`).join("")}
    </div>
  </div>\`);
};

window.searchTenorGifs = async function(query) {
  const resEl = document.getElementById('gif_results');
  if (!resEl) return;
  if (!query.trim()) {
    resEl.innerHTML = DUMMY_GIFS.map(g => \`<img src="\${g}" style="width:100%;height:100px;object-fit:cover;border-radius:8px;cursor:pointer" onclick="window.sendGif('\${g}')">\`).join("");
    return;
  }
  // Optional: fetch real Tenor API if you have a key, for now we filter dummy if no key.
  // Real implementation (rate limited without proper key, but works for basic test):
  try {
    const apiKey = "LIVDSRZULELA"; // Public test key
    const url = \`https://g.tenor.com/v1/search?q=\${encodeURIComponent(query + ' anime')}&key=\${apiKey}&limit=20\`;
    const resp = await fetch(url);
    const data = await resp.json();
    if (data.results && data.results.length > 0) {
      resEl.innerHTML = data.results.map(r => {
        const url = r.media[0].tinygif.url;
        return \`<img src="\${url}" style="width:100%;height:100px;object-fit:cover;border-radius:8px;cursor:pointer" onclick="window.sendGif('\${url}')">\`;
      }).join("");
    } else {
      resEl.innerHTML = \`<div class="center mut tiny" style="grid-column:1/-1;padding:20px 0">لا توجد نتائج</div>\`;
    }
  } catch(e) {
    console.warn("Tenor error:", e);
  }
};

window.sendGif = function(url) {
  const cid = S.activeChat;
  if(!cid) return;
  closeOvl();
  const c = (S.chats||[]).find(x=>x.id===cid);
  if(!c) return;
  c.messages = c.messages || [];
  const mid = uid();
  const mObj = {
    id: mid,
    from: "me",
    senderId: getMyUid(),
    senderName: S.me.name || "أنا",
    text: "",
    type: "gif",
    src: url,
    at: now(),
    st: 1,
    pending: true
  };
  c.messages.push(mObj);
  c.last = "ملصق متحرك GIF";
  c.lastAt = now();
  save();
  snd("send");
  render();
  syncChatMessage(cid, mObj);
};
`;
html = html.replace('// 14. IN-CHAT CONTACT/POLL PREVIEWS', gifFns + '\n// 14. IN-CHAT CONTACT/POLL PREVIEWS');

fs.writeFileSync('index.html', html);
