const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const regex = /let _saveTo;[\s\S]*?\}catch\(e3\)\{\}\}\nlet _saveTo;\nfunction saveDebounced\(\)\{\n  clearTimeout\(_saveTo\);\n  _saveTo = setTimeout\(save, 1000\);\n\}\n\}\nfunction save\(immediate = false\)\{/;

const replacement = `let _saveTo;
function saveSync(){
  // 1. Asynchronously persist complete full state into IndexedDB (Unlimited quota)
  try{
    if(typeof abDB !== "undefined" && abDB.set){
      abDB.set(KEY, S);
    }
  }catch(e){}

  // 2. Safely persist quota-protected state to localStorage
  if(typeof localStorage === "undefined") return;

  // Level 0: Standard quota-safe snapshot
  try{
    const payload0 = safeStr(prepareStateForLocalStorage(S, 0));
    localStorage.setItem(KEY, payload0);
    return;
  }catch(e0){}

  // Level 1: Aggressive compression
  try{
    const payload1 = safeStr(prepareStateForLocalStorage(S, 1));
    localStorage.setItem(KEY, payload1);
    return;
  }catch(e1){}

  // Level 2: Essential core state only (auth, profile, theme, balance, queues)
  try{
    const payload2 = safeStr(prepareStateForLocalStorage(S, 2));
    localStorage.setItem(KEY, payload2);
    return;
  }catch(e2){}

  // Level 3: Cleanup old storage keys and retry Level 2
  try{
    cleanupOldStorageKeys();
    const payload3 = safeStr(prepareStateForLocalStorage(S, 2));
    localStorage.setItem(KEY, payload3);
  }catch(e3){}
}
function save(immediate = false){`;

if(code.match(regex)) {
    code = code.replace(regex, replacement);
    fs.writeFileSync('index.html', code);
    console.log("Success");
} else {
    console.log("Regex didn't match.");
}
