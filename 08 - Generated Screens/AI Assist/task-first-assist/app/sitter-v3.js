/* Book a sitter (C1) + Plan a date night (C2), in the order Tony asked for (chat, 17 Nov 9:17 AM).
   C1: date + duration → which kids (photos, all on) → request details → who to ask:
       saved sitters / none saved: class parents' sitters or add one / nobody: ask a class group, parents share
       a sitter's name + number (that view is /sitter-v3-share/) → send → replies → confirm → booked.
   C2: date + time → distance → food → budget → 3–5 places (photos, menu, website, why I picked it) → open times,
       closest to yours first → Sprout books → then C1 from "which kids", date already filled in.
   Parts: SSC demo + the camp map (date-night-map.js). Family state comes from the route, never a switch in the app. */
(() => {
const X = window.Sprout, { sleep, el, toast, bsheet, addField, fieldRow, editHint, ask } = X;
const D = X.dn, M = X.dnm;
const { later, joinNames, sub } = D;
const $ = s => document.querySelector(s);
const A = X.A;
const route = location.pathname.split('/').filter(Boolean)[0] || '';
const review = new URLSearchParams(location.search).get('review');
/* Ahmad, 22 Nov: on /other-side/ the two phones are one conversation. ?link=<id> puts both iframes (same origin) on
   one BroadcastChannel: Tony's phone sends exactly what he picked, the other parent's phone waits on her lock screen
   until it arrives, and whatever she taps comes back to Tony. Without ?link every route behaves as before. */
const LINK_ID = new URLSearchParams(location.search).get('link');
const link = LINK_ID && 'BroadcastChannel' in window ? (() => {
  const ch = new BroadcastChannel('sprout-link-' + LINK_ID), subs = new Set();
  ch.onmessage = e => subs.forEach(f => f(e.data));
  const api = {
    send: m => ch.postMessage(m),
    on: f => { subs.add(f); return () => subs.delete(f); },
    next: types => new Promise(res => { const off = api.on(m => { if (types.includes(m.t)) { off(); res(m); } }); }),
  };
  return api;
})() : null;
/* the person on the right-hand phone. liveAsk sends Tony's request (and re-sends it if that phone reloads);
   liveSay puts a line in their thread; liveWords shows what they typed on Tony's phone. */
const LIVE = { who:null, msg:null };
if (link) link.on(m => { if (m.t !== 'hello') return; if (LIVE.cls && LIVE.cls !== LIVE.msg) link.send(LIVE.cls); if (LIVE.msg) link.send(LIVE.msg); });   // 25 Nov: row 6 has class phones and a sitter phone
const isLive = f => !!(link && LIVE.who && f && (f === LIVE.who || f.n === LIVE.who.n));
function liveAsk(who, msg){ if (!link) return; LIVE.who = who; LIVE.no = false; LIVE.msg = { t:'ask', ...msg }; link.send(LIVE.msg); }
function liveSay(who, text, from = 'Sprout', href = ''){ if (isLive(who)) link.send({ t:'sms', from, text, href }); }
function liveHeard(p, f, where, text){
  p.block(`<div class="preview gtx sms-in"><small>${face({ n:f.ask || f.n, photo:f.photo }, 18)}${f.n} · ${where}</small><p></p></div>`).querySelector('p').textContent = text;
  p.scroll();
}
function liveWords(p, f, where){
  if (!link) return () => {};
  return link.on(m => { if (m.t === 'text' && !document.querySelector('.jc-screen.dm')) liveHeard(p, f, where, m.text); });
}
async function liveWait(p, { status, small, types }){
  const w = p.block(`<div class="status"><span class="spinner"></span><div>${status}<small>${small || ''}</small></div></div>`);
  p.scroll();
  const m = await link.next(types);
  w.remove();
  return m;
}
/* review routes fake a family state; the real app (every other route) starts with no sitters and fills MY as you go */
const STATE = { 'sitter-v3':'saved', 'sitter-v3-class':'class', 'sitter-v3-none':'none', 'book-a-sitter-saved':'saved', 'assist-ongoing':'saved' }[route] || 'app';

/* ---------- family + calendar (today is Monday, July 27) ---------- */
const KIDS = [{ n:'Maya', age:7, cls:'Miss Taylor’s class', img:A + 'maya.webp' }, { n:'Jake', age:5, cls:'Miss Poole’s class', img:A + 'jake.webp' }];
const DAYS = [['Thu', 30, 'Jul'], ['Fri', 31, 'Jul', 1], ['Sat', 1, 'Aug', 1], ['Sun', 2, 'Aug'], ['Mon', 3, 'Aug'], ['Tue', 4, 'Aug'], ['Wed', 5, 'Aug']]
  .map(([w, d, m, free], i) => ({ i, w, d, m, free, short:w, day:`${w}, ${m} ${d}`, long:`${{ Thu:'Thursday', Fri:'Friday', Sat:'Saturday', Sun:'Sunday', Mon:'Monday', Tue:'Tuesday', Wed:'Wednesday' }[w]}, ${m === 'Jul' ? 'July' : 'August'} ${d}`, cancel:'the evening before' }));
/* S1 (Tony, 20 Nov US): a sitter defaults to today ("I don't know why it's showing Thursday... default to today").
   Any day index works: DAYS[0] is Thu Jul 30; negative indexes are the days before it (today = Mon Jul 27 = -3,
   the demo clock's day). Same object every time, so indexOf / === still match. */
const DAYX = {};
function dayAt(i){
  if (i >= 0 && i < DAYS.length) return DAYS[i];
  if (DAYX[i]) return DAYX[i];
  const t = new Date(2026, 6, 30 + i), f = o => t.toLocaleDateString('en-US', o), w = f({ weekday:'short' }), m = f({ month:'short' }), d = t.getDate();
  return (DAYX[i] = { i, w, d, m, free:false, short:w, day:`${w}, ${m} ${d}`, long:f({ weekday:'long', month:'long', day:'numeric' }), cancel:'the evening before' });
}
/* the earliest a sitter can start today: 30 min from now, on the next half hour (Mohit + Tony, 20 Nov US: "it needs
   at minimum thirty minutes to reach your location") */
const LEAD = 30;
const earliestToday = () => { const m = ((CLOCK.now() % 1440) + 1440) % 1440 + LEAD; return Math.ceil(m / 30) * 30; };
const todayIndex = () => Math.floor(CLOCK.now() / 1440);
/* D4 (17 Nov): no real sitter photos, a placeholder that shows the sitter is a woman or a man */
const AV = g => `${A}sitters/${g === 'm' ? 'man' : 'woman'}.webp`;   // 3D clay avatars (Figma AI, 17 Nov), same style as the clay icons
const clay = n => `<span class="clayico" style="background-image:url(${A}clay/${n}.png)"></span>`;
const SAVED = [
  { n:'Alex', ch:'Messages', phone:'(512) 555-0114', venmo:'@alex-rivera', times5:4, rate:25, by:'Saved by you', times:'Sat for you 4 times', photo:AV('f') },
  { n:'Sam', ch:'Messages', phone:'(512) 555-0127', venmo:'@sam-okafor', rate:28, by:'Saved by Dana', times:'Sat for you twice', photo:AV('m'), payout:{ way:'bank', apps:[{ k:'venmo', n:'Venmo', h:'@sam-okafor' }, { k:'cash', n:'Cash', h:'' }] } },   // set up on an earlier booking
  { n:'Riley', ch:'Messages', phone:'(512) 555-0136', rate:24, by:'Saved by you', times:'Sat for you once', photo:AV('f'), cant:true },
];
const CLASS_SITTERS = [
  { n:'Taylor', ch:'Messages', phone:'(512) 555-0193', rate:26, parent:'Priya', kid:'Leo', pimg:'priya.webp', cls:'Maya’s class', times:'Sits for them most Fridays', photo:AV('f') },
  { n:'Jordan', ch:'Messages', phone:'(512) 555-0148', rate:22, parent:'Aisha', kid:'Ava', pimg:'aisha.webp', cls:'Maya’s class', times:'Sat for them 6 times', photo:AV('m'), cant:true },
  { n:'Morgan', ch:'Messages', phone:'(512) 555-0172', rate:25, parent:'Elena', kid:'Noah', pimg:'elena.webp', cls:'Jake’s class', times:'Their sitter since last year', photo:AV('f') },
];
const LEADS = [
  { n:'Taylor', ch:'Messages', phone:'(512) 555-0193', rate:26, parent:'Priya', kid:'Leo', pimg:'priya.webp', note:'Sits for us most Fridays. Great with little ones.', photo:AV('f') },
  { n:'Jordan', ch:'Messages', phone:'(512) 555-0148', rate:22, parent:'Aisha', kid:'Ava', pimg:'aisha.webp', note:'College student, very reliable.', photo:AV('m'), cant:true },
];
const MY = STATE === 'saved' ? SAVED.map(x => ({ ...x })) : [];   // the family's saved sitters
const remember = s => { const i = MY.findIndex(x => x.n === s.n); if (i < 0) MY.push(s); else MY[i] = { ...MY[i], ...s }; return MY.find(x => x.n === s.n); };
/* the family's details Sprout fills in, all editable (F4) */
const FAMILY = { address:'10212 Banks Court, Austin', notes:'Bedtime 8:30. Maya reads first; Jake sleeps with the hall light on.', known:STATE === 'saved' };   // known = saved from an earlier booking
const face = (s, size = 46) => s.photo ? `<span class="uaph" style="width:${size}px;height:${size}px;background-image:url(${s.photo})"></span>` : `<span class="uaph uamono" style="width:${size}px;height:${size}px${size < 30 ? `;font-size:${Math.round(size * .5)}px` : ''}">${s.n[0]}</span>`;   // small monograms scale the letter to the circle (Ahmad, 22 Nov)

/* ---------- time helpers (minutes since midnight) ---------- */
const tl = m => { const h = Math.floor(m / 60) % 24, mm = m % 60, hh = h % 12 || 12; return `${hh}${mm ? ':' + String(mm).padStart(2, '0') : ''} ${h < 12 ? (h === 0 && m >= 1440 ? 'AM' : 'AM') : 'PM'}`; };
const tshort = m => tl(m).replace(' PM', '').replace(' AM', '');
const range = (a, b) => (Math.floor(a / 720) % 2 === Math.floor(b / 720) % 2 && b - a < 720) ? `${tshort(a)}–${tl(b)}` : `${tl(a)}–${tl(b)}`;
const hrs = h => `${h % 1 ? h.toFixed(1) : h} hour${h === 1 ? '' : 's'}`;
const parseT = t => { const [h, m] = t.split(':').map(Number); return (h + 12) * 60 + (m || 0); };

/* ---------- when: week strip, quick picks, and the chosen From / Until chips ---------- */
function timeWheel({ title, value, min = 0 }){
  /* hour · minute · AM/PM columns that snap; value and result are minutes since midnight */
  return new Promise(res => {
    const H = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], MI = [0, 15, 30, 45], AP = ['AM', 'PM'];
    const col = (items, fmt, k) => `<div class="tw-col" data-col="${k}">${items.map((x, i) => `<div class="tw-it" data-i="${i}">${fmt(x)}</div>`).join('')}</div>`;
    const v = bsheet({ onBack:() => res(null),
      body:`<div class="bh"><span class="icotile"><i class="ph ph-clock"></i></span><b>${title}</b></div>
        <div class="tw">${col(H, x => x, 'h')}${col(MI, x => ':' + String(x).padStart(2, '0'), 'm')}${col(AP, x => x, 'a')}<div class="tw-band"></div></div>`,
      foot:`<button type="button" class="btn" data-go>Set ${title.toLowerCase()}</button>` });
    const vv = value % 1440, idx = { h:H.indexOf(Math.floor(vv / 60) % 12 || 12), m:MI.indexOf(Math.round((vv % 60) / 15) * 15 % 60), a:vv >= 720 ? 1 : 0 };
    const ROW = 40;
    v.body.querySelectorAll('.tw-col').forEach(c => { const k = c.dataset.col;
      setTimeout(() => { c.scrollTop = idx[k] * ROW; paint(c, idx[k]); }, 60);
      let t; c.addEventListener('scroll', () => { clearTimeout(t); t = setTimeout(() => { const i = Math.max(0, Math.min(c.children.length - 1, Math.round(c.scrollTop / ROW))); idx[k] = i; paint(c, i); }, 90); });
      c.querySelectorAll('.tw-it').forEach(it => it.onclick = () => { c.scrollTo({ top: +it.dataset.i * ROW, behavior:'smooth' }); }); });
    function paint(c, i){ c.querySelectorAll('.tw-it').forEach((it, j) => it.classList.toggle('on', j === i)); }
    v.foot.querySelector('[data-go]').onclick = () => {
      v.body.querySelectorAll('.tw-col').forEach(c => { idx[c.dataset.col] = Math.max(0, Math.min(c.children.length - 1, Math.round(c.scrollTop / ROW))); });   // read the wheel itself
      const m = (H[idx.h] % 12) * 60 + MI[idx.m] + (idx.a ? 720 : 0); v.close(); res(m); };
  });
}
function whenCard(p, { mode = 'sitter', preset, canContinue } = {}){
  return new Promise(res => {
    const dinner = mode === 'dinner', birthday = mode === 'birthday', classEvent = mode === 'class-event';
    /* L6/L7 (Tony, 19 Nov): every plan has an end. Birthdays get From / Until ("they kinda wanna time box it"),
       date night gets Home by next to the table time. */
    const startOnly = false;
    const variant = mode === 'sitter' && route === 'sitter-when-a' ? 'a' : (mode === 'sitter' || mode === 'playdate' || classEvent || birthday) && 'b';
    const sitterDays = mode === 'sitter', LIST = sitterDays ? Array.from({ length:7 }, (_, k) => dayAt(todayIndex() + k)) : DAYS;
    const isToday = d => sitterDays && d && d.i === todayIndex(), minFor = d => isToday(d) ? earliestToday() : 0;
    let day = preset ? (preset.day || LIST.find(d => d.w === preset.w)) : sitterDays ? LIST[0] : DAYS.find(d => d.free), from = preset?.from ?? (dinner ? 1140 : 1080), to = preset?.to ?? (dinner ? (preset?.from ?? 1140) + 210 : birthday ? (preset?.from ?? 840) + 120 : 1320);
    const QUICK = dinner ? [[1080], [1110], [1140], [1170], [1200]]
      : birthday ? [[600, 720], [780, 900], [840, 960]]
      /* N4 (Tony, 20 Nov): "four hours is a long playdate". Quick picks are 1.5–2 hours, the end stops at 4 hours */
      : mode === 'playdate' ? [[600, 690], [840, 960], [960, 1050]] : [[540, 720, 'Morning'], [780, 1020, 'Afternoon'], [1080, 1320, 'Evening']];
    const step = variant === 'a' ? 60 : 30;
    const strip = 'display:flex;flex-wrap:nowrap;overflow-x:auto';
    const timeChips = (name, first, last, extra) => {
      const times = [];
      for (let m = first; m <= last; m += step) times.push(m);
      if (extra != null && !times.includes(extra)) { times.push(extra); times.sort((a, b) => a - b); }
      return times.map(m => `<button class="chip" style="flex:none" data-${name}="${m}">${tl(m)}${m >= 1440 ? ' · next day' : ''}</button>`).join('');
    };
    const chipFields = variant ? `<div class="dlabel" style="margin-top:16px">${variant === 'a' ? 'Starts' : 'From'}</div>
      <div class="qk" style="${strip}">${timeChips('start', 480, 1260)}<button class="chip" style="flex:none" data-f>Other time</button></div>
      <div class="dlabel" style="margin-top:16px">${variant === 'a' ? 'How long' : 'Until'}</div>
      <div class="qk" style="${strip}" data-end-row>${variant === 'a' ? [2, 3, 4, 5, 6].map(h => `<button class="chip" style="flex:none" data-length="${h}">${h} hrs</button>`).join('') : ''}</div>` : '';
    const c = p.block(`<div class="card"><div class="ctop">${clay('calendar-check')}<div><div class="eyebrow">${dinner ? 'Date night' : birthday ? 'Birthday party' : classEvent ? 'Class event' : 'Sitter'}</div><div class="ttl">${dinner ? 'When are you going out?' : birthday ? 'When is the party?' : classEvent ? 'When is the event?' : 'When do you need a sitter?'}</div></div></div>
      <div class="ua-days">${LIST.map((d, i) => `<button class="ua-day${d.free ? ' free' : ''}" data-i="${i}"><small>${isToday(d) ? 'Today' : d.w}</small><b>${d.d}</b><i></i></button>`).join('')}</div>
      <div class="ua-legend"><i></i>You and Dana are both free</div>
      <div class="dlabel" style="margin-top:16px">Quick options</div>
      ${sitterDays ? '<div class="ua-lead" data-lead hidden><i class="ph ph-clock-countdown"></i><span></span></div>' : ''}
      <div class="qk">${QUICK.map(([a, b], i) => `<button class="chip" data-q="${i}">${dinner ? tl(a) : range(a, b)}</button>`).join('')}</div>
      ${variant ? chipFields : `<div class="tf">${dinner ? `<button class="tf-f" data-f><small>Table around</small><b data-fv></b><i class="ph ph-caret-down"></i></button><button class="tf-f" data-t><small>Home by</small><b data-tv></b><i class="ph ph-caret-down"></i></button>`
        : `<button class="tf-f" data-f><small>Starts</small><b data-fv></b><i class="ph ph-caret-down"></i></button><button class="tf-f" data-t><small>Ends</small><b data-tv></b><i class="ph ph-caret-down"></i></button>`}</div>`}
      <div class="ua-dur"><i class="ph-fill ph-${dinner ? 'fork-knife' : birthday || classEvent ? 'calendar-blank' : 'moon-stars'}"></i><span data-d></span></div>
      <button class="btn" style="margin-top:14px">Next</button></div>`).querySelector('.card');
    const btn = c.querySelector('.btn');
    const paint = () => {
      c.querySelectorAll('.ua-day').forEach(b => b.classList.toggle('on', LIST[+b.dataset.i] === day));
      const min = minFor(day), lead = c.querySelector('[data-lead]');
      if (lead) { lead.hidden = !min; lead.querySelector('span').textContent = `Today, the earliest a sitter can start is ${tl(min)}, so they have time to get to you.`; }
      c.querySelectorAll('[data-start]').forEach(b => { b.disabled = +b.dataset.start < min; });
      c.querySelectorAll('[data-q]').forEach(b => { b.disabled = QUICK[+b.dataset.q][0] < min; });
      if (variant) {
        const other = c.querySelector('[data-f]');
        const custom = from < 480 || from > 1260 || from % step !== 0;
        other.textContent = custom ? `Other time · ${tl(from)}` : 'Other time';
        other.classList.toggle('sel', custom);
        c.querySelectorAll('[data-start]').forEach(b => b.classList.toggle('sel', +b.dataset.start === from));
        if (variant === 'a') c.querySelectorAll('[data-length]').forEach(b => b.classList.toggle('sel', +b.dataset.length * 60 === to - from));
        else {
          const row = c.querySelector('[data-end-row]');
          if (row.dataset.from !== String(from)) {
            const last = from + (mode === 'playdate' ? 240 : 960);
            row.innerHTML = timeChips('end', (Math.floor(from / 30) + 1) * 30, last, to > from && to <= last ? to : null);
            row.dataset.from = from;
            row.querySelectorAll('[data-end]').forEach(b => b.onclick = () => { to = +b.dataset.end; paint(); });
          }
          row.querySelectorAll('[data-end]').forEach(b => b.classList.toggle('sel', +b.dataset.end === to));
        }
      } else {
        c.querySelector('[data-fv]').textContent = tl(from);
        c.querySelector('[data-tv]').innerHTML = tl(to) + (to >= 1440 ? ' <em>next day</em>' : '');
      }
      c.querySelectorAll('[data-q]').forEach(b => { const [a, z] = QUICK[+b.dataset.q]; b.classList.toggle('sel', dinner ? a === from : a === from && z === to); });
      c.querySelector('[data-d]').textContent = !day ? 'Pick a day' : dinner ? `${day.day} · table around ${tl(from)} · home by ${tl(to)}${to >= 1440 ? ' next day' : ''}` : `${day.day} · ${range(from, to)}${variant && to >= 1440 ? ' next day' : ''} · ${hrs((to - from) / 60)}`;
      btn.disabled = !day || (canContinue ? !canContinue() : false);
    };
    c.querySelectorAll('.ua-day').forEach(b => b.onclick = () => { day = LIST[+b.dataset.i]; const min = minFor(day); if (from < min) { const d = Math.max(to - from, 120); from = min; to = from + d; } paint(); });
    c.querySelectorAll('[data-q]').forEach(b => b.onclick = () => { const [a, z] = QUICK[+b.dataset.q]; if (dinner) { const d = to - from; from = a; to = a + d; } else { from = a; to = z; } paint(); });
    const setStart = m => {
      const duration = to - from;
      from = m;
      if (variant === 'a') to = from + duration;
      else if (variant === 'b' && (to <= from || to > from + (mode === 'playdate' ? 240 : 960))) to = Math.round((from + Math.min(duration, mode === 'playdate' ? 120 : duration)) / 30) * 30;
      else if (!startOnly && to <= from) to = from + 240;
      paint();
    };
    c.querySelectorAll('[data-start]').forEach(b => b.onclick = () => setStart(+b.dataset.start));
    c.querySelectorAll('[data-length]').forEach(b => b.onclick = () => { to = from + +b.dataset.length * 60; paint(); });
    c.querySelector('[data-f]').onclick = async () => { const m = await timeWheel({ title: dinner ? 'Dinner time' : 'Start time', value:from }); if (m == null) return;
      const min = minFor(day); if (m % 1440 < min) return toast(`Today, pick ${tl(min)} or later so the sitter has time to get there.`); setStart(m % 1440); };
    /* an end before the start only makes sense overnight (an AM end); an earlier PM end is a mistake, so say so */
    if (!startOnly && !variant) c.querySelector('[data-t]').onclick = async () => { const m = await timeWheel({ title:'End time', value:to }); if (m == null) return;
      let e = m % 1440; if (e <= from) { if (e < 720 && e + 1440 - from <= 16 * 60) e += 1440; else return toast(`Ends before it starts. Pick a time after ${tl(from)}.`); }
      to = e; paint(); };
    btn.onclick = () => { if (btn.disabled) return; c.querySelectorAll('button').forEach(b => b.style.pointerEvents = 'none'); btn.remove(); p.me(dinner ? `${day.day}, table around ${tl(from)}, home by ${tl(to)}` : `${day.day}, ${range(from, to)}`); res({ day, from, to }); };
    paint(); p.scroll();
  });
}

/* ---------- which kids: one line of photo chips, all on ----------
   Ahmad, 22 Nov: same as the playdate (P1). Tall rows with the class grew a row per kid, so four kids pushed the
   button off screen; the chips stay on one line and scroll sideways. No class label (Tony, P1). */
function kidsCard(p, cur, { birthday = false } = {}){
  return new Promise(res => {
    const c = p.block(`<div class="card"><div class="ctop">${clay('two-people')}<div><div class="eyebrow">${birthday ? 'Birthday party' : 'Sitter'}</div><div class="ttl">${birthday ? 'Whose birthday is it?' : 'Who is the sitter for?'}</div></div></div>
      <div class="pd-kids" role="group" style="margin-top:12px">${KIDS.map(k => `<button type="button" class="pd-kid${!birthday && (!cur || cur.some(c => c.n === k.n)) ? ' on' : ''}" data-n="${k.n}"><span class="uaph" style="background-image:url(${k.img})"></span>${k.n}<i class="ph-bold ph-check"></i></button>`).join('')}</div>
      <button class="btn" style="margin-top:14px">Next · Maya and Jake</button></div>`).querySelector('.card');
    const btn = c.querySelector('.btn'), picks = [...c.querySelectorAll('.pd-kid')];
    const names = () => picks.filter(x => x.classList.contains('on')).map(x => x.dataset.n);
    const paint = () => {
      const n = names();
      picks.forEach(x => x.setAttribute('aria-pressed', x.classList.contains('on')));
      btn.disabled = !n.length;
      btn.textContent = n.length ? `Next · ${joinNames(n)}` : birthday ? 'Pick a child' : 'Pick at least one';
    };
    picks.forEach(x => x.onclick = () => {
      if (birthday) picks.forEach(row => row.classList.toggle('on', row === x));
      else x.classList.toggle('on');
      paint();
    });
    btn.onclick = () => {
      const n = names();
      picks.forEach(row => { if (birthday) row.disabled = true; else row.style.pointerEvents = 'none'; });
      p.me(birthday ? btn.textContent : `For ${joinNames(n)}`);
      btn.remove();
      res(KIDS.filter(k => n.includes(k.n)));
    };
    paint();
    p.scroll();
  });
}

/* ---------- generic edit sheets (F4) ---------- */
function editText(title, value, { rows = 5, label = '' } = {}){
  return new Promise(res => {
    const v = bsheet({ onBack:() => res(null), body:`<div class="bh"><span class="icotile"><i class="ph ph-pencil-simple"></i></span><b>${title}</b></div>${label ? `<div class="dlabel" style="margin:0 0 6px">${label}</div>` : ''}
      <textarea class="edt" rows="${rows}">${value}</textarea>`, foot:`<button type="button" class="btn" data-go>Save</button>` });
    v.foot.querySelector('[data-go]').onclick = () => { const t = v.body.querySelector('textarea').value.trim(); v.close(); res(t || null); };
  });
}
function editFields(title, fields, { requiredMessage } = {}){
  return new Promise(res => {
    const v = bsheet({ onBack:() => res(null), body:`<div class="bh"><span class="icotile"><i class="ph ph-pencil-simple"></i></span><b>${title}</b></div>
      <div class="fields" style="margin-top:0">${fields.map(([l, val, type]) => type === 'area' ? `<label class="field in"><div style="width:100%"><div class="l">${l}</div><textarea class="edt" rows="3">${val}</textarea></div></label>` : `<label class="field in"><div style="width:100%"><div class="l">${l}</div><input value="${val}" ${type === 'num' ? 'inputmode="decimal"' : ''} autocomplete="off"></div></label>`).join('')}</div>`,
      foot:`<button type="button" class="btn" data-go>Save</button>` });
    v.foot.querySelector('[data-go]').onclick = () => {
      const inputs = [...v.body.querySelectorAll('input, textarea')];
      const values = inputs.map(input => input.value.trim());
      const empty = values.indexOf('');
      if (requiredMessage && empty !== -1) {
        inputs[empty].focus();
        return toast(requiredMessage);
      }
      v.close(); res(values);
    };
  });
}

/* ---------- G2 (17 Nov): request details. Each pencil opens a sheet and the card updates in place,
   so editing five things doesn't add five chat turns. ---------- */
/* run a chat card (whenCard / kidsCard) inside a bottom sheet instead of the chat */
function inSheet(run, title){
  return new Promise(res => {
    let done = false;
    const v = bsheet({ onBack:() => { if (!done) { done = true; res(null); } }, body:'' });
    const sp = { block:html => { v.body.innerHTML = `<div class="insheet">${html}</div>`; return v.body; }, me(){}, scroll(){}, say:async () => {} };
    run(sp).then(r => { if (done) return; done = true; v.close(); res(r); });
    const b = v.body.querySelector('.card > .btn:last-of-type'); if (b) b.textContent = 'Save';
    if (title) { const t = v.body.querySelector('.ttl'); if (t) t.textContent = title; }
  });
}
/* S2 (Tony + Mohit, 20 Nov US): the time and kids were just picked, so the request only asks what's still missing:
   where and notes. "I don't know if we need to confirm this. I mean, I just did it." The first time both are empty
   input fields (Mohit: a pencil means "edit", but there's nothing to edit yet), assumed home. After that they're
   filled from last time, still editable right in the card. */
async function requestCard(p, w, kids, dinner){
  const first = !FAMILY.known, esc = t => String(t).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
  const card = p.block(`<div class="card">
    <div class="ctop">${clay('event')}<div><div class="eyebrow">Sitter · ${w.day.day}</div><div class="ttl">${first ? 'Where is the sitter coming?' : 'Same place as last time?'}</div></div></div>
    <div class="fields" style="margin-top:12px">
      <label class="field in"><div style="width:100%"><div class="l">Address</div><input data-addr placeholder="Your home address" autocomplete="street-address" value="${first ? '' : esc(FAMILY.address)}"></div></label>
      <div class="rq-sug" data-sug hidden><button type="button"><i class="ph ph-map-pin"></i><span><b>10212 Banks Court</b><small>Austin, TX 78745</small></span></button></div>
      <label class="field in"><div style="width:100%"><div class="l">Notes for the sitter (optional)</div><textarea class="edt" rows="2" data-notes placeholder="Bedtime, allergies, anything they should know">${first ? '' : esc(FAMILY.notes)}</textarea></div></label>
    </div>
    <div class="foot"><i class="ph ph-lock-simple"></i>Only the sitter you book sees your address. Saved for next time.</div>
    <button class="btn" data-ok style="margin-top:12px"></button></div>`).querySelector('.card');
  const addr = card.querySelector('[data-addr]'), notes = card.querySelector('[data-notes]'), ok = card.querySelector('[data-ok]'), sug = card.querySelector('[data-sug]');
  const paint = () => {
    const v = addr.value.trim();
    ok.disabled = !v; ok.textContent = !v ? 'Add your address' : first ? 'Next' : 'Looks right';
    sug.hidden = !(v.length >= 2 && v !== FAMILY.address && /^[0-9b]/i.test(v));   // a typed address gets one suggestion, like iOS autofill
  };
  addr.oninput = paint;
  sug.querySelector('button').onclick = () => { addr.value = '10212 Banks Court, Austin'; paint(); notes.focus(); };
  paint(); p.scroll();
  await new Promise(r => ok.onclick = () => { if (!ok.disabled) r(); });
  FAMILY.address = addr.value.trim(); FAMILY.notes = notes.value.trim(); FAMILY.known = true;
  card.querySelectorAll('input, textarea, button').forEach(b => b.disabled = true); ok.remove(); sug.remove();
  p.me(first ? FAMILY.address + (FAMILY.notes ? ' · notes added' : '') : 'Looks right');
}

/* ---------- add a sitter you know (sheet, saved to your account) ----------
   S3 (Tony, 20 Nov US): "is there a way to just go into my contacts?" Choose from Contacts fills name and number
   (the iOS contact picker; nothing else is read). Rate is optional: if it's blank, the sitter's reply sets it.
   WhatsApp is gone: "most sitters just live on text messages". She / He stays (used in "she's free"). */
const CONTACTS = [['Aisha Khan', '(512) 555-0102'], ['Ben Ortiz', '(512) 555-0119'], ['Casey Nguyen', '(512) 555-0161'], ['Dana Martin', '(512) 555-0100'],
  ['Emma Brooks', '(512) 555-0175'], ['Grace Lee', '(512) 555-0133'], ['Jordan Pike', '(512) 555-0148'], ['Mia Torres', '(512) 555-0184'], ['Nina Patel', '(512) 555-0156'], ['Sophie Hart', '(512) 555-0190']];
/* A2 (Tony, 25 Nov): sharing a sitter starts here, several at once ("no one's gonna have them" saved). multi = tick
   any number, then Add; taken = phones already on the list (shown as Added). Single pick stays for Add a sitter. */
function pickContact({ multi = false, taken = [] } = {}){
  return new Promise(res => {
    const on = new Set();
    const rows = q => { const list = CONTACTS.filter(([n]) => n.toLowerCase().includes(q.toLowerCase())); let L = '';
      return list.length ? list.map(([n, ph]) => { const h = L !== n[0] ? `<div class="ct-l">${(L = n[0])}</div>` : '', k = CONTACTS.findIndex(c => c[0] === n), had = taken.includes(ph);
        return `${h}<button type="button" class="ct-row${on.has(k) ? ' on' : ''}" data-k="${k}"${multi ? ` aria-pressed="${on.has(k)}"` : ''}${had ? ' disabled' : ''}><span class="ct-av">${n.split(' ').map(x => x[0]).join('')}</span><span><b>${n}</b><small>${had ? 'Added' : 'mobile ' + ph}</small></span>${multi ? '<span class="ck"><i class="ph-bold ph-check"></i></span>' : ''}</button>`; }).join('') : '<p class="bp" style="text-align:center;margin-top:18px">No contacts found</p>'; };
    const v = bsheet({ onBack:() => res(null), body:`<div class="ct-head"><b>Contacts</b><small>${multi ? 'Pick your sitters. Sprout only gets the names and numbers you pick.' : 'Pick the sitter. Sprout only gets this one name and number.'}</small></div>
      <label class="ct-search"><i class="ph ph-magnifying-glass"></i><input placeholder="Search" autocomplete="off"></label><div class="ct-list" data-list>${rows('')}</div>`,
      foot:multi ? '<button type="button" class="btn" data-go disabled>Pick someone</button>' : '' });
    const list = v.body.querySelector('[data-list]'), go = v.foot && v.foot.querySelector('[data-go]');
    const first = k => CONTACTS[k][0].split(' ')[0];
    const paint = () => { if (!go) return; const n = [...on]; go.disabled = !n.length; go.textContent = !n.length ? 'Pick someone' : n.length > 2 ? `Add ${n.length} sitters` : `Add ${joinNames(n.map(first))}`; };
    const bind = () => list.querySelectorAll('.ct-row').forEach(b => b.onclick = () => {
      const k = +b.dataset.k;
      if (!multi) { v.close(); const [full, phone] = CONTACTS[k]; return res({ full, phone }); }
      on.has(k) ? on.delete(k) : on.add(k); b.classList.toggle('on', on.has(k)); b.setAttribute('aria-pressed', on.has(k)); paint();
    });
    v.body.querySelector('input').oninput = e => { list.innerHTML = rows(e.target.value); bind(); };
    if (go) go.onclick = () => { if (go.disabled) return; v.close(); res([...on].map(k => ({ full:CONTACTS[k][0], phone:CONTACTS[k][1] }))); };
    bind(); paint();
  });
}
function sitterFields({ name = '', phone = '', rate = '' } = {}){
  const fields = el(`<div><button type="button" class="ct-pick" data-contacts><i class="ph ph-address-book"></i><span><b>Choose from Contacts</b><small>Fills in their name and number</small></span><i class="ph ph-caret-right"></i></button>
    <div class="ct-or"><span>or type it in</span></div>
    <div class="fields" style="margin-top:0">
      <label class="field in"><div style="width:100%"><div class="l">Name</div><input autocomplete="off" placeholder="Their name"></div></label>
      <label class="field in"><div style="width:100%"><div class="l">Phone</div><input inputmode="tel" autocomplete="off" placeholder="(512) 555-0100"></div></label>
      <label class="field in"><div style="width:100%"><div class="l">Rate per hour (optional)</div><input inputmode="numeric" autocomplete="off" placeholder="They can tell you when they reply"></div></label></div>
    <div class="dlabel">Show as</div><div class="fchips" style="margin-top:6px"><button type="button" class="chip sel" data-g="f" aria-pressed="true">She</button><button type="button" class="chip" data-g="m" aria-pressed="false">He</button></div></div>`);
  const [nameInput, phoneInput, rateInput] = fields.querySelectorAll('input');
  nameInput.value = name; phoneInput.value = phone; rateInput.value = rate;
  const changed = () => fields.dispatchEvent(new Event('change'));
  [nameInput, phoneInput].forEach(x => x.addEventListener('input', changed));
  fields.querySelector('[data-contacts]').onclick = async () => {
    const c = await pickContact(); if (!c) return;
    nameInput.value = c.full; phoneInput.value = c.phone; fields.querySelector('[data-contacts] small').textContent = `${c.full} · from your contacts`;
    nameInput.closest('.field').classList.add('just'); phoneInput.closest('.field').classList.add('just'); changed();
  };
  fields.querySelectorAll('.fchips').forEach(group => {
    const chips = [...group.querySelectorAll('button')];
    chips.forEach(button => button.onclick = () => chips.forEach(chip => {
      chip.classList.toggle('sel', chip === button);
      chip.setAttribute('aria-pressed', chip === button);
    }));
  });
  return {
    fields,
    ready:() => !!(nameInput.value.trim() && phoneInput.value.replace(/\D/g, '').length >= 10),
    read:() => ({
      full:nameInput.value.trim(), phone:phoneInput.value.trim(),
      rate:parseInt(rateInput.value.replace(/\D/g, '')) || null,
      photo:AV(fields.querySelector('[data-g].sel').dataset.g),
      ch:'Messages'
    })
  };
}
function addSitter(){
  return new Promise(res => {
    const v = bsheet({ onBack:() => res(null),
      body:`<div class="bh"><span class="icotile"><i class="ph ph-user-plus"></i></span><b>Add a sitter</b></div>
        <p class="bp">Saved to your family’s sitters, so I can ask them next time too. Only you and Dana see their number.</p>`,
      foot:`<button type="button" class="btn" data-go>Save sitter</button>` });
    const form = sitterFields(), go = v.foot.querySelector('[data-go]');
    v.body.append(form.fields);
    const paint = () => { go.disabled = !form.ready(); go.textContent = form.ready() ? 'Save sitter' : 'Add a name and number'; };
    form.fields.addEventListener('change', paint); paint();
    go.onclick = () => {
      if (!form.ready()) return;
      const sitter = form.read();
      v.close(); toast('Saved to your sitters');
      res(remember({ ...sitter, n:sitter.full.split(' ')[0], by:'Added by you', times:'New to your family' }));
    };
  });
}

/* ---------- who to ask (E2, 17 Nov): one compact list, every sitter visible at once; tick one or all ---------- */
function whoCard(p, list, { hours, line, add = true, askClass, onReady }){
  return new Promise(res => {
    const c = p.block(`<div class="card"><div class="ctop">${clay('two-people')}<div><div class="eyebrow">Pick one or more</div><div class="ttl">Who should I ask?</div></div></div>
      <div class="sl">${list.map((s, i) => rowHtml(s, i)).join('')}
        ${add ? '<button class="sl-add" data-add><i class="ph ph-plus"></i>Add a sitter</button>' : ''}</div>
      <div class="sl-foot"><button class="textbtn" data-all></button><span data-est></span></div>
      <button class="btn" style="margin-top:10px"></button>${askClass ? '<button class="textbtn skip" data-class>Ask a class group instead</button>' : ''}</div>`).querySelector('.card');
    function rowHtml(s, i){ return `<button class="sl-row${s.off ? '' : ' on'}" data-i="${i}">${face(s, 36)}
          <span class="sl-tx"><span class="sl-n">${s.n}${s.pimg ? ` <span class="sl-tag"><i style="background-image:url(${A}${s.pimg})"></i>${s.parent}’s sitter</span>` : ''}</span>
          <small>${s.added ? `${s.phone} · added by you` : line(s)} · ${s.rate ? `$${s.rate}/hr` : 'rate when they reply'}</small></span><span class="ck"><i class="ph-bold ph-check"></i></span></button>`; }
    const btn = c.querySelector('.btn'), all = c.querySelector('[data-all]');
    let rows = [...c.querySelectorAll('.sl-row')];
    const chosen = () => rows.filter(r => r.classList.contains('on')).map(r => list[+r.dataset.i]);
    const paint = () => { const n = chosen(); btn.disabled = !n.length; btn.textContent = n.length ? 'Ask ' + joinNames(n.map(s => s.n)) : 'Pick at least one';
      all.textContent = n.length === rows.length ? 'Clear all' : 'Select all';
      const est = n.filter(s => s.rate).map(s => Math.round(s.rate * hours)), lo = Math.min(...est), hi = Math.max(...est);
      c.querySelector('[data-est]').textContent = est.length ? `About $${lo}${hi > lo ? '–$' + hi : ''} for ${hrs(hours)}` : ''; };
    const bind = r => r.onclick = () => { r.classList.toggle('on'); paint(); };
    rows.forEach(bind);
    all.onclick = () => { const on = chosen().length !== rows.length; rows.forEach(r => r.classList.toggle('on', on)); paint(); };
    const finish = v => { closed = true; c.querySelectorAll('button').forEach(b => b.style.pointerEvents = 'none'); btn.remove(); c.querySelector('.sl-foot').remove(); c.querySelector('[data-add]')?.remove(); c.querySelector('[data-class]')?.remove(); res(v); };
    let closed = false;
    const addRow = (s, on) => { if (closed || list.some(x => x.n === s.n)) return false;
      const i = list.push(s) - 1, r = el(rowHtml(list[i], i)), anchor = c.querySelector('[data-add]');
      anchor ? anchor.before(r) : c.querySelector('.sl').appendChild(r); r.classList.toggle('on', on); r.classList.add('just'); bind(r);
      rows = [...c.querySelectorAll('.sl-row')]; paint(); p.scroll(); return true; };
    if (add) c.querySelector('[data-add]').onclick = async () => { const s = await addSitter(); if (s) addRow({ ...s, added:true }, true); };
    onReady && onReady({ addRow, isOpen:() => !closed });
    if (askClass) c.querySelector('[data-class]').onclick = () => { p.me('Ask a class group'); finish({ extra:1 }); };
    btn.onclick = () => { const n = chosen(); p.me('Ask ' + joinNames(n.map(s => s.n))); finish(n); };
    paint(); p.scroll();
  });
}

/* ---------- send, replies, confirm, booked ---------- */
/* D5 (17 Nov): sitters don't have Sprout. The parent sends from their own phone (Messages or WhatsApp, one sitter at a
   time so numbers stay private). The text ends with a reply link: the sitter answers on a web page, no app. */
const kidsShort = kids => joinNames(kids.map(k => `${k.n} (${k.age})`));
const shortMsg = (s, w, kids) => `Hi ${s.n}! Are you free to watch ${kidsShort(kids)} on ${w.day.day}, ${range(w.from, w.to)}? Let me know your rate. Thanks! Tony`;
function compose(s, w, kids, text, hint, step){
  return new Promise(res => {
    const wa = s.ch === 'WhatsApp';
    const v = bsheet({ onBack:() => res(false),
      body:`<div class="cmp-head"><span class="cmp-app${wa ? ' wa' : ''}"><i class="ph-fill ph-${wa ? 'whatsapp-logo' : 'chat-circle-dots'}"></i>${wa ? 'WhatsApp' : 'Messages'}</span><small>${step || 'Opens on your phone'}</small></div>
        <div class="cmp-to"><span>To:</span>${face(s, 28)}<b>${s.n}</b>${hint && !s.group ? '' : '<span class="chip" style="display:inline-flex;align-items:center;gap:4px;padding:4px 8px"><span class="orb sm"></span><b>Sprout</b></span>'}<small>${s.phone || ''}</small></div>
        <div class="cmp-thread"><div class="cmp-bub${wa ? ' wa' : ''}" data-bub>${text || shortMsg(s, w, kids)}</div></div>
        <button class="textbtn cmp-edit" data-edit><i class="ph ph-pencil-simple"></i> Edit message</button>
        <p class="hint2">${hint || "Sprout is in this text so it can see who's free. Each sitter gets their own text."}</p>`,
      foot:`<button type="button" class="btn" data-go><i class="ph-fill ph-paper-plane-tilt"></i>&nbsp;Send</button>` });
    v.body.querySelector('[data-edit]').onclick = async () => { const b = v.body.querySelector('[data-bub]'); const t = await editText(`Message to ${s.n}`, b.textContent); if (t) b.textContent = t; };
    v.foot.querySelector('[data-go]').onclick = () => { v.close(); res(true); };
  });
}
/* N9 (Tony, 20 Nov chat, after trying N6): "instead of making the parent push the request and message directly, we
   could just send the text and add both the parent's phone number and the sitter in a group chat. That way they
   don't need to push send 3x when there are 3 sitters to message... it then makes it only 5 clicks and you have a
   sitter booked." Replaces N6's Messages sheets. One group text per sitter (sitters never see each other's numbers):
   the parent, the sitter and Sprout. Sprout writes; the parent sees every reply and can jump in. */
const groupWho = s => `<span class="gtx-who">${face(TONY, 18)}You ${face(s, 18)}${s.n} <span class="orb sm"></span>Sprout</span>`;
const groupMsg = (s, w, kids) => `Hi ${s.n}! It’s Sprout, texting with Tony Martin (he’s on this text too). Are you free to watch ${kidsShort(kids)} on ${w.day.day}, ${range(w.from, w.to)}? Just reply here.`;
async function groupTexts(p, asked, w, kids){
  const names = joinNames(asked.map(s => s.n)), many = asked.length > 1;
  const job = p.work(`Texting ${names}`, many ? `${asked.length} group texts · you and Sprout are on each` : `Group text · you, ${asked[0].n} and Sprout`);
  await sleep(1300);
  job.done(`Texted ${names}`, many ? `${asked.length} group texts · ${w.day.short} ${range(w.from, w.to)}` : `Group text · ${w.day.short} ${range(w.from, w.to)}`, 'ph-chats-circle');
  const pv = p.block(`<div class="preview gtx"><small>Group text · ${groupWho(asked[0])}</small><p></p>${many ? '<small style="display:block;margin:6px 0 0">Each sitter gets their own group text, so numbers stay private</small>' : ''}</div>`);
  pv.querySelector('p').textContent = groupMsg(asked[0], w, kids);
  return new Set(asked.map(s => s.n));
}
/* E7 (18 Nov): Sprout is in each sitter's text thread. Use Mark it for replies outside the thread.
   The old manual reply card below is kept for reference. */
function whoFree(p, asked, w){
  return new Promise(res => {
    const st = {};
    const c = p.block(`<div class="card"><div class="ctop">${clay('two-people')}<div><div class="eyebrow">When they text you back</div><div class="ttl">Who can make it?</div></div></div>
      <div class="sl">${asked.map(s => `<div class="sl-row wf" data-n="${s.n}">${face(s, 36)}<span class="sl-tx"><span class="sl-n">${s.n}</span><small>${s.ch || 'Messages'} · asked for ${w.day.short} ${range(w.from, w.to)}</small></span>
        <span class="wf-seg"><button data-a="free">Free</button><button data-a="no">Can’t</button></span></div>`).join('')}</div>
      <button class="btn" data-go style="margin-top:12px" disabled>Tap Free or Can’t</button>
      <button class="textbtn" data-none style="display:block;margin:8px auto 0">No one has replied yet</button></div>`).querySelector('.card');
    const go = c.querySelector('[data-go]');
    const paint = () => { const free = asked.filter(s => st[s.n] === 'free').map(s => s.n), n = Object.keys(st).length;
      go.disabled = !n; go.textContent = !n ? 'Tap Free or Can’t' : free.length ? `Continue with ${joinNames(free)}` : 'Continue'; };
    c.querySelectorAll('.wf').forEach(r => r.querySelectorAll('[data-a]').forEach(b => b.onclick = () => {
      const a = b.dataset.a; if (st[r.dataset.n] === a) delete st[r.dataset.n]; else st[r.dataset.n] = a;
      r.querySelectorAll('[data-a]').forEach(x => x.classList.toggle('on', st[r.dataset.n] === x.dataset.a)); r.classList.toggle('no', st[r.dataset.n] === 'no'); paint(); }));
    const done = v => { c.querySelectorAll('button').forEach(b => b.style.pointerEvents = 'none'); go.remove(); c.querySelector('[data-none]').remove(); res(v); };
    go.onclick = () => { const free = asked.filter(s => st[s.n] === 'free'), cant = asked.filter(s => st[s.n] === 'no'), wait = asked.filter(s => !st[s.n]);
      p.me(free.length ? `${joinNames(free.map(s => s.n))} ${free.length > 1 ? 'are' : 'is'} free` : `${joinNames(cant.map(s => s.n))} can’t`); done({ free, cant, wait }); };
    c.querySelector('[data-none]').onclick = () => { p.me('No one has replied yet'); done({ none:true }); };
    p.scroll();
  });
}
function markSheet(asked, onSave){
  const st = {};
  const v = bsheet({ body:`<div class="bh"><span class="icotile"><i class="ph ph-chat-text"></i></span><b>Someone texted you back?</b></div>
      <p class="bp">Tell me what they said and I’ll update the plan.</p>
      ${asked.map(s => `<div class="mk" data-n="${s.n}">${face(s, 36)}<b>${s.n}</b><div class="fchips" style="margin:0 0 0 auto"><button type="button" class="chip" data-a="free">Free</button><button type="button" class="chip" data-a="no">Can’t</button></div></div>`).join('')}`,
    foot:`<button type="button" class="btn" data-go>Save</button>` });
  v.body.querySelectorAll('.mk').forEach(r => r.querySelectorAll('.chip').forEach(b => b.onclick = () => { st[r.dataset.n] = b.dataset.a; r.querySelectorAll('.chip').forEach(x => x.classList.toggle('sel', x === b)); }));
  v.foot.querySelector('[data-go]').onclick = () => { v.close(); onSave(st); };
}
const reqMsg = (w, kids) => `Hi! Are you free to watch ${joinNames(kids.map(k => `${k.n} (${k.age})`))} on ${w.day.day}, ${range(w.from, w.to)}? Let us know your rate. We’ll confirm with one sitter after hearing back.`;
async function textDana(p, w, kids, who, pick){
  const sitter = `${who.n} is with ${joinNames(kids.map(k => k.n))}`;
  const plan = pick ? `Date night ${w.day.day}: ${pick.place.n} at ${pick.time}. ${sitter} ${range(w.from, w.to)}.`
    : `${sitter} ${w.day.day}, ${range(w.from, w.to)}.`;
  const sent = await compose({ n:'Dana', ch:'Messages', photo:A + 'dana.webp' }, w, kids, `${plan} It's on our calendar.`, 'From your phone.');
  await p.say(sent ? 'Sent to Dana.' : `Okay. Dana still gets the reminder at ${ampm(w.from - 30)}.`, 700);
}
/* she / he from Add a sitter's "Show as" (the clay avatar), used in Sprout's lines */
const pro = (s, form) => { const m = /\/man\.webp$/.test(s.photo || ''); return form === 'obj' ? (m ? 'him' : 'her') : (m ? 'he' : 'she'); };
/* S4 (Tony + Mohit, 20 Nov US): the sitter has no app and answers by text. Sprout is in the group text and reads
   the reply (Mohit: "put the agent in watcher mode"), so the parent sees what was actually said. A sitter added
   without a rate gives it in the reply. */
const smsWords = (p, s, text) => { p.block(`<div class="preview gtx sms-in"><small>${face(s, 18)}${s.n} · in your group text</small><p></p><small class="gtx-read"><span class="orb sm"></span>Sprout read this</small></div>`).querySelector('p').textContent = text; p.scroll(); };
function smsIn(p, s, w){
  if (!s.cant && !s.rate) { s.rate = 24; s.rateFromReply = true; remember({ ...s }); }
  const said = s.cant ? `Sorry, I can’t do ${w.day.short} this time. Thanks for asking!`
    : `Yes, I can do ${w.day.short} ${range(w.from, w.to)}!${s.rateFromReply ? ` I charge $${s.rate}/hr.` : ''}`;
  p.block(`<div class="preview gtx sms-in"><small>${face(s, 18)}${s.n} · in your group text</small><p></p><small class="gtx-read"><span class="orb sm"></span>Sprout read this</small></div>`).querySelector('p').textContent = said;
}
/* S7 (Tony, 20 Nov US): ask the sitter where to get paid as soon as the booking is confirmed, not after the job
   ("they'll have some extra time... it's not like, I'm looking last minute"). Only if they haven't set it up yet.
   Bank details go to Stripe; the link opens the sitter's web profile (no app). */
const PAY_KIDS = {};
/* Ahmad, 22 Nov: where a sitter gets paid belongs to the sitter's own Sprout account (their number), not to one
   family. Every sitter sets it up once, the first time anyone books them; after that no family asks again. Tony
   only ever sees that it's set up and whether it's a bank or a debit card, never the details (they go to Stripe). */
const payoutKind = who => who.payout && who.payout.way === 'card' ? 'a debit card' : 'a bank account';
/* Ahmad, 22 Nov: a sitter can also take Venmo, Zelle, Cash App, PayPal or cash, so the family has choices */
const inSprout = who => who.payout && who.payout.way !== 'none';
const payoutWays = who => [...(inSprout(who) ? ['Sprout'] : []), ...((who.payout && who.payout.apps) || []).map(a => a.n)];
const payoutFact = who => who.payout ? `<i class="ph ph-bank"></i>${who.n} takes ${joinNames(payoutWays(who))}${inSprout(who) ? ` · ${payoutKind(who)} set up` : ''}`
  : `<i class="ph ph-hourglass-medium"></i>Waiting on ${who.n} to add where to get paid`;
const payoutFoot = who => !who.payout ? `<i class="ph ph-hourglass-medium"></i>${who.n} hasn’t added where to get paid yet. Sprout holds it and texts ${pro(who, 'obj')}; it lands once they do.`
  : inSprout(who) ? `<i class="ph ph-bank"></i>Through Sprout: to ${who.n}’s ${payoutKind(who).slice(2)}, ${who.payout.way === 'card' ? 'usually within minutes' : 'in 1–2 days'}`
  : `<i class="ph ph-info"></i>${who.n} doesn’t take payments in Sprout. Pick a way below`;
/* A3 (Tony, 25 Nov): after Book there is one summary, so the payout link is sent without its own rows in the chat.
   It returns the link; the booked card's payout line carries it (tappable on Tony's phone too). */
async function payoutLink(p, who, w){
  if (who.payout) return null;
  const pid = Math.random().toString(36).slice(2, 8);
  const href = '/pay/?' + new URLSearchParams({ n:who.n, d:w.day.day, t:range(w.from, w.to), r:who.rate || 25, h:(w.to - w.from) / 60, k:kidsShort(PAY_KIDS.kids || KIDS), l:pid, ...(who.phone ? { p:who.phone } : {}) });
  /* when the sitter finishes /pay/ (any tab, same site), Tony's phone hears it: a note, a ping, the status lines */
  if ('BroadcastChannel' in window) {
    const ch = new BroadcastChannel('sprout-pay-' + pid);
    ch.onmessage = e => {
      if (e.data?.t !== 'payout') return;
      ch.close();
      who.payout = { way:e.data.way, apps:e.data.apps || [] }; remember({ ...who });
      document.querySelectorAll(`[data-payout="${who.n}"]`).forEach(x => x.innerHTML = payoutFact(who));
      document.querySelectorAll(`[data-payout-foot="${who.n}"]`).forEach(x => x.innerHTML = payoutFoot(who));
      p.note(`${who.n} added where to get paid`, `Takes ${joinNames(payoutWays(who))}${inSprout(who) ? `. In Sprout it goes to ${payoutKind(who)} through Stripe` : ''}`, 'ph-bank');
      X.notify(p, `${who.n} added where to get paid`, `Takes ${joinNames(payoutWays(who))}`);
      p.scroll();
    };
  }
  const said = `${who.n}, so Tony can pay you through Sprout after ${w.day.long.split(',')[0]}, add where you’d like to get paid. Takes 2 minutes, and you only do it once:`;
  liveSay(who, `${said} sprout.app/pay/${who.n.toLowerCase()}`, 'Sprout', href);
  return href;
}
async function sendAndBook(p, asked, w, kids, { pick } = {}){
  PAY_KIDS.kids = kids;
  const sent = await groupTexts(p, asked, w, kids);
  const replied = new Map();
  /* linked (/other-side/): the first sitter asked is the phone on the right; the others still answer on their own */
  const live = link ? asked[0] : null;   // 25 Nov: row 6 has a sitter phone too, so a class-shared sitter answers live
  let liveAns = null, offWords = () => {};
  if (live) {
    liveAsk(live, { kind:'sitter', who:{ n:live.n, photo:live.photo }, label:`${live.n}, the sitter`, sub:'A normal text, no app to download.', text:groupMsg(live, w, kids), rate:live.rate || null });
    liveAns = link.next(['yes', 'no']);
    offWords = link.on(m => { if (m.t === 'text') smsWords(p, live, m.text); });
  }
  const H = (w.to - w.from) / 60;
  let ans;
  for (;;) {
    p.set('Waiting for replies', { when:w.day.short });
    const fallback = p.block('<button class="textbtn skip">Someone replied outside this text? Mark it</button>');
    let marking;
    fallback.firstElementChild.onclick = () => {
      markSheet(asked, states => Object.entries(states).forEach(([name, status]) => replied.set(name, status)));
      const sheet = $('#overlays').lastElementChild;
      marking = new Promise(resolve => {
        const observer = new MutationObserver(() => {
          if (!sheet.classList.contains('on')) { observer.disconnect(); resolve(); }
        });
        observer.observe(sheet, { attributes:true, attributeFilter:['class'] });
      });
    };
    const wait = (ms, title, body) => {
      const waiting = later(p, { status:'Waiting for replies', small:`${joinNames(asked.map(s => s.n))} · ${w.day.day}`, ms, title, body });
      p.chat.append(fallback); p.scroll();
      return waiting;
    };
    const expected = asked.filter(s => sent.has(s.n) && !replied.has(s.n));
    if (!expected.length) await wait(3500, 'Did any sitter text you back?', `Sitter for ${w.day.day}`);
    for (const [i, s] of expected.entries()) {
      if (replied.has(s.n)) continue;
      if (s === live) {
        const wt = p.block(`<div class="status"><span class="spinner"></span><div>Waiting for replies<small>${s.n} · in your group text</small></div></div>`);
        p.chat.append(fallback); p.scroll();
        const m = await liveAns; wt.remove();
        if (replied.has(s.n)) continue;
        X.notify(p, `${s.n} replied: ${m.t === 'yes' ? 'free' : 'can’t'}`, `In your group text with ${s.n}`);
        replied.set(s.n, m.t === 'yes' ? 'free' : 'no');
        if (m.text) smsWords(p, s, m.text);
        if (m.t === 'yes' && !s.rate) { const r = /\$(\d+)/.exec(m.text || ''); s.rate = r ? +r[1] : 24; s.rateFromReply = true; remember({ ...s }); }
        continue;
      }
      const response = s.cant ? 'can’t' : 'free';
      await wait(i === 0 ? 2500 : 1500, `${s.n} replied: ${response}`, `In your group text with ${s.n}`);
      if (!replied.has(s.n)) { replied.set(s.n, s.cant ? 'no' : 'free'); smsIn(p, s, w); }
    }
    await marking;
    fallback.remove();
    ans = {
      free:asked.filter(s => replied.get(s.n) === 'free'),
      cant:asked.filter(s => replied.get(s.n) === 'no'),
      wait:asked.filter(s => !replied.has(s.n)),
    };
    if (ans.free.length) break;
    const waiting = ans.wait;
    const declined = joinNames(ans.cant.map(s => s.n));
    const noReply = `${joinNames(waiting.map(s => s.n))} ${waiting.length > 1 ? 'haven’t' : 'hasn’t'} replied yet`;
    await p.say(`${declined ? declined + ' can’t make it' + (waiting.length ? ', and ' + noReply : '') : noReply}.`, 900);
    const opts = [waiting.length ? `Wait for ${joinNames(waiting.map(s => s.n))}` : null, 'Ask a class group', 'Change the time'].filter(Boolean);
    const k = await p.chips(opts, { stub:[opts.length - 1] });
    if (waiting.length && k === 0) {
      asked = waiting;
      continue;
    }
    return classGroup(p, w, kids, { pick });
  }
  const yes = ans.free;
  p.set(`${joinNames(yes.map(s => s.n))} can do it · pick one`, { when:w.day.short });
  /* N5 (Tony, 20 Nov): "I did say book here, then it's just gonna show me the price, and I'm gonna say book again...
     we don't want that." Book Alex is the booking: no estimate card, no second Book. Pay and rate come after. */
  let who = yes[0], selfReplied = false;
  if (yes.length > 1) { await p.say(`${joinNames(yes.map(s => s.n))} can both do it. Who should you book?`, 800); who = yes[await p.chips(yes.map(s => `Book ${s.n} · $${s.rate}/hr`))]; }
  else {
    await p.say(`${who.n} can do it, at $${who.rate}/hour${who.rateFromReply ? ` (${pro(who)} said so in the text)` : ''}. Book ${who.n}?`, 800);
    for (;;) {
      const k = await p.chips([`Book ${who.n}`, `I’ll reply to ${who.n} myself`, 'Not yet']);
      if (k === 0) break;
      if (k === 1) {   /* Tony: "If I just send the text and say awesome... Sprout knows that too... you're confirmed" */
        const sent = await compose({ ...who, group:true }, w, kids, `Awesome, thank you ${who.n}! See you ${w.day.long.split(',')[0]}.`, `In your group text with ${who.n} and Sprout. Sprout reads it.`, 'From your phone');
        if (!sent) continue;
        p.block(`<div class="preview gtx sms-out"><small>You · in your group text with ${who.n}</small><p></p></div>`).querySelector('p').textContent = `Awesome, thank you ${who.n}! See you ${w.day.long.split(',')[0]}.`;
        liveSay(who, `Awesome, thank you ${who.n}! See you ${w.day.long.split(',')[0]}.`, 'Tony Martin');
        selfReplied = true; break;
      }
      await p.say(`Okay. Nothing is booked yet. Tap Book when you’re ready.`, 600);
    }
  }
  const bookMsg = `${selfReplied ? `Hi ${who.n}, Sprout here with the details.` : 'Great, you’re booked!'} ${w.day.day}, ${range(w.from, w.to)} for ${kidsShort(kids)}. We’re at ${FAMILY.address}.${FAMILY.notes ? ' ' + FAMILY.notes : ''} See you then! Sprout, for Tony`;
  /* A3 (Tony, 25 Nov): "Alex is booked. I let Sam know you found someone." One summary after Book, no stack of
     what was texted to each sitter above it. The texts still go (and show on the linked phones); only the log is gone. */
  if (link && LIVE.classOnly) link.send({ t:'booked', n:who.n, when:`${w.day.day}, ${range(w.from, w.to)}` });
  liveSay(who, bookMsg);
  const payHref = await payoutLink(p, who, w);
  /* M1 (Tony, 19 Nov chat): no "Want to let Jordan know?" question. Every other sitter who was asked and didn't
     already say no hears right away that the family found someone, so nobody is left holding the evening. */
  const others = [...sent].filter(name => name !== who.n && replied.get(name) !== 'no');
  const toldNames = joinNames(others);
  if (others.length && live && others.includes(live.n)) liveSay(live, `Hi! We found a sitter for ${w.day.day}, so we’re all set this time. Thank you! Sprout, for Tony`);
  await p.say(`${selfReplied ? 'I saw your text, so ' : ''}${who.n} is booked.${others.length ? ` I let ${toldNames} know you found someone.` : ''} It’s in your Daily Brief. When ${who.n} is done, you’ll pay and rate here.`, 900);
  p.block(`<div class="card">${pick ? `<div class="cover" style="${M.ph(pick.k, 3)}"></div>` : ''}
    <div class="ctop">${clay('calendar-check')}<div><div class="eyebrow">${pick ? 'Date night' : 'Sitter'} · ${w.day.day}</div><div class="ttl">${pick ? 'Your evening' : `${who.n} is booked`}</div></div></div>
    <div class="ua-row on" style="margin-top:12px">${face(who)}<span class="tx"><b>${who.n}</b><small>${range(w.from, w.to)} · $${who.rate}/hr · pay in Sprout when they’re done</small></span><span class="ck"><i class="ph-bold ph-check"></i></span></div>
    ${pick ? `<div class="fact" style="margin-top:10px"><i class="ph ph-fork-knife"></i>${pick.place.n} · ${pick.time} · table for 2</div>` : ''}
    <div class="fact"><i class="ph ph-users"></i>${joinNames(kids.map(k => k.n))}</div>
    <div class="fact"><i class="ph ph-map-pin"></i>${FAMILY.address}</div>
    <div class="fact" data-payout="${who.n}">${payoutFact(who)}${payHref ? `<a class="link" href="${payHref}" target="_blank" rel="noopener">Payout link</a>` : ''}</div>
    <div class="fact"><i class="ph ph-calendar-check"></i>${pick ? 'On the family calendar' : `“${who.n}’s babysitting” on the family calendar`} · Dana has it too</div>
    <div class="fact"><i class="ph ph-bell-ringing"></i>Reminder for you both at ${tl(w.from - 30)}, then the evening on your lock screens</div></div>`);
  p.set(`Booked · ${pick ? pick.place.n + ' ' + pick.time + ' · ' : ''}${who.n} ${range(w.from, w.to)}`, { when:w.day.short, done:false });
  const d = await p.chips(['Text Dana the plan', 'Done']);
  if (d === 0) await textDana(p, w, kids, who, pick);
  else await p.say('All set.', 700);
  if (d === 1) X.closeSheet();
  /* I1: the rest happens on the family's clock (review panel): morning of, 30 min before, the evening, the morning after */
  await CLOCK.book({ p, i:w.day.i, S:w.from, E:w.to, D:pick ? pick.mins : null, place:pick ? pick.place : null, k:pick ? pick.k : null, who, kids, amt:Math.round(who.rate * H) });
  await payTonight(p, who, w, kids, H, { clock:true });
}
/* ---------- the Daily Brief To-Do list (17 Nov): Assist to-dos live in the real list, origin "Sprout Assist" ----------
   The existing rows stay pixel-exact: the Daily Brief image is cut at the header (y139), the rows (y546) and the card
   end (y614), and new rows are HTML in between, drawn to match. */
const TD = { done:[] };
function installTodo(){
  const img = $('#brief .rest'); if (!img || $('.tdx')) return;
  const wrap = el(`<div class="tdx"><div class="tdx-sl" data-a></div><div data-new></div><div class="tdx-sl" data-b></div><button class="tdx-done" data-done>Done (0) <i class="ph ph-caret-right"></i></button><div class="tdx-sl" data-c></div></div>`);
  const src = img.getAttribute('src'); img.replaceWith(wrap);
  const size = () => { const W = wrap.clientWidth, k = W / 786; wrap.style.setProperty('--k', k);
    [['a', 0, 139], ['b', 139, 546], ['c', 614, 3468], ['c1', 614, 1061], ['c2', 2183, 3468]].forEach(([n, y0, y1]) => { const d = wrap.querySelector(`[data-${n}]`); if (!d) return; d.style.cssText = `height:${(y1 - y0) * k}px;background:url(${src}) 0 ${-y0 * k}px/${W}px auto no-repeat`; }); };
  wrap._size = size; addEventListener('resize', size); size(); setTimeout(size, 300);
  wrap.querySelector('[data-done]').onclick = () => bsheet({ body:`<div class="bh"><span class="icotile"><i class="ph ph-check-circle"></i></span><b>Done</b></div>
    ${TD.done.length ? TD.done.map(d => `<div class="tdx-drow"><span class="tdx-box on"><i class="ph-bold ph-check"></i></span><div><b>${d.t}</b><small>${d.how}</small></div></div>`).join('') : '<p class="bp">Nothing done yet this week.</p>'}` });
}
/* ---------- Happening today (17 Nov): a booked plan shows on the day, in the existing card (featured on top + time rows).
   The image's Happening today section (y1061–2183) is swapped for the same card drawn in HTML for that day. ---------- */
function installHappening(){
  installTodo(); const wrap = $('.tdx'); let hp = wrap.querySelector('.hpx'); if (hp) return hp;
  const c = wrap.querySelector('[data-c]');
  const c1 = el('<div class="tdx-sl" data-c1></div>'), c2 = el('<div class="tdx-sl" data-c2></div>'); hp = el('<div class="hpx"></div>');
  c.replaceWith(c1); c1.after(hp); hp.after(c2); wrap._size(); return hp;
}
function happening({ evening, onOpen, rec }){
  if (rec) return happeningFor(rec, evening, onOpen);
  const hp = installHappening(), alex = SAVED[0];
  const bash = { time:'10:00 AM', title:'Back to School Bash', chip:'<i class="ph ph-users-three"></i>Family · Zilker Park', note:'<i class="ph ph-envelope-simple"></i>Patrick Collison’s invite · see Your Invitations' };
  const plan = `<span class="hp-chip as"><img src="${A}assist-clover-knit.png" alt="">Sprout Assist</span><span class="hp-chip">You and Dana</span>`;
  const sit = `<span class="hp-note"><i class="hp-face" style="background-image:url(${alex.photo})"></i>Alex 6:45–10:15 · Olive &amp; Ember at 7:15</span>`;
  const track = `<div class="hp-trk"><div class="bar"></div><div class="fill" style="width:4%"></div>${[['Alex 6:45', 6], ['Dinner 7:15', 33], ['Bed 8:30', 58], ['Home 10:15', 96]].map(([l, x], i) => `<span class="stop" style="left:${x}%"></span><span class="lbl" style="left:${x}%;${i === 3 ? 'transform:translateX(-88%)' : ''}">${l}</span>`).join('')}<span class="now" style="left:2%"></span></div>`;
  hp.innerHTML = `<div class="hp-head"><span>📅 Happening today</span><small>2 things</small></div><div class="hp-card">
    ${evening ? `<button class="hp-feat" data-open><span class="clayico" style="background-image:url(${A}clay/calendar-check.png)"></span>
        <span class="hp-ft"><span class="hp-time">6:45 PM <em>· in 30 min</em></span><span class="hp-chips" style="margin:0">${plan}</span></span></button>
      <button class="hp-ttl" data-open>Date night</button>
      <p class="hp-desc">Alex arrives in 30 minutes. Leave by 6:55 for your 7:15 table at Olive &amp; Ember.</p>${track}
      <div class="hp-acts"><button data-t="Opens Messages to Alex"><i class="ph-bold ph-chat-circle-dots"></i>Text Alex</button><button data-t="Opens Maps to Olive & Ember"><i class="ph-bold ph-map-trifold"></i>Directions</button></div>
      <button class="hp-row past"><span class="hp-when">${bash.time}</span><span class="hp-body"><b>${bash.title}</b><span class="hp-chips"><span class="hp-chip">${bash.chip}</span><span class="hp-chip done"><i class="ph-bold ph-check"></i>Earlier today</span></span></span><i class="ph ph-caret-right"></i></button>`
    : `<button class="hp-feat" data-bash><span class="clayico" style="background-image:url(${A}clay/event.png)"></span><span class="hp-ft"><span class="hp-time">${bash.time}</span><span class="hp-chip">${bash.chip}</span></span></button>
      <div class="hp-ttl">${bash.title}</div><p class="hp-desc">Games, food trucks and a bounce house. Bring water and sunscreen.</p>
      <button class="hp-row new" data-open><span class="hp-when">6:45 PM</span><span class="hp-body"><b>Date night</b><span class="hp-chips">${plan}</span>${sit}</span><i class="ph ph-caret-right"></i></button>`}
  </div>`;
  hp.querySelectorAll('[data-open]').forEach(b => b.onclick = onOpen);
  hp.querySelectorAll('[data-t]').forEach(b => b.onclick = () => toast(b.dataset.t));
  hp.querySelector('[data-bash]')?.addEventListener('click', () => toast('Opens the event (not part of this demo)'));
  hp.querySelector('.hp-row.past')?.addEventListener('click', () => toast('Opens the event (not part of this demo)'));
  setTimeout(() => hp.querySelector('.hp-row.new')?.classList.remove('new'), 2600);
}
function paintDone(){ const b = $('.tdx [data-done]'); if (b) b.innerHTML = `Done (${TD.done.length}) <i class="ph ph-caret-right"></i>`; }
/* add a to-do row: tap the row = open the plan; tick the box = "how did you pay?" */
function addTodo({ title, due, onOpen, onTick }){
  installTodo();
  const host = $('.tdx [data-new]'); if (!host) return { done(){} };
  const row = el(`<div class="tdx-row new"><button class="tdx-box" aria-label="Mark done"></button>
    <span class="tdx-av"><i style="background-image:url(${A}tony.webp)"></i><b class="tdx-badge"><img src="${A}assist-clover-knit.png" alt=""></b></span>
    <button class="tdx-tx"><span class="tdx-t">${title}</span><span class="tdx-m"><span class="tdx-chip">${due}</span>From Sprout Assist</span></button></div>`);
  host.prepend(row);
  row.querySelector('.tdx-tx').onclick = onOpen;
  row.querySelector('.tdx-box').onclick = onTick;
  setTimeout(() => row.classList.remove('new'), 2600);
  return { done(how){ const box = row.querySelector('.tdx-box'); box.classList.add('on'); box.innerHTML = '<i class="ph-bold ph-check"></i>'; row.classList.add('ticked');
    setTimeout(() => { row.classList.add('out'); setTimeout(() => { row.remove(); TD.done.unshift({ t:title, how }); paintDone(); }, 380); }, 900); } };
}
/* S6 (20 Nov US) reversed the order below: pay first, then rate (payCard + payTonight).
   L3 (Tony, 19 Nov): pay and rate the moment the sitter is done, not the next morning ("They're gonna wanna get
   paid right after"). Rating + a note first (it helps the next family who books this sitter), then pay through
   Sprout: Stripe sends it to the sitter's bank (18 Nov decision). "Paid another way" stays for cash nights.
   The same moment puts "Pay Casey $72" on the To-Do list; tapping it opens this card. */
function rateCard(p, who){
  return new Promise(res => {
    let stars = 0;
    const c = p.block(`<div class="card"><div class="ctop">${face(who, 44)}<div><div class="eyebrow">Rate ${who.n}</div><div class="ttl">How did it go?</div></div></div>
      <div class="stars" role="radiogroup" aria-label="Rating">${[1, 2, 3, 4, 5].map(n => `<button type="button" class="star" data-s="${n}" role="radio" aria-checked="false" aria-label="${n} star${n > 1 ? 's' : ''}"><i class="ph-fill ph-star"></i></button>`).join('')}</div>
      <label class="field in" style="margin-top:12px"><div style="width:100%"><div class="l">A note for the next family (optional)</div><textarea class="edt" rows="2" placeholder="Great with bedtime. Jake loved the board games."></textarea></div></label>
      <div class="foot"><i class="ph ph-users-three"></i>Parents in your classes see your stars and note when they look at ${who.n}</div>
      <button class="btn" data-go style="margin-top:12px" disabled>Tap a star</button></div>`).querySelector('.card');
    const go = c.querySelector('[data-go]'), all = [...c.querySelectorAll('.star')];
    all.forEach(b => b.onclick = () => { stars = +b.dataset.s; all.forEach(x => { const on = +x.dataset.s <= stars; x.classList.toggle('on', on); x.setAttribute('aria-checked', +x.dataset.s === stars); });
      go.disabled = false; go.textContent = 'Save rating'; });
    go.onclick = () => {
      const note = c.querySelector('textarea').value.trim();
      c.querySelectorAll('button, textarea').forEach(x => x.disabled = true); go.remove();
      p.me(`${'★'.repeat(stars)}${note ? ` · “${playdateEscape(note)}”` : ''}`); res({ stars, note });
    };
    p.scroll();
  });
}
/* S6 (Tony, 20 Nov US): "Pay Casey" goes to paying first, then the rating ("it shouldn't do the rating and then go
   to the payment... that's kinda confusing"). The total isn't hard coded: change the hours if they stayed late
   ("we got home at 11, so an extra hour"), add a tip by percent, or say you already paid in cash or Venmo
   (replaces "Decline"). Paying through Sprout goes to the sitter's bank via Stripe, and the sitter gets a text. */
function payCard(p, who, w, H){
  return new Promise(res => {
    const wallet = X.wallet, TIPS = [0, 10, 15, 20];
    let card = wallet.cards.find(c => c.def) || wallet.cards[0], h = H, tip = 0, tipAmt = null;   // tipAmt: a typed dollar tip (S8)
    const c = p.block(`<div class="card pay pc" data-paycard>
      <div class="ctop">${face(who, 44)}<div><div class="eyebrow">Pay ${who.n}</div><div class="ttl">${w.day.long.split(',')[0]} · ${range(w.from, w.to)}</div></div></div>
      <div class="pc-row"><div><b>Hours</b><small data-hs></small></div><div class="pc-step"><button type="button" data-h="-1" aria-label="Fewer hours"><i class="ph-bold ph-minus"></i></button><b data-hv></b><button type="button" data-h="1" aria-label="More hours"><i class="ph-bold ph-plus"></i></button></div></div>
      <div class="dlabel" style="margin-top:12px">Add a tip</div>
      <div class="fchips" style="margin-top:6px" data-tips>${TIPS.map(t => `<button type="button" class="chip" data-t="${t}">${t ? t + '%' : 'No tip'}</button>`).join('')}<button type="button" class="chip" data-custom>Other</button></div>
      <div class="line" style="margin-top:12px"><span data-l1></span><span data-v1></span></div>
      <div class="line" data-tl><span>Tip</span><span data-v2></span></div>
      <div class="total"><span>Total</span><span data-tot></span></div>
      <button class="cardrow" data-card style="width:100%;text-align:left;background:transparent"><i class="ph ph-credit-card" style="font-size:20px"></i><div><span class="cl">${card.label}</span><small class="cs">${card.sub}</small></div><i class="ph ph-caret-right"></i></button>
      <div class="foot" data-payout-foot="${who.n}">${payoutFoot(MY.find(x => x.n === who.n) || who)}</div>
      <button class="btn" data-pay style="margin-top:12px"></button>
      <div data-alt></div>
      <button class="textbtn" data-other style="display:block;margin:10px auto 0">Already paid (cash or Venmo)</button></div>`).querySelector('.card');
    /* Ahmad, 22 Nov: the ways this sitter takes besides Sprout (from /pay/). An app opens with the amount; cash is
       marked paid. Either way Sprout tells the sitter and moves on to the rating. */
    const me = MY.find(x => x.n === who.n) || who, alt = (me.payout && me.payout.apps) || [];
    if (alt.length) {
      c.querySelector('[data-alt]').innerHTML = `<div class="dlabel" style="margin-top:14px">${inSprout(me) ? `Or pay ${who.n} another way` : `Pay ${who.n} with`}</div>
        <div class="fchips" style="margin-top:6px">${alt.map((a, i) => `<button type="button" class="chip" data-app="${i}">${a.n}</button>`).join('')}</div>`;
      c.querySelector('[data-other]').remove();
    }
    if (me.payout && !inSprout(me)) { c.querySelector('[data-pay]').remove(); c.querySelector('.cardrow').remove(); }
    const money = n => '$' + (Math.round(n * 100) / 100).toFixed(2);
    const dur = x => x % 1 === 0 ? hrs(x) : x < 1 ? '30 min' : `${Math.floor(x)}½ hours`;
    const sum = () => { const sub = who.rate * h, t = tipAmt != null ? tipAmt : Math.round(sub * tip) / 100; return { sub, t, total:sub + t }; };
    const paint = () => {
      const { sub, t, total } = sum(), extra = h - H;
      c.querySelector('[data-hv]').textContent = dur(h);
      c.querySelector('[data-hs]').textContent = extra ? `Booked ${dur(H)} · ${extra > 0 ? dur(extra) + ' extra' : dur(-extra) + ' less'}` : `Booked ${range(w.from, w.to)}`;
      c.querySelector('[data-h="-1"]').disabled = h <= .5;
      c.querySelectorAll('[data-t]').forEach(b => b.classList.toggle('sel', tipAmt == null && +b.dataset.t === tip));
      const cu = c.querySelector('[data-custom]'); cu.classList.toggle('sel', tipAmt != null); cu.textContent = tipAmt != null ? money(tipAmt).replace(/\.00$/, '') : 'Other';
      c.querySelector('[data-l1]').textContent = `${dur(h)} × $${who.rate}`; c.querySelector('[data-v1]').textContent = money(sub);
      c.querySelector('[data-tl]').hidden = !t; c.querySelector('[data-v2]').textContent = money(t);
      c.querySelector('[data-tot]').textContent = money(total);
      c.querySelector('[data-pay]').textContent = `Pay ${who.n} ${money(total).replace(/\.00$/, '')}`;
    };
    c.querySelectorAll('[data-h]').forEach(b => b.onclick = () => { h = Math.max(.5, Math.min(H + 4, h + .5 * +b.dataset.h)); paint(); });
    c.querySelectorAll('[data-t]').forEach(b => b.onclick = () => { tip = +b.dataset.t; tipAmt = null; paint(); });
    /* S8 (Tony, 20 Nov US: "a little option to add a tip"): any amount, typed in dollars, next to the percents */
    c.querySelector('[data-custom]').onclick = () => {
      const sub = who.rate * h, v = bsheet({ body:`<div class="bh"><span class="icotile"><i class="ph ph-hand-coins"></i></span><b>Tip ${who.n}</b></div>
          <p class="bp">Any amount. 15% of ${money(sub).replace(/\.00$/, '')} would be ${money(Math.round(sub * 15) / 100)}.</p>
          <label class="tip-in"><span>$</span><input inputmode="decimal" autocomplete="off" placeholder="0" value="${tipAmt != null ? tipAmt : ''}" aria-label="Tip amount in dollars"></label>`,
        foot:'<button type="button" class="btn" data-go>Add tip</button>' });
      const input = v.body.querySelector('input'), go = v.foot.querySelector('[data-go]');
      const val = () => { const n = parseFloat(input.value.replace(/[^0-9.]/g, '')); return isFinite(n) ? Math.round(n * 100) / 100 : 0; };
      const label = () => { const n = val(); go.textContent = n ? `Add ${money(n).replace(/\.00$/, '')} tip` : 'No tip'; };
      input.oninput = label; label(); setTimeout(() => input.focus({ preventScroll:true }), 250);   // no page jump on the review desk
      go.onclick = () => { const n = val(); tipAmt = n > 0 ? n : null; if (!n) tip = 0; v.close(); paint(); };
    };
    const cr = c.querySelector('[data-card]');
    cr.onclick = () => X.pickCard(k => { card = k; cr.querySelector('.cl').textContent = k.label; cr.querySelector('.cs').textContent = k.sub; }, card.id);
    const lock = () => { c.querySelectorAll('button').forEach(b => b.disabled = true); c.querySelector('[data-other]')?.remove(); c.querySelector('[data-pay]')?.remove(); c.querySelectorAll('.fchips').forEach(x => x.remove()); c.querySelectorAll('.dlabel').forEach(x => x.remove()); };
    c.querySelectorAll('[data-app]').forEach(btn => btn.onclick = () => {
      const a = alt[+btn.dataset.app], r = sum(), amount = money(r.total).replace(/\.00$/, '');
      const done = () => {
        lock(); c.querySelector('.cardrow')?.remove(); c.querySelector('[data-payout-foot]')?.remove();
        c.querySelector('.eyebrow').textContent = `Paid ${who.n}`;
        c.appendChild(el(`<div class="paid"><i class="ph ph-check-circle"></i><span>Paid ${money(r.total)} · ${a.k === 'cash' ? 'in cash' : `on ${a.n}${a.h ? ' to ' + playdateEscape(a.h) : ''}`}</span></div>`));
        p.me(a.k === 'cash' ? `Paid ${who.n} ${amount} in cash` : `Paid ${who.n} ${amount} on ${a.n}`); p.scroll();
        res({ how:'app', app:a, hours:h, ...r });
      };
      if (a.k === 'cash') return done();
      const v = bsheet({ body:`<div class="bh"><span class="icotile"><i class="ph ph-device-mobile"></i></span><b>Pay ${who.n} on ${a.n}</b></div>
          <p class="bp">${amount} to ${a.h ? `<b>${playdateEscape(a.h)}</b>` : who.n}. ${a.n} opens with the amount filled in; come back and Sprout marks it paid.</p>`,
        foot:`<button type="button" class="btn" data-go>Open ${a.n} · ${amount}</button>` });
      v.foot.querySelector('[data-go]').onclick = () => { v.close(); toast(`Opens ${a.n}: ${amount} to ${a.h || who.n}`); setTimeout(done, 700); };
    });
    c.querySelector('[data-pay]').onclick = async e => {
      const b = e.currentTarget; b.innerHTML = '<span class="spinner" style="border-color:rgba(255,255,255,.35);border-top-color:#fff"></span>'; c.querySelectorAll('button').forEach(x => x.style.pointerEvents = 'none');
      await X.faceId();
      const r = sum(); lock(); cr.querySelector('.ph-caret-right')?.remove();
      c.querySelector('.eyebrow').textContent = `Paid ${who.n}`;
      c.appendChild(el(`<div class="paid"><i class="ph ph-check-circle"></i><span>Paid ${money(r.total)} · ${card.label} · confirmation SP-${2200 + Math.round(r.total)}</span></div>`));
      p.me(`Pay ${who.n} ${money(r.total).replace(/\.00$/, '')}`); p.scroll();
      res({ how:'sprout', hours:h, ...r });
    };
    const other = c.querySelector('[data-other]');   // gone when the sitter listed their own ways (the chips replace it)
    if (other) other.onclick = () => { const r = sum(); lock(); c.querySelector('.cardrow')?.remove(); c.querySelector('.foot')?.remove(); res({ how:'other', hours:h, ...r }); };
    paint(); p.scroll();
  });
}
async function payTonight(p, who, w, kids, H, opt = {}){
  const amt = Math.round(who.rate * H), late = w.to >= 17 * 60, dayName = w.day.long.split(',')[0];
  if (!opt.clock) await later(p, { status:`${who.n} is booked`, small:`${w.day.day} · ${range(w.from, w.to)}`, ms:3500, title:`${who.n} is done`, body:`Pay ${who.n} and say how it went` });
  const goToCard = () => { X.showPlan(p); X.openSheet(); setTimeout(() => { const c = p.chat.querySelector('[data-paycard]') || p.chat.querySelector('.stars'); if (c) p.chat.scrollTo({ top: c.closest('.row').offsetTop - p.chat.offsetTop - 60, behavior:'smooth' }); }, 450); };
  const todo = addTodo({ title:`Pay ${who.n} $${amt}`, due:late ? 'Tonight' : 'Today', onOpen:goToCard, onTick:goToCard });
  p.divider(`${w.day.short} · ${ampm(w.to)}`);
  await p.say(`${who.n} is done for ${late ? 'the night' : 'today'}. If ${pro(who)} stayed longer, change the hours. You can add a tip too.`, 800);
  const pay = await payCard(p, who, w, H);
  const total = '$' + pay.total.toFixed(2).replace(/\.00$/, '');
  let via = `Through Sprout · in ${who.n}’s bank in 1–2 days`;
  if (pay.how === 'sprout') {
    const t = p.work(`Texting ${who.n} the payment`, `In your group text with ${who.n}`); await sleep(900);
    t.done(`Told ${who.n} you paid`, `${total} · in the group text`, 'ph-paper-plane-tilt');
    liveSay(who, `${who.n}, Tony just paid you ${total} for ${dayName}. It’ll be in your bank in 1–2 days. Thank you! Sprout`);
    p.block(`<div class="preview gtx"><small>Group text · ${groupWho(who)}</small><p></p></div>`).querySelector('p').textContent =
      `${who.n}, Tony just paid you ${total} for ${dayName}${pay.t ? ` ($${(pay.sub).toFixed(2).replace(/\.00$/, '')} + $${pay.t.toFixed(2).replace(/\.00$/, '')} tip)` : ''}. It’ll be in your bank in 1–2 days. Thank you! Sprout`;
  } else if (pay.how === 'app') {
    const a = pay.app, how = a.k === 'cash' ? 'in cash' : `on ${a.n}`;
    via = a.k === 'cash' ? 'Cash' : `${a.n}${a.h ? ' · ' + a.h : ''}`;
    const t = p.work(`Telling ${who.n} you paid`, `In your group text with ${who.n}`); await sleep(800);
    t.done(`Told ${who.n} you paid`, `${total} ${how}`, 'ph-paper-plane-tilt');
    const msg = `${who.n}, Tony paid you ${total} ${how} for ${dayName}. Thank you! Sprout`;
    liveSay(who, msg);
    p.block(`<div class="preview gtx"><small>Group text · ${groupWho(who)}</small><p></p></div>`).querySelector('p').textContent = msg;
  } else {
    p.me('Already paid');
    await p.say(`Got it. How did you pay ${who.n}?`, 700);
    const k = await p.chips(['Cash', 'Venmo or another app', 'I’ll pay later']);
    if (k === 2) { await p.say(`Okay. It stays on your to-do list until you do.`, 700); p.set(`Pay ${who.n} $${amt}`, { when:w.day.short, attn:false }); return; }
    via = k === 0 ? 'Cash' : 'Venmo or another app';
  }
  p.note(`Paid ${who.n} ${total}`, via, 'ph-check-circle');
  todo.done(`Paid ${who.n} · ${via.split(' · ')[0]}`);
  await p.say(`Paid. How did it go with ${who.n}?`, 800);
  const r = await rateCard(p, who);
  if (r.stars <= 2) await p.say(`Sorry to hear that. I won’t suggest ${who.n} first next time.`, 800);
  const n = (who.times5 || (MY.find(m => m.n === who.n)?.count ?? (who.parent || who.by === 'Added by you' ? 0 : 1))) + 1;
  remember({ ...who, count:n, times5:n, stars:r.stars, note:r.note, times: n === 1 ? 'Sat for you once' : n === 2 ? 'Sat for you twice' : `Sat for you ${n} times` });
  await p.say(`Thanks${r.note ? ', that note helps the next family' : ''}. It’s ticked off your to-do list. ${who.n} has sat for you ${n === 1 ? 'once' : n === 2 ? 'twice' : n + ' times'} now${r.stars >= 4 ? `, and I’ll suggest ${who.n} first next time` : ''}.`, 900);
  p.set(`${who.n} · paid ${total}`, { when:w.day.short, done:true, attn:false }); X.renderHome();
}

/* ---------- no sitters anywhere: ask a class group; parents share name + number ---------- */
async function classGroup(p, w, kids, opt){
  await p.say('Which class group should I ask? Parents can share a sitter they trust, with a name and number.', 900);
  const g = await p.chips(['Maya’s class', 'Jake’s class', 'Both classes']);
  const where = ['Miss Taylor’s class', 'Miss Poole’s class', 'Both class groups'][g];
  await p.say(`Here’s the message for ${where}. Your address isn’t in it.`, 800);
  const m = p.block(`<div class="card"><div class="preview"><small>To ${where} · from Tony</small><p data-txt>Hi everyone! We’re looking for a sitter for ${w.day.day}, ${range(w.from, w.to)}, for ${joinNames(kids.map(k => `${k.n} (${k.age})`))}. If you have one you trust, tap “Share a sitter” and add their name and number. Thank you!</p></div>
    <div class="foot"><i class="ph ph-info"></i>Parents see a “Share a sitter” button under your message</div></div>`);
  for (;;) {
    const e = await p.chips(['Send to ' + (g === 2 ? 'both groups' : 'the group'), 'Edit message'], { into:m.querySelector('.card'), echo:false });
    if (e === 0) { p.me('Send to ' + (g === 2 ? 'both groups' : 'the group')); break; }
    m.querySelectorAll('.chips').forEach(x => x.remove());
    const t = await editText('Edit the message', m.querySelector('[data-txt]').textContent); if (t) m.querySelector('[data-txt]').textContent = t;
  }
  p.note(where, 'Posted · waiting for parents', 'ph-chat-circle-text');
  p.set('Waiting for class parents', { when:w.day.short });
  /* Ahmad, 24 Nov (/other-side/ row 6): linked, the right phone is a parent in that class. Priya for Maya's class
     (or both), Elena for Jake's. Tony's exact post lands in their class chat; what they share comes back here. */
  /* Ahmad, 25 Nov: row 6 is four phones. Two class parents (one with the chat open, one who gets the push) can both
     share; the first share opens the list, later ones join it (or are saved, if Tony already asked). */
  const CPS = g === 1 ? CLASS_PARENTS.jake : CLASS_PARENTS.maya, CP = CPS[0];
  let firstShare = null, laterShare = null;
  const sharedLive = link ? new Promise(r => firstShare = r) : null;
  if (link) link.on(m => { if (m.t !== 'shared') return; if (firstShare) { const f = firstShare; firstShare = null; f(m); } else if (laterShare) laterShare(m); });
  if (link) { LIVE.classOnly = true; liveAsk({ n:CP.n }, { kind:'class', label:`${CP.n}, ${CP.rel}`, sub:`A parent in ${where}. Gets Tony’s post in the class chat.`, text:m.querySelector('[data-txt]').textContent, cp:CP, cps:CPS, kid:g === 1 ? 'Jake' : 'Maya', where:g === 1 ? 'Miss Poole’s class' : 'Miss Taylor’s class' }); LIVE.cls = LIVE.msg; }
  const closeLive = why => { if (link) link.send({ t:'closed', why }); };
  await p.say('Posted. I’ll tell you when parents share someone.', 800);
  /* G5 (17 Nov): the waiting card has a small X (cancel the class request) and "Add a sitter while you wait".
     Adding someone doesn't stop the class request: if parents share later, their sitters slot into the open list
     (or are just saved, if the parent already moved on). */
  const wc = p.block(`<div class="card wcls"><div class="wcls-top"><span class="spinner" data-sp></span><div class="wcls-tx"><b data-t>Waiting for parents</b><small data-s>${where} · usually within a few hours</small></div>
      <button class="wx" data-x aria-label="Cancel the class request"><i class="ph ph-x"></i></button></div>
    <button class="sl-add" data-add><i class="ph ph-plus"></i>Add a sitter while you wait</button></div>`).querySelector('.card');
  const setWait = (t, sm, icon) => { wc.querySelector('[data-t]').textContent = t; wc.querySelector('[data-s]').textContent = sm;
    const sp = wc.querySelector('[data-sp]'); if (icon) sp.outerHTML = `<span class="icotile" data-sp><i class="ph ${icon}"></i></span>`;
    wc.querySelector('[data-x]')?.remove(); wc.querySelector('[data-add]')?.remove(); };
  p.scroll();
  let live = true, list = null;   // list = the open "Who should I ask?" card, once there is one
  /* linked: what each class parent shared, privately, tagged with who shared it */
  const leadsOf = x => x.sitters.map(s => ({ ch:'Messages', rate:25, ...s, parent:x.by.n, kid:x.by.kid, rel:x.by.rel, pimg:x.by.pimg || undefined, note:s.note || '' }));
  const replies = link ? sharedLive.then(x => {
    LEADS.splice(0, LEADS.length, ...leadsOf(x));
    laterShare = y => {   /* the second parent shares later: into the open list, or saved for next time */
      const ls = leadsOf(y).filter(l => !LEADS.some(o => o.n === l.n)); if (!ls.length) return;
      LEADS.push(...ls); ls.forEach(l => remember({ ...l, times:`Shared by ${l.parent}` }));
      const what = `${y.by.n} shared ${joinNames(ls.map(l => l.n))}`;
      if (list && list.isOpen()) { ls.forEach(l => list.addRow({ ...MY.find(o => o.n === l.n) }, false)); toast(what); }
      else X.notify(p, what, 'Saved to your sitters');
    };
    return 'replies'; }) : new Promise(r => setTimeout(() => r('replies'), 9000));
  const cancelled = new Promise(r => wc.querySelector('[data-x]').onclick = () => r('cancel'));
  const added = new Promise(r => wc.querySelector('[data-add]').onclick = async () => { const a = await addSitter(); if (a) r(a); });
  const shareIn = () => {   /* parents replied: save their sitters; if the list is still open, add them to it (unticked) */
    LEADS.forEach(l => remember({ ...l, times:`Shared by ${l.parent}` }));
    setWait(`${joinNames(LEADS.map(l => l.parent))} shared a sitter`, `${joinNames(LEADS.map(l => l.n))} · saved to your sitters`, 'ph-hand-heart');
    p.set('Parents shared sitters', { when:w.day.short });
    if (list && list.isOpen()) { LEADS.forEach(l => list.addRow({ ...MY.find(m => m.n === l.n) }, false)); toast(`${joinNames(LEADS.map(l => l.parent))} shared a sitter`); }
    else X.notify(p, `${LEADS.length} parents shared a sitter`, `${joinNames(LEADS.map(l => l.parent))} replied in the class group`);
  };
  const first = await Promise.race([replies, cancelled, added]);

  if (first === 'cancel') {
    live = false; setWait('Class request cancelled', `${where} · parents can’t reply to it now`, 'ph-x-circle'); closeLive('cancel');
    p.set('Request cancelled', { when:w.day.short });
    p.me('Cancel the class request');
    await p.say('Cancelled. Want to add a sitter you know instead?', 700);
    const i = await p.chips(['Add a sitter', 'Not now']);
    if (i === 1) { await p.say('Okay. Start again anytime from Book a sitter.', 600); p.set('Request cancelled', { when:w.day.short, done:true }); return; }
    const a = await addSitter();
    if (!a) { await p.say('No problem. Start again anytime from Book a sitter.', 600); p.set('Request cancelled', { when:w.day.short, done:true }); return; }
    const who = await whoCard(p, [{ ...a, added:true }], { hours:(w.to - w.from) / 60, line:x => x.phone });
    return sendAndBook(p, who.map(x => MY.find(m => m.n === x.n) || x), w, kids, opt);
  }

  if (first !== 'replies') {   /* added a sitter while waiting: the class request keeps going */
    const a = first;
    wc.querySelector('[data-add]')?.remove();
    await p.say(`Saved ${a.n}. I’m still asking ${where}, so anyone parents share shows up here too. Tap × on the request to stop it.`, 900);
    replies.then(() => { if (live) { live = false; shareIn(); } });
    wc.querySelector('[data-x]').onclick = () => { if (!live) return; live = false; setWait('Class request cancelled', `${where} · parents can’t reply to it now`, 'ph-x-circle'); closeLive('cancel'); toast('Class request cancelled'); };
    const who = await whoCard(p, [{ ...a, added:true }], { hours:(w.to - w.from) / 60, line:x => x.phone, onReady:api => list = api });
    if (live) { live = false; setWait('Class request closed', `You picked ${joinNames(who.map(x => x.n))}, so I stopped asking ${where}`, 'ph-check-circle'); closeLive('found'); }
    return sendAndBook(p, who.map(x => MY.find(m => m.n === x.n) || x), w, kids, opt);
  }

  live = false;
  LEADS.forEach(l => remember({ ...l, times:`Shared by ${l.parent}` }));
  setWait(`${joinNames(LEADS.map(l => l.parent))} shared a sitter`, `${joinNames(LEADS.map(l => l.n))} · saved to your sitters`, 'ph-hand-heart');
  const sharers = [...new Set(LEADS.map(l => l.parent))], nS = LEADS.length, nW = ['', 'One', 'Two', 'Three', 'Four', 'Five'][sharers.length] || sharers.length;
  X.notify(p, `${sharers.length} parent${sharers.length > 1 ? 's' : ''} shared a sitter`, `${joinNames(sharers)} replied`);
  await p.say(`${nW} parent${sharers.length > 1 ? 's' : ''} shared ${nS > 1 ? nS + ' sitters' : 'a sitter'}. I saved ${nS > 2 ? 'them all' : nS > 1 ? 'both' : LEADS[0].n} to your sitters.`, 900);
  p.block(`<div class="card"><div class="ctop">${clay('person-plus')}<div><div class="eyebrow">Shared by class parents</div><div class="ttl">${nS} new sitter${nS > 1 ? 's' : ''}</div></div></div>
    ${LEADS.map(l => `<div class="lead">${face(l, 44)}<div><div class="v">${l.n} · ${l.phone}</div><div class="fs">${l.pimg ? `<i class="ucp" style="background-image:url(${A}${l.pimg})"></i>` : ''}From ${l.parent}, ${l.rel || l.kid + '’s mom'}</div>${l.note ? `<q>${playdateEscape(l.note)}</q>` : ''}</div></div>`).join('')}
    <div class="foot ok"><i class="ph ph-check-circle"></i>Saved to your sitters</div></div>`);
  await p.say('Who should I ask?', 600);
  const who = await whoCard(p, LEADS.map(s => ({ ...MY.find(m => m.n === s.n) })), { hours:(w.to - w.from) / 60, line:s => s.phone, onReady:api => list = api });   /* G4: Add a sitter here too */
  return sendAndBook(p, who, w, kids, opt);
}

/* ---------- who to ask (F1, 17 Nov): your saved sitters if you have any; otherwise add one or ask a class group ---------- */
async function chooseAndSend(p, w, kids, opt = {}){
  const classes = `${joinNames(kids.map(k => k.n + '’s'))} class${kids.length > 1 ? 'es' : ''}`, H = (w.to - w.from) / 60;
  if (STATE === 'class') {   /* review route: other parents already shared their sitters */
    await p.say(`You don’t have any sitters saved yet. Add one you know, or use a sitter parents in ${classes} have shared.`, 1000);
    const i = await p.chips(['See class parents’ sitters', 'Add a sitter']);
    if (i === 1) { const s = await addSitter(); if (s) return sendAndBook(p, [s], w, kids, opt); }
    await p.say('3 parents in your kids’ classes shared their sitter. I send the request, so their number stays private until they reply.', 1100);
    const who = await whoCard(p, CLASS_SITTERS.map(s => ({ ...s })), { hours:H, line:s => `${s.kid}’s mom · ${s.cls}` });
    return sendAndBook(p, who, w, kids, opt);
  }
  if (!MY.length) {
    await p.say(`You don’t have any sitters saved yet. Add someone you know, or I can ask ${classes.replace(/classes$/, 'class groups').replace(/class$/, 'class group')}: parents there can recommend one.`, 1100);
    for (;;) {
      const i = await p.chips(['Add a sitter', 'Ask a class group']);
      if (i === 1) return classGroup(p, w, kids, opt);
      const s = await addSitter();
      if (s) { await p.say(`Saved ${s.n} to your sitters. Add anyone else?`, 700); break; }
      await p.say('No problem. Add someone, or ask a class group.', 600);
    }
  } else await p.say('Who should I ask? These are your sitters.', 700);
  const r = await whoCard(p, MY.map(x => ({ ...x })), { hours:H, line:s => s.times || s.by, askClass:true });
  if (r.extra === 1) return classGroup(p, w, kids, opt);
  return sendAndBook(p, r.map(x => MY.find(m => m.n === x.n) || x), w, kids, opt);
}

/* ======================= C1 · Book a sitter ======================= */
X.flows.sitterC1 = async (p, opt = {}) => {
  if (opt.review === 'conversation' || opt.review === 'dana') {
    const w = { day:DAYS.find(d => d.w === 'Sat'), from:18 * 60, to:22 * 60 };
    if (opt.review === 'conversation') return sendAndBook(p, [{ ...SAVED[0] }], w, KIDS);
    return textDana(p, w, KIDS, SAVED[0]);
  }
  await p.say('Happy to. When do you need someone?', 800);
  const w = await whenCard(p);
  sub(p, `Sitter · ${w.day.day}`); p.title = `Sitter · ${w.day.day}`; p.set('Just started', { when:w.day.short });
  await p.say('And who is it for?', 600);
  const kids = await kidsCard(p);
  await p.say(FAMILY.known ? 'Same address and notes as last time?' : 'Where should the sitter come? I’ll save it for next time.', 700);
  await requestCard(p, w, kids);
  await chooseAndSend(p, w, kids);
};

/* ======================= C2 · Plan a date night ======================= */
const EXTRA = {
  olive:{ rating:4.7, reviews:1312, two:'$110', tags:['Italian'], tier:['high', 'mid'], why:'Hand-made pasta and a quiet patio. Priya and Aisha from Maya’s class loved it.', slots:['5:45', '6:30', '6:45', '7:15', '8:15', '8:45'],
            menu:[['To start', [['Burrata, peaches, basil', '$16'], ['Wood-fired focaccia', '$9']]], ['Pasta', [['Pappardelle, slow-cooked ragù', '$27'], ['Cacio e pepe', '$22']]], ['Dessert', [['Olive oil cake', '$11']]]] },
  casa:{ rating:4.5, reviews:2048, two:'$60', tags:['Mexican'], tier:['mid', 'budget'], why:'Garden patio with live music on Saturdays. Easy, lively, great margaritas.', slots:['6:00', '6:45', '7:00', '7:30', '8:00'],
            menu:[['Tacos', [['Carne asada, wood-grilled', '$16'], ['Mushroom al pastor', '$14']]], ['Plates', [['Whole grilled fish', '$32']]], ['Drinks', [['Mezcal margarita', '$13']]]] },
  kumo:{ rating:4.8, reviews:386, two:'$320', tags:['Japanese'], tier:['high'], why:'A 12-course tasting at an 8-seat counter. Feels like a special occasion.', slots:['6:00', '8:30'],
            menu:[['Omakase', [['12-course tasting', '$145']]], ['Add on', [['Sake pairing', '$65']]]] },
  juniper:{ rating:4.6, reviews:741, two:'$75', tags:['Small plates', 'Wine bar'], tier:['mid'], why:'Closest to home, candlelit and small. Easy to get back for the sitter.', slots:['6:15', '6:45', '7:15', '7:45', '8:00'],
            menu:[['Small plates', [['Burrata and tomatoes', '$15'], ['Cheese and charcuterie', '$24'], ['Grilled bread, olives', '$9']]], ['Wine', [['Natural orange, by the glass', '$14']]]] },
  rosie:{ rating:4.4, reviews:1987, two:'$55', tags:['BBQ'], tier:['mid', 'budget'], why:'Relaxed string-lit patio and the best brisket nearby. No dressing up.', slots:['6:30', '7:00', '7:45', '8:15'],
            menu:[['Smoked', [['Brisket, by the half pound', '$18'], ['Smoked half chicken', '$16']]], ['Sides', [['Mac and cheese', '$6']]], ['Sweet', [['Banana pudding', '$7']]]] },
};
const FOODS = ['Italian', 'Mexican', 'Japanese', 'Small plates', 'BBQ', 'Anything good'];
const googleRating = ({ rating, reviews }) => `<i class="ph-fill ph-star" aria-hidden="true"></i> ${rating.toFixed(1)} · ${reviews.toLocaleString('en-US')} Google reviews`;
function menuSheet(k){
  const pl = M.PLACES[k], x = EXTRA[k];
  bsheet({ body:`<div class="bhero" style="${M.ph(k, 2)}"></div><div class="btitle">${pl.n} · menu</div><div class="bsub"><div class="dn3sub">${googleRating(x)}</div>${M.sub1(pl)}</div>
    <div class="menu">${x.menu.map(([h, items]) => `<h5>${h}</h5>${items.map(([a, b]) => `<div class="mi"><span>${a}</span><span>${b}</span></div>`).join('')}`).join('')}</div>
    <button class="link" style="margin-top:12px" data-site>Full menu on their website <i class="ph ph-caret-right"></i></button>`,
    foot:`<button type="button" class="btn ghost" onclick="this.closest('.bsheet').classList.remove('on');document.getElementById('bscrim').classList.remove('on')">Close</button>` })
    .body.querySelector('[data-site]').onclick = () => toast('Opens the restaurant’s website (not part of this demo)');
}
/* D1 (17 Nov): food types as photo tiles, the same dish photos the places use; "Anything good" = a 4-dish mosaic */
const FOOD_PHOTO = { Italian:'olive', Mexican:'casa', Japanese:'kumo', 'Small plates':'juniper', BBQ:'rosie' };
function foodCard(p){
  return new Promise(res => {
    const tile = f => f === 'Anything good'
      ? `<button class="ftile any" data-f="${f}"><i style="${M.ph('olive', 2)}"></i><i style="${M.ph('kumo', 2)}"></i><i style="${M.ph('casa', 2)}"></i><i style="${M.ph('rosie', 2)}"></i><span>Anything good</span><b class="fck"><i class="ph-bold ph-check"></i></b></button>`
      : `<button class="ftile" data-f="${f}" style="${M.ph(FOOD_PHOTO[f], 2)}"><span>${f}</span><b class="fck"><i class="ph-bold ph-check"></i></b></button>`;
    const c = p.block(`<div class="card"><div class="ctop"><span class="icotile"><i class="ph ph-fork-knife"></i></span><div><div class="eyebrow">Pick any</div><div class="ttl">What are you in the mood for?</div></div></div>
      <div class="ftiles">${FOODS.map(tile).join('')}</div><button class="btn" style="margin-top:14px" disabled>Pick at least one</button></div>`).querySelector('.card');
    const btn = c.querySelector('.btn'), tiles = [...c.querySelectorAll('.ftile')], any = c.querySelector('.ftile.any');
    const on = () => tiles.filter(b => b.classList.contains('on')).map(b => b.dataset.f);
    tiles.forEach(b => b.onclick = () => {
      if (b === any) { const was = b.classList.contains('on'); tiles.forEach(x => x.classList.remove('on')); if (!was) b.classList.add('on'); }
      else { any.classList.remove('on'); b.classList.toggle('on'); }
      const n = on(); btn.disabled = !n.length; btn.textContent = n.length ? `Next · ${n.length === 1 ? n[0] : n.length + ' kinds'}` : 'Pick at least one'; });
    btn.onclick = () => { const n = on(); tiles.forEach(x => x.style.pointerEvents = 'none'); btn.remove(); p.me(joinNames(n)); res(n); };
    p.scroll();
  });
}
/* 19 Nov (Ahmad): date night uses the same map as the party search (street map, area label, Google Maps button).
   The made-up restaurants get coordinates from their spot on the old map (direction from home) and their distance. */
function restaurantPlace(k){
  const pl = M.PLACES[k], dx = pl.x - 44, dy = pl.y - 52, d = Math.hypot(dx, dy) || 1, [lat, lng] = PARTY_HOME.coords;
  return { key:k, name:pl.n, detail:'South Austin, TX', coords:[lat - dy / d * pl.mi / 69, lng + dx / d * pl.mi / 59.6], photo:`dn/${k}-2.jpg` };
}
function results(p, keys, others = []){
  const reasons = new Map(others.map(({ k, why }) => [k, why]));
  const ranked = keys.map(k => ({ place:restaurantPlace(k), miles:M.PLACES[k].mi }));
  /* D1c (17 Nov): photo full-bleed at the top, two plain lines on why, small Menu / Website links, one Choose */
  const cardHtml = (place, miles, first) => { const key = place.key, pl = M.PLACES[key], x = EXTRA[key]; return `<div class="card dn3" data-k="${key}">
      <div class="dn3img" style="${M.ph(key)}">${first ? '<span class="dn3pick">My pick</span>' : ''}</div>
      <div class="dn3bd"><div class="dn3top"><b>${pl.n}</b><span class="dn3price"><strong>~${x.two}</strong> for two</span></div>
        <div class="dn3sub">${googleRating(x)}</div>${reasons.has(key) ? `<div class="dn3sub">${reasons.get(key)}</div>` : ''}
        <div class="dn3sub">${pl.kind} · ${pl.mi} mi</div>
        <p class="dn3why">${x.why}</p>
        <div class="dn3cta"><button class="dn3link dn3ico" data-menu aria-label="Menu" title="Menu"><i class="ph ph-book-open-text"></i></button><button class="dn3link dn3ico" data-site aria-label="Website" title="Website"><i class="ph ph-globe-simple"></i></button><button class="btn dn3go" data-go>Choose</button></div></div></div>`; };
  const wire = (tile, place, { select, finish }) => {
    tile.querySelector('[data-menu]').onclick = () => { select(); menuSheet(place.key); };
    tile.querySelector('[data-site]').onclick = () => toast('Opens the restaurant’s website (not part of this demo)');
    tile.querySelector('[data-go]').onclick = () => finish(place);
  };
  return partyResults(p, null, PARTY_HOME, ranked, { heading:'Dinner for two', search:'restaurants', showAll:true, back:false, cardHtml, wire })
    .then(place => place.key);
}

X.flows.dateE = async (p, opt = {}) => {
  const sat = DAYS.find(d => d.w === 'Sat');
  let w0 = { day:sat, from:19 * 60, to:22 * 60 + 30 };
  if (!opt.restaurantReview) {
    await p.say(opt.fromPush ? 'Let’s plan it. You and Dana are both free Saturday after 6, so I started there. Change anything.' : 'Let’s plan it. When are you going out?', 1000);
    w0 = await whenCard(p, { mode:'dinner', preset: opt.fromPush ? { w:'Sat', from:19 * 60, to:22 * 60 + 30 } : null });
  }
  const night = w0.day; sub(p, `Date night · ${night.day}`); p.title = `Date night · ${night.day}`; p.set('Just started', { when:night.short });
  let dist = 1, food = ['Italian'], tier = 'mid', cap = null;
  if (!opt.restaurantReview) {
    await p.say('How far are you happy to go?', 600);
    dist = await p.chips(['3 miles or less', '10 miles or less', 'Doesn’t matter']);
    await p.say('What kind of food?', 500);
    food = await foodCard(p);
    await p.say('And the budget for dinner for two?', 500);
    /* F2 (17 Nov): dinner for two in Austin, before drinks and tip, instead of $ signs */
    const bi = await p.chips(['Under $60', '$60–$130', '$130 and up', 'Set my own'], { echo:false });
    let budgetLabel;
    if (bi < 3) { tier = ['budget', 'mid', 'high'][bi]; budgetLabel = ['Under $60 for two', '$60–$130 for two', '$130 and up for two'][bi]; }
    else { const v = await editFields('Your budget', [['Up to, for the two of you', '$100', 'num']]); const n = v ? parseFloat(v[0].replace(/[^\d.]/g, '')) || 100 : 100;
      tier = n < 60 ? 'budget' : n <= 130 ? 'mid' : 'high'; cap = n; budgetLabel = `Up to $${n} for two`; }
    p.me(budgetLabel);
  }
  /* match: food 3, budget 2, distance 2; show all five, best first */
  const any = food.includes('Anything good');
  const scored = Object.keys(M.PLACES).map(k => { const pl = M.PLACES[k], x = EXTRA[k];
    const f = any || x.tags.some(t => food.includes(t)), b = cap ? parseInt(String(x.two).replace(/\D/g, '')) <= cap : x.tier.includes(tier), d = dist === 2 || pl.mi <= [3, 10][dist];
    return { k, f, b, d, s:(f ? 3 : 0) + (b ? 2 : 0) + (d ? 2 : 0), all:f && b && d, mi:pl.mi }; }).sort((a, b) => b.s - a.s || a.mi - b.mi);
  const fit = scored.filter(x => x.all).length, keys = scored.map(x => x.k);
  const w = p.work('Checking places near home', `${night.day} · around ${tl(w0.from)} · table for 2`);
  if (!opt.restaurantReview) await sleep(1600);
  w.done(`${fit} fit everything`, fit < keys.length ? `Plus ${keys.length - fit} close` : 'Distance, food and budget', 'ph-fork-knife');
  await p.say(`Here ${keys.length > 1 ? 'are' : 'is'} ${keys.length}. Swipe the cards or drag the map to look around.`, 900);
  p.set('Pick a place', { when:night.short });
  const others = scored.filter(x => !x.all).map(x => ({ k:x.k, why:!x.f ? 'Not the food you picked' : !x.b ? 'Outside your budget' : 'Farther than you wanted' }));
  const k = await results(p, keys, others);
  const pl = M.PLACES[k], x = EXTRA[k];
  const ck = p.work(`Checking tables at ${pl.n}`, `${night.day} · around ${tl(w0.from)}`); await sleep(1500);
  const slots = x.slots.map(parseT).sort((a, b) => Math.abs(a - w0.from) - Math.abs(b - w0.from) || a - b).slice(0, 5);
  const exact = slots[0] === w0.from;
  ck.done(`${x.slots.length} open tables at ${pl.n}`, night.day, 'ph-calendar-check');
  await p.say(exact ? `${tl(w0.from)} is open. Here are the closest times too.` : `${tl(w0.from)} is taken. These are the closest open times, nearest first.`, 900);
  const tc = p.block(`<div class="card"><div class="ctop"><span class="uaph" style="width:44px;height:44px;border-radius:12px;background-size:cover;${M.ph(k, 2)}"></span><div><div class="eyebrow">${night.day} · table for 2</div><div class="ttl">${pl.n}</div></div></div>
    <div class="foot"><i class="ph ph-arrow-counter-clockwise"></i>Free to cancel until the evening before</div></div>`).querySelector('.card');
  const ti = await p.chips(slots.map(tl), { into:tc });
  const time = tl(slots[ti]);
  const bw = p.work(`Booking ${pl.n}`, `${night.day} · ${time} · 2 people`); await sleep(1500);
  bw.done(`Table booked · ${pl.n}`, `${night.day} · ${time} · confirmation OE-4471`, 'ph-fork-knife');
  p.set(`${pl.n} · ${time}`, { when:night.short });
  /* D3 (17 Nov): the sitter is Sprout's suggestion, not a step the parent has to do */
  const sw = { day:night, from:slots[ti] - 30, to:Math.max(w0.to, slots[ti] + 90) };   /* L7: the sitter stays until you said you'd be home */
  await p.say(`You’re booked at ${pl.n}. Want me to find a sitter while you’re out?`, 900);
  const sc = p.block(`<div class="card"><div class="ctop">${clay('person-plus')}<div><div class="eyebrow">Suggestion</div><div class="ttl">A sitter for Maya and Jake</div></div></div>
    <hr><div class="fact"><i class="ph ph-clock"></i>${range(sw.from, sw.to)}, from 30 minutes before dinner</div>
    ${MY.length ? `<div class="fact"><span class="uc-kids" style="margin:0"><span>${MY.slice(0, 3).map(x => `<i style="background-image:url(${x.photo})"></i>`).join('')}</span></span>&nbsp;Your sitters ${joinNames(MY.map(x => x.n))}</div>` : `<div class="fact"><i class="ph ph-user-plus"></i>No saved sitters yet: add one, or I’ll ask a class group</div>`}
    <div class="foot"><i class="ph ph-info"></i>I only ask. Nobody is booked until you confirm.</div></div>`).querySelector('.card');
  const want = await p.chips(['Find a sitter', 'We’re covered'], { into:sc });
  if (want === 1) {
    await p.say('Got it. Your table is on the family calendar, so Dana has it too.', 800);
    p.block(`<div class="card"><div class="cover" style="${M.ph(k, 3)}"></div><div class="ctop">${clay('calendar-check')}<div><div class="eyebrow">Date night · ${night.day}</div><div class="ttl">Your evening</div></div></div>
      <hr><div class="fact"><i class="ph ph-fork-knife"></i>${pl.n} · ${time} · table for 2</div><div class="fact"><i class="ph ph-clock"></i>${range(slots[ti], w0.to)} · home by ${tl(w0.to)}</div><div class="fact"><i class="ph ph-calendar-check"></i>On the family calendar · Dana has it too</div><div class="fact"><i class="ph ph-bell-ringing"></i>Reminder for you both at ${tl(slots[ti] - 30)}, 30 minutes before dinner</div></div>`);
    p.set(`Booked · ${pl.n} ${time}`, { when:night.short, done:false });
    const d = await p.chips(['Text Dana the plan', 'Done']);
    if (d === 0) {
      const sent = await compose({ n:'Dana', ch:'Messages', photo:A + 'dana.webp' }, w0, [], `Date night ${night.day}: ${pl.n} at ${time}. It's on our calendar.`, 'From your phone.');
      await p.say(sent ? 'Sent to Dana.' : `Okay. Dana still gets the reminder at ${ampm(slots[ti] - 30)}.`, 700);
    } else await p.say('Have a lovely night.', 700);
    if (d === 1) X.closeSheet();
    await CLOCK.book({ p, i:DAYS.indexOf(night), S:null, E:w0.to, D:slots[ti], place:pl, k, who:null, kids:[], amt:0 });
    p.set(`${pl.n} · ${night.day}`, { when:night.short, done:true }); X.renderHome();
    return;
  }
  await p.say('Who is it for?', 500);
  const kids = await kidsCard(p);
  await p.say(FAMILY.known ? 'Same address and notes as last time?' : 'Where should the sitter come? I’ll save it for next time.', 600);
  await requestCard(p, sw, kids, time);
  await chooseAndSend(p, sw, kids, { pick:{ k, place:pl, time, mins:slots[ti] } });
};

/* ======================= the other parent: share a sitter (Priya) ======================= */
X.flows.shareSitter = async p => {
  await p.say('Tony Martin, Maya’s dad, asked Miss Taylor’s class for a sitter:', 900);
  const m = p.block(`<div class="card"><div class="preview"><small>Miss Taylor’s class · Tony Martin</small><p>Hi everyone! We’re looking for a sitter for Sat, Aug 1, 6–10 PM, for Maya (7) and Jake (5). If you have one you trust, tap “Share a sitter” and add their name and number. Thank you!</p></div></div>`);
  const i = await p.chips(['Share a sitter', 'I don’t know one'], { into:m });
  if (i === 1) { await p.say('No problem. Nothing is sent to Tony.', 700); p.set('Skipped', { done:true }); return; }
  await p.say('Pick them from your contacts. Only Tony sees their numbers, and I save them to your sitters too.', 800);
  const shared = await shareSheet('Tony');
  if (!shared) { await p.say('Okay. Nothing was shared.', 600); return; }
  const names = joinNames(shared.map(s => s.n)), fresh = shared.filter(s => s.isNew);
  p.me(`Share ${names}`);
  const w = p.work('Sharing with Tony', 'Miss Taylor’s class'); await sleep(1200);
  w.done(`Shared ${names} privately with Tony`, `Only Tony sees the numbers${fresh.length ? ` · ${joinNames(fresh.map(s => s.n))} saved to your sitters` : ''}`, 'ph-hand-heart');
  p.set(`Shared ${names}`, { done:true });
  await p.say(`Thanks! Tony can ask ${shared.length > 1 ? 'them' : shared[0].n} now. I’ll let you know if they book.`, 800);
};

/* ======================= entries by route ======================= */
/* Ahmad, 22 Nov: every lock-screen push follows Figma "Push Notification" (13562:200846, 30-minutes-before set
   13670:17472): a glass card, the clover tile (or the parent's photo with a clover badge), the title with "now",
   an optional subtitle, then the body. */
function pushNote({ title, sub = '', body = '', when = 'now', photo = '', tag = 'button', attrs = '' }){
  const av = photo ? `<span class="pn-av person" style="background-image:url(${photo})"><i><img src="/assets/push-clover.png" alt=""></i></span>`
    : '<span class="pn-av"><img src="/assets/push-clover.png" alt=""></span>';
  return `<${tag} ${tag === 'button' ? 'type="button" ' : 'role="button" '}class="lnote pn" aria-label="Open the Sprout notification" ${attrs}>${av}<span class="pn-tx"><span class="pn-row"><b>${title}</b><small>${when}</small></span>${sub ? `<span class="pn-sub">${sub}</span>` : ''}${body ? `<span class="pn-body">${body}</span>` : ''}</span></${tag}>`;
}
function lockScreen({ date, time, title, body, onOpen }){
  const lock = el(`<div class="lock" role="button" aria-label="Open the Sprout notification"><div class="ldate">${date}</div><div class="ltime">${time}</div>
    ${pushNote({ title, body, tag:'div' })}<div class="lhint">Tap the notification</div></div>`);
  $('#phone').appendChild(lock);
  lock.querySelector('.lnote').onclick = () => { lock.classList.add('gone'); setTimeout(() => { lock.remove(); onOpen(); }, 380); };
}
const setTiles = () => { X.TILES.nights.splice(0, X.TILES.nights.length,
  { k:'sitterC1', t:'Book a sitter', s:'For a few hours or a night', icon:'person-plus' },
  { k:'dateE', t:'Plan a date night', s:'Dinner, then a sitter', icon:'calendar-check' }); X.renderHome(); };
setTiles();   /* F1 (17 Nov): Book a sitter + Plan a date night are the app's tiles on every route, not just the review ones */
if (route === 'date-night-v3') {
  setTiles(); const h = $('.dbhead .mid span'); if (h) h.textContent = 'Thursday, July 30';
  lockScreen({ date:'Thursday, July 30', time:'4:12', title:'Saturday night is free', body:'You and Dana are both free after 6. Want me to plan a date night?', onOpen:() => X.start('dateE', { fromPush:true }) });
}
if (route === 'happening-am' || route === 'happening-pm') {   /* Saturday Daily Brief with the booked date night */
  const pm = route === 'happening-pm';
  setTiles(); const h = $('.dbhead .mid span'); if (h) h.textContent = 'Saturday, August 1';
  const g = $('.day .hi'); if (g && pm) g.textContent = 'Evening, Tony';
  const pl = X.dnm.PLACES.olive, who = SAVED[0], w = { day:DAYS.find(d => d.w === 'Sat'), from:1125, to:1335 };
  const p = X.makePlan('dateE', { title:'Date night · Sat, Aug 1', sub:'Date night · Sat, Aug 1', icon:'calendar-check' });
  p.block(`<div class="card"><div class="cover" style="${M.ph('olive', 3)}"></div><div class="ctop">${clay('calendar-check')}<div><div class="eyebrow">Date night · ${w.day.day}</div><div class="ttl">Your evening</div></div></div>
    <div class="ua-row on" style="margin-top:12px">${face(who)}<span class="tx"><b>${who.n}</b><small>${range(w.from, w.to)} · about $88 · you pay ${who.n}</small></span><span class="ck"><i class="ph-bold ph-check"></i></span></div>
    <div class="fact" style="margin-top:10px"><i class="ph ph-fork-knife"></i>${pl.n} · 7:15 PM · table for 2</div>
    <div class="fact"><i class="ph ph-bell-ringing"></i>Reminder for you both at 6:15 PM, then the evening on your lock screens</div></div>`);
  p.set(`${pl.n} 7:15 · ${who.n} ${range(w.from, w.to)}`, { when:'Today' });
  happening({ evening:pm, onOpen:() => { X.showPlan(p); X.openSheet(); } });
  setTimeout(() => { const b = $('#brief'), hp = $('.hpx'); if (b && hp) b.scrollTo({ top: hp.offsetTop - 70, behavior:'smooth' }); }, 900);
}
if (route === 'pay-todo') {   /* review shortcut: Alex just finished, Saturday 10:15 PM (L3: pay + rate that night) */
  setTiles(); const h = $('.dbhead .mid span'); if (h) h.textContent = 'Saturday, August 1';
  installTodo();
  const p = X.makePlan('sitterC1', { title:'Sitter · Sat, Aug 1', sub:'Sitter · Sat, Aug 1', icon:'person-plus' });
  const who = SAVED[0], w = { day:DAYS.find(d => d.w === 'Sat'), from:1125, to:1335 };
  p.block(`<div class="card"><div class="ctop">${clay('calendar-check')}<div><div class="eyebrow">Sitter · ${w.day.day}</div><div class="ttl">${who.n} is booked</div></div></div>
    <div class="ua-row on" style="margin-top:12px">${face(who)}<span class="tx"><b>${who.n}</b><small>${range(w.from, w.to)} · about $${Math.round(who.rate * 3.5)} · pay in Sprout after</small></span><span class="ck"><i class="ph-bold ph-check"></i></span></div></div>`);
  p.set(`${who.n} · ${range(w.from, w.to)}`, { when:'Sat' });
  /* opens on the lock screen at 10:15 PM: the Live Activity's last state, Pay Alex + Text Alex */
  setTimeout(() => {
    const r = { p, who, S:w.from, E:w.to, kids:KIDS, amt:Math.round(who.rate * 3.5), i:DAYS.indexOf(w.day) };
    famLock({ i:r.i, m:w.to, la:laHtml(r, w.to), notes:[{ title:`${who.n} is done`, body:`Pay ${who.n} $${r.amt} and say how it went. It’s on your to-dos too.`, open:openPlan(p) }], onPay:openPlan(p) });
    payTonight(p, who, w, KIDS, 3.5, { clock:true });
  }, 600);
}
if (route === 'sitter-v3-share' || route === 'sitter-v3-share-saved') {
  const g = $('.day .hi'); if (g) g.textContent = 'Afternoon, Priya';
  const fam = $('#sheet .fam'); if (fam) fam.innerHTML = `<i style="background-image:url(${A}priya.webp)"></i>`;
  lockScreen({ date:'Tuesday, July 28', time:'12:40', title:'Tony is looking for a sitter', body:'Maya’s dad asked Miss Taylor’s class. Know someone you trust?', onOpen:() => X.start('shareSitter') });
}
/* ======================= J4 · Class chat, Priya’s phone ======================= */
/* Ahmad, 25 Nov (/other-side/ row 6): two parents per class. [0] has the class chat open in Sprout (?as=app),
   [1] is on the lock screen and gets the push (?as=push). Made-up families; Marcus has no photo, so a monogram. */
const CLASS_PARENTS = {
  maya:[{ n:'Priya', kid:'Leo', rel:'Leo’s mom', pimg:'priya.webp', cls:'Miss Taylor Class' }, { n:'Aisha', kid:'Ava', rel:'Ava’s mom', pimg:'aisha.webp', cls:'Miss Taylor Class' }],
  jake:[{ n:'Elena', kid:'Noah', rel:'Noah’s mom', pimg:'elena.webp', cls:'Miss Poole Class' }, { n:'Marcus', kid:'Owen', rel:'Owen’s dad', pimg:'', cls:'Miss Poole Class' }],
};
function classChat(label){
  const screen = el(`<section class="jc-screen" aria-label="${label}">
    <div class="jc-head" role="img" aria-label="Miss Taylor Class chat header"></div>
    <div class="jc-log" role="log"></div>
    <div class="jc-composer" role="img" aria-label="Message composer"></div></section>`);
  $('#phone').append(screen);
  return screen;
}
function classMessage(who, text, own = false){
  const msg = el(`<div class="jc-msg${own ? ' own' : ''}">
    ${own ? '' : face(who, 40)}<div class="jc-content">${own ? '' : `<small>${who.n}</small>`}
    <p class="jc-bubble"></p></div></div>`);
  msg.querySelector('.jc-bubble').textContent = text;
  return msg;
}
/* L4 (Tony, 19 Nov): "it's only letting me share one sitter." Priya picks several, adds a note to each; only Tony
   sees numbers, never the chat.
   A2 (Tony, 25 Nov): "no one's gonna have them. Let's just do it with shared contacts and then add in the sitter."
   The sheet starts at Choose from contacts (multi-pick, then Add; Add another for more). Saved sitters are not the
   start: if the parent has any, they sit below as "Your sitters", unticked. Everyone shared is saved to hers too.
   Priya has none saved by default; /sitter-v3-share-saved/ is the review state where she has two. */
const PRIYA_SITTERS = route === 'sitter-v3-share-saved' ? [
  { ...CLASS_SITTERS[0], by:'Saved by you', times:'Sits for you most Fridays', note:'Sits for us most Fridays. Great with little ones.' },
  { n:'Jamie', ch:'Messages', phone:'(512) 555-0185', rate:23, by:'Saved by Raj', times:'Sat for you twice', photo:AV('m'), note:'' },
] : [];
function shareSheet(to = 'Tony'){
  return new Promise(res => {
    const list = PRIYA_SITTERS.map(s => ({ ...s, on:false, saved:true }));
    const v = bsheet({ onBack:() => res(null), body:`<div class="bh"><span class="icotile"><i class="ph ph-hand-heart"></i></span><b>Share sitters with ${to}</b></div>
      <p class="bp">Pick them from your contacts. Add a note so ${to} knows why you trust them.</p>
      <div data-list></div>
      <button type="button" class="ct-pick" data-contacts><i class="ph ph-address-book"></i><span><b data-pick-t>Choose from contacts</b><small>Pick as many as you like</small></span><i class="ph ph-caret-right"></i></button>
      <button type="button" class="textbtn" data-add style="margin-top:6px;width:auto;padding:4px 0;color:var(--brand)"><i class="ph ph-keyboard"></i> Not in your contacts? Type it in</button>
      <div data-form hidden><div class="dlabel" style="margin-top:14px">New sitter</div><div data-f></div><button type="button" class="btn ghost" data-save style="margin-top:10px">Add to the list</button></div>
      <div data-mine></div>
      <p class="hint2">Only ${to} sees the numbers. Nothing is posted in the class chat. Everyone you share is saved to your sitters too.</p>`,
      foot:`<button type="button" class="btn" data-go></button>` });
    const host = v.body.querySelector('[data-list]'), mine = v.body.querySelector('[data-mine]'), go = v.foot.querySelector('[data-go]'), formBox = v.body.querySelector('[data-form]'), addBtn = v.body.querySelector('[data-add]');
    let form = null;
    const row = (s, i) => `<div class="shr${s.on ? ' on' : ''}"><button type="button" class="sl-row${s.on ? ' on' : ''}" data-i="${i}" aria-pressed="${s.on}">${face(s, 36)}
          <span class="sl-tx"><span class="sl-n">${s.n}</span><small>${s.saved ? s.times + ' · ' + s.phone : s.phone + ' · ' + (s.typed ? 'typed in' : 'from your contacts')}</small></span><span class="ck"><i class="ph-bold ph-check"></i></span></button>
        ${s.on ? `<label class="field in shr-note"><div style="width:100%"><div class="l">Note for ${to} (optional)</div><input data-note="${i}" value="${playdateEscape(s.note || '')}" placeholder="How you know ${s.n}" autocomplete="off"></div></label>` : ''}</div>`;
    const paint = () => {
      const added = list.map((s, i) => [s, i]).filter(([s]) => !s.saved), saved = list.map((s, i) => [s, i]).filter(([s]) => s.saved);
      host.innerHTML = added.length ? `<div class="sl" style="margin-bottom:10px">${added.map(([s, i]) => row(s, i)).join('')}</div>` : '';
      mine.innerHTML = saved.length ? `<div class="dlabel shr-sec">Your sitters</div><div class="sl">${saved.map(([s, i]) => row(s, i)).join('')}</div>` : '';
      v.body.querySelector('[data-pick-t]').textContent = added.length ? 'Add another from contacts' : 'Choose from contacts';
      v.body.querySelectorAll('[data-i]').forEach(b => b.onclick = () => { const s = list[+b.dataset.i]; s.on = !s.on; paint(); });
      v.body.querySelectorAll('[data-note]').forEach(x => x.oninput = () => { list[+x.dataset.note].note = x.value; });
      const n = list.filter(s => s.on).length;
      go.disabled = !n; go.textContent = n ? `Share ${n === 1 ? list.find(s => s.on).n : n + ' sitters'} with ${to}` : 'Choose someone to share';
    };
    const addOne = (s, extra = {}) => {
      const known = list.find(x => x.phone === s.phone);
      if (known) { known.on = true; return; }
      list.push({ n:s.full.split(' ')[0], full:s.full, phone:s.phone, rate:s.rate || null, photo:s.photo, ch:'Messages', isNew:true, on:true, note:'', ...extra });
    };
    v.body.querySelector('[data-contacts]').onclick = async () => {
      const picked = await pickContact({ multi:true, taken:list.filter(s => !s.saved).map(s => s.phone) });
      if (!picked || !picked.length) return;
      picked.forEach(c => addOne(c)); paint();
      toast(picked.length === 1 ? `${picked[0].full.split(' ')[0]} added` : `${picked.length} sitters added`);
    };
    addBtn.onclick = () => {
      formBox.hidden = false; addBtn.hidden = true;
      form = sitterFields(); const f = formBox.querySelector('[data-f]'); f.innerHTML = ''; f.append(form.fields);
      form.fields.querySelector('input').focus();
    };
    formBox.querySelector('[data-save]').onclick = () => {
      const s = form.read();
      if (!s.full || !s.phone) return toast('Add a name and a phone number');
      addOne(s, { typed:true });
      formBox.hidden = true; addBtn.hidden = false; paint();
    };
    go.onclick = () => {
      const picked = list.filter(s => s.on); if (!picked.length) return; v.close();
      picked.filter(s => s.isNew).forEach(s => { if (!PRIYA_SITTERS.some(x => x.phone === s.phone)) PRIYA_SITTERS.push({ ...s, on:false, isNew:false, by:'Saved by you', times:`Shared with ${to}` }); });
      res(picked);
    };
    paint();
  });
}
function shareClassSitter(chip){
  shareSheet('Tony').then(picked => {
    if (!picked) return;
    const names = joinNames(picked.map(s => s.n)), fresh = picked.filter(s => s.isNew);
    const confirmation = el('<p class="jc-shared" role="status"></p>');
    confirmation.textContent = `You shared ${names} privately with Tony${fresh.length ? `. ${joinNames(fresh.map(s => s.n))} saved to your sitters` : ''}`;
    chip.replaceWith(confirmation); toast(`Shared ${picked.length === 1 ? names : picked.length + ' sitters'} with Tony`);
  });
}

if (route === 'sitter-class-chat' && link) classChatLinked();
if (route === 'sitter-class-chat' && !link) {
  const screen = classChat('Priya’s class chat');
  const log = screen.querySelector('.jc-log');
  const tony = classMessage({ n:'Tony', photo:A + 'tony.webp' }, 'Hi everyone! We’re looking for a sitter for Sat, Aug 1, 6–10 PM, for Maya (7) and Jake (5). If you have one you trust, tap “Share a sitter” and add their name and number. Thank you!');
  const action = el('<div class="jc-action"><button type="button" class="chip">Share a sitter</button></div>');
  const share = action.firstElementChild; share.onclick = () => shareClassSitter(share);
  log.append(classMessage({ n:'Aisha', photo:A + 'aisha.webp' }, 'Are the kids bringing water bottles on Friday?'),
    classMessage({ n:'Priya' }, 'Yes, we’re packing one.', true), tony, action);
}
/* Ahmad, 24 Nov (/other-side/ row 6): a class parent's phone, linked to Tony's. What they share goes to Tony's phone
   only. If Tony cancels or finds someone first, the button closes; when Tony books, they hear back (thanked by name if
   it was one they shared).
   Ahmad, 25 Nov: two of these phones on the row. ?as=app is a parent already in the class chat: Tony's post appears
   live under the last message. ?as=push is a parent not in the app: the lock screen gets the Sprout push ("Tony is
   looking for a sitter"), and tapping it opens the chat at Tony's message. Both get Share a sitter. */
function classChatLinked(){
  const AS = new URLSearchParams(location.search).get('as') === 'push' ? 1 : 0;
  let ask = null, me = CLASS_PARENTS.maya[AS], screen = null, action = null, shared = [], pending = null, lock = null;
  const other = () => (ask ? ask.cps : CLASS_PARENTS.maya)[1 - AS];
  const status = (icon, text) => { const n = el(`<p class="jc-shared jc-sys" role="status"><i class="ph ${icon}"></i><span></span></p>`); n.querySelector('span').textContent = text; return n; };
  const after = node => { const log = screen.querySelector('.jc-log'); log.append(node); log.scrollTop = log.scrollHeight; };
  const buildChat = () => {
    screen?.remove();
    screen = classChat(`${me.n}’s class chat`);
    if (me.cls !== 'Miss Taylor Class') screen.querySelector('.jc-head').insertAdjacentHTML('beforeend', `<span class="jc-title">${me.cls}</span>`);
    const o = other(), log = screen.querySelector('.jc-log');
    log.append(classMessage({ n:o.n, photo:o.pimg ? A + o.pimg : '' }, 'Are the kids bringing water bottles on Friday?'), classMessage({ n:me.n }, 'Yes, we’re packing one.', true));
    log.scrollTop = log.scrollHeight;
  };
  const post = () => {   /* Tony's exact message, with Share a sitter under it */
    action = el('<div class="jc-action"><button type="button" class="chip">Share a sitter</button></div>');
    const btn = action.firstElementChild;
    btn.onclick = () => shareSheet('Tony').then(picked => {
      if (!picked || !btn.isConnected) return;
      shared = picked.map(x => x.n);
      const names = joinNames(shared), fresh = picked.filter(x => x.isNew);
      action.replaceChildren(status('ph-hand-heart', `You shared ${names} privately with Tony${fresh.length ? `. ${joinNames(fresh.map(x => x.n))} saved to your sitters` : ''}`));
      toast(`Shared ${picked.length === 1 ? names : picked.length + ' sitters'} with Tony`);
      link.send({ t:'shared', by:{ n:me.n, kid:me.kid, rel:me.rel, pimg:me.pimg }, sitters:picked.map(x => ({ n:x.n, phone:x.phone, rate:x.rate || 25, note:x.note || '', photo:x.photo, isNew:!!x.isNew })) });
    });
    const msg = classMessage({ n:'Tony', photo:A + 'tony.webp' }, ask.text);
    after(msg); after(action);
    if (pending) { const m = pending; pending = null; handle(m); }
  };
  const handle = m => {
    if (!action) { pending = m; return; }
    if (m.t === 'closed' && !shared.length) action.replaceChildren(status('ph-x-circle', m.why === 'cancel' ? 'Tony closed this request' : 'Tony found a sitter, so this request is closed'));
    if (m.t === 'booked') {
      const mine = shared.includes(m.n);
      after(status('ph-calendar-check', mine ? `Tony booked ${m.n}, the sitter you shared, for ${m.when}. Thanks for helping!` : `Tony found a sitter for ${m.when}`));
      if (mine) toast(`Tony booked ${m.n}`);
    }
  };
  if (AS === 0) buildChat();
  else { lock = el(`<div class="lock" aria-label="Lock screen"><div class="ldate">Monday, July 27</div><div class="ltime">9:41</div></div>`); $('#phone').appendChild(lock); }
  link.on(m => {
    if (m.t === 'ask' && m.kind === 'class' && !ask) {
      ask = m; me = m.cps[AS];
      if (AS === 0) { buildChat(); post(); return; }   // already in the chat: the post just arrives
      lock.querySelector('.ltime').textContent = '9:42';
      lock.insertAdjacentHTML('beforeend', pushNote({ title:'Tony is looking for a sitter', body:`${m.kid}’s dad asked ${m.where}. Know someone you trust?`, photo:A + 'tony.webp', tag:'div' }) + '<div class="lhint">Tap the notification</div>');
      lock.querySelector('.lnote').onclick = () => { lock.classList.add('gone'); setTimeout(() => { lock.remove(); buildChat(); post(); }, 380); };
    }
    if (m.t === 'closed' || m.t === 'booked') handle(m);
  });
  link.send({ t:'hello' });
}
/* ======================= J6 · Playdate ======================= */
const PLAYDATE_FAMILIES = {
  /* L5 (Tony, 19 Nov): we rarely have the kid's photo, and you message the parent anyway: parent first, kid as the line under */
  Maya:[
    { kid:'Lily', n:'Ana and Ben Ortiz', ask:'Ana and Ben', reply:'Ana', rel:'Lily’s parents' },
    { kid:'Leo', n:'Priya Shah', ask:'Priya', reply:'Priya', rel:'Leo’s mom', photo:A + 'priya.webp' },
    { kid:'Ava', n:'Aisha Khan', ask:'Aisha', reply:'Aisha', rel:'Ava’s mom', photo:A + 'aisha.webp' },
  ],
  Jake:[{ kid:'Noah', n:'Elena Ruiz', ask:'Elena', reply:'Elena', rel:'Noah’s mom', photo:A + 'elena.webp' }],
};
/* N4 (Tony, 20 Nov): "there's not gonna be just one... it's gonna be, like, 20 people". The class list is the real
   size: parent tiles two per row, a search when the list is long, the first eight shown then Show all.
   Names are made up (CLAUDE.md: never a real roster); only Priya, Aisha, Elena and Dana have photos. */
const rosterRow = ([kid, n, rel, photo]) => ({ kid, n, ask:n.split(' ')[0], reply:n.split(' ')[0], rel:`${kid}’s ${rel}`, ...(photo ? { photo:A + photo } : {}) });
PLAYDATE_FAMILIES.Maya.push(...[
  ['Emma', 'Jess Carter', 'mom'], ['Mateo', 'Luis Garcia', 'dad'], ['Harper', 'Megan Brooks', 'mom'], ['Ethan', 'David Park', 'dad'],
  ['Mia', 'Sarah Nguyen', 'mom'], ['Lucas', 'Chris Walker', 'dad'], ['Chloe', 'Amanda Reed', 'mom'], ['Owen', 'Marcus Lee', 'dad'],
  ['Isla', 'Hannah Price', 'mom'], ['Caleb', 'Jon Rivera', 'dad'], ['Nora', 'Kate Sullivan', 'mom'], ['Eli', 'Ryan Foster', 'dad'],
  ['Grace', 'Lauren Hayes', 'mom'], ['Henry', 'Mike Turner', 'dad'], ['Ruby', 'Olivia Bennett', 'mom'], ['Theo', 'Sam Patel', 'dad'],
  ['Zoe', 'Rachel Kim', 'mom'],
].map(rosterRow));
PLAYDATE_FAMILIES.Jake.push(...[
  ['Liam', 'Tara Wells', 'mom'], ['Max', 'Ben Cole', 'dad'], ['Lila', 'Nina Ortega', 'mom'], ['Finn', 'Greg Adams', 'dad'],
  ['June', 'Becca Moore', 'mom'], ['Arlo', 'Kevin Ross', 'dad'], ['Sadie', 'Erin Lopez', 'mom'], ['Milo', 'Dan Hughes', 'dad'],
  ['Ivy', 'Claire Bishop', 'mom'], ['Jack', 'Paul Young', 'dad'], ['Rosa', 'Maria Diaz', 'mom'], ['Wes', 'Tom Grant', 'dad'],
  ['Hazel', 'Amy Ford', 'mom'],
].map(rosterRow));
function parentGrid(families, { multi = false, on = [], show = 8, extra, onChange = () => {} } = {}){
  const sel = new Set(on), long = families.length > show;
  const wrap = el(`<div class="pg-wrap">
    ${long ? `<label class="pg-search"><i class="ph ph-magnifying-glass" aria-hidden="true"></i><input type="search" placeholder="Search ${families.length} parents or kids" aria-label="Search parents or kids" autocomplete="off"></label>` : ''}
    <div class="pg" role="${multi ? 'group' : 'radiogroup'}"></div>
    <p class="pg-none" hidden>Nobody by that name in this class</p>
    ${long ? `<button type="button" class="pg-more">Show all ${families.length}</button>` : ''}</div>`);
  const grid = wrap.querySelector('.pg'), more = wrap.querySelector('.pg-more'), input = wrap.querySelector('input');
  let all = false, q = '';
  const tile = (f, i) => `<button type="button" class="pg-t${sel.has(i) ? ' on' : ''}" data-i="${i}" ${multi ? 'aria-pressed' : 'role="radio" aria-checked'}="${sel.has(i)}">${face(f, 34)}<span class="pg-tx"><b>${f.n}</b><small>${f.rel}</small>${extra ? `<small>${extra(f)}</small>` : ''}</span><span class="ck"><i class="ph-bold ph-check"></i></span></button>`;
  const paint = () => {
    const match = families.map((f, i) => [f, i]).filter(([f]) => !q || `${f.n} ${f.kid}`.toLowerCase().includes(q));
    const list = q || all ? match : match.filter(([, i]) => i < show || sel.has(i));
    grid.innerHTML = list.map(([f, i]) => tile(f, i)).join('');
    grid.querySelectorAll('.pg-t').forEach(b => b.onclick = () => {
      const i = +b.dataset.i;
      if (multi) { if (sel.has(i)) sel.delete(i); else sel.add(i); } else { sel.clear(); sel.add(i); }
      paint(); onChange();
    });
    /* Ahmad, 22 Nov: once the whole class shows, the same button says Show less (it said Show all 20 again) */
    if (more) { more.hidden = !!q; more.textContent = all ? 'Show less' : `Show all ${families.length}`; }
    wrap.querySelector('.pg-none').hidden = list.length > 0;
  };
  if (more) more.onclick = () => { all = !all; paint(); if (!all) wrap.scrollIntoView({ block:'nearest', behavior:'smooth' }); };
  if (input) input.oninput = () => { q = input.value.trim().toLowerCase(); paint(); };
  paint();
  return { el:wrap, picked:() => [...sel].sort((a, b) => a - b).map(i => families[i]), lock(){ wrap.querySelectorAll('button,input').forEach(b => b.disabled = true); if (more) more.remove(); if (input) wrap.querySelector('.pg-search').remove(); grid.querySelectorAll('.pg-t:not(.on)').forEach(b => b.remove()); } };
}
const playdateEscape = text => text.replace(/[&<>"]/g, ch => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[ch]));
const playdateWhen = w => `${w.day.day} · ${range(w.from, w.to)}`;
const playdateInvite = (w, kidNames, family, place, pickup) => `Hi ${family.ask}! Would ${family.kid} like to play with ${kidNames} on ${w.day.day}, ${range(w.from, w.to)}? We can meet at ${place}.${pickup ? ` We’re happy to do pickup and drop-off for ${family.kid}.` : ''} Let us know what works!`;
function playdateTime(p, { w, addFields, canContinue, title = 'Plan a playdate' } = {}){
  return whenCard({ ...p, block:html => {
    const host = p.block(html), card = host.querySelector('.card');
    card.querySelector('.eyebrow').textContent = 'Playdate';
    card.querySelector('.ttl').textContent = title;
    if (addFields) addFields(card.querySelector('.btn'));
    return host;
  } }, { mode:'playdate', preset:w ? { w:w.day.w, from:w.from, to:w.to } : { w:'Sat', from:840, to:960 }, canContinue });
}
/* Ahmad, 22 Nov: "if i chose somewhere else instead of our place... give em recommendation for the near place or
   best place... so the user just need to few tap". A park / Lunch spot / Somewhere else open nearby places on the same
   map and photo cards as birthday venues: closest first, why it suits a playdate (and which classmates go), one-tap
   Choose. Typing an address stays, last. Real Austin places reuse the venue photos; Casa Verde and Rosie's are samples. */
const PLAYDATE_PLACES = [
  /* closest parks to Banks Court; photos are AI stand-ins (assets/playdate/), not the real parks */
  { key:'mary-moore', name:'Mary Moore Searight Park', detail:'907 W Slaughter Ln, Austin', coords:[30.1676,-97.7957], types:[1], kind:'Park', photo:'playdate/mary-moore.webp',
    facilities:'Aisha and Ava go after school. Playground under big oaks, shady trails and open lawns. Free.',
    food:'Bring a picnic. Tables by the playground.', website:'https://www.austintexas.gov/department/parks-and-recreation' },
  { key:'dick-nichols', name:'Dick Nichols District Park', detail:'8011 Beckett Rd, Austin', coords:[30.2063,-97.8545], types:[1], kind:'Park',  photo:'playdate/dick-nichols.webp',
    facilities:'Closest to home. Shaded playground, picnic tables and lots of room to run. Free.',
    food:'Bring a picnic.', website:'https://www.austintexas.gov/department/parks-and-recreation' },
  { key:'zilker-park', name:'Zilker Park', detail:'2100 Barton Springs Rd, Austin', coords:[30.26768,-97.76661], types:[1], kind:'Park',
    facilities:'Priya and Leo go most weekends. Big playground, open lawns and shade by the creek. Free.',
    food:'Bring a picnic. Food trucks park along Barton Springs Rd.', website:'https://www.austintexas.gov/parks/locations/zilker-metropolitan-park' },
  { key:'austin-zoo', name:'Austin Zoo', detail:'10808 Rawhide Trail, Austin', coords:[30.25782,-97.93688], types:[1], kind:'Zoo and picnic area',
    facilities:'Small, walkable zoo with picnic tables. Good for an hour or two. Tickets at the gate.',
    food:'Bring your own snacks.', website:'https://austinzoo.org/' },
  { key:'rosies', name:'Rosie’s', detail:'Sample place · South Austin', coords:[30.1992,-97.8611], types:[2], photo:'dn/rosie-1.jpg', kind:'Lunch spot',
    facilities:'Aisha’s family goes. Shaded patio with lawn games, so kids play while you eat.', food:'Smokehouse plates and kids meals.' },
  { key:'casa-verde', name:'Casa Verde', detail:'Sample place · South Austin', coords:[30.2135,-97.8292], types:[2], photo:'dn/casa-1.jpg', kind:'Lunch spot',
    facilities:'Kids plates and a small play corner on the garden patio.', food:'Tacos, quesadillas and kids plates.' },
  { key:'chuck-e-cheese', name:'Chuck E. Cheese', detail:'9811 S I-35, Austin', coords:[30.16267,-97.78759], types:[2], kind:'Lunch and games',
    facilities:'Pizza and arcade games. Busy on weekend afternoons.', food:'Pizza, wings and salad bar.', website:'https://www.chuckecheese.com/austin-south/' },
  { key:'thinkery', name:'Thinkery', detail:'1830 Simond Ave, Austin', coords:[30.29777,-97.70554], types:[0], kind:'Kids museum',
    facilities:'Elena and Noah went last month. Hands-on science play, indoors and out. Book tickets ahead on weekends.',
    food:'A café on site, or bring snacks.', website:'https://thinkeryaustin.org/' },
  { key:'westgate', name:'Bouldering Project · Westgate', detail:'4477 S Lamar Blvd, Austin', coords:[30.231,-97.796], types:[0], kind:'Climbing gym',
    facilities:'Low kids’ walls with staff nearby. Each kid needs a signed waiver.', food:'No food. Cafés nearby on S Lamar.', website:'https://boulderingproject.com/' },
  { key:'little-gym', name:'The Little Gym', detail:'2716 W William Cannon Dr, Austin', coords:[30.20745,-97.81564], types:[0], kind:'Indoor play',
    facilities:'Indoor gym for little kids. Check the open-play times first.', food:'No food on site.', website:'https://www.thelittlegym.com/texas-austin-south/' },
];
function playdatePlace(i, currentKey){
  const kind = [null, { styleIndex:1, heading:'Parks', search:'parks and playgrounds for kids' }, { styleIndex:2, heading:'Lunch spots', search:'kid friendly restaurants' }, { styleIndex:0, heading:'Places for kids', search:'things to do with kids' }][i];
  return new Promise(resolve => {
    const sheet = X.overlay({ title:`${kind.heading} near you`, sub:'Closest first', body:`<div data-results></div>
      <button type="button" class="textbtn" data-type style="display:flex;align-items:center;gap:6px;margin:14px auto 4px;color:var(--brand)"><i class="ph ph-pencil-simple"></i>Type a place or address</button>` });
    let open = true;
    const finish = v => { if (!open) return; open = false; sheet.close(); resolve(v); };
    sheet.o.querySelector('.wclose').onclick = () => finish(null);
    const ranked = partyRanked(PARTY_HOME, kind.styleIndex, PLAYDATE_PLACES).filter(v => v.matches);
    const results = sheet.body.querySelector('[data-results]');
    const panel = { block:html => { results.innerHTML = html; return results; }, me(){}, scroll(){} };
    partyResults(panel, null, PARTY_HOME, ranked, { heading:kind.heading, search:kind.search, styleIndex:kind.styleIndex, currentKey, back:false })
      .then(place => finish(place ? { key:place.key, short:place.name, full:place.detail.startsWith('Sample') ? place.name : `${place.name}, ${place.detail}` } : null));
    sheet.body.querySelector('[data-type]').onclick = async () => {
      const t = await editText('Place name or address', '', { rows:2 });
      if (t) finish({ key:null, short:t, full:t });
    };
  });
}
function suggestPlaydateTime(w){
  return new Promise(resolve => {
    const v = bsheet({ onBack:() => resolve(null), body:'', foot:'<button type="button" class="btn">Save</button>' });
    const sp = { block:html => { v.body.innerHTML = `<div class="insheet">${html}</div>`; return v.body; }, me(){}, scroll(){} };
    const choice = playdateTime(sp, { w, title:'Suggest another time' });
    const next = v.body.querySelector('.card > .btn');
    next.style.display = 'none';
    v.foot.firstElementChild.onclick = () => next.click();
    choice.then(slot => { v.close(); resolve(slot); });
  });
}
function classmatesCard(p, kids, { withoutLily = false, without = [], multiple = false } = {}){
  /* N4: the whole class as parent tiles, two per row, with search. P1 (20 Nov US): a playdate can be for both kids, so
     both classes are listed; each tile then says whose class it's from. Own kids are never labelled by class. */
  return new Promise(resolve => {
    const both = kids.length > 1;
    const families = kids.flatMap(k => PLAYDATE_FAMILIES[k.n].map(f => ({ ...f, of:`${k.n}’s class` }))).filter(f => (!withoutLily || f.kid !== 'Lily') && !without.includes(f.kid));
    const card = p.block(`<div class="card"><div class="ctop">${clay('two-people')}<div><div class="eyebrow">Kids in ${joinNames(kids.map(k => k.n + '’s'))} class${both ? 'es' : ''}</div><div class="ttl">${multiple ? 'Who should I invite?' : 'Which parent should I message?'}</div></div></div>
      <div data-pg></div><button type="button" class="btn" style="margin-top:14px" disabled>${multiple ? 'Pick classmates' : 'Pick a parent'}</button></div>`).querySelector('.card');
    const ask = card.querySelector('.btn');
    const grid = parentGrid(families, { multi:multiple, extra:both ? f => f.of : null, onChange:() => {
      const picks = grid.picked();
      ask.disabled = !picks.length;
      ask.textContent = !picks.length ? (multiple ? 'Pick classmates' : 'Pick a parent') : multiple ? `Next · ${picks.length} classmate${picks.length === 1 ? '' : 's'}` : `Message ${picks[0].ask}`;
    } });
    card.querySelector('[data-pg]').append(grid.el);
    ask.onclick = () => { if (ask.disabled) return; const picks = grid.picked(); grid.lock(); p.me(ask.textContent); ask.remove(); resolve(multiple ? picks : picks[0]); };
    p.scroll();
  });
}
/* P2 (Tony, 20 Nov US): "This type of UI, if it lives here, it should live there, but... it doesn't have the options to
   click when I'm the one that made the request." The organizer's chat shows the SAME invite card the other parent gets
   (playdateInbox), with a status line instead of buttons: Waiting on Ana → Ana confirmed · on your calendar. Her own
   words, if she writes any, show under it; Sprout never writes a template reply for her.
   Sending is one step: "We could easily just say we messaged them this" (no Send / Edit gate). */
function playdateWidget(p, { w, kidNames, family, place, pickup }){
  const host = p.block(`<div class="card pd-w">
      <div class="pd-sent"><small>${face(TONY, 18)}You to ${family.n} · in Sprout</small><p data-msg></p></div>
      <div class="ctop">${clay('calendar-check')}<div><div class="eyebrow">Playdate</div><div class="ttl">${joinNames([...kidNames.split(/, | and /), family.kid])}</div></div></div>
      <div class="fact" data-when></div>
      <div class="fact"><i class="ph ph-map-pin"></i>${playdateEscape(place)}</div>
      ${pickup ? `<div class="fact"><i class="ph ph-car-profile"></i>You do pickup and drop-off for ${family.kid}</div>` : ''}
      <div data-state></div></div>`);
  const card = host.querySelector('.card'), state = card.querySelector('[data-state]'), when = card.querySelector('[data-when]');
  const api = {
    card,
    message(text){ card.querySelector('[data-msg]').textContent = text; },
    time(now, was){ when.innerHTML = `<i class="ph ph-clock"></i><span>${was ? `<s>${playdateWhen(was)}</s><br>` : ''}${playdateWhen(now)}</span>`; },
    wait(){ state.className = 'pd-state wait'; state.innerHTML = `<span class="spinner"></span>Waiting on ${family.ask}`; },
    proposed(by){ state.className = 'pd-state ask'; state.innerHTML = `<i class="ph ph-clock-clockwise"></i>${by} suggested a new time`; },
    confirmed(text){ state.className = 'foot ok'; state.innerHTML = `<i class="ph ph-check-circle"></i>${text}`; },
    declined(){ state.className = 'foot'; state.innerHTML = `<i class="ph ph-x-circle"></i>${family.ask} can’t make it this time`; },
  };
  api.message(playdateInvite(w, kidNames, family, place, pickup));
  api.time(w);
  api.wait();
  p.scroll();
  return api;
}
/* the other parent's own words in the chat (in-app message, not SMS) */
const playdateReply = (p, family, text) => p.block(`<div class="preview gtx sms-in"><small>${face({ n:family.reply, photo:family.photo }, 18)}${family.n} · in Sprout</small><p></p></div>`).querySelector('p').textContent = text;
/* L5 (Tony, 19 Nov): the DM with the other parent, opened straight from the confirmed playdate.
   "At this point I kinda just DM'd her... I might wanna just get straight into the DM." Reply = keyboard open. */
const PD_HEARD = new Map();   // linked: what the other parent typed, so the DM shows it too
function playdateDM(family, w, kidNames, place, pickup, { confirmed = true } = {}){
  return new Promise(done => {
    const who = { n:family.reply, photo:family.photo };
    const screen = el(`<section class="jc-screen dm" aria-label="Messages with ${family.reply}">
      <div class="dm-head"><button type="button" class="dm-back" aria-label="Back"><i class="ph ph-caret-left"></i></button>${face(who, 36)}
        <div class="dm-who"><b>${family.n}</b><small>${family.rel}</small></div></div>
      <div class="jc-log" role="log"></div>
      <form class="dm-comp"><input aria-label="Message ${family.reply}" placeholder="Message ${family.reply}" autocomplete="off"><button type="submit" aria-label="Send"><i class="ph-fill ph-paper-plane-tilt"></i></button></form></section>`);
    $('#phone').append(screen);
    const log = screen.querySelector('.jc-log'), input = screen.querySelector('input');
    log.append(classMessage({ n:'Tony' }, playdateInvite(w, kidNames, family, place, pickup), true));
    if (confirmed) {
      log.append(el(`<div class="dm-sys"><i class="ph ph-calendar-check"></i>${family.reply} confirmed · ${playdateWhen(w)}</div>`));
      if (!link) log.append(classMessage(who, `Yes! ${family.kid} is so excited. See you ${w.day.long.split(',')[0]}!`));
    }
    (PD_HEARD.get(family) || []).forEach(t => log.append(classMessage(who, t)));
    const off = link ? link.on(m => { if (m.t === 'text') { log.append(classMessage(who, m.text)); log.scrollTop = log.scrollHeight; } }) : null;
    screen.querySelector('form').onsubmit = e => { e.preventDefault(); const t = input.value.trim(); if (!t) return; log.append(classMessage({ n:'Tony' }, t, true)); input.value = ''; log.scrollTop = log.scrollHeight; link?.send({ t:'tony-text', text:t }); };
    screen.querySelector('.dm-back').onclick = () => { off?.(); screen.classList.add('gone'); setTimeout(() => { screen.remove(); done(); }, 250); };
    setTimeout(() => input.focus(), 300);
  });
}
/* Ahmad, 22 Nov (?link=): Tony's side of a linked playdate. Sends the invite to the other phone, then waits for what she
   actually taps. Returns 'confirmed', 'accepted' (Tony took her time) or 'cant'. */
async function playdateLinked(p, { w, kids, kidNames, family, place, pickup, widget, status }){
  const wOut = x => ({ d:DAYS.indexOf(x.day), from:x.from, to:x.to });
  const invite = { t:'invite', w:wOut(w), kidNames, family, place, pickup };
  const heard = [];
  PD_HEARD.set(family, heard);
  const offHello = link.on(m => { if (m.t === 'hello') link.send(invite); });
  const offText = link.on(m => { if (m.t === 'text') { heard.push(m.text); if (!document.querySelector('.jc-screen.dm')) playdateReply(p, family, m.text); } });
  link.send(invite);
  const who = joinNames([...kids.map(k => k.n), family.kid]);
  try {
    for (;;) {
      const wait = p.block(`<div class="status"><span class="spinner"></span><div>${status}<small>${playdateWhen(w)} · in Sprout</small></div></div>`);
      p.scroll();
      const m = await link.next(['confirm', 'suggest', 'cant']);
      wait.remove();
      if (m.t === 'confirm') { X.notify(p, `${family.ask} confirmed the playdate`, who); return 'confirmed'; }
      if (m.t === 'cant') {
        widget.declined();
        X.notify(p, `${family.ask} can’t make it this time`, who);
        return 'cant';
      }
      const suggested = { day:DAYS[m.w.d], from:m.w.from, to:m.w.to }, was = { ...w };
      X.notify(p, `${family.ask} suggested a new time`, playdateWhen(suggested));
      widget.time(suggested, was); widget.proposed(family.ask);
      p.set(`${family.ask} suggested ${playdateWhen(suggested)}`, { when:suggested.day.short, attn:true });
      await p.say(`${family.ask} suggested ${playdateWhen(suggested)} instead. Does that work?`, 700);
      for (;;) {
        widget.card.querySelector('.chips')?.remove();
        const choice = await p.chips(['Accept', 'Suggest another time', 'Reply'], { into:widget.card });
        if (choice === 0) {
          Object.assign(w, suggested); widget.time(w);
          widget.card.querySelector('.chips')?.remove();
          link.send({ t:'accepted' });
          return 'accepted';
        }
        if (choice === 1) {
          const revised = await suggestPlaydateTime(suggested);
          if (!revised) continue;
          Object.assign(w, revised);
          widget.card.querySelector('.chips')?.remove();
          widget.time(w, suggested); widget.wait();
          widget.message(`How about ${w.day.long.split(',')[0]}, ${range(w.from, w.to)}?`);
          p.set(status, { when:w.day.short });
          link.send({ t:'counter', w:wOut(w) });
          break;   // back to waiting on her answer to the new time
        }
        await playdateDM(family, w, kidNames, place, pickup, { confirmed:false });
      }
    }
  } finally { offHello(); offText(); }
}
X.flows.playdate = async (p, opt = {}) => {
  /* P1 (Tony, 20 Nov US): "Let's try and put the kids up top... you're selecting for which kid, the date is already
     defaulted, there's quick options." Kids first, as one row of photo chips with no class label ("that's not how parents
     look at their own kids... Maya or Jake or both"); quick times, places on one line each, so the card stays short
     even with four kids. */
  let picked = [KIDS[0]], pickup = false;
  let place = FAMILY.address, where = 0;
  const options = ['Our place', 'A park', 'Lunch spot', 'Somewhere else'];
  await p.say('Fun. Who’s it for, when and where? Then I’ll message the other parent for you.', 800);
  const w = await playdateTime(p, { canContinue:() => picked.length > 0, addFields:next => {
    const card = next.closest('.card');
    const kidsRow = el(`<div><div class="dlabel" style="margin-top:14px">For</div><div class="pd-kids">${KIDS.map(k => `<button type="button" class="pd-kid${picked.includes(k) ? ' on' : ''}" data-kid="${k.n}" aria-pressed="${picked.includes(k)}"><span class="uaph" style="background-image:url(${k.img})"></span>${k.n}<i class="ph-bold ph-check"></i></button>`).join('')}</div></div>`);
    card.querySelector('.ctop').after(kidsRow);
    const fields = el(`<div><div class="dlabel" style="margin-top:16px">Where</div><div class="qk pd-strip">${options.map((label, i) => `<button type="button" class="chip${i === where ? ' sel' : ''}" aria-pressed="${i === where}" data-where="${i}">${label}</button>`).join('')}</div>
      <button type="button" class="ua-row pk" data-pickup aria-pressed="false" style="margin-top:12px"><span class="uaph uamono" style="width:40px;height:40px"><i class="ph ph-car-profile"></i></span><span class="tx"><b>We can pick up and drop off</b><small>Said in the invite, so the other parent knows</small></span><span class="ck"><i class="ph-bold ph-check"></i></span></button></div>`);
    next.before(fields);
    card.querySelector('.qk').classList.add('pd-strip');   // the quick times, one line too
    const kidBtns = [...kidsRow.querySelectorAll('[data-kid]')], places = [...fields.querySelectorAll('[data-where]')], pk = fields.querySelector('[data-pickup]');
    kidBtns.forEach(b => b.onclick = () => {
      const k = KIDS.find(x => x.n === b.dataset.kid);
      picked = picked.includes(k) ? picked.filter(x => x !== k) : KIDS.filter(x => x === k || picked.includes(x));
      kidBtns.forEach(x => { const on = picked.some(k2 => k2.n === x.dataset.kid); x.classList.toggle('on', on); x.setAttribute('aria-pressed', on); });
      next.disabled = !picked.length;
    });
    pk.onclick = () => { pickup = !pickup; pk.classList.toggle('on', pickup); pk.setAttribute('aria-pressed', pickup); };
    let placeKey = null, placeShort = '';
    places.forEach(b => b.onclick = async () => {
      const i = +b.dataset.where;
      const chosen = i === 0 ? { key:null, short:'', full:FAMILY.address } : await playdatePlace(i, i === where ? placeKey : null);
      if (!chosen) return;
      place = chosen.full; placeKey = chosen.key; placeShort = chosen.short; where = i;
      places.forEach((row, n) => {
        row.classList.toggle('sel', row === b); row.setAttribute('aria-pressed', row === b);
        row.textContent = n && n === where ? placeShort : options[n];
      });
      b.scrollIntoView({ block:'nearest', inline:'nearest' });
    });
  } });
  const kids = picked;
  const kidNames = joinNames(kids.map(k => k.n));
  sub(p, `Playdate · ${w.day.day}`);
  p.title = `Playdate · ${kidNames}`;
  let family, widget, withoutLily = false, acceptedTheirs = false;
  const without = [];
  for (;;) {
    family = await classmatesCard(p, kids, { withoutLily, without });
    const sending = p.work(`Messaging ${family.ask}`, 'In Sprout');
    await sleep(900);
    sending.done(`Messaged ${family.ask}`, `${playdateWhen(w)} · in Sprout`, 'ph-chat-circle-text');
    widget = playdateWidget(p, { w, kidNames, family, place, pickup });
    const status = `Waiting on ${family.ask}`;
    p.set(status, { when:w.day.short });
    if (link) {
      const r = await playdateLinked(p, { w, kids, kidNames, family, place, pickup, widget, status });
      if (r === 'cant') { without.push(family.kid); await p.say(`${family.ask} can’t make it this time. Ask another family?`, 700); continue; }
      acceptedTheirs = r === 'accepted';
      break;
    }
    const declined = family.kid === 'Lily' && route === 'playdate-cant';
    const proposed = family.kid === 'Lily' && (route === 'playdate-new-time' || opt.newTime);
    const reply = declined ? `${family.ask} can’t make it this time` : proposed ? `${family.ask} suggested a new time` : `${family.reply} confirmed the playdate`;
    await later(p, { status, small:playdateWhen(w), ms:2500, title:reply, body:joinNames([...kids.map(k => k.n), family.kid]) });
    if (declined) {
      widget.declined();
      playdateReply(p, family, 'So sorry, we can’t make it this time! Another weekend?');
      withoutLily = true;
      await p.say(`${family.ask} can’t make it this time. Ask another family?`, 700);
      continue;
    }
    if (proposed) {
      /* P3 (Tony, 20 Nov US): "It needs to show what the suggested time would be, and then I need to have the options:
         accept it, suggest a different time, reply." The same card shows both times; the choice lives on it. */
      const suggested = { day:DAYS.find(d => d.w === 'Sun'), from:900, to:1020 };
      const was = { ...w };
      widget.time(suggested, was); widget.proposed(family.ask);
      playdateReply(p, family, `Saturday’s tricky for us. Could we do ${suggested.day.long.split(',')[0]}, ${range(suggested.from, suggested.to)} instead?`);
      p.set(`${family.ask} suggested ${playdateWhen(suggested)}`, { when:suggested.day.short, attn:true });
      await p.say(`${family.ask} suggested ${playdateWhen(suggested)} instead. Does that work?`, 700);
      for (;;) {
        widget.card.querySelector('.chips')?.remove();
        const choice = await p.chips(['Accept', 'Suggest another time', 'Reply'], { into:widget.card });
        if (choice === 0) { Object.assign(w, suggested); widget.time(w); acceptedTheirs = true; break; }
        if (choice === 1) {
          const revised = await suggestPlaydateTime(suggested);
          if (!revised) continue;
          Object.assign(w, revised);
          widget.card.querySelector('.chips')?.remove();
          widget.time(w, suggested); widget.wait();
          widget.message(`How about ${w.day.long.split(',')[0]}, ${range(w.from, w.to)}?`);
          await later(p, { status, small:playdateWhen(w), ms:2500, title:`${family.ask} confirmed the playdate`, body:playdateWhen(w) });
          widget.time(w);
          break;
        }
        await playdateDM(family, w, kidNames, place, pickup, { confirmed:false });
      }
      widget.card.querySelector('.chips')?.remove();
    } else playdateReply(p, family, `Yes! ${family.kid} is so excited. See you ${w.day.long.split(',')[0]}!`);
    break;
  }
  /* the card solidifies in place: confirmed, on the calendar, the reminder; then straight into the DM if you want */
  widget.confirmed(`${acceptedTheirs ? `You accepted ${family.ask}’s time` : `${family.ask} confirmed`} · on your calendar · Dana has it too`);
  widget.card.insertAdjacentHTML('beforeend', `<div class="fact"><i class="ph ph-bell-ringing"></i>Reminder for you both at ${ampm(w.from - 30)}</div>`);
  sub(p, `Playdate · ${w.day.day}`);
  p.set(`Confirmed · ${family.kid} · ${playdateWhen(w)}`, { when:w.day.short, done:true });
  await p.say(`It’s set. ${joinNames([...kids.map(k => k.n), family.kid])} on ${playdateWhen(w)}.`, 700);
  const booked = CLOCK.book({ p, i:w.day.i, S:w.from, E:w.to, playdate:{ place, kids:joinNames([...kids.map(k => k.n), family.kid]) } });
  for (;;) {
    widget.card.querySelector('.chips')?.remove();
    const k = await p.chips([`Message ${family.reply}`, 'Done'], { into:widget.card, echo:false });
    if (k === 1) { p.me('Done'); break; }
    await playdateDM(family, w, kidNames, place, pickup);
  }
  await booked;
};

/* ======================= N1 · Carpool, in Tony's order (chat, 20 Nov) =======================
   One flow replaces the 19 Nov A (one ride) / B (weekly) directions:
   1 one time or regular → 2 date (regular: days + until) and ONE pickup time, never a range ("we don't need the time
   ranges, we need specific times") → 3 pick up from (Home, School, Soccer, Camp: what Sprout registered for that kid)
   → 4 drop off at (same options) → 5 one way or both ways (both asks the ride-back time) → 6 nearby families whose kid
   does the same activity → 7 the whole group chat, or parents you pick (the playdate parent grid).
   One time: the first yes drives, nobody confirms twice (N5). Regular: everyone who says yes gets a turn plan.
   Families are samples: Jake's SSC team (Priya and Aisha are on the soccer card) and Lincoln families. */
const illIco = n => `<span class="clayico" style="background-image:url(${A}illus/${n}.webp)"></span>`;
const TEAM = [
  { n:'Priya Shah', ask:'Priya', kid:'Leo', rel:'Leo’s mom', mi:0.8, photo:A + 'priya.webp', regular:'no', why:'Leo has swim those days this fall' },   // one time: says yes (A4, 25 Nov); regular: can't
  { n:'Aisha Khan', ask:'Aisha', kid:'Ava', rel:'Ava’s mom', mi:1.4, photo:A + 'aisha.webp', cant:true, regular:'yes' },
  { n:'Elena Ruiz', ask:'Elena', kid:'Noah', rel:'Noah’s mom', mi:2.6, photo:A + 'elena.webp' },
  { n:'Marcus Lee', ask:'Marcus', kid:'Owen', rel:'Owen’s dad', mi:2.9 },
];
const TONY = { n:'Tony', photo:A + 'tony.webp' };
/* A4 (Tony, 25 Nov): "I wouldn't even show the adjustment in time... it would be happier path if you didn't have to do
   the adjustment." Priya just says yes on /plan-carpool/. Her "can't at 9:30, could drive at 9:45 or 10" (Ahmad,
   21 Nov) is still there on its own review route /plan-carpool-new-time/, and on her phone as the "Can't at 9:30" button. */
if (route === 'plan-carpool-new-time') TEAM[0].offer = [15, 30];
/* 24 Nov (Ahmad): nearby is a suggestion, not a fence. Wherever carpool lists families you can add a parent by hand:
   anyone in the kid's class (closest first, however far) or a number for a family not on Sprout yet, who gets a text.
   Review state /plan-carpool-none/: nobody lives near, so Sprout offers the class chat, the class list or a number. */
const CP_NONE = route === 'plan-carpool-none';
const cpWhere = g => g.near.replace(/^Lincoln · /, '');
const cpIn = g => (/team/.test(g.near) ? 'on ' : g.near.startsWith('Pinecrest') ? 'among ' : 'in ') + cpWhere(g);   // on Jake’s team, in Miss Poole’s class
/* the class beyond the nearby list. TEAM are the nearby families, so they never show here; distances are samples */
const cpRoster = (kid, skip) => PLAYDATE_FAMILIES[kid.n].filter(f => ![...TEAM, ...skip].some(s => s.n === f.n))
  .map((f, i) => ({ ...f, added:true, mi:+(3.1 + i * .3).toFixed(1) }));
const cpLine = (f, g) => f.invite ? `${f.phone} · not on Sprout yet, gets a text` : `${f.rel} · ${f.mi} mi · ${f.added ? 'added by you' : g.doing(f)}`;
/* their reply, in the channel it came on: Sprout, or a text for a parent not on Sprout yet */
const cpReply = (p, f, text, where) => p.block(`<div class="preview gtx sms-in"><small>${face({ n:f.ask, photo:f.photo }, 18)}${f.n} · ${where || (f.invite ? 'text message' : 'in Sprout')}</small><p></p></div>`).querySelector('p').textContent = text;
function cpPhoneSheet(){
  return new Promise(res => {
    let done = false; const fin = x => { if (!done) { done = true; res(x); } };
    const v = bsheet({ onBack:() => fin(null), body:`<div class="bh"><span class="icotile"><i class="ph ph-phone"></i></span><b>Add by phone number</b></div>
      <p class="bp">For a family not on Sprout yet. I text them the ride with a link to say yes.</p>
      <button type="button" class="ct-pick" data-contacts><i class="ph ph-address-book"></i><span><b>Choose from Contacts</b><small>Fills in their name and number</small></span><i class="ph ph-caret-right"></i></button>
      <div class="ct-or"><span>or type it in</span></div>
      <div class="fields" style="margin-top:0">
        <label class="field in"><div style="width:100%"><div class="l">Name</div><input autocomplete="off" placeholder="Their name"></div></label>
        <label class="field in"><div style="width:100%"><div class="l">Phone</div><input inputmode="tel" autocomplete="off" placeholder="(512) 555-0100"></div></label></div>`,
      foot:'<button type="button" class="btn" data-go disabled>Add a name and number</button>' });
    const [nm, ph] = v.body.querySelectorAll('input'), go = v.foot.querySelector('[data-go]');
    const paint = () => { const ok = nm.value.trim() && ph.value.replace(/\D/g, '').length >= 10; go.disabled = !ok; go.textContent = ok ? `Add ${nm.value.trim().split(' ')[0]}` : 'Add a name and number'; };
    [nm, ph].forEach(x => x.oninput = paint);
    v.body.querySelector('[data-contacts]').onclick = async () => { const c = await pickContact(); if (!c) return; nm.value = c.full; ph.value = c.phone; paint(); };
    go.onclick = () => { if (go.disabled) return; const n = playdateEscape(nm.value.trim()); v.close();
      fin({ n, ask:n.split(' ')[0], reply:n.split(' ')[0], rel:'Not on Sprout yet', phone:playdateEscape(ph.value.trim()), invite:true, added:true }); };
  });
}
function cpAddSheet(kid, skip){
  return new Promise(res => {
    let done = false; const fin = x => { if (!done) { done = true; res(x); } };
    const roster = cpRoster(kid, skip);
    const v = bsheet({ onBack:() => fin(null), body:`<div class="bh"><span class="icotile"><i class="ph ph-user-plus"></i></span><b>Add a parent</b></div>
      <p class="bp">Anyone in ${kid.cls}, closest to you first.</p><div data-pg></div>
      <div class="ct-or"><span>not on Sprout yet?</span></div>
      <button type="button" class="ct-pick" data-phone><i class="ph ph-phone"></i><span><b>Add by phone number</b><small>I text them the ride with a link to say yes</small></span><i class="ph ph-caret-right"></i></button>`,
      foot:'<button type="button" class="btn" data-go disabled>Pick a parent</button>' });
    const go = v.foot.querySelector('[data-go]');
    const grid = parentGrid(roster, { multi:true, show:6, extra:f => `${f.mi} mi from you`, onChange:() => {
      const n = grid.picked(); go.disabled = !n.length; go.textContent = !n.length ? 'Pick a parent' : n.length > 2 ? `Add ${n.length} parents` : `Add ${joinNames(n.map(f => f.ask))}`; } });
    v.body.querySelector('[data-pg]').append(grid.el);
    v.body.querySelector('[data-phone]').onclick = async () => { const f = await cpPhoneSheet(); if (!f) return; v.close(); fin([...grid.picked(), f]); };
    go.onclick = () => { if (go.disabled) return; v.close(); fin(grid.picked()); };
  });
}
/* nobody nearby: the class chat, the class list, or a number. Returns 'group' or the parents picked */
async function cpNobody(p, g, kid){
  await p.say(`Nobody ${cpIn(g)} lives close to you yet. I can post in ${g.chat}, or you pick who to ask.`, 900);
  for (;;) {
    const k = await p.chips([`Post in ${g.chat}`, 'Pick from the class', 'Add by phone number']);
    if (k === 0) return 'group';
    const add = k === 1 ? await cpAddSheet(kid, []) : await cpPhoneSheet().then(f => f && [f]);
    if (add && add.length) return add;
    await p.say('Nobody added yet. Post in the chat, or pick who?', 500);
  }
}
/* the places Sprout already knows for each kid (registrations + home), Tony: "Home, School, Soccer, whatever we have" */
const CP_PLACES = [
  { k:'home', n:'Home', s:'10212 Banks Court', ico:'house', kids:['Maya', 'Jake'], say:'home' },
  { k:'school', n:'School', s:'Lincoln Elementary · bell at 7:45 AM', ico:'graduation-cap', kids:['Maya', 'Jake'], say:'Lincoln Elementary' },
  { k:'soccer', n:'Soccer', s:'SSC Kids · Lakeline Park · Sat 10 AM', ico:'soccer-ball', kids:['Jake'], say:'soccer at Lakeline Park' },
  { k:'camp', n:'Summer camp', s:'Pinecrest Day Camp · 9 AM–3 PM', ico:'tent', kids:['Maya'], say:'Pinecrest camp' },
  { k:'else', n:'Somewhere else', s:'Type an address', ico:'map-pin', kids:['Maya', 'Jake'] },
];
const cpSay = x => x.k === 'else' ? playdateEscape(x.addr) : x.say;
const cpShort = x => x.k === 'else' ? playdateEscape(x.addr) : x.n;
/* the place as the other family knows it (Tony's own labels are Home, School, Soccer) */
const cpThere = x => ({ home:'Banks Court', school:'Lincoln Elementary', soccer:'Lakeline Park', camp:'Pinecrest Day Camp' }[x.k] || x.addr);
/* who shares the activity: the group chat Sprout can post in, and why each family shows up */
const cpGroup = (act, kid) => ({
  soccer:{ chat:'Jake’s team chat', size:'SSC Kids · U6 Blue · 12 families', near:'Jake’s team', look:'Kids on Jake’s SSC team', doing:f => `${f.kid} plays too` },
  school:{ chat:`${kid.cls} chat`, size:'Lincoln Elementary · 18 families', near:`Lincoln · ${kid.cls}`, look:`Lincoln families in ${kid.cls}`, doing:f => `${f.kid} goes to Lincoln` },
  camp:{ chat:`${kid.cls} chat`, size:'4 families there have kids at Pinecrest', near:'Pinecrest families', look:'Lincoln kids at Pinecrest', doing:f => `${f.kid} is at Pinecrest too` },
}[act]);
const CP_BASE = new Date(2026, 6, 27);   // the demo's today, Monday, July 27
const WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], WDL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const CP_UNTIL = [['4 weeks', 28], ['Oct 31', new Date(2026, 9, 31)], ['Dec 18', new Date(2026, 11, 18)]];
const cpUntilDate = u => { if (typeof u[1] !== 'number') return u[1]; const d = new Date(CP_BASE); d.setDate(d.getDate() + u[1]); return d; };
const cpDate = d => `${WD[d.getDay()]}, ${MON[d.getMonth()]} ${d.getDate()}`;
function cpDates(days, until, max = 99){   // every ride from tomorrow through the until date
  const out = [], end = cpUntilDate(until);
  for (let d = new Date(CP_BASE); out.length < max;) { d.setDate(d.getDate() + 1); if (d > end) break; if (days.includes(d.getDay())) out.push(new Date(d)); }
  return out;
}
const timeStrip = (name, first, last, sel) => { const out = []; for (let m = first; m <= last; m += 30) out.push(m); if (sel != null && !out.includes(sel)) { out.push(sel); out.sort((a, b) => a - b); } return out.map(m => `<button type="button" class="chip" style="flex:none" data-${name}="${m}">${tl(m)}</button>`).join(''); };

/* 1 · one time or regular */
async function cpKind(p){
  const c = p.block(`<div class="card"><div class="ctop">${illIco('carpool')}<div><div class="eyebrow">Carpool</div><div class="ttl">One time or regular?</div></div></div>
    <div class="fact" style="margin-top:10px"><i class="ph ph-car-profile"></i>One time: a single ride, like Saturday’s game</div>
    <div class="fact"><i class="ph ph-arrows-clockwise"></i>Regular: the same ride every week, families take turns</div></div>`).querySelector('.card');
  return await p.chips(['One time', 'Regular carpool'], { into:c }) === 0 ? 'once' : 'regular';
}
/* 2 · when: who, the date (or days + until) and one specific pickup time */
function cpWhen(p, kind){
  return new Promise(res => {
    let kids = [KIDS[1]], day = DAYS.find(d => d.w === 'Sat'), days = [6], until = CP_UNTIL[1], at = 570;   // N11 (Tony, 20 Nov): "I need the option to select multiple kids"
    const once = kind === 'once';
    const c = p.block(`<div class="card"><div class="ctop">${clay('calendar-check')}<div><div class="eyebrow">Carpool · ${once ? 'one time' : 'regular'}</div><div class="ttl">${once ? 'Plan a ride' : 'Plan a regular carpool'}</div></div></div>
      <div class="dlabel" style="margin-top:14px">For</div>
      <div class="pd-kids" role="group">${KIDS.map(k => `<button type="button" class="pd-kid" data-kid="${k.n}" aria-pressed="false"><span class="uaph" style="background-image:url(${k.img})"></span>${k.n}<i class="ph-bold ph-check"></i></button>`).join('')}</div>
      ${once ? `<div class="dlabel" style="margin-top:16px">Date</div><div class="ua-days">${DAYS.map((d, i) => `<button type="button" class="ua-day" data-i="${i}"><small>${d.w}</small><b>${d.d}</b><i></i></button>`).join('')}</div>`
        : `<div class="dlabel" style="margin-top:16px">Every</div><div class="qk cp-wd">${[1, 2, 3, 4, 5, 6, 0].map(d => `<button type="button" class="chip" data-wd="${d}" aria-pressed="false">${WD[d]}</button>`).join('')}</div>
        <div class="dlabel" style="margin-top:16px">Until</div><div class="qk">${CP_UNTIL.map((u, i) => `<button type="button" class="chip" data-until="${i}">${i ? `Through ${u[0]}` : u[0]}</button>`).join('')}</div>`}
      <div class="dlabel" style="margin-top:16px">Pickup time</div>
      <div class="qk" style="display:flex;flex-wrap:nowrap;overflow-x:auto" data-at-row></div>
      <div class="ua-dur"><i class="ph-fill ph-car-profile"></i><span data-d></span></div>
      <button type="button" class="btn" style="margin-top:14px">Next</button></div>`).querySelector('.card');
    const btn = c.querySelector('.btn'), atRow = c.querySelector('[data-at-row]');
    const paintTimes = () => {
      atRow.innerHTML = timeStrip('at', 420, 1140, at) + '<button type="button" class="chip" style="flex:none" data-other>Other time</button>';
      atRow.querySelectorAll('[data-at]').forEach(b => b.onclick = () => { at = +b.dataset.at; paint(); });
      atRow.querySelector('[data-other]').onclick = async () => { const m = await timeWheel({ title:'Pickup time', value:at }); if (m != null) { at = m % 1440; paintTimes(); paint(); } };
      setTimeout(() => { const s = atRow.querySelector(`[data-at="${at}"]`); if (s) atRow.scrollLeft = s.offsetLeft - 40; }, 30);
    };
    const paint = () => {
      c.querySelectorAll('[data-kid]').forEach(b => { const on = kids.some(k => k.n === b.dataset.kid); b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
      c.querySelectorAll('.ua-day').forEach(b => b.classList.toggle('on', DAYS[+b.dataset.i] === day));
      c.querySelectorAll('[data-wd]').forEach(b => { const on = days.includes(+b.dataset.wd); b.classList.toggle('sel', on); b.setAttribute('aria-pressed', on); });
      c.querySelectorAll('[data-until]').forEach(b => b.classList.toggle('sel', CP_UNTIL[+b.dataset.until] === until));
      atRow.querySelectorAll('[data-at]').forEach(b => b.classList.toggle('sel', +b.dataset.at === at));
      const n = once ? 1 : cpDates(days, until).length;
      c.querySelector('[data-d]').textContent = once ? `${day.day} · pickup at ${tl(at)}`
        : days.length ? `${[1, 2, 3, 4, 5, 6, 0].filter(d => days.includes(d)).map(d => WD[d] + 's').join(', ')} · pickup at ${tl(at)} · ${n} ride${n === 1 ? '' : 's'}` : 'Pick at least one day';
      btn.disabled = !kids.length || (!once && !days.length);
      btn.textContent = kids.length ? 'Next' : 'Pick at least one kid';
    };
    c.querySelectorAll('[data-kid]').forEach(b => b.onclick = () => { const k = KIDS.find(x => x.n === b.dataset.kid); kids = kids.includes(k) ? kids.filter(x => x !== k) : KIDS.filter(x => x === k || kids.includes(x)); paint(); });
    c.querySelectorAll('.ua-day').forEach(b => b.onclick = () => { day = DAYS[+b.dataset.i]; paint(); });
    c.querySelectorAll('[data-wd]').forEach(b => b.onclick = () => { const d = +b.dataset.wd; days = days.includes(d) ? days.filter(x => x !== d) : [...days, d]; paint(); });
    c.querySelectorAll('[data-until]').forEach(b => b.onclick = () => { until = CP_UNTIL[+b.dataset.until]; paint(); });
    btn.onclick = () => {
      if (btn.disabled) return;
      c.querySelectorAll('button').forEach(b => b.style.pointerEvents = 'none'); btn.remove();
      const wds = [1, 2, 3, 4, 5, 6, 0].filter(d => days.includes(d));
      const who = joinNames(kids.map(k => k.n));
      p.me(once ? `${who} · ${day.day}, pickup at ${tl(at)}` : `${who} · ${wds.map(d => WD[d] + 's').join(', ')} at ${tl(at)}, until ${until[1] === 28 ? '4 weeks' : until[0]}`);
      res({ kids, day, days:wds, until, at });
    };
    paintTimes(); paint(); p.scroll();
  });
}
/* 3 + 4 · pick up from / drop off at: the same list, tap answers (Somewhere else asks the address) */
function cpPlace(p, { kids, title, eyebrow, not }){
  return new Promise(res => {
    const list = CP_PLACES.filter(x => kids.some(k => x.kids.includes(k.n)) && (x.k === 'else' || x.k !== not));
    const forWho = x => kids.length > 1 && !kids.every(k => x.kids.includes(k.n)) ? ` · ${joinNames(kids.filter(k => x.kids.includes(k.n)).map(k => k.n))}` : '';
    const c = p.block(`<div class="card"><div class="ctop">${clay('calendar-check')}<div><div class="eyebrow">${eyebrow}</div><div class="ttl">${title}</div></div></div>
      <div class="ua-rows" role="radiogroup">${list.map(x => `<button type="button" class="ua-row pk" data-k="${x.k}" role="radio" aria-checked="false"><span class="uaph uamono"><i class="ph ph-${x.ico}"></i></span><span class="tx"><b>${x.n}</b><small>${x.s}${forWho(x)}</small></span><span class="ck"><i class="ph-bold ph-check"></i></span></button>`).join('')}</div>
      <div class="foot"><i class="ph ph-info"></i>From ${joinNames(kids.map(k => k.n + '’s'))} registrations and your address</div></div>`).querySelector('.card');
    c.querySelectorAll('[data-k]').forEach(b => b.onclick = async () => {
      let x = list.find(y => y.k === b.dataset.k);
      if (x.k === 'else') { const a = await editText('Address', '', { rows:2 }); if (!a) return; x = { ...x, addr:a }; }
      c.querySelectorAll('[data-k]').forEach(y => { y.classList.toggle('on', y === b); y.setAttribute('aria-checked', y === b); y.style.pointerEvents = 'none'; });
      if (x.k === 'else') b.querySelector('small').textContent = x.addr;
      p.me(cpShort(x)); res(x);
    });
    p.scroll();
  });
}
/* 5 · one way or both ways; both asks when the ride back leaves.
   A4 (Tony, 25 Nov): "when I click these, it just... does the one. But then... once it's already preselected, and then
   we say find families nearby. These UIs are different." Same as Pick up from / Drop off at now: nothing preselected,
   tapping a row answers (no Find families nearby button). Both ways asks the ride-back time in the time wheel, the way
   Somewhere else asks the address. */
function cpWay(p, from, to, at){
  return new Promise(res => {
    const c = p.block(`<div class="card"><div class="ctop">${illIco('carpool')}<div><div class="eyebrow">Carpool</div><div class="ttl">One way or both ways?</div></div></div>
      <div class="ua-rows" role="radiogroup">
        <button type="button" class="ua-row pk" data-w="0" role="radio" aria-checked="false"><span class="uaph uamono"><i class="ph ph-arrow-right"></i></span><span class="tx"><b>One way</b><small>${cpShort(from)} to ${cpShort(to)} at ${tl(at)}</small></span><span class="ck"><i class="ph-bold ph-check"></i></span></button>
        <button type="button" class="ua-row pk" data-w="1" role="radio" aria-checked="false"><span class="uaph uamono"><i class="ph ph-arrows-left-right"></i></span><span class="tx"><b>Both ways</b><small>And back to ${cpShort(from)} after</small></span><span class="ck"><i class="ph-bold ph-check"></i></span></button></div></div>`).querySelector('.card');
    c.querySelectorAll('[data-w]').forEach(b => b.onclick = async () => {
      let back = null;
      if (b.dataset.w === '1') {
        const m = await timeWheel({ title:'Ride back', value:Math.ceil((at + 120) / 30) * 30 });
        if (m == null) return;
        if (m % 1440 <= at) return toast(`Pick a time after ${tl(at)}.`);
        back = m % 1440; b.querySelector('small').textContent = `Back to ${cpShort(from)} at ${tl(back)}`;
      }
      c.querySelectorAll('[data-w]').forEach(y => { y.classList.toggle('on', y === b); y.setAttribute('aria-checked', y === b); y.style.pointerEvents = 'none'; });
      p.me(back != null ? `Both ways, back at ${tl(back)}` : 'One way'); res(back);
    });
    p.scroll();
  });
}
/* 7 · the whole group chat, or parents you pick (same parent grid as Playdate, N4) */
function cpSend(p, g, near, text, { kid, mode = 'group' } = {}){
  return new Promise(res => {
    const fams = [...near], mine = near.length && near.every(f => f.added);
    const c = p.block(`<div class="card"><div class="ctop">${clay('two-people')}<div><div class="eyebrow">${g.near}</div><div class="ttl">Who should I ask?</div></div></div>
      <div class="ua-rows" role="radiogroup">
        <button type="button" class="ua-row pk" data-m="group" role="radio" aria-checked="false"><span class="uaph uamono"><i class="ph ph-users-three"></i></span><span class="tx"><b>${g.chat}</b><small>Everyone · ${g.size}</small></span><span class="ck"><i class="ph-bold ph-check"></i></span></button>
        <button type="button" class="ua-row pk" data-m="pick" role="radio" aria-checked="false"><span class="uaph uamono"><i class="ph ph-user-list"></i></span><span class="tx"><b>Parents I pick</b><small>${mine ? `${near.length} you picked` : `${near.length} families live near you`}</small></span><span class="ck"><i class="ph-bold ph-check"></i></span></button></div>
      <div data-pg hidden><button type="button" class="rk-row rk-add" data-add>${cpAddRow(kid)}</button></div>
      <div class="preview"><small data-to></small><p data-msg></p></div>
      <button type="button" class="textbtn" data-edit style="margin-top:6px;width:auto;padding:4px 0;color:var(--brand)"><i class="ph ph-pencil-simple"></i> Edit message</button>
      <button type="button" class="btn" style="margin-top:10px"></button></div>`).querySelector('.card');
    const btn = c.querySelector('.btn'), msg = c.querySelector('[data-msg]');
    let grid;
    const mk = on => { c.querySelector('[data-pg] .pg-wrap')?.remove();
      grid = parentGrid(fams, { multi:true, on, extra:f => f.invite ? `${f.phone} · gets a text` : `${f.mi} mi · ${f.added ? 'added by you' : g.doing(f)}`, onChange:() => paint() });
      c.querySelector('[data-pg]').prepend(grid.el); };
    mk(mine ? fams.map((_, i) => i) : [0, 1]);
    c.querySelector('[data-add]').onclick = async () => {
      const add = await cpAddSheet(kid, fams); if (!add) return;
      const on = grid.picked().map(f => fams.indexOf(f)); add.forEach(f => { fams.push(f); on.push(fams.length - 1); });
      mk(on); paint(); p.scroll(); };
    let custom = null;
    const paint = () => {
      const picks = grid.picked();
      c.querySelectorAll('[data-m]').forEach(b => { const on = b.dataset.m === mode; b.classList.toggle('on', on); b.setAttribute('aria-checked', on); });
      c.querySelector('[data-pg]').hidden = mode !== 'pick';
      const via = picks.every(f => f.invite) ? 'By text · one to each' : picks.some(f => f.invite) ? 'In Sprout or by text · one to each' : 'In Sprout · a DM with each';
      c.querySelector('[data-to]').textContent = mode === 'group' ? `In ${g.chat} · from you` : picks.length > 1 ? `${via} · from you` : picks.length ? (picks[0].invite ? `By text to ${picks[0].ask} · from you` : `In Sprout · your DM with ${picks[0].ask}`) : 'Pick at least one parent';
      msg.textContent = custom || text(mode === 'pick' && picks.length ? picks[0] : null);
      btn.disabled = mode === 'pick' && !picks.length;
      btn.textContent = mode === 'group' ? `Post in ${g.chat}` : picks.length ? `Ask ${joinNames(picks.map(f => f.ask))}` : 'Pick at least one parent';
    };
    c.querySelectorAll('[data-m]').forEach(b => b.onclick = () => { mode = b.dataset.m; paint(); p.scroll(); });
    c.querySelector('[data-edit]').onclick = async () => { const t = await editText('Edit the message', playdateEscape(msg.textContent)); if (t) { custom = t; paint(); } };
    btn.onclick = () => {
      if (btn.disabled) return;
      const picks = grid.picked();
      c.querySelectorAll('button,input').forEach(b => b.disabled = true); c.querySelector('[data-edit]').remove(); c.querySelector('[data-add]').remove(); btn.remove(); grid.lock();
      p.me(btn.textContent); res({ mode, picks, text:msg.textContent });
    };
    paint(); p.scroll();
  });
}
/* the DM with another parent (Playdate's DM screen): your message, their reply, keyboard ready */
function carpoolDM(f, mine, theirs, sys, where = 'Jake’s team'){
  if (isLive(f)) theirs = null;   // her own words only
  return new Promise(done => {
    const who = { n:f.ask, photo:f.photo };
    const screen = el(`<section class="jc-screen dm" aria-label="Messages with ${f.ask}">
      <div class="dm-head"><button type="button" class="dm-back" aria-label="Back"><i class="ph ph-caret-left"></i></button>${face(who, 36)}
        <div class="dm-who"><b>${f.n}</b><small>${f.rel} · ${where}</small></div></div>
      <div class="jc-log" role="log"></div>
      <form class="dm-comp"><input aria-label="Message ${f.ask}" placeholder="Message ${f.ask}" autocomplete="off"><button type="submit" aria-label="Send"><i class="ph-fill ph-paper-plane-tilt"></i></button></form></section>`);
    $('#phone').append(screen);
    const log = screen.querySelector('.jc-log'), input = screen.querySelector('input');
    log.append(classMessage(TONY, mine, true));
    if (sys) log.append(el(`<div class="dm-sys"><i class="ph ph-car-profile"></i>${sys}</div>`));
    if (theirs) log.append(classMessage(who, theirs));
    const live = isLive(f);
    const off = live ? link.on(m => { if (m.t === 'text') { log.append(classMessage(who, m.text)); log.scrollTop = log.scrollHeight; } }) : null;
    screen.querySelector('form').onsubmit = e => { e.preventDefault(); const t = input.value.trim(); if (!t) return; log.append(classMessage(TONY, t, true)); input.value = ''; log.scrollTop = log.scrollHeight; if (live) link.send({ t:'tony-text', text:t }); };
    screen.querySelector('.dm-back').onclick = () => { off?.(); screen.classList.add('gone'); setTimeout(() => { screen.remove(); done(); }, 250); };
    setTimeout(() => input.focus(), 300);
  });
}
/* the turn plan for a regular carpool: one row per turn, tap a turn to change who drives */
function rotaCard(p, run, drivers, go){
  return new Promise(res => {
    const turns = run.turns.map((t, i) => ({ ...t, by:drivers[i % drivers.length] }));
    const kidsLine = joinNames([...(run.kids || [run.kid]), ...drivers.filter(d => !d.you).map(f => f.kid)]);
    const c = p.block(`<div class="card"><div class="ctop">${illIco('carpool')}<div><div class="eyebrow">${run.span}</div><div class="ttl">${run.title}</div></div></div>
      <div class="dlabel" style="margin-top:14px">Who drives</div>
      <div class="fields rota" data-rows></div>
      ${run.more ? `<div class="fact" style="margin-top:10px"><i class="ph ph-arrows-clockwise"></i>${run.more}</div>` : ''}
      <div class="fact"${run.more ? '' : ' style="margin-top:10px"'}><i class="ph ph-users"></i>${kidsLine}</div>
      <div class="fact"><i class="ph ph-clock"></i>${run.pick}</div>
      <div class="fact"><i class="ph ph-calendar-check"></i>Your turns go on the family calendar · Dana has them too</div>
      <div class="two"><button type="button" class="btn ghost" data-k="no">Not now</button><button type="button" class="btn" data-k="go">${go}</button></div></div>`).querySelector('.card');
    const rows = c.querySelector('[data-rows]');
    const paint = () => {
      rows.innerHTML = turns.map((t, i) => `<button type="button" class="field" data-t="${i}" style="width:100%;text-align:left;background:transparent"><div style="display:flex;align-items:center;gap:10px">${face(t.by.you ? TONY : { n:t.by.ask, photo:t.by.photo }, 28)}<div><div class="l">${t.d}</div><div class="v">${t.by.you ? 'You' : t.by.ask}</div></div></div><span class="s">Change <i class="ph ph-pencil-simple"></i></span></button>`).join('');
      rows.querySelectorAll('[data-t]').forEach(b => b.onclick = () => change(+b.dataset.t));
    };
    const change = i => {
      let chosen = turns[i].by;
      const v = bsheet({ body:`<div class="bh"><span class="icotile"><i class="ph ph-car-profile"></i></span><b>Who drives ${turns[i].d}?</b></div>
        <div class="list">${drivers.map((d, k) => `<button class="pick${d === chosen ? ' on' : ''}" data-k="${k}">${face(d.you ? TONY : { n:d.ask, photo:d.photo }, 32)}<span class="ptx">${d.you ? 'You' : d.ask}<small>${d.you ? 'Tony' : d.rel}</small></span><span class="cb rd"><i class="ph-bold ph-check"></i></span></button>`).join('')}</div>`,
        foot:'<button type="button" class="btn" data-save>Save</button>' });
      v.o.querySelectorAll('.list .pick').forEach(b => b.onclick = () => { chosen = drivers[+b.dataset.k]; v.o.querySelectorAll('.list .pick').forEach(x => x.classList.toggle('on', x === b)); });
      v.o.querySelector('[data-save]').onclick = () => { turns[i].by = chosen; v.close(); paint(); };
    };
    c.querySelector('[data-k=no]').onclick = () => { c.querySelector('.two').remove(); rows.querySelectorAll('button').forEach(b => b.disabled = true); p.me('Not now'); res(null); };
    c.querySelector('[data-k=go]').onclick = () => { c.querySelector('.two').remove(); rows.querySelectorAll('button').forEach(b => { b.disabled = true; b.querySelector('.s').remove(); }); p.me(go); res(turns); };
    paint(); p.scroll();
  });
}
/* ======================= C2 · Regular carpool (Tony, 20 Nov US) =======================
   "Make it so it's only between two families, me and some other family. I can select to ask multiple families, but
   it's only gonna ask one by one. If I get a no from the first one, then it'll message the next one, until someone
   says yes." Then a suggested split Tony can change before he shares it, and the other parent gets "the carpool is
   confirmed, here's the schedule, added to your calendar". All in Sprout, not text: "we're not gonna text people".
   Demo: the first family can't (Priya), the second says yes (Aisha). Her side: /receiver/?v=carpool-regular. */
const cpAddRow = kid => `<span class="uaph uamono"><i class="ph ph-user-plus"></i></span><span class="rk-tx"><b>Add a parent</b><small>Class list or phone number</small></span><i class="ph ph-caret-right rk-go"></i>`;
function cpRank(p, near, g, kid){
  return new Promise(res => {
    const list = [...near];
    let order = list.every(f => f.added) ? list.map((_, i) => i) : [0, 1].filter(i => i < list.length);   // closest two pre-ranked (or everyone you just added); tap to change
    const c = p.block(`<div class="card"><div class="ctop">${clay('two-people')}<div><div class="eyebrow">${g.near}</div><div class="ttl">Who should I ask first?</div></div></div>
      <div class="fact" style="margin-top:10px"><i class="ph ph-list-numbers"></i><span data-how></span></div>
      <div class="rk" role="list"></div>
      <button type="button" class="rk-row rk-add" data-add>${cpAddRow(kid)}</button>
      <button type="button" class="btn" style="margin-top:12px"></button></div>`).querySelector('.card');
    const rows = c.querySelector('.rk'), btn = c.querySelector('.btn'), add = c.querySelector('[data-add]');
    const paint = () => {
      c.querySelector('[data-how]').textContent = `I ask one family at a time, ${list.every(f => f.invite) ? 'by text' : list.some(f => f.invite) ? 'in Sprout or by text' : 'in Sprout'}. Only if they can’t do I ask the next.`;
      rows.innerHTML = list.map((f, i) => { const n = order.indexOf(i);
        return `<button type="button" class="rk-row${n >= 0 ? ' on' : ''}" data-i="${i}" role="listitem">${face({ n:f.ask, photo:f.photo }, 36)}<span class="rk-tx"><b>${f.n}</b><small>${cpLine(f, g)}</small></span><span class="rk-n">${n >= 0 ? n + 1 : '<i class="ph ph-plus"></i>'}</span></button>`; }).join('');
      rows.querySelectorAll('[data-i]').forEach(b => b.onclick = () => { const i = +b.dataset.i; order = order.includes(i) ? order.filter(x => x !== i) : [...order, i]; paint(); });
      btn.disabled = !order.length;
      btn.textContent = order.length ? `Ask ${list[order[0]].ask} first` : 'Pick at least one family';
    };
    add.onclick = async () => { const more = await cpAddSheet(kid, list); if (!more) return; more.forEach(f => { list.push(f); order.push(list.length - 1); }); paint(); p.scroll(); };
    btn.onclick = () => { if (btn.disabled) return; rows.querySelectorAll('button').forEach(b => b.disabled = true); add.remove(); btn.remove(); p.me(`${order.map((i, k) => `${k + 1}. ${list[i].ask}`).join('  ')}`); res(order.map(i => list[i])); };
    paint(); p.scroll();
  });
}
async function cpRegular(p, ctx){
  const { w, riders, from, to, back, g, near, whenTxt, route, kid } = ctx;
  let ranked;
  if (near.length) {
    await p.say(`A regular carpool works best with one other family. Who should I ask? Put them in order: I’ll ask one at a time and only ask the next if they can’t.`, 900);
    ranked = await cpRank(p, near, g, kid);
  } else {
    const pick = await cpNobody(p, g, kid);
    if (pick === 'group') return cpPostRegular(p, ctx);
    await p.say(`A regular carpool works best with one other family. Put them in order: I’ll ask one at a time and only ask the next if they can’t.`, 800);
    ranked = await cpRank(p, pick, g, kid);
  }
  const askText = f => `Hi ${f.ask}! Want to share ${riders}’s rides from ${route}? ${whenTxt.replace(/^./, x => x.toUpperCase())}, pickup at ${tl(w.at)}${back ? `, back at ${tl(back)}` : ', one way'}. We’d take turns driving.${f.invite ? ' See the rides and say yes: sprout.app/carpool.' : ''} Tony`;
  let partner = null;
  for (const [i, f] of ranked.entries()) {
    const job = p.work(f.invite ? `Texting ${f.ask}` : `Messaging ${f.ask}`, f.invite ? 'By text · with a link to say yes' : 'In Sprout');
    await sleep(900);
    job.done(`Asked ${f.ask}`, i ? `${ranked[i - 1].ask} couldn’t, so ${f.ask} was next` : `First on your list${ranked.length > 1 ? ` · ${ranked.slice(1).map(x => x.ask).join(', ')} only if needed` : ''}`, 'ph-chat-circle-text');
    p.block(`<div class="preview gtx"><small>${face(TONY, 18)}You to ${f.n} · ${f.invite ? 'text message' : 'in Sprout'}</small><p></p></div>`).querySelector('p').textContent = askText(f);
    const status = `Waiting on ${f.ask}`;
    p.set(status, { when:'Now' });
    let no;
    if (link && !f.invite) {
      liveAsk(f, { kind:'regular', who:{ n:f.n, ask:f.ask, kid:f.kid, photo:f.photo }, label:`${f.ask}, ${f.rel}`, sub:i ? `Asked because ${ranked[i - 1].ask} couldn’t.` : 'First on Tony’s list. Gets the ask in Sprout.',
        text:askText(f), title:'Regular carpool', when:`${whenTxt.replace(/^./, x => x.toUpperCase())} · ${tl(w.at)}`, route:`${cpThere(from)} to ${cpThere(to)}${back ? `, back at ${tl(back)}` : ', one way'}`, dist:`${f.mi} mi from you · ${g.doing(f)}` });
      const off = liveWords(p, f, 'in Sprout');
      const m = await liveWait(p, { status, small:`${riders}’s carpool · in Sprout`, types:['yes', 'no'] });
      off();
      no = m.t === 'no';
      X.notify(p, `${f.ask} replied`, no ? 'Can’t this season' : 'We’re in!');
      p.note(no ? `${f.ask} can’t this season` : `${f.ask} is in`, 'Answered in Sprout', no ? 'ph-x-circle' : 'ph-check-circle');
    } else {
      no = f.regular === 'no';
      await later(p, { status, small:`${riders}’s carpool`, ms:2500, title:`${f.ask} replied`, body:no ? 'Can’t this season' : 'We’re in!' });
      cpReply(p, f, no ? `So sorry, we can’t this season. ${f.why.replace(/^./, x => x.toUpperCase())}.` : `We’re in! Happy to take turns.`);
    }
    if (!no) { partner = f; break; }
    if (ranked[i + 1]) await p.say(`${f.ask} can’t this season. Asking ${ranked[i + 1].ask} next, as you ranked.`, 800);
  }
  if (!partner) {
    await p.say(`Nobody on your list can this season. Want to ask another family?`, 800);
    await p.chips(['Not now']); p.set('No carpool yet', { done:true }); return;
  }
  return cpSplit(p, ctx, partner);
}
/* nobody nearby, posted in the class chat: the first family to say yes gets the turns */
async function cpPostRegular(p, ctx){
  const { w, riders, back, g, whenTxt, route, kid } = ctx;
  const job = p.work(`Posting in ${g.chat}`, g.size);
  await sleep(1000);
  job.done(`Posted in ${g.chat}`, 'The first family to say yes shares the rides', 'ph-paper-plane-tilt');
  p.block(`<div class="preview gtx"><small>${face(TONY, 18)}You in ${g.chat}</small><p></p></div>`).querySelector('p').textContent =
    `Hi everyone! Want to share ${riders}’s rides from ${route}? ${whenTxt.replace(/^./, x => x.toUpperCase())}, pickup at ${tl(w.at)}${back ? `, back at ${tl(back)}` : ', one way'}. We’d take turns driving. Tony`;
  const f = cpRoster(kid, [])[0];
  p.set(`Waiting for replies in ${g.chat}`, { when:'Now' });
  await later(p, { status:`Waiting for replies in ${g.chat}`, small:`${riders}’s carpool`, ms:2500, title:`${f.ask} replied in ${g.chat}`, body:'We’re in!' });
  cpReply(p, f, `We’re in! We’re ${f.mi} miles from you, happy to take turns.`, `in ${g.chat}`);
  return cpSplit(p, ctx, f);
}
async function cpSplit(p, { w, kids, riders, from, to, back, rides, whenTxt }, partner){
  /* the split: alternate turns, Tony can change any turn before it goes to the other family */
  const you = { you:true, ask:'You' }, drivers = [you, partner];
  const single = w.days.length === 1;
  const turns = single ? rides.slice(0, 6).map(d => ({ d:cpDate(d) })) : w.days.map(d => ({ d:`${WDL[d]}s` }));
  const run = { kid:riders, kids:kids.map(k => k.n), span:`${whenTxt.replace(/^./, x => x.toUpperCase())}`, title:`${riders}’s carpool with ${partner.ask}`, turns,
    pick:`${tl(w.at)} · ${cpShort(from)} to ${cpShort(to)}${back ? ` · back at ${tl(back)}` : ''}`,
    more:single && rides.length > 6 ? `Then the same order through ${cpDate(rides[rides.length - 1])} · ${rides.length} rides` : '' };
  await p.say(`${partner.ask} is in. Here’s a fair split: you take turns. Change any turn before I share it with ${partner.ask}.`, 900);
  const plan = await rotaCard(p, run, drivers, `Share with ${partner.ask}`);
  if (!plan) { if (isLive(partner)) link.send({ t:'held' }); await p.say(`Okay. Nothing was sent to ${partner.ask}. The turns stay here.`, 700); p.set('Turns not shared', { done:true }); return; }
  const share = p.work(`Sharing the schedule with ${partner.ask}`, 'In Sprout');
  await sleep(1000);
  share.done('Schedule shared', `On both families’ calendars`, 'ph-check-circle');
  if (isLive(partner)) link.send({ t:'schedule', title:`${riders} and ${partner.kid}’s carpool`, pick:`${tl(w.at)} · ${cpThere(from)} to ${cpThere(to)}${back ? ` · back at ${tl(back)}` : ''}`, more:run.more, rows:plan.map(t => ({ d:t.d, you:!t.by.you })) });
  /* what Aisha gets: the carpool, confirmed, her turns on her calendar */
  p.block(`<div class="preview gtx pd-sched"><small>${face(TONY, 18)}You to ${partner.n} · in Sprout</small><p>Carpool’s set! Here’s our schedule. It’s on your calendar.</p>
    <div class="sch">${plan.map(t => `<div class="sch-r"><span>${t.d}</span><b>${t.by.you ? 'Tony' : partner.ask}</b></div>`).join('')}</div>
    ${run.more ? `<small>${run.more}</small>` : ''}</div>`);
  const yours = plan.filter(t => t.by.you);
  await p.say(`The carpool is set with ${partner.ask}. I’ll remind you the night before each of your turns.`, 800);
  p.block(`<div class="card"><div class="ctop">${illIco('carpool')}<div><div class="eyebrow">${run.span}</div><div class="ttl">${run.title}</div></div></div>
    <div class="faces" style="margin-top:12px"><span><i style="background-image:url(${TONY.photo})"></i>${partner.photo ? `<i style="background-image:url(${partner.photo})"></i>` : ''}</span>You and ${partner.ask}</div>
    <div class="fact" style="margin-top:10px"><i class="ph ph-steering-wheel"></i>Your turns: ${yours.length ? joinNames(yours.map(t => t.d)) + (run.more ? ', then the same order' : '') : 'none'}</div>
    <div class="fact"><i class="ph ph-clock"></i>${run.pick}</div>
    <div class="fact"><i class="ph ph-calendar-check"></i>Every turn is on both families’ calendars · Dana has it too</div>
    <div class="fact"><i class="ph ph-arrows-left-right"></i>Can’t drive a turn? Tell me and I’ll ask ${partner.ask} to swap</div></div>`);
  p.set(`${run.title}`, { when:turns[0].d.split(',')[0], done:true });
  await p.chips(['Done']);
}
X.flows.carpool = async p => {
  await p.say('Happy to set up a carpool. Is it one ride, or the same ride every week?', 800);
  const kind = await cpKind(p), once = kind === 'once';
  sub(p, once ? 'Carpool · one time' : 'Carpool · regular');
  const w = await cpWhen(p, kind), kids = w.kids, riders = joinNames(kids.map(k => k.n));
  const from = await cpPlace(p, { kids, eyebrow:`Carpool · ${riders}`, title:'Pick up from?' });
  const to = await cpPlace(p, { kids, eyebrow:`Carpool · ${riders}`, title:'Drop off at?', not:from.k });
  const back = await cpWay(p, from, to, w.at);
  /* the activity decides who is "going the same way": the drop-off first, then the pickup, else the kid's school */
  const act = [to, from].find(x => ['soccer', 'school', 'camp'].includes(x.k))?.k || 'school';
  const actPlace = CP_PLACES.find(x => x.k === act), kid = kids.find(k => actPlace.kids.includes(k.n)) || kids[0];   // whose group chat to ask in
  const g = cpGroup(act, kid);
  let near = CP_NONE ? [] : act === 'school' && kid.n === 'Maya' ? [TEAM[0], TEAM[1], TEAM[3], TEAM[2]] : TEAM;
  const rides = once ? [] : cpDates(w.days, w.until);
  const whenTxt = once ? w.day.day : `${w.days.map(d => WDL[d] + 's').join(', ')} through ${w.until[1] === 28 ? cpDate(rides[rides.length - 1]) : w.until[0]}`;
  const route = `${cpSay(from)} to ${cpSay(to)}`, backTxt = back ? `, and back at ${tl(back)}` : '';
  p.title = once ? `Ride for ${riders} · ${w.day.short}` : `${riders}’s carpool · ${act === 'soccer' ? 'soccer' : act === 'camp' ? 'camp' : 'school'}`;
  p.set('Checking families nearby', { when:once ? w.day.short : 'Now' });
  const look = p.work('Checking families near home', g.look);
  await sleep(1300);
  if (near.length) look.done(`${near.length} families nearby ${cpIn(g)}`, 'Closest to home first', 'ph-users-three');
  else look.done(`No families near home ${cpIn(g)}`, 'I check again when new families join', 'ph-users-three');
  if (!once) return cpRegular(p, { w, kids, riders, from, to, back, g, near, rides, whenTxt, route, act, kid });
  /* in the team chat Tony posts it himself. Ahmad, 22 Nov: a picked parent is on Sprout too, so the ask goes to a
     Sprout DM from Tony, with the ride card, not a group text ("it just make us easy... to track everything"). */
  const text = f => f
    ? (once
      ? `Hi ${f.ask}! Could you take ${riders} from ${route} on ${w.day.day} at ${tl(w.at)}${backTxt}? We’re on Banks Court. Happy to return the favor! Tony`
      : `Hi ${f.ask}! Want to share ${riders}’s rides from ${route}? ${whenTxt}, pickup at ${tl(w.at)}${back ? `, back at ${tl(back)}` : ', one way'}. We’d take turns driving. Tony`)
    : (once
      ? `Hi everyone! Could anyone near us take ${riders} from ${route} on ${w.day.day} at ${tl(w.at)}${backTxt}? We’re on Banks Court. Happy to return the favor! Tony`
      : `Hi everyone! Want to share ${riders}’s rides from ${route}? ${whenTxt}, pickup at ${tl(w.at)}${back ? `, back at ${tl(back)}` : ', one way'}. We’d take turns driving. Tony`);
  let sent;
  if (near.length) {
    await p.say(`${near[0].ask} and ${near[1].ask} live closest, and their kids ${act === 'soccer' ? 'play on Jake’s team' : act === 'camp' ? 'are at Pinecrest' : 'go to Lincoln'} too. Should I post in ${g.chat}, or ask parents you pick?`, 900);
    sent = await cpSend(p, g, near, text, { kid });
  } else {
    const pick = await cpNobody(p, g, kid);
    if (pick === 'group') {   // the whole class sees it; the closest class families are the ones who answer
      near = cpRoster(kid, []).slice(0, 3); sent = { mode:'group', picks:[], text:text(null) };
      p.block(`<div class="preview gtx"><small>${face(TONY, 18)}You in ${g.chat}</small><p></p></div>`).querySelector('p').textContent = sent.text;
    } else { near = pick; sent = await cpSend(p, g, near, text, { kid, mode:'pick' }); }
  }
  const group = sent.mode === 'group', asked = group ? near : sent.picks, names = joinNames(asked.map(f => f.ask));
  const via = asked.every(f => f.invite) ? 'By text' : asked.some(f => f.invite) ? 'In Sprout or by text' : 'In Sprout';
  const job = p.work(group ? `Posting in ${g.chat}` : `Messaging ${names}`, group ? g.size : asked.length > 1 ? (via === 'In Sprout' ? 'In Sprout · a DM with each family' : `${via} · one to each family`) : asked[0].invite ? 'By text · with a link to say yes' : `In Sprout · your DM with ${asked[0].ask}`);
  await sleep(1100);
  job.done(group ? `Posted in ${g.chat}` : `Asked ${names}`, once ? 'First yes drives · I tell the others' : 'Everyone who says yes gets turns', 'ph-paper-plane-tilt');
  const waiting = group ? `Waiting for replies in ${g.chat}` : `Waiting for ${names}`;
  p.set(waiting, { when:once ? w.day.short : 'Now' });

  if (once) {
    /* first yes drives; in the group chat only the yes comes back */
    let yes = null;
    const order = group ? asked.filter(f => !f.cant) : asked;
    const live = link ? order[0] : null, offWords = live ? liveWords(p, live, group ? `in ${g.chat}` : 'in Sprout') : () => {};
    if (live) {
      const slots = [-30, 15, 30, 45].map(d => w.at + d).filter(m => m >= 360 && m <= 1320).map(m => ({ m, l:tl(m) }));
      liveAsk(live, { kind:group ? 'chat' : 'dm', who:{ n:live.n, ask:live.ask, kid:live.kid, photo:live.photo }, label:`${live.ask}, ${live.rel}`,
        sub:group ? `Gets a push, opens ${g.chat}, sees the ride card.` : 'Gets Tony’s ask in their Sprout DM, with the ride card.',
        chat:g.chat, size:g.size, act, riders, text:sent.text, at:{ m:w.at, l:tl(w.at) }, day:w.day.day, back:back ? tl(back) : null,
        from:cpThere(from), to:cpThere(to), pickAddr:from.k === 'home' ? '10212 Banks Court' : cpShort(from), dist:`${live.mi} mi from you · ${g.doing(live)}`, slots });
    }
    for (const [i, f] of order.entries()) {
      let ans = null;
      if (f === live) {
        ans = await liveWait(p, { status:waiting, small:`${w.day.day} · ${tl(w.at)}`, types:['yes', 'offer', 'no'] });
        X.notify(p, group ? `${f.ask} replied in ${g.chat}` : `${f.ask} replied`, ans.t === 'yes' ? `I can take ${riders}!` : ans.t === 'no' ? 'Can’t this time' : 'Could drive at another time');
        if (ans.text) liveHeard(p, f, group ? `in ${g.chat}` : 'in Sprout', ans.text);
      }
      const cant = ans ? ans.t === 'no' : f.cant;
      if (ans && cant) LIVE.no = true;
      const offer = ans ? (ans.t === 'offer' ? ans.times : null) : f.offer && f.offer.map(m => w.at + m);
      if (!ans) await later(p, { status:waiting, small:`${w.day.day} · ${tl(w.at)}`, ms:i ? 1500 : 2500, title:group ? `${f.ask} replied in ${g.chat}` : `${f.ask} replied`,
        body:f.cant ? 'Can’t this time' : offer ? `Can’t at ${tl(w.at)}, could drive at ${joinNames(offer.map(tl)).replace(' and ', ' or ')}` : `I can take ${riders}!` });
      /* Ahmad, 21 Nov: a "can't" at the asked time can come with times they could drive. The ride card shows both and
         Tony moves the pickup to fit, or keeps his time and Sprout asks the next family. */
      if (offer) {
        const asked0 = w.at;
        const c = p.block(`<div class="card"><div class="ctop">${illIco('carpool')}<div><div class="eyebrow">Ride for ${riders} · ${w.day.day}</div><div class="ttl">${f.ask} can’t at ${tl(asked0)}</div></div></div>
          <div class="ua-row on" style="margin-top:12px">${face({ n:f.ask, photo:f.photo })}<span class="tx"><b>${f.n}</b><small>Could drive at ${joinNames(offer.map(tl)).replace(' and ', ' or ')}</small></span><span class="ck"><i class="ph-bold ph-clock"></i></span></div>
          <div class="fact" style="margin-top:10px"><i class="ph ph-clock"></i><span><s>${tl(asked0)}</s> · your pickup time</span></div>
          <div class="fact"><i class="ph ph-arrow-right"></i>${cpShort(from)} to ${cpShort(to)}</div></div>`).querySelector('.card');
        p.set(`${f.ask} could drive at ${tl(offer[0])}`, { when:w.day.short, attn:true });
        await p.say(`${f.ask} can’t at ${tl(asked0)}, but could drive at ${joinNames(offer.map(tl)).replace(' and ', ' or ')}. Move the pickup?`, 800);
        const k = await p.chips([...offer.map(m => `Pick up at ${tl(m)}`), `Keep ${tl(asked0)}, ask others`], { into:c });
        if (k < offer.length) {
          w.at = offer[k];
          c.querySelector('.fact span').innerHTML = `<s>${tl(asked0)}</s> → ${tl(w.at)} · pickup moved`;
          if (ans) link.send({ t:'moved', at:{ m:w.at, l:tl(w.at) } });
          yes = f; break;
        }
        if (ans) link.send({ t:'kept' });
        p.note(`Kept ${tl(asked0)}`, `Asking the next family`, 'ph-arrow-right');
        continue;
      }
      if (!cant) { yes = f; break; }
      p.note(`${f.ask} can’t this time`, group ? `Said no in ${g.chat}` : 'Said no in Sprout', 'ph-x-circle');
    }
    if (!yes) {
      await p.say(`${names} can’t this time. Want me to post in ${g.chat}?`, 800);
      const k = await p.chips([`Post in ${g.chat}`, 'Not now']);
      if (k === 1) { p.set('No ride yet', { done:true }); await p.say('Okay. The ride stays on your calendar so you can plan for it.', 700); return; }
      const j2 = p.work(`Posting in ${g.chat}`, g.size); await sleep(1000); j2.done(`Posted in ${g.chat}`, 'First yes drives', 'ph-paper-plane-tilt');
      yes = near.find(f => !f.cant && !asked.includes(f)) || near[0];
      await later(p, { status:`Waiting for replies in ${g.chat}`, small:`${w.day.day} · ${tl(w.at)}`, ms:2200, title:`${yes.ask} replied in ${g.chat}`, body:`I can take ${riders}!` });
    }
    const tell = p.work(`Telling ${yes.ask} it’s set`, group ? `In ${g.chat} · your address shared` : `In your Sprout DM with ${yes.ask} · your address shared`);
    await sleep(900);
    tell.done(`${yes.ask} · ride set`, `${w.day.day} · ${tl(w.at)}${back ? ` and ${tl(back)}` : ''}`, 'ph-car-profile');
    offWords();
    if (live && !LIVE.no) link.send(yes === live ? { t:'set', at:{ m:w.at, l:tl(w.at) } } : { t:'covered', by:yes.ask, riders,
      text:group ? null : `Hi! We’re all set now: ${yes.ask} is taking ${riders} on ${w.day.day}. Thank you so much for checking! Sprout, for Tony` });
    const othersF = group ? [] : asked.filter(f => f !== yes && !f.cant), others = othersF.map(f => f.ask);
    const othersVia = othersF.every(f => f.invite) ? 'by text' : othersF.some(f => f.invite) ? 'in Sprout or by text' : 'in Sprout';
    if (group) p.note(`Posted “${yes.ask} has it, thanks!” in ${g.chat}`, 'So nobody else offers', 'ph-chat-circle-text');
    else if (others.length) {
      p.note(`Told ${joinNames(others)} you found a ride`, `Sent ${othersVia}`, 'ph-paper-plane-tilt');
      p.block(`<div class="preview gtx"><small>To ${joinNames(others)} · ${othersVia} · from Sprout</small><p></p></div>`).querySelector('p').textContent =
        `Hi! We’re all set now: ${yes.ask} is taking ${riders} on ${w.day.day}. Thank you so much for checking! Sprout, for Tony`;
    }
    await p.say(`${yes.ask} can pick up ${riders}. It’s on both families’ calendars, and Dana has it too.`, 900);
    const done = p.block(`<div class="card"><div class="ctop">${illIco('carpool')}<div><div class="eyebrow">Carpool · ${w.day.day}</div><div class="ttl">${yes.ask} drives ${riders}</div></div></div>
      <div class="ua-row on" style="margin-top:12px">${face({ n:yes.ask, photo:yes.photo })}<span class="tx"><b>${yes.n}</b><small>${yes.rel} · ${yes.mi} mi from home</small></span><span class="ck"><i class="ph-bold ph-check"></i></span></div>
      <div class="fact" style="margin-top:10px"><i class="ph ph-arrow-right"></i>${tl(w.at)} · ${cpShort(from)} to ${cpShort(to)}</div>
      ${back ? `<div class="fact"><i class="ph ph-arrow-left"></i>${tl(back)} · back to ${cpShort(from)}</div>` : ''}
      <div class="fact"><i class="ph ph-calendar-check"></i>On both families’ calendars · Dana has it too</div>
      <div class="fact"><i class="ph ph-bell-ringing"></i>Reminder for you and ${yes.ask} at ${ampm(w.at - 30)}</div></div>`).querySelector('.card');
    p.set(`${yes.ask} drives ${riders} · ${w.day.short} ${tl(w.at)}`, { when:w.day.short, done:true });
    for (;;) {
      done.querySelector('.chips')?.remove();
      const k = await p.chips([`Message ${yes.ask}`, 'Done'], { into:done, echo:false });
      if (k === 1) { p.me('Done'); break; }
      await carpoolDM(yes, group ? `Thanks so much, ${yes.ask}! Here’s our address: 10212 Banks Court. ${riders} will be ready at ${tl(w.at)}.` : text(yes), group ? 'See you then!' : `Happy to! ${yes.kid} is going anyway.`, `${yes.ask} is driving · ${w.day.day}`, g.near);
    }
    return;
  }

};

/* the other parent's DM with Tony in Sprout: header, log, a working composer */
function chatWithTony(label, onSend){
  const tony = { n:'Tony', photo:A + 'tony.webp' };
  const screen = classChat(label);
  const head = screen.querySelector('.jc-head'), log = screen.querySelector('.jc-log'), composer = screen.querySelector('.jc-composer');
  const header = '/sitter-class-chat/header.png';
  head.setAttribute('aria-label', 'Chat with Tony');
  head.style.cssText = 'aspect-ratio:auto;background:none';
  head.innerHTML = `<div style="aspect-ratio:393/48;overflow:hidden"><img src="${header}" alt="" style="width:100%;display:block"></div>
    <div style="position:relative;display:flex;align-items:center;gap:8px;height:60px;padding-left:60px">
      <span style="position:absolute;inset:0 auto 0 0;width:60px;background:url(${header}) 0 -48px/393px auto no-repeat"></span>
      ${face(tony, 36)}<div class="htitle"><b>Tony</b></div></div>`;
  composer.removeAttribute('role'); composer.removeAttribute('aria-label');
  const form = el(`<form><input aria-label="Type message" autocomplete="off" style="position:absolute;left:15.3%;top:15.7%;width:69.5%;height:34.3%;padding:0 10px;border:0;border-radius:12px;background:transparent;color:var(--strong);font:13px var(--sans)">
    <button type="submit" aria-label="Send message" style="position:absolute;left:86.5%;top:15.7%;width:10%;height:36%;border-radius:50%"></button></form>`);
  composer.append(form);
  const message = form.querySelector('input');
  const paint = () => { message.style.background = message.value || document.activeElement === message ? 'var(--field)' : 'transparent'; };
  message.onfocus = message.onblur = paint;
  const add = node => { log.append(node); log.scrollTop = log.scrollHeight; };
  form.onsubmit = e => {
    e.preventDefault();
    const text = message.value.trim();
    if (!text) return;
    add(classMessage({ n:'Me' }, text, true)); message.value = ''; message.blur();
    onSend?.(text);
  };
  return { tony, screen, log, message, add, fromTony: text => add(classMessage(tony, text)) };
}
/* Ahmad, 22 Nov: the linked version (?link=). Her phone sits on the lock screen until Tony's invite arrives, with his
   kids, time, place and the parent he picked; her taps go back to his phone, and his answer comes back to her card.
   No template replies on either side: only words someone typed show as a message. */
function playdateInboxLinked(){
  let inv = null, card = null, chat = null, lock = null;
  const showLock = () => { lock = el(`<div class="lock" aria-label="Lock screen"><div class="ldate">Monday, July 27</div><div class="ltime">9:41</div></div>`); $('#phone').appendChild(lock); };
  showLock();
  const wIn = x => ({ day:DAYS[x.d], from:x.from, to:x.to });
  const wOut = w => ({ d:DAYS.indexOf(w.day), from:w.from, to:w.to });
  const whenHtml = (now, was) => `<i class="ph ph-clock"></i><span>${was ? `<s>${playdateWhen(was)}</s><br>` : ''}${playdateWhen(now)}</span>`;
  const answer = (state, html) => { card.querySelector('[data-a]').className = state; card.querySelector('[data-a]').innerHTML = html; };
  const ask = () => {
    answer('chips', '<button type="button" class="chip" data-confirm>Confirm</button><button type="button" class="chip" data-suggest>Suggest another time</button><button type="button" class="chip" data-cant>Can’t make it</button><button type="button" class="chip" data-reply>Reply</button>');
    card.querySelector('[data-confirm]').onclick = () => {
      answer('foot ok', '<i class="ph ph-check-circle"></i>You confirmed · on your calendar');
      link.send({ t:'confirm' });
    };
    card.querySelector('[data-suggest]').onclick = async () => {
      const s = await suggestPlaydateTime(inv.w);
      if (!s) return;
      card.querySelector('[data-when]').innerHTML = whenHtml(s, inv.w);
      answer('pd-state wait', '<span class="spinner"></span>You suggested a new time · waiting on Tony');
      inv.w = s;
      link.send({ t:'suggest', w:wOut(s) });
    };
    card.querySelector('[data-cant]').onclick = () => {
      answer('foot', '<i class="ph ph-x-circle"></i>You said you can’t · Tony sees it');
      link.send({ t:'cant' });
    };
    card.querySelector('[data-reply]').onclick = () => chat.message.focus();
  };
  const open = () => {
    const f = inv.family;
    chat = chatWithTony(`${f.reply}’s messages with Tony`, text => link.send({ t:'text', text }));
    card = el(`<div class="card" style="margin:0 0 16px 48px"><div class="ctop">${clay('calendar-check')}<div>
      <div class="eyebrow">Playdate</div><div class="ttl">${joinNames([...inv.kidNames.split(/, | and /), f.kid])}</div></div></div>
      <div class="fact" data-when>${whenHtml(inv.w)}</div>
      <div class="fact"><i class="ph ph-map-pin"></i>${playdateEscape(inv.place)}</div>
      ${inv.pickup ? `<div class="fact"><i class="ph ph-car-profile"></i>Tony does pickup and drop-off for ${f.kid}</div>` : ''}
      <div data-a></div></div>`);
    chat.fromTony(playdateInvite(inv.w, inv.kidNames, f, inv.place, inv.pickup));
    chat.add(card);
    ask();
  };
  link.on(m => {
    /* a new invite to someone else (the first family said no and Tony asked the next): this becomes their phone */
    if (m.t === 'invite' && inv && inv.family.n !== m.family.n) { chat?.screen.remove(); lock?.remove(); inv = card = chat = null; showLock(); }
    if (m.t === 'invite' && !inv) {
      inv = { ...m, w:wIn(m.w) };
      const lock0 = lock;
      const note = el(pushNote({ title:'Tony', sub:'Playdate invite', body:`Would ${playdateEscape(inv.family.kid)} like to play with ${playdateEscape(inv.kidNames)} on ${playdateWhen(inv.w)}?`, photo:A + 'tony.webp', tag:'div' }));
      lock0.append(note);
      let opened = false;
      const go = () => { if (opened || lock0 !== lock) return; opened = true; lock0.classList.add('gone'); setTimeout(() => lock0.remove(), 380); open(); };
      note.onclick = go;
      setTimeout(go, 2600);   // opens by itself, like the other rows on /other-side/
    }
    if (!card) return;
    if (m.t === 'accepted') {
      card.querySelector('[data-when]').innerHTML = whenHtml(inv.w);
      answer('foot ok', '<i class="ph ph-check-circle"></i>Tony accepted your time · on your calendar');
    }
    if (m.t === 'counter') {
      const was = inv.w; inv.w = wIn(m.w);
      card.querySelector('[data-when]').innerHTML = whenHtml(inv.w, was);
      ask();
    }
    if (m.t === 'tony-text') chat.fromTony(m.text);
  });
  link.send({ t:'hello' });   // if Tony already sent it (this phone was reloaded), he sends it again
}
function playdateInbox(){
  const tony = { n:'Tony', photo:A + 'tony.webp' };
  const w = { day:DAYS.find(d => d.w === 'Sat'), from:840, to:960 };
  const screen = classChat('Ana’s messages with Tony');
  const head = screen.querySelector('.jc-head'), log = screen.querySelector('.jc-log'), composer = screen.querySelector('.jc-composer');
  const header = '/sitter-class-chat/header.png';
  head.setAttribute('aria-label', 'Chat with Tony');
  head.style.cssText = 'aspect-ratio:auto;background:none';
  head.innerHTML = `<div style="aspect-ratio:393/48;overflow:hidden"><img src="${header}" alt="" style="width:100%;display:block"></div>
    <div style="position:relative;display:flex;align-items:center;gap:8px;height:60px;padding-left:60px">
      <span style="position:absolute;inset:0 auto 0 0;width:60px;background:url(${header}) 0 -48px/393px auto no-repeat"></span>
      ${face(tony, 36)}<div class="htitle"><b>Tony</b></div></div>`;
  composer.removeAttribute('role'); composer.removeAttribute('aria-label');
  const form = el(`<form><input aria-label="Type message" autocomplete="off" style="position:absolute;left:15.3%;top:15.7%;width:69.5%;height:34.3%;padding:0 10px;border:0;border-radius:12px;background:transparent;color:var(--strong);font:13px var(--sans)">
    <button type="submit" aria-label="Send message" style="position:absolute;left:86.5%;top:15.7%;width:10%;height:36%;border-radius:50%"></button></form>`);
  composer.append(form);
  const message = form.querySelector('input');
  const paintComposer = () => { message.style.background = message.value || document.activeElement === message ? 'var(--field)' : 'transparent'; };
  message.onfocus = message.onblur = paintComposer;
  const addReply = text => { log.append(classMessage({ n:'Ana' }, text, true)); log.scrollTop = log.scrollHeight; };
  form.onsubmit = e => {
    e.preventDefault();
    const text = message.value.trim();
    if (text) { addReply(text); message.value = ''; message.blur(); }
  };
  const invitation = el(`<div class="card" style="margin:0 0 16px 48px"><div class="ctop">${clay('calendar-check')}<div>
    <div class="eyebrow">Playdate</div><div class="ttl">Maya and Lily</div></div></div>
    <div class="fact" data-when><i class="ph ph-clock"></i>${playdateWhen(w)}</div>
    <div class="fact"><i class="ph ph-map-pin"></i>${playdateEscape(FAMILY.address)}</div>
    <div class="chips"><button type="button" class="chip" data-confirm>Confirm</button><button type="button" class="chip" data-suggest>Suggest another time</button><button type="button" class="chip" data-cant>Can’t make it</button><button type="button" class="chip" data-reply>Reply</button></div></div>`);
  const actions = invitation.querySelector('.chips');
  invitation.querySelector('[data-confirm]').onclick = () => {
    actions.replaceWith(el('<div class="foot ok"><i class="ph ph-check-circle"></i>You confirmed · on your calendar</div>'));
  };
  invitation.querySelector('[data-suggest]').onclick = async () => {
    const suggested = await suggestPlaydateTime(w);
    if (!suggested) return;
    /* P3: the same card shows the change on this side too, and who it's waiting on now */
    invitation.querySelector('[data-when]').innerHTML = `<i class="ph ph-clock"></i><span><s>${playdateWhen(w)}</s><br>${playdateWhen(suggested)}</span>`;
    actions.replaceWith(el('<div class="pd-state wait"><span class="spinner"></span>You suggested a new time · waiting on Tony</div>'));
    addReply(`Could we do ${suggested.day.day}, ${range(suggested.from, suggested.to)} instead?`);
  };
  invitation.querySelector('[data-cant]').onclick = () => {   // N4: the third answer, Tony sees it and Sprout offers another family
    actions.replaceWith(el('<div class="foot"><i class="ph ph-x-circle"></i>You said you can’t · Tony sees it</div>'));
    addReply('So sorry, we can’t make it this time! Another weekend?');
  };
  invitation.querySelector('[data-reply]').onclick = () => message.focus();
  log.append(classMessage(tony, playdateInvite(w, KIDS[0].n, PLAYDATE_FAMILIES.Maya[0], FAMILY.address)), invitation);
}
if (route === 'playdate-invite') { if (link) playdateInboxLinked(); else playdateInbox(); }

/* ======================= Class event ======================= */
function classEventTitles(place){
  const venue = {
    'mcdonalds-lenteng-agung':'McDonald’s',
    'habitat-park-scbd':'Habitat Park'
  }[place.key] || place.name.split(' · ')[0];
  const activities = {
    'zilker-park':['Class Picnic', 'Class Games'],
    'austin-zoo':['Class Zoo Day', 'Class Picnic'],
    'habitat-park-scbd':['Class Nature Day', 'Class Animal Adventure']
  }[place.key] || [
    [], ['Class Lunch', 'Class Snack Break'], ['Class Play Day', 'Class Activity Day'],
    ['Class Discovery Day', 'Class Field Trip'], ['Class Play Day', 'Outdoor Class Meetup']
  ][place.types[0]];
  return [...activities, 'Class Meetup'].map(activity => `${activity} at ${venue}`);
}

X.flows.classEvent = async (p, { covers, coverCard }) => {
  sub(p, 'Class event');
  p.title = 'Class event';
  const classes = KIDS.map(kid => kid.cls);
  const chooseClass = async () => {
    await p.say('Which class should I invite?', 700);
    return classes[await p.chips(classes)];
  };
  const chooseTitle = async place => {
    const titles = classEventTitles(place);
    await p.say('Which title should I use?', 650);
    for (;;) {
      const choice = await p.chips([...titles.map(playdateEscape), 'Write my own'], { echo:false });
      if (choice < titles.length) {
        p.me(playdateEscape(titles[choice]));
        return titles[choice];
      }
      const custom = await editFields('Event title', [['Title', '']], {
        requiredMessage:'Enter an event title'
      });
      if (custom) {
        p.me(playdateEscape(custom[0]));
        return custom[0];
      }
    }
  };

  let audience = await chooseClass();
  let when = await whenCard(p, { mode:'class-event', preset:{ w:'Fri', from:900, to:960 } });
  let venue = await findPartyVenue(p, when, 1, { classEvent:true });
  if (!venue) {
    await p.say('Draft canceled.', 600);
    p.set('Draft canceled', { done:true });
    return;
  }

  let name = await chooseTitle(venue.place);
  let cover = partyPhoto(venue.place);
  const renderInvite = () => {
    const { place } = venue;
    return eventInviteBody({
      cover, title:playdateEscape(name), coverLabel:'Class event cover', place, editable:true,
      date:when.day.long, time:`${range(when.from, when.to)}${when.to >= 1440 ? ' next day' : ''}`,
      locationUrl:mapSearch(venueMapQuery(place)), rows:[['ph-users', audience, 'class']],
      footer:'<button type="button" class="btn" data-send-invites>Send invite</button>'
    });
  };
  const updatePlan = () => {
    const title = playdateEscape(name);
    sub(p, name);
    p.title = title;
    p.set('Ready to invite', { when:when.day.short });
  };
  updatePlan();
  const card = p.block(renderInvite()).querySelector('.event-invite');
  const editors = {
    async title(){
      const result = await editFields('Event title', [['Title', playdateEscape(name)]], { requiredMessage:'Enter an event title' });
      if (result) name = result[0];
    },
    async location(){
      const revised = await editClassVenue(when, venue);
      if (!revised) return;
      if (cover === partyPhoto(venue.place)) cover = partyPhoto(revised.place);
      venue = revised;
    },
    async cover(){
      cover = await inSheet(sp => coverCard(sp, {
        eyebrow:'Event cover', title:playdateEscape(name), set:[partyPhoto(venue.place), ...covers], current:cover
      }), 'Change cover') || cover;
    },
    async time(){
      when = await inSheet(sp => whenCard(sp, {
        mode:'class-event', preset:{ w:when.day.w, from:when.from, to:when.to }
      }), 'Change the time') || when;
    },
    async class(){
      audience = await editEventClass(classes, audience) || audience;
    }
  };
  await new Promise(resolve => {
    let editing = false;
    card.onclick = async event => {
      if (editing) return;
      const button = event.target.closest('button');
      if (!button) return;
      if (button.hasAttribute('data-send-invites')) {
        card.onclick = null;
        card.querySelectorAll('button').forEach(control => control.remove());
        p.me(button.textContent);
        resolve();
        return;
      }
      const field = button.dataset.editEvent;
      if (!field) return;
      editing = true;
      try {
        await editors[field]();
        card.replaceChildren(...el(renderInvite()).childNodes);
        updatePlan();
        card.querySelector(`[data-edit-event="${field}"]`).focus({ preventScroll:true });
      } finally {
        editing = false;
      }
    };
  });

  p.receipt(`Invited ${audience}`);
  p.set('Waiting for RSVPs', { when:when.day.short });
  await p.chips(['Done']);
  X.closeSheet();
};

function editEventClass(classes, current){
  return new Promise(resolve => {
    const sheet = bsheet({
      onBack:() => resolve(null),
      body:`<div class="bh"><span class="icotile"><i class="ph ph-users"></i></span><b>Change class</b></div>
        <div class="chips">${classes.map((name, i) => `<button type="button" class="chip${name === current ? ' sel' : ''}" data-class="${i}" aria-pressed="${name === current}">${name}</button>`).join('')}</div>`
    });
    sheet.body.querySelectorAll('[data-class]').forEach(button => button.onclick = () => {
      sheet.close();
      resolve(classes[+button.dataset.class]);
    });
  });
}

/* ======================= J8 · Plan a birthday ======================= */
const BIRTHDAY_PLACES = [{ key:'park', name:'Zilker Park', detail:'Zilker Park, Austin' }, { key:'home', name:'Our place', detail:'Our place' }];
/* L6 (Tony, 19 Nov): three kinds of place, not five. "Birthday friendly venues, parks and playgrounds, or restaurant."
   Hands-on fun and active play fold into venues, outdoors into parks. types[] below index into this list. */
const PARTY_STYLES = [
  { label:'Birthday-friendly venues', short:'Party venues', one:'Party venue', search:'kids birthday party venues', icon:'confetti' },
  { label:'Parks and playgrounds', short:'Parks', one:'Park', search:'parks and playgrounds for kids birthday parties', icon:'tree' },
  { label:'Restaurants', short:'Restaurants', one:'Restaurant', search:'family friendly restaurants for kids birthday', icon:'fork-knife' },
];
const PARTY_VENUES = [
  { key:'chuck-e-cheese', name:'Chuck E. Cheese · South Austin', detail:'9811 S I-35, Austin, TX', coords:[30.16267,-97.78759], types:[0,2],
    facilities:'Arcade games, prize counter and birthday show.', food:'Pizza and soft drinks. Food inclusions depend on the party package.',
    menu:'https://www.chuckecheese.com/austin-south/food/menu/', website:'https://www.chuckecheese.com/austin-south/birthday-parties/?locselect=true' },
  { key:'little-gym', name:'The Little Gym · Austin South', detail:'2716 W William Cannon Dr, Austin, TX', coords:[30.20745,-97.81564], types:[0],
    facilities:'Private gym with instructor-led games. Setup and cleanup are included.',
    food:'Ask the venue about food and available add-ons.',
    website:'https://www.thelittlegym.com/texas-austin-south/kids-birthday-parties/' },
  { key:'westgate', name:'Bouldering Project · Westgate', detail:'4477 S Lamar Blvd, Suite 600, Austin, TX', coords:[30.231,-97.796], types:[0],
    facilities:'Private climbing parties with staff support. The Boulder package includes instructor-led games.',
    food:'Cake and pizza are outside the packages.', schedule:'Published party starts: Sat and Sun at 10 AM, 1 PM and 4 PM. Book at least 21 days ahead.',
    website:'https://boulderingproject.com/birthday-parties-atx/' },
  { key:'thinkery', name:'Thinkery', detail:'1830 Simond Ave, Austin, TX', coords:[30.29777,-97.70554], types:[0],
    facilities:'Hands-on museum exhibits and indoor or outdoor party spaces.',
    food:'Bring snacks and cake or arrange delivery. There is no venue food service.',
    website:'https://thinkeryaustin.org/birthday-parties-at-thinkery/' },
  { key:'austin-zoo', name:'Austin Zoo', detail:'10808 Rawhide Trail, Austin, TX', coords:[30.25782,-97.93688], types:[1],
    facilities:'Outdoor picnic tables and private party spaces on zoo grounds.',
    food:'Bring your own food. Check the venue’s rules for the space you choose.',
    website:'https://austinzoo.org/parties/' },
  { key:'mcdonalds-lenteng-agung', name:'McDonald’s Lenteng Agung', detail:'Jl. Raya Lenteng Agung No. 12, Jakarta Selatan', coords:[-6.331542,106.835842], types:[2,0],
    facilities:'Dedicated party room with birthday packages.',
    food:'Happy Meals, burgers and fried chicken. Ask the branch which meals are included in the party package.',
    menu:'https://www.mcdonalds.co.id/menu/', website:'https://www.mcdonalds.co.id/locations' },
  { key:'kidzooona-tanjung-barat', name:'kidzooona · AEON Mall Tanjung Barat', detail:'Jl. Raya Tanjung Barat No. 163, Jakarta Selatan', coords:[-6.305636,106.840534], types:[0],
    facilities:'Indoor pretend-play areas, slides and a ball pit.',
    food:'Ask the branch about food and cake for parties.',
    schedule:'Contact the branch to confirm group and birthday options.',
    website:'https://www.aeonfantasy.co.id/en/store/' },
  { key:'playparq-kemang', name:'PlayParq Kemang', detail:'Jl. Kemang Timur Raya No. 72, Jakarta Selatan', coords:[-6.263011,106.823777], types:[1,0],
    facilities:'Outdoor playground with a treehouse, trampolines and water play.',
    food:'Birthday packages include a buffet. The café serves Indonesian, Chinese and Western dishes.',
    schedule:'The venue lists a party minimum of 30 children and 20 adults.',
    website:'https://playparq.com/kemang/' },
  { key:'habitat-park-scbd', name:'Habitat Park SCBD', detail:'SCBD Park Lot 6, Jl. Jend. Sudirman, Jakarta Selatan', coords:[-6.226215,106.809350], types:[1],
    facilities:'Outdoor animal park and hands-on activities for birthday groups.',
    food:'Saola Restaurant and Kori Dessert House are on site. Ask what is included in the party package.',
    website:'https://habitat.id/event-activities/birthday/' },
  /* L6: parks and family restaurants near South Austin. Zilker uses the class-event photo; Casa Verde and Rosie's are
     the prototype's made-up date-night places (AI photos), standing in for family restaurants. */
  { key:'zilker-park', name:'Zilker Park', detail:'2100 Barton Springs Rd, Austin, TX', coords:[30.26768,-97.76661], types:[1],
    facilities:'Open lawns, a playground and picnic tables. Big groups can reserve a picnic area with the city.',
    food:'Bring your own. Food trucks park along Barton Springs Rd.', website:'https://www.austintexas.gov/parks/locations/zilker-metropolitan-park' },
  { key:'casa-verde', name:'Casa Verde', detail:'Sample place · South Austin', coords:[30.2135,-97.8292], types:[2], photo:'dn/casa-1.jpg',
    facilities:'Garden patio with long tables for groups and a small play corner.', food:'Tacos, quesadillas and kids plates. Call ahead for 10 or more.' },
  { key:'rosies', name:'Rosie’s', detail:'Sample place · South Austin', coords:[30.1992,-97.8611], types:[2], photo:'dn/rosie-1.jpg',
    facilities:'Big shaded patio, picnic tables and lawn games.', food:'Smokehouse plates and kids meals. Group trays for parties.' },
];
const CLASS_EVENT_VENUES = PARTY_VENUES;   /* L6: Zilker Park now lives in PARTY_VENUES (Parks and playgrounds) */
const PARTY_HOME = { coords:[30.20,-97.83], area:'South Austin, TX', label:'South Austin' };
const PARTY_JAKARTA = { coords:[-6.31,106.85], area:'South Jakarta, Indonesia', label:'Jakarta' };
const birthdayTitle = kid => `${kid.n}’s ${kid.age + 1}th birthday party`;
const mapSearch = query => 'https://www.google.com/maps/search/?' + new URLSearchParams({ api:'1', query });
const mapDirections = destination => 'https://www.google.com/maps/dir/?' + new URLSearchParams({ api:'1', destination });
const external = (url, text, cls = 'link') => `<a class="${cls}" href="${playdateEscape(url)}" target="_blank" rel="noopener noreferrer">${text}</a>`;
const venueMapQuery = place => `${place.name.replace(' · ', ' ')} ${place.detail}`;

function partyLocation(){
  return new Promise(resolve => {
    if (!navigator.geolocation) { resolve(null); return; }
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      const coarseArea = [coords.latitude, coords.longitude].map(n => n.toFixed(2)).join(', ');
      resolve({ coords:[coords.latitude, coords.longitude], area:coarseArea, label:'your location' });
    }, () => resolve(null), { timeout:4500, maximumAge:60000 });
  });
}

function partyDistance([lat, lng], [venueLat, venueLng]){
  const rad = n => n * Math.PI / 180;
  const a = Math.sin(rad(venueLat - lat) / 2) ** 2
    + Math.cos(rad(lat)) * Math.cos(rad(venueLat)) * Math.sin(rad(venueLng - lng) / 2) ** 2;
  return 7917.5 * Math.asin(Math.min(1, Math.sqrt(a)));
}

function partyRanked(origin, styleIndex, places = PARTY_VENUES){
  return places.map(place => ({
    place, miles:partyDistance(origin.coords, place.coords), matches:place.types.includes(styleIndex)
  })).filter(v => v.miles <= 30)
    .sort((a, b) => Number(b.matches) - Number(a.matches) || a.miles - b.miles);
}

const partyPhoto = place => place.photo ? A + place.photo : `${A}party-venues/${place.key}.webp`;
const partyPhotoStyle = place => `background-image:url(${partyPhoto(place)})`;

function partyDetails(place, w, miles){
  return new Promise(resolve => {
    const sections = `${w || place.schedule || place.website ? `<section class="party-detail-section"><h3 class="bq">${w ? 'Availability' : 'Hours'}</h3>
        ${w ? `<div class="fact"><i class="ph ph-calendar-blank"></i>${w.day.day} · Starts at ${tl(w.from)}</div>` : ''}
        ${place.schedule ? `<p class="bp">${place.schedule}</p>` : ''}
        ${place.website ? external(place.website, w ? 'Check availability' : 'Website', 'link') : ''}</section>` : ''}
      <section class="party-detail-section"><h3 class="bq">Facilities</h3><p class="bp">${place.facilities}</p></section>
      <section class="party-detail-section"><h3 class="bq">Food &amp; drinks</h3><p class="bp">${place.food}</p>
        ${place.menu ? external(place.menu, 'See the menu', 'link') : ''}</section>`;
    const sheet = X.overlay({ title:'Venue details', body:`<article class="party-detail">
        <img class="bhero party-detail-photo" src="${partyPhoto(place)}" alt="${place.name}">
        <h2 class="btitle">${place.name}</h2>
        <div class="bsub">${place.kind || PARTY_STYLES[place.types[0]].label} · ${miles.toFixed(1)} mi away</div>
        ${external(mapDirections(place.detail), `<i class="ph ph-map-pin" aria-hidden="true"></i> ${place.detail}`)}
        ${sections}</article>`,
      foot:'<button type="button" class="btn" data-choose>Choose this place</button>' });
    sheet.o.querySelector('.wclose').onclick = () => { sheet.close(); resolve(null); };
    sheet.foot.querySelector('[data-choose]').onclick = () => { sheet.close(); resolve(place); };
  });
}

// The Sprout map uses the same draggable layer and photo pins as date night. Tile
// coordinates and venue pins share a Web Mercator projection.
function partyMap(map, origin, ranked, pick){
  const tileSize = 256, zoom = 12, world = tileSize * 2 ** zoom;
  const project = ([lat, lng]) => {
    const sin = Math.sin(lat * Math.PI / 180);
    return { x:world * (lng + 180) / 360, y:world * (.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) };
  };
  const home = project(origin.coords.map(n => Number(n.toFixed(2))));
  const pins = ranked.map(({ place }) => ({ place, xy:project(place.coords) }));
  const pts = [home, ...pins.map(pin => pin.xy)];
  const originTile = axis => Math.floor(Math.min(...pts.map(point => point[axis])) / tileSize) - 1;
  const left = originTile('x'), top = originTile('y');
  const extent = (axis, offset) => (Math.floor(Math.max(...pts.map(point => point[axis])) / tileSize) - offset + 2) * tileSize;
  const width = extent('x', left), height = extent('y', top);
  const layer = map.querySelector('.dnlayer'), tileHost = layer.querySelector('.party-map-tiles');
  const markers = new Map(), tiles = new Map();
  let camera = [0, 0];
  layer.style.width = width + 'px'; layer.style.height = height + 'px';
  const geoStyle = ({ x, y }) => `left:${x - left * tileSize}px;top:${y - top * tileSize}px`;
  layer.append(el(`<span class="dnhome" aria-label="Search center" style="${geoStyle(home)}"><i class="ph-fill ph-house"></i></span>`));
  pins.forEach(({ place, xy }) => {
    const pin = el(`<button type="button" class="dnpin" data-k="${place.key}" style="${geoStyle(xy)};${partyPhotoStyle(place)}" aria-label="${place.name}" aria-pressed="false" hidden></button>`);
    pin.onclick = () => pick(place.key);
    markers.set(place.key, pin); layer.append(pin);
  });
  function paintTiles(x, y){
    if (map.hidden || !map.clientWidth) return;
    camera = [x, y];
    const tx1 = Math.floor(-x / tileSize), tx2 = Math.ceil((-x + map.clientWidth) / tileSize);
    const ty1 = Math.floor(-y / tileSize), ty2 = Math.ceil((-y + map.clientHeight) / tileSize);
    for (let tx = tx1; tx < tx2; tx++) for (let ty = ty1; ty < ty2; ty++) {
      const key = `${tx}/${ty}`;
      if (tiles.has(key)) continue;
      const tile = document.createElement('img');
      tile.alt = '';
      tile.style.cssText = `left:${tx * tileSize}px;top:${ty * tileSize}px`;
      tile.src = `https://tile.openstreetmap.org/${zoom}/${tx + left}/${ty + top}.png`;
      tileHost.append(tile); tiles.set(key, tile);
    }
  }
  function move(x, y, instant = false){
    if (map.hidden || !map.clientWidth) return;
    x = Math.min(0, Math.max(map.clientWidth - width, x));
    y = Math.min(0, Math.max(map.clientHeight - height, y));
    paintTiles(x, y);
    layer.style.transition = instant ? 'none' : '';
    layer.style.transform = `translate(${x}px,${y}px)`;
  }
  const focus = (xy, instant = false) => move(map.clientWidth / 2 - xy.x + left * tileSize,
    map.clientHeight / 2 - xy.y + top * tileSize, instant);
  M.drag(map, { recenter:() => focus(home), onPan:paintTiles });
  map.onkeydown = e => {
    if (e.target !== map) return;
    const step = { ArrowLeft:[48, 0], ArrowRight:[-48, 0], ArrowUp:[0, 48], ArrowDown:[0, -48] }[e.key];
    if (!step) return;
    e.preventDefault();
    move(camera[0] + step[0], camera[1] + step[1]);
  };
  return {
    reveal(key){ markers.get(key).hidden = false; },
    select(key, instant = false){
      markers.forEach((pin, k) => {
        pin.classList.toggle('on', key === k);
        pin.setAttribute('aria-pressed', key === k);
        pin.querySelector('.lbl')?.remove();
        if (key === k) pin.append(el(`<span class="lbl">${pin.getAttribute('aria-label').split(' · ')[0]}</span>`));
      });
      const chosen = pins.find(pin => pin.place.key === key).xy;
      const dx = Math.abs(chosen.x - home.x), dy = Math.abs(chosen.y - home.y);
      focus(dx < map.clientWidth * .45 && dy < map.clientHeight * .45
        ? { x:(chosen.x + home.x) / 2, y:(chosen.y + home.y) / 2 } : chosen, instant);
    },
    resume(){ move(camera[0], camera[1], true); }
  };
}

/* 19 Nov (Ahmad): the one map for every place search (party venues, class events, date night restaurants).
   Compact header: area + one-line title, and a Google Maps icon button that swaps the map. cardHtml / wire let a flow
   draw its own cards (date night: price, rating, Menu, Website) on the same map. */
function partyResults(p, w, origin, ranked, { heading, search, currentKey, styleIndex = 0, areaSearch = false, cardHtml, wire, showAll = false, back = true }){
  const query = `${search} near ${origin.area}`;
  const venues = new Map(ranked.map(({ place }) => [place.key, place]));
  const visibleCount = showAll || ranked.findIndex(({ place }) => place.key === currentKey) >= 3 ? ranked.length : 3;
  return new Promise(resolve => {
    const card = p.block(`<div class="card party-results">
      <div class="ctop pr-head"><span class="icotile"><i class="ph ph-map-pin"></i></span><div class="pr-tx"><div class="eyebrow">${origin.label === 'your location' ? 'Near you' : origin.label}</div><div class="ttl">${heading}</div></div>
        <button type="button" class="pr-gmap" data-map aria-label="Open in Google Maps" title="Open in Google Maps"><i class="ph ph-arrow-up-right"></i></button></div>
      <div class="dnmap wide party-map" role="region" aria-label="Sprout map of ${heading.toLowerCase()}" tabindex="0">
        <div class="dnlayer"><div class="party-map-tiles" aria-hidden="true"></div></div>
        <button type="button" class="dnrecenter" aria-label="Recenter map"><i class="ph-bold ph-crosshair"></i></button>
        ${external('https://www.openstreetmap.org/copyright', '© OpenStreetMap', 'party-map-credit')}</div>
      <iframe class="dnmap wide" title="Google Maps" loading="lazy" referrerpolicy="no-referrer" hidden></iframe>
      <div class="dncar" data-party-places role="region" aria-label="Venue recommendations"></div>
      <div class="chips">
        ${ranked.length > visibleCount ? '<button type="button" class="chip" data-more>Show more places</button>' : ''}
        ${areaSearch ? '<button type="button" class="chip" data-area><i class="ph ph-magnifying-glass"></i> Another area</button>' : ''}
        ${external(mapSearch(query), 'Search Google Maps', 'chip')}
        ${back ? '<button type="button" class="chip" data-back>Back</button>' : ''}
      </div></div>`).querySelector('.party-results');
    const list = card.querySelector('[data-party-places]'), map = card.querySelector('.party-map');
    const google = card.querySelector('iframe'), mapButton = card.querySelector('[data-map]');
    let active = true, selected = venues.has(currentKey) ? currentKey : ranked[0].place.key, mapKey, scrollTimer;
    const mapUI = partyMap(map, origin, ranked, key => select(key, true));
    const syncGoogle = key => {
      const place = venues.get(key);
      const params = new URLSearchParams({
        q:venueMapQuery(place), ll:place.coords.join(','), z:'15', output:'embed'
      });
      const src = 'https://www.google.com/maps?' + params;
      if (google.getAttribute('src') === src) return;
      google.title = `Google Maps · ${place.name}`;
      google.src = src;
    };
    const select = (key, scroll = false, instant = false) => {
      selected = key;
      const tiles = [...list.children];
      tiles.forEach(tile => tile.classList.toggle('on', tile.dataset.k === key));
      if (!map.hidden) { mapUI.select(key, instant); mapKey = key; }
      else syncGoogle(key);
      if (!scroll) return;
      const tile = tiles.find(t => t.dataset.k === key), box = tile.getBoundingClientRect(), view = list.getBoundingClientRect();
      list.scrollTo({ left:list.scrollLeft + box.left - view.left + (box.width - view.width) / 2, behavior:'smooth' });
    };
    list.onscroll = () => {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        if (!active || !list.children.length) return;
        const view = list.getBoundingClientRect(), middle = view.left + view.width / 2;
        const distance = tile => { const box = tile.getBoundingClientRect(); return Math.abs(box.left + box.width / 2 - middle); };
        const nearest = [...list.children].reduce((a, b) => distance(a) < distance(b) ? a : b);
        if (nearest.dataset.k !== selected) select(nearest.dataset.k);
      }, 120);
    };
    const finish = place => {
      if (!active) return;
      active = false;
      list.querySelectorAll('button').forEach(b => b.disabled = true);
      card.querySelectorAll('[data-more],[data-back],.dnpin').forEach(b => { if (b.matches('.dnpin')) b.disabled = true; else b.remove(); });
      p.me(place ? `Choose ${place.name}` : 'Back'); resolve(place);
    };
    const append = venues => venues.forEach(({ place, miles }, i) => {
      if (cardHtml) {
        const tile = el(cardHtml(place, miles, !list.children.length && i === 0));
        wire(tile, place, { select:() => select(place.key, true), finish });
        list.append(tile); mapUI.reveal(place.key); return;
      }
      const style = PARTY_STYLES[place.types.includes(styleIndex) ? styleIndex : place.types[0]] || PARTY_STYLES[0];
      const tile = el(`<div class="card dn3" data-k="${place.key}">
        <div class="dn3img" role="img" aria-label="${place.name}" style="${partyPhotoStyle(place)}">${!list.children.length && i === 0 ? '<span class="dn3pick">My pick</span>' : ''}</div>
        <div class="dn3bd"><div class="dn3top"><b>${place.name}</b></div>
        <div class="dn3sub">${place.kind || style.one} · ${miles.toFixed(1)} mi away</div>
        <p class="dn3why">${place.facilities}</p>
        <div class="dn3cta"><button class="dn3link" data-details><i class="ph ph-info"></i>Details</button><button class="btn dn3go" data-choose>Choose</button></div>
        </div></div>`);
      tile.querySelector('[data-details]').onclick = async () => {
        select(place.key, true);
        const picked = await partyDetails(place, w, miles);
        if (picked) finish(picked);
      };
      tile.querySelector('[data-choose]').onclick = () => finish(place);
      list.append(tile);
      mapUI.reveal(place.key);
    });
    append(ranked.slice(0, visibleCount));
    requestAnimationFrame(() => { if (card.isConnected) select(selected, Boolean(currentKey), true); });
    mapButton.onclick = () => {
      const openGoogle = !map.hidden;
      map.hidden = openGoogle; google.hidden = !openGoogle;
      mapButton.innerHTML = `<i class="ph ${openGoogle ? 'ph-map-trifold' : 'ph-arrow-up-right'}"></i>`;
      mapButton.classList.toggle('on', openGoogle);
      mapButton.setAttribute('aria-label', openGoogle ? 'Back to the Sprout map' : 'Open in Google Maps'); mapButton.title = mapButton.getAttribute('aria-label');
      if (openGoogle) syncGoogle(selected);
      else if (mapKey !== selected) select(selected, false, true);
      else mapUI.resume();
    };
    const more = card.querySelector('[data-more]');
    if (more) more.onclick = () => { append(ranked.slice(3)); select(ranked[3].place.key, true); more.remove(); p.scroll(); };
    card.querySelector('[data-back]')?.addEventListener('click', () => finish(null));
    const areaBtn = card.querySelector('[data-area]');
    if (areaBtn) areaBtn.onclick = async () => { const a = await otherArea(); if (!a || !active) return; active = false; list.querySelectorAll('button').forEach(b => b.disabled = true); card.querySelectorAll('[data-more],[data-back],[data-area]').forEach(b => b.remove()); p.me(`Look around ${a.label}`); resolve({ area:a }); };
    if (p.chat) setTimeout(() => p.chat.scrollTo({ top:card.closest('.row').offsetTop - p.chat.offsetTop - 8, behavior:'smooth' }), 500);
  });
}

