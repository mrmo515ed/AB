const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const badC = `  let c = (S.chats || []).find(x => x.id === cid);
  if (!c && cid) {
    c = { id: cid, userId: (S.params && S.params.uid) || "user_friend", messages: [], last: "", lastAt: now(), unread: 0 };
    S.chats = S.chats || [];
    S.chats.unshift(c);
  }`;

const goodC = `  let c = (S.chats || []).find(x => x.id === cid);
  if (!c && cid) {
    let extractedUid = (S.params && S.params.uid) || "user_friend";
    if (extractedUid === "user_friend" && cid.startsWith("ch_")) {
       const myUid = getChatMyUid();
       extractedUid = cid.slice(3).split("_").find(p => p !== myUid) || extractedUid;
    }
    c = { id: cid, userId: extractedUid, messages: [], last: "", lastAt: now(), unread: 0 };
    c.participants = Array.from(new Set([getChatMyUid(), extractedUid])).sort();
    S.chats = S.chats || [];
    S.chats.unshift(c);
  }`;

code = code.replace(badC, goodC);
fs.writeFileSync('index.html', code);
console.log("Send msg patched");
