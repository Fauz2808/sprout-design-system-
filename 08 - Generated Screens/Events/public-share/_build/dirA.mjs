import {I,panel,page,write} from './lib.mjs';

const css=`
.pgA{padding:22px 26px 0}
.crestrow{display:flex;align-items:center;gap:12px;margin-bottom:18px}
.crestrow .crest{width:46px;height:46px}
.crestrow .crest span{font-size:16px}
.crestrow .cn{font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--brand);line-height:1.4}
.crestrow .cs{font-family:var(--serif);font-style:italic;font-size:13.5px;color:var(--muted);line-height:1.35;margin-top:1px}
.ruleA{height:1px;background:var(--border);border:0}
.titleA{font-family:var(--serif);font-weight:600;font-size:34px;line-height:38px;color:var(--ink);letter-spacing:-.5px;margin:19px 0 19px}
.whenA{padding-top:17px}
.whenA .d1{font-size:10px;font-weight:700;letter-spacing:2.3px;text-transform:uppercase;color:var(--gold)}
.whenA .d2{font-family:var(--serif);font-weight:600;font-size:25px;line-height:31px;color:var(--ink);margin:4px 0 1px}
.whenA .d3{font-size:13.5px;font-weight:500;color:var(--body)}
.whereA{margin:17px 0 18px}
.whereA .w1{font-family:var(--serif);font-weight:600;font-size:16.5px;color:var(--ink);line-height:1.3}
.whereA .w2{font-size:12px;color:var(--muted);margin-top:3px;display:flex;align-items:center;gap:5px}
.whereA .w2 .ic{color:var(--gold)}
.bandA{height:146px;margin-bottom:20px}
.hostA{display:flex;align-items:center;gap:9px;justify-content:center;margin-top:15px}
.hostA .av{width:26px;height:26px;font-size:10px}
.hostA .t{font-size:12px;color:var(--muted)}
.hostA .t b{font-weight:600;color:var(--body)}
.secA{margin-top:30px}
.secA .lbl{font-size:9.5px;font-weight:700;letter-spacing:1.9px;text-transform:uppercase;color:var(--gold);
  display:flex;align-items:center;gap:10px;margin-bottom:13px}
.secA .lbl::after{content:'';flex:1;height:1px;background:var(--border)}
.dl{display:grid;grid-template-columns:78px 1fr;row-gap:11px;column-gap:14px}
.dl dt{font-size:10px;font-weight:700;letter-spacing:1.1px;text-transform:uppercase;color:var(--subtlest);padding-top:3px}
.dl dd{font-size:13.5px;line-height:20px;color:var(--body)}
.goingA{display:flex;align-items:center;gap:12px}
.stack{display:flex}
.stack .av{width:34px;height:34px;font-size:12px;border:2px solid var(--bg);margin-left:-10px}
.stack .av:first-child{margin-left:0}
.stack .more{width:34px;height:34px;border-radius:50%;background:var(--l1);border:2px solid var(--bg);margin-left:-10px;
  display:grid;place-items:center;font-size:10.5px;font-weight:600;color:var(--muted)}
.goingA .gt{font-size:12.5px;color:var(--muted);line-height:1.45}
.goingA .gt b{font-weight:600;color:var(--body)}
.proseA{font-size:13.5px;line-height:22px;color:var(--body)}
.duoA{display:flex;gap:10px;margin-top:20px}
.duoA .btn.ghost{font-size:13.5px;padding:13px 8px;gap:7px}
.signed{display:flex;align-items:center;gap:8px;justify-content:center;margin-top:14px;font-size:11.5px;color:var(--subtlest)}
.signed .av{width:20px;height:20px;font-size:8.5px}
`;

const crest=(size=46,mono='CC')=>`<div class="crest" style="width:${size}px;height:${size}px"><span style="font-size:${Math.round(size*0.36)}px">${mono}</span></div>`;
const av=(i,s,bg)=>`<div class="av" style="width:${s}px;height:${s}px;font-size:${Math.round(s*0.38)}px${bg?';background:'+bg:''}">${i}</div>`;

