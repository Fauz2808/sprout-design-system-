/* 20 Nov photo + mockup heroes: the Bevel-style interaction. The phone leans toward the pointer, the photo drifts the
   other way (depth), and anything marked data-seq appears in order. Respects reduced motion. */
(() => {
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hero = document.querySelector('[data-hero]');
  const tilt = document.querySelector('.tilt');
  const photo = document.querySelector('[data-photo]');
  if (!still && hero && matchMedia('(pointer: fine)').matches) {
    hero.addEventListener('pointermove', e => {
      const r = hero.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      if (tilt) tilt.style.transform = `perspective(1100px) rotateY(${x * 10}deg) rotateX(${-y * 8}deg)`;
      if (photo) photo.style.transform = `scale(1.06) translate(${-x * 14}px, ${-y * 10}px)`;
    });
    hero.addEventListener('pointerleave', () => { if (tilt) tilt.style.transform = ''; if (photo) photo.style.transform = ''; });
  }
  /* things that arrive one after another (messages, pills) */
  const seq = [...document.querySelectorAll('[data-seq]')];
  if (still) { seq.forEach(n => n.classList.add('on')); return; }
  const play = () => { seq.forEach(n => n.classList.remove('on')); seq.forEach((n, i) => setTimeout(() => n.classList.add('on'), 700 + i * +(hero?.dataset.gap || 900))); };
  play();
  if (hero?.dataset.loop) setInterval(play, +hero.dataset.loop);
})();
