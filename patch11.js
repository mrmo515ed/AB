const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const regex = /const usersQuery = window\.query\(window\.collection\(window\.db, 'users'\)\);\s*window\.onSnapshot\(usersQuery, \(snap\) => \{[\s\S]*?\(e\) => console\.warn\("Firestore users sync note:", e\.message \|\| e\)\);/m;

if (regex.test(code)) {
    code = code.replace(regex, `// Global Users Sync removed to save quota. Using on-demand fetch in u() instead.
    const activeUid = S.activeAccountId || (S.me && (S.me.id || S.me.uid)) || (window.auth && window.auth.currentUser && window.auth.currentUser.uid);
    if(activeUid) {
       window._myUserSub = window.onSnapshot(window.doc(window.db, 'users', activeUid), (doc) => {
          if(doc.exists()) {
             const freshMe = doc.data();
             S.me = Object.assign(S.me || {}, freshMe);
             S.user = S.me;
             window._cloudUsers[activeUid] = freshMe;
             if(typeof ensureAccounts === 'function') ensureAccounts();
             if(typeof saveLocalOnly === 'function') saveLocalOnly();
          }
       });
    }`);
    fs.writeFileSync('index.html', code);
    console.log("Success replacing usersQuery");
} else {
    console.log("Regex not found!");
}
