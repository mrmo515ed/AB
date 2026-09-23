const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const regex = /const userKey = getUserStorageKey\(user\.uid\);\s*KEY = userKey;\s*try\{\s*localStorage\.setItem\("animeblack_last_active_uid", user\.uid\);\s*\}catch\(e\)\{\}/;

const replacement = `const userKey = getUserStorageKey(user.uid);
      if (KEY !== userKey) {
        KEY = userKey;
        try {
          const raw = localStorage.getItem(KEY);
          if (raw) {
             const parsed = JSON.parse(raw);
             // Merge with current volatile state (like page, but overwrite data)
             Object.assign(S, parsed);
          } else {
             // Complete reset if no local state for this new user exists yet
             const tempPage = S.page;
             const tempSaved = S.savedAccounts;
             for (let prop in S) { delete S[prop]; }
             S.page = tempPage;
             S.savedAccounts = tempSaved;
          }
          localStorage.setItem("animeblack_last_active_uid", user.uid);
        } catch(e) {}
      }`;

html = html.replace(regex, replacement);
fs.writeFileSync('index.html', html);
