// Sprout talking-head kit · Figma storyboard components. Run through use_figma (printed by
// `storyboard.py code <project> components`). Idempotent: if the components exist it only reports them.
// Every colour is a local Semantic variable, every text a local text style (feedback-figma-local-styles-only).
const page = await figma.getNodeByIdAsync('__PAGE_ID__');
await figma.setCurrentPageAsync(page);
const existing = page.children.find(n => n.name === 'Storyboard · Components');
if (existing) {
  const card = existing.findOne(n => n.type === 'COMPONENT_SET' && n.name === 'SB / Card');
  const header = existing.findOne(n => n.type === 'COMPONENT' && n.name === 'SB / Video Header');
  return { exists: true, holder: existing.id, card: card && card.id, header: header && header.id };
}
const V = id => figma.variables.getVariableByIdAsync(id);
const P = async (vid, c = { r: .5, g: .5, b: .5 }) => figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: c }, 'color', await V(vid));
const styles = await figma.getLocalTextStylesAsync();
const S = n => styles.find(s => s.name === n).id;
for (const f of [{ family: 'Inter', style: 'Regular' }, { family: 'Inter', style: 'Medium' }, { family: 'Inter', style: 'Semi Bold' }, { family: 'Playfair Display', style: 'Medium' }]) await figma.loadFontAsync(f);
const C = { white: 'VariableID:24:344', text: 'VariableID:24:328', subtle: 'VariableID:24:329', subtlest: 'VariableID:24:330', brand: 'VariableID:24:334', brandBold: 'VariableID:24:335',
  warnText: 'VariableID:24:343', hover: 'VariableID:26:517', brandSubtle: 'VariableID:26:523', brandBg: 'VariableID:26:524', warnSubtle: 'VariableID:26:531', cream: 'VariableID:26:516',
  border: 'VariableID:26:537', borderSoft: 'VariableID:26:538' };
function box(parent, name, dir, gap) { const f = figma.createFrame(); if (parent) parent.appendChild(f); f.name = name; f.layoutMode = dir; f.itemSpacing = gap; f.fills = []; f.primaryAxisSizingMode = 'AUTO'; f.counterAxisSizingMode = 'AUTO'; return f; }
async function text(parent, chars, style, color) { const t = figma.createText(); parent.appendChild(t); await t.setTextStyleIdAsync(S(style)); t.characters = chars; t.fills = [await P(color)]; return t; }
function fill(n) { n.layoutSizingHorizontal = 'FILL'; if (n.type === 'TEXT') n.textAutoResize = 'HEIGHT'; }

const holder = figma.createFrame(); page.appendChild(holder); holder.name = 'Storyboard · Components';
holder.x = -2000; holder.y = 0; holder.layoutMode = 'VERTICAL'; holder.itemSpacing = 48; holder.paddingTop = holder.paddingBottom = holder.paddingLeft = holder.paddingRight = 40;
holder.primaryAxisSizingMode = 'AUTO'; holder.counterAxisSizingMode = 'AUTO'; holder.fills = [await P(C.hover)]; holder.cornerRadius = 24;
await text(holder, 'Storyboard · Components', 'Heading/2', C.brandBold);
await text(holder, 'Used by storyboard.py (SPROUT VIDEO/_Kit/sprout-talking-head). Edit instances, not these.', 'Paragraph/3', C.subtle);

