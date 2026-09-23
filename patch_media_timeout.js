const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const regex = /const timeoutPromise = new Promise\(\(resolve\) => \{\s*setTimeout\(\(\) => \{\s*toDataURL\(file\)\.then\(resolve\);\s*\}, 4000\);\s*\}\);\s*return await Promise\.race\(\[storagePromise, timeoutPromise\]\);/;

html = html.replace(regex, 'return await storagePromise;');

fs.writeFileSync('index.html', html);
