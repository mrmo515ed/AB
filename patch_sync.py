import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

payload_old = """        avatar: (S.me && S.me.avatar) || AV[0],
        cover: (S.me && S.me.cover) || COVER[0],"""

payload_new = """        avatar: (S.me && S.me.avatar) || AV[0],
        cover: (S.me && S.me.cover) || null,
        coverG: (S.me && S.me.coverG) || null,"""

if "coverG: (S.me" not in content:
    content = content.replace(payload_old, payload_new)
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(content)
        print("Patched sync payload")
