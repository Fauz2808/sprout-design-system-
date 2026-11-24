#!/usr/bin/env node
/* Animated GIF of a V.11 slide (default slide 1, the moving orbit), seamless loop, for review and sharing.
   App Store Connect does not take GIFs (screenshots = PNG/JPG, previews = 886 x 1920 MP4); this is for chat, decks, web.
   Usage (from ~/Sprout): node "08 - Generated Screens/App Store/tools/export-gif.mjs" [--slide 1] [--w 1206 --h 2622] [--secs 15] [--fps 15]
   Frames are rendered lossless straight from the page (a GIF made from the H.264 master re-encodes every pixel because of
   codec noise), the last second cross-fades into the first so the loop has no jump, ordered dither keeps static pixels
   identical between frames. Writes exports/v11/size-WxH/NN-slide.gif plus a half-size share copy. Needs ffmpeg, gifsicle. */
import { createRequire } from 'node:module';
import { mkdirSync, rmSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';
import { homedir, tmpdir } from 'node:os';

const here = dirname(fileURLToPath(import.meta.url)), root = resolve(here, '..');
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > 0 ? process.argv[i + 1] : d; };
const N = +arg('slide', 1), W = +arg('w', 1206), H = +arg('h', 2622), SECS = +arg('secs', 15), FPS = +arg('fps', 15), FADE = 1;
const nn = String(N).padStart(2, '0'), out = join(root, 'exports', 'v11', `size-${W}x${H}`);
const frames = join(tmpdir(), `sprout-gif-${process.pid}`); mkdirSync(frames, { recursive: true }); mkdirSync(out, { recursive: true });

let puppeteer;
for (const d of [process.env.PPTR_DIR, join(homedir(), 'Data Trainning', 'Ahmad Personal Intro'), homedir()].filter(Boolean)) { try { puppeteer = createRequire(join(d, 'noop.js'))('puppeteer-core'); break; } catch {} }
const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--force-color-profile=srgb'] });
const page = await browser.newPage(); await page.setViewport({ width: W, height: H, deviceScaleFactor: 1 });
await page.goto(`${pathToFileURL(join(root, 'screenshots-v11-nine-slides.html')).href}?export=${N}&pal=A&w=${W}&h=${H}&video`, { waitUntil: 'networkidle0', timeout: 90000 });
await page.evaluate(() => document.fonts.ready);
const total = (SECS + FADE) * FPS;
for (let k = 0; k < total; k++) {
  await page.evaluate(t => { window.__seek(t); return new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); }, k / FPS);
  await page.screenshot({ path: join(frames, `f${String(k).padStart(4, '0')}.png`), clip: { x: 0, y: 0, width: W, height: H } });
}
await Promise.race([browser.close(), new Promise(r => setTimeout(r, 5000))]);

/* loop: play frames FADE..SECS+FADE, and blend the last FADE seconds with frames 0..FADE so the end lands on the start */
execFileSync('python3', ['-I', '-c', `import sys, os
from PIL import Image
d, fps, secs, fade = sys.argv[1], int(sys.argv[2]), int(sys.argv[3]), int(sys.argv[4])
F = lambda k: os.path.join(d, 'f%04d.png' % k)
n, m = secs * fps, fade * fps
for i in range(n):
    src = Image.open(F(i + m)).convert('RGB')
    if i >= n - m:
        a = (i - (n - m) + 1) / m
        src = Image.blend(src, Image.open(F(i - (n - m))).convert('RGB'), a)
    src.save(os.path.join(d, 'o%04d.png' % i))
`, frames, String(FPS), String(SECS), String(FADE)], { stdio: 'inherit' });

const gif = (scale, file) => {
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', join(frames, 'o%04d.png'), '-vf',
    `scale=${scale}:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=256:stats_mode=full[p];[b][p]paletteuse=dither=bayer:bayer_scale=5:diff_mode=rectangle`, '-loop', '0', file]);
  execFileSync('gifsicle', ['-O3', '--no-warnings', '-b', file]);
  console.log(file.split('/exports/')[1], (statSync(file).size / 1e6).toFixed(1) + ' MB');
};
gif(W, join(out, `${nn}-slide-${W}x${H}.gif`));
gif(Math.round(W / 2), join(out, `${nn}-slide-${Math.round(W / 2)}w-share.gif`));
rmSync(frames, { recursive: true, force: true });
process.exit(0);
