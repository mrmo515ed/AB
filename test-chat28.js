const { exec } = require('child_process');
exec('grep -n "this.scrollHeight-this.scrollTop-this.clientHeight>240" index.html', (err, stdout) => {
  console.log(stdout);
});
