# Render v2: every cutaway is one diagram that grows

Approved direction: `../samples/27-38-path-build/` (Ahmad, 2026-10-26, "Arah ini cocok").
v2 applies it to all three cutaways. Face beats, the Figma bubble, camera reframes and the caption
profile are unchanged from v1.

One visual system across the video: ink panel (same luminance as the footage), cream strokes,
a giant DAY counter, the mirrored clay shoe, no text inside graphics except the counter.

## p04 · 12.30-17.26 · "Because you have put the practice in that you know this is the process."

| Time | Words | Change on screen |
|---|---|---|
| 12.20 | (Because) | Ink panel wipes up; floor line draws |
| 13.10 | put | First practice bar rises; counter shows DAY 1 |
| 13.80-14.29 | practice in | Seven more bars, one per beat; counter runs to 8 |
| 14.90-15.40 | know this | Highlight sweeps across the bars |
| 16.06-16.50 | the process | Bars grow into stairs |
| 16.58-16.98 | process | One line traces the stair tops and ends in a ring on the top step |
| 17.14 | (It's) | Panel clears, face returns |

## p08-p11 · 27.14-38.50 · the walking path

Unchanged from the sample. See `../samples/27-38-path-build/BEATS.md`.

## p14 · 46.84-50.62 · "They don't listen to their journey. They listen to everybody else's shit."

| Time | Words | Change on screen |
|---|---|---|
| 46.74 | (They) | Panel wipes up: the same path as 27-38 s, shoe a third of the way, walked part in cream |
| 48.40-48.80 | journey | The road ahead draws to its end ring |
| 49.00 | listen | First chat bubble (Figma bubble colour, callback to the inner voice at 2.7 s) |
| 49.30-49.66 | everybody | Six more bubbles |
| 49.72-49.96 | else's | Five more, now covering the path |
| 50.24 | shit | Path and shoe dim to 30%; the bubbles stay |
| 50.48 | (You're) | Panel clears, face returns |

## Sound

`master.wav` keeps v1's five-cue density, moved to the new visual events:
panel in at 12.32, 27.20 and 46.92 (paper-whoosh-short, -19 dB), path reveal at 31.90
(paper-slide-long, -19 dB), checkmark at 35.50 (card-land-soft, -20 dB). The bubbles stay silent.
`master-a.wav` is dialogue only. None of the cues has been auditioned.

## Files

- `renders/goggins-inner-voices-v2.mp4`: with the five cues.
- `renders/goggins-inner-voices-v2-no-sfx.mp4`: same picture, dialogue only.
- `renders/contact-sheet-v2.jpg`: frames at every beat of the three cutaways.
- `renders/render-plan.json`: caption units, layouts, scene spans, cue and bubble positions.

## Verification (2026-10-26)

- 1080 x 1920, 30 fps, 1,763 frames, 58.767 s, same as v1. Full decode: 0 errors.
- -14.0 LUFS / -1.9 dBTP (no-SFX copy: -14.0 / -2.0).
- Audio against the dialogue stem: 0.0 ms offset at 5 s, 30 s and 52 s.
- `npm run check`: 0 errors; 30/30 contrast checks; one warning for generated file length, as in v1.
- All 238 words appear once; one highlighted keyword per caption unit (asserted by the builder).

## Rebuild

From `../tools/`:

    python3 build_render_v2.py              # copies media, mixes both masters, writes index.html
    python3 build_render_v2.py --skip-media

From this folder:

    npm run check
    npm run render -- --output renders/goggins-inner-voices-v2.mp4 --fps 30 --quality delivery --workers 1 --strict --no-best-effort

Use `--workers 1`: it streams frames to the encoder. Three workers write about 3.7 GB of frames to
disk first, which failed on 2026-10-26 with 2.5 GB free.
