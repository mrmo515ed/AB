const { exec } = require('child_process');
exec('grep -A 20 "function updateTyping" index.html', (err, stdout) => {
  console.log(stdout);
});
