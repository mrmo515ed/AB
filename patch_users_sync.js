const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const usersSync = `
  // Real-time Cloud Sync for Users (for Search and Explore)
  const usersQuery = window.query(window.collection(window.db, 'users'), window.orderBy('joined', 'desc'), window.limit(500));
  window.onSnapshot(usersQuery, (snap) => {
    const liveUsers = snap.docs.map(d => d.data());
    const userMap = {};
    (S.users || []).forEach(u => { userMap[u.id] = u; });
    liveUsers.forEach(u => { userMap[u.id] = Object.assign(userMap[u.id] || {}, u); });
    S.users = Object.values(userMap);
    window._cloudUsers = window._cloudUsers || {};
    liveUsers.forEach(u => { window._cloudUsers[u.id] = u; });
    saveLocalOnly();
  }, (e) => console.warn("Firestore users sync error:", e));

  // Real-time Cloud Sync for Posts`;

html = html.replace('// Real-time Cloud Sync for Posts', usersSync);

fs.writeFileSync('index.html', html);
console.log("Users sync added.");
