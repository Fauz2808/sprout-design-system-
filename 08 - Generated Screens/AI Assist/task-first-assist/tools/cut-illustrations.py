"""Cut the Assist tile illustrations out of their white backgrounds (Tony, 18 Nov: Uber-style services grid).

Source: Figma file HlWjGHq9JNgKSHXvI8RFeD "Sprout Assist · tile illustrations (18 Nov)", generated with
gpt-image-2.5 on #FFFFFF. Raw downloads live in research/illustrations-2026-11-18/raw/.

    python3 tools/cut-illustrations.py

Writes, per illustration:
  research/illustrations-2026-11-18/cut/<name>.png   1024 square, transparent, object trimmed and centred (handoff master)
  app/assets/illus/<name>.webp                       480 square, transparent (prototype)
"""
from pathlib import Path
from PIL import Image
from rembg import remove, new_session

HERE = Path(__file__).resolve().parent.parent
RAW = HERE / 'research/illustrations-2026-11-18/raw'
CUT = HERE / 'research/illustrations-2026-11-18/cut'
WEB = HERE / 'app/assets/illus'
CUT.mkdir(parents=True, exist_ok=True)
WEB.mkdir(parents=True, exist_ok=True)

session = new_session('u2net')  # isnet ate the light-green tent side; u2net keeps it
PAD = 0.06  # breathing room around the trimmed object, as a share of the square

for src in sorted(RAW.glob('*.png')):
    im = Image.open(src).convert('RGBA')
    out = remove(im, session=session, post_process_mask=True)
    # drop near-invisible fringe so the bbox trims tight
    a = out.getchannel('A').point(lambda v: 0 if v < 12 else v)
    out.putalpha(a)
    box = a.getbbox()
    obj = out.crop(box)
    side = int(max(obj.size) / (1 - 2 * PAD))
    sq = Image.new('RGBA', (side, side), (0, 0, 0, 0))
    sq.alpha_composite(obj, ((side - obj.width) // 2, (side - obj.height) // 2))
    sq.resize((1024, 1024), Image.LANCZOS).save(CUT / src.name, optimize=True)
    sq.resize((480, 480), Image.LANCZOS).save(WEB / (src.stem + '.webp'), 'WEBP', quality=90, method=6)
    print(f'{src.stem:12s} bbox={box} -> {side}px square')
