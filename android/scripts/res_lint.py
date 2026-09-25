#!/usr/bin/env python3
"""Checks Android string resources: XML validity, unescaped apostrophes/quotes, non-positional
multiple substitutions, and en/ar key parity. `--fix` escapes bare apostrophes."""
import re, sys, pathlib
import xml.etree.ElementTree as ET

def check(root, fix):
    problems = []
    for f in sorted(root.rglob("src/main/res/values*/strings.xml")):
        if "build" in f.parts:
            continue
        text = f.read_text(encoding="utf-8")
        try:
            tree = ET.fromstring(text)
        except ET.ParseError as e:
            problems.append(f"{f}: XML parse error {e}")
            continue
        new = text
        for el in tree.iter("string"):
            name, value = el.get("name"), (el.text or "")
            if re.search(r"(?<!\\)'", value):
                if fix:
                    esc = re.sub(r"(?<!\\)'", r"\\'", value)
                    new = new.replace(f'name="{name}">{value}<', f'name="{name}">{esc}<')
                else:
                    problems.append(f"{f}: {name}: unescaped apostrophe")
            if re.search(r'(?<!\\)"', value):
                problems.append(f"{f}: {name}: unescaped double quote")
            subs = re.findall(r"%(?!%)(\d+\$)?[-#+ 0,(]*\d*(?:\.\d+)?[sdfx]", value)
            if len(subs) > 1 and any(s == "" for s in subs):
                problems.append(f"{f}: {name}: multiple non-positional substitutions")
        if fix and new != text:
            f.write_text(new, encoding="utf-8")
    # key parity between values and values-ar for each module
    for base in sorted(root.rglob("src/main/res/values/strings.xml")):
        ar = base.parent.parent / "values-ar" / "strings.xml"
        if not ar.exists():
            continue
        k1 = {e.get("name") for e in ET.parse(base).getroot().iter("string")}
        k2 = {e.get("name") for e in ET.parse(ar).getroot().iter("string")}
        for k in sorted(k1 - k2):
            problems.append(f"{ar}: missing {k}")
        for k in sorted(k2 - k1):
            problems.append(f"{base}: missing {k}")
    return problems

if __name__ == "__main__":
    fix = "--fix" in sys.argv
    probs = check(pathlib.Path("."), fix)
    print("\n".join(probs) if probs else "OK")
    sys.exit(1 if probs else 0)
