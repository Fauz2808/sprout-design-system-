#!/usr/bin/env node
/* Walks the hero phone's tab bar (Daily Brief → Events → Sprout Assist → Chat → Clubs)
   and photographs each tab, the Events week strip and My Events, one frame mid tab
   switch, and the tab bar hiding during a Sprout Assist flow. Then tiles them.
   Usage: node review/tab-shots.mjs [url] [outDir] */
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
  throw new Error("No puppeteer found");
}
const { lib: puppeteer, opts } = loadPuppeteer();
const url = process.argv[2] || "http://localhost:4320";
const out = resolve(process.argv[3] || "review/shots");
mkdirSync(out, { recursive: true });
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox", "--force-color-profile=srgb"], ...opts });
const page = await browser.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 3 });
await page.goto(url, { waitUntil: "networkidle0" });
await wait(1400);

const shot = async (name) => {
  const r = await page.evaluate(() => { const b = document.querySelector("#hero-screen-panel").getBoundingClientRect(); return { x: b.left - 8, y: b.top - 8, width: b.width + 16, height: b.height + 16 }; });
  await page.screenshot({ path: join(out, name + ".png"), clip: r });
};
// real pointer taps on the tab bar, like a visitor
const tap = async (sel) => {
  const p = await page.evaluate((sel) => { const b = document.querySelector(sel).getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2 }; }, sel);
  await page.mouse.click(p.x, p.y);
};
const state = () => page.evaluate(() => ({
  screen: document.querySelector(".assist-app .sa-screen.is-on")?.dataset.s,
  tab: document.querySelector(".assist-app > .sa-nav .on")?.dataset.nav,
  navAway: document.querySelector(".assist-app > .sa-nav").classList.contains("is-away"),
}));
const log = [];
for (const [key, name] of [["brief", "t1-brief"], ["events", "t2-events"], ["assist", "t3-assist"], ["chat", "t4-chat"], ["clubs", "t5-clubs"]]) {
  await tap(`.assist-app > .sa-nav [data-nav="${key}"]`);
  if (key === "chat") { await wait(110); await shot("t4-chat-mid-switch"); }
  await wait(600);
  log.push({ key, ...(await state()) });
  await shot(name);
}
// Events: another day, then My Events
await tap('.assist-app > .sa-nav [data-nav="events"]');
await wait(600);
await tap('.sa-events [data-day="26"]');
await wait(500);
const sat = await page.evaluate(() => [...document.querySelectorAll('.sa-events [data-list="discover"] h4')].map((h) => h.textContent));
await shot("t6-events-sat");
await page.evaluate(() => { document.querySelector(".ev-scroll").scrollTop = 99999; });
await wait(300);
await shot("t7-events-sat-end");
await tap('.sa-events [data-evtab="mine"]');
await wait(500);
await shot("t8-my-events");
// tapping the active tab scrolls back to the top
await tap('.sa-events [data-evtab="discover"]');
await page.evaluate(() => { document.querySelector(".ev-scroll").scrollTop = 400; });
await tap('.assist-app > .sa-nav [data-nav="events"]');
await wait(700);
const scrolledTop = await page.evaluate(() => document.querySelector(".ev-scroll").scrollTop);
// a Sprout Assist flow hides the tab bar, and it comes back
await tap('.assist-app > .sa-nav [data-nav="assist"]');
await wait(600);
await page.evaluate(() => document.querySelector('[data-pick="reminder"]').click());
await wait(700);
const inFlow = await state();
await shot("t9-flow-no-tabbar");
await page.evaluate(() => document.querySelector('.sa-listen [data-go="home"], .sa-listen .sa-back')?.click());
await wait(700);
const backHome = await state();
await browser.close();
console.log(JSON.stringify({ out, errors, log, satEvents: sat, scrolledTopAfterRetap: scrolledTop, inFlow, backHome }, null, 1));
