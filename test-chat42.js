const { exec } = require('child_process');
exec('grep -A 50 "const finish = async (blob) => {" index.html', (err, stdout) => {
  console.log(stdout);
});
