#!/usr/bin/env node
/* Photographs every step of the hero's Sprout Assist demo at 3x, then tiles them
   side by side, so the flow can be reviewed at a glance and compared with Figma.
   Usage: node review/assist-flow-shots.mjs [url] [outDir]
   Default url: http://localhost:4320  (the reach-scene-iteration preview)
   Needs puppeteer in ~/node_modules (same as the carousel exporter). */
import { createRequire } from "node:module";
import { homedir } from "node:os";
import { join, resolve } from "node:path";
import { mkdirSync } from "node:fs";

import { existsSync, readdirSync } from "node:fs";
// puppeteer from ~/node_modules if present, else any puppeteer-core in the npx cache
// driving the installed Google Chrome
function loadPuppeteer() {
  try { return { lib: createRequire(join(homedir(), "node_modules", "noop.js"))("puppeteer"), opts: {} }; } catch {}
  const npx = join(homedir(), ".npm", "_npx");
  for (const d of existsSync(npx) ? readdirSync(npx) : []) {
    const core = join(npx, d, "node_modules", "puppeteer-core");
    if (existsSync(core)) return { lib: createRequire(join(core, "noop.js"))("puppeteer-core"),
      opts: { executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" } };
  }
  throw new Error("No puppeteer found. Run: npm i -g puppeteer (or npx puppeteer once)");
}
const { lib: puppeteer, opts: launchOpts } = loadPuppeteer();
const url = process.argv[2] || "http://localhost:4320";
const out = resolve(process.argv[3] || "review/shots");
mkdirSync(out, { recursive: true });
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox", "--force-color-profile=srgb"], ...launchOpts });
const page = await browser.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));

async function shot(name, wide = true) {
  const clip = await page.evaluate((wide) => {
    const a = document.querySelector("#hero-screen-panel").getBoundingClientRect();
    const s = document.querySelector(".spouse-phone");
    const b = wide && s && getComputedStyle(s).display !== "none" ? s.getBoundingClientRect() : a;
    const x = Math.min(a.left, b.left) - 16, y = Math.min(a.top, b.top) - 16;
    return { x, y, width: Math.max(a.right, b.right) + 16 - x, height: Math.max(a.bottom, b.bottom) + 40 - y };
  }, wide);
  await page.screenshot({ path: join(out, name + ".png"), clip });
}
const click = (sel) => page.evaluate((sel) => document.querySelector(sel).click(), sel);
// screens switch from the phone's own tab bar (the visible screen's copy of it)
// (screens without a tab bar, like "Reminder set", fall back to the app's delegated handler)
const nav = (key) => page.evaluate((k) => (document.querySelector(`.sa-screen.is-on [data-nav="${k}"]`) || document.querySelector(`.assist-app [data-nav="${k}"]`)).click(), key);

await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 3 });
await page.goto(url, { waitUntil: "networkidle0" });
await wait(1600);
await shot("1-menu");
await click('[data-pick="reminder"]');
await wait(500);
await shot("2-working"); // the orb's working beat, before it listens
await page.waitForSelector(".sa-listen:not(.is-warming)", { timeout: 8000 });
await wait(400);
await shot("2b-listening");
await page.waitForSelector(".sa-listen.is-heard", { timeout: 8000 });
await wait(300);
await shot("3-heard");
await page.waitForSelector(".sa-listen.is-heard", { timeout: 8000 }); // the working beat, then listening
await click('[data-act="done"]');
await wait(1500);
await shot("4-review");
await click('[data-act="set"]');
await wait(700);
await shot("5-flying");
await wait(1200);
await shot("6-delivered");
// Matt's phone carries the full shared Daily Brief: photograph it alone at each scroll
async function spouseShot(name) {
  const clip = await page.evaluate(() => {
    const r = document.querySelector(".spouse-phone").getBoundingClientRect();
    return { x: r.left - 12, y: r.top - 12, width: r.width + 24, height: r.height + 24 };
  });
  await page.screenshot({ path: join(out, name + ".png"), clip });
}
await wait(3000);
await spouseShot("6a-matt-top");
for (const [y, name] of [[700, "6b-matt-mid"], [99999, "6c-matt-end"]]) {
  await page.evaluate((y) => { document.querySelector(".mt-scroll").scrollTop = y; }, y);
  await wait(300);
  await spouseShot(name);
}
await page.evaluate(() => { document.querySelector(".mt-scroll").scrollTop = 0; });

// Daily Brief tab: coded, scrollable inside the phone
await nav("brief");
await wait(900);
await shot("8-brief-top", false);
for (const [y, name] of [[620, "9-brief-mid"], [99999, "10-brief-end"]]) {
  await page.evaluate((y) => { document.querySelector(".db-scroll").scrollTop = y; }, y);
  await wait(300);
  await shot(name, false);
}
for (const tab of ["chat", "clubs"]) {
  await nav(tab);
  await wait(900);
  await shot(`11-${tab}-top`, false);
  await page.evaluate((t) => { document.querySelector(t === "chat" ? ".ch-scroll" : ".cl-scroll").scrollTop = 99999; }, tab);
  await wait(300);
  await shot(`12-${tab}-end`, false);
}
await nav("brief");
await wait(900);
await page.evaluate(() => document.querySelector(".db-todo").click());
await wait(200);
const todo = await page.evaluate(() => document.querySelector(".att-count").textContent);
await page.evaluate(() => document.querySelector('[data-nav="assist"]').click());
await wait(900);
const navToAssist = await page.evaluate(() => document.querySelector('[data-s="home"]').classList.contains("is-on"));

await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
await page.goto(url, { waitUntil: "networkidle0" });
await wait(1400);
await click('[data-pick="reminder"]');
await wait(2600);
await page.waitForSelector(".sa-listen.is-heard", { timeout: 8000 }); // the working beat, then listening
await click('[data-act="done"]');
await wait(1500);
await click('[data-act="set"]');
await wait(1500);
await page.screenshot({ path: join(out, "7-mobile-delivered.png"), clip: { x: 0, y: 380, width: 390, height: 560 } });
const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);

await browser.close();
console.log(JSON.stringify({ out, errors, mobileOverflowPx: overflow, todoAfterTap: todo, navToAssist }));
