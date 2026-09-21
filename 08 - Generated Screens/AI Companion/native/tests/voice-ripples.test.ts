import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  createVoiceRipples,
  stepVoiceRipples,
  VOICE_RIPPLE_COOLDOWN_MS,
  VOICE_RIPPLE_LIFESPAN_MS,
  type VoiceRipplesState,
} from '../src/companion/voiceRipples';

const activeCount = (state: VoiceRipplesState) => state.strengths.filter((strength) => strength > 0).length;
const emitted = (state: VoiceRipplesState) => state.agesMs.some((age, index) => age === 0 && state.strengths[index] > 0);

test('silence, quiet energy, and weak onsets do not emit rings', () => {
  for (const [pulse, energy] of [[0, 0], [0.8, 0.079], [0.179, 1]]) {
    const state = stepVoiceRipples(createVoiceRipples(), pulse, energy, 16);
    assert.equal(activeCount(state), 0);
  }
  let state = createVoiceRipples();
  for (let frame = 0; frame < 180; frame += 1) {
    state = stepVoiceRipples(state, 0, 0, 1000 / 60);
  }
  assert.deepEqual(state, createVoiceRipples());
});

test('a rising voice pulse emits one ring and does not mutate prior state', () => {
  const previous = createVoiceRipples();
  const state = stepVoiceRipples(previous, 0.6, 0.5, 16);
  assert.deepEqual(previous, createVoiceRipples());
  assert.equal(activeCount(state), 1);
  assert.equal(state.agesMs[0], 0);
  assert.ok(state.strengths[0] > 0.35 && state.strengths[0] < 1);
  assert.equal(state.cooldownMs, VOICE_RIPPLE_COOLDOWN_MS);
});

test('one rising onset cannot burst into several rings', () => {
  let state = createVoiceRipples();
  let emissions = 0;
  for (let frame = 1; frame <= 10; frame += 1) {
    state = stepVoiceRipples(state, frame / 10, 1, 16);
    if (emitted(state)) emissions += 1;
  }
  assert.equal(emissions, 1);
});

test('cooldown limits closely spaced syllables to one emission per 300ms', () => {
  let state = createVoiceRipples();
  const emissionTimes: number[] = [];
  for (let elapsed = 50; elapsed <= 800; elapsed += 50) {
    state = stepVoiceRipples(state, elapsed % 100 === 50 ? 0.6 : 0, 0.6, 50);
    if (emitted(state)) emissionTimes.push(elapsed);
  }
  assert.deepEqual(emissionTimes, [50, 350, 650]);
  assert.equal(activeCount(state), 3);
});

test('a held voice peak does not emit again after cooldown', () => {
  let state = createVoiceRipples();
  let emissions = 0;
  for (let frame = 0; frame < 240; frame += 1) {
    state = stepVoiceRipples(state, 0.8, 0.8, 1000 / 60);
    if (emitted(state)) emissions += 1;
  }
  assert.equal(emissions, 1);
  assert.equal(activeCount(state), 0);
});

test('ring storage stays at three slots and an onset replaces the oldest slot', () => {
  let state: VoiceRipplesState = {
    agesMs: [100, 400, 200],
    strengths: [0.2, 0.4, 0.6],
    cooldownMs: 0,
    previousPulse: 0,
  };
  state = stepVoiceRipples(state, 0.5, 0.5, 16);
  assert.deepEqual(state.agesMs, [116, 0, 216]);
  assert.equal(state.strengths[0], 0.2);
  assert.equal(state.strengths[2], 0.6);
  for (let frame = 0; frame < 1000; frame += 1) {
    state = stepVoiceRipples(state, frame % 2 ? 1 : 0, 1, 16);
    assert.equal(state.agesMs.length, 3);
    assert.equal(state.strengths.length, 3);
    assert.ok(activeCount(state) <= 3);
  }
});

test('ring age advances its fade phase and expires after 900ms', () => {
  let state = stepVoiceRipples(createVoiceRipples(), 0.5, 0.5, 16);
  const strength = state.strengths[0];
  state = stepVoiceRipples(state, 0, 0, 450);
  assert.equal(state.agesMs[0] / VOICE_RIPPLE_LIFESPAN_MS, 0.5);
  assert.equal(state.strengths[0], strength);
  state = stepVoiceRipples(state, 0, 0, 450);
  assert.equal(state.agesMs[0], VOICE_RIPPLE_LIFESPAN_MS);
  assert.equal(state.strengths[0], 0);
});

