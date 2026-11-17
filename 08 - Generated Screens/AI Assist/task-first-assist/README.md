# Sprout Assist prototype (rebuilt 16 Nov 2026)

Live: https://sprout-assist-tasks.vercel.app/assist/ · local: `python3 build.py`, then serve `site/` (preview config `assist-tasks`, port 4330).

## D6 · Assist wiring map (17 Nov)

`app/assist-map.html` → `/assist-map/`. How every Assist flow writes into the Daily Brief, to-dos, pushes, the family
calendar, the spouse, class chat, saved details and pages outside Sprout; chips marked built / designed / gap. Data
lives in `SURF`, `FLOWS`, `STATES`, `TIMELINE` at the top of the script: add a line to add a chip or a connection.

## D5 · messaging and paying sitters (17 Nov)

Research: `research/D5-sitter-messaging-and-payment.md`. Built in `sitter-v3.js`: the parent sends from their own phone,
one sitter at a time (mock Messages / WhatsApp compose sheet; each sitter has a channel), the text carries a reply
link, the sitter answers on `/sitter-reply/` (`app/sitter-reply.html`, web, no app), replies show "answered on the
link" with a "Mark it" sheet for text replies. Morning after: rating + Pay with Venmo (prefilled) / cash / another
way, logged. Sprout never holds the money (Stripe Connect stays a later decision for Tony).

## UI directions for the sitter flow (17 Nov, review only)

`app/ui-directions.js` + `.css`, review page `app/ui-review.html` → `/ui-directions/`. Two steps ("when", "who to ask")
in three looks: A polish in place (week strip, − / + steppers, tint selection, sitter photos), B answers in a stepped
sheet (calendar + fields, chat keeps short answers), C warm and photo-led (date headline, day-to-night bar, swipeable
sitter photo cards). Routes `/ui-a|b|c/?s=date|who`. Sitter photos `app/assets/sitters/` (Figma AI, scratch file).
**Picked 17 Nov: A + C's sitter photo cards**, now applied in `sitter-v3.js` (C1 + C2). Gotcha: never name a class `ph` or `tag`; `ph` is Phosphor's icon class (text inside renders as glyphs) and `tag` is
taken by the SSC CSS.

## Book a sitter + Plan a date night v3 (Tony's order, 17 Nov chat, review only)

`app/sitter-v3.js` + `sitter-v3.css`; review page `app/sitter-review.html` → `/sitter-date-night/`.
- **Book a sitter** (tile): date + duration card (day tiles, from/until chips) → which kids (Maya + Jake photos, both on)
  → request details → who to ask. The last step depends on the family, set by route, never by a switch in the app:
  `/sitter-v3/` saved sitters (+ Add a sitter sheet) · `/sitter-v3-class/` none saved, class parents' sitters (parent
  name + sitter name, number stays private) · `/sitter-v3-none/` nobody, ask a class group, parents share name + phone,
  saved to your sitters. `/sitter-v3-share/` = Priya's side (push → Tony's message → Share a sitter form).
- **Plan a date night** (`/date-night-v3/`, push fills Saturday 7 PM; or the tile): date + time → distance → food (multi)
  → budget → 3–5 places on the map with photo, why I picked it, Menu sheet, Website → open times nearest yours first →
  booked → the sitter flow from "which kids", hours set from the dinner time.
- Maya's photo `app/assets/maya.webp`: Figma AI, scratch file `H5GZYtSTT9TOR8qc5ieuV7`, made to match `jake.webp`.

## Date night v2 (B3, 17 Nov, Ahmad's direction, review only)

