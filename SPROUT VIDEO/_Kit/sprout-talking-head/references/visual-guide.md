# Visual guide: Sprout talking-head edits

How a Sprout talking-head video looks and moves. Built from the Video 10 test (Arthur Brooks, V1 to V5,
16 Oct 2026; V5 is the approved baseline) and the structure of Joseph's Opus 5.5 Reel method. Colours and type
come from `brand-core.md`; this file says where they go and how they move.

Reference frames in `examples/arthur-v5/` (from the V5 render). Look at them before building a scene. They are
third-party footage, so they live on this Mac only and are not in the public repo; on a fresh checkout, render
them again from `Video 10 - Happiness Test/kit-test/` or read the table below.

| Frame | Shows |
|---|---|
| `01-captions-styled-hook.jpg` | Hook: face, opening zoom, styled phrase THREE / macronutrients. |
| `02-captions-ui-three-objects.jpg` | Captions + UI: three paper objects with labels in the lower half |
| `03-full-text-centric-pip.jpg` | Full screen, text-centric: ENJOY / your life. plates, paper bloom, speaker circle |
| `04-captions-ui-comparison-card.jpg` | Captions + UI: Enjoyment ≠ Pleasure card |
| `05-captions-styled-punchline.jpg` | Punchline on the face: to / REHAB. reversed plate |
| `06-full-graphic-centric-pip.jpg` | Full screen, graphic-centric: struggle-to-accomplishment staircase |
| `07-full-object-centric-deep.jpg` | Full screen on ink: Your why. + compass |
| `08-captions-styled-closing.jpg` | Close on the face: REALLY, REALLY / actively. |

## 1. Canvas and safe area

- 1080 × 1920, 30 fps. Source footage is often smaller (Arthur: 720 × 1280); vector type and graphics render at
  full size, footage detail does not increase. Do not push the crop past what the source can hold.
- Primary text stays inside x = 72–972, y = 162–1659, including descenders and the largest moment of any motion.
- Below y = 1660 and the right 90 px belong to Instagram and TikTok controls. Nothing readable goes there.
- Never cover the eyes or mouth. Captions sit below the face.
- Optional speaker label: top-left (x 72, y 61), Inter 500 22 px, `+0.06em`, uppercase, cream.

## 2. Captions

Captions are on screen for every spoken word, in every scene type. Two presentations, never both at once for
the same words.

**Ordinary caption (V5, locked).**
- Inter 500, 48 px, cream on an ink plate (`#1e3e2b`, radius 6, padding 14 × 24), one line, ≤ ~30 characters.
- The whole phrase appears at once. Upcoming words at 50% opacity; each word goes to 100% about 30 ms before it
  is spoken, in 60–90 ms, and stays bright until the phrase clears.
- No word scaling, bouncing, weight change, or colour flash. Size and position never move inside a phrase.
- Phrases break at punctuation and natural pauses, 2–6 words.

**Styled phrase (the "special words").** Two to four times per minute, not every sentence.
- The words marked as emphasis in the plan replace the ordinary caption for that moment.
- Lead words: Inter 800, uppercase, on an ink plate. Last word: Playfair Display italic on an offset plate
  (sage, or reversed cream on darker footage), offset 40–80 px to the right, rotated at most ±1.5°.
- A single emphasised word: Playfair italic alone on a plate.
- Group reveal (90 ms fade + 8 px rise), then hold still. Same 50% → 100% reading progression.
- On `captions` scenes the styled phrase sits in the lower middle (top ≈ y 1170). On cutaways the scene itself
  carries the big type, and emphasised words show inside the ordinary caption in Playfair italic.

**Hook (first 2 seconds).** The face is on screen. The opening zoom pushes in (100% → 118% at 0.32 s, settles
at 112% by 1.35 s). The hook line gets a styled phrase on the one word that makes a parent keep watching.

## 3. Scene types

Every script line gets exactly one of four types in the plan. The scaffold builds the layout; the scene fragment
fills the slot.

| Type | Layout (1080 × 1920) | Use it for | Caption position |
|---|---|---|---|
| **Captions** | Full footage, bottom shade | Hooks, punchlines, jokes, emotion, anything where the face is the message | Plate centred at y 1395; styled phrase top y 1170 |
| **Captions + UI** | Footage dims to 60% and blurs 8 px; slot x 72–1008, y 1000–1560 | A small concrete thing next to a sentence: a list, a card, a toggle, a number, a Sprout notification | Plate centred at y 920, above the slot |
| **Half screen** | Paper (or ink) panel y 0–960 with slot x 72–1008, y 162–900; footage reframed into y 960–1920, face centred | An explanation that needs a picture while the speaker stays present | Plate centred on the seam, y 960 |
| **Full screen** | Paper or ink panel over everything; slot x 72–1008, y 162–1500; optional speaker circle 330 px at right 78, top 67.5 (slot then starts at y 430) | The one idea per section that deserves the whole frame | Plate centred at y 1600 |

