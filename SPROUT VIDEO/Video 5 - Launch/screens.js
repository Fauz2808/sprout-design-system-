/* App screens for the launch film. Markup is the website's Sprout Assist demo
   (01 - Website/sprout-reach-scene-iteration/assist-demo.js), which follows Figma:
   Sprout Assist rework section 12798:18362 (135 menu, 136 listening, 147 review,
   148 set) and the shared Daily Brief 12403:210488. Same cast as the site:
   Lydia (the one speaking), Matt (her husband), Presley (their kid), Kiker Elementary. */
(function () {
  const A = "assets/img/";
  const ic = {
    back: '<svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    check: '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
    cal: '<svg viewBox="0 0 24 24"><rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 9.5h17M8 3v4M16 3v4"/></svg>',
    clock: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg>',
  };
  // Phosphor regular + fill, the icon set the app uses (@phosphor-icons/core)
  const PH = {"graduation-cap":"M251.76,88.94l-120-64a8,8,0,0,0-7.52,0l-120,64a8,8,0,0,0,0,14.12L32,117.87v48.42a15.91,15.91,0,0,0,4.06,10.65C49.16,191.53,78.51,216,128,216a130,130,0,0,0,48-8.76V240a8,8,0,0,0,16,0V199.51a115.63,115.63,0,0,0,27.94-22.57A15.91,15.91,0,0,0,224,166.29V117.87l27.76-14.81a8,8,0,0,0,0-14.12ZM128,200c-43.27,0-68.72-21.14-80-33.71V126.4l76.24,40.66a8,8,0,0,0,7.52,0L176,143.47v46.34C163.4,195.69,147.52,200,128,200Zm80-33.75a97.83,97.83,0,0,1-16,14.25V134.93l16-8.53ZM188,118.94l-.22-.13-56-29.87a8,8,0,0,0-7.52,14.12L171,128l-43,22.93L25,96,128,41.07,231,96Z",
    "users-three":"M244.8,150.4a8,8,0,0,1-11.2-1.6A51.6,51.6,0,0,0,192,128a8,8,0,0,1-7.37-4.89,8,8,0,0,1,0-6.22A8,8,0,0,1,192,112a24,24,0,1,0-23.24-30,8,8,0,1,1-15.5-4A40,40,0,1,1,219,117.51a67.94,67.94,0,0,1,27.43,21.68A8,8,0,0,1,244.8,150.4ZM190.92,212a8,8,0,1,1-13.84,8,57,57,0,0,0-98.16,0,8,8,0,1,1-13.84-8,72.06,72.06,0,0,1,33.74-29.92,48,48,0,1,1,58.36,0A72.06,72.06,0,0,1,190.92,212ZM128,176a32,32,0,1,0-32-32A32,32,0,0,0,128,176ZM72,120a8,8,0,0,0-8-8A24,24,0,1,1,87.24,82a8,8,0,1,0,15.5-4A40,40,0,1,0,37,117.51,67.94,67.94,0,0,0,9.6,139.19a8,8,0,1,0,12.8,9.61A51.6,51.6,0,0,1,64,128,8,8,0,0,0,72,120Z",
    "globe-simple":"M128,24h0A104,104,0,1,0,232,128,104.12,104.12,0,0,0,128,24Zm87.62,96H175.79C174,83.49,159.94,57.67,148.41,42.4A88.19,88.19,0,0,1,215.63,120ZM96.23,136h63.54c-2.31,41.61-22.23,67.11-31.77,77C118.45,203.1,98.54,177.6,96.23,136Zm0-16C98.54,78.39,118.46,52.89,128,43c9.55,9.93,29.46,35.43,31.77,77Zm11.36-77.6C96.06,57.67,82,83.49,80.21,120H40.37A88.19,88.19,0,0,1,107.59,42.4ZM40.37,136H80.21c1.82,36.51,15.85,62.33,27.38,77.6A88.19,88.19,0,0,1,40.37,136Zm108,77.6c11.53-15.27,25.56-41.09,27.38-77.6h39.84A88.19,88.19,0,0,1,148.41,213.6Z",
    "push-pin":"M235.32,81.37,174.63,20.69a16,16,0,0,0-22.63,0L98.37,74.49c-10.66-3.34-35-7.37-60.4,13.14a16,16,0,0,0-1.29,23.78L85,159.71,42.34,202.34a8,8,0,0,0,11.32,11.32L96.29,171l48.29,48.29A16,16,0,0,0,155.9,224c.38,0,.75,0,1.13,0a15.93,15.93,0,0,0,11.64-6.33c19.64-26.1,17.75-47.32,13.19-60L235.33,104A16,16,0,0,0,235.32,81.37ZM224,92.69h0l-57.27,57.46a8,8,0,0,0-1.49,9.22c9.46,18.93-1.8,38.59-9.34,48.62L48,100.08c12.08-9.74,23.64-12.31,32.48-12.31A40.13,40.13,0,0,1,96.81,91a8,8,0,0,0,9.25-1.51L163.32,32,224,92.68Z",
    "chats-teardrop":"M169.57,72.59A80,80,0,0,0,16,104v64a16,16,0,0,0,16,16H86.67A80.15,80.15,0,0,0,160,232h64a16,16,0,0,0,16-16V152A80,80,0,0,0,169.57,72.59ZM32,104a64,64,0,1,1,64,64H32ZM224,216H160a64.14,64.14,0,0,1-55.68-32.43A79.93,79.93,0,0,0,174.7,89.71,64,64,0,0,1,224,152Z",
    "sun-horizon":"M240,152H199.55a73.54,73.54,0,0,0,.45-8,72,72,0,0,0-144,0,73.54,73.54,0,0,0,.45,8H16a8,8,0,0,0,0,16H240a8,8,0,0,0,0-16ZM72,144a56,56,0,1,1,111.41,8H72.59A56.13,56.13,0,0,1,72,144Zm144,56a8,8,0,0,1-8,8H48a8,8,0,0,1,0-16H208A8,8,0,0,1,216,200ZM72.84,43.58a8,8,0,0,1,14.32-7.16l8,16a8,8,0,0,1-14.32,7.16Zm-56,48.84a8,8,0,0,1,10.74-3.57l16,8a8,8,0,0,1-7.16,14.31l-16-8A8,8,0,0,1,16.84,92.42Zm192,15.16a8,8,0,0,1,3.58-10.73l16-8a8,8,0,1,1,7.16,14.31l-16,8a8,8,0,0,1-10.74-3.58Zm-48-55.16,8-16a8,8,0,0,1,14.32,7.16l-8,16a8,8,0,1,1-14.32-7.16Z",
    "compass":"M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216ZM172.42,72.84l-64,32a8.05,8.05,0,0,0-3.58,3.58l-32,64A8,8,0,0,0,80,184a8.1,8.1,0,0,0,3.58-.84l64-32a8.05,8.05,0,0,0,3.58-3.58l32-64a8,8,0,0,0-10.74-10.74ZM138,138,97.89,158.11,118,118l40.15-20.07Z",
    "chat-circle-dots":"M140,128a12,12,0,1,1-12-12A12,12,0,0,1,140,128ZM84,116a12,12,0,1,0,12,12A12,12,0,0,0,84,116Zm88,0a12,12,0,1,0,12,12A12,12,0,0,0,172,116Zm60,12A104,104,0,0,1,79.12,219.82L45.07,231.17a16,16,0,0,1-20.24-20.24l11.35-34.05A104,104,0,1,1,232,128Zm-16,0A88,88,0,1,0,51.81,172.06a8,8,0,0,1,.66,6.54L40,216,77.4,203.53a7.85,7.85,0,0,1,2.53-.42,8,8,0,0,1,4,1.08A88,88,0,0,0,216,128Z",
    "users":"M117.25,157.92a60,60,0,1,0-66.5,0A95.83,95.83,0,0,0,3.53,195.63a8,8,0,1,0,13.4,8.74,80,80,0,0,1,134.14,0,8,8,0,0,0,13.4-8.74A95.83,95.83,0,0,0,117.25,157.92ZM40,108a44,44,0,1,1,44,44A44.05,44.05,0,0,1,40,108Zm210.14,98.7a8,8,0,0,1-11.07-2.33A79.83,79.83,0,0,0,172,168a8,8,0,0,1,0-16,44,44,0,1,0-16.34-84.87,8,8,0,1,1-5.94-14.85,60,60,0,0,1,55.53,105.64,95.83,95.83,0,0,1,47.22,37.71A8,8,0,0,1,250.14,206.7Z",
    "calendar-dots":"M208,32H184V24a8,8,0,0,0-16,0v8H88V24a8,8,0,0,0-16,0v8H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM72,48v8a8,8,0,0,0,16,0V48h80v8a8,8,0,0,0,16,0V48h24V80H48V48ZM208,208H48V96H208V208Zm-68-76a12,12,0,1,1-12-12A12,12,0,0,1,140,132Zm44,0a12,12,0,1,1-12-12A12,12,0,0,1,184,132ZM96,172a12,12,0,1,1-12-12A12,12,0,0,1,96,172Zm44,0a12,12,0,1,1-12-12A12,12,0,0,1,140,172Zm44,0a12,12,0,1,1-12-12A12,12,0,0,1,184,172Z",
    "arrow-right":"M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z",
    "check":"M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z",
    "plus":"M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z",
    "magnifying-glass":"M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z",
    "note-pencil":"M229.66,58.34l-32-32a8,8,0,0,0-11.32,0l-96,96A8,8,0,0,0,88,128v32a8,8,0,0,0,8,8h32a8,8,0,0,0,5.66-2.34l96-96A8,8,0,0,0,229.66,58.34ZM124.69,152H104V131.31l64-64L188.69,88ZM200,76.69,179.31,56,192,43.31,212.69,64ZM224,128v80a16,16,0,0,1-16,16H48a16,16,0,0,1-16-16V48A16,16,0,0,1,48,32h80a8,8,0,0,1,0,16H48V208H208V128a8,8,0,0,1,16,0Z",
    "user-plus":"M256,136a8,8,0,0,1-8,8H232v16a8,8,0,0,1-16,0V144H200a8,8,0,0,1,0-16h16V112a8,8,0,0,1,16,0v16h16A8,8,0,0,1,256,136Zm-57.87,58.85a8,8,0,0,1-12.26,10.3C165.75,181.19,138.09,168,108,168s-57.75,13.19-77.87,37.15a8,8,0,0,1-12.25-10.3c14.94-17.78,33.52-30.41,54.17-37.17a68,68,0,1,1,71.9,0C164.6,164.44,183.18,177.07,198.13,194.85ZM108,152a52,52,0,1,0-52-52A52.06,52.06,0,0,0,108,152Z",
    "caret-down":"M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z",
    "user":"M230.92,212c-15.23-26.33-38.7-45.21-66.09-54.16a72,72,0,1,0-73.66,0C63.78,166.78,40.31,185.66,25.08,212a8,8,0,1,0,13.85,8c18.84-32.56,52.14-52,89.07-52s70.23,19.44,89.07,52a8,8,0,1,0,13.85-8ZM72,96a56,56,0,1,1,56,56A56.06,56.06,0,0,1,72,96Z",
    "bell":"M221.8,175.94C216.25,166.38,208,139.33,208,104a80,80,0,1,0-160,0c0,35.34-8.26,62.38-13.81,71.94A16,16,0,0,0,48,200H88.81a40,40,0,0,0,78.38,0H208a16,16,0,0,0,13.8-24.06ZM128,216a24,24,0,0,1-22.62-16h45.24A24,24,0,0,1,128,216ZM48,184c7.7-13.24,16-43.92,16-80a64,64,0,1,1,128,0c0,36.05,8.28,66.73,16,80Z",
    "sun-horizon-fill":"M248,160a8,8,0,0,1-8,8H16a8,8,0,0,1,0-16H56.45a73.54,73.54,0,0,1-.45-8,72,72,0,0,1,144,0,73.54,73.54,0,0,1-.45,8H240A8,8,0,0,1,248,160Zm-40,32H48a8,8,0,0,0,0,16H208a8,8,0,0,0,0-16ZM80.84,59.58a8,8,0,0,0,14.32-7.16l-8-16a8,8,0,0,0-14.32,7.16ZM20.42,103.16l16,8a8,8,0,1,0,7.16-14.31l-16-8a8,8,0,1,0-7.16,14.31ZM216,112a8,8,0,0,0,3.57-.84l16-8a8,8,0,1,0-7.16-14.31l-16,8A8,8,0,0,0,216,112ZM164.42,63.16a8,8,0,0,0,10.74-3.58l8-16a8,8,0,0,0-14.32-7.16l-8,16A8,8,0,0,0,164.42,63.16Z",
    "compass-fill":"M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm51.58,57.79-32,64a4.08,4.08,0,0,1-1.79,1.79l-64,32a4,4,0,0,1-5.37-5.37l32-64a4.08,4.08,0,0,1,1.79-1.79l64-32A4,4,0,0,1,179.58,81.79Z",
    "chat-circle-dots-fill":"M128,24A104,104,0,0,0,36.18,176.88L24.83,210.93a16,16,0,0,0,20.24,20.24l34.05-11.35A104,104,0,1,0,128,24ZM84,140a12,12,0,1,1,12-12A12,12,0,0,1,84,140Zm44,0a12,12,0,1,1,12-12A12,12,0,0,1,128,140Zm44,0a12,12,0,1,1,12-12A12,12,0,0,1,172,140Z",
    "users-fill":"M164.47,195.63a8,8,0,0,1-6.7,12.37H10.23a8,8,0,0,1-6.7-12.37,95.83,95.83,0,0,1,47.22-37.71,60,60,0,1,1,66.5,0A95.83,95.83,0,0,1,164.47,195.63Zm87.91-.15a95.87,95.87,0,0,0-47.13-37.56A60,60,0,0,0,144.7,54.59a4,4,0,0,0-1.33,6A75.83,75.83,0,0,1,147,150.53a4,4,0,0,0,1.07,5.53,112.32,112.32,0,0,1,29.85,30.83,23.92,23.92,0,0,1,3.65,16.47,4,4,0,0,0,3.95,4.64h60.3a8,8,0,0,0,7.73-5.93A8.22,8.22,0,0,0,252.38,195.48Z",
    "envelope-simple":"M224,48H32a8,8,0,0,0-8,8V192a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A8,8,0,0,0,224,48ZM203.43,64,128,133.15,52.57,64ZM216,192H40V74.19l82.59,75.71a8,8,0,0,0,10.82,0L216,74.19V192Z",
    "chat-teardrop-text":"M172,112a8,8,0,0,1-8,8H96a8,8,0,0,1,0-16h68A8,8,0,0,1,172,112Zm-8,24H96a8,8,0,0,0,0,16h68a8,8,0,0,0,0-16Zm68-12A100.11,100.11,0,0,1,132,224H48a16,16,0,0,1-16-16V124a100,100,0,0,1,200,0Zm-16,0a84,84,0,0,0-168,0v84h84A84.09,84.09,0,0,0,216,124Z",
    "calendar-blank":"M208,32H184V24a8,8,0,0,0-16,0v8H88V24a8,8,0,0,0-16,0v8H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM72,48v8a8,8,0,0,0,16,0V48h80v8a8,8,0,0,0,16,0V48h24V80H48V48ZM208,208H48V96H208V208Z",
    "megaphone":"M248,120a48.05,48.05,0,0,0-48-48H160.2c-2.91-.17-53.62-3.74-101.91-44.24A16,16,0,0,0,32,40V200a16,16,0,0,0,26.29,12.25c37.77-31.68,77-40.76,93.71-43.3v31.72A16,16,0,0,0,159.12,214l11,7.33A16,16,0,0,0,194.5,212l11.77-44.36A48.07,48.07,0,0,0,248,120ZM48,199.93V40h0c42.81,35.91,86.63,45,104,47.24v65.48C134.65,155,90.84,164.07,48,199.93Zm131,8,0,.11-11-7.33V168h21.6ZM200,152H168V88h32a32,32,0,1,1,0,64Z",
    "car":"M240,104H229.2L201.42,41.5A16,16,0,0,0,186.8,32H69.2a16,16,0,0,0-14.62,9.5L26.8,104H16a8,8,0,0,0,0,16h8v80a16,16,0,0,0,16,16H64a16,16,0,0,0,16-16V184h96v16a16,16,0,0,0,16,16h24a16,16,0,0,0,16-16V120h8a8,8,0,0,0,0-16ZM69.2,48H186.8l24.89,56H44.31ZM64,200H40V184H64Zm128,0V184h24v16Zm24-32H40V120H216ZM56,144a8,8,0,0,1,8-8H80a8,8,0,0,1,0,16H64A8,8,0,0,1,56,144Zm112,0a8,8,0,0,1,8-8h16a8,8,0,0,1,0,16H176A8,8,0,0,1,168,144Z"};
  const phi = (k, cls = "") => `<svg class="ph ${cls}" viewBox="0 0 256 256" aria-hidden="true"><path d="${PH[k]}"/></svg>`;
  const TABS = [
    ["brief", "sun-horizon", "Daily Brief"],
    ["events", "compass", "Events"],
    ["assist", "", "Sprout Assist"],
    ["chat", "chat-circle-dots", "Chat"],
    ["clubs", "users", "Clubs"],
  ];
  // each tab keeps both icon weights so the timeline can switch the active tab
  const navBar = (active) => `<nav class="sa-nav">${TABS.map(([k, icon, label]) =>
    `<button data-nav="${k}" class="${k === active ? "on" : ""}">${
      icon ? phi(icon, "o") + phi(icon + "-fill", "f") : `<img src="${A}clover.webp" alt="">`}${
      k === "chat" ? '<i class="badge">2</i>' : ""}<span>${label}</span></button>`).join("")}</nav>`;
  const statusBar = `<div class="sa-sb"><span>9:41</span><span class="r">
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
  const needList = (list) => list.map(([img, n, d]) => `<div class="item"><span class="sa-tile"><img src="${A}${img}.webp" alt=""></span>
          <span class="tx"><span class="n">${n}</span><br><span class="d">${d}</span></span></div>`).join("");

  const todo = (n, m, { tag = "", done = false, go = false, cls = "" } = {}) => `<div class="db-todo${done ? " is-done" : ""} ${cls}"><span class="box">${phi("check")}</span>
      <span class="tx"><span class="n">${n}${tag}</span><span class="m">${m}</span></span>${go ? `<span class="go">${phi("arrow-right")}</span>` : ""}</div>`;

  const timeline = `<div class="db-tl">
        <div class="ev red"><span class="tm">Today</span><span class="dot"></span><div class="card"><b>No School</b><span>It’s a holiday today</span></div></div>
        <div class="line">
          <div class="ev"><span class="tm">8:30 AM</span><span class="dot"></span><div class="card"><b>Talent Show</b><span>Kindergarten · Auditorium</span></div></div>
          <div class="ev"><span class="tm">1:30 PM</span><span class="dot"></span><div class="card"><b>Soccer practice</b><span>Little Shots · Field 2</span></div></div>
          <div class="ev"><span class="tm">6:30 PM</span><span class="dot"></span><div class="card"><b>Parent-teacher night</b><span>1st Grade · Room 102</span></div></div>
        </div>
      </div>`;
  const upcoming = `<div class="db-up">
        <div class="row"><span class="date"><small>Sep</small>25</span><div><div class="n">✅ Mrs. Taylor's Class Photo Day <i>8:30 AM</i></div>
          <p>Don’t forget to fill in the photo slot in the link I shared.</p><span class="by">By: James Martin</span></div></div>
        <div class="row"><span class="date"><small>Sep</small>26</span><div><div class="n">📝 Spirit Night at Mandola's</div>
          <p>20% of proceeds go to our class fund. Just mention Kiker 1st Grade.</p><span class="by">By: Dana Reyes</span></div></div>
        <div class="row"><span class="date red"><small>Oct</small>12</span><div><div class="n">🚫 No School</div>
          <p>Fall break</p><span class="by">By: Kiker Elementary</span></div></div>
      </div>`;
  const carpool = `<div class="db-carpool"><span class="img"><img src="${A}bus.webp" alt=""></span>
        <span><b>You're covering drop-off & pick-up for Mia today</b><i>Tap for pickup details →</i></span></div>`;
  const lunch = `<div class="db-lunch"><p class="db-h">🥪 Today’s Lunch (Kiker Elementary)</p>
        <ol><li>Hamburger 🍖 🌱</li><li>Rebellyous Burger 🍖</li><li>SunButter & Jelly Sandwich 🍖 🥪</li></ol></div>`;

  // Lydia's Daily Brief. The film opens it with the to-do still open, then ticks it.
  const brief = `<section class="sa-screen sa-brief" data-s="brief">
    <div class="db-scroll">
      <div class="db-top"><img class="av" src="${A}lydia.webp" alt=""><div class="t"><b>Sprout AI</b><span>Thursday, September 24</span></div>
        <span class="cal">${phi("calendar-dots")}</span></div>
      <div class="db-hello"><div><h3>Your day, in order.</h3><em>Full, but manageable.</em></div>
        <div class="wx"><span>☀️</span>68–86°</div></div>
      <hr>
      <div class="db-att">
        <div class="hd"><div><div class="n">Need your attention</div><div class="d att-sub">One thing left for today.</div></div>
          <span class="ring att-ring" style="--p:0"><span class="att-count">0/1</span></span></div>
        <div class="db-todo" data-todo><span class="box">${phi("check")}</span>
          <span class="tx"><span class="n">Presley submit project reports</span><span class="m">Mrs. Taylor’s Class · <small>Due Friday</small></span></span>
          <span class="go">${phi("arrow-right")}</span></div>
      </div>
      <hr>
      <p class="db-h" data-sec="carpool">🚗 Carpool</p>
      ${carpool}
      <hr>
      <p class="db-h" data-sec="today">📅 Happening today</p>
      ${timeline}
      <hr>
      <p class="db-h" data-sec="upcoming">📆 Upcoming events</p>
      ${upcoming}
      <hr>
      ${lunch}
    </div>
    <span class="sa-home-ind"></span>
  </section>`;

  const home = `<section class="sa-screen sa-home" data-s="home">
    <div class="sa-tile logo"><img src="${A}clover.webp" alt=""></div>
    <h3>What are we creating today?</h3>
    <p class="pick">Pick one below</p>
    <div class="sa-rows">${rows.map(([k, n, d, img]) => `<button class="sa-row" data-pick="${k}">
          <span class="sa-tile"><img src="${A}${img}.webp" alt=""></span>
          <span class="tx"><span class="n">${n}</span><span class="d">${d}</span></span></button>`).join("")}</div>
  </section>`;

  const listen = `<section class="sa-screen sa-listen" data-s="listen">
    <div class="sa-head"><button class="sa-back">${ic.back}</button><span class="sp"></span></div>
    <div class="body">
      <div class="sa-tile icon"><img class="flow-icon" src="${A}bell.webp" alt=""></div>
      <div class="sa-say">
        <span class="lbl">Say it like this</span>
        <span class="q">“Remind my husband to pick up Presley from school at 2PM today.”</span>
        <div class="row"><span class="sa-orb"><img src="${A}orb.webp" alt=""><canvas class="sa-thinking-orb"></canvas></span>
          <span class="state">Listening…</span>
          <button class="sa-check">${ic.check}<i class="pulse"></i></button></div>
      </div>
      <div class="sa-need"><h4>Needed information</h4><div class="list">${needList(needs)}</div></div>
    </div>
    <span class="sa-home-ind"></span>
  </section>`;

  const review = `<section class="sa-screen sa-review" data-s="review">
    <div class="sa-head"><button class="sa-back">${ic.back}</button><span class="t">Review Reminder</span><span class="sp"></span></div>
    <div class="body">
      <div class="sa-field"><div class="l">Reminder</div><div class="v"><span data-f="what">Pick up Presley from school</span></div></div>
      <div class="sa-when"><span class="f"><span class="ic">${ic.cal}</span><span data-f="day">Today, Sep 24</span></span>
        <span class="f"><span class="ic">${ic.clock}</span><span data-f="time">2:00 PM</span></span><span class="opt">Optional</span></div>
      <div class="sa-who"><p class="l">Who is this for?</p><div class="opts">
        <button data-who="me" aria-pressed="false"><span class="e">👩</span>Myself</button>
        <button data-who="spouse" aria-pressed="false"><span class="e">👨</span>Spouse</button>
        <button data-who="both" aria-pressed="false"><span class="e">💛</span>Both</button></div></div>
    </div>
    <button class="sa-cta">Set Reminder</button>
    <span class="sa-home-ind"></span>
  </section>`;

  const set = `<section class="sa-screen sa-set" data-s="set">
    <div class="mid"><div class="ring"><span>${ic.check}</span></div>
      <h3>Your reminder is set</h3><p class="msg">We’ll remind Matt to “Pick up Presley from school” today at 2:00 PM. It’s in his Daily Brief now.</p></div>
    <button class="sa-cta">Try it again</button>
    <span class="sa-home-ind"></span>
  </section>`;

  const EV_PHOTO = { story: "ev-storytime", nature: "ev-nature", splash: "ev-splash" };
  const WEEK = [["Thu", 24], ["Fri", 25], ["Sat", 26], ["Sun", 27], ["Mon", 28], ["Tue", 29], ["Wed", 30]];
  const EVENTS = {
    24: [["story", "Storytime at BookPeople", "10:00 AM · Free · Downtown Austin", "2.1 mi", ""],
      ["nature", "Nature Scavenger Hunt", "Zilker Park", "3 mi", ""],
      ["splash", "Toddler Splash Hour", "11:30 AM · Deep Eddy Pool", "4 mi", "Swimming"]],
    26: [["splash", "Toddler Splash Hour", "9:30 AM · Deep Eddy Pool", "4 mi", ""],
      ["story", "Saturday Story & Craft", "10:30 AM · $5 · BookPeople", "2.1 mi", "Reading"],
      ["nature", "Family Nature Walk", "5:00 PM · Zilker Park", "3 mi", ""]],
  };
  const evCard = ([photo, title, meta, dist, tag]) => `<article class="ev-card${tag ? " is-tagged" : ""}">
      <div class="pic"><img src="${A}${EV_PHOTO[photo]}.webp" alt="">
        ${tag ? "" : `<span class="dist">${dist}</span>`}</div>
      <div class="bd">${tag ? `<span class="tag">${tag}</span>` : ""}<h4>${title}</h4><p>${meta}</p>
        ${tag ? `<div class="ft"><span>${dist}</span><span class="share"><i><img src="${A}ev-share.webp" alt=""></i>Share</span></div>` : ""}</div>
    </article>`;
  const events = `<section class="sa-screen sa-events" data-s="events">
    <div class="ev-top">
      <div class="ev-tabs"><button class="on">Discover</button><button>My Events</button><i class="bar"></i></div>
      <div class="ev-week">${WEEK.map(([d, n], i) => `<button data-day="${n}" class="${i === 0 ? "on" : ""}"><small>${d}</small>${n}</button>`).join("")}</div>
    </div>
    <div class="ev-scroll">
      <div class="ev-list" data-list="24">${EVENTS[24].map(evCard).join("")}</div>
      <div class="ev-list" data-list="26">${EVENTS[26].map(evCard).join("")}</div>
    </div>
    <span class="sa-home-ind"></span>
  </section>`;

  const chat = `<section class="sa-screen sa-chat" data-s="chat">
    <div class="ch-head"><span class="sq brand">${phi("plus")}</span><h3>Chat</h3>
      <span class="r"><span class="sq">${phi("magnifying-glass")}</span><span class="sq">${phi("note-pencil")}</span></span></div>
    <div class="ch-scroll">
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
  </section>`;

  const clubs = `<section class="sa-screen sa-clubs" data-s="clubs">
    <div class="cl-scroll">
      <div class="cl-comms">
        <span class="on"><img src="${A}club-kiker.webp" alt="">Kiker</span>
        <span><img src="${A}club-cdc.webp" alt="">CDC</span>
        <span><img src="${A}club-ssc.webp" alt="">SSC Soccer</span>
        <span><img src="${A}club-creator.webp" alt="">Creator Camp</span>
      </div>
      <div class="cl-chips">
        ${["All", "Kindergarten", "1st Grade", "2nd Grade", "Mrs. Taylor's Class"].map((c, i) => `<button class="${i === 0 ? "on" : ""}">${c}</button>`).join("")}
      </div>
      <div class="cl-dir"><span class="ring">50%</span><div class="tx"><b>Member Directory</b><span>You've met 8 out of 16 members</span></div>
        <span class="sq">${phi("magnifying-glass")}</span><span class="sq">${phi("user-plus")}</span></div>
      <div class="cl-mem" data-member="amanda"><span class="pic"><img src="${A}amanda-photo.png" alt=""></span><div class="tx"><b>Amanda Hamilton</b><span>Marlow’s Mom</span></div><i class="new">New</i></div>
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
  </section>`;


  // ── Tony's 28 Sep revision: Chat list, inside a Class Group Chat, a member profile ──
  const F = "assets/figma/";
  const grp = [
    ["av", `<img src="${F}cl-kiker.png" alt="">`, "First Grade", "first"],
    ["av photo", `<img src="${A}cast-teacher-taylor.webp" alt="">`, "Mrs. Taylor’s", "mt"],
    ["av", `<img src="${F}cl-kiker.png" alt="">`, "Kindergarten", "kinder"],
    ["av mono", "MJ", "Ms. Jessica’s", ""],
    ["av cdc", `<img src="${F}cl-cdc-a.png" alt=""><img src="${F}cl-cdc-b.png" alt="" style="position:absolute">`, "3 year old’s", ""],
    ["av mono", "MJ", "Ms. Joana’s Class", ""],
    ["av tile", `<img src="${F}cl-tile-4.png" alt=""><span class="dist">Sept 12</span>`, "Richard’s B-day", ""],
    ["av tile", `<img src="${F}cl-tile-5.png" alt=""><span class="dist">Sept 12</span>`, "Kids' Football", ""],
  ];
  const dms = [
    ["raj", "Raj Singh", "Raj: See you there!", "8:30 PM", 4],
    ["joe", "Joe Mravca", "You: Yeah i’ll call you again in a minute", "9:00 PM", 4],
    ["robert", "Robert Hugos", "Robert: my golf score was so good today!", "8:45 PM", 2],
    ["scott", "Scott Vogelgesang", "Scott: i don’t think so let me think again", "8:50 PM", 5],
    ["eitan", "Eitan Miller", "You: I’ll go surf with you as well", "8:55 PM", 1],
    ["fatima", "Fatima Ali", "Fatima: Looking forward to it!", "9:15 PM", 6],
  ];
  const chatlist = `<section class="sa-screen cl2" data-s="chatlist">
    <div class="hd"><div class="l"><span class="sqb"><img src="${F}cl-plus.svg" alt=""></span><span class="sqb ghost"></span></div><h3>Chat</h3>
      <div class="r"><span class="sqr"><img src="${F}cl-search.svg" alt=""></span><span class="sqr"><img src="${F}cl-note-pencil.svg" alt=""></span></div></div>
    <div class="groups">${grp.map(([c, inner, n, key]) => `<div class="g"${key ? ` data-g="${key}"` : ""}><div class="${c}">${inner}</div><div class="n">${n}</div>
      ${key === "kinder" ? `<div class="bub dots"><div class="b"><i></i><i></i><i></i></div><span class="d1"></span><span class="d2"></span></div>` : ""}
      ${key === "first" ? `<div class="bub msg"><div class="b">Yes i can be there in 3:15, just wait</div><span class="d1"></span><span class="d2"></span></div>` : ""}</div>`).join("")}</div>
    <div class="dms"><div class="t">Direct Messages<img src="${F}cl-caret-down.svg" alt=""></div>
      ${dms.map(([k, n, m, t, c], i) => `${i ? '<div class="div"></div>' : ""}<div class="dm"><img src="${F}cl-dm-${k}.png" alt=""><div class="tx"><b>${n}</b><span>${m}</span></div><div class="m"><small>${t}</small><i>${c}</i></div></div>`).join("")}</div>
    <div class="ov"></div>
  </section>`;

  // tab icons: Phosphor regular, the same glyphs the Figma tabs use
  const gtab = (k, label, icon, note) => `<div class="tab" data-tab="${k}">${icon}<span>${label}</span>${note ? `<i class="note">${note}</i>` : ""}</div>`;
  const group = `<section class="sa-screen gc" data-s="group">
    <img class="doodle" src="${F}chat-bg.png" alt="">
    <div class="hd"><div class="row"><span class="back"><img src="${F}gc-caret-left.svg" alt=""></span>
      <div class="who"><div class="av"><img src="${A}cast-teacher-taylor.webp" alt=""></div><div><b>Mrs. Taylor’s Class</b><span>10 members</span></div></div>
      <span class="pen"><img src="${F}gc-pencil.svg" alt=""></span></div>
      <div class="tabs">${gtab("chat", "Chat", "@@chats-teardrop")}${gtab("calendar", "Calendar", "@@calendar-dots")}${gtab("updates", "Updates", "@@envelope-simple", 2)}${gtab("links", "Links", "@@push-pin")}</div></div>
    <div class="panel" data-p="chat">
      <!-- 29 Sep: the same cast and conversation as the example chat on the roomparent.com
           join page (chat.html), portraits in assets/img/cast-*.webp. Replaces the Figma
           placeholder copy ("Yoow What is up", "Meeting Point Event … golfing"). Lydia is
           the viewer, so her message is the right-hand one. The conversation is taller
           than the panel, so seg4 scrolls .scroll up while it plays. -->
      <div class="scroll">
      <div class="msgs">
        <div class="bb"><div class="pp"><img src="${A}cast-teacher-taylor.webp" alt=""></div><div class="col"><div class="nm">Mrs. Taylor<span class="role">Teacher</span></div>
          <div class="bw"><img class="tail" src="${F}gc-tail-left.svg" alt=""><div class="c two"><p style="margin-bottom:2px">Good morning! Picture day is this Friday. Order forms went home in the blue folders.</p><time>8:02 AM</time></div></div></div></div>
      </div>
      <div class="mine" style="margin-top:16px"><div class="bw"><img class="tail" src="${F}gc-tail-right.svg" alt=""><div class="c"><p>I added the Fall Festival to our class calendar. We need four volunteers for the bake sale table.</p><time>8:10 AM</time></div></div></div>
      <div class="msgs" style="margin-top:16px">
        <div class="bb"><div class="pp"><img src="${A}cast-priya.webp" alt=""></div><div class="col"><div class="nm">Priya Shah<span class="role">Cooper’s Mom</span></div>
          <div class="bw"><img class="tail" src="${F}gc-tail-left.svg" alt=""><div class="c one"><p>Count me in! I’ll bring banana muffins.</p><time>8:14 AM</time></div></div></div></div>
        <div class="bb"><div class="pp"><img src="${A}cast-marcus.webp" alt=""></div><div class="col"><div class="nm">Marcus Reed<span class="role">Ava’s Dad</span></div>
          <div class="bw"><img class="tail" src="${F}gc-tail-left.svg" alt=""><div class="c one"><p>I can help set up at 9.</p><time>8:21 AM</time></div></div></div></div>
        <div class="bb"><div class="pp"><img src="${A}cast-jen.webp" alt=""></div><div class="col"><div class="nm">Jen Walsh<span class="role">Leo’s Mom</span></div>
          <div class="bw"><img class="tail" src="${F}gc-tail-left.svg" alt=""><div class="c two"><p>Does anyone have a spare blue folder? Ours came home soaked.</p><time>8:40 AM</time></div></div></div></div>
        <div class="bb"><div class="pp"><img src="${A}cast-teacher-taylor.webp" alt=""></div><div class="col" style="flex:1"><div class="nm">Mrs. Taylor<span class="role">Teacher</span></div>
          <div class="bw"><div class="c"><div class="reply"><div class="who2"><img src="${A}cast-jen.webp" alt="">Replying to Jen Walsh</div>
            <div class="q">Does anyone have a spare blue folder? Ours came home soaked.</div></div>
            <div class="ans"><span>I have extras in the classroom. I’ll send one home with Leo today.</span><time>8:52 AM</time></div></div><img class="tail" src="${F}gc-tail-left.svg" alt=""></div></div></div>
      </div>
      </div>
    </div>
    <div class="panel" data-p="calendar">
      <div class="cal">
        <div class="top"><div class="ttl">September 2026<span class="rb"><img src="${F}cal-frame-corners.svg" alt=""></span></div>
          <div class="nav"><span class="rb"><img src="${F}cal-caret-left.svg" alt=""></span><span class="rb"><img src="${F}cal-caret-right.svg" alt=""></span></div></div>
        <div class="wk days"><span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span></div>
        <div class="wk dates"><span class="past">20</span><span class="past">21</span><span class="past">22</span><span class="past">23</span><span class="sel">24<img src="${F}cal-dot-white.svg" alt=""></span><span>25</span><span>26<img src="${F}cal-dot.svg" alt=""></span></div>
        <div class="legend"><span><i></i>Today</span><span><i class="red"></i>No school</span><span><i class="dot"></i>Has notes</span></div>
      </div>
      <div class="notes">
        <div class="hr">Thursday, September 24<span class="add"><img src="${F}cal-plus.svg" alt=""><b>Add Note</b></span></div>
        <div class="note-card"><b>📝 Picture Day is tomorrow</b><p>Order forms went home in the blue folders. Retakes are on October 20.</p><small>By: Mrs. Taylor</small></div>
        <div class="note-card"><b>📝 Fall Festival volunteers</b><p>Four spots left at the bake sale table, Saturday, Oct 10 at 10 AM.</p><small>By: Lydia Martin</small></div>
      </div>
    </div>
    <div class="panel" data-p="updates">
      <div class="ups">
        <div class="hr">Updates<span class="acct"><span class="mini">LM</span><span class="em">Mrs. Taylor’s Class</span><img src="${F}up-caret-right.svg" alt=""></span></div>
        <div class="up unread"><div><b>Picture Day this Friday</b><p>Order forms went home in the blue folders today. Smiles on, and retakes are October 20.</p></div>
          <div class="ft"><span><span class="mini"><img src="${A}cast-teacher-taylor.webp" alt=""></span>taylor@kikerelementary.com</span><small>Sep 22, 3:40 PM</small></div></div>
        <div class="up"><div><b>This week in 1st Grade</b><p>Spelling words, library day moves to Thursday, and please send a labeled water bottle.</p></div>
          <div class="ft"><span><span class="mini"><img src="${A}cast-teacher-taylor.webp" alt=""></span>taylor@kikerelementary.com</span><small>Sep 21, 7:15 AM</small></div></div>
      </div>
    </div>
    <div class="panel" data-p="links">
      <div class="lks">
        <div class="hr"><b>Pinned links</b><span>set by your admin</span></div>
        <div class="list">${[["School website", "austinisd.org"], ["Mrs. Taylor's Wish List", "amazon.com"], ["Class Donations", "venmo.com/room-parent"]].map(([n, u]) =>
          `<div class="lk"><div class="l"><span class="ic"><img src="${F}ln-link.svg" alt=""></span><div><b>${n}</b><span>${u}</span></div></div>
           <div class="acts"><i><img src="${F}ln-pencil.svg" alt=""></i><i class="del"><img src="${F}ln-trash.svg" alt=""></i></div></div>`).join("")}</div>
        <div class="addlink"><img src="${F}ln-plus-circle.svg" alt="">Add a link</div>
        <div class="fn">Note: Admins can add &amp; label links — school site, wishlist, donate, merch, or anything else your group needs.</div>
      </div>
    </div>
    <div class="typebar"><div class="in"><span class="img"><img src="${F}gc-image.svg" alt=""></span><span class="field">Type Message</span><span class="send"><img src="${F}gc-send.svg" alt=""></span></div><span class="ind"></span></div>
  </section>`;

  // Amanda's profile: Tony's screenshot of the live app. The family photo and the kids'
  // avatars are crops of that screenshot (no HD original exists).
  const profile = `<section class="sa-screen pf" data-s="profile">
    <span class="back"><img src="${F}gc-caret-left.svg" alt=""></span>
    <div class="dim"></div>
    <div class="photo"><img src="${A}amanda-photo.png" alt=""></div>
    <div class="name">Amanda  Hamilton</div>
    <div class="sub">Mother of 2 kids</div>
    <div class="kids"><div class="kid"><img src="${A}kid-marlow.png" alt=""><b>Marlow</b><i>9 yr</i></div><div class="kid"><img src="${A}kid-ollie.png" alt=""><b>Ollie</b><i>8 yr</i></div></div>
    <div class="rule" style="top:443.5px"></div>
    <h4 style="top:466px">Interests</h4>
    <div class="chips">${[["⚽", "Soccer"], ["🏐", "Volleyball"], ["🀄", "Mahjong"], ["🥾", "Hiking"], ["🤸", "Pilates"], ["💃", "Dance"], ["🚶", "Walking"]].map(([e, n]) => `<span class="chip"><em>${e}</em>${n}</span>`).join("")}</div>
    <div class="rule" style="top:591px"></div>
    <h4 style="top:612px">User Event History</h4>
    <div class="empty"><svg viewBox="0 0 256 256"><path d="M216,48V88H40V48a8,8,0,0,1,8-8H208A8,8,0,0,1,216,48Z"/><path d="M208,32H184V24a8,8,0,0,0-16,0v8H88V24a8,8,0,0,0-16,0v8H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM72,48v8a8,8,0,0,0,16,0V48h80v8a8,8,0,0,0,16,0V48h24V80H48V48ZM208,208H48V96H208V208Zm-68-76a12,12,0,1,1-12-12A12,12,0,0,1,140,132Zm44,0a12,12,0,1,1-12-12A12,12,0,0,1,184,132ZM96,172a12,12,0,1,1-12-12A12,12,0,0,1,96,172Zm44,0a12,12,0,1,1-12-12A12,12,0,0,1,140,172Zm44,0a12,12,0,1,1-12-12A12,12,0,0,1,184,172Z"/></svg></div>
    <div class="none">No events attended yet</div>
    <div class="bar"></div>
    <div class="msg">Message</div>
  </section>`;

  const SCREENS = { brief, home, listen, review, set, events, chat, clubs, chatlist, group, profile };
  for (const k of Object.keys(SCREENS)) SCREENS[k] = SCREENS[k].replace(/@@([a-z-]+)/g, (_, n) => `<svg viewBox="0 0 256 256"><path d="${PH[n]}"/></svg>`);

  // a phone: frame + one assist-app holding the named screens and the tab bar
  function phone(id, screens, active, tab) {
    const el = document.createElement("div");
    el.className = "phone";
    el.id = id;
    el.innerHTML = `<div class="scr"><div class="assist-app">${statusBar}${screens.map((s) => SCREENS[s]).join("")}${navBar(tab)}</div></div>`;
    const on = el.querySelector(`[data-s="${active}"]`);
    if (on) on.classList.add("is-on");
    return el;
  }

  // Matt's phone: the website's shared Daily Brief (Figma 12403:210488)
  function mattPhone(id) {
    const el = document.createElement("div");
    el.className = "phone";
    el.id = id;
    el.innerHTML = `<div class="scr"><div class="spouse-phone vid"><div class="frame"><div class="scr"><div class="app">
      ${statusBar}
      <div class="sp-note"><span class="ic"><img src="${A}clover.webp" alt=""></span>
        <div><div class="a">Sprout · now</div><div class="t">Lydia set a reminder for you</div><div class="s">Pick up Presley from school at 2:00 PM</div></div></div>
      <div class="mt-scroll">
        <div class="db-top"><img class="av" src="${A}matt.webp" alt=""><div class="t"><b>Sprout AI</b><span>Thursday, September 24</span></div>
          <span class="cal">${phi("bell")}</span><span class="cal">${phi("calendar-dots")}</span></div>
        <div class="db-hello"><div><h3>Your day, in order.</h3><em>Full, but manageable.</em></div>
          <div class="wx"><span>☀️</span>68–86°</div></div>
        <hr>
        <div class="db-att mt-att">
          <div class="hd"><span class="chev">${phi("caret-down")}</span><div class="tt"><div class="n">Needs your attention</div><div class="d mt-sub">Great, you got everything done today.</div></div>
            <span class="ring mt-ring" style="--p:1"><span class="mt-count">3/3</span></span></div>
          <div class="mt-new"><div>${todo("Pick up Presley from school", "Today · <small>2:00 PM</small>", { tag: ' <i class="tag">From Lydia</i>' })}</div></div>
        </div>
        <div class="db-att mt-rem">
          <div class="hd"><span class="chev open">${phi("caret-down")}</span><img class="av" src="${A}lydia.webp" alt=""><div class="tt"><div class="n">Lydia’s Reminders</div><div class="d">2 still open.</div></div>
            <span class="ring" style="--p:.333"><span>1/3</span></span></div>
          ${todo("Bring towels for water day", "1st Grade Class · <small>Due Today</small>")}
          ${todo("Presley submit project reports", "Mrs. Taylor’s Class · <small>Due Friday</small>", { done: true, go: true })}
          ${todo("Plan field trip itinerary", '4th Grade Class · <small class="late">2 days overdue</small>', { tag: ' <i class="tag">From you</i>' })}
        </div>
        <hr>
        <p class="db-h">🚗 Carpool</p>
        ${carpool}
        <hr>
        <p class="db-h">📅 Happening today</p>
        ${timeline}
      </div>
      ${navBar("brief")}
      <span class="sa-home-ind"></span>
    </div></div></div></div></div>`;
    return el;
  }

  window.SproutScreens = { phone, mattPhone, phi, A, PH };
})();
