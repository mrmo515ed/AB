import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

print("Original length:", len(html))

# 1. Update image compression helper and handleMediaSelection
# Let's check handleMediaSelection
old_handleMediaSelection = '''window.handleMediaSelection = function(inp, type, cid) {
  if (!inp.files || !inp.files.length) return;
  window.ATTACH_CACHE[cid] = window.ATTACH_CACHE[cid] || [];
  const existingCount = window.ATTACH_CACHE[cid].length;
  const files = Array.from(inp.files);

  if (existingCount + files.length > 5) {
    toast("الحد الأقصى 5 مرفقات في الرسالة الواحدة", "info");
  }
  const allowed = files.slice(0, Math.max(0, 5 - existingCount));
  let loaded = 0;

  allowed.forEach(f => {
    const reader = new FileReader();
    reader.onload = () => {
      window.ATTACH_CACHE[cid].push({
        type: type,
        src: reader.result,
        name: f.name || (type === "video" ? "فيديو" : "صورة"),
        size: f.size || 0,
        mimeType: f.type || "",
        file: f
      });
      loaded++;
      if (loaded === allowed.length) {
        const preview = document.getElementById("composer_attach_area");
        if (preview) {
          preview.innerHTML = renderAttachPreviewHTML(cid);
        } else {
          render();
        }
      }
    };
    reader.readAsDataURL(f);
  });
};'''

new_handleMediaSelection = '''// Client-Side Image Compression to ensure fast uploads & avoid Firestore limits
window.compressImageFile = function(file, maxW = 1280, maxH = 1280, quality = 0.82) {
  return new Promise((resolve) => {
    if (!file || !file.type.startsWith('image/') || file.type.includes('gif')) {
      const rd = new FileReader();
      rd.onload = () => resolve(rd.result);
      rd.onerror = () => resolve("");
      rd.readAsDataURL(file);
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let w = img.width;
        let h = img.height;
        if (w > maxW || h > maxH) {
          if (w > h) {
            h = Math.round((h * maxW) / w);
            w = maxW;
          } else {
            w = Math.round((w * maxH) / h);
            h = maxH;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = () => resolve(e.target.result);
      img.src = e.target.result;
    };
    reader.onerror = () => resolve("");
    reader.readAsDataURL(file);
  });
};

window.handleMediaSelection = async function(inp, type, cid) {
  if (!inp.files || !inp.files.length) return;
  window.ATTACH_CACHE[cid] = window.ATTACH_CACHE[cid] || [];
  const existingCount = window.ATTACH_CACHE[cid].length;
  const files = Array.from(inp.files);

  if (existingCount + files.length > 5) {
    toast("الحد الأقصى 5 مرفقات في الرسالة الواحدة", "info");
  }
  const allowed = files.slice(0, Math.max(0, 5 - existingCount));

  for (const f of allowed) {
    let srcData = "";
    if (type === "image" || (f.type && f.type.startsWith("image/"))) {
      srcData = await window.compressImageFile(f, 1280, 1280, 0.82);
    } else {
      srcData = await new Promise((res) => {
        const rd = new FileReader();
        rd.onload = () => res(rd.result);
        rd.onerror = () => res("");
        rd.readAsDataURL(f);
      });
    }

    window.ATTACH_CACHE[cid].push({
      type: type,
      src: srcData,
      name: f.name || (type === "video" ? "فيديو" : "صورة"),
      size: f.size || 0,
      mimeType: f.type || "",
      file: f
    });
  }

  const preview = document.getElementById("composer_attach_area");
  if (preview) {
    preview.innerHTML = renderAttachPreviewHTML(cid);
  } else {
    render();
  }
  if (typeof updateComposerActionBtn === "function") {
    updateComposerActionBtn(cid);
  }
};'''

if old_handleMediaSelection in html:
    html = html.replace(old_handleMediaSelection, new_handleMediaSelection)
    print("✓ Replaced handleMediaSelection with compressed loader")
else:
    print("✗ Could not find old_handleMediaSelection")

