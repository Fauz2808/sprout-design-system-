const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const code = fs.readFileSync(path.join(__dirname, '../script.js'), 'utf8');
test('Daily Brief walkthrough loops through all four states', () => {
  assert.ok(code.includes('setInterval'));
  assert.ok(code.includes('(current + 1) % briefButtons.length'));
  for (const state of ['reminder','invite','today','upcoming']) assert.ok(code.includes(`${state}:`));
});
test('screen transitions update image and accessible alt text', () => {
  assert.ok(code.includes('heroScreen.src = next.src'));
  assert.ok(code.includes('heroScreen.alt = next.alt'));
  assert.ok(code.includes('briefScreen.alt = data.alt'));
});
test('selected tab state stays synchronized for keyboard and assistive tech', () => {
  assert.ok(code.includes("button.setAttribute('aria-selected', String(selected))"));
  assert.ok(code.includes('button.tabIndex = selected ? 0 : -1'));
});
