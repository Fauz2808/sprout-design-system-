"""V.22 store sizes that are wider than the iPhone slide (25 Nov).
The six frameless 1290 x 2796 slides (exports/v22/_frameless/, from export-v22.mjs --frameless) are centred at full
height on the wider canvas; the sides are the same slide, blurred and slightly darker, so the photo runs edge to edge
(V.15 rule: never a solid band). The mounted app screens stay exactly where the slide put them.
    python3 "08 - Generated Screens/App Store/tools/compose-v22-wide.py"
Writes exports/v22/ipad-13/01..06.png (2064 x 2752) and exports/v22/google-play/phone/01..06.png (1080 x 1920), RGB."""
from pathlib import Path
from PIL import Image, ImageFilter, ImageEnhance

ROOT = Path(__file__).resolve().parents[1] / 'exports' / 'v22'
SRC = ROOT / '_frameless'
SIZES = {'ipad-13': (2064, 2752), 'google-play/phone': (1080, 1920)}

def compose(slide, W, H):
    k = max(W / slide.width, H / slide.height)
    bg = slide.resize((round(slide.width * k), round(slide.height * k)), Image.LANCZOS)
    bg = bg.crop(((bg.width - W) // 2, (bg.height - H) // 2, (bg.width - W) // 2 + W, (bg.height - H) // 2 + H))
    bg = bg.filter(ImageFilter.GaussianBlur(48))
    # photo slides get a slightly darker blur; the light opening slide (no photo) just continues its cream
    light = slide.convert('L').resize((1, 1)).getpixel((0, 0)) > 180
    if light: bg = Image.new('RGB', (W, H), slide.getpixel((4, 4)))   # no photo here: its own cream runs on
    else: bg = ImageEnhance.Brightness(bg).enhance(0.82)
    h = H; w = round(slide.width * H / slide.height)
    fg = slide.resize((w, h), Image.LANCZOS)
    # feather the fg's left and right edges into the blur
    mask = Image.new('L', (w, h), 255)
    f = max(24, w // 18)
    for x in range(f):
        a = round(255 * (x + 1) / f)
        for xx in (x, w - 1 - x):
            mask.paste(a, (xx, 0, xx + 1, h))
    bg.paste(fg, ((W - w) // 2, 0), mask)
    return bg.convert('RGB')

for folder, (W, H) in SIZES.items():
    out = ROOT / folder
    out.mkdir(parents=True, exist_ok=True)
    for i in range(1, 7):
        compose(Image.open(SRC / f'{i}.png').convert('RGB'), W, H).save(out / f'{i:02d}.png', optimize=True)
    print(folder, '->', out)
