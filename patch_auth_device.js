const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const injection = `
          // Device Registration
          try {
            let deviceId = localStorage.getItem("animeblack_device_id");
            if (!deviceId) {
                deviceId = "dev_" + Math.random().toString(36).substr(2, 9) + Date.now();
                localStorage.setItem("animeblack_device_id", deviceId);
            }
            const deviceRef = window.doc(window.db, "users", user.uid, "devices", deviceId);
            window.setDoc(deviceRef, {
                deviceId: deviceId,
                userAgent: navigator.userAgent,
                lastActive: Date.now()
            }, { merge: true }).catch(console.error);

            let sessionId = sessionStorage.getItem("animeblack_session_id");
            if (!sessionId) {
                sessionId = "sess_" + Math.random().toString(36).substr(2, 9) + Date.now();
                sessionStorage.setItem("animeblack_session_id", sessionId);
            }
            const sessionRef = window.doc(window.db, "sessions", sessionId);
            window.setDoc(sessionRef, {
                sessionId: sessionId,
                userId: user.uid,
                deviceId: deviceId,
                startTime: Date.now(),
                lastActive: Date.now()
            }, { merge: true }).catch(console.error);
          } catch(e) {
            console.error("Device/Session registration failed", e);
          }
`;

code = code.replace(/await fetchAndHydrateUserState\(user\.uid\)\.catch\(\(\)=>\{\}\);/, 
  `await fetchAndHydrateUserState(user.uid).catch(()=>{});` + injection);

fs.writeFileSync('index.html', code);
console.log("Success adding device registration");
