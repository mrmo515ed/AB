import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

upload_old = """        await new Promise((resolve) => {
          uploadTask.on('state_changed',"""

upload_new = """        await new Promise((resolve) => {
          let tm = setTimeout(resolve, 30000); // 30s timeout fallback
          uploadTask.on('state_changed',"""

resolve_old = """                resolve();
              } catch(e) {
                resolve();
              }"""

resolve_new = """                clearTimeout(tm); resolve();
              } catch(e) {
                clearTimeout(tm); resolve();
              }"""

err_old = """            (err) => {
              console.warn("Storage upload error, falling back:", err);
              progressMap[i] = 100;
              resolve();
            },"""
err_new = """            (err) => {
              console.warn("Storage upload error, falling back:", err);
              progressMap[i] = 100;
              clearTimeout(tm); resolve();
            },"""

if "30000); // 30s timeout fallback" not in content:
    content = content.replace(upload_old, upload_new)
    content = content.replace(resolve_old, resolve_new)
    content = content.replace(err_old, err_new)
    
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(content)
        print("Patched upload promise with timeout.")
