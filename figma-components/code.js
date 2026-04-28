// Sprout Component Generator
// Generates scaffolded component sets for Avatar, IconButton,
// Header / Standard, Header / User, Header / Event Preview.
// Icons / avatars / type styles are placeholder rectangles — swap to real
// instances after generation.

figma.showUI(__html__, { width: 360, height: 520 });

// -- Color tokens (approximate; rebind to your variables after generation) ----
const C = {
  bg:        { r: 1,    g: 1,    b: 1    },
  text:      { r: 0.09, g: 0.09, b: 0.09 },
  textMuted: { r: 0.42, g: 0.42, b: 0.42 },
  border:    { r: 0.88, g: 0.88, b: 0.88 },
  slot:      { r: 0.93, g: 0.95, b: 0.97 },
  placeholder: { r: 0.86, g: 0.88, b: 0.9 },
  accent:    { r: 0.14, g: 0.55, b: 0.25 }, // Sprout green (approx)
  badgeRed:  { r: 0.91, g: 0.29, b: 0.29 },
  online:    { r: 0.25, g: 0.78, b: 0.35 },
};

// -- Layout tracker so generated components don't overlap ---------------------
let nextX = null;
let nextY = null;
let rowHeight = 0;

function initPlacement() {
  const c = figma.viewport.center;
  nextX = Math.round(c.x - 200);
  nextY = Math.round(c.y - 200);
  rowHeight = 0;
}

function placeNode(node) {
  node.x = nextX;
  node.y = nextY;
  const gap = 80;
  rowHeight = Math.max(rowHeight, node.height);
  nextX = Math.round(node.x + node.width + gap);
  if (nextX - figma.viewport.center.x > 1600) {
    nextX = Math.round(figma.viewport.center.x - 200);
    nextY = Math.round(nextY + rowHeight + gap);
    rowHeight = 0;
  }
}

// -- Font loading -------------------------------------------------------------
async function loadFonts() {
  await figma.loadFontAsync({ family: "Inter", style: "Regular" });
  await figma.loadFontAsync({ family: "Inter", style: "Medium" });
  await figma.loadFontAsync({ family: "Inter", style: "Semi Bold" });
}

// -- Helpers ------------------------------------------------------------------
function solidFill(color, opacity) {
  const fill = { type: "SOLID", color: color };
  if (opacity !== undefined) fill.opacity = opacity;
  return [fill];
}

function noFill() { return []; }

function makeText(characters, fontSize, weight, color) {
  const t = figma.createText();
  const style = weight === "medium" ? "Medium" : (weight === "semibold" ? "Semi Bold" : "Regular");
  t.fontName = { family: "Inter", style: style };
  t.characters = characters;
  t.fontSize = fontSize;
  if (color) t.fills = solidFill(color);
  return t;
}

function makeRect(width, height, color, name, radius) {
  const r = figma.createRectangle();
  r.name = name || "Rectangle";
  r.resize(width, height);
  r.fills = solidFill(color || C.placeholder);
  if (radius !== undefined) r.cornerRadius = radius;
  return r;
}

function makeEllipse(size, color, name) {
  const e = figma.createEllipse();
  e.name = name || "Ellipse";
  e.resize(size, size);
  e.fills = solidFill(color || C.placeholder);
  return e;
}

function makeIconPlaceholder(size, name) {
  const f = figma.createFrame();
  f.name = name || ("Icon — swap for CaretLeft (" + size + ")");
  f.resize(size, size);
  f.fills = solidFill(C.placeholder, 0.6);
  f.cornerRadius = 4;
  return f;
}

function applyAutoLayout(frame, opts) {
  frame.layoutMode = opts.direction || "HORIZONTAL";
  frame.primaryAxisSizingMode = opts.primarySize || "AUTO";
  frame.counterAxisSizingMode = opts.counterSize || "AUTO";
  frame.primaryAxisAlignItems = opts.primaryAlign || "MIN";
  frame.counterAxisAlignItems = opts.counterAlign || "MIN";
  frame.paddingLeft = opts.paddingLeft || 0;
  frame.paddingRight = opts.paddingRight || 0;
  frame.paddingTop = opts.paddingTop || 0;
  frame.paddingBottom = opts.paddingBottom || 0;
  frame.itemSpacing = opts.itemSpacing || 0;
}

