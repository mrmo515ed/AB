const { exec } = require('child_process');
exec('grep -A 20 "PAGES.chats=()=>{" index.html', (err, stdout) => {
  console.log(stdout);
});
