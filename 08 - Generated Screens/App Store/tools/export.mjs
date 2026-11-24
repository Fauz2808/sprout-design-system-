#!/usr/bin/env node
/* App Store screenshots: HTML → PNG at exact App Store Connect sizes.
   Usage (from ~/Sprout):
     node "08 - Generated Screens/App Store/tools/export.mjs" [page.html] [outDir]
   Defaults: screenshots-v7-a-day-with-sprout.html → ../exports/v7/<size>/NN.png
   Needs puppeteer-core: set PPTR_DIR to a folder whose node_modules has it, or it tries the
   known installs below. Uses the installed Google Chrome. PNGs are flattened to RGB because
   App Store Connect rejects screenshots with an alpha channel. */
import { createRequire } from 'node:module';
import { existsSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';
import { homedir } from 'node:os';

const here = dirname(fileURLToPath(import.meta.url));
const pageFile = resolve(process.argv[2] || join(here, '..', 'screenshots-v7-a-day-with-sprout.html'));
const outRoot = resolve(process.argv[3] || join(here, '..', 'exports', 'v7'));

const candidates = [process.env.PPTR_DIR, join(homedir(), 'Data Trainning', 'Ahmad Personal Intro'), join(homedir(), 'Data Trainning', 'kalimantan-peat-fire'), homedir()].filter(Boolean);
let puppeteer;
for (const dir of candidates) {
  try { puppeteer = createRequire(join(dir, 'noop.js'))('puppeteer-core'); break; } catch {}
}
if (!puppeteer) { console.error('puppeteer-core not found. Set PPTR_DIR to a folder with node_modules/puppeteer-core.'); process.exit(1); }
const chrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
if (!existsSync(chrome)) { console.error('Google Chrome not found at ' + chrome); process.exit(1); }

// iPhone sizes App Store Connect accepts (portrait). 6.9" is required; the others are optional fallbacks.
const SIZES = [
  { name: '6.9', w: 1290, h: 2796 },
  { name: '6.5', w: 1284, h: 2778 },
  { name: '6.3', w: 1206, h: 2622 },
];
const COUNT = 6;

const browser = await puppeteer.launch({ executablePath: chrome, headless: 'new', args: ['--force-color-profile=srgb'] });
const page = await browser.newPage();
const written = [];
for (const s of SIZES) {
  const dir = join(outRoot, s.name); mkdirSync(dir, { recursive: true });
  await page.setViewport({ width: s.w, height: s.h, deviceScaleFactor: 1 });
  for (let n = 1; n <= COUNT; n++) {
    const url = `${pathToFileURL(pageFile).href}?export=${n}&w=${s.w}&h=${s.h}`;
    await page.goto(url, { waitUntil: 'networkidle0' });
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(() => Promise.all([...document.images].map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; }))));
    const file = join(dir, String(n).padStart(2, '0') + '.png');
    await page.screenshot({ path: file, clip: { x: 0, y: 0, width: s.w, height: s.h } });
    written.push(file);
  }
}
await browser.close();

// Flatten to RGB (no alpha) and print each file's final size for a quick check.
const py = `import sys
from PIL import Image
for f in sys.argv[1:]:
    im = Image.open(f)
    if im.mode != 'RGB':
        im.convert('RGB').save(f, optimize=True)
        im = Image.open(f)
    print(f.split('/exports/')[-1], im.size, im.mode)
`;
execFileSync('python3', ['-I', '-c', py, ...written], { stdio: 'inherit' });
console.log(`\n${written.length} PNGs in ${outRoot}`);
