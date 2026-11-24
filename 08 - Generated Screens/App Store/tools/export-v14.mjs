// V.14 people concepts: render every slide (A1..C3) at 1290 x 2796 and a contact sheet.
// node "08 - Generated Screens/App Store/tools/export-v14.mjs"  ->  exports/v14/{A1..C3}.png + sheet.png
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';
import { homedir } from 'node:os';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const pageFile = join(root, 'screenshots-v14-people-concepts.html');
const out = join(root, 'exports', 'v14');
mkdirSync(out, { recursive: true });

const candidates = [process.env.PPTR_DIR, join(homedir(), 'Data Trainning', 'Ahmad Personal Intro'), join(homedir(), 'Data Trainning', 'kalimantan-peat-fire'), homedir()].filter(Boolean);
let puppeteer;
for (const dir of candidates) { try { puppeteer = createRequire(join(dir, 'noop.js'))('puppeteer-core'); break; } catch {} }
if (!puppeteer) { console.error('puppeteer-core not found. Set PPTR_DIR.'); process.exit(1); }

const ids = ['A1', 'A2', 'A3', 'B1', 'B2', 'B3', 'C1', 'C2', 'C3'];
const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--force-color-profile=srgb'] });
const page = await browser.newPage();
await page.setViewport({ width: 1290, height: 2796, deviceScaleFactor: 1 });
for (const id of ids) {
  await page.goto(`${pathToFileURL(pageFile).href}?export=${id}`, { waitUntil: 'networkidle0' });
  await page.evaluate(() => document.fonts.ready);
  const bad = await page.evaluate(() => [...document.images].filter(i => !i.naturalWidth).map(i => i.src));
  if (bad.length) console.warn(id, 'broken images:', bad);
  await page.screenshot({ path: join(out, id + '.png'), clip: { x: 0, y: 0, width: 1290, height: 2796 } });
  console.log('wrote', id);
}
await browser.close();

execFileSync('python3', ['-c', `
from PIL import Image
ids=${JSON.stringify(ids)}; w=430; h=int(2796*w/1290); g=24
s=Image.new('RGB',(3*w+4*g,3*h+4*g),(236,233,226))
for k,i in enumerate(ids):
  r,c=divmod(k,3); s.paste(Image.open('${out}/'+i+'.png').convert('RGB').resize((w,h),Image.LANCZOS),(g+c*(w+g),g+r*(h+g)))
s.save('${out}/sheet.png')
`]);
console.log('sheet ->', join(out, 'sheet.png'));
