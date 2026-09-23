const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const replacement = `
    const finish = async (blob) => {
      const mid = uid();
      const myUid = getMyUid();
      const mObj = { id: mid, from: "me", senderId: myUid, senderName: S.me.name || "أنا", text: " رسالة صوتية (0:" + String(dur).padStart(2,"0") + ")", type: "voice", at: now(), src: "", dur: dur || 0, st: 1, pending: true, uploading: true, uploadProgress: 0 };
      c.messages.push(mObj);
      c.last = " رسالة صوتية"; c.lastAt = now(); save(); snd("send"); render();
      
      if (!blob) {
         mObj.st = 4; mObj.uploading = false; save(); render(); toast('فشل تسجيل الصوت', 'err'); return;
      }
      
      try {
        const fileExt = "webm";
        const fileName = \`voice_\${Date.now()}_\${Math.random().toString(36).substring(2, 7)}.\${fileExt}\`;
        const storagePath = \`chats/\${cid}/media/\${fileName}\`;
        const storageRef = window.ref(window.storage, storagePath);
        const uploadTask = window.uploadBytesResumable(storageRef, blob);
        
        await new Promise((resolve, reject) => {
          uploadTask.on('state_changed', 
            (snapshot) => {
              mObj.uploadProgress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
              window.updateMsgProgressDOM(mid, mObj.uploadProgress, true);
            },
            (err) => reject(err),
            async () => {
              try {
                mObj.src = await window.getDownloadURL(uploadTask.snapshot.ref);
                resolve();
              } catch(e) { reject(e); }
            }
          );
        });
        
        mObj.st = 2;
        mObj.uploading = false;
        mObj.pending = false;
        save();
        render();
        toast("أُرسلت الرسالة الصوتية بنجاح", "ok");
        syncChatMessage(cid, mObj);
      } catch (err) {
        console.error("Voice upload error", err);
        mObj.st = 4;
        mObj.uploading = false;
        save();
        render();
        toast("خطأ في رفع الصوت", "err");
      }
    };
    if (mediaRec && mediaRec.state === "recording") {
      mediaRec.onstop = () => {
        try {
          const bl = new Blob(recChunks, { type: (recChunks[0] && recChunks[0].type) || "audio/webm" });
          finish(bl);
        } catch(e) { finish(null); }
        try { recStream.getTracks().forEach(t => t.stop()) } catch(e) {}
        mediaRec = null; recChunks = []; recStream = null;
      };
      mediaRec.stop();
    } else {
      finish(null);
    }
    return;
  }
`;

html = html.replace(/const finish=\(src\)=>\{[\s\S]*?finish\(""\);\n\s*return\}/, replacement);
fs.writeFileSync('index.html', html);
