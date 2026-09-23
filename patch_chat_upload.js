const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const replacement = `
window.uploadChatAttachmentsWithProgress = async function(cid, msg, rawAttachments) {
  const c = (S.chats || []).find(x => x.id === cid);
  const filesToUpload = (rawAttachments || []).filter(a => a && a.file);
  const totalCount = Math.max(1, filesToUpload.length);

  msg.uploading = true;
  msg.uploadProgress = 10;
  window.updateMsgProgressDOM(msg.id, 10, true);

  let progressMap = {};
  const updateAggregateProgress = (forceVal) => {
    if (forceVal !== undefined) {
      msg.uploadProgress = forceVal;
      window.updateMsgProgressDOM(msg.id, forceVal, true);
      return;
    }
    let sum = 0;
    Object.values(progressMap).forEach(p => { sum += p; });
    const avg = Math.min(95, Math.max(15, Math.round(sum / totalCount)));
    msg.uploadProgress = avg;
    window.updateMsgProgressDOM(msg.id, avg, true);
  };

  let hasErrors = false;

  for (let i = 0; i < filesToUpload.length; i++) {
    const item = filesToUpload[i];
    const file = item.file;
    const fileExt = (file.name && file.name.includes('.')) ? file.name.split('.').pop() : (file.type ? file.type.split('/').pop() : 'dat');
    const fileName = \`media_\${Date.now()}_\${Math.random().toString(36).substring(2, 7)}.\${fileExt}\`;
    const storagePath = \`chats/\${cid}/media/\${fileName}\`;

    let uploadedUrl = null;
    if (window.storage && window.ref && window.uploadBytesResumable && window.getDownloadURL) {
      try {
        const storageRef = window.ref(window.storage, storagePath);
        const uploadTask = window.uploadBytesResumable(storageRef, file);

        await new Promise((resolve, reject) => {
          uploadTask.on('state_changed',
            (snapshot) => {
              const pct = (snapshot.bytesTransferred / (snapshot.totalBytes || 1)) * 100;
              progressMap[i] = Math.min(95, Math.round(pct));
              updateAggregateProgress();
            },
            (err) => {
              console.warn("Storage upload error fallback:", err);
              reject(err);
            },
            async () => {
              try {
                const url = await window.getDownloadURL(uploadTask.snapshot.ref);
                if (url) {
                  uploadedUrl = url;
                  resolve();
                } else {
                  reject(new Error("No URL"));
                }
              } catch(e) {
                reject(e);
              }
            }
          );
        });
      } catch(e) {
        console.warn("Storage upload exception:", e);
        hasErrors = true;
      }
    } else {
       hasErrors = true;
    }

    if (uploadedUrl) {
      item.src = uploadedUrl;
      item.file = null; // Free memory
      if (msg.attachments && msg.attachments[i]) {
        msg.attachments[i].src = uploadedUrl;
        msg.attachments[i].file = null;
      }
      if (i === 0) msg.src = uploadedUrl;
    }

    progressMap[i] = 100;
  }

  if (hasErrors) {
    msg.uploading = false;
    msg.st = 4; // Failed
    msg.pending = true;
    toast('فشل رفع بعض الملفات', 'err');
    saveDebounced();
    window.updateMsgProgressDOM(msg.id, 0, false);
    return;
  }

  // All files uploaded & processed successfully!
  msg.uploadProgress = 100;
  msg.uploading = false;
  msg.st = 2; // Sent ✓
  msg.pending = false;
  saveDebounced();
  window.updateMsgProgressDOM(msg.id, 100, false);
  
  // Actually sync the message to cloud now that media is real
  syncChatMessage(cid, msg);
};
`;

html = html.replace(/window\.uploadChatAttachmentsWithProgress\s*=\s*async\s*function\(cid,\s*msg,\s*rawAttachments\)[\s\S]*?syncChatMessage\(cid,\s*msg\);\s*\n\s*\};\s*\n/m, replacement + '\n');
fs.writeFileSync('index.html', html);
