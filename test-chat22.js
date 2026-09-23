const { exec } = require('child_process');
exec('grep -A 20 "window.renderAttachPreviewHTML" index.html', (err, stdout) => {
  console.log(stdout);
});
