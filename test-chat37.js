const { exec } = require('child_process');
exec('grep -A 30 "function recVoice" index.html', (err, stdout) => {
  console.log(stdout);
});
