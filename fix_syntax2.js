const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

code = code.replace(/ind\.innerHTML = \\\`\\\$\\{I\("check","i s"\)\\} تمت المزامنة بنجاح\`;/, 'ind.innerHTML = `${I("check","i s")} تمت المزامنة بنجاح`;');
code = code.replace(/ind\.innerHTML = \\`\$\\{I/g, 'ind.innerHTML = `${I');

fs.writeFileSync('index.html', code);
console.log('Fixed syntax error in index.html');
