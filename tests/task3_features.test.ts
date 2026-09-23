/**
 * Task-3 feature tests: extract the new specialized-chat logic directly from
 * index.html and exercise it in a stubbed VM — proves the shipped code paths
 * (slash commands, guild ranks/contribution, room reactions, overflow menu API).
 */
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import vm from "node:vm";
import { describe, expect, it, vi } from "vitest";

const require = createRequire(import.meta.url);
const src = readFileSync(new URL("../index.html", import.meta.url), "utf-8");

/** Extract a top-level function definition by name from the main inline script. */
function extractFn(name: string): string {
  const start = src.indexOf(`function ${name}(`);
  if (start < 0) throw new Error(`function ${name} not found in index.html`);
  let depth = 0;
  let i = src.indexOf("{", start);
  for (; i < src.length; i++) {
    const ch = src[i];
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) break;
    }
  }
  return src.slice(start, i + 1);
}

/** Extract a top-level const declaration (single line, ends with ";\n"). */
function extractConst(name: string): string {
  const start = src.indexOf(`const ${name}=`);
  if (start < 0) throw new Error(`const ${name} not found in index.html`);
  let depth = 0;
  let end = -1;
  for (let i = start; i < src.length; i++) {
    const ch = src[i];
    if (ch === "[" || ch === "{" || ch === "(") depth++;
    else if (ch === "]" || ch === "}" || ch === ")") depth--;
    else if (ch === ";" && depth === 0) { end = i; break; }
  }
  if (end < 0) throw new Error(`const ${name}: terminator not found`);
  return src.slice(start, end + 1);
}

/** Build a sandbox exposing the pieces the extracted code depends on. */
function makeSandbox() {
  const calls: string[] = [];
  const sandbox: Record<string, unknown> = {
    console: { log: vi.fn(), warn: vi.fn(), error: vi.fn() },
    setTimeout: (fn: () => void) => { /* no-op in tests */ },
    clearTimeout: () => {},
    Date,
    Math,
    JSON,
    Array,
    Object,
    String,
    Number,
    Boolean,
    RegExp,
    Error,
    Promise,
    window: {},
    S: { me: { name: "سارة" } },
    uid: () => "m" + Math.random().toString(36).slice(2, 8),
    now: () => 1790000000000,
    snd: (k: string) => calls.push("snd:" + k),
    toast: (m: string, t: string) => calls.push(`toast:${t}:${m}`),
    save: () => calls.push("save"),
    render: () => calls.push("render"),
    getChatMyUid: () => "me",
    nfmt: (n: number) => String(n),
    ago: () => "الآن",
    linkify: (t: string) => t,
    hhmm: () => "12:00",
    msgById: (id: string) => sandbox.__msgs.find((m: { id: string }) => m.id === id),
    closeOvl: () => calls.push("closeOvl"),
    $: () => null,
    esc: (t: string) => String(t),
    I: (n: string) => `<svg data-icon="${n}"></svg>`,
    __msgs: [] as unknown[],
  };
  sandbox.window = sandbox;
  return { sandbox, calls };
}

function runInSandbox(code: string) {
  const { sandbox, calls } = makeSandbox();
  vm.createContext(sandbox);
  vm.runInContext(code + "\n;__exports = { applyRoomCmd, guildRankOf, guildAddContrib, roomReact };", sandbox);
  return { sandbox, calls, exports: sandbox.__exports as Record<string, (...a: unknown[]) => unknown> };
}

const PRELUDE = `
${extractConst("GUILD_RANKS")}
${extractConst("ROOM_REACTS")}
${extractFn("applyRoomCmd")}
${extractFn("guildRankOf")}
${extractFn("guildAddContrib")}
${extractFn("roomReact")}
`;

