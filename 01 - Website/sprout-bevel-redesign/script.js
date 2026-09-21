const header = document.querySelector('.header');
const menuButton = document.querySelector('.menu-toggle');
const menu = document.querySelector('#mobile-menu');
const main = document.querySelector('main');
const footer = document.querySelector('footer');
const mobile = matchMedia('(max-width: 760px)');

function closeMenu(returnFocus = false) {
  menu.hidden = true;
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Open menu');
  document.body.classList.remove('menu-open');
  main.inert = false;
  footer.inert = false;
  if (returnFocus) menuButton.focus();
}

menuButton.addEventListener('click', () => {
  if (!menu.hidden) return closeMenu(true);
  menu.hidden = false;
  menuButton.setAttribute('aria-expanded', 'true');
  menuButton.setAttribute('aria-label', 'Close menu');
  document.body.classList.add('menu-open');
  main.inert = true;
  footer.inert = true;
  menu.querySelector('a').focus();
});

header.addEventListener('click', event => {
  if (menu.hidden) return;
  const link = event.target.closest('a');
  if (!link) return;
  closeMenu();
  const target = document.querySelector(link.getAttribute('href'));
  if (target) {
    target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
    target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true });
  }
});

document.addEventListener('keydown', event => {
  if (menu.hidden) return;
  if (event.key === 'Escape') closeMenu(true);
  if (event.key === 'Tab') {
    const focusable = [...header.querySelectorAll('a, button')].filter(el => el.getClientRects().length);
    const first = focusable[0], last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
});
mobile.addEventListener('change', event => { if (!event.matches) closeMenu(); });
const updateHeader = () => header.classList.toggle('scrolled', scrollY > 30);
addEventListener('scroll', updateHeader, { passive: true });
updateHeader();

const tabs = [...document.querySelectorAll('[role="tab"]')];
function activateTab(tab, focus = false) {
  for (const item of tabs) {
    const selected = item === tab;
    item.setAttribute('aria-selected', String(selected));
    item.tabIndex = selected ? 0 : -1;
    const panel = document.getElementById(item.getAttribute('aria-controls'));
    panel.hidden = !selected;
    panel.classList.toggle('is-changing', selected);
  }
  if (focus) tab.focus();
}
tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => activateTab(tab));
  tab.addEventListener('keydown', event => {
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = tabs.length - 1;
    if (next === undefined) return;
    event.preventDefault();
    activateTab(tabs[next], true);
  });
});

// Exclusive disclosure behavior also supports browsers without details[name].
const briefDetails = [...document.querySelectorAll('.brief-accordion details')];
briefDetails.forEach(detail => detail.addEventListener('toggle', () => {
  if (detail.open) briefDetails.forEach(other => { if (other !== detail) other.open = false; });
}));

const demoButton = document.getElementById('register-demo');
const demoState = document.getElementById('registration-state');
const demoTitle = document.getElementById('demo-title');
const demoDescription = document.getElementById('demo-description');
const demoStatus = document.getElementById('demo-status');
let demoComplete = false;
demoButton.addEventListener('click', () => {
  demoComplete = !demoComplete;
  demoState.classList.toggle('registered', demoComplete);
  demoTitle.innerHTML = demoComplete ? 'You’re registered.' : 'Their next adventure.<br>Your easiest sign-up.';
  demoDescription.textContent = demoComplete ? 'That’s how simple a saved family profile can make it.' : 'Your saved family profile is ready.';
  demoButton.innerHTML = demoComplete ? 'Try again<svg class="icon" aria-hidden="true"><use href="#i-arrow"/></svg>' : 'Try one tap<svg class="icon" aria-hidden="true"><use href="#i-arrow"/></svg>';
  demoStatus.textContent = demoComplete ? 'Preview complete. No registration was submitted. Select Try again to reset.' : 'Preview reset. Your sample family profile is ready.';
});
