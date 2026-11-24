#!/usr/bin/env node
/* Photographs home-v3.html (website v3, Tony's copy & design brief, 24 Nov) at each scroll stage: the hero, the
   Problem → Daily brief pinned scroll at five points (the pile, mid-flight, landed), Assist, Community and the close.
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
  const stops = [["01-problem", "problem", 0.05], ["02-problem-pile", "problem", 0.2], ["03-flying", "problem", 0.34], ["04-landing", "problem", 0.46], ["05-brief", "problem", 0.8],
    ["06-assist", "assist", 0], ["07-community", "community", 0], ["08-close", "join", 0]];
  for (const [name, id, f] of stops) {
    const [top, hgt] = secs[id];
    await page.evaluate((y) => window.scrollTo(0, y), top + f * Math.max(0, hgt - h) - (f === 0 ? 40 : 0));
    await new Promise((r) => setTimeout(r, 1500));
    await shot(name);
    if (name === "05-brief") {
      const hidden = await page.evaluate(() => [...document.querySelectorAll(".st-t")].filter((e) => Number(getComputedStyle(e).opacity) < 0.95).map((e) => e.dataset.t));
      if (hidden.length) fail(`${label}: brief rows still hidden after landing: ${hidden}`);
      if (!mobile) {
        const overlap = await page.evaluate(() => { const a = document.querySelector(".story-phone").getBoundingClientRect(), b = document.querySelector(".sc-b").getBoundingClientRect(); return a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom; });
        if (overlap) fail("desktop: the phone overlaps the brief copy");
      }
      const clip = await page.evaluate(() => { const app = document.querySelector(".st-app").getBoundingClientRect(), nav = document.querySelector(".st-brief .dock-clover").getBoundingClientRect(), last = [...document.querySelectorAll(".st-brief .db2-card")].pop().getBoundingClientRect(); return last.bottom > nav.top + 1 ? "the last card runs under the tab bar" : ""; });
      if (clip) fail(`${label}: ${clip}`);
    }
  }
  const sw = await page.evaluate(() => document.documentElement.scrollWidth);
  console.log(`${label}: scrollWidth ${sw} / ${w}`);
  if (sw > w) fail(`${label}: horizontal overflow`);
  errs.forEach((e) => fail(`${label}: ${e}`));
  await page.close();
}
await browser.close();
console.log(bad ? `${bad} problem(s)` : "ok", "→", out);
process.exit(bad ? 1 : 0);
