/* B3 date night, three directions for review (17 Nov). Parts = the approved SSC Kids demo (app.js).
   Tony, 16 Nov: find the restaurant, get the reservation, then book the sitter for that reservation time.
   A = step by step in chat · B = one plan card that fills in · C = Sprout suggests the whole night (push first).
   Same family as every flow: today is Monday, July 27; Maya 7, Jake 5; saved sitters Alex, Sam, Riley.
   Places are made up. Nothing is booked, sent or charged. */
(() => {
const X = window.Sprout, { sleep, el, toast, ask, addField, fieldRow, editHint, overlay } = X;
const $ = s => document.querySelector(s);
const joinNames = n => n.length < 2 ? n.join('') : n.slice(0, -1).join(', ') + ' and ' + n[n.length - 1];
const mono = n => `<span class="logo mono">${n[0]}</span>`;
const sub = (p, s) => { p.sub = s; if (!p.chat.hidden) $('#hsub').textContent = s; };
async function later(p, { status, small, ms = 3500, title, body }){
  const w = p.block(`<div class="status"><span class="spinner"></span><div>${status}<small>${small || ''}</small></div></div>`);
  await sleep(ms); w.remove(); X.notify(p, title, body);
}
const preview = (text, label = 'Message preview') => `<div class="preview"><small>${label}</small><p>${text}</p></div>`;

/* ---------- data ---------- */
const NIGHTS = { fri:{ short:'Fri', day:'Fri, Jul 31', long:'Friday, July 31', cancel:'Thu 7 PM' }, sat:{ short:'Sat', day:'Sat, Aug 1', long:'Saturday, August 1', cancel:'Fri 7 PM' } };
const PLACES = [
  { n:'Olive & Ember', s:'Italian · 2.1 mi · $$$', slots:['6:30', '7:00', '8:15'], best:'7:00', note:'Patio seating. You saved it in June.', addr:'1601 S Lamar Blvd' },
  { n:'Casa Verde', s:'Mexican · 3.4 mi · $$', slots:['7:00', '7:30', '8:00'], best:'7:30', note:'New this spring. Two families in Maya’s class went last month.', addr:'2200 Manchaca Rd' },
  { n:'Kumo', s:'Japanese · 4.0 mi · $$$$', slots:['8:30'], best:'8:30', note:'Tasting menu, about 2 hours. Only 8:30 is left.', addr:'801 S Lamar Blvd' },
];
const SITTERS = { Alex:{ rate:25, by:'Saved by you', times:'Sat for you 4 times' }, Sam:{ rate:28, by:'Saved by Dana', times:'Sat for you twice' }, Riley:{ rate:24, by:'Saved by you', times:'Sat for you once' } };
const CANT = ['Riley'];   // Riley is away that weekend; everyone else says yes (C: Alex is busy too)

/* sitter time from the dinner time: arrive 30 min before you leave, stay until you're home */
const mins = t => { const [h, m] = t.split(':').map(Number); return (h + 12) * 60 + m; };
const clock = m => { const h = Math.floor(m / 60) - 12, mm = m % 60; return mm ? `${h}:${String(mm).padStart(2, '0')}` : `${h}`; };
function evening(time, homeBy){
  const from = mins(time) - 30, to = homeBy ? mins(homeBy) : (mins(time) >= mins('8:00') ? mins('10:30') : mins('10:00'));
  return { from, to, label:`${clock(from)}–${clock(to)} PM`, hours:(to - from) / 60 };
}
const est = (name, ev) => Math.round(SITTERS[name].rate * ev.hours);
const hrs = h => `${h % 1 ? h.toFixed(1) : h} hours`;

/* ---------- shared parts ---------- */
function placeDetails(pl){
  overlay({ title:pl.n, sub:pl.s, plain:false, body:`<div class="page"><div class="demo-note">Sample place. Sprout shows the restaurant’s own details here.</div>
    <h3>${pl.n}</h3><h4>${pl.s}</h4><h5>Why it’s here</h5><p>${pl.note}</p><h5>Open tables for 2</h5><p>${pl.slots.map(s => s + ' PM').join(' · ')}</p>
    <h5>Where</h5><p>${pl.addr}, Austin · about ${Math.round(parseFloat(pl.s.split('·')[1]) * 4)} min from home</p>
    <h5>Cancellation</h5><p>Free until the evening before. After that, a $25 per person no-show fee.</p></div>` });
}
/* restaurant picker: each place with its open times; tap a time, then one green button books it */
function placeCard(p, { night, eyebrow }){
  return new Promise(res => {
    const c = p.block(`<div class="card">
      <div class="ctop"><span class="icotile"><i class="ph ph-fork-knife"></i></span><div><div class="eyebrow">${eyebrow || `Dinner · ${night.day} · 2 people`}</div><div class="ttl">Tables open near home</div></div></div>
      <div class="fields">${PLACES.map((pl, i) => `<div class="field" style="display:block">
        <div style="display:flex;align-items:center;gap:10px">${mono(pl.n)}<div style="flex:1;min-width:0"><div class="v" style="margin:0">${pl.n}</div><div class="fs">${pl.s}</div></div><button class="textbtn" data-d="${i}" style="font-size:13px;padding:4px 0;width:auto;flex:none;margin:0">Details</button></div>
        <div class="chips" style="margin:10px 0 0">${pl.slots.map(s => `<button class="chip" data-p="${i}" data-t="${s}">${s} PM</button>`).join('')}</div></div>`).join('')}</div>
      <button class="btn" disabled style="margin-top:12px">Pick a time</button>
      <div class="foot">Sample places · no real reservation</div></div>`).querySelector('.card');
    let pick = null; const btn = c.querySelector('.btn');
    c.querySelectorAll('[data-d]').forEach(b => b.onclick = () => placeDetails(PLACES[+b.dataset.d]));
    c.querySelectorAll('.chip[data-t]').forEach(b => b.onclick = () => {
      c.querySelectorAll('.chip[data-t]').forEach(x => x.classList.toggle('sel', x === b));
      pick = { place:PLACES[+b.dataset.p], time:b.dataset.t }; btn.disabled = false; btn.textContent = `Book ${pick.place.n} · ${pick.time} PM`;
    });
    btn.onclick = () => { if (!pick) return; c.querySelectorAll('.chips').forEach(x => x.classList.add('done')); c.querySelectorAll('[data-d]').forEach(x => x.remove()); btn.remove(); p.me(`Book ${pick.place.n} · ${pick.time} PM`); res(pick); };
  });
}
async function bookTable(p, night, pick){
  const w = p.work(`Booking ${pick.place.n}`, `${night.day} · ${pick.time} PM · 2 people`); await sleep(1500);
  w.done(`Table booked · ${pick.place.n}`, `${night.day} · ${pick.time} PM · free to cancel until ${night.cancel}`, 'ph-fork-knife');
}
/* the sitters you know (A8): pick any, each gets a separate message */
function sitterPicker(p, { title = 'Who should I ask?' } = {}){
  return new Promise(r => {
    const c = p.block(`<div class="card">
      <div class="ctop"><span class="icotile"><i class="ph ph-address-book"></i></span><div><div class="eyebrow">Your saved sitters · pick any</div><div class="ttl">${title}</div></div></div>
      <div class="fields">${Object.entries(SITTERS).map(([n, s]) => `<button class="pick on" data-n="${n}">${mono(n)}<span class="ptx">${n}<small>${s.by} · $${s.rate}/hour</small></span><span class="cb"><i class="ph-bold ph-check"></i></span></button>`).join('')}</div>
      <button class="btn">Ask Alex, Sam and Riley</button></div>`);
    const btn = c.querySelector('.btn'), picks = [...c.querySelectorAll('.pick')];
    const names = () => picks.filter(x => x.classList.contains('on')).map(x => x.dataset.n);
    picks.forEach(x => x.onclick = () => { x.classList.toggle('on'); const n = names(); btn.disabled = !n.length; btn.textContent = n.length ? 'Ask ' + joinNames(n) : 'Pick at least one sitter'; });
    btn.onclick = () => { const n = names(); picks.forEach(x => x.style.pointerEvents = 'none'); btn.remove(); p.me('Ask ' + joinNames(n)); r(n); };
  });
}
const availMsg = (night, ev) => `Hi! Are you free to watch Maya (7) and Jake (5) on ${night.day}, ${ev.label}? We’re going out to dinner. Let us know your rate. We’ll confirm with one sitter after hearing back.`;
async function sendToSitters(p, names, night, ev){
  await p.say(`${names.length > 1 ? 'Here’s what each of them gets, separately.' : `Here’s the message to ${names[0]}.`} Your home address stays private until you book.`, 900);
  const m = p.block(`<div class="card">${preview(availMsg(night, ev))}</div>`);
  await p.chips([`Send to ${names.length > 1 ? names.length + ' sitters' : names[0]}`, 'Edit message'], { into:m, stub:[1] });
  p.note(joinNames(names), `${names.length} separate message${names.length > 1 ? 's' : ''} delivered`, 'ph-chat-circle-text');
}
/* the confirm card: SSC approval card, no payment (you pay the sitter directly) */
function confirmNight(p, { name, night, ev, pick }){
  return new Promise(res => {
    const c = p.block(`<div class="card pay">
      <div class="ctop"><span class="icotile"><i class="ph ph-moon-stars"></i></span><div><div class="ttl">Confirm your night</div><div class="sub">${night.day}</div></div></div>
      <div class="for"><i class="s">M</i>Maya &amp; Jake · ${name} · ${ev.label}</div>
      ${pick ? `<div class="line"><span>Dinner</span><span>${pick.place.n} · ${pick.time} PM</span></div>` : ''}
      <div class="line"><span>Sitter</span><span>${name} · $${SITTERS[name].rate}/hour</span></div>
      <div class="line"><span>Sitter time</span><span>${hrs(ev.hours)}</span></div>
      <div class="line est"><span>Sitter estimate</span><span>$${est(name, ev)}</span></div>
      <div class="wait"><i class="ph ph-hourglass-medium"></i>Booked after ${name} accepts · you pay ${name} directly</div>
      <div class="two"><button class="btn ghost" data-k="back">Back</button><button class="btn" data-k="ok">Confirm ${name}</button></div>
    </div>`).querySelector('.card');
    c.querySelector('[data-k=back]').onclick = () => { c.parentElement.remove(); res(false); };
    c.querySelector('[data-k=ok]').onclick = () => { c.querySelector('.two').remove(); c.querySelector('.wait').innerHTML = `<i class="ph ph-hourglass-medium"></i>Waiting for ${name} to accept`; p.me('Confirm ' + name); res(true); };
  });
}
async function summary(p, { name, night, ev, pick }){
  p.block(`<div class="card"><div class="ctop"><span class="icotile"><i class="ph ph-moon-stars"></i></span><div><div class="eyebrow">Date night · ${night.day}</div><div class="ttl">Your evening</div></div></div>
    <hr><div class="fact"><i class="ph ph-baby"></i>${name} · ${ev.label} · about $${est(name, ev)}</div>
    ${pick ? `<div class="fact"><i class="ph ph-fork-knife"></i>${pick.place.n} · ${pick.time} PM · table for 2</div>` : ''}
    <div class="fact"><i class="ph ph-calendar-check"></i>On the family calendar · Dana has it too</div></div>`);
  p.set(`${pick ? pick.place.n + ' ' + pick.time + ' · ' : ''}${name} ${ev.label}`, { when:night.short, done:true });
  const d = await p.chips(['Text Dana the plan', 'Done']);
  await p.say(d === 0 ? 'Sent Dana the plan from you. Have a lovely night.' : 'Have a lovely night.', 700);
  if (d === 1) X.closeSheet();
}
/* nobody can come: the table stays booked until you decide */
async function noSitter(p, { night, pick, asked }){
  const left = Object.keys(SITTERS).filter(n => !asked.includes(n));
  await p.say(`${joinNames(asked)} can’t do ${night.long.split(',')[0]}.${pick ? ` Your table at ${pick.place.n} is still booked, free to cancel until ${night.cancel}.` : ''}`, 1000);
  p.set('No sitter yet', { when:night.short, attn:false });
  const k = await p.chips([left.length ? `Ask ${joinNames(left)}` : 'Ask class families', 'Ask class families', pick ? 'Cancel the table' : 'Call off the night'].filter((x, i, a) => a.indexOf(x) === i), { stub:left.length ? [1] : [0] });
  if (k === 0 && left.length) return left;
  const w = p.work(pick ? `Cancelling ${pick.place.n}` : 'Closing the sitter requests', night.day); await sleep(1200);
  w.done(pick ? 'Table cancelled · no fee' : 'Requests closed', night.day, 'ph-x-circle');
  p.set('Called off', { done:true });
  await p.say('Done. Nothing else is booked. Want me to look at Friday instead?', 800);
  await p.chips(['Try Friday', 'Not now'], { stub:[0] });
  return null;
}
async function waitForReplies(p, asked, night, ev, yesOverride){
  const yes = (yesOverride || asked.filter(n => !CANT.includes(n)));
  await p.say(`Sent. You can close Sprout. I’ll tell you when someone answers, and I won’t book anyone without your OK.`, 900);
  await later(p, { status:'Waiting for sitters', small:`${night.day} · ${ev.label}`, ms:3500,
    title: yes.length ? (yes.length > 1 ? `${joinNames(yes)} are free` : `${yes[0]} is free`) : 'Your sitters replied',
    body: yes.length ? `For your night out, ${night.day}` : 'Open Assist to see their answers' });
  return yes;
}

/* ======================= A · step by step (Tony's order, one question at a time) ======================= */
X.flows.dateA = async p => {
  await p.say('A date night, love it. Which night? You and Dana are both free Friday and Saturday evening.', 1000);
  const n = await p.chips(['Fri, Jul 31', 'Sat, Aug 1', 'Another night'], { stub:[2] });
  const night = n === 0 ? NIGHTS.fri : NIGHTS.sat; sub(p, `Date night · ${night.day}`); p.title = `Date night · ${night.day}`;
  await p.say('What are you in the mood for?', 700);
  await p.chips(['Somewhere new', 'A place we like', 'Surprise me']);
  const w = p.work('Checking tables for 2', `${night.day} · near home`); await sleep(1400);
  w.done('3 places have tables', `${night.day} · 6:30 to 8:30 PM`, 'ph-fork-knife');
  await p.say('Pick a time. All three are free to cancel until the evening before, so it’s safe to book before we find a sitter.', 1100);
  p.set('Pick a table', { when:night.short });
  const pick = await placeCard(p, { night });
  await bookTable(p, night, pick);
  const ev = evening(pick.time);
  await p.say(`Dinner at ${clock(mins(pick.time))}. With the drive, I’ll ask a sitter for ${ev.label}.`, 900);
  const card = p.block(`<div class="card">
    <div class="ctop"><span class="icotile"><i class="ph ph-baby"></i></span><div><div class="eyebrow">Sitter request</div><div class="ttl">${night.long}</div></div></div>
    <div class="fields">${[{ l:'When', v:`${night.day} · ${ev.label}`, s:`30 min before you leave, until you’re home` }, { l:'Children', v:'Maya, 7 · Jake, 5' }, { l:'Where', v:'Our home · address shared after booking' }].map(f => fieldRow(f)).join('')}</div>
    <div class="qwrap"></div></div>`).querySelector('.card');
  editHint(card);
  await ask(p, card, 'Does the evening look right?', ['Looks right', 'Change the time'], { 1:'Tap a pencil to change a row (not part of this demo)' });
  card.querySelector('.qwrap').innerHTML = '';
  await p.say('Who should I ask?', 600);
  let asked = await sitterPicker(p);
  for (;;) {
    await sendToSitters(p, asked, night, ev);
    p.set('Waiting for sitters', { when:night.short });
    const yes = await waitForReplies(p, asked, night, ev);
    if (yes.length) {
      for (;;) {
        await p.say(`${joinNames(yes)} ${yes.length > 1 ? 'can both' : 'can'} do ${ev.label}. Who should I confirm?`, 900);
        p.block(`<div class="card"><div class="fields" style="margin-top:0">${asked.map(nm => `<div class="field">${mono(nm)}<div style="margin-left:10px"><div class="v" style="margin:0">${nm} · ${yes.includes(nm) ? 'free' : 'can’t make it'}</div><div class="fs">${yes.includes(nm) ? `$${SITTERS[nm].rate}/hour · about $${est(nm, ev)} · ${SITTERS[nm].times}` : 'Away that weekend'}</div></div></div>`).join('')}</div></div>`);
        p.set('Choose a sitter', { when:night.short });
        const i = await p.chips(yes.map(nm => 'Choose ' + nm));
        const name = yes[i];
        if (!await confirmNight(p, { name, night, ev, pick })) continue;
        await later(p, { status:`${name} · confirmation requested`, small:`${night.day} · ${ev.label}`, ms:2600, title:`${name} confirmed`, body:'Your date night is set' });
        p.note(`${name} · confirmed`, `${night.day} · ${ev.label}`, 'ph-calendar-check');
        const others = asked.filter(x => x !== name && yes.includes(x));
        await p.say(`${name} confirmed. ${others.length ? `I let ${joinNames(others)} know the night is covered. ` : ''}Your night is set.`, 900);
        return summary(p, { name, night, ev, pick });
      }
    }
    const more = await noSitter(p, { night, pick, asked });
    if (!more) return;
    p.me('Ask ' + joinNames(more)); asked = more;
  }
};

/* ======================= B · one plan card that fills in ======================= */
X.flows.dateB = async p => {
  await p.say('Date night. I’ll build it in one plan: answer a few taps, then I book dinner and find the sitter.', 1000);
  const c = p.block(`<div class="card">
    <div class="ctop"><span class="icotile"><i class="ph ph-moon-stars"></i></span><div><div class="eyebrow">Date night · your plan</div><div class="ttl">Night out for you and Dana</div></div></div>
    <div class="fields"></div><div class="qwrap"></div><div class="prog"></div></div>`).querySelector('.card');
  const n = await ask(p, c, 'Which night? You and Dana are both free Friday and Saturday.', ['Fri, Jul 31', 'Sat, Aug 1']);
  const night = n === 0 ? NIGHTS.fri : NIGHTS.sat; sub(p, `Date night · ${night.day}`); p.title = `Date night · ${night.day}`;
  addField(c, { l:'Night', v:night.day, s:'You and Dana are both free' });
  const hb = await ask(p, c, 'Home by?', ['10 PM', '10:30 PM', '11 PM']);
  const homeBy = ['10:00', '10:30', '11:00'][hb];
  addField(c, { l:'Home by', v:['10 PM', '10:30 PM', '11 PM'][hb] });
  const d = await ask(p, c, 'Dinner too?', ['Somewhere new', 'A place we like', 'No dinner, just a sitter']);
  addField(c, { l:'Dinner', v:['Somewhere new', 'A place we like', 'No dinner'][d], s:d < 2 ? 'Table for 2, near home' : 'Sitter only' });
  const s = await ask(p, c, 'Who should I ask to sit? Each gets a separate message.', ['Alex, Sam and Riley', 'Just Alex', 'Just Riley']);
  let asked = [['Alex', 'Sam', 'Riley'], ['Alex'], ['Riley']][s];
  addField(c, { l:'Sitter', v:joinNames(asked), s:'From your saved sitters' });
  c.querySelector('.qwrap').innerHTML = '';
  editHint(c);
  /* progress rows inside the card: what Sprout is doing, line by line */
  const setSitter = (v, sm) => { const r = [...c.querySelectorAll('.field')].find(x => x.querySelector('.l')?.textContent === 'Sitter'); if (r) { r.querySelector('.v').textContent = v; r.querySelector('.fs').textContent = sm; } };
  const prog = c.querySelector('.prog');
  const row = (k, html) => { let r = prog.querySelector(`[data-r=${k}]`); if (!r) { r = prog.appendChild(el(`<div data-r="${k}" style="margin-top:8px"></div>`)); } r.innerHTML = html; p.scroll(); return r; };
  const spin = (t, sm) => `<div class="status"><span class="spinner"></span><div>${t}<small>${sm}</small></div></div>`;
  const ok = (t, sm, icon) => `<div class="status"><span class="icotile"><i class="ph ${icon}"></i></span><div>${t}<small>${sm}</small></div><i class="ph-bold ph-check end"></i></div>`;
  const off = (t, sm) => `<div class="status"><span class="icotile"><i class="ph ph-x"></i></span><div>${t}<small>${sm}</small></div></div>`;
  await sleep(300);
  let pick = null;
  if (d < 2) {
    row('dinner', spin('Finding a table for 2', `${night.day} · back by ${clock(mins(homeBy))} PM`)); await sleep(1400);
    row('dinner', `<div class="q" style="margin-top:0"><p>Three places fit. Pick one; I’ll book the time that gets you home by ${clock(mins(homeBy))}.</p></div>
      <div class="fields" style="margin-top:8px">${PLACES.map((pl, i) => `<button class="pick" data-i="${i}">${mono(pl.n)}<span class="ptx">${pl.n} · ${pl.best} PM<small>${pl.s}</small></span><span class="cb rd"><i class="ph-bold ph-check"></i></span></button>`).join('')}</div>
      <div class="two" style="margin-top:10px"><button class="btn ghost" data-det>Details</button><button class="btn" data-go disabled>Pick a place</button></div>`);
    p.set('Pick a place', { when:night.short });
    pick = await new Promise(res => {
      const r = prog.querySelector('[data-r=dinner]'); let i = -1; const go = r.querySelector('[data-go]');
      r.querySelectorAll('.pick').forEach(b => b.onclick = () => { i = +b.dataset.i; r.querySelectorAll('.pick').forEach(x => x.classList.toggle('on', x === b)); go.disabled = false; go.textContent = `Book ${PLACES[i].best} PM`; });
      r.querySelector('[data-det]').onclick = () => i < 0 ? toast('Pick a place to see its details') : placeDetails(PLACES[i]);
      go.onclick = () => { if (i < 0) return; p.me(`Book ${PLACES[i].n} · ${PLACES[i].best} PM`); res({ place:PLACES[i], time:PLACES[i].best }); };
    });
    row('dinner', spin(`Booking ${pick.place.n}`, `${night.day} · ${pick.time} PM`)); await sleep(1300);
    row('dinner', ok(`${pick.place.n} · ${pick.time} PM`, `Booked · free to cancel until ${night.cancel}`, 'ph-fork-knife'));
  }
  const ev = evening(pick ? pick.time : '6:30', homeBy);
  for (;;) {
    row('sitter', spin(`Asking ${joinNames(asked)}`, `${night.day} · ${ev.label} · separate messages`));
    p.set('Waiting for sitters', { when:night.short });
    await p.say(`I asked ${joinNames(asked)} for ${ev.label}. You can close Sprout; this card keeps updating.`, 900);
    await later(p, { status:'Waiting for sitters', small:`${night.day} · ${ev.label}`, ms:3500,
      title: asked.some(x => !CANT.includes(x)) ? 'A sitter is free' : 'Your sitter replied', body:`Date night · ${night.day}` });
    const yes = asked.filter(x => !CANT.includes(x));
    if (!yes.length) {
      row('sitter', off(`${joinNames(asked)} can’t make it`, `${night.day} · away that weekend`));
      const left = Object.keys(SITTERS).filter(x => !asked.includes(x));
      await p.say(`${joinNames(asked)} can’t make it.${pick ? ` Your table is still booked, free to cancel until ${night.cancel}.` : ''}`, 900);
      const k = await ask(p, c, 'What should I do?', [`Ask ${joinNames(left)}`, 'Ask class families', pick ? 'Cancel the night' : 'Call it off'], { 1:'Same as the Class-family sitters flow' });
      c.querySelector('.qwrap').innerHTML = '';
      if (k === 0) { p.me(`Ask ${joinNames(left)}`); asked = left; setSitter(joinNames(left), `${joinNames(CANT)} can’t make it`); continue; }
      p.me(pick ? 'Cancel the night' : 'Call it off');
      if (pick) { row('dinner', spin(`Cancelling ${pick.place.n}`, night.day)); await sleep(1100); row('dinner', off(`${pick.place.n} · cancelled`, 'No fee')); }
      row('sitter', off('Sitter requests closed', night.day));
      c.querySelector('.ttl').textContent = 'Night called off'; p.set('Called off', { done:true });
      await p.say('Called off. Nothing is booked.', 700); return;
    }
    row('sitter', `<div class="status"><span class="icotile"><i class="ph ph-baby"></i></span><div>${joinNames(yes)} ${yes.length > 1 ? 'are' : 'is'} free<small>${yes.map(x => `${x} $${SITTERS[x].rate}/hr`).join(' · ')}${asked.filter(x => CANT.includes(x)).length ? ' · Riley can’t' : ''}</small></div></div>`);
    let name = yes[0];
    if (yes.length > 1) { const i = await ask(p, c, 'Who should I confirm?', yes.map(x => `${x} · about $${est(x, ev)}`)); name = yes[i]; c.querySelector('.qwrap').innerHTML = ''; }
    await p.say(`Here’s the night. Confirm and I’ll lock in ${name}.`, 800);
    if (!await confirmNight(p, { name, night, ev, pick })) { asked = yes; continue; }
    row('sitter', spin(`${name} · confirmation requested`, ev.label));
    await later(p, { status:`${name} · confirmation requested`, small:`${night.day} · ${ev.label}`, ms:2600, title:`${name} confirmed`, body:'Your date night is set' });
    row('sitter', ok(`${name} · ${ev.label}`, `Confirmed · about $${est(name, ev)}, paid to ${name}`, 'ph-baby'));
    setSitter(name, `${ev.label} · confirmed`);
    c.querySelector('.ttl').textContent = 'Your night is set';
    p.set(`${pick ? pick.place.n + ' ' + pick.time + ' · ' : ''}${name} ${ev.label}`, { when:night.short, done:true });
    await p.say(`${name} confirmed. Both are on the family calendar, so Dana has it too.`, 900);
    const e = await p.chips(['Text Dana the plan', 'Done']);
    await p.say(e === 0 ? 'Sent Dana the plan from you. Have a lovely night.' : 'Have a lovely night.', 700);
    if (e === 1) X.closeSheet();
    return;
  }
};

/* ======================= C · Sprout suggests the whole night ======================= */
X.flows.dateC = async p => {
  const night = NIGHTS.sat, pick0 = { place:PLACES[0], time:'7:00' }, ev0 = evening('7:00');
  await p.say('You and Dana are both free Saturday after 6. Your last night out was 5 weeks ago, so I put one together.', 1100);
  const c = p.block(`<div class="card">
    <div class="ctop"><span class="icotile"><i class="ph ph-moon-stars"></i></span><div><div class="eyebrow">Suggested · ${night.day}</div><div class="ttl">Date night</div></div></div>
    <hr><div class="fact"><i class="ph ph-fork-knife"></i>Olive &amp; Ember · 7:00 PM · table for 2 is open</div>
    <div class="fact"><i class="ph ph-baby"></i>Alex · ${ev0.label} · ${SITTERS.Alex.times}</div>
    <div class="fact"><i class="ph ph-currency-dollar"></i>Sitter about $${est('Alex', ev0)} · dinner $$$</div>
    <div class="foot"><i class="ph ph-info"></i>Nothing is booked until you say yes</div></div>`).querySelector('.card');
  p.set('Date night idea', { when:'Sat' });
  const k = await p.chips(['Book it', 'Other options', 'Not this week'], { into:c });
  if (k === 2) {
    await p.say('Okay, nothing booked. Should I suggest one again next week?', 800);
    const r = await p.chips(['Yes, next week', 'Stop suggesting date nights']);
    p.set(r === 0 ? 'Next week' : 'Suggestions off', { done:true });
    await p.say(r === 0 ? 'I’ll check your calendars next Monday.' : 'Got it. I won’t suggest date nights. You can still ask me anytime.', 800);
    return;
  }
  let pick = pick0, ev = ev0, asked = ['Alex'];
  if (k === 1) {
    await p.say('Here are the other open tables Saturday. Pick a time, then the sitter.', 900);
    pick = await placeCard(p, { night }); ev = evening(pick.time);
    await p.say(`Dinner at ${clock(mins(pick.time))}, so the sitter is ${ev.label}. Who should I ask?`, 900);
    asked = await sitterPicker(p);
  }
  await bookTable(p, night, pick);
  await sendToSitters(p, asked, night, ev);
  p.set('Waiting for sitters', { when:'Sat' });
  /* the suggested sitter can say no: Alex is busy, so Sprout offers the next sitters */
  let yes = await waitForReplies(p, asked, night, ev, k === 0 ? [] : null);
  if (!yes.length) {
    const more = await noSitter(p, { night, pick, asked });
    if (!more) return;
    p.me('Ask ' + joinNames(more)); asked = more;
    await sendToSitters(p, asked, night, ev);
    yes = await waitForReplies(p, asked, night, ev);
  }
  let name = yes[0];
  const no = asked.filter(x => !yes.includes(x));
  if (yes.length === 1) await p.say(`${name} is free${no.length ? `, ${joinNames(no)} can’t make it` : ''}. Check the night before I confirm ${name}.`, 900);
  if (yes.length > 1) {
    await p.say(`${joinNames(yes)} are free. Who should I confirm?`, 800);
    name = yes[await p.chips(yes.map(x => `${x} · about $${est(x, ev)}`))];
  }
  while (!await confirmNight(p, { name, night, ev, pick })) await p.say(`Okay. ${name} is holding the evening for you.`, 600);
  await later(p, { status:`${name} · confirmation requested`, small:`${night.day} · ${ev.label}`, ms:2600, title:`${name} confirmed`, body:'Your date night is set' });
  p.note(`${name} · confirmed`, `${night.day} · ${ev.label}`, 'ph-calendar-check');
  await p.say(`${name} confirmed. Your night is set.`, 800);
  return summary(p, { name, night, ev, pick });
};

X.dn = { evening, est, hrs, clock, mins, confirmNight, sendToSitters, SITTERS, NIGHTS, CANT, joinNames, later, mono, sub };

/* ======================= routes for review: /date-night-a/, -b/, -c/ ======================= */
const route = location.pathname.split('/').filter(Boolean)[0] || '';
function dateTile(k){
  const nights = X.TILES.nights, i = nights.findIndex(x => x.k === 'nightOut');
  nights.splice(i, 1, { k, t:'Plan a date night', s:'Dinner, then a sitter', icon:'calendar-check' });
  X.renderHome();
}
const R = {
  /* A and B start like the real app: Daily Brief, tap the clover, tap "Plan a date night" on Assist home */
  'date-night-a': () => dateTile('dateA'),
  'date-night-b': () => dateTile('dateB'),
  'date-night-c': () => {   /* Daily Brief first; Sprout reaches out (approved clover peek), tap the clover to open */
    const p = X.makePlan('dateC', { title:'Date night · Sat, Aug 1', sub:'Date night · Sat, Aug 1', icon:'calendar-check' });
    setTimeout(() => X.notify(p, 'Free Saturday night?', 'You and Dana are both free. Date night?'), 900);
    const t = setInterval(() => { if (X.isOpen()) { clearInterval(t); setTimeout(() => X.flows.dateC(p), 500); } }, 150);
  },
};
if (R[route]) setTimeout(R[route], 500);
})();
