with open('index.html', 'r', encoding='utf-8') as f:
    code = f.read()

# Make the saveDebounced much faster
save_target = """function saveDebounced(){
  clearTimeout(_saveTo);
  _saveTo = setTimeout(save, 1000);
}"""

save_replacement = """function saveDebounced(){
  // Only trigger a real save if needed, and do it faster (300ms instead of 1000ms)
  // This reduces UI lockup while typing
  clearTimeout(_saveTo);
  _saveTo = setTimeout(save, 300);
}"""

code = code.replace(save_target, save_replacement)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(code)
print("Done")