// =============================================================================
// AVATAR COMPONENT SET
// =============================================================================
function makeAvatarVariant(sizeName, px) {
  const comp = figma.createComponent();
  comp.name = "size=" + sizeName;
  comp.resize(px, px);
  comp.fills = noFill();
  comp.clipsContent = true;

  const ellipse = makeEllipse(px, C.placeholder, "Avatar fill (swap image / instance)");
  comp.appendChild(ellipse);
  ellipse.x = 0;
  ellipse.y = 0;

  return comp;
}

async function generateAvatar() {
  await loadFonts();
  const sizes = [
    { name: "xs", px: 20 },
    { name: "sm", px: 32 },
    { name: "md", px: 40 },
    { name: "lg", px: 52 },
    { name: "xl", px: 64 }
  ];
  const variants = sizes.map(s => makeAvatarVariant(s.name, s.px));
  const set = figma.combineAsVariants(variants, figma.currentPage);
  set.name = "Avatar";
  set.fills = solidFill(C.bg);
  set.itemSpacing = 24;
  set.layoutMode = "HORIZONTAL";
  set.paddingLeft = 40;
  set.paddingRight = 40;
  set.paddingTop = 40;
  set.paddingBottom = 40;
  set.primaryAxisSizingMode = "AUTO";
  set.counterAxisSizingMode = "AUTO";
  set.counterAxisAlignItems = "CENTER";
  placeNode(set);
  return set;
}

// =============================================================================
// ICONBUTTON COMPONENT SET
// =============================================================================
function makeIconButtonVariant(sizeName, boxPx, iconPx, state) {
  const comp = figma.createComponent();
  comp.name = "size=" + sizeName + ", state=" + state;
  comp.resize(boxPx, boxPx);
  comp.cornerRadius = boxPx / 2;

  // Background fill varies by state
  let bg = null;
  if (state === "default") bg = null; // transparent
  else if (state === "pressed") bg = solidFill({ r: 0.92, g: 0.94, b: 0.97 });
  else if (state === "disabled") bg = solidFill(C.bg, 0);

  comp.fills = bg || noFill();
  if (state === "disabled") comp.opacity = 0.4;

  applyAutoLayout(comp, {
    direction: "HORIZONTAL",
    primarySize: "FIXED",
    counterSize: "FIXED",
    primaryAlign: "CENTER",
    counterAlign: "CENTER"
  });

  const icon = makeIconPlaceholder(iconPx, "Icon — swap (" + iconPx + ")");
  comp.appendChild(icon);

  return comp;
}

async function generateIconButton() {
  await loadFonts();
  const variants = [];
  const configs = [
    { sizeName: "sm", boxPx: 32, iconPx: 20 },
    { sizeName: "md", boxPx: 40, iconPx: 24 }
  ];
  const states = ["default", "pressed", "disabled"];

  for (let i = 0; i < configs.length; i++) {
    for (let j = 0; j < states.length; j++) {
      const cfg = configs[i];
      variants.push(makeIconButtonVariant(cfg.sizeName, cfg.boxPx, cfg.iconPx, states[j]));
    }
  }

  const set = figma.combineAsVariants(variants, figma.currentPage);
  set.name = "IconButton";
  set.fills = solidFill(C.bg);
  set.itemSpacing = 24;
  set.layoutMode = "HORIZONTAL";
  set.paddingLeft = 40;
  set.paddingRight = 40;
  set.paddingTop = 40;
  set.paddingBottom = 40;
  set.primaryAxisSizingMode = "AUTO";
  set.counterAxisSizingMode = "AUTO";
  set.counterAxisAlignItems = "CENTER";
  placeNode(set);
  return set;
}

