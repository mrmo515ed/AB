const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

// replace mHash calculation
code = code.replace(/const mHash = \(m\.text\|\|""\) \+ \(m\.st\|\|1\) \+ \(m\.reacts\?m\.reacts\.join\(''\):''\) \+ \(m\.edited\?1:0\) \+ \(m\.star\?1:0\) \+ \(m\.gone\?1:0\);/g, `const mHash = (m.text||"") + (m.st||1) + (m.pending?1:0) + (m.reacts?m.reacts.join(''):'') + (m.edited?1:0) + (m.star?1:0) + (m.gone?1:0);`);

code = code.replace(/const mHash = \(m\.text \|\| ""\) \+ \(m\.st \|\| 1\) \+ \(m\.reacts \? m\.reacts\.join\(''\) \: ''\) \+ \(m\.edited \|\| m\.isEdited \? 1 \: 0\) \+ \(m\.star \? 1 \: 0\) \+ \(m\.gone \|\| m\.isDeleted \? 1 \: 0\) \+ \(\(m\.attachments && m\.attachments\.length\) \|\| 0\);/g, `const mHash = (m.text || "") + (m.st || 1) + (m.pending ? 1 : 0) + (m.reacts ? m.reacts.join('') : '') + (m.edited || m.isEdited ? 1 : 0) + (m.star ? 1 : 0) + (m.gone || m.isDeleted ? 1 : 0) + ((m.attachments && m.attachments.length) || 0);`);

fs.writeFileSync('index.html', code);
console.log("Success");
