#!/usr/bin/env node
/* Render slides of any screenshots-vNN-people.html to small PNGs + one contact sheet, for review.
   node tools/preview-slides.mjs <page.html> <outDir> [w=430] [h=932] [slides=all]
   Uses file:// so ?export=N survives (npx serve drops queries on .html URLs). */
import { createRequire } from "node:module";
import { homedir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { mkdirSync, existsSync, readdirSync } from "node:fs";
const [page, outDir, W = "430", H = "932", only] = process.argv.slice(2);
const out = resolve(outDir); mkdirSync(out, { recursive: true });
const npx = join(homedir(), ".npm/_npx");
const pp = [process.env.PUPPETEER_CORE, ...(existsSync(npx) ? readdirSync(npx).map((d) => join(npx, d, "node_modules/puppeteer-core")) : [])].find((p) => p && existsSync(p));
const puppeteer = createRequire(import.meta.url)(pp);
const browser = await puppeteer.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: "new" });
const p = await browser.newPage();
const errs = []; p.on("pageerror", (e) => errs.push(e.message)); p.on("requestfailed", (r) => errs.push("failed " + r.url()));
const base = pathToFileURL(resolve(page)).href;
await p.setViewport({ width: 1200, height: 900 });
await p.goto(base, { waitUntil: "networkidle0" });
const n = await p.evaluate(() => document.querySelectorAll("#set .slide-wrap").length);
const list = only ? only.split(",").map(Number) : Array.from({ length: n }, (_, i) => i + 1);
await p.setViewport({ width: +W, height: +H });
for (const i of list) {
  await p.goto(`${base}?export=${i}&w=${W}&h=${H}`, { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 900));
  await p.screenshot({ path: join(out, `${i}.png`) });
}
await browser.close();
console.log(`${list.length} slides → ${out}`, errs.length ? "\nERRORS:\n" + errs.join("\n") : "(no errors)");
