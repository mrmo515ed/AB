import re

with open('index.html', 'r') as f:
    html = f.read()

with open('chat_module.js', 'r') as f:
    chat_js = f.read()

# Make sure we haven't already patched it
if 'Chat Module Loaded!' not in html:
    # Find the last </script> tag
    idx = html.rfind('</script>')
    if idx != -1:
        new_html = html[:idx] + "\n" + chat_js + "\n" + html[idx:]
        with open('index.html', 'w') as f:
            f.write(new_html)
        print("Patched successfully!")
    else:
        print("Could not find </script>")
else:
    print("Already patched!")

