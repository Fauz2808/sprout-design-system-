/* The outer page owns scrolling. Each tap goes through the embedded prototype's original button handler. */
function createAssistGuide(film, slides, seek) {
  const target = film.querySelector('.app-target');
  const paths = new Map();
  const starts = slides.map(slide => {
    if (!paths.has(slide.path)) paths.set(slide.path, []);
    const actions = paths.get(slide.path), start = actions.length;
    actions.push(...slide.actions);
    return start;
  });
  const kinds = { play:['playdate','Plan a playdate'], sitter:['sitterC1','Book a sitter'],
                  ride:['carpool','Set up a carpool'] };
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const desktop = matchMedia('(min-width:701px)');
  const wait = ms => new Promise(resolve => setTimeout(resolve,ms));
  let session, shownFrame, wanted, nextKey='', held, display, busy=false;

  function positionTarget() {
    film.style.setProperty('--app-scale',film.clientWidth/393);
    if (!display || !held?.isConnected || !wanted?.action || session?.iframe!==shownFrame) {
      target.hidden=true;
      return;
    }
    const rect=held.getBoundingClientRect();
    target.hidden=false;
    target.style.left=(100*rect.left/393)+'%'; target.style.top=(100*rect.top/852)+'%';
    target.style.width=(100*rect.width/393)+'%'; target.style.height=(100*rect.height/852)+'%';
    target.setAttribute('aria-label',(held.textContent.trim() || held.getAttribute('aria-label') || 'Continue')+' in Sprout');
  }
  new ResizeObserver(positionTarget).observe(film);
  target.onclick=()=>{ if (wanted?.action) seek(wanted.index,wanted.action.at+.004); };

  function discard(s) {
    if (s && s.iframe!==shownFrame) s.iframe.remove();
  }
  function open(path) {
    discard(session);
    const iframe=document.createElement('iframe');
    const s={iframe,path,count:0,plan:null};
    session=s; held=null; target.hidden=true;
    iframe.title='Sprout Assist '+path+' walkthrough';
    iframe.tabIndex=-1;
    // The hotspot above the iframe allows page swipes to pass across the phone.
    iframe.inert=true;
    iframe.style.visibility='hidden';
    iframe.onload=()=>{
      if(s!==session) return;
      const win=iframe.contentWindow, app=win.Sprout;
      if (!app?.flows[kinds[path][0]]) { console.error('Assist story runtime unavailable',path); return; }
      app.pace(.015);
      const [kind,echo]=kinds[path];
      const plan=app.makePlan(kind,{title:echo,sub:echo,icon:'calendar-check'});
      // Keep a visible action in view, even when a reply is appended farther down the chat.
      plan.scroll=()=>{};
      app.showPlan(plan);app.openSheet();plan.me(echo);
      const css=win.document.createElement('style');
      css.textContent='.chat{overflow-anchor:none}';
      win.document.head.append(css);
      plan.chat.addEventListener('scroll',positionTarget,{passive:true});
      s.plan=plan;
      app.flows[kind](plan).catch(error=>console.error('Assist story flow',error));
      run();
    };
    iframe.src='./vendor/assist-story/runtime.html';
    film.insertBefore(iframe,target);
    return s;
  }
  function control(plan, selector, pattern) {
    const re=pattern && new RegExp(pattern,'i');
    return [...plan.chat.querySelectorAll(selector)].reverse().find(el=>
      !el.disabled && el.style.pointerEvents!=='none' && !el.closest('[hidden]') &&
      (!re || re.test(el.textContent.trim())) && el.getBoundingClientRect().height>0);
  }
  function present(s,el) {
    const chat=s.plan.chat, box=chat.getBoundingClientRect(), rect=el.getBoundingClientRect();
    if (rect.top<box.top+12 || rect.bottom>box.bottom-16) {
      const top=chat.scrollTop+rect.top-box.top-Math.max(16,(box.height-rect.height)*.58);
      const reading=shownFrame===s.iframe && display && desktop.matches && !reduced.matches;
      chat.scrollTo({top,behavior:reading?'smooth':'instant'});
    }
    if(shownFrame!==s.iframe) {
      shownFrame?.remove();shownFrame=s.iframe;shownFrame.style.visibility='';
    }
    held=el;
    positionTarget();
  }
  function pulse(el) {
    if(reduced.matches) return Promise.resolve();
    const press=el.animate([{scale:'1'},{scale:'.94',offset:.45},{scale:'1'}],
      {duration:320,easing:'ease-in-out'});
    return press.finished.catch(()=>{});
  }
  async function run() {
    if(busy || !session?.plan || !wanted) return;
    busy=true;
    try {
      let attempts=0;
      while(session?.plan && wanted) {
        const s=session, w=wanted;
        if(s.path!==w.path || s.count>w.count) {open(w.path);break;}
        const advancing=s.count<w.count;
        const cue=advancing ? paths.get(s.path)[s.count] : w.focus;
        const el=control(s.plan,cue.selector,cue.text);
        if(!el) {
          if(++attempts>240) { console.error('Assist control did not appear',s.path,s.count,cue); break; }
          await wait(25); continue;
        }
        attempts=0;
        if(!advancing) {
          present(s,el);
          film.dataset.readyStep=String(w.index);
          break;
        }
        // A direct chapter jump replays earlier actions off-screen. A normal advance shows the press first.
        const visibleTap=display && held===el && shownFrame===s.iframe && w.count===s.count+1;
        if(visibleTap) {
          await pulse(el);
          if(s!==session || wanted.count<=s.count || wanted.path!==s.path) continue;
        }
        held=null; target.hidden=true;
        // Let people see the prototype's replies between desktop taps. Seeks replay offscreen at review speed.
        s.iframe.contentWindow.Sprout.pace(visibleTap && desktop.matches && !reduced.matches ? .55 : .015);
        el.click(); s.count++;
        await wait(0);
      }
    } finally {busy=false;}
  }
  return {
    show(index, part, visible) {
      const slide=slides[index], actions=slide.actions;
      const done=actions.filter(a=>a.at<=part).length;
      const action=actions[done];
      const nextSlide=slides[index+1];
      const result=slide.result || nextSlide?.result;
      const focus=action || (!slide.result && nextSlide?.actions[0]) ||
        (result && {selector:result[0],text:result[1]});
      display=visible;
      const key=index+':'+done;
      if(key===nextKey) { positionTarget();return; }
      nextKey=key;film.removeAttribute('data-ready-step');
      wanted={index,path:slide.path,count:starts[index]+done,action,focus};
      if(!session || session.path!==wanted.path || session.count>wanted.count) open(wanted.path);
      run();
    }
  };
}
