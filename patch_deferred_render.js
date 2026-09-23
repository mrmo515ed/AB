const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const deferLogic = `
// Global listener for focusout to trigger deferred renders
document.addEventListener('focusout', (e) => {
  if (window._deferredRender) {
    setTimeout(() => {
      const activeEl = document.activeElement;
      if(!activeEl || (activeEl.tagName !== "INPUT" && activeEl.tagName !== "TEXTAREA" && !activeEl.isContentEditable)) {
        window._deferredRender = false;
        debounceRender({ keepScroll: true });
      }
    }, 100);
  }
});
`;

if (!code.includes('focusout') || !code.includes('_deferredRender')) {
  code = code.replace(/window\.debounceRender = debounceRender;/, 'window.debounceRender = debounceRender;\n' + deferLogic);
  fs.writeFileSync('index.html', code);
  console.log("Deferred render patch applied.");
}