// =============================================================================
// HEADER / STANDARD — 56h, back + title + action
// =============================================================================
async function generateHeaderStandard() {
  await loadFonts();

  const comp = figma.createComponent();
  comp.name = "Header / Standard";
  comp.resize(393, 56);
  comp.fills = solidFill(C.bg);

  applyAutoLayout(comp, {
    direction: "HORIZONTAL",
    primarySize: "FIXED",
    counterSize: "FIXED",
    primaryAlign: "SPACE_BETWEEN",
    counterAlign: "CENTER",
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 12,
    paddingBottom: 12,
    itemSpacing: 8
  });

  // Left slot — 32x32
  const leftSlot = figma.createFrame();
  leftSlot.name = "Left Slot (swap: Back / Close / Avatar / None)";
  leftSlot.resize(32, 32);
  leftSlot.fills = solidFill(C.slot);
  leftSlot.cornerRadius = 4;
  applyAutoLayout(leftSlot, {
    direction: "HORIZONTAL",
    primarySize: "FIXED",
    counterSize: "FIXED",
    primaryAlign: "CENTER",
    counterAlign: "CENTER"
  });
  const leftIcon = makeIconPlaceholder(24, "Icon — CaretLeft");
  leftSlot.appendChild(leftIcon);
  comp.appendChild(leftSlot);

  // Center slot — flex/grow with centered text
  const centerSlot = figma.createFrame();
  centerSlot.name = "Center Slot (swap: Title / Logo / Progress / ChatLabel)";
  centerSlot.resize(281, 32);
  centerSlot.fills = noFill();
  applyAutoLayout(centerSlot, {
    direction: "HORIZONTAL",
    primarySize: "FIXED",
    counterSize: "FIXED",
    primaryAlign: "CENTER",
    counterAlign: "CENTER"
  });
  centerSlot.layoutGrow = 1;
  const title = makeText("Title", 17, "semibold", C.text);
  title.textAlignHorizontal = "CENTER";
  centerSlot.appendChild(title);
  comp.appendChild(centerSlot);

  // Right slot — 32x32
  const rightSlot = figma.createFrame();
  rightSlot.name = "Right Slot (swap: IconButton / Text / None)";
  rightSlot.resize(32, 32);
  rightSlot.fills = solidFill(C.slot);
  rightSlot.cornerRadius = 4;
  applyAutoLayout(rightSlot, {
    direction: "HORIZONTAL",
    primarySize: "FIXED",
    counterSize: "FIXED",
    primaryAlign: "CENTER",
    counterAlign: "CENTER"
  });
  comp.appendChild(rightSlot);

  placeNode(comp);
  return comp;
}

