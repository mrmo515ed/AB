# -*- coding: utf-8 -*-
import re

with open("index.html", "r", encoding="utf-8") as f:
    code = f.read()

# Check if visual control center code is already present
if "VISUAL_CONTROL_CENTER_ENGINE" in code:
    print("Already installed!")
    exit(0)

print("Reading index.html...")
