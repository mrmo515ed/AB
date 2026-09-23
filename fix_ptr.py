import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

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
    if (window.debounceRender) {
      window.debounceRender({keepScroll: true});
    } else {
      render();
    }
    toast("تم تحديث البيانات بنجاح", "ok");
    if(el){
      el.style.top="-46px";
      el.style.opacity="0";
      setTimeout(() => el.innerHTML = (window.I ? window.I("refresh", "i s") : ""), 300);
    }
  }, 700);
};
"""

if "window.refreshCurrentPageData =" not in content:
    content = content.replace("let ptrY=null,ptrOn=false;", refresh_func + "\nlet ptrY=null,ptrOn=false;")
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(content)
        print("Fixed PTR func")
