# Sprout Assist prototype · rules for Codex

Read `README.md` in this folder first. It lists every flow, route, part and the decision behind it.

## One engine

- `app/app.js` is the engine: the plan object (`p.say`, `p.me`, `p.chips`, `p.card`, `p.block`, `p.work`, `p.note`,
  `p.set`) plus `bsheet`, `toast`, `X.notify`. `later()` (a reply or push that comes back after a wait) is in
  `app/flows.js`, shared as `X.dn.later`. Flows live in `app/flows.js` and `app/sitter-v3.js`. Date night map parts:
  `app/date-night-map.js` (`X.dnm`).
- The approved SSC Kids demo (`../ssc-kids-signup-demo/prototype/index.html`) is the design authority. `build.py` copies
  its CSS in verbatim. Never edit that demo from here and never copy its CSS by hand.
- Do not add another script layer, framework, iframe or "v4" file on top. Change the flow function the task names.
- The README table "The rules every flow follows" is binding: where chips sit, one question per card, one full-width
  green button that says what happens, status rows for work, the Approve card for money.

## Family state comes from the route

A review state (saved sitters, none saved, the other parent's view) is a route in `build.py` `ROUTES` plus a branch on
`route` in the flow file. Never add a toggle, switcher or debug button inside the phone.

## Gotchas

- Never name a CSS class `ph` (Phosphor icon class) or `tag` (taken by the SSC CSS).
- Avatars: `face()` in `sitter-v3.js`, always round and `background-size:cover`.
- The demo clock panel beside the phone is review scaffolding, labelled as such. Do not move its controls into the app.

## Build and check

```bash
cd "/Users/ahmadfauzanazhim/Sprout/08 - Generated Screens/AI Assist/task-first-assist" && python3 build.py
```

```bash
cd "/Users/ahmadfauzanazhim/Sprout/08 - Generated Screens/AI Assist/task-first-assist/site" && python3 -m http.server 4332
```

Open `http://localhost:4332/<route>/` at 393 x 852. A new route must be added to `ROUTES` in `build.py`, or it 404s.
Do not deploy. Ahmad deploys after review (`vercel deploy --prod --yes` from `site/`).
