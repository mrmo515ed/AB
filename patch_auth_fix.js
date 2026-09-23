const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const regex = /function getUserStorageKey.*?}/s;
const match = code.match(regex);
if (match) {
    console.log(match[0]);
} else {
    console.log("Not found");
}
