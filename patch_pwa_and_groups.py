with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Update sendGroupMsg to call syncGroupChatMessage and support attachments & media in group rooms
old_sendGroupMsg = '''function sendGroupMsg(id){const g=(S.groups||[]).find(x=>x.id===id);const i=$("#gin");if(!g||!i)return;const t=(i.value||"").trim();if(!t)return;
  if(g.announce&&!g.admins.includes("me")){toast("قروب إعلانات: الكتابة للمشرفين فقط ","err");snd("error");return}
  i.value="";i.style.height="auto";setTimeout(()=>{try{i.focus()}catch(e){}},10);g.msgs.push({id:uid(),uid:"me",text:t,at:now()});save();snd("send");questProgress("q4");
  const b=$("#gbody");if(b){b.insertAdjacentHTML("beforeend",`<div class="msg me" data-ctx="group" style="max-width:88%"><div class="row" style="gap:5px;margin-bottom:3px">${av(S.me,18)}<span class="tiny b" style="color:#fff">أنت</span></div>${linkify(t)}<span class="tm">${hhmm(now())}</span></div>`);b.scrollTop=b.scrollHeight}'''

new_sendGroupMsg = '''function sendGroupMsg(id){const g=(S.groups||[]).find(x=>x.id===id);const i=$("#gin");if(!g||!i)return;const t=(i.value||"").trim();if(!t)return;
  if(g.announce&&!g.admins.includes("me")){toast("قروب إعلانات: الكتابة للمشرفين فقط ","err");snd("error");return}
  i.value="";i.style.height="auto";setTimeout(()=>{try{i.focus()}catch(e){}},10);
  const mid = uid();
  const newMsg = {id: mid, uid: "me", senderId: getChatMyUid(), senderName: S.me.name||"أنا", text: t, at: now(), createdAt: now(), st: 2};
  g.msgs = g.msgs || [];
  g.msgs.push(newMsg);
  g.lastAt = now();
  saveDebounced();
  snd("send");
  questProgress("q4");
  if (typeof syncGroupChatMessage === "function") syncGroupChatMessage(id, newMsg);
  const b=$("#gbody");if(b){b.insertAdjacentHTML("beforeend",`<div class="msg me" data-mid="${mid}" data-ctx="group" style="max-width:88%"><div class="row" style="gap:5px;margin-bottom:3px">${av(S.me,18)}<span class="tiny b" style="color:#fff">أنت</span></div>${linkify(t)}<span class="tm">${hhmm(now())}</span></div>`);b.scrollTop=b.scrollHeight}'''

if old_sendGroupMsg in html:
    html = html.replace(old_sendGroupMsg, new_sendGroupMsg)
    print("✓ Updated sendGroupMsg with real sync")
else:
    print("✗ Could not find old_sendGroupMsg")

# 2. Hook listenGroupMessages in PAGES.groupRoom
old_groupRoom_hdr = '''PAGES.groupRoom=()=>{const g=(S.groups||[]).find(x=>x.id===S.params.id);if(!g){setNav(false);setHdr(backHdr("القروب",""));return emptyState("users","القروب غير موجود","")}
  setNav(false);'''

new_groupRoom_hdr = '''PAGES.groupRoom=()=>{const g=(S.groups||[]).find(x=>x.id===S.params.id);if(!g){setNav(false);setHdr(backHdr("القروب",""));return emptyState("users","القروب غير موجود","")}
  setNav(false);
  setTimeout(() => { if (typeof window.listenGroupMessages === 'function') window.listenGroupMessages(g.id); }, 60);'''

if old_groupRoom_hdr in html:
    html = html.replace(old_groupRoom_hdr, new_groupRoom_hdr)
    print("✓ Hooked listenGroupMessages into PAGES.groupRoom")
else:
    print("✗ Could not find old_groupRoom_hdr")

# 3. Add complete PWA download bundle exporter in downloadApp & pwaSheet
pwa_bundle_func = '''
// Complete PWA Exporter & Offline Package Generator
window.downloadPWABundle = function() {
  toast("جارٍ تجهيز حزمة PWA الكاملة للتحميل...", "info");
  try {
    const manifestStr = JSON.stringify({
      id: "/?source=pwa",
      name: "Anime Black — أنمي بلاك",
      short_name: "أنمي بلاك",
      description: "منصة الأوتاكو الشاملة — أنمي، مانجا، مجتمعات، وقصص في تطبيق واحد",
      start_url: "/?source=pwa",
      scope: "/",
      display: "standalone",
      orientation: "portrait",
      theme_color: "#0a0a0f",
      background_color: "#0a0a0f",
      lang: "ar",
      dir: "rtl",
      icons: [
        { src: "/pwa-192x192.png", sizes: "192x192", type: "image/png", purpose: "any" },
        { src: "/pwa-512x512.png", sizes: "512x512", type: "image/png", purpose: "any" },
        { src: "/pwa-512x512.png", sizes: "512x512", type: "image/png", purpose: "maskable" }
      ]
    }, null, 2);

    // Trigger download of manifest and full html applet
    dl("manifest.json", manifestStr, "application/json");
    setTimeout(() => {
      dl("animeblack-pwa-app.html", "<!DOCTYPE html>\\n" + document.documentElement.outerHTML, "text/html");
      toast("تم تحميل ملفات حزمة PWA الكاملة بنجاح ✓", "ok");
      celebrate("اكتمل تنزيل حزمة PWA!");
    }, 600);
  } catch(e) {
    toast("تعذر تجهيز الملفات: " + e.message, "err");
  }
};
'''

if "window.downloadPWABundle" not in html:
    html = html.replace('function startDL(){', pwa_bundle_func + '\nfunction startDL(){\n')
    print("✓ Added window.downloadPWABundle")

# 4. Enhance PAGES.downloadApp to include PWA download button and one-click install
old_dl_pwa_btn = '''<button class="btn btn-primary btn-lg" style="margin-top:15px" onclick="startDL()">${I("download","i s")} تحميل APK الآن</button>`}'''

new_dl_pwa_btn = '''<div class="row" style="gap:8px;margin-top:15px">
        <button class="btn btn-primary g1" onclick="startDL()">${I("download","i s")} تحميل APK</button>
        <button class="btn btn-sec g1" onclick="window.downloadPWABundle()">${I("cloud","i s")} تنزيل حزمة PWA</button>
      </div>`}'''

if old_dl_pwa_btn in html:
    html = html.replace(old_dl_pwa_btn, new_dl_pwa_btn)
    print("✓ Added PWA download button to PAGES.downloadApp")

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("Updated index.html successfully!")
