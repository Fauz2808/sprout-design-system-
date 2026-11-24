#!/usr/bin/env node
/* Every store size beyond the iPhone 6.9" set (export-v11.mjs), from the same V.11 sources. One browser, one page at a time
   (8 GB Mac: parallel Chromes time out).
   Usage (from ~/Sprout):
     node "08 - Generated Screens/App Store/tools/export-store-assets.mjs" [--only header,ipad,play] [--ipad-cw 1460] [--play-cw 886]
   Writes to 08 - Generated Screens/App Store/exports/v11/:
     store-header/header-21x9-3840x1646.png         App Store header (iOS 27+, Asset Library)
     store-header/search-3x2-3840x2560.png          App Store search results
     store-header/universal-16x9-5244x2950.png      optional, fills both slots (PNG only)
     iphone-6.3/NN.png                              1206 x 2622, App Store iPhone 6.1"/6.3" slot (the one App Store Connect asks for first)
     ipad-13/NN.png                                 2064 x 2752, App Store iPad 13" slot (required when the app runs on iPad)
     google-play/phone/NN.png                       1080 x 1920 (9:16; Play caps the long side at 2x the short side)
     google-play/feature-graphic-1024x500.png       required by Play
   All RGB, no alpha. Sources: store-header-assets-v11.html, screenshots-v11-nine-slides.html (?device=ipad|play). */
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';
import { homedir } from 'node:os';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const out = join(root, 'exports', 'v11');
const arg = (name, def) => { const i = process.argv.indexOf('--' + name); return i > 0 ? process.argv[i + 1] : def; };
const only = arg('only', 'header,iphone63,ipad,play').split(',');
const IPAD_CW = +arg('ipad-cw', 1460), PLAY_CW = +arg('play-cw', 886);

const candidates = [process.env.PPTR_DIR, join(homedir(), 'Data Trainning', 'Ahmad Personal Intro'), join(homedir(), 'Data Trainning', 'kalimantan-peat-fire'), homedir()].filter(Boolean);
let puppeteer;
for (const dir of candidates) { try { puppeteer = createRequire(join(dir, 'noop.js'))('puppeteer-core'); break; } catch {} }
if (!puppeteer) { console.error('puppeteer-core not found. Set PPTR_DIR to a folder with node_modules/puppeteer-core.'); process.exit(1); }
const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--force-color-profile=srgb'] });
const page = await browser.newPage();
const files = [];

async function shoot(html, query, W, H, file) {
  await page.setViewport({ width: W, height: H, deviceScaleFactor: 1 });
  await page.goto(pathToFileURL(join(root, html)).href + query, { waitUntil: 'networkidle0', timeout: 90000 });
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => Promise.all([...document.images].map(i => i.complete ? i.decode().catch(() => 0) : new Promise(r => { i.onload = i.onerror = r; }))));
  await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
  mkdirSync(dirname(file), { recursive: true });
  await page.screenshot({ path: file, clip: { x: 0, y: 0, width: W, height: H } });
  files.push(file); console.log(file.split('/exports/')[1]);
}

if (only.includes('header')) {
  const H = 'store-header-assets-v11.html';
  await shoot(H, '?export=header', 3840, 1646, join(out, 'store-header', 'header-21x9-3840x1646.png'));
  await shoot(H, '?export=search', 3840, 2560, join(out, 'store-header', 'search-3x2-3840x2560.png'));
  await shoot(H, '?export=universal', 5244, 2950, join(out, 'store-header', 'universal-16x9-5244x2950.png'));
}
const V = 'screenshots-v11-nine-slides.html';
for (let n = 1; n <= 9; n++) {
  const nn = String(n).padStart(2, '0');
  if (only.includes('iphone63')) await shoot(V, `?export=${n}&pal=A&w=1206&h=2622&still`, 1206, 2622, join(out, 'iphone-6.3', nn + '.png'));
  if (only.includes('ipad')) await shoot(V, `?export=${n}&pal=A&w=2064&h=2752&device=ipad&cw=${IPAD_CW}&still`, 2064, 2752, join(out, 'ipad-13', nn + '.png'));
  if (only.includes('play')) await shoot(V, `?export=${n}&pal=A&w=1080&h=1920&device=play&cw=${PLAY_CW}&still`, 1080, 1920, join(out, 'google-play', 'phone', nn + '.png'));
}
if (only.includes('play')) await shoot('store-header-assets-v11.html', '?export=feature', 1024, 500, join(out, 'google-play', 'feature-graphic-1024x500.png'));
await Promise.race([browser.close(), new Promise(r => setTimeout(r, 5000))]);

execFileSync('python3', ['-I', '-c', `import sys
from PIL import Image
for f in sys.argv[1:]:
    im = Image.open(f)
    if im.mode != 'RGB': im.convert('RGB').save(f, optimize=True)
`, ...files], { stdio: 'inherit' });
console.log('done →', out);
process.exit(0);
