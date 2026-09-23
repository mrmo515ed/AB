import re

with open('index.html', 'r', encoding='utf-8') as f:
    code = f.read()

print("Original code length:", len(code))

# 1. FIX TOAST: suppress mundane button-click toasts
# Target: function toast(msg,type="",undoFn){
toast_target = 'function toast(msg,type="",undoFn){'
toast_replacement = 'function toast(msg,type="",undoFn){\n  if(type !== "err" && !undoFn) return;\n'
if toast_target in code:
    code = code.replace(toast_target, toast_replacement, 1)
    print("1. Toast patched successfully.")
else:
    print("1. Toast target NOT found!")

# 2. REMOVE #homeFab from HTML
fab_html_pattern = r'<button id="homeFab"[^>]*>[\s\S]*?</button>'
m = re.search(fab_html_pattern, code)
if m:
    code = code[:m.start()] + code[m.end():]
    print("2. #homeFab removed from HTML.")
else:
    print("2. #homeFab HTML NOT found!")

# 3. FIX setNav and introduce MAIN_NAV_PAGES and updateNavVisibility
# Let's inspect setNav target
setnav_pattern = r'function setNav\(on\)\{[\s\S]*?if\(fab\)\{\s*fab\.style\.display=\(S\.page==="home"\)\?"flex":"none";\s*\}\s*\}'
m = re.search(setnav_pattern, code)
if m:
    replacement = """const MAIN_NAV_PAGES = new Set(["home", "explore", "reels", "chat", "more"]);

function updateNavVisibility(forceOn){
  const isMain = (forceOn !== undefined) ? !!forceOn : MAIN_NAV_PAGES.has(S.page);
  setNav(isMain);
  const p = $("#page");
  if(p){
    if(isMain) p.classList.add("has-nav");
    else p.classList.remove("has-nav");
  }
}

function setNav(on){
  const nav = $("#nav");
  if(!nav) return;
  if(!on){
    nav.style.display = "none";
    return;
  }
  nav.style.display = "flex";
  const L = (ar, en) => S.langEn ? en : ar;
  const items = [
    ["home", "home", L("الرئيسية", "Home")],
    ["explore", "compass", L("استكشف", "Explore")],
    ["reels", "clapper", L("الريلز", "Reels")],
    ["chat", "chat", L("الرسائل", "Chats")],
    ["more", "more", L("المزيد", "More")]
  ];
  nav.innerHTML = items.map(([k, ic, lb]) => {
    const isActive = (S.page === k) || (S.activeTab === k && MAIN_NAV_PAGES.has(S.page));
    return `    <button class="${isActive ? "on" : ""}" onclick="tab('${k}')" ${k==="home"?`onpointerdown="navLPStart(event)" onpointerup="navLPEnd()" onpointerleave="navLPEnd()"`:""}>      ${k==="home"&&S.hasNewPosts?`<span class="ping"></span>`:""}      ${I(ic)}      <span class="ndot"></span>      <span>${lb}</span>    </button>`;
  }).join("");
}"""
    code = code[:m.start()] + replacement + code[m.end():]
    print("3. setNav and updateNavVisibility patched successfully.")
else:
    print("3. setNav pattern NOT matched, trying alternative...")
    # Let's check why

# 4. FIX render() to preserve scroll and call updateNavVisibility
render_pattern = r'function render\(\)\{\s*const fn=PAGES\[S\.page\];[\s\S]*?ariaPass\(\);(?:\s*const fab=\$\("#homeFab"\);[\s\S]*?none";)?'
m = re.search(render_pattern, code)
if m:
    render_replacement = """function render(opts = {}){
  const p = $("#page");
  const shouldKeep = (opts && opts.keepScroll !== undefined) ? opts.keepScroll : true;
  const prevScroll = (p && shouldKeep) ? p.scrollTop : 0;

  if (typeof updateNavVisibility === "function") {
    updateNavVisibility();
  }

  const fn = PAGES[S.page];
  if(!fn){
    if(p) p.innerHTML = emptyState("alert","صفحة غير معروفة: "+S.page,"");
    return;
  }
  try{
    if(p) {
      p.innerHTML = fn();
      if(prevScroll > 0) {
        p.scrollTop = prevScroll;
      }
    }
  }catch(e){
    if(p) p.innerHTML=`<div class="pad"><div class="card" style="padding:14px;border-color:rgba(244,63,94,.4)">    <div class="b sm" style="color:var(--rose)">${I("alert","i s")} خطأ في عرض الصفحة: ${esc(S.page)}</div>    <div class="mono tiny" style="margin-top:8px;color:var(--muted);white-space:pre-wrap">${esc(e.message)}</div>    <button class="btn btn-primary btn-sm" style="margin-top:11px" onclick="go('home')">العودة للرئيسية</button></div></div>`;
    console.error(e);
  }
  ariaPass();"""
    code = code[:m.start()] + render_replacement + code[m.end():]
    print("4. render() patched with scroll preservation and auto nav.")
else:
    print("4. render() pattern NOT matched!")

# 5. FIX go(page, params, push) to pass keepScroll: false
go_old = 'S.page=page;S.params=params||{};  render();save();'
go_new = 'S.page=page;S.params=params||{};  render({keepScroll:false});save();'
if go_old in code:
    code = code.replace(go_old, go_new, 1)
    print("5. go() patched with keepScroll: false.")
