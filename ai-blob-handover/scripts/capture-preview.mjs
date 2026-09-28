#!/usr/bin/env node
import { createRequire } from "node:module";
import { homedir } from "node:os";
import { join, resolve } from "node:path";
import { existsSync, mkdirSync, readdirSync } from "node:fs";

function loadPuppeteer() {
  try {
    return { lib: createRequire(join(homedir(), "node_modules", "noop.js"))("puppeteer"), options: {} };
  } catch {}
  const npx = join(homedir(), ".npm", "_npx");
  for (const directory of existsSync(npx) ? readdirSync(npx) : []) {
    const core = join(npx, directory, "node_modules", "puppeteer-core");
    if (existsSync(core)) return {
      lib: createRequire(join(core, "noop.js"))("puppeteer-core"),
      options: { executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" },
    };
  }
  throw new Error("Puppeteer is not available");
}

const { lib: puppeteer, options } = loadPuppeteer();
const url = process.argv[2] || "http://127.0.0.1:4321/ai-blob-handover/";
const output = resolve(process.argv[3] || "ai-blob-handover/.preview-frames");
mkdirSync(output, { recursive: true });
const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox", "--force-color-profile=srgb"], ...options });
const page = await browser.newPage();
await page.setViewport({ width: 960, height: 640, deviceScaleFactor: 1 });
await page.goto(url, { waitUntil: "networkidle0" });
for (let frame = 0; frame < 72; frame += 1) {
  await page.screenshot({ path: join(output, `frame-${String(frame).padStart(3, "0")}.png`) });
  await new Promise((resolveFrame) => setTimeout(resolveFrame, 67));
}
await browser.close();
console.log(output);
