const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');
code = code.replace('if (window._usersSub) {', 'if (window._myUserSub) { window._myUserSub(); window._myUserSub = null; }\n      if (window._usersSub) {');
fs.writeFileSync('index.html', code);
console.log("Success");
