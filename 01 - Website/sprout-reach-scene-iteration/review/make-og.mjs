#!/usr/bin/env node
/* Builds the link preview (og:image) for joinsprout.co (Tony, 10 Oct). Two steps, both from live sources:
   1. photographs the site's own Daily Brief phone (home-v2, brief settled, the notification hidden) into
      assets/og/brief-phone.png, so the card never shows a stale screen;
   2. renders review/og-card.html at 1200x630 (2x) into assets/og/sprout-link.jpg, the file og:image points at.
   Re-run after changing the brief or the card. Then export the site (review/export-site.py).
   Usage: node review/make-og.mjs [url]   (default url: http://localhost:4320/home-v2, the reach-scene-iteration preview)
   Puppeteer: same lookup as home-v2-shots.mjs; PUPPETEER_CORE=/path/to/node_modules/puppeteer-core wins. */
import { createRequire } from "node:module";
import { homedir } from "node:os";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { mkdirSync, existsSync, readdirSync, statSync, unlinkSync } from "node:fs";
import { execFileSync } from "node:child_process";

function loadPuppeteer() {
  // PUPPETEER_CORE=/path/to/node_modules/puppeteer-core wins when the npx cache has been cleared (9 Oct)
  if (process.env.PUPPETEER_CORE) return { lib: createRequire(join(process.env.PUPPETEER_CORE, "noop.js"))(process.env.PUPPETEER_CORE),
    opts: { executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" } };
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
const here = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const url = process.argv[2] || "http://localhost:4320/home-v2";
const out = join(here, "assets/og");
mkdirSync(out, { recursive: true });
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await puppeteer.launch({ headless: "new", protocolTimeout: 30000, ...opts });

// 1 · the phone, from the website itself
const site = await browser.newPage();
await site.setViewport({ width: 1440, height: 900, deviceScaleFactor: 3 });
await site.goto(url, { waitUntil: "networkidle2", timeout: 30000 });
await site.evaluate(async () => {
  document.documentElement.style.scrollBehavior = "auto";
  await document.fonts.ready;
  const s = document.getElementById("brief");
  scrollTo(0, s.offsetTop + Math.max(0, s.offsetHeight - innerHeight) * 0.42);
});
await wait(1600);
await site.addStyleTag({ content: ".v2-notif { display: none !important; } #briefPhone { opacity: 1 !important; }" });
await wait(300);
// a clip of the viewport, not an element shot: the phone is pinned, and an element shot scrolls the page first
const r = await site.evaluate(() => { const b = document.getElementById("briefPhone").getBoundingClientRect(); return { x: b.left, y: b.top, width: b.width, height: b.height }; });
// shoot the window as it is, then crop to the phone with macOS sips. A clip or element shot resizes or scrolls the page,
// and the phone is pinned, so either one photographs the wrong moment
const full = join(out, ".viewport.png"), k = 3;
await site.screenshot({ path: full });
execFileSync("sips", ["-c", String(Math.round(r.height * k)), String(Math.round(r.width * k)), "--cropOffset", String(Math.round(r.y * k)), String(Math.round(r.x * k)), full, "--out", join(out, "brief-phone.png")], { stdio: "ignore" });
unlinkSync(full);

// 2 · the card
const card = await browser.newPage();
await card.setViewport({ width: 1200, height: 630, deviceScaleFactor: 2 });
await card.goto(pathToFileURL(join(here, "review/og-card.html")).href, { waitUntil: "networkidle0", timeout: 30000 });
await card.evaluate(() => document.fonts.ready);
await wait(300);
const problems = await card.evaluate(() => {
  const p = [], copy = document.querySelector(".copy").getBoundingClientRect(), ph = document.querySelector(".phone").getBoundingClientRect();
  if (copy.right > ph.left) p.push("the headline runs into the phone");
  if (document.querySelector(".plus").getBoundingClientRect().bottom > document.querySelector(".foot").getBoundingClientRect().top - 20) p.push("the copy runs into the footer");
  for (const img of document.images) if (!img.naturalWidth) p.push("image missing: " + img.src);
  return p;
});
await card.screenshot({ path: join(out, "sprout-link.jpg"), type: "jpeg", quality: 90 });
await browser.close();
const kb = Math.round(statSync(join(out, "sprout-link.jpg")).size / 1024);
// WhatsApp drops the large preview above ~600 KB; iMessage is fine either way
if (kb > 600) problems.push(`sprout-link.jpg is ${kb} KB (keep it under 600)`);
if (problems.length) { console.error("FAIL:\n  " + problems.join("\n  ")); process.exit(1); }
console.log(`OK: assets/og/brief-phone.png, assets/og/sprout-link.jpg (2400x1260, ${kb} KB)`);
