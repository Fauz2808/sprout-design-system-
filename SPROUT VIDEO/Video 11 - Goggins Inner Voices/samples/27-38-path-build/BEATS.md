# Sample: 27-38 s as one growing diagram

Why: `_Kit/editing-references/2026-10-tiktok/compare-raymond-vs-video11.md`, findings 2, 4 and 6.
v1 swaps three separate clay pictures (shoe, life path, checklist) on cream. This sample keeps **one
diagram alive for 11.4 s**, and every sentence changes its state.

Window: source 26.00-40.00 s (composition 0-14 s). All times below are source time.

| Time | Words | Change on screen | Why |
|---|---|---|---|
| 27.04 | When you put | Ink panel wipes up over the face. Counter area and empty path start appear | Same luminance as the footage, so no jump to cream |
| 27.70 | put | Clay shoe lands on the start point (camera zoomed in 1.7x) | The object arrives before its noun |
| 28.24 | practice | Giant counter shows **1**, first day dot stamped under the shoe | "practice" becomes something you can count |
| 29.00-29.85 | every day | Counter ticks 1 to 7, one dot per day | "every day" is shown as accumulation |
| 29.36 | lace | Shoe settles into a ready pose (4 degree lean, 5% squash) | Physical cue on the stressed word |
| 30.08-30.50 | And I don't mean | A straight sprint lane with a finish tick shoots ahead of the shoe | The literal reading: running |
| 30.52-30.95 | run | The lane retracts back into the shoe | "Not this" |
| 31.66-32.50 | metaphor | Camera pulls out to 1x while the real path draws: long, winding, unfinished | The relation becomes clear in one move |
| 32.52 | life | End ring appears at the far end of the path | The path now has a destination |
| 33.11 | When you lace | Panel drops to the lower half, face returns for the emotional peak, the same diagram keeps running | Face carries the emotion, diagram keeps the logic |
| 33.38 | lace | Same ready pose as 29.36 | Echo of the first "lace" |
| 34.46-35.60 | every day, pretty soon | Shoe walks the whole path, the walked part turns cream, counter runs 7 to 365 | Progress made visible |
| 35.45 | win | End ring fills, clay checkmark lands | Payoff lands with the word |
| 36.20 / 36.84 / 37.38 / 38.20 | courage / heart / dedication / mindset | A milestone lights on the walked path for each quality | The qualities are what the walk built |
| 38.48 | everybody | Panel and diagram clear, full face | Same return point as v1 |

Sound: version A has dialogue only. Version B adds three cues from the existing library
(panel in, path reveal, checkmark) at -19/-19/-20 dB, using the same mixer as v1. Compare by ear.

Constraints kept from `DESIGN.md`: Sprout palette only, entries 250-400 ms, clears 120-200 ms,
no idle loops, caption profile and keyword selection unchanged, text inside the safe area.
Known deviation: the shoe is mirrored so that it walks left to right, which moves its key light
to the upper right.

## Review files

- `renders/side-by-side.mp4`: v1 on the left, sample on the right, same 14 s, sample audio A.
- `renders/sample-a.mp4`: dialogue only. `renders/sample-b.mp4`: same picture with the three cues.
- `renders/contact-sheet-a.jpg`: one frame per beat.

Both mixes measure -14.1 LUFS / -2.0 dBTP, the same as v1.
`npm run check`: 0 errors, 0 warnings, 27/27 contrast checks.

## What the numbers can and cannot say

`_Kit/editing-references/cue_sheet.py` counts cuts. Here it finds fewer events in the sample (5)
than in v1 (6), because the diagram changes in small steps and never cuts. A "how much of the frame
moved" metric was tried and dropped: Raymond, the reference that works, holds still more often
than v1. Whether a change carries new information can only be judged by watching.

## Rebuild

From `Video 11 - Goggins Inner Voices/tools/`:

    python3 build_sample_path.py            # trims media, mixes A and B, writes index.html
    python3 build_sample_path.py --skip-media

From this folder:

    npm run check
    npm run render -- --output renders/sample-a.mp4 --fps 30 --quality delivery --workers 3 --strict --no-best-effort
