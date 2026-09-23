const { exec } = require('child_process');
exec('grep -A 50 "const rows=(filteredChats" index.html', (err, stdout) => {
  console.log(stdout);
});
