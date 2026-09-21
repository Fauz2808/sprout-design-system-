# QA report

Tested on 14 September 2026 at `http://127.0.0.1:8791/`.

## Browser checks

- Desktop visual review at 1280 by 900px confirmed the side-by-side hero, full product hierarchy, and the unchanged sections below it.
- Mobile visual review at 390px covered hero, family day, product modules, family profile, and navigation.
- The page width matched the viewport at 1280px and 390px.
- At 1280px, the complete hero product frame sits within the rounded hero surface. The Daily Brief and Birthday Invitation cards overlap only 43px and 24px of its outer bounding box horizontally.
- At 390px, the hero switches back to a centered vertical composition and keeps the product preview below the CTA.
- The hero loads the supplied Sprout AI Daily Brief export at its native 393 by 852px dimensions and preserves its aspect ratio on desktop and mobile.
- Both supplied floating cards load at their native 722 by 516px and 570 by 698px dimensions, preserve their aspect ratios, and remain visible inside the hero at 1280px and 390px.
- Hero, Daily Brief, Events, Chat, Memory, and final download phone mockups all resolve to 0-degree rotation at 1280px and 390px. Centered devices retain only their required horizontal translation.
- Hero and final download use the same local `sprout-ai-daily-brief.png` source with matching intrinsic dimensions and aspect ratio.
- Community scene contains no product UI children and retains only its responsive mesh gradient container.
- Memory background has no gradient overlay; its photograph uses a uniform blur, saturation, brightness, and scale treatment behind the event mockup.
- Navbar and hero download buttons contain text only, use Sprout green, and retain visible hover, active, and focus states.
- Computed section geometry found no overlapping sections.
- Family-day tabs update copy, list content, image source, alternative text, and selected state.
- Left, Right, Home, and End keyboard behavior were exercised successfully.
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