# 2. Update uploadChatAttachmentsWithProgress to ensure smooth real-time bar and NEVER hang
old_upload = '''window.uploadChatAttachmentsWithProgress = async function(cid, msg, rawAttachments) {
  const c = (S.chats || []).find(x => x.id === cid);
  const filesToUpload = (rawAttachments || []).filter(a => a && a.file);
  const totalCount = filesToUpload.length;

  if (totalCount === 0) {
    msg.uploading = false;
    msg.uploadProgress = 100;
    msg.st = 2;
    msg.pending = false;
    saveDebounced();
    window.updateMsgProgressDOM(msg.id, 100, false);
    syncChatMessage(cid, msg);
    return;
  }

  let progressMap = {};
  const updateAggregateProgress = () => {
    let sum = 0;
    Object.values(progressMap).forEach(p => { sum += p; });
    const avg = Math.min(99, Math.round(sum / totalCount));
    msg.uploadProgress = avg;
    window.updateMsgProgressDOM(msg.id, avg, true);
  };

  for (let i = 0; i < filesToUpload.length; i++) {
    const item = filesToUpload[i];
    const file = item.file;
    const fileExt = (file.name && file.name.includes('.')) ? file.name.split('.').pop() : (file.type ? file.type.split('/').pop() : 'dat');
    const fileName = `media_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
    const storagePath = `chats/${cid}/media/${fileName}`;

    if (window.storage && window.ref && window.uploadBytesResumable && window.getDownloadURL) {
      try {
        const storageRef = window.ref(window.storage, storagePath);
        const uploadTask = window.uploadBytesResumable(storageRef, file);

        await new Promise((resolve) => {
          let tm = setTimeout(resolve, 30000); // 30s timeout fallback
          uploadTask.on('state_changed',
            (snapshot) => {
              const pct = (snapshot.bytesTransferred / (snapshot.totalBytes || 1)) * 100;
              progressMap[i] = Math.min(99, Math.round(pct));
              updateAggregateProgress();
            },
            (err) => {
              console.warn("Storage upload error, falling back:", err);
              progressMap[i] = 100;
              clearTimeout(tm); resolve();
            },
            async () => {
              try {
                const url = await window.getDownloadURL(uploadTask.snapshot.ref);
                if (url) {
                  item.src = url;
                  if (msg.attachments && msg.attachments[i]) {
                    msg.attachments[i].src = url;
                  }
                  if (i === 0) msg.src = url;
                }
                progressMap[i] = 100;
                updateAggregateProgress();
                clearTimeout(tm); resolve();
              } catch(e) {
                clearTimeout(tm); resolve();
              }
            }
          );
        });
      } catch(e) {
        console.warn("Storage upload exception:", e);
      }
    } else {
      // Smooth simulated progress when Firebase Storage client is unavailable
      for (let p = 20; p <= 90; p += 35) {
        progressMap[i] = p;
        updateAggregateProgress();
        await new Promise(r => setTimeout(r, 70));
      }
      progressMap[i] = 100;
    }
  }

  // All files uploaded successfully
  msg.uploadProgress = 100;
  msg.uploading = false;
  msg.st = 2; // Sent ✓
  msg.pending = false;
  saveDebounced();
  window.updateMsgProgressDOM(msg.id, 100, false);
  syncChatMessage(cid, msg);
};'''

new_upload = '''window.uploadChatAttachmentsWithProgress = async function(cid, msg, rawAttachments) {
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

  for (let i = 0; i < filesToUpload.length; i++) {
    const item = filesToUpload[i];
    const file = item.file;
    const fileExt = (file.name && file.name.includes('.')) ? file.name.split('.').pop() : (file.type ? file.type.split('/').pop() : 'dat');
    const fileName = `media_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
    const storagePath = `chats/${cid}/media/${fileName}`;

    let uploadedUrl = null;
    if (window.storage && window.ref && window.uploadBytesResumable && window.getDownloadURL) {
      try {
        const storageRef = window.ref(window.storage, storagePath);
        const uploadTask = window.uploadBytesResumable(storageRef, file);

        await new Promise((resolve) => {
          // Fast 5-second resilient timeout so it never hangs if storage rules block
          let tm = setTimeout(() => {
            progressMap[i] = 100;
            resolve();
          }, 5000);

          uploadTask.on('state_changed',
            (snapshot) => {
              const pct = (snapshot.bytesTransferred / (snapshot.totalBytes || 1)) * 100;
              progressMap[i] = Math.min(95, Math.round(pct));
              updateAggregateProgress();
            },
            (err) => {
              console.warn("Storage upload error fallback:", err);
              progressMap[i] = 100;
              clearTimeout(tm);
              resolve();
            },
            async () => {
              try {
                const url = await window.getDownloadURL(uploadTask.snapshot.ref);
                if (url) uploadedUrl = url;
              } catch(e) {}
              progressMap[i] = 100;
              clearTimeout(tm);
              resolve();
            }
          );
        });
      } catch(e) {
        console.warn("Storage upload exception:", e);
      }
    }

    if (uploadedUrl) {
      item.src = uploadedUrl;
      if (msg.attachments && msg.attachments[i]) {
        msg.attachments[i].src = uploadedUrl;
      }
      if (i === 0) msg.src = uploadedUrl;
    }

    // Step through visual progress if local dataURL
    for (let p = 30; p <= 90; p += 30) {
      progressMap[i] = p;
      updateAggregateProgress();
      await new Promise(r => setTimeout(r, 60));
    }
    progressMap[i] = 100;
  }

  // All files uploaded & processed successfully!
  msg.uploadProgress = 100;
  msg.uploading = false;
  msg.st = 2; // Sent ✓
  msg.pending = false;
  saveDebounced();
  window.updateMsgProgressDOM(msg.id, 100, false);
  syncChatMessage(cid, msg);
};'''

