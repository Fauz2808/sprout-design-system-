/* The engine behind the Sprout launch film.

   Grammar (Tony, 28 Sep, after Muse): a text card owns the screen, or the app does. Never
   both. The app is shown full bleed, no phone frame, at 2.8× or closer, and a camera moves
   across it.

   Pacing (Tony, 29 Sep: "I could barely even speak it out loud before it was changing"):
   every card holds until it can be read aloud with a second to spare, then a beat of nothing, then the
   app. card() enforces this on its own: when a card needs more time than its section
   gave it, everything after that moment slides later (see M() below), so a section never
   has to be retimed by hand.

   The film is a run of sections (episodes/segN.js, each window.SproutSeg[N]). A section
   is written in its own local seconds from 0; run() places it after the previous one.
   One paused GSAP timeline holds everything; window.seek(t) puts the stage at exactly t,
   so tools/render.mjs can photograph any frame. */
window.SproutFilm = async function (build) {
  const { phone, mattPhone, phi, A, PH } = window.SproutScreens;
  const W = 1080, H = 1920;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const stage = $("#stage");
  const L = { bg: $("#bg"), noise: $("#noise"), world: $("#world"), type: $("#type"), fx: $("#fx"), top: $("#top") };
  const loaded = (root) => Promise.all([...root.querySelectorAll("img")].map((i) => i.decode().catch(() => {})));

  function spring(zeta) {
    const wd = Math.sqrt(1 - zeta * zeta), D = 6.9 / zeta;
    return (p) => (p >= 1 ? 1 : 1 - Math.exp(-zeta * p * D) * (Math.cos(wd * p * D) + (zeta / wd) * Math.sin(wd * p * D)));
  }
  const SP = { bouncy: spring(0.5), lively: spring(0.62), soft: spring(0.78) };

  // ── time: a section's local seconds → film seconds ──────────────────────
  // OFF is where the current section starts; SHIFTS are the extra holds card() inserted
  // (local time, seconds). A local time at or after a shift point moves later by it.
  // Position 0 stays at film 0: it means "the state before anything happens".
  let OFF = 0;
  let SHIFTS = [];
  const M = (t) => { if (t === 0) return 0; let s = 0; for (const [p, d] of SHIFTS) if (t >= p - 1e-6) s += d; return OFF + t + s; };
  const TL = gsap.timeline({ paused: true });
  const tl = {
    to: (a, v, t) => TL.to(a, v, M(t)),
    fromTo: (a, f, v, t) => TL.fromTo(a, f, v, M(t)),
    set: (a, v, t) => TL.set(a, v, M(t)),
  };
  const MARKERS = [];
  const cue = (t, type, extra = {}) => MARKERS.push({ t: +M(t).toFixed(3), type, ...extra });
  const realHooks = [];
  // a hook sees its own section's local time; time stands still inside a hold
  const hooks = {
    push(fn) {
      const off = OFF, shifts = SHIFTS.map((s) => s.slice());
      realHooks.push((ft) => {
        let t = ft - off;
        for (const [p, d] of shifts) { if (t >= p + d) t -= d; else if (t >= p) { t = p; break; } }
        fn(t);
      });
    },
  };

  const el = (tag, cls, html = "", parent = L.type) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    e.innerHTML = html;
    parent.appendChild(e);
    return e;
  };
  function words(str) {
    const word = (w) => `<span class="w">${w.replace(/\*([^*]+)\*/g, "<em>$1</em>")}</span>`;
    str = str.replace(/\*([^*]+)\*/g, (_, g) => g.split(/\s+/).map((w) => `*${w}*`).join(" "));
    const out = [];
    for (const m of str.matchAll(/\[([^\]]+)\]\{(\w+)\}|(\S+)/g)) {
      out.push(m[3] ? word(m[3]) : `<span class="k" data-k="${m[2]}">${m[1].split(/\s+/).map(word).join(" ")}</span>`);
    }
    return out.join(" ");
  }
  const lines = (arr) => arr.map((l) => `<span class="line">${words(l)}</span>`).join("");
  const svgIcon = (k) => `<svg viewBox="0 0 256 256"><path d="${PH[k]}"/></svg>`;

  const tracks = [], trackOf = new Map();
  function track(node, key, initial, apply) {
    let per = trackOf.get(node);
    if (!per) trackOf.set(node, (per = {}));
    if (!per[key]) { per[key] = { initial, apply, keys: [], cur: initial }; tracks.push(per[key]); }
    return per[key];
  }
  const keyAt = (tr, t, v) => { tr.keys.push([M(t), v]); tr.keys.sort((a, b) => a[0] - b[0]); };
  const cls = (t, node, name, add = true) => keyAt(track(node, "c:" + name, node.classList.contains(name), (v) => node.classList.toggle(name, v)), t, add);
  const text = (t, node, next) => keyAt(track(node, "html", node.innerHTML, (v) => (node.innerHTML = v)), t, next);
  const attr = (t, node, name, v) => keyAt(track(node, "a:" + name, node.getAttribute(name), (x) => node.setAttribute(name, x)), t, v);
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
    const { y = -34, blur = 12, dur = 0.45, st = 0.015 } = o;
    tl.to(targets, { y: `+=${y}`, opacity: 0, filter: `blur(${blur}px)`, duration: dur, stagger: st, ease: "power2.in" }, t);
  }
  let K = 1;
  function applyTracks(t) {
    for (const tr of tracks) {
      let v = tr.initial;
      for (const [kt, kv] of tr.keys) { if (t >= kt) v = kv; else break; }
      if (v !== tr.cur) { tr.apply(v); tr.cur = v; }
    }
  }
  function measure(t, node) {
    const ft = M(t);
    TL.seek(ft, false);
    applyTracks(ft);
    const s = stage.getBoundingClientRect(), r = node.getBoundingClientRect();
    const out = { x: (r.left - s.left) / K, y: (r.top - s.top) / K, w: r.width / K, h: r.height / K };
    out.cx = out.x + out.w / 2; out.cy = out.y + out.h / 2;
    TL.seek(0, false);
    applyTracks(0);
    return out;
  }

  // ── a text card ─────────────────────────────────────────────────────────
  // Holds until it can be read aloud at a speaking pace, with a second to spare (0.34 s a
  // word + 0.8 s, counted from when the last word has landed), then leaves, then a beat of
  // empty frame before what follows.
  const READ = (n) => 0.34 * n + 0.8;
  const BEAT = 0.3;
  function card(h, t, out, { size = 96, cueType = "text" } = {}) {
    const c = el("div", "tcard", `<h2 class="h1">${lines(h)}</h2>`);
    c.style.cssText += "top:50%";
    $(".h1", c).style.fontSize = size + "px";
    c.style.transform = "translateY(-50%)";
    const ws = $$(".w", c);
    const land = t + 0.07 * ws.length + 0.6;
    const need = READ(ws.length), have = out - land;
    if (need > have) SHIFTS.push([land, need - have]);
    SHIFTS.push([out + 0.46, BEAT]);
    reveal(ws, t, { st: 0.07 });
    conceal(ws, out, { st: 0.012 });
    cue(t, cueType);
    return c;
  }

  // ── the app, full bleed ────────────────────────────────────────────────
  const Z0 = W / 393;
  function app(id, screens, active, tab) {
    const p = phone(id, screens, active, tab);
    p.classList.add("bleed");
    L.world.appendChild(p);
    for (const s of $$(".sa-screen", p)) gsap.set(s, { autoAlpha: s.dataset.s === active ? 1 : 0 });
    gsap.set(p, { opacity: 0 });
    TL.set(p, { opacity: 0 }, 0);
    return p;
  }
  function matt(id) {
    const p = mattPhone(id);
    p.classList.add("bleed");
    L.world.appendChild(p);
    gsap.set(p, { opacity: 0 });
    TL.set(p, { opacity: 0 }, 0);
    return p;
  }
  function where(p, node) {
    const pr = p.getBoundingClientRect(), sc = pr.width / 393, r = node.getBoundingClientRect();
    const o = { x: (r.left - pr.left) / sc, y: (r.top - pr.top) / sc, w: r.width / sc, h: r.height / sc };
    o.cx = o.x + o.w / 2; o.cy = o.y + o.h / 2;
    return o;
  }
  function camPose(px, py, z) {
    const halfW = W / 2 / z, halfH = H / 2 / z;
    const cx = Math.max(halfW, Math.min(393 - halfW, px));
    const cy = Math.max(Math.min(halfH, 426), Math.min(Math.max(852 - halfH, 426), py));
    return { x: -(cx - 196.5) * z, y: -(cy - 426) * z, scale: z };
  }
  const cam = (p, t, dur, px, py, z = Z0, ease = "power3.inOut") => (dur ? tl.to(p, { ...camPose(px, py, z), duration: dur, ease }, t) : tl.set(p, camPose(px, py, z), t));
  function showApp(p, t, px, py, z = Z0) {
    tl.fromTo(p, { ...camPose(px, py, z * 0.9), opacity: 0 }, { ...camPose(px, py, z), opacity: 1, duration: 0.9, ease: "power3.out", immediateRender: false }, t);
    cue(t, "ui");
  }
  const hideApp = (p, t) => { tl.to(p, { opacity: 0, duration: 0.4, ease: "power2.in" }, t); };

  function tap(t, node, { press = node, measureAt = t } = {}) {
    const r = measure(measureAt, node);
    const dot = el("div", "touch", "", L.fx), ring = el("div", "ripple", "", L.fx);
    gsap.set([dot, ring], { x: r.cx, y: r.cy });
    tl.fromTo(dot, { opacity: 0, scale: 1.5 }, { opacity: 1, scale: 1, duration: 0.3, ease: "power2.out" }, t - 0.36);
    tl.to(dot, { scale: 0.78, duration: 0.09, ease: "power2.in" }, t - 0.06);
    tl.to(dot, { scale: 1, opacity: 0, duration: 0.36, ease: "power2.out" }, t + 0.06);
    tl.fromTo(ring, { opacity: 0.8, scale: 0.7 }, { opacity: 0, scale: 2.6, duration: 0.6, ease: "power2.out", immediateRender: false }, t);
    TL.set(ring, { opacity: 0 }, 0);
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

  // ── the brand: icon, Sprout, the line; with badges it is the end card ──
  function brand(t, { out = null, badges: withBadges = false } = {}) {
    const ic = el("div", "appicon", `<img class="clover" src="${A}clover.webp" alt="">`, L.top);
    tl.fromTo(ic, { scale: 0.12, rotation: -14, opacity: 0 }, { scale: 1, rotation: 0, y: -250, duration: 1.4, ease: SP.bouncy }, t);
    tl.fromTo(ic, { opacity: 0 }, { opacity: 1, duration: 0.12, immediateRender: false }, t);
    tl.fromTo($(".clover", ic), { scale: 0.6, rotation: 30 }, { scale: 1, rotation: 0, duration: 1.6, ease: SP.lively }, t + 0.05);
    const wm = el("div", "wordmark center", "Sprout".split("").map((c) => `<span class="w">${c}</span>`).join(""), L.top);
    wm.style.cssText += "top:50%;margin-top:-80px;font-size:124px";
    const tg = el("div", "tagline center", words("The superapp for parents."), L.top);
    tg.style.cssText += "top:50%;margin-top:70px;font-size:40px";
    reveal($$(".w", wm), t + 0.25, { y: 60, blur: 10, st: 0.05, ease: SP.lively });
    reveal($$(".w", tg), t + 0.7, { y: 20, blur: 8, st: 0.06 });
    cue(t, withBadges ? "resolve" : "bloom");
    const parts = [ic, ...$$(".w", wm), ...$$(".w", tg)];
    if (withBadges) {
      const badges = el("div", "center badges", `<img src="${A}app-store.png" alt="Download on the App Store"><img src="${A}play-store.png" alt="Get it on Google Play">`, L.top);
      badges.style.cssText += "top:50%;margin-top:180px";
      const url = el("div", "center url", "joinsprout.co", L.top);
      url.style.cssText += "top:50%;margin-top:290px;font-size:28px";
      reveal([...badges.children], t + 1.05, { y: 24, blur: 6, st: 0.1 });
      reveal(url, t + 1.35, { y: 14, blur: 6 });
      return t + 4.6;
    }
    conceal(parts, out, { st: 0.01 });
    SHIFTS.push([out + 0.46, BEAT]);
    return out + 0.5;
  }
  const endCard = (t) => brand(t, { badges: true });

  // background: two slow washes
  const washA = el("div", "wash", "", L.bg), washB = el("div", "wash", "", L.bg);
  washA.id = "washA"; washB.id = "washB";
  el("div", "", "", L.bg).id = "grain";

  const api = { W, H, A, PH, phi, $, $$, L, SP, tl, el, words, lines, svgIcon, cue, cls, text, attr, hooks, prop, reveal, conceal, measure, where, card, app, matt, cam, camPose, showApp, hideApp, tap, swap, settle, setTab, brand, endCard, loaded, Z0 };
  // run a section starting at film time `at`; returns the film time it ends
  api.run = async (fn, at) => {
    OFF = at; SHIFTS = [];
    const localEnd = await fn(api);
    const end = M(localEnd);
    OFF = 0; SHIFTS = [];
    return end;
  };
  const DURATION = await build(api);
  TL.fromTo(washA, { x: -420, y: -700 }, { x: -120, y: 300, duration: DURATION, ease: "sine.inOut" }, 0);
  TL.fromTo(washB, { x: 380, y: 700 }, { x: 160, y: -300, duration: DURATION, ease: "sine.inOut" }, 0);

  TL.seek(0, false);
  applyTracks(0);
  function seek(t) {
    t = Math.max(0, Math.min(DURATION, t));
    TL.seek(t, false);
    applyTracks(t);
    for (const h of realHooks) h(t);
  }
  window.DURATION = DURATION;
  window.MARKERS = MARKERS.sort((a, b) => a.t - b.t);
  window.seek = seek;
  window.setScale = (s) => { K = s; };
  seek(0);
  window.__ready = true;
  document.dispatchEvent(new Event("film-ready"));
};

// ?ep=full (default): the whole film. ?ep=N: section N alone, then the end card.
window.SproutSeg = window.SproutSeg || {};
window.SproutPlay = (which) => window.SproutFilm(async (f) => {
  // "full" = all five sections; "1,2,3,4" = those sections as one film; "3" = one section
  const order = which === "full" ? [1, 2, 3, 4, 5] : String(which).split(",").map(Number);
  let t = 0;
  for (const n of order) t = await f.run(window.SproutSeg[n], t);
  return f.endCard(t + 0.2);
});
