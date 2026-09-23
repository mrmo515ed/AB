const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const regex = /function deleteGroup\(id\)\{const g=\(S\.groups\|\|\[\]\)\.find\(x=>x\.id===id\);if\(!confirm\("حذف "\+g\.name\+" نهائياً؟"\)\)return;S\.groups=S\.groups\.filter\(x=>x\.id!==id\);save\(\);closeOvl\(\);go\("groups"\);toast\("حُذف القروب ","err"\)\}/;
const replacement = `function deleteGroup(id){const g=(S.groups||[]).find(x=>x.id===id);if(!confirm("حذف "+g.name+" نهائياً؟"))return;
  if(window.db && window.deleteDoc && window.doc) {
    window.deleteDoc(window.doc(window.db, "groups", id)).catch(e => console.warn(e));
  }
  S.groups=S.groups.filter(x=>x.id!==id);save();closeOvl();go("groups");toast("حُذف القروب ","err")}`;

html = html.replace(regex, replacement);
fs.writeFileSync('index.html', html);
