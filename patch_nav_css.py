with open('index.html', 'r', encoding='utf-8') as f:
    code = f.read()

# Add CSS rules before </style>
css_extra = """
/* Robust Bottom Nav Visibility & Spacing Rules */
#nav.nav-hidden, .nav.nav-hidden { display: none !important; }
#page:not(.has-nav) .pad { padding-bottom: 24px !important; }
#page.has-nav .pad { padding-bottom: 88px !important; }
.home-fab { display: none !important; }
"""

pos_style = code.find('</style>')
if pos_style != -1:
    code = code[:pos_style] + css_extra + code[pos_style:]
    print("CSS rules added successfully!")
else:
    print("</style> not found!")

# Update setNav to use nav-hidden class and setProperty
old_setnav_start = """function setNav(on){  const nav = $("#nav");  if(!nav) return;  if(!on){    nav.style.display = "none";    return;  }  nav.style.display = "flex";"""
new_setnav_start = """function setNav(on){
  const nav = $("#nav");
  if(!nav) return;
  if(!on){
    nav.style.setProperty("display", "none", "important");
    nav.classList.add("nav-hidden");
    return;
  }
  nav.style.removeProperty("display");
  nav.style.display = "flex";
  nav.classList.remove("nav-hidden");"""

if old_setnav_start in code:
    code = code.replace(old_setnav_start, new_setnav_start, 1)
    print("setNav class logic added!")
else:
    print("old_setnav_start not matched, attempting normalized replace...")
    import re
    m = re.search(r'function setNav\(on\)\{\s*const nav = \$\("#nav"\);\s*if\(!nav\) return;\s*if\(!on\)\{\s*nav\.style\.display = "none";\s*return;\s*\}\s*nav\.style\.display = "flex";', code)
    if m:
        code = code[:m.start()] + new_setnav_start + code[m.end():]
        print("setNav class logic replaced via regex!")
    else:
        print("Regex failed to match setNav start!")

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(code)

print("Patch nav css script finished.")