else:
    print("5. go() target NOT found!")

# 6. FIX window._usersSub removing rogue render()
users_sub_old = 'S.users = Object.values(window._cloudUsers);          render();        }, (e) => console.error(e));'
users_sub_new = 'S.users = Object.values(window._cloudUsers);          /* silent sync, no rogue page reload */        }, (e) => console.error(e));'
if users_sub_old in code:
    code = code.replace(users_sub_old, users_sub_new, 1)
    print("6. window._usersSub render() removed successfully.")
else:
    print("6. window._usersSub target NOT found!")

# 7. FIX postsQuery onSnapshot to do surgical DOM updates and avoid blind re-render
pq_pattern = r'const postsQuery = window\.query\(window\.collection\(window\.db, \'posts\'\)\);[\s\S]*?if \(\[\'home\', \'explore\', \'profile\', \'postDetail\', \'comments\'\]\.includes\(S\.page\)\) render\(\);\s*\}\s*\}\s*\}, \(e\) => console\.error\("Firestore posts sync:", e\)\);'
m = re.search(pq_pattern, code)
if m:
    pq_replacement = """const postsQuery = window.query(window.collection(window.db, 'posts'));
  window.onSnapshot(postsQuery, (snap) => {
    const livePosts = snap.docs.map(d => {
      const data = d.data();
      if(!data || !data.id) return null;
      const isLiked = data.likedUsers && Array.isArray(data.likedUsers) && data.likedUsers.some(u => isMe(u.id || u.uid || u));
      const existing = (S.posts || []).find(x => x.id === data.id);
      return Object.assign({}, existing || {}, data, {
        pending: d.metadata.hasPendingWrites,
        liked: (isLiked !== undefined) ? isLiked : (existing ? !!existing.liked : false)
      });
    }).filter(Boolean);

    if (livePosts.length > 0) {
      const postMap = {};
      livePosts.forEach(p => { postMap[p.id] = Object.assign(postMap[p.id] || {}, p); });
      const merged = Object.values(postMap);
      merged.sort((a, b) => (b.createdAt || b.at || 0) - (a.createdAt || a.at || 0));
      S.posts = merged;
      window._cloudPosts = livePosts;
      save();

      // Surgical DOM updates for like count and states without page flickering
      snap.docChanges().forEach(change => {
        const d = change.doc.data();
        if(!d || !d.id) return;
        const pid = d.id;
        const cntBtn = document.getElementById("likes_cnt_" + pid);
        if (cntBtn && d.likes !== undefined) {
          cntBtn.textContent = nfmt(d.likes) + " إعجاب";
        }
        const likeBtn = document.getElementById("like_" + pid);
        if (likeBtn && d.likedUsers) {
          const isLiked = d.likedUsers.some(u => isMe(u.id || u.uid || u));
          if (isLiked) {
            likeBtn.classList.add("on", "liked");
            likeBtn.style.color = "var(--rose)";
            likeBtn.innerHTML = `${IF("heart","i s")} <span>${T("أعجبني")}</span>`;
          } else {
            likeBtn.classList.remove("on", "liked");
            likeBtn.style.color = "";
            likeBtn.innerHTML = `${I("heart","i s")} <span>${T("إعجاب")}</span>`;
          }
        }
      });

      // If remote new post was added and we are idling at the top of feed, update cleanly
      const hasRemoteAdds = snap.docChanges().some(c => c.type === "added" && !c.doc.metadata.hasPendingWrites);
      if (hasRemoteAdds) {
        const pageEl = document.getElementById("page");
        if (pageEl && pageEl.scrollTop < 60 && S.page === "home") {
          render({ keepScroll: true });
        } else {
          S.hasNewPosts = true;
          const homeNavBtn = document.querySelector("#nav button");
          if (homeNavBtn && !homeNavBtn.querySelector(".ping")) {
            const sp = document.createElement("span");
            sp.className = "ping";
            homeNavBtn.insertBefore(sp, homeNavBtn.firstChild);
          }
        }
      }
    }
  }, (e) => console.error("Firestore posts sync:", e));"""
    code = code[:m.start()] + pq_replacement + code[m.end():]
    print("7. postsQuery patched with surgical updates.")
else:
    print("7. postsQuery pattern NOT matched!")

# 8. FIX toggleLike to prevent duplicate likes and card event bubbling
tl_old = 'onclick="toggleLike(\'${p.id}\')"'
tl_new = 'onclick="event.stopPropagation();toggleLike(\'${p.id}\',event)"'
if tl_old in code:
    code = code.replace(tl_old, tl_new)
    print("8. toggleLike stopPropagation added in postCard.")
else:
    print("8. toggleLike postCard button NOT found!")

tl_def_old = 'function toggleLike(pid){'
tl_def_new = 'function toggleLike(pid,ev){\n  if(ev && ev.stopPropagation) ev.stopPropagation();'
if tl_def_old in code:
    code = code.replace(tl_def_old, tl_def_new, 1)
    print("8b. toggleLike definition updated with event handling.")
else:
    print("8b. toggleLike definition NOT found!")

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(code)

print("Updated index.html length:", len(code))
