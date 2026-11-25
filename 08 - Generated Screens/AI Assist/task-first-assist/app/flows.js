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

/* ======================= Summer camps · M4 (Tony, 19 Nov chat, 4:26 AM) =======================
   Tony's order: "display the various weeks and ask them to select the ones they need camps for. Then ask for which kids.
   Then show some summer camps kids from their school are going to. Show details, pictures, pricing. Give them the option
   to register a specific kid to the summer camp, then display the weeks. Pre-populate the form details we already have
   + ask the questions. Sign them up. Once signup is complete, tell them about emails we will follow for them. Then it
   should display other weeks needed to complete. Let the user click the next weeks they want to book for and follow a
   similar flow to the original flow."
   Parts are K10 v3's (camp rows with classmates, details sheet with photos, week sheet, form + waiver, Approve card,
   the weeks strip), card headers use the clay tile art. Camps, spots and classmates are samples. */
const illIco = n => `<span class="clayico" style="background-image:url(${A}illus/${n}.webp)"></span>`;
const SUMMER = [
  { id:'jun7', d:'June 7–11', s:'Jun 7' }, { id:'jun14', d:'June 14–18', s:'Jun 14' }, { id:'jun21', d:'June 21–25', s:'Jun 21' },
  { id:'jun28', d:'June 28 – July 2', s:'Jun 28' }, { id:'jul5', d:'July 5–9', s:'Jul 5', away:'Family trip' },
  { id:'jul12', d:'July 12–16', s:'Jul 12' }, { id:'jul19', d:'July 19–23', s:'Jul 19' }, { id:'jul26', d:'July 26–30', s:'Jul 26' }, { id:'aug2', d:'Aug 2–6', s:'Aug 2' },
];
const WK = id => SUMMER.find(w => w.id === id);
const noFriends = { faces:[], plus:0, who:'' };
const CAMPS = {
  pinecrest: { n:'Pinecrest Day Camp', short:'Pinecrest', img:A + 'camp/pinecrest.webp', gal:[F + 'pinecrest-hero.jpg', F + 'pinecrest-2.jpg', F + 'pinecrest-3.jpg'], price:420, mi:'2 mi from home', miles:2, ll:[30.2205,-97.8063], pals:{ jun7:['Leo', 'Ava', 'Noah'], jun14:['Leo', 'Lily', 'Zoe'], jun28:['Zoe'] },
    kind:'Outdoor day camp', what:'Hiking, creek days, crafts · swim on Fridays', ages:[5, 10], site:'pinecrestcamp.org', swim:true,
    friends:{ Maya:{ faces:['priya.webp', 'aisha.webp'], plus:2, who:'4 from Maya’s class' }, Jake:{ faces:['elena.webp'], plus:0, who:'Noah from Jake’s class' } },
    weeks:{ jun7:'4 spots left', jun14:'9 spots left', jun21:'full', jun28:'12 spots left', jul12:'10 spots left', jul19:'full', jul26:'8 spots left', aug2:'14 spots left' },
    hot:{ Maya:['jun7', 'jun14'], Jake:['jun7'] } },
  barton: { n:'Barton Swim Camp', short:'Barton Swim', img:F + 'barton-swim.jpg', gal:[F + 'barton-swim.jpg'], price:310, mi:'1.5 mi from home', miles:1.5, ll:[30.2196,-97.8186], pals:{ jun21:['Leo'] },
    kind:'Swim day camp', what:'Swim lessons every morning · games after lunch', ages:[5, 9], site:'bartonswim.org', swim:true,
    friends:{ Maya:{ faces:['priya.webp'], plus:0, who:'Leo from Maya’s class' }, Jake:noFriends },
    weeks:{ jun7:'6 spots left', jun14:'8 spots left', jun21:'10 spots left', jun28:'5 spots left', jul12:'7 spots left' },
    hot:{ Maya:['jun21'], Jake:[] } },
  muddy: { n:'Muddy Hands Clay Camp', short:'Muddy Hands', img:F + 'muddy-hands.jpg', gal:[F + 'muddy-hands.jpg'], price:380, mi:'2.8 mi from home', miles:2.8, ll:[30.1962,-97.8762], pals:{ jun21:['Noah', 'Max'], jul12:['Noah'] },
    kind:'Clay and garden camp', what:'Clay, garden and a mud kitchen · 9 AM–1 PM', ages:[4, 8], site:'muddyhandsatx.org',
    friends:{ Maya:noFriends, Jake:{ faces:['elena.webp'], plus:1, who:'2 from Jake’s class' } },
    weeks:{ jun14:'5 spots left', jun21:'7 spots left', jun28:'3 spots left', jul12:'6 spots left', jul19:'4 spots left', aug2:'9 spots left' },
    hot:{ Maya:[], Jake:['jun21', 'jul12'] } },
  lakeside: { n:'Lakeside Art Camp', short:'Lakeside Art', img:F + 'lakeside-art.jpg', gal:[F + 'lakeside-art.jpg'], price:530, mi:'3.4 mi from home', miles:3.4, ll:[30.1652,-97.7897], pals:{ jun28:['Ava', 'Mia'], jul26:['Ava'] },
    kind:'Art day camp', what:'Painting, clay and a show for parents on Friday', ages:[6, 12], site:'lakesideart.org',
    friends:{ Maya:{ faces:['aisha.webp'], plus:1, who:'2 from Maya’s class' }, Jake:noFriends },
    weeks:{ jun14:'3 spots left', jun28:'6 spots left', jul19:'9 spots left', jul26:'4 spots left' },
    hot:{ Maya:['jun28', 'jul26'], Jake:[] } },
};
const fits = (c, kid) => kid.age >= c.ages[0] && kid.age <= c.ages[1];
const facesHtml = f => f.who ? `<div class="faces"><span>${f.faces.map(x => `<i style="background-image:url(${A}${x})"></i>`).join('')}${f.plus ? `<i class="n">+${f.plus}</i>` : ''}</span>${f.who}</div>` : '';
const weekList = ids => joinNames(SUMMER.filter(w => ids.includes(w.id)).map(w => w.s));
/* N7 (Tony, 20 Nov meeting): "I kinda wanna see by week which parents or kids I know ... the weeks that they're gonna
   be there." Friends' kids per camp week (CAMPS[k].pals, samples). Leo, Ava and Noah have their parent's photo. */
