import {I,panel,page,write} from './lib.mjs';

const css=`
.pgB{padding-bottom:0}
.heroB{height:186px;position:relative}
.heroB::before{content:'';position:absolute;inset:0;background:linear-gradient(to top,rgba(16,30,20,.55) 0%,rgba(16,30,20,0) 52%)}
.heroB .hint{bottom:auto;top:56%;font-size:30px;opacity:.42}
.heroB .kick{position:absolute;left:16px;bottom:34px;display:flex;align-items:center;gap:9px;z-index:2}
.heroB .kick .crest{width:34px;height:34px;box-shadow:inset 0 0 0 1.5px #c9a227,inset 0 0 0 2.6px #6b1f2a,inset 0 0 0 3.8px #c9a227,0 2px 8px rgba(0,0,0,.3)}
.heroB .kick .crest span{font-size:11.5px}
.heroB .kick .n{font-size:11.5px;font-weight:600;color:#fff;letter-spacing:.2px;text-shadow:0 1px 4px rgba(0,0,0,.4)}
.heroB .kick .n .sub{display:block;font-weight:400;font-size:10px;color:rgba(255,255,255,.8);margin-top:1px}
.sheetB{position:relative;margin-top:-22px;border-radius:22px 22px 0 0;background:var(--bg);padding:20px 16px 0;z-index:3}
.titleB{font-family:var(--serif);font-weight:600;font-size:24px;line-height:31px;color:var(--ink);letter-spacing:-.3px}
.subB{font-size:12.5px;color:var(--muted);margin-top:5px;display:flex;align-items:center;gap:5px}
.subB .ic{color:var(--brand-mid)}
.chipsB{display:flex;flex-wrap:wrap;gap:6px;margin-top:13px}
.chipB{background:var(--brand-light);border-radius:99px;padding:5px 11px;font-size:11px;font-weight:600;color:var(--brand);letter-spacing:.1px}
.chipB.more{background:transparent;border:1px dashed var(--border);color:var(--subtlest);font-weight:500}
.cardB{background:var(--surface);border-radius:var(--radius);box-shadow:var(--shadow-m);padding:4px 14px;margin-top:14px}
.cardB.pad{padding:15px 16px}
.cardB .ttl{font-size:9.5px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--subtlest);margin-bottom:11px}
.frow{display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid #f0ece2}
.frow:last-child{border-bottom:0}
.frow .bub{width:34px;height:34px;border-radius:10px;background:var(--brand-light);display:grid;place-items:center;color:var(--brand);flex-shrink:0}
.frow .bub .ic{width:18px;height:18px}
.frow .tx{flex:1;min-width:0}
.frow .t1{font-size:13.5px;font-weight:600;color:var(--ink);line-height:1.35;font-family:var(--sans)}
.frow .t2{font-size:11.5px;color:var(--muted);line-height:1.45;margin-top:1px}
.frow .cr{color:var(--border);flex-shrink:0}
.mapth{width:52px;height:52px;border-radius:9px;flex-shrink:0;position:relative;overflow:hidden;
  background:#e8e9e1;background-image:
   linear-gradient(rgba(255,255,255,.9) 1.5px,transparent 1.5px),
   linear-gradient(90deg,rgba(255,255,255,.9) 1.5px,transparent 1.5px),
   linear-gradient(115deg,transparent 44%,#dcd9c8 44%,#dcd9c8 52%,transparent 52%);
  background-size:13px 13px,13px 13px,100% 100%}
.mapth::after{content:'';position:absolute;top:17px;left:21px;width:10px;height:10px;border-radius:50% 50% 50% 0;
  transform:rotate(-45deg);background:var(--brand);box-shadow:0 1px 3px rgba(0,0,0,.3)}
.goB{display:flex;align-items:center;gap:11px;margin-bottom:12px}
.stackB{display:flex}
.stackB .av{width:32px;height:32px;font-size:11px;border:2px solid var(--surface);margin-left:-9px}
.stackB .av:first-child{margin-left:0}
.stackB .more{width:32px;height:32px;border-radius:50%;background:var(--l1);border:2px solid var(--surface);margin-left:-9px;
  display:grid;place-items:center;font-size:10px;font-weight:600;color:var(--muted)}
.goB .gt{font-size:12.5px;color:var(--muted);flex:1}
.goB .gt b{font-weight:600;color:var(--ink);font-size:13px}
.meter{height:6px;border-radius:99px;background:var(--l1);overflow:hidden}
.meter i{display:block;height:100%;border-radius:99px;background:var(--brand-mid);width:75%}
.meterL{display:flex;justify-content:space-between;font-size:10.5px;color:var(--subtlest);margin-top:7px}
.clamp{font-size:13px;line-height:21px;color:var(--body);display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.readmore{font-size:12.5px;font-weight:600;color:var(--brand);margin-top:9px;display:inline-flex;align-items:center;gap:4px}
.readmore .ic{width:12px;height:12px}
.hostB{display:flex;align-items:center;gap:11px}
.hostB .av{width:42px;height:42px;font-size:15px}
.hostB .t{flex:1}
.hostB .n{font-family:var(--serif);font-weight:600;font-size:15px;color:var(--ink);display:flex;align-items:center;gap:5px}
.hostB .n .ic{width:14px;height:14px;color:var(--brand-mid)}
.hostB .r{font-size:11.5px;color:var(--muted);margin-top:1px}
.hostB .msg{border:1.5px solid var(--border);border-radius:99px;padding:8px 13px;font-family:var(--serif);font-weight:600;font-size:12.5px;color:var(--brand);display:flex;align-items:center;gap:5px}
.hostB .msg .ic{width:14px;height:14px}
.ctawrap{position:sticky;bottom:0;z-index:20;background:var(--surface);border-top:1px solid var(--line);
  box-shadow:-2px 0 25px 5px rgba(0,0,0,.055);margin-top:18px}
.ctabarB{padding:12px 16px 14px;display:flex;gap:10px;align-items:center}
.ctabarB .btn{flex:1;padding:15px;font-size:15.5px;box-shadow:none}
.sqbtn{width:50px;height:50px;border-radius:14px;border:1.5px solid var(--border);display:grid;place-items:center;color:var(--brand);flex-shrink:0;background:transparent}
.sqbtn .ic{width:21px;height:21px}
.webalt{font-size:11.5px;color:var(--subtlest);text-align:center;padding:0 16px 13px}
.webalt u{color:var(--muted);text-underline-offset:2px}
.gridM{display:grid;grid-template-columns:repeat(4,1fr);gap:12px 6px;padding-top:2px}
.gridM .m{text-align:center}
.gridM .m .av{width:46px;height:46px;font-size:16px;margin:0 auto 5px}
.gridM .m .nm{font-size:10.5px;color:var(--muted);line-height:1.3;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.evB{display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid #f0ece2}
.evB:last-child{border-bottom:0}
.evB .dt{width:44px;flex-shrink:0;text-align:center;background:var(--brand-light);border-radius:10px;padding:5px 0}
.evB .dt .m{display:block;font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--brand)}
.evB .dt .d{display:block;font-family:var(--serif);font-weight:600;font-size:17px;color:var(--ink);line-height:1.2}
.evB .tx{flex:1;min-width:0}
.evB .t1{font-size:13.5px;font-weight:600;color:var(--ink);line-height:1.35}
.evB .t2{font-size:11.5px;color:var(--muted);margin-top:1px}
.evB .cr{color:var(--border)}
.crestBig{margin:0 auto;box-shadow:inset 0 0 0 3px #c9a227,inset 0 0 0 5px #6b1f2a,inset 0 0 0 7px #c9a227,0 8px 22px rgba(0,0,0,.18)}
.heroC{height:172px;position:relative;display:grid;place-items:center;
  background:radial-gradient(120% 100% at 50% 0%,#e2e9e3 0%,#d5e0d7 55%,#c8d6cb 100%)}
.heroC::after{content:'';position:absolute;inset:0;opacity:.35;
  background-image:radial-gradient(#186338 1px,transparent 1.2px);background-size:15px 15px;
  -webkit-mask-image:radial-gradient(110% 85% at 50% 40%,transparent 38%,#000 82%);
  mask-image:radial-gradient(110% 85% at 50% 40%,transparent 38%,#000 82%)}
`;

