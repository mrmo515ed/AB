const { exec } = require('child_process');
exec('grep -A 100 "function boot()" index.html', (err, stdout) => {
  console.log(stdout);
});
