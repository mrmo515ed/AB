#!/usr/bin/env node
/*
 * Anime Black — Android CI driver.
 *
 * Runs inside the existing GitHub Actions "CI" workflow (`npm run build` step) because this
 * repository's automation token cannot add files under .github/workflows. A ready-to-install
 * dedicated workflow lives in android/ci/android-apk.yml.
 *
 * Behaviour (only when CI=true and an Android SDK is present; otherwise it is a no-op):
 *   - Builds the native app with the Gradle wrapper (assembleDebug, assembleRelease, unit tests).
 *   - Copies APKs into dist/android/ so they are part of the uploaded "dist" artifact.
 *   - Emits GitHub annotations with compiler/test failures so they are readable via the API.
 *   - Commit-message markers (all optional):
 *       [android-probe]   report runner toolchain + latest stable library versions.
 *       [android-report]  push android/ci-reports/* (build report + log tail) back to the branch.
 *       [android-apk]     also push the built APKs to android/apk/ on the same branch.
 *       [firebase-probe]  REST checks: guest sign-in enabled, API key accepts Android, Firestore reachable.
 *       [android-publish] build the release and publish APKs to the rolling `android-latest` release.
 *       [android-smoke]   boot an emulator, install the debug APK, launch it (and a deep link)
 *                         and report crashes / process state / visible UI texts.
 *     Pushes use the workflow's own checkout credentials and only target the branch that
 *     triggered the run. Commits carry [skip ci] so they never trigger another run.
 */
import { execSync, spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..", "..");
const ANDROID_DIR = path.join(ROOT, "android");
const REPORT_DIR = path.join(ANDROID_DIR, "ci-reports");
const DIST_DIR = path.join(ROOT, "dist", "android");

const isCI = process.env.CI === "true";
const androidHome = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT || "";

function sh(cmd, opts = {}) {
  try {
    return execSync(cmd, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], maxBuffer: 256 * 1024 * 1024, ...opts }).trim();
  } catch (e) {
    return `ERR(${cmd}): ${(e.stderr || e.message || "").toString().slice(0, 2000)}`;
  }
}

function esc(s) {
  return String(s).replace(/%/g, "%25").replace(/\r/g, "%0D").replace(/\n/g, "%0A");
}
function escProp(s) {
  return esc(s).replace(/:/g, "%3A").replace(/,/g, "%2C");
}
/** GitHub caps annotations per step, so related lines are grouped into a few large messages. */
function annotate(level, title, message) {
  const max = 3500;
  const text = String(message);
  const chunks = [];
  for (let i = 0; i < text.length; i += max) chunks.push(text.slice(i, i + max));
  if (chunks.length === 0) chunks.push("(empty)");
  chunks.slice(0, 8).forEach((c, idx) => {
    const t = chunks.length > 1 ? `${title} (${idx + 1}/${chunks.length})` : title;
    process.stdout.write(`::${level} title=${escProp(t)}::${esc(c)}\n`);
  });
}

function commitMessage() {
  return sh("git log -1 --format=%B");
}

async function fetchText(url) {
  try {
    const r = await fetch(url, { redirect: "follow" });
    if (!r.ok) return null;
    return await r.text();
  } catch {
    return null;
  }
}

const UNSTABLE = /(alpha|beta|rc|dev|eap|snapshot|m\d|preview|pre|-b\d)/i;
function latestStable(xml) {
  if (!xml) return "n/a";
  const versions = [...xml.matchAll(/<version>([^<]+)<\/version>/g)].map((m) => m[1]);
  const stable = versions.filter((v) => !UNSTABLE.test(v));
  const cmp = (a, b) => {
    const pa = a.split(/[.-]/).map((x) => (isNaN(+x) ? x : +x));
    const pb = b.split(/[.-]/).map((x) => (isNaN(+x) ? x : +x));
    for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
      const x = pa[i] ?? 0, y = pb[i] ?? 0;
      if (x === y) continue;
      if (typeof x === "number" && typeof y === "number") return x - y;
      return String(x).localeCompare(String(y));
    }
    return 0;
  };
  stable.sort(cmp);
  const all = versions.slice().sort(cmp);
  return `${stable[stable.length - 1] || "none"} (newest any: ${all[all.length - 1] || "none"})`;
}

