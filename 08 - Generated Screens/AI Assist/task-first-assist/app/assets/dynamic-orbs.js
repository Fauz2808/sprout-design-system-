/* Use the existing Sprout renderer for every visible Assist orb, with one animation loop. */
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const profiles = Object.fromEntries(['working', 'composing', 'listening'].map(state => {
    const canvas = document.createElement('canvas');
    return [state, { canvas, api: SproutThinkingOrb.create(canvas, { state }) }];
  }));
  let frame = 0;
  function mount() {
    document.querySelectorAll('img.mini-orb, img.approved-orb, .orb:not([data-live-orb]), canvas[data-orb-header]').forEach(el => {
      const canvas = document.createElement('canvas');
      canvas.className = el.className;
      if (el.matches('img,canvas')) canvas.id = el.id;
      canvas.width = canvas.height = 128;
      canvas.dataset.liveOrb = 'true';
      canvas.setAttribute('aria-hidden', 'true');
      if (el.matches('img,canvas')) el.replaceWith(canvas);
      else { el.dataset.liveOrb = 'true'; el.replaceChildren(canvas); }
    });
  }
  function draw() {
    frame = 0;
    if (document.hidden) return;
    const used = new Set();
    document.querySelectorAll('canvas[data-live-orb]').forEach(canvas => {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || rect.bottom < 0 || rect.top > innerHeight || rect.right < 0 || rect.left > innerWidth || canvas.closest('[inert]')) return;
      const state = canvas.closest('.typing-row,.work') || canvas.closest('.row')?.querySelector('.typing') || (canvas.closest('.header') && canvas.closest('[data-busy="true"]')) ? 'composing' : 'working';
      const profile = profiles[state];
      if (!used.has(state)) { profile.api.draw(); used.add(state); }
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, 128, 128);
      ctx.drawImage(profile.canvas, 0, 0, 128, 128);
      canvas.dataset.orbState = state;
    });
    if (!reduced.matches) frame = requestAnimationFrame(draw);
  }
  function refresh() { mount(); if (!frame) draw(); }
  new MutationObserver(refresh).observe(document.body, { childList: true, subtree: true });
  document.addEventListener('visibilitychange', () => { cancelAnimationFrame(frame); frame = 0; refresh(); });
  reduced.addEventListener('change', () => { cancelAnimationFrame(frame); frame = 0; refresh(); });
  document.addEventListener('transitionend', refresh);
  refresh();
})();
