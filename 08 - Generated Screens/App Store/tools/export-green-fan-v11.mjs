#!/usr/bin/env node
/* Green fan on V.11 (13 Nov): App Store header + search + universal + Play feature graphic, from store-header-green-fan-v11.html.
   Usage (from ~/Sprout): node "08 - Generated Screens/App Store/tools/export-green-fan-v11.mjs" [--pal=cream|green|sage|butter|peach|mint] [--fan=big]  (default cream, Ahmad's pick 13 Nov)
   Writes exports/v11/store-header-<pal>/*.png (RGB, no alpha) + zip of header, search, universal. */
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';
import { homedir } from 'node:os';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const PAL = (process.argv.find(a => a.startsWith('--pal=')) || '--pal=cream').slice(6);
const BIG = process.argv.includes('--fan=big');  // 13 Nov: header fan sized to the iPhone-visible area, see ?fan=big in the HTML
const out = join(root, 'exports', 'v11', 'store-header-' + PAL + (BIG ? '-bigfan' : ''));
const candidates = [process.env.PPTR_DIR, join(homedir(), 'Data Trainning', 'Ahmad Personal Intro'), join(homedir(), 'Data Trainning', 'kalimantan-peat-fire'), homedir()].filter(Boolean);
let puppeteer;
for (const dir of candidates) { try { puppeteer = createRequire(join(dir, 'noop.js'))('puppeteer-core'); break; } catch {} }
if (!puppeteer) { console.error('puppeteer-core not found. Set PPTR_DIR.'); process.exit(1); }
const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--force-color-profile=srgb'] });
const page = await browser.newPage();
const ASSETS = [['header', 3840, 1646, 'header-21x9-3840x1646.png'], ['search', 3840, 2560, 'search-3x2-3840x2560.png'],
  ['universal', 5244, 2950, 'universal-16x9-5244x2950.png'], ['feature', 1024, 500, 'google-play-feature-graphic-1024x500.png']];
mkdirSync(out, { recursive: true });
const files = [];
for (const [n, W, H, f] of ASSETS) {
  await page.setViewport({ width: W, height: H, deviceScaleFactor: 1 });
  await page.goto(pathToFileURL(join(root, 'store-header-green-fan-v11.html')).href + '?export=' + n + '&pal=' + PAL + (BIG ? '&fan=big' : ''), { waitUntil: 'networkidle0', timeout: 90000 });
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => Promise.all([...document.images].map(i => i.complete ? i.decode().catch(() => 0) : new Promise(r => { i.onload = i.onerror = r; }))));
  await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
  await page.screenshot({ path: join(out, f), clip: { x: 0, y: 0, width: W, height: H } });
  files.push(join(out, f)); console.log(f);
}
await Promise.race([browser.close(), new Promise(r => setTimeout(r, 5000))]);
execFileSync('python3', ['-I', '-c', `import sys
from PIL import Image
for f in sys.argv[1:]:
    im = Image.open(f)
    if im.mode != 'RGB': im.convert('RGB').save(f, optimize=True)
`, ...files], { stdio: 'inherit' });
execFileSync('zip', ['-j', '-q', '-o', join(out, `Sprout Store Header ${PAL}${BIG ? ' big fan' : ''} V.11.zip`), ...files.slice(0, 3)]);
console.log('done →', out);
process.exit(0);
