const { exec } = require('child_process');
exec('grep -A 20 "if(cd.wallpaper !== undefined) {" index.html', (err, stdout) => {
  console.log(stdout);
});
