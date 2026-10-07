#!/usr/bin/env node
/* Walks the Carpool → Live Activity story: idle card at 50% → "Try a carpool request"
   → listening (carpool copy) → review → posted → Sarah says yes → the card goes live,
   counts down and the bus drives to school. Also runs it at phone width, where the card
   arrives as a toast. Usage: node review/carpool-shots.mjs [url] [outDir] */
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
const tap = async (sel) => {
  const p = await page.evaluate((sel) => { const b = document.querySelector(sel).getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2 }; }, sel);
  await page.mouse.click(p.x, p.y);
};
// the phone plus the Lock Screen stack beside it
const shot = async (name) => {
  const r = await page.evaluate(() => {
    const els = [".la-stack", "#hero-screen-panel"].map((s) => document.querySelector(s)).filter((e) => e && getComputedStyle(e).display !== "none").map((e) => e.getBoundingClientRect());
    const x = Math.min(...els.map((b) => b.left)) - 16, y = Math.min(...els.map((b) => b.top)) - 16;
    return { x, y, width: Math.max(...els.map((b) => b.right)) + 16 - x, height: Math.max(...els.map((b) => b.bottom)) + 16 - y };
  });
  await page.screenshot({ path: join(out, name + ".png"), clip: r });
};
const state = () => page.evaluate(() => ({
  screen: document.querySelector(".assist-app .sa-screen.is-on")?.dataset.s,
  slot: [...document.querySelector('[data-la="carpool"]').classList].find((c) => c.startsWith("is-")),
  button: document.querySelector(".la-try").textContent,
  l1: document.querySelector(".la-stack .l1").textContent,
  note: document.querySelector(".sa-note").classList.contains("is-on"),
  spouse: !document.querySelector(".spouse-phone").hidden,
  chatMessages: document.querySelectorAll(".cc-message").length,
}));
const log = {};
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 3 });
await page.goto(url, { waitUntil: "networkidle0" });
await wait(1400);
log.idle = await state();
await shot("c1-idle");
await tap(".la-try");
await wait(700);
log.listening = await state();
log.quote = await page.evaluate(() => document.querySelector(".sa-listen .q").textContent);
await wait(1400);
await shot("c2-listening");
await page.waitForSelector(".sa-listen.is-heard", { timeout: 8000 }); // the working beat, then listening
await tap(".sa-check");
await wait(1700);
log.review = await state();
await shot("c3-review");
await page.evaluate(() => { document.querySelector(".cp-scroll").scrollTop = 9999; });
await wait(300);
await shot("c4-review-end");
await tap('.sa-cpreview [data-act="post"]');
await wait(900);
log.posted = await state();
await shot("c5-posted");
await wait(1700);
log.live = await state();
await shot("c6-chat-open");
await page.type(".cc-input", "Thanks Sarah, where should we meet?");
await tap(".cc-send");
await wait(140);
log.sent = await state();
await shot("c6a-chat-sent");
await wait(900);
log.replied = await state();
await shot("c6b-chat-reply");
await wait(6000);
log.mid = await state();
await shot("c7-driving");
await wait(15500);
log.done = await state();
await shot("c8-done");
// the reminder story still works after a carpool
await tap('.assist-app > .sa-nav [data-nav="assist"]');
await wait(700);
await page.evaluate(() => document.querySelector('[data-pick="reminder"]').click());
await wait(600);
log.reminderAfter = { ...(await state()), quote: await page.evaluate(() => document.querySelector(".sa-listen .q").textContent) };

// phone width: start from the menu's Carpool row, the card arrives as a toast
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
await page.goto(url, { waitUntil: "networkidle0" });
await wait(1200);
await page.evaluate(() => document.querySelector('[data-pick="carpool"]').click());
await wait(1900);
await page.waitForSelector(".sa-listen.is-heard", { timeout: 8000 }); // the working beat, then listening
await page.evaluate(() => document.querySelector(".sa-check").click());
await wait(1500);
await page.evaluate(() => document.querySelector('.sa-cpreview [data-act="post"]').click());
await wait(3000);
log.mobileToast = await page.evaluate(() => document.querySelector(".la-toast").classList.contains("is-on"));
await page.screenshot({ path: join(out, "c9-mobile-toast.png"), clip: { x: 0, y: 320, width: 390, height: 520 } });
log.mobileOverflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
await browser.close();
const failures = [];
if (errors.length) failures.push(...errors);
if (log.live.screen !== "carpool-chat") failures.push(`acceptance opened ${log.live.screen}, not carpool-chat`);
if (log.sent.chatMessages !== 3) failures.push(`send produced ${log.sent.chatMessages} messages, expected 3`);
if (log.replied.chatMessages !== 4) failures.push(`Sarah reply produced ${log.replied.chatMessages} messages, expected 4`);
if (log.mobileOverflow !== 0) failures.push(`mobile overflow is ${log.mobileOverflow}px`);
console.log(JSON.stringify({ errors, ...log }, null, 1));
if (failures.length) throw new Error(failures.join("\n"));
