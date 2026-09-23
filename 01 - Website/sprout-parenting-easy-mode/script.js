const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
const screenData = {
  brief: { src: './assets/daily-brief-updated.png', alt: 'Sprout Daily Brief' },
  events: { src: './assets/events-updated.png', alt: 'Sprout invitations and local events' },
  chat: { src: './assets/chat-updated.png', alt: 'Sprout Class Chat' }
};
const briefData = {
  reminder: { step: '01 / Reminder', caption: 'Tap a reminder and handle it before the school run.', src: './assets/daily-brief-updated.png', alt: 'Daily Brief reminder view' },
  invite: { step: '02 / Invitation', caption: 'Open an invitation, review the details, and join in one place.', src: './assets/birthday-invitation-card.png', alt: 'Birthday invitation in Sprout' },
  today: { step: '03 / Happening today', caption: 'See every change, activity, and pickup detail for today.', src: './assets/daily-brief-updated.png', alt: 'Daily Brief schedule for today' },
  upcoming: { step: '04 / Upcoming', caption: 'Look ahead before the rest of the week fills up.', src: './assets/events-updated.png', alt: 'Upcoming family events in Sprout' }
};
const voiceData = {
  reminders: ['“Remind me to bring towels for water day tomorrow.”', 'Reminder created', 'Bring towels for water day · Tomorrow, 7:00 AM'],
  birthdays: ['“Remind our group about Kennedy’s birthday on Friday.”', 'Birthday reminder ready', 'Kennedy turns 4 · Friday'],
  events: ['“Add the science night to our family calendar.”', 'Event added', 'Science Night · Thursday, 6:00 PM'],
  carpool: ['“Tell Mia’s carpool group I can do pickup today.”', 'Carpool updated', 'You’re covering pickup · Today']
};
function setSelected(buttons, active) {
  buttons.forEach((button) => {
    const selected = button === active;
    button.classList.toggle('is-active', selected);
    button.setAttribute('aria-selected', String(selected));
    button.tabIndex = selected ? 0 : -1;
  });
}
const heroButtons = [...document.querySelectorAll('[data-screen]')];
const heroScreen = document.querySelector('#hero-screen');
heroButtons.forEach((button) => button.addEventListener('click', () => {
  setSelected(heroButtons, button);
  const next = screenData[button.dataset.screen];
  heroScreen.style.opacity = '0';
  heroScreen.style.transform = 'scale(.985)';
  const swap = () => { heroScreen.src = next.src; heroScreen.alt = next.alt; heroScreen.style.opacity = '1'; heroScreen.style.transform = 'none'; };
  reduceMotion.matches ? swap() : setTimeout(swap, 140);
}));
const briefButtons = [...document.querySelectorAll('[data-brief]')];
const briefScreen = document.querySelector('#brief-screen');
const briefStep = document.querySelector('#brief-step');
const briefCaption = document.querySelector('#brief-caption');
let briefTimer;
function showBrief(button) {
  setSelected(briefButtons, button);
  const data = briefData[button.dataset.brief];
  briefScreen.style.opacity = '0';
  const update = () => { briefScreen.src = data.src; briefScreen.alt = data.alt; briefStep.textContent = data.step; briefCaption.textContent = data.caption; briefScreen.style.opacity = '1'; };
  reduceMotion.matches ? update() : setTimeout(update, 120);
}
function startBriefLoop() {
  clearInterval(briefTimer);
  if (reduceMotion.matches) return;
  briefTimer = setInterval(() => {
    const current = briefButtons.findIndex((button) => button.classList.contains('is-active'));
    showBrief(briefButtons[(current + 1) % briefButtons.length]);
  }, 3400);
}
briefButtons.forEach((button) => button.addEventListener('click', () => { showBrief(button); startBriefLoop(); }));
startBriefLoop();
const voiceButtons = [...document.querySelectorAll('[data-voice]')];
voiceButtons.forEach((button) => button.addEventListener('click', () => {
  setSelected(voiceButtons, button);
  const [prompt, label, result] = voiceData[button.dataset.voice];
  document.querySelector('#voice-prompt').textContent = prompt;
  document.querySelector('.voice-result small').textContent = label;
  document.querySelector('#voice-result').textContent = result;
}));
const revealObserver = new IntersectionObserver((entries) => entries.forEach((entry) => {
  if (entry.isIntersecting) { entry.target.classList.add('is-visible'); revealObserver.unobserve(entry.target); }
}), { threshold: .13 });
document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));
const menuButton = document.querySelector('.menu-button');
const mobileNav = document.querySelector('#mobile-nav');
menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!open));
  menuButton.setAttribute('aria-label', open ? 'Open menu' : 'Close menu');
  mobileNav.hidden = open;
});
mobileNav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  mobileNav.hidden = true;
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Open menu');
}));
