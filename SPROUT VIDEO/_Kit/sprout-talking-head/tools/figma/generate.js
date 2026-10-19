// Sprout talking-head kit · build one video's storyboard section. Printed by `storyboard.py code <project> generate`
// with __SPEC__ filled from storyboard/spec.json. Re-running replaces the section of the same project, so only run it
// for a fresh storyboard: edits made in Figma are lost unless they were read back with `read` + `apply` first.
// Returns the section id and the footage rect id per line (thumbnails go up with upload_assets, nodeIds = those ids).
const SPEC = __SPEC__;
const page = await figma.getNodeByIdAsync('__PAGE_ID__');
await figma.setCurrentPageAsync(page);
const holder = page.children.find(n => n.name === 'Storyboard · Components');
if (!holder) throw new Error('Run the components step first');
const cardSet = holder.findOne(n => n.type === 'COMPONENT_SET' && n.name === 'SB / Card');
const headerC = holder.findOne(n => n.type === 'COMPONENT' && n.name === 'SB / Video Header');
const V = id => figma.variables.getVariableByIdAsync(id);
const P = async (vid, c = { r: .5, g: .5, b: .5 }) => figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: c }, 'color', await V(vid));
const styles = await figma.getLocalTextStylesAsync();
const S = n => styles.find(s => s.name === n).id;
for (const f of [{ family: 'Inter', style: 'Regular' }, { family: 'Inter', style: 'Medium' }, { family: 'Inter', style: 'Semi Bold' }, { family: 'Playfair Display', style: 'Medium' }]) await figma.loadFontAsync(f);
const C = { white: 'VariableID:24:344', text: 'VariableID:24:328', subtle: 'VariableID:24:329', subtlest: 'VariableID:24:330', hover: 'VariableID:26:517',
  brandSubtle: 'VariableID:26:523', brandBg: 'VariableID:26:524', warnSubtle: 'VariableID:26:531', cream: 'VariableID:26:516', border: 'VariableID:26:537', borderSoft: 'VariableID:26:538', section: 'VariableID:26:518' };
const SCENE_COLOR = { 'Captions': C.hover, 'Captions + UI': C.brandSubtle, 'Half': C.warnSubtle, 'Full': C.brandBg };
const setProps = (inst, map) => { const p = {}; for (const k of Object.keys(inst.componentProperties)) { const base = k.split('#')[0]; if (base in map) p[k] = map[base]; } inst.setProperties(p); };
async function text(parent, chars, style, color) { const t = figma.createText(); parent.appendChild(t); await t.setTextStyleIdAsync(S(style)); t.characters = chars; t.fills = [await P(color)]; return t; }

const name = SPEC.title;
const old = page.children.find(n => n.type === 'SECTION' && n.getSharedPluginData('sprout', 'project') === SPEC.project);
let x = 0, y = 0;
if (old) { x = old.x; y = old.y; old.remove(); }
else { const others = page.children.filter(n => n.type === 'SECTION'); y = others.reduce((m, n) => Math.max(m, n.y + n.height + 200), 0); }
const sec = figma.createSection(); page.appendChild(sec); sec.name = name; sec.x = x; sec.y = y;
sec.setSharedPluginData('sprout', 'project', SPEC.project);
const W = 1800, PAD = 60;

const hd = headerC.createInstance(); sec.appendChild(hd); hd.x = PAD; hd.y = PAD; hd.resize(W - PAD * 2, hd.height);
setProps(hd, { 'Title': SPEC.title, 'Subtitle': SPEC.subtitle, 'Speaker label': SPEC.header.speaker, 'Opening zoom': SPEC.header.zoom ? 'on' : 'off',
  'Emphasis plate': SPEC.header.plate, 'Cutaway background': SPEC.header.cutaway, 'Notes': SPEC.header.notes });

