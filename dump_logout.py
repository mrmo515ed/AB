with open("index.html", "r") as f:
    text = f.read()

idx = text.find("function logout()")
if idx != -1:
    print(text[idx:idx+500])