describe("task-3: applyRoomCmd (slash commands for groups & worlds)", () => {
  it("rejects non-commands", () => {
    const { exports } = runInSandbox(PRELUDE);
    expect(exports.applyRoomCmd("مرحبا بالجميع", { msgs: [] }, "group")).toBe(false);
  });

  it("/me sends an action message", () => {
    const room: { msgs: unknown[] } = { msgs: [] };
    const { exports } = runInSandbox(PRELUDE);
    expect(exports.applyRoomCmd("/me يشاهد أنمي", room, "group")).toBe(true);
    expect(room.msgs).toHaveLength(1);
    const m = room.msgs[0] as { text: string; uid: string; senderName: string };
    expect(m.text).toContain("سارة");
    expect(m.text).toContain("يشاهد أنمي");
    expect(m.uid).toBe("me");
  });

  it("/roll produces a bounded dice result", () => {
    const room: { msgs: unknown[] } = { msgs: [] };
    const { exports } = runInSandbox(PRELUDE);
    expect(exports.applyRoomCmd("/roll 2d6", room, "world")).toBe(true);
    const m = room.msgs[0] as { text: string };
    expect(m.text).toContain("رمى النرد");
    const total = Number(m.text.match(/= (\d+)/)?.[1] ?? 0);
    expect(total).toBeGreaterThanOrEqual(2);
    expect(total).toBeLessThanOrEqual(12);
  });

  it("/poll creates a chat poll with votes", () => {
    const room: { msgs: unknown[] } = { msgs: [] };
    const { exports } = runInSandbox(PRELUDE);
    expect(exports.applyRoomCmd("/poll أفضل أنمي | ناروتو | ون بيس", room, "group")).toBe(true);
    const m = room.msgs[0] as { type: string; q: string; opts: string[]; votes: number[] };
    expect(m.type).toBe("cpoll");
    expect(m.q).toBe("أفضل أنمي");
    expect(m.opts).toEqual(["ناروتو", "ون بيس"]);
    expect(m.votes).toEqual([0, 0]);
  });

  it("/poll with too few options is rejected without sending", () => {
    const room: { msgs: unknown[] } = { msgs: [] };
    const { exports } = runInSandbox(PRELUDE);
    expect(exports.applyRoomCmd("/poll سؤال", room, "group")).toBe(true);
    expect(room.msgs).toHaveLength(0);
  });

  it("/topic is admin-only and updates the topic", () => {
    const memberRoom = { msgs: [] as unknown[], owner: "u9" };
    const adminRoom = { msgs: [] as unknown[], owner: "me" };
    const { exports } = runInSandbox(PRELUDE);
    expect(exports.applyRoomCmd("/topic موضوع جديد", memberRoom, "world")).toBe(true);
    expect(memberRoom.msgs).toHaveLength(0); // blocked
    expect(exports.applyRoomCmd("/topic موضوع جديد", adminRoom, "world")).toBe(true);
    expect(adminRoom.desc).toBe("موضوع جديد");
  });

  it("unknown command shows help and consumes input", () => {
    const room: { msgs: unknown[] } = { msgs: [] };
    const { calls, exports } = runInSandbox(PRELUDE);
    expect(exports.applyRoomCmd("/xyz", room, "group")).toBe(true);
    expect(room.msgs).toHaveLength(0);
    expect(calls.some((c) => c.startsWith("toast:info:"))).toBe(true);
  });
});

describe("task-3: guild ranks & contributions", () => {
  const COMMUNITIES = `S.communities = [{ id: "g1", name: "نقابة السيوف", contrib: { me: 30, u2: 700 } }];`;

  it("computes rank by points (thresholds 0/50/200/600)", () => {
    const { exports } = runInSandbox(PRELUDE + COMMUNITIES);
    const rank = exports.guildRankOf("g1", "me") as { pts: number; name: string; next?: unknown };
    expect(rank.pts).toBe(30);
    expect(rank.name).toBe("مبتدئ");
    expect((rank.next as [number, string])[0]).toBe(50);
    const legend = exports.guildRankOf("g1", "u2") as { name: string; next?: unknown };
    expect(legend.name).toBe("أسطورة");
    expect(legend.next).toBeUndefined();
  });

  it("returns new rank name only when promoted", () => {
    const { exports } = runInSandbox(PRELUDE + COMMUNITIES);
    expect(exports.guildAddContrib("g1", "me", 19)).toBeNull(); // 49 — still مبتدئ
    expect(exports.guildAddContrib("g1", "me", 1)).toBe("محارب"); // 50 — promoted
  });
});

describe("task-3: room reactions", () => {
  it("toggles my reaction and cleans empty entries", () => {
    const code = PRELUDE + `__msgs = [{ id: "r1", uid: "u2", text: "مرحبا" }]; msgById = (id) => __msgs.find(m => m.id === id);`;
    const { sandbox, exports } = runInSandbox(code);
    (exports.roomReact as (id: string, k: string) => void)("r1", "love");
    const m1 = (sandbox.__msgs as { reacts: Record<string, string[]> }[])[0];
    expect(m1.reacts.love).toEqual(["me"]);
    (exports.roomReact as (id: string, k: string) => void)("r1", "love");
    const m2 = (sandbox.__msgs as { reacts: Record<string, string[]> }[])[0];
    expect(m2.reacts.love).toEqual([]);
  });
});

describe("task-3: dynamic overflow menu plumbing", () => {
  it("defines openMoreMenu/moreBtnV/MORES.chatRoom/MORES.selActions in index.html", () => {
    for (const marker of [
      "function openMoreMenu(kind,arg)",
      "function moreBtnV(kind,arg,title)",
      "MORES.chatRoom=(id)=>",
      "MORES.selActions=()=>",
      "SHEETS.roomReactPick",
      "SHEETS.groupStats",
      "SHEETS.groupMedia",
      "SHEETS.groupSearch",
      "SHEETS.worldEvents",
      "SHEETS.worldPresence",
      "SHEETS.guildRanks",
    ]) {
      expect(src.includes(marker), marker).toBe(true);
    }
  });

  it("has zero emoji left in the document", () => {
    const emoji = src.match(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{200D}]/gu);
    expect(emoji ?? []).toHaveLength(0);
  });
});
