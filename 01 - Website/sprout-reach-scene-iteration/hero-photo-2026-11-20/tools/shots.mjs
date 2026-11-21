/* Review scaffolding for the 20 Nov clover hero variations: screenshots every direction at 1440x900 and 390x844 into
   ../shots/, and reports console errors, failed requests and horizontal overflow.
   Usage (from ~/Sprout): node "01 - Website/sprout-reach-scene-iteration/hero-clover-2026-11-20/tools/shots.mjs" [a b c d]
   Puppeteer: PUPPETEER_CORE=/path/to/node_modules/puppeteer-core, else the npx cache, with system Chrome. */
import { createRequire } from "node:module";
import { homedir } from "node:os";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { existsSync, readdirSync, mkdirSync } from "node:fs";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
function loadPuppeteer() {
  const tries = [];
  if (process.env.PUPPETEER_CORE) tries.push(process.env.PUPPETEER_CORE);
  const npx = join(homedir(), ".npm/_npx");
  if (existsSync(npx)) for (const d of readdirSync(npx)) tries.push(join(npx, d, "node_modules/puppeteer-core"));
  for (const t of tries) if (existsSync(t)) return createRequire(import.meta.url)(t);
  throw new Error("puppeteer-core not found; set PUPPETEER_CORE");
}
const puppeteer = loadPuppeteer();
const which = process.argv.slice(2).length ? process.argv.slice(2) : ["1", "2", "3"];
const sizes = [["desktop", 1440, 900], ["mobile", 390, 844]];
mkdirSync(join(root, "shots"), { recursive: true });
const browser = await puppeteer.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: "new",
  args: ["--allow-file-access-from-files", "--hide-scrollbars"] });
let bad = 0;
for (const name of which) {
  for (const [label, w, h] of name === "index" ? [["desktop", 1440, 900]] : sizes) {
    const page = await browser.newPage();
    const errs = [];
    page.on("console", (m) => { if (m.type() === "error") errs.push("console: " + m.text()); });
    page.on("pageerror", (e) => errs.push("pageerror: " + e.message));
    page.on("requestfailed", (r) => errs.push("failed: " + r.url() + " " + (r.failure() || {}).errorText));
    page.on("response", (r) => { if (r.status() >= 400) errs.push("http " + r.status() + ": " + r.url()); });
    await page.setViewport({ width: w, height: h, deviceScaleFactor: label === "mobile" ? 2 : 1, isMobile: label === "mobile", hasTouch: label === "mobile" });
    await page.goto(pathToFileURL(join(root, name + ".html")).href, { waitUntil: "networkidle0", timeout: 60000 });
    await new Promise((r) => setTimeout(r, name === "index" ? 4000 : 7000));
    const m = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: innerWidth, sh: document.documentElement.scrollHeight }));
    const out = join(root, "shots", `${name}-${label}.png`);
    await page.screenshot({ path: out, fullPage: name === "index" });
    const over = m.sw > m.iw;
    if (over || errs.length) bad++;
    console.log(`${name} ${label} ${w}x${h}: scrollWidth ${m.sw} / ${m.iw}${over ? "  HORIZONTAL OVERFLOW" : ""}, page height ${m.sh}${errs.length ? "\n  " + errs.join("\n  ") : "  ok"}`);
    await page.close();
  }
}
await browser.close();
process.exit(bad ? 1 : 0);
