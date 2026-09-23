const { exec } = require('child_process');
exec('grep -A 50 "SHEETS.attachSheet =" index.html', (err, stdout) => {
  console.log(stdout);
});
