const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const replacement = `let _renderTo;
function debounceRender(opts) {
  clearTimeout(_renderTo);
  _renderTo = setTimeout(() => { render(opts); }, 500);
}
function render(opts = {}){`;

code = code.replace(/function render\(opts = \{\}\)\{/g, replacement);

// Replace render() calls inside onSnapshot with debounceRender()
code = code.replace(/if \(\['profile', 'publicProfile', 'followers', 'communityDetail', 'chat'\]\.includes\(S\.page\)\) render\(\);/g, `if (['profile', 'publicProfile', 'followers', 'communityDetail', 'chat'].includes(S.page)) debounceRender();`);

code = code.replace(/if \(\['explore', 'communityDetail', 'communityChannel', 'admin'\]\.includes\(S\.page\)\) render\(\);/g, `if (['explore', 'communityDetail', 'communityChannel', 'admin'].includes(S.page)) debounceRender();`);

fs.writeFileSync('index.html', code);
console.log("Success");