const PAL_PHOTO = { Leo:'priya.webp', Ava:'aisha.webp', Noah:'elena.webp' };
const palFaces = names => `<span class="palf">${names.filter(n => PAL_PHOTO[n]).slice(0, 3).map(n => `<i style="background-image:url(${A}${PAL_PHOTO[n]})"></i>`).join('')}</span>`;
/* "Leo and Ava at Pinecrest, Noah at Muddy Hands" for one week; one camp only when k is given */
const palsLine = (w, k) => {
  const per = Object.keys(CAMPS).filter(c => (!k || c === k) && CAMPS[c].pals[w]).map(c => [c, CAMPS[c].pals[w]]);
  if (!per.length) return '';
  return k ? `${joinNames(per[0][1])} ${per[0][1].length > 1 ? 'go' : 'goes'}` : per.map(([c, n]) => `${joinNames(n)} at ${CAMPS[c].short}`).join(', ');
};
const palsOf = (w, k) => Object.keys(CAMPS).filter(c => (!k || c === k)).flatMap(c => CAMPS[c].pals[w] || []);
/* N7 (Tony, 20 Nov): "Can we keep them in the app when we do that?" Like Instagram's in-app browser: the camp's site
   opens over the chat, X brings you back exactly where you were. The page is a sample built from the camp's data. */
function inAppBrowser(k){
  const c = CAMPS[k];
  const v = el(`<section class="iab" role="dialog" aria-label="${c.site}">
    <div class="iab-bar"><button type="button" class="iab-x" aria-label="Close"><i class="ph ph-x"></i></button>
      <div class="iab-url"><i class="ph-fill ph-lock-simple"></i>${c.site}</div><button type="button" class="iab-x" aria-label="Share" data-share><i class="ph ph-export"></i></button></div>
    <div class="iab-page">
      <div class="iab-hero" style="background-image:url(${c.gal[0]})"></div>
      <div class="iab-body"><div class="iab-name">${c.n}</div><p>${c.kind} for ages ${c.ages[0]} to ${c.ages[1]}. ${c.what}.</p>
        <h4>Summer weeks</h4>${SUMMER.filter(w => c.weeks[w.id]).map(w => `<div class="iab-row"><span>${w.d}</span><span>${c.weeks[w.id] === 'full' ? 'Full' : c.weeks[w.id]}</span></div>`).join('')}
        <h4>Price</h4><p>$${c.price} per week · 9 AM to 3 PM, Monday to Friday</p>
        <p class="iab-note">Sample page for this prototype</p></div></div></section>`);
  document.querySelector('#phone').append(v);
  requestAnimationFrame(() => v.classList.add('on'));
  v.querySelector('[data-share]').onclick = () => toast('Share sheet (not part of this demo)');
  v.querySelector('.iab-x').onclick = () => { v.classList.remove('on'); setTimeout(() => v.remove(), 300); };
}

/* 1 · which weeks (K10 P·15's weeks strip, now the first question) */
function campWeeksCard(p){
  return new Promise(res => {
    const on = new Set(['jun7', 'jun14', 'jun21', 'jun28']);
    const c = p.block(`<div class="card"><div class="ctop">${illIco('camps')}<div><div class="eyebrow">Summer camps · 9 weeks</div><div class="ttl">Which weeks need camp?</div></div></div>
      <div class="weeks">${SUMMER.map(w => `<button type="button" class="wkb" data-w="${w.id}"${w.away ? ' disabled' : ''} aria-pressed="false">${w.away ? 'Trip' : w.s}</button>`).join('')}</div>
      <div class="fact" style="margin-top:10px"><i class="ph ph-airplane-tilt"></i>July 5–9 is your family trip, from your calendar</div>
      <div class="dlabel" style="margin-top:14px">Friends at camp</div>
      <div class="palweeks">${SUMMER.filter(w => palsLine(w.id)).map(w => `<div class="palwk">${palFaces(palsOf(w.id))}<span><b>${w.s}</b> · ${palsLine(w.id)}</span></div>`).join('')}</div>
      <button class="btn" style="margin-top:14px"></button></div>`).querySelector('.card');
    const btn = c.querySelector('.btn'), all = [...c.querySelectorAll('[data-w]:not([disabled])')];
    const paint = () => { all.forEach(b => { const s = on.has(b.dataset.w); b.classList.toggle('on', s); b.setAttribute('aria-pressed', s); });
      btn.disabled = !on.size; btn.textContent = on.size ? `Next · ${on.size} week${on.size === 1 ? '' : 's'}` : 'Pick at least one week'; };
    all.forEach(b => b.onclick = () => { const w = b.dataset.w; on.has(w) ? on.delete(w) : on.add(w); paint(); });
    btn.onclick = () => { if (btn.disabled) return; const ids = SUMMER.filter(w => on.has(w.id)).map(w => w.id); all.forEach(b => b.disabled = true); btn.remove(); p.me(weekList(ids)); res(ids); };
    paint(); p.scroll();
  });
}
/* 2 · which kids (Book a sitter's photo rows, both on) */
function campKidsCard(p){
  return new Promise(res => {
    const c = p.block(`<div class="card"><div class="ctop">${clayIco('two-people')}<div><div class="eyebrow">Summer camps</div><div class="ttl">Who needs camp?</div></div></div>
      <div class="ua-rows">${KIDS2.map(k => `<button type="button" class="ua-row on" data-n="${k.n}" aria-pressed="true"><span class="uaph" style="background-image:url(${k.img})"></span><span class="tx"><b>${k.n}</b><small>${k.age} · ${k.cls}</small></span><span class="ck"><i class="ph-bold ph-check"></i></span></button>`).join('')}</div>
      <button class="btn" style="margin-top:14px"></button></div>`).querySelector('.card');
    const btn = c.querySelector('.btn'), rows = [...c.querySelectorAll('.ua-row')];
    const picked = () => KIDS2.filter(k => rows.find(r => r.dataset.n === k.n).classList.contains('on'));
    const paint = () => { const n = picked(); rows.forEach(r => r.setAttribute('aria-pressed', r.classList.contains('on'))); btn.disabled = !n.length; btn.textContent = n.length ? `Next · ${joinNames(n.map(k => k.n))}` : 'Pick at least one'; };
    rows.forEach(r => r.onclick = () => { r.classList.toggle('on'); paint(); });
    btn.onclick = () => { if (btn.disabled) return; const n = picked(); rows.forEach(r => r.disabled = true); btn.remove(); p.me(joinNames(n.map(k => k.n))); res(n); };
    paint(); p.scroll();
  });
}
const clayIco = n => `<span class="clayico" style="background-image:url(${A}clay/${n}.png)"></span>`;
/* K10 D·1: details sheet with photos; the footer CTA picks this camp */
function campSheet(k, kids){
  const c = CAMPS[k];
  return new Promise(res => {
    const v = bsheet({ onBack:() => res(false),
      body:`${c.gal.length > 2 ? `<div class="bgal">${c.gal.map(g => `<i style="background-image:url(${g})"></i>`).join('')}</div>` : `<div class="bhero" style="background-image:url(${c.gal[0]})"></div>`}
        <div class="btitle">${c.n}</div><div class="bsub">Ages ${c.ages[0]}–${c.ages[1]} · ${c.kind}</div>
        <div class="fact"><i class="ph ph-clock"></i>${c.what.includes('9 AM') ? 'Mon–Fri' : '9 AM–3 PM, Mon–Fri · before-care from 7:30 AM'}</div>
        <div class="fact"><i class="ph ph-sparkle"></i>${c.what}</div>
        <div class="fact"><i class="ph ph-map-pin"></i>${c.mi}</div>
        ${kids.map(kid => facesHtml(c.friends[kid.n])).join('')}
        <button class="link" style="margin:4px 0 6px" data-site>Full details on ${c.site} <i class="ph ph-caret-right"></i></button>`,
      foot:`<div class="bprice"><b>$${c.price}</b><small>/ week</small></div><button type="button" class="btn" data-go>Sign up for ${c.short}</button>` });
    v.body.querySelector('[data-site]').onclick = () => inAppBrowser(k);
    v.foot.querySelector('[data-go]').onclick = () => { v.close(); res(true); };
  });
}
/* 3 · camps kids from Lincoln go to. N7 (Tony, 20 Nov meeting): "I think we should use the previous UI that we had, the
   map with ... be able to slide it over. Because this gets really long." Same map + swipe cards as birthday and date
   night (X.sv.partyResults); each card: photo, price, distance, weeks open, friends; Details opens the sheet, the globe
   opens the camp's site in the in-app browser. */
