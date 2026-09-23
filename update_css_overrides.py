import re
with open("index.html", "r", encoding="utf-8") as f:
    html = f.read()

overrides = """
/* =========================================================
   COMPREHENSIVE UI UPDATE - OVERRIDES
   ========================================================= */
:root {
  --r: 24px;
  --r-sm: 16px;
  --r-lg: 28px;
}

body {
  line-height: 1.65;
}

.card {
  border-radius: var(--r);
  box-shadow: 0 16px 40px -8px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.12);
  background: linear-gradient(165deg, rgba(22, 25, 38, 0.8) 0%, rgba(12, 14, 24, 0.95) 100%);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.card:hover {
  border-color: rgba(0, 240, 255, 0.5);
  box-shadow: 0 24px 50px -8px rgba(0,0,0,0.75), 0 0 30px rgba(0, 240, 255, 0.2);
  transform: translateY(-3px);
}

.card2 {
  border-radius: 20px;
  background: linear-gradient(165deg, rgba(28, 32, 50, 0.8) 0%, rgba(16, 18, 28, 0.95) 100%);
  box-shadow: 0 10px 30px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.card2:hover {
  border-color: rgba(0, 240, 255, 0.4);
  box-shadow: 0 16px 40px rgba(0,0,0,0.5), 0 0 22px rgba(0, 240, 255, 0.15);
  transform: translateY(-2px);
}

.btn {
  padding: 10px 18px;
  border-radius: 12px;
  font-size: 13px;
  letter-spacing: 0.3px;
}

.btn-sm {
  padding: 6px 14px;
  font-size: 12px;
  border-radius: 10px;
}

.btn-xs {
  padding: 4px 10px;
  font-size: 11px;
  border-radius: 8px;
}

.inp {
  padding: 14px 18px;
  border-radius: 16px;
  font-size: 15px;
  background: rgba(10, 12, 20, 0.6);
  border: 1px solid rgba(255,255,255,0.12);
  box-shadow: inset 0 2px 6px rgba(0,0,0,0.3);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.inp:focus {
  border-color: var(--accent);
  background: rgba(10, 12, 20, 0.8);
  box-shadow: inset 0 2px 6px rgba(0,0,0,0.4), 0 0 0 4px rgba(0, 240, 255, 0.2);
}

.chip {
  padding: 8px 18px;
  font-size: 13px;
  border-radius: 99px;
  letter-spacing: 0.2px;
}

.nav {
  height: 72px;
  padding-bottom: calc(env(safe-area-inset-bottom) + 4px);
}

.nav button {
  gap: 6px;
  font-size: 11px;
}

.nav button svg {
  width: 22px;
  height: 22px;
}

.iconbtn {
  width: 36px;
  height: 36px;
  border-radius: 10px;
}

.hdr {
  height: 64px;
  padding: 0 20px;
}

.secttl h3 {
  font-size: 18px;
  letter-spacing: 0.5px;
}

.pad {
  padding: 20px;
  padding-bottom: 96px;
}
"""

if "</style>" in html:
    new_html = html.replace("</style>", overrides + "\n</style>", 1)
    with open("index.html", "w", encoding="utf-8") as f:
        f.write(new_html)
    print("Success")
else:
    print("Failed")
