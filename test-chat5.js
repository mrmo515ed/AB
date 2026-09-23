const { exec } = require('child_process');
exec('grep -A 50 "window.ensureChatListener =" index.html', (err, stdout) => {
  console.log(stdout);
});
