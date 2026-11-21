#!/usr/bin/env node
/* Photographs home-v3.html (website v3, 20 Nov) at each scroll stage: the hero (with its Daily Brief mid-loop), the
   Daily Brief section at four points of its pinned scroll, two class steps, two directory steps, the Assist teaser,
   the FAQ and the close. Desktop 1440 x 900 and phone 390 x 844.
   Fails (non-zero exit) on horizontal overflow, page errors, a hero without its families photo, or a Daily Brief
   phone that overlaps the section copy on desktop once it has landed.
   Usage: node review/home-v3-shots.mjs [url] [outDir]
   Default url: home-v3.html from disk (file://); a file:// run can't fetch the live mascot's JSON, that one is ignored. */
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
  const photo = await page.evaluate(() => { const e = document.querySelector(".hero2 .photo"); if (!e) return "missing"; const r = e.getBoundingClientRect(); return getComputedStyle(e).backgroundImage.includes("family-neighborhood") && r.width > 100 && r.height > 100 ? "ok" : "no image"; });
  if (photo !== "ok") fail(`${label}: the hero photo is ${photo}`);
  const secs = await page.evaluate(() => Object.fromEntries(["brief", "classes", "directory", "assist", "faq", "download"].map((id) => { const e = document.getElementById(id); return [id, [e.offsetTop, e.offsetHeight]]; })));
  const stops = [["01-brief-start", "brief", 0.05], ["02-brief-landed", "brief", 0.3], ["03-brief-todo", "brief", 0.5], ["04-brief-day", "brief", 0.95],
    ["05-classes-list", "classes", 0.08], ["06-classes-chat", "classes", 0.35], ["07-dir-list", "directory", 0.05], ["08-dir-profile", "directory", 0.7],
    ["09-assist", "assist", 0], ["10-faq", "faq", 0], ["11-close", "download", 0]];
  for (const [name, id, f] of stops) {
    const [top, hgt] = secs[id];
    await page.evaluate((y) => window.scrollTo(0, y), top + f * Math.max(0, hgt - h));
    await new Promise((r) => setTimeout(r, 1300));
    await shot(name);
    if (!mobile && name === "03-brief-todo") {
      const overlap = await page.evaluate(() => { const a = document.getElementById("briefPhone").getBoundingClientRect(), b = document.querySelector("#brief .scrolly-copy").getBoundingClientRect(); return a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom; });
      if (overlap) fail("desktop: the Daily Brief phone overlaps the section copy");
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
