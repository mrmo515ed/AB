const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

function addSafeRender(queryName) {
  const safeRenderCode = `
    const activeEl = document.activeElement;
    if(!activeEl || (activeEl.tagName !== "INPUT" && activeEl.tagName !== "TEXTAREA" && !activeEl.isContentEditable)) {
      debounceRender({ keepScroll: true });
    } else {
      // Defer render
      window._deferredRender = true;
    }
  `;
  const regex = new RegExp(`(window\\.onSnapshot\\(${queryName}, \\(snap\\) => \\{[\\s\\S]*?saveLocalOnly\\(\\);)`);
  if(code.match(regex)) {
    code = code.replace(regex, `$1\n    ${safeRenderCode}`);
  } else {
    console.log("Could not find", queryName);
  }
}

addSafeRender("usersQuery");
addSafeRender("communitiesQuery");
addSafeRender("groupsQuery");
addSafeRender("worldsQuery");

fs.writeFileSync('index.html', code);
console.log("Snapshots patched");
