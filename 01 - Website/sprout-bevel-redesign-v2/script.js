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

const dayData = {
  morning: {
    number: '01',
    title: 'Your Daily Brief',
    copy: 'Weather, birthdays, events, reminders, and assigned tasks arrive in one calm view.',
    points: ['Today’s weather', 'Birthdays and events', 'Assigned to-dos'],
    image: './assets/daily-brief.png',
    alt: 'Sprout Daily Brief showing weather, birthdays, events, and reminders'
  },
  afternoon: {
    number: '02',
    title: 'Plans after pickup',
    copy: 'See nearby activities, open invitations, sports, and camps when the school day ends.',
    points: ['Local family activities', 'Invitations from your circle', 'Sports and summer camps'],
    image: './assets/events-home.webp',
    alt: 'Sprout home screen showing invitations and nearby family activities'
  },
  weekend: {
    number: '03',
    title: 'The plan in one place',
    copy: 'Keep the time, place, guest list, and event conversation together for the weekend ahead.',
    points: ['Birthday parties', 'Playdates and family events', 'Details shared with guests'],
    image: './assets/event-details.webp',
    alt: 'Sprout event details for a family birthday party'
  }
};

const dayTabs = [...document.querySelectorAll('.day-tabs [role="tab"]')];
const dayView = document.querySelector('#day-view');
const viewNumber = document.querySelector('#view-number');
const viewTitle = document.querySelector('#view-title');
const viewCopy = document.querySelector('#view-copy');
const viewPoints = document.querySelector('#view-points');
const viewImage = document.querySelector('#view-image');

function selectDay(tab, focus = false) {
  const data = dayData[tab.dataset.view];

  dayTabs.forEach(item => {
    const selected = item === tab;
    item.setAttribute('aria-selected', String(selected));
    item.tabIndex = selected ? 0 : -1;
  });

  dayView.setAttribute('aria-labelledby', tab.id);
  viewNumber.textContent = data.number;
  viewTitle.textContent = data.title;
  viewCopy.textContent = data.copy;
  viewImage.src = data.image;
  viewImage.alt = data.alt;
  viewPoints.replaceChildren(...data.points.map(point => {
    const item = document.createElement('li');
    item.textContent = point;
    return item;
  }));

  if (!reducedMotion.matches) {
    dayView.animate(
      [{ opacity: .3, transform: 'translateY(8px)' }, { opacity: 1, transform: 'translateY(0)' }],
      { duration: 320, easing: 'cubic-bezier(.16,1,.3,1)' }
    );
  }

  if (focus) tab.focus();
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
