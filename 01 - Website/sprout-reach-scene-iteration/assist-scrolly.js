/* Website v3, option B (25 Nov, Ahmad): the three Assist happy paths (Playdate, Babysitter, Carpool) told by scrolling,
   three key steps each. Layout "tiles as chapters": the clay tiles are the chapter picker, one big line says the
   current step, the phone on the right runs the real Assist prototype (vendor/assist-story/runtime.html).
   Scroll-locked, nothing plays on its own:
   - every tap sits at a fixed point of the scroll; crossing it taps the prototype's own button (fast pace, so the
     reply is there at once), scrolling back above it rebuilds the flow up to that point;
   - between taps, the chat inside the phone scrolls in proportion to the page scroll, from where it is to the next
     button, so the phone moves exactly as much as the visitor scrolls;
   - the noise Ahmad flagged is hidden in this copy only: the "Texted… / Posted…" status lines and the long outgoing
     message previews. The replies people send back stay.
   Reduced motion: no pin, every flow shows its finished state. */
(() => {
  const sec = document.querySelector("[data-scrolly]");
  if (!sec) return;
  const pin = sec.querySelector(".sly-pin"), film = sec.querySelector(".film");
  const tiles = [...sec.querySelectorAll("[data-flow]")];
  const cap = sec.querySelector("[data-step-cap]"), dots = [...sec.querySelectorAll("[data-step-dots] i")];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const clamp01 = (v) => Math.min(1, Math.max(0, v));

  /* Ahmad, 25 Nov: all three tiles stay on screen, but only the carpool plays for now (Playdate and Babysitter are
     kept below, ready to switch back on by adding them to FLOWS with their tile index). */
  const FLOWS = [
    { tile: 2, kind: "carpool", echo: "Set up a carpool", steps: [
      { cap: "One ride, Saturday at 9:30.", taps: [["button", "^One time$"], ["button", "^Next$"]] },
      { cap: "From home to soccer, one way.", taps: [['[data-k="home"]', ""], ['[data-k="soccer"]', ""], [".ua-row", "^One way"]] },
      { cap: "Ask Jake’s team. Priya said yes.", taps: [["button", "^Post in "]], result: [".card", "drives Jake"] }] },
  ];
  /* parked: { tile: 0, kind: "playdate", echo: "Plan a playdate", steps: [
       { cap: "Maya, Saturday 2–4 PM, at our place.", taps: [["button", "^Next$"]] },
       { cap: "Pick Lily’s parents and send it.", taps: [[".pg-t", "Ana and Ben"], ["button", "^Message Ana"]] },
       { cap: "They said yes. The playdate is set.", taps: [], result: [".bub", "It’s set"] }] },
     { tile: 1, kind: "sitterC1", echo: "Book a sitter", steps: [
       { cap: "Tonight, 6–10 PM, for Maya and Jake.", taps: [["button", "^Next$"], ["button", "^Next ·"], ["button", "^Looks right"]] },
       { cap: "Sprout texts your sitters. Alex and Sam can do it.", taps: [["button", "^Ask Alex"]] },
       { cap: "Book Alex. Sam gets a thank-you.", taps: [["button", "^Book Alex"]], result: [".card", "Alex is booked"] }] } */
  // the timeline: each step owns an equal stretch of the scroll; its taps are spread evenly across it
  const STEPS = FLOWS.flatMap((f, fi) => f.steps.map((s, si) => ({ ...s, fi, si })));
  const N = STEPS.length;
  FLOWS.forEach((f, fi) => {
    f.taps = [];
    STEPS.forEach((s, k) => { if (s.fi !== fi) return; s.taps.forEach((t, j) => f.taps.push({ sel: t[0], re: t[1], at: (k + 0.08 + (j + 1) / (s.taps.length + 1) * 0.84) / N })); });
    f.start = STEPS.findIndex((s) => s.fi === fi) / N;
    f.end = (STEPS.findLastIndex((s) => s.fi === fi) + 1) / N;
    f.result = f.steps[f.steps.length - 1].result;
  });

  const ring = document.createElement("span");
  ring.className = "sly-tap";
  film.appendChild(ring);
  const fit = () => film.style.setProperty("--app-scale", String(film.clientWidth / 393));
  new ResizeObserver(fit).observe(film);
  fit();

  /* one live prototype per flow, made when needed */
  const S = FLOWS.map(() => ({ iframe: null, plan: null, applied: 0, want: 0, busy: false, base: 0, gen: 0 }));
  const control = (plan, sel, re) => {
    const r = re && new RegExp(re, "i");
    return [...plan.chat.querySelectorAll(sel)].reverse().find((el) => !el.disabled && el.style.pointerEvents !== "none" && !el.closest("[hidden]") &&
      el.getBoundingClientRect().height > 0 && (!r || r.test(el.textContent.trim())));
  };
  const appear = async (st, gen, sel, re) => {
    for (let n = 0; n < 160; n++) { if (st.gen !== gen) return null; const el = st.plan && control(st.plan, sel, re); if (el) return el; await wait(25); }
    return null;
  };
  function open(fi) {
    const st = S[fi], f = FLOWS[fi], gen = ++st.gen;
    st.iframe?.remove();
    st.plan = null; st.applied = 0;
    const iframe = document.createElement("iframe");
    iframe.title = `Sprout Assist: ${f.echo}`;
    iframe.tabIndex = -1; iframe.inert = true;
    iframe.style.visibility = "hidden";
    if (fi !== active) iframe.style.display = "none";
    iframe.src = "./vendor/assist-story/runtime.html";
    film.insertBefore(iframe, ring);
    st.iframe = iframe;
    iframe.onload = () => {
      if (st.gen !== gen) return;
      const win = iframe.contentWindow, app = win.Sprout;
      if (!app?.flows?.[f.kind]) { console.error("Assist story: runtime unavailable"); return; }
      const css = win.document.createElement("style");
      css.textContent = `.sheet{transition:none}.chat{scroll-behavior:auto;overflow-anchor:none}#toast{display:none}
        .row.indent>.status,.row.indent>.preview:not(.sms-in):not(.in),.card>.preview{display:none!important}`;
      win.document.head.append(css);
      app.pace(0.02);
      const plan = app.makePlan(f.kind, { title: f.echo, sub: f.echo, icon: "calendar-check" });
      plan.scroll = () => {};               // the page decides where the chat is
      app.showPlan(plan); app.openSheet(); plan.me(f.echo);
      app.flows[f.kind](plan).catch((e) => console.error("Assist story flow", e));
      st.plan = plan;
      sync(fi);
    };
  }
  async function sync(fi) {
    const st = S[fi], f = FLOWS[fi];
    if (st.busy || !st.plan) return;
    st.busy = true;
    try {
      while (st.plan && st.applied < st.want) {
        const gen = st.gen, t = f.taps[st.applied];
        const el = await appear(st, gen, t.sel, t.re);
        if (!el || st.gen !== gen) break;
        if (fi === active && !reduce) await pulse(el);
        el.click();
        st.applied++;
        await wait(60);
      }
      if (st.plan && st.applied === f.taps.length && f.result) await appear(st, st.gen, f.result[0], f.result[1]);
      if (st.plan) { st.base = st.plan.chat.scrollTop; st.iframe.style.visibility = ""; }
    } finally { st.busy = false; }
    if (st.applied < st.want) sync(fi); else draw();
  }
  async function pulse(el) {
    place(el);
    ring.classList.remove("go"); void ring.offsetWidth; ring.classList.add("go");
    await wait(160);
  }
  function place(el) {
    const k = film.clientWidth / 393, r = el.getBoundingClientRect();
    ring.style.left = `${(r.left + r.width / 2) * k}px`; ring.style.top = `${(r.top + r.height / 2) * k}px`;
    ring.style.width = `${(r.width + 10) * k}px`; ring.style.height = `${(r.height + 10) * k}px`;
  }

  let active = -1, p = 0;
  const range = () => Math.max(1, sec.offsetHeight - pin.offsetHeight);
  const progress = () => reduce ? 1 : clamp01((parseFloat(getComputedStyle(pin).top) - sec.getBoundingClientRect().top) / range());
  function draw() {
    const fi = active, st = S[fi], f = FLOWS[fi];
    if (!st?.plan || st.busy || st.applied !== st.want) { ring.classList.remove("show"); return; }
    const chat = st.plan.chat;
    // where we are between the last tap and the next one
    const next = f.taps[st.applied];
    const from = st.applied ? f.taps[st.applied - 1].at : f.start, to = next ? next.at : Math.min(f.end, f.start + (f.end - f.start) * 0.9);
    const t = clamp01((p - from) / Math.max(1e-4, to - from));   // linear: the chat moves exactly with the page
    const target = next ? control(st.plan, next.sel, next.re) : f.result && control(st.plan, f.result[0], f.result[1]);
    if (!target) return;
    const box = chat.getBoundingClientRect(), r = target.getBoundingClientRect();
    const max = chat.scrollHeight - chat.clientHeight;
    const goal = Math.min(max, Math.max(0, chat.scrollTop + (r.top - box.top) - (next ? box.height * 0.56 - r.height / 2 : 14)));
    chat.scrollTop = st.base + (goal - st.base) * t;
    if (next && t > 0.55) { place(target); ring.classList.add("show"); } else ring.classList.remove("show");
  }
  function frame() {
    p = progress();
    const k = Math.min(N - 1, Math.floor(p * N));
    const step = STEPS[k], fi = step.fi;
    if (fi !== active) {
      active = fi;
      S.forEach((st, i) => { if (st.iframe) st.iframe.style.display = i === fi ? "" : "none"; });
      tiles.forEach((el, i) => { el.classList.toggle("on", i === FLOWS[fi].tile); el.setAttribute("aria-pressed", String(i === FLOWS[fi].tile)); });
      sec.dataset.flow = FLOWS[fi].kind;
    }
    if (cap.dataset.k !== String(k)) { cap.dataset.k = String(k); cap.classList.remove("in"); void cap.offsetWidth; cap.textContent = step.cap; cap.classList.add("in"); }
    dots.forEach((d, i) => { d.classList.toggle("on", i === step.si); d.classList.toggle("done", i < step.si); });
    FLOWS.forEach((f) => tiles[f.tile]?.style.setProperty("--fill", String(clamp01((p - f.start) / (f.end - f.start)))));
    // each flow wants every tap at or above the scroll; the neighbours get ready too
    FLOWS.forEach((f, i) => {
      if (Math.abs(i - fi) > 1 && !S[i].iframe) return;
      const want = f.taps.filter((t) => t.at <= p).length, st = S[i];
      if (!st.iframe || want < st.applied) { st.want = want; open(i); return; }
      if (want !== st.want) { st.want = want; sync(i); }
    });
    draw();
  }
  FLOWS.forEach((f) => tiles[f.tile]?.addEventListener("click", () => {
    scrollTo({ top: sec.offsetTop + range() * (f.start + 0.2 / N) - parseFloat(getComputedStyle(pin).top) + 1, behavior: "smooth" });
  }));
  let ticking = false, started = false;
  const tick = () => { if (ticking) return; ticking = true; requestAnimationFrame(() => { ticking = false; if (started) frame(); }); };
  new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting && !started) { started = true; frame(); } }), { rootMargin: "800px 0px" }).observe(sec);
  addEventListener("scroll", tick, { passive: true });
  addEventListener("resize", () => { fit(); tick(); });
})();