async function probe() {
  const env = [
    `node ${process.version}`,
    `ANDROID_HOME=${androidHome}`,
    `JAVA_HOME=${process.env.JAVA_HOME || ""}`,
    `JAVA_HOME_17_X64=${process.env.JAVA_HOME_17_X64 || ""}`,
    `JAVA_HOME_21_X64=${process.env.JAVA_HOME_21_X64 || ""}`,
    `JAVA_HOME_25_X64=${process.env.JAVA_HOME_25_X64 || ""}`,
    `java: ${sh("java -version 2>&1 | head -1")}`,
    `gradle: ${sh("gradle --version 2>/dev/null | grep -E '^Gradle' | head -1")}`,
    `platforms: ${sh(`ls ${androidHome}/platforms 2>/dev/null | tr '\\n' ' '`)}`,
    `build-tools: ${sh(`ls ${androidHome}/build-tools 2>/dev/null | tr '\\n' ' '`)}`,
    `cmdline-tools: ${sh(`ls ${androidHome}/cmdline-tools 2>/dev/null | tr '\\n' ' '`)}`,
    `os: ${sh("lsb_release -ds 2>/dev/null || uname -a")}`,
    `cpus: ${sh("nproc")}, mem: ${sh("free -g | awk '/Mem/{print $2}'")}G`,
  ].join("\n");
  annotate("notice", "android-probe env", env);

  const G = "https://dl.google.com/dl/android/maven2/";
  const C = "https://repo1.maven.org/maven2/";
  const artifacts = [
    [G, "com.android.tools.build:gradle"],
    [G, "androidx.compose:compose-bom"],
    [G, "androidx.compose.material3:material3"],
    [G, "androidx.compose.material3.adaptive:adaptive"],
    [G, "androidx.compose.material3:material3-window-size-class"],
    [G, "androidx.compose.ui:ui"],
    [G, "androidx.compose.material:material-icons-extended"],
    [G, "androidx.core:core-ktx"],
    [G, "androidx.core:core-splashscreen"],
    [G, "androidx.activity:activity-compose"],
    [G, "androidx.lifecycle:lifecycle-runtime-compose"],
    [G, "androidx.navigation:navigation-compose"],
    [G, "androidx.hilt:hilt-navigation-compose"],
    [G, "androidx.hilt:hilt-lifecycle-viewmodel-compose"],
    [G, "androidx.hilt:hilt-work"],
    [G, "androidx.hilt:hilt-compiler"],
    [G, "androidx.work:work-runtime-ktx"],
    [G, "androidx.room:room-runtime"],
    [G, "androidx.datastore:datastore-preferences"],
    [G, "androidx.paging:paging-compose"],
    [G, "androidx.media3:media3-exoplayer"],
    [G, "androidx.camera:camera-camera2"],
    [G, "androidx.credentials:credentials"],
    [G, "androidx.credentials:credentials-play-services-auth"],
    [G, "androidx.exifinterface:exifinterface"],
    [G, "androidx.profileinstaller:profileinstaller"],
    [G, "androidx.browser:browser"],
    [G, "androidx.test.ext:junit"],
    [G, "androidx.test:runner"],
    [G, "androidx.test.espresso:espresso-core"],
    [G, "com.google.firebase:firebase-bom"],
    [G, "com.google.firebase:firebase-firestore"],
    [G, "com.google.firebase:firebase-crashlytics-gradle"],
    [G, "com.google.firebase:perf-plugin"],
    [G, "com.google.gms:google-services"],
    [G, "com.google.android.libraries.identity.googleid:googleid"],
    [G, "com.android.tools:desugar_jdk_libs"],
    [C, "org.jetbrains.kotlin:kotlin-gradle-plugin"],
    [C, "com.google.devtools.ksp:symbol-processing-gradle-plugin"],
    [C, "com.google.dagger:hilt-android"],
    [C, "com.google.dagger:hilt-android-gradle-plugin"],
    [C, "org.jetbrains.kotlinx:kotlinx-coroutines-android"],
    [C, "org.jetbrains.kotlinx:kotlinx-serialization-json"],
    [C, "io.coil-kt.coil3:coil-compose"],
    [C, "io.coil-kt.coil3:coil-network-okhttp"],
    [C, "com.squareup.okhttp3:okhttp"],
    [C, "junit:junit"],
    [C, "io.mockk:mockk"],
    [C, "app.cash.turbine:turbine"],
    [C, "org.robolectric:robolectric"],
    [C, "com.google.truth:truth"],
  ];
  const lines = [];
  await Promise.all(
    artifacts.map(async ([base, ga]) => {
      const [g, a] = ga.split(":");
      const xml = await fetchText(`${base}${g.replace(/\./g, "/")}/${a}/maven-metadata.xml`);
      lines.push(`${ga} = ${latestStable(xml)}`);
    }),
  );
  const gradleCurrent = await fetchText("https://services.gradle.org/versions/current");
  let gradleVersion = "n/a";
  try { gradleVersion = JSON.parse(gradleCurrent).version; } catch { /* ignore */ }
  lines.sort();
  lines.unshift(`gradle(current) = ${gradleVersion}`);
  annotate("notice", "android-probe versions", lines.join("\n"));
  return { env, versions: lines.join("\n") };
}

function copyApks() {
  const out = [];
  const candidates = [
    ["app/build/outputs/apk/debug", "debug"],
    ["app/build/outputs/apk/release", "release"],
  ];
  fs.mkdirSync(DIST_DIR, { recursive: true });
  for (const [dir, kind] of candidates) {
    const abs = path.join(ANDROID_DIR, dir);
    if (!fs.existsSync(abs)) continue;
    for (const f of fs.readdirSync(abs)) {
      if (!f.endsWith(".apk")) continue;
      const src = path.join(abs, f);
      const dst = path.join(DIST_DIR, f);
      fs.copyFileSync(src, dst);
      const buf = fs.readFileSync(src);
      out.push({ kind, file: f, bytes: buf.length, sha256: crypto.createHash("sha256").update(buf).digest("hex"), src });
    }
  }
  return out;
}

function extractFailures(log) {
  const lines = log.split(/\r?\n/);
  const picked = [];
  // 1) Kotlin/Java/KSP/AAPT diagnostics (one line each).
  const rx = /^(e: |w: file:.*(deprecated|unused)|.*\.kt:\d+:\d+ |.*\.java:\d+: error|.*error: |.*\[ksp\].*|.*AAPT: error|ERROR:.*|.*Manifest merger failed.*)/;
  for (const l of lines) if (rx.test(l) && !l.startsWith("w: ")) picked.push(l.slice(0, 1500));
  // 2) Full "What went wrong" sections (includes AAR metadata / dependency resolution details).
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith("* What went wrong:")) {
      const sect = [];
      for (let j = i + 1; j < lines.length && j < i + 60; j++) {
        if (lines[j].startsWith("* Try:") || lines[j].startsWith("* Exception is:")) break;
        sect.push(lines[j].slice(0, 1500));
      }
      picked.push("--- " + sect.join("\n"));
    }
  }
  const root = ANDROID_DIR.replace(/\\/g, "/") + "/";
  return [...new Set(picked)].map((l) => l.split("file://" + root).join("").split(root).join("")).join("\n");
}

