const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { parseArgs } = require('node:util');
const CanvasKitInit = require('canvaskit-wasm/bin/full/canvaskit.js');

const root = path.resolve(__dirname, '..');
const { values: options, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    animate: { type: 'boolean', default: false },
    rotate: { type: 'boolean', default: false },
    'sheet-only': { type: 'boolean', default: false },
    seconds: { type: 'string', default: '8' },
    fps: { type: 'string', default: '30' },
    size: { type: 'string', default: '192' },
  },
});
const seconds = Number(options.seconds);
const fps = Number(options.fps);
const animationSize = Number(options.size);
const idleRotationRate = 0.72;
const idleMaterialRate = 0.65 + idleRotationRate * 0.35;
assert.ok(!options['sheet-only'] || positionals[0], '--sheet-only requires an existing fixture directory');
assert.ok(seconds > 0 && seconds <= 30, '--seconds must be between 0 and 30');
assert.ok(Number.isInteger(fps) && fps > 0 && fps <= 60, '--fps must be an integer from 1 to 60');
assert.ok(Number.isInteger(animationSize) && animationSize >= 64 && animationSize <= 350 && animationSize % 2 === 0,
  '--size must be an even integer from 64 to 350');
const output = positionals[0] || fs.mkdtempSync(path.join(os.tmpdir(), 'sprout-blob-3d-'));
fs.mkdirSync(output, { recursive: true });
const sourceFile = fs.readFileSync(path.join(root, 'src/companion/blob3dShader.ts'), 'utf8');
const source = sourceFile.match(/BLOB_3D_SHADER_SOURCE = `([\s\S]*?)`;/)?.[1];
assert.ok(source, 'SkSL source must be exported');

