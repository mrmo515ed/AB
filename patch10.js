// Double check the old sync is fully gone
const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');
if(code.includes("window.onSnapshot(usersQuery, (snap)")) {
  console.log("Still has usersQuery snapshot");
} else {
  console.log("All clean");
}
