#!/usr/bin/env python3
"""Build the whole-app Sprout map (app/sprout-map.html) data from the design registries.

Three levels on one page: app map (entry points, onboarding, tabs, web), feature flows (feature row ->
flow sections -> screens, with handoffs between features) and shared surfaces (To-Do, Push, calendar...).

Inputs (read, never written, except the figma_snapshot block of the extra file):
  ~/Sprout/DESIGN-LABELS.md                                     review actions + status vocabulary
  ~/Sprout/out/design-labels-2026-11-15/structure-registry.json Prod rows -> sections -> screen ids
  ~/Sprout/out/design-labels-2026-11-15/screen-labels.csv       per-screen labels (the file DESIGN-LABELS links)
  ~/Sprout/out/design-labels-2026-11-15/label-map.json          flow titles + prototype candidates (cross-check)
  app/assist-map.html                                            Assist flows -> surface chips (so both pages agree)
  tools/sprout-map-extra.json                                    hand-kept: entry points, web, features, edges

Outputs:
  app/sprout-map-data.js    window.SPROUT_MAP = {...}
  tools/sprout-map.mmd      Mermaid flowchart of levels 1 + 2 (for a later FigJam copy)

Usage
  python3 tools/build-sprout-map.py                 # build (deterministic: same inputs, same bytes)
  python3 tools/build-sprout-map.py figma-script --metadata <get_metadata dump of 142:8499>
        prints a READ-ONLY use_figma script that returns the live text of every About card
        (get_metadata's text-layer names go stale when card text is edited, so don't trust them)
  python3 tools/build-sprout-map.py import-figma --metadata <dump> --about <script output .json> --read-date YYYY-MM-DD
        stores the Exploration structure, screen counts and About-card text in extra.figma_snapshot

Refresh after Figma changes: get_metadata(142:8499) -> figma-script -> run it in use_figma -> save the JSON ->
import-figma -> build. Prod structure and labels come from the registry files, so a Prod relabel needs no Figma read.
"""
from __future__ import annotations

import argparse
import csv
import json
import re
import sys
import xml.etree.ElementTree as ET
from collections import Counter, OrderedDict
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent                      # task-first-assist/
APP = ROOT / 'app'
SPROUT = Path.home() / 'Sprout'
EXTRA = HERE / 'sprout-map-extra.json'
OUT_JS = APP / 'sprout-map-data.js'
OUT_MMD = HERE / 'sprout-map.mmd'
LABELS_MD = SPROUT / 'DESIGN-LABELS.md'
REG_DIR = SPROUT / 'out' / 'design-labels-2026-11-15'

DESIGN = ['Unverified', 'In review', 'Approved']
HANDOFF = ['Not recorded', 'Drafted', 'Sent', 'Received']
RELEASE = ['Unverified', 'In development', 'Shipped']
SCREEN_W = (360, 440)
SCREEN_MIN_H = 600

WARN: list[str] = []


def warn(msg: str) -> None:
    WARN.append(msg)


def figma_url(node_id: str, key: str) -> str:
    return f'https://www.figma.com/design/{key}/?node-id={node_id.replace(":", "-")}'


# ---------------------------------------------------------------- Figma metadata (import step)

def load_metadata(path: Path) -> ET.Element:
    raw = json.loads(path.read_text())
    text = raw[0]['text'] if isinstance(raw, list) else raw
    return ET.fromstring('<root>' + text + '</root>')


def count_screens(node: ET.Element) -> int:
    """Phone-sized frames/instances (360-440 wide, >= 600 tall). Containers are walked, phones are not."""
    def is_screen(e):
        try:
            w, h = float(e.get('width', 0)), float(e.get('height', 0))
        except ValueError:
            return False
        return e.tag in ('frame', 'instance', 'component') and SCREEN_W[0] <= w <= SCREEN_W[1] and h >= SCREEN_MIN_H
    if is_screen(node):
        return 1
    n = 0
    for c in node:
        if is_screen(c):
            n += 1
        elif c.tag in ('section', 'group', 'frame') and len(c):
            n += count_screens(c)
    return n


