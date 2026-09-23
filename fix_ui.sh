sed -i 's/--bg:#0A0A0A/--bg:#050505/g' index.html
sed -i 's/--bg2:#070709/--bg2:#0A0A0C/g' index.html
sed -i 's/--bg3:#060608/--bg3:#101014/g' index.html
sed -i 's/--surface:#121212/--surface:#15151A/g' index.html
sed -i 's/--surface2:#14141E/--surface2:#1C1C24/g' index.html
sed -i 's/--surface3:#1A1A1A/--surface3:#272732/g' index.html
sed -i 's/--line:#1F1F1F/--line:#22222A/g' index.html
sed -i 's/--line2:#272732/--line2:#2E2E3A/g' index.html
sed -i 's/--accent:#22D3EE/--accent:#E11D48/g' index.html
sed -i 's/--accent2:#67E8F9/--accent2:#F43F5E/g' index.html
sed -i 's/--accent3:#0891B2/--accent3:#BE123C/g' index.html
sed -i 's/--grad-fire:linear-gradient(135deg,#67E8F9 0%,#22D3EE 48%,#0891B2 100%)/--grad-fire:linear-gradient(135deg,#F43F5E 0%,#E11D48 100%)/g' index.html

# Font
sed -i "s/font-family:'Cairo','Segoe UI',Tahoma,system-ui,sans-serif;/font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Tajawal', 'Cairo', system-ui, sans-serif;/g" index.html