function editClassVenue(when, current){
  const areas = [PARTY_HOME, PARTY_JAKARTA];
  return new Promise(resolve => {
    const sheet = X.overlay({ title:'Edit location', body:`<div class="chips">
      ${areas.map((area, i) => `<button type="button" class="chip" data-area="${i}">${area.label}</button>`).join('')}
      <button type="button" class="chip" data-device>Use my location</button></div><div data-results></div>` });
    const results = sheet.body.querySelector('[data-results]');
    const areaButtons = [...sheet.body.querySelectorAll('[data-area], [data-device]')];
    const deviceButton = sheet.body.querySelector('[data-device]');
    let open = true;
    let version = 0;
    const finish = result => {
      if (!open) return;
      open = false;
      sheet.close();
      resolve(result);
    };
    sheet.o.querySelector('.wclose').onclick = () => finish(null);
    const show = (origin, ranked = partyRanked(origin, 1, CLASS_EVENT_VENUES)) => {
      const revision = ++version;
      const areaIndex = areas.indexOf(origin);
      areaButtons.forEach((button, i) => {
        const selected = i === areaIndex || (button === deviceButton && areaIndex === -1);
        button.classList.toggle('sel', selected);
        button.setAttribute('aria-pressed', selected);
      });
      const panel = { block:html => { results.innerHTML = html; return results; }, me(){}, scroll(){} };
      partyResults(panel, when, origin, ranked, {
        heading:'Event places', search:'family group event venues', currentKey:current.place.key, styleIndex:1
      }).then(place => {
        if (revision === version) finish(place ? { place, origin } : null);
      });
    };
    areaButtons.slice(0, areas.length).forEach((button, i) => button.onclick = () => show(areas[i]));
    deviceButton.onclick = async () => {
      const revision = version;
      deviceButton.disabled = true;
      const origin = await partyLocation();
      deviceButton.disabled = false;
      if (!open || revision !== version) return;
      const ranked = origin ? partyRanked(origin, 1, CLASS_EVENT_VENUES) : [];
      if (ranked.length >= 3) show(origin, ranked);
      else toast(origin ? 'Choose a demo area to see venues' : 'Couldn’t get your location');
    };
    show(current.origin);
  });
}

