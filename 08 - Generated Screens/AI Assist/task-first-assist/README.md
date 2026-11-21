# Sprout Assist prototype (rebuilt 16 Nov 2026, last review 20 Nov US)

Live: https://sprout-assist-tasks.vercel.app/assist/ · local: `python3 build.py`, then serve `site/` (preview config `assist-tasks`, port 4330).

## 20 Nov US · regular carpool (MEETING-2026-11-21-tasks.md, C2)

Try `/plan-carpool/` (Regular carpool) and Aisha's side at `/receiver/?v=carpool-regular`. `cpRank` + `cpRegular` in
`app/sitter-v3.js`; the old "everyone who says yes gets turns" branch is gone.

- **Two families, asked in order**: "Who should I ask first?" ranks nearby families (closest two pre-ranked 1 and 2,
  tap to add or remove). No group-chat option for a regular carpool. "Ask Priya first".
- **One at a time, in Sprout** (not text): Sprout messages #1; a no ("can't this season") means it asks #2, and says
  so. Demo: Priya can't (`TEAM` `regular:'no'`), Aisha is in.
- **The split before sharing**: `rotaCard` alternates You / Aisha under one "Who drives" label (names only, no
  "drives" on every row); tap a turn to change it; "Share with Aisha".
- **Shared**: the message Aisha gets shows the schedule, on her calendar. Her side: the ask card with We're in /
  Can't this season / Reply to Tony; We're in → waiting → "Tony shared the schedule" with her turns in green and the
  calendar + reminder note.

## 20 Nov US · one-time carpool (MEETING-2026-11-21-tasks.md, C1)

Try `/plan-carpool/` (One time) and the other parent at `/receiver/?v=carpool-chat`.

- **Kids first**: `cpWhen` is now "Plan a ride" (regular: "Plan a regular carpool"), with For as one line of photo chips
  (the playdate's `.pd-kid`), no class labels, before the date and pickup time.
- **First yes drives** (unchanged), and Tony now sees the words the others get: "We're all set now: Priya is taking
  Jake…" (one group text or each, worded to match).
- **Priya's side** (`receiver.html`, carpool-chat): the ride card has I can drive / Can't this time / Reply to Tony.
  I can drive turns the card into the confirmation: You're driving Jake, pickup time and address, drop-off, added to
  your calendar with a 9:00 reminder. No reply is typed for her (same rule as the playdate).
- **Can't at 9:30 → offer a time** (Ahmad, 21 Nov): on Priya's card the no is "Can't at 9:30". It opens a sheet, "When
  could you drive Jake?", with 9:00 / 9:45 / 10:00 / 10:15 to tick, or "I can't drive this time". Her card then waits on
  Tony; the demo plays his move to her first time and the card confirms at it. On Tony's side (`TEAM` Priya `offer`,
  one time only) the ride card says "Priya can't at 9:30" with her times: Pick up at 9:45 / at 10 / Keep 9:30, ask
  others. Picking a time moves the pickup and she drives.

## 20 Nov US · playdate (MEETING-2026-11-21-tasks.md, P1–P3)

All in `X.flows.playdate` (`app/sitter-v3.js`). Try `/playdate/`, `/playdate-new-time/`, `/playdate-cant/`, and the other
parent's side at `/playdate-invite/`.

- **P1 Kids first, short card**: "For" is the first row, one line of photo chips (Maya, Jake, both), no class names.
  Quick times and Where (Our place, A park, Lunch spot, Somewhere else) are one-line strips. Both kids → both classes in
  the parent grid, each tile says whose class. Message Ana sends at once; the sent text shows on the card (no Send /
  Edit step: "we could easily just say we messaged them this").
- **P2 Same card on both sides** (`playdateWidget`): the organizer's chat shows the invite card the other parent gets
  (`playdateInbox`), with a status line instead of buttons: Waiting on Ana → "Ana confirmed · on your calendar". Her own
  words show under it as her message; Sprout writes no template reply. The separate "done" card is gone: the same card
  solidifies, then Message Ana / Done.
- **P3 Suggested time**: the card shows the old time crossed out over the new one, an amber "suggested a new time" line,
  and Accept / Suggest another time / Reply on the card. Accept → "You accepted Ana's time". Ana's side shows the same
  change with "waiting on Tony".

