const fs = require('fs');
let json = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));
json.icons = [
    {
      "src": "/pwa-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/pwa-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icon.svg",
      "sizes": "512x512",
      "type": "image/svg+xml",
      "purpose": "any"
    }
];
fs.writeFileSync('manifest.json', JSON.stringify(json, null, 2));
console.log("Success");
