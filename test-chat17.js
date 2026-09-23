const { exec } = require('child_process');
exec('grep -A 80 "function prepareStateForLocalStorage" index.html', (err, stdout) => {
  console.log(stdout);
});
