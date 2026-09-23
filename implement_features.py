import re

def modify_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Update pull-to-refresh touchstart
    ptr_start_old = 'ptrY=(S.page==="home"&&pg&&pg.scrollTop<=4&&e.touches[0].clientY)||null;'
    ptr_start_new = 'ptrY=(pg&&pg.scrollTop<=4&&e.touches[0].clientY)||null;'
    content = content.replace(ptr_start_old, ptr_start_new)

    # 2. Update pull-to-refresh touchend
    ptr_end_old = """document.addEventListener("touchend",()=>{if(ptrOn){const el=$("#ptr");if(el){el.style.top="-46px";el.style.opacity="0"}ptrOn=false;render();toast("تم تحديث الخلاصة ","ok")}ptrY=null},{passive:true});"""
    ptr_end_new = """document.addEventListener("touchend",()=>{if(ptrOn){window.refreshCurrentPageData();}ptrY=null},{passive:true});"""
    content = content.replace(ptr_end_old, ptr_end_new)

    # Add refreshCurrentPageData if not exists
    if "window.refreshCurrentPageData" not in content:
        refresh_func = """
window.refreshCurrentPageData = function() {
  const el = document.getElementById("ptr");
  if(el){
    el.style.top="20px";
    el.style.opacity="1";
    el.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite;"><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke-opacity="0.2"/><path d="M21 12a9 9 0 01-9 9" stroke-linecap="round"/></svg>`;
  }
  setTimeout(() => {
    if (window.fetchNewPosts && S.page === "home") {
        window.fetchNewPosts();
    }
    render();
    toast("تم تحديث البيانات بنجاح", "ok");
    if(el){
      el.style.top="-46px";
      el.style.opacity="0";
      setTimeout(() => el.innerHTML = (window.I ? window.I("refresh", "i s") : ""), 300);
    }
  }, 700);
};
"""
        # Inject it after ptrOn declaration
        content = content.replace('let ptrY=null,ptrOn=false;', 'let ptrY=null,ptrOn=false;' + refresh_func)

    # 3. Add global sync for posts modifying
    # Locate where hasRemoteAdds is used for posts
    posts_sync_pattern = r'const hasRemoteAdds = snap\.docChanges\(\)\.some\(c => c\.type === "added" && !c\.doc\.metadata\.hasPendingWrites\);(.*?)}'
    
    # We will replace it with a broader check
    posts_sync_replacement = """const hasRemoteAdds = snap.docChanges().some(c => c.type === "added" && !c.doc.metadata.hasPendingWrites);
      const hasRemoteMods = snap.docChanges().some(c => (c.type === "modified" || c.type === "removed") && !c.doc.metadata.hasPendingWrites);
      if (hasRemoteAdds || hasRemoteMods) {
        const pageEl = document.getElementById("page");
        if (pageEl && pageEl.scrollTop < 60 && S.page === "home") {
          debounceRender({ keepScroll: true });
        } else if (hasRemoteMods && ['postDetail', 'profile'].includes(S.page)) {
          debounceRender({ keepScroll: true });
        } else if (hasRemoteAdds) {
          S.hasNewPosts = true;
          const homeNavBtn = document.querySelector("#nav button");
          if (homeNavBtn && !homeNavBtn.querySelector(".ping")) {
            const sp = document.createElement("span");
            sp.className = "ping";
            homeNavBtn.insertBefore(sp, homeNavBtn.firstChild);
          }
        }
      }"""
    # Use re.sub to inject this
    content = re.sub(r'const hasRemoteAdds = snap\.docChanges\(\)\.some\(c => c\.type === "added" && !c\.doc\.metadata\.hasPendingWrites\);.*?(?=\s*}\s*},\s*\(e\) => console\.error\("Firestore posts sync)', posts_sync_replacement, content, flags=re.DOTALL)


    # 4. Fix chat sync
    # When changes happen in chats, we want to re-render if we are in 'chat' page, but if it's unread, etc.
    # The existing chat sync does this: if(S.page === 'chat') render();
    # Let's make it debounceRender({ keepScroll: true })
    content = content.replace("if(S.page === 'chat') render();", "if(S.page === 'chat') debounceRender({keepScroll:true});")

    # 5. Add notifications onSnapshot
    # We will insert it inside the window.onAuthStateChanged where user is authenticated, or globally.
    # Let's insert globally and use query(..., where("userId", "==", myUid))? 
    # But wait, myUid changes. Better to add inside onAuthStateChanged.
    auth_state_pattern = r'window\.onAuthStateChanged\(window\.auth, \(user\) => {\s*if \(user\) \{'
    
    notif_sync_injection = """window.onAuthStateChanged(window.auth, (user) => {
    if (user) {
      if (!window._notifSub) {
        const notifQuery = window.query(window.collection(window.db, 'notifications'), window.where('userId', '==', user.uid));
        window._notifSub = window.onSnapshot(notifQuery, (snap) => {
          const liveNotifs = snap.docs.map(d => d.data());
          liveNotifs.sort((a,b) => (b.at||0) - (a.at||0));
          S.notifs = liveNotifs;
          saveLocalOnly();
          if (['notifications', 'home'].includes(S.page)) debounceRender({ keepScroll: true });
          
          // Show toast for newly added unread notification if it's recent
          snap.docChanges().forEach(change => {
            if (change.type === "added" && !change.doc.metadata.hasPendingWrites) {
               const nd = change.doc.data();
               if (!nd.read && (Date.now() - (nd.at || 0) < 60000)) {
                  toast("إشعار جديد: " + (nd.title || "تنبيه"), "info");
                  snd("notif");
               }
            }
          });
        }, e => console.warn("Notif sync:", e));
      }
"""
    if "window._notifSub" not in content:
        content = re.sub(auth_state_pattern, notif_sync_injection, content, count=1)

    # Write back
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

modify_file('index.html')
