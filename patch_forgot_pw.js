const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// The replacement for PAGES.forgot
const forgotReplacement = `PAGES.forgot=()=>authShell(\`
  <div class="card" style="padding:16px">
    \${backHdr("استعادة كلمة المرور","إرسال رابط استعادة كلمة المرور")}
    <div class="div"></div>
    \${S.recoveryStep==="input"?\`
      <div class="row" style="gap:9px;margin-bottom:12px">
        <button class="chip \${S.recoveryVia!=='phone'?'on':''}" onclick="S.recoveryVia='email';render()">\${I("mail","i s")} بريد</button>
      </div>
      <label class="lbl">البريد الإلكتروني</label>
      <input class="inp" id="rc_v" value="\${esc(S.me.email)}" placeholder="أدخل بريدك الإلكتروني">
      <div style="height:13px"></div>
      <button class="btn btn-primary btn-lg" onclick="window.requestPasswordReset()">إرسال رابط الاستعادة \${I("send","i s")}</button>
    \`:\`
      <div class="center" style="padding:16px 0">
        <div style="width:76px;height:76px;border-radius:50%;background:rgba(16,185,129,.14);border:1px solid rgba(16,185,129,.4);display:flex;align-items:center;justify-content:center;margin:0 auto 13px;color:var(--emerald)">\${I("check","xl")}</div>
        <div class="bb" style="font-size:16px">تم إرسال رابط الاستعادة!</div>
        <div class="tiny mut" style="margin:7px 0 15px">يرجى التحقق من بريدك الإلكتروني لتعيين كلمة مرور جديدة.</div>
        <button class="btn btn-primary btn-lg" onclick="S.recoveryStep='input';save();go('login')">العودة لتسجيل الدخول</button>
      </div>\`}
  </div>
  <button class="btn btn-ghost btn-sm" style="align-self:center" onclick="S.recoveryStep='input';go('login')">\${I("back","i s")} رجوع</button>\`);

window.requestPasswordReset = function() {
  const email = document.getElementById('rc_v').value.trim();
  if (!email) {
    toast('يرجى إدخال البريد الإلكتروني', 'err');
    return;
  }
  toast('جارٍ إرسال الرابط...', 'info');
  window.sendPasswordResetEmail(window.auth, email)
    .then(() => {
      S.recoveryStep = 'done';
      save();
      render();
      celebrate('تم إرسال رابط الاستعادة بنجاح');
    })
    .catch((error) => {
      console.error(error);
      toast('حدث خطأ: ' + error.message, 'err');
    });
};
`;

const regex = /PAGES\.forgot=\(\)=>authShell\(`[\s\S]*?<button class="btn btn-ghost btn-sm" style="align-self:center" onclick="S\.recoveryStep='input';go\('login'\)">\$\{I\("back","i s"\)\} رجوع<\/button>`\);/;
html = html.replace(regex, forgotReplacement);

// Also remove the old verifyOtp and otpNext functions since they are no longer used by forgot.
// Actually, let's leave them if they are used by twofa.
fs.writeFileSync('index.html', html);
