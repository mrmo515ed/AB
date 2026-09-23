import re

with open('index.html', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Optimize render debouncing
debounce_target = """let _renderTo;
function debounceRender(opts) {
  clearTimeout(_renderTo);
  _renderTo = setTimeout(() => { render(opts); }, 500);
}"""

debounce_replacement = """let _renderTo;
let _renderRequested = false;
let _lastRenderTime = 0;
function debounceRender(opts = {}) {
  // Ultra-fast requestAnimationFrame based batching instead of slow timeouts
  if (_renderRequested) return;
  _renderRequested = true;
  
  const now = performance.now();
  const timeSinceLastRender = now - _lastRenderTime;
  
  // If we just rendered, wait a tiny bit (16ms = 1 frame)
  // If we haven't rendered recently, do it on the next frame immediately
  const delay = timeSinceLastRender < 30 ? 16 : 0;
  
  setTimeout(() => {
    requestAnimationFrame(() => {
      _renderRequested = false;
      _lastRenderTime = performance.now();
      render(opts);
    });
  }, delay);
}"""
code = code.replace(debounce_target, debounce_replacement)

# 2. Add fast-path local sync skipping for typing indicators and minor updates
on_snapshot_target = """        if (S.page === "chatRoom" && S.params && S.params.id === c.id) {
          S.chatMsgs = [...messages];
          S.chatInfo = c;"""

on_snapshot_replacement = """        if (S.page === "chatRoom" && S.params && S.params.id === c.id) {
          const isOnlyTypingChange = S.chatInfo && 
               JSON.stringify(S.chatInfo.typing) !== JSON.stringify(c.typing) && 
               S.chatMsgs.length === messages.length;
               
          S.chatMsgs = [...messages];
          S.chatInfo = c;
          
          if (isOnlyTypingChange) {
             // Only update typing indicator DOM directly instead of full render
             const typeEl = document.getElementById("typing_indicator");
             if(typeEl) {
                const typingUsers = Object.entries(c.typing || {}).filter(([uid, status]) => status && uid !== S.user.uid).map(([uid]) => ((S.users||[]).find(u => u.uid === uid)||{}).name || 'شخص ما');
                if(typingUsers.length > 0) {
                   typeEl.innerHTML = `<div class="pill mut" style="background:rgba(0,0,0,0.4);border-color:transparent;backdrop-filter:blur(8px);font-size:10px;padding:3px 8px;border-radius:6px;animation:pulse 1.5s infinite"><span style="color:var(--accent);margin-left:4px">●</span> ${typingUsers.join(', ')} يكتب...</div>`;
                   typeEl.style.display = 'block';
                } else {
                   typeEl.style.display = 'none';
                }
             }
             return; // Skip full render
          }"""
code = code.replace(on_snapshot_target, on_snapshot_replacement)


with open('index.html', 'w', encoding='utf-8') as f:
    f.write(code)
print("Done")