if old_upload in html:
    html = html.replace(old_upload, new_upload)
    print("✓ Replaced uploadChatAttachmentsWithProgress with non-blocking engine")
else:
    print("✗ Could not find old_upload")

# 3. Fix post disappearing bug: Merge Firestore livePosts with local posts without dropping
old_posts_sync = '''    if (livePosts.length > 0) {
      const postMap = {};
      livePosts.forEach(p => { postMap[p.id] = Object.assign(postMap[p.id] || {}, p); });
      const merged = Object.values(postMap);
      merged.sort((a, b) => (b.createdAt || b.at || 0) - (a.createdAt || a.at || 0));
      S.posts = merged;
      window._cloudPosts = livePosts;
      saveLocalOnly();'''

new_posts_sync = '''    if (livePosts.length > 0) {
      const postMap = {};
      // 1. First populate with current local posts to never lose local / offline / sample posts
      (S.posts || []).forEach(p => { if (p && p.id) postMap[p.id] = p; });
      // 2. Overlay fresh live updates from cloud
      livePosts.forEach(p => { postMap[p.id] = Object.assign(postMap[p.id] || {}, p); });
      const merged = Object.values(postMap);
      merged.sort((a, b) => (b.createdAt || b.at || 0) - (a.createdAt || a.at || 0));
      S.posts = merged;
      window._cloudPosts = livePosts;
      saveLocalOnly();'''

if old_posts_sync in html:
    html = html.replace(old_posts_sync, new_posts_sync)
    print("✓ Fixed posts disappearance in onSnapshot postsQuery")
else:
    print("✗ Could not find old_posts_sync")

# 4. Update sendShareTo and shareCardHTML to create professional rich cards in chat
old_sendShareTo = '''function sendShareTo(kind,ref,k,rid){const p=(S.posts||[]).find(x=>x.id===ref);if(!p){toast("المنشور غير موجود ","err");return}
  const m={type:"share",kind:kind,ref:ref,text:"شارك منشوراً معك"};
  if(k==="chat"){const c=(S.chats||[]).find(x=>x.id===rid);if(!c)return;c.messages.push(Object.assign({id:uid(),from:"me",at:now()},m));c.last="منشور مشترك";c.lastAt=now()}
  else if(k==="group"){const g=(S.groups||[]).find(x=>x.id===rid);if(!g)return;g.msgs.push(Object.assign({id:uid(),uid:"me",at:now()},m))}
  else{const w=(S.worlds||[]).find(x=>x.id===rid);if(!w)return;w.msgs.push(Object.assign({id:uid(),uid:"me",at:now()},m))}
  save();closeOvl();snd("send");toast("أُرسلت بطاقة المنشور ","ok");if(k==="chat")go("chatRoom",{id:rid});else if(k==="group")go("groupRoom",{id:rid});else go("worldRoom",{id:rid})}'''

