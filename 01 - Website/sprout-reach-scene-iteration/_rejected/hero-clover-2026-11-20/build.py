"""Hero variations on the one Tony liked (20 Nov): the Daily Brief phone with the Sprout clover stretched behind it.

Each variation is home-v2-hero-preview.html with only the hero stage changed (same headline, copy, phone and page
below). Re-run after editing the base or a variation:  python3 build.py   (writes a.html .. e.html next to this file)
"""
from pathlib import Path

HERE = Path(__file__).resolve().parent
BASE = (HERE.parent / 'home-v2-hero-preview.html').read_text()

# the base lives one folder up: point every relative asset and script there
page = BASE.replace('="./', '="../').replace("url(./", "url(../")   # scripts that build image paths at runtime use ./assets: assets/ here is a link to ../assets
CLOVER_TAG = '<img class="hero-clover" src="../assets/assist/clover.webp" width="300" height="300" alt="" />'
assert CLOVER_TAG in page
K = '../assets/clover-knit-700.webp'   # the same knit clover at 408 x 451, so it stays sharp when stretched

# four copies of the clover, each clipped to one leaf around the point where the leaves meet (50% 42%)
LEAVES = ''.join(f'<img class="lf {q}" src="{K}" width="408" height="451" alt="" />' for q in ('tl', 'tr', 'bl', 'br'))
LEAF_CSS = """
.leaves { position: absolute; aspect-ratio: 408 / 451; }
.leaves .lf { position: absolute; inset: 0; width: 100%; height: 100%; max-width: none; transform-origin: 50% 42%;
  -webkit-mask-image: radial-gradient(circle at 50% 42%, transparent 0 9%, #000 24%); mask-image: radial-gradient(circle at 50% 42%, transparent 0 9%, #000 24%); }
.leaves .tl { clip-path: polygon(0 0, 50% 0, 50% 42%, 0 42%); }
.leaves .tr { clip-path: polygon(50% 0, 100% 0, 100% 42%, 50% 42%); }
.leaves .bl { clip-path: polygon(0 42%, 50% 42%, 50% 84%, 0 84%); }
.leaves .br { clip-path: polygon(50% 42%, 100% 42%, 100% 84%, 50% 84%); }
"""

