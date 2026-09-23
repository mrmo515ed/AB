import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

old_code = """    // Real-time Firestore Sync
    if (window.db && window.setDoc && window.doc) {
      window.setDoc(window.doc(window.db, "posts", newPostId), {
        ...newPost,
        createdAtServer: (window.serverTimestamp ? window.serverTimestamp() : new Date())
      }).catch(err => console.error("Firestore post creation failed:", err));
    }

    toast("تم نشر منشورك بنجاح في مجتمع أنمي بلاك! 🚀", "ok");"""
new_code = """    // Real-time Firestore Sync
    if (typeof syncPostToCloud === 'function') {
      syncPostToCloud(newPost);
    } else if (window.db && window.setDoc && window.doc) {
      window.setDoc(window.doc(window.db, "posts", newPostId), {
        ...newPost,
        createdAtServer: (window.serverTimestamp ? window.serverTimestamp() : new Date())
      }).catch(err => console.error("Firestore post creation failed:", err));
    }

    toast(S.forceOffline || !navigator.onLine ? "تم حفظ المنشور كـ قيد الإرسال وسيتم نشره عند توفر الإنترنت 🚀" : "تم نشر منشورك بنجاح في مجتمع أنمي بلاك! 🚀", "ok");"""

if "syncPostToCloud(newPost)" not in content:
    content = content.replace(old_code, new_code)
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(content)
        print("Patched executePublishPost to use syncPostToCloud")
