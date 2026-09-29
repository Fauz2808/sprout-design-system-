/*
 * (Film copy of 01 - Website/sprout-reach-scene-iteration/thinking-orb.js with
 *  drawAt() and a pixelScale option added for frame-exact rendering.)
 * Sprout's vanilla-canvas adapter for RareFormLabs/thinking-orbs.
 * Source: https://github.com/RareFormLabs/thinking-orbs (v0.1.1)
 *
 * This keeps the repository's exact 64 px `working`, `listening` and
 * `composing` geometry and presets, with its grayscale ink mapped onto Sprout's official
 * green tokens. The original package is a Vue component; this small adapter
 * exposes the same canvas animation to this dependency-free prototype.
 * Copyright (c) 2026 Jakub Antalik. MIT license: vendor/THINKING-ORBS-LICENSE.
 */
(function () {
  "use strict";

  const LABELS = {
    working: "Working…",
    listening: "Listening…",
    composing: "Composing…",
  };

  const SPROUT_INK = [
    { at: 0, rgb: [30, 62, 43] },
    { at: 0.28, rgb: [24, 99, 56] },
    { at: 0.62, rgb: [87, 154, 116] },
    { at: 1, rgb: [226, 233, 227] },
  ];

  const STATE_ALIASES = {
    listeningActive: "listening",
    listeningQuiet: "listening",
    processing: "composing",
    working: "working",
    listening: "listening",
    composing: "composing",
  };

  const PROFILES = {
    // `orbits` mode, 64 px preset: speed 1.885, counts and radii at 1x
    working: {
      speed: 1.885,
      opts: {
        orbitN: 12,
        ghostN: 40,
        ghostR: 0.9,
        ghostA: 0.5,
        particles: 3,
        partR: 1.2,
        partRDepth: 1.6,
        rsPow: 0.6,
        rMin: 0.3,
      },
    },
    listening: {
      speed: 4.388,
      opts: {
        rings: 9,
        lonDensity: 23,
        rBase: 0.6,
        rDepth: 1.7,
        rsPow: 0.6,
        rMin: 0.3,
      },
    },
    composing: {
      speed: 2.34,
      opts: {
        lanes: 3,
        segs: 44,
        ghostN: 38,
        rBase: 0.935,
        rDepth: 1.445,
        rsPow: 0.6,
        rMin: 0.3,
        spin: 0,
        bandMul: 3.9,
        wobMul: 1,
      },
    },
  };

  function fibDir(i, n) {
    const golden = Math.PI * (3 - Math.sqrt(5));
    const y = 1 - (2 * (i + 0.5)) / n;
    const radius = Math.sqrt(1 - y * y);
    const angle = i * golden;
    return [radius * Math.cos(angle), y, radius * Math.sin(angle)];
  }

  function hashD(a, b) {
    const h = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453;
    return h - Math.floor(h);
  }

  function makeProj(yaw, tilt, cx, cy, scale) {
    const st = Math.sin(tilt);
    const ct = Math.cos(tilt);
    const sy = Math.sin(yaw);
    const cyw = Math.cos(yaw);
    return (x, y, z) => {
      const x1 = x * cyw + z * sy;
      const z1 = -x * sy + z * cyw;
      const y1 = y * ct - z1 * st;
      const z2 = y * st + z1 * ct;
      return [cx + x1 * scale, cy - y1 * scale, z2];
    };
  }

  function radiusScale(size, power) {
    return (size / 300) ** power;
  }

  function sproutInk(value) {
    const amount = Math.min(1, Math.max(0, value));
    const upperIndex = SPROUT_INK.findIndex((stop) => stop.at >= amount);
    if (upperIndex <= 0) return SPROUT_INK[0].rgb;
    const lower = SPROUT_INK[upperIndex - 1];
    const upper = SPROUT_INK[upperIndex];
    const mix = (amount - lower.at) / (upper.at - lower.at);
    return lower.rgb.map((channel, index) =>
      Math.round(channel + (upper.rgb[index] - channel) * mix),
    );
  }

  function paint(ctx, dots, dark, rMin = 0.3) {
    dots.sort((a, b) => a.z - b.z);
    for (const dot of dots) {
      const alpha = dot.a ?? 1;
      if (alpha < 0.02) continue;
      const white = Math.min(1, Math.max(0, dot.white));
      const [red, green, blue] = sproutInk(dark ? 1 - white : white);
      ctx.fillStyle = `rgba(${red},${green},${blue},${alpha})`;
      ctx.beginPath();
      ctx.arc(dot.x, dot.y, Math.max(rMin, dot.r), 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawListening(ctx, size, time, dark, options) {
    const cx = size / 2;
    const cy = size / 2;
    const radius = (size / 2) * 0.874;
    const project = makeProj(time * 0.18, 0.38, cx, cy, 1);
    const radiusMultiplier = radiusScale(size, options.rsPow ?? 0.6);
    const dots = [];

    for (let ring = 0; ring <= options.rings; ring += 1) {
      const latitude = -Math.PI / 2 + (ring / options.rings) * Math.PI;
      const cosLatitude = Math.cos(latitude);
      const sinLatitude = Math.sin(latitude);
      const wave =
        0.62 * Math.sin(time * 2.1 - ring * 0.52) +
        0.38 * Math.sin(time * 1.27 + ring * 0.83);
      const ringRadius = radius * (0.88 + 0.105 * wave);
      const longitudeCount = Math.max(
        1,
        Math.round(Math.abs(cosLatitude) * options.lonDensity),
      );

      for (let longitudeIndex = 0; longitudeIndex < longitudeCount; longitudeIndex += 1) {
        const longitude = (longitudeIndex / longitudeCount) * 2 * Math.PI;
        const [x, y, z] = project(
          cosLatitude * Math.cos(longitude) * ringRadius,
          sinLatitude * ringRadius,
          cosLatitude * Math.sin(longitude) * ringRadius,
        );
        const depth = (z / radius + 1) / 2;
        const crest = Math.max(0, wave);
        dots.push({
          x,
          y,
          z,
          r:
            ((options.rBase ?? 0.6) + (options.rDepth ?? 1.7) * depth) *
            (1 + 0.4 * crest) *
            radiusMultiplier,
          white: 0.66 - 0.56 * depth - 0.1 * crest,
        });
      }
    }
    paint(ctx, dots, dark, options.rMin);
  }

  // particles on tilted orbits, each with a faint ghost path (upstream engine/orbits.ts)
  function drawWorking(ctx, size, time, dark, options) {
    const cx = size / 2;
    const cy = size / 2;
    const radius = (size / 2) * 0.82;
    const project = makeProj(time * 0.12, 0.3, cx, cy, 1);
    const radiusMultiplier = radiusScale(size, options.rsPow ?? 0.6);
    const dots = [];

    for (let orbit = 0; orbit < options.orbitN; orbit += 1) {
      const h1 = hashD(orbit, 1.7);
      const h2 = hashD(orbit, 5.2);
      const h3 = hashD(orbit, 8.9);
      const orbitRadius = radius * (0.45 + 0.52 * h1);
      const theta = h1 * 2 * Math.PI;
      const phi = Math.acos(2 * h2 - 1);
      const nx = Math.sin(phi) * Math.cos(theta);
      const ny = Math.cos(phi);
      const nz = Math.sin(phi) * Math.sin(theta);
      let ux = -ny;
      let uy = nx;
      const uz = 0;
      const length = Math.max(1e-6, Math.sqrt(ux * ux + uy * uy));
      ux /= length;
      uy /= length;
      const vx = ny * uz - nz * uy;
      const vy = nz * ux - nx * uz;
      const vz = nx * uy - ny * ux;
      const speed = (0.25 + 0.55 * h3) * (h3 > 0.5 ? 1 : -1);
      const at = (angle) => project(
        (ux * Math.cos(angle) + vx * Math.sin(angle)) * orbitRadius,
        (uy * Math.cos(angle) + vy * Math.sin(angle)) * orbitRadius,
        (uz * Math.cos(angle) + vz * Math.sin(angle)) * orbitRadius,
      );

      for (let k = 0; k < options.ghostN; k += 1) {
        const [x, y, z] = at((k / options.ghostN) * 2 * Math.PI);
        const depth = (z / orbitRadius + 1) / 2;
        dots.push({ x, y, z, r: options.ghostR * radiusMultiplier, white: 0.72, a: options.ghostA * (0.4 + 0.6 * depth) });
      }
      for (let m = 0; m < options.particles; m += 1) {
        const [x, y, z] = at(time * speed + (m / options.particles) * 2 * Math.PI + h2 * 6);
        const depth = (z / orbitRadius + 1) / 2;
        dots.push({ x, y, z, r: (options.partR + options.partRDepth * depth) * radiusMultiplier, white: 0.3 - 0.22 * depth });
      }
    }
    paint(ctx, dots, dark, options.rMin);
  }

  function drawComposing(ctx, size, time, dark, options) {
    const cx = size / 2;
    const cy = size / 2;
    const radius = (size / 2) * 0.78;
    const spin = options.spin ?? 1;
    const project = makeProj(time * 0.1 * spin, 0.3, cx, cy, 1);
    const radiusMultiplier = radiusScale(size, options.rsPow ?? 0.6);
    const dots = [];

    for (let i = 0; i < options.ghostN; i += 1) {
      const direction = fibDir(i, options.ghostN);
      const [x, y, z] = project(
        direction[0] * radius,
        direction[1] * radius,
        direction[2] * radius,
      );
      const depth = (z / radius + 1) / 2;
      dots.push({
        x,
        y,
        z,
        r: 0.8 * radiusMultiplier,
        white: 0.78,
        a: 0.1 + 0.22 * depth,
      });
    }

    const yaw = time * 0.24 * spin;
    const tilt = 0.55 + 0.3 * Math.sin(time * 0.18) * spin;
    const ux = Math.cos(yaw);
    const uy = 0;
    const uz = Math.sin(yaw);
    const vx = -uz * Math.sin(tilt);
    const vy = Math.cos(tilt);
    const vz = ux * Math.sin(tilt);
    const nx = uy * vz - uz * vy;
    const ny = uz * vx - ux * vz;
    const nz = ux * vy - uy * vx;
    const lanes = Math.max(1, Math.round(options.lanes * options.bandMul));

    for (let lane = 0; lane < lanes; lane += 1) {
      const laneOffset = (lane - (lanes - 1) / 2) * 0.075;
      const edge =
        Math.abs(lane - (lanes - 1) / 2) / Math.max(1, (lanes - 1) / 2);
      for (let segment = 0; segment < options.segs; segment += 1) {
        const angle = (segment / options.segs) * 2 * Math.PI;
        const wobble =
          (0.16 * Math.sin(angle * 3 - time * 1.7 + lane * 0.22) +
            0.07 * Math.sin(angle * 5 + time * 1.1)) *
          options.wobMul;
        const offset = laneOffset + wobble;
        const x = ux * Math.cos(angle) + vx * Math.sin(angle) + nx * offset;
        const y = uy * Math.cos(angle) + vy * Math.sin(angle) + ny * offset;
        const z = uz * Math.cos(angle) + vz * Math.sin(angle) + nz * offset;
        const length = Math.sqrt(x * x + y * y + z * z);
        const [projectedX, projectedY, projectedZ] = project(
          (x / length) * radius,
          (y / length) * radius,
          (z / length) * radius,
        );
        const depth = (projectedZ / radius + 1) / 2;
        dots.push({
          x: projectedX,
          y: projectedY,
          z: projectedZ,
          r:
            ((options.rBase ?? 1.1) + (options.rDepth ?? 1.7) * depth) *
            (1 - 0.25 * edge) *
            radiusMultiplier,
          white: 0.52 - 0.44 * depth + 0.18 * edge,
          a: 0.4 + 0.6 * depth,
        });
      }
    }
    paint(ctx, dots, dark, options.rMin);
  }

  function create(canvas, config = {}) {
    const context = canvas?.getContext("2d");
    if (!context) return null;

    const size = 64;
    const dpr = (config.pixelScale || 1) * Math.min(2, window.devicePixelRatio || 1);
    const dark = config.theme === "dark";
    const speedMultiplier = Number.isFinite(config.speed) ? config.speed : 1;
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
    let state = STATE_ALIASES[config.state] || "listening";
    let wantsToPlay = false;
    let isVisible = true;
    let animationFrame = 0;

    canvas.width = Math.round(size * dpr);
    canvas.height = Math.round(size * dpr);
    canvas.setAttribute("role", "img");
    canvas.setAttribute("aria-label", LABELS[state]);

    function draw(timeSeconds) {
      const profile = PROFILES[state];
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.clearRect(0, 0, size, size);
      const time = timeSeconds * profile.speed * speedMultiplier;
      if (state === "working") {
        drawWorking(context, size, time, dark, profile.opts);
      } else if (state === "composing") {
        drawComposing(context, size, time, dark, profile.opts);
      } else {
        drawListening(context, size, time, dark, profile.opts);
      }
      canvas.dataset.ready = "1";
    }

    function stop() {
      cancelAnimationFrame(animationFrame);
      animationFrame = 0;
    }

    function loop(now) {
      draw(now / 1000);
      if (wantsToPlay && isVisible && !reducedMotion.matches) {
        animationFrame = requestAnimationFrame(loop);
      } else {
        animationFrame = 0;
      }
    }

    function start() {
      if (animationFrame || !wantsToPlay || !isVisible) return;
      if (reducedMotion.matches) {
        draw(0.6);
        return;
      }
      animationFrame = requestAnimationFrame(loop);
    }

    const visibilityObserver =
      typeof IntersectionObserver === "undefined"
        ? null
        : new IntersectionObserver(([entry]) => {
            isVisible = entry.isIntersecting;
            if (isVisible && document.visibilityState !== "hidden") start();
            else stop();
          });
    visibilityObserver?.observe(canvas);

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") stop();
      else start();
    });
    reducedMotion.addEventListener("change", () => {
      stop();
      draw(0.6);
      start();
    });

    draw(reducedMotion.matches ? 0.6 : performance.now() / 1000);

    return {
      setState(nextState) {
        const resolved = STATE_ALIASES[nextState];
        if (!resolved || resolved === state) return;
        state = resolved;
        canvas.setAttribute("aria-label", LABELS[state]);
        draw(reducedMotion.matches ? 0.6 : performance.now() / 1000);
      },
      play() {
        wantsToPlay = true;
        start();
      },
      pause() {
        wantsToPlay = false;
        stop();
      },
      draw() {
        draw(reducedMotion.matches ? 0.6 : performance.now() / 1000);
      },
      // film: draw one exact moment, so every rendered frame is reproducible
      drawAt(seconds) {
        draw(seconds);
      },
    };
  }

  window.SproutThinkingOrb = { create };
})();
