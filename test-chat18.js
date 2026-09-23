const { exec } = require('child_process');
exec('grep -A 50 "window.uploadChatAttachmentsWithProgress =" index.html', (err, stdout) => {
  console.log(stdout);
});
