const { exec } = require('child_process');
exec('grep -A 20 "if(changed)" index.html', (err, stdout) => {
  console.log(stdout);
});