async function main() {
  const kit = await CanvasKitInit({
    locateFile: (file) => require.resolve(`canvaskit-wasm/bin/full/${file}`),
  });
  const errors = [];
  const effect = kit.RuntimeEffect.Make(source, (error) => errors.push(error));
  assert.ok(effect, errors.join('\n'));
  const size = 350;
  const material = kit.MakeImageFromEncoded(fs.readFileSync(path.join(root, 'assets/sprout-ai-blob.png')));
  assert.ok(material, 'Approved material must decode');
  const materialShader = material.makeShaderOptions(
    kit.TileMode.Decal, kit.TileMode.Decal, kit.FilterMode.Linear, kit.MipmapMode.None,
    [size / material.width(), 0, 0, 0, size / material.height(), 0, 0, 0, 1],
  );
  const base = {
    size, time: 0, materialTime: 0, energy: 0, pulse: 0, listening: 0, processing: 0, motion: 1,
    saturation: 1, opacity: 1, success: 0, successProgress: 0, press: 0, idle: 1,
    voiceRingProgress: [0, 0, 0], voiceRingStrength: [0, 0, 0],
  };
  const fixtures = [
    ['idle-0', {}],
    ['idle-8', { time: 8 }],
    ['idle-18', { time: 18 }],
    ['idle-36', { time: 36 }],
    ['flow-0', { time: 0, materialTime: 0 }],
    ['flow-2', { time: 0, materialTime: 2 }],
    ['flow-4', { time: 0, materialTime: 4 }],
    ['flow-6', { time: 0, materialTime: 6 }],
    ['combined-2', { time: 2 * idleRotationRate, materialTime: 2 * idleMaterialRate }],
    ['combined-4', { time: 4 * idleRotationRate, materialTime: 4 * idleMaterialRate }],
    ['combined-6', { time: 6 * idleRotationRate, materialTime: 6 * idleMaterialRate }],
    ['voice-peak', { time: 8, energy: 1, pulse: 1, listening: 1, idle: 0,
      voiceRingProgress: [0.25, 0.49, 0.78], voiceRingStrength: [1, 0.9, 0.85] }],
    ['success', { time: 8, success: 1, successProgress: 0.5 }],
    ['reduced-0', { motion: 0, time: 0 }],
    ['reduced-peak', { motion: 0, time: 36, materialTime: 36, energy: 1, pulse: 1, listening: 1,
      voiceRingProgress: [0.25, 0.49, 0.78], voiceRingStrength: [1, 0.9, 0.85] }],
  ];
  const rendered = new Map();
  const uniformNames = Array.from({ length: effect.getUniformCount() }, (_, index) => effect.getUniformName(index));
  function draw(overrides, surface, renderSize) {
    const values = { ...base, ...overrides };
    const packed = [];
    for (const uniformName of uniformNames) {
      assert.ok(Object.hasOwn(values, uniformName), `Missing uniform: ${uniformName}`);
      packed.push(...[values[uniformName]].flat());
    }
    const shader = effect.makeShaderWithChildren(packed, [materialShader]);
    const canvas = surface.getCanvas();
    canvas.clear(kit.Color(244, 241, 234, 1));
    const paint = new kit.Paint();
    paint.setShader(shader);
    canvas.save();
    canvas.scale(renderSize / size, renderSize / size);
    canvas.drawPaint(paint);
    canvas.restore();
    surface.flush();
    const snapshot = surface.makeImageSnapshot();
    const png = Buffer.from(snapshot.encodeToBytes());
    snapshot.delete();
    paint.delete();
    shader.delete();
    return png;
  }
  const fixtureSurface = kit.MakeSurface(size, size);
  assert.ok(fixtureSurface, 'Raster surface must be available');
  for (const [name, overrides] of fixtures) {
    const png = options['sheet-only']
      ? fs.readFileSync(path.join(output, `${name}.png`))
      : draw(overrides, fixtureSurface, size);
    rendered.set(name, png);
    fs.writeFileSync(path.join(output, `${name}.png`), png);
  }
  fixtureSurface.dispose();
  assert.notDeepEqual(rendered.get('idle-0'), rendered.get('idle-8'), '3D idle rotation must change the image');
  assert.notDeepEqual(rendered.get('flow-0'), rendered.get('flow-2'), 'Internal flow must change with rotation held fixed');
  assert.notDeepEqual(rendered.get('flow-2'), rendered.get('flow-6'), 'Internal flow must continue over time');
  assert.deepEqual(rendered.get('reduced-0'), rendered.get('reduced-peak'), 'Reduced motion must freeze geometry, rotation, flow and rings');

  const cell = 224;
  const captionHeight = 32;
  const sheetSurface = kit.MakeSurface(cell * 4, cell + captionHeight);
  assert.ok(sheetSurface, 'Contact sheet surface must be available');
  const sheetCanvas = sheetSurface.getCanvas();
  sheetCanvas.clear(kit.Color(244, 241, 234, 1));
  const sheetPaint = new kit.Paint();
  sheetPaint.setColor(kit.Color(36, 64, 39, 1));
  sheetPaint.setAntiAlias(true);
  const typeface = kit.Typeface.MakeFreeTypeFaceFromData(fs.readFileSync(
    require.resolve('@expo-google-fonts/inter/400Regular/Inter_400Regular.ttf'),
  ));
  assert.ok(typeface, 'Installed Inter font must decode');
  const font = new kit.Font(typeface, 13);
  const sheetCells = [
    ['flow-0', 'Fixed rotation / flow phase 0'], ['flow-2', 'Fixed rotation / flow phase 2'],
    ['flow-4', 'Fixed rotation / flow phase 4'], ['flow-6', 'Fixed rotation / flow phase 6'],
  ];
  sheetCells.forEach(([name, caption], index) => {
    const x = (index % 4) * cell;
    const y = Math.floor(index / 4) * (cell + captionHeight);
    const image = kit.MakeImageFromEncoded(rendered.get(name));
    sheetCanvas.drawImageRect(image, kit.XYWHRect(0, 0, size, size), kit.XYWHRect(x, y, cell, cell), sheetPaint);
    sheetCanvas.drawText(caption, x + 12, y + cell + 18, sheetPaint, font);
    image.delete();
  });
  sheetSurface.flush();
  const sheetImage = sheetSurface.makeImageSnapshot();
  fs.writeFileSync(path.join(output, 'flow-contact-sheet.png'), Buffer.from(sheetImage.encodeToBytes()));
  sheetImage.delete();
  font.delete();
  typeface.delete();
  sheetPaint.delete();
  sheetSurface.dispose();
  console.log(`SkSL compiled. ${fixtures.length} fixtures ${options['sheet-only'] ? 'loaded' : 'rendered'}. Independent flow and reduced-motion equality verified.\n${output}`);

  if (options.animate) {
    const frameCount = Math.round(seconds * fps);
    const animationSurface = kit.MakeSurface(animationSize, animationSize);
    assert.ok(animationSurface, 'Animation surface must be available');
    const sequences = options.rotate ? ['flow-only', 'flow-rotating'] : ['flow-only'];
    for (const sequence of sequences) {
      const framesDirectory = path.join(output, `${sequence}-frames`);
      fs.mkdirSync(framesDirectory, { recursive: true });
      for (let frame = 0; frame < frameCount; frame += 1) {
        const elapsed = frame / fps;
        const png = draw({
          time: sequence === 'flow-only' ? 0 : elapsed * idleRotationRate,
          materialTime: sequence === 'flow-only' ? elapsed : elapsed * idleMaterialRate,
        }, animationSurface, animationSize);
        fs.writeFileSync(path.join(framesDirectory, `${String(frame).padStart(4, '0')}.png`), png);
        if (frame % fps === 0) console.log(`${sequence}: rendered ${frame}/${frameCount} frames`);
      }
      const clip = path.join(output, `${sequence}.mp4`);
      const encoded = spawnSync('ffmpeg', [
        '-hide_banner', '-loglevel', 'error', '-y', '-framerate', String(fps),
        '-i', path.join(framesDirectory, '%04d.png'), '-c:v', 'libx264', '-crf', '17',
        '-pix_fmt', 'yuv420p', '-movflags', '+faststart', clip,
      ], { encoding: 'utf8' });
      if (encoded.error?.code === 'ENOENT') {
        console.warn(`ffmpeg unavailable; inspect PNG frames at ${framesDirectory}`);
      } else {
        assert.equal(encoded.status, 0, encoded.stderr || String(encoded.error));
        console.log(`${clip} (${frameCount} frames at ${fps} fps)`);
      }
    }
    animationSurface.dispose();
  }
  materialShader.delete();
  material.delete();
  effect.delete();
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
