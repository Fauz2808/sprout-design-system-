const motion = matchMedia("(prefers-reduced-motion: reduce)");
const mobile = matchMedia("(max-width: 600px)");
const screens = {
  assist: {
    src: "./assets/sprout-assist-home.png",
    alt: "Sprout Assist menu for reminders, carpool, events, birthdays, and clubs",
    label: "Say it, and it's handled",
    name: "Sprout Assist",
  },
  brief: {
    src: "./assets/daily-brief-updated.png",
    alt: "Sprout Daily Brief showing tasks, carpool, and today’s schedule",
    label: "A calmer start",
    name: "Daily Brief",
  },
  events: {
    src: "./assets/events-updated.png",
    alt: "Sprout Events showing nearby family events for the week",
    label: "Plans around the corner",
    name: "Events",
  },
  chat: {
    src: "./assets/chat-updated.png",
    alt: "Sprout Chat showing school circles and direct messages",
    label: "Your people, close",
    name: "Chat",
  },
  clubs: {
    src: "./assets/clubs-updated.png",
    alt: "Sprout Clubs showing school communities and the parent directory",
    label: "Your circles, together",
    name: "Clubs",
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
const navDownload = document.querySelector(".nav-download");
if (navDownload) {
  let navDownloadVisible = true;
  const updateNavDownloadMotion = () => {
    navDownload.classList.toggle(
      "motion-paused",
      document.hidden || !navDownloadVisible,
    );
  };
  new IntersectionObserver(([entry]) => {
    navDownloadVisible = entry.isIntersecting;
    updateNavDownloadMotion();
  }).observe(navDownload);
  document.addEventListener("visibilitychange", updateNavDownloadMotion);
}
const heroScreen = document.querySelector("#hero-screen");
const heroPanel = document.querySelector("#hero-screen-panel");
const tapRipple = document.querySelector(".tap-ripple");
const tapPoints = { brief: 0.137, events: 0.318, assist: 0.5, chat: 0.682, clubs: 0.862 };
let previewTimer;
let previewAnimations = [];

function cancelPreviewMotion() {
  clearTimeout(previewTimer);
  previewAnimations.forEach((animation) => animation.cancel());
  previewAnimations = [];
  heroPanel.removeAttribute("aria-busy");
}

function commitPreview(key, animate = true) {
  const data = screens[key];
  heroScreen.src = data.src;
  heroScreen.alt = data.alt;
  // Sprout Assist is a live demo (assist-demo.js); the other tabs are screenshots
  if (window.sproutAssistDemo) {
    if (key === "assist") window.sproutAssistDemo.show("home");
    else window.sproutAssistDemo.show(key);
  }
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

// the phone's own tab bar is the only switcher (the hero tab row is gone):
// assist-demo.js calls this, and the ripple lands on the tab that was tapped
function selectPreview(key) {
  if (!screens[key]) return;
  cancelPreviewMotion();
  tapRipple.style.left = `${tapPoints[key] * 100}%`;
  tapRipple.style.bottom = `${(1 - 0.914) * 100}%`;
  commitPreview(key, !motion.matches);
}
window.sproutHero = { select: selectPreview };
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
  // the phone is coded (sections-demo.js); the screenshot is only the no-JS fallback
  if (window.sproutStory) window.sproutStory.show(key);
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
enter(document.querySelector(".phone-scene"), 24, 850, 120);
const classScreens = {
  chat: {
    src: "./assets/class-chat.png",
    alt: "Miss Taylor Class group chat in Sprout",
  },
  calendar: {
    src: "./assets/class-calendar.png",
    alt: "Miss Taylor Class calendar with school days and notes",
  },
  updates: {
    src: "./assets/class-updates.png",
    alt: "Teacher email updates collected inside the class",
  },
  links: {
    src: "./assets/class-links.png",
    alt: "Pinned class links for the school website, wish list, and donations",
  },
};
const classTabs = [...document.querySelectorAll("[data-class-view]")];
const classScreen = document.getElementById("class-screen");
const classPanel = document.getElementById("class-screen-panel");
Object.values(classScreens).forEach((screen) => {
  const image = new Image();
  image.src = screen.src;
});
function setClassView(tab, focus = false) {
  const view = classScreens[tab.dataset.classView];
  classTabs.forEach((item) => {
    const active = item === tab;
    item.setAttribute("aria-selected", String(active));
    item.tabIndex = active ? 0 : -1;
  });
  classPanel.setAttribute("aria-labelledby", tab.id);
  if (focus) tab.focus();
  if (window.sproutClasses) window.sproutClasses.show(tab.dataset.classView);
  if (classScreen.getAttribute("src") === view.src) return;
  classScreen.src = view.src;
  classScreen.alt = view.alt;
  enter(classScreen, 10, 380);
}
classTabs.forEach((tab, index) => {
  tab.addEventListener("click", () => setClassView(tab));
  tab.addEventListener("keydown", (event) => {
    let target;
    if (event.key === "ArrowDown" || event.key === "ArrowRight")
      target = (index + 1) % classTabs.length;
    if (event.key === "ArrowUp" || event.key === "ArrowLeft")
      target = (index - 1 + classTabs.length) % classTabs.length;
    if (event.key === "Home") target = 0;
    if (event.key === "End") target = classTabs.length - 1;
    if (target !== undefined) {
      event.preventDefault();
      setClassView(classTabs[target], true);
    }
  });
});