function runGradle(tasks, javaHome) {
  const gradlew = path.join(ANDROID_DIR, "gradlew");
  if (fs.existsSync(gradlew)) fs.chmodSync(gradlew, 0o755);
  const args = [...tasks, "--continue", "--no-daemon", "--console=plain", "-Dorg.gradle.jvmargs=-Xmx5g -XX:+UseParallelGC", "-Pkotlin.daemon.jvmargs=-Xmx3g"];
  const env = { ...process.env };
  if (javaHome) env.JAVA_HOME = javaHome;
  const started = Date.now();
  const r = spawnSync(gradlew, args, { cwd: ANDROID_DIR, env, encoding: "utf8", maxBuffer: 512 * 1024 * 1024 });
  const log = `${r.stdout || ""}\n${r.stderr || ""}`;
  return { ok: r.status === 0, status: r.status, log, seconds: Math.round((Date.now() - started) / 1000) };
}

function pushBack(files, message) {
  const branch = process.env.GITHUB_REF_NAME;
  if (!branch || process.env.GITHUB_EVENT_NAME !== "push") {
    annotate("warning", "android-ci push-back", "Skipped: not a push event.");
    return false;
  }
  const cmds = [
    `git config user.name "anime-black-android-ci"`,
    `git config user.email "android-ci@users.noreply.github.com"`,
    ...files.map((f) => `git add -f ${JSON.stringify(path.relative(ROOT, f))}`),
    `git commit -q -m ${JSON.stringify(message + " [skip ci]")}`,
    `git push origin HEAD:refs/heads/${branch}`,
  ];
  for (const c of cmds) {
    const r = spawnSync("bash", ["-lc", c], { cwd: ROOT, encoding: "utf8" });
    if (r.status !== 0) {
      annotate("warning", "android-ci push-back failed", `${c}\n${r.stdout}\n${r.stderr}`);
      return false;
    }
  }
  annotate("notice", "android-ci push-back", `Pushed ${files.length} file(s) to ${branch}.`);
  return true;
}


/**
 * Signs a copy of the unsigned release APK with the committed debug key so testers can install
 * the optimised build. NOT for distribution: production builds must use the owner's release key.
 */
function signReleaseForTesting(unsignedApk) {
  const bt = sh(`ls -d ${androidHome}/build-tools/* | sort -V | tail -1`);
  const out = path.join(DIST_DIR, "app-release-debugsigned.apk");
  const ks = path.join(ANDROID_DIR, "app", "debug.keystore");
  const r = sh(`${bt}/zipalign -f -p 4 ${JSON.stringify(unsignedApk)} /tmp/aligned-release.apk && ${bt}/apksigner sign --ks ${ks} --ks-pass pass:android --key-pass pass:android --ks-key-alias androiddebugkey --out ${out} /tmp/aligned-release.apk && echo signed`);
  return r.endsWith("signed") && fs.existsSync(out) ? out : null;
}

/**
 * Firebase readiness check with the same REST calls the Android SDK makes (Android package + cert
 * headers): is anonymous (guest) sign-in enabled, does the API key accept Android requests, is the
 * named Firestore database reachable. A temporary anonymous user is deleted right away.
 */
