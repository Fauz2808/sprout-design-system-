const motion = matchMedia("(prefers-reduced-motion: reduce)");
const mobile = matchMedia("(max-width: 600px)");
const screens = {
  brief: {
    src: "./assets/daily-brief-updated.png",
    alt: "Sprout Daily Brief showing tasks, carpool, and today’s schedule",
    label: "A calmer start",
    name: "Daily Brief",
  },
  events: {
    src: "./assets/events-updated.png",
    alt: "Sprout Events showing nearby family activities",
    label: "A plan around the corner",
    name: "Events",
  },
  chat: {
    src: "./assets/chat-updated.png",
    alt: "Sprout Chat showing school circles and direct messages",
    label: "Your people, close",
    name: "Chat",
  },
};
const assistScreens = {
  assist: {
    src: "./assets/sprout-assist-home.png",
    alt: "Sprout Assist menu for reminders, carpool, events, birthdays, and clubs",
    label: "Start with what you need",
  },
  reminder: {
    src: "./assets/sprout-assist-reminder-figma.png",
    alt: "Sprout Assist reminder review with date, time, and recipient",
    label: "A nudge, ready to send",
  },
  carpool: {
    src: "./assets/sprout-assist-carpool-figma.png",
    alt: "Sprout Assist carpool request review",
    label: "A clearer pickup plan",
  },
  event: {
    src: "./assets/sprout-assist-event-figma.png",
    alt: "Sprout Assist event review with invitation details",
    label: "From idea to invitation",
  },
  club: {
    src: "./assets/sprout-assist-club-figma.png",
    alt: "Sprout Assist club creation review",
    label: "A home for your people",
  },
};
const animations = new Map();
function enter(element, distance = 14, duration = 420, delay = 0) {
  animations.get(element)?.cancel();
  if (motion.matches || !element.animate) return;
  const animation = element.animate(
    [
      { opacity: 0.35, transform: `translateY(${distance}px)` },
      { opacity: 1, transform: "translateY(0)" },
    ],
    { duration, delay, easing: "cubic-bezier(.22,1,.36,1)", fill: "backwards" },
  );
  animations.set(element, animation);
  animation.onfinish = () => {
    if (animations.get(element) === animation) animations.delete(element);
  };
}
motion.addEventListener("change", () => {
  if (motion.matches) {
    animations.forEach((animation) => animation.cancel());
    animations.clear();
    if (typeof cancelPreviewMotion === "function") cancelPreviewMotion();
  }
});
Object.values(screens).forEach((screen) => {
  const img = new Image();
  img.src = screen.src;
});
Object.values(assistScreens).forEach((screen) => {
  const img = new Image();
  img.src = screen.src;
});
const heroScreen = document.querySelector("#hero-screen");
const previewTabs = [...document.querySelectorAll("[data-preview]")];
const handScene = document.querySelector(".hand-scene");
const tappingHand = document.querySelector(".tapping-hand");
const heroPanel = document.querySelector("#hero-screen-panel");
const tapRipple = document.querySelector(".tap-ripple");
const tapPoints = { brief: 0.137, events: 0.349, chat: 0.682 };
let previewRequest = 0;
let previewTimer;
let previewAnimations = [];

function cancelPreviewMotion() {
  clearTimeout(previewTimer);
  previewAnimations.forEach((animation) => animation.cancel());
  previewAnimations = [];
  previewTabs.forEach((tab) => tab.classList.remove("is-targeted"));
  heroPanel.removeAttribute("aria-busy");
}

function commitPreview(key, focus = false, animate = true) {
  const data = screens[key];
  previewTabs.forEach((tab) => {
    const active = tab.dataset.preview === key;
    tab.setAttribute("aria-selected", String(active));
    tab.tabIndex = active ? 0 : -1;
    tab.classList.remove("is-targeted");
    if (active && focus) tab.focus();
  });
  heroScreen.src = data.src;
  heroScreen.alt = data.alt;
  heroPanel.setAttribute("aria-labelledby", `preview-${key}`);
  heroPanel.removeAttribute("aria-busy");
  document.querySelector("#preview-status").textContent =
    `${data.name} preview`;
  if (animate && !motion.matches) {
    previewAnimations.push(
      heroScreen.animate(
        [
          { opacity: 0.72, transform: "scale(.995)" },
          { opacity: 1, transform: "scale(1)" },
        ],
        { duration: 180, easing: "cubic-bezier(.16,1,.3,1)" },
      ),
    );
    previewAnimations.push(
      tapRipple.animate(
        [
          { opacity: 0.55, transform: "scale(.65)" },
          { opacity: 0, transform: "scale(1.85)" },
        ],
        { duration: 260, easing: "cubic-bezier(.16,1,.3,1)" },
      ),
    );
  }
}