/* L6 (Tony, 19 Nov): no "Where should I look?". Parties are booked weeks ahead, so "use my location" is the wrong
   question: start near home, closest first, swipe for farther. Ahmad's add: type an area to look somewhere else. */
const PARTY_AREAS = [[/jakarta|jkt|indonesia/i, PARTY_JAKARTA], [/austin|texas|tx|home|78\d{3}/i, PARTY_HOME]];
async function otherArea(){
  const v = await editText('Look in another area', '', { rows:1, label:'A city, neighborhood or ZIP' });
  if (!v) return null;
  const hit = PARTY_AREAS.find(([re]) => re.test(v));
  if (!hit) { toast('This demo has places around Austin and Jakarta'); return null; }
  return hit[1];
}
async function findPartyVenue(p, w, styleIndex, { classEvent = false } = {}){
  const places = classEvent ? CLASS_EVENT_VENUES : PARTY_VENUES;
  const heading = classEvent ? 'Event places' : PARTY_STYLES[styleIndex].short;
  const search = classEvent ? 'family group event venues' : PARTY_STYLES[styleIndex].search;
  let origin = PARTY_HOME;
  for (;;) {
    const ranked = partyRanked(origin, styleIndex, places);
    const work = p.work(`Looking ${origin === PARTY_HOME ? 'near home' : 'around ' + origin.label}`, `${heading} · closest first`);
    await sleep(650);
    work.done(`${ranked.length} places near ${origin === PARTY_HOME ? 'home' : origin.label}`, ranked.length > 3 ? 'Closest 3 first · swipe for more' : 'Closest first', 'ph-map-pin');
    const place = await partyResults(p, w, origin, ranked, { heading, search, styleIndex, areaSearch:true });
    if (place && place.area) { origin = place.area; continue; }
    if (place) return { place, origin };
    return null;
  }
}

