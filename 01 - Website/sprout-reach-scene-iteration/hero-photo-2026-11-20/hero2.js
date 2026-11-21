/* Version 2, refined: the phone leans toward the pointer and the photo drifts the other way (Bevel). The Daily Brief
   itself (brief.js) plays its own motion. Reduced motion and touch screens: nothing moves here. */
(() => {
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hero = document.querySelector('[data-hero]'), tilt = document.querySelector('.tilt2'), photo = document.querySelector('[data-photo]');
  if (still || !hero || !matchMedia('(pointer: fine)').matches) return;
  hero.addEventListener('pointermove', e => {
    const r = hero.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
    tilt.style.transform = `perspective(1200px) rotateY(${x * 9}deg) rotateX(${-y * 6}deg)`;
    if (photo) photo.style.transform = `scale(1.06) translate(${-x * 16}px, ${-y * 10}px)`;
  });
  hero.addEventListener('pointerleave', () => { tilt.style.transform = ''; if (photo) photo.style.transform = ''; });
})();