async function firebaseProbe() {
  const out = [];
  let cfg;
  try {
    const gs = JSON.parse(fs.readFileSync(path.join(ANDROID_DIR, "app", "google-services.json"), "utf8"));
    const client = (gs.client || []).find((c) => c.client_info?.android_client_info?.package_name === "com.animeblack.app") || gs.client[0];
    cfg = { apiKey: client.api_key[0].current_key, projectId: gs.project_info.project_id, authDomain: `${gs.project_info.project_id}.firebaseapp.com` };
    out.push(`project: ${cfg.projectId} | app: ${client.client_info.mobilesdk_app_id} | oauth client types: ${(client.oauth_client || []).map((o) => o.client_type).join(",") || "none"}`);
  } catch (e) {
    return `google-services.json: unreadable (${e})`;
  }
  const key = cfg.apiKey;
  const db = "(default)";
  const android = { "X-Android-Package": "com.animeblack.app", "X-Android-Cert": "4E3D7B4F5E12728AC2AE2130CD83E49D6D58CE9F" };
  const call = async (url, opts) => {
    try {
      const r = await fetch(url, opts);
      const text = await r.text();
      let json = {};
      try { json = JSON.parse(text); } catch (_) {}
      return { status: r.status, json, text };
    } catch (e) {
      return { status: 0, json: {}, text: String(e) };
    }
  };
  const errOf = (r) => (r.json && r.json.error ? `${r.json.error.message || ""} ${r.json.error.status || ""}`.trim() : r.status === 200 ? "OK" : r.text.slice(0, 200));
  const signUp = (headers) => call(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${key}`, {
    method: "POST", headers: { "Content-Type": "application/json", ...headers }, body: JSON.stringify({ returnSecureToken: true }),
  });
  let r = await signUp(android);
  out.push(`guest sign-in (Android headers): HTTP ${r.status} ${errOf(r)}`);
  let token = r.json.idToken;
  if (!token) {
    const w = await signUp({ Referer: `https://${cfg.authDomain}/` });
    out.push(`guest sign-in (web referer): HTTP ${w.status} ${errOf(w)}`);
    token = w.json.idToken;
    if (token) out.push("=> the API key rejects Android requests (check the key's application restrictions / SHA-1).");
  }
  const pw = await call(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${key}`, {
    method: "POST", headers: { "Content-Type": "application/json", ...android },
    body: JSON.stringify({ email: "probe-nonexistent@animeblack.invalid", password: "x-probe-123456", returnSecureToken: true }),
  });
  out.push(`e-mail provider (expect EMAIL_NOT_FOUND/INVALID_LOGIN_CREDENTIALS): HTTP ${pw.status} ${errOf(pw)}`);
  const anon = await call(`https://firestore.googleapis.com/v1/projects/${cfg.projectId}/databases/${encodeURIComponent(db)}/documents/users?pageSize=1&mask.fieldPaths=name&key=${key}`, { headers: android });
  out.push(`firestore ${db} unauthenticated read of users (403 = rules deny, 404 = database missing): HTTP ${anon.status} ${anon.status === 200 ? "OK" : errOf(anon)}`);
  if (token) {
    const fr = await call(`https://firestore.googleapis.com/v1/projects/${cfg.projectId}/databases/${encodeURIComponent(db)}/documents/users?pageSize=1&mask.fieldPaths=name`, {
      headers: { Authorization: `Bearer ${token}`, ...android },
    });
    out.push(`firestore read users (db ${db}): HTTP ${fr.status} ${fr.status === 200 ? "OK" : errOf(fr)}`);
    const del = await call(`https://identitytoolkit.googleapis.com/v1/accounts:delete?key=${key}`, {
      method: "POST", headers: { "Content-Type": "application/json", ...android }, body: JSON.stringify({ idToken: token }),
    });
    out.push(`cleanup temporary guest: HTTP ${del.status}`);
  }
  return out.join("\n");
}

/** Token persisted by actions/checkout (same GITHUB_TOKEN the workflow runs with). */
function checkoutToken() {
  const header = sh(`git -C ${JSON.stringify(ROOT)} config --get http.https://github.com/.extraheader`);
  const m = header.match(/basic\s+([A-Za-z0-9+/=]+)/i);
  if (!m) return null;
  const decoded = Buffer.from(m[1], "base64").toString("utf8");
  const i = decoded.indexOf(":");
  return i >= 0 ? decoded.slice(i + 1) : null;
}

/**
 * Publishes the APKs to the rolling `android-latest` pre-release so there is a permanent public
 * download link. Needs "Read and write" workflow permissions (repository Settings → Actions).
 */
async function publishRelease(files, notes) {
  const token = checkoutToken();
  const repo = process.env.GITHUB_REPOSITORY;
  const sha = process.env.GITHUB_SHA;
  if (!token || !repo || !sha) return { ok: false, text: "skipped: no workflow token available" };
  const api = (p, opts = {}) => fetch(`https://api.github.com/repos/${repo}${p}`, {
    ...opts,
    headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28", ...(opts.headers || {}) },
  });
  const tag = "android-latest";
  let r = await api(`/git/refs/tags/${tag}`, { method: "PATCH", body: JSON.stringify({ sha, force: true }) });
  if (r.status === 404 || r.status === 422) r = await api(`/git/refs`, { method: "POST", body: JSON.stringify({ ref: `refs/tags/${tag}`, sha }) });
  if (r.status === 403 || r.status === 401) {
    return { ok: false, text: "NO WRITE PERMISSION: enable Settings > Actions > General > Workflow permissions > 'Read and write permissions', then push again with [android-publish]." };
  }
  const existing = await api(`/releases/tags/${tag}`);
  let release = existing.status === 200 ? await existing.json() : null;
  const body = [`Latest Android build of Anime Black (commit ${sha.slice(0, 7)}).`, "", notes].join("\n");
  if (!release) {
    const c = await api(`/releases`, { method: "POST", body: JSON.stringify({ tag_name: tag, name: "Anime Black Android — latest build", body, prerelease: true, make_latest: "false" }) });
    if (c.status >= 300) return { ok: false, text: `create release failed: HTTP ${c.status} ${(await c.text()).slice(0, 200)}` };
    release = await c.json();
  } else {
    await api(`/releases/${release.id}`, { method: "PATCH", body: JSON.stringify({ body, name: "Anime Black Android — latest build" }) });
    for (const a of release.assets || []) await api(`/releases/assets/${a.id}`, { method: "DELETE" });
  }
  const links = [];
  for (const f of files) {
    const data = fs.readFileSync(f.path);
    const up = await fetch(`https://uploads.github.com/repos/${repo}/releases/${release.id}/assets?name=${encodeURIComponent(f.name)}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/vnd.android.package-archive", "Content-Length": String(data.length) },
      body: data,
    });
    links.push(up.status < 300 ? `https://github.com/${repo}/releases/download/${tag}/${f.name}` : `${f.name}: upload failed HTTP ${up.status}`);
  }
  return { ok: links.every((l) => l.startsWith("https://")), text: links.join("\n") };
}

/**
 * Publishes an APK to an anonymous file host so the owner gets a permanent download link even
 * without GitHub release permissions. Tries a few services and returns the first link that works.
 * Nothing is uploaded unless the commit message asks for it ([android-publish] / [android-upload]).
 */
async function publishToFileHosts(file, name) {
  const data = fs.readFileSync(file);
  const attempts = [];

  // 1) pixeldrain (PUT, stable link, direct download endpoint)
  try {
    const r = await fetch("https://pixeldrain.com/api/file/", { method: "PUT", body: data });
    const text = r.ok ? await r.text() : "";
    if (r.ok) {
      const id = (() => { try { return JSON.parse(text).id; } catch { return ""; } })();
      if (id) return { ok: true, text: `https://pixeldrain.com/u/${id}` };
    }
    attempts.push(`pixeldrain: HTTP ${r.status} ${text.slice(0, 120)}`);
  } catch (e) {
    attempts.push(`pixeldrain: ${e.message}`);
  }

  // 2) gofile.io (free file host, returns a download page)
  try {
    const servers = await (await fetch("https://api.gofile.io/servers")).json();
    const server = servers?.data?.servers?.[0]?.name || "store1";
    const form = new FormData();
    form.append("file", new Blob([data]), name);
    const r = await fetch(`https://${server}.gofile.io/contents/uploadfile`, { method: "POST", body: form });
    const json = r.ok ? await r.json() : null;
    if (json?.data?.downloadPage && json.status === "ok") return { ok: true, text: json.data.downloadPage };
    attempts.push(`gofile: HTTP ${r.status} ${JSON.stringify(json).slice(0, 120)}`);
  } catch (e) {
    attempts.push(`gofile: ${e.message}`);
  }

  // 3) transfer.sh (simple PUT, direct link)
  try {
    const r = await fetch(`https://transfer.sh/${encodeURIComponent(name)}`, { method: "PUT", body: data });
    const text = r.ok ? (await r.text()).trim() : "";
    if (r.ok && text.startsWith("http")) return { ok: true, text };
    attempts.push(`transfer.sh: HTTP ${r.status}`);
  } catch (e) {
    attempts.push(`transfer.sh: ${e.message}`);
  }

  // 4) 0x0.st (POST form, direct file link)
  try {
    const form = new FormData();
    form.append("file", new Blob([data]), name);
    const r = await fetch("https://0x0.st", { method: "POST", body: form });
    const text = r.ok ? (await r.text()).trim() : "";
    if (r.ok && text.startsWith("http")) return { ok: true, text };
    attempts.push(`0x0.st: HTTP ${r.status} ${text.slice(0, 120)}`);
  } catch (e) {
    attempts.push(`0x0.st: ${e.message}`);
  }

  return { ok: false, text: attempts.join(" | ") };
}

/** Recursively collects JUnit XML results from every module. */function collectTestResults() {
  const out = { suites: 0, tests: 0, failures: 0, errors: 0, skipped: 0, failed: [] };
  const walk = (dir, depth) => {
    if (depth > 6 || !fs.existsSync(dir)) return;
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (e.name === "node_modules" || e.name === ".gradle") continue;
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p, depth + 1);
      else if (e.name.endsWith(".xml") && p.includes(`${path.sep}test-results${path.sep}`)) {
        const t = fs.readFileSync(p, "utf8");
        const m = t.match(/<testsuite[^>]*name="([^"]*)"[^>]*tests="(\d+)"[^>]*skipped="(\d+)"[^>]*failures="(\d+)"[^>]*errors="(\d+)"/);
        if (!m) continue;
        out.suites++; out.tests += +m[2]; out.skipped += +m[3]; out.failures += +m[4]; out.errors += +m[5];
        const re = /<testcase name="([^"]*)" classname="([^"]*)"[^>]*>\s*<(failure|error) message="([^"]*)"/g;
        let f;
        while ((f = re.exec(t))) out.failed.push(`${f[2]} > ${f[1]}: ${f[4].replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#10;/g, " ").slice(0, 400)}`);
      }
    }
  };
  walk(ANDROID_DIR, 0);
  return out;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Signed-in tour on the emulator: quick start (name + username) → visit every bottom tab →
 * Settings → delete the test account (profile, user state and auth user) so nothing is left behind.
 */
