import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

splash_old = """  clearInterval(window.__splashT);let i=0;window.__splashT=setInterval(()=>{i++;const e=$("#splashtxt");if(e)e.textContent=steps[Math.min(i,3)];if(i>=4){clearInterval(window.__splashT);go(S.user?'home':'pwaGate',{},false)}},480);"""
splash_new = """  clearInterval(window.__splashT);let i=0;window.__splashT=setInterval(()=>{i++;const e=$("#splashtxt");if(e)e.textContent=steps[Math.min(i,3)];if(i>=4){clearInterval(window.__splashT);if(S.user)go('home',{},false);else if(window.pwaManager&&window.pwaManager.isStandalone)go('login',{},false);else go('pwaGate',{},false);}},480);"""

splash_old_2 = """onclick="clearInterval(window.__splashT);go(S.user?'home':'pwaGate',{},false)">تخطي"""
splash_new_2 = """onclick="clearInterval(window.__splashT);if(S.user)go('home',{},false);else if(window.pwaManager&&window.pwaManager.isStandalone)go('login',{},false);else go('pwaGate',{},false)">تخطي"""

if "window.pwaManager.isStandalone)go('login'" not in content:
    content = content.replace(splash_old, splash_new)
    content = content.replace(splash_old_2, splash_new_2)
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(content)
        print("Patched splash for PWA Gate")
