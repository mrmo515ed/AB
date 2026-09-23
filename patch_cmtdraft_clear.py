import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

old_code = """  const myUid = getMyUid();
  p.comments = p.comments || [];"""
new_code = """  const myUid = getMyUid();
  p.comments = p.comments || [];
  if (S.cmtDrafts) S.cmtDrafts[pid] = '';"""

if "S.cmtDrafts[pid] = '';" not in content:
    content = content.replace(old_code, new_code)
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(content)
        print("Patched comment draft clear")
