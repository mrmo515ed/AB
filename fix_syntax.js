const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

code = code.replace(/ind\.innerHTML = \\\`<span/g, 'ind.innerHTML = `<span');
code = code.replace(/في الانتظار\)\.\.\.\\\`;/g, 'في الانتظار)...`;');
code = code.replace(/ind\.innerHTML = \\\`\$\\{I/g, 'ind.innerHTML = `${I');
code = code.replace(/تمت المزامنة بنجاح\\\`;/g, 'تمت المزامنة بنجاح`;');

fs.writeFileSync('index.html', code);
console.log('Fixed syntax error in index.html');
