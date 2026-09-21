const header = document.querySelector('#site-header');
const menuButton = document.querySelector('.menu-button');
const mobileMenu = document.querySelector('#mobile-menu');
const main = document.querySelector('main');
const footer = document.querySelector('footer');
const mobileQuery = window.matchMedia('(max-width: 50rem)');

function setMenu(open, returnFocus = false) {
  mobileMenu.hidden = !open;
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  menuButton.querySelector('use').setAttribute('href', open ? '#icon-close' : '#icon-menu');
  document.body.classList.toggle('menu-open', open);
  main.inert = open;
  footer.inert = open;

  if (open) mobileMenu.querySelector('a').focus();
  if (!open && returnFocus) menuButton.focus();
}

menuButton.addEventListener('click', () => {
  setMenu(menuButton.getAttribute('aria-expanded') !== 'true', true);
});

mobileMenu.addEventListener('click', event => {
  if (event.target.closest('a')) setMenu(false);
});

document.addEventListener('keydown', event => {
  if (menuButton.getAttribute('aria-expanded') !== 'true') return;

  if (event.key === 'Escape') {
    setMenu(false, true);
    return;
  }

  if (event.key === 'Tab') {
    const focusable = [menuButton, ...mobileMenu.querySelectorAll('a')];
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
  }
});

mobileQuery.addEventListener('change', event => {
  if (!event.matches) setMenu(false);
});

function updateHeader() {
  header.classList.toggle('scrolled', window.scrollY > 24);
}

window.addEventListener('scroll', updateHeader, { passive: true });
updateHeader();

const schedule = {
  wed: {
    time: '8:30 AM',
    type: 'School',
    title: 'Talent Show',
    location: 'Kindergarten',
    next: 'Soccer practice · 3:30 PM'
  },
  sat: {
    time: '10:00 AM',
    type: 'Activity',
    title: 'Kids Art & Craft Day',
    location: 'Griffith Park, LA',
    next: 'Share with another family'
  },
  sun: {
    time: '7:00 PM',
    type: 'Birthday',
    title: 'Richard’s Birthday Party',
    location: 'Kiker Elementary School',
    next: 'Event thread stays close'
  }
};

const dayTabs = [...document.querySelectorAll('.week-tabs [role="tab"]')];
const weekPanel = document.querySelector('#week-panel');
const eventTime = document.querySelector('#event-time');
const eventType = document.querySelector('#event-type');
const eventTitle = document.querySelector('#event-title');
const eventLocation = document.querySelector('#event-location');
const eventNext = document.querySelector('#event-next');

function selectDay(tab, focus = false) {
  const data = schedule[tab.dataset.day];

  dayTabs.forEach(item => {
    const selected = item === tab;
    item.setAttribute('aria-selected', String(selected));
    item.tabIndex = selected ? 0 : -1;
  });

  weekPanel.setAttribute('aria-labelledby', tab.id);
  eventTime.textContent = data.time;
  eventType.textContent = data.type;
  eventTitle.textContent = data.title;
  eventLocation.textContent = data.location;
  eventNext.textContent = data.next;
  if (!reducedMotion.matches) {
    weekPanel.animate(
      [{ opacity: .25, transform: 'translateY(8px)' }, { opacity: 1, transform: 'translateY(0)' }],
      { duration: 260, easing: 'cubic-bezier(.16,1,.3,1)' }
    );
  }

  if (focus) tab.focus();
}

dayTabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectDay(tab));
  tab.addEventListener('keydown', event => {
    let nextIndex;
    if (event.key === 'ArrowRight') nextIndex = (index + 1) % dayTabs.length;
    if (event.key === 'ArrowLeft') nextIndex = (index - 1 + dayTabs.length) % dayTabs.length;
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = dayTabs.length - 1;
    if (nextIndex === undefined) return;
    event.preventDefault();
    selectDay(dayTabs[nextIndex], true);
  });
});

const profileDemo = document.querySelector('#registration-demo');
const profileButton = document.querySelector('#profile-button');
const profileTitle = document.querySelector('#profile-title');
const profileStatus = document.querySelector('#profile-status');
let profileComplete = false;

profileButton.addEventListener('click', () => {
  profileComplete = !profileComplete;
  profileDemo.classList.toggle('complete', profileComplete);
  profileTitle.textContent = profileComplete ? 'Preview complete' : 'Family profile ready';
  profileButton.textContent = profileComplete ? 'Reset preview' : 'Try one tap';
  profileStatus.textContent = profileComplete
    ? 'Preview complete. No registration was submitted.'
    : 'Preview reset. Family profile is ready.';
});

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
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
