/* Sprout launch film, 60.5 s at 1920 x 1080.

   One paused GSAP timeline holds every move. window.seek(t) puts the whole stage at
   exactly time t, so the renderer (tools/render.mjs) can photograph frame N without
   any dependence on wall-clock time, and the preview can scrub.

   Story, in beats (seconds):
     0.0  Noise      a hundred little notifications, then they collapse to a point
     5.4  Logo       the point blooms into the app icon, "Sprout", "One place for all of it."
     9.2  Launch     the icon grows into the phone (the app-open transform)
    10.0  Daily Brief
    18.0  Sprout Assist: say it, the words become the reminder, it's set
    28.8  Two phones: the reminder travels to Matt and lands in his Daily Brief
    34.6  Events, Chat, Clubs, switched from the tab bar
    44.4  Lineup: the five tabs side by side
    48.3  The middle screen opens into the family photo: "Less in your head. More life together."
    53.9  The photo folds back into the app icon: end card */
(async function () {
  const { phone, mattPhone, phi, A } = window.SproutScreens;
  const DURATION = 60.5;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const stage = $("#stage");
  const loaded = (root) => Promise.all([...root.querySelectorAll("img")].map((i) => i.decode().catch(() => {})));
  const L = { bg: $("#bg"), noise: $("#noise"), world: $("#world"), type: $("#type"), fx: $("#fx"), top: $("#top") };

  // ── eases ───────────────────────────────────────────────────────────────
  // A damped spring, normalised so the tween's duration is the settle time.
  // zeta 0.5 = lively (about 16% overshoot), 0.75 = a soft Apple-style landing.
  function spring(zeta) {
    const wd = Math.sqrt(1 - zeta * zeta);
    const D = 6.9 / zeta;
    return (p) => {
      if (p >= 1) return 1;
      const t = p * D;
      return 1 - Math.exp(-zeta * t) * (Math.cos(wd * t) + (zeta / wd) * Math.sin(wd * t));
    };
  }
  const SP = { bouncy: spring(0.5), lively: spring(0.62), soft: spring(0.78), firm: spring(0.9) };
  const MARKERS = []; // sound cues for tools/score.py
  const cue = (t, type, extra = {}) => MARKERS.push({ t: +t.toFixed(3), type, ...extra });

  // ── helpers: markup ────────────────────────────────────────────────────
  const el = (tag, cls, html = "", parent = L.type) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    e.innerHTML = html;
    parent.appendChild(e);
    return e;
  };
  // "Every *morning*, a plan." → one span per word, *word* in italics,
  // [text]{key} groups words into a keyword span the film can lift out later.
  function words(str) {
    const word = (w) => `<span class="w">${w.replace(/\*([^*]+)\*/g, "<em>$1</em>")}</span>`;
    const out = [];
    // *several words* → each word italic on its own, so every word can still move alone
    str = str.replace(/\*([^*]+)\*/g, (_, g) => g.split(/\s+/).map((w) => `*${w}*`).join(" "));
    for (const m of str.matchAll(/\[([^\]]+)\]\{(\w+)\}|(\S+)/g)) {
      out.push(m[3] ? word(m[3]) : `<span class="k" data-k="${m[2]}">${m[1].split(/\s+/).map(word).join(" ")}</span>`);
    }
    return out.join(" ");
  }
  const lines = (arr) => arr.map((l) => `<span class="line">${words(l)}</span>`).join("");
  const tileImg = (src) => `<span class="tile"><img src="${A}${src}.webp" alt=""></span>`;
  const tileIcon = (k) => `<span class="tile">${phi(k)}</span>`;
  function column(eyebrowTile, eyebrow, h1Lines, body, extra = "") {
    return el("div", "col", `<div class="eyebrow">${eyebrowTile}<span>${eyebrow}</span></div>
      <h2 class="h1">${lines(h1Lines)}</h2><p class="body">${words(body)}</p>${extra}`);
  }

  // ── the timeline ───────────────────────────────────────────────────────
  const tl = gsap.timeline({ paused: true });
  // discrete state (classes, text, attributes) lives on tracks: each track holds its
  // initial value plus timed keys, and every seek applies the value in force at t
  const tracks = [];
  const trackOf = new Map();
  function track(node, key, initial, apply) {
    const id = key;
    let per = trackOf.get(node);
    if (!per) trackOf.set(node, (per = {}));
    if (!per[id]) { per[id] = { initial, apply, keys: [], cur: initial }; tracks.push(per[id]); }
    return per[id];
  }
  const key = (tr, t, v) => { tr.keys.push([t, v]); tr.keys.sort((a, b) => a[0] - b[0]); };
  const cls = (t, node, name, add = true) => key(track(node, "c:" + name, node.classList.contains(name), (v) => node.classList.toggle(name, v)), t, add);
  const text = (t, node, next) => key(track(node, "html", node.innerHTML, (v) => (node.innerHTML = v)), t, next);
  const attr = (t, node, name, v) => key(track(node, "a:" + name, node.getAttribute(name), (x) => node.setAttribute(name, x)), t, v);
  const hooks = []; // per-frame drawing (orb, voice bars)
  // a number tweened on a proxy, applied by fn: used for scrollTop and paths
  function prop(t, dur, from, to, ease, fn) {
    const o = { v: from };
    tl.fromTo(o, { v: from }, { v: to, duration: dur, ease, onUpdate: () => fn(o.v), immediateRender: false }, t);
    return o;
  }

  function reveal(targets, t, o = {}) {
    const { y = 46, blur = 14, dur = 1.25, st = 0.06, ease = SP.soft, op = 1 } = o;
    tl.fromTo(targets, { y }, { y: 0, duration: dur, stagger: st, ease }, t);
    tl.fromTo(targets, { opacity: 0, filter: `blur(${blur}px)` }, { opacity: op, filter: "blur(0px)", duration: dur * 0.5, stagger: st, ease: "power2.out" }, t);
  }
  function conceal(targets, t, o = {}) {
    const { y = -34, blur = 12, dur = 0.5, st = 0.018 } = o;
    tl.to(targets, { y: `+=${y}`, opacity: 0, filter: `blur(${blur}px)`, duration: dur, stagger: st, ease: "power2.in" }, t);
  }
  // reveal a column: eyebrow, then headline words, then body, then anything extra
  function revealColumn(col, t, extraSel) {
    reveal($(".eyebrow", col), t, { y: 24, dur: 1.1 });
    reveal($$(".h1 .w", col), t + 0.12, { st: 0.07 });
    reveal($$(".body .w", col), t + 0.5, { y: 22, blur: 8, st: 0.018, dur: 1.1 });
    if (extraSel) reveal($$(extraSel, col), t + 0.8, { y: 20, blur: 6, st: 0.08, dur: 1.1, op: 0.32 });
    cue(t, "text");
  }
  const concealColumn = (col, t) => conceal([$(".eyebrow", col), ...$$(".h1 .w, .body .w, .flist li", col)], t);

  // measuring: put the stage at time t, read a node's rect in stage pixels, return
  let k = 1;
  function measure(t, node) {
    tl.seek(t, false);
    applyToggles(t);
    const s = stage.getBoundingClientRect(), r = node.getBoundingClientRect();
    const out = { x: (r.left - s.left) / k, y: (r.top - s.top) / k, w: r.width / k, h: r.height / k };
    out.cx = out.x + out.w / 2;
    out.cy = out.y + out.h / 2;
    tl.seek(0, false);
    applyToggles(0);
    return out;
  }
  function applyToggles(t) {
    for (const tr of tracks) {
      let v = tr.initial;
      for (const [kt, kv] of tr.keys) { if (t >= kt) v = kv; else break; }
      if (v !== tr.cur) { tr.apply(v); tr.cur = v; }
    }
  }

  // a finger: arrives, presses, ripples
  function tap(t, node, { press = node, measureAt = t } = {}) {
    const r = measure(measureAt, node);
    const dot = el("div", "touch", "", L.fx), ring = el("div", "ripple", "", L.fx);
    gsap.set([dot, ring], { x: r.cx, y: r.cy });
    tl.fromTo(dot, { opacity: 0, scale: 1.5 }, { opacity: 1, scale: 1, duration: 0.3, ease: "power2.out" }, t - 0.36);
    tl.to(dot, { scale: 0.78, duration: 0.09, ease: "power2.in" }, t - 0.06);
    tl.to(dot, { scale: 1, opacity: 0, duration: 0.36, ease: "power2.out" }, t + 0.06);
    tl.fromTo(ring, { opacity: 0.8, scale: 0.7 }, { opacity: 0, scale: 2.3, duration: 0.6, ease: "power2.out", immediateRender: false }, t);
    tl.set(ring, { opacity: 0 }, 0);
    if (press) {
      tl.to(press, { scale: 0.96, duration: 0.09, ease: "power2.in" }, t - 0.06);
      tl.to(press, { scale: 1, duration: 0.5, ease: SP.lively }, t + 0.04);
    }
    cue(t, "tap");
  }
  // switch the screen inside a phone, the way the app pushes a view
  function swap(ph, from, to, t, dir = 1) {
    const a = $(`[data-s="${from}"]`, ph), b = $(`[data-s="${to}"]`, ph);
    tl.to(a, { x: -36 * dir, autoAlpha: 0, duration: 0.42, ease: "power2.inOut" }, t);
    tl.fromTo(b, { x: 44 * dir, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.62, ease: "power3.out" }, t + 0.08);
    return b;
  }
  const settle = (targets, t, o = {}) => {
    const { y = 26, st = 0.05, dur = 1.1 } = o;
    tl.fromTo(targets, { y }, { y: 0, duration: dur, stagger: st, ease: SP.soft }, t);
    tl.fromTo(targets, { opacity: 0 }, { opacity: 1, duration: dur * 0.4, stagger: st, ease: "power1.out" }, t);
  };
  function setTab(ph, t, key) {
    const btns = $$(".sa-nav button", ph);
    for (const b of btns) cls(t, b, "on", b.dataset.nav === key);
  }

  // ── background: two slow washes over cream ─────────────────────────────
  const washA = el("div", "wash", "", L.bg), washB = el("div", "wash", "", L.bg);
  washA.id = "washA"; washB.id = "washB";
  el("div", "", "", L.bg).id = "grain";
  tl.fromTo(washA, { x: -620, y: -260 }, { x: -140, y: 180, duration: DURATION, ease: "sine.inOut" }, 0);
  tl.fromTo(washB, { x: 640, y: 300 }, { x: 260, y: -220, duration: DURATION, ease: "sine.inOut" }, 0);

  // ════════════════════════════════════════════════════════════════════════
  // 1 · NOISE  (0 → 5.4)
  // ════════════════════════════════════════════════════════════════════════
  const NOTES = [
    [-560, -330, 0, -3, "envelope-simple", "School email", "now", "Picture day is tomorrow. Wear the blue shirt!"],
    [540, -350, 0, 2.5, "chat-teardrop-text", "Soccer team", "1m", "Practice moved to 5:30 on Saturday"],
    [-700, 250, 0, 2, "users", "1st Grade parents", "2m", "Who’s bringing snacks Friday?"],
    [640, 290, 0, -2, "envelope-simple", "Miss Taylor", "4m", "Permission slip due Wednesday"],
    [30, -440, 1, 1, "chat-teardrop-text", "Class group chat", "now", "47 new messages"],
    [-120, 430, 1, -1.5, "chat-teardrop-text", "Messages", "3m", "Can someone grab Mia at 3?"],
    [830, -30, 1, 3, "bell", "Reminders", "5m", "Bring towels for water day"],
    [-850, -70, 1, -3, "calendar-blank", "School calendar", "6m", "No school Monday"],
    [300, 455, 2, 2, "megaphone", "Room parent", "8m", "Class party supplies, anyone?"],
    [-330, -480, 2, -2, "envelope-simple", "PTA newsletter", "9m", "Spirit night at Mandola’s on Thursday"],
    [380, -470, 2, 1.5, "calendar-blank", "Party invite", "12m", "RSVP for Kennedy’s birthday by Friday"],
    [-470, 480, 2, 1, "envelope-simple", "School email", "14m", "Pickup moves to the side gate"],
    [930, 390, 2, -2, "chat-teardrop-text", "Carpool thread", "15m", "Who’s driving Saturday morning?"],
    [-960, 400, 2, 2, "calendar-blank", "Cafeteria", "20m", "Lunch menu for this week"],
  ];
  const DEPTH = [{ s: 1, b: 0, o: 1 }, { s: 0.84, b: 0.8, o: 0.92 }, { s: 0.68, b: 2, o: 0.72 }];
  const noteEls = NOTES.map(([x, y, d, rot, icon, src, ago, msg], i) => {
    const n = el("div", "nt", `<span class="gl">${phi(icon)}</span><div class="tx"><div class="src">${src}<i>${ago}</i></div><div class="msg">${msg}</div></div>`, L.noise);
    n.style.zIndex = 10 - d;
    const D = DEPTH[d];
    const t0 = 0.25 + 3.3 * Math.pow(i / NOTES.length, 0.72);
    gsap.set(n, { xPercent: -50, yPercent: -50, filter: `blur(${D.b}px)` });
    tl.fromTo(n, { x: x * 1.06, y: y + 70, scale: D.s * 0.86, rotation: rot * 2 }, { x, y, scale: D.s, rotation: rot, duration: 1.3, ease: SP.lively }, t0);
    tl.fromTo(n, { opacity: 0 }, { opacity: D.o, duration: 0.25, ease: "power1.out" }, t0);
    // drift apart slowly while they pile up
    tl.to(n, { x: x * 1.08, y: y * 1.08 - 12, duration: 4.4 - t0 + 0.8, ease: "sine.inOut" }, t0 + 0.6);
    cue(t0, "ping", { depth: d, i });
    return { n, x, y, d };
  });
  const glow = el("div", "", "", L.noise);
  glow.id = "noiseGlow";
  glow.style.zIndex = 20;
  tl.fromTo(glow, { opacity: 0 }, { opacity: 1, duration: 0.8 }, 0.7);

  const nA = el("h2", "h1 center", lines(["A hundred little things."]), L.noise);
  const nB = el("h2", "h1 center", lines(["In a dozen different places."]), L.noise);
  for (const n of [nA, nB]) { n.style.cssText += "top:50%;margin-top:-46px;z-index:30"; }
  reveal($$(".w", nA), 0.95, { st: 0.08 });
  cue(0.95, "text");
  conceal($$(".w", nA), 2.75);
  reveal($$(".w", nB), 2.98, { st: 0.07 });
  cue(2.98, "text");
  conceal($$(".w", nB), 4.5, { y: -20 });

  // the collapse: everything is pulled into one point
  noteEls.forEach(({ n, x, y }, i) => {
    const dist = Math.hypot(x, y);
    tl.to(n, { x: 0, y: 0, scale: 0.12, rotation: `+=${(i % 2 ? 1 : -1) * 24}`, opacity: 0, duration: 0.78, ease: "power3.in" }, 4.55 + (1 - dist / 1100) * 0.18);
  });
  tl.to(glow, { opacity: 0, duration: 0.5 }, 4.6);
  cue(4.55, "suck");

  // ════════════════════════════════════════════════════════════════════════
  // 2 · LOGO  (5.3 → 9.2)
  // ════════════════════════════════════════════════════════════════════════
  const dot = el("div", "", "", L.world);
  dot.style.cssText = "position:absolute;left:50%;top:50%;width:26px;height:26px;margin:-13px 0 0 -13px;border-radius:50%;background:#186338";
  tl.fromTo(dot, { scale: 0, opacity: 1 }, { scale: 1, duration: 0.28, ease: "back.out(3)" }, 5.12);
  tl.to(dot, { scale: 0.4, opacity: 0, duration: 0.22, ease: "power2.in" }, 5.4);

  const icon = el("div", "appicon", `<img class="clover" src="${A}clover.webp" alt="">`, L.world);
  const clover = $(".clover", icon);
  tl.fromTo(icon, { scale: 0.12, rotation: -14, opacity: 0 }, { scale: 1, rotation: 0, duration: 1.5, ease: SP.bouncy }, 5.4);
  tl.fromTo(icon, { opacity: 0 }, { opacity: 1, duration: 0.12 }, 5.4);
  tl.fromTo(clover, { scale: 0.6, rotation: 30 }, { scale: 1, rotation: 0, duration: 1.7, ease: SP.lively }, 5.46);
  cue(5.4, "bloom");

  const wm = el("div", "wordmark center", "Sprout".split("").map((c) => `<span class="w">${c}</span>`).join(""));
  wm.style.cssText += "top:50%;margin-top:40px";
  const tg = el("div", "tagline center", words("One place for all of it."));
  tg.style.cssText += "top:50%;margin-top:196px";
  tl.to(icon, { y: -130, duration: 1.2, ease: SP.soft }, 6.35);
  reveal($$(".w", wm), 6.45, { y: 70, blur: 10, st: 0.05, ease: SP.lively });
  reveal($$(".w", tg), 7.25, { y: 24, blur: 8, st: 0.06 });
  cue(6.45, "text");
  conceal([...$$(".w", wm), ...$$(".w", tg)], 8.7, { st: 0.012 });
  tl.to(icon, { y: 0, duration: 0.7, ease: "power3.inOut" }, 8.75);

  // ════════════════════════════════════════════════════════════════════════
  // 3 · LAUNCH: the icon becomes the phone  (9.3 → 10.3)
  // ════════════════════════════════════════════════════════════════════════
  const pA = phone("pA", ["brief", "home", "listen", "review", "set", "events", "chat", "clubs"], "brief", "brief");
  L.world.appendChild(pA);
  await loaded(pA);
  const scr = (ph, key) => $(`[data-s="${key}"]`, ph);
  for (const s of $$(".sa-screen", pA)) gsap.set(s, { autoAlpha: s.dataset.s === "brief" ? 1 : 0 });
  tl.set(pA, { x: 0, y: 0, scale: 1, opacity: 0 }, 0);
  const MORPH = 9.35;
  tl.to(icon, { width: 393, height: 852, marginLeft: -196.5, marginTop: -426, borderRadius: 55, duration: 1.0, ease: "expo.inOut" }, MORPH);
  tl.to(clover, { scale: 0.5, opacity: 0, duration: 0.45, ease: "power2.in" }, MORPH + 0.05);
  tl.to(pA, { opacity: 1, duration: 0.3, ease: "power1.out" }, MORPH + 0.72);
  tl.set(icon, { opacity: 0 }, MORPH + 1.05);
  cue(MORPH, "whoosh");

  // ════════════════════════════════════════════════════════════════════════
  // 4 · DAILY BRIEF  (10.0 → 18.3)
  // ════════════════════════════════════════════════════════════════════════
  const brief = scr(pA, "brief");
  const dbScroll = $(".db-scroll", brief);
  const navA = $(".sa-nav", pA);
  settle([$(".sa-sb", pA), ...$$(".db-scroll > *", brief), navA], MORPH + 0.8, { st: 0.035 });
  const wx = $(".wx", brief);
  tl.fromTo(wx, { scale: 0.6 }, { scale: 1, duration: 1.2, ease: SP.bouncy }, MORPH + 1.0);

  tl.to(pA, { x: 400, duration: 1.1, ease: "power4.inOut" }, 11.0);
  cue(11.0, "whoosh", { soft: 1 });
  const colBrief = column(tileIcon("sun-horizon"), "Daily Brief", ["Every morning,", "a *plan.*"],
    "The Daily Brief puts the weather, your to-dos, carpool and today’s events in one calm list.",
    `<ul class="flist"><span class="dot"></span><li>The weather</li><li>Your to-dos</li><li>Carpool</li><li>Happening today</li></ul>`);
  revealColumn(colBrief, 11.55, ".flist li");
  const fl = $$(".flist li", colBrief), fdot = $(".flist .dot", colBrief);
  const rowY = (i) => i * 56;
  tl.fromTo(fdot, { y: rowY(0), scale: 0 }, { scale: 1, duration: 0.6, ease: SP.bouncy }, 12.7);
  const highlight = (i, t) => {
    tl.to(fl[i], { opacity: 1, duration: 0.35 }, t);
    if (i > 0) tl.to(fl[i - 1], { opacity: 0.32, duration: 0.35 }, t);
    if (i > 0) tl.to(fdot, { y: rowY(i), duration: 0.7, ease: SP.soft }, t);
    cue(t, "tick", { soft: 1 });
  };
  // the weather
  highlight(0, 12.7);
  tl.to(wx, { scale: 1.12, duration: 0.3, ease: "power2.out" }, 12.85);
  tl.to(wx, { scale: 1, duration: 0.8, ease: SP.lively }, 13.15);
  // a to-do gets done
  highlight(1, 13.55);
  const todoEl = $("[data-todo]", brief), ringEl = $(".att-ring", brief);
  tap(14.2, $(".box", todoEl), { press: null });
  cls(14.22, todoEl, "is-done");
  tl.fromTo(ringEl, { "--p": 0 }, { "--p": 1, duration: 0.7, ease: "power2.out" }, 14.25);
  text(14.3, $(".att-count", brief), "1/1");
  text(14.3, $(".att-sub", brief), "Great, you got everything done today.");
  tl.fromTo($(".box", todoEl), { scale: 1 }, { scale: 1.14, duration: 0.14, ease: "power2.out", immediateRender: false }, 14.22);
  tl.to($(".box", todoEl), { scale: 1, duration: 0.6, ease: SP.bouncy }, 14.36);
  cue(14.22, "check");
  // scroll to carpool, then to what's happening today
  const secTop = (sel) => {
    const s = dbScroll.getBoundingClientRect(), r = $(sel, dbScroll).getBoundingClientRect();
    return (r.top - s.top) / k;
  };
  const yCar = secTop('[data-sec="carpool"]') - 12, yToday = secTop('[data-sec="today"]') - 12;
  highlight(2, 15.15);
  prop(15.05, 1.0, 0, yCar, "power3.inOut", (v) => (dbScroll.scrollTop = v));
  tl.fromTo($(".db-carpool", brief), { scale: 0.94 }, { scale: 1, duration: 1.2, ease: SP.lively, immediateRender: false }, 15.6);
  highlight(3, 16.5);
  prop(16.4, 1.0, yCar, yToday, "power3.inOut", (v) => (dbScroll.scrollTop = v));
  $$(".db-tl .card", brief).forEach((c, i) => {
    tl.to(c, { scale: 1.04, duration: 0.22, ease: "power2.out" }, 16.95 + i * 0.13);
    tl.to(c, { scale: 1, duration: 0.7, ease: SP.lively }, 17.17 + i * 0.13);
  });
  cue(16.4, "whoosh", { soft: 1 });

  // ════════════════════════════════════════════════════════════════════════
  // 5 · SPROUT ASSIST  (18.0 → 28.6)
  // ════════════════════════════════════════════════════════════════════════
  concealColumn(colBrief, 18.0);
  tl.to(fdot, { opacity: 0, duration: 0.3 }, 18.1);
  const assistTab = $('[data-nav="assist"]', navA);
  tap(18.55, assistTab);
  setTab(pA, 18.58, "assist");
  const home = swap(pA, "brief", "home", 18.62);
  settle([$(".sa-tile.logo", home), $("h3", home), $(".pick", home), ...$$(".sa-row", home)], 18.7, { st: 0.05 });
  cue(18.62, "swipe");
  const colAssist = column(tileImg("clover"), "Sprout Assist", ["Just *say it.*"],
    "Reminders, carpools, events and more. Say it out loud and Sprout Assist sets it up.");
  revealColumn(colAssist, 18.95);

  // pick Reminder
  const rowRem = $('[data-pick="reminder"]', home);
  tap(20.55, rowRem);
  const listen = swap(pA, "home", "listen", 20.7);
  tl.to(navA, { y: 150, opacity: 0, duration: 0.5, ease: "power3.in" }, 20.7);
  settle([$(".sa-head", listen), $(".sa-tile.icon", listen), $(".sa-say", listen), $(".sa-need", listen)], 20.8, { st: 0.06 });
  cue(20.7, "swipe");
  concealColumn(colAssist, 20.9);

  // she speaks; the words land beside the phone
  const say = el("div", "say", `<div class="who"><img src="${A}lydia.webp" alt=""><span>Lydia</span><span class="bars">${"<i></i>".repeat(5)}</span></div>
    <p class="q">${words("“Remind [my husband]{who} to [pick up Presley from school]{what} at [2 PM]{time} [today.”]{day}")}</p>`);
  reveal($(".who", say), 21.2, { y: 20, dur: 1 });
  const sayWords = $$(".q .w", say);
  const SPEAK0 = 21.55, STEP = 0.235;
  sayWords.forEach((w, i) => {
    tl.fromTo(w, { y: 34, opacity: 0, filter: "blur(10px)" }, { y: 0, opacity: 1, filter: "blur(0px)", duration: 0.55, ease: "power3.out" }, SPEAK0 + i * STEP);
    cue(SPEAK0 + i * STEP, "word", { i });
  });
  const SPEAK1 = SPEAK0 + sayWords.length * STEP;
  const bars = $$(".bars i", say);
  hooks.push((t) => {
    const on = t > SPEAK0 - 0.1 && t < SPEAK1 + 0.2;
    bars.forEach((b, i) => {
      const v = on ? 0.3 + 0.7 * Math.abs(Math.sin(t * (7 + i * 1.7) + i * 1.3) * Math.sin(t * (3.1 + i * 0.6) + i)) : 0.22;
      b.style.transform = `scaleY(${v.toFixed(3)})`;
    });
  });
  // the orb listens on the film's clock
  const orbCanvas = $(".sa-thinking-orb", listen);
  const orb = window.SproutThinkingOrb.create(orbCanvas, { state: "listening", pixelScale: 2 });
  hooks.push((t) => orb && orb.drawAt(t));

  // heard: the check wakes up, the key phrases light up
  const HEARD = SPEAK1 + 0.35;
  cls(HEARD, listen, "is-heard");
  tl.fromTo($(".sa-check .pulse", listen), { opacity: 0.9, scale: 1 }, { opacity: 0, scale: 1.5, duration: 1.1, ease: "power2.out", repeat: 1 }, HEARD);
  const keys = $$(".q .k", say);
  const plain = sayWords.filter((w) => !w.closest(".k"));
  tl.to(plain, { opacity: 0.28, duration: 0.5, ease: "power1.inOut" }, HEARD);
  tl.to(keys, { color: "#186338", duration: 0.5 }, HEARD);
  cue(HEARD, "heard");

  const CHECK = HEARD + 0.75;
  tap(CHECK, $(".sa-check", listen));
  const review = swap(pA, "listen", "review", CHECK + 0.15);
  settle([$(".sa-head", review), $(".sa-field", review), ...$$(".sa-when .f", review), $(".sa-when .opt", review), $(".sa-who .l", review), ...$$(".sa-who button", review), $(".sa-cta", review)], CHECK + 0.25, { st: 0.04 });
  cue(CHECK + 0.15, "swipe");

  // the transform: each spoken phrase flies into the field it fills
  const fields = { what: $('[data-f="what"]', review), day: $('[data-f="day"]', review), time: $('[data-f="time"]', review), who: $('[data-who="spouse"]', review) };
  tl.set([fields.what, fields.day, fields.time], { opacity: 0 }, 0);
  const FLY0 = CHECK + 0.55;
  ["what", "time", "day", "who"].forEach((key, i) => {
    const src = $(`[data-k="${key}"]`, say);
    const a = measure(FLY0 - 0.05, src), b = measure(FLY0 + 2.2, fields[key]);
    const clone = el("div", "fly", src.textContent.replace(/[“”]/g, "").replace(/\.$/, ""), L.fx);
    const cw = clone.offsetWidth, ch = clone.offsetHeight;
    const s = Math.min((key === "what" ? 18 : 16) / 64 * 1.18, (b.w * 0.92) / cw);
    const x0 = a.x, y0 = a.y + (a.h - ch) / 2;
    const x1 = b.cx - (cw * s) / 2, y1 = b.cy - (ch * s) / 2;
    const cx = (x0 + x1) / 2, cy = Math.min(y0, y1) - 150 - i * 30;
    const t0 = FLY0 + i * 0.2, dur = 1.0;
    gsap.set(clone, { x: x0, y: y0, opacity: 0 });
    tl.set(clone, { opacity: 1 }, t0);
    tl.to(src, { opacity: 0, duration: 0.12 }, t0);
    prop(t0, dur, 0, 1, "power3.inOut", (p) => {
      const u = 1 - p;
      const x = u * u * x0 + 2 * u * p * cx + p * p * x1, y = u * u * y0 + 2 * u * p * cy + p * p * y1;
      clone.style.transform = `translate(${x}px, ${y}px) scale(${1 + (s - 1) * p})`;
    });
    tl.to(clone, { opacity: 0, duration: 0.16, ease: "power1.in" }, t0 + dur - 0.1);
    if (key === "who") {
      attr(t0 + dur - 0.05, fields.who, "aria-pressed", "true");
      tl.fromTo(fields.who, { scale: 1 }, { scale: 1.08, duration: 0.14, ease: "power2.out", immediateRender: false }, t0 + dur - 0.05);
      tl.to(fields.who, { scale: 1, duration: 0.6, ease: SP.bouncy }, t0 + dur + 0.09);
    } else {
      tl.fromTo(fields[key], { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out", immediateRender: false }, t0 + dur - 0.1);
    }
    cue(t0 + dur - 0.05, "land", { i });
  });
  const FLY1 = FLY0 + 3 * 0.2 + 1.0;
  conceal(plain, FLY0 + 0.75, { st: 0.01 });
  conceal($(".who", say), FLY1 + 0.1);

  const SET = FLY1 + 0.95;
  tap(SET, $(".sa-cta", review));
  const setScr = swap(pA, "review", "set", SET + 0.15);
  tl.fromTo($(".ring", setScr), { scale: 0 }, { scale: 1, duration: 1.2, ease: SP.bouncy }, SET + 0.3);
  settle([$("h3", setScr), $(".msg", setScr), $(".sa-cta", setScr)], SET + 0.45, { st: 0.08 });
  cue(SET + 0.3, "success");

  // ════════════════════════════════════════════════════════════════════════
  // 6 · IT LANDS ON MATT'S PHONE  (≈28.7 → 34.6)
  // ════════════════════════════════════════════════════════════════════════
  const TWO = SET + 1.25;
  const pM = mattPhone("pM");
  L.world.appendChild(pM);
  await loaded(pM);
  const capA = el("div", "cap", `<img src="${A}lydia.webp" alt="">Lydia’s phone`, pA);
  const capM = el("div", "cap", `<img src="${A}matt.webp" alt="">Matt’s phone`, pM);
  tl.set(pM, { x: 1400, y: 56, scale: 0.88 }, 0);
  tl.set([capA, capM], { opacity: 0 }, 0);
  tl.to(pA, { x: -305, y: 56, scale: 0.88, duration: 1.15, ease: "power4.inOut" }, TWO);
  tl.to(pM, { x: 305, duration: 1.25, ease: "power4.out" }, TWO + 0.2);
  cue(TWO, "whoosh");
  reveal([capA, capM], TWO + 0.95, { y: 16, blur: 6, st: 0.1 });
  const twoHead = el("h2", "h1 center", lines(["Say it once. It lands in Matt’s Daily Brief."]));
  twoHead.style.cssText += "top:44px;font-size:58px";
  reveal($$(".w", twoHead), TWO + 0.6, { st: 0.045 });
  cue(TWO + 0.6, "text");

  // the reminder travels from her phone to his
  const flyer = el("div", "flyer", `<img src="${A}bell.webp" alt=""><div><b>Pick up Presley from school</b><span>Today · 2:00 PM · For Matt</span></div>`, L.fx);
  const note = $(".sp-note", pM);
  const FLY = TWO + 1.55;
  const fa = measure(FLY, $(".ring", setScr)), fb = measure(FLY + 1.2, $(".mt-scroll", pM));
  const fw = 330, fh = flyer.offsetHeight;
  gsap.set(flyer, { opacity: 0 });
  tl.fromTo(flyer, { opacity: 0 }, { opacity: 1, duration: 0.2, immediateRender: false }, FLY);
  const fx0 = fa.cx - fw / 2, fy0 = fa.cy - fh / 2, fx1 = fb.cx - fw / 2, fy1 = fb.y - 20;
  prop(FLY, 1.15, 0, 1, "power2.inOut", (p) => {
    const u = 1 - p, cxp = 960 - fw / 2, cyp = 150;
    const x = u * u * fx0 + 2 * u * p * cxp + p * p * fx1, y = u * u * fy0 + 2 * u * p * cyp + p * p * fy1;
    const sc = 0.7 + 0.45 * Math.sin(Math.PI * p);
    flyer.style.transform = `translate(${x}px, ${y}px) scale(${sc}) rotate(${Math.sin(Math.PI * p) * -5}deg)`;
  });
  tl.to(flyer, { opacity: 0, duration: 0.18 }, FLY + 1.05);
  cue(FLY, "fly");
  // his phone gets the push, then the to-do lands in his list
  const NOTE = FLY + 1.1;
  tl.fromTo(note, { yPercent: -170 }, { yPercent: 0, duration: 1.1, ease: SP.lively }, NOTE);
  cue(NOTE, "ding");
  tl.to(note, { yPercent: -170, duration: 0.5, ease: "power3.in" }, NOTE + 1.45);
  const mtNew = $(".mt-new", pM), mtAtt = $(".mt-att", pM), newTodo = $(".mt-new .db-todo", pM);
  const newH = $(".mt-new > div", pM).offsetHeight;
  const LAND = NOTE + 1.7;
  cls(LAND, mtAtt, "has-new");
  tl.fromTo(mtNew, { height: 0 }, { height: newH, duration: 0.75, ease: "power3.out" }, LAND);
  tl.fromTo(newTodo, { backgroundColor: "rgba(226,233,227,1)" }, { backgroundColor: "rgba(226,233,227,0)", duration: 2.2, ease: "power1.in" }, LAND + 0.3);
  tl.fromTo($(".mt-ring", pM), { "--p": 1 }, { "--p": 0.75, duration: 0.6, ease: "power2.out" }, LAND + 0.1);
  text(LAND + 0.1, $(".mt-count", pM), "3/4");
  text(LAND + 0.1, $(".mt-sub", pM), "1 new from Lydia.");
  cue(LAND, "land2");

  // ════════════════════════════════════════════════════════════════════════
  // 7 · EVENTS, CHAT, CLUBS  (from ≈34.6)
  // ════════════════════════════════════════════════════════════════════════
  const TABS0 = LAND + 1.6;
  conceal($$(".w", twoHead), TABS0 - 0.2);
  conceal([capA, capM], TABS0 - 0.2, { y: 10 });
  tl.to(pM, { x: 1450, duration: 0.75, ease: "power3.in" }, TABS0 - 0.1);
  tl.to(pA, { x: 400, y: 0, scale: 1, duration: 1.15, ease: "power4.inOut" }, TABS0 + 0.1);
  cue(TABS0, "whoosh");
  const evScr = swap(pA, "set", "events", TABS0 + 0.35);
  setTab(pA, TABS0 + 0.35, "events");
  tl.to(navA, { y: 0, opacity: 1, duration: 0.7, ease: SP.soft }, TABS0 + 0.5);
  const evLists = $$(".ev-list", evScr);
  evLists[1].classList.add("gone");
  settle([$(".ev-top", evScr), ...$$(".ev-card", evLists[0])], TABS0 + 0.55, { st: 0.07 });
  const colEv = column(tileIcon("compass"), "Events", ["Plans, close", "to *home.*"],
    "Sprout finds kid-friendly things to do near you, day by day.");
  revealColumn(colEv, TABS0 + 1.0);
  // browse to Saturday
  const DAY = TABS0 + 2.5;
  const sat = $('[data-day="26"]', evScr), thu = $('[data-day="24"]', evScr);
  tap(DAY, sat);
  cls(DAY, sat, "on");
  cls(DAY, thu, "on", false);
  tl.to(evLists[0], { autoAlpha: 0, x: -30, duration: 0.28, ease: "power2.in" }, DAY + 0.02);
  cls(DAY + 0.3, evLists[0], "gone");
  cls(DAY + 0.3, evLists[1], "gone", false);
  settle($$(".ev-card", evLists[1]), DAY + 0.3, { y: 40, st: 0.08 });

  // Chat
  const CHAT = DAY + 1.75;
  concealColumn(colEv, CHAT - 0.3);
  tap(CHAT, $('[data-nav="chat"]', navA));
  setTab(pA, CHAT + 0.02, "chat");
  const chScr = swap(pA, "events", "chat", CHAT + 0.05);
  settle([$(".ch-head", chScr), ...$$(".ch-groups > span", chScr), $(".ch-dmh", chScr), ...$$(".ch-dm", chScr)], CHAT + 0.12, { st: 0.045 });
  const colCh = column(tileIcon("chat-circle-dots"), "Chat", ["Every class chat,", "*together.*"],
    "Class group chats, sub groups and parent messages, all in one inbox.");
  revealColumn(colCh, CHAT + 0.3);

  // Clubs
  const CLUBS = CHAT + 3.2;
  concealColumn(colCh, CLUBS - 0.3);
  tap(CLUBS, $('[data-nav="clubs"]', navA));
  setTab(pA, CLUBS + 0.02, "clubs");
  const clScr = swap(pA, "chat", "clubs", CLUBS + 0.05);
  settle([...$$(".cl-comms > span", clScr), $(".cl-chips", clScr), $(".cl-dir", clScr), ...$$(".cl-mem", clScr)], CLUBS + 0.12, { st: 0.05 });
  const colCl = column(tileIcon("users"), "Clubs", ["Know the", "*families.*"],
    "See who’s in your kid’s class, and who you’ve already met.");
  revealColumn(colCl, CLUBS + 0.3);

  // ════════════════════════════════════════════════════════════════════════
  // 8 · LINEUP: the five tabs side by side
  // ════════════════════════════════════════════════════════════════════════
  const LINE = CLUBS + 2.9;
  concealColumn(colCl, LINE - 0.3);
  const LS = 0.5, LX = [-640, -320, 0, 320, 640], LY = -6;
  const l0 = phone("l0", ["brief"], "brief", "brief"), l1 = phone("l1", ["events"], "events", "events"),
    l2 = phone("l2", ["home"], "home", "assist"), l3 = phone("l3", ["chat"], "chat", "chat");
  const lineup = [l0, l1, l2, l3];
  for (const p of lineup) L.world.appendChild(p);
  const b0 = $("[data-todo]", l0);
  b0.classList.add("is-done");
  $(".att-ring", l0).style.setProperty("--p", 1);
  $(".att-count", l0).textContent = "1/1";
  $(".att-sub", l0).textContent = "Great, you got everything done today.";
  $$(".ev-list", l1)[1].style.display = "none";
  lineup.forEach((p, i) => {
    tl.set(p, { x: LX[i] * 1.25, y: 900, scale: LS, opacity: 1 }, 0);
    tl.to(p, { x: LX[i], y: LY, duration: 1.5, ease: SP.soft }, LINE + 0.25 + i * 0.09);
  });
  tl.to(pA, { x: LX[4], y: LY, scale: LS, duration: 1.2, ease: "power4.inOut" }, LINE);
  cue(LINE, "whoosh");
  cue(LINE + 0.3, "rise");
  const lineHead = el("h2", "h1 center", lines(["Your parent community, *all in one app.*"]));
  lineHead.style.cssText += "top:92px;font-size:64px";
  reveal($$(".w", lineHead), LINE + 0.8, { st: 0.05 });
  const labels = ["Daily Brief", "Events", "Sprout Assist", "Chat", "Clubs"].map((n, i) => {
    const c = el("div", "center", n);
    c.style.cssText = `position:absolute;left:${960 + LX[i] - 150}px;width:300px;top:${540 + LY + 426 * LS + 30}px;text-align:center;font:600 22px/1 var(--sans);color:var(--green-bold)`;
    return c;
  });
  reveal(labels, LINE + 1.1, { y: 14, blur: 6, st: 0.07 });
  cue(LINE + 0.8, "text");
  // the row breathes while it holds
  const row = [l0, l1, l2, l3, pA];
  row.forEach((p, i) => tl.to(p, { y: LY - 10 + (i % 2) * 6, duration: 2.6, ease: "sine.inOut" }, LINE + 1.6));

  // ════════════════════════════════════════════════════════════════════════
  // 9 · THE MIDDLE SCREEN OPENS INTO REAL LIFE
  // ════════════════════════════════════════════════════════════════════════
  const OPEN = LINE + 4.1;
  conceal([...$$(".w", lineHead), ...labels], OPEN - 0.35, { st: 0.01 });
  [l0, l1, l3, pA].forEach((p, i) => {
    const x = [LX[0], LX[1], LX[3], LX[4]][i];
    tl.to(p, { x: x * 1.5, scale: LS * 0.92, opacity: 0, duration: 0.9, ease: "power3.in" }, OPEN - 0.05 + Math.abs(x) / 6400);
  });
  const photo = el("div", "", `<img src="${A}family-neighborhood.webp" alt=""><div class="shade"></div><div class="face"><img src="${A}clover.webp" alt=""></div>`, L.top);
  photo.id = "photo";
  const pw0 = 393 * LS, ph0 = 852 * LS;
  const winAt = (w, h, r, y = 0) => ({ width: w, height: h, marginLeft: -w / 2, marginTop: -h / 2 + y, borderRadius: r });
  tl.set(photo, { ...winAt(pw0, ph0, 55 * LS, LY - 10), opacity: 0 }, 0);
  tl.to(photo, { opacity: 1, duration: 0.35, ease: "power1.inOut" }, OPEN);
  tl.set(l2, { opacity: 0 }, OPEN + 0.36);
  tl.to(photo, { ...winAt(1920, 1080, 0), duration: 1.25, ease: "expo.inOut" }, OPEN + 0.3);
  cue(OPEN + 0.3, "open");
  const pimg = $("img", photo), shade = $(".shade", photo), face = $(".face", photo);
  tl.fromTo(pimg, { scale: 1.16 }, { scale: 1.02, duration: 6.4, ease: "sine.out" }, OPEN);
  tl.fromTo(shade, { opacity: 0 }, { opacity: 1, duration: 1.0 }, OPEN + 1.1);
  const ptext = el("div", "ptext", `<span class="line">${words("Less in your head.")}</span><span class="line">${words("More life *together.*")}</span>`, L.top);
  const pl = $$(".line", ptext);
  reveal($$(".w", pl[0]), OPEN + 1.55, { st: 0.08 });
  reveal($$(".w", pl[1]), OPEN + 2.75, { st: 0.08 });
  cue(OPEN + 1.55, "text");
  cue(OPEN + 2.75, "text");

  // ════════════════════════════════════════════════════════════════════════
  // 10 · IT FOLDS BACK INTO THE ICON: end card
  // ════════════════════════════════════════════════════════════════════════
  const FOLD = OPEN + 5.15;
  conceal($$(".w", ptext), FOLD - 0.45, { st: 0.015 });
  tl.to(photo, { ...winAt(240, 240, 54), duration: 1.15, ease: "expo.inOut" }, FOLD);
  tl.to(shade, { opacity: 0, duration: 0.5 }, FOLD + 0.2);
  tl.fromTo(face, { opacity: 0 }, { opacity: 1, duration: 0.45, ease: "power1.inOut" }, FOLD + 0.5);
  tl.fromTo($("img", face), { scale: 0.7, rotation: -20 }, { scale: 1, rotation: 0, duration: 1.4, ease: SP.lively }, FOLD + 0.6);
  tl.to(photo, { boxShadow: "0 0 0 1px rgba(120,100,90,.08), 0 40px 70px -30px rgba(40,50,40,.35), 0 12px 24px -12px rgba(40,50,40,.2)", duration: 0.6 }, FOLD + 0.7);
  cue(FOLD, "fold");
  const END = FOLD + 1.3;
  tl.to(photo, { marginTop: -120 - 150, duration: 1.3, ease: SP.soft }, END);
  const wm2 = el("div", "wordmark center", "Sprout".split("").map((c) => `<span class="w">${c}</span>`).join(""), L.top);
  wm2.style.cssText += "top:50%;margin-top:-10px;font-size:112px";
  const endLine = el("div", "tagline center", words("Download Sprout today."), L.top);
  endLine.style.cssText += "top:50%;margin-top:128px;font-size:30px";
  const badges = el("div", "center badges", `<img src="${A}app-store.png" alt="Download on the App Store"><img src="${A}play-store.png" alt="Get it on Google Play">`, L.top);
  badges.style.cssText += "top:50%;margin-top:196px";
  const url = el("div", "center url", "joinsprout.co", L.top);
  url.style.cssText += "top:50%;margin-top:300px";
  reveal($$(".w", wm2), END + 0.1, { y: 60, blur: 10, st: 0.05, ease: SP.lively });
  reveal($$(".w", endLine), END + 0.7, { y: 20, blur: 8, st: 0.05 });
  reveal([...badges.children], END + 1.0, { y: 24, blur: 6, st: 0.1 });
  reveal(url, END + 1.35, { y: 14, blur: 6 });
  cue(END + 0.1, "resolve");

  // ── wire up ────────────────────────────────────────────────────────────
  tl.seek(0, false);
  applyToggles(0);
  function seek(t) {
    t = Math.max(0, Math.min(DURATION, t));
    tl.seek(t, false);
    applyToggles(t);
    for (const h of hooks) h(t);
  }
  window.DURATION = DURATION;
  window.MARKERS = MARKERS.sort((a, b) => a.t - b.t);
  window.seek = seek;
  window.setScale = (s) => { k = s; };
  seek(0);
  window.__ready = true;
  document.dispatchEvent(new Event("film-ready"));
})().catch((e) => { console.error(e); window.__error = String(e && e.stack || e); });
