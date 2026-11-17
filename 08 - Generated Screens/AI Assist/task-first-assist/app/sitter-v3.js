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
/* review routes fake a family state; the real app (every other route) starts with no sitters and fills MY as you go */
const STATE = { 'sitter-v3':'saved', 'sitter-v3-class':'class', 'sitter-v3-none':'none' }[route] || 'app';

/* ---------- family + calendar (today is Monday, July 27) ---------- */
const KIDS = [{ n:'Maya', age:7, cls:'Miss Taylor’s class', img:A + 'maya.webp' }, { n:'Jake', age:5, cls:'Miss Poole’s class', img:A + 'jake.webp' }];
const DAYS = [['Thu', 30, 'Jul'], ['Fri', 31, 'Jul', 1], ['Sat', 1, 'Aug', 1], ['Sun', 2, 'Aug'], ['Mon', 3, 'Aug'], ['Tue', 4, 'Aug'], ['Wed', 5, 'Aug']]
  .map(([w, d, m, free]) => ({ w, d, m, free, short:w, day:`${w}, ${m} ${d}`, long:`${{ Thu:'Thursday', Fri:'Friday', Sat:'Saturday', Sun:'Sunday', Mon:'Monday', Tue:'Tuesday', Wed:'Wednesday' }[w]}, ${m === 'Jul' ? 'July' : 'August'} ${d}`, cancel:'the evening before' }));
/* D4 (17 Nov): no real sitter photos, a placeholder that shows the sitter is a woman or a man */
const AV = g => `${A}sitters/${g === 'm' ? 'man' : 'woman'}.webp`;   // 3D clay avatars (Figma AI, 17 Nov), same style as the clay icons
const clay = n => `<span class="clayico" style="background-image:url(${A}clay/${n}.png)"></span>`;
const SAVED = [
  { n:'Alex', ch:'Messages', phone:'(512) 555-0114', venmo:'@alex-rivera', times5:4, rate:25, by:'Saved by you', times:'Sat for you 4 times', photo:AV('f') },
  { n:'Sam', ch:'WhatsApp', phone:'(512) 555-0127', venmo:'@sam-okafor', rate:28, by:'Saved by Dana', times:'Sat for you twice', photo:AV('m') },
  { n:'Riley', ch:'Messages', phone:'(512) 555-0136', rate:24, by:'Saved by you', times:'Sat for you once', photo:AV('f'), cant:true },
];
const CLASS_SITTERS = [
  { n:'Taylor', ch:'Messages', phone:'(512) 555-0193', rate:26, parent:'Priya', kid:'Leo', pimg:'priya.webp', cls:'Maya’s class', times:'Sits for them most Fridays', photo:AV('f') },
  { n:'Jordan', ch:'Messages', phone:'(512) 555-0148', rate:22, parent:'Aisha', kid:'Ava', pimg:'aisha.webp', cls:'Maya’s class', times:'Sat for them 6 times', photo:AV('m'), cant:true },
  { n:'Morgan', ch:'WhatsApp', phone:'(512) 555-0172', rate:25, parent:'Elena', kid:'Noah', pimg:'elena.webp', cls:'Jake’s class', times:'Their sitter since last year', photo:AV('f') },
];
const LEADS = [
  { n:'Taylor', ch:'Messages', phone:'(512) 555-0193', rate:26, parent:'Priya', kid:'Leo', pimg:'priya.webp', note:'Sits for us most Fridays. Great with little ones.', photo:AV('f') },
  { n:'Jordan', ch:'Messages', phone:'(512) 555-0148', rate:22, parent:'Aisha', kid:'Ava', pimg:'aisha.webp', note:'College student, very reliable.', photo:AV('m'), cant:true },
];
const MY = STATE === 'saved' ? SAVED.map(x => ({ ...x })) : [];   // the family's saved sitters
const remember = s => { const i = MY.findIndex(x => x.n === s.n); if (i < 0) MY.push(s); else MY[i] = { ...MY[i], ...s }; return MY.find(x => x.n === s.n); };
/* the family's details Sprout fills in, all editable (F4) */
const FAMILY = { address:'10212 Banks Court, Austin', notes:'Bedtime 8:30. Maya reads first; Jake sleeps with the hall light on.' };
const face = (s, size = 46) => s.photo ? `<span class="uaph" style="width:${size}px;height:${size}px;background-image:url(${s.photo})"></span>` : `<span class="uaph uamono" style="width:${size}px;height:${size}px">${s.n[0]}</span>`;

/* ---------- time helpers (minutes since midnight) ---------- */
const tl = m => { const h = Math.floor(m / 60) % 24, mm = m % 60, hh = h % 12 || 12; return `${hh}${mm ? ':' + String(mm).padStart(2, '0') : ''} ${h < 12 ? (h === 0 && m >= 1440 ? 'AM' : 'AM') : 'PM'}`; };
const tshort = m => tl(m).replace(' PM', '').replace(' AM', '');
const range = (a, b) => (Math.floor(a / 720) % 2 === Math.floor(b / 720) % 2 && b - a < 720) ? `${tshort(a)}–${tl(b)}` : `${tl(a)}–${tl(b)}`;
const hrs = h => `${h % 1 ? h.toFixed(1) : h} hour${h === 1 ? '' : 's'}`;
const parseT = t => { const [h, m] = t.split(':').map(Number); return (h + 12) * 60 + (m || 0); };

/* ---------- when (E1, 17 Nov): week strip, then quick picks + Starts / Ends fields that open a time wheel.
   Any time of day works (10 AM, 1 PM, overnight); the common evenings are one tap. ---------- */
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
function whenCard(p, { mode = 'sitter', preset } = {}){
  return new Promise(res => {
    const dinner = mode === 'dinner';
    let day = preset ? DAYS.find(d => d.w === preset.w) : null, from = preset?.from ?? (dinner ? 1140 : 1080), to = preset?.to ?? 1320;
    const QUICK = dinner ? [[1080], [1110], [1140], [1170], [1200]] : [[540, 720, 'Morning'], [780, 1020, 'Afternoon'], [1080, 1320, 'Evening']];
    const c = p.block(`<div class="card"><div class="ctop">${clay('calendar-check')}<div><div class="eyebrow">${dinner ? 'Date night' : 'Sitter'}</div><div class="ttl">${dinner ? 'When are you going out?' : 'When do you need a sitter?'}</div></div></div>
      <div class="ua-days">${DAYS.map((d, i) => `<button class="ua-day${d.free ? ' free' : ''}" data-i="${i}"><small>${d.w}</small><b>${d.d}</b><i></i></button>`).join('')}</div>
      <div class="ua-legend"><i></i>You and Dana are both free</div>
      <div class="dlabel" style="margin-top:16px">Quick options</div>
      <div class="qk">${QUICK.map(([a, b], i) => `<button class="chip" data-q="${i}">${dinner ? tl(a) : range(a, b)}</button>`).join('')}</div>
      <div class="tf">${dinner ? `<button class="tf-f" data-f><small>Table around</small><b data-fv></b><i class="ph ph-caret-down"></i></button>`
        : `<button class="tf-f" data-f><small>Starts</small><b data-fv></b><i class="ph ph-caret-down"></i></button><button class="tf-f" data-t><small>Ends</small><b data-tv></b><i class="ph ph-caret-down"></i></button>`}</div>
      <div class="ua-dur"><i class="ph-fill ph-${dinner ? 'fork-knife' : 'moon-stars'}"></i><span data-d></span></div>
      <button class="btn" style="margin-top:14px">Next</button></div>`).querySelector('.card');
    const btn = c.querySelector('.btn');
    const paint = () => {
      c.querySelectorAll('.ua-day').forEach(b => b.classList.toggle('on', DAYS[+b.dataset.i] === day));
      c.querySelector('[data-fv]').textContent = tl(from);
      if (!dinner) c.querySelector('[data-tv]').innerHTML = tl(to) + (to >= 1440 ? ' <em>next day</em>' : '');
      c.querySelectorAll('[data-q]').forEach(b => { const [a, z] = QUICK[+b.dataset.q]; b.classList.toggle('sel', dinner ? a === from : a === from && z === to); });
      c.querySelector('[data-d]').textContent = !day ? 'Pick a day' : dinner ? `${day.day} · table for 2 around ${tl(from)}` : `${day.day} · ${range(from, to)} · ${hrs((to - from) / 60)}`;
      btn.disabled = !day;
    };
    c.querySelectorAll('.ua-day').forEach(b => b.onclick = () => { day = DAYS[+b.dataset.i]; paint(); });
    c.querySelectorAll('[data-q]').forEach(b => b.onclick = () => { const [a, z] = QUICK[+b.dataset.q]; from = a; if (!dinner) to = z; paint(); });
    c.querySelector('[data-f]').onclick = async () => { const m = await timeWheel({ title: dinner ? 'Dinner time' : 'Start time', value:from }); if (m == null) return;
      from = m % 1440; if (!dinner && to <= from) to = Math.min(from + 240, from + 1439); paint(); };
    /* an end before the start only makes sense overnight (an AM end); an earlier PM end is a mistake, so say so */
    if (!dinner) c.querySelector('[data-t]').onclick = async () => { const m = await timeWheel({ title:'End time', value:to }); if (m == null) return;
      let e = m % 1440; if (e <= from) { if (e < 720 && e + 1440 - from <= 16 * 60) e += 1440; else return toast(`Ends before it starts. Pick a time after ${tl(from)}.`); }
      to = e; paint(); };
    btn.onclick = () => { if (!day) return; c.querySelectorAll('button').forEach(b => b.style.pointerEvents = 'none'); btn.remove(); p.me(dinner ? `${day.day}, around ${tl(from)}` : `${day.day}, ${range(from, to)}`); res({ day, from, to }); };
    paint(); p.scroll();
  });
}