VARIANTS = {
  'b': dict(title='B · Wings', note="The clover's four leaves pulled apart into wings behind the phone, so the phone is the body of the butterfly. The wings breathe slowly.",
    stage=f'<div class="leaves wings" aria-hidden="true">{LEAVES}</div>',
    css=LEAF_CSS + """
.hero-stage-shot .wings { top: 6%; left: 50%; width: clamp(260px, 78vw, 420px); translate: -50% 0; opacity: .16; mix-blend-mode: multiply; }
.wings .tl { transform: translate(-15%, -2%) rotate(-12deg) scale(1.12, 1); }
.wings .tr { transform: translate(15%, -2%) rotate(12deg) scale(1.12, 1); }
.wings .bl { transform: translate(-12%, 4%) rotate(9deg) scale(1.06, 1); }
.wings .br { transform: translate(12%, 4%) rotate(-9deg) scale(1.06, 1); }
@media (prefers-reduced-motion: no-preference) {
  .wings .tl, .wings .bl { animation: wing-l 7s ease-in-out infinite; }
  .wings .tr, .wings .br { animation: wing-r 7s ease-in-out infinite; }
}
@keyframes wing-l { 50% { translate: -2.5% 0; } }
@keyframes wing-r { 50% { translate: 2.5% 0; } }
@media (min-width: 821px) {
  .hero-stage-shot .wings { top: 50%; left: 54%; width: min(36vw, 520px); translate: -50% -50%; }
}
"""),
  'c': dict(title='C · Full colour', note='The same stretched clover in its real green, bigger and running off the edge of the page. The brand carries the first screen; the phone sits on top of it.',
    stage=f'<img class="hero-clover big" src="{K}" width="408" height="451" alt="" />',
    css="""
.hero-stage-shot .hero-clover.big { top: 12%; left: 56%; width: clamp(280px, 92vw, 500px); opacity: .95; mix-blend-mode: normal;
  transform: translateX(-50%) rotate(-22deg) scale(1.18, 1); filter: drop-shadow(0 30px 40px rgb(24 99 56 / .18)); }
.hero-device { box-shadow: inset 0 0 0 1px rgb(248 251 241 / .48), 18px 34px 60px rgb(20 50 30 / .35); }
@media (min-width: 821px) {
  .hero-sky.hero-preview { overflow: hidden; }
  .hero-stage-shot .hero-clover.big { top: 56%; left: 62%; width: min(50vw, 760px); transform: translate(-50%, -50%) rotate(-22deg) scale(1.18, 1); }
}
"""),
  'd': dict(title='D · Centered, wings full width', note='Headline on top and centered, the phone below it rising from the bottom edge, and the leaves spread across the whole width like open wings. Desktop takes the phone layout.',
    stage=f'<div class="leaves spread" aria-hidden="true">{LEAVES}</div>',
    css=LEAF_CSS + """
.hero-stage-shot .spread { top: 6%; left: 50%; width: clamp(260px, 80vw, 420px); translate: -50% 0; opacity: .14; mix-blend-mode: multiply; }
.spread .tl { transform: translate(-24%, -2%) rotate(-20deg) scale(1.25, 1); }
.spread .tr { transform: translate(24%, -2%) rotate(20deg) scale(1.25, 1); }
.spread .bl { transform: translate(-20%, 4%) rotate(14deg) scale(1.15, 1); }
.spread .br { transform: translate(20%, 4%) rotate(-14deg) scale(1.15, 1); }
@media (min-width: 821px) {
  .hero-sky.hero-preview { padding-top: 104px; text-align: center; background: radial-gradient(ellipse at 50% 92%, var(--sand), transparent 55%) var(--bg); overflow: hidden; }
  .hero-preview .hero-copy { grid-template: auto minmax(0, 1fr) / 1fr; align-items: start; }
  .hero-preview .hero-message { padding-bottom: 0; }
  .hero-preview .lede { margin: 18px auto 0; }
  .hero-preview .proof { justify-content: center; }
  .hero-preview .proof span { flex-basis: auto; }
  .hero-stage-shot .spread { top: 2%; left: 50%; width: min(40vw, 560px); translate: -50% 0; }
  .hero-device-slot { top: 28px; left: 50%; width: 330px; translate: -50% 0; }
}
"""),
  'e': dict(title='E · Leaves around the phone', note='The four leaves come apart and float around the phone in full colour, like the clover just opened. Smaller, lighter, a little playful.',
    stage=f'<div class="leaves float" aria-hidden="true">{LEAVES}</div>',
    css=LEAF_CSS + """
.hero-stage-shot .float { top: 18%; left: 50%; width: clamp(170px, 50vw, 240px); translate: -50% 0; filter: drop-shadow(0 14px 18px rgb(24 99 56 / .16)); }
.float .tl { transform: translate(-58%, -30%) rotate(-28deg) scale(.82); }
.float .tr { transform: translate(60%, -18%) rotate(22deg) scale(.7); }
.float .bl { transform: translate(-56%, 46%) rotate(18deg) scale(.66); }
.float .br { transform: translate(58%, 52%) rotate(-30deg) scale(.86); }
@media (prefers-reduced-motion: no-preference) {
  .float .lf { animation: leaf-drift 9s ease-in-out infinite; }
  .float .tr { animation-delay: -2s; } .float .bl { animation-delay: -4s; } .float .br { animation-delay: -6s; }
}
@keyframes leaf-drift { 50% { translate: 0 -10px; rotate: 4deg; } }
@media (min-width: 821px) {
  .hero-stage-shot .float { top: 50%; left: 54%; width: min(24vw, 330px); translate: -50% -50%; }
  .float .tl { transform: translate(-76%, -40%) rotate(-28deg) scale(.82); }
  .float .tr { transform: translate(78%, -26%) rotate(22deg) scale(.7); }
  .float .bl { transform: translate(-72%, 50%) rotate(18deg) scale(.66); }
  .float .br { transform: translate(76%, 54%) rotate(-30deg) scale(.86); }
}
"""),
}

for k, v in VARIANTS.items():
    out = page.replace(CLOVER_TAG, v['stage'])
    out = out.replace('<title>Sprout · Hero preview</title>', f"<title>Sprout hero {v['title']}</title>")
    out = out.replace('</style>\n    <script src="../sections-demo.js', f"/* {v['title']} (20 Nov): {v['note']} */\n{v['css']}\n    </style>\n    <script src=\"../sections-demo.js", 1)
    assert v['title'] in out and v['css'][:30] in out, k
    (HERE / f'{k}.html').write_text(out)
print('built', ', '.join(f'{k}.html' for k in VARIANTS))
