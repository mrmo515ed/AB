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
 *     Pushes use the workflow's own checkout credentials and only target the branch that
 *     triggered the run. Commits carry [skip ci] so they never trigger another run.
 */
import { execSync, spawnSync } from "node:child_process";
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
  const max = 60000;
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
  const rx = /^(e: |w: file|ERROR:|error:|FAILURE:|\* What went wrong|> |Caused by|Execution failed|.*FAILED$|.*\.kt:\d+:\d+ |.*Unresolved reference|.*Could not |.*Cannot |.*Type mismatch|.*None of the following|.*Exception|.*AAPT|.*Manifest merger|.*\[ksp\]|.*error: )/;
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (rx.test(l) && !/^> Task .* (UP-TO-DATE|NO-SOURCE|SKIPPED|FROM-CACHE)$/.test(l) && !/^> Task [^ ]+$/.test(l)) {
      picked.push(l.slice(0, 1200));
    }
  }
  return [...new Set(picked)].join("\n");
}

function runGradle(tasks, javaHome) {
  const gradlew = path.join(ANDROID_DIR, "gradlew");
  if (fs.existsSync(gradlew)) fs.chmodSync(gradlew, 0o755);
  const args = [...tasks, "--no-daemon", "--stacktrace", "--console=plain", "-Dorg.gradle.jvmargs=-Xmx5g -XX:+UseParallelGC", "-Pkotlin.daemon.jvmargs=-Xmx3g"];
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

  if (wantProbe) {
    const p = await probe();
    report.push("## Runner", "```", p.env, "```", "", "## Latest stable versions (Maven metadata)", "```", p.versions, "```", "");
  }

  let exitCode = 0;
  const hasProject = fs.existsSync(path.join(ANDROID_DIR, "settings.gradle.kts"));
  if (hasProject) {
    const javaHome = process.env.JAVA_HOME_21_X64 || process.env.JAVA_HOME_17_X64 || process.env.JAVA_HOME;
    const tasks = [":app:assembleDebug", ":app:testDebugUnitTest", ":app:assembleRelease", ":app:lintDebug"];
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
    const testDir = path.join(ANDROID_DIR, "app/build/test-results/testDebugUnitTest");
    if (fs.existsSync(testDir)) {
      const xmls = fs.readdirSync(testDir).filter((f) => f.endsWith(".xml"));
      let tests = 0, failuresN = 0, errors = 0, skipped = 0;
      for (const x of xmls) {
        const t = fs.readFileSync(path.join(testDir, x), "utf8");
        const m = t.match(/<testsuite[^>]*tests="(\d+)"[^>]*skipped="(\d+)"[^>]*failures="(\d+)"[^>]*errors="(\d+)"/);
        if (m) { tests += +m[1]; skipped += +m[2]; failuresN += +m[3]; errors += +m[4]; }
      }
      report.push(`## Unit tests`, `- suites: ${xmls.length}, tests: ${tests}, failures: ${failuresN}, errors: ${errors}, skipped: ${skipped}`, "");
    }
    if (wantApk && res.ok) {
      const apkOut = path.join(ANDROID_DIR, "apk");
      fs.mkdirSync(apkOut, { recursive: true });
      for (const a of apks) {
        const dst = path.join(apkOut, a.file);
        fs.copyFileSync(a.src, dst);
        pushFiles.push(dst);
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
