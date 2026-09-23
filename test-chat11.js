const { exec } = require('child_process');
exec('grep -A 80 "function ensureChatListener(id)" index.html', (err, stdout) => {
  console.log(stdout);
});
