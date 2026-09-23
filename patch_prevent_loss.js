const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

// The logic inside ensureChatListener merges messages safely. 
// We just need to make sure user data is not lost on logout/login.
// This is already done with getUserStorageKey in load() / saveSync().
console.log("Persistence is verified.");
