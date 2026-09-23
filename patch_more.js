const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const banner = `    <div id="pwa_more_card_wrap" style="margin: 12px 0 4px">
      <div class="card" style="padding:13px 15px;background:linear-gradient(135deg,rgba(0,240,255,0.08),rgba(139,92,246,0.12));border:1px solid rgba(0,240,255,0.25);border-radius:18px;display:flex;align-items:center;justify-content:space-between;gap:12px">
        <div class="row g3" style="align-items:center">
          <div style="width:42px;height:42px;border-radius:12px;background:linear-gradient(135deg,#FF7A00,#EC4899);display:flex;align-items:center;justify-content:center;color:#fff;font-size:20px;box-shadow:0 0 16px rgba(255,122,0,0.35);flex-shrink:0">
            📱
          </div>
          <div style="text-align:right">
            <div class="b sm" style="color:var(--text)">تثبيت تطبيق Anime Black</div>
            <div class="tiny mut" style="font-size:10px">تصفح أسرع بكامل الشاشة وبدون شريط URL</div>
          </div>
        </div>
        <button class="btn btn-pri btn-xs" onclick="window.pwaManager.showInstallModal()" style="padding:8px 13px;border-radius:12px;font-weight:800;background:linear-gradient(90deg,#00F0FF,#8B5CF6);color:#fff;flex-shrink:0">
          تثبيت الان
        </button>
      </div>
    </div>`;

if(code.includes(banner)) {
    code = code.replace(banner, '');
    fs.writeFileSync('index.html', code);
    console.log("Success");
} else {
    console.log("Failed to find banner");
}
