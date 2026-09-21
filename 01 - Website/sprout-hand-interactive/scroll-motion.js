(() => {
  const root = document.documentElement;
  const desktop = matchMedia('(min-width: 901px) and (min-height: 680px)');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const panel = document.querySelector('.day-panel');
  const track = document.createElement('div');
  track.className = 'day-scroll-track';
  panel.before(track);
  track.append(panel);
  const hero = document.querySelector('.hero');
  const memory = document.querySelector('.memory-stage');
  const cards = [...document.querySelectorAll('.product-card')];
  let frame = 0;
  let lastStep = -1;
  const clamp = value => Math.max(0, Math.min(1, value));
  const smooth = value => value * value * (3 - 2 * value);
  const storyPosition = progress => {
    if (progress <= .18) return 0;
    if (progress < .42) return smooth((progress - .18) / .24) * .5;
    if (progress <= .58) return .5;
    if (progress < .82) return .5 + smooth((progress - .58) / .24) * .5;
    return 1;
  };
  const position = element => {
    const rect = element.getBoundingClientRect();
    return clamp((innerHeight - rect.top) / (innerHeight + rect.height));
  };
  function render() {
    frame = 0;
    if (reduce.matches || !desktop.matches) return;
    const heroRect = hero.getBoundingClientRect();
    hero.style.setProperty('--hero-drift', `${clamp(-heroRect.top / heroRect.height) * 65}px`);
    const memoryProgress = position(memory) - .5;
    memory.style.setProperty('--photo-drift', `${memoryProgress * 96}px`);
    memory.style.setProperty('--phone-drift', `${memoryProgress * -60}px`);
    cards.forEach(card => card.style.setProperty('--device-drift', `${(position(card) - .5) * -48}px`));
    const rect = track.getBoundingClientRect();
    const top = parseFloat(getComputedStyle(panel).top);
    const progress = clamp((top - rect.top) / (track.offsetHeight - panel.offsetHeight));
    const shift = storyPosition(progress);
    panel.style.setProperty('--day-progress', progress);
    panel.style.setProperty('--day-shift', shift);
    const step = Math.min(2, Math.round(shift * 2));
    if (step !== lastStep) {
      lastStep = step;
      if (dayTabs[step].getAttribute('aria-selected') !== 'true') selectDay(dayTabs[step], false, true);
    }
  }
  function schedule() {
    if (!frame && !document.hidden) frame = requestAnimationFrame(render);
  }
  function configure() {
    const enabled = desktop.matches && !reduce.matches;
    root.classList.toggle('scroll-motion', enabled);
    root.classList.toggle('scroll-story', enabled);
    lastStep = -1;
    if (reduce.matches) document.querySelectorAll('.reveal').forEach(item => item.classList.add('is-visible'));
    if (!enabled) {
      const selected = dayTabs.findIndex(tab => tab.getAttribute('aria-selected') === 'true');
      dayViewport.scrollLeft = dayViewport.clientWidth * Math.max(0, selected);
    }
    schedule();
  }
  document.addEventListener('sprout:day-selected', event => {
    if (!root.classList.contains('scroll-story')) return;
    const top = parseFloat(getComputedStyle(panel).top);
    const start = scrollY + track.getBoundingClientRect().top - top;
    const length = track.offsetHeight - panel.offsetHeight;
    lastStep = event.detail;
    scrollTo({ top: start + length * (event.detail / 2), behavior: 'smooth' });
  });
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule, { passive: true });
  document.addEventListener('visibilitychange', schedule);
  desktop.addEventListener('change', configure);
  reduce.addEventListener('change', configure);
  configure();
})();
