#!/usr/bin/env node
/* Walks the Event story: Emily's phone at 50% → "Try creating an event" (pressed from
   another tab) → listening (event copy) → review → send invites → sent → the invite
   lands on Emily's phone and she joins → "My Events" shows the hosted event. Also runs
   at phone width, where the invite arrives as a notification.
   Usage: node review/event-shots.mjs [url] [outDir] */
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
const click = (sel) => page.evaluate((sel) => document.querySelector(sel).click(), sel);
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
  slot: [...document.querySelector('[data-la="event"]').classList].find((c) => c.startsWith("is-")),
  button: document.querySelector('[data-la-try="event"]').textContent,
  folks: document.querySelector(".evp-folks").textContent,
  joined: document.querySelector(".evp-new").classList.contains("is-on"),
  count: document.querySelector(".ev-count").textContent,
}));
const log = {};
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 3 });
await page.goto(url, { waitUntil: "networkidle0" });
await wait(1400);
await shot("e1-idle");
// start from another tab: the slot must stay "running" through the tab switch
await tap('.assist-app > .sa-nav [data-nav="brief"]');
await wait(600);
await tap('[data-la-try="event"]');
await wait(900);
log.listening = { ...(await state()), quote: await page.evaluate(() => document.querySelector(".sa-listen .q").textContent) };
await wait(1200);
await shot("e2-listening");
await page.waitForSelector(".sa-listen.is-heard", { timeout: 8000 }); // the working beat, then listening
await tap(".sa-check");
await wait(1700);
log.review = await state();
await shot("e3-review");
await page.evaluate(() => { document.querySelector(".ev-scroll2").scrollTop = 9999; });
await wait(300);
await shot("e4-review-end");
await tap('.sa-evreview [data-go="ev-invite"]');
await wait(700);
await click('[data-inv="friends"]:nth-of-type(4)');
await shot("e5-invite");
log.invitedFriends = await page.evaluate(() => [...document.querySelectorAll('[data-inv="friends"][aria-pressed="true"]')].length);
await tap('.sa-evinvite [data-act="sendinv"]');
await wait(800);
log.sent = await state();
await shot("e6-sent");
await wait(1500);
log.live = await state();
await shot("e7-invite-arrives");
await wait(3000);
log.joined = await state();
await shot("e8-joined");
await wait(3200);
log.done = await state();
await shot("e9-done");
await tap('.sa-evsent [data-act="myevents"]');
await wait(900);
log.myEvents = await page.evaluate(() => ({ screen: document.querySelector(".assist-app .sa-screen.is-on")?.dataset.s, hosted: !!document.querySelector(".ev-mine .ev-hosted"), mineShown: !document.querySelector('[data-list="mine"]').hidden }));
await shot("e10-my-events");

await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
await page.goto(url, { waitUntil: "networkidle0" });
await wait(1200);
await click('[data-pick="event"]');
await wait(1900);
await page.waitForSelector(".sa-listen.is-heard", { timeout: 8000 }); // the working beat, then listening
await click(".sa-check");
await wait(1500);
await click('.sa-evreview [data-go="ev-invite"]');
await wait(600);
await click('.sa-evinvite [data-act="sendinv"]');
await wait(2300);
log.mobileToast = await page.evaluate(() => document.querySelector(".ev-toast").classList.contains("is-on"));
await page.screenshot({ path: join(out, "e11-mobile.png"), clip: { x: 0, y: 320, width: 390, height: 520 } });
log.mobileOverflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
await browser.close();
console.log(JSON.stringify({ errors, ...log }, null, 1));
