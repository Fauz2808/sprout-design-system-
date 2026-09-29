#!/usr/bin/env node
/* Renders the launch film frame by frame.

   node tools/render.mjs stills 0 5.2 12.8 ...      one PNG per time, into out/stills/
   node tools/render.mjs sheet                      a contact sheet, one frame per second
   node tools/render.mjs video [--scale 2] [--fps 60] [--from 0 --to 60.5]
                                                    out/sprout-launch-silent.mp4 (1080 x 1920, 9:16; --scale 2 for 2160 x 3840)

   Every frame is window.seek(t) then a screenshot, so a render is reproducible and
   never depends on how fast the machine is. Also writes out/markers.json, the sound
   cues tools/score.py builds the score from. Serves the folder over HTTP itself
   because Chrome blocks web fonts on file:// pages. */
import { createServer } from "node:http";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import { extname, join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "out");
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const args = process.argv.slice(2);
const mode = args[0] || "stills";
const opt = (name, def) => { const i = args.indexOf("--" + name); return i >= 0 ? Number(args[i + 1]) : def; };
const OPTS = new Set(["--scale", "--fps", "--from", "--to", "--out"]);
const scale = opt("scale", 1), fps = opt("fps", 60), ep = (() => { const i = args.indexOf("--ep"); return i >= 0 ? args[i + 1] : "full"; })();

const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".woff2": "font/woff2", ".webp": "image/webp", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".json": "application/json" };
const server = createServer(async (req, res) => {
  try {
    const path = decodeURIComponent(new URL(req.url, "http://x").pathname);
    const body = await readFile(join(ROOT, path === "/" ? "index.html" : path));
    res.writeHead(200, { "content-type": TYPES[extname(path)] || "application/octet-stream" });
    res.end(body);
  } catch { res.writeHead(404); res.end(); }
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const port = server.address().port;

const browser = await puppeteer.launch({
  executablePath: CHROME, headless: true,
  args: ["--no-sandbox", "--hide-scrollbars", "--force-color-profile=srgb", "--font-render-hinting=none", `--window-size=1080,1920`],
});
const page = await browser.newPage();
await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: scale });
page.on("response", (r) => { if (r.status() >= 400 && !r.url().endsWith("favicon.ico")) console.error(r.status(), r.url()); });
page.on("pageerror", (e) => console.error("PAGE ERROR", e.message));
page.on("console", (m) => { if (m.type() === "error" || m.type() === "warning") console.error("console:", m.text()); });
await page.goto(`http://127.0.0.1:${port}/index.html?render&ep=${ep}`, { waitUntil: "load", timeout: 60000 });
await page.waitForFunction("window.__ready === true || window.__error", { timeout: 60000 });
const err = await page.evaluate(() => window.__error);
if (err) { console.error(err); await browser.close(); server.close(); process.exit(1); }
await page.waitForFunction("window.__imagesReady === true", { timeout: 60000 });
const DURATION = await page.evaluate(() => window.DURATION);
await mkdir(OUT, { recursive: true });
await writeFile(join(OUT, `markers-ep${ep}.json`), JSON.stringify({ duration: DURATION, markers: await page.evaluate(() => window.MARKERS) }, null, 1));
const cdp = await page.createCDPSession();
async function frame(t) {
  await page.evaluate((t) => new Promise((r) => { window.seek(t); requestAnimationFrame(() => requestAnimationFrame(r)); }), t);
  const { data } = await cdp.send("Page.captureScreenshot", { format: "png", optimizeForSpeed: true, captureBeyondViewport: false });
  return Buffer.from(data, "base64");
}

if (mode === "stills" || mode === "sheet") {
  const dir = join(OUT, mode === "sheet" ? "sheet" : "stills", `ep${ep}`);
  await mkdir(dir, { recursive: true });
  const times = mode === "sheet" ? Array.from({ length: Math.floor(DURATION) + 1 }, (_, i) => i) : args.slice(1).filter((a, i, all) => !a.startsWith("--") && !(all[i - 1] || "").startsWith("--") && !isNaN(+a)).map(Number).sort((a, b) => a - b);
  for (const t of times) {
    const png = await frame(t);
    const name = `t${t.toFixed(2).padStart(6, "0")}.png`;
    await writeFile(join(dir, name), png);
    console.log(join(dir, name));
  }
} else if (mode === "video") {
  const from = opt("from", 0), to = opt("to", DURATION);
  const n = Math.round((to - from) * fps);
  const outArg = args.indexOf("--out");
  const file = outArg >= 0 ? resolve(args[outArg + 1]) : join(OUT, `sprout-ep${ep}-silent${scale > 1 ? "-4k" : ""}.mp4`);
  const ff = spawn("ffmpeg", ["-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", String(fps), "-c:v", "png", "-i", "-",
    "-c:v", "libx264", "-preset", "slow", "-crf", scale > 1 ? "16" : "14", "-pix_fmt", "yuv420p", "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709",
    "-movflags", "+faststart", file], { stdio: ["pipe", "inherit", "inherit"] });
  const t0 = Date.now();
  for (let f = 0; f < n; f++) {
    const png = await frame(from + f / fps);
    if (!ff.stdin.write(png)) await new Promise((r) => ff.stdin.once("drain", r));
    if (f % 120 === 0) {
      const el = (Date.now() - t0) / 1000;
      console.log(`frame ${f}/${n}  ${el.toFixed(0)}s elapsed, ~${((el / Math.max(1, f)) * (n - f)).toFixed(0)}s left`);
    }
  }
  ff.stdin.end();
  await new Promise((r) => ff.on("close", r));
  console.log(`wrote ${file} in ${((Date.now() - t0) / 1000).toFixed(0)}s`);
}
await browser.close();
server.close();
// headless Chrome can keep the event loop alive after close(); the work is done, so leave
process.exit(0);
