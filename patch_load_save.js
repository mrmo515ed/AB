const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

// Modify saveSync
let newSaveSync = `function saveSync(syncServer = true){
  const activeKey = getUserStorageKey();
  KEY = activeKey;
  
  try{
    if(S.me && S.me.uid && S.me.uid !== "me" && !String(S.me.uid).startsWith("temp_")){
      localStorage.setItem("animeblack_last_active_uid", S.me.uid);
    }
  }catch(e){}

  if(typeof abDB !== "undefined" && abDB.set){
    abDB.set(activeKey, JSON.parse(JSON.stringify(S))).catch(()=>{}); // clone to avoid reference issues
  }

  if(typeof localStorage !== "undefined"){
    try{
      const payload0 = safeStr(prepareStateForLocalStorage(S, 0));
      localStorage.setItem(activeKey, payload0);
    }catch(e0){
      try{
        const payload1 = safeStr(prepareStateForLocalStorage(S, 1));
        localStorage.setItem(activeKey, payload1);
      }catch(e1){
        try{
          cleanupOldStorageKeys();
          const payload2 = safeStr(prepareStateForLocalStorage(S, 2));
          localStorage.setItem(activeKey, payload2);
        }catch(e2){}
      }
    }
  }

  if(syncServer) syncUserStateToServer(false);
}`;
code = code.replace(/function saveSync\(syncServer = true\)\{[\s\S]*?if\(syncServer\) syncUserStateToServer\(false\);\n\}/, newSaveSync);

// Modify load
let newLoad = `function load(targetUid){
  let loaded = false;
  const uidToLoad = targetUid || (function(){
    try{ return localStorage.getItem("animeblack_last_active_uid"); }catch(e){ return null; }
  })() || (window.auth && window.auth.currentUser && window.auth.currentUser.uid);

  const activeKey = getUserStorageKey(uidToLoad);
  KEY = activeKey;

  try{
    let r = localStorage.getItem(activeKey);
    if(!r && activeKey !== LEGACY_STORAGE_KEY){
      r = localStorage.getItem(LEGACY_STORAGE_KEY);
    }
    if(r){
      const p = JSON.parse(r);
      S = Object.assign(seed(), p);
      ensureStateArrays(S);
      if(!S.wiki || !S.wiki.anime || S.wiki.anime.length < 40){
        S.wiki = S.wiki || {};
        S.wiki.anime = seed().wiki.anime;
      }
      if(!S.wiki || !S.wiki.chars || S.wiki.chars.length < 50){
        S.wiki = S.wiki || {};
        S.wiki.chars = seed().wiki.chars;
      }
      if(!S.animeReviews) S.animeReviews = seed().animeReviews || {};
      if(!S.charVotes) S.charVotes = {};
      if(!S.myCustomStickers) S.myCustomStickers = [];
      if(S.me) S.me = Object.assign({}, seed().me, S.me);
      
      if(S.me && (S.me.id === "me" || !S.me.id) && uidToLoad && uidToLoad !== "me" && uidToLoad !== "guest"){
          S.me.id = uidToLoad;
          S.me.uid = uidToLoad;
      } else if(S.me && (S.me.id === "me" || !S.me.id)){
        const realId = getMyUid();
        S.me.id = realId;
        S.me.uid = realId;
      }
      loaded = true;
    }
  }catch(e){}

  if(!loaded){
    if(!S) S = window.S = seed();
    ensureStateArrays(S);
    if(uidToLoad && uidToLoad !== "me" && uidToLoad !== "guest"){
       S.me.id = uidToLoad;
       S.me.uid = uidToLoad;
    }
  }

  // Hydrate richer offline data from IndexedDB
  try{
    if(typeof abDB !== "undefined" && abDB.get){
      abDB.get(activeKey).then(idbState => {
        if(!idbState && activeKey !== LEGACY_STORAGE_KEY){
          return abDB.get(LEGACY_STORAGE_KEY);
        }
        return idbState;
      }).then(idbState => {
        if(idbState && typeof idbState === "object"){
          if(idbState.posts && idbState.posts.length > 0) S.posts = idbState.posts;
          if(idbState.chats && idbState.chats.length > 0) S.chats = idbState.chats;
          if(idbState.stories && idbState.stories.length > 0) S.stories = idbState.stories;
          if(idbState.reels && idbState.reels.length > 0) S.reels = idbState.reels;
          if(idbState.myCustomStickers && idbState.myCustomStickers.length > 0) S.myCustomStickers = idbState.myCustomStickers;
          if(idbState.me) S.me = Object.assign(S.me || {}, idbState.me);
        }
        ensureStateArrays(S);
      }).catch(()=>{});
    }
  }catch(e){}

  if(uidToLoad && uidToLoad !== "me" && !uidToLoad.startsWith("u_") && !uidToLoad.startsWith("alt_")){
    setTimeout(() => {
      fetchAndHydrateUserState(uidToLoad).then(res => {
        if(res && res.uData) debounceRender();
      });
    }, 150);
  }

  return loaded;
}`;
code = code.replace(/function load\(targetUid\)\{[\s\S]*?return loaded;\n\}/, newLoad);

// Modify PAGES.chatRoom to include the sync indicator
let chatRoomIndicator = `
    \${(()=>{
      const pendingCount = (S.pendingMsgs || []).filter(x => x.cid === c.id).length;
      if(pendingCount > 0) {
        return \`<div id="chat_sync_indicator" class="row center" style="gap:6px;padding:6px;background:rgba(245, 158, 11, 0.1);color:var(--gold);font-size:11px;border-bottom:1px solid var(--line);flex-shrink:0"><span class="spin" style="width:12px;height:12px;border:2px solid currentColor;border-top-color:transparent;border-radius:50%"></span> جارٍ المزامنة (\${pendingCount} في الانتظار)...</div>\`;
      }
      return "";
    })()}
    <div class="chatbody no-sb" id="msgs"`;
code = code.replace(/<div class="chatbody no-sb" id="msgs"/, chatRoomIndicator);

fs.writeFileSync('index.html', code);
console.log('Patch applied successfully.');
