const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const replacement = `if($('#dacc').value.trim()!=='احذف حسابي'){toast('اكتب نص التأكيد بالضبط','err');return} window.performAccountDeletion();`;

html = html.replace(/if\(\$\('#dacc'\)\.value\.trim\(\)!=='احذف حسابي'\)\{toast\('اكتب نص التأكيد بالضبط','err'\);return\}S\.deletionDaysLeft=30;save\(\);render\(\);toast\('جُدول الحذف بعد ٣٠ يوماً — يمكنك التراجع','err'\);snd\('error'\)/, replacement);

const scriptToAdd = `
window.performAccountDeletion = async function() {
  const user = window.auth.currentUser;
  if(!user) {
    toast('يرجى تسجيل الدخول أولاً', 'err');
    return;
  }
  if (!confirm('هل أنت متأكد من حذف الحساب نهائياً؟ هذا الإجراء لا يمكن التراجع عنه.')) return;
  toast('جارٍ حذف الحساب...', 'info');
  try {
    // Delete user document
    await window.deleteDoc(window.doc(window.db, "users", user.uid)).catch(e => console.warn(e));
    
    // Delete Auth
    await window.deleteUser(user);
    toast('تم حذف الحساب نهائياً', 'ok');
    
    // Clear local state
    S = null;
    localStorage.removeItem('anime_black_v25_session');
    window.location.reload();
  } catch (error) {
    console.error(error);
    if(error.code === 'auth/requires-recent-login') {
      toast('يرجى إعادة تسجيل الدخول لتأكيد الحذف', 'err');
      window.signOut(window.auth);
    } else {
      toast('حدث خطأ أثناء החذف: ' + error.message, 'err');
    }
  }
};
`;

html = html.replace('function privToggle(', scriptToAdd + '\nfunction privToggle(');
fs.writeFileSync('index.html', html);
