# SPROUT — "Finally." — AI-First Scene Breakdown

This is the current production source of truth. The final film is a cinematic lifestyle ad, not a detailed app-demo film. The client VO remains unchanged. UI is limited to one real Sprout screenshot after the logo reveal, plus a deterministic end card.

## Production format

- Aspect: 9:16
- Delivery: 1080×1920
- Frame rate: 24 fps
- Target runtime: approximately 46–50 seconds, following the eight final VO files
- Visual world: premium family-technology commercial, photorealistic, warm neutral suburban environments, natural daylight, restrained acting
- Text rule: AI video never generates readable UI, logos, captions, or URLs

## Scene 01 — Anonymous chaos

**Audio:** VO 1  
**Duration:** approximately 6.8 seconds  
**Visual:** Emma receives repeated phone notifications in the kitchen and tries to work out who is messaging her.  
**Source:** `../Mother_overwhelmed_by_parenting_…_202607312033.mp4`  
**Status:** READY. Use the first half of the existing clip. Replace any generated notification text during editing or keep it soft/out of focus.

## Scene 02 — Morning information hunt

**Audio:** VO 2  
**Duration:** approximately 3.4–5 seconds  
**Visual:** Emma moves between a paper school calendar, a printed flyer, and her phone while preparing for the morning. One continuous action, no readable text.  
**Source:** new AI generation  
**Status:** GENERATE 01. Prompt in `AI-FIRST-PROMPTS.md`.

## Scene 03 — The pause

**Audio:** VO 3  
**Duration:** approximately 2 seconds  
**Visual:** Emma stops scrolling, lowers the phone slightly, closes her eyes for one beat, and exhales.  
**Source:** final 2 seconds of the existing overwhelmed clip  
**Status:** READY. Remove all notification sound at the cut.

## Scene 04 — Meet Sprout

**Audio:** VO 4  
**Duration:** approximately 5.5 seconds  
**Visual:** clean Sprout logo reveal for about 1.5 seconds, followed by one real Daily briefing screenshot on a phone for about 3 seconds.  
**Source:** `mockups/scene04-logo-reveal.html` and `../7.1_-_Home_-_Daily_202607312032.jpeg`  
**Status:** READY. Deterministic graphic, not AI video.

## Scene 05 — The village has faces

**Audio:** first benefit section of VO 5  
**Duration:** approximately 4–5 seconds  
**Visual:** Emma arrives at a school or soccer-field sideline and warmly recognizes David, Sarah, and Mike. The group greets one another naturally.  
**Meaning:** real profiles, real names, real faces.  
**Source:** new AI generation using the existing character sheets  
**Status:** GENERATE 02.

## Scene 06 — Everyone prepared

**Audio:** calendar and reminder section of VO 5  
**Duration:** approximately 4–5 seconds  
**Visual:** calm school drop-off. Emma hands Mason his prepared backpack and library book while other parents arrive equally prepared.  
**Meaning:** calendar upload and reminders remove morning uncertainty.  
**Source:** new AI generation using Emma and child references  
**Status:** GENERATE 03.

## Scene 07 — Community in motion

**Audio:** camps, sports, and organized-parent update section of VO 5 plus VO 6  
**Duration:** approximately 6 seconds  
**Visual:** soccer practice sideline. Children play in the background while Mike calmly gives one short schedule update to Emma, David, and Sarah. The parents acknowledge it and continue supporting the children.  
**Meaning:** sports discovery, shared context, and one organized parent benefiting the whole group.  
**Source:** new AI generation using the supporting-parent character sheet  
**Status:** GENERATE 04.

## Scene 08 — Relief and CTA

**Audio:** VO 7 and VO 8 CTA  
**Duration:** approximately 8.5 seconds total  
**Visual A:** approved five-second Emma coffee clip, `Woman_receiving_notification_on_…_202608032123.mp4`. Use approximately 3.5–4.5 seconds. Add controlled notification copy in editing only if desired.  
**Visual B:** clean end card with Sprout logo, tagline, and `joinsprout.co`.  
**Status:** AI footage APPROVED. End card READY via `mockups/scene12-end-card.html`.

## Generation order

1. Scene 02, morning information hunt
2. Scene 05, village recognition
3. Scene 06, prepared school drop-off
4. Scene 07, community sideline update
5. Assemble with existing Scene 01, 03, 04, and approved Scene 08 footage

Every new scene follows the same gate: generate one 9:16 keyframe, upload for QA, then animate the approved keyframe into one short clip.
