const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const regex = /} else {\n\s*S\.user = null;\n\s*if \(\['workspace', 'create', 'editProfile', 'completeProfile'\]\.includes\(S\.page\)\) \{/;

const replacement = `} else {
      if (window._notifSub) {
        window._notifSub();
        window._notifSub = null;
      }
      S.user = null;
      if (['workspace', 'create', 'editProfile', 'completeProfile'].includes(S.page)) {`;

html = html.replace(regex, replacement);
fs.writeFileSync('index.html', html);
