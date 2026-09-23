with open('test.js', 'r') as f:
    text = f.read()

text = text.replace(
'''          if(S.page === "chatRoom" && S.params.id === id){
            const msgBox = document.getElementById("msgs");
            if(msgBox){
              const uu = u(c.userId);
              const forceScroll = snap.docChanges().some(ch=>ch.type==="added");
              window.updateChatDom(msgBox, c, uu, forceScroll);
            }
          }
        }
        }''',
'''          if(S.page === "chatRoom" && S.params.id === id){
            const msgBox = document.getElementById("msgs");
            if(msgBox){
              const uu = u(c.userId);
              const forceScroll = snap.docChanges().some(ch=>ch.type==="added");
              window.updateChatDom(msgBox, c, uu, forceScroll);
            }
          }
        }
      }'''
)

with open('test.js', 'w') as f:
    f.write(text)