function campListCard(p, keys, kids, target){
  const { partyResults, PARTY_HOME } = X.sv;
  const open = k => target.filter(w => CAMPS[k].weeks[w] && CAMPS[k].weeks[w] !== 'full').length;
  const ranked = keys.map(k => ({ place:{ key:k, name:CAMPS[k].n, detail:'South Austin, TX', coords:CAMPS[k].ll, photo:CAMPS[k].img.slice(A.length) }, miles:CAMPS[k].miles }));
  const cardHtml = (place, miles, first) => { const k = place.key, cp = CAMPS[k]; return `<div class="card dn3 campc" data-k="${k}">
      <div class="dn3img" style="background-image:url(${cp.img})">${first ? '<span class="dn3pick">My pick</span>' : ''}</div>
      <div class="dn3bd"><div class="dn3top"><b>${cp.n}</b><span class="dn3price"><strong>$${cp.price}</strong> / week</span></div>
        <div class="dn3sub">${cp.kind} · ${miles} mi · open ${open(k)} of your ${target.length} week${target.length === 1 ? '' : 's'}</div>
        ${kids.map(kid => fits(cp, kid) ? facesHtml(cp.friends[kid.n]) : `<div class="dn3sub">Ages ${cp.ages[0]}–${cp.ages[1]} · not for ${kid.n}</div>`).join('')}
        <div class="dn3cta"><button class="dn3link dn3ico" data-details aria-label="Details" title="Details"><i class="ph ph-info"></i></button><button class="dn3link dn3ico" data-site aria-label="Website" title="Website"><i class="ph ph-globe-simple"></i></button><button class="btn dn3go" data-go>Choose</button></div></div></div>`; };
  const wire = (tile, place, { select, finish }) => {
    tile.querySelector('[data-details]').onclick = async () => { select(); if (await campSheet(place.key, kids)) finish(place); };
    tile.querySelector('[data-site]').onclick = () => { select(); inAppBrowser(place.key); };
    tile.querySelector('[data-go]').onclick = () => finish(place);
  };
  return partyResults(p, null, { ...PARTY_HOME, label:`${target.length} week${target.length === 1 ? '' : 's'} · ${joinNames(kids.map(k => k.n))}` }, ranked,
    { heading:'Lincoln kids’ camps', search:'summer day camps', showAll:true, back:false, cardHtml, wire }).then(place => place.key);
}
/* 4 · the camp's weeks (K10 P·4 week sheet) for the kids you already picked. Ahmad, 19 Nov: asking "who's going"
   again made no sense, so every kid who fits is on; the For toggles are how you leave one out (Tony's "a specific kid"). */
function campWeekSheet(k, can, target, need){
  const c = CAMPS[k];
  return new Promise(res => {
    const on = new Set(can.map(x => x.n));
    const isOpen = w => c.weeks[w] && c.weeks[w] !== 'full';
    const weeks = target.filter(w => can.some(kid => need[kid.n].has(w)));
    const firstHot = weeks.filter(w => isOpen(w) && can.some(kid => c.hot[kid.n].includes(w)));
    const v = bsheet({ onBack:() => res(null),
      body:`${c.gal.length > 2 ? `<div class="bgal">${c.gal.map(g => `<i style="background-image:url(${g})"></i>`).join('')}</div>` : `<div class="bhero" style="background-image:url(${c.gal[0]})"></div>`}
        <div class="btitle">${c.n}</div><div class="bsub">${c.kind} · from ${c.site}</div>
        ${can.length > 1 ? `<div class="bq">For</div><div class="qk" data-kids>${can.map(kid => `<button type="button" class="chip sel" data-kid="${kid.n}" aria-pressed="true">${kid.n}</button>`).join('')}</div>` : ''}
        ${firstHot.length ? `<span class="mypick" style="margin-top:12px"><i class="ph ph-sparkle"></i>Classmates go ${weekList(firstHot)}</span>` : ''}
        <div class="bq">Which weeks?</div>
        <div class="fields" style="margin-top:0">${weeks.map(w => { const st = c.weeks[w], off = !isOpen(w);
          /* N7 (Tony, 20 Nov): "let's just have the remaining weeks preselected ... if they don't wanna do all of them,
             they'll unclick one." Every open week you still need starts on; friends that week sit under it. */
          return `<button class="pick${!off ? ' on' : ''}" data-w="${w}"${off ? ' aria-disabled="true"' : ''}><span class="ptx">${WK(w).d}<small data-s="${w}"></small>${palsLine(w, k) ? `<small class="palsm">${palFaces(c.pals[w])}${palsLine(w, k)}</small>` : ''}</span>${off ? `<span class="note">${st === 'full' ? 'Waitlist' : 'Closed'}</span>` : '<span class="cb"><i class="ph-bold ph-check"></i></span>'}</button>`; }).join('')}</div>`,
      foot:`<div class="bprice"><b></b><small></small></div><button type="button" class="btn" data-go></button>` });
    const rows = [...v.body.querySelectorAll('.pick:not([aria-disabled])')], go = v.foot.querySelector('[data-go]');
    v.body.querySelectorAll('.pick[aria-disabled]').forEach(r => r.onclick = () => toast(r.querySelector('.note').textContent === 'Waitlist' ? 'Waitlists are not part of this demo' : `${c.short} isn’t running that week`));
    const plan = () => { const ws = rows.filter(r => r.classList.contains('on')).map(r => r.dataset.w);
      return can.filter(kid => on.has(kid.n)).map(kid => ({ kid, weeks:ws.filter(w => need[kid.n].has(w)) })).filter(x => x.weeks.length); };
    const paint = () => {
      v.body.querySelectorAll('[data-kid]').forEach(b => { const sel = on.has(b.dataset.kid); b.classList.toggle('sel', sel); b.setAttribute('aria-pressed', sel); });
      weeks.forEach(w => { const st = c.weeks[w], line = v.body.querySelector(`[data-s="${w}"]`), who = can.filter(kid => on.has(kid.n) && need[kid.n].has(w));
        line.textContent = !st ? `${c.short} isn’t running this week` : st === 'full' ? 'Full' : `${who.length ? joinNames(who.map(x => x.n)) : 'Nobody picked'} · ${st}`; });
      const pl = plan(), slots = pl.reduce((a2, x) => a2 + x.weeks.length, 0);
      v.foot.querySelector('b').textContent = '$' + (slots * c.price).toLocaleString();
      v.foot.querySelector('small').textContent = `${slots} camp week${slots === 1 ? '' : 's'}`;
      go.disabled = !slots; go.textContent = slots ? `Sign up ${joinNames(pl.map(x => x.kid.n))}` : 'Pick a kid and a week';
    };
    v.body.querySelectorAll('[data-kid]').forEach(b => b.onclick = () => { const n = b.dataset.kid; if (on.has(n)) on.delete(n); else on.add(n); paint(); });
    rows.forEach(r => r.onclick = () => { r.classList.toggle('on'); paint(); }); paint();
    go.onclick = () => { if (go.disabled) return; const pl = plan(); v.close(); res({ plan:pl, label:go.textContent }); };
  });
}
/* 5 · the form (K10 P·5–P·9). Every value Sprout has is its own field and each pencil edits it in place (Weeks
   re-prices the sign-up); only what's missing is asked, one in-card question at a time, waiver last. Ahmad, 19 Nov:
   each kid's real values sit on their own card, so Jake's shirt size from soccer is visible, not hidden in a summary. */
