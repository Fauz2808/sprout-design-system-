#!/usr/bin/env python3
"""Export the website (home-v2) as a clean static site for the live deploy (Mohit, 8 Oct).

Copies home-v2.html as index.html, every file in review/site-manifest.txt, and the legal pages; drops the review-only
noindex; points the legal pages' nav back to index.html. The output is the separate repo Fauz2808/sprout-website.
Usage: python3 review/export-site.py [out_dir]   (default: ../sprout-website, next to this folder)
Run it again after any change to home-v2, then commit and push in the output folder.
"""
import re, shutil, sys
from pathlib import Path

here = Path(__file__).resolve().parent.parent
out = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else here.parent / "sprout-website"
noindex = re.compile(r'\s*<meta name="robots" content="noindex,nofollow" />')

files = [l.strip() for l in (here / "review/site-manifest.txt").read_text().splitlines() if l.strip() and not l.startswith("#")]
missing = [f for f in files if not (here / f).is_file()]
if missing:
    sys.exit("missing: " + ", ".join(missing))

# clear the previous export, keeping the repo's own files
keep = {".git", "README.md", ".gitignore"}
if out.exists():
    for p in out.iterdir():
        if p.name not in keep:
            shutil.rmtree(p) if p.is_dir() else p.unlink()
out.mkdir(parents=True, exist_ok=True)

for f in files:
    (out / f).parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(here / f, out / f)

index = noindex.sub("", (here / "home-v2.html").read_text())
(out / "index.html").write_text(index)

(out / "legal").mkdir(exist_ok=True)
for name in ["privacy-policy.html", "terms-and-conditions.html"]:
    t = noindex.sub("", (here / "legal" / name).read_text()).replace("../home-v2.html", "../index.html")
    (out / "legal" / name).write_text(t)

leftover = [str(p.relative_to(out)) for p in out.rglob("*.html") if "noindex" in p.read_text()]
if leftover:
    sys.exit("noindex still in: " + ", ".join(leftover))
print(f"exported {len(files) + 3} files to {out}")
