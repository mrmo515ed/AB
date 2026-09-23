import re

with open("index.html", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add Firebase Storage imports and initialization in module script if not present
storage_import_check = "from \"https://www.gstatic.com/firebasejs/10.10.0/firebase-storage.js\""
if storage_import_check not in content:
    old_mod = 'import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";'
    new_mod = old_mod + '\n  import { getStorage, ref, uploadBytes, uploadBytesResumable, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-storage.js";\n  window.getStorage = getStorage;\n  window.ref = ref;\n  window.uploadBytes = uploadBytes;\n  window.uploadBytesResumable = uploadBytesResumable;\n  window.getDownloadURL = getDownloadURL;\n  window.deleteObject = deleteObject;'
    if old_mod in content:
        content = content.replace(old_mod, new_mod, 1)
        print("Added Firebase Storage module imports")

    old_auth_init = "window.auth = getAuth(app);"
    new_auth_init = "window.auth = getAuth(app);\n  try { window.storage = getStorage(app); } catch (e) { console.warn('Storage init fallback:', e); }"
    if old_auth_init in content:
        content = content.replace(old_auth_init, new_auth_init, 1)
        print("Initialized window.storage")

with open("index.html", "w", encoding="utf-8") as f:
    f.write(content)

print("Stage 1 completed successfully.")
