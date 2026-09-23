with open('index.html', 'r') as f:
    text = f.read()

import re

m = re.search(r'function delMsg\(mid\)\{const c=chatOfMid\(mid\);if\(!c\)return;const idx=\(c\.messages\|\|\[\]\)\.findIndex\(x=>x\.id===mid\);if\(idx<0\)return;const snap=c\.messages\[idx\];c\.messages\.splice\(idx,1\);save\(\);render\(\);toast\("حُذفت الرسالة ","info",\(\)=>\{c\.messages\.splice\(Math\.min\(idx,\(c\.messages\|\|\[\]\)\.length\),0,snap\);save\(\);render\(\);toast\("استُعيدت الرسالة ","ok"\)\}\)\}', text)
if m:
    rep = '''function delMsg(mid){
  const c=chatOfMid(mid);if(!c)return;
  const idx=(c.messages||[]).findIndex(x=>x.id===mid);
  if(idx<0)return;
  const snap=c.messages[idx];
  c.messages.splice(idx,1);
  save();
  if(S.page==='chatRoom'){const mb=document.getElementById("msgs");if(mb)window.updateChatDom(mb,c,u(c.userId),false);}
  toast("حُذفت الرسالة ","info",()=>{
    c.messages.splice(Math.min(idx,(c.messages||[]).length),0,snap);
    save();
    if(S.page==='chatRoom'){const mb=document.getElementById("msgs");if(mb)window.updateChatDom(mb,c,u(c.userId),false);}
    toast("استُعيدت الرسالة ","ok");
  });
}'''
    text = text[:m.start()] + rep + text[m.end():]
    with open('index.html', 'w') as f:
        f.write(text)
    print("Patched delMsg")
else:
    print("Not found delMsg")