const appBanner=(what)=>`<div class="appbanner">
  <div class="ico">🍀</div>
  <div class="tx"><div class="t1">You have Sprout installed</div><div class="t2">Open this ${what} in the app</div></div>
  <div class="op">Open</div>
</div>`;

/* ── shared below-the-fold blocks ── */
const eventBelow=`
  <div class="secA">
    <div class="lbl">Who's in</div>
    <div class="goingA">
      <div class="stack">${av('TM',34)}${av('DR',34,'linear-gradient(150deg,#7e6154,#b39e95)')}${av('JC',34,'linear-gradient(150deg,#234a63,#3a7ca5)')}${av('MK',34,'linear-gradient(150deg,#375337,#5c8a5c)')}<div class="more">+8</div></div>
      <div class="gt"><b>12 dads</b> are playing<br>4 spots left before the tee sheet closes</div>
    </div>
  </div>
  <div class="secA">
    <div class="lbl">The particulars</div>
    <dl class="dl">
      <dt>Format</dt><dd>Four-man scramble, shotgun start at 8:00 sharp.</dd>
      <dt>Green fee</dt><dd>$45 per player — cart and range balls included.</dd>
      <dt>Bring</dt><dd>Clubs, sunscreen, and a competitive streak.</dd>
      <dt>After</dt><dd>Breakfast tacos on the patio. Stick around.</dd>
    </dl>
  </div>
  <div class="secA">
    <div class="lbl">From Tony</div>
    <p class="proseA">All skill levels welcome — we're here for the hang, not the handicap. If you've never played, we'll put you with someone who has. Rain date is the following Saturday.</p>
  </div>
  <div class="duoA">
    <button class="btn ghost">${I('CalendarPlus',18)}Add to calendar</button>
    <button class="btn ghost">${I('ShareNetwork',18)}Share</button>
  </div>`;

const sfoot=`<div class="sfoot" style="margin:26px 26px 0"><div class="mk">🍀</div>
  <div class="t">This event lives in <b>Sprout</b> · joinsprout.co</div></div>`;

/* ── 1. EVENT · cold ── */
const eventCold=`<div class="pgA">
  <div class="crestrow">${crest(46)}
    <div><div class="cn">Circle C Dads</div><div class="cs">invites you to</div></div>
  </div>
  <hr class="ruleA">
  <h1 class="titleA">Dads' Golf<br>Scramble</h1>
  <hr class="ruleA">
  <div class="whenA">
    <div class="d1">Saturday</div>
    <div class="d2">September 19</div>
    <div class="d3">8:00 – 11:30 AM</div>
  </div>
  <div class="whereA">
    <div class="w1">Grey Rock Golf Club</div>
    <div class="w2">${I('MapPin',13)}7401 Highway 45, Austin TX</div>
  </div>
  <div class="photo bandA"><div class="hint">⛳</div></div>
  <button class="btn">RSVP</button>
  <div class="hostA">${av('TM',26)}<div class="t">Hosted by <b>Tony Martin</b></div></div>
  ${eventBelow}
</div>${sfoot}`;

/* ── 2. EVENT · has app ── */
const eventApp=`${appBanner('event')}<div class="pgA">
  <div class="crestrow">${crest(46)}
    <div><div class="cn">Circle C Dads</div><div class="cs">invites you to</div></div>
  </div>
  <hr class="ruleA">
  <h1 class="titleA">Dads' Golf<br>Scramble</h1>
  <hr class="ruleA">
  <div class="whenA">
    <div class="d1">Saturday</div>
    <div class="d2">September 19</div>
    <div class="d3">8:00 – 11:30 AM</div>
  </div>
  <div class="whereA">
    <div class="w1">Grey Rock Golf Club</div>
    <div class="w2">${I('MapPin',13)}7401 Highway 45, Austin TX</div>
  </div>
  <div class="photo bandA"><div class="hint">⛳</div></div>
  <button class="btn">${I('ArrowSquareOut',18)}Open in Sprout</button>
  <a class="txtlink">RSVP here in the browser instead</a>
  <div class="signed">${av('MR',20,'linear-gradient(150deg,#234a63,#3a7ca5)')}Signed in as Marcus R.</div>
  ${eventBelow}
</div>${sfoot}`;

