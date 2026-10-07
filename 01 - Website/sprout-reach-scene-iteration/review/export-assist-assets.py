#!/usr/bin/env python3
"""Rebuilds assets/assist/*.webp at 3x from the Figma source images.

The Figma MCP hands out each image fill's original file (1254 px for the 3D icons,
640 px+ for photos). This script only resamples them into the boxes the app draws,
so the hero stays sharp on retina screens instead of upscaling 1x crops.
Usage: python3 review/export-assist-assets.py <dir with the downloaded sources>
Source file names are listed in SOURCES below; node ids are in assets/SOURCES.md."""
import sys, os
from PIL import Image

SRC = sys.argv[1]
OUT = os.path.join(os.path.dirname(__file__), "..", "assets", "assist")
X = 3  # export scale

def load(name):
    return Image.open(os.path.join(SRC, name)).convert("RGBA")

def icon(src, box, inner, out):
    """A transparent icon of `inner` px centred in a `box` px tile (the tile colour is CSS)."""
    im = load(src).resize((inner * X, inner * X), Image.LANCZOS)
    c = Image.new("RGBA", (box * X, box * X), (0, 0, 0, 0))
    c.alpha_composite(im, ((box - inner) * X // 2, (box - inner) * X // 2))
    # the two big illustrations are lossy (alpha kept); small icons stay lossless
    opts = {"quality": 90} if box >= 100 else {"lossless": True}
    c.save(os.path.join(OUT, out + ".webp"), method=6, **opts)

def cover(src, w, h, out, q=86, x=X, align="center"):
    """object-fit: cover into w x h design px (align="bottom" = object-position bottom)."""
    im = load(src)
    r = max(w * x / im.width, h * x / im.height)
    im = im.resize((round(im.width * r), round(im.height * r)), Image.LANCZOS)
    l = (im.width - w * x) // 2
    t = im.height - h * x if align == "bottom" else (im.height - h * x) // 2
    im.crop((l, t, l + w * x, t + h * x)).save(os.path.join(OUT, out + ".webp"), quality=q, method=6)

# 3D icons (Figma section 12798:18362): box, drawn size
icon("src-clover.png", 100, 100, "clover")
icon("src-bell.png", 124, 124, "bell")
icon("src-ic-reminder.png", 42, 42, "ic-reminder")
icon("src-ic-carpool.png", 42, 36, "ic-carpool")
icon("src-ic-event.png", 42, 32, "ic-event")
icon("src-ic-birthday.png", 42, 36, "ic-birthday")
icon("src-ic-club.png", 42, 42, "ic-club")
icon("src-need-who.png", 42, 42, "need-who")
icon("src-need-what.png", 42, 42, "need-what")
icon("src-need-when.png", 42, 36, "need-when")
icon("img1.png", 40, 40, "bus")

# the static orb fallback: Figma crops its fill to 117.07% x 116.5% at -8.78%, -6.8%
o = load("src-orb.png").resize((round(48 * X * 1.1707), round(48 * X * 1.165)), Image.LANCZOS)
c = Image.new("RGBA", (48 * X, 48 * X), (0, 0, 0, 0))
c.paste(o, (round(-0.0878 * 48 * X), round(-0.068 * 48 * X)), o)
c.save(os.path.join(OUT, "orb.webp"), lossless=True, method=6)

# people and places (fictional stock photos)
cover("img56.png", 40, 60, "matt")          # portrait: the caption crops it at 50% 20%
cover("img58.png", 40, 40, "lydia")
cover("surf1.png", 84, 84, "inv-zilker")
for k, f in {"eitan": 4, "fatima": "", "joe": 1, "raj": 5, "robert": 2, "scott": 3}.items():
    cover(f"cc/01WX-imgProfilePlaceholder{f}.png", 32, 32, f"dm-{k}")   # sources are 96 px
cover("cc/01WX-imgProfilePicture3.png", 84, 84, "grp-bday")
cover("cc/01WX-imgSaasCo2.png", 80, 80, "grp-cdc", q=92)
cover("cc/01V6-imgSaasCo1.png", 80, 80, "grp-first-grade", q=92)
cover("cc/01V6-imgSaasCo1.png", 78, 78, "club-kiker", q=92)
cover("cc/01V6-imgSaasCo3.png", 78, 78, "club-cdc", q=92)
cover("cc/01V6-imgSaasCo5.png", 78, 78, "club-ssc", q=92)
cover("cc/01V6-imgSaasCo6.png", 78, 78, "club-creator", q=92)
for k, f in {"emily": 7, "jake": 1, "jessica": 6, "mike": 8, "sarah": 9}.items():
    cover(f"cc/01V6-imgProfilePicture{f}.png", 60, 60, f"mem-{k}")
# Events (Figma 12900:24890): 361 x 212 card photos at 2x (the sources are 1024 px wide),
# and the white Sprout clover inside the green Share dot (10 x 11, object-position bottom)
cover("src-storytime.png", 361, 212, "ev-storytime", q=80, x=2)
cover("src-nature.png", 361, 212, "ev-nature", q=80, x=2)
cover("src-splash.png", 361, 212, "ev-splash", q=80, x=2)
cover("src-share.png", 10, 11, "ev-share", q=92, x=4, align="bottom")
# Carpool flow (Figma 12815:89066): the big bus tile and the pickup-place icon
icon("img1.png", 124, 124, "bus-lg")
icon("src-need-where.png", 42, 42, "need-where")

# Live Activity, Carpool (Figma 11106:246080): the bus with the driver's avatar is
# drawn 124 x 80 from a fill cropped to 125.9% x 194.42% at -8.63%, -51.94%
def fill_crop(src, w, h, wp, hp, lp, tp, out, x=X):
    im = load(src).resize((round(w * x * wp), round(h * x * hp)), Image.LANCZOS)
    c = Image.new("RGBA", (w * x, h * x), (0, 0, 0, 0))
    c.paste(im, (round(w * x * lp), round(h * x * tp)), im)
    c.save(os.path.join(OUT, out + ".webp"), quality=90, method=6)
fill_crop("la-busav.png", 124, 80, 1.259, 1.9442, -0.0863, -0.5194, "la-busav")
icon("la-home.png", 24, 24, "la-home")
icon("la-school.png", 24, 24, "la-school")
# the bus on the route faces right in Figma (a mirrored fill)
b = load("la-bus.png").resize((30 * 4, 30 * 4), Image.LANCZOS).transpose(Image.FLIP_LEFT_RIGHT)
b.save(os.path.join(OUT, "la-bus.webp"), lossless=True, method=6)
# Event flow (Figma section 12798:18607) and the event page Emily sees (10258:174937)
icon("src-ic-event.png", 124, 124, "event-lg")
cover("cover151.png", 393, 381, "ev-cover", q=80, x=2)
cover("hero337.png", 393, 381, "ev-hero", q=80, x=2)
for src, out in (("kinder.png", "club-kinder"), ("first.png", "club-first"), ("fourth.png", "club-fourth")):
    cover(src, 64, 64, out, q=92)
# Birthday (Figma 12911:173634): the AI cover and the big listening tile
icon("src-ic-birthday.png", 124, 124, "bday-lg")
cover("bday337.png", 231, 224, "bday-cover", q=84)
# Sprout Assist story section: Club listening (Figma 12815:89162)
icon("src-ic-club.png", 124, 124, "club-lg")
icon("src-need-why.png", 42, 42, "need-why")
# Classes (Figma 8198:109904 and siblings): chat avatars at 3x, and the doodle wallpaper.
# The wallpaper is 788 vectors at 4% opacity (897 KB as SVG), so it ships as one image.
for k in ("floyd", "guy", "albert", "base"):
    cover(f"av-{k}.png", 40, 40, f"cls-{k}", q=88)
load("doodle.png").save(os.path.join(OUT, "cls-doodle.webp"), lossless=True, method=6)
print("ok")
