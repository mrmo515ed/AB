import re

with open('index.html', 'r', encoding='utf-8') as f:
    code = f.read()

# I want to find the exact block from `let _saveTo;` up to `window.addEventListener("beforeunload", ()=>{ save(true); });`

regex = r'let _saveTo;\nfunction saveSync\(\)\{([\s\S]*?)catch\(e3\)\{\}\}\nlet _saveTo;\nfunction saveDebounced\(\)\{\n  clearTimeout\(_saveTo\);\n  _saveTo = setTimeout\(save, 1000\);\n\}\n\}\nfunction save\(immediate = false\)\{([\s\S]*?)window\.addEventListener\("beforeunload", \(\)=>\{ save\(true\); \}\);'

match = re.search(regex, code)
if match:
    block1 = match.group(1)
    block2 = match.group(2)
    replacement = f'let _saveTo;\nfunction saveSync(){{{block1}catch(e3){{}}}}\nfunction save(immediate = false){{{block2}window.addEventListener("beforeunload", ()=>{{ save(true); }});'
    code = code[:match.start()] + replacement + code[match.end():]
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(code)
    print("Success")
else:
    print("Failed")