def exploration_structure(root: ET.Element) -> dict:
    canvas = root[0]
    rows, loose = [], []
    for row in canvas:
        name = row.get('name') or ''
        if row.tag != 'section':
            loose.append({'id': row.get('id'), 'name': name, 'kind': row.tag, 'screens': count_screens(row)})
            continue
        if name.startswith('⓪'):
            continue
        abouts = {a.get('x'): a.get('id') for a in row if (a.get('name') or '').startswith('About')}
        items = []
        for it in row:
            n = it.get('name') or ''
            if it.tag == 'text' or n.startswith('About'):
                continue
            items.append({'id': it.get('id'), 'name': n, 'kind': it.tag, 'x': int(float(it.get('x', 0))),
                          'screens': count_screens(it), 'about_id': abouts.get(it.get('x'))})
        rows.append({'id': row.get('id'), 'name': name, 'items': items})
    return {'rows': rows, 'loose': loose}


def about_ids(struct: dict) -> list[str]:
    reg = json.loads((REG_DIR / 'structure-registry.json').read_text())
    ids = [s['about'] for s in reg['sections']]
    ids += [it['about_id'] for r in struct['rows'] for it in r['items'] if it['about_id']]
    return ids


FIGMA_SCRIPT = """// READ-ONLY. Returns the live text of each About card. Paste into use_figma, save the result as JSON.
const ids = %s;
const out = {};
for (const id of ids) {
  const n = await figma.getNodeByIdAsync(id);
  if (!n) { out[id] = null; continue; }
  const card = { pill: '', lines: [], what: '', status: '', open: '' };
  for (const k of n.children) {
    if (/pill/i.test(k.name)) { card.pill = k.findAll(x => x.type === 'TEXT').map(x => x.characters).join(' '); continue; }
    if (k.type === 'TEXT') { card.lines.push(k.characters); continue; }
    if (['What','Status','Open'].includes(k.name) && 'findAll' in k) {
      const ts = k.findAll(x => x.type === 'TEXT').map(x => x.characters);
      card[k.name.toLowerCase()] = ts.slice(1).join(' ');
    }
  }
  out[id] = card;
}
return out;"""


def cmd_figma_script(a):
    struct = exploration_structure(load_metadata(Path(a.metadata)))
    print(FIGMA_SCRIPT % json.dumps(about_ids(struct)))


def cmd_import(a):
    struct = exploration_structure(load_metadata(Path(a.metadata)))
    about = json.loads(Path(a.about).read_text())
    missing = [i for i in about_ids(struct) if not about.get(i)]
    if missing:
        print(f'About text missing for {len(missing)} cards: {missing[:6]}', file=sys.stderr)
    extra = json.loads(EXTRA.read_text(), object_pairs_hook=OrderedDict)
    extra['figma_snapshot'] = {
        'read_date': a.read_date,
        'how': 'get_metadata(142:8499) for structure and screen counts; About text read live with the figma-script (read-only use_figma).',
        'exploration': struct,
        'about': {k: about[k] for k in sorted(about) if about[k]},
    }
    EXTRA.write_text(json.dumps(extra, indent=2, ensure_ascii=False) + '\n')
    n = sum(len(r['items']) for r in struct['rows'])
    print(f'Imported {len(struct["rows"])} Exploration rows, {n} items, {len(struct["loose"])} loose, {len(extra["figma_snapshot"]["about"])} About cards')


# ---------------------------------------------------------------- status rules

NEG = re.compile(r'pending|not yet|no implementation approval|not ready|will review|not picked|open questions|'
                 r'no new approval|not a current|unverified for this', re.I)
APPROVED = re.compile(r'\bapproved\b', re.I)