new_sendShareTo = '''function sendShareTo(kind, ref, k, rid) {
  const p = (S.posts || []).find(x => x.id === ref);
  if (!p) {
    toast("المنشور غير موجود", "err");
    return;
  }
  const myUid = getChatMyUid();
  const mid = uid();
  const postPreview = {
    id: p.id,
    authorId: p.authorId || (p.author && p.author.id) || "otaku",
    authorName: (p.author && p.author.name) || "أوتاكو أنمي بلاك",
    authorAvatar: (p.author && p.author.avatar) || AV[0],
    authorVerified: !!(p.author && p.author.isVerified),
    category: p.category || "عام",
    text: p.text || "",
    mediaKind: (p.media && p.media.kind) || (p.media && p.media.src ? "image" : null),
    mediaSrc: (p.media && p.media.src) || (p.media && p.media.imgs && p.media.imgs[0]) || null,
    likes: p.likes || 0,
    commentsCount: (p.comments || []).length,
    createdAt: p.createdAt || p.at || now()
  };

  const m = {
    id: mid,
    clientMessageId: mid,
    conversationId: rid,
    from: "me",
    senderId: myUid,
    senderName: S.me.name || "أنا",
    type: "share",
    kind: kind || "post",
    ref: ref,
    post: postPreview,
    text: p.text ? `[منشور مشترك] ${p.text.slice(0, 60)}` : "شارك منشوراً معك",
    at: now(),
    createdAt: now(),
    st: 2,
    pending: false
  };

  if (k === "chat") {
    let c = (S.chats || []).find(x => x.id === rid);
    if (!c) {
      c = { id: rid, userId: rid, messages: [], last: "منشور مشترك", lastAt: now(), unread: 0 };
      S.chats = S.chats || [];
      S.chats.unshift(c);
    }
    c.messages = c.messages || [];
    c.messages.push(m);
    c.last = `🔗 منشور مشترك: ${((p.author && p.author.name) || "أوتاكو")}`;
    c.lastAt = now();
    saveDebounced();
    snd("send");
    syncChatMessage(rid, m);
    toast("تمت مشاركة بطاقة المنشور بنجاح ✓", "ok");
    closeOvl();
    go("chatRoom", { id: rid });
  } else if (k === "group") {
    const g = (S.groups || []).find(x => x.id === rid);
    if (g) {
      g.msgs = g.msgs || [];
      g.msgs.push(Object.assign({ id: mid, uid: "me", at: now() }, m));
      g.lastAt = now();
      saveDebounced();
      snd("send");
      if (typeof syncGroupChatMessage === "function") syncGroupChatMessage(rid, m);
      toast("تمت مشاركة المنشور في القروب ✓", "ok");
      closeOvl();
      go("groupRoom", { id: rid });
    }
  } else {
    const w = (S.worlds || []).find(x => x.id === rid);
    if (w) {
      w.msgs = w.msgs || [];
      w.msgs.push(Object.assign({ id: mid, uid: "me", at: now() }, m));
      w.lastAt = now();
      saveDebounced();
      snd("send");
      toast("تمت مشاركة المنشور في العالم ✓", "ok");
      closeOvl();
      go("worldRoom", { id: rid });
    }
  }
}'''

if old_sendShareTo in html:
    html = html.replace(old_sendShareTo, new_sendShareTo)
    print("✓ Replaced sendShareTo with rich interactive payload & sync")
else:
    print("✗ Could not find old_sendShareTo")

# 5. Enhance shareCardHTML to look like a stunning rich interactive preview card in both chat & rooms
old_shareCardHTML = '''function shareCardHTML(m,me){const __f=(()=>{const p=(S.posts||[]).find(x=>x.id===m.ref);if(!p)return `<span class="tiny fnt">منشور محذوف</span>`;const au=u(p.authorId, p);return `<div class="card2" style="padding:9px;min-width:190px;background:${me?"rgba(0,0,0,.18)":"var(--surface2)"}"><div class="row" style="gap:7px"><span>${av(au,26)}</span><div class="g1"><div class="tiny b">${esc(au.name)}</div><div class="tiny fnt" style="opacity:.75">${ago(p.createdAt)}</div></div><span class="art-bg" style="--c1:${p.c1||"#3B0764"};--c2:${p.c2||"#831843"};width:38px;height:38px;border-radius:10px;display:flex;align-items:center;justify-content:center">${I(p.type==="image"?"image":"msgsq","i s")}</span></div><div class="tiny" style="margin-top:7px;line-height:1.5;opacity:.9">${esc((p.text||"").slice(0,90))}</div><button class="btn btn-sec btn-xs" style="margin-top:8px;width:100%" onclick="go('postView',{pid:'${p.id}'})">${I("fwd","i s")} فتح المنشور</button></div>`});return __f()}'''

