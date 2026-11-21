"""Three hero explorations, 20 Nov. Ahmad: keep Tony's hero (home-v2-hero-preview.html: the tilted Daily Brief phone with
the knit clover behind it), reject the clover-only variations, research real heroes and come back with three ideas.

Each page is Tony's hero unchanged plus ONE idea taken from the reference sites in research/ (screenshots by
tools/refs.mjs). Same headline, copy and page below.   python3 build.py   writes 1.html, 2.html, 3.html.
"""
from pathlib import Path

HERE = Path(__file__).resolve().parent
BASE = (HERE.parent / 'home-v2-hero-preview.html').read_text()
page = BASE.replace('="./', '="../').replace("url(./", "url(../")   # assets/ here links to ../assets for runtime paths
SLOT_END = '                      <span class="h-orb"></span>\n                    </div>\n                  </div>\n                </div>\n'
assert SLOT_END in page
A = '../assets/'
G = f'<img class="gm" src="{A}gmail.svg" alt="" />' if (HERE.parent / 'assets/gmail.svg').exists() else '<i class="ph-fill ph-envelope-simple gm"></i>'

SHARED = """
.hx { position: absolute; z-index: 2; display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 16px;
  background: rgb(255 255 255 / .92); box-shadow: 0 1px 0 rgb(30 62 43 / .06), 0 14px 30px -12px rgb(40 50 30 / .28);
  -webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px); text-align: left; font-family: var(--sans); }
.hx b { display: block; font: 600 13px/1.3 var(--sans); color: var(--ink); }
.hx small { display: block; font-size: 12px; line-height: 1.35; color: var(--text); }
.hx .av { width: 34px; height: 34px; border-radius: 50%; flex: none; background: center / cover var(--green-subtle); }
.hx .ic { width: 34px; height: 34px; border-radius: 10px; flex: none; display: grid; place-items: center; background: var(--green-subtle); color: var(--green); font-size: 18px; }
.hx .ic img, .hx .gm { width: 18px; height: 18px; }
.hx > div { min-width: 0; flex: 1; }
.hx .t { margin-left: auto; align-self: flex-start; font-size: 11px; color: var(--muted, #7d715e); white-space: nowrap; padding-left: 6px; }
@media (prefers-reduced-motion: no-preference) {
  .hx { opacity: 0; animation: hx-in .7s var(--ease, cubic-bezier(.22,1,.36,1)) forwards; }
}
@keyframes hx-in { from { opacity: 0; transform: translateY(14px) scale(.97); } to { opacity: 1; transform: none; } }
@media (max-width: 820px) { .hx { padding: 8px 10px; gap: 8px; border-radius: 14px; } .hx b { font-size: 12px; } .hx small { font-size: 11px; } .hx .av, .hx .ic { width: 28px; height: 28px; } }
"""

