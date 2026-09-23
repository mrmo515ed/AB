with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

old_stk = 'function voteStk(sid,ii,k2,oi){const st=(S.stories||[]).find(x=>x.id===sid);const sk=st&&((st.items||[])[ii]||{})&&((st.items||[])[ii]||{}).stickers&&((st.items||[])[ii]||{}).stickers[k2];if(!sk)return;sk.votes=sk.votes||[0,0];sk.votes[oi]=(sk.votes[oi]||0)+1;save();render();toast("سُجل صوتك ","ok")}\nfunction askStk(sid,ii,k2){const inp=$("#stkAsk_"+ii+"_"+k2);const v=(inp&&inp.value||"").trim();if(!v){toast("اكتب سؤالاً أولاً","err");return}const st=(S.stories||[]).find(x=>x.id===sid);const sk=st&&((st.items||[])[ii]||{})&&((st.items||[])[ii]||{}).stickers&&((st.items||[])[ii]||{}).stickers[k2];if(!sk)return;sk.answers=sk.answers||[];sk.answers.push(v);save();render();toast("أُرسل سؤالك ","ok")}'

new_stk = '''function voteStk(sid,ii,k2,oi){
  const st=(S.stories||[]).find(x=>x.id===sid);
  const it=(st&&st.items&&st.items[ii])||{};
  const sk=it.stickers&&it.stickers[k2];
  if(!sk)return;
  sk.votes=sk.votes||[];
  while(sk.votes.length<=oi)sk.votes.push(0);
  sk.votedBy=sk.votedBy||{};
  const myUid=getMyUid();
  if(sk.votedBy[myUid]!==undefined){toast("لقد صوتت بالفعل في هذا الاستطلاع","info");return}
  sk.votedBy[myUid]=oi;
  sk.votes[oi]=(sk.votes[oi]||0)+1;
  save();render();toast("سُجل تصويتك بنجاح 🗳️","ok");
  if(window.db&&window.setDoc&&window.doc){
    window.setDoc(window.doc(window.db,"stories",sid),{items:st.items},{merge:true}).catch(()=>{});
  }
}
function askStk(sid,ii,k2){
  const inp=$("#stkAsk_"+ii+"_"+k2);
  const v=(inp&&inp.value||"").trim();
  if(!v){toast("اكتب رداً أو سؤالاً أولاً","err");return}
  const st=(S.stories||[]).find(x=>x.id===sid);
  const it=(st&&st.items&&st.items[ii])||{};
  const sk=it.stickers&&it.stickers[k2];
  if(!sk)return;
  sk.answers=sk.answers||[];
  const myUid=getMyUid();
  sk.answers.push({u:myUid,name:S.me.name,avatar:S.me.avatar,text:v,at:Date.now()});
  save();render();toast("أُرسلت إجابتك للكاتب بنجاح 💌","ok");
  if(window.db&&window.setDoc&&window.doc){
    window.setDoc(window.doc(window.db,"stories",sid),{items:st.items},{merge:true}).catch(()=>{});
  }
}'''

if old_stk in text:
    text = text.replace(old_stk, new_stk, 1)
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(text)
    print("Successfully replaced voteStk and askStk")
else:
    print("Old stk not found directly, checking partial matches...")
