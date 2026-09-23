import re
with open('index.html', 'r', encoding='utf-8') as f:
    code = f.read()

target = r'\}catch\(e3\)\{\}\}\n?let _saveTo;\n?function saveDebounced\(\)\{\n?  clearTimeout\(_saveTo\);\n?  _saveTo = setTimeout\(save, 1000\);\n?\}\n?\}\n?function save\(immediate = false\)\{'
replacement = '}catch(e3){}}\nfunction save(immediate = false){'

code, count = re.subn(target, replacement, code)
if count > 0:
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(code)
    print("Success")
else:
    print("Failed")
