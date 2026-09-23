const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

code = code.replace(
  /merged\.sort\(\(a,b\)=>\(a\.at\|\|a\.createdAt\|\|0\)-\(b\.at\|\|b\.createdAt\|\|0\)\);/g,
  `merged.sort((a,b) => { const getMs = (m) => (m.createdAt ? m.createdAt : (m.at ? m.at : 0)); return getMs(a) - getMs(b); });`
);

fs.writeFileSync('index.html', code);
console.log('patched sort');
