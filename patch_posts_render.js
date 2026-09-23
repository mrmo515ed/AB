const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const oldLogic = `      if (hasRemoteAdds || hasRemoteMods) {
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
      }`;

const newLogic = `      if (hasRemoteAdds || hasRemoteMods) {
        const pageEl = document.getElementById("page");
        const activeEl = document.activeElement;
        const isSafeToRender = !activeEl || (activeEl.tagName !== "INPUT" && activeEl.tagName !== "TEXTAREA" && !activeEl.isContentEditable);
        
        if (isSafeToRender) {
          if (hasRemoteMods) {
            debounceRender({ keepScroll: true });
          } else if (hasRemoteAdds) {
            if (pageEl && pageEl.scrollTop < 60 && S.page === "home") {
               debounceRender({ keepScroll: true });
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
        } else {
           window._deferredRender = true;
           if(hasRemoteAdds && pageEl && pageEl.scrollTop >= 60) {
              S.hasNewPosts = true;
           }
        }
      }`;

code = code.replace(oldLogic, newLogic);
fs.writeFileSync('index.html', code);
console.log("Posts snapshot render patched");
