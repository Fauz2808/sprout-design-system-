#!/usr/bin/env node
/* Photographs home-v3.html (website v3, Tony's copy & design brief, 24 Nov) at each scroll stage: the hero (with its
   profile chips), the mental-load scene in both states plus an open to-do sheet, Assist, Community and the close.
   Desktop 1440 x 900 and phone 390 x 844.
   Fails (non-zero exit) on horizontal overflow, page errors, a hero without its photo, a brief row still hidden once
   the scroll has landed, or (desktop) the phone overlapping the section copy.
   Usage: node review/home-v3-shots.mjs [url] [outDir]
   Default url: home-v3.html from disk (file://). */
import { createRequire } from "node:module";
import { homedir } from "node:os";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { mkdirSync, existsSync, readdirSync } from "node:fs";

const here = dirname(fileURLToPath(import.meta.url));
const url = process.argv[2] || pathToFileURL(resolve(here, "../home-v3.html")).href;
const out = resolve(process.argv[3] || join(here, "shots/home-v3"));
mkdirSync(out, { recursive: true });
const npx = join(homedir(), ".npm/_npx");
const pp = [process.env.PUPPETEER_CORE, ...(existsSync(npx) ? readdirSync(npx).map((d) => join(npx, d, "node_modules/puppeteer-core")) : [])].find((p) => p && existsSync(p));
const puppeteer = createRequire(import.meta.url)(pp);
const browser = await puppeteer.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: "new", args: ["--hide-scrollbars"] });
let bad = 0;
const fail = (m) => { bad++; console.log("  FAIL " + m); };
for (const [label, w, h, mobile] of [["desktop", 1440, 900, false], ["phone", 390, 844, true]]) {
  const page = await browser.newPage();
  const errs = [];
  page.on("pageerror", (e) => errs.push(e.message));
  page.on("requestfailed", (r) => { if (!r.url().endsWith("live.json")) errs.push("failed " + r.url()); });
  await page.setViewport({ width: w, height: h, deviceScaleFactor: mobile ? 2 : 1, isMobile: mobile, hasTouch: mobile });
  await page.goto(url, { waitUntil: "networkidle0", timeout: 60000 });
  await new Promise((r) => setTimeout(r, 2600));
  const shot = async (name) => page.screenshot({ path: join(out, `${label}-${name}.png`) });
  await shot("00-hero");
  const photo = await page.evaluate(() => { const e = document.querySelector(".hero2 .photo"); if (!e) return "missing"; const r = e.getBoundingClientRect(); return getComputedStyle(e).backgroundImage.includes("hero-dropoff") && r.width > 100 && r.height > 100 ? "ok" : "no image"; });
  if (photo !== "ok") fail(`${label}: the hero photo is ${photo}`);
  const secs = await page.evaluate(() => Object.fromEntries(["problem", "assist", "community", "join"].map((id) => { const e = document.getElementById(id); return [id, [e.offsetTop, e.offsetHeight]]; })));
  const stops = [["01-problem", "problem", 0.1], ["02-brief", "problem", 0.8], ["03-sheet", "problem", 0.8],
    ["04-assist", "assist", 0], ["05-community", "community", 0], ["06-close", "join", 0]];
  await page.evaluate(() => (document.documentElement.style.scrollBehavior = "auto"));
  for (const [name, id, f] of stops) {
    const [top, hgt] = secs[id];
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), top + f * Math.max(0, hgt - h) - (f === 0 ? 40 : 0));
    await new Promise((r) => setTimeout(r, 1800));
    if (name === "03-sheet") { await page.evaluate(() => document.querySelectorAll(".st-todo")[2].click()); await new Promise((r) => setTimeout(r, 800)); }
    await shot(name);
    if (name === "01-problem") {
      const shown = await page.evaluate(() => [...document.querySelectorAll(".pop")].filter((e) => Number(getComputedStyle(e).opacity) > 0.5).length);
      if (shown < 4) fail(`${label}: only ${shown} notifications rising in the noisy state`);
    }
    if (name === "02-brief") {
      const op = await page.evaluate(() => Number(getComputedStyle(document.querySelector(".story-phone")).opacity));
      if (op < 0.95) fail(`${label}: the brief phone is not showing in the calm state`);
      if (!mobile) {
        const overlap = await page.evaluate(() => { const a = document.querySelector(".story-phone").getBoundingClientRect(), b = document.querySelector(".sc-b").getBoundingClientRect(); return a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom; });
        if (overlap) fail("desktop: the phone overlaps the brief copy");
      }
      const clip = await page.evaluate(() => { const nav = document.querySelector(".st-brief .dock-clover").getBoundingClientRect(), last = (document.querySelector(".st-brief .st-msgs") || [...document.querySelectorAll(".st-brief .db2-card")].pop()).getBoundingClientRect(); return last.bottom > nav.top + 1 ? "the last card runs under the tab bar" : ""; });
      if (clip) fail(`${label}: ${clip}`);
    }
    if (name === "03-sheet") {
      const on = await page.evaluate(() => document.querySelector(".st-app").classList.contains("sheet-on"));
      if (!on) fail(`${label}: tapping a to-do did not open its sheet`);
      await page.evaluate(() => document.querySelector("[data-x]").click());
    }
  }
  const tags = await page.evaluate(() => { const box = document.querySelector(".hero2 .inset").getBoundingClientRect(); return [...document.querySelectorAll(".tag:not([hidden])")].filter((t) => { const r = t.getBoundingClientRect(); return r.left < box.left || r.right > box.right; }).map((t) => t.textContent.trim().slice(0, 12)); });
  if (tags.length) fail(`${label}: hero profile chips cut off by the frame: ${tags}`);
  const sw = await page.evaluate(() => document.documentElement.scrollWidth);
  console.log(`${label}: scrollWidth ${sw} / ${w}`);
  if (sw > w) fail(`${label}: horizontal overflow`);
  errs.forEach((e) => fail(`${label}: ${e}`));
  await page.close();
}
await browser.close();
console.log(bad ? `${bad} problem(s)` : "ok", "→", out);
process.exit(bad ? 1 : 0);
