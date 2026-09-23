with open('index.html', 'r') as f:
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
        }
      }, (e)=>console.warn("Chat sync warning:", e));''',
'''          if(S.page === "chatRoom" && S.params.id === id){
            const msgBox = document.getElementById("msgs");
            if(msgBox){
              const uu = u(c.userId);
              const forceScroll = snap.docChanges().some(ch=>ch.type==="added");
              window.updateChatDom(msgBox, c, uu, forceScroll);
            }
          }
        }
      }, (e)=>console.warn("Chat sync warning:", e));'''
)
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
      }
      }, (e)=>console.warn("Chat sync warning:", e));''',
'''          if(S.page === "chatRoom" && S.params.id === id){
            const msgBox = document.getElementById("msgs");
            if(msgBox){
              const uu = u(c.userId);
              const forceScroll = snap.docChanges().some(ch=>ch.type==="added");
              window.updateChatDom(msgBox, c, uu, forceScroll);
            }
          }
        }
      }, (e)=>console.warn("Chat sync warning:", e));'''
)

with open('index.html', 'w') as f:
    f.write(text)

with open('test.js', 'r') as f:
    text2 = f.read()
text2 = text2.replace(
'''          if(S.page === "chatRoom" && S.params.id === id){
            const msgBox = document.getElementById("msgs");
            if(msgBox){
              const uu = u(c.userId);
              const forceScroll = snap.docChanges().some(ch=>ch.type==="added");
              window.updateChatDom(msgBox, c, uu, forceScroll);
            }
          }
        }
      }
      }, (e)=>console.warn("Chat sync warning:", e));''',
'''          if(S.page === "chatRoom" && S.params.id === id){
            const msgBox = document.getElementById("msgs");
            if(msgBox){
              const uu = u(c.userId);
              const forceScroll = snap.docChanges().some(ch=>ch.type==="added");
              window.updateChatDom(msgBox, c, uu, forceScroll);
            }
          }
        }
      }, (e)=>console.warn("Chat sync warning:", e));'''
)
with open('test.js', 'w') as f:
    f.write(text2)
