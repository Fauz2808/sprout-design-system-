// Sprout — Play Store feature graphic builder
// Renders the HTML layouts and exports exact 1024x500 PNGs via Puppeteer.
// Usage:  node export.js
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const DIR = __dirname;
const LOGO = path.resolve(DIR, '../../09 - Logo/Sprout Logo White Background.jpeg');
const W = 1024, H = 500, SCALE = 2; // render @2x, supersample down for crisp type

const JOBS = [
  ['feature-graphic.html',       'sprout-feature-graphic.png'],        // dark forest
  ['feature-graphic-light.html', 'sprout-feature-graphic-light.png'],  // light cream
];

(async () => {
  if (!fs.existsSync(LOGO)) throw new Error('Logo not found: ' + LOGO);
  const logoB64 = fs.readFileSync(LOGO).toString('base64');
  const logoData = `data:image/jpeg;base64,${logoB64}`;

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--font-render-hinting=none'],
  });

  for (const [src, out] of JOBS) {
    const srcPath = path.join(DIR, src);
    if (!fs.existsSync(srcPath)) { console.warn('skip (missing):', src); continue; }

    const html = fs.readFileSync(srcPath, 'utf8').replace('__CLOVER__', logoData);

    const page = await browser.newPage();
    await page.setViewport({ width: W, height: H, deviceScaleFactor: SCALE });
    await page.setContent(html, { waitUntil: 'networkidle0' });
    await page.evaluateHandle('document.fonts.ready');           // wait for Google Fonts
    await new Promise(r => setTimeout(r, 400));

    // 1) capture at 2x  ->  2) supersample down to exact 1024x500 in-page (no `sharp` needed)
    const big2x = (await page.screenshot({ type: 'png', clip: { x: 0, y: 0, width: W, height: H } })).toString('base64');
    const finalB64 = await page.evaluate(async (dataUrl, w, h) => {
      const img = new Image();
      await new Promise(res => { img.onload = res; img.src = dataUrl; });
      const c = document.createElement('canvas');
      c.width = w; c.height = h;
      const ctx = c.getContext('2d');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, w, h);
      return c.toDataURL('image/png').split(',')[1];
    }, `data:image/png;base64,${big2x}`, W, H);

    const outPath = path.join(DIR, out);
    fs.writeFileSync(outPath, Buffer.from(finalB64, 'base64'));
    const kb = (fs.statSync(outPath).size / 1024).toFixed(0);
    console.log(`✓ ${out}  ${W}x${H}  ${kb} KB`);
    await page.close();
  }

  await browser.close();
  console.log('Done. Play Store feature graphics ready (PNG, 1024x500, <15MB).');
})();
