const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');
const target = '${ltIcon(c)}${esc(c.last)}';
const replacement = '${ltIcon(c)}${(S.typingIn && S.typingIn[c.id]) ? \'<span style="color:var(--accent)">يكتب الآن...</span>\' : esc(c.last)}';
code = code.replace(target, replacement);
fs.writeFileSync('index.html', code);
console.log("Success");
