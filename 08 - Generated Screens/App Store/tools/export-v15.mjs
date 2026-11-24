// V.15 people: render slides 1-9 at 1290 x 2796 and a contact sheet.
// node "08 - Generated Screens/App Store/tools/export-v15.mjs"  ->  exports/v15/{1..9}.png + sheet.png
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
mkdirSync(out, { recursive: true });

const candidates = [process.env.PPTR_DIR, join(homedir(), 'Data Trainning', 'Ahmad Personal Intro'), join(homedir(), 'Data Trainning', 'kalimantan-peat-fire'), homedir()].filter(Boolean);
let puppeteer;
for (const dir of candidates) { try { puppeteer = createRequire(join(dir, 'noop.js'))('puppeteer-core'); break; } catch {} }
if (!puppeteer) { console.error('puppeteer-core not found. Set PPTR_DIR.'); process.exit(1); }

const ids = ['1','2','3','4','5','6','7','8','9'];
const PLATES = process.argv.includes('--plates'); // background plates for the Figma capture
const plateDir = join(root, 'assets', 'v15-plates'); if (PLATES) mkdirSync(plateDir, { recursive: true });
const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--force-color-profile=srgb'] });
const page = await browser.newPage();
await page.setViewport({ width: 1290, height: 2796, deviceScaleFactor: 1 });
for (const id of ids) {
  await page.goto(`${pathToFileURL(pageFile).href}?${PLATES ? 'plate' : 'export'}=${id}`, { waitUntil: 'networkidle0' });
  await page.waitForFunction(() => window.__ready);
  await page.evaluate(() => document.fonts.ready);
  const bad = await page.evaluate(() => [...document.images].filter(i => !i.naturalWidth).map(i => i.src));
  if (bad.length) console.warn(id, 'broken images:', bad);
  await page.screenshot({ path: join(PLATES ? plateDir : out, id + '.png'), clip: { x: 0, y: 0, width: 1290, height: 2796 } });
  console.log('wrote', id);
}
await browser.close();
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
s=Image.new('RGB',(9*w+10*g,h+2*g),(236,233,226))
for k,i in enumerate(ids):
  r,c=0,k; s.paste(Image.open('${out}/'+i+'.png').convert('RGB').resize((w,h),Image.LANCZOS),(g+c*(w+g),g+r*(h+g)))
s.save('${out}/sheet.png')
`]);
console.log('sheet ->', join(out, 'sheet.png'));
