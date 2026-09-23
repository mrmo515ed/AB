const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const regex = /window\.updateChatDom = function\(msgBox, c, uu, forceScrollBottom\) \{[\s\S]*?msgBox\.scrollTop = msgBox\.scrollHeight;\n  \}\n\};\nfunction openChat\(id\)/;

if(regex.test(code)) {
    code = code.replace(regex, 'function openChat(id)');
    fs.writeFileSync('index.html', code);
    console.log("Success");
} else {
    console.log("Failed");
}