One flow: `app/date-night-map.js` + `date-night-map.css`, route `/date-night-v2/`. Starts on a lock-screen push
(Thursday 4:12, "Saturday night is free"), or from the "Plan a date night" tile on Assist home. Steps: my pick on the
camp map (K10 v3 P·1 `15525:43672`) with time chips → "Show me others" = all 5 places, pins and swipe cards stay in
sync (K10 v3 P·2 `15529:43512`) → details sheet (gallery, time chips, "Book 7:00 PM") → booked → Sprout offers a sitter
(Ask Alex / Ask all my sitters / We're covered) → confirm card → evening summary with the restaurant photo.
**Approved new motion (Ahmad, 17 Nov):** the map glides to the selected place (0.45 s, the SSC sheet curve) and the pin
grows; the card photo and text rise in. Everything else stays on the SSC set. Photos: `app/assets/dn/<place>-1..3.jpg` (olive, casa, kumo,
juniper, rosie; 1 = the room, 2 = a dish, used on map pins, 3 = a table for two, used on the summary card), generated
with Figma AI (gpt-image-2.5-flare) on 17 Nov in the scratch file "Date night photos (scratch)" `H5GZYtSTT9TOR8qc5ieuV7`
(Tony Martin's team), 1200×800 JPEG. Made-up places; the photos are AI, not the real restaurants.

## Date night A/B/C (B3, 17 Nov, review only)

`app/date-night.js` holds three directions for Tony's date night ask (restaurant, reservation, then a sitter for that
time): A step by step, B one plan card that fills in, C Sprout suggests the night (clover peek first). Review page
`app/date-night-review.html` → `site/date-night/` shows them side by side; each runs alone at `/date-night-a|b|c/`.
Local only until Ahmad picks: `python3 build.py`, then `nohup python3 serve-24h.py > /tmp/assist-review.log 2>&1 &`
(port 4331, stops after 24 h; kill the PID in `serve-24h.pid` to stop early). The picked one replaces `nightOut`.

## Why it was rebuilt

Codex's version (archived in `_codex-build-2026-11-16/`) stacked four script layers on top of the sitter bundle and an
iframe copy of the SSC demo, each with its own cards, buttons, sheets and timings. Ahmad, 16 Nov: inconsistent design,
inconsistent animation, pop-ups placed where they're hard to tap, made-up CTAs. This build has one engine (`app/app.js`)
whose parts are the approved SSC Kids demo (`../ssc-kids-signup-demo/prototype/index.html`, Tony-approved), and
`build.py` copies that demo's CSS in verbatim at build time, so the two can't drift.

## The rules every flow follows (from the SSC demo)

| Moment | Part | Where the action sits |
|---|---|---|
| Sprout talks | typing dots ~0.9–1.1 s, then a green-tint bubble with the orb | left, under "Sprout" |
| Parent answers | dark green bubble | right; always the exact label they tapped |
| Pick one option | chips | directly under the card or message they answer, left-aligned with the card |
| A question about a card | `.q` box inside the card with chips | inside the card, one question at a time; the answer becomes a "Just now" field row |
| Pick several | pick rows with checkboxes + one full-width green button that says what happens ("Ask Maria and Sam", "Sign up for 2 weeks · $990") | button at the bottom of the card; skip/alternative as a chip under it |
| Sprout working | status row: spinner → icon + check | under the last message |
| Money | Approve payment card: lines, total, tappable card row, "Waiting for you or Dana", Decline (ghost) + Approve $X (green) side by side, then Face ID | inside the card |
| Anything full screen (details, waiver, receipt, pay with, add a card, passwords, history, accounts and cards) | the SSC waiver sheet: slides up 0.38 s, close top-left, body scrolls, **one CTA pinned in the footer** | footer, thumb reach |
| Not built yet | toast "Not part of this demo" | bottom, above the composer |

Never: native browser selects / date / time pickers in the chat, two-line button labels, floating mid-screen pop-ups
(Face ID is the only centered overlay, as in SSC), tab bars or extra toolbars under the Assist header, user bubbles
the parent didn't tap.

Motion is only the SSC set: sheet 0.44 s `cubic-bezier(.2,.9,.25,1)`, rows rise 0.32 s, overlays 0.38 s, chip press
scale .95, the approved navbar clover motion (`assets/navbar-motion.js`, plus a `sproutNotify` hook so a plan can raise
the badge + peek when replies arrive while Assist is closed).

## Screens

- **Daily Brief**: the SSC demo's top (greeting, weather, A7 k9 banner) + Figma render below. Banner opens the soccer plan.
- **Assist home**: Figma A·1 `14892:33659` (greeting, 2-column clay tiles, composer). Added only what Ahmad asked for:
  "Your plans" (max 2, SSC status rows, the rest in the header History button), a "Sitters and nights out" row, and
  "Accounts and cards". Tiles without a flow show the demo toast.
- **Plans**: every tile tap starts a new plan with its own chat, so a second night out never overwrites the first.
- **Flows**: soccer (SSC copy unchanged, plus working decline, receipt, no-preference), summer camps (Figma K10 v3 entry
  card, then the SSC registration/account/approval steps), ask my sitters, class-family sitters, night out,
  plan an event / birthday, start a club.
- **Saved details**: provider accounts are created or signed into once and reused next time; "I already have one"
  uses the password sheet (Sprout keeps the sign-in, never the password); cards are picked from the approval card's
  card row, and new cards are added in a full-screen sheet.

Everything is sample data. Nothing is sent, booked or charged.

## Where each flow's steps and copy come from

| Flow | Source | Notes |
|---|---|---|
| Soccer | SSC demo (Tony-approved), copy unchanged | Branches from K12 v2 `15492:51581`: Remind me later (M·1/M·2), Not this season (Q·1–Q·3), password sheet R·1/R·2 |
| Summer camps | K10 v3 `15524:43294` | Map entry P·1, details sheet D·1, week picker P·4, form P·5–P·8 + waiver sheet X·3, profile P·9, account A·1–A·3, sign-up day P·10–P·12, Jake P·13–P·14, more weeks P·15/P·16/X·5/X·7, others P·2/P·3/X·1, not now Q·2 |
| Ask my sitters / class families | A8 `16151:356321` (Ahmad chose A with B fallback, 14 Nov) | Rebuilt with SSC parts, not A8's full-width rows; confirm card = SSC approval card without payment |
| Plan an event | K4 row F `14892:33651` | Birthday F·1–F·11 (draft in the composer, 3 covers, details, invite, Thursday headcount), playdate F·12–F·16 |
| Start a club | K4 row G | G·1–G·11 |
| Night out | none in Figma (A8 has no dinner frames) | Same parts; dinner step is a placeholder until a design exists |

Covers and camp photos are the real Figma image fills (`app/assets/figma/`), clay icons are the Figma A·1 tiles
exported at 4x plus person-plus / calendar-check / two-people from the Exploration clay set (`app/assets/clay/`).

**One family, one calendar.** The brief says Monday, July 27, so Figma dates were moved to match: the birthday and the
sitter evening are Sat, Aug 1; Pinecrest opens "Friday at 9". School is Lincoln Elementary (the SSC demo), not Kiker
(K4); Maya is in Miss Taylor's class, Jake in Miss Poole's. The K4 playdate family became Lily / Ben and Ana Ortiz so
nobody plays two roles (A8's sitter Sam, SSC's Leo).

**Two sheet types, one rule.** Documents (waiver PDF, full details, receipt, history, accounts and cards, add a card)
use the SSC full-screen sheet. Short choices from the Figma flows (camp details, week picker, password manager, pay
with, invite preview) use the Figma bottom sheet: grabber, tap outside to go back, CTA in the footer. Both keep the
action at the bottom of the screen.
