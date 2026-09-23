import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

ensure_old = """  const curSnapshot = {
    id: curId,
    uid: curId,
    name: S.me.name || "أوتاكو أنمي بلاك",
    username: S.me.username || "otaku",
    email: S.me.email || "",
    avatar: S.me.avatar || AV[0],
    role: S.me.role || "Member",
    level: S.me.level || 1,
    xp: S.me.xp || 0,
    xpNext: S.me.xpNext || 100,
    coins: S.coins != null ? S.coins : (S.me.coins || 100),
    stars: S.stars != null ? S.stars : (S.me.stars || 5),
    reputation: S.me.reputation || 0,
    followers: S.me.followers || 0,
    following: S.me.following || 0,
    bio: S.me.bio || "",
    joined: S.me.joined || now(),
    equippedTitle: S.me.equippedTitle || null,
    isVerified: S.me.isVerified || false,
    badges: S.me.badges || [],
    profileCompleted: true
  };"""

ensure_new = """  const curSnapshot = Object.assign({}, S.me, {
    id: curId,
    uid: curId,
    name: S.me.name || "أوتاكو أنمي بلاك",
    username: S.me.username || "otaku",
    email: S.me.email || "",
    avatar: S.me.avatar || AV[0],
    role: S.me.role || "Member",
    level: S.me.level || 1,
    xp: S.me.xp || 0,
    xpNext: S.me.xpNext || 100,
    coins: S.coins != null ? S.coins : (S.me.coins || 100),
    stars: S.stars != null ? S.stars : (S.me.stars || 5),
    reputation: S.me.reputation || 0,
    followers: S.me.followers || 0,
    following: S.me.following || 0,
    bio: S.me.bio || "",
    joined: S.me.joined || now(),
    equippedTitle: S.me.equippedTitle || null,
    isVerified: S.me.isVerified || false,
    badges: S.me.badges || [],
    profileCompleted: true
  });"""

content = content.replace(ensure_old, ensure_new)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)
    print("Patched ensureAccounts")
