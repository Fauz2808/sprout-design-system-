import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import CanvasKitInit from 'canvaskit-wasm';

export type UniformValues = Record<string, number | number[]>;

export async function createShaderHarness(file: URL, symbol: string, size = 256) {
  const kit = await CanvasKitInit();
  const source = readFileSync(file, 'utf8');
  const shaderSource = source.match(new RegExp(symbol + ' = `([\\s\\S]*?)`;'))?.[1];
  assert.ok(shaderSource, 'read the exact runtime shader, not a test copy');
  const effect = kit.RuntimeEffect.Make(shaderSource);
  assert.ok(effect, 'shader compiles');
  const image = kit.MakeImageFromEncoded(readFileSync(new URL('../../assets/sprout-ai-blob.png', file)));
  assert.ok(image);
  const material = image.makeShaderOptions(kit.TileMode.Decal, kit.TileMode.Decal,
    kit.FilterMode.Linear, kit.MipmapMode.None,
    [size / image.width(), 0, 0, 0, size / image.height(), 0, 0, 0, 1]);

  return {
    render(changes: UniformValues) {
      const values: UniformValues = { size, time: 1.2, materialTime: 0, energy: 0.65, pulse: 0, idle: 0,
        listening: 1, processing: 0, motion: 1, saturation: 1, opacity: 1,
        success: 0, successProgress: 0, press: 0,
        voiceRingProgress: [1, 1, 1], voiceRingStrength: [0, 0, 0], ...changes };
      const uniforms = new Float32Array(effect.getUniformFloatCount());
      for (let index = 0; index < effect.getUniformCount(); index += 1) {
        const name = effect.getUniformName(index);
        assert.ok(name in values, `uniform ${name} has a value`);
        const value = values[name];
        uniforms.set(typeof value === 'number' ? [value] : value, effect.getUniform(index).slot);
      }
      const surface = kit.MakeSurface(size, size);
      assert.ok(surface);
      const shader = effect.makeShaderWithChildren(uniforms, [material]);
      const paint = new kit.Paint();
      paint.setShader(shader);
      surface.getCanvas().clear(kit.TRANSPARENT);
      surface.getCanvas().drawPaint(paint);
      surface.flush();
      const snapshot = surface.makeImageSnapshot();
      const pixels = snapshot.readPixels(0, 0, { width: size, height: size,
        colorType: kit.ColorType.RGBA_8888, alphaType: kit.AlphaType.Unpremul,
        colorSpace: kit.ColorSpace.SRGB });
      assert.ok(pixels instanceof Uint8Array);
      const copy = Uint8Array.from(pixels);
      snapshot.delete(); paint.delete(); shader.delete(); surface.delete();
      return copy;
    },
    dispose() { material.delete(); image.delete(); effect.delete(); },
  };
}
