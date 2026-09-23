const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const injection = `
  // Remove deleted messages from DOM
  msgBox.querySelectorAll('.msg[id^="m_"]').forEach(el => {
     if(!c.messages.find(m => "m_" + m.id === el.id)) el.remove();
  });
  
  // Apply scroll behavior`;

code = code.replace(/\/\/ Apply scroll behavior/g, injection);
fs.writeFileSync('index.html', code);
console.log("Success");
