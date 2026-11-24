# Handoff to Codex · Sprout website v3 (24 Nov 2026)

You are continuing work on `home-v3.html`, the next version of the joinsprout.co home page. Ahmad (the designer) will
send you feedback one item at a time. This file tells you what the page is, how it is built, what is already decided,
and how to make a change without breaking it. Read it fully before the first change. Root `~/Sprout/AGENTS.md` also
applies and wins if anything here conflicts with it.

## 1 · Where things are

All paths are relative to `~/Sprout/01 - Website/sprout-reach-scene-iteration/` (quote them; the path has spaces).

| File | What it is |
|---|---|
| `home-v3.html` (191 lines) | The page. Six sections + header + footer + the "Get Sprout" QR dialog. |
| `home-v3.css` (312 lines) | All v3 styles. Loaded after `home-v2.css` (base: tokens, top bar, `.phone`, dialog) and `daily-brief.css` (the app's brief parts, `.db2-*`). |
| `home-v3.js` (220 lines) | Builds the two coded phones, runs the Problem→Brief scroll, the pop-ins, the live orb, the Join behaviour. |
| `thinking-orb.js` | The Assist orb renderer. Shared with the Assist prototype. Do not edit. |
| `home-v2.css`, `daily-brief.css` | Shared with other pages. Do not edit; override in `home-v3.css`. |
| `review/home-v3-shots.mjs` | The page check. Screenshots every stage at 1440x900 and 390x844 and fails on overflow, page errors, hidden brief rows, or a brief card under the tab bar. |
| `assets/` | All images. Reuse only what is here. |
| `handoff-codex-2026-11-24/refs/` | Reference PNGs: `current/` = how the page looks now, `figma/` = the Figma frames it follows, plus Tony's brief PDF. |

**Do not touch:** `home-v2.html` / `home-v2.js` (still what the live site exports from), `index.html`, anything in
`review/` except `home-v3-shots.mjs`, `../sprout-website/` (the live site repo, Mohit deploys it).

## 2 · The page, section by section (source of truth: Tony's brief, `refs/tony-copy-design-brief-2026-11-20.pdf`)

**All copy is final and word for word from Tony's brief. Never rewrite headlines, subheads or body copy.**

| # | Section | HTML | JS | CSS | What it does |
|---|---|---|---|---|---|
| 1 | Hero `#home` | 57 | 210 (photo drift) | 5-121 | Village photo in an inset rounded frame, copy left, `.btn-hand` Join Sprout, store badges. No phone (Ahmad removed it 21 Nov). |
| 2+3 | Problem → Daily brief `#problem` (anchor `#brief`) | 82 | 32-137 | 125-175 | One pinned scroll (460vh). A lock screen buried in 10 notifications (`NOTES` line 43, positions `POSE` line 56, iOS-style icons `ICON` line 37). On scroll each notification flies into its row of the brief (`drawStory` line 105). The copy swaps in place (`--swap`). |
| 4 | Assist `#assist` | 104 | 170 (orb), 178 (pop-in) | 176-212 | The Assist home rebuilt at page size: header with the live orb, "What can I take off your plate?", only Playdate / Babysitter / Carpool tiles (clay art pops in, then floats). |
| 5 | Community `#community` | 133 | 139-169 | 213-252 | Picnic photo + a coded Chat phone (Figma Prod 12758:106388): one row of groups that scrolls sideways, then Direct Messages (mostly moms). |
| 6 | Close `#join` | 148 | 178 (faces pop-in) | 253-273 | The hero's frame again, centred: headline, parent faces, "See who's already here.", big Join Sprout. |
| - | Tab bar in both phones | - | `nav()` line 27 | 299-312 | Figma Prod "Navigation Bar (Docked)" 16121:176380 (Tony approved 14 Nov). See `refs/figma/navbar-docked-16121-176380.png`. |

The two phones are coded at the app's real size (393 x 852) inside a `.db2` box and scaled to fit with `--k`
(`fit()` near the top of `home-v3.js`). Write phone UI in app pixels; never size it in page pixels.

## 3 · Decided. Do not reopen these

- Six sections only. The old class-chat / directory / FAQ / Assist-teaser sections were cut on purpose (in git history).
- Launch scope: never show Birthday, Date night, the "Register my kids" row (Sports, After school, Camps, Tutoring),
  "Saved details / Accounts and cards", or any events or discovery feed. Not in the Assist section, not in any phone.
- The Problem notifications use made-up senders and iOS-style app icons (Mail, Messages, a team app) drawn in code,
  not Apple artwork and no app names.
- The Assist orb is the live `thinking-orb.js` orb, state `working`, 40 px, same as the Assist prototype.
- Chat circles, in order: First Grade (Kiker logo), Ms. Taylor's Class (teacher photo `assets/v2/cast-teacher-taylor.webp`),
  U8 Soccer (`club-ssc`), Summer Camp (`club-creator`), then Kindergarten peeking at the edge.
- Direct Messages: 5 moms + 2 dads, made-up names, everyday school messages.
- Join Sprout opens the QR dialog on a computer and the right store on a phone (`data-join`, JS line 188).
- No hero phone (Ahmad, 21 Nov).

## 4 · Open questions. Ahmad decides these; do not change them on your own

1. Tony's brief says Join Sprout should link to joinsprout.co, but this page will BE joinsprout.co. It currently goes
   to the stores. Waiting on Tony.
2. The Kiker, SSC Kids and Creator Camp logos are real organisations; Tony's brief asks for no real school or brand
   names. They may need generic versions before launch.
3. When v3 goes live, `review/export-site.py` must switch from home-v2 to home-v3. Only after Tony approves.

## 5 · How to make a change (every feedback item)

Write each item down in this format before you edit, in a new section at the bottom of this file:

```
### F<n> · <one line, Ahmad's words>
Change:  <exact files + line numbers you will edit, nothing else>
Reuse:   <existing classes, assets, helpers you will use>
Do not:  <what stays as it is>
Check:   <which sections/stages and sizes you will look at>
Status:  DONE / DONE_WITH_CONCERNS / BLOCKED / NEEDS_CONTEXT, plus what you changed
```

Rules for the change itself:
- Change only what the item names. No new sections, cards, buttons, copy or animation he did not ask for.
- Reuse what exists: classes in `home-v3.css`, `.db2-*` parts in `daily-brief.css`, images in `assets/`. If the part
  or image you need does not exist, stop, write it under "Open questions" in the item, mark it NEEDS_CONTEXT.
- Brand only: cream `#f4f1ea`, green `#186338`, ink `#1e3e2b`, subtle `#7d715e`, Playfair Display for titles and
  buttons, Inter for body, Phosphor icons for UI. No new colors, fonts, shadows or easing.
- Made-up people only (no real parent names, emails, numbers). No em dashes, no emojis in page copy.
- Every phone change must still fit above the tab bar (the brief's last card ends above y 734 in app pixels, where
  the raised clover starts).
- When you change `home-v3.css` or `home-v3.js`, bump the `?v=` on its `<link>` / `<script>` in `home-v3.html`
  (format `20261124-7`, `-8`, ...). Browsers and Vercel cache hard.
- A class named `.tile` already exists globally in `home-v2.css` (hidden by default). Never reuse that name.

## 6 · Run and check (required before you say DONE)

```bash
cd ~/Sprout && npx serve -p 4320 "01 - Website/sprout-reach-scene-iteration"
```
Page: http://localhost:4320/home-v3.html (keep the `.html`; there are no clean URLs).

```bash
cd ~/Sprout/"01 - Website/sprout-reach-scene-iteration" && node review/home-v3-shots.mjs http://localhost:4320/home-v3.html
```
It must print `ok`. Then open the PNGs it writes to `review/shots/home-v3/` (the files named `desktop-0X-*` /
`phone-0X-*` with the section names in section 2) and compare them with `handoff-codex-2026-11-24/refs/current/`.
Anything you did not mean to change must look the same. Also scroll the whole page once by hand at desktop width
and at 390 wide, and check the console has zero errors.

## 7 · Do not

- Commit, push, or deploy (`vercel`). Ahmad reviews and deploys. The uncommitted v3 work in this folder exists nowhere
  else: never `git checkout`, `git clean`, `git reset` or delete files you did not create.
- Edit Figma, `home-v2.*`, `thinking-orb.js`, `daily-brief.css`, `home-v2.css`, or `../sprout-website/`.
- Rename, move or split files. Do not add new JS or CSS files.

## 8 · Report back to Ahmad, per item

Status, files and line numbers changed, parts reused, what you checked (and that the shot script printed `ok`),
anything unsure. Short and plain. End with the next action.

---

## Feedback items

(Add F1, F2, ... here as Ahmad sends them.)