function selectPreview(key, focus = false) {
  const request = ++previewRequest;
  cancelPreviewMotion();
  const targetTab = previewTabs.find((tab) => tab.dataset.preview === key);
  targetTab.classList.add("is-targeted");
  heroPanel.setAttribute("aria-busy", "true");
  if (focus) targetTab.focus();

  if (motion.matches || !tappingHand.complete || !tappingHand.naturalWidth) {
    commitPreview(key, focus, false);
    return;
  }

  const sceneBounds = handScene.getBoundingClientRect();
  const screenBounds = heroPanel.getBoundingClientRect();
  const handWidth = tappingHand.getBoundingClientRect().width;
  const tapX = tapPoints[key];
  const tapY = 0.914;
  const x =
    screenBounds.left -
    sceneBounds.left +
    screenBounds.width * tapX -
    handWidth * 0.234;
  const y =
    screenBounds.top -
    sceneBounds.top +
    screenBounds.height * tapY -
    handWidth * 1.5 * 0.0684;
  const pose = (dx, dy, rotation = 0, scale = 1) =>
    `translate3d(${x + dx}px,${y + dy}px,0) rotate(${rotation}deg) scale(${scale})`;

  previewAnimations.push(
    tappingHand.animate(
      [
        { offset: 0, opacity: 0, transform: pose(45, 52, 5) },
        { offset: 0.25, opacity: 1, transform: pose(8, 11, 1.5) },
        { offset: 0.4, opacity: 1, transform: pose(0, 0) },
        { offset: 0.54, opacity: 1, transform: pose(0, 3, 0, 0.985) },
        { offset: 0.66, opacity: 1, transform: pose(0, 0) },
        { offset: 1, opacity: 0, transform: pose(40, 55, 5) },
      ],
      { duration: 520, easing: "cubic-bezier(.22,.7,.3,1)" },
    ),
  );
  previewTimer = setTimeout(() => {
    if (request !== previewRequest) return;
    tapRipple.style.left = `${tapX * 100}%`;
    tapRipple.style.bottom = `${(1 - tapY) * 100}%`;
    commitPreview(key, focus, true);
  }, 155);
}
previewTabs.forEach((tab, index) => {
  tab.addEventListener("click", () => selectPreview(tab.dataset.preview));
  tab.addEventListener("keydown", (event) => {
    let next;
    if (event.key === "ArrowRight") next = (index + 1) % previewTabs.length;
    if (event.key === "ArrowLeft")
      next = (index - 1 + previewTabs.length) % previewTabs.length;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = previewTabs.length - 1;
    if (next !== undefined) {
      event.preventDefault();
      selectPreview(previewTabs[next].dataset.preview, true);
    }
  });
});
const menu = document.querySelector("#mobile-nav");
const menuButton = document.querySelector(".menu-button");
function closeMenu(restore = false) {
  menu.hidden = true;
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", "Open menu");
  if (restore) menuButton.focus();
}
menuButton.addEventListener("click", () => {
  const open = menu.hidden;
  menu.hidden = !open;
  menuButton.setAttribute("aria-expanded", String(open));
  menuButton.setAttribute("aria-label", open ? "Close menu" : "Open menu");
});
menu
  .querySelectorAll("a")
  .forEach((link) => link.addEventListener("click", () => closeMenu()));
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !menu.hidden) closeMenu(true);
});
document.addEventListener("click", (event) => {
  if (!menu.hidden && !event.target.closest(".header")) closeMenu();
});
mobile.addEventListener("change", () => closeMenu());
const momentCards = [...document.querySelectorAll("[data-moment]")];
const hoverMoments = matchMedia("(hover: hover) and (pointer: fine)");
const stackedMoments = matchMedia("(max-width: 900px)");

function setMoment(index, focus = false) {
  const nextIndex = Math.max(0, Math.min(index, momentCards.length - 1));
  momentCards.forEach((card, cardIndex) => {
    const active = cardIndex === nextIndex;
    card.classList.toggle("is-active", active);
    const trigger = card.querySelector(".moment-trigger");
    const panel = card.querySelector(".moment-panel");
    trigger.setAttribute("aria-expanded", String(active));
    panel.setAttribute("aria-hidden", String(!active));
    if (active && focus) trigger.focus({ preventScroll: true });
  });
}

