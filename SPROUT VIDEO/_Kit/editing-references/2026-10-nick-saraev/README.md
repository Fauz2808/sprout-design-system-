# Reference: Nick Saraev

Source: https://www.tiktok.com/@nick_saraev148/video/7674026297319820558
Status (2026-10-26): baseline measured, reference MP4 not yet on disk.

## Why the MP4 is missing

yt-dlp without impersonation fails on TikTok (same failure as every attempt in
`../2026-10-tiktok/access-log.json`). Downloading with impersonation was refused
as bot-check circumvention, so the file has to come from Ahmad: save it from the
TikTok app or web, then put it at

    source/media/7674026297319820558.mp4

## Run

From `_Kit/editing-references/`:

    python3 cue_sheet.py "2026-10-nick-saraev/source/media/7674026297319820558.mp4" "2026-10-nick-saraev/reference" --label "Nick Saraev"

## What the script measures, and how far to trust it

Calibrated on Video 11, where the true edit is known (`plan.json`, `audio/sfx.wav`).

| Signal | Trust | Evidence |
|---|---|---|
| Hard cuts and full panel swaps | High | All 9 Video 11 panel cuts found, 0 missed |
| Smaller visual changes (overlays, punch-ins) | Medium | `change?` rows under strength 12 were hand gestures in Video 11; check the frame |
| Word timings (whisper.cpp small) | High | "lace" at 29.36 s vs 29.46 s in `words.json` |
| SFX from the final mix | None | 0/5 Video 11 SFX found; the onsets are sibilants. Needs Demucs separation (~2 GB, disk is 98% full) |

## Baseline: Video 11

`baseline-video-11/` holds the cue sheet, `events.jpg` and `timeline.jpg`.
Key numbers: 1.53 cuts per 10 s, median shot 4.27 s, longest stretch with no
visual event 8.87 s (0 to 8.87 s, the hook), 4.03 words/s.
