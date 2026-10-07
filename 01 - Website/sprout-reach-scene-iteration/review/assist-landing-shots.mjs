#!/usr/bin/env node
/* Photographs assist.html (the Sprout Assist landing) for review: every section at desktop as a
   visitor sees it, then the whole page at desktop and phone width. Also fails loudly on horizontal overflow and
   console errors, so a broken layout is a non-zero exit, not something to spot by eye.
   Usage: node review/assist-landing-shots.mjs [url] [outDir]
   Default url: http://localhost:4320/assist  (the reach-scene-iteration preview) */
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
const url = process.argv[2] || "http://localhost:4320/assist";
const out = resolve(process.argv[3] || "review/shots/assist-landing");
mkdirSync(out, { recursive: true });
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// protocolTimeout: a stuck call fails loudly instead of hanging the run (seen 6 Oct after the live mascot)
const browser = await puppeteer.launch({ headless: "new", protocolTimeout: 30000, ...opts });
const problems = [];

async function open(width, height, scale) {
  const page = await browser.newPage();
  page.on("console", (m) => m.type() === "error" && problems.push(`${width}px console: ${m.text()}`));
  page.on("pageerror", (e) => problems.push(`${width}px pageerror: ${e.message}`));
  await page.setViewport({ width, height, deviceScaleFactor: scale });
  await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });
  await page.evaluate(() => document.fonts.ready);
  return page;
}

// the film teaser: a frame at each beat of the story, desktop and phone
async function filmShots(page, tag) {
  if (!(await page.$("#film"))) return; // the film section was removed 6 Oct (the portal replaced it)
  await page.evaluate(() => document.getElementById("film").scrollIntoView({ block: "center" }));
  let t = 0;
  for (const [name, ms] of [["1-title", 900], ["2-ask", 3600], ["3-matt", 7400], ["4-form", 10300], ["5-pay", 12600], ["6-approved", 14600], ["7-close", 17600]]) {
    await wait(ms - t); t = ms;
    const el = await page.$("#film");
    await el.screenshot({ path: join(out, `film-${tag}-${name}.png`) });
  }
}

// desktop: the hero, then each section as a visitor sees it (scrolled in, after its pieces rise)
const d = await open(1440, 900, 2);
await wait(1500);
await d.screenshot({ path: join(out, "d-00-hero.png") });
const n = await d.evaluate(() => document.querySelectorAll("main > section").length);
for (let k = 1; k < n; k++) {
  await d.evaluate((k) => document.querySelectorAll("main > section")[k].scrollIntoView({ block: "center" }), k);
  await wait(1400);
  await d.screenshot({ path: join(out, `d-${String(k).padStart(2, "0")}.png`) });
}
await filmShots(d, "1440");
const overflowD = await d.evaluate(() => document.documentElement.scrollWidth - innerWidth);
if (overflowD > 0) problems.push(`1440px: page is ${overflowD}px wider than the window`);
await d.evaluate(() => document.querySelectorAll(".reveal").forEach((a) => a.classList.add("is-in")));
// 1x for the full page: at 2x the page passes Chrome's 16,384 px capture limit and repeats itself
await d.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
await d.screenshot({ path: join(out, "page-1440.png"), fullPage: true });

// phone width (1.5x: a 3x full-page shot passes Chrome's 16,384 px limit and tiles)
const m = await open(390, 844, 1.5);
await filmShots(m, "390");
await m.evaluate(() => document.querySelectorAll(".reveal").forEach((a) => a.classList.add("is-in")));
await wait(1200);
const overflowM = await m.evaluate(() => document.documentElement.scrollWidth - innerWidth);
if (overflowM > 0) problems.push(`390px: page is ${overflowM}px wider than the window`);
await m.screenshot({ path: join(out, "page-390.png"), fullPage: true });

// waitlist: a bad email is refused, a good one is accepted, nothing is sent anywhere.
// Driven through the DOM (no real clicks), so nothing here can hang on a hidden element.
const requests = [];
m.on("request", (r) => (["xhr", "fetch"].includes(r.resourceType()) || r.method() !== "GET") && requests.push(`${r.method()} ${r.url()}`));
const submit = (v) => m.evaluate((v) => {
  const f = document.querySelector("#join form, #join [data-join]");
  f.querySelector("input").value = v;
  f.requestSubmit();
  return f.querySelector(".join-msg").textContent;
}, v);
const bad = await submit("not-an-email");
const good = await submit("parent@example.com");
if (!/doesn't look right/.test(bad)) problems.push("waitlist: bad email was not refused");
if (!/on the list/.test(good)) problems.push("waitlist: good email was not accepted");
await wait(500);
if (requests.length) problems.push(`waitlist: the form made requests: ${requests.join(", ")}`);

await Promise.race([browser.close(), wait(5000)]);
browser.process()?.kill("SIGKILL");
console.log(`Shots in ${out}`);
if (problems.length) {
  console.log("PROBLEMS:\n- " + problems.join("\n- "));
  process.exit(1);
}
console.log("OK: no overflow at 1440 or 390, no console errors, waitlist refuses and accepts, sends nothing.");
