const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const guard = `  if (!window.auth || !window.auth.currentUser) { toast('يرجى تسجيل الدخول أولاً', 'error'); return go('login'); }\n`;

// toggleLike
html = html.replace(/function toggleLike\(pid,ev\)\{/, "function toggleLike(pid,ev){\n" + guard);

// submitComment
html = html.replace(/function submitComment\(\)\s*\{/, "function submitComment() {\n" + guard);

// sendMsg / window._unifiedSendMsg
html = html.replace(/window\._unifiedSendMsg = function\(cid\) \{/, "window._unifiedSendMsg = function(cid) {\n" + guard);

// executePublishPost
html = html.replace(/function executePublishPost\(\)\s*\{/, "function executePublishPost() {\n" + guard);

// submitFeedback / submitNews / publishReel / createGroup
html = html.replace(/function submitFeedback\(\)\s*\{/, "function submitFeedback() {\n" + guard);
html = html.replace(/function publishReel\(\)\s*\{/, "function publishReel() {\n" + guard);
html = html.replace(/function saveGroup\(\)\s*\{/, "function saveGroup() {\n" + guard);
html = html.replace(/function saveWorld\(\)\s*\{/, "function saveWorld() {\n" + guard);

fs.writeFileSync('index.html', html);
console.log("Auth guards added.");