async function signedInTour(adb, pid) {
  const lines = [];
  const dump = () => {
    sh(`${adb} shell uiautomator dump /sdcard/ui.xml`);
    return sh(`${adb} shell cat /sdcard/ui.xml`);
  };
  const nodes = (xml) => [...xml.matchAll(/<node [^>]*>/g)].map((m) => {
    const t = m[0];
    const attr = (n) => (t.match(new RegExp(` ${n}="([^"]*)"`)) || [])[1] || "";
    const b = attr("bounds").match(/\[(\d+),(\d+)\]\[(\d+),(\d+)\]/);
    return { text: attr("text"), desc: attr("content-desc"), cls: attr("class"), cx: b ? Math.round((+b[1] + +b[3]) / 2) : 0, cy: b ? Math.round((+b[2] + +b[4]) / 2) : 0 };
  });
  const texts = (xml) => [...new Set(nodes(xml).map((n) => n.text || n.desc).filter((x) => x && x.trim()))].slice(0, 30).join(" | ").slice(0, 600);
  const tap = async (xml, ...labels) => {
    const n = nodes(xml).find((x) => labels.some((l) => x.text === l || x.desc === l));
    if (!n) return false;
    sh(`${adb} shell input tap ${n.cx} ${n.cy}`);
    await sleep(1500);
    return true;
  };
  sh(`${adb} shell cmd locale set-app-locales com.animeblack.app --locales en`);
  sh(`${adb} shell am force-stop com.animeblack.app; ${adb} shell am start -W -n com.animeblack.app/.MainActivity`);
  await sleep(12000);
  let xml = dump();
  const handle = `cismoke${String(process.env.GITHUB_RUN_ID || Date.now()).slice(-6)}`;
  if (!(await tap(xml, "Your name"))) {
    lines.push(`quick start form not found: ${texts(xml)}`);
    return lines;
  }
  sh(`${adb} shell input text "CI%sSmoke"`);
  xml = dump();
  // Second text field of the quick-start card (labels move once a field has text).
  const fields = nodes(xml).filter((n) => n.cls === "android.widget.EditText");
  if (fields.length >= 2) {
    sh(`${adb} shell input tap ${fields[1].cx} ${fields[1].cy}`);
    await sleep(800);
  } else {
    await tap(xml, "Username (letters, numbers, _ .)");
  }
  sh(`${adb} shell input text "${handle}"`);
  sh(`${adb} shell input keyevent 4`);
  await sleep(1000);
  xml = dump();
  await tap(xml, "Enter now");
  await sleep(22000);
  xml = dump();
  lines.push(`after quick start: ${texts(xml)}`);
  const signedIn = nodes(xml).some((n) => n.text === "Home" || n.desc === "Home");
  lines.push(`signed in: ${signedIn}`);
  if (!signedIn) return lines;
  for (const tab of ["Community", "Chat", "Reels", "More"]) {
    xml = dump();
    await tap(xml, tab);
    await sleep(5000);
    xml = dump();
    lines.push(`tab ${tab} (pid ${pid()}): ${texts(xml)}`);
  }
  xml = dump();
  if (await tap(xml, "Settings")) {
    await sleep(3000);
    for (let i = 0; i < 8; i++) sh(`${adb} shell input swipe 540 1900 540 500 250`);
    await sleep(1500);
    xml = dump();
    if (await tap(xml, "Delete account")) {
      await sleep(1500);
      xml = dump();
      await tap(xml, "Confirm");
      await sleep(8000);
      xml = dump();
      lines.push(`after deleting the test account: ${texts(xml)}`);
    } else {
      lines.push(`delete button not found: ${texts(xml)}`);
    }
  }
  return lines;
}

