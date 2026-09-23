const { exec } = require('child_process');
exec('grep -B 10 -A 50 "function ensureChatListener" index.html', (err, stdout) => {
  console.log(stdout);
});
