const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

code = code.split('ind.innerHTML = \\`${I("check","i s")} تمت المزامنة بنجاح`;').join('ind.innerHTML = `${I("check","i s")} تمت المزامنة بنجاح`;');
fs.writeFileSync('index.html', code);
console.log('Fixed syntax error in index.html');