def exploration_status(card: dict | None) -> dict:
    """Design / Handoff / Release for an Exploration item, from its About card's own words.
    Approved only when the Status line says 'approved' with nothing in it holding that back.
    The pill is shown verbatim; it is not itself treated as approval."""
    if not card:
        return {'design': 'Unverified', 'design_ev': 'No About card on the Exploration page.',
                'handoff': 'Not recorded', 'handoff_ev': '', 'release': 'Unverified', 'release_ev': '', 'role': 'Reference'}
    pill = (card.get('pill') or '').upper()
    st = card.get('status') or ''
    o = card.get('open') or ''
    sentences = [s.strip() for s in re.split(r'(?<=[.;])\s+', st) if s.strip()]
    appr = [s for s in sentences if APPROVED.search(s)]
    if appr and not NEG.search(st):
        design, ev = 'Approved', ' '.join(appr)
    elif appr or any(p in pill for p in ('NEW', 'REVISED', 'WAITING', 'REVIEW', 'READY FOR DEV', 'IN DEV')):
        design, ev = 'In review', st
    else:
        design, ev = 'Unverified', st or 'No status recorded.'
    hs = st + ' ' + o
    if re.search(r'handoff:\s*received|receipt confirmed', hs, re.I):
        handoff = 'Received'
    elif re.search(r'handoff:\s*sent', hs, re.I):
        handoff = 'Sent'
    elif re.search(r'handoff:\s*drafted|message drafted|drafted for', hs, re.I):
        handoff = 'Drafted'
    else:
        handoff = 'Not recorded'
    handoff_ev = next((s for s in re.split(r'(?<=[.])\s+', hs) if re.search(r'handoff|drafted|receipt', s, re.I)), '') if handoff != 'Not recorded' else ''
    if 'SHIPPED' in pill or 'IN DEV' in pill:
        release, rev = 'In development', f'Pill reads "{card.get("pill")}". No build identifier is recorded, so it is not marked Shipped.'
    else:
        release, rev = 'Unverified', ''
    role = 'Reference' if pill.startswith('REFERENCE') else 'Source'
    return {'design': design, 'design_ev': ev, 'handoff': handoff, 'handoff_ev': handoff_ev,
            'release': release, 'release_ev': rev, 'role': role}


def prod_status(rows: list[dict]) -> dict:
    """Prod section status from its screens' labels. Design is Unverified when every screen says so.
    A dated selection by Ahmad is In review: the Prod cards record Tony's approval as unverified."""
    texts = sorted({r['design_approval'] for r in rows})
    if all(t == 'Unverified' for t in texts):
        design = 'Unverified'
    else:
        design = 'In review'
    impl = sorted({r['implementation'] for r in rows})
    return {'design': design, 'design_ev': ' | '.join(texts), 'handoff': 'Not recorded',
            'handoff_ev': 'The Prod registry has no handoff field.', 'release': 'Unverified',
            'release_ev': ' | '.join(impl)}


# ---------------------------------------------------------------- assist-map parse

def parse_assist_map(path: Path) -> dict:
    src = path.read_text()
    surf_block = re.search(r'const SURF = \[(.*?)\n\];', src, re.S)
    flow_block = re.search(r'const FLOWS = \[(.*?)\n\];', src, re.S)
    if not surf_block or not flow_block:
        warn('assist-map.html: SURF or FLOWS block not found; Assist surface edges skipped.')
        return {'chips': {}, 'flows': []}
    chips, cur = {}, None
    for line in surf_block.group(1).splitlines():
        m = re.search(r"\{ id:'([\w-]+)', t:'([^']*)'", line)
        if m:
            cur = m.group(1)
        for c in re.finditer(r"\['([\w-]+)','([^']*)','(built|designed|gap)'", line):
            chips[c.group(1)] = {'id': c.group(1), 't': c.group(2), 'st': c.group(3), 'surf': cur}
    flows = []
    for m in re.finditer(r"\{ id:'([\w-]+)', t:'([^']*)', icon:'([\w-]+)', touch:\[([^\]]*)\]", flow_block.group(1)):
        touch = re.findall(r"'([\w-]+)'", m.group(4))
        flows.append({'id': m.group(1), 't': m.group(2), 'icon': m.group(3), 'touch': touch})
    unknown = [t for f in flows for t in f['touch'] if t not in chips]
    if unknown:
        warn(f'assist-map.html: flows touch unknown chips {unknown}')
    return {'chips': chips, 'flows': flows}


# ---------------------------------------------------------------- build

def rel_exists(p: str) -> bool:
    return (SPROUT / p).exists()


def proto_node(path: str) -> dict:
    name = Path(path).name if Path(path).name != 'index.html' else Path(path).parent.name + '/'
    folder = Path(path).parts[1] if path.startswith('08 - ') else Path(path).parts[0]
    return {'id': 'h:' + path, 'kind': 'proto', 'label': name, 'sub': folder, 'source': 'HTML prototype',
            'path': path, 'design': 'Unverified', 'design_ev': 'HTML prototypes carry no recorded approval of their own.',
            'handoff': 'Not recorded', 'handoff_ev': '', 'release': 'Unverified', 'release_ev': ''}


