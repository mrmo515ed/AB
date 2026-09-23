const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

code = code.replace(
  /if \(m && m\.id && \(m\.pending \|\| m\.uploading \|\| m\.st === 1\)\) \{\n\s*msgMap\[m\.id\] = m;\n\s*\}/g,
  `if (m && m.id && (m.pending || m.uploading || m.st === 1 || m.from === "me")) {\n              if (!liveMsgs.find(x => x.id === m.id)) {\n                msgMap[m.id] = m;\n              }\n            }`
);

fs.writeFileSync('index.html', code);
console.log('patched msgMap');