// ---- SB / Card ------------------------------------------------------------------------------------------
const base = figma.createComponent(); holder.appendChild(base); base.name = 'Scene=Captions';
base.layoutMode = 'VERTICAL'; base.itemSpacing = 12; base.paddingTop = base.paddingBottom = base.paddingLeft = base.paddingRight = 16;
base.resize(360, 100); base.counterAxisSizingMode = 'FIXED'; base.primaryAxisSizingMode = 'AUTO'; base.cornerRadius = 16;
base.fills = [await P(C.white, { r: 1, g: 1, b: 1 })]; base.strokes = [await P(C.borderSoft)]; base.strokeWeight = 1;
const kId = base.addComponentProperty('Id', 'TEXT', 'L000');
const kTime = base.addComponentProperty('Time', 'TEXT', '0:00.0–0:02.4');
const kLine = base.addComponentProperty('Line', 'TEXT', 'The script line, word for word.');
const kStyled = base.addComponentProperty('Styled words', 'TEXT', '—');
const kPlan = base.addComponentProperty('Plan', 'TEXT', '—');
const kInk = base.addComponentProperty('Ink background', 'BOOLEAN', false);
const kPip = base.addComponentProperty('Speaker circle', 'BOOLEAN', false);
const kMerge = base.addComponentProperty('Merge with next', 'BOOLEAN', false);
const head = box(base, 'Head', 'HORIZONTAL', 8); fill(head); head.primaryAxisSizingMode = 'FIXED'; head.primaryAxisAlignItems = 'SPACE_BETWEEN'; head.counterAxisAlignItems = 'CENTER';
const idcol = box(head, 'Id and time', 'VERTICAL', 2);
(await text(idcol, 'L000', 'Subhead/2', C.text)).componentPropertyReferences = { characters: kId };
(await text(idcol, '0:00.0–0:02.4', 'Caption/3', C.subtlest)).componentPropertyReferences = { characters: kTime };
const chip = box(head, 'Scene chip', 'HORIZONTAL', 0); chip.paddingLeft = chip.paddingRight = 10; chip.paddingTop = chip.paddingBottom = 4; chip.cornerRadius = 999; chip.fills = [await P(C.hover)];
await text(chip, 'Captions', 'Caption/1', C.text);
const lineT = await text(base, 'The script line, word for word.', 'Paragraph/2', C.text); fill(lineT); lineT.componentPropertyReferences = { characters: kLine };
const div = figma.createRectangle(); base.appendChild(div); div.name = 'Divider'; div.resize(328, 1); div.fills = [await P(C.borderSoft)]; div.layoutSizingHorizontal = 'FILL';
for (const [label, key, style, color] of [['STYLED WORDS', kStyled, 'Subhead/2', C.brand], ['SCENE PLAN', kPlan, 'Paragraph/2', C.text]]) {
  const f = box(base, label === 'STYLED WORDS' ? 'Styled words' : 'Plan', 'VERTICAL', 4); fill(f);
  await text(f, label, 'Caption/2', C.subtlest);
  const v = await text(f, '—', style, color); fill(v); v.componentPropertyReferences = { characters: key };
}
const tags = box(base, 'Tags', 'HORIZONTAL', 6); fill(tags); tags.layoutWrap = 'WRAP'; tags.counterAxisSpacing = 6; tags.primaryAxisSizingMode = 'FIXED';
for (const [label, key] of [['Ink background', kInk], ['Speaker circle', kPip], ['Merge with next', kMerge]]) {
  const t = box(tags, label, 'HORIZONTAL', 0); t.paddingLeft = t.paddingRight = 8; t.paddingTop = t.paddingBottom = 3; t.cornerRadius = 999; t.fills = [await P(C.hover)];
  await text(t, label, 'Caption/1', C.subtle); t.componentPropertyReferences = { visible: key }; t.visible = false;
}
const variants = [base];
for (const [name, bg, fg] of [['Captions + UI', C.brandSubtle, C.brand], ['Half', C.warnSubtle, C.warnText], ['Full', C.brandBg, C.white]]) {
  const v = base.clone(); holder.appendChild(v); v.name = `Scene=${name}`;
  const ch = v.findOne(n => n.name === 'Scene chip'); ch.fills = [await P(bg)];
  const t = ch.findOne(n => n.type === 'TEXT'); t.characters = name; t.fills = [await P(fg)];
  variants.push(v);
}
const set = figma.combineAsVariants(variants, holder); set.name = 'SB / Card';
set.layoutMode = 'HORIZONTAL'; set.itemSpacing = 24; set.paddingTop = set.paddingBottom = set.paddingLeft = set.paddingRight = 24; set.primaryAxisSizingMode = 'AUTO'; set.counterAxisSizingMode = 'AUTO';
set.description = 'One script line of a talking-head edit. Scene, Styled words, Plan and the three switches are read back into plan.json by storyboard.py. Id, Time and Line are generated: do not edit.';

// ---- SB / Video Header -----------------------------------------------------------------------------------
const hd = figma.createComponent(); holder.appendChild(hd); hd.name = 'SB / Video Header';
hd.layoutMode = 'VERTICAL'; hd.itemSpacing = 16; hd.paddingTop = hd.paddingBottom = 28; hd.paddingLeft = hd.paddingRight = 32;
hd.resize(1680, 100); hd.counterAxisSizingMode = 'FIXED'; hd.primaryAxisSizingMode = 'AUTO'; hd.cornerRadius = 20; hd.fills = [await P(C.white, { r: 1, g: 1, b: 1 })];
const hTitle = hd.addComponentProperty('Title', 'TEXT', 'Video N · Name');
const hSub = hd.addComponentProperty('Subtitle', 'TEXT', 'project · 0.0 s · 0 lines');
const hSpeaker = hd.addComponentProperty('Speaker label', 'TEXT', '—');
const hZoom = hd.addComponentProperty('Opening zoom', 'TEXT', 'on');
const hPlate = hd.addComponentProperty('Emphasis plate', 'TEXT', 'sage');
const hCut = hd.addComponentProperty('Cutaway background', 'TEXT', 'paper');
const hNotes = hd.addComponentProperty('Notes', 'TEXT', '—');
const tt = box(hd, 'Title', 'VERTICAL', 4); fill(tt);
(await text(tt, 'Video N · Name', 'Heading/1', C.brandBold)).componentPropertyReferences = { characters: hTitle };
(await text(tt, 'project · 0.0 s · 0 lines', 'Paragraph/3', C.subtle)).componentPropertyReferences = { characters: hSub };
const fields = box(hd, 'Style', 'HORIZONTAL', 40);
for (const [label, key, hint] of [['SPEAKER LABEL', hSpeaker, 'name on the footage, — for none'], ['OPENING ZOOM', hZoom, 'on / off'], ['EMPHASIS PLATE', hPlate, 'sage / cream / ink'], ['CUTAWAY BACKGROUND', hCut, 'paper / ink']]) {
  const f = box(fields, label, 'VERTICAL', 4);
  await text(f, label, 'Caption/2', C.subtlest);
  (await text(f, 'value', 'Subhead/1', C.text)).componentPropertyReferences = { characters: key };
  await text(f, hint, 'Caption/3', C.subtlest);
}
const nf = box(hd, 'Notes', 'VERTICAL', 4); fill(nf);
await text(nf, 'NOTES FOR CLAUDE', 'Caption/2', C.subtlest);
const nv = await text(nf, '—', 'Paragraph/2', C.text); fill(nv); nv.componentPropertyReferences = { characters: hNotes };
hd.description = 'Video-level style for a talking-head storyboard, read back into plan.json.style and notes by storyboard.py.';
return { created: true, holder: holder.id, card: set.id, header: hd.id, variants: set.children.map(c => c.id + ' ' + c.name) };
