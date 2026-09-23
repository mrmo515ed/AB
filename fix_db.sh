sed -i 's/deleteDoc } from/deleteDoc, enableIndexedDbPersistence } from/' index.html
sed -i '/window.db = getFirestore/a \
  enableIndexedDbPersistence(window.db).catch(e => console.warn("Firestore Persistence:", e));' index.html
