const { exec } = require('child_process');
exec('grep -A 20 "SHEETS.attachSheet=" index.html', (err, stdout) => {
  console.log(stdout);
});