/* ── club blocks ── */
const clubBelow=`
  <div class="secA">
    <div class="lbl">What this is</div>
    <p class="proseA">A social club for the dads of Circle C Ranch — an easy way to connect and build some real friendships. Think standing golf games, patio hangs, and the occasional pickleball beating.</p>
  </div>
  <div class="secA">
    <div class="lbl">Coming up</div>
    <div class="evrow"><div class="dt"><span class="m">Sep</span><span class="d">19</span></div>
      <div class="ev"><div class="en">Dads' Golf Scramble</div><div class="em">8:00 AM · Grey Rock Golf Club</div></div>${I('CaretRight',15,'cr')}</div>
    <div class="evrow"><div class="dt"><span class="m">Oct</span><span class="d">04</span></div>
      <div class="ev"><div class="en">Patio Night at Moontower</div><div class="em">7:00 PM · Moontower Saloon</div></div>${I('CaretRight',15,'cr')}</div>
    <div class="evrow"><div class="dt"><span class="m">Oct</span><span class="d">18</span></div>
      <div class="ev"><div class="en">Pickleball Round Robin</div><div class="em">9:00 AM · Circle C Courts</div></div>${I('CaretRight',15,'cr')}</div>
  </div>
  <div class="secA">
    <div class="lbl">Members</div>
    <div class="goingA">
      <div class="stack">${av('TM',34)}${av('DR',34,'linear-gradient(150deg,#7e6154,#b39e95)')}${av('JC',34,'linear-gradient(150deg,#234a63,#3a7ca5)')}${av('MK',34,'linear-gradient(150deg,#375337,#5c8a5c)')}${av('BW',34,'linear-gradient(150deg,#7f600e,#d4a017)')}<div class="more">+29</div></div>
      <div class="gt"><b>34 dads</b> from the neighborhood<br>Tony started it in March 2024</div>
    </div>
  </div>`;

const clubCss=`
.kickA{font-size:10px;font-weight:700;letter-spacing:2.2px;text-transform:uppercase;color:var(--gold);margin:16px 0 7px}
.tagA{font-family:var(--serif);font-style:italic;font-size:15px;line-height:23px;color:var(--muted);margin:17px 0}
.statrail{display:flex;padding:15px 0}
.statrail>div{flex:1;text-align:center;border-right:1px solid var(--border)}
.statrail>div:last-child{border-right:0}
.statrail .n{font-family:var(--serif);font-weight:600;font-size:21px;color:var(--ink);line-height:1.2}
.statrail .l{font-size:9.5px;font-weight:600;letter-spacing:1.1px;text-transform:uppercase;color:var(--subtlest);margin-top:3px}
.chips{display:flex;flex-wrap:wrap;gap:7px;margin:18px 0 20px}
.chip{border:1px solid var(--border);border-radius:99px;padding:5.5px 12px;font-size:11.5px;font-weight:500;color:var(--muted);background:#faf8f3}
.evrow{display:flex;align-items:center;gap:13px;padding:11px 0;border-bottom:1px solid var(--line)}
.evrow:last-child{border-bottom:0}
.evrow .dt{width:42px;text-align:center;flex-shrink:0}
.evrow .dt .m{display:block;font-size:9.5px;font-weight:700;letter-spacing:1.1px;text-transform:uppercase;color:var(--gold)}
.evrow .dt .d{display:block;font-family:var(--serif);font-weight:600;font-size:20px;color:var(--ink);line-height:1.15}
.evrow .ev{flex:1;min-width:0}
.evrow .en{font-family:var(--serif);font-weight:600;font-size:14.5px;color:var(--ink);line-height:1.35}
.evrow .em{font-size:11.5px;color:var(--muted);margin-top:1px}
.evrow .cr{color:var(--border);flex-shrink:0}
`;