const SIZES = ['Youth XS', 'Youth S', 'Youth M', 'Youth L', 'Youth XL'];
const PICKUPS = ['Dana Martin, Tony Martin', 'Tony Martin', 'Dana Martin'];
const PROFILE = {
  Maya:{ birthday:'Mar 3, 2019', emergency:'Dana Martin', emergencyFrom:'From Jake’s form' },
  Jake:{ birthday:'Sep 14, 2020', emergency:'Dana Martin', emergencyFrom:'From soccer', shirt:'Youth S', shirtFrom:'From soccer', medical:'None', medicalFrom:'From soccer' },
};
let PICKUP = null;
const campQs = (k, kid, pickupKnown = !!PICKUP) => { const c = CAMPS[k], prof = PROFILE[kid.n], qs = [];
  if (!prof.shirt) qs.push('shirt'); if (!prof.medical) qs.push('medical'); if (!pickupKnown) qs.push('pickup');
  if (c.swim && kid.age < 7 && !prof.swim) qs.push('swim'); if (!(prof.waivers || []).includes(k)) qs.push('waiver'); return qs; };
const QWORD = { shirt:'shirt size', medical:'medical notes', pickup:'who can pick up', swim:'swim level' };
/* one line per kid for the message before the forms: what's already known, what's still needed */
function needLine(k, kid, pickupKnown){
  const prof = PROFILE[kid.n], qs = campQs(k, kid, pickupKnown), n = qs.filter(q => q !== 'waiver').map(q => QWORD[q]), w = qs.includes('waiver');
  const known = [prof.shirtFrom === 'From soccer' && 'shirt size', prof.medicalFrom === 'From soccer' && 'medical notes'].filter(Boolean);
  const pre = known.length ? `${kid.n}’s ${joinNames(known)} come from ${kid.n === 'Jake' ? 'his' : 'her'} soccer form, so ${kid.n === 'Jake' ? 'he' : 'she'} ` : `${kid.n} `;
  return !qs.length ? `${kid.n}’s form is all set` : !n.length ? `${pre}just needs ${CAMPS[k].short}’s waiver` : `${pre}needs ${joinNames(n)}${w ? ', then the waiver' : ''}`;
}
function textSheet(title, value = '', hint = ''){
  return new Promise(res => {
    const v = bsheet({ onBack:() => res(null), body:`<div class="bh"><span class="icotile"><i class="ph ph-pencil-simple"></i></span><b>${title}</b></div>${hint ? `<p class="bp" style="margin:0 0 8px">${hint}</p>` : ''}<textarea class="edt" rows="3">${value}</textarea>`,
      foot:'<button type="button" class="btn" data-save>Save</button>' });
    setTimeout(() => v.o.querySelector('textarea').focus(), 350);
    v.o.querySelector('[data-save]').onclick = () => { const t = v.o.querySelector('textarea').value.trim(); if (!t) return toast('Type something first'); v.close(); res(t); };
  });
}
async function campForm(p, k, kid, weeks, { open }){
  const c = CAMPS[k], prof = PROFILE[kid.n], her = kid.n === 'Jake' ? 'his' : 'her';
  const qs = campQs(k, kid);
  const wkTxt = () => `${weeks.length} week${weeks.length > 1 ? 's' : ''}`;
  const fields = [
    [{ l:'Weeks', v:weekList(weeks), opts:open.map(w => WK(w).s), multi:true }, 'Your pick'],
    [{ l:'Camper', v:`${kid.n} Martin, age ${kid.age}` }, 'From Sprout'],
    [{ l:'Birthday', v:prof.birthday }, 'From Sprout'],
    [{ l:'Emergency contact', v:prof.emergency }, prof.emergencyFrom],
  ];
  if (prof.shirt) fields.push([{ l:'Shirt size', v:prof.shirt, opts:SIZES }, prof.shirtFrom]);
  if (prof.medical) fields.push([{ l:'Allergies and medical notes', v:prof.medical }, prof.medicalFrom]);
  if (PICKUP) fields.push([{ l:'Pickup', v:PICKUP, opts:PICKUPS.includes(PICKUP) ? PICKUPS : [PICKUP, ...PICKUPS] }, 'Whole family']);
  if (c.swim && kid.age < 7 && prof.swim) fields.push([{ l:`Swims on ${her} own`, v:prof.swim, opts:['Yes', 'Not yet'] }, 'Saved']);
  if (!qs.includes('waiver')) fields.push([{ l:'Waiver', v:'Signed by you', ro:true }, 'Signed']);
  const TOTAL = fields.length + qs.length;
  const card = p.block(`<div class="card">
    <!-- N7 (Tony, 20 Nov): "this should be more clear that it's for Maya ... Maya's picture ... Maya's registration bigger,
         Pinecrest could be smaller." -->
    <div class="ctop regh"><span class="uaph" style="width:48px;height:48px;background-image:url(${kid.img})"></span><div><div class="ttl">${kid.n}’s registration</div><div class="eyebrow">${c.n} · <span data-wk>${wkTxt()}</span> · <b class="cnt">${fields.length}</b> of ${TOTAL} ready</div></div></div>
    <div class="progress"><i style="width:${fields.length / TOTAL * 100}%"></i></div>
    <div class="fields">${fields.map(([f, t]) => fieldRow(f, t)).join('')}</div>
    <div class="qwrap"></div><div class="foot"></div></div>`).querySelector('.card');
  card.addEventListener('edited', e => {
    const { label, value, picks } = e.detail;
    if (label === 'Weeks') { weeks.splice(0, weeks.length, ...open.filter(w => picks.includes(WK(w).s))); card.querySelector('[data-wk]').textContent = wkTxt(); }
    else if (label === 'Shirt size') prof.shirt = value;
    else if (label.startsWith('Allergies')) prof.medical = value;
    else if (label === 'Pickup') PICKUP = value;
    else if (label.startsWith('Swims')) prof.swim = value;
    else if (label === 'Emergency contact') prof.emergency = value;
    else if (label === 'Birthday') prof.birthday = value;
  });
  editHint(card);
  let n = fields.length;
  const step = f => { addField(card, f); n++; card.querySelector('.cnt').textContent = n; card.querySelector('.progress i').style.width = (n / TOTAL * 100) + '%'; };
  const left = q => { const rest = qs.slice(qs.indexOf(q) + 1).map(x => x === 'waiver' ? 'waiver' : QWORD[x]); card.querySelector('.foot').textContent = rest.length ? `Still to go: ${rest.join(', ')}` : ''; };
  for (const q of qs) {
    left(q);
    if (q === 'shirt') { const sz = SIZES.slice(1), i = await ask(p, card, `What’s ${kid.n}’s shirt size?`, sz); prof.shirt = sz[i]; prof.shirtFrom = 'Saved'; step({ l:'Shirt size', v:sz[i], opts:SIZES }); }
    if (q === 'medical') {
      let note = null;
      while (!note) {
        const i = await ask(p, card, `Any allergies, medicines or medical notes for ${c.short}? Nothing is on ${kid.n}’s profile yet.`, ['Nothing to add', 'Add a note']);
        note = i === 0 ? 'None' : await textSheet(`${kid.n}’s medical notes`, '', `${c.short} staff see this. It’s saved to ${kid.n}’s profile.`);
      }
      prof.medical = note; prof.medicalFrom = 'Saved'; step({ l:'Allergies and medical notes', v:note });
    }
    if (q === 'pickup') {
      let who = null;
      while (!who) {
        const i = await ask(p, card, `Who’s allowed to pick ${kid.n} up? ${c.short} checks this list at the gate.`, ['Dana and me', 'Just me', 'Add someone']);
        if (i < 2) who = PICKUPS[i];
        else { const extra = await textSheet('Add someone to the pickup list', '', 'Name, and how they know the kids. They’ll show a photo ID at the gate.'); if (extra) who = `Dana Martin, Tony Martin, ${extra}`; }
      }
      PICKUP = who; step({ l:'Pickup', v:who, opts:PICKUPS.includes(who) ? PICKUPS : [who, ...PICKUPS] });
    }
    if (q === 'swim') { const sw = ['Yes', 'Not yet'], i = await ask(p, card, `${c.short} asks swim level for campers under 7. Can ${kid.n} swim on ${her} own?`, sw); prof.swim = sw[i]; step({ l:`Swims on ${her} own`, v:sw[i], opts:sw }); }
    if (q === 'waiver') {
      const wrap = card.querySelector('.qwrap'); wrap.innerHTML = '';
      const qq = el(`<div class="q"><p>Last one: ${c.short}’s waiver for ${kid.n}. In short:</p>
        <div class="preview" style="background:#fff;margin-top:8px"><p>· Release for camp activities${c.swim ? ', swim' : ''} and field trips<br>· Staff can give first aid and call 911<br>· Camp photos can be shared with camp families</p><button class="link" style="margin:6px 0 0" data-read>Read the full waiver · 2 pages <i class="ph ph-caret-right"></i></button></div>
        <div class="chips"><button class="chip" data-k="agree">I agree to the waiver</button><button class="chip" data-k="read">Read it first</button></div></div>`);
      wrap.appendChild(qq); card.querySelector('.foot').textContent = `You sign as Tony Martin. ${c.short} gets a dated copy, and it's saved here.`; p.scroll();
      await new Promise(done => {
        const read = () => { const v = bsheet({ body:`<div class="bh"><span class="icotile"><i class="ph ph-clipboard-text"></i></span><b>${c.short} waiver · 2 pages</b></div>
          <p class="bp">1. Activities. ${kid.n} can join everything on the camp schedule: ${c.what.split(' ·')[0].toLowerCase()}.</p><p class="bp">2. Medical. If staff can't reach you, they can give first aid and call 911. They use the medical notes on ${her} form.</p><p class="bp">3. Photos. Camp photos may be shared with ${c.short} families. Ask the office to opt out.</p><p class="bp">4. Pickup. Only people on ${her} pickup list can sign ${kid.n === 'Jake' ? 'him' : 'her'} out, with a photo ID.</p><p class="bp">5. Refunds. Full refund until May 1, then half until June 1.</p>`,
          stack:true, foot:`<button type="button" class="btn" data-go>I agree to the waiver</button><button type="button" class="textbtn" data-x>Close</button>` });
          v.foot.querySelector('[data-go]').onclick = () => { v.close(); done(); }; v.foot.querySelector('[data-x]').onclick = () => v.close(); };
        qq.querySelector('[data-read]').onclick = read; qq.querySelector('[data-k=read]').onclick = read;
        qq.querySelector('[data-k=agree]').onclick = done;
      });
      qq.querySelector('.chips').classList.add('done'); qq.querySelector('[data-k=agree]').classList.add('sel');
      await sleep(260); wrap.innerHTML = ''; step({ l:'Waiver', v:'Signed by you', ro:true });
      prof.waivers = [...(prof.waivers || []), k];
    }
  }
  card.querySelector('.qwrap').innerHTML = '';
  const f = card.querySelector('.foot'); f.className = 'foot ok'; f.innerHTML = `<i class="ph-bold ph-check"></i> ${kid.n}’s form is ready · tap a pencil to change anything`;
  await sleep(400);
}
/* 6 · after sign-up: the camp emails Sprout watches (real Gmail logo, never the clay envelope) */
/* N7 (Tony, 20 Nov): the old header "I'll watch Pinecrest's emails / From your email" read like an email had arrived
   ("do I need to click it or not?"). Now: who's in first, then ONE line on the emails Sprout watches (small Gmail logo). */
