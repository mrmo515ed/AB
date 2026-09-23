const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

// Replace openAccountSwitcher
const regex = /function openAccountSwitcher\(\)\{[\s\S]*?openSheet\('accountSwitcherSheet'\);\s*\}/;
code = code.replace(regex, `function openAccountSwitcher(){
  if (confirm("تبديل الحساب يتطلب تسجيل الدخول بحساب Google آخر. هل ترغب في المتابعة؟")) {
    if (window.auth) {
      window.auth.signOut().then(() => {
        doLogin('google');
      });
    }
  }
}`);

fs.writeFileSync('index.html', code);
console.log("Success replacing openAccountSwitcher");
