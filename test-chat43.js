const { exec } = require('child_process');
exec('grep -A 30 "if (mediaRec && mediaRec.state === \\"recording\\")" index.html', (err, stdout) => {
  console.log(stdout);
});
