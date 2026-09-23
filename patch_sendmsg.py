with open('index.html', 'r') as f:
    text = f.read()

import re
m = re.search(r'function sendMsg\(cid\)\{.*?syncChatMessage\(cid, msgObj\);\s*\}', text, re.DOTALL)
if m:
    rep = '''function sendMsg(cid){
  const i=$("#minp");if(!i)return;
  const c=(S.chats||[]).find(x=>x.id===cid);if(!c)return;
  if(S.editMid){
    const em=msgById(S.editMid);
    const t2=(i.value||"").trim();
    if(em&&t2){
      em.text=t2;em.edited=true;
      if(window.db&&window.setDoc&&window.doc){
        window.setDoc(window.doc(window.collection(window.db,"chats",cid,"messages"),em.id),{text:t2,edited:true},{merge:true}).catch(e=>console.error(e));
      }
    }
    S.editMid=null;i.value="";i.style.height="auto";save();snd("success");
    toast("تم تعديل الرسالة ","ok");
    const eb = document.getElementById('edit_bar'); if(eb) eb.remove();
    const b=$("#msgs"); if(b) window.updateChatDom(b, c, u(c.userId), false);
    i.focus();
    return;
  }
  const t=(i.value||"").trim();if(!t)return;
  let quote=null;
  if(S.replyTo){
    const qm=msgById(S.replyTo);
    if(qm)quote={n:qm.from==="me"?"أنت":u(c.userId).name,t:(qm.text||(qm.type==="sticker"?"ملصق":qm.type||"وسائط")).slice(0,60)};
    S.replyTo=null;
  }
  const mid=uid();
  const myUid = getMyUid();
  const myName = S.me.name || "أنا";
  const msgObj = {
    id: mid,
    from: "me",
    senderId: myUid,
    senderName: myName,
    text: t,
    type: "text",
    st: 1,
    pending: true,
    quote: quote || null,
    at: now()
  };
  c.messages.push(msgObj);
  c.last=t;c.lastAt=now();i.value="";i.style.height="auto";(S.chatDrafts=S.chatDrafts||{})[cid]="";
  snd("send");haptic("إرسال");questProgress("q4");save();
  const rb = document.getElementById('reply_bar'); if(rb) rb.remove();
  const b=$("#msgs");if(b){ window.updateChatDom(b, c, u(c.userId), true); }
  i.focus();
  if(!netOk()){
    (S.pendingMsgs=S.pendingMsgs||[]).push({cid, mid: msgObj.id});
    save();
    return;
  }
  syncChatMessage(cid, msgObj);
}'''
    text = text[:m.start()] + rep + text[m.end():]
    with open('index.html', 'w') as f:
        f.write(text)
    print("Patched sendMsg")
else:
    print("Not found sendMsg")

