const fs = require('fs');
let fb = JSON.parse(fs.readFileSync('firebase.json', 'utf8'));
fb.firestore.indexes = "firestore.indexes.json";
fs.writeFileSync('firebase.json', JSON.stringify(fb, null, 2));