def cmd_build(_a):
    extra = json.loads(EXTRA.read_text())
    key = extra['figma']['file_key']
    reg = json.loads((REG_DIR / 'structure-registry.json').read_text())
    lmap = json.loads((REG_DIR / 'label-map.json').read_text())
    labels_md = LABELS_MD.read_text()

    # which label CSV is current: the one DESIGN-LABELS.md links as "Old-to-new screen names"
    m = re.search(r'\[Old-to-new screen names\]\(([^)]+)\)', labels_md)
    csv_path = Path(m.group(1)) if m else REG_DIR / 'screen-labels.csv'
    rows = list(csv.DictReader(csv_path.open()))
    by_node = {r['id']: r for r in rows}
    snapshot_date = max(r['reviewed'] for r in rows if r['page_id'] == reg['page_id'])
    before = sorted(str(p.relative_to(SPROUT)) for p in (SPROUT / 'out').glob('*/*.csv')
                    if p != csv_path and 'screen_id' in p.open().readline())

    # data conflicts, computed
    conflicts = []
    lm = {s['id']: s for s in lmap['screens']}
    diff_fields = Counter()
    for r in rows:
        s = lm.get(r['id'])
        if not s:
            diff_fields['missing in label-map.json'] += 1
            continue
        for f, v in r.items():
            if f != 'old_name' and (s.get(f) or '') != (v or ''):
                diff_fields[f] += 1
    for f, n in sorted(diff_fields.items()):
        conflicts.append(f'screen-labels.csv and label-map.json disagree on "{f}" for {n} screens. The CSV is used.')
    defined = set(re.findall(r'^\| ([A-Z][A-Z ]+[A-Z]) \|', labels_md, re.M)) - {'Label', 'Field'}
    used = Counter(r['review_action'] for r in rows if r['page_id'] == reg['page_id'])
    for ra in sorted(set(used) - defined):
        conflicts.append(f'Review action "{ra}" is used on {used[ra]} Prod screens but is not defined in DESIGN-LABELS.md.')
    flows_by_code = {f['code']: f for f in lmap['flows']}

    snap = extra.get('figma_snapshot') or {}
    about = snap.get('about', {})
    if not snap:
        warn('No figma_snapshot in sprout-map-extra.json: Exploration rows missing. Run import-figma.')

    nodes: dict[str, dict] = OrderedDict()

    # Prod sections
    sec_row = {g['key']: r for r in reg['rows'] for g in r['groups']}
    prod_screens = 0
    for s in reg['sections']:
        srows = [by_node[i] for i in s['screen_ids'] if i in by_node]
        if len(srows) != s['screenCount']:
            warn(f'{s["key"]}: registry says {s["screenCount"]} screens, CSV has {len(srows)}')
        prod_screens += s['screenCount']
        codes = sorted({r['flow_id'] for r in srows})
        card = about.get(s['about'])
        st = prod_status(srows)
        fl = [flows_by_code[c] for c in codes if c in flows_by_code]
        lmra = sorted({f.get('review_action') for f in fl if f.get('review_action') and f.get('review_action') != 'MIXED'})
        sra = Counter(r['review_action'] for r in srows)
        if lmra and set(lmra) != set(sra):
            conflicts.append(f'{s["key"]}: flow-level review action in label-map.json is {", ".join(lmra)}; '
                             f'its screens say {", ".join(sorted(sra))}.')
        protos = sorted({f['candidate_file'] for f in fl if f.get('candidate_file') and rel_exists(f['candidate_file'])})
        label = (card or {}).get('lines', [None])[0] or (fl[0]['title'] if fl else s['key'])
        row = sec_row[s['key']]
        nodes['p:' + s['key']] = {
            'id': 'p:' + s['key'], 'kind': 'section', 'source': 'Prod', 'label': label,
            'sub': f'{row["name"]} · {s["key"].split("/")[1]}', 'row_id': row['id'], 'screens': s['screenCount'],
            'codes': codes, 'review': dict(sorted(sra.items())), 'pill': (card or {}).get('pill', ''),
            'what': (card or {}).get('what') or (fl[0].get('journey', '') if fl else ''),
            'status_text': (card or {}).get('status', ''), 'open_text': (card or {}).get('open') or (fl[0].get('next_action', '') if fl else ''),
            'figma': s['id'], 'url': figma_url(s['id'], key), 'protos': protos,
            'screen_ids': [by_node[i]['screen_id'] for i in s['screen_ids'] if i in by_node], **st}

    # Exploration items
    ex_rows = (snap.get('exploration') or {}).get('rows', [])
    ex_loose = (snap.get('exploration') or {}).get('loose', [])
    ex_count = {'rows': len(ex_rows), 'items': 0, 'sections': 0, 'screens': 0}
    for r in ex_rows + [{'name': 'Page level (outside the rows)', 'items': ex_loose, 'id': extra['figma']['exploration_page']}]:
        for it in r['items']:
            card = about.get(it.get('about_id') or '')
            st = exploration_status(card)
            ex_count['items'] += 1
            ex_count['sections'] += it['kind'] == 'section'
            ex_count['screens'] += it['screens']
            lines = (card or {}).get('lines', [])
            nodes['x:' + it['id']] = {
                'id': 'x:' + it['id'], 'kind': 'section' if it['kind'] == 'section' else 'frame', 'source': 'Exploration',
                'label': lines[0] if lines else re.sub(r'\s*\|.*$', '', it['name']),
                'sub': f'{r["name"]}' + (f' · {lines[1]}' if len(lines) > 1 else ''), 'screens': it['screens'],
                'figma_name': it['name'], 'row_id': r['id'], 'pill': (card or {}).get('pill', ''), 'what': (card or {}).get('what', ''),
                'status_text': (card or {}).get('status', ''), 'open_text': (card or {}).get('open', ''),
                'figma': it['id'], 'url': figma_url(it['id'], key), **st}

    # Assist map
    am = parse_assist_map(APP / 'assist-map.html')
    am_flows = {f['id']: f for f in am['flows']}
    surf_by_assist = {a: s['id'] for s in extra['surfaces'] for a in s.get('assist', [])}

    # features
    features, used_prod, used_ex = [], Counter(), Counter()
    feat_surface_edges, feat_handoffs = [], []
    base = extra['assist_routes_base']
    for f in extra['features']:
        items = []
        for k in f.get('prod', []):
            if 'p:' + k not in nodes:
                warn(f'feature {f["id"]}: unknown Prod section {k}')
                continue
            used_prod[k] += 1
            items.append('p:' + k)
        for x in f.get('expl', []):
            if 'x:' + x not in nodes:
                warn(f'feature {f["id"]}: Exploration node {x} not in the snapshot')
                continue
            used_ex[x] += 1
            items.append('x:' + x)
        for p in f.get('protos', []):
            if not rel_exists(p):
                warn(f'feature {f["id"]}: prototype not found: {p}')
                continue
            nodes.setdefault('h:' + p, proto_node(p))
            items.append('h:' + p)
        for rt in f.get('routes', []):
            rid = 'r:' + rt
            nodes.setdefault(rid, {'id': rid, 'kind': 'route', 'label': rt, 'sub': 'sprout-assist-tasks.vercel.app',
                                   'source': 'HTML prototype', 'url': base + rt, 'design': 'Unverified',
                                   'design_ev': 'Review-only prototype route.', 'handoff': 'Not recorded', 'handoff_ev': '',
                                   'release': 'Unverified', 'release_ev': ''})
            items.append(rid)
        aflows = []
        for af in f.get('assist_flows', []):
            fl = am_flows.get(af)
            if not fl:
                warn(f'feature {f["id"]}: assist-map flow {af} not found')
                continue
            aflows.append({'id': af, 't': fl['t'], 'icon': fl['icon']})
        # surface edges: hand-kept + derived from assist-map
        edges = [dict(e, src='extra') for e in f.get('surfaces', [])]
        if aflows:
            by_s: dict[str, list] = OrderedDict()
            for af in aflows:
                for cid in am_flows[af['id']]['touch']:
                    c = am['chips'].get(cid)
                    if c:
                        by_s.setdefault(c['surf'], [])
                        if c not in by_s[c['surf']]:
                            by_s[c['surf']].append(c)
            for asurf, cs in by_s.items():
                sts = {c['st'] for c in cs}
                st = 'built' if 'built' in sts else 'designed' if 'designed' in sts else 'gap'
                chips = [{'t': c['t'], 'st': c['st']} for c in cs]
                if asurf in surf_by_assist:
                    edges.append({'s': surf_by_assist[asurf], 't': '; '.join(c['t'] for c in cs), 'st': st,
                                  'ev': 'From assist-map.html', 'chips': chips, 'src': 'assist-map'})
                elif asurf == 'db':
                    feat_handoffs.append({'from': f['id'], 'to': extra['assist_db_feature'],
                                          'label': 'Daily Brief: ' + '; '.join(c['t'] for c in cs), 'st': st,
                                          'ev': 'From assist-map.html', 'chips': chips})
        for e in edges:
            feat_surface_edges.append({'from': f['id'], 'to': e['s'], 'label': e['t'], 'st': e['st'],
                                       'ev': e.get('ev', ''), 'chips': e.get('chips', []), 'src': e['src']})
        features.append({'id': f['id'], 'label': f['label'], 'area': f['area'], 'icon': f.get('icon', 'event'),
                         'items': items, 'assist_flows': aflows, 'open': f.get('open', ''), 'what': f.get('what', '')})
    for k in [s['key'] for s in reg['sections']]:
        if used_prod[k] != 1:
            warn(f'Prod section {k} is in {used_prod[k]} features (expected exactly 1)')
    unassigned = [n for n in nodes if n.startswith('x:') and used_ex[n[2:]] == 0]
    if unassigned:
        warn(f'{len(unassigned)} Exploration items are in no feature; shown under "Unassigned".')
        features.append({'id': 'unassigned', 'label': 'Unassigned Exploration work', 'area': 'Elsewhere', 'icon': 'tutoring',
                         'items': unassigned, 'assist_flows': [], 'open': 'New on the Exploration page since the feature list was last updated. Add each to a feature in sprout-map-extra.json.', 'what': ''})
    for x, n in used_ex.items():
        if n > 1:
            warn(f'Exploration {x} is in {n} features')
    fids = {f['id'] for f in features}
    for h in extra['handoffs']:
        if h['from'] not in fids or h['to'] not in fids:
            warn(f'handoff {h["from"]} -> {h["to"]}: unknown feature')
    handoffs = [dict(h, chips=[]) for h in extra['handoffs']] + feat_handoffs

    # level 1
    def refs(o):
        r = ['p:' + k for k in o.get('prod', []) if 'p:' + k in nodes] + ['x:' + x for x in o.get('expl', []) if 'x:' + x in nodes]
        for p in o.get('protos', []):
            if rel_exists(p):
                nodes.setdefault('h:' + p, proto_node(p))
                r.append('h:' + p)
            else:
                warn(f'{o["id"]}: prototype not found: {p}')
        return r

    level1 = {'entries': [], 'onboarding': [], 'tabs': [], 'app_other': [], 'web': []}
    for grp, kind in [('entries', 'entry'), ('onboarding', 'step'), ('tabs', 'tab'), ('app_other', 'place'), ('web', 'web')]:
        for o in extra[grp]:
            n = {'id': o['id'], 'kind': kind, 'label': o['label'], 'sub': o.get('sub', ''), 'what': o.get('what', ''),
                 'open': o.get('open', ''), 'refs': refs(o), 'to': o.get('to', []), 'features': o.get('features', []),
                 'branch': o.get('branch', False)}
            if kind in ('entry', 'web'):
                n['source'] = o['source']
            if kind == 'web':
                for f in ('url', 'spec', 'release_note'):
                    if o.get(f):
                        n[f] = o[f]
                if o.get('path'):
                    if rel_exists(o['path']):
                        n['path'] = o['path']
                    else:
                        warn(f'{o["id"]}: path not found {o["path"]}')
                if o.get('version_from') and rel_exists(o['version_from']):
                    mv = re.search(r'name="prototype-version" content="([^"]+)"', (SPROUT / o['version_from']).read_text())
                    if mv:
                        n['version'] = mv.group(1)
                n.update({'design': 'Unverified', 'design_ev': o.get('design_ev', 'No recorded approval for this page as a whole.'),
                          'handoff': o.get('handoff', 'Not recorded'), 'handoff_ev': o.get('handoff_ev', ''),
                          'release': o.get('release', 'Unverified'), 'release_ev': o.get('release_note', '')})
            level1[grp].append(n)
    nav = {'refs': refs({'id': 'nav', **extra['nav']}), 'component': extra['nav']['component'],
           'url': figma_url(extra['nav']['component'], key)}

    for n in nodes.values():
        for f in ('design', 'handoff', 'release'):
            assert n[f] in {'design': DESIGN, 'handoff': HANDOFF, 'release': RELEASE}[f], (n['id'], f, n[f])

    # counts
    protos = sorted(k for k in nodes if k.startswith('h:'))
    routes = sorted(k for k in nodes if k.startswith('r:'))
    opens = [('level1', o['id'], o['label'], o['open']) for g in level1.values() for o in g if o['open']]
    opens += [('feature', f['id'], f['label'], f['open']) for f in features if f['open']]
    opens += [('surface', s['id'], s['t'], s['open']) for s in extra['surfaces'] if s.get('open')]
    counts = {
        'prod': {'rows': len(reg['rows']), 'sections': len(reg['sections']), 'screens': prod_screens,
                 'csv_prod_screens': sum(1 for r in rows if r['page_id'] == reg['page_id']),
                 'registry_screen_count': reg['screen_count'], 'registry_section_count': reg['flow_section_count']},
        'exploration': ex_count, 'protos': len(protos), 'routes': len(routes),
        'web': len(level1['web']), 'features': len(features), 'open': len(opens),
    }
    if not (counts['prod']['screens'] == counts['prod']['csv_prod_screens'] == reg['screen_count']):
        warn(f'Prod screen counts disagree: {counts["prod"]}')

    data = {
        'meta': {
            'title': 'Sprout whole-app map',
            'labels_csv': str(csv_path.relative_to(SPROUT)), 'labels_date': snapshot_date,
            'registry': str((REG_DIR / 'structure-registry.json').relative_to(SPROUT)), 'registry_date': reg['updated'],
            'figma_read': snap.get('read_date', ''), 'figma_how': snap.get('how', ''),
            'other_label_snapshots': before, 'file_key': key,
            'exploration_url': figma_url(extra['figma']['exploration_page'], key),
            'prod_url': figma_url(extra['figma']['prod_guide'], key),
            'onboarding_note': extra.get('onboarding_note', ''),
            'rules': {
                'design': 'Prod: Unverified when every screen label says Unverified; In review when a dated selection by Ahmad is recorded (the Prod About cards record Tony design approval as unverified). Exploration: Approved only when the About card Status line itself says approved with nothing holding it back; otherwise In review for NEW / REVISED / WAITING / READY FOR DEV / IN DEV pills, else Unverified. A pill, a page name or a green label is never read as approval.',
                'handoff': 'Only from an explicit handoff line (Handoff: drafted / sent / received) or a dated release reference. The Prod registry has no handoff field, so Prod is Not recorded.',
                'release': 'Shipped needs an engineering build identifier; none is recorded anywhere here. An IN DEV / SHIPPED pill is shown as In development.'},
        },
        'counts': counts, 'conflicts': conflicts, 'warnings': WARN,
        'nodes': nodes, 'level1': level1, 'nav': nav, 'web_edges': extra['web_edges'],
        'features': features, 'handoffs': handoffs, 'surfaces': extra['surfaces'], 'surface_edges': feat_surface_edges,
        'open_questions': [{'where': w, 'id': i, 'label': l, 'q': q} for w, i, l, q in opens],
    }
    OUT_JS.write_text('/* Generated by tools/build-sprout-map.py. Do not edit; edit the sources or tools/sprout-map-extra.json. */\n'
                      'window.SPROUT_MAP = ' + json.dumps(data, ensure_ascii=False, indent=1) + ';\n')
    OUT_MMD.write_text(mermaid(data))
    c = counts
    print(f'Prod {c["prod"]["rows"]} rows / {c["prod"]["sections"]} sections / {c["prod"]["screens"]} screens · '
          f'Exploration {c["exploration"]["rows"]} rows / {c["exploration"]["items"]} items ({c["exploration"]["sections"]} sections) / '
          f'{c["exploration"]["screens"]} screens · {c["protos"]} prototypes · {c["routes"]} routes · {c["web"]} web · '
          f'{c["features"]} features · {c["open"]} open questions')
    print(f'Labels: {data["meta"]["labels_csv"]} ({snapshot_date}) · Figma read {data["meta"]["figma_read"]}')
    for x in conflicts:
        print('CONFLICT', x)
    for w in WARN:
        print('WARN', w)
    print(f'Wrote {OUT_JS.relative_to(ROOT)} and {OUT_MMD.relative_to(ROOT)}')