const av=(i,s,bg)=>`<div class="av" style="width:${s}px;height:${s}px;font-size:${Math.round(s*0.38)}px${bg?';background:'+bg:''}">${i}</div>`;
const G=['linear-gradient(150deg,#7e6154,#b39e95)','linear-gradient(150deg,#234a63,#3a7ca5)','linear-gradient(150deg,#375337,#5c8a5c)','linear-gradient(150deg,#7f600e,#d4a017)','linear-gradient(150deg,#802929,#d64545)','linear-gradient(150deg,#1e3e2b,#579a74)'];

const appBanner=(what)=>`<div class="appbanner">
  <div class="ico">🍀</div>
  <div class="tx"><div class="t1">You have Sprout installed</div><div class="t2">Open this ${what} in the app</div></div>
  <div class="op">Open</div>
</div>`;

const sfoot=`<div class="sfoot" style="margin:0 16px"><div class="mk">🍀</div>
  <div class="t">Powered by <b>Sprout</b> · joinsprout.co</div></div>`;

/* ── EVENT body (shared by both states) ── */
const eventBody=`
  <div class="heroB photo" style="border-radius:0"><div class="hint">⛳</div>
    <div class="kick"><div class="crest"><span>CC</span></div>
      <div class="n">Circle C Dads<span class="sub">Circle C Ranch · Social club</span></div></div>
  </div>
  <div class="sheetB">
    <h1 class="titleB">Dads' Golf Scramble</h1>
    <div class="subB">${I('UsersThree',14)}Open to the whole club · Guests welcome</div>
    <div class="chipsB"><span class="chipB">Golf</span><span class="chipB">Social</span><span class="chipB">Dads</span><span class="chipB more">+3</span></div>

    <div class="cardB">
      <div class="frow"><div class="bub">${I('CalendarBlank')}</div>
        <div class="tx"><div class="t1">Saturday, September 19</div><div class="t2">In 5 days</div></div></div>
      <div class="frow"><div class="bub">${I('Clock')}</div>
        <div class="tx"><div class="t1">8:00 – 11:30 AM</div><div class="t2">Shotgun start — be on the tee by 7:45</div></div></div>
      <div class="frow"><div class="bub">${I('MapPin')}</div>
        <div class="tx"><div class="t1">Grey Rock Golf Club</div><div class="t2">7401 Highway 45, Austin TX</div></div>
        <div class="mapth"></div>${I('CaretRight',15,'cr')}</div>
      <div class="frow"><div class="bub">${I('CurrencyDollarSimple')}</div>
        <div class="tx"><div class="t1">$45 per player</div><div class="t2">Cart and range balls included · pay on the day</div></div></div>
    </div>

    <div class="cardB pad">
      <div class="ttl">Who's going</div>
      <div class="goB">
        <div class="stackB">${av('TM',32)}${av('DR',32,G[0])}${av('JC',32,G[1])}${av('MK',32,G[2])}<div class="more">+8</div></div>
        <div class="gt"><b>12 going</b><br>4 spots left</div>
      </div>
      <div class="meter"><i></i></div>
      <div class="meterL"><span>Tee sheet 12 of 16</span><span>Closes Thu 6 PM</span></div>
    </div>

    <div class="cardB pad">
      <div class="ttl">About this event</div>
      <p class="clamp">Four-man scramble, shotgun start at 8:00 sharp. All skill levels welcome — we're here for the hang, not the handicap. If you've never played, we'll pair you with someone who has. Stick around after for breakfast tacos and a cold one on the patio. Rain date is the following Saturday.</p>
      <span class="readmore">Read more ${I('CaretDown')}</span>
    </div>

    <div class="cardB pad">
      <div class="ttl">Hosted by</div>
      <div class="hostB">${av('TM',42)}
        <div class="t"><div class="n">Tony Martin ${I('SealCheck')}</div><div class="r">Organizer · Circle C Dads</div></div>
        <div class="msg">${I('ChatCircle')}Ask</div>
      </div>
    </div>
    ${sfoot}
  </div>`;

