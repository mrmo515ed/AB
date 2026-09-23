with open('index.html', 'r') as f:
    text = f.read()

text = text.replace(
    'if(S.page==="chatRoom")render()',
    'if(S.page==="chatRoom"){const m=document.getElementById("msgs");const c=(S.chats||[]).find(x=>x.id===S.params.id);if(m&&c)window.updateChatDom(m,c,u(c.userId),false)}'
)

with open('index.html', 'w') as f:
    f.write(text)
print("Patched tools")
