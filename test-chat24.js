const { exec } = require('child_process');
exec('grep -A 20 "const cid=room?(room.kind+" index.html', (err, stdout) => {
  console.log(stdout);
});
