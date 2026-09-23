with open('index.html', 'r') as f:
    text = f.read()

bad_str = "cb.insertAdjacentHTML('beforebegin', `<div id='reply_bar' class='row' style='gap:8px;padding:6px 12px;background:var(--surface2);border-top:1px solid var(--line);flex-shrink:0'><span style='color:var(--accent)'>${I('reply','i s')}</span><span class='tiny g1' style='text-align:right'>رد على: ${esc((m.text||'ملصق').slice(0,50))}</span><button class='iconbtn' style='width:26px;height:26px' onclick='S.replyTo=null;const rb=document.getElementById(\\\"reply_bar\\\");if(rb)rb.remove();'>${I('x','i s')}</button></div>`);}const"

good_str = "cb.insertAdjacentHTML('beforebegin', \\`<div id='reply_bar' class='row' style='gap:8px;padding:6px 12px;background:var(--surface2);border-top:1px solid var(--line);flex-shrink:0'><span style='color:var(--accent)'>\\` + I('reply','i s') + \\`</span><span class='tiny g1' style='text-align:right'>رد على: \\` + esc((m.text||'ملصق').slice(0,50)) + \\`</span><button class='iconbtn' style='width:26px;height:26px' onclick='S.replyTo=null;const rb=document.getElementById(\\\"reply_bar\\\");if(rb)rb.remove();'>\\` + I('x','i s') + \\`</button></div>\\`);}const"

text = text.replace(bad_str, good_str)

with open('index.html', 'w') as f:
    f.write(text)

with open('test.js', 'r') as f:
    text = f.read()
text = text.replace(bad_str, good_str)
with open('test.js', 'w') as f:
    f.write(text)