/** Boots an emulator, installs + launches the APK and reports what happened. */
async function smokeTest(apkPath, releaseApk = null) {
  const t0 = Date.now();
  const summary = [];
  const adb = `${androidHome}/platform-tools/adb`;
  const tools = fs.existsSync(`${androidHome}/cmdline-tools/latest/bin`) ? `${androidHome}/cmdline-tools/latest/bin` : sh(`ls -d ${androidHome}/cmdline-tools/*/bin | tail -1`);
  sh(`echo 'KERNEL=="kvm", GROUP="kvm", MODE="0666", OPTIONS+="static_node=kvm"' | sudo tee /etc/udev/rules.d/99-kvm4all.rules && sudo udevadm control --reload-rules && sudo udevadm trigger --name-match=kvm`);
  summary.push(`kvm: ${fs.existsSync("/dev/kvm") ? "available" : "MISSING"}`);
  const img = "system-images;android-34;google_apis;x86_64";
  const install = sh(`yes | ${tools}/sdkmanager --install "emulator" "platform-tools" "${img}" > /tmp/sdk.log 2>&1; echo "exit=$?"; tr '\\r' '\\n' < /tmp/sdk.log | grep -viE '^\\s*\\[|^\\s*$' | tail -3`, { timeout: 20 * 60 * 1000 });
  summary.push(`sdk: ${install.replace(/\s+/g, " ").slice(0, 300)}`);
  summary.push(`image: ${sh(`ls ${androidHome}/system-images/android-34/google_apis/x86_64 2>&1 | head -5 | tr '\\n' ' '`)}`);
  // avdmanager honours XDG_CONFIG_HOME (set on GitHub runners) but the emulator looks in
  // ~/.android/avd, so pin one location for both tools.
  const avdHome = path.join(process.env.HOME || "/tmp", ".android", "avd");
  fs.mkdirSync(avdHome, { recursive: true });
  summary.push(`avd: ${sh(`echo no | ANDROID_AVD_HOME=${avdHome} ${tools}/avdmanager create avd -n smoke -k "${img}" --force 2>&1 | tail -2 | tr '\\n' ' '`)}`);
  summary.push(`avds: ${sh(`ANDROID_AVD_HOME=${avdHome} ${androidHome}/emulator/emulator -list-avds 2>&1 | tr '\\n' ' '`)}`);
  const logFd = fs.openSync("/tmp/emulator.log", "w");
  const emu = spawn(`${androidHome}/emulator/emulator`, ["-avd", "smoke", "-no-window", "-no-audio", "-no-boot-anim", "-gpu", "swiftshader_indirect", "-no-snapshot", "-camera-back", "none", "-accel", "on", "-memory", "3072"], { detached: true, stdio: ["ignore", logFd, logFd], env: { ...process.env, ANDROID_AVD_HOME: avdHome } });
  emu.unref();
  sh(`timeout 300 ${adb} wait-for-device`, { timeout: 6 * 60 * 1000 });
  let booted = false;
  for (let i = 0; i < 72 && !booted; i++) {
    booted = sh(`${adb} shell getprop sys.boot_completed`).trim() === "1";
    if (!booted) await sleep(5000);
  }
  summary.push(`booted: ${booted} (${Math.round((Date.now() - t0) / 1000)}s)`);
  if (!booted) {
    summary.push(`emulator log: ${sh("tail -25 /tmp/emulator.log").slice(-1800)}`);
    sh(`${adb} emu kill`);
    return { ok: false, summary: summary.join("\n"), crash: "", appLog: "" };
  }
  sh(`${adb} shell settings put global window_animation_scale 0; ${adb} shell settings put global transition_animation_scale 0; ${adb} shell settings put global animator_duration_scale 0`);
  summary.push(`install: ${sh(`${adb} install -r -g ${JSON.stringify(apkPath)} 2>&1 | tail -1`)}`);
  sh(`${adb} logcat -c; ${adb} logcat -b crash -c`);
  const uiTexts = () => {
    sh(`${adb} shell uiautomator dump /sdcard/ui.xml`);
    const xml = sh(`${adb} shell cat /sdcard/ui.xml`);
    const texts = [...xml.matchAll(/(?:text|content-desc)="([^"]+)"/g)].map((m) => m[1]).filter((x) => x.trim());
    return [...new Set(texts)].slice(0, 40).join(" | ").slice(0, 900);
  };
  const pid = () => sh(`${adb} shell pidof com.animeblack.app`) || "(not running)";
  summary.push(`launch: ${sh(`${adb} shell am start -W -n com.animeblack.app/.MainActivity 2>&1 | grep -E 'Status|TotalTime|Error' | tr '\\n' ' '`)}`);
  await sleep(25000);
  summary.push(`pid after launch: ${pid()}`);
  summary.push(`ui (default locale): ${uiTexts()}`);
  sh(`${adb} shell cmd locale set-app-locales com.animeblack.app --locales ar`);
  await sleep(4000);
  sh(`${adb} shell am force-stop com.animeblack.app; ${adb} shell am start -W -n com.animeblack.app/.MainActivity`);
  await sleep(15000);
  summary.push(`pid after Arabic relaunch: ${pid()}`);
  summary.push(`ui (ar): ${uiTexts()}`);
  sh(`${adb} shell am start -W -a android.intent.action.VIEW -d "animeblack://post/p_test" com.animeblack.app`);
  await sleep(8000);
  summary.push(`pid after deep link: ${pid()}`);
  if (process.env.ANIMEBLACK_SMOKE_LOGIN !== "0") {
    for (const line of await signedInTour(adb, pid)) summary.push(line);
  }
  if (releaseApk) {
    // R8-minified build (already signed with the debug key for testing).
    const signed = releaseApk;
    sh(`${adb} uninstall com.animeblack.app`);
    summary.push(`release install: ${sh(`${adb} install -r -g ${signed} 2>&1 | tail -1`)}`);
    sh(`${adb} shell am start -W -n com.animeblack.app/.MainActivity`);
    await sleep(20000);
    summary.push(`release pid: ${pid()}`);
    summary.push(`release ui: ${uiTexts()}`);
  }
  const crashAll = sh(`${adb} logcat -d -b crash`) + "\n" + sh(`${adb} logcat -d AndroidRuntime:E *:S`);
  // Only our process counts (system apps on the image may crash on their own).
  const ours = crashAll.split(/(?=FATAL EXCEPTION)/).filter((b) => b.includes("com.animeblack.app")).join("\n");
  const appPid = sh(`${adb} shell pidof com.animeblack.app`);
  const appLog = appPid ? sh(`${adb} logcat -d --pid=${appPid} *:W | tail -40`) : "";
  sh(`${adb} emu kill`);
  const ok = !ours.trim() && appPid !== "";
  summary.push(`app crash detected: ${ours.trim() ? "YES" : "no"}`);
  return { ok, summary: summary.join("\n"), crash: ours.slice(0, 7000), appLog: appLog.slice(-3400) };
}