const WATCHED = {};
function inCard(p, k, plan){
  const c = CAMPS[k], again = WATCHED[k];
  WATCHED[k] = true;
  const names = joinNames(plan.map(x => x.kid.n));
  p.block(`<div class="card"><div class="ctop"><span class="faces regf"><span>${plan.map(x => `<i style="background-image:url(${x.kid.img})"></i>`).join('')}</span></span><div><div class="eyebrow">${c.n}</div><div class="ttl">${names} ${plan.length > 1 ? 'are' : 'is'} in</div></div></div>
    ${plan.map(x => `<div class="fact"><i class="ph ph-check-circle"></i>${x.kid.n} · ${weekList(x.weeks)}</div>`).join('')}
    <div class="fact"><img class="gml" src="${A}gmail.svg" alt="Gmail">${again ? `Still watching ${c.short} emails` : `I’ll watch ${c.short} emails`}: forms become to-dos, drop-offs go on the calendar</div></div>`);
}
/* N7 (Tony, 20 Nov): "The one thing again you're gonna need to ask is their password ... what they want the password to
   be." The shared providerAccount() (app.js) stays as is; a thin plan wrapper asks for the password right after
   "Yes, create it" and before the account is made. It is saved to the password manager; Sprout never shows it again. */
function passwordPick(provider, site){
  return new Promise(res => {
    const v = bsheet({ onBack:() => res(null),
      body:`<div class="bh"><span class="icotile"><i class="ph ph-key"></i></span><b>Choose a password for ${provider}</b></div>
        <p class="bp" style="margin:0 0 8px">Your login on ${site} is tony@martinfam.com. Pick the password you want; it goes to your password manager, so you can sign in yourself too.</p>
        <div class="fields" style="margin-top:0"><label class="field in"><div style="width:100%"><div class="l">Password</div><input type="password" autocomplete="new-password" placeholder="At least 8 characters"></div><button type="button" class="s" data-eye aria-label="Show password"><i class="ph ph-eye"></i></button></label></div>`,
      foot:'<button type="button" class="btn" data-save>Create the account</button>' });
    const input = v.o.querySelector('input');
    setTimeout(() => input.focus(), 350);
    v.o.querySelector('[data-eye]').onclick = () => { input.type = input.type === 'password' ? 'text' : 'password'; };
    v.o.querySelector('[data-save]').onclick = () => { if (input.value.length < 8) return toast('Use at least 8 characters'); v.close(); res(true); };
  });
}
async function campAccount(p, c, kid){
  const opts = ['Yes, create it', 'I already have one'];
  const wrapped = Object.create(p);
  wrapped.chips = async (o, x) => {
    for (;;) {
      const i = await p.chips(o, x);
      if (o !== opts || i !== 0) return i;
      await sleep(250);
      if (await passwordPick(c.short, c.site)) return 0;
      await p.say('No problem. Pick one when you’re ready.', 600);
    }
  };
  await providerAccount(wrapped, { provider:c.short, site:c.site, kid, opts, ask:`${c.short} needs a parent account. Want me to make one with tony@martinfam.com? You pick the password.` });
}
/* 7 · N7 (Tony, 20 Nov): "this should be, like, remaining weeks open ... it should just show the weeks that we actually
   have to book." Only open weeks, all preselected (untick to drop one); booked weeks collapse into one line below. */
