const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const mobileQuery = window.matchMedia('(max-width: 50rem)');
const header = document.querySelector('#site-header');
const menuToggle = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('#mobile-menu');
const main = document.querySelector('main');
const footer = document.querySelector('footer');

function updateHeader() {
  header.classList.toggle('scrolled', window.scrollY > 28);
}

window.addEventListener('scroll', updateHeader, { passive: true });
updateHeader();

function setMenu(open, returnFocus = false) {
  mobileMenu.hidden = !open;
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  menuToggle.querySelector('use').setAttribute('href', open ? '#i-close' : '#i-menu');
  document.body.classList.toggle('menu-open', open);
  main.inert = open;
  footer.inert = open;

  if (open) mobileMenu.querySelector('a').focus();
  if (!open && returnFocus) menuToggle.focus();
}

menuToggle.addEventListener('click', () => {
  setMenu(menuToggle.getAttribute('aria-expanded') !== 'true', true);
});

mobileMenu.addEventListener('click', event => {
  if (event.target.closest('a')) setMenu(false);
});

document.addEventListener('keydown', event => {
  if (menuToggle.getAttribute('aria-expanded') !== 'true') return;

  if (event.key === 'Escape') {
    setMenu(false, true);
    return;
  }

  if (event.key !== 'Tab') return;
  const focusable = [menuToggle, ...mobileMenu.querySelectorAll('a')];
  const first = focusable[0];
  const last = focusable.at(-1);

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  }

  if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});

mobileQuery.addEventListener('change', event => {
  if (!event.matches) setMenu(false);
});

const dayTabs = [...document.querySelectorAll('.day-tabs [role="tab"]')];
const dayPanels = [...document.querySelectorAll('.day-view')];
const dayViewport = document.querySelector('.day-viewport');

function updateDayState(index, focus = false) {
  dayTabs.forEach((item, itemIndex) => {
    const selected = itemIndex === index;
    item.setAttribute('aria-selected', String(selected));
    item.tabIndex = selected ? 0 : -1;
    dayPanels[itemIndex].setAttribute('aria-hidden', String(!selected));
  });
  if (focus) dayTabs[index].focus();
}

function selectDay(tab, focus = false, fromScroll = false) {
  const index = dayTabs.indexOf(tab);
  updateDayState(index, focus);
  if (fromScroll) return;
  if (document.documentElement.classList.contains('scroll-story')) {
    document.dispatchEvent(new CustomEvent('sprout:day-selected', { detail: index }));
  } else {
    dayViewport.scrollTo({
      left: dayViewport.clientWidth * index,
      behavior: reducedMotion.matches ? 'auto' : 'smooth'
    });
  }
}

dayTabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectDay(tab));
  tab.addEventListener('keydown', event => {
    let targetIndex;
    if (event.key === 'ArrowRight') targetIndex = (index + 1) % dayTabs.length;
    if (event.key === 'ArrowLeft') targetIndex = (index - 1 + dayTabs.length) % dayTabs.length;
    if (event.key === 'Home') targetIndex = 0;
    if (event.key === 'End') targetIndex = dayTabs.length - 1;
    if (targetIndex === undefined) return;
    event.preventDefault();
    selectDay(dayTabs[targetIndex], true);
  });
});

let dayScrollFrame;
dayViewport.addEventListener('scroll', () => {
  if (document.documentElement.classList.contains('scroll-story')) return;
  cancelAnimationFrame(dayScrollFrame);
  dayScrollFrame = requestAnimationFrame(() => {
    const index = Math.max(0, Math.min(dayTabs.length - 1, Math.round(dayViewport.scrollLeft / dayViewport.clientWidth)));
    if (dayTabs[index].getAttribute('aria-selected') !== 'true') updateDayState(index);
  });
}, { passive: true });

window.addEventListener('resize', () => {
  if (document.documentElement.classList.contains('scroll-story')) return;
  const index = dayTabs.findIndex(tab => tab.getAttribute('aria-selected') === 'true');
  dayViewport.scrollLeft = dayViewport.clientWidth * Math.max(0, index);
}, { passive: true });

const profileDemo = document.querySelector('#profile-demo');
const profileButton = document.querySelector('#profile-button');
const profileState = document.querySelector('#profile-state');
const profileLive = document.querySelector('#profile-live');
let profileComplete = false;

profileButton.addEventListener('click', () => {
  profileComplete = !profileComplete;
  profileDemo.classList.toggle('complete', profileComplete);
  profileState.textContent = profileComplete ? 'Preview complete' : 'Family profile ready';
  profileButton.firstChild.textContent = profileComplete ? 'Reset preview' : 'Try one tap';
  profileLive.textContent = profileComplete
    ? 'Preview complete. No registration was submitted.'
    : 'Preview reset. Family profile is ready.';
});

const revealItems = [...document.querySelectorAll('.reveal')];

if (reducedMotion.matches || !('IntersectionObserver' in window)) {
  revealItems.forEach(item => item.classList.add('is-visible'));
} else {
  revealItems.forEach(item => item.classList.add('reveal-ready'));
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: .08 });

  revealItems.forEach(item => observer.observe(item));
}
