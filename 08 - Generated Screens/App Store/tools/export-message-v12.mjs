#!/usr/bin/env node
/* Message-only V.12 (14 Nov): App Store header + search + universal + Play feature graphic, from store-header-message-v12.html.
   Usage (from ~/Sprout): node "08 - Generated Screens/App Store/tools/export-message-v12.mjs" [--v=a|b|c]  (default: all three)
   Writes exports/v12/store-header-message-<v>/*.png + review.png (RGB, no alpha) + zip of header, search, universal. */
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';
import { homedir } from 'node:os';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const VS = (process.argv.find(a => a.startsWith('--v=')) || '--v=a,b,c').slice(4).split(',');
const candidates = [process.env.PPTR_DIR, join(homedir(), 'Data Trainning', 'Ahmad Personal Intro'), join(homedir(), 'Data Trainning', 'kalimantan-peat-fire'), homedir()].filter(Boolean);
let puppeteer;
for (const dir of candidates) { try { puppeteer = createRequire(join(dir, 'noop.js'))('puppeteer-core'); break; } catch {} }
if (!puppeteer) { console.error('puppeteer-core not found. Set PPTR_DIR.'); process.exit(1); }
const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--force-color-profile=srgb'] });
const page = await browser.newPage();
const ASSETS = [['header', 3840, 1646, 'header-21x9-3840x1646.png'], ['search', 3840, 2560, 'search-3x2-3840x2560.png'],
  ['universal', 5244, 2950, 'universal-16x9-5244x2950.png'], ['feature', 1024, 500, 'google-play-feature-graphic-1024x500.png']];
const SRC = pathToFileURL(join(root, 'store-header-message-v12.html')).href;
const ready = () => page.waitForFunction(() => document.body.dataset.fitted === '1', { timeout: 60000 });
for (const V of VS) {
const out = join(root, 'exports', 'v12', 'store-header-message-' + V);
mkdirSync(out, { recursive: true });
const files = [];
for (const [n, W, H, f] of ASSETS) {
  await page.setViewport({ width: W, height: H, deviceScaleFactor: 1 });
  await page.goto(SRC + '?export=' + n + '&v=' + V, { waitUntil: 'networkidle0', timeout: 90000 });
  await ready();
  await page.evaluate(() => Promise.all([...document.images].map(i => i.complete ? i.decode().catch(() => 0) : new Promise(r => { i.onload = i.onerror = r; }))));
  await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
  await page.screenshot({ path: join(out, f), clip: { x: 0, y: 0, width: W, height: H } });
  files.push(join(out, f)); console.log(f);
}
execFileSync('python3', ['-I', '-c', `import sys
from PIL import Image
for f in sys.argv[1:]:
    im = Image.open(f)
    if im.mode != 'RGB': im.convert('RGB').save(f, optimize=True)
`, ...files], { stdio: 'inherit' });
execFileSync('zip', ['-j', '-q', '-o', join(out, `Sprout Store Header message ${V.toUpperCase()} V.12.zip`), ...files.slice(0, 3)]);
console.log('done →', out);
}
// review sheet (iPhone sims + files) at 2x
await page.setViewport({ width: 1600, height: 1000, deviceScaleFactor: 2 });
await page.goto(SRC, { waitUntil: 'networkidle0', timeout: 90000 }); await ready();
await page.screenshot({ path: join(root, 'exports', 'v12', 'review-message-v12.png'), fullPage: true });
await Promise.race([browser.close(), new Promise(r => setTimeout(r, 5000))]);
process.exit(0);
