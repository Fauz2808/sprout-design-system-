/* Sprout Assist prototype engine.
   Every visual part and timing is the approved SSC Kids demo (ssc-kids-signup-demo/prototype/index.html):
   say() = typing dots ~1 s then a Sprout bubble; me() = parent bubble; block() = an indented card / chips row;
   chips under a card = the answer; a question inside a card = .q; agent work = .status spinner -> check;
   money = approval card + Face ID; anything full screen = the waiver sheet (close top-left, CTA in the footer). */
window.SPROUT_NAV_TEXTURE = '/assets/assist-clover-ahmad-700.png';
window.Sprout = (() => {
  const $ = s => document.querySelector(s);
  /* PACE < 1 replays a flow fast in the background (review state for ongoing sessions); 1 = real time */
  let PACE = 1;
  const sleep = ms => new Promise(r => setTimeout(r, ms * PACE));
  const el = html => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };
  const sheet = $('#sheet'), scrim = $('#scrim'), views = $('#views'), hsub = $('#hsub'), headOrb = $('#headOrb');
  const A = '/assets/';

  function toast(t){ const n = $('#toast'); n.textContent = t; n.classList.add('on'); clearTimeout(n._t); n._t = setTimeout(() => n.classList.remove('on'), 1600); }
  const notInDemo = () => toast('Not part of this demo');

  /* ---------- family data (the same family as the SSC demo) ---------- */
  const wallet = {
    accounts: [
      { provider:'Austin Parks & Rec', site:'austintexas.gov', email:'tony@martinfam.com', how:'Your existing login', kids:['Jake'], used:'Jun 3 · Jake’s summer camp' },
    ],
    cards: [
      { id:'visa', brand:'Visa', last4:'4242', exp:'08 / 28', label:'Visa •••• 4242', sub:'Pay with Link · one-time card number', def:true, link:true, by:'Tony',
        used:'Jun 3 · Austin Parks & Rec · $240', uses:'Jake’s summer camp balance, due Aug 7', bill:['Tony Martin', '10212 Banks Court, Austin, TX', '78745'] },
      { id:'mc', brand:'Mastercard', last4:'5100', exp:'11 / 27', label:'Mastercard •••• 5100', sub:'Joint card · Dana', nick:'Joint card', by:'Dana', used:'Not used by Sprout yet' },
    ],
  };
  const defaultCard = () => wallet.cards.find(c => c.def) || wallet.cards[0];
  const fmt = n => '$' + n.toFixed(2).replace(/\.00$/, '.00');

  /* ---------- plans: one chat per request; starting a task again makes a new plan ---------- */
  const plans = []; let current = null, seq = 0, pendingOpen = null;
  const homeView = el('<div class="chat" id="homeView"></div>'); views.appendChild(homeView);

  function syncOrb(){ headOrb.classList.toggle('work', !!(current && current.typing)); }
  function makePlan(kind, o){
    const p = { id: ++seq, kind, title: o.title, sub: o.sub, icon: o.icon, line: o.line || 'Just started', when: 'Now', attn: false, done: false, typing: false, started: Date.now() };
    p.chat = el('<div class="chat" hidden></div>'); views.appendChild(p.chat);
    p.scroll = () => requestAnimationFrame(() => p.chat.scrollTo({ top: p.chat.scrollHeight, behavior: 'smooth' }));
    p.add = n => { p.chat.appendChild(n); p.scroll(); return n; };
    p.say = async (html, wait = 900) => {
      p.typing = true; syncOrb();
      const t = p.add(el(`<div class="row"><div class="from"><span class="orb sm"></span>Sprout</div><div class="bub typing" style="display:inline-flex;margin-left:32px"><i></i><i></i><i></i></div></div>`));
      await sleep(wait); t.remove(); p.typing = false; syncOrb();
      p.add(el(`<div class="row"><div class="from"><span class="orb sm"></span>Sprout</div><div class="bub">${html}</div></div>`));
    };
    p.me = text => p.add(el(`<div class="row me"><div class="bub">${text}</div></div>`));
    p.block = html => p.add(el(`<div class="row indent">${html}</div>`));
    p.set = (line, extra = {}) => { Object.assign(p, { line }, extra); renderHome(); };
    /* chips under a message or card. The tapped chip turns green, the rest fade; the parent's answer
       appears as their bubble (same as SSC). stub = chips that only show "Not part of this demo". */
    p.chips = (opts, { echo = true, stub = [], into = null } = {}) => new Promise(res => {
      const html = `<div class="chips">${opts.map((o, i) => `<button class="chip" data-i="${i}">${o}</button>`).join('')}</div>`;
      const host = into ? (into.appendChild(el(html)), into) : p.block(html);
      const c = host.querySelector('.chips:last-of-type') || host.querySelector('.chips');
      c.querySelectorAll('.chip').forEach(b => b.onclick = () => {
        const i = +b.dataset.i; if (stub.includes(i)) return notInDemo();
        b.classList.add('sel'); c.classList.add('done');
        if (echo) p.me(typeof echo === 'string' ? echo : opts[i]);
        res(i);
      });
      p.scroll();
    });
    /* agent work row: spinner, then a check */
    p.work = (title, small) => {
      const r = p.block(`<div class="status"><span class="spinner"></span><div>${title}<small>${small || ''}</small></div></div>`);
      return { done: (t2, s2, icon = 'ph-clipboard-text') => { r.innerHTML = `<div class="status"><span class="icotile"><i class="ph ${icon}"></i></span><div>${t2}<small>${s2 || ''}</small></div><i class="ph-bold ph-check end"></i></div>`; p.scroll(); } };
    };
    p.note = (t, s, icon = 'ph-clipboard-text') => p.block(`<div class="status"><span class="icotile"><i class="ph ${icon}"></i></span><div>${t}${s ? `<small>${s}</small>` : ''}</div><i class="ph-bold ph-check end"></i></div>`);
    /* receipt line (SSC "Registered" row / Figma receipt pill) */
    p.receipt = t => p.block(`<div class="status"><i class="ph-bold ph-check-circle" style="font-size:20px;color:var(--brand)"></i><div>${t}</div></div>`);
    p.divider = t => p.add(el(`<div class="tdiv">${t}</div>`));
    /* what the parent would type (Figma keyboard frames): fills the composer; tapping it or send posts it */
    p.draft = text => new Promise(res => { p.pending = { text, res }; if (current === p) applyComposer(); });
    /* object card (Figma "SA card"): cover, header, fact rows, then SSC .two buttons (secondary, primary) */
    p.card = ({ cover, icon = 'ph-calendar-blank', eyebrow, title, rows = [], body = '', left, right, leftStub = true }) => new Promise(res => {
      const c = p.block(`<div class="card">${cover ? `<div class="cover" style="background-image:url(${cover})"></div>` : ''}
        <div class="ctop"><span class="icotile"><i class="ph ${icon}"></i></span><div><div class="eyebrow">${eyebrow}</div><div class="ttl">${title}</div></div></div>
        ${rows.length ? '<hr>' + rows.map(([i, t]) => `<div class="fact"><i class="ph ${i}"></i>${t}</div>`).join('') : ''}${body}
        ${right ? `<div class="two">${left ? `<button class="btn ghost" data-k="0">${left}</button>` : ''}<button class="btn" data-k="1">${right}</button></div>` : ''}</div>`).querySelector('.card');
      c.querySelectorAll('.two .btn').forEach(b => b.onclick = () => {
        if (b.dataset.k === '0' && leftStub) return toast(typeof leftStub === 'string' ? leftStub : 'Not part of this demo');
        c.querySelector('.two').remove(); p.me(b.textContent); res({ k: +b.dataset.k, el: c });
      });
      if (!right) res({ k: -1, el: c });
    });
    plans.unshift(p); renderHome();
    return p;
  }
  function applyComposer(){
    const d = current && current.pending;
    $('#composer').classList.toggle('draft', !!d); $('#ctext').textContent = d ? d.text : 'Ask Sprout anything';
  }
  function sendDraft(){
    if (!current || !current.pending) return;
    const { text, res } = current.pending; current.pending = null; applyComposer(); current.me(text); res(text);
  }
  $('#composer').onclick = sendDraft;

  /* bottom sheet (Figma "Sheet ·"): grabber, no X, tap outside goes back, CTA in the footer */
  function bsheet({ body, foot = '', stack = false, onBack }){
    const s = el(`<div class="bsheet" role="dialog"><div class="grab"></div><div class="bbody">${body}</div>${foot ? `<div class="bfoot${stack ? ' stack' : ''}">${foot}</div>` : ''}</div>`);
    $('#overlays').appendChild(s); const scr = $('#bscrim');
    s.getBoundingClientRect(); s.classList.add('on'); scr.classList.add('on');
    const prev = scr.onclick;   // a sheet opened from a sheet (time wheel from the edit sheet): hand the scrim back on close
    const close = () => { s.classList.remove('on'); if ($('#overlays .bsheet.on')) scr.onclick = prev; else { scr.classList.remove('on'); scr.onclick = null; } setTimeout(() => s.remove(), 400); };
    scr.onclick = () => { close(); onBack && onBack(); };
    return { o: s, close, body: s.querySelector('.bbody'), foot: s.querySelector('.bfoot') };
  }

  /* confirm sitter (Figma A8 17/18): the SSC approval card without a payment row */
  function confirmSitter(p, { name, rate }){
    return new Promise(res => {
      const c = p.block(`<div class="card pay">
        <div class="ctop"><span class="icotile"><i class="ph ph-baby"></i></span><div><div class="ttl">Confirm sitter</div><div class="sub">${name}</div></div></div>
        <div class="for"><i class="s">M</i>Maya &amp; Jake · Aug 1 · 6–10 PM</div>
        <div class="line"><span>Hourly rate</span><span>$${rate}/hour</span></div><div class="line"><span>Duration</span><span>4 hours</span></div>
        <div class="line est"><span>Estimate</span><span>$${rate * 4}</span></div>
        <div class="wait"><i class="ph ph-hourglass-medium"></i>Only booked after the sitter accepts</div>
        <div class="two"><button class="btn ghost" data-k="back">Back</button><button class="btn" data-k="ok">Confirm ${name}</button></div>
      </div>`).querySelector('.card');
      c.querySelector('[data-k=back]').onclick = () => { c.parentElement.remove(); res(false); };
      c.querySelector('[data-k=ok]').onclick = () => { c.querySelector('.two').remove(); c.querySelector('.wait').innerHTML = `<i class="ph ph-hourglass-medium"></i>Waiting for ${name} to accept`; p.me('Confirm ' + name); res(true); };
    });
  }

  /* ---------- the in-card question (SSC registration card) ---------- */
  const fieldRow = (f, tag = '') => `<div class="field${tag === 'Just now' ? ' new' : ''}"><div><div class="l">${f.l}</div><div class="v">${f.v}</div>${f.s ? `<div class="fs">${f.s}</div>` : ''}</div><span class="s">${tag} <i class="ph ph-pencil-simple"></i></span></div>`;
  function ask(p, card, q, opts, stub = {}){
    return new Promise(res => {
      const wrap = card.querySelector('.qwrap'); wrap.innerHTML = '';
      const n = el(`<div class="q"><p>${q}</p><div class="chips">${opts.map((o, i) => `<button class="chip" data-k="${i}">${o}</button>`).join('')}</div></div>`);
      wrap.appendChild(n); p.scroll();
      n.querySelectorAll('.chip').forEach(b => b.onclick = async () => {
        const k = +b.dataset.k; if (stub[k]) return toast(stub[k]);
        b.classList.add('sel'); n.querySelector('.chips').classList.add('done'); await sleep(260); res(k);
      });
    });
  }
  function addField(card, f){
    card.querySelectorAll('.field.new').forEach(x => x.classList.remove('new'));
    const r = card.querySelector('.fields').appendChild(el(fieldRow(f, 'Just now')));
    r.querySelector('.s').onclick = () => toast('Editing is not part of this demo');
  }
  function editHint(card){ card.querySelectorAll('.field .s').forEach(x => x.onclick = () => toast('Editing is not part of this demo')); }

  /* ---------- overlays: the SSC waiver / Full details sheet ---------- */
  function overlay({ title, sub = '', body = '', foot = '', plain = true, label, id = '', instant = false }){
    const o = el(`<div class="waiver${instant ? ' instant' : ''}"${id ? ` id="${id}"` : ''} role="dialog" aria-label="${label || title}">
      <div class="whead"><button type="button" class="wclose" aria-label="Close"><i class="ph ph-x"></i></button><div><b>${title}</b><span>${sub}</span></div></div>
      <div class="wbody${plain ? ' plain' : ''}">${body}</div>${foot ? `<div class="wfoot">${foot}</div>` : ''}</div>`);
    $('#overlays').appendChild(o);
    o.getBoundingClientRect(); o.classList.add('on');   // reflow, then slide in (no rAF: works in background tabs too)
    const close = () => { o.classList.remove('on'); setTimeout(() => o.remove(), 400); };
    o.querySelector('.wclose').onclick = close;
    return { o, close, body: o.querySelector('.wbody'), foot: o.querySelector('.wfoot') };
  }

  async function faceId(){
    const f = $('#faceid'); f.classList.add('on'); await sleep(700);
    $('#faceIcon').className = 'ph ph-check-circle'; $('#faceText').textContent = 'Confirmed'; await sleep(600);
    f.classList.remove('on'); setTimeout(() => { $('#faceIcon').className = 'ph ph-scan-smiley'; $('#faceText').textContent = 'Face ID'; }, 300);
  }

  /* ---------- pay with: saved cards, add a card ---------- */
  function pickCard(onPick, current){
    let chosen = current || defaultCard().id;
    const rows = () => wallet.cards.map(c => `<button class="pick${c.id === chosen ? ' on' : ''}" data-id="${c.id}"><i class="ph ph-credit-card" style="font-size:20px;color:var(--strong)"></i><span class="ptx">${c.label}<small>${c.sub}</small></span><span class="cb rd"><i class="ph-bold ph-check"></i></span></button>`).join('');
    const v = bsheet({
      body:`<div class="bh"><span class="icotile"><i class="ph ph-credit-card"></i></span><b>Pay with</b></div><div class="list">${rows()}</div><button class="doc" type="button" data-add><span class="icotile"><i class="ph ph-plus"></i></span><span class="dt"><b>Add a card</b><small>Saved for next time</small></span><i class="ph ph-caret-right"></i></button>`,
      foot:`<button type="button" class="btn" data-use></button>` });
    const btn = v.o.querySelector('[data-use]');
    const paint = () => { v.o.querySelector('.list').innerHTML = rows(); btn.textContent = 'Use ' + wallet.cards.find(c => c.id === chosen).label;
      v.o.querySelectorAll('.list .pick').forEach(b => b.onclick = () => { chosen = b.dataset.id; paint(); }); };
    paint();
    v.o.querySelector('[data-add]').onclick = () => addCard(c => { chosen = c.id; paint(); });
    btn.onclick = () => { v.close(); onPick(wallet.cards.find(c => c.id === chosen)); };
  }
  function addCard(onSaved){
    const v = overlay({ title:'Add a card', sub:'Demo · use sample details',
      body:`<div class="fields" style="margin-top:0">
        <label class="field in"><div style="width:100%"><div class="l">Name on card</div><input value="Tony Martin" autocomplete="off"></div></label>
        <label class="field in"><div style="width:100%"><div class="l">Card number</div><input inputmode="numeric" value="4000 0000 0000 0077" autocomplete="off"></div></label>
        <div class="duo"><label class="field in"><div style="width:100%"><div class="l">Expires</div><input value="08 / 29" autocomplete="off"></div></label><label class="field in"><div style="width:100%"><div class="l">Security code</div><input inputmode="numeric" value="123" autocomplete="off"></div></label></div>
      </div><p class="hint2">Sprout keeps the last four digits and the expiry. The full number and code go to the card network, never into a chat. Demo only: nothing is stored.</p>`,
      foot:`<button type="button" class="btn" data-save>Save card</button>` });
    v.o.querySelector('[data-save]').onclick = () => {
      const num = v.o.querySelectorAll('input')[1].value.replace(/\D/g, '');
      const c = { id:'c' + Date.now(), label:'Visa •••• ' + (num.slice(-4) || '0077'), sub:'Added just now' };
      wallet.cards.push(c); v.close(); toast('Card saved'); renderHome(); onSaved && onSaved(c);
    };
  }

  /* approval card: SSC "Approve payment" with the card row now tappable */
  function approval(p, { sub, forHtml, lines, total, label, wait = 'Waiting for you or Dana', code = 'LS-30418', time = '9:43 AM' }){
    return new Promise(res => {
      let card = defaultCard();
      const c = p.block(`<div class="card pay">
        <div class="ctop"><span class="icotile"><i class="ph ph-credit-card"></i></span><div><div class="ttl">Approve payment</div><div class="sub">${sub}</div></div></div>
        <div class="for">${forHtml}</div>
        ${lines.map(([a, b]) => `<div class="line"><span>${a}</span><span>${b}</span></div>`).join('')}
        <div class="total"><span>Total</span><span>${total}</span></div>
        <button class="cardrow" data-card style="width:100%;text-align:left;background:transparent"><i class="ph ph-credit-card" style="font-size:20px"></i><div><span class="cl">${card.label}</span><small class="cs">${card.sub}</small></div><i class="ph ph-caret-right"></i></button>
        <div class="wait"><i class="ph ph-hourglass-medium"></i>${wait}</div>
        <div class="two"><button class="btn ghost" data-k="no">Decline</button><button class="btn" data-k="yes">${label || 'Approve ' + total.replace(/\.00$/, '')}</button></div>
      </div>`).querySelector('.card');
      const cr = c.querySelector('[data-card]');
      cr.onclick = () => pickCard(k => { card = k; cr.querySelector('.cl').textContent = k.label; cr.querySelector('.cs').textContent = k.sub; }, card.id);
      c.querySelector('[data-k=no]').onclick = () => {
        c.querySelector('.ttl').textContent = 'Declined'; c.querySelector('.wait').remove(); c.querySelector('.two').remove(); cr.disabled = true; c.classList.remove('pay');
        c.appendChild(el(`<div class="paid"><i class="ph ph-x-circle" style="color:var(--subtle)"></i><span>No payment made</span></div>`)); p.scroll(); res({ ok:false });
      };
      c.querySelector('[data-k=yes]').onclick = async e => {
        const b = e.currentTarget; b.innerHTML = '<span class="spinner" style="border-color:rgba(255,255,255,.35);border-top-color:#fff"></span>'; c.querySelectorAll('.btn').forEach(x => x.style.pointerEvents = 'none');
        await faceId();
        c.querySelector('.ttl').textContent = 'Paid'; c.querySelector('.wait').remove(); c.querySelector('.two').remove(); cr.disabled = true; cr.querySelector('.ph-caret-right').remove();
        c.appendChild(el(`<div class="paid"><i class="ph ph-check-circle"></i><span>Approved by you · ${time} · confirmation ${code}</span></div>`));
        c.appendChild(el(`<button class="btn ghost">View receipt</button>`)).onclick = () => overlay({ title:'Receipt', sub, body:`<div class="card"><div class="ttl">${sub}</div><div class="for">${forHtml}</div>${lines.map(([a, b]) => `<div class="line"><span>${a}</span><span>${b}</span></div>`).join('')}<div class="total"><span>Paid</span><span>${total}</span></div><div class="foot">${card.label} · confirmation ${code} · demo, no real charge</div></div>` });
        c.classList.remove('pay'); p.scroll(); res({ ok:true, card, el:c });
      };
    });
  }

  /* provider account step (SSC "Last step" chips; Figma K12 R·1/R·2 and K10 A·1–A·3) */
  async function providerAccount(p, { provider, site, kid = 'Jake', ask, opts = ['Create one for me', 'I already have one'], after }){
    const have = wallet.accounts.find(a => a.provider === provider);
    if (have) {
      await p.say(`You already have a ${provider} account, so I'll sign in with it.`, 900);
      const w = p.work(`Signing in to ${provider}`, `on ${site}`); await sleep(1300);
      w.done(`Signed in to ${provider}`, `${have.email} · from your password manager`); return;
    }
    await p.say(ask || `${provider} needs a parent account. I can make one with tony@martinfam.com, or use the one you already have.`, 1000);
    for (;;) {
      const i = await p.chips(opts);
      if (i === 0) {
        await sleep(300);
        const w = p.work(`Creating your ${provider} account`, `on ${site}`); await sleep(1500);
        wallet.accounts.push({ provider, site, email:'tony@martinfam.com', how:'Created by Sprout' }); renderHome();
        w.done(`Created your ${provider} account`, 'tony@martinfam.com · login saved to your password manager');
        if (after) await after(false);
        return;
      }
      await p.say('Sign in with your password manager. I never see or keep your password.', 800);
      const login = await passwordSheet(provider, site, kid);
      if (!login) { await p.say('No problem. Pick one when you’re ready.', 600); continue; }
      const w = p.work(`Signing in to ${provider}`, `on ${site}`); await sleep(1200);
      wallet.accounts.push({ provider, site, email: login, how:'Your existing login' }); renderHome();
      w.done(`Signed in to ${provider}`, `${login} · from your password manager`);
      if (after) await after(true);
      return;
    }
  }
  /* Figma K12 R·1 / R·2: the password manager fills the login; Sprout never sees the password */
  function passwordSheet(provider, site, kid){
    return new Promise(res => {
      let done = false; const finish = v => { if (!done) { done = true; res(v); } };
      const saved = () => `<div class="bh"><span class="icotile"><i class="ph ph-key"></i></span><b>Sign in to ${provider}</b></div>
        <p class="bp">Your password manager fills in your ${provider} login. Sprout uses it on their site to register ${kid}, and never sees the password.</p>
        <div class="field"><i class="ph ph-password" style="font-size:20px;color:var(--subtle);margin-right:10px"></i><div class="v" style="margin:0;font-size:14.5px">tony@martinfam.com · saved login for ${provider}</div></div>`;
      const other = () => `<div class="bh"><span class="icotile"><i class="ph ph-key"></i></span><b>Sign in to ${provider}</b></div>
        <p class="bp">Type the login you use on ${site}. It's saved to your password manager. Sprout never sees the password.</p>
        <div class="fields" style="margin-top:0"><label class="field in"><div style="width:100%"><div class="l">Email</div><input value="tony.martin@gmail.com" autocomplete="off"></div></label>
        <label class="field in"><div style="width:100%"><div class="l">Password</div><input type="password" value="demo-password" autocomplete="off"></div></label></div>`;
      const v = bsheet({ body:saved(), stack:true, foot:`<button type="button" class="btn" data-go>Continue with saved login</button><button type="button" class="textbtn" data-alt>Use a different login</button>`, onBack:() => finish(null) });
      let mode = 'saved';
      v.foot.querySelector('[data-go]').onclick = () => { const login = mode === 'saved' ? 'tony@martinfam.com' : v.body.querySelector('input').value; v.close(); finish(login); };
      v.foot.querySelector('[data-alt]').onclick = () => {
        if (mode === 'saved') { mode = 'other'; v.body.innerHTML = other(); v.foot.querySelector('[data-go]').textContent = 'Sign in'; v.foot.querySelector('[data-alt]').textContent = 'Cancel'; }
        else { mode = 'saved'; v.body.innerHTML = saved(); v.foot.querySelector('[data-go]').textContent = 'Continue with saved login'; v.foot.querySelector('[data-alt]').textContent = 'Use a different login'; }
      };
    });
  }

  /* ---------- Assist home (Figma A·1) ---------- */
  const TILES = {
    everyday: [
      { k:'remind', t:'Remind someone', s:'You, Dana, or both', icon:'remind' },
      { k:'event', t:'Plan an event', s:'Playdates, parties, invites', icon:'event' },
      { k:'club', t:'Start a club', s:'Families who share a thing', icon:'club' },
      { k:'week', t:'What’s on this week', s:'To-dos and events, by day', icon:'week' },
    ],
    nights: [
      { k:'ownSitters', t:'Ask my sitters', s:'Sitters your family knows', icon:'person-plus' },
      { k:'classSitters', t:'Class-family sitters', s:'Who other families use', icon:'two-people' },
      { k:'nightOut', t:'Plan a night out', s:'Dinner and a sitter', icon:'calendar-check' },
    ],
    kids: [
      { k:'sports', t:'Sports leagues', s:'Seasons near you, by age', icon:'sports' },
      { k:'afterschool', t:'After-school', s:'Programs from 3 to 6 PM', icon:'afterschool' },
      { k:'camps', t:'Summer camps', s:'Dates, prices, sign-up', icon:'camps' },
      { k:'tutoring', t:'Tutoring', s:'Reading, math, and more', icon:'tutoring' },
    ],
  };
  const clay = n => `${A}clay/${n}.png`;
  const tile = t => `<button class="tile" data-k="${t.k}"><span class="clay"><img src="${clay(t.icon)}" alt=""></span><b>${t.t}</b><small>${t.s}</small></button>`;
  const planRow = p => `<button class="status${p.attn ? ' attn' : ''}" data-plan="${p.id}"><span class="icotile"><img src="${clay(p.icon)}" alt=""></span><div class="stxt"><span>${p.title}</span><small>${p.line}</small></div><span class="when">${p.when}</span></button>`;
  /* ---------- Assist home · Uber-style services grid (Tony, 18 Nov: "custom illustrations for each,
     more like the Uber services layout"). Two directions behind ?home=a / ?home=b, compared at /assist-home/.
     Illustrations: Figma HlWjGHq9JNgKSHXvI8RFeD, cut by tools/cut-illustrations.py into assets/illus/. */
  const HOME = new URLSearchParams(location.search).get('home');
  const ILL = { remind:'remind', event:'event', club:'club', week:'week', sitterC1:'sitter', ownSitters:'sitter', classSitters:'sitter',
    dateE:'date-night', dateD:'date-night', nightOut:'date-night', sports:'sports', afterschool:'afterschool', camps:'camps', tutoring:'tutoring' };
  const SHORT = { remind:'Reminder', event:'Plan event', club:'Start club', week:'This week', sitterC1:'Book a sitter', ownSitters:'My sitters',
    classSitters:'Class sitters', dateE:'Date night', dateD:'Date night', nightOut:'Night out', sports:'Sports', afterschool:'After-school', camps:'Camps', tutoring:'Tutoring' };
  const BADGE = { dateE:'New', dateD:'New' };
  const ill = n => `${A}illus/${n}.webp`;
  const allTiles = () => [...TILES.everyday, ...TILES.nights, ...TILES.kids];
  /* size: s = 4 across (Uber's small row), m = 3 across (Uber's first row), w = 2 across with the subtitle (Uber's Grocery / Food) */
  const uTile = (t, size) => `<button class="ut ut-${size}" data-k="${t.k}" data-echo="${t.t}" aria-label="${t.t}. ${t.s}">
      ${BADGE[t.k] ? `<em class="ubadge">${BADGE[t.k]}</em>` : ''}<img src="${ill(ILL[t.k] || 'event')}" alt="">
      ${size === 'w' ? `<span class="utx"><b>${t.t}</b><small>${t.s}</small></span>` : `<b>${SHORT[t.k] || t.t}</b>`}</button>`;
  const uGrid = (list, size) => `<div class="ugrid ug-${size}">${list.map(t => uTile(t, size)).join('')}</div>`;
  const uHead = t => `<h3 class="uhead">${t}</h3>`;
  function renderUber(){
    const T = TILES, pick = ks => ks.map(k => allTiles().find(t => t.k === k)).filter(Boolean);
    const body = HOME === 'b'
      /* B · popular first: the three that book something sit up top, then the rest by group */
      ? uHead('Popular') + uGrid(pick([T.nights[0] && T.nights[0].k, T.nights[1] && T.nights[1].k, 'sports']), 'm')
        + uHead('Everyday') + uGrid(T.everyday, 's')
        + uHead('Find for your kids') + uGrid(T.kids.filter(t => t.k !== 'sports'), 'm')
      /* A · today's three groups, Uber tile anatomy: small 4-across rows, the nights pair as wide tiles */
      : uHead('Everyday') + uGrid(T.everyday, 's')
        + uHead('Sitters and nights out') + uGrid(T.nights, 'w')
        + uHead('Find for your kids') + uGrid(T.kids, 's');
    homeView.innerHTML = `<div class="home uhome">
      <div class="ugreet"><b>What can I take off your plate?</b><span>Tell me like you’d text Dana. I’ll sort it out.</span></div>
      ${body}
      ${uHead('Saved details')}
      <button class="status" data-wallet><span class="icotile uill"><img src="${ill('wallet')}" alt=""></span><div class="stxt"><span>Accounts and cards</span><small>${wallet.accounts.length} account${wallet.accounts.length === 1 ? '' : 's'} · ${wallet.cards.length} cards</small></div><i class="ph ph-caret-right" style="margin-left:auto;color:var(--subtle)"></i></button>
    </div>`;
    homeView.querySelectorAll('.ut').forEach(b => b.onclick = () => start(b.dataset.k, { echo: b.dataset.echo }));
    homeView.querySelector('[data-wallet]').onclick = openWallet;
  }
  /* ---------- L1 (Tony, 19 Nov): eight tiles in two groups, short labels, the clay illustrations.
     "If I saw those eight things, I'm like, holy shit." Order is Tony's: playdate is the most common, then sitter,
     date night, birthday. Reminder, Plan event, This week and Start club are out for now. Anything still running
     sits above the tiles, so a parent who left Book a sitter waiting on replies can get back into that chat. ---------- */
  const EIGHT = {
    plan: [
      { k:'playdate', t:'Playdate', e:'Plan a playdate', ill:'club' },
      { k:'sitterC1', t:'Book a sitter', e:'Book a sitter', ill:'sitter' },
      { k:'dateE', t:'Date night', e:'Plan a date night', ill:'date-night' },
      { k:'party', t:'Birthday', e:'Plan a birthday party', ill:'event' },
    ],
    kids: [
      { k:'sports', t:'Sports', e:'Sign Jake up for sports', ill:'sports' },
      { k:'afterschool', t:'After school', e:'Find an after-school program', ill:'afterschool' },
      { k:'camps', t:'Camps', e:'Find a summer camp', ill:'camps' },
      { k:'tutoring', t:'Tutoring', e:'Find a tutor', ill:'tutoring' },
    ],
  };
  const KIND_ILL = { playdate:'club', sitterC1:'sitter', ownSitters:'sitter', classSitters:'sitter', shareSitter:'sitter',
    dateE:'date-night', dateD:'date-night', nightOut:'date-night', party:'event', event:'event', sports:'sports', camps:'camps' };
  const eTile = (t, big) => `<button class="ut ${big ? 'ut-p' : 'ut-s'}" data-k="${t.k}" data-echo="${t.e}" aria-label="${t.t}"><img src="${ill(t.ill)}" alt=""><b>${t.t}</b></button>`;
  const goRow = p => `<button class="status grow${p.attn ? ' attn' : ''}" data-plan="${p.id}"><span class="icotile uill"><img src="${ill(KIND_ILL[p.kind] || 'event')}" alt=""></span>
    <div class="stxt"><span>${p.title}</span><small>${p.line}</small></div><em class="gpill">${p.attn ? 'Needs you' : 'In progress'}</em></button>`;
  function renderEight(){
    const going = activePlans().sort((a, b) => (b.attn - a.attn) || (b.started - a.started));
    homeView.innerHTML = `<div class="home uhome">
      <div class="ugreet"><b>What can I take off your plate?</b><span>Tell me like you’d text Dana. I’ll sort it out.</span></div>
      ${going.length ? uHead('Pick up where you left off') + `<div class="going">${going.map(goRow).join('')}</div>` : ''}
      ${uHead('Plan something')}<div class="ugrid ug-p">${EIGHT.plan.map(t => eTile(t, true)).join('')}</div>
      ${uHead('Register my kids')}<div class="ugrid ug-s">${EIGHT.kids.map(t => eTile(t)).join('')}</div>
      ${uHead('Saved details')}
      <button class="status" data-wallet><span class="icotile uill"><img src="${ill('wallet')}" alt=""></span><div class="stxt"><span>Accounts and cards</span><small>${wallet.accounts.length} account${wallet.accounts.length === 1 ? '' : 's'} · ${wallet.cards.length} cards</small></div><i class="ph ph-caret-right" style="margin-left:auto;color:var(--subtle)"></i></button>
    </div>`;
    homeView.querySelectorAll('.ut').forEach(b => b.onclick = () => start(b.dataset.k, { echo: b.dataset.echo }));
    homeView.querySelectorAll('[data-plan]').forEach(b => b.onclick = () => showPlan(plans.find(p => p.id === +b.dataset.plan)));
    homeView.querySelector('[data-wallet]').onclick = openWallet;
  }
  function renderHome(){
    paintHistoryBadge();
    if (HOME === 'a' || HOME === 'b') return renderUber();
    if (HOME !== 'old') return renderEight();
    homeView.innerHTML = `<div class="home">
      <div class="greet"><b>What can I take off your plate?</b><span>Tell me like you’d text Dana. I’ll sort it out.</span></div>
      <div class="slabel">Everyday</div><div class="tiles">${TILES.everyday.map(tile).join('')}</div>
      <div class="slabel">Sitters and nights out</div><div class="tiles">${TILES.nights.map(tile).join('')}</div>
      <div class="slabel">Find for your kids</div><div class="tiles">${TILES.kids.map(tile).join('')}</div>
      <div class="slabel">Saved details</div>
      <button class="status" data-wallet><span class="icotile"><i class="ph ph-wallet"></i></span><div class="stxt"><span>Accounts and cards</span><small>${wallet.accounts.length} account${wallet.accounts.length === 1 ? '' : 's'} · ${wallet.cards.length} cards</small></div><i class="ph ph-caret-right" style="margin-left:auto;color:var(--subtle)"></i></button>
    </div>`;
    homeView.querySelectorAll('.tile').forEach(b => b.onclick = () => start(b.dataset.k, { echo: b.querySelector('b').textContent }));
    homeView.querySelectorAll('[data-plan]').forEach(b => b.onclick = () => showPlan(plans.find(p => p.id === +b.dataset.plan)));
    homeView.querySelector('[data-wallet]').onclick = openWallet;
  }

  /* G3 (17 Nov): plans live behind the history button. The badge counts plans still in progress
     (and turns solid when one needs you); chats without a plan sit below a divider. */
  const isPlan = p => p.kind !== 'chat';
  const activePlans = () => plans.filter(p => isPlan(p) && !p.done);
  function paintHistoryBadge(){
    const b = $('#historyBtn'); if (!b) return;
    const n = activePlans().length, attn = plans.some(p => p.attn);
    let d = b.querySelector('.hb'); if (!d) { d = el('<b class="hb"></b>'); b.appendChild(d); }
    d.textContent = n; d.hidden = !n; d.classList.toggle('attn', attn);
    b.setAttribute('aria-label', n ? `History, ${n} active plan${n > 1 ? 's' : ''}` : 'History');
  }
  const histRow = p => {
    const chat = !isPlan(p), live = isPlan(p) && !p.done;
    return `<button class="status hrow${p.attn ? ' attn' : ''}${live ? ' live' : ''}" data-plan="${p.id}"><span class="icotile">${chat ? '<i class="ph ph-chat-circle-dots"></i>' : `<img src="${clay(p.icon)}" alt="">`}</span>
      <div class="stxt"><span>${p.title}</span><small>${p.line}</small></div><span class="hmeta">${live ? `<em>${p.attn ? 'Needs you' : 'Active'}</em>` : ''}<span class="when">${p.when}</span></span></button>`;
  };
  function openHistory(){
    const byNew = (a, b) => b.started - a.started;
    const act = activePlans().sort((a, b) => (b.attn - a.attn) || byNew(a, b));
    const fin = plans.filter(p => isPlan(p) && p.done).sort(byNew);
    const chats = plans.filter(p => !isPlan(p)).sort(byNew);
    const body = (act.length || fin.length ? `<div class="hsec"><b>Plans</b><span>Things Sprout is doing for you</span></div>${[...act, ...fin].map(histRow).join('')}` : '')
      + (chats.length ? `<div class="hsec hdiv"><b>Chats</b><span>Questions and ideas, nothing to book</span></div>${chats.map(histRow).join('')}` : '');
    const v = overlay({ title:'History', sub: act.length ? `${act.length} plan${act.length > 1 ? 's' : ''} in progress` : 'Your plans and chats with Sprout',
      body: body || `<div class="empty">Plans and chats you start with Sprout show up here.</div>` });
    v.o.querySelectorAll('[data-plan]').forEach(b => b.onclick = () => { v.close(); showPlan(plans.find(p => p.id === +b.dataset.plan)); });
  }
  /* plain chats from earlier this week, so History shows both kinds (no plan, nothing to book) */
  function seedChats(){
    const day = 86400000, now = Date.now();
    [['Is school open on Monday?', 'Yesterday', 1, [['me', 'Is school open on Monday?'], ['s', 'Yes. Monday, Aug 3 is a normal school day. Drop-off opens at 7:35 AM.']]],
     ['Rainy Saturday ideas', 'Sun', 3, [['me', 'Ideas for a rainy Saturday with a 5 and 7 year old?'], ['s', 'A few close to home: the children’s museum (opens 10 AM), the public library story hour at 11, or a blanket fort and a movie. Want me to plan one?'], ['me', 'Not now, thanks']]],
     ['Maya’s spelling words', 'Mon', 4, [['me', 'What are Maya’s spelling words this week?'], ['s', 'From Miss Taylor’s Friday email: cloud, proud, sound, found, mouth, south. The quiz is Friday.']]]]
    .forEach(([title, when, ago, msgs]) => {
      const p = makePlan('chat', { title, sub:title, icon:'chat' });
      Object.assign(p, { when, line: msgs[msgs.length - 1][1], started: now - ago * day, done:true });
      msgs.forEach(([who, t]) => who === 'me' ? p.me(t) : p.add(el(`<div class="row"><div class="from"><span class="orb sm"></span>Sprout</div><div class="bub">${t}</div></div>`)));
    });
    renderHome();
  }
  /* ---------- H1 (17 Nov): Accounts and cards. Every row opens a detail sheet (Ahmad picked direction A).
     Card numbers can't be edited anywhere (Stripe): a new number = add a card, remove the old one. Sprout never
     holds passwords, so "change password" happens on the provider's own site and the password manager saves it. ---------- */
  const ME = 'Tony';
  const cardSub = c => [c.nick, c.link ? 'Pay with Link' : '', c.by !== ME ? `Added by ${c.by}` : ''].filter(Boolean).join(' · ') || 'Added by you';
  const brandCls = c => (c.brand || 'Visa').toLowerCase();
  function openWallet(instant){
    const acc = wallet.accounts.length ? wallet.accounts.map((a, i) => `<button class="status wrow" data-acc="${i}"><span class="logo mono">${a.provider[0]}</span><div class="stxt"><span>${a.provider}</span><small>${a.email} · ${a.kids ? 'for ' + a.kids.join(' and ') : a.how}</small></div><i class="ph ph-caret-right wcar"></i></button>`).join('')
      : `<div class="status"><span class="icotile"><i class="ph ph-key"></i></span><div class="stxt"><span>No accounts yet</span><small>Saved here after Sprout signs a kid up</small></div></div>`;
    const cards = wallet.cards.map(c => `<button class="status wrow" data-card="${c.id}"><span class="cface sm ${brandCls(c)}"><b>${c.last4 || ''}</b></span><div class="stxt"><span>${c.label}</span><small>${c.sub = cardSub(c)}</small></div>${c.def ? '<span class="wdef">Default</span>' : ''}<i class="ph ph-caret-right wcar"></i></button>`).join('');
    const v = overlay({ title:'Accounts and cards', sub:'Saved for sign-ups and payments', id:'walletView', instant,
      body:`<div class="olabel">Provider accounts</div>${acc}<button type="button" class="wadd" data-addacc><i class="ph ph-plus"></i>Add an account<small>Camps, sports leagues, city programs</small></button><div class="olabel">Cards</div>${cards}<p class="hint2">Tap a card or an account to change it. Logins stay in your password manager; Sprout never sees a password.</p>`,
      foot:`<button type="button" class="btn" data-add>Add a card</button>` });
    const again = () => { document.querySelectorAll('#walletView').forEach(x => x.remove()); openWallet(true); };
    v.o.querySelector('[data-add]').onclick = () => addCard(c => { Object.assign(c, { brand:'Visa', last4:c.label.slice(-4), exp:'08 / 29', by:ME, used:'Not used by Sprout yet' }); c.sub = cardSub(c); v.close(); openWallet(); });
    v.o.querySelectorAll('[data-card]').forEach(b => b.onclick = () => cardSheet(wallet.cards.find(c => c.id === b.dataset.card), again));
    v.o.querySelectorAll('[data-acc]').forEach(b => b.onclick = () => accountSheet(wallet.accounts[+b.dataset.acc], again));
    v.o.querySelector('[data-addacc]').onclick = () => addAccount(again);
  }
  const act = (k, icon, t, sub = '', cls = '') => `<button type="button" class="wact ${cls}" data-a="${k}"><i class="ph ${icon}"></i><span><b>${t}</b>${sub ? `<small>${sub}</small>` : ''}</span><i class="ph ph-caret-right wcar"></i></button>`;
  function fieldsSheet(title, fields, save = 'Save', hint = ''){
    return new Promise(res => {
      const v = bsheet({ onBack:() => res(null), body:`<div class="bh"><span class="icotile"><i class="ph ph-pencil-simple"></i></span><b>${title}</b></div>
        <div class="fields" style="margin-top:0">${fields.map(([l, val, ro]) => ro
          ? `<div class="field in ro"><div style="width:100%"><div class="l">${l}</div><div class="v">${val}</div><div class="fs">${ro}</div></div><i class="ph ph-lock-simple"></i></div>`
          : `<label class="field in"><div style="width:100%"><div class="l">${l}</div><input value="${val}" autocomplete="off"></div></label>`).join('')}</div>${hint ? `<p class="hint2">${hint}</p>` : ''}`,
        foot:`<button type="button" class="btn" data-go>${save}</button>` });
      v.foot.querySelector('[data-go]').onclick = () => { const vals = [...v.body.querySelectorAll('input')].map(x => x.value.trim()); v.close(); res(vals); };
    });
  }
  function cardSheet(c, refresh){
    const mine = c.by === ME, others = wallet.cards.filter(x => x !== c);
    const v = bsheet({ body:`
      <div class="cface ${brandCls(c)}"><span class="cbrand">${c.brand}</span>${c.link ? '<span class="clink">Link</span>' : ''}<b>•••• ${c.last4}</b><small>${c.nick || (c.link ? 'Pay with Link' : '')}<em>Exp ${c.exp}</em></small></div>
      <div class="wfacts">
        <div><span>Default for payments</span><b>${c.def ? 'Yes' : 'No'}</b></div>
        <div><span>Added by</span><b>${mine ? 'You' : c.by}</b></div>
        <div><span>Last used</span><b>${c.used || 'Not used yet'}</b></div>
        ${c.uses ? `<div><span>Paying for</span><b>${c.uses}</b></div>` : ''}
      </div>
      <div class="wacts">
        ${c.def ? '' : act('def', 'ph-star', 'Set as default', 'Sprout uses it first for sign-ups and payments')}
        ${act('edit', 'ph-pencil-simple', 'Edit card', c.link ? 'Nickname here · expiry and billing in Link' : mine ? 'Nickname, name on card, expiry, billing address' : `Nickname · card details only ${c.by} can change`)}
        ${mine ? act('rm', 'ph-trash', c.link ? 'Remove from Sprout' : 'Remove card', c.link ? 'It stays in your Link wallet' : '', 'danger') : ''}
      </div>
      ${mine ? '<p class="hint2">New card number? Add it as a new card, then remove this one. Banks’ replacement cards update on their own.</p>' : `<p class="hint2">${c.by} added this card, so only ${c.by} can change its details or remove it. You can still use it, nickname it and make it your default.</p>`}` });
    const go = k => v.body.querySelector(`[data-a="${k}"]`);
    go('def') && (go('def').onclick = () => { wallet.cards.forEach(x => x.def = x === c); v.close(); toast(`${c.label} is your default`); refresh(); });
    go('edit').onclick = async () => { const r = await editCard(c, mine); if (!r) return; v.close(); toast('Card updated'); refresh(); cardSheet(c, refresh); };
    go('rm') && (go('rm').onclick = () => { v.close(); removeCard(c, others, refresh); });
  }
  /* H3: one Edit card sheet for every card. The number is always locked (Stripe can't change it).
     Your own card: nickname + name, expiry, billing. Link card: nickname here, the rest lives in your Link wallet.
     Dana's card: nickname only; the details are Dana's to change. */
  function editCard(c, mine){
    return new Promise(res => {
      const b = c.bill || ['Tony Martin', '', ''];
      const lock = (l, v, why) => `<div class="field in ro"><div style="width:100%"><div class="l">${l}</div><div class="v">${v}</div>${why ? `<div class="fs">${why}</div>` : ''}</div><i class="ph ph-lock-simple"></i></div>`;
      const inp = (l, v, k) => `<label class="field in"><div style="width:100%"><div class="l">${l}</div><input data-k="${k}" value="${v}" autocomplete="off"></div></label>`;
      const full = mine && !c.link;
      const v = bsheet({ onBack:() => res(null), body:`<div class="bh"><span class="icotile"><i class="ph ph-pencil-simple"></i></span><b>Edit card</b></div>
        <div class="fields" style="margin-top:0">
          ${inp('Nickname (only in Sprout)', c.nick || '', 'nick')}
          ${lock('Card number', `${c.brand} •••• ${c.last4}`, 'Can’t be changed. Add a new card instead.')}
          ${full ? inp('Name on card', b[0], 'name') + inp('Expires (MM / YY)', c.exp, 'exp') + inp('Billing address', b[1], 'street') + inp('ZIP code', b[2], 'zip')
            : lock('Expiry and billing address', `Exp ${c.exp}`, c.link ? 'Kept in your Link wallet' : `Only ${c.by} can change these`)}
        </div>
        ${c.link ? '<button type="button" class="wlinkbtn" data-link><i class="ph ph-arrow-square-out"></i>Update expiry or billing in Link</button>' : ''}`,
        foot:`<button type="button" class="btn" data-go>Save changes</button>` });
      v.body.querySelector('[data-link]')?.addEventListener('click', () => toast('Opens link.com, where your Link wallet lives'));
      v.foot.querySelector('[data-go]').onclick = () => {
        const val = k => v.body.querySelector(`[data-k="${k}"]`)?.value.trim();
        c.nick = val('nick') || ''; c.sub = cardSub(c);
        if (full) { c.exp = val('exp') || c.exp; c.bill = [val('name'), val('street'), val('zip')]; }
        v.close(); res(true);
      };
    });
  }
  function removeCard(c, others, refresh){
    const swap = c.uses && others[0];
    const v = bsheet({ body:`<div class="bh"><span class="icotile warn"><i class="ph ph-trash"></i></span><b>${c.link ? 'Remove from Sprout?' : 'Remove this card?'}</b></div>
        <p class="bp">${c.label}${c.link ? ' stays in your Link wallet. Sprout just stops using it.' : ' is removed from Sprout for you and Dana. You can add it again anytime.'}</p>
        ${c.uses ? `<div class="wwarn"><i class="ph ph-warning-circle"></i><span>It’s paying for <b>${c.uses}</b>.${swap ? ` I’ll move that to ${swap.label}.` : ' Add another card first.'}</span></div>` : ''}
        ${c.def && others[0] ? `<p class="bp" style="margin-top:8px">${others[0].label} becomes your default.</p>` : ''}`,
      stack:true, foot:`<button type="button" class="btn danger" data-go ${c.uses && !swap ? 'disabled' : ''}>${swap ? `Move it and remove` : 'Remove'}</button><button type="button" class="textbtn" data-no>Keep it</button>` });
    v.foot.querySelector('[data-no]').onclick = () => v.close();
    v.foot.querySelector('[data-go]').onclick = () => {
      if (swap) { swap.uses = c.uses; }
      wallet.cards.splice(wallet.cards.indexOf(c), 1);
      if (c.def && wallet.cards[0]) wallet.cards.forEach((x, i) => x.def = i === 0);
      v.close(); toast(swap ? `Removed. ${c.uses.split(',')[0]} now uses ${swap.label}` : 'Card removed'); renderHome(); refresh();
    };
  }
  /* ---------- H5: add a provider account (direction C: search + In your email + platforms + any website) ---------- */
  const PLATFORMS = [
    { n:'LeagueApps', site:'leagueapps.com', s:'Youth sports leagues and clubs' },
    { n:'Sawyer', site:'hisawyer.com', s:'Camps, classes and after-school' },
    { n:'TeamSnap', site:'teamsnap.com', s:'Team schedules and registration' },
    { n:'CampMinder', site:'campminder.com', s:'Summer and day camps' },
    { n:'i9 Sports', site:'i9sports.com', s:'Rec sports leagues' },
  ];
  /* registration emails Gmail already found (Gmail is connected in onboarding) */
  const FOUND = [
    { n:'LeagueApps', site:'leagueapps.com', mail:'“Registration confirmed: Fall soccer U8” · Sep 2', kids:['Jake'] },
    { n:'Sawyer', site:'hisawyer.com', mail:'“Your receipt: Clay studio camp” · Jun 12', kids:['Maya'] },
  ];
  const dismissed = new Set();
  const KID_LIST = [{ n:'Maya', age:7, img:A + 'maya.webp' }, { n:'Jake', age:5, img:A + 'jake.webp' }];
  const has = n => wallet.accounts.some(a => a.provider.toLowerCase() === n.toLowerCase());
  function addAccount(refresh){
    const v = overlay({ title:'Add an account', sub:'A site where you sign your kids up', id:'addAccView',
      body:`<label class="wsearch"><i class="ph ph-magnifying-glass"></i><input data-q placeholder="Search or paste a website" autocomplete="off"></label><div data-list></div>
        <p class="hint2">Sprout signs in on the site with your password manager, so it can register your kids for you. It never sees the password.</p>` });
    const list = v.o.querySelector('[data-list]'), q = v.o.querySelector('[data-q]');
    const row = (p, k, extra = '') => `<button type="button" class="status wrow" data-pick="${k}"><span class="logo mono">${p.n[0]}</span><div class="stxt"><span>${p.n}</span><small>${extra || p.s || p.site}</small></div><i class="ph ph-caret-right wcar"></i></button>`;
    const paint = () => {
      const t = q.value.trim().toLowerCase(), m = p => !t || p.n.toLowerCase().includes(t) || p.site.includes(t) || (p.s || p.mail || '').toLowerCase().includes(t);
      const found = FOUND.filter(f => !has(f.n) && !dismissed.has(f.n) && m(f));
      const plats = PLATFORMS.filter(p => !has(p.n) && !found.some(f => f.n === p.n) && m(p));
      const looksLikeSite = /\.[a-z]{2,}/.test(t);
      list.innerHTML = (found.length ? `<div class="olabel gm"><img src="${A}gmail.svg" alt="">In your email</div>${found.map(f => `<div class="wfound">${row(f, 'f:' + f.n, f.mail)}<button type="button" class="wdis" data-dis="${f.n}" aria-label="Not mine"><i class="ph ph-x"></i></button></div>`).join('')}` : '')
        + (plats.length ? `<div class="olabel">Sites parents use</div>${plats.map(p => row(p, 'p:' + p.n)).join('')}` : '')
        + `<div class="olabel">Somewhere else</div><button type="button" class="status wrow" data-pick="other"><span class="icotile"><i class="ph ph-globe-simple"></i></span><div class="stxt"><span>${looksLikeSite ? `Use ${t}` : 'Another website'}</span><small>${looksLikeSite ? 'Sign in on this site' : 'Your school district, a local camp, a club'}</small></div><i class="ph ph-caret-right wcar"></i></button>`;
      list.querySelectorAll('[data-dis]').forEach(b => b.onclick = () => { dismissed.add(b.dataset.dis); toast('Hidden. Sprout won’t suggest it again.'); paint(); });
      list.querySelectorAll('[data-pick]').forEach(b => b.onclick = async () => {
        const k = b.dataset.pick;
        let p = k.startsWith('f:') ? FOUND.find(f => f.n === k.slice(2)) : k.startsWith('p:') ? PLATFORMS.find(x => x.n === k.slice(2)) : null;
        if (!p) p = await otherSite(looksLikeSite ? t : '');
        if (!p) return;
        const ok = await linkAccount(p);
        if (ok) { v.close(); refresh(); toast(`${p.n} added`); }
      });
    };
    q.oninput = paint; paint();
  }
  function otherSite(prefill){
    return new Promise(res => {
      const v = bsheet({ onBack:() => res(null), body:`<div class="bh"><span class="icotile"><i class="ph ph-globe-simple"></i></span><b>Another website</b></div>
        <div class="fields" style="margin-top:0"><label class="field in"><div style="width:100%"><div class="l">Website</div><input data-site value="${prefill || 'austinnaturecamp.org'}" autocomplete="off" inputmode="url"></div></label>
        <label class="field in"><div style="width:100%"><div class="l">What to call it</div><input data-name value="" placeholder="Austin Nature Camp" autocomplete="off"></div></label></div>`,
        foot:`<button type="button" class="btn" data-go>Continue</button>` });
      v.foot.querySelector('[data-go]').onclick = () => { const site = v.body.querySelector('[data-site]').value.trim().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
        if (!site) return toast('Add the website first');
        const n = v.body.querySelector('[data-name]').value.trim() || site.split('.')[0].replace(/^\w/, c => c.toUpperCase());
        v.close(); res({ n, site, s:site }); };
    });
  }
  /* sign in (password manager) -> Sprout checks the login on their site -> which kids -> saved.
     CampMinder shows the failure path once: the site asks for a code. */
  async function linkAccount(p){
    for (let attempt = 0; ; attempt++) {
      const login = await passwordSheet(p.n, p.site, 'your kids'); if (!login) return false;
      const fail = p.n === 'CampMinder' && attempt === 0;
      const r = await checkSheet(p, fail);
      if (r === 'ok') break;
      if (r === 'site') { toast(`Opens ${p.site}. Sign in there, then come back and try again.`); continue; }
      if (r !== 'retry') return false;
    }
    const kids = await kidsFor(p); if (!kids) return false;
    wallet.accounts.push({ provider:p.n, site:p.site, email:'tony@martinfam.com', how:'Your existing login', kids, used:'Not used by Sprout yet' });
    renderHome(); return true;
  }
  function checkSheet(p, fail){
    return new Promise(res => {
      const v = bsheet({ onBack:() => res(null), body:`<div class="wcheck"><span class="spinner"></span><b>Checking your login on ${p.site}</b><small>This takes a few seconds</small></div>` });
      setTimeout(() => {
        if (!fail) { v.body.innerHTML = `<div class="wcheck ok"><span class="icotile"><i class="ph-bold ph-check"></i></span><b>Signed in to ${p.n}</b><small>Sprout can register your kids there now</small></div>`;
          setTimeout(() => { v.close(); res('ok'); }, 900); return; }
        v.body.innerHTML = `<div class="bh"><span class="icotile warn"><i class="ph ph-warning-circle"></i></span><b>${p.n} asked for a code</b></div>
          <p class="bp">${p.site} sent a sign-in code to your email. Sprout can’t read codes for you. Sign in once on their site, then try again here. Nothing was saved yet.</p>`;
        v.o.appendChild(el(`<div class="bfoot stack"><button type="button" class="btn" data-r>Try again</button><button type="button" class="textbtn" data-s>Sign in on ${p.site}</button></div>`));
        v.o.querySelector('[data-r]').onclick = () => { v.close(); res('retry'); };
        v.o.querySelector('[data-s]').onclick = () => { v.close(); res('site'); };
      }, 1300);
    });
  }
  function kidsFor(p){
    return new Promise(res => {
      const pre = p.kids || KID_LIST.map(k => k.n);
      const v = bsheet({ onBack:() => res(null), body:`<div class="bh"><span class="icotile"><i class="ph ph-users"></i></span><b>Who is ${p.n} for?</b></div>
        <p class="bp">Sprout uses this account when it signs ${p.kids ? p.kids.join(' and ') : 'them'} up${p.kids ? ' (from your email)' : ''}.</p>
        <div class="ua-rows">${KID_LIST.map(k => `<button type="button" class="ua-row${pre.includes(k.n) ? ' on' : ''}" data-n="${k.n}"><span class="uaph" style="background-image:url(${k.img})"></span><span class="tx"><b>${k.n}</b><small>${k.age}</small></span><span class="ck"><i class="ph-bold ph-check"></i></span></button>`).join('')}</div>`,
        foot:`<button type="button" class="btn" data-go>Save account</button>` });
      const btn = v.foot.querySelector('[data-go]'), rows = [...v.body.querySelectorAll('.ua-row')];
      const sel = () => rows.filter(r => r.classList.contains('on')).map(r => r.dataset.n);
      rows.forEach(r => r.onclick = () => { r.classList.toggle('on'); btn.disabled = !sel().length; });
      btn.onclick = () => { const n = sel(); if (!n.length) return; v.close(); res(n); };
    });
  }
  function accountSheet(a, refresh){
    const v = bsheet({ body:`
      <div class="ahead"><span class="logo mono">${a.provider[0]}</span><div><b>${a.provider}</b><small>${a.site}</small></div></div>
      <div class="wfacts">
        <div><span>Login</span><b>${a.email}</b></div>
        <div><span>Password</span><b>In your password manager</b></div>
        <div><span>Used for</span><b>${a.kids ? a.kids.join(' and ') : 'Sign-ups'}</b></div>
        <div><span>Last used</span><b>${a.used || 'Just now'}</b></div>
      </div>
      <div class="wacts">
        ${act('pw', 'ph-password', `Change password on ${a.site}`, 'Your password manager saves the new one')}
        ${act('login', 'ph-user-switch', 'Use a different login', 'Sign in with another account for this site')}
        ${act('rm', 'ph-sign-out', 'Remove from Sprout', 'Your account at ' + a.provider + ' stays', 'danger')}
      </div>
      <p class="hint2">Sprout keeps which login to use so it can register your kids again next season. It never sees the password.</p>` });
    v.body.querySelector('[data-a=pw]').onclick = () => toast(`Opens ${a.site} to change it. Your password manager saves the new one.`);
    v.body.querySelector('[data-a=login]').onclick = async () => { v.close(); const login = await passwordSheet(a.provider, a.site, (a.kids || ['your kids'])[0]);
      if (login) { a.email = login; a.how = 'Your existing login'; toast('Login updated'); refresh(); } accountSheet(a, refresh); };
    v.body.querySelector('[data-a=rm]').onclick = () => { v.close();
      const c = bsheet({ stack:true, body:`<div class="bh"><span class="icotile warn"><i class="ph ph-sign-out"></i></span><b>Remove ${a.provider}?</b></div>
          <p class="bp">Sprout forgets this sign-in. Your account at ${a.provider} and the saved password stay as they are. Next time, Sprout asks you to sign in again.</p>`,
        foot:`<button type="button" class="btn danger" data-go>Remove from Sprout</button><button type="button" class="textbtn" data-no>Keep it</button>` });
      c.foot.querySelector('[data-no]').onclick = () => c.close();
      c.foot.querySelector('[data-go]').onclick = () => { wallet.accounts.splice(wallet.accounts.indexOf(a), 1); c.close(); toast(`${a.provider} removed from Sprout`); renderHome(); refresh(); };
    };
  }

  /* ---------- sheet + views ---------- */
  function hideAll(){ homeView.hidden = true; plans.forEach(p => p.chat.hidden = true); }
  function showHome(){ hideAll(); current = null; homeView.hidden = false; homeView.scrollTop = 0; hsub.textContent = 'Here for you and Dana'; renderHome(); syncOrb(); applyComposer(); }
  function showPlan(p){ if (!p) return showHome(); hideAll(); current = p; p.chat.hidden = false; hsub.textContent = p.sub; p.attnSeen = true; if (p.attn) { p.attn = false; renderHome(); } syncOrb(); applyComposer(); p.scroll(); }
  function openSheet(){ sheet.classList.add('on'); scrim.classList.add('on'); }
  function closeSheet(){
    sheet.classList.remove('on'); scrim.classList.remove('on');
    if (S.sscDone && !S.briefShowsDone) { S.briefShowsDone = true; renderPromo(); renderDay(); $('#brief').scrollTo({ top:0, behavior:'smooth' }); }
  }
  $('#close').onclick = closeSheet; scrim.onclick = closeSheet;
  $('#historyBtn').onclick = openHistory;
  seedChats();
  $('#assistBtn').onclick = () => { if (pendingOpen) { showPlan(pendingOpen); pendingOpen = null; } else showHome(); openSheet(); };

  /* a plan needs the parent while Assist is closed: badge + peek on the clover (approved navbar motion) */
  function notify(p, title, sub){
    p.attn = true; renderHome();
    if (sheet.classList.contains('on') && current === p) { p.attn = false; renderHome(); return; }
    pendingOpen = p;
    if (!sheet.classList.contains('on') && window.sproutNotify) window.sproutNotify(title, sub);
  }

  const flows = {};
  const META = {
    sports: { title:'Fall soccer · Jake', sub:'Fall soccer · Jake', icon:'sports' },
    camps: { title:'Summer camp · Maya', sub:'Summer camps · Maya', icon:'camps' },
    ownSitters: { title:'Sitter for Saturday', sub:'Sitter · Sat, Aug 1', icon:'person-plus' },
    classSitters: { title:'Sitter from class families', sub:'Sitter · Sat, Aug 1', icon:'two-people' },
    nightOut: { title:'Night out · Sat, Aug 1', sub:'Night out · Sat, Aug 1', icon:'calendar-check' },
    dateA: { title:'Date night', sub:'Date night', icon:'calendar-check' },
    dateB: { title:'Date night', sub:'Date night', icon:'calendar-check' },
    dateD: { title:'Date night · Sat, Aug 1', sub:'Date night · Sat, Aug 1', icon:'calendar-check' },
    sitterC1: { title:'Book a sitter', sub:'Book a sitter', icon:'person-plus' },
    dateE: { title:'Date night', sub:'Plan a date night', icon:'calendar-check' },
    shareSitter: { title:'Help Tony find a sitter', sub:'Tony is looking for a sitter', icon:'two-people' },
    event: { title:'New event', sub:'Plan an event', icon:'event' },
    playdate: { title:'Playdate', sub:'Plan a playdate', icon:'calendar-check' },
    party: { title:'Birthday party', sub:'Plan a birthday', icon:'event' },
    afterschool: { title:'After school', sub:'After school', icon:'afterschool' },
    tutoring: { title:'Tutoring', sub:'Tutoring', icon:'tutoring' },
    club: { title:'New club', sub:'Start a club', icon:'club' },
  };
  /* start a flow without opening Assist: the plan's chat fills in the background (ongoing sessions review state) */
  function startQuiet(kind, opt = {}){
    const m = META[kind], p = makePlan(kind, { title: m.title, sub: m.sub, icon: m.icon });
    if (opt.echo) p.me(opt.echo);
    flows[kind](p, opt);
    return p;
  }
  async function start(kind, opt = {}){
    if (!flows[kind]) return notInDemo();
    const m = META[kind];
    const p = makePlan(kind, { title: m.title, sub: m.sub, icon: m.icon });
    showPlan(p); openSheet();
    await sleep(450);
    if (opt.echo) { p.me(opt.echo); await sleep(250); }
    flows[kind](p, opt);
    return p;
  }

  /* ---------- Daily Brief top (SSC: greeting d2, weather w3, banner a7 k9 calm) ---------- */
  const S = { sscDone:false, briefShowsDone:false };
  const SUN = id => `<svg viewBox="0 0 32 32" aria-hidden="true"><defs><radialGradient id="b${id}" cx=".36" cy=".32" r=".8"><stop offset="0" stop-color="#FFF1B0"/><stop offset=".45" stop-color="#FFC94A"/><stop offset="1" stop-color="#F09A1A"/></radialGradient><linearGradient id="r${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFD15C"/><stop offset="1" stop-color="#F5A623"/></linearGradient><filter id="s${id}" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy=".8" stdDeviation=".8" flood-color="#C9700A" flood-opacity=".35"/></filter></defs><g fill="url(#r${id})">${[0,45,90,135,180,225,270,315].map(a => `<rect x="14.6" y="1.6" width="2.8" height="5.4" rx="1.4" transform="rotate(${a} 16 16)"/>`).join('')}</g><circle cx="16" cy="16" r="8.2" fill="url(#b${id})" filter="url(#s${id})"/><ellipse cx="13.3" cy="12.6" rx="2.6" ry="1.7" fill="#fff" opacity=".55" transform="rotate(-30 13.3 12.6)"/></svg>`;
  function renderDay(){ $('#daySlot').innerHTML = `<div class="day"><span class="hi">Morning, Tony</span><span class="wx3" aria-label="Sunny, low 78, high 98">${SUN(3)}<b>78–98°</b><span>Sunny</span></span></div>`; }
  function renderPromo(){
    const done = S.briefShowsDone, CLOVER = `<img src="${A}assist-clover.webp" alt="">`, SK = `<img class="sk" src="${A}ssc-logo.webp" alt="SSC Kids">`;
    const field = `<svg class="field" viewBox="0 0 343 152" preserveAspectRatio="xMaxYMid slice" aria-hidden="true"><g fill="none" stroke="var(--lines)" stroke-width="2"><circle cx="300" cy="76" r="54"/><line x1="300" y1="-10" x2="300" y2="170"/><circle cx="300" cy="76" r="3" fill="var(--lines)"/></g></svg>`;
    $('#promoSlot').innerHTML = `<button class="promo a7 k9 calm${done ? '' : ' nudge'}" data-go aria-label="${done ? 'Jake is registered' : 'Soccer sign-ups open'}">${field}<span class="glow"></span><img class="kid7" src="${A}kid-cutout.webp" alt=""><span class="shine"></span><div class="txt"><div class="eb">${SK}SSC Kids<span class="due">${done ? '<i class="ph-bold ph-check"></i>Paid' : '<i class="ph-bold ph-clock"></i>Closes Aug 16'}</span></div><div class="pt">${done ? 'Jake is registered' : 'Soccer sign-ups open'}</div><div class="who"><span><i style="background-image:url(${A}priya.webp)"></i><i style="background-image:url(${A}aisha.webp)"></i>${done ? '' : '<i class="n">+2</i>'}</span>${done ? 'Team with Leo and Ava' : '4 classmates going'}</div><span class="cta">${done ? '<i class="ph ph-receipt"></i>' : CLOVER}${done ? 'See receipt' : 'Sign Jake up · $135'}<i class="ph-bold ph-caret-right"></i></span></div></button>`;
    $('#promoSlot [data-go]').onclick = () => {
      const sp = plans.find(p => p.kind === 'sports');
      if (sp) { showPlan(sp); openSheet(); } else start('sports');
    };
  }
  renderDay(); renderPromo(); renderHome(); hideAll(); homeView.hidden = false;

  /* desktop review: shrink the phone to fit short screens (SSC) */
  const fit = () => { const ph = $('#phone'); if (innerWidth < 600) { ph.style.transform = ''; return; } const k = Math.min(1, (innerHeight - 48) / 874); ph.style.transform = k < 1 ? `scale(${k})` : ''; ph.style.margin = k < 1 ? `${-(1 - k) * 852 / 2}px ${-(1 - k) * 393 / 2}px` : ''; };
  addEventListener('resize', fit); fit();
  document.addEventListener('gesturestart', e => e.preventDefault());
  $('#restartBtn').onclick = () => location.reload();

  return { pace: v => { PACE = v; }, startQuiet, TILES, $, sleep, el, toast, notInDemo, makePlan, start, flows, ask, addField, fieldRow, editHint, overlay, bsheet, faceId, approval, confirmSitter, closeSheet, providerAccount, wallet, notify, renderHome, renderPromo, renderDay, S, A, showPlan, showHome, openSheet, pickCard, openWallet, isOpen: () => sheet.classList.contains('on') };
})();

/* notched bar edge (SSC, same geometry), redrawn on resize */
(function(){ const nav = document.querySelector('.nav'), svg = nav.querySelector('.notch');
  function draw(){ const W = nav.clientWidth, H = nav.clientHeight, cx = W / 2, r = 32, gap = 6, f = 10;
    const R = r + gap, d = Math.sqrt((R + f) ** 2 - f * f), k = R / (R + f), lx = cx - d, rx = cx + d, tx = d * k, ty = f * k;
    const top = y => `M0,${y} L${lx},${y} A${f},${f} 0 0 1 ${cx - tx},${ty + y} A${R},${R} 0 0 0 ${cx + tx},${ty + y} A${f},${f} 0 0 1 ${rx},${y} L${W},${y}`;
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.querySelector('.notch-fill').setAttribute('d', top(0) + ` L${W},${H} L0,${H} Z`); svg.querySelector('.notch-edge').setAttribute('d', top(.5)); }
  draw(); addEventListener('resize', draw); })();
