/* Shared content + helpers for the three Compose Email mobile directions.
   Copy is the real template text from the live portal so the three options are
   judged on the same, honest amount of content. */

const TPL_FIELDS = [
  {k:'rp1Name',      l:'Room Parent 1 — Name',  ph:'e.g. Tony Martin',            v:'Tony Martin'},
  {k:'rp1Email',     l:'Room Parent 1 — Email', ph:'tony.martin@gmail.com',       v:'tony.martin@gmail.com'},
  {k:'rp2Name',      l:'Room Parent 2 — Name',  ph:'e.g. Lydia Martin',           v:'Lydia Martin'},
  {k:'rp2Email',     l:'Room Parent 2 — Email', ph:'lydia.martin@gmail.com',      v:''},
  {k:'teacherName',  l:"Teacher's Name",        ph:'e.g. Mrs. Taylor',            v:'Mrs. Taylor'},
  {k:'teacherEmail', l:"Teacher's Email",       ph:'mstaylorclass@kiker.edu',      v:''},
  {k:'deadline',     l:'Form Deadline',         ph:'', type:'date',                v:''},
];

const RECIPIENTS = [
  {v:'all_teacher',      l:'All Families + Teacher', m:'24 families and Mrs. Taylor'},
  {v:'all',              l:'All Families',           m:'24 families, no teacher'},
  {v:'specific',         l:'Select Specific People', m:'Choose from the roster'},
  {v:'emailonly_teacher',l:'Email-only Families + Teacher', m:'Skips anyone already on Sprout'},
  {v:'teacher',          l:'Send to Teacher only',   m:'Just Mrs. Taylor'},
];

const EVENTS = [
  {id:1, t:'Back to School Picnic',        d:'Sep 5 · 5:30 PM',  on:true},
  {id:2, t:"Spirit Night at Mandola's",    d:'Sep 12',           on:true},
  {id:3, t:"Mrs. Taylor's Class Photo Day",d:'Sep 18 · 8:30 AM', on:false},
  {id:4, t:'Fall Fundraiser Kickoff',      d:'Oct 2',            on:true},
];

const LINKS = [
  {id:1, t:'Contact + Consent Form', u:'roomparent.com/kiker-1st-consent', on:true},
  {id:2, t:'Shared Photo Album',     u:'roomparent.com/kiker-1st-photos',  on:false},
];

const SUBJECT = 'Introducing your room parents for the year';

const BODY_PARAS = [
  'Hello Parents,',
  'We hope your school year is off to a great start! We wanted to introduce ourselves as {teacherName} room parents for the year, {rp1Name} and {rp2Name}.',
  'Together we will be working to support our wonderful teacher by planning and collecting funds for AISD Appreciation Days, class activities, gifts and, of course, being a point of contact for you should you need it.',
  'For now, please fill out the attached form so that we may gather your contact information. This form is optional. If you do not fill it out by {deadline}, we will assume you prefer not to be contacted directly.',
  'Thank you so much, everyone!',
];

/* ── shared state ── */
const state = {
  tpl: Object.fromEntries(TPL_FIELDS.map(f => [f.k, f.v])),
  recipient: 'all_teacher',
  subject: SUBJECT,
  events: Object.fromEntries(EVENTS.map(e => [e.id, e.on])),
  links: Object.fromEntries(LINKS.map(l => [l.id, l.on])),
};

const missingFields = () => TPL_FIELDS.filter(f => !String(state.tpl[f.k] || '').trim());
const chosenEvents  = () => EVENTS.filter(e => state.events[e.id]);
const chosenLinks   = () => LINKS.filter(l => state.links[l.id]);
const recipientLabel= () => RECIPIENTS.find(r => r.v === state.recipient).l;
const prettyDate = (v) => v ? new Date(v + 'T00:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric'}) : '';

/* Renders the email body, showing unfilled template fields as red gaps the way
   the live portal does. Nothing is sent until Send is pressed, in any direction. */
function bodyHtml(){
  return BODY_PARAS.map(p => {
    const filled = p.replace(/\{(\w+)\}/g, (_, k) => {
      let v = state.tpl[k];
      if (k === 'deadline') v = prettyDate(v);
      const label = TPL_FIELDS.find(f => f.k === k).l.replace(/.*— /,'');
      return v ? v : `<span class="gap">${label}</span>`;
    });
    return `<p>${filled}</p>`;
  }).join('');
}

function mailHtml(){
  const ev = chosenEvents(), lk = chosenLinks();
  return `
    <div class="mail">
      <h4>${state.subject}</h4>
      <div class="meta">To ${recipientLabel()} · from Tony Martin</div>
      ${bodyHtml()}
      ${ev.length ? `<div class="blk"><b>Coming up</b>${ev.map(e=>`<div>${e.t} · ${e.d}</div>`).join('')}</div>` : ''}
      ${lk.length ? `<div class="blk"><b>Links</b>${lk.map(l=>`<div>${l.t}</div>`).join('')}</div>` : ''}
    </div>`;
}

const CHECK = '<svg viewBox="0 0 24 24"><path d="m5 13 4 4 10-10"/></svg>';

/* oninput only writes state. Re-rendering on every keystroke would replace the
   input node and throw away focus and the caret, which makes a prototype feel
   broken for reasons that have nothing to do with the layout being judged.
   onchange fires on blur, which is when summaries and the preview refresh. */
function fieldRow(f){
  const type = f.type === 'date' ? 'date' : 'text';
  return `<div class="field">
    <label>${f.l}</label>
    <input type="${type}" value="${state.tpl[f.k] || ''}" placeholder="${f.ph || ''}"
           oninput="state.tpl['${f.k}']=this.value"
           onchange="state.tpl['${f.k}']=this.value; render();">
  </div>`;
}

function pickRow(on, title, meta, onclick, round){
  return `<div class="pick ${on ? 'on' : ''}" onclick="${onclick}">
    <span class="box ${round ? 'round' : ''}">${round ? '' : CHECK}</span>
    <span><span class="t">${title}</span><span class="m">${meta}</span></span>
  </div>`;
}

/* chrome shared by all three */
function chrome(){
  return `<div class="topbar">
    <div class="ctx">
      <span class="ctx-mark"><svg viewBox="0 0 24 24"><path d="M4 21V9l8-6 8 6v12"/><circle cx="12" cy="12" r="2.2"/></svg></span>
      <span style="min-width:0"><span class="nm">Mrs. Taylor's Class</span><span class="sb">1st Grade · Kiker Elementary</span></span>
    </div>
    <span class="avatar">TM</span>
  </div>`;
}

function tabbar(){
  const ic = {
    dash:'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    mail:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
    cal :'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    fund:'<path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',
    more:'<path d="M4 7h16M4 12h16M4 17h16"/>',
  };
  const t = (k,l,on) => `<span class="tab ${on?'on':''}"><svg viewBox="0 0 24 24">${ic[k]}</svg>${l}</span>`;
  return `<div class="tabbar">${t('dash','Dashboard')}${t('mail','Email',true)}${t('cal','Calendar')}${t('fund','Funds')}${t('more','More')}</div>`;
}
