const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

code = code.replace(/const provider = new window\.GoogleAuthProvider\(\);/, `const provider = new window.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });`);

fs.writeFileSync('index.html', code);
console.log("Success");
