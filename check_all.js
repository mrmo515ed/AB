const fs = require('fs');
const content = fs.readFileSync('index.html', 'utf8').split('\n');
let depth = 0;
for (let line = 0; line < content.length; line++) {
  const lineStr = content[line];
  // Simple check, ignores strings and comments! So might be slightly off, but let's try.
  // Wait, index.html has HTML and JS, so `{` and `}` in CSS, etc.
}
