const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

function patchListener(collectionName, varName, liveVar) {
  const regex = new RegExp(\`if\s*\\\(\\\b\${liveVar}\\\b\\.length\\s*>\\s*0\\\)\\s*\\\{\\s*const \${varName}Map = \\\{\\\};\\s*\\\(S\\.\${varName} \\|\\| \\\[\\\]\\\)\\.forEach\\\(r => \\\{ if \\\(r && r\\.id\\\) \${varName}Map\\\[r\\.id\\\] = r; \\\\}\\s*\\\);\\s*\${liveVar}\\.forEach\\\(r => \\\{ \${varName}Map\\\[r\\.id\\\] = Object\\.assign\\\(\${varName}Map\\\[r\\.id\\\] \\|\\| \\\{\\\}, r\\\); \\\\}\\s*\\\);\\s*const merged = Object\\.values\\\(\${varName}Map\\\);\\s*merged\\.sort\\\(\\\(a, b\\\) => \\\(\\\(b\\.createdAt \\|\\| b\\.at\\\) \\|\\| 0\\\) - \\\(\\\(a\\.createdAt \\|\\| a\\.at\\\) \\|\\| 0\\\)\\\);\\s*S\\.\${varName} = merged;\\s*saveLocalOnly\\\(\\\);\\s*if\\s*\\\(S\\.page\\s*===\\s*'[^']+'\\\)\\s*debounceRender\\\(\\\);\\s*\\\}\`);
  
  // Note: Since each listener has different `S.page === '...'` we will use a more generic replacement.
}

// A simpler way is to replace the exact pattern for each using string replacement
html = html.replace(
  /if \(liveReels\.length > 0\) \{\s*const reelMap = \{\};\s*\(S\.reels \|\| \[\]\)\.forEach\(r => \{ if \(r && r\.id\) reelMap\[r\.id\] = r; \}\);\s*liveReels\.forEach\(r => \{ reelMap\[r\.id\] = Object\.assign\(reelMap\[r\.id\] \|\| \{\}, r\); \}\);\s*const merged = Object\.values\(reelMap\);\s*merged\.sort\(\(a, b\) => \(b\.createdAt \|\| b\.at \|\| 0\) - \(a\.createdAt \|\| a\.at \|\| 0\)\);\s*S\.reels = merged;\s*saveLocalOnly\(\);\s*if \(S\.page === 'reels'\) debounceRender\(\);\s*\}/g,
  `const reelMap = {};
      (S.reels || []).forEach(r => { if (r && r.id && r.pending) reelMap[r.id] = r; });
      liveReels.forEach(r => { reelMap[r.id] = Object.assign(reelMap[r.id] || {}, r); });
      const merged = Object.values(reelMap);
      merged.sort((a, b) => (b.createdAt || b.at || 0) - (a.createdAt || a.at || 0));
      S.reels = merged;
      saveLocalOnly();
      if (S.page === 'reels') debounceRender();`
);

html = html.replace(
  /if\(liveComms\.length > 0\)\{\s*const commMap = \{\};\s*\(S\.communities \|\| \[\]\)\.forEach\(c => \{ if\(c && c\.id\) commMap\[c\.id\] = c; \}\);\s*liveComms\.forEach\(c => \{ commMap\[c\.id\] = Object\.assign\(commMap\[c\.id\] \|\| \{\}, c\); \}\);\s*const merged = Object\.values\(commMap\);\s*merged\.sort\(\(a,b\)=>\(b\.createdAt\|\|b\.at\|\|0\)-\(a\.createdAt\|\|a\.at\|\|0\)\);\s*S\.communities = merged;\s*saveLocalOnly\(\);\s*if\(\['communities','explore','home'\]\.includes\(S\.page\)\) debounceRender\(\);\s*\}/g,
  `const commMap = {};
      (S.communities || []).forEach(c => { if(c && c.id && c.pending) commMap[c.id] = c; });
      liveComms.forEach(c => { commMap[c.id] = Object.assign(commMap[c.id] || {}, c); });
      const merged = Object.values(commMap);
      merged.sort((a,b)=>(b.createdAt||b.at||0)-(a.createdAt||a.at||0));
      S.communities = merged;
      saveLocalOnly();
      if(['communities','explore','home'].includes(S.page)) debounceRender();`
);

html = html.replace(
  /if\(liveGroups\.length > 0\)\{\s*const grpMap = \{\};\s*\(S\.groups \|\| \[\]\)\.forEach\(g => \{ if\(g && g\.id\) grpMap\[g\.id\] = g; \}\);\s*liveGroups\.forEach\(g => \{ grpMap\[g\.id\] = Object\.assign\(grpMap\[g\.id\] \|\| \{\}, g\); \}\);\s*const merged = Object\.values\(grpMap\);\s*merged\.sort\(\(a,b\)=>\(b\.createdAt\|\|b\.at\|\|0\)-\(a\.createdAt\|\|a\.at\|\|0\)\);\s*S\.groups = merged;\s*saveLocalOnly\(\);\s*if\(\['groups','explore','home'\]\.includes\(S\.page\)\) debounceRender\(\);\s*\}/g,
  `const grpMap = {};
        (S.groups || []).forEach(g => { if(g && g.id && g.pending) grpMap[g.id] = g; });
        liveGroups.forEach(g => { grpMap[g.id] = Object.assign(grpMap[g.id] || {}, g); });
        const merged = Object.values(grpMap);
        merged.sort((a,b)=>(b.createdAt||b.at||0)-(a.createdAt||a.at||0));
        S.groups = merged;
        saveLocalOnly();
        if(['groups','explore','home'].includes(S.page)) debounceRender();`
);

html = html.replace(
  /if\(liveWorlds\.length > 0\)\{\s*const wrldMap = \{\};\s*\(S\.worlds \|\| \[\]\)\.forEach\(w => \{ if\(w && w\.id\) wrldMap\[w\.id\] = w; \}\);\s*liveWorlds\.forEach\(w => \{ wrldMap\[w\.id\] = Object\.assign\(wrldMap\[w\.id\] \|\| \{\}, w\); \}\);\s*const merged = Object\.values\(wrldMap\);\s*merged\.sort\(\(a,b\)=>\(b\.createdAt\|\|b\.at\|\|0\)-\(a\.createdAt\|\|a\.at\|\|0\)\);\s*S\.worlds = merged;\s*saveLocalOnly\(\);\s*if\(\['worlds','explore','home'\]\.includes\(S\.page\)\) debounceRender\(\);\s*\}/g,
  `const wrldMap = {};
        (S.worlds || []).forEach(w => { if(w && w.id && w.pending) wrldMap[w.id] = w; });
        liveWorlds.forEach(w => { wrldMap[w.id] = Object.assign(wrldMap[w.id] || {}, w); });
        const merged = Object.values(wrldMap);
        merged.sort((a,b)=>(b.createdAt||b.at||0)-(a.createdAt||a.at||0));
        S.worlds = merged;
        saveLocalOnly();
        if(['worlds','explore','home'].includes(S.page)) debounceRender();`
);

fs.writeFileSync('index.html', html);
