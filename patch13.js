const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const target = `  // 6. Fallback to embedded author snapshot if present
  if(p && p.author) return p.author;
  // 6. Deterministic distinct user generation`;

code = code.replace(target, `  // 6. Fallback to embedded author snapshot if present
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
                 window._cloudUsers = window._cloudUsers || {};
                 window._cloudUsers[ud.id] = ud;
                 let foundLocal = false;
                 S.users = S.users || [];
                 for(let i=0; i<S.users.length; i++){
                    if(S.users[i].id === ud.id) { S.users[i] = ud; foundLocal = true; break; }
                 }
                 if(!foundLocal) S.users.push(ud);
                 if(typeof window.saveLocalOnly === 'function') window.saveLocalOnly();
                 if(typeof window.debounceRender === 'function') window.debounceRender();
              }
           }
        }).catch(()=>{});
     }
  }

  // 6. Deterministic distinct user generation`);

fs.writeFileSync('index.html', code);
console.log("Success");
