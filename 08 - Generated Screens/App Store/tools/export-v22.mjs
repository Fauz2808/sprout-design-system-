// V.22 people (25 Nov): six slides in store order, rendered at 1290 x 2796 (iPhone 6.9") + a contact sheet, and with
// --device iphone63 at 1206 x 2622 (same aspect). Every PNG RGB, no alpha.
// node "08 - Generated Screens/App Store/tools/export-v22.mjs" [--device iphone63]
// --frameless renders the same six without the iPhone bezel into exports/v22/_frameless/ (input for iPad and Play);
// then python3 tools/compose-v22-wide.py makes ipad-13/ (2064 x 2752) and google-play/phone/ (1080 x 1920).
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';
import { homedir } from 'node:os';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const pageFile = join(root, 'screenshots-v22-people.html');
const out = join(root, 'exports', 'v22');
const devices = new Map([
  ['iphone63', { folder: 'iphone-6.3', width: 1206, height: 2622 }],
]);
const args = process.argv.slice(2);
const deviceArg = args.indexOf('--device');
const device = args[deviceArg + 1];
const PLATES = args.includes('--plates');
const FRAMELESS = args.includes('--frameless');
const preset = deviceArg === -1 ? undefined : devices.get(device);
if (PLATES) { console.error('V.22 has no plates.'); process.exit(1); }
if (deviceArg !== -1 && !preset) {
  console.error('Use --device iphone63 (iPad and Play are not built for V.22 yet).');
  process.exit(1);
}

const candidates = [process.env.PPTR_DIR, join(homedir(), 'Data Trainning', 'Ahmad Personal Intro'), join(homedir(), 'Data Trainning', 'kalimantan-peat-fire'), homedir()].filter(Boolean);
let puppeteer;
for (const dir of candidates) { try { puppeteer = createRequire(join(dir, 'noop.js'))('puppeteer-core'); break; } catch {} }
if (!puppeteer) { console.error('puppeteer-core not found. Set PPTR_DIR.'); process.exit(1); }

const ids = ['1','2','3','4','5','6'];
const { width = 1290, height = 2796, cw } = preset || {};
const plateDir = join(root, 'assets', 'v15-plates');
const outputDir = FRAMELESS ? join(out, '_frameless') : PLATES ? plateDir : preset ? join(out, preset.folder) : out;
mkdirSync(outputDir, { recursive: true });
const files = [];
const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--force-color-profile=srgb'] });
try {
  const page = await browser.newPage();
  await page.setViewport({ width, height, deviceScaleFactor: 1 });
  for (const id of ids) {
    const url = pathToFileURL(pageFile);
    url.searchParams.set(PLATES ? 'plate' : 'export', id);
    if (FRAMELESS) url.searchParams.set('frameless', '1');
    if (preset) {
      url.searchParams.set('w', width);
      url.searchParams.set('h', height);
    }
    if (cw) {
      url.searchParams.set('device', device);
      url.searchParams.set('cw', cw);
    }
    await page.goto(url.href, { waitUntil: 'networkidle0' });
    await page.waitForFunction(() => window.__ready);
    await new Promise((r) => setTimeout(r, 400));
    await page.evaluate(() => document.fonts.ready);
    const bad = await page.evaluate(() => [...document.images].filter(i => !i.naturalWidth).map(i => i.src));
    if (bad.length) console.warn(id, 'broken images:', bad);
    const file = join(outputDir, (preset ? id.padStart(2, '0') : id) + '.png');
    await page.screenshot({ path: file, clip: { x: 0, y: 0, width, height } });
    files.push(file);
    console.log('wrote', file);
  }
} finally {
  await browser.close();
}
if (FRAMELESS) { console.log('frameless ->', outputDir); process.exit(0); }
if (preset) {
  execFileSync('python3', ['-I', '-c', `import sys
from PIL import Image
for f in sys.argv[1:]:
    with Image.open(f) as im:
        if im.mode != 'RGB': im.convert('RGB').save(f, optimize=True)
`, ...files], { stdio: 'inherit' });
  process.exit(0);
}
if (PLATES) { // JPEG keeps the Figma capture under its 50 MB cap (PNG plates are ~3 MB each)
  execFileSync('python3', ['-c', `
import glob,os
from PIL import Image
for f in glob.glob('${plateDir}/*.png'):
  Image.open(f).convert('RGB').save(f[:-4]+'.jpg',quality=88); os.remove(f)`]);
  console.log('plates ->', plateDir); process.exit(0); }

execFileSync('python3', ['-c', `
from PIL import Image
ids=${JSON.stringify(ids)}; w=430; h=int(2796*w/1290); g=24
s=Image.new('RGB',(len(ids)*w+(len(ids)+1)*g,h+2*g),(236,233,226))
for k,i in enumerate(ids):
  r,c=0,k; s.paste(Image.open('${out}/'+i+'.png').convert('RGB').resize((w,h),Image.LANCZOS),(g+c*(w+g),g+r*(h+g)))
s.save('${out}/sheet.png')
`]);
console.log('sheet ->', join(out, 'sheet.png'));
