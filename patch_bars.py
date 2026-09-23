with open('index.html', 'r') as f:
    text = f.read()

text = text.replace('${S.editMid?`<div class="row" style="gap:8px;padding:6px', '${S.editMid?`<div id="edit_bar" class="row" style="gap:8px;padding:6px')
text = text.replace('${S.replyTo?`<div class="row" style="gap:8px;padding:6px', '${S.replyTo?`<div id="reply_bar" class="row" style="gap:8px;padding:6px')

with open('index.html', 'w') as f:
    f.write(text)
print("Patched bars")
