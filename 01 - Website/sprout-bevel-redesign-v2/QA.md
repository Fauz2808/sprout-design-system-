# QA report

Tested on 14 September 2026 at `http://127.0.0.1:8790/`.

## Browser checks

- Desktop visual review at 1280px covered hero, family day, community, feature modules, memory, family profile, privacy, and download.
- Mobile visual review at 390px covered hero, family day, product modules, family profile, and navigation.
- The page width matched the viewport at 1280px and 390px.
- Computed section geometry found no overlapping sections.
- Family-day tabs update copy, list content, image source, alternative text, and selected state.
- ArrowRight and Home keyboard behavior were exercised successfully. Left, Right, Home, and End use the same roving focus handler.
- The profile preview updates its visible state and live announcement without submitting data.
- The family profile disclosure opens with a native `details` element.
- Mobile navigation moves focus into the menu, sets main/footer inert, closes with Escape, and restores focus.
- Browser console returned no warnings or errors.
- Reduced-motion CSS removes entry transitions and smooth scrolling.

## Static checks

- One `h1`.
- No duplicate IDs.
- No unresolved local hash links.
- No missing local images, scripts, or stylesheets.
- Every image has an `alt` attribute.
- JavaScript passes `node --check`.
- Copy scan contains no em dash and none of the selected anti-slop filler terms.

## Contrast samples

Color contrast was checked with the script supplied by the anti-slop human skill.

| Foreground | Background | Ratio | Normal text |
|---|---|---:|---|
| `#171b18` | `#f7f8f6` | 16.34:1 | Pass |
| `#ffffff` | `#171b18` | 17.41:1 | Pass |
| `#171b18` | `#dcecff` | 14.49:1 | Pass |
| `#171b18` | `#c5efcf` | 13.78:1 | Pass |
| `#ffffff` | `#103527` | 13.46:1 | Pass |
| `#626b65` | `#f7f8f6` | 5.17:1 | Pass |
| `#626b65` | `#dcecff` | 4.59:1 | Pass |
| `#bfd0c7` | `#103527` | 8.37:1 | Pass |
| `#9e2e22` | `#f7f8f6` | 6.87:1 | Pass |

## Limits

- This is a prototype review, not a full WCAG 2.2 assistive-technology audit.
- External store, legal, and mail links were not activated.
- Product behavior, verification, and moderation claims were not tested against a live account or backend.
- The concept family photograph is not production social proof.
