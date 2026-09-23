const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

code = code.replace(/render\(\{ keepScroll: true \}\);/g, `debounceRender({ keepScroll: true });`);
code = code.replace(/if\(S\.page === 'workspace'\) render\(\);/g, `if(S.page === 'workspace') debounceRender();`);
code = code.replace(/if \(S\.page === 'admin'\) render\(\);/g, `if (S.page === 'admin') debounceRender();`);
code = code.replace(/if \(S\.page === "visualControlCenter" \|\| S\.page === "admin"\) render\(\);/g, `if (S.page === "visualControlCenter" || S.page === "admin") debounceRender();`);

fs.writeFileSync('index.html', code);
console.log("Success");
