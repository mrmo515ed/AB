with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

old_hdr_light = ".hdr{background:rgba(255,255,255,0.88);border-bottom:1px solid rgba(0,0,0,0.06);box-shadow:0 4px 20px rgba(0,0,0,0.05)}"
new_hdr_light = "body.light .hdr{background:rgba(255,255,255,0.88);border-bottom:1px solid rgba(0,0,0,0.06);box-shadow:0 4px 20px rgba(0,0,0,0.05)}"

if old_hdr_light in text:
    text = text.replace(old_hdr_light, new_hdr_light)
    print("Fixed light header.")

old_hdr = ".hdr{  height:58px;flex-shrink:0;display:flex;align-items:center;padding:0 16px;gap:12px;  background:rgba(10,10,15,0.85);backdrop-filter:blur(20px) saturate(1.4);-webkit-backdrop-filter:blur(20px) saturate(1.4);  border-bottom:1px solid rgba(255,255,255,0.08);z-index:30;position:relative;  box-shadow:0 4px 20px rgba(0,0,0,0.35)}"
new_hdr = ".hdr{  height:64px;flex-shrink:0;display:flex;align-items:center;padding:0 18px;gap:14px;  background:rgba(10,10,15,0.8);backdrop-filter:blur(24px) saturate(1.5);-webkit-backdrop-filter:blur(24px) saturate(1.5);  border-bottom:1px solid rgba(255,255,255,0.06);z-index:30;position:relative;  box-shadow:0 4px 24px rgba(0,0,0,0.4)}"

if old_hdr in text:
    text = text.replace(old_hdr, new_hdr)
    print("Fixed dark header.")

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(text)
