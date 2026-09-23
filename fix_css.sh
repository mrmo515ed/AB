sed -i 's/--r:14px;/--r:18px;/g' index.html
sed -i 's/.card{padding:14px}/.card{padding:16px;border-radius:var(--r);box-shadow:0 8px 30px rgba(0,0,0,0.12);background:var(--surface);border:1px solid var(--line);transition:transform 0.2s ease}/g' index.html
sed -i 's/.card2{padding:11px}/.card2{padding:12px;border-radius:var(--r);background:var(--surface2);border:1px solid var(--line2)}/g' index.html
sed -i 's/box-shadow:0 1px 2px rgba(0,0,0,.28),0 4px 16px rgba(0,0,0,.20)/box-shadow:0 8px 30px rgba(0,0,0,0.12)/g' index.html
