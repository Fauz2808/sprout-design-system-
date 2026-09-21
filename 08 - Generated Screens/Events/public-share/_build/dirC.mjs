import {I,panel,page,write} from './lib.mjs';

const css=`
.pgC{padding:18px 16px 0}
.sender{display:flex;align-items:center;gap:10px;margin-bottom:15px}
.sender .av{width:30px;height:30px;font-size:11px}
.sender .t{font-size:12.5px;color:var(--muted);line-height:1.4}
.sender .t b{font-weight:600;color:var(--body)}
.titleC{font-family:var(--serif);font-weight:600;font-size:26px;line-height:33px;color:var(--ink);letter-spacing:-.3px}
.metaC{margin-top:11px;display:flex;flex-direction:column;gap:6px}
.metaC .m{display:flex;align-items:center;gap:8px;font-size:12.5px;color:var(--body);line-height:1.4}
.metaC .m .ic{width:14px;height:14px;color:var(--brand-mid);flex-shrink:0}
.decide{background:var(--surface);border-radius:20px;box-shadow:var(--shadow-l);padding:17px 16px 16px;margin-top:19px}
.decide .dh{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;gap:8px}
.decide .dh .t{font-family:var(--serif);font-weight:600;font-size:17px;color:var(--ink);line-height:1.3}
.decide .dh .b{background:var(--brand-light);color:var(--brand);font-size:9px;font-weight:700;letter-spacing:.8px;
  text-transform:uppercase;padding:4.5px 9px;border-radius:99px;white-space:nowrap;flex-shrink:0}
.fld{margin-bottom:10px}
.fld label{display:block;font-size:9.5px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:var(--subtlest);margin-bottom:5px}
.fld .inp{background:#f7f5f0;border:1px solid #e6e1d5;border-radius:12px;padding:12.5px 14px;font-size:14px;color:var(--ink);line-height:1.35}
.fld .inp.ph{color:#b3ad9e}
.fld .inp.cur{border-color:var(--brand-mid);box-shadow:0 0 0 3px rgba(87,154,116,.14);position:relative}
.fld .inp.cur::after{content:'';display:inline-block;width:1.5px;height:16px;background:var(--brand);vertical-align:-3px;margin-left:1px}
.stepper{display:flex;align-items:center;justify-content:space-between;background:#f7f5f0;border:1px solid #e6e1d5;
  border-radius:12px;padding:8px 8px 8px 14px;margin-bottom:15px}
.stepper .l{font-size:13px;color:var(--body)}
.stepper .l i{display:block;font-style:normal;font-size:10.5px;color:var(--subtlest);margin-top:1px}
.stepper .g{display:flex;align-items:center;gap:3px}
.stepper .g b{width:26px;text-align:center;font-family:var(--sans);font-size:15px;font-weight:600;color:var(--ink);font-variant-numeric:lining-nums tabular-nums}
.stepper .g span{width:30px;height:30px;border-radius:9px;background:#fff;border:1px solid #e6e1d5;display:grid;place-items:center;color:var(--brand)}
.stepper .g span.off{color:#c8c2b4}
.stepper .g span .ic{width:13px;height:13px}
.ordiv{display:flex;align-items:center;gap:11px;margin:15px 0 14px}
.ordiv::before,.ordiv::after{content:'';flex:1;height:1px;background:var(--line)}
.ordiv span{font-size:9.5px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--subtlest)}
.trust{display:flex;align-items:flex-start;gap:7px;margin-top:14px;padding:0 4px}
.trust .ic{width:13px;height:13px;color:var(--subtlest);margin-top:2px;flex-shrink:0}
.trust p{font-size:11px;line-height:16.5px;color:var(--subtlest)}
.knownrow{display:flex;align-items:center;gap:11px;background:#f7f5f0;border:1px solid #e6e1d5;border-radius:14px;padding:11px 13px;margin-bottom:14px}
.knownrow .av{width:38px;height:38px;font-size:14px}
.knownrow .t{flex:1;min-width:0}
.knownrow .n{font-size:13.5px;font-weight:600;color:var(--ink);line-height:1.3}
.knownrow .e{font-size:11.5px;color:var(--subtlest);margin-top:1px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.knownrow .x{font-size:11.5px;font-weight:600;color:var(--brand);text-decoration:underline;text-underline-offset:2px;flex-shrink:0}
.secC{margin-top:27px}
.secC .lbl{font-size:9.5px;font-weight:700;letter-spacing:1.6px;text-transform:uppercase;color:var(--subtlest);margin-bottom:12px}
.goC{display:flex;align-items:center;gap:12px}
.stackC{display:flex}
.stackC .av{width:36px;height:36px;font-size:12.5px;border:2.5px solid var(--bg);margin-left:-11px}
.stackC .av:first-child{margin-left:0}
.stackC .more{width:36px;height:36px;border-radius:50%;background:var(--l1);border:2.5px solid var(--bg);margin-left:-11px;
  display:grid;place-items:center;font-size:10.5px;font-weight:600;color:var(--muted)}
.goC .gt{font-size:12.5px;color:var(--muted);line-height:1.45}
.goC .gt b{font-weight:600;color:var(--body)}
.disc{border-top:1px solid var(--line)}
.disc .r{display:flex;align-items:center;gap:12px;padding:15px 2px;border-bottom:1px solid var(--line)}
.disc .r .bub{width:30px;height:30px;border-radius:9px;background:var(--brand-light);display:grid;place-items:center;color:var(--brand);flex-shrink:0}
.disc .r .bub .ic{width:16px;height:16px}
.disc .r .tx{flex:1;min-width:0}
.disc .r .t1{font-size:13.5px;font-weight:600;color:var(--ink);line-height:1.35}
.disc .r .t2{font-size:11.5px;color:var(--muted);margin-top:1px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.disc .r .cr{color:var(--border);flex-shrink:0}
.disc .body{padding:0 2px 16px}
.disc .body p{font-size:13px;line-height:21px;color:var(--body)}
`;

