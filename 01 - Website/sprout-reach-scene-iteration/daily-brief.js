/* The current Daily Brief (Figma Prod 16180:365329), coded. Used by home-v3 (hero + Daily Brief section) and the
   hero explorations in hero-photo-2026-11-20/. Set data-assets on the <script> to the assets folder (default ../assets/). Mounts into every [data-brief] box and
   plays what the brief does, on a 16 s loop:
     1  a teacher's email arrives as a push and drops in at the top of the To-Do List (from your school email)
     2  Dana checks off "Pick up Jake from soccer" (shared with your spouse)
     3  the brief scrolls through the day: invitations, happening today, upcoming events, lunch, birthdays
   Names are the demo cast (no real rosters). Reduced motion: the finished state, no movement. */
(() => {
  const B = (document.currentScript && document.currentScript.dataset.assets) || '../assets/';
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const T = `${B}brief/tony.webp`, DA = `${B}brief/dana.webp`, G = `${B}gmail.svg`;
  const clamp01 = v => Math.min(1, Math.max(0, v));
  const soft = t => t * t * t * (t * (t * 6 - 15) + 10);
  const mix = (a, b, f) => a.map((v, i) => Math.round(v + (b[i] - v) * f));
  const face = (srcs, gmail) => `<span class="db2-face${srcs.length > 1 ? ' pair' : ''}">${srcs.map(s => `<i style="background-image:url(${s})"></i>`).join('')}${gmail ? `<img class="g" src="${G}" alt="">` : ''}</span>`;
  const row = ({ t, chip, red, from, who, gmail, seen, time, done, cls = '' }) => `<div class="db2-row${done ? ' done' : ''}${cls}"><span class="db2-box"><i class="ph-bold ph-check"></i></span>${face(who, gmail)}
    <span class="tx"><b>${t}</b><span class="m"><i class="db2-chip${red ? ' red' : ''}">${chip}</i>${from ? `<span>From ${from}</span>` : ''}</span></span>
    <span class="db2-seen"><i class="ph${seen === 2 ? '-bold ph-checks' : ' ph-check'}"></i>${time}</span></div>`;
  const sb = `<div class="db2-sb"><span>9:41</span><span class="r"><svg width="18" height="12" viewBox="0 0 18 12"><rect x="0" y="8" width="3" height="4" rx="1"/><rect x="5" y="6" width="3" height="6" rx="1"/><rect x="10" y="3" width="3" height="9" rx="1"/><rect x="15" y="0" width="3" height="12" rx="1"/></svg>
    <svg width="16" height="12" viewBox="0 0 16 12"><path d="M8 11.5 5.6 9a3.4 3.4 0 0 1 4.8 0zM3.4 6.8a6.5 6.5 0 0 1 9.2 0l-1.3 1.3a4.7 4.7 0 0 0-6.6 0zM1.1 4.5a9.8 9.8 0 0 1 13.8 0l-1.3 1.3a8 8 0 0 0-11.2 0z"/></svg>
    <svg width="27" height="13" viewBox="0 0 27 13"><rect x=".5" y=".5" width="23" height="12" rx="3.5" fill="none" stroke="#111"/><rect x="2.5" y="2.5" width="19" height="8" rx="2"/><rect x="25" y="4.5" width="1.5" height="4" rx=".7"/></svg></span></div>`;
  const html = `${sb}
    <div class="db2-note"><span class="ic" style="background-image:url(${G})"></span><div class="tx"><div class="hd"><span>Sprout</span><small>now</small></div>
      New to-do from Miss Taylor’s email: <b>Send the picture day order form</b>, due Friday</div></div>
    <div class="db2-scroll">
      <div class="db2-hd"><span class="db2-av" style="background-image:url(${T})"></span><div class="mid"><b>Sprout AI</b><small>Monday, July 27</small></div><i class="ph ph-bell bell"></i></div>
      <div class="db2-hi"><b>Morning, Tony</b><span class="db2-wx">☀️ <strong>78–98°</strong> Sunny</span></div>
      <div class="db2-ssc"><div class="tag"><img src="${B}brief/ssc-logo.webp" alt="">SSC Kids <i>Closes Aug 16</i></div>
        <h4>Soccer sign-ups open</h4><div class="cm"><span><i style="background-image:url(${B}assist/mem-jessica.webp)"></i><i style="background-image:url(${B}assist/dm-raj.webp)"></i></span>4 classmates going</div>
        <span class="cta"><img src="${B}brief/assist-clover-knit.png" alt="">Sign Jake up · $135 ›</span><img class="kid" src="${B}brief/kid-cutout.webp" alt=""></div>
      <div class="db2-rule"></div>
      <div class="db2-card db2-todo">
        <div class="th"><span class="db2-av" style="background-image:url(${T})"></span><b>To-Do List</b><span class="plus"><i class="ph ph-plus"></i></span></div>
        <div class="db2-new">${row({ t:'Send the picture day order form', chip:'Due Fri', from:'ktaylor@lincolnelem.org', who:[T], gmail:true, seen:1, time:'now' })}</div>
        ${row({ t:'Pick up Jake from soccer', chip:'Today · 5:30 PM', red:true, who:[DA], seen:2, time:'8:12', cls:' pick' })}
        ${row({ t:'Buy a gift for Leo’s party', chip:'Due Sat', who:[DA], seen:1, time:'9:40' })}
        ${row({ t:'Send a pumpkin for the fall centers party', chip:'Due Oct 30', from:'ellen.price@gmail.com', who:[T, DA], gmail:true, seen:2, time:'7:58' })}
        ${row({ t:'Sign up for a race-day volunteer slot', chip:'Due Thu', from:'pta@lincolnelem.org', who:[T], gmail:true, seen:1, time:'7:40' })}
        <div class="db2-donel">Done (0) <i class="ph ph-caret-right"></i></div>
      </div>
      <div class="db2-rule"></div>
      <div class="db2-sh"><span>📆 Your Invitations</span><small>2 Events</small></div>
      <div class="db2-inv"><div class="r"><img src="${B}assist/inv-zilker.webp" alt=""><div><b>Family Fun Day at Zilker Park</b><small>Sat, Nov 9 · 6:30pm CST</small><span class="host"><i style="background-image:url(${B}assist/dm-raj.webp)"></i>Raj Singh</span></div></div>
        <div class="btns"><span>Deny</span><span class="pri">Join</span></div></div>
      <div class="db2-rule"></div>
      <div class="db2-sh"><span>📅 Happening today</span><small>4 things</small></div>
      <div class="db2-card">
        <div class="db2-hap"><div class="htop"><img src="${B}brief/calendar-check.png" alt=""><div><b>8:30 AM</b><i class="db2-chip">Jake · Miss Taylor’s class</i></div></div>
          <h5>Picture day</h5><p>Photos start at 8:30 in the gym. Jake wears his class shirt.</p>
          <div class="sub">☐ Send the picture day order form<small>Class shirt. Order form due Friday</small></div></div>
        <div class="db2-ev"><span class="t">All day</span><div><b>Crossing Guard Appreciation Week</b><div class="chips"><i class="db2-chip">Whole school</i><i class="db2-chip">Day 3 of 5</i></div><small>Thank-you cards go in on Friday</small></div></div>
        <div class="db2-ev"><span class="t">3:15 PM</span><div><b>Soccer practice</b><div class="chips"><i class="db2-chip">Jake · SSC U6 Blue</i></div><small>Field 2. Cleats and water</small></div></div>
        <div class="db2-ev"><span class="t">6:30 PM</span><div><b>Parent-teacher night</b><div class="chips"><i class="db2-chip">Jake · Room 102</i></div><small>Dana is going</small></div></div>
      </div>
      <div class="db2-rule"></div>
      <div class="db2-sh"><span>📆 Upcoming events</span><small>This week</small></div>
      <div class="db2-card"><div class="db2-up"><span class="d">Oct<b>23</b></span><div><b class="t">APEX Fun Run</b><small>Fri · Added by Tony</small></div></div>
        <div class="db2-up"><span class="d">Oct<b>23</b></span><div><b class="t">APEX Fundraiser</b><small>Fri · Added by Tony</small></div></div></div>
      <div class="db2-rule"></div>
      <div class="db2-sh"><span>🥪 Today’s Lunch (Lincoln Elementary)</span></div>
      <ol class="db2-list"><li>Hamburger</li><li>Rebellyous Burger</li><li>SunButter &amp; Jelly Sandwich</li></ol>
      <div class="db2-rule"></div>
      <div class="db2-sh"><span>🎂 Birthdays</span></div>
      <div class="db2-bday"><span style="font-size:30px">🎂</span><div><b>Kennedy turns 4 today!</b><small>Say happy birthday at drop-off 👋</small></div></div>
    </div>
    <nav class="db2-nav"><span class="on"><i class="ph-fill ph-sun-horizon"></i>Daily Brief</span><span><i class="ph ph-compass"></i>Events</span><span class="gap"></span>
      <span><i class="ph ph-chat-circle-dots badge"><b>2</b></i>Chat</span><span><i class="ph ph-users"></i>Clubs</span></nav>
    <span class="db2-clover"><img src="${B}brief/assist-clover-knit.png" alt=""><b>1</b></span><span class="db2-home"></span>`;

  document.querySelectorAll('[data-brief]').forEach(box => {
    const app = document.createElement('div');
    app.className = 'db2'; app.setAttribute('aria-hidden', 'true'); app.innerHTML = html; box.appendChild(app);
    const fit = () => app.style.setProperty('--k', box.clientWidth / 393);
    new ResizeObserver(fit).observe(box); fit();
    const note = app.querySelector('.db2-note'), slot = app.querySelector('.db2-new'), nrow = slot.firstElementChild, pick = app.querySelector('.pick'), scroll = app.querySelector('.db2-scroll');
    let rowH = 0, max = 0;
    const measure = () => { rowH = nrow.offsetHeight; max = Math.max(0, scroll.scrollHeight - 852 + 50 + 20); };
    const draw = (s, c, y) => {
      const enter = soft(clamp01(s / .3)), fly = soft(clamp01((s - .5) / .35)), open = soft(clamp01((s - .55) / .3));
      slot.style.height = Math.round(rowH * open) + 'px';
      const target = slot.offsetTop + scroll.offsetTop - y;   // where the new row sits, in the app's pixels
      note.style.transform = `translateY(${((1 - enter) * -140 + fly * (target - note.offsetTop)).toFixed(1)}px) scale(${(1 - .12 * fly).toFixed(3)})`;
      note.style.opacity = (enter * (1 - clamp01((fly - .6) / .4))).toFixed(3);
      nrow.style.background = open > 0 ? `rgb(${mix([226, 233, 227], [255, 255, 255], clamp01((s - .85) / .15)).join(',')})` : '';
      pick.classList.toggle('done', c > .5);
      pick.style.background = c > .5 && c < 1.5 ? `rgb(${mix([226, 233, 227], [255, 255, 255], clamp01(c - .5)).join(',')})` : '';
      scroll.style.transform = `translateY(${(-y).toFixed(1)}px)`;
    };
    /* data-brief="scroll": the page drives it (home-v3 Daily Brief section). progress 0-1 runs the same three beats:
       the email becomes a to-do (0-0.35), Dana checks one off (0.4), the day scrolls by (0.5-1) */
    box.sproutBrief = { set(p) { if (!max) measure(); draw(clamp01(p / .35), (p - .4) / .08, soft(clamp01((p - .5) / .5)) * max); }, measure };
    const start = () => {
      measure();
      if (box.dataset.brief === 'scroll') { box.sproutBrief.set(box._p || 0); return; }
      if (still) { draw(1, 2, 0); return; }
      const LOOP = 16000, t0 = performance.now();
      const tick = now => {
        const t = (now - t0) % LOOP;
        let s = clamp01((t - 700) / 4400);              // 1 · the email becomes a to-do (0.7-5.1 s)
        let c = (t - 5600) / 900;                       // 2 · Dana checks one off (5.6 s), its row flashes
        let y = soft(clamp01((t - 7600) / 5200)) * max; // 3 · the day scrolls by (7.6-12.8 s)
        if (t > 14000) { const back = soft(clamp01((t - 14000) / 1100)); s *= 1 - back; y *= 1 - back; if (back > .5) c = -1; }
        draw(s, c, y);
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => setTimeout(start, 80));
  });
})();
