const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');
const target = 'onscroll="const f=document.getElementById(\\'msgfab\\');if(f)f.style.display=(this.scrollHeight-this.scrollTop-this.clientHeight>240)?\\'flex\\':\\'none\\'"';
const replacement = 'onscroll="const f=document.getElementById(\\'msgfab\\');if(f)f.style.display=(this.scrollHeight-this.scrollTop-this.clientHeight>240)?\\'flex\\':\\'none\\'; if(this.scrollTop < 100 && typeof window.loadOlderChatMessages === \\'function\\') window.loadOlderChatMessages(\\'${c.id}\\');"';
code = code.replace(target, replacement);
fs.writeFileSync('index.html', code);
console.log("Success");
