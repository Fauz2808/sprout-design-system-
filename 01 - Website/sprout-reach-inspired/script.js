document.documentElement.classList.add("js");

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const mobileQuery = window.matchMedia("(max-width: 52rem)");
const menuToggle = document.querySelector(".menu-toggle");
const mobileMenu = document.querySelector("#mobile-menu");
const main = document.querySelector("main");
const footer = document.querySelector("footer");

function setMenu(open, returnFocus = false) {
  mobileMenu.hidden = !open;
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  menuToggle
    .querySelector("use")
    .setAttribute("href", open ? "#i-close" : "#i-menu");
  document.body.classList.toggle("menu-open", open);
  main.inert = open;
  footer.inert = open;

  if (open) mobileMenu.querySelector("a").focus();
  if (!open && returnFocus) menuToggle.focus();
}

menuToggle.addEventListener("click", () => {
  setMenu(menuToggle.getAttribute("aria-expanded") !== "true", true);
});

mobileMenu.addEventListener("click", (event) => {
  if (event.target.closest("a")) setMenu(false);
});

document.addEventListener("keydown", (event) => {
  if (menuToggle.getAttribute("aria-expanded") !== "true") return;
  if (event.key === "Escape") {
    setMenu(false, true);
    return;
  }
  if (event.key !== "Tab") return;

  const focusable = [menuToggle, ...mobileMenu.querySelectorAll("a")];
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

mobileQuery.addEventListener("change", (event) => {
  if (!event.matches) setMenu(false);
});

const featureData = {
  brief: {
    number: "01",
    heading: "Your day, in order.",
    description:
      "Weather, birthdays, events, reminders, and assigned tasks arrive in one calm view.",
    items: [
      "Today’s weather",
      "Assigned to-dos",
      "School and activity schedule",
    ],
    image: "./assets/daily-brief-updated.png",
    alt: "Sprout Daily Brief showing tasks, carpool, and today's schedule",
    noteA: "Pickup covered",
    noteB: "One task left",
  },
  events: {
    number: "02",
    heading: "Plans after pickup.",
    description:
      "See nearby activities, open invitations, sports, and camps when the school day ends.",
    items: [
      "Local family activities",
      "Invitations from your circle",
      "Sports and summer camps",
    ],
    image: "./assets/events-updated.png",
    alt: "Sprout Events showing nearby storytime and outdoor family activities",
    noteA: "2.1 miles away",
    noteB: "This weekend",
  },
  chat: {
    number: "03",
    heading: "Keep people close.",
    description:
      "Group chats, event threads, and direct messages stay beside the plan they belong to.",
    items: [
      "School and grade circles",
      "Direct messages",
      "Event conversations",
    ],
    image: "./assets/chat-updated.png",
    alt: "Sprout Chat showing school circles and recent direct messages",
    noteA: "First Grade",
    noteB: "Six new messages",
  },
};

Object.values(featureData).forEach((feature) => {
  const image = new Image();
  image.src = feature.image;
});

const tabs = [...document.querySelectorAll('.feature-tabs [role="tab"]')];
const panel = document.querySelector("#feature-panel");
const featureNumber = document.querySelector("#feature-number");
const featureHeading = document.querySelector("#feature-heading");
const featureDescription = document.querySelector("#feature-description");
const featureList = document.querySelector("#feature-list");
const featureImage = document.querySelector("#feature-image");
const featureNoteA = document.querySelector("#feature-note-a");
const featureNoteB = document.querySelector("#feature-note-b");
const featureLive = document.querySelector("#feature-live");
const runningAnimations = new Set();

function animateElement(element, frames, options) {
  if (reducedMotion.matches || !element.animate) return;
  const animation = element.animate(frames, { fill: "backwards", ...options });
  runningAnimations.add(animation);
  const clean = () => runningAnimations.delete(animation);
  animation.addEventListener("finish", clean, { once: true });
  animation.addEventListener("cancel", clean, { once: true });
  return animation;
}

let featureAnimations = [];

function commitFeature(tab, focus = false) {
  const data = featureData[tab.dataset.feature];
  featureAnimations.forEach((animation) => animation?.cancel());

  tabs.forEach((item) => {
    const selected = item === tab;
    item.setAttribute("aria-selected", String(selected));
    item.tabIndex = selected ? 0 : -1;
  });

  featureNumber.textContent = data.number;
  featureHeading.textContent = data.heading;
  featureDescription.textContent = data.description;
  featureList.querySelectorAll("li").forEach((item, index) => {
    item.textContent = data.items[index];
  });
  featureImage.src = data.image;
  featureImage.alt = data.alt;
  featureNoteA.textContent = data.noteA;
  featureNoteB.textContent = data.noteB;
  panel.setAttribute("aria-labelledby", tab.id);
  featureLive.textContent = `${tab.dataset.feature === "brief" ? "Daily Brief" : tab.dataset.feature === "events" ? "Events" : "Chat"} preview selected.`;
  featureAnimations = [
    animateElement(
      featureImage,
      [
        { opacity: 0.55, transform: "translateY(8px)" },
        { opacity: 1, transform: "none" },
      ],
      { duration: 260, easing: "cubic-bezier(.16,1,.3,1)" },
    ),
    animateElement(
      document.querySelector(".feature-detail"),
      [
        { opacity: 0.7, transform: "translateY(6px)" },
        { opacity: 1, transform: "none" },
      ],
      { duration: 220, easing: "cubic-bezier(.16,1,.3,1)" },
    ),
  ];
  if (focus) tab.focus();
}

tabs.forEach((tab, index) => {
  tab.addEventListener("click", () => commitFeature(tab));
  tab.addEventListener("keydown", (event) => {
    let nextIndex;
    if (event.key === "ArrowRight") nextIndex = (index + 1) % tabs.length;
    if (event.key === "ArrowLeft")
      nextIndex = (index - 1 + tabs.length) % tabs.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = tabs.length - 1;
    if (nextIndex === undefined) return;
    event.preventDefault();
    commitFeature(tabs[nextIndex], true);
  });
});

const revealItems = [...document.querySelectorAll(".reveal")];
if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const siblings = entry.target.parentElement.querySelectorAll(".reveal");
        const delay =
          siblings.length > 1
            ? Math.min([...siblings].indexOf(entry.target) * 60, 180)
            : 0;
        animateElement(
          entry.target,
          [
            { opacity: 0.45, transform: "translateY(18px)" },
            { opacity: 1, transform: "none" },
          ],
          { duration: 520, delay, easing: "cubic-bezier(.16,1,.3,1)" },
        );
        revealObserver.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px 30px 0px", threshold: 0.05 },
  );
  revealItems.forEach((item) => revealObserver.observe(item));
}

const orbitScreens = [...document.querySelectorAll(".orbit-screen")];
orbitScreens.forEach((screen, index) => {
  animateElement(
    screen,
    [
      { opacity: 0.3, transform: "translateY(24px)" },
      { opacity: 1, transform: "none" },
    ],
    {
      duration: 700,
      delay: 80 + index * 90,
      easing: "cubic-bezier(.16,1,.3,1)",
    },
  );
});
reducedMotion.addEventListener("change", (event) => {
  if (event.matches) {
    runningAnimations.forEach((animation) => animation.cancel());
  }
});
