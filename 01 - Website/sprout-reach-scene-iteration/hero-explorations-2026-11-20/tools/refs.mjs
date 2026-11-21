/* Research for the 20 Nov hero explorations: screenshot the first screen of real consumer-app sites that lead with a
   phone (or a scene around one), at desktop 1440 x 900 and phone 390 x 844, into ../research/.
   Usage (from ~/Sprout): node "01 - Website/sprout-reach-scene-iteration/hero-explorations-2026-11-20/tools/refs.mjs" */
import { createRequire } from "node:module";
import { homedir } from "node:os";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync, readdirSync, mkdirSync } from "node:fs";

const here = dirname(fileURLToPath(import.meta.url));
const out = resolve(here, "../research");
mkdirSync(out, { recursive: true });
const tries = [];
const npx = join(homedir(), ".npm/_npx");
if (existsSync(npx)) for (const d of readdirSync(npx)) tries.push(join(npx, d, "node_modules/puppeteer-core"));
const pp = tries.find(existsSync);
const puppeteer = createRequire(import.meta.url)(pp);

const SITES = [
  ["partiful", "https://partiful.com"], ["howbout", "https://www.howbout.app"], ["timeleft", "https://timeleft.com"],
  ["bevel", "https://www.bevel.health"], ["flighty", "https://flighty.com"], ["structured", "https://structured.app"],
  ["opal", "https://www.opal.so"], ["copilot", "https://www.copilot.money"], ["maple", "https://www.growmaple.com"],
  ["ohai", "https://www.ohai.ai"], ["hinge", "https://hinge.co"], ["bereal", "https://bereal.com"],
  ["finch", "https://finchcare.com"], ["cleo", "https://web.meetcleo.com"], ["amie", "https://amie.so"],
];
const only = process.argv.slice(2);
const browser = await puppeteer.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: "new", args: ["--hide-scrollbars"] });
for (const [name, url] of SITES) {
  if (only.length && !only.includes(name)) continue;
  for (const [label, w, h, mobile] of [["desktop", 1440, 900, false], ["mobile", 390, 844, true]]) {
    const page = await browser.newPage();
    try {
      await page.setViewport({ width: w, height: h, deviceScaleFactor: 1, isMobile: mobile, hasTouch: mobile });
      if (mobile) await page.setUserAgent("Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1");
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 20000 });
      await new Promise((r) => setTimeout(r, 4000));
      await page.screenshot({ path: join(out, `${name}-${label}.png`) });
      console.log(name, label, "ok");
    } catch (e) { console.log(name, label, "FAILED", e.message.split("\n")[0]); }
    await page.close();
  }
}
await browser.close();