// =============================================================================
// HEADER / USER — 75h, back + profile stack + menu
// =============================================================================
async function generateHeaderUser() {
  await loadFonts();

  const comp = figma.createComponent();
  comp.name = "Header / User";
  comp.resize(393, 75);
  comp.fills = solidFill(C.bg);

  applyAutoLayout(comp, {
    direction: "HORIZONTAL",
    primarySize: "FIXED",
    counterSize: "FIXED",
    primaryAlign: "SPACE_BETWEEN",
    counterAlign: "CENTER",
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 16,
    paddingBottom: 16,
    itemSpacing: 12
  });

  // Back icon
  const backSlot = figma.createFrame();
  backSlot.name = "Left — CaretLeft (swap)";
  backSlot.resize(24, 24);
  backSlot.fills = noFill();
  applyAutoLayout(backSlot, {
    direction: "HORIZONTAL",
    primarySize: "FIXED",
    counterSize: "FIXED",
    primaryAlign: "CENTER",
    counterAlign: "CENTER"
  });
  const backIcon = makeIconPlaceholder(24, "Icon — CaretLeft");
  backSlot.appendChild(backIcon);
  comp.appendChild(backSlot);

  // Profile stack: avatar + (name + status)
  const profile = figma.createFrame();
  profile.name = "Profile Stack";
  profile.fills = noFill();
  applyAutoLayout(profile, {
    direction: "HORIZONTAL",
    primarySize: "AUTO",
    counterSize: "AUTO",
    primaryAlign: "MIN",
    counterAlign: "CENTER",
    itemSpacing: 12
  });
  profile.layoutGrow = 1;

  const avatar = figma.createFrame();
  avatar.name = "Avatar slot (instance of Avatar / md)";
  avatar.resize(40, 40);
  avatar.fills = solidFill(C.placeholder);
  avatar.cornerRadius = 20;
  profile.appendChild(avatar);

  const nameStack = figma.createFrame();
  nameStack.name = "Name + Status";
  nameStack.fills = noFill();
  applyAutoLayout(nameStack, {
    direction: "VERTICAL",
    primarySize: "AUTO",
    counterSize: "AUTO",
    primaryAlign: "MIN",
    counterAlign: "MIN",
    itemSpacing: 2
  });
  const userName = makeText("User Name", 16, "semibold", C.text);
  nameStack.appendChild(userName);

  const statusRow = figma.createFrame();
  statusRow.name = "Status Row";
  statusRow.fills = noFill();
  applyAutoLayout(statusRow, {
    direction: "HORIZONTAL",
    primarySize: "AUTO",
    counterSize: "AUTO",
    primaryAlign: "MIN",
    counterAlign: "CENTER",
    itemSpacing: 6
  });
  const statusDot = makeEllipse(6, C.online, "Online Dot");
  statusRow.appendChild(statusDot);
  const statusText = makeText("Online", 13, "regular", C.textMuted);
  statusRow.appendChild(statusText);
  nameStack.appendChild(statusRow);
  profile.appendChild(nameStack);
  comp.appendChild(profile);

  // Right action — menu dots
  const rightSlot = figma.createFrame();
  rightSlot.name = "Right — DotsThreeCircle (swap)";
  rightSlot.resize(24, 24);
  rightSlot.fills = noFill();
  applyAutoLayout(rightSlot, {
    direction: "HORIZONTAL",
    primarySize: "FIXED",
    counterSize: "FIXED",
    primaryAlign: "CENTER",
    counterAlign: "CENTER"
  });
  const menuIcon = makeIconPlaceholder(24, "Icon — DotsThreeCircle");
  rightSlot.appendChild(menuIcon);
  comp.appendChild(rightSlot);

  placeNode(comp);
  return comp;
}

