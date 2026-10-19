# Sprout brand core for content

The part of the kit that every piece of Sprout content shares: talking-head video, faceless video, carousels,
stories. Read it before choosing a colour, a font, a word of copy, or an image.

Sprout is a free app for parents at the same school: class group chat, the Daily Brief (what is happening
today for each child), reminders, events, birthdays. The audience is busy parents, mostly moms, at US
elementary schools. The tone is a warm, organised friend. Never a hype channel.

## Colour

Everything is cream paper and deep green ink. There is no other accent colour.

| Role | Hex | Use |
|---|---|---|
| Paper | `#f4f1ea` | Cutaway backgrounds, cards, reversed plates, text on green |
| Paper shade | `#eae6db` | Second surface on paper (a card on a card), soft shapes |
| Paper deep | `#dbd5c8` | Hairline shapes, depth elements on paper |
| Ink | `#1e3e2b` | Caption plates, text on paper, deep-green cutaways |
| Brand green | `#186338` | Labels, chapter tags, the one highlighted word on paper, ticks and lines |
| Sage | `#e2e9e3` | Quiet secondary plate, the second line of a styled phrase |
| Mint line | `#d0dacf` | Card borders on paper |
| Light green | `#77b691` | Small details only (a needle tip, a progress fill). Never body text |
| Footage black | `#101311` | Behind footage, letterbox |

Rules:
- Cream text on ink, ink text on cream. Brand green text only on cream and only at 24 px or larger.
- No pure black (`#000`) and no pure white (`#fff`) anywhere a viewer can see. They read harsh and cheap.
- No new accent colour for a single video (no mustard, no coral, no blue), even when a reference uses one.
- Footage keeps its own colour. No grade, no LUT, no tint over a face.

## Type

| Voice | Font | Use |
|---|---|---|
| Display | Playfair Display, 400–500, often italic | Big statements, the second line of a styled phrase, titles on cutaways, button labels |
| Text | Inter, 500 for captions, 600 for labels, 800 for the uppercase lead of a styled phrase | Captions, chapter labels, UI text, small print |

- Letter spacing 0 for captions. Display type at large sizes: `-0.035em`. Uppercase labels: `+0.06em` to `+0.09em`.
- Sizes on the 1080 × 1920 canvas: captions 48 px; chapter labels 22–24 px; cutaway titles 82–160 px;
  styled-phrase lead 72–162 px; styled-phrase serif line 94–152 px.
- Font files live in `assets/fonts/` (Inter variable, Playfair Display variable, normal and italic, latin subset,
  SIL OFL). Always embed them. Never let a render fall back to a system font.

## Logo and end card

- `assets/sprout-logo.svg` is the app-icon mark (clover on a cream rounded square).
- The logo appears on the end card only, never over a face and never as a watermark during the edit.
- End card copy (current, from Videos 8 and 9): "Get Sprout · joinsprout.co", optional "Free for parents".

## Icons and images

- Icons: Phosphor only (https://phosphoricons.com), regular or duotone weight in ink or brand green. Never draw a
  substitute icon by hand.
- Metaphor imagery: the Sprout "paper world". Thick cotton paper objects, cut edges, soft directional light,
  contact shadows, in cream, sage, and deep green only (Video 10 V3: paper bloom, staircase, compass). One object
  per idea, shown on paper or ink with room around it.
- Sprout app UI on screen must come from real Sprout screens (Figma file `EhpRiGZ5eJnBb132X9zewg`, addressed by
  nodeId), rebuilt in HTML or exported. Never let an image model fake app UI or text.
- No competitor logos or app icons. Name another product in plain text only.
- No real parent rosters, emails, phone numbers, or student information, even if the footage or source shows them.

## Copy

- English. Sentence case. Short. No emojis. No em dashes.
- Say what a parent gets, in their words: "Know what's happening today", not "AI-powered family orchestration".
- No invented numbers, claims, or endorsements. A speaker who is not from Sprout (a podcast guest, an expert)
  never appears to endorse Sprout.
- Teachers never chat in Sprout. Mock conversations are parents and the room parent.
- Never show "who hasn't done it" lists or class money totals.
- Avoid: delve, crucial, robust, comprehensive, seamless, unlock, game-changer, elevate, journey.

## Delivery

- Social video: 1080 × 1920, 30 fps, H.264 + AAC.
- Loudness: −14 LUFS integrated, −1.5 dBTP ceiling (ffmpeg two-pass loudnorm).
- Captions also exported as `.srt`.
