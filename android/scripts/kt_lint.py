#!/usr/bin/env python3
"""Offline sanity checks for Kotlin sources (no compiler available in the dev sandbox).

Detects: nested block comments (Kotlin comments nest, so `/api/*` inside KDoc swallows code),
unterminated comments/strings, and unbalanced brackets outside strings/comments.
"""
import sys, pathlib

def scan(path):
    s = path.read_text(encoding="utf-8")
    i, n, line = 0, len(s), 1
    problems, stack = [], []
    depth = 0
    while i < n:
        c = s[i]
        nxt = s[i + 1] if i + 1 < n else ""
        if c == "\n":
            line += 1
        if depth > 0:
            if c == "/" and nxt == "*":
                depth += 1
                problems.append(f"{path}:{line}: nested block comment opened (Kotlin comments nest)")
                i += 2
                continue
            if c == "*" and nxt == "/":
                depth -= 1
                i += 2
                continue
            i += 1
            continue
        if c == "/" and nxt == "/":
            while i < n and s[i] != "\n":
                i += 1
            continue
        if c == "/" and nxt == "*":
            depth = 1
            i += 2
            continue
        if s.startswith('"""', i):
            j = s.find('"""', i + 3)
            if j < 0:
                problems.append(f"{path}:{line}: unterminated raw string")
                break
            while j + 3 < n and s[j + 3] == '"':
                j += 1
            line += s.count("\n", i, j + 3)
            i = j + 3
            continue
        if c == '"':
            j = i + 1
            tmpl = 0
            while j < n:
                if s[j] == "\\":
                    j += 2
                    continue
                if s[j] == "$" and j + 1 < n and s[j + 1] == "{":
                    tmpl += 1
                    j += 2
                    continue
                if s[j] == "}" and tmpl:
                    tmpl -= 1
                elif s[j] == '"' and not tmpl:
                    break
                elif s[j] == "\n":
                    problems.append(f"{path}:{line}: newline in string literal")
                    break
                j += 1
            i = j + 1
            continue
        if c == "'":
            j = i + 1
            if j < n and s[j] == "\\":
                j += 2
            else:
                j += 1
            while j < n and s[j] != "'" and s[j] != "\n":
                j += 1
            i = j + 1
            continue
        if c in "([{":
            stack.append((c, line))
        elif c in ")]}":
            if not stack:
                problems.append(f"{path}:{line}: unmatched '{c}'")
            else:
                o, l = stack.pop()
                if "([{".index(o) != ")]}".index(c):
                    problems.append(f"{path}:{line}: '{c}' closes '{o}' from line {l}")
        i += 1
    if depth > 0:
        problems.append(f"{path}: unterminated block comment")
    for o, l in stack[-3:]:
        problems.append(f"{path}:{l}: unclosed '{o}'")
    return problems

def main():
    root = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else ".")
    files = [p for p in root.rglob("*.kt*") if "build" not in p.parts and p.suffix in (".kt", ".kts")]
    problems = [p for f in files for p in scan(f)]
    print("\n".join(problems) if problems else f"OK ({len(files)} files)")
    return 1 if problems else 0

if __name__ == "__main__":
    sys.exit(main())
