with open('index.html', 'r') as f:
    text = f.read()

text = text.replace(
    '.msg.me{background:#2563eb;color:#fff;border-bottom-right-radius:4px;border-bottom-left-radius:18px;align-self:flex-end;box-shadow:0 1px 2px rgba(0,0,0,0.15)}',
    '.msg.me{background:#2563eb;color:#fff;border-bottom-left-radius:4px;border-bottom-right-radius:18px;align-self:flex-end;box-shadow:0 1px 2px rgba(0,0,0,0.15)}'
)

text = text.replace(
    '.msg.them{background:#1e293b;color:#f8fafc;border:1px solid #334155;border-bottom-left-radius:4px;border-bottom-right-radius:18px;align-self:flex-start;box-shadow:0 1px 2px rgba(0,0,0,0.1)}',
    '.msg.them{background:#1e293b;color:#f8fafc;border:1px solid #334155;border-bottom-right-radius:4px;border-bottom-left-radius:18px;align-self:flex-start;box-shadow:0 1px 2px rgba(0,0,0,0.1)}'
)

with open('index.html', 'w') as f:
    f.write(text)
print("Patched border radii")
