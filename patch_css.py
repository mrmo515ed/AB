with open('index.html', 'r') as f:
    text = f.read()

text = text.replace(
    '.chatbody{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:10px;background:radial-gradient(circle at 20% 10%,rgba(0,163,255,.04),transparent 60%),var(--bg);scroll-behavior:smooth}',
    '.chatbody{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:8px;background:linear-gradient(135deg, #0f1115 0%, #171b26 100%);background-image:radial-gradient(circle at center, rgba(255,255,255,0.015) 0%, transparent 100%), linear-gradient(135deg, #0f1115 0%, #171b26 100%);scroll-behavior:smooth}'
)

text = text.replace(
    '.msg{max-width:82%;padding:12px 16px;border-radius:20px;font-size:13.5px;line-height:1.5;position:relative;animation:slidein .2s ease-out;word-break:break-word;box-shadow:0 2px 8px rgba(0,0,0,.15);transition:transform .12s ease}',
    '.msg{max-width:80%;padding:10px 14px;border-radius:18px;font-size:14px;line-height:1.5;position:relative;animation:slidein .2s ease-out;word-break:break-word;transition:transform .12s ease}'
)

text = text.replace(
    '.msg.me{background:linear-gradient(135deg, rgba(0,163,255,1) 0%, rgba(139,92,246,1) 100%);color:#fff;border-bottom-left-radius:6px;border-bottom-right-radius:20px;align-self:flex-end;box-shadow:0 4px 16px rgba(0,163,255,.25)}',
    '.msg.me{background:#2563eb;color:#fff;border-bottom-right-radius:4px;border-bottom-left-radius:18px;align-self:flex-end;box-shadow:0 1px 2px rgba(0,0,0,0.15)}'
)

text = text.replace(
    '.msg.them{background:rgba(28,28,42,0.9);color:var(--text);border:1px solid rgba(255,255,255,0.06);border-bottom-right-radius:6px;border-bottom-left-radius:20px;align-self:flex-start;box-shadow:0 2px 10px rgba(0,0,0,.15)}',
    '.msg.them{background:#1e293b;color:#f8fafc;border:1px solid #334155;border-bottom-left-radius:4px;border-bottom-right-radius:18px;align-self:flex-start;box-shadow:0 1px 2px rgba(0,0,0,0.1)}'
)

with open('index.html', 'w') as f:
    f.write(text)
print("Patched CSS")
