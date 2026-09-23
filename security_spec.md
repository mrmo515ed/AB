# ANIME BLACK V7 — SECURITY SPECIFICATION

## 1. Data Invariants & Zero-Trust Architecture
1. **User Identity Invariant**: Users cannot create or modify documents claiming to belong to other user IDs (`request.auth.uid == userId` or `authorId == request.auth.uid`).
2. **Role & Privilege Immutability**: Standard users cannot elevate their role to `admin`, `Moderator`, `SeniorModerator`, or `Developer`. Role assignments and moderation privileges are strictly validated against admin email (`m774545471@gmail.com` with `email_verified == true`) or trusted admin collections.
3. **Economy Integrity**: Users cannot arbitrarily manipulate `coins`, `stars`, `reputation`, or `level` via client writes.
4. **Chat Privacy Invariant**: Direct chat messages and private chats can only be read and written by authenticated participants of that specific chat.
5. **Community & Group Invariant**: Group messages require membership. Channels are protected against unauthorized deletions.
6. **No Unbounded Writes / Denial of Wallet**: Every string field has strict `.size() <= MAX` limits (e.g. usernames <= 50, post text <= 5000, comments <= 1000, thoughts <= 10000).
7. **Temporal Server Timestamps**: `createdAt` and `updatedAt` on creation and mutation must match `request.time` or be strictly guarded.
8. **Catch-All Default Deny**: The root wildcard rule `match /{document=**}` defaults strictly to `allow read, write: if false;`.

## 2. The Dirty Dozen Payloads & Mitigation Plan
1. **Payload 1: Privilege Escalation**: Setting `role: "admin"` during user profile creation -> Rejected by `isValidUser()` & `isRoleUnchanged()`.
2. **Payload 2: Coin Forgery**: Updating user document with `{ coins: 9999999 }` -> Rejected by restricted field diff guards.
3. **Payload 3: Impersonation Write**: Creating a post with `authorId: "victimUid"` -> Rejected by `request.resource.data.authorId == request.auth.uid`.
4. **Payload 4: Private Chat Snoop**: Non-participant querying `/chats/{chatId}/messages` -> Rejected by participant check.
5. **Payload 5: Massive String DOS**: Writing a 50MB string into post text -> Rejected by `request.resource.data.text.size() <= 10000`.
6. **Payload 6: Timestamp Manipulation**: Setting `createdAt: 0` -> Rejected by `request.resource.data.createdAt == request.time` or bounded range.
7. **Payload 7: Post Deletion Hijack**: User A deleting User B's post -> Rejected by `resource.data.authorId == request.auth.uid || isAdmin() || isMod()`.
8. **Payload 8: Global Wildcard Exploit**: Probing `/secret_config` -> Rejected by default deny rule.
9. **Payload 9: Email Spoofing**: Setting admin email with `email_verified: false` -> Rejected by `request.auth.token.email_verified == true`.
10. **Payload 10: Ghost Field Injection**: Injecting arbitrary extra fields into user doc -> Rejected by schema key validation.
11. **Payload 11: Story Deletion Hijack**: Non-owner deleting a story -> Rejected by `resource.data.userId == request.auth.uid || isAdmin()`.
12. **Payload 12: Notification Forgery**: User reading another user's notifications -> Rejected by `resource.data.userId == request.auth.uid`.