const ctaCold=`<div class="ctawrap"><div class="ctabarB"><button class="btn">RSVP</button>
  <button class="sqbtn">${I('CalendarPlus')}</button></div>
  <div class="webalt">Free · no Sprout account needed to RSVP</div></div>`;
const ctaApp=`<div class="ctawrap"><div class="ctabarB"><button class="btn">${I('ArrowSquareOut',17)}Open in Sprout</button>
  <button class="sqbtn">${I('CalendarPlus')}</button></div>
  <div class="webalt">or <u>RSVP right here</u> — signed in as Marcus R.</div></div>`;

const eventCold=`<div class="pgB">${eventBody}</div>${ctaCold}`;
const eventApp=`<div class="pgB">${appBanner('event')}${eventBody}</div>${ctaApp}`;

/* ── CLUB body ── */
const clubBody=`
  <div class="heroC"><div class="crest crestBig" style="width:96px;height:96px;position:relative;z-index:2"><span style="font-size:34px">CC</span></div></div>
  <div class="sheetB">
    <h1 class="titleB">Circle C Dads</h1>
    <div class="subB">${I('UsersThree',14)}34 members · Circle C Ranch, Austin TX</div>
    <div class="chipsB"><span class="chipB">Hangouts</span><span class="chipB">Dranks</span><span class="chipB">Dads</span><span class="chipB">Social</span><span class="chipB">Golf</span><span class="chipB more">+1</span></div>

    <div class="cardB pad">
      <div class="ttl">About the club</div>
      <p class="clamp">Welcome to Circle C Dads. This is a social club — a super easy way for the dads in our Circle C Ranch neighborhood to connect and build some real friendships. Think standing golf games, patio nights, and the occasional pickleball beating. No dues, no committees, just show up.</p>
      <span class="readmore">Read more ${I('CaretDown')}</span>
    </div>

    <div class="cardB pad">
      <div class="ttl">Coming up</div>
      <div class="evB"><div class="dt"><span class="m">Sep</span><span class="d">19</span></div>
        <div class="tx"><div class="t1">Dads' Golf Scramble</div><div class="t2">8:00 AM · Grey Rock Golf Club</div></div>${I('CaretRight',15,'cr')}</div>
      <div class="evB"><div class="dt"><span class="m">Oct</span><span class="d">04</span></div>
        <div class="tx"><div class="t1">Patio Night at Moontower</div><div class="t2">7:00 PM · Moontower Saloon</div></div>${I('CaretRight',15,'cr')}</div>
      <div class="evB"><div class="dt"><span class="m">Oct</span><span class="d">18</span></div>
        <div class="tx"><div class="t1">Pickleball Round Robin</div><div class="t2">9:00 AM · Circle C Courts</div></div>${I('CaretRight',15,'cr')}</div>
    </div>

    <div class="cardB pad">
      <div class="ttl">Members · 34</div>
      <div class="gridM">
        <div class="m">${av('TM',46)}<div class="nm">Tony</div></div>
        <div class="m">${av('DR',46,G[0])}<div class="nm">Dave</div></div>
        <div class="m">${av('JC',46,G[1])}<div class="nm">Jason</div></div>
        <div class="m">${av('MK',46,G[2])}<div class="nm">Mike</div></div>
        <div class="m">${av('BW',46,G[3])}<div class="nm">Brett</div></div>
        <div class="m">${av('RS',46,G[4])}<div class="nm">Ryan</div></div>
        <div class="m">${av('AL',46,G[5])}<div class="nm">Andre</div></div>
        <div class="m"><div class="av" style="width:46px;height:46px;font-size:13px;background:var(--l1);color:var(--muted)">+27</div><div class="nm">See all</div></div>
      </div>
    </div>

    <div class="cardB pad">
      <div class="ttl">Started by</div>
      <div class="hostB">${av('TM',42)}
        <div class="t"><div class="n">Tony Martin ${I('SealCheck')}</div><div class="r">Organizer · since March 2024</div></div>
        <div class="msg">${I('ChatCircle')}Ask</div>
      </div>
    </div>
    ${sfoot}
  </div>`;

