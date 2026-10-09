/* Website v2, structure pass (Tony, 7 Oct).

   Three phones, all coded at the app's 393 x 852 and scaled into the page:
   - Daily Brief: Figma 13266:241031 (Dev Ready, 2A·2 Family to-do list). The page scroll drives
     the brief's own scroll while the section is pinned.
   - Class group chats: a Chat list of every class (assist-demo.css .sa-chat), then the class
     screens that sections-demo.js mounts into #class-screen-panel.
   - Member directory: Clubs 12767:108049 (assist-demo.css .sa-clubs), a parent profile
     (15.4 Clubs - User Details 2377:38114) and a private message.

   Demo content: one real morning (Tony, 8 Oct: "Show a real morning instead of describing it"), Thursday Oct 8:
   Pajama Day, Mia's $5 for the book fair, Ava's party RSVP due Friday, you on carpool and Lydia on pickup. The phone
   carries it on its own (the cards beside it were cut the same evening). The Figma host "Patrick Collison" and the "By:" names are swapped
   for the page's fictional cast.

   8 Oct for the React build (Syed): the class and directory sections are pinned too now. The copy no longer scrolls
   past the phone; the scroll swaps one step for the next in the same place (Tony: "flash perfectly in the right
   spot"). */
(function () {
  const A = "./assets/assist/";
  const V = "./assets/v2/";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  // Phosphor regular paths, copied from assist-demo.js (the .sq buttons there style svg icons)
  const PH = {"magnifying-glass":"M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z","user-plus":"M256,136a8,8,0,0,1-8,8H232v16a8,8,0,0,1-16,0V144H200a8,8,0,0,1,0-16h16V112a8,8,0,0,1,16,0v16h16A8,8,0,0,1,256,136Zm-57.87,58.85a8,8,0,0,1-12.26,10.3C165.75,181.19,138.09,168,108,168s-57.75,13.19-77.87,37.15a8,8,0,0,1-12.25-10.3c14.94-17.78,33.52-30.41,54.17-37.17a68,68,0,1,1,71.9,0C164.6,164.44,183.18,177.07,198.13,194.85ZM108,152a52,52,0,1,0-52-52A52.06,52.06,0,0,0,108,152Z","user":"M230.92,212c-15.23-26.33-38.7-45.21-66.09-54.16a72,72,0,1,0-73.66,0C63.78,166.78,40.31,185.66,25.08,212a8,8,0,1,0,13.85,8c18.84-32.56,52.14-52,89.07-52s70.23,19.44,89.07,52a8,8,0,1,0,13.85-8ZM72,96a56,56,0,1,1,56,56A56.06,56.06,0,0,1,72,96Z","check":"M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z","plus":"M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z","note-pencil":"M229.66,58.34l-32-32a8,8,0,0,0-11.32,0l-96,96A8,8,0,0,0,88,128v32a8,8,0,0,0,8,8h32a8,8,0,0,0,5.66-2.34l96-96A8,8,0,0,0,229.66,58.34ZM124.69,152H104V131.31l64-64L188.69,88ZM200,76.69,179.31,56,192,43.31,212.69,64ZM224,128v80a16,16,0,0,1-16,16H48a16,16,0,0,1-16-16V48A16,16,0,0,1,48,32h80a8,8,0,0,1,0,16H48V208H208V128a8,8,0,0,1,16,0Z"};
  const phi = (k) => `<svg class="ph" viewBox="0 0 256 256" aria-hidden="true"><path d="${PH[k]}"/></svg>`;
  const statusBar = `<div class="sa-sb" aria-hidden="true"><span>9:41</span><span class="r">
    <svg width="18" height="12" viewBox="0 0 18 12"><rect x="0" y="8" width="3" height="4" rx="1"/><rect x="5" y="6" width="3" height="6" rx="1"/><rect x="10" y="3" width="3" height="9" rx="1"/><rect x="15" y="0" width="3" height="12" rx="1"/></svg>
    <svg width="16" height="12" viewBox="0 0 16 12"><path d="M8 11.5 5.6 9a3.4 3.4 0 0 1 4.8 0zM3.4 6.8a6.5 6.5 0 0 1 9.2 0l-1.3 1.3a4.7 4.7 0 0 0-6.6 0zM1.1 4.5a9.8 9.8 0 0 1 13.8 0l-1.3 1.3a8 8 0 0 0-11.2 0z"/></svg>
    <svg width="27" height="13" viewBox="0 0 27 13"><rect x=".5" y=".5" width="23" height="12" rx="3.5" fill="none" stroke="#1e3e2b"/><rect x="2.5" y="2.5" width="19" height="8" rx="2"/><rect x="25" y="4.5" width="1.5" height="4" rx=".7"/></svg>
  </span></div>`;
  // scale a 393-wide app into its phone
  const fit = (box, app) => {
    const set = () => app.style.setProperty("--sa-scale", String(box.clientWidth / 393));
    new ResizeObserver(set).observe(box);
    set();
  };
  const mount = (box, cls) => {
    const app = document.createElement("div");
    app.className = `assist-app v2-app ${cls}`;
    app.setAttribute("aria-hidden", "true");
    box.appendChild(app);
    fit(box, app);
    return app;
  };
  const nav = (on) => `<nav class="v2-nav">${[["sun-horizon", "Daily Brief"], ["compass", "Events"], ["", "Sprout Assist"], ["chat-circle-dots", "Chat"], ["users", "Clubs"]]
    .map(([icon, label]) => `<span class="${label === on ? "on" : ""}">${icon ? `<i class="ph${label === on ? "-fill" : ""} ph-${icon}"></i>` : `<img src="${A}clover.webp" alt="">`}${label === "Chat" ? "<b>2</b>" : ""}<small>${label}</small></span>`).join("")}</nav>`;

  /* ── Daily Brief (13266:241031) ── */
  const DAD = `${V}dad.webp`, MOM = `${V}mom.webp`;
  const face = (both) => `<span class="v2-face${both ? " pair" : ""}"><img src="${DAD}" alt="">${both ? `<img src="${MOM}" alt="">` : ""}</span>`;
  const todo = (title, chip, tone, cls, both, part = "") => `<div class="v2-todo"${part ? ` data-part="${part}"` : ""}><span class="box"></span>${face(both)}
      <span class="tx"><b>${title}</b><span class="m"><i class="chip ${tone}">${chip}</i>${cls}</span></span></div>`;
  const today = (time, title, desc) => `<div class="v2-hap"><span class="t">${time}</span><span class="dot"></span>
      <span class="c"><b>${title}</b><span>${desc}</span></span></div>`;
  const up = (mon, day, title, desc, by, red, time = "") => `<div class="v2-up"><span class="d${red ? " red" : ""}"><small>${mon}</small><b>${day}</b></span>
      <span class="tx"><span class="h"><b>${title}</b>${time ? `<small>${time}</small>` : ""}</span><span class="p">${desc}</span><span class="by">By: ${by}</span></span></div>`;
  const briefBox = document.getElementById("briefPhone");
  let brief;
  if (briefBox) {
    brief = mount(briefBox, "v2-brief");
    brief.innerHTML = `${statusBar}
      <div class="v2-notif"><img class="ic" src="./assets/logo.png" alt=""><span class="tx"><span class="hd"><b>Sprout</b><small>now</small></span>
        <span class="bd"><img src="${MOM}" alt=""><span><b>Lydia</b> took a to-do: Pick up Presley and Mia, today at 3:00 PM</span></span></span></div>
      <div class="v2-db"><div class="v2-db-in">
        <header class="v2-db-top"><img class="av" src="${DAD}" alt=""><span class="t"><b>Sprout AI</b><small>Thursday, October 8</small></span><i class="ph ph-bell"></i></header>
        <div class="v2-db-body">
          <div class="v2-hello"><div><h3>Your day, in order.</h3><em>Full, but manageable.</em></div><span class="wx"><span>☀️</span><small>68–86°</small></span></div>
          <hr>
          <div class="v2-todos" data-part="todo">
            <div class="hd">${face(true)}<b>Family To-Do List</b><span class="add"><i class="ph ph-plus"></i></span></div>
            ${todo("Drive the morning carpool", "Today 7:40 AM", "green", "Kiker Elementary", false, "todo-carpool")}
            <!-- the shared to-do that arrives (Ahmad, 7 Oct; 8 Oct: Lydia takes pickup, "you're on carpool, Lydia's got
                 pickup"); it lands here from the notification, with her face on it -->
            <div class="v2-new"><div class="v2-todo"><span class="box"></span><span class="v2-face"><img src="${MOM}" alt=""></span>
              <span class="tx"><b>Pick up Presley and Mia</b><span class="m"><i class="chip green">Today 3:00 PM</i><span class="from">Lydia’s on it</span></span></span></div></div>
            ${todo("Send $5 for the book fair", "Due today", "red", "Mrs. Kruszone’s Class", true, "todo-fair")}
            ${todo("Sign Jake’s permission slip", "Due tomorrow", "amber", "Ms. Jessica’s Class", false)}
          </div>
          <hr>
          <div class="v2-sec" data-part="invites"><p class="v2-h"><span>📆 Your Invitations</span><small>2 Events</small></p>
            <div class="v2-invs">
              <div class="v2-inv"><div class="r"><img src="${V}inv-bday.webp" alt=""><span><b>Ava’s Birthday Party!</b><small>Sat, Oct 10 · 2:00pm · <em class="rsvp">RSVP by Fri</em></small><span class="host"><img src="${A}dm-fatima.webp" alt="">Priya Shah</span></span></div>
                <div class="btns"><span class="sec">Deny</span><span class="pri">Join</span></div></div>
              <div class="v2-inv"><div class="r"><img src="${A}inv-zilker.webp" alt=""><span><b>Family Fun Day at Zilker Park</b><small>Sun, Oct 11 · 10:00am CST</small><span class="host"><img src="${A}dm-raj.webp" alt="">Raj Singh</span></span></div>
                <div class="btns"><span class="sec">Deny</span><span class="pri">Join</span></div></div>
            </div>
          </div>
          <hr>
          <div class="v2-sec" data-part="today"><p class="v2-h"><span>📅 Happening today</span></p>
            <div class="v2-haps">${today("All day", "🧸 Pajama Day", "Kiker Elementary · PJs to school")}${today("1:30 PM", "Soccer practice", "Little Shots · Field 2")}${today("6:30 PM", "Parent-teacher night", "1st Grade · Room 102")}</div>
          </div>
          <hr>
          <div class="v2-sec" data-part="upcoming"><p class="v2-h"><span>📆 Upcoming events</span></p>
            <div class="v2-ups">
              ${up("Oct", 9, "✅ Miss Taylor’s Class Photo Day", "Don’t forget to pick your photo slot with the link I shared.", "Dana Reyes", false, "8:30AM")}
              ${up("Oct", 10, "📝 Spirit Night at Mandola’s", "20% of proceeds go to our class fund. Just mention Kiker 1st Grade.", "Dana Reyes")}
              ${up("Oct", 12, "🚫 No School", "Fall Holiday", "Kiker Elementary", true)}
            </div>
          </div>
          <hr>
          <div class="v2-sec v2-lunch" data-part="lunch"><p class="v2-h"><span>🥪 Today’s Lunch (Kiker Elementary)</span></p>
            <ol><li>Hamburger 🍖 🌱</li><li>Rebellyous Burger 🍖</li><li>SunButter &amp; Jelly Sandwich 🍖 🥪</li></ol>
          </div>
          <hr>
          <div class="v2-sec"><p class="v2-h"><span>🎂 Birthdays</span></p>
            <div class="v2-bday"><span class="cake">🎂</span><span><b>Kennedy turns 4 today!</b><small>Say happy birthday at drop-off 👋</small></span></div>
            <p class="v2-bl"><b>Ava (7)</b> — <span>Oct 10th</span></p><p class="v2-bl"><b>Rome (1)</b> — <span>Oct 14th</span></p>
          </div>
          <hr>
          <div class="v2-sec v2-msgs" data-part="messages"><p class="v2-h"><span>💬 New messages</span></p>
            <ul><li>2 unread in <u>Kindergarten</u></li><li>1 message from <u>Sarah Chen</u></li></ul>
          </div>
        </div>
      </div></div>
      ${nav("Daily Brief")}
      <span class="sa-home-ind"></span>`;
  }

  /* Pinned Daily Brief: the page scroll moves the brief. */
  const briefSec = document.getElementById("brief");
  let briefInner, briefMax = 0;
  const measureBrief = () => {
    if (!brief) return;
    briefInner = brief.querySelector(".v2-db-in");
    // the brief scrolls until its last line clears the floating tab bar (852 - 120)
    briefMax = Math.max(0, briefInner.scrollHeight - 732);
  };
  const briefPin = briefSec && briefSec.querySelector(".scrolly-pin");
  const briefStage = briefSec && briefSec.querySelector(".scrolly-stage");
  const clamp01 = (v) => Math.min(1, Math.max(0, v));
  const narrow = matchMedia("(max-width: 900px)");
  // smootherstep: flat at both ends, no sharp middle (the cubic in-out felt like a jump, Ahmad 7 Oct)
  const soft = (t) => t * t * t * (t * (t * 6 - 15) + 10);
  // what the scroll asks for, and what is on screen; the screen glides toward the scroll each frame
  const want = { t: 0, s: 0, y: 0 }, shown = { t: 0, s: 0, y: 0 };
  let gliding = false;
  const scrubBrief = () => {
    if (!briefSec || !briefInner) return;
    const r = briefSec.getBoundingClientRect();
    const run = briefSec.offsetHeight - innerHeight;
    const raw = clamp01(-r.top / Math.max(1, run));
    // 1 · the landing (Ahmad, 7 Oct): the phone arrives centred under "Sprout puts them in one place" and holds,
    //     then moves into its column on the right while the copy comes in (raw 0.08-0.36)
    want.t = soft(clamp01((raw - 0.08) / 0.28));
    // 2 · then the brief scrolls with the page, holding still for a moment at the end
    // Lydia's shared to-do arrives between the settle and the scroll (raw 0.36-0.50), driven by the scroll too
    want.s = clamp01((raw - 0.36) / 0.14);
    want.y = clamp01((raw - 0.5) / 0.44) * briefMax;
    if (!gliding) { gliding = true; requestAnimationFrame(glide); }
  };
  const drawBrief = () => {
    const pin = briefPin.getBoundingClientRect(), st = briefStage.getBoundingClientRect();
    const dx = pin.left + pin.width / 2 - (st.left + st.width / 2);
    const t = shown.t;
    // phone width: the phone has no copy beside it (Tony, 8 Oct), so it lands lower, under the intro line, then rises
    const drop = narrow.matches ? 92 : 44;
    briefBox.style.transform = `translate(${(dx * (1 - t)).toFixed(1)}px, ${((1 - t) * drop).toFixed(1)}px) scale(${(0.86 + 0.14 * t).toFixed(4)})`;
    briefPin.style.setProperty("--in", t.toFixed(3));
    drawShared(shown.s);
    briefInner.style.transform = `translateY(${(-shown.y).toFixed(1)}px)`;
  };
  /* Shared to-do (Ahmad, 7 Oct): Lydia's to-do arrives as a notification and lands in the Family To-Do List, all on
     the scroll (s 0-1), so it runs backwards when you scroll back up:
       0.00-0.30  the notification slides down from the top of the phone
       0.30-0.50  it holds, long enough to read
       0.50-0.85  it slides down into the list, shrinking and fading, as the list opens a row for it
       0.85-1.00  the new row's green fades to white */
  let noteEl, slotEl, rowEl, rowH = 0, lastSlot = -1;
  const mix = (a, b, f) => a.map((v, i) => Math.round(v + (b[i] - v) * f));
  function drawShared(s) {
    if (!noteEl) {
      noteEl = brief.querySelector(".v2-notif"); slotEl = brief.querySelector(".v2-new"); rowEl = slotEl.firstElementChild;
      rowH = rowEl.offsetHeight;
    }
    const enter = soft(clamp01(s / 0.3)), fly = soft(clamp01((s - 0.5) / 0.35)), open = soft(clamp01((s - 0.55) / 0.3));
    const h = Math.round(rowH * open);
    if (h !== lastSlot) { slotEl.style.height = h + "px"; lastSlot = h; measureBrief(); }
    // where the row sits now, in the app's own 393-wide pixels
    const a = brief.getBoundingClientRect(), r = slotEl.getBoundingClientRect(), k = a.width / 393;
    const dy = (r.top - a.top) / k - noteEl.offsetTop;
    const y = (1 - enter) * -140 / 100 * noteEl.offsetHeight + fly * dy;
    noteEl.style.transform = `translateY(${y.toFixed(1)}px) scale(${(1 - 0.1 * fly).toFixed(3)})`;
    noteEl.style.opacity = (enter * (1 - clamp01((fly - 0.6) / 0.4))).toFixed(3);
    const flash = clamp01((s - 0.85) / 0.15);
    rowEl.style.background = open > 0 ? `rgb(${mix([226, 233, 227], [255, 255, 255], flash).join(",")})` : "";
  }
  function glide() {
    const k = reduce.matches ? 1 : 0.14;
    shown.t += (want.t - shown.t) * k;
    shown.s += (want.s - shown.s) * k;
    shown.y += (want.y - shown.y) * k;
    const done = Math.abs(want.t - shown.t) < 0.001 && Math.abs(want.s - shown.s) < 0.001 && Math.abs(want.y - shown.y) < 0.5;
    if (done) { shown.t = want.t; shown.s = want.s; shown.y = want.y; }
    drawBrief();
    if (done) { gliding = false; return; }
    requestAnimationFrame(glide);
  }

  /* ── Class group chats ── */
  const classBox = document.getElementById("classPhone");
  let chats;
  if (classBox) {
    chats = mount(classBox, "v2-chats");
    // the app's own Chat screen (Figma 12398:209125, as in Video 6): the kids' classes are the teachers' faces;
    // on the scroll each one gets its kid's name and a green ring (updateSteps)
    const groups = [["cast-teacher-taylor", "Mrs. Taylor’s", "Presley"], ["cast-aisha", "Ms. Jessica’s", "Jake"], ["cast-teacher-kruszone", "Mrs. Kruszone’s", "Mia"]];
    const dms = [["raj", "Raj Singh", "Raj: See you there!", "8:30 PM", 4], ["joe", "Joe Mravca", "You: Yeah I’ll call you again in a minute", "9:00 PM", 4],
      ["robert", "Robert Hugos", "Robert: my golf score was so good today!", "8:45 PM", 2], ["scott", "Scott Vogelgesang", "Scott: I don’t think so, let me think again", "8:50 PM", 5],
      ["eitan", "Eitan Miller", "You: I’ll go surf with you as well", "8:55 PM", 1], ["fatima", "Fatima Ali", "Fatima: Looking forward to it!", "9:15 PM", 6]];
    chats.innerHTML = `${statusBar}
      <section class="sa-screen sa-chat is-on">
        <div class="ch-head"><span class="sq brand">${phi("plus")}</span><h3>Chat</h3>
          <span class="r"><span class="sq">${phi("magnifying-glass")}</span><span class="sq">${phi("note-pencil")}</span></span></div>
        <div class="ch-scroll">
          <div class="ch-groups">
            ${groups.map(([img, n, kid]) => `<span data-kid><i class="kidpill">${kid}</i><img src="${V}${img}.webp" alt="">${n}</span>`).join("")}
            <span><img class="tile" src="${A}grp-bday.webp" alt="">Richard’s B-day</span>
          </div>
          <div class="ch-dmh"><h4>Direct Messages</h4><i class="ph ph-caret-down"></i></div>
          ${dms.map(([img, n, m, t, c]) => `<div class="ch-dm"><img src="${A}dm-${img}.webp" alt=""><div class="tx"><b>${n}</b><span>${m}</span></div>
            <div class="meta"><small>${t}</small><i>${c}</i></div></div>`).join("")}
        </div>
        ${nav("Chat")}
        <span class="sa-home-ind"></span>
      </section>`;
  }
  /* The class Calendar tab (Tony, 7 Oct: "just the events showing like we did with the video"): no month grid, the
     coming events as a list, like Video 6 rev 2 and Upcoming events in the Daily Brief. Same dates as the brief. */
  const calView = classBox && classBox.querySelector('.cls-view[data-v="calendar"]');
  if (calView) {
    calView.innerHTML = `<div class="v2-cal"><div class="hd"><b>Coming up</b><span class="add"><i class="ph ph-plus"></i>Add Note</span></div>
      <div class="v2-ups">
        ${up("Oct", 9, "📸 Picture Day", "Order forms went home in the blue folders. Retakes are October 20.", "Dana Reyes", false, "8:30 AM")}
        ${up("Oct", 10, "🍪 Fall Festival bake sale", "Four volunteer spots left at the bake sale table.", "Dana Reyes", false, "10 AM")}
        ${up("Oct", 12, "🚫 No School", "Fall Holiday", "Kiker Elementary", true)}
        ${up("Oct", 16, "🚌 Science museum field trip", "Permission slips are due Monday. Pack a lunch.", "Dana Reyes")}
        ${up("Oct", 30, "🎃 Class Halloween party", "Costumes welcome. Sign up for snacks in Links.", "Dana Reyes", false, "2 PM")}
      </div></div><span class="ind"></span>`;
    calView.inert = true;
  }

  /* ── Member directory ── */
  const dirBox = document.getElementById("dirPhone");
  let dir;
  if (dirBox) {
    dir = mount(dirBox, "v2-dir");
    const mem = (img, n, r, m) => `<div class="cl-mem${img === "jake" ? " pick" : ""}"><span class="pic"><img src="${A}mem-${img}.webp" alt="">${m !== "new" ? `<span class="bdg"><img src="${A}clover.webp" alt=""></span>` : ""}</span><div class="tx"><b>${n}${m !== "new" ? '<i class="met">Met</i>' : ""}</b><span>${r}</span></div>
        ${m === "new" ? '<i class="new">New</i>' : `<i class="meets">${phi("user")}${m} meets</i>`}</div>`;
    dir.innerHTML = `${statusBar}
      <section class="sa-screen sa-clubs is-on" data-s="clubs">
        <div class="cl-scroll">
          <div class="cl-comms">
            <span class="on"><img src="${A}club-kiker.webp" alt="">Kiker</span>
            <span><img src="${A}club-cdc.webp" alt="">CDC</span>
            <span><img src="${A}club-ssc.webp" alt="">SSC Soccer</span>
            <span><img src="${A}club-creator.webp" alt="">Creator Camp</span>
          </div>
          <div class="cl-chips">${["All", "Kindergarten", "1st Grade", "2nd Grade", "4th Grade"].map((c, i) => `<button class="${i === 0 ? "on" : ""}" tabindex="-1">${c}</button>`).join("")}</div>
          <div class="cl-dir"><span class="ring">50%</span><div class="tx"><b>Member Directory</b><span>You've met 8 out of 16 members</span></div>
            <span class="sq">${phi("magnifying-glass")}</span><span class="sq">${phi("user-plus")}</span></div>
          ${mem("jessica", "Jessica LaRonde", "Robert’s Mom", "new")}
          ${mem("jake", "Jake Thompson", "Erick's Dad", "new")}
          ${mem("emily", "Emily Centineo", "Flore’s Mom", 12)}
          ${mem("mike", "Mike Johnson", "Hawkins' Dad", 10)}
          ${mem("sarah", "Sarah Baker", "Howard’s Mom", 8)}
        </div>
        ${nav("Clubs")}
        <span class="sa-home-ind"></span>
      </section>
      <section class="sa-screen v2-prof" data-s="profile">
        <span class="v2-back"><i class="ph ph-caret-left"></i></span>
        <div class="v2-prof-in">
          <img class="big" src="${A}mem-jake.webp" alt="">
          <h3>Jake Thompson</h3><p class="rel">Erick’s dad</p><p class="where">Kiker Elementary</p>
          <div class="kids"><span><i>👦</i>Erick<small>1st Grade</small></span><span><i>👧</i>Nora<small>3 yrs</small></span></div>
          <hr><p class="lb">Interests</p>
          <div class="ints"><span>🚴 Cycling</span><span>🏕️ Camping</span><span>⚽ Soccer</span><span>🎣 Fishing</span><span>🍕 Pizza night</span></div>
          <hr><p class="lb">Events together</p>
          <div class="ev"><span class="d"><small>Sep</small><b>26</b></span><span><b>Fall Festival</b><small>Kiker Elementary · you both went</small></span></div>
        </div>
        <div class="v2-prof-cta"><span>Message</span></div>
        <span class="sa-home-ind"></span>
      </section>
      <section class="sa-screen v2-dm" data-s="message">
        <header class="v2-dm-top"><span class="v2-back"><i class="ph ph-caret-left"></i></span><img src="${A}mem-jake.webp" alt=""><span><b>Jake Thompson</b><small>Erick’s dad · Kiker Elementary</small></span></header>
        <div class="v2-dm-feed">
          <p class="v2-private"><i class="ph ph-lock-simple"></i>Only your name and photo are shared. Your phone number and email stay private.</p>
          <div class="b me">Hi Jake! Erick and Presley sit together in Miss Taylor’s class. Playdate at Zilker on Saturday?</div>
          <div class="b them">We’d love that! Does 10 AM work?</div>
          <div class="b me">Perfect. See you by the train 🚂</div>
        </div>
        <div class="v2-dm-compose"><span class="in">Message Jake</span><span class="send"><i class="ph ph-paper-plane-right"></i></span></div>
        <span class="sa-home-ind"></span>
      </section>`;
  }

  /* ── Steps: the step crossing the middle of the screen sets the phone's state ── */
  const setClassStep = (step) => {
    classBox.dataset.step = step;
    if (step !== "list" && window.sproutClasses) window.sproutClasses.show(step);
  };
  const setDirStep = (step) => {
    dirBox.dataset.step = step;
    const screen = step === "profile" ? "profile" : step === "message" ? "message" : "clubs";
    dir.querySelectorAll(".sa-screen").forEach((s) => s.classList.toggle("is-on", s.dataset.s === screen));
    const scroller = dir.querySelector(".cl-scroll");
    // "see who's who" scrolls the list so the parent we open next sits mid-screen
    scroller.scrollTo({ top: step === "comms" ? 0 : 150, behavior: reduce.matches ? "auto" : "smooth" });
    dir.classList.toggle("bounce", step === "comms");
  };
  /* Pinned steps (Tony, 8 Oct): the section is tall and its inside sticks. The scroll through the section picks the
     step; the step's copy swaps in place (fade), it never slides. Each step gets data-w units of scroll (default 1),
     the section is 100vh + --units x 70vh tall (home-v2.css), so every step holds for at least 70vh of scrolling.
     The class list step gets 2 units: the kids' names come in one by one over its first two thirds. */
  const kidSpans = chats ? [...chats.querySelectorAll("[data-kid]")] : [];
  const pinned = [];
  const watchSteps = (section, onStep, kids) => {
    const steps = [...section.querySelectorAll(".step")];
    const w = steps.map((s) => Number(s.dataset.w || 1)), total = w.reduce((a, b) => a + b, 0);
    // B1 (Ahmad, 8 Oct): a "02 / 05" counter on each step, and one bar that fills with the scroll through the section
    const pad = (n) => String(n).padStart(2, "0");
    steps.forEach((s, j) => s.insertAdjacentHTML("afterbegin", `<p class="ct" aria-hidden="true"><b>${pad(j + 1)}</b>/ ${pad(steps.length)}</p>`));
    const bar = section.querySelector(".bar i");
    const st = { section, steps, w, total, onStep, kids, bar, cur: -1 };
    pinned.push(st);
    updateSteps(st);
  };
  const updateSteps = (st) => {
    const r = st.section.getBoundingClientRect();
    const run = Math.max(1, st.section.offsetHeight - innerHeight);
    const prog = clamp01(-r.top / run);
    if (st.bar) st.bar.style.transform = `scaleX(${prog.toFixed(4)})`;
    let x = prog * st.total, i = 0;
    while (i < st.w.length - 1 && x >= st.w[i]) { x -= st.w[i]; i++; }
    const local = clamp01(x / st.w[i]);
    if (i !== st.cur) {
      st.cur = i;
      st.steps.forEach((s, j) => { s.classList.toggle("is-on", j === i); s.setAttribute("aria-hidden", String(j !== i)); });
      st.onStep(st.steps[i].dataset.step);
    }
    if (st.kids) kidSpans.forEach((k, j) => k.classList.toggle("on", i > 0 || local > 0.08 + j * 0.24));
  };

  /* ── "Join your schools" (Tony, 7 Oct; 9 Oct for where it goes):
     - a phone goes straight to its store: Android to Google Play, iPhone and iPad to the App Store;
     - a computer opens the QR pop-up (#getApp), iOS on the left, Android on the right, so you scan with your phone.
     iPadOS reports itself as a Mac, so a Mac with a touch screen counts as an iPad. ── */
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
      // the close button, or a click on the backdrop (outside the box)
      const r = getApp.getBoundingClientRect();
      const out = e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
      if (e.target.closest("[data-close]") || (out && e.target === getApp)) getApp.close();
    });
  }

  /* ── FAQ: <details> opens and closes with no motion by default ("harsh", Ahmad 8 Oct). Animate the height between the
     question alone and the question with its answer, and fade the answer in. Web Animations, so it works in Safari
     too (::details-content and interpolate-size don't yet). .is-open turns the + at once, not after the close. ── */
  document.querySelectorAll(".faq details").forEach((d) => {
    const sum = d.querySelector("summary"), ans = d.querySelector("p");
    let anim = null;
    d.classList.toggle("is-open", d.open);
    sum.addEventListener("click", (e) => {
      e.preventDefault();
      const opening = !d.classList.contains("is-open");
      d.classList.toggle("is-open", opening);
      if (reduce.matches) { d.open = opening; return; }
      const from = d.offsetHeight;
      if (anim) anim.cancel();
      if (opening) d.open = true;
      const border = d.offsetHeight - d.clientHeight;
      const to = opening ? d.offsetHeight : sum.offsetHeight + border;
      d.style.overflow = "hidden";
      anim = d.animate({ height: [`${from}px`, `${to}px`] }, { duration: opening ? 380 : 300, easing: "cubic-bezier(0.22, 1, 0.36, 1)" });
      if (ans) ans.animate(opening ? { opacity: [0, 1], transform: ["translateY(-6px)", "none"] } : { opacity: [1, 0] },
        { duration: opening ? 380 : 180, easing: "ease-out", delay: opening ? 60 : 0, fill: "backwards" });
      anim.onfinish = () => { if (!opening) d.open = false; d.style.overflow = ""; anim = null; };
    });
  });

  /* ── the close: Sprout's icons fly in once the section comes up, then bob (CSS) ── */
  const endTiles = document.querySelector(".end .tiles");
  if (endTiles) new IntersectionObserver((es, io) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    endTiles.classList.add("in");
    io.disconnect();
  }), { threshold: 0.25 }).observe(endTiles);

  /* ── start ── */
  const start = () => {
    measureBrief();
    scrubBrief();
    if (classBox) watchSteps(document.getElementById("classes"), setClassStep, true);
    if (dirBox) watchSteps(document.getElementById("directory"), setDirStep, false);
  };
  let ticking = false;
  addEventListener("scroll", () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { scrubBrief(); pinned.forEach(updateSteps); ticking = false; });
  }, { passive: true });
  addEventListener("resize", () => { measureBrief(); scrubBrief(); pinned.forEach(updateSteps); });
  // fonts change the brief's height, so measure once they're in
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(start);
})();
