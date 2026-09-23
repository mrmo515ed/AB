with open('index.html', 'r') as f:
    text = f.read()

import re

m = re.search(r'let rows=\[\];let lastDay="";.*?rows\.push\(msgBubble\(m,uu,c\.id\)\)\}\);', text, re.DOTALL)
if m:
    rep = '''let rows=[];let lastDay="";
  c.messages.forEach(m=>{
    const dl=dayLbl(m.at);
    if(dl!==lastDay){
      lastDay=dl;
      const dlId = 'day_' + Array.from(dl).map(char=>char.charCodeAt(0)).join('');
      rows.push(`<div class="center" id="${dlId}" style="margin:10px 0 8px"><span class="tiny b" style="background:var(--surface3);border:1px solid var(--line2);border-radius:99px;padding:4px 12px;color:var(--muted)">${dl}</span></div>`);
    }
    const html = msgBubble(m,uu,c.id);
    const mHash = (m.text||"") + (m.st||1) + (m.reacts?m.reacts.join(''):'') + (m.edited?1:0) + (m.star?1:0) + (m.gone?1:0);
    rows.push(html.replace('class="msg ', 'data-hash="'+mHash+'" class="msg '));
  });'''
    text = text[:m.start()] + rep + text[m.end():]
    
text = text.replace(
    '${S.typingIn&&S.typingIn[c.id]?`<div class="msg them row" style="gap:6px">${av(uu,20)}<span class="dot3"><i></i><i></i><i></i></span></div>`:""}',
    '<div id="chat_typing_indicator" style="display:${(S.typingIn&&S.typingIn[c.id])?\'flex\':\'none\'};gap:6px;margin-top:4px" class="msg them row">${av(uu,20)}<span class="dot3"><i></i><i></i><i></i></span></div>'
)

with open('index.html', 'w') as f:
    f.write(text)
print("Patched chatRoom")
