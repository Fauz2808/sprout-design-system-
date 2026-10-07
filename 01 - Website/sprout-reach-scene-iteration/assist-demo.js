/* Interactive Sprout Assist demo in the hero's hand mockup.

   The story: Lydia (the hand) asks Sprout Assist to remind her husband, and the
   reminder lands in Matt's Daily Brief on the phone beside her. Screens follow
   the Figma Sprout Assist rework (section 12798:18362): 135 menu, 136 listening,
   143 heard, 147 review, 148 set. Matt's phone follows the shared Daily Brief
   (12403:210488).

   Nothing here records audio. Visitors cannot speak to a web page, so "heard"
   arrives on a timer, exactly when the real app would enable the check.
   Without JavaScript the hero keeps its static screenshot. */
(function () {
  const panel = document.querySelector("#hero-screen-panel");
  const stage = document.querySelector(".hero-stage");
  if (!panel || !stage) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  const A = "./assets/assist/";
  const ic = {
    back: '<svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    check: '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
    cal: '<svg viewBox="0 0 24 24"><rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 9.5h17M8 3v4M16 3v4"/></svg>',
    clock: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg>',
    sun: '<svg viewBox="0 0 24 24"><path d="M3 18h18M7 18a5 5 0 0 1 10 0M12 7V4M5.6 10.6 3.5 8.5M18.4 10.6l2.1-2.1"/></svg>',
    compass: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/></svg>',
    chat: '<svg viewBox="0 0 24 24"><path d="M4.5 19.5l1.2-3.6A7.5 7.5 0 1 1 8.4 18.6z"/></svg>',
    users: '<svg viewBox="0 0 24 24"><circle cx="9" cy="9" r="3.5"/><path d="M3 19a6 6 0 0 1 12 0M15.5 5.6a3.5 3.5 0 0 1 0 6.8M17.5 14.2A6 6 0 0 1 21 19"/></svg>',
  };
  // Phosphor regular (the icon set the app uses), from @phosphor-icons/core
  const PH = {"sun-horizon": "M240,152H199.55a73.54,73.54,0,0,0,.45-8,72,72,0,0,0-144,0,73.54,73.54,0,0,0,.45,8H16a8,8,0,0,0,0,16H240a8,8,0,0,0,0-16ZM72,144a56,56,0,1,1,111.41,8H72.59A56.13,56.13,0,0,1,72,144Zm144,56a8,8,0,0,1-8,8H48a8,8,0,0,1,0-16H208A8,8,0,0,1,216,200ZM72.84,43.58a8,8,0,0,1,14.32-7.16l8,16a8,8,0,0,1-14.32,7.16Zm-56,48.84a8,8,0,0,1,10.74-3.57l16,8a8,8,0,0,1-7.16,14.31l-16-8A8,8,0,0,1,16.84,92.42Zm192,15.16a8,8,0,0,1,3.58-10.73l16-8a8,8,0,1,1,7.16,14.31l-16,8a8,8,0,0,1-10.74-3.58Zm-48-55.16,8-16a8,8,0,0,1,14.32,7.16l-8,16a8,8,0,1,1-14.32-7.16Z", "compass": "M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216ZM172.42,72.84l-64,32a8.05,8.05,0,0,0-3.58,3.58l-32,64A8,8,0,0,0,80,184a8.1,8.1,0,0,0,3.58-.84l64-32a8.05,8.05,0,0,0,3.58-3.58l32-64a8,8,0,0,0-10.74-10.74ZM138,138,97.89,158.11,118,118l40.15-20.07Z", "chat-circle-dots": "M140,128a12,12,0,1,1-12-12A12,12,0,0,1,140,128ZM84,116a12,12,0,1,0,12,12A12,12,0,0,0,84,116Zm88,0a12,12,0,1,0,12,12A12,12,0,0,0,172,116Zm60,12A104,104,0,0,1,79.12,219.82L45.07,231.17a16,16,0,0,1-20.24-20.24l11.35-34.05A104,104,0,1,1,232,128Zm-16,0A88,88,0,1,0,51.81,172.06a8,8,0,0,1,.66,6.54L40,216,77.4,203.53a7.85,7.85,0,0,1,2.53-.42,8,8,0,0,1,4,1.08A88,88,0,0,0,216,128Z", "users": "M117.25,157.92a60,60,0,1,0-66.5,0A95.83,95.83,0,0,0,3.53,195.63a8,8,0,1,0,13.4,8.74,80,80,0,0,1,134.14,0,8,8,0,0,0,13.4-8.74A95.83,95.83,0,0,0,117.25,157.92ZM40,108a44,44,0,1,1,44,44A44.05,44.05,0,0,1,40,108Zm210.14,98.7a8,8,0,0,1-11.07-2.33A79.83,79.83,0,0,0,172,168a8,8,0,0,1,0-16,44,44,0,1,0-16.34-84.87,8,8,0,1,1-5.94-14.85,60,60,0,0,1,55.53,105.64,95.83,95.83,0,0,1,47.22,37.71A8,8,0,0,1,250.14,206.7Z", "calendar-dots": "M208,32H184V24a8,8,0,0,0-16,0v8H88V24a8,8,0,0,0-16,0v8H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM72,48v8a8,8,0,0,0,16,0V48h80v8a8,8,0,0,0,16,0V48h24V80H48V48ZM208,208H48V96H208V208Zm-68-76a12,12,0,1,1-12-12A12,12,0,0,1,140,132Zm44,0a12,12,0,1,1-12-12A12,12,0,0,1,184,132ZM96,172a12,12,0,1,1-12-12A12,12,0,0,1,96,172Zm44,0a12,12,0,1,1-12-12A12,12,0,0,1,140,172Zm44,0a12,12,0,1,1-12-12A12,12,0,0,1,184,172Z", "arrow-right": "M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z", "check": "M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z", "plus": "M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z", "magnifying-glass": "M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z", "note-pencil": "M229.66,58.34l-32-32a8,8,0,0,0-11.32,0l-96,96A8,8,0,0,0,88,128v32a8,8,0,0,0,8,8h32a8,8,0,0,0,5.66-2.34l96-96A8,8,0,0,0,229.66,58.34ZM124.69,152H104V131.31l64-64L188.69,88ZM200,76.69,179.31,56,192,43.31,212.69,64ZM224,128v80a16,16,0,0,1-16,16H48a16,16,0,0,1-16-16V48A16,16,0,0,1,48,32h80a8,8,0,0,1,0,16H48V208H208V128a8,8,0,0,1,16,0Z", "user-plus": "M256,136a8,8,0,0,1-8,8H232v16a8,8,0,0,1-16,0V144H200a8,8,0,0,1,0-16h16V112a8,8,0,0,1,16,0v16h16A8,8,0,0,1,256,136Zm-57.87,58.85a8,8,0,0,1-12.26,10.3C165.75,181.19,138.09,168,108,168s-57.75,13.19-77.87,37.15a8,8,0,0,1-12.25-10.3c14.94-17.78,33.52-30.41,54.17-37.17a68,68,0,1,1,71.9,0C164.6,164.44,183.18,177.07,198.13,194.85ZM108,152a52,52,0,1,0-52-52A52.06,52.06,0,0,0,108,152Z", "caret-down": "M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z", "user": "M230.92,212c-15.23-26.33-38.7-45.21-66.09-54.16a72,72,0,1,0-73.66,0C63.78,166.78,40.31,185.66,25.08,212a8,8,0,1,0,13.85,8c18.84-32.56,52.14-52,89.07-52s70.23,19.44,89.07,52a8,8,0,1,0,13.85-8ZM72,96a56,56,0,1,1,56,56A56.06,56.06,0,0,1,72,96Z", "bell": "M221.8,175.94C216.25,166.38,208,139.33,208,104a80,80,0,1,0-160,0c0,35.34-8.26,62.38-13.81,71.94A16,16,0,0,0,48,200H88.81a40,40,0,0,0,78.38,0H208a16,16,0,0,0,13.8-24.06ZM128,216a24,24,0,0,1-22.62-16h45.24A24,24,0,0,1,128,216ZM48,184c7.7-13.24,16-43.92,16-80a64,64,0,1,1,128,0c0,36.05,8.28,66.73,16,80Z", "sun-horizon-fill": "M248,160a8,8,0,0,1-8,8H16a8,8,0,0,1,0-16H56.45a73.54,73.54,0,0,1-.45-8,72,72,0,0,1,144,0,73.54,73.54,0,0,1-.45,8H240A8,8,0,0,1,248,160Zm-40,32H48a8,8,0,0,0,0,16H208a8,8,0,0,0,0-16ZM80.84,59.58a8,8,0,0,0,14.32-7.16l-8-16a8,8,0,0,0-14.32,7.16ZM20.42,103.16l16,8a8,8,0,1,0,7.16-14.31l-16-8a8,8,0,1,0-7.16,14.31ZM216,112a8,8,0,0,0,3.57-.84l16-8a8,8,0,1,0-7.16-14.31l-16,8A8,8,0,0,0,216,112ZM164.42,63.16a8,8,0,0,0,10.74-3.58l8-16a8,8,0,0,0-14.32-7.16l-8,16A8,8,0,0,0,164.42,63.16Z", "compass-fill": "M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm51.58,57.79-32,64a4.08,4.08,0,0,1-1.79,1.79l-64,32a4,4,0,0,1-5.37-5.37l32-64a4.08,4.08,0,0,1,1.79-1.79l64-32A4,4,0,0,1,179.58,81.79Z", "chat-circle-dots-fill": "M128,24A104,104,0,0,0,36.18,176.88L24.83,210.93a16,16,0,0,0,20.24,20.24l34.05-11.35A104,104,0,1,0,128,24ZM84,140a12,12,0,1,1,12-12A12,12,0,0,1,84,140Zm44,0a12,12,0,1,1,12-12A12,12,0,0,1,128,140Zm44,0a12,12,0,1,1,12-12A12,12,0,0,1,172,140Z", "users-fill": "M164.47,195.63a8,8,0,0,1-6.7,12.37H10.23a8,8,0,0,1-6.7-12.37,95.83,95.83,0,0,1,47.22-37.71,60,60,0,1,1,66.5,0A95.83,95.83,0,0,1,164.47,195.63Zm87.91-.15a95.87,95.87,0,0,0-47.13-37.56A60,60,0,0,0,144.7,54.59a4,4,0,0,0-1.33,6A75.83,75.83,0,0,1,147,150.53a4,4,0,0,0,1.07,5.53,112.32,112.32,0,0,1,29.85,30.83,23.92,23.92,0,0,1,3.65,16.47,4,4,0,0,0,3.95,4.64h60.3a8,8,0,0,0,7.73-5.93A8.22,8.22,0,0,0,252.38,195.48Z", "calendar-blank": "M208,32H184V24a8,8,0,0,0-16,0v8H88V24a8,8,0,0,0-16,0v8H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM72,48v8a8,8,0,0,0,16,0V48h80v8a8,8,0,0,0,16,0V48h24V80H48V48ZM208,208H48V96H208V208Z", "repeat": "M24,128A72.08,72.08,0,0,1,96,56H204.69L194.34,45.66a8,8,0,0,1,11.32-11.32l24,24a8,8,0,0,1,0,11.32l-24,24a8,8,0,0,1-11.32-11.32L204.69,72H96a56.06,56.06,0,0,0-56,56,8,8,0,0,1-16,0Zm200-8a8,8,0,0,0-8,8,56.06,56.06,0,0,1-56,56H51.31l10.35-10.34a8,8,0,0,0-11.32-11.32l-24,24a8,8,0,0,0,0,11.32l24,24a8,8,0,0,0,11.32-11.32L51.31,200H160a72.08,72.08,0,0,0,72-72A8,8,0,0,0,224,120Z", "user-check": "M144,157.68a68,68,0,1,0-71.9,0c-20.65,6.76-39.23,19.39-54.17,37.17a8,8,0,0,0,12.25,10.3C50.25,181.19,77.91,168,108,168s57.75,13.19,77.87,37.15a8,8,0,0,0,12.25-10.3C183.18,177.07,164.6,164.44,144,157.68ZM56,100a52,52,0,1,1,52,52A52.06,52.06,0,0,1,56,100Zm197.66,33.66-32,32a8,8,0,0,1-11.32,0l-16-16a8,8,0,0,1,11.32-11.32L216,148.69l26.34-26.35a8,8,0,0,1,11.32,11.32Z", "user-list": "M152,80a8,8,0,0,1,8-8h88a8,8,0,0,1,0,16H160A8,8,0,0,1,152,80Zm96,40H160a8,8,0,0,0,0,16h88a8,8,0,0,0,0-16Zm0,48H184a8,8,0,0,0,0,16h64a8,8,0,0,0,0-16Zm-96.25,22a8,8,0,0,1-5.76,9.74,7.55,7.55,0,0,1-2,.26,8,8,0,0,1-7.75-6c-6.16-23.94-30.34-42-56.25-42s-50.09,18.05-56.25,42a8,8,0,0,1-15.5-4c5.59-21.71,21.84-39.29,42.46-48a48,48,0,1,1,58.58,0C129.91,150.71,146.16,168.29,151.75,190ZM80,136a32,32,0,1,0-32-32A32,32,0,0,0,80,136Z", "map-pin": "M128,64a40,40,0,1,0,40,40A40,40,0,0,0,128,64Zm0,64a24,24,0,1,1,24-24A24,24,0,0,1,128,128Zm0-112a88.1,88.1,0,0,0-88,88c0,31.4,14.51,64.68,42,96.25a254.19,254.19,0,0,0,41.45,38.3,8,8,0,0,0,9.18,0A254.19,254.19,0,0,0,174,200.25c27.45-31.57,42-64.85,42-96.25A88.1,88.1,0,0,0,128,16Zm0,206c-16.53-13-72-60.75-72-118a72,72,0,0,1,144,0C200,161.23,144.53,209,128,222Z", "ticket": "M232,104a8,8,0,0,0,8-8V64a16,16,0,0,0-16-16H32A16,16,0,0,0,16,64V96a8,8,0,0,0,8,8,24,24,0,0,1,0,48,8,8,0,0,0-8,8v32a16,16,0,0,0,16,16H224a16,16,0,0,0,16-16V160a8,8,0,0,0-8-8,24,24,0,0,1,0-48ZM32,167.2a40,40,0,0,0,0-78.4V64H88V192H32Zm192,0V192H104V64H224V88.8a40,40,0,0,0,0,78.4Z", "clock": "M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm64-88a8,8,0,0,1-8,8H128a8,8,0,0,1-8-8V72a8,8,0,0,1,16,0v48h48A8,8,0,0,1,192,128Z", "star": "M239.18,97.26A16.38,16.38,0,0,0,224.92,86l-59-4.76L143.14,26.15a16.36,16.36,0,0,0-30.27,0L90.11,81.23,31.08,86a16.46,16.46,0,0,0-9.37,28.86l45,38.83L53,211.75a16.38,16.38,0,0,0,24.5,17.82L128,198.49l50.53,31.08A16.4,16.4,0,0,0,203,211.75l-13.76-58.07,45-38.83A16.43,16.43,0,0,0,239.18,97.26Zm-15.34,5.47-48.7,42a8,8,0,0,0-2.56,7.91l14.88,62.8a.37.37,0,0,1-.17.48c-.18.14-.23.11-.38,0l-54.72-33.65a8,8,0,0,0-8.38,0L69.09,215.94c-.15.09-.19.12-.38,0a.37.37,0,0,1-.17-.48l14.88-62.8a8,8,0,0,0-2.56-7.91l-48.7-42c-.12-.1-.23-.19-.13-.5s.18-.27.33-.29l63.92-5.16A8,8,0,0,0,103,91.86l24.62-59.61c.08-.17.11-.25.35-.25s.27.08.35.25L153,91.86a8,8,0,0,0,6.75,4.92l63.92,5.16c.15,0,.24,0,.33.29S224,102.63,223.84,102.73Z", "caret-right": "M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z"};
  const phi = (k, cls = "") => `<svg class="ph ${cls}" viewBox="0 0 256 256" aria-hidden="true"><path d="${PH[k]}"/></svg>`;
  // the app's floating tab bar (Figma 12900:24890): the active tab shows Phosphor's
  // fill weight, the others regular; Sprout Assist is the clover, at 50% when idle
  const TABS = [
    ["brief", "sun-horizon", "Daily Brief"],
    ["events", "compass", "Events"],
    ["assist", "", "Sprout Assist"],
    ["chat", "chat-circle-dots", "Chat"],
    ["clubs", "users", "Clubs"],
  ];
  const navBar = (active) => `<nav class="sa-nav" aria-label="App tabs">${TABS.map(([k, icon, label]) =>
    `<button data-nav="${k}" class="${k === active ? "on" : ""}"${k === active ? ' aria-current="page"' : ""}>${
      icon ? phi(icon, "o") + phi(icon + "-fill", "f") : `<img src="${A}clover.webp" alt="">`}${
      k === "chat" ? '<i class="badge">2</i>' : ""}<span>${label}</span></button>`).join("")}</nav>`;
  const statusBar = `<div class="sa-sb" aria-hidden="true"><span>9:41</span><span class="r">
    <svg width="18" height="12" viewBox="0 0 18 12"><rect x="0" y="8" width="3" height="4" rx="1"/><rect x="5" y="6" width="3" height="6" rx="1"/><rect x="10" y="3" width="3" height="9" rx="1"/><rect x="15" y="0" width="3" height="12" rx="1"/></svg>
    <svg width="16" height="12" viewBox="0 0 16 12"><path d="M8 11.5 5.6 9a3.4 3.4 0 0 1 4.8 0zM3.4 6.8a6.5 6.5 0 0 1 9.2 0l-1.3 1.3a4.7 4.7 0 0 0-6.6 0zM1.1 4.5a9.8 9.8 0 0 1 13.8 0l-1.3 1.3a8 8 0 0 0-11.2 0z"/></svg>
    <svg width="27" height="13" viewBox="0 0 27 13"><rect x=".5" y=".5" width="23" height="12" rx="3.5" fill="none" stroke="#1e3e2b"/><rect x="2.5" y="2.5" width="19" height="8" rx="2"/><rect x="25" y="4.5" width="1.5" height="4" rx=".7"/></svg>
  </span></div>`;
  const rows = [
    ["reminder", "Reminder", "A quick nudge for you or your spouse", "ic-reminder"],
    ["carpool", "Carpool", "Request for pick up and drop off from others", "ic-carpool"],
    ["event", "Event", "Playdates, outings & parties", "ic-event"],
    ["birthday", "Birthday", "A magical AI cover for your kid, in seconds", "ic-birthday"],
    ["club", "Club", "Gather your people by interest", "ic-club"],
  ];
  const needs = [
    ["need-who", "Who’s it for?", "You, your spouse, or both of you."],
    ["need-what", "What’s it about?", "Say what you need to remember."],
    ["need-when", "When’s it happening?", "Add a date, a time, or both. Totally optional."],
  ];

  // Carpool (Figma section 12798:18485): 138/144 listening, 149 review, 150 posted
  const cpNeeds = [
    ["need-where", "Where will your kid be picked up?", "Is it school, summer camp, or somewhere else?"],
    ["need-who", "Who’s it for?", "For you, your spouse, or ask other parents."],
    ["need-when", "When’s it happening?", "Add a date and a time."],
  ];
  // Event (Figma section 12798:18607): 145 listening, 151 review, 152 send invites, 153 sent
  const evNeeds = [
    ["need-what", "What’s it about?", "The occasion, like a birthday or a playdate."],
    ["need-when", "When’s it happening?", "Add a date and a time."],
    ["need-where", "Where’s it happening?", "A park, a home, or an address."],
  ];
  const EV_TITLE = "Let’s Have Fun at Zilker Park";
  // Birthday: there is no Birthday flow in Figma yet, so it borrows the others' pattern
  // (listening → thinking → a result screen) and ends on the Birthday Card 12911:173634
  const bdNeeds = [
    ["need-who", "Who’s it for?", "Your kid, or a friend’s."],
    ["need-what", "What’s the vibe?", "Colors, a theme, the things they love."],
    ["need-when", "When’s the party?", "Add a date and a time."],
  ];
  const bdCard = () => `<div class="bd-card"><div class="in"><img class="cv" src="${A}bday-cover.webp" alt="">
      <b>Presley’s 6th Birthday</b><p><em>Oct 3</em>2PM (CST)</p><i class="shine"></i></div></div>`;
  const EV_ABOUT = "Join us for a fun-filled celebration as we honor Presley’s 6th birthday at Zilker Park! Games, laughter, and treats all afternoon. Bring your friends and family to share in the joy.";
  // who can be invited (152): the family's classes, sub groups and friends, all from the demo's cast
  const INV = {
    clubs: [["club-kinder", "Kinder"], ["club-first", "First Grade"], ["club-fourth", "Fourth Grade"]],
    groups: [["FG", "First Grade Dads"], ["MT", "Miss Taylor"], ["MS", "Miss Sarah"]],
    friends: [["mem-emily", "Emily Centineo"], ["mem-jake", "Jake Thompson"], ["mem-jessica", "Jessica LaRonde"], ["mem-mike", "Mike Johnson"], ["mem-sarah", "Sarah Baker"], ["dm-raj", "Raj Singh"]],
  };
  const invPick = (kind, on) => INV[kind].map(([a, n], i) => `<button class="inv-i" data-inv="${kind}" aria-pressed="${on(i)}">
        <span class="av">${kind === "groups" ? `<b>${a}</b>` : `<img src="${A}${a}.webp" alt="">`}<i>${phi("check")}</i></span><span class="n">${n}</span></button>`).join("");
  const FLOWS = {
    reminder: { icon: "bell", quote: "“Remind my husband to pick up Presley from school at 2PM today.”", needs, next: "review" },
    carpool: { icon: "bus-lg", quote: "“Can you help me grab my kids on Friday morning and take them to Kiker Elementary?”", needs: cpNeeds, next: "cp-review" },
    birthday: { icon: "bday-lg", quote: "“Make a birthday cover for Presley turning 6. Soft gold, with balloons and flowers!”", needs: bdNeeds, next: "bd-ready" },
    event: { icon: "event-lg", quote: "“Let’s throw a party for Presley’s 6th birthday at Zilker Park this Saturday at 2PM!”", needs: evNeeds, next: "ev-review" },
  };
  const needList = (list) => list.map(([img, n, d]) => `<div class="item"><span class="sa-tile"><img src="${A}${img}.webp" alt=""></span>
          <span class="tx"><span class="n">${n}</span><br><span class="d">${d}</span></span></div>`).join("");
  // Austin, drawn in code: the Figma frame's map is a San Francisco placeholder
  const MAP = `<svg viewBox="0 0 361 173" role="img" aria-label="Map near Zilker Park, Austin">
      <rect width="361" height="173" fill="#e9e5dc"/>
      <path d="M150 10 L300 22 L316 96 L220 108 L160 92 Z" fill="#cfe2c6"/>
      <path d="M0 120 C70 104 150 128 230 114 S330 96 361 102 V128 C300 124 240 146 160 142 S50 136 0 148 Z" fill="#b9d4e3"/>
      <g fill="none" stroke="#fff" stroke-linecap="round">
        <path d="M0 64 C90 58 200 70 361 60" stroke-width="7"/>
        <path d="M110 0 L128 173" stroke-width="5"/><path d="M332 0 L322 173" stroke-width="5"/>
        <path d="M0 26 L150 34" stroke-width="3"/><path d="M40 0 L52 110" stroke-width="3"/>
        <path d="M230 108 L250 173" stroke-width="3"/><path d="M0 162 L361 158" stroke-width="3"/>
      </g>
      <g font-family="Inter, sans-serif" font-size="9" fill="#7d715e">
        <text x="8" y="58">Barton Springs Rd</text><text x="238" y="138" fill="#4f7d94">Lady Bird Lake</text>
      </g>
      <text x="236" y="46" font-family="Playfair Display, serif" font-size="12" fill="#2f6b43">Zilker Park</text>
      <ellipse cx="206" cy="92" rx="9" ry="3" fill="rgba(13,13,18,.18)"/>
      <path d="M206 91 C198 80 193 74 193 67 A13 13 0 0 1 219 67 C219 74 214 80 206 91 Z" fill="#186338"/>
      <circle cx="206" cy="67" r="4.5" fill="#fff"/>
    </svg>`;
  const app = document.createElement("div");
  app.className = "assist-app";
  app.setAttribute("role", "group");
  app.setAttribute("aria-label", "Try Sprout Assist: set a reminder for your spouse");
  app.innerHTML = `${statusBar}
  <section class="sa-screen sa-home is-on" data-s="home">
    <div class="sa-tile logo"><img src="${A}clover.webp" alt=""></div>
    <h3>What are we creating today?</h3>
    <p class="pick">Pick one below</p>
    <div class="sa-rows">${rows
      .map(
        ([k, n, d, img]) => `<button class="sa-row${k === "reminder" ? " is-hint" : ""}" data-pick="${k}">
          <span class="sa-tile"><img src="${A}${img}.webp" alt=""></span>
          <span class="tx"><span class="n">${n}</span><span class="d">${d}</span></span></button>`,
      )
      .join("")}</div>
    <div class="sa-tip down" data-tip="home" style="top:338px;right:24px">Tap Reminder to try it</div>
  </section>
  <section class="sa-screen sa-listen" data-s="listen">
    <div class="sa-head"><button class="sa-back" data-go="home" aria-label="Back">${ic.back}</button><span class="sp"></span></div>
    <div class="body">
      <div class="sa-tile icon"><img class="flow-icon" src="${A}bell.webp" alt=""></div>
      <div class="sa-say">
        <span class="lbl">Say it like this</span>
        <span class="q">${FLOWS.reminder.quote}</span>
        <div class="row"><span class="sa-orb"><img src="${A}orb.webp" alt=""><canvas class="sa-thinking-orb" aria-label="Listening…"></canvas></span>
          <span class="state" aria-live="polite">Listening…</span>
          <button class="sa-check" data-act="done" aria-label="Done talking">${ic.check}</button></div>
      </div>
      <div class="sa-need"><h4>Needed information</h4><div class="list">${needList(needs)}</div></div>
    </div>
    <div class="sa-tip up" data-tip="listen" style="top:470px;right:14px">Tap ✓ when you’re done</div>
    <span class="sa-home-ind"></span>
  </section>
  <section class="sa-screen sa-review" data-s="review">
    <div class="sa-head"><button class="sa-back" data-go="listen" aria-label="Back">${ic.back}</button><span class="t">Review Reminder</span><span class="sp"></span></div>
    <div class="body">
      <div class="sa-field"><div class="l">Reminder</div><div class="v">Pick up Presley from school</div></div>
      <div class="sa-when"><span class="f"><span class="ic">${ic.cal}</span>Today, Sep 24</span>
        <span class="f"><span class="ic">${ic.clock}</span>2:00 PM</span><span class="opt">Optional</span></div>
      <div class="sa-who"><p class="l">Who is this for?</p><div class="opts">
        <button data-who="me" aria-pressed="false"><span class="e">👩</span>Myself</button>
        <button data-who="spouse" aria-pressed="true"><span class="e">👨</span>Spouse</button>
        <button data-who="both" aria-pressed="false"><span class="e">💛</span>Both</button></div></div>
    </div>
    <button class="sa-cta" data-act="set">Set Reminder</button>
    <span class="sa-home-ind"></span>
  </section>
  <section class="sa-screen sa-set" data-s="set">
    <div class="mid"><div class="ring"><span>${ic.check}</span></div>
      <h3>Your reminder is set</h3><p class="msg"></p></div>
    <button class="sa-cta" data-act="again">Try it again</button>
    <span class="sa-home-ind"></span>
  </section>`;
  app.insertAdjacentHTML("beforeend", `
  <section class="sa-screen sa-brief" data-s="brief">
    <div class="db-scroll" tabindex="0" aria-label="Daily Brief, scrollable">
      <div class="db-top"><img class="av" src="${A}lydia.webp" alt=""><div class="t"><b>Sprout AI</b><span>Thursday, September 24</span></div>
        <span class="cal">${phi("calendar-dots")}</span></div>
      <div class="db-hello"><div><h3>Your day, in order.</h3><em>Full, but manageable.</em></div>
        <div class="wx"><span>☀️</span>68–86°</div></div>
      <hr>
      <div class="db-att">
        <div class="hd"><div><div class="n">Need your attention</div><div class="d att-sub">Great, you got everything done today.</div></div>
          <span class="ring att-ring" style="--p:1"><span class="att-count">1/1</span></span></div>
        <button class="db-todo is-done" aria-pressed="true"><span class="box">${phi("check")}</span>
          <span class="tx"><span class="n">Presley submit project reports</span><span class="m">Miss Taylor Class · <small>Due Friday</small></span></span>
          <span class="go">${phi("arrow-right")}</span></button>
      </div>
      <hr>
      <p class="db-h">🚗 Carpool</p>
      <div class="db-carpool"><span class="img"><img src="${A}bus.webp" alt=""></span>
        <span><b>You're covering drop-off & pick-up for Mia today</b><i>Tap for pickup details →</i></span></div>
      <hr>
      <p class="db-h">📅 Happening today</p>
      <div class="db-tl">
        <div class="ev red"><span class="tm">Today</span><span class="dot"></span><div class="card"><b>No School</b><span>It’s a holiday today</span></div></div>
        <div class="line">
          <div class="ev"><span class="tm">8:30 AM</span><span class="dot"></span><div class="card"><b>Talent Show</b><span>Kindergarten · Auditorium</span></div></div>
          <div class="ev"><span class="tm">1:30 PM</span><span class="dot"></span><div class="card"><b>Soccer practice</b><span>Little Shots · Field 2</span></div></div>
          <div class="ev"><span class="tm">6:30 PM</span><span class="dot"></span><div class="card"><b>Parent-teacher night</b><span>1st Grade · Room 102</span></div></div>
        </div>
      </div>
      <hr>
      <p class="db-h">📆 Upcoming events</p>
      <div class="db-up">
        <div class="row"><span class="date"><small>Sep</small>25</span><div><div class="n">✅ Mrs. Taylor's Class Photo Day <i>8:30 AM</i></div>
          <p>Don’t forget to fill in the photo slot in the link I shared.</p><span class="by">By: James Martin</span></div></div>
        <div class="row"><span class="date"><small>Sep</small>26</span><div><div class="n">📝 Spirit Night at Mandola's</div>
          <p>20% of proceeds go to our class fund. Just mention Kiker 1st Grade.</p><span class="by">By: Dana Reyes</span></div></div>
        <div class="row"><span class="date red"><small>Oct</small>12</span><div><div class="n">🚫 No School</div>
          <p>Fall break</p><span class="by">By: Kiker Elementary</span></div></div>
      </div>
      <hr>
      <div class="db-lunch"><p class="db-h">🥪 Today’s Lunch (Kiker Elementary)</p>
        <ol><li>Hamburger 🍖 🌱</li><li>Rebellyous Burger 🍖</li><li>SunButter & Jelly Sandwich 🍖 🥪</li></ol></div>
      <hr>
      <p class="db-h">🎂 Birthdays</p>
      <div class="db-bday"><span class="cake">🎂</span><div><b>Kennedy turns 4 today!</b><span>Say happy birthday at drop-off 👋</span></div></div>
      <p class="db-bline"><b>Presley (6)</b> · Oct 6th</p><p class="db-bline"><b>Rome (1)</b> · Oct 7th</p>
      <hr>
      <div class="db-msg"><p class="db-h">💬 New messages</p>
        <p>2 unread in <u>Kindergarten</u></p><p>1 message from <u>Sarah Chen</u></p></div>
    </div>
    <span class="sa-home-ind"></span>
  </section>`);
  app.insertAdjacentHTML("beforeend", `
  <section class="sa-screen sa-chat" data-s="chat">
    <div class="ch-head"><span class="sq brand">${phi("plus")}</span><h3>Chat</h3>
      <span class="r"><span class="sq">${phi("magnifying-glass")}</span><span class="sq">${phi("note-pencil")}</span></span></div>
    <div class="ch-scroll" tabindex="0" aria-label="Chat, scrollable">
      <div class="ch-groups">
        <span><img src="${A}grp-first-grade.webp" alt="">First Grade</span>
        <span><i class="mono">MT</i>Ms. Taylor’s</span>
        <span><img src="${A}grp-cdc.webp" alt="">3 year old’s</span>
        <span><img class="tile" src="${A}grp-bday.webp" alt="">Richard’s B-day</span>
      </div>
      <div class="ch-dmh"><h4>Direct Messages</h4>${phi("caret-down")}</div>
      ${[
        ["raj", "Raj Singh", "Raj: See you there!", "8:30 PM", 4],
        ["joe", "Joe Mravca", "You: Yeah I’ll call you again in a minute", "9:00 PM", 4],
        ["robert", "Robert Hugos", "Robert: my golf score was so good today!", "8:45 PM", 2],
        ["scott", "Scott Vogelgesang", "Scott: I don’t think so, let me think again", "8:50 PM", 5],
        ["eitan", "Eitan Miller", "You: I’ll go surf with you as well", "8:55 PM", 1],
        ["fatima", "Fatima Ali", "Fatima: Looking forward to it!", "9:15 PM", 6],
      ].map(([img, n, m, t, c]) => `<div class="ch-dm"><img src="${A}dm-${img}.webp" alt=""><div class="tx"><b>${n}</b><span>${m}</span></div>
        <div class="meta"><small>${t}</small><i>${c}</i></div></div>`).join("")}
    </div>
    <span class="sa-home-ind"></span>
  </section>
  <section class="sa-screen sa-carpool-room" data-s="carpool-chat">
    <header class="cc-head">
      <button class="cc-back" data-go="chat" aria-label="Back to Chat">${ic.back}</button>
      <div class="cc-person"><b>Sarah Baker</b><span><img src="${A}bus.webp" alt="">Friday, Sep 25 · 7:30 AM</span></div>
      <button class="cc-directions" type="button" aria-label="Open carpool directions">${phi("compass")}<span>Directions</span></button>
    </header>
    <div class="cc-scroll" tabindex="0" aria-label="Carpool chat with Sarah Baker">
      <div class="cc-match"><span>🎉</span><div><b>You’ve been matched with Sarah for carpool!</b><small>Drop-off &amp; Pick-up · Presley</small></div></div>
      <p class="cc-day">Friday, September 25</p>
      <div class="cc-thread" role="log" aria-live="polite" aria-relevant="additions text">
        <article class="cc-message theirs"><img src="${A}mem-sarah.webp" alt=""><div><small>Sarah Baker</small><p>Hi Lydia! I can help with Friday’s drop-off and pickup. I’ll be there at 7:30 AM.</p><time>9:41 AM</time></div></article>
        <article class="cc-message mine"><div><p>Amazing, thank you! Presley will be ready by the front gate.</p><time>9:41 AM</time></div></article>
      </div>
      <button class="cc-live-card" type="button">
        <span><b>Friday Live Activity</b><small>Tap to track today’s pickup</small></span>
        <span class="cc-live-people"><i>SB</i><img src="${A}lydia.webp" alt=""></span>
      </button>
      <div class="cc-typing" role="status" hidden><img src="${A}mem-sarah.webp" alt=""><span>Sarah is typing<i></i><i></i><i></i></span></div>
    </div>
    <form class="cc-compose" aria-label="Message Sarah Baker">
      <button class="cc-add" type="button" aria-label="Add attachment">${phi("plus")}</button>
      <input class="cc-input" type="text" placeholder="Type a message" aria-label="Message Sarah Baker" autocomplete="off" maxlength="280">
      <button class="cc-send" type="submit" aria-label="Send message" disabled>${phi("arrow-right")}</button>
    </form>
    <span class="sa-home-ind"></span>
  </section>
  <section class="sa-screen sa-clubs" data-s="clubs">
    <div class="cl-scroll" tabindex="0" aria-label="Clubs, scrollable">
      <div class="cl-comms">
        <span class="on"><img src="${A}club-kiker.webp" alt="">Kiker</span>
        <span><img src="${A}club-cdc.webp" alt="">CDC</span>
        <span><img src="${A}club-ssc.webp" alt="">SSC Soccer</span>
        <span><img src="${A}club-creator.webp" alt="">Creator Camp</span>
      </div>
      <div class="cl-chips" role="group" aria-label="Filter by class">
        ${["All", "Kindergarten", "1st Grade", "2nd Grade", "Mrs. Taylor's Class", "Mrs. Kruszone's Class"]
          .map((c, i) => `<button class="${i === 0 ? "on" : ""}" aria-pressed="${i === 0}">${c}</button>`).join("")}
      </div>
      <div class="cl-dir"><span class="ring">50%</span><div class="tx"><b>Member Directory</b><span>You've met 8 out of 16 members</span></div>
        <span class="sq">${phi("magnifying-glass")}</span><span class="sq">${phi("user-plus")}</span></div>
      ${[
        ["jake", "Jake Thompson", "Erick's Dad", "new"],
        ["jessica", "Jessica LaRonde", "Robert’s Mom", "new"],
        ["emily", "Emily Centineo", "Flore’s Mom", 12],
        ["mike", "Mike Johnson", "Hawkins' Dad", 10],
        ["sarah", "Sarah Baker", "Howard’s Mom", 8],
      ].map(([img, n, r, m]) => `<div class="cl-mem"><span class="pic"><img src="${A}mem-${img}.webp" alt="">${m !== "new" ? `<span class="bdg"><img src="${A}clover.webp" alt=""></span>` : ""}</span><div class="tx"><b>${n}${m !== "new" ? '<i class="met">Met</i>' : ""}</b><span>${r}</span></div>
        ${m === "new" ? '<i class="new">New</i>' : `<i class="meets">${phi("user")}${m} meets</i>`}</div>`).join("")}
    </div>
    <span class="sa-home-ind"></span>
  </section>`);
  app.insertAdjacentHTML("beforeend", `
  <section class="sa-screen sa-cpreview" data-s="cp-review">
    <div class="sa-head"><button class="sa-back" data-go="listen" aria-label="Back">${ic.back}</button><span class="t">Review your carpool request</span><span class="sp"></span></div>
    <div class="cp-scroll" tabindex="0" aria-label="Carpool request, scrollable">
      <div class="cp-who"><img src="${A}lydia.webp" alt=""><div><b>Lydia Martin</b><span>Presley’s Mom</span></div></div>
      <div class="cp-in is-set"><span class="ico">${phi("calendar-blank")}</span><div><small>Selected Date &amp; Time</small><b>Friday, Sep 25 · 7:30 AM</b></div></div>
      <div class="cp-in"><div><small>Help needed</small><b>Drop off &amp; Pick up</b></div>${phi("caret-down")}</div>
      <div class="cp-in"><div><small>Which Class</small><b>Miss Taylor’s Class</b></div>${phi("caret-down")}</div>
      <div class="cp-in"><div><small>General Location</small><b>Near Zilker Park</b></div></div>
      <h5>Optional</h5>
      <button class="cp-in cp-routine" data-act="routine" aria-pressed="true"><span class="ico">${phi("repeat")}</span><span class="lb">Make it routine</span><span class="tg"><i></i></span></button>
      <p class="cp-dir">Directions</p>
      <div class="cp-map">${MAP}</div>
    </div>
    <div class="cp-bottom"><button class="sa-cta" data-act="post">Post to Class Chat</button></div>
    <span class="sa-home-ind"></span>
  </section>
  <section class="sa-screen sa-set cp-posted" data-s="cp-posted">
    <div class="mid"><div class="ring"><span>${ic.check}</span></div>
      <h3>Your request is posted</h3>
      <p class="msg">It’s in Miss Taylor’s Class chat now. We’ll let you know the moment a parent taps “Yes, I can help!”</p></div>
    <button class="sa-cta" data-act="openchat">Open Class Chat</button>
    <span class="sa-home-ind"></span>
  </section>
  <section class="sa-screen bd-ready" data-s="bd-ready">
    <div class="mid">${bdCard()}
      <h3>Presley’s cover is ready</h3>
      <p>Made from what you said. Add it to the party invite, or share it in the class chat.</p></div>
    <button class="sa-cta" data-act="bddone">Done</button>
    <span class="sa-home-ind"></span>
  </section>
  <section class="sa-screen sa-evreview" data-s="ev-review">
    <div class="ev-scroll2" tabindex="0" aria-label="Event, scrollable">
      <div class="ev-cover"><img src="${A}ev-cover.webp" alt=""></div>
      <div class="ev-form">
        <h3>${EV_TITLE}</h3>
        <div class="cp-in ev-line"><span class="ico">${phi("calendar-blank")}</span><span class="lb">Saturday, Oct 3 · 2 PM (CST)</span></div>
        <div class="cp-in"><div><small>Location</small><b>Zilker Park</b></div></div>
        <div class="cp-in ev-desc"><div><b>Event Description</b><p>${EV_ABOUT}</p></div></div>
        <h5>Optional</h5>
        <button class="cp-in cp-routine" data-act="routine" aria-pressed="true"><span class="ico">${phi("user-check")}</span><span class="lb">Require approval</span><span class="tg"><i></i></span></button>
        <div class="cp-in ev-line"><span class="ico">${phi("user-list")}</span><span class="lb">20 spots</span></div>
      </div>
    </div>
    <div class="ev-headfloat"><button class="sa-back" data-go="listen" aria-label="Back">${ic.back}</button></div>
    <div class="ev-btns"><button class="b2" data-act="cover">Change Cover</button><button class="b1" data-go="ev-invite">Invite People</button></div>
    <span class="sa-home-ind"></span>
  </section>
  <section class="sa-screen sa-evinvite" data-s="ev-invite">
    <div class="sa-head"><button class="sa-back" data-go="ev-review" aria-label="Back">${ic.back}</button><span class="t">Send Invites</span><span class="sp"></span></div>
    <div class="inv-scroll" tabindex="0" aria-label="People to invite, scrollable">
      <div class="inv-search">${phi("magnifying-glass")}Search</div>
      <div class="inv-h"><h5>Your clubs</h5><button data-invall="clubs">Select All</button></div>
      <div class="inv-row">${invPick("clubs", (i) => i === 1)}</div>
      <div class="inv-h"><h5>Sub Groups</h5><button data-invall="groups">Select All</button></div>
      <div class="inv-row">${invPick("groups", (i) => i === 1)}</div>
      <div class="inv-h"><h5>Friends</h5><button data-invall="friends">Select All</button></div>
      <div class="inv-row wrap">${invPick("friends", (i) => i < 3)}</div>
    </div>
    <div class="ev-btns"><button class="b2" data-act="skipinv">Skip</button><button class="b1" data-act="sendinv">Send Invites</button></div>
    <span class="sa-home-ind"></span>
  </section>
  <section class="sa-screen sa-evsent" data-s="ev-sent">
    <div class="ev-sent-top"><div class="ring"><span>${ic.check}</span></div><b>Invites Sent!</b><span>Your event is live and invites are on their way</span></div>
    <div class="ev-cover sm"><img src="${A}ev-cover.webp" alt="">
      <span class="host"><img src="${A}lydia.webp" alt="">Lydia Martin</span><span class="spots"><i>${phi("user-list")}</i><em class="ev-count">0/20</em></span></div>
    <div class="ev-det"><h4>${EV_TITLE}</h4>
      <div class="r"><span class="ico">${phi("calendar-blank")}</span><div><b>Saturday, Oct 3</b><small>2 PM (CST)</small></div></div>
      <div class="r"><span class="ico">${phi("map-pin")}</span><div><b>Zilker Park</b><small>Austin, Texas</small></div></div></div>
    <div class="ev-btns"><button class="b2" data-act="copylink">Copy Link</button><button class="b1" data-act="myevents">My Events</button></div>
    <span class="sa-home-ind"></span>
  </section>
  <div class="sp-note sa-note" role="status"><span class="ic"><img src="${A}clover.webp" alt=""></span>
  <div><div class="a">Sprout · now</div><div class="t">Sarah Baker can help</div><div class="s">She tapped “Yes, I can help!” for Friday, 7:30 AM</div></div></div>`);

  // Events (Figma 12900:24890): Discover / My Events, a week strip, and cards. The week
  // starts today (Thursday, September 24) so it tells the same day as the brief.
  const EV_PHOTO = { story: "ev-storytime", nature: "ev-nature", splash: "ev-splash" };
  const WEEK = [["Thu", 24], ["Fri", 25], ["Sat", 26], ["Sun", 27], ["Mon", 28], ["Tue", 29], ["Wed", 30]];
  // [photo, title, meta, distance, interest tag or ""]; a tagged card moves the
  // distance into its footer next to Share
  const EVENTS = {
    24: [["story", "Storytime at BookPeople", "10:00 AM · Free · Downtown Austin", "2.1 mi", ""],
      ["nature", "Nature Scavenger Hunt", "Zilker Park", "3 mi", ""],
      ["splash", "Toddler Splash Hour", "11:30 AM · Deep Eddy Pool", "4 mi", "Swimming"]],
    25: [["nature", "Nature Scavenger Hunt", "4:00 PM · Zilker Park", "3 mi", "Outdoors"],
      ["story", "Storytime at BookPeople", "10:00 AM · Free · Downtown Austin", "2.1 mi", ""]],
    26: [["splash", "Toddler Splash Hour", "9:30 AM · Deep Eddy Pool", "4 mi", ""],
      ["story", "Saturday Story & Craft", "10:30 AM · $5 · BookPeople", "2.1 mi", "Reading"],
      ["nature", "Family Nature Walk", "5:00 PM · Zilker Park", "3 mi", ""]],
    27: [["nature", "Nature Scavenger Hunt", "10:00 AM · Zilker Park", "3 mi", ""],
      ["splash", "Toddler Splash Hour", "1:00 PM · Deep Eddy Pool", "4 mi", "Swimming"]],
    28: [["story", "Storytime at BookPeople", "10:00 AM · Free · Downtown Austin", "2.1 mi", ""]],
    29: [["splash", "Toddler Splash Hour", "11:30 AM · Deep Eddy Pool", "4 mi", ""],
      ["story", "Storytime at BookPeople", "10:00 AM · Free · Downtown Austin", "2.1 mi", "Reading"]],
    30: [["story", "Storytime at BookPeople", "10:00 AM · Free · Downtown Austin", "2.1 mi", ""],
      ["nature", "Nature Scavenger Hunt", "4:00 PM · Zilker Park", "3 mi", "Outdoors"]],
  };
  const evCard = ([photo, title, meta, dist, tag]) => `<article class="ev-card${tag ? " is-tagged" : ""}">
      <div class="pic"><img src="${A}${EV_PHOTO[photo]}.webp" alt="">
        ${tag ? "" : `<span class="dist">${dist}</span>`}</div>
      <div class="bd">${tag ? `<span class="tag">${tag}</span>` : ""}<h4>${title}</h4><p>${meta}</p>
        ${tag ? `<div class="ft"><span>${dist}</span><span class="share"><i><img src="${A}ev-share.webp" alt=""></i>Share</span></div>` : ""}</div>
    </article>`;
  app.insertAdjacentHTML("beforeend", `
  <section class="sa-screen sa-events" data-s="events">
    <div class="ev-top">
      <div class="ev-tabs"><button class="on" data-evtab="discover" aria-pressed="true">Discover</button><button data-evtab="mine" aria-pressed="false">My Events</button><i class="bar"></i></div>
      <div class="ev-week">${WEEK.map(([d, n], i) => `<button data-day="${n}" class="${i === 0 ? "on" : ""}" aria-pressed="${i === 0}"><small>${d}</small>${n}</button>`).join("")}</div>
    </div>
    <div class="ev-scroll" tabindex="0" aria-label="Events, scrollable">
      <div class="ev-list" data-list="discover">${EVENTS[24].map(evCard).join("")}</div>
      <div class="ev-list ev-mine" data-list="mine" hidden>
        <p class="db-h">✅ You’re going</p>
        <div class="db-up">
          <div class="row"><span class="date"><small>Sep</small>25</span><div><div class="n">Mrs. Taylor's Class Photo Day <i>8:30 AM</i></div>
            <p>Kiker Elementary · Room 102</p><span class="by">By: James Martin</span></div></div>
          <div class="row"><span class="date"><small>Sep</small>26</span><div><div class="n">Spirit Night at Mandola's <i>5:00 PM</i></div>
            <p>20% of proceeds go to our class fund.</p><span class="by">By: Dana Reyes</span></div></div>
        </div>
        <p class="db-h">✉️ Waiting on you</p>
        <div class="db-up">
          <div class="row"><span class="date"><small>Nov</small>7</span><div><div class="n">Family Fun Day at Zilker Park <i>6:30 PM</i></div>
            <p>Zilker Park · Invited by Ryan Mitchell</p><span class="by">Reply in your Daily Brief</span></div></div>
        </div>
      </div>
    </div>
    <span class="sa-home-ind"></span>
  </section>`);
  // one tab bar for the whole app, so it stays put while the screens change under it
  app.insertAdjacentHTML("beforeend", navBar("assist"));
  const tabbar = app.querySelector(":scope > .sa-nav");
  panel.appendChild(app);

  // Matt's phone, beside the hand on wide screens
  // Matt's full Daily Brief (Figma 12403:210488, the view a couple shares): his own list,
  // then Lydia's, then the rest of the brief. Lydia's reminder lands in his list.
  const mtTodo = (n, m, { tag = "", done = false, go = false } = {}) => `<div class="db-todo${done ? " is-done" : ""}"><span class="box">${phi("check")}</span>
      <span class="tx"><span class="n">${n}${tag}</span><span class="m">${m}</span></span>${go ? `<span class="go">${phi("arrow-right")}</span>` : ""}</div>`;
  const spouseBrief = `<div class="app">
      ${statusBar}
      <div class="sp-note" role="status"><span class="ic"><img src="${A}clover.webp" alt=""></span>
        <div><div class="a">Sprout · now</div><div class="t">Lydia set a reminder for you</div><div class="s">Pick up Presley from school at 2:00 PM</div></div></div>
      <div class="mt-scroll" tabindex="0" aria-label="Matt's Daily Brief, scrollable">
        <div class="db-top"><img class="av" src="${A}matt.webp" alt=""><div class="t"><b>Sprout AI</b><span>Thursday, September 24</span></div>
          <span class="cal">${phi("bell")}</span><span class="cal">${phi("calendar-dots")}</span></div>
        <div class="db-hello"><div><h3>Your day, in order.</h3><em>Full, but manageable.</em></div>
          <div class="wx"><span>☀️</span>68–86°</div></div>
        <hr>
        <div class="db-att mt-att">
          <div class="hd"><span class="chev">${phi("caret-down")}</span><div class="tt"><div class="n">Needs your attention</div><div class="d mt-sub">Great, you got everything done today.</div></div>
            <span class="ring mt-ring" style="--p:1"><span class="mt-count">3/3</span></span></div>
          <div class="mt-new"><div>${mtTodo("Pick up Presley from school", "Today · <small>2:00 PM</small>", { tag: ' <i class="tag">From Lydia</i>' })}</div></div>
        </div>
        <div class="db-att mt-rem">
          <div class="hd"><span class="chev open">${phi("caret-down")}</span><img class="av" src="${A}lydia.webp" alt=""><div class="tt"><div class="n">Lydia’s Reminders</div><div class="d">2 still open.</div></div>
            <span class="ring" style="--p:.333"><span>1/3</span></span></div>
          ${mtTodo("Bring towels for water day", "1st Grade Class · <small>Due Today</small>")}
          ${mtTodo("Presley submit project reports", "Miss Taylor Class · <small>Due Friday</small>", { done: true, go: true })}
          ${mtTodo("Plan field trip itinerary", '4th Grade Class · <small class="late">2 days overdue</small>', { tag: ' <i class="tag">From you</i>' })}
          <div class="ft"><span>Lydia hasn’t opened it since Saturday</span><b>Nudge</b></div>
        </div>
        <p class="mt-cap">Lydia sees the same pair on her phone, with your list underneath hers.</p>
        <hr>
        <p class="db-h">🚗 Carpool</p>
        <div class="db-carpool"><span class="img"><img src="${A}bus.webp" alt=""></span>
          <span><b>You're covering drop-off & pick-up for Mia today</b><i>Tap for pickup details →</i></span></div>
        <hr>
        <div class="mt-invh"><p class="db-h">📆 Your Invitations</p><span>2 Events</span></div>
        <div class="mt-inv">
          <div class="card"><div class="row"><img class="pic" src="${A}inv-zilker.webp" alt=""><div><b>Family Fun Day at Zilker Park</b><span>Sat, Nov 7 · 6:30pm CST</span>
            <span class="host"><img src="${A}dm-robert.webp" alt="">Ryan Mitchell</span></div></div>
            <div class="acts"><i>Deny</i><i class="y">Join</i></div></div>
          <div class="card"><div class="row"><img class="pic" src="${A}grp-bday.webp" alt=""><div><b>Richard’s Birthday Party</b><span>Sat, Oct 17 · 3:00pm CST</span>
            <span class="host"><img src="${A}dm-scott.webp" alt="">Scott Walker</span></div></div>
            <div class="acts"><i>Deny</i><i class="y">Join</i></div></div>
        </div>
        <hr>
        <p class="db-h">📅 Happening today</p>
        <div class="db-tl">
          <div class="ev red"><span class="tm">Today</span><span class="dot"></span><div class="card"><b>No School</b><span>It’s a holiday today</span></div></div>
          <div class="line">
            <div class="ev"><span class="tm">8:30 AM</span><span class="dot"></span><div class="card"><b>Talent Show</b><span>Kindergarten · Auditorium</span></div></div>
            <div class="ev"><span class="tm">1:30 PM</span><span class="dot"></span><div class="card"><b>Soccer practice</b><span>Little Shots · Field 2</span></div></div>
            <div class="ev"><span class="tm">6:30 PM</span><span class="dot"></span><div class="card"><b>Parent-teacher night</b><span>1st Grade · Room 102</span></div></div>
          </div>
        </div>
        <hr>
        <p class="db-h">📆 Upcoming events</p>
        <div class="db-up">
          <div class="row"><span class="date"><small>Sep</small>25</span><div><div class="n">✅ Mrs. Taylor's Class Photo Day <i>8:30 AM</i></div>
            <p>Don’t forget to fill in the photo slot in the link I shared.</p><span class="by">By: James Martin</span></div></div>
          <div class="row"><span class="date"><small>Sep</small>26</span><div><div class="n">📝 Spirit Night at Mandola's</div>
            <p>20% of proceeds go to our class fund. Just mention Kiker 1st Grade.</p><span class="by">By: Dana Reyes</span></div></div>
          <div class="row"><span class="date red"><small>Oct</small>12</span><div><div class="n">🚫 No School</div>
            <p>Fall break</p><span class="by">By: Kiker Elementary</span></div></div>
        </div>
        <hr>
        <div class="db-lunch"><p class="db-h">🥪 Today’s Lunch (Kiker Elementary)</p>
          <ol><li>Hamburger 🍖 🌱</li><li>Rebellyous Burger 🍖</li><li>SunButter & Jelly Sandwich 🍖 🥪</li></ol></div>
        <hr>
        <p class="db-h">🎂 Birthdays</p>
        <div class="db-bday"><span class="cake">🎂</span><div><b>Kennedy turns 4 today!</b><span>Say happy birthday at drop-off 👋</span></div></div>
        <p class="db-bline"><b>Presley (6)</b> · Oct 6th</p><p class="db-bline"><b>Rome (1)</b> · Oct 7th</p>
        <hr>
        <div class="db-msg"><p class="db-h">💬 New messages</p>
          <p>2 unread in <u>Kindergarten</u></p><p>1 message from <u>Sarah Chen</u></p></div>
      </div>
      ${navBar("brief")}
      <span class="sa-home-ind"></span>
    </div>`;
  const spouse = document.createElement("div");
  spouse.className = "spouse-phone";
  spouse.setAttribute("aria-label", "Matt's phone");
  spouse.innerHTML = `<div class="frame"><div class="scr">
      ${spouseBrief}</div></div>
    <div class="who"><img src="${A}matt.webp" alt="">Matt’s phone</div>`;
  spouse.querySelector(".sa-nav").inert = true;
  stage.appendChild(spouse);
  const toast = document.createElement("div");
  toast.className = "spouse-toast";
  toast.setAttribute("role", "status");
  toast.innerHTML = `<img src="${A}matt.webp" alt=""><div><div class="a">On Matt’s phone · now</div>
    <div class="t">Lydia set a reminder for you</div><div class="s">Pick up Presley from school at 2:00 PM</div></div>`;
  stage.appendChild(toast);

  // Lydia's Lock Screen, left of the phone: one slot per Sprout Assist feature that
  // starts a Live Activity. Idle slots show the card at 50% under a "Try" button;
  // finishing the flow in the phone makes the card live. Carpool is the first slot
  // (Figma 11106:246080, the Mom card: Sarah drives); Event, Birthday and Club follow.
  const laCard = () => `<div class="la-card"><div class="in">
      <div class="hd"><span class="logo"><img src="${A}clover.webp" alt=""></span><span class="brand">Sprout <small>CarPool</small></span></div>
      <img class="art" src="${A}la-busav.webp" alt="">
      <div class="tx"><p class="l1"><b>4 min</b> until pickup</p><p class="l2">Sarah is arriving soon</p></div>
      <div class="trk"><span class="stop a"><img src="${A}la-home.webp" alt=""></span><span class="line"><i></i></span>
        <span class="stop m"><img src="${A}la-home.webp" alt=""></span><span class="stop b"><img src="${A}la-school.webp" alt=""></span>
        <img class="bus" src="${A}la-bus.webp" alt=""></div>
    </div></div>`;
  const la = document.createElement("div");
  la.className = "la-stack";
  la.setAttribute("aria-label", "Lydia's Lock Screen: Live Activities");
  la.innerHTML = `<div class="la-slot is-idle" data-la="carpool">
      ${laCard()}
      <button class="la-try" data-la-try="carpool">Try a carpool request</button>
      <p class="la-live" aria-live="polite"></p>
    </div>
    <div class="who"><img src="${A}lydia.webp" alt="">Lydia’s Lock Screen</div>
    <div class="la-slot la-evslot is-idle" data-la="event">
      <div class="ev-phone"><div class="scr"><div class="app">${statusBar}
        <div class="sp-note ev-note" role="status"><span class="ic"><img src="${A}clover.webp" alt=""></span>
          <div><div class="a">Sprout · now</div><div class="t">Lydia invited you</div><div class="s">${EV_TITLE} · Sat, Oct 3 at 2 PM</div></div></div>
        <div class="evp-scroll">
          <div class="evp-hero"><img src="${A}ev-hero.webp" alt=""><span class="bk">${ic.back}</span><span class="dots"><i class="on"></i><i></i><i></i><i></i></span></div>
          <div class="evp-body">
            <div class="evp-card"><h4>${EV_TITLE}</h4><p class="sub">Austin, Texas</p>
              <div class="chips"><span>${phi("compass")}1 mi</span><span>${phi("ticket")}Free Entry</span><span>${phi("clock")}2 PM - 5 PM</span><span>${phi("star")}4.9</span></div>
              <div class="loc"><span class="ico">${phi("map-pin")}</span><div><b>Zilker Park</b><small>2100 Barton Springs Rd, Austin</small></div></div></div>
            <div class="evp-parts"><div class="hd"><b>Participants</b><span class="evp-folks">(2 folks)</span>${phi("caret-right")}</div>
              <div class="row"><img src="${A}lydia.webp" alt=""><div><b>Lydia Martin</b><small>Presley’s Mom · Host</small></div></div>
              <div class="row"><img src="${A}dm-scott.webp" alt=""><div><b>Scott Vogelgesang</b><small>Noah’s Dad</small></div></div>
              <div class="row evp-new"><img src="${A}mem-emily.webp" alt=""><div><b>Emily Centineo</b><small>Flore’s Mom · You</small></div></div></div>
            <div class="evp-about"><b>About this event</b><p>${EV_ABOUT}</p></div>
          </div>
        </div>
        <div class="evp-btns"><i class="b2">Share Event</i><i class="b1">Go to Event Chat</i></div>
        <span class="sa-home-ind"></span>
      </div></div></div>
      <button class="la-try" data-la-try="event">Try creating an event</button>
    </div>
    <div class="who"><img src="${A}mem-emily.webp" alt="">Emily’s phone</div>`;
  stage.appendChild(la);
  // the birthday cover, under Matt's phone: the right column mirrors the left one
  const bd = document.createElement("div");
  bd.className = "bd-slot la-slot is-idle";
  bd.setAttribute("aria-label", "Presley's birthday cover");
  bd.innerHTML = `${bdCard()}<button class="la-try" data-la-try="birthday">Try a birthday cover</button>`;
  stage.appendChild(bd);
  const bdToast = document.createElement("div");
  bdToast.className = "spouse-toast bd-toast";
  bdToast.setAttribute("role", "status");
  bdToast.innerHTML = `<img src="${A}bday-cover.webp" alt=""><div><div class="a">Sprout Assist · now</div>
    <div class="t">Presley’s cover is ready</div><div class="s">Presley’s 6th Birthday · Oct 3 at 2 PM</div></div>`;
  stage.appendChild(bdToast);
  // narrow screens: the invitation arrives as a notification over the phone instead
  const evToast = document.createElement("div");
  evToast.className = "spouse-toast ev-toast";
  evToast.setAttribute("role", "status");
  evToast.innerHTML = `<img src="${A}mem-emily.webp" alt=""><div><div class="a">On Emily’s phone · now</div>
    <div class="t">Lydia invited you</div><div class="s">${EV_TITLE} · Sat, Oct 3 at 2 PM</div></div>`;
  stage.appendChild(evToast);
  // narrow screens have no room beside the phone: the card drops in from the top instead
  const laToast = document.createElement("div");
  laToast.className = "la-toast";
  laToast.setAttribute("role", "status");
  laToast.innerHTML = laCard();
  stage.appendChild(laToast);

  // scale the 393-wide app into the photographed screen
  const fit = () => app.style.setProperty("--sa-scale", String(panel.clientWidth / 393));
  new ResizeObserver(fit).observe(panel);
  fit();

  const $ = (s, r = app) => r.querySelector(s);
  // RareFormLabs/thinking-orbs drives the canvas; orb.webp stays as the no-JS fallback.
  const blob = window.SproutThinkingOrb && window.SproutThinkingOrb.create(
    app.querySelector(".sa-thinking-orb"),
    { state: "listening", size: 64, theme: "light" },
  );
  if (blob) app.querySelector(".sa-orb").classList.add("has-thinking-orb");
  const screensEl = [...app.querySelectorAll(".sa-screen")];
  const order = ["brief", "chat", "clubs", "events", "home", "listen", "review", "cp-review", "ev-review", "ev-invite", "set", "bd-ready", "cp-posted", "carpool-chat", "ev-sent"];
  const cpScreens = ["listen", "cp-review", "cp-posted", "carpool-chat"];
  const evScreens = ["listen", "ev-review", "ev-invite", "ev-sent"];
  const bdScreens = ["listen", "bd-ready"];
  let flow = "reminder";
  // the five tab roots, in tab-bar order; every other screen is pushed from Sprout Assist
  const tabOf = { brief: "brief", events: "events", home: "assist", chat: "chat", clubs: "clubs" };
  const tabOrder = ["brief", "events", "assist", "chat", "clubs"];
  const storyScreens = ["home", "listen", "review", "set"];
  let current = "home";
  let timers = [];
  let who = "spouse";
  const later = (fn, ms) => timers.push(setTimeout(fn, reduce.matches ? Math.min(ms, 60) : ms));
  const clearTimers = () => {
    timers.forEach(clearTimeout);
    timers = [];
  };
  const tip = (name, on) => {
    const t = $(`[data-tip="${name}"]`);
    if (t) t.classList.toggle("is-on", on);
  };

  function go(next) {
    if (next === current) return;
    clearTimers();
    const tabSwitch = next in tabOf && current in tabOf;
    const back = order.indexOf(next) < order.indexOf(current);
    const from = screensEl.find((s) => s.dataset.s === current);
    const to = screensEl.find((s) => s.dataset.s === next);
    if (tabSwitch) switchTab(from, to, tabOrder.indexOf(tabOf[next]) > tabOrder.indexOf(tabOf[current]) ? 1 : -1);
    screensEl.forEach((s) => {
      const on = s.dataset.s === next;
      s.classList.toggle("is-on", on);
      s.classList.toggle("is-back", !on && back && !tabSwitch);
      s.inert = !on;
    });
    current = next;
    setTab(tabOf[next]);
    // Matt's phone is always on screen, on every tab and in every flow (Ahmad, 25 Sep);
    // only the narrow-screen toast is tied to the Sprout Assist stories
    const story = storyScreens.includes(next) || cpScreens.includes(next) || evScreens.includes(next) || bdScreens.includes(next);
    // leaving a flow before it finishes puts its slot on the Lock Screen back to idle
    if (cpState === "running" && !(flow === "carpool" && cpScreens.includes(next))) setCp("idle");
    if (evState === "running" && !(flow === "event" && evScreens.includes(next))) setEv("idle");
    if (bdState === "running" && !(flow === "birthday" && bdScreens.includes(next))) setBd("idle");
    if (next === "bd-ready" && bdState === "running") revealCover();
    spouse.hidden = false;
    if (!story) toast.classList.remove("is-on");
    tip("home", false);
    tip("listen", false);
    if (next === "home") later(() => tip("home", true), 900);
    if (next === "listen") startListening();
    else if (blob) blob.pause();
    if (next === "carpool-chat") requestAnimationFrame(scrollCarpoolChat);
  }

  // tabs don't push: the new screen fades in over the old one, nudged 14px from the
  // side of the tab it came from (the way iOS apps with a floating tab bar feel)
  let tabAnims = [];
  function switchTab(from, to, dir) {
    tabAnims.forEach((a) => a.cancel());
    tabAnims = [];
    if (reduce.matches || !from || !to) return;
    app.classList.add("is-tabbing");
    from.classList.add("is-leaving");
    const ease = "cubic-bezier(.22,1,.36,1)";
    tabAnims = [
      to.animate([{ opacity: 0, transform: `translateX(${dir * 14}px)` }, { opacity: 1, transform: "none" }], { duration: 280, easing: ease }),
      from.animate([{ opacity: 1, transform: "none" }, { opacity: 0, transform: `translateX(${dir * -10}px)` }], { duration: 200, easing: "ease-in", fill: "forwards" }),
    ];
    tabAnims[0].onfinish = () => {
      from.classList.remove("is-leaving");
      app.classList.remove("is-tabbing");
      tabAnims.forEach((a) => a.cancel());
      tabAnims = [];
    };
  }
  // the persistent tab bar: fill icon on the active tab, and it slides away while a
  // Sprout Assist flow (listen, review, set) is on screen
  function setTab(key) {
    tabbar.classList.toggle("is-away", !key);
    if (!key) return;
    tabbar.querySelectorAll("[data-nav]").forEach((b) => {
      const on = b.dataset.nav === key;
      b.classList.toggle("on", on);
      if (on) b.setAttribute("aria-current", "page");
      else b.removeAttribute("aria-current");
    });
  }
  function popTab(btn) {
    if (reduce.matches) return;
    const icon = btn.querySelector(".f, img");
    if (icon) icon.animate([{ transform: "scale(.8)" }, { transform: "scale(1.12)", offset: 0.55 }, { transform: "scale(1)" }], { duration: 340, easing: "cubic-bezier(.3,.7,.4,1)" });
  }
  // tapping the tab you're already on scrolls that screen back to the top, as in iOS
  function scrollTop(key) {
    const screen = screensEl.find((s) => s.dataset.s === (key === "assist" ? "home" : key));
    const el = screen && screen.querySelector(".db-scroll, .ch-scroll, .cl-scroll, .ev-scroll");
    if (el) el.scrollTo({ top: 0, behavior: reduce.matches ? "auto" : "smooth" });
  }
  // Events: the week strip and Discover / My Events
  function pickDay(btn) {
    const ev = $(".sa-events");
    ev.querySelectorAll("[data-day]").forEach((b) => { b.classList.toggle("on", b === btn); b.setAttribute("aria-pressed", String(b === btn)); });
    const list = ev.querySelector('[data-list="discover"]');
    list.innerHTML = EVENTS[btn.dataset.day].map(evCard).join("");
    ev.querySelector(".ev-scroll").scrollTop = 0;
    if (!reduce.matches) list.animate([{ opacity: 0, transform: "translateY(8px)" }, { opacity: 1, transform: "none" }], { duration: 260, easing: "cubic-bezier(.22,1,.36,1)" });
  }
  function pickEvTab(btn) {
    const ev = $(".sa-events");
    const mine = btn.dataset.evtab === "mine";
    ev.querySelectorAll("[data-evtab]").forEach((b) => { b.classList.toggle("on", b === btn); b.setAttribute("aria-pressed", String(b === btn)); });
    ev.classList.toggle("is-mine", mine);
    ev.querySelector('[data-list="discover"]').hidden = mine;
    ev.querySelector('[data-list="mine"]').hidden = !mine;
    ev.querySelector(".ev-scroll").scrollTop = 0;
    const shown = ev.querySelector(`[data-list="${mine ? "mine" : "discover"}"]`);
    if (!reduce.matches) shown.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 220 });
  }

  // the listening screen is shared by the flows
  function setFlow(next) {
    flow = next;
    const f = FLOWS[next];
    $(".sa-listen .flow-icon").src = `${A}${f.icon}.webp`;
    $(".sa-listen .q").textContent = f.quote;
    $(".sa-listen .sa-need .list").innerHTML = needList(f.needs);
  }
  function openFlow(next) {
    setFlow(next);
    if (current === "listen") startListening();
    else go("listen");
  }

  // ── Carpool → Live Activity ──
  // idle (50% card, "Try") → running (the flow is on the phone) → live (Sarah said
  // yes, the card counts down and the bus drives) → done (dropped off, "Replay")
  let cpState = "idle";
  let cpTimers = [];
  const slot = la.querySelector('[data-la="carpool"]');
  const tryBtn = slot.querySelector(".la-try");
  const cpLater = (fn, ms) => cpTimers.push(setTimeout(fn, ms));
  function setCp(next) {
    cpState = next;
    ["idle", "running", "live", "done"].forEach((k) => slot.classList.toggle(`is-${k}`, k === next));
    tryBtn.textContent = { idle: "Try a carpool request", running: "Finish it on the phone", live: "Try a carpool request", done: "Replay the carpool" }[next];
    tryBtn.disabled = next === "running" || next === "live";
  }
  function setActivity(l1, l2, bx) {
    [slot, laToast].forEach((root) => {
      root.querySelector(".l1").innerHTML = l1;
      root.querySelector(".l2").textContent = l2;
      // the bus's centre on the 347 px track row; the solid line runs up to it
      root.querySelector(".bus").style.left = `${bx}px`;
      root.querySelector(".line i").style.width = `${Math.max(0, bx - 36)}px`;
    });
    slot.querySelector(".la-live").textContent = `${l1.replace(/<[^>]+>/g, "")}. ${l2}.`;
  }
  function resetActivity() {
    cpTimers.forEach(clearTimeout);
    cpTimers = [];
    slot.classList.add("no-motion");
    setActivity("<b>4 min</b> until pickup", "Sarah is arriving soon", 84);
    void slot.offsetWidth;
    slot.classList.remove("no-motion");
    laToast.classList.remove("is-on");
    $(".sa-note").classList.remove("is-on");
    $(".cp-posted .msg").textContent = "It’s in Miss Taylor’s Class chat now. We’ll let you know the moment a parent taps “Yes, I can help!”";
    resetCarpoolChat();
  }
  function toAssist() {
    if (!(current in tabOf) || tabOf[current] !== "assist") select("assist");
  }
  function tryCarpool() {
    resetActivity();
    toAssist();
    setCp("running");
    openFlow("carpool");
  }

  // ── Birthday → the cover under Matt's phone ──
  let bdState = "idle";
  let bdTimers = [];
  const bdBtn = bd.querySelector(".la-try");
  function setBd(next) {
    bdState = next;
    ["idle", "running", "live", "done"].forEach((k) => bd.classList.toggle(`is-${k}`, k === next));
    bdBtn.textContent = { idle: "Try a birthday cover", running: "Finish it on the phone", live: "Try a birthday cover", done: "Make another cover" }[next];
    bdBtn.disabled = next === "running" || next === "live";
  }
  function tryBirthday() {
    bdTimers.forEach(clearTimeout);
    bdTimers = [];
    bdToast.classList.remove("is-on");
    toAssist();
    setBd("running");
    openFlow("birthday");
  }
  function revealCover() {
    setBd("live");
    if (getComputedStyle(bd).display === "none") {
      bdToast.classList.add("is-on");
      bdTimers.push(setTimeout(() => bdToast.classList.remove("is-on"), 4200));
    }
    bdTimers.push(setTimeout(() => setBd("done"), reduce.matches ? 1200 : 4600));
  }

  // ── Event → Emily's phone ──
  // idle (her phone at 50% behind "Try creating an event") → running (the flow is on
  // the phone) → live (her invitation arrives and she joins) → done ("Replay")
  let evState = "idle";
  let evTimers = [];
  const evSlot = la.querySelector('[data-la="event"]');
  const evBtn = evSlot.querySelector(".la-try");
  const evLater = (fn, ms) => evTimers.push(setTimeout(fn, ms));
  function setEv(next) {
    evState = next;
    ["idle", "running", "live", "done"].forEach((k) => evSlot.classList.toggle(`is-${k}`, k === next));
    evBtn.textContent = { idle: "Try creating an event", running: "Finish it on the phone", live: "Try creating an event", done: "Replay the event" }[next];
    evBtn.disabled = next === "running" || next === "live";
  }
  function resetEvent() {
    evTimers.forEach(clearTimeout);
    evTimers = [];
    evSlot.querySelector(".ev-note").classList.remove("is-on");
    evSlot.querySelector(".evp-new").classList.remove("is-on");
    evSlot.querySelector(".evp-folks").textContent = "(2 folks)";
    evSlot.querySelector(".evp-scroll").scrollTop = 0;
    evToast.classList.remove("is-on");
    $(".ev-count").textContent = "0/20";
  }
  function tryEvent() {
    resetEvent();
    toAssist();
    setEv("running");
    openFlow("event");
  }
  function sendInvites() {
    go("ev-sent");
    // the hosted event shows up in My Events, once
    const mine = $('.ev-mine .db-up');
    if (mine && !mine.querySelector(".ev-hosted")) mine.insertAdjacentHTML("afterbegin", `<div class="row ev-hosted"><span class="date"><small>Oct</small>3</span><div>
      <div class="n">${EV_TITLE} <i>2:00 PM</i></div><p>Zilker Park · You’re hosting</p><span class="by">By: Lydia Martin</span></div></div>`);
    evLater(inviteArrives, reduce.matches ? 400 : 1600);
  }
  function inviteArrives() {
    setEv("live");
    const note = evSlot.querySelector(".ev-note");
    note.classList.add("is-on");
    evLater(() => note.classList.remove("is-on"), 3000);
    if (getComputedStyle(la).display === "none") {
      evToast.classList.add("is-on");
      evLater(() => evToast.classList.remove("is-on"), 4200);
    }
    // Emily taps it and joins: the list grows and Lydia's count moves
    evLater(() => {
      const scroller = evSlot.querySelector(".evp-scroll");
      scroller.scrollTo({ top: 150, behavior: reduce.matches ? "auto" : "smooth" });
      evSlot.querySelector(".evp-new").classList.add("is-on");
      evSlot.querySelector(".evp-folks").textContent = "(3 folks)";
      $(".ev-count").textContent = "1/20";
    }, reduce.matches ? 600 : 2600);
    evLater(() => setEv("done"), reduce.matches ? 1200 : 6200);
  }
  function postCarpool() {
    go("cp-posted");
    // a parent answers in the class chat a moment later; nothing below is tied to the
    // phone's screen timers, so the drive keeps going if the visitor wanders off
    cpLater(acceptCarpool, reduce.matches ? 600 : 2200);
  }
  function acceptCarpool() {
    setCp("live");
    $(".cp-posted .msg").textContent = "Sarah Baker said yes. Follow the drive live on your Lock Screen.";
    go("carpool-chat");
    if (getComputedStyle(la).display === "none") {
      laToast.classList.add("is-on");
      cpLater(() => laToast.classList.remove("is-on"), 5200);
    }
    if (reduce.matches) {
      setActivity("<b>4 min</b> until pickup", "Sarah is arriving soon", 84);
      return cpLater(() => setCp("done"), 1200);
    }
    // 4 → 1 min while the bus closes on the pickup stop, then school
    const toPickup = [[3, 106], [2, 129], [1, 151]];
    toPickup.forEach(([m, bx], i) => cpLater(() => setActivity(`<b>${m} min</b> until pickup`, "Sarah is arriving soon", bx), 2400 * (i + 1)));
    cpLater(() => setActivity("<b>Arriving</b> now", "Sarah is outside", 174), 9600);
    cpLater(() => setActivity("<b>12 min</b> to school", "Presley is on the way to Kiker Elementary", 250), 12400);
    cpLater(() => setActivity("<b>4 min</b> to school", "Presley is on the way to Kiker Elementary", 300), 15600);
    cpLater(() => setActivity("<b>Dropped off</b> at 7:58 AM", "Presley is at Kiker Elementary", 323), 18800);
    // let the finished card be read before "Replay" covers it again
    cpLater(() => setCp("done"), 21800);
  }

  // The Figma carpool room is interactive: messages are appended as text nodes, then
  // Sarah answers from a small deterministic set so the prototype stays local and safe.
  const carpoolForm = $(".cc-compose");
  const carpoolInput = $(".cc-input");
  const carpoolSend = $(".cc-send");
  const carpoolThread = $(".cc-thread");
  const carpoolTyping = $(".cc-typing");
  let chatReplyTimers = [];

  function scrollCarpoolChat() {
    const scroller = $(".cc-scroll");
    scroller.scrollTop = scroller.scrollHeight;
  }

  function setCarpoolTyping(on) {
    carpoolTyping.hidden = !on;
    requestAnimationFrame(scrollCarpoolChat);
  }

  function appendCarpoolMessage(text, mine) {
    const article = document.createElement("article");
    article.className = `cc-message ${mine ? "mine" : "theirs"}`;
    article.dataset.chatDynamic = "true";
    if (!mine) {
      const avatar = document.createElement("img");
      avatar.src = `${A}mem-sarah.webp`;
      avatar.alt = "";
      article.appendChild(avatar);
    }
    const bubble = document.createElement("div");
    if (!mine) {
      const name = document.createElement("small");
      name.textContent = "Sarah Baker";
      bubble.appendChild(name);
    }
    const message = document.createElement("p");
    message.textContent = text;
    const time = document.createElement("time");
    time.textContent = "Now";
    bubble.append(message, time);
    article.appendChild(bubble);
    carpoolThread.appendChild(article);
    requestAnimationFrame(scrollCarpoolChat);
  }

  function sarahReplyFor(message) {
    const text = message.toLocaleLowerCase();
    if (/where|gate|meet|pickup|pick up|jemput|ketemu/.test(text)) return "I’ll meet Presley by the front gate at 7:30 AM.";
    if (/time|when|7[.:]30|jam|kapan/.test(text)) return "7:30 AM works for me. I’ll send an update if anything changes.";
    if (/thank|thanks|makasih|terima kasih/.test(text)) return "Of course! Happy to help. I’ll message you when I’m outside.";
    return "Got it! I’ll keep you posted here and message when I’m outside 👍";
  }

  function sendCarpoolMessage() {
    const text = carpoolInput.value.trim();
    if (!text) return;
    appendCarpoolMessage(text, true);
    carpoolInput.value = "";
    carpoolSend.disabled = true;
    setCarpoolTyping(true);
    const reply = sarahReplyFor(text);
    chatReplyTimers.push(setTimeout(() => {
      setCarpoolTyping(false);
      appendCarpoolMessage(reply, false);
    }, reduce.matches ? 120 : 850));
  }

  function resetCarpoolChat() {
    chatReplyTimers.forEach(clearTimeout);
    chatReplyTimers = [];
    carpoolThread.querySelectorAll("[data-chat-dynamic]").forEach((message) => message.remove());
    carpoolInput.value = "";
    carpoolSend.disabled = true;
    carpoolTyping.hidden = true;
  }

  carpoolInput.addEventListener("input", () => {
    carpoolSend.disabled = !carpoolInput.value.trim();
  });
  carpoolForm.addEventListener("submit", (event) => {
    event.preventDefault();
    sendCarpoolMessage();
  });
  // hovering (or focusing) a row in the menu grows the thing that row will act on, so
  // visitors see what reacts before they tap: Reminder → Matt's phone, Carpool → the
  // Lock Screen card, Event → Emily's phone, Birthday → the cover (Ahmad, 25 Sep)
  const hintTarget = {
    reminder: () => spouse.querySelector(".frame"),
    carpool: () => slot.querySelector(".la-card"),
    event: () => evSlot.querySelector(".ev-phone"),
    birthday: () => bd.querySelector(".bd-card"),
  };
  const hint = (row, on) => {
    const target = hintTarget[row.dataset.pick] && hintTarget[row.dataset.pick]();
    if (target) target.classList.toggle("is-hinted", on);
  };
  app.querySelectorAll(".sa-home [data-pick]").forEach((row) => {
    row.addEventListener("pointerenter", () => hint(row, true));
    row.addEventListener("pointerleave", () => hint(row, false));
    row.addEventListener("focus", () => hint(row, true));
    row.addEventListener("blur", () => hint(row, false));
    row.addEventListener("click", () => hint(row, false));
  });

  bd.addEventListener("click", (e) => {
    const t = e.target.closest("[data-la-try]");
    if (t && !t.disabled) tryBirthday();
  });
  la.addEventListener("click", (e) => {
    const t = e.target.closest("[data-la-try]");
    if (!t || t.disabled) return;
    if (t.dataset.laTry === "carpool") tryCarpool();
    if (t.dataset.laTry === "event") tryEvent();
  });

  // Opening a flow, the orb is "working" first: a beat to read the sample line and the
  // needed information before anyone speaks (Ahmad, 25 Sep). Then it listens, and
  // 136 → 143: the check unlocks the moment the app has heard enough.
  function startListening() {
    const s = $(".sa-listen");
    s.classList.remove("is-heard", "is-thinking");
    s.classList.add("is-warming");
    if (blob) { blob.setState("working"); blob.play(); }
    $(".sa-listen .state").textContent = "Working…";
    $(".sa-check").disabled = true;
    later(() => {
      s.classList.remove("is-warming");
      if (blob) blob.setState("listeningActive");
      $(".sa-listen .state").textContent = "Listening…";
      later(() => {
        s.classList.add("is-heard");
        $(".sa-check").disabled = false;
        later(() => tip("listen", true), 500);
      }, 1600);
    }, reduce.matches ? 900 : 2400);
  }

  function finishListening() {
    const s = $(".sa-listen");
    if (!s.classList.contains("is-heard")) return;
    tip("listen", false);
    s.classList.add("is-thinking");
    if (blob) blob.setState("processing");
    $(".sa-listen .state").textContent = flow === "birthday" ? "Painting Presley’s cover…" : "Putting it together…";
    later(() => go(FLOWS[flow].next), flow === "birthday" ? 1900 : 1100);
  }

  function setWho(next) {
    who = next;
    app.querySelectorAll("[data-who]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.who === next)));
  }

  function setReminder() {
    const msg = {
      spouse: "We’ll remind Matt to “Pick up Presley from school” today at 2:00 PM. It’s in his Daily Brief now.",
      both: "We’ll remind you and Matt to “Pick up Presley from school” today at 2:00 PM. It’s in both of your Daily Briefs.",
      me: "We’ll remind you to “Pick up Presley from school” today at 2:00 PM. It’s in your Daily Brief now.",
    }[who];
    $(".sa-set .msg").textContent = msg;
    const toMatt = who !== "me";
    if (toMatt) fly(() => deliver());
    go("set");
  }

  function fly(done) {
    const from = $(".sa-review .sa-field").getBoundingClientRect();
    const wide = getComputedStyle(spouse).display !== "none";
    spouse.querySelector(".mt-scroll").scrollTop = 0;
    const target = wide ? spouse.querySelector(".mt-att").getBoundingClientRect() : toast.getBoundingClientRect();
    if (reduce.matches || !from.width) return done();
    const card = document.createElement("div");
    card.className = "sa-flyer";
    card.innerHTML = '<div class="n">Pick up Presley from school</div><div class="d">Today · 2:00 PM · for Matt</div>';
    document.body.appendChild(card);
    const w = 214;
    const sx = from.left + from.width / 2 - w / 2, sy = from.top;
    const tx = wide ? target.left + target.width / 2 - w / 2 : target.left + target.width / 2 - w / 2;
    const ty = wide ? target.top + 10 : target.top;
    const scaleTo = wide ? 0.62 : 0.8;
    const anim = card.animate(
      [
        { transform: `translate(${sx}px,${sy}px) scale(.9)`, opacity: 0 },
        { transform: `translate(${sx}px,${sy - 30}px) scale(1)`, opacity: 1, offset: 0.2 },
        { transform: `translate(${(sx + tx) / 2}px,${Math.min(sy, ty) - 70}px) scale(.9) rotate(4deg)`, opacity: 1, offset: 0.6 },
        { transform: `translate(${tx}px,${ty}px) scale(${scaleTo}) rotate(6deg)`, opacity: 0 },
      ],
      { duration: 1050, easing: "cubic-bezier(.45,.05,.25,1)", fill: "forwards" },
    );
    anim.onfinish = () => {
      card.remove();
      done();
    };
  }

  function setMatt(hasNew) {
    spouse.querySelector(".mt-att").classList.toggle("has-new", hasNew);
    spouse.querySelector(".mt-ring").style.setProperty("--p", hasNew ? 0.75 : 1);
    spouse.querySelector(".mt-count").textContent = hasNew ? "3/4" : "3/3";
    spouse.querySelector(".mt-sub").textContent = hasNew ? "1 new from Lydia." : "Great, you got everything done today.";
  }
  function deliver() {
    const note = spouse.querySelector(".sp-note");
    spouse.querySelector(".mt-scroll").scrollTop = 0;
    note.classList.add("is-on");
    toast.classList.add("is-on");
    setTimeout(() => setMatt(true), reduce.matches ? 0 : 500);
    setTimeout(() => note.classList.remove("is-on"), reduce.matches ? 2500 : 3200);
    setTimeout(() => toast.classList.remove("is-on"), 4200);
  }

  function resetSpouse() {
    setMatt(false);
    spouse.querySelector(".sp-note").classList.remove("is-on");
    toast.classList.remove("is-on");
  }

  app.addEventListener("click", (e) => {
    const tab = e.target.closest("[data-nav]");
    if (tab) {
      const k = tab.dataset.nav;
      if (!tabOrder.includes(k)) return;
      popTab(tab);
      if (tabOf[current] === k) return scrollTop(k);
      return select(k);
    }
    const inv = e.target.closest(".inv-i");
    if (inv) return inv.setAttribute("aria-pressed", String(inv.getAttribute("aria-pressed") !== "true"));
    const all = e.target.closest("[data-invall]");
    if (all) {
      const items = [...app.querySelectorAll(`[data-inv="${all.dataset.invall}"]`)];
      const on = items.some((b) => b.getAttribute("aria-pressed") !== "true");
      items.forEach((b) => b.setAttribute("aria-pressed", String(on)));
      return;
    }
    const day = e.target.closest("[data-day]");
    if (day) return day.classList.contains("on") ? null : pickDay(day);
    const evtab = e.target.closest("[data-evtab]");
    if (evtab) return evtab.classList.contains("on") ? null : pickEvTab(evtab);
    const chip = e.target.closest(".cl-chips button");
    if (chip) {
      app.querySelectorAll(".cl-chips button").forEach((b) => { b.classList.toggle("on", b === chip); b.setAttribute("aria-pressed", String(b === chip)); });
      return;
    }
    const todo = e.target.closest(".db-todo");
    if (todo) return toggleTodo(todo);
    const pick = e.target.closest("[data-pick]");
    if (pick) {
      if (pick.dataset.pick === "reminder") return openFlow("reminder");
      if (pick.dataset.pick === "carpool") return tryCarpool();
      if (pick.dataset.pick === "event") return tryEvent();
      if (pick.dataset.pick === "birthday") return tryBirthday();
      pick.classList.remove("is-nudged");
      void pick.offsetWidth;
      pick.classList.add("is-nudged");
      tip("home", true);
      return;
    }
    const nav = e.target.closest("[data-go]");
    if (nav) return go(nav.dataset.go);
    const w = e.target.closest("[data-who]");
    if (w) return setWho(w.dataset.who);
    const act = e.target.closest("[data-act]");
    if (!act) return;
    if (act.dataset.act === "done") finishListening();
    if (act.dataset.act === "post") postCarpool();
    if (act.dataset.act === "sendinv" || act.dataset.act === "skipinv") sendInvites();
    if (act.dataset.act === "bddone") go("home");
    if (act.dataset.act === "myevents") { select("events"); const b = $('[data-evtab="mine"]'); if (!b.classList.contains("on")) pickEvTab(b); }
    if (act.dataset.act === "copylink") { act.textContent = "Link copied"; setTimeout(() => (act.textContent = "Copy Link"), 1600); }
    if (act.dataset.act === "cover") { act.classList.remove("is-nudged"); void act.offsetWidth; act.classList.add("is-nudged"); }
    if (act.dataset.act === "openchat") select("chat");
    if (act.dataset.act === "routine") act.setAttribute("aria-pressed", String(act.getAttribute("aria-pressed") !== "true"));
    if (act.dataset.act === "set") setReminder();
    if (act.dataset.act === "again") {
      resetSpouse();
      setWho("spouse");
      setFlow("reminder");
      go("home");
    }
  });

  // the tab bar goes through script.js so the no-JS screenshot and the live region follow
  function select(key) {
    if (window.sproutHero) window.sproutHero.select(key);
    else window.sproutAssistDemo.show(key === "assist" ? "home" : key);
  }
  function toggleTodo(btn) {
    const done = !btn.classList.contains("is-done");
    btn.classList.toggle("is-done", done);
    btn.setAttribute("aria-pressed", String(done));
    $(".att-ring").style.setProperty("--p", done ? 1 : 0);
    $(".att-count").textContent = done ? "1/1" : "0/1";
    $(".att-sub").textContent = done ? "Great, you got everything done today." : "One thing left for today.";
  }

  // script.js calls these when the phone's tab bar switches screens
  window.sproutAssistDemo = {
    show(screen = "home") {
      panel.classList.add("is-live");
      app.hidden = false;
      fit();
      if (screen === "brief" || screen === "events" || screen === "chat" || screen === "clubs") { go(screen); return; }
      if (!storyScreens.includes(current)) go("home");
      spouse.hidden = false;
      if (current === "home") later(() => tip("home", true), 900);
    },
    hide() {
      clearTimers();
      if (blob) blob.pause();
      panel.classList.remove("is-live");
      app.hidden = true;
      spouse.hidden = true;
      toast.classList.remove("is-on");
    },
  };
  screensEl.forEach((s) => (s.inert = s.dataset.s !== "home"));
  window.sproutAssistDemo.show();
})();
