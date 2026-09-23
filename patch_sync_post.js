const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const regex = /const curUid = \(window\.auth && window\.auth\.currentUser\) \? window\.auth\.currentUser\.uid : \(S\.me\.id \|\| "me"\);/;
const replacement = `if (!window.auth || !window.auth.currentUser) { toast("يرجى تسجيل الدخول أولاً", "err"); return; }
      const curUid = window.auth.currentUser.uid;`;

html = html.replace(regex, replacement);
fs.writeFileSync('index.html', html);
