const { exec } = require('child_process');
exec('grep -A 20 "S.chats.forEach(c=>{" index.html', (err, stdout) => {
  console.log(stdout);
});
