with open('index.html', 'r', encoding='utf-8') as f:
    code = f.read()

# Patch go()
target_go = 'S.page=page;S.params=params||{};\n  render();save();\n  const p=$("#page");if(p)p.scrollTop=0;'
replace_go = 'S.page=page;S.params=params||{};\n  render({keepScroll:false});save();\n  const p=$("#page");if(p)p.scrollTop=0;'
if target_go in code:
    code = code.replace(target_go, replace_go, 1)
    print("go() patched successfully!")
else:
    print("go() target NOT found!")

# Patch usersSub
target_users = 'S.users = Object.values(window._cloudUsers);\n          render();\n        }, (e) => console.error'
replace_users = 'S.users = Object.values(window._cloudUsers);\n          /* Silent sync - do not reload page on background user presence */\n        }, (e) => console.error'
if target_users in code:
    code = code.replace(target_users, replace_users, 1)
    print("usersSub patched successfully!")
else:
    print("usersSub target NOT found!")

# Also ensure CSS for .home-fab is disabled
code = code.replace('.home-fab{', '.home-fab{display:none!important;')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(code)

print("Finished second patch pass.")
