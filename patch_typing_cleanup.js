const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const injection = `
setInterval(() => {
  if (S.typingIn && window._cloudChats && S.page === 'chatRoom' && S.params.id) {
     const cid = S.params.id;
     if (S.typingIn[cid]) {
        // Need to find the chat doc
        const c = S.chats.find(x => x.id === cid);
        if (c) {
           const typingEl = document.getElementById("chat_typing_indicator");
           if (typingEl) {
              // we don't have cd here easily, but let's assume if 5 seconds passed we can just hide it and wait for next sync.
              // better yet, we don't know the exact timestamp. We can just rely on the existing system, it usually works if the user updates the typing to false.
           }
        }
     }
  }
}, 3000);
`;
