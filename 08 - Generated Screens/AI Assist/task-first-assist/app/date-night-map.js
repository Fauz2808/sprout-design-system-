/* Date night v2 (B3, 17 Nov, Ahmad): C's proactive start + the camp map (K10 v3 P·1 15525:43672, P·2 15529:43512)
   + Frida's time chips, then Sprout offers a sitter. Parts = SSC demo + camp map + A8 sitters.
   Starts on the lock screen (Thursday push) or from the "Plan a date night" tile on Assist home.
   Places are made up. Nothing is booked, sent or charged. */
(() => {
const X = window.Sprout, { sleep, el, toast, bsheet } = X;
const D = X.dn, { evening, est, confirmNight, sendToSitters, SITTERS, NIGHTS, CANT, joinNames, later, sub } = D;
const $ = s => document.querySelector(s);
const A = X.A, night = NIGHTS.sat;
const FALLBACK = 'linear-gradient(135deg,#e9dcc4,#c9b48f)';
const ph = (k, i = 1) => `background-image:url(${A}dn/${k}-${i}.jpg),${FALLBACK}`;
const face = f => `<i style="background-image:url(${A}${f})"></i>`;

/* x/y = place on the map layer (0–100%); home is at 44/52 */
const PLACES = {
  olive:  { n:'Olive & Ember', kind:'Italian · wood-fired', mi:2.1, price:'$$$', x:58, y:36, slots:['6:30', '7:00', '8:15'], best:'7:00', faces:['priya.webp', 'aisha.webp'], who:'Priya and Aisha went', hours:'Dinner 5–10 PM · patio and fireplace room', good:'Hand-made pasta, wood-fired fish, olive oil cake', pick:true },
  casa:   { n:'Casa Verde', kind:'Mexican · garden patio', mi:3.4, price:'$$', x:28, y:68, slots:['7:00', '7:30', '8:00'], best:'7:30', faces:['elena.webp'], who:'Elena’s family went', hours:'Dinner 5–11 PM · covered garden', good:'Wood-grilled tacos, mezcal list, tres leches', casual:true },
  kumo:   { n:'Kumo', kind:'Japanese · omakase', mi:4.0, price:'$$$$', x:72, y:72, slots:['8:30'], best:'8:30', faces:[], who:'New this spring', hours:'Two seatings, 6:00 and 8:30', good:'12-course tasting menu, about 2 hours' },
  juniper:{ n:'Juniper', kind:'Wine bar · small plates', mi:1.2, price:'$$', x:36, y:30, slots:['6:45', '7:15', '8:00'], best:'7:15', faces:['aisha.webp'], who:'Aisha went', hours:'4 PM–midnight · candlelit bar', good:'Small plates to share, natural wine', near:true },
  rosie:  { n:'Rosie’s', kind:'Texas smokehouse · patio', mi:2.8, price:'$$', x:80, y:42, slots:['6:30', '7:00', '7:45'], best:'7:00', faces:['priya.webp', 'elena.webp'], who:'Priya and Elena went', hours:'Dinner 5–10 PM · string-lit patio', good:'Brisket, smoked chicken, banana pudding', casual:true },
};
const sub1 = pl => `${pl.kind} · ${pl.mi} mi · ${pl.price}`;
const faces = pl => `<div class="faces"><span>${pl.faces.map(face).join('')}</span>${pl.who}</div>`;

/* ---------- the map: photo pins + home; gliding = translating the layer so the pick sits in the middle ---------- */
function mapHtml(keys, sel, labels, others = []){
  return `<div class="dnmap"><div class="dnlayer">
    <span class="dnhome" style="left:44%;top:52%"><i class="ph-fill ph-house"></i></span>
    ${others.map(o => { const pl = PLACES[o.k]; return `<button class="dnpin dim" data-o="${o.k}" style="left:${pl.x}%;top:${pl.y}%;${ph(o.k, 2)}" aria-label="${pl.n}, ${o.why}"></button>`; }).join('')}
    ${keys.map(k => { const pl = PLACES[k]; return `<button class="dnpin${k === sel ? ' on' : ''}" data-k="${k}" style="left:${pl.x}%;top:${pl.y}%;${ph(k, 2)}" aria-label="${pl.n}">${labels || k === sel ? `<span class="lbl">${pl.n}${pl.pick && labels ? ' · my pick' : ''}</span>` : ''}</button>`; }).join('')}
  </div><button class="dnrecenter" aria-label="Back to home"><i class="ph-bold ph-crosshair"></i></button><span class="dnhint"><i class="ph ph-hand-grabbing"></i>Drag to look around</span></div>`;
}
/* D2 (17 Nov): drag the map to look around. A move over 6 px is a drag, so pins only take real taps. */
function drag(map){
  const layer = map.querySelector('.dnlayer'); let st = null, moved = false;
  const cur = () => { const m = /translate\((-?[\d.]+)px,\s*(-?[\d.]+)px\)/.exec(layer.style.transform || ''); return m ? [+m[1], +m[2]] : [0, 0]; };
  const clamp = (x, y) => { const W = map.clientWidth, H = map.clientHeight, LW = W * 1.8, LH = LW * .75; return [Math.min(0, Math.max(W - LW, x)), Math.min(0, Math.max(H - LH, y))]; };
  map.addEventListener('pointerdown', e => { if (e.target.closest('.dnrecenter')) return; const [x, y] = cur(); st = { x, y, px:e.clientX, py:e.clientY, id:e.pointerId }; moved = false; layer.style.transition = 'none'; });
  map.addEventListener('pointermove', e => { if (!st || e.pointerId !== st.id) return; const dx = e.clientX - st.px, dy = e.clientY - st.py;
    if (!moved && Math.hypot(dx, dy) > 6) { moved = true; map.setPointerCapture(e.pointerId); map.classList.add('dragging'); map.querySelector('.dnhint')?.remove(); }
    if (moved) { const [x, y] = clamp(st.x + dx, st.y + dy); layer.style.transform = `translate(${x}px,${y}px)`; } });
  const end = () => { if (!st) return; st = null; layer.style.transition = ''; map.classList.remove('dragging'); };
  map.addEventListener('pointerup', end); map.addEventListener('pointercancel', end);
  map.addEventListener('click', e => { if (moved) { e.stopPropagation(); e.preventDefault(); moved = false; } }, true);
  map.querySelector('.dnrecenter').onclick = () => { const on = map.querySelector('.dnpin.on'); if (on) glide(map, on.dataset.k); };
  setTimeout(() => map.querySelector('.dnhint')?.classList.add('gone'), 3500);
}
function glide(map, k, instant){
  const layer = map.querySelector('.dnlayer'), W = map.clientWidth, H = map.clientHeight, LW = W * 1.8, LH = LW * .75;
  const pl = PLACES[k], cx = (pl.x + 44) / 2, cy = (pl.y + 52) / 2;   // keep home in view: centre between home and the place
  const tx = Math.min(0, Math.max(W - LW, W / 2 - cx / 100 * LW)), ty = Math.min(0, Math.max(H - LH, H / 2 - cy / 100 * LH));
  if (instant) { layer.style.transition = 'none'; layer.style.transform = `translate(${tx}px,${ty}px)`; layer.getBoundingClientRect(); layer.style.transition = ''; }
  else layer.style.transform = `translate(${tx}px,${ty}px)`;
  map.querySelectorAll('.dnpin').forEach(b => {
    const on = b.dataset.k === k; b.classList.toggle('on', on);
    if (!map.classList.contains('tall')) { const l = b.querySelector('.lbl'); if (on && !l) b.appendChild(el(`<span class="lbl">${PLACES[b.dataset.k].n}</span>`)); if (!on && l) l.remove(); }
  });
}
const times = (pl, t) => `<div class="dntimes">${pl.slots.map(s => `<button class="chip${s === t ? ' sel' : ''}" data-t="${s}">${s} PM</button>`).join('')}</div>`;

/* ---------- details sheet (camp details: gallery, facts, footer CTA) with time chips ---------- */
function details(k, t){
  const pl = PLACES[k];
  return new Promise(res => {
    let time = t || pl.best;
    const v = bsheet({ onBack:() => res(null),
      body:`<div class="bgal"><i style="${ph(k, 1)}"></i><i style="${ph(k, 2)}"></i><i style="${ph(k, 3)}"></i></div>
        <div class="btitle">${pl.n}</div><div class="bsub">${sub1(pl)}</div>
        ${pl.pick ? `<span class="mypick"><i class="ph ph-sparkle"></i>My pick: a patio table at 7</span>` : ''}
        <div class="fact"><i class="ph ph-clock"></i>${pl.hours}</div>
        <div class="fact"><i class="ph ph-fork-knife"></i>${pl.good}</div>
        <div class="fact"><i class="ph ph-map-pin"></i>${pl.mi} mi · about ${Math.round(pl.mi * 4)} min from home</div>
        <div class="fact"><i class="ph ph-arrow-counter-clockwise"></i>Free to cancel until ${night.cancel}</div>
        ${pl.faces.length ? faces(pl) : ''}
        <div class="bq" style="margin-top:12px">Table for 2 · ${night.day}</div>${times(pl, time)}`,
      foot:`<div class="bprice"><b>${pl.price}</b><small>Pay at the table</small></div><button type="button" class="btn" data-go>Book ${time} PM</button>` });
    const go = v.foot.querySelector('[data-go]');
    v.body.querySelectorAll('.dntimes .chip').forEach(b => b.onclick = () => { time = b.dataset.t; v.body.querySelectorAll('.dntimes .chip').forEach(x => x.classList.toggle('sel', x === b)); go.textContent = `Book ${time} PM`; });
    go.onclick = () => { v.close(); res(time); };
  });
}

/* ---------- step 1: one pick on the map (K10 v3 P·1) ---------- */
function pickCard(p){
  return new Promise(res => {
    let k = 'olive', t = PLACES.olive.best;
    const keys = ['olive', 'casa', 'juniper'];
    const c = p.block(`<div class="card">${mapHtml(keys, k)}<div class="dnbody"></div>
      <div class="chips" data-acts style="margin-top:14px"><button class="chip" data-a="book"></button><button class="chip" data-a="others">Show me others</button><button class="chip" data-a="no">Not this week</button></div></div>`).querySelector('.card');
    const map = c.querySelector('.dnmap'), body = c.querySelector('.dnbody'), bookChip = c.querySelector('[data-a=book]');
    const paint = swap => {
      const pl = PLACES[k];
      body.innerHTML = `<div class="dnrow${swap ? ' swap' : ''}"><span class="thumb" style="${ph(k)}"></span><div><div class="ttl">${pl.n}</div><div class="sub">${sub1(pl)}</div>${pl.faces.length ? faces(pl) : `<div class="fs" style="margin-top:6px">${pl.who}</div>`}</div></div>
        ${times(pl, t)}<div class="dnmeta"><small>Table for 2 · free to cancel until ${night.cancel}</small><button class="link" data-det>Details <i class="ph ph-caret-right"></i></button></div>`;
      bookChip.textContent = `Book ${pl.n} · ${t} PM`;
      body.querySelectorAll('.dntimes .chip').forEach(b => b.onclick = () => { t = b.dataset.t; paint(false); });
      body.querySelector('[data-det]').onclick = async () => { const r = await details(k, t); if (r) { t = r; finish({ a:'book', k, t }); } };
    };
    const finish = r => { c.querySelectorAll('button').forEach(b => b.style.pointerEvents = 'none'); c.querySelector('[data-acts]').classList.add('done');
      if (r.a === 'book') bookChip.classList.add('sel'); p.me(r.a === 'book' ? `Book ${PLACES[r.k].n} · ${r.t} PM` : r.a === 'others' ? 'Show me others' : 'Not this week'); res(r); };
    map.querySelectorAll('.dnpin').forEach(b => b.onclick = () => { if (b.dataset.k === k) return; k = b.dataset.k; t = PLACES[k].best; glide(map, k); paint(true); });
    c.querySelector('[data-a=book]').onclick = () => finish({ a:'book', k, t });
    c.querySelector('[data-a=others]').onclick = () => finish({ a:'others' });
    c.querySelector('[data-a=no]').onclick = () => finish({ a:'no' });
    paint(false); requestAnimationFrame(() => glide(map, k, true)); p.scroll();
  });
}

/* ---------- step 2: every place on the map + cards you swipe; pins and cards stay in sync (K10 v3 P·2) ---------- */
function allPlaces(p){
  return new Promise(res => {
    const keys = ['olive', 'juniper', 'casa', 'rosie', 'kumo'];   // closest first after my pick
    let k = 'olive', t = PLACES.olive.best, lock = false;
    const c = p.block(`<div class="card" style="padding:6px">${mapHtml(keys, k, true)}</div>`).querySelector('.card');
    c.querySelector('.dnmap').classList.add('wide');
    const car = p.block(`<div class="dncar">${keys.map(key => { const pl = PLACES[key]; return `<div class="card" data-k="${key}"><div class="ph" style="${ph(key)}"></div>
      <div class="ttl">${pl.n}${pl.pick ? ' <span class="pill" style="font-size:11px;vertical-align:middle">My pick</span>' : ''}</div><div class="sub">${sub1(pl)}</div>
      ${pl.faces.length ? faces(pl) : `<div class="fs" style="margin-top:6px">${pl.who}</div>`}
      ${times(pl, key === k ? t : pl.best)}<div class="dnmeta"><small>Table for 2</small><button class="link" data-det="${key}">Details <i class="ph ph-caret-right"></i></button></div></div>`; }).join('')}</div>`).querySelector('.dncar');
    const ctrl = p.block(`<div><button class="btn dnbook" data-go></button></div>`);
    const go = ctrl.querySelector('[data-go]'), map = c.querySelector('.dnmap');
    const cards = [...car.querySelectorAll('.card')];
    const select = (key, from) => {
      if (key !== k) { k = key; t = PLACES[k].best; }
      glide(map, k);
      cards.forEach(x => { x.classList.toggle('on', x.dataset.k === k); x.querySelectorAll('.dntimes .chip').forEach(b => b.classList.toggle('sel', x.dataset.k === k && b.dataset.t === t)); });
      go.textContent = `Book ${PLACES[k].n} · ${t} PM`;
      if (from !== 'swipe') { const card = cards.find(x => x.dataset.k === k); lock = true; car.scrollTo({ left: card.offsetLeft - (car.clientWidth - card.clientWidth) / 2, behavior:'smooth' }); setTimeout(() => lock = false, 500); }
    };
    map.querySelectorAll('.dnpin').forEach(b => b.onclick = () => select(b.dataset.k, 'pin'));
    let st; car.addEventListener('scroll', () => { if (lock) return; clearTimeout(st); st = setTimeout(() => {
      const mid = car.scrollLeft + car.clientWidth / 2; const near = cards.reduce((a, x) => Math.abs(x.offsetLeft + x.clientWidth / 2 - mid) < Math.abs(a.offsetLeft + a.clientWidth / 2 - mid) ? x : a);
      if (near.dataset.k !== k) select(near.dataset.k, 'swipe'); }, 120); });
    cards.forEach(x => {
      x.querySelectorAll('.dntimes .chip').forEach(b => b.onclick = () => { k = x.dataset.k; t = b.dataset.t; select(k, 'pin'); });
      x.querySelector('[data-det]').onclick = async () => { select(x.dataset.k, 'pin'); const r = await details(x.dataset.k, t); if (r) { t = r; done(); } };
    });
    const done = () => { cards.forEach(x => x.style.pointerEvents = 'none'); map.querySelectorAll('.dnpin').forEach(x => x.style.pointerEvents = 'none'); ctrl.remove(); p.me(`Book ${PLACES[k].n} · ${t} PM`); res({ k, t }); };
    go.onclick = done;
    requestAnimationFrame(() => { glide(map, k, true); select(k, 'pin'); });
    /* keep the map in view while swiping: line the map card up with the top of the chat */
    setTimeout(() => p.chat.scrollTo({ top: c.closest('.row').offsetTop - p.chat.offsetTop - 8, behavior:'smooth' }), 600);
  });
}

/* ---------- the flow ---------- */
X.flows.dateD = async (p, opt = {}) => {
  sub(p, `Date night · ${night.day}`);
  await p.say(opt.fromPush ? 'You and Dana are both free Saturday after 6, and your last night out was 5 weeks ago. Here’s what I found.' : 'Let’s plan it. You and Dana are both free Saturday after 6. Here’s what I found.', 1000);
  p.note('Checked 14 places', 'Tables for 2 on Saturday · under 15 min from home', 'ph-fork-knife');
  await sleep(300);
  await p.say('My pick is Olive & Ember: a patio table at 7, and Priya and Aisha from Maya’s class loved it.', 1000);
  p.set('Date night idea', { when:'Sat' });
  let r = await pickCard(p);
  if (r.a === 'no') {
    await p.say('Okay, nothing booked. Should I suggest one again next week?', 800);
    const n = await p.chips(['Yes, next week', 'Stop suggesting date nights']);
    p.set(n === 0 ? 'Next week' : 'Suggestions off', { done:true });
    await p.say(n === 0 ? 'I’ll check your calendars next Thursday.' : 'Got it. No more date night ideas. You can still ask me anytime.', 800);
    return;
  }
  if (r.a === 'others') {
    await p.say('Here are 5 with tables Saturday. Tap a pin or swipe the cards. Olive & Ember is still my pick.', 1000);
    p.set('Pick a place', { when:'Sat' });
    const o = await allPlaces(p); r = { a:'book', k:o.k, t:o.t };
  }
  const pl = PLACES[r.k], pick = { place:pl, time:r.t };
  const w = p.work(`Booking ${pl.n}`, `${night.day} · ${r.t} PM · 2 people`); await sleep(1500);
  w.done(`Table booked · ${pl.n}`, `${night.day} · ${r.t} PM · free to cancel until ${night.cancel}`, 'ph-fork-knife');
  p.set(`${pl.n} · ${r.t} PM`, { when:'Sat' });

  /* Sprout offers the sitter (A8 parts) */
  const ev = evening(r.t);
  await p.say(`You’re booked. While you’re at dinner, want me to find someone for Maya and Jake, ${ev.label}?`, 1000);
  const sc = p.block(`<div class="card">
    <div class="ctop"><span class="logo mono">A</span><div><div class="eyebrow">Sitter · ${night.day} · ${ev.label}</div><div class="ttl">Alex has sat for you 4 times</div></div></div>
    <hr><div class="fact"><i class="ph ph-currency-dollar"></i>$${SITTERS.Alex.rate}/hour · about $${est('Alex', ev)} for the night</div>
    <div class="fact"><i class="ph ph-baby"></i>Maya, 7 · Jake, 5 · at home</div>
    <div class="foot"><i class="ph ph-info"></i>I only ask. Nobody is booked until you confirm.</div></div>`).querySelector('.card');
  const s = await p.chips(['Ask Alex', 'Ask all my sitters', 'We’re covered'], { into:sc });
  if (s === 2) {
    await p.say('Got it, no sitter. Your table is on the family calendar, so Dana has it too.', 900);
    return finale(p, { pick, ev });
  }
  const asked = s === 0 ? ['Alex'] : ['Alex', 'Sam', 'Riley'];
  await sendToSitters(p, asked, night, ev);
  p.set('Waiting for a sitter', { when:'Sat' });
  await p.say('Sent. You can close Sprout. I’ll tell you when someone answers.', 800);
  const yes = asked.filter(n => !CANT.includes(n));
  await later(p, { status:'Waiting for sitters', small:`${night.day} · ${ev.label}`, ms:3500, title: yes.length > 1 ? `${joinNames(yes)} are free` : `${yes[0]} is free`, body:'For your date night Saturday' });
  let name = yes[0];
  if (yes.length > 1) {
    await p.say(`${joinNames(yes)} are free. Riley can’t make it. Who should I confirm?`, 900);
    name = yes[await p.chips(yes.map(x => `${x} · about $${est(x, ev)}`))];
  } else await p.say(`${name} is free. Check the night before I confirm.`, 800);
  while (!await confirmNight(p, { name, night, ev, pick })) await p.say(`Okay. ${name} is holding the evening for you.`, 600);
  await later(p, { status:`${name} · confirmation requested`, small:`${night.day} · ${ev.label}`, ms:2600, title:`${name} confirmed`, body:'Your date night is set' });
  p.note(`${name} · confirmed`, `${night.day} · ${ev.label}`, 'ph-calendar-check');
  await p.say(`${name} confirmed. Your night is set.`, 800);
  return finale(p, { pick, ev, name });
};
async function finale(p, { pick, ev, name }){
  const pl = pick.place;
  p.block(`<div class="card"><div class="cover" style="${ph(Object.keys(PLACES).find(k => PLACES[k] === pl), 3)}"></div>
    <div class="ctop"><span class="icotile"><i class="ph ph-moon-stars"></i></span><div><div class="eyebrow">Date night · ${night.day}</div><div class="ttl">Your evening</div></div></div>
    <hr><div class="fact"><i class="ph ph-fork-knife"></i>${pl.n} · ${pick.time} PM · table for 2</div>
    ${name ? `<div class="fact"><i class="ph ph-baby"></i>${name} · ${ev.label} · about $${est(name, ev)}</div>` : ''}
    <div class="fact"><i class="ph ph-calendar-check"></i>On the family calendar · Dana has it too</div></div>`);
  p.set(`${pl.n} ${pick.time}${name ? ' · ' + name : ''}`, { when:'Sat', done:true });
  const d = await p.chips(['Text Dana the plan', 'Done']);
  await p.say(d === 0 ? 'Sent Dana the plan from you. Have a lovely night.' : 'Have a lovely night.', 700);
  if (d === 1) X.closeSheet();
}

X.dnm = { PLACES, mapHtml, glide, drag, ph, details, faces, sub1, times, night };

/* ---------- entries: lock-screen push (route) and the Assist home tile ---------- */
const route = location.pathname.split('/').filter(Boolean)[0] || '';
if (route === 'date-night-v2') {
  const nights = X.TILES.nights, i = nights.findIndex(x => x.k === 'nightOut');
  nights.splice(i, 1, { k:'dateD', t:'Plan a date night', s:'Dinner, then a sitter', icon:'calendar-check' }); X.renderHome();
  const head = $('.dbhead .mid span'); if (head) head.textContent = 'Thursday, July 30';
  const lock = el(`<div class="lock" role="button" aria-label="Open the Sprout notification">
    <div class="ldate">Thursday, July 30</div><div class="ltime">4:12</div>
    <div class="lnote"><img src="/assets/app-icon-180.png" alt=""><div><b>Sprout<small>now</small></b><p><strong>Saturday night is free</strong><br>You and Dana are both free after 6. Olive &amp; Ember has a table at 7. Date night?</p></div></div>
    <div class="lhint">Tap the notification</div></div>`);
  $('#phone').appendChild(lock);
  lock.querySelector('.lnote').onclick = () => { lock.classList.add('gone'); setTimeout(() => { lock.remove(); X.start('dateD', { fromPush:true }); }, 380); };
}
})();
