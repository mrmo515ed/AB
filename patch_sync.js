const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

html = html.replace(/role:\s*\(S\.me\s*&&\s*S\.me\.role\)\s*\|\|\s*"Member",/g, '');
html = html.replace(/level:\s*\(S\.me\s*&&\s*S\.me\.level\)\s*\|\|\s*1,/g, '');
html = html.replace(/xp:\s*\(S\.me\s*&&\s*S\.me\.xp\)\s*\|\|\s*0,/g, '');
html = html.replace(/xpNext:\s*\(S\.me\s*&&\s*S\.me\.xpNext\)\s*\|\|\s*100,/g, '');
html = html.replace(/coins:\s*S\.coins\s*!=\s*null\s*\?\s*S\.coins\s*:\s*\(\(S\.me\s*&&\s*S\.me\.coins\)\s*\|\|\s*100\),/g, '');
html = html.replace(/stars:\s*S\.stars\s*!=\s*null\s*\?\s*S\.stars\s*:\s*\(\(S\.me\s*&&\s*S\.me\.stars\)\s*\|\|\s*5\),/g, '');
html = html.replace(/reputation:\s*\(S\.me\s*&&\s*S\.me\.reputation\)\s*\|\|\s*15,/g, '');
html = html.replace(/badges:\s*\(S\.me\s*&&\s*S\.me\.badges\)\s*\|\|\s*\["badge_rookie"\],/g, '');
html = html.replace(/isVerified:\s*!!\(S\.me\s*&&\s*S\.me\.isVerified\)/g, '// isVerified removed');

// Since user_states was allowed by rules, it's fine.

fs.writeFileSync('index.html', html);
