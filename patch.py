with open('index.html', 'r') as f:
    text = f.read()

import re
m = re.search(r'if\(S\.page === "chatRoom" && S\.params\.id === id\)\{.*?const msgBox = document\.getElementById\("msgs"\);.*?msgBox\.scrollTop = msgBox\.scrollHeight;\s*\}\s*\}\s*\}\s*\}', text, re.DOTALL)
if m:
    rep = '''if(S.page === "chatRoom" && S.params.id === id){
            const msgBox = document.getElementById("msgs");
            if(msgBox){
              const uu = u(c.userId);
              const forceScroll = snap.docChanges().some(ch=>ch.type==="added");
              window.updateChatDom(msgBox, c, uu, forceScroll);
            }
          }
        }'''
    text = text[:m.start()] + rep + text[m.end():]
    with open('index.html', 'w') as f:
        f.write(text)
    print("Patched _chatMsgsSub")
else:
    print("Not found _chatMsgsSub")

m2 = re.search(r'if\(S\.page === \'chatRoom\' && S\.params\.id\) \{\s*const msgBox = document\.getElementById\("msgs"\);.*?msgBox\.scrollTop = msgBox\.scrollHeight;\s*\}\s*\}\s*\}', text, re.DOTALL)
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
      }'''
    text = text[:m2.start()] + rep2 + text[m2.end():]
    with open('index.html', 'w') as f:
        f.write(text)
    print("Patched chatsQuery")
else:
    print("Not found chatsQuery")

