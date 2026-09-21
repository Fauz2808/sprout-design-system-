# Preview verification

Date: 2026-09-12. Scope: this local HTML redesign, not the production app.

## Result

Independent finish reviewer disposition: **SHIP the local review preview**. The reviewer inspected 9 desktop and 11 mobile overlapping viewport images and found no remaining material visual defects in those captures. The reviewer scored the mobile header menu fix and screenshot evidence issue resolved.

## Browser checks

| Check | Evidence/result |
|---|---|
| Page width | No document horizontal overflow at 360, 390, 768, 1280, and 1440 CSS pixels. |
| Visual review | 1440×1000 desktop and 390×844 mobile sequences cover the full page. 1280×720 actual preview viewport also inspected. |
| Assets | All page images loaded with nonzero natural widths after visiting relevant panels/sections. |
| Feature tabs | Click switching and ArrowRight keyboard switching update selected state and visible panel. Home/End/ArrowLeft behavior implemented in script. |
| Daily Brief | Opening Birthdays closes Weather; other details remain closed. |
| Registration | Try one tap changes to preview success; Try again restores initial content. No network/backend registration is implemented. |
| Mobile menu | Opens, background receives inert, Escape closes and returns focus to menu button. |
| Header links with menu open | Both logo and Get Sprout close the menu, clear body scroll lock, remove main/footer inert attributes, and reach correct fragment. |
| Console | No warning/error entries during inspected preview session. |
| Static integrity | No missing local assets, broken fragment links, or duplicate IDs. `node --check script.js` passed. |
| Reduced motion | Stylesheet has a prefers-reduced-motion rule disabling transitions/animations and smooth scroll. OS preference was not independently toggled in browser. |

## Sampled text contrast

Calculated from the rendered foreground/background colors, not estimated visually.

| Pair | Ratio |
|---|---:|
| Hero body / page | 5.88:1 |
| Hero heading / page | 11.06:1 |
| Primary button text / green | 7.29:1 |
| Daily Brief body / forest | 8.59:1 |
| Daily Brief emphasized heading / forest | 8.53:1 |
| Demo notice / white | 6.33:1 |
| Form comparison note / pale surface | 5.98:1 |

These are sampled pairs, not a complete accessibility conformance audit.

## Evidence

- `review/desktop-sequence/`: 9 sequential screenshots with 150px overlap.
- `review/mobile-sequence/`: 11 sequential screenshots with approximately 126px overlap.
- `review/desktop-hero.png`, `review/mobile-hero.png`, `review/user-1280.png`: first viewport captures.
- Earlier full-page stitched screenshots were invalid and removed; they are not review evidence.

## Limits and production decisions

- Figma read timed out. The supplied node was not inspected; latest design parity remains unverified.
- Google Fonts is external. Local images and scripts are bundled, but intended typography needs a network connection or browser cache.
- Impeccable detector ran once, returned `[]` using a degraded regex fallback because parser dependencies were unavailable. This is not a complete parser-based audit.
- Existing production copy has documented trust/privacy inconsistencies, a child-safety placeholder contact, and broad one-tap registration wording. See CONTENT-CHANGES.md before publication.
- No production deployment, account access, Figma edit, registration submission, commit, or push was performed.