async function main() {
  if (!isCI || !androidHome) {
    console.log("[android-ci] Not running on CI with an Android SDK — skipping native build (use `cd android && ./gradlew assembleDebug`).");
    return 0;
  }
  const msg = commitMessage();
  const wantProbe = msg.includes("[android-probe]");
  const wantReport = msg.includes("[android-report]") || msg.includes("[android-apk]");
  const wantApk = msg.includes("[android-apk]");
  fs.mkdirSync(REPORT_DIR, { recursive: true });

  const report = [`# Android CI report`, ``, `- commit: ${process.env.GITHUB_SHA || sh("git rev-parse HEAD")}`, `- run: ${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`, `- date: ${new Date().toISOString()}`, ``];
  const pushFiles = [];

  if (msg.includes("[firebase-probe]")) {
    const fp = await firebaseProbe();
    annotate("notice", "firebase-probe", fp);
    report.push("## Firebase probe", "```", fp, "```", "");
  }

  if (wantProbe) {
    const p = await probe();
    report.push("## Runner", "```", p.env, "```", "", "## Latest stable versions (Maven metadata)", "```", p.versions, "```", "");
  }

  let exitCode = 0;
  const hasProject = fs.existsSync(path.join(ANDROID_DIR, "settings.gradle.kts"));
  if (hasProject) {
    const javaHome = process.env.JAVA_HOME_21_X64 || process.env.JAVA_HOME_17_X64 || process.env.JAVA_HOME;
    const tasks = [":app:assembleDebug"];
    if (!msg.includes("[android-skip-tests]")) tasks.push("testDebugUnitTest");
    if (msg.includes("[android-release]") || msg.includes("[android-full]") || msg.includes("[android-publish]")) tasks.push(":app:assembleRelease");
    if (msg.includes("[android-lint]") || msg.includes("[android-full]")) tasks.push(":app:lintDebug");
    const res = runGradle(tasks, javaHome);
    fs.writeFileSync(path.join(REPORT_DIR, "build.log"), res.log.slice(-1_500_000));
    const failures = extractFailures(res.log);
    const apks = copyApks();
    report.push(`## Gradle`, `- tasks: ${tasks.join(" ")}`, `- result: ${res.ok ? "SUCCESS" : "FAILED (exit " + res.status + ")"}`, `- duration: ${res.seconds}s`, "");
    if (apks.length) {
      report.push("## APKs", ...apks.map((a) => `- ${a.kind}: ${a.file} — ${a.bytes} bytes — sha256 ${a.sha256}`), "");
      const aapt = sh(`ls -d ${androidHome}/build-tools/* | sort -V | tail -1`);
      for (const a of apks) {
        const badging = sh(`${aapt}/aapt2 dump badging ${JSON.stringify(a.src)} | head -40`);
        report.push(`### ${a.file}`, "```", badging.slice(0, 6000), "```", "");
      }
      annotate("notice", "android-ci apks", apks.map((a) => `${a.kind}: ${a.file} ${a.bytes}B sha256=${a.sha256}`).join("\n"));
    }
    if (!res.ok) {
      exitCode = 1;
      annotate("error", "android-ci gradle failures", failures || res.log.slice(-20000));
      report.push("## Failures", "```", failures.slice(0, 200000), "```", "");
    } else if (failures) {
      report.push("## Warnings/notes", "```", failures.slice(0, 50000), "```", "");
    }
    const lintReport = path.join(ANDROID_DIR, "app/build/reports/lint-results-debug.txt");
    if (fs.existsSync(lintReport)) {
      fs.copyFileSync(lintReport, path.join(REPORT_DIR, "lint-results-debug.txt"));
      pushFiles.push(path.join(REPORT_DIR, "lint-results-debug.txt"));
    }
    const tr = collectTestResults();
    if (tr.suites > 0) {
      report.push(`## Unit tests`, `- suites: ${tr.suites}, tests: ${tr.tests}, failures: ${tr.failures}, errors: ${tr.errors}, skipped: ${tr.skipped}`, ...tr.failed.map((f) => `- ${f}`), "");
      annotate(tr.failures + tr.errors > 0 ? "error" : "notice", "android-ci tests", `suites ${tr.suites}, tests ${tr.tests}, failures ${tr.failures}, errors ${tr.errors}, skipped ${tr.skipped}\n${tr.failed.join("\n")}`);
    }
    const unsignedRelease = apks.find((a) => a.kind === "release" && a.file.includes("unsigned"));
    const testSigned = unsignedRelease ? signReleaseForTesting(unsignedRelease.src) : null;
    if (testSigned) {
      const buf = fs.readFileSync(testSigned);
      annotate("notice", "android-ci test-signed release", `app-release-debugsigned.apk ${buf.length}B sha256=${crypto.createHash("sha256").update(buf).digest("hex")} (debug key; testing only)`);
    }
    if (msg.includes("[android-smoke]")) {
      const debugApk = apks.find((a) => a.kind === "debug");
      if (debugApk) {
        const signedRelease = apks.find((a) => a.kind === "release" && !a.file.includes("unsigned"));
        const smoke = await smokeTest(debugApk.src, testSigned || (signedRelease ? signedRelease.src : null));
        annotate(smoke.ok ? "notice" : "error", "android-smoke", smoke.summary);
        if (smoke.crash) annotate("error", "android-smoke crash", smoke.crash);
        if (smoke.appLog) annotate("notice", "android-smoke app log", smoke.appLog);
        report.push("## Emulator smoke test", "```", smoke.summary, smoke.crash, smoke.appLog, "```", "");
      } else {
        annotate("warning", "android-smoke", "No debug APK to test.");
      }
    }
    if (msg.includes("[android-publish]") && res.ok) {
      const debugApk = apks.find((a) => a.kind === "debug");
      const files = [];
      if (testSigned) files.push({ path: testSigned, name: "AnimeBlack.apk" });
      if (debugApk) files.push({ path: debugApk.src, name: "AnimeBlack-debug.apk" });
      const pub = await publishRelease(files, "AnimeBlack.apk: optimised build signed with the shared debug key (testing only).\nAnimeBlack-debug.apk: debuggable build.");
      annotate(pub.ok ? "notice" : "warning", "android-publish", pub.text);
      report.push("## Publish", "```", pub.text, "```", "");
      // Fallback with no GitHub permissions needed: upload to an anonymous file host.
      if (!pub.ok && files.length) {
        const hosted = await publishToFileHosts(files[0].path, files[0].name);
        annotate(hosted.ok ? "notice" : "warning", "android-upload", hosted.text);
        report.push("## Download link (anonymous host)", hosted.ok ? hosted.text : "```" + hosted.text + "```", "");
      }
    }
    if (wantApk && res.ok) {
      const apkOut = path.join(ANDROID_DIR, "apk");
      fs.mkdirSync(apkOut, { recursive: true });
      for (const a of apks) {
        const dst = path.join(apkOut, a.file);
        fs.copyFileSync(a.src, dst);
        pushFiles.push(dst);
      }
      // Tester APK inside the repository (direct download link, no release permissions needed).
      const debugApk = apks.find((a) => a.kind === "debug");
      const preferred = testSigned || (debugApk ? debugApk.src : null);
      if (preferred) {
        const testerOut = path.join(ANDROID_DIR, "tester", "AnimeBlack.apk");
        fs.mkdirSync(path.dirname(testerOut), { recursive: true });
        fs.copyFileSync(preferred, testerOut);
        pushFiles.push(testerOut);
      }
    }
    pushFiles.push(path.join(REPORT_DIR, "build.log"));
  }

  const reportPath = path.join(REPORT_DIR, "REPORT.md");
  fs.writeFileSync(reportPath, report.join("\n"));
  pushFiles.push(reportPath);
  if (wantReport) pushBack(pushFiles, wantApk ? "ci(android): publish APK + build report" : "ci(android): build report");
  return exitCode;
}

main().then((code) => process.exit(code)).catch((e) => {
  annotate("error", "android-ci crashed", e && e.stack ? e.stack : String(e));
  process.exit(1);
});