async function birthdayPlace(p, w){
  for (;;) {
    await p.say('Where’s the party?', 700);
    const choice = await p.chips([...BIRTHDAY_PLACES.map(place => place.name), 'Help me find a place']);
    if (choice < BIRTHDAY_PLACES.length) return BIRTHDAY_PLACES[choice];
    await p.say('What kind of place?', 700);
    const styleIndex = await p.chips(PARTY_STYLES.map(style => style.label));
    const venue = await findPartyVenue(p, w, styleIndex);
    if (venue) return venue.place;
  }
}


function eventInviteBody({ cover, coverLabel, title, date, time, place, locationUrl, rows = [], footer = '', editable = false }){
  const venue = playdateEscape(place.name);
  const pencil = (field, label = field) => editable
    ? `<button type="button" class="s ed" data-edit-event="${field}" aria-label="Edit ${label}"><i class="ph ph-pencil-simple" aria-hidden="true"></i></button>`
    : '';
  const photo = `<div class="cover" role="img" aria-label="${coverLabel}" style="background-image:url(${cover})"></div>`;
  const heading = `<h2 class="ttl event-invite-title">${title}</h2>`;
  return `<article class="card event-invite">
    ${editable ? `<div class="event-invite-photo">${photo}${pencil('cover')}</div><div class="event-invite-heading">${heading}${pencil('title')}</div>` : photo + heading}
    <div class="fact"><i class="ph ph-calendar-blank" aria-hidden="true"></i><div>
      <strong>${date}</strong><span class="event-invite-secondary"> · ${time}</span>
    </div>${pencil('time', 'date and time')}</div>
    <div class="fact"><i class="ph ph-map-pin" aria-hidden="true"></i><div>
      <strong>${locationUrl ? external(locationUrl, venue) : venue}</strong>
      ${place.detail !== place.name ? `<div class="event-invite-secondary">${playdateEscape(place.detail)}</div>` : ''}
    </div>${pencil('location')}</div>
    ${rows.length ? `<div class="event-invite-meta">${rows.map(([icon, text, field]) => `<div class="fact"><i class="ph ${icon}" aria-hidden="true"></i>${text}${field ? pencil(field) : ''}</div>`).join('')}</div>` : ''}
    ${footer}</article>`;
}

