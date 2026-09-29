// Dev aid: node tools/debug.mjs <t> "<js expression evaluated in the page after seek(t)>"
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const T = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".woff2": "font/woff2", ".webp": "image/webp", ".png": "image/png", ".svg": "image/svg+xml", ".jpg": "image/jpeg" };
const srv = createServer(async (q, r) => { try { const p = decodeURIComponent(new URL(q.url, "http://x").pathname); const b = await readFile(join(ROOT, p === "/" ? "index.html" : p)); r.writeHead(200, { "content-type": T[extname(p)] || "application/octet-stream" }); r.end(b); } catch { r.writeHead(404); r.end(); } });
await new Promise((r) => srv.listen(0, "127.0.0.1", r));
const b = await puppeteer.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: true, args: ["--no-sandbox"] });
const p = await b.newPage(); await p.setViewport({ width: 1080, height: 1920 });
p.on("pageerror", (e) => console.log("ERR", e.message));
await p.goto(`http://127.0.0.1:${srv.address().port}/index.html?render`, { waitUntil: "load" });
await p.waitForFunction("window.__ready === true || window.__error", { timeout: 120000 });
console.log(await p.evaluate(`window.__error || (window.seek(${process.argv[2]}), JSON.stringify(${process.argv[3]}, null, 1))`));
await b.close(); srv.close();
