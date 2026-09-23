sed -i -e 's/--bg:#09090B/--bg:#0A0A0A/g' index.html
sed -i -e 's/--bg2:#0C0C0F/--bg2:#070709/g' index.html
sed -i -e 's/--bg3:#121216/--bg3:#060608/g' index.html
sed -i -e 's/--surface:#131316/--surface:#121212/g' index.html
sed -i -e 's/--surface2:#1C1C21/--surface2:#14141E/g' index.html
sed -i -e 's/--surface3:#25252B/--surface3:#1A1A1A/g' index.html
sed -i -e 's/--line:#222227/--line:#1F1F1F/g' index.html
sed -i -e 's/--line2:#2C2C35/--line2:#272732/g' index.html
sed -i -e 's/--text:#EDEDF0/--text:#E4E4E7/g' index.html
sed -i -e 's/--muted:#A1A1AA/--muted:#8B8B93/g' index.html
sed -i -e 's/--faint:#71717A/--faint:#82828E/g' index.html
sed -i -e 's/--accent:#F43F5E/--accent:#22D3EE/g' index.html
sed -i -e 's/--accent2:#FB7185/--accent2:#67E8F9/g' index.html
sed -i -e 's/--accent3:#E11D48/--accent3:#0891B2/g' index.html
sed -i -e 's/--grad-fire:linear-gradient(135deg,#FB7185 0%,#F43F5E 100%)/--grad-fire:linear-gradient(135deg,#67E8F9 0%,#22D3EE 48%,#0891B2 100%)/g' index.html

# Light mode refined reverse
sed -i -e 's/--bg:#FAFAFB/--bg:#F4F4F5/g' index.html
sed -i -e 's/--bg2:#FFFFFF/--bg2:#FAFAFA/g' index.html
sed -i -e 's/--bg3:#F3F3F5/--bg3:#FFFFFF/g' index.html
sed -i -e 's/--surface2:#F4F4F6/--surface2:#F4F4F5/g' index.html
sed -i -e 's/--surface3:#EAEAEF/--surface3:#E9E9EC/g' index.html
sed -i -e 's/--line:#E4E4E9/--line:#E2E2E6/g' index.html
sed -i -e 's/--line2:#D5D5DD/--line2:#D4D4D8/g' index.html
sed -i -e 's/--text:#1A1A1F/--text:#18181B/g' index.html
sed -i -e 's/--muted:#71717A/--muted:#5B5B66/g' index.html

sed -i "s/font-family:-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Tajawal', system-ui, sans-serif;/font-family:'Cairo','Segoe UI',Tahoma,system-ui,sans-serif;/g" index.html
