/* UI directions mock (17 Nov): two screens of Book a sitter ("when" and "who to ask") in three looks.
   Routes /ui-a/, /ui-b/, /ui-c/ with ?s=date or ?s=who. Static states with working taps; nothing continues. */
(() => {
const X = window.Sprout, { el, toast } = X;
const route = location.pathname.split('/').filter(Boolean)[0] || '';
if (!['ui-a', 'ui-b', 'ui-c'].includes(route)) return;
const S = new URLSearchParams(location.search).get('s') || 'date';
const A = X.A;
const clay = n => `<span class="clayico" style="background-image:url(${A}clay/${n}.png)"></span>`;
const DAYS = [['Thu', 30], ['Fri', 31, 1], ['Sat', 1, 1], ['Sun', 2], ['Mon', 3], ['Tue', 4], ['Wed', 5]];
const SIT = [
  { n:'Alex', img:'sitters/alex.webp', line:'Sat for you 4 times', rate:25, tag:'Maya’s favorite' },
  { n:'Sam', img:'sitters/sam.webp', line:'Sat for you twice · saved by Dana', rate:28, tag:'Great with Jake' },
  { n:'Riley', img:'sitters/riley.webp', line:'Sat for you once', rate:24, tag:'Lives 5 min away' },
];
const KIDS = [['Maya', 'maya.webp'], ['Jake', 'jake.webp']];
const tl = m => { const h = Math.floor(m / 60) % 24, mm = m % 60; return `${h % 12 || 12}:${String(mm).padStart(2, '0')} ${h < 12 || m >= 1440 ? 'AM' : 'PM'}`; };
const tsh = m => tl(m).replace(':00', '').replace(/ (AM|PM)/, '');
const hrs = (a, b) => { const h = (b - a) / 60; return `${h % 1 ? h.toFixed(1) : h} hours`; };

/* a plan chat with Sprout's question already asked */
const p = X.makePlan('mock', { title:'Book a sitter', sub: S === 'who' ? 'Sitter · Sat, Aug 1' : 'Book a sitter', icon:'person-plus' });
const say = t => p.add(el(`<div class="row"><div class="from"><span class="orb sm"></span>Sprout</div><div class="bub">${t}</div></div>`));
const me = t => p.add(el(`<div class="row me"><div class="bub">${t}</div></div>`));
const block = h => p.add(el(`<div class="row indent">${h}</div>`));
X.showPlan(p); X.openSheet();
me('Book a sitter');
say('Happy to. When do you need someone?');
if (S === 'who') { me('Sat, Aug 1, 6–10 PM'); say('And who is it for?'); me('For Maya and Jake'); say('Here’s the request.'); me('Looks right'); }

/* ================= A · polish in place ================= */
function aDate(){
  let d = 2, from = 1080, to = 1320;
  const c = block(`<div class="card"><div class="ctop">${clay('calendar-check')}<div><div class="eyebrow">Sitter</div><div class="ttl">When do you need a sitter?</div></div></div>
    <div class="ua-days">${DAYS.map(([w, n, f], i) => `<button class="ua-day${f ? ' free' : ''}" data-i="${i}"><small>${w}</small><b>${n}</b><i></i></button>`).join('')}</div>
    <div class="ua-legend"><i></i>You and Dana are both free</div>
    <div class="ua-times"><div class="ua-t"><small>From</small><div class="ua-step"><button data-a="f-">−</button><b data-f></b><button data-a="f+">+</button></div></div>
      <i class="ph ph-arrow-right ua-arrow"></i>
      <div class="ua-t"><small>Until</small><div class="ua-step"><button data-a="t-">−</button><b data-t></b><button data-a="t+">+</button></div></div></div>
    <div class="ua-dur"><i class="ph-fill ph-moon-stars"></i><span data-d></span></div>
    <button class="btn" style="margin-top:14px">Next</button></div>`).querySelector('.card');
  const paint = () => { c.querySelectorAll('.ua-day').forEach(b => b.classList.toggle('on', +b.dataset.i === d));
    c.querySelector('[data-f]').textContent = tl(from); c.querySelector('[data-t]').textContent = tl(to);
    c.querySelector('[data-d]').textContent = `${DAYS[d][0]} · ${hrs(from, to)} · Maya and Jake usually sleep by 8:30`; };
  c.querySelectorAll('.ua-day').forEach(b => b.onclick = () => { d = +b.dataset.i; paint(); });
  c.querySelectorAll('[data-a]').forEach(b => b.onclick = () => { const a = b.dataset.a;
    if (a === 'f-' && from > 900) from -= 30; if (a === 'f+' && from < to - 60) from += 30; if (a === 't-' && to > from + 60) to -= 30; if (a === 't+' && to < 1440) to += 30; paint(); });
  c.querySelector('.btn').onclick = () => toast('Mock only: picks the next step');
  paint();
}
function aWho(){
  const on = new Set(SIT.map(s => s.n));
  const c = block(`<div class="card"><div class="ctop">${clay('two-people')}<div><div class="eyebrow">Your sitters · pick any</div><div class="ttl">Who should I ask?</div></div></div>
    <div class="ua-rows">${SIT.map(s => `<button class="ua-row on" data-n="${s.n}"><span class="uaph" style="background-image:url(${A}${s.img})"></span><span class="tx"><b>${s.n}</b><small>${s.line} · $${s.rate}/hr</small></span><span class="ck"><i class="ph-bold ph-check"></i></span></button>`).join('')}
      <button class="ua-add"><span><i class="ph ph-plus"></i></span>Add a sitter</button></div>
    <button class="btn" style="margin-top:14px"></button></div>`).querySelector('.card');
  const btn = c.querySelector('.btn');
  const paint = () => { c.querySelectorAll('.ua-row').forEach(r => r.classList.toggle('on', on.has(r.dataset.n))); const n = [...on]; btn.disabled = !n.length;
    btn.textContent = n.length ? `Ask ${n.length === 3 ? 'all 3' : n.join(' and ')}` : 'Pick at least one'; };
  c.querySelectorAll('.ua-row').forEach(r => r.onclick = () => { on.has(r.dataset.n) ? on.delete(r.dataset.n) : on.add(r.dataset.n); paint(); });
  c.querySelector('.ua-add').onclick = () => toast('Opens the Add a sitter sheet');
  btn.onclick = () => toast('Mock only: shows the message preview next');
  paint();
}

/* ================= B · answers in a sheet ================= */
function bDate(){
  say('Pick a day and time in the sheet.');
  let d = 1, edit = 'f', from = 1080, to = 1320;
  /* Jul 27 (Mon) to Aug 9 (Sun), two weeks */
  const cells = [];
  for (let i = 0; i < 14; i++) { const day = 27 + i, n = day > 31 ? day - 31 : day; cells.push({ n, past:i < 3, free: n === 31 || (n === 1 && i > 4), i }); }
  const v = X.bsheet({ body:`<div class="ub-steps"><i class="on"></i><i></i><i></i><i></i></div><div class="ub-k">Step 1 of 4</div><div class="ub-title">When do you need a sitter?</div>
      <div class="ub-month">July – August</div>
      <div class="ub-cal">${['M', 'T', 'W', 'T', 'F', 'S', 'S'].map(x => `<small>${x}</small>`).join('')}${cells.map(c => `<button class="${c.past ? 'past' : ''}${c.free ? ' free' : ''}" data-i="${c.i}" ${c.past ? 'disabled' : ''}>${c.n}</button>`).join('')}</div>
      <div class="ub-fields"><button class="ub-field on" data-e="f"><small>From</small><b data-f></b></button><button class="ub-field" data-e="t"><small>Until</small><b data-t></b></button></div>
      <div class="ub-hint"><i class="ph ph-info"></i><span data-h></span></div>`,
    foot:`<button type="button" class="btn" data-go>Next</button>` });
  v.o.classList.add('tall');
  const sel = 5;   // Sat, Aug 1 = index 5
  let pick = sel;
  const paint = () => { v.body.querySelectorAll('.ub-cal button').forEach(b => b.classList.toggle('on', +b.dataset.i === pick));
    v.body.querySelector('[data-f]').textContent = tl(from); v.body.querySelector('[data-t]').textContent = tl(to);
    v.body.querySelectorAll('.ub-field').forEach(b => b.classList.toggle('on', b.dataset.e === edit));
    v.body.querySelector('[data-h]').textContent = `${hrs(from, to)}. Tap From or Until to change it.`; };
  v.body.querySelectorAll('.ub-cal button:not([disabled])').forEach(b => b.onclick = () => { pick = +b.dataset.i; paint(); });
  v.body.querySelectorAll('.ub-field').forEach(b => b.onclick = () => { edit = b.dataset.e; if (edit === 'f') from = from >= 1200 ? 960 : from + 30; else to = to >= 1440 ? from + 120 : to + 30; paint(); });
  v.foot.querySelector('[data-go]').onclick = () => toast('Mock only: step 2 asks which kids');
  paint();
}
function bWho(){
  /* the chat keeps short answers; the sheet asks the last question */
  p.chat.querySelectorAll('.row').forEach((r, i) => { if (i > 1) r.remove(); });
  p.add(el(`<div class="row me"><div class="ub-sum"><span>Sat, Aug 1</span><span>6–10 PM</span><span>Maya and Jake</span></div></div>`));
  say('Last step: who should I ask?');
  const on = new Set(SIT.map(s => s.n));
  const v = X.bsheet({ body:`<div class="ub-steps"><i class="on"></i><i class="on"></i><i class="on"></i><i class="on"></i></div><div class="ub-k">Step 4 of 4</div><div class="ub-title">Who should I ask?</div>
      <div class="ua-rows" style="margin-top:0">${SIT.map(s => `<button class="ua-row on" data-n="${s.n}"><span class="uaph" style="background-image:url(${A}${s.img})"></span><span class="tx"><b>${s.n}</b><small>${s.line} · $${s.rate}/hr</small></span><span class="ck"><i class="ph-bold ph-check"></i></span></button>`).join('')}
      <button class="ua-add"><span><i class="ph ph-plus"></i></span>Add a sitter</button></div>
      <div class="ub-hint"><i class="ph ph-lock-simple"></i>Each sitter gets their own message. Numbers stay private.</div>`,
    foot:`<button type="button" class="btn" data-go></button>` });
  v.o.classList.add('tall');
  const btn = v.foot.querySelector('[data-go]');
  const paint = () => { v.body.querySelectorAll('.ua-row').forEach(r => r.classList.toggle('on', on.has(r.dataset.n))); const n = [...on]; btn.disabled = !n.length; btn.textContent = n.length ? `Ask ${n.length === 3 ? 'all 3' : n.join(' and ')}` : 'Pick at least one'; };
  v.body.querySelectorAll('.ua-row').forEach(r => r.onclick = () => { on.has(r.dataset.n) ? on.delete(r.dataset.n) : on.add(r.dataset.n); paint(); });
  v.body.querySelector('.ua-add').onclick = () => toast('Opens the Add a sitter form');
  btn.onclick = () => toast('Mock only: shows the message preview next');
  paint();
}

/* ================= C · warm and photo-led ================= */
function cDate(){
  let d = 2, from = 1080, to = 1320; const MIN = 960, MAX = 1440;
  const LONG = { Thu:'Thursday, July 30', Fri:'Friday, July 31', Sat:'Saturday, August 1', Sun:'Sunday, August 2', Mon:'Monday, August 3', Tue:'Tuesday, August 4', Wed:'Wednesday, August 5' };
  const c = block(`<div class="card"><div class="ctop">${clay('calendar-check')}<div><div class="eyebrow">Sitter</div><div class="ttl" style="font-size:16px">Your evening</div></div></div>
    <div class="uc-head"><b data-h></b><span data-s></span></div>
    <div class="uc-days">${DAYS.map(([w, n, f], i) => `<button class="uc-day" data-i="${i}"><small>${w}</small>${n}${f ? '<span class="fr">both free</span>' : '<span class="fr">&nbsp;</span>'}</button>`).join('')}</div>
    <div class="uc-track"><div class="uc-bar"></div><div class="uc-sel"></div><span class="uc-h" data-k="f"><i class="ph-fill ph-sun-horizon"></i></span><span class="uc-h" data-k="t"><i class="ph-fill ph-moon"></i></span>
      <div class="uc-ticks"><span>4 PM</span><span>6</span><span>8</span><span>10</span><span>12 AM</span></div></div>
    <div class="uc-kids"><span>${KIDS.map(([, img]) => `<i style="background-image:url(${A}${img})"></i>`).join('')}</span>&nbsp;&nbsp;Maya and Jake · bedtime around 8:30</div>
    <button class="btn" style="margin-top:14px">Next</button></div>`).querySelector('.card');
  const track = c.querySelector('.uc-track'), pct = m => (m - MIN) / (MAX - MIN) * 100;
  const paint = () => {
    c.querySelector('[data-h]').textContent = LONG[DAYS[d][0]]; c.querySelector('[data-s]').textContent = `${tl(from).replace(':00', '')} – ${tl(to).replace(':00', '')} · ${hrs(from, to)}`;
    c.querySelectorAll('.uc-day').forEach(b => b.classList.toggle('on', +b.dataset.i === d));
    const sel = c.querySelector('.uc-sel'); sel.style.left = pct(from) + '%'; sel.style.width = (pct(to) - pct(from)) + '%';
    c.querySelector('[data-k=f]').style.left = pct(from) + '%'; c.querySelector('[data-k=t]').style.left = pct(to) + '%';
  };
  c.querySelectorAll('.uc-day').forEach(b => b.onclick = () => { d = +b.dataset.i; paint(); });
  /* tap the bar: the nearest handle jumps there (30-minute steps) */
  track.onclick = e => { const r = track.getBoundingClientRect(), m = Math.round((MIN + (e.clientX - r.left) / r.width * (MAX - MIN)) / 30) * 30;
    if (Math.abs(m - from) <= Math.abs(m - to)) from = Math.min(Math.max(MIN, m), to - 60); else to = Math.max(Math.min(MAX, m), from + 60); paint(); };
  c.querySelector('.btn').onclick = () => toast('Mock only: picks the next step');
  paint();
}
function cWho(){
  say('These are your sitters. Swipe and tap Ask on anyone you’d like.');
  const on = new Set(SIT.map(s => s.n));
  const car = block(`<div class="uc-car">${SIT.map(s => `<div class="uc-card on" data-n="${s.n}"><div class="ucphoto" style="background-image:url(${A}${s.img})"><span class="uctag">${s.tag}</span></div>
      <div class="bd"><b>${s.n}</b><small>${s.line}</small><small>$${s.rate} an hour · about $${s.rate * 4}</small><button class="uc-ask"></button></div></div>`).join('')}
      <div class="uc-card addc"><span><i class="ph ph-plus"></i></span>Add a sitter</div></div>`);
  const btnRow = block(`<button class="btn"></button>`);
  const btn = btnRow.querySelector('.btn');
  const paint = () => { car.querySelectorAll('.uc-card[data-n]').forEach(cd => { const o = on.has(cd.dataset.n); cd.classList.toggle('on', o); cd.querySelector('.uc-ask').innerHTML = o ? '<i class="ph-bold ph-check"></i>Asking' : 'Ask ' + cd.dataset.n; });
    const n = [...on]; btn.disabled = !n.length; btn.textContent = n.length ? `Send to ${n.length === 3 ? 'all 3' : n.join(' and ')}` : 'Pick at least one'; };
  car.querySelectorAll('.uc-ask').forEach(b => b.onclick = () => { const n = b.closest('.uc-card').dataset.n; on.has(n) ? on.delete(n) : on.add(n); paint(); });
  car.querySelector('.addc').onclick = () => toast('Opens the Add a sitter sheet');
  btn.onclick = () => toast('Mock only: shows the message preview next');
  paint();
}

const R = { 'ui-a':{ date:aDate, who:aWho }, 'ui-b':{ date:bDate, who:bWho }, 'ui-c':{ date:cDate, who:cWho } };
setTimeout(() => { R[route][S](); setTimeout(() => p.chat.scrollTo({ top: p.chat.scrollHeight }), 50); }, 80);
})();
