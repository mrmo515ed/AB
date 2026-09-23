import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

chars_old = """  const characters = [
    { id: "luffy", n: "لوفي جير 5", icon: "⚡", c1: "#DC2626", c2: "#F59E0B" },
    { id: "gojo", n: "غوجو", icon: "👁️", c1: "#312E81", c2: "#818CF8" },
    { id: "eren", n: "إرين تاتاكاي", icon: "🔥", c1: "#7F1D1D", c2: "#B91C1C" },
    { id: "levi", n: "ليفاي تنظيف", icon: "⚔️", c1: "#1F2937", c2: "#6B7280" },
    { id: "jinwoo", n: "جين وو أرايز", icon: "👑", c1: "#1E1B4B", c2: "#4F46E5" },
    { id: "tanjiro", n: "تانجيرو شمس", icon: "☀️", c1: "#134E4A", c2: "#14B8A6" },
    { id: "anya", n: "آنيا ههه", icon: "😏", c1: "#065F46", c2: "#F472B6" },
    { id: "naruto", n: "ناروتو داتيبايو", icon: "🍥", c1: "#EA580C", c2: "#FACC15" },
    { id: "sasuke", n: "ساسكي شارينغان", icon: "🌙", c1: "#312E81", c2: "#6366F1" },
    { id: "zoro", n: "زورو عاشوراء", icon: "🗡️", c1: "#14532D", c2: "#22C55E" },
    { id: "frieren", n: "فريـرن سحر", icon: "✨", c1: "#064E3B", c2: "#10B981" },
    { id: "saitama", n: "سايتاما أوكي", icon: "😐", c1: "#78350F", c2: "#F59E0B" }
  ];"""

chars_new = """  const characters = [
    { id: "luffy", n: "لوفي جير 5", icon: "⚡", c1: "#DC2626", c2: "#F59E0B" },
    { id: "gojo", n: "غوجو", icon: "👁️", c1: "#312E81", c2: "#818CF8" },
    { id: "eren", n: "إرين", icon: "🔥", c1: "#7F1D1D", c2: "#B91C1C" },
    { id: "levi", n: "ليفاي", icon: "⚔️", c1: "#1F2937", c2: "#6B7280" },
    { id: "jinwoo", n: "جين وو", icon: "👑", c1: "#1E1B4B", c2: "#4F46E5" },
    { id: "tanjiro", n: "تانجيرو", icon: "☀️", c1: "#134E4A", c2: "#14B8A6" },
    { id: "anya", n: "آنيا", icon: "😏", c1: "#065F46", c2: "#F472B6" },
    { id: "naruto", n: "ناروتو", icon: "🍥", c1: "#EA580C", c2: "#FACC15" },
    { id: "sasuke", n: "ساسكي", icon: "🌙", c1: "#312E81", c2: "#6366F1" },
    { id: "zoro", n: "زورو", icon: "🗡️", c1: "#14532D", c2: "#22C55E" },
    { id: "frieren", n: "فريـرن", icon: "✨", c1: "#064E3B", c2: "#10B981" },
    { id: "saitama", n: "سايتاما", icon: "😐", c1: "#78350F", c2: "#F59E0B" },
    { id: "sukuna", n: "سوكونا", icon: "👺", c1: "#450A0A", c2: "#991B1B" },
    { id: "mikasa", n: "ميكاسا", icon: "🧣", c1: "#7F1D1D", c2: "#450A0A" },
    { id: "gintoki", n: "غينتوكي", icon: "🍡", c1: "#E0F2FE", c2: "#7DD3FC" },
    { id: "midoriya", n: "ميدوريا", icon: "🧤", c1: "#064E3B", c2: "#10B981" }
  ];"""

if "sukuna" not in content:
    content = content.replace(chars_old, chars_new)
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(content)
        print("Patched sticker maker characters.")
