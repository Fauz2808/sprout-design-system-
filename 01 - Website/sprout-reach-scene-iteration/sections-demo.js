/* Coded screens for the sections below the hero, so no screen on the page is a
   screenshot (Ahmad, 25 Sep):
   - Classes: Chat, Calendar, Updates and Links (Figma 8198:109904, 8766:154859,
     8827:117674, 8845:135495), switched by the section's own tabs.
   - Sprout Assist story: the menu (135) and the four listening screens (143, 144, 145,
     146 in section 12798:18362), switched by the story's scroll and selector.
   - Family moments 01: the updated to-do card (the shared Daily Brief 12403:210488).
   Screens are built at the app's 393 x 852 and scaled into each phone, like the hero.
   The PNGs stay in the markup as the no-JavaScript fallback. */
(function () {
  const A = "./assets/assist/";
  const PH = {"chats-teardrop": "M169.57,72.59A80,80,0,0,0,16,104v64a16,16,0,0,0,16,16H86.67A80.15,80.15,0,0,0,160,232h64a16,16,0,0,0,16-16V152A80,80,0,0,0,169.57,72.59ZM32,104a64,64,0,1,1,64,64H32ZM224,216H160a64.14,64.14,0,0,1-55.68-32.43A79.93,79.93,0,0,0,174.7,89.71,64,64,0,0,1,224,152Z", "calendar-dots": "M208,32H184V24a8,8,0,0,0-16,0v8H88V24a8,8,0,0,0-16,0v8H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM72,48v8a8,8,0,0,0,16,0V48h80v8a8,8,0,0,0,16,0V48h24V80H48V48ZM208,208H48V96H208V208Zm-68-76a12,12,0,1,1-12-12A12,12,0,0,1,140,132Zm44,0a12,12,0,1,1-12-12A12,12,0,0,1,184,132ZM96,172a12,12,0,1,1-12-12A12,12,0,0,1,96,172Zm44,0a12,12,0,1,1-12-12A12,12,0,0,1,140,172Zm44,0a12,12,0,1,1-12-12A12,12,0,0,1,184,172Z", "envelope-simple": "M224,48H32a8,8,0,0,0-8,8V192a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A8,8,0,0,0,224,48ZM203.43,64,128,133.15,52.57,64ZM216,192H40V74.19l82.59,75.71a8,8,0,0,0,10.82,0L216,74.19V192Z", "push-pin": "M235.32,81.37,174.63,20.69a16,16,0,0,0-22.63,0L98.37,74.49c-10.66-3.34-35-7.37-60.4,13.14a16,16,0,0,0-1.29,23.78L85,159.71,42.34,202.34a8,8,0,0,0,11.32,11.32L96.29,171l48.29,48.29A16,16,0,0,0,155.9,224c.38,0,.75,0,1.13,0a15.93,15.93,0,0,0,11.64-6.33c19.64-26.1,17.75-47.32,13.19-60L235.33,104A16,16,0,0,0,235.32,81.37ZM224,92.69h0l-57.27,57.46a8,8,0,0,0-1.49,9.22c9.46,18.93-1.8,38.59-9.34,48.62L48,100.08c12.08-9.74,23.64-12.31,32.48-12.31A40.13,40.13,0,0,1,96.81,91a8,8,0,0,0,9.25-1.51L163.32,32,224,92.68Z", "pencil-simple-line": "M227.32,73.37,182.63,28.69a16,16,0,0,0-22.63,0L36.69,152A15.86,15.86,0,0,0,32,163.31V208a16,16,0,0,0,16,16H216a8,8,0,0,0,0-16H115.32l112-112A16,16,0,0,0,227.32,73.37ZM92.69,208H48V163.31l88-88L180.69,120ZM192,108.69,147.32,64l24-24L216,84.69Z", "image": "M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40Zm0,16V158.75l-26.07-26.06a16,16,0,0,0-22.63,0l-20,20-44-44a16,16,0,0,0-22.62,0L40,149.37V56ZM40,172l52-52,80,80H40Zm176,28H194.63l-36-36,20-20L216,181.38V200ZM144,100a12,12,0,1,1,12,12A12,12,0,0,1,144,100Z", "paper-plane-right": "M231.87,114l-168-95.89A16,16,0,0,0,40.92,37.34L71.55,128,40.92,218.67A16,16,0,0,0,56,240a16.15,16.15,0,0,0,7.93-2.1l167.92-96.05a16,16,0,0,0,.05-27.89ZM56,224a.56.56,0,0,0,0-.12L85.74,136H144a8,8,0,0,0,0-16H85.74L56.06,32.16A.46.46,0,0,0,56,32l168,95.83Z", "frame-corners": "M200,80v32a8,8,0,0,1-16,0V88H160a8,8,0,0,1,0-16h32A8,8,0,0,1,200,80ZM96,168H72V144a8,8,0,0,0-16,0v32a8,8,0,0,0,8,8H96a8,8,0,0,0,0-16ZM232,56V200a16,16,0,0,1-16,16H40a16,16,0,0,1-16-16V56A16,16,0,0,1,40,40H216A16,16,0,0,1,232,56ZM216,200V56H40V200H216Z", "caret-left": "M165.66,202.34a8,8,0,0,1-11.32,11.32l-80-80a8,8,0,0,1,0-11.32l80-80a8,8,0,0,1,11.32,11.32L91.31,128Z", "caret-right": "M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z", "link-simple": "M165.66,90.34a8,8,0,0,1,0,11.32l-64,64a8,8,0,0,1-11.32-11.32l64-64A8,8,0,0,1,165.66,90.34ZM215.6,40.4a56,56,0,0,0-79.2,0L106.34,70.45a8,8,0,0,0,11.32,11.32l30.06-30a40,40,0,0,1,56.57,56.56l-30.07,30.06a8,8,0,0,0,11.31,11.32L215.6,119.6a56,56,0,0,0,0-79.2ZM138.34,174.22l-30.06,30.06a40,40,0,1,1-56.56-56.57l30.05-30.05a8,8,0,0,0-11.32-11.32L40.4,136.4a56,56,0,0,0,79.2,79.2l30.06-30.07a8,8,0,0,0-11.32-11.31Z", "trash": "M216,48H176V40a24,24,0,0,0-24-24H104A24,24,0,0,0,80,40v8H40a8,8,0,0,0,0,16h8V208a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V64h8a8,8,0,0,0,0-16ZM96,40a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96Zm96,168H64V64H192ZM112,104v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm48,0v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Z", "plus-circle": "M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm48-88a8,8,0,0,1-8,8H136v32a8,8,0,0,1-16,0V136H88a8,8,0,0,1,0-16h32V88a8,8,0,0,1,16,0v32h32A8,8,0,0,1,176,128Z", "plus": "M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z", "check": "M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z", "arrow-right": "M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z", "caret-down": "M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z", "sun-horizon": "M240,152H199.55a73.54,73.54,0,0,0,.45-8,72,72,0,0,0-144,0,73.54,73.54,0,0,0,.45,8H16a8,8,0,0,0,0,16H240a8,8,0,0,0,0-16ZM72,144a56,56,0,1,1,111.41,8H72.59A56.13,56.13,0,0,1,72,144Zm144,56a8,8,0,0,1-8,8H48a8,8,0,0,1,0-16H208A8,8,0,0,1,216,200ZM72.84,43.58a8,8,0,0,1,14.32-7.16l8,16a8,8,0,0,1-14.32,7.16Zm-56,48.84a8,8,0,0,1,10.74-3.57l16,8a8,8,0,0,1-7.16,14.31l-16-8A8,8,0,0,1,16.84,92.42Zm192,15.16a8,8,0,0,1,3.58-10.73l16-8a8,8,0,1,1,7.16,14.31l-16,8a8,8,0,0,1-10.74-3.58Zm-48-55.16,8-16a8,8,0,0,1,14.32,7.16l-8,16a8,8,0,1,1-14.32-7.16Z", "compass": "M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216ZM172.42,72.84l-64,32a8.05,8.05,0,0,0-3.58,3.58l-32,64A8,8,0,0,0,80,184a8.1,8.1,0,0,0,3.58-.84l64-32a8.05,8.05,0,0,0,3.58-3.58l32-64a8,8,0,0,0-10.74-10.74ZM138,138,97.89,158.11,118,118l40.15-20.07Z", "chat-circle-dots": "M140,128a12,12,0,1,1-12-12A12,12,0,0,1,140,128ZM84,116a12,12,0,1,0,12,12A12,12,0,0,0,84,116Zm88,0a12,12,0,1,0,12,12A12,12,0,0,0,172,116Zm60,12A104,104,0,0,1,79.12,219.82L45.07,231.17a16,16,0,0,1-20.24-20.24l11.35-34.05A104,104,0,1,1,232,128Zm-16,0A88,88,0,1,0,51.81,172.06a8,8,0,0,1,.66,6.54L40,216,77.4,203.53a7.85,7.85,0,0,1,2.53-.42,8,8,0,0,1,4,1.08A88,88,0,0,0,216,128Z", "users": "M117.25,157.92a60,60,0,1,0-66.5,0A95.83,95.83,0,0,0,3.53,195.63a8,8,0,1,0,13.4,8.74,80,80,0,0,1,134.14,0,8,8,0,0,0,13.4-8.74A95.83,95.83,0,0,0,117.25,157.92ZM40,108a44,44,0,1,1,44,44A44.05,44.05,0,0,1,40,108Zm210.14,98.7a8,8,0,0,1-11.07-2.33A79.83,79.83,0,0,0,172,168a8,8,0,0,1,0-16,44,44,0,1,0-16.34-84.87,8,8,0,1,1-5.94-14.85,60,60,0,0,1,55.53,105.64,95.83,95.83,0,0,1,47.22,37.71A8,8,0,0,1,250.14,206.7Z"};
  const phi = (k, cls = "") => `<svg class="ph ${cls}" viewBox="0 0 256 256" aria-hidden="true"><path d="${PH[k]}"/></svg>`;
  const back = '<svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const check = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
  const statusBar = `<div class="sa-sb" aria-hidden="true"><span>9:41</span><span class="r">
    <svg width="18" height="12" viewBox="0 0 18 12"><rect x="0" y="8" width="3" height="4" rx="1"/><rect x="5" y="6" width="3" height="6" rx="1"/><rect x="10" y="3" width="3" height="9" rx="1"/><rect x="15" y="0" width="3" height="12" rx="1"/></svg>
    <svg width="16" height="12" viewBox="0 0 16 12"><path d="M8 11.5 5.6 9a3.4 3.4 0 0 1 4.8 0zM3.4 6.8a6.5 6.5 0 0 1 9.2 0l-1.3 1.3a4.7 4.7 0 0 0-6.6 0zM1.1 4.5a9.8 9.8 0 0 1 13.8 0l-1.3 1.3a8 8 0 0 0-11.2 0z"/></svg>
    <svg width="27" height="13" viewBox="0 0 27 13"><rect x=".5" y=".5" width="23" height="12" rx="3.5" fill="none" stroke="#1e3e2b"/><rect x="2.5" y="2.5" width="19" height="8" rx="2"/><rect x="25" y="4.5" width="1.5" height="4" rx=".7"/></svg>
  </span></div>`;
  const tail = (mine) => `<svg class="tail" viewBox="0 0 18 15" aria-hidden="true"><path d="M18 14.66C9.08 16.31 2.28 11.57 0 9L.25 1.29C2.7 1.8 8.01 2.26 9.63 0 9.38 9.26 16.23 13.89 18 14.66Z"/></svg>`;
  // scale a 393-wide app into whatever box holds it
  const fitTo = (box, app) => {
    const fit = () => app.style.setProperty("--sa-scale", String(box.clientWidth / 393));
    new ResizeObserver(fit).observe(box);
    fit();
  };

  /* ── Classes ── */
  const clsPanel = document.getElementById("class-screen-panel");
  if (clsPanel) {
    const msg = (av, name, text, multi) => `<div class="cl-msg${multi ? " multi" : ""}"><img class="av" src="${A}${av}.webp" alt="">
        <div class="col"><span class="nm">${name}</span><div class="bub">${tail()}<p>${text}</p><time>10:00PM</time></div></div></div>`;
    // September 2026 starts on a Tuesday; today is the 24th, like the rest of the page
    const NOTES = {
      24: [["🎭 Talent Show", "Kindergarten · Auditorium at 8:30 AM. Bring the camera!", "Dana Reyes"],
        ["⚽ Soccer practice", "Little Shots · Field 2 at 1:30 PM.", "James Martin"]],
      25: [["📸 Class Photo Day", "Photos at 8:30 AM. Fill in your slot in the link I shared.", "James Martin"]],
      26: [["📝 Spirit Night at Mandola's", "20% of proceeds go to our class fund. Just mention Kiker 1st Grade.", "Dana Reyes"]],
      29: [["📚 Library day", "Return your library books by Tuesday.", "Miss Taylor"]],
      30: [["🍎 Parent volunteer sign-up", "Help with lunch duty in October. Sign up in Links.", "Dana Reyes"]],
    };
    const NO_SCHOOL = [7];
    const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    // Sep 1, 2026 is a Tuesday, so DAYS[d % 7] names any September date
    const cells = [];
    for (let i = 0; i < 2; i += 1) cells.push("");
    for (let d = 1; d <= 30; d += 1) cells.push(d);
    while (cells.length % 7) cells.push("");
    const cal = cells.map((d) => {
      if (!d) return `<span class="c empty"></span>`;
      const past = d < 24, today = d === 24, red = NO_SCHOOL.includes(d), dot = NOTES[d] || red;
      return `<button class="c${past ? " past" : ""}${today ? " on today" : ""}${red ? " red" : ""}" data-day="${d}"${past ? ' tabindex="-1"' : ""}>${d}${dot ? "<i></i>" : ""}</button>`;
    }).join("");
    const notes = (d) => (NOTES[d] || []).map(([t, p, by]) => `<div class="note"><b>${t}</b><p>${p}</p><small>By: ${by}</small></div>`).join("")
      || `<p class="empty-day">No notes yet for this day.</p>`;
    const link = (n, u) => `<div class="lk"><span class="ic">${phi("link-simple")}</span><span class="tx"><b>${n}</b><small>${u}</small></span>
        <span class="acts"><i class="ed">${phi("pencil-simple-line")}</i><i class="rm">${phi("trash")}</i></span></div>`;
    const TABS = [["chat", "chats-teardrop", "Chat"], ["calendar", "calendar-dots", "Calendar"], ["updates", "envelope-simple", "Updates"], ["links", "push-pin", "Links"]];
    const app = document.createElement("div");
    app.className = "sx-app cls-app";
    app.setAttribute("aria-hidden", "true");
    app.innerHTML = `<img class="cls-doodle" src="${A}cls-doodle.webp" alt="">${statusBar}
      <header class="cls-head">
        <div class="row"><span class="cls-back">${back}</span>
          <div class="who"><span class="mt">MT</span><b>Miss Taylor Class</b><small>10 members</small></div>
          <span class="cls-edit">${phi("pencil-simple-line")}</span></div>
        <nav class="cls-tabs">${TABS.map(([k, icon, label]) => `<span data-cls="${k}" class="${k === "chat" ? "on" : ""}">${phi(icon)}${label}${k === "updates" ? '<i class="badge">2</i>' : ""}</span>`).join("")}</nav>
      </header>
      <section class="cls-view on" data-v="chat">
        <div class="cls-scroll">
          ${msg("cls-floyd", "Floyd Miles", "Hey, how are you guys?")}
          ${msg("cls-guy", "Guy Hawkins", "Yoow What is up everyone, so far so good", true)}
          ${msg("cls-base", "Robert Hugos", "Hi guys, i’m good as well here")}
          ${msg("cls-albert", "Albert Flores", "Yeah me too, never feelin so great like this", true)}
          <div class="cl-msg mine multi"><div class="col"><div class="bub">${tail(true)}<p>Hi everyone! Happy to bring snacks for the class party on Friday.</p><time>10:00PM</time></div></div></div>
          <div class="cl-msg multi reply"><img class="av" src="${A}cls-floyd.webp" alt=""><div class="col"><span class="nm">Floyd Miles</span>
            <div class="bub">${tail()}<div class="rp"><span class="to"><i class="jm">JM</i>Replying to James Martin</span>
              <span class="q">Hi guys, thanks for letting me in into this group can’t wait to hear amazing stories from all at you</span></div>
              <div class="last"><p>Well, welcome to the club buddy!</p><time>10:00PM</time></div></div></div></div>
        </div>
        <div class="cls-type"><div class="bar"><span class="pic">${phi("image")}</span><span class="in">Type Message</span><span class="send">${phi("paper-plane-right")}</span></div><span class="ind"></span></div>
      </section>
      <section class="cls-view" data-v="calendar">
        <div class="cal-top"><div class="t"><b>September 2026</b><span class="fs">${phi("frame-corners")}</span></div>
          <div class="nav"><span>${phi("caret-left")}</span><span>${phi("caret-right")}</span></div></div>
        <div class="cal-grid"><span class="h">S</span><span class="h">M</span><span class="h">T</span><span class="h">W</span><span class="h">T</span><span class="h">F</span><span class="h">S</span>${cal}</div>
        <div class="cal-key"><span><i class="sq"></i>Today</span><span><i class="sq red"></i>No school</span><span><i class="dot"></i>Has notes</span></div>
        <div class="cal-day"><div class="hd"><b class="cal-date">Thursday, Sep 24</b><span class="add">${phi("plus")}Add Note</span></div>
          <div class="cal-notes">${notes(24)}</div></div>
        <span class="ind"></span>
      </section>
      <section class="cls-view" data-v="updates">
        <div class="up-hd"><b>Updates</b><span class="inbox"><i class="mt sm">LM</i><span>Lydia’s class inbox</span>${phi("caret-right")}</span></div>
        <div class="up-card new"><b>Picture day is Friday</b><p>Class photos are Friday, Sep 25 at 8:30 AM. Pick your package with the link in Links.</p>
          <div class="ft"><span><i class="mt sm">MT</i>taylor@kikerelementary.com</span><time>Sep 23, 4:12 PM</time></div></div>
        <div class="up-card"><b>Water day supplies</b><p>Please send a towel and sunscreen with your kid on Thursday. Thank you!</p>
          <div class="ft"><span><i class="mt sm">MT</i>taylor@kikerelementary.com</span><time>Sep 22, 7:30 PM</time></div></div>
        <span class="ind"></span>
      </section>
      <section class="cls-view" data-v="links">
        <div class="lk-hd"><b>Pinned links</b><small>set by your admin</small></div>
        <div class="lk-list">${link("School website", "austinisd.org")}${link("Ms. Taylor's Wish List", "amazon.com")}${link("Class Donations", "venmo.com/room-parent")}</div>
        <div class="lk-add"><span class="ic">${phi("plus-circle")}</span><b>Add a link</b></div>
        <p class="lk-note">Note: Admins can add and label links: school site, wishlist, donations, merch, or anything else your group needs.</p>
        <span class="ind"></span>
      </section>`;
    clsPanel.appendChild(app);
    // pictures of the app, not controls: the section's tablist is the way in (for now)
    app.querySelectorAll(".cls-view:not([data-v=calendar])").forEach((v) => (v.inert = true));
    clsPanel.classList.add("is-live");
    fitTo(clsPanel, app);
    // the calendar's own dates work: pick a day, see its notes
    app.addEventListener("click", (e) => {
      const day = e.target.closest(".c[data-day]:not(.past)");
      if (!day) return;
      app.querySelectorAll(".cal-grid .c").forEach((c) => c.classList.toggle("on", c === day));
      const d = Number(day.dataset.day);
      app.querySelector(".cal-date").textContent = `${DAYS[(d) % 7]}, Sep ${d}`;
      app.querySelector(".cal-notes").innerHTML = notes(d);
    });
    // so the section's own tablist (script.js) drives these screens
    window.sproutClasses = {
      show(view) {
        app.dataset.view = view;
        app.querySelectorAll(".cls-view").forEach((v) => v.classList.toggle("on", v.dataset.v === view));
        app.querySelectorAll(".cls-tabs [data-cls]").forEach((t) => t.classList.toggle("on", t.dataset.cls === view));
      },
    };
    const current = document.querySelector('[data-class-view][aria-selected="true"]');
    if (current) window.sproutClasses.show(current.dataset.classView);
  }

  /* ── Sprout Assist story ── */
  const storyPhone = document.querySelector(".story-phone");
  if (storyPhone) {
    const needRow = ([img, n, d]) => `<div class="item"><span class="sa-tile"><img src="${A}${img}.webp" alt=""></span>
          <span class="tx"><span class="n">${n}</span><br><span class="d">${d}</span></span></div>`;
    const LISTEN = {
      reminder: ["bell", "“Remind my husband to pick up Presley from school at 2PM today.”",
        [["need-who", "Who’s it for?", "You, your spouse, or both of you."], ["need-what", "What’s it about?", "Say what you need to remember."], ["need-when", "When’s it happening?", "Add a date, a time, or both. Totally optional."]]],
      carpool: ["bus-lg", "“Can you help me grab my kids on Friday morning and take them to Kiker Elementary?”",
        [["need-where", "Where will your kid be picked up?", "Is it school, summer camp, or somewhere else?"], ["need-who", "Who’s it for?", "For you, your spouse, or ask other parents."], ["need-when", "When’s it happening?", "Add a date and a time."]]],
      event: ["event-lg", "“Let’s throw a party for Presley’s 6th birthday at Zilker Park this Saturday at 2PM!”",
        [["need-what", "What’s it about?", "The occasion, like a birthday or a playdate."], ["need-when", "When’s it happening?", "Add a date and a time."], ["need-where", "Where’s it happening?", "A park, a home, or an address."]]],
      club: ["club-lg", "“I want to start a club called Circle C Dads so we can all hang out together.”",
        [["need-what", "What’s it called?", "A name parents will recognize."], ["need-why", "What’s it for?", "One line on why people should join."]]],
    };
    const rows = [["Reminder", "A quick nudge for you or your spouse", "ic-reminder"], ["Carpool", "Request for pick up and drop off from others", "ic-carpool"],
      ["Event", "Playdates, outings & parties", "ic-event"], ["Birthday", "A magical AI cover for your kid, in seconds", "ic-birthday"], ["Club", "Gather your people by interest", "ic-club"]];
    const nav = `<nav class="sa-nav" aria-hidden="true">${[["sun-horizon", "Daily Brief"], ["compass", "Events"], ["", "Sprout Assist"], ["chat-circle-dots", "Chat"], ["users", "Clubs"]]
      .map(([icon, label]) => `<button tabindex="-1" class="${icon ? "" : "on"}">${icon ? phi(icon, "o") : `<img src="${A}clover.webp" alt="">`}${label === "Chat" ? '<i class="badge">2</i>' : ""}<span>${label}</span></button>`).join("")}</nav>`;
    const app = document.createElement("div");
    app.className = "assist-app story-app";
    app.setAttribute("aria-hidden", "true");
    app.innerHTML = `${statusBar}
      <section class="sa-screen sa-home is-on" data-s="assist">
        <div class="sa-tile logo"><img src="${A}clover.webp" alt=""></div>
        <h3>What are we creating today?</h3><p class="pick">Pick one below</p>
        <div class="sa-rows">${rows.map(([n, d, img]) => `<div class="sa-row"><span class="sa-tile"><img src="${A}${img}.webp" alt=""></span>
          <span class="tx"><span class="n">${n}</span><span class="d">${d}</span></span></div>`).join("")}</div>
        ${nav}
      </section>
      ${Object.entries(LISTEN).map(([k, [icon, quote, list]]) => `<section class="sa-screen sa-listen is-heard" data-s="${k}">
        <div class="sa-head"><span class="sa-back">${back}</span><span class="sp"></span></div>
        <div class="body"><div class="sa-tile icon"><img src="${A}${icon}.webp" alt=""></div>
          <div class="sa-say"><span class="lbl">Say it like this</span><span class="q">${quote}</span>
            <div class="row"><span class="sa-orb"><img src="${A}orb.webp" alt=""><canvas class="sa-thinking-orb"></canvas></span>
              <span class="state">Listening…</span><span class="sa-check">${check}</span></div></div>
          <div class="sa-need"><h4>Needed information</h4><div class="list">${list.map(needRow).join("")}</div></div></div>
        <span class="sa-home-ind"></span>
      </section>`).join("")}`;
    app.inert = true;
    storyPhone.appendChild(app);
    storyPhone.classList.add("is-live");
    fitTo(storyPhone, app);
    // one live orb per listening screen, playing only while its screen shows
    const orbs = {};
    app.querySelectorAll(".sa-listen").forEach((s) => {
      const orb = window.SproutThinkingOrb && window.SproutThinkingOrb.create(s.querySelector(".sa-thinking-orb"), { state: "listening", size: 64, theme: "light" });
      if (orb) { orbs[s.dataset.s] = orb; s.querySelector(".sa-orb").classList.add("has-thinking-orb"); }
    });
    window.sproutStory = {
      show(key) {
        app.querySelectorAll(".sa-screen").forEach((s) => s.classList.toggle("is-on", s.dataset.s === key));
        Object.entries(orbs).forEach(([k, orb]) => (k === key ? orb.play() : orb.pause()));
      },
    };
    const scene = document.querySelector(".story-scene");
    window.sproutStory.show((scene && scene.dataset.screen) || "assist");
  }

  /* ── Family moments 01: the to-do card, as the updated Daily Brief draws it ── */
  const cut = document.querySelector(".moment-visual.morning .attention-cutout");
  if (cut) {
    const todo = (n, m, { tag = "", done = false, go = false } = {}) => `<div class="db-todo${done ? " is-done" : ""}"><span class="box">${phi("check")}</span>
      <span class="tx"><span class="n">${n}${tag}</span><span class="m">${m}</span></span>${go ? `<span class="go">${phi("arrow-right")}</span>` : ""}</div>`;
    const box = document.createElement("div");
    box.className = "attention-cutout sx-att";
    box.setAttribute("role", "img");
    box.setAttribute("aria-label", "Daily Brief to-dos with class names and due days");
    box.innerHTML = `<div class="sx-app"><div class="db-att mt-rem">
        <div class="hd"><span class="chev open">${phi("caret-down")}</span><div class="tt"><div class="n">Needs your attention</div><div class="d">Two things left for today.</div></div>
          <span class="ring" style="--p:.333"><span>1/3</span></span></div>
        ${todo("Bring towels for water day", "1st Grade Class · <small>Due Today</small>")}
        ${todo("Presley submit project reports", "Miss Taylor Class · <small>Due Friday</small>", { done: true, go: true })}
        ${todo("Plan field trip itinerary", '4th Grade Class · <small class="late">2 days overdue</small>', { tag: ' <i class="tag">From Matt</i>' })}
      </div></div>`;
    cut.replaceWith(box);
    const inner = box.firstElementChild;
    // the card is drawn at 361 wide and scaled; its box takes the scaled height
    const fit = () => {
      const scale = box.clientWidth / 361;
      inner.style.setProperty("--sa-scale", String(scale));
      box.style.height = `${inner.offsetHeight * scale}px`;
    };
    new ResizeObserver(fit).observe(box);
    fit();
  }
})();