// =============================================================================
// HEADER / EVENT PREVIEW — 91h, back + event thumb + directions
// =============================================================================
async function generateHeaderEventPreview() {
  await loadFonts();

  const comp = figma.createComponent();
  comp.name = "Header / Event Preview";
  comp.resize(393, 91);
  comp.fills = solidFill(C.bg);

  applyAutoLayout(comp, {
    direction: "HORIZONTAL",
    primarySize: "FIXED",
    counterSize: "FIXED",
    primaryAlign: "SPACE_BETWEEN",
    counterAlign: "CENTER",
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 16,
    paddingBottom: 16,
    itemSpacing: 12
  });

  // Back
  const backSlot = figma.createFrame();
  backSlot.name = "Left — CaretLeft (swap)";
  backSlot.resize(24, 24);
  backSlot.fills = noFill();
  applyAutoLayout(backSlot, {
    direction: "HORIZONTAL",
    primarySize: "FIXED",
    counterSize: "FIXED",
    primaryAlign: "CENTER",
    counterAlign: "CENTER"
  });
  const backIcon = makeIconPlaceholder(24, "Icon — CaretLeft");
  backSlot.appendChild(backIcon);
  comp.appendChild(backSlot);

  // Center: thumbnail + title + date/time
  const eventRow = figma.createFrame();
  eventRow.name = "Event Preview";
  eventRow.fills = noFill();
  applyAutoLayout(eventRow, {
    direction: "HORIZONTAL",
    primarySize: "AUTO",
    counterSize: "AUTO",
    primaryAlign: "MIN",
    counterAlign: "CENTER",
    itemSpacing: 12
  });
  eventRow.layoutGrow = 1;

  const thumb = figma.createFrame();
  thumb.name = "Event Thumb (swap image)";
  thumb.resize(59, 59);
  thumb.fills = solidFill(C.placeholder);
  thumb.cornerRadius = 8;
  eventRow.appendChild(thumb);

  const eventText = figma.createFrame();
  eventText.name = "Event Text";
  eventText.fills = noFill();
  applyAutoLayout(eventText, {
    direction: "VERTICAL",
    primarySize: "AUTO",
    counterSize: "AUTO",
    primaryAlign: "MIN",
    counterAlign: "MIN",
    itemSpacing: 6
  });
  const eventTitle = makeText("Come Join me for Golf!", 15, "semibold", C.text);
  eventText.appendChild(eventTitle);

  const dateRow = figma.createFrame();
  dateRow.name = "Date + Time";
  dateRow.fills = noFill();
  applyAutoLayout(dateRow, {
    direction: "HORIZONTAL",
    primarySize: "AUTO",
    counterSize: "AUTO",
    primaryAlign: "MIN",
    counterAlign: "CENTER",
    itemSpacing: 8
  });
  const dateIcon = makeRect(16, 16, C.placeholder, "Icon — Calendar", 2);
  dateRow.appendChild(dateIcon);
  const dateText = makeText("Wed, Nov 8  ·  10 AM", 12, "regular", C.textMuted);
  dateRow.appendChild(dateText);
  eventText.appendChild(dateRow);
  eventRow.appendChild(eventText);
  comp.appendChild(eventRow);

  // Right: Directions button (icon + label)
  const rightAction = figma.createFrame();
  rightAction.name = "Right Action — Directions";
  rightAction.fills = noFill();
  applyAutoLayout(rightAction, {
    direction: "VERTICAL",
    primarySize: "AUTO",
    counterSize: "AUTO",
    primaryAlign: "CENTER",
    counterAlign: "CENTER",
    itemSpacing: 4
  });

  const rightIconWrap = figma.createFrame();
  rightIconWrap.name = "Icon Container";
  rightIconWrap.resize(32, 32);
  rightIconWrap.fills = solidFill(C.accent);
  rightIconWrap.cornerRadius = 16;
  applyAutoLayout(rightIconWrap, {
    direction: "HORIZONTAL",
    primarySize: "FIXED",
    counterSize: "FIXED",
    primaryAlign: "CENTER",
    counterAlign: "CENTER"
  });
  const rightIcon = makeIconPlaceholder(16, "Icon — ArrowElbowUpRight");
  rightIconWrap.appendChild(rightIcon);
  rightAction.appendChild(rightIconWrap);

  const rightLabel = makeText("Directions", 11, "medium", C.text);
  rightAction.appendChild(rightLabel);
  comp.appendChild(rightAction);

  placeNode(comp);
  return comp;
}

// =============================================================================
// Message handler
// =============================================================================
figma.ui.onmessage = async (msg) => {
  if (msg.type === "close") {
    figma.closePlugin();
    return;
  }

  try {
    initPlacement();
    let generated = [];

    if (msg.type === "avatar" || msg.type === "all") {
      generated.push(await generateAvatar());
    }
    if (msg.type === "iconbutton" || msg.type === "all") {
      generated.push(await generateIconButton());
    }
    if (msg.type === "header-standard" || msg.type === "all") {
      generated.push(await generateHeaderStandard());
    }
    if (msg.type === "header-user" || msg.type === "all") {
      generated.push(await generateHeaderUser());
    }
    if (msg.type === "header-event" || msg.type === "all") {
      generated.push(await generateHeaderEventPreview());
    }

    if (generated.length > 0) {
      figma.viewport.scrollAndZoomIntoView(generated);
      figma.notify("Created " + generated.length + " component(s). Cmd/Ctrl+Z to undo.");
      figma.ui.postMessage({ type: "done", count: generated.length });
    } else {
      figma.ui.postMessage({ type: "error", error: "No action matched: " + msg.type });
    }
  } catch (e) {
    figma.ui.postMessage({ type: "error", error: String(e && e.message ? e.message : e) });
    figma.notify("Error: " + String(e && e.message ? e.message : e), { error: true });
  }
};
