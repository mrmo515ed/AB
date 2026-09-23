import re

with open('index.html', 'r', encoding='utf-8') as f:
    code = f.read()

logout_target = """function logout(){
  if(window.auth && window.signOut){
    try{ window.signOut(window.auth); }catch(e){}
  }
  S.user=null;
  S.activeChat=null;
  save();
  go("login",{},false);
  toast("تم تسجيل الخروج بنجاح","info");
}"""

logout_replacement = """function logout(){
  if(window.auth && window.signOut){
    try{ window.signOut(window.auth); }catch(e){}
  }
  try{ localStorage.removeItem(KEY); }catch(e){}
  try{ if(typeof abDB !== "undefined" && abDB.del) abDB.del(KEY); }catch(e){}
  window.location.reload();
}"""

code = code.replace(logout_target, logout_replacement)

auth_target = """  window.onAuthStateChanged(window.auth, (user) => {
    if (user) {"""

auth_replacement = """  window.onAuthStateChanged(window.auth, (user) => {
    if (user) {
      if (S.me && S.me.uid && S.me.uid !== user.uid) {
         console.warn("Account switch detected. Wiping previous user local data.");
         try{ localStorage.removeItem(KEY); }catch(e){}
         try{ if(typeof abDB !== "undefined" && abDB.del) abDB.del(KEY); }catch(e){}
         window.location.reload();
         return;
      }"""

code = code.replace(auth_target, auth_replacement)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(code)
print("Done")
