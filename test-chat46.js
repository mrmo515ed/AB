const { exec } = require('child_process');
exec('grep -A 10 "window._notifSub =" index.html', (err, stdout) => {
  console.log(stdout);
});
