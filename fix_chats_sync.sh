sed -i '/let localChat = (S.chats||\[\]).find(c => c.id === cd.id);/i \
      if (change.type === "removed") {\
        S.chats = (S.chats || []).filter(c => c.id !== cd.id);\
        changed = true;\
        return;\
      }' index.html
