with open('index.html', 'r') as f:
    text = f.read()

text = text.replace('<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">', '<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover, interactive-widget=resizes-content">')
text = text.replace('html,body{height:100%}', 'html,body{height:100%;height:100dvh}')
text = text.replace('#app{height:100%;', '#app{height:100%;height:100dvh;')

with open('index.html', 'w') as f:
    f.write(text)
print("Patched meta and css")
