#!/usr/bin/env python3
"""QR codes for the "Join your schools" pop-up on desktop (Tony, 9 Oct: iOS on the left, Android on the right).

Reads the two store links from the page itself (the App Store href on the top-bar button in home-v2.html, the Google
Play link in home-v2.js), so a QR can never point somewhere the buttons don't. Error correction H, so the Sprout logo
the pop-up lays over the centre (under 10% of the area) doesn't stop it scanning.
Usage: python3 review/make-qr.py   (writes assets/qr/app-store.svg and assets/qr/google-play.svg)
"""
import re
from pathlib import Path
import qrcode

here = Path(__file__).resolve().parent.parent
ios = re.search(r'class="top-cta" href="([^"]+)"', (here / "home-v2.html").read_text()).group(1)
android = re.search(r'"(https://play\.google\.com/store/apps/details\?id=[^"]+)"', (here / "home-v2.js").read_text()).group(1)
out = here / "assets/qr"
out.mkdir(exist_ok=True)
for name, url in [("app-store", ios), ("google-play", android)]:
    qr = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_H, border=0)
    qr.add_data(url)
    qr.make(fit=True)
    m = qr.get_matrix()
    n = len(m)
    # one path of 1x1 squares, merged per row run; crisp at any size (shape-rendering), no fixed units
    d = []
    for y, row in enumerate(m):
        x = 0
        while x < n:
            if row[x]:
                x0 = x
                while x < n and row[x]:
                    x += 1
                d.append(f"M{x0},{y}h{x - x0}v1h-{x - x0}z")
            else:
                x += 1
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {n} {n}" shape-rendering="crispEdges">'
           f'<path fill="#1e3e2b" d="{"".join(d)}"/></svg>\n')
    (out / f"{name}.svg").write_text(svg)
    print(f"{name}: {url}  ({qr.modules_count} modules)")