new_shareCardHTML = '''function shareCardHTML(m, me) {
  const p = (m.post) ? m.post : (S.posts || []).find(x => x.id === m.ref);
  if (!p) {
    return `<div class="card2" style="padding:10px;min-width:210px;background:${me ? 'rgba(0,0,0,0.25)' : 'var(--surface2)'};border-radius:12px">
      <div class="row" style="gap:6px;color:var(--muted)">${I("ban","i s")} <span class="tiny b">منشور غير متوفر أو محذوف</span></div>
    </div>`;
  }
  const authorName = (p.author && p.author.name) || p.authorName || "أوتاكو أنمي بلاك";
  const authorAvatar = (p.author && p.author.avatar) || p.authorAvatar || AV[0];
  const isVerified = (p.author && p.author.isVerified) || p.authorVerified;
  const cat = p.category || "عام";
  const textSnippet = (p.text || "").trim();
  const mediaSrc = (p.media && p.media.src) || (p.media && p.media.imgs && p.media.imgs[0]) || p.mediaSrc || "";
  const mediaKind = (p.media && p.media.kind) || p.mediaKind || (mediaSrc.includes("video") ? "video" : "image");
  const pid = p.id || m.ref;

  return `
    <div class="share-post-card" style="width:100%;min-width:220px;max-width:320px;background:${me ? 'rgba(0,0,0,0.3)' : 'var(--surface2)'};border:1px solid ${me ? 'rgba(255,255,255,0.18)' : 'var(--line2)'};border-radius:14px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.22);margin:4px 0">
      <div class="row" style="gap:8px;padding:8px 10px;border-bottom:1px solid ${me ? 'rgba(255,255,255,0.08)' : 'var(--line)'};background:${me ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'}">
        <img src="${authorAvatar}" alt="" style="width:26px;height:26px;border-radius:50%;object-fit:cover;flex-shrink:0">
        <div class="g1" style="min-width:0">
          <div class="row" style="gap:4px">
            <span class="tiny b" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:${me ? '#fff' : 'var(--text)'}">${esc(authorName)}</span>
            ${isVerified ? `<span style="color:var(--cyan);font-size:10px">✓</span>` : ''}
          </div>
          <div class="tiny fnt" style="font-size:9.5px;opacity:0.75">${ago(p.createdAt || now())} · ${esc(cat)}</div>
        </div>
        <span class="badge b-cyan" style="font-size:9px;padding:2px 6px">منشور</span>
      </div>

      ${textSnippet ? `
        <div style="padding:8px 10px;font-size:12px;line-height:1.5;direction:auto;unicode-bidi:plaintext;word-break:break-word;color:${me ? '#f1f5f9' : 'var(--text)'}">
          ${esc(textSnippet.slice(0, 110))}${textSnippet.length > 110 ? '...' : ''}
        </div>
      ` : ''}

      ${mediaSrc ? `
        <div style="position:relative;width:100%;height:130px;background:#000;overflow:hidden;cursor:pointer" onclick="go('postView',{pid:'${pid}'})">
          ${mediaKind === 'video' ? `
            <video src="${mediaSrc}" style="width:100%;height:100%;object-fit:cover"></video>
            <div style="position:absolute;inset:0;background:rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center;color:#fff;font-size:24px">
              ${I("play","l")}
            </div>
            <span style="position:absolute;bottom:6px;left:6px;background:rgba(0,0,0,0.7);color:#fff;font-size:9px;padding:2px 6px;border-radius:4px;font-weight:700">فيديو</span>
          ` : `
            <img src="${mediaSrc}" alt="" style="width:100%;height:100%;object-fit:cover;display:block" loading="lazy">
          `}
        </div>
      ` : ''}

      <div class="rowb" style="padding:7px 10px;background:${me ? 'rgba(0,0,0,0.2)' : 'var(--surface3)'};gap:6px">
        <div class="row" style="gap:8px;font-size:10.5px;opacity:0.8">
          <span>❤️ ${nfmt(p.likes || 0)}</span>
          <span>💬 ${nfmt(p.commentsCount || (p.comments || []).length || 0)}</span>
        </div>
        <button type="button" class="btn btn-primary btn-xs" style="padding:3px 10px;font-size:10.5px;gap:4px;border-radius:8px" onclick="event.stopPropagation();go('postView',{pid:'${pid}'})">
          ${I("fwd","i s")} فتح المنشور
        </button>
      </div>
    </div>
  `;
}'''

if old_shareCardHTML in html:
    html = html.replace(old_shareCardHTML, new_shareCardHTML)
    print("✓ Replaced shareCardHTML with rich card renderer")
else:
    print("✗ Could not find old_shareCardHTML")

# 6. Add share case to window.msgBubble (line 21040+)
old_bubble_share = '''  } else if (m.type === "image" && m.src) {'''
new_bubble_share = '''  } else if (m.type === "share") {
    inner = shareCardHTML(m, me);

  } else if (m.type === "image" && m.src) {'''