function birthdayInviteBody(cover, title, w, place, { guest = false, rows, footer = '' } = {}){
  const directions = guest && place.key !== 'home' ? external(mapDirections(place.detail), 'Directions on Google Maps') : '';
  return eventInviteBody({
    cover, coverLabel:'Birthday invitation cover', title, place, rows,
    date:dLong(DAYS.indexOf(w.day)), time:w.to ? range(w.from, w.to) : `Starts at ${tl(w.from)}`, footer:directions + footer
  });
}

async function copyBirthdayInvite(link){
  try {
    await navigator.clipboard.writeText(link);
    toast('Link copied');
  } catch {
    const sheet = bsheet({ body:`<div class="bh"><span class="icotile"><i class="ph ph-link"></i></span><b>Copy link</b></div>
      <label class="field in"><div style="width:100%"><div class="l">Invitation link</div><input readonly aria-label="Invitation link"></div></label>`,
      foot:'<button type="button" class="btn">Close</button>' });
    const field = sheet.body.querySelector('input');
    field.value = link;
    field.onfocus = () => field.select();
    sheet.foot.firstElementChild.onclick = sheet.close;
    field.focus();
  }
}

/* L6 (Tony, 19 Nov): finish the event first, then ask who gets it. Kid → when (start and end) → where → cover →
   the invitation → Send invites → which class, classmates, or a link only. */
