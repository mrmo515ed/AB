import re

with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

# Replace any lingering #E11D48 with #EC4899 (Pink) or #F43F5E (Rose) depending on context
text = text.replace('#E11D48', '#EC4899')
text = text.replace('rgba(225,29,72', 'rgba(236,72,153')
text = text.replace('#BE123C', '#BE185D')
text = text.replace('var(--alert, #E11D48)', 'var(--alert, #EC4899)')

# Check empty state styling
old_empty = ".empty{text-align:center;padding:44px 20px;color:var(--faint)}"
new_empty = ".empty{text-align:center;padding:50px 20px;color:var(--faint);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;opacity:0.8;animation:fadeIn .4s ease}"
if old_empty in text:
    text = text.replace(old_empty, new_empty)

# Enhance animations slightly for micro-interactions
old_card_css = ".card{background:rgba(28,28,42,0.6);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,0.08);border-radius:24px;overflow:hidden;transition:all .2s ease;box-shadow:0 4px 24px rgba(0,0,0,0.15)}"
new_card_css = ".card{background:rgba(28,28,42,0.6);backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,0.06);border-radius:24px;overflow:hidden;transition:all .25s cubic-bezier(.4,0,.2,1);box-shadow:0 8px 32px rgba(0,0,0,0.15)}\n.card:hover{transform:translateY(-2px);box-shadow:0 12px 40px rgba(0,0,0,0.25);border-color:rgba(255,255,255,0.12)}"
if old_card_css in text:
    text = text.replace(old_card_css, new_card_css)
    
old_card2_css = ".card2{background:rgba(28,28,42,0.8);border:1px solid rgba(255,255,255,0.06);border-radius:20px;overflow:hidden;transition:all .2s ease;box-shadow:0 2px 12px rgba(0,0,0,0.1)}"
new_card2_css = ".card2{background:rgba(28,28,42,0.8);border:1px solid rgba(255,255,255,0.06);border-radius:20px;overflow:hidden;transition:all .25s cubic-bezier(.4,0,.2,1);box-shadow:0 4px 16px rgba(0,0,0,0.1)}\n.card2:hover{transform:translateY(-1.5px);box-shadow:0 8px 24px rgba(0,0,0,0.15);border-color:rgba(255,255,255,0.1)}"
if old_card2_css in text:
    text = text.replace(old_card2_css, new_card2_css)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(text)
print("Color & Micro-interactions applied!")
