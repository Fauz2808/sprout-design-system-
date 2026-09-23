const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');
const js = fs.readFileSync(path.join(root, 'script.js'), 'utf8');
test('every referenced local asset exists', () => {
  const assets = [...html.matchAll(/(?:src|href)="(\.\/[^"?#]+)/g)].map((match) => match[1]);
  assert.ok(assets.length > 12);
  for (const asset of assets) assert.ok(fs.existsSync(path.join(root, asset)), asset);
});
test('ids are unique and local navigation targets exist', () => {
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
  assert.equal(ids.length, new Set(ids).size);
  for (const match of html.matchAll(/href="#([^"]+)"/g)) assert.ok(ids.includes(match[1]), match[1]);
  for (const match of html.matchAll(/aria-controls="([^"]+)"/g)) assert.ok(ids.includes(match[1]), match[1]);
});
test('leadership brief sections are represented', () => {
  for (const phrase of ['Parenting on', 'Daily Brief', 'The class hub', 'Voice AI', 'The parent directory', 'Your weekend planner', 'Social &amp; belonging', 'Communication &amp; reminders', 'We built Sprout']) assert.ok(html.includes(phrase), phrase);
});
test('required product interactions have complete tab sets', () => {
  assert.deepEqual([...html.matchAll(/data-screen="([^"]+)"/g)].map((m) => m[1]), ['brief','events','chat']);
  assert.deepEqual([...html.matchAll(/data-brief="([^"]+)"/g)].map((m) => m[1]), ['reminder','invite','today','upcoming']);
  assert.deepEqual([...html.matchAll(/data-voice="([^"]+)"/g)].map((m) => m[1]), ['reminders','birthdays','events','carpool']);
});
test('missing assets are explicitly labeled placeholders', () => {
  assert.ok(html.includes('VOICE AI PRODUCT VISUAL PLACEHOLDER'));
  assert.equal((html.match(/LOCAL EVENT IMAGE PLACEHOLDER/g) || []).length, 2);
  assert.ok(html.includes('ADDITIONAL APP ICONS'));
});
test('store links point to supplied destinations', () => {
  assert.ok(html.includes('id6739574052'));
  assert.ok(html.includes('id=com.meetingpoint'));
  assert.ok(!html.includes('href="#"'));
});
test('responsive layout and reduced motion are defined', () => {
  assert.ok(css.includes('@media(max-width:680px)'));
  assert.ok(css.includes('@media(prefers-reduced-motion:reduce)'));
  assert.ok(js.includes("if (reduceMotion.matches) return"));
});
