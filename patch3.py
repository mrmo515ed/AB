with open('index.html', 'r') as f:
    text = f.read()

import re
m2 = re.search(r'if\(S\.page === \'chatRoom\' && S\.params\.id\) \{.*?if\s*\(hdrSt\)\s*\{.*?\}\s*\}\s*\}\s*\}\s*\}\s*\n', text, re.DOTALL)
if m2:
    rep2 = '''if(S.page === 'chatRoom' && S.params.id) {
         const msgBox = document.getElementById("msgs");
         if(msgBox){
           const c = (S.chats||[]).find(x=>x.id===S.params.id);
           if(c) {
             const uu = u(c.userId);
             window.updateChatDom(msgBox, c, uu, false);
           }
         }
      }
'''
    text = text[:m2.start()] + rep2 + text[m2.end():]
    with open('index.html', 'w') as f:
        f.write(text)
    print("Patched chatsQuery")
else:
    print("Not found chatsQuery")

