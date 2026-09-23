import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

func = """function fileToDataURL(file, maxSize, cb) {
  if (file.size > maxSize) {
    toast("عذراً، الملف كبير جداً", "err");
    cb(null);
    return;
  }
  const reader = new FileReader();
  reader.onload = () => cb(reader.result);
  reader.onerror = () => { toast("فشل قراءة الملف", "err"); cb(null); };
  reader.readAsDataURL(file);
}
"""

if "function fileToDataURL" not in content:
    # Insert it right before "function attachToChat"
    content = content.replace("function attachToChat", func + "function attachToChat")
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(content)
        print("Patched fileToDataURL")
