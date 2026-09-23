const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const regex = /let added = false;\s*snap\.docChanges\(\)\.forEach\(ch => \{\s*if \(ch\.type === "added"\) \{\s*const d = ch\.doc\.data\(\);\s*if \(d && d\.id && !g\.msgs\.some\(m => m\.id === d\.id\)\) \{\s*g\.msgs\.push\(d\);\s*added = true;\s*\}\s*\}\s*\}\);\s*if \(added\) \{/g;

const replacement = `let changed = false;
      snap.docChanges().forEach(ch => {
        const d = ch.doc.data();
        if (!d || !d.id) return;
        if (ch.type === "added") {
          if (!g.msgs.some(m => m.id === d.id)) {
            g.msgs.push(d);
            changed = true;
          }
        } else if (ch.type === "modified") {
          const idx = g.msgs.findIndex(m => m.id === d.id);
          if (idx > -1) {
            g.msgs[idx] = Object.assign(g.msgs[idx], d);
            changed = true;
          }
        } else if (ch.type === "removed") {
          g.msgs = g.msgs.filter(m => m.id !== d.id);
          changed = true;
        }
      });
      if (changed) {`;

html = html.replace(regex, replacement);
fs.writeFileSync('index.html', html);
