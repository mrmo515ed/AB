const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const updateChatSyncIndicatorStr = `window.updateChatSyncIndicator = function(cid) {
  const ind = document.getElementById("chat_sync_indicator");
  if(!ind) return;
  const pendingCount = (S.pendingMsgs || []).filter(x => x && x.cid === cid).length;
  if(pendingCount > 0) {
    ind.style.display = "flex";
    ind.innerHTML = \\\`<span class="spin" style="width:12px;height:12px;border:2px solid currentColor;border-top-color:transparent;border-radius:50%"></span> جارٍ المزامنة (\\\${pendingCount} في الانتظار)...\\\`;
    ind.style.background = "rgba(245, 158, 11, 0.1)";
    ind.style.color = "var(--gold)";
  } else {
    ind.innerHTML = \\\`\${I("check","i s")} تمت المزامنة بنجاح\\\`;
    ind.style.background = "rgba(16, 185, 129, 0.1)";
    ind.style.color = "var(--emerald)";
    setTimeout(() => { 
       if((S.pendingMsgs || []).filter(x => x && x.cid === cid).length === 0) {
          ind.style.display = "none"; 
       }
    }, 2000);
  }
};
`;

code = code.replace(/function syncChatMessage\(cid, msgObj\)\{/, updateChatSyncIndicatorStr + '\nfunction syncChatMessage(cid, msgObj){');

code = code.replace(/saveDebounced\(\);\n  if\(isOffline\)/, 'saveDebounced();\n  if(typeof window.updateChatSyncIndicator === "function") window.updateChatSyncIndicator(cid);\n  if(isOffline)');

code = code.replace(/S\.pendingMsgs = \(S\.pendingMsgs \|\| \[\]\)\.filter\(x => x && x\.mid !== msgObj\.id\);\n          saveDebounced\(\);/, 'S.pendingMsgs = (S.pendingMsgs || []).filter(x => x && x.mid !== msgObj.id);\n          saveDebounced();\n          if(typeof window.updateChatSyncIndicator === "function") window.updateChatSyncIndicator(cid);');

fs.writeFileSync('index.html', code);
console.log('Patch applied successfully.');
