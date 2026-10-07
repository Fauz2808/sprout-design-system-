# Sprout hero: a clean Open Sky loop via Google Flow

Why: the Cove loop (assets/sky) has a table and laptop baked in. Ahmad, 6 Oct 2026: "we don't need the table and
laptop". Until this clean loop exists, the site shows only the loop's clean pixels (sky only on desktop, the left
strip on phones). Same pipeline as Cove (`~/Data Trainning/recreate-library/recreations/mercury/motion-kit`).

## 1. The still (Flow image, or any generator)

16:9, 1920 x 1080 or larger:

```
Wide photorealistic landscape, 16:9. A lush green meadow of tall grass with small white wildflowers rolling
gently toward soft distant hills and scattered trees, under a clear blue summer sky with soft white cumulus
clouds. Eye-level, centred, natural daylight, calm afternoon. Empty landscape: no table, no laptop, no furniture,
no people, no animals, no buildings, no text. The horizon sits at about 55% from the top, so the upper half is
open sky for the headline. Crisp detail, gentle depth of field in the foreground grass.
```

Keep the horizon a little below the middle: the headline and the form sit in the sky.

## 2. Flow settings (as Cove)

| Setting | Value |
|---|---|
| Mode | Frames to Video |
| Start frame | the still above |
| End frame | empty (an end frame makes the clouds drift back; the script loops it instead) |
| Model | Veo 3.1 Fast to explore, Veo 3.1 Quality for the final |
| Aspect | 16:9 |
| Outputs | 2 to 4, keep the calmest |
| Download | highest resolution |

## 3. Video prompt

```
Locked-off tripod shot, completely static camera. A wide green meadow under a clear blue summer sky with soft
white clouds. Only nature moves. The clouds drift very slowly from left to right. A light, gentle breeze makes
the tall grass and the small white wildflowers sway softly in slow, quiet waves. The distant hills and trees stay
still. Lighting, colours and sun position stay constant. No camera movement, no zoom, no people, no animals, no
birds, no text, no new objects. Photorealistic, natural daylight, smooth continuous motion.
```

If the motion is too strong, add: "Almost still. The clouds move extremely slowly, the grass stirs very faintly."

## 4. Reject a take if

- the camera moves (pan, zoom, drift, shake);
- anything appears (birds, people, objects, text);
- colour or brightness shifts during the clip.

## 5. Hand it over

Drop the downloaded MP4 in this folder. Claude adapts Cove's `process_hero_video.py` (no laptop lock needed now):
longest clip without a cut, separate sky and ground crossfades, AV1 + H.264, desktop 1920 x 1080 and a centred
608 x 1080 mobile crop, frame-0 posters, into `assets/sky/`. The hero then shows the whole frame again.
