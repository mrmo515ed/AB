const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const targetUsersSync = `const usersQuery = window.query(window.collection(window.db, 'users'));
    window.onSnapshot(usersQuery, (snap) => {
      snap.docs.forEach(d => {
        const ud = d.data();
        if(ud && ud.id){
          window._cloudUsers[ud.id] = ud;
        }
      });
      const userMap = {};
      (S.users || []).forEach(u => { if(u && u.id) userMap[u.id] = u; });
      Object.values(window._cloudUsers).forEach(cu => {
        if(cu && cu.id) userMap[cu.id] = Object.assign(userMap[cu.id] || {}, cu);
      });
      S.users = Object.values(userMap);
      const activeUid = S.activeAccountId || (S.me && (S.me.id || S.me.uid));
      if (activeUid && window._cloudUsers[activeUid]) {
        const freshMe = window._cloudUsers[activeUid];
        S.me = Object.assign(S.me || {}, freshMe);
        S.user = S.me;
        ensureAccounts();
      } else if (!activeUid && window.auth && window.auth.currentUser && window._cloudUsers[window.auth.currentUser.uid]) {
        const freshMe = window._cloudUsers[window.auth.currentUser.uid];
        S.me = Object.assign(S.me || {}, freshMe);
        S.user = S.me;
        ensureAccounts();
      }
      if (['users','explore','profile','home','chat'].includes(S.page)) debounceRender();
    }, (e) => console.warn("Firestore users sync note:", e.message || e));`;

code = code.replace(targetUsersSync, `// Global Users Sync removed to save quota. Using on-demand fetch in u() instead.
    // Sync current user only
    const activeUid = S.activeAccountId || (S.me && (S.me.id || S.me.uid)) || (window.auth && window.auth.currentUser && window.auth.currentUser.uid);
    if(activeUid) {
       window._myUserSub = window.onSnapshot(window.doc(window.db, 'users', activeUid), (doc) => {
          if(doc.exists()) {
             const freshMe = doc.data();
             S.me = Object.assign(S.me || {}, freshMe);
             S.user = S.me;
             window._cloudUsers[activeUid] = freshMe;
             ensureAccounts();
             saveLocalOnly();
          }
       });
    }`);

const uTarget = `// 6. Fallback to embedded author snapshot if present
  if(p && p.author) return p.author;
  // 7. Fallback stub
  return { id, name: "مستخدم", username: "user", avatar: AV[0], joined: now() };`;

const uReplace = `// 6. Fallback to embedded author snapshot if present
  if(p && p.author) return p.author;
  
  // 6.5 Queue background fetch if not found locally
  if(id && id !== "me" && id !== "otaku" && window.db) {
     if(!window._pendingUserFetches) window._pendingUserFetches = new Set();
     if(!window._pendingUserFetches.has(id)) {
        window._pendingUserFetches.add(id);
        window.getDoc(window.doc(window.db, "users", id)).then(d => {
           if(d.exists()) {
              const ud = d.data();
              if(ud && ud.id) {
                 window._cloudUsers[ud.id] = ud;
                 let foundLocal = false;
                 S.users = S.users || [];
                 for(let i=0; i<S.users.length; i++){
                    if(S.users[i].id === ud.id) { S.users[i] = ud; foundLocal = true; break; }
                 }
                 if(!foundLocal) S.users.push(ud);
                 window.saveLocalOnly();
                 if(window.debounceRender) window.debounceRender();
              }
           }
        }).catch(()=>{});
     }
  }

  // 7. Fallback stub
  return { id, name: "مستخدم", username: "user", avatar: AV[0], joined: now() };`;

code = code.replace(uTarget, uReplace);
fs.writeFileSync('index.html', code);
console.log("Success");
