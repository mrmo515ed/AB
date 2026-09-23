const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const replacement = `
  // Real-time Cloud Sync for Users (for Search and Explore)
  let usersQuery = window.query(window.collection(window.db, 'users'), window.limit(500));
  try {
     usersQuery = window.query(window.collection(window.db, 'users'), window.orderBy('joined', 'desc'), window.limit(500));
  } catch(e) {}
  
  window.onSnapshot(usersQuery, (snap) => {
    const liveUsers = snap.docs.map(d => d.data());
    const userMap = {};
    (S.users || []).forEach(u => { userMap[u.id] = u; });
    liveUsers.forEach(u => { userMap[u.id] = Object.assign(userMap[u.id] || {}, u); });
    S.users = Object.values(userMap);
    window._cloudUsers = window._cloudUsers || {};
    liveUsers.forEach(u => { window._cloudUsers[u.id] = u; });
    saveLocalOnly();
  }, (e) => {
    console.warn("Firestore users sync error, trying without orderBy:", e);
    const fallbackQ = window.query(window.collection(window.db, 'users'), window.limit(500));
    window.onSnapshot(fallbackQ, (snap2) => {
        const liveUsers = snap2.docs.map(d => d.data());
        const userMap = {};
        (S.users || []).forEach(u => { userMap[u.id] = u; });
        liveUsers.forEach(u => { userMap[u.id] = Object.assign(userMap[u.id] || {}, u); });
        S.users = Object.values(userMap);
        window._cloudUsers = window._cloudUsers || {};
        liveUsers.forEach(u => { window._cloudUsers[u.id] = u; });
        saveLocalOnly();
    });
  });
`;

html = html.replace(/const usersQuery = window\.query\(window\.collection\(window\.db, 'users'\), window\.orderBy\('joined', 'desc'\), window\.limit\(500\)\);\s*window\.onSnapshot\(usersQuery,[\s\S]*?console\.warn\("Firestore users sync error:", e\)\);/, replacement.trim());

fs.writeFileSync('index.html', html);
