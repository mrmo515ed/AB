import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

def replace_vid(match):
    tag = match.group(0)
    if 'preload=' in tag:
        return tag
    if 'autoplay' not in tag:
        return tag.replace('<video ', '<video preload="metadata" ')
    return tag

new_content = re.sub(r'<video\s+[^>]*>', replace_vid, content)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Video tags updated.")
