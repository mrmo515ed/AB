import re
with open("index.html", "r") as f:
    text = f.read()

scripts = re.findall(r'<script.*?>([\s\S]*?)</script>', text)

import subprocess
import tempfile
import os

for i, script in enumerate(scripts):
    with tempfile.NamedTemporaryFile('w', delete=False, suffix='.js') as f:
        f.write(script)
        f.close()
        try:
            subprocess.run(["node", "-c", f.name], check=True)
            print(f"Script {i} syntax OK")
        except subprocess.CalledProcessError as e:
            print(f"Script {i} syntax ERROR")
        os.unlink(f.name)
