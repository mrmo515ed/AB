const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const regex = /function save\(\)\{([\s\S]*?)window\.addEventListener\("beforeunload", \(\)=>\{[\s\S]*?\}\);/m;
const replacement = `let _saveTo;
function saveSync(){$1}
function save(immediate = false){
  if(immediate){
    if(_saveTo) clearTimeout(_saveTo);
    return saveSync();
  }
  clearTimeout(_saveTo);
  _saveTo = setTimeout(saveSync, 800);
}
function saveDebounced(){ save(); }
window.addEventListener("beforeunload", ()=>{ save(true); });`;

if (regex.test(code)) {
    code = code.replace(regex, replacement);
    fs.writeFileSync('index.html', code);
    console.log("Success");
} else {
    console.log("Failed to match regex");
}
