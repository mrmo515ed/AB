const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const faultyOtherUid = 'const otherUid = (S.chats || []).find(x => x.id === cid)?.userId || "user_friend";';
const newOtherUid = 'const cObj = (S.chats || []).find(x => x.id === cid); const otherUid = cObj ? getPartnerUid(cObj, myUid) : "user_friend";';

code = code.replace(faultyOtherUid, newOtherUid);

fs.writeFileSync('index.html', code);
console.log("Chat sync patched");
