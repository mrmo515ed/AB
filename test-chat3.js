const { exec } = require('child_process');
exec('grep -A 40 "function syncChatMessage" index.html', (err, stdout) => {
  console.log(stdout);
});
