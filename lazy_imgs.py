import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Pattern to find <img ...> without loading="lazy"
def replace_img(match):
    tag = match.group(0)
    if 'loading=' in tag:
        return tag
    return tag.replace('<img ', '<img loading="lazy" ')

new_content = re.sub(r'<img\s+[^>]*>', replace_img, content)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Img tags updated.")