const clubCold=`<div class="pgA">
  <div style="display:flex;justify-content:center;padding-top:6px">${crest(76)}</div>
  <div class="kickA" style="text-align:center">Circle C Ranch · Social Club</div>
  <h1 class="titleA" style="text-align:center;margin:0 0 17px">Circle C Dads</h1>
  <hr class="ruleA">
  <p class="tagA" style="text-align:center">“Getting out of the house,<br>on purpose.”</p>
  <hr class="ruleA">
  <div class="statrail">
    <div><div class="n">34</div><div class="l">Members</div></div>
    <div><div class="n">12</div><div class="l">Events a yr</div></div>
    <div><div class="n">'24</div><div class="l">Since</div></div>
  </div>
  <hr class="ruleA">
  <div class="chips"><span class="chip">Hangouts</span><span class="chip">Dranks</span><span class="chip">Dads</span><span class="chip">Social</span><span class="chip">Golf</span><span class="chip">Pickleball</span></div>
  <button class="btn">Join the club</button>
  <div class="hostA">${av('TM',26)}<div class="t">Started by <b>Tony Martin</b></div></div>
  ${clubBelow}
</div>${sfoot}`;

const clubApp=`${appBanner('club')}<div class="pgA">
  <div style="display:flex;justify-content:center;padding-top:6px">${crest(76)}</div>
  <div class="kickA" style="text-align:center">Circle C Ranch · Social Club</div>
  <h1 class="titleA" style="text-align:center;margin:0 0 17px">Circle C Dads</h1>
  <hr class="ruleA">
  <p class="tagA" style="text-align:center">“Getting out of the house,<br>on purpose.”</p>
  <hr class="ruleA">
  <div class="statrail">
    <div><div class="n">34</div><div class="l">Members</div></div>
    <div><div class="n">12</div><div class="l">Events a yr</div></div>
    <div><div class="n">'24</div><div class="l">Since</div></div>
  </div>
  <hr class="ruleA">
  <div class="chips"><span class="chip">Hangouts</span><span class="chip">Dranks</span><span class="chip">Dads</span><span class="chip">Social</span><span class="chip">Golf</span><span class="chip">Pickleball</span></div>
  <button class="btn">${I('ArrowSquareOut',18)}Open in Sprout</button>
  <a class="txtlink">Join here in the browser instead</a>
  <div class="signed">${av('MR',20,'linear-gradient(150deg,#234a63,#3a7ca5)')}Signed in as Marcus R.</div>
  ${clubBelow}
</div>${sfoot}`;

write('share-a-invitation.html',page({
  title:'Direction A — Invitation Card',
  tagline:'Sprout · public share page · app.joinsprout.co',
  lede:'The link is treated like a paper invite, not an app screen. No app chrome at the top. Above the fold the page answers <b>what, when, where</b> in one typographic block. Playfair does the work, the club logo shrinks to a crest, and the photo becomes a band instead of the hero. One green CTA. Everything else is proof, below the fold.',
  css:css+clubCss,
  panels:[
    panel('Event · cold','Event detail, visitor has no Sprout app','The default case: a link forwarded into a group text. Fold carries crest, title, date block, venue, band, RSVP. No sign-in wall, no app-chrome header stealing the top row.',eventCold),
    panel('Event · has app','Event detail, Sprout is installed','Green banner under the URL bar hands the visitor off to the app. Primary CTA flips to <b>Open in Sprout</b>; RSVP-in-browser stays available as a text link. Identity is known, so no form is ever shown.',eventApp,true),
    panel('Club · cold','Club detail, visitor has no Sprout app','Same invite grammar applied to a club. The crest gets its moment (76px, centred), then name, pull-quote, stat rail, and the six tags <b>wrap</b> instead of running off the right edge.',clubCold),
    panel('Club · has app','Club detail, Sprout is installed','Identical structure with the handoff banner and the flipped CTA. Members, upcoming events and the about text sit below as social proof either way.',clubApp,true),
  ]
}));
