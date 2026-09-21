import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createShaderHarness } from './helpers/renderShader';

test('the retained 2.5D material shader renders safely', async (t) => {
  const size = 256;
  const { render, dispose } = await createShaderHarness(new URL('../src/companion/blobShader.ts', import.meta.url), 'BLOB_SHADER_SOURCE', size);

  try {
    await t.test('voice pulse grows the orb modestly without clipping its silhouette', () => {
      const baseline = render({ pulse: 0 });
      const peak = render({ pulse: 1 });
      const opaqueArea = (pixels: Uint8Array) => {
        let area = 0;
        for (let offset = 3; offset < pixels.length; offset += 4) if (pixels[offset] > 128) area += 1;
        return area;
      };
      const area = opaqueArea(baseline);
      const ratio = opaqueArea(peak) / area;
      assert.ok(area > size * size * 0.2, 'approved material is visible');
      assert.ok(ratio > 1.01 && ratio < 1.08, `restrained pulse area ratio: ${ratio}`);
      for (let point = 0; point < size; point += 1) {
        for (const [x, y] of [[point, 0], [point, size - 1], [0, point], [size - 1, point]]) {
          assert.ok(peak[(y * size + x) * 4 + 3] < 128, 'silhouette remains inside canvas');
        }
      }
    });
    await t.test('reduced motion removes the pulse entirely', () => {
      assert.deepEqual(render({ motion: 0, pulse: 1 }), render({ motion: 0, pulse: 0 }));
    });
    await t.test('non-listening states ignore residual pulse', () => {
      assert.deepEqual(render({ listening: 0, pulse: 1 }), render({ listening: 0, pulse: 0 }));
    });
  } finally {
    dispose();
  }
});
