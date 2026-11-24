# App Store screenshots · rules for Codex

The repo root `AGENTS.md` applies here too (no invented design, no Figma edits, no commit/deploy). This file adds what
is specific to the App Store work. The current spec is `HANDOFF-CODEX-2026-11-24.md` in this folder.

## Which file is live

- **`screenshots-v15-people.html` is the current set** (Tony 24 Nov: "people like the website"). Every other
  `screenshots-v*.html` and `store-header-*.html` is history. Never edit an older version; Ahmad's rule is that a new
  round is a new `V.N` file, and old versions are kept.
- Store slides are 1290 x 2796 (iPhone 6.9"). All slide sizes in the HTML are `cqw` (1cqw = 12.9 px at export size).

## How a V.15 slide is built (do not change the structure)

One table and one function drive everything, in `screenshots-v15-people.html`:

- `PHOTOS` (line ~87): per slide `[file, background-position, pendingName, [boxTop, boxHeight] in cqw, size?]`.
- `COPY` (line ~100): headline segments `[[text], [text, 1 = sage italic]]` + subline. Copy comes from Figma
  character for character. Slide 6 is the one deliberate exception (24 Nov).
- `photoSlide()` (line ~128): blurred copy of the photo full-bleed, the sharp photo in its box with a top/bottom fade
  mask, and one eased dark green gradient (`g(keys)`). `CANOPY` (line ~140) is the stronger gradient for slides 7-9.
- `SLIDES` (line ~141): per slide caption + `photoSlide(i, inner, keys?)` where `inner` is the phone or Figma pieces.

## Visual rules Ahmad set (binding)

1. The photo always runs under the type all the way up. **Never a solid colour band**, never a hard edge or seam.
2. Gradients are eased (`g()`), soft, max ~0.6 alpha. Never "harsh and bold".
3. Faces sit between the headline and the app. Never under the headline, never cut by the phone top.
4. Real Figma exports for screens (`assets/figma/`), never coded or invented UI. Slide 6 uses the CURRENT Assist home
   `assets/figma/assist-home-1119.png`; `assets/figma/assist.png` is the stale old Assist UI, never use it.
5. Clean light phone frame (no black bezel), no pop-ups breaking out of the phone.
6. Photos are fictional people only. New photos are portrait 9:16 with empty tree canopy in the top 40%.

## Build and check

```bash
node "/Users/ahmadfauzanazhim/Sprout/08 - Generated Screens/App Store/tools/export-v15.mjs"
```

Writes `exports/v15/1.png` … `9.png` + `sheet.png`. Open the sheet and every slide you touched at full size. Fail
yourself on: a solid band, a visible seam, a face under text, text over a bright patch that is hard to read.
The page itself opens straight from disk: `open -a "Google Chrome" ".../App Store/screenshots-v15-people.html"`.

## Figma is not yours

The Figma copy lives in Sprout Design (Prod) `EhpRiGZ5eJnBb132X9zewg`, App Screenshot page `338:21544`, section
`16617:26814`. Do not edit it. When your HTML change also needs Figma, say so in your report under "Figma sync needed"
with the slide numbers; Ahmad (or Claude) runs `tools/figma-v15-backgrounds.py` and updates the text layers.
