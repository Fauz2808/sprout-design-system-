(() => {
  const tabs = [...document.querySelectorAll('.feature-tabs [role="tab"]')];
  const scene = document.querySelector('.hand-scene');
  const hand = document.querySelector('.tapping-hand');
  const panel = document.querySelector('#feature-preview');
  const screen = document.querySelector('#feature-screen');
  const caption = document.querySelector('#feature-caption');
  const status = document.querySelector('#feature-status');
  const ripple = document.querySelector('.tap-ripple');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const features = {
    brief: {
      image: './assets/daily-brief-updated.png',
      alt: "Daily Brief: completed task, carpool pickup, and today's school and activity schedule",
      caption: 'A little clarity for the day ahead.',
      tapX: .137
    },
    events: {
      image: './assets/events-updated.png',
      alt: 'Events: discover nearby storytime and outdoor activities by day',
      caption: 'Find the next thing to do together.',
      tapX: .349
    },
    chat: {
      image: './assets/chat-updated.png',
      alt: 'Chat: conversations with your school community and other parents',
      caption: 'Keep your people close to the plan.',
      tapX: .682
    }
  };
  const loaded = new Map();
  let request = 0;
  let pending = null;
  let commitTimer;
  let animations = [];

  function preload(key) {
    if (!loaded.has(key)) {
      const image = new Image();
      image.src = features[key].image;
      loaded.set(key, image.decode());
    }
    return loaded.get(key);
  }
  Object.keys(features).forEach(key => preload(key).catch(() => loaded.delete(key)));

  function cancelMotion() {
    clearTimeout(commitTimer);
    animations.forEach(animation => animation.cancel());
    animations = [];
    tabs.forEach(tab => tab.classList.remove('is-targeted'));
  }

  function commit(tab, data, animate) {
    tabs.forEach(item => {
      const selected = item === tab;
      item.setAttribute('aria-selected', String(selected));
      item.tabIndex = selected ? 0 : -1;
      item.classList.remove('is-targeted');
    });
    screen.src = data.image;
    screen.alt = data.alt;
    panel.setAttribute('aria-labelledby', tab.id);
    caption.textContent = data.caption;
    status.textContent = `${tab.textContent} preview displayed.`;
    panel.removeAttribute('aria-busy');
    pending = null;
    if (animate) {
      animations.push(screen.animate(
        [{opacity:.76,transform:'scale(.996)'}, {opacity:1,transform:'scale(1)'}],
        {duration:160,easing:'cubic-bezier(.16,1,.3,1)'}
      ));
      animations.push(ripple.animate([
        {opacity:.55,transform:'scale(.65)'},
        {opacity:0,transform:'scale(1.8)'}
      ], {duration:260,easing:'cubic-bezier(.16,1,.3,1)'}));
    }
  }

  async function select(tab, focus = false) {
    const id = ++request;
    cancelMotion();
    const key = tab.dataset.feature;
    const data = features[key];
    pending = tab;
    panel.setAttribute('aria-busy','true');
    tab.classList.add('is-targeted');
    if (focus) tab.focus();
    try {
      await preload(key);
    } catch {
      if (id !== request) return;
      loaded.delete(key);
      panel.removeAttribute('aria-busy');
      pending = null;
      status.textContent = 'Preview could not load. Select the feature to try again.';
      const shown = panel.getAttribute('aria-labelledby');
      tabs.forEach(item => {
        item.setAttribute('aria-selected',String(item.id === shown));
        item.tabIndex = item.id === shown ? 0 : -1;
      });
      return;
    }
    if (id !== request) return;
    if (motion.matches || !hand.complete || !hand.naturalWidth) {
      commit(tab,data,false);
      return;
    }
    function tap() {
      if (id !== request) return;
      const step = {x:data.tapX,y:.914};
      const bounds = scene.getBoundingClientRect();
      const display = panel.getBoundingClientRect();
      const handWidth = hand.getBoundingClientRect().width;
      const x = display.left - bounds.left + display.width * step.x - handWidth * .234;
      const y = display.top - bounds.top + display.height * step.y - handWidth * 1.5 * .0684;
      const pose = (dx,dy,rotation = 0,scale = 1) => `translate3d(${x+dx}px,${y+dy}px,0) rotate(${rotation}deg) scale(${scale})`;
      animations.push(hand.animate([
        {offset:0,opacity:0,transform:pose(64,70,6)},
        {offset:.22,opacity:1,transform:pose(12,18,2)},
        {offset:.36,opacity:1,transform:pose(0,0)},
        {offset:.47,opacity:1,transform:pose(0,3,0,.985)},
        {offset:.60,opacity:1,transform:pose(0,0)},
        {offset:1,opacity:0,transform:pose(58,78,7)}
      ], {duration:640,easing:'cubic-bezier(.22,.7,.3,1)'}));
      commitTimer = setTimeout(() => {
        if (id !== request) return;
        ripple.style.left = `${Number((step.x * 100).toFixed(1))}%`;
        ripple.style.bottom = `${Number(((1-step.y) * 100).toFixed(1))}%`;
        commit(tab,data,true);
      },230);
    }
    tap();
  }

  tabs.forEach((tab,index) => {
    tab.addEventListener('click', () => select(tab));
    tab.addEventListener('keydown', event => {
      const next = {
        ArrowRight:(index+1)%tabs.length,
        ArrowLeft:(index-1+tabs.length)%tabs.length,
        Home:0,
        End:tabs.length-1
      }[event.key];
      if (next === undefined) return;
      event.preventDefault();
      select(tabs[next],true);
    });
  });
  motion.addEventListener('change', () => { if (pending) select(pending); else cancelMotion(); });
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer=setTimeout(() => {if (pending) select(pending); else cancelMotion();},100);
  }, {passive:true});
})();
