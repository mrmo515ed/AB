const { exec } = require('child_process');
exec('grep -B 10 -A 5 "function recVoice" index.html', (err, stdout) => {
  console.log(stdout);
});
