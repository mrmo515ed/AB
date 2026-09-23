import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

render_func_old = """function render(opts = {}){
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
    }"""

render_func_new = """function render(opts = {}){
  const p = $("#page");
  const msgBox = document.getElementById("msgs");
  const shouldKeep = (opts && opts.keepScroll !== undefined) ? opts.keepScroll : true;
  const prevScroll = (p && shouldKeep) ? p.scrollTop : 0;
  const prevMsgScroll = (msgBox && shouldKeep) ? msgBox.scrollTop : -1;
  
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
      if(prevMsgScroll !== -1) {
        const newMsgBox = document.getElementById("msgs");
        if(newMsgBox) newMsgBox.scrollTop = prevMsgScroll;
      }
    }"""

if "prevMsgScroll" not in content:
    content = content.replace(render_func_old, render_func_new)
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(content)
        print("Fixed render() scroll preservation for chat!")
