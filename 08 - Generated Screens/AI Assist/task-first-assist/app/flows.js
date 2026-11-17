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
const COVERS = { bday:[F + 'bday-cover-1.jpg', F + 'bday-cover-2.jpg', F + 'bday-cover-3.jpg'], club:[F + 'club-cover-1.jpg', F + 'club-cover-2.jpg', F + 'club-cover-3.jpg'] };
/* K4 F·6/F·7, G·6/G·7: pick one of three covers; buttons change once one is picked */
function coverCard(p, { eyebrow, title, set }){
  return new Promise(res => {
    const c = p.block(`<div class="card"><div class="ctop"><span class="icotile"><i class="ph ph-camera"></i></span><div><div class="eyebrow">${eyebrow}</div><div class="ttl">${title}</div></div></div>
      <div class="covers">${set.map((u, i) => `<button data-i="${i}" style="background-image:url(${u})" aria-label="Cover ${i + 1}"></button>`).join('')}</div>
      <div class="two"><button class="btn ghost" data-up>Upload a photo</button><button class="btn ghost" data-go>Make 3 more</button></div></div>`).querySelector('.card');
    let pick = -1; const go = c.querySelector('[data-go]');
    c.querySelector('[data-up]').onclick = () => toast('Uploading is not part of this demo');
    c.querySelectorAll('.covers button').forEach(b => b.onclick = () => { pick = +b.dataset.i; c.querySelectorAll('.covers button').forEach(x => x.classList.toggle('on', x === b)); go.className = 'btn'; go.textContent = 'Use this cover'; });
    go.onclick = () => { if (pick < 0) return toast('Making more covers is not part of this demo'); c.querySelectorAll('.covers button').forEach(x => x.style.pointerEvents = 'none'); c.querySelector('.two').remove(); p.me('Use this cover'); res(set[pick]); };
  });
}
X.flows.event = async (p, opt = {}) => {
  let kind = 0;
  if (!opt.birthday) {
    await p.say('Fun. What are we planning? I’ll handle the invite and the RSVPs.', 900);
    kind = await p.chips(['Birthday party', 'Playdate', 'Class event', 'Something else'], { stub:[2, 3] });
  }
  if (kind === 1) return playdate(p);
  sub(p, 'Birthday party'); p.title = 'Maya’s 8th birthday party'; X.renderHome();
  await p.say('Love it. Whose birthday is it, when and where? Tell me who to invite too.', 900);
  await p.draft('Maya’s 8th birthday, this Saturday 2 to 4 at Zilker Park. Invite her class.');
  await sleep(300);
  await p.say('Got it. First, the cover. Every invite has one, so I’m making three for you to pick from.', 1000);
  const w = p.work('Making 3 covers', 'From Maya’s party details'); await sleep(2500);
  w.done('Made 3 covers', 'From Maya’s party details');
  sub(p, 'Maya’s birthday · cover');
  await p.say('Here they are. Tap the one you like, or upload your own photo.', 800);
  const cover = await coverCard(p, { eyebrow:'Cover', title:'Maya’s 8th birthday party', set:COVERS.bday });
  sub(p, 'Maya’s birthday · details');
  await p.say('Great pick. Now the details. I filled them in from your message, so check them over.', 1000);
  const ROWS = [['ph-calendar-blank', 'Sat, Aug 1 · 2:00 – 4:00 PM'], ['ph-map-pin', 'Zilker Park, Austin'], ['ph-users', 'Miss Taylor’s class · 22 families'], ['ph-calendar-check', 'RSVPs by Thu, Jul 30']];
  await p.card({ icon:'ph-calendar-blank', eyebrow:'Event details', title:'Maya’s 8th birthday party', rows:ROWS.concat([['ph-text-align-left', 'Cake, games and a piñata. Siblings welcome.']]), left:'Edit', right:'Looks good', leftStub:'Editing is not part of this demo' });
  sub(p, 'Ready to send · 1 event');
  p.receipt('Saved in Events · Sat, Aug 1');
  await p.say('Maya’s party is ready. Send the invite to Miss Taylor’s class?', 900);
  p.set('Ready to send the invite', { when:'Aug 1' });
  await p.card({ cover, icon:'ph-calendar-blank', eyebrow:'Event', title:'Maya’s 8th birthday party', rows:ROWS, left:'Edit', right:'Send invites', leftStub:'Editing is not part of this demo' });
  sub(p, 'Done · invites sent');
  p.receipt('Sent to 22 families · Miss Taylor’s class');
  await p.say('Sent. RSVPs land in Events as families reply. I’ll send you the headcount Thursday.', 900);
  p.set('Invites sent · RSVPs by Thu', { when:'Aug 1' });
  const d = await p.chips(['See the invite', 'Done']);
  if (d === 0) bsheet({ body:`<div class="cover" style="background-image:url(${cover})"></div><div class="btitle">Maya’s 8th birthday party</div>${ROWS.map(([i, t]) => `<div class="fact"><i class="ph ${i}"></i>${t}</div>`).join('')}<p class="bp" style="margin-top:10px">Cake, games and a piñata. Siblings welcome.</p>`, foot:`<button type="button" class="btn ghost" onclick="this.closest('.bsheet').classList.remove('on');document.getElementById('bscrim').classList.remove('on')">Close</button>` });
  else X.closeSheet();
  await later(p, { status:'Collecting RSVPs', small:'Miss Taylor’s class · 22 families', ms:4500, title:'Maya’s party · 16 coming', body:'3 can’t make it. Headcount for Saturday.' });
  sub(p, 'Maya’s party · 16 coming');
  p.divider('Thursday · 9:00 AM');
  await p.say('Headcount for Saturday: 16 families are coming, 3 can’t make it. I’ll send one last reminder Friday morning.', 1000);
  p.set('16 coming · reminder Friday', { when:'Aug 1', done:true });
  const e = await p.chips(['See who’s coming', 'Done'], { stub:[0] });
  if (e === 1) X.closeSheet();
};
async function playdate(p){
  sub(p, 'Playdate'); p.title = 'Playdate · Maya and Lily'; X.renderHome();
  await p.say('Nice. Who’s coming over, and when?', 700);
  await p.draft('Playdate with Lily on Sunday afternoon at our place');
  await sleep(300);
  sub(p, 'Ready to send · 1 playdate');
  await p.say('Lily’s in Maya’s class. I’ll text her parents, Ben and Ana, and ask if Sunday works.', 1000);
  const card = p.card({ icon:'ph-calendar-blank', eyebrow:'Playdate', title:'Maya + Lily', rows:[['ph-calendar-blank', 'Sun, Aug 2 · 2:00 – 4:00 PM'], ['ph-map-pin', 'Our house'], ['ph-users', 'Lily’s parents · Ben and Ana Ortiz']], left:'Edit', right:'Send to Ben and Ana', leftStub:'Editing is not part of this demo' });
  await sleep(50);
  const cardEl = p.chat.querySelector('.row:last-child'); p.chips(['Add a note', 'Ask them to pick a time'], { into:cardEl, stub:[0, 1], echo:false });
  await card; cardEl.querySelector('.chips')?.remove();
  p.receipt('Sent to Ben and Ana Ortiz');
  p.set('Waiting for Ben and Ana', { when:'Sun' });
  await later(p, { status:'Waiting for Ana and Ben', small:'Sun, Aug 2 · 2–4 PM', ms:3500, title:'Ana replied', body:'Sunday works for the playdate' });
  sub(p, 'Done · playdate set');
  await p.say('Ana says Sunday works, and they’ll bring snacks. It’s on your Daily Brief and Dana’s.', 1000);
  p.set('Lily · Sun 2–4 PM', { when:'Sun', done:true });
  const d = await p.chips(['Add a note', 'Done'], { stub:[0] });
  if (d === 1) X.closeSheet();
}

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
const LINKS = [['/', 'Daily Brief'], ['/assist/', 'Assist home'], ['/sports/', 'Soccer sign-up · SSC Kids'], ['/summer-camps/', 'Summer camps'],
  ['/assist/', 'Book a sitter · Plan a date night (tiles)'], ['/date-night-v3/', 'Date night from the Thursday push'],
  ['/birthdays/', 'Plan a birthday'], ['/create-event/', 'Plan an event'], ['/create-club/', 'Start a club'], ['/accounts-payments/', 'Accounts and cards']];
const route = location.pathname.split('/').filter(Boolean)[0] || '';
$('#deskLinks').innerHTML = LINKS.map(([h, t]) => `<li><a href="${h}"${('/' + route + '/').replace('//', '/') === h ? ' aria-current="page"' : ''}>${t}</a></li>`).join('');
const ROUTE = {
  assist: () => { X.showHome(); X.openSheet(); },
  sports: () => X.start('sports', { echo:'Sports leagues' }), 'summer-camps': () => X.start('camps', { echo:'Summer camps' }),
  'own-sitters': () => X.start('ownSitters', { echo:'Ask my sitters' }), 'class-families': () => X.start('classSitters', { echo:'Class-family sitters' }), 'night-out': () => X.start('nightOut', { echo:'Plan a night out' }),
  birthdays: () => X.start('event', { echo:'Plan an event', birthday:false }), 'create-event': () => X.start('event', { echo:'Plan an event' }), 'create-club': () => X.start('club', { echo:'Start a club' }),
  'accounts-payments': () => { X.showHome(); X.openSheet(); setTimeout(X.openWallet, 500); },
};
if (ROUTE[route]) setTimeout(ROUTE[route], 500);
})();
