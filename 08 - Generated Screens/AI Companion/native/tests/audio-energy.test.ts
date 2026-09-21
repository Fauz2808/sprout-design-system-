import assert from 'node:assert/strict';
import { test } from 'node:test';
import { AUDIO_MOTION, normalizeMetering, smoothEnergy } from '../src/audio/energy';

test('missing and invalid metering is silence, never phantom speech', () => {
  for (const value of [undefined, null, NaN, Infinity, -Infinity]) {
    assert.equal(normalizeMetering(value), 0);
  }
});

test('quiet noise is gated and useful voice range is bounded', () => {
  assert.equal(normalizeMetering(-160), 0);
  assert.equal(normalizeMetering(-55), 0);
  assert.equal(normalizeMetering(-52), 0);
  assert.equal(normalizeMetering(-32.5), 0.5);
  assert.equal(normalizeMetering(-10), 1);
  assert.equal(normalizeMetering(0), 1);
});

test('energy rises monotonically with volume after the noise gate', () => {
  let previous = 0;
  for (let db = -160; db <= 10; db += 0.25) {
    const value = normalizeMetering(db);
    assert.ok(value >= previous && value >= 0 && value <= 1);
    previous = value;
  }
});

test('attack is faster than release, and settles without overshoot', () => {
  const attack = smoothEnergy(0, 1, AUDIO_MOTION.attackMs);
  const release = smoothEnergy(1, 0, AUDIO_MOTION.attackMs);
  assert.ok(attack > 0.63 && attack < 0.64);
  assert.ok(1 - release < attack);
  assert.equal(smoothEnergy(1, 0, 4000), 0);
  assert.ok(smoothEnergy(0, 1, 4000) <= 1);
});

test('speech attacks promptly while short pauses release gently', () => {
  assert.ok(smoothEnergy(0, 1, 50) > 0.66);
  const pause = smoothEnergy(1, 0, 100);
  assert.ok(pause > 0.58 && pause < 0.60);
});

test('same elapsed time gives same envelope at 60Hz and 120Hz', () => {
  const simulate = (fps: number) => {
    let value = 0;
    for (let frame = 0; frame < fps; frame += 1) value = smoothEnergy(value, 0.75, 1000 / fps);
    return value;
  };
  assert.ok(Math.abs(simulate(60) - simulate(120)) < 1e-12);
});

test('invalid frame input cannot poison shader uniforms', () => {
  assert.equal(smoothEnergy(NaN, undefined as unknown as number, 16), 0);
  assert.equal(smoothEnergy(0.5, 1, -1), 0.5);
  assert.equal(smoothEnergy(0.5, 1, NaN), 0.5);
  assert.ok(smoothEnergy(10, -10, 16) <= 1);
});
