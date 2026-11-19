/* Flows. Parts = the approved SSC Kids demo (app.js). Steps and copy = Figma, by frame:
   sports = SSC demo (Tony-approved) + K12 v2 branches 15492:51581 · camps = K10 v3 15524:43294 ·
   sitters = A8 16151:356321 · events = K4 row F · clubs = K4 row G (14892:33651).
   One family, one calendar: today is Monday, July 27 (the Daily Brief). School: Lincoln Elementary.
   Maya (7) is in Miss Taylor's class, Jake (6 in Sep) in Miss Poole's. */
(() => {
const X = window.Sprout, { sleep, el, toast, notInDemo, ask, addField, fieldRow, editHint, overlay, bsheet, approval, confirmSitter, providerAccount, A } = X;
const $ = s => document.querySelector(s);
const F = A + 'figma/';
const joinNames = n => n.length < 2 ? n.join('') : n.slice(0, -1).join(', ') + ' and ' + n[n.length - 1];
const mono = n => `<span class="logo mono">${n[0]}</span>`;
const sub = (p, s) => { p.sub = s; if (!p.chat.hidden) X.$('#hsub').textContent = s; };
/* the parent is away; something comes back later (reply, sign-up day). Badge + peek if Assist is closed. */
async function later(p, { status, small, ms = 4000, title, body }){
  const w = p.block(`<div class="status"><span class="spinner"></span><div>${status}<small>${small || ''}</small></div></div>`);
  await sleep(ms); w.remove();
  X.notify(p, title, body);
}
const preview = (text, label = 'Message preview') => `<div class="preview"><small>${label}</small><p>${text}</p></div>`;
const todo = (p, t, chip, from) => p.block(`<div class="todo"><span class="box"></span><span class="av"></span><div><b>${t}</b><small><em>${chip}</em>${from}</small></div></div>`);

/* SSC waiver / full-details viewer: full screen, scroll to the end to agree */
function openDoc({ title, sub, body, hint, cta, gate, id }){
  return new Promise(res => {
    const v = overlay({ title, sub, body, id, plain:false, foot:`${hint ? `<div class="whint">${hint}</div>` : ''}<button type="button" class="btn" data-go ${gate ? 'disabled' : ''}>${gate ? 'Scroll to the end to agree' : cta}</button>` });
    const btn = v.o.querySelector('[data-go]');
    if (gate) v.body.onscroll = () => { if (v.body.scrollTop + v.body.clientHeight >= v.body.scrollHeight - 24) { btn.disabled = false; btn.textContent = cta; } };
    btn.onclick = () => { if (btn.disabled) return; v.close(); res(true); };
    v.o.querySelector('.wclose').addEventListener('click', () => res(false));
  });
}

/* ======================= Sports · SSC Kids (Tony-approved demo copy) + K12 v2 branches ======================= */
const PREFILL = [
  { l:'Parent', v:'Tony Martin', s:'Born Sep 18, 1986 · tony@martinfam.com · (512) 555-0142' },
  { l:'Home address', v:'10212 Banks Court', s:'Austin, TX 78739' },
  { l:'Player', v:'Jake Martin · boy', s:'Born Sep 14, 2020 · kindergarten this fall' },
  { l:'School', v:'Lincoln Elementary' },
  { l:'Emergency contact', v:'Dana Martin · mom', s:'(512) 555-0187' },
  { l:'Volunteer · played soccer this year', v:'No · No', s:'First league through Sprout' },
  { l:'Optional', v:'No coach request · no discount code', s:'SSC Kids promo emails: off' },
];
const QUESTIONS = [
  { label:'Registration type', q:'SSC Kids signs players up on their own or as part of a small group of friends. Same price. Which one?', opts:['Individual','Small group member'] },
  { label:'Shirt size', q:"What's Jake's shirt size?", opts:['Youth XS','Youth S','Youth M','Youth L'] },
  { label:'Practice night', q:"Practice is one weeknight. Which works better? I'll put the other as his second choice.", opts:['Monday','Wednesday'], val:{ Monday:'1st Monday · 2nd Wednesday', Wednesday:'1st Wednesday · 2nd Monday' } },
  { label:'Team type', q:'SSC Kids also has boys-only teams. Want one, or is co-ed fine?', opts:['Co-ed is fine','Boys-only'] },
  { label:'ASL interpreter', q:'Does Jake need an ASL interpreter at practice and games?', opts:['No','Yes'] },
];
const WAIVER = `<div class="page"><div class="demo-note">Demo copy. SSC Kids' own waiver loads here once we have their API.</div><img class="wlogo" src="${A}ssc-logo.webp" alt=""><h3>Austin SSC Kids Youth Sports Leagues</h3><h4>Participant Waiver, Release and Consent</h4><p>Participant: <b>Jake Martin</b> · Program: <b>Fall Rec Soccer, Pre-K &amp; K</b> · Parent or guardian: <b>Tony Martin</b></p><h5>1. Risks of play</h5><p>Youth soccer involves running, contact with other players and the ball, weather and field conditions. I understand that injuries can happen even when rules and safety steps are followed.</p><h5>2. Release</h5><p>For my child and myself, I release the league, its coaches, volunteers, sponsors and field owners from claims for injury or loss arising from participation, except where caused by gross negligence or willful misconduct.</p><h5>3. Medical care</h5><p>If I cannot be reached in an emergency, I allow league staff to arrange first aid and medical treatment for my child. I am responsible for the cost of that care.</p></div><div class="page"><h5>4. Conduct</h5><p>Players, parents and spectators follow the league code of conduct. The league may remove anyone whose behavior puts others at risk.</p><h5>5. Weather and schedule</h5><p>Games and practices may be moved or cancelled for weather or field closures. Cancelled games are not refunded.</p><h5>6. Photos</h5><p>The league may take photos at games for its website and social media. I can opt out by emailing the league.</p><h5>7. Refunds</h5><p>Registration fees are refundable, minus the processing fee, until teams are formed.</p><h5>8. Agreement</h5><p>I have read this waiver, understand it, and agree to it on behalf of my child and myself.</p><div class="sign">Signing as <b>Tony Martin</b> · parent of Jake</div></div>`;
const DETAILS = `<div class="page"><div class="demo-note">From SSC Kids' Lakeline page. Fall 2026 isn't posted yet, so dates follow last fall.</div><img class="wlogo" src="${A}ssc-logo.webp" alt=""><h3>Austin SSC Kids Youth Sports Leagues</h3><h4>REC Soccer · Pre-K &amp; Kindergarten</h4><h5>Who</h5><p>Born 2020–2021 (ages 4–6) · co-ed · recreational. Jake, born Sep 2020, fits this division.</p><h5>Games</h5><p>Saturdays at 10:00 AM · Sep 12 – Oct 31, 8 Saturdays. Make-up dates Nov 7, 14 and 21 if games are rained out. The game schedule comes closer to the season.</p><h5>Practice</h5><p>Once a week from the week of Sep 7, at 4:30, 5:00 or 5:30 PM. The day is set when teams are formed.</p><h5>Where</h5><p>Lakeline Park, Northwest Austin · 1.8 mi from home</p><h5>Cost</h5><p>$135, plus a 3% processing fee at checkout</p><h5>Included</h5><p>Team shirt · request teammates · end-of-season party</p><h5>Sign-ups close</h5><p>Sunday, Aug 16</p><h5>Questions</h5><p>info@austinssckids.com · (512) 387-1551</p></div>`;

X.flows.sports = async p => {
  await p.say("Fall soccer sign-ups are open for Jake's age. SSC Kids has a Pre-K &amp; K team at Lakeline Park, Saturdays at 10, and two families from his class already signed up.", 1000);
  await sleep(250);
  const b = p.block(`<div class="card">
    <div class="photo"><span class="pill">Closes Aug 16</span></div>
    <div class="ctop"><img class="logo" src="${A}ssc-logo.webp" alt="SSC Kids"><div><div class="ttl">SSC Kids Soccer</div><div class="sub">Fall rec · Pre-K &amp; K · co-ed</div></div></div>
    <hr>
    <div class="fact"><i class="ph ph-calendar-blank"></i>8 Saturdays · Sep 12 – Oct 31 · 10 AM</div>
    <div class="fact"><i class="ph ph-map-pin"></i>Lakeline Park · 1.8 mi</div>
    <div class="faces"><span><i style="background-image:url(${A}priya.webp)"></i><i style="background-image:url(${A}aisha.webp)"></i><i class="n">+2</i></span>4 from Jake's class</div>
    <div class="price"><div><b>$135 + 3% fee</b><small>Team shirt included</small></div><button class="link" data-details>Full details <i class="ph ph-caret-right"></i></button></div>
  </div>`);
  p.set('Sign-ups close Aug 16', { when:'Aug 16' });
  b.querySelector('[data-details]').onclick = async () => { if (await openDoc({ id:'details', title:'SSC Kids Soccer', sub:'Fall rec · Pre-K &amp; K · co-ed', body:DETAILS, hint:'Jake fits Pre-K &amp; K · $135 + 3% fee', cta:'Register Jake' })) { const c = b.querySelector('.chips:not(.done) .chip'); c && c.click(); } };
  const pick = await p.chips(['Register Jake', 'Remind me later', 'Not this season'], { into:b, echo:false });
  if (pick === 1) {   // K12 M·1 / M·2
    p.me('Remind me later');
    await p.say('Sure. Sign-ups close Sunday, Aug 16. When should I remind you?', 900);
    const w = await p.chips(['Aug 13, three days before', 'Next Monday', 'Pick a date'], { stub:[2] });
    await p.say(w === 0 ? 'Done. I’ll remind you Thursday, Aug 13 at 8 AM, three days before sign-ups close.' : 'Done. I’ll remind you Monday, Aug 3 at 8 AM.', 900);
    todo(p, 'Sign Jake up for fall soccer', w === 0 ? 'Aug 13' : 'Aug 3', 'From Sprout · SSC Kids');
    p.set('Reminder set', { when: w === 0 ? 'Aug 13' : 'Aug 3', done:true }); return;
  }
  if (pick === 2) {   // K12 Q·1 – Q·3
    p.me('Not this season');
    await p.say('Okay. Want me to check in before spring sign-ups instead?', 800);
    const s = await p.chips(['Yes, in January', 'No thanks']);
    if (s === 0) { await p.say('Got it. Spring sign-ups open January 6. I’ll remind you that morning, and Jake’s form will already be filled.', 1000); todo(p, 'Sign Jake up for spring soccer', 'Jan 6', 'From Sprout · SSC Kids spring'); p.set('Check in January', { when:'Jan 6', done:true }); }
    else { await p.say('Okay. I won’t bring up soccer for Jake again this year. Ask me anytime.', 900); p.set('Not this season', { done:true }); }
    return;
  }
  p.me('Register Jake for SSC Kids');
  await p.say("I filled in SSC Kids' form with what Sprout already knows. Check it and change anything that's off. They need five more answers from you, then the waiver.", 1100);
  await sleep(200);
  const TOTAL = PREFILL.length + QUESTIONS.length + 1;
  const card = p.block(`<div class="card">
    <div class="ctop"><span class="icotile"><i class="ph ph-clipboard-text"></i></span><div><div class="eyebrow">Jake's registration · <b class="cnt">${PREFILL.length}</b> of ${TOTAL} ready</div><div class="ttl">SSC Kids Soccer · Fall</div></div></div>
    <div class="progress"><i style="width:${PREFILL.length / TOTAL * 100}%"></i></div>
    <div class="from-sprout"><span class="orb sm"></span>From Jake's Sprout profile · tap <i class="ph ph-pencil-simple"></i> to change</div>
    <div class="fields">${PREFILL.map(f => fieldRow(f)).join('')}</div>
    <div class="qwrap"></div>
    <div class="foot">Then: registration type, shirt size, practice night, team type, ASL interpreter, waiver</div>
  </div>`).querySelector('.card');
  editHint(card);
  p.set('Check Jake’s form', { when:'Now' });
  await ask(p, card, 'Does everything from Jake’s profile look right?', ['Looks right', 'Change something'], { 1:'Tap a pencil to change a row (not part of this demo)' });
  let ready = PREFILL.length, practice = 'Monday';
  const bump = (label, v, left) => { addField(card, { l:label, v }); ready++; card.querySelector('.cnt').textContent = ready; card.querySelector('.progress i').style.width = (ready / TOTAL * 100) + '%'; card.querySelector('.foot').textContent = left.length ? 'Still to go: ' + left.join(', ') : ''; };
  const order = ['registration type','shirt size','practice night','team type','ASL interpreter','waiver'];
  for (let i = 0; i < QUESTIONS.length; i++) {
    const Q = QUESTIONS[i], a = await ask(p, card, Q.q, Q.opts), txt = Q.opts[a];
    if (Q.label === 'Practice night') practice = txt;
    bump(Q.label, (Q.val && Q.val[txt]) || txt, order.slice(i + 1));
  }
  const wrap = card.querySelector('.qwrap'); wrap.innerHTML = '';
  const q = el(`<div class="q"><p>Last one. SSC Kids asks a parent to accept their waiver. It's your call, so I won't accept it for you.</p>
    <button class="doc" type="button"><span class="pdf">PDF</span><span class="dt"><b>SSC Kids Participant Waiver</b><small>2 pages · tap to read</small></span><i class="ph ph-caret-right"></i></button>
    <div class="chips"><button class="chip" data-k="read">Read it</button><button class="chip" data-k="agree">I agree</button></div></div>`);
  wrap.appendChild(q); p.scroll();
  const how = await new Promise(res => {
    const read = async () => { if (await openDoc({ title:'SSC Kids Participant Waiver', sub:'PDF · 2 pages', body:WAIVER, cta:'I agree', gate:true })) res('viewer'); };
    q.querySelector('.doc').onclick = read; q.querySelector('[data-k=read]').onclick = read;
    q.querySelector('[data-k=agree]').onclick = () => res('chip');
  });
  q.querySelector('.chips').classList.add('done'); q.querySelector('[data-k=agree]').classList.add('sel'); q.querySelector('.doc').style.pointerEvents = 'none';
  await sleep(260);
  bump('Waiver', how === 'viewer' ? 'Read and accepted by you' : 'Accepted by you', []);
  wrap.innerHTML = ''; const f = card.querySelector('.foot'); f.className = 'foot ok'; f.innerHTML = `<i class="ph-bold ph-check"></i> All ${TOTAL} ready · saved to Jake’s profile for next time`; p.scroll();
  await sleep(500);
  await p.say('SSC Kids takes team requests. These classmates are signed up. Pick anyone Jake should play with:', 1000);
  const t = p.block(`<div class="card">
    <div class="ctop"><span class="icotile"><i class="ph ph-users-three"></i></span><div><div class="eyebrow">Team request · optional · pick any</div><div class="ttl">Same team as</div></div></div>
    <div class="fields">
      <button class="pick" data-n="Leo"><span class="av" style="background-image:url(${A}priya.webp)"></span>Leo, Priya's son<span class="cb"><i class="ph-bold ph-check"></i></span></button>
      <button class="pick" data-n="Ava"><span class="av" style="background-image:url(${A}aisha.webp)"></span>Ava, Aisha's daughter<span class="cb"><i class="ph-bold ph-check"></i></span></button>
      <button class="pick" data-n="Noah"><span class="av" style="background-image:url(${A}elena.webp)"></span>Noah, Elena's son<span class="cb"><i class="ph-bold ph-check"></i></span></button>
    </div>
    <button class="btn" disabled>Pick a teammate, or skip</button>
  </div>`);
  const btn = t.querySelector('.btn'), picks = [...t.querySelectorAll('.pick')];
  const names = () => picks.filter(x => x.classList.contains('on')).map(x => x.dataset.n);
  picks.forEach(x => x.onclick = () => { x.classList.toggle('on'); const n = names(); btn.disabled = !n.length; btn.textContent = n.length ? 'Request ' + joinNames(n) : 'Pick a teammate, or skip'; });
  const team = await new Promise(res => { btn.onclick = () => res(names()); p.chips(['No preference'], { into:t, echo:false }).then(() => res([])); });
  picks.forEach(x => x.style.pointerEvents = 'none'); btn.remove(); t.querySelector('.chips')?.remove();
  p.me(team.length ? joinNames(team) : 'No preference'); await sleep(350);
  if (team.length) p.note('Team request added', `Jake with ${joinNames(team)}`);
  await sleep(400);
  await providerAccount(p, { provider:'SSC Kids', site:'ssckids.leaguelab.com', kid:'Jake', ask:'Last step. SSC Kids needs a parent account to register Jake. I can make one with tony@martinfam.com, or use the one you already have.' });
  await sleep(400);
  await p.say("Jake's form is complete. Fall rec is $135 and includes his team shirt and the end-of-season party. Approve $139.05 to register him.", 1100);
  p.set('Approve $139.05 to register Jake', { when:'Now' });
  const r = await approval(p, { sub:'SSC Kids Soccer', forHtml:`<img class="s" src="${A}jake.webp" alt="Jake">For Jake · Fall Pre-K &amp; K${team.length ? ' · team with ' + joinNames(team) : ''}`, lines:[['Fall rec · Pre-K &amp; K', '$135.00'], ['Processing fee (3%)', '$4.05']], total:'$139.05', code:'LS-30418', time:'9:43 AM' });
  if (!r.ok) { await sleep(300); await p.say("No problem. Nothing was paid and Jake isn't registered. Sign-ups stay open until Aug 16.", 900); p.set('Not registered · open until Aug 16', { when:'Aug 16' }); return; }
  await sleep(500);
  p.receipt('Registered · Jake, SSC Kids Fall, Pre-K &amp; K');
  X.S.sscDone = true;
  p.set('Registered · first game Sat, Sep 12', { when:'Sep 12', done:true });
  await sleep(400);
  await p.say(`Jake is signed up for SSC Kids. They email his team and practice night in early September (you asked for ${practice} first). I'll watch for it and add them to your to-dos.`, 1100);
  const d = await p.chips(['Thanks', "Open Jake's profile"], { stub:[1] });
  if (d === 0) await p.say("Anytime. I'll tell you when the team and schedule email comes in.", 800);
};

/* ======================= Summer camps · K10 v3 ======================= */
const CAMPS = {
  pinecrest: { n:'Pinecrest Day Camp', short:'Pinecrest', img:A + 'camp/pinecrest.webp', hero:F + 'pinecrest-hero.jpg', gal:[F + 'pinecrest-hero.jpg', F + 'pinecrest-2.jpg', F + 'pinecrest-3.jpg'], price:420, where:'2 mi from home', kind:'Outdoors', site:'pinecrestcamp.org',
    who:'Priya, Aisha + 2', faces:['priya.webp', 'aisha.webp'], plus:2,
    weeks:[['June 7–11', '4 from Maya’s class · 4 spots left', 'on'], ['June 14–18', '9 spots left', 'on'], ['June 21–25', 'Full', 'full'], ['June 28 – July 2', '12 spots left', '']] },
  barton: { n:'Barton Swim Camp', short:'Barton Swim', img:F + 'barton-swim.jpg', hero:F + 'barton-swim.jpg', gal:[F + 'barton-swim.jpg', F + 'pinecrest-2.jpg', F + 'pinecrest-3.jpg'], price:310, where:'1.5 mi from home', kind:'Swim', site:'bartonswim.org',
    who:'Marcus (Eli’s dad)', faces:['elena.webp'], plus:0, spots:'6 spots left',
    weeks:[['June 7–11', 'Eli from Maya’s class · 6 spots left', 'on'], ['June 14–18', '8 spots left', ''], ['June 21–25', '10 spots left', '']] },
};
const facesHtml = c => `<div class="faces"><span>${c.faces.map(f => `<i style="background-image:url(${A}${f})"></i>`).join('')}${c.plus ? `<i class="n">+${c.plus}</i>` : ''}</span>${c.who}</div>`;
const mapCard = (pins, row) => `<div class="card"><div class="mapwrap">${pins}<span class="mhome" style="left:40%;top:63%"><i class="ph-fill ph-house"></i></span></div>${row}</div>`;
const pin = (img, x, y, label, big) => `<span class="mpin${big ? ' big' : ''}" style="left:${x}%;top:${y}%;background-image:url(${img})">${label ? `<span class="lbl">${label}</span>` : ''}</span>`;
const campRow = (k, wk) => { const c = CAMPS[k]; return `<div class="camprow" data-camp="${k}"><span class="thumb" style="background-image:url(${c.img})"></span><div><div class="ttl">${c.n}</div><div class="sub">${wk || 'June 7–11'} · ${c.where}</div>${facesHtml(c)}<div class="cprice"><b>$${c.price}</b><small>/ week</small><button class="link" data-details="${k}">Details <i class="ph ph-caret-right"></i></button></div></div></div>`; };
/* K10 D·1: camp details, bottom sheet, "Choose weeks" in the footer */
function campDetails(k){
  const c = CAMPS[k];
  return new Promise(res => {
    const v = bsheet({ onBack:() => res(false),
      body:`<div class="bhero" style="background-image:url(${c.hero})"></div><div class="btitle">${c.n}</div><div class="bsub">Ages 6–10 · ${c.kind === 'Swim' ? 'Swim day camp' : 'Outdoor day camp'}</div>
        <div class="fact"><i class="ph ph-clock"></i>9 AM–3 PM, Mon–Fri · before-care from 7:30 AM</div>
        <div class="fact"><i class="ph ph-sparkle"></i>${c.kind === 'Swim' ? 'Swim lessons every morning · games after lunch' : 'Hiking, creek days, crafts · swim on Fridays'}</div>
        <div class="fact"><i class="ph ph-map-pin"></i>${c.where}</div>${facesHtml(c)}
        <button class="link" style="margin:4px 0 6px" data-site>Full details on ${c.site} <i class="ph ph-caret-right"></i></button>`,
      foot:`<div class="bprice"><b>$${c.price}</b><small>/ week</small></div><button type="button" class="btn" data-go>Choose weeks</button>` });
    v.body.querySelector('[data-site]').onclick = () => toast(`Opens ${c.site} (not part of this demo)`);
    v.foot.querySelector('[data-go]').onclick = () => { v.close(); res(true); };
  });
}
/* K10 P·4: pick weeks, bottom sheet; Sprout preselects the week her class goes */
function pickWeeks(k, kid = 'Maya'){
  const c = CAMPS[k];
  return new Promise(res => {
    const v = bsheet({ onBack:() => res(null),
      body:`<div class="bgal">${c.gal.map(g => `<i style="background-image:url(${g})"></i>`).join('')}</div>
        <div class="btitle">${c.n}</div><div class="bsub">Ages 6–10 · 9 AM–3 PM · ${c.kind} · from ${c.site}</div>
        <span class="mypick"><i class="ph ph-sparkle"></i>My pick: June 7–11, the week her class goes</span>
        <div class="bq">Which weeks should ${kid} go?</div>
        <div class="fields" style="margin-top:0">${c.weeks.map(([d, s, st], i) => `<button class="pick${st === 'on' ? ' on' : ''}" data-i="${i}"${st === 'full' ? ' aria-disabled="true"' : ''}><span class="ptx">${d}<small>${s}</small></span>${st === 'full' ? '<span class="note">Waitlist</span>' : '<span class="cb"><i class="ph-bold ph-check"></i></span>'}</button>`).join('')}</div>`,
      foot:`<div class="bprice"><b></b><small></small></div><button type="button" class="btn" data-go></button>` });
    const rows = [...v.body.querySelectorAll('.pick:not([aria-disabled])')], go = v.foot.querySelector('[data-go]');
    const sel = () => rows.filter(r => r.classList.contains('on')).map(r => c.weeks[+r.dataset.i][0]);
    const paint = () => { const n = sel().length; v.foot.querySelector('b').textContent = '$' + (n * c.price).toLocaleString(); v.foot.querySelector('small').textContent = `${n} week${n === 1 ? '' : 's'}`; go.disabled = !n; go.textContent = n ? `Sign up for ${n} week${n === 1 ? '' : 's'}` : 'Pick a week'; };
    rows.forEach(r => r.onclick = () => { r.classList.toggle('on'); paint(); }); paint();
    go.onclick = () => { v.close(); res(sel()); };
  });
}
async function campForm(p, k, weeks){
  const c = CAMPS[k], wk = weeks.join(', '), sum = weeks.length * c.price;
  await p.say(`Good pick. ${c.short} opens Friday at 9 AM and fills the same day. Let's get Maya's form ready now, so I can hold her spot the moment it opens.`, 1100);
  const TOTAL = 7;
  const card = p.block(`<div class="card">
    <div class="ctop"><span class="icotile"><i class="ph ph-clipboard-text"></i></span><div><div class="eyebrow">Maya's registration · <b class="cnt">3</b> of ${TOTAL} ready</div><div class="ttl">${c.n} · ${weeks.length} week${weeks.length > 1 ? 's' : ''}</div></div></div>
    <div class="progress"><i style="width:${3 / TOTAL * 100}%"></i></div>
    <div class="fields">${[
      [{ l:'Weeks', v:wk }, 'Your pick'], [{ l:'Camper', v:'Maya Martin, age 7' }, 'From Sprout'],
      [{ l:'Birthday', v:'Mar 3, 2019' }, 'From Sprout'], [{ l:'Emergency contact', v:'Dana Martin' }, 'From Jake’s form'],
    ].map(([f, t]) => fieldRow(f, t)).join('')}</div>
    <div class="qwrap"></div><div class="foot">Still to go: shirt size, pickup people, allergies, waiver</div>
  </div>`).querySelector('.card');
  editHint(card);
  const step = (n, l, v, left) => { addField(card, { l, v }); card.querySelector('.cnt').textContent = n; card.querySelector('.progress i').style.width = (n / TOTAL * 100) + '%'; card.querySelector('.foot').textContent = left; };
  const sizes = ['Youth S', 'Youth M', 'Youth L', 'Youth XL'];
  const s = await ask(p, card, 'What’s Maya’s shirt size?', sizes); step(4, 'Shirt size', sizes[s], 'Still to go: pickup people, allergies, waiver');
  const pk = await ask(p, card, `Who’s allowed to pick Maya up? ${c.short} checks this list at the gate.`, ['Dana and me', 'Just me', 'Add someone'], { 2:'Adding someone is not part of this demo' });
  const pickup = pk === 0 ? 'Dana Martin, Tony Martin' : 'Tony Martin';
  step(5, 'Pickup', pickup, 'Still to go: allergies, waiver');
  await ask(p, card, `Any allergies, medicines or medical notes for ${c.short}? Nothing is on Maya’s profile yet.`, ['Nothing to add', 'Add a note'], { 1:'Adding a note is not part of this demo' });
  step(6, 'Allergies', 'None', 'Still to go: waiver');
  // K10 P·8 waiver summary + X·3 full waiver sheet
  const wrap = card.querySelector('.qwrap'); wrap.innerHTML = '';
  const q = el(`<div class="q"><p>Last one: ${c.short}’s waiver. In short:</p>
    <div class="preview" style="background:#fff;margin-top:8px"><p>· Release for camp activities, swim and field trips<br>· Staff can give first aid and call 911<br>· Camp photos can be shared with camp families</p><button class="link" style="margin:6px 0 0" data-read>Read the full waiver · 2 pages <i class="ph ph-caret-right"></i></button></div>
    <div class="chips"><button class="chip" data-k="agree">I agree to the waiver</button><button class="chip" data-k="read">Read it first</button></div></div>`);
  wrap.appendChild(q); card.querySelector('.foot').textContent = `You sign as Tony Martin. ${c.short} gets a dated copy, and it's saved here.`; p.scroll();
  await new Promise(res => {
    const read = () => { const v = bsheet({ body:`<div class="bh"><span class="icotile"><i class="ph ph-clipboard-text"></i></span><b>${c.short} waiver · 2 pages</b></div>
      <p class="bp">1. Activities. Maya can join hiking, creek days, crafts and supervised swimming on Fridays.</p><p class="bp">2. Medical. If staff can't reach you, they can give first aid and call 911. They use the allergy notes on her form.</p><p class="bp">3. Photos. Camp photos may be shared with ${c.short} families. Ask the office to opt out.</p><p class="bp">4. Pickup. Only people on her pickup list can sign her out, with a photo ID.</p><p class="bp">5. Refunds. Full refund until May 1, then half until June 1.</p>`,
      stack:true, foot:`<button type="button" class="btn" data-go>I agree to the waiver</button><button type="button" class="textbtn" data-x>Close</button>` });
      v.foot.querySelector('[data-go]').onclick = () => { v.close(); res(); }; v.foot.querySelector('[data-x]').onclick = () => v.close(); };
    q.querySelector('[data-read]').onclick = read; q.querySelector('[data-k=read]').onclick = read;
    q.querySelector('[data-k=agree]').onclick = res;
  });
  q.querySelector('.chips').classList.add('done'); q.querySelector('[data-k=agree]').classList.add('sel');
  await sleep(260); step(7, 'Waiver', 'Signed by you', ''); wrap.innerHTML = '';
  const f = card.querySelector('.foot'); f.className = 'foot ok'; f.innerHTML = `<i class="ph-bold ph-check"></i> All ${TOTAL} ready`;
  await sleep(400);
  // K10 P·9: saved to Maya's profile
  await p.say('Saved to Maya’s profile. Pickup people are saved for the whole family, so Jake’s forms use them too.', 1000);
  p.block(`<div class="card"><div class="ctop"><span class="icotile"><i class="ph ph-user-circle"></i></span><div><div class="eyebrow">Maya’s profile · 3 saved today</div><div class="ttl">Ready for next time</div></div></div>
    <div class="fields">${[[{ l:'Shirt size', v:sizes[s] }, 'Saved today'], [{ l:'Birthday', v:'Mar 3, 2019' }, 'From Sprout'], [{ l:'Allergies', v:'None' }, 'Saved today'], [{ l:'Pickup', v:pickup }, 'Whole family']].map(([x, t]) => fieldRow(x, t)).join('')}</div></div>`);
  await sleep(400);
  // K10 A·1 – A·3
  await providerAccount(p, { provider:c.short, site:c.site, kid:'Maya', opts:['Yes, create it', 'I already have one'], ask:`${c.short} needs a parent account. Want me to make one with tony@martinfam.com?`,
    after: async signed => { p.receipt(`Watching ${c.short} · opens Friday at 9 AM`); await p.say(signed ? `Signed in. Sprout never sees your password. I’ll hold Maya’s spot Friday at 9.` : `Done. The login is saved in your password manager, so you never type it. I’ll hold Maya’s spot Friday at 9.`, 1000); } });
  p.set(`Holding Maya’s spot Friday at 9`, { when:'Fri' });
  // K10 P·10 / P·11: sign-up day
  await later(p, { status:`Watching ${c.short}`, small:'Opens Friday at 9 AM', ms:4200, title:`${c.short} is open`, body:`Maya’s spot is held for 10 minutes. Approve $${sum} to register her.` });
  p.divider('Friday · 9:01 AM');
  await p.say(`${c.short} just opened and Maya’s spot is held. Her form is complete. Approve $${sum} for ${weeks.length > 1 ? 'both weeks' : 'her week'}?`, 1000);
  p.set(`Approve $${sum} · spot held until 9:11`, { when:'Fri', attn:!X.isOpen() });
  return { c, sum, wk, weeks };
}
X.flows.camps = async (p, opt = {}) => {
  await p.say('Camp sign-ups start this week. I mapped 6 camps near home for Maya. My pick is Pinecrest: 2 mi away, and 4 families from her class are going.', 1100);
  await sleep(250);
  p.note('Checked 18 camps', 'June–July · age 7 · under 20 min');
  await sleep(250);
  const entry = p.block(mapCard(`${pin(A + 'camp/lakeside.webp', 22, 22)}${pin(A + 'camp/pinecrest.webp', 55, 33, 'Pinecrest', true)}${pin(A + 'camp/creekside.webp', 80, 52)}`, campRow('pinecrest')));
  p.set('Pinecrest Day Camp · June 7–11', { when:'Now' });
  const detailHook = host => host.querySelectorAll('[data-details]').forEach(b => b.onclick = async e => { e.stopPropagation(); if (await campDetails(b.dataset.details)) host.dispatchEvent(new CustomEvent('choose', { detail:b.dataset.details })); });
  // choose a camp: chips, or "Choose weeks" from the details sheet
  const choose = (host, opts, keys, stub = []) => new Promise(res => {
    detailHook(host);
    host.addEventListener('choose', e => { const c = host.querySelector('.chips:not(.done)'); c && c.classList.add('done'); p.me('Choose weeks'); res({ k:e.detail }); }, { once:true });
    p.chips(opts, { into:host, stub }).then(i => res({ i, k:keys[i] }));
  });
  let pick = await choose(entry, ['Yes, Pinecrest', 'Show me others', 'Not now'], ['pinecrest', null, null]);
  if (pick.i === 2) {   // K10 Q·2
    await p.say('Okay. Pinecrest still opens Friday at 9. Want a reminder Thursday night so you don’t miss it?', 900);
    const r = await p.chips(['Yes, remind me', 'No thanks']);
    if (r === 0) { await p.say('Done. I’ll remind you Thursday at 8 PM.', 700); todo(p, 'Pinecrest sign-ups open Friday 9 AM', 'Thu', 'From Sprout · summer camps'); p.set('Reminder Thursday night', { when:'Thu', done:true }); }
    else { await p.say('Okay. I won’t bring it up again.', 700); p.set('Not now', { done:true }); }
    return;
  }
  if (pick.i === 1) {   // K10 P·2 → P·3 / X·1
    await p.say('Here are all 6, closest first. Pinecrest and Barton Swim have families from her class.', 1000);
    const all = p.block(mapCard(`${pin(F + 'lakeside-art.jpg', 18, 20, 'Lakeside Art')}${pin(A + 'camp/creekside.webp', 30, 78, 'Creekside')}${pin(A + 'camp/pinecrest.webp', 55, 33, 'Pinecrest · my pick', true)}${pin(F + 'barton-swim.jpg', 70, 72, 'Barton Swim')}${pin(F + 'muddy-hands.jpg', 84, 30, 'Muddy Hands')}`,
      `<div class="camprow"><span class="thumb" style="background-image:url(${F}barton-swim.jpg)"></span><div><div class="ttl">Barton Swim Camp</div><div class="sub">June 7–11 · 1.5 mi · Swim</div>${facesHtml(CAMPS.barton)}<div class="cprice"><b>$310</b><small>/ week</small><span class="pill" style="margin-left:6px">6 spots left</span><button class="link" data-details="barton">Details <i class="ph ph-caret-right"></i></button></div></div></div>`));
    pick = await choose(all, ['Only where her class goes', 'Closer to home', 'Back to Pinecrest'], [null, null, 'pinecrest']);
    if (pick.i === 0 || pick.i === 1) {
      await p.say(pick.i === 0 ? 'Two camps have families from Maya’s class. Pinecrest has four, Barton Swim has one.' : 'Two are within 2 miles of home: Barton Swim at 1.5 mi and Pinecrest at 2 mi. Both have families from Maya’s class.', 1000);
      const two = p.block(mapCard(`${pin(A + 'camp/pinecrest.webp', 55, 33, 'Pinecrest · my pick', true)}${pin(F + 'barton-swim.jpg', 70, 72, 'Barton Swim')}`, campRow('pinecrest')));
      pick = await choose(two, ['Yes, Pinecrest', 'Yes, Barton Swim'], ['pinecrest', 'barton']);
    }
  }
  const k = pick.k || 'pinecrest';
  let weeks = null;
  while (!weeks) { weeks = await pickWeeks(k); if (!weeks) { await sleep(200); const r = await p.chips(['Choose weeks', 'Not now'], { echo:false }); if (r === 1) { p.me('Not now'); await p.say('Okay. I’ll keep the map here if you change your mind.', 700); return; } } }
  p.me(`Sign up for ${weeks.length} week${weeks.length > 1 ? 's' : ''}`); await sleep(300);
  const { c, sum, wk } = await campForm(p, k, weeks);
  const r = await approval(p, { sub:c.n, forHtml:`<i class="s">M</i>For Maya · ${wk} · 9 AM–3 PM`, lines:[[`${weeks.length} week${weeks.length > 1 ? 's' : ''} · ${weeks.map(w => w.split('–')[0]).join(' and ')}`, `$${sum}.00`]], total:`$${sum}.00`, wait:'Waiting for you or Dana · held until 9:11 AM', code:'PC-90215', time:'9:03 AM' });
  if (!r.ok) { await sleep(300); await p.say('No problem. Nothing was paid and Maya’s spot is released.', 900); p.set('Not registered', { done:true }); return; }
  await sleep(400); p.receipt(`Registered · Maya, ${c.short} ${wk}`);
  p.set(`Maya registered · ${wk}`, { when:'June', done:true });
  await sleep(300);
  // K10 P·12 – P·14: Jake too
  await p.say(`Maya’s in. Jake is 6, so ${c.short} fits him the same ${weeks.length > 1 ? 'two weeks' : 'week'}. I already have most of his form from soccer. Sign him up too?`, 1100);
  const j = await p.chips(['Yes, sign up Jake', 'Not now']);
  if (j === 1) { await p.say('Okay, just Maya. Jake’s forms stay saved, so adding him later takes one tap.', 900); return; }
  sub(p, 'Summer camps · Maya, Jake'); p.title = 'Summer camps · Maya and Jake';
  await p.say('I filled Jake’s form from his profile. Only one new question this time.', 900);
  const jc = p.block(`<div class="card">
    <div class="ctop"><span class="icotile"><i class="ph ph-clipboard-text"></i></span><div><div class="eyebrow">Jake's registration · <b class="cnt">6</b> of 7 ready</div><div class="ttl">${c.n} · ${weeks.length} week${weeks.length > 1 ? 's' : ''}</div></div></div>
    <div class="progress"><i style="width:${6 / 7 * 100}%"></i></div>
    <div class="fields">${[[{ l:'From Jake’s profile', v:'Shirt, birthday, emergency contact, medical notes' }, 'Soccer'], [{ l:'Pickup', v:'Dana Martin, Tony Martin' }, 'From Maya’s form'], [{ l:'Waiver and account', v:'Same as Maya' }, c.short]].map(([x, t]) => fieldRow(x, t)).join('')}</div>
    <div class="qwrap"></div></div>`).querySelector('.card');
  editHint(jc);
  const sw = ['Yes', 'Not yet'];
  const a = await ask(p, jc, `${c.short} asks swim level for campers under 7. Can Jake swim on his own?`, sw);
  addField(jc, { l:'Swims on his own', v:sw[a] }); jc.querySelector('.cnt').textContent = 7; jc.querySelector('.progress i').style.width = '100%'; jc.querySelector('.qwrap').innerHTML = '';
  await sleep(300);
  await p.say(`Saved to Jake’s profile. His form is complete. Approve $${sum} for Jake?`, 900);
  const r2 = await approval(p, { sub:c.n, forHtml:`<img class="s" src="${A}jake.webp" alt="">For Jake · ${wk} · 9 AM–3 PM`, lines:[[`${weeks.length} week${weeks.length > 1 ? 's' : ''} · ${weeks.map(w => w.split('–')[0]).join(' and ')}`, `$${sum}.00`]], total:`$${sum}.00`, wait:'Waiting for you or Dana · held until 9:11 AM', code:'PC-90231', time:'9:06 AM' });
  if (!r2.ok) { await p.say('Okay. Nothing was paid for Jake. Maya is still registered.', 800); return; }
  await sleep(400); p.receipt(`Registered · Jake, ${c.short} ${wk}`);
  p.set(`Both kids registered · ${wk}`, { when:'June', done:true });
  await p.say(`Both kids are in, same ${weeks.length > 1 ? 'two weeks' : 'week'}. ${c.short} emails packing lists in May. I’ll watch for them and add them to your to-dos.`, 1000);
  await p.chips(['Thanks']);
  // K10 P·15 – P·16, X·5, X·7
  await p.say('That’s 2 of their 10 summer weeks. Want me to line up camps for the open ones too?', 1000);
  const W10 = ['Jun 1', 'Jun 7', 'Jun 14', 'Jun 21', 'Jun 28', 'Jul 5', 'Jul 12', 'Jul 19', 'Jul 26', 'Aug 2'];
  const covered = weeks.map(w => 'Jun ' + w.match(/\d+/)[0]);
  p.block(`<div class="card"><div class="ctop"><span class="icotile"><i class="ph ph-calendar-blank"></i></span><div><div class="eyebrow">Maya and Jake · summer camps</div><div class="ttl">${covered.length} of 10 weeks covered</div></div></div>
    <div class="weeks">${W10.map(w => `<i class="${covered.includes(w) ? 'on' : ''}">${covered.includes(w) ? '<i class="ph-bold ph-check" style="font-size:12px"></i>&nbsp;' : ''}${w}</i>`).join('')}</div>
    <div class="foot">${c.short} ${wk} · ${10 - covered.length} weeks open</div></div>`);
  const m = await p.chips(['Same camp, more weeks', 'Fill July', 'Something different', 'We’re covered'], { stub:[2] });
  if (m === 3) { await p.say(`Got it. I’ll stop suggesting camps for this summer. Both kids’ June weeks are on the family calendar.`, 900); return; }
  let lines, total, label;
  if (m === 0) {
    await p.say(`${c.short} has room June 28 – July 2 and July 5–9. June 21–25 is full. Add both weeks for both kids?`, 1000);
    await p.chips(['Add both weeks']);
    total = 4 * c.price; lines = [['Maya · June 28 and July 5', `$${2 * c.price}.00`], ['Jake · June 28 and July 5', `$${2 * c.price}.00`]];
  } else {
    await p.say('One camp a week, close to home. Their forms are saved, so tap the weeks you want and I’ll book both kids.', 1000);
    const JUL = [['July 5–9', 'Barton Swim Camp · Leo goes', F + 'barton-swim.jpg', 310, true], ['July 12–16', 'Pinecrest, same as June', A + 'camp/pinecrest.webp', 420, true], ['July 19–23', 'Muddy Hands Clay Camp', F + 'muddy-hands.jpg', 380, false], ['July 26–30', 'Lakeside Art Camp · Ava goes', F + 'lakeside-art.jpg', 530, true]];
    const jcard = p.block(`<div class="card"><div class="ctop"><span class="icotile"><i class="ph ph-sun"></i></span><div><div class="eyebrow">July · both kids</div><div class="ttl">One camp a week</div></div></div>
      <div class="fields">${JUL.map(([d, s, img, pr, on], i) => `<button class="pick${on ? ' on' : ''}" data-i="${i}"><span class="av" style="width:40px;height:40px;border-radius:10px;background-image:url(${img})"></span><span class="ptx">${d}<small>${s} · $${pr}</small></span><span class="cb"><i class="ph-bold ph-check"></i></span></button>`).join('')}</div>
      <button class="btn"></button></div>`);
    let both = true; const rows = [...jcard.querySelectorAll('.pick')], bb = jcard.querySelector('.btn');
    const sel = () => rows.filter(r => r.classList.contains('on')).map(r => JUL[+r.dataset.i]);
    const paint = () => { const s2 = sel(), t2 = s2.reduce((a2, x) => a2 + x[3], 0) * (both ? 2 : 1); bb.disabled = !s2.length; bb.textContent = s2.length ? `Book ${s2.length} week${s2.length > 1 ? 's' : ''}${both ? ' for both' : ''} · $${t2.toLocaleString()}` : 'Pick a week'; };
    rows.forEach(r => r.onclick = () => { r.classList.toggle('on'); paint(); }); paint();
    p.chips(['Show other camps', 'Just Maya'], { into:jcard, stub:[0], echo:false }).then(() => { both = false; p.me('Just Maya'); paint(); });
    await new Promise(res => bb.onclick = res);
    const s2 = sel(); rows.forEach(r => r.style.pointerEvents = 'none'); bb.remove(); jcard.querySelector('.chips')?.remove();
    p.me(`Book ${s2.length} weeks${both ? ' for both' : ''}`);
    total = s2.reduce((a2, x) => a2 + x[3], 0) * (both ? 2 : 1);
    lines = s2.map(x => [`${x[0]} · ${x[1].split(' ·')[0]}${both ? ' × 2' : ''}`, `$${(x[3] * (both ? 2 : 1)).toLocaleString()}.00`]);
  }
  await sleep(300); await p.say(`Their forms are saved, so it’s just the payment. Approve $${total.toLocaleString()}?`, 900);
  const r3 = await approval(p, { sub:'Summer camps · July', forHtml:`<i class="s">M</i>For Maya${m === 0 || lines[0][0].includes('× 2') ? ' and Jake' : ''}`, lines, total:`$${total.toLocaleString()}.00`, code:'PC-90287', time:'9:08 AM' });
  if (!r3.ok) { await p.say('Okay. Nothing booked for July.', 600); return; }
  await sleep(400); p.receipt('Registered · July weeks');
  p.set('June and July covered', { when:'June', done:true });
  await p.say('Done. Everything is on the family calendar, and I’ll add each packing list to your to-dos.', 900);
};

/* ======================= After school + Tutoring (19 Nov, Register my kids tiles) =======================
   Same parts and rules as Camps: one setup card, Sprout checks, a short ranked list with my pick on top,
   the form filled from the kid's profile with only the new question asked, the Approve card, then the calendar.
   Programs and tutors are sample data (made-up names), not real providers. */
const KIDS2 = [{ n:'Maya', age:7, cls:'Miss Taylor’s class', img:A + 'maya.webp' }, { n:'Jake', age:5, cls:'Miss Poole’s class', img:A + 'jake.webp' }];
const WD = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
/* one card: which kid (one), plus chip groups; returns { kid, picks } */
function setupCard(p, { eyebrow, title, groups, label }){
  return new Promise(res => {
    let kid = KIDS2[0];
    const picks = groups.map(g => g.multi ? new Set(g.on) : g.on);
    const c = p.block(`<div class="card"><div class="ctop"><span class="icotile"><i class="ph ph-${groups.icon || 'student'}"></i></span><div><div class="eyebrow">${eyebrow}</div><div class="ttl">${title}</div></div></div>
      <div class="dlabel" style="margin-top:14px">For</div>
      <div class="ua-rows" role="radiogroup">${KIDS2.map(k => `<button type="button" class="ua-row${k === kid ? ' on' : ''}" data-kid="${k.n}" role="radio" aria-checked="${k === kid}"><span class="uaph" style="background-image:url(${k.img})"></span><span class="tx"><b>${k.n}</b><small>${k.age} · ${k.cls}</small></span><span class="ck"><i class="ph-bold ph-check"></i></span></button>`).join('')}</div>
      ${groups.map((g, gi) => `<div class="dlabel" style="margin-top:16px">${g.label}</div><div class="qk" data-g="${gi}">${g.opts.map((o, i) => `<button type="button" class="chip" data-i="${i}">${o}</button>`).join('')}</div>`).join('')}
      <button class="btn" style="margin-top:16px">${label}</button></div>`).querySelector('.card');
    const btn = c.querySelector('.btn');
    const paint = () => {
      c.querySelectorAll('[data-kid]').forEach(b => { const on = b.dataset.kid === kid.n; b.classList.toggle('on', on); b.setAttribute('aria-checked', on); });
      groups.forEach((g, gi) => c.querySelectorAll(`[data-g="${gi}"] .chip`).forEach(b => { const on = g.multi ? picks[gi].has(+b.dataset.i) : picks[gi] === +b.dataset.i; b.classList.toggle('sel', on); b.setAttribute('aria-pressed', on); }));
      btn.disabled = groups.some((g, gi) => g.multi && !picks[gi].size);
    };
    c.querySelectorAll('[data-kid]').forEach(b => b.onclick = () => { kid = KIDS2.find(k => k.n === b.dataset.kid); paint(); });
    groups.forEach((g, gi) => c.querySelectorAll(`[data-g="${gi}"] .chip`).forEach(b => b.onclick = () => {
      const i = +b.dataset.i;
      if (g.multi) { if (picks[gi].has(i)) picks[gi].delete(i); else picks[gi].add(i); } else picks[gi] = i;
      paint();
    }));
    btn.onclick = () => {
      c.querySelectorAll('button').forEach(b => b.style.pointerEvents = 'none'); btn.remove();
      const out = groups.map((g, gi) => g.multi ? [...picks[gi]].sort().map(i => g.opts[i]) : g.opts[picks[gi]]);
      p.me(`${kid.n} · ${out.map(x => Array.isArray(x) ? x.join(', ') : x).join(' · ')}`);
      res({ kid, picks:out });
    };
    paint(); p.scroll();
  });
}
/* a ranked list, my pick on top; one tap selects, the green button says what happens */
function optionsCard(p, { eyebrow, title, rows, cta }){
  return new Promise(res => {
    let pick = 0;
    const c = p.block(`<div class="card"><div class="ctop"><span class="icotile"><i class="ph ph-list-checks"></i></span><div><div class="eyebrow">${eyebrow}</div><div class="ttl">${title}</div></div></div>
      <div class="fields">${rows.map((r, i) => `<button class="pick kprog${i === pick ? ' on' : ''}" data-i="${i}" aria-pressed="${i === pick}"><span class="av" style="width:46px;height:46px;border-radius:${r.round ? 23 : 12}px;background:${r.round ? '' : 'var(--raised,#f6f3ec)'} center/${r.round ? 'cover' : '78%'} no-repeat url(${r.img})"></span>
        <span class="ptx"><span class="kp-n">${r.n}${i === 0 ? ' <em class="kp-pick">My pick</em>' : ''}</span><small>${r.line}</small><small class="kp-why">${r.why}</small></span><span class="cb rd"><i class="ph-bold ph-check"></i></span></button>`).join('')}</div>
      <button class="btn" style="margin-top:12px"></button>
      <div class="foot"><i class="ph ph-info"></i>Sample ${eyebrow.toLowerCase().includes('tutor') ? 'tutors' : 'programs'} for this prototype</div></div>`).querySelector('.card');
    const btn = c.querySelector('.btn'), all = [...c.querySelectorAll('.pick')];
    const paint = () => { all.forEach((b, i) => { b.classList.toggle('on', i === pick); b.setAttribute('aria-pressed', i === pick); }); btn.textContent = cta(rows[pick]); };
    all.forEach(b => b.onclick = () => { pick = +b.dataset.i; paint(); });
    btn.onclick = () => { all.forEach(b => b.style.pointerEvents = 'none'); btn.remove(); p.me(cta(rows[pick])); res(rows[pick]); };
    paint(); p.scroll();
  });
}
const AFTER = [
  { n:'Lincoln Kids Club', img:A + 'illus/afterschool.webp', tags:['Anything', 'Sports', 'Art'], price:95, unit:'week', pickup:'On campus, no pickup needed', why:'6 kids from her class go · homework hour first', key:'lkc' },
  { n:'Little Coders Lab', img:A + 'illus/tutoring.webp', tags:['STEM'], price:165, unit:'month', pickup:'Van pickup from Lincoln at 3:05', why:'Small groups of 6 · 2 kids from her class', key:'lcl' },
  { n:'Clay & Color Studio', img:A + 'illus/camps.webp', tags:['Art'], price:140, unit:'month', pickup:'Walking pickup with staff', why:'Ava goes on Wednesdays', key:'ccs' },
  { n:'Circle C Tumbling', img:A + 'illus/sports.webp', tags:['Sports'], price:120, unit:'month', pickup:'Van pickup from Lincoln at 3:10', why:'1.4 mi from home · Leo goes', key:'cct' },
];
X.flows.afterschool = async p => {
  await p.say('Happy to. After school runs 3 to 6 PM. Pick the kid, the days, and what they’d enjoy.', 900);
  const INTEREST = ['Anything', 'Sports', 'Art', 'STEM'];
  const { kid, picks:[days, interest] } = await setupCard(p, { eyebrow:'After school', title:'What are you looking for?', label:'Find programs',
    groups:[{ label:'Days', opts:WD, multi:true, on:[0, 2, 3] }, { label:'Into', opts:INTEREST, on:0 }] });
  sub(p, `After school · ${kid.n}`); p.title = `After school · ${kid.n}`; p.set('Checking programs', { when:'Now' });
  const w = p.work('Checking programs near Lincoln', `${days.join(', ')} · 3–6 PM · age ${kid.age}`);
  await sleep(1400);
  const ranked = [...AFTER].sort((a, b) => b.tags.includes(interest) - a.tags.includes(interest));
  w.done(`${ranked.length} with pickup from Lincoln`, 'Closest and most classmates first', 'ph-student');
  await p.say(`My pick is ${ranked[0].n}: ${ranked[0].why.split(' · ')[0].toLowerCase()}. Here are the others too.`, 900);
  const prog = await optionsCard(p, { eyebrow:`${kid.n} · ${days.join(', ')}`, title:'After-school programs', cta:r => `Sign ${kid.n} up for ${r.n}`,
    rows:ranked.map(r => ({ ...r, why:r.why.replace('her class', `${kid.n}’s class`), line:`${r.pickup} · $${r.price}/${r.unit}` })) });
  const her = kid.n === 'Jake' ? 'his' : 'her';
  await p.say(`I filled ${kid.n}’s form from ${her} profile. One new question from ${prog.n}.`, 900);
  const c = p.block(`<div class="card"><div class="ctop"><span class="icotile"><i class="ph ph-clipboard-text"></i></span><div><div class="eyebrow">${kid.n}’s form · <b class="cnt">5</b> of 6 ready</div><div class="ttl">${prog.n}</div></div></div>
    <div class="progress"><i style="width:${5 / 6 * 100}%"></i></div>
    <div class="fields">${[[{ l:`From ${her} profile`, v:'Birthday, allergies, emergency contacts' }, 'Camps'], [{ l:'Days', v:`${days.join(', ')} · 3–6 PM` }, 'You picked'], [{ l:'School pickup', v:prog.pickup }, prog.n]].map(([x, t]) => fieldRow(x, t)).join('')}</div>
    <div class="qwrap"></div></div>`).querySelector('.card');
  editHint(c);
  const WHO = ['Tony', 'Dana', 'Either of us'];
  const a = await ask(p, c, `Who picks ${kid.n} up at 6?`, WHO);
  addField(c, { l:'Pickup at 6 PM', v:WHO[a] }); c.querySelector('.cnt').textContent = 6; c.querySelector('.progress i').style.width = '100%'; c.querySelector('.qwrap').innerHTML = '';
  const weekly = prog.unit === 'week', first = weekly ? prog.price * 4 : prog.price;
  await p.say(`${her[0].toUpperCase() + her.slice(1)} form is complete. The first ${weekly ? '4 weeks' : 'month'} is $${first}. Approve it?`, 800);
  const r = await approval(p, { sub:prog.n, forHtml:`<img class="s" src="${kid.img}" alt="">For ${kid.n} · ${days.join(', ')} · 3–6 PM`,
    lines:[[weekly ? `4 weeks × $${prog.price}` : 'First month', `$${first}.00`]], total:`$${first}.00`, code:'AS-31407', time:'9:12 AM' });
  if (!r.ok) { await p.say(`No problem. Nothing was paid and ${kid.n}’s spot is released.`, 800); p.set('Not registered', { done:true }); return; }
  await sleep(400); p.receipt(`Registered · ${kid.n}, ${prog.n}`);
  p.block(`<div class="card"><div class="ctop"><span class="icotile"><i class="ph ph-calendar-check"></i></span><div><div class="eyebrow">Starts Mon, Aug 17</div><div class="ttl">${kid.n} at ${prog.n}</div></div></div>
    <div class="fact"><i class="ph ph-clock"></i>${days.join(', ')} · 3–6 PM</div>
    <div class="fact"><i class="ph ph-van"></i>${prog.pickup}</div>
    <div class="fact"><i class="ph ph-user"></i>${WHO[a]} ${a === 2 ? 'pick' : 'picks'} up at 6</div>
    <div class="fact"><i class="ph ph-calendar-check"></i>On the family calendar every week · Dana has it too</div>
    <div class="fact"><i class="ph ph-receipt"></i>I’ll ask before each ${weekly ? '4 weeks' : 'month'} is charged</div></div>`);
  p.set(`${kid.n} · ${prog.n} · ${days.join(', ')}`, { when:'Aug 17', done:true });
  await p.chips(['Thanks']);
};

const TUTORS = [
  { n:'Ms. Rivera', img:A + 'sitters/woman.webp', subj:['Reading'], line:'Reading specialist · $55/hr', why:'Tutors 3 kids at Lincoln · Priya recommends her', round:true },
  { n:'Mr. Chen', img:A + 'sitters/man.webp', subj:['Math'], line:'Former 2nd-grade teacher · $50/hr', why:'Online or at your home · 4.9 from 21 families', round:true },
  { n:'Sofia Alvarez', img:A + 'sitters/taylor.webp', subj:['Spanish', 'Reading'], line:'Bilingual tutor · $45/hr', why:'UT education student · Aisha’s kids see her', round:true },
];
X.flows.tutoring = async p => {
  await p.say('Sure. Pick the kid and what they need help with.', 800);
  const SUBJ = ['Reading', 'Math', 'Spanish'], WHERE = ['At our home', 'Online'], OFTEN = ['Once a week', 'Twice a week'];
  const { kid, picks:[subject, where, often] } = await setupCard(p, { eyebrow:'Tutoring', title:'What do they need help with?', label:'Find tutors',
    groups:[{ label:'Help with', opts:SUBJ, on:0 }, { label:'Where', opts:WHERE, on:0 }, { label:'How often', opts:OFTEN, on:0 }] });
  sub(p, `Tutoring · ${kid.n}`); p.title = `${subject} tutor · ${kid.n}`; p.set('Checking tutors', { when:'Now' });
  const w = p.work(`Checking ${subject.toLowerCase()} tutors`, `${where} · ${often.toLowerCase()} · age ${kid.age}`);
  await sleep(1400);
  const ranked = [...TUTORS].sort((a, b) => b.subj.includes(subject) - a.subj.includes(subject));
  w.done(`${ranked.length} tutors near Lincoln`, 'Recommended by class parents first', 'ph-chalkboard-teacher');
  await p.say(`My pick is ${ranked[0].n}. Most tutors start with a free 15-minute call, so I’ll set that up first.`, 900);
  const t = await optionsCard(p, { eyebrow:`${subject} · ${kid.n}`, title:'Tutors', cta:r => `Book a call with ${r.n}`, rows:ranked });
  await p.say(`When works for a quick call with ${t.n}?`, 600);
  const SLOTS = ['Tue 4:00 PM', 'Wed 5:30 PM', 'Thu 4:30 PM'];
  const slot = SLOTS[await p.chips(SLOTS)];
  const st = `Asking ${t.n}`;
  p.set(st, { when:slot.split(' ')[0] });
  await later(p, { status:st, small:`Intro call · ${slot}`, ms:2600, title:`${t.n} confirmed the call`, body:`${slot} · 15 minutes · free` });
  p.note(`Intro call with ${t.n}`, `${slot} · on your calendar · Sprout sends the link`, 'ph-phone');
  p.divider(`${slot.split(' ')[0]} · after the call`);
  await p.say(`How did the call with ${t.n} go? If it was good, I’ll book ${often.toLowerCase()} lessons.`, 900);
  const g = await p.chips([`Book ${t.n}`, 'Try someone else']);
  if (g === 1) { await p.say('Okay. I’ll set up a call with the next tutor on the list.', 700); p.set('Trying another tutor', { done:true }); return; }
  const n = often === 'Twice a week' ? 8 : 4, rate = parseInt(t.line.match(/\$(\d+)/)[1]), total = n * rate;
  const FULL = { Mon:'Mondays', Tue:'Tuesdays', Wed:'Wednesdays', Thu:'Thursdays' }, d1 = slot.split(' ')[0], at = slot.split(' ').slice(1).join(' ');
  const lessonDays = n === 8 ? `${FULL[d1]} and ${FULL[d1 === 'Mon' ? 'Thu' : 'Mon']}` : FULL[d1];
  await p.say(`${t.n} has ${lessonDays} at ${at} open. The first ${n} lessons are $${total}. Approve it?`, 900);
  const r = await approval(p, { sub:`${t.n} · ${subject}`, forHtml:`<img class="s" src="${kid.img}" alt="">For ${kid.n} · ${where.toLowerCase()} · ${often.toLowerCase()}`,
    lines:[[`${n} lessons × $${rate}`, `$${total}.00`]], total:`$${total}.00`, code:'TU-55120', time:'5:52 PM' });
  if (!r.ok) { await p.say(`Okay. Nothing was paid. ${t.n} knows you’ll decide later.`, 800); p.set('Not booked', { done:true }); return; }
  await sleep(400); p.receipt(`Booked · ${t.n}, ${n} lessons`);
  p.block(`<div class="card"><div class="ctop"><span class="uaph" style="width:44px;height:44px;background-image:url(${t.img})"></span><div><div class="eyebrow">${subject} · ${kid.n}</div><div class="ttl">Lessons with ${t.n}</div></div></div>
    <div class="fact"><i class="ph ph-clock"></i>${lessonDays} at ${at} · 1 hour</div>
    <div class="fact"><i class="ph ph-map-pin"></i>${where === 'Online' ? 'Online · Sprout sends the link before each lesson' : '10212 Banks Court, Austin'}</div>
    <div class="fact"><i class="ph ph-calendar-check"></i>On the family calendar · Dana has it too</div>
    <div class="fact"><i class="ph ph-note-pencil"></i>${t.n}’s notes after each lesson come to you here</div></div>`);
  p.set(`${kid.n} · ${subject} with ${t.n}`, { when:slot.split(' ')[0], done:true });
  await p.chips(['Thanks']);
};

/* ======================= Sitters · A8 (A: your sitters, B: class families) ======================= */
const SITTERS = [{ n:'Alex', by:'Saved by you', rate:25 }, { n:'Sam', by:'Saved by Dana', rate:28 }, { n:'Riley', by:'Saved by you', rate:24 }];
const AVAIL = (time = '6–10 PM') => `Hi! Are you available to watch Maya (7) and Jake (5) on Sat, Aug 1, ${time}? Please let us know your rate. We’ll confirm with one sitter after hearing back.`;
async function evening(p){
  await p.say('Of course. For Saturday, August 1, what time will you be home?', 900);
  await p.chips(['10 PM', 'Change the date or time'], { stub:[1] });
  await p.say('Here’s the evening. I’ll ask your saved sitters separately, all at once.', 900);
  const card = p.block(`<div class="card">
    <div class="ctop"><span class="icotile"><i class="ph ph-moon-stars"></i></span><div><div class="eyebrow">Sitter request</div><div class="ttl">Saturday, August 1</div></div></div>
    <div class="fields">${[{ l:'When', v:'Sat, Aug 1 · 6–10 PM' }, { l:'Children', v:'Maya, 7 · Jake, 5' }, { l:'Where', v:'Our home · address shared after booking' }].map(f => fieldRow(f)).join('')}</div>
    <div class="qwrap"></div></div>`).querySelector('.card');
  editHint(card);
  await ask(p, card, 'Does the evening look right?', ['Looks right', 'Change details'], { 1:'Tap a pencil to change a row (not part of this demo)' });
  card.querySelector('.qwrap').innerHTML = '';
}
async function booked(p, name, rate, others){
  await p.say(`I asked ${name} to confirm the booking. ${others.length ? `${joinNames(others)} ${others.length > 1 ? 'have' : 'has'} not been booked. ` : ''}I’ll close the other requests once ${name} accepts.`, 1000);
  p.set(`Waiting for ${name} to confirm`, { when:'Sat' });
  await later(p, { status:`${name} · confirmation requested`, small:'Sat, Aug 1 · 6–10 PM', ms:3000, title:`${name} confirmed`, body:'Saturday, Aug 1 · 6–10 PM' });
  p.note(`${name} · confirmed`, `Aug 1 · 6–10 PM · estimated $${rate * 4}`, 'ph-calendar-check');
  await p.say(`${name} confirmed. ${others.length ? `I let ${joinNames(others)} know the evening is covered. ` : ''}You’ll arrange payment directly with ${name}.`, 1000);
  p.set(`${name} · Sat 6–10 PM`, { when:'Sat', done:true });
  for (;;) {
    const c = await p.chips(['Add to calendar', 'Cancel booking']);
    if (c === 0) { p.note(`${name} babysitting`, 'Saturday, Aug 1 · 6–10 PM', 'ph-calendar-check'); await p.say('Added to your family calendar. Dana can see it too.', 800); return; }
    await p.say(`I’ll ask ${name} to acknowledge the cancellation. Any cancellation fee must be agreed directly with ${name}.`, 900);
    const k = await p.chips(['Request cancellation', 'Keep booking']);
    if (k === 1) continue;
    await later(p, { status:`Waiting for ${name}`, small:'Cancellation requested', ms:2600, title:`${name} acknowledged`, body:'The booking is cancelled' });
    p.note('Booking cancelled', `Acknowledged by ${name}`, 'ph-x-circle');
    await p.say(`${name} acknowledged the cancellation. I removed the calendar event. Any fee is handled directly with ${name}.`, 900);
    p.set('Booking cancelled', { done:true });
    const f = await p.chips(['Find another sitter']); X.start('ownSitters'); return;
  }
}
async function classFamilies(p){
  sub(p, 'Sitter · Sat, Aug 1');
  await p.say('I can post this in Jake’s class chat. No home address or sitter phone numbers are included.', 1000);
  const m = p.block(`<div class="card">${preview('Does anyone have a sitter they recommend for Saturday, Aug 1, 6–10 PM? We need care for two kids, ages 7 and 5. An introduction would be lovely.')}</div>`);
  if (await p.chips(['Send to class chat', 'Not now'], { into:m }) === 1) { await p.say('Okay. Nothing was posted.', 600); p.set('Not posted', { done:true }); return; }
  const w = p.work('Posting in Jake’s class chat', 'Miss Poole’s class'); await sleep(1200);
  w.done('Jake’s class', 'Request posted · waiting for families', 'ph-chat-circle-text');
  await p.say('Posted in Jake’s class chat. I’ll bring any recommendations here.', 800);
  await later(p, { status:'Waiting for families', small:'Miss Poole’s class', ms:4000, title:'A family recommends a sitter', body:'Open Assist to see the introduction' });
  await p.say('A family in Jake’s class recommends Taylor and has offered to introduce you. Would you like me to ask them to check Taylor is happy to connect?', 1100);
  p.set('Ask for an introduction?', { when:'Sat' });
  if (await p.chips(['Ask for an introduction', 'Keep looking']) === 1) { await p.say('No new introductions yet. Your class request is still open.', 800); return; }
  await later(p, { status:'Asking the family', small:'They’ll check with Taylor first', ms:2600, title:'Taylor agreed to connect', body:'Review a message to Taylor' });
  p.note('Taylor · introduction accepted', 'Contact shared with permission', 'ph-handshake');
  await p.say('The family checked with Taylor, who agreed to be contacted. Would you like to review an availability message? This is a family recommendation, not a Sprout vetting.', 1100);
  if (await p.chips(['Review message', 'Not now']) === 1) { await p.say('Okay. Taylor’s contact is saved here for when you’re ready.', 700); return; }
  await p.say('Send this to Taylor? Your home address stays private.', 800);
  const t = p.block(`<div class="card">${preview(AVAIL())}</div>`);
  await p.chips(['Send to Taylor', 'Edit message'], { into:t, stub:[1] });
  p.note('Taylor', 'Availability message delivered', 'ph-chat-circle-text');
  await p.say('I asked Taylor about availability and rate. You can meet or speak before deciding.', 900);
  await later(p, { status:'Waiting for Taylor', small:'Sat, Aug 1 · 6–10 PM', ms:3500, title:'Taylor replied', body:'Available at $26/hour' });
  await p.say('Taylor is available at $26/hour. You haven’t used Taylor before. Arrange a conversation before confirming care.', 1000);
  if (await p.chips(['Arrange a conversation', 'Keep looking']) === 1) { await p.say('Okay. I’ll keep the class request open.', 700); return; }
  p.note('Conversation requested', 'You decide whether to book after meeting', 'ph-phone');
  await p.say('I asked Taylor to suggest a time to talk. No booking has been made. I’ll notify you when Taylor responds.', 1000);
  await p.chips(['We spoke. Review booking']);
  for (;;) {
    await p.say('Taylor is available. Check the details before I ask Taylor to confirm.', 900);
    if (await confirmSitter(p, { name:'Taylor', rate:26 })) break;
  }
  p.note('Taylor saved to your sitters', 'Next time I can ask Taylor directly', 'ph-address-book');
  await booked(p, 'Taylor', 26, []);
}

X.flows.ownSitters = async p => {
  await evening(p);
  await sleep(300);
  await p.say('Ask Alex, Sam and Riley? Each gets a separate message, so their numbers stay private.', 1000);
  const c = p.block(`<div class="card">
    <div class="ctop"><span class="icotile"><i class="ph ph-address-book"></i></span><div><div class="eyebrow">Your saved sitters · pick any</div><div class="ttl">Who should I ask?</div></div></div>
    <div class="fields">${SITTERS.map(s => `<button class="pick on" data-n="${s.n}">${mono(s.n)}<span class="ptx">${s.n}<small>${s.by}</small></span><span class="cb"><i class="ph-bold ph-check"></i></span></button>`).join('')}</div>
    <button class="btn">Ask Alex, Sam and Riley</button></div>`);
  const btn = c.querySelector('.btn'), picks = [...c.querySelectorAll('.pick')];
  const names = () => picks.filter(x => x.classList.contains('on')).map(x => x.dataset.n);
  picks.forEach(x => x.onclick = () => { x.classList.toggle('on'); const n = names(); btn.disabled = !n.length; btn.textContent = n.length ? 'Ask ' + joinNames(n) : 'Pick at least one sitter'; });
  const res = await new Promise(r => { btn.onclick = () => r(names()); p.chips(['Add a sitter', 'I don’t have sitters'], { into:c, stub:[0], echo:false }).then(() => r(null)); });
  picks.forEach(x => x.style.pointerEvents = 'none'); btn.remove(); c.querySelector('.chips')?.remove();
  if (!res) { p.me('I don’t have sitters'); await sleep(300); await p.say('You can add someone you know, or ask Jake’s class for a sitter recommendation.', 900); if (await p.chips(['Ask class families', 'Add a sitter'], { stub:[1] }) === 0) return classFamilies(p); return; }
  const asked = res;
  p.me('Ask ' + joinNames(asked)); await sleep(300);
  await p.say(`Ready to send this separately to ${joinNames(asked)}?`, 800);
  const m = p.block(`<div class="card">${preview(AVAIL())}</div>`);
  await p.chips([`Send to ${asked.length > 1 ? asked.length + ' sitters' : asked[0]}`, 'Edit message'], { into:m, stub:[1] });
  p.note(joinNames(asked), `${asked.length} individual message${asked.length > 1 ? 's' : ''} delivered`, 'ph-chat-circle-text');
  await p.say(`Sent to ${asked.length > 1 ? 'all ' + asked.length : asked[0]}. You can close Sprout. I’ll notify you when someone replies; I won’t book anyone without your OK.`, 1000);
  const yes = asked.filter(n => n !== 'Riley');
  await later(p, { status:'Waiting for replies', small:'Sat, Aug 1 · 6–10 PM', ms:4500, title: yes.length > 1 ? `${yes.length === 2 ? 'Two' : 'Some'} sitters are available` : yes.length ? `${yes[0]} is available` : 'Your sitters replied', body: yes.length ? `${joinNames(yes)} replied. Choose who to confirm with.` : 'Open Assist to see their replies' });
  if (!yes.length) {
    await p.say('Riley can’t make it. Would you like to ask families in Jake’s class for an introduction?', 900);
    if (await p.chips(['Ask class families', 'Change time'], { stub:[1] }) === 0) return classFamilies(p); return;
  }
  for (;;) {
    await p.say(`${joinNames(yes)} ${yes.length > 1 ? 'can both' : 'can'} do 6–10 PM. Who would you like to confirm with?`, 1000);
    p.block(`<div class="card"><div class="fields" style="margin-top:0">${asked.map(n => { const s = SITTERS.find(x => x.n === n), ok = yes.includes(n);
      return `<div class="field">${mono(n)}<div style="margin-left:10px"><div class="v" style="margin:0">${n} · ${ok ? 'available' : 'no reply yet'}</div><div class="fs">${ok ? `$${s.rate}/hour · replied ${n === 'Alex' ? 'just now' : '2 min ago'}` : 'I’ll tell you if Riley answers'}</div></div></div>`; }).join('')}</div></div>`);
    p.set('Choose a sitter', { when:'Sat' });
    const i = await p.chips(yes.map(n => 'Choose ' + n).concat('Keep waiting'));
    if (i === yes.length) { await p.say('No new replies yet. I can keep waiting or ask class families for a recommendation. I won’t contact a new sitter without your review.', 1000); const w = await p.chips(['Keep waiting', 'Ask class families']); if (w === 1) return classFamilies(p); continue; }
    const who = SITTERS.find(s => s.n === yes[i]);
    await p.say(`${who.n} is available. Check the details before I ask ${who.n} to confirm.`, 900);
    if (await confirmSitter(p, { name:who.n, rate:who.rate })) { await booked(p, who.n, who.rate, asked.filter(n => n !== who.n)); return; }
  }
};

X.flows.classSitters = async p => { await evening(p); await sleep(300); await classFamilies(p); };

/* night out: no Figma frames yet (A8 has none). Sitter steps reuse A8; dinner uses the same parts. */
X.flows.nightOut = async p => {
  await evening(p);
  await sleep(300);
  await p.say('A night for you two. Alex is the sitter you book most. Ask Alex first, or all your saved sitters at once?', 1000);
  const i = await p.chips(['Ask Alex', 'Ask Alex, Sam and Riley']);
  p.note(i ? 'Alex, Sam and Riley' : 'Alex', `${i ? '3 individual messages' : 'Message'} delivered`, 'ph-chat-circle-text');
  await sleep(300);
  await p.say('While Alex answers, here are three places near home with a table for two at 7:', 1100);
  const PLACES = [{ n:'Odd Duck', s:'New American · 2.1 mi · $$$' }, { n:'Suerte', s:'Mexican · 3.4 mi · $$' }, { n:'Uchiko', s:'Japanese · 4.0 mi · $$$$' }];
  const c = p.block(`<div class="card">
    <div class="ctop"><span class="icotile"><i class="ph ph-fork-knife"></i></span><div><div class="eyebrow">Dinner · Sat, Aug 1 · 7:00 PM · 2 people</div><div class="ttl">Tables open at 7</div></div></div>
    <div class="fields">${PLACES.map(x => `<div class="field"><div><div class="v" style="margin:0">${x.n}</div><div class="fs">${x.s}</div></div></div>`).join('')}</div>
    <div class="foot">Sample places · no real reservation</div></div>`);
  p.set('Pick a place for dinner', { when:'Sat' });
  const k = await p.chips(PLACES.map(x => 'Book ' + x.n), { into:c });
  const place = PLACES[k];
  const w = p.work(`Booking ${place.n}`, 'Sat, Aug 1 · 7:00 PM · 2 people'); await sleep(1400);
  w.done(`Table booked · ${place.n}`, 'Sat, Aug 1 · 7:00 PM · 2 people', 'ph-fork-knife');
  await later(p, { status:'Waiting for Alex', small:'Sat, Aug 1 · 6–10 PM', ms:3500, title:'Alex is available', body:'Confirm Alex for your night out' });
  await p.say('Alex can do 6–10 PM at $25/hour. Check the details before I ask Alex to confirm.', 1000);
  for (;;) { if (await confirmSitter(p, { name:'Alex', rate:25 })) break; await p.say('Okay. Alex is still holding the evening for you.', 600); }
  await later(p, { status:'Alex · confirmation requested', small:'Sat, Aug 1 · 6–10 PM', ms:2600, title:'Alex confirmed', body:'Your night out is set' });
  await p.say('Your night is set. Both are on the family calendar, so Dana has it too. You’ll arrange payment directly with Alex.', 1000);
  p.block(`<div class="card"><div class="ctop"><span class="icotile"><i class="ph ph-moon-stars"></i></span><div><div class="eyebrow">Night out · Sat, Aug 1</div><div class="ttl">Your evening</div></div></div>
    <hr><div class="fact"><i class="ph ph-baby"></i>Alex · 6–10 PM · estimated $100</div><div class="fact"><i class="ph ph-fork-knife"></i>${place.n} · 7:00 PM · table for 2</div></div>`);
  p.set(`${place.n} 7 PM · Alex 6–10`, { when:'Sat', done:true });
  const d = await p.chips(['Thanks', 'Text Dana the plan']);
  await p.say(d === 0 ? 'Have a lovely night.' : 'Sent Dana the plan from you.', 700);
};

/* ======================= Plan an event · K4 row F ======================= */
/* L6 (Tony, 19 Nov): nine birthday covers, not three ("70% are gonna choose just one image"). 4–9 are Figma AI,
   scratch file H5GZYtSTT9TOR8qc5ieuV7 nodes 6:2–6:7, made 19 Nov to match 1–3. */
const COVERS = { bday:[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => F + `bday-cover-${n}.jpg`), club:[F + 'club-cover-1.jpg', F + 'club-cover-2.jpg', F + 'club-cover-3.jpg'] };
const CLASS_COVERS = [COVERS.bday[2], COVERS.club[2]];
/* K4 F·6/F·7, G·6/G·7: pick a cover. L6 (Tony, 19 Nov): birthdays get nine tiles, eight covers plus one
   "Make one with AI" tile ("one of those options be generate an image with AI"). The demo shows a sample result;
   the real app sends the description to the image model. Clubs and class events keep their three. */
function coverCard(p, { eyebrow, title, set, current }){
  return new Promise(res => {
    const withAI = set.length > 3 && !set.includes(current);
    if (withAI) set = set.slice(0, 8);
    let pick = set.indexOf(current);
    const editing = pick !== -1;
    const c = p.block(`<div class="card"><div class="ctop"><span class="icotile"><i class="ph ph-camera"></i></span><div><div class="eyebrow">${eyebrow}</div><div class="ttl">${title}</div></div></div>
      <div class="covers">${set.map((u, i) => `<button data-i="${i}" class="${i === pick ? 'on' : ''}" aria-pressed="${i === pick}" style="background-image:url(${u})" aria-label="Cover ${i + 1}"></button>`).join('')}${withAI ? '<button class="aitile" data-ai aria-label="Make a cover with AI"><i class="ph ph-sparkle"></i><span>Make one<br>with AI</span></button>' : ''}</div>
      ${editing ? '' : '<button class="btn ghost" data-up style="margin-top:10px"><i class="ph ph-image"></i>&nbsp;Upload a photo</button>'}
      <button class="btn" data-go style="margin-top:8px"${editing ? '' : ' disabled'}>${editing ? 'Use this cover' : 'Pick a cover'}</button></div>`).querySelector('.card');
    const go = c.querySelector('[data-go]'), upload = c.querySelector('[data-up]'), ai = c.querySelector('[data-ai]');
    if (upload) upload.onclick = () => toast('Uploading is not part of this demo');
    const grid = c.querySelector('.covers');
    const bind = b => b.onclick = () => {
      pick = +b.dataset.i;
      grid.querySelectorAll('button').forEach(choice => {
        choice.classList.toggle('on', choice === b);
        choice.setAttribute('aria-pressed', choice === b);
      });
      go.disabled = false; go.textContent = 'Use this cover';
    };
    grid.querySelectorAll('button[data-i]').forEach(bind);
    if (ai) ai.onclick = async () => {
      const v = await new Promise(r => { const s = bsheet({ onBack:() => r(null), body:`<div class="bh"><span class="icotile"><i class="ph ph-sparkle"></i></span><b>Describe the cover</b></div>
          <textarea class="edt" rows="3">${title.replace(/’s .*/, '')} loves dinosaurs and the color green</textarea><p class="hint2">Sprout makes one cover from this. Demo: shows a sample result.</p>`,
        foot:'<button type="button" class="btn" data-go>Make my cover</button>' });
        s.foot.querySelector('[data-go]').onclick = () => { const t = s.body.querySelector('textarea').value.trim(); s.close(); r(t || null); }; });
      if (!v) return;
      ai.onclick = null; ai.classList.add('busy'); ai.innerHTML = '<span class="spinner"></span><span>Making it…</span>';
      await sleep(1800);
      set = [...set, A + 'figma/bday-cover-9.jpg'];
      ai.className = 'ai'; ai.dataset.i = set.length - 1; ai.removeAttribute('data-ai'); ai.setAttribute('aria-label', 'Your AI cover');
      ai.style.backgroundImage = `url(${set[set.length - 1]})`; ai.innerHTML = '<em>AI</em>';
      bind(ai); ai.click();
    };
    go.onclick = () => { if (pick < 0) return; c.querySelectorAll('.covers button').forEach(x => x.style.pointerEvents = 'none'); upload?.remove(); go.remove(); p.me('Use this cover'); res(set[pick]); };
  });
}

X.flows.event = async (p, opt = {}) => {
  let kind = opt.kind ?? 0;
  if (!opt.birthday && opt.kind == null) {
    await p.say('Fun. What are we planning? I’ll handle the invite and the RSVPs.', 900);
    kind = await p.chips(['Birthday party', 'Playdate', 'Class event', 'Something else'], { stub:[3] });
  }
  if (kind === 1) return X.flows.playdate(p);
  if (kind === 2) return X.flows.classEvent(p, { covers:CLASS_COVERS, coverCard });
  return X.flows.birthday(p, { covers:COVERS.bday, coverCard });
};
/* L1 (19 Nov): Birthday is its own tile on the home, so it skips "What are we planning?" */
X.flows.party = p => X.flows.event(p, { birthday:true });
/* ======================= Start a club · K4 row G ======================= */
X.flows.club = async p => {
  await p.say('Love it. What’s the club about? Tell me in a sentence and I’ll set up the rest.', 900);
  await p.chips(['Kids’ sports', 'Books', 'Outdoors', 'Something else'], { stub:[1, 2, 3], echo:false });
  await p.draft('A club for Lincoln families whose kids play soccer. Game times, carpools and gear swaps.');
  await sleep(300);
  sub(p, 'New club · name');
  await p.say('Nice. Here are a few names. Pick one, or type your own.', 800);
  const NAMES = ['Lincoln Soccer Families', 'Lincoln Kickers', 'Soccer at Lincoln'];
  const name = NAMES[await p.chips(NAMES)];
  p.title = name; X.renderHome();
  sub(p, 'New club · who can join');
  await p.say('Who can find it and join?', 600);
  const open = await p.chips(['Anyone at Lincoln', 'Only people I invite']) === 0;
  sub(p, 'New club · cover');
  await p.say('Last thing, the cover. Every club has one. Tap the one you like, or upload a photo.', 900);
  const cover = await coverCard(p, { eyebrow:'Club cover', title:name, set:COVERS.club });
  sub(p, 'Ready to create · 1 club');
  await p.say('Here’s your club. Check it over, then I’ll create it.', 800);
  await p.card({ cover, icon:'ph-users', eyebrow:'Club', title:name, rows:[['ph-graduation-cap', 'Lincoln Elementary · Austin, Texas'], ['ph-globe-simple', open ? 'Anyone at Lincoln can find and join' : 'Only people you invite can join'], ['ph-tag', 'Soccer · Carpools · Gear swap · Game days'], ['ph-text-align-left', 'For Lincoln families whose kids play soccer. Game times, carpools and gear.']], left:'Edit', right:'Create club', leftStub:'Editing is not part of this demo' });
  sub(p, 'Done · club created');
  p.receipt(`${name} is live in Clubs`);
  p.set('Live in Clubs', { when:'Today' });
  await p.say('It’s live, and you’re the admin. Want me to share it with Jake’s class?', 900);
  for (;;) {
    const s = await p.chips(['Share in Jake’s class chat', 'Copy link', 'Not now'], { echo:false });
    if (s === 1) { toast('Link copied'); continue; }
    if (s === 2) { p.me('Not now'); X.closeSheet(); p.set('Live in Clubs', { done:true }); return; }
    p.me('Share in Jake’s class chat'); break;
  }
  sub(p, 'Done · shared');
  p.receipt('Shared in Miss Poole’s class chat · 22 families');
  await p.say('Shared. Families can join from the chat or from Clubs. I’ll tell you as they do.', 900);
  if (await p.chips(['Done']) === 0) X.closeSheet();
  await later(p, { status:'Watching for new members', small:name, ms:4500, title:'6 families joined', body:`${name} · two asked about a Saturday carpool` });
  sub(p, '6 families joined');
  p.divider('Friday · 4:00 PM');
  await p.say(`6 families joined ${name} this week. Two of them asked about a Saturday carpool.`, 1000);
  p.set('6 families joined', { when:'Fri', done:true });
  await p.chips(['Open the club', 'Done'], { stub:[0] }).then(i => i === 1 && X.closeSheet());
};

/* ======================= review links + deep links ======================= */
/* L2 (Tony, 19 Nov: "what's the point of all these links?"): every link starts its flow from the beginning */
const LINKS = [['/assist/', 'Sprout Assist home'], ['/playdate/', 'Playdate'], ['/book-a-sitter-saved/', 'Book a sitter'],
  ['/plan-a-date-night/', 'Date night'], ['/birthdays/', 'Birthday'], ['/sports/', 'Sports · SSC Kids'], ['/after-school/', 'After school'], ['/summer-camps/', 'Camps'], ['/tutoring/', 'Tutoring'],
  ['/assist-ongoing/', 'Pick up where you left off'], ['/pay-todo/', 'Sitter is done: rate and pay'],
  ['/sitter-class-chat/', 'Share sitters (Priya’s phone)'], ['/sitter-profile/?s=thread', 'Sitter profile (sitter’s phone)'], ['/review/', 'All flows on one page']];
const route = location.pathname.split('/').filter(Boolean)[0] || '';
const review = new URLSearchParams(location.search).get('review');
$('#deskLinks').innerHTML = LINKS.map(([h, t]) => `<li><a href="${h}"${('/' + route + '/').replace('//', '/') === h ? ' aria-current="page"' : ''}>${t}</a></li>`).join('');
const ROUTE = {
  assist: () => { X.showHome(); X.openSheet(); },
  sports: () => X.start('sports', { echo:'Sports leagues' }), 'summer-camps': () => X.start('camps', { echo:'Summer camps' }),
  'after-school': () => X.start('afterschool', { echo:'Find an after-school program' }), tutoring: () => X.start('tutoring', { echo:'Find a tutor' }),
  'own-sitters': () => X.start('ownSitters', { echo:'Ask my sitters' }), 'class-families': () => X.start('classSitters', { echo:'Class-family sitters' }), 'night-out': () => X.start('nightOut', { echo:'Plan a night out' }),
  birthdays: () => X.start('party', { echo:'Plan a birthday party' }),
  'create-event': () => X.start('event', review === 'class-event' ? { echo:'Class event', kind:2 } : { echo:'Plan an event' }),
  playdate: () => X.start('playdate', { echo:'Plan a playdate' }),
  'playdate-new-time': () => X.start('playdate', { echo:'Plan a playdate' }), 'playdate-cant': () => X.start('playdate', { echo:'Plan a playdate' }),
  'create-club': () => X.start('club', { echo:'Start a club' }),
  'birthday-invite': () => X.flows.birthdayInvite(COVERS.bday),
  'accounts-payments': () => { X.showHome(); X.openSheet(); setTimeout(X.openWallet, 500); },
};
if (ROUTE[route]) setTimeout(ROUTE[route], 500);
})();
