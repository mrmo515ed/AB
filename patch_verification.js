const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

html = html.replace(
  'window.createUserWithEmailAndPassword(window.auth, e, pw).then((cred) => {',
  'window.createUserWithEmailAndPassword(window.auth, e, pw).then((cred) => {\n    window.sendEmailVerification(cred.user).catch(e => console.warn(e));'
);

html = html.replace(
  'window.createUserWithEmailAndPassword(window.auth, e, pw).then(cred => {',
  'window.createUserWithEmailAndPassword(window.auth, e, pw).then(cred => {\n        window.sendEmailVerification(cred.user).catch(e => console.warn(e));'
);

fs.writeFileSync('index.html', html);