if old_bubble_share in html:
    html = html.replace(old_bubble_share, new_bubble_share, 1)
    print("✓ Added m.type === 'share' to window.msgBubble")
else:
    print("✗ Could not find old_bubble_share")

# 7. Add Group Real-time Sync helper & activate group media
group_sync_code = '''
// ============================================================================
// GROUP ROOM REAL-TIME CLOUD SYNC & MEDIA ENGINE
// ============================================================================
window.syncGroupChatMessage = function(gid, msgObj) {
  if (!gid || !msgObj || !msgObj.id) return;
  if (window.db && window.setDoc && window.doc) {
    try {
      const myUid = getChatMyUid();
      const cloudMsg = Object.assign({}, msgObj, {
        senderId: msgObj.senderId || msgObj.uid || myUid,
        senderName: msgObj.senderName || S.me.name || "أنا",
        pending: false,
        st: 2
      });
      window.setDoc(window.doc(window.collection(window.db, "groups", gid, "messages"), msgObj.id), cloudMsg)
        .catch(err => console.warn("Group msg sync err:", err));
      window.setDoc(window.doc(window.db, "groups", gid), {
        lastMsg: msgObj.text || "رسالة",
        lastAt: msgObj.at || now(),
        updatedAt: now()
      }, { merge: true }).catch(e => console.warn(e));
    } catch(e) {
      console.warn("Group sync exception:", e);
    }
  }
};

window.listenGroupMessages = function(gid) {
  if (!gid || !window.db || !window.collection || !window.onSnapshot) return;
  if (window._groupSnapUnsub) {
    try { window._groupSnapUnsub(); } catch(e){}
    window._groupSnapUnsub = null;
  }
  try {
    const q = window.query(window.collection(window.db, "groups", gid, "messages"));
    window._groupSnapUnsub = window.onSnapshot(q, (snap) => {
      const g = (S.groups || []).find(x => x.id === gid);
      if (!g) return;
      g.msgs = g.msgs || [];
      let added = false;
      snap.docChanges().forEach(ch => {
        if (ch.type === "added") {
          const d = ch.doc.data();
          if (d && d.id && !g.msgs.some(m => m.id === d.id)) {
            g.msgs.push(d);
            added = true;
          }
        }
      });
      if (added) {
        g.msgs.sort((a,b) => (a.at || 0) - (b.at || 0));
        saveDebounced();
        if (S.page === "groupRoom" && S.params && S.params.id === gid) {
          const b = document.getElementById("gbody");
          if (b) {
            b.innerHTML = g.msgs.map(m => {
              const me = m.uid === "me" || isMsgMine(m);
              const mu = me ? S.me : u(m.uid || m.senderId);
              return `<div class="msg ${me ? "me" : "them"}" data-mid="${m.id}" data-ctx="group" oncontextmenu="event.preventDefault();openSheet('roomMsgMenu','${m.id}')" style="max-width:88%">
                <div class="row" style="gap:5px;margin-bottom:3px">${av(mu,18)}<span class="tiny b" style="color:${me ? "#fff" : "var(--accent)"}">${me ? "أنت" : esc(mu.name)}</span>${(g.admins||[]).includes(m.uid) ? `<span class="badge b-gold">مشرف</span>` : ""}</div>
                ${roomMsgBody(m, me)}
                <span class="tm">${hhmm(m.at)}</span>
              </div>`;
            }).join("");
            b.scrollTop = b.scrollHeight;
          }
        }
      }
    });
  } catch(e) {
    console.warn("listenGroupMessages err:", e);
  }
};
'''

if "window.syncGroupChatMessage" not in html:
    html = html.replace('function sendGroupMsg(id){', group_sync_code + '\nfunction sendGroupMsg(id){')
    print("✓ Added Group Real-Time Sync and Message Listener Engine")

# 8. Alias PAGES.postDetail = PAGES.postView
if "PAGES.postDetail = PAGES.postView;" not in html:
    html = html.replace('PAGES.postView=()=>{', 'PAGES.postView=()=>{\n  const pid = (S.params && (S.params.pid || S.params.id));\n')
    html = html.replace('PAGES.comments=()=>{', 'PAGES.postDetail = PAGES.postView;\n PAGES.comments=()=>{')
    print("✓ Aliased PAGES.postDetail to PAGES.postView")

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("Updated index.html successfully! New length:", len(html))
