/* Shared by assist.html and home-v2.html (moved out of assist-landing.js, 7 Oct). Three jobs, each only runs
   when its markup is on the page: 7 the sky video hero, 8 the live mascot ([data-live]), 9 the portal (#portal).
   Expects the top bar as #top. */
(function () {
  "use strict";
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* 7 · the sky hero: Cove's Open Sky loop (assets/sky/SOURCE.md), shown without its table and laptop.
     Ahmad, 6 Oct: "we don't need the table and laptop". Until a clean loop exists, only clean pixels are shown:
     - wide screens: the sky and horizon above row 505 (the laptop's bezel starts at about 512), zoomed to fill;
     - narrow screens: the left 360 px of the frame, clean from top to bottom (the table starts at x = 366).
     The video starts after load, fades in when really playing (Cove's 900 ms), and pauses off screen. */
  const skyBox = document.getElementById("sky");
  if (skyBox) {
    const still = document.getElementById("skyStill"), loop = document.getElementById("skyLoop");
    const top = document.getElementById("top");
    const W = 1920, H = 1080, CLEAN_ROWS = 505, CLEAN_COLS = 360;
    loop.innerHTML = `<source src="./assets/sky/hero-loop-desktop.av1.mp4" type='video/mp4; codecs="av01.0.08M.08"'><source src="./assets/sky/hero-loop-desktop.h264.mp4" type="video/mp4">`;
    function fit() {
      const w = skyBox.clientWidth, h = skyBox.clientHeight;
      let s, left, topPx;
      if (w / h < 0.8) { s = Math.max(w / CLEAN_COLS, h / H); left = 0; topPx = (h - H * s) / 2; }
      else { s = Math.max(w / W, h / CLEAN_ROWS); left = (w - W * s) / 2; topPx = 0; }
      for (const el of [still, loop]) Object.assign(el.style, { width: W * s + "px", height: H * s + "px", left: left + "px", top: topPx + "px" });
    }
    let loaded = document.readyState === "complete";
    fit();
    addEventListener("resize", fit);
    loop.addEventListener("playing", () => loop.setAttribute("data-ready", "true"));
    const start = () => { if (!reduced) { loop.load(); loop.play().catch(() => {}); } };
    if (loaded) start(); else addEventListener("load", () => { loaded = true; start(); });
    new IntersectionObserver((es) => es.forEach((e) => {
      if (reduced || !loaded) return;
      e.isIntersecting ? loop.play().catch(() => {}) : loop.pause();
    })).observe(skyBox);
    // with the portal, the portal decides when the bar stops being glass (see 9)
    if (!document.getElementById("portal")) {
      const bar = () => top.classList.toggle("over", scrollY < skyBox.offsetHeight - 70);
      addEventListener("scroll", bar, { passive: true });
      bar();
    }
  }


  /* 8 · the live mascot. Ahmad, 6 Oct: eyes that follow the cursor, and less passive. Every [data-live] becomes
     body + leaves + two drawn eyes, placed from assets/mascot/live/live.json (Blender's own projection). One rAF
     loop drives them all, only while on screen:
       eyes  follow the cursor (smoothed); with no cursor for 2.5 s they look around on their own
       body  leans and tilts toward the cursor, breathes, squashes a little after each blink
       leaves sway all the time, and swing harder when the cursor moves fast (a damped spring)
       blink at a random 2.5-5 s, sometimes twice; hover or tap = a small hop with smiling eyes */
  const LIVE_DIR = "./assets/mascot/live/";
  let LIVE = { eyes: [{ x: 0.3885, y: 0.6586, r: 0.0392 }, { x: 0.6, y: 0.6586, r: 0.0392 }], pivot: [0.5007, 0.2532] };
  const mascots = [];
  function buildLive(el) {
    el.innerHTML = `<span class="ml-in"><img class="ml-body" src="${LIVE_DIR}body.webp" alt="" draggable="false"><img class="ml-leaves" src="${LIVE_DIR}leaves.webp" alt="" draggable="false">` +
      LIVE.eyes.map(() => '<span class="ml-eye"></span>').join("") + "</span>";
    const eyes = el.querySelectorAll(".ml-eye");
    LIVE.eyes.forEach((e, i) => {
      const h = e.r * 1.18; // a little taller than wide, like the rendered eyes
      Object.assign(eyes[i].style, { left: (e.x - e.r) * 100 + "%", top: (e.y - h) * 100 + "%", width: e.r * 200 + "%", height: h * 200 + "%" });
    });
    el.querySelector(".ml-leaves").style.transformOrigin = `${LIVE.pivot[0] * 100}% ${LIVE.pivot[1] * 100}%`;
    const m = { el, inner: el.querySelector(".ml-in"), visible: true, ex: 0, ey: 0, tilt: 0, lean: 0, sway: 0, swayV: 0, blink: 1, nextBlink: performance.now() + 1500 + Math.random() * 2500, phase: Math.random() * 6 };
    const hop = () => { el.classList.remove("hop"); void el.offsetWidth; el.classList.add("hop", "joy"); m.swayV += 26; setTimeout(() => el.classList.remove("hop", "joy"), 700); };
    el.addEventListener("pointerenter", hop);
    el.addEventListener("click", hop);
    mascots.push(m);
  }
  const ptr = { x: innerWidth / 2, y: innerHeight * 0.3, vx: 0, last: 0, seen: false };
  addEventListener("pointermove", (e) => { ptr.vx = e.clientX - ptr.x; ptr.x = e.clientX; ptr.y = e.clientY; ptr.last = performance.now(); ptr.seen = true; }, { passive: true });
  function frame(t) {
    const idle = !ptr.seen || t - ptr.last > 2500;
    const fling = Math.min(1, Math.abs(ptr.vx) / 40);
    ptr.vx *= 0.85;
    for (const m of mascots) {
      if (!m.visible) continue;
      const r = m.el.getBoundingClientRect();
      const cx = r.left + r.width / 2, cy = r.top + r.height * 0.62;
      let dx, dy;
      if (idle) { const a = t / 1600 + m.phase; dx = Math.cos(a) * 0.8 + Math.sin(a * 0.37) * 0.4; dy = Math.sin(a * 0.73) * 0.5; }
      else { const d = Math.hypot(ptr.x - cx, ptr.y - cy) || 1; const k = Math.min(1, d / 260); dx = ((ptr.x - cx) / d) * k; dy = ((ptr.y - cy) / d) * k; }
      m.ex += (dx * 62 - m.ex) * 0.2; m.ey += (dy * 52 - m.ey) * 0.2;           // % of the eye's own size
      m.tilt += (dx * 10 - m.tilt) * 0.1; m.lean += (dx * r.width * 0.06 - m.lean) * 0.1;
      // leaves: a spring toward a slow breeze, kicked by fast cursor moves
      const breeze = Math.sin(t / 900 + m.phase) * 4 + Math.sin(t / 2300 + m.phase) * 2;
      m.swayV += (breeze - m.sway) * 0.04 + (idle ? 0 : fling * (Math.random() - 0.5) * 6); m.swayV *= 0.9; m.sway += m.swayV * 0.12;
      // blink, sometimes twice
      if (t > m.nextBlink) { m.blinkT = t; m.nextBlink = t + (Math.random() < 0.2 ? 260 : 2500 + Math.random() * 2500); }
      const bt = m.blinkT ? (t - m.blinkT) / 140 : 9;
      m.blink = bt < 1 ? 1 - Math.sin(bt * Math.PI) * 0.92 : 1;
      const breathe = Math.sin(t / 700 + m.phase) * 0.012 + (bt < 1.6 ? Math.sin(Math.min(bt, 1.6) / 1.6 * Math.PI) * 0.02 : 0);
      const st = m.inner.style;
      st.setProperty("--ex", m.ex.toFixed(2) + "%"); st.setProperty("--ey", m.ey.toFixed(2) + "%");
      st.setProperty("--tilt", m.tilt.toFixed(2) + "deg"); st.setProperty("--lean", m.lean.toFixed(2) + "px");
      st.setProperty("--squash", breathe.toFixed(4));
      m.inner.querySelector(".ml-leaves").style.setProperty("--sway", m.sway.toFixed(2) + "deg");
      m.inner.querySelectorAll(".ml-eye").forEach((e) => e.style.setProperty("--blink", m.blink.toFixed(3)));
    }
    requestAnimationFrame(frame);
  }
  function startLive() {
    document.querySelectorAll("[data-live]").forEach(buildLive);
    if (reduced) return;
    const io = new IntersectionObserver((es) => es.forEach((e) => { const m = mascots.find((m) => m.el === e.target); if (m) m.visible = e.isIntersecting; }));
    mascots.forEach((m) => io.observe(m.el));
    requestAnimationFrame(frame);
  }
  fetch(LIVE_DIR + "live.json").then((r) => r.json()).then((j) => (LIVE = j)).catch(() => {}).finally(startLive);


  /* 9 · the portal. Scroll progress p (0-1) over the pinned hero:
       0.00-0.32  the circle opens from the hero mascot's own circle to the whole screen, its centre easing to the middle;
                  the mascot inside grows a little and fades
       0.13-0.88  Sprout's 3D objects fly out toward you in two waves, along translateZ (real perspective)
       0.80-0.90  "Built around family life" comes up once they have passed, and holds until the page moves on */
  const portal = document.getElementById("portal");
  if (portal) {
    const pin = portal.querySelector(".portal-pin"), layer = document.getElementById("portalLayer");
    const heroMl = document.querySelector(".hero-sky .h-orb"), pml = layer.querySelector(".portal-ml");
    const title = document.getElementById("portalTitle"), bar = document.getElementById("top"), sky = document.getElementById("skyLoop");
    const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v)), lerp = (a, b, t) => a + (b - a) * t;
    const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    const icons = [...layer.querySelectorAll(".fly-i")].map((el, i) => {
      // a note (home-v2, 7 Oct) is an icon with its label: sized by its content and centred in CSS, and it turns
      // less than a bare icon so the words stay readable as they pass
      const note = "note" in el.dataset;
      const small = el.getAttribute("width") === "126";
      const ang = i * 2.39996 + 0.6, rad = 0.78 + (i % 3) * 0.26;
      if (!note) {
        el.style.width = el.style.height = (small ? 104 : 150) + "px";
        el.style.margin = small ? "-52px 0 0 -52px" : "-75px 0 0 -75px";
      }
      const spin = (i % 2 ? 1 : -1) * (8 + (i % 5) * 5) * (note ? 0.3 : 1);
      return { el, x: Math.cos(ang) * rad, y: Math.sin(ang) * rad * 0.8, start: 0.13 + (i % 8) * 0.038 + (i >= 8 ? 0.11 : 0), spin, zEnd: note ? 620 : small ? 520 : 900 };
    });
    let wasPlaying = true, queued = false;
    function render() {
      queued = false;
      const total = portal.offsetHeight - innerHeight;
      const p = clamp((scrollY - portal.offsetTop) / Math.max(1, total));
      pin.style.setProperty("--p", p.toFixed(4));
      const W = pin.clientWidth, H = pin.clientHeight;
      const pr = pin.getBoundingClientRect(), mr = heroMl.getBoundingClientRect();
      const x0 = mr.left + mr.width / 2 - pr.left, y0 = mr.top + mr.height / 2 - pr.top, r0 = mr.width / 2;
      const o = ease(clamp(p / 0.32));
      const cx = lerp(x0, W / 2, o), cy = lerp(y0, H * 0.48, o);
      const cr = p <= 0.0005 ? 0 : lerp(r0, Math.hypot(W, H) * 0.62, o);
      layer.style.setProperty("--cx", cx + "px"); layer.style.setProperty("--cy", cy + "px"); layer.style.setProperty("--cr", cr + "px");
      // the mascot inside the circle starts exactly where the hero's was, grows, then fades as the objects come
      layer.style.setProperty("--mx", cx + "px"); layer.style.setProperty("--my", cy + "px");
      layer.style.setProperty("--ms", lerp(mr.width * 0.74, Math.min(W, H) * 0.26, o) + "px");
      layer.style.setProperty("--mo", (1 - clamp((p - 0.2) / 0.12)).toFixed(3));
      for (const it of icons) {
        const t = (p - it.start) / 0.36;
        if (t <= 0 || t >= 1) { it.el.style.opacity = 0; continue; }
        const z = lerp(-1500, it.zEnd, Math.pow(t, 1.45));
        const near = clamp((z - 180) / 60, 0, 12);
        const op = clamp(t / 0.1) * (1 - clamp((z - it.zEnd + 240) / 240));
        it.el.style.opacity = op.toFixed(3);
        it.el.style.transform = `translate3d(${(it.x * W * 0.34).toFixed(1)}px, ${(it.y * H * 0.34).toFixed(1)}px, ${z.toFixed(1)}px) rotate(${(it.spin * t).toFixed(1)}deg)`;
        it.el.style.filter = `drop-shadow(0 22px 24px rgb(70 55 30 / .22)) blur(${near.toFixed(1)}px)`;
      }
      // the closing title is optional (home-v2 has none, 7 Oct)
      if (title) title.style.setProperty("--t", ease(clamp((p - 0.8) / 0.1)).toFixed(3));
      bar.classList.toggle("over", p < 0.2);
      // nobody sees the sky once the portal covers it
      if (sky && !reduced) { const show = p < 0.45; if (show !== wasPlaying) { wasPlaying = show; show ? sky.play().catch(() => {}) : sky.pause(); } }
    }
    const req = () => { if (!queued) { queued = true; requestAnimationFrame(render); } };
    addEventListener("scroll", req, { passive: true });
    addEventListener("resize", req);
    if (!reduced) render();
    else layer.querySelectorAll(".fly-i").forEach((el, i) => Object.assign(el.style, { opacity: 0.9, transform: `translate(${Math.cos(i * 2.4) * 34}vw, ${Math.sin(i * 2.4) * 26}vh)` }));
  }
})();
