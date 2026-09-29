/* Section 5 · Families. A card, the directory, Amanda's profile and her photo opening
   (Tony's screenshots of the live app), one line. */
window.SproutSeg[5] = async (f) => {
  const { $, $$, tl, SP, card, app, cam, showApp, hideApp, tap, swap, settle, where, cue, endCard, loaded } = f;

  card(["Who’s that mom", "*at pickup?*"], 0.25, 2.3);

  const p = app("pA", ["clubs", "profile"], "clubs", "clubs");
  await loaded(p);
  const clubs = $('[data-s="clubs"]', p), prof = $('[data-s="profile"]', p), nav = $(".sa-nav", p);
  const U = 2.6;
  const dir = where(p, $(".cl-dir", clubs));
  showApp(p, U, 196.5, dir.y + 60, 2.8);
  settle([...$$(".cl-comms > span", clubs), $(".cl-chips", clubs), $(".cl-dir", clubs), ...$$(".cl-mem", clubs), nav], U + 0.05, { st: 0.04 });
  const amanda = $('[data-member="amanda"]', clubs);
  const am = where(p, amanda);
  cam(p, U + 0.9, 0.8, 196.5, am.cy + 40, 3.0);
  const TAP = U + 1.9;
  tap(TAP, amanda);
  swap(p, "clubs", "profile", TAP + 0.12);
  tl.to(nav, { y: 150, opacity: 0, duration: 0.45, ease: "power3.in" }, TAP + 0.12);
  settle([$(".photo", prof), $(".name", prof), $(".sub", prof), ...$$(".kid", prof), ...$$(".rule, h4", prof), ...$$(".chip", prof), $(".empty", prof), $(".none", prof), $(".msg", prof)], TAP + 0.2, { st: 0.03, y: 18 });
  // her photo and name, the kids, her interests
  cam(p, TAP + 0.25, 0.9, 196.5, 215, 3.0);
  const kids = where(p, $(".kids", prof));
  cam(p, TAP + 1.6, 0.8, 196.5, kids.cy, 3.4);
  const chips = where(p, $(".chips", prof));
  cam(p, TAP + 2.7, 0.8, 196.5, chips.cy, 2.9);
  // tap the photo: it opens to the full width and the page dims
  cam(p, TAP + 3.7, 0.7, 196.5, 330, 2.8);
  const photo = $(".photo", prof), dim = $(".dim", prof);
  const OPEN = TAP + 4.5;
  tap(OPEN, photo, { press: null });
  tl.to(photo, { left: 14.5, top: 98, width: 364, height: 364, duration: 0.75, ease: SP.soft }, OPEN + 0.05);
  tl.to(dim, { opacity: 1, duration: 0.35 }, OPEN + 0.05);
  cam(p, OPEN + 0.05, 0.9, 196.5, 300, 2.8);
  cue(OPEN, "photo");
  const OUT = OPEN + 2.1;
  hideApp(p, OUT);

  card(["Know", "*the families.*"], OUT + 0.3, OUT + 2.3);
  return OUT + 2.6;
};
