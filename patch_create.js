const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

code = code.replace(
  /if \(!c\.userId \|\| c\.userId === myUid\) \{/g,
  `if (!c.userId || c.userId === myUid || c.userId === "user_friend") {`
);

fs.writeFileSync('index.html', code);
console.log('patched create');
