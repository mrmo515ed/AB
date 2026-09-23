import re
with open("index.html", "r") as f:
    text = f.read()

idx = text.find("window.onAuthStateChanged(window.auth, (user) => {")
if idx != -1:
    print(text[idx:idx+1200])
