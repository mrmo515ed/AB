const { exec } = require('child_process');
exec('grep -A 20 "uploadTask.on" index.html', (err, stdout) => {
  console.log(stdout);
});
