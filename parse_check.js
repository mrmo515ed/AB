const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const scripts = [];
const regex = /<script.*?>([\s\S]*?)<\/script>/g;
let m;
while ((m = regex.exec(html)) !== null) {
  scripts.push(m[1]);
}

console.log(`Found ${scripts.length} script tags.`);
for (let i = 0; i < scripts.length; i++) {
  fs.writeFileSync(`test_script_${i}.js`, scripts[i]);
  try {
    require('child_process').execSync(`node -c test_script_${i}.js`, {stdio: 'ignore'});
  } catch(e) {
    console.error(`Syntax error in script ${i}`);
    process.exit(1);
  }
}
console.log("No syntax errors found in script tags.");
