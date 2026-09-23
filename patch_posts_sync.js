const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const replacement = `
    const postMap = {};
    (S.posts || []).forEach(p => { 
      if (p && p.id && (p.pending || p.uploading || p.failed)) {
        postMap[p.id] = p; 
      }
    });
    livePosts.forEach(p => { postMap[p.id] = Object.assign(postMap[p.id] || {}, p); });
    const merged = Object.values(postMap);
    merged.sort((a, b) => (b.createdAt || b.at || 0) - (a.createdAt || a.at || 0));
    S.posts = merged;
    window._cloudPosts = livePosts;
    saveLocalOnly();
`;

html = html.replace(/if\s*\(livePosts\.length\s*>\s*0\)\s*\{\s*const postMap = \{\};\s*\/\/[^\n]*\n\s*\(S\.posts \|\| \[\]\)\.forEach\(p => \{ if \(p && p\.id\) postMap\[p\.id\] = p; \}\);\s*\/\/[^\n]*\n\s*livePosts\.forEach\(p => \{ postMap\[p\.id\] = Object\.assign\(postMap\[p\.id\] \|\| \{\}, p\); \}\);\s*const merged = Object\.values\(postMap\);\s*merged\.sort\(\(a, b\) => \(b\.createdAt \|\| b\.at \|\| 0\) - \(a\.createdAt \|\| a\.at \|\| 0\)\);\s*S\.posts = merged;\s*window\._cloudPosts = livePosts;\s*saveLocalOnly\(\);/g, replacement);

fs.writeFileSync('index.html', html);
