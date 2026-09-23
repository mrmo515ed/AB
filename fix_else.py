with open('index.html', 'r') as f:
    text = f.read()

text = text.replace(
    'if(m&&c)window.updateChatDom(m,c,u(c.userId),false)};else if',
    'if(m&&c)window.updateChatDom(m,c,u(c.userId),false)}else if'
)

with open('index.html', 'w') as f:
    f.write(text)

with open('test.js', 'r') as f:
    text = f.read()
text = text.replace(
    'if(m&&c)window.updateChatDom(m,c,u(c.userId),false)};else if',
    'if(m&&c)window.updateChatDom(m,c,u(c.userId),false)}else if'
)
with open('test.js', 'w') as f:
    f.write(text)

