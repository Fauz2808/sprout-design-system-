/* Section 1 · Intro. A card, the pile of notifications with nothing to read over it, two
   cards, the apps behind them, then they fold into the Sprout icon: the brand, once. */
window.SproutSeg[1] = async (f) => {
  const { $$, tl, SP, el, L, card, reveal, cue, svgIcon, endCard, W, H } = f;
  const LOGO = "assets/logos/";

  card(["Every parent knows", "*this feeling.*"], 0.25, 2.2);

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
  const face = (k, cl) => (APPS[k].img ? `<img class="${cl ?? APPS[k].fit}" src="${LOGO}${APPS[k].img}" alt="">` : svgIcon(APPS[k].icon));
  // notifications pile up: nothing to read over them, they are the picture
  const NOTES = [
    [-250, -700, 0, -3, "gmail", "School email", "now", "Picture day is tomorrow. Wear the blue shirt!"],
    [240, -520, 0, 2.5, "whatsapp", "Soccer team", "1m", "Practice moved to 5:30 on Saturday"],
    [-230, -330, 1, 2, "facebook", "1st Grade parents", "2m", "Who’s bringing snacks Friday?"],
    [250, -120, 0, -2, "imessage", "Messages", "3m", "Can someone grab Mia at 3?"],
    [-240, 90, 1, 1, "evite", "Evite", "4m", "RSVP for Kennedy’s birthday by Friday"],
    [230, 300, 0, -1.5, "partiful", "Partiful", "5m", "Playdate at Zilker Park, Saturday 10 AM"],
    [-260, 520, 1, 3, "notes", "Notes", "6m", "Bring towels for water day"],
    [270, 720, 2, -3, "pta", "PTA website", "8m", "Spirit night at Mandola’s on Thursday"],
    [-280, 880, 2, 2, "school", "School website", "9m", "No school Monday"],
    [300, -860, 2, -2, "paper", "Fridge calendar", "12m", "Field trip Friday, circled in red"],
    [320, 520, 2, 1.5, "imessage", "Class group text", "now", "47 new messages"],
    [-310, -870, 2, -1, "whatsapp", "Carpool thread", "15m", "Who’s driving Saturday morning?"],
  ];
  const DEPTH = [{ s: 1, b: 0, o: 1 }, { s: 0.86, b: 0.8, o: 0.92 }, { s: 0.72, b: 2, o: 0.75 }];
  const PILE0 = 2.4, PILE_OUT = 5.1;
  NOTES.forEach(([x, y, d, rot, a, src, ago, msg], i) => {
    const n = el("div", "nt", `<span class="gl">${face(a, APPS[a].img ? (APPS[a].fit ? "pad" : "") : undefined)}</span><div class="tx"><div class="src">${src}<i>${ago}</i></div><div class="msg">${msg}</div></div>`, L.noise);
    n.style.zIndex = 10 - d;
    const Dp = DEPTH[d], t0 = PILE0 + 2.0 * Math.pow(i / NOTES.length, 0.8);
    tl.set(n, { xPercent: -50, yPercent: -50, filter: `blur(${Dp.b}px)` }, 0);
    tl.fromTo(n, { x: x * 1.06, y: y + 60, scale: Dp.s * 0.86, rotation: rot * 2 }, { x, y, scale: Dp.s, rotation: rot, duration: 1.3, ease: SP.lively }, t0);
    tl.fromTo(n, { opacity: 0 }, { opacity: Dp.o, duration: 0.25 }, t0);
    tl.to(n, { y: y - 18, duration: PILE_OUT - t0, ease: "sine.inOut" }, t0 + 0.5);
    tl.to(n, { opacity: 0, scale: Dp.s * 0.94, filter: "blur(10px)", duration: 0.5, ease: "power2.in" }, PILE_OUT + (i % 5) * 0.03);
    cue(t0, "ping", { depth: d, i });
  });

  card(["A hundred little things.", "In a dozen *different places.*"], 5.55, 8.85, { size: 84 });

  // the apps behind them
  const T0 = 9.1;
  const tiles = ORDER.map((k, i) => {
    const s = { x: (i % 5 - 2) * 195, y: i < 5 ? -150 : 150 };
    const t = el("div", `tile2${APPS[k].img ? "" : " gen"}`, face(k), L.noise);
    tl.set(t, { left: W / 2, top: H / 2 }, 0);
    tl.fromTo(t, { x: s.x, y: s.y + 60, scale: 0.4, opacity: 0 }, { x: s.x, y: s.y, scale: 1, duration: 1.2, ease: SP.lively }, T0 + i * 0.07);
    tl.fromTo(t, { opacity: 0 }, { opacity: 1, duration: 0.2, immediateRender: false }, T0 + i * 0.07);
    const lb = el("div", "tlabel", APPS[k].label, L.noise);
    tl.set(lb, { left: W / 2 + s.x, top: H / 2 + s.y + 92 }, 0);
    reveal(lb, T0 + 0.4 + i * 0.07, { y: 14, blur: 6, dur: 0.9 });
    return { t, lb, s };
  });
  cue(T0, "gather");
  // …and they fold into one icon
  const FOLD = T0 + 2.6;
  tiles.forEach(({ t, lb, s }, i) => {
    tl.to(t, { x: 0, y: 0, scale: 0.12, opacity: 0, rotation: (i % 2 ? 1 : -1) * 30, duration: 0.7, ease: "power3.in" }, FOLD + (1 - Math.hypot(s.x, s.y) / 450) * 0.12);
    tl.to(lb, { opacity: 0, duration: 0.25 }, FOLD - 0.05);
  });
  cue(FOLD, "suck");
  // the brand, once, then on into the app
  return f.brand(FOLD + 0.65, { out: FOLD + 3.5 });
};