/* ---------- which kids (A): photo rows, tint when on, all on ---------- */
function kidsCard(p, cur){
  return new Promise(res => {
    const c = p.block(`<div class="card"><div class="ctop">${clay('two-people')}<div><div class="eyebrow">Sitter</div><div class="ttl">Who is the sitter for?</div></div></div>
      <div class="ua-rows">${KIDS.map(k => `<button class="ua-row${!cur || cur.some(c => c.n === k.n) ? ' on' : ''}" data-n="${k.n}"><span class="uaph" style="background-image:url(${k.img})"></span><span class="tx"><b>${k.n}</b><small>${k.age} · ${k.cls}</small></span><span class="ck"><i class="ph-bold ph-check"></i></span></button>`).join('')}</div>
      <button class="btn" style="margin-top:14px">Next · Maya and Jake</button></div>`).querySelector('.card');
    if (cur) c.querySelector('.btn').textContent = `Next · ${joinNames(cur.map(k => k.n))}`;
    const btn = c.querySelector('.btn'), picks = [...c.querySelectorAll('.ua-row')];
    const names = () => picks.filter(x => x.classList.contains('on')).map(x => x.dataset.n);
    picks.forEach(x => x.onclick = () => { x.classList.toggle('on'); const n = names(); btn.disabled = !n.length; btn.textContent = n.length ? `Next · ${joinNames(n)}` : 'Pick at least one'; });
    btn.onclick = () => { const n = names(); picks.forEach(x => x.style.pointerEvents = 'none'); btn.remove(); p.me(`For ${joinNames(n)}`); res(KIDS.filter(k => n.includes(k.n))); };
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
function editFields(title, fields){
  return new Promise(res => {
    const v = bsheet({ onBack:() => res(null), body:`<div class="bh"><span class="icotile"><i class="ph ph-pencil-simple"></i></span><b>${title}</b></div>
      <div class="fields" style="margin-top:0">${fields.map(([l, val, type]) => type === 'area' ? `<label class="field in"><div style="width:100%"><div class="l">${l}</div><textarea class="edt" rows="3">${val}</textarea></div></label>` : `<label class="field in"><div style="width:100%"><div class="l">${l}</div><input value="${val}" ${type === 'num' ? 'inputmode="decimal"' : ''} autocomplete="off"></div></label>`).join('')}</div>`,
      foot:`<button type="button" class="btn" data-go>Save</button>` });
    v.foot.querySelector('[data-go]').onclick = () => { const vals = [...v.body.querySelectorAll('input, textarea')].map(x => x.value.trim()); v.close(); res(vals); };
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
async function requestCard(p, w, kids, dinner){
  const rows = () => [['when', 'When', `${w.day.day} · ${range(w.from, w.to)}`, `${hrs((w.to - w.from) / 60)}${dinner ? ` · dinner at ${dinner}` : ''}`],
    ['kids', 'Kids', kids.map(k => `${k.n}, ${k.age}`).join(' · '), 'Who the sitter is for'],
    ['where', 'Where', FAMILY.address, 'Shared only with the sitter you book'],
    ['notes', 'Notes for the sitter', FAMILY.notes, 'Goes in the booking text']];
  const card = p.block(`<div class="card">
    <div class="ctop">${clay('event')}<div><div class="eyebrow">Sitter request</div><div class="ttl" data-ttl>${w.day.long}</div></div></div>
    <div class="fields" data-rows></div>
    <button class="btn" data-ok style="margin-top:14px">Looks right</button>
    <div class="foot"><i class="ph ph-pencil-simple"></i>Tap the pencil to change anything</div></div>`).querySelector('.card');
  const paint = (changed) => {
    card.querySelector('[data-ttl]').textContent = w.day.long;
    card.querySelector('[data-rows]').innerHTML = rows().map(([k, l, v, sub]) => `<div class="field${k === changed ? ' just' : ''}"><div><div class="l">${l}</div><div class="v">${v}</div><div class="fs">${sub}</div></div><button class="s ed" data-ed="${k}" aria-label="Edit ${l}"><i class="ph ph-pencil-simple"></i></button></div>`).join('');
    card.querySelectorAll('[data-ed]').forEach(b => b.onclick = () => edit(b.dataset.ed));
  };
  let busy = false;
  const edit = async what => {
    if (busy) return; busy = true; let ok = false;
    if (what === 'when') { const nw = await inSheet(sp => whenCard(sp, { preset:{ w:w.day.w, from:w.from, to:w.to } }), 'Change the time'); if (nw) { Object.assign(w, { day:nw.day, from:nw.from, to:nw.to }); ok = true; } }
    if (what === 'kids') { const nk = await inSheet(sp => kidsCard(sp, kids)); if (nk) { kids.splice(0, kids.length, ...nk); ok = true; } }
    if (what === 'where') { const a = await editFields('Where the sitter comes', [['Address', FAMILY.address]]); if (a && a[0]) { FAMILY.address = a[0]; ok = true; } }
    if (what === 'notes') { const t = await editText('Notes for the sitter', FAMILY.notes, { rows:4, label:'Bedtime, food, anything the sitter should know' }); if (t) { FAMILY.notes = t; ok = true; } }
    if (ok) { paint(what); toast('Updated'); }
    busy = false;
  };
  paint(); p.scroll();
  await new Promise(r => card.querySelector('[data-ok]').onclick = () => { if (!busy) r(); });
  card.querySelectorAll('button').forEach(b => b.style.pointerEvents = 'none'); card.querySelector('[data-ok]').remove(); card.querySelector('.foot').remove();
  p.me('Looks right');
}

/* ---------- add a sitter you know (sheet, saved to your account) ---------- */
function addSitter(){
  return new Promise(res => {
    const v = bsheet({ onBack:() => res(null),
      body:`<div class="bh"><span class="icotile"><i class="ph ph-user-plus"></i></span><b>Add a sitter</b></div>
        <p class="bp">Saved to your family’s sitters, so I can ask them next time too. Only you and Dana see their number.</p>
        <div class="fields" style="margin-top:0">
          <label class="field in"><div style="width:100%"><div class="l">Name</div><input value="Casey Nguyen" autocomplete="off"></div></label>
          <label class="field in"><div style="width:100%"><div class="l">Phone</div><input inputmode="tel" value="(512) 555-0161" autocomplete="off"></div></label>
          <label class="field in"><div style="width:100%"><div class="l">Rate per hour (optional)</div><input inputmode="numeric" value="$24" autocomplete="off"></div></label></div>
        <div class="dlabel">Show as</div><div class="fchips" style="margin-top:6px"><button type="button" class="chip sel" data-g="f">She</button><button type="button" class="chip" data-g="m">He</button></div>
        <div class="dlabel">Text them on</div><div class="fchips" style="margin-top:6px"><button type="button" class="chip sel" data-c="Messages">Messages</button><button type="button" class="chip" data-c="WhatsApp">WhatsApp</button></div>`,
      foot:`<button type="button" class="btn" data-go>Save sitter</button>` });
    let ch = 'Messages'; v.body.querySelectorAll('[data-c]').forEach(b => b.onclick = () => { ch = b.dataset.c; v.body.querySelectorAll('[data-c]').forEach(x => x.classList.toggle('sel', x === b)); });
    let g = 'f'; v.body.querySelectorAll('[data-g]').forEach(b => b.onclick = () => { g = b.dataset.g; v.body.querySelectorAll('[data-g]').forEach(x => x.classList.toggle('sel', x === b)); });
    v.foot.querySelector('[data-go]').onclick = () => { const [n, ph, r] = [...v.body.querySelectorAll('input')].map(i => i.value); v.close(); toast('Saved to your sitters');
      res(remember({ n:n.split(' ')[0] || 'Casey', full:n, phone:ph, rate:parseInt(r.replace(/\D/g, '')) || 24, by:'Added by you', times:'New to your family', photo:AV(g), ch })); };
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
          <small>${s.added ? `${s.phone} · added by you` : line(s)} · $${s.rate}/hr</small></span><span class="ck"><i class="ph-bold ph-check"></i></span></button>`; }
    const btn = c.querySelector('.btn'), all = c.querySelector('[data-all]');
    let rows = [...c.querySelectorAll('.sl-row')];
    const chosen = () => rows.filter(r => r.classList.contains('on')).map(r => list[+r.dataset.i]);
    const paint = () => { const n = chosen(); btn.disabled = !n.length; btn.textContent = n.length ? 'Ask ' + joinNames(n.map(s => s.n)) : 'Pick at least one';
      all.textContent = n.length === rows.length ? 'Clear all' : 'Select all';
      c.querySelector('[data-est]').textContent = n.length ? `About $${Math.min(...n.map(s => Math.round(s.rate * hours)))}${n.length > 1 ? '–$' + Math.max(...n.map(s => Math.round(s.rate * hours))) : ''} for ${hrs(hours)}` : ''; };
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
        <div class="cmp-to"><span>To:</span>${face(s, 28)}<b>${s.n}</b><small>${s.phone || ''}</small></div>
        <div class="cmp-thread"><div class="cmp-bub${wa ? ' wa' : ''}" data-bub>${text || shortMsg(s, w, kids)}</div></div>
        <button class="textbtn cmp-edit" data-edit><i class="ph ph-pencil-simple"></i> Edit message</button>
        <p class="hint2">${hint || `Sent from your number, so ${s.n} knows it’s you. When ${s.n} texts back, tell Sprout who’s free.`}</p>`,
      foot:`<button type="button" class="btn" data-go><i class="ph-fill ph-paper-plane-tilt"></i>&nbsp;Send</button>` });
    v.body.querySelector('[data-edit]').onclick = async () => { const b = v.body.querySelector('[data-bub]'); const t = await editText(`Message to ${s.n}`, b.textContent); if (t) b.textContent = t; };
    v.foot.querySelector('[data-go]').onclick = () => { v.close(); res(true); };
  });
}
/* E8 (17 Nov): each sitter row has its own Send (tap, tap, tap), and "Send to all" opens the compose sheets one after
   another. Apple doesn't let any app text from your number without you tapping Send, so "all" = one Send per sitter,
   with no stops in between. Skip = "I'll text them myself". */
async function sendEach(p, asked, w, kids){
  await p.say(asked.length > 1 ? `Send each one from your phone, or send them all in a row. Numbers stay private either way.` : `Send it from your phone, so ${asked[0].n} knows it’s you.`, 900);
  const icon = s => `ph-fill ph-${s.ch === 'WhatsApp' ? 'whatsapp-logo' : 'chat-circle-dots'}`;
  const c = p.block(`<div class="card"><div class="ctop">${clay('two-people')}<div><div class="eyebrow">From your phone</div><div class="ttl">Send the request</div></div></div>
    <div class="sl">${asked.map(s => `<div class="sl-row snd-row" data-n="${s.n}">${face(s, 36)}<span class="sl-tx"><span class="sl-n">${s.n}</span><small data-st>${s.ch || 'Messages'}</small></span>
      <button class="snd" data-send><i class="${icon(s)}"></i>Send</button></div>`).join('')}</div>
    <details class="msgpv"><summary>See the message</summary><p>${shortMsg({ n:'[name]' }, w, kids).replace('[name]', asked.length > 1 ? 'Alex' : asked[0].n)}</p></details>
    ${asked.length > 1 ? `<button class="btn" data-all style="margin-top:12px"></button>` : ''}
    <button class="textbtn skip" data-skip>Skip, I’ll text them myself</button></div>`).querySelector('.card');
  c.querySelector('.msgpv p').textContent = shortMsg(asked[0], w, kids) + (asked.length > 1 ? ' (each sitter gets their own name)' : '');
  const sent = new Set(), allBtn = c.querySelector('[data-all]');
  const markSent = s => { sent.add(s.n); const r = c.querySelector(`[data-n="${s.n}"]`); r.classList.add('on');
    r.querySelector('[data-st]').textContent = `Sent on ${s.ch || 'Messages'} · just now`; const b = r.querySelector('[data-send]'); b.classList.add('done'); b.innerHTML = '<i class="ph-bold ph-check"></i>Sent'; };
  const paint = () => { const left = asked.filter(s => !sent.has(s.n)); if (allBtn) { allBtn.style.display = left.length > 1 ? '' : 'none'; allBtn.innerHTML = `<i class="ph-fill ph-paper-plane-tilt"></i>&nbsp;Send to ${left.length === asked.length ? 'all ' + left.length : 'the other ' + left.length}`; } };
  paint(); p.scroll();
  await new Promise(done => {
    let busy = false;
    const check = () => { paint(); if (sent.size === asked.length) done(); };
    c.querySelectorAll('[data-send]').forEach(b => b.onclick = async () => { if (busy) return; const s = asked.find(x => x.n === b.closest('[data-n]').dataset.n); if (sent.has(s.n)) return;
      busy = true; if (await compose(s, w, kids)) markSent(s); busy = false; check(); });
    if (allBtn) allBtn.onclick = async () => { if (busy) return; busy = true; const left = asked.filter(s => !sent.has(s.n));
      for (let i = 0; i < left.length; i++) { if (!await compose(left[i], w, kids, null, null, `${i + 1} of ${left.length}`)) break; markSent(left[i]); await sleep(250); }
      busy = false; check(); };
    c.querySelector('[data-skip]').onclick = () => { if (busy) return; asked.filter(s => !sent.has(s.n)).forEach(s => { const r = c.querySelector(`[data-n="${s.n}"]`); r.querySelector('[data-st]').textContent = `${s.ch || 'Messages'} · you’ll text them`; }); p.me('I’ll text them myself'); done('skip'); };
  });
  c.querySelectorAll('button').forEach(b => b.style.pointerEvents = 'none'); allBtn?.remove(); c.querySelector('[data-skip]').remove(); c.querySelector('.msgpv').remove();
  if (sent.size) p.note(joinNames([...sent]), `${sent.size} message${sent.size > 1 ? 's' : ''} sent from your phone`, 'ph-paper-plane-tilt');
  return sent.size;
}
/* E7 (17 Nov): sitters don't have Sprout and reply by text, which Sprout can't read. So the parent tells Sprout:
   one row per sitter, Free / Can't, then Continue. "No one has replied yet" = Sprout checks back in an hour. */
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
async function sendAndBook(p, asked, w, kids, { pick } = {}){
  const nSent = await sendEach(p, asked, w, kids);
  p.set('Waiting for replies', { when:w.day.short });
  await p.say(`${nSent ? 'Sent.' : 'Okay, text them when you’re ready.'} When they text you back, tell me here who’s free. If I don’t hear from you, I’ll check in an hour.`, 1000);
  const H = (w.to - w.from) / 60;
  let ans;
  for (;;) {
    ans = await whoFree(p, asked, w);
    if (ans.none) {
      await p.say('Okay. I’ll check back in an hour. You can close Sprout.', 800);
      await later(p, { status:'Waiting for replies', small:`${joinNames(asked.map(s => s.n))} · ${w.day.day}`, ms:3500, title:'Did any sitter text you back?', body:`Tell me who can sit ${w.day.short} ${range(w.from, w.to)}` });
      await p.say(`Did ${joinNames(asked.map(s => s.n)).replace(/ and ([^ ]+)$/, ' or $1')} text you back?`, 800);
      continue;
    }
    if (ans.free.length) break;
    const waiting = ans.wait;
    await p.say(`${joinNames(ans.cant.map(s => s.n))} can’t make it${waiting.length ? `, and ${joinNames(waiting.map(s => s.n))} ${waiting.length > 1 ? 'haven’t' : 'hasn’t'} replied yet` : ''}.`, 900);
    const opts = [waiting.length ? `Wait for ${joinNames(waiting.map(s => s.n))}` : null, 'Ask a class group', 'Change the time'].filter(Boolean);
    const k = await p.chips(opts, { stub:[opts.length - 1] });
    if (waiting.length && k === 0) {
      asked = waiting;
      await later(p, { status:'Waiting for replies', small:joinNames(waiting.map(s => s.n)), ms:3000, title:`Did ${joinNames(waiting.map(s => s.n))} text you back?`, body:`Sitter for ${w.day.day}` });
      await p.say(`Did ${joinNames(waiting.map(s => s.n)).replace(/ and ([^ ]+)$/, ' or $1')} text you back?`, 700);
      continue;
    }
    return classGroup(p, w, kids, { pick });
  }
  const yes = ans.free;
  let who = yes[0];
  if (yes.length > 1) { await p.say(`${joinNames(yes.map(s => s.n))} can both do it. Who should you book?`, 800); who = yes[await p.chips(yes.map(s => `Book ${s.n} · about $${Math.round(s.rate * H)}`))]; }
  else await p.say(`${who.n} can do it. Check the details, then send ${who.n} the booking.`, 800);
  for (;;) {
    const ok = await new Promise(r => {
      const c = p.block(`<div class="card pay">
        <div class="ctop">${clay('calendar-check')}<div><div class="ttl">Book ${who.n}</div><div class="sub">${w.day.day}</div></div></div>
        <div class="for">${face(who, 26)}${who.n} · ${range(w.from, w.to)} · ${joinNames(kids.map(k => k.n))}</div>
        ${pick ? `<div class="line"><span>Dinner</span><span>${pick.place.n} · ${pick.time}</span></div>` : ''}
        <div class="line"><span>Rate</span><button class="ln-ed" data-rate>$${who.rate}/hour <i class="ph ph-pencil-simple"></i></button></div><div class="line"><span>Time</span><span>${hrs(H)}</span></div>
        <div class="line est"><span>Estimate</span><span>$${Math.round(who.rate * H)}</span></div>
        <div class="wait"><i class="ph ph-paper-plane-tilt"></i>Next: send ${who.n} the details from your phone · you pay ${who.n} directly</div>
        <div class="two"><button class="btn ghost" data-k="back">Back</button><button class="btn" data-k="ok">Book ${who.n}</button></div></div>`).querySelector('.card');
      c.querySelector('[data-k=back]').onclick = () => { c.parentElement.remove(); r(false); };
      c.querySelector('[data-rate]').onclick = async () => { const v = await editFields(`${who.n}’s rate`, [['Per hour, what ' + who.n + ' told you', '$' + who.rate, 'num']]);
        if (v) { const n = parseFloat(v[0].replace(/[^\d.]/g, '')); if (n) { who.rate = n; remember({ ...who }); c.querySelector('[data-rate]').innerHTML = `$${n}/hour <i class="ph ph-pencil-simple"></i>`; c.querySelector('.line.est span:last-child').textContent = `$${Math.round(n * H)}`; } } };
      c.querySelector('[data-k=ok]').onclick = () => { c.querySelector('.two').remove(); c.querySelector('.wait').remove(); c.querySelector('[data-rate]').style.pointerEvents = 'none'; p.me('Book ' + who.n); r(true); };
    });
    if (ok) break;
    await p.say('Okay. Nothing is booked yet.', 600);
    await p.chips([`Book ${who.n}`], { echo:false });
  }
  /* the booking goes from the parent's phone too: the address only now, only to the sitter they picked */
  const bookMsg = `Great, you’re booked! ${w.day.day}, ${range(w.from, w.to)} for ${kidsShort(kids)}. We’re at ${FAMILY.address}. ${FAMILY.notes} See you then! Tony`;
  for (;;) { if (await compose(who, w, kids, bookMsg, `Your address goes only to ${who.n}. Sprout doesn’t send anything on its own.`)) break; await p.say('Send it when you’re ready.', 500); await p.chips([`Send ${who.n} the details`]); }
  p.note(`${who.n} · booked`, `Details sent from your phone · ${w.day.day} ${range(w.from, w.to)}`, 'ph-calendar-check');
  const others = yes.filter(s => s !== who);
  if (others.length) {
    await p.say(`Want to let ${joinNames(others.map(s => s.n))} know you’re covered?`, 700);
    if (await p.chips([`Tell ${joinNames(others.map(s => s.n))}`, 'Skip']) === 0)
      for (const o of others) await compose(o, w, kids, `Thanks ${o.n}! We found someone for ${w.day.long.split(',')[0]}. We’ll ask you again soon. Tony`, 'A quick thank-you, from your phone.');
  }
  await p.say(`${who.n} is booked.${who.parent ? ` ${who.n} is saved to your sitters now.` : ''} You pay ${who.n} directly.`, 900);
  p.block(`<div class="card">${pick ? `<div class="cover" style="${M.ph(pick.k, 3)}"></div>` : ''}
    <div class="ctop">${clay('calendar-check')}<div><div class="eyebrow">${pick ? 'Date night' : 'Sitter'} · ${w.day.day}</div><div class="ttl">${pick ? 'Your evening' : `${who.n} is booked`}</div></div></div>
    <div class="ua-row on" style="margin-top:12px">${face(who)}<span class="tx"><b>${who.n}</b><small>${range(w.from, w.to)} · about $${Math.round(who.rate * H)} · you pay ${who.n}</small></span><span class="ck"><i class="ph-bold ph-check"></i></span></div>
    ${pick ? `<div class="fact" style="margin-top:10px"><i class="ph ph-fork-knife"></i>${pick.place.n} · ${pick.time} · table for 2</div>` : ''}
    <div class="fact"><i class="ph ph-users"></i>${joinNames(kids.map(k => k.n))}</div>
    <div class="fact"><i class="ph ph-calendar-check"></i>On the family calendar · Dana has it too</div>
    <div class="fact"><i class="ph ph-bell-ringing"></i>Reminder for you both at ${tl(w.from - 30)}, then the evening on your lock screens</div></div>`);
  p.set(`Booked · ${pick ? pick.place.n + ' ' + pick.time + ' · ' : ''}${who.n} ${range(w.from, w.to)}`, { when:w.day.short, done:false });
  const d = await p.chips(['Text Dana the plan', 'Done']);
  await p.say(d === 0 ? 'Sent Dana the plan from you.' : 'All set.', 700);
  if (d === 1) X.closeSheet();
  /* I1: the rest happens on the family's clock (review panel): morning of, 30 min before, the evening, the morning after */
  await CLOCK.book({ p, i:DAYS.indexOf(w.day), S:w.from, E:w.to, D:pick ? pick.mins : null, place:pick ? pick.place : null, k:pick ? pick.k : null, who, kids, amt:Math.round(who.rate * H) });
  await morningAfter(p, who, w, kids, H, { clock:true });
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
function howSheet(who, amt){
  return new Promise(res => {
    const v = bsheet({ onBack:() => res(null), body:`<div class="bh"><span class="icotile"><i class="ph ph-check-circle"></i></span><b>How did you pay ${who.n}?</b></div>
      <p class="bp">I’ll log it so ${who.n}’s history stays right. About $${amt}.</p>
      <div class="ua-rows" style="margin-top:0">${[['venmo', 'currency-dollar', 'Venmo'], ['cash', 'money', 'Cash'], ['other', 'device-mobile', 'Zelle, Apple Cash or another app']].map(([k, i, l]) => `<button class="ua-row" data-k="${k}"><span class="uaph uamono" style="width:40px;height:40px"><i class="ph ph-${i}"></i></span><span class="tx"><b>${l}</b></span><span class="ck"><i class="ph-bold ph-check"></i></span></button>`).join('')}</div>`,
      foot:`<button type="button" class="btn" data-go disabled>Mark as paid</button>` });
    let k = null; const go = v.foot.querySelector('[data-go]');
    v.body.querySelectorAll('[data-k]').forEach(b => b.onclick = () => { k = b.dataset.k; v.body.querySelectorAll('[data-k]').forEach(x => x.classList.toggle('on', x === b)); go.disabled = false; });
    go.onclick = () => { v.close(); res(k === 'venmo' ? 'venmo:' + (who.venmo || '@' + who.n.toLowerCase()) : k); };
  });
}

/* D5: the morning after. Parents pay sitters directly (cash, Venmo, Zelle); Sprout prefills Venmo and logs it.
   The same 9 AM moment puts "Pay Alex $100" on the To-Do list; paying from the card ticks it, ticking it pays the card. */
async function morningAfter(p, who, w, kids, H, opt = {}){
  const amt = Math.round(who.rate * H);
  if (!opt.clock) await later(p, { status:`${who.n} is booked`, small:`${w.day.day} · ${range(w.from, w.to)}`, ms:3500, title:`How was ${who.n} last night?`, body:`Pay ${who.n} when you’re ready · it’s on your to-dos` });
  let resolveHow = null;
  const goToCard = () => { X.showPlan(p); X.openSheet(); setTimeout(() => { const c = p.chat.querySelector('[data-paycard]'); if (c) p.chat.scrollTo({ top: c.closest('.row').offsetTop - p.chat.offsetTop - 60, behavior:'smooth' }); }, 450); };
  const todo = addTodo({ title:`Pay ${who.n} $${amt}`, due:'Due today', onOpen:goToCard, onTick: async () => { const h = await howSheet(who, amt); if (h && resolveHow) resolveHow({ how:h, from:'todo' }); } });
  p.divider(`${w.day.w === 'Sat' ? 'Sunday' : 'Next morning'} · 9:00 AM`);
  await p.say(`Morning! How was ${who.n} last night?`, 800);
  const fb = new Promise(r => p.chips(['Great', 'Fine', 'Not great']).then(f => r(f)));
  const early = new Promise(r => { resolveHow = v => r(v); });
  const first = await Promise.race([fb.then(f => ({ f })), early]);
  let f = first.f ?? 1, how = first.how ? first : null;
  if (how) p.chat.querySelectorAll('.chips:not(.done)').forEach(c => { c.classList.add('done'); c.querySelectorAll('.chip').forEach(b => b.style.pointerEvents = 'none'); });
  if (!how) {
    if (f === 2) await p.say(`Sorry to hear that. I won’t suggest ${who.n} first next time.`, 800);
    await p.say(`${f === 2 ? 'When you’re ready, pay' : 'Pay'} ${who.n} the way you usually do. I can open Venmo with it filled in. It’s on your to-do list too.`, 900);
  }
  const c = p.block(`<div class="card" data-paycard><div class="ctop">${face(who, 44)}<div><div class="eyebrow">${w.day.day} · ${range(w.from, w.to)}</div><div class="ttl">Pay ${who.n}</div></div></div>
    <div class="line" style="margin-top:12px"><span>${hrs(H)} × $${who.rate}</span><span>$${(who.rate * H).toFixed(2)}</span></div>
    <div class="total"><span>About</span><span>$${amt}</span></div>
    <div class="foot"><i class="ph ph-info"></i>You pay ${who.n} directly. Sprout never holds the money.</div>
    <div data-acts><button class="btn" data-v style="margin-top:12px">Pay with Venmo</button>
    <div class="two" style="margin-top:8px"><button class="btn ghost" data-c>Paid in cash</button><button class="btn ghost" data-o>Another way</button></div></div></div>`).querySelector('.card');
  if (!how) how = await new Promise(r => { resolveHow = v => r(v);
    c.querySelector('[data-c]').onclick = () => r({ how:'cash' }); c.querySelector('[data-o]').onclick = () => r({ how:'other' });
    c.querySelector('[data-v]').onclick = () => { const v = bsheet({ body:`<div class="bh"><span class="icotile"><i class="ph ph-currency-dollar"></i></span><b>Pay ${who.n} on Venmo</b></div>
        <p class="bp">Venmo opens with this filled in. You finish the payment there.</p>
        <div class="fields" style="margin-top:0"><label class="field in"><div style="width:100%"><div class="l">To</div><input value="${who.venmo || ''}" placeholder="@${who.n.toLowerCase()}" autocomplete="off"></div></label>
          <label class="field in"><div style="width:100%"><div class="l">Amount</div><input inputmode="decimal" value="$${amt}.00" autocomplete="off"></div></label>
          <label class="field in"><div style="width:100%"><div class="l">Note</div><input value="Babysitting ${w.day.day} · ${joinNames(kids.map(k => k.n))}" autocomplete="off"></div></label></div>
        ${who.venmo ? '' : `<p class="hint2">I’ll save ${who.n}’s Venmo for next time.</p>`}`,
      foot:`<button type="button" class="btn" data-go>Open Venmo</button>` });
      v.foot.querySelector('[data-go]').onclick = () => { const to = v.body.querySelector('input').value || '@' + who.n.toLowerCase(); v.close(); toast('Opens Venmo (not part of this demo)'); r({ how:'venmo:' + to }); }; }; });
  c.querySelector('[data-acts]').remove();
  const h = how.how, label = h === 'cash' ? 'Paid in cash' : h === 'other' ? 'Paid another way' : 'Paid with Venmo';
  if (how.from === 'todo') p.note('Ticked on your to-do list', label, 'ph-check-square'); else p.me(label);
  const via = h.startsWith('venmo') ? `Venmo · ${h.slice(6)}` : h === 'cash' ? 'Cash' : 'Zelle, Apple Cash or another app';
  p.note(`Paid ${who.n} $${amt}`, via, 'ph-check-circle');
  todo.done(`${label} · ${how.from === 'todo' ? 'ticked by you' : 'ticked by Sprout'}`);
  const n = (who.times5 || (MY.find(m => m.n === who.n)?.count ?? (who.parent || who.by === 'Added by you' ? 0 : 1))) + 1;
  remember({ ...who, count:n, times5:n, times: n === 1 ? 'Sat for you once' : n === 2 ? 'Sat for you twice' : `Sat for you ${n} times` });
  await p.say(`Logged, and ticked off your to-do list. ${who.n} has sat for you ${n === 1 ? 'once' : n === 2 ? 'twice' : n + ' times'} now${f === 0 ? ', and I’ll suggest ' + who.n + ' first next time' : ''}.`, 900);
  p.set(`${who.n} · paid $${amt}`, { when:w.day.short, done:true, attn:false }); X.renderHome();
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
  const replies = new Promise(r => setTimeout(() => r('replies'), 9000));
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
    live = false; setWait('Class request cancelled', `${where} · parents can’t reply to it now`, 'ph-x-circle');
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
    wc.querySelector('[data-x]').onclick = () => { if (!live) return; live = false; setWait('Class request cancelled', `${where} · parents can’t reply to it now`, 'ph-x-circle'); toast('Class request cancelled'); };
    const who = await whoCard(p, [{ ...a, added:true }], { hours:(w.to - w.from) / 60, line:x => x.phone, onReady:api => list = api });
    if (live) { live = false; setWait('Class request closed', `You picked ${joinNames(who.map(x => x.n))}, so I stopped asking ${where}`, 'ph-check-circle'); }
    return sendAndBook(p, who.map(x => MY.find(m => m.n === x.n) || x), w, kids, opt);
  }

  live = false;
  LEADS.forEach(l => remember({ ...l, times:`Shared by ${l.parent}` }));
  setWait(`${joinNames(LEADS.map(l => l.parent))} shared a sitter`, `${joinNames(LEADS.map(l => l.n))} · saved to your sitters`, 'ph-hand-heart');
  X.notify(p, '2 parents shared a sitter', 'Priya and Aisha replied');
  await p.say('Two parents shared a sitter. I saved both to your sitters.', 900);
  p.block(`<div class="card"><div class="ctop">${clay('person-plus')}<div><div class="eyebrow">Shared by class parents</div><div class="ttl">2 new sitters</div></div></div>
    ${LEADS.map(l => `<div class="lead">${face(l, 44)}<div><div class="v">${l.n} · ${l.phone}</div><div class="fs"><i class="ucp" style="background-image:url(${A}${l.pimg})"></i>From ${l.parent}, ${l.kid}’s mom</div><q>${l.note}</q></div></div>`).join('')}
    <div class="foot ok"><i class="ph ph-check-circle"></i>Saved to your sitters</div></div>`);
  await p.say('Who should I ask?', 600);
  const who = await whoCard(p, LEADS.map(s => ({ ...MY.find(m => m.n === s.n) })), { hours:(w.to - w.from) / 60, line:s => s.phone });   /* G4: Add a sitter here too */
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
X.flows.sitterC1 = async p => {
  await p.say('Happy to. When do you need someone?', 800);
  const w = await whenCard(p);
  sub(p, `Sitter · ${w.day.day}`); p.title = `Sitter · ${w.day.day}`; p.set('Just started', { when:w.day.short });
  await p.say('And who is it for?', 600);
  const kids = await kidsCard(p);
  await p.say('Here’s the request. Check it over.', 700);
  await requestCard(p, w, kids);
  await chooseAndSend(p, w, kids);
};

/* ======================= C2 · Plan a date night ======================= */
const EXTRA = {
  olive:  { two:'$110', tags:['Italian'], tier:['high', 'mid'], why:'Hand-made pasta and a quiet patio. Priya and Aisha from Maya’s class loved it.', slots:['5:45', '6:30', '6:45', '7:15', '8:15', '8:45'],
            menu:[['To start', [['Burrata, peaches, basil', '$16'], ['Wood-fired focaccia', '$9']]], ['Pasta', [['Pappardelle, slow-cooked ragù', '$27'], ['Cacio e pepe', '$22']]], ['Dessert', [['Olive oil cake', '$11']]]] },
  casa:   { two:'$60', tags:['Mexican'], tier:['mid', 'budget'], why:'Garden patio with live music on Saturdays. Easy, lively, great margaritas.', slots:['6:00', '6:45', '7:00', '7:30', '8:00'],
            menu:[['Tacos', [['Carne asada, wood-grilled', '$16'], ['Mushroom al pastor', '$14']]], ['Plates', [['Whole grilled fish', '$32']]], ['Drinks', [['Mezcal margarita', '$13']]]] },
  kumo:   { two:'$320', tags:['Japanese'], tier:['high'], why:'A 12-course tasting at an 8-seat counter. Feels like a special occasion.', slots:['6:00', '8:30'],
            menu:[['Omakase', [['12-course tasting', '$145']]], ['Add on', [['Sake pairing', '$65']]]] },
  juniper:{ two:'$75', tags:['Small plates', 'Wine bar'], tier:['mid'], why:'Closest to home, candlelit and small. Easy to get back for the sitter.', slots:['6:15', '6:45', '7:15', '7:45', '8:00'],
            menu:[['Small plates', [['Burrata and tomatoes', '$15'], ['Cheese and charcuterie', '$24'], ['Grilled bread, olives', '$9']]], ['Wine', [['Natural orange, by the glass', '$14']]]] },
  rosie:  { two:'$55', tags:['BBQ'], tier:['mid', 'budget'], why:'Relaxed string-lit patio and the best brisket nearby. No dressing up.', slots:['6:30', '7:00', '7:45', '8:15'],
            menu:[['Smoked', [['Brisket, by the half pound', '$18'], ['Smoked half chicken', '$16']]], ['Sides', [['Mac and cheese', '$6']]], ['Sweet', [['Banana pudding', '$7']]]] },
};
const FOODS = ['Italian', 'Mexican', 'Japanese', 'Small plates', 'BBQ', 'Anything good'];
function menuSheet(k){
  const pl = M.PLACES[k], x = EXTRA[k];
  bsheet({ body:`<div class="bhero" style="${M.ph(k, 2)}"></div><div class="btitle">${pl.n} · menu</div><div class="bsub">${M.sub1(pl)}</div>
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
function results(p, keys, others = []){
  return new Promise(res => {
    let k = keys[0];
    Object.keys(M.PLACES).forEach(x => M.PLACES[x].pick = x === k);   // "my pick" on the map = the top-ranked place
    const c = p.block(`<div class="card" style="padding:6px">${M.mapHtml(keys, k, true, others)}</div>`).querySelector('.card'); c.querySelector('.dnmap').classList.add('wide');
    /* D1c (17 Nov): photo full-bleed at the top, two plain lines on why, small Menu / Website links, one Choose */
    const car = p.block(`<div class="dncar">${keys.map((key, i) => { const pl = M.PLACES[key], x = EXTRA[key]; return `<div class="card dn3" data-k="${key}">
      <div class="dn3img" style="${M.ph(key)}">${i === 0 ? '<span class="dn3pick">My pick</span>' : ''}</div>
      <div class="dn3bd"><div class="dn3top"><b>${pl.n}</b><span class="dn3price"><strong>~${x.two}</strong> for two</span></div><div class="dn3sub">${pl.kind} · ${pl.mi} mi</div>
        <p class="dn3why">${x.why}</p>
        <div class="dn3cta"><button class="dn3link" data-menu><i class="ph ph-book-open-text"></i>Menu</button><button class="dn3link" data-site><i class="ph ph-globe-simple"></i>Website</button><button class="btn dn3go" data-go>Choose</button></div></div></div>`; }).join('')}</div>`).querySelector('.dncar');
    const map = c.querySelector('.dnmap'), cards = [...car.querySelectorAll('.card')]; let lock = false;
    const select = (key, from) => { k = key; M.glide(map, k); cards.forEach(x => x.classList.toggle('on', x.dataset.k === k));
      if (from !== 'swipe') { const cd = cards.find(x => x.dataset.k === k); lock = true; car.scrollTo({ left: cd.offsetLeft - (car.clientWidth - cd.clientWidth) / 2, behavior:'smooth' }); setTimeout(() => lock = false, 500); } };
    map.querySelectorAll('.dnpin[data-k]').forEach(b => b.onclick = () => select(b.dataset.k, 'pin'));
    map.querySelectorAll('.dnpin[data-o]').forEach(b => b.onclick = () => { const o = others.find(x => x.k === b.dataset.o); toast(`${M.PLACES[o.k].n} · ${o.why}`); });
    M.drag(map);
    let st; car.addEventListener('scroll', () => { if (lock) return; clearTimeout(st); st = setTimeout(() => { const mid = car.scrollLeft + car.clientWidth / 2;
      const near = cards.reduce((a, x) => Math.abs(x.offsetLeft + x.clientWidth / 2 - mid) < Math.abs(a.offsetLeft + a.clientWidth / 2 - mid) ? x : a); if (near.dataset.k !== k) select(near.dataset.k, 'swipe'); }, 120); });
    cards.forEach(x => {
      x.querySelector('[data-menu]').onclick = () => { select(x.dataset.k, 'pin'); menuSheet(x.dataset.k); };
      x.querySelector('[data-site]').onclick = () => toast('Opens the restaurant’s website (not part of this demo)');
      x.querySelector('[data-go]').onclick = () => { cards.forEach(y => y.querySelectorAll('button').forEach(b => b.style.pointerEvents = 'none')); map.querySelectorAll('.dnpin').forEach(b => b.style.pointerEvents = 'none'); select(x.dataset.k, 'pin'); p.me(`Choose ${M.PLACES[x.dataset.k].n}`); res(x.dataset.k); };
    });
    requestAnimationFrame(() => { M.glide(map, k, true); select(k, 'pin'); });
    setTimeout(() => p.chat.scrollTo({ top: c.closest('.row').offsetTop - p.chat.offsetTop - 8, behavior:'smooth' }), 600);
  });
}
X.flows.dateE = async (p, opt = {}) => {
  const sat = DAYS.find(d => d.w === 'Sat');
  await p.say(opt.fromPush ? 'Let’s plan it. You and Dana are both free Saturday after 6, so I started there. Change anything.' : 'Let’s plan it. When are you going out?', 1000);
  const w0 = await whenCard(p, { mode:'dinner', preset: opt.fromPush ? { w:'Sat', from:19 * 60 } : null });
  const night = w0.day; sub(p, `Date night · ${night.day}`); p.title = `Date night · ${night.day}`; p.set('Just started', { when:night.short });
  await p.say('How far are you happy to go?', 600);
  const dist = await p.chips(['3 miles or less', '10 miles or less', 'Doesn’t matter']);
  await p.say('What kind of food?', 500);
  const food = await foodCard(p);
  await p.say('And the budget for dinner for two?', 500);
  /* F2 (17 Nov): dinner for two in Austin, before drinks and tip, instead of $ signs */
  const bi = await p.chips(['Under $60', '$60–$130', '$130 and up', 'Set my own'], { echo:false });
  let tier, budgetLabel, cap = null;
  if (bi < 3) { tier = ['budget', 'mid', 'high'][bi]; budgetLabel = ['Under $60 for two', '$60–$130 for two', '$130 and up for two'][bi]; }
  else { const v = await editFields('Your budget', [['Up to, for the two of you', '$100', 'num']]); const n = v ? parseFloat(v[0].replace(/[^\d.]/g, '')) || 100 : 100;
    tier = n < 60 ? 'budget' : n <= 130 ? 'mid' : 'high'; cap = n; budgetLabel = `Up to $${n} for two`; }
  p.me(budgetLabel);
  /* match: food 3, budget 2, distance 2; show 3–5, best first */
  const any = food.includes('Anything good');
  const scored = Object.keys(M.PLACES).map(k => { const pl = M.PLACES[k], x = EXTRA[k];
    const f = any || x.tags.some(t => food.includes(t)), b = cap ? parseInt(String(x.two).replace(/\D/g, '')) <= cap : x.tier.includes(tier), d = dist === 2 || pl.mi <= [3, 10][dist];
    return { k, f, b, d, s:(f ? 3 : 0) + (b ? 2 : 0) + (d ? 2 : 0), all:f && b && d, mi:pl.mi }; }).sort((a, b) => b.s - a.s || a.mi - b.mi);
  const fit = scored.filter(x => x.all).length, keys = scored.slice(0, Math.min(5, Math.max(3, fit))).map(x => x.k);
  const w = p.work('Checking places near home', `${night.day} · around ${tl(w0.from)} · table for 2`); await sleep(1600);
  w.done(`${fit || 'No'} place${fit === 1 ? '' : 's'} fit everything`, fit < keys.length ? `Plus ${keys.length - fit} close match${keys.length - fit > 1 ? 'es' : ''}` : 'Distance, food and budget', 'ph-fork-knife');
  await p.say(`Here ${keys.length > 1 ? 'are' : 'is'} ${keys.length}. Swipe the cards or drag the map to look around.`, 900);
  p.set('Pick a place', { when:night.short });
  const others = scored.filter(x => !keys.includes(x.k)).map(x => ({ k:x.k, why: !x.f ? 'not the food you picked' : !x.b ? 'outside your budget' : 'farther than you wanted' }));
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
  const sw = { day:night, from:slots[ti] - 30, to:Math.min(1440, Math.max(22 * 60, slots[ti] + 180)) };
  await p.say(`You’re booked at ${pl.n}. Want me to find a sitter while you’re out?`, 900);
  const sc = p.block(`<div class="card"><div class="ctop">${clay('person-plus')}<div><div class="eyebrow">Suggestion</div><div class="ttl">A sitter for Maya and Jake</div></div></div>
    <hr><div class="fact"><i class="ph ph-clock"></i>${range(sw.from, sw.to)}, from 30 minutes before dinner</div>
    ${MY.length ? `<div class="fact"><span class="uc-kids" style="margin:0"><span>${MY.slice(0, 3).map(x => `<i style="background-image:url(${x.photo})"></i>`).join('')}</span></span>&nbsp;Your sitters ${joinNames(MY.map(x => x.n))}</div>` : `<div class="fact"><i class="ph ph-user-plus"></i>No saved sitters yet: add one, or I’ll ask a class group</div>`}
    <div class="foot"><i class="ph ph-info"></i>I only ask. Nobody is booked until you confirm.</div></div>`).querySelector('.card');
  const want = await p.chips(['Find a sitter', 'We’re covered'], { into:sc });
  if (want === 1) {
    await p.say('Got it. Your table is on the family calendar, so Dana has it too.', 800);
    p.block(`<div class="card"><div class="cover" style="${M.ph(k, 3)}"></div><div class="ctop">${clay('calendar-check')}<div><div class="eyebrow">Date night · ${night.day}</div><div class="ttl">Your evening</div></div></div>
      <hr><div class="fact"><i class="ph ph-fork-knife"></i>${pl.n} · ${time} · table for 2</div><div class="fact"><i class="ph ph-calendar-check"></i>On the family calendar · Dana has it too</div><div class="fact"><i class="ph ph-bell-ringing"></i>Reminder for you both at ${tl(slots[ti] - 30)}, 30 minutes before dinner</div></div>`);
    p.set(`Booked · ${pl.n} ${time}`, { when:night.short, done:false });
    const d = await p.chips(['Text Dana the plan', 'Done']);
    await p.say(d === 0 ? 'Sent Dana the plan from you. Have a lovely night.' : 'Have a lovely night.', 700);
    if (d === 1) X.closeSheet();
    await CLOCK.book({ p, i:DAYS.indexOf(night), S:null, E:null, D:slots[ti], place:pl, k, who:null, kids:[], amt:0 });
    p.set(`${pl.n} · ${night.day}`, { when:night.short, done:true }); X.renderHome();
    return;
  }
  await p.say('Who is it for?', 500);
  const kids = await kidsCard(p);
  await p.say('Here’s the sitter request.', 600);
  await requestCard(p, sw, kids, time);
  await chooseAndSend(p, sw, kids, { pick:{ k, place:pl, time, mins:slots[ti] } });
};

/* ======================= the other parent: share a sitter (Priya) ======================= */
X.flows.shareSitter = async p => {
  await p.say('Tony Martin, Maya’s dad, asked Miss Taylor’s class for a sitter:', 900);
  const m = p.block(`<div class="card"><div class="preview"><small>Miss Taylor’s class · Tony Martin</small><p>Hi everyone! We’re looking for a sitter for Sat, Aug 1, 6–10 PM, for Maya (7) and Jake (5). If you have one you trust, tap “Share a sitter” and add their name and number. Thank you!</p></div></div>`);
  const i = await p.chips(['Share a sitter', 'I don’t know one'], { into:m });
  if (i === 1) { await p.say('No problem. Nothing is sent to Tony.', 700); p.set('Skipped', { done:true }); return; }
  await p.say('You have Taylor saved. Share Taylor, or someone else?', 800);
  const j = await p.chips(['Share Taylor', 'Someone else']);
  const shared = await new Promise(res => {
    const v = bsheet({ onBack:() => res(null),
      body:`<div class="bh"><span class="icotile"><i class="ph ph-hand-heart"></i></span><b>Share a sitter with Tony</b></div>
        <p class="bp">Tony sees the name, number and your note. It’s also saved to his family’s sitters.</p>
        <div class="fields" style="margin-top:0">
          <label class="field in"><div style="width:100%"><div class="l">Sitter’s name</div><input value="${j === 0 ? 'Taylor Brooks' : ''}" placeholder="Name" autocomplete="off"></div></label>
          <label class="field in"><div style="width:100%"><div class="l">Phone</div><input inputmode="tel" value="${j === 0 ? '(512) 555-0193' : ''}" placeholder="(512) 555-0100" autocomplete="off"></div></label>
          <label class="field in"><div style="width:100%"><div class="l">A note for Tony (optional)</div><input value="${j === 0 ? 'Sits for us most Fridays. Great with little ones.' : ''}" autocomplete="off"></div></label></div>
        <p class="hint2">Only share someone who’s happy to be contacted.</p>`,
      foot:`<button type="button" class="btn" data-go>Share with Tony</button>` });
    v.foot.querySelector('[data-go]').onclick = () => { const [n, ph] = [...v.body.querySelectorAll('input')].map(x => x.value.trim()); if (!n || !ph) return toast('Add a name and a phone number'); v.close(); res({ n, ph }); };
  });
  if (!shared) { await p.say('Okay. Nothing was shared.', 600); return; }
  const w = p.work('Sharing with Tony', 'Miss Taylor’s class'); await sleep(1200);
  w.done(`Shared ${shared.n.split(' ')[0]} with Tony`, `${shared.ph} · saved to the Martins’ sitters`, 'ph-hand-heart');
  p.set(`Shared ${shared.n.split(' ')[0]}`, { done:true });
  await p.say('Thanks! Tony can ask them directly now. I’ll let you know if they book.', 800);
};

/* ======================= entries by route ======================= */
function lockScreen({ date, time, title, body, onOpen }){
  const lock = el(`<div class="lock" role="button" aria-label="Open the Sprout notification"><div class="ldate">${date}</div><div class="ltime">${time}</div>
    <div class="lnote"><img src="/assets/app-icon-180.png" alt=""><div><b>Sprout<small>now</small></b><p><strong>${title}</strong><br>${body}</p></div></div><div class="lhint">Tap the notification</div></div>`);
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
if (route === 'pay-todo') {   /* review shortcut: the night is over, it's Sunday 9 AM */
  setTiles(); const h = $('.dbhead .mid span'); if (h) h.textContent = 'Sunday, August 2';
  installTodo();
  const p = X.makePlan('sitterC1', { title:'Sitter · Sat, Aug 1', sub:'Sitter · Sat, Aug 1', icon:'person-plus' });
  const who = SAVED[0], w = { day:DAYS.find(d => d.w === 'Sat'), from:1125, to:1335 };
  p.block(`<div class="card"><div class="ctop">${clay('calendar-check')}<div><div class="eyebrow">Sitter · ${w.day.day}</div><div class="ttl">${who.n} is booked</div></div></div>
    <div class="ua-row on" style="margin-top:12px">${face(who)}<span class="tx"><b>${who.n}</b><small>${range(w.from, w.to)} · about $${Math.round(who.rate * 3.5)} · you pay ${who.n}</small></span><span class="ck"><i class="ph-bold ph-check"></i></span></div></div>`);
  p.set(`${who.n} · ${range(w.from, w.to)}`, { when:'Sat' });
  setTimeout(() => morningAfter(p, who, w, KIDS, 3.5), 600);
}
if (route === 'sitter-v3-share') {
  const g = $('.day .hi'); if (g) g.textContent = 'Afternoon, Priya';
  const fam = $('#sheet .fam'); if (fam) fam.innerHTML = `<i style="background-image:url(${A}priya.webp)"></i>`;
  lockScreen({ date:'Tuesday, July 28', time:'12:40', title:'Tony is looking for a sitter', body:'Maya’s dad asked Miss Taylor’s class. Know someone you trust?', onOpen:() => X.start('shareSitter') });
}
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
const tonight = r => r.place && r.who ? 'date night' : r.place ? `dinner at ${r.place.n}` : `${r.who.n} is sitting`;
function restoreHappening(){
  const wrap = $('.tdx'), hp = wrap && wrap.querySelector('.hpx'); if (!hp) return;
  const c1 = wrap.querySelector('[data-c1]'), c2 = wrap.querySelector('[data-c2]'), c = el('<div class="tdx-sl" data-c></div>');
  c1.replaceWith(c); hp.remove(); c2.remove(); wrap._size();
}
function recTitle(r){ return r.place && r.who ? 'Date night' : r.place ? `Dinner at ${r.place.n}` : `${r.who.n} is sitting`; }
function recLine(r){ return [r.who ? `${r.who.n} ${range(r.S, r.E)}` : '', r.place ? `${r.place.n} at ${ampm(r.D)}` : ''].filter(Boolean).join(' · '); }
function stops(r){ const a = []; if (r.who) a.push([r.S, `${r.who.n} ${ampm(r.S)}`]); if (r.place) a.push([r.D, `Dinner ${ampm(r.D)}`]); if (r.who) a.push([r.E, `Home ${ampm(r.E)}`]); else if (r.place) a.push([r.D + 120, 'Home']); return a.sort((x, y) => x[0] - y[0]); }
function happeningFor(r, evening, onOpen){
  const hp = installHappening(), first = r.who ? r.S : r.D, sat = DAYS[r.i] && DAYS[r.i].w === 'Sat';
  const plan = `<span class="hp-chip as"><img src="${A}assist-clover-knit.png" alt="">Sprout Assist</span><span class="hp-chip">You and Dana</span>`;
  const sit = `<span class="hp-note">${r.who ? `<i class="hp-face" style="background-image:url(${r.who.photo})"></i>` : '<i class="ph ph-fork-knife"></i>'}${recLine(r)}</span>`;
  const st = stops(r), x0 = first - 30, x1 = st[st.length - 1][0], pc = m => Math.max(4, Math.min(96, (m - x0) / (x1 - x0) * 100));
  const track = `<div class="hp-trk"><div class="bar"></div><div class="fill" style="width:4%"></div>${st.map(([m, l], i) => `<span class="stop" style="left:${pc(m)}%"></span><span class="lbl" style="left:${pc(m)}%;${i === st.length - 1 ? 'transform:translateX(-88%)' : i === 0 ? 'transform:translateX(-12%)' : ''}">${l}</span>`).join('')}</div>`;
  const bash = sat ? `<button class="hp-row${evening ? ' past' : ''}" data-bash><span class="hp-when">10:00 AM</span><span class="hp-body"><b>Back to School Bash</b><span class="hp-chips"><span class="hp-chip"><i class="ph ph-users-three"></i>Family · Zilker Park</span>${evening ? '<span class="hp-chip done"><i class="ph-bold ph-check"></i>Earlier today</span>' : ''}</span></span><i class="ph ph-caret-right"></i></button>` : '';
  const desc = r.who ? `${r.who.n} arrives at ${ampm(r.S)}.${r.place ? ` Your table at ${r.place.n} is at ${ampm(r.D)}.` : ` ${joinNames(r.kids.map(k => k.n))} until ${ampm(r.E)}.`}` : `Your table at ${r.place.n} is at ${ampm(r.D)}.`;
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
  const w = r.who, pl = r.place, first = w ? r.S : r.D;
  if (m < first) { const n = first - m; return w ? { t:`${w.n} arrives in ${n} min`, s: pl ? `Dinner at ${pl.n} ${ampm(r.D)}` : `Until ${ampm(r.E)}`, r:`${n}m` } : { t:`Dinner in ${n} min`, s:`Table for 2 at ${pl.n}`, r:`${n}m` }; }
  if (pl && m < r.D) return { t:'On your way to dinner', s:`Table for 2 at ${ampm(r.D)} · ${pl.n}`, r:ampm(r.D) };
  if (w && m < r.E - 30) return { t: pl ? 'Enjoy your dinner' : `${w.n} has ${joinNames(r.kids.map(k => k.n))}`, s:`${w.n} is booked until ${ampm(r.E)}`, r:ampm(r.E) };
  if (w && m < r.E) return { t:`Home by ${ampm(r.E)}`, s:`${w.n} is booked until ${ampm(r.E)}`, r:`${r.E - m}m` };
  return { t:'Hope it was lovely', s: w ? `I’ll ask about paying ${w.n} tomorrow morning` : 'See you tomorrow', r:'Done', end:true };
}
function laHtml(r, m){
  const st = laState(r, m), sp = stops(r), x0 = (r.who ? r.S : r.D) - 30, x1 = sp[sp.length - 1][0], pc = v => Math.max(0, Math.min(100, (v - x0) / (x1 - x0) * 100));
  return `<div class="la"><div class="la-top"><img src="/assets/app-icon-180.png" alt=""><b>${recTitle(r)}</b>· Sprout<span class="r">${st.r}</span></div>
    <div class="la-t">${st.t}</div><div class="la-s">${st.s}</div>
    <div class="trk"><div class="bar"></div><div class="fill" style="width:${pc(m)}%"></div>${sp.map(([v, l], i) => `<span class="stop${m >= v ? ' on' : ''}" style="left:${pc(v)}%"></span><span class="lbl" style="left:${pc(v)}%;${i === sp.length - 1 ? 'transform:translateX(-85%)' : ''}">${l}</span>`).join('')}</div>
    ${st.end ? '' : `<div class="la-acts">${r.who ? `<button data-t="Opens Messages to ${r.who.n}"><i class="ph-bold ph-chat-circle-dots"></i>Text ${r.who.n}</button>` : ''}${r.place ? `<button data-t="Opens Maps to ${r.place.n}"><i class="ph-bold ph-map-trifold"></i>Directions</button>` : ''}</div>`}</div>`;
}
/* lock screen: notifications (newest first) and an optional Live Activity; tap a notification to open its target */
function famLock({ i, m, notes = [], la = '' }){
  $('#phone .lock')?.remove();
  const lock = el(`<div class="lock fam"><div class="ldate">${dLong(i)}</div><div class="ltime">${lockTime(m)}</div>
    <div class="lstack">${la}${notes.map((n, k) => `<button type="button" class="lnote" data-k="${k}"><img src="/assets/app-icon-180.png" alt=""><div><b>Sprout<small>now</small></b><p><strong>${n.title}</strong><br>${n.body}</p></div></button>`).join('')}</div>
    <div class="lhint">${notes.length ? 'Tap a notification' : 'Tap anywhere to unlock'}</div></div>`);
  $('#phone').appendChild(lock);
  const close = then => { lock.classList.add('gone'); setTimeout(() => { lock.remove(); then && then(); }, 380); };
  lock.querySelectorAll('.lnote').forEach(b => b.onclick = e => { e.stopPropagation(); close(notes[+b.dataset.k].open); });
  lock.querySelectorAll('.la [data-t]').forEach(b => b.onclick = e => { e.stopPropagation(); toast(b.dataset.t); });
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
    m.push({ t:base + 450, k:'morning', l:'Morning of · Morning Brief' });
    m.push({ t:base + first - 30, k:'soon', l:`30 min before · ${r.who ? r.who.n + ' arrives' : 'dinner'}` });
    m.push({ t:base + (r.place ? r.D + 25 : r.S + 60), k:'during', l:'During the evening' });
    m.push({ t:base + 1440 + 540, k:'after', l:'Next morning · 9:00 AM' });
    return m.map(x => ({ ...x, r, done:false }));
  }
  const pending = () => recs.flatMap(r => r.ms).filter(x => !x.done).sort((a, b) => a.t - b.t);
  function run(x){
    const r = x.r, p = r.p; now = Math.max(now, x.t); x.done = true; sbar();
    const title = recTitle(r), line = recLine(r);
    if (x.k === 'morning') {
      setBriefDay(r.i); restoreHappening(); happeningFor(r, false, openPlan(p));
      const body = `${line}. ${r.who ? 'Dana has this too.' : 'On the family calendar.'}`;
      push('Tony and Dana', `Tonight: ${tonight(r)}`, body);
      p.set(`Today · ${line}`, { when:'Today' });
      famLock({ i:r.i, m:x.t % 1440, notes:[{ title:`Tonight: ${tonight(r)}`, body, open:openBrief }] });
    }
    if (x.k === 'soon') {
      setBriefDay(r.i); happeningFor(r, true, openPlan(p));
      const n = r.who ? { title:`${r.who.n} arrives in 30 minutes`, body:`${r.place ? `Dinner at ${r.place.n} is at ${ampm(r.D)}. ` : ''}Dana has this too.` } : { title:'Dinner in 30 minutes', body:`Your table at ${r.place.n} is at ${ampm(r.D)}.` };
      push('Tony and Dana', n.title, n.body + ' Live Activity starts.');
      p.set(`Happening now · ${line}`, { when:'Today' });
      famLock({ i:r.i, m:x.t % 1440, la:laHtml(r, x.t % 1440), notes:[{ ...n, open:openBrief }] });
    }
    if (x.k === 'during') { famLock({ i:r.i, m:x.t % 1440, la:laHtml(r, x.t % 1440) }); log.unshift({ t:now, to:'Lock screens', title:'Live Activity updates', body:laState(r, x.t % 1440).t }); }
    if (x.k === 'after') {
      setBriefDay(r.i + 1); restoreHappening();
      if (r.who) {
        const n = { title:`How was ${r.who.n} last night?`, body:`Pay ${r.who.n} when you’re ready · it’s on your to-dos` };
        push('Tony', n.title, n.body); p.set(`Pay ${r.who.n} $${r.amt}`, { when:dShort(r.i + 1).split(',')[0], attn:true });
        famLock({ i:r.i + 1, m:540, notes:[{ ...n, open:openPlan(p) }] });
      } else famLock({ i:r.i + 1, m:540 });
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
    book(r){ return new Promise(resolve => {
      r.resolve = resolve; r.ms = moments(r); recs.push(r);
      push('Dana', r.who ? `Tony booked ${r.who.n}` : `Tony booked ${r.place.n}`, `${dShort(r.i)} · ${recLine(r)}`);
      toast('Use the demo clock beside the phone to move through the day');
      paint(); panel.classList.add('ping'); setTimeout(() => panel.classList.remove('ping'), 2400);
    }); },
  };
})();
})();