const clubCtaCold=`<div class="ctawrap"><div class="ctabarB"><button class="btn">Join Circle C Dads</button>
  <button class="sqbtn">${I('ShareNetwork')}</button></div>
  <div class="webalt">Free · Tony approves new members</div></div>`;
const clubCtaApp=`<div class="ctawrap"><div class="ctabarB"><button class="btn">${I('ArrowSquareOut',17)}Open in Sprout</button>
  <button class="sqbtn">${I('ShareNetwork')}</button></div>
  <div class="webalt">or <u>join right here</u> — signed in as Marcus R.</div></div>`;

const clubCold=`<div class="pgB">${clubBody}</div>${clubCtaCold}`;
const clubApp=`<div class="pgB">${appBanner('club')}${clubBody}</div>${clubCtaApp}`;

write('share-b-factcard.html',page({
  title:'Direction B — Fact-First Card Stack',
  tagline:'Sprout · public share page · app.joinsprout.co',
  lede:'Scannability first. A short 16:9 hero, then a sheet of cards that answer one question each: <b>when, where, how much, who else, what is it, who runs it</b>. Every fact is a list row with a real Phosphor icon. The CTA never scrolls away. It sits in a sticky bar at the bottom of the viewport. Closest to Sprout\'s native app patterns, so the web page and the app feel like one product.',
  css,
  panels:[
    panel('Event · cold','Event detail, visitor has no Sprout app','Hero is cut to 186px so the title, the date and the first two facts all clear the fold. Tags wrap and cap at three plus a <b>+3</b>, so nothing overflows sideways. Sticky RSVP bar plus a square add-to-calendar.',eventCold),
    panel('Event · has app','Event detail, Sprout is installed','Handoff banner at the top, sticky bar flips to <b>Open in Sprout</b>, and a quiet line underneath keeps the web RSVP one tap away for someone who does not want to leave Safari.',eventApp,true),
    panel('Club · cold','Club detail, visitor has no Sprout app','No stock photo for a club. The crest sits on a dotted brand field instead. Same card grammar: about, coming up, members grid, organizer. The member grid fixes the lone-avatar look in the old page.',clubCold),
    panel('Club · has app','Club detail, Sprout is installed','Same stack, handoff banner, and the sticky CTA becomes the app open. Join-on-the-web stays as the fallback line.',clubApp,true),
  ]
}));
