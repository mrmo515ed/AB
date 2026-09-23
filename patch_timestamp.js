const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

// 1. In syncChatMessage, use window.serverTimestamp() for createdAt
code = code.replace(
  /const cloudMsg = Object\.assign\(\{\}, msgObj, \{([\s\S]*?)st: msgObj\.st \|\| 2\n\s*\}\);/g,
  `const cloudMsg = Object.assign({}, msgObj, {$1st: msgObj.st || 2,\n        createdAt: window.serverTimestamp()\n      });`
);

// 2. In ensureChatListener, normalize createdAt to milliseconds for proper sorting
code = code.replace(
  /const data = d\.data\(\);/g,
  `const data = d.data({ serverTimestamps: 'estimate' });\n            if (data.createdAt) { data.createdAt = (typeof data.createdAt.toMillis === 'function') ? data.createdAt.toMillis() : data.createdAt; } else { data.createdAt = data.at || Date.now(); }`
);

fs.writeFileSync('index.html', code);
console.log('patched timestamp logic');
