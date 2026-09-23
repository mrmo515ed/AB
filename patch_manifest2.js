const fs = require('fs');
let json = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));
json.start_url = "/?mode=standalone";
fs.writeFileSync('manifest.json', JSON.stringify(json, null, 2));
console.log("Success");
