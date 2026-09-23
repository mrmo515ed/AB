import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

old_code = """window.pwaManager = {
  isStandalone: false,

  init() {"""
new_code = """window.pwaManager = {
  isStandalone: false,
  isInstalled: false,

  init() {
    this.isInstalled = (localStorage.getItem('animeblack_pwa_installed') === 'true');"""

if "animeblack_pwa_installed" not in content:
    content = content.replace(old_code, new_code)
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(content)
        print("Patched pwaManager")
