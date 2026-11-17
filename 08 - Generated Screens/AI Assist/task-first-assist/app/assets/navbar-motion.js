/* Motion primitives reused from the approved Assist-tab preview. */
(() => {
const IMG = document.currentScript?.dataset.texture || window.SPROUT_NAV_TEXTURE || 'assets/assist-clover-ahmad-700.png';
const VIEW={x:120,y:120,w:460}, DIRS={tl:[-1,-1],tr:[1,-1],bl:[-1,1],br:[1,1]};
const OUT='cubic-bezier(.34,1.56,.64,1)', leafNames=['tl','tr','br','bl'];
const BASE_SHADOW='inset 0 0 0 4px #eae6db, 0 6px 16px rgba(24,99,56,.18), 0 2px 4px rgba(0,0,0,.06)';
const preference=matchMedia('(prefers-reduced-motion: reduce)');
let reduced=preference.matches, idleStyle='peek';
  function makeClover(host, cloverPx){
    const c = document.createElement('div'); c.className = 'clover';
    c.style.width = c.style.height = cloverPx + 'px';
    const spin = document.createElement('div'); spin.className = 'spin'; c.appendChild(spin);
    const k = cloverPx / VIEW.w, imgPx = 700 * k, leaves = {};
    for (const name of ['bl','br','tl','tr']){
      const d = document.createElement('div'); d.className = 'leaf ' + name;
      Object.assign(d.style,{width:imgPx+'px',height:imgPx+'px',left:(-VIEW.x*k)+'px',top:(-VIEW.y*k)+'px',background:`url(${IMG}) 0 0/100% 100% no-repeat`});
      spin.appendChild(d); leaves[name] = d;
    }
    host.appendChild(c);
    return {root:c, spin, leaves};
  }
  function makeHero(host, size, opts={}){
    const b = document.createElement(opts.button === false ? 'div' : 'button');
    b.className = 'hero'; b.style.width = b.style.height = size + 'px';
    if (opts.left !== undefined){ b.style.left = opts.left + 'px'; b.style.top = opts.top + 'px'; }
    if (b.tagName === 'BUTTON'){ b.type = 'button'; b.setAttribute('aria-label','Sprout Assist'); }
    const ripple = document.createElement('div'); ripple.className = 'ripple'; b.appendChild(ripple);
    const clover = makeClover(b, Math.round(size * 0.66));
    const sw = document.createElement('div'); sw.className = 'shine-wrap'; const shine = document.createElement('div'); shine.className = 'shine'; sw.appendChild(shine); b.appendChild(sw);
    const badge = document.createElement('div'); badge.className = 'badge'; badge.textContent = '1';
    const s = size / 64;
    Object.assign(badge.style,{left:(size*0.72)+'px',top:(-2*s)+'px',width:(20*s)+'px',height:(20*s)+'px',borderRadius:(10*s)+'px',fontSize:(11*s)+'px',lineHeight:(17*s)+'px'});
    b.appendChild(badge);
    if (opts.z) b.style.zIndex = opts.z;
    host.appendChild(b);
    return {el:b, ripple, shine, badge, clover, size, anims:[], angle:0, invite:!!opts.invite, demo:!!opts.demo, phone:opts.phone||null};
  }

  // ---------- motion primitives ----------
  function stopLoops(h){
    h.anims.forEach(a=>a.cancel()); h.anims = []; clearInterval(h.timer);
    clearTimeout(h.inviteFirst); clearInterval(h.inviteTimer);
    if (h.phone) hidePeek(h.phone);
  }
  function idle(h){
    stopLoops(h);
    startInvite(h);
    if (reduced) return;
    h.anims.push(h.el.animate([{transform:'scale(1)'},{transform:'scale(1.03)'},{transform:'scale(1)'}],{duration:3200,iterations:Infinity,easing:'ease-in-out'}));
    leafNames.forEach((n,i)=>{ const sway = (i%2?2:-2);
      h.anims.push(h.clover.leaves[n].animate([{transform:'rotate(0deg)'},{transform:`rotate(${sway}deg)`},{transform:'rotate(0deg)'}],{duration:3200,iterations:Infinity,easing:'ease-in-out',delay:i*400})); });
  }
  function wave(h){
    if (reduced) return;
    h.el.animate([{transform:'translateY(0) scale(1,1)'},{transform:'translateY(-7px) scale(.97,1.04)',offset:.35},{transform:'translateY(0) scale(1.05,.94)',offset:.62},{transform:'translateY(0) scale(1,1)'}],{duration:620,easing:'ease-out',composite:'add'});
    leafNames.forEach((n,i)=>h.clover.leaves[n].animate([{transform:'rotate(0deg)'},{transform:'rotate(14deg)',offset:.4},{transform:'rotate(-6deg)',offset:.75},{transform:'rotate(0deg)'}],{duration:420,delay:180+i*90,easing:'ease-in-out',composite:'add'}));
  }
  function glowPulse(h){
    if (reduced) return;
    h.anims.push(h.el.animate([{boxShadow:BASE_SHADOW+', 0 0 0 0 rgba(24,99,56,.32)'},{boxShadow:BASE_SHADOW+', 0 0 0 16px rgba(24,99,56,0)'}],{duration:2000,iterations:Infinity,easing:'cubic-bezier(.2,.7,.3,1)'}));
  }
  function shine(h){
    if (reduced) return;
    h.shine.animate([{transform:'translateX(-160%) rotate(18deg)'},{transform:'translateX(300%) rotate(18deg)'}],{duration:900,easing:'cubic-bezier(.4,0,.2,1)'});
  }
  function startInvite(h){
    clearTimeout(h.inviteFirst); clearInterval(h.inviteTimer);
    if (!h.invite) return;
    const style = (h.demo && idleStyle==='peek') ? 'wave' : idleStyle;
    const LOOP = 2000;                               // one invite motion every 2 s (Ahmad, 11 Nov)
    if (style === 'glow'){ glowPulse(h); h.inviteFirst = setTimeout(()=>{ shine(h); h.inviteTimer = setInterval(()=>shine(h), LOOP); }, 1000); return; }
    let n = 0;
    // the clover waves every 2 s; the bubble keeps a slower beat (1st wave, then every 5th = 10 s) so it never covers the screen non-stop
    const beat = () => { wave(h); if (style==='peek' && h.phone && n % 5 === 0) setTimeout(()=>showPeek(h.phone), 380); n++; };
    h.inviteFirst = setTimeout(()=>{ beat(); h.inviteTimer = setInterval(beat, LOOP); }, 1000);
  }
  function bloom(h){
    if (reduced) return;
    leafNames.forEach((n,i)=>{
      // top leaves open up (slide out + turn 8deg); bottom leaves only rock 4deg around the joint (stem stays whole)
      const top = n[0]==='t', [dx,dy] = DIRS[n], d = top ? 2 * (h.size/64) / Math.SQRT2 : 0;
      const rot = (n==='tl'||n==='br') ? (top?-8:-4) : (top?8:4);
      h.clover.leaves[n].animate([{transform:'translate(0,0) rotate(0deg)'},{transform:`translate(${dx*d}px,${dy*d}px) rotate(${rot}deg)`,offset:.45},{transform:'translate(0,0) rotate(0deg)'}],{duration:520,delay:i*70,easing:OUT,composite:'add'});
    });
    h.ripple.animate([{opacity:.5,transform:'scale(1)'},{opacity:0,transform:'scale(1.8)'}],{duration:900,easing:'cubic-bezier(.2,.7,.3,1)'});
    h.badge.animate([{transform:'scale(1)'},{transform:'scale(1.25)'},{transform:'scale(1)'}],{duration:420,delay:200,easing:OUT});
  }
  function badgeOn(h){ h.badgeOn = true; h.badge.animate([{transform:'scale(0)'},{transform:'scale(1.2)'},{transform:'scale(1)'}],{duration:480,easing:OUT,fill:'forwards'}); }
  function badgeOff(h){ if (!h.badgeOn) return; h.badgeOn = false; h.badge.animate([{transform:'scale(1)'},{transform:'scale(0)'}],{duration:200,easing:'ease-in',fill:'forwards'}); }
  function proposalLoop(h, cycles=Infinity){
    clearInterval(h.timer); let n = 0;
    if (reduced) return;
    const tick = () => { if (!h.badgeOn || n++ >= cycles) { clearInterval(h.timer); return; } bloom(h); };
    setTimeout(tick, 600); h.timer = setInterval(tick, 4500);
  }
  function pressDown(h){
    h.el.animate([{transform:'scale(1)'},{transform:'scale(.9)'}],{duration:120,easing:'ease-out',fill:'forwards'});
    if (!reduced) leafNames.forEach(n=>h.clover.leaves[n].animate([{transform:'scale(1)'},{transform:'scale(.88)'}],{duration:120,easing:'ease-out',fill:'forwards'}));
  }
  function pressUp(h, rotate = true){
    h.el.getAnimations().filter(a=>a.effect && a.effect.getComputedTiming().iterations!==Infinity).forEach(a=>a.cancel());
    h.el.animate([{transform:'scale(.9)'},{transform:'scale(1.1)',offset:.35},{transform:'scale(.97)',offset:.65},{transform:'scale(1.02)',offset:.85},{transform:'scale(1)'}],{duration:520,easing:'ease-out'});
    leafNames.forEach(n=>{ h.clover.leaves[n].getAnimations().filter(a=>a.effect.getComputedTiming().iterations!==Infinity).forEach(a=>a.cancel());
      if (!reduced) h.clover.leaves[n].animate([{transform:'scale(.88)'},{transform:'scale(1.06)',offset:.5},{transform:'scale(1)'}],{duration:520,easing:'ease-out'}); });
    if (!reduced && rotate) turnTo(h, 90, 600, 'cubic-bezier(.2,.9,.25,1.15)');
  }
  function turnTo(h, deg, dur, easing){
    const from = h.angle; h.angle = deg;
    h.clover.spin.getAnimations().forEach(a => { if (a !== h.work) a.cancel(); });   // one turn at a time, no pile-up
    h.clover.spin.animate([{transform:`rotate(${from}deg)`},{transform:`rotate(${deg}deg)`}],{duration:dur,easing,fill:'forwards'});
  }
  function working(h){
    if (reduced) return;
    h.work = h.clover.spin.animate([{transform:`rotate(${h.angle}deg)`},{transform:`rotate(${h.angle+360}deg)`}],{duration:2400,iterations:Infinity,easing:'linear'});
    h.workPulse = leafNames.map(n=>h.clover.leaves[n].animate([{transform:'scale(1)'},{transform:'scale(.96)'},{transform:'scale(1)'}],{duration:1200,iterations:Infinity,easing:'ease-in-out'}));
  }
  function stopWorking(h){
    if (!h.work) return;
    const cur = h.angle + 360 * (h.work.currentTime % 2400) / 2400;
    h.work.cancel(); h.work = null; (h.workPulse||[]).forEach(a=>a.cancel());
    h.angle = cur; turnTo(h, Math.ceil((cur+1)/90)*90, 500, 'cubic-bezier(.2,.9,.25,1.1)');
  }


function positionPeek(P){
 const width=P.root.clientWidth, b=P.hero.el, w=P.peek.offsetWidth;
 P.peek.style.left=Math.max(12,Math.min(width-12-w,b.offsetLeft+b.offsetWidth/2-w/2))+'px';
 P.peek.style.bottom=(P.root.clientHeight-b.offsetTop+14)+'px';
}
function showPeek(P){
 if(P.open || P.peeks>=3 || document.hidden)return;
 P.peeks++;P.peek.hidden=false;positionPeek(P);P.peek.classList.add('on');
 P.peek.animate([{opacity:0,transform:'translateY(8px) scale(.6)'},{opacity:1,transform:'translateY(0) scale(1)'}],{duration:reduced?1:420,easing:OUT,fill:'forwards'});
 clearTimeout(P.peekHide);P.peekHide=setTimeout(()=>hidePeek(P),4200);
}
function hidePeek(P){
 clearTimeout(P.peekHide);P.peek.classList.remove('on');P.peek.hidden=true;
 P.peek.getAnimations().forEach(a=>a.cancel());
}
const phones=[];
document.querySelectorAll('.approved-home > .hero, #assistBtn').forEach(button=>{
 const root=button.parentElement, screen=button.closest('.screen')||root;
 const sheet=screen.querySelector('.assist-sheet,.sheet');if(!sheet)return;
 const P={root,screen,sheet,open:sheet.classList.contains('on'),peeks:0,peekHide:null};
 const temp=document.createElement('div');const h=makeHero(temp,64,{invite:true,phone:P});
 button.replaceChildren(...h.el.childNodes);h.el=button;P.hero=h;button.classList.add('sprout-motion-hero');
 const peek=document.createElement('button');peek.type='button';peek.className='sprout-nav-peek';peek.hidden=true;
 const flow=screen.closest('.flow'),id=flow?.id?.replace('flow-','');
 const messages={A:['Need a sitter Saturday?','Ask your sitters, all at once'],B:['Need a sitter recommendation?','Ask families in Jake’s class'],C:['A night for you two?','Let’s plan dinner and a sitter']};
 const text=window.SPROUT_PEEK||messages[id]||['Soccer sign-ups are open for Jake','Tap to see where his class is going'];
 const title=document.createElement('span'),sub=document.createElement('small');title.textContent=text[0];sub.textContent=text[1];peek.append(title,sub);root.append(peek);P.peek=peek;
 let allowClick=false,openTimer=null,lastState=flow?.dataset.state,hadChat=false;
 const clearTap=()=>{clearTimeout(openTimer);openTimer=null;};
 const activate=()=>{if(P.open||openTimer)return;stopLoops(h);hidePeek(P);if(!reduced)pressUp(h);
  openTimer=setTimeout(()=>{openTimer=null;allowClick=true;button.click();allowClick=false;},reduced?0:220);};
 button.addEventListener('pointerdown',()=>{if(!P.open&&!openTimer){stopLoops(h);if(!reduced)pressDown(h);}});
 button.addEventListener('pointercancel',()=>{clearTap();if(!P.open){if(!reduced)pressUp(h,false);idle(h);}});
 button.addEventListener('click',event=>{if(allowClick)return;event.preventDefault();event.stopImmediatePropagation();activate();},true);
 peek.addEventListener('click',activate);
 const setBadge=on=>{h.badge.getAnimations().forEach(a=>a.cancel());h.badgeOn=on;h.badge.style.transform=on?'scale(1)':'scale(0)';h.badge.hidden=!on;if(on&&!reduced)badgeOn(h);button.setAttribute('aria-label',on?'Sprout Assist, 1 new suggestion':'Open Sprout Assist');};
 function synchronize(){
  const open=sheet.classList.contains('on');
  if(open!==P.open){P.open=open;clearTap();
   if(open){stopLoops(h);hidePeek(P);setBadge(false);}
   else{button.focus({preventScroll:true});turnTo(h,0,reduced?1:520,'cubic-bezier(.2,.9,.25,1.1)');if(!document.hidden)idle(h);}
  }
  if(!flow){const hasChat=!!screen.querySelector('#chat')?.childElementCount;if(hadChat&&!hasChat){P.peeks=0;title.textContent=text[0];sub.textContent=text[1];setBadge(true);if(!P.open&&!document.hidden){idle(h);proposalLoop(h,3);}}hadChat=hasChat;}
  const state=flow?.dataset.state;
  if(state!==lastState){
   if(state==='entry'){P.peeks=0;title.textContent=text[0];sub.textContent=text[1];setBadge(true);if(!P.open&&!document.hidden){idle(h);proposalLoop(h,3);}}
   else if(['results','recommended'].includes(state)&&!P.open){P.peeks=0;title.textContent='Your sitters replied';sub.textContent='Open Assist to review their replies';setBadge(true);proposalLoop(h,3);showPeek(P);}
   lastState=state;
  }
 }
 new MutationObserver(synchronize).observe(screen,{attributes:true,childList:true,subtree:true,attributeFilter:['class']});
 if(flow)new MutationObserver(synchronize).observe(flow,{attributes:true,attributeFilter:['data-state']});
 P.resume=()=>{stopLoops(h);if(!P.open&&!document.hidden){idle(h);if(h.badgeOn)proposalLoop(h,3);}};
 setBadge(true);if(!P.open){idle(h);proposalLoop(h,3);}phones.push(P);
 window.sproutNotify=(t,st)=>{P.peeks=0;title.textContent=t;sub.textContent=st;setBadge(true);if(!P.open&&!document.hidden){stopLoops(h);idle(h);proposalLoop(h,3);showPeek(P);}};
 window.sproutClearBadge=()=>setBadge(false);
});
preference.addEventListener('change',()=>{reduced=preference.matches;phones.forEach(P=>{P.hero.el.querySelectorAll('*').forEach(el=>el.getAnimations().forEach(a=>a.cancel()));P.hero.el.getAnimations().forEach(a=>a.cancel());P.resume();});});
document.addEventListener('visibilitychange',()=>phones.forEach(P=>P.resume()));
addEventListener('resize',()=>phones.forEach(P=>{if(!P.peek.hidden)positionPeek(P);}));
})();