test('disabling for hidden or reduced-motion mode clears rings without replaying a held pulse', () => {
  let state = stepVoiceRipples(createVoiceRipples(), 0.7, 0.7, 16);
  state = stepVoiceRipples(state, 0.7, 0.7, NaN, false);
  assert.equal(activeCount(state), 0);
  assert.ok(state.agesMs.every((age) => age === VOICE_RIPPLE_LIFESPAN_MS));
  assert.equal(state.cooldownMs, 0);
  state = stepVoiceRipples(state, 0.7, 0.7, 16, true);
  assert.equal(activeCount(state), 0);
  state = stepVoiceRipples(state, 0, 0, 16);
  state = stepVoiceRipples(state, 0.7, 0.7, 16);
  assert.equal(activeCount(state), 1);
});

test('invalid or nonpositive time does not advance, emit, or consume an onset', () => {
  const previous: VoiceRipplesState = {
    agesMs: [200, 900, 900],
    strengths: [0.5, 0, 0],
    cooldownMs: 75,
    previousPulse: 0.25,
  };
  for (const elapsedMs of [0, -1, NaN, Infinity, -Infinity]) {
    assert.deepEqual(stepVoiceRipples(previous, 0.9, 0.9, elapsedMs), previous);
  }
  const expired = stepVoiceRipples(previous, 0, 0, Number.MAX_VALUE);
  assert.equal(activeCount(expired), 0);
  assert.equal(expired.cooldownMs, 0);
});

test('invalid input and state stay finite and bounded', () => {
  const values = [NaN, Infinity, -Infinity, -100, 0, 0.5, 100];
  for (const value of values) {
    const broken: VoiceRipplesState = {
      agesMs: [value, value, value],
      strengths: [value, value, value],
      cooldownMs: value,
      previousPulse: value,
    };
    for (const elapsedMs of [0, 16, 10000]) {
      const state = stepVoiceRipples(broken, value, value, elapsedMs);
      for (const age of state.agesMs) assert.ok(Number.isFinite(age) && age >= 0 && age <= VOICE_RIPPLE_LIFESPAN_MS);
      for (const strength of state.strengths) assert.ok(Number.isFinite(strength) && strength >= 0 && strength <= 1);
      assert.ok(Number.isFinite(state.cooldownMs) && state.cooldownMs >= 0 && state.cooldownMs <= VOICE_RIPPLE_COOLDOWN_MS);
      assert.ok(Number.isFinite(state.previousPulse) && state.previousPulse >= 0 && state.previousPulse <= 1);
    }
  }
  for (const value of [NaN, Infinity, -Infinity, undefined, null]) {
    assert.equal(activeCount(stepVoiceRipples(createVoiceRipples(), value as number, 1, 16)), 0);
    assert.equal(activeCount(stepVoiceRipples(createVoiceRipples(), 1, value as number, 16)), 0);
  }
});

test('60Hz and 120Hz emit the same syllables from an analytic voice envelope', () => {
  const simulate = (fps: number) => {
    let state = createVoiceRipples();
    const times: number[] = [];
    for (let frame = 1; frame <= fps * 2; frame += 1) {
      const milliseconds = frame * 1000 / fps;
      const pulse = [200, 620, 1040, 1460].reduce((sum, center) => (
        sum + 0.8 * Math.exp(-Math.pow((milliseconds - center) / 55, 2))
      ), 0);
      state = stepVoiceRipples(state, pulse, pulse, 1000 / fps);
      if (emitted(state)) times.push(milliseconds);
    }
    return times;
  };
  const slow = simulate(60);
  const fast = simulate(120);
  assert.equal(slow.length, 4);
  assert.equal(fast.length, slow.length);
  slow.forEach((time, index) => assert.ok(Math.abs(time - fast[index]) <= 1000 / 60));
});

test('a soft, slow attack has the same onset sensitivity at 60Hz and 120Hz', () => {
  const simulate = (fps: number) => {
    let state = createVoiceRipples();
    const times: number[] = [];
    for (let frame = 1; frame <= fps * 4; frame += 1) {
      const milliseconds = frame * 1000 / fps;
      const pulse = [600, 1600, 2600].reduce((sum, center) => (
        sum + 0.7 * Math.exp(-Math.pow((milliseconds - center) / 280, 2))
      ), 0);
      state = stepVoiceRipples(state, pulse, pulse, 1000 / fps);
      if (emitted(state)) times.push(milliseconds);
    }
    return times;
  };
  const slow = simulate(60);
  const fast = simulate(120);
  assert.equal(slow.length, 3);
  assert.equal(fast.length, slow.length);
  slow.forEach((time, index) => assert.ok(Math.abs(time - fast[index]) <= 1000 / 60));
});
