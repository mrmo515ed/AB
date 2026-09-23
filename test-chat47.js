const { exec } = require('child_process');
exec('grep -A 20 "window._usersSub =" index.html', (err, stdout) => {
  console.log(stdout);
});