X.flows.birthday = async (p, { covers, coverCard }) => {
  sub(p, 'Birthday party');
  await p.say('Let’s plan it. Whose birthday?', 700);
  const [kid] = await kidsCard(p, [], { birthday:true });
  const title = birthdayTitle(kid);
  p.title = title; sub(p, title);
  const w = await whenCard(p, { mode:'birthday', preset:{ w:'Sat', from:840, to:960 } });
  const place = await birthdayPlace(p, w);

  const work = p.work('Picking covers', title);
  await sleep(1000);
  work.done(`${covers.length} covers to pick from`, 'Or make one with AI', 'ph-image');
  const cover = await coverCard(p, { eyebrow:'Cover', title, set:covers });

  p.set('Ready to send', { when:w.day.short });
  await p.say('Here’s the invitation. Check it, then send it.', 700);
  await new Promise(resolve => {
    const footer = '<button type="button" class="btn" data-send-invites>Send invites</button>';
    const card = p.block(birthdayInviteBody(cover, title, w, place, { footer }));
    const submit = card.querySelector('[data-send-invites]');
    submit.onclick = () => { submit.remove(); p.me('Send invites'); resolve(); };
  });

  await p.say('Who should get it?', 600);
  const audience = await p.chips([kid.cls, 'Pick classmates', 'Just a link']);
  const families = audience === 1 ? await classmatesCard(p, [kid], { multiple:true }) : [];
  const guests = [kid.cls, joinNames(families.map(f => f.kid)), 'Link only'][audience];
  const dayIndex = DAYS.indexOf(w.day);
  const classRsvp = audience === 0 && kid.n === 'Maya';
  const rsvpDay = classRsvp ? dShort(dayIndex - 2) : null;
  p.receipt(`Saved in Events · ${w.day.day} · ${range(w.from, w.to)}`);
  if (audience !== 2) p.receipt(audience === 0 ? `Invited ${guests} · 22 families${rsvpDay ? ` · RSVPs by ${rsvpDay}` : ''}` : `Invited ${guests}’s families`);
  p.set(audience === 2 ? 'Event saved' : 'Invites sent', { when:w.day.short, done:!classRsvp });

  const link = new URL('/birthday-invite/', location.origin);
  link.search = new URLSearchParams({ kid:kid.n, day:dayIndex, from:w.from, to:w.to, place:place.key, cover:covers.indexOf(cover) });
  await new Promise(resolve => {
    const actions = p.block(`<div class="chips">
      <button type="button" class="chip" data-copy>Copy link</button>
      <button type="button" class="chip" data-preview>See the invite</button>
      <button type="button" class="chip" data-done>Done</button></div>`);
    actions.querySelector('[data-copy]').onclick = () => copyBirthdayInvite(link.href);
    actions.querySelector('[data-preview]').onclick = () => {
      const sheet = bsheet({ body:birthdayInviteBody(cover, title, w, place, { guest:true }),
        foot:'<button type="button" class="btn ghost">Close</button>' });
      sheet.foot.firstElementChild.onclick = sheet.close;
    };
    const done = actions.querySelector('[data-done]');
    done.onclick = () => { p.me('Done'); done.remove(); X.closeSheet(); resolve(); };
  });

  if (classRsvp) {
    await later(p, { status:'Collecting RSVPs', small:guests, ms:4500, title:`${kid.n}’s party · 16 coming`, body:`Headcount for ${w.day.long}` });
    sub(p, `${kid.n}’s party · 16 coming`);
    p.divider(`${rsvpDay.split(',')[0]} · 9:00 AM`);
    await p.say('Headcount for the party: 16 families are coming, 3 can’t make it. I’ll send one last reminder the day before.', 900);
    p.set('16 coming · reminder the day before', { when:w.day.short, done:true });
  }
};

