const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const regex = /function deleteWorld\(id\)\{const w=\(S\.worlds\|\|\[\]\)\.find\(x=>x\.id===id\);if\(!confirm\("حذف عالم "\+w\.name\+" نهائياً؟"\)\)return;S\.worlds=S\.worlds\.filter\(x=>x\.id!==id\);save\(\);closeOvl\(\);go\("worlds"\);toast\("حُذف العالم ","err"\)\}/;
const replacement = `function deleteWorld(id){const w=(S.worlds||[]).find(x=>x.id===id);if(!confirm("حذف عالم "+w.name+" نهائياً؟"))return;
  if(window.db && window.deleteDoc && window.doc) {
    window.deleteDoc(window.doc(window.db, "worlds", id)).catch(e => console.warn(e));
  }
  S.worlds=S.worlds.filter(x=>x.id!==id);save();closeOvl();go("worlds");toast("حُذف العالم ","err")}`;

html = html.replace(regex, replacement);
fs.writeFileSync('index.html', html);
