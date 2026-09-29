/* Section 3 · Sprout Assist. The spoken sentence is its own card, never on top of the app. */
window.SproutSeg[3] = async (f) => {
  const { $, $$, tl, SP, card, app, matt, cam, showApp, hideApp, tap, swap, settle, cls, text, attr, where, cue, hooks, endCard, loaded, reveal, conceal, el, words, A } = f;

  card(["Too busy to type?", "*Just say it.*"], 0.25, 3.9);

  const p = app("pA", ["home", "listen", "review", "set"], "home", "assist");
  await loaded(p);
  const home = $('[data-s="home"]', p), listen = $('[data-s="listen"]', p), review = $('[data-s="review"]', p), setS = $('[data-s="set"]', p), nav = $(".sa-nav", p);
  const U1 = 4.35;
  const rows = where(p, $(".sa-rows", home));
  showApp(p, U1, 196.5, rows.y + 70, 2.8);
  settle([$(".sa-tile.logo", home), $("h3", home), $(".pick", home), ...$$(".sa-row", home), nav], U1 + 0.05, { st: 0.045 });
  const rem = $('[data-pick="reminder"]', home);
  const TAPR = U1 + 1.1;
  tap(TAPR, rem);
  swap(p, "home", "listen", TAPR + 0.15);
  tl.to(nav, { y: 150, opacity: 0, duration: 0.45, ease: "power3.in" }, TAPR + 0.15);
  settle([$(".sa-head", listen), $(".sa-tile.icon", listen), $(".sa-say", listen), $(".sa-need", listen)], TAPR + 0.25, { st: 0.06 });
  const say = where(p, $(".sa-say", listen));
  cam(p, TAPR + 0.35, 1.0, 196.5, say.cy - 20, 3.0);
  const orb = window.SproutThinkingOrb.create($(".sa-thinking-orb", listen), { state: "listening", pixelScale: 3 });
  hooks.push((t) => orb && orb.drawAt(t));
  const OUT1 = TAPR + 1.8;
  hideApp(p, OUT1);

  // what she says, on its own
  const Q0 = OUT1 + 0.3;
  const qc = el("div", "tcard", `<p class="quote">${words("“Remind my husband to pick up Presley from school at 2 PM today.”")}</p>`);
  qc.style.cssText += "top:50%;transform:translateY(-50%)";
  const qw = $$(".w", qc);
  qw.forEach((w, i) => {
    tl.fromTo(w, { y: 30, opacity: 0, filter: "blur(10px)" }, { y: 0, opacity: 1, filter: "blur(0px)", duration: 0.5, ease: "power3.out" }, Q0 + i * 0.2);
    cue(Q0 + i * 0.2, "word", { i });
  });
  const Q1 = Q0 + qw.length * 0.2 + 0.9;
  conceal(qw, Q1, { st: 0.01 });

  // heard: the check wakes up, she taps it, the reminder fills itself in
  const U2 = Q1 + 0.35;
  cls(U2 - 0.1, listen, "is-heard");
  const chk = where(p, $(".sa-check", listen));
  showApp(p, U2, chk.cx - 60, chk.cy, 3.4);
  tl.fromTo($(".sa-check .pulse", listen), { opacity: 0.9, scale: 1 }, { opacity: 0, scale: 1.5, duration: 1.0, ease: "power2.out", repeat: 1 }, U2 + 0.2);
  cue(U2 + 0.2, "heard");
  const CHECK = U2 + 1.0;
  tap(CHECK, $(".sa-check", listen));
  swap(p, "listen", "review", CHECK + 0.15);
  const fld = where(p, $(".sa-field", review));
  cam(p, CHECK + 0.2, 0.9, 196.5, fld.y + 110, 2.8);
  settle([$(".sa-head", review), $(".sa-field", review), ...$$(".sa-when .f", review), $(".sa-when .opt", review), $(".sa-who .l", review), ...$$(".sa-who button", review), $(".sa-cta", review)], CHECK + 0.25, { st: 0.035 });
  const fields = { what: $('[data-f="what"]', review), day: $('[data-f="day"]', review), time: $('[data-f="time"]', review) };
  tl.set(Object.values(fields), { opacity: 0 }, 0);
  ["what", "day", "time"].forEach((k, i) => {
    const t = CHECK + 0.75 + i * 0.35;
    tl.fromTo(fields[k], { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.45, ease: "power2.out", immediateRender: false }, t);
    cue(t, "land", { i });
  });
  const who = $('[data-who="spouse"]', review);
  const WHO = CHECK + 1.9;
  attr(WHO, who, "aria-pressed", "true");
  tl.fromTo(who, { scale: 1 }, { scale: 1.08, duration: 0.14, ease: "power2.out", immediateRender: false }, WHO);
  tl.to(who, { scale: 1, duration: 0.6, ease: SP.bouncy }, WHO + 0.14);
  cue(WHO, "land", { i: 3 });
  const cta = where(p, $(".sa-cta", review));
  cam(p, WHO + 0.4, 0.8, 196.5, cta.cy - 170, 2.8);
  const SET = WHO + 1.35;
  tap(SET, $(".sa-cta", review));
  swap(p, "review", "set", SET + 0.15);
  const ring = where(p, $(".ring", setS));
  cam(p, SET + 0.2, 0.9, 196.5, ring.cy + 70, 3.3);
  tl.fromTo($(".ring", setS), { scale: 0 }, { scale: 1, duration: 1.2, ease: SP.bouncy }, SET + 0.3);
  settle([$("h3", setS), $(".msg", setS)], SET + 0.45, { st: 0.08 });
  cue(SET + 0.3, "success");
  const OUT2 = SET + 1.9;
  hideApp(p, OUT2);



  // Matt's Daily Brief: the push, then the to-do in his list
  const m = matt("pM");
  await loaded(m);
  const U3 = OUT2 + 0.45;
  showApp(m, U3, 196.5, 330, 2.8);
  const note = $(".sp-note", m);
  const NOTE = U3 + 0.45;
  tl.fromTo(note, { yPercent: -170 }, { yPercent: 0, duration: 1.1, ease: SP.lively }, NOTE);
  cue(NOTE, "ding");
  tl.to(note, { yPercent: -170, duration: 0.5, ease: "power3.in" }, NOTE + 1.35);
  const mtNew = $(".mt-new", m), mtAtt = $(".mt-att", m), newTodo = $(".mt-new .db-todo", m);
  const newH = $(".mt-new > div", m).offsetHeight;
  const LAND = NOTE + 1.6;
  const attM = where(m, mtAtt);
  cam(m, LAND - 0.2, 0.9, 196.5, attM.cy + 30, 3.0);
  cls(LAND, mtAtt, "has-new");
  tl.fromTo(mtNew, { height: 0 }, { height: newH, duration: 0.75, ease: "power3.out" }, LAND);
  tl.fromTo(newTodo, { backgroundColor: "rgba(226,233,227,1)" }, { backgroundColor: "rgba(226,233,227,0)", duration: 2.0, ease: "power1.in" }, LAND + 0.3);
  tl.fromTo($(".mt-ring", m), { "--p": 1 }, { "--p": 0.75, duration: 0.6, ease: "power2.out" }, LAND + 0.1);
  text(LAND + 0.1, $(".mt-count", m), "3/4");
  text(LAND + 0.1, $(".mt-sub", m), "1 new from Lydia.");
  cue(LAND, "land2");
  const OUT3 = LAND + 2.0;
  hideApp(m, OUT3);

  card(["Say it once.", "It lands in", "*their Daily Brief.*"], OUT3 + 0.3, OUT3 + 2.7);
  return OUT3 + 3.0;
};
