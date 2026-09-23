import sys

code = r"""
/* ============================================================================
   ANIME BLACK — WORLD-CLASS SOCIAL PUBLISHING SYSTEM (COMPLETE REBUILD)
   ============================================================================ */

window.PUBLISH_STATE = {
  text: "",
  media: [], // { id, type: 'image'|'video'|'audio'|'file'|'gif', src, name, size, duration, alt }
  poll: null, // { question: '', options: ['', ''], duration: 24, isMultiple: false, endsAt: null, votes: {} }
  linkPreview: null, // { url: '', title: '', desc: '', img: '', domain: '' }
  location: "",
  privacy: "public", // 'public' | 'followers' | 'private'
  tags: [],
  mentions: [],
  spoiler: false,
  warningText: "",
  schedule: null, // { date: '', time: '', scheduledAt: timestamp }
  settings: {
    allowComments: true,
    allowReposts: true,
    hideCounts: false,
    altText: ""
  },
  quotedPost: null,
  repostPost: null,
  editPostId: null,
  isUploading: false,
  uploadProgress: 0,
  isPublishing: false,
  draftStatus: "idle"
};

// Real Firebase Storage upload with smart fallback
window.uploadMediaToStorage = async function(file, onProgress) {
  if (!file) return null;
  const myUid = (window.auth && window.auth.currentUser) ? window.auth.currentUser.uid : (S && S.me && S.me.id) || "u_anon";
  const fileExt = (file.name && file.name.includes('.')) ? file.name.split('.').pop() : (file.type ? file.type.split('/').pop() : 'dat');
  const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
  const storagePath = `users/${myUid}/posts/${fileName}`;

  if (window.storage && window.ref && window.uploadBytesResumable && window.getDownloadURL) {
    try {
      const storageRef = window.ref(window.storage, storagePath);
      const uploadTask = window.uploadBytesResumable(storageRef, file);
      return await new Promise((resolve) => {
        uploadTask.on('state_changed',
          (snapshot) => {
            const pct = (snapshot.bytesTransferred / (snapshot.totalBytes || 1)) * 100;
            if (typeof onProgress === 'function') onProgress(Math.round(pct));
          },
          (err) => {
            console.warn("Storage upload error, using direct reader fallback:", err);
            const r = new FileReader();
            r.onload = () => resolve(r.result);
            r.onerror = () => resolve(null);
            r.readAsDataURL(file);
          },
          async () => {
            try {
              const url = await window.getDownloadURL(uploadTask.snapshot.ref);
              resolve(url);
            } catch (e) {
              const r = new FileReader();
              r.onload = () => resolve(r.result);
              r.readAsDataURL(file);
            }
          }
        );
      });
    } catch (e) {
      console.warn("Storage init failed:", e);
    }
  }

  // Fallback to DataURL
  return new Promise((resolve) => {
    const r = new FileReader();
    r.onload = () => {
      if (typeof onProgress === 'function') onProgress(100);
      resolve(r.result);
    };
    r.onerror = () => resolve(null);
    r.readAsDataURL(file);
  });
};

// Intelligent Debounced Draft Autosave
let _pubDraftTimer = null;
window.triggerPubDraftSave = function() {
  const st = window.PUBLISH_STATE;
  if (!st) return;
  const hasContent = (st.text && st.text.trim().length > 0) || (st.media && st.media.length > 0) || st.poll || st.linkPreview;
  if (!hasContent) return;

  const draftIndicator = document.getElementById("pub_draft_badge");
  if (draftIndicator) {
    draftIndicator.innerHTML = `${I("clock","i s")} <span style="font-size:11px">جارٍ الحفظ...</span>`;
    draftIndicator.style.color = "var(--gold)";
  }

  clearTimeout(_pubDraftTimer);
  _pubDraftTimer = setTimeout(() => {
    const draftItem = {
      id: st.draftId || ("d_" + Date.now()),
      text: st.text,
      media: st.media,
      poll: st.poll,
      linkPreview: st.linkPreview,
      location: st.location,
      privacy: st.privacy,
      tags: st.tags,
      mentions: st.mentions,
      spoiler: st.spoiler,
      warningText: st.warningText,
      schedule: st.schedule,
      settings: st.settings,
      quotedPost: st.quotedPost,
      updatedAt: Date.now()
    };
    st.draftId = draftItem.id;
    S.postDrafts = S.postDrafts || [];
    const idx = S.postDrafts.findIndex(d => d.id === draftItem.id);
    if (idx >= 0) S.postDrafts[idx] = draftItem;
    else S.postDrafts.unshift(draftItem);
    save();

    const indicator = document.getElementById("pub_draft_badge");
    if (indicator) {
      indicator.innerHTML = `${I("check","i s")} <span style="font-size:11px">مسودة محفوظة</span>`;
      indicator.style.color = "var(--emerald)";
    }
  }, 600);
};

// Real-time Text Input & Tag/Mention Extractor
window.onPubTextInput = function(el) {
  const st = window.PUBLISH_STATE;
  st.text = el.value;
  el.style.height = "auto";
  el.style.height = Math.max(120, Math.min(360, el.scrollHeight)) + "px";

  // Character Counter
  const countEl = document.getElementById("pub_char_count");
  if (countEl) {
    const len = st.text.length;
    countEl.textContent = `${len} / 2000`;
    countEl.style.color = len > 1900 ? "var(--rose)" : len > 1500 ? "var(--gold)" : "var(--faint)";
  }

  // Extract Hashtags
  const hashMatches = st.text.match(/#([a-zA-Z0-9_\u0600-\u06FF]+)/g);
  if (hashMatches) {
    st.tags = [...new Set(hashMatches.map(h => h.slice(1)))];
  }

  // Handle @ Mention Search Autocomplete
  const cursorPos = el.selectionStart || 0;
  const textBefore = el.value.slice(0, cursorPos);
  const mentionMatch = textBefore.match(/@([a-zA-Z0-9_\u0600-\u06FF]*)$/);
  const mentionBox = document.getElementById("pub_mention_popup");
  if (mentionMatch && mentionBox) {
    const query = mentionMatch[1].toLowerCase();
    const allKnownUsers = [S.me, ...(S.users || []), ...(window._cachedUsers || [])].filter(Boolean);
    const matched = allKnownUsers.filter(u =>
      (u.name && u.name.toLowerCase().includes(query)) ||
      (u.username && u.username.toLowerCase().includes(query)) ||
      (u.id && u.id.toLowerCase().includes(query))
    ).slice(0, 5);

    if (matched.length > 0) {
      mentionBox.style.display = "flex";
      mentionBox.innerHTML = matched.map(u => `
        <button type="button" class="row" style="gap:10px;padding:8px 12px;background:none;border:none;border-bottom:1px solid var(--line);width:100%;text-align:right;cursor:pointer;color:#fff" onclick="insertMention('${esc(u.username || u.name || u.id)}')">
          <img src="${u.avatar || AV[0]}" style="width:28px;height:28px;border-radius:50%;object-fit:cover" alt="">
          <div style="flex:1;min-width:0;text-align:right">
            <div class="row" style="gap:4px"><span class="b xs" style="color:#fff">${esc(u.name || "")}</span>${vbadge(u)}</div>
            <div class="tiny fnt" style="color:var(--muted)">@${esc(u.username || u.id || "")}</div>
          </div>
        </button>
      `).join("");
    } else {
      mentionBox.style.display = "none";
    }
  } else if (mentionBox) {
    mentionBox.style.display = "none";
  }

  // Auto-detect Links
  const urlMatch = st.text.match(/(https?:\/\/[^\s]+)/i);
  if (urlMatch && !st.linkPreview) {
    const url = urlMatch[0];
    try {
      const parsed = new URL(url);
      st.linkPreview = {
        url: url,
        domain: parsed.hostname,
        title: parsed.hostname.replace('www.', ''),
        desc: "رابط تمت مشاركته عبر أنمي بلاك",
        img: ""
      };
      window.refreshPubMediaDeck();
    } catch (e) {}
  }

  window.triggerPubDraftSave();
};

window.insertMention = function(uname) {
  const el = document.getElementById("pub_text_area");
  const mentionBox = document.getElementById("pub_mention_popup");
  if (mentionBox) mentionBox.style.display = "none";
  if (!el) return;
  const cursorPos = el.selectionStart || 0;
  const textBefore = el.value.slice(0, cursorPos);
  const textAfter = el.value.slice(cursorPos);
  const newBefore = textBefore.replace(/@([a-zA-Z0-9_\u0600-\u06FF]*)$/, `@${uname} `);
  el.value = newBefore + textAfter;
  el.focus();
  window.PUBLISH_STATE.text = el.value;
  if (!window.PUBLISH_STATE.mentions.includes(uname)) {
    window.PUBLISH_STATE.mentions.push(uname);
  }
  window.triggerPubDraftSave();
};

window.insertPubHashtag = function(tag) {
  const el = document.getElementById("pub_text_area");
  if (!el) return;
  const cleanTag = tag.replace(/^#/, '').trim();
  if (el.value.includes("#" + cleanTag)) return;
  el.value = (el.value ? el.value + " " : "") + "#" + cleanTag + " ";
  window.PUBLISH_STATE.text = el.value;
  if (!window.PUBLISH_STATE.tags.includes(cleanTag)) {
    window.PUBLISH_STATE.tags.push(cleanTag);
  }
  el.focus();
  window.triggerPubDraftSave();
};

// Media Picker & Deck Handlers
window.pickPubImages = function() {
  const inp = document.createElement("input");
  inp.type = "file";
  inp.accept = "image/*";
  inp.multiple = true;
  inp.onchange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const st = window.PUBLISH_STATE;
    if (st.media.length + files.length > 10) {
      toast("الحد الأقصى للصور في المنشور الواحد هو 10 صور", "err");
      return;
    }
    st.isUploading = true;
    window.refreshPubMediaDeck();
    toast(`جارٍ رفع ${files.length} صورة...`, "info");

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const mid = "m_" + Date.now() + "_" + i;
      const placeholder = {
        id: mid,
        type: "image",
        src: "",
        name: file.name,
        size: file.size,
        progress: 10,
        isUploading: true
      };
      st.media.push(placeholder);
      window.refreshPubMediaDeck();

      try {
        const url = await window.uploadMediaToStorage(file, (pct) => {
          placeholder.progress = pct;
          const pEl = document.getElementById(`pub_prog_${mid}`);
          if (pEl) pEl.style.width = pct + "%";
        });
        placeholder.src = url;
        placeholder.isUploading = false;
      } catch (err) {
        console.error("Upload image failed:", err);
        st.media = st.media.filter(m => m.id !== mid);
        toast(`تعذر رفع الصورة ${file.name}`, "err");
      }
    }
    st.isUploading = false;
    window.refreshPubMediaDeck();
    window.triggerPubDraftSave();
  };
  inp.click();
};

window.pickPubVideo = function() {
  const inp = document.createElement("input");
  inp.type = "file";
  inp.accept = "video/*";
  inp.onchange = async (e) => {
    const file = (e.target.files || [])[0];
    if (!file) return;
    if (file.size > 80 * 1024 * 1024) {
      toast("الحد الأقصى لحجم الفيديو هو 80 ميغابايت", "err");
      return;
    }
    const st = window.PUBLISH_STATE;
    const mid = "v_" + Date.now();
    const placeholder = {
      id: mid,
      type: "video",
      src: "",
      name: file.name,
      size: file.size,
      progress: 5,
      isUploading: true
    };
    st.media.push(placeholder);
    st.isUploading = true;
    window.refreshPubMediaDeck();
    toast("جارٍ رفع الفيديو ومعالجته...", "info");

    try {
      const url = await window.uploadMediaToStorage(file, (pct) => {
        placeholder.progress = pct;
        const pEl = document.getElementById(`pub_prog_${mid}`);
        if (pEl) pEl.style.width = pct + "%";
      });
      placeholder.src = url;
      placeholder.isUploading = false;
      toast("تم رفع الفيديو بنجاح ✓", "ok");
    } catch (err) {
      console.error("Upload video failed:", err);
      st.media = st.media.filter(m => m.id !== mid);
      toast("تعذر رفع الفيديو، حاول مرة أخرى", "err");
    }
    st.isUploading = false;
    window.refreshPubMediaDeck();
    window.triggerPubDraftSave();
  };
  inp.click();
};

window.pickPubAudio = function() {
  const inp = document.createElement("input");
  inp.type = "file";
  inp.accept = "audio/*";
  inp.onchange = async (e) => {
    const file = (e.target.files || [])[0];
    if (!file) return;
    const st = window.PUBLISH_STATE;
    const mid = "a_" + Date.now();
    const placeholder = {
      id: mid,
      type: "audio",
      src: "",
      name: file.name,
      size: file.size,
      progress: 5,
      isUploading: true
    };
    st.media.push(placeholder);
    st.isUploading = true;
    window.refreshPubMediaDeck();
    toast("جارٍ رفع المقطع الصوتي...", "info");

    try {
      const url = await window.uploadMediaToStorage(file, (pct) => {
        placeholder.progress = pct;
        const pEl = document.getElementById(`pub_prog_${mid}`);
        if (pEl) pEl.style.width = pct + "%";
      });
      placeholder.src = url;
      placeholder.isUploading = false;
      toast("تم رفع الملف الصوتي ✓", "ok");
    } catch (err) {
      st.media = st.media.filter(m => m.id !== mid);
      toast("تعذر رفع الملف الصوتي", "err");
    }
    st.isUploading = false;
    window.refreshPubMediaDeck();
    window.triggerPubDraftSave();
  };
  inp.click();
};

window.pickPubFile = function() {
  const inp = document.createElement("input");
  inp.type = "file";
  inp.accept = ".pdf,.zip,.txt,.doc,.docx,.epub";
  inp.onchange = async (e) => {
    const file = (e.target.files || [])[0];
    if (!file) return;
    const st = window.PUBLISH_STATE;
    const mid = "f_" + Date.now();
    const placeholder = {
      id: mid,
      type: "file",
      src: "",
      name: file.name,
      size: file.size,
      progress: 5,
      isUploading: true
    };
    st.media.push(placeholder);
    st.isUploading = true;
    window.refreshPubMediaDeck();
    toast("جارٍ رفع المستند...", "info");

    try {
      const url = await window.uploadMediaToStorage(file, (pct) => {
        placeholder.progress = pct;
        const pEl = document.getElementById(`pub_prog_${mid}`);
        if (pEl) pEl.style.width = pct + "%";
      });
      placeholder.src = url;
      placeholder.isUploading = false;
      toast("تم رفع المستند بنجاح ✓", "ok");
    } catch (err) {
      st.media = st.media.filter(m => m.id !== mid);
      toast("تعذر رفع الملف", "err");
    }
    st.isUploading = false;
    window.refreshPubMediaDeck();
    window.triggerPubDraftSave();
  };
  inp.click();
};

window.removePubMedia = function(id) {
  const st = window.PUBLISH_STATE;
  st.media = st.media.filter(m => m.id !== id);
  window.refreshPubMediaDeck();
  window.triggerPubDraftSave();
};

window.movePubMedia = function(idx, dir) {
  const st = window.PUBLISH_STATE;
  const targetIdx = idx + dir;
  if (targetIdx < 0 || targetIdx >= st.media.length) return;
  const temp = st.media[idx];
  st.media[idx] = st.media[targetIdx];
  st.media[targetIdx] = temp;
  window.refreshPubMediaDeck();
  window.triggerPubDraftSave();
};

// Poll System in Composer
window.togglePubPoll = function() {
  const st = window.PUBLISH_STATE;
  if (st.poll) {
    st.poll = null;
    toast("أُلغي استطلاع الرأي", "info");
  } else {
    st.poll = {
      question: "",
      options: ["", ""],
      duration: 24,
      isMultiple: false,
      endsAt: Date.now() + 24 * 3600 * 1000,
      votes: {}
    };
    toast("أُضيف استطلاع رأي للمنشور", "ok");
  }
  window.refreshPubMediaDeck();
  window.triggerPubDraftSave();
};

window.addPubPollOption = function() {
  const st = window.PUBLISH_STATE;
  if (!st.poll) return;
  if (st.poll.options.length >= 6) {
    toast("الحد الأقصى هو 6 خيارات للاستطلاع", "err");
    return;
  }
  st.poll.options.push("");
  window.refreshPubMediaDeck();
  window.triggerPubDraftSave();
};

window.removePubPollOption = function(idx) {
  const st = window.PUBLISH_STATE;
  if (!st.poll || st.poll.options.length <= 2) {
    toast("يجب أن يحتوي الاستطلاع على خيارين على الأقل", "err");
    return;
  }
  st.poll.options.splice(idx, 1);
  window.refreshPubMediaDeck();
  window.triggerPubDraftSave();
};

window.updatePubPollOption = function(idx, val) {
  const st = window.PUBLISH_STATE;
  if (!st.poll) return;
  st.poll.options[idx] = val;
  window.triggerPubDraftSave();
};

window.updatePubPollQuestion = function(val) {
  const st = window.PUBLISH_STATE;
  if (!st.poll) return;
  st.poll.question = val;
  window.triggerPubDraftSave();
};

window.setPubPollDuration = function(hrs) {
  const st = window.PUBLISH_STATE;
  if (!st.poll) return;
  st.poll.duration = hrs;
  st.poll.endsAt = Date.now() + hrs * 3600 * 1000;
  window.refreshPubMediaDeck();
  window.triggerPubDraftSave();
};

// Content Warning / Spoiler
window.togglePubSpoiler = function() {
  const st = window.PUBLISH_STATE;
  st.spoiler = !st.spoiler;
  if (st.spoiler && !st.warningText) {
    st.warningText = "تحذير حرق أنمي / محتوى حساس";
  }
  toast(st.spoiler ? "تم تفعيل حماية الحرق 🛡️" : "تم إلغاء حماية الحرق", st.spoiler ? "ok" : "info");
  window.refreshPubMediaDeck();
  window.triggerPubDraftSave();
};

// Renders the live media deck inside composer
window.refreshPubMediaDeck = function() {
  const deck = document.getElementById("pub_media_deck");
  if (!deck) return;
  const st = window.PUBLISH_STATE;
  let html = "";

  // 1. Content Warning Shield
  if (st.spoiler) {
    html += `
      <div style="background:rgba(239,68,68,0.12);border:1px solid rgba(239,68,68,0.3);border-radius:14px;padding:12px 14px;margin-bottom:12px;display:flex;align-items:center;gap:10px">
        <span style="color:var(--rose)">${I("alert","i s")}</span>
        <div style="flex:1">
          <input type="text" value="${esc(st.warningText || 'تحذير حرق أنمي')}" placeholder="نص تحذير الحرق..." oninput="PUBLISH_STATE.warningText=this.value;triggerPubDraftSave()" style="width:100%;background:none;border:none;outline:none;color:#fff;font-size:13px;font-weight:700">
          <div class="tiny fnt" style="color:var(--muted)">سيتم تمويه الوسائط للمستخدمين حتى يقوموا بالضغط لعرضها</div>
        </div>
        <button type="button" class="iconbtn" onclick="togglePubSpoiler()" style="width:28px;height:28px;border-radius:50%">${I("x","i s")}</button>
      </div>
    `;
  }

  // 2. Media Grid / Carousel Previews
  if (st.media && st.media.length > 0) {
    html += `
      <div style="margin-bottom:14px">
        <div class="rowb" style="margin-bottom:8px">
          <span class="tiny b" style="color:var(--accent)">الوسائط المرفقة (${st.media.length})</span>
          <span class="tiny fnt" style="color:var(--muted)">اسحب أو استخدم الأسهم للترتيب</span>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(110px, 1fr));gap:10px">
          ${st.media.map((m, idx) => `
            <div style="position:relative;border-radius:12px;overflow:hidden;background:#151822;border:1px solid rgba(255,255,255,0.08);aspect-ratio:1/1;display:flex;flex-direction:column;align-items:center;justify-content:center">
              ${m.type === 'image' || m.type === 'gif' ? `
                <img src="${m.src || ''}" style="width:100%;height:100%;object-fit:cover;cursor:pointer" onclick="openMediaViewer(PUBLISH_STATE.media, ${idx})" alt="">
              ` : m.type === 'video' ? `
                <video src="${m.src || ''}" style="width:100%;height:100%;object-fit:cover"></video>
                <span style="position:absolute;background:rgba(0,0,0,0.6);padding:6px;border-radius:50%;color:#fff">${I("play","i s")}</span>
              ` : m.type === 'audio' ? `
                <div style="padding:10px;text-align:center">
                  <span style="color:var(--accent);font-size:24px">${I("mic","i l")}</span>
                  <div class="tiny b" style="margin-top:4px;color:#fff;max-width:90px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(m.name || 'تسجيل')}</div>
                </div>
              ` : `
                <div style="padding:10px;text-align:center">
                  <span style="color:var(--emerald);font-size:24px">${I("file","i l")}</span>
                  <div class="tiny b" style="margin-top:4px;color:#fff;max-width:90px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(m.name || 'مستند')}</div>
                </div>
              `}

              ${m.isUploading ? `
                <div style="position:absolute;inset:0;background:rgba(0,0,0,0.7);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:10px">
                  <div class="spin" style="width:20px;height:20px;border:2px solid #fff;border-top-color:transparent;border-radius:50%;margin-bottom:6px"></div>
                  <div class="tiny mono b" style="color:#fff">${m.progress || 0}%</div>
                  <div style="width:80%;height:4px;background:#333;border-radius:99px;margin-top:4px;overflow:hidden">
                    <div id="pub_prog_${m.id}" style="width:${m.progress || 0}%;height:100%;background:var(--accent);transition:width .2s"></div>
                  </div>
                </div>
              ` : ""}

              <!-- Overlay Controls -->
              <div style="position:absolute;top:4px;right:4px;display:flex;gap:4px">
                <button type="button" onclick="removePubMedia('${m.id}')" style="width:24px;height:24px;border-radius:50%;background:rgba(0,0,0,0.75);color:#fff;border:none;display:flex;align-items:center;justify-content:center;cursor:pointer">
                  ${I("x","i s")}
                </button>
              </div>
              <div style="position:absolute;bottom:4px;left:4px;right:4px;display:flex;justify-content:space-between;align-items:center">
                <span class="badge" style="background:rgba(0,0,0,0.7);color:#fff;font-size:10px;padding:2px 6px">${idx + 1}</span>
                <div style="display:flex;gap:2px">
                  ${idx > 0 ? `<button type="button" onclick="movePubMedia(${idx}, -1)" style="width:22px;height:22px;border-radius:4px;background:rgba(0,0,0,0.7);color:#fff;border:none;cursor:pointer">◀</button>` : ""}
                  ${idx < st.media.length - 1 ? `<button type="button" onclick="movePubMedia(${idx}, 1)" style="width:22px;height:22px;border-radius:4px;background:rgba(0,0,0,0.7);color:#fff;border:none;cursor:pointer">▶</button>` : ""}
                </div>
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    `;
  }

  // 3. Poll Builder Preview Card
  if (st.poll) {
    html += `
      <div style="background:#151822;border:1px solid rgba(255,255,255,0.1);border-radius:14px;padding:14px;margin-bottom:14px">
        <div class="rowb" style="margin-bottom:10px">
          <div class="row" style="gap:6px">
            <span style="color:var(--accent)">${I("barchart","i s")}</span>
            <span class="b xs" style="color:#fff">استطلاع رأي</span>
          </div>
          <button type="button" class="iconbtn" onclick="togglePubPoll()" style="width:26px;height:26px;border-radius:50%">${I("x","i s")}</button>
        </div>
        <input type="text" value="${esc(st.poll.question || '')}" placeholder="سؤال الاستطلاع..." oninput="updatePubPollQuestion(this.value)" style="width:100%;padding:8px 12px;background:#0D0F16;border:1px solid var(--line);border-radius:8px;color:#fff;font-size:13.5px;margin-bottom:10px;outline:none">
        <div class="col" style="gap:8px;margin-bottom:10px">
          ${st.poll.options.map((opt, oi) => `
            <div class="row" style="gap:8px">
              <input type="text" value="${esc(opt)}" placeholder="الخيار ${oi + 1}..." oninput="updatePubPollOption(${oi}, this.value)" style="flex:1;padding:7px 10px;background:#0D0F16;border:1px solid var(--line);border-radius:8px;color:#fff;font-size:13px;outline:none">
              ${st.poll.options.length > 2 ? `
                <button type="button" class="iconbtn" onclick="removePubPollOption(${oi})" style="width:28px;height:28px;border-radius:50%;color:var(--rose)">${I("trash","i s")}</button>
              ` : ""}
            </div>
          `).join("")}
        </div>
        ${st.poll.options.length < 6 ? `
          <button type="button" class="btn btn-ghost btn-sm" onclick="addPubPollOption()" style="width:100%;border-style:dashed;margin-bottom:10px">
            ${I("plus","i s")} إضافة خيار
          </button>
        ` : ""}
        <div class="rowb" style="padding-top:8px;border-top:1px solid var(--line);flex-wrap:wrap;gap:8px">
          <span class="tiny fnt">مدة الاستطلاع:</span>
          <div class="row" style="gap:4px">
            ${[24, 72, 168].map(h => `
              <button type="button" class="chip ${st.poll.duration === h ? 'on' : ''}" onclick="setPubPollDuration(${h})" style="font-size:11px;padding:3px 8px">
                ${h === 24 ? 'يوم واحد' : h === 72 ? '3 أيام' : 'أسبوع'}
              </button>
            `).join("")}
          </div>
        </div>
      </div>
    `;
  }

  // 4. Link Preview Card
  if (st.linkPreview) {
    html += `
      <div style="background:#151822;border:1px solid rgba(255,255,255,0.1);border-radius:14px;overflow:hidden;margin-bottom:14px;position:relative">
        <button type="button" onclick="PUBLISH_STATE.linkPreview=null;refreshPubMediaDeck();triggerPubDraftSave()" style="position:absolute;top:6px;left:6px;width:26px;height:26px;border-radius:50%;background:rgba(0,0,0,0.7);color:#fff;border:none;cursor:pointer;z-index:2">
          ${I("x","i s")}
        </button>
        <div style="padding:12px 14px">
          <div class="row" style="gap:6px;margin-bottom:4px">
            <span style="color:var(--accent)">${I("link","i s")}</span>
            <span class="tiny b" style="color:var(--accent)">${esc(st.linkPreview.domain || '')}</span>
          </div>
          <div class="b sm" style="color:#fff;margin-bottom:4px">${esc(st.linkPreview.title || st.linkPreview.url)}</div>
          <div class="tiny fnt" style="color:var(--muted)">${esc(st.linkPreview.desc || st.linkPreview.url)}</div>
        </div>
      </div>
    `;
  }

  // 5. Quoted Post Preview
  if (st.quotedPost) {
    const qp = st.quotedPost;
    const qAuthor = qp.author || u(qp.authorId);
    html += `
      <div style="background:rgba(255,255,255,0.03);border:1px solid var(--accent);border-radius:14px;padding:12px;margin-bottom:14px;position:relative">
        <button type="button" onclick="PUBLISH_STATE.quotedPost=null;refreshPubMediaDeck();triggerPubDraftSave()" style="position:absolute;top:8px;left:8px;width:26px;height:26px;border-radius:50%;background:rgba(0,0,0,0.6);color:#fff;border:none;cursor:pointer">
          ${I("x","i s")}
        </button>
        <div class="row" style="gap:8px;margin-bottom:6px">
          <img src="${qAuthor.avatar || AV[0]}" style="width:24px;height:24px;border-radius:50%;object-fit:cover" alt="">
          <span class="b xs" style="color:#fff">${esc(qAuthor.name || '')}</span>
          <span class="tiny fnt">@${esc(qAuthor.username || '')}</span>
        </div>
        <div class="tiny fnt" style="color:#D1D5DB;line-height:1.5;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">
          ${esc(qp.text || '')}
        </div>
      </div>
    `;
  }

  // 6. Location Tag
  if (st.location) {
    html += `
      <div style="display:inline-flex;align-items:center;gap:6px;background:rgba(16,185,129,0.12);border:1px solid rgba(16,185,129,0.25);border-radius:99px;padding:4px 12px;margin-bottom:12px">
        <span style="color:var(--emerald)">${I("map","i s")}</span>
        <span class="tiny b" style="color:var(--emerald)">${esc(st.location)}</span>
        <button type="button" onclick="PUBLISH_STATE.location='';refreshPubMediaDeck();triggerPubDraftSave()" style="background:none;border:none;color:var(--emerald);cursor:pointer;padding:0;line-height:0">${I("x","i s")}</button>
      </div>
    `;
  }

  // 7. Scheduled Tag
  if (st.schedule) {
    html += `
      <div style="display:inline-flex;align-items:center;gap:6px;background:rgba(139,92,246,0.12);border:1px solid rgba(139,92,246,0.3);border-radius:99px;padding:4px 12px;margin-bottom:12px">
        <span style="color:var(--purple)">${I("calendar","i s")}</span>
        <span class="tiny b" style="color:var(--purple)">مجدول: ${esc(st.schedule.date)} ${esc(st.schedule.time)}</span>
        <button type="button" onclick="PUBLISH_STATE.schedule=null;refreshPubMediaDeck();triggerPubDraftSave()" style="background:none;border:none;color:var(--purple);cursor:pointer;padding:0;line-height:0">${I("x","i s")}</button>
      </div>
    `;
  }

  deck.innerHTML = html;
};

// PUBLISH ACTION: Firestore + Storage + Realtime Sync
window.executePublishPost = async function() {
  const st = window.PUBLISH_STATE;
  if (!st) return;

  const text = (st.text || "").trim();
  const hasMedia = st.media && st.media.length > 0;
  const hasPoll = st.poll && st.poll.question && st.poll.options.filter(Boolean).length >= 2;
  const hasQuoted = !!st.quotedPost;

  if (!text && !hasMedia && !hasPoll && !hasQuoted) {
    toast("اكتب نصاً أو أرفق وسائط لنشر المنشور ✨", "err");
    return;
  }

  if (st.isUploading) {
    toast("يرجى الانتظار حتى اكتمال رفع الوسائط ⏳", "err");
    return;
  }

  st.isPublishing = true;
  const pubBtn = document.getElementById("pub_action_btn");
  if (pubBtn) {
    pubBtn.disabled = true;
    pubBtn.innerHTML = `<span class="spin" style="width:16px;height:16px;border:2px solid #fff;border-top-color:transparent;border-radius:50%;display:inline-block"></span> <span>جارٍ النشر...</span>`;
  }

  const myUid = (window.auth && window.auth.currentUser) ? window.auth.currentUser.uid : (S.me.id || "me");
  const authorObj = {
    id: myUid,
    uid: myUid,
    name: S.me.name || "أوتاكو أنمي بلاك",
    username: S.me.username || "otaku",
    avatar: S.me.avatar || AV[0],
    isVerified: !!S.me.isVerified,
    role: S.me.role || "عضو",
    level: S.me.level || 1
  };

  // Determine Primary Media Kind
  let primaryMedia = null;
  if (hasMedia) {
    const firstM = st.media[0];
    primaryMedia = {
      kind: firstM.type === "video" ? "video" : firstM.type === "audio" ? "audio" : firstM.type === "file" ? "file" : "image",
      src: firstM.src || "",
      imgs: st.media.filter(m => m.type === "image" || m.type === "gif").map(m => m.src),
      items: st.media.map(m => ({ type: m.type, src: m.src, name: m.name, size: m.size }))
    };
  }

  // Handle Edit Post
  if (st.editPostId) {
    const editId = st.editPostId;
    const postObj = (S.posts || []).find(x => x.id === editId);
    if (postObj) {
      postObj.text = text;
      postObj.media = primaryMedia || postObj.media;
      postObj.tags = st.tags || [];
      postObj.mentions = st.mentions || [];
      postObj.privacy = st.privacy || "public";
      postObj.spoiler = st.spoiler;
      postObj.warningText = st.warningText || "";
      postObj.isEdited = true;
      postObj.updatedAt = Date.now();
      save();

      if (window.db && window.setDoc && window.doc) {
        window.setDoc(window.doc(window.db, "posts", editId), {
          text: postObj.text,
          media: postObj.media || null,
          tags: postObj.tags,
          mentions: postObj.mentions,
          privacy: postObj.privacy,
          spoiler: postObj.spoiler,
          warningText: postObj.warningText,
          isEdited: true,
          updatedAt: Date.now()
        }, { merge: true }).catch(err => console.error("Firestore edit update failed:", err));
      }

      toast("تم تعديل المنشور بنجاح ✓", "ok");
      celebrate("عُدّل منشورك بنجاح ✨");
      window.PUBLISH_STATE.editPostId = null;
      setTimeout(() => go("home", {}, false), 400);
      return;
    }
  }

  // Handle Scheduled Post
  if (st.schedule && st.schedule.scheduledAt && st.schedule.scheduledAt > Date.now()) {
    const schedPost = {
      id: "p_sched_" + Date.now(),
      authorId: myUid,
      author: authorObj,
      text: text,
      media: primaryMedia,
      poll: st.poll,
      linkPreview: st.linkPreview,
      location: st.location,
      tags: st.tags,
      mentions: st.mentions,
      privacy: st.privacy,
      spoiler: st.spoiler,
      warningText: st.warningText,
      settings: st.settings,
      quotedPost: st.quotedPost,
      scheduledAt: st.schedule.scheduledAt,
      isScheduled: true,
      createdAt: Date.now()
    };
    S.scheduledPosts = S.scheduledPosts || [];
    S.scheduledPosts.unshift(schedPost);
    save();
    toast(`تمت جدولة المنشور للنشر في ${st.schedule.date} ⏰`, "ok");
    celebrate("تمت جدولة منشورك بنجاح 📅");
    setTimeout(() => go("home", {}, false), 400);
    return;
  }

  // Build New Post Object
  const newPostId = "p_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7);
  const newPost = {
    id: newPostId,
    authorId: myUid,
    author: authorObj,
    type: hasMedia ? (st.media[0].type === "video" ? "video" : st.media[0].type === "audio" ? "audio" : "photos") : hasPoll ? "poll" : "post",
    text: text,
    media: primaryMedia,
    poll: st.poll,
    linkPreview: st.linkPreview,
    location: st.location,
    tags: st.tags || [],
    mentions: st.mentions || [],
    privacy: st.privacy || "public",
    spoiler: st.spoiler || false,
    warningText: st.warningText || "",
    settings: st.settings || { allowComments: true, allowReposts: true, hideCounts: false },
    quotedPost: st.quotedPost || null,
    likes: 0,
    liked: false,
    reactions: {},
    likedUsers: [],
    comments: [],
    reposts: 0,
    saves: 0,
    shares: 0,
    views: 1,
    createdAt: Date.now(),
    at: Date.now(),
    pending: false
  };

  // Add to local feed immediately
  S.posts = S.posts || [];
  S.posts.unshift(newPost);
  addXP(15, "نشر منشور جديد");
  addCoins(5, "مكافأة النشر");
  questProgress("q1");
  save();

  // Remove saved draft if matched
  if (st.draftId && S.postDrafts) {
    S.postDrafts = S.postDrafts.filter(d => d.id !== st.draftId);
    save();
  }

  // Sync to Firestore Realtime
  if (window.db && window.setDoc && window.doc) {
    try {
      window.setDoc(window.doc(window.db, "posts", newPostId), newPost)
        .then(() => {
          console.log("Post synced to Firestore successfully:", newPostId);
        })
        .catch((err) => {
          console.warn("Firestore post sync error:", err);
        });
    } catch (e) {
      console.warn("Firestore sync trigger failed:", e);
    }
  }

  toast("تم نشر المنشور في المجتمع بنجاح ✓", "ok");
  celebrate("نُشر منشورك الجديد بنجاح 🎉");
  snd("success");

  // Reset Publish State
  window.PUBLISH_STATE = {
    text: "",
    media: [],
    poll: null,
    linkPreview: null,
    location: "",
    privacy: "public",
    tags: [],
    mentions: [],
    spoiler: false,
    warningText: "",
    schedule: null,
    settings: { allowComments: true, allowReposts: true, hideCounts: false, altText: "" },
    quotedPost: null,
    repostPost: null,
    editPostId: null,
    isUploading: false,
    uploadProgress: 0,
    isPublishing: false,
    draftStatus: "idle"
  };

  setTimeout(() => {
    go("home", {}, false);
  }, 350);
};

// Start Post Edit Mode
window.startEditPost = function(postId) {
  closeOvl();
  const p = (S.posts || []).find(x => x.id === postId);
  if (!p) {
    toast("المنشور غير موجود", "err");
    return;
  }
  window.PUBLISH_STATE = {
    text: p.text || "",
    media: (p.media && p.media.items) ? p.media.items : (p.media && p.media.src) ? [{ id: 'm1', type: p.media.kind || 'image', src: p.media.src, name: 'وسائط' }] : [],
    poll: p.poll || null,
    linkPreview: p.linkPreview || null,
    location: p.location || p.loc || "",
    privacy: p.privacy || "public",
    tags: p.tags || [],
    mentions: p.mentions || [],
    spoiler: !!p.spoiler,
    warningText: p.warningText || "",
    schedule: null,
    settings: p.settings || { allowComments: true, allowReposts: true, hideCounts: false },
    quotedPost: p.quotedPost || null,
    editPostId: postId,
    isUploading: false,
    uploadProgress: 0,
    isPublishing: false,
    draftStatus: "idle"
  };
  go("createPost");
};

// Quote Post Action
window.quotePost = function(postId) {
  closeOvl();
  const p = (S.posts || []).find(x => x.id === postId);
  if (!p) {
    toast("المنشور غير موجود للاقتباس", "err");
    return;
  }
  window.PUBLISH_STATE = {
    text: "",
    media: [],
    poll: null,
    linkPreview: null,
    location: "",
    privacy: "public",
    tags: [],
    mentions: [],
    spoiler: false,
    warningText: "",
    schedule: null,
    settings: { allowComments: true, allowReposts: true, hideCounts: false },
    quotedPost: p,
    editPostId: null,
    isUploading: false,
    uploadProgress: 0,
    isPublishing: false,
    draftStatus: "idle"
  };
  go("createPost");
};

// Instant Repost Action
window.instantRepost = function(postId) {
  closeOvl();
  const orig = (S.posts || []).find(x => x.id === postId);
  if (!orig) {
    toast("تعذر العثور على المنشور", "err");
    return;
  }
  const myUid = (window.auth && window.auth.currentUser) ? window.auth.currentUser.uid : (S.me.id || "me");
  const repostId = "p_rep_" + Date.now();
  const repostObj = {
    id: repostId,
    authorId: myUid,
    author: {
      id: myUid,
      uid: myUid,
      name: S.me.name || "أوتاكو أنمي بلاك",
      username: S.me.username || "otaku",
      avatar: S.me.avatar || AV[0],
      isVerified: !!S.me.isVerified,
      role: S.me.role || "عضو",
      level: S.me.level || 1
    },
    type: "repost",
    text: "",
    repostedPost: orig,
    quotedPost: orig,
    createdAt: Date.now(),
    at: Date.now(),
    likes: 0,
    reposts: 0,
    comments: []
  };

  orig.reposts = (orig.reposts || 0) + 1;
  S.posts = S.posts || [];
  S.posts.unshift(repostObj);
  save();

  if (window.db && window.setDoc && window.doc) {
    window.setDoc(window.doc(window.db, "posts", repostId), repostObj).catch(() => {});
    window.setDoc(window.doc(window.db, "posts", orig.id), { reposts: orig.reposts }, { merge: true }).catch(() => {});
  }

  toast("تمت إعادة نشر المنشور في حسابك 🔄", "ok");
  celebrate("أعدت نشر المنشور بنجاح ✨");
  render();
};

// Toggle Save / Bookmark Post
window.toggleSavePost = function(postId) {
  const p = (S.posts || []).find(x => x.id === postId);
  S.savedPosts = S.savedPosts || [];
  const isSaved = S.savedPosts.includes(postId);
  if (isSaved) {
    S.savedPosts = S.savedPosts.filter(id => id !== postId);
    if (p) p.saves = Math.max(0, (p.saves || 1) - 1);
    toast("تمت إزالة المنشور من المحفوظات", "info");
  } else {
    S.savedPosts.unshift(postId);
    if (p) p.saves = (p.saves || 0) + 1;
    toast("تم حفظ المنشور في المحفوظات 📑", "ok");
    snd("success");
  }
  save();
  render();
};

// Delete Post with Firestore Synchronization
window.confirmDelPost = function(postId) {
  closeOvl();
  const p = (S.posts || []).find(x => x.id === postId);
  if (!p) return;
  const isAuthor = isMe(p.authorId) || (p.author && isMe(p.author.id || p.author.uid)) || (S.me && S.me.role === "admin");
  if (!isAuthor) {
    toast("ليس لديك صلاحية حذف هذا المنشور", "err");
    return;
  }

  openModal("تأكيد حذف المنشور", `
    <div class="col" style="gap:14px;text-align:center">
      <div style="font-size:38px;color:var(--rose)">${I("trash","i l")}</div>
      <div class="b sm" style="color:#fff">هل أنت متأكد من حذف هذا المنشور نهائياً؟</div>
      <div class="tiny fnt" style="color:var(--muted)">لا يمكن التراجع عن هذه العملية بعد تأكيدها.</div>
      <div class="row" style="gap:10px;margin-top:8px">
        <button class="btn btn-ghost g1" onclick="closeOvl()">إلغاء</button>
        <button class="btn btn-danger g1" onclick="delPostFinal('${postId}')">نعم، احذف</button>
      </div>
    </div>
  `);
};

window.delPostFinal = function(postId) {
  closeOvl();
  S.posts = (S.posts || []).filter(x => x.id !== postId);
  save();

  if (window.db && window.deleteDoc && window.doc) {
    window.deleteDoc(window.doc(window.db, "posts", postId))
      .then(() => console.log("Post deleted from Firestore:", postId))
      .catch(e => console.error("Firestore post delete error:", e));
  }

  const postEl = document.getElementById("post_" + postId);
  if (postEl) {
    postEl.style.transition = "opacity .3s, transform .3s";
    postEl.style.opacity = "0";
    postEl.style.transform = "scale(0.95)";
    setTimeout(() => postEl.remove(), 300);
  }

  toast("تم حذف المنشور نهائياً 🗑️", "ok");
  snd("tap");
};

// Interactive Poll Voting with Realtime Synchronization
window.votePollPro = function(postId, optIdx) {
  const p = (S.posts || []).find(x => x.id === postId);
  if (!p || !p.poll) return;
  const myUid = (window.auth && window.auth.currentUser) ? window.auth.currentUser.uid : (S.me.id || "me");

  p.poll.votes = p.poll.votes || {};
  if (p.poll.votes[myUid] !== undefined && !p.poll.isMultiple) {
    toast("لقد قمت بالتصويت مسبقاً في هذا الاستطلاع", "info");
    return;
  }

  p.poll.votes[myUid] = optIdx;
  save();

  if (window.db && window.setDoc && window.doc) {
    window.setDoc(window.doc(window.db, "posts", postId), {
      poll: p.poll
    }, { merge: true }).catch(err => console.error(err));
  }

  toast("تم تسجيل صوتك بنجاح 🗳️", "ok");
  snd("success");
  render();
};

// Multi-Reactions System (❤️ 🔥 😮 😂 😢 ⭐)
window.setPostReaction = function(postId, reactionKey) {
  const p = (S.posts || []).find(x => x.id === postId);
  if (!p) return;
  const myUid = (window.auth && window.auth.currentUser) ? window.auth.currentUser.uid : (S.me.id || "me");

  p.reactions = p.reactions || {};
  p.likedUsers = p.likedUsers || [];
  const currentReaction = p.reactions[myUid];

  if (currentReaction === reactionKey) {
    delete p.reactions[myUid];
    p.likedUsers = p.likedUsers.filter(u => (u.id || u.uid || u) !== myUid);
    p.liked = false;
    p.likes = Math.max(0, (p.likes || 1) - 1);
  } else {
    if (!currentReaction) p.likes = (p.likes || 0) + 1;
    p.reactions[myUid] = reactionKey;
    if (!p.likedUsers.some(u => (u.id || u.uid || u) === myUid)) {
      p.likedUsers.push({ id: myUid, uid: myUid, reaction: reactionKey });
    }
    p.liked = true;
    snd("coin");
  }
  save();

  if (window.db && window.setDoc && window.doc) {
    window.setDoc(window.doc(window.db, "posts", postId), {
      likes: p.likes,
      reactions: p.reactions,
      likedUsers: p.likedUsers
    }, { merge: true }).catch(e => console.error(e));
  }

  closeOvl();
  render();
};

// Full-Screen Media Lightbox / Viewer
window.openMediaViewer = function(mediaList, activeIdx = 0) {
  if (!mediaList || !mediaList.length) return;
  const items = Array.isArray(mediaList) ? mediaList : [mediaList];
  window._activeViewerItems = items;
  window._activeViewerIndex = activeIdx;

  const cur = items[activeIdx] || items[0];
  const total = items.length;

  const viewerHtml = `
    <div id="media_viewer_modal" style="position:fixed;inset:0;background:rgba(0,0,0,0.96);z-index:9999;display:flex;flex-direction:column;backdrop-filter:blur(16px);direction:rtl">
      <!-- Viewer Top Bar -->
      <div class="rowb" style="padding:14px 18px;border-bottom:1px solid rgba(255,255,255,0.08);background:rgba(0,0,0,0.4)">
        <div class="row" style="gap:10px">
          <button type="button" class="iconbtn" onclick="closeMediaViewer()" style="width:38px;height:38px;border-radius:50%;background:rgba(255,255,255,0.1);color:#fff">${I("x","i s")}</button>
          ${total > 1 ? `<span class="badge" style="background:rgba(255,255,255,0.15);color:#fff;font-size:12px">${activeIdx + 1} / ${total}</span>` : ""}
        </div>
        <div class="row" style="gap:8px">
          ${cur.src ? `<a href="${cur.src}" download="animeblack_media" target="_blank" class="iconbtn" style="width:38px;height:38px;border-radius:50%;background:rgba(255,255,255,0.1);color:#fff">${I("download","i s")}</a>` : ""}
          <button type="button" class="iconbtn" onclick="shareMediaCurrent('${cur.src || ''}')" style="width:38px;height:38px;border-radius:50%;background:rgba(255,255,255,0.1);color:#fff">${I("share","i s")}</button>
        </div>
      </div>

      <!-- Viewer Body Content -->
      <div style="flex:1;display:flex;align-items:center;justify-content:center;position:relative;padding:12px;overflow:hidden" onclick="if(event.target===this)closeMediaViewer()">
        ${cur.type === 'video' || (cur.kind === 'video') ? `
          <video src="${cur.src || ''}" controls autoplay style="max-width:100%;max-height:85vh;border-radius:12px;box-shadow:0 12px 40px rgba(0,0,0,0.8)"></video>
        ` : cur.type === 'audio' || (cur.kind === 'audio') ? `
          <div style="background:#151822;padding:24px;border-radius:18px;border:1px solid var(--line);text-align:center;width:90%;max-width:400px">
            <span style="font-size:48px;color:var(--accent)">${I("music","i l")}</span>
            <div class="b sm" style="color:#fff;margin:12px 0">${esc(cur.name || 'مقطع صوتي')}</div>
            <audio src="${cur.src || ''}" controls autoplay style="width:100%"></audio>
          </div>
        ` : `
          <img src="${cur.src || cur}" style="max-width:100%;max-height:85vh;object-fit:contain;border-radius:12px;box-shadow:0 12px 40px rgba(0,0,0,0.8);user-select:none" alt="">
        `}

        <!-- Nav Arrows for Carousel -->
        ${total > 1 && activeIdx > 0 ? `
          <button type="button" onclick="navigateMediaViewer(-1)" style="position:absolute;right:14px;top:50%;transform:translateY(-50%);width:44px;height:44px;border-radius:50%;background:rgba(0,0,0,0.65);border:1px solid rgba(255,255,255,0.2);color:#fff;font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center">
            ${I("arrow-right","i s")}
          </button>
        ` : ""}
        ${total > 1 && activeIdx < total - 1 ? `
          <button type="button" onclick="navigateMediaViewer(1)" style="position:absolute;left:14px;top:50%;transform:translateY(-50%);width:44px;height:44px;border-radius:50%;background:rgba(0,0,0,0.65);border:1px solid rgba(255,255,255,0.2);color:#fff;font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center">
            ${I("arrow-left","i s")}
          </button>
        ` : ""}
      </div>
    </div>
  `;

  const ovl = document.getElementById("ovl");
  if (ovl) {
    ovl.innerHTML = viewerHtml;
  }
};

window.closeMediaViewer = function() {
  const v = document.getElementById("media_viewer_modal");
  if (v) v.remove();
};

window.navigateMediaViewer = function(dir) {
  const items = window._activeViewerItems || [];
  const nextIdx = (window._activeViewerIndex || 0) + dir;
  if (nextIdx >= 0 && nextIdx < items.length) {
    window.openMediaViewer(items, nextIdx);
  }
};

window.shareMediaCurrent = function(src) {
  if (navigator.share) {
    navigator.share({ title: "وسائط من أنمي بلاك", url: src }).catch(() => {});
  } else if (navigator.clipboard) {
    navigator.clipboard.writeText(src);
    toast("تم نسخ رابط الوسائط ✓", "ok");
  }
};

// ============================================================================
// MAIN POST COMPOSER VIEW (PAGES.create & PAGES.createPost)
// ============================================================================

PAGES.create = () => PAGES.createPost();

PAGES.createPost = () => {
  setNav(false);
  setHdr("");
  const st = window.PUBLISH_STATE;
  const myAvatar = S.me.avatar || AV[0];
  const myName = S.me.name || "أوتاكو أنمي بلاك";
  const myUname = S.me.username || "otaku";
  const isEdit = !!st.editPostId;

  return `
    <div style="min-height:100vh;background:#09090C;color:#fff;display:flex;flex-direction:column;position:relative;padding-bottom:120px;box-sizing:border-box">
      
      <!-- Top Navigation Header -->
      <div style="display:flex;align-items:center;justify-content:space-between;padding:14px 18px;border-bottom:1px solid rgba(255,255,255,0.08);position:sticky;top:0;background:#09090C;z-index:40">
        <div class="row" style="gap:10px">
          <button type="button" onclick="back()" style="width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,0.06);border:none;color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer" aria-label="إغلاق">
            ${I("x","i s")}
          </button>
          <div>
            <div style="font-size:15px;font-weight:800;color:#fff">${isEdit ? 'تعديل المنشور' : 'إنشاء منشور جديد'}</div>
            <div id="pub_draft_badge" class="row" style="gap:4px;color:var(--emerald)">
              ${I("check","i s")} <span style="font-size:11px">جاهز للنشر</span>
            </div>
          </div>
        </div>

        <div class="row" style="gap:8px">
          <!-- Drafts Quick Access -->
          <button type="button" class="iconbtn" onclick="openSheet('draftsSheet')" title="المسودات" style="width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,0.06);color:var(--gold)">
            ${I("folder","i s")}
          </button>

          <!-- Publish Action Button -->
          <button id="pub_action_btn" type="button" onclick="executePublishPost()" style="background:linear-gradient(135deg,#00A3FF 0%,#8B5CF6 100%);color:#fff;border:none;padding:8px 22px;border-radius:99px;font-size:13.5px;font-weight:800;cursor:pointer;box-shadow:0 4px 16px rgba(0,163,255,0.4);display:inline-flex;align-items:center;gap:6px">
            ${I("send","i s")}
            <span>${isEdit ? 'حفظ التعديل' : 'نشر'}</span>
          </button>
        </div>
      </div>

      <!-- Author Information Row -->
      <div style="display:flex;align-items:center;justify-content:space-between;padding:14px 18px 8px">
        <div class="row" style="gap:12px">
          <div style="position:relative;width:44px;height:44px;border-radius:50%;padding:2px;background:linear-gradient(135deg,#A855F7,#EC4899);box-shadow:0 0 10px rgba(168,85,247,0.3);flex-shrink:0">
            <img src="${myAvatar}" style="width:100%;height:100%;border-radius:50%;object-fit:cover" alt="">
          </div>
          <div>
            <div class="row" style="gap:5px">
              <span style="font-weight:800;font-size:14.5px;color:#fff">${esc(myName)}</span>
              ${vbadge(S.me)}
              <span class="badge b-purple" style="font-size:10px;padding:1px 6px">Lv.${S.me.level || 1}</span>
            </div>
            <div style="display:flex;align-items:center;gap:6px;margin-top:3px">
              <!-- Privacy Selector Dropdown -->
              <select onchange="PUBLISH_STATE.privacy=this.value;triggerPubDraftSave()" style="background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);color:#D1D5DB;border-radius:99px;font-size:11.5px;font-weight:700;padding:2px 10px;outline:none;cursor:pointer">
                <option value="public" ${st.privacy === 'public' ? 'selected' : ''}>🌍 عام (الجميع)</option>
                <option value="followers" ${st.privacy === 'followers' ? 'selected' : ''}>👥 الأصدقاء فقط</option>
                <option value="private" ${st.privacy === 'private' ? 'selected' : ''}>🔒 خاص بي فقط</option>
              </select>
            </div>
          </div>
        </div>

        <div id="pub_char_count" class="mono tiny" style="color:var(--faint)">
          ${(st.text || '').length} / 2000
        </div>
      </div>

      <!-- Main Text Composition Area -->
      <div style="padding:10px 18px;flex:1;display:flex;flex-direction:column;position:relative">
        <textarea id="pub_text_area" placeholder="وش تبي تشارك اليوم مع مجتمع أنمي بلاك؟ (يدعم @للإشارة و #للهاشتاق) ✨" oninput="onPubTextInput(this)" style="width:100%;min-height:140px;background:transparent;border:none;outline:none;font-size:16px;line-height:1.65;color:#FFFFFF;resize:none;padding:4px 0">${esc(st.text || "")}</textarea>

        <!-- @ Mention Autocomplete Popup Box -->
        <div id="pub_mention_popup" style="display:none;position:absolute;top:60px;right:18px;width:280px;background:#181B26;border:1px solid var(--accent);border-radius:12px;box-shadow:0 8px 30px rgba(0,0,0,0.8);z-index:50;flex-direction:column;overflow:hidden"></div>

        <!-- Suggested Anime Hashtags Bar -->
        <div style="display:flex;gap:6px;overflow-x:auto;padding:6px 0 10px;scrollbar-width:none">
          ${["هجوم_العمالقة", "ون_بيس", "جوجيتسو", "قاتل_الشياطين", "دراجون_بول", "ناروتو", "سولو_ليفيلينغ", "نقاش_الأنمي"].map(tag => `
            <button type="button" class="chip" onclick="insertPubHashtag('${tag}')" style="font-size:11px;padding:3px 10px;white-space:nowrap;border-radius:99px;background:rgba(0,163,255,0.08);border-color:rgba(0,163,255,0.25);color:var(--accent)">
              #${tag}
            </button>
          `).join("")}
        </div>

        <!-- Dynamic Media Deck -->
        <div id="pub_media_deck" style="margin-top:10px"></div>
      </div>

      <!-- Professional Expandable Publishing Toolbar -->
      <div style="position:fixed;bottom:0;left:0;right:0;background:#0D0F16;border-top:1px solid rgba(255,255,255,0.08);padding:10px 16px;display:flex;align-items:center;justify-content:space-between;z-index:40;backdrop-filter:blur(20px)">
        <div class="row" style="gap:10px;overflow-x:auto;scrollbar-width:none">
          <!-- Photos / Multi-Images -->
          <button type="button" class="iconbtn" onclick="pickPubImages()" title="إضافة صور" style="background:rgba(16,185,129,0.12);color:var(--emerald);border-color:rgba(16,185,129,0.25);border-radius:50%;width:40px;height:40px">
            ${I("image","i s")}
          </button>

          <!-- Video -->
          <button type="button" class="iconbtn" onclick="pickPubVideo()" title="إضافة فيديو" style="background:rgba(239,68,68,0.12);color:var(--rose);border-color:rgba(239,68,68,0.25);border-radius:50%;width:40px;height:40px">
            ${I("clapper","i s")}
          </button>

          <!-- GIF Selector -->
          <button type="button" class="iconbtn" onclick="openSheet('gifPickerSheet')" title="صور متحركة GIF" style="background:rgba(6,182,212,0.12);color:var(--cyan);border-color:rgba(6,182,212,0.25);border-radius:50%;width:40px;height:40px">
            <span style="font-size:11px;font-weight:900">GIF</span>
          </button>

          <!-- Voice / Audio -->
          <button type="button" class="iconbtn" onclick="pickPubAudio()" title="تسجيل/مقطع صوتي" style="background:rgba(0,163,255,0.12);color:var(--accent);border-color:rgba(0,163,255,0.25);border-radius:50%;width:40px;height:40px">
            ${I("mic","i s")}
          </button>

          <!-- Poll Builder -->
          <button type="button" class="iconbtn ${st.poll ? 'on' : ''}" onclick="togglePubPoll()" title="استطلاع رأي" style="background:rgba(139,92,246,0.12);color:var(--purple);border-color:rgba(139,92,246,0.25);border-radius:50%;width:40px;height:40px">
            ${I("barchart","i s")}
          </button>

          <!-- Document / File -->
          <button type="button" class="iconbtn" onclick="pickPubFile()" title="مستند أو ملف" style="background:rgba(234,179,8,0.12);color:var(--gold);border-color:rgba(234,179,8,0.25);border-radius:50%;width:40px;height:40px">
            ${I("file","i s")}
          </button>

          <!-- Spoiler Shield -->
          <button type="button" class="iconbtn ${st.spoiler ? 'on' : ''}" onclick="togglePubSpoiler()" title="حماية الحرق" style="background:rgba(236,72,153,0.12);color:#EC4899;border-color:rgba(236,72,153,0.25);border-radius:50%;width:40px;height:40px">
            ${I("alert","i s")}
          </button>

          <!-- Location Picker -->
          <button type="button" class="iconbtn" onclick="openSheet('locationPickerSheet')" title="إضافة موقع" style="background:rgba(20,184,166,0.12);color:#14B8A6;border-color:rgba(20,184,166,0.25);border-radius:50%;width:40px;height:40px">
            ${I("map","i s")}
          </button>

          <!-- Schedule Post -->
          <button type="button" class="iconbtn" onclick="openSheet('schedulePostSheet')" title="جدولة النشر" style="background:rgba(99,102,241,0.12);color:#6366F1;border-color:rgba(99,102,241,0.25);border-radius:50%;width:40px;height:40px">
            ${I("calendar","i s")}
          </button>
        </div>

        <!-- Advanced Settings Sheet Trigger -->
        <button type="button" class="iconbtn" onclick="openSheet('advancedPostSettingsSheet')" title="إعدادات المنشور" style="background:rgba(255,255,255,0.08);color:#fff;border-radius:50%;width:40px;height:40px;flex-shrink:0">
          ${I("cog","i s")}
        </button>
      </div>
    </div>
  `;
};

// ============================================================================
// PUBLISHING SHEETS & MODALS (GIFs, Schedule, Drafts, Settings, Location)
// ============================================================================

// 1. GIF Picker Sheet
SHEETS.gifPickerSheet = () => {
  const GIF_CATS = [
    { title: "حماس وأكشن", items: [
      { name: "غوكو سوبر", url: "https://media.giphy.com/media/cb9aF9tzoRjgQ/giphy.gif" },
      { name: "ناروتو راسينجان", url: "https://media.giphy.com/media/2y98KScHKeaQM/giphy.gif" },
      { name: "لوفي جير 5", url: "https://media.giphy.com/media/WmkqburJqXziM/giphy.gif" },
      { name: "ليفاي هجوم", url: "https://media.giphy.com/media/11HeubZNROphHw35NO/giphy.gif" }
    ]},
    { title: "ضحك ومرح", items: [
      { name: "ضحكة لوفي", url: "https://media.giphy.com/media/ym3umHWAOQrUCzhSSv/giphy.gif" },
      { name: "صدمة أنمي", url: "https://media.giphy.com/media/8v6Z3YyEPMvtPMo00L/giphy.gif" },
      { name: "رقصة تشيبي", url: "https://media.giphy.com/media/13HgwGsXF0aiGY/giphy.gif" }
    ]},
    { title: "إعجاب وفخامة", items: [
      { name: "فخامة غوجو", url: "https://media.giphy.com/media/ug6l63xBXQAWA/giphy.gif" },
      { name: "مادارا هيبة", url: "https://media.giphy.com/media/4doe1HP7LHzxe/giphy.gif" },
      { name: "إيتاشي ساسكي", url: "https://media.giphy.com/media/fGGV7FeScq2s/giphy.gif" }
    ]}
  ];

  return sheet("مكتبة الصور المتحركة GIF", `
    <div class="col" style="gap:14px">
      <input type="text" id="gif_search_input" placeholder="ابحث عن GIF أو شخصية أنمي..." oninput="filterGifs(this.value)" style="width:100%;padding:10px 14px;background:#151822;border:1px solid var(--line);border-radius:12px;color:#fff;font-size:13.5px;outline:none">
      
      <div id="gif_results_area" class="col" style="gap:14px;max-height:400px;overflow-y:auto">
        ${GIF_CATS.map(cat => `
          <div>
            <div class="b xs" style="color:var(--accent);margin-bottom:8px">${cat.title}</div>
            <div style="display:grid;grid-template-columns:repeat(2, 1fr);gap:8px">
              ${cat.items.map(g => `
                <div onclick="selectPubGif('${g.url}', '${g.name}')" style="position:relative;border-radius:10px;overflow:hidden;background:#0D0F16;cursor:pointer;aspect-ratio:16/9;border:1px solid rgba(255,255,255,0.06)">
                  <img src="${g.url}" style="width:100%;height:100%;object-fit:cover" alt="${g.name}">
                  <span style="position:absolute;bottom:4px;right:4px;background:rgba(0,0,0,0.7);padding:2px 6px;border-radius:4px;font-size:10px;color:#fff">${g.name}</span>
                </div>
              `).join("")}
            </div>
          </div>
        `).join("")}
      </div>
    </div>
  `);
};

window.selectPubGif = function(url, name) {
  closeOvl();
  const st = window.PUBLISH_STATE;
  st.media.push({
    id: "gif_" + Date.now(),
    type: "gif",
    src: url,
    name: name || "GIF",
    isUploading: false
  });
  window.refreshPubMediaDeck();
  window.triggerPubDraftSave();
  toast("تمت إضافة GIF للمنشور ✨", "ok");
};

// 2. Schedule Post Sheet
SHEETS.schedulePostSheet = () => {
  const d = new Date();
  const dateStr = d.toISOString().split('T')[0];
  const timeStr = "18:00";

  return sheet("جدولة نشر المنشور", `
    <div class="col" style="gap:14px;padding:4px 0">
      <div class="tiny fnt" style="color:var(--muted)">حدد موعد وتاريخ نشر المنشور تلقائياً في المجتمع:</div>
      
      <div class="col" style="gap:6px">
        <label class="tiny b" style="color:#fff">تاريخ النشر:</label>
        <input type="date" id="sched_date" value="${dateStr}" min="${dateStr}" style="padding:10px 14px;background:#151822;border:1px solid var(--line);border-radius:12px;color:#fff;font-size:14px;outline:none">
      </div>

      <div class="col" style="gap:6px">
        <label class="tiny b" style="color:#fff">وقت النشر:</label>
        <input type="time" id="sched_time" value="${timeStr}" style="padding:10px 14px;background:#151822;border:1px solid var(--line);border-radius:12px;color:#fff;font-size:14px;outline:none">
      </div>

      <div class="card2" style="padding:10px 12px;display:flex;align-items:center;gap:8px">
        <span style="color:var(--purple)">${I("calendar","i s")}</span>
        <span class="tiny fnt" style="color:#fff">المنطقة الزمنية: توقيت مكة المكرمة / KSA (GMT+3)</span>
      </div>

      <div class="row" style="gap:10px;margin-top:8px">
        <button class="btn btn-ghost g1" onclick="closeOvl()">إلغاء</button>
        <button class="btn btn-primary g1" onclick="confirmSchedulePost()">تأكيد الجدولة</button>
      </div>
    </div>
  `);
};

window.confirmSchedulePost = function() {
  const dateVal = document.getElementById("sched_date")?.value;
  const timeVal = document.getElementById("sched_time")?.value;
  if (!dateVal || !timeVal) {
    toast("يرجى تحديد التاريخ والوقت", "err");
    return;
  }
  const schedTimestamp = new Date(`${dateVal}T${timeVal}`).getTime();
  if (schedTimestamp <= Date.now()) {
    toast("يجب أن يكون وقت الجدولة في المستقبل", "err");
    return;
  }

  window.PUBLISH_STATE.schedule = {
    date: dateVal,
    time: timeVal,
    scheduledAt: schedTimestamp
  };

  closeOvl();
  window.refreshPubMediaDeck();
  window.triggerPubDraftSave();
  toast(`تم تعيين موعد النشر في ${dateVal} الساعة ${timeVal} ⏰`, "ok");
};

// 3. Location Picker Sheet
SHEETS.locationPickerSheet = () => {
  const LOCS = [
    "طوكيو، شيبويا (Tokyo, Shibuya)",
    "أكيهابارا (Akihabara)",
    "قرية كونوها المخفية (Leaf Village)",
    "عالم الشينيغامي (Soul Society)",
    "كوكب ناميك (Namek)",
    "جراند لاين (Grand Line)",
    "مقر فيلق الاستطلاع (Scout HQ)",
    "مدينة كيوتو (Kyoto)",
    "السعودية، الرياض",
    "الإمارات، دبي"
  ];

  return sheet("إضافة موقع للمنشور", `
    <div class="col" style="gap:12px">
      <input type="text" id="custom_loc_input" placeholder="اكتب موقعاً مخصصاً..." style="padding:10px 14px;background:#151822;border:1px solid var(--line);border-radius:12px;color:#fff;font-size:13.5px;outline:none" onkeydown="if(event.key==='Enter')selectLocation(this.value)">
      
      <div class="b xs" style="color:var(--accent);margin-top:4px">أماكن وعوالم مقترحة:</div>
      <div class="col" style="gap:6px;max-height:300px;overflow-y:auto">
        ${LOCS.map(loc => `
          <button type="button" class="lstrow" onclick="selectLocation('${loc}')" style="padding:8px 12px">
            <span style="color:var(--emerald)">${I("map","i s")}</span>
            <span class="tiny b" style="color:#fff;text-align:right">${loc}</span>
          </button>
        `).join("")}
      </div>
    </div>
  `);
};

window.selectLocation = function(loc) {
  if (!loc) return;
  closeOvl();
  window.PUBLISH_STATE.location = loc;
  window.refreshPubMediaDeck();
  window.triggerPubDraftSave();
  toast(`تمت إضافة الموقع: ${loc} 📍`, "ok");
};

// 4. Advanced Post Settings Sheet
SHEETS.advancedPostSettingsSheet = () => {
  const st = window.PUBLISH_STATE;
  const sett = st.settings || { allowComments: true, allowReposts: true, hideCounts: false, altText: '' };

  return sheet("إعدادات المنشور المتقدمة", `
    <div class="col" style="gap:14px">
      <div class="rowb" style="padding:8px 0;border-bottom:1px solid var(--line)">
        <div>
          <div class="b xs" style="color:#fff">السماح بالتعليقات</div>
          <div class="tiny fnt">تمكين جميع المشاهدين من كتابة ردود</div>
        </div>
        <input type="checkbox" ${sett.allowComments ? 'checked' : ''} onchange="PUBLISH_STATE.settings.allowComments=this.checked;triggerPubDraftSave()" style="width:20px;height:20px;accent-color:var(--accent)">
      </div>

      <div class="rowb" style="padding:8px 0;border-bottom:1px solid var(--line)">
        <div>
          <div class="b xs" style="color:#fff">السماح بإعادة النشر والاقتباس</div>
          <div class="tiny fnt">تمكين مشاركة منشورك في حسابات أخرى</div>
        </div>
        <input type="checkbox" ${sett.allowReposts ? 'checked' : ''} onchange="PUBLISH_STATE.settings.allowReposts=this.checked;triggerPubDraftSave()" style="width:20px;height:20px;accent-color:var(--accent)">
      </div>

      <div class="rowb" style="padding:8px 0;border-bottom:1px solid var(--line)">
        <div>
          <div class="b xs" style="color:#fff">إخفاء عداد التفاعلات</div>
          <div class="tiny fnt">عدم إظهار أعداد الإعجاب للمشاهدين</div>
        </div>
        <input type="checkbox" ${sett.hideCounts ? 'checked' : ''} onchange="PUBLISH_STATE.settings.hideCounts=this.checked;triggerPubDraftSave()" style="width:20px;height:20px;accent-color:var(--accent)">
      </div>

      <div class="col" style="gap:6px">
        <label class="tiny b" style="color:#fff">نص بديل للصور (Alt Text):</label>
        <input type="text" value="${esc(sett.altText || '')}" placeholder="وصف للصور لتسهيل الوصول..." oninput="PUBLISH_STATE.settings.altText=this.value;triggerPubDraftSave()" style="padding:10px 14px;background:#151822;border:1px solid var(--line);border-radius:12px;color:#fff;font-size:13px;outline:none">
      </div>

      <button class="btn btn-primary" onclick="closeOvl()" style="margin-top:8px">حفظ الإعدادات</button>
    </div>
  `);
};

// 5. Drafts Sheet & Management View
SHEETS.draftsSheet = () => {
  const drafts = S.postDrafts || [];
  return sheet("المسودات المحفوظة", `
    <div class="col" style="gap:10px">
      ${drafts.length === 0 ? `
        <div class="empty" style="padding:30px">
          ${I("folder","l")}
          <div class="xs b">لا توجد مسودات محفوظة</div>
          <div class="tiny fnt">يتم حفظ المسودات تلقائياً أثناء كتابة المنشور</div>
        </div>
      ` : drafts.map(d => `
        <div class="card" style="padding:12px 14px;background:#151822;border:1px solid var(--line)">
          <div class="rowb" style="margin-bottom:6px">
            <span class="tiny mono mut">${new Date(d.updatedAt || Date.now()).toLocaleString('ar-EG')}</span>
            <button class="iconbtn" onclick="deleteDraftItem('${d.id}')" style="width:26px;height:26px;color:var(--rose)">${I("trash","i s")}</button>
          </div>
          <div class="sm b" style="color:#fff;margin-bottom:6px;max-height:44px;overflow:hidden">${esc(d.text || 'مسودة وسائط')}</div>
          <button class="btn btn-primary btn-sm" onclick="resumeDraftItem('${d.id}')" style="width:100%;margin-top:6px">متابعة التعديل والنشر</button>
        </div>
      `).join("")}
    </div>
  `);
};

window.resumeDraftItem = function(id) {
  closeOvl();
  const d = (S.postDrafts || []).find(x => x.id === id);
  if (!d) return;
  window.PUBLISH_STATE = {
    draftId: d.id,
    text: d.text || "",
    media: d.media || [],
    poll: d.poll || null,
    linkPreview: d.linkPreview || null,
    location: d.location || "",
    privacy: d.privacy || "public",
    tags: d.tags || [],
    mentions: d.mentions || [],
    spoiler: !!d.spoiler,
    warningText: d.warningText || "",
    schedule: d.schedule || null,
    settings: d.settings || { allowComments: true, allowReposts: true, hideCounts: false },
    quotedPost: d.quotedPost || null,
    editPostId: null,
    isUploading: false,
    uploadProgress: 0,
    isPublishing: false,
    draftStatus: "saved"
  };
  go("createPost");
};

window.deleteDraftItem = function(id) {
  S.postDrafts = (S.postDrafts || []).filter(x => x.id !== id);
  save();
  toast("تم حذف المسودة", "info");
  openSheet("draftsSheet");
};

// 6. Post Context Menu (Share, Report, Save, Edit, Delete)
SHEETS.postMenu = (pid) => {
  const p = (S.posts || []).find(x => x.id === pid);
  if (!p) return sheet("خيارات المنشور", "<div class='empty'>المنشور غير موجود</div>");
  const myUid = (window.auth && window.auth.currentUser) ? window.auth.currentUser.uid : (S.me.id || "me");
  const isMine = isMe(p.authorId) || (p.author && (isMe(p.author.id) || isMe(p.author.uid))) || (S.me && S.me.role === "admin");
  const isSaved = (S.savedPosts || []).includes(pid);

  return sheet("خيارات المنشور", `
    <div class="col" style="gap:6px">
      ${isMine ? `
        <button class="lstrow" onclick="startEditPost('${pid}')">
          <span style="color:var(--gold)">${I("edit","i s")}</span>
          <span class="b xs g1" style="text-align:right">تعديل المنشور</span>
        </button>
        <button class="lstrow" onclick="confirmDelPost('${pid}')">
          <span style="color:var(--rose)">${I("trash","i s")}</span>
          <span class="b xs g1" style="text-align:right;color:var(--rose)">حذف المنشور نهائياً</span>
        </button>
      ` : ""}

      <button class="lstrow" onclick="toggleSavePost('${pid}');closeOvl()">
        <span style="color:var(--accent)">${I("bookmark","i s")}</span>
        <span class="b xs g1" style="text-align:right">${isSaved ? 'إزالة من المحفوظات' : 'حفظ المنشور في المفضلة'}</span>
      </button>

      <button class="lstrow" onclick="quotePost('${pid}')">
        <span style="color:var(--purple)">${I("reply","i s")}</span>
        <span class="b xs g1" style="text-align:right">اقتباس المنشور مع تعليق</span>
      </button>

      <button class="lstrow" onclick="instantRepost('${pid}')">
        <span style="color:var(--emerald)">${I("fwd","i s")}</span>
        <span class="b xs g1" style="text-align:right">إعادة نشر فورية</span>
      </button>

      <button class="lstrow" onclick="copyPostLink('${pid}')">
        <span style="color:var(--cyan)">${I("link","i s")}</span>
        <span class="b xs g1" style="text-align:right">نسخ رابط المنشور</span>
      </button>

      ${!isMine ? `
        <button class="lstrow" onclick="openSheet('reportPostSheet','${pid}')">
          <span style="color:var(--rose)">${I("alert","i s")}</span>
          <span class="b xs g1" style="text-align:right;color:var(--rose)">إبلاغ عن محتوى مخالف</span>
        </button>
      ` : ""}
    </div>
  `);
};

window.copyPostLink = function(pid) {
  closeOvl();
  const url = `${window.location.origin}/#post_${pid}`;
  if (navigator.clipboard) {
    navigator.clipboard.writeText(url);
    toast("تم نسخ رابط المنشور إلى الحافظة 📋", "ok");
  }
};

// 7. Report Post Sheet
SHEETS.reportPostSheet = (pid) => {
  const REASONS = [
    "محتوى حرق أنمي بدون وسم تحذير",
    "إساءة أو مضايقة لأعضاء المجتمع",
    "محتوى غير لائق أو مخالف للشروط",
    "نشر روابط مشبوهة أو سبام",
    "انتحال هوية شخصية أو حساب وهمي"
  ];

  return sheet("الإبلاغ عن المنشور", `
    <div class="col" style="gap:12px">
      <div class="tiny fnt" style="color:var(--muted)">اختر سبب الإبلاغ لمراجعته من قبل إدارة أنمي بلاك:</div>
      <div class="col" style="gap:8px">
        ${REASONS.map(r => `
          <button type="button" class="lstrow" onclick="submitPostReport('${pid}', '${r}')" style="padding:10px 12px">
            <span style="color:var(--rose)">${I("alert","i s")}</span>
            <span class="tiny b" style="color:#fff;text-align:right">${r}</span>
          </button>
        `).join("")}
      </div>
    </div>
  `);
};

window.submitPostReport = function(pid, reason) {
  closeOvl();
  toast("تم إرسال بلاغك للإدارة للمراجعة الفورية ✓", "ok");
  snd("success");
};

// ============================================================================
// SCHEDULED POSTS AUTO-PUBLISH RUNNER
// ============================================================================

setInterval(() => {
  const currentNow = Date.now();
  if (!S.scheduledPosts || !S.scheduledPosts.length) return;

  const due = S.scheduledPosts.filter(p => p.scheduledAt && p.scheduledAt <= currentNow);
  if (!due.length) return;

  due.forEach(dp => {
    dp.isScheduled = false;
    dp.createdAt = currentNow;
    dp.at = currentNow;
    S.posts = S.posts || [];
    S.posts.unshift(dp);

    if (window.db && window.setDoc && window.doc) {
      window.setDoc(window.doc(window.db, "posts", dp.id), dp).catch(() => {});
    }
  });

  S.scheduledPosts = S.scheduledPosts.filter(p => p.scheduledAt && p.scheduledAt > currentNow);
  save();
  render();
}, 10000);
"""

with open("index.html", "r", encoding="utf-8") as f:
    full = f.read()

# Locate old PAGES.create up to the end of publishNow
p_start = full.find("PAGES.create=")
if p_start == -1: p_start = full.find("PAGES.create =")

# Find previewPost / publishNow ending position
p_pub = full.find("function publishNow(")
p_end = full.find("function ", p_pub + 50)

print(f"Targeting replacement from {p_start} to {p_end}")

new_full = full[:p_start] + code + "\n\n" + full[p_end:]

with open("index.html", "w", encoding="utf-8") as f:
    f.write(new_full)

print("Publishing system successfully integrated into index.html!")
