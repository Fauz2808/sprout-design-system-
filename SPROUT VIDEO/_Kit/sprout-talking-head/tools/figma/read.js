// Sprout talking-head kit · read one storyboard section back. Printed by `storyboard.py code <project> read`.
// Returns the JSON that `storyboard.py apply` merges into plan.json: the header's style fields and, per line in
// reading order, the card's scene, styled words, plan, switches, and whether its sketch frame has a drawing.
// Sketches are not exported here (base64 is heavy): fetch each listed sketch node with get_screenshot and save it
// as storyboard/sketches/<id>.png.
const sec = await figma.getNodeByIdAsync('__SECTION_ID__');
if (!sec) throw new Error('Storyboard section not found: was it deleted or regenerated? Update storyboard/figma.json');
let page = sec; while (page.type !== 'PAGE') page = page.parent;
await figma.setCurrentPageAsync(page);
const props = inst => { const o = {}; for (const [k, v] of Object.entries(inst.componentProperties)) o[k.split('#')[0]] = v.value; return o; };
const hd = sec.findOne(n => n.type === 'INSTANCE' && n.mainComponent && n.mainComponent.name === 'SB / Video Header');
if (!hd) throw new Error('No SB / Video Header in the section');
const h = props(hd);
const pairs = sec.children.filter(n => n.type === 'FRAME' && /^L(\d+|-.+)$/.test(n.name));
pairs.sort((a, b) => (a.y - b.y) || (a.x - b.x));
const cards = [], warnings = [];
for (const pair of pairs) {
  const card = pair.findOne(n => n.type === 'INSTANCE' && n.mainComponent && n.mainComponent.parent && n.mainComponent.parent.name === 'SB / Card');
  if (!card) { warnings.push(`${pair.name}: card missing`); continue; }
  const p = props(card);
  if (p['Id'] !== pair.name) warnings.push(`${pair.name}: card Id says ${p['Id']}; the frame name wins`);
  const sk = pair.findOne(n => n.name === `Sketch · ${pair.name}`);
  const drawn = sk ? sk.children.filter(c => c.name !== 'Hint' && c.visible) : [];
  cards.push({ id: pair.name, scene: p['Scene'], styled: p['Styled words'], plan: p['Plan'], ink: p['Ink background'], pip: p['Speaker circle'],
    merge: p['Merge with next'], sketch: drawn.length ? `storyboard/sketches/${pair.name}.png` : null, sketch_node: drawn.length ? sk.id : null });
}
return { section: sec.id, header: { speaker: h['Speaker label'], zoom: /^(on|yes|true)$/i.test((h['Opening zoom'] || '').trim()), plate: h['Emphasis plate'],
  cutaway: h['Cutaway background'], notes: h['Notes'] }, cards, warnings };