X.flows.birthdayInvite = covers => {
  const q = new URLSearchParams(location.search);
  const index = key => /^\d{1,4}$/.test(q.get(key) || '') ? Number(q.get(key)) : -1;
  const kid = KIDS.find(k => k.n === q.get('kid'));
  const day = DAYS[index('day')], from = index('from'), to = index('to'), cover = covers[index('cover')];
  const place = [...BIRTHDAY_PLACES, ...PARTY_VENUES].find(place => place.key === q.get('place'));
  const valid = kid && day && place && cover && from >= 0 && from < 1440;
  const body = valid ? birthdayInviteBody(cover, birthdayTitle(kid), { day, from, to:to > from ? to : null }, place, { guest:true })
    : '<p class="bp">This invitation link is incomplete.</p>';

  const view = X.overlay({ title:'Birthday invitation', body, instant:true });
  view.o.classList.add('birthday-invite-page');
  view.o.querySelector('.whead').remove();
  [...$('#phone').children].forEach(child => { if (child.id !== 'overlays') child.inert = true; });
  $('.desk').style.display = 'none';
};

/* ======================= I1 (17 Nov): the family's plans drive the app, on a demo clock =======================
   Every finished flow books a record; each record has moments (booked, morning of, 30 min before, the evening,
   the morning after). The clock lives in the review panel beside the phone, not in the app: it only stands in for
   time passing. Pushes are listed there with who gets them (Tony, Dana), since Dana's phone isn't drawn. */