VARIANTS = {
  '1': dict(title='1 · Your morning, arriving', ref='Flighty', note="Flighty's hero puts the phone in the middle and real notifications around it (\"Mom landed in New York\"). Here: the morning Sprout actually sends, arriving one by one around the phone: a to-do from the teacher's email, a playdate invite, Dana ticking something off, the class chat.",
    stage=f'''
                <div class="hx n1"><span class="ic">{G}</span><div><b>Picture Day is Thursday</b><small>Added to your to-dos, from Miss Taylor’s email</small></div><span class="t">7:02</span></div>
                <div class="hx n2"><span class="av" style="background-image:url({A}assist/mem-sarah.webp)"></span><div><b>Sarah invited Maya to a playdate</b><small>Saturday, 2 to 4 PM · Brodie Park</small></div><span class="t">7:15</span></div>
                <div class="hx n3"><span class="av" style="background-image:url({A}v2/mom.webp)"></span><div><b>Dana checked off “Sign field trip form”</b><small>Family To-Do List</small></div><span class="t">7:31</span></div>
                <div class="hx n4"><span class="ic"><i class="ph-fill ph-chats-circle"></i></span><div><b>Miss Taylor’s class</b><small>3 parents are bringing snacks Friday</small></div><span class="t">7:40</span></div>
''',
    css=SHARED + """
.hx.n1 { top: 6%; left: -2%; animation-delay: .6s; } .hx.n2 { top: 30%; right: -4%; animation-delay: 1.3s; }
.hx.n3 { top: 56%; left: 0; animation-delay: 2s; } .hx.n4 { top: 76%; right: 2%; animation-delay: 2.7s; }
@media (min-width: 821px) {
  .hx { width: 290px; }
  .hx.n1 { top: 14%; left: 2%; } .hx.n2 { top: 33%; right: -2%; } .hx.n3 { top: 57%; left: 0; } .hx.n4 { top: 76%; right: 4%; }
}
@media (max-width: 820px) { .hx { width: min(66vw, 250px); } .hx.n3, .hx.n4 { display: none; } .hx.n1 { top: 4%; left: 0; } .hx.n2 { top: 22%; right: 0; } }
"""),
  '2': dict(title='2 · Both halves, two phones', ref='Bevel', note="Bevel shows the phone and the watch together, one product in two places. The headline promises two things (the parent community, and the Daily Brief), so the class chat phone stands behind the Daily Brief phone.",
    stage=f'''
                <div class="hero-device-slot back-slot" aria-hidden="true"><div class="hero-device back"><div class="hero-device-screen"><img src="{A}class-chat.png" width="393" height="852" alt="" style="display:block;width:100%;height:100%" /></div></div></div>
                <div class="hx tag1"><span class="ic"><i class="ph-fill ph-users-three"></i></span><div><b>Your class chats</b><small>Every class your kids are in</small></div></div>
                <div class="hx tag2"><span class="ic"><i class="ph-fill ph-sun"></i></span><div><b>Your Daily Brief</b><small>What today needs, every morning</small></div></div>
''',
    css=SHARED + """
.hero-stage-shot .back-slot { z-index: 0; }
.hero-stage-shot .hero-device-slot:not(.back-slot) { z-index: 1; }
.hero-device.back { transform: rotateZ(-9deg) !important; filter: saturate(.92); }
.hero-stage-shot .back-slot { top: 40px; left: 30%; width: min(58vw, 240px); }
.hero-stage-shot .hero-device-slot:not(.back-slot) { left: 62%; }
.hx.tag1 { top: 0; left: 0; animation-delay: .8s; } .hx.tag2 { top: 52%; right: -2%; animation-delay: 1.4s; }
@media (min-width: 821px) {
  .hero-stage-shot .back-slot { top: 47%; left: 34%; width: clamp(210px, calc(38svh - 50px), 300px); }
  .hero-stage-shot .hero-device-slot:not(.back-slot) { top: 52%; left: 64%; }
  .hx { width: 250px; } .hx.tag1 { top: 10%; left: 0; } .hx.tag2 { top: 78%; right: 0; }
}
@media (max-width: 820px) { .hx { width: min(56vw, 210px); } .hx.tag2 { top: 64%; } }
"""),
  '3': dict(title='3 · The class around the phone', ref='Partiful and Timeleft', note="Partiful and Timeleft lead with people and a message, not a feature list. Here the parents of one class sit around the phone, by face and by kid, with the kind of message the class chat is for. No stock photo.",
    stage=f'''
                <div class="hx p1"><span class="av" style="background-image:url({A}assist/mem-jessica.webp)"></span><div><b>Jessica · Robert’s mom</b><small>Anyone at Brodie Park after pickup?</small></div></div>
                <div class="hx p2"><span class="av" style="background-image:url({A}assist/dm-raj.webp)"></span><div><b>Raj · Anaya’s dad</b><small>We’re in. Anaya has been asking all week.</small></div></div>
                <div class="hx p3"><span class="av" style="background-image:url({A}assist/mem-mike.webp)"></span><div><b>Mike · Hawkins’ dad</b><small>I’ll bring the soccer ball.</small></div></div>
                <div class="faces" aria-hidden="true">{''.join(f'<i style="background-image:url({A}assist/{f}.webp)"></i>' for f in ['mem-sarah','dm-fatima','mem-emily','dm-joe','cls-albert','dm-eitan'])}<span>Miss Taylor’s class · 18 parents</span></div>
''',
    css=SHARED + """
.hx { max-width: 290px; }
.hx.p1 { top: 4%; left: -4%; animation-delay: .6s; } .hx.p2 { top: 24%; right: -6%; animation-delay: 1.4s; } .hx.p3 { top: 46%; left: -2%; animation-delay: 2.2s; }
.faces { position: absolute; z-index: 2; left: 50%; bottom: 6%; translate: -50% 0; display: flex; align-items: center; gap: 0; padding: 6px 12px 6px 8px;
  border-radius: 999px; background: rgb(255 255 255 / .92); box-shadow: 0 14px 30px -12px rgb(40 50 30 / .28); white-space: nowrap; font: 600 12px var(--sans); color: var(--ink); }
.faces i { width: 28px; height: 28px; border-radius: 50%; border: 2px solid #fff; margin-left: -8px; background: center / cover var(--green-subtle); }
.faces i:first-child { margin-left: 0; }
.faces span { margin-left: 8px; }
@media (min-width: 821px) {
  .hx.p1 { top: 12%; left: 0; } .hx.p2 { top: 34%; right: -4%; } .hx.p3 { top: 58%; left: 2%; }
  .faces { bottom: 9%; left: 54%; }
}
@media (max-width: 820px) { .hx { max-width: 230px; } .hx.p3 { display: none; } .faces { bottom: auto; top: 58%; } }
"""),
}

for k, v in VARIANTS.items():
    out = page.replace(SLOT_END, SLOT_END + v['stage'], 1)
    out = out.replace('<title>Sprout · Hero preview</title>', f"<title>Sprout hero {v['title']}</title>")
    out = out.replace('</style>\n    <script src="../sections-demo.js', f"/* Exploration {v['title']} (20 Nov, from {v['ref']}): {v['note']} */\n{v['css']}\n    </style>\n    <script src=\"../sections-demo.js", 1)
    assert v['css'][:40] in out and v['stage'].strip()[:20] in out, k
    (HERE / f'{k}.html').write_text(out)
print('built', ', '.join(f'{k}.html' for k in VARIANTS))
