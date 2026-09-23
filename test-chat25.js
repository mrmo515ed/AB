const { exec } = require('child_process');
exec('grep -A 10 "function loadOlderChatMessages" index.html', (err, stdout) => {
  console.log(stdout);
});
