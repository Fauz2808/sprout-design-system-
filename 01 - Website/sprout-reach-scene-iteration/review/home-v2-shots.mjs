#!/usr/bin/env node
/* Photographs home-v2.html (website v2) at each scroll stage a visitor passes: the sky hero, the notes flying out
   of the portal, the Daily Brief landing centred under "Sprout puts them in one place", the brief moved right and
   scrolling, a class step, a directory step, the Assist carousel and the close. Desktop and phone width.
   Fails (non-zero exit) on horizontal overflow, console errors, or a landing that doesn't centre then settle.
   Usage: node review/home-v2-shots.mjs [url] [outDir]
   Default url: http://localhost:4320/home-v2  (the reach-scene-iteration preview) */
import { createRequire } from "node:module";
import { homedir } from "node:os";
import { join, resolve } from "node:path";
import { mkdirSync, existsSync, readdirSync } from "node:fs";

function loadPuppeteer() {
  try { return { lib: createRequire(join(homedir(), "node_modules", "noop.js"))("puppeteer"), opts: {} }; } catch {}
  const npx = join(homedir(), ".npm", "_npx");
  for (const d of existsSync(npx) ? readdirSync(npx) : []) {
    const core = join(npx, d, "node_modules", "puppeteer-core");
    if (existsSync(core)) return { lib: createRequire(join(core, "noop.js"))("puppeteer-core"),
      opts: { executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" } };
  }
  // last resort: the puppeteer-core the video projects install (~/Sprout/<area>/<project>/node_modules)
  const sprout = join(homedir(), "Sprout");
  for (const area of existsSync(sprout) ? readdirSync(sprout) : []) {
    const dir = join(sprout, area);
    let kids = [];
    try { kids = readdirSync(dir); } catch { continue; }
    for (const p of kids) {
      const core = join(dir, p, "node_modules", "puppeteer-core");
      if (existsSync(core)) return { lib: createRequire(join(core, "noop.js"))("puppeteer-core"),
        opts: { executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" } };
    }
  }
  throw new Error("No puppeteer found. Run: npm i -g puppeteer (or npx puppeteer once)");
}
const { lib: puppeteer, opts } = loadPuppeteer();
const url = process.argv[2] || "http://localhost:4320/home-v2";
const out = resolve(process.argv[3] || "review/shots/home-v2");
mkdirSync(out, { recursive: true });
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await puppeteer.launch({ headless: "new", protocolTimeout: 30000, ...opts });
const problems = [];

async function open(width, height, scale) {
  const page = await browser.newPage();
  page.on("console", (m) => m.type() === "error" && problems.push(`${width}px console: ${m.text()}`));
  page.on("pageerror", (e) => problems.push(`${width}px pageerror: ${e.message}`));
  await page.setViewport({ width, height, deviceScaleFactor: scale });
  await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });
  await page.evaluate(() => { document.fonts.ready; document.documentElement.style.scrollBehavior = "auto"; });
  return page;
}
// scroll to a point inside a section's own scroll run (0 = its top reaches the window top, 1 = its end)
const at = (page, id, f) => page.evaluate((id, f) => {
  const s = document.getElementById(id);
  scrollTo(0, s.offsetTop + Math.max(0, s.offsetHeight - innerHeight) * f);
}, id, f);
const step = (page, sel) => page.evaluate((sel) => {
  const s = document.querySelector(sel);
  scrollTo(0, s.getBoundingClientRect().top + scrollY - innerHeight / 2 + 40);
}, sel);
const shot = async (page, name, ms = 700) => { await wait(ms); await page.screenshot({ path: join(out, name + ".png") }); };

async function run(width, height, scale, tag) {
  const p = await open(width, height, scale);
  await shot(p, `${tag}-01-hero`, 1500);
  await at(p, "portal", 0.45); await shot(p, `${tag}-02-notes`);
  await at(p, "portal", 0.9); await shot(p, `${tag}-03-notes-end`);
  await at(p, "brief", 0.04); await shot(p, `${tag}-04-landing`, 1500);
  const landing = await p.evaluate(() => {
    const pin = document.querySelector("#brief .scrolly-pin"), ph = document.getElementById("briefPhone").getBoundingClientRect();
    return { off: Math.abs(ph.left + ph.width / 2 - innerWidth / 2), intro: getComputedStyle(document.querySelector(".brief-intro")).opacity, in: pin.style.getPropertyValue("--in") };
  });
  if (landing.off > 4) problems.push(`${tag}: the landing phone is ${Math.round(landing.off)}px off centre`);
  if (Number(landing.intro) < 0.9) problems.push(`${tag}: "Sprout puts them in one place" is not showing at the landing`);
  await at(p, "brief", 0.22); await shot(p, `${tag}-05-moving`, 1500);
  await at(p, "brief", 0.42); await shot(p, `${tag}-06-settled`, 1500);
  const settled = await p.evaluate(() => document.querySelector("#brief .scrolly-pin").style.getPropertyValue("--in"));
  if (settled !== "1.000") problems.push(`${tag}: the brief has not settled by 42% of its run (--in ${settled})`);
  // Lydia's shared to-do, on the scroll (raw 0.36-0.50): showing, flying in, landed, and back out on the way up
  const shared = () => p.evaluate(() => ({ note: Number(getComputedStyle(document.querySelector(".v2-notif")).opacity), row: document.querySelector(".v2-new").offsetHeight }));
  await at(p, "brief", 0.42); await shot(p, `${tag}-06b-shared-notification`, 1200);
  const s1 = await shared();
  if (s1.note < 0.9 || s1.row > 2) problems.push(`${tag}: at 42% the notification should show and the row be closed (${JSON.stringify(s1)})`);
  await at(p, "brief", 0.46); await shot(p, `${tag}-06c-shared-flying`, 1200);
  await at(p, "brief", 0.52); await shot(p, `${tag}-06d-shared-landed`, 1200);
  const s2 = await shared();
  if (s2.note > 0.05 || s2.row < 40) problems.push(`${tag}: at 52% the to-do should have landed (${JSON.stringify(s2)})`);
  await at(p, "brief", 0.38); await wait(1200);
  const s3 = await shared();
  if (s3.row > 2) problems.push(`${tag}: scrolling back up should take the to-do back out (row ${s3.row}px)`);
  await at(p, "brief", 0.75); await shot(p, `${tag}-07-brief-scrolled`, 1500);
  await step(p, '#classes .step[data-step="calendar"]'); await shot(p, `${tag}-08-class-calendar`, 1200);
  await step(p, '#directory .step[data-step="profile"]'); await shot(p, `${tag}-09-dir-profile`, 1200);
  await p.evaluate(() => document.getElementById("assist").scrollIntoView()); await shot(p, `${tag}-10-assist`);
  await p.evaluate(() => document.getElementById("download").scrollIntoView()); await shot(p, `${tag}-11-close`);
  const over = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  if (over > 0) problems.push(`${tag}: page is ${over}px wider than the window`);
}
await run(1440, 900, 1, "d");
await run(390, 844, 2, "m");

await Promise.race([browser.close(), wait(5000)]);
browser.process()?.kill("SIGKILL");
console.log(`Shots in ${out}`);
if (problems.length) { console.log("PROBLEMS:\n- " + problems.join("\n- ")); process.exit(1); }
console.log("OK: landing centred then settled, no overflow at 1440 or 390, no console errors.");
