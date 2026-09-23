import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

av_old = """function avUpload(inp){const f=inp.files&&inp.files[0];if(!f)return;fileDownscale(f,256,0.82,src=>{if(!src){toast("تعذّر قراءة الصورة","err");return}S.me.avatar=src;save();closeOvl();render();toast("طُبّقت صورتك الحقيقية ","ok")})}"""
av_new = """function avUpload(inp){const f=inp.files&&inp.files[0];if(!f)return;fileDownscale(f,256,0.82,src=>{if(!src){toast("تعذّر قراءة الصورة","err");return}S.me.avatar=src;save();if(window.auth&&window.auth.currentUser&&window.db){window.setDoc(window.doc(window.db,"users",window.auth.currentUser.uid),{avatar:src},{merge:true}).catch(e=>console.error(e));}closeOvl();render();toast("طُبّقت صورتك الحقيقية ومزامنتها ","ok")})}"""

cov_old = """function applyCoverG(i){const c=COVERS[i];if(!c)return;S.me.cover=null;S.me.coverG=[c[0],c[1]];save();render();toast("غلاف «"+c[2]+"» مُطبّق ","ok")}"""
cov_new = """function applyCoverG(i){const c=COVERS[i];if(!c)return;S.me.cover=null;S.me.coverG=[c[0],c[1]];save();if(window.auth&&window.auth.currentUser&&window.db){window.setDoc(window.doc(window.db,"users",window.auth.currentUser.uid),{coverG:[c[0],c[1]],cover:null},{merge:true}).catch(e=>{});}render();toast("غلاف «"+c[2]+"» مُطبّق ومزامن ","ok")}"""

if "ومزامنتها" not in content:
    content = content.replace(av_old, av_new)
    content = content.replace(cov_old, cov_new)
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(content)
        print("Patched avatar and cover sync.")