const DATE0 = new Date(2026, 6, 30);   // index 0 = Thursday, July 30 (DAYS[0])
const dayOf = i => new Date(2026, 6, 30 + i);
const dLong = i => dayOf(i).toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric' });
const dShort = i => dayOf(i).toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric' });
const ampm = m => tl(((m % 1440) + 1440) % 1440);
const lockTime = m => { m = ((m % 1440) + 1440) % 1440; return `${Math.floor(m / 60) % 12 || 12}:${String(m % 60).padStart(2, '0')}`; };
const tonight = r => r.place && r.who ? 'date night' : r.place ? `dinner at ${r.place.n}` : `${r.who.n}’s babysitting`;
const todayWord = r => (r.who ? r.S : r.D) >= 17 * 60 ? 'Tonight' : 'Today';
/* L3: "2h 15m left" for the sitter countdown */
const left = n => n >= 60 ? `${Math.floor(n / 60)}h${n % 60 ? ' ' + (n % 60) + 'm' : ''}` : `${n} min`;
function restoreHappening(){
  const wrap = $('.tdx'), hp = wrap && wrap.querySelector('.hpx'); if (!hp) return;
  const c1 = wrap.querySelector('[data-c1]'), c2 = wrap.querySelector('[data-c2]'), c = el('<div class="tdx-sl" data-c></div>');
  c1.replaceWith(c); hp.remove(); c2.remove(); wrap._size();
}
/* L3 (Tony, 19 Nov): a sitter-only booking is an event, "Casey's babysitting", with the times and the place */
function recTitle(r){ return r.playdate ? 'Playdate' : r.place && r.who ? 'Date night' : r.place ? `Dinner at ${r.place.n}` : `${r.who.n}’s babysitting`; }
function recLine(r){ return r.playdate ? `${r.playdate.kids} · ${range(r.S, r.E)} · ${playdateEscape(r.playdate.place)}` : [r.who ? `${r.who.n} ${range(r.S, r.E)}` : '', r.place ? `${r.place.n} at ${ampm(r.D)}` : FAMILY.address.split(',')[0]].filter(Boolean).join(' · '); }
function stops(r){ if (r.playdate) return [[r.S, `Starts ${ampm(r.S)}`], [r.E, `Ends ${ampm(r.E)}`]]; const a = []; if (r.who) a.push([r.S, `${r.who.n} at ${ampm(r.S)}`]); if (r.place) a.push([r.D, `Dinner ${ampm(r.D)}`]); if (r.who) a.push([r.E, `Home by ${ampm(r.E)}`]); else if (r.place) a.push([r.E || r.D + 120, `Home ${r.E ? ampm(r.E) : ''}`.trim()]); return a.sort((x, y) => x[0] - y[0]); }
function happeningFor(r, evening, onOpen){
  const hp = installHappening(), first = r.who ? r.S : r.D, sat = DAYS[r.i] && DAYS[r.i].w === 'Sat';
  const plan = `<span class="hp-chip as"><img src="${A}assist-clover-knit.png" alt="">Sprout Assist</span><span class="hp-chip">You and Dana</span>`;
  const sit = `<span class="hp-note">${r.who ? `<i class="hp-face" style="background-image:url(${r.who.photo})"></i>` : '<i class="ph ph-fork-knife"></i>'}${recLine(r)}</span>`;
  const st = stops(r), x0 = first - 30, x1 = st[st.length - 1][0], pc = m => Math.max(4, Math.min(96, (m - x0) / (x1 - x0) * 100));
  const track = `<div class="hp-trk"><div class="bar"></div><div class="fill" style="width:4%"></div>${st.map(([m, l], i) => `<span class="stop" style="left:${pc(m)}%"></span><span class="lbl" style="left:${pc(m)}%;${i === st.length - 1 ? 'transform:translateX(-88%)' : i === 0 ? 'transform:translateX(-12%)' : ''}">${l}</span>`).join('')}</div>`;
  const bash = sat ? `<button class="hp-row${evening ? ' past' : ''}" data-bash><span class="hp-when">10:00 AM</span><span class="hp-body"><b>Back to School Bash</b><span class="hp-chips"><span class="hp-chip"><i class="ph ph-users-three"></i>Family · Zilker Park</span>${evening ? '<span class="hp-chip done"><i class="ph-bold ph-check"></i>Earlier today</span>' : ''}</span></span><i class="ph ph-caret-right"></i></button>` : '';
  const desc = r.who ? `${r.who.n} comes at ${ampm(r.S)}.${r.place ? ` Your table at ${r.place.n} is at ${ampm(r.D)}.` : ` With ${joinNames(r.kids.map(k => k.n))} at ${FAMILY.address.split(',')[0]} until ${ampm(r.E)}.`}` : `Your table at ${r.place.n} is at ${ampm(r.D)}.`;
  hp.innerHTML = `<div class="hp-head"><span>📅 Happening today</span><small>${sat ? 2 : 1} thing${sat ? 's' : ''}</small></div><div class="hp-card">
    ${evening ? `<button class="hp-feat" data-open><span class="clayico" style="background-image:url(${A}clay/calendar-check.png)"></span>
        <span class="hp-ft"><span class="hp-time">${ampm(first)} <em>· in 30 min</em></span><span class="hp-chips" style="margin:0">${plan}</span></span></button>
      <button class="hp-ttl" data-open>${recTitle(r)}</button><p class="hp-desc">${desc}</p>${track}
      <div class="hp-acts">${r.who ? `<button data-t="Opens Messages to ${r.who.n}"><i class="ph-bold ph-chat-circle-dots"></i>Text ${r.who.n}</button>` : ''}${r.place ? `<button data-t="Opens Maps to ${r.place.n}"><i class="ph-bold ph-map-trifold"></i>Directions</button>` : ''}</div>${bash}`
    : `${bash}<button class="hp-row new" data-open><span class="hp-when">${ampm(first)}</span><span class="hp-body"><b>${recTitle(r)}</b><span class="hp-chips">${plan}</span>${sit}</span><i class="ph ph-caret-right"></i></button>`}</div>`;
  hp.querySelectorAll('[data-open]').forEach(b => b.onclick = onOpen);
  hp.querySelectorAll('[data-t]').forEach(b => b.onclick = () => toast(b.dataset.t));
  hp.querySelector('[data-bash]')?.addEventListener('click', () => toast('Opens the event (not part of this demo)'));
  setTimeout(() => hp.querySelector('.hp-row.new')?.classList.remove('new'), 2600);
  setTimeout(() => { const b = $('#brief'); if (b) b.scrollTo({ top: hp.offsetTop - 70, behavior:'smooth' }); }, 300);
}
/* the Live Activity for this plan, at minute m (same states as /date-night-live/) */
function laState(r, m){
  if (r.playdate) {
    if (m < r.S) return { t:`Playdate in ${r.S - m} min`, s:playdateEscape(r.playdate.place), r:`${r.S - m}m` };
    if (m < r.E) return { t:`${r.playdate.kids} are playing`, s:`Until ${ampm(r.E)}`, r:ampm(r.E) };
    return { t:'Playdate finished', s:'On the family calendar', r:'Done' };
  }
  /* L3 (Tony, 19 Nov): no tracking of the sitter (no location). Before: "should be there in". During: a countdown to
     when you need to be home, with Text. At the end: Pay and Text, so paying is one tap from the lock screen. */
  const w = r.who, pl = r.place, first = w ? r.S : r.D;
  if (m < first) { const n = first - m; return w ? { t:`Babysitter ${w.n} arrives in ${n} min`, s: pl ? `Dinner at ${pl.n} ${ampm(r.D)}` : `With ${joinNames(r.kids.map(k => k.n))} until ${ampm(r.E)}`, r:`${n}m` } : { t:`Dinner in ${n} min`, s:`Table for 2 at ${pl.n}`, r:`${n}m` }; }
  if (pl && m < r.D) return { t:'On your way to dinner', s:`Table for 2 at ${ampm(r.D)} · ${pl.n}`, r:ampm(r.D) };
  if (w && m < r.E - 30) return { t:`${left(r.E - m)} left with ${w.n}`, s: pl ? `Enjoy your dinner · home by ${ampm(r.E)}` : `Home by ${ampm(r.E)} · ${joinNames(r.kids.map(k => k.n))}`, r:left(r.E - m) };
  if (w && m < r.E) return { t:`${r.E - m} min left · head home`, s:`${w.n} is booked until ${ampm(r.E)}`, r:`${r.E - m}m`, soon:true };
  if (w) return { t:`${w.n} is done`, s:`Pay $${r.amt} and say how it went`, r:'Now', pay:true };
  return { t:'Hope it was lovely', s:'See you tomorrow', r:'Done', end:true };
}
function laHtml(r, m){
  /* S5 (Tony, 20 Nov US): "I don't like this extra space... make sure these two are indented the same way...
     put the dot in the middle so the line looks good." The bar starts at the first stop and ends at the last,
     the track is inset the same on both sides, and each label is centred under its dot. */
  const st = laState(r, m), sp = stops(r), x0 = sp[0][0], x1 = sp[sp.length - 1][0], pc = v => x1 > x0 ? Math.max(0, Math.min(100, (v - x0) / (x1 - x0) * 100)) : 0;
  const up = sp.map(([v], i) => i > 0 && i < sp.length - 1 && pc(v) - pc(sp[i - 1][0]) < 30);
  return `<div class="la"><div class="la-top"><img src="/assets/app-icon-180.png" alt=""><b>${recTitle(r)}</b>· Sprout<span class="r">${st.r}</span></div>
    <div class="la-t">${st.t}</div><div class="la-s">${st.s}</div>
    <div class="trk${up.some(Boolean) ? ' has-up' : ''}"><div class="bar"></div><div class="fill" style="width:${pc(m)}%"></div>${sp.map(([v, l], i) => `<span class="stop${m >= v ? ' on' : ''}${i === 0 ? ' s0' : i === sp.length - 1 ? ' sn' : ''}" style="left:${pc(v)}%"></span><span class="lbl${up[i] ? ' up' : ''}${i === 0 ? ' s0' : i === sp.length - 1 ? ' sn' : ''}" style="left:${pc(v)}%">${l}</span>`).join('')}</div>
    ${r.playdate ? '<div class="la-acts"><button type="button" data-playdate><i class="ph ph-calendar-check"></i>View playdate</button></div>' : st.end ? ''
      : st.pay ? `<div class="la-acts"><button type="button" class="la-pay" data-pay><i class="ph-bold ph-currency-dollar"></i>Pay ${r.who.n}</button><button data-t="Opens Messages to ${r.who.n}"><i class="ph-bold ph-chat-circle-dots"></i>Text ${r.who.n}</button></div>`
      : `<div class="la-acts">${r.who ? `<button data-t="Opens Messages to ${r.who.n}"><i class="ph-bold ph-chat-circle-dots"></i>Text ${r.who.n}</button>` : ''}${r.place && !st.soon ? `<button data-t="Opens Maps to ${r.place.n}"><i class="ph-bold ph-map-trifold"></i>Directions</button>` : ''}${r.place && st.soon ? `<button data-t="Opens Maps home"><i class="ph-bold ph-house-line"></i>Directions home</button>` : ''}</div>`}</div>`;
}
/* lock screen: notifications (newest first) and an optional Live Activity; tap a notification to open its target */
function famLock({ i, m, notes = [], la = '', onPay }){
  $('#phone .lock')?.remove();
  const lock = el(`<div class="lock fam"><div class="ldate">${dLong(i)}</div><div class="ltime">${lockTime(m)}</div>
    <div class="lstack">${la}${notes.map((n, k) => pushNote({ ...n, attrs:`data-k="${k}"` })).join('')}</div>
    <div class="lhint">${notes.length ? 'Tap a notification' : 'Tap anywhere to unlock'}</div></div>`);
  $('#phone').appendChild(lock);
  const close = then => { lock.classList.add('gone'); setTimeout(() => { lock.remove(); then && then(); }, 380); };
  lock.querySelectorAll('.lnote').forEach(b => b.onclick = e => { e.stopPropagation(); close(notes[+b.dataset.k].open); });
  lock.querySelectorAll('.la [data-t]').forEach(b => b.onclick = e => { e.stopPropagation(); toast(b.dataset.t); });
  lock.querySelectorAll('.la [data-pay]').forEach(b => b.onclick = e => { e.stopPropagation(); close(onPay); });
  if (!notes.length) lock.onclick = () => close();
}
const setBriefDay = i => { const h = $('.dbhead .mid span'); if (h) h.textContent = dLong(i); };
const openBrief = () => { X.closeSheet(); setTimeout(() => { const hp = $('.hpx'), b = $('#brief'); if (hp && b) b.scrollTo({ top: hp.offsetTop - 70, behavior:'smooth' }); }, 350); };
const openPlan = p => () => { X.showPlan(p); X.openSheet(); };

const CLOCK = (() => {
  let now = -3 * 1440 + 581;   // Monday, July 27, 9:41 AM (the Daily Brief's date)
  const recs = [], log = [];
  const panel = el(`<section class="clk" aria-label="Demo clock">
    <div class="clk-h"><b>Demo clock</b><small>Review only. Stands in for time passing; not part of the app.</small></div>
    <div class="clk-now" data-now></div><button type="button" class="clk-next" data-next></button>
    <ol class="clk-list" data-list></ol><div class="clk-log" data-log></div></section>`);
  const desk = document.querySelector('.desk'); if (desk) desk.insertBefore(panel, document.querySelector('#restartBtn'));
  const sbar = () => { const t = document.querySelector('.sbar span'); if (t) t.textContent = lockTime(now); };
  const at = t => `${dShort(Math.floor(t / 1440))} · ${ampm(t - Math.floor(t / 1440) * 1440)}`;
  const push = (to, title, body) => log.unshift({ t:now, to, title, body });
  function moments(r){
    const base = r.i * 1440, first = r.who ? r.S : r.D, m = [];
    if (r.playdate) return [[r.S - 30, 'soon', '30 min before · Playdate'], [r.S, 'during', 'Playdate starts'],
      [r.E, 'end', 'Playdate ends'], [r.E + 15, 'finish', 'Live Activity ends']]
      .map(([m, k, l]) => ({ t:base + m, k, l, r, done:false }));
    m.push({ t:base + Math.min(450, first - 60), k:'morning', l:'Morning of · Morning Brief' });
    m.push({ t:base + first - 30, k:'soon', l:`30 min before · ${r.who ? r.who.n + ' comes' : 'dinner'}` });
    m.push({ t:base + (r.place ? r.D + 25 : r.S + 60), k:'during', l:r.place ? 'During dinner' : `During · countdown with ${r.who.n}` });
    /* L3: the last 30 minutes, then pay + rate the moment the sitter is done (not the next morning) */
    if (r.who) {
      m.push({ t:base + r.E - 25, k:'last', l:'Last 30 minutes · head home' });
      m.push({ t:base + r.E, k:'end', l:`${r.who.n} is done · pay and rate` });
    } else m.push({ t:base + (r.E || r.D + 150), k:'end', l:'Evening ends' });
    return m.map(x => ({ ...x, r, done:false }));
  }
  const pending = () => recs.flatMap(r => r.ms).filter(x => !x.done).sort((a, b) => a.t - b.t);
  function run(x){
    const r = x.r, p = r.p; now = Math.max(now, x.t); x.done = true; sbar();
    const title = recTitle(r), line = recLine(r);
    if (r.playdate) {
      const i = Math.floor(x.t / 1440), m = x.t - r.i * 1440;
      const note = { title:'Playdate in 30 min', sub:r.playdate.kids, body:`Today, ${range(r.S, r.E)} · ${playdateEscape(r.playdate.place)}`, open:openPlan(p) };
      if (x.k === 'soon') push('Tony and Dana', note.title, `${note.sub} · ${note.body} · Live Activity starts`);
      if (x.k === 'finish') r.resolve();
      setBriefDay(i);
      famLock({ i, m:x.t - i * 1440, la:x.k === 'finish' ? '' : laHtml(r, m), notes:x.k === 'soon' ? [note] : [] });
      const lock = $('#phone .lock'), button = lock.querySelector('[data-playdate]');
      if (button) button.onclick = e => {
        e.stopPropagation();
        const reminder = lock.querySelector('.lnote');
        if (reminder) reminder.click(); else { lock.click(); openPlan(p)(); }
      };
      paint(); return;
    }
    if (x.k === 'morning') {
      setBriefDay(r.i); restoreHappening(); happeningFor(r, false, openPlan(p));
      const body = `${line}. ${r.who ? 'Dana has this too.' : 'On the family calendar.'}`;
      push('Tony and Dana', `${todayWord(r)}: ${tonight(r)}`, body);
      p.set(`Today · ${line}`, { when:'Today' });
      famLock({ i:r.i, m:((x.t % 1440) + 1440) % 1440, notes:[{ title:`${todayWord(r)}: ${tonight(r)}`, body, open:openBrief }] });
    }
    if (x.k === 'soon') {
      setBriefDay(r.i); happeningFor(r, true, openPlan(p));
      /* Figma countdown-first order (13670:17479): short title, then what, then the detail */
      const n = r.who ? { title:`Babysitter ${r.who.n} arrives in 30 min`, sub:r.place ? `Dinner at ${r.place.n} at ${ampm(r.D)}` : `With ${joinNames(r.kids.map(k => k.n))} until ${ampm(r.E)}`, body:'Dana has this too.' } : { title:'Dinner in 30 min', sub:`Table for 2 at ${r.place.n}`, body:`Today at ${ampm(r.D)}.` };
      push('Tony and Dana', n.title, `${n.sub}. ${n.body} Live Activity starts.`);
      p.set(`Happening now · ${line}`, { when:'Today' });
      famLock({ i:r.i, m:((x.t % 1440) + 1440) % 1440, la:laHtml(r, ((x.t % 1440) + 1440) % 1440), notes:[{ ...n, open:openBrief }] });
    }
    if (x.k === 'during') { famLock({ i:r.i, m:((x.t % 1440) + 1440) % 1440, la:laHtml(r, ((x.t % 1440) + 1440) % 1440) }); log.unshift({ t:now, to:'Lock screens', title:'Live Activity updates', body:laState(r, ((x.t % 1440) + 1440) % 1440).t }); }
    if (x.k === 'last') { famLock({ i:r.i, m:((x.t % 1440) + 1440) % 1440, la:laHtml(r, ((x.t % 1440) + 1440) % 1440) }); log.unshift({ t:now, to:'Lock screens', title:'Live Activity updates', body:laState(r, ((x.t % 1440) + 1440) % 1440).t }); }
    if (x.k === 'end') {
      restoreHappening();
      if (r.who) {
        const n = { title:`${r.who.n} is done`, body:`Pay ${r.who.n} $${r.amt} and say how it went. It’s on your to-dos too.` };
        push('Tony', n.title, n.body); p.set(`Pay ${r.who.n} $${r.amt}`, { when:'Now', attn:true });
        famLock({ i:r.i, m:((x.t % 1440) + 1440) % 1440, la:laHtml(r, ((x.t % 1440) + 1440) % 1440), notes:[{ ...n, open:openPlan(p) }], onPay:openPlan(p) });
      } else famLock({ i:r.i, m:((x.t % 1440) + 1440) % 1440 });
      r.resolve();
    }
    paint();
  }
  function paint(){
    const nx = pending();
    panel.querySelector('[data-now]').textContent = at(now);
    const b = panel.querySelector('[data-next]');
    b.disabled = !nx.length; b.innerHTML = nx.length ? `Next: ${at(nx[0].t)}<small>${nx[0].l}</small>` : 'Nothing coming up<small>Book a sitter or plan a date night first</small>';
    const all = recs.flatMap(r => r.ms).sort((a, c) => a.t - c.t);
    panel.querySelector('[data-list]').innerHTML = all.length ? all.map((x, k) => `<li class="${x.done ? 'done' : ''}"><button type="button" data-k="${k}" ${x.done ? 'disabled' : ''}><span>${at(x.t)}</span>${x.l}<em>${recTitle(x.r)}</em></button></li>`).join('') : '';
    panel.querySelectorAll('[data-list] button').forEach(btn => btn.onclick = () => { const target = all[+btn.dataset.k]; pending().filter(y => y.t <= target.t).forEach(run); });
    panel.querySelector('[data-log]').innerHTML = log.length ? `<b>Sent so far</b>${log.slice(0, 8).map(l => `<div><span>${at(l.t)} · to ${l.to}</span>${l.title}<small>${l.body}</small></div>`).join('')}` : '';
    sbar();
  }
  b0: { panel.querySelector('[data-next]').onclick = () => { const nx = pending(); if (nx.length) run(nx[0]); }; }
  paint();
  return {
    now:() => now,
    book(r){ return new Promise(resolve => {
      r.resolve = resolve; r.ms = moments(r); recs.push(r);
      push('Dana', r.playdate ? 'Playdate confirmed' : r.who ? `Tony booked ${r.who.n}` : `Tony booked ${r.place.n}`, `${dShort(r.i)} · ${recLine(r)}`);
      toast('Use the demo clock beside the phone to move through the day');
      paint(); panel.classList.add('ping'); setTimeout(() => panel.classList.remove('ping'), 2400);
    }); },
  };
})();
/* ======================= direct links (17 Nov report): each report point opens on its own screen ======================= */
function bookedEvening(){   /* a date night already booked for Sat, Aug 1: Olive & Ember 7:15, Alex 6:45 to 10:15 PM */
  const who = SAVED[0], w = { day:DAYS.find(d => d.w === 'Sat'), from:1125, to:1335 }, H = 3.5, pl = M.PLACES.olive;
  const p = X.makePlan('dateE', { title:'Date night · Sat, Aug 1', sub:'Date night · Sat, Aug 1', icon:'calendar-check' });
  p.block(`<div class="card"><div class="cover" style="${M.ph('olive', 3)}"></div><div class="ctop">${clay('calendar-check')}<div><div class="eyebrow">Date night · ${w.day.day}</div><div class="ttl">Your evening</div></div></div>
    <div class="ua-row on" style="margin-top:12px">${face(who)}<span class="tx"><b>${who.n}</b><small>${range(w.from, w.to)} · about $${Math.round(who.rate * H)} · you pay ${who.n}</small></span><span class="ck"><i class="ph-bold ph-check"></i></span></div>
    <div class="fact" style="margin-top:10px"><i class="ph ph-fork-knife"></i>${pl.n} · 7:15 PM · table for 2</div>
    <div class="fact"><i class="ph ph-users"></i>${joinNames(KIDS.map(k => k.n))}</div>
    <div class="fact"><i class="ph ph-bell-ringing"></i>Reminder for you both at ${tl(w.from - 30)}, then the evening on your lock screens</div></div>`);
  p.set(`Booked · ${pl.n} 7:15 PM · ${who.n} ${range(w.from, w.to)}`, { when:w.day.short, done:false });
  CLOCK.book({ p, i:DAYS.indexOf(w.day), S:w.from, E:w.to, D:1155, place:pl, k:'olive', who, kids:KIDS, amt:Math.round(who.rate * H) })
    .then(() => payTonight(p, who, w, KIDS, H, { clock:true }));
  return p;
}
/* L1 review state (/assist-ongoing/): Tony left two things running. Ahmad, 19 Nov: going back into a session must show
   the whole conversation, not just the last line. So both are the real flows, replayed fast in the background by tapping
   the same buttons a parent would: a playdate where Ana suggested a new time (needs you), and a sitter request that
   was just sent. The sitter replies then arrive in real time, a few seconds after the home opens. */
async function autoplay(p, steps){
  for (const step of steps) {
    for (let i = 0; ; i++) {
      const live = [...p.chat.querySelectorAll(step.sel || 'button')].filter(b => !b.disabled && b.style.pointerEvents !== 'none' && !b.closest('.done'));
      const b = step.sel ? live[0] : live.filter(x => x.textContent.trim().startsWith(step)).pop();
      if (b) { b.click(); break; }
      if (i > 400) { console.warn('autoplay stopped at', step); return; }
      await new Promise(r => setTimeout(r, 25));
    }
  }
}
async function ongoing(){
  /* N14 (Tony, 20 Nov): "take off 2 of the 'pick up where you left off' things so I can see the UI of the main page".
     One plan in progress: the sitter waiting on your pick, 2 hours ago. */
  X.pace(.03);
  const s = X.startQuiet('sitterC1', { echo:'Book a sitter' });
  await autoplay(s, ['Next', 'Next', 'Looks right', 'Ask Alex']);
  await new Promise(r => setTimeout(r, 1500));   // let replies land before the clock is set back
  X.pace(1);
  const H = 3600000, now = Date.now();
  Object.assign(s, { started:now - 3 * H, touched:now - 2 * H });
  X.showHome(); X.openSheet(); X.renderHome();
}

const DIRECT = {
  'assist-ongoing': ongoing,
  'book-a-sitter': () => X.start('sitterC1', { echo:'Book a sitter' }),
  'book-a-sitter-saved': () => X.start('sitterC1', { echo:'Book a sitter', review }),
  'plan-a-date-night': () => X.start('dateE', { echo:'Plan a date night', restaurantReview:review === 'restaurants' }),
  'booked-evening': () => { const p = bookedEvening(); X.showPlan(p); X.openSheet(); },
  'chat-history': () => { bookedEvening(); X.showHome(); X.openSheet(); setTimeout(() => { const b = $('#historyBtn'); if (b) b.click(); }, 500); },
  'add-account': () => { X.showHome(); X.openSheet(); setTimeout(() => { X.openWallet(true); setTimeout(() => { const b = document.querySelector('[data-addacc]'); if (b) b.click(); }, 350); }, 450); },
};
if (DIRECT[route]) setTimeout(DIRECT[route], 500);
/* 20 Nov: the one place-search map, shared so camps and after school (flows.js) use the same UI as birthday and
   date night (Tony, 20 Nov: "use the previous UI that we had, the map ... be able to slide it over"). */
X.sv = { partyResults, partyMap, partyDistance, PARTY_HOME, face, external };
})();
