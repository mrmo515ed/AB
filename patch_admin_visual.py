# -*- coding: utf-8 -*-
with open("index.html", "r", encoding="utf-8") as f:
    text = f.read()

# 1. Add tab to tabs array
old_tab_str = '["tools","الأدوات والطرفية","terminal",0]'
new_tab_str = '["visual","مركز التحكم البصري (Owner)","sparkles",0],        ["tools","الأدوات والطرفية","terminal",0]'

if old_tab_str in text and '["visual","مركز التحكم البصري (Owner)"' not in text:
    text = text.replace(old_tab_str, new_tab_str)
    print("Added visual tab to admin tabs array!")

# 2. Add visual tab rendering in PAGES.admin
old_branch_str = '  // default: t === "tools"'
new_branch_str = '''  if (t === "visual") {
    return PAGES.visualControlCenter();
  }
  // default: t === "tools"'''

if old_branch_str in text and 'if (t === "visual")' not in text:
    text = text.replace(old_branch_str, new_branch_str)
    print("Added t === 'visual' render branch in PAGES.admin!")

with open("index.html", "w", encoding="utf-8") as f:
    f.write(text)

print("Patch complete.")