## 20 Nov US · babysitter, for Mohit's build (MEETING-2026-11-21-tasks.md, S1–S7)

All in `app/sitter-v3.js`. Try `/book-a-sitter/` (no sitters yet) and `/book-a-sitter-saved/?review=conversation`
(Alex, then the demo clock to the payment).

- **S1 Time** (`whenCard`, `dayAt`, `earliestToday`): the sitter day strip starts **today** (Mon Jul 27, the demo
  clock's day, labelled "Today") and defaults to it. Today's earliest start is **now + 30 min, on the next half hour**;
  earlier times and quick options are greyed out, with one line saying why. Other days are unchanged.
- **S2 Where + notes** (`requestCard`): no re-confirming the time and kids just picked. First time: an empty Address
  field (one autofill-style suggestion while typing) and optional Notes, real inputs, not pencils. After that
  (`FAMILY.known`): the same fields filled from last time, "Looks right".
- **S3 Add a sitter** (`pickContact`, `sitterFields`): "Choose from Contacts" (iOS picker look, made-up contacts) fills
  name and number; rate optional; She / He kept; WhatsApp removed everywhere (Sam, Morgan now Messages).
- **S4 Replies** (`smsIn`): each sitter's own words show in the group text with "Sprout read this". A sitter added
  without a rate gives it in the reply. After a yes: **Book Casey**, **I'll reply to Casey myself** (Messages sheet
  from your phone, Sprout on the To line; Sprout reads it and confirms), or Not yet.
- **S5 Live Activity** (`laHtml`, `stops`, `laState`): "Babysitter Alex arrives in 30 min"; labels "Alex at 6 PM" /
  "Home by 10 PM"; the bar runs first stop to last, inset the same on both sides, every label centred on its dot.
  Same copy on `/date-night-live/`.
- **S6 Pay, then rate** (`payCard`, `payTonight`): Pay Alex opens the pay card first: hours stepper (stayed late, in
  half hours), tip No tip / 10 / 15 / 20%, total, card on file, **Pay Alex $X** or **Already paid (cash or Venmo)**
  (replaces Decline). Paying texts the sitter the amount and tip. The rating comes after.
- **S7 Payout link** (`payoutLink`): right after the booking text, Sprout texts the sitter a one-time link to add
  their bank (Stripe, opens `/sitter-profile/`), only if they haven't yet.

## 20 Nov · meeting + Tony's carpool order (MEETING-2026-11-20-tasks.md, N1–N8)

