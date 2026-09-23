const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

code = code.replace(
  /if \(chat\.userId && !isMine\(chat\.userId\)\) \{\n\s*return chat\.userId;\n\s*\}/g,
  `if (chat.userId && chat.userId !== "user_friend" && !isMine(chat.userId)) {\n    return chat.userId;\n  }`
);

code = code.replace(
  /const other = chat\.participants\.find\(p => p && !isMine\(p\)\);/g,
  `const other = chat.participants.find(p => p && p !== "user_friend" && !isMine(p));`
);

code = code.replace(
  /const other = parts\.find\(p => p !== "ch" && !isMine\(p\)\);/g,
  `const other = parts.find(p => p !== "ch" && p !== "user_friend" && !isMine(p));`
);

fs.writeFileSync('index.html', code);
console.log('patched partner uid');
