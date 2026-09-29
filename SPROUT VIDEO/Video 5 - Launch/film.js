/* Sprout launch film, 60 s at 1080 x 1920 (9:16), after Tony's 28 Sep revision.
   (The 16:9 cut it replaces is kept in archive/film-16x9.js.)

   One paused GSAP timeline holds every move. window.seek(t) puts the whole stage at
   exactly time t, so tools/render.mjs can photograph frame N with no dependence on
   wall-clock time, and the preview can scrub.

   Beats (seconds):
     0.0  Noise        notifications from the apps parents juggle. "Every parent knows this feeling."
     2.75 The apps     each notification becomes its app: iMessage, WhatsApp, Gmail, Facebook Groups,
                       Evite, Partiful, Apple Notes, PTA and school websites, the paper calendar.
                       "A hundred little things. A dozen different places."
     4.55 Collapse     they are pulled into one point
     5.2  Mark         the icon, "Sprout", "The superapp for parents."
     8.6  Launch       the icon grows into the phone
     9.6  Daily Brief  "Every morning, a plan."
    14.8  Sprout Assist  say it, the words fly into the reminder, it is set
    24.8  Matt         the reminder lands in his Daily Brief
    29.6  Group chat   Chat list (typing, a new message), then inside Miss Taylor Class:
                       Chat, Calendar, Updates, Links, each with its own line of text
    38.4  Families     Clubs directory, Amanda Hamilton's profile, her photo opens
    44.2  Lineup       five tabs side by side
    48.2  Real life    the middle screen opens into the family photo
    53.6  End          the photo folds into the icon */
