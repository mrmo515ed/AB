with open('index.html', 'r') as f:
    text = f.read()

import re

m = re.search(r'function startEditMsg\(mid\)\{const m=msgById\(mid\);if\(!m\)return;S\.editMid=mid;S\.replyTo=null;render\(\);const i=\$\("#minp"\);if\(i\)\{i\.value=m\.text\|\|"";i\.focus\(\)\}\}', text)
if m:
    rep = '''function startEditMsg(mid){
  const m=msgById(mid);if(!m)return;
  S.editMid=mid;S.replyTo=null;
  const rb=document.getElementById("reply_bar");if(rb)rb.remove();
  const cb=document.querySelector('.composer');
  if(cb&&!document.getElementById('edit_bar')){
    cb.insertAdjacentHTML('beforebegin', `<div id='edit_bar' class='row' style='gap:8px;padding:6px 12px;background:var(--surface2);border-top:1px solid var(--line);flex-shrink:0'><span style='color:var(--gold)'>${I('edit','i s')}</span><span class='tiny g1' style='text-align:right'>تعديل رسالتك: ${esc((m.text||'').slice(0,50))}</span><button class='iconbtn' style='width:26px;height:26px' onclick='S.editMid=null;const i=document.getElementById("minp");if(i)i.value="";const eb=document.getElementById("edit_bar");if(eb)eb.remove();'>${I('x','i s')}</button></div>`);
  }
  const i=document.getElementById('minp');
  if(i){ i.value=m.text||""; i.focus(); }
}'''
    text = text[:m.start()] + rep + text[m.end():]
    with open('index.html', 'w') as f:
        f.write(text)
    print("Patched startEditMsg")
else:
    print("Not found startEditMsg")