const av=(i,s,bg)=>`<div class="av" style="width:${s}px;height:${s}px;font-size:${Math.round(s*0.38)}px${bg?';background:'+bg:''}">${i}</div>`;
const G=['linear-gradient(150deg,#7e6154,#b39e95)','linear-gradient(150deg,#234a63,#3a7ca5)','linear-gradient(150deg,#375337,#5c8a5c)','linear-gradient(150deg,#7f600e,#d4a017)'];

const appBanner=(what)=>`<div class="appbanner">
  <div class="ico">🍀</div>
  <div class="tx"><div class="t1">You have Sprout installed</div><div class="t2">This ${what} is already in your app</div></div>
  <div class="op">Open</div>
</div>`;

const sfoot=`<div class="sfoot" style="margin:4px 16px 0"><div class="mk">🍀</div>
  <div class="t">Invites run on <b>Sprout</b> · joinsprout.co</div></div>`;

/* ── EVENT proof (below the fold) ── */
const eventProof=`
  <div class="secC">
    <div class="lbl">Already in</div>
    <div class="goC">
      <div class="stackC">${av('TM',36)}${av('DR',36,G[0])}${av('JC',36,G[1])}${av('MK',36,G[2])}<div class="more">+8</div></div>
      <div class="gt"><b>12 dads</b> have said yes<br>4 spots left before the tee sheet closes</div>
    </div>
  </div>
  <div class="secC">
    <div class="disc">
      <div class="r"><div class="bub">${I('Sparkle')}</div>
        <div class="tx"><div class="t1">About this event</div></div>${I('CaretDown',15,'cr')}</div>
      <div class="body" style="padding-top:14px"><p>Four-man scramble, shotgun start at 8:00 sharp. $45 a player covers the cart and range balls. All skill levels welcome — we're here for the hang, not the handicap. Breakfast tacos on the patio after.</p></div>
      <div class="r"><div class="bub">${I('MapPin')}</div>
        <div class="tx"><div class="t1">Grey Rock Golf Club</div><div class="t2">7401 Highway 45, Austin TX · 14 min away</div></div>${I('CaretRight',15,'cr')}</div>
      <div class="r"><div class="bub">${I('User')}</div>
        <div class="tx"><div class="t1">Tony Martin</div><div class="t2">Organizer · Circle C Dads</div></div>${I('CaretRight',15,'cr')}</div>
      <div class="r" style="border-bottom:0"><div class="bub">${I('UsersThree')}</div>
        <div class="tx"><div class="t1">Circle C Dads</div><div class="t2">34 members · the club behind this event</div></div>${I('CaretRight',15,'cr')}</div>
    </div>
  </div>`;

