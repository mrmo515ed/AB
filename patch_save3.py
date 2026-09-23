with open('index.html', 'r', encoding='utf-8') as f:
    code = f.read()

target = '}catch(e3){}}let _saveTo;function saveDebounced(){  clearTimeout(_saveTo);  _saveTo = setTimeout(save, 1000);}}function save(immediate = false){'
replacement = '}catch(e3){}}function save(immediate = false){'

if target in code:
    code = code.replace(target, replacement)
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(code)
    print("Success")
else:
    print("Failed")
