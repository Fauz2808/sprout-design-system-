import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createShaderHarness } from './helpers/renderShader';

function materialDifference(first: Uint8Array, second: Uint8Array) {
  let opaquePixels = 0;
  let totalDifference = 0;
  let visiblyChanged = 0;
  let abruptChanges = 0;
  for (let offset = 0; offset < first.length; offset += 4) {
    assert.equal(first[offset + 3], second[offset + 3], 'material flow preserves every alpha sample');
    if (first[offset + 3] < 250) continue;
    opaquePixels += 1;
    let largestDifference = 0;
    for (let channel = 0; channel < 3; channel += 1) {
      const difference = Math.abs(first[offset + channel] - second[offset + channel]);
      totalDifference += difference;
      largestDifference = Math.max(largestDifference, difference);
    }
    if (largestDifference > 5) visiblyChanged += 1;
    if (largestDifference > 32) abruptChanges += 1;
  }
  assert.ok(opaquePixels > 0, 'material comparison includes the visible sphere');
  return {
    meanRgbDifference: totalDifference / (opaquePixels * 3),
    changedFraction: visiblyChanged / opaquePixels,
    abruptFraction: abruptChanges / opaquePixels,
  };
}

test('the 3D material, circular contour, and speech rings render correctly', async (t) => {
  const size = 256;
  const { render, dispose } = await createShaderHarness(new URL('../src/companion/blob3dShader.ts', import.meta.url), 'BLOB_3D_SHADER_SOURCE', size);
  try {
    await t.test('idle rotation changes the material without spinning the circular silhouette', () => {
      const first = render({ time: 0, energy: 0, listening: 0, idle: 1 });
      const turned = render({ time: 12, energy: 0, listening: 0, idle: 1 });
      let changed = 0;
      for (let offset = 0; offset < first.length; offset += 4) {
        if (Math.abs(first[offset + 1] - turned[offset + 1]) > 5) changed += 1;
        assert.equal(first[offset + 3], turned[offset + 3], 'rotation keeps contour stable');
      }
      assert.ok(changed > size * size * 0.1, 'the material visibly turns');
    });

    await t.test('the interior flows independently while the sphere rotation stays fixed', (subtest) => {
      const samples = [];
      for (const [time, materialTime] of [[0, 0], [12, 4], [35, 11]]) {
        const values = { time, materialTime, energy: 0, listening: 0, idle: 1 };
        const difference = materialDifference(
          render(values),
          render({ ...values, materialTime: materialTime + 3 }),
        );
        assert.ok(difference.changedFraction > 0.05,
          `interior visibly flows at rotation ${time}, material phase ${materialTime}: ${difference.changedFraction}`);
        assert.ok(difference.meanRgbDifference > 0.5,
          `flow changes more than isolated pixels: ${difference.meanRgbDifference}`);
        samples.push({ time, materialTime, ...difference });
      }
      subtest.diagnostic(`Independent flow measurements: ${JSON.stringify(samples)}`);
    });

    await t.test('adjacent material frames change gently at 60Hz and 120Hz', (subtest) => {
      const peaks = { 60: { meanRgbDifference: 0, abruptFraction: 0 }, 120: { meanRgbDifference: 0, abruptFraction: 0 } };
      for (const [time, materialTime] of [[0, 0], [12, 3.5], [35, 11.2], [61, 28]]) {
        const values = { time, materialTime, energy: 0, listening: 0, idle: 1 };
        const current = render(values);
        for (const fps of [60, 120] as const) {
          const difference = materialDifference(
            current,
            render({ ...values, materialTime: materialTime + 1 / fps }),
          );
          assert.ok(difference.meanRgbDifference < 2,
            `${fps}Hz average RGB step stays below 2/255: ${difference.meanRgbDifference}`);
          assert.ok(difference.abruptFraction < 0.01,
            `${fps}Hz flow has no broad flashes: ${difference.abruptFraction}`);
          peaks[fps].meanRgbDifference = Math.max(peaks[fps].meanRgbDifference, difference.meanRgbDifference);
          peaks[fps].abruptFraction = Math.max(peaks[fps].abruptFraction, difference.abruptFraction);
        }
      }
      subtest.diagnostic(`Largest adjacent-frame measurements: ${JSON.stringify(peaks)}`);
    });

    await t.test('settled success keeps its interior alive after the completion ring expires', () => {
      const values = { time: 12, energy: 0, listening: 0, success: 1, successProgress: 1 };
      const difference = materialDifference(
        render({ ...values, materialTime: 1 }),
        render({ ...values, materialTime: 7 }),
      );
      assert.ok(difference.changedFraction > 0.05, 'the settled success material still flows');
      assert.ok(difference.meanRgbDifference > 0.5, 'success flow remains visible');
    });

    await t.test('even peak speech keeps a nearly circular, unclipped outline', () => {
      for (const [time, materialTime] of [[0, 3], [8, 9], [23, 19]]) {
        const pixels = render({ time, materialTime, energy: 1, pulse: 1 });
        let left = size; let top = size; let right = 0; let bottom = 0;
        for (let y = 0; y < size; y += 1) {
          for (let x = 0; x < size; x += 1) {
            if (pixels[(y * size + x) * 4 + 3] <= 128) continue;
            left = Math.min(left, x); right = Math.max(right, x);
            top = Math.min(top, y); bottom = Math.max(bottom, y);
          }
        }
        assert.ok(left > 0 && top > 0 && right < size - 1 && bottom < size - 1);
        const ratio = (right - left + 1) / (bottom - top + 1);
        assert.ok(ratio > 0.975 && ratio < 1.025, `circular aspect: ${ratio}`);
        assert.ok(right - left > size * 0.75, 'the full-size orb stays visible');
      }
    });

    await t.test('reduced motion freezes rotation, interior flow, voice deformation, and ripples', () => {
      assert.deepEqual(
        render({ motion: 0, time: 80, materialTime: 89, energy: 1, pulse: 1, voiceRingProgress: [0.3, 0.5, 0.8], voiceRingStrength: [1, 1, 1] }),
        render({ motion: 0, time: 0, materialTime: 0, energy: 0, pulse: 0 }),
      );
    });

    await t.test('non-listening states ignore stale speech rings', () => {
      assert.deepEqual(
        render({ listening: 0, voiceRingProgress: [0.3, 0.5, 0.8], voiceRingStrength: [1, 1, 1] }),
        render({ listening: 0 }),
      );
    });

    await t.test('speech ring expands, fades, and disappears without reaching the canvas edge', () => {
      const baseline = render({ energy: 0, pulse: 0 });
      const ringMetrics = (progress: number) => {
        const pixels = render({ energy: 0, pulse: 0, voiceRingProgress: [progress, 1, 1], voiceRingStrength: [1, 0, 0] });
        let weight = 0; let weightedRadius = 0; let peak = 0;
        for (let y = 0; y < size; y += 1) {
          for (let x = 0; x < size; x += 1) {
            const offset = (y * size + x) * 4 + 3;
            const extra = Math.max(0, pixels[offset] - baseline[offset]);
            const radius = Math.hypot(x + 0.5 - size / 2, y + 0.5 - size / 2) / size;
            weight += extra; weightedRadius += radius * extra; peak = Math.max(peak, extra);
            if (x === 0 || y === 0 || x === size - 1 || y === size - 1) assert.ok(extra <= 1, 'ring fades before frame edge');
          }
        }
        return { pixels, radius: weightedRadius / Math.max(weight, 1), peak };
      };
      const early = ringMetrics(0.35);
      const late = ringMetrics(0.75);
      assert.ok(early.peak > 20, 'ripple is visible outside the orb');
      assert.ok(late.radius > early.radius + 0.02, 'ripple travels outward');
      assert.ok(late.peak < early.peak, 'ripple fades as it travels');
      assert.deepEqual(ringMetrics(1).pixels, baseline, 'expired ripple disappears');
    });
  } finally {
    dispose();
  }
});