const eventHead=`
  <div class="sender">${av('TM',30)}<div class="t"><b>Tony Martin</b> invited you to</div></div>
  <h1 class="titleC">Dads' Golf Scramble</h1>
  <div class="metaC">
    <div class="m">${I('CalendarBlank')}Saturday, September 19 · in 5 days</div>
    <div class="m">${I('Clock')}8:00 – 11:30 AM · shotgun start</div>
    <div class="m">${I('MapPin')}Grey Rock Golf Club, Austin TX</div>
  </div>`;

const eventCold=`<div class="pgC">
  ${eventHead}
  <div class="decide">
    <div class="dh"><div class="t">Count me in</div><div class="b">No account needed</div></div>
    <div class="fld"><label>Your name</label><div class="inp cur">Marcus Reyes</div></div>
    <div class="fld"><label>Email</label><div class="inp ph">so Tony can reach you</div></div>
    <div class="stepper"><div class="l">Bringing anyone?<i>Guests are welcome</i></div>
      <div class="g"><span class="off">${I('Minus')}</span><b>0</b><span>${I('Plus')}</span></div></div>
    <button class="btn">RSVP — I'm in</button>
    <div class="ordiv"><span>or</span></div>
    <button class="btn ghost">${I('DeviceMobile',17)}Open in the Sprout app</button>
  </div>
  <div class="trust">${I('Lock')}<p>Your email goes to Tony and the club organizers only. No newsletter, no sharing — and you can pull your RSVP any time from this same link.</p></div>
  ${eventProof}
</div>${sfoot}`;

const eventApp=`${appBanner('event')}<div class="pgC">
  ${eventHead}
  <div class="decide">
    <div class="dh"><div class="t">Count me in</div><div class="b">One tap</div></div>
    <div class="knownrow">${av('MR',38,G[1])}
      <div class="t"><div class="n">Marcus Reyes</div><div class="e">marcus.r@gmail.com</div></div>
      <div class="x">Not you?</div></div>
    <div class="stepper"><div class="l">Bringing anyone?<i>Guests are welcome</i></div>
      <div class="g"><span class="off">${I('Minus')}</span><b>0</b><span>${I('Plus')}</span></div></div>
    <button class="btn">RSVP — I'm in</button>
    <div class="ordiv"><span>or</span></div>
    <button class="btn ghost">${I('ArrowSquareOut',17)}Open in the Sprout app</button>
  </div>
  <div class="trust">${I('CheckCircle')}<p>We recognised you from the Sprout app, so there's nothing to fill in. RSVP here and it shows up in your app within seconds.</p></div>
  ${eventProof}
</div>${sfoot}`;

/* ── CLUB ── */
const clubProof=`
  <div class="secC">
    <div class="lbl">Who's already in</div>
    <div class="goC">
      <div class="stackC">${av('TM',36)}${av('DR',36,G[0])}${av('JC',36,G[1])}${av('MK',36,G[2])}<div class="more">+30</div></div>
      <div class="gt"><b>34 dads</b> from the neighborhood<br>Tony started it in March 2024</div>
    </div>
  </div>
  <div class="secC">
    <div class="disc">
      <div class="r"><div class="bub">${I('Sparkle')}</div>
        <div class="tx"><div class="t1">What this club is</div></div>${I('CaretDown',15,'cr')}</div>
      <div class="body" style="padding-top:14px"><p>A social club for the dads of Circle C Ranch — an easy way to connect and build some real friendships. Standing golf games, patio nights, and the occasional pickleball beating. No dues, no committees, just show up.</p></div>
      <div class="r"><div class="bub">${I('CalendarBlank')}</div>
        <div class="tx"><div class="t1">3 events coming up</div><div class="t2">Golf Sep 19 · Patio night Oct 4 · Pickleball Oct 18</div></div>${I('CaretRight',15,'cr')}</div>
      <div class="r"><div class="bub">${I('Tag')}</div>
        <div class="tx"><div class="t1">Hangouts · Dranks · Dads</div><div class="t2">and 3 more — Social, Golf, Pickleball</div></div>${I('CaretRight',15,'cr')}</div>
      <div class="r" style="border-bottom:0"><div class="bub">${I('User')}</div>
        <div class="tx"><div class="t1">Tony Martin</div><div class="t2">Organizer · approves new members</div></div>${I('CaretRight',15,'cr')}</div>
    </div>
  </div>`;

