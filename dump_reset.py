with open("index.html", "r") as f:
    text = f.read()

idx = text.find("function reset()")
if idx != -1:
    print(text[idx:idx+300])
