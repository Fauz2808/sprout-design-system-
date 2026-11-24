#!/usr/bin/env node
/* V.10 App Store export: static screenshots + animated videos, from the same HTML.
   Usage (from ~/Sprout):
     node "08 - Generated Screens/App Store/tools/export-v10.mjs" [--pal A,B] [--slides 1-10] [--only stills|videos] [--secs 15] [--videos 1]
   Writes to 08 - Generated Screens/App Store/exports/v10/:
     screenshots/<pal>/NN.png          1290 × 2796 RGB, no alpha (App Store Connect 6.9" slot; it scales these to smaller iPhones)
     video-master/<pal>/NN.mp4         1290 × 2796, 30 fps, H.264, the animated screenshot (review, social, website)
     app-preview/<pal>/NN.mp4          886 × 1920, 30 fps, H.264 High 4.0, silent stereo AAC (App Store Connect App Preview spec)
   Motion is frame-exact: the page pauses every CSS animation and the exporter seeks it with window.__seek(t),
   so frame k is the page at exactly k/30 s, regardless of how slow the capture is.
   Needs puppeteer-core (PPTR_DIR or the known installs below), Google Chrome, ffmpeg. */
import { createRequire } from 'node:module';
import { existsSync, mkdirSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawn, execFileSync } from 'node:child_process';
import { homedir } from 'node:os';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const pageFile = join(root, 'screenshots-v10-ten-slides.html');
const outRoot = join(root, 'exports', 'v10');

const arg = (name, def) => { const i = process.argv.indexOf('--' + name); return i > 0 ? process.argv[i + 1] : def; };
const pals = arg('pal', 'A,B').split(',');
const [s0, s1] = arg('slides', '1-10').split('-').map(Number);
const slides = Array.from({ length: (s1 || s0) - s0 + 1 }, (_, i) => s0 + i);
const only = arg('only', 'all');
const videoSlides = arg('videos', '1').split(',').map(Number); // only slide 1 moves since the logo left slides 2-10
const SECS = +arg('secs', 15), FPS = 30, W = 1290, H = 2796;

const candidates = [process.env.PPTR_DIR, join(homedir(), 'Data Trainning', 'Ahmad Personal Intro'), join(homedir(), 'Data Trainning', 'kalimantan-peat-fire'), homedir()].filter(Boolean);
let puppeteer;
for (const dir of candidates) { try { puppeteer = createRequire(join(dir, 'noop.js'))('puppeteer-core'); break; } catch {} }
if (!puppeteer) { console.error('puppeteer-core not found. Set PPTR_DIR to a folder with node_modules/puppeteer-core.'); process.exit(1); }
const chrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const browser = await puppeteer.launch({ executablePath: chrome, headless: 'new', args: ['--force-color-profile=srgb', '--disable-gpu-vsync'] });
const page = await browser.newPage();
await page.setViewport({ width: W, height: H, deviceScaleFactor: 1 });

async function open(n, pal) {
  await page.goto(`${pathToFileURL(pageFile).href}?export=${n}&pal=${pal}&w=${W}&h=${H}&video`, { waitUntil: 'networkidle0' });
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => Promise.all([...document.images].map(i => i.complete ? i.decode().catch(() => 0) : new Promise(r => { i.onload = i.onerror = r; }))));
}
const seek = t => page.evaluate(t => { window.__seek(t); return new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); }, t);

const stills = [];
for (const pal of pals) for (const n of slides) {
  const nn = String(n).padStart(2, '0');
  await open(n, pal);
  if (only !== 'videos') {
    const dir = join(outRoot, 'screenshots', pal); mkdirSync(dir, { recursive: true });
    await seek(2.2);
    const f = join(dir, nn + '.png');
    await page.screenshot({ path: f, clip: { x: 0, y: 0, width: W, height: H } });
    stills.push(f);
  }
  if (only !== 'stills' && videoSlides.includes(n)) {
    const mdir = join(outRoot, 'video-master', pal), pdir = join(outRoot, 'app-preview', pal);
    mkdirSync(mdir, { recursive: true }); mkdirSync(pdir, { recursive: true });
    const master = join(mdir, nn + '.mp4'), preview = join(pdir, nn + '.mp4');
    const proc = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
      '-c:v', 'libx264', '-preset', 'medium', '-crf', '16', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-r', String(FPS), master], { stdio: ['pipe', 'ignore', 'inherit'] });
    const done = new Promise((res, rej) => proc.on('close', c => c ? rej(new Error('ffmpeg master failed ' + master)) : res()));
    const t0 = Date.now(), total = SECS * FPS;
    for (let k = 0; k < total; k++) {
      await seek(k / FPS);
      const buf = await page.screenshot({ type: 'jpeg', quality: 95, clip: { x: 0, y: 0, width: W, height: H }, optimizeForSpeed: true });
      if (!proc.stdin.write(buf)) await new Promise(r => proc.stdin.once('drain', r));
    }
    proc.stdin.end(); await done;
    // App Preview: 886 × 1920 (same 0.4614 aspect as 1290 × 2796), High 4.0, ~10 Mbps, silent stereo AAC 48 kHz.
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', master, '-f', 'lavfi', '-i', 'anullsrc=r=48000:cl=stereo',
      '-vf', 'scale=886:1920:flags=lanczos,setsar=1', '-c:v', 'libx264', '-profile:v', 'high', '-level', '4.0', '-pix_fmt', 'yuv420p',
      '-b:v', '10M', '-maxrate', '12M', '-bufsize', '20M', '-r', String(FPS), '-c:a', 'aac', '-b:a', '256k', '-shortest', '-movflags', '+faststart', preview]);
    console.log(`${pal}/${nn}  ${total} frames in ${((Date.now() - t0) / 1000).toFixed(0)} s  master ${(statSync(master).size / 1e6).toFixed(1)} MB  preview ${(statSync(preview).size / 1e6).toFixed(1)} MB`);
  }
}
await Promise.race([browser.close(), new Promise(r => setTimeout(r, 5000))]); // close can hang on macOS headless; never block on it

if (stills.length) {
  const py = `import sys
from PIL import Image
for f in sys.argv[1:]:
    im = Image.open(f)
    if im.mode != 'RGB':
        im.convert('RGB').save(f, optimize=True)
        im = Image.open(f)
    print(f.split('/exports/')[-1], im.size, im.mode)
`;
  execFileSync('python3', ['-I', '-c', py, ...stills], { stdio: 'inherit' });
}
console.log('done →', outRoot);
process.exit(0);
