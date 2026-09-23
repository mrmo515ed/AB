const { exec } = require('child_process');
exec('grep -A 30 "navigator.mediaDevices.getUserMedia" index.html', (err, stdout) => {
  console.log(stdout);
});
