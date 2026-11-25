// V.15 people: render slides 1-6 (store order, Tony 25 Nov) at 1290 x 2796 and a contact sheet.
// node "08 - Generated Screens/App Store/tools/export-v15.mjs"  ->  exports/v15/{1..6}.png + sheet.png
// --device iphone63|ipad|play writes only that device's RGB screenshots.
// --plates bakes assets/v15-plates/{1..6}.jpg; plate numbers are slide ids (the old nine-slide numbers), not store order.
// The kept slides were 1-6 in the nine-slide set, so the plate ids are also 1-6.
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';
import { homedir } from 'node:os';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const pageFile = join(root, 'screenshots-v15-people.html');
const out = join(root, 'exports', 'v15');
const devices = new Map([
  ['iphone63', { folder: 'iphone-6.3', width: 1206, height: 2622 }],
  ['ipad', { folder: 'ipad-13', width: 2064, height: 2752, cw: 1460 }],
  ['play', { folder: join('google-play', 'phone'), width: 1080, height: 1920, cw: 886 }],
]);
const args = process.argv.slice(2);
const deviceArg = args.indexOf('--device');
const device = args[deviceArg + 1];
const PLATES = args.includes('--plates');
const preset = deviceArg === -1 ? undefined : devices.get(device);
if (deviceArg !== -1 && (!preset || PLATES)) {
  console.error('Use --device iphone63|ipad|play or --plates.');
  process.exit(1);
}

const candidates = [process.env.PPTR_DIR, join(homedir(), 'Data Trainning', 'Ahmad Personal Intro'), join(homedir(), 'Data Trainning', 'kalimantan-peat-fire'), homedir()].filter(Boolean);
let puppeteer;
for (const dir of candidates) { try { puppeteer = createRequire(join(dir, 'noop.js'))('puppeteer-core'); break; } catch {} }
if (!puppeteer) { console.error('puppeteer-core not found. Set PPTR_DIR.'); process.exit(1); }

const ids = ['1','2','3','4','5','6'];
const { width = 1290, height = 2796, cw } = preset || {};
const plateDir = join(root, 'assets', 'v15-plates');
const outputDir = PLATES ? plateDir : preset ? join(out, preset.folder) : out;
mkdirSync(outputDir, { recursive: true });
const files = [];
const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--force-color-profile=srgb'] });
try {
  const page = await browser.newPage();
  await page.setViewport({ width, height, deviceScaleFactor: 1 });
  for (const id of ids) {
    const url = pathToFileURL(pageFile);
    url.searchParams.set(PLATES ? 'plate' : 'export', id);
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
