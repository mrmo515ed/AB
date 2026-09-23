const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const match = code.match(/function ensureChatListener\(id\)\{[\s\S]*?\}\n\}\n/);
if(match) console.log(match[0]);