const clubHead=`
  <div class="sender">${av('TM',30)}<div class="t"><b>Tony Martin</b> invited you to join</div></div>
  <h1 class="titleC">Circle C Dads</h1>
  <div class="metaC">
    <div class="m">${I('UsersThree')}34 members · Circle C Ranch, Austin TX</div>
    <div class="m">${I('CalendarBlank')}Next up: Dads' Golf Scramble, Sep 19</div>
    <div class="m">${I('Lock')}Private club · Tony approves new members</div>
  </div>`;

const clubCold=`<div class="pgC">
  ${clubHead}
  <div class="decide">
    <div class="dh"><div class="t">Ask to join</div><div class="b">No account needed</div></div>
    <div class="fld"><label>Your name</label><div class="inp cur">Marcus Reyes</div></div>
    <div class="fld"><label>Email</label><div class="inp ph">so Tony can let you in</div></div>
    <div class="fld" style="margin-bottom:15px"><label>Which street are you on? <span style="text-transform:none;letter-spacing:0;font-weight:400">optional</span></label><div class="inp ph">helps Tony place you</div></div>
    <button class="btn">Ask to join</button>
    <div class="ordiv"><span>or</span></div>
    <button class="btn ghost">${I('DeviceMobile',17)}Open in the Sprout app</button>
  </div>
  <div class="trust">${I('Lock')}<p>Tony sees your request and lets you in — usually the same day. Your email stays with the club organizers.</p></div>
  ${clubProof}
</div>${sfoot}`;

const clubApp=`${appBanner('club')}<div class="pgC">
  ${clubHead}
  <div class="decide">
    <div class="dh"><div class="t">Ask to join</div><div class="b">One tap</div></div>
    <div class="knownrow">${av('MR',38,G[1])}
      <div class="t"><div class="n">Marcus Reyes</div><div class="e">marcus.r@gmail.com</div></div>
      <div class="x">Not you?</div></div>
    <div class="fld" style="margin-bottom:15px"><label>Add a note for Tony <span style="text-transform:none;letter-spacing:0;font-weight:400">optional</span></label><div class="inp ph">"We're at 71 Grandview"</div></div>
    <button class="btn">Ask to join</button>
    <div class="ordiv"><span>or</span></div>
    <button class="btn ghost">${I('ArrowSquareOut',17)}Open in the Sprout app</button>
  </div>
  <div class="trust">${I('CheckCircle')}<p>We recognised you from the Sprout app. Tony gets the request straight away and the club appears in your app once he approves.</p></div>
  ${clubProof}
</div>${sfoot}`;

write('share-c-decision.html',page({
  title:'Direction C — Smart-Link Decision Page',
  tagline:'Sprout · public share page · app.joinsprout.co',
  lede:'Conversion first. The page opens with <b>who invited you</b>, three lines of what/when/where, then goes straight to the decision: RSVP inline, no account, no sign-in wall. Description, members, venue and organiser drop below the fold as proof. This is the only direction where the web RSVP stays the primary button even when Sprout is installed, because the job of a link forwarded into a group text is to convert a stranger in one screen.',
  css,
  panels:[
    panel('Event · cold','Event detail, visitor has no Sprout app','Name and email are the whole form. The guest stepper replaces a free-text "+1?" and never shifts the layout. The trust line under the card answers the objection the form creates, in the place it gets asked.',eventCold),
    panel('Event · has app','Event detail, Sprout is installed','The form collapses to a recognised-user row with no fields at all. Note the deliberate call: <b>RSVP stays the green primary</b> and the app open drops to the ghost button. Fewer taps to the thing Tony actually needs.',eventApp,true),
    panel('Club · cold','Club detail, visitor has no Sprout app','A club join is a request, not a purchase, so the card says "Ask to join" and adds one optional field that helps Tony approve. The private-club lock is stated in the meta line, before the ask.',clubCold),
    panel('Club · has app','Club detail, Sprout is installed','Recognised row plus an optional note for the organiser. Proof stack underneath is identical (about, events, tags, organiser), so the two states never diverge structurally.',clubApp,true),
  ]
}));
