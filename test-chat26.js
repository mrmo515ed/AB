const { exec } = require('child_process');
exec('grep -B 2 -A 2 "window.ensureChatListener" index.html', (err, stdout) => {
  console.log(stdout);
});
