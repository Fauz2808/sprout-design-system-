const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');
const script = fs.readFileSync(path.join(root, 'script.js'), 'utf8');

const matches = (source, expression) => [...source.matchAll(expression)].map(match => match[1]);

test('internal links resolve to unique page ids', () => {
  const ids = matches(html, /\bid="([^"]+)"/g);
  assert.equal(new Set(ids).size, ids.length, 'duplicate id found');

  const targets = matches(html, /href="#([^"]+)"/g);
  for (const target of targets) assert.ok(ids.includes(target), `missing #${target}`);
  assert.doesNotMatch(html, /href="#"/);
});

test('local images exist', () => {
  const imagePaths = new Set([
    ...matches(html, /(?:src|href)="(\.\/assets\/[^"#?]+)"/g),
    ...matches(css, /url\("(\.\/assets\/[^"#?]+)"\)/g),
    ...matches(script, /image:\s*["'](\.\/assets\/[^"']+)["']/g)
  ]);
  assert.ok(imagePaths.size > 0, 'expected local product assets');
  for (const imagePath of imagePaths) {
    assert.ok(fs.existsSync(path.join(root, imagePath)), `missing ${imagePath}`);
  }
});

test('interactive controls expose accessible structure', () => {
  assert.match(html, /<meta name="viewport"/);
  assert.match(html, /role="tablist"/);
  assert.equal((html.match(/role="tab"/g) || []).length, 3);
  assert.match(html, /aria-live="polite"/);
  assert.match(script, /event\.key === ["']Escape["']/);
  assert.match(script, /event\.key === ["']ArrowRight["']/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
});

test('copy and source pass hygiene checks', () => {
  for (const [name, source] of [['HTML', html], ['CSS', css], ['JavaScript', script]]) {
    assert.doesNotMatch(source, /—/, `${name} contains an em dash`);
    assert.doesNotMatch(source, /\b(?:TODO|FIXME)\b/, `${name} contains unfinished work`);
  }
});