(async function () {
  const { phone, mattPhone, phi, A, PH } = window.SproutScreens;
  const DURATION = 60;
  const W = 1080, H = 1920;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const stage = $("#stage");
  const loaded = (root) => Promise.all([...root.querySelectorAll("img")].map((i) => i.decode().catch(() => {})));
  const L = { bg: $("#bg"), noise: $("#noise"), world: $("#world"), type: $("#type"), fx: $("#fx"), top: $("#top") };
  const LOGO = "assets/logos/";

  function spring(zeta) {
    const wd = Math.sqrt(1 - zeta * zeta), D = 6.9 / zeta;
    return (p) => (p >= 1 ? 1 : 1 - Math.exp(-zeta * p * D) * (Math.cos(wd * p * D) + (zeta / wd) * Math.sin(wd * p * D)));
  }
  const SP = { bouncy: spring(0.5), lively: spring(0.62), soft: spring(0.78) };
  const MARKERS = [];
  const cue = (t, type, extra = {}) => MARKERS.push({ t: +t.toFixed(3), type, ...extra });

  const el = (tag, cls, html = "", parent = L.type) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    e.innerHTML = html;
    parent.appendChild(e);
    return e;
  };
  function words(str) {
    const word = (w) => `<span class="w">${w.replace(/\*([^*]+)\*/g, "<em>$1</em>")}</span>`;
    const out = [];
    str = str.replace(/\*([^*]+)\*/g, (_, g) => g.split(/\s+/).map((w) => `*${w}*`).join(" "));
    for (const m of str.matchAll(/\[([^\]]+)\]\{(\w+)\}|(\S+)/g)) {
      out.push(m[3] ? word(m[3]) : `<span class="k" data-k="${m[2]}">${m[1].split(/\s+/).map(word).join(" ")}</span>`);
    }
    return out.join(" ");
  }
  const lines = (arr) => arr.map((l) => `<span class="line">${words(l)}</span>`).join("");
  const svgIcon = (k) => `<svg viewBox="0 0 256 256"><path d="${PH[k]}"/></svg>`;

  // ── timeline, discrete-state tracks, per-frame hooks ───────────────────
  const tl = gsap.timeline({ paused: true });
  const tracks = [], trackOf = new Map();
  function track(node, key, initial, apply) {
    let per = trackOf.get(node);
    if (!per) trackOf.set(node, (per = {}));
    if (!per[key]) { per[key] = { initial, apply, keys: [], cur: initial }; tracks.push(per[key]); }
    return per[key];
  }
  const keyAt = (tr, t, v) => { tr.keys.push([t, v]); tr.keys.sort((a, b) => a[0] - b[0]); };
  const cls = (t, node, name, add = true) => keyAt(track(node, "c:" + name, node.classList.contains(name), (v) => node.classList.toggle(name, v)), t, add);
  const text = (t, node, next) => keyAt(track(node, "html", node.innerHTML, (v) => (node.innerHTML = v)), t, next);
  const attr = (t, node, name, v) => keyAt(track(node, "a:" + name, node.getAttribute(name), (x) => node.setAttribute(name, x)), t, v);
  const hooks = [];
  function prop(t, dur, from, to, ease, fn) {
    const o = { v: from };
    tl.fromTo(o, { v: from }, { v: to, duration: dur, ease, onUpdate: () => fn(o.v), immediateRender: false }, t);
  }
  function reveal(targets, t, o = {}) {
    const { y = 46, blur = 14, dur = 1.25, st = 0.06, ease = SP.soft } = o;
    tl.fromTo(targets, { y }, { y: 0, duration: dur, stagger: st, ease }, t);
    tl.fromTo(targets, { opacity: 0, filter: `blur(${blur}px)` }, { opacity: 1, filter: "blur(0px)", duration: dur * 0.5, stagger: st, ease: "power2.out" }, t);
  }
  function conceal(targets, t, o = {}) {
    const { y = -34, blur = 12, dur = 0.5, st = 0.018 } = o;
    tl.to(targets, { y: `+=${y}`, opacity: 0, filter: `blur(${blur}px)`, duration: dur, stagger: st, ease: "power2.in" }, t);
  }
  // the text zone above the phone: an optional eyebrow, then the headline
  function zone(eyebrow, h1, t, out, { tileHTML = "", top } = {}) {
    const z = el("div", "zone", `${eyebrow ? `<div class="eyebrow">${tileHTML}<span>${eyebrow}</span></div>` : ""}<h2 class="h1">${lines(h1)}</h2>`);
    if (top != null) z.style.top = top + "px";
    if (eyebrow) reveal($(".eyebrow", z), t, { y: 20, dur: 1.1 });
    reveal($$(".h1 .w", z), t + (eyebrow ? 0.1 : 0), { st: 0.065 });
    if (out != null) conceal([...(eyebrow ? [$(".eyebrow", z)] : []), ...$$(".h1 .w", z)], out, { st: 0.012 });
    cue(t, "text");
    return z;
  }
  const tileImg = (src) => `<span class="tile"><img src="${A}${src}.webp" alt=""></span>`;
  const tileIcon = (k) => `<span class="tile">${phi(k)}</span>`;

  let K = 1;
  function applyTracks(t) {
    for (const tr of tracks) {
      let v = tr.initial;
      for (const [kt, kv] of tr.keys) { if (t >= kt) v = kv; else break; }
      if (v !== tr.cur) { tr.apply(v); tr.cur = v; }
    }
  }
  function measure(t, node) {
    tl.seek(t, false);
    applyTracks(t);
    const s = stage.getBoundingClientRect(), r = node.getBoundingClientRect();
    const out = { x: (r.left - s.left) / K, y: (r.top - s.top) / K, w: r.width / K, h: r.height / K };
    out.cx = out.x + out.w / 2; out.cy = out.y + out.h / 2;
    tl.seek(0, false);
    applyTracks(0);
    return out;
  }
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
  function swap(ph, from, to, t, dir = 1) {
    const a = $(`[data-s="${from}"]`, ph), b = $(`[data-s="${to}"]`, ph);
    tl.to(a, { x: -36 * dir, autoAlpha: 0, duration: 0.42, ease: "power2.inOut" }, t);
    tl.fromTo(b, { x: 44 * dir, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.62, ease: "power3.out", immediateRender: false }, t + 0.08);
    cue(t, "swipe");
    return b;
  }
  const settle = (targets, t, o = {}) => {
    const { y = 26, st = 0.05, dur = 1.1 } = o;
    tl.fromTo(targets, { y }, { y: 0, duration: dur, stagger: st, ease: SP.soft }, t);
    tl.fromTo(targets, { opacity: 0 }, { opacity: 1, duration: dur * 0.4, stagger: st, ease: "power1.out" }, t);
  };
  const setTab = (ph, t, k) => { for (const b of $$(".sa-nav button", ph)) cls(t, b, "on", b.dataset.nav === k); };

  // ── background ────────────────────────────────────────────────────────
  const washA = el("div", "wash", "", L.bg), washB = el("div", "wash", "", L.bg);
  washA.id = "washA"; washB.id = "washB";
  el("div", "", "", L.bg).id = "grain";
  tl.fromTo(washA, { x: -420, y: -700 }, { x: -120, y: 300, duration: DURATION, ease: "sine.inOut" }, 0);
  tl.fromTo(washB, { x: 380, y: 700 }, { x: 160, y: -300, duration: DURATION, ease: "sine.inOut" }, 0);

  // ════════════════════════════════════════════════════════════════════════
  // 1 · NOISE, THEN THE APPS BEHIND IT  (0 → 5.2)
  // ════════════════════════════════════════════════════════════════════════
  // official marks (assets/logos/SOURCES.md); the three that are not brands get a glyph
  const APPS = {
    imessage: { label: "iMessage", img: "imessage.svg", fit: "" },
    whatsapp: { label: "WhatsApp", img: "whatsapp.svg", fit: "pad" },
    gmail: { label: "Gmail", img: "gmail.svg", fit: "pad" },
    facebook: { label: "Facebook Groups", img: "facebook.svg", fit: "pad" },
    evite: { label: "Evite", img: "evite.png", fit: "word" },
    partiful: { label: "Partiful", img: "partiful.svg", fit: "word" },
    notes: { label: "Apple Notes", img: "apple-notes.svg", fit: "" },
    pta: { label: "PTA Website", icon: "users-three" },
    school: { label: "School Website", icon: "graduation-cap" },
    paper: { label: "Paper Calendar", icon: "calendar-blank" },
  };
  const ORDER = ["imessage", "whatsapp", "gmail", "facebook", "evite", "partiful", "notes", "pta", "school", "paper"];
  const SLOT = {};
  ORDER.forEach((k, i) => { SLOT[k] = { x: (i % 5 - 2) * 195, y: i < 5 ? -560 : 420 }; });
  const appFace = (k, cl = "") => (APPS[k].img ? `<img class="${cl || APPS[k].fit}" src="${LOGO}${APPS[k].img}" alt="">` : svgIcon(APPS[k].icon));
  const NOTES = [
    [-250, -700, 0, -3, "gmail", "School email", "now", "Picture day is tomorrow. Wear the blue shirt!"],
    [240, -520, 0, 2.5, "whatsapp", "Soccer team", "1m", "Practice moved to 5:30 on Saturday"],
    [-230, -330, 1, 2, "facebook", "1st Grade parents", "2m", "Who’s bringing snacks Friday?"],
    [250, 330, 0, -2, "imessage", "Messages", "3m", "Can someone grab Mia at 3?"],
    [-240, 520, 1, 1, "evite", "Evite", "4m", "RSVP for Kennedy’s birthday by Friday"],
    [230, 700, 0, -1.5, "partiful", "Partiful", "5m", "Playdate at Zilker Park, Saturday 10 AM"],
    [-260, 860, 2, 3, "notes", "Notes", "6m", "Bring towels for water day"],
    [270, -860, 2, -3, "pta", "PTA website", "8m", "Spirit night at Mandola’s on Thursday"],
    [300, -200, 2, 2, "school", "School website", "9m", "No school Monday"],
    [-300, 200, 2, -2, "paper", "Fridge calendar", "12m", "Field trip Friday, circled in red"],
    [310, 130, 2, 1.5, "imessage", "Class group text", "now", "47 new messages"],
    [-310, -130, 2, -1, "whatsapp", "Carpool thread", "15m", "Who’s driving Saturday morning?"],
  ];
  const DEPTH = [{ s: 0.95, b: 0, o: 1 }, { s: 0.82, b: 0.8, o: 0.92 }, { s: 0.68, b: 2, o: 0.72 }];
  const MORPH_APPS = 2.75;
  const firstOf = {};
  NOTES.forEach(([x, y, d, rot, app, src, ago, msg], i) => {
    const n = el("div", "nt", `<span class="gl">${appFace(app, APPS[app].img ? (APPS[app].fit ? "pad" : "") : "")}</span><div class="tx"><div class="src">${src}<i>${ago}</i></div><div class="msg">${msg}</div></div>`, L.noise);
    n.style.zIndex = 10 - d;
    const Dp = DEPTH[d], t0 = 0.2 + 2.3 * Math.pow(i / NOTES.length, 0.75);
    gsap.set(n, { xPercent: -50, yPercent: -50, filter: `blur(${Dp.b}px)` });
    tl.fromTo(n, { x: x * 1.06, y: y + 60, scale: Dp.s * 0.86, rotation: rot * 2 }, { x, y, scale: Dp.s, rotation: rot, duration: 1.3, ease: SP.lively }, t0);
    tl.fromTo(n, { opacity: 0 }, { opacity: Dp.o, duration: 0.25 }, t0);
    tl.to(n, { y: y - 16, duration: MORPH_APPS - t0, ease: "sine.inOut" }, t0 + 0.5);
    cue(t0, "ping", { depth: d, i });
    // the transform: the card shrinks into the slot of the app it came from
    const s = SLOT[app], T = MORPH_APPS + (i % 6) * 0.035;
    tl.to(n, { x: s.x, y: s.y, scale: 0.3, rotation: 0, opacity: 0, filter: "blur(0px)", duration: 0.72, ease: "power3.inOut" }, T);
    if (!firstOf[app]) firstOf[app] = { x: x + (-185) * Dp.s, y, T, s: Dp.s };
  });
  const glow = el("div", "", "", L.noise);
  glow.id = "noiseGlow";
  glow.style.cssText = "z-index:20;width:1200px;height:760px;margin:-380px 0 0 -600px";
  tl.fromTo(glow, { opacity: 0 }, { opacity: 1, duration: 0.8 }, 0.6);
  const tiles = ORDER.map((k) => {
    const f = firstOf[k], s = SLOT[k];
    const t = el("div", `tile2${APPS[k].img ? "" : " gen"}`, appFace(k), L.noise);
    t.style.zIndex = 25;
    tl.fromTo(t, { x: f.x, y: f.y, scale: (50 / 150) * f.s, opacity: 0 }, { x: s.x, y: s.y, scale: 1, duration: 1.1, ease: SP.soft }, f.T);
    tl.fromTo(t, { opacity: 0 }, { opacity: 1, duration: 0.2, immediateRender: false }, f.T);
    gsap.set(t, { left: W / 2, top: H / 2 });
    const lb = el("div", "tlabel", APPS[k].label, L.noise);
    gsap.set(lb, { left: W / 2 + s.x, top: H / 2 + s.y + 92 });
    lb.style.zIndex = 25;
    reveal(lb, MORPH_APPS + 0.45 + ORDER.indexOf(k) * 0.03, { y: 14, blur: 6, dur: 0.9 });
    return { t, lb, s };
  });
  cue(MORPH_APPS, "gather");
  const nA = el("h2", "h1 center", lines(["Every parent knows", "*this feeling.*"]), L.noise);
  const nB = el("h2", "h1 center", lines(["A hundred little things.", "A dozen different *places.*"]), L.noise);
  for (const n of [nA, nB]) n.style.cssText += "top:50%;margin-top:-90px;z-index:30";
  reveal($$(".w", nA), 0.8, { st: 0.07 }); cue(0.8, "text");
  conceal($$(".w", nA), 2.45);
  reveal($$(".w", nB), 2.8, { st: 0.06 }); cue(2.8, "text");
  conceal($$(".w", nB), 4.45, { y: -20 });
  tiles.forEach(({ t, lb, s }, i) => {
    tl.to(t, { x: 0, y: 0, scale: 0.12, opacity: 0, rotation: (i % 2 ? 1 : -1) * 30, duration: 0.72, ease: "power3.in" }, 4.55 + (1 - Math.hypot(s.x, s.y) / 800) * 0.15);
    tl.to(lb, { opacity: 0, duration: 0.3 }, 4.5);
  });
  tl.to(glow, { opacity: 0, duration: 0.5 }, 4.6);
  cue(4.55, "suck");

  // ════════════════════════════════════════════════════════════════════════
  // 2 · MARK  (5.1 → 8.6)
  // ════════════════════════════════════════════════════════════════════════
  const dot = el("div", "", "", L.world);
  dot.style.cssText = "position:absolute;left:50%;top:50%;width:26px;height:26px;margin:-13px 0 0 -13px;border-radius:50%;background:#186338";
  tl.fromTo(dot, { scale: 0, opacity: 1 }, { scale: 1, duration: 0.28, ease: "back.out(3)" }, 5.1);
  tl.to(dot, { scale: 0.4, opacity: 0, duration: 0.22, ease: "power2.in" }, 5.36);
  const icon = el("div", "appicon", `<img class="clover" src="${A}clover.webp" alt="">`, L.world);
  const clover = $(".clover", icon);
  tl.fromTo(icon, { scale: 0.12, rotation: -14, opacity: 0 }, { scale: 1, rotation: 0, duration: 1.5, ease: SP.bouncy }, 5.36);
  tl.fromTo(icon, { opacity: 0 }, { opacity: 1, duration: 0.12, immediateRender: false }, 5.36);
  tl.fromTo(clover, { scale: 0.6, rotation: 30 }, { scale: 1, rotation: 0, duration: 1.7, ease: SP.lively }, 5.42);
  cue(5.36, "bloom");
  const wm = el("div", "wordmark center", "Sprout".split("").map((c) => `<span class="w">${c}</span>`).join(""));
  wm.style.cssText += "top:50%;margin-top:40px";
  const tg = el("div", "tagline center", words("The superapp for parents."));
  tg.style.cssText += "top:50%;margin-top:196px;font-size:38px";
  tl.to(icon, { y: -150, duration: 1.2, ease: SP.soft }, 6.2);
  reveal($$(".w", wm), 6.3, { y: 70, blur: 10, st: 0.05, ease: SP.lively });
  reveal($$(".w", tg), 7.0, { y: 24, blur: 8, st: 0.07 });
  cue(6.3, "text");
  conceal([...$$(".w", wm), ...$$(".w", tg)], 8.05, { st: 0.012 });
  tl.to(icon, { y: 0, duration: 0.55, ease: "power3.inOut" }, 8.1);

  // ════════════════════════════════════════════════════════════════════════
  // 3 · LAUNCH: the icon becomes the phone  (8.6 → 9.6)
  // ════════════════════════════════════════════════════════════════════════
  const PS = 1.55, PY = 255;
  const pA = phone("pA", ["brief", "home", "listen", "review", "set", "chatlist", "group", "clubs", "profile"], "brief", "brief");
  L.world.appendChild(pA);
  await loaded(pA);
  const scr = (ph, k) => $(`[data-s="${k}"]`, ph);
  for (const s of $$(".sa-screen", pA)) gsap.set(s, { autoAlpha: s.dataset.s === "brief" ? 1 : 0 });
  tl.set(pA, { x: 0, y: 0, scale: PS, opacity: 0 }, 0);
  const MORPH = 8.6;
  tl.to(icon, { width: 393 * PS, height: 852 * PS, marginLeft: -196.5 * PS, marginTop: -426 * PS, borderRadius: 55 * PS, duration: 1.0, ease: "expo.inOut" }, MORPH);
  tl.to(clover, { scale: 0.5, opacity: 0, duration: 0.45, ease: "power2.in" }, MORPH + 0.05);
  tl.to(pA, { opacity: 1, duration: 0.3, ease: "power1.out" }, MORPH + 0.72);
  tl.set(icon, { opacity: 0 }, MORPH + 1.05);
  cue(MORPH, "whoosh");

  // ════════════════════════════════════════════════════════════════════════
  // 4 · DAILY BRIEF  (9.4 → 14.8)
  // ════════════════════════════════════════════════════════════════════════
  const brief = scr(pA, "brief"), dbScroll = $(".db-scroll", brief), navA = $(".sa-nav", pA);
  settle([$(".sa-sb", pA), ...$$(".db-scroll > *", brief), navA], MORPH + 0.8, { st: 0.035 });
  const wx = $(".wx", brief);
  tl.fromTo(wx, { scale: 0.6 }, { scale: 1, duration: 1.2, ease: SP.bouncy }, MORPH + 1.0);
  tl.to(pA, { y: PY, duration: 1.0, ease: "power4.inOut" }, 9.7);
  cue(9.7, "whoosh", { soft: 1 });
  zone("Daily Brief", ["Every morning,", "a *plan.*"], 10.15, 14.55, { tileHTML: tileIcon("sun-horizon") });
  const todoEl = $("[data-todo]", brief), ringEl = $(".att-ring", brief);
  tap(11.9, $(".box", todoEl), { press: null });
  cls(11.92, todoEl, "is-done");
  tl.fromTo(ringEl, { "--p": 0 }, { "--p": 1, duration: 0.7, ease: "power2.out" }, 11.95);
  text(12.0, $(".att-count", brief), "1/1");
  text(12.0, $(".att-sub", brief), "Great, you got everything done today.");
  tl.fromTo($(".box", todoEl), { scale: 1 }, { scale: 1.14, duration: 0.14, ease: "power2.out", immediateRender: false }, 11.92);
  tl.to($(".box", todoEl), { scale: 1, duration: 0.6, ease: SP.bouncy }, 12.06);
  cue(11.92, "check");
  const secTop = (sel) => { const r = dbScroll.getBoundingClientRect(); return ($(sel, dbScroll).getBoundingClientRect().top - r.top) / (r.width / dbScroll.offsetWidth); };
  const yCar = secTop('[data-sec="carpool"]') - 12, yToday = secTop('[data-sec="today"]') - 12;
  prop(12.6, 0.9, 0, yCar, "power3.inOut", (v) => (dbScroll.scrollTop = v));
  tl.fromTo($(".db-carpool", brief), { scale: 0.94 }, { scale: 1, duration: 1.2, ease: SP.lively, immediateRender: false }, 13.1);
  prop(13.6, 0.9, yCar, yToday, "power3.inOut", (v) => (dbScroll.scrollTop = v));
  $$(".db-tl .card", brief).forEach((c, i) => {
    tl.to(c, { scale: 1.04, duration: 0.22, ease: "power2.out" }, 14.0 + i * 0.1);
    tl.to(c, { scale: 1, duration: 0.6, ease: SP.lively }, 14.22 + i * 0.1);
  });
  cue(13.6, "whoosh", { soft: 1 });

  // ════════════════════════════════════════════════════════════════════════
  // 5 · SPROUT ASSIST  (14.8 → 24.8)
  // ════════════════════════════════════════════════════════════════════════
  tap(14.85, $('[data-nav="assist"]', navA));
  setTab(pA, 14.88, "assist");
  const home = swap(pA, "brief", "home", 14.92);
  settle([$(".sa-tile.logo", home), $("h3", home), $(".pick", home), ...$$(".sa-row", home)], 15.0, { st: 0.05 });
  const zAssist = zone("Sprout Assist", ["Just *say it.*"], 15.15, 16.55, { tileHTML: tileImg("clover") });
  tap(16.3, $('[data-pick="reminder"]', home));
  const listen = swap(pA, "home", "listen", 16.45);
  tl.to(navA, { y: 150, opacity: 0, duration: 0.5, ease: "power3.in" }, 16.45);
  settle([$(".sa-head", listen), $(".sa-tile.icon", listen), $(".sa-say", listen), $(".sa-need", listen)], 16.55, { st: 0.06 });
  // she speaks: the sentence builds in the text zone above the phone
  const say = el("div", "say", `<div class="who"><img src="${A}lydia.webp" alt=""><span>Lydia</span><span class="bars">${"<i></i>".repeat(5)}</span></div>
    <p class="q">${words("“Remind [my husband]{who} to [pick up Presley from school]{what} at [2 PM]{time} [today.”]{day}")}</p>`);
  reveal($(".who", say), 16.85, { y: 20, dur: 1 });
  const sayWords = $$(".q .w", say);
  const SPEAK0 = 17.1, STEP = 0.22;
  sayWords.forEach((w, i) => {
    tl.fromTo(w, { y: 30, opacity: 0, filter: "blur(10px)" }, { y: 0, opacity: 1, filter: "blur(0px)", duration: 0.5, ease: "power3.out" }, SPEAK0 + i * STEP);
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
  const orb = window.SproutThinkingOrb.create($(".sa-thinking-orb", listen), { state: "listening", pixelScale: 3 });
  hooks.push((t) => orb && orb.drawAt(t));
  const HEARD = SPEAK1 + 0.3;
  cls(HEARD, listen, "is-heard");
  tl.fromTo($(".sa-check .pulse", listen), { opacity: 0.9, scale: 1 }, { opacity: 0, scale: 1.5, duration: 1.0, ease: "power2.out", repeat: 1 }, HEARD);
  const keys = $$(".q .k", say), plain = sayWords.filter((w) => !w.closest(".k"));
  tl.to(plain, { opacity: 0.28, duration: 0.5 }, HEARD);
  tl.to(keys, { color: "#186338", duration: 0.5 }, HEARD);
  cue(HEARD, "heard");
  const CHECK = HEARD + 0.6;
  tap(CHECK, $(".sa-check", listen));
  const review = swap(pA, "listen", "review", CHECK + 0.15);
  settle([$(".sa-head", review), $(".sa-field", review), ...$$(".sa-when .f", review), $(".sa-when .opt", review), $(".sa-who .l", review), ...$$(".sa-who button", review), $(".sa-cta", review)], CHECK + 0.25, { st: 0.04 });
  const fields = { what: $('[data-f="what"]', review), day: $('[data-f="day"]', review), time: $('[data-f="time"]', review), who: $('[data-who="spouse"]', review) };
  tl.set([fields.what, fields.day, fields.time], { opacity: 0 }, 0);
  const FLY0 = CHECK + 0.5;
  ["what", "time", "day", "who"].forEach((k, i) => {
    const src = $(`[data-k="${k}"]`, say);
    const a = measure(FLY0 - 0.05, src), b = measure(FLY0 + 2.2, fields[k]);
    const clone = el("div", "fly", src.textContent.replace(/[“”]/g, "").replace(/\.$/, ""), L.fx);
    clone.style.fontSize = "58px";
    const cw = clone.offsetWidth, ch = clone.offsetHeight;
    const s = Math.min(((k === "what" ? 18 : 16) * PS) / 58 * 1.15, (b.w * 0.92) / cw);
    const x0 = a.x, y0 = a.y + (a.h - ch) / 2, x1 = b.cx - (cw * s) / 2, y1 = b.cy - (ch * s) / 2;
    const cx = (x0 + x1) / 2 + (i % 2 ? 120 : -120), cy = (y0 + y1) / 2;
    const t0 = FLY0 + i * 0.18, dur = 0.95;
    gsap.set(clone, { x: x0, y: y0, opacity: 0 });
    tl.set(clone, { opacity: 1 }, t0);
    tl.to(src, { opacity: 0, duration: 0.12 }, t0);
    prop(t0, dur, 0, 1, "power3.inOut", (p) => {
      const u = 1 - p;
      clone.style.transform = `translate(${u * u * x0 + 2 * u * p * cx + p * p * x1}px, ${u * u * y0 + 2 * u * p * cy + p * p * y1}px) scale(${1 + (s - 1) * p})`;
    });
    tl.to(clone, { opacity: 0, duration: 0.16, ease: "power1.in" }, t0 + dur - 0.1);
    if (k === "who") {
      attr(t0 + dur - 0.05, fields.who, "aria-pressed", "true");
      tl.fromTo(fields.who, { scale: 1 }, { scale: 1.08, duration: 0.14, ease: "power2.out", immediateRender: false }, t0 + dur - 0.05);
      tl.to(fields.who, { scale: 1, duration: 0.6, ease: SP.bouncy }, t0 + dur + 0.09);
    } else {
      tl.fromTo(fields[k], { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out", immediateRender: false }, t0 + dur - 0.1);
    }
    cue(t0 + dur - 0.05, "land", { i });
  });
  const FLY1 = FLY0 + 3 * 0.18 + 0.95;
  conceal(plain, FLY0 + 0.6, { st: 0.01 });
  conceal($(".who", say), FLY1 + 0.05);
  const SET = FLY1 + 0.7;
  tap(SET, $(".sa-cta", review));
  const setScr = swap(pA, "review", "set", SET + 0.15);
  tl.fromTo($(".ring", setScr), { scale: 0 }, { scale: 1, duration: 1.2, ease: SP.bouncy }, SET + 0.3);
  settle([$("h3", setScr), $(".msg", setScr), $(".sa-cta", setScr)], SET + 0.45, { st: 0.08 });
  cue(SET + 0.3, "success");

  // ════════════════════════════════════════════════════════════════════════
  // 6 · MATT'S PHONE  (≈24.8 → 29.6)
  // ════════════════════════════════════════════════════════════════════════
  const TWO = SET + 1.05, MS = 0.8, MX = 178, MY = 200;
  const pM = mattPhone("pM");
  L.world.appendChild(pM);
  await loaded(pM);
  tl.set(pM, { x: W, y: MY, scale: MS }, 0);
  tl.to(pA, { x: -MX, y: MY, scale: MS, duration: 1.1, ease: "power4.inOut" }, TWO);
  tl.to(pM, { x: MX, duration: 1.2, ease: "power4.out" }, TWO + 0.15);
  cue(TWO, "whoosh");
  const capA = el("div", "pcap", `<img src="${A}lydia.webp" alt="">Lydia’s phone`), capM = el("div", "pcap", `<img src="${A}matt.webp" alt="">Matt’s phone`);
  gsap.set(capA, { left: W / 2 - MX, top: H / 2 + MY + 426 * MS + 28 });
  gsap.set(capM, { left: W / 2 + MX, top: H / 2 + MY + 426 * MS + 28 });
  reveal([capA, capM], TWO + 0.9, { y: 16, blur: 6, st: 0.1 });
  zone("", ["Say it once. It lands in", "*Matt’s Daily Brief.*"], TWO + 0.45, TWO + 4.4);
  const flyer = el("div", "flyer", `<img src="${A}bell.webp" alt=""><div><b>Pick up Presley from school</b><span>Today · 2:00 PM · For Matt</span></div>`, L.fx);
  const FLY = TWO + 1.35;
  const fa = measure(FLY, $(".ring", setScr)), fb = measure(FLY + 1.2, $(".mt-scroll", pM));
  const fw = 330, fh = flyer.offsetHeight;
  gsap.set(flyer, { opacity: 0 });
  tl.fromTo(flyer, { opacity: 0 }, { opacity: 1, duration: 0.2, immediateRender: false }, FLY);
  const fx0 = fa.cx - fw / 2, fy0 = fa.cy - fh / 2, fx1 = fb.cx - fw / 2, fy1 = fb.y - 20;
  prop(FLY, 1.1, 0, 1, "power2.inOut", (p) => {
    const u = 1 - p, cxp = W / 2 - fw / 2, cyp = Math.min(fy0, fy1) - 260;
    const sc = 0.7 + 0.45 * Math.sin(Math.PI * p);
    flyer.style.transform = `translate(${u * u * fx0 + 2 * u * p * cxp + p * p * fx1}px, ${u * u * fy0 + 2 * u * p * cyp + p * p * fy1}px) scale(${sc}) rotate(${Math.sin(Math.PI * p) * -5}deg)`;
  });
  tl.to(flyer, { opacity: 0, duration: 0.18 }, FLY + 1.0);
  cue(FLY, "fly");
  const note = $(".sp-note", pM);
  const NOTE = FLY + 1.05;
  tl.fromTo(note, { yPercent: -170 }, { yPercent: 0, duration: 1.1, ease: SP.lively }, NOTE);
  cue(NOTE, "ding");
  tl.to(note, { yPercent: -170, duration: 0.5, ease: "power3.in" }, NOTE + 1.25);
  const mtNew = $(".mt-new", pM), mtAtt = $(".mt-att", pM), newTodo = $(".mt-new .db-todo", pM);
  const newH = $(".mt-new > div", pM).offsetHeight;
  const LAND = NOTE + 1.5;
  cls(LAND, mtAtt, "has-new");
  tl.fromTo(mtNew, { height: 0 }, { height: newH, duration: 0.75, ease: "power3.out" }, LAND);
  tl.fromTo(newTodo, { backgroundColor: "rgba(226,233,227,1)" }, { backgroundColor: "rgba(226,233,227,0)", duration: 2.0, ease: "power1.in" }, LAND + 0.3);
  tl.fromTo($(".mt-ring", pM), { "--p": 1 }, { "--p": 0.75, duration: 0.6, ease: "power2.out" }, LAND + 0.1);
  text(LAND + 0.1, $(".mt-count", pM), "3/4");
  text(LAND + 0.1, $(".mt-sub", pM), "1 new from Lydia.");
  cue(LAND, "land2");

  // ════════════════════════════════════════════════════════════════════════
  // 7 · CLASS GROUP CHAT  (≈29.6 → 38.4)
  // ════════════════════════════════════════════════════════════════════════
  const GC = TWO + 4.75;
  conceal([capA, capM], GC - 0.25, { y: 10 });
  tl.to(pM, { x: W + 200, duration: 0.75, ease: "power3.in" }, GC - 0.15);
  tl.to(pA, { x: 0, y: PY, scale: PS, duration: 1.1, ease: "power4.inOut" }, GC);
  cue(GC, "whoosh");
  const chatlist = swap(pA, "set", "chatlist", GC + 0.25);
  setTab(pA, GC + 0.25, "chat");
  tl.to(navA, { y: 0, opacity: 1, duration: 0.7, ease: SP.soft }, GC + 0.4);
  settle([$(".hd", chatlist), ...$$(".g", chatlist), $(".dms .t", chatlist), ...$$(".dm", chatlist)], GC + 0.45, { st: 0.035, y: 20 });
  const EYE = "Class Group Chat", eyeTile = tileIcon("chat-circle-dots");
  const zc1 = zone(EYE, ["Every class,", "*in one place.*"], GC + 0.6, GC + 3.2, { tileHTML: eyeTile });
  // someone is typing in Kindergarten, then a message lands in First Grade (Figma 12758:106526, :106672)
  const typing = $('[data-g="kinder"] .bub', chatlist), newMsg = $('[data-g="first"] .bub', chatlist);
  tl.set([typing, newMsg], { opacity: 0 }, 0);
  const TY = GC + 1.35;
  tl.fromTo(typing, { opacity: 0, scale: 0.6, y: 8 }, { opacity: 1, scale: 1, y: 0, duration: 0.6, ease: SP.lively, immediateRender: false }, TY);
  hooks.push((t) => $$("i", typing).forEach((d, i) => { d.style.opacity = (0.35 + 0.65 * Math.max(0, Math.sin((t - TY) * 7 - i * 0.9))).toFixed(3); }));
  tl.to(typing, { opacity: 0, scale: 0.7, duration: 0.25, ease: "power2.in" }, TY + 1.0);
  tl.fromTo(newMsg, { opacity: 0, scale: 0.6, y: 10 }, { opacity: 1, scale: 1, y: 0, duration: 0.8, ease: SP.lively, immediateRender: false }, TY + 1.1);
  cue(TY, "typing"); cue(TY + 1.1, "pop");
  // into Miss Taylor Class
  const IN = GC + 3.3;
  tap(IN, $('[data-g="mt"] .av', chatlist));
  const group = swap(pA, "chatlist", "group", IN + 0.12);
  tl.to(navA, { y: 150, opacity: 0, duration: 0.5, ease: "power3.in" }, IN + 0.12);
  const panels = Object.fromEntries($$(".panel", group).map((p) => [p.dataset.p, p]));
  const tabsG = Object.fromEntries($$(".tab", group).map((p) => [p.dataset.tab, p]));
  for (const k of Object.keys(panels)) tl.set(panels[k], { autoAlpha: k === "chat" ? 1 : 0 }, 0);
  const setGTab = (t, k) => { for (const [n, b] of Object.entries(tabsG)) cls(t, b, "on", n === k); };
  setGTab(0, "chat");
  settle([$(".hd", group), ...$$('[data-p="chat"] .bb, [data-p="chat"] .mine', group), $(".typebar", group)], IN + 0.2, { st: 0.06, y: 18 });
  // side text for each part, swapped as each tab is tapped
  const TABS = [
    ["chat", IN + 0.3, ["Chat with", "*the whole class.*"]],
    ["calendar", IN + 1.8, ["One calendar", "*the class shares.*"]],
    ["updates", IN + 3.2, ["Teacher updates,", "*in one feed.*"]],
    ["links", IN + 4.5, ["Important links,", "*pinned.*"]],
  ];
  let prev = "chat";
  TABS.forEach(([k, t, h], i) => {
    const out = i < TABS.length - 1 ? TABS[i + 1][1] - 0.3 : IN + 5.75;
    zone(EYE, h, t + 0.1, out, { tileHTML: eyeTile });
    if (k === "chat") return;
    tap(t, tabsG[k]);
    setGTab(t + 0.02, k);
    tl.to(panels[prev], { autoAlpha: 0, x: -30, duration: 0.3, ease: "power2.in" }, t + 0.02);
    tl.fromTo(panels[k], { autoAlpha: 0, x: 36 }, { autoAlpha: 1, x: 0, duration: 0.55, ease: "power3.out", immediateRender: false }, t + 0.1);
    settle($$(`.cal, .note-card, .notes .hr, .up, .ups .hr, .lk, .lks .hr, .addlink, .fn`, panels[k]), t + 0.12, { st: 0.05, y: 16 });
    cue(t, "tab");
    prev = k;
  });

  // ════════════════════════════════════════════════════════════════════════
  // 8 · THE FAMILIES: Clubs directory → Amanda's profile  (≈38.4 → 44.2)
  // ════════════════════════════════════════════════════════════════════════
  const FAM = IN + 5.85;
  tap(FAM, $(".back", group));
  swap(pA, "group", "chatlist", FAM + 0.12, -1);
  tl.to(navA, { y: 0, opacity: 1, duration: 0.5, ease: SP.soft }, FAM + 0.2);
  tap(FAM + 0.6, $('[data-nav="clubs"]', navA));
  setTab(pA, FAM + 0.62, "clubs");
  const clubs = swap(pA, "chatlist", "clubs", FAM + 0.66);
  settle([...$$(".cl-comms > span", clubs), $(".cl-chips", clubs), $(".cl-dir", clubs), ...$$(".cl-mem", clubs)], FAM + 0.72, { st: 0.04 });
  zone("Clubs", ["Know the", "*families.*"], FAM + 0.55, FAM + 5.6, { tileHTML: tileIcon("users") });
  const PROF = FAM + 1.5;
  tap(PROF, $('[data-member="amanda"]', clubs));
  const prof = swap(pA, "clubs", "profile", PROF + 0.12);
  tl.to(navA, { y: 150, opacity: 0, duration: 0.45, ease: "power3.in" }, PROF + 0.12);
  settle([$(".photo", prof), $(".name", prof), $(".sub", prof), ...$$(".kid", prof), ...$$(".rule, h4", prof), ...$$(".chip", prof), $(".empty", prof), $(".none", prof), $(".msg", prof)], PROF + 0.2, { st: 0.03, y: 18 });
  // tap the photo: it opens to the full width, the rest dims (Tony's second screenshot)
  const photo = $(".photo", prof), dim = $(".dim", prof);
  const OPEN_P = PROF + 1.45;
  tap(OPEN_P, photo, { press: null });
  tl.to(photo, { left: 14.5, top: 98, width: 364, height: 364, duration: 0.75, ease: SP.soft }, OPEN_P + 0.05);
  tl.to(dim, { opacity: 1, duration: 0.35 }, OPEN_P + 0.05);
  cue(OPEN_P, "photo");
  const CLOSE_P = OPEN_P + 1.55;
  tap(CLOSE_P, photo, { press: null });
  tl.to(photo, { left: 134, top: 99, width: 125, height: 125, duration: 0.6, ease: SP.soft }, CLOSE_P + 0.05);
  tl.to(dim, { opacity: 0, duration: 0.3 }, CLOSE_P + 0.05);
  const BACK = CLOSE_P + 0.75;
  tap(BACK, $(".back", prof));
  swap(pA, "profile", "clubs", BACK + 0.12, -1);
  tl.to(navA, { y: 0, opacity: 1, duration: 0.5, ease: SP.soft }, BACK + 0.2);

  // ════════════════════════════════════════════════════════════════════════
  // 9 · LINEUP  (≈44.2 → 48.2)
  // ════════════════════════════════════════════════════════════════════════
  const LINE = BACK + 0.7;
  const LS = 0.5, LX = [-430, -215, 0, 215, 430], LY = 150;
  const l0 = phone("l0", ["brief"], "brief", "brief"), l1 = phone("l1", ["events"], "events", "events"),
    l2 = phone("l2", ["home"], "home", "assist"), l3 = phone("l3", ["chatlist"], "chatlist", "chat");
  const lineup = [l0, l1, l2, l3];
  for (const p of lineup) L.world.appendChild(p);
  await Promise.all(lineup.map(loaded));
  const b0 = $("[data-todo]", l0);
  b0.classList.add("is-done");
  $(".att-ring", l0).style.setProperty("--p", 1);
  $(".att-count", l0).textContent = "1/1";
  $(".att-sub", l0).textContent = "Great, you got everything done today.";
  $$(".ev-list", l1)[1].style.display = "none";
  $$(".bub", l3).forEach((b) => (b.style.display = "none"));
  lineup.forEach((p, i) => {
    tl.set(p, { x: LX[i] * 1.3, y: 1200, scale: i === 2 ? 0.6 : LS, opacity: 1 }, 0);
    tl.to(p, { x: LX[i], y: LY, duration: 1.5, ease: SP.soft }, LINE + 0.25 + i * 0.08);
  });
  tl.to(pA, { x: LX[4], y: LY, scale: LS, duration: 1.2, ease: "power4.inOut" }, LINE);
  cue(LINE, "whoosh"); cue(LINE + 0.3, "rise");
  const lineHead = zone("", ["Your parent community,", "*all in one app.*"], LINE + 0.8, LINE + 3.65, { top: 440 });
  const labels = ["Daily Brief", "Events", "Sprout Assist", "Chat", "Clubs"].map((n, i) => {
    const c = el("div", "tlabel", n);
    gsap.set(c, { left: W / 2 + LX[i], top: H / 2 + LY + 426 * (i === 2 ? 0.6 : LS) + 28 });
    return c;
  });
  reveal(labels, LINE + 1.1, { y: 14, blur: 6, st: 0.07 });
  conceal(labels, LINE + 3.65, { y: 10, st: 0.01 });

  // ════════════════════════════════════════════════════════════════════════
  // 10 · THE MIDDLE SCREEN OPENS INTO REAL LIFE  (≈48.2 → 53.6)
  // ════════════════════════════════════════════════════════════════════════
  const OPEN = LINE + 4.0;
  [l0, l1, l3, pA].forEach((p, i) => {
    const x = [LX[0], LX[1], LX[3], LX[4]][i];
    tl.to(p, { x: x * 1.6, scale: LS * 0.9, opacity: 0, duration: 0.9, ease: "power3.in" }, OPEN - 0.05 + Math.abs(x) / 3000);
  });
  const photoCard = el("div", "", `<img src="${A}family-neighborhood.webp" alt=""><div class="face"><img src="${A}clover.webp" alt=""></div>`, L.top);
  photoCard.id = "photo";
  const winAt = (w, h, r, y = 0) => ({ width: w, height: h, marginLeft: -w / 2, marginTop: -h / 2 + y, borderRadius: r });
  const CW = 960, CH = 640, CY = -110;
  tl.set(photoCard, { ...winAt(393 * 0.6, 852 * 0.6, 55 * 0.6, LY), opacity: 0 }, 0);
  tl.to(photoCard, { opacity: 1, duration: 0.35 }, OPEN);
  tl.set(l2, { opacity: 0 }, OPEN + 0.36);
  tl.to(photoCard, { ...winAt(CW, CH, 40, CY), duration: 1.2, ease: "expo.inOut" }, OPEN + 0.3);
  cue(OPEN + 0.3, "open");
  const pimg = $("img", photoCard), face = $(".face", photoCard);
  tl.fromTo(pimg, { scale: 1.14 }, { scale: 1.02, duration: 5.6, ease: "sine.out" }, OPEN);
  const pt = el("div", "ptext2", `<span class="line">${words("Less in your head.")}</span><span class="line">${words("More life *together.*")}</span>`, L.top);
  pt.style.top = H / 2 + CY + CH / 2 + 90 + "px";
  const pl = $$(".line", pt);
  reveal($$(".w", pl[0]), OPEN + 1.35, { st: 0.08 });
  reveal($$(".w", pl[1]), OPEN + 2.5, { st: 0.08 });
  cue(OPEN + 1.35, "text"); cue(OPEN + 2.5, "text");

  // ════════════════════════════════════════════════════════════════════════
  // 11 · IT FOLDS INTO THE ICON: end card  (≈53.6 → 60)
  // ════════════════════════════════════════════════════════════════════════
  const FOLD = OPEN + 5.35;
  conceal($$(".w", pt), FOLD - 0.4, { st: 0.015 });
  tl.to(photoCard, { ...winAt(240, 240, 54, 0), duration: 1.1, ease: "expo.inOut" }, FOLD);
  tl.fromTo(face, { opacity: 0 }, { opacity: 1, duration: 0.45, ease: "power1.inOut" }, FOLD + 0.45);
  tl.fromTo($("img", face), { scale: 0.7, rotation: -20 }, { scale: 1, rotation: 0, duration: 1.4, ease: SP.lively }, FOLD + 0.55);
  tl.to(photoCard, { boxShadow: "0 0 0 1px rgba(120,100,90,.08), 0 40px 70px -30px rgba(40,50,40,.35), 0 12px 24px -12px rgba(40,50,40,.2)", duration: 0.6 }, FOLD + 0.7);
  cue(FOLD, "fold");
  const END = FOLD + 1.25;
  tl.to(photoCard, { marginTop: -120 - 230, duration: 1.3, ease: SP.soft }, END);
  const wm2 = el("div", "wordmark center", "Sprout".split("").map((c) => `<span class="w">${c}</span>`).join(""), L.top);
  wm2.style.cssText += "top:50%;margin-top:-80px;font-size:124px";
  const endLine = el("div", "tagline center", words("The superapp for parents."), L.top);
  endLine.style.cssText += "top:50%;margin-top:70px;font-size:40px";
  const endCta = el("div", "tagline center", words("Download Sprout today."), L.top);
  endCta.style.cssText += "top:50%;margin-top:190px;font-size:30px";
  const badges = el("div", "center badges", `<img src="${A}app-store.png" alt="Download on the App Store"><img src="${A}play-store.png" alt="Get it on Google Play">`, L.top);
  badges.style.cssText += "top:50%;margin-top:250px";
  const url = el("div", "center url", "joinsprout.co", L.top);
  url.style.cssText += "top:50%;margin-top:360px;font-size:28px";
  reveal($$(".w", wm2), END + 0.1, { y: 60, blur: 10, st: 0.05, ease: SP.lively });
  reveal($$(".w", endLine), END + 0.6, { y: 20, blur: 8, st: 0.06 });
  reveal($$(".w", endCta), END + 1.0, { y: 20, blur: 8, st: 0.05 });
  reveal([...badges.children], END + 1.25, { y: 24, blur: 6, st: 0.1 });
  reveal(url, END + 1.55, { y: 14, blur: 6 });
  cue(END + 0.1, "resolve");

  // ── wire up ────────────────────────────────────────────────────────────
  tl.seek(0, false);
  applyTracks(0);
  function seek(t) {
    t = Math.max(0, Math.min(DURATION, t));
    tl.seek(t, false);
    applyTracks(t);
    for (const h of hooks) h(t);
  }
  window.DURATION = DURATION;
  window.MARKERS = MARKERS.sort((a, b) => a.t - b.t);
  window.seek = seek;
  window.setScale = (s) => { K = s; };
  seek(0);
  window.__ready = true;
  document.dispatchEvent(new Event("film-ready"));
})().catch((e) => { console.error(e); window.__error = String((e && e.stack) || e); });
