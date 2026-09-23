const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const newLoginUI = `PAGES.login=()=>authShell(\`
  <div class="card" style="padding:18px;text-align:center">
    <div style="margin-bottom:24px">
      <div style="font-size:48px;margin-bottom:12px">\${I("usercheck", "l")}</div>
      <div class="bb" style="font-size:22px;color:var(--accent)">مرحباً بك في أنمي بلاك</div>
      <div class="tiny fnt mut" style="margin-top:6px;font-size:13px">سجل الدخول بحساب Google للوصول إلى عالمك الخاص</div>
    </div>
    
    <button class="btn btn-sec btn-lg" style="width:100%;justify-content:center;gap:12px;background:#fff;color:#000;border:none;border-radius:12px;padding:14px" onclick="doLogin('google')">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M23.52 12.2727C23.52 11.4218 23.4436 10.6036 23.3018 9.81818H12V14.4545H18.4582C18.18 15.9545 17.3345 17.2255 16.0527 18.0818V21.0927H19.9364C22.2055 19.0036 23.52 15.9273 23.52 12.2727Z" fill="#4285F4"/>
        <path fill-rule="evenodd" clip-rule="evenodd" d="M12.0001 24C15.2401 24 17.9674 22.9255 19.9365 21.0927L16.0528 18.0818C14.9892 18.7964 13.6146 19.2273 12.0001 19.2273C8.87463 19.2273 6.22918 17.1164 5.27463 14.2855H1.26013V17.3945C3.23463 21.3164 7.28736 24 12.0001 24Z" fill="#34A853"/>
        <path fill-rule="evenodd" clip-rule="evenodd" d="M5.27455 14.2855C5.03455 13.5655 4.90364 12.7964 4.90364 12C4.90364 11.2036 5.03455 10.4345 5.27455 9.71455V6.60547H1.26001C0.452733 8.21455 0 10.0473 0 12C0 13.9527 0.452733 15.7855 1.26001 17.3945L5.27455 14.2855Z" fill="#FBBC05"/>
        <path fill-rule="evenodd" clip-rule="evenodd" d="M12.0001 4.77273C13.7619 4.77273 15.3328 5.37818 16.5765 6.56182L20.0183 3.12C17.9619 1.20545 15.2346 0 12.0001 0C7.28736 0 3.23463 2.68364 1.26013 6.60545L5.27468 9.71455C6.22922 6.88364 8.87468 4.77273 12.0001 4.77273Z" fill="#EA4335"/>
      </svg>
      <span class="bb" style="font-size:16px">المتابعة باستخدام Google</span>
    </button>
    <div class="tiny fnt mut" style="margin-top:16px">أمان حسابك هو أولويتنا. استخدامك لـ Google يضمن حماية متقدمة لبياناتك.</div>
  </div>
  <div class="row wrap center" style="justify-content:center;gap:7px">
    <button class="chip" onclick="S.lang=S.lang==='ar'?'en':'ar';save();toast('اللغة: '+(S.lang==='ar'?'العربية':'English'),'info');render()">\${I("globe","i s")} \${S.lang==="ar"?"العربية":"English"}</button>
    <button class="chip" onclick="S.theme=S.theme==='dark'?'light':'dark';document.body.className=S.theme==='light'?'light':'';save();render()">\${I(S.theme==="dark"?"moon":"sun","i s")} \${S.theme==="dark"?"ليلي":"نهاري"}</button>
    <button class="chip" onclick="go('downloadApp')">\${I("download","i s")} حمّل التطبيق</button>
  </div>
\`);
PAGES.signup=PAGES.login;
PAGES.forgot=PAGES.login;`;

code = code.replace(/PAGES\.login=\(\)=>authShell\([\s\S]*?PAGES\.signup=\(\)=>authShell\([\s\S]*?<\/div>\`\);/m, newLoginUI);

fs.writeFileSync('index.html', code);
console.log("Success replacing UI");
