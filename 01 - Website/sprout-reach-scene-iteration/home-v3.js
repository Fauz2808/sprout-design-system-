/* Website v3, 24 Nov: Tony's "Sprout Website: Copy & Design Brief" (20 Nov).
   - Hero: profile chips on the parents in the photo (Tony, 25 Nov).
   - Problem → Daily brief (25 Nov): notifications pop up around a mom's head, then one timed transition pulls them into
     the Daily Brief. Its to-dos open a sheet: summary, the original email, Mark as done.
   - Assist: the three clay tiles pop in when the section comes up.
   - Community: a coded class group chat (393 x 852, scaled into its phone).
   - Close: the parents' faces come in one by one.
   - Join Sprout: a phone goes to its store, a computer opens the QR pop-up (Tony, 9 Oct).
   Names and app names are made up (no real school, brand or roster). */
(() => {
  const A = "./assets/";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  const narrow = matchMedia("(max-width: 900px)");
  const clamp01 = (v) => Math.min(1, Math.max(0, v));
  const soft = (t) => t * t * t * (t * (t * 6 - 15) + 10);
  const lerp = (a, b, t) => a + (b - a) * t;
  const fit = (box, app) => {
    const set = () => app.style.setProperty("--k", String(box.clientWidth / 393));
    new ResizeObserver(set).observe(box);
    set();
  };
  const T = `${A}brief/tony.webp`, D = `${A}brief/dana.webp`, G = `${A}gmail.svg`;
  const sb = (light) => `<div class="db2-sb${light ? " light" : ""}"><span>${light ? "" : "7:41"}</span><span class="r"><svg width="18" height="12" viewBox="0 0 18 12"><rect x="0" y="8" width="3" height="4" rx="1"/><rect x="5" y="6" width="3" height="6" rx="1"/><rect x="10" y="3" width="3" height="9" rx="1"/><rect x="15" y="0" width="3" height="12" rx="1"/></svg>
    <svg width="16" height="12" viewBox="0 0 16 12"><path d="M8 11.5 5.6 9a3.4 3.4 0 0 1 4.8 0zM3.4 6.8a6.5 6.5 0 0 1 9.2 0l-1.3 1.3a4.7 4.7 0 0 0-6.6 0zM1.1 4.5a9.8 9.8 0 0 1 13.8 0l-1.3 1.3a8 8 0 0 0-11.2 0z"/></svg>
    <svg width="27" height="13" viewBox="0 0 27 13"><rect x=".5" y=".5" width="23" height="12" rx="3.5" fill="none" stroke="currentColor"/><rect x="2.5" y="2.5" width="19" height="8" rx="2"/><rect x="25" y="4.5" width="1.5" height="4" rx=".7"/></svg></span></div>`;
  /* the docked tab bar, Figma Prod "Navigation Bar (Docked)" 16121:176380 (Tony, 14 Nov): the notched bar, four tabs, the
     knitted clover raised in the notch with its count, Chat's count. The active tab is filled and dark. */
  const nav = (on) => `<div class="dock"><img class="dock-bar" src="${A}brief/dock-bar.svg" alt="">
    <div class="dock-tabs">${[["sun-horizon", "Daily Brief"], ["compass", "Events"], ["", ""], ["chat-circle-dots", "Chat"], ["users", "Clubs"]]
      .map(([icon, label]) => icon ? `<span class="${label === on ? "on" : ""}"><i class="ph${label === on ? "-fill" : ""} ph-${icon}"></i>${label}${label === "Chat" ? "<b>2</b>" : ""}</span>` : '<span class="gap"></span>').join("")}</div>
    <span class="dock-clover"><img src="${A}brief/dock-clover.webp" alt=""><b>1</b></span></div><span class="db2-home"></span>`;

  /* ── 2 + 3 · the mental load → the Daily Brief (Tony, 25 Nov). ──
     State 1: a mom checking her phone, school notifications popping up around her head.
     State 2: they all get pulled into the phone and the Daily Brief comes up: one simple UI.
     The scroll only picks the state; the change is one timed transition, so a scroll that stops anywhere still shows
     a whole screen (Tony's DM: stopping mid-animation looked broken). Made-up senders, iOS-style icons, no app names. */
  const ICON = {
    mail: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2.6" y="5.6" width="18.8" height="13" rx="2.4" fill="#fff"/><path d="M3.4 6.9 12 13l8.6-6.1" fill="none" stroke="#1a78f2" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"/></svg>`,
    msg: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#fff" d="M12 3.6c-5.1 0-9.2 3.4-9.2 7.6 0 2.4 1.3 4.5 3.4 5.9-.2 1.3-.9 2.5-2 3.4 2 .1 3.9-.6 5.4-1.8.8.2 1.6.2 2.4.2 5.1 0 9.2-3.4 9.2-7.6S17.1 3.6 12 3.6Z"/></svg>`,
    team: `<i class="ph-fill ph-soccer-ball"></i>`,
  };
  // [icon, sender, body, time, left %, top %, tilt]: around her head (head ≈ 50% / 15% of the photo), never over her face
  const POPS = [
    ["mail", "School Office", "Picture day forms due Friday", "now", -18, -5, -3],
    ["msg", "Ms. Rivera’s Class Parents", "34 new messages", "2m ago", 46, -15, 3],
    ["team", "U8 Soccer", "Practice moved to 5:30 tonight", "6m ago", 60, 6, -2.5],
    ["msg", "Carpool Moms", "Can someone take Thursday?", "21m ago", -16, 25, 2],
    ["mail", "You’re invited", "Maya’s 7th birthday!", "14m ago", 58, 29, 2],
    ["mail", "PTA", "Spirit week schedule (Mon = pajama day)", "38m ago", -12, 47, -1.5],
    ["msg", "2nd Grade Parents", "Who has the field trip form?", "1h ago", 60, 66, -2],
    ["mail", "School Office", "Lunch menu for next week", "2h ago", -20, 71, 2.5],
  ];
  // the to-dos, today's first (Tony: "today's stuff should be at the top, due Friday below"); each opens a sheet
  /* 25 Nov (Ahmad): the brief is the MOM's (the woman in the photo, "Dana"), a family to-do list: hers, her husband's,
     and one they share. Faces are cut from the scene photo (assets/brief/scene-*.webp). Today's first. */
  const MOM = `${A}brief/scene-mom.webp`, DAD = `${A}brief/scene-dad.webp`;
  const TODOS = [
    { t: "Reply about Thursday’s carpool", chip: "Today", red: true, from: "Carpool Moms", who: [MOM], seen: 1, time: "now",
      sum: ["Priya asked who can drive the kids home on Thursday", "Pickup is 3:15 PM at the school, three kids", "Marcus already has the morning"],
      src: "Message in Carpool Moms", orig: ["Priya Shah · 7:20 AM", "Hi all! Can anyone take the kids home Thursday? I’m stuck at work until 5. Pickup is 3:15 at the front loop. Marcus has the morning."] },
    { t: "Pick up Jake from soccer", chip: "Today · 5:30 PM", red: true, from: "", who: [DAD], seen: 2, time: "8:12",
      sum: ["Practice moved from 4:30 to 5:30 tonight", "Field 2 at Lakeline Park", "Your husband took this one, he saw it at 8:12"],
      src: "Email from U8 Soccer", orig: ["U8 Soccer · coach@ssckids.org", "Hi families, practice moves to 5:30 tonight on Field 2 because of the field schedule. Cleats and water, please."], gmail: true },
    { t: "Send the picture day forms", chip: "Due Fri", from: "School Office", who: [MOM, DAD], seen: 2, time: "7:58", gmail: true,
      sum: ["Fill in the order form and pick a package", "Send it back in Jake’s folder by Friday", "Photos are on Tuesday, class shirts on"],
      src: "Email from the School Office", orig: ["School Office · office@lincolnelem.org", "Dear families, picture day is next Tuesday. Please return the attached order form with your package choice by Friday. Students should wear their class shirts."] },
  ];
  const story = document.querySelector("[data-story]"), stage = document.querySelector("[data-stage]");
  if (story && stage) {
    const sec = document.getElementById("problem");
    const pops = stage.querySelector("[data-pops]");
    /* 25 Nov (Ahmad): the notes rise out of her head the way the App Store opener's icons rise from the clover (V.21
       "rise": a kick, a bend, then up and out), on one slow loop, instead of popping in all at once. Each note has its
       own lane; delays are negative so the loop is already full when the section arrives. x/y/r are the still layout
       for reduced motion. */
    // [kick, bend, end, rise] in cqw: from the top of the photo above her head, up and out over the top (Ahmad, 25 Nov: never over her face)
    const LANES = [[-8, -20, -34, -22], [2, -4, -8, -30], [-14, -28, -46, -14], [6, 8, 6, -26], [-6, -16, -26, -34], [8, 14, 18, -18], [-12, -24, -40, -28], [-2, -12, -20, -12]];
    pops.innerHTML = POPS.map(([ic, from, body, t, x, y, r], i) => {
      const [kick, bend, end, rise] = LANES[i % LANES.length];
      return `<div class="pop" style="--fx:${x}%;--fy:${y}%;--r:${r}deg;--i:${i};--kick:${kick}cqw;--bend:${bend}cqw;--end:${end}cqw;--rise:${rise}cqw;--spin:${(r * 0.8).toFixed(1)}deg">
      <span class="ic ic-${ic}">${ICON[ic]}</span><span class="tx"><span class="hd"><b>${from}</b><small>${t}</small></span>${body}</span></div>`;
    }).join("");
    const todoRow = (d, i) => `<button type="button" class="db2-row st-todo" data-i="${i}" aria-label="Open the to-do: ${d.t}"><span class="db2-box"><i class="ph-bold ph-check"></i></span>
      <span class="db2-face${d.who.length > 1 ? " pair" : ""}">${d.who.map((s) => `<i style="background-image:url(${s})"></i>`).join("")}${d.gmail ? `<img class="g" src="${G}" alt="">` : ""}</span>
      <span class="tx"><b>${d.t}</b><span class="m"><i class="db2-chip${d.red ? " red" : ""}">${d.chip}</i>${d.from ? `<span>From ${d.from}</span>` : ""}</span></span>
      <span class="db2-seen"><i class="ph${d.seen === 2 ? "-bold ph-checks" : " ph-check"}"></i>${d.time}</span></button>`;
    const app = document.createElement("div");
    app.className = "db2 st-app";
    app.innerHTML = `
      <div class="st-brief">
        ${sb(false)}
        <div class="db2-scroll">
          <div class="db2-hd"><span class="db2-av" style="background-image:url(${MOM})"></span><div class="mid"><b>Sprout AI</b><small>Tuesday, October 7</small></div><i class="ph ph-bell bell"></i></div>
          <div class="db2-hi"><b>Morning, Dana</b><span class="db2-wx">☀️ <strong>68–84°</strong> Sunny</span></div>
          <div class="db2-card db2-todo">
            <div class="th"><span class="db2-av" style="background-image:url(${MOM})"></span><b>To-Do List</b><span class="plus"><i class="ph ph-plus"></i></span></div>
            ${TODOS.map(todoRow).join("")}
          </div>
          <!-- Prod BRIEF-10 (Figma 16180:365329) without the SSC banner and invitations (Ahmad, 25 Nov): the family to-dos,
               Happening today in the new card, Upcoming events -->
          <div class="db2-sh"><span>📅 Happening today</span><small>1 thing</small></div>
          <div class="db2-card"><div class="db2-hap"><div class="htop"><img src="${A}brief/calendar-check.png" alt=""><div><b>5:30 PM</b><i class="db2-chip">Jake · U8 Soccer</i></div></div>
            <h5>Soccer practice</h5><p>Moved from 4:30. Field 2, cleats and water.</p></div></div>
          <div class="db2-sh"><span>📆 Upcoming events</span><small>Next week</small></div>
          <div class="db2-card"><div class="db2-up"><span class="d">Oct<b>13</b></span><div><b class="t">Pajama day</b><small>Mon · Spirit week starts</small></div></div></div>
        </div>
        ${nav("Daily Brief")}
      </div>
      <div class="td-scrim" data-scrim></div>
      <div class="td-sheet" data-sheet role="dialog" aria-modal="false" aria-label="To-do details"></div>`;
    story.appendChild(app);
    fit(story, app);

    /* the to-do sheet: summary, the original email (or message), Mark as done (Tony, 25 Nov) */
    const sheet = app.querySelector("[data-sheet]"), scrim = app.querySelector("[data-scrim]");
    const rows = [...app.querySelectorAll(".st-todo")];
    const close = () => { app.classList.remove("sheet-on"); };
    const open = (i) => {
      const d = TODOS[i], done = rows[i].classList.contains("done");
      sheet.innerHTML = `<span class="grab"></span>
        <div class="td-top"><span class="db2-face${d.who.length > 1 ? " pair" : ""}">${d.who.map((s) => `<i style="background-image:url(${s})"></i>`).join("")}${d.gmail ? `<img class="g" src="${G}" alt="">` : ""}</span><i class="db2-chip${d.red ? " red" : ""}">${d.chip}</i>
          <button type="button" class="td-x" data-x aria-label="Close"><i class="ph ph-x"></i></button></div>
        <h3>${d.t}</h3>
        <p class="td-lb">Summary</p>
        <ul>${d.sum.map((s) => `<li>${s}</li>`).join("")}</ul>
        <button type="button" class="td-src" data-src aria-expanded="false">${d.gmail ? `<img src="${G}" alt="">` : '<i class="ph-fill ph-chat-circle-dots"></i>'}<span>${d.src}</span><i class="ph ph-caret-down car"></i></button>
        <div class="td-orig" data-orig hidden><b>${d.orig[0]}</b><p>${d.orig[1]}</p></div>
        <button type="button" class="td-done" data-done>${done ? "Mark as not done" : '<i class="ph-bold ph-check"></i>Mark as done'}</button>`;
      sheet.querySelector("[data-x]").onclick = close;
      const srcBtn = sheet.querySelector("[data-src]"), orig = sheet.querySelector("[data-orig]");
      srcBtn.onclick = () => { orig.hidden = !orig.hidden; srcBtn.setAttribute("aria-expanded", String(!orig.hidden)); };
      sheet.querySelector("[data-done]").onclick = () => { rows[i].classList.toggle("done"); close(); };
      app.classList.add("sheet-on");
    };
    rows.forEach((r, i) => {
      r.addEventListener("click", (e) => {
        if (e.target.closest(".db2-box")) { r.classList.toggle("done"); return; }   // the box itself checks it off
        open(i);
      });
    });
    scrim.onclick = close;

    /* the two states: on calm the whole cloud of notes is pulled into the phone (one transform on .pops) */
    const box = stage.querySelector(".mom-box");
    const aim = () => {};
    let calm = null;
    const set = (c) => {
      if (c === calm) return;
      calm = c;
      sec.classList.toggle("calm", c);
      story.inert = !c;
      if (!c) close();
    };
    const check = () => {
      const r = sec.getBoundingClientRect();
      if (r.top < innerHeight * 0.75) sec.classList.add("on");   // the pops come in once the section is on screen
      set(-r.top / Math.max(1, sec.offsetHeight - innerHeight) > 0.42);
    };
    let ticking = false;
    addEventListener("scroll", () => { if (ticking) return; ticking = true; requestAnimationFrame(() => { check(); ticking = false; }); }, { passive: true });
    addEventListener("resize", () => { aim(); check(); });
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => { aim(); check(); });
    aim(); check();
  }

  /* ── 5 · the Chat screen (Ahmad, 24 Nov: Figma Prod 12758:106388). Every class and group the family is in as circles
     and photo tiles, then Direct Messages; the docked tab bar with Chat on. Names are the file's stock cast. ── */
  const chat = document.querySelector("[data-chat]");
  if (chat) {
    const app = document.createElement("div");
    app.className = "db2 ch";
    app.setAttribute("aria-hidden", "true");
    const C = `${A}assist/`;
    const circ = (inner, label, n = 0) => `<span class="ch-g">${inner}${n ? `<b class="cnt">${n}</b>` : ""}<small>${label}</small></span>`;
    const logo = (img) => `<img class="ch-c" src="${C}${img}.webp" alt="">`;
    const ini = (t) => `<em class="ch-c ini">${t}</em>`;
    const tile = (bg, date) => `<span class="ch-c ptile" style="background-image:url(${bg})"><i>${date}</i></span>`;
    // Ahmad, 24 Nov: mostly moms in the DMs (the parents who actually run the class chats); made-up names
    const dms = [[`${C}mem-jessica.webp`, "Jessica Lane", "Jessica: See you at pickup!", "8:30 PM", 4], [`${A}v2/cast-aisha.webp`, "Aisha Rahman", "You: Yes! Ava would love a playdate", "8:12 PM", 2],
      [`${C}mem-emily.webp`, "Emily Carter", "Emily: Do you have the field trip form?", "7:45 PM", 1], [`${C}dm-fatima.webp`, "Marcus Reed", "Marcus: I can take Thursday’s carpool", "7:20 PM", 3],
      [`${C}mem-sarah.webp`, "Sarah Baker", "You: Thank you for the muffins!", "6:58 PM", 0], [`${C}dm-raj.webp`, "Raj Singh", "Raj: See you there!", "6:30 PM", 1],
      [`${A}brief/priya.webp`, "Priya Shah", "Priya: Book fair is Friday!", "5:41 PM", 0]];
    app.innerHTML = `${sb(false).replace("7:41", "9:41")}
      <div class="ch-head"><span class="sq add"><i class="ph ph-plus"></i></span><h3>Chat</h3><span class="sq"><i class="ph ph-magnifying-glass"></i></span><span class="sq"><i class="ph ph-note-pencil"></i></span></div>
      <!-- Ahmad, 24 Nov: the top row is the family's mix: the school grade, the class (the teacher's photo), a sports
           team and a summer camp; more scroll in from the right -->
      <div class="ch-groups">
        ${circ(logo("club-kiker"), "First Grade")}${circ(`<img class="ch-c" src="${A}v2/cast-teacher-taylor.webp" alt="">`, "Ms. Taylor’s Class")}${circ(logo("club-ssc"), "U8 Soccer")}${circ(logo("club-creator"), "Summer Camp")}${circ(logo("club-kiker"), "Kindergarten")}
      </div>
      <div class="ch-dmh"><h4>Direct Messages</h4><i class="ph ph-caret-down"></i></div>
      <div class="ch-dms">${dms.map(([img, n, m, t, c]) => `<div class="ch-dm"><img src="${img}" alt=""><div class="tx"><b>${n}</b><span>${m}</span></div><div class="meta"><small>${t}</small>${c ? `<i>${c}</i>` : ""}</div></div>`).join("")}</div>
      ${nav("Chat")}`;
    chat.appendChild(app);
    fit(chat, app);
  }

  /* ── 4 · the Assist header orb: the same live orb as the Assist flow (thinking-orb.js, "working" state). It pauses
     itself off screen; reduced motion gets one still frame. ── */
  const orb = document.querySelector("[data-orb]");
  if (orb && window.SproutThinkingOrb) {
    const api = window.SproutThinkingOrb.create(orb.querySelector("canvas"), { state: "working" });
    if (api) { api.play(); orb.dataset.ready = "1"; }
  }

  /* ── things that come in once, when they're on screen ── */
  const once = (sel, threshold = 0.3) => document.querySelectorAll(sel).forEach((el) => new IntersectionObserver((es, io) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    el.classList.add("in");
    io.disconnect();
  }), { threshold }).observe(el));
  once("[data-tiles]");
  once("[data-faces]", 0.6);
  once(".kin-wrap", 0.2);
  once(".plate-next", 0.8);

  /* ── Join Sprout (Tony, 7 + 9 Oct): a phone goes straight to its store; a computer opens the QR pop-up. iPadOS reports
     itself as a Mac, so a Mac with a touch screen counts as an iPad. ── */
  const PLAY = "https://play.google.com/store/apps/details?id=com.meetingpoint";
  const ua = navigator.userAgent;
  const isAndroid = /Android/i.test(ua);
  const isIOS = /iPhone|iPad|iPod/i.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  const joinLinks = document.querySelectorAll("a[data-join]");
  if (isAndroid) joinLinks.forEach((a) => (a.href = PLAY));
  const getApp = document.getElementById("getApp");
  if (getApp && !isAndroid && !isIOS) {
    joinLinks.forEach((a) => a.addEventListener("click", (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return; // a new tab still goes to the store
      e.preventDefault();
      getApp.showModal();
    }));
    getApp.addEventListener("click", (e) => {
      const r = getApp.getBoundingClientRect();
      const out = e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
      if (e.target.closest("[data-close]") || (out && e.target === getApp)) getApp.close();
    });
  }

  /* ── 1 · profile chips on the parents in the hero (Tony, 25 Nov DM: "little profiles over the people standing there
     talking"). Each chip is placed in the photo's own pixels and mapped through background-size: cover, so it stays on
     the same person at every width. The avatar is that parent's face cropped from the same photo.
     face: [x, y, head width] in the wide photo · wide / tall: [x, y] of the chip's centre-top in each photo
     (tall = the portrait photo phones use; null = not shown there, two chips are enough on a phone). ── */
  const PEOPLE = [
    { n: "Dan Ellis", s: "Owen’s dad · 1st Grade", face: "dan", wide: [0.535, 0.47], tall: [0.26, 0.45] },
    { n: "Jess Moreno", s: "Lily’s mom · 1st Grade", face: "jess", wide: [0.618, 0.635], tall: null },
    { n: "Grace Lin", s: "Theo’s mom · Kindergarten", face: "grace", wide: [0.792, 0.455], tall: [0.66, 0.24], tag: "New" },
    { n: "Ben Carter", s: "Ava’s dad · 1st Grade", face: "ben", wide: [0.862, 0.72], tall: null },
  ];
  const IMG = { wide: [2400, 1356], tall: [1122, 1402] };
  const hero = document.querySelector("[data-hero]"), photo = document.querySelector("[data-photo]"), tags = document.querySelector("[data-tags]");
  if (hero && photo && tags) {
    // the avatar is that parent's face, cut from the same photo (assets/hero-faces/, 25 Nov)
    tags.innerHTML = PEOPLE.map((p, i) => `<span class="tag" style="--i:${i}"><img class="av" src="${A}hero-faces/${p.face}.webp" alt=""><span class="tx"><b>${p.n}</b><small>${p.s}</small></span>${p.tag ? `<em>${p.tag}</em>` : ""}</span>`).join("");
    const chips = [...tags.children];
    const place = () => {
      const cs = getComputedStyle(photo), tall = cs.backgroundImage.includes("portrait");
      const [iw, ih] = IMG[tall ? "tall" : "wide"];
      const W = photo.offsetWidth, H = photo.offsetHeight;
      Object.assign(tags.style, { left: `${photo.offsetLeft}px`, top: `${photo.offsetTop}px`, width: `${W}px`, height: `${H}px` });
      const [px, py] = cs.backgroundPosition.split(" ").map((v) => parseFloat(v) / 100);
      const k = Math.max(W / iw, H / ih), dw = iw * k, dh = ih * k, ox = (W - dw) * px, oy = (H - dh) * py;
      // chips scale with the photo (13px at a 1440 wide frame), so they never outgrow the people
      tags.style.fontSize = `${Math.min(14, Math.max(10, 13 * dh / 864)).toFixed(2)}px`;
      const inset = photo.parentElement, copy = inset.querySelector(".copy");
      const minX = -photo.offsetLeft + 12, maxX = -photo.offsetLeft + inset.clientWidth - 12;
      const side = getComputedStyle(inset).flexDirection !== "column";   // copy beside the photo, not under it
      const copyR = side && copy ? Math.max(...[...copy.children].map((e) => e.offsetLeft + e.offsetWidth)) - photo.offsetLeft + 20 : -Infinity;
      chips.forEach((c, i) => {
        const at = PEOPLE[i][tall ? "tall" : "wide"];
        c.hidden = !at;
        if (!at) return;
        const w = c.offsetWidth;
        const x = Math.min(maxX - w / 2, Math.max(minX + w / 2, copyR + w / 2, ox + at[0] * dw));
        c.style.left = `${x.toFixed(1)}px`; c.style.top = `${(oy + at[1] * dh).toFixed(1)}px`;
      });
    };
    new ResizeObserver(place).observe(photo);
    addEventListener("resize", place);
    place();
    setTimeout(() => tags.classList.add("in"), 500);
    /* the photo drifts away from the pointer and the chips ride with it (touch and reduced motion: still) */
    if (!reduce.matches && matchMedia("(pointer: fine)").matches) {
      hero.addEventListener("pointermove", (e) => {
        const r = hero.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        photo.style.transform = tags.style.transform = `scale(1.06) translate(${-x * 16}px, ${-y * 10}px)`;
      });
      hero.addEventListener("pointerleave", () => { photo.style.transform = tags.style.transform = ""; });
    }
  }
  void narrow;
})();
