/* Sprout AI blob for the web: a WebGL port of the approved React Native Skia
   renderer on branch codex/ai-blob-handover
   (08 - Generated Screens/AI Companion/native/src/companion/).

   Ported 1:1, not re-imagined:
   - blob3dShader.ts  → FRAGMENT below (SkSL → GLSL ES 1.0; the maths is unchanged)
   - AICompanionBlob.tsx state looks (listening / processing / saturation / opacity / speed)
     and its two clocks (rotation × speed, material × (0.65 + speed × 0.35))
   - voicePulse.ts and voiceRipples.ts (onset pulse and the three fading speech rings)
   - model.ts previewEnergy(), the deterministic speech envelope the native prototype
     uses in State preview. The web never touches a microphone.

   Size: the sphere is 0.8 of the canvas, and the halo and rings reach 0.49, so a
   canvas of S px shows a ball of 0.8 × S. Reduced motion renders one still frame.
   Without WebGL the caller keeps its fallback image. */
(function () {
  const VERTEX = `attribute vec2 a;void main(){gl_Position=vec4(a,0.0,1.0);}`;
  const FRAGMENT = `
precision highp float;
uniform sampler2D material;
uniform float size;
uniform float time;
uniform float materialTime;
uniform float energy;
uniform float pulse;
uniform float listening;
uniform float processing;
uniform float motion;
uniform float saturation;
uniform float opacity;
uniform float success;
uniform float successProgress;
uniform float press;
uniform vec3 voiceRingProgress;
uniform vec3 voiceRingStrength;

vec3 rotateObject(vec3 p, float yaw, float pitch) {
  float cy = cos(yaw); float sy = sin(yaw); float cx = cos(pitch); float sx = sin(pitch);
  vec3 q = vec3(cy * p.x + sy * p.z, p.y, -sy * p.x + cy * p.z);
  return vec3(q.x, cx * q.y - sx * q.z, sx * q.y + cx * q.z);
}
vec3 sampleMaterial(vec2 p) {
  vec2 uv = vec2(0.496, 0.482) + p * 0.398;
  vec4 texel = texture2D(material, uv);
  return mix(vec3(0.20, 0.58, 0.39), texel.rgb, smoothstep(0.6, 0.95, texel.a));
}
vec3 flowMaterialPoint(vec3 p, float t, float amount) {
  vec3 current = vec3(
    sin(p.y * 2.8 + p.z * 1.7 + t * 0.61),
    sin(p.z * 2.6 - p.x * 1.6 - t * 0.47 + 2.1),
    sin(p.x * 2.4 + p.y * 1.8 + t * 0.39 + 4.2));
  vec3 tangent = current - p * dot(current, p);
  vec3 q = normalize(p + tangent * 0.23 * amount);
  vec3 eddy = vec3(
    sin(q.z * 3.7 - q.y * 1.3 - t * 0.29 + 1.4),
    sin(q.x * 3.2 + q.z * 1.5 + t * 0.37 + 3.7),
    sin(q.y * 3.4 - q.x * 1.2 - t * 0.23));
  return normalize(q + (eddy - q * dot(eddy, q)) * 0.075 * amount);
}
vec3 objectMaterial(vec3 p, float flowTime, float flowAmount) {
  vec3 flowing = flowMaterialPoint(p, flowTime, flowAmount);
  float bend = 0.045 * (1.0 - flowing.z * flowing.z);
  vec2 uv = flowing.xy + vec2(flowing.z * flowing.y, -flowing.z * flowing.x) * bend;
  return sampleMaterial(uv * 0.985);
}
float speechRing(float r, float progress, float strength) {
  float age = clamp(progress, 0.0, 1.0);
  float radius = mix(0.376, 0.490, age);
  float width = mix(0.0058, 0.0085, age);
  float d = (r - radius) / width;
  float envelope = smoothstep(0.0, 0.12, age) * (1.0 - smoothstep(0.32, 1.0, age));
  return exp(-d * d) * envelope * clamp(strength, 0.0, 1.0) * 0.30;
}
void main() {
  vec2 position = vec2(gl_FragCoord.x, size - gl_FragCoord.y);
  vec2 p = (position - vec2(size * 0.5)) / size;
  float r = length(p);
  float voice = clamp(energy, 0.0, 1.0) * listening * motion;
  float beat = clamp(pulse, 0.0, 1.0) * listening * motion;
  float release = sin(successProgress * 3.141593) * success * motion;
  float radius = 0.400 * (1.0 + voice * 0.011 + beat * 0.004);
  radius *= 1.0 - press * 0.016 * motion;
  float axis = voice * 0.0035 * sin(time * 1.7);
  vec2 stretch = vec2(1.0 + axis, 1.0 - axis);
  vec2 sphereXY = p / stretch;
  float radiusSquared = dot(sphereXY, sphereXY);
  float aa = 1.25 / max(size, 1.0);
  float alpha = 1.0 - smoothstep(radius - aa, radius + aa, length(sphereXY));
  float haloDistance = (r - radius) / 0.035;
  float halo = exp(-haloDistance * haloDistance * 1.7) * (0.016 + voice * 0.026 + beat * 0.018);
  float rings = speechRing(r, voiceRingProgress.x, voiceRingStrength.x)
              + speechRing(r, voiceRingProgress.y, voiceRingStrength.y)
              + speechRing(r, voiceRingProgress.z, voiceRingStrength.z);
  rings *= motion * listening;
  float finishDistance = (r - 0.376 - successProgress * 0.104) / 0.006;
  float finishRing = exp(-finishDistance * finishDistance) * release * 0.20;
  float behindAlpha = clamp(halo + rings + finishRing, 0.0, 0.65) * opacity;
  vec3 behind = vec3(0.25, 0.56, 0.34) * behindAlpha;
  if (alpha <= 0.0) { gl_FragColor = vec4(behind, behindAlpha); return; }
  float z = sqrt(max(radius * radius - radiusSquared, 0.000001));
  vec3 hit = vec3(sphereXY, z);
  vec3 normal = normalize(vec3(sphereXY / stretch, z));
  vec3 ray = vec3(0.0, 0.0, -1.0);
  float yaw = time * 0.115 * motion;
  float pitch = sin(time * 0.045) * 0.12 * motion;
  vec3 objectPoint = rotateObject(normalize(hit), yaw, pitch);
  float flowTime = materialTime * motion;
  float flowAmount = motion;
  vec3 color = objectMaterial(objectPoint, flowTime, flowAmount);
  vec3 through = refract(ray, normal, 1.0 / 1.42);
  float chord = max(-2.0 * dot(hit, through), 0.0);
  vec3 backHit = normalize(hit + through * chord);
  vec3 backPoint = rotateObject(backHit, yaw, pitch);
  vec3 interior = objectMaterial(backPoint, flowTime, flowAmount);
  float facing = clamp(dot(normal, -ray), 0.0, 1.0);
  float fresnel = 0.035 + 0.965 * pow(1.0 - facing, 4.0);
  float transmission = 0.075 * (1.0 - fresnel);
  color = mix(color, interior, transmission);
  color *= 1.0 - (chord / (2.0 * radius)) * 0.035;
  vec3 light = normalize(vec3(-0.48, -0.63, 1.15));
  vec3 halfDirection = normalize(light - ray);
  float highlight = pow(max(dot(normal, halfDirection), 0.0), 70.0);
  float rim = pow(1.0 - facing, 3.2);
  float rimLight = 0.65 + 0.35 * dot(normal, light);
  color = mix(color, vec3(0.91, 0.99, 0.87), highlight * 0.12);
  color = mix(color, vec3(0.08, 0.40, 0.29), rim * 0.23);
  color += vec3(0.54, 0.79, 0.57) * rim * rimLight * 0.11;
  color += release * 0.018;
  float luminance = dot(color, vec3(0.2126, 0.7152, 0.0722));
  color = clamp(mix(vec3(luminance), color, saturation), 0.0, 1.0);
  alpha *= opacity;
  gl_FragColor = vec4(color * alpha + behind * (1.0 - alpha), alpha + behindAlpha * (1.0 - alpha));
}`;

  // AICompanionBlob.tsx → stateLooks, copied as-is
  const LOOKS = {
    idle: { listening: 0, processing: 0, saturation: 1, opacity: 1, speed: 0.72 },
    listeningQuiet: { listening: 1, processing: 0, saturation: 1, opacity: 1, speed: 0.86 },
    listeningActive: { listening: 1, processing: 0, saturation: 1, opacity: 1, speed: 1 },
    processing: { listening: 0, processing: 1, saturation: 0.96, opacity: 1, speed: 1.38 },
    success: { listening: 0, processing: 0, saturation: 1, opacity: 1, speed: 0.72 },
  };

  // model.ts previewEnergy(): the deterministic speech envelope for preview only
  function previewEnergy(seconds) {
    const phrase = seconds % 7.4;
    if (phrase > 5.6 || phrase < 0.35) return 0.015;
    const syllables = Math.pow(Math.max(0, Math.sin(seconds * 8.4)), 2);
    const cadence = 0.42 + 0.23 * Math.sin(seconds * 2.1);
    return Math.min(1, 0.1 + syllables * cadence + 0.12 * Math.max(0, Math.sin(seconds * 13.7)));
  }
  // voicePulse.ts
  function stepVoicePulse(level, baseline, pulse, ms) {
    const nextBaseline = level + (baseline - level) * Math.exp(-ms / 160);
    const onset = level >= 0.08 ? Math.min(1, Math.max(0, level - nextBaseline - 0.018) * 4.5) : 0;
    return { baseline: nextBaseline, pulse: Math.max(onset, pulse * Math.exp(-ms / 160)) };
  }
  // voiceRipples.ts (lifespan 900 ms, cooldown 300 ms, three rings)
  const LIFE = 900, COOL = 300;
  function stepVoiceRipples(s, pulse, energy, ms) {
    const delta = Math.min(Math.max(ms, 0), LIFE);
    const next = { ages: [LIFE, LIFE, LIFE], str: [0, 0, 0], cool: Math.max(0, s.cool - delta), prev: delta > 0 ? pulse : s.prev };
    let oldest = 0;
    for (let i = 0; i < 3; i++) {
      next.ages[i] = Math.min(LIFE, s.ages[i] + delta);
      next.str[i] = next.ages[i] < LIFE ? s.str[i] : 0;
      if (next.ages[i] > next.ages[oldest]) oldest = i;
    }
    const rise = delta > 0 ? ((pulse - s.prev) * (1000 / 60)) / delta : 0;
    if (delta > 0 && next.cool === 0 && energy >= 0.08 && pulse >= 0.18 && rise > 0.02) {
      next.ages[oldest] = 0;
      next.str[oldest] = 0.35 + 0.65 * pulse;
      next.cool = COOL;
    }
    return next;
  }
  const freshRipples = () => ({ ages: [LIFE, LIFE, LIFE], str: [0, 0, 0], cool: 0, prev: 0 });

  function create(canvas, materialSrc) {
    const gl = canvas.getContext("webgl", { premultipliedAlpha: true, alpha: true, antialias: false });
    if (!gl) return null;
    const sh = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
      return s;
    };
    const prog = gl.createProgram();
    try {
      gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERTEX));
      gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAGMENT));
    } catch (e) {
      console.warn("ai-blob: shader failed", e);
      return null;
    }
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "a");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = {};
    ["size", "time", "materialTime", "energy", "pulse", "listening", "processing", "motion", "saturation", "opacity", "success", "successProgress", "press", "voiceRingProgress", "voiceRingStrength", "material"].forEach((n) => (U[n] = gl.getUniformLocation(prog, n)));

    const tex = gl.createTexture();
    let ready = false;
    const img = new Image();
    img.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      ready = true;
      canvas.dataset.ready = "1";
      draw();
    };
    img.src = materialSrc;

    const reduce = matchMedia("(prefers-reduced-motion: reduce)");
    let state = "idle", look = { ...LOOKS.idle }, target = LOOKS.idle;
    let clock = 0, materialClock = 0, voiceClock = 0, baseline = 0, pulse = 0, ripples = freshRipples();
    let successProgress = 0, success = 0;
    let running = false, last = 0, raf = 0;

    function resize() {
      const css = canvas.clientWidth || 60;
      const px = Math.max(48, Math.round(css * Math.min(devicePixelRatio || 1, 3)));
      if (canvas.width !== px) { canvas.width = px; canvas.height = px; }
      gl.viewport(0, 0, px, px);
    }
    function draw() {
      if (!ready) return;
      resize();
      const motion = reduce.matches || look.speed <= 0 ? 0 : 1;
      const energy = motion && target.listening > 0 ? previewEnergy(voiceClock) : 0;
      gl.uniform1f(U.size, canvas.width);
      gl.uniform1f(U.time, motion ? clock : 0);
      gl.uniform1f(U.materialTime, motion ? materialClock : 0);
      gl.uniform1f(U.energy, energy);
      gl.uniform1f(U.pulse, motion && target.listening > 0 ? pulse : 0);
      gl.uniform1f(U.listening, look.listening);
      gl.uniform1f(U.processing, look.processing);
      gl.uniform1f(U.motion, motion);
      gl.uniform1f(U.saturation, look.saturation);
      gl.uniform1f(U.opacity, look.opacity);
      gl.uniform1f(U.success, success);
      gl.uniform1f(U.successProgress, successProgress);
      gl.uniform1f(U.press, 0);
      gl.uniform3f(U.voiceRingProgress, ripples.ages[0] / LIFE, ripples.ages[1] / LIFE, ripples.ages[2] / LIFE);
      gl.uniform3f(U.voiceRingStrength, ripples.str[0], ripples.str[1], ripples.str[2]);
      gl.uniform1i(U.material, 0);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
    function frame(now) {
      if (!running) return;
      const ms = Math.min(now - (last || now), 32);
      last = now;
      const dt = ms / 1000;
      // withTiming toward the state's look (about 420 ms, like the native config)
      const k = 1 - Math.exp(-ms / 140);
      for (const key of Object.keys(look)) look[key] += (target[key] - look[key]) * k;
      success += ((state === "success" ? 1 : 0) - success) * k;
      if (state === "success" && successProgress < 1) successProgress = Math.min(1, successProgress + ms / 1100);
      clock += dt * look.speed;
      materialClock += dt * (0.65 + look.speed * 0.35);
      if (target.listening > 0) {
        voiceClock += dt;
        const e = previewEnergy(voiceClock);
        const next = stepVoicePulse(e, baseline, pulse, ms);
        baseline = next.baseline;
        pulse = next.pulse;
        ripples = stepVoiceRipples(ripples, pulse, e, ms);
      } else {
        baseline = 0; pulse = 0; ripples = freshRipples();
      }
      draw();
      raf = requestAnimationFrame(frame);
    }
    return {
      setState(next) {
        if (!LOOKS[next]) return;
        state = next;
        target = LOOKS[next];
        if (next === "success") successProgress = 0;
        if (reduce.matches) { look = { ...target }; draw(); }
      },
      play() {
        if (running || reduce.matches) { draw(); return; }
        running = true; last = 0; raf = requestAnimationFrame(frame);
      },
      pause() { running = false; cancelAnimationFrame(raf); },
      draw,
    };
  }

  window.SproutAIBlob = { create };
})();