`/review/` now has 12 phones: the home in both tile sizes, Plan something (with the other parent's side of a playdate),
Register my kids, and Carpool.

- **N1 Carpool** (`X.flows.carpool` in `app/sitter-v3.js`, `/plan-carpool/`, review page `/carpool/`). Tony's order, one
  flow: `cpKind()` one time or regular → `cpWhen()` kid + date (regular: weekdays + until) + ONE pickup time, never a
  range → `cpPlace()` pick up from, then drop off at (Home, School, Soccer, Summer camp, or an address; filtered by the
  kid's registrations) → `cpWay()` one way or both ways (both asks the ride-back time) → families nearby whose kid does
  the same activity (`cpGroup()`) → `cpSend()` the whole group chat or parents you pick (the parent grid). One time: the
  first yes drives, others are told, no second confirm. Regular: everyone who says yes gets `rotaCard()` turns. The 19 Nov
  A/B flows are gone; `/carpool-a/` and `/carpool-b/` open the new flow. Not on the home yet.
- **N2 Home tile sizes**: `?home=small` puts Plan something in the same 4-across small tiles as Register my kids.
  `/assist-home/` compares both, each with three plans in progress. "Book a sitter" is labelled "Babysitter".
- **N3 Session labels** (`goLine()` / `goPill()` in `app/app.js`): the latest status plus how long ago it moved
  ("· 2h ago", "· yesterday"), "Started 3 days ago" instead of a stale "Just started", and a plan with a deadline
  (`p.closes`) shows an amber "Closes Fri" pill. `/assist-ongoing/` seeds a sitter (2h), a playdate (2 days) and a camp
  sign-up that closes Friday.
- **N4 Playdate**: quick times are 1.5–2 hours and the end stops at 4 hours (`whenCard` mode `playdate`).
  `parentGrid()` shows the class as parent tiles, two per row, first 8 then Show all, with a search over parents and kids
  (Maya's class 20, Jake's 14, made-up names). Birthday classmates and carpool use it too. `/playdate-invite/` (Ana's side)
  gained "Can't make it" next to Confirm / Suggest another time / Reply.
- **N5 Book a sitter**: "Book Alex · $25/hr" is the booking. The estimate card with its second Book button is gone; the
  booked card shows the rate and "pay in Sprout when they're done".
- **N6 Texts from the parent's phone** (`parentSends()`): reverses L3's `sproutAsks()`. Each sitter's Messages sheet
  (`compose()`, sitter + Sprout on the To line, "1 of 3 · from your phone") opens in turn; Send opens the next. The
  booking text and "we found someone" still come from Sprout in those threads.
- **N7 Camps** (`app/flows.js`): `campListCard()` uses the shared map (`X.sv.partyResults`, exported from sitter-v3.js)
  with camp cards (price, distance, weeks open, friends). Friends per week (`CAMPS[k].pals`) show on the weeks card, in
  `campWeekSheet()` rows and in Remaining weeks open. Camp websites open `inAppBrowser()` over the chat, X returns.
  Forms open with the kid's photo + "Maya's registration". New camp accounts ask the password (`campAccount()` →
  `passwordPick()`). After Approve, `inCard()` says who's in plus one Gmail line; `openWeeksCard()` "Remaining weeks open"
  lists only open weeks, preselected, booked weeks on one line.
- **N8 After school**: programs on the same map (`afterMap()`), each card shows the friends signed up (`AFTER[].pals`).

## 19 Nov · Tony's review (MEETING-2026-11-19-tasks.md, L1–L8)

**One link for Tony: `/review/`** (`app/review.html`). Nine phones, each starting its flow from the beginning, with
one line on what changed. The desk links beside the phone (`LINKS` in `app/flows.js`) also start every flow fresh.

- **L1 Assist home** (`renderEight()` in `app/app.js`, default `/assist/`; old homes at `?home=old|a|b`). Plan something:
  Playdate, Book a sitter, Date night, Birthday (2×2). Register my kids: Sports, After school, Camps, Tutoring.
  Anything still running sits above as "Pick up where you left off" (`activePlans()`); review state `/assist-ongoing/`.
  Playdate uses the treehouse illustration (`club`), Birthday the balloons (`event`).
- **L3 Book a sitter**: `sproutAsks()` replaces the compose/Send step: after "Ask …" Sprout texts each sitter in their
  thread. The booking is "Casey's babysitting" with address and times (`recTitle`, `recLine`). Live Activity
  (`laState`): "should be there in", then "2h left with Casey" countdown + Text, last 30 min, then Pay + Text at the end.
  `payTonight()` replaces the morning-after card: stars + a note for the next family (`rateCard()`), then the Approve card,
  paid through Stripe; "Paid another way" covers cash. `/pay-todo/` opens on that lock screen.
- **L4 Share sitters**: `shareSheet()` (multi-select, a note per sitter, add someone new, saved to Priya's sitters) on
  `/sitter-class-chat/` and `/sitter-v3-share/`.
- **L5 Playdate**: one kid, "We can pick up and drop off", parent rows ("Leo's mom"), Message → `playdateDM()`.
- **L6 Birthday**: From / Until, place before cover, class chosen after Send invites. `PARTY_STYLES` = Birthday-friendly
  venues, Parks and playgrounds, Restaurants; search starts near home, "Another area" re-searches (`otherArea()`).
  Casa Verde and Rosie's are the made-up date-night places reused as family restaurants. Nine cover tiles: eight covers
  + "Make one with AI" (`coverCard()` in `flows.js`); covers 4–9 are Figma AI, scratch file `H5GZYtSTT9TOR8qc5ieuV7` 6:2–6:7.
- **One place-search UI** (Ahmad, 19 Nov): date night restaurants now use the party search's `partyResults()` (street
  map, area label, Google Maps toggle, Search Google Maps). `results()` passes `cardHtml` / `wire` for the restaurant
  cards; `restaurantPlace()` turns each made-up place's old map spot + distance into coordinates around South Austin.
  Header is compact for every search: area over a one-line title (`PARTY_STYLES[].short`), Google Maps as an icon button.
  Menu and Website on restaurant cards are icon buttons so Choose fits the narrower card.
- **L7 Date night**: the time card has Table around + Home by; the sitter stays until Home by.
- **After school** (`X.flows.afterschool`, `/after-school/`) and **Tutoring** (`X.flows.tutoring`, `/tutoring/`), so
  every Register my kids tile opens a real flow. Camps pattern: `setupCard()` (one kid + chip groups) → work row →
  `optionsCard()` (ranked, my pick on top) → form from the kid's profile with one new question → Approve → calendar.
  Tutoring books a free 15-minute call first, then lessons. Programs and tutors (`AFTER`, `TUTORS`) are made-up samples.
- **L8 Sitter profile**: name and number come from the thread (number shown, Change to edit), photo required, home ZIP
  only. Re-entry without login is a proposal on the done page (text "profile" in a thread), not decided.

## M4 · Summer camps in Tony's order (19 Nov)

Tony, 19 Nov chat: weeks first, then which kids, then camps kids from their school go to (details, pictures, pricing),
register one kid and show the weeks, prefill the form + ask what's new, sign up, tell them which emails Sprout watches,
then show the weeks still needed and repeat. `X.flows.camps` in `app/flows.js` (`/summer-camps/`, the Camps tile):
`campWeeksCard()` (the K10 weeks strip, tappable, the family trip week blocked from the calendar) → `campKidsCard()` →
`campListCard()` (ranked by classmates, Details opens `campSheet()` with photos) → `campWeekSheet()` for the kids
already picked (Ahmad, 19 Nov: no second "who's going" question; For toggles leave a kid out; only weeks each kid still
needs; full = Waitlist) → one message saying what each kid still needs → one form per kid showing every value Sprout
has as its own editable field (Weeks re-prices the sign-up) → `campForm()` (asks only what `PROFILE`
doesn't have; each kid signs each camp's waiver once; pickup is shared by the family) → `providerAccount()` (created
once per camp, then reused) → Approve → `emailCard()` (real Gmail logo, two lines: forms and packing lists become to-dos, drop-off times go on the calendar) →
`openWeeksCard()` (per week, who is covered where; tap weeks → the next round, or We're done for now).
`CAMPS` and `SUMMER` are samples; Pinecrest, Barton Swim, Muddy Hands and Lakeside Art use the K10 Figma photos.

## M3 · Carpool, one ride + weekly (19 Nov)

Ahmad, 19 Nov: keep both kinds and take them to the meeting. Live at `/carpool/`, also on the private `/review-all/`.

Tony, 19 Nov chat: "Also let's do a carpool flow today." Review page `/carpool/` (`app/carpool-review.html`), each
direction alone at `/carpool-a/` and `/carpool-b/`. Flows in `app/sitter-v3.js` next to Playdate, built only from
existing parts (Ahmad rejected a standalone mock board the same day: "follow the current design").
- **A · one ride** (`X.flows.carpoolA`): Playdate's time card (+ For, Going to, Help with) → parent rows
  (`familiesCard()`) → Sprout asks in each DM, first yes wins, the rest are told (M1) → Book a sitter's confirm card →
  ride card on both calendars → Message opens `carpoolDM()`.
- **B · weekly carpool** (`X.flows.carpoolB`): which run (`runCard()`, After school's options card, `RUNS` = SSC Saturday
  soccer, school drop-off) → families → `rotaCard()` (one field row per turn, tap a turn → bottom sheet to change the
  driver) → each family confirms in their DM → carpool card → the night before your turn: Got it / I can't drive
  (the next driver after you takes it and you take theirs).
- Families are Jake's SSC team (Priya, Aisha, Elena; the soccer card shows Priya and Aisha). Aisha says no in A.
- Art: `assets/illus/carpool.webp`, generated 19 Nov in Figma `HlWjGHq9JNgKSHXvI8RFeD` (node 2:2, gpt-image-2.5) and cut
  with the same rembg settings as the other 11 (`research/illustrations-2026-11-18/raw|cut/carpool.png`).
- Not on the Assist home yet: where it starts is still open (a 9th tile breaks the 2 × 4 grid).

## Report links

- `/book-a-sitter-saved/` opens the sitter time card. Add `?review=conversation` for Alex's request or `?review=dana` for Dana's message sheet.
- `/plan-a-date-night/?review=restaurants` opens all five recommendations using sample dinner preferences.
- `/playdate/?review=playdate`, `/birthdays/?review=birthday`, and `/create-event/?review=class-event` open the named event directly.
- `/sitter-class-chat/` and `/sitter-profile/?s=done` open the class chat and the editable sitter profile.

## K1 · Assist home as a services grid (18 Nov)

Tony asked for a custom illustration on each tile and a layout closer to Uber's services page. `renderUber()` in
`app/app.js` has two directions: `/assist/?home=a` keeps today's three groups, and `/assist/?home=b` puts Popular first
(sitter, date night, sports). Compare them with the current home at `/assist-home/`. Without `?home`, the current home shows.
The 11 illustrations were generated in Figma file `HlWjGHq9JNgKSHXvI8RFeD`. `python3 tools/cut-illustrations.py`
removes their backgrounds (rembg u2net) and writes `app/assets/illus/*.webp` plus 1024 px transparent masters in
`research/illustrations-2026-11-18/cut/`.

## Class event

Open `/create-event/` and choose **Class event**. Pick a class and time, then choose from three
venue recommendations on the birthday flow’s shared map and photo carousel. The demo uses curated
Austin and Jakarta venues. Google Maps opens on the selected place. Pick a suggested title or choose
**Write my own**. The venue photo is the default cover. Class and birthday invitations share the same
compact layout. The class card’s pencils open the title, time, location, class, and cover editors.
Saving updates that card in place before the organizer sends a simulated invitation.

Zilker Park’s [venue details](https://www.austintexas.gov/parks/locations/zilker-metropolitan-park)
come from Austin Parks and Recreation. The [Zilker Park photo](https://commons.wikimedia.org/wiki/File:Downtown_from_Zilker_Park.JPG)
is by Airainix, converted to WebP, under [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/).

## J8 · Plan a birthday

`X.flows.birthday` uses a start-only calendar and quick times, defaulting to Saturday at 2 PM.
`birthdayPlace()` ranks sourced South Austin and Jakarta venues by party preference and straight-line distance.
Choose Near home for South Austin, or use device location. If location is unavailable or fewer
than three venues are in range, choose a demo area. The Sprout map uses OpenStreetMap streets
with the date-night photo pins. Tap a pin or swipe a card to change the selected venue.
The Google Maps toggle opens the live embed focused on that venue and keeps the photo cards visible.
The first three photo cards lead to a full-screen venue detail sheet. Availability links to the
venue's own site, with facilities and food in separate sections. Show more expands the shortlist.

Local review photo sources: [Chuck E. Cheese South Austin](https://www.mapquest.com/us/texas/chuck-e-cheeses-370412268),
[The Little Gym Austin South](https://www.familyaction.com/activity/the-little-gym-of-austin-south),
[Westgate](https://boulderingproject.com/location/westgate/), [Thinkery](https://www.austintexas.org/listings/thinkery/1430/)
and [Austin Zoo](https://austinzoo.org/parties/).
Jakarta photos: [McDonald’s Lenteng Agung](https://kfmap.asia/stand-alone-retail/mcdonalds-lenteng-agung-26538),
[kidzooona AEON Mall Tanjung Barat](https://www.aeonfantasy.co.id/en/store/),
[PlayParq Kemang](https://playparq.com/kemang/) and [Habitat Park SCBD](https://habitat.id/areas/).

`birthdayInviteBody()` shares one compact card across the host confirmation, invite preview, and
copied guest link. A 5:4 cover sits above the title and the date, start time, and venue details.
Covers remain prototype assets. Open `/birthdays/` or compare the host and guest in the
[public Vercel preview](https://sprout-assist-tasks.vercel.app/sitter-date-night/#birthday).

## J7 · Google ratings on dinner choices (18 Nov)

At `/date-night-v3/`, `X.flows.dateE` ranks all five places and shows which filters they miss.
`results()` and `menuSheet()` display the sample Google ratings and review counts from `EXTRA`.

## J5 · Sitter profile (18 Nov)

`app/sitter-profile.html` uses the sitter reply page and Messages compose styles. `show()` walks Jordan
through name, photo, phone number, messaging preference, service area and optional simulated Stripe setup. Open `/sitter-profile/` from
the invitation, or use the five review phones at `/sitter-date-night/`.
On the live profile, `startEdit()` opens the existing profile or service area form with the saved fields filled in.
Save updates the profile and stores it in the current browser. Cancel discards the draft. Try `/sitter-profile/?s=done`.

## J6 · Plan a playdate (18 Nov)

Plan an event → Playdate combines day, time, children and place. Select one or both children, then
choose one classmate from their classes. `X.flows.playdate`
previews the Sprout DM and records the accepted time in `CLOCK`. Try `/playdate/`, `/playdate-new-time/`
or `/playdate-cant/`. The clock shows the shared reminder at 30 minutes before and the activity until
15 minutes after the end. `playdateInbox()` at `/playdate-invite/` adapts the class chat header for Tony’s
DM and lets Ana confirm, suggest a time, or reply.

## J4 · Share a sitter from class chat (18 Nov)

`/sitter-class-chat/` shows Priya’s view of Tony’s request. `classChat()` and `classMessage()` use the
CHAT-10 chrome with prototype messages. `shareClassSitter()` shares Taylor or opens the same
`sitterFields()` form as manual Add a sitter. The builder crops the two chrome images from the supplied PNG using Pillow.

## J2 · Sprout in sitter texts (18 Nov)

`compose()` and `sendEach()` show one thread per sitter. `sendAndBook()` simulates replies, lets you
use `markSheet()` for an outside reply, and simulates Sprout texting the booking and follow-up in those
threads. Try `/sitter-v3/`, `/sitter-v3-none/` or the sitter step on `/date-night-v3/`.

M1 (Tony, 19 Nov chat): once a sitter is booked, Sprout texts every other sitter it asked, except those who
already said no, that the family found someone. The parent is not asked first; a status row and the message
preview tell them it was sent. Tony: "we don't want to create confusion for the sitter".

## J3 · Text Dana the plan (18 Nov)

`sendAndBook()` and the We're covered branch of `X.flows.dateE` open `compose()` with the booked
plan addressed to Dana. See `/sitter-v3/` after booking a sitter and `/date-night-v3/` after booking the table.

## J1 · Sitter time card (18 Nov)

Ahmad picked B. `whenCard()` uses From / Until chips for Book a sitter and the shared playdate time control.
The first free day is preselected. Other time opens `timeWheel()` for starts outside the preset range.
Try `/sitter-v3/` or the B example on `/sitter-date-night/`.

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
| Edit a field on a card | field pencil and its editor | `editField()` in `app/app.js` (19 Nov): choices (`f.opts`, `f.multi`) as pick rows, otherwise a text box; Save updates the card in place, tags it Edited and fires `edited` so the flow can react. `f.ro` = no pencil. Never the "Editing is not part of this demo" toast |
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
| Summer camps | Tony's order (19 Nov chat, M4) on K10 v3 `15524:43294` parts | Weeks strip P·15 (now step 1) → which kids → camp rows with classmates + details sheet D·1 → one kid → week sheet P·4 → form P·5–P·8 + waiver X·3 → account A·1–A·3 → Approve → emails Sprout watches → open weeks → loop. The Friday sign-up-day hold (P·10–P·12) is gone |
| Ask my sitters / class families | A8 `16151:356321` (Ahmad chose A with B fallback, 14 Nov) | Rebuilt with SSC parts, not A8's full-width rows; confirm card = SSC approval card without payment |
| Plan an event | K4 row F `14892:33651` | Birthday F·1–F·11 (J8 tap-through, covers, event card, invite link, class headcount), playdate F·12–F·16 |
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
