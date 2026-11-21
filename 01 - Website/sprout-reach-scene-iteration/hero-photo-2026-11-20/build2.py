"""Version 2, refined (Ahmad, 20 Nov). Writes 2a.html (photo band under the phones, like 2.html) and 2b.html (photo as the
hero background, inset with a margin on every side). Shared: hero2.css, hero2.js, ../daily-brief.css + ../daily-brief.js (the current Daily Brief,
Figma Prod 16180:365329, coded) and the site's home-v2.css for the real top bar.   python3 build2.py
assets/ in this folder is a link to ../assets (home-v2.js builds image paths as ./assets/...)."""
from pathlib import Path
HERE = Path(__file__).resolve().parent

HEAD = '''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>{title}</title>
<meta name="robots" content="noindex,nofollow" />
<link rel="icon" href="../assets/logo.png" />
<link rel="preconnect" href="https://fonts.googleapis.com" /><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
<script src="https://unpkg.com/@phosphor-icons/web@2.1.1"></script>
<!-- {note} -->
<link rel="stylesheet" href="../home-v2.css?v=20261013-1" />
<link rel="stylesheet" href="../daily-brief.css" />
<link rel="stylesheet" href="hero2.css" />
<style>{css}</style>
<script src="../daily-brief.js" defer></script>
<script src="hero2.js" defer></script>
</head>
<body>
<header class="top over" id="top">
  <a class="logo" href="#" aria-label="Sprout home"><img src="../assets/logo.png" alt="" width="30" height="30" /><span>Sprout</span></a>
  <nav class="top-links" aria-label="Sections"><a href="#">Daily Brief</a><a href="#">Class chats</a><a href="#">Directory</a><a href="#">FAQ</a></nav>
  <a class="top-rp" href="https://roomparent.com" rel="noopener"><span class="lg">I’m a room parent</span><span class="sm">Room parent</span></a>
  <a class="top-cta" href="https://apps.apple.com/us/app/sprout-the-app-for-parents/id6739574052" data-join>Join your schools</a>
</header>
<main>
'''

STAGE = '''
      <div class="stage2">
        <div class="tilt2">
          <div class="dev" role="img" aria-label="Sprout Daily Brief: a to-do arrives from Miss Taylor’s email, Dana checks off soccer pickup, then the day scrolls by"><div class="scr"><span class="island"></span><div data-brief></div></div></div>
        </div>
        <div class="p p1"><span class="ic"><img src="../assets/gmail.svg" alt="" /></span><div>From your school email<small>Teachers’ emails become to-dos</small></div></div>
        <div class="p p2"><span class="av" style="background-image:url(../assets/brief/dana.webp)"></span><div>Shared with Dana<small>You both see who did what</small></div></div>
        <div class="p p3"><span class="ic"><i class="ph-fill ph-sun-horizon"></i></span><div>Every morning, in order<small>Today, the week, who’s turning 7</small></div></div>
      </div>'''

COPY = '''
      <div class="copy">
        <h1 id="h"><span>Your school’s</span><span><em>parent community.</em></span></h1>
        <p class="lede">Meet other school families and keep track of the day with your Daily Brief.</p>
        <a class="more" href="#">See your morning <i class="ph ph-arrow-down" aria-hidden="true"></i></a>
      </div>'''
PHOTO = '<div class="photo" data-photo role="img" aria-label="Parents from the same school with their kids on a picnic blanket in a park"></div>'

PAGES = {
  '2a': dict(title='Sprout hero 2a · Phones over the park',
    note='Version 2, refined (Ahmad, 20 Nov): the title on two lines, no proof lines, real coded screens, the photo as a band under the phones.',
    css='''
.hero2 { min-height: max(100svh, 720px); padding-top: clamp(92px, 11vh, 120px); background: radial-gradient(60% 40% at 50% 0%, #e7efe6, transparent 70%), var(--bg); }
.band { position: absolute; z-index: 1; left: 50%; bottom: 0; translate: -50% 0; width: calc(100% - 2 * clamp(16px, 4vw, 40px)); max-width: 1360px; height: 44%; border-radius: 36px 36px 0 0; overflow: hidden; }
.band .photo { position: absolute; inset: -4%; background: url(../assets/family-neighborhood.webp) 50% 40% / cover; transition: transform .8s var(--ease); }
.band::after { content: ""; position: absolute; inset: 0; background: linear-gradient(180deg, rgb(244 241 234 / .55), transparent 34%); }
@media (max-width: 820px) { .hero2 { min-height: 0; padding-top: 92px; } .band { height: 330px; width: calc(100% - 24px); border-radius: 26px 26px 0 0; } .stage2 { margin-bottom: -150px; } }
''',
    body=f'    <section class="hero2" data-hero aria-labelledby="h">{COPY}{STAGE}\n      <div class="band">{PHOTO}</div>\n    </section>'),
  '2b': dict(title='Sprout hero 2b · The park behind everything',
    note='Version 2, refined (Ahmad, 20 Nov): the same hero, but the photo is the background of the whole hero, inset with a margin on every side; the copy sits on it.',
    css='''
.hero2 { min-height: max(100svh, 720px); padding: 0; }
.inset { position: relative; margin: 76px clamp(12px, 2vw, 24px) clamp(12px, 2vw, 24px); min-height: calc(max(100svh, 720px) - 76px - clamp(12px, 2vw, 24px)); border-radius: clamp(24px, 2.6vw, 40px); overflow: hidden; padding-top: clamp(32px, 5vh, 60px); }
.inset .photo { position: absolute; inset: -4%; background: url(../assets/family-neighborhood.webp) 50% 38% / cover; transition: transform .8s var(--ease); }
.inset::before { content: ""; position: absolute; z-index: 2; inset: 0; pointer-events: none;
  background: linear-gradient(180deg, rgb(14 26 18 / .62) 0%, rgb(14 26 18 / .34) 34%, rgb(14 26 18 / .05) 62%, rgb(14 26 18 / .25) 100%); }
.hero2 h1 { color: #fff; } .hero2 h1 em { color: #cfe7d5; }
.hero2 .lede { color: rgb(255 255 255 / .9); }
.hero2 .more { background: #fff; color: var(--green); } .hero2 .more:hover { background: #e9f1ea; }
.inset .stage2 { margin-bottom: -16vh; }
@media (max-width: 820px) { .inset { margin: 66px 10px 10px; min-height: 0; padding-top: 36px; border-radius: 26px; } .inset .stage2 { margin-bottom: -120px; } }
''',
    body=f'    <section class="hero2" data-hero aria-labelledby="h">\n      <div class="inset">{PHOTO}{COPY}{STAGE}\n      </div>\n    </section>'),
}
for k, v in PAGES.items():
    html = HEAD.format(title=v['title'], note=v['note'], css=v['css']) + v['body'] + '\n</main>\n</body>\n</html>\n'
    (HERE / f'{k}.html').write_text(html)
print('built 2a.html, 2b.html')
