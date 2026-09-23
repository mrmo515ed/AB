const { exec } = require('child_process');
exec('grep -A 30 "function save(" index.html', (err, stdout) => {
  console.log(stdout);
});
