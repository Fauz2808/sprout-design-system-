/* Section 4 · Class Group Chat. A card, then the thing it names: the chat list, the class
   chat, the calendar, the teacher emails, the links. Each screen holds long enough to read. */
window.SproutSeg[4] = async (f) => {
  const { $, $$, tl, SP, card, app, cam, showApp, hideApp, tap, swap, settle, cls, where, cue, hooks, endCard, loaded } = f;

  card(["Every class,", "*in one place.*"], 0.25, 2.75);

  const p = app("pA", ["chatlist", "group"], "chatlist", "chat");
  await loaded(p);
  const list = $('[data-s="chatlist"]', p), group = $('[data-s="group"]', p), nav = $(".sa-nav", p);
  const U1 = 3.05;
  showApp(p, U1, 196.5, 250, 2.8);
  settle([$(".hd", list), ...$$(".g", list), $(".dms .t", list), ...$$(".dm", list), nav], U1 + 0.05, { st: 0.03, y: 20 });
  // someone typing in Kindergarten, then a message lands in First Grade (Figma 12758:106526, :106672)
  const typing = $('[data-g="kinder"] .bub', list), newMsg = $('[data-g="first"] .bub', list);
  tl.set([typing, newMsg], { opacity: 0 }, 0);
  const TY = U1 + 0.8;
  const kg = where(p, $('[data-g="kinder"]', list));
  cam(p, TY - 0.2, 0.9, kg.cx - 40, kg.y + 40, 3.4);
  tl.fromTo(typing, { opacity: 0, scale: 0.6, y: 8 }, { opacity: 1, scale: 1, y: 0, duration: 0.6, ease: SP.lively, immediateRender: false }, TY);
  hooks.push((t) => $$("i", typing).forEach((d, i) => { d.style.opacity = (0.35 + 0.65 * Math.max(0, Math.sin((t - TY) * 7 - i * 0.9))).toFixed(3); }));
  tl.to(typing, { opacity: 0, scale: 0.7, duration: 0.25, ease: "power2.in" }, TY + 1.05);
  cue(TY, "typing");
  const fg = where(p, $('[data-g="first"]', list));
  cam(p, TY + 0.9, 0.8, fg.cx + 60, fg.y + 40, 3.4);
  tl.fromTo(newMsg, { opacity: 0, scale: 0.6, y: 10 }, { opacity: 1, scale: 1, y: 0, duration: 0.8, ease: SP.lively, immediateRender: false }, TY + 1.15);
  cue(TY + 1.15, "pop");
  // "Chat with the whole class." gets its own card, then the tap into Miss Taylor Class
  const OUT0 = TY + 2.3;
  hideApp(p, OUT0);
  card(["Chat with", "*the whole class.*"], OUT0 + 0.3, OUT0 + 2.3);
  const mt = $('[data-g="mt"] .av', list);
  const mtr = where(p, mt);
  const U2 = OUT0 + 2.6;
  showApp(p, U2, mtr.cx, mtr.cy + 60, 3.1);
  const IN = U2 + 1.1;
  tap(IN, mt);
  swap(p, "chatlist", "group", IN + 0.12);
  tl.to(nav, { y: 150, opacity: 0, duration: 0.45, ease: "power3.in" }, IN + 0.12);
  const panels = Object.fromEntries($$(".panel", group).map((x) => [x.dataset.p, x]));
  const tabs = Object.fromEntries($$(".tab", group).map((x) => [x.dataset.tab, x]));
  for (const k of Object.keys(panels)) tl.set(panels[k], { autoAlpha: k === "chat" ? 1 : 0 }, 0);
  const setG = (t, k) => { for (const [n, b] of Object.entries(tabs)) cls(t, b, "on", n === k); };
  setG(0, "chat");
  settle([$(".hd", group), ...$$('[data-p="chat"] .bb, [data-p="chat"] .mine', group), $(".typebar", group)], IN + 0.2, { st: 0.06, y: 18 });
  cam(p, IN + 0.3, 1.0, 196.5, 330, 2.8);
  cam(p, IN + 1.4, 2.4, 196.5, 540, 2.8, "sine.inOut");
  // 29 Sep: the conversation (the join page's example chat) is taller than the panel, so the
  // chat scrolls up like a real one while the camera holds at the bottom, until the teacher's
  // reply to Jen sits just above the type bar. Longer hold, so every message can be read.
  const scroll = $('[data-p="chat"] .scroll', group), chatPanel = panels.chat;
  const room = chatPanel.clientHeight - $(".typebar", group).offsetHeight - 12;
  const over = Math.max(0, scroll.scrollHeight - room);
  if (over) tl.fromTo(scroll, { y: 0 }, { y: -over, duration: 3.4, ease: "sine.inOut", immediateRender: false }, IN + 4.0);
  let OUT = IN + (over ? 8.6 : 3.9);
  hideApp(p, OUT);

  // the other three tabs: the card first, then the tab
  const PARTS = [
    ["calendar", ["One calendar", "*the class shares.*"], 360],
    ["updates", ["Teacher emails,", "*in one feed.*"], 380],
    ["links", ["Important links,", "*pinned.*"], 400],
  ];
  let prev = "chat";
  for (const [k, h, py] of PARTS) {
    card(h, OUT + 0.3, OUT + 2.05);
    const U = OUT + 2.3;
    showApp(p, U, 196.5, 330, 2.8);
    const T = U + 0.55;
    tap(T, tabs[k]);
    setG(T + 0.02, k);
    tl.to(panels[prev], { autoAlpha: 0, x: -30, duration: 0.3, ease: "power2.in" }, T + 0.02);
    tl.fromTo(panels[k], { autoAlpha: 0, x: 36 }, { autoAlpha: 1, x: 0, duration: 0.55, ease: "power3.out", immediateRender: false }, T + 0.1);
    settle($$(".cal, .note-card, .notes .hr, .up, .ups .hr, .lk, .lks .hr, .addlink, .fn", panels[k]), T + 0.12, { st: 0.05, y: 16 });
    cue(T, "tab");
    cam(p, T + 0.4, 1.8, 196.5, py + 90, 2.8, "sine.inOut");
    prev = k;
    OUT = U + 2.6;
    hideApp(p, OUT);
  }

  return OUT + 0.45;
};