// Rhythm strip: one bar per line, width by duration. Regenerated on every generate, not read back.
const total = SPEC.lines.reduce((s, l) => s + l.seconds, 0) || 1;
const rh = figma.createFrame(); sec.appendChild(rh); rh.name = 'Rhythm'; rh.layoutMode = 'VERTICAL'; rh.itemSpacing = 8; rh.fills = [];
rh.x = PAD; rh.y = hd.y + hd.height + 24; rh.resize(W - PAD * 2, 10); rh.counterAxisSizingMode = 'FIXED'; rh.primaryAxisSizingMode = 'AUTO';
const bar = figma.createFrame(); rh.appendChild(bar); bar.name = 'Bar'; bar.layoutMode = 'HORIZONTAL'; bar.itemSpacing = 2; bar.fills = []; bar.layoutSizingHorizontal = 'FILL'; bar.counterAxisSizingMode = 'AUTO'; bar.cornerRadius = 4; bar.clipsContent = true;
for (const l of SPEC.lines) { const r = figma.createRectangle(); bar.appendChild(r); r.name = l.id; r.resize(Math.max(4, (W - PAD * 2 - 2 * SPEC.lines.length) * l.seconds / total), 10); r.fills = [await P(SCENE_COLOR[l.scene])]; }
const share = {}; for (const l of SPEC.lines) share[l.scene] = (share[l.scene] || 0) + l.seconds;
await text(rh, ['Captions', 'Captions + UI', 'Half', 'Full'].map(s => `${s} ${Math.round(100 * (share[s] || 0) / total)}%`).join('   ·   ') + '   (guide: captions 40–60%, UI 10–25%, half 10–25%, full 15–30%)', 'Caption/3', C.subtle);

const PAIR_GAP = 48, COLS = 2, footage = {};
let row = [], rowY = rh.y + 60;
async function flush() { if (!row.length) return; const h = Math.max(...row.map(p => p.height)); rowY += h + PAIR_GAP; row = []; }
for (let i = 0; i < SPEC.lines.length; i++) {
  const l = SPEC.lines[i];
  const pair = figma.createFrame(); sec.appendChild(pair); pair.name = l.id; pair.layoutMode = 'HORIZONTAL'; pair.itemSpacing = 12; pair.fills = [];
  pair.primaryAxisSizingMode = 'AUTO'; pair.counterAxisSizingMode = 'AUTO';
  const ft = figma.createRectangle(); pair.appendChild(ft); ft.name = `Footage · ${l.id}`; ft.resize(216, 384); ft.cornerRadius = 12; ft.fills = [await P(C.hover)];
  const variant = cardSet.children.find(c => c.name === `Scene=${l.scene}`);
  const card = variant.createInstance(); pair.appendChild(card); card.name = `Card · ${l.id}`;
  setProps(card, { 'Id': l.id, 'Time': l.time, 'Line': l.text, 'Styled words': l.styled, 'Plan': l.plan, 'Ink background': l.ink, 'Speaker circle': l.pip, 'Merge with next': false });
  const sk = figma.createFrame(); pair.appendChild(sk); sk.name = `Sketch · ${l.id}`; sk.resize(216, 384); sk.cornerRadius = 12; sk.clipsContent = true;
  sk.fills = [await P(C.cream)]; sk.strokes = [await P(C.border)]; sk.strokeWeight = 1.5; sk.dashPattern = [6, 4];
  const hint = await text(sk, 'Sketch the scene here (optional)', 'Caption/3', C.subtlest); hint.name = 'Hint'; hint.textAlignHorizontal = 'CENTER'; hint.resize(180, hint.height); hint.x = 18; hint.y = 184;
  pair.x = PAD + (i % COLS) * (816 + PAIR_GAP); pair.y = rowY;
  footage[l.id] = ft.id; row.push(pair);
  if (row.length === COLS) await flush();
}
await flush();
sec.resizeWithoutConstraints(W, rowY + PAD - PAIR_GAP);
return { section: sec.id, name, footage };