function openWeeksCard(p, need, kids, weeks, booked){
  return new Promise(res => {
    const total = weeks.length * kids.length, done = total - kids.reduce((a, k) => a + need[k.n].size, 0);
    const openW = weeks.filter(w => kids.some(k => need[k.n].has(w)));
    const line = w => { const open = kids.filter(k => need[k.n].has(w)); return open.length === kids.length && kids.length > 1 ? `${joinNames(kids.map(k => k.n))} need camp`
      : kids.map(k => need[k.n].has(w) ? `${k.n} needs camp` : `${k.n} at ${CAMPS[booked[k.n + w]].short}`).join(' · '); };
    const bookedBy = {};
    kids.forEach(kd => weeks.forEach(w => { const b = booked[kd.n + w]; if (b) (bookedBy[b] = bookedBy[b] || new Set()).add(w); }));
    const bookedLine = Object.entries(bookedBy).map(([b, ws]) => `${weekList([...ws])} at ${CAMPS[b].short}`).join(' · ');
    const c = p.block(`<div class="card"><div class="ctop">${illIco('week')}<div><div class="eyebrow">${joinNames(kids.map(k => k.n))} · ${done} of ${total} camp weeks booked</div><div class="ttl">Remaining weeks open</div></div></div>
      <div class="fields">${openW.map(w => `<button type="button" class="pick on" data-w="${w}" aria-pressed="true"><span class="ptx">${WK(w).d}<small>${line(w)}</small>${palsLine(w) ? `<small class="palsm">${palFaces(palsOf(w))}${palsLine(w)}</small>` : ''}</span><span class="cb"><i class="ph-bold ph-check"></i></span></button>`).join('')}</div>
      ${bookedLine ? `<div class="fact" style="margin-top:10px"><i class="ph-bold ph-check-circle" style="color:var(--brand)"></i>Booked: ${bookedLine}</div>` : ''}
      <button class="btn" style="margin-top:12px"></button></div>`).querySelector('.card');
    const btn = c.querySelector('.btn'), rows = [...c.querySelectorAll('.pick:not([aria-disabled])')];
    const sel = () => rows.filter(r => r.classList.contains('on')).map(r => r.dataset.w);
    const paint = () => { const s = sel(); rows.forEach(r => r.setAttribute('aria-pressed', r.classList.contains('on'))); btn.disabled = !s.length; btn.textContent = s.length ? `Find camps for ${s.length} week${s.length === 1 ? '' : 's'}` : 'Tick the weeks to book next'; };
    rows.forEach(r => r.onclick = () => { r.classList.toggle('on'); paint(); });
    const end = v => { rows.forEach(r => r.style.pointerEvents = 'none'); btn.remove(); c.querySelector('.chips')?.classList.add('done'); res(v); };
    btn.onclick = () => { if (btn.disabled) return; const s = sel(); p.me(`Find camps for ${weekList(s)}`); end(s); };
    p.chips(['We’re done for now'], { into:c, echo:false }).then(() => { p.me('We’re done for now'); end(null); });
    paint(); p.scroll();
  });
}
X.flows.camps = async (p, opt = {}) => {
  await p.say('Camp sign-ups are opening. First, which summer weeks do you need camp for?', 900);
  const weeks = await campWeeksCard(p);
  await p.say('And who needs camp those weeks?', 700);
  const kids = await campKidsCard(p);
  const names = joinNames(kids.map(k => k.n));
  sub(p, 'Summer camps'); p.title = `Summer camps · ${names}`;
  const need = {}, booked = {};
  kids.forEach(k => need[k.n] = new Set(weeks));
  let target = weeks, round = 0;
  for (;;) {
    round++;
    const who = kids.filter(k => target.some(w => need[k.n].has(w)));
    p.set('Checking camps', { when:'Now' });
    const look = p.work(round === 1 ? 'Checking camps Lincoln families booked' : `Checking camps for ${weekList(target)}`, `${weekList(target)} · ${joinNames(who.map(k => `${k.n}, ${k.age}`))} · near home`);
    await sleep(1400);
    const score = k => who.reduce((a, kid) => a + (fits(CAMPS[k], kid) ? CAMPS[k].friends[kid.n].faces.length + CAMPS[k].friends[kid.n].plus + CAMPS[k].hot[kid.n].filter(w => target.includes(w)).length : 0), 0);
    const keys = Object.keys(CAMPS).filter(k => who.some(kid => fits(CAMPS[k], kid)) && target.some(w => CAMPS[k].weeks[w] && CAMPS[k].weeks[w] !== 'full')).sort((a, b) => score(b) - score(a));
    look.done(`${keys.length} camps with Lincoln families`, 'Most classmates first, then closest', 'ph-tent');
    const top = CAMPS[keys[0]], topFriends = who.map(kid => top.friends[kid.n].who).filter(Boolean)[0];
    await p.say(`My pick is ${top.short}${topFriends ? `: ${topFriends.replace(/^(\d+) from/, '$1 kids from')} ${/^\d|and/.test(topFriends) ? 'go' : 'goes'}` : ''}. Tap Details for photos and the full day.`, 1000);
    const k = await campListCard(p, keys, who, target);
    const c = CAMPS[k];
    const can = who.filter(kid => fits(c, kid) && target.some(w => need[kid.n].has(w) && c.weeks[w] && c.weeks[w] !== 'full'));
    if (!can.length) { await p.say(`${c.short} has no open spots for those weeks. Pick another camp?`, 800); continue; }
    let pick = null;
    while (!pick) {
      pick = await campWeekSheet(k, can, target, need);
      if (!pick) { await sleep(200); const r = await p.chips(['Choose weeks', 'Pick another camp'], { echo:false }); if (r === 1) { p.me('Pick another camp'); break; } }
    }
    if (!pick) continue;
    const plan = pick.plan, who2 = joinNames(plan.map(x => x.kid.n));
    p.me(pick.label); await sleep(300);
    let pk = !!PICKUP;
    const lines = plan.map(x => { const l = needLine(k, x.kid, pk); pk = true; return l; });
    await p.say(`I filled ${plan.length > 1 ? 'both forms' : `${who2}’s form`} with what I already know. ${lines.join('. ')}.`, 1100);
    for (const [i, { kid, weeks:wk }] of plan.entries()) {
      if (i) await p.say(`Now ${kid.n}’s form.`, 600);
      p.set(`${kid.n} · ${c.short} form`, { when:'Now' });
      await campForm(p, k, kid, wk, { open:target.filter(w => need[kid.n].has(w) && c.weeks[w] && c.weeks[w] !== 'full') });
    }
    await campAccount(p, c, plan[0].kid.n);
    const slots = plan.reduce((a2, x) => a2 + x.weeks.length, 0), sum = slots * c.price, all = [...new Set(plan.flatMap(x => x.weeks))];
    await p.say(`${plan.length > 1 ? 'Both forms are' : `${who2}’s form is`} complete. That’s $${sum.toLocaleString()} for ${slots} camp week${slots === 1 ? '' : 's'}. Approve it?`, 900);
    const r = await approval(p, { sub:c.n, forHtml:`<img class="s" src="${plan[0].kid.img}" alt="">For ${who2} · ${weekList(all)}`,
      lines:plan.map(x => [`${x.kid.n} · ${x.weeks.length} week${x.weeks.length > 1 ? 's' : ''} × $${c.price}`, `$${(x.weeks.length * c.price).toLocaleString()}.00`]), total:`$${sum.toLocaleString()}.00`, code:'PC-9' + (210 + round * 7), time:'9:0' + Math.min(9, 2 + round) + ' AM' });
    if (!r.ok) { await p.say('No problem. Nothing was paid, and those weeks stay open.', 800); }
    else {
      await sleep(400); p.receipt(`Registered · ${who2}, ${c.short}`);
      plan.forEach(({ kid, weeks:wk }) => wk.forEach(w => { need[kid.n].delete(w); booked[kid.n + w] = k; }));
      await sleep(300);
      inCard(p, k, plan);
    }
    const left = kids.reduce((a, x) => a + need[x.n].size, 0);
    if (!left) {
      await p.say(`Every week you picked is covered${kids.length > 1 ? ' for both kids' : ''}. It’s all on the family calendar, and I’ll keep watching the camp emails.`, 1000);
      p.set(`Summer covered · ${weekList(weeks)}`, { when:'June', done:true });
      await p.chips(['Thanks']);
      return;
    }
    p.set(`${left} camp week${left === 1 ? '' : 's'} still open`, { when:'June' });
    const openN = weeks.filter(w => kids.some(x => need[x.n].has(w))).length;
    await p.say(openN > 1 ? `These ${openN} weeks still need camp. They’re all ticked; untick any you want to skip, and I’ll find camps the same way.` : 'One week still needs camp. I’ll find camps for it the same way.', 900);
    const next = await openWeeksCard(p, need, kids, weeks, booked);
    if (!next) {
      await p.say('Okay. The open weeks stay here, and I’ll remind you before the camps fill up.', 800);
      p.set(`${left} camp week${left === 1 ? '' : 's'} still open`, { when:'June', done:true });
      return;
    }
    target = next;
  }
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
/* N8 (Tony, 20 Nov): "I would use the same UI that we had before ... It should also show the kids that are signed up."
   ll / miles put each sample program on the shared map; pals = friends' kids signed up, per kid's class. */
const AFTER = [
  { n:'Lincoln Kids Club', img:A + 'illus/afterschool.webp', tags:['Anything', 'Sports', 'Art'], price:95, unit:'week', pickup:'On campus, no pickup needed', why:'6 kids from her class go · homework hour first', key:'lkc', ll:[30.2071,-97.8236], miles:0.6,
    pals:{ Maya:{ faces:['priya.webp', 'aisha.webp'], plus:4, who:'Leo, Ava and 4 more from Maya’s class' }, Jake:{ faces:['elena.webp'], plus:3, who:'Noah and 3 more from Jake’s class' } } },
  { n:'Little Coders Lab', img:A + 'illus/tutoring.webp', tags:['STEM'], price:165, unit:'month', pickup:'Van pickup from Lincoln at 3:05', why:'Small groups of 6 · 2 kids from her class', key:'lcl', ll:[30.2128,-97.8429], miles:1.1,
    pals:{ Maya:{ faces:[], plus:0, who:'Lily and Zoe from Maya’s class' }, Jake:{ faces:[], plus:0, who:'Max from Jake’s class' } } },
  { n:'Clay & Color Studio', img:A + 'illus/camps.webp', tags:['Art'], price:140, unit:'month', pickup:'Walking pickup with staff', why:'Ava goes on Wednesdays', key:'ccs', ll:[30.1931,-97.8178], miles:0.9,
    pals:{ Maya:{ faces:['aisha.webp'], plus:0, who:'Ava, on Wednesdays' }, Jake:noFriends } },
  { n:'Circle C Tumbling', img:A + 'illus/sports.webp', tags:['Sports'], price:120, unit:'month', pickup:'Van pickup from Lincoln at 3:10', why:'1.4 mi from home · Leo goes', key:'cct', ll:[30.1855,-97.8508], miles:1.4,
    pals:{ Maya:{ faces:['priya.webp'], plus:0, who:'Leo, Mon and Wed' }, Jake:{ faces:['elena.webp'], plus:0, who:'Noah, on Thursdays' } } },
];
/* the program cards on the shared map (X.sv.partyResults), clay art in the photo slot */
function afterMap(p, kid, days, ranked){
  const { partyResults, PARTY_HOME } = X.sv;
  const byKey = new Map(ranked.map(r => [r.key, r]));
  const places = ranked.map(r => ({ place:{ key:r.key, name:r.n, detail:'South Austin, TX', coords:r.ll, photo:r.img.slice(A.length) }, miles:r.miles }));
  const cardHtml = (place, miles, first) => { const r = byKey.get(place.key); return `<div class="card dn3 campc" data-k="${r.key}">
      <div class="dn3img ill" style="background-image:url(${r.img})">${first ? '<span class="dn3pick">My pick</span>' : ''}</div>
      <div class="dn3bd"><div class="dn3top"><b>${r.n}</b><span class="dn3price"><strong>$${r.price}</strong> / ${r.unit}</span></div>
        <div class="dn3sub">${r.pickup} · ${miles} mi</div>
        ${facesHtml(r.pals[kid.n]) || `<div class="dn3sub">No one from ${kid.n}’s class yet</div>`}
        <div class="dn3cta"><button class="btn dn3go" data-go>Choose</button></div></div></div>`; };
  const wire = (tile, place, { finish }) => { tile.querySelector('[data-go]').onclick = () => finish(place); };
  return partyResults(p, null, { ...PARTY_HOME, label:`${kid.n} · ${days.join(', ')}` }, places,
    { heading:'After-school programs', search:'after school programs', showAll:true, back:false, cardHtml, wire }).then(place => byKey.get(place.key));
}
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
  await p.say(`My pick is ${ranked[0].n}${ranked[0].pals[kid.n].who ? `: ${ranked[0].pals[kid.n].who} go there` : ''}. Swipe for the others.`, 900);
  const prog = await afterMap(p, kid, days, ranked);
  const her = kid.n === 'Jake' ? 'his' : 'her';
  await p.say(`I filled ${kid.n}’s form from ${her} profile. One new question from ${prog.n}.`, 900);
  const c = p.block(`<div class="card"><div class="ctop regh"><span class="uaph" style="width:48px;height:48px;background-image:url(${kid.img})"></span><div><div class="ttl">${kid.n}’s registration</div><div class="eyebrow">${prog.n} · <b class="cnt">5</b> of 6 ready</div></div></div>
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
/* M2 (Tony, 19 Nov chat): only the 8 home flows. The other review states stay reachable by their URL. */
/* Ahmad, 22 Nov: "a clear navigation here to all of our update". Three groups: the parent's flows in the app, the
   other person's side (other parent, sitter), and the review pages. New = changed since the 21 Nov update to Tony. */
const NAV = [
  ['In the app', [['/assist/', 'Sprout Assist home'], ['/playdate/', 'Playdate', 1], ['/book-a-sitter-saved/', 'Book a sitter', 1], ['/plan-carpool/', 'Carpool', 1], ['/plan-carpool-none/', 'Carpool · nobody nearby', 1], ['/plan-carpool-new-time/', 'Carpool · Priya offers a new time', 1],
    ['/plan-a-date-night/', 'Date night'], ['/birthdays/', 'Birthday', 1], ['/sports/', 'Sports · SSC Kids'], ['/after-school/', 'After school'], ['/summer-camps/', 'Camps'], ['/tutoring/', 'Tutoring']]],
  ['The other side', [['/other-side/', 'Both sides of a request', 1], ['/sitter-signup/', 'Sitter sign-up, start to finish', 1], ['/pay/?n=Alex', 'Sitter pay link', 1],
    ['/sitter-profile/?s=login', 'Sitter log in', 1], ['/date-night-live/', 'Lock screen · Live Activity', 1]]],
  ['Review pages', [['/review/', 'All 8 flows on one page']]],
];
const route = location.pathname.split('/').filter(Boolean)[0] || '';
const review = new URLSearchParams(location.search).get('review');
const here = ('/' + route + '/').replace('//', '/');
$('#deskLinks').innerHTML = NAV.map(([group, links]) => `<li class="dk-h">${group}</li>` + links.map(([h, t, isNew]) =>
  `<li><a href="${h}"${here === h ? ' aria-current="page"' : ''}>${t}</a>${isNew ? '<span class="dk-new">New</span>' : ''}</li>`).join('')).join('');
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
  /* N1 carpool in Tony's order (20 Nov), flow in sitter-v3.js; the 19 Nov A/B links open it too */
  'plan-carpool': () => X.start('carpool', { echo:'Set up a carpool' }), 'plan-carpool-none': () => X.start('carpool', { echo:'Set up a carpool' }), 'plan-carpool-new-time': () => X.start('carpool', { echo:'Set up a carpool' }), 'carpool-a': () => X.start('carpool', { echo:'Set up a carpool' }), 'carpool-b': () => X.start('carpool', { echo:'Set up a carpool' }),
};
if (ROUTE[route]) setTimeout(ROUTE[route], 500);
})();