momentCards.forEach((card, index) => {
  const trigger = card.querySelector(".moment-trigger");
  trigger.addEventListener("click", () => setMoment(index));
  trigger.addEventListener("focus", () => setMoment(index));
  trigger.addEventListener("keydown", (event) => {
    let target;
    if (event.key === "ArrowRight" || event.key === "ArrowDown")
      target = (index + 1) % momentCards.length;
    if (event.key === "ArrowLeft" || event.key === "ArrowUp")
      target = (index - 1 + momentCards.length) % momentCards.length;
    if (event.key === "Home") target = 0;
    if (event.key === "End") target = momentCards.length - 1;
    if (target !== undefined) {
      event.preventDefault();
      setMoment(target, true);
    }
  });
  card.addEventListener("pointerenter", () => {
    if (hoverMoments.matches) setMoment(index);
  });
});
const momentCenterObserver = new IntersectionObserver(
  (entries) => {
    if (!stackedMoments.matches) return;
    const centered = entries
      .filter((entry) => entry.isIntersecting)
      .sort(
        (a, b) =>
          Math.abs(
            a.boundingClientRect.top +
              a.boundingClientRect.height / 2 -
              innerHeight / 2,
          ) -
          Math.abs(
            b.boundingClientRect.top +
              b.boundingClientRect.height / 2 -
              innerHeight / 2,
          ),
      );
    if (!centered.length) return;
    setMoment(Number(centered[0].target.closest("[data-moment]").dataset.moment));
  },
  { rootMargin: "-42% 0px -42% 0px", threshold: 0 },
);
momentCards.forEach((card) =>
  momentCenterObserver.observe(card.querySelector(".moment-trigger")),
);
setMoment(0);
const chapters = [...document.querySelectorAll("[data-story]")];
const storyLinks = [...document.querySelectorAll(".story-selector a")];
const storyScreen = document.querySelector("#story-screen");
let activeStory = "assist";
function setStory(key) {
  if (!assistScreens[key]) return;
  const changed = activeStory !== key;
  activeStory = key;
  const data = assistScreens[key];
  storyScreen.src = data.src;
  storyScreen.alt = data.alt;
  document.querySelector(".story-scene").dataset.screen = key;
  document.querySelector("#scene-label").textContent = data.label;
  document.querySelector("#scene-number").textContent =
    `${String(Object.keys(assistScreens).indexOf(key) + 1).padStart(2, "0")} / 05`;
  chapters.forEach((chapter) =>
    chapter.classList.toggle("active", chapter.dataset.story === key),
  );
  let activeLink;
  storyLinks.forEach((link) => {
    if (link.hash === `#story-${key}`) {
      link.setAttribute("aria-current", "step");
      activeLink = link;
    } else {
      link.removeAttribute("aria-current");
    }
  });
  if (mobile.matches && activeLink && changed) {
    const selector = activeLink.parentElement;
    selector.scrollTo({
      left:
        activeLink.offsetLeft -
        (selector.clientWidth - activeLink.offsetWidth) / 2,
      behavior: motion.matches ? "auto" : "smooth",
    });
  }
  if (changed) enter(storyScreen, 10, 280);
}
setStory(
  assistScreens[location.hash.replace("#story-", "")]
    ? location.hash.replace("#story-", "")
    : "assist",
);
storyLinks.forEach((link) =>
  link.addEventListener("click", () => {
    const key = link.hash.replace("#story-", "");
    setStory(key);
  }),
);
function setStoryFromEntries(entries) {
  const candidates = entries
    .filter((entry) => entry.isIntersecting)
    .sort(
      (a, b) =>
        Math.abs(
          a.boundingClientRect.top +
            a.boundingClientRect.height / 2 -
            innerHeight / 2,
        ) -
        Math.abs(
          b.boundingClientRect.top +
            b.boundingClientRect.height / 2 -
            innerHeight / 2,
        ),
    );
  if (candidates.length) setStory(candidates[0].target.dataset.story);
}
const chapterObserver = new IntersectionObserver(
  (entries) => {
    if (mobile.matches) return;
    setStoryFromEntries(entries);
  },
  { rootMargin: "-35% 0px -35% 0px", threshold: 0 },
);
const mobileChapterObserver = new IntersectionObserver(
  (entries) => {
    if (!mobile.matches) return;
    setStoryFromEntries(entries);
  },
  { rootMargin: "-68% 0px -22% 0px", threshold: 0 },
);
chapters.forEach((chapter) => {
  chapterObserver.observe(chapter);
  mobileChapterObserver.observe(chapter);
});
mobile.addEventListener("change", () => setStory(activeStory));
const reveals = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        enter(entry.target, 20, 650);
        reveals.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 },
);
document
  .querySelectorAll(".reveal")
  .forEach((element) => reveals.observe(element));
enter(document.querySelector(".hero-copy"), 18, 650, 60);
enter(document.querySelector(".hand-scene"), 24, 850, 120);
