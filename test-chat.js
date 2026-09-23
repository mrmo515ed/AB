const { exec } = require('child_process');
exec('grep -A 50 "window._unifiedSendMsg" index.html', (err, stdout) => {
  console.log(stdout);
});
