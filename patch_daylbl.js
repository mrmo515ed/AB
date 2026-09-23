const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

code = code.replace(
  /function dayLbl\(ms\)\{const d=new Date\(ms\);/g,
  `function dayLbl(ms){if(!ms)return "";const d=new Date(ms);if(isNaN(d.getTime()))return "";`
);

fs.writeFileSync('index.html', code);
console.log('patched dayLbl');
