import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

old_code = """<textarea id="cmtinp" ${p.lockC?"disabled":""} rows="1" placeholder="${p.lockC?'التعليقات مقفلة من قبل الناشر':'اكتب تعليقاً... (كن محترماً)'}" oninput="this.style.height='auto';this.style.height=Math.min(96,this.scrollHeight)+'px'"></textarea>"""
new_code = """<textarea id="cmtinp" ${p.lockC?"disabled":""} rows="1" placeholder="${p.lockC?'التعليقات مقفلة من قبل الناشر':'اكتب تعليقاً... (كن محترماً)'}" oninput="this.style.height='auto';this.style.height=Math.min(96,this.scrollHeight)+'px';if(!window._cmtDraftTimer){window._cmtDraftTimer=setTimeout(()=>{if(!S.cmtDrafts)S.cmtDrafts={};S.cmtDrafts['${p.id}']=this.value;save();window._cmtDraftTimer=null;},500);}">${esc((S.cmtDrafts&&S.cmtDrafts['${p.id}'])||'')}</textarea>"""

if "window._cmtDraftTimer" not in content:
    content = content.replace(old_code, new_code)
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(content)
        print("Patched comment draft logic")
