const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

code = code.replace(
  /if \(m && m\.id && \(m\.pending \|\| m\.uploading \|\| m\.st === 1 \|\| m\.from === "me"\)\) \{\n\s*if \(\!liveMsgs\.find\(x => x\.id === m\.id\)\) \{\n\s*msgMap\[m\.id\] = m;\n\s*\}\n\s*\}/g,
  `if (m && m.id && (m.pending || m.uploading || m.st === 1 || m.st === 2 || (Date.now() - (m.createdAt||m.at||0) < 60000))) {
              if (!liveMsgs.find(x => x.id === m.id)) {
                msgMap[m.id] = m;
              }
            }`
);

fs.writeFileSync('index.html', code);
console.log('patched msgMap recent');