Rhythm rules:
- Open on `captions`. Close on `captions` (face, recap, or end card after it).
- Punchlines and jokes go back to the face. The expression carries them (Arthur's "rehab" line).
- Full screen holds 2.5–7 s. Two full screens in a row only as a deliberate sequence (a numbered list).
- Rough share of runtime: captions 40–60%, captions + UI 10–25%, half 10–25%, full 15–30%. The planning page
  shows the live share and a rhythm strip.
- A change of scene follows a new idea, a contrast, or a punchline, never a fixed interval.

## 4. What fills a scene: four content types

Name the type in the plan text when it matters ("full, object-centric: paper compass").

1. **Text-centric.** The words are the scene. Playfair statements, styled plates, a numbered chapter tag
   (`01 / ENJOYMENT`, Inter 600 24 px, `+0.09em`, brand green on paper, cream on ink).
2. **Person-centric.** Built around a person: the speaker circle, a reframed half, or a Sprout cast character
   (character sheets in `SPROUT VIDEO/`, cropped, never regenerated).
3. **Object-centric.** One paper-world object as the metaphor (bloom, staircase, compass). Generated once as a
   transparent PNG in the paper style from `brand-core.md`, moved in code. No generated video.
4. **Graphic-centric.** Cards, comparisons (Enjoyment ≠ Pleasure), checklists, simple diagrams, real Sprout UI
   (Daily Brief rows, reminders, chat bubbles) rebuilt in HTML from Figma. Diagrams are editorial, not data:
   never imply a measurement that was not said.

## 5. Building a scene

**Background, step by step.**
1. Base: paper `#f4f1ea` (default) or ink `#1e3e2b` (for a "meaning" or reflective beat; at most one or two per
   video).
2. One large soft shape in the next surface tone (paper shade `#eae6db` on paper, `#24493a` on ink), off-centre,
   bleeding off an edge.
3. Optional fine detail: a hairline rule or a faint grid in paper deep `#dbd5c8`, 1–2 px. Never a gradient mesh,
   glow, or noise texture.

**Three-object rule (Sprout version).**
1. **Main object**, centred on the slot's optical centre (slightly above geometric centre): the word, the card,
   the paper object. One per scene.
2. **Supporting elements** at the edges, aligned to the 72 px margins: a chapter tag, two or three labels or
   chips, a caption-sized line of context.
3. **Depth elements** around the outside, quiet: a contact shadow under the object, a second card behind at
   60% scale and 8% darker, a sage circle partly hidden by the main object.

**Cards.** Paper `#f4f1ea`, border 1 px `#d0dacf`, radius 22–28, padding 36 × 44, shadow
`0 8px 24px rgba(0,0,0,.10)`, ink text. On paper backgrounds use paper shade `#eae6db` for the card instead.

**Size.** Make things smaller than feels natural, then check: a scene with one 150 px word and generous space reads
as premium; three 150 px words read as shouting.

## 6. Motion

- Every element: enter, settle, hold, clear. No idle drift, no loops, no infinite rotation.
- Enter 250–400 ms, `power3.out` or `power2.out`. Stagger 80–120 ms. Travel ≤ 40 px, rotation ≤ 3°.
- Readable hold of at least 1.2 s for anything with words.
- Clear in 120–200 ms or cut with the scene.
- No elastic, back, or bounce eases. No `Math.random`, no `Date.now`: HyperFrames renders by seeking.
- Camera on footage: 100–105% normally; one slow push per scene at most; the opening zoom is the only fast move.
- Animate on the spoken cue: the object that a word names arrives 50–150 ms before that word.
- Scene transitions from the scaffold: full = fade + 2% scale settle (250 ms); half = panel slides down
  (350 ms) while the footage window rises; captions + UI = footage dims and blurs over 300 ms.

## 7. Captions + UI details

- The footage behind dims to 60% brightness and blurs 8 px for the scene, then returns.
- The UI sits in the lower half slot. It is small: a card no wider than 936 px and usually 200–560 px tall.
- Good content: a single Sprout card or row, a three-item list, a toggle, a counter, a before/after pair.
- One action per UI scene: a tick, a card sliding in, a number filling.

## 8. Never

- Never cover the face with type or UI in a `captions` scene.
- Never add a colour outside the palette, a drop shadow on text, a stroke on letters, or a glow.
- Never show the same words as a big phrase and an ordinary caption at the same time.
- Never use stock footage, competitor logos, fake app UI, or a real roster.
- Never mark a scene done without looking at the rendered frame at its strongest moment.
