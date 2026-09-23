const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

html = html.replace(/if\s*\(liveReels\.length > 0\)\s*\{[\s\S]*?S\.page === 'reels'\)\s*debounceRender\(\);\s*\}/g,
  `const reelMap = {};
      (S.reels || []).forEach(r => { if (r && r.id && r.pending) reelMap[r.id] = r; });
      liveReels.forEach(r => { reelMap[r.id] = Object.assign(reelMap[r.id] || {}, r); });
      const merged = Object.values(reelMap);
      merged.sort((a, b) => (b.createdAt || b.at || 0) - (a.createdAt || a.at || 0));
      S.reels = merged;
      saveLocalOnly();
      if (S.page === 'reels') debounceRender();`
);

html = html.replace(/if\(liveComms\.length > 0\)\{[\s\S]*?debounceRender\(\);\s*\}/g,
  `const commMap = {};
      (S.communities || []).forEach(c => { if(c && c.id && c.pending) commMap[c.id] = c; });
      liveComms.forEach(c => { commMap[c.id] = Object.assign(commMap[c.id] || {}, c); });
      const merged = Object.values(commMap);
      merged.sort((a,b)=>(b.createdAt||b.at||0)-(a.createdAt||a.at||0));
      S.communities = merged;
      saveLocalOnly();
      if(['communities','explore','home'].includes(S.page)) debounceRender();`
);

html = html.replace(/if\(liveGroups\.length > 0\)\{[\s\S]*?debounceRender\(\);\s*\}/g,
  `const grpMap = {};
        (S.groups || []).forEach(g => { if(g && g.id && g.pending) grpMap[g.id] = g; });
        liveGroups.forEach(g => { grpMap[g.id] = Object.assign(grpMap[g.id] || {}, g); });
        const merged = Object.values(grpMap);
        merged.sort((a,b)=>(b.createdAt||b.at||0)-(a.createdAt||a.at||0));
        S.groups = merged;
        saveLocalOnly();
        if(['groups','explore','home'].includes(S.page)) debounceRender();`
);

html = html.replace(/if\(liveWorlds\.length > 0\)\{[\s\S]*?debounceRender\(\);\s*\}/g,
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
