# Arthur Brooks · kit test

The Video 10 clip rebuilt through the `sprout-talking-head` kit (`SPROUT VIDEO/_Kit/sprout-talking-head/`), 19 Oct
2026. It repeats the V5 decisions to prove the pipeline: planning page → `plan.json` → scaffold → scene fragments
→ render → master. A test edit with Sprout's visual identity; it does not imply that Arthur Brooks endorses Sprout,
and it is not for publication.

## Deliverables (`out/`)

- `arthur-brooks-kit-test.mp4`: 1080 × 1920, 30 fps, 37.5 s, 1126 frames, H.264 + AAC. Dialogue only (no music
  or SFX yet), mastered to −14.1 LUFS / −2.0 dBTP. Audio offset against the source: 0 ms.
- `arthur-brooks-kit-test-sheet.jpg`: one frame per script line.
- `animatic.mp4` + `animatic-sheet.jpg`: the scaffold before any scene was built (labelled placeholders).

## What is where

| File | Made by | Edit it? |
|---|---|---|
| `words.json` | `plan_page.py` (from V5's word alignment) | no |
| `planning.html` | `plan_page.py` | no, open it in Chrome |
| `plan.json` | the planning page | yes, through the page |
| `scenes/L*.html` | scaffold placeholder, then built by hand | yes: this is the creative work |
| `index.html`, `captions.srt`, `cues.json`, `scaffold-report.json` | `scaffold.py` | never, re-run the scaffold |
| `assets/arthur-brooks-edit.mp4` | `plan_page.py` (source had 7 s keyframe gaps) | no |
| `.face-track.json` | `scaffold.py` via Apple Vision | no |

## Rebuild

```bash
python3 "SPROUT VIDEO/_Kit/sprout-talking-head/tools/scaffold.py" "SPROUT VIDEO/Video 10 - Happiness Test/kit-test"
```
Then from the project folder: `npm run check`, `npm run render -- --output out/arthur-brooks-kit-test.mp4 --fps 30
--quality delivery --workers 2 --strict`, and `python3 ../../_Kit/sprout-talking-head/tools/master.py
out/arthur-brooks-kit-test.mp4`.

## Scenes

| Line | Type | Scene |
|---|---|---|
| L000 | captions | opening zoom, styled THREE / macronutrients |
| L008 | captions + UI | three paper objects, each on its word |
| L021 | full, paper, speaker circle | ENJOY / your life. plates, paper bloom |
| L033 | captions + UI | Enjoyment ≠ Pleasure card |
| L048 | half, paper | "pleasure." with "the secret to happiness" struck on "not" |
| L060 | captions | styled to / REHAB. (connector rule) |
| L065 | full, paper, speaker circle | Joy after struggle., paper staircase, path labels |
| L079 | half, ink | paper compass, needle settles on "meaning" |
| L086 | full, ink | Your why. with the settled compass |
| L101 | captions | styled REALLY, REALLY / actively. |

Known lint warnings (reviewed, not errors): nested scene sections (organisational, same as V5) and the same paper
images used in more than one scene.
