const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');
const idx = code.indexOf('window.ensureChatListener = ensureChatListener;');
console.log(code.substring(idx - 100, idx + 100));
