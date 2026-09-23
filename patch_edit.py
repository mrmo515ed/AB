with open('index.html', 'r') as f:
    text = f.read()

text = text.replace('onclick="S.editMid=null;const i=$(\'#minp\');if(i)i.value=\'\';render()"', 'onclick="S.editMid=null;const i=document.getElementById(\'minp\');if(i)i.value=\'\';const eb=document.getElementById(\'edit_bar\');if(eb)eb.remove();"')

with open('index.html', 'w') as f:
    f.write(text)
print("Patched edit_bar")
