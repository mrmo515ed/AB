const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

// Fix delSel
let delSelCode = `function delSel(){
  const ids=S.selIds||[];
  S.chats.forEach(c=>{
    c.messages.forEach(m=>{
      if(ids.includes(m.id)&&m.from==="me"){
         m.gone=true;
         if(window.db && window.setDoc && window.doc) {
            window.setDoc(window.doc(window.collection(window.db, "chats", c.id, "messages"), m.id), { gone: true }, { merge: true }).catch(()=>{});
         }
      }
    })
  });
  S.selIds=[];
  S.selMode=false;
  save();
  toast("حُذفت الرسائل المحددة لدي الجميع ","ok");
  render();
}`;
code = code.replace(/function delSel\(\)\{[\s\S]*?render\(\)\}/, delSelCode);

// Fix delMsg if it exists
let delMsgMatch = code.match(/function delMsg\(mid\)\{[\s\S]*?toast\("استُعيدت الرسالة ","ok"\);\n  \}\);\n\}/);
if(delMsgMatch) {
  let delMsgCode = `function delMsg(mid){
  const c=chatOfMid(mid);if(!c)return;
  const idx=(c.messages||[]).findIndex(x=>x.id===mid);
  if(idx<0)return;
  const snap=c.messages[idx];
  c.messages.splice(idx,1);
  save();
  if(S.page==='chatRoom'){const mb=document.getElementById("msgs");if(mb)window.updateChatDom(mb,c,u(c.userId),false);}
  
  // Real server deletion
  if(window.db && window.deleteDoc && window.doc) {
      window.deleteDoc(window.doc(window.collection(window.db, "chats", c.id, "messages"), mid)).catch(()=>{});
  }

  toast("حُذفت الرسالة ","info");
}`;
  code = code.replace(delMsgMatch[0], delMsgCode);
}

fs.writeFileSync('index.html', code);
console.log("Deletions patched for Firestore");
