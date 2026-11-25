#!/usr/bin/env node
/* Renders the family Daily Brief (the coded Prod brief, Figma BRIEF-10 16180:365329, from the website's
   daily-brief.js) to assets/figma/brief-family.png at 1100 x 2385, the size of the old `brief` export.
   Ahmad, 25 Nov: slide "Wake up to your family's brief" must show the FAMILY to-do list (Tony, Dana, both),
   not a one-person list. Launch scope: the SSC sign-up card and the arriving push are hidden.
   node "08 - Generated Screens/App Store/tools/make-brief-family.mjs" */
import { createRequire } from "node:module";
import { homedir } from "node:os";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { existsSync, readdirSync, writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
const here = dirname(fileURLToPath(import.meta.url));
const site = resolve(here, "../../../01 - Website/sprout-reach-scene-iteration");
const out = resolve(here, "../assets/figma/brief-family.png");
const u = (p) => pathToFileURL(join(site, p)).href;
const html = `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;1,500&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<script src="https://unpkg.com/@phosphor-icons/web@2.1.1"></script>
<link rel="stylesheet" href="${u("daily-brief.css")}">
<style>html,body{margin:0;background:#f4f1ea}#b{position:relative;width:393px;height:852px;overflow:hidden}
.db2-note,.db2-ssc,.db2-ssc+.db2-rule{display:none!important}.db2-new{height:auto!important}</style>
</head><body><div id="b" data-brief></div>
<script src="${u("daily-brief.js")}" data-assets="${u("assets/")}"></script></body></html>`;
const dir = mkdtempSync(join(tmpdir(), "brief-family-"));
writeFileSync(join(dir, "page.html"), html);
const npx = join(homedir(), ".npm/_npx");
const pp = [process.env.PUPPETEER_CORE, ...(existsSync(npx) ? readdirSync(npx).map((d) => join(npx, d, "node_modules/puppeteer-core")) : [])].find((p) => p && existsSync(p));
const puppeteer = createRequire(import.meta.url)(pp);
const browser = await puppeteer.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: "new", args: ["--allow-file-access-from-files"] });
const page = await browser.newPage();
const errs = []; page.on("pageerror", (e) => errs.push(e.message)); page.on("requestfailed", (r) => errs.push("failed " + r.url()));
await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
await page.setViewport({ width: 393, height: 852, deviceScaleFactor: 1100 / 393 });
await page.goto(pathToFileURL(join(dir, "page.html")).href, { waitUntil: "networkidle0" });
await new Promise((r) => setTimeout(r, 1200));
const MOM = pathToFileURL(resolve(here, "../assets/people/email-mom-avatar.webp")).href;
await page.evaluate((MOM) => {
  document.querySelector(".db2").style.setProperty("--k", "1");
  const d = document.querySelector(".db2-donel"); if (d) d.firstChild.textContent = "Done (1) ";
  // Ahmad, 25 Nov: the mom is the same face as the School emails slide, it is her brief, and the family's shared
  // to-do comes first so the list reads as a family list
  document.querySelectorAll("[style*='dana.webp']").forEach((e) => { e.style.backgroundImage = `url(${MOM})`; });
  document.querySelectorAll(".db2-hd .db2-av, .db2-todo .th .db2-av").forEach((e) => { e.style.backgroundImage = `url(${MOM})`; });
  const hi = document.querySelector(".db2-hi b"); if (hi) hi.textContent = "Morning, Dana";
  const pair = [...document.querySelectorAll(".db2-todo .db2-row")].find((r) => r.querySelector(".db2-face.pair"));
  const first = document.querySelector(".db2-todo .db2-new"); if (pair && first) first.parentNode.insertBefore(pair, first);
}, MOM);
await (await page.$("#b")).screenshot({ path: out });
await browser.close();
console.log("wrote", out, errs.length ? "\n" + errs.join("\n") : "");
