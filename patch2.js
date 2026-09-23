const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');
const target = '    } catch(err){}  }}window.ensureChatListener = ensureChatListener;function openChat(id){';
if (code.includes(target)) {
  code = code.replace(target, `    } catch(err){}  }}
window.ensureChatListener = ensureChatListener;
window._isLoadingOlder = {};
window.loadOlderChatMessages = function(cid) {
  if(!cid || window._isLoadingOlder[cid]) return;
  const c = (S.chats || []).find(x => x.id === cid);
  if(!c || !c.messages || c.messages.length === 0) return;
  const serverMsgs = c.messages.filter(m => !m.pending && !m.uploading);
  if(serverMsgs.length === 0) return;
  const oldest = serverMsgs[0];
  const oldestTime = oldest.at || oldest.createdAt;
  if(!oldestTime) return;
  if(window.db && window.collection && window.getDocs) {
    window._isLoadingOlder[cid] = true;
    const msgBox = document.getElementById("msgs");
    const oldScrollHeight = msgBox ? msgBox.scrollHeight : 0;
    try {
      const qMsgs = window.query(
        window.collection(window.db, "chats", cid, "messages"),
        window.orderBy("createdAt", "desc"),
        window.startAfter(oldestTime),
        window.limit(50)
      );
      window.getDocs(qMsgs).then(snap => {
        if(snap && !snap.empty) {
          const myUid = window.getMyUid();
          const olderMsgs = snap.docs.map(d => {
            const m = d.data();
            const isMine = (m.senderId === myUid || m.fromId === myUid || (m.senderId && (m.senderId === S.me.id || m.senderId === S.me.uid)) || (!m.senderId && m.from === "me") || (typeof window.isMe === "function" && window.isMe(m.senderId)));
            m.from = isMine ? "me" : "them";
            return m;
          }).filter(m => m && m.id);
          if(olderMsgs.length > 0) {
            const msgMap = {};
            c.messages.forEach(m => { msgMap[m.id] = m; });
            olderMsgs.forEach(m => {
              if(!msgMap[m.id]) msgMap[m.id] = m;
            });
            const merged = Object.values(msgMap);
            merged.sort((a,b)=>(a.at||a.createdAt||0)-(b.at||b.createdAt||0));
            c.messages = merged;
            window.saveLocalOnly();
            if(S.page === "chatRoom" && S.params && S.params.id === cid && msgBox) {
               window.updateChatDom(msgBox, c, window.u(c.userId), false);
               const newScrollHeight = msgBox.scrollHeight;
               msgBox.scrollTop = newScrollHeight - oldScrollHeight + msgBox.scrollTop;
            }
          }
        }
      }).catch(err=>{}).finally(() => {
        setTimeout(() => { window._isLoadingOlder[cid] = false; }, 1000);
      });
    } catch(err) {
      window._isLoadingOlder[cid] = false;
    }
  }
};
function openChat(id){`);
  fs.writeFileSync('index.html', code);
  console.log("Success");
} else {
  console.log("Not found");
}
