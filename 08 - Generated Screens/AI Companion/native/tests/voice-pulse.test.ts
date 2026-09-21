import assert from 'node:assert/strict';
import { test } from 'node:test';
import { stepVoicePulse } from '../src/companion/voicePulse';

test('silence and levels below the onset gate cannot start a pulse', () => {
  let state = { baseline: 0, pulse: 0 };
  for (let frame = 0; frame < 240; frame += 1) {
    const energy = frame % 3 === 0 ? 0.079 : 0;
    state = stepVoicePulse(energy, state.baseline, state.pulse, 1000 / 60);
    assert.equal(state.pulse, 0);
  }
});

test('speech onset produces a pulse that decays after the voice stops', () => {
  let state = stepVoicePulse(0.5, 0, 0, 1000 / 60);
  assert.ok(state.pulse > 0.9);
  for (let frame = 0; frame < 60; frame += 1) {
    const previous = state.pulse;
    state = stepVoicePulse(0, state.baseline, state.pulse, 1000 / 60);
    assert.ok(state.pulse < previous);
  }
  assert.ok(state.pulse < 0.002);
});

test('a sustained voice settles without generating repeated beats', () => {
  let state = stepVoicePulse(0.4, 0, 0, 1000 / 60);
  for (let frame = 0; frame < 240; frame += 1) {
    const previous = state.pulse;
    state = stepVoicePulse(0.4, state.baseline, state.pulse, 1000 / 60);
    assert.ok(state.pulse <= previous);
  }
  assert.ok(Math.abs(state.baseline - 0.4) < 1e-8);
  assert.ok(state.pulse < 1e-8);
  const renewed = stepVoicePulse(0.8, state.baseline, state.pulse, 1000 / 60);
  assert.ok(renewed.pulse > 0.9);
});

test('finite and malformed inputs always produce bounded finite state', () => {
  const values = [-100, -1, 0, 0.5, 1, 100, NaN, Infinity, -Infinity];
  for (const energy of values) {
    for (const baseline of values) {
      for (const pulse of values) {
        for (const elapsedMs of [-1, 0, 16, 10000, NaN, Infinity]) {
          const next = stepVoicePulse(energy, baseline, pulse, elapsedMs);
          for (const value of [next.baseline, next.pulse]) {
            assert.ok(Number.isFinite(value) && value >= 0 && value <= 1);
          }
        }
      }
    }
  }
});

test('missing or nonfinite energy is treated as silence', () => {
  for (const energy of [undefined, null, NaN, Infinity, -Infinity]) {
    assert.deepEqual(stepVoicePulse(energy as number, 0, 0, 16), { baseline: 0, pulse: 0 });
  }
  assert.deepEqual(stepVoicePulse(0, NaN, Infinity, 16), { baseline: 0, pulse: 0 });
});

test('invalid or nonpositive elapsed time preserves sanitized state', () => {
  for (const elapsedMs of [0, -1, NaN, Infinity, -Infinity]) {
    assert.deepEqual(stepVoicePulse(1, 0.25, 0.75, elapsedMs), { baseline: 0.25, pulse: 0.75 });
    assert.deepEqual(stepVoicePulse(1, -1, 2, elapsedMs), { baseline: 0, pulse: 1 });
    assert.deepEqual(stepVoicePulse(1, NaN, Infinity, elapsedMs), { baseline: 0, pulse: 0 });
  }
});

test('a long frame gap lets stale motion settle', () => {
  const state = stepVoicePulse(0.5, 0, 1, 10000);
  assert.equal(state.baseline, 0.5);
  assert.ok(state.pulse < 1e-8);
});

test('the same speech envelope has a similar pulse at 60Hz and 120Hz', () => {
  const envelope = (milliseconds: number) => {
    const syllables = [[150, 0.36, 90], [530, 0.52, 120], [950, 0.42, 150]];
    return syllables.reduce((sum, [center, amplitude, width]) => (
      sum + amplitude * Math.exp(-Math.pow((milliseconds - center) / width, 2))
    ), 0);
  };
  const simulate = (fps: number) => {
    let state = { baseline: 0, pulse: 0 };
    const samples: typeof state[] = [];
    for (let frame = 1; frame <= fps * 2; frame += 1) {
      state = stepVoicePulse(envelope(frame * 1000 / fps), state.baseline, state.pulse, 1000 / fps);
      if (frame % (fps / 60) === 0) samples.push(state);
    }
    return samples;
  };
  const slow = simulate(60);
  const fast = simulate(120);
  const pulseDifference = Math.max(...slow.map((sample, index) => Math.abs(sample.pulse - fast[index].pulse)));
  const baselineDifference = Math.max(...slow.map((sample, index) => Math.abs(sample.baseline - fast[index].baseline)));
  assert.ok(pulseDifference < 0.06, `pulse frame-rate difference: ${pulseDifference}`);
  assert.ok(baselineDifference < 0.015, `baseline frame-rate difference: ${baselineDifference}`);
  assert.ok(slow.at(-1)!.pulse < 0.01 && fast.at(-1)!.pulse < 0.01);
});
