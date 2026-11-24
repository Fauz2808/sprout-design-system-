/* Website v3, 24 Nov: Tony's "Sprout Website: Copy & Design Brief" (20 Nov).
   - Problem → Daily brief: one pinned scroll. A lock screen buried in notifications; on the scroll each one flies into
     its row of the daily brief ("the messy notifications slide together into the single daily brief").
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

  /* ── 2 + 3 · the lock screen and the brief ── */
  // the brief's six notifications, newest on top, then more of the same running off the bottom of the screen
  /* 24 Nov (Ahmad): the icons are app icons, iOS style, the way a real lock screen shows them: the app that delivered
     it (Mail, Messages, a team app), the sender in bold. Drawn here in the iOS look, not Apple's artwork, and no app
     is named (brief: no real brand names). */
  const ICON = {
    mail: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2.6" y="5.6" width="18.8" height="13" rx="2.4" fill="#fff"/><path d="M3.4 6.9 12 13l8.6-6.1" fill="none" stroke="#1a78f2" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"/></svg>`,
    msg: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#fff" d="M12 3.6c-5.1 0-9.2 3.4-9.2 7.6 0 2.4 1.3 4.5 3.4 5.9-.2 1.3-.9 2.5-2 3.4 2 .1 3.9-.6 5.4-1.8.8.2 1.6.2 2.4.2 5.1 0 9.2-3.4 9.2-7.6S17.1 3.6 12 3.6Z"/></svg>`,
    team: `<i class="ph-fill ph-soccer-ball"></i>`,
  };
  // the brief's six notifications, newest on top, then more of the same running off the bottom of the screen
  const NOTES = [
    { k: "forms", ic: "mail", from: "School Office", body: "Picture day forms due Friday", t: "now" },
    { k: "class", ic: "msg", from: "Ms. Rivera’s Class Parents", body: "34 new messages", t: "2m ago" },
    { k: "soccer", ic: "team", from: "U8 Soccer", body: "Practice moved to 5:30 tonight", t: "6m ago" },
    { k: "bday", ic: "mail", from: "You’re invited", body: "Maya’s 7th birthday!", t: "14m ago" },
    { k: "carpool", ic: "msg", from: "Carpool Moms", body: "Can someone take Thursday?", t: "21m ago" },
    { k: "pta", ic: "mail", from: "PTA", body: "Spirit week schedule (Mon = pajama day)", t: "38m ago" },
    { ic: "msg", from: "Ms. Rivera’s Class Parents", body: "12 new messages", t: "1h ago" },
    { ic: "msg", from: "2nd Grade Parents", body: "Who has the field trip form?", t: "1h ago" },
    { ic: "mail", from: "School Office", body: "Lunch menu for next week", t: "2h ago" },
    { ic: "team", from: "U8 Soccer", body: "Snack schedule updated", t: "3h ago" },
  ];
  // where each one sits on the lock screen: a pile, a few tilted, the last ones off the bottom
  const POSE = [[0, 0, -1.5], [6, 62, 2.5], [-4, 124, -3], [8, 184, 1.5], [-6, 246, 4], [4, 306, -2.5], [-8, 366, 3], [6, 424, -4], [-3, 482, 2], [7, 538, -3]];
  const row = ({ k, t, chip, red, from, who, gmail }) => `<div class="db2-row st-t" data-t="${k}"><span class="db2-box"><i class="ph-bold ph-check"></i></span>
    <span class="db2-face${who.length > 1 ? " pair" : ""}">${who.map((s) => `<i style="background-image:url(${s})"></i>`).join("")}${gmail ? `<img class="g" src="${G}" alt="">` : ""}</span>
    <span class="tx"><b>${t}</b><span class="m"><i class="db2-chip${red ? " red" : ""}">${chip}</i>${from ? `<span>${from}</span>` : ""}</span></span></div>`;
  const story = document.querySelector("[data-story]");
  let drawStory = () => {}, measureStory = () => {};
  if (story) {
    const app = document.createElement("div");
    app.className = "db2 st-app";
    app.setAttribute("aria-hidden", "true");
    app.innerHTML = `
      <div class="st-brief">
        ${sb(false)}
        <div class="db2-scroll">
          <div class="db2-hd"><span class="db2-av" style="background-image:url(${T})"></span><div class="mid"><b>Sprout AI</b><small>Tuesday, October 7</small></div><i class="ph ph-bell bell"></i></div>
          <div class="db2-card db2-todo">
            <div class="th"><span class="db2-av" style="background-image:url(${T})"></span><b>To-Do List</b><span class="plus"><i class="ph ph-plus"></i></span></div>
            ${row({ k: "forms", t: "Send the picture day forms", chip: "Due Fri", from: "From the School Office", who: [T], gmail: true })}
            ${row({ k: "carpool", t: "Reply about Thursday’s carpool", chip: "Today", red: true, from: "From Carpool Moms", who: [T] })}
            ${row({ k: "bday", t: "RSVP to Maya’s 7th birthday", chip: "Party Sat", from: "From Jessica’s invite", who: [D], gmail: true })}
          </div>
          <div class="db2-sh"><span>📅 Happening today</span><small>1 thing</small></div>
          <div class="db2-card"><div class="db2-ev st-t" data-t="soccer"><span class="t">5:30 PM</span><div><b>Soccer practice</b><div class="chips"><i class="db2-chip">Jake · U8 Soccer</i><i class="db2-chip red">Moved from 4:30</i></div></div></div></div>
          <div class="db2-sh"><span>📆 Coming up</span><small>Next week</small></div>
          <div class="db2-card"><div class="db2-up st-t" data-t="pta"><span class="d">Oct<b>13</b></span><div><b class="t">Pajama day</b><small>Mon · Spirit week starts</small></div></div></div>
          <div class="db2-sh"><span>💬 Messages</span><small>34 new</small></div>
          <div class="db2-card"><div class="st-msg st-t" data-t="class"><span class="ini">MR</span><div><b>Ms. Rivera’s Class Parents</b><small>Book fair needs 2 more helpers</small></div></div></div>
        </div>
        ${nav("Daily Brief")}
      </div>
      <div class="st-lock">${sb(true)}<div class="st-date">Tuesday, October 7</div><div class="st-time">7:41</div><span class="db2-home light"></span></div>
      <div class="st-notes">${NOTES.map((n, i) => `<div class="st-note" data-k="${n.k || ""}" style="top:${222 + POSE[i][1]}px;--x:${POSE[i][0]}px;--r:${POSE[i][2]}deg">
        <span class="ic ic-${n.ic}">${ICON[n.ic]}</span><span class="tx"><span class="hd"><b>${n.from}</b><small>${n.t}</small></span>${n.body}</span></div>`).join("")}</div>`;
    story.appendChild(app);
    fit(story, app);
    const lock = app.querySelector(".st-lock"), brief = app.querySelector(".st-brief"), hd = app.querySelector(".db2-hd");
    const notes = [...app.querySelectorAll(".st-note")];
    const sec = document.getElementById("problem"), pin = sec.querySelector(".story-pin");
    // position of an element in the app's own 393 x 852 pixels
    const box = (el) => { const a = app.getBoundingClientRect(), r = el.getBoundingClientRect(), k = a.width / 393; return { x: (r.left - a.left) / k, y: (r.top - a.top) / k, w: r.width / k, h: r.height / k }; };
    let paths = [];
    measureStory = () => {
      notes.forEach((n) => (n.style.transform = "none"));
      paths = notes.map((n) => {
        const from = box(n), target = n.dataset.k ? app.querySelector(`.st-t[data-t="${n.dataset.k}"]`) : null;
        const to = box(target || hd);
        return { n, target, from, to, x: parseFloat(n.style.getPropertyValue("--x")), r: parseFloat(n.style.getPropertyValue("--r")) };
      });
    };
    drawStory = (p) => {
      // 0-0.22 the pile holds · 0.22-0.66 each notification flies into its row, top first · the brief holds after
      const fade = soft(clamp01((p - 0.3) / 0.2));
      lock.style.opacity = (1 - fade).toFixed(3);
      brief.style.opacity = soft(clamp01((p - 0.28) / 0.2)).toFixed(3);
      paths.forEach((q, i) => {
        const m = soft(clamp01((p - 0.22 - i * 0.026) / 0.22));
        const tx = (q.to.x + q.to.w / 2) - (q.from.x + q.from.w / 2), ty = (q.to.y + q.to.h / 2) - (q.from.y + q.from.h / 2);
        const sx = q.target ? q.to.w / q.from.w : 0.4, sy = q.target ? q.to.h / q.from.h : 0.4;
        q.n.style.transform = `translate(${lerp(q.x, tx, m).toFixed(1)}px, ${(ty * m).toFixed(1)}px) rotate(${lerp(q.r, 0, m).toFixed(2)}deg) scale(${lerp(1, sx, m).toFixed(3)}, ${lerp(1, sy, m).toFixed(3)})`;
        q.n.style.opacity = (1 - clamp01((m - (q.target ? 0.72 : 0.4)) / 0.28)).toFixed(3);
        if (q.target) q.target.style.opacity = clamp01((m - 0.62) / 0.38).toFixed(3);
      });
      pin.style.setProperty("--swap", soft(clamp01((p - 0.36) / 0.16)).toFixed(3));
    };
    // the scroll asks, the screen glides toward it
    let want = 0, shown = 0, gliding = false;
    const glide = () => {
      shown += (want - shown) * (reduce.matches ? 1 : 0.16);
      if (Math.abs(want - shown) < 0.0005) shown = want;
      drawStory(shown);
      if (shown !== want) requestAnimationFrame(glide); else gliding = false;
    };
    const scrub = () => {
      const r = sec.getBoundingClientRect();
      want = clamp01(-r.top / Math.max(1, sec.offsetHeight - innerHeight));
      if (!gliding) { gliding = true; requestAnimationFrame(glide); }
    };
    let ticking = false;
    addEventListener("scroll", () => { if (ticking) return; ticking = true; requestAnimationFrame(() => { scrub(); ticking = false; }); }, { passive: true });
    addEventListener("resize", () => { measureStory(); drawStory(shown); scrub(); });
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => setTimeout(() => { measureStory(); scrub(); drawStory(want); shown = want; }, 60));
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

  /* ── the hero photo drifts away from the pointer (touch and reduced motion: still) ── */
  const hero = document.querySelector("[data-hero]"), photo = document.querySelector("[data-photo]");
  if (hero && photo && !reduce.matches && matchMedia("(pointer: fine)").matches) {
    hero.addEventListener("pointermove", (e) => {
      const r = hero.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      photo.style.transform = `scale(1.06) translate(${-x * 16}px, ${-y * 10}px)`;
    });
    hero.addEventListener("pointerleave", () => { photo.style.transform = ""; });
  }
  void narrow;
})();
