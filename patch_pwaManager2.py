import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

old_code = """    this.isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                        (window.navigator && window.navigator.standalone === true) ||
                        document.referrer.includes('android-app://');"""
new_code = """    this.isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                        (window.navigator && window.navigator.standalone === true) ||
                        document.referrer.includes('android-app://');
    if (this.isStandalone) {
      this.isInstalled = true;
      try { localStorage.setItem('animeblack_pwa_installed', 'true'); } catch(e){}
    } else if (navigator.getInstalledRelatedApps) {
      navigator.getInstalledRelatedApps().then(apps => {
        if (apps.length > 0) {
          this.isInstalled = true;
          try { localStorage.setItem('animeblack_pwa_installed', 'true'); } catch(e){}
        }
      }).catch(()=>{});
    }"""

if "navigator.getInstalledRelatedApps" not in content:
    content = content.replace(old_code, new_code)
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(content)
        print("Patched pwaManager init logic")
