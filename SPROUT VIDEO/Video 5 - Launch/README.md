# Video 5 · Sprout launch film (9:16, one video)

1080 × 1920, 60 fps, synthesized temp score. Revised 29 Sep 2026 after Tony's meeting:
one video again (not five shorts), slower pacing, a richer class chat.

| File | Length | Sections |
|---|---|---|
| `out/sprout-launch.mp4` | ~124 s | Intro · Daily Brief · Sprout Assist · Class Group Chat · Families |
| `out/sprout-launch-no-families.mp4` | ~108 s | the same without Families |

## The rules the film follows

1. **A text card owns the screen, or the app does. Never both** (Tony, 28 Sep, after Muse).
   The app is full bleed, no phone frame, at 2.8× or closer, and a camera moves across it.
2. **Every card holds until it can be read aloud, with a second to spare** (Tony, 29 Sep:
   "I could barely even speak it out loud before it was changing"). `card()` in `core.js`
   enforces it: 0.34 s a word + 0.8 s after the last word lands, then a 0.3 s empty beat.
   If a section's timing is shorter, everything after it slides later on its own.

## What changed on 29 Sep

- One film: the five sections run back to back, the brand appears once after the intro
  and once as the end card.
- Pacing: every card now meets rule 2; each app screen in the class chat holds longer.
- Class Group Chat: the four men from Figma 8728:99165 are replaced by the demo cast with
  their role under the name (Emily Centineo, Flore's Mom · Jake Thompson, Erick's Dad ·
  Sarah Baker, Howard's Mom · Jessica LaRonde, Robert's Mom · Mike Johnson, Hawkins' Dad,
  replying to Lydia). Approved by Ahmad as a deliberate difference from Figma.
- "Chat with the whole class." is its own card before the class chat; "Every class, in one
  place." opens the section ("boom, all in one class. Give it a second").
- "Teacher updates" → "Teacher emails, in one feed."
- ~~The group avatar stays "MT" until there is a teacher photo~~ (done in the afternoon, below).

## 29 Sep, afternoon: the class chat is the join page's example chat

Tony, same meeting: "I don't want just a bunch of guys in it", the images looked old, and
"I'd like to have a picture of a teacher there, not just MT".

- Same cast and conversation as the example chat on the roomparent.com join page
  (`01 - Website/room-parent-portal-redesign/chat.html`): Mrs. Taylor (Teacher), Lydia (the
  viewer, right-hand bubble), Priya Shah · Cooper's Mom, Marcus Reed · Ava's Dad, Jen Walsh ·
  Leo's Mom, and the teacher replying to Jen. Replaces the Figma placeholder copy ("Yoow What is
  up", "Meeting Point Event … golfing", "welcome to the club buddy").
- Portraits: `assets/img/cast-*.webp`, 360 px, made from the same fictional AI portraits by that
  repo's `assets/chat/people/prepare.py --size 360 --out … --prefix cast-`.
- The teacher's photo replaces "MT" in the chat list, the class header, and the email senders.
  "Miss Taylor Class" / "Ms. Taylor's" → "Mrs. Taylor's Class" everywhere, to match.
- The conversation is taller than the panel, so the chat scrolls up while it plays
  (`seg4.js`), and the chat screen holds 8.6 s instead of 3.9 s. The film is ~5 s longer.
- Calendar notes are class notes (Picture Day by Mrs. Taylor, Fall Festival volunteers by Lydia
  Martin) instead of Art Exhibition / Music Festival signed by a real teammate. Updates are two
  distinct September teacher emails instead of the same June "Thank you" twice, and the header
  no longer shows a personal Gmail address.
- Fixed: `.gc .reply .ans` never matched (`.ans` is a sibling of `.reply`), so the reply line
  had no layout; now `.gc .c > .ans`.
- The morning renders are kept as `archive/sprout-launch*-2026-09-29-am.mp4`.

## Files

- `index.html?ep=full` (default) · `?ep=1,2,3,4` · `?ep=3`: preview any cut.
- `core.js`: the engine (cards, full-bleed app, camera, taps, brand, time shifts).
- `episodes/seg1..5.js`: the sections, each in its own local seconds.
- `screens.js` + `screens-v2.css` + `assets/app.css`: the app screens.
- `tools/make-film.sh [sections] [name]`: render + score + mux.

```bash
"SPROUT VIDEO/Video 5 - Launch/tools/make-film.sh"
```

```bash
"SPROUT VIDEO/Video 5 - Launch/tools/make-film.sh" 1,2,3,4 no-families
```

## Screen sources

| Screen | Source |
|---|---|
| Daily Brief, Sprout Assist, Matt's brief, Clubs directory | the website's Figma-matched demo |
| Chat list, typing, new message | Figma 12758:106388, 12758:106526, 12758:106672 |
| Class Group Chat tabs | Figma 8728:99165 / 8198:109621 / 8827:117674 / 8198:109833 |
| Amanda Hamilton profile | Tony's screenshots of the live app (`reference/amanda/`) |
| App logos | `assets/logos/SOURCES.md` |

## Known limits

- Amanda's family is a real family: consent needed before the full cut runs publicly
  (the no-families cut avoids this).
- The brand logos in the intro are other companies' trademarks.
- The score is synthesized. Previous cuts live in `archive/`.
