# public-share — build

Three self-contained prototypes of the **public share page** (an event or a club
opened from a link in Safari, not in the app). Each file lays out 4 panels
horizontally: event/club x cold/has-app.

- `../share-a-invitation.html` — Direction A, Invitation Card
- `../share-b-factcard.html`   — Direction B, Fact-First Card Stack
- `../share-c-decision.html`   — Direction C, Smart-Link Decision Page

## Regenerate

```bash
cd "08 - Generated Screens/Events/public-share/_build"
node dirA.mjs && node dirB.mjs && node dirC.mjs
```

The three directions share one iOS-Safari chrome and one token block, so a fix to
the frame, the status bar or a token lands in all twelve panels at once:

- `shared.css` — tokens (from `sprout-screen/assets/tokens.css`) + Safari chrome + panel shell
- `lib.mjs`    — `chrome()`, `panel()`, `page()`, and `I()` for Phosphor icons
- `icons.json` — real regular-weight Phosphor paths, extracted from
  `04 - Design System & Storybook/node_modules/phosphor-react-native/src/defs/`.
  Never hand-draw an icon; add the name to the extractor and re-pull.

## Screenshot

```bash
node shot.mjs "../share-a-invitation.html" /tmp/a.png
```

Uses `puppeteer-core` from the design-system `node_modules` plus the system Chrome.

## Note

The outputs are generated. Small copy tweaks can be made in the HTML directly, but
anything structural should be changed in `dir[ABC].mjs` and rebuilt, or the next
rebuild will drop it.
