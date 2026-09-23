const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const scriptMatches = html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g);
let i = 0;
for (const match of scriptMatches) {
  if (match[1].trim().length > 0) {
    fs.writeFileSync(`temp_script_${i}.js`, match[1]);
    console.log(`Extracted temp_script_${i}.js`);
    try {
      require('child_process').execSync(`node -c temp_script_${i}.js`, {stdio: 'inherit'});
      console.log(`temp_script_${i}.js OK`);
    } catch (e) {
      console.log(`Error in temp_script_${i}.js`);
    }
  }
  i++;
}