# ---------------------------------------------------------------- mermaid

def mid(s: str) -> str:
    return re.sub(r'[^A-Za-z0-9]', '_', s)


def mlabel(s: str) -> str:
    """Quoted Mermaid label; Mermaid's own entity codes, not HTML ones."""
    return '"' + s.replace('"', '#quot;').replace('<', '#lt;').replace('>', '#gt;') + '"'


def mermaid(d: dict) -> str:
    L = ['%% Generated by tools/build-sprout-map.py. Levels 1 (app map) and 2 (feature flows).',
         f'%% Labels {d["meta"]["labels_date"]} · Figma read {d["meta"]["figma_read"]}', 'flowchart LR']
    l1 = d['level1']
    L.append('  subgraph Entry["Entry points"]\n    direction TB')
    L += [f'    {mid(o["id"])}[{mlabel(o["label"])}]' for o in l1['entries']]
    L.append('  end\n  subgraph Onboarding["Onboarding"]\n    direction TB')
    L += [f'    {mid(o["id"])}[{mlabel(o["label"])}]' for o in l1['onboarding']]
    main = [o for o in l1['onboarding'] if not o['branch']]
    L += [f'    {mid(a["id"])} --> {mid(b["id"])}' for a, b in zip(main, main[1:])]
    L.append('  end\n  subgraph Tabs["Tabs (docked navigation)"]\n    direction TB')
    L += [f'    {mid(o["id"])}[{mlabel(o["label"])}]' for o in l1['tabs']]
    L.append('  end\n  subgraph Around["Around the tabs"]\n    direction TB')
    L += [f'    {mid(o["id"])}[{mlabel(o["label"])}]' for o in l1['app_other']]
    L.append('  end\n  subgraph Web["Web"]\n    direction TB')
    L += [f'    {mid(o["id"])}[{mlabel(o["label"])}]' for o in l1['web']]
    L.append('  end')
    for o in l1['entries']:
        L += [f'  {mid(o["id"])} --> {mid(t)}' for t in o['to']]
    if main:
        L.append(f'  {mid(main[-1]["id"])} --> t_brief')
    L += [f'  {mid(e["from"])} -.->|{mlabel(e["label"])}| {mid(e["to"])}' for e in d['web_edges']]
    nodes = d['nodes']
    for f in d['features']:
        L.append(f'  subgraph F_{mid(f["id"])}[{mlabel(f["label"])}]\n    direction LR')
        for i in f['items']:
            n = nodes[i]
            if n['source'] == 'HTML prototype':
                continue
            sc = f' ({n["screens"]})' if n.get('screens') else ''
            L.append(f'    {mid(i)}[{mlabel(n["source"] + ": " + n["label"] + sc)}]')
        L.append('  end')
    for o in l1['tabs'] + l1['app_other']:
        L += [f'  {mid(o["id"])} --> F_{mid(fid)}' for fid in o['features']]
    L += [f'  F_{mid(h["from"])} ==>|{mlabel(h["label"][:60].rstrip(' ;,'))}| F_{mid(h["to"])}' for h in d['handoffs']]
    return '\n'.join(L) + '\n'


def main():
    ap = argparse.ArgumentParser()
    sub = ap.add_subparsers(dest='cmd')
    sub.add_parser('build')
    s1 = sub.add_parser('figma-script')
    s1.add_argument('--metadata', required=True)
    s2 = sub.add_parser('import-figma')
    s2.add_argument('--metadata', required=True)
    s2.add_argument('--about', required=True)
    s2.add_argument('--read-date', required=True)
    a = ap.parse_args()
    {'figma-script': cmd_figma_script, 'import-figma': cmd_import}.get(a.cmd, cmd_build)(a)


if __name__ == '__main__':
    main()
