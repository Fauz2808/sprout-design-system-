#!/usr/bin/env node
/* Renders the Assist home at launch scope from the Assist prototype (route /assist-ongoing/) to
   assets/figma/assist-home-launch.png at 1179 x 2556. Ahmad, 25 Nov: the Assist slide's screen had empty space /
   missing content. Launch scope (Tony, 24 Nov): Pick up where you left off + Playdate / Babysitter / Carpool;
   Date night, Birthday, "Register my kids" and "Saved details" are hidden. Rebuild the prototype first (python3 build.py there).
   node "08 - Generated Screens/App Store/tools/make-assist-launch.mjs" */
import { createRequire } from "node:module";
import { homedir } from "node:os";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync, readdirSync } from "node:fs";
import { spawn } from "node:child_process";
const here = dirname(fileURLToPath(import.meta.url));
const site = resolve(here, "../../AI Assist/task-first-assist/site");
const out = resolve(here, "../assets/figma/assist-home-launch.png");
const PORT = 4391;
const srv = spawn("python3", ["-m", "http.server", String(PORT), "--directory", site], { stdio: "ignore" });
await new Promise((r) => setTimeout(r, 900));
const npx = join(homedir(), ".npm/_npx");
const pp = [process.env.PUPPETEER_CORE, ...(existsSync(npx) ? readdirSync(npx).map((d) => join(npx, d, "node_modules/puppeteer-core")) : [])].find((p) => p && existsSync(p));
const puppeteer = createRequire(import.meta.url)(pp);
const browser = await puppeteer.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: "new" });
try {
  const page = await browser.newPage();
  const errs = []; page.on("pageerror", (e) => errs.push(e.message));
  await page.setViewport({ width: 393, height: 852, deviceScaleFactor: 3 });
  await page.goto(`http://localhost:${PORT}/assist-ongoing/`, { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 3000));
  const info = await page.evaluate(() => {
    const sh = document.querySelector("#sheet"), hs = [...sh.querySelectorAll("h3.uhead")];
    for (const h of hs) if (/Register my kids|Saved details/.test(h.textContent)) { h.style.display = "none"; h.nextElementSibling.style.display = "none"; }
    sh.querySelectorAll(".ugrid .ut").forEach((t) => { if (/Date night|Birthday/.test(t.textContent)) t.style.display = "none"; });
    const tiles = [...sh.querySelectorAll(".ugrid .ut")].filter((t) => t.style.display !== "none").map((t) => t.textContent.trim());
    return { tiles, open: sh.classList.contains("on") };
  });
  await new Promise((r) => setTimeout(r, 600));
  await page.screenshot({ path: out, clip: { x: 0, y: 0, width: 393, height: 852 } });
  console.log("wrote", out, JSON.stringify(info), errs.length ? "\n" + errs.join("\n") : "");
} finally { await browser.close(); srv.kill(); }
