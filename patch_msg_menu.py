with open('index.html', 'r') as f:
    text = f.read()

import re

m_reply = re.search(r'S\.replyTo=\'\$\{mid\}\';render\(\);const i=\$\(\'#minp\'\);if\(i\)i\.focus\(\)', text)
if m_reply:
    rep_reply = "S.replyTo='${mid}';const cb=document.querySelector('.composer');if(cb&&!document.getElementById('reply_bar')){cb.insertAdjacentHTML('beforebegin', `<div id='reply_bar' class='row' style='gap:8px;padding:6px 12px;background:var(--surface2);border-top:1px solid var(--line);flex-shrink:0'><span style='color:var(--accent)'>${I('reply','i s')}</span><span class='tiny g1' style='text-align:right'>رد على: ${esc((m.text||'ملصق').slice(0,50))}</span><button class='iconbtn' style='width:26px;height:26px' onclick='S.replyTo=null;const rb=document.getElementById(\\\"reply_bar\\\");if(rb)rb.remove();'>${I('x','i s')}</button></div>`);}const i=document.getElementById('minp');if(i)i.focus();"
    text = text[:m_reply.start()] + rep_reply + text[m_reply.end():]

with open('index.html', 'w') as f:
    f.write(text)
print("Patched msgMenu reply")
