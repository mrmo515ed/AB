const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');
const match = code.match(/<script.*?>([\s\S]*?)<\/script>/);
if (match) {
    fs.writeFileSync('script0.js', match[1]);
    console.log("Extracted");
}
