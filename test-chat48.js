const { exec } = require('child_process');
exec('grep -A 20 "function u(i" index.html', (err, stdout) => {
  console.log(stdout);
});
