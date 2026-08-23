import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const WIDTH = 1080;
const HEIGHT = 1920;
const FPS = Number(process.env.FPS || 24);
const DURATION = 52; // seconds, matches ad.html timeline
const TOTAL_FRAMES = Math.round(FPS * DURATION);

const framesDir = path.join(__dirname, 'frames');
fs.rmSync(framesDir, { recursive: true, force: true });
fs.mkdirSync(framesDir, { recursive: true });

const browser = await puppeteer.launch({ headless: true, args: ['--force-color-profile=srgb'] });
const page = await browser.newPage();
await page.setViewport({ width: WIDTH, height: HEIGHT, deviceScaleFactor: 1 });
await page.goto('file://' + path.join(__dirname, 'ad.html'), { waitUntil: 'networkidle0' });

// let webfonts settle
await new Promise(r => setTimeout(r, 500));

for (let i = 0; i < TOTAL_FRAMES; i++) {
  const t = i / FPS;
  await page.evaluate((t) => { window.renderAtTime(t); }, t);
  const name = String(i).padStart(5, '0') + '.jpg';
  await page.screenshot({ path: path.join(framesDir, name), type: 'jpeg', quality: 88 });
  if (i % 48 === 0) console.log(`frame ${i}/${TOTAL_FRAMES}`);
}

await browser.close();
console.log(`done: ${TOTAL_FRAMES} frames at ${FPS}fps -> ${framesDir}`);
