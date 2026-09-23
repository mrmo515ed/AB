const { exec } = require('child_process');
exec('grep -B 10 -A 20 "if(level === 1)" index.html', (err, stdout) => {
  console.log(stdout);
});
