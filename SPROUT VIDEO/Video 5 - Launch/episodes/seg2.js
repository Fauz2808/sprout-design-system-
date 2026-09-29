/* Section 2 · Daily Brief. A card, the brief full bleed, one line. */
window.SproutSeg[2] = async (f) => {
  const { $, $$, tl, SP, card, app, cam, showApp, hideApp, tap, cls, text, prop, where, settle, cue, endCard, loaded } = f;

  f.card(["Mornings with kids", "are *a lot.*"], 0.25, 2.3);

  const p = app("pA", ["brief"], "brief", "brief");
  await loaded(p);
  const brief = $('[data-s="brief"]', p), dbScroll = $(".db-scroll", brief);
  const UI = 2.6;
  const hello = where(p, $(".db-hello", brief)), wx = $(".wx", brief), att = where(p, $(".db-att", brief));
  showApp(p, UI, 196.5, hello.cy + 40, 2.8);
  settle([...$$(".db-scroll > *", brief), $(".sa-nav", p)], UI + 0.05, { st: 0.035 });
  // the weather first
  // today's weather: a slow push on the greeting and the forecast chip
  cam(p, UI + 1.2, 1.0, 196.5, hello.cy, 2.95);
  tl.fromTo(wx, { scale: 1 }, { scale: 1.1, duration: 0.25, ease: "power2.out", immediateRender: false }, UI + 1.9);
  tl.to(wx, { scale: 1, duration: 0.7, ease: SP.lively }, UI + 2.15);
  // a to-do, done
  cam(p, UI + 2.5, 0.9, 196.5, att.cy, 2.8);
  const todo = $("[data-todo]", brief), ring = $(".att-ring", brief), box = $(".box", todo);
  const DONE = UI + 3.65;
  tap(DONE, box, { press: null });
  cls(DONE + 0.02, todo, "is-done");
  tl.fromTo(ring, { "--p": 0 }, { "--p": 1, duration: 0.7, ease: "power2.out" }, DONE + 0.05);
  text(DONE + 0.1, $(".att-count", brief), "1/1");
  text(DONE + 0.1, $(".att-sub", brief), "Great, you got everything done today.");
  tl.fromTo(box, { scale: 1 }, { scale: 1.14, duration: 0.14, ease: "power2.out", immediateRender: false }, DONE + 0.02);
  tl.to(box, { scale: 1, duration: 0.6, ease: SP.bouncy }, DONE + 0.16);
  cue(DONE, "check");
  // carpool, then what's happening today: the list scrolls under a steady camera
  const secTop = (sel) => where(p, $(sel, dbScroll)).y - where(p, dbScroll).y;
  const yCar = secTop('[data-sec="carpool"]') - 14, yToday = secTop('[data-sec="today"]') - 14;
  const SC1 = DONE + 1.0;
  cam(p, SC1, 1.0, 196.5, 250, 2.8);
  prop(SC1, 1.0, 0, yCar, "power3.inOut", (v) => (dbScroll.scrollTop = v));
  tl.fromTo($(".db-carpool", brief), { scale: 0.94 }, { scale: 1, duration: 1.2, ease: SP.lively, immediateRender: false }, SC1 + 0.7);
  cue(SC1, "whoosh", { soft: 1 });
  const SC2 = SC1 + 1.9;
  prop(SC2, 1.0, yCar, yToday, "power3.inOut", (v) => (dbScroll.scrollTop = v));
  cam(p, SC2, 1.0, 196.5, 300, 2.8);
  $$(".db-tl .card", brief).forEach((c, i) => {
    tl.to(c, { scale: 1.04, duration: 0.22, ease: "power2.out" }, SC2 + 0.9 + i * 0.12);
    tl.to(c, { scale: 1, duration: 0.6, ease: SP.lively }, SC2 + 1.12 + i * 0.12);
  });
  cue(SC2, "whoosh", { soft: 1 });
  const OUT = SC2 + 2.3;
  hideApp(p, OUT);

  card(["Every morning,", "*a plan.*"], OUT + 0.35, OUT + 2.5);
  return OUT + 2.8;
};
